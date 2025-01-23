from django.db import models

class Message(models.Model):
    text = models.TextField()
    is_bot = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message #{self.id} from {'Bot' if self.is_bot else 'User'}"