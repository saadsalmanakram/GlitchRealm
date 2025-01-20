import requests
from django.conf import settings
from django.http import JsonResponse

def get_huggingface_response(request):
    user_message = request.GET.get("user_message")
    if not user_message:
        return JsonResponse({"error": "User message is required."}, status=400)

    # Hugging Face Inference API endpoint for the model
    url = "https://api-inference.huggingface.co/models/distilbert/distilgpt2"
    headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
    payload = {"inputs": user_message}
    
    try:
        # Make POST request to Hugging Face API
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes

        # Extract response content
        response_data = response.json()

        # Check for model loading status
        if "error" in response_data:
            return JsonResponse({"error": response_data["error"], "estimated_time": response_data.get("estimated_time", "unknown")}, status=503)

        ai_response = response_data[0]['generated_text']

        # Return the AI response
        return JsonResponse({
            "user_message": user_message,
            "ai_response": ai_response
        })
    
    except requests.exceptions.RequestException as e:
        # Handle request errors
        return JsonResponse({"error": str(e)}, status=500)
