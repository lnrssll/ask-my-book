class AddComponentsAndVarianceToDocuments < ActiveRecord::Migration[7.0]
  def change
    add_column :documents, :components, :integer
    add_column :documents, :variance, :integer
  end
end
