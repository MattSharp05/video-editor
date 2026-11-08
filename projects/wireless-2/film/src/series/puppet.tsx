import React from 'react';
import { C } from './tokens';
import { Halftone, Ink, Print } from './look';
import { clamp, ellipse, osc, rnd, stepped } from './util';
import { Feather } from './devices';

/**
 * The shared puppet rig (pick §3.1): head, torso, 2-segment arms and legs, pose angles; expressions = brows + mouth.
 * Native drawing: 760 units tall (3.5 heads), feet at (0,0), facing +x; scaled to `height` px and flipped by `facing`.
 * Angles in degrees from straight down; + rotates toward the facing side. Forearm/shin angles are relative.
 */
export type Expr = 'neutral' | 'smile' | 'polite' | 'laugh' | 'sing' | 'nervous' | 'blank' | 'startled' | 'calm' | 'raised'
  | 'serious' | 'shout' | 'think' | 'unsure' | 'amused' | 'still' | 'wide';
export const EXPRS: Expr[] = ['neutral', 'smile', 'polite', 'laugh', 'sing', 'nervous', 'blank', 'startled', 'calm', 'raised', 'serious', 'shout', 'think', 'unsure', 'amused', 'still', 'wide'];
export type PoseName = 'stand' | 'talk' | 'shrug' | 'point' | 'usher' | 'pullCard' | 'holdTelegram' | 'walk' | 'holdHands' | 'deckChair'
  | 'swat' | 'seated' | 'startled' | 'dock' | 'shakeHead' | 'dance' | 'calm' | 'sitRead' | 'lookUp' | 'wave' | 'leanAsk' | 'march'
  | 'liftHat' | 'write' | 'holdLamp' | 'leanDoor' | 'readTelegram' | 'leap' | 'removeHat' | 'climb' | 'liftCap' | 'telescope'
  | 'think' | 'holdPaper' | 'handNote' | 'nod' | 'sing' | 'laugh' | 'deal' | 'shout' | 'holdBoard' | 'sweepLamp' | 'lampLow' | 'idle' | 'flag';
export type Pose = { aB: [number, number]; aF: [number, number]; lB: [number, number]; lF: [number, number]; tilt: number; head: number; turn: number; y: number; sit: number; spin: number; hat: 'head' | 'hand' | 'chest' | 'up' };
export type Hold = 'none' | 'telegram' | 'hanky' | 'notebook' | 'pencil' | 'lamp' | 'telescope' | 'paper' | 'card' | 'book' | 'board' | 'feather'
  | 'note' | 'tray' | 'parasol' | 'hoop' | 'cards' | 'cane';

const D = Math.PI / 180;
const dir = (a: number): [number, number] => [Math.sin(a * D), Math.cos(a * D)];
export const poseAt = (name: PoseName, fr: number, seed = 0): Pose => {
  const f = stepped(fr, 2); const ph = (f / 16) * Math.PI * 2 + seed; const s = Math.sin(ph);
  const P: Pose = { aB: [-6, 8], aF: [8, 10], lB: [-3, 0], lF: [4, 0], tilt: 0, head: osc(f, 90, seed) * 2, turn: 0, y: 0, sit: 0, spin: 0, hat: 'head' };
  const walk = (k = 1) => { P.lF = [24 * s * k, Math.max(0, -s) * 30 * k]; P.lB = [-24 * s * k, Math.max(0, s) * 30 * k]; P.y = -Math.abs(Math.cos(ph)) * 8 * k; P.aF = [-20 * s * k, 15]; P.aB = [20 * s * k, 15]; P.tilt = 3; };
  switch (name) {
    case 'stand': break;
    case 'idle': P.aF = [10 + 4 * osc(f, 50, seed), 14]; P.head = osc(f, 70, seed) * 4; P.tilt = osc(f, 80, seed) * 1.5; break;
    case 'talk': P.aF = [45 + 12 * osc(f, 22, seed), 45 + 10 * osc(f, 15)]; P.head = osc(f, 30) * 3; break;
    case 'shrug': { const k = 0.6 + 0.4 * Math.abs(osc(f, 40)); P.aF = [25 * k, 95 * k]; P.aB = [-25 * k, -95 * k]; P.head = -6 * k; P.y = -6 * k; break; }
    case 'point': P.aF = [92, 0]; P.aB = [-4, 10]; break;
    case 'usher': { const k = (osc(f, 36) + 1) / 2; P.aF = [35 + 70 * k, 15]; P.tilt = 4; break; }
    case 'pullCard': { const k = (osc(f, 40) + 1) / 2; P.aF = [20 + 50 * k, 120 - 80 * k]; break; }
    case 'holdTelegram': P.aF = [65, 55]; P.aB = [35, 120 + 6 * osc(f, 12)]; P.head = 6; break;
    case 'walk': walk(); break;
    case 'march': walk(1.25); P.aF = [-35 * s, 20]; break;
    case 'flag': walk(1.1); P.aF = [165, 5]; break;
    case 'holdHands': P.aF = [28, 4]; break;
    case 'deckChair': P.sit = 1; P.lF = [80, -20]; P.lB = [76, -20]; P.tilt = -22; P.aF = [48, 100]; P.aB = [42, 104]; P.head = 6; break;
    case 'swat': { const t = (f % 24) / 24; const k = t < 0.3 ? t / 0.3 : Math.max(0, 1 - (t - 0.3) / 0.25); P.aF = [70 + 90 * k, 20 + 40 * (1 - k)]; P.head = -4; break; }
    case 'seated': P.sit = 1; P.lF = [88, -88]; P.lB = [84, -84]; P.aF = [30, 60]; P.aB = [26, 62]; break;
    case 'sitRead': P.sit = 1; P.lF = [88, -88]; P.lB = [84, -84]; P.aF = [42, 100]; P.aB = [38, 102]; P.head = 10; break;
    case 'lookUp': P.sit = 1; P.lF = [88, -88]; P.lB = [84, -84]; P.aF = [30, 70]; P.aB = [26, 70]; P.head = -14; break;
    case 'startled': P.aF = [55, 65]; P.aB = [-50, -60]; P.head = -8; P.y = -10; P.tilt = -4; break;
    case 'dock': P.aF = [62, 38]; P.aB = [56, 40]; break;
    case 'shakeHead': P.turn = osc(f, 14) * 14; P.aF = [62, 38]; P.aB = [56, 40]; break;
    case 'dance': P.aF = [125, 30 + 10 * osc(f, 20)]; P.aB = [-110, -20]; P.spin = f * 0.09 + seed; P.lF = [12 * s, 10]; P.lB = [-8 * s, 6]; P.y = -Math.abs(s) * 6; break;
    case 'calm': P.aF = [18, 62]; P.aB = [16, 66]; break;
    case 'wave': P.aF = [150, 22 * osc(f, 12)]; P.head = -3; break;
    case 'leanAsk': P.tilt = 10; P.aF = [48, 55 + 8 * osc(f, 30)]; P.head = 6; break;
    case 'liftHat': P.aF = [172, -20]; P.hat = 'up'; P.head = -3; break;
    case 'write': P.aB = [40, 100]; P.aF = [52, 86 + 6 * osc(f, 6)]; P.head = 12; break;
    case 'holdLamp': P.aF = [72, -8]; break;
    case 'sweepLamp': P.aF = [60 + 30 * osc(f, 50), -8]; P.head = osc(f, 50) * 4; break;
    case 'lampLow': P.aF = [28, 20]; P.head = 4; break;
    case 'leanDoor': P.tilt = -6; P.aF = [150, 10]; P.aB = [-20, -60]; P.lF = [14, 0]; break;
    case 'readTelegram': P.aF = [62, 68]; P.aB = [56, 74]; P.head = 10; break;
    case 'leap': P.lF = [70, -80]; P.lB = [-35, -50]; P.y = -140; P.aF = [172, -32]; P.aB = [-70, -10]; P.tilt = 8; break;
    case 'removeHat': P.aF = [36, 118]; P.hat = 'chest'; P.head = 10; break;
    case 'climb': P.aF = [160 + 14 * s, 0]; P.aB = [150 - 14 * s, 0]; P.lF = [40 + 30 * s, -70]; P.lB = [40 - 30 * s, -70]; P.y = -10 * s; break;
    case 'liftCap': P.aF = [172, -20]; P.hat = 'up'; break;
    case 'telescope': P.aF = [132, 118]; P.aB = [100, 70]; P.head = -2; break;
    case 'think': P.aF = [2, 168]; P.aB = [20, 75]; P.head = 6 + osc(f, 60) * 2; break;
    case 'holdPaper': P.aF = [86, 24]; break;
    case 'handNote': P.aF = [82, 4]; break;
    case 'nod': P.head = 8 + 8 * osc(f, 20); break;
    case 'sing': P.aF = [102, 18 + 6 * osc(f, 30)]; P.aB = [-72, -16]; P.head = -6 + osc(f, 30) * 3; break;
    case 'laugh': P.aB = [26, 92]; P.aF = [30, 70]; P.head = -10 + osc(f, 10) * 4; P.y = osc(f, 10) * 3; break;
    case 'deal': P.aF = [62 + 14 * osc(f, 14), 56]; P.aB = [40, 80]; P.head = 6; break;
    case 'shout': P.aF = [165, 4 + 6 * osc(f, 16)]; P.head = -6 + osc(f, 16) * 3; break;
    case 'holdBoard': P.aF = [36, 44]; P.aB = [32, 46]; break;
  }
  return P;
};

export type HairStyle = 'none' | 'side' | 'curlyBig' | 'bun' | 'bob' | 'short' | 'curly' | 'cropped';
export type HatKind = 'none' | 'cora' | 'bowler' | 'pilotCap' | 'captain' | 'felt' | 'cap' | 'flowered' | 'helmet' | 'boater' | 'bonnet' | 'top';
export type Look = {
  skin?: string; hair: string; hairStyle: HairStyle;
  build?: number;            // 1 = average; 1.25 heavy-set (Dew); 0.85 slim
  coat: string; coatLen?: number;   // y of coat hem (native, 0 = feet); default hips -300
  legs: string; shoes?: string;
  skirt?: string; skirtFlare?: number;  // women: skirt from waist to ankle
  shirt?: string; collarUp?: boolean; waistcoat?: string; scarf?: string; cape?: boolean; trim?: string;
  hat?: HatKind; hatColor?: string;
  glasses?: boolean; moustache?: 'none' | 'clipped'; beard?: boolean; bareLip?: boolean;
  headphones?: boolean; rolled?: boolean; cheeks?: 'cora' | 'ink';
};

// native skeleton
const HIP_Y = -330, SH_Y = -565, HEAD_Y = -690, HEAD_R = 92, UA = 150, FA = 138, TH = 172, SH = 162;

/** Capsule path between two points (tapered limb). */
const limb = (a: [number, number], b: [number, number], w1: number, w2: number) => {
  const dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; const ux = dx / L, uy = dy / L; const nx = -uy, ny = ux;
  const P = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const b1 = [b[0] + nx * w2, b[1] + ny * w2], b2 = [b[0] - nx * w2, b[1] - ny * w2], a1 = [a[0] + nx * w1, a[1] + ny * w1], a2 = [a[0] - nx * w1, a[1] - ny * w1];
  const bt = [b[0] + ux * w2, b[1] + uy * w2], at = [a[0] - ux * w1, a[1] - uy * w1];
  return `M${P(a1[0], a1[1])} L${P(b1[0], b1[1])} Q${P(b1[0] + ux * w2, b1[1] + uy * w2)} ${P(bt[0], bt[1])} Q${P(b2[0] + ux * w2, b2[1] + uy * w2)} ${P(b2[0], b2[1])} L${P(a2[0], a2[1])} Q${P(a2[0] - ux * w1, a2[1] - uy * w1)} ${P(at[0], at[1])} Q${P(a1[0] - ux * w1, a1[1] - uy * w1)} ${P(a1[0], a1[1])}Z`;
};
const add = (a: [number, number], v: [number, number], k: number): [number, number] => [a[0] + v[0] * k, a[1] + v[1] * k];

export type PuppetProps = {
  fr: number; x: number; y: number; height?: number; facing?: 1 | -1; pose?: PoseName; expr?: Expr; seed?: number;
  hold?: Hold; holdB?: Hold; look: Look; mono?: boolean; litBelow?: number; op?: number; talk?: boolean;
  /** extra nodes drawn in native coords: before the body (behind) and after the head (front). */
  behind?: React.ReactNode; front?: React.ReactNode; faceExtra?: React.ReactNode; hatNode?: React.ReactNode;
  /** override pose fields (fine control) */
  poseOver?: Partial<Pose>; lipNode?: React.ReactNode; blink?: boolean; far?: boolean;
};
export const NATIVE_H = 760;

/** Head + face drawing (native coords centred at the head centre). */
export const Face: React.FC<{ fr: number; expr: Expr; look: Look; turn?: number; mono?: boolean; seed?: number; talk?: boolean; blink?: boolean }> = ({ fr, expr, look, turn = 0, mono, seed = 0, talk, blink = true }) => {
  const skin = mono ? C.newsprint : (look.skin ?? C.skin);
  const t = 14 + turn;
  const eyeY = -6; const ex = 32;
  const blinkNow = blink && (Math.floor(fr / 2) + seed * 7) % 70 === 0;
  const big = expr === 'startled' || expr === 'wide';
  const brow: Record<string, [number, number, number]> = { // [lift, innerTilt, nearExtra]
    neutral: [0, 0, 0], smile: [2, 0, 0], polite: [2, 0, 0], laugh: [6, 0, 0], sing: [10, -4, 0], nervous: [6, -10, 0], blank: [6, 0, 0],
    startled: [16, -4, 0], calm: [2, 2, 0], raised: [0, 0, 16], serious: [-4, 8, 0], shout: [10, -6, 0], think: [0, 4, 12], unsure: [8, -8, 0], amused: [3, 0, 6], still: [2, 0, 0], wide: [14, -2, 0],
  };
  const [lift, tilt, nearX] = brow[expr] ?? [0, 0, 0];
  const mouthY = 44; const mx = t * 0.8;
  const talkOpen = talk ? Math.abs(osc(stepped(fr, 3), 9)) : 0;
  let mouth: React.ReactNode;
  const sw = 4.5;
  switch (expr) {
    case 'smile': case 'calm': case 'amused': mouth = <path d={`M${mx - 20} ${mouthY - 4} Q${mx} ${mouthY + 14} ${mx + 20} ${mouthY - (expr === 'amused' ? 10 : 4)}`} fill="none" stroke={C.ink} strokeWidth={sw} strokeLinecap="round" />; break;
    case 'polite': mouth = <path d={`M${mx - 13} ${mouthY} Q${mx} ${mouthY + 7} ${mx + 13} ${mouthY}`} fill="none" stroke={C.ink} strokeWidth={sw} strokeLinecap="round" />; break;
    case 'laugh': mouth = <Ink d={`M${mx - 24} ${mouthY - 6} Q${mx} ${mouthY - 2} ${mx + 24} ${mouthY - 6} Q${mx + 18} ${mouthY + 26} ${mx} ${mouthY + 26} Q${mx - 18} ${mouthY + 26} ${mx - 24} ${mouthY - 6}Z`} fill={C.deep} sw={4} />; break;
    case 'sing': case 'shout': { const o = expr === 'shout' ? 0.7 + 0.3 * Math.abs(osc(fr, 10)) : 0.8 + 0.2 * Math.abs(osc(fr, 24)); mouth = <Ink d={ellipse(mx, mouthY + 6, 13 + 3 * o, 18 * o)} fill={C.deep} sw={4} />; break; }
    case 'nervous': case 'unsure': mouth = <path d={`M${mx - 18} ${mouthY + 2} q6 -6 12 0 t12 0 t12 0`} fill="none" stroke={C.ink} strokeWidth={sw} strokeLinecap="round" />; break;
    case 'startled': case 'wide': mouth = <Ink d={ellipse(mx, mouthY + 4, 8, 10)} fill={C.deep} sw={4} />; break;
    case 'think': mouth = <path d={`M${mx - 4} ${mouthY + 2} L${mx + 16} ${mouthY - 2}`} fill="none" stroke={C.ink} strokeWidth={sw} strokeLinecap="round" />; break;
    case 'blank': case 'serious': case 'still': mouth = <path d={`M${mx - 14} ${mouthY + 1} L${mx + 14} ${mouthY + 1}`} fill="none" stroke={C.ink} strokeWidth={sw} strokeLinecap="round" />; break;
    case 'raised': mouth = <path d={`M${mx - 14} ${mouthY + 2} Q${mx} ${mouthY + 4} ${mx + 14} ${mouthY - 1}`} fill="none" stroke={C.ink} strokeWidth={sw} strokeLinecap="round" />; break;
    default: mouth = <path d={`M${mx - 14} ${mouthY} Q${mx} ${mouthY + 5} ${mx + 14} ${mouthY}`} fill="none" stroke={C.ink} strokeWidth={sw} strokeLinecap="round" />;
  }
  if (talk && !['sing', 'shout', 'laugh', 'startled', 'wide'].includes(expr) && talkOpen > 0.3) mouth = <Ink d={ellipse(mx, mouthY + 3, 11, 4 + 7 * talkOpen)} fill={C.deep} sw={4} />;
  const eye = (x: number, near: boolean) => {
    if (expr === 'laugh') return <path d={`M${x - 11} ${eyeY + 3} Q${x} ${eyeY - 10} ${x + 11} ${eyeY + 3}`} fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" />;
    if (blinkNow) return <path d={`M${x - 10} ${eyeY} L${x + 10} ${eyeY}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />;
    const r = big ? 11 : expr === 'blank' ? 6.5 : 8.5;
    return <g>{big && <circle cx={x} cy={eyeY} r={r + 6} fill={C.newsprint} stroke={C.ink} strokeWidth={2.5} />}<circle cx={x} cy={eyeY} r={r} fill={C.ink} /><circle cx={x - 2.5} cy={eyeY - 3} r={2.8} fill={C.newsprint} /></g>;
  };
  const browD = (x: number, near: boolean) => {
    const yb = eyeY - 26 - lift - (near ? nearX : 0); const inner = near ? x - 14 : x + 14; const outer = near ? x + 14 : x - 14;
    return `M${outer} ${yb} L${inner} ${yb + tilt * 0.6}`;
  };
  return (
    <g>
      <Ink d={ellipse(0, 0, HEAD_R * 0.92, HEAD_R)} fill={skin} shade="R" />
      {look.cheeks && <Halftone d={ellipse(t + 44, 24, 16, 12)} dots={look.cheeks === 'cora' ? 'cora' : 'near'} />}
      {eye(t - ex, false)}{eye(t + ex, true)}
      <path d={browD(t - ex, false)} stroke={C.ink} strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d={browD(t + ex, true)} stroke={C.ink} strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d={`M${t + 6} ${eyeY + 8} q6 14 -2 20`} stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
      {mouth}
    </g>
  );
};

const HAIR = (style: HairStyle, color: string, fr: number) => {
  const R = HEAD_R;
  switch (style) {
    case 'side': return { back: null, front: <Ink d={`M${-R * 0.9} ${-6} Q${-R * 0.98} ${-40} ${-R * 0.7} ${-48} L${-R * 0.62} ${-10} Z M${R * 0.88} ${-6} Q${R * 0.98} ${-40} ${R * 0.72} ${-48} L${R * 0.64} ${-10}Z`} fill={color} sw={4} /> };
    case 'curlyBig': return {
      back: <g>{Array.from({ length: 11 }, (_, i) => { const a = (-200 + i * 22) * D; return <Ink key={i} d={ellipse(Math.cos(a) * R * 1.05, Math.sin(a) * R * 0.95 + 10, 34, 32)} fill={color} sw={4} />; })}</g>,
      front: <Ink d={`M${-R * 0.85} ${-30} Q${-R * 0.4} ${-R * 1.15} ${R * 0.2} ${-R * 0.92} Q${R * 0.7} ${-R * 1.1} ${R * 0.9} ${-30} Q${R * 0.5} ${-60} ${R * 0.1} ${-50} Q${-R * 0.4} ${-70} ${-R * 0.85} ${-30}Z`} fill={color} sw={4} />,
    };
    case 'bun': return { back: <Ink d={ellipse(-R * 0.55, -R * 0.75, 36, 32)} fill={color} sw={4} />, front: <Ink d={`M${-R * 0.92} ${-4} Q${-R} ${-R * 1.05} ${0} ${-R * 1.04} Q${R} ${-R * 1.05} ${R * 0.92} ${-4} Q${R * 0.6} ${-62} ${0} ${-58} Q${-R * 0.6} ${-62} ${-R * 0.92} ${-4}Z`} fill={color} sw={4} /> };
    case 'bob': return { back: <Ink d={`M${-R * 1.02} ${30} Q${-R * 1.15} ${-R * 1.1} ${0} ${-R * 1.08} Q${R * 1.15} ${-R * 1.1} ${R * 1.02} ${30} Z`} fill={color} sw={4} />, front: <Ink d={`M${-R * 0.95} ${10} Q${-R} ${-R * 1.05} ${0} ${-R * 1.04} Q${R} ${-R * 1.05} ${R * 0.95} ${10} Q${R * 0.7} ${-40} ${R * 0.2} ${-56} Q${-R * 0.5} ${-60} ${-R * 0.95} ${10}Z`} fill={color} sw={4} /> };
    case 'short': case 'cropped': return { back: null, front: <Ink d={`M${-R * 0.9} ${-10} Q${-R * 0.95} ${-R * 1.04} ${0} ${-R * 1.02} Q${R * 0.95} ${-R * 1.04} ${R * 0.9} ${-10} Q${R * 0.7} ${-56} ${0} ${-64} Q${-R * 0.7} ${-56} ${-R * 0.9} ${-10}Z`} fill={color} sw={4} /> };
    case 'curly': return { back: null, front: <g>{Array.from({ length: 7 }, (_, i) => { const a = (-170 + i * 27) * D; return <Ink key={i} d={ellipse(Math.cos(a) * R * 0.86, Math.sin(a) * R * 0.86, 24, 22)} fill={color} sw={4} />; })}</g> };
    default: return { back: null, front: null };
  }
};

/** Hats, drawn centred on the head (native). */
export const HatShape: React.FC<{ kind: HatKind; color?: string; fr: number; feather?: React.ReactNode }> = ({ kind, color, fr, feather }) => {
  const R = HEAD_R;
  switch (kind) {
    case 'bowler': return <g transform={`translate(0 ${-R * 0.72})`}>
      <Ink d={`M${-R * 1.25} 8 Q0 -6 ${R * 1.25} 8 Q${R * 1.2} 22 ${R * 0.9} 18 L${-R * 0.9} 18 Q${-R * 1.2} 22 ${-R * 1.25} 8Z`} fill={color ?? C.deep} />
      <Ink d={`M${-R * 0.82} 10 Q${-R * 0.86} ${-R * 0.95} 0 ${-R * 0.98} Q${R * 0.86} ${-R * 0.95} ${R * 0.82} 10Z`} fill={color ?? C.deep} shade="R" />
      <path d={`M${-R * 0.82} -6 Q0 2 ${R * 0.82} -6`} stroke={C.slate} strokeWidth={14} fill="none" />
      {feather}
    </g>;
    case 'felt': return <g transform={`translate(0 ${-R * 0.7})`}>
      <Ink d={`M${-R * 1.3} 10 Q0 -12 ${R * 1.3} 10 Q0 24 ${-R * 1.3} 10Z`} fill={color ?? C.slate} />
      <Ink d={`M${-R * 0.8} 6 Q${-R * 0.75} ${-R * 0.75} ${-R * 0.1} ${-R * 0.8} L${R * 0.2} ${-R * 0.68} L${R * 0.4} ${-R * 0.82} Q${R * 0.78} ${-R * 0.7} ${R * 0.8} 6Z`} fill={color ?? C.slate} shade="R" />
      <path d={`M${-R * 0.8} -8 Q0 0 ${R * 0.8} -8`} stroke={C.deep} strokeWidth={10} fill="none" />
    </g>;
    case 'pilotCap': case 'captain': case 'cap': {
      const top = kind === 'captain' ? C.newsprint : (color ?? C.deep);
      return <g transform={`translate(0 ${-R * 0.7})`}>
        <Ink d={`M${-R * 0.95} 12 Q${-R * 1.05} ${-R * 0.55} 0 ${-R * 0.62} Q${R * 1.15} ${-R * 0.6} ${R * 1.05} 6 Z`} fill={top} shade="R" />
        <Ink d={`M${-R * 0.92} 4 L${R * 0.98} 4 L${R * 0.98} 22 L${-R * 0.92} 22Z`} fill={kind === 'cap' ? (color ?? C.slate) : C.deep} />
        <Ink d={`M${R * 0.2} 20 Q${R * 0.9} 18 ${R * 1.45} 34 Q${R * 0.9} 40 ${R * 0.2} 30Z`} fill={C.deep} />
        {kind === 'captain' && <circle cx={R * 0.35} cy={-10} r={9} fill={C.newsprint} stroke={C.ink} strokeWidth={3} />}
      </g>;
    }
    case 'helmet': return <g transform={`translate(0 ${-R * 0.6})`}>
      <Ink d={`M${-R * 1.05} 20 Q${-R * 1.0} ${-R * 1.4} 0 ${-R * 1.6} Q${R * 1.0} ${-R * 1.4} ${R * 1.05} 20 Z`} fill={color ?? C.deep} shade="R" />
      <circle cx={0} cy={-R * 1.62} r={9} fill={C.mist} stroke={C.ink} strokeWidth={3} />
      <path d={`M${-R * 1.1} 20 L${R * 1.1} 20`} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      <circle cx={0} cy={-R * 0.4} r={13} fill={C.mist} stroke={C.ink} strokeWidth={3} />
    </g>;
    case 'boater': return <g transform={`translate(0 ${-R * 0.75})`}>
      <Ink d={`M${-R * 1.35} 8 L${R * 1.35} 8 L${R * 1.3} 20 L${-R * 1.3} 20Z`} fill={color ?? C.newsprint} />
      <Ink d={`M${-R * 0.82} 8 L${-R * 0.82} ${-R * 0.5} L${R * 0.82} ${-R * 0.5} L${R * 0.82} 8Z`} fill={color ?? C.newsprint} shade="R" />
      <rect x={-R * 0.82} y={-R * 0.12} width={R * 1.64} height={14} fill={C.deep} />
    </g>;
    case 'top': return <g transform={`translate(0 ${-R * 0.75})`}>
      <Ink d={`M${-R * 1.2} 10 Q0 0 ${R * 1.2} 10 L${R * 1.15} 22 L${-R * 1.15} 22Z`} fill={color ?? C.deep} />
      <Ink d={`M${-R * 0.75} 10 L${-R * 0.8} ${-R * 1.3} L${R * 0.8} ${-R * 1.3} L${R * 0.75} 10Z`} fill={color ?? C.deep} shade="R" />
    </g>;
    case 'bonnet': return <g><Ink d={`M${-R * 1.1} 40 Q${-R * 1.25} ${-R * 1.3} 0 ${-R * 1.3} Q${R * 1.3} ${-R * 1.3} ${R * 1.15} 40 Q${R * 0.9} -40 0 -60 Q${-R * 0.9} -40 ${-R * 1.1} 40Z`} fill={color ?? C.mist} shade="R" />
      <path d={`M${-R * 0.9} 40 Q${-R * 0.4} 120 ${-R * 0.1} 110`} stroke={C.slate} strokeWidth={8} fill="none" /></g>;
    case 'flowered': return <g transform={`translate(0 ${-R * 0.72})`}>
      <Ink d={`M${-R * 1.6} 14 Q0 -14 ${R * 1.6} 14 Q0 32 ${-R * 1.6} 14Z`} fill={color ?? C.slate} />
      <Ink d={`M${-R * 0.85} 10 Q${-R * 0.8} ${-R * 0.7} 0 ${-R * 0.72} Q${R * 0.8} ${-R * 0.7} ${R * 0.85} 10Z`} fill={color ?? C.slate} shade="R" />
      {[-60, -20, 25, 62].map((x, i) => <g key={i}>{[0, 72, 144, 216, 288].map((a) => <Ink key={a} d={ellipse(x + Math.cos(a * D) * 11, -R * 0.4 + Math.sin(a * D) * 11, 9, 9)} fill={C.mist} sw={2.5} />)}<circle cx={x} cy={-R * 0.4} r={6} fill={C.newsprint} stroke={C.ink} strokeWidth={2} /></g>)}
    </g>;
    case 'cora': return <g transform={`translate(0 ${-R * 0.7})`}>
      {feather}
      <Ink d={`M${-R * 2.1} 22 Q${-R * 1.2} -30 0 -28 Q${R * 1.3} -30 ${R * 2.2} 18 Q${R * 1.2} 42 0 38 Q${-R * 1.3} 42 ${-R * 2.1} 22Z`} fill={color ?? C.slate} shade="RB" />
      <Ink d={`M${-R * 0.95} 6 Q${-R * 0.9} ${-R * 0.85} 0 ${-R * 0.9} Q${R * 0.95} ${-R * 0.85} ${R * 0.95} 6Z`} fill={color ?? C.slate} shade="R" />
      <path d={`M${-R * 0.95} -8 Q0 6 ${R * 0.95} -8`} stroke={C.cora} strokeWidth={16} fill="none" />
      <Ink d={`M${R * 0.7} -10 l40 -16 l-6 30 Z M${R * 0.7} -10 l38 18 l-26 14Z`} fill={C.cora} sw={3} />
    </g>;
    default: return null;
  }
};

/** Small held items, drawn in hand-local coords (hand at 0,0; +x = forward). */
export const HeldItem: React.FC<{ kind: Hold; fr: number; mono?: boolean }> = ({ kind, fr }) => {
  switch (kind) {
    case 'telegram': return <g transform="rotate(-8)"><Ink d="M-10 -70 L70 -74 L74 -10 L-6 -6Z" fill={C.newsprint} sw={3} /><path d="M0 -56 H60 M0 -44 H52 M0 -32 H58" stroke={C.slate} strokeWidth={4} /><text x={32} y={-16} textAnchor="middle" fontFamily="'Old Standard TT', serif" fontWeight={700} fontSize={13} fill={C.ink}>TELEGRAM</text></g>;
    case 'hanky': return <Ink d={`M-6 -30 Q20 ${-50 + 6 * osc(fr, 10)} 44 -36 Q50 -6 30 10 Q12 26 -8 12 Q-16 -8 -6 -30Z`} fill={C.newsprint} sw={3} />;
    case 'notebook': return <g transform="rotate(-10)"><Ink d="M-30 -60 L40 -60 L40 30 L-30 30Z" fill={C.newsprint} sw={3} /><path d="M-30 -60 L-30 30" stroke={C.deep} strokeWidth={8} /><path d="M-18 -40 H30 M-18 -24 H26 M-18 -8 H30" stroke={C.mist} strokeWidth={3} /></g>;
    case 'pencil': return <g transform="rotate(-40)"><Ink d="M-4 -60 L4 -60 L4 10 L0 20 L-4 10Z" fill={C.slate} sw={3} /></g>;
    case 'lamp': return <g><Ink d="M-26 -30 L26 -30 L30 30 L-30 30Z" fill={C.deep} sw={3} /><circle cx={30} cy={0} r={20} fill={C.lamp} stroke={C.ink} strokeWidth={3} /><Ink d="M-10 -30 Q0 -56 10 -30" sw={4} /></g>;
    case 'telescope': return <g transform="rotate(-6)"><Ink d="M-30 -14 L90 -18 L90 18 L-30 14Z" fill={C.lamp} shade="B" sw={3} /><Ink d="M90 -22 L190 -26 L190 26 L90 22Z" fill={C.lamp} shade="B" sw={3} /><path d="M20 -16 V16 M140 -24 V24" stroke={C.ink} strokeWidth={3} /></g>;
    case 'paper': return <g transform="rotate(4)"><Ink d="M-10 -170 L130 -175 L134 20 L-6 24Z" fill={C.newsprint} sw={3} /><text x={62} y={-138} textAnchor="middle" fontFamily="'Abril Fatface', serif" fontSize={30} fill={C.ink}>WANTED</text><ellipse cx={62} cy={-80} rx={38} ry={44} fill="none" stroke={C.ink} strokeWidth={3} /><circle cx={50} cy={-84} r={9} fill="none" stroke={C.ink} strokeWidth={2.5} /><circle cx={74} cy={-84} r={9} fill="none" stroke={C.ink} strokeWidth={2.5} /><path d="M40 -62 Q62 -74 84 -62 Q62 -54 40 -62Z" fill={C.deep} /><path d="M10 -16 H114 M10 -2 H100" stroke={C.slate} strokeWidth={4} /></g>;
    case 'card': return <g transform="rotate(-6)"><Ink d="M-10 -80 L70 -80 L70 20 L-10 20Z" fill={C.newsprint} sw={3} /><rect x={0} y={-70} width={60} height={60} fill={C.mist} /></g>;
    case 'book': return <g transform="rotate(-14)"><Ink d="M-40 -50 L0 -40 L40 -50 L40 10 L0 20 L-40 10Z" fill={C.newsprint} sw={3} /><path d="M0 -40 V20" stroke={C.ink} strokeWidth={3} /><Ink d="M-44 -46 L-44 14 L0 24 L44 14 L44 -46" fill="none" lc={C.deep} sw={6} /></g>;
    case 'board': return <g><Ink d="M-120 -90 L120 -90 L120 90 L-120 90Z" fill={C.newsprint} sw={4} /><path d="M-100 -60 H100 M-100 -30 H80" stroke={C.slate} strokeWidth={8} /></g>;
    case 'note': return <g transform="rotate(-4)"><Ink d="M-4 -40 L60 -42 L62 0 L-2 2Z" fill={C.newsprint} sw={3} /><path d="M6 -28 H50 M6 -16 H44" stroke={C.slate} strokeWidth={3} /></g>;
    case 'tray': return <g><Ink d="M-60 -6 L80 -6 L76 6 L-56 6Z" fill={C.mist} sw={3} /><Ink d="M-20 -6 Q-20 -40 0 -40 Q20 -40 20 -6Z" fill={C.newsprint} sw={3} /><path d="M40 -6 V-36 M30 -36 H50" stroke={C.ink} strokeWidth={3} /></g>;
    case 'parasol': return <g transform={`rotate(${-20 + osc(fr, 60) * 4})`}><path d="M0 40 L0 -230" stroke={C.ink} strokeWidth={5} /><Ink d="M-130 -200 Q0 -310 130 -200 Q100 -214 65 -200 Q32 -216 0 -200 Q-32 -216 -65 -200 Q-100 -214 -130 -200Z" fill={C.newsprint} shade="B" sw={4} /></g>;
    case 'hoop': return <g transform={`translate(${30 + osc(fr, 30) * 10} 120)`}><circle r={70} fill="none" stroke={C.ink} strokeWidth={7} /><circle r={70} fill="none" stroke={C.mist} strokeWidth={3} /></g>;
    case 'cards': return <g>{[0, 1, 2].map((i) => <Ink key={i} d="M-8 -50 L36 -50 L36 12 L-8 12Z" fill={C.newsprint} sw={2.5} transform={`rotate(${-18 + i * 14 + osc(fr, 28) * 3}) translate(${i * 6} 0)`} />)}</g>;
    case 'feather': return <g transform="rotate(-10)"><Feather fr={fr} x={0} y={10} size={0.9} state="flag" /></g>;
    case 'cane': return <g><path d="M0 -20 L-10 300" stroke={C.ink} strokeWidth={9} strokeLinecap="round" /><path d="M0 -20 q 20 -20 30 0" stroke={C.ink} strokeWidth={9} fill="none" strokeLinecap="round" /></g>;
    default: return null;
  }
};

/** <Puppet ...> the rig itself; characters (cast.tsx) are presets of it. Returns <g> at (x, y) = feet. */
export const Puppet: React.FC<PuppetProps> = (p) => {
  const { fr, x, y, height = NATIVE_H, facing = 1, pose = 'stand', expr = 'neutral', seed = 0, look, mono, op } = p;
  const P = { ...poseAt(pose, fr, seed), ...(p.poseOver ?? {}) };
  const k = height / NATIVE_H; const b = look.build ?? 1;
  const col = (c: string) => (mono ? C.newsprint : c);
  const skin = col(look.skin ?? C.skin);
  const sit = P.sit;
  const hipY = HIP_Y + sit * 150;
  const hipB: [number, number] = [-24 * b, hipY], hipF: [number, number] = [22 * b, hipY];
  const kneeOf = (h: [number, number], a: number) => add(h, dir(a), TH);
  const footOf = (kn: [number, number], a: number, kk: number) => add(kn, dir(a + kk), SH);
  const knB = kneeOf(hipB, P.lB[0]), knF = kneeOf(hipF, P.lF[0]);
  const ftB = footOf(knB, P.lB[0], P.lB[1]), ftF = footOf(knF, P.lF[0], P.lF[1]);
  const shY = SH_Y + sit * 150;
  const shB: [number, number] = [-48 * b, shY + 6], shF: [number, number] = [52 * b, shY + 4];
  const elB = add(shB, dir(P.aB[0]), UA), elF = add(shF, dir(P.aF[0]), UA);
  const hdB = add(elB, dir(P.aB[0] + P.aB[1]), FA), hdF = add(elF, dir(P.aF[0] + P.aF[1]), FA);
  const legW = 26 * Math.max(0.85, b * 0.95);
  const armW = 22 * Math.max(0.85, b * 0.9);
  const sleeve = col(look.coat);
  const shoe = (ft: [number, number]) => <Ink d={ellipse(ft[0] + 16, ft[1] - 8, 34, 15)} fill={col(look.shoes ?? C.deep)} sw={4} />;
  const leg = (h: [number, number], kn: [number, number], ft: [number, number], back: boolean) => (
    <g>
      <Ink d={limb(h, kn, legW, legW * 0.92)} fill={col(look.legs)} shade="R" />
      <Ink d={limb(kn, ft, legW * 0.92, legW * 0.8)} fill={col(look.legs)} shade="R" />
      {shoe(ft)}
    </g>
  );
  const arm = (sh: [number, number], el: [number, number], hd: [number, number], hold: Hold | undefined, front: boolean, ang: number) => (
    <g>
      <Ink d={limb(sh, el, armW * 1.15, armW)} fill={sleeve} shade="R" />
      <Ink d={limb(el, hd, armW, armW * 0.85)} fill={sleeve} shade="R" />
      {look.rolled && <Ink d={limb(add(el, dir(ang), FA * 0.45), hd, armW * 0.7, armW * 0.65)} fill={skin} />}
      {hold && hold !== 'none' && <g transform={`translate(${hd[0]} ${hd[1]})`}><HeldItem kind={hold} fr={fr} /></g>}
      <Ink d={ellipse(hd[0], hd[1], 20, 19)} fill={skin} sw={4} />
    </g>
  );
  // torso
  const sw = 66 * b, hw = 56 * b * (1 + (b - 1) * 0.6);
  const coatHem = (look.coatLen ?? -300) + sit * 150;
  const torsoD = `M${-sw} ${shY + 20} Q${-sw} ${shY - 6} ${-sw + 26} ${shY - 10} L${sw - 26} ${shY - 10} Q${sw} ${shY - 6} ${sw} ${shY + 20} L${hw + 6} ${hipY} L${-hw - 6} ${hipY}Z`;
  const coatD = look.coatLen != null && look.coatLen > -300 ? `M${-sw} ${shY + 20} L${sw} ${shY + 20} L${hw + 30 + (sit ? 40 : 0)} ${coatHem} L${-hw - 30} ${coatHem}Z` : null;
  const skirtD = look.skirt ? (() => { const fl = look.skirtFlare ?? 1; const wy = hipY - 50; const hem = -24 + sit * 120; return `M${-hw} ${wy} L${hw} ${wy} Q${hw + 60 * fl} ${(wy + hem) / 2} ${hw + 90 * fl} ${hem} Q0 ${hem + 18} ${-hw - 90 * fl} ${hem} Q${-hw - 60 * fl} ${(wy + hem) / 2} ${-hw} ${wy}Z`; })() : null;
  const headC: [number, number] = [8 + P.turn * 0.4, HEAD_Y + sit * 150];
  const hair = HAIR(look.hairStyle, col(look.hair), fr);
  const hatEl = p.hatNode ?? (look.hat && look.hat !== 'none' ? <HatShape kind={look.hat} color={look.hatColor ? col(look.hatColor) : undefined} fr={fr} /> : null);
  const hatPos = P.hat === 'up' ? `translate(${hdF[0] - headC[0]} ${hdF[1] - headC[1] + 40}) rotate(${-10})` : P.hat === 'chest' ? `translate(${hdF[0] - headC[0] + 10} ${hdF[1] - headC[1] + 60}) rotate(-80) scale(0.9)` : '';
  const spinX = P.spin ? Math.cos(P.spin) : 1;
  const tf = `translate(${x} ${y + P.y * k}) scale(${facing * k * (P.spin ? (Math.abs(spinX) < 0.25 ? 0.25 * Math.sign(spinX || 1) : spinX) : 1)} ${k})`;
  return (
    <Print far={p.far}>
      <g transform={tf} opacity={op}>
        {p.behind}
        <g transform={`rotate(${P.tilt} 0 ${hipY})`}>
          {arm(shB, elB, hdB, p.holdB, false, P.aB[0])}
        </g>
        {!skirtD && leg(hipB, knB, ftB, true)}
        {!skirtD && leg(hipF, knF, ftF, false)}
        {skirtD && <>{shoe([ftB[0], -2])}{shoe([ftF[0], -2])}</>}
        <g transform={`rotate(${P.tilt} 0 ${hipY})`}>
          {skirtD && <Ink d={skirtD} fill={col(look.skirt!)} shade="R" />}
          {coatD && <Ink d={coatD} fill={col(look.coat)} shade="R" />}
          <Ink d={torsoD} fill={col(look.waistcoat ?? look.coat)} shade="R" />
          {look.waistcoat && <><Ink d={`M${-sw} ${shY + 20} L${-sw * 0.35} ${shY - 8} L${-hw * 0.4} ${hipY} L${-hw - 6} ${hipY}Z`} fill={col(look.coat)} shade="L" sw={4} /><Ink d={`M${sw} ${shY + 20} L${sw * 0.35} ${shY - 8} L${hw * 0.4} ${hipY} L${hw + 6} ${hipY}Z`} fill={col(look.coat)} shade="R" sw={4} /></>}
          <Ink d={`M${-24} ${shY - 12} L0 ${shY + 30} L24 ${shY - 12} ${look.collarUp ? `L18 ${shY - 40} L-18 ${shY - 40}` : ''}Z`} fill={col(look.shirt ?? C.newsprint)} sw={4} />
          {look.scarf && <Ink d={`M${-38} ${shY - 16} Q0 ${shY + 8} 38 ${shY - 16} L40 ${shY + 4} Q0 ${shY + 30} -40 ${shY + 4}Z M14 ${shY + 8} l16 70 l-26 0Z`} fill={col(look.scarf)} sw={4} />}
          {look.trim && <path d={`M${-sw + 10} ${shY + 30} L${-hw + 4} ${hipY - 8} M${sw - 10} ${shY + 30} L${hw - 4} ${hipY - 8}`} stroke={col(look.trim)} strokeWidth={8} />}
          {look.cape && <Ink d={`M${-sw - 6} ${shY + 10} Q0 ${shY - 30} ${sw + 6} ${shY + 10} L${sw + 30} ${hipY + 20} Q0 ${hipY + 40} ${-sw - 30} ${hipY + 20}Z`} fill={col(look.coat)} shade="R" />}
          {!look.collarUp && <path d={`M-30 ${shY - 2} L0 ${shY + 120} L30 ${shY - 2}`} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />}
          <g transform={`rotate(${P.head} ${headC[0]} ${headC[1] + 70})`}>
            <Ink d={limb([headC[0] - 4, headC[1] + 60], [headC[0] - 4, shY - 6], 22, 24)} fill={skin} sw={4} />
            <g transform={`translate(${headC[0]} ${headC[1]})`}>
              {hair.back}
              <Face fr={fr} expr={expr} look={look} turn={P.turn} mono={mono} seed={seed} talk={p.talk} blink={p.blink} />
              {hair.front}
              {look.glasses && <g>{[-1, 1].map((sgn) => <circle key={sgn} cx={14 + P.turn + sgn * 32} cy={-6} r={22} fill={C.newsprint} fillOpacity={0.25} stroke={mono ? C.ink : C.lamp} strokeWidth={5} />)}<path d={`M${14 + P.turn - 10} -6 L${14 + P.turn + 10} -6`} stroke={C.lamp} strokeWidth={4} />{[-1, 1].map((sgn) => <circle key={`o${sgn}`} cx={14 + P.turn + sgn * 32} cy={-6} r={24.5} fill="none" stroke={C.ink} strokeWidth={2} />)}</g>}
              {look.moustache === 'clipped' && <Ink d={`M${14 + P.turn - 22} 28 Q${14 + P.turn} 18 ${14 + P.turn + 22} 28 L${14 + P.turn + 18} 34 L${14 + P.turn - 18} 34Z`} fill={col(C.mist)} sw={3} />}
              {look.bareLip && <Halftone d={ellipse(14 + P.turn, 30, 22, 7)} dots="far" />}
              {look.beard && <Ink d={`M${-60} 20 Q-50 120 14 126 Q80 120 84 20 Q60 60 14 64 Q-30 60 -60 20Z`} fill={col(look.hair)} shade="R" sw={4} />}
              {p.lipNode && <g transform={`translate(${14 + P.turn} 30)`}>{p.lipNode}</g>}
              {look.headphones && <g><path d={`M${-HEAD_R * 0.95} -10 Q0 ${-HEAD_R * 1.5} ${HEAD_R * 0.95} -10`} stroke={C.ink} strokeWidth={8} fill="none" /><Ink d={ellipse(-HEAD_R * 0.92, 0, 18, 28)} fill={C.deep} sw={4} /><Ink d={ellipse(HEAD_R * 0.92, 0, 18, 28)} fill={C.deep} sw={4} /></g>}
              {p.faceExtra}
              {hatEl && <g transform={hatPos}>{hatEl}</g>}
            </g>
            {p.litBelow ? <ellipse cx={headC[0]} cy={headC[1] + 70} rx={110} ry={90} fill="url(#wn-lamp)" opacity={p.litBelow} /> : null}
          </g>
          {arm(shF, elF, hdF, p.hold, true, P.aF[0])}
        </g>
        {p.front}
      </g>
    </Print>
  );
};
