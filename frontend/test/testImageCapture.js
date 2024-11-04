import React, { useRef } from 'react';

export const testImageCapture = async (videoRef) => {
  if (!videoRef.current || !videoRef.current.captureAndSendImage) {
    console.error('Video reference or capture function not available');
    return;
  }

  try {
    // Capture image and get result
    const result = await videoRef.current.captureAndSendImage();
    
    // For local testing: Also save the image locally
    if (result) {
      // Get the image data from the video element
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const context = canvas.getContext('2d');
      context.scale(-1, 1);
      context.translate(-canvas.width, 0);
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Create a download link
      const link = document.createElement('a');
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `test-capture-${new Date().toISOString()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.8);
    }

    return result;
  } catch (error) {
    console.error('Test capture failed:', error);
    return null;
  }
};

// Example usage in a test component
const TestCapture = () => {
  const videoRef = useRef(null);

  const runTest = async () => {
    console.log('Running capture test...');
    const result = await testImageCapture(videoRef);
    console.log('Test result:', result);
  };

  // You can trigger this test from browser console with window.runCaptureTest()
  React.useEffect(() => {
    window.runCaptureTest = runTest;
  }, []);

  return (
    <div>
      <h1>Image Capture Test</h1>
      <div className="w-full max-w-2xl mx-auto h-[600px]">
        <VideoChat ref={videoRef} videoEnabled={true} audioEnabled={false} />
      </div>
      <button 
        onClick={runTest}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Capture
      </button>
    </div>
  );
};

export default TestCapture;