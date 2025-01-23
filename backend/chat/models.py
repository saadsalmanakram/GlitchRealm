from django.db import models

class Message(models.Model):
    text = models.TextField()
    is_bot = models.BooleanField(default=False)
    model = models.CharField(max_length=100, default='Qwen/Qwen2.5-0.5B-Instruct')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message {self.id}: {self.text[:50]}"