import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {Hand, Pose} from './hand';

const Cam = () => { const c = useThree((s) => s.camera); c.position.set(0, 0, 0.75); c.lookAt(0, 0, 0); return null; };
export const HandTest: React.FC<{poses: Pose[]}> = ({poses}) => {
  const [g, setG] = useState<GLTF | null>(null);
  const [h] = useState(() => delayRender('hand'));
  useEffect(() => { new GLTFLoader().load(staticFile('models/hand-right.glb'), (x) => { setG(x); continueRender(h); }); }, [h]);
  return (
    <AbsoluteFill style={{background: '#333'}}>
      {g && <ThreeCanvas width={1080} height={1920} onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; }}>
        <Cam />
        <ambientLight intensity={0.6} /><directionalLight position={[1, 2, 3]} intensity={2} />
        {poses.map((p, i) => <Hand key={i} gltf={g} pose={p} pinch={new THREE.Vector3(-0.12 + (i % 2) * 0.24, 0.05, 0)} quat={new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (p as {yaw?: number}).yaw ?? 0, 0))} />)}
      </ThreeCanvas>}
    </AbsoluteFill>
  );
};
