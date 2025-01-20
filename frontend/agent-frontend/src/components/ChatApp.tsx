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
      const response = await axios.post('http://127.0.0.1:8000/api/chat/', {
        user_message: userMessage,
      });

      if (response.data.ai_response) {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { role: 'user', message: userMessage },
          { role: 'ai', message: response.data.ai_response },
        ]);
      } else {
        console.error('No response from AI');
      }

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
          <div key={index} className={`chat-message ${chat.role === 'user' ? 'user' : 'ai'}`}>
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
          className="shining-gradient border border-gray-300 rounded-lg px-4 py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading}
          className="send-button ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-300"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
