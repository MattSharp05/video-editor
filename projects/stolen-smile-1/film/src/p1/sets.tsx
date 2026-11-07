// Part 1 stages. Each stage draws its planes at stage time t (seconds, absolute) and owns its camera keys.
// Times all come from beats.json (B). Kit pieces arrive through ./cast.
import React from 'react';
import {interpolate, random} from 'remotion';
import B from '../beats.json';
import {C, Cut, Ell, rect, twos, Easel, BoxCamera, Knob, Pliers, Toolbag, Baguettes, Dog} from './paper';
import {Person, Guard, ArtLover, MonaLisa, Hooks, Vincenzo, GUARD_TALL, GUARD_ROUND, ARTLOVER, Monocle, FameGauge, Calendar, Question, Label, Bundle, PaperPainting, Glint, TYPE, SERIF, ML_RATIO} from './cast';
import {Plane, camAt, drift, clamp, ramp, rampIO, win, Cam} from './rig';

const FPS = 30;
const fr = (t: number) => Math.round(t * FPS);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const glintK = (t: number, at: number) => (t >= at ? (t - at) * FPS : -1);

// ---------- shared room pieces ----------
const Parquet: React.FC<{y: number; w?: number; tint?: string}> = ({y, w = 3000, tint = C.paperShade}) => (
  <g>
    <rect x={-w / 2} y={y} width={w} height={1400} fill={tint} />
    {Array.from({length: 40}).map((_, i) => <line key={i} x1={-w / 2 + i * 90} y1={y} x2={-w / 2 + i * 90 - 300} y2={y + 1400} stroke={C.sepia} strokeWidth={2} opacity={0.35} />)}
    <line x1={-w / 2} y1={y} x2={w / 2} y2={y} stroke={C.ink} strokeWidth={3.5} />
  </g>
);
const Dust: React.FC<{t: number; n?: number; x0?: number; x1?: number; y0?: number; y1?: number; seed?: string}> = ({t, n = 14, x0 = -400, x1 = 400, y0 = -700, y1 = 300, seed = 'd'}) => (
  <g>{Array.from({length: n}).map((_, i) => {
    const sx = random(`${seed}x${i}`), sy = random(`${seed}y${i}`);
    const x = lerp(x0, x1, sx) + Math.sin(t * 0.6 + i) * 30, y = lerp(y0, y1, (sy + t * 0.03 * (0.5 + sx)) % 1);
    return <circle key={i} cx={x} cy={y} r={2 + 3 * sx} fill="#FFF6DE" opacity={0.5 + 0.4 * Math.sin(t * 2 + i)} />;
  })}</g>
);

// ---------- 1. Salon Carré (with-her, modern, empty) ----------
// Her spot at stage (0,-150) top; she is 270 px tall -> w 181. The four hooks above her at y -200.
export const ML_W = 181, ML_Y = -150, HOOK_Y = -196;
const WALL_PAINTINGS: {x: number; y: number; w: number; h: number; kind: 'portrait' | 'land' | 'still'}[] = [
  {x: -470, y: -560, w: 420, h: 560, kind: 'land'}, {x: 470, y: -600, w: 400, h: 620, kind: 'portrait'},
  {x: -330, y: 120, w: 240, h: 300, kind: 'portrait'}, {x: 330, y: 110, w: 260, h: 200, kind: 'still'},
  {x: 0, y: -720, w: 300, h: 220, kind: 'land'}, {x: -820, y: -300, w: 300, h: 420, kind: 'portrait'},
  {x: 820, y: -260, w: 320, h: 400, kind: 'portrait'}, {x: -820, y: 220, w: 260, h: 200, kind: 'still'}, {x: 820, y: 240, w: 240, h: 300, kind: 'portrait'},
];
export const SalonWall: React.FC<{t: number; fold?: number; eyes?: number[]; light?: string}> = ({t, fold = 1, eyes = [], light = C.paper}) => (
  <g>
    <rect x={-1600} y={-1300} width={3200} height={1800} fill={light} />
    {/* wainscot */}
    <rect x={-1600} y={380} width={3200} height={120} fill={C.paperShade} stroke={C.ink} strokeWidth={3} />
    {/* the big Old Masters fold up from the floor line (pop-up book) */}
    {WALL_PAINTINGS.map((p, i) => {
      const k = Math.min(1, Math.max(0, fold * 1.6 - i * 0.07));
      return (
        <g key={i} transform={`translate(${p.x},500) scale(1,${k}) translate(0,-500)`}>
          <g transform={`translate(${p.x === 0 ? 0 : 0},${p.y})`}><PaperPainting w={p.w} h={p.h} seed={i + 1} eyeX={eyes[i] ?? 0} kind={p.kind} /></g>
        </g>
      );
    })}
  </g>
);
// skylight beam
const Skylight: React.FC<{t: number; o?: number}> = ({t, o = 1}) => (
  <g opacity={o}>
    <path d={`M${-260 + Math.sin(t * 0.2) * 30},-1300 L${260 + Math.sin(t * 0.2) * 30},-1300 L${520},700 L${-120},700Z`} fill="url(#beam)" />
  </g>
);

// today's crowd: heads and raised phones with white flashes; each person bobs on its own phase
export const ModernCrowd: React.FC<{t: number; rise: number; fold: number}> = ({t, rise, fold}) => (
  <g transform={`translate(0,980) scale(1,${fold}) translate(0,-980)`}>
    {Array.from({length: 14}).map((_, i) => {
      const x = -720 + i * 112 + (random(`cx${i}`) - 0.5) * 40, row = i % 2;
      const y = 700 + row * 90 + Math.sin(t * 3 + i * 1.3) * 6;
      const ph = Math.min(1, Math.max(0, rise * 1.8 - random(`cr${i}`) * 0.8));
      const flash = ((t * 1.3 + random(`cf${i}`) * 5) % 2.3) < 0.12 && ph > 0.9;
      const coat = ['#3B3F4E', '#7A5A3C', '#5B6F93', '#8A5A4A', '#2C3A57'][i % 5];
      return (
        <g key={i} transform={`translate(${x},${y})`}>
          <Cut d="M-60,40 Q-60,-30 0,-30 Q60,-30 60,40 L70,300 L-70,300Z" fill={coat} />
          <Ell cx={0} cy={-80} rx={48} ry={56} fill={C.skin[i % 4]} />
          <Cut d="M-48,-90 Q-46,-140 0,-140 Q46,-140 48,-90 Q20,-110 -48,-90Z" fill={['#2A1E17', '#6B5A4A', C.ink][i % 3]} w={2.5} shadow={false} />
          {/* arm + phone */}
          <g transform={`translate(${row ? -30 : 30},${-10 - ph * 220}) rotate(${(random(`ca${i}`) - 0.5) * 20})`} opacity={ph > 0.05 ? 1 : 0}>
            <Cut d={rect(-14, 0, 28, 30 + ph * 200, 12)} fill={coat} w={2.5} shadow={false} />
            <Cut d={rect(-30, -70, 60, 100, 8)} fill={C.ink} w={2.5} />
            <rect x={-24} y={-64} width={48} height={86} rx={4} fill={flash ? '#FFFFFF' : '#C9D3E0'} />
            {flash && <circle cx={0} cy={-20} r={90} fill="#FFFFFF" opacity={0.55} />}
          </g>
        </g>
      );
    })}
    {/* a selfie stick */}
    <g transform={`translate(${380 + Math.sin(t * 1.1) * 20},${720 - rise * 260}) rotate(${-14 + Math.sin(t) * 5})`} opacity={rise}>
      <rect x={-4} y={0} width={8} height={420} fill={C.ink} />
      <Cut d={rect(-30, -80, 60, 90, 8)} fill={C.ink} w={2.5} />
    </g>
  </g>
);

export const Rope: React.FC<{fold: number}> = ({fold}) => (
  <g transform={`translate(0,700) scale(1,${fold}) translate(0,-700)`}>
    {[-420, 0, 420].map((x) => <g key={x}><Cut d={rect(x - 12, 420, 24, 280, 8)} fill={C.oldGold} w={2.5} /><Ell cx={x} cy={420} rx={22} fill={C.oldGold} w={2.5} /></g>)}
    <path d="M-420,450 Q-210,540 0,450 Q210,540 420,450" stroke={C.clueRed} strokeWidth={14} fill="none" />
  </g>
);

// ---------- the Louvre exterior: very long façade on a curving Seine, eyelid shutters ----------
const Shutter: React.FC<{x: number; y: number; open: number; snore: number}> = ({x, y, open, snore}) => (
  <g transform={`translate(${x},${y})`}>
    <Cut d={rect(-34, -70, 68, 140, 30)} fill={C.nightBlue} w={2.5} shadow={false} />
    {/* closed eyelid: a lid that covers the window, with lashes */}
    <g transform={`translate(0,-70) scale(1,${1 - open * 0.92}) translate(0,70)`}>
      <Cut d={rect(-34, -70, 68, 140, 30)} fill={C.stone} w={2.5} shadow={false} />
    </g>
    <path d={`M-30,${70 - open * 128 + snore} Q0,${88 - open * 128 + snore} 30,${70 - open * 128 + snore}`} stroke={C.ink} strokeWidth={3} fill="none" />
    {[-18, 0, 18].map((lx) => <line key={lx} x1={lx} y1={78 - open * 128 + snore} x2={lx * 1.2} y2={92 - open * 128 + snore} stroke={C.ink} strokeWidth={2.5} />)}
  </g>
);
export const LouvreExterior: React.FC<{t: number; openWin: number}> = ({t, openWin}) => {
  const snore = Math.sin(t * Math.PI * 0.9) * 3;
  return (
    <>
      <Plane k={0.2}>
        <rect x={-2000} y={-2400} width={6000} height={4000} fill="#C9C2B0" />
        {/* far rooftops of Paris */}
        {Array.from({length: 30}).map((_, i) => <Cut key={i} d={rect(-1600 + i * 170, -720 - random(`rf${i}`) * 140, 150, 600, 4)} fill={i % 2 ? C.paperShade : '#CFC3A8'} w={2.5} shadow={false} />)}
      </Plane>
      <Plane k={0.6}>
        {/* the façade: 7 bays of windows, roof with chimneys that puff in rhythm (snoring) */}
        <Cut d="M-1300,-560 L4200,-560 L4200,180 L-1300,180Z" fill={C.paper} />
        <Cut d="M-1340,-560 L4240,-560 L4160,-680 L-1260,-680Z" fill={C.stone} />
        {Array.from({length: 8}).map((_, i) => {
          const cx = -1100 + i * 700, k = ((t * 0.9 + i * 0.37) % 2.2) / 2.2;
          return <g key={i}>
            <Cut d={rect(cx - 30, -800, 60, 140, 4)} fill={C.stone} w={2.5} />
            {[0, 1, 2].map((j) => { const kk = (k + j * 0.33) % 1; return <circle key={j} cx={cx + kk * 40} cy={-820 - kk * 160} r={18 + kk * 40} fill="#FFFFFF" opacity={0.7 * (1 - kk)} />; })}
          </g>;
        })}
        {Array.from({length: 34}).map((_, i) => {
          const x = -1200 + i * 160, row = [-380, -130];
          const target = i === 13; // the window we enter (stage x ~ 880)
          return row.map((y, r) => <Shutter key={`${i}-${r}`} x={x} y={y} open={target && r === 1 ? openWin : (i * 7 + r) % 11 === 3 ? 0.18 + 0.18 * Math.sin(t * 4 + i) : 0} snore={snore} />);
        })}
        {/* the sign on a chain */}
        <g transform={`translate(${600},-40) rotate(${Math.sin(t * 2.1) * 6}) scale(1.6)`}>
          <line x1={-80} y1={-90} x2={-60} y2={0} stroke={C.ink} strokeWidth={3} /><line x1={80} y1={-90} x2={60} y2={0} stroke={C.ink} strokeWidth={3} />
          <g transform="translate(0,40)"><Label text="Closed on Mondays" size={38} /></g>
        </g>
        {/* the river: the Seine curve */}
        <path d="M-1500,330 Q600,180 2600,330 Q4000,420 4800,300 L4800,1400 L-1500,1400Z" fill={C.duskBlue} stroke={C.ink} strokeWidth={3.5} />
        <rect x={-1500} y={180} width={6300} height={60} fill={C.stone} stroke={C.ink} strokeWidth={3} />
        {Array.from({length: 18}).map((_, i) => <path key={i} d={`M${-1300 + i * 330 + Math.sin(t + i) * 30},${470 + (i % 3) * 120} q30,-12 60,0`} stroke={C.paper} strokeWidth={4} fill="none" opacity={0.6} />)}
        {/* a little boat */}
        <g transform={`translate(${-600 + t * 40},${470 + Math.sin(t * 2) * 6})`}>
          <Cut d="M-90,0 L90,0 L60,40 L-60,40Z" fill={C.sepia} w={2.5} /><Cut d="M0,0 L0,-120 L60,-20Z" fill={C.card} w={2.5} />
        </g>
      </Plane>
    </>
  );
};
export const Pigeon: React.FC<{t: number}> = ({t}) => {
  const flap = Math.sin(twos(fr(t)) * 1.2) * 30;
  return (
    <g>
      <Ell cx={0} cy={0} rx={34} ry={20} fill="#9AA0A8" w={2.5} />
      <Ell cx={30} cy={-14} rx={14} fill="#9AA0A8" w={2.5} />
      <circle cx={34} cy={-17} r={3} fill={C.ink} />
      <path d="M42,-14 L54,-10 L42,-8Z" fill={C.amber} />
      <g transform={`rotate(${flap},-4,-6)`}><Cut d="M-4,-6 Q-40,-60 -70,-40 Q-40,-20 -4,-6Z" fill="#B7BCC2" w={2.5} shadow={false} /></g>
    </g>
  );
};

// ---------- the gallery: a long cold hall with portraits whose eyes follow him ----------
export const Gallery: React.FC<{t: number; vx: number}> = ({t, vx}) => (
  <>
    <Plane k={0.45}>
      <rect x={-1400} y={-1600} width={5200} height={2400} fill={C.duskBlue} />
      {/* far arches */}
      {Array.from({length: 9}).map((_, i) => <Cut key={i} d={`M${-1200 + i * 520},500 L${-1200 + i * 520},-300 Q${-940 + i * 520},-620 ${-680 + i * 520},-300 L${-680 + i * 520},500Z`} fill="#4E6185" w={3} shadow={false} />)}
    </Plane>
    <Plane k={1}>
      <rect x={-1400} y={-1700} width={5600} height={2100} fill="#3C4C6E" opacity={0.9} />
      {/* window beams */}
      {Array.from({length: 6}).map((_, i) => <path key={i} d={`M${-900 + i * 700},-1100 L${-700 + i * 700},-1100 L${-300 + i * 700},500 L${-640 + i * 700},500Z`} fill="#AFC2E0" opacity={0.12} />)}
      {/* portraits on the wall; their dot eyes slide toward him, one by one */}
      {Array.from({length: 7}).map((_, i) => {
        const px = -800 + i * 560;
        const look = Math.max(-1, Math.min(1, (vx - px) / 260));
        const wake = interpolate(vx, [px - 700, px - 300], [0, 1], clamp);
        return <g key={i} transform={`translate(${px},-560)`}><PaperPainting w={260} h={330} seed={i + 3} eyeX={look * wake} kind="portrait" /></g>;
      })}
      <Parquet y={420} w={6000} tint="#6E7A92" />
      <Dust t={t} n={18} x0={-900} x1={3200} y0={-900} y1={400} seed="g" />
    </Plane>
  </>
);

// ---------- the back staircase + door ----------
export const Stair: React.FC<{t: number; doorStretch: number; lampFlick: number; daylight: number; doorOpen: number}> = ({t, doorStretch, lampFlick, daylight, doorOpen}) => (
  <>
    <Plane k={0.45}>
      <rect x={-1600} y={-2600} width={3200} height={5200} fill="#7F786C" />
      {Array.from({length: 40}).map((_, i) => <rect key={i} x={-1500 + (i % 8) * 400 + (Math.floor(i / 8) % 2) * 200} y={-2400 + Math.floor(i / 8) * 260} width={380} height={240} fill="none" stroke="#6A6458" strokeWidth={4} />)}
    </Plane>
    <Plane k={1}>
      {/* lamp */}
      <g transform="translate(-380,-1180)">
        <circle r={420} fill="url(#lamp)" opacity={0.75 + lampFlick * 0.25} />
        <Cut d="M-30,0 L30,0 L20,60 L-20,60Z" fill={C.oldGold} w={2.5} />
        <circle cy={78} r={16} fill="#FFE9B8" />
      </g>
      {/* 7 steps descending to the right, ending at the door (stage 0..+1600 down) */}
      {Array.from({length: 7}).map((_, i) => (
        <Cut key={i} d={rect(-700 + i * 120, -900 + i * 220, 1100, 220, 4)} fill={i % 2 ? C.stone : '#B0A898'} />
      ))}
      <Cut d={rect(-900, 640, 2400, 1200, 4)} fill="#8C8475" />
      {/* the door at the bottom (x 560..860, y 0..640); stretches taller when he tries it */}
      <g transform={`translate(710,640) scale(1,${doorStretch}) translate(-710,-640)`}>
        <Cut d={rect(540, -10, 340, 660, 8)} fill={C.ink} />
        {/* daylight behind it */}
        <rect x={556} y={6} width={308} height={630} fill="#FFF7E2" opacity={daylight} />
        <g transform={`translate(556,0) scale(${1 - doorOpen * 0.85},1)`}>
          <Cut d={rect(0, 6, 308, 630, 4)} fill={C.sepia} />
          {[0, 1, 2].map((r) => <rect key={r} x={30} y={40 + r * 200} width={248} height={170} fill="none" stroke={C.ink} strokeWidth={2.5} opacity={0.6} />)}
        </g>
      </g>
    </Plane>
  </>
);

// ---------- the Paris street, then the paper map ----------
export const Street: React.FC<{t: number}> = ({t}) => (
  <>
    <Plane k={0.25}>
      <rect x={-2000} y={-2400} width={7000} height={4000} fill="#EADFC6" />
      {Array.from({length: 26}).map((_, i) => <Cut key={i} d={rect(-1800 + i * 230, -1000 - random(`sr${i}`) * 200, 210, 800, 4)} fill={i % 2 ? '#D8CCB0' : C.paperShade} w={2.5} shadow={false} />)}
    </Plane>
    <Plane k={0.7}>
      {Array.from({length: 9}).map((_, i) => {
        const x = -1400 + i * 560;
        return <g key={i}>
          <Cut d={rect(x, -1100, 540, 1300, 4)} fill={i % 2 ? C.paper : '#E7D8BA'} />
          {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <g key={`${r}${c}`}>
            <Cut d={rect(x + 50 + c * 160, -1000 + r * 330, 110, 190, 6)} fill={C.duskBlue} w={2.5} shadow={false} />
            <rect x={x + 40 + c * 160} y={-800 + r * 330} width={130} height={14} fill={C.ink} />
          </g>))}
          {i === 3 && <g><Cut d={`M${x},-60 L${x + 540},-60 L${x + 580},40 L${x - 40},40Z`} fill={C.clueRed} /><text x={x + 270} y={-90} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={60} fill={C.ink}>Boulangerie</text></g>}
        </g>;
      })}
      <Cut d={rect(-1600, 200, 6000, 700, 4)} fill="#B9AE96" />
      {Array.from({length: 60}).map((_, i) => <circle key={i} cx={-1500 + (i % 30) * 190 + (Math.floor(i / 30) % 2) * 95} cy={300 + Math.floor(i / 30) * 120} r={30} fill="none" stroke={C.sepia} strokeWidth={2} opacity={0.4} />)}
      {/* lamp-post */}
      <g transform="translate(1900,200)"><Cut d={rect(-14, -900, 28, 900, 6)} fill={C.ink} /><Cut d="M-50,-1000 L50,-1000 L30,-900 L-30,-900Z" fill={C.oldGold} /></g>
    </Plane>
  </>
);
// bird's-eye paper map of Paris: ink street grid, the Seine, the Louvre block; an amber dot wanders and fades
export const ParisMap: React.FC<{t: number; dot: number; dotO: number}> = ({t, dot, dotO}) => {
  const path = 'M-120,-80 L-120,60 L60,60 L60,240 L260,240 L260,420 L80,420 L80,620';
  const pts = [[-120, -80], [-120, 60], [60, 60], [60, 240], [260, 240], [260, 420], [80, 420], [80, 620]];
  const seg = dot * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(seg)), k = seg - i;
  const dx = lerp(pts[i][0], pts[i + 1][0], k), dy = lerp(pts[i][1], pts[i + 1][1], k);
  return (
    <g>
      <rect x={-1400} y={-1600} width={2800} height={3200} fill={C.paper} />
      {Array.from({length: 26}).map((_, j) => <line key={`h${j}`} x1={-1400} y1={-1600 + j * 130 + (j % 3) * 10} x2={1400} y2={-1600 + j * 130 - (j % 4) * 14} stroke={C.ink} strokeWidth={j % 4 === 0 ? 5 : 2} opacity={0.6} />)}
      {Array.from({length: 22}).map((_, j) => <line key={`v${j}`} x1={-1400 + j * 130} y1={-1600} x2={-1400 + j * 130 + (j % 3) * 30} y2={1600} stroke={C.ink} strokeWidth={j % 5 === 0 ? 5 : 2} opacity={0.6} />)}
      <path d="M-1400,-300 Q-600,-520 0,-260 Q600,0 1400,-180" stroke={C.duskBlue} strokeWidth={80} fill="none" />
      <rect x={-330} y={-250} width={420} height={110} fill={C.stone} stroke={C.ink} strokeWidth={3} />
      <text x={-120} y={-178} textAnchor="middle" fontFamily={TYPE} fontSize={36} fill={C.ink}>Louvre</text>
      <path d={path} stroke={C.amber} strokeWidth={6} strokeDasharray="14 14" fill="none" opacity={dotO * 0.6} strokeDashoffset={-t * 30} />
      <circle cx={dx} cy={dy} r={60} fill="url(#amberLeak)" opacity={dotO} />
      <circle cx={dx} cy={dy} r={18} fill={C.amber} stroke={C.ink} strokeWidth={3} opacity={dotO} />
      <g transform="translate(-700,-900)"><Label text="Paris" size={60} /></g>
    </g>
  );
};

// ---------- Vincenzo's little room at night (illustration) ----------
export const DarkRoom: React.FC<{t: number; glint: number}> = ({t, glint}) => (
  <g>
    <rect x={-1400} y={-1600} width={2800} height={3200} fill="#1C2438" />
    <Cut d={rect(-640, -700, 360, 460, 8)} fill={C.duskBlue} w={3} />
    <path d="M-640,-700 L-460,-700 L-460,-240 L-640,-240" fill="#3C4C6E" />
    <circle cx={-520} cy={-580} r={40} fill={C.paper} opacity={0.5} />
    {/* bed */}
    <Cut d={rect(-560, 60, 1100, 200, 10)} fill="#2C3A57" />
    <Cut d={rect(-600, -120, 60, 520, 8)} fill="#151B2A" /><Cut d={rect(520, -20, 60, 420, 8)} fill="#151B2A" />
    <Cut d={rect(-540, -40, 1060, 110, 30)} fill="#3C4C6E" />
    {/* under the bed: the white bundle, amber leak, her eyes */}
    <g transform="translate(-40,330) scale(1.1)"><Bundle fr={fr(t)} leak={1} eyes={1} glint={glint} /></g>
  </g>
);

export {Guard, ArtLover, Vincenzo, GUARD_TALL, GUARD_ROUND, ARTLOVER, Monocle, FameGauge, Calendar, Question, Label, Bundle, MonaLisa, Hooks, Glint, Easel, BoxCamera, Knob, Pliers, Toolbag, Baguettes, Dog, Person, Cut, Ell, rect, C, ML_RATIO, glintK, fr, lerp, Dust, Skylight, Parquet};
export type {Cam};
export {camAt, drift, clamp, ramp, rampIO, win, Plane};
