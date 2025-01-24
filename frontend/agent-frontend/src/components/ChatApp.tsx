import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'ai';
  message: string;
}

const ChatApp = () => {
  const [userMessage, setUserMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('meta-llama/Llama-3.2-1B-Instruct');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // List of available models
  const models = [
    'meta-llama/Llama-3.2-1B-Instruct',
    'google/gemma-1.1-2b-it',
    'google/gemma-2-2b-it',
    'google/gemma-2-9b-it',
    'microsoft/Phi-3-mini-4k-instruct',
    'microsoft/Phi-3.5-mini-instruct',
    'HuggingFaceH4/starchat2-15b-v0.1'
  ];

  // Scroll to the bottom of the chat history when new messages are added
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 0);
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
      // First, add the user message to the history
      setChatHistory(prev => [
        ...prev,
        { role: 'user', message: userMessage }
      ]);

      // Show the loading state with SVG animation
      setChatHistory(prev => [
        ...prev,
        { role: 'ai', message: 'LOADING Svg Animation' }
      ]);

      const response = await axios.post('http://127.0.0.1:8000/api/chat/', {
        message: userMessage,
        model: selectedModel
      });

      // Update the loading message with the actual response
      setChatHistory(prev => {
        const updatedHistory = [...prev];
        if (
          updatedHistory.length > 0 &&
          updatedHistory[updatedHistory.length - 1].message === 'LOADING Svg Animation'
        ) {
          updatedHistory[updatedHistory.length - 1] = {
            role: 'ai',
            message: response.data.response
          };
        }
        return updatedHistory;
      });

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

  const LoadingAnimation = () => (
    <svg
      style={{
        display: 'block',
        margin: 'auto',
        width: '35px',
        height: '35px'
      }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
    >
      <circle fill="#FF156D" stroke="#FF156D" stroke-width="15" r="15" cx="40" cy="65">
        <animate
          attributeName="cy"
          calcMode="spline"
          dur="2"
          values="65;135;65;"
          keySplines=".5 0 .5 1;.5 0 .5 1"
          repeatCount="indefinite"
          begin="-.4"
        />
      </circle>
      <circle fill="#FF156D" stroke="#FF156D" stroke-width="15" r="15" cx="100" cy="65">
        <animate
          attributeName="cy"
          calcMode="spline"
          dur="2"
          values="65;135;65;"
          keySplines=".5 0 .5 1;.5 0 .5 1"
          repeatCount="indefinite"
          begin="-.2"
        />
      </circle>
      <circle fill="#FF156D" stroke="#FF156D" stroke-width="15" r="15" cx="160" cy="65">
        <animate
          attributeName="cy"
          calcMode="spline"
          dur="2"
          values="65;135;65;"
          keySplines=".5 0 .5 1;.5 0 .5 1"
          repeatCount="indefinite"
          begin="0"
        />
      </circle>
    </svg>
  );

  return (
    <div className="chat-app-container">
      <div ref={chatContainerRef} className="chat-history" style={{ 
        overflowY: 'auto',
        maxHeight: '400px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '20px',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
      }}>
        {chatHistory.map((chat, index) => (
          <div 
            key={index} 
            className={`chat-message ${chat.role === 'user' ? 'user' : 'ai'}`} 
            style={{
              marginBottom: '15px',
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.7)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
              ':hover': {
                transform: 'translateY(-2px)',
                transition: 'transform 0.2s ease'
              }
            }}
          >
            {chat.message === 'LOADING Svg Animation' ? (
              <LoadingAnimation />
            ) : (
              <p style={{ color: '#333', marginBottom: '0' }}>{chat.message}</p>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="error-message" style={{
          padding: '10px',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          color: 'red',
          borderRadius: '8px',
          margin: '10px 0'
        }}>
          {error}
        </div>
      )}

      <div className="input-container" style={{ 
        display: 'flex', 
        gap: '10px',
        position: 'sticky', 
        bottom: '0', 
        background: '#fff',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)'
      }}>
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="model-select"
          style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            ':focus': {
              outline: 'none',
              boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)'
            },
            ':hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }
          }}
        >
          {models.map((model, index) => (
            <option 
              key={index} 
              value={model}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#333',
                padding: '8px',
              }}
            >
              {model.replace(/\/|-/g, ' ').replace('Instruct', '')}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={userMessage}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={loading}
          className="input-field"
          style={{ 
            flexGrow: 1,
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            fontSize: '14px',
            ':focus': {
              outline: 'none',
              boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)'
            }
          }}
        />
        <button 
          onClick={handleSendMessage} 
          disabled={loading} 
          className="send-button"
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            ':disabled': {
              backgroundColor: '#696969',
              cursor: 'not-allowed',
            },
            ':hover': {
              backgroundColor: '#45a049',
              transform: 'scale(1.02)',
              transition: 'all 0.2s ease'
            }
          }}>
          {loading ? 'Sending...' : 'Send'}
        </button>
        <button 
          onClick={handleNewChat} 
          className="new-chat-button"
          style={{
            padding: '8px 16px',
            backgroundColor: '#f39c12',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            ':hover': {
              backgroundColor: '#e67e22',
              transform: 'scale(1.02)',
              transition: 'all 0.2s ease'
            }
          }}>
          New Chat
        </button>
      </div>
    </div>
  );
};

export default ChatApp;