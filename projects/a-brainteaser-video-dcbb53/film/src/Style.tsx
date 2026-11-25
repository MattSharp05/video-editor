// Style frame for the hook beat: the realistic-3d look, the accent, and the hook card type.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {SANS} from './kit/fonts';
import {Set, ACCENT} from './Scene';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';

const Cam: React.FC<{pos: [number, number, number]; look: [number, number, number]; mm: number}> = ({pos, look, mm}) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  cam.position.set(...pos);
  cam.filmGauge = 36;
  cam.setFocalLength(mm);
  cam.near = 1; cam.far = 400;
  cam.lookAt(...look);
  cam.updateProjectionMatrix();
  return null;
};

export const Style: React.FC<{cam?: [number, number, number]; look?: [number, number, number]; mm?: number; lift?: number; title?: boolean}> = ({cam = [-8, 25, 26], look = [0, 6.2, 0], mm = 48, lift = 1, title = true}) => (
  <AbsoluteFill style={{background: '#16120f'}}>
    <Finish fr={0} bloom={0}>
      <ThreeCanvas width={1080} height={1920} dpr={2} shadows="percentage"
        onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 0.85; }}>
        <Cam pos={cam} look={look} mm={mm} />
        <Set lift={lift} />
      </ThreeCanvas>
    </Finish>
    {title && (
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 210, fontFamily: SANS, textAlign: 'center'}}>
        <div style={{fontSize: 112, fontWeight: 800, color: '#fff', letterSpacing: -2, lineHeight: 1.0, textShadow: '0 4px 30px rgba(0,0,0,0.55)'}}>One cut.</div>
        <div style={{fontSize: 112, fontWeight: 800, color: ACCENT, letterSpacing: -2, lineHeight: 1.05, textShadow: '0 4px 30px rgba(0,0,0,0.55)'}}>Six sides?</div>
      </AbsoluteFill>
    )}
  </AbsoluteFill>
);
