class AddDefaultQuestionAndReadyToDocuments < ActiveRecord::Migration[7.0]
  def change
    add_column :documents, :ready, :boolean
  end
end
