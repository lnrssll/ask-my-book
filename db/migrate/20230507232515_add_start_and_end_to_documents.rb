class AddStartAndEndToDocuments < ActiveRecord::Migration[7.0]
  def change
    add_column :documents, :start, :integer
    add_column :documents, :end, :integer
  end
end
