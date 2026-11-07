// Part 3, lines 9-17: motive on the map -> Leonardo fixes the arrow -> Italy tour -> back on the four hooks ->
// 100,000 in two days -> the cell -> more famous than ever -> today -> the smile.
import React from 'react';
import {random} from 'remotion';
import {Camera, Layer} from '../kit/camera';
import {C as T, FONT} from '../series/tokens';
import {Crowd} from '../series/characters';
import {PaperMap, MAP_CITIES, SalonCarre, HER, PrisonCell, ModernLouvre, MODERN_HER} from '../series/sets';
import {FameGauge, Calendar as KCal, Newspaper, Postcard} from '../series/props';
import {B, pr, win, lerp, two, keys, inOut} from './util';
import {Cut, rect, wrect, Chalk, Eraser, Tally, Confetti, TourPoster, NoteBundle} from './props';
import {Wall, Floor, Dust} from './scenesA';
import * as K from './K';

type S = {t: number; fr: number};
const F = (s: number) => Math.round(s * 30);
const TYPE = FONT.type;

// ---------- the paper map of France and Italy (world coords: France top-left, Italy boot bottom-right) ----------
const PARIS = MAP_CITIES.Paris, FLORENCE = MAP_CITIES.Florence, ROME = MAP_CITIES.Rome, MILAN = MAP_CITIES.Milan;
export const MapWorld: React.FC<{t: number; fr: number; dot?: [number, number]}> = ({t, fr, dot}) => (
  <g>
    <Layer depth={0.2}><PaperMap fr={fr} only={['backdrop']} /></Layer>
    <PaperMap fr={fr} only={['mid']} dot={dot} />
    {/* a little boat sailing along the bottom edge of the map (independent mover) */}
    <g transform={`translate(${100 + ((t * 22) % 500)} ${1660 + Math.sin(t * 2) * 6})`}><Cut d="M-40,0 h80 l-14,22 h-52 z" fill={T.sepia} /><path d="M0,0 v-60 l36,48 z" fill={T.card} stroke={T.ink} strokeWidth={2.5} /></g>
    <Dust t={t} x={0} y={300} w={1080} h={1400} seed="md" col={T.card} n={14} />
    {/* paper clouds drifting over the map at their own speeds */}
    {Array.from({length: 4}, (_, i) => <g key={i} transform={`translate(${-200 + ((t * (25 + i * 9) + i * 330) % 1400)} ${450 + i * 330})`} opacity={0.85}><Cut d={`M-80,0 q0,-50 50,-40 q20,-40 60,-10 q50,-10 50,40 z`} fill={T.card} sw={2.5} /></g>)}
    {Array.from({length: 5}, (_, i) => <path key={`g${i}`} d={`M${((t * (90 + i * 20) + i * 210) % 1300) - 100},${380 + i * 230 + Math.sin(t * 2 + i) * 20} q12,${(Math.floor(t * 8 + i) % 2) ? -10 : 8} 24,0 q12,${(Math.floor(t * 8 + i) % 2) ? -10 : 8} 24,0`} stroke={T.ink} strokeWidth={3} fill="none" />)}
  </g>
);
// an arrow drawn on the map (chalk = white with ink edge; `k` draws it on), dashed or solid
const ArrowPath: React.FC<{d: string; k: number; dashed?: boolean; col?: string; w?: number}> = ({d, k, dashed, col = '#FBFAF4', w = 12}) => (
  <g>
    <path d={d} fill="none" stroke={T.ink} strokeWidth={w + 6} pathLength={1} strokeDasharray={`${k} 1`} strokeLinecap="round" opacity={0.5} />
    <path d={d} fill="none" stroke={col} strokeWidth={w} pathLength={1} strokeDasharray={dashed ? undefined : `${k} 1`} strokeLinecap="round"
      style={dashed ? {strokeDasharray: `0.03 0.025`, clipPath: undefined} : undefined} opacity={dashed ? (k > 0 ? 1 : 0) : 1} mask={dashed ? undefined : undefined} />
  </g>
);
const P_IT_FR = `M${FLORENCE[0]},${FLORENCE[1]} C720,1100 600,800 ${PARIS[0] + 20},${PARIS[1] + 30}`;

export const Motive: React.FC<S> = ({t, fr}) => {
  const a = B.l8;
  const draw = pr(t, B.stolen - 0.2, 1.2, inOut);
  const erase = pr(t, B.nottrue - 0.1, 0.9, inOut);
  const leoWalk = pr(t, B.leo - 0.4, 2.6, inOut);
  const leoPos = (k: number): [number, number] => {
    // along the Florence -> Paris curve (cubic bezier)
    const p0 = FLORENCE, p1 = [720, 1100], p2 = [600, 800], p3 = [PARIS[0] + 20, PARIS[1] + 30];
    const u = 1 - k; const f = (i: number) => u * u * u * p0[i] + 3 * u * u * k * p1[i] + 3 * u * k * k * p2[i] + k * k * k * p3[i];
    return [f(0), f(1)];
  };
  const [lx, ly] = leoPos(leoWalk);
  const solid = pr(t, B.leo - 0.2, 2.6, inOut);
  const king = pr(t, B.king - 0.3, 0.5);
  const bubble = win(t, B.why + 0.9, B.nottrue + 0.1, 0.3);
  const cam = keys([[a, {zoom: 3.5, y: 900, x: 600}], [a + 0.8, {zoom: 1.0, x: 600, y: 1000}], [B.italy, {zoom: 1.05, x: 620, y: 1000}], [B.stolen - 0.2, {zoom: 1.35, x: 720, y: 1000}], [B.stolen + 1.2, {zoom: 1.1, x: 640, y: 980}], [B.nottrue, {zoom: 1.1, x: 640, y: 980}], [B.leo, {zoom: 1.25, x: 760, y: 1200}],
    [B.france, {zoom: 1.2, x: 560, y: 860}], [B.king + 0.6, {zoom: 1.3, x: 440, y: 760}], [B.l10 - 0.3, {zoom: 1.0, x: 640, y: 1050}], [B.l10, {zoom: 1.0, x: 650, y: 1060}]]);
  return (
    <Camera fr={fr} keys={cam} background={T.sepia}>
      <MapWorld t={t} fr={fr} />
      {/* Vincenzo's dotted claim: Italy -> France "stolen?" */}
      <g opacity={1 - erase}>
        <path d={P_IT_FR} fill="none" stroke="#FBFAF4" strokeWidth={12} strokeDasharray="24 22" strokeLinecap="round" pathLength={1000}
          style={{strokeDashoffset: 0}} clipPath="url(#drawclip)" opacity={draw > 0 ? 1 : 0} />
        <defs><clipPath id="drawclip"><circle cx={FLORENCE[0]} cy={FLORENCE[1]} r={draw * 900} /></clipPath></defs>
        {draw > 0.9 && <g transform="translate(640 900) rotate(-40)"><text fontFamily={TYPE} fontSize={58} fill="#FBFAF4" stroke={T.ink} strokeWidth={1.5}>stolen?</text></g>}
      </g>
      {/* eraser rubs it out; chalk dust */}
      {erase > 0 && erase < 1 && <g transform={`translate(${lerp(790, 440, erase) + Math.sin(erase * 40) * 40} ${lerp(1290, 650, erase)}) rotate(-30)`}><Eraser /></g>}
      {erase > 0 && erase < 1 && <g transform={`translate(${lerp(790, 440, erase)} ${lerp(1290, 650, erase)})`}><Confetti p={(erase * 5) % 1} n={8} spread={70} seed={`er${Math.floor(erase * 5)}`} /></g>}
      {/* his claim acted out: a little copy of her hops from Paris down to Italy, a heart pops */}
      {t > B.italy - 0.3 && t < B.nottrue + 0.3 && (() => { const k = pr(t, B.italy - 0.3, 1.1, inOut); const x = lerp(PARIS[0], FLORENCE[0], k), y = lerp(PARIS[1], FLORENCE[1], k) - Math.sin(k * Math.PI) * 260;
        const hk = pr(t, B.italy + 0.8, 0.4); return <g opacity={1 - pr(t, B.nottrue, 0.3)}><g transform={`translate(${x} ${y}) rotate(${Math.sin(k * Math.PI * 2) * 15})`}><K.Lisa fr={fr} h={110} glow={0.5} id="hop" /></g>
          {hk > 0 && <g transform={`translate(${FLORENCE[0] + 70} ${FLORENCE[1] - 90 - hk * 40}) scale(${hk * (1 + 0.1 * Math.sin(t * 8))})`}><path d="M0,10 C-30,-20 -10,-40 0,-20 C10,-40 30,-20 0,10 Z" fill={T.clueRed} stroke={T.ink} strokeWidth={2.5} transform="scale(1.6)" /></g>}</g>; })()}
      {/* Leonardo's true route: solid, Florence -> Paris, drawn behind him */}
      <ArrowPath d={P_IT_FR} k={solid} col={T.amberGlow} w={10} />
      {solid > 0.98 && <path d={`M${PARIS[0] + 20},${PARIS[1] + 30} l46,8 M${PARIS[0] + 20},${PARIS[1] + 30} l18,42`} stroke={T.amberGlow} strokeWidth={10} strokeLinecap="round" />}
      {/* Vincenzo at the map, hand on heart, with his daydream bubble (boot-shaped, confetti, a tiny band) */}
      <g transform={`translate(${lerp(1100, 980, pr(t, a, 0.6))} 1120)`}><K.P who="vincenzo" fr={fr} h={360} pose={t < B.nottrue ? (t > B.stolen - 0.3 && t < B.stolen + 1 ? 'point' : 'heartHand') : 'shrug'} expr={t < B.nottrue ? 'smile' : 'worried'} facing={-1} /></g>
      {bubble > 0 && <g transform={`translate(900 600) scale(${bubble * 1.3})`} opacity={bubble}>
        {[0, 1, 2].map((i) => <circle key={i} cx={-10 - i * 14} cy={200 + i * 60} r={14 - i * 4} fill={T.card} stroke={T.ink} strokeWidth={2.5} />)}
        <g filter="url(#ss-shadow)"><ellipse cx={-90} cy={0} rx={200} ry={170} fill={T.card} stroke={T.ink} strokeWidth={3} /></g>
        <g transform="translate(-90 -10)"><K.Lisa fr={fr} h={130} glow={0.15} id="bub" /></g>
        <g transform={`translate(-260 ${150 - Math.abs(Math.sin(two(t) * 6)) * 10}) scale(0.5)`}><Crowd fr={fr * 2} x={0} y={0} w={680} rows={2} perRow={7} dy={50} scale={1} seed={88} /></g>
        <g transform="translate(-90 -40)"><Confetti p={((t - B.italy) * 0.8) % 1} n={14} spread={170} seed={`bub${Math.floor((t - B.italy) * 0.8)}`} /></g>
        {[-200, 20].map((x, i) => <g key={x} transform={`translate(${x} ${70 + Math.sin(two(t) * 8 + i) * 6})`}><Cut d="M-14,0 h28 v-20 l12,-10 v40 h-40 z" fill={T.oldGold} sw={2} shadow={false} /></g>)}
      </g>}
      {/* Leonardo walks the route carrying her */}
      {leoWalk > 0 && <g transform={`translate(${lx} ${ly + 60})`}>
        <K.P who="leonardo" fr={fr} h={300} pose={leoWalk < 1 ? 'carryWalk' : t > B.king ? 'holdUp' : 'stand'} expr="smile" facing={-1}
          under={t < B.king - 0.2 ? <K.Lisa fr={fr} h={80} glow={0.6} id="leo" /> : undefined} />
      </g>}
      {/* the French king receives her and hands over a purse */}
      {king > 0 && <g transform={`translate(${PARIS[0] - 140} ${PARIS[1] + 180})`} opacity={king}>
        <K.P who="king" fr={fr} h={320} pose={t > B.king + 0.3 ? 'holdUp' : 'reach'} expr="happy" hold={t > B.king + 0.3 ? <K.Lisa fr={fr} h={80} glow={0.7} id="king" /> : undefined} />
        {/* crown */}
        <g transform="translate(0 -310)"><Cut d="M-30,0 l0,-34 l15,18 l15,-26 l15,26 l15,-18 l0,34 z" fill="#D9B45A" sw={2.5} /></g>
        {/* the purse travels to Leonardo */}
        <g transform={`translate(${lerp(40, 170, pr(t, B.king + 0.5, 0.6))} ${-150 - Math.sin(pr(t, B.king + 0.5, 0.6) * Math.PI) * 60})`}><Cut d="M-22,0 q-6,-30 22,-34 q28,4 22,34 z" fill={T.sepia} sw={2.5} /><path d="M-10,-30 l10,-8 l10,8" stroke={T.ink} strokeWidth={2.5} fill="none" />
          {[0, 1, 2].map((i) => <circle key={i} cx={-12 + i * 12} cy={-40 - i * 6} r={9} fill="#D9B45A" stroke={T.ink} strokeWidth={2} />)}</g>
        {t > B.king + 0.3 && <g transform="translate(60 70)" opacity={pr(t, B.king + 0.3, 0.3)}><K.Label text="bought" size={42} rot={-5} /></g>}
      </g>}
    </Camera>
  );
};

// ---------- 11. The Italy tour: pop-up galleries at Florence, Rome, Milan; the gauge climbs ----------
const PopGallery: React.FC<{fr: number; k: number; seed: number}> = ({fr, k, seed}) => (
  <g transform={`scale(1 ${Math.max(0.001, k)})`} opacity={Math.min(1, k * 3)}>
    <Cut d="M-170,0 v-210 l170,-70 l170,70 v210 z" fill={T.paper} sw={3} />
    <Cut d={rect(-150, -200, 300, 200)} fill={T.paperShade} sw={2.5} shadow={false} />
    <g transform="translate(0 -130)"><K.Lisa fr={fr} h={110} glow={0.6} id={`pg${seed}`} /></g>
    <g transform="translate(-170 -10) scale(0.55)"><Crowd fr={fr} x={10} y={0} w={600} rows={2} perRow={7} dy={50} scale={1} seed={seed} /></g>
  </g>
);
export const Tour: React.FC<S> = ({t, fr}) => {
  const a = B.l10;
  const cities = [FLORENCE, ROME, MILAN];
  const ks = [pr(t, B.showsoff - 0.4, 0.5), pr(t, B.showsoff + 0.6, 0.5), pr(t, B.crowds + 0.2, 0.5)];
  const toParis = pr(t, B.l11 - 0.9, 0.8, inOut);
  const gauge = 0.55 + 0.12 * (ks[0] + ks[1] + ks[2]);
  const dot = (() => {
    const idx = t < B.showsoff + 0.6 ? 0 : t < B.crowds + 0.2 ? 1 : 2;
    const p = idx === 0 ? FLORENCE : idx === 1 ? lerpP(FLORENCE, ROME, pr(t, B.showsoff + 0.1, 0.5)) : lerpP(ROME, MILAN, pr(t, B.crowds - 0.3, 0.5));
    return toParis > 0 ? lerpP(MILAN, PARIS, toParis) : p;
  })();
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 1.0, x: 650, y: 1060}], [B.showsoff, {zoom: 1.3, x: 800, y: 1300}], [B.crowds, {zoom: 1.25, x: 760, y: 1220}], [B.l11 - 0.9, {zoom: 1.15, x: 600, y: 960}], [B.l11 - 0.25, {zoom: 1.8, x: PARIS[0], y: PARIS[1]}], [B.l11, {zoom: 5, x: PARIS[0], y: PARIS[1]}]])} background={T.duskBlue}>
      <MapWorld t={t} fr={fr} />
      <path d={`M${FLORENCE[0]},${FLORENCE[1]} L${ROME[0]},${ROME[1]} L${MILAN[0]},${MILAN[1]}`} fill="none" stroke={T.amber} strokeWidth={8} strokeDasharray="20 16" opacity={0.85} />
      {toParis > 0 && <path d={`M${MILAN[0]},${MILAN[1]} Q560,800 ${PARIS[0]},${PARIS[1]}`} fill="none" stroke={T.amber} strokeWidth={8} pathLength={1} strokeDasharray={`${toParis} 1`} />}
      {toParis > 0.9 && <circle cx={PARIS[0]} cy={PARIS[1]} r={46} fill="none" stroke={T.clueRed} strokeWidth={8} pathLength={1} strokeDasharray={`${pr(t, B.l11 - 0.2, 0.2)} 1`} />}
      <g transform={`translate(${lerp(-300, 330, pr(t, a + 0.1, 0.6))} 1430) rotate(-6) scale(0.4)`}><TourPoster lit={ks} /></g>
      {cities.map((c, i) => <g key={i} transform={`translate(${c[0] + [-150, -130, -150][i]} ${c[1] - 10})`}><PopGallery fr={fr} k={ks[i]} seed={20 + i} /></g>)}
      <g transform={`translate(${dot[0]} ${dot[1]})`}><circle r={26} fill="url(#ss-amber)" /><circle r={12} fill={T.amber} stroke={T.ink} strokeWidth={2} /></g>
      <Layer depth={1.25}>
        <FameGauge fr={fr} x={880} y={880} value={gauge} size={0.7} tremble={2} />
      </Layer>
    </Camera>
  );
};
const lerpP = (a: [number, number], b: [number, number], k: number): [number, number] => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------- 12 + 13. The Salon Carré (kit set): the spider leaves, she is hung back on the four hooks; then the crowd ----------
const Doors: React.FC<{open: number}> = ({open}) => (
  <g>
    <Cut d={rect(-130, -400, 260, 400, 8)} fill={T.amberGlow} sw={3} shadow={false} />
    <g transform={`translate(-130 0) scale(${1 - open * 0.85} 1)`}><Cut d={rect(0, -400, 130, 400, 4)} fill={T.sepia} sw={3} /></g>
    <g transform={`translate(130 0) scale(${-(1 - open * 0.85)} 1)`}><Cut d={rect(0, -400, 130, 400, 4)} fill={T.sepia} sw={3} /></g>
    <Cut d={rect(-150, -430, 300, 36, 4)} fill={T.stone} sw={3} />
  </g>
);
export const Salon: React.FC<S> = ({t, fr}) => {
  const a = B.l11;
  const spider = pr(t, B.jan + 0.4, 1.4, inOut);
  const sweep = pr(t, B.jan + 1.3, 0.7, inOut);
  const lift = pr(t, B.wall - 0.9, 1.0, inOut);
  const countAt = F(B.wall + 0.2);
  const doors = pr(t, B.twodays - 0.15, 0.5, inOut);
  const flood = pr(t, B.twodays, 3.5, (k) => k);
  const tiles = pr(t, B.hundred + 0.9, 0.9);
  const gv = 0.9 + 0.15 * pr(t, B.hundred - 0.1, 0.6);
  const hung = lift >= 1;
  const state = sweep < 1 ? 'empty+web' : 'empty';
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 3.5, x: 420, y: 620}], [a + 0.9, {zoom: 1.05, x: 540, y: 1000}], [B.jan + 0.5, {zoom: 1.6, x: 520, y: 860}], [B.wall - 0.6, {zoom: 1.35, x: 540, y: 1000}],
      [B.wall + 0.3, {zoom: 2.3, x: 540, y: 930}], [B.paris + 0.3, {zoom: 2.2, x: 540, y: 950}], [B.twodays + 0.3, {zoom: 1.0, x: 540, y: 1000}], [B.hundred, {zoom: 0.92, x: 540, y: 1020}], [B.l13 - 0.4, {zoom: 1.1, x: 300, y: 560}], [B.l13, {zoom: 4.2, x: 300, y: 560}]])} background={T.paperShade}>
      <Layer depth={0.2}><SalonCarre fr={fr} only={['backdrop']} light="day" /></Layer>
      <SalonCarre fr={fr} only={['mid']} light="day" state={hung ? 'with-her' : state} web={1 - sweep} hookCountAt={countAt} herGlow={0.55 + 0.3 * pr(t, B.paris, 0.5) + 0.15 * flood} glintAt={[F(B.paris + 0.3)]} />
      <g transform="translate(-60 1456)"><Doors open={doors} /></g>
      <SalonCarre fr={fr} only={['actors']} state="empty" />
      {/* the kit's hooks again, at actor depth over her spot, so the count and her hanging line up (same look, same count) */}
      <g>
        <g transform={`translate(${HER.x + lerp(10, 640, spider)} ${HER.hookY + lerp(30, 10, spider)})`}><K.Spider fr={fr} size={2} suitcase={spider > 0} /></g>
        {sweep > 0 && sweep < 1 && <g transform={`translate(${HER.x + lerp(-240, 240, sweep)} ${HER.hookY + 40}) rotate(${-30 + Math.sin(sweep * 20) * 15})`}><path d="M0,-260 L0,0" stroke={T.sepia} strokeWidth={12} /><Cut d="M-40,0 h80 l20,60 h-120 z" fill="#D9B45A" sw={2.5} /></g>}
      </g>
      {/* the calendar */}
      <KCal fr={fr} x={340} y={640} size={1.2} pages={['1913', 'January 1914']} tearAt={[F(B.jan + 0.1)]} />
      {/* two workers carry her in and lift her up onto the hooks */}
      {t < B.paris + 1.0 && <g>
        <g transform={`translate(${lerp(-150, 340, pr(t, B.wall - 2.4, 1.3, inOut))} 1560)`}><K.P who="worker" fr={fr} pose={lift > 0 ? 'holdUp' : 'walk'} expr="smile" /></g>
        <g transform={`translate(${lerp(1230, 740, pr(t, B.wall - 2.4, 1.3, inOut))} 1580)`}><K.P who="worker2" fr={fr} pose={lift > 0 ? 'holdUp' : 'walk'} expr="smile" facing={-1} /></g>
      </g>}
      {t > B.wall - 2.4 && !hung && <g transform={`translate(${lerp(lerp(-150, 540, pr(t, B.wall - 2.4, 1.3, inOut)), 540, lift)} ${lerp(1230, HER.y, lift) - (lift < 1 && lift > 0 ? Math.sin(lift * Math.PI) * 30 : 0)})`}>
        <K.Lisa fr={fr} h={HER.h} glow={0.45 + 0.3 * pr(t, B.paris, 0.5) + 0.25 * flood} glintAt={[F(B.paris + 0.3)]} id="salon" />
      </g>}
      {/* the crowd floods in through the doors */}
      {flood > 0 && <g>
        <g transform={`translate(0 ${lerp(160, 0, Math.min(1, flood * 2))})`} opacity={Math.min(1, flood * 3)}>
          <Crowd fr={fr} x={-40} y={1820} w={1160} rows={Math.ceil(1 + flood * 4)} perRow={9} dy={62} scale={1.25} seed={41} />
        </g>
        {Array.from({length: 10}, (_, i) => { const k = pr(t, B.twodays + 0.2 + i * 0.28, 1.6, (q) => q); return k > 0 && k < 1 ? <g key={i} transform={`translate(${-120 + 300 * k + (random(`fl${i}`) - 0.5) * 200 * k} ${1440 + k * 300})`}><g transform={`scale(${0.5 + k})`}><Crowd fr={fr} x={-30} y={0} w={60} rows={1} perRow={1} seed={70 + i} scale={1} /></g></g> : null; })}
      </g>}
      <Layer depth={1.25}>
        <g transform={`translate(0 ${lerp(1600, 0, pr(t, B.twodays + 0.2, 0.6))})`}>
          <FameGauge fr={fr} x={820} y={640} value={gv} size={1.1} odometer={t > B.hundred - 0.1 ? '100,000+' : undefined} odoAt={F(B.hundred - 0.1)} tremble={3} />
          {tiles > 0 && Array.from({length: 7}, (_, i) => { const k = pr(t, B.hundred + 0.9 + i * 0.07, 0.7, (q) => q); const an = -Math.PI / 2 + (random(`tl${i}`) - 0.5) * 2.4; return <g key={i} transform={`translate(${820 + Math.cos(an) * 260 * k} ${700 + Math.sin(an) * 260 * k + k * k * 200}) rotate(${k * 300})`} opacity={1 - k * 0.3}><rect x={-18} y={-22} width={36} height={44} fill={T.ink} rx={4} /><text y={12} textAnchor="middle" fontFamily={TYPE} fontSize={30} fill={T.card}>{'100000+'[i]}</text></g>; })}
        </g>
        <g opacity={1 - pr(t, B.l13 - 0.6, 0.3)}><KCal fr={fr} x={250} y={lerp(-300, 520, pr(t, B.twodays, 0.5))} size={1.2} pages={['2 days']} /></g>
      </Layer>
    </Camera>
  );
};

// ---------- 14. The cell (kit set): about seven months; her postcard on the wall ----------
export const Cell: React.FC<S> = ({t, fr}) => {
  const a = B.l13;
  const tally = pr(t, B.seven - 0.6, 1.4, (k) => k) * 7;
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 3.0, x: 760, y: 860}], [a + 0.8, {zoom: 1.05, x: 540, y: 1000}], [B.seven + 0.4, {zoom: 1.15, x: 600, y: 960}], [B.l14 - 0.35, {zoom: 1.8, x: 860, y: 860}], [B.l14, {zoom: 4.5, x: 860, y: 860}]])} background={T.nightBlue}>
      <Layer depth={0.2}><PrisonCell fr={fr} only={['backdrop']} /></Layer>
      <PrisonCell fr={fr} only={['mid']} tally={tally} postcard={<Postcard fr={fr} x={0} y={0} size={0.75} gag="plain" />} />
      <PrisonCell fr={fr} only={['actors']} />
      <Dust t={t} x={300} y={600} w={500} h={900} seed="cd" col={T.card} n={14} />
      <g transform="translate(860 860)">{t > B.seven + 0.4 && t < B.seven + 0.75 && <circle r={40} fill="url(#ss-amber-soft)" />}</g>
      <g transform="translate(220 1500)"><K.P who="vincenzo" fr={fr} costume="shirt" pose={t > B.seven + 0.8 ? 'sigh' : 'sit'} expr={t > B.seven + 0.8 ? 'smile' : 'sad'} look={[1.5, -1]} /></g>
      <Layer depth={1.25}><KCal fr={fr} x={640} y={lerp(-300, 1220, pr(t, B.seven - 0.2, 0.4))} size={1.3} pages={['about 7 months']} />
        {[20, 1060].map((x) => <Cut key={x} d={rect(x - 18, -300, 36, 2500)} fill="#4A4540" sw={3} />)}</Layer>
    </Camera>
  );
};

// ---------- 15. More famous than ever: the Salon full, newspapers, the art lovers on tiptoe, the gauge pops ----------
export const Famous: React.FC<S> = ({t, fr}) => {
  const a = B.l14;
  const papers = [0, 1, 2].map((i) => pr(t, B.famous - 0.6 + i * 0.25, 0.4));
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 3.0, x: 540, y: 1000}], [a + 0.9, {zoom: 1.0, x: 540, y: 1060}], [B.l15 - 0.5, {zoom: 0.9, x: 540, y: 1080}], [B.l15, {zoom: 0.88, x: 540, y: 1080}]])} background={T.paperShade}>
      <Layer depth={0.2}><SalonCarre fr={fr} only={['backdrop']} light="day" /></Layer>
      <SalonCarre fr={fr} only={['mid']} light="day" state="with-her" herGlow={0.8 + 0.2 * pr(t, B.famous, 0.6)} glintAt={[F(B.famous + 0.4)]} />
      <SalonCarre fr={fr} only={['actors']} state="empty" />
      {papers.map((k, i) => <Newspaper key={i} fr={fr} x={[170, 900, 560][i]} y={lerp(2100, [1360, 1400, 1480][i], k)} size={0.55} rot={[-8, 7, -3][i]} headline="She's back!" />)}
      <Crowd fr={fr} x={-60} y={1820} w={1200} rows={4} perRow={10} dy={70} scale={1.35} seed={51} />
      <Layer depth={1.2}>
        <g transform={`translate(110 ${1870 - Math.abs(Math.sin(two(t) * 5)) * 20})`}><K.P who="artTall" fr={fr} h={560} pose="peer" expr="worried" /></g>
        <g transform={`translate(250 ${1900 - Math.abs(Math.sin(two(t) * 5 + 1)) * 22})`}><K.P who="artMed" fr={fr} h={500} pose="armsUp" expr="worried" /></g>
        <g transform={`translate(380 ${1920 - Math.abs(Math.sin(two(t) * 5 + 2)) * 26})`}><K.P who="artShort" fr={fr} h={460} pose="peer" expr="sad" monocle={false} /></g>
        <FameGauge fr={fr} x={840} y={760} value={1.0 + 0.2 * pr(t, a + 0.3, 1.2)} tremble={6} odometer="100,000+" burstAt={F(B.famous + 0.1)} size={0.95} smoke={pr(t, B.famous, 0.5)} />
      </Layer>
    </Camera>
  );
};

// ---------- 16 + 17. Today (kit set): phones, millions every year; the ghost of Vincenzo; push into her smile ----------
export const Today: React.FC<S> = ({t, fr}) => {
  const a = B.l15;
  const ghost = win(t, B.stole - 0.2, B.stole + 1.8, 0.4);
  const push = pr(t, B.smile2 - 1.2, 2.0, inOut);
  const smY = MODERN_HER.y - MODERN_HER.h / 2 + 0.3 * MODERN_HER.h;
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 0.95, x: 540, y: 1000}], [B.millions, {zoom: 1.0, x: 540, y: 980}], [B.stole, {zoom: 1.12, x: 540, y: 940}], [B.smile2, {zoom: 2.0, x: 540, y: MODERN_HER.y - 20}], [B.end + 1.4, {zoom: 2.15, x: 540, y: MODERN_HER.y - 30}]])} background={T.paper}>
      <Layer depth={0.2}><ModernLouvre fr={fr} only={['backdrop']} /></Layer>
      <ModernLouvre fr={fr} only={['mid']} herGlow={0.6 + 0.4 * push} glintAt={[F(B.end - 0.2)]} />
      {/* the museum's wall label: the payoff in print */}
      <g transform={`translate(540 ${MODERN_HER.y - MODERN_HER.h / 2 - 50})`} opacity={pr(t, B.smile2 - 0.3, 0.4)}><K.Label text="The most famous smile in the world" size={20} rot={0} /></g>
      {/* the ghost of Vincenzo in his white smock tips his cap */}
      {ghost > 0 && <g transform="translate(860 1500)" opacity={ghost}><K.P who="vghost" fr={fr} h={460} pose="tipCap" expr="smile" facing={-1} /></g>}
      <ModernLouvre fr={fr} only={['actors']} flashAt={F(a)} flow={0.8} />
      <Layer depth={1.2}><g opacity={1 - pr(t, B.stole - 0.4, 0.4)}><FameGauge fr={fr} x={860} y={1260} value={1.1} tremble={4} odometer={t > B.millions - 0.1 ? 'millions every year' : '100,000+'} size={0.8} /></g></Layer>
      {void smY}
    </Camera>
  );
};
void NoteBundle; void Chalk;
