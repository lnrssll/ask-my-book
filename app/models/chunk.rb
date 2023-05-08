class Chunk < ApplicationRecord
  belongs_to :document
  serialize :embedding, Array
end
