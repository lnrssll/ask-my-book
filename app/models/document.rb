class Document < ApplicationRecord
  has_one_attached :file
  belongs_to :user
  validates :title, presence: true
  validates :file, presence: true
  validates :start, presence: true
  validates :end, presence: true
end
