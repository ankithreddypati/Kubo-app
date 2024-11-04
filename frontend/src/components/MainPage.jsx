import React, { useState } from 'react';
import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import { UI } from "./UI";
import VideoChat from './VideoChat';
import { Camera, Mic, MicOff, Video, VideoOff, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import AvatarSelector from './AvatarSelector';
import KnowledgeBaseManagement from './KnowledgeBaseUI';
import AnalyticsDashboard from './AnalyticsUI';
import ChatInterface from './ChatUI';
import ImageDisplay from './ImageDisplayUI';


const MainPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedControl, setSelectedControl] = useState('configure');
  const [chatActive, setChatActive] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showModelConfig, setShowModelConfig] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isImageVisible, setIsImageVisible] = useState(false);
  
  const { 
    startChat: initiateChat, 
    endChat: terminateChat,
    selectedModel, 
    setSelectedModel 
  } = useChat();
  
  const [models, setModels] = useState({
    llm: 'gpt-3.5',
    tts: 'elevenlabs',
    stt: 'whisper',
    objectDetection: 'yolo',
    lipSync: 'wav2lip'
  });

  const modelOptions = {
    llm: ['qwen_2.5_3B_OpenVino', 'gpt-3.5-turbo-1106'],
    tts: ['melotts_OpenVino', 'elevenlabs'],
    stt: ['whisper_OpenVino', 'whisperweb_transformer.js'],
    objectDetection: ['yolov8n_OpenVino'],
    lipSync: ['customtrainedviseme']
  };

  const [agentConfig, setAgentConfig] = useState({
    name: '',
    avatarFile: null,
    selectedAvatar: 'avatar1',
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
    setShowModelConfig(false);
  };

  const handleControlClick = (control) => {
    setSelectedControl(control);
  };

  const handleModelChange = (type, value) => {
    setModels(prev => ({
      ...prev,
      [type]: value
    }));
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
    initiateChat(selectedModel);
    setChatActive(true);
    setShowModelConfig(false);
  };

  const endChat = () => {
    terminateChat();
    setChatActive(false);
  };

  const handleShowImage = (url) => {
    setImageUrl(url);
    setIsImageVisible(true);
  };
  
  const handleHideImage = () => {
    setIsImageVisible(false);
  };

  const renderAdminContent = () => {
    return (
      <div className="p-6">
        {selectedControl === 'configure' && (
          <div>
          <h2 className="text-xl font-bold mb-4">Configure AI Agent</h2>
          <form onSubmit={handleAgentConfigSubmit} className="space-y-4">
          <button
              onClick={() => setShowModelConfig(!showModelConfig)}
              className="w-full mt-2 flex items-center justify-between px-4 py-2 bg-white rounded-md hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Configure Models
              </span>
              {showModelConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showModelConfig && (
              <div className="space-y-3 bg-white p-3 rounded-md">
                <div>
                  <label className="block text-sm font-medium mb-1">Language Model</label>
                  <select
                    value={models.llm}
                    onChange={(e) => handleModelChange('llm', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {modelOptions.llm.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Text-to-Speech</label>
                  <select
                    value={models.tts}
                    onChange={(e) => handleModelChange('tts', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {modelOptions.tts.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Speech-to-Text</label>
                  <select
                    value={models.stt}
                    onChange={(e) => handleModelChange('stt', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {modelOptions.stt.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Object Detection</label>
                  <select
                    value={models.objectDetection}
                    onChange={(e) => handleModelChange('objectDetection', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {modelOptions.objectDetection.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lip Sync</label>
                  <select
                    value={models.lipSync}
                    onChange={(e) => handleModelChange('lipSync', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {modelOptions.lipSync.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <AvatarSelector
              selectedAvatar={agentConfig.selectedAvatar}
              onSelectAvatar={(avatarId) => 
                setAgentConfig(prev => ({
                  ...prev,
                  selectedAvatar: avatarId
                }))
              }
            />
          
            {/* <div>
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
            </div> */}
            {/* <div>
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
            </div> */}
            {/* <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Save Configuration
            </button> */}
          </form>
        </div>
        )}

        {selectedControl === 'knowledge' && <KnowledgeBaseManagement />}

         {selectedControl === 'analytics' && <AnalyticsDashboard/>}


        {/* {selectedControl === 'analytics' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Analytics Dashboard</h2>
            
          </div>
        )} */}
        
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-white p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Kubo: </h1>
        <h3 className="text-l mb-4">Automating Customer Experience with AI-Powered Agents</h3>
        
        {/* Admin/Customer Toggle */}
        <div className="flex items-center space-x-2 mb-4">
          <button
            className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none ${
              isAdmin ? 'bg-blue-600' : 'bg-blue-500'
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
          <div className="p-1 rounded-md bg-gradient-to-b from-[#79CBCA] to-[#77A1D3]">
          <div className="bg-white p-4 rounded-md">
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
          </div>
        ) : (
          <div className="p-1 rounded-md bg-gradient-to-b from-[#79CBCA] to-[#77A1D3]">
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Customer Support</h2>
            <p>How can we assist you today?</p>
            
            {!chatActive ? (
              <div className="space-y-4">

                <button 
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  onClick={startChat}
                >
                  Start Chat
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button 
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  onClick={endChat}
                >
                  End Chat
                </button>

                {/* Active Models Display */}
                {/* <div className="mt-2 text-sm text-gray-600 bg-white p-3 rounded-md">
                  <h3 className="font-medium mb-2">Active Models:</h3>
                  <ul className="space-y-1">
                    <li>LLM: {models.llm}</li>
                    <li>TTS: {models.tts}</li>
                    <li>STT: {models.stt}</li>
                    <li>Object Detection: {models.objectDetection}</li>
                    <li>Lip Sync: {models.lipSync}</li>
                  </ul>
                </div> */}
              </div>
            )}
            
          </div>
          </div>
        )}
        
        <ChatInterface />
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
              {/* <UI /> */}
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
              {/* <div className="flex gap-2 bg-white p-2 rounded-lg shadow-lg">
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
              </div> */}
            </div>

            {/* Add ImageDisplay component */}
            <div className="absolute bottom-4 left-4 z-10">
              <ImageDisplay 
                isVisible={isImageVisible}
                imageUrl={imageUrl}
                altText="AI Generated Image"
              />
            </div>

            {/* <div className="p-4">
              <button 
                onClick={() => setIsVisible(!isVisible)}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {isVisible ? 'Hide Image' : 'Show Image'}
              </button>

              <ImageDisplay 
                isVisible={isVisible}
                imageUrl="/api/placeholder/400/300"
                altText="Example image"
              />
            </div> */}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-gray-500">
              Click "Start Chat" to begin a conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;