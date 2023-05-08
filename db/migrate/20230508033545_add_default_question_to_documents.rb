class AddDefaultQuestionToDocuments < ActiveRecord::Migration[7.0]
  def change
    add_column :documents, :default_question, :text
  end
end
