from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
import os
import json
from .models import Conversation  # Import the Conversation model

# Ensure Hugging Face API key is set in environment variables
HUGGING_FACE_API_KEY = os.getenv("HUGGING_FACE_API_KEY")


@csrf_exempt
def chat_api(request):
    """Handles full CRUD operations for chatbot conversations."""

    # **1. CREATE (POST) - Generate response using Hugging Face API**
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('user_message', '').strip()

            if not user_message:
                return JsonResponse({"error": "No user_message provided"}, status=400)

            # Construct API request to Hugging Face
            url = "https://api-inference.huggingface.co/models/distilbert/distilgpt2"
            headers = {"Authorization": f"Bearer {HUGGING_FACE_API_KEY}"}
            payload = {"inputs": user_message}

            response = requests.post(url, json=payload, headers=headers)

            if response.status_code != 200:
                return JsonResponse({"error": "Error from Hugging Face API", "details": response.text}, status=response.status_code)

            ai_response = response.json()[0].get('generated_text', 'No response generated.')

            # Store conversation in the database
            conversation = Conversation.objects.create(user_message=user_message, ai_response=ai_response)

            return JsonResponse({"id": conversation.id, "user_message": user_message, "ai_response": ai_response})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

    # **2. READ (GET) - Retrieve past chatbot conversations**
    elif request.method == 'GET':
        conversations = Conversation.objects.all().values("id", "user_message", "ai_response", "timestamp")
        return JsonResponse({"conversations": list(conversations)}, safe=False)

    # **3. UPDATE (PUT/PATCH) - Modify an existing chatbot response**
    elif request.method in ['PUT', 'PATCH']:
        try:
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
                url = "https://api-inference.huggingface.co/models/distilbert/distilgpt2"
                headers = {"Authorization": f"Bearer {HUGGING_FACE_API_KEY}"}
                payload = {"inputs": new_user_message}
                response = requests.post(url, json=payload, headers=headers)

                if response.status_code == 200:
                    conversation.ai_response = response.json()[0].get('generated_text', conversation.ai_response)
                
                conversation.save()

            return JsonResponse({"message": "Conversation updated", "id": conversation.id, "user_message": conversation.user_message, "ai_response": conversation.ai_response})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

    # **4. DELETE (DELETE) - Remove a chatbot conversation**
    elif request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            conversation_id = data.get("id")

            if not conversation_id:
                return JsonResponse({"error": "ID is required for deletion"}, status=400)

            conversation = Conversation.objects.filter(id=conversation_id).first()
            if not conversation:
                return JsonResponse({"error": "Conversation not found"}, status=404)

            conversation.delete()
            return JsonResponse({"message": "Conversation deleted successfully"})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)
