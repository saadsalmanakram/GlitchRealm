from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
import os
import json
import logging
from django.utils.timezone import now
from dotenv import load_dotenv

# Set up logging
logger = logging.getLogger(__name__)

# Load environment variables from the .env file
load_dotenv()  # Ensure that .env is being loaded

# Get the Hugging Face API key
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

if not HUGGINGFACE_API_KEY:
    logger.error("Hugging Face API key is missing!")
    raise ValueError("Hugging Face API key is required but not found!")

# URL for Hugging Face API model (Switching to gpt-neo or other chat-compatible models)
HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B"  # This model should work for chat

# In-memory storage for chat history (Resets on server restart)
chat_history = ""

# Load the chat history (this can be extended to file or database storage for persistence)
def load_chat_history():
    global chat_history
    return chat_history

# Save the chat history (can be saved to file or database if needed)
def save_chat_history(history):
    global chat_history
    chat_history = history

# Function to interact with the Hugging Face API
def get_ai_response(user_message):
    """
    Communicates with the Hugging Face API to generate a response based on the user's message.
    Responds simply without additional explanations.
    """
    global chat_history  # Use global to modify chat_history variable

    # Append the user message to the chat history
    chat_history += f"User: {user_message}\n"

    # Define the simple response logic
    prompt = f"User: {user_message}\nAssistant:"

    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "inputs": prompt,  # Send the structured prompt to guide AI response
    }

    try:
        # Log the headers and payload for debugging
        logger.debug(f"Request Headers: {headers}")
        logger.debug(f"Request Payload: {payload}")

        # Make the API request
        response = requests.post(HF_API_URL, headers=headers, json=payload)

        # Log the raw response for debugging
        logger.debug(f"Response Status Code: {response.status_code}")
        response_json = response.json()
        logger.debug(f"Response JSON: {response_json}")

        if response.status_code == 200:
            if isinstance(response_json, list) and len(response_json) > 0:
                ai_response = response_json[0].get("generated_text", "No response generated.")
            elif isinstance(response_json, dict) and "generated_text" in response_json:
                ai_response = response_json["generated_text"]
            else:
                ai_response = "No valid response received from AI."

            # Append the AI response to the chat history
            chat_history += f"AI: {ai_response}\n"

            # Save the updated chat history to the file (or database)
            save_chat_history(chat_history)

            return ai_response.strip()  # Strip any excess space or formatting

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
    if request.method == "POST":
        try:
            # Parse request body
            data = json.loads(request.body)
            user_message = data.get("user_message", "").strip()

            if not user_message:
                return JsonResponse({"error": "No user_message provided"}, status=400)

            # Get AI response
            ai_response = get_ai_response(user_message)
            logger.info(f"User Message: {user_message}, AI Response: {ai_response}")

            return JsonResponse(
                {
                    "user_message": user_message,
                    "ai_response": ai_response,
                    "created_at": now().isoformat(),
                }
            )

        except json.JSONDecodeError:
            logger.error("Invalid JSON format in request body.")
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

        except Exception as e:
            logger.error(f"Internal server error: {str(e)}")
            return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

    elif request.method == "GET":
        """Retrieve conversation history."""
        # Load chat history if available
        history = load_chat_history()
        if history:
            return JsonResponse({"history": history.strip()}, safe=False)
        else:
            return JsonResponse({"message": "No conversation history stored."}, status=200)

    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

