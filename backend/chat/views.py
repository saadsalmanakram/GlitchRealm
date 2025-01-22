from django.http import JsonResponse
from rest_framework.decorators import api_view
import openai
import os

# Store conversation history in-memory (reset on restart)
conversation_history = {}

# Instantiate the OpenAI client using the new v1.0+ interface
client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Function to communicate with OpenAI GPT
def get_ai_response(user_id, user_input):
    if user_id not in conversation_history:
        conversation_history[user_id] = []

    conversation_history[user_id].append({"role": "user", "content": user_input})

    try:
        # Correct API method for chat completions
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Replace with the model of your choice, e.g., gpt-3.5-turbo
            messages=conversation_history[user_id]
        )
        ai_reply = response['choices'][0]['message']['content']

        # Append AI response to conversation history
        conversation_history[user_id].append({"role": "assistant", "content": ai_reply})

        return ai_reply
    except Exception as e:
        return f"Error: {str(e)}"

# API Endpoint to handle chat
@api_view(['POST'])
def chat_api(request):
    user_id = request.data.get("user_id", "default_user")  # Unique user identifier
    user_input = request.data.get("user_message", "")  # Correct the key here based on frontend data

    if not user_input:
        return JsonResponse({"error": "Message cannot be empty"}, status=400)

    ai_reply = get_ai_response(user_id, user_input)

    return JsonResponse({
        "ai_response": ai_reply,
        "conversation_history": conversation_history[user_id]
    })
