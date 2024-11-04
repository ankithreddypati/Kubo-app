// //frontend/src/components/VideoChat.jsx

// import React, { useEffect, useRef, useState } from 'react';
// import { useChat } from '../hooks/useChat';
// import { Mic, MicOff, Camera } from 'lucide-react';

// const VideoChat = ({ audioEnabled = true, videoEnabled = true }) => {
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);
//   const vadRef = useRef(null);
//   const { sendAudioChunk, isChatActive, message, sendProductImage } = useChat();  // Added sendProductImage
//   const [isRecording, setIsRecording] = useState(false);
//   const [error, setError] = useState(null);
//   const [isVadInitialized, setIsVadInitialized] = useState(false);
//   const [localAudioEnabled, setLocalAudioEnabled] = useState(audioEnabled);
//   const [localVideoEnabled, setLocalVideoEnabled] = useState(videoEnabled);
//   const [isAIPlaying, setIsAIPlaying] = useState(false);
//   // New states for product detection
//   const [isCapturing, setIsCapturing] = useState(false);
//   const captureCountRef = useRef(0);
//   const captureIntervalRef = useRef(null);
//   const MAX_CAPTURES = 10;
//   const CAPTURE_INTERVAL = 300;

//   // Force audio and video off when chat becomes inactive
//   useEffect(() => {
//     if (!isChatActive) {
//       setLocalAudioEnabled(false);
//       setLocalVideoEnabled(false);
//       stopMedia();
//     } else {
//       setLocalAudioEnabled(audioEnabled);
//       setLocalVideoEnabled(videoEnabled);
//     }
//   }, [isChatActive]);

//   // Effect to handle AI message playback
//   useEffect(() => {
//     if (message?.audio) {
//       setIsAIPlaying(true);
//       if (vadRef.current && isVadInitialized) {
//         vadRef.current.pause();
//       }
//     } else {
//       setIsAIPlaying(false);
//       if (vadRef.current && isVadInitialized && localAudioEnabled) {
//         vadRef.current.start();
//       }
//     }
//   }, [message]);

//   // Update local states when props change
//   useEffect(() => {
//     if (isChatActive) {
//       setLocalAudioEnabled(audioEnabled);
//       setLocalVideoEnabled(videoEnabled);
//     }
//   }, [audioEnabled, videoEnabled]);

//   // Cleanup function to stop all media tracks and VAD
//   const stopMedia = async () => {
//     try {
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach(track => {
//           track.stop();
//           track.enabled = false;
//         });
//         streamRef.current = null;
//       }

//       if (vadRef.current) {
//         await vadRef.current.pause();
//         vadRef.current = null;
//       }

//       if (videoRef.current) {
//         videoRef.current.srcObject = null;
//       }

//       setIsRecording(false);
//       setIsVadInitialized(false);
//     } catch (err) {
//       console.error('Error stopping media:', err);
//     }
//   };

//   // Start media stream and VAD
//   const startMedia = async () => {
//     if (!isChatActive) return;

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: localVideoEnabled,
//         audio: localAudioEnabled ? {
//           echoCancellation: true,
//           noiseSuppression: true,
//           sampleRate: 16000,
//           channelCount: 1
//         } : false
//       });
      
//       streamRef.current = stream;
      
//       if (videoRef.current && localVideoEnabled) {
//         videoRef.current.srcObject = stream;
//       }

//       if (localAudioEnabled && isChatActive && typeof window.vadit === 'function') {
//         vadRef.current = await window.vadit(
//           () => {
//             if (isChatActive && localAudioEnabled) {
//               console.log('Speech started');
//               setIsRecording(true);
//             }
//           },
//           (audioBlob) => {
//             console.log('Speech ended, blob size:', audioBlob.size);
//             setIsRecording(false);
            
//             if (isChatActive && localAudioEnabled && !isAIPlaying) {
//               sendAudioChunk(audioBlob);
//             }
//           }
//         );
        
//         if (localAudioEnabled && !isAIPlaying) {
//           await vadRef.current.start();
//           setIsVadInitialized(true);
//         }
//       }

//     } catch (err) {
//       console.error('Error accessing media devices:', err);
//       setError('Unable to access camera/microphone. Please check permissions.');
//     }
//   };

//   // Handle initial setup and cleanup
//   useEffect(() => {
//     if (isChatActive) {
//       startMedia();
//     }
//     return () => {
//       stopMedia();
//       stopProductDetection(); // Clean up product detection
//     };
//   }, [isChatActive]);

//   // Handle media track updates
//   useEffect(() => {
//     if (streamRef.current && isChatActive) {
//       streamRef.current.getVideoTracks().forEach(track => {
//         track.enabled = localVideoEnabled;
//       });

//       streamRef.current.getAudioTracks().forEach(track => {
//         track.enabled = localAudioEnabled;
//       });

//       if (vadRef.current && isVadInitialized) {
//         if (localAudioEnabled) {
//           vadRef.current.start();
//         } else {
//           vadRef.current.pause();
//           setIsRecording(false);
//         }
//       }
//     }
//   }, [localAudioEnabled, localVideoEnabled]);

//   // New function for capturing frames for product detection
//   const captureFrame = () => {
//     if (!videoRef.current || !streamRef.current) return null;

//     const canvas = document.createElement('canvas');
//     canvas.width = 640;  // YOLO model input size
//     canvas.height = 640;
//     const ctx = canvas.getContext('2d');

//     // Fill with white background
//     ctx.fillStyle = '#FFFFFF';
//     ctx.fillRect(0, 0, 640, 640);

//     // Calculate scaling to maintain aspect ratio
//     const videoAspect = videoRef.current.videoWidth / videoRef.current.videoHeight;
//     let renderWidth = 640;
//     let renderHeight = 640;
//     let offsetX = 0;
//     let offsetY = 0;

//     if (videoAspect > 1) {
//       renderHeight = 640 / videoAspect;
//       offsetY = (640 - renderHeight) / 2;
//     } else {
//       renderWidth = 640 * videoAspect;
//       offsetX = (640 - renderWidth) / 2;
//     }

//     // Draw video frame centered
//     ctx.scale(-1, 1); // Mirror the image
//     ctx.translate(-canvas.width, 0);
//     ctx.drawImage(videoRef.current, 
//       offsetX, offsetY, 
//       renderWidth, renderHeight
//     );

//     return canvas.toDataURL('image/jpeg', 0.85);
//   };

//   // Start product detection process
//   const startProductDetection = () => {
//     setIsCapturing(true);
//     captureCountRef.current = 0;

//     captureIntervalRef.current = setInterval(() => {
//       if (captureCountRef.current >= MAX_CAPTURES) {
//         stopProductDetection();
//         return;
//       }

//       const imageBase64 = captureFrame();
//       if (imageBase64) {
//         captureCountRef.current++;
//         // Send to WebSocket through useChat hook
//         sendProductImage(imageBase64);
//       }
//     }, CAPTURE_INTERVAL);
//   };

//   // Stop product detection
//   const stopProductDetection = () => {
//     setIsCapturing(false);
//     if (captureIntervalRef.current) {
//       clearInterval(captureIntervalRef.current);
//       captureIntervalRef.current = null;
//     }
//     captureCountRef.current = 0;
//   };

//   if (!isChatActive) {
//     return null;
//   }

//   return (
//     <div className="relative w-full h-full">
//       {error && (
//         <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
//           {error}
//         </div>
//       )}

//       {localVideoEnabled && (
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="w-full h-full object-cover rounded-lg transform scale-x-[-1]"
//         />
//       )}

//       {localAudioEnabled && (
//         <div className={`absolute bottom-4 right-4 p-2 rounded-full transition-colors duration-300 ${
//           isRecording ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
//         }`}>
//           {isRecording ? (
//             <Mic className="w-6 h-6 text-white" />
//           ) : (
//             <MicOff className="w-6 h-6 text-white" />
//           )}
//         </div>
//       )}

//       {/* New Product Detection Button */}
//       {localVideoEnabled && (
//         <button
//           onClick={() => {
//             if (isCapturing) {
//               stopProductDetection();
//             } else {
//               startProductDetection();
//             }
//           }}
//           className={`absolute bottom-4 left-4 p-2 rounded-full transition-colors ${
//             isCapturing 
//               ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
//               : 'bg-blue-500 hover:bg-blue-600'
//           }`}
//           disabled={!isChatActive}
//         >
//           <Camera className="w-6 h-6 text-white" />
//           {isCapturing && (
//             <div className="absolute -top-2 -right-2 bg-white text-xs rounded-full w-5 h-5 flex items-center justify-center text-red-500">
//               {captureCountRef.current}/{MAX_CAPTURES}
//             </div>
//           )}
//         </button>
//       )}
//     </div>
//   );
// };

// export default VideoChat;

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import { Mic, MicOff, Camera, Loader } from 'lucide-react';

const VideoChat = ({ audioEnabled = true, videoEnabled = true }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const vadRef = useRef(null);
  const { 
    sendAudioChunk, 
    isChatActive, 
    message, 
    sendProductImage, 
    isDetectingProduct 
  } = useChat();
  
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [isVadInitialized, setIsVadInitialized] = useState(false);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(audioEnabled);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(videoEnabled);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const captureCountRef = useRef(0);
  const captureIntervalRef = useRef(null);
  const MAX_CAPTURES = 10;
  const CAPTURE_INTERVAL = 300;

  // Force audio and video off when chat becomes inactive
  useEffect(() => {
    if (!isChatActive) {
      setLocalAudioEnabled(false);
      setLocalVideoEnabled(false);
      stopMedia();
    } else {
      setLocalAudioEnabled(audioEnabled);
      setLocalVideoEnabled(videoEnabled);
    }
  }, [isChatActive, audioEnabled, videoEnabled]);

  // Effect to handle AI message playback
  useEffect(() => {
    if (message?.audio) {
      setIsAIPlaying(true);
      if (vadRef.current && isVadInitialized) {
        vadRef.current.pause();
      }
    } else {
      setIsAIPlaying(false);
      if (vadRef.current && isVadInitialized && localAudioEnabled) {
        vadRef.current.start();
      }
    }
  }, [message, isVadInitialized, localAudioEnabled]);

  // Update local states when props change
  useEffect(() => {
    if (isChatActive) {
      setLocalAudioEnabled(audioEnabled);
      setLocalVideoEnabled(videoEnabled);
    }
  }, [audioEnabled, videoEnabled, isChatActive]);

  // Cleanup function to stop all media tracks and VAD
  const stopMedia = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        streamRef.current = null;
      }

      if (vadRef.current) {
        await vadRef.current.pause();
        vadRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setIsRecording(false);
      setIsVadInitialized(false);
    } catch (err) {
      console.error('Error stopping media:', err);
      setError('Error stopping media devices');
    }
  };

  // Start media stream and VAD
  const startMedia = async () => {
    if (!isChatActive) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: localVideoEnabled,
        audio: localAudioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        } : false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current && localVideoEnabled) {
        videoRef.current.srcObject = stream;
      }

      if (localAudioEnabled && isChatActive && typeof window.vadit === 'function') {
        vadRef.current = await window.vadit(
          () => {
            if (isChatActive && localAudioEnabled) {
              console.log('Speech started');
              setIsRecording(true);
            }
          },
          (audioBlob) => {
            console.log('Speech ended, blob size:', audioBlob.size);
            setIsRecording(false);
            
            if (isChatActive && localAudioEnabled && !isAIPlaying) {
              sendAudioChunk(audioBlob);
            }
          }
        );
        
        if (localAudioEnabled && !isAIPlaying) {
          await vadRef.current.start();
          setIsVadInitialized(true);
        }
      }

    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Unable to access camera/microphone. Please check permissions.');
    }
  };

  // Handle initial setup and cleanup
  useEffect(() => {
    if (isChatActive) {
      startMedia();
    }
    return () => {
      stopMedia();
      stopProductDetection();
    };
  }, [isChatActive]);

  // Handle media track updates
  useEffect(() => {
    if (streamRef.current && isChatActive) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = localVideoEnabled;
      });

      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = localAudioEnabled;
      });

      if (vadRef.current && isVadInitialized) {
        if (localAudioEnabled) {
          vadRef.current.start();
        } else {
          vadRef.current.pause();
          setIsRecording(false);
        }
      }
    }
  }, [localAudioEnabled, localVideoEnabled, isChatActive, isVadInitialized]);

  // Capture frame for product detection
  const captureFrame = () => {
    if (!videoRef.current || !streamRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 640;  // YOLO model input size
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 640, 640);

    // Calculate scaling to maintain aspect ratio
    const videoAspect = videoRef.current.videoWidth / videoRef.current.videoHeight;
    let renderWidth = 640;
    let renderHeight = 640;
    let offsetX = 0;
    let offsetY = 0;

    if (videoAspect > 1) {
      renderHeight = 640 / videoAspect;
      offsetY = (640 - renderHeight) / 2;
    } else {
      renderWidth = 640 * videoAspect;
      offsetX = (640 - renderWidth) / 2;
    }

    // Draw video frame centered
    ctx.scale(-1, 1); // Mirror the image
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(videoRef.current, 
      offsetX, offsetY, 
      renderWidth, renderHeight
    );

    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Start product detection process
  const startProductDetection = () => {
    if (!isChatActive || isDetectingProduct) return;

    setIsCapturing(true);
    captureCountRef.current = 0;

    captureIntervalRef.current = setInterval(() => {
      if (captureCountRef.current >= MAX_CAPTURES) {
        stopProductDetection();
        return;
      }

      const imageBase64 = captureFrame();
      if (imageBase64) {
        captureCountRef.current++;
        sendProductImage(imageBase64);
      }
    }, CAPTURE_INTERVAL);
  };

  // Stop product detection
  const stopProductDetection = () => {
    setIsCapturing(false);
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    captureCountRef.current = 0;
  };

  // Error effect cleanup
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isChatActive) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
          {error}
        </div>
      )}

      {localVideoEnabled && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover rounded-lg transform scale-x-[-1] transition-all duration-300 ${
            isDetectingProduct ? 'brightness-75' : ''
          }`}
        />
      )}

      {localAudioEnabled && (
        <div className={`absolute bottom-4 right-4 p-2 rounded-full transition-colors duration-300 ${
          isRecording ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
        }`}>
          {isRecording ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
        </div>
      )}

      {localVideoEnabled && (
        <button
          onClick={() => {
            if (isCapturing) {
              stopProductDetection();
            } else {
              startProductDetection();
            }
          }}
          className={`absolute bottom-4 left-4 p-2 rounded-full transition-all duration-300 ${
            isCapturing 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          disabled={!isChatActive || isDetectingProduct}
          title={isDetectingProduct ? "Processing..." : "Detect Product"}
        >
          {isDetectingProduct ? (
            <Loader className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
          {isCapturing && !isDetectingProduct && (
            <div className="absolute -top-2 -right-2 bg-white text-xs rounded-full w-5 h-5 flex items-center justify-center text-red-500 shadow-sm">
              {captureCountRef.current}/{MAX_CAPTURES}
            </div>
          )}
        </button>
      )}

      {isDetectingProduct && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-4 flex flex-col items-center space-y-2 shadow-lg">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-gray-700">Analyzing product...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChat;