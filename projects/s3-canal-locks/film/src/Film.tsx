import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
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
  'Watch this ship rise nine meters.',
  'Not one pump is lifting it.',
  "The canal's middle is a lake, 26 meters above the sea.",
  'So ships climb to it in [steps:] concrete boxes called locks.',
  'The gate behind the ship closes.',
  'A valve opens, and water from above [pours] [in.]',
  'It rushes through [tunnels] in the walls and wells up through holes in the floor.',
  'In about eight minutes the box fills, and the ship [floats] [up] a step.',
  'Three steps, and it sails out onto Gatun Lake.',
  'Going down, that water flows on out to sea.',
  'Each ship spends about 200 million liters, and the [rain] refills the lake.',
];

const useAssets = () => {
  const [a, setA] = useState<GLTF | null>(null); const [h] = useState(() => delayRender('models'));
  useEffect(() => { new GLTFLoader().loadAsync(staticFile('models/ship.glb')).then((g) => { setA(g); continueRender(h); }); }, [h]);
  return a;
};
const project = (t: number, p: THREE.Vector3, w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(50, w / h, 0.5, 40000);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.set(...c.pos); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};
const Label: React.FC<{o: number; p: {x: number; y: number}; txt: string; color?: string; size?: number}> = ({o, p, txt, color = '#F4F7FA', size = 44}) => o > 0.01 ? (
  <div style={{position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%,-50%)', opacity: o, font: `800 ${size}px ${SANS}`, color,
    textShadow: '0 0 12px rgba(0,0,0,0.9), 0 0 26px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>{txt}</div>) : null;
// on-screen cards (video-script: read before heard, six words or fewer), low in the frame, clear of the captions
const Card: React.FC<{o: number; txt: string; color?: string}> = ({o, txt, color = '#FFFFFF'}) => o > 0.01 ? (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center', opacity: o}}>
    <div style={{font: `900 64px ${SANS}`, color, letterSpacing: 1, padding: '14px 30px', borderRadius: 18, background: 'rgba(8,12,18,0.62)',
      border: '1.5px solid rgba(234,246,255,0.25)', transform: `translateY(${(1 - o) * 16}px)`}}>{txt}</div>
  </div>) : null;
const Rain: React.FC<{t: number; o: number}> = ({t, o}) => o < 0.01 ? null : (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 260}, (_, i) => {
      const sp = 1700 + random('rs' + i) * 1200, len = 50 + random('rl' + i) * 70;
      const y = ((random('ry' + i) * 2300 + t * sp) % 2300) - 200, x = ((random('rx' + i) * 1300 + t * sp * 0.12) % 1300) - 100;
      return <line key={i} x1={x} y1={y} x2={x - len * 0.12} y2={y - len} stroke="#9FE3FF" strokeOpacity={(0.12 + random('ra' + i) * 0.2) * o} strokeWidth={1.6} />;
    })}
  </svg>);

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const a = useAssets();
  const P = (x: number, y: number, z: number) => project(t, new THREE.Vector3(x, y, z), width, height);
  const aerial = (t >= TL.B.above - 1 && t < TL.CUT_SECTION) || (t >= TL.CUT_BACK && t < TL.CUT_SEA);
  const sec = TL.inSection(t);
  const ramp = TL.ramp;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.25}>
        {a && <ThreeCanvas width={width} height={height} gl={{antialias: true, logarithmicDepthBuffer: true}}><Scene t={t} ship={a} /></ThreeCanvas>}
        <Rain t={t} o={TL.rainOn(t)} />
        <AbsoluteFill style={{background: 'linear-gradient(rgba(38,46,58,0.75), rgba(38,46,58,0.35) 45%, rgba(38,46,58,0))', opacity: TL.rainOn(t)}} />
      </Finish>
      {aerial && <Label o={ramp(t, TL.B.middle - 0.5, TL.B.middle)} p={P(TL.LAKE_X + 420, 30, -60)} txt="Gatun Lake" color={TL.CYAN} />}
      {aerial && <Label o={ramp(t, TL.B.above - 0.3, TL.B.above + 0.2)} p={P(-160, 4, 40)} txt="sea" color="#DCE6EE" />}
      {aerial && t < TL.CUT_SECTION && [0, 1, 2].map((i) => <Label key={i} o={TL.stepMarks(t, i)} p={P(TL.chMid(i), 34, 0)} txt={`step ${i + 1}`} color={TL.AMBER} size={54} />)}
      {sec && <Label o={ramp(t, TL.B.gate, TL.B.gate + 0.3) * (1 - ramp(t, TL.B.valve - 0.2, TL.B.valve))} p={P(TL.chX0(2) - 12, 34, 0)} txt="gate" />}
      {sec && <Label o={ramp(t, TL.B.valve, TL.B.valve + 0.3) * (1 - ramp(t, TL.B.rushes, TL.B.rushes + 0.3))} p={P(TL.LAKE_X + 6, TL.floorY(2) + 9, TL.CH_W / 2 + 9)} txt="valve" color={TL.CYAN} />}
      {sec && <Label o={ramp(t, TL.B.rushes, TL.B.rushes + 0.3) * (1 - ramp(t, TL.B.wells + 0.6, TL.B.wells + 0.9))} p={P(TL.chX0(2) + 230, TL.floorY(2) + 10, TL.CH_W / 2 + 9)} txt="tunnel in the wall" color={TL.CYAN} />}
      {sec && <Label o={ramp(t, TL.B.wells + 0.4, TL.B.wells + 0.8) * (1 - ramp(t, TL.B.minutes - 0.3, TL.B.minutes))} p={P(TL.chX0(2) + 160, TL.floorY(2) + 6, -4)} txt="holes in the floor" color={TL.CYAN} />}
      {t < TL.CUT_SECTION && <Label o={TL.hookLines(t) * ramp(t, 0.2, 0.6)} p={P(TL.chX0(1) + 60, 2 * TL.STEP + 2.5, TL.CH_W / 2)} txt="+9 m" color={TL.AMBER} size={78} />}
      {sec && <Label o={TL.levelLine(t)} p={P(TL.chX0(2) + 190, 3 * TL.STEP + 4, TL.CH_W / 2)} txt="+9 m" color={TL.AMBER} size={78} />}
      {aerial && t >= TL.CUT_BACK && <Label o={ramp(t, TL.B.goingDown - 0.2, TL.B.goingDown + 0.2)} p={P(TL.shipBX(), 50, TL.LANE_B)} txt="going down" color="#DCE6EE" size={48} />}
      {t >= TL.CUT_SEA && <Label o={TL.cubeOn(t) * (1 - ramp(t, TL.B.liters, TL.B.liters + 0.4))} p={P(-640, 66, 15)} txt="one ship's water" color={TL.CYAN} size={48} />}
      <Card o={TL.cardNoPumps(t)} txt="9 METERS UP. NO PUMPS" />
      <Card o={TL.cardLake(t)} txt="LAKE: 26 METERS UP" color={TL.AMBER} />
      <Card o={TL.card8min(t)} txt="8 MINUTES" />
      <Card o={TL.cardLiters(t)} txt="200 MILLION LITERS" color={TL.CYAN} />
      <Card o={TL.cardEnd(t)} txt="GRAVITY LIFTS IT" color={TL.CYAN} />
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.CYAN} font={SANS} scrimAlpha={0.82} />}
    </AbsoluteFill>
  );
};
