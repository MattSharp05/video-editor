// Part 2 local look: the series tokens (pictures-pick §1.1) and small kit-style pieces drawn in SVG.
// Coordinates: every piece draws in 1080×1920 world units; people stand with their feet at (0,0).
// When film-kit/READY lands, shared pieces are swapped for src/series/ (see PLAN.md).
import React from 'react';
import {Img, random, staticFile} from 'remotion';

export const C = {
  paper: '#F1E6CF', paperShade: '#DCCBA8', card: '#F8F1E1', ink: '#231B16', sepia: '#7A5A3C', stone: '#A39A8A',
  nightBlue: '#2C3A57', duskBlue: '#5B6F93', oldGold: '#8E7347', amber: '#F2A93B', glow: '#FFD27A', clueRed: '#B8352A',
  silk: '#A72B2E', smock: '#F7F3EA', glass: '#DDE6EE', trunk: '#EDE8DD',
  skin: ['#E9C3A0', '#D9A57F', '#C08A64', '#9C6B4B'],
};
export const SHADOW = 'rgba(35,27,22,0.28)';
export const SANS = "'Hanken Grotesk', sans-serif";
export const TYPE = "'Special Elite', monospace";
export const SERIF = "'Playfair Display', serif";
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ez = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const ramp = (t: number, a: number, d: number) => ez((t - a) / d);
export const lin = (t: number, a: number, d: number) => Math.max(0, Math.min(1, (t - a) / d));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const step2 = (t: number) => Math.floor(t * 15) / 15; // poses step on twos
export const osc = (t: number, hz: number, ph = 0) => Math.sin((t * hz + ph) * Math.PI * 2);
// damped settle 0→1 with overshoot
export const settle = (t: number, a: number, d = 0.5) => {
  if (t <= a) return 0;
  const x = (t - a) / d;
  return 1 - Math.exp(-4 * x) * Math.cos(x * 7);
};

// A cutout: paper shadow + paper rim + ink outline, all from one path.
export const Cut: React.FC<{d: string; fill: string; sw?: number; rim?: boolean; shadow?: boolean; op?: number}> = ({d, fill, sw = 3.5, rim = true, shadow = true, op = 1}) => (
  <g opacity={op}>
    {shadow && <path d={d} fill={SHADOW} transform="translate(8,10)" />}
    {rim && <path d={d} fill="none" stroke={C.card} strokeWidth={sw + 8} strokeLinejoin="round" />}
    <path d={d} fill={fill} stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
  </g>
);
export const rect = (x: number, y: number, w: number, h: number, r = 6) =>
  `M${x + r},${y} h${w - 2 * r} q${r},0 ${r},${r} v${h - 2 * r} q0,${r} ${-r},${r} h${-(w - 2 * r)} q${-r},0 ${-r},${-r} v${-(h - 2 * r)} q0,${-r} ${r},${-r} Z`;
export const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0 Z`;

// ---------- people (split-pin paper puppets) ----------
export type Pose = {
  x: number; y: number; s?: number; flip?: boolean;
  coat?: string; legs?: string; skin?: string; hair?: string;
  hat?: 'bowler' | 'kepi' | 'cap' | 'top' | 'feather' | 'none';
  hatColor?: string; tache?: boolean; beard?: boolean; glasses?: boolean; monocle?: boolean; collar?: boolean;
  aL?: [number, number]; aR?: [number, number]; // shoulder, elbow angles (deg, 0 = hanging down, + = forward/up)
  walk?: number; // walk phase (cycles); NaN/undefined = standing
  bob?: number; look?: number; lookY?: number; mouth?: 'smile' | 'o' | 'flat' | 'open' | 'frown';
  brows?: 'up' | 'flat' | 'worried' | 'cross';
  hold?: React.ReactNode; holdR?: React.ReactNode; tall?: number; wide?: number; gown?: boolean; hatOff?: number;
  face?: React.ReactNode; // replaces the face (Picasso gag)
};
const arm = (len1: number, len2: number, a1: number, a2: number, col: string, skin: string, hand?: React.ReactNode) => (
  <g transform={`rotate(${-a1})`}>
    <Cut d={rect(-11, -4, 22, len1 + 8, 10)} fill={col} sw={3} rim={false} shadow={false} />
    <g transform={`translate(0,${len1}) rotate(${-a2})`}>
      <Cut d={rect(-10, -4, 20, len2 + 6, 9)} fill={col} sw={3} rim={false} shadow={false} />
      <Cut d={ell(0, len2 + 10, 12, 12)} fill={skin} sw={2.5} rim={false} shadow={false} />
      {hand && <g transform={`translate(0,${len2 + 12}) rotate(${a1 + a2})`}>{hand}</g>}
    </g>
  </g>
);
export const Person: React.FC<Pose> = (p) => {
  const s = p.s ?? 1, tall = p.tall ?? 1, wide = p.wide ?? 1;
  const skin = p.skin ?? C.skin[1], coat = p.coat ?? C.sepia, legs = p.legs ?? C.ink, hair = p.hair ?? C.ink;
  const w = p.walk;
  const sw = w === undefined ? 0 : Math.sin(w * Math.PI * 2);
  const bob = (p.bob ?? 0) + (w === undefined ? 0 : Math.abs(Math.cos(w * Math.PI * 2)) * 8);
  const H = 560 * tall; // body height in units
  const hip = -H * 0.45, sh = -H * 0.75, headY = -H * 0.86;
  const aL = p.aL ?? [w === undefined ? 4 : -sw * 22, w === undefined ? 4 : 10];
  const aR = p.aR ?? [w === undefined ? 4 : sw * 22, w === undefined ? 4 : 10];
  const lx = p.look ?? 0, ly = p.lookY ?? 0;
  const tw = 70 * wide;
  return (
    <g transform={`translate(${p.x},${p.y}) scale(${(p.flip ? -1 : 1) * s},${s})`}>
      <ellipse cx={0} cy={4} rx={80 * wide} ry={12} fill={SHADOW} />
      <g transform={`translate(0,${-bob})`}>
        {/* legs */}
        {!p.gown && [-1, 1].map((k) => (
          <g key={k} transform={`translate(${k * 20 * wide},${hip}) rotate(${k * sw * 18})`}>
            <Cut d={rect(-15, 0, 30, -hip + 2, 8)} fill={legs} sw={3} shadow={false} />
            <Cut d={`M-18,${-hip - 6} q0,-14 18,-14 h22 q12,0 12,14 Z`} fill={C.ink} sw={2.5} rim={false} shadow={false} />
          </g>
        ))}
        {/* back arm */}
        <g transform={`translate(${-tw * 0.62},${sh + 14})`}>{arm(H * 0.17, H * 0.16, aL[0], aL[1], coat, skin, p.hold)}</g>
        {/* torso / coat */}
        <Cut d={p.gown
          ? `M${-tw * 0.7},${sh} Q${-tw * 0.9},${hip} ${-tw * 1.6},-6 L${tw * 1.6},-6 Q${tw * 0.9},${hip} ${tw * 0.7},${sh} Q0,${sh - 20} ${-tw * 0.7},${sh} Z`
          : `M${-tw * 0.7},${sh} Q${-tw * 0.95},${hip} ${-tw * 0.85},${hip + H * 0.12} L${tw * 0.85},${hip + H * 0.12} Q${tw * 0.95},${hip} ${tw * 0.7},${sh} Q0,${sh - 22} ${-tw * 0.7},${sh} Z`} fill={coat} />
        {p.collar && <path d={`M-18,${sh - 6} L0,${sh + 22} L18,${sh - 6}`} fill={C.card} stroke={C.ink} strokeWidth={2.5} />}
        {/* head */}
        <g transform={`translate(0,${headY})`}>
          <Cut d={rect(-14, 10, 28, 40, 6)} fill={skin} sw={2.5} rim={false} shadow={false} />
          <Cut d={ell(0, -36, 56, 66)} fill={skin} />
          {p.face ?? (
            <g>
              <path d={`M-56,-46 Q-50,-112 4,-104 Q52,-100 56,-50 Q40,-82 -6,-80 Q-36,-78 -56,-46 Z`} fill={hair} stroke={C.ink} strokeWidth={2.5} />
              {/* eyes, brows, mouth */}
              <circle cx={-20 + lx * 5} cy={-38 + ly * 4} r={6} fill={C.ink} />
              <circle cx={22 + lx * 5} cy={-38 + ly * 4} r={6} fill={C.ink} />
              {(() => {
                const b = p.brows ?? 'flat';
                const dy = b === 'up' ? -12 : 0, tilt = b === 'worried' ? 6 : b === 'cross' ? -7 : 0;
                return <g stroke={C.ink} strokeWidth={4} strokeLinecap="round">
                  <line x1={-32} y1={-56 + dy - tilt} x2={-10} y2={-56 + dy + tilt} />
                  <line x1={10} y1={-56 + dy + tilt} x2={32} y2={-56 + dy - tilt} />
                </g>;
              })()}
              {p.glasses && <g fill="none" stroke={C.ink} strokeWidth={3}><circle cx={-20} cy={-38} r={14} /><circle cx={22} cy={-38} r={14} /><line x1={-6} y1={-38} x2={8} y2={-38} /></g>}
              {p.monocle && <g fill="none" stroke={C.oldGold} strokeWidth={3.5}><circle cx={22} cy={-38} r={15} /><path d="M37,-38 q10,40 -6,80" stroke={C.ink} strokeWidth={1.5} /></g>}
              {p.tache && <path d="M-26,-6 Q-12,-20 0,-10 Q12,-20 26,-6 Q12,-4 0,-6 Q-12,-4 -26,-6 Z" fill={hair} stroke={C.ink} strokeWidth={2} />}
              {p.beard && <path d="M-40,-10 Q-36,40 0,46 Q36,40 40,-10 Q20,10 0,8 Q-20,10 -40,-10 Z" fill={hair} stroke={C.ink} strokeWidth={2} />}
              {(() => {
                const m = p.mouth ?? 'flat';
                if (m === 'o' || m === 'open') return <ellipse cx={0} cy={6} rx={m === 'o' ? 8 : 12} ry={m === 'o' ? 10 : 14} fill={C.ink} />;
                if (m === 'smile') return <path d="M-14,4 Q0,16 14,4" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />;
                if (m === 'frown') return <path d="M-12,10 Q0,0 12,10" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />;
                return <line x1={-10} y1={6} x2={10} y2={6} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />;
              })()}
            </g>
          )}
          {/* hat */}
          <g transform={`translate(${(p.hatOff ?? 0) * 40},${-(p.hatOff ?? 0) * 70}) rotate(${(p.hatOff ?? 0) * -20})`}>
            {p.hat === 'bowler' && <Cut d="M-74,-78 Q-74,-92 -48,-92 Q-48,-150 0,-150 Q48,-150 48,-92 Q74,-92 74,-78 Z" fill={p.hatColor ?? C.ink} sw={3} />}
            {p.hat === 'kepi' && <Cut d="M-50,-80 L-46,-136 L46,-136 L50,-80 Q70,-78 72,-70 L-50,-70 Z" fill={p.hatColor ?? C.nightBlue} sw={3} />}
            {p.hat === 'cap' && <Cut d="M-58,-74 Q-60,-122 0,-124 Q58,-122 60,-82 Q86,-78 88,-70 L-58,-68 Z" fill={p.hatColor ?? C.smock} sw={3} />}
            {p.hat === 'top' && <Cut d="M-70,-80 L-48,-82 L-44,-190 L44,-190 L48,-82 L70,-80 L70,-70 L-70,-70 Z" fill={p.hatColor ?? C.ink} sw={3} />}
            {p.hat === 'feather' && <g><Cut d="M-110,-76 Q-80,-130 0,-128 Q80,-130 110,-76 Q0,-90 -110,-76 Z" fill={p.hatColor ?? C.duskBlue} sw={3} /><Cut d="M20,-124 Q60,-220 120,-210 Q70,-180 40,-120 Z" fill={C.card} sw={2.5} /></g>}
          </g>
        </g>
        {/* front arm */}
        <g transform={`translate(${tw * 0.62},${sh + 14})`}>{arm(H * 0.17, H * 0.16, aR[0], aR[1], coat, skin, p.holdR)}</g>
      </g>
    </g>
  );
};

// ---------- the Mona Lisa (PD photograph; never redrawn) ----------
export const Mona: React.FC<{x: number; y: number; h?: number; glow?: number; frame?: boolean; crop?: 'full' | 'eyes'; op?: number; rot?: number}> = ({x, y, h = 270, glow = 0.6, frame, crop = 'full', op = 1, rot = 0}) => {
  const w = h * (600 / 894);
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={op}>
      {glow > 0 && <ellipse cx={0} cy={0} rx={w * 0.95} ry={h * 0.8} fill="url(#amberGlow)" opacity={glow} />}
      {frame && <Cut d={rect(-w / 2 - 26, -h / 2 - 26, w + 52, h + 52, 4)} fill={C.oldGold} />}
      <rect x={-w / 2 - 4} y={-h / 2 - 4} width={w + 8} height={h + 8} fill={C.sepia} />
      <image href={staticFile('monalisa.jpg')} x={-w / 2} y={crop === 'eyes' ? -h * 0.35 : -h / 2} width={w} height={h} preserveAspectRatio="xMidYMid slice"
        clipPath={crop === 'eyes' ? undefined : undefined} />
    </g>
  );
};
export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="amberGlow"><stop offset="0%" stopColor={C.glow} stopOpacity={0.95} /><stop offset="55%" stopColor={C.amber} stopOpacity={0.45} /><stop offset="100%" stopColor={C.amber} stopOpacity={0} /></radialGradient>
    <radialGradient id="lampGlow"><stop offset="0%" stopColor="#FFF1C8" stopOpacity={0.9} /><stop offset="100%" stopColor="#FFF1C8" stopOpacity={0} /></radialGradient>
    <pattern id="halftone" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.2" fill={C.ink} /></pattern>
  </defs>
);

// ---------- props ----------
// One iron S-hook, 34 px, hanging from its nail at (0,0). bend 0..1 turns it toward a "?" piece.
export const Hook: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <circle cx={0} cy={0} r={5} fill={C.ink} />
    <path d="M0,0 L0,18 Q0,34 -12,34 Q-22,34 -22,24" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
  </g>
);
export const Hooks: React.FC<{x: number; y: number; s?: number; t?: number; droop?: number}> = ({x, y, s = 1, t = 0, droop = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>{[-90, -30, 30, 90].map((dx, i) => <Hook key={i} x={dx} y={0} rot={osc(t, 0.25, i * 0.3) * 2 + droop * 25} />)}</g>
);
// The red "?" (its curl is a hook's curve)
export const QMark: React.FC<{x: number; y: number; s?: number; rot?: number; op?: number}> = ({x, y, s = 1, rot = 0, op = 1}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    <path d="M-40,-50 Q-40,-100 0,-100 Q44,-100 44,-58 Q44,-28 12,-14 Q0,-8 0,14 L0,30" fill="none" stroke={SHADOW} strokeWidth={26} strokeLinecap="round" transform="translate(8,10)" />
    <path d="M-40,-50 Q-40,-100 0,-100 Q44,-100 44,-58 Q44,-28 12,-14 Q0,-8 0,14 L0,30" fill="none" stroke={C.card} strokeWidth={34} strokeLinecap="round" />
    <path d="M-40,-50 Q-40,-100 0,-100 Q44,-100 44,-58 Q44,-28 12,-14 Q0,-8 0,14 L0,30" fill="none" stroke={C.ink} strokeWidth={26} strokeLinecap="round" />
    <path d="M-40,-50 Q-40,-100 0,-100 Q44,-100 44,-58 Q44,-28 12,-14 Q0,-8 0,14 L0,30" fill="none" stroke={C.clueRed} strokeWidth={19} strokeLinecap="round" />
    <circle cx={0} cy={66} r={17} fill={C.ink} /><circle cx={0} cy={66} r={12} fill={C.clueRed} />
  </g>
);
// Card label (Special Elite) with paper shadow
export const Label: React.FC<{x: number; y: number; text: string; size?: number; rot?: number; op?: number; color?: string; bg?: string; pad?: number}> = ({x, y, text, size = 40, rot = 0, op = 1, color = C.ink, bg = C.card, pad = 18}) => {
  const w = text.length * size * 0.6 + pad * 2, h = size * 1.5;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={op}>
      <Cut d={rect(-w / 2, -h / 2, w, h, 4)} fill={bg} sw={2.5} />
      <text x={0} y={size * 0.34} textAnchor="middle" fontFamily={TYPE} fontSize={size} fill={color}>{text}</text>
    </g>
  );
};
// Luggage name tag on a string, swinging in from above (k 0..1 = drop progress)
export const NameTag: React.FC<{x: number; y: number; text: string; k: number; t: number; size?: number}> = ({x, y, text, k, t, size = 40}) => {
  if (k <= 0) return null;
  const sw = Math.exp(-3 * k) * 25 * Math.cos(k * 9) + osc(t, 0.4) * 1.5;
  const w = text.length * size * 0.6 + 50, yy = y - (1 - Math.min(1, k * 1.6)) * 400;
  return (
    <g transform={`translate(${x},${yy - 140}) rotate(${sw})`}>
      <line x1={0} y1={-400} x2={0} y2={140 - size} stroke={C.ink} strokeWidth={2} />
      <g transform={`translate(0,140)`}>
        <Cut d={`M${-w / 2 + 24},${-size} L${w / 2},${-size} L${w / 2},${size * 0.6} L${-w / 2 + 24},${size * 0.6} L${-w / 2},${-size * 0.2} Z`} fill={C.card} sw={2.5} />
        <circle cx={-w / 2 + 22} cy={-size * 0.2} r={6} fill="none" stroke={C.ink} strokeWidth={2} />
        <text x={12} y={-size * 0.05} textAnchor="middle" fontFamily={TYPE} fontSize={size} fill={C.ink}>{text}</text>
      </g>
    </g>
  );
};
// Tear-off calendar; shows `page` text, the previous page `prev` flies off with progress k
export const Calendar: React.FC<{x: number; y: number; s?: number; page: string; prev?: string; k?: number}> = ({x, y, s = 1, page, prev, k = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Cut d={rect(-90, -110, 180, 220, 6)} fill={C.card} />
    <rect x={-90} y={-110} width={180} height={44} fill={C.clueRed} stroke={C.ink} strokeWidth={3} />
    <circle cx={-40} cy={-110} r={8} fill={C.ink} /><circle cx={40} cy={-110} r={8} fill={C.ink} />
    <text x={0} y={30} textAnchor="middle" fontFamily={TYPE} fontSize={page.length > 5 ? 40 : 56} fill={C.ink}>{page}</text>
    {prev && k < 1 && (
      <g transform={`translate(${k * 260},${-k * 340 + k * k * 500}) rotate(${k * 160})`} opacity={1 - k * 0.3}>
        <Cut d={rect(-90, -66, 180, 176, 4)} fill={C.card} sw={2.5} />
        <text x={0} y={30} textAnchor="middle" fontFamily={TYPE} fontSize={prev.length > 5 ? 40 : 56} fill={C.ink}>{prev}</text>
      </g>
    )}
  </g>
);
export const Magnifier: React.FC<{x: number; y: number; s?: number; rot?: number; children?: React.ReactNode}> = ({x, y, s = 1, rot = 0, children}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Cut d={rect(-16, 90, 32, 170, 10)} fill={C.sepia} />
    <circle cx={0} cy={0} r={100} fill={C.glass} opacity={0.5} />
    {children}
    <circle cx={0} cy={0} r={100} fill="none" stroke={C.card} strokeWidth={34} />
    <circle cx={0} cy={0} r={100} fill="none" stroke={C.oldGold} strokeWidth={22} />
    <circle cx={0} cy={0} r={111} fill="none" stroke={C.ink} strokeWidth={3} /><circle cx={0} cy={0} r={89} fill="none" stroke={C.ink} strokeWidth={3} />
    <path d="M-50,-50 Q-30,-70 -5,-72" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
  </g>
);
export const Stamp: React.FC<{x: number; y: number; text: string; k: number; rot?: number; size?: number}> = ({x, y, text, k, rot = -8, size = 64}) => {
  if (k <= 0) return null;
  const sc = k < 1 ? 1 + (1 - k) * 1.4 : 1;
  const w = text.length * size * 0.62 + 40;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${sc})`} opacity={Math.min(1, k * 2) * 0.92}>
      <rect x={-w / 2} y={-size * 0.8} width={w} height={size * 1.5} rx={8} fill="none" stroke={C.clueRed} strokeWidth={7} />
      <text x={0} y={size * 0.3} textAnchor="middle" fontFamily={TYPE} fontSize={size} fill={C.clueRed} fontWeight={700}>{text}</text>
    </g>
  );
};
// a thumbprint: concentric ridges
export const Print: React.FC<{x: number; y: number; s?: number; op?: number; eyes?: boolean; look?: number}> = ({x, y, s = 1, op = 1, eyes, look = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={op}>
    {[...Array(9)].map((_, i) => <ellipse key={i} cx={i * 0.6} cy={i * 1.2} rx={8 + i * 7} ry={11 + i * 9} fill="none" stroke={C.ink} strokeWidth={3.2} strokeDasharray={i % 3 === 1 ? '40 8' : i % 3 === 2 ? '70 10' : undefined} />)}
    {eyes && <g><ellipse cx={-14} cy={-6} rx={9} ry={12} fill="#fff" stroke={C.ink} strokeWidth={2.5} /><ellipse cx={18} cy={-6} rx={9} ry={12} fill="#fff" stroke={C.ink} strokeWidth={2.5} />
      <circle cx={-14 + look * 4} cy={-4} r={5} fill={C.ink} /><circle cx={18 + look * 4} cy={-4} r={5} fill={C.ink} /></g>}
  </g>
);
// paper-fibre texture + grain + vignette + flicker (series grade, local stand-in)
export const Grade: React.FC<{fr: number}> = ({fr}) => {
  const k = Math.floor(fr / 2);
  const fl = 1 + (random(`fl${k}`) - 0.5) * 0.03;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `url(${staticFile('paper.png')})`, backgroundSize: '1080px 1920px', mixBlendMode: 'multiply', opacity: 0.22}} />
      <div style={{position: 'absolute', inset: 0, background: `url(${staticFile(`grain${k % 3}.png`)})`, backgroundSize: '1080px 1920px', mixBlendMode: 'overlay', opacity: 0.07}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(35,27,22,0) 55%, rgba(35,27,22,0.18) 100%)'}} />
      <div style={{position: 'absolute', inset: 0, background: fl > 1 ? `rgba(255,248,230,${(fl - 1) * 2})` : `rgba(35,27,22,${(1 - fl) * 2})`}} />
    </>
  );
};
export {Img};
