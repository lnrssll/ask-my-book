class Api::V1::SessionsController < ApplicationController
  before_action :redirect_if_authenticated, only: [:create, :new]

  def create
    @user = User.find_by(email: params[:email].downcase)
    if @user
      if @user.authenticate(params[:password])
        login @user
        render json: @user, status: 201
      else
        flash.now[:alert] = "Incorrect email or password."
        render :new, status: :unprocessable_entity
      end
    else
      flash.now[:alert] = "Incorrect email or password."
      render :new, status: :unprocessable_entity
    end
  end

  def show
    if user_signed_in?
      render json: {
        id: Current.user.id,
        email: Current.user.email,
        loggedIn: true
      }, status: 200
    else
      render json: {
        loggedIn: false,
        message: "No user logged in"
      }, status: 200
    end
  end

  def destroy
    logout
  end

  def new
  end

end

