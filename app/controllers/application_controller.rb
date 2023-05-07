class ApplicationController < ActionController::Base
  include Authentication
  protect_from_forgery with: :null_session
end
