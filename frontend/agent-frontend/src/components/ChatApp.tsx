import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'ai';
  message: string;
}

const ChatApp: React.FC = () => {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the latest message when chatHistory updates
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || loading) return;

    setLoading(true);
    setError(null);

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
        setError('No response from AI');
      }

      setUserMessage('');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to send message. Please try again.');
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-app-container">
      <div ref={chatContainerRef} className="chat-history">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`chat-message ${chat.role === 'user' ? 'user' : 'ai'}`}>
            <p>{chat.message}</p>
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="input-container">
        <input
          type="text"
          value={userMessage}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown} // Send message on Enter key
          placeholder="Type a message..."
          disabled={loading}
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
