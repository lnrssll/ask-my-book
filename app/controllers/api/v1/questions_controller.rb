class Api::V1::QuestionsController < ApplicationController
  include Utils

  def index
    @user = current_user
    @document = @user.documents.find(params[:id])
    @questions = @document.questions
    render json: doc_with_questions, status: 200
  end

  def create
    @user = current_user
    @document = @user.documents.find(params[:id])
    @question = @document.questions.create(question_params)
    render json: @question, status: 200
  end

  def destroy_all
    @user = current_user
    @document = @user.documents.find(params[:id])
    @questions = @document.questions
    @questions.destroy_all
    render json: doc_with_questions, status: 200
  end

  def destroy
    @user = current_user
    @document = @user.documents.find(params[:id])
    @question = @document.questions.find(params[:question_id])
    @question.destroy
    render json: doc_with_questions, status: 200
  end

  def answer
    @document = Document.find(params[:id])

    # get a random question
    @question = @document.questions.sample
    puts @question.text
    puts @question.answer
    # need to add 11labs api call here
    # and add ask count
    render json: @question, status: 200
  end

  def ask
    @document = Document.find(params[:id])
    text = params[:question]

    @question = @document.questions.find_by(text: text)
    if !@question.nil?
      sleep 2
      render json: @question, status: 200
      return
    end

    start_time = Time.now

    ada = get_embedding(text)
    if ada.nil?
      puts "embedding failed"
      render json: { error: "embedding failed" }, status: 500
      return
    end

    embedding = ada["data"][0]["embedding"]
    embedding = Numo::DFloat.cast(embedding)

    puts "embedding time: #{Time.now - start_time}"
    lap = Time.now
    puts "getting projection"

    # project
    mean = Rails.cache.fetch(@document.id.to_s + "_mean", expires_in: 1.day) do
      puts "downloading mean"
      json_mean = @document.mean.download
      parsed = JSON.parse(json_mean)
      Numo::DFloat.cast(parsed)
    end
    transformer = Rails.cache.fetch(@document.id.to_s + "_transformer", expires_in: 1.day) do
      puts "downloading transformer"
      json_transformer = @document.transformer.download
      parsed = JSON.parse(json_transformer)
      Numo::DFloat.cast(parsed)
    end

    dequestioner

    puts "loading time: #{Time.now - lap}"

    projected = (embedding - mean).dot(transformer.transpose)

    if @document.question_weights.length > 0
      puts "getting weights"
      projected[dequestioner] = 0
    end

    puts "projection time: #{Time.now - lap}"
    lap = Time.now
    puts "getting nearest"

    filename = @document.id.to_s + ".ann"
    path = Rails.root.join("storage", "index", filename)

    neighbors = 10
    dimensions = @document.components

    annoy = Annoy::AnnoyIndex.new(n_features: dimensions, metric: 'angular')
    annoy.load(path.to_s)
    results = annoy.get_nns_by_vector(projected.to_a, neighbors)
    labels = results.map { |id| @document.chunks.find(id).content }

    puts results.join(", ")

    puts "search time: #{Time.now - lap}"
    lap = Time.now
    puts "getting completion"

    completion = get_chat_completion(labels.to_json, text)

    puts "completion time: #{Time.now - lap}"
    lap = Time.now

    @question = @document.questions.create(text: text, answer: completion, embedding: embedding.to_a)

    puts "total time: #{Time.now - start_time}"

    render json: @question, status: 200
  end

  def embed
    @user = current_user
    @document = @user.documents.find(params[:id])
    @questions = @document.questions

    # filter out questions that have already been embedded
    @questions = @questions.select { |question| question.embedding.length == 0 }

    embeddings = get_embeddings(questions_to_text_list)
    @questions.each do |question|
      question.update(embedding: embeddings.shift)
      question.save
    end
    render json: doc_with_questions, status: 200
  end

  private

  def question_params
    params.require(:question).permit(:text, :answer)
  end

  def questions_to_text_list
    @questions.map { |question| question.text }
  end

end
