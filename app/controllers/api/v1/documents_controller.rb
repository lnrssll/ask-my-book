class Api::V1::DocumentsController < ApplicationController
  def index
    @user = current_user
    @documents = @user.documents
    render json: documents_json, status: 200
  end

  def show
    @user = current_user
    @document = @user.documents.find(params[:id])
    render json: document_json, status: 200
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
end
