// Adapter between the scenes and the cast/props. Until film-kit/READY these are rough local stand-ins (Tmp*); after it
// they wrap the kit's components so the scenes never change. No kit export names are defined here.
import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {C} from './look';
import * as K from './series/cast';
import {Puppet, PoseName, Expr, Hold, Look} from './series/puppet';
import {Moustache, MoustacheState} from './series/devices';
import {HunchBulb} from './series/props';

export type Who = 'crippenA' | 'crippenB' | 'ethelB' | 'ethelA' | 'kendall' | 'dew' | 'dewPilot' | 'hughes' | 'clerk'
  | 'parasol' | 'boater' | 'child' | 'steward' | 'sailor' | 'newsboy' | 'constable' | 'reader';

export type Pose = {
  armL?: number; armR?: number; // degrees from hanging down; positive = forward/up
  legs?: number; // walk phase (radians); undefined = stand
  mouth?: 'smile' | 'o' | 'flat' | 'talk' | 'wide';
  brow?: number; // -1 worried .. 1 raised
  look?: number; // eye offset -1..1
  hat?: boolean; // show hat (default true)
  lean?: number; // degrees
  feather?: boolean; // Dew: feather in band / pocket tip
  bare?: boolean; // crippen: bare lip (no moustache)
  glasses?: boolean;
  capSlip?: number; // ethelB: cap slipping 0..1
  jacketPuff?: number; // ethelB: jacket filled with wind 0..1
  hairLen?: number; // ethelA: 1 long bun, 0 short
  kp?: PoseName; ex?: Expr; hold?: Hold; seed?: number; mst?: MoustacheState | 'none'; hanky?: boolean;
};

// A figure, feet at (x, y). s = scale (1 => the layout height below). Renders the kit's characters; part-only people
// (Hughes, the Liverpool clerk, the sailor, the newsboys' readers) use the kit Puppet rig with their own Look.
const KIT_H: Record<Who, number> = {crippenA: 608, crippenB: 608, ethelB: 600, ethelA: 600, kendall: 722, dew: 760, dewPilot: 760, hughes: 646,
  clerk: 646, parasol: 646, boater: 684, child: 418, steward: 669, sailor: 669, newsboy: 456, constable: 760, reader: 684};
const PART_LOOK: Partial<Record<Who, Look>> = {
  hughes: {hair: C.deep, hairStyle: 'short', coat: C.newsprint, legs: C.slate, build: 0.85, shirt: C.newsprint, waistcoat: C.slate, headphones: true, rolled: true},
  clerk: {hair: C.slate, hairStyle: 'side', coat: C.newsprint, legs: C.slate, waistcoat: C.mist, headphones: true, glasses: true},
  sailor: {hair: C.deep, hairStyle: 'short', coat: C.newsprint, legs: C.slate, shirt: C.newsprint, hat: 'boater', scarf: C.slate},
  reader: {hair: C.deep, hairStyle: 'short', coat: C.mist, legs: C.mist, hat: 'bowler', hatColor: C.slate},
};
export const TmpPerson: React.FC<{who: Who; x: number; y: number; s?: number; flip?: boolean; pose?: Pose; t?: number; children?: React.ReactNode}> = ({who, x, y, s = 1, flip, pose = {}, children}) => {
  const fr = Math.round(useCurrentFrame());
  const height = KIT_H[who] * s;
  const kp: PoseName = pose.kp ?? (pose.legs !== undefined ? 'walk' : 'stand');
  const ex: Expr | undefined = pose.ex ?? (pose.mouth === 'wide' ? 'wide' : pose.mouth === 'o' ? 'startled' : pose.mouth === 'smile' ? 'smile' : pose.mouth === 'talk' ? 'talk' as Expr : undefined);
  const c = {fr, x, y, height, facing: (flip ? -1 : 1) as 1 | -1, pose: kp, expr: ex === ('talk' as Expr) ? undefined : ex, talk: pose.mouth === 'talk', hold: pose.hold, seed: pose.seed};
  let el: React.ReactNode;
  switch (who) {
    case 'crippenA': el = <K.CrippenA {...c} moustache={pose.bare ? 'none' : (pose.mst ?? 'on')} />; break;
    case 'crippenB': el = <K.CrippenB {...c} hat={pose.hat !== false} moustache={pose.mst ?? 'none'} />; break;
    case 'ethelA': el = <K.EthelA {...c} hair={(pose.hairLen ?? 1) > 0.5 ? 'bun' : 'bob'} />; break;
    case 'ethelB': el = <K.EthelB {...c} capSlip={pose.capSlip} hankyClue={pose.hanky} />; break;
    case 'kendall': el = <K.Kendall {...c} />; break;
    case 'dew': el = <K.DewA {...c} feather={pose.feather !== false} />; break;
    case 'dewPilot': el = <K.DewB {...c} pocketFeather={pose.feather !== false} />; break;
    case 'parasol': el = <K.Passenger {...c} kind="parasol" pose={pose.kp} />; break;
    case 'boater': el = <K.Passenger {...c} kind="boater" pose={pose.kp} />; break;
    case 'child': el = <K.Passenger {...c} kind="hoop" pose={pose.kp} hold={pose.hold ?? (pose.kp ? 'none' : undefined)} />; break;
    case 'steward': el = <K.Passenger {...c} kind="steward" pose={pose.kp} />; break;
    case 'newsboy': el = <K.Newsboy {...c} pose={pose.kp ?? 'shout'} />; break;
    case 'constable': el = <K.Constable {...c} />; break;
    default: el = <Puppet {...c} look={PART_LOOK[who]!} />;
  }
  return <g>{el}{children && <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * s},${s})`}>{children}</g>}</g>;
};

// The runaway Moustache (stand-in for the kit's). flying = wings flap.
export const TmpMoustache: React.FC<{t: number; x: number; y: number; s?: number; flying?: boolean; rot?: number; state?: MoustacheState}> = ({t, x, y, s = 1, flying, rot = 0, state}) => (
  <Moustache fr={Math.round(t * 30)} x={x} y={y} size={s * 0.92} state={state ?? (flying ? 'fly' : 'on')} tilt={rot} />
);

export const TmpBulb: React.FC<{x: number; y: number; on: number; s?: number}> = ({x, y, on, s = 1}) => {
  const fr = Math.round(useCurrentFrame());
  return <HunchBulb fr={fr} x={x} y={y} on={on > 0.5} size={s} />;
};

// Strollers: n small passengers walking across a band [x0, x1] at ground y, each on its own loop (secondary life).
export const Strollers: React.FC<{t: number; n: number; x0: number; x1: number; y: number; s?: number; seed: string; kinds?: Who[]}> = ({t, n, x0, x1, y, s = 0.3, seed, kinds = ['parasol', 'boater', 'steward', 'reader', 'sailor']}) => (
  <g>{[...Array(n)].map((_, k) => {
    const r = (q: string) => random(`${seed}${k}${q}`);
    const dir = r('d') > 0.5 ? 1 : -1, sp = 40 + r('v') * 50, w = x1 - x0 + 200;
    const p = ((r('x') * w + t * sp) % w);
    const x = dir > 0 ? x0 - 100 + p : x1 + 100 - p;
    return <TmpPerson key={k} who={kinds[k % kinds.length]} x={x} y={y + r('y') * 30} s={s * (0.85 + r('s') * 0.3)} flip={dir < 0} pose={{kp: 'walk', seed: k * 3.1}} />;
  })}</g>
);
// A pennant that waves (own mover).
export const Pennant: React.FC<{t: number; x: number; y: number; s?: number; color?: string; seed?: number}> = ({t, x, y, s = 1, color = C.mist, seed = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <line x1={0} y1={0} x2={0} y2={-120} stroke={C.ink} strokeWidth={5} />
    <path d={`M0,-120 Q30,${-110 + Math.sin(t * 6 + seed) * 10} 70,${-100 + Math.sin(t * 6 + seed + 1) * 14} Q30,${-92 + Math.sin(t * 6 + seed + 2) * 8} 0,-84 Z`} fill={color} stroke={C.ink} strokeWidth={3} />
  </g>
);
