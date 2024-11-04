// import React, { useRef } from 'react';
// import { useChat } from '../hooks/useChat';

// const ChatInterface = () => {
//   const { 
//     chat, 
//     message, 
//     loading,
//     isChatActive 
//   } = useChat();
  
//   const input = useRef(null);

//   const sendMessage = () => {
//     if (!input.current?.value.trim() || loading) return;
    
//     chat(input.current.value);
//     input.current.value = '';
//   };

//   if (!isChatActive) return null;

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Messages container */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {message && (
//           <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//             <div className={`max-w-[70%] rounded-lg p-3 ${
//               message.role === 'user' 
//                 ? 'bg-blue-500 text-white' 
//                 : 'bg-gray-100 text-gray-800'
//             }`}>
//               <p>{message.content}</p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Input container */}
//       <div className="w-full flex items-center gap-2 p-4">
//         <input
//           className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-gray-100"
//           placeholder="Type a message..."
//           ref={input}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               sendMessage();
//             }
//           }}
//         />
//         <button
//           disabled={loading}
//           onClick={sendMessage}
//           className={`bg-blue-500 hover:bg-blue-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
//             loading ? "cursor-not-allowed opacity-30" : ""
//           }`}
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatInterface;

import React, { useRef, useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

const ChatInterface = () => {
  const { 
    loading,
    isChatActive,
    chat,
    websocket
  } = useChat();
  
  const [messages, setMessages] = useState([]);
  const input = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        // Assuming the conversation ID is stored somewhere (e.g., in useChat hook or URL)
        const conversationId = websocket?.conversationId;
        if (!conversationId) return;

        const response = await fetch(`/api/conversations/${conversationId}/history`);
        const data = await response.json();
        
        // Transform database messages to match the UI format
        const formattedMessages = data.chatHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
          facialExpression: msg.metadata?.facialExpression || 'default',
          animation: msg.metadata?.animation || 'Idle',
          audio: msg.audio,
          lipsync: msg.lipsync
        }));
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [websocket?.conversationId]);

  // Handle new messages from WebSocket
  useEffect(() => {
    if (!websocket) return;

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.messages) {
        setMessages(prevMessages => [...prevMessages, ...data.messages.map(msg => ({
          role: 'assistant',
          content: msg.text,
          facialExpression: msg.facialExpression,
          animation: msg.animation,
          audio: msg.audio,
          lipsync: msg.lipsync
        }))]);
      }
    };
  }, [websocket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!input.current?.value.trim() || loading) return;
    
    const userMessage = input.current.value;
    // Add user message to UI immediately
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage
    }]);
    
    chat(userMessage);
    input.current.value = '';
  };

  if (!isChatActive) return null;

  return (
    <div className="flex flex-col h-screen">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] rounded-lg p-3 ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="whitespace-pre-wrap">{message.role === 'user' ? message.content : message.text || message.content}</p>
              {message.audio && (
                <audio 
                  controls 
                  className="mt-2 w-full"
                  onEnded={() => {
                    if (websocket) {
                      websocket.send(JSON.stringify({ type: 'audioComplete' }));
                    }
                  }}
                >
                  <source src={`data:audio/wav;base64,${message.audio}`} type="audio/wav" />
                </audio>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input container */}
      <div className="w-full flex items-center gap-2 p-4 border-t border-gray-200">
        <input
          className="w-full p-4 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          ref={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button
          disabled={loading}
          onClick={sendMessage}
          className={`bg-blue-500 hover:bg-blue-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
            loading ? "cursor-not-allowed opacity-30" : ""
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;