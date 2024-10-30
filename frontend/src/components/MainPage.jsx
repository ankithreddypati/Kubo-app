import React, { useState } from 'react';
import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import { UI } from "./UI";
import VideoChat from './VideoChat';
import { Camera, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useChat } from '../hooks/useChat';

const MainPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedControl, setSelectedControl] = useState('configure');
  const [chatActive, setChatActive] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const { startChat: initiateChat, endChat: terminateChat } = useChat();
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    avatarFile: null,
    voiceType: 'Male',
    personality: 'Professional',
    description: ''
  });

  const toggleView = () => {
    if (chatActive) {
      terminateChat();
    }
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
    initiateChat(); // Initialize WebSocket connection
    setChatActive(true);
  };

  const endChat = () => {
    terminateChat(); // Close WebSocket connection
    setChatActive(false);
  };

  const renderAdminContent = () => {
    return (
      <div className="p-6">
        {selectedControl === 'configure' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Configure AI Agent</h2>
            <form onSubmit={handleAgentConfigSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Agent Name</label>
                <input
                  type="text"
                  name="name"
                  value={agentConfig.name}
                  onChange={handleAgentConfigChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Avatar</label>
                <input
                  type="file"
                  name="avatarFile"
                  onChange={handleAgentConfigChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Voice Type</label>
                <select
                  name="voiceType"
                  value={agentConfig.voiceType}
                  onChange={handleAgentConfigChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Personality</label>
                <select
                  name="personality"
                  value={agentConfig.personality}
                  onChange={handleAgentConfigChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Casual">Casual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={agentConfig.description}
                  onChange={handleAgentConfigChange}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Save Configuration
              </button>
            </form>
          </div>
        )}

        {selectedControl === 'knowledge' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Knowledge Base Management</h2>
            {/* Add knowledge base management UI here */}
          </div>
        )}

        {selectedControl === 'analytics' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Analytics Dashboard</h2>
            {/* Add analytics dashboard UI here */}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">SynapseCX: </h1>
        <h3 className="text-l mb-4">Automating Customer Experience with AI-Powered Agents</h3>
        
        {/* Admin/Customer Toggle */}
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

        {/* Admin Controls or Customer Support */}
        {isAdmin ? (
          <div className="bg-blue-100 p-4 rounded-md mb-4">
            <h2 className="text-lg font-semibold mb-2">Admin Controls</h2>
            <ul className="space-y-2">
              <li>
                <button 
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedControl === 'configure' ? 'bg-blue-200' : 'hover:bg-blue-200'
                  }`}
                  onClick={() => handleControlClick('configure')}
                >
                  Configure AI Agent
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedControl === 'knowledge' ? 'bg-blue-200' : 'hover:bg-blue-200'
                  }`}
                  onClick={() => handleControlClick('knowledge')}
                >
                  Manage Knowledge Base
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedControl === 'analytics' ? 'bg-blue-200' : 'hover:bg-blue-200'
                  }`}
                  onClick={() => handleControlClick('analytics')}
                >
                  View Analytics
                </button>
              </li>
            </ul>
          </div>
        ) : (
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
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-3/4 relative">
        {isAdmin ? (
          renderAdminContent()
        ) : chatActive ? (
          <div className="relative w-full h-full">
            {/* 3D Avatar Canvas */}
            <div className="absolute inset-0">
              <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
                <Experience />
              </Canvas>
              <UI />
            </div>

            {/* Video Chat Interface */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-4">
              {/* Video Preview */}
              <div className="w-64 h-48 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                <VideoChat 
                  audioEnabled={audioEnabled}
                  videoEnabled={videoEnabled}
                />
              </div>

              {/* Video Controls */}
              <div className="flex gap-2 bg-white p-2 rounded-lg shadow-lg">
                <button
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className={`p-2 rounded-full ${
                    videoEnabled ? 'bg-blue-500' : 'bg-red-500'
                  } text-white`}
                >
                  {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`p-2 rounded-full ${
                    audioEnabled ? 'bg-blue-500' : 'bg-red-500'
                  } text-white`}
                >
                  {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-gray-500">Click "Start Chat" to begin a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;