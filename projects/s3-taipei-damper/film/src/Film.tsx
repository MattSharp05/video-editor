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


// "swinging just behind it": both motions on one shared time axis, a glass panel low in frame (board judge: the
// 3D pens read as exhaust trails). Newest at the right; the amber peak comes a quarter swing after the coral one.
const Waves: React.FC<{t: number; o: number}> = ({t, o}) => {
  if (o < 0.01) return null;
  const X0 = 110, X1 = 900, YC = 1235, AMP = 105, LEN = 5.0;
  const path = (f: (tt: number) => number) => Array.from({length: 120}, (_, i) => {
    const age = LEN * (1 - i / 119); const x = X1 - (age / LEN) * (X1 - X0); const y = YC - AMP * f(t - age);
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ');
  const xAt = (tt: number) => X1 - ((t - tt) / LEN) * (X1 - X0);
  // latest coral peak whose amber peak (a quarter period later) is already drawn
  const P = TL.PERIOD, t0 = TL.B.shoves + 0.1;
  const kq = Math.floor((t - P / 4 - t0 - P / 4) / P);
  const tc = t0 + P / 4 + kq * P, ta = tc + P / 4;
  const showM = xAt(tc) > X0 + 20;
  const yN = (v: number) => YC - AMP * v;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: o}}>
      <div style={{position: 'absolute', left: 70, top: 1080, width: 940, height: 310, borderRadius: 26,
        background: 'rgba(10,14,22,0.55)', border: '1.5px solid rgba(234,246,255,0.28)', boxShadow: 'inset 0 1px 0 rgba(234,246,255,0.25), 0 10px 40px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(10px)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={X0} y1={YC} x2={X1 + 20} y2={YC} stroke="rgba(234,246,255,0.18)" strokeWidth={2} />
        {showM && <>
          <line x1={xAt(tc)} y1={yN(1.05)} x2={xAt(tc)} y2={YC + 125} stroke={TL.CORAL} strokeOpacity={0.7} strokeWidth={3} strokeDasharray="8 8" />
          <line x1={xAt(ta)} y1={yN(1.05)} x2={xAt(ta)} y2={YC + 125} stroke={TL.GOLD} strokeOpacity={0.8} strokeWidth={3} strokeDasharray="8 8" />
          <line x1={xAt(tc)} y1={YC + 118} x2={xAt(ta)} y2={YC + 118} stroke="#EAF6FF" strokeOpacity={0.7} strokeWidth={3} />
        </>}
        <path d={path(TL.towerX)} fill="none" stroke={TL.CORAL} strokeWidth={14} strokeOpacity={0.25} strokeLinecap="round" />
        <path d={path(TL.towerX)} fill="none" stroke={TL.CORAL} strokeWidth={6} strokeLinecap="round" />
        <path d={path(TL.ballY)} fill="none" stroke={TL.GOLD} strokeWidth={14} strokeOpacity={0.25} strokeLinecap="round" />
        <path d={path(TL.ballY)} fill="none" stroke={TL.GOLD} strokeWidth={6} strokeLinecap="round" />
        <circle cx={X1} cy={yN(TL.towerX(t))} r={13} fill={TL.CORAL} />
        <circle cx={X1} cy={yN(TL.ballY(t))} r={13} fill={TL.GOLD} />
      </svg>
      <div style={{position: 'absolute', left: X1 + 26, top: yN(TL.towerX(t)) - 22, font: `800 34px ${SANS}`, color: TL.CORAL}}>tower</div>
      <div style={{position: 'absolute', left: X1 + 26, top: yN(TL.ballY(t)) - 22, font: `800 34px ${SANS}`, color: TL.GOLD}}>ball</div>
      {showM && <div style={{position: 'absolute', left: (xAt(tc) + xAt(ta)) / 2, top: YC + 128, transform: 'translate(-50%,0)', font: `700 30px ${SANS}`, color: '#EAF6FF', whiteSpace: 'nowrap'}}>a quarter swing later</div>}
    </div>
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
  const lp = {x: width / 2, y: 1330};
  const tr = TL.tracesOn(t);
  const rigX = TL.tipAmp(t) * TL.towerX(t) * TL.bendShape(TL.BALL_Y);
  const yTop = TL.BALL_Y - TL.BALL_R - 0.6;
  void yTop; const pT = false ? project(t, new THREE.Vector3(rigX - 3.6, yTop - TL.TRACE_LEN * TL.TRACE_V - 0.6, 7.5), width, height) : {x: 0, y: 0};
  const pB = false ? project(t, new THREE.Vector3(rigX + 3.6, yTop - TL.TRACE_LEN * TL.TRACE_V - 0.6, 7.5), width, height) : {x: 0, y: 0};
  const mb = TL.meterBar(t);
  const mp = mb > 0 ? project(t, new THREE.Vector3(rigX + 1.0, TL.SLAB_LOW + 0.6, 7.4), width, height) : {x: 0, y: 0};
  const ex = TL.exaggerated(t);
  const gp = TL.labelGhost(t) > 0 ? project(t, new THREE.Vector3(TL.TIP_WIDE * TL.GHOST_K * 1.05 + 4, TL.CROWN_TOP + 44, 28), width, height) : {x: 0, y: 0};
  const wp = TL.labelWith(t) > 0 ? project(t, new THREE.Vector3(TL.TIP_WIDE * 1.05 + 4, TL.CROWN_TOP + 22, 28), width, height) : {x: 0, y: 0};
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
      <Waves t={t} o={tr} />
      {label(mb, mp.x + 14, mp.y - 95, '1 m swing', TL.GOLD, 52)}
      {label(TL.labelBall(t), width / 2, 1330, '660-tonne ball on cables', TL.GOLD, 50, '-50%,-50%')}
      {label(TL.labelPistons(t), width / 2, 1420, 'pistons: swing → heat', TL.HEAT, 52, '-50%,-50%')}
      {label(TL.labelGhost(t), gp.x, gp.y, 'without the ball', TL.CORAL, 46, '0,-50%')}
      {label(TL.labelWith(t), wp.x, wp.y, 'with the ball', TL.GOLD, 46, '0,-50%')}
      {label(ex * 0.85, width / 2, 1450, 'motion exaggerated', '#C9D2DE', 34, '-50%,-50%')}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.GOLD} font={SANS} scrimAlpha={0.78} />}
    </AbsoluteFill>
  );
};
