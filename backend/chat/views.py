from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
import os
import json  # Import json for parsing JSON data

# Make sure you have the Hugging Face API key in the environment variables
HUGGING_FACE_API_KEY = os.getenv("HUGGING_FACE_API_KEY")

# Make the request to Hugging Face API
@csrf_exempt  # This disables CSRF validation for simplicity (you can enable CSRF protection later)
def chat_api(request):
    if request.method == 'POST':
        try:
            # Parse the JSON body of the request
            data = json.loads(request.body)
            
            # Get user message from the parsed data
            user_message = data.get('user_message', '')
            
            # If no message is provided, return an error response
            if not user_message:
                return JsonResponse({"error": "No user_message provided"}, status=400)
            
            # Construct the API request to Hugging Face
            url = "https://api-inference.huggingface.co/models/distilbert/distilgpt2"
            headers = {"Authorization": f"Bearer {HUGGING_FACE_API_KEY}"}
            payload = {"inputs": user_message}

            # Send the message to Hugging Face's API and get the response
            response = requests.post(url, json=payload, headers=headers)

            # If Hugging Face API returns an error, send the error response
            if response.status_code != 200:
                return JsonResponse({"error": "Error from Hugging Face API"}, status=response.status_code)

            # Extract the AI response from the Hugging Face API
            ai_response = response.json()[0]['generated_text']

            # Return the AI response as JSON
            return JsonResponse({"ai_response": ai_response})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)
