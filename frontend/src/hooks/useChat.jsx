// //frontend/src/hooks/useChat.jsx
// import { createContext, useContext, useEffect, useState } from "react";

// const backendUrl = "http://localhost:3000";

// const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const chat = async (message) => {
//     setLoading(true);
//     const data = await fetch(`${backendUrl}/chat`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ message }),
//     });
//     const resp = (await data.json()).messages;
//     setMessages((messages) => [...messages, ...resp]);
//     setLoading(false);
//   };
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState();
//   const [loading, setLoading] = useState(false);
//   const [cameraZoomed, setCameraZoomed] = useState(true);
//   const onMessagePlayed = () => {
//     setMessages((messages) => messages.slice(1));
//   };

//   useEffect(() => {
//     if (messages.length > 0) {
//       setMessage(messages[0]);
//     } else {
//       setMessage(null);
//     }
//   }, [messages]);

//   return (
//     <ChatContext.Provider
//       value={{
//         chat,
//         message,
//         onMessagePlayed,
//         loading,
//         cameraZoomed,
//         setCameraZoomed,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChat = () => {
//   const context = useContext(ChatContext);
//   if (!context) {
//     throw new Error("useChat must be used within a ChatProvider");
//   }
//   return context;
// };
// src/hooks/useChat.jsx
// src/hooks/useChat.jsx
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

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    wsRef.current = new WebSocket('ws://localhost:3000');
    
    wsRef.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      const response = JSON.parse(event.data);
      setMessages(prev => [...prev, ...response.messages]);
      setLoading(false);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const startChat = useCallback(() => {
    setIsChatActive(true);
    connectWebSocket();
  }, [connectWebSocket]);

  const endChat = useCallback(() => {
    setIsChatActive(false);
    disconnectWebSocket();
    setMessages([]);
    setMessage(null);
  }, [disconnectWebSocket]);

  // In your useChat hook, update the chat function:

const chat = useCallback(async (message) => {
  if (!message?.trim()) return;
  
  setLoading(true);
  try {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'chat',
        message,
        history: [], // Add conversation history if needed
        timestamp: Date.now()
      }));
    } else {
      const data = await fetch('http://localhost:3000/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const resp = (await data.json()).messages;
      setMessages(prev => [...prev, ...resp]);
      setLoading(false);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    setLoading(false);
  }
}, []);

  const sendAudioChunk = (audioChunk) => {
    if (!isChatActive) return;
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        audioChunk,
        type: 'audio',
        timestamp: new Date().toISOString()
      }));
    }
  };

  const onMessagePlayed = () => {
    setMessages(messages => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        wsRef,
        isConnected,
        sendAudioChunk,
        startChat,
        endChat,
        isChatActive
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