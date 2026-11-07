// The kitchen wall the cat falls down: window + sill at the top (world y 0 = sill top), a tall warm wall with things
// on it (shelf and jars, clock with moving hands, frames, a hanging plant, a calendar), the floor with a striped rug at
// FLOOR. A sunbeam from the window crosses the wall; dust motes (each its own seed) drift in it.
// World units are px at zoom 1; x 0..1080 is the wall's width in view at zoom 1.
import React from 'react';
import {random} from 'remotion';

export const FLOOR = 4300; // world y of the floor surface
export const SILL = 0;
const INK = '#3A2418';

const Jar: React.FC<{x: number; y: number; c: string; h: number; t: number; k: number}> = ({x, y, c, h, t, k}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-34} y={-h} width={68} height={h} rx={14} fill={c} stroke={INK} strokeWidth={4} />
    <rect x={-38} y={-h - 16} width={76} height={20} rx={6} fill="#E8B04A" stroke={INK} strokeWidth={4} />
    <rect x={-22} y={-h + 24} width={44} height={26} rx={4} fill="#FFF6E6" opacity={0.85} />
    <ellipse cx={-14} cy={-h * 0.5} rx={6} ry={h * 0.28} fill="#fff" opacity={0.35 + 0.1 * Math.sin(t * 2 + k)} />
  </g>
);

const Leaf: React.FC<{x: number; y: number; a: number; s: number}> = ({x, y, a, s}) => (
  <path transform={`translate(${x},${y}) rotate(${a}) scale(${s})`} d="M0,0 Q22,-18 48,0 Q22,18 0,0 Z" fill="#5FAF5A" stroke={INK} strokeWidth={3} />
);

export const Wall: React.FC<{t: number; camY: number; zoom: number}> = ({t, camY, zoom}) => {
  const span = 1920 / zoom / 2 + 400;
  const vis = (y: number) => Math.abs(y - camY) < span + 600;
  // wallpaper: a soft diamond lattice of little dots
  const dots: React.ReactNode[] = [];
  const y0 = Math.floor((camY - span) / 120) * 120, y1 = camY + span;
  for (let y = y0; y < y1; y += 120) for (let x = -1200; x < 2300; x += 120) {
    const o = ((y / 120) % 2 === 0 ? 0 : 60);
    dots.push(<circle key={`${x},${y}`} cx={x + o} cy={y} r={7} fill="#F2C9A0" />);
  }
  // the clock keeps film time: almost stopped while time is slowed down (3.9-35 s), so it agrees with the tag
  const ct = t < 3.9 ? t : t < 35 ? 3.9 + (t - 3.9) * 0.04 : 5.14 + (t - 35);
  const clockA = 2 + ct / 60, sec = ct;
  return (
    <g>
      <rect x={-1500} y={-2500} width={4080} height={FLOOR + 2600} fill="url(#wallg)" />
      {dots}
      {/* window above the sill */}
      <g>
        <rect x={250} y={-760} width={580} height={760} rx={18} fill="url(#sky)" stroke="#8A5A36" strokeWidth={22} />
        <circle cx={680} cy={-560} r={70} fill="#FFE27A" opacity={0.95} />
        {[0, 1, 2].map((k) => {
          const cx = ((t * 14 + k * 230) % 760) + 160;
          return <g key={k} opacity={0.9}><ellipse cx={cx} cy={-640 + k * 90} rx={70} ry={26} fill="#fff" /><ellipse cx={cx + 40} cy={-656 + k * 90} rx={44} ry={24} fill="#fff" /></g>;
        })}
        <rect x={530} y={-760} width={20} height={760} fill="#8A5A36" />
        <rect x={250} y={-400} width={580} height={18} fill="#8A5A36" />
        {/* curtains, stirring */}
        {[-1, 1].map((k) => {
          const bx = k < 0 ? 210 : 870, sw = Math.sin(t * 1.7 + k) * 16;
          return <path key={k} d={`M${bx - 50},-800 L${bx + 50},-800 Q${bx + 40 + sw},-400 ${bx + 60 * k + sw * 1.5},-40 L${bx - 60 * -k + sw},-40 Q${bx - 40 + sw},-400 ${bx - 50},-800 Z`} fill="#F07F6E" stroke={INK} strokeWidth={4} />;
        })}
        <rect x={140} y={-830} width={800} height={22} rx={10} fill="#8A5A36" />
        {/* the sill */}
        <rect x={180} y={0} width={720} height={44} rx={10} fill="#C98A55" stroke={INK} strokeWidth={5} />
        <rect x={200} y={44} width={680} height={22} fill="#A86E40" stroke={INK} strokeWidth={4} />
        {/* a little pot plant on the sill */}
        <g transform="translate(300,0)">
          {[-40, -10, 20, 50].map((a, i) => <Leaf key={i} x={0} y={-70} a={-90 + a + Math.sin(t * 1.3 + i) * 6} s={1.2} />)}
          <path d="M-36,-70 L36,-70 L28,0 L-28,0 Z" fill="#D9623B" stroke={INK} strokeWidth={4} />
        </g>
      </g>
      {/* shelf with jars */}
      {vis(950) && <g>
        <rect x={90} y={950} width={420} height={26} rx={6} fill="#C98A55" stroke={INK} strokeWidth={5} />
        <Jar x={160} y={950} c="#F6D6A8" h={120} t={t} k={0} /><Jar x={270} y={950} c="#BFE3D0" h={90} t={t} k={1} /><Jar x={380} y={950} c="#F4B6B0" h={140} t={t} k={2} />
      </g>}
      {/* clock (hands keep time) */}
      {vis(1700) && <g transform="translate(820,1700)">
        <circle r={120} fill="#FFF8EC" stroke={INK} strokeWidth={8} />
        {Array.from({length: 12}).map((_, i) => <rect key={i} x={-4} y={-108} width={8} height={18} fill={INK} transform={`rotate(${i * 30})`} />)}
        <rect x={-6} y={-70} width={12} height={74} rx={6} fill={INK} transform={`rotate(${clockA * 30 + 40})`} />
        <rect x={-4} y={-96} width={8} height={100} rx={4} fill={INK} transform={`rotate(${ct * 6 / 60 * 6 + 200})`} />
        <rect x={-1.5} y={-100} width={3} height={110} fill="#E0483A" transform={`rotate(${sec * 6})`} />
        <circle r={10} fill="#E0483A" />
      </g>}
      {/* framed pictures: a fish and a mouse, drawn simply */}
      {vis(2350) && <g>
        <g transform={`translate(230,2350) rotate(${-4 + Math.sin(t * 0.8) * 1.2})`}>
          <rect x={-120} y={-150} width={240} height={300} fill="#FFE9C9" stroke="#8A5A36" strokeWidth={18} />
          <path d="M-60,0 Q0,-60 50,0 Q0,60 -60,0 Z M50,0 L90,-34 L90,34 Z" fill="#6EC3E8" stroke={INK} strokeWidth={4} />
          <circle cx={-30} cy={-8} r={6} fill={INK} />
        </g>
        <g transform={`translate(830,2500) rotate(${3 + Math.sin(t * 0.7 + 1) * 1.2})`}>
          <rect x={-100} y={-100} width={200} height={200} fill="#E6F2E0" stroke="#8A5A36" strokeWidth={16} />
          <path d="M-60,40 Q-50,-30 20,-10 Q60,0 60,40 Z" fill="#B9B4C8" stroke={INK} strokeWidth={4} />
          <circle cx={30} cy={-22} r={16} fill="#B9B4C8" stroke={INK} strokeWidth={4} />
          <path d="M-60,40 Q-90,40 -80,10" stroke={INK} strokeWidth={4} fill="none" />
        </g>
      </g>}
      {/* hanging plant */}
      {vis(3150) && <g transform="translate(180,3000)">
        <path d="M0,-200 L0,0" stroke={INK} strokeWidth={4} />
        <path d="M-60,0 L60,0 L44,70 L-44,70 Z" fill="#E7A35A" stroke={INK} strokeWidth={4} />
        {Array.from({length: 9}).map((_, i) => {
          const sw = Math.sin(t * 1.4 + i * 0.7) * 8;
          return <g key={i}>
            <path d={`M${-40 + i * 10},60 Q${-60 + i * 14 + sw},${150 + i * 18} ${-50 + i * 12 + sw * 1.6},${230 + i * 26}`} stroke="#4F9A4A" strokeWidth={5} fill="none" />
            <Leaf x={-50 + i * 12 + sw * 1.6} y={230 + i * 26} a={70 + sw * 3} s={0.7} />
            <Leaf x={-52 + i * 13 + sw} y={150 + i * 18} a={110 - sw * 3} s={0.6} />
          </g>;
        })}
      </g>}
      {/* calendar */}
      {vis(3500) && <g transform={`translate(860,3480) rotate(${Math.sin(t * 0.9) * 2})`}>
        <rect x={-90} y={-110} width={180} height={220} rx={8} fill="#fff" stroke={INK} strokeWidth={5} />
        <rect x={-90} y={-110} width={180} height={56} rx={8} fill="#E0483A" />
        {Array.from({length: 12}).map((_, i) => <rect key={i} x={-70 + (i % 4) * 38} y={-30 + Math.floor(i / 4) * 40} width={26} height={26} rx={4} fill={i === 6 ? '#14B8C8' : '#F2E2CC'} />)}
      </g>}
      {/* wainscot + floor + rug */}
      {vis(FLOOR) && <g>
        <rect x={-1500} y={FLOOR - 520} width={4080} height={520} fill="#CFE6DA" />
        {Array.from({length: 30}).map((_, i) => <rect key={i} x={-1500 + i * 140} y={FLOOR - 500} width={110} height={480} rx={8} fill="none" stroke="#A9CDBB" strokeWidth={6} />)}
        <rect x={-1500} y={FLOOR - 540} width={4080} height={26} fill="#B98A5E" />
        <rect x={-1500} y={FLOOR} width={4080} height={900} fill="#C88B57" />
        {Array.from({length: 7}).map((_, i) => <rect key={i} x={-1500} y={FLOOR + 30 + i * 120} width={4080} height={6} fill="#A86E40" />)}
        <rect x={-1500} y={FLOOR - 20} width={4080} height={30} fill="#9C6538" />
        <g>
          <ellipse cx={560} cy={FLOOR + 150} rx={560} ry={120} fill="#3E8FB0" stroke={INK} strokeWidth={5} />
          <ellipse cx={560} cy={FLOOR + 150} rx={440} ry={90} fill="none" stroke="#F6E3B4" strokeWidth={22} />
          <ellipse cx={560} cy={FLOOR + 150} rx={300} ry={58} fill="none" stroke="#F07F6E" strokeWidth={20} />
        </g>
      </g>}
    </g>
  );
};

// the sunbeam: a soft diagonal band from the window down across the wall
export const Beam: React.FC<{t: number}> = ({t}) => (
  <path d={`M250,-700 L830,-700 L${1500 + Math.sin(t * 0.3) * 20},${FLOOR} L${200 + Math.sin(t * 0.3) * 20},${FLOOR} Z`} fill="url(#beamg)" style={{mixBlendMode: 'screen'}} />
);

// dust motes in world space along the whole fall; each has its own drift; `streak` (px per frame of camera travel)
// stretches them into lines when real-speed falling makes them rush past
const MOTES = Array.from({length: 520}).map((_, i) => ({
  x: random(`mx${i}`) * 1300 - 110, y: random(`my${i}`) * (FLOOR + 900) - 900, r: 2.5 + random(`mr${i}`) * 5.5,
  p: random(`mp${i}`) * 6.28, sp: 0.3 + random(`ms${i}`) * 0.8, a: 18 + random(`ma${i}`) * 40, o: 0.35 + random(`mo${i}`) * 0.55,
}));
export const Motes: React.FC<{t: number; camY: number; zoom: number; streak: number; boost?: number; swirl?: number}> = ({t, camY, zoom, streak, boost = 0, swirl = 0}) => {
  const span = 1920 / zoom / 2 + 100;
  return (
    <g>
      {MOTES.map((m, i) => {
        const x = m.x + Math.sin(t * m.sp + m.p) * m.a + swirl * Math.sin(t * 1.3 + m.p) * 60;
        const y = m.y + Math.cos(t * m.sp * 0.8 + m.p) * m.a * 0.6 - t * 6 * m.sp + swirl * Math.cos(t * 1.3 + m.p) * 40;
        if (Math.abs(y - camY) > span) return null;
        const tw = 0.6 + 0.4 * Math.sin(t * 3 * m.sp + m.p * 2);
        const len = Math.min(110, Math.abs(streak) * (0.6 + m.sp));
        return len > 6
          ? <line key={i} x1={x} y1={y} x2={x} y2={y + len * Math.sign(streak)} stroke="#FFF4D6" strokeWidth={m.r} strokeLinecap="round" opacity={m.o * 0.7} />
          : <circle key={i} cx={x} cy={y} r={m.r * (1 + boost * 0.6)} fill="#FFF4D6" opacity={Math.min(1, m.o * tw * (1 + boost))} />;
      })}
    </g>
  );
};

export const Defs: React.FC = () => (
  <defs>
    <linearGradient id="wallg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFE3BD" /><stop offset="0.5" stopColor="#FFD9AE" /><stop offset="1" stopColor="#FBCB9C" />
    </linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FD3F5" /><stop offset="1" stopColor="#D8F0FA" /></linearGradient>
    <linearGradient id="beamg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stopColor="#FFF6C8" stopOpacity="0.75" /><stop offset="0.6" stopColor="#FFF0B8" stopOpacity="0.32" /><stop offset="1" stopColor="#FFE9A8" stopOpacity="0.12" />
    </linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#7A3A10" stopOpacity="0" /><stop offset="1" stopColor="#7A3A10" stopOpacity="0.45" /></radialGradient>
  </defs>
);
