// Adapter between the scenes and the cast/props. Until film-kit/READY these are rough local stand-ins (Tmp*); after it
// they wrap the kit's components so the scenes never change. No kit export names are defined here.
import React from 'react';
import {C} from './look';

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
};

const look: Record<Who, {coat: string; trou: string; h: number; hat: string; hatKind: string; hair: string; w: number}> = {
  crippenA: {coat: C.slate, trou: C.deep, h: 0.8, hat: C.deep, hatKind: 'none', hair: C.mist, w: 1},
  crippenB: {coat: C.mist, trou: C.slate, h: 0.8, hat: C.slate, hatKind: 'felt', hair: C.mist, w: 1},
  ethelB: {coat: C.slate, trou: C.slate, h: 0.75, hat: C.deep, hatKind: 'cap', hair: C.deep, w: 0.9},
  ethelA: {coat: C.newsprint, trou: C.deep, h: 0.78, hat: C.deep, hatKind: 'none', hair: C.deep, w: 0.85},
  kendall: {coat: C.deep, trou: C.deep, h: 0.95, hat: C.newsprint, hatKind: 'peak', hair: C.slate, w: 1},
  dew: {coat: C.slate, trou: C.deep, h: 1, hat: C.deep, hatKind: 'bowler', hair: C.mist, w: 1.25},
  dewPilot: {coat: C.deep, trou: C.deep, h: 1, hat: C.deep, hatKind: 'pilot', hair: C.mist, w: 1.25},
  hughes: {coat: C.newsprint, trou: C.slate, h: 0.85, hat: C.deep, hatKind: 'phones', hair: C.deep, w: 0.9},
  clerk: {coat: C.newsprint, trou: C.slate, h: 0.85, hat: C.deep, hatKind: 'phones', hair: C.slate, w: 1},
  parasol: {coat: C.mist, trou: C.mist, h: 0.85, hat: C.newsprint, hatKind: 'bonnet', hair: C.deep, w: 1},
  boater: {coat: C.mist, trou: C.slate, h: 0.9, hat: C.newsprint, hatKind: 'boater', hair: C.deep, w: 1},
  child: {coat: C.mist, trou: C.mist, h: 0.55, hat: C.slate, hatKind: 'cap', hair: C.deep, w: 0.8},
  steward: {coat: C.newsprint, trou: C.deep, h: 0.88, hat: C.deep, hatKind: 'none', hair: C.deep, w: 0.95},
  sailor: {coat: C.newsprint, trou: C.slate, h: 0.88, hat: C.newsprint, hatKind: 'boater', hair: C.deep, w: 1},
  newsboy: {coat: C.slate, trou: C.deep, h: 0.6, hat: C.deep, hatKind: 'cap', hair: C.deep, w: 0.85},
  constable: {coat: C.deep, trou: C.deep, h: 1, hat: C.deep, hatKind: 'helmet', hair: C.deep, w: 1.1},
  reader: {coat: C.mist, trou: C.mist, h: 0.9, hat: C.slate, hatKind: 'bowler', hair: C.deep, w: 1},
};

const ln = {stroke: C.ink, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};

// A standing/walking figure, feet at (x, y). s = scale (1 => ~760 px tall Dew). flip mirrors it.
export const TmpPerson: React.FC<{who: Who; x: number; y: number; s?: number; flip?: boolean; pose?: Pose; children?: React.ReactNode}> = ({who, x, y, s = 1, flip, pose = {}, children}) => {
  const L = look[who];
  const H = 760 * L.h; // total height in local units
  const head = H / 3.5, hr = head * 0.42;
  const w = 120 * L.w;
  const hipY = -H * 0.47, shY = -H * 0.8, headY = -H + hr;
  const ph = pose.legs;
  const legA = ph === undefined ? 4 : Math.sin(ph) * 22, legB = ph === undefined ? -4 : -Math.sin(ph) * 22;
  const legLen = -hipY;
  const leg = (a: number, dx: number) => {
    const r = (a * Math.PI) / 180;
    return <line x1={dx} y1={hipY} x2={dx + Math.sin(r) * legLen} y2={hipY + Math.cos(r) * legLen} stroke={L.trou} strokeWidth={w * 0.32} strokeLinecap="round" />;
  };
  const armLen = H * 0.36;
  const arm = (a: number, side: number) => {
    const r = (a * Math.PI) / 180;
    const ex = side * w * 0.5 + side * Math.sin(r) * armLen * 0.15 + Math.sin(r) * armLen * 0.9 * (side < 0 ? 1 : 1);
    const ey = shY + Math.cos(r) * armLen;
    return (
      <g>
        <line x1={side * w * 0.48} y1={shY + 10} x2={ex} y2={ey} stroke={L.coat} strokeWidth={w * 0.24} strokeLinecap="round" />
        <line x1={side * w * 0.48} y1={shY + 10} x2={ex} y2={ey} stroke={C.ink} strokeWidth={w * 0.24 + 8} strokeLinecap="round" opacity={0} />
        <circle cx={ex} cy={ey} r={w * 0.11} fill={C.skin} stroke={C.ink} strokeWidth={4} />
      </g>
    );
  };
  const puff = (pose.jacketPuff ?? 0) * 26;
  const mouth = pose.mouth ?? 'flat';
  const eyeDx = (pose.look ?? 0) * hr * 0.18;
  const brow = pose.brow ?? 0;
  const hatOn = pose.hat !== false;
  const bareLip = who === 'crippenB' || pose.bare;
  const isCrippen = who === 'crippenA' || who === 'crippenB';
  return (
    <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * s},${s}) rotate(${pose.lean ?? 0})`}>
      {/* legs */}
      <g stroke={C.ink}>{leg(legA, -w * 0.18)}{leg(legB, w * 0.18)}</g>
      <ellipse cx={-w * 0.18 + Math.sin((legA * Math.PI) / 180) * legLen + 8} cy={-4} rx={w * 0.2} ry={10} fill={C.ink} />
      <ellipse cx={w * 0.18 + Math.sin((legB * Math.PI) / 180) * legLen + 8} cy={-4} rx={w * 0.2} ry={10} fill={C.ink} />
      {/* torso */}
      <path d={`M${-w * 0.5 - puff},${shY} Q${-w * 0.62 - puff},${(shY + hipY) / 2} ${-w * 0.48 - puff * 0.6},${hipY + 30} L${w * 0.48 + puff * 0.6},${hipY + 30} Q${w * 0.62 + puff},${(shY + hipY) / 2} ${w * 0.5 + puff},${shY} Q0,${shY - 16} ${-w * 0.5 - puff},${shY} Z`} fill={L.coat} {...ln} />
      <path d={`M${w * 0.05},${shY} L${w * 0.5},${shY} L${w * 0.45},${hipY + 30} L${w * 0.05},${hipY + 30} Z`} fill="url(#ht)" />
      {/* arms */}
      {arm(pose.armL ?? 8, -1)}{arm(pose.armR ?? 8, 1)}
      {/* neck + head */}
      <rect x={-hr * 0.3} y={shY - hr * 0.45} width={hr * 0.6} height={hr * 0.6} fill={C.skin} />
      <circle cx={0} cy={headY} r={hr} fill={C.skin} {...ln} />
      <path d={`M${hr * 0.15},${headY - hr} A${hr},${hr} 0 0,1 ${hr * 0.15},${headY + hr} Z`} fill="url(#ht)" opacity={0.5} />
      {/* hair */}
      {who !== 'ethelB' && who !== 'child' && (isCrippen
        ? <path d={`M${-hr * 0.98},${headY - hr * 0.1} Q${-hr},${headY - hr * 0.5} ${-hr * 0.7},${headY - hr * 0.55} M${hr * 0.98},${headY - hr * 0.1} Q${hr},${headY - hr * 0.5} ${hr * 0.7},${headY - hr * 0.55}`} stroke={L.hair} strokeWidth={10} fill="none" strokeLinecap="round" />
        : who === 'ethelA'
          ? <g><path d={`M${-hr},${headY} A${hr},${hr} 0 0,1 ${hr},${headY} Q0,${headY - hr * 0.5} ${-hr},${headY} Z`} fill={L.hair} {...ln} strokeWidth={3} />{(pose.hairLen ?? 1) > 0.5 && <circle cx={-hr * 0.2} cy={headY - hr * 1.05} r={hr * 0.42} fill={L.hair} {...ln} strokeWidth={3} />}</g>
          : <path d={`M${-hr},${headY - hr * 0.1} A${hr},${hr} 0 0,1 ${hr},${headY - hr * 0.1} Q0,${headY - hr * 0.55} ${-hr},${headY - hr * 0.1} Z`} fill={L.hair} {...ln} strokeWidth={3} />)}
      {/* face */}
      <circle cx={-hr * 0.35 + eyeDx} cy={headY - hr * 0.05} r={hr * 0.09} fill={C.ink} />
      <circle cx={hr * 0.35 + eyeDx} cy={headY - hr * 0.05} r={hr * 0.09} fill={C.ink} />
      <circle cx={-hr * 0.32 + eyeDx} cy={headY - hr * 0.09} r={hr * 0.03} fill="#fff" />
      <circle cx={hr * 0.38 + eyeDx} cy={headY - hr * 0.09} r={hr * 0.03} fill="#fff" />
      <path d={`M${-hr * 0.55},${headY - hr * 0.3 - brow * hr * 0.12} L${-hr * 0.18},${headY - hr * 0.32 - brow * hr * 0.05} M${hr * 0.18},${headY - hr * 0.32 - brow * hr * 0.05} L${hr * 0.55},${headY - hr * 0.3 - brow * hr * 0.12}`} {...ln} strokeWidth={4} fill="none" />
      {mouth === 'o' || mouth === 'wide'
        ? <ellipse cx={0} cy={headY + hr * 0.5} rx={hr * (mouth === 'wide' ? 0.22 : 0.13)} ry={hr * (mouth === 'wide' ? 0.2 : 0.14)} fill={C.ink} />
        : <path d={mouth === 'smile' ? `M${-hr * 0.3},${headY + hr * 0.42} Q0,${headY + hr * 0.65} ${hr * 0.3},${headY + hr * 0.42}` : mouth === 'talk' ? `M${-hr * 0.22},${headY + hr * 0.48} Q0,${headY + hr * 0.62} ${hr * 0.22},${headY + hr * 0.48} Z` : `M${-hr * 0.22},${headY + hr * 0.5} L${hr * 0.22},${headY + hr * 0.5}`} {...ln} strokeWidth={4} fill={mouth === 'talk' ? C.ink : 'none'} />}
      {isCrippen && !bareLip && <path d={`M0,${headY + hr * 0.28} q${-hr * 0.4},${-hr * 0.12} ${-hr * 0.62},${hr * 0.18} q${hr * 0.25},${hr * 0.02} ${hr * 0.62},${-hr * 0.06} q${hr * 0.37},${hr * 0.08} ${hr * 0.62},${hr * 0.06} q${-hr * 0.22},${-hr * 0.3} ${-hr * 0.62},${-hr * 0.18} Z`} fill={C.deep} {...ln} strokeWidth={3} />}
      {isCrippen && bareLip && <path d={`M${-hr * 0.4},${headY + hr * 0.32} L${hr * 0.4},${headY + hr * 0.32}`} stroke={C.ink} strokeOpacity={0.15} strokeWidth={hr * 0.15} />}
      {(who === 'crippenA' && pose.glasses !== false) && <g fill="none" stroke={C.newsprint} strokeWidth={4}><circle cx={-hr * 0.35} cy={headY - hr * 0.05} r={hr * 0.24} /><circle cx={hr * 0.35} cy={headY - hr * 0.05} r={hr * 0.24} /><line x1={-hr * 0.11} y1={headY - hr * 0.05} x2={hr * 0.11} y2={headY - hr * 0.05} /></g>}
      {who === 'dew' && <path d={`M${-hr * 0.3},${headY + hr * 0.3} h${hr * 0.6}`} stroke={C.mist} strokeWidth={hr * 0.14} strokeLinecap="round" />}
      {/* hats */}
      {hatOn && L.hatKind === 'bowler' && <g><path d={`M${-hr * 1.25},${headY - hr * 0.55} Q0,${headY - hr * 0.75} ${hr * 1.25},${headY - hr * 0.55} L${hr * 0.85},${headY - hr * 0.6} Q${hr * 0.9},${headY - hr * 1.65} 0,${headY - hr * 1.65} Q${-hr * 0.9},${headY - hr * 1.65} ${-hr * 0.85},${headY - hr * 0.6} Z`} fill={L.hat} {...ln} />
        {pose.feather && who === 'dew' && <path d={`M${hr * 0.6},${headY - hr * 0.85} q${hr * 0.5},${-hr * 0.9} ${hr * 0.2},${-hr * 1.6} q${-hr * 0.1},${hr * 0.8} ${-hr * 0.35},${hr * 1.55}`} fill={C.cora} stroke={C.ink} strokeWidth={3} />}</g>}
      {hatOn && L.hatKind === 'pilot' && <path d={`M${-hr * 1.05},${headY - hr * 0.55} L${hr * 1.35},${headY - hr * 0.5} L${hr * 0.9},${headY - hr * 0.7} Q${hr * 0.95},${headY - hr * 1.35} 0,${headY - hr * 1.4} Q${-hr * 1.05},${headY - hr * 1.3} ${-hr * 1.05},${headY - hr * 0.55} Z`} fill={L.hat} {...ln} />}
      {hatOn && L.hatKind === 'peak' && <g><path d={`M${-hr * 1.05},${headY - hr * 0.6} Q0,${headY - hr * 1.6} ${hr * 1.05},${headY - hr * 0.6} Z`} fill={C.newsprint} {...ln} /><path d={`M${-hr * 1.05},${headY - hr * 0.6} h${hr * 2.1} l${hr * 0.4},${hr * 0.18} h${-hr * 1.2} Z`} fill={C.deep} {...ln} strokeWidth={3} /></g>}
      {hatOn && L.hatKind === 'felt' && <path d={`M${-hr * 1.2},${headY - hr * 0.55} Q0,${headY - hr * 0.7} ${hr * 1.2},${headY - hr * 0.55} L${hr * 0.8},${headY - hr * 0.62} Q${hr * 0.7},${headY - hr * 1.45} 0,${headY - hr * 1.35} Q${-hr * 0.7},${headY - hr * 1.45} ${-hr * 0.8},${headY - hr * 0.62} Z`} fill={L.hat} {...ln} />}
      {hatOn && L.hatKind === 'cap' && (() => {
        const sl = (pose.capSlip ?? 0) * hr * 0.4;
        return <g transform={`translate(0,${sl}) rotate(${(pose.capSlip ?? 0) * -8} 0 ${headY})`}><path d={`M${-hr * 1.15},${headY - hr * 0.35} Q${-hr * 1.1},${headY - hr * 1.45} ${hr * 0.1},${headY - hr * 1.3} Q${hr * 1.2},${headY - hr * 1.2} ${hr * 1.1},${headY - hr * 0.4} L${hr * 1.6},${headY - hr * 0.25} L${-hr * 1.15},${headY - hr * 0.35} Z`} fill={L.hat} {...ln} />{who === 'ethelB' && <path d={`M${-hr * 1.1},${headY - hr * 0.42} q${-hr * 0.2},${hr * 0.25} ${hr * 0.1},${hr * 0.25}`} fill={C.newsprint} {...ln} strokeWidth={3} />}</g>;
      })()}
      {hatOn && L.hatKind === 'boater' && <g><rect x={-hr * 0.8} y={headY - hr * 1.25} width={hr * 1.6} height={hr * 0.6} fill={L.hat} {...ln} /><path d={`M${-hr * 1.3},${headY - hr * 0.65} h${hr * 2.6}`} {...ln} strokeWidth={8} /></g>}
      {hatOn && L.hatKind === 'bonnet' && <path d={`M${-hr * 1.15},${headY + hr * 0.1} Q${-hr * 1.2},${headY - hr * 1.5} 0,${headY - hr * 1.45} Q${hr * 1.2},${headY - hr * 1.5} ${hr * 1.15},${headY + hr * 0.1} Q0,${headY - hr * 0.9} ${-hr * 1.15},${headY + hr * 0.1} Z`} fill={L.hat} {...ln} />}
      {hatOn && L.hatKind === 'helmet' && <path d={`M${-hr * 0.95},${headY - hr * 0.45} Q${-hr},${headY - hr * 2} 0,${headY - hr * 2.05} Q${hr},${headY - hr * 2} ${hr * 0.95},${headY - hr * 0.45} Z`} fill={L.hat} {...ln} />}
      {L.hatKind === 'phones' && <path d={`M${-hr * 1.02},${headY} A${hr * 1.05},${hr * 1.1} 0 0,1 ${hr * 1.02},${headY}`} fill="none" {...ln} strokeWidth={8} />}
      {L.hatKind === 'phones' && <g fill={C.deep} {...ln} strokeWidth={3}><ellipse cx={-hr * 1.02} cy={headY} rx={hr * 0.2} ry={hr * 0.3} /><ellipse cx={hr * 1.02} cy={headY} rx={hr * 0.2} ry={hr * 0.3} /></g>}
      {who === 'dewPilot' && pose.feather && <path d={`M${w * 0.3},${hipY + 10} q${w * 0.18},${-w * 0.4} ${w * 0.05},${-w * 0.7} q${-w * 0.04},${w * 0.35} ${-w * 0.14},${w * 0.68}`} fill={C.cora} stroke={C.ink} strokeWidth={3} />}
      {children}
    </g>
  );
};

// The runaway Moustache (stand-in for the kit's). flying = wings flap.
export const TmpMoustache: React.FC<{t: number; x: number; y: number; s?: number; flying?: boolean; rot?: number}> = ({t, x, y, s = 1, flying, rot = 0}) => {
  const flap = flying ? Math.sin(t * 22) * 0.9 : 0;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
      {flying && <g fill={C.slate} stroke={C.ink} strokeWidth={3}>
        <path d={`M-10,-6 Q-40,${-40 - flap * 30} -62,${-18 - flap * 30} Q-36,-12 -10,-2 Z`} />
        <path d={`M10,-6 Q40,${-40 - flap * 30} 62,${-18 - flap * 30} Q36,-12 10,-2 Z`} />
      </g>}
      <path d="M0,-8 q-34,-10 -56,14 q22,2 56,-5 q34,7 56,5 q-22,-24 -56,-14 Z" fill={C.deep} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      {flying && <g fill={C.ink}><circle cx={-12} cy={-4} r={3} /><circle cx={12} cy={-4} r={3} /></g>}
    </g>
  );
};

export const TmpBulb: React.FC<{x: number; y: number; on: number; s?: number}> = ({x, y, on, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {on > 0 && <circle r={70} fill={C.clue} opacity={0.25 * on} />}
    <path d="M-26,10 A34,34 0 1,1 26,10 L18,30 H-18 Z" fill={on > 0.5 ? C.clue : C.newsprint} stroke={C.clue} strokeWidth={5} />
    <path d="M-16,38 H16 M-14,48 H14" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    {on > 0 && [0, 1, 2, 3, 4].map((k) => { const a = -Math.PI / 2 + (k - 2) * 0.6; return <line key={k} x1={Math.cos(a) * 46} y1={Math.sin(a) * 46 - 4} x2={Math.cos(a) * (46 + 18 * on)} y2={Math.sin(a) * (46 + 18 * on) - 4} stroke={C.clue} strokeWidth={5} strokeLinecap="round" />; })}
  </g>
);
