import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
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
  "There's a 660-tonne steel [ball] hanging inside this skyscraper.",
  "It's how Taipei 101 rides out typhoons.",
  'Wind shoves the tower, and the top starts to [sway.]',
  'But the ball hangs from cables, like a giant [pendulum.]',
  "It's tuned to the tower's own [rhythm,] swinging just [behind] it.",
  'So as the top sways, the ball tugs [against] it.',
  'Pistons below soak up the swing as [heat.]',
  'Without the ball, the top would sway much farther.',
  'With it, the sway drops by up to [40] [percent.]',
  'In a 2015 typhoon, it swung a full [meter.]',
];

// screen position of a world point with the scene's camera
const project = (t: number, p: THREE.Vector3, w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 50000);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.set(...c.pos); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};

// rain: thin streaks slanted with the wind, near the lens (exterior shots only)
const Rain: React.FC<{t: number; w: number; h: number}> = ({t, w, h}) => {
  const on = TL.rainOn(t), wind = TL.windOn(t);
  const slant = 0.22 + 0.25 * wind;
  const n = Math.round(150 + 170 * on);
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: n}, (_, i) => {
        const sp = 1500 + random('rs' + i) * 1500, len = 40 + random('rl' + i) * 70;
        const y = ((random('ry' + i) * (h + 400) + t * sp) % (h + 400)) - 200;
        const x = ((random('rx' + i) * (w + 600) + t * sp * slant) % (w + 600)) - 300;
        const a = (0.06 + random('ra' + i) * 0.14) * on;
        return <line key={i} x1={x} y1={y} x2={x - len * slant} y2={y - len} stroke="#CFE6F5" strokeOpacity={a} strokeWidth={1.2 + random('rw' + i) * 1.3} />;
      })}
    </svg>
  );
};

const label = (o: number, x: number, y: number, txt: string, color: string, size: number, anchor = '0,-50%') => o > 0.01 && (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor})`, opacity: o, font: `800 ${size}px ${SANS}`, color,
    textShadow: '0 0 12px rgba(0,0,0,0.85), 0 0 26px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>{txt}</div>
);

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const close = TL.closeShot(t);
  const tipOff = TL.tipAmp(t) * TL.towerX(t);
  const lt = TL.labelTaipei(t);
  const tp = lt > 0 ? project(t, new THREE.Vector3(tipOff * 0.6 + 28, 250, 0), width, height) : {x: 0, y: 0};
  const ll = TL.lessLabel(t);
  const lp = ll > 0 ? project(t, new THREE.Vector3(0, TL.CROWN_TOP + 34, 28), width, height) : {x: 0, y: 0};
  const tr = TL.tracesOn(t);
  const rigX = TL.tipAmp(t) * TL.towerX(t) * TL.bendShape(TL.BALL_Y);
  const yTop = TL.BALL_Y - TL.BALL_R - 0.6;
  const pT = tr > 0 ? project(t, new THREE.Vector3(rigX - 3.6, yTop - TL.TRACE_LEN * TL.TRACE_V - 0.6, 7.5), width, height) : {x: 0, y: 0};
  const pB = tr > 0 ? project(t, new THREE.Vector3(rigX + 3.6, yTop - TL.TRACE_LEN * TL.TRACE_V - 0.6, 7.5), width, height) : {x: 0, y: 0};
  const mb = TL.meterBar(t);
  const mp = mb > 0 ? project(t, new THREE.Vector3(rigX + 1.0, TL.SLAB_LOW + 0.6, 7.4), width, height) : {x: 0, y: 0};
  const ex = TL.exaggerated(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.4}>
        <ThreeCanvas width={width} height={height} gl={{logarithmicDepthBuffer: true, antialias: true}}>
          <Scene t={t} />
        </ThreeCanvas>
        {!close && <Rain t={t} w={width} h={height} />}
      </Finish>
      {label(lt, tp.x, tp.y, 'Taipei 101', '#F2F4F7', 50)}
      {label(ll, lp.x, lp.y, 'up to 40% less sway', TL.GOLD, 54, '-50%,-50%')}
      {label(tr, pT.x, pT.y, 'tower', TL.CORAL, 44, '-50%,0')}
      {label(tr, pB.x, pB.y, 'ball', TL.GOLD, 44, '-50%,0')}
      {label(mb, mp.x + 18, mp.y - 40, '1 m', TL.GOLD, 52)}
      {label(ex * 0.85, width / 2, 1450, 'motion exaggerated', '#C9D2DE', 34, '-50%,-50%')}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.GOLD} font={SANS} />}
    </AbsoluteFill>
  );
};
