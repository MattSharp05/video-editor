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

// ---------- people: every person is the kit's split-pin puppet (src/series/puppet.tsx) ----------
// This adapter keeps the part's scene code short: my pose fields map onto the kit Look / Pose / Expr.
// role picks a shared kit character (Vincenzo, Detective, Police, Guard, Geri, ArtLover); otherwise a kit Person
// is built from coat/hat/etc. in the kit's style (part-only cast: Apollinaire, Picasso, Kafka, singer, clerk, crowd).
import {Puppet, Look as KLook, Pose as KPose, Expr} from './series/puppet';
import {Vincenzo, Detective, Police, Guard, Geri as KGeri, ArtLover} from './series/characters';
import {useCurrentFrame} from 'remotion';
export type Pose = {
  x: number; y: number; s?: number; flip?: boolean;
  role?: 'vincenzo' | 'detective' | 'police' | 'guard' | 'geri' | 'artlover';
  costume?: 'smock' | 'shirt' | 'suit';
  coat?: string; legs?: string; skin?: string; hair?: string;
  hat?: 'bowler' | 'kepi' | 'cap' | 'top' | 'feather' | 'none';
  hatColor?: string; tache?: boolean; beard?: boolean; glasses?: boolean; monocle?: boolean; collar?: boolean;
  aL?: [number, number]; aR?: [number, number];
  walk?: number; bob?: number; look?: number; lookY?: number; mouth?: 'smile' | 'o' | 'flat' | 'open' | 'frown';
  brows?: 'up' | 'flat' | 'worried' | 'cross'; expr?: Expr; pose?: string;
  hold?: React.ReactNode; holdR?: React.ReactNode; tall?: number; wide?: number; gown?: boolean; hatOff?: number;
  face?: React.ReactNode; talk?: number; sleeveGuards?: boolean; pinceNez?: boolean;
};
const exprOf = (p: Pose): Expr => p.expr ?? (p.mouth === 'open' || p.mouth === 'o' ? (p.brows === 'up' ? 'surprised' : 'surprised')
  : p.brows === 'worried' ? 'worried' : p.mouth === 'frown' ? 'sad' : p.mouth === 'smile' ? 'smile' : p.brows === 'cross' ? 'poker' : p.brows === 'up' ? 'surprised' : 'calm');
export const Person: React.FC<Pose> = (p) => {
  const fr = useCurrentFrame();
  const s = p.s ?? 1;
  const height = 560 * s * (p.tall ?? 1);
  const facing = (p.flip ? -1 : 1) as 1 | -1;
  const walking = p.walk !== undefined;
  const custom = p.aL || p.aR || p.bob;
  const pose: KPose | string = p.pose ?? (walking ? 'walk' : custom ? {far: p.aL ?? [6, 6], near: p.aR ?? [6, 6], legF: 0, legN: 0, tilt: 0, head: 0, bob: (p.bob ?? 0) / (height / 100)} : 'stand');
  const common = {fr: fr + Math.round((p.walk ?? 0) * 10), x: p.x, y: p.y, height, facing, pose: pose as any, expr: exprOf(p),
    look: [p.look ?? 0, p.lookY ?? 0] as [number, number], hold: p.holdR, holdFar: p.hold, talk: p.talk ?? 0, seed: `${p.role ?? 'p'}${Math.round(p.x)}`};
  let body: React.ReactNode;
  if (p.role === 'vincenzo') body = <Vincenzo {...common} costume={p.costume ?? 'shirt'} />;
  else if (p.role === 'detective') body = <Detective {...common} />;
  else if (p.role === 'police') body = <Police {...common} force="paris" />;
  else if (p.role === 'guard') body = <Guard {...common} variant="tall" />;
  else if (p.role === 'geri') body = <KGeri {...common} />;
  else if (p.role === 'artlover') body = <ArtLover {...common} variant="tall" monocle={p.monocle ?? true} />;
  else {
    const w = p.wide ?? 1;
    const L: KLook = {skin: p.skin ?? C.skin[1], hair: p.hair ?? C.ink, hairStyle: p.hat === 'feather' ? 'bun' : 'short', coat: p.coat ?? C.sepia,
      coatHem: p.gown ? -1 : -30, shoulders: 11 * w, hem: 11 * w, round: Math.max(0, (w - 1) * 2.5), gown: p.gown, legs: p.legs ?? '#3A3631',
      hat: p.hatOff && p.hatOff > 0.5 ? 'none' : (p.hat ?? 'none') as any, hatColor: p.hatColor ?? (p.hat === 'feather' ? C.duskBlue : C.ink),
      moustache: p.tache ? 'neat' : 'none', beard: p.beard ? 'trim' : 'none', glasses: p.glasses, monocle: p.monocle, pinceNez: p.pinceNez,
      shirt: p.collar ? '#EFE8DA' : undefined, tie: p.collar ? C.ink : undefined, sleeveGuards: p.sleeveGuards};
    body = <Puppet {...common} look_={L} />;
  }
  if (!p.face) return <>{body}</>;
  // a part-only face gag over the kit head (Picasso): skin disc + my face drawn at the head's place
  const k = height / 560;
  return <g>{body}<g transform={`translate(${p.x},${p.y - height * 0.905}) scale(${facing * k * 0.95},${k * 0.95})`}>
    <ellipse cx={0} cy={-6} rx={56} ry={64} fill={p.skin ?? C.skin[1]} stroke={C.ink} strokeWidth={3.5 / k} />{p.face}</g></g>;
};

// ---------- the Mona Lisa (PD photograph; never redrawn) ----------
import {MonaLisa} from './series/monalisa';
export const Mona: React.FC<{x: number; y: number; h?: number; glow?: number; frame?: boolean; crop?: 'full' | 'eyes'; op?: number; rot?: number; glintAt?: number}> = ({x, y, h = 270, glow = 0.6, frame, op = 1, rot = 0, glintAt}) => {
  const fr = useCurrentFrame();
  return <g opacity={op} transform={`rotate(${rot},${x},${y})`}><MonaLisa fr={fr} x={x} y={y} height={h} glow={glow} frame={frame} glintAt={glintAt} id={`ml${Math.round(x)}${Math.round(y)}`} /></g>;
};
// Her eyes only (a crop of the real photo), for peeking over an edge. w = width of the window.
export const MonaEyes: React.FC<{x: number; y: number; w: number; op?: number; glow?: number}> = ({x, y, w, op = 1, glow = 0.8}) => {
  const fr = useCurrentFrame();
  return <g opacity={op}><MonaLisa fr={fr} x={x} y={y} height={w * 0.36} crop="eyes" glow={glow} id={`me${Math.round(x)}${Math.round(y)}`} /></g>;
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
import {Hooks as KHooks, QuestionMark, Thumbprint, Calendar as KCalendar, Magnifier as KMagnifier} from './series/props';
export const Hooks: React.FC<{x: number; y: number; s?: number; t?: number; droop?: number}> = ({x, y, s = 1}) => {
  const fr = useCurrentFrame();
  return <KHooks fr={fr} x={x} y={y} size={s} state="empty" />;
};
export const QMark: React.FC<{x: number; y: number; s?: number; rot?: number; op?: number; shrug?: number}> = ({x, y, s = 1, rot = 0, op = 1, shrug = 0}) => {
  const fr = useCurrentFrame();
  return <g opacity={op}><QuestionMark fr={fr} x={x} y={y + 20 * s} size={s} rot={rot} shrug={shrug} /></g>;
};
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
// kit calendar; my (page, prev, k) maps onto its pages/tearAt (a tear flies for 24 frames)
export const Calendar: React.FC<{x: number; y: number; s?: number; page: string; prev?: string; k?: number}> = ({x, y, s = 1, page, prev, k = 1}) => {
  const fr = useCurrentFrame();
  return prev && k < 1 ? <KCalendar fr={fr} x={x} y={y} size={s} pages={[prev, page]} tearAt={[fr - Math.round(k * 24)]} /> : <KCalendar fr={fr} x={x} y={y} size={s} pages={[page]} />;
};
export const Magnifier: React.FC<{x: number; y: number; s?: number; rot?: number; children?: React.ReactNode}> = ({x, y, s = 1, rot = 0, children}) => (
  <g>{children && <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}><clipPath id={`mg${Math.round(x)}${Math.round(y)}`}><circle r={100} /></clipPath><g clipPath={`url(#mg${Math.round(x)}${Math.round(y)})`}>{children}</g></g>}
    <KMagnifier x={x} y={y} r={100 * s} rot={rot} id={`km${Math.round(x)}${Math.round(y)}`} /></g>
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
export const Print: React.FC<{x: number; y: number; s?: number; op?: number; eyes?: boolean; look?: number; maze?: number}> = ({x, y, s = 1, op = 1, eyes, maze = 0}) => {
  const fr = useCurrentFrame();
  return <g opacity={op}><Thumbprint fr={fr} x={x} y={y} size={s * 0.72} face={eyes} maze={maze} /></g>;
};
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
