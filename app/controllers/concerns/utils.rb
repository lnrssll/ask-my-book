module Utils
  private

  # a list of documents without attachments
  def documents_json
    @documents.map { |document| document.attributes.except("file", "mean", "transformer", "singular_values") }
  end

  # a single document without attachments
  def document_json
    @document.attributes.except('file', 'mean', 'transformer', 'singular_values')
  end

  def doc_with_questions
    document_json.merge(questions: @questions)
  end

  def get_embeddings(list)
    embeddings = []
    list.each do |text|
        ada = get_embedding(text)
        if ada == nil
          puts "embedding failed"
          render json: { error: "embedding failed" }, status: 500
          return
        end
        embedding = ada["data"][0]["embedding"]
        embeddings.push(embedding)
    end
    embeddings
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

  def get_matrix(with = nil)
    puts "downloading NArrays"
    json_mean = @document.mean.download
    mean = JSON.parse(json_mean)
    mean = Numo::DFloat.cast(mean)
    json_transformer = @document.transformer.download
    transformer = JSON.parse(json_transformer)
    transformer = Numo::DFloat.cast(transformer)

    chunk_count = @document.chunks.count
    if @document.chunks.any? { |chunk| chunk.embedding.length == 0 }
      render json: { error: "embedding incomplete" }, status: 500
      return
    end

    sample_chunk = @document.chunks.first
    dimensions = sample_chunk.embedding.length
    if @document.chunks.any? { |chunk| chunk.embedding.length != dimensions }
      render json: { error: "embedding dimensions do not match" }, status: 500
      return
    end

    offset = 0
    if !with.nil?
      offset = with.count
      chunk_count += offset
      if with.any? { |embedding| embedding.length != dimensions }
        render json: { error: "embedding dimensions do not match" }, status: 500
        return
      end
    end

    matrix = Numo::DFloat.zeros(chunk_count, dimensions)

    if !with.nil?
      with.each_with_index do |embedding, i|
        matrix[i, true] = Numo::DFloat.cast(embedding)
      end
    end

    @document.chunks.each_with_index do |chunk, i|
      matrix[i + offset, true] = Numo::DFloat.cast(chunk.embedding)
    end

    proj = (matrix - mean).dot(transformer.transpose)
    return proj
  end

  def dequestioner(kill_dims = 10)
    weights = @document.question_weights
    question_dims = weights.abs.argsort.reverse[0..kill_dims - 1]
  end

end

