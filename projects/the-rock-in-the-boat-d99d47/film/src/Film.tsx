// The rock in the boat: one continuous shot of a glass-walled pool. Captions from the voice, guess chips during the
// pause, block labels during the explanation, an honesty tag on the exaggerated drop.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {ThreeCanvas} from './kit/three-canvas';
import {Captions} from './kit/captions';
import {Finish} from './kit/finish';
import {SANS} from './kit/fonts';
import {Scene, T, RED, BLUE} from './scene';
import words from './words.json';
import B from './beats.json';

export const FPS = 30;
export const DUR = Math.ceil(B.total * FPS);
const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const win = (t: number, a: number, b: number, f = 0.25) => Math.min(interpolate(t, [a, a + f], [0, 1], C), interpolate(t, [b - f, b], [1, 0], C));

// camera keys: [time, position, look-at, focal mm]; a monotone ease between keys (no stop at each key)
type K = [number, [number, number, number], [number, number, number], number];
const KEYS: K[] = [
  [0, [0.5, 0.25, 5.6], [0.0, -0.20, 0.3], 34],            // hook: the whole tank side-on, boat and rock; slow push
  [B.l1, [0.35, 0.2, 5.1], [0.05, -0.15, 0.3], 34],
  [B.mark, [0.8, 0.1, 4.2], [0.4, 0.05, 1.2], 38],        // in toward the glass as the line is drawn
  [B.l2, [0.7, 0.2, 4.9], [0.3, 0.00, 0.4], 36],           // the rock tips over toward us
  [T.freeze + 1.6, [1.1, 0.25, 4.7], [0.4, 0.10, 0.5], 38], // slow orbit round the hanging rock (the pause)
  [T.release, [0.9, 0.15, 4.9], [0.35, -0.05, 0.5], 36],
  [T.floor, [0.6, 0.0, 5.2], [0.3, -0.25, 0.5], 34],       // the rock sinks; the water falls below the line
  [B.l4, [0.8, 0.15, 5.2], [0.35, -0.15, 0.4], 34],        // the boat and the weight block beside it
  [B.l5, [0.9, -0.3, 4.9], [0.55, -0.45, 0.5], 36],        // lower: the rock and its twin on the floor
  [B.l6, [0.8, 0.1, 5.2], [0.4, -0.15, 0.4], 34],          // the three twins
  [B.l7, [0.4, 0.25, 5.8], [0.1, -0.20, 0.3], 32],          // pull back: the whole tank, the gap under the line
  [B.total, [0.45, 0.3, 6.1], [0.1, -0.20, 0.2], 31],
];
const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
const ease = (u: number) => u * u * (3 - 2 * u);
const camAt = (t: number) => {
  let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const [ta, pa, la, ma] = KEYS[i], [tb, pb, lb, mb] = KEYS[i + 1];
  const u = ease(Math.min(1, Math.max(0, (t - ta) / Math.max(tb - ta, 1e-3))));
  return {p: V(pa).lerp(V(pb), u), l: V(la).lerp(V(lb), u), mm: ma + (mb - ma) * u};
};

const LINES = [
  'Throw a [rock] out of a boat.', 'Does the pool [rise?]',
  "You're in a little boat in a pool,", 'holding a [heavy] [rock.]', 'We mark the [waterline.]',
  'Now, over it goes.', 'Pause and [guess.]', 'Does the water rise, fall,', 'or stay the same?',
  'It [falls.]',
  "In the boat, the rock's [weight]", 'pushes the boat deeper,', 'so it moves as much water', 'as the rock [weighs.]',
  'On the bottom,', 'it only moves its own [size] in water.',
  'And rock is almost [three] [times]', 'heavier than water.', "So that's far [less] water.",
  'The boat bobs [up,]', 'and the pool [drops.]',
];

const Chip: React.FC<{label: string; glyph: string; o: number; hot: number; x: number}> = ({label, glyph, o, hot, x}) => (
  <div style={{position: 'absolute', left: x, top: 560, width: 250, height: 118, borderRadius: 26, opacity: o,
    transform: `translateY(${(1 - o) * 24}px) scale(${1 + hot * 0.12})`,
    background: hot > 0.5 ? RED : 'rgba(10,22,30,0.55)', border: `3px solid ${hot > 0.5 ? '#FFD7D4' : 'rgba(255,255,255,0.55)'}`,
    boxShadow: hot > 0.5 ? `0 0 ${40 * hot}px rgba(255,59,48,0.75)` : '0 8px 30px rgba(0,0,0,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontFamily: SANS, color: '#fff', fontSize: 46, fontWeight: 800}}>
    <span style={{fontSize: 54}}>{glyph}</span>{label}
  </div>
);
const Label: React.FC<{text: React.ReactNode; o: number; x: number; y: number; color?: string}> = ({text, o, x, y, color = BLUE}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: o, transform: `translateY(${(1 - o) * 14}px)`, padding: '10px 22px 12px', borderRadius: 20,
    background: 'rgba(6,18,28,0.62)', border: `2px solid ${color}`, fontFamily: SANS, fontSize: 40, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap'}}>{text}</div>
);

export const Film: React.FC<{captions?: boolean; audio?: boolean}> = ({captions = true, audio = true}) => {
  const fr = useCurrentFrame(), t = fr / FPS;
  const chipsO = win(t, B.guess, T.splash + 1.6);
  const falls = interpolate(t, [B.falls - 0.05, B.falls + 0.2], [0, 1], C);
  return (
    <AbsoluteFill style={{background: '#9FC3D8'}}>
      <Finish fr={fr} bloom={0}>
        <ThreeCanvas width={1080} height={1920} shadows gl={{antialias: true}} camera={{fov: 40, near: 0.05, far: 80, position: [0, 0.5, 4.6]}}
          onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}>
          <Scene t={t} fr={fr} cam={camAt} />
        </ThreeCanvas>
      </Finish>
      {/* the pause: three guesses; "fall" lights when the answer lands */}
      <Chip label="RISE" glyph="↑" o={chipsO} hot={0} x={70} />
      <Chip label="FALL" glyph="↓" o={chipsO} hot={falls} x={415} />
      <Chip label="SAME" glyph="=" o={chipsO} hot={0} x={760} />
      <Label text={<>Water = the rock's <span style={{color: BLUE}}>weight</span></>} o={win(t, T.weight + 0.4, B.l5 - 0.1)} x={150} y={560} />
      <Label text={<>Water = the rock's <span style={{color: BLUE}}>size</span></>} o={win(t, T.size + 0.4, B.l6 - 0.1)} x={260} y={560} />
      <Label text={<>Rock ≈ <span style={{color: BLUE}}>3×</span> heavier than water</>} o={win(t, T.split + 0.2, B.l7 + 0.2)} x={120} y={560} />
      <Label text={<span style={{color: '#fff'}}>Level below the line</span>} color={RED} o={win(t, B.l7 + 0.3, B.total + 1)} x={280} y={560} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', fontFamily: SANS, fontSize: 24, fontWeight: 700, letterSpacing: 2,
        color: '#fff', opacity: 0.85 * win(t, T.splash + 1.7, B.total + 1), textShadow: '0 1px 10px rgba(0,0,0,0.8)'}}>DROP EXAGGERATED</div>
      {captions && <Captions t={t} words={words} lines={LINES} accent={BLUE} font={SANS} />}
      {audio && <Audio src={staticFile('mix.wav')} />}
    </AbsoluteFill>
  );
};
