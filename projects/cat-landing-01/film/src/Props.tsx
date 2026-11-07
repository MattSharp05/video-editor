// Props and overlays in world space: toast, thought bubbles, labels (tags), turn rings, stopwatch, the hand,
// the chalk wall, dust puffs, the click burst, the inner-ear cockpit (its own screen-space world).
import React from 'react';
import {interpolate, random} from 'remotion';
import {MARKER, SANS} from './kit/fonts';
import {Cat} from './Cat';

export const INK = '#3A2418', TEAL = '#14B8C8', VIOLET = '#8B6CF0';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Toast: React.FC<{x: number; y: number; a: number; s?: number; face?: boolean}> = ({x, y, a, s = 1}) => (
  <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}>
    <path d="M-62,60 L-62,-30 Q-80,-78 -30,-82 Q0,-100 30,-82 Q80,-78 62,-30 L62,60 Z" fill="#E3A35C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M-48,50 L-48,-26 Q-62,-62 -24,-66 Q0,-80 24,-66 Q62,-62 48,-26 L48,50 Z" fill="#FBE3B0" />
    <path d="M-30,-20 Q-10,-40 20,-24 Q40,-6 18,14 Q-10,30 -26,10 Q-40,-4 -30,-20 Z" fill="#FFE066" stroke="#E8B530" strokeWidth={3} />
  </g>
);

// a hand-lettered label stuck on an object: pops in with a tick at `at`, fades after `hold` s
export const Tag: React.FC<{x: number; y: number; text: string; t: number; at: number; hold?: number; size?: number; rot?: number; color?: string; inv?: number}> = ({x, y, text, t, at, hold = 1.7, size = 46, rot = -4, color = INK, inv = 1}) => {
  const k = interpolate(t, [at, at + 0.12, at + 0.22], [0, 1.15, 1], clamp);
  const o = interpolate(t, [at, at + 0.06, at + hold, at + hold + 0.3], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const w = text.length * size * 0.56 + 40;
  return (
    <g transform={`translate(${x},${y}) scale(${k * inv}) rotate(${rot})`} opacity={o}>
      <rect x={-w / 2 + 4} y={-size * 0.75 + 6} width={w} height={size * 1.5} rx={14} fill="rgba(58,36,24,0.25)" />
      <rect x={-w / 2} y={-size * 0.75} width={w} height={size * 1.5} rx={14} fill="#FFFDF6" stroke={INK} strokeWidth={4} />
      <text x={0} y={size * 0.28} textAnchor="middle" fontFamily={MARKER} fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// thought bubble with a doodled tail spinning inside (the myth)
export const Bubble: React.FC<{x: number; y: number; r: number; t: number; seed: number; pop: number}> = ({x, y, r, t, seed, pop}) => {
  if (pop >= 1) return null;
  const sc = pop > 0 ? 1 + pop * 0.5 : 1, o = 1 - pop;
  const spin = t * (5 + seed % 3) * 60;
  return (
    <g transform={`translate(${x},${y}) scale(${sc})`} opacity={o}>
      <circle r={r} fill="#FFFFFF" stroke={INK} strokeWidth={4} opacity={0.95} />
      <circle cx={-r * 0.7} cy={r * 1.05} r={r * 0.16} fill="#fff" stroke={INK} strokeWidth={3} />
      <circle cx={-r * 0.95} cy={r * 1.38} r={r * 0.09} fill="#fff" stroke={INK} strokeWidth={3} />
      {/* doodle: a little cat back with a propeller tail */}
      <g transform={`scale(${r / 80})`}>
        <ellipse cx={8} cy={14} rx={34} ry={18} fill="#F29A3E" stroke={INK} strokeWidth={4} />
        <circle cx={44} cy={2} r={16} fill="#F29A3E" stroke={INK} strokeWidth={4} />
        <g transform={`translate(-26,8) rotate(${spin})`}>
          <path d="M0,0 Q-20,-8 -42,0 M0,0 Q20,8 42,0" stroke={INK} strokeWidth={9} strokeLinecap="round" fill="none" />
          <path d="M0,0 Q-20,-8 -42,0 M0,0 Q20,8 42,0" stroke="#F29A3E" strokeWidth={5} strokeLinecap="round" fill="none" />
        </g>
        <path d="M-60,-30 a14,14 0 1,1 10,10" stroke="#9AA" strokeWidth={4} fill="none" strokeDasharray="6 6" />
      </g>
      {pop > 0 && Array.from({length: 8}).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * r * 1.1} y1={Math.sin(a) * r * 1.1} x2={Math.cos(a) * r * (1.3 + pop)} y2={Math.sin(a) * r * (1.3 + pop)} stroke={INK} strokeWidth={4} strokeLinecap="round" />;
      })}
    </g>
  );
};

// a turn ring around one half: an ellipse seen edge-on, beads orbit by `phase` (the half's roll); `o` opacity
export const Ring: React.FC<{x: number; y: number; rx: number; ry: number; phase: number; color: string; o: number; front: boolean; rot?: number}> = ({x, y, rx, ry, phase, color, o, front, rot = 0}) => {
  if (o <= 0) return null;
  const beads = Array.from({length: 6}).map((_, i) => {
    const a = phase + (i / 6) * Math.PI * 2;
    return {x: Math.sin(a) * rx * 0.25, y: Math.cos(a) * ry, z: Math.sin(a), i};
  });
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
      {front ? null : <ellipse rx={rx * 0.25} ry={ry} fill="none" stroke={color} strokeWidth={6} opacity={0.5} />}
      {beads.filter((b) => (front ? b.z > 0 : b.z <= 0)).map((b) => <circle key={b.i} cx={b.x} cy={b.y} r={b.i === 0 ? 15 : 11} fill={b.i === 0 ? '#fff' : color} stroke={INK} strokeWidth={3} />)}
      {front ? <path d={`M0,${-ry} A${rx * 0.25},${ry} 0 0,1 0,${ry}`} fill="none" stroke={color} strokeWidth={7} /> : null}
    </g>
  );
};

export const Stopwatch: React.FC<{x: number; y: number; s: number; sweep: number; o: number}> = ({x, y, s, sweep, o}) => {
  if (o <= 0) return null;
  const a = sweep * 360; // full circle = 1 second
  const rad = (d: number) => ((d - 90) * Math.PI) / 180;
  const R = 110;
  const wedge = `M0,0 L${Math.cos(rad(0)) * R},${Math.sin(rad(0)) * R} A${R},${R} 0 ${a > 180 ? 1 : 0},1 ${Math.cos(rad(a)) * R},${Math.sin(rad(a)) * R} Z`;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      <rect x={-22} y={-170} width={44} height={36} rx={8} fill="#B8C4CC" stroke={INK} strokeWidth={5} />
      <circle r={140} fill="#EEF4F6" stroke={INK} strokeWidth={8} />
      <circle r={124} fill="#fff" />
      <path d={`M0,-124 A124,124 0 0,1 0,124`} fill="#FFE7A8" opacity={0.6} />
      {a > 0.5 && <path d={wedge} fill={TEAL} opacity={0.75} />}
      {Array.from({length: 10}).map((_, i) => <rect key={i} x={-3} y={-122} width={6} height={i % 5 === 0 ? 24 : 14} fill={INK} transform={`rotate(${i * 36})`} />)}
      <rect x={-4} y={-112} width={8} height={116} rx={4} fill="#E0483A" transform={`rotate(${a})`} />
      <circle r={12} fill={INK} />
    </g>
  );
};

// a friendly cartoon human hand (open, palm toward camera when flip=0; back of hand when flip=1 is mirrored)
export const Hand: React.FC<{x: number; y: number; rot: number; s?: number; scratch?: number}> = ({x, y, rot, s = 1, scratch = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-70} y={40} width={140} height={260} rx={40} fill="#7FB2E5" stroke={INK} strokeWidth={5} />
    <path d="M-62,60 Q-70,-30 -40,-40 L40,-40 Q74,-30 62,60 Z" fill="#F6C7A1" stroke={INK} strokeWidth={5} />
    {[-42, -14, 14, 42].map((fx, i) => {
      const curl = scratch * (i % 2 === 0 ? 1 : 0.6);
      return <rect key={i} x={fx - 13} y={-120 + Math.abs(fx) * 0.5 + curl * 30} width={26} height={96 - curl * 30} rx={13} fill="#F6C7A1" stroke={INK} strokeWidth={5} />;
    })}
    <rect x={-100} y={-20} width={26} height={80} rx={13} fill="#F6C7A1" stroke={INK} strokeWidth={5} transform="rotate(-35 -87 20)" />
  </g>
);

export const Puff: React.FC<{x: number; y: number; t: number; at: number; dir: number}> = ({x, y, t, at, dir}) => {
  const k = (t - at) / 0.9;
  if (k < 0 || k > 1) return null;
  return (
    <g opacity={1 - k}>
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={x + dir * (20 + i * 28) * (0.3 + k)} cy={y - 10 - i * 10 * k - 20 * k} r={(14 + i * 6) * (0.5 + k)} fill="#FFF3DD" stroke="#E9CFA8" strokeWidth={3} />)}
    </g>
  );
};

export const Burst: React.FC<{x: number; y: number; t: number; at: number; color?: string; n?: number; r?: number}> = ({x, y, t, at, color = '#FFD54A', n = 10, r = 90}) => {
  const k = (t - at) / 0.5;
  if (k < 0 || k > 1) return null;
  return (
    <g transform={`translate(${x},${y})`} opacity={1 - k * k}>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.3;
        return <path key={i} d={`M${Math.cos(a) * r * (0.3 + k * 0.6)},${Math.sin(a) * r * (0.3 + k * 0.6)} L${Math.cos(a) * r * (0.7 + k)},${Math.sin(a) * r * (0.7 + k)}`} stroke={color} strokeWidth={10 * (1 - k) + 3} strokeLinecap="round" />;
      })}
      <circle r={r * 0.3 * (1 - k)} fill="#fff" />
    </g>
  );
};

// chalk outline of a wall within reach: crumbles into falling bits from `crumble` 0..1
export const ChalkWall: React.FC<{x: number; y: number; o: number; crumble: number}> = ({x, y, o, crumble}) => {
  if (o <= 0) return null;
  const bits = Array.from({length: 22}).map((_, i) => ({bx: (random(`cb${i}`) - 0.5) * 60, by: -260 + i * 24, r: random(`cr${i}`)}));
  return (
    <g transform={`translate(${x},${y})`} opacity={o}>
      {bits.map((b, i) => {
        const d = Math.max(0, crumble * 1.6 - b.r * 0.6);
        return <rect key={i} x={b.bx - 22 + d * (b.r - 0.5) * 120} y={b.by + d * d * 500} width={44} height={20} rx={3} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeDasharray="10 6" opacity={1 - Math.min(1, d * 1.1)} transform={`rotate(${d * 200 * (b.r - 0.5)} ${b.bx} ${b.by})`} />;
      })}
    </g>
  );
};

// the cockpit inside the head: screen-space world. Fluid loops slosh (tag "inner ear"), portholes show the kitchen floor
// upside down then turning (tag "eyes"), the "up" dial swings to the floor, a tiny pilot pulls the lever.
export const Cockpit: React.FC<{t: number; t0: number; dial: number; lever: number}> = ({t, t0, dial, lever}) => {
  const lt = t - t0;
  const slosh = Math.sin(t * 5) * 18 * (1 - dial * 0.6);
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#FFB7A6" />
      <radialGradient id="ckg" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stopColor="#FFD8C4" /><stop offset="1" stopColor="#F28C7A" /></radialGradient>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#ckg)" />
      {/* portholes (her eyes from inside): kitchen floor seen upside down, rotating to the right way as the dial turns */}
      {[300, 780].map((px, k) => (
        <g key={k} transform={`translate(${px},640)`}>
          <circle r={170} fill="#8A5A36" stroke={INK} strokeWidth={8} />
          <clipPath id={`ph${k}`}><circle r={145} /></clipPath>
          <g clipPath={`url(#ph${k})`}>
            <g transform={`rotate(${180 - dial * 180 + Math.sin(t * 2 + k) * 4})`}>
              <rect x={-200} y={-200} width={400} height={400} fill="#FFDDB3" />
              <rect x={-200} y={40} width={400} height={200} fill="#C88B57" />
              {[60, 100, 140].map((yy) => <rect key={yy} x={-200} y={yy} width={400} height={5} fill="#A86E40" />)}
              <ellipse cx={0} cy={90} rx={150} ry={34} fill="#3E8FB0" />
              <ellipse cx={0} cy={90} rx={110} ry={22} fill="none" stroke="#F6E3B4" strokeWidth={10} />
              <text x={0} y={-60} textAnchor="middle" fontFamily={MARKER} fontSize={44} fill={INK}>floor</text>
            </g>
          </g>
          <circle r={145} fill="none" stroke="#fff" strokeWidth={6} opacity={0.5} />
          <path d="M-90,-90 A130,130 0 0,1 40,-128" stroke="#fff" strokeWidth={12} fill="none" opacity={0.6} strokeLinecap="round" />
          {[0, 1, 2, 3, 4, 5].map((b) => <circle key={b} cx={Math.cos(b * 1.047) * 158} cy={Math.sin(b * 1.047) * 158} r={7} fill="#D9B07A" />)}
        </g>
      ))}
      {/* the inner ear: three glass loops with sloshing fluid and sparkles */}
      <g transform="translate(540,1180)">
        {[0, 1, 2].map((k) => {
          const rot = [-30, 30, 90][k];
          const lvl = slosh * (k === 1 ? -1 : 1);
          return (
            <g key={k} transform={`rotate(${rot}) translate(0,-80)`}>
              <clipPath id={`lp${k}`}><ellipse rx={120} ry={90} /></clipPath>
              <ellipse rx={120} ry={90} fill="rgba(255,255,255,0.35)" stroke="#fff" strokeWidth={30} opacity={0.7} />
              <g clipPath={`url(#lp${k})`}>
                <rect x={-140} y={lvl} width={280} height={200} fill="#5CC9E0" opacity={0.85} transform={`rotate(${-rot + lvl * 0.6})`} />
              </g>
              <ellipse rx={120} ry={90} fill="none" stroke={INK} strokeWidth={5} />
              <ellipse rx={90} ry={60} fill="none" stroke={INK} strokeWidth={4} />
              {[0, 1, 2, 3].map((j) => <circle key={j} cx={Math.cos(t * 2 + j * 1.6 + k) * 100} cy={Math.sin(t * 2 + j * 1.6 + k) * 74} r={6} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 8 + j)} />)}
            </g>
          );
        })}
      </g>
      {/* the UP dial and the pilot */}
      <g transform="translate(540,1480)">
        <rect x={-300} y={-60} width={600} height={300} rx={40} fill="#6A5A8E" stroke={INK} strokeWidth={6} />
        {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={-240 + i * 40} cy={-20} r={11} fill={['#FF6B6B', '#FFD54A', '#7CE07C', '#5CC9E0', '#FF6B6B'][i]} opacity={0.4 + 0.6 * ((Math.floor(t * 4) + i) % 3 === 0 ? 1 : 0)} />)}
        <g transform="translate(-60,90)">
          <circle r={110} fill="#fff" stroke={INK} strokeWidth={6} />
          <text x={0} y={-62} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={INK}>UP</text>
          <g transform={`rotate(${180 - dial * 180 + Math.sin(t * 9) * (1 - dial) * 10})`}>
            <path d="M0,-88 L18,-50 L6,-50 L6,20 L-6,20 L-6,-50 L-18,-50 Z" fill={TEAL} stroke={INK} strokeWidth={4} />
          </g>
          <circle r={12} fill={INK} />
        </g>
        {/* lever */}
        <g transform={`translate(190,150) rotate(${-30 + lever * 60})`}>
          <rect x={-8} y={-150} width={16} height={150} rx={8} fill="#B8C4CC" stroke={INK} strokeWidth={4} />
          <circle cy={-150} r={26} fill="#E0483A" stroke={INK} strokeWidth={5} />
        </g>
        {/* tiny pilot cat with a headset */}
        <g transform={`translate(180,-110) scale(0.9) rotate(${Math.sin(lt * 3) * 5})`}>
          <path d="M-40,40 Q0,-10 40,40 Z" fill="#F29A3E" stroke={INK} strokeWidth={4} />
          <circle cx={0} cy={0} r={34} fill="#F29A3E" stroke={INK} strokeWidth={4} />
          <path d="M-28,-20 L-34,-56 L-8,-30 Z M28,-20 L34,-56 L8,-30 Z" fill="#F29A3E" stroke={INK} strokeWidth={4} />
          <path d="M-36,0 A36,36 0 0,1 36,0" stroke={INK} strokeWidth={6} fill="none" />
          <rect x={-44} y={-6} width={14} height={22} rx={5} fill={INK} /><rect x={30} y={-6} width={14} height={22} rx={5} fill={INK} />
          <circle cx={-12} cy={2} r={6} fill={INK} /><circle cx={12} cy={2} r={6} fill={INK} />
          <path d={lever > 0.5 ? 'M-8,16 Q0,24 8,16' : 'M-6,18 L6,18'} stroke={INK} strokeWidth={3} fill="none" />
        </g>
      </g>
    </g>
  );
};

// the grey Manx: the same rig, desaturated, no tail
export const Manx: React.FC<React.ComponentProps<typeof Cat>> = (p) => (
  <g style={{filter: 'saturate(0.08) brightness(1.08)'}}><Cat {...p} tail={0} /></g>
);
