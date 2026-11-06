// Grand Canyon 01: one continuous 3D shot timed to the voiceover (beats.json), captions on top, labels pinned to
// the world, honesty tags at the foot of the safe area.
import React from 'react';
import * as THREE from 'three';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from './kit/three-canvas';
import {useFields, Y, wx, wz, northKm, TILT, BANDS} from './terrain';
import {World, FPS, planFor, rigAt, project, stateAt, ramp} from './World';
import {Captions, GOLD} from './Captions';
import {SANS} from './kit/fonts';
import B from './beats.json';

export {FPS};
export const DUR = Math.ceil(B.total * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const win = (t: number, a: number, b: number, fade = 0.3) => Math.min(interpolate(t, [a, a + fade], [0, 1], clamp), interpolate(t, [b - fade, b], [1, 0], clamp));

const Big: React.FC<{o: number; value: string; label: string; y?: number}> = ({o, value, label, y = 1180}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)`}}>
  <div style={{padding: '14px 44px 20px', borderRadius: 36, background: 'rgba(20,12,8,0.42)', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: SANS, color: '#fff', textShadow: '0 2px 24px rgba(0,0,0,0.6)'}}>
    <div style={{fontSize: 112, fontWeight: 900, letterSpacing: -3, color: GOLD, fontVariantNumeric: 'tabular-nums'}}>{value}</div>
    <div style={{fontSize: 40, fontWeight: 700, opacity: 0.9}}>{label}</div>
  </div></div>
);
const Tag: React.FC<{x: number; y: number; o: number; text: string; sub?: string}> = ({x, y, o, text, sub}) => (x < 40 || x > 1040 || y < 480 || y > 1420) ? null : (
  <div style={{position: 'absolute', left: Math.max(70, Math.min(1010 - 360, x + 26)), top: y - 28, opacity: o, fontFamily: SANS, color: '#fff', textShadow: '0 2px 14px rgba(0,0,0,0.75)'}}>
    <div style={{position: 'absolute', left: -26 - Math.max(0, Math.max(70, Math.min(650, x + 26)) - (x + 26)), top: 26, width: 14, height: 14, borderRadius: 7, background: GOLD, boxShadow: `0 0 16px ${GOLD}`}} />
    <div style={{fontSize: 46, fontWeight: 900}}>{text}</div>
    {sub && <div style={{fontSize: 30, fontWeight: 700, opacity: 0.85}}>{sub}</div>}
  </div>
);
const Honest: React.FC<{text: string; o: number}> = ({text, o}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1440, textAlign: 'center', opacity: o * 0.85, fontFamily: SANS, fontSize: 28, fontWeight: 700,
    letterSpacing: 2, textTransform: 'uppercase', color: '#fff', textShadow: '0 1px 10px rgba(0,0,0,0.8)'}}>{text}</div>
);

export const Film: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const f = useFields();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#6F86A6 0%, #B9A79A 38%, #D9B996 55%, #C9A98A 100%)'}}>
      {f && (
        <ThreeCanvas width={1080} height={1920} gl={{logarithmicDepthBuffer: true, antialias: true, alpha: true}} camera={{fov: 40, near: 0.0002, far: 400, position: [0, 10, 30]}}>
          <World f={f} t={t} />
        </ThreeCanvas>
      )}
      {f && <Overlay f={f} t={t} />}
      <Captions t={t} />
    </AbsoluteFill>
  );
};

const Overlay: React.FC<{f: NonNullable<ReturnType<typeof useFields>>; t: number}> = ({f, t}) => {
  const plan = planFor(f), rig = rigAt(plan.keys, t), s = stateAt(t);
  const P = (v: THREE.Vector3) => project(v, rig);
  // the mile: a vertical bar from the river up one mile (x VEX)
  const base = plan.today(160), top = base.clone().setY(base.y + 1.609 * 1.6);
  const pb = P(base), pt = P(top), mileO = win(t, B.mile - 0.1, B.l3 + 0.3);
  // rock layers on the west face of the block, south of the river: where each band meets the canyon wall
  const exitRow = f.river[0][1];   // west end of the river
  // labels sit on the block's flat cut face, 2.5 km south of the river's notch, where the whole stack shows
  const faceRow = Math.min(f.G - 1, exitRow + Math.round(2.5 / f.cell));
  const face = (m: number) => new THREE.Vector3(wx(f, 0) - 0.02, Y(m + TILT * northKm(f, exitRow)) + s.up, wz(f, exitRow));
  const mid = (i: number) => (BANDS[i].top + (BANDS[i + 1]?.top ?? 700)) / 2;
  const sea = P(new THREE.Vector3(-36, Y(400) + 0.3, f.river.length ? wz(f, exitRow) : 0));
  const dropO = Math.max(win(t, B.drop1 - 0.05, B.drop1 + 1.8), win(t, B.drop2 - 0.05, B.cut + 0.4));
  const tags: [number, number, number, string, string?][] = [
    [5, B.seabeds, B.swamps, 'Seabed', 'Redwall Limestone'], [3, B.swamps, B.desert, 'Swamps', 'Hermit Formation'],
    [2, B.desert, B.hard, 'Desert dunes', 'Coconino Sandstone'],
  ];
  const steps: [number, string][] = [[2, 'Cliff'], [3, 'Slope'], [5, 'Cliff'], [7, 'Slope']];
  const stepsO = win(t, B.hard + 0.1, B.l8 - 0.1);
  const honest = (
    t < B.l1 + 0.6 ? 'Magnified illustration' :
    t < B.grit ? 'Real terrain (USGS) · heights ×1.6' :
    t < B.l4 + 1.4 ? 'Magnified illustration' :
    t < B.l6 ? 'Timeline compressed · not to scale' :
    t < B.l9 - 0.3 ? 'Real terrain (USGS) · heights ×1.6' :
    t < B.l10 ? 'Timeline compressed' :
    t < B.total - 1.4 ? 'Real terrain (USGS) · heights ×1.6' : 'Magnified illustration');
  return (
    <AbsoluteFill>
      <Big o={win(t, B.billion - 0.1, B.l1 + 0.9)} value="1.8 billion" label="years old" />
      <Big o={win(t, B.six - 0.1, B.l2 + 0.2)} value="5–6 million" label="years: the canyon" />
      {pb.visible && pt.visible && mileO > 0 && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: mileO}}>
          <line x1={pb.x} y1={pb.y} x2={pt.x} y2={pb.y + (pt.y - pb.y) * ramp(t, B.mile - 0.1, B.mile + 0.6)} stroke={GOLD} strokeWidth={6} strokeLinecap="round" />
          <text x={pt.x + 22} y={(pb.y + pt.y) / 2} fill="#fff" fontFamily="Hanken Grotesk" fontWeight={900} fontSize={56} style={{filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.7))'}}>1 mile</text>
        </svg>
      )}
      {dropO > 0 && <Tag x={sea.x} y={sea.y - 60} o={dropO} text="Steep drop" sub="to the sea" />}
      {tags.map(([i, a, b, text, sub]) => { const p = P(face(mid(i))); return p.visible ? <Tag key={text} x={84} y={p.y} o={win(t, a - 0.05, b + 0.6)} text={text} sub={sub} /> : null; })}
      {steps.map(([i, text]) => { const p = P(face(mid(i))); return p.visible ? <Tag key={i} x={text === 'Cliff' ? 84 : 560} y={p.y} o={stepsO * (text === 'Slope' ? ramp(t, B.crumble - 0.1, B.crumble + 0.3) : 1)} text={text} /> : null; })}
      <Big o={win(t, B.eighteen - 0.1, B.l9 - 0.2)} value="18 miles" label="rim to rim, at the widest" />
      <Honest text={honest} o={1} />
    </AbsoluteFill>
  );
};
