// Adapter between part 3's scenes and the shared kit (src/series, copied from stolen-smile-kit/film-kit).
// Kit pieces are used as-is; items the kit snapshot lacks (hooks, ?, !, gauge, calendar, magnifier, pigeon) are
// built here in the kit's style and swapped for the kit's own when they land (PLAN.md "Kit adoption").
import React from 'react';
import {C, FONT} from '../series/tokens';
import {MonaLisa} from '../series/monalisa';
import {Vincenzo, Geri, Police, ArtLover, Spider as KSpider} from '../series/characters';
import {Puppet} from '../series/puppet';
import type {Look, PoseName, Expr} from '../series/puppet';
import {wrect} from '../series/util';

const S = 30;

// ---- part-only people, built from the kit's Puppet with a Look (pictures-pick §3.1) ----
export const LOOK_P3: Record<'poggi' | 'leonardo' | 'king' | 'worker' | 'worker2', Look> = {
  poggi: {skin: C.skin1, hair: C.sepia, hairStyle: 'short', coat: C.suit, coatHem: -32, shoulders: 10, hem: 9.5, shirt: C.shirt, tie: C.ink, legs: C.suit, beard: 'trim', moustache: 'neat', headW: 9.5, headH: 13.5},
  leonardo: {skin: C.skin1, hair: '#EDE8DD', hairStyle: 'whiteLong', coat: '#4B3F55', gown: true, shoulders: 11, hem: 13, legs: C.suit, hat: 'redcap', beard: 'longWhite', moustache: 'none'},
  king: {skin: C.skin1, hair: C.sepia, hairStyle: 'short', coat: C.duskBlue, gown: true, shoulders: 13, hem: 15, legs: C.nightBlue, hat: 'none', beard: 'trim', moustache: 'neat', buttons: C.oldGold, round: 0.6},
  worker: {skin: C.skin3, hair: C.ink, hairStyle: 'short', coat: C.shirt, coatHem: -38, shoulders: 12, hem: 11, vest: C.stone, rolled: true, legs: C.sepia, hat: 'cap', hatColor: C.sepia, moustache: 'bushy'},
  worker2: {skin: C.skin2, hair: C.sepia, hairStyle: 'short', coat: C.shirt, coatHem: -38, shoulders: 11, hem: 10, vest: C.sepia, rolled: true, legs: C.suit, hat: 'beret', hatColor: C.ink, moustache: 'none'},
};
type Who = 'vincenzo' | 'vghost' | 'geri' | 'poggi' | 'leonardo' | 'king' | 'police' | 'police2' | 'artTall' | 'artMed' | 'artShort' | 'worker' | 'worker2';
// one call for every puppet: feet at (0,0) of the current <g>
export const P: React.FC<{who: Who; fr: number; pose?: PoseName; expr?: Expr; facing?: 1 | -1; h?: number; hold?: React.ReactNode; under?: React.ReactNode; look?: [number, number]; costume?: 'smock' | 'shirt' | 'suit'; monocle?: boolean}> =
  ({who, fr, pose = 'stand', expr = 'calm', facing = 1, h, hold, under, look, costume = 'suit', monocle}) => {
    const c = {fr, x: 0, y: 0, pose, expr, facing, hold, under, look};
    switch (who) {
      case 'vincenzo': return <Vincenzo {...c} costume={costume} hatOff={costume === 'suit'} height={h} />;
      case 'vghost': return <Vincenzo {...c} costume="smock" ghost height={h} />;
      case 'geri': return <Geri {...c} height={h} />;
      case 'police': return <Police {...c} force="florence" tone={2} height={h} />;
      case 'police2': return <Police {...c} force="florence" tone={1} height={h} />;
      case 'artTall': return <ArtLover {...c} variant="tall" monocle={monocle ?? true} height={h} />;
      case 'artMed': return <ArtLover {...c} variant="medium" monocle={monocle ?? true} height={h} />;
      case 'artShort': return <ArtLover {...c} variant="short" monocle={monocle ?? true} height={h} />;
      default: {
        const L = LOOK_P3[who as keyof typeof LOOK_P3];
        const H = {poggi: 690, leonardo: 600, king: 620, worker: 620, worker2: 600}[who as keyof typeof LOOK_P3];
        return <Puppet {...c} look_={L} height={h ?? H} seed={who} />;
      }
    }
  };

// The Mona Lisa from the kit, centred at (0,0) of the current <g>.
export const Lisa: React.FC<{fr: number; h: number; glow?: number; glintAt?: number | number[]; board?: 'front' | 'back' | 'edge'; frame?: boolean; glass?: boolean; turn?: number; id?: string; shadow?: boolean}> =
  ({fr, h, ...p}) => <MonaLisa fr={fr} x={0} y={0} height={h} {...p} />;

export const Spider: React.FC<{fr: number; suitcase?: boolean; size?: number; thread?: number}> = ({fr, suitcase, size = 2, thread}) => <KSpider fr={fr} x={0} y={0} size={size} suitcase={suitcase} thread={thread} />;

// ---- the four hooks (pictures-pick §2.1, kit item pending): ink iron S-hooks 34 px, 60 px apart; tags 1-4 ----
export const Hooks: React.FC<{fr: number; tags?: number[]; sway?: number}> = ({fr, tags = [], sway = 0}) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const x = -90 + i * 60;
      const tag = tags[i] ?? 0;
      return (
        <g key={i} transform={`translate(${x} 0) rotate(${sway * Math.sin(fr * 0.3 + i)})`}>
          <path d="M0,-18 v14 c0,10 -12,12 -12,22 c0,10 14,12 18,2" fill="none" stroke={C.card} strokeWidth={10} strokeLinecap="round" />
          <path d="M0,-18 v14 c0,10 -12,12 -12,22 c0,10 14,12 18,2" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          <circle cy={-20} r={4} fill={C.ink} />
          {tag > 0 && <g transform={`translate(0 ${-58 - tag * 6}) scale(${tag})`} opacity={Math.min(1, tag * 2)}>
            <path d={wrect(-17, -17, 34, 34, `ht${i}`, 1)} fill={C.card} stroke={C.ink} strokeWidth={2} />
            <text y={10} textAnchor="middle" fontFamily={FONT.type} fontSize={26} fill={C.ink}>{i + 1}</text>
          </g>}
        </g>
      );
    })}
  </g>
);

// ---- the "?" (its curl is a hook) and the "!" it straightens into: clueRed paper cutouts ----
export const Question: React.FC<{size?: number}> = ({size = 200}) => (
  <g transform={`scale(${size / 200})`} filter="url(#ss-cut)">
    <path d="M-50,-50 C-50,-110 50,-110 50,-50 C50,-10 0,-5 0,35" fill="none" stroke={C.clueRed} strokeWidth={30} strokeLinecap="round" />
    <circle cy={85} r={18} fill={C.clueRed} />
  </g>
);
export const Bang: React.FC<{size?: number}> = ({size = 200}) => (
  <g transform={`scale(${size / 200})`} filter="url(#ss-cut)">
    <path d="M0,-100 L0,35" fill="none" stroke={C.clueRed} strokeWidth={34} strokeLinecap="round" />
    <circle cy={85} r={19} fill={C.clueRed} />
  </g>
);

// typed card label (Special Elite) on a little card
export const Label: React.FC<{text: string; size?: number; rot?: number}> = ({text, size = 44, rot = -1.5}) => {
  const w = text.length * size * 0.6 + 50, h = size * 1.6;
  return (
    <g transform={`rotate(${rot})`}>
      <g filter="url(#ss-shadow-s)"><path d={wrect(-w / 2, -h / 2, w, h, `lb${text}`, 1.2)} fill={C.card} stroke={C.ink} strokeWidth={2.5} /></g>
      <text y={size * 0.35} textAnchor="middle" fontFamily={FONT.type} fontSize={size} fill={C.ink}>{text}</text>
    </g>
  );
};

// magnifying glass (oldGold rim): handle points down-right from the lens centre
export const Magnifier: React.FC<{r?: number}> = ({r = 120}) => (
  <g filter="url(#ss-cut)">
    <path d={`M${r * 0.7},${r * 0.7} L${r * 1.7},${r * 1.7}`} stroke={C.sepia} strokeWidth={r * 0.26} strokeLinecap="round" />
    <circle r={r} fill={C.glass} fillOpacity={0.35} stroke={C.oldGold} strokeWidth={r * 0.16} />
    <path d={`M${-r * 0.55},${-r * 0.3} A${r * 0.62},${r * 0.62} 0 0 1 ${-r * 0.2},${-r * 0.6}`} stroke="#fff" strokeWidth={r * 0.08} fill="none" opacity={0.8} strokeLinecap="round" />
  </g>
);

export const Pigeon: React.FC<{fr: number; flap?: boolean}> = ({fr, flap}) => {
  const w = flap ? (Math.floor(fr / 2) % 2 ? -30 : 20) : 0;
  return (
    <g filter="url(#ss-cut)">
      <ellipse cx={0} cy={-26} rx={36} ry={24} fill={C.stone} stroke={C.ink} strokeWidth={2.5} />
      <circle cx={30} cy={-50} r={14} fill={C.stone} stroke={C.ink} strokeWidth={2.5} />
      <path d="M43,-50 l12,4 -12,3z" fill={C.oldGold} stroke={C.ink} strokeWidth={1.5} />
      <circle cx={33} cy={-53} r={2.5} fill={C.ink} />
      <path d={`M-10,-30 q-30,${-20 + w} -48,${-6 + w}`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <path d="M-4,-4 v8 M8,-4 v8" stroke={C.oldGold} strokeWidth={3} />
    </g>
  );
};

// ---- the fame gauge "Who knows her?" (pictures-pick §2.4, kit item pending) ----
// v 0..1 = needle from monocle to globe (and past, up to 1.15); odo = odometer text (only when the script says one);
// burst 0..1 = glass pops.
export const Gauge: React.FC<{fr: number; v: number; odo?: string; burst?: number; size?: number}> = ({fr, v, odo, burst = 0, size = 1}) => {
  const ang = -120 + Math.min(1.18, v) * 240 + Math.sin(fr * 0.9) * 2 * (v > 1 ? 3 : 1);
  return (
    <g transform={`scale(${size})`}>
      <g filter="url(#ss-cut)">
        <circle r={150} fill={C.oldGold} stroke={C.ink} strokeWidth={3.5} />
        <circle r={124} fill={C.card} stroke={C.ink} strokeWidth={2.5} />
      </g>
      {Array.from({length: 13}, (_, i) => { const a = ((-120 + i * 20) * Math.PI) / 180; return <path key={i} d={`M${Math.sin(a) * 104},${-Math.cos(a) * 104} L${Math.sin(a) * 118},${-Math.cos(a) * 118}`} stroke={C.ink} strokeWidth={i % 6 === 0 ? 4 : 2} />; })}
      {/* monocle, newspaper, globe */}
      <g transform="translate(-78 30)"><circle r={13} fill="none" stroke={C.ink} strokeWidth={3} /><path d="M10,10 q8,14 0,24" stroke={C.ink} strokeWidth={2} fill="none" /></g>
      <g transform="translate(0 -78)"><rect x={-16} y={-12} width={32} height={24} fill={C.paper} stroke={C.ink} strokeWidth={2.5} /><path d="M-10,-5h20M-10,1h20M-10,7h12" stroke={C.ink} strokeWidth={2} /></g>
      <g transform="translate(78 30)"><circle r={15} fill={C.duskBlue} stroke={C.ink} strokeWidth={2.5} /><path d="M-15,0h30M0,-15q-10,15 0,30q10,-15 0,-30" stroke={C.ink} strokeWidth={1.6} fill="none" /></g>
      <text y={-28} textAnchor="middle" fontFamily={FONT.type} fontSize={21} fill={C.ink}>Who knows her?</text>
      {odo && <g transform="translate(0 74)"><rect x={-odo.length * 9 - 10} y={-20} width={odo.length * 18 + 20} height={36} fill={C.ink} rx={4} />
        <text y={9} textAnchor="middle" fontFamily={FONT.type} fontSize={26} fill={C.card}>{odo}</text></g>}
      <g transform={`rotate(${ang})`}><path d="M-6,0 L0,-100 L6,0 Z" fill={C.ink} /><circle cy={-96} r={7} fill={C.amber} stroke={C.ink} strokeWidth={1.5} /></g>
      <circle r={12} fill={C.oldGold} stroke={C.ink} strokeWidth={2.5} />
      {/* glass, and its pop */}
      {burst <= 0 ? <path d="M-80,-60 A100,100 0 0 1 -20,-110" stroke="#fff" strokeWidth={8} fill="none" opacity={0.6} strokeLinecap="round" />
        : Array.from({length: 7}, (_, i) => { const a = (i / 7) * Math.PI * 2; const d = burst * 200; return <path key={i} d="M0,0 l14,-24 l12,26 z" fill={C.glass} stroke={C.ink} strokeWidth={1.5} transform={`translate(${Math.cos(a) * d} ${Math.sin(a) * d + burst * burst * 120}) rotate(${burst * 400 + i * 40})`} opacity={1 - burst} />; })}
    </g>
  );
};

// ---- tear-off calendar (kit item pending): `text` on the current page; `tear` 0..1 flies the previous page off ----
export const Calendar: React.FC<{text: string; prev?: string; tear?: number; w?: number}> = ({text, prev, tear = 1, w = 300}) => (
  <g>
    <g filter="url(#ss-cut)"><path d={wrect(-w / 2, -40, w, 200, `cal${w}`, 1.5)} fill={C.card} stroke={C.ink} strokeWidth={2.5} /></g>
    <rect x={-w / 2} y={-40} width={w} height={44} fill={C.clueRed} stroke={C.ink} strokeWidth={2.5} />
    {[-w / 4, w / 4].map((x) => <circle key={x} cx={x} cy={-40} r={7} fill={C.ink} />)}
    <text y={95} textAnchor="middle" fontFamily={FONT.type} fontSize={text.length > 9 ? 40 : 54} fill={C.ink}>{text}</text>
    {prev && tear < 1 && <g transform={`translate(${tear * 260} ${-tear * 300}) rotate(${tear * 70})`} opacity={1 - tear}>
      <path d={wrect(-w / 2, 4, w, 156, 'calp', 1.5)} fill={C.card} stroke={C.ink} strokeWidth={2.5} />
      <text y={95} textAnchor="middle" fontFamily={FONT.type} fontSize={prev.length > 9 ? 40 : 54} fill={C.ink}>{prev}</text>
    </g>}
  </g>
);
export const SZ = S;
