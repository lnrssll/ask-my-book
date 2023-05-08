class CreateChunks < ActiveRecord::Migration[7.0]
  def change
    create_table :chunks do |t|
      t.text :embedding
      t.text :content
      t.references :document, null: false, foreign_key: true

      t.timestamps
    end
  end
end
