class AddQuestionWeightsToDocuments < ActiveRecord::Migration[7.0]
  def change
    add_column :documents, :question_weights, :text
  end
end
