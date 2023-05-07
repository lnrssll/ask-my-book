Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  namespace :api do
    namespace :v1 do
      post 'signup', to: 'users#create'
      delete 'deactivate', to: 'users#destroy'

      post 'login', to: 'sessions#create'
      delete 'logout', to: 'sessions#destroy'

      get 'me', to: 'sessions#show'
    end
  end

  get '*path', to: redirect("/"), constraints: lambda { |req| !req.path.starts_with?("/api") }

  # Defines the root path route ("/")
  root "ask_my_book#index"
end
