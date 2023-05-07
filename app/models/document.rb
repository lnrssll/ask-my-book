class Document < ApplicationRecord
  has_one_attached :file
  belongs_to :user
  validates :title, presence: true
end
