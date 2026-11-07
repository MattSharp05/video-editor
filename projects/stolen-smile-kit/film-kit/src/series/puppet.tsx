import React from 'react';
import { C } from './tokens';
import { blob, cut, rnd, stepped, wrect } from './util';
import { cutout } from './defs';

/**
 * Split-pin paper puppet (pick §3: head ≈ 1/4 of height, friendly proportions, ink outline 3.5 px at 1080×1920,
 * card rim + paper shadow). Drawn in 100-unit space, origin at the feet; scaled to `height` px.
 * All the series' people are Puppets with a Look; the named characters (characters.tsx) are presets.
 */
export type Expr = 'calm' | 'smile' | 'worried' | 'sweat' | 'surprised' | 'sad' | 'poker' | 'wink' | 'jawDrop' | 'happy' | 'sleepy';
export type PoseName = 'stand' | 'walk' | 'lift' | 'carry' | 'carryWalk' | 'rattle' | 'nod' | 'poker' | 'doorOpen' | 'reach' | 'trunkLid'
  | 'surprised' | 'heartHand' | 'sigh' | 'tipCap' | 'point' | 'shrug' | 'bow' | 'holdUp' | 'write' | 'peer' | 'handshake' | 'wave' | 'armsUp' | 'sit';
export type Pose = { far: [number, number]; near: [number, number]; legF: number; legN: number; tilt: number; head: number; bob: number; dx?: number };
export type Hat = 'none' | 'cap' | 'kepi' | 'bowler' | 'top' | 'peaked' | 'feather' | 'redcap' | 'beret';
export type HairStyle = 'side' | 'short' | 'fringe' | 'bald' | 'whiteLong' | 'bun' | 'neat' | 'curly';
export type Look = {
  skin: string; hair: string; hairStyle: HairStyle; headW?: number; headH?: number;
  coat: string; coatHem?: number; shoulders?: number; hem?: number; round?: number; // round 0..1 = belly
  shirt?: string; vest?: string; tie?: string; cape?: boolean; buttons?: string; gown?: boolean;
  sleeve?: string; rolled?: boolean; legs: string; shoes?: string;
  hat?: Hat; hatColor?: string;
  moustache?: 'neat' | 'bushy' | 'big' | 'none'; beard?: 'none' | 'pointed' | 'trim' | 'longWhite';
  monocle?: boolean; pinceNez?: boolean; glasses?: boolean; watchChain?: boolean; sleeveGuards?: boolean;
};

const S = 3.5; // ink stroke at final px; we divide by scale so the outline stays 3.5 px

export const poseAt = (name: PoseName, fr: number, seed = 0): Pose => {
  const f = stepped(fr, 2);
  const step = Math.floor(f / 2) % 8;            // 8-step cycle on twos
  const ph = (step / 8) * Math.PI * 2;
  const P: Pose = { far: [4, 10], near: [-4, 10], legF: 0, legN: 0, tilt: 0, head: 0, bob: 0 };
  const walk = () => { P.legF = 24 * Math.sin(ph); P.legN = -24 * Math.sin(ph); P.bob = Math.abs(Math.cos(ph)) * 1.6; P.tilt = 3; };
  switch (name) {
    case 'stand': P.head = Math.sin(f * 0.05 + seed) * 2; break;
    case 'poker': P.far = [2, 4]; P.near = [-2, 4]; break;
    case 'walk': walk(); P.far = [-20 * Math.sin(ph), 18]; P.near = [20 * Math.sin(ph), 18]; break;
    case 'lift': P.far = [150, 10]; P.near = [150, 10]; P.tilt = -3; P.head = -8; break;
    case 'holdUp': P.far = [95, 30]; P.near = [95, 30]; break;
    case 'carry': P.near = [18, 85]; P.far = [10, 20]; break;
    case 'carryWalk': walk(); P.near = [18, 85]; P.far = [-18 * Math.sin(ph), 18]; break;
    case 'rattle': { const j = (step % 2 ? 1 : -1) * 6; P.near = [80 + j, 10]; P.far = [75 - j, 10]; P.tilt = 6 + j * 0.3; P.legF = -8; P.legN = 10; break; }
    case 'nod': P.head = 10 + 6 * Math.sin(f * 0.25); P.far = [4, 10]; P.near = [10, 40]; break;
    case 'doorOpen': P.near = [85, 0]; P.legN = 10; P.tilt = 4; break;
    case 'reach': P.near = [70, 10]; P.far = [60, 15]; P.tilt = 10; P.legN = 12; P.legF = -6; break;
    case 'trunkLid': P.near = [60, 30]; P.far = [50, 30]; P.tilt = 16; P.head = 8; P.legN = 8; P.legF = -10; break;
    case 'surprised': P.near = [135, -20]; P.far = [120, -25]; P.tilt = -5; P.head = -6; P.legF = -6; break;
    case 'heartHand': P.near = [15, 125]; P.far = [4, 8]; P.head = -4; break;
    case 'sigh': P.near = [2, 4]; P.far = [2, 4]; P.head = 12 + 3 * Math.sin(f * 0.05); P.tilt = 4; P.bob = -1.5; break;
    case 'tipCap': P.near = [150, 110]; P.head = 6; break;
    case 'point': P.near = [95, 0]; P.far = [5, 20]; break;
    case 'shrug': P.near = [35, -95]; P.far = [35, -95]; P.head = -5 + 3 * Math.sin(f * 0.2); P.bob = 1.2; break;
    case 'bow': P.near = [60, 20]; P.far = [-20, 10]; P.tilt = 28; P.head = 10; P.legF = -6; break;
    case 'write': P.near = [45, 95]; P.far = [55, 70]; P.head = 12; P.tilt = 4; break;
    case 'peer': P.near = [70, 75]; P.far = [10, 20]; P.tilt = 14; P.head = 6; P.legN = 14; P.legF = -10; break;
    case 'handshake': P.near = [65, 20 + 8 * Math.sin(f * 0.6)]; P.far = [5, 10]; break;
    case 'wave': P.near = [150, 20 + 25 * Math.sin(f * 0.35)]; break;
    case 'armsUp': P.near = [160, 5]; P.far = [155, 5]; P.head = -6; break;
    case 'sit': P.legF = 85; P.legN = 85; P.near = [30, 50]; P.far = [25, 50]; P.bob = -14; break;
  }
  return P;
};

const Head: React.FC<{ L: Look; expr: Expr; fr: number; seed: string; look: [number, number]; talk: number; k: number }> = ({ L, expr, fr, seed, look, talk, k }) => {
  const hw = L.headW ?? 10.5, hh = L.headH ?? 12.5;
  const sw = S / k;
  const blinkF = stepped(fr, 2) % 97 < 4 && expr !== 'wink' && expr !== 'sleepy';
  const ex = 2 + look[0], ey = look[1];
  const eyeR = expr === 'surprised' || expr === 'jawDrop' ? 1.55 : 1.25;
  const brow = { calm: 0, smile: -0.4, happy: -0.6, worried: 1, sweat: 1, surprised: -2, sad: 1.2, poker: 0, wink: 0, jawDrop: -2.2, sleepy: 0.6 }[expr];
  const browTilt = expr === 'worried' || expr === 'sweat' || expr === 'sad' ? 1.4 : 0;
  const mouthY = 5.2;
  const mouth = (() => {
    if (talk > 0.05) return <ellipse cx={ex * 0.8} cy={mouthY} rx={2.2} ry={0.6 + talk * 2} fill={C.ink} />;
    switch (expr) {
      case 'smile': case 'calm': case 'wink': return <path d={`M${ex - 2.6},${mouthY - 0.3} Q${ex},${mouthY + (expr === 'calm' ? 1.2 : 2.2)} ${ex + 2.6},${mouthY - 0.3}`} stroke={C.ink} strokeWidth={sw * 0.8} fill="none" strokeLinecap="round" />;
      case 'happy': return <path d={`M${ex - 3},${mouthY - 0.6} Q${ex},${mouthY + 3.5} ${ex + 3},${mouthY - 0.6}Z`} fill={C.ink} />;
      case 'surprised': return <ellipse cx={ex} cy={mouthY + 0.6} rx={1.6} ry={2} fill={C.ink} />;
      case 'jawDrop': return <ellipse cx={ex} cy={mouthY + 2.2} rx={2.2} ry={3.6} fill={C.ink} />;
      case 'sad': case 'worried': case 'sweat': return <path d={`M${ex - 2.4},${mouthY + 1} Q${ex},${mouthY - 0.8} ${ex + 2.4},${mouthY + 1}`} stroke={C.ink} strokeWidth={sw * 0.8} fill="none" strokeLinecap="round" />;
      default: return <path d={`M${ex - 2.2},${mouthY + 0.3} L${ex + 2.2},${mouthY + 0.3}`} stroke={C.ink} strokeWidth={sw * 0.8} strokeLinecap="round" />;
    }
  })();
  const eye = (x: number, isWink: boolean) => (isWink || blinkF || expr === 'sleepy'
    ? <path d={`M${x - 1.5},${ey - 1.2} Q${x},${ey + (expr === 'sleepy' ? 0.2 : -0.5)} ${x + 1.5},${ey - 1.2}`} stroke={C.ink} strokeWidth={sw * 0.7} fill="none" strokeLinecap="round" />
    : <circle cx={x} cy={ey - 1.2} r={eyeR} fill={C.ink} />);
  const hair = (() => {
    const c = L.hair;
    switch (L.hairStyle) {
      case 'side': return <path d={`M${-hw - 0.5},${-1} C${-hw - 1},${-hh - 1} ${hw + 1},${-hh - 2} ${hw + 0.6},${-2} C${hw - 2},${-7} ${-1},${-8.5} ${-3},${-6} C${-5},${-8} ${-8},${-6} ${-hw - 0.5},${-1}Z`} fill={c} />;
      case 'short': case 'neat': return <path d={`M${-hw - 0.3},${-2} C${-hw},${-hh - 1.5} ${hw},${-hh - 1.5} ${hw + 0.3},${-2} C${hw - 3},${-8} ${-hw + 3},${-8} ${-hw - 0.3},${-2}Z`} fill={c} />;
      case 'fringe': return <path d={`M${-hw - 0.5},${0} C${-hw - 1},${-hh - 1.5} ${hw + 1},${-hh - 1.5} ${hw + 0.5},${0} L${hw - 1},${-5} L${4},${-4} L${1},${-5.5} L${-2},${-4} L${-6},${-5} Z`} fill={c} />;
      case 'whiteLong': return <path d={`M${-hw - 1.5},${8} C${-hw - 2},${-hh - 2} ${hw + 2},${-hh - 2} ${hw + 1.5},${8} L${hw - 0.5},${0} C${hw - 2},${-8} ${-hw + 2},${-8} ${-hw + 0.5},${0}Z`} fill={c} />;
      case 'bun': return <g><circle cx={0} cy={-hh - 1} r={4} fill={c} /><path d={`M${-hw - 0.3},${0} C${-hw},${-hh - 1.5} ${hw},${-hh - 1.5} ${hw + 0.3},${0} C${hw - 3},${-8} ${-hw + 3},${-8} ${-hw - 0.3},${0}Z`} fill={c} /></g>;
      case 'curly': return <g fill={c}>{[-8, -4, 0, 4, 8].map((x, i) => <circle key={i} cx={x} cy={-hh + 2 + Math.abs(x) * 0.25} r={3.6} />)}</g>;
      default: return null;
    }
  })();
  return (
    <g>
      <circle cx={-hw + 0.6} cy={0.5} r={2.2} fill={L.skin} stroke={C.ink} strokeWidth={sw} />
      <path d={blob(0, 0, hw, hh, `${seed}h`, 0.025)} fill={L.skin} stroke={C.ink} strokeWidth={sw} />
      {hair}
      {L.beard === 'pointed' && <path d={`M${-4},${5} Q${ex},${17} ${6},${5} Q${ex},${9} ${-4},${5}Z`} fill={L.hair} stroke={C.ink} strokeWidth={sw * 0.6} />}
      {L.beard === 'trim' && <path d={`M${-hw + 1},${2} Q${ex},${hh + 4} ${hw - 0.5},${2} Q${ex},${hh - 2} ${-hw + 1},${2}Z`} fill={L.hair} />}
      {L.beard === 'longWhite' && <path d={`M${-hw + 1},${1} Q${-6},${hh + 14} ${ex},${hh + 16} Q${8},${hh + 14} ${hw - 0.5},${1} Q${ex},${9} ${-hw + 1},${1}Z`} fill={C.smock} stroke={C.ink} strokeWidth={sw * 0.6} />}
      <g transform={`translate(0 ${-brow * 0.5})`}>
        <path d={`M${ex - 5.6},${ey - 4.2 - browTilt * 0.3} L${ex - 2.4},${ey - 4.2 + browTilt * 0.5}`} stroke={L.hairStyle === 'whiteLong' ? '#ffffff' : C.ink} strokeWidth={sw * 0.8} strokeLinecap="round" />
        <path d={`M${ex + 2.4},${ey - 4.2 + browTilt * 0.5} L${ex + 5.6},${ey - 4.2 - browTilt * 0.3}`} stroke={L.hairStyle === 'whiteLong' ? '#ffffff' : C.ink} strokeWidth={sw * 0.8} strokeLinecap="round" />
      </g>
      {eye(ex - 4, false)}{eye(ex + 4, expr === 'wink')}
      <path d={`M${ex + 0.5},${0} Q${ex + 2.2},${2.8} ${ex + 0.4},${3.2}`} stroke={C.ink} strokeWidth={sw * 0.6} fill="none" strokeLinecap="round" />
      {mouth}
      {L.moustache === 'neat' && <path d={`M${ex - 3.6},${4.3} Q${ex},${2.6} ${ex + 3.6},${4.3} Q${ex},${3.7} ${ex - 3.6},${4.3}Z`} fill={L.hair} stroke={L.hair} strokeWidth={0.8} />}
      {L.moustache === 'bushy' && <path d={`M${ex - 5},${4.8} Q${ex - 2},${2} ${ex},${3.3} Q${ex + 2},${2} ${ex + 5},${4.8} Q${ex},${5.6} ${ex - 5},${4.8}Z`} fill={L.hair} />}
      {L.moustache === 'big' && <path d={`M${ex - 7},${3.4} Q${ex - 3},${1.6} ${ex},${3.2} Q${ex + 3},${1.6} ${ex + 7},${3.4} Q${ex + 4},${6.4} ${ex},${4.6} Q${ex - 4},${6.4} ${ex - 7},${3.4}Z`} fill={L.hair} />}
      {L.monocle && <g><circle cx={ex + 4} cy={ey - 1.2} r={2.8} fill="none" stroke={C.oldGold} strokeWidth={sw * 0.7} /><path d={`M${ex + 6.6},${ey} Q${ex + 9},${8} ${ex + 7},${16}`} stroke={C.ink} strokeWidth={sw * 0.35} fill="none" /></g>}
      {L.pinceNez && <g fill="none" stroke={C.ink} strokeWidth={sw * 0.5}><circle cx={ex - 4} cy={ey - 1.2} r={2.4} /><circle cx={ex + 4} cy={ey - 1.2} r={2.4} /><path d={`M${ex - 1.6},${ey - 1.6} L${ex + 1.6},${ey - 1.6}`} /></g>}
      {L.glasses && <g fill="none" stroke={C.ink} strokeWidth={sw * 0.6}><circle cx={ex - 4} cy={ey - 1.2} r={2.7} /><circle cx={ex + 4} cy={ey - 1.2} r={2.7} /><path d={`M${ex - 1.3},${ey - 1.4} L${ex + 1.3},${ey - 1.4} M${ex - 6.7},${ey - 1.4} L${-hw},${-1}`} /></g>}
      {(expr === 'sweat') && [0, 1].map((i) => {
        const t = (stepped(fr, 2) + i * 14) % 28;
        return <path key={i} d={`M${hw + 1 + i * 2},${-6 + t * 0.35} q1.2,2 0,3 q-1.2,-1 0,-3z`} fill="#9CC3E0" stroke={C.ink} strokeWidth={sw * 0.4} opacity={t < 24 ? 1 : 0} />;
      })}
      <HatShape hat={L.hat ?? 'none'} color={L.hatColor ?? C.ink} hw={hw} hh={hh} sw={sw} />
    </g>
  );
};

const HatShape: React.FC<{ hat: Hat; color: string; hw: number; hh: number; sw: number }> = ({ hat, color, hw, hh, sw }) => {
  const st = { stroke: C.ink, strokeWidth: sw, strokeLinejoin: 'round' as const };
  const top = -hh + 2.5;
  switch (hat) {
    case 'cap': return <g><path d={`M${-hw - 0.5},${top + 2} C${-hw},${top - 7} ${hw},${top - 8} ${hw + 1},${top + 1} L${hw + 6},${top + 3} L${hw + 0.5},${top + 3.6} Z`} fill={color} {...st} /></g>;
    case 'kepi': return <g><path d={cut([[-hw + 0.5, top + 2], [-hw + 1.5, top - 8], [hw - 0.5, top - 9.5], [hw + 0.5, top + 2]], 'kepi', 0.2)} fill={color} {...st} /><path d={`M${hw - 2},${top + 2} L${hw + 5},${top + 3.6} L${-hw + 1},${top + 3}Z`} fill={C.ink} /><path d={`M${-hw + 1.5},${top - 3} L${hw},${top - 3.8}`} stroke={C.oldGold} strokeWidth={sw * 0.8} /></g>;
    case 'peaked': return <g><path d={`M${-hw - 1},${top - 1} C${-hw - 1},${top - 8} ${hw + 2},${top - 9} ${hw + 2},${top - 1} Z`} fill={color} {...st} /><path d={`M${-hw},${top - 1} L${hw + 7},${top + 1.5} L${-hw},${top + 1.8}Z`} fill={C.ink} /></g>;
    case 'bowler': return <g><path d={`M${-hw + 1},${top + 1} C${-hw + 1},${top - 11} ${hw - 1},${top - 11} ${hw - 1},${top + 1} Z`} fill={color} {...st} /><path d={`M${-hw - 3},${top + 1.5} Q0,${top - 1.2} ${hw + 3},${top + 1.5} Q0,${top + 3.5} ${-hw - 3},${top + 1.5}Z`} fill={color} {...st} /></g>;
    case 'top': return <g><path d={cut([[-hw + 2, top + 1], [-hw + 1, top - 16], [hw - 1, top - 16], [hw - 2, top + 1]], 'tophat', 0.2)} fill={color} {...st} /><path d={`M${-hw + 2},${top - 2.5} L${hw - 2},${top - 2.5}`} stroke={C.card} strokeWidth={sw * 0.9} opacity={0.5} /><path d={`M${-hw - 3.5},${top + 1.5} Q0,${top - 0.5} ${hw + 3.5},${top + 1.5} Q0,${top + 3.2} ${-hw - 3.5},${top + 1.5}Z`} fill={color} {...st} /></g>;
    case 'feather': return <g><path d={`M${-hw - 7},${top + 2} Q0,${top - 6} ${hw + 7},${top + 2} Q0,${top + 4} ${-hw - 7},${top + 2}Z`} fill={color} {...st} /><path d={`M${-4},${top - 2} C${-3},${top - 9} ${-hw - 3},${top - 14} ${-hw - 10},${top - 12} C${-hw - 4},${top - 8} ${-5},${top - 6} ${-4},${top - 2}Z`} fill={C.card} {...st} /></g>;
    case 'redcap': return <path d={`M${-hw - 0.5},${top + 2} C${-hw},${top - 7} ${hw},${top - 8} ${hw + 0.5},${top + 2} Z`} fill={C.silk} {...st} />;
    case 'beret': return <path d={`M${-hw - 2},${top + 1} C${-hw - 2},${top - 7} ${hw + 3},${top - 7} ${hw + 2},${top + 1} Z`} fill={color} {...st} />;
    default: return null;
  }
};

export type PuppetProps = {
  fr: number; x?: number; y?: number; height?: number; facing?: 1 | -1;
  pose?: PoseName | Pose; expr?: Expr; look?: [number, number]; talk?: number;
  hold?: React.ReactNode;      // drawn at the near hand, kept upright (e.g. a magnifier, a bundle)
  holdFar?: React.ReactNode;   // at the far hand
  under?: React.ReactNode;     // under the near arm (carried bundle): drawn between torso and near arm
  lamp?: 'left' | 'right'; opacity?: number; seed?: string; flat?: boolean; // flat: no rim/shadow filter
  ghost?: boolean;             // sepia ghost at 40 % (P3 ending)
};

export const Puppet: React.FC<PuppetProps & { look_: Look }> = ({ fr, x = 540, y = 1500, height = 640, facing = 1, pose = 'stand', expr = 'calm', look = [0, 0], talk = 0, hold, holdFar, under, lamp = 'left', opacity = 1, seed = 'p', flat, ghost, look_: L }) => {
  const k = height / 100;
  const P = typeof pose === 'string' ? poseAt(pose, fr, seed.length) : pose;
  const sw = S / k;
  const sh = L.shoulders ?? 12, hem = L.hem ?? 13, coatHem = L.coatHem ?? -28, rd = L.round ?? 0;
  const st = { stroke: C.ink, strokeWidth: sw, strokeLinejoin: 'round' as const };
  const leg = (ang: number, x0: number, key: string) => (
    <g key={key} transform={`translate(${x0} -40) rotate(${-ang})`}>
      <path d={wrect(-3.8, 0, 7.6, 37, `${seed}${key}`, 0.3)} fill={L.legs} {...st} />
      <path d={`M-4.2,36 Q-4.5,41 0,41 L7.5,41 Q9,37.5 4,36 Z`} fill={L.shoes ?? C.ink} {...st} />
    </g>
  );
  const arm = (a: [number, number], x0: number, key: string, item?: React.ReactNode) => (
    <g key={key} transform={`translate(${x0} -69) rotate(${-a[0]})`}>
      <path d={wrect(-3.4, -1.5, 6.8, 18.5, `${seed}${key}u`, 0.3)} fill={L.sleeve ?? L.coat} {...st} />
      <g transform={`translate(0 16) rotate(${-a[1]})`}>
        <path d={wrect(-3.1, -1, 6.2, 15.5, `${seed}${key}l`, 0.3)} fill={L.rolled ? L.skin : (L.sleeve ?? L.coat)} {...st} />
        {L.sleeveGuards && <rect x={-3.3} y={2} width={6.6} height={7} fill={C.ink} opacity={0.75} />}
        <circle cx={0} cy={16} r={3.4} fill={L.skin} {...st} />
        {item && <g transform={`translate(0 16) rotate(${a[0] + a[1]}) scale(${1 / k})`}>{item}</g>}
      </g>
    </g>
  );
  const torsoTop = -71 + 0, hy = -40;
  const torso = L.gown
    ? `M${-sh},${torsoTop} C${-sh - 2},${-50} ${-hem - 8},${-14} ${-hem - 12},${-1} L${hem + 12},${-1} C${hem + 8},${-14} ${sh + 2},${-50} ${sh},${torsoTop} Q0,${torsoTop - 3} ${-sh},${torsoTop}Z`
    : L.cape
      ? `M${-sh + 2},${torsoTop - 1} C${-sh - 8},${-60} ${-hem - 8},${-40} ${-hem - 6},${coatHem} L${hem + 6},${coatHem} C${hem + 8},${-40} ${sh + 8},${-60} ${sh - 2},${torsoTop - 1} Q0,${torsoTop - 4} ${-sh + 2},${torsoTop - 1}Z`
      : `M${-sh},${torsoTop} C${-sh - 2 - rd * 8},${-58} ${-hem - rd * 8},${-48} ${-hem},${coatHem} L${hem},${coatHem} C${hem + rd * 8},${-48} ${sh + 2 + rd * 8},${-58} ${sh},${torsoTop} Q0,${torsoTop - 3} ${-sh},${torsoTop}Z`;
  const front = (
    <g>
      {L.shirt && <path d={`M-3.5,${torsoTop - 1} L3.5,${torsoTop - 1} L${2.5 + rd * 2},${hy} L${-2.5 - rd * 2},${hy}Z`} fill={L.shirt} stroke={C.ink} strokeWidth={sw * 0.6} />}
      {L.vest && <path d={`M-6.5,${torsoTop + 1} L-2.5,${-52} L2.5,${-52} L6.5,${torsoTop + 1} L${7 + rd * 5},${hy + 2} L0,${hy + 4} L${-7 - rd * 5},${hy + 2}Z`} fill={L.vest} stroke={C.ink} strokeWidth={sw * 0.6} />}
      {L.tie && <path d={`M-1.3,${torsoTop} L1.3,${torsoTop} L1.8,${-52} L0,${-49} L-1.8,${-52}Z`} fill={L.tie} />}
      {L.watchChain && <path d={`M-5,${-48} Q0,${-44} 5,${-48}`} stroke={C.oldGold} strokeWidth={sw * 0.7} fill="none" />}
      {L.buttons && [0, 1, 2, 3].map((i) => <circle key={i} cx={1.2} cy={-64 + i * 7.5} r={1.2} fill={L.buttons} stroke={C.ink} strokeWidth={sw * 0.3} />)}
      <path d={`M-5,${torsoTop - 1.5} Q0,${torsoTop + 3} 5,${torsoTop - 1.5}`} stroke={C.ink} strokeWidth={sw * 0.7} fill="none" />
    </g>
  );
  const body = (
    <g transform={`translate(0 ${-P.bob})`}>
      {arm(P.far, -sh * 0.45, 'af', holdFar)}
      {leg(P.legF, -4, 'lf')}{leg(P.legN, 4, 'ln')}
      <g transform={`rotate(${P.tilt} 0 ${hy})`}>
        <path d={torso} fill={L.coat} {...st} />
        {front}
        <g transform={`translate(0 ${-86}) rotate(${P.head})`}>
          <rect x={-2.6} y={8} width={5.2} height={6} fill={L.skin} stroke={C.ink} strokeWidth={sw * 0.7} />
          <Head L={L} expr={expr} fr={fr} seed={seed} look={look} talk={talk} k={k} />
        </g>
        {under && <g transform={`translate(${sh * 0.2} -54) scale(${1 / k})`}>{under}</g>}
        {arm(P.near, sh * 0.5, 'an', hold)}
      </g>
    </g>
  );
  return (
    <g opacity={ghost ? 0.4 * opacity : opacity}
       filter={flat || ghost ? undefined : cutout(lamp)}
       style={ghost ? { filter: 'sepia(1)' } : undefined}>
      <g transform={`translate(${x + (P.dx ?? 0)} ${y}) scale(${facing * k} ${k})`}>{body}</g>
    </g>
  );
};
