from django.urls import path
from .views import get_openai_response

urlpatterns = [
    path('chat/', get_openai_response, name='chat-api'),
]
