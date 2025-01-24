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
      container.scrollTop = container.scrollHeight;
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
      <div 
        ref={chatContainerRef} 
        className="chat-history"
        style={{
          overflowY: 'auto',
          height: 'calc(100vh - 180px)', 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '15px',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
        }}
      >
        {chatHistory.map((chat, index) => (
          <div 
            key={index}
            className={`chat-message ${chat.role === 'user' ? 'user' : 'ai'}`}
            style={{
              marginBottom: '10px',
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
        padding: '15px',
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
          }}>
          {models.map((model, index) => (
            <option 
              key={index} 
              value={model}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#333',
                padding: '8px',
              }}>
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
          }} >
          {loading ? (
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 50 50" 
              style={{ margin: 'auto', display: 'block' }}
            >
              <path 
                d="M25,2C12.318,2,2,12.317,2,25s10.318,23,23,23s23-10.317,23-23S37.682,2,25,2z M29.36,32H13l7.64-14H37L29.36,32z" 
                fill="#ffffff" 
              />
            </svg>
          ) : (
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 50 50" 
              style={{ margin: 'auto', display: 'block' }}
            >
              <path 
                d="M25,2C12.318,2,2,12.317,2,25s10.318,23,23,23s23-10.317,23-23S37.682,2,25,2z M29.36,32H13l7.64-14H37L29.36,32z" 
                fill="#ffffff" 
              />
            </svg>
          )}
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
          }}
        >
          <img 
            src="data:image/png;base64,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" 
            alt="New Chat" 
            style={{
              width: '24px', 
              height: '24px', 
              display: 'block', 
              margin: 'auto' 
            }}
          />
        </button>
      </div>
    </div>
  );
};

export default ChatApp;