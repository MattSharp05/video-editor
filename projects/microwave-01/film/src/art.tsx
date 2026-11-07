// Microwave 01 art: the cosy kitchen, our own microwave ("Toasty"-free, no brand), water molecules with faces.
// All SVG, drawn from t (seconds) only; random() from remotion for fixed scatter.
import React from 'react';
import {random} from 'remotion';

export const C = {
  wallA: '#7A4A4F', wallB: '#4E3442', tile: '#E8D9C4', counter: '#B9875E', counterTop: '#D9A877', wood: '#8A5A3C',
  sky1: '#F2A86B', sky2: '#9A5C8C', cream: '#F1E6D0', sage: '#9CC9AE', sageD: '#6E9E86', ink: '#2E2230',
  wave: '#7FF0E6', heat: '#FF8A3D', hot: '#FF5A3C', cold: '#7DB6FF', plus: '#FF6F7D', minus: '#5FA8FF', gold: '#FFC56E',
  cavity: '#F6D79A', mol: '#F7F1E6',
};
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const k = clamp01(x); return k * k * (3 - 2 * k); };
export const ramp = (t: number, a: number, b: number) => sm((t - a) / (b - a));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const hx = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mixC = (a: string, b: string, k: number) => {
  const A = hx(a), B2 = hx(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B2[i] - v) * clamp01(k))).join(',')})`;
};
// food temperature 0 (cold blue) .. 1 (hot orange-red)
export const tempC = (k: number) => (k < 0.5 ? mixC('#7DB6FF', '#F5D9A8', k * 2) : mixC('#F5D9A8', '#FF5A3C', (k - 0.5) * 2));

// ---------- Kitchen (world coords: the microwave sits at 540,1060 at zoom 1) ----------
export const Kitchen: React.FC<{t: number}> = ({t}) => {
  const steam = Array.from({length: 7}, (_, i) => i);
  return (
    <g>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.wallA} /><stop offset="1" stopColor={C.wallB} /></linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.sky2} /><stop offset="1" stopColor={C.sky1} /></linearGradient>
        <radialGradient id="lamp" cx="0.5" cy="0" r="1"><stop offset="0" stopColor="#FFD9A0" stopOpacity="0.55" /><stop offset="1" stopColor="#FFD9A0" stopOpacity="0" /></radialGradient>
        <pattern id="tiles" width="90" height="60" patternUnits="userSpaceOnUse"><rect width="90" height="60" fill="#D9C2A6" /><rect x="3" y="3" width="84" height="54" rx="6" fill={C.tile} /></pattern>
      </defs>
      <rect x={-1500} y={-1500} width={4080} height={5000} fill="url(#wall)" />
      {/* window with a dusk sky and a slow cloud */}
      <g transform="translate(60,170) scale(0.78)">
        <rect x={0} y={0} width={520} height={640} rx={20} fill="url(#sky)" />
        <circle cx={360 + Math.sin(t * 0.1) * 6} cy={430} r={70} fill="#FFD48A" opacity={0.9} />
        <ellipse cx={(t * 14) % 700 - 80} cy={170} rx={110} ry={30} fill="#F6C8B0" opacity={0.6} />
        <ellipse cx={((t * 9 + 300) % 700) - 80} cy={300} rx={80} ry={22} fill="#F6C8B0" opacity={0.45} />
        <rect x={0} y={0} width={520} height={640} rx={20} fill="none" stroke={C.wood} strokeWidth={26} />
        <rect x={250} y={0} width={20} height={640} fill={C.wood} /><rect x={0} y={310} width={520} height={20} fill={C.wood} />
      </g>
      {/* tiled backsplash */}
      <rect x={-1500} y={820} width={4080} height={520} fill="url(#tiles)" opacity={0.9} />
      {/* shelf with jars and a plant whose leaves sway */}
      <g transform="translate(640,560) scale(0.62)">
        <rect x={0} y={0} width={620} height={22} rx={6} fill={C.wood} />
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(${40 + i * 120},-120)`}>
          <rect width={86} height={120} rx={16} fill={['#E9B872', '#C97B63', '#9DB7A0'][i]} opacity={0.9} />
          <rect y={-14} width={86} height={24} rx={6} fill={C.wood} />
        </g>)}
        <g transform="translate(470,-70)">
          <path d="M-40 0 L40 0 L30 70 L-30 70 Z" fill="#C46A4A" />
          {[-50, -20, 10, 40].map((a, i) => <ellipse key={i} cx={0} cy={-40} rx={18} ry={60} fill={i % 2 ? '#7FAF7A' : '#5E9460'}
            transform={`rotate(${a + Math.sin(t * 1.3 + i) * 6} 0 0)`} />)}
        </g>
      </g>
      {/* pendant lamp, swaying a little */}
      <g transform={`rotate(${Math.sin(t * 0.7) * 2.2} 540 -400)`}>
        <line x1={540} y1={-400} x2={540} y2={240} stroke="#3A2A2A" strokeWidth={6} />
        <path d="M440 300 Q540 200 640 300 Z" fill={C.gold} />
        <ellipse cx={540} cy={300} rx={100} ry={16} fill="#FFE7B8" />
        <path d="M440 300 L180 1500 L900 1500 L640 300 Z" fill="url(#lamp)" opacity={0.35} />
      </g>
      {/* counter */}
      <rect x={-1500} y={1330} width={4080} height={50} fill={C.counterTop} />
      <rect x={-1500} y={1380} width={4080} height={1500} fill={C.counter} />
      {[-1200, -700, -200, 300, 800, 1300, 1800].map((x, i) => <rect key={i} x={x} y={1440} width={460} height={600} rx={18} fill="none" stroke={C.wood} strokeWidth={8} opacity={0.6} />)}
      {/* kettle steaming on the left of the counter */}
      <g transform="translate(1060,1330) scale(0.7)">
        <path d="M-90 0 Q-100 -150 0 -160 Q100 -150 90 0 Z" fill="#D86B5A" />
        <path d="M90 -90 Q150 -110 170 -150" stroke="#D86B5A" strokeWidth={22} fill="none" strokeLinecap="round" />
        <rect x={-40} y={-190} width={80} height={30} rx={14} fill="#3A2A2A" />
        {steam.map((i) => {
          const p = ((t * 0.35 + i / 7) % 1);
          return <circle key={i} cx={170 + Math.sin(p * 6 + i) * 20} cy={-160 - p * 300} r={14 + p * 30} fill="#fff" opacity={0.28 * (1 - p)} />;
        })}
      </g>
    </g>
  );
};

// ---------- the microwave (origin = centre of body). door 0..1 open is not used: the door stays shut ----------
export const MW = {w: 880, h: 560, win: {x: -410, y: -220, w: 590, h: 440}};
export const Microwave: React.FC<{t: number; on: number; time?: string; children?: React.ReactNode; mesh?: number; glow?: number; label?: number}> = ({t, on, time = '1:30', children, mesh = 1, glow = 0, label = 0}) => {
  const W = MW.win;
  const holes: React.ReactNode[] = [];
  for (let y = W.y + 14; y < W.y + W.h - 6; y += 18) for (let x = W.x + 14 + (((y - W.y) / 18) % 2) * 9; x < W.x + W.w - 6; x += 18) holes.push(<circle key={`${x},${y}`} cx={x} cy={y} r={5.5} />);
  return (
    <g>
      <defs>
        <clipPath id="cav"><rect x={W.x} y={W.y} width={W.w} height={W.h} rx={34} /></clipPath>
        <radialGradient id="cavLight" cx="0.5" cy="0.35" r="0.8"><stop offset="0" stopColor="#FFF0C8" /><stop offset="1" stopColor="#D9A867" /></radialGradient>
        <mask id="meshMask"><rect x={W.x} y={W.y} width={W.w} height={W.h} fill="white" /><g fill="black">{holes}</g></mask>
      </defs>
      <ellipse cx={0} cy={MW.h / 2 + 18} rx={MW.w * 0.52} ry={26} fill="#2A1A20" opacity={0.35} />
      <rect x={-MW.w / 2} y={-MW.h / 2} width={MW.w} height={MW.h} rx={70} fill={C.sage} />
      <rect x={-MW.w / 2 + 14} y={-MW.h / 2 + 10} width={MW.w - 28} height={40} rx={20} fill="#BDE0CB" opacity={0.6} />
      {[-300, 300].map((x) => <rect key={x} x={x - 40} y={MW.h / 2 - 8} width={80} height={30} rx={12} fill={C.sageD} />)}
      {/* window: the cavity, then whatever is inside, then the door mesh */}
      <rect x={W.x - 18} y={W.y - 18} width={W.w + 36} height={W.h + 36} rx={46} fill={C.sageD} />
      <g clipPath="url(#cav)">
        <rect x={W.x} y={W.y} width={W.w} height={W.h} fill={on > 0 ? 'url(#cavLight)' : '#B48B5E'} />
        <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="#5A3B2E" opacity={0.55 * (1 - on)} />
        {children}
        <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="#2C2B2E" opacity={0.55 * mesh} mask="url(#meshMask)" />
        <rect x={W.x} y={W.y} width={W.w} height={W.h} fill={C.heat} opacity={glow * 0.25} />
      </g>
      <rect x={W.x} y={W.y} width={W.w} height={W.h} rx={34} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={4} />
      <path d={`M${W.x + 40} ${W.y + 30} L${W.x + 200} ${W.y + 30}`} stroke="#fff" strokeOpacity={0.35} strokeWidth={10} strokeLinecap="round" />
      {/* control panel: display, two knobs, a button */}
      <g transform="translate(300,0)">
        <rect x={-80} y={-220} width={160} height={440} rx={30} fill="#B3D8C2" />
        <rect x={-62} y={-196} width={124} height={60} rx={12} fill="#2E2230" />
        <text x={0} y={-152} textAnchor="middle" fontFamily="'Hanken Grotesk'" fontWeight={800} fontSize={36} fill={on > 0.5 ? C.gold : '#7A6A5A'}>{time}</text>
        {[-40, 90].map((y, i) => (
          <g key={y} transform={`translate(0,${y}) rotate(${i === 0 ? on * 140 + Math.sin(t * 2) * 2 : on * 60})`}>
            <circle r={46} fill={C.cream} /><circle r={36} fill="#E9DCC0" />
            <rect x={-6} y={-40} width={12} height={30} rx={6} fill={C.hot} />
          </g>
        ))}
        <rect x={-50} y={170} width={100} height={30} rx={15} fill={C.cream} />
      </g>
      {label > 0 && <text x={0} y={MW.h / 2 + 130} textAnchor="middle" fontFamily="'Hanken Grotesk'" fontWeight={800} fontSize={56} letterSpacing={6}
        fill={C.cream} opacity={label}>MICROWAVE</text>}
    </g>
  );
};

// ---------- a water molecule with a face: O body (minus side), two H ears (plus side) ----------
// ang: which way the plus side points (deg, 0 = up). heat 0..1 tints and makes it sweat. mood: 0 calm .. 1 frantic
export const Molecule: React.FC<{x: number; y: number; r?: number; ang: number; heat?: number; mood?: number; signs?: number; minusSign?: number; seed?: number; t: number; face?: number}> =
  ({x, y, r = 60, ang, heat = 0, mood = 0, signs = 1, minusSign = 1, seed = 0, t, face = 1}) => {
    const body = tempC(0.35 + heat * 0.65);
    const blink = (Math.floor(t * 2 + seed * 7) % 9 === 0) ? 0.15 : 1;
    return (
      <g transform={`translate(${x},${y}) rotate(${ang})`}>
        {/* H ears (the plus side) */}
        {[-38, 38].map((a, i) => (
          <g key={i} transform={`rotate(${a})`}>
            <circle cx={0} cy={-r * 1.05} r={r * 0.52} fill={mixC('#FFB3BB', C.plus, 0.95)} stroke="#fff" strokeWidth={r * 0.06} />
            {signs > 0 && <text x={0} y={-r * 1.05 + r * 0.29} textAnchor="middle" fontFamily="'Hanken Grotesk'" fontWeight={900} fontSize={r * 0.85} fill="#fff" opacity={signs}>+</text>}
          </g>
        ))}
        <circle r={r} fill={body} stroke="#fff" strokeWidth={r * 0.07} />
        {/* minus belly */}
        <ellipse cx={0} cy={r * 0.66} rx={r * 0.55} ry={r * 0.3} fill={C.minus} opacity={0.9} />
        {minusSign > 0 && <rect x={-r * 0.22} y={r * 0.6} width={r * 0.44} height={r * 0.13} rx={r * 0.06} fill="#fff" opacity={minusSign} />}
        {face > 0 && <g opacity={face}>
          <ellipse cx={-r * 0.3} cy={-r * 0.12} rx={r * 0.11} ry={r * 0.15 * blink} fill={C.ink} />
          <ellipse cx={r * 0.3} cy={-r * 0.12} rx={r * 0.11} ry={r * 0.15 * blink} fill={C.ink} />
          {mood < 0.5
            ? <path d={`M${-r * 0.2} ${r * 0.14} Q0 ${r * 0.28} ${r * 0.2} ${r * 0.14}`} stroke={C.ink} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
            : <ellipse cx={0} cy={r * 0.2} rx={r * 0.13} ry={r * 0.13 * mood} fill={C.ink} />}
          {heat > 0.55 && <path d={`M${r * 0.62} ${-r * 0.5} q${r * 0.12} ${r * 0.2} 0 ${r * 0.3} q${-r * 0.12} ${-r * 0.1} 0 ${-r * 0.3}`} fill="#BFE8FF" opacity={clamp01((heat - 0.55) * 3)} />}
        </g>}
      </g>
    );
  };

// deterministic scatter
export const scatter = (n: number, seed: string, w: number, h: number) =>
  Array.from({length: n}, (_, i) => ({x: (random(`${seed}x${i}`) - 0.5) * w, y: (random(`${seed}y${i}`) - 0.5) * h, p: random(`${seed}p${i}`) * Math.PI * 2, s: random(`${seed}s${i}`)}));
