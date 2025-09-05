from django.db import models
from django.contrib.auth.models import User

class Conversation(models.Model):
    title = models.CharField(max_length=255, blank=True, default='')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    is_user = models.BooleanField(default=True)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
