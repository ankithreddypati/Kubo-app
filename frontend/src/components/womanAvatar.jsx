// import React, { useRef, useState, useEffect } from 'react'
// import { useGLTF, useAnimations } from '@react-three/drei'

// export function Woman2avatar(props) {
//   const group = useRef();
//   const { nodes, materials } = useGLTF('/models/6734eaada9f588f6f4ee0117.glb')
//   const { animations } = useGLTF('/models/woman2animation.glb');

//   const { actions } = useAnimations(animations, group);
//   const [animation] = useState("HappyIdle");

//   useEffect(() => {
//     console.log(animations, actions);
//     // Make sure we have actions and the specific animation exists
//     if (actions && actions[animation]) {
//       const action = actions[animation];
      
//       // Reset and play the animation
//       action
//         .reset()
//         .setEffectiveWeight(1)
//         .setEffectiveTimeScale(1)
//         .play();
//     }

//     return () => {
//       if (actions && actions[animation]) {
//         actions[animation].stop();
//       }
//     };
//   }, [animation, actions]);

//   return (
//     <group {...props} dispose={null}>
//       <primitive object={nodes.Hips} />
//       <skinnedMesh
//         name="EyeLeft"
//         geometry={nodes.EyeLeft.geometry}
//         material={materials.Wolf3D_Eye}
//         skeleton={nodes.EyeLeft.skeleton}
//         morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
//         morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
//       />
//       <skinnedMesh
//         name="EyeRight"
//         geometry={nodes.EyeRight.geometry}
//         material={materials.Wolf3D_Eye}
//         skeleton={nodes.EyeRight.skeleton}
//         morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
//         morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
//       />
//       <skinnedMesh
//         name="Wolf3D_Head"
//         geometry={nodes.Wolf3D_Head.geometry}
//         material={materials.Wolf3D_Skin}
//         skeleton={nodes.Wolf3D_Head.skeleton}
//         morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
//         morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
//       />
//       <skinnedMesh
//         name="Wolf3D_Teeth"
//         geometry={nodes.Wolf3D_Teeth.geometry}
//         material={materials.Wolf3D_Teeth}
//         skeleton={nodes.Wolf3D_Teeth.skeleton}
//         morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
//         morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
//       />
//       <skinnedMesh
//         geometry={nodes.Wolf3D_Hair.geometry}
//         material={materials.Wolf3D_Hair}
//         skeleton={nodes.Wolf3D_Hair.skeleton}
//       />
//       <skinnedMesh
//         geometry={nodes.Wolf3D_Body.geometry}
//         material={materials.Wolf3D_Body}
//         skeleton={nodes.Wolf3D_Body.skeleton}
//       />
//       <skinnedMesh
//         geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
//         material={materials.Wolf3D_Outfit_Bottom}
//         skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
//       />
//       <skinnedMesh
//         geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
//         material={materials.Wolf3D_Outfit_Footwear}
//         skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
//       />
//       <skinnedMesh
//         geometry={nodes.Wolf3D_Outfit_Top.geometry}
//         material={materials.Wolf3D_Outfit_Top}
//         skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
//       />
//     </group>
//   )
// }

// useGLTF.preload('/models/6734eaada9f588f6f4ee0117.glb');
// useGLTF.preload('/models/woman2animation.glb');

// export default Woman2avatar;

import React, { useRef, useState, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

export function Woman2avatar(props) {
  const group = useRef();
  // Load both model and animations
  const { nodes, materials, animations: modelAnimations } = useGLTF('/models/6734eaada9f588f6f4ee0117.glb');
  const { animations: additionalAnimations } = useGLTF('/models/woman2animation.glb');
  
  // Combine animations from both files if needed
  const allAnimations = [...(modelAnimations || []), ...(additionalAnimations || [])];
  
  // Pass the group ref and combined animations
  const { actions, names } = useAnimations(allAnimations, group);
  const [animation] = useState("HappyIdle");

  useEffect(() => {
    // Debug logging to check available animations
    console.log('Available animations:', names);
    console.log('Current actions:', actions);

    // Make sure we have actions and the specific animation exists
    if (actions && actions[animation]) {
      const action = actions[animation];
      
      // Stop all currently playing animations
      Object.values(actions).forEach(action => action.stop());
      
      // Reset and play the animation with crossfade
      action
        .reset()
        .setEffectiveWeight(1)
        .setEffectiveTimeScale(1)
        .fadeIn(0.5) // Add smooth transition
        .play();

      return () => {
        // Proper cleanup with fade out
        action.fadeOut(0.5);
      };
    } else {
      console.warn(`Animation "${animation}" not found. Available animations:`, names);
    }
  }, [animation, actions, names]);

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  );
}

// Preload both model and animations
useGLTF.preload('/models/6734eaada9f588f6f4ee0117.glb');
useGLTF.preload('/models/woman2animation.glb');

export default Woman2avatar;
