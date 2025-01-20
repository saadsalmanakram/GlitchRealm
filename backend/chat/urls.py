from django.urls import path
from .views import chat_api  # Update this line if your function name is chat_api

urlpatterns = [
    path('chat/', chat_api, name='chat_api'),  # Ensure you use the correct view here
]