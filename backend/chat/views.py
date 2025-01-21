from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from .utils import SimpleChatbot

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    chatbot = SimpleChatbot()

    @action(detail=True, methods=['POST'])
    def send_message(self, request, pk=None):
        try:
            conversation = self.get_object()
            user_message = request.data.get('message', '')
            
            if not user_message:
                return Response(
                    {'error': 'Message content is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Save user message
            Message.objects.create(
                conversation=conversation,
                content=user_message,
                is_user=True
            )

            # Generate and save bot response
            bot_response = self.chatbot.get_response(user_message)
            bot_message = Message.objects.create(
                conversation=conversation,
                content=bot_response,
                is_user=False
            )

            return Response({
                'message': MessageSerializer(bot_message).data
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )