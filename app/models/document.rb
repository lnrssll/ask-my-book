class Document < ApplicationRecord
  has_one_attached :file
  has_one_attached :mean
  has_one_attached :transformer
  has_one_attached :singular_values
  has_one_attached :index

  belongs_to :user

  validates :title, presence: true
  validates :file, presence: true
  validates :start, presence: true
  validates :end, presence: true

  has_many :chunks, dependent: :destroy
end
