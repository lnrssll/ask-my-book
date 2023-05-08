Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  namespace :api do
    namespace :v1 do
      post 'signup', to: 'users#create'
      delete 'deactivate', to: 'users#destroy'

      post 'login', to: 'sessions#create'
      delete 'logout', to: 'sessions#destroy'

      get 'me', to: 'sessions#show'

      # resources :documents, only: [:index, :show, :update]
      get 'docs', to: 'documents#index'
      post 'docs', to: 'documents#create'

      get 'docs/:id', to: 'documents#show'
      delete 'docs/:id', to: 'documents#destroy'

      post 'docs/:id/chunk', to: 'documents#chunk'
      patch 'docs/:id/embed', to: 'documents#embed'
      patch 'docs/:id/decompose', to: 'documents#decompose'

    end
  end

  get "admin", to: "admin#index"
  get "admin/*path", to: redirect("/admin")
  get '*path', to: redirect("/"), constraints: lambda { |req| !req.path.starts_with?("/api") }

  # Defines the root path route ("/")
  root "ask_my_book#index"
end
