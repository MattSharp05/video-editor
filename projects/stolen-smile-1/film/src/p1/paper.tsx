// Part-1-only cut-paper pieces in the series style (pictures-pick §1.1–1.3): flat fill, ink outline 3.5 px
// (props 2.5 px), a card-coloured paper rim, an offset paper shadow (+8,+10, ink 28 %), poses on twos.
// Shared characters and sets come from ../series (the kit); these are only what the kit does not own:
// the plumber, Louis Béroud + easel + copy, the box camera, the doorknob, passers-by.
import React from 'react';

import {C as KC} from '../series/tokens';
// the series palette (kit tokens) plus a skin array for older call sites
export const C = {...KC, skin: [KC.skin1, KC.skin2, KC.skin3, KC.skin4]};
export const SHADOW = 'rgba(35,27,22,0.28)';

// a path cut from paper: shadow copy, card rim, fill, ink line
export const Cut: React.FC<{d: string; fill: string; w?: number; rim?: boolean; shadow?: boolean; o?: number}> = ({d, fill, w = 3.5, rim = true, shadow = true, o = 1}) => (
  <g opacity={o}>
    {shadow && <path d={d} transform="translate(8,10)" fill={SHADOW} />}
    {rim && <path d={d} fill="none" stroke={C.card} strokeWidth={w + 8} strokeLinejoin="round" />}
    <path d={d} fill={fill} stroke={C.ink} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" />
  </g>
);
export const Ell: React.FC<{cx: number; cy: number; rx: number; ry?: number; fill: string; w?: number; shadow?: boolean}> = ({cx, cy, rx, ry, fill, w = 3.5, shadow = true}) => {
  const r2 = ry ?? rx;
  const d = `M${cx - rx},${cy} a${rx},${r2} 0 1,0 ${2 * rx},0 a${rx},${r2} 0 1,0 ${-2 * rx},0`;
  return <Cut d={d} fill={fill} w={w} shadow={shadow} />;
};
export const rect = (x: number, y: number, w: number, h: number, r = 6) =>
  `M${x + r},${y} h${w - 2 * r} q${r},0 ${r},${r} v${h - 2 * r} q0,${r} ${-r},${r} h${-(w - 2 * r)} q${-r},0 ${-r},${-r} v${-(h - 2 * r)} q0,${-r} ${r},${-r}z`;

// on twos: puppet poses step every 2 frames
export const twos = (fr: number) => fr - (fr % 2);

// A generic split-pin paper person (feet at 0,0; ~640 px tall at s=1). Used for part-only people.
export type PersonLook = {
  coat: string; trousers?: string; skin?: string; hat?: 'cap' | 'kepi' | 'bowler' | 'top' | 'none' | 'beret' | 'bonnet';
  hatFill?: string; beard?: boolean; moustache?: boolean; hair?: string; skirt?: boolean; apron?: string;
};
export const Person: React.FC<{
  look: PersonLook; fr: number; walk?: number; s?: number; flip?: boolean; bow?: number; armL?: number; armR?: number;
  mouth?: 'smile' | 'o' | 'flat'; brows?: number; eyeX?: number; children?: React.ReactNode; lean?: number;
}> = ({look, fr, walk = 0, s = 1, flip, bow = 0, armL = 0, armR = 0, mouth = 'smile', brows = 0, eyeX = 0, children, lean = 0}) => {
  const f = twos(fr);
  const ph = walk ? (f / 30) * Math.PI * 2 * 1.6 : 0; // ~1.6 steps/s
  const sw = walk ? Math.sin(ph) * 22 * walk : 0;
  const bob = walk ? Math.abs(Math.cos(ph)) * -10 * walk : 0;
  const skin = look.skin ?? C.skin[1];
  const tr = look.trousers ?? C.ink;
  return (
    <g transform={`scale(${s * (flip ? -1 : 1)},${s})`}>
      <g transform={`translate(0,${bob}) rotate(${lean})`}>
        {/* legs */}
        {!look.skirt && <>
          <g transform={`rotate(${sw},-18,-300)`}><Cut d={rect(-40, -300, 40, 290, 10)} fill={tr} /><Cut d={rect(-58, -24, 62, 26, 12)} fill={C.ink} /></g>
          <g transform={`rotate(${-sw},18,-300)`}><Cut d={rect(0, -300, 40, 290, 10)} fill={tr} /><Cut d={rect(-4, -24, 62, 26, 12)} fill={C.ink} /></g>
        </>}
        <g transform={`rotate(${bow},0,-300)`}>
          {/* back arm */}
          <g transform={`rotate(${-sw * 0.8 + armL},-50,-500)`}><Cut d={rect(-74, -510, 40, 200, 18)} fill={look.coat} /><Ell cx={-54} cy={-300} rx={18} fill={skin} /></g>
          {/* body */}
          {look.skirt
            ? <Cut d="M-70,-520 Q-90,-300 -120,-10 L120,-10 Q90,-300 70,-520 Z" fill={look.coat} />
            : <Cut d="M-72,-530 Q-80,-400 -76,-280 L76,-280 Q80,-400 72,-530 Q0,-555 -72,-530Z" fill={look.coat} />}
          {look.apron && <Cut d="M-50,-440 L50,-440 L58,-250 L-58,-250Z" fill={look.apron} w={2.5} shadow={false} />}
          {/* head */}
          <g transform="translate(0,-610)">
            <Ell cx={0} cy={0} rx={62} ry={74} fill={skin} />
            {look.hair && <Cut d="M-62,-10 Q-60,-80 0,-80 Q60,-80 62,-10 Q40,-50 -10,-46 Q-44,-44 -62,-10Z" fill={look.hair} w={2.5} shadow={false} />}
            {/* face */}
            <circle cx={-20 + eyeX} cy={-6} r={6.5} fill={C.ink} /><circle cx={22 + eyeX} cy={-6} r={6.5} fill={C.ink} />
            <path d={`M-32,${-24 - brows} L-10,${-28 - brows * 1.3}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
            <path d={`M12,${-28 - brows * 1.3} L34,${-24 - brows}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
            {look.moustache && <path d="M-26,24 Q-12,12 0,20 Q12,12 26,24 Q12,30 0,24 Q-12,30 -26,24Z" fill={look.hair ?? C.ink} stroke={C.ink} strokeWidth={2} />}
            {look.beard && <Cut d="M-40,26 Q0,96 40,26 Q20,44 0,40 Q-20,44 -40,26Z" fill={look.hair ?? C.ink} w={2.5} shadow={false} />}
            {mouth === 'smile' && <path d="M-14,40 Q0,50 14,40" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />}
            {mouth === 'o' && <ellipse cx={0} cy={44} rx={9} ry={12} fill={C.ink} />}
            {mouth === 'flat' && <path d="M-12,44 L12,44" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />}
            {look.hat === 'cap' && <Cut d="M-66,-30 Q-60,-92 6,-92 Q62,-90 66,-36 L96,-30 Q100,-20 66,-22 Z" fill={look.hatFill ?? C.duskBlue} w={3} />}
            {look.hat === 'kepi' && <><Cut d={rect(-54, -112, 108, 86, 10)} fill={look.hatFill ?? C.nightBlue} w={3} /><Cut d="M-60,-30 L74,-30 L96,-14 L-60,-18Z" fill={C.ink} w={2.5} /></>}
            {look.hat === 'bowler' && <><Cut d="M-52,-40 Q-52,-120 0,-120 Q52,-120 52,-40Z" fill={look.hatFill ?? C.ink} w={3} /><Cut d={rect(-80, -46, 160, 16, 8)} fill={look.hatFill ?? C.ink} w={2.5} /></>}
            {look.hat === 'top' && <><Cut d={rect(-46, -170, 92, 130, 4)} fill={look.hatFill ?? C.ink} w={3} /><Cut d={rect(-78, -46, 156, 14, 7)} fill={look.hatFill ?? C.ink} w={2.5} /></>}
            {look.hat === 'beret' && <Cut d="M-70,-36 Q-74,-100 10,-96 Q80,-92 70,-40 Q0,-56 -70,-36Z" fill={look.hatFill ?? C.ink} w={3} />}
            {look.hat === 'bonnet' && <Cut d="M-80,-20 Q-80,-120 0,-118 Q90,-116 84,-24 Q40,-70 -10,-66 Q-50,-62 -80,-20Z" fill={look.hatFill ?? C.clueRed} w={3} />}
          </g>
          {/* front arm (carries children in its hand) */}
          <g transform={`rotate(${sw * 0.8 + armR},50,-500)`}>
            <Cut d={rect(34, -510, 40, 200, 18)} fill={look.coat} />
            <Ell cx={54} cy={-300} rx={18} fill={skin} />
            {children && <g transform="translate(54,-300)">{children}</g>}
          </g>
        </g>
      </g>
    </g>
  );
};

// --- part-only props ---
export const Easel: React.FC<{open: number; copy?: number}> = ({open, copy = 1}) => (
  <g>
    <Cut d={`M-10,-560 L${-90 * open - 10},0 L${-90 * open + 10},0 L10,-560Z`} fill={C.sepia} w={2.5} />
    <Cut d={`M-10,-560 L${90 * open - 10},0 L${90 * open + 10},0 L10,-560Z`} fill={C.sepia} w={2.5} />
    <Cut d={rect(-90, -330, 180, 14, 4)} fill={C.sepia} w={2.5} />
    {/* the half-finished copy: a paper sketch of her (clearly a sketch, not the real image) */}
    <g opacity={copy}>
      <Cut d={rect(-80, -560, 160, 230, 4)} fill={C.card} w={2.5} />
      <path d="M-30,-480 Q0,-530 30,-480 Q36,-430 0,-410 Q-36,-430 -30,-480Z" fill="none" stroke={C.sepia} strokeWidth={3} />
      <path d="M-50,-340 Q-40,-400 0,-405 Q40,-400 50,-340" fill="none" stroke={C.sepia} strokeWidth={3} />
      <path d="M-10,-430 Q0,-424 10,-430" stroke={C.sepia} strokeWidth={2.5} fill="none" />
    </g>
  </g>
);

export const BoxCamera: React.FC<{flash: number}> = ({flash}) => (
  <g>
    <Cut d="M0,0 L-60,220 M0,0 L60,220 M0,0 L0,230" fill="none" w={6} />
    <path d="M0,0 L-60,220 M0,0 L60,220 M0,0 L0,230" stroke={C.sepia} strokeWidth={8} />
    <Cut d="M-90,-110 L60,-110 L60,10 L-90,10Z" fill={C.ink} w={3} />
    <Cut d="M60,-90 L140,-120 L140,40 L60,10Z" fill={C.sepia} w={3} />
    <Ell cx={150} cy={-40} rx={22} ry={44} fill={C.ink} />
    <Cut d={rect(-80, -180, 30, 60, 4)} fill={C.oldGold} w={2.5} />
    {flash > 0 && <g opacity={flash}>
      <circle cx={-65} cy={-200} r={60 + 80 * flash} fill="#FFFFFF" opacity={0.7} />
      <circle cx={-65} cy={-200} r={30 + 30 * flash} fill="#FFFFFF" />
    </g>}
  </g>
);

export const Knob: React.FC = () => (
  <g><Ell cx={0} cy={0} rx={22} fill={C.oldGold} w={2.5} /><Cut d={rect(-6, 18, 12, 46, 4)} fill={C.oldGold} w={2.5} /></g>
);

export const Pliers: React.FC = () => (
  <g><Cut d="M0,0 L90,-14 L92,-4 L4,10Z" fill={C.stone} w={2.5} /><Cut d="M0,0 L90,18 L88,28 L-2,10Z" fill={C.stone} w={2.5} />
    <Cut d="M-4,2 L-70,-10 L-72,4 L-6,12Z" fill={C.clueRed} w={2.5} /><Cut d="M-4,8 L-70,24 L-68,36 L-2,16Z" fill={C.clueRed} w={2.5} /></g>
);

export const Toolbag: React.FC<{label?: string}> = ({label = 'Plumber'}) => (
  <g>
    <Cut d="M-80,0 Q-90,-110 0,-110 Q90,-110 80,0Z" fill={C.sepia} w={3} />
    <path d="M-40,-110 Q0,-170 40,-110" stroke={C.ink} strokeWidth={8} fill="none" />
    <text x={0} y={-36} textAnchor="middle" fontFamily="'Special Elite', monospace" fontSize={30} fill={C.card}>{label}</text>
  </g>
);

export const Baguettes: React.FC = () => (
  <g>{[0, 1, 2].map((i) => <Cut key={i} d={`M${i * 14 - 20},0 Q${i * 14 - 26},-150 ${i * 14 - 4},-170 Q${i * 14 + 8},-150 ${i * 14},0Z`} fill="#D9A55A" w={2.5} />)}</g>
);

export const Dog: React.FC<{fr: number}> = ({fr}) => {
  const k = Math.sin(twos(fr) * 0.9) * 8;
  return (
    <g>
      <Cut d={`M-50,-40 Q-50,-80 0,-80 Q50,-80 50,-40 Z`} fill={C.sepia} w={2.5} />
      <Cut d={rect(-46, -46, 12, 46 + k * 0.3, 4)} fill={C.sepia} w={2} /><Cut d={rect(34, -46, 12, 46 - k * 0.3, 4)} fill={C.sepia} w={2} />
      <Ell cx={64} cy={-90} rx={28} ry={24} fill={C.sepia} w={2.5} />
      <circle cx={72} cy={-94} r={4} fill={C.ink} />
      <path d={`M-50,-66 Q-80,${-100 + k} -70,${-120 + k}`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
};
