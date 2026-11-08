// ADAPTER between the film and the shared kit (src/series, copied from projects/wireless-kit/film-kit). The film calls
// these; kit components do the drawing. Items the kit hasn't shipped yet are part-drawn stand-ins below (marked).
import React from 'react';
import {K, FONT} from './tok';
import {Sh, R, E} from './ink';
import {Cora, CrippenA, EthelA, Clara, Paul, DewA, Constable, Newsboy} from '../series/cast';
import {Puppet, PoseName, Expr as KExpr, HatShape} from '../series/puppet';
import {Moustache, MoustacheState, Feather, FeatherState, DailyWire, WantedPoster, CrippenEngraving} from '../series/devices';
import {Spark, SparkMode} from '../series/spark';
import {Glow as KGlow} from '../series/look';
import {C} from '../series/tokens';

export type Who = 'cora' | 'doctor' | 'ethel' | 'clara' | 'paul' | 'dew' | 'constable' | 'newsboy' | 'guildLady' | 'guildMan';
export type Pose = 'stand' | 'walk' | 'sing' | 'wave' | 'laugh' | 'deal' | 'talk' | 'shrug' | 'usher' | 'pocket' | 'telegram' | 'dance' | 'march' | 'lean' | 'lampLow' | 'liftHat' | 'hatOff' | 'write' | 'shout' | 'point' | 'flag' | 'holdLamp' | 'sweepLamp' | 'calm' | 'leanDoor' | 'holdBoard' | 'idle';
export type Expr = 'smile' | 'neutral' | 'nervous' | 'blank' | 'browUp' | 'still' | 'shout' | 'laugh' | 'polite' | 'serious' | 'sing' | 'wide' | 'startled';
export type FigP = {who: Who; x: number; y: number; s?: number; pose?: Pose; expr?: Expr; t: number; flip?: boolean; feather?: boolean; brooch?: boolean;
  m?: MoustacheState | 'none'; mAt?: number; glintAt?: number; litBelow?: number; talk?: boolean; far?: boolean; hold?: string; holdB?: string; seed?: number};
const KH: Record<Who, number> = {cora: 740, doctor: 608, ethel: 650, clara: 640, paul: 740, dew: 760, constable: 740, newsboy: 520, guildLady: 660, guildMan: 730};
const POSE: Partial<Record<Pose, PoseName>> = {pocket: 'pullCard', telegram: 'holdTelegram', lean: 'leanAsk', hatOff: 'removeHat'};
const EXPR: Partial<Record<Expr, KExpr>> = {browUp: 'raised'};
// part-only extras on the kit Puppet rig (pick §3.1 "Guild friends ×2"): a lady in a bonnet, a man in a top hat with a cane
const GUILD_LADY = {hair: C.slate, hairStyle: 'bun' as const, coat: C.mist, skirt: C.mist, legs: C.mist, build: 1.0, hat: 'bonnet' as const, hatColor: C.slate, scarf: C.newsprint};
const GUILD_MAN = {hair: C.mist, hairStyle: 'short' as const, coat: C.deep, coatLen: -200, legs: C.deep, build: 1.0, hat: 'top' as const, hatColor: C.ink, moustache: 'clipped' as const, shirt: C.newsprint};
export const Fig: React.FC<FigP> = (p) => {
  const fr = Math.round(p.t * 30);
  const q = {fr, x: p.x, y: p.y, height: KH[p.who] * (p.s ?? 1), facing: (p.flip ? -1 : 1) as 1 | -1, pose: (POSE[p.pose ?? 'stand'] ?? p.pose ?? 'stand') as PoseName,
    expr: p.expr ? (EXPR[p.expr] ?? p.expr) as KExpr : undefined, litBelow: p.litBelow, talk: p.talk, far: p.far, seed: p.seed,
    hold: p.hold as never, holdB: p.holdB as never};
  switch (p.who) {
    case 'cora': return <Cora {...q} />;
    case 'doctor': return <CrippenA {...q} moustache={p.m ?? 'on'} moustacheAt={p.mAt} glintAt={p.glintAt} />;
    case 'ethel': return <EthelA {...q} brooch={p.brooch} />;
    case 'clara': return <Clara {...q} />;
    case 'paul': return <Paul {...q} />;
    case 'dew': return <DewA {...q} feather={p.feather ?? false} />;
    case 'constable': return <Constable {...q} />;
    case 'newsboy': return <Newsboy {...q} />;
    case 'guildLady': return <Puppet {...q} look={GUILD_LADY} expr={q.expr ?? 'smile'} />;
    case 'guildMan': return <Puppet {...q} look={GUILD_MAN} expr={q.expr ?? 'smile'} hold={(q.hold ?? 'cane') as never} />;
  }
};

// ---- devices (kit) ----
export const SparkA: React.FC<{x: number; y: number; t: number; s?: number; tap?: number; mode?: SparkMode; at?: number}> = ({x, y, t, s = 1, tap = 0, mode, at}) =>
  <Spark fr={Math.round(t * 30)} x={x} y={y} size={s} mode={mode ?? (tap > 0.3 ? 'tap' : 'idle')} at={at} />;
// the Spark's fading trail along recent points (stacked-stroke glow, kit Glow)
export const SparkTrailA: React.FC<{pts: [number, number][]}> = ({pts}) => pts.length > 1 ? <g opacity={0.7}>{pts.slice(1).map((p, i) => <path key={i} d={`M${pts[i].join(',')}L${p.join(',')}`} stroke={i < 2 ? C.sparkCore : C.spark} strokeOpacity={1 - i / pts.length} strokeWidth={10 - i} strokeLinecap="round" />)}</g> : null;
export const MoustacheA: React.FC<{x: number; y: number; s?: number; state: MoustacheState; t: number; at?: number; tilt?: number}> = ({x, y, s = 1, state, t, at, tilt}) =>
  <Moustache fr={Math.round(t * 30)} x={x} y={y} size={s} state={state} at={at} tilt={tilt} />;
export const FeatherA: React.FC<{x: number; y: number; s?: number; rot?: number; t: number; state?: FeatherState}> = ({x, y, s = 1, rot = 0, t, state = 'fall'}) =>
  <Feather fr={Math.round(t * 30)} x={x} y={y} size={s} state={state} rot={rot} />;

// ---- STAND-INS until the kit ships ClueRing / StoryBalloon / WallCalendar / Notebook ----
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
// The Daily Wire (kit): x,y = page centre here; kit draws 640×860 from its top-left
export const PaperA: React.FC<{x: number; y: number; s?: number; rot?: number; date?: string; headline?: string; prevHeadline?: string; headlineAt?: number; t: number; ad?: boolean; portrait?: boolean}> =
  ({x, y, s = 1, rot = 0, date = '1910', headline, prevHeadline, headlineAt, t, ad, portrait}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <DailyWire fr={Math.round(t * 30)} x={-320 * s} y={-430 * s} scale={s} date={date} headline={headline} prevHeadline={prevHeadline} headlineAt={headlineAt} ad={ad}
      engraving={portrait ? (fr, w, h) => <g transform={`translate(${w / 2},${h / 2 + 10}) scale(1.2)`}><CrippenEngraving fr={fr} /></g> : undefined} />
  </g>
);
// paper-local points (relative to centre, unscaled): the ad ship's mast and the portrait
export const PAPER_MAST: [number, number] = [435 - 320, 712 - 430];
export const PAPER_PORTRAIT: [number, number] = [320 - 320, 445 - 430];
// WANTED poster (kit): x,y = centre; 420×600 native
export const WantedA: React.FC<{x: number; y: number; s?: number; t: number; walkAt?: number}> = ({x, y, s = 1, t, walkAt}) =>
  <WantedPoster fr={Math.round(t * 30)} x={x - 210 * s} y={y - 300 * s} scale={s} variant={walkAt != null ? 'walkOut' : 'full'} at={walkAt} />;
// the oval's centre relative to the poster centre (unscaled)
export const WANTED_OVAL: [number, number] = [0, 270 - 300];
// STAND-IN until the kit ships PoliceLamp
export const LampA: React.FC<{x: number; y: number; rot: number; s?: number}> = ({x, y, rot, s = 1}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M20,0L700,-150L700,150z" fill="url(#wn-beam)" opacity={0.9} />
    <path d="M20,0L700,-150L700,150z" fill={K.lamp} opacity={0.18} />
    <Sh d={R(-40, -36, 70, 72, 10)} fill={K.deep} line={3} /><circle cx={30} cy={0} r={22} fill={K.lamp} stroke={K.ink} strokeWidth={3} />
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

