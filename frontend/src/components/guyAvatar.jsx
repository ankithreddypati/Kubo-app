// import React, { useRef, useState, useEffect } from 'react';
// import { useGLTF, useAnimations } from '@react-three/drei';

// export function guyAvatar(props) {
//   const group = useRef();
//   const { nodes, materials } = useGLTF('/models/6733def612194579441fa702.glb')
//   const { animations } = useGLTF("/models/guyAnimation.glb");
//   const { actions } = useAnimations(animations, group);
//   const [animation] = useState("Armature|mixamo.com|Layer0");

//   useEffect(() => {
//     if (actions && actions[animation]) {
//       actions[animation].reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();
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

// useGLTF.preload('/models/6733def612194579441fa702.glb');
// useGLTF.preload("/models/guyAnimation.glb");

// export default guyAvatar;

import React, { useRef, useState, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

export function GuyAvatar(props) {
  const group = useRef();
  
  // Load both model and animations
  const { nodes, materials } = useGLTF('/models/6733def612194579441fa702.glb');
  const { animations } = useGLTF('/models/guyAnimation.glb');
  
  // Pass the group ref to useAnimations
  const { actions } = useAnimations(animations, group);
  
  // Animation state
  const [animation] = useState("Armature|mixamo.com|Layer0");

  useEffect(() => {
    // Make sure we have actions and the specific animation exists
    if (actions && actions[animation]) {
      const action = actions[animation];
      
      // Reset and play the animation
      action
        .reset()
        .setEffectiveWeight(1)
        .setEffectiveTimeScale(1)
        .play();
    }

    return () => {
      if (actions && actions[animation]) {
        actions[animation].stop();
      }
    };
  }, [animation, actions]);

  return (
    // Important: Add ref={group} to the root group
    <group ref={group} {...props} dispose={null}>
      {/* Important: Make sure this matches the armature name from your animation file */}
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

useGLTF.preload('/models/6733def612194579441fa702.glb');
useGLTF.preload('/models/guyAnimation.glb');

export default GuyAvatar;