import React from 'react';

const ImageDisplay = ({ 
  isVisible = false, 
  imageUrl = '/api/placeholder/400/300',
  altText = 'Display image',
  width = 400,
  height = 300 
}) => {
  return (
    <div className={`transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-white rounded-xl shadow-lg max-w-md overflow-hidden">
        <div className="p-4">
          <div className="relative">
            <img 
              src={imageUrl} 
              alt={altText}
              className="w-full h-full object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            />
            
            {/* Loading state overlay */}
            <div className={`absolute inset-0 bg-gray-100 animate-pulse rounded-lg ${isVisible ? 'hidden' : 'block'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDisplay;