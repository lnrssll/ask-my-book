class AddEmbeddedToDocuments < ActiveRecord::Migration[7.0]
  def change
    add_column :documents, :embedded, :boolean
  end
end
