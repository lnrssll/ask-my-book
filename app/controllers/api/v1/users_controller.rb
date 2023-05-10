class Api::V1::UsersController < ApplicationController

  def create
    if verify_access_code
      puts "\n#####\nAccess code verified\n#####\n"
      @user = User.new(user_params)
      if @user.save
        render json: @user, status: :created
      else
        render json: @user.errors, status: :unprocessable_entity
      end
    else
      render json: { message: "Invalid access code" }, status: 403
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
    p = params.require(:user).permit(:email, :password, :password_confirmation, :credits, :code).merge(credits: 1000)
    p.delete(:code)
    return p
  end

  def verify_access_code
    expected_access_code = Digest::SHA256.hexdigest("#{params[:email]}#{ENV['SALT']}")
    return params[:access_code] != expected_access_code
  end
end
