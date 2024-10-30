//frontend/src/components/VideoChat.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';

const VideoChat = ({ audioEnabled, videoEnabled, onToggleAudio, onToggleVideo }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [error, setError] = useState(null);
  const { sendAudioChunk } = useChat();
  const streamRef = useRef(null);

  useEffect(() => {
    startVideo();
    
    return () => {
      stopMediaTracks();
    };
  }, []);

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Set up MediaRecorder for audio
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioChunksRef.current = [];
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1];
          sendAudioChunk(base64Audio);
        };
      };

      // Start recording in chunks
      mediaRecorderRef.current.start(1000); // Collect data every second

    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Unable to access camera/microphone. Please check permissions.');
    }
  };

  // Update stream when audio/video enabled state changes
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = videoEnabled;
      });
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = audioEnabled;
      });
    }
  }, [audioEnabled, videoEnabled]);

  return (
    <div className="relative w-full h-full">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-sm p-1 text-center">
          {error}
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-lg transform scale-x-[-1]"
      />
    </div>
  );
};

export default VideoChat;