class Api::V1::UsersController < ApplicationController

  def create
    @user = User.new(user_params)
    if @user.save
      render json: @user, status: :created
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def new
    @user = User.new
  end

  def destroy
    current_user.destroy
    reset_session
    render json: { message: "User deleted" }, status: 200
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end
end
