import random

class SimpleChatbot:
    def __init__(self):
        self.responses = {
            'greeting': [
                "Hello! How can I help you today?",
                "Hi there! What can I do for you?",
                "Greetings! How may I assist you?"
            ],
            'farewell': [
                "Goodbye! Have a great day!",
                "See you later! Take care!",
                "Bye! Feel free to come back if you need anything!"
            ],
            'thanks': [
                "You're welcome!",
                "Happy to help!",
                "My pleasure!"
            ],
            'default': [
                "I understand. Tell me more about that.",
                "Interesting. Could you elaborate?",
                "I see. How can I help you with that?",
                "That's worth discussing. What are your thoughts?"
            ]
        }
        
        self.keywords = {
            'greeting': ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon'],
            'farewell': ['bye', 'goodbye', 'see you', 'farewell', 'good night'],
            'thanks': ['thank', 'thanks', 'appreciate', 'grateful']
        }
    
    def get_response(self, message):
        message = message.lower()
        
        # Check for keyword matches
        for category, keywords in self.keywords.items():
            if any(keyword in message for keyword in keywords):
                return random.choice(self.responses[category])
        
        # If no keywords match, return a default response
        return random.choice(self.responses['default'])