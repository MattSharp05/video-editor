import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Hand, Pose} from './hand';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {EniacSet} from './eniac';
import {SANS} from './kit/fonts';

type P = {cam: number[]; look: number[]; fov: number; hand?: {p: number[]; f: number[]; b: number[]; reach?: number; pose: Pose}};
const Cam: React.FC<P> = ({cam, look, fov}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(cam[0], cam[1], cam[2]);
  camera.fov = fov; camera.near = 0.02; camera.far = 40;
  camera.lookAt(look[0], look[1], look[2]); camera.updateProjectionMatrix();
  return null;
};

// Place the hand by where its fingertips pinch (p), the finger direction (f) and the back of the hand (b).
// The model's back of hand is +x and its fingers point along -y.
const HandAt: React.FC<{g: GLTF; h: NonNullable<P['hand']>}> = ({g, h}) => {
  const F = new THREE.Vector3(...(h.f as [number, number, number])).normalize();
  const B = new THREE.Vector3(...(h.b as [number, number, number]));
  B.sub(F.clone().multiplyScalar(B.dot(F))).normalize();
  const Y = F.clone().negate(), Z = new THREE.Vector3().crossVectors(B, Y);
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(B, Y, Z));
  return <Hand gltf={g} pose={h.pose} pinch={new THREE.Vector3(...(h.p as [number, number, number]))} quat={q} />;
};

// Caption in the reference reels' manner: spoken words white, words still to come grey.
const Caption: React.FC<{words: string[]; lit: number}> = ({words, lit}) => (
  <div style={{position: 'absolute', top: 300, left: 90, right: 90, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 84, lineHeight: 1.08, letterSpacing: -1.5}}>
    {words.map((w, i) => (
      <span key={i} style={{color: i < lit ? '#ffffff' : 'rgba(255,255,255,0.38)', textShadow: '0 2px 18px rgba(0,0,0,0.6)'}}>{w} </span>
    ))}
  </div>
);

export const StyleFrame: React.FC<P> = (p) => {
  const fr = useCurrentFrame();
  const [g, setG] = useState<GLTF | null>(null);
  const [h] = useState(() => delayRender('hand model'));
  useEffect(() => { new GLTFLoader().load(staticFile('models/hand-right.glb'), (x) => { setG(x); continueRender(h); }); }, [h]);
  if (!g) return null;
  return (
    <AbsoluteFill style={{background: '#100f0e'}}>
      <Finish fr={fr} bloom={0.45}>
        <ThreeCanvas width={1080} height={1920} dpr={2} shadows
          onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; }}>
          <Cam {...p} />
          <EniacSet glow={1} />
          {p.hand && <HandAt g={g} h={p.hand} />}
        </ThreeCanvas>
      </Finish>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,9,8,0.75) 0%, rgba(10,9,8,0) 32%, rgba(10,9,8,0) 80%, rgba(10,9,8,0.6) 100%)'}} />
      <Caption words={['How', 'did', 'people', 'write', 'code', 'before', 'screens?']} lit={5} />
      <div style={{position: 'absolute', bottom: 230, left: 64, fontFamily: SANS, fontWeight: 500, fontSize: 34, color: 'rgba(255,255,255,0.72)'}}>ENIAC, 1946</div>
      <div style={{position: 'absolute', bottom: 230, right: 64, fontFamily: SANS, fontWeight: 500, fontSize: 34, color: 'rgba(255,255,255,0.72)'}}>Illustration</div>
    </AbsoluteFill>
  );
};
