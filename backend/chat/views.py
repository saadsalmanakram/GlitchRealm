from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Message
from .serializers import MessageSerializer
from huggingface_hub import InferenceClient
import os

class ChatViewSet(APIView):
    def post(self, request):
        try:
            user_message = request.data.get('message')
            if not user_message:
                return Response(
                    {"error": "Message is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get Hugging Face API Key from environment
            api_key = os.getenv('HUGGINGFACE_API_KEY')
            if not api_key:
                return Response(
                    {"error": "Hugging Face API key not configured."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Initialize Hugging Face client
            client = InferenceClient(api_key=api_key)
            
            # Create messages list for the API
            messages = [
                {
                    "role": "user",
                    "content": user_message
                }
            ]
            
            # Get response from Hugging Face
            response = client.chat.completions.create(
                model="Qwen/Qwen2.5-0.5B-Instruct",
                messages=messages,
                temperature=0.5,
                max_tokens=2048,
                top_p=0.7,
                stream=False
            )
            
            if not response or not response.choices:
                return Response(
                    {"error": "No response from Hugging Face API"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            bot_response = response.choices[0].message.content
            
            # Save the user message
            user_msg = Message.objects.create(
                text=user_message,
                is_bot=False
            )
            
            # Save the bot response
            bot_msg = Message.objects.create(
                text=bot_response,
                is_bot=True
            )
            
            return Response({
                "status": "success",
                "response": bot_response
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )