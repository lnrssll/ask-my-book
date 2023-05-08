class Api::V1::DocumentsController < ApplicationController
  include Utils

  def index
    @user = current_user
    @documents = @user.documents
    render json: documents_json, status: 200
  end

  def show
    @user = current_user
    @document = @user.documents.find(params[:id])
    chunk_count = @document.chunks.count
    @questions = @document.questions
    render json: doc_with_questions.merge(chunkCount: chunk_count), status: 200
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

  # only manual update is to ready up
  def update
    @user = current_user
    @document = @user.documents.find(params[:id])
    if @document.ready?
      if @document.trees.present?
        @document.update(ready: true)
        render json: { message: "Document ready" }, status: 200
      else
        render json: { message: "Document not ready to go live" }, status: 200
      end
    else
      @document.update(ready: false)
      render json: { message: "Document not ready" }, status: 200
    end
  end

  def chunk
    @user = current_user
    @document = @user.documents.find(params[:id])

    @document.chunks.destroy_all

    # all downstream processes must be recomputed
    @document.mean.purge if @document.mean.attached?
    @document.transformer.purge if @document.transformer.attached?
    @document.singular_values.purge if @document.singular_values.attached?
    @document.update(embedded: false, variance: nil, components: nil, trees: nil, ready: false)

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

    # all downstream processes must be recomputed
    @document.update(trees: nil, ready: false)

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

  def build
    @user = current_user
    @document = @user.documents.find(params[:id])
    filename = @document.id.to_s + ".ann"

    path = Rails.root.join("storage", "index", filename)
    dimensions = @document.components

    trees = 50
    if @document.trees != nil
      trees = @document.trees
    else
      @document.update(trees: trees)
    end

    puts "downloading NArrays"
    json_mean = @document.mean.download
    mean = JSON.parse(json_mean)
    mean = Numo::DFloat.cast(mean)
    json_transformer = @document.transformer.download
    transformer = JSON.parse(json_transformer)
    transformer = Numo::DFloat.cast(transformer)

    puts "building index"
    annoy = Annoy::AnnoyIndex.new(n_features: dimensions, metric: 'angular')
    @document.chunks.each do |chunk|
      embedding = chunk.embedding
      embedding = Numo::DFloat.cast(embedding)
      embedding = (embedding - mean).dot(transformer.transpose)
      annoy.add_item(chunk.id, embedding.to_a)
    end
    annoy.build(10)

    puts "saving index"
    annoy.save(path.to_s)
    @document.index.purge if @document.index.attached?
    @document.index.attach(io: File.open(path.to_s), filename: filename)

    render json: { message: "Annoy index saved" }, status: 200
  end

  def classify
    @user = current_user
    @document = @user.documents.find(params[:id])
    @questions = @document.questions
    question_embeddings = @questions.map { |question| question.embedding }
    x = get_matrix(question_embeddings)
    y = Numo::DFloat.zeros(x.shape[0])
    y[0..question_embeddings.length - 1] = 1
    if y.sum != question_embeddings.length
      render json: { error: "y.sum != question_embeddings.length" }, status: 500
      return
    end
    estimator = Rumale::LinearModel::SVC.new(reg_param: 0.1, tol: 1e-6)
    estimator.fit(x, y)
    weights = estimator.weight_vec
    @document.update(question_weights: weights.to_a)
    # TODO maybe add classification status to questions too
    render json: { weights: weights.to_a }, status: 200
  end

  # purely for testing purposes
  def search
    start_time = Time.now
    @user = current_user
    @document = @user.documents.find(params[:id])

    chunks_ids = @document.chunks.map { |chunk| chunk.id }
    min_chunk_id = chunks_ids.min
    item = chunks_ids.sample

    filename = @document.id.to_s + ".ann"
    path = Rails.root.join("storage", "index", filename)

    neighbors = 10

    dimensions = @document.components

    annoy = Annoy::AnnoyIndex.new(n_features: dimensions, metric: 'angular')
    annoy.load(path.to_s)

    result = annoy.get_nns_by_item(item, neighbors)
    puts result
    labels = result.map { |id| @document.chunks.find(id).content }
    result = result.map { |id| id - min_chunk_id }
    end_time = Time.now
    elapsed = end_time - start_time
    elapsed = elapsed * 1000  # convert to milliseconds
    puts "search time: #{elapsed}"
    render json: { result: result, labels: labels, time: elapsed.to_i }, status: 200
  end

  private

  def document_params
    params.require(:document).permit(:title, :description, :author, :file, :start, :end)
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

end
