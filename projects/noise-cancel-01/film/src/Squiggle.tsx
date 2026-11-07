// The film's sound wave: a wavy path with two grumpy eyes. Steady = smooth cos bumps; jag > 0 = a changing voice.
// The shape is even in u (cos), so rotating it 180° gives exactly the inverted copy.
import React from 'react';
import {rnd} from './common';

export type SqProps = {
  x: number; y: number; len?: number; amp?: number; bumps?: number; rot?: number; flip?: number; // flip: 0 = upright, 1 = turned over (backflip progress)
  color: string; op?: number; label?: string; labelOp?: number; t: number; seed?: number; jag?: number; pop?: number; wob?: number;
  sw?: number; glove?: number; eyes?: boolean; squint?: number; labelScale?: number;
};
export const sqPath = (len: number, amp: number, bumps: number, t: number, seed: number, jag: number, wob: number) => {
  const n = 64; let d = '';
  for (let i = 0; i <= n; i++) {
    const u = i / n - 0.5;
    const env = Math.pow(Math.cos(Math.PI * u), 0.6);
    let y = Math.cos(2 * Math.PI * bumps * u) * (1 + wob * 0.12 * Math.sin(t * 5 + seed));
    if (jag > 0) {
      // a voice: lumpy harmonics whose mix keeps changing with time
      const r1 = rnd(seed + 1), r2 = rnd(seed + 2);
      y = y * (1 - jag) + jag * (0.8 * Math.sin(2 * Math.PI * (bumps * 1.7) * u + t * 3.1 + r1 * 6) * Math.sin(t * 2.3 + r2 * 6)
        + 0.6 * Math.sign(Math.sin(2 * Math.PI * 3.3 * u + t * 4.7 + r2 * 9)) * Math.abs(Math.cos(t * 1.7 + r1 * 4)) + 0.5 * Math.sin(2 * Math.PI * 7 * u - t * 6));
    }
    const px = u * len, py = -amp * y * env;
    d += (i ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1);
  }
  return d;
};

export const Squiggle: React.FC<SqProps> = (p) => {
  const {x, y, len = 120, amp = 22, bumps = 2, rot = 0, flip = 0, color, op = 1, label, labelOp = 0, t, seed = 1, jag = 0, pop: pp = 0, wob = 1, sw = 9, glove = 0, eyes = true, squint = 0, labelScale = 1} = p;
  if (op <= 0.001) return null;
  const flat = Math.min(1, pp / 0.55);           // flatten first
  const burst = Math.max(0, (pp - 0.5) / 0.5);    // then puff
  const a = amp * (1 - flat);
  const lineOp = op * (1 - burst);
  const fr = flip * 180;
  const hx = len * 0.5 - 6;   // eyes at the head end (+x)
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot + fr})`}>
      {lineOp > 0.01 && (
        <g opacity={lineOp}>
          <path d={sqPath(len, a, bumps, t, seed, jag, wob)} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={sw + 6} strokeLinecap="round" strokeLinejoin="round" />
          <path d={sqPath(len, a, bumps, t, seed, jag, wob)} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          {eyes && [-1, 1].map((s) => (
            <g key={s} transform={`translate(${hx - 4} ${-a * 0.25 + s * sw * 0.95 - sw * 1.2})`}>
              <ellipse rx={sw * 0.78} ry={sw * 0.78 * (1 - squint * 0.6)} fill="#fff" />
              <circle cx={sw * 0.25} cy={sw * 0.05} r={sw * 0.38} fill={'#1A1A1A'} />
              <path d={`M${-sw * 0.9} ${-sw * (0.95 - squint * 0.3) + s * sw * 0.18} L${sw * 0.9} ${-sw * (0.95 - squint * 0.3) - s * sw * 0.32}`} stroke="#1A1A1A" strokeWidth={sw * 0.32} strokeLinecap="round" />
            </g>
          ))}
          {glove > 0 && <g transform={`translate(${len * 0.5 + sw * 1.2} ${-sw * 0.6}) scale(${glove})`}>
            <rect x={-sw * 0.6} y={-sw * 0.9} width={sw * 2.4} height={sw * 2.2} rx={sw * 0.9} fill="#E2373B" stroke="#7A1215" strokeWidth={sw * 0.2} />
            <rect x={-sw * 1.1} y={-sw * 0.5} width={sw * 0.7} height={sw * 1.4} rx={sw * 0.2} fill="#F4EEE2" /></g>}
        </g>
      )}
      {burst > 0 && burst < 1 && Array.from({length: 10}, (_, i) => {
        const ang = (i / 10) * Math.PI * 2 + rnd(seed * 7 + i) * 0.6, dist = (len * 0.25 + rnd(seed + i * 3) * len * 0.4) * Math.pow(burst, 0.55);
        return <circle key={i} cx={Math.cos(ang) * dist} cy={Math.sin(ang) * dist * 0.7} r={sw * (0.9 + rnd(seed + i) * 0.8) * (1 - burst * 0.6)} fill="#EDEAF2" opacity={op * 0.85 * (1 - burst)} />;
      })}
      {label && labelOp > 0.01 && (
        <g transform={`rotate(${-(rot + fr)})`} opacity={labelOp * op * (1 - burst)}>
          <text x={0} y={-amp - sw * 2.6} textAnchor="middle" fontFamily="'Hanken Grotesk'" fontWeight={800} fontSize={sw * 2.6 * labelScale} letterSpacing={sw * 0.15}
            fill={color} stroke="rgba(10,12,20,0.85)" strokeWidth={sw * 0.55} paintOrder="stroke">{label}</text>
        </g>
      )}
    </g>
  );
};

// printed word on an object (SVG, in the object's own units)
export const Label: React.FC<{x: number; y: number; text: string; size: number; color?: string; op?: number; rot?: number}> = ({x, y, text, size, color = '#F4EEE2', op = 1, rot = 0}) =>
  op <= 0.01 ? null : (
    <text x={x} y={y} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} textAnchor="middle" fontFamily="'Hanken Grotesk'" fontWeight={800} fontSize={size} letterSpacing={size * 0.06}
      fill={color} stroke="rgba(10,12,20,0.8)" strokeWidth={size * 0.2} paintOrder="stroke" opacity={op}>{text}</text>
  );
