// Part-3-only props in the kit's cut-paper style: flat fill, ink outline 3.5 px (props 2.5), a card-coloured cut rim
// and a hard paper shadow (+8, +10). Drawn in local coordinates; place with a <g transform>.
import React from 'react';
import {random} from 'remotion';
import {T, TYPE, SERIF} from './tok';

type CutP = {d: string; fill: string; sw?: number; rim?: boolean; shadow?: boolean; opacity?: number};
// one cut-paper piece: shadow, rim, fill + outline
export const Cut: React.FC<CutP> = ({d, fill, sw = 2.5, rim = true, shadow = true, opacity = 1}) => (
  <g opacity={opacity}>
    {shadow && <path d={d} fill={T.shadow} transform="translate(8 10)" />}
    {rim && <path d={d} fill="none" stroke={T.card} strokeWidth={sw + 8} strokeLinejoin="round" />}
    <path d={d} fill={fill} stroke={T.ink} strokeWidth={sw} strokeLinejoin="round" />
  </g>
);
export const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  r ? `M${x + r},${y}h${w - 2 * r}q${r},0 ${r},${r}v${h - 2 * r}q0,${r} ${-r},${r}h${-(w - 2 * r)}q${-r},0 ${-r},${-r}v${-(h - 2 * r)}q0,${-r} ${r},${-r}z`
    : `M${x},${y}h${w}v${h}h${-w}z`;
// a hand-cut wobble on a rectangle (drawn once, seeded)
export const wrect = (x: number, y: number, w: number, h: number, seed: string, a = 3) => {
  const r = (i: number) => (random(`${seed}${i}`) - 0.5) * 2 * a;
  return `M${x + r(1)},${y + r(2)}L${x + w + r(3)},${y + r(4)}L${x + w + r(5)},${y + h + r(6)}L${x + r(7)},${y + h + r(8)}Z`;
};

// A bundle of lira notes (w 220, h 56) with a paper band.
export const NoteBundle: React.FC<{seed: string; label?: string}> = ({seed, label = 'Lire'}) => (
  <g>
    <Cut d={wrect(0, 0, 220, 56, seed, 2.5)} fill={T.note} />
    <path d="M8,14h204M8,28h204M8,42h204" stroke={T.noteDark} strokeWidth={2} opacity={0.6} />
    <Cut d={rect(88, -3, 44, 62)} fill={T.card} sw={2} shadow={false} rim={false} />
    <text x={110} y={34} fontFamily={TYPE} fontSize={15} textAnchor="middle" fill={T.ink}>{label}</text>
  </g>
);
// the growing stack: n bundles, each with its own little tilt and sway (separate movers)
export const LiraStack: React.FC<{n: number; t: number; sway?: number}> = ({n, t, sway = 0}) => {
  const items = [];
  const whole = Math.floor(n), frac = n - whole;
  for (let i = 0; i < Math.ceil(n); i++) {
    const k = i < whole ? 1 : frac;
    const tilt = (random(`tilt${i}`) - 0.5) * 6 + Math.sin(t * 2.1 + i * 0.7) * sway * (i / 20);
    const dx = (random(`dx${i}`) - 0.5) * 26 + sway * Math.sin(t * 1.3 + i * 0.4) * i * 0.6;
    items.push(<g key={i} transform={`translate(${dx - 110},${-58 * i - 56 - (1 - k) * 120}) rotate(${tilt} 110 28)`} opacity={k}><NoteBundle seed={`b${i}`} /></g>);
  }
  return <g>{items}</g>;
};

// Hotel front: three-storey paper façade, door, steps, sign that flickers (mover).
export const HotelFront: React.FC<{t: number}> = ({t}) => {
  const flick = 0.75 + 0.25 * (Math.sin(t * 13) > 0.6 ? 0.2 : 1) * (0.8 + 0.2 * Math.sin(t * 7));
  return (
    <g>
      <Cut d={wrect(0, 0, 760, 1300, 'hf', 4)} fill={T.paperShade} sw={3.5} />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
        <g key={`${r}${c}`} transform={`translate(${90 + c * 220},${300 + r * 270})`}>
          <Cut d={rect(0, 0, 140, 190, 8)} fill={r === 2 && c === 1 ? T.amberGlow : T.duskBlue} />
          <path d="M70,0v190M0,95h140" stroke={T.ink} strokeWidth={2.5} />
          <Cut d={rect(-14, 190, 168, 16)} fill={T.sepia} shadow={false} />
        </g>
      )))}
      <g opacity={flick}>
        <Cut d={rect(110, 120, 540, 120, 10)} fill={T.card} sw={3.5} />
        <text x={380} y={170} fontFamily={SERIF} fontWeight={900} fontSize={46} textAnchor="middle" fill={T.ink}>Hotel</text>
        <text x={380} y={218} fontFamily={TYPE} fontSize={34} textAnchor="middle" fill={T.ink}>Tripoli-Italia</text>
      </g>
    </g>
  );
};

// Door of room 20: the brass "20" swings like a knocker (angle in degrees); `open` 0..1 swings the leaf.
export const Door20: React.FC<{swing: number; open: number}> = ({swing, open}) => (
  <g>
    <Cut d={rect(-20, -20, 340, 640)} fill={T.nightBlue} sw={3.5} />
    <g transform={`translate(0 0) scale(${1 - open * 0.82} 1)`}>
      <Cut d={rect(0, 0, 300, 600, 4)} fill={T.sepia} sw={3.5} />
      <Cut d={rect(40, 50, 220, 200, 6)} fill="#8C6A49" shadow={false} />
      <Cut d={rect(40, 320, 220, 220, 6)} fill="#8C6A49" shadow={false} />
      <circle cx={262} cy={310} r={14} fill={T.oldGold} stroke={T.ink} strokeWidth={2.5} />
      <g transform={`translate(150 120) rotate(${swing})`}>
        <path d="M0,0v26" stroke={T.ink} strokeWidth={3} />
        <circle cx={0} cy={0} r={6} fill={T.oldGold} stroke={T.ink} strokeWidth={2} />
        <Cut d={rect(-58, 22, 116, 74, 12)} fill={T.oldGold} />
        <text x={0} y={80} fontFamily={SERIF} fontWeight={900} fontSize={58} textAnchor="middle" fill={T.ink}>20</text>
      </g>
    </g>
  </g>
);

// Handcuffs: two rings joined by a chain; `close` 0..1 closes the open ring.
export const Handcuffs: React.FC<{close: number}> = ({close}) => (
  <g>
    <circle cx={-70} cy={0} r={46} fill="none" stroke={T.card} strokeWidth={22} />
    <circle cx={-70} cy={0} r={46} fill="none" stroke="#5E5A55" strokeWidth={13} />
    <circle cx={-70} cy={0} r={46} fill="none" stroke={T.ink} strokeWidth={2.5} strokeDasharray="0" opacity={0.7} />
    <path d="M-24,0 h48" stroke={T.ink} strokeWidth={6} strokeDasharray="10 6" />
    <g transform={`translate(70 0) rotate(${(1 - close) * -70} -46 0)`}>
      <path d="M-46,0 A46,46 0 1 1 46,0 A46,46 0 0 1 0,46" fill="none" stroke={T.card} strokeWidth={22} />
      <path d="M-46,0 A46,46 0 1 1 46,0 A46,46 0 0 1 0,46" fill="none" stroke="#5E5A55" strokeWidth={13} />
    </g>
  </g>
);

// The crack pattern of her paint (craquelure), as ink lines: deterministic, reused by the reference card so they match.
export const crackPaths = (() => {
  const out: string[] = [];
  for (let i = 0; i < 26; i++) {
    let x = random(`cx${i}`) * 420 - 210, y = random(`cy${i}`) * 420 - 210;
    let d = `M${x.toFixed(1)},${y.toFixed(1)}`;
    const ang0 = random(`ca${i}`) * Math.PI * 2;
    for (let s = 0; s < 6; s++) {
      const a = ang0 + (random(`cs${i}_${s}`) - 0.5) * 1.6;
      x += Math.cos(a) * 34; y += Math.sin(a) * 34;
      d += `L${x.toFixed(1)},${y.toFixed(1)}`;
    }
    out.push(d);
  }
  return out;
})();
export const Cracks: React.FC<{draw: number; color?: string; w?: number}> = ({draw, color = T.ink, w = 2.2}) => (
  <g>{crackPaths.map((d, i) => <path key={i} d={d} fill="none" stroke={color} strokeWidth={w} pathLength={1}
    strokeDasharray={`${Math.max(0, Math.min(1, draw * 1.6 - i * 0.02))} 1`} strokeLinecap="round" />)}</g>
);

// Rubber stamp ring with a word (clueRed), `k` 0..1 = landing (scale from 1.6 to 1).
export const Stamp: React.FC<{word: string; k: number; rot?: number}> = ({word, k, rot = -12}) => (
  <g transform={`rotate(${rot}) scale(${1.6 - 0.6 * k})`} opacity={Math.min(1, k * 3)}>
    <circle r={120} fill="none" stroke={T.clueRed} strokeWidth={12} />
    <circle r={100} fill="none" stroke={T.clueRed} strokeWidth={4} />
    <text y={22} fontFamily={TYPE} fontSize={70} textAnchor="middle" fill={T.clueRed} fontWeight={700}>{word}</text>
  </g>
);

// Chalk stick and eraser.
export const Chalk: React.FC = () => <Cut d={rect(-8, -40, 16, 80, 6)} fill="#FBFAF4" sw={2} />;
export const Eraser: React.FC = () => (
  <g><Cut d={rect(-70, -30, 140, 60, 10)} fill={T.sepia} /><Cut d={rect(-70, 12, 140, 18, 6)} fill="#E9E1D0" shadow={false} /></g>
);

// Tally marks scratched on a wall: n of them (groups of 5 with a strike), each appears with its own draw.
export const Tally: React.FC<{n: number}> = ({n}) => {
  const els = [];
  for (let i = 0; i < Math.ceil(n); i++) {
    const g = Math.floor(i / 5), j = i % 5, k = Math.min(1, n - i);
    if (j < 4) els.push(<path key={i} d={`M${g * 110 + j * 20},0v${80 * k}`} stroke={T.card} strokeWidth={7} strokeLinecap="round" />);
    else els.push(<path key={i} d={`M${g * 110 - 10},64L${g * 110 - 10 + 90 * k},${64 - 50 * k}`} stroke={T.card} strokeWidth={7} strokeLinecap="round" />);
  }
  return <g>{els}</g>;
};

// A little paper suitcase for the spider.
export const Suitcase: React.FC = () => (
  <g><Cut d={rect(-14, -10, 28, 20, 3)} fill={T.sepia} sw={1.6} shadow={false} /><path d="M-5,-10v-5h10v5" fill="none" stroke={T.ink} strokeWidth={1.6} /></g>
);

// Confetti burst particles (seeded), progress p 0..1; each piece is its own mover.
export const Confetti: React.FC<{p: number; n?: number; spread?: number; seed?: string}> = ({p, n = 22, spread = 160, seed = 'cf'}) => {
  const cols = [T.clueRed, T.amberGlow, T.duskBlue, T.card, T.oldGold];
  return <g>{Array.from({length: n}, (_, i) => {
    const a = random(`${seed}a${i}`) * Math.PI * 2, r = spread * (0.4 + random(`${seed}r${i}`) * 0.6);
    const x = Math.cos(a) * r * p, y = Math.sin(a) * r * p + 120 * p * p;
    return <rect key={i} x={x} y={y} width={12} height={7} fill={cols[i % 5]} transform={`rotate(${p * 600 * (random(`${seed}s${i}`) - 0.5)} ${x} ${y})`} opacity={1 - p * 0.6} />;
  })}</g>;
};

// The tour poster (1913): Playfair headline, cities.
export const TourPoster: React.FC<{lit: number[]}> = ({lit}) => (
  <g>
    <Cut d={wrect(0, 0, 640, 860, 'tp', 4)} fill={T.card} sw={3.5} />
    <path d={rect(26, 26, 588, 808)} fill="none" stroke={T.clueRed} strokeWidth={5} />
    <text x={320} y={130} fontFamily={TYPE} fontSize={36} textAnchor="middle" fill={T.ink}>1913</text>
    <text x={320} y={230} fontFamily={SERIF} fontWeight={900} fontSize={96} textAnchor="middle" fill={T.ink}>Mona Lisa</text>
    <text x={320} y={300} fontFamily={SERIF} fontWeight={900} fontSize={54} textAnchor="middle" fill={T.clueRed}>in Italy!</text>
    {['Florence', 'Rome', 'Milan'].map((c, i) => (
      <text key={c} x={320} y={560 + i * 90} fontFamily={TYPE} fontSize={56} textAnchor="middle" fill={T.ink} opacity={0.35 + 0.65 * (lit[i] ?? 0)}
        transform={`translate(320 ${545 + i * 90}) scale(${1 + 0.12 * Math.sin(Math.PI * (lit[i] ?? 0))}) translate(-320 ${-(545 + i * 90)})`}>{c}</text>
    ))}
  </g>
);
