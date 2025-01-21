import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'ai';
  message: string;
}

export default function ChatApp() {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-app-container">
      <div ref={chatContainerRef} className="chat-history" style={{ overflowY: 'auto', maxHeight: '400px' }}>
        {chatHistory.map((chat, index) => (
          <div key={index} className={`chat-message ${chat.role === 'user' ? 'user' : 'ai'}`}>
            <p>{chat.message}</p>
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="input-container" style={{ position: 'sticky', bottom: '0', background: '#fff', padding: '10px' }}>
        <input
          type="text"
          value={userMessage}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={loading}
          className="input-field"
        />
        <button onClick={handleSendMessage} disabled={loading} className="send-button">
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
