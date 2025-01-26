from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.prompts import MessagesPlaceholder
from langgraph.graph import START, StateGraph
from langgraph.checkpoint.memory import MemorySaver
from typing import List, Dict, Any
import json
import uuid
from typing_extensions import Annotated
from langgraph.graph.message import add_state, add_messages

# Define your state schema
class State(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    memory_key: str

# Initialize LangGraph components
workflow = StateGraph(state_schema=State)

def call_model(state: State):
    # Get the current messages
    messages = state['messages']
    
    # Create a new AIMessage from the last human message
    if messages and isinstance(messages[-1], HumanMessage):
        response = "This is a test response."
        new_message = AIMessage(content=response)
        messages = messages + [new_message]
    
    return {"messages": messages}

# Set up your LangGraph workflow
workflow.add_edge(START, "model")
workflow.add_node("model", call_model)

# Initialize memory
memory = MemorySaver()
langgraph_app = workflow.compile(checkpointer=memory)

class ChatViewSet(APIView):
    def post(self, request):
        try:
            user_message = request.data.get('message')
            if not user_message:
                return Response(
                    {"error": "Message is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generate a unique conversation key if not provided
            conversation_key = request.data.get('conversation_key', str(uuid.uuid4()))
            
            # Create HumanMessage from user input
            input_message = HumanMessage(content=user_message)
            
            # Invoke LangGraph app with conversation key
            state = langgraph_app.invoke(
                {
                    "messages": [input_message],
                    "memory_key": conversation_key
                }
            )

            # Extract bot response from messages
            bot_response = state['messages'][-1].content

            response_data = {
                "status": "success",
                "response": bot_response,
                "conversation_key": conversation_key
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )