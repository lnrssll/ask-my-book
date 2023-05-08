class Api::V1::BooksController < ApplicationController
  def index
    @documents = Document.where(ready: true)
    render json: documents_json, status: 200
  end

  def show
    @document = Document.find(params[:id])
    if @document.ready?
      render json: document_json, status: 200
    else
      render json: { error: 'Document not ready yet' }, status: 404
    end
  end

  private

  def documents_json
    @documents.map { |document| document.attributes.slice('id', 'title', 'description') }
  end

  def document_json
    @document.attributes.slice('id', 'title', 'description', 'default_question')
  end

end
