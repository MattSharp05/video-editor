// Screen-space worlds: S3 the door mesh at ant scale (+ the swinging wave and the stopwatch), S2 the molecule crowd
// inside the water bead, S4 the oven floor seen from above (hot spots and the spinning plate).
import React from 'react';
import {random} from 'remotion';
import {C, Molecule, clamp01, mix, ramp, sm, mixC, tempC} from './art';
import {Face} from './s1';
import {SANS} from './kit/fonts';
import B from './beats.json';

const W = 1080, H = 1920;
export const Word: React.FC<{x: number; y: number; text: string; o: number; size?: number; color?: string; rot?: number}> = ({x, y, text, o, size = 58, color = C.cream, rot = 0}) =>
  o <= 0.01 ? null : (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${0.85 + 0.15 * sm(o * 1.4)})`} opacity={clamp01(o)}>
      <text textAnchor="middle" y={size * 0.35} fontFamily={SANS} fontWeight={900} fontSize={size} letterSpacing={3} fill={color}
        stroke="#2A1828" strokeWidth={size * 0.2} strokeLinejoin="round" style={{paintOrder: 'stroke'}}>{text}</text>
    </g>
  );
const sine = (cx: number, cy: number, len: number, amp: number, ph: number, k: number, n = 80) => {
  const p: string[] = [];
  for (let i = 0; i <= n; i++) { const u = i / n; p.push(`${(cx - len / 2 + u * len).toFixed(1)},${(cy + Math.sin(u * Math.PI * 2 * k + ph) * amp).toFixed(1)}`); }
  return 'M' + p.join(' L');
};

// ---------- S3: the door from the inside, at ant scale ----------
export const S3: React.FC<{t: number; op: number}> = ({t, op}) => {
  if (op <= 0.001) return null;
  const tin = ramp(t, B.door - 0.25, B.door + 0.9);              // shrink to ant scale
  const sp = mix(34, 230, Math.pow(tin, 1.6));                    // hole spacing on screen
  const hr = sp * 0.3;
  // the lead wave: comes in from depth, hits the mesh at 'holes', squashes, bounces back
  const hit = B.holes + 0.25;
  const come = ramp(t, B.door - 0.1, hit);
  const back = ramp(t, hit + 0.35, B.keep + 0.9);
  const squash = Math.sin(clamp01((t - hit) / 0.45) * Math.PI) * (t > hit ? 1 : 0);
  const scl = mix(0.25, 1, sm(come)) * mix(1, 0.72, back);
  const amp = 240 * scl * (1 - 0.65 * squash);
  const len = 1000 * scl * (1 + 0.25 * squash);
  // after the bounce: the wave freezes into one sine, then swings faster and faster (line 5)
  const sw = ramp(t, B.swings - 0.3, B.swings + 0.3);
  const speed = sw > 0 ? 2 + 60 * Math.pow(clamp01((t - B.swings) / (B.l5 - B.swings)), 2) : 0;
  const ph = t * 6 + (t > B.swings ? Math.pow(Math.max(0, t - B.swings), 3) * 18 : 0);
  const wy = 860;
  const blur = ramp(t, B.billions - 0.4, B.second);
  const ant = ramp(t, B.door + 0.5, B.door + 1.0);
  const meshO = 1 - 0.55 * sw;
  const cnt = clamp01((t - B.billions + 0.5) / 1.6);
  const val = Math.round(2450000000 * Math.pow(cnt, 4));
  const tick = ramp(t, B.second + 0.2, B.second + 0.45);
  const stop = ramp(t, B.swings + 0.2, B.swings + 0.8);
  const exit = ramp(t, B.water - 0.9, B.water - 0.35);
  return (
    <g opacity={op}>
      <defs>
        <pattern id="mesh3" width={sp} height={sp} patternUnits="userSpaceOnUse" x={540 - sp / 2 + Math.sin(t * 0.6) * sp * 0.1} y={wy - sp / 2}>
          <rect width={sp} height={sp} fill="#3B3440" />
          <circle cx={sp / 2} cy={sp / 2} r={hr} fill="#F2B36E" />
          <circle cx={sp / 2 - hr * 0.3} cy={sp / 2 - hr * 0.3} r={hr * 0.5} fill="#FFD9A0" opacity={0.6} />
        </pattern>
        <radialGradient id="vig3" cx="0.5" cy="0.45" r="0.7"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#2A1828" stopOpacity="0.6" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="#4C3440" />
      <rect width={W} height={H} fill="url(#mesh3)" opacity={meshO} />
      <rect width={W} height={H} fill="url(#vig3)" />
      {/* specks of light drifting across the mesh */}
      {Array.from({length: 16}, (_, i) => { const p = (t * (0.25 + random(`mk${i}`) * 0.3) + random(`mo${i}`)) % 1; return <circle key={`k${i}`} cx={p * 1300 - 110} cy={200 + random(`my${i}`) * 1300 + Math.sin(t * 2 + i) * 30} r={10 + random(`mr${i}`) * 12} fill="#FFE2B0" opacity={0.45 * Math.sin(p * Math.PI)} />; })}
      {/* the ant walking on the mesh, looks up, thumbs-up after the bounce */}
      {ant > 0.01 && <g transform={`translate(${mix(1200, 760, ant) + Math.sin(t * 3) * 6},${1300}) scale(1.2)`} opacity={ant * meshO}>
        {[-30, 0, 30].map((lx, i) => <path key={i} d={`M${lx} 0 l${-14 + Math.sin(t * 18 + i) * 6} 34 M${lx} 0 l${14 - Math.sin(t * 18 + i) * 6} 34`} stroke="#2A1A1A" strokeWidth={5} />)}
        <ellipse cx={-48} cy={0} rx={30} ry={22} fill="#3A2420" /><ellipse cx={0} cy={0} rx={24} ry={18} fill="#3A2420" /><ellipse cx={48} cy={-12} rx={26} ry={24} fill="#3A2420" />
        <circle cx={56} cy={-18} r={6} fill="#fff" /><circle cx={58} cy={-19} r={3} fill="#000" />
        <path d="M60 -34 q14 -40 30 -44 M48 -34 q4 -40 16 -50" stroke="#3A2420" strokeWidth={4} fill="none" />
        {t > hit + 0.4 && <g transform="translate(78,10)"><rect x={0} y={-8} width={26} height={14} rx={6} fill="#3A2420" /><rect x={14} y={-26} width={9} height={22} rx={4} fill="#3A2420" /></g>}
      </g>}
      {/* the wave */}
      <g opacity={1 - exit}>
        
        {[0, 1, 2, 3, 4].map((g) => (g === 0 || blur > 0.05) && <path key={g} d={sine(540, wy, len, amp * (g === 0 ? 1 : Math.cos(g * 0.6)), ph + g * 1.25, 1.5)} stroke={C.wave}
          strokeWidth={g ? 6 : 22} fill="none" opacity={g ? 0.5 * blur : 1} strokeLinecap="round" />)}
        <path d={sine(540, wy, len, amp, ph, 1.5)} stroke="#fff" strokeWidth={6} fill="none" opacity={0.6} />
        {/* sparks off the crests while it blurs */}
        {sw > 0.05 && Array.from({length: 22}, (_, i) => { const p = (t * (1.6 + (i % 4) * 0.5) + i / 22) % 1; return <circle key={i} cx={540 - len / 2 + random(`sx${i}`) * len + p * (i % 2 ? 60 : -60)} cy={wy - amp - p * 240 + (i % 2) * (2 * amp + p * 480)} r={16 * (1 - p) + 4} fill="#E8FFFF" opacity={Math.max(blur, 0.6 * sw) * (1 - p)} />; })}
      </g>
      {/* size bracket: one wave vs one hole */}
      {(() => {
        const o = ramp(t, B.holes - 0.1, B.holes + 0.3) * (1 - ramp(t, B.swings - 0.4, B.swings));
        if (o < 0.01) return null;
        const wl = len / 1.5;
        return <g opacity={o}>
          <path d={`M${540 - wl / 2} ${wy - 300} l0 -24 L${540 + wl / 2} ${wy - 324} l0 24`} stroke={C.cream} strokeWidth={8} fill="none" />
          <Word x={540} y={wy - 380} text="ONE WAVE" o={o} size={54} color={C.wave} />
          <circle cx={540} cy={wy + 420} r={hr + 12} fill="none" stroke={C.gold} strokeWidth={8} />
          <Word x={540} y={wy + 420 + hr + 70} text="TINY HOLES" o={o} size={54} color={C.gold} />
        </g>;
      })()}
      <Word x={540} y={wy + 300} text="TOO BIG TO GET OUT" o={ramp(t, hit + 0.15, hit + 0.45) * (1 - ramp(t, B.swings - 0.5, B.swings - 0.1))} size={60} color={C.wave} />
      <Word x={170} y={wy - 330} text="WAVE" o={ramp(t, B.swings - 0.2, B.swings + 0.2) * (1 - exit)} size={64} color={C.wave} />
      <Word x={540} y={560} text="DOOR" o={ramp(t, B.door, B.door + 0.3) * (1 - ramp(t, B.holes - 0.2, B.holes + 0.1))} size={80} />
      {/* stopwatch + counter (line 5) */}
      {stop > 0.01 && <g opacity={stop * (1 - exit)} transform={`translate(${mix(-200, 300, sm(stop))},1260)`}>
        <circle r={130} fill={C.cream} stroke="#3B2534" strokeWidth={14} />
        <rect x={-22} y={-170} width={44} height={36} rx={8} fill="#3B2534" />
        {Array.from({length: 12}, (_, i) => <rect key={i} x={-3} y={-118} width={6} height={18} fill="#3B2534" transform={`rotate(${i * 30})`} />)}
        <rect x={-5} y={-104} width={10} height={104} rx={5} fill={C.hot} transform={`rotate(${tick * 6})`} />
        <circle r={12} fill="#3B2534" />
        <Word x={0} y={200} text="1 SECOND" o={stop} size={46} />
      </g>}
      {cnt > 0 && <g opacity={(1 - exit)}>
        <Word x={700} y={1180} text="BILLIONS" o={ramp(t, B.billions, B.billions + 0.3)} size={64} color={C.wave} />
        <g transform="translate(700,1290)">
          {val.toLocaleString('en-US').split('').map((ch, i, arr) => (
            <text key={i} x={(i - arr.length / 2) * 30 + 15} y={20 + (cnt < 1 && ch !== ',' ? Math.sin(t * 50 + i) * 6 : 0)} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={52}
              fill="#fff" stroke="#2A1828" strokeWidth={9} style={{paintOrder: 'stroke'}}>{ch}</text>))}
          <Word x={0} y={80} text="wave swings every second" o={cnt > 0.95 ? 1 : 0} size={34} />
        </g>
      </g>}
      {/* the ribbon shoots off toward Spud (carrier into the bead) */}
      {exit > 0.01 && exit < 0.999 && <path d={`M540 ${wy} Q ${mix(540, 300, exit)} ${mix(wy, 1300, exit)} 540 ${mix(wy, 1900, exit)}`} stroke={C.wave} strokeWidth={30 * (1 - exit) + 6} fill="none" opacity={1 - exit} />}
      <text x={540} y={1495} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={28} letterSpacing={2} fill="#fff" stroke="#2A1828" strokeWidth={6} style={{paintOrder: 'stroke'}} opacity={0.85 * (1 - sw)}>NOT TO SCALE</text>
    </g>
  );
};

// ---------- S2: the molecule crowd inside the bead ----------
const GRID: {x: number; y: number; lag: number; amp: number; base: number; s: number}[] = [];
for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) {
  const x = 90 + c * 180 + (r % 2) * 90 + (random(`gx${r}${c}`) - 0.5) * 50, y = 380 + r * 165 + (random(`gy${r}${c}`) - 0.5) * 40;
  if (Math.abs(x - 540) < 170 && Math.abs(y - 1130) < 170) continue;    // room for the hero
  GRID.push({x, y, lag: random(`lag${r}${c}`) * 0.25, amp: 0.75 + random(`amp${r}${c}`) * 0.3, base: (random(`b${r}${c}`) - 0.5) * 50, s: random(`s${r}${c}`)});
}
const HERO = {x: 540, y: 1130};
// the field: + on one side, − on the other, swapping (slow-motion picture of the real 2.45 GHz swing)
const FIELD_F = 0.9;
export const field = (t: number) => Math.sin((t - B.tugs) * Math.PI * 2 * FIELD_F);
export const S2: React.FC<{t: number; scale: number}> = ({t, scale}) => {
  const on = ramp(t, B.tugs - 0.3, B.tugs + 0.5);
  const signs = (d: number) => ramp(t, B.plus - 0.2 + d * 0.0006, B.plus + 0.2 + d * 0.0006);
  const minus = (d: number) => ramp(t, B.minus - 0.2 + d * 0.0006, B.minus + 0.2 + d * 0.0006);
  const heatAt = (d: number) => ramp(t, B.heat - 0.6 + d * 0.0008, B.heat + 0.6 + d * 0.0008);
  const sweep = ramp(t, B.tugs - 0.4, B.tugs + 0.9);    // the band arriving from the left
  const ang = (m: {x: number; lag: number; amp: number; base: number}, k: number) => {
    const arrived = clamp01((sweep * 1500 - m.x) / 300);
    const f = field(t - m.lag);
    const rest = Math.sin(t * (2.6 + k * 2) + m.base) * 16 + Math.sin(t * 5.3 + m.lag * 40) * 6;
    return m.base * (1 - arrived * on) + rest + arrived * on * 55 * m.amp * f * -1;      // ears (plus) pulled toward the minus side
  };
  const f0 = field(t);
  const camS = 1 + 0.04 * Math.sin(t * 0.7) + 0.05 * ramp(t, B.l7, B.heat + 1);
  const shake = on * Math.sin(t * Math.PI * 2 * FIELD_F) * 6;
  const heatO = ramp(t, B.heat - 0.2, B.heat + 0.2);
  return (
    <g transform={`translate(540,960) scale(${scale * camS}) translate(${-540 + shake},-960)`}>
      <defs><radialGradient id="s2bg" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stopColor={mixC('#2E6A8A', '#8A3A2A', ramp(t, B.heat - 0.3, B.heat + 1))} /><stop offset="1" stopColor={mixC('#1C3A5A', '#4A2028', ramp(t, B.heat - 0.3, B.heat + 1))} /></radialGradient></defs>
      <rect x={-600} y={-600} width={2280} height={3120} fill="url(#s2bg)" />
      {/* drifting specks for depth */}
      {Array.from({length: 26}, (_, i) => <circle key={i} cx={(random(`dx${i}`) * 1300 - 100 + t * (8 + i % 5 * 4)) % 1300 - 100} cy={random(`dy${i}`) * 1920} r={3 + (i % 4) * 2} fill="#BFE8FF" opacity={0.18} />)}
      {/* the field band: the swinging wave crossing the crowd, with + and − at its edges swapping each swing */}
      {on > 0.01 && <g opacity={on * (1 - ramp(t, B.l8 - 0.6, B.l8))}>
        <path d={sine(540 - 1500 + sweep * 1500, 590, 2200, 60, (t - B.tugs) * Math.PI * 2 * FIELD_F, 2)} stroke={C.wave} strokeWidth={14} fill="none" opacity={0.75} />
        {[0, 1].map((side) => {
          const plus = (side === 0) === (f0 > 0);
          return <g key={side} transform={`translate(${side === 0 ? 105 : 975},${590})`} opacity={0.6 + 0.4 * Math.abs(f0)}>
            <circle r={70} fill={plus ? C.plus : C.minus} opacity={0.85} />
            <text y={24} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={80} fill="#fff">{plus ? '+' : '−'}</text>
          </g>;
        })}
      </g>}
      <Word x={540} y={470} text="THE WAVE TUGS" o={on * (1 - ramp(t, B.wiggle - 0.2, B.wiggle + 0.2))} size={52} color={C.wave} />
      {GRID.map((m, i) => {
        const d = Math.hypot(m.x - HERO.x, m.y - HERO.y);
        const h = heatAt(d);
        return <Molecule key={i} x={m.x + Math.sin(t * (1.6 + (i % 5) * 0.4) + i) * 14 + h * Math.sin(t * 14 + i) * 6} y={m.y + Math.cos(t * (1.3 + (i % 4) * 0.5) + i) * 14} r={50} ang={ang(m, (i % 3) * 0.3)} heat={h} mood={on * 0.6 + h * 0.4} signs={Math.min(signs(d), 1)} seed={i} t={t} face={1} minusSign={minus(d)} />;
      })}
      {/* BONK stars where neighbours swing into each other (at each turn of the field) */}
      {Array.from({length: 14}, (_, i) => {
        if (t < B.wiggle - 0.3) return null;
        const m = GRID[(i * 7) % GRID.length];
        const per = 1 / (2 * FIELD_F), ph = ((t - B.tugs - m.lag + random(`bk${i}`) * per) % per) / per;
        const o = (1 - ph) * (ph < 0.5 ? 1 : 0) * ramp(t, B.wiggle - 0.3, B.wiggle + 0.3) * (1 - ramp(t, B.l8 - 0.7, B.l8 - 0.2));
        const col = mixC('#FFE36E', C.heat, heatO);
        return o > 0.02 && <g key={i} transform={`translate(${m.x + 90},${m.y - 30}) scale(${0.6 + ph * 1.2}) rotate(${ph * 40})`} opacity={o}>
          <path d="M0 -40 L11 -12 L40 -10 L17 8 L25 38 L0 21 L-25 38 L-17 8 L-40 -10 L-11 -12 Z" fill={col} stroke="#fff" strokeWidth={4} />
          {i % 3 === 0 && <text y={-50} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill="#fff" stroke="#2A1828" strokeWidth={6} style={{paintOrder: 'stroke'}}>BONK</text>}
        </g>;
      })}
      {/* rising heat shimmer */}
      {heatO > 0.01 && Array.from({length: 9}, (_, i) => { const p = (t * 0.6 + i / 9) % 1; return <path key={i} d={`M${120 + i * 110} ${1700 - p * 1300} q20 -30 0 -60 q-20 -30 0 -60`} stroke={C.heat} strokeWidth={8} fill="none" opacity={heatO * 0.6 * Math.sin(p * Math.PI)} />; })}
      {/* the hero molecule */}
      <Molecule x={HERO.x} y={HERO.y} r={100} ang={ang({x: HERO.x, lag: 0.05, amp: 1, base: -10}, 0.2)} heat={heatAt(0)} mood={on} signs={signs(0)} minusSign={minus(0)} seed={99} t={t} face={1} />
      <Word x={HERO.x} y={HERO.y + 210} text="WATER MOLECULE" o={ramp(t, B.molecules, B.molecules + 0.3) * (1 - ramp(t, B.tugs, B.tugs + 0.4))} size={56} />
      <Word x={HERO.x} y={HERO.y + 210} text="WIGGLE" o={ramp(t, B.wiggle, B.wiggle + 0.3) * (1 - ramp(t, B.heat - 0.3, B.heat))} size={64} color={C.wave} rot={Math.sin(t * 12) * 6} />
      <Word x={540} y={700} text="HEAT" o={heatO} size={120} color={C.heat} />
      <text x={540} y={1470} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={26} letterSpacing={2} fill="#fff" opacity={0.7}>ILLUSTRATION · NOT TO SCALE</text>
    </g>
  );
};

// ---------- S4: the oven floor from above ----------
const SPOTS = Array.from({length: 16}, (_, i) => ({x: 540 + ((i % 4) - 1.5) * 230, y: 1000 + (Math.floor(i / 4) - 1.5) * 230, hot: (i + Math.floor(i / 4)) % 2 === 0}));
export const S4: React.FC<{t: number; op: number}> = ({t, op}) => {
  if (op <= 0.001) return null;
  const spin = Math.max(0, t - B.spins + 0.2);
  const rot = (spin * spin * 0.5 * 60 / (1 + spin * 0.4)) * 1.2;       // degrees, easing up to speed
  const evenK = ramp(t, B.spins + 0.4, B.spins + 1.4);
  const camR = -6 * ramp(t, B.spots - 0.5, B.r_waves);
  const pulse = (i: number) => 0.75 + 0.25 * Math.sin(t * 3 + i * 1.7);
  const melt = ramp(t, B.more - 0.2, B.why);
  const bub = ramp(t, B.more, B.more + 0.5) * (1 - evenK);
  const ice = ramp(t, B.more + 0.3, B.why) * (1 - evenK);
  const dizzy = ramp(t, B.spins, B.spins + 0.3) * (1 - ramp(t, B.spins + 1.2, B.spins + 1.6));
  const mood = t < B.more ? 'smug' : t < B.spins + 1.2 ? (dizzy > 0.5 ? 'happy' : 'worried') : 'happy';
  return (
    <g opacity={op} transform={`rotate(${camR} 540 1000)`}>
      <rect x={-500} y={-500} width={2100} height={2900} fill="#5A3E44" />
      <rect x={60} y={520} width={960} height={960} rx={50} fill="#E3B676" stroke="#3A2830" strokeWidth={20} />
      {SPOTS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.hot ? 120 * pulse(i) : 110} fill={s.hot ? C.heat : '#5E86C8'} opacity={s.hot ? 0.5 * (1 - 0.6 * evenK) : 0.35 * (1 - 0.6 * evenK)} />)}
      {/* the plate and everything on it turns together */}
      <g transform={`rotate(${rot} 540 1000)`}>
        <circle cx={540} cy={1000} r={420} fill="#EAF4F4" opacity={0.55} stroke="#fff" strokeWidth={6} />
        {Array.from({length: 8}, (_, i) => <rect key={i} x={536} y={600} width={8} height={30} fill="#fff" opacity={0.5} transform={`rotate(${i * 45} 540 1000)`} />)}
        {/* Spud from above, his face up */}
        <ellipse cx={540} cy={1000} rx={250} ry={175} fill="#C88F55" stroke="#8C5A30" strokeWidth={10} />
        <ellipse cx={540} cy={1000} rx={250} ry={175} fill={C.heat} opacity={0.35 * evenK} />
        {/* left cheek bubbling over a hot spot */}
        {bub > 0.01 && Array.from({length: 6}, (_, i) => { const p = (t * 1.5 + i / 6) % 1; return <circle key={i} cx={350 + (i % 3) * 30} cy={960 + Math.floor(i / 3) * 50} r={8 + p * 18} fill="none" stroke="#FFD9A0" strokeWidth={5} opacity={bub * (1 - p)} />; })}
        {bub > 0.01 && <ellipse cx={380} cy={990} rx={80} ry={70} fill={C.hot} opacity={bub * 0.5} />}
        {/* right side icy over a cold spot */}
        {ice > 0.01 && <g opacity={ice}>
          <ellipse cx={700} cy={1000} rx={80} ry={90} fill="#CFE8FF" opacity={0.6} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${680 + i * 22} ${1070} l10 0 l-5 ${36 + i % 2 * 16} Z`} fill="#E8F6FF" />)}
        </g>}
        <Face x={540} y={980} t={t} mood={mood} s={0.85} />
        {dizzy > 0.01 && <g opacity={dizzy}>{[-51, 51].map((ex) => <path key={ex} d={`M${540 + ex} 980 m-14 0 a14 14 0 1 1 14 14 a8 8 0 1 1 -6 -8`} stroke={C.ink} strokeWidth={5} fill="#fff" />)}</g>}
        {/* chocolate bar on the plate's edge: melts in dots over the hot spots, then evenly */}
        <g transform="translate(540,1300)">
          {Array.from({length: 6}, (_, i) => {
            const hotSq = i % 2 === 0, m = clamp01(melt * (hotSq ? 1 : 0.1) + evenK);
            return <g key={i}>
              <rect x={-150 + i * 50} y={-40} width={44} height={80 - m * 20} rx={8 + m * 14} fill="#6A3A24" />
              {m > 0.05 && <ellipse cx={-128 + i * 50} cy={46 - m * 10} rx={20 + m * 16} ry={8 + m * 10} fill="#7A4428" />}
            </g>;
          })}
        </g>
        <Word x={540} y={1410} text="CHOCOLATE" o={ramp(t, B.more, B.more + 0.3) * (1 - ramp(t, B.spins, B.spins + 0.3))} size={40} color="#E8C0A0" />
        <Word x={540} y={560} text="PLATE SPINS" o={ramp(t, B.spins, B.spins + 0.3) * (1 - ramp(t, B.r_waves - 0.8, B.r_waves - 0.4))} size={56} color={C.gold} />
      </g>
      <Word x={SPOTS[5].x} y={SPOTS[5].y - 150} text="HOT SPOT" o={ramp(t, B.more, B.more + 0.3) * (1 - evenK)} size={50} color={C.heat} />
      <Word x={SPOTS[6].x} y={SPOTS[6].y + 160} text="COLD SPOT" o={ramp(t, B.more + 0.2, B.more + 0.5) * (1 - evenK)} size={50} color={C.cold} />
      <Word x={540} y={1478} text="OVEN FLOOR · TOP VIEW" o={ramp(t, B.spots, B.spots + 0.3)} size={40} />
      {/* steam puffs rising toward us off the food */}
      {Array.from({length: 18}, (_, i) => { const per = 1.1 + random(`sp${i}`) * 0.9, p = ((t + random(`so${i}`) * per) % per) / per;
        const a = random(`sa${i}`) * Math.PI * 2, rr = 270 + random(`sr${i}`) * 110;
        return <circle key={`p${i}`} cx={540 + Math.cos(a) * rr + p * 40} cy={1000 + Math.sin(a) * rr * 0.75 - p * 50} r={20 + p * 40} fill="#FFFFFF" opacity={0.6 * Math.sin(p * Math.PI)} />; })}
      {/* wave fronts crossing the floor and bouncing off the walls */}
      {Array.from({length: 7}, (_, i) => { const vx = [520, -460, 380, -600, 300, 640, -340][i], vy = [300, 520, -640, -260, 580, -380, -480][i];
        const u2 = t + i * 0.7, rf = (q: number, a: number, c: number) => { const L2 = c - a; const m = ((q - a) % (2 * L2) + 2 * L2) % (2 * L2); return m > L2 ? a + 2 * L2 - m : a + m; };
        const x = rf(540 + vx * u2, 110, 970), y = rf(1000 + vy * u2, 570, 1430), x2 = rf(540 + vx * (u2 - 0.02), 110, 970), y2 = rf(1000 + vy * (u2 - 0.02), 570, 1430);
        const ang = Math.atan2(y - y2, x - x2) * 180 / Math.PI;
        return <g key={`w${i}`} transform={`translate(${x},${y}) rotate(${ang})`} opacity={0.85}>
          <path d="M0 -50 Q14 -25 0 0 Q-14 25 0 50" stroke={C.wave} strokeWidth={40} fill="none" opacity={0.35} strokeLinecap="round" />
          <path d="M0 -50 Q14 -25 0 0 Q-14 25 0 50" stroke={C.wave} strokeWidth={18} fill="none" strokeLinecap="round" />
        </g>; })}
      {/* waves bouncing in from the walls feed the hot spots */}
      {Array.from({length: 5}, (_, i) => { const p = (t * 0.8 + i / 5) % 1; const s = SPOTS[(i * 5) % 16]; return <circle key={i} cx={s.x} cy={s.y} r={30 + p * 160} fill="none" stroke={C.wave} strokeWidth={6} opacity={0.5 * (1 - p) * (1 - evenK * 0.5)} />; })}
    </g>
  );
};
