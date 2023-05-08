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
