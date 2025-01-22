from rest_framework import serializers

class ChatSerializer(serializers.Serializer):
    user_id = serializers.CharField(max_length=100)
    message = serializers.CharField()
