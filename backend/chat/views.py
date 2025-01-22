from django.http import JsonResponse
from rest_framework.decorators import api_view
import openai

# Store conversation history in-memory (reset on restart)
conversation_history = {}

# Function to communicate with OpenAI GPT
def get_ai_response(user_id, user_input):
    if user_id not in conversation_history:
        conversation_history[user_id] = []
    
    conversation_history[user_id].append({"role": "user", "content": user_input})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
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
    user_input = request.data.get("message", "")

    if not user_input:
        return JsonResponse({"error": "Message cannot be empty"}, status=400)
    
    ai_reply = get_ai_response(user_id, user_input)
    
    return JsonResponse({
        "response": ai_reply,
        "conversation_history": conversation_history[user_id]
    })
