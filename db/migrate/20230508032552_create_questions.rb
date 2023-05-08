class CreateQuestions < ActiveRecord::Migration[7.0]
  def change
    create_table :questions do |t|
      t.text :text
      t.text :answer
      t.references :document, null: false, foreign_key: true
      t.text :embedding

      t.timestamps
    end
  end
end
