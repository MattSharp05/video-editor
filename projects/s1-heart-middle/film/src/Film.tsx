import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Scene, type Assets} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

const LINES = [
  'Lots of people think your heart is on the [left] side of your chest.',
  'Look inside.',
  'It sits behind your [breastbone,] near the [middle] of your chest.',
  'It [leans] left, so its tip points down to the left.',
  'That [tip] is where you can often feel the beat.',
  'And that matters if you ever need to do [CPR.]',
  "Don't push on the left side.",
  'Push hard on the [lower] [half] of the [breastbone.]',
  'Each push squeezes your [heart] between your breastbone and spine,',
  'and pushes some [blood] up to the brain.',
  'Push about [two] [times] [a] [second,] until help comes.',
];

const useAssets = () => {
  const [a, setA] = useState<Assets | null>(null);
  const [h] = useState(() => delayRender('models'));
  useEffect(() => {
    const l = new GLTFLoader();
    Promise.all(['body', 'thorax', 'heart', 'hand-right', 'hand-left'].map((p) => l.loadAsync(staticFile(`models/${p}.glb`))))
      .then(([body, thorax, heart, handR, handL]) => { setA({body, thorax, heart, handR, handL}); continueRender(h); });
  }, [h]);
  return a;
};

// screen position of a world point with the scene's camera
export const project = (t: number, p: THREE.Vector3, w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(50, w / h, 0.02, 80);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};

const Label: React.FC<{o: number; x: number; y: number; color: string; size?: number; children: React.ReactNode; align?: 'left' | 'center'}> = ({o, x, y, color, size = 52, children, align = 'left'}) => o > 0.01 ? (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(${align === 'center' ? '-50%' : '0'},-50%) translateY(${interpolate(o, [0, 1], [12, 0])}px)`, opacity: o,
    font: `800 ${size}px ${SANS}`, color, whiteSpace: 'nowrap', textShadow: `0 0 14px rgba(0,0,0,0.85), 0 0 26px rgba(0,0,0,0.6), 0 0 22px ${color}55`}}>{children}</div>) : null;

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const assets = useAssets();
  const lie = TL.lying(t);
  // standing: "2/3 left · 1/3 right" either side of the centre line while the heart leans
  const split = lie ? 0 : TL.ramp(t, TL.B.tip + 0.2, TL.B.tip + 0.7) * (1 - TL.ramp(t, TL.B.thatTip, TL.B.thatTip + 0.4));
  const hp = split > 0 ? project(t, new THREE.Vector3(...TL.HEART_C), width, height) : {x: 0, y: 0};
  // lying: rate counter
  const cnt = TL.counterOn(t) * (lie ? 1 : 0);
  const pushLab = lie ? TL.ramp(t, TL.B.centre - 0.1, TL.B.centre + 0.3) * (1 - TL.ramp(t, TL.B.squeezes, TL.B.squeezes + 0.4)) : 0;
  const bloodLab = lie ? TL.ramp(t, TL.B.blood + 0.1, TL.B.blood + 0.5) * (1 - TL.ramp(t, TL.B.two - 0.3, TL.B.two)) : 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.3}>
        {assets && (
          <ThreeCanvas width={width} height={height} gl={{antialias: true}}>
            <Scene t={t} assets={assets} />
          </ThreeCanvas>
        )}
      </Finish>
      <Label o={split} x={hp.x + 150} y={hp.y + 330} color={TL.AMBER} size={58} align="center">⅔ left</Label>
      <Label o={split} x={hp.x - 170} y={hp.y + 330} color="#EAF6FF" size={44} align="center">⅓ right</Label>
      <Label o={pushLab} x={540} y={1380} color={TL.AMBER} size={56} align="center">push here: lower breastbone</Label>
      <Label o={bloodLab} x={540} y={1380} color={TL.AMBER} size={56} align="center">blood to the brain</Label>
      <Label o={cnt} x={540} y={1380} color={TL.AMBER} size={64} align="center">100–120 a minute</Label>
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.AMBER} font={SANS} />}
    </AbsoluteFill>
  );
};
