class AddTreesToDocuments < ActiveRecord::Migration[7.0]
  def change
    add_column :documents, :trees, :integer
  end
end
