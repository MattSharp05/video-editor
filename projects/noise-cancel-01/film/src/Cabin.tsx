// The cabin (side cutaway of a plane at dusk), in cabin units. Hero at the window wearing our headphones (CUP).
import React from 'react';
import {CALM, CUP, NOISE, WIN, lerp, pr, rnd, win} from './common';
import {Label} from './Squiggle';

export const WINDOWS = [-620, WIN.x, 330, 780, -1070, 1230];
// the cabin's constant shudder: the engine hum shaking things a little
export const shud = (t: number, s = 1) => Math.sin(t * 31 + s) * 0.6 + Math.sin(t * 47 + s * 2) * 0.4;

const Sky: React.FC<{t: number; x: number; y: number; w: number; h: number; id: string; engine?: boolean; fan?: number}> = ({t, x, y, w, h, id, engine, fan = 0}) => (
  <g>
    <defs>
      <clipPath id={`win${id}`}><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w * 0.45} /></clipPath>
      <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5B78B3" /><stop offset="0.55" stopColor="#C99A8A" /><stop offset="1" stopColor="#F2B77A" /></linearGradient>
    </defs>
    <rect x={x - w / 2 - 14} y={y - h / 2 - 14} width={w + 28} height={h + 28} rx={w * 0.5} fill="#C9CCD6" />
    <rect x={x - w / 2 - 6} y={y - h / 2 - 6} width={w + 12} height={h + 12} rx={w * 0.47} fill="#8F95A6" />
    <g clipPath={`url(#win${id})`}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={`url(#sky${id})`} />
      {[0, 1, 2, 3].map((i) => {
        const cx = x + w / 2 - (((t * 40 + i * 97 + rnd(id + i) * 300) % (w + 260)) - 130);
        return <ellipse key={i} cx={cx} cy={y - h * 0.15 + i * h * 0.18} rx={46 + i * 12} ry={10 + i * 3} fill="#FCE6D6" opacity={0.55} />;
      })}
      {engine && (
        <g>
          {/* wing and engine nacelle seen through the window */}
          <path d={`M${x - w} ${y + h * 0.42} L${x + w} ${y + h * 0.2} L${x + w} ${y + h * 0.32} L${x - w} ${y + h * 0.6} Z`} fill="#B8BDC9" />
          <rect x={x - w * 0.42} y={y + h * 0.02} width={w * 0.84} height={h * 0.3} rx={h * 0.15} fill="#D9DCE3" />
          <ellipse cx={x + w * 0.4} cy={y + h * 0.17} rx={h * 0.06} ry={h * 0.15} fill="#3B4150" />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = fan + (i * Math.PI) / 3;
            return <line key={i} x1={x + w * 0.4} y1={y + h * 0.17} x2={x + w * 0.4 + Math.cos(a) * h * 0.035} y2={y + h * 0.17 + Math.sin(a) * h * 0.14} stroke="#9AA1B2" strokeWidth={3} />;
          })}
        </g>
      )}
    </g>
  </g>
);

export type Person = {x: number; face: 1 | -1; hair: string; skin: string; shirt: string; seed: number};
export const PEOPLE: Person[] = [
  {x: -1000, face: 1, hair: '#2B1E16', skin: '#C98E6B', shirt: '#6C5A8E', seed: 11},
  {x: -560, face: 1, hair: '#A8784A', skin: '#F0C7A4', shirt: '#3F7A6E', seed: 12},
  {x: 640, face: -1, hair: '#5A2E22', skin: '#E2AE88', shirt: '#B0584A', seed: 14}, // the neighbour, turned round to chat
];
export const HERO = {x: 175, y: 10};

const Head: React.FC<{p: Person; t: number; nod: number; talk?: number; cup?: boolean}> = ({p, t, nod, talk = 0, cup}) => {
  const m = talk > 0 ? 6 + 9 * Math.abs(Math.sin(t * 13 + p.seed)) * talk : 3;
  return (
    <g transform={`rotate(${nod} ${p.x} 70) scale(${p.face} 1) translate(${p.face === 1 ? 0 : -2 * p.x} 0)`}>
      <rect x={p.x - 22} y={60} width={44} height={60} fill={p.skin} />
      <ellipse cx={p.x} cy={0} rx={80} ry={92} fill={p.skin} />
      <path d={`M${p.x + 80} ${-10} q22 18 0 34`} fill={p.skin} />
      <path d={`M${p.x - 84} ${10} C${p.x - 96} ${-80} ${p.x - 20} ${-118} ${p.x + 50} ${-84} C${p.x + 80} ${-70} ${p.x + 84} ${-40} ${p.x + 80} ${-38} C${p.x + 20} ${-60} ${p.x - 30} ${-40} ${p.x - 40} ${20} Z`} fill={p.hair} />
      <ellipse cx={p.x + 44} cy={-16} rx={7} ry={talk > 0 ? 9 : 6} fill="#1C1C22" />
      <path d={`M${p.x + 30} ${-34} q14 -6 26 0`} stroke="#1C1C22" strokeWidth={4} fill="none" />
      <ellipse cx={p.x + 52} cy={42} rx={16} ry={m} fill="#5A2A2A" />
      {!cup && <ellipse cx={p.x - 20} cy={10} rx={16} ry={24} fill={p.skin} stroke="rgba(0,0,0,0.15)" strokeWidth={3} />}
    </g>
  );
};

const Seat: React.FC<{x: number}> = ({x}) => (
  <g>
    <rect x={x - 190} y={-150} width={110} height={560} rx={44} fill="#2F3D63" />
    <rect x={x - 186} y={-150} width={100} height={150} rx={40} fill="#3A4A75" />
    <rect x={x - 186} y={-60} width={100} height={36} fill="#E8E2D6" opacity={0.85} />
    <rect x={x - 120} y={310} width={250} height={70} rx={24} fill="#2F3D63" />
  </g>
);

const Torso: React.FC<{x: number; shirt: string; face: number}> = ({x, shirt, face}) => (
  <path d={`M${x - 95} 120 Q${x} 92 ${x + 95} 120 L${x + 105 * face} 420 L${x - 105} 420 Z`} fill={shirt} />
);

// imagined headphones of the thought bubble: cups are brick walls stamped BLOCK
export const BrickCup: React.FC<{x: number; y: number; r: number; stamp: number; op?: number}> = ({x, y, r, stamp, op = 1}) => (
  <g opacity={op}>
    <defs><clipPath id={`bc${x}${y}`}><ellipse cx={x} cy={y} rx={r * 0.9} ry={r} /></clipPath></defs>
    <ellipse cx={x} cy={y} rx={r * 0.9} ry={r} fill="#A8452E" />
    <g clipPath={`url(#bc${x}${y})`}>
      {Array.from({length: 9}, (_, row) => Array.from({length: 6}, (_, c) => (
        <rect key={`${row}-${c}`} x={x - r + c * r * 0.42 - (row % 2) * r * 0.21} y={y - r + row * r * 0.24} width={r * 0.38} height={r * 0.2} rx={2} fill={(row + c) % 3 ? '#C25B3E' : '#B04E35'} />
      )))}
    </g>
    <ellipse cx={x} cy={y} rx={r * 0.9} ry={r} fill="none" stroke="#3A2A28" strokeWidth={r * 0.08} />
    {stamp > 0.01 && <g transform={`translate(${x} ${y}) rotate(-14) scale(${1 + (1 - stamp) * 1.4})`} opacity={stamp}>
      <rect x={-r * 0.95} y={-r * 0.3} width={r * 1.9} height={r * 0.6} rx={r * 0.08} fill="none" stroke="#FFF1E0" strokeWidth={r * 0.07} />
      <text y={r * 0.17} textAnchor="middle" fontFamily="'Hanken Grotesk'" fontWeight={800} fontSize={r * 0.46} fill="#FFF1E0" letterSpacing={r * 0.04}>BLOCK</text></g>}
  </g>
);

export const HeadphoneCup: React.FC<{t: number; brick?: number; dents?: {t0: number; a: number}[]}> = ({t, brick = 0, dents = []}) => {
  // cushion ring with dents where voice squiggles plunge in (each dent springs back slowly)
  const pts = Array.from({length: 48}, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    let d = 0;
    for (const dn of dents) {
      const k = t - dn.t0; if (k < 0 || k > 1.6) continue;
      const da = Math.atan2(Math.sin(a - dn.a), Math.cos(a - dn.a));
      d += 14 * Math.exp(-da * da * 14) * Math.min(1, k / 0.12) * Math.exp(-k * 2.6);
    }
    const r = CUP.r + 12 - d;
    return `${(CUP.x + Math.cos(a) * r * 0.92).toFixed(1)},${(CUP.y + Math.sin(a) * r).toFixed(1)}`;
  });
  return (
    <g>
      <polygon points={pts.join(' ')} fill="#5D6170" />
      <polygon points={pts.join(' ')} fill="url(#foam)" opacity={0.6} />
      <ellipse cx={CUP.x} cy={CUP.y} rx={CUP.r * 0.88} ry={CUP.r * 0.95} fill="#23262F" />
      <ellipse cx={CUP.x - 12} cy={CUP.y - 18} rx={CUP.r * 0.5} ry={CUP.r * 0.35} fill="#FFFFFF" opacity={0.07} />
      <circle cx={CUP.x - 40} cy={CUP.y - 26} r={3} fill="#0E0F14" /><circle cx={CUP.x - 50} cy={CUP.y + 2} r={3} fill="#0E0F14" /><circle cx={CUP.x - 40} cy={CUP.y + 30} r={3} fill="#0E0F14" />
      {brick > 0.01 && <BrickCup x={CUP.x} y={CUP.y} r={CUP.r} stamp={brick} op={brick} />}
    </g>
  );
};

export const Cabin: React.FC<{t: number; talk: number; calm: number; nodAmp: number; cushionLabel: number; brick: number; dents: {t0: number; a: number}[]; engineLabel: number; headLabel: number}> =
  ({t, talk, calm, nodAmp, cushionLabel, brick, dents, engineLabel, headLabel}) => {
  const fan = t * 9;
  const sh = shud(t);
  return (
    <g>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#36405C" /><stop offset="0.5" stopColor="#2A3249" /><stop offset="1" stopColor="#1C2233" /></linearGradient>
        <pattern id="foam" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.6" fill="#7B8090" /><circle cx="8" cy="7" r="1.2" fill="#4B4F5C" /></pattern>
        <radialGradient id="calmg"><stop offset="0.55" stopColor={CALM} stopOpacity="0.18" /><stop offset="0.92" stopColor={CALM} stopOpacity="0.32" /><stop offset="1" stopColor={CALM} stopOpacity="0" /></radialGradient>
      </defs>
      <rect x={-2400} y={-1600} width={4800} height={3200} fill="url(#wall)" />
      {/* overhead bins: rattle with the hum */}
      {[-1300, -800, -300, 200, 700, 1200].map((bx, i) => (
        <g key={bx} transform={`translate(0 ${shud(t, i) * 1.4})`}>
          <rect x={bx - 240} y={-560} width={480} height={190} rx={30} fill="#D5D3CC" />
          <rect x={bx - 240} y={-410} width={480} height={40} rx={14} fill="#BDBAB2" />
          <rect x={bx - 30} y={-430} width={60} height={14} rx={6} fill="#8E8B84" />
        </g>
      ))}
      {/* seat-belt sign swinging */}
      <g transform={`rotate(${Math.sin(t * 1.7) * 5 + sh * 0.6} 420 -368)`}>
        <line x1={420} y1={-368} x2={420} y2={-330} stroke="#8E8B84" strokeWidth={4} />
        <rect x={380} y={-330} width={80} height={44} rx={10} fill="#E9E6DD" />
        <path d="M405 -318 a8 8 0 1 1 0.1 0 M398 -296 l7 -12 l7 12 Z" fill="#E28A3C" /><rect x={422} y={-314} width={26} height={8} rx={4} fill="#E28A3C" />
      </g>
      {WINDOWS.map((wx, i) => <Sky key={wx} t={t} x={wx} y={WIN.y} w={WIN.w} h={WIN.h} id={String(i)} engine={wx === WIN.x} fan={fan} />)}
      <Label x={WIN.x + 6} y={WIN.y + 4} text="ENGINE" size={26} color="#FFE7CF" op={engineLabel} />
      <rect x={-2400} y={470} width={4800} height={900} fill="#151A27" />
      {/* passengers behind (left) and the neighbour in front (right) */}
      {PEOPLE.map((p) => (
        <g key={p.x} transform={`translate(0 ${80 + shud(t, p.seed) * 0.8})`}>
          <Seat x={p.face === 1 ? p.x : p.x + 260} />
          <Torso x={p.x} shirt={p.shirt} face={p.face} />
          <Head p={p} t={t} nod={p.face === -1 ? Math.sin(t * 2.1) * 3 * (0.4 + talk) : Math.sin(t * 2.4 + p.seed) * nodAmp + Math.sin(t * 0.7 + p.seed) * 1.5} talk={p.face === -1 ? talk : 0} />
        </g>
      ))}
      {/* the hero */}
      <g>
        <Seat x={HERO.x} />
        <g transform="translate(0 10)"><Torso x={HERO.x} shirt="#2E6F8E" face={1} /></g>
        <g transform="translate(0 10)">
          <Head p={{x: HERO.x, face: 1, hair: '#1E1A1A', skin: '#D9A07C', shirt: '', seed: 3}} t={t} nod={Math.sin(t * 1.3) * 1.2} cup />
        </g>
        {/* coffee on the tray table: the surface ripples with the hum, calms in the quiet */}
        <rect x={HERO.x + 120} y={300} width={240} height={14} rx={6} fill="#5A6380" />
        <path d={`M${HERO.x + 230} 252 L${HERO.x + 236} 300 L${HERO.x + 276} 300 L${HERO.x + 282} 252 Z`} fill="#EDE9E2" />
        <path d={`M${HERO.x + 232} ${258 + Math.sin(t * 40) * 2.4} q12 ${-3 + sh * 3} 24 0 t24 0`} stroke="#6B4228" strokeWidth={6} fill="none" />
      </g>
      {/* headband + cup on the hero (cabin units) */}
      <g>
        <path d={`M${CUP.x - 6} ${CUP.y - 56} C${CUP.x - 20} ${CUP.y - 150} ${CUP.x + 70} ${CUP.y - 175} ${CUP.x + 95} ${CUP.y - 120}`} stroke="#2C2F38" strokeWidth={20} fill="none" strokeLinecap="round" />
        <Label x={CUP.x + 40} y={CUP.y - 150} text="HEADPHONES" size={20} op={headLabel} rot={-20} />
      </g>
      {calm > 0.01 && <ellipse cx={CUP.x} cy={CUP.y} rx={150 * calm} ry={165 * calm} fill="url(#calmg)" opacity={Math.min(1, calm * 1.4)} />}
      <HeadphoneCup t={t} brick={brick} dents={dents} />
      <Label x={CUP.x} y={CUP.y + CUP.r + 44} text="CUSHION" size={22} op={cushionLabel} />
    </g>
  );
};
export {NOISE, lerp, pr, win};
