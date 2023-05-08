class Api::V1::DocumentsController < ApplicationController
  def index
    @user = current_user
    @documents = @user.documents
    render json: documents_json, status: 200
  end

  def show
    @user = current_user
    @document = @user.documents.find(params[:id])
    chunk_count = @document.chunks.count
    render json: document_json.merge(chunkCount: chunk_count), status: 200
  end

  def create
    @user = current_user
    @document = @user.documents.create(document_params)
    if @document.save
      render json: document_json, status: 201
    else
      render json: @document.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @user = current_user
    @document = @user.documents.find(params[:id])
    @document.destroy
    render json: { message: "Document deleted" }, status: 200
  end

  def chunk
    @user = current_user
    @document = @user.documents.find(params[:id])

    @document.chunks.destroy_all

    @document.file.open do |file|
      reader = PDF::Reader.new(file)
      if @document.end > reader.page_count
        render json: { error: "Page number is greater than the number of pages in the document" }, status: 400
      else
        pages = reader.pages[@document.start..@document.end]
        paragraphs = []
        pages.each do |page|
          paragraphs.concat(page.text.gsub(/\.(\n)/, ".[SPLIT]").split("[SPLIT]"))
        end
        chunks = []
        hanging = ""
        paragraphs.each do |paragraph|
          paragraph = paragraph.strip
          if hanging.length > 0
            paragraph = hanging + " " + paragraph
          end
          if is_valid_chunk?(paragraph)
            chunk = cleanup(paragraph)
            if chunk.split(" ").length > 150 # longer than 150 words
              chunks.concat(split_chunk(chunk))
            else
              chunks.push(chunk)
            end
            hanging = ""
          else
            hanging = paragraph
          end
        end
        chunks.push(hanging) if hanging.length > 0
        total_chunks = chunks.length
        if total_chunks === 0
          render json: { error: "No valid chunks found" }, status: 400
        else
          avg_chunk_length = chunks.map { |chunk| chunk.split(" ").length }.sum / total_chunks

          chunks.each do |chunk|
            @document.chunks.create(content: chunk)
          end

          puts "Total chunks: #{total_chunks}"
          puts "Average chunk length: #{avg_chunk_length}"

          render json: { total_chunks: total_chunks, avg_chunk_length: avg_chunk_length }, status: 200
        end
      end
    end
  end

  def embed
    @user = current_user
    @document = @user.documents.find(params[:id])
    @document.chunks.each do |chunk|
      if chunk.embedding.length == 0
        ada = get_embedding(chunk.content)
        if ada == nil
          puts "embedding failed"
          render json: { error: "embedding failed" }, status: 500
          return
        end
        total_tokens = ada["usage"]["total_tokens"]
        cost = total_tokens * 0.0004
        puts "cost: #{cost}"
        embedding = ada["data"][0]["embedding"]
        puts embedding.length
        puts "success"
        chunk.update(embedding: embedding)
      end
    end
    puts "checking for completion"
    embedded = !@document.chunks.any? { |chunk| chunk.embedding.length == 0 }
    @document.update(embedded: embedded)
    render json: { message: "embedding complete" }, status: 200
  end

  def decompose
    @user = current_user
    @document = @user.documents.find(params[:id])

    @document.mean.purge if @document.mean.attached?
    @document.transformer.purge if @document.transformer.attached?
    @document.singular_values.purge if @document.singular_values.attached?

    variance = 90
    if @document.variance != nil
      variance = @document.variance
    else
      @document.update(variance: variance)
    end

    chunk_count = @document.chunks.count

    if @document.chunks.any? { |chunk| chunk.embedding.length == 0 }
      render json: { error: "embedding incomplete" }, status: 500
      return
    end

    # doesn't matter which one, just looking for variation
    sample_chunk = @document.chunks.first
    dimensions = sample_chunk.embedding.length

    if @document.chunks.any? { |chunk| chunk.embedding.length != dimensions }
      render json: { error: "embedding dimensions do not match" }, status: 500
      return
    end

    matrix = Numo::DFloat.zeros(chunk_count, dimensions)

    @document.chunks.each_with_index do |chunk, i|
      matrix[i, true] = Numo::DFloat.cast(chunk.embedding)
    end

    # svd
    s, u, vt = Numo::Linalg.svd(matrix)
    goal = s.sum * variance.to_f / 100
    sum = 0
    n_components = 0
    s.each_with_index do |value, i|
      sum += value
      if goal - sum < 0.0001 # 0.0001 is an arbitrary tolerance
        n_components = i
        break
      end
    end

    puts "n_components: #{n_components}"

    # pca dimensionality reduction
    # (requires openBLAS)
    decomposer = Rumale::Decomposition::PCA.new(n_components: n_components, solver: 'evd')
    transformer = decomposer.fit(matrix)
    proj = transformer.transform(matrix)
    @document.mean.attach(io: StringIO.new(transformer.mean.to_a.to_json), filename: "mean.json")
    @document.transformer.attach(io: StringIO.new(transformer.components.to_a.to_json), filename: "transformer.json")
    @document.singular_values.attach(io: StringIO.new(s.to_a.to_json), filename: "singular_values.json")

    @document.update(components: n_components, variance: variance)

    puts "top #{n_components} components (out of #{s.shape[0]}) explain #{variance}% of the variance"

    render json: document_json, status: 200
  end

  private

  def document_params
    params.require(:document).permit(:title, :description, :author, :file, :start, :end)
  end

  def documents_json
    @documents.map { |document| document.attributes.except("file") }
  end

  def document_json
    @document.attributes.except('file')
  end

  def is_valid_chunk?(text)
    if !text.ends_with?(".") && !text.ends_with?("?") && !text.ends_with?("!")
      return false
    else
      return text.split(" ").length > 30
    end
  end

  def cleanup(text)
    text = text.gsub(/\n/, " ")
    text = text.gsub(/\s+/, " ")
    text = text.gsub(/\s\./, ".")
    text = text.gsub(/\s\?/, "?")
    text = text.gsub(/\s\!/, "!")
    text = text.gsub(/\s\,/, ",")
    return text
  end

  def split_chunk(text)
    sentences = text.split(".")
    half = sentences.length / 2
    return [sentences[0..half].join("."), sentences[half..sentences.length].join(".")]
  end

  def get_embedding(text)
    url = URI("https://api.openai.com/v1/embeddings")
    puts "calling openai ada"
    headers = {
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{ENV['OPENAI_API_KEY']}",
    }
    data = {
      "input" => text,
      "model" => "text-embedding-ada-002",
      # "user" => current_user.email,
    }
    response = Net::HTTP.post(url, data.to_json, headers)
    if response.kind_of? Net::HTTPSuccess
      parsed = JSON.parse(response.body)
      puts parsed
      return parsed
    else
      puts response.body
      return nil
    end
  end
end
