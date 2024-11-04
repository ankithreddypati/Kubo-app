// import React from 'react';
// import { Canvas } from "@react-three/fiber";
// import Avatar from './Avatar';
// import GuyAvatar from './guyAvatar';
// // import Avatar2 from './Avatar2';

// const AvatarPreviewCanvas = ({ children }) => (
//   <Canvas
//     shadows
//     camera={{ position: [0, 1 , 5, 0, 1.6, 0], fov: 40}}
//     className="w-full h-full"
//   >
//     <ambientLight intensity={0.5} />
//     <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
//     {children}
//   </Canvas>
// );

// const AvatarSelector = ({ selectedAvatar, onSelectAvatar }) => {
//   const avatarOptions = [
//     { id: 'avatar1', component: Avatar, label: 'Avatar 1' },
//     { id: 'guyAvatar', component: GuyAvatar, label: 'Guy Avatar' },
//     // { id: 'avatar2', component: Avatar2, label: 'Avatar 2' }
//   ];

//   return (
//     <div className="space-y-2">
//       <label className="block text-sm font-medium mb-1">Select Avatar</label>
//       <div className="grid grid-cols-3 gap-4">
//         {avatarOptions.map(({ id, component: AvatarComponent, label }) => (
//           <div
//             key={id}
//             className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
//               selectedAvatar === id
//                 ? 'border-blue-500 shadow-lg'
//                 : 'border-gray-200 hover:border-blue-300'
//             }`}
//             onClick={() => onSelectAvatar(id)}
//           >
//             <div className="absolute inset-0 flex items-center justify-center">
//               <AvatarPreviewCanvas>
//                 <AvatarComponent />
//               </AvatarPreviewCanvas>
//             </div>
//             <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center text-sm">
//               {label}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AvatarSelector;

import React from 'react';
import { Canvas } from "@react-three/fiber";
import Avatar from './Avatar';
import GuyAvatar from './guyAvatar';
import Woman2avatar from './womanAvatar';

const AvatarPreviewCanvas = ({ children }) => (
  <Canvas
    shadows
    camera={{ 
      position: [0, 1, 3], // Moved camera closer and at head height
      fov: 35 // Reduced FOV for more telephoto/zoomed in look
    }}
    className="w-full h-full"
  >
    <ambientLight intensity={0.5} />
    <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
    <group position={[0, -1, 0]}> {/* Move avatar down to center in frame */}
      {children}
    </group>
  </Canvas>
);

const AvatarSelector = ({ selectedAvatar, onSelectAvatar }) => {
  const avatarOptions = [
    { id: 'avatar1', component: Avatar, label: 'Ava' },
    { id: 'guyAvatar', component: GuyAvatar, label: 'Kai' },
    { id: 'womanAvatar', component: Woman2avatar, label: 'Ash' }
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-1">Select Avatar</label>
      <div className="grid grid-cols-3 gap-4"> {/* Changed to 2 columns since we have 2 avatars */}
        {avatarOptions.map(({ id, component: AvatarComponent, label }) => (
          <div
            key={id}
            className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
              selectedAvatar === id
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => onSelectAvatar(id)}
          >
            <div className="absolute inset-0">
              <AvatarPreviewCanvas>
                <AvatarComponent />
              </AvatarPreviewCanvas>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center text-sm">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;