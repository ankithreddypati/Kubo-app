import React, { useState } from 'react';
import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import { UI } from "./UI";

const MainPage = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  const [selectedControl, setSelectedControl] = useState('configure');
  const [chatActive, setChatActive] = useState(false);
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    avatarFile: null,
    voiceType: 'Male',
    personality: 'Professional',
    description: ''
  });

  const toggleView = () => {
    setIsAdmin(!isAdmin);
    setChatActive(false);
  };

  const handleControlClick = (control) => {
    setSelectedControl(control);
  };

  const handleAgentConfigChange = (e) => {
    const { name, value, type, files } = e.target;
    setAgentConfig(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleAgentConfigSubmit = (e) => {
    e.preventDefault();
    console.log('Agent config submitted:', agentConfig);
  };

  const startChat = () => {
    setChatActive(true);
  };

  const endChat = () => {
    setChatActive(false);
  };

  const renderAdminContent = () => {
    // ... (keep the existing admin content rendering logic)
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-100 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">SynapseCX: </h1>
        <h3 className="text-l mb-4">Automating Customer Experience with AI-Powered Agents</h3>
        <div className="flex items-center space-x-2 mb-4">
          <button
            className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none ${
              isAdmin ? 'bg-blue-600' : 'bg-red-500'
            }`}
            onClick={toggleView}
          >
            <span className="sr-only">Toggle admin view</span>
            <span
              className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${
                isAdmin ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="font-medium">
            {isAdmin ? 'Admin' : 'Customer'}
          </span>
        </div>
        
        {isAdmin ? (
          <div className="bg-blue-100 p-4 rounded-md mb-4">
            <h2 className="text-lg font-semibold mb-2">Admin Controls</h2>
            <ul className="space-y-2">
              <li>
                <button 
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedControl === 'configure' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
                  onClick={() => handleControlClick('configure')}
                >
                  Configure AI Agent
                </button>
              </li>  
              <li>
                <button 
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedControl === 'knowledge' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
                  onClick={() => handleControlClick('knowledge')}
                >
                  Manage Knowledge Base
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedControl === 'analytics' ? 'bg-blue-200' : 'hover:bg-blue-200'}`}
                  onClick={() => handleControlClick('analytics')}
                >
                  View Analytics
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div> 
            <div className="bg-red-100 p-4 rounded-md mb-4">
              <h2 className="text-lg font-semibold mb-2">Customer Support</h2>
              <p>How can we assist you today?</p>
              {!chatActive ? (
                <button 
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                  onClick={startChat}
                >
                  Start Chat
                </button>
              ) : (
                <button 
                  className="mt-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  onClick={endChat}
                >
                  End Chat
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="w-3/4 relative p-4">
        {isAdmin ? (
          renderAdminContent()
        ) : chatActive ? (
          <>
            <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
              <Experience />
            </Canvas>
            <div className="absolute inset-0 pointer-events-none">
              <UI />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-gray-500"></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;