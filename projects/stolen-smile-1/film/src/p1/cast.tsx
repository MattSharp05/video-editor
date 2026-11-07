// The shared cast as this part uses it. Until film-kit/READY these are stand-ins written to the pick's spec
// (§2–3); on adoption each export is re-pointed at ../series (the kit) so the scenes don't change.
import React from 'react';
import {Img, staticFile, interpolate, random} from 'remotion';
import {C, Cut, Ell, rect, PersonLook, twos} from './paper';
import {MonaLisa as KML} from '../series/monalisa';
import * as K from '../series/characters';
import {Puppet} from '../series/puppet';
import type {Look, PoseName, Expr} from '../series/puppet';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const TYPE = "'Special Elite', monospace";
export const SERIF = "'Playfair Display', serif";
export const SANS = "'Hanken Grotesk', sans-serif";

// --- the Mona Lisa: the public-domain photograph, never redrawn; glow, glint, crops only ---
// w = width in px (true scale next to Vincenzo: 270 px tall -> 181 wide). Centre-top anchored at (0,0).
export const ML_RATIO = 1908 / 1280;
// adapter: my call sites use top-centre anchoring by width and `glint` = frames since the glint started
export const MonaLisa: React.FC<{w: number; glow?: number; glint?: number; frame?: boolean; crop?: 'full' | 'eyes' | 'smile'; glass?: number; turn?: number; board?: 'front' | 'back' | 'edge'}> = ({w, glow = 0.6, glint = -1, frame = true, crop = 'full', glass = 0, turn = 0, board = 'front'}) => {
  const gfr = Math.max(0, glint), gAt = glint >= 0 ? 0 : undefined;
  if (crop === 'eyes') { const h = w / 2.96; return <KML fr={gfr} glintAt={gAt} x={0} y={h / 2} height={h} crop="eyes" glow={0.35} />; }
  if (crop === 'smile') { const h = w / 2.2; return <KML fr={gfr} glintAt={gAt} x={0} y={h / 2} height={h} crop="smile" glow={0.3} />; }
  const h = w * ML_RATIO;
  return <g>
    <KML fr={gfr} glintAt={gAt} x={0} y={h / 2} height={h} glow={glow} frame={frame} turn={turn} board={board} glass={glass > 0.5} />
  </g>;
};
// a 4-point white-amber star, 8 frames (k = frames since it started)
export const Glint: React.FC<{x: number; y: number; k: number; s?: number}> = ({x, y, k, s = 1}) => {
  const a = Math.sin(Math.min(1, k / 8) * Math.PI);
  const r = 40 * s * a;
  return (
    <g transform={`translate(${x},${y}) rotate(${k * 4})`} opacity={a}>
      <path d={`M0,${-r} L${r * 0.16},${-r * 0.16} L${r},0 L${r * 0.16},${r * 0.16} L0,${r} L${-r * 0.16},${r * 0.16} L${-r},0 L${-r * 0.16},${-r * 0.16}Z`} fill="#FFFFFF" />
      <circle r={r * 0.3} fill={C.amberGlow} opacity={0.8} />
    </g>
  );
};
export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="amberHalo"><stop offset="0" stopColor={C.amberGlow} stopOpacity={0.85} /><stop offset="0.5" stopColor={C.amber} stopOpacity={0.35} /><stop offset="1" stopColor={C.amber} stopOpacity={0} /></radialGradient>
    <radialGradient id="amberLeak"><stop offset="0" stopColor={C.amberGlow} stopOpacity={0.95} /><stop offset="1" stopColor={C.amber} stopOpacity={0} /></radialGradient>
    <radialGradient id="lamp"><stop offset="0" stopColor="#FFE9B8" stopOpacity={0.7} /><stop offset="1" stopColor="#FFE9B8" stopOpacity={0} /></radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF4DC" stopOpacity={0.35} /><stop offset="1" stopColor="#FFF4DC" stopOpacity={0} /></linearGradient>
  </defs>
);

// --- four hooks: ink S-hooks 60 px apart; lit[i] 0..1 (with number tag), sway in degrees ---
export const Hooks: React.FC<{lit?: number[]; sway?: number; empty?: boolean; s?: number; tags?: number[]}> = ({lit = [0, 0, 0, 0], sway = 0, s = 1, tags}) => (
  <g transform={`scale(${s})`}>
    {[0, 1, 2, 3].map((i) => {
      const x = (i - 1.5) * 60;
      const l = lit[i] ?? 0;
      const tg = tags ? tags[i] : l;
      return (
        <g key={i} transform={`translate(${x},0) rotate(${sway * (i % 2 ? 1 : -0.8)},0,-34)`}>
          {l > 0 && <circle cx={0} cy={-6} r={30 * l} fill={C.amberGlow} opacity={0.5 * l} />}
          <path d="M0,-34 Q12,-34 10,-22 Q8,-12 0,-10 L0,10 Q0,24 -10,22 Q-16,20 -14,12" fill="none" stroke={C.card} strokeWidth={13} strokeLinecap="round" />
          <path d="M0,-34 Q12,-34 10,-22 Q8,-12 0,-10 L0,10 Q0,24 -10,22 Q-16,20 -14,12" fill="none" stroke={C.ink} strokeWidth={6.5} strokeLinecap="round" />
          {tg > 0 && <g transform={`translate(0,-70) scale(${tg})`}>
            <rect x={-18} y={-20} width={36} height={36} rx={4} fill={C.card} stroke={C.ink} strokeWidth={2.5} />
            <text y={9} textAnchor="middle" fontFamily={TYPE} fontSize={28} fill={C.ink}>{i + 1}</text>
          </g>}
        </g>
      );
    })}
  </g>
);

// --- characters: the kit's puppets (feet at 0,0). My older call props are mapped here. ---
export type PP = {fr: number; walk?: number; s?: number; flip?: boolean; bow?: number; armL?: number; armR?: number; mouth?: 'smile' | 'o' | 'flat';
  brows?: number; eyeX?: number; children?: React.ReactNode; pose?: PoseName; expr?: Expr; under?: React.ReactNode; lean?: number};
const kp = (p: PP, base: number) => ({
  fr: p.fr, x: 0, y: 0, height: base * (p.s ?? 1), facing: (p.flip ? -1 : 1) as 1 | -1,
  pose: p.pose ?? (p.bow ? 'bow' : p.walk ? (p.under ? 'carryWalk' : 'walk') : p.under ? 'carry' : (p.armR ?? 0) < -100 ? 'point' : 'stand') as PoseName,
  expr: p.expr ?? ((p.mouth === 'o' ? 'jawDrop' : (p.brows ?? 0) > 4 ? 'worried' : 'calm') as Expr),
  look: [(p.eyeX ?? 0) / 4, 0] as [number, number], hold: p.children, under: p.under,
});
const toLook = (l: PersonLook): Look => ({
  skin: l.skin ?? C.skin[1], hair: l.hair ?? C.ink, hairStyle: l.hat === 'none' ? 'side' : 'short', coat: l.coat, legs: l.trousers ?? '#3A3631',
  hat: (l.hat === 'bonnet' ? 'feather' : l.hat ?? 'none') as Look['hat'], hatColor: l.hatFill ?? l.coat, gown: l.skirt,
  moustache: l.moustache ? 'neat' : 'none', beard: l.beard ? 'pointed' : 'none', vest: l.apron, coatHem: l.skirt ? 0 : -24,
});
export const Person: React.FC<PP & {look: PersonLook}> = ({look, ...p}) => <Puppet {...kp(p, 640)} look_={toLook(look)} seed={look.coat + (look.hat ?? '')} />;
export const Vincenzo: React.FC<PP & {smock?: boolean}> = ({smock = true, ...p}) => <K.Vincenzo {...kp(p, 560)} costume={smock ? 'smock' : 'shirt'} />;
export const Guard: React.FC<PP & {variant: 'tall' | 'short'}> = ({variant, ...p}) => <K.Guard {...kp(p, variant === 'tall' ? 680 : 560)} variant={variant} />;
export const ArtLover: React.FC<PP & {variant: 'tall' | 'medium' | 'short'; monocle?: boolean}> = ({variant, monocle, ...p}) =>
  <K.ArtLover {...kp(p, {tall: 700, medium: 640, short: 560}[variant])} variant={variant} monocle={monocle} />;
export const GUARD_TALL: PersonLook = {coat: C.nightBlue};
export const GUARD_ROUND: PersonLook = {coat: C.nightBlue};
export const ARTLOVER: PersonLook[] = [{coat: C.ink}, {coat: C.ink}, {coat: C.ink}];
// monocle on a ribbon (worn at the right eye; pop 0..1 flings it out)
export const Monocle: React.FC<{pop?: number}> = ({pop = 0}) => (
  <g transform={`translate(${22 + pop * 60},${-616 + pop * 110}) rotate(${pop * 140})`}>
    <circle r={20} fill="rgba(255,255,255,0.35)" stroke={C.oldGold} strokeWidth={5} />
    <path d={`M0,20 Q${-10 - pop * 40},${80 - pop * 60} ${-30 - pop * 20},${140 - pop * 100}`} stroke={C.ink} strokeWidth={2} fill="none" />
  </g>
);

// --- the fame gauge: brass dial "Who knows her?", pictures monocle → newspaper → globe; amber needle tip ---
export const FameGauge: React.FC<{needle: number; fr: number; s?: number}> = ({needle, fr, s = 1}) => {
  const tremble = Math.sin(twos(fr) * 1.7) * 2.5 + (random(`g${twos(fr)}`) - 0.5) * 2;
  const a = -120 + needle * 240 + tremble;
  return (
    <g transform={`scale(${s})`}>
      <circle cx={8} cy={10} r={150} fill="rgba(35,27,22,0.28)" />
      <circle r={150} fill={C.oldGold} stroke={C.ink} strokeWidth={3.5} />
      <circle r={124} fill={C.card} stroke={C.ink} strokeWidth={2.5} />
      {Array.from({length: 13}).map((_, i) => {
        const r = ((-120 + i * 20) * Math.PI) / 180;
        return <line key={i} x1={Math.sin(r) * 104} y1={-Math.cos(r) * 104} x2={Math.sin(r) * 120} y2={-Math.cos(r) * 120} stroke={C.ink} strokeWidth={i % 6 === 0 ? 4 : 2} />;
      })}
      {/* monocle (left), newspaper (top), globe (right) */}
      <g transform="translate(-70,-28)"><circle r={16} fill="none" stroke={C.ink} strokeWidth={3.5} /><path d="M0,16 q-6,16 4,26" stroke={C.ink} strokeWidth={2} fill="none" /></g>
      <g transform="translate(0,-74)"><rect x={-18} y={-13} width={36} height={26} fill={C.paper} stroke={C.ink} strokeWidth={2.5} /><path d="M-12,-5 h24 M-12,2 h24 M-12,8 h14" stroke={C.ink} strokeWidth={2} /></g>
      <g transform="translate(70,-28)"><circle r={17} fill={C.duskBlue} stroke={C.ink} strokeWidth={2.5} /><path d="M-17,0 h34 M0,-17 q-12,17 0,34 q12,-17 0,-34" stroke={C.ink} strokeWidth={2} fill="none" /></g>
      <text y={58} textAnchor="middle" fontFamily={TYPE} fontSize={25} fill={C.ink}>Who knows her?</text>
      <g transform={`rotate(${a})`}>
        <path d="M-6,0 L0,-100 L6,0Z" fill={C.ink} />
        <circle cy={-96} r={7} fill={C.amber} stroke={C.ink} strokeWidth={2} />
      </g>
      <circle r={12} fill={C.oldGold} stroke={C.ink} strokeWidth={2.5} />
    </g>
  );
};

// --- tear-off day calendar: `pages` in order, `idx` (fractional: tearing) ---
export const Calendar: React.FC<{pages: string[]; idx: number; s?: number}> = ({pages, idx, s = 1}) => {
  const i = Math.floor(idx), k = idx - i;
  const cur = pages[Math.min(pages.length - 1, i)], next = pages[Math.min(pages.length - 1, i + 1)];
  const page = (txt: string) => (<>
    <rect x={-110} y={-20} width={220} height={150} fill={C.card} stroke={C.ink} strokeWidth={2.5} />
    <text y={78} textAnchor="middle" fontFamily={TYPE} fontSize={txt.length > 7 ? 36 : 48} fill={C.ink}>{txt}</text>
  </>);
  return (
    <g transform={`scale(${s})`}>
      <rect x={-112} y={-38} width={232} height={180} fill="rgba(35,27,22,0.28)" transform="translate(8,10)" />
      <rect x={-118} y={-44} width={236} height={30} fill={C.clueRed} stroke={C.ink} strokeWidth={2.5} />
      {k > 0 ? page(next) : page(cur)}
      {k > 0 && k < 1 && <g transform={`translate(${k * 260},${-k * 120 + k * k * 400}) rotate(${k * 70})`} opacity={1 - k}>{page(cur)}</g>}
      <circle cx={-70} cy={-29} r={6} fill={C.ink} /><circle cx={70} cy={-29} r={6} fill={C.ink} />
    </g>
  );
};

// --- the "?" (clueRed; its curl is a hook's curve) and the rubber stamp version ---
export const Question: React.FC<{s?: number; o?: number}> = ({s = 1, o = 1}) => (
  <g transform={`scale(${s})`} opacity={o}>
    <path d="M-40,-60 Q-40,-110 0,-110 Q44,-110 44,-66 Q44,-34 10,-20 Q0,-14 0,6 L0,20" fill="none" stroke={C.card} strokeWidth={42} strokeLinecap="round" />
    <path d="M-40,-60 Q-40,-110 0,-110 Q44,-110 44,-66 Q44,-34 10,-20 Q0,-14 0,6 L0,20" fill="none" stroke={C.clueRed} strokeWidth={30} strokeLinecap="round" />
    <circle cy={66} r={22} fill={C.clueRed} stroke={C.card} strokeWidth={6} />
  </g>
);

// --- name tag: card luggage tag swinging on a string from the top ---
export const NameTag: React.FC<{text: string; sub?: string; t: number; x: number; y: number}> = ({text, sub, t, x, y}) => {
  if (t < 0 || t > 3.4) return null;
  const drop = interpolate(t, [0, 0.35], [-500, 0], clamp) + interpolate(t, [3.0, 3.4], [0, -600], clamp);
  const sw = Math.sin(t * 5.2) * 9 * Math.exp(-t * 1.4);
  const wpx = Math.max(text.length, sub?.length ?? 0) * 23 + 80;
  return (
    <g transform={`translate(${x},${y + drop}) rotate(${sw})`}>
      <line x1={0} y1={-900} x2={0} y2={-6} stroke={C.ink} strokeWidth={2.5} />
      <g transform="translate(8,10)"><path d={`M${-wpx / 2},20 L${-wpx / 2 + 30},-6 L${wpx / 2},-6 L${wpx / 2},${sub ? 110 : 76} L${-wpx / 2 + 30},${sub ? 110 : 76} L${-wpx / 2},${sub ? 84 : 50}Z`} fill="rgba(35,27,22,0.28)" /></g>
      <path d={`M${-wpx / 2},20 L${-wpx / 2 + 30},-6 L${wpx / 2},-6 L${wpx / 2},${sub ? 110 : 76} L${-wpx / 2 + 30},${sub ? 110 : 76} L${-wpx / 2},${sub ? 84 : 50}Z`} fill={C.card} stroke={C.ink} strokeWidth={2.5} />
      <circle cx={-wpx / 2 + 24} cy={35} r={7} fill="none" stroke={C.ink} strokeWidth={2.5} />
      <text x={16} y={46} textAnchor="middle" fontFamily={TYPE} fontSize={40} fill={C.ink}>{text}</text>
      {sub && <text x={16} y={90} textAnchor="middle" fontFamily={TYPE} fontSize={30} fill={C.ink} opacity={0.75}>{sub}</text>}
    </g>
  );
};

// --- a printed card label (Special Elite on card), e.g. "Paris, 1911", "Closed on Mondays" ---
export const Label: React.FC<{text: string; size?: number; rot?: number; fill?: string; color?: string}> = ({text, size = 44, rot = 0, fill = C.card, color = C.ink}) => {
  const w = text.length * size * 0.6 + 40;
  return (
    <g transform={`rotate(${rot})`}>
      <rect x={-w / 2 + 6} y={-size * 0.95 + 8} width={w} height={size * 1.5} fill="rgba(35,27,22,0.28)" />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.5} fill={fill} stroke={C.ink} strokeWidth={2.5} />
      <text y={size * 0.28} textAnchor="middle" fontFamily={TYPE} fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// --- the white smock bundle: rounded white bundle with folds, amber leak, her eyes over the top edge ---
export const Bundle: React.FC<{fr: number; leak?: number; eyes?: number; glint?: number; s?: number}> = ({fr, leak = 0.8, eyes = 1, glint = -1, s = 1}) => {
  const pulse = 0.85 + 0.15 * Math.sin(fr * 0.12);
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx={0} cy={0} rx={190} ry={150} fill="url(#amberLeak)" opacity={leak * pulse * 0.8} />
      {eyes > 0 && <g transform={`translate(0,${-118 + (1 - eyes) * 40})`} opacity={eyes}><MonaLisa w={150} crop="eyes" glint={glint} /></g>}
      <Cut d="M-120,-90 Q-140,40 -100,110 Q0,140 100,110 Q140,40 120,-90 Q60,-70 0,-96 Q-60,-70 -120,-90Z" fill={C.smock} />
      <path d="M-90,-60 Q-40,20 -60,100 M30,-80 Q60,0 40,110 M-20,-40 Q10,30 -10,90" stroke={C.paperShade} strokeWidth={5} fill="none" />
      <path d="M-104,-74 Q-60,-58 -40,-80" stroke={C.amber} strokeWidth={6} opacity={leak * pulse} fill="none" />
      <path d="M40,-84 Q80,-64 106,-78" stroke={C.amber} strokeWidth={6} opacity={leak * pulse} fill="none" />
    </g>
  );
};

// paper-painting in the kit style (cartoon Old Master with a dot-eye face that can slide), never a real work
export const PaperPainting: React.FC<{w: number; h: number; seed: number; eyeX?: number; kind?: 'portrait' | 'land' | 'still'}> = ({w, h, seed, eyeX = 0, kind = 'portrait'}) => {
  const bg = [C.sepia, C.duskBlue, '#6E7F5A', '#8A5A4A'][seed % 4];
  const fw = Math.min(w, h) * 0.09;
  return (
    <g>
      <rect x={-w / 2 - fw + 8} y={-fw + 10} width={w + 2 * fw} height={h + 2 * fw} fill="rgba(35,27,22,0.28)" />
      <rect x={-w / 2 - fw} y={-fw} width={w + 2 * fw} height={h + 2 * fw} fill={C.oldGold} stroke={C.ink} strokeWidth={3} />
      <rect x={-w / 2} y={0} width={w} height={h} fill={bg} stroke={C.ink} strokeWidth={2.5} />
      {kind === 'portrait' && <>
        <ellipse cx={0} cy={h * 0.95} rx={w * 0.38} ry={h * 0.4} fill={['#3A2A20', '#5A2A2A', '#2A3A2A', '#2E2A3A'][(seed + 1) % 4]} />
        <ellipse cx={0} cy={h * 0.36} rx={w * 0.17} ry={w * 0.21} fill={C.skin[seed % 3]} stroke={C.ink} strokeWidth={2.5} />
        <circle cx={-w * 0.06 + eyeX * w * 0.04} cy={h * 0.35} r={Math.max(3, w * 0.022)} fill={C.ink} />
        <circle cx={w * 0.06 + eyeX * w * 0.04} cy={h * 0.35} r={Math.max(3, w * 0.022)} fill={C.ink} />
        <path d={`M${-w * 0.04},${h * 0.43} L${w * 0.04},${h * 0.43}`} stroke={C.ink} strokeWidth={2.5} />
      </>}
      {kind === 'land' && <>
        <path d={`M${-w / 2},${h * 0.7} Q${-w * 0.1},${h * 0.4} ${w * 0.2},${h * 0.6} T${w / 2},${h * 0.55} V${h} H${-w / 2}Z`} fill="#6E7F5A" stroke={C.ink} strokeWidth={2} />
        <circle cx={w * 0.25} cy={h * 0.25} r={w * 0.07} fill={C.paper} />
        {/* a little face peering from the hills */}
        <circle cx={-w * 0.2} cy={h * 0.62} r={w * 0.06} fill={C.skin[0]} stroke={C.ink} strokeWidth={2} />
        <circle cx={-w * 0.215 + eyeX * w * 0.02} cy={h * 0.615} r={3} fill={C.ink} /><circle cx={-w * 0.185 + eyeX * w * 0.02} cy={h * 0.615} r={3} fill={C.ink} />
      </>}
      {kind === 'still' && <>
        <rect x={-w * 0.3} y={h * 0.7} width={w * 0.6} height={h * 0.08} fill={C.sepia} />
        <circle cx={-w * 0.1} cy={h * 0.62} r={w * 0.1} fill={C.clueRed} opacity={0.8} stroke={C.ink} strokeWidth={2} />
        <circle cx={w * 0.12} cy={h * 0.6} r={w * 0.12} fill="#C9A24A" stroke={C.ink} strokeWidth={2} />
        <circle cx={w * 0.08 + eyeX * 4} cy={h * 0.58} r={3} fill={C.ink} /><circle cx={w * 0.16 + eyeX * 4} cy={h * 0.58} r={3} fill={C.ink} />
      </>}
    </g>
  );
};

export {C, Cut, Ell, rect, twos};
