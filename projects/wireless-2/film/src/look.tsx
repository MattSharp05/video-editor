// Part 2 look helpers. Tokens are the pick's "Wireless Night" palette (pictures-pick §1.1); once film-kit lands they
// come from src/series. Everything here is part-only infrastructure (no kit export names).
import React from 'react';
import {Spark as KSpark} from './series/spark';
import {continueRender, delayRender, random, staticFile} from 'remotion';

export const C = {
  fog: '#D5DED9', newsprint: '#E4E7DF', mist: '#9DB3B5', slate: '#557482', deep: '#26414F', ink: '#14222A',
  skin: '#F0E4D4', spark: '#6FF3FF', sparkHalo: '#2FB8E0', cora: '#FF6F87', clue: '#FFD23F', lamp: '#FFB98A',
  captionText: '#F7F1E6',
};
export const FONT = {
  plaque: "'Abril Fatface', serif", period: "'Old Standard TT', serif", wire: "'Courier Prime', monospace",
  sans: "'Hanken Grotesk', sans-serif",
};

const FACES: [string, string, string, string?][] = [
  ['Hanken Grotesk', '600', 'HankenGrotesk-700.woff2'], ['Hanken Grotesk', '800', 'HankenGrotesk-800.woff2'],
  ['Abril Fatface', '400', 'AbrilFatface-Regular.ttf'], ['Old Standard TT', '400', 'OldStandard-Regular.ttf'],
  ['Old Standard TT', '700', 'OldStandard-Bold.ttf'], ['Old Standard TT', '400', 'OldStandard-Italic.ttf', 'italic'],
  ['Courier Prime', '700', 'CourierPrime-Bold.ttf'],
];
if (typeof document !== 'undefined') {
  const h = delayRender('fonts-p2');
  Promise.all(FACES.map(([fam, w, file, style]) => {
    const ff = new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w, style: style ?? 'normal'});
    document.fonts.add(ff);
    return ff.load();
  })).then(() => continueRender(h)).catch(() => continueRender(h));
}

// ---------- time helpers (t in seconds) ----------
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const c = clamp01(x); return c * c * (3 - 2 * c); };
export const ramp = (t: number, a: number, d: number) => sm((t - a) / d);
export const lin = (t: number, a: number, d: number) => clamp01((t - a) / d);
export const osc = (t: number, hz: number, ph = 0) => Math.sin((t * hz + ph) * Math.PI * 2);
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const win = (t: number, a: number, b: number, d = 0.25) => Math.min(ramp(t, a, d), 1 - ramp(t, b - d, d));
export const rnd = (s: string) => random(s);
export const backOut = (x: number) => { const c = clamp01(x), s = 1.7; return 1 + (s + 1) * Math.pow(c - 1, 3) + s * Math.pow(c - 1, 2); };

// ---------- SVG defs: halftone screens ----------
export const Defs: React.FC = () => (
  <defs>
    <pattern id="ht" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx={4.5} cy={4.5} r={2.2} fill={C.ink} opacity={0.35} />
    </pattern>
    <pattern id="htf" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx={3.5} cy={3.5} r={1.4} fill={C.ink} opacity={0.25} />
    </pattern>
    <pattern id="htc" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx={4.5} cy={4.5} r={2.2} fill={C.cora} opacity={0.3} />
    </pattern>
    <radialGradient id="lampG"><stop offset="0" stopColor={C.lamp} stopOpacity={0.85} /><stop offset="1" stopColor={C.lamp} stopOpacity={0} /></radialGradient>
    <radialGradient id="sparkG"><stop offset="0" stopColor="#fff" stopOpacity={1} /><stop offset="0.25" stopColor={C.spark} stopOpacity={0.9} /><stop offset="1" stopColor={C.sparkHalo} stopOpacity={0} /></radialGradient>
    <linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.mist} /><stop offset="0.7" stopColor={C.fog} /><stop offset="1" stopColor={C.lamp} stopOpacity={0.9} /></linearGradient>
    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.deep} /><stop offset="1" stopColor={C.slate} /></linearGradient>
    <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.mist} /><stop offset="1" stopColor={C.fog} /></linearGradient>
    <linearGradient id="fogBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.fog} stopOpacity={0} /><stop offset="0.5" stopColor={C.fog} stopOpacity={0.55} /><stop offset="1" stopColor={C.fog} stopOpacity={0} /></linearGradient>
  </defs>
);

// Misregistration print: fill shapes offset (+3,+2) from their ink line.
export const Mis: React.FC<{children: React.ReactNode}> = ({children}) => <g transform="translate(3,2)">{children}</g>;

// Ink-lined shape with a halftone shadow overlay.
export const Shape: React.FC<{d: string; fill: string; sw?: number; shade?: boolean; far?: boolean; op?: number}> = ({d, fill, sw = 3, shade, far, op = 1}) => (
  <g opacity={op}>
    <Mis><path d={d} fill={fill} /></Mis>
    {shade && <path d={d} fill={far ? 'url(#htf)' : 'url(#ht)'} />}
    <path d={d} fill="none" stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
  </g>
);

export const rectD = (x: number, y: number, w: number, h: number) => `M${x},${y} h${w} v${h} h${-w} Z`;
export const ellD = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0 Z`;

// Fog band: a soft drifting horizontal band (counts as a mover).
export const Fog: React.FC<{t: number; y: number; h?: number; speed?: number; op?: number; seed?: string}> = ({t, y, h = 260, speed = 14, op = 1, seed = 'f'}) => {
  const x = ((t * speed + rnd(seed) * 900) % 1600) - 1600;
  return (
    <g opacity={op}>
      {[0, 1, 2].map((k) => <rect key={k} x={x + k * 1600} y={y} width={1700} height={h} fill="url(#fogBand)" />)}
    </g>
  );
};

// Gulls: each on its own path.
export const Gulls: React.FC<{t: number; n?: number; seed?: string; y0?: number; y1?: number; s?: number; op?: number}> = ({t, n = 3, seed = 'g', y0 = 300, y1 = 800, s = 1, op = 1}) => (
  <g opacity={op}>
    {[...Array(n)].map((_, k) => {
      const r = (q: string) => rnd(`${seed}${k}${q}`);
      const sp = 40 + r('v') * 70, dir = r('d') > 0.5 ? 1 : -1;
      const x = dir > 0 ? ((r('x') * 1400 + t * sp) % 1400) - 160 : 1240 - ((r('x') * 1400 + t * sp) % 1400);
      const y = y0 + r('y') * (y1 - y0) + Math.sin(t * (0.7 + r('f')) + k) * 30;
      const flap = Math.sin(t * (6 + r('w') * 3) + k * 2) * 12;
      const sc = s * (0.7 + r('s') * 0.6);
      return <path key={k} transform={`translate(${x},${y}) scale(${sc * dir},${sc})`} d={`M-26,${flap} Q-13,${-6 + flap * 0.3} 0,4 Q13,${-6 + flap * 0.3} 26,${flap}`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />;
    })}
  </g>
);

// Ring drawn on around a target (the clue look).
export const Ring: React.FC<{t: number; at: number; cx: number; cy: number; r: number; seed?: string}> = ({t, at, cx, cy, r, seed = 'r'}) => {
  const k = lin(t, at, 8 / 30);
  if (k <= 0) return null;
  const c = 2 * Math.PI * r;
  const wob = rnd(seed) * 0.2 - 0.1;
  return <ellipse cx={cx} cy={cy} rx={r} ry={r * (0.9 + wob)} fill="none" stroke={C.clue} strokeWidth={5} strokeDasharray={`${c * k} ${c}`} transform={`rotate(${-90 + wob * 40} ${cx} ${cy})`} strokeLinecap="round" />;
};

// The Spark: the kit's (idle crackle). s = size.
export const SparkDot: React.FC<{t: number; x: number; y: number; s?: number; seed?: string}> = ({t, x, y, s = 1}) => (
  <KSpark fr={Math.round(t * 30)} x={x} y={y} size={s} mode="idle" />
);

// Trail of a moving point: pass a function of time.
export const Trail: React.FC<{t: number; path: (t: number) => [number, number]; len?: number; op?: number}> = ({t, path, len = 0.4, op = 1}) => {
  const pts: string[] = [];
  for (let k = 0; k <= 12; k++) { const [x, y] = path(t - (len * k) / 12); pts.push(`${x},${y}`); }
  return (
    <g opacity={op} fill="none" strokeLinecap="round">
      <polyline points={pts.join(' ')} stroke={C.sparkHalo} strokeWidth={16} opacity={0.4} />
      <polyline points={pts.join(' ')} stroke={C.spark} strokeWidth={6} />
      <polyline points={pts.slice(0, 5).join(' ')} stroke="#fff" strokeWidth={2} />
    </g>
  );
};
