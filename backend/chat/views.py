import openai
from django.conf import settings
from django.http import JsonResponse
from .models import Conversation
from .serializers import ConversationSerializer

# Initialize OpenAI client
openai.api_key = settings.OPENAI_API_KEY

def get_openai_response(request):
    user_message = request.GET.get("user_message")
    if not user_message:
        return JsonResponse({"error": "User message is required."}, status=400)

    # Retrieve previous conversation history
    conversations = Conversation.objects.all().values('user_message', 'ai_response')
    conversation_history = [{"role": "user", "content": msg['user_message']} for msg in conversations]
    conversation_history.append({"role": "user", "content": user_message})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",   
            messages=conversation_history
        )
        ai_response = response['choices'][0]['message']['content']

        # Save the conversation to the database
        conversation = Conversation.objects.create(
            user_message=user_message,
            ai_response=ai_response
        )

        # Return the conversation history along with the AI response
        return JsonResponse({
            "user_message": user_message,
            "ai_response": ai_response,
            "conversation_history": ConversationSerializer(conversation, many=True).data
        })

    except openai.error.OpenAIError as e:
        return JsonResponse({"error": str(e)}, status=500)
