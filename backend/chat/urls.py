from django.urls import path
from .views import chat_api  # Import the chat_api view

urlpatterns = [
    path('chat/', chat_api, name='chat_api'),  # Define the correct route for your API
]
