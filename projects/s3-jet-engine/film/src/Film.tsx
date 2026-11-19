import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Scene} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

const LINES = [
  'Most people think a jet engine pushes the plane with fire.',
  'But most of the push comes from [air] that never touches the flame.',
  'Watch the air.',
  'The giant [fan] at the front pulls in a huge gulp.',
  "In today's big engines, only about one part in ten goes into the core.",
  "There it's squeezed, mixed with fuel and [burned.]",
  'The hot blast spins turbines, and the last one turns the fan.',
  'The other [nine] [parts] never burn.',
  'The fan just shoves them backward, around the core.',
  'That huge, slower stream makes [most] [of] [the] [thrust.]',
  'So the fire spins the fan, and the fan does most of the [pushing.]',
];

const useAssets = () => {
  const [a, setA] = useState<GLTF | null>(null); const [h] = useState(() => delayRender('models'));
  useEffect(() => { new GLTFLoader().loadAsync(staticFile('models/engine.glb')).then((g) => { setA(g); continueRender(h); }); }, [h]);
  return a;
};
const project = (t: number, p: THREE.Vector3, w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(50, w / h, 0.05, 30000);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.set(...c.pos); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};
const Label: React.FC<{o: number; p: {x: number; y: number}; txt: string; color: string; size?: number; dx?: number; dy?: number; anchor?: string; sub?: string}> = ({o, p, txt, color, size = 52, dx = 0, dy = 0, anchor = '-50%,-50%', sub}) => o > 0.01 ? (
  <div style={{position: 'absolute', left: p.x + dx, top: p.y + dy, transform: `translate(${anchor})`, opacity: o, textAlign: 'center',
    font: `800 ${size}px ${SANS}`, color, textShadow: '0 0 12px rgba(0,0,0,0.9), 0 0 26px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>
    {txt}{sub && <div style={{font: `600 ${Math.round(size * 0.5)}px ${SANS}`, color: '#DCE6EE', marginTop: 6}}>{sub}</div>}
  </div>) : null;

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const a = useAssets();
  const P = (x: number, y: number, z: number) => project(t, new THREE.Vector3(x, y, z), width, height);
  const one = TL.labelOne(t), nine = TL.labelNine(t), most = TL.labelMost(t);
  const cx = TL.coreBeadX(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.35}>
        {a && <ThreeCanvas width={width} height={height} gl={{antialias: true}}><Scene t={t} engine={a} /></ThreeCanvas>}
      </Finish>
      <Label o={one} p={P(Math.min(cx, 1.0), TL.AXIS_Y - 0.36, 0.12)} txt="1 in 10" color="#FFD2C4" />
      <Label o={nine} p={t < TL.B.there + 0.3 ? P(TL.tenBypassX(t) - 0.5, TL.AXIS_Y - 1.3, 0.12) : P(1.6, TL.AXIS_Y + 1.35, 0.6)} txt="9 in 10 go around" color={TL.CYAN} />
      <Label o={most} p={{x: width / 2, y: 1360}} txt="most of the thrust" color={TL.CYAN} size={56} sub="Rolls-Royce Trent 1000: over 85%" />
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.CYAN} font={SANS} scrimAlpha={0.72} />}
    </AbsoluteFill>
  );
};
