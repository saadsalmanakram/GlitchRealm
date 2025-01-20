# chat/views.py
from openai import OpenAI
from django.conf import settings
from django.http import JsonResponse

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)

def get_openai_response(request):
    completion = client.chat.completions.create(
        model="gpt-4",
        store=True,
        messages=[{"role": "user", "content": "write a haiku about AI"}]
    )
    response = completion.choices[0].message["content"]
    return JsonResponse({"response": response})
