import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {EniacSet} from './eniac';
import {SANS} from './kit/fonts';

type P = {cam: number[]; look: number[]; fov: number};
const Cam: React.FC<P> = ({cam, look, fov}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(cam[0], cam[1], cam[2]);
  camera.fov = fov; camera.near = 0.02; camera.far = 40;
  camera.lookAt(look[0], look[1], look[2]); camera.updateProjectionMatrix();
  return null;
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
  return (
    <AbsoluteFill style={{background: '#100f0e'}}>
      <Finish fr={fr} bloom={0.8}>
        <ThreeCanvas width={1080} height={1920} dpr={2} shadows
          onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; }}>
          <Cam {...p} />
          <EniacSet glow={1} />
        </ThreeCanvas>
      </Finish>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,9,8,0.75) 0%, rgba(10,9,8,0) 32%, rgba(10,9,8,0) 80%, rgba(10,9,8,0.6) 100%)'}} />
      <Caption words={['How', 'did', 'people', 'write', 'code', 'before', 'screens?']} lit={5} />
      <div style={{position: 'absolute', bottom: 230, left: 64, fontFamily: SANS, fontWeight: 500, fontSize: 34, color: 'rgba(255,255,255,0.72)'}}>ENIAC, 1946</div>
      <div style={{position: 'absolute', bottom: 230, right: 64, fontFamily: SANS, fontWeight: 500, fontSize: 34, color: 'rgba(255,255,255,0.72)'}}>Illustration</div>
    </AbsoluteFill>
  );
};
