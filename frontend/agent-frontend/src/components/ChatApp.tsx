import React, { useState } from 'react';
import axios from 'axios';

const ChatApp = () => {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    setLoading(true);
    try {
      // Send message to Django backend (POST request)
      const response = await axios.post('http://127.0.0.1:8000/api/chat/', {
        user_message: userMessage,
      });

      // Update chat history with both the user message and AI response
      setChatHistory([
        ...chatHistory,
        { role: 'user', message: userMessage },
        { role: 'ai', message: response.data.ai_response },
      ]);

      // Clear the input field
      setUserMessage('');
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="chat-app-container">
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
