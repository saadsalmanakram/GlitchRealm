import json
import logging
import os
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from .models import Conversation

# Set up logging
logger = logging.getLogger(__name__)

# Ensure Hugging Face API key is set in environment variables
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

if not HUGGINGFACE_API_KEY:
    logger.error("Hugging Face API key is missing!")
    raise ValueError("Hugging Face API key is required but not found!")

# URL for Hugging Face API model (Choose a chat-compatible model)
HF_API_URL = "https://api-inference.huggingface.co/models/distilbert/distilgpt2"

# Function to interact with the Hugging Face API
def get_ai_response(user_message):
    """
    Communicates with the Hugging Face API to generate a response based on the user's message.
    """
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    payload = {"inputs": user_message}

    try:
        response = requests.post(HF_API_URL, json=payload, headers=headers)
        response_json = response.json()

        # Log the API response for debugging
        logger.info(f"Hugging Face API Response: {response_json}")

        if response.status_code == 200:
            if isinstance(response_json, list) and len(response_json) > 0:
                return response_json[0].get("generated_text", "No response generated.")
            elif isinstance(response_json, dict) and "generated_text" in response_json:
                return response_json["generated_text"]
            else:
                return "No valid response received from AI."

        elif "error" in response_json:
            logger.error(f"Hugging Face API Error: {response_json['error']}")
            return f"Error: {response_json['error']}"

        return "Sorry, I couldn't generate a response right now."

    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {e}")
        return "There was an error processing your request. Please try again later."


@csrf_exempt
def chat_api(request):
    """Handles full CRUD operations for chatbot conversations."""
    try:
        if request.method == "POST":
            # Log the request body to help debug
            logger.info(f"POST request body: {request.body.decode('utf-8')}")

            data = json.loads(request.body)
            user_message = data.get("user_message", "").strip()

            if not user_message:
                return JsonResponse({"error": "No user_message provided"}, status=400)

            # Get AI response
            ai_response = get_ai_response(user_message)
            conversation = Conversation.objects.create(user_message=user_message, ai_response=ai_response)

            return JsonResponse(
                {
                    "id": conversation.id,
                    "user_message": user_message,
                    "ai_response": ai_response,
                    "created_at": conversation.created_at.isoformat(),
                }
            )

        elif request.method == "GET":
            """Retrieve past chatbot conversations."""
            conversations = Conversation.objects.all().values("id", "user_message", "ai_response", "created_at")
            return JsonResponse({"conversations": list(conversations)}, safe=False)

        elif request.method in ["PUT", "PATCH"]:
            """Update an existing chatbot conversation."""
            logger.info(f"{request.method} request body: {request.body.decode('utf-8')}")

            data = json.loads(request.body)
            conversation_id = data.get("id")
            new_user_message = data.get("user_message", "").strip()

            if not conversation_id:
                return JsonResponse({"error": "ID is required for updating"}, status=400)

            conversation = Conversation.objects.filter(id=conversation_id).first()
            if not conversation:
                return JsonResponse({"error": "Conversation not found"}, status=404)

            if new_user_message:
                conversation.user_message = new_user_message

                # Fetch new AI response based on updated message
                ai_response = get_ai_response(new_user_message)
                conversation.ai_response = ai_response

                conversation.save()

            return JsonResponse(
                {
                    "message": "Conversation updated",
                    "id": conversation.id,
                    "user_message": conversation.user_message,
                    "ai_response": conversation.ai_response,
                    "updated_at": now().isoformat(),
                }
            )

        elif request.method == "DELETE":
            """Delete a chatbot conversation."""
            logger.info(f"DELETE request body: {request.body.decode('utf-8')}")
            data = json.loads(request.body)
            conversation_id = data.get("id")

            if not conversation_id:
                return JsonResponse({"error": "ID is required for deletion"}, status=400)

            conversation = Conversation.objects.filter(id=conversation_id).first()
            if not conversation:
                return JsonResponse({"error": "Conversation not found"}, status=404)

            conversation.delete()
            return JsonResponse({"message": "Conversation deleted successfully"})

    except json.JSONDecodeError as e:
        logger.error(f"JSON Decode Error: {e}")
        return JsonResponse({"error": "Invalid JSON format"}, status=400)

    except Exception as e:
        logger.error(f"Internal Server Error: {e}")
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)
