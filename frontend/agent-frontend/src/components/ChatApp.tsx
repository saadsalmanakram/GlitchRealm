import React, { useState } from 'react';
import axios from 'axios';

const ChatApp = () => {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle changes in the message input
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  // Handle sending message to the backend and getting the AI response
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;  // Don't send empty messages

    setLoading(true);
    try {
      // Send POST request to the Django backend
      const response = await axios.post('http://127.0.0.1:8000/api/chat/', {
        user_message: userMessage,  // Send the user message to the backend
      });

      // Check for the response and add both user and AI messages to the chat history
      if (response.data.ai_response) {
        setChatHistory([
          ...chatHistory,
          { role: 'user', message: userMessage },
          { role: 'ai', message: response.data.ai_response },
        ]);
      } else {
        console.error("No response from AI");
      }

      // Clear the input field after sending the message
      setUserMessage('');
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="chat-app-container">
      {/* Displaying the chat history */}
      <div className="chat-history">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`chat-message ${chat.role === 'user' ? 'user' : 'ai'}`}
          >
            <p>{chat.message}</p>
          </div>
        ))}
      </div>

      {/* Input field and send button */}
      <div className="input-container">
        <input
          type="text"
          value={userMessage}
          onChange={handleMessageChange}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
