// Adapter between the scenes and the cast/props. Until film-kit/READY these are rough local stand-ins (Tmp*); after it
// they wrap the kit's components so the scenes never change. No kit export names are defined here.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from './look';
import * as K from './series/cast';
import {Puppet, PoseName, Expr, Hold, Look} from './series/puppet';
import {Moustache, MoustacheState} from './series/devices';

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

export const TmpBulb: React.FC<{x: number; y: number; on: number; s?: number}> = ({x, y, on, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {on > 0 && <circle r={70} fill={C.clue} opacity={0.25 * on} />}
    <path d="M-26,10 A34,34 0 1,1 26,10 L18,30 H-18 Z" fill={on > 0.5 ? C.clue : C.newsprint} stroke={C.clue} strokeWidth={5} />
    <path d="M-16,38 H16 M-14,48 H14" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    {on > 0 && [0, 1, 2, 3, 4].map((k) => { const a = -Math.PI / 2 + (k - 2) * 0.6; return <line key={k} x1={Math.cos(a) * 46} y1={Math.sin(a) * 46 - 4} x2={Math.cos(a) * (46 + 18 * on)} y2={Math.sin(a) * (46 + 18 * on) - 4} stroke={C.clue} strokeWidth={5} strokeLinecap="round" />; })}
  </g>
);
