// ADAPTER between the film and the shared kit (src/series, copied from projects/wireless-kit/film-kit). The film calls
// these; kit components do the drawing. Items the kit hasn't shipped yet are part-drawn stand-ins below (marked).
import React from 'react';
import {Cora, CrippenA, EthelA, Clara, Paul, DewA, Constable, Newsboy} from '../series/cast';
import {Puppet, PoseName, Expr as KExpr, HatShape} from '../series/puppet';
import {Moustache, MoustacheState, Feather, FeatherState, DailyWire, WantedPoster, CrippenEngraving} from '../series/devices';
import {Spark, SparkMode} from '../series/spark';
import {ClueRing, StoryBalloon} from '../series/props';
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

// ---- kit props through thin wrappers (time in seconds here, frames in the kit) ----
export const ClueRingA: React.FC<{x: number; y: number; r: number; at: number; t: number; out?: number}> = ({x, y, r, at, t, out}) =>
  <ClueRing fr={Math.round(t * 30)} at={Math.round(at * 30)} x={x} y={y} r={r} out={out != null ? Math.round(out * 30) : undefined} />;
// speech balloon centred at (x,y), tail pointing at an absolute world point
export const BalloonA: React.FC<{x: number; y: number; w: number; h: number; tail: [number, number]; t: number; at: number; text?: string; fuzzy?: boolean;
  picture?: (fr: number, w: number, h: number) => React.ReactNode; wet?: boolean; wetAt?: number; fontSize?: number}> = (p) =>
  <StoryBalloon fr={Math.round(p.t * 30)} x={p.x - p.w / 2} y={p.y - p.h / 2} w={p.w} h={p.h} tail={[p.tail[0] - p.x, p.tail[1] - (p.y + p.h / 2)]} text={p.text}
    fuzzy={p.fuzzy} picture={p.picture} wet={p.wet} wetAt={p.wetAt != null ? Math.round(p.wetAt * 30) : undefined} at={Math.round(p.at * 30)} fontSize={p.fontSize} />;
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

// ---- kit set geometry used by the film ----
// 39 Hilldrop Crescent (kit Hilldrop): door x 770, top step y 1330, bay window panes x 170–430 y 1050–1290, fanlight "39"
export const H39 = {doorX: 770, stepTop: 1330, ground: 1500, winX: 300, winY: 1170, winW: 270, winH: 250, fan: [770, 960] as [number, number]};
