// S1: inside the oven, side view. Cavity x ±600, y ±450 (this is exactly the door window, scaled). Spud on the plate,
// the myth chef inside him, the magnetron behind the right side wall, wave fronts bouncing.
import React from 'react';
import {random} from 'remotion';
import {C, clamp01, mix, ramp, sm, tempC, mixC} from './art';
import {SANS} from './kit/fonts';

export const SP = {x: 0, y: 150, rx: 370, ry: 235};       // Spud
export const BEAD = {x: SP.x - 0.9 * SP.rx * Math.cos(0.42), y: SP.y - 0.9 * SP.ry * Math.sin(0.42), r: 15};
export const MAG = {x: 930, y: -170};
export const BOX = {x0: -600, x1: 600, y0: -450, y1: 450};

// printed word on an object: constant screen size whatever the zoom
export const Lbl: React.FC<{x: number; y: number; text: string; o: number; z: number; size?: number; color?: string; rot?: number; anchor?: 'middle' | 'start' | 'end'}> =
  ({x, y, text, o, z, size = 54, color = C.cream, rot = 0, anchor = 'middle'}) => o <= 0.01 ? null : (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${(0.85 + 0.15 * sm(o * 1.4)) / z})`} opacity={clamp01(o)}>
      <text textAnchor={anchor} y={size * 0.35} fontFamily={SANS} fontWeight={900} fontSize={size} letterSpacing={3} fill={color}
        stroke="#2A1828" strokeWidth={size * 0.2} strokeLinejoin="round" style={{paintOrder: 'stroke'}}>{text}</text>
    </g>
  );

// ---------- the room around the cavity (seen once we are inside) ----------
export const OvenRoom: React.FC<{t: number; xray: number; flash: number[]}> = ({t, xray, flash}) => (
  <g>
    <defs>
      <radialGradient id="cavL" cx="0.5" cy="0.38" r="0.75"><stop offset="0" stopColor="#FFF0C8" /><stop offset="0.7" stopColor="#E8BE7E" /><stop offset="1" stopColor="#B98552" /></radialGradient>
      <linearGradient id="shell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E4A4C" /><stop offset="1" stopColor="#4C3440" /></linearGradient>
    </defs>
    <rect x={-4000} y={-4000} width={8000} height={8000} fill="url(#shell)" />
    {/* casing ribs so the shell has life when the camera drifts */}
    {Array.from({length: 18}, (_, i) => <rect key={i} x={-1700 + i * 200} y={-1500} width={14} height={3200} fill="#8A6060" opacity={0.18} />)}
    <rect x={BOX.x0 - 30} y={BOX.y0 - 30} width={1260} height={960} rx={40} fill="#3A2830" />
    <rect x={BOX.x0} y={BOX.y0} width={1200} height={900} rx={26} fill="url(#cavL)" />
    {/* light bulb in the ceiling */}
    <ellipse cx={-380} cy={BOX.y0 + 6} rx={70} ry={14} fill="#FFF6D8" />
    {/* wall flashes where waves hit (metal reflects) */}
    {flash.map((f, i) => f > 0.01 && <rect key={i} x={i === 0 ? BOX.x0 - 6 : i === 1 ? BOX.x1 - 10 : BOX.x0} y={i < 2 ? BOX.y0 : i === 2 ? BOX.y0 - 6 : BOX.y1 - 10}
      width={i < 2 ? 16 : 1200} height={i < 2 ? 900 : 16} fill={C.wave} opacity={f} />)}
    {/* the compartment right of the cavity, behind a side wall that turns to X-ray */}
    <rect x={640} y={-560} width={620} height={1010} rx={30} fill="#3E2E36" />
    <g opacity={1 - 0.8 * xray}>
      <rect x={640} y={-560} width={620} height={1010} rx={30} fill="#8E7A6E" />
      {Array.from({length: 9}, (_, i) => <rect key={i} x={680} y={-520 + i * 105} width={540} height={14} rx={7} fill="#7A665C" />)}
    </g>
    {xray > 0.01 && <g opacity={xray * 0.5} stroke="#A8F0FF" strokeWidth={2} fill="none">
      {Array.from({length: 12}, (_, i) => <line key={i} x1={640 + i * 52} y1={-560} x2={640 + i * 52} y2={450} />)}
      {Array.from({length: 20}, (_, i) => <line key={`h${i}`} x1={640} y1={-560 + i * 52} x2={1260} y2={-560 + i * 52} />)}
    </g>}
  </g>
);

// ---------- the magnetron ----------
export const Magnetron: React.FC<{t: number; on: number; xray: number}> = ({t, on, xray}) => {
  if (xray < 0.01) return null;
  const sh = on * Math.sin(t * 90) * 2.5;
  return (
    <g opacity={xray}>
      {/* waveguide: a channel from the magnetron to the cavity wall */}
      <rect x={560} y={-330} width={MAG.x - 560} height={110} fill="#9C8070" stroke="#5A4440" strokeWidth={6} />
      <g transform={`translate(${MAG.x + sh},${MAG.y})`}>
        {Array.from({length: 7}, (_, i) => <rect key={i} x={-120} y={-110 + i * 34} width={240} height={14} rx={5} fill="#C9935E" stroke="#8A5A3A" strokeWidth={3} />)}
        <rect x={-70} y={-130} width={140} height={260} rx={20} fill="#D99A5B" stroke="#8A5A3A" strokeWidth={5} />
        <circle r={46} fill={mixC('#8A5A3A', '#FF8A3D', on)} />
        <circle r={46 + 30 * on} fill={C.heat} opacity={0.25 * on * (0.7 + 0.3 * Math.sin(t * 12))} />
        {/* antenna that pings */}
        <rect x={-90} y={-180} width={24} height={60} rx={8} fill="#E8E0D0" />
        <circle cx={-78} cy={-186} r={14 + 4 * Math.sin(t * 9)} fill={C.wave} opacity={on} />
        {/* fan */}
        <g transform={`translate(${190},${60}) rotate(${t * 720 * on})`}>
          <circle r={70} fill="#6B5A54" />
          {[0, 90, 180, 270].map((a) => <ellipse key={a} cx={0} cy={-36} rx={18} ry={34} fill="#B7AAA0" transform={`rotate(${a})`} />)}
          <circle r={14} fill="#3A2A2A" />
        </g>
      </g>
    </g>
  );
};

// ---------- the myth chef: hard hat, blowtorch. state: torch 0..1, cold 0..1 (scarf, shiver), sit 0..1, warm 0..1 ----------
export const Chef: React.FC<{x: number; y: number; s: number; t: number; torch: number; sputter: number; cold: number; sit: number; warm: number; wave?: number}> =
  ({x, y, s, t, torch, sputter, cold, sit, warm, wave = 0}) => {
    const shiver = cold * (1 - warm) * Math.sin(t * 50) * 2;
    const tap = sit * (1 - warm) * Math.max(0, Math.sin(t * 9)) * 8;
    return (
      <g transform={`translate(${x + shiver},${y}) scale(${s})`}>
        {sit > 0.01 && <g opacity={sit}><path d="M-34 0 L34 0 L28 -46 L-28 -46 Z" fill="#6E8FB0" /><rect x={-36} y={-50} width={72} height={10} rx={4} fill="#4E6F90" /></g>}
        <g transform={`translate(0,${-sit * 46})`}>
          {/* legs */}
          <rect x={-18} y={-50 + sit * 26} width={14} height={50 - sit * 26} rx={6} fill="#3A3A5A" />
          <rect x={4} y={-50 + sit * 26} width={14} height={50 - sit * 26} rx={6} fill="#3A3A5A" />
          {/* body */}
          <rect x={-28} y={-112} width={56} height={68} rx={20} fill="#F4EEE4" />
          {/* head */}
          <circle cx={0} cy={-134} r={26} fill="#F2C29B" />
          <ellipse cx={-9} cy={-136} rx={3.5} ry={4.5} fill={C.ink} /><ellipse cx={9} cy={-136} rx={3.5} ry={4.5} fill={C.ink} />
          {warm > 0.5 || torch > 0.5
            ? <path d="M-9 -124 Q0 -116 9 -124" stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
            : <path d="M-8 -121 Q0 -126 8 -121" stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />}
          {/* hard hat */}
          <path d="M-32 -146 Q0 -186 32 -146 Z" fill="#FFC23A" /><rect x={-36} y={-150} width={72} height={9} rx={4} fill="#E8A51C" />
          {/* scarf when cold */}
          {cold * (1 - warm) > 0.02 && <g opacity={cold * (1 - warm * 0.9)}>
            <rect x={-26} y={-114} width={52} height={14} rx={7} fill={C.cold} />
            <rect x={10} y={-104} width={12} height={34} rx={6} fill={C.cold} transform={`rotate(${Math.sin(t * 6) * 10} 16 -104)`} />
          </g>}
          {/* arm + torch (torch arm), or tapping a watch when sitting, or waving */}
          {wave > 0.01
            ? <rect x={20} y={-160} width={12} height={50} rx={6} fill="#F4EEE4" transform={`rotate(${30 + Math.sin(t * 12) * 25} 26 -110)`} />
            : sit > 0.5
              ? <g><rect x={-30} y={-96} width={40} height={12} rx={6} fill="#F4EEE4" transform={`rotate(${-10 - tap} -30 -90)`} /><circle cx={16} cy={-88} r={7} fill={C.gold} /></g>
              : <g>
                <rect x={18} y={-100} width={42} height={12} rx={6} fill="#F4EEE4" />
                <rect x={54} y={-110} width={30} height={30} rx={6} fill="#C0473A" />
                <rect x={82} y={-100} width={30} height={10} fill="#888" />
                {torch > 0.01 && <g transform="translate(112,-95)" opacity={torch}>
                  <path d={`M0 -14 Q${60 + Math.sin(t * 40) * 10} ${-6 + Math.sin(t * 33) * 5} ${90 + Math.sin(t * 27) * 14} 0 Q${60} 10 0 14 Z`} fill={C.heat} />
                  <path d={`M0 -7 Q35 -3 ${52 + Math.sin(t * 31) * 8} 0 Q35 5 0 7 Z`} fill="#FFE6A0" />
                </g>}
                {sputter > 0.01 && <g opacity={sputter * (1 - sm(sputter))} transform="translate(130,-100)">
                  {[0, 1, 2, 3].map((i) => <circle key={i} cx={i * 18 + sputter * 40} cy={-i * 16 - sputter * 60} r={14 + i * 6 + sputter * 20} fill="#8A8A90" opacity={0.7} />)}
                </g>}
              </g>}
        </g>
      </g>
    );
  };

// ---------- Spud the potato. bands[0] = outer layer .. bands[5] = middle (temperature 0..1). cut 0..1 shows the cutaway ----------
export const Spud: React.FC<{t: number; cut: number; bands: number[]; mood: 'smug' | 'worried' | 'sweat' | 'happy' | 'cool'; steam: number; children?: React.ReactNode; bead?: number; shades?: number; plateRot?: number}> =
  ({t, cut, bands, mood, steam, children, bead = 1, shades = 0}) => {
    const {x, y, rx, ry} = SP;
    const n = bands.length;
    const wob = Math.sin(t * 2.1) * 4;
    return (
      <g>
        {/* plate (glass turntable), turning */}
        <ellipse cx={x} cy={y + ry + 6} rx={480} ry={58} fill="#E8F2F2" opacity={0.5} stroke="#fff" strokeOpacity={0.6} strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => { const a = t * 0.9 + i * Math.PI / 2; return <ellipse key={i} cx={x + Math.cos(a) * 400} cy={y + ry + 6 + Math.sin(a) * 46} rx={14} ry={5} fill="#fff" opacity={0.5 * (0.5 + 0.5 * Math.sin(a))} />; })}
        <g transform={`translate(0,${wob * 0.3})`}>
          {/* skin */}
          <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#C88F55" stroke="#8C5A30" strokeWidth={10} />
          {[[-200, -80], [140, -120], [220, 60], [-90, 110], [20, -30]].map(([a, b], i) => <ellipse key={i} cx={x + a} cy={y + b} rx={14} ry={8} fill="#9A6634" opacity={0.6 * (1 - cut)} />)}
          {/* cutaway: concentric temperature bands */}
          {cut > 0.01 && <g opacity={cut}>
            {bands.map((b, i) => { const k = 1 - (i / n) * 0.84; return <ellipse key={i} cx={x} cy={y} rx={rx * k - 10} ry={ry * k - 10} fill={tempC(b)} stroke="#fff" strokeOpacity={0.18} strokeWidth={3} />; })}
            {children}
          </g>}
          {/* water bead on the skin, in the outer layer */}
          {bead > 0.01 && <g opacity={bead}>
            <circle cx={BEAD.x} cy={BEAD.y} r={BEAD.r} fill="#CFF6FF" stroke="#fff" strokeWidth={3} />
            <circle cx={BEAD.x - 5} cy={BEAD.y - 5} r={4} fill="#fff" />
          </g>}
          {/* face */}
          <Face x={x + 10} y={y - ry * 0.62} t={t} mood={mood} shades={shades} />
          {/* steam */}
          {Array.from({length: 8}, (_, i) => {
            const p = (t * 0.45 + i / 8) % 1, sx = x - 260 + i * 75 + Math.sin(p * 7 + i) * 26;
            return <ellipse key={i} cx={sx} cy={y - ry - 10 - p * 260} rx={18 + p * 34} ry={26 + p * 40} fill="#fff" opacity={steam * 0.35 * Math.sin(p * Math.PI)} />;
          })}
        </g>
      </g>
    );
  };

export const Face: React.FC<{x: number; y: number; t: number; mood: string; shades?: number; s?: number}> = ({x, y, t, mood, shades = 0, s = 1}) => {
  const blink = Math.floor(t * 1.7) % 7 === 0 && (t * 1.7) % 1 < 0.25 ? 0.15 : 1;
  const look = mood === 'worried' ? 6 : Math.sin(t * 0.8) * 5;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {[-60, 60].map((ex) => <g key={ex}>
        <ellipse cx={ex} cy={0} rx={30} ry={36 * blink} fill="#fff" stroke="#5A3A20" strokeWidth={4} />
        <circle cx={ex + look * 0.6} cy={look} r={15 * blink} fill={C.ink} />
      </g>)}
      {mood === 'worried' && <path d="M-90 -50 L-35 -38 M90 -50 L35 -38" stroke="#5A3A20" strokeWidth={8} strokeLinecap="round" />}
      {mood === 'smug' && <path d="M-88 -46 L-32 -54 M88 -46 L32 -54" stroke="#5A3A20" strokeWidth={8} strokeLinecap="round" />}
      {mood === 'worried' ? <ellipse cx={0} cy={70} rx={22} ry={14} fill="#5A2A20" />
        : <path d={mood === 'happy' || mood === 'cool' ? 'M-46 56 Q0 104 46 56' : 'M-40 64 Q10 84 44 58'} stroke="#5A2A20" strokeWidth={9} fill={mood === 'happy' ? '#7A2A20' : 'none'} strokeLinecap="round" />}
      {mood === 'sweat' && <path d={`M100 ${-30 + ((t * 40) % 40)} q12 22 0 32 q-12 -10 0 -32`} fill="#BFE8FF" />}
      {shades > 0.01 && <g opacity={shades} transform={`translate(0,${-(1 - shades) * 80})`}>
        <rect x={-100} y={-26} width={84} height={50} rx={18} fill={C.ink} /><rect x={16} y={-26} width={84} height={50} rx={18} fill={C.ink} />
        <rect x={-20} y={-14} width={40} height={10} fill={C.ink} />
        <rect x={-88} y={-18} width={30} height={8} rx={4} fill="#fff" opacity={0.5} />
      </g>}
    </g>
  );
};

// ---------- one wave front: a short glowing sine segment, centre (x,y), heading ang (rad) ----------
export const Front: React.FC<{x: number; y: number; ang: number; len?: number; amp?: number; ph: number; o?: number; w?: number; dash?: boolean}> =
  ({x, y, ang, len = 200, amp = 26, ph, o = 1, w = 12, dash}) => {
    const pts: string[] = [];
    for (let i = 0; i <= 24; i++) { const u = i / 24 - 0.5; pts.push(`${(Math.sin(u * Math.PI * 4 + ph) * amp * Math.cos(u * Math.PI)).toFixed(1)},${(u * len).toFixed(1)}`); }
    const d = 'M' + pts.join(' L');
    return (
      <g transform={`translate(${x},${y}) rotate(${(ang * 180) / Math.PI})`} opacity={o}>
        <path d={d} stroke={C.wave} strokeWidth={w * 2.6} fill="none" opacity={0.25} strokeLinecap="round" strokeDasharray={dash ? '18 22' : undefined} />
        <path d={d} stroke={dash ? '#E8FFFF' : C.wave} strokeWidth={w} fill="none" strokeLinecap="round" strokeDasharray={dash ? '18 22' : undefined} />
      </g>
    );
  };

// bounce path: position at time u of a front moving at (vx,vy) inside a box (triangle-wave reflection)
export const bounce = (x0: number, y0: number, vx: number, vy: number, u: number, b = {x0: -560, x1: 560, y0: -420, y1: 420}) => {
  const ref = (p: number, a: number, c: number) => { const L = c - a; let q = ((p - a) % (2 * L) + 2 * L) % (2 * L); return q > L ? a + 2 * L - q : a + q; };
  const px = x0 + vx * u, py = y0 + vy * u;
  const x = ref(px, b.x0, b.x1), y = ref(py, b.y0, b.y1);
  const dx = ref(px + vx * 0.01, b.x0, b.x1) - x, dy = ref(py + vy * 0.01, b.y0, b.y1) - y;
  return {x, y, ang: Math.atan2(dy, dx)};
};
export const rnd = (s: string) => random(s);
export {mix, clamp01, ramp};
