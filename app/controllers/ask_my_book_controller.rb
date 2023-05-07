# frozen_string_literal: true

class AskMyBookController < ApplicationController
  layout "ask_my_book"

  def index
    @ask_my_book_props = { email: current_user.email }
  end
end
