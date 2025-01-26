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

  const models = [
    'meta-llama/Llama-3.2-1B-Instruct',
    'google/gemma-1.1-2b-it',
    'google/gemma-2-2b-it',
    'google/gemma-2-9b-it',
    'microsoft/Phi-3-mini-4k-instruct',
    'microsoft/Phi-3.5-mini-instruct',
    'HuggingFaceH4/starchat2-15b-v0.1'
  ];

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
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
      setChatHistory(prev => [
        ...prev,
        { role: 'user', message: userMessage }
      ]);

      setChatHistory(prev => [
        ...prev,
        { role: 'ai', message: 'LOADING Svg Animation' }
      ]);

      const response = await axios.post('http://127.0.0.1:8000/api/chat/', {
        message: userMessage,
        model: selectedModel
      });

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

      setUserMessage(''); 
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to send message. Please try again.');
    }

    setLoading(false);
  };

  const handleNewChat = () => {
    setChatHistory([]);
    setUserMessage('');
    setError(null);
  };

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
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            ':disabled': {
              backgroundColor: '#696969',
              cursor: 'not-allowed'
            },
            ':hover': {
              backgroundColor: '#45a049'
            }
          }}>
          Enter
        </button>

        <button
          onClick={handleNewChat}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            ':hover': {
              backgroundColor: '#cc0000'
            }
          }}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default ChatApp;