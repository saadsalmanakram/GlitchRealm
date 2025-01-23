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

  // Scroll to the bottom of the chat history when a new message is added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Update the message state when the user types in the input field
  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  // Handle sending the message to the backend API
  const handleSendMessage = async () => {
    if (!userMessage.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Sending message to the backend with the correct payload
      const response = await axios.post('http://127.0.0.1:8000/api/chat/', {
        message: userMessage,
      });

      // Check if the response contains data
      if (response.data) {
        // Add the user message to the history
        setChatHistory(prev => [
          ...prev,
          { role: 'user', message: userMessage }
        ]);

        // Add the AI's response to the history
        setChatHistory(prev => [
          ...prev,
          { role: 'ai', message: response.data.response }
        ]);
      } else {
        setError('No response from AI');
      }

      setUserMessage(''); // Clear input field after sending message
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to send message. Please try again.');
    }

    setLoading(false);
  };

  // Handle starting a new chat (clearing the chat history)
  const handleNewChat = () => {
    setChatHistory([]);
    setUserMessage('');
    setError(null);
  };

  // Handle sending message when "Enter" is pressed
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

      <div className="input-container" style={{ position: 'sticky', bottom: '0', background: '#fff', padding: '10px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={userMessage}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={loading}
          className="input-field"
          style={{ flexGrow: 1 }}
        />
        <button onClick={handleSendMessage} disabled={loading} className="send-button">
          {loading ? 'Sending...' : 'Send'}
        </button>
        <button onClick={handleNewChat} className="new-chat-button">New Chat</button>
      </div>
    </div>
  );
}