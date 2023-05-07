class Api::V1::SessionsController < ApplicationController
  before_action :redirect_if_authenticated, only: [:create, :new]

  def create
    @user = User.find_by(email: user_params[:email].downcase)
    if @user
      if @user.authenticate(user_params[:password])
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
      render json: { "email": current_user.email }, status: 200
    else
      render json: { "email": nil }, status: 200
    end
  end

  def destroy
    logout
  end

  def new
  end

  private

  def user_params
    params.require(:user).permit(:email, :password)
  end
end

