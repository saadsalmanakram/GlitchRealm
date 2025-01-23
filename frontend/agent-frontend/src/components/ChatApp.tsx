import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'ai';
  message: string;
}

const ChatApp = () => {
  const [userMessage, setUserMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('Qwen/Qwen2.5-72B-Instruct');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // List of available models
  const models = [
    'Qwen/Qwen2.5-72B-Instruct',
    'meta-llama/Llama-3.3-70B-Instruct',
    'CohereForAI/c4ai-command-r-plus-08-2024',
    'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    'nvidia/Llama-3.1-Nemotron-70B-Instruct-HF',
    'Qwen/QwQ-32B-Preview',
    'Qwen/Qwen2.5-Coder-32B-Instruct',
    'meta-llama/Llama-3.2-11B-Vision-Instruct',
    'NosResearch/Hermes-3-Llama-3.1-8B',
    'mistralai/Mistral-Nemo-Instruct-2407',
    'microsoft/Phi-3.5-mini-instruct'
  ];

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
        model: selectedModel
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
      <div ref={chatContainerRef} className="chat-history" style={{ 
        overflowY: 'auto', 
        maxHeight: '400px' 
      }}>
        {chatHistory.map((chat, index) => (
          <div key={index} className={`chat-message ${chat.role === 'user' ? 'user' : 'ai'}`}>
            <p>{chat.message}</p>
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="input-container" style={{ 
        display: 'flex', 
        gap: '10px',
        position: 'sticky', 
        bottom: '0', 
        background: '#fff', 
        padding: '10px'
      }}>
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="model-select"
          style={{
            padding: '8px 12px',
            backgroundColor: '#fff',
            color: '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            ':focus': {
              outline: 'none',
              boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)',
            },
            ':hover': {
              backgroundColor: '#f5f5f5',
            }
          }}
        >
          {models.map((model, index) => (
            <option 
              key={index} 
              value={model}
              style={{
                backgroundColor: '#fff',
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
            backgroundColor: '#fff',
            color: '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            ':focus': {
              outline: 'none',
              boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)',
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
            }
          }}
        >
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
            }
          }}
        >
          New Chat
        </button>
      </div>
    </div>
  );
};

export default ChatApp;