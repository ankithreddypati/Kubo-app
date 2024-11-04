import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai');
  const [conversationId, setConversationId] = useState(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const audioPlaybackRef = useRef(null);
  const [isDetectingProduct, setIsDetectingProduct] = useState(false);

  const connectWebSocket = useCallback((modelType = 'openai') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    wsRef.current = new WebSocket('ws://localhost:3000');
    
    wsRef.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
      wsRef.current.send(JSON.stringify({
        type: 'config',
        model: modelType
      }));
    };

    wsRef.current.onmessage = async (event) => {
      const response = JSON.parse(event.data);
      console.log('WebSocket message received:', response);

      // Handle new conversation ID
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }
      
      // Handle chat messages
      if (response.messages) {
        setIsAIPlaying(true);
        const processedMessages = response.messages.map(msg => ({
          ...msg,
          played: false
        }));
        setMessages(prev => [...prev, ...processedMessages]);
        setLoading(false);
      }

      // Handle product detection results
      if (response.type === 'product_detection_result') {
        setIsDetectingProduct(false);
        if (response.success) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            text: response.content,
            facialExpression: response.artifact?.facialExpression || 'smile',
            animation: response.artifact?.animation || 'Excited',
            productInfo: response.artifact?.productInfo
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            text: response.content,
            facialExpression: response.artifact?.facialExpression || 'concerned',
            animation: response.artifact?.animation || 'Thinking'
          }]);
        }
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      setConversationId(null);
      setIsAIPlaying(false);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      setConversationId(null);
      setIsAIPlaying(false);
    };
  }, [conversationId]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      setConversationId(null);
      setIsAIPlaying(false);
    }
  }, []);

  const startChat = useCallback((modelType = 'openai') => {
    setIsChatActive(true);
    setSelectedModel(modelType);
    connectWebSocket(modelType);
  }, [connectWebSocket]);

  const endChat = useCallback(() => {
    setIsChatActive(false);
    disconnectWebSocket();
    setMessages([]);
    setMessage(null);
    setConversationId(null);
    setIsAIPlaying(false);
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
      audioPlaybackRef.current = null;
    }
  }, [disconnectWebSocket]);

  // Send regular chat messages
  const chat = useCallback(async (message) => {
    if (!message?.trim()) return;
    
    setLoading(true);
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ 
          type: 'chat',
          message,
          model: selectedModel,
          conversationId: conversationId,
          timestamp: Date.now()
        }));
      } else {
        throw new Error('WebSocket not connected');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    }
  }, [selectedModel, conversationId]);

  // Send audio for transcription
  const sendAudioChunk = useCallback(async (audioBlob) => {
    if (!isChatActive || wsRef.current?.readyState !== WebSocket.OPEN || isAIPlaying) return;
    
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('temperature', '0.0');
      formData.append('temperature_inc', '0.2');
      formData.append('response_format', 'json');

      const response = await fetch('http://localhost:8181/inference', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Transcription:', data);

      if (data.text && data.text.trim()) {
        wsRef.current.send(JSON.stringify({
          type: 'audio',
          transcription: data.text.trim(),
          conversationId: conversationId,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  }, [isChatActive, isAIPlaying, conversationId]);

  // Send product detection images
  const sendProductImage = useCallback(async (imageBase64) => {
    if (!wsRef.current?.readyState === WebSocket.OPEN || !conversationId) {
      console.error('WebSocket not connected or no conversation ID');
      return;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'product_detection',
        imageBase64,
        conversationId,
        timestamp: Date.now()
      }));
      
      setIsDetectingProduct(true);
    } catch (error) {
      console.error('Error sending product image:', error);
      setIsDetectingProduct(false);
    }
  }, [conversationId]);

  const onMessagePlayed = useCallback(() => {
    setMessages(prevMessages => {
      if (prevMessages.length === 0) {
        setIsAIPlaying(false);
        return prevMessages;
      }
      
      const newMessages = prevMessages.slice(1);
      if (newMessages.length === 0) {
        setIsAIPlaying(false);
      }
      return newMessages;
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
      setIsAIPlaying(false);
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      disconnectWebSocket();
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
        audioPlaybackRef.current = null;
      }
    };
  }, [disconnectWebSocket]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        messages,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        wsRef,
        isConnected,
        sendAudioChunk,
        sendProductImage,
        startChat,
        endChat,
        isChatActive,
        selectedModel,
        setSelectedModel,
        conversationId,
        isAIPlaying,
        isDetectingProduct,
        audioPlaybackRef
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};