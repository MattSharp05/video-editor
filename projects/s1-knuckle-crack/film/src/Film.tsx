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
  'Lots of people think cracking your knuckles gives you [arthritis.]',
  "So what's actually popping?",
  'Each knuckle sits in a sealed [capsule] of [fluid.]',
  'Pull the bones apart, and the [pressure] in that fluid [drops.]',
  'A gas [bubble] forms in the fluid, right at the [pop.]',
  'No bone breaks. Nothing grinds.',
  "A knuckle usually can't crack again for about [twenty] [minutes.]",
  'Scientists think the leftover gas needs time to dissolve.',
  "One doctor cracked only his [left] hand's knuckles, twice a day, for [fifty] [years.]",
  'Neither hand got arthritis.',
  'A study of over two hundred people found [no] [link] either.',
  'If it ever hurts or swells, stop and get it checked.',
];

const useAssets = () => {
  const [a, setA] = useState<Assets | null>(null);
  const [h] = useState(() => delayRender('models'));
  useEffect(() => {
    const l = new GLTFLoader();
    Promise.all(['hand-right', 'hand-left'].map((p) => l.loadAsync(staticFile(`models/${p}.glb`))))
      .then(([handR, handL]) => { setA({handR, handL}); continueRender(h); });
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
  const sh = TL.shot(t);
  const P = (v: TL.V3) => project(t, new THREE.Vector3(...v), width, height);
  const gapLab = sh === 1 ? TL.ramp(t, TL.B.pull + 0.4, TL.B.pull + 0.8) * (1 - TL.ramp(t, TL.B.pressure - 0.2, TL.B.pressure + 0.1)) : 0;
  const presLab = sh === 1 ? TL.ramp(t, TL.B.pressure + 0.1, TL.B.pressure + 0.4) * (1 - TL.ramp(t, TL.B.gas - 0.1, TL.B.gas + 0.3)) : 0;
  const noPopLab = sh === 1 ? TL.noPop(t) : 0;
  const ctl = sh === 2 ? TL.ramp(t, TL.B.doctor + 0.6, TL.B.doctor + 1.0) * (1 - TL.ramp(t, TL.B.neither - 0.2, TL.B.neither + 0.1)) : 0;
  const rhp = P([0.07, 0.05, -0.08]);
  const clk = sh === 1 ? TL.clockOn(t) : 0;
  const cnt = sh === 2 ? TL.counterOn(t) : 0, yrs = sh === 2 ? TL.yearsOn(t) : 0;
  const hl = sh === 2 ? TL.healthy(t) * (1 - TL.ramp(t, TL.B.study - 0.2, TL.B.study + 0.1)) : 0;
  const st = sh === 2 ? TL.studyOn(t) : 0;
  const gp = P([TL.gap(t) / 2, -9, 0]);
  const lh = P([-0.06, 0.05, -0.08]);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.3}>
        {assets && (
          <ThreeCanvas width={width} height={height} gl={{antialias: true}}>
            <Scene t={t} assets={assets} />
          </ThreeCanvas>
        )}
      </Finish>
      <Label o={presLab} x={540} y={1440} color="#9FD8FF" size={56} align="center">pressure drops</Label>
      <Label o={gapLab} x={540} y={1440} color="#EAF6FF" size={56} align="center">gap: ~1 mm → ~2 mm</Label>
      <Label o={noPopLab} x={540} y={1340} color="#B8C0C8" size={56} align="center">no pop</Label>
      <Label o={ctl} x={lh.x} y={lh.y + 330} color={TL.GAS} size={46} align="center">cracked</Label>
      <Label o={ctl} x={rhp.x} y={rhp.y + 330} color="#EAF6FF" size={46} align="center">never cracked</Label>
      <Label o={clk} x={540} y={1430} color="#EAF6FF" size={60} align="center">{`${Math.floor(TL.clockMin(t))} min`}</Label>
      <Label o={cnt} x={lh.x} y={lh.y - 260} color={TL.GAS} size={58} align="center">{`${TL.counter(t).toLocaleString('en-US')}+ cracks`}</Label>
      <Label o={yrs} x={lh.x} y={lh.y - 190} color="#EAF6FF" size={44} align="center">50 years</Label>
      <Label o={hl} x={540} y={1420} color={TL.AMBER} size={62} align="center">no arthritis in either hand</Label>
      <Label o={st} x={540} y={1420} color={TL.AMBER} size={62} align="center">215 people · no link</Label>
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.AMBER} font={SANS} />}
    </AbsoluteFill>
  );
};
