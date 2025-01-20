import os
import requests
from django.http import JsonResponse
from django.conf import settings

# Function to interact with Hugging Face API
def generate_text(request):
    # Get the Hugging Face API key from settings
    api_key = settings.HUGGINGFACE_API_KEY
    
    if not api_key:
        return JsonResponse({"error": "Hugging Face API key is missing!"}, status=400)
    
    # URL of the Hugging Face model you want to interact with (DistilGPT2)
    url = "https://api-inference.huggingface.co/models/distilbert/distilgpt2"  # DistilGPT2 model
    headers = {"Authorization": f"Bearer {api_key}"}
    
    # Get input text from request
    input_text = request.GET.get('input_text', 'Hello, how are you?')  # Default value
    
    # Payload for the Hugging Face API
    payload = {"inputs": input_text}
    
    # Send the request to Hugging Face API
    response = requests.post(url, json=payload, headers=headers)
    
    # Check for successful response
    if response.status_code == 200:
        generated_text = response.json()[0]['generated_text']
        return JsonResponse({"generated_text": generated_text}, status=200)
    else:
        return JsonResponse({"error": response.json()}, status=response.status_code)
