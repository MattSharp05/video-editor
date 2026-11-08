// ADAPTER between the film and the shared kit. The film only calls these; at kit adoption each body is replaced by the
// kit component (series/*), so the choreography in Film.tsx doesn't change. Until then: rough stand-ins for timing.
import React from 'react';
import {K, FONT} from './tok';
import {Sh, R, E} from './ink';

export type Who = 'cora' | 'doctor' | 'ethel' | 'clara' | 'paul' | 'dew' | 'constable' | 'newsboy' | 'guildLady' | 'guildMan';
export type Pose = 'stand' | 'walk' | 'sing' | 'wave' | 'laugh' | 'deal' | 'talk' | 'shrug' | 'usher' | 'pocket' | 'telegram' | 'dance' | 'march' | 'lean' | 'lampLow' | 'liftHat' | 'hatOff' | 'write' | 'shout' | 'point';
export type Expr = 'smile' | 'neutral' | 'nervous' | 'blank' | 'browUp' | 'still' | 'shout' | 'laugh';
export type FigP = {who: Who; x: number; y: number; s?: number; pose?: Pose; expr?: Expr; t: number; flip?: boolean; feather?: boolean; brooch?: boolean; glint?: number};
const COL: Record<Who, string> = {cora: K.mist, doctor: K.slate, ethel: K.newsprint, clara: K.mist, paul: K.slate, dew: K.slate, constable: K.deep, newsboy: K.slate, guildLady: K.mist, guildMan: K.deep};
const H: Record<Who, number> = {cora: 760, doctor: 610, ethel: 700, clara: 680, paul: 780, dew: 800, constable: 780, newsboy: 560, guildLady: 690, guildMan: 760};
// a figure standing on (x,y) (feet), height H*s
export const Fig: React.FC<FigP> = ({who, x, y, s = 1, pose = 'stand', t, flip, feather}) => {
  const h = H[who], bob = pose === 'walk' || pose === 'march' ? Math.abs(Math.sin(t * 6)) * 10 : Math.sin(t * 2) * 3;
  return (
    <g transform={`translate(${x},${y - bob}) scale(${(flip ? -1 : 1) * s},${s})`}>
      <Sh d={`M${-h * 0.16},0L${-h * 0.2},${-h * 0.72}Q0,${-h * 0.8} ${h * 0.2},${-h * 0.72}L${h * 0.16},0z`} fill={COL[who]} ht="near" line={4} />
      <Sh d={E(0, -h * 0.84, h * 0.11, h * 0.13)} fill={K.skin} line={4} />
      {(pose === 'wave' || pose === 'sing' || pose === 'liftHat' || pose === 'shout' || pose === 'march') && <path d={`M${h * 0.18},${-h * 0.62}L${h * 0.3},${-h * 0.95 + Math.sin(t * 8) * 10}`} stroke={K.ink} strokeWidth={14} strokeLinecap="round" />}
      {who === 'cora' && <><Sh d={`M${-h * 0.3},${-h * 0.95}Q0,${-h * 1.08} ${h * 0.3},${-h * 0.95}z`} fill={K.deep} line={4} /><path d={`M${h * 0.12},${-h * 1.0}q${h * 0.1},${-h * 0.2} ${-h * 0.02 + Math.sin(t * 3) * 10},${-h * 0.32}`} stroke={K.cora} strokeWidth={18} fill="none" strokeLinecap="round" /></>}
      {who === 'dew' && <><Sh d={`M${-h * 0.14},${-h * 0.95}h${h * 0.28}l-6,-50h${-h * 0.28 + 12}z`} fill={K.deep} line={4} />{feather && <path d={`M${h * 0.1},${-h * 0.98}q20,-60 0,-110`} stroke={K.cora} strokeWidth={12} fill="none" strokeLinecap="round" />}</>}
      {who === 'doctor' && <g><circle cx={-h * 0.05} cy={-h * 0.85} r={12} fill="none" stroke={K.newsprint} strokeWidth={4} /><circle cx={h * 0.05} cy={-h * 0.85} r={12} fill="none" stroke={K.newsprint} strokeWidth={4} /></g>}
      <text x={0} y={-h * 0.4} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={40} fill={K.ink}>{who}</text>
    </g>
  );
};

// ---- devices / props (stand-ins) ----
export const SparkA: React.FC<{x: number; y: number; t: number; s?: number; tap?: number}> = ({x, y, t, s = 1, tap = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s * (1 + tap * 0.6)})`}>
    <circle r={60} fill="url(#p1-sparkglow)" />
    {[0, 1, 2].map((i) => <path key={i} d={`M0,0L${Math.cos(i * 2.1 + t * 9) * 40},${Math.sin(i * 2.1 + t * 9) * 40}`} stroke={K.spark} strokeWidth={4} />)}
    <circle r={9} fill="#fff" />
  </g>
);
export const SparkTrailA: React.FC<{pts: [number, number][]}> = ({pts}) => pts.length > 1 ? <path d={'M' + pts.map((p) => p.join(',')).join('L')} stroke={K.spark} strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" /> : null;
export const MoustacheA: React.FC<{x: number; y: number; s?: number; state: string; t: number}> = ({x, y, s = 1, state, t}) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${state === 'twitch' ? Math.sin(t * 30) * 8 : 0})`}>
    <Sh d={`M0,0Q-40,${state === 'droop' || state === 'sob' ? 30 : 4} -70,${state === 'fly' ? -20 + Math.sin(t * 20) * 20 : 18}Q-40,24 0,10Q40,24 70,${state === 'fly' ? -20 + Math.sin(t * 20) * 20 : 18}Q40,${state === 'droop' ? 30 : 4} 0,0z`} fill={K.deep} line={3} />
  </g>
);
export const FeatherA: React.FC<{x: number; y: number; s?: number; rot?: number; t: number}> = ({x, y, s = 1, rot = 0, t}) => (
  <g transform={`translate(${x},${y}) rotate(${rot + Math.sin(t * 2.4) * 5}) scale(${s})`}>
    <Sh d="M0,0Q-30,-80 -6,-170Q30,-90 0,0z" fill={K.cora} line={3} />
  </g>
);
export const ClueRingA: React.FC<{x: number; y: number; r: number; k: number}> = ({x, y, r, k}) => k > 0 ? <circle cx={x} cy={y} r={r} fill="none" stroke={K.clue} strokeWidth={6} strokeDasharray={`${k * 2 * Math.PI * r} 9999`} transform={`rotate(-90,${x},${y})`} /> : null;
export const BalloonA: React.FC<{x: number; y: number; w: number; h: number; tail: [number, number]; fuzzy?: number; children?: React.ReactNode}> = ({x, y, w, h, tail, fuzzy = 0, children}) => (
  <g opacity={1 - fuzzy * 0.3}>
    {fuzzy > 0 && [1, 2].map((i) => <rect key={i} x={x - w / 2 + i * 8 * fuzzy} y={y - h / 2 + i * 5 * fuzzy} width={w} height={h} rx={h / 3} fill={K.fog} opacity={0.4} />)}
    <path d={`M${x - 40},${y + h / 2 - 4}L${tail[0]},${tail[1]}L${x + 30},${y + h / 2 - 4}z`} fill={K.newsprint} stroke={K.ink} strokeWidth={4} />
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 3} fill={K.newsprint} stroke={K.ink} strokeWidth={4} />
    {children}
  </g>
);
export const CalendarA: React.FC<{x: number; y: number; s?: number; label: string; flip?: number}> = ({x, y, s = 1, label, flip = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Sh d={R(-90, -70, 180, 150, 6)} fill={K.newsprint} line={3} />
    <text x={0} y={-20} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={30} fill={K.ink}>{label.split(' ')[0]}</text>
    <text x={0} y={30} textAnchor="middle" fontFamily={FONT.period} fontSize={30} fill={K.ink}>{label.split(' ')[1]}</text>
    {flip > 0 && <rect x={-90} y={-70} width={180} height={150 * (1 - flip)} fill={K.newsprint} stroke={K.ink} strokeWidth={3} />}
  </g>
);
export const NotebookA: React.FC<{x: number; y: number; s?: number; open: number; lines: string[]; write: number}> = ({x, y, s = 1, open, lines, write}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Sh d={R(-200, -140, 400, 280, 8)} fill={K.newsprint} line={4} />
    {open < 0.5 ? <text x={0} y={0} textAnchor="middle" fontFamily={FONT.period} fontSize={30} fill={K.ink}>Insp. W. Dew · Scotland Yard</text>
      : lines.map((l, i) => <text key={i} x={-170} y={-80 + i * 60} fontFamily={FONT.period} fontStyle="italic" fontSize={40} fill={K.ink}>{l.slice(0, Math.round(l.length * Math.min(1, Math.max(0, write * lines.length - i))))}</text>)}
  </g>
);
export const PaperA: React.FC<{x: number; y: number; s?: number; rot?: number; date?: string; headline?: string; t: number}> = ({x, y, s = 1, rot = 0, date = 'London, 1910', headline = 'THE DAILY WIRE'}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Sh d={R(-260, -340, 520, 680)} fill={K.newsprint} line={4} />
    <text x={0} y={-270} textAnchor="middle" fontFamily={FONT.display} fontSize={60} fill={K.ink}>THE DAILY WIRE</text>
    <text x={0} y={-225} textAnchor="middle" fontFamily={FONT.period} fontSize={28} fill={K.ink}>{date}</text>
    <text x={0} y={-150} textAnchor="middle" fontFamily={FONT.display} fontSize={50} fill={K.ink}>{headline === 'THE DAILY WIRE' ? '' : headline}</text>
  </g>
);
export const WantedA: React.FC<{x: number; y: number; s?: number; empty?: number}> = ({x, y, s = 1, empty = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Sh d={R(-240, -330, 480, 660)} fill={K.newsprint} line={4} />
    <text x={0} y={-250} textAnchor="middle" fontFamily={FONT.display} fontSize={90} fill={K.ink}>WANTED</text>
    <Sh d={E(0, -40, 130, 160)} fill={K.fog} line={4} />
    {empty < 1 && <g opacity={1 - empty}><circle cx={0} cy={-60} r={60} fill={K.skin} /></g>}
    <text x={0} y={200} textAnchor="middle" fontFamily={FONT.period} fontSize={40} fill={K.ink}>Dr. Crippen</text>
  </g>
);
export const LampA: React.FC<{x: number; y: number; rot: number; s?: number}> = ({x, y, rot, s = 1}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0,0L700,-140L700,140z" fill={K.lamp} opacity={0.3} />
    <Sh d={R(-40, -36, 70, 72, 10)} fill={K.deep} line={3} />
  </g>
);

// ---- sets (stand-ins) ----
// 39 Hilldrop Crescent outside; door at (DOOR.x, DOOR.y top-of-steps), parlour window above-left
export const H39 = {doorX: 620, stepTop: 1180, ground: 1500, winX: 330, winY: 760, fan: [620, 830] as [number, number]};
export const House39A: React.FC<{t: number; mode: 'night' | 'snow' | 'day'; doorOpen?: number}> = ({t, mode, doorOpen = 0}) => (
  <g>
    <Sh d={R(80, 300, 960, 1200)} fill={mode === 'day' ? K.mist : K.slate} ht="far" line={4} />
    <Sh d={R(H39.winX - 160, H39.winY - 140, 320, 280)} fill={mode === 'day' ? K.fog : K.lamp} line={4} />
    <Sh d={R(H39.doorX - 90, H39.stepTop - 340, 180, 340)} fill={doorOpen > 0.5 ? K.lamp : K.deep} line={4} />
    <text x={H39.fan[0]} y={H39.fan[1]} textAnchor="middle" fontFamily={FONT.display} fontSize={56} fill={K.ink}>39</text>
    {Array.from({length: 6}).map((_, i) => <Sh key={i} d={R(H39.doorX - 130 - i * 16, H39.stepTop + i * 53, 260 + i * 32, 53)} fill={K.fog} line={3} />)}
    <Sh d={R(-400, H39.ground, 1900, 500)} fill={K.slate} line={3} />
    <g transform="translate(860,1360)"><Sh d={R(0, 0, 300, 60)} fill={K.newsprint} line={3} /><text x={150} y={42} textAnchor="middle" fontFamily={FONT.period} fontSize={30} fill={K.ink}>HILLDROP CRESCENT</text></g>
  </g>
);
export const SEC = {w: 1000, floors: [300, 700, 1100, 1500], cellarY: 1500, cellarFloor: 1860};
export const SectionA: React.FC<{t: number}> = () => (
  <g>
    <Sh d={R(40, 0, 1000, 1900)} fill={K.slate} line={5} />
    {SEC.floors.map((y, i) => <Sh key={i} d={R(40, y, 1000, 30)} fill={K.deep} line={3} />)}
    <Sh d={R(40, SEC.cellarFloor, 1000, 60)} fill={K.deep} line={3} />
    <text x={300} y={1560} fontFamily={FONT.period} fontSize={40} fill={K.ink}>COAL</text>
  </g>
);
export const YardA: React.FC<{t: number; shutter: number}> = ({shutter}) => (
  <g>
    <Sh d={R(-200, 100, 1500, 1400)} fill={K.slate} ht="far" line={4} />
    <text x={540} y={560} textAnchor="middle" fontFamily={FONT.display} fontSize={70} fill={K.newsprint}>NEW SCOTLAND YARD</text>
    <Sh d={R(380, 760, 320, 260)} fill={shutter > 0.5 ? K.lamp : K.deep} line={4} />
    <Sh d={R(440, 1100, 200, 400)} fill={K.deep} line={4} />
  </g>
);
export const SeaA: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect x={-500} y={-500} width={2100} height={1500} fill={K.deep} />
    <rect x={-500} y={1000} width={2100} height={1500} fill={K.ink} />
    {Array.from({length: 8}).map((_, i) => <path key={i} d={`M-500,${1040 + i * 90}${Array.from({length: 30}).map((_, j) => `q35,${j % 2 ? -12 : 12} 70,0`).join('')}`} transform={`translate(${-((t * 30 + i * 20) % 70)},0)`} stroke={K.slate} strokeWidth={4} fill="none" />)}
    <Sh d="M200,1000L880,1000L840,1070L240,1070z" fill={K.slate} line={3} />
    <circle cx={540} cy={1030} r={14} fill={K.lamp} />
  </g>
);

// ---- cards (stand-ins) ----
export const CornerTabA: React.FC = () => (
  <g><rect x={48} y={72} width={470} height={52} rx={8} fill={K.newsprint} /><circle cx={74} cy={98} r={8} fill={K.spark} /><text x={92} y={108} fontFamily={FONT.sans} fontWeight={600} fontSize={30} fill={K.ink}>Caught by Wireless · Part 1 of 3</text></g>
);
export const TitleA: React.FC<{burn: number; sub: number; lift: number}> = ({burn, sub, lift}) => (
  <g transform={`translate(0,${-lift * 700})`}>
    <rect x={120} y={300} width={840} height={230} rx={12} fill={K.deep} opacity={Math.min(1, burn * 3)} />
    <text x={540} y={450} textAnchor="middle" fontFamily={FONT.display} fontSize={92} fill={K.newsprint} opacity={burn}>CAUGHT BY WIRELESS</text>
    {sub > 0 && <g opacity={sub}><rect x={190} y={540} width={700} height={84} fill={K.newsprint} /><text x={540} y={598} textAnchor="middle" fontFamily={FONT.period} fontStyle="italic" fontSize={52} fill={K.ink}>Part one · The missing singer</text></g>}
  </g>
);
export const EndCardA: React.FC<{k: number; type: number}> = ({k, type}) => (
  <g transform={`translate(0,${(1 - k) * 600})`} opacity={k}>
    <rect x={140} y={560} width={800} height={440} fill={K.newsprint} stroke={K.ink} strokeWidth={4} />
    <text x={540} y={640} textAnchor="middle" fontFamily={FONT.period} fontSize={34} fill={K.ink}>WIRELESS TELEGRAM · MARCONI</text>
    <text x={540} y={820} textAnchor="middle" fontFamily={FONT.wire} fontWeight={700} fontSize={64} fill={K.ink}>{'NEXT: THE CHASE'.slice(0, Math.round(type * 15))}</text>
  </g>
);
export const TagA: React.FC<{text: string; x: number; y: number; o: number}> = ({text, x, y, o}) => o > 0 ? (
  <g opacity={o}><rect x={x - 130} y={y - 30} width={260} height={52} fill={K.newsprint} /><text x={x} y={y + 8} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={28} fill={K.ink}>{text}</text></g>
) : null;
