// Part 3, lines 9-17: motive on the map -> Leonardo fixes the arrow -> Italy tour -> back on the four hooks ->
// 100,000 in two days -> the cell -> more famous than ever -> today -> the smile.
import React from 'react';
import {random} from 'remotion';
import {Camera, Layer} from '../kit/camera';
import {C as T, FONT} from '../series/tokens';
import {Crowd} from '../series/characters';
import {B, pr, win, lerp, two, keys, inOut} from './util';
import {Cut, rect, wrect, Chalk, Eraser, Tally, Confetti, TourPoster, NoteBundle} from './props';
import {Wall, Floor, Dust} from './scenesA';
import * as K from './K';

type S = {t: number; fr: number};
const F = (s: number) => Math.round(s * 30);
const TYPE = FONT.type;

// ---------- the paper map of France and Italy (world coords: France top-left, Italy boot bottom-right) ----------
const FRANCE = 'M120,300 L420,240 L560,330 L600,520 L540,700 L600,820 L420,900 L250,860 L180,700 L80,600 L150,470 Z';
const ITALY = 'M600,820 L700,760 L820,800 L830,900 L900,1040 L1000,1160 L1080,1240 L1060,1300 L990,1270 L1000,1380 L940,1440 L960,1330 L880,1220 L800,1120 L720,1000 L640,930 Z';
const PARIS: [number, number] = [380, 420], FLORENCE: [number, number] = [790, 1010], ROME: [number, number] = [880, 1170], MILAN: [number, number] = [720, 860];
export const MapWorld: React.FC<{t: number; fr: number}> = ({t, fr}) => (
  <g>
    <rect x={-400} y={-300} width={2000} height={2200} fill={T.duskBlue} opacity={0.55} />
    {/* sea waves */}
    {Array.from({length: 26}, (_, i) => { const x = -300 + (i % 6) * 320 + ((t * 14 + i * 37) % 60), y = -200 + Math.floor(i / 6) * 420 + (i % 3) * 90; return <path key={i} d={`M${x},${y} q20,-12 40,0 q20,12 40,0`} stroke={T.card} strokeWidth={3} fill="none" opacity={0.45} />; })}
    <g filter="url(#ss-shadow)">
      <path d={wrect(-200, -100, 1500, 1800, 'mapsheet', 6)} fill={T.paper} opacity={0} />
      <path d={FRANCE} fill={T.paper} stroke={T.ink} strokeWidth={4} strokeLinejoin="round" />
      <path d={ITALY} fill={T.paperShade} stroke={T.ink} strokeWidth={4} strokeLinejoin="round" />
      {/* Alps */}
      {Array.from({length: 6}, (_, i) => <path key={i} d={`M${560 + i * 50},${790 - (i % 2) * 20} l30,-60 l30,60 z`} fill={T.stone} stroke={T.ink} strokeWidth={3} />)}
      {Array.from({length: 6}, (_, i) => <path key={`s${i}`} d={`M${580 + i * 50},${744 - (i % 2) * 20} l10,-20 l10,20 z`} fill={T.card} />)}
    </g>
    <path d="M150,470 L600,520" stroke={T.ink} strokeWidth={2} strokeDasharray="6 10" opacity={0.25} />
    {([['France', 300, 640], ['Italy', 900, 1330]] as const).map(([n, x, y]) => <text key={n} x={x} y={y} textAnchor="middle" fontFamily={FONT.display} fontWeight={900} fontSize={70} fill={T.ink} opacity={0.75}>{n}</text>)}
    {([['Paris', PARIS], ['Florence', FLORENCE], ['Rome', ROME], ['Milan', MILAN]] as const).map(([n, p]) => (
      <g key={n} transform={`translate(${p[0]} ${p[1]})`}><circle r={11} fill={T.ink} /><text x={18} y={-14} fontFamily={TYPE} fontSize={36} fill={T.ink}>{n}</text></g>
    ))}
    {/* a little boat on the sea (independent mover) */}
    <g transform={`translate(${100 + ((t * 18) % 400)} ${1250 + Math.sin(t * 2) * 6})`}><Cut d="M-40,0 h80 l-14,22 h-52 z" fill={T.sepia} /><path d="M0,0 v-60 l36,48 z" fill={T.card} stroke={T.ink} strokeWidth={2.5} /></g>
    <Dust t={t} x={0} y={0} w={1200} h={1500} seed="md" col={T.card} n={14} />
    {void fr}
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
const P_IT_FR = `M${FLORENCE[0]},${FLORENCE[1]} C700,900 560,700 ${PARIS[0] + 20},${PARIS[1] + 30}`;

export const Motive: React.FC<S> = ({t, fr}) => {
  const a = B.l8;
  const draw = pr(t, B.stolen - 0.2, 1.2, inOut);
  const erase = pr(t, B.nottrue - 0.1, 0.9, inOut);
  const leoWalk = pr(t, B.leo - 0.4, 2.6, inOut);
  const leoPos = (k: number): [number, number] => {
    // along the Florence -> Paris curve (cubic bezier)
    const p0 = FLORENCE, p1 = [700, 900], p2 = [560, 700], p3 = [PARIS[0] + 20, PARIS[1] + 30];
    const u = 1 - k; const f = (i: number) => u * u * u * p0[i] + 3 * u * u * k * p1[i] + 3 * u * k * k * p2[i] + k * k * k * p3[i];
    return [f(0), f(1)];
  };
  const [lx, ly] = leoPos(leoWalk);
  const solid = pr(t, B.leo - 0.2, 2.6, inOut);
  const king = pr(t, B.king - 0.3, 0.5);
  const bubble = win(t, B.italy - 0.2, B.nottrue + 0.1, 0.3);
  const cam = keys([[a, {zoom: 3.5, y: 760, x: 520}], [a + 0.8, {zoom: 1.0, x: 600, y: 900}], [B.stolen, {zoom: 1.05, x: 600, y: 820}], [B.nottrue, {zoom: 1.1, x: 640, y: 860}], [B.leo, {zoom: 1.25, x: 760, y: 960}],
    [B.france, {zoom: 1.2, x: 520, y: 640}], [B.king + 0.6, {zoom: 1.3, x: 420, y: 560}], [B.l10 - 0.3, {zoom: 1.0, x: 700, y: 900}], [B.l10, {zoom: 1.0, x: 720, y: 920}]]);
  return (
    <Camera fr={fr} keys={cam} background={T.duskBlue}>
      <MapWorld t={t} fr={fr} />
      {/* Vincenzo's dotted claim: Italy -> France "stolen?" */}
      <g opacity={1 - erase}>
        <path d={P_IT_FR} fill="none" stroke="#FBFAF4" strokeWidth={12} strokeDasharray="24 22" strokeLinecap="round" pathLength={1000}
          style={{strokeDashoffset: 0}} clipPath="url(#drawclip)" opacity={draw > 0 ? 1 : 0} />
        <defs><clipPath id="drawclip"><circle cx={FLORENCE[0]} cy={FLORENCE[1]} r={draw * 900} /></clipPath></defs>
        {draw > 0.9 && <g transform="translate(560 690) rotate(-28)"><text fontFamily={TYPE} fontSize={58} fill="#FBFAF4" stroke={T.ink} strokeWidth={1.5}>stolen?</text></g>}
      </g>
      {/* eraser rubs it out; chalk dust */}
      {erase > 0 && erase < 1 && <g transform={`translate(${lerp(800, 470, erase) + Math.sin(erase * 40) * 40} ${lerp(990, 520, erase)}) rotate(-30)`}><Eraser /></g>}
      {erase > 0 && erase < 1 && <g transform={`translate(${lerp(800, 470, erase)} ${lerp(990, 520, erase)})`}><Confetti p={(erase * 5) % 1} n={8} spread={70} seed={`er${Math.floor(erase * 5)}`} /></g>}
      {/* Leonardo's true route: solid, Florence -> Paris, drawn behind him */}
      <ArrowPath d={P_IT_FR} k={solid} col={T.amberGlow} w={10} />
      {solid > 0.98 && <path d={`M${PARIS[0] + 20},${PARIS[1] + 30} l46,8 M${PARIS[0] + 20},${PARIS[1] + 30} l18,42`} stroke={T.amberGlow} strokeWidth={10} strokeLinecap="round" />}
      {/* Vincenzo at the map, hand on heart, with his daydream bubble (boot-shaped, confetti, a tiny band) */}
      <g transform={`translate(${lerp(1000, 940, pr(t, a, 0.6))} 1000)`}><K.P who="vincenzo" fr={fr} h={360} pose={t < B.nottrue ? (t > B.stolen - 0.3 && t < B.stolen + 1 ? 'point' : 'heartHand') : 'shrug'} expr={t < B.nottrue ? 'smile' : 'worried'} facing={-1} /></g>
      {bubble > 0 && <g transform={`translate(950 520) scale(${bubble})`} opacity={bubble}>
        {[0, 1, 2].map((i) => <circle key={i} cx={-10 - i * 14} cy={200 + i * 60} r={14 - i * 4} fill={T.card} stroke={T.ink} strokeWidth={2.5} />)}
        <g filter="url(#ss-shadow)"><ellipse cx={-90} cy={0} rx={200} ry={170} fill={T.card} stroke={T.ink} strokeWidth={3} /></g>
        <g transform="translate(-90 10)"><K.Lisa fr={fr} h={150} glow={0.15} id="bub" /></g>
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
        <g transform={`translate(${lerp(40, 170, pr(t, B.king + 0.5, 0.6))} ${-150 - Math.sin(pr(t, B.king + 0.5, 0.6) * Math.PI) * 60})`}><Cut d="M-22,0 q-6,-30 22,-34 q28,4 22,34 z" fill={T.sepia} sw={2.5} /><path d="M-10,-30 l10,-8 l10,8" stroke={T.ink} strokeWidth={2.5} fill="none" /></g>
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
    <Camera fr={fr} keys={keys([[a, {zoom: 1.0, x: 720, y: 920}], [B.showsoff, {zoom: 1.35, x: 820, y: 980}], [B.crowds, {zoom: 1.3, x: 790, y: 960}], [B.l11 - 0.9, {zoom: 1.2, x: 700, y: 820}], [B.l11 - 0.25, {zoom: 1.8, x: PARIS[0], y: PARIS[1]}], [B.l11, {zoom: 5, x: PARIS[0], y: PARIS[1]}]])} background={T.duskBlue}>
      <MapWorld t={t} fr={fr} />
      <path d={`M${FLORENCE[0]},${FLORENCE[1]} L${ROME[0]},${ROME[1]} L${MILAN[0]},${MILAN[1]}`} fill="none" stroke={T.amber} strokeWidth={8} strokeDasharray="20 16" opacity={0.85} />
      {toParis > 0 && <path d={`M${MILAN[0]},${MILAN[1]} Q600,560 ${PARIS[0]},${PARIS[1]}`} fill="none" stroke={T.amber} strokeWidth={8} pathLength={1} strokeDasharray={`${toParis} 1`} />}
      {toParis > 0.9 && <circle cx={PARIS[0]} cy={PARIS[1]} r={46} fill="none" stroke={T.clueRed} strokeWidth={8} pathLength={1} strokeDasharray={`${pr(t, B.l11 - 0.2, 0.2)} 1`} />}
      {cities.map((c, i) => <g key={i} transform={`translate(${c[0] + [60, 120, -60][i]} ${c[1] - 10})`}><PopGallery fr={fr} k={ks[i]} seed={20 + i} /></g>)}
      <g transform={`translate(${dot[0]} ${dot[1]})`}><circle r={26} fill="url(#ss-amber)" /><circle r={12} fill={T.amber} stroke={T.ink} strokeWidth={2} /></g>
      <Layer depth={1.25}>
        <g transform={`translate(${lerp(-400, 230, pr(t, a + 0.1, 0.6))} 1230) rotate(-6) scale(0.62)`}><TourPoster lit={ks} /></g>
        <g transform="translate(850 1300)"><K.Gauge fr={fr} v={gauge} size={0.85} /></g>
      </Layer>
    </Camera>
  );
};
const lerpP = (a: [number, number], b: [number, number], k: number): [number, number] => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------- 12 + 13. The Salon Carré: the spider leaves, she is hung back on the four hooks; then the crowd ----------
const BigPainting: React.FC<{w: number; h: number; col: string; seed: string; fr: number}> = ({w, h, col, seed, fr}) => {
  const look = Math.sin(fr * 0.04 + random(seed) * 6) * 4;
  return (
    <g>
      <g filter="url(#ss-shadow)"><path d={wrect(-w / 2 - 24, -h / 2 - 24, w + 48, h + 48, `${seed}f`, 2)} fill={T.oldGold} stroke={T.ink} strokeWidth={3} /></g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={col} stroke={T.ink} strokeWidth={2.5} />
      <ellipse cx={0} cy={-h * 0.12} rx={w * 0.14} ry={w * 0.17} fill={T.skin2} stroke={T.ink} strokeWidth={2.5} />
      <circle cx={-w * 0.05 + look} cy={-h * 0.14} r={4} fill={T.ink} /><circle cx={w * 0.05 + look} cy={-h * 0.14} r={4} fill={T.ink} />
      <path d={`M${-w * 0.25},${h / 2} Q0,${-h * 0.05} ${w * 0.25},${h / 2}`} fill={T.sepia} stroke={T.ink} strokeWidth={2.5} />
    </g>
  );
};
export const Salon: React.FC<S> = ({t, fr}) => {
  const a = B.l11;
  const cal = pr(t, B.jan - 0.15, 0.5);
  const spider = pr(t, B.jan + 0.4, 1.4, inOut);
  const sweep = pr(t, B.jan + 1.3, 0.7, inOut);
  const lift = pr(t, B.wall - 0.9, 1.0, inOut);
  const clinks = [0, 1, 2, 3].map((i) => pr(t, B.wall + 0.2 + i * 0.3, 0.25));
  const doors = pr(t, B.twodays - 0.15, 0.5, inOut);
  const flood = pr(t, B.twodays, 3.5, (k) => k);
  const odo = t > B.hundred - 0.1 ? '100,000+' : undefined;
  const tiles = pr(t, B.hundred + 0.9, 0.9);
  const gv = 0.9 + 0.15 * pr(t, B.hundred - 0.1, 0.6);
  const ML: [number, number] = [540, 900];
  const hung = lift >= 1;
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 3.5, x: 540, y: 800}], [a + 0.9, {zoom: 1.05, x: 540, y: 960}], [B.jan + 0.5, {zoom: 1.55, x: 560, y: 760}], [B.wall - 0.6, {zoom: 1.35, x: 540, y: 860}],
      [B.wall + 0.3, {zoom: 2.3, x: 540, y: 700}], [B.paris + 0.3, {zoom: 2.2, x: 540, y: 720}], [B.twodays + 0.3, {zoom: 1.0, x: 540, y: 980}], [B.hundred, {zoom: 0.9, x: 540, y: 1000}], [B.l13 - 0.4, {zoom: 1.1, x: 760, y: 700}], [B.l13, {zoom: 4.2, x: 800, y: 640}]])} background={T.paper}>
      <Layer depth={0.3}><Wall seed="sc" fill={T.paper} />
        <rect x={-300} y={-300} width={1700} height={300} fill={T.duskBlue} opacity={0.5} />
        <path d="M200,-300 L60,1500 L1020,1500 L880,-300 Z" fill="url(#ss-beam)" opacity={0.6} />
      </Layer>
      <Layer depth={0.6}>
        <g transform="translate(130 650)"><BigPainting w={260} h={360} col={T.duskBlue} seed="bp1" fr={fr} /></g>
        <g transform="translate(950 650)"><BigPainting w={260} h={360} col="#6B7D5E" seed="bp2" fr={fr} /></g>
        <g transform="translate(140 1200)"><BigPainting w={220} h={200} col={T.sepia} seed="bp3" fr={fr} /></g>
        <g transform="translate(940 1200)"><BigPainting w={220} h={200} col={T.stone} seed="bp4" fr={fr} /></g>
        {/* the gallery doors at the side burst open */}
        <g transform="translate(540 1500)">
          <Cut d={rect(-170, -420, 340, 420, 8)} fill={T.amberGlow} sw={3} shadow={false} />
          <g transform={`translate(-170 0) scale(${1 - doors * 0.85} 1)`}><Cut d={rect(0, -420, 170, 420, 4)} fill={T.sepia} sw={3} /></g>
          <g transform={`translate(170 0) scale(${-(1 - doors * 0.85)} 1)`}><Cut d={rect(0, -420, 170, 420, 4)} fill={T.sepia} sw={3} /></g>
        </g>
      </Layer>
      <Floor y={1500} fill={T.parquet} />
      {/* calendar */}
      <g transform={`translate(330 ${lerp(-200, 330, cal)})`}><K.Calendar text="January 1914" prev="1913" tear={pr(t, B.jan + 0.25, 0.7)} w={330} /></g>
      {/* the four hooks and the web; the spider packs and leaves; a broom sweeps */}
      <g transform={`translate(${ML[0]} ${ML[1] - 240})`}>
        <K.Hooks fr={fr} tags={clinks} sway={hung ? 0 : 1.5} />
        <g opacity={1 - sweep} stroke="#F7F3EA" strokeWidth={1.6} fill="none">
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M-110,${-10 + i * 10} Q0,${40 + i * 18} 110,${-10 + i * 10}`} />)}
          {[-80, -25, 30, 85].map((xx) => <path key={xx} d={`M${xx},-20 L${xx * 0.6},70`} />)}
        </g>
        <g transform={`translate(${lerp(10, 600, spider)} ${lerp(40, 20, spider)})`}><K.Spider fr={fr} size={2.2} suitcase={spider > 0} /></g>
        {sweep > 0 && sweep < 1 && <g transform={`translate(${lerp(-260, 260, sweep)} 40) rotate(${-30 + Math.sin(sweep * 20) * 15})`}><path d="M0,-260 L0,0" stroke={T.sepia} strokeWidth={12} /><Cut d="M-40,0 h80 l20,60 h-120 z" fill="#D9B45A" sw={2.5} /></g>}
      </g>
      {/* two workers lift her up onto the hooks */}
      {!hung || t < B.paris + 0.8 ? (
        <g>
          <g transform={`translate(${lerp(-150, 330, pr(t, B.wall - 2.0, 1.1, inOut))} 1560)`}><K.P who="worker" fr={fr} pose={lift > 0 ? 'holdUp' : 'walk'} expr="smile" /></g>
          <g transform={`translate(${lerp(1230, 750, pr(t, B.wall - 2.0, 1.1, inOut))} 1580)`}><K.P who="worker2" fr={fr} pose={lift > 0 ? 'holdUp' : 'walk'} expr="smile" facing={-1} /></g>
        </g>
      ) : null}
      <g transform={`translate(${ML[0]} ${lerp(1180, ML[1], lift) - (lift < 1 && lift > 0 ? Math.sin(lift * Math.PI) * 30 : 0)})`}>
        {(t > B.wall - 2.0) && <K.Lisa fr={fr} h={300} glow={0.5 + 0.4 * clinks[3] + 0.3 * flood} frame glintAt={[F(B.paris + 0.3)]} id="salon" />}
      </g>
      {/* the crowd floods in through the doors */}
      {flood > 0 && <g>
        <g transform={`translate(0 ${lerp(160, 0, Math.min(1, flood * 2))})`} opacity={Math.min(1, flood * 3)}>
          <Crowd fr={fr} x={-40} y={1780} w={1160} rows={Math.ceil(1 + flood * 4)} perRow={9} dy={60} scale={1.25} seed={41} flow={0} />
        </g>
        {Array.from({length: 10}, (_, i) => { const k = pr(t, B.twodays + 0.2 + i * 0.28, 1.6, (q) => q); return k > 0 && k < 1 ? <g key={i} transform={`translate(${540 + (random(`fl${i}`) - 0.5) * 300 * k} ${1460 + k * 260})`}><g transform={`scale(${0.5 + k})`}><Crowd fr={fr} x={-30} y={0} w={60} rows={1} perRow={1} seed={70 + i} scale={1} /></g></g> : null; })}
      </g>}
      <Layer depth={1.25}>
        <g transform={`translate(800 ${lerp(2200, 600, pr(t, B.twodays + 0.2, 0.6))})`}>
          <K.Gauge fr={fr} v={gv} odo={odo} size={1.1} />
          {/* number tiles pop out like popcorn */}
          {tiles > 0 && Array.from({length: 8}, (_, i) => { const k = pr(t, B.hundred + 0.9 + i * 0.07, 0.7, (q) => q); const a = -Math.PI / 2 + (random(`tl${i}`) - 0.5) * 2.4; return <g key={i} transform={`translate(${Math.cos(a) * 260 * k} ${80 + Math.sin(a) * 260 * k + k * k * 200}) rotate(${k * 300})`} opacity={1 - k * 0.3}><rect x={-18} y={-22} width={36} height={44} fill={T.ink} rx={4} /><text y={12} textAnchor="middle" fontFamily={TYPE} fontSize={30} fill={T.card}>{'100,000+'.replace(',', '')[i]}</text></g>; })}
        </g>
        <g transform={`translate(260 ${lerp(-200, 600, pr(t, B.twodays, 0.5))})`} opacity={1 - pr(t, B.l13 - 0.5, 0.3)}><K.Calendar text="2 days" w={260} /></g>
      </Layer>
    </Camera>
  );
};

// ---------- 14. The cell: about seven months; her postcard on the wall ----------
export const Cell: React.FC<S> = ({t, fr}) => {
  const a = B.l13;
  const tally = pr(t, B.seven - 0.6, 1.4, (k) => k) * 7;
  const cal = pr(t, B.seven - 0.2, 0.4);
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 3.0, x: 760, y: 700}], [a + 0.8, {zoom: 1.05, x: 540, y: 960}], [B.seven + 0.4, {zoom: 1.15, x: 600, y: 900}], [B.l14 - 0.35, {zoom: 1.8, x: 760, y: 820}], [B.l14, {zoom: 4.5, x: 760, y: 820}]])} background={T.stone}>
      <Layer depth={0.4}>
        <rect x={-300} y={-300} width={1700} height={2500} fill={T.stone} />
        {Array.from({length: 40}, (_, i) => <path key={i} d={wrect(-300 + (i % 8) * 220 + (Math.floor(i / 8) % 2) * 110, -100 + Math.floor(i / 8) * 160, 210, 150, `st${i}`, 3)} fill="none" stroke={T.ink} strokeWidth={2} opacity={0.25} />)}
        {/* high barred window with a sunbeam */}
        <g transform="translate(300 420)"><rect x={-110} y={-90} width={220} height={180} fill={T.duskBlue} stroke={T.ink} strokeWidth={4} />{[-60, -20, 20, 60].map((x) => <path key={x} d={`M${x},-90 v180`} stroke={T.ink} strokeWidth={8} />)}</g>
        <path d={`M200,500 L${420 + Math.sin(t * 0.6) * 30},1500 L${760 + Math.sin(t * 0.6) * 30},1500 L400,500 Z`} fill="url(#ss-beam)" opacity={0.9} />
      </Layer>
      <Dust t={t} x={200} y={500} w={500} h={1000} seed="cd" col={T.card} n={16} />
      <Floor y={1500} fill="#8E8576" />
      {/* tally marks scratched on the wall */}
      <g transform="translate(200 1080)"><Tally n={tally} /></g>
      {/* her postcard pinned on the wall, catching the sunbeam */}
      <g transform="translate(760 820) rotate(4)">
        <g filter="url(#ss-shadow)"><path d={wrect(-110, -150, 220, 300, 'pc', 2)} fill={T.card} stroke={T.ink} strokeWidth={2.5} /></g>
        <K.Lisa fr={fr} h={230} glow={0.35} glintAt={[F(B.seven + 0.5)]} id="pc" shadow={false} />
        <circle cx={0} cy={-142} r={9} fill={T.clueRed} stroke={T.ink} strokeWidth={2} />
      </g>
      {/* bench and Vincenzo */}
      <Cut d={rect(80, 1400, 520, 40, 6)} fill={T.sepia} sw={3} />
      <g transform="translate(330 1560)"><K.P who="vincenzo" fr={fr} costume="shirt" pose={t > B.seven + 0.8 ? 'sigh' : 'write'} expr={t > B.seven + 0.8 ? 'smile' : 'sad'} look={[1.5, -1]} /></g>
      <Layer depth={1.25}><g transform={`translate(830 ${lerp(-300, 1320, cal)})`}><K.Calendar text="about 7 months" w={360} /></g>
        {[-180, -60, 60, 180].map((x) => <g key={x}><Cut d={rect(540 + x * 3 - 18, -300, 36, 2500)} fill="#4A4540" sw={3} /></g>)}</Layer>
    </Camera>
  );
};

// ---------- 15. More famous than ever: crowds, newspapers, the art lovers on tiptoe, the gauge pops ----------
export const Famous: React.FC<S> = ({t, fr}) => {
  const a = B.l14;
  const pop = pr(t, B.famous + 0.1, 0.8, (k) => k);
  const tip = Math.abs(Math.sin(two(t) * 5)) * 18;
  const papers = [0, 1, 2].map((i) => pr(t, B.famous - 0.6 + i * 0.25, 0.4));
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 2.8, x: 540, y: 720}], [a + 0.9, {zoom: 1.0, x: 540, y: 900}], [B.l15 - 0.5, {zoom: 0.92, x: 540, y: 960}], [B.l15, {zoom: 0.9, x: 540, y: 960}]])} background={T.paper}>
      <Layer depth={0.3}><Wall seed="fm" /><path d="M200,-300 L60,1500 L1020,1500 L880,-300 Z" fill="url(#ss-beam)" opacity={0.5} /></Layer>
      <g transform="translate(540 720)"><K.Lisa fr={fr} h={360} glow={0.7 + 0.3 * pop} frame glintAt={[F(B.famous + 0.4)]} id="fm" /></g>
      <g transform="translate(540 460)"><K.Hooks fr={fr} /></g>
      {/* newspapers held up in the crowd */}
      {papers.map((k, i) => <g key={i} transform={`translate(${[180, 880, 560][i]} ${lerp(1700, [1060, 1100, 1180][i], k)}) rotate(${[-8, 7, -3][i]})`} opacity={k}>
        <g filter="url(#ss-shadow)"><path d={wrect(-130, -90, 260, 180, `np${i}`, 2)} fill={T.card} stroke={T.ink} strokeWidth={2.5} /></g>
        <text y={-30} textAnchor="middle" fontFamily={FONT.display} fontWeight={900} fontSize={40} fill={T.ink}>She's back!</text>
        <path d="M-110,0 h120 M-110,22 h120 M-110,44 h100" stroke={T.ink} strokeWidth={3} opacity={0.5} />
        <rect x={30} y={-6} width={70} height={70} fill={T.stone} stroke={T.ink} strokeWidth={2} />
      </g>)}
      <Crowd fr={fr} x={-60} y={1620} w={1200} rows={5} perRow={10} dy={70} scale={1.35} seed={51} />
      {/* the three art lovers from part 1, crushed at the back, on tiptoe */}
      <Layer depth={1.2}>
        <g transform={`translate(110 ${1820 - tip})`}><K.P who="artTall" fr={fr} h={560} pose="peer" expr="worried" /></g>
        <g transform={`translate(250 ${1850 - Math.abs(Math.sin(two(t) * 5 + 1)) * 22})`}><K.P who="artMed" fr={fr} h={500} pose="armsUp" expr="worried" /></g>
        <g transform={`translate(380 ${1870 - Math.abs(Math.sin(two(t) * 5 + 2)) * 26})`}><K.P who="artShort" fr={fr} h={460} pose="peer" expr="sad" monocle={false} /></g>
        <g transform="translate(830 1240)"><K.Gauge fr={fr} v={0.95 + 0.25 * pr(t, a + 0.3, 1.2)} odo="100,000+" burst={pop} size={0.95} /></g>
      </Layer>
    </Camera>
  );
};

// ---------- 16 + 17. Today: phones, millions every year; the ghost of Vincenzo; push into her smile ----------
export const Today: React.FC<S> = ({t, fr}) => {
  const a = B.l15;
  const ghost = win(t, B.stole - 0.2, B.stole + 1.8, 0.4);
  const push = pr(t, B.smile2 - 1.2, 2.0, inOut);
  const odo = t > B.millions - 0.1 ? 'millions every year' : '100,000+';
  return (
    <Camera fr={fr} keys={keys([[a, {zoom: 0.95, x: 540, y: 980}], [B.millions, {zoom: 1.0, x: 540, y: 960}], [B.stole, {zoom: 1.12, x: 540, y: 920}], [B.smile2, {zoom: 2.2, x: 540, y: 760}], [B.end + 1.4, {zoom: 2.35, x: 540, y: 750}]])} background={T.paper}>
      <Layer depth={0.3}><Wall seed="td" fill="#E9E1D3" stripes={false} />
        <rect x={-300} y={1100} width={1700} height={30} fill={T.stone} opacity={0.6} />
      </Layer>
      {/* today's wide wall, her behind glass */}
      <Layer depth={0.6}><Cut d={rect(140, 380, 800, 820, 4)} fill="#CFC3AE" sw={3} shadow={false} /></Layer>
      <g transform="translate(540 760)"><K.Lisa fr={fr} h={340} glow={0.75 + 0.25 * push} frame glass glintAt={[F(B.end - 0.2)]} id="td" /></g>
      {/* rope barrier */}
      <path d="M100,1260 q220,60 440,0 q220,60 440,0" stroke={T.clueRed} strokeWidth={10} fill="none" />
      {[100, 540, 980].map((x) => <Cut key={x} d={rect(x - 12, 1240, 24, 220, 6)} fill={T.oldGold} sw={2.5} />)}
      {/* the ghost of Vincenzo in his white smock tips his cap */}
      {ghost > 0 && <g transform="translate(860 1420)" opacity={ghost}><K.P who="vghost" fr={fr} h={420} pose="tipCap" expr="smile" facing={-1} /></g>}
      {/* today's crowd: phones up, white flashes, flowing past like a river */}
      <Crowd fr={fr} x={-80} y={1720} w={1240} rows={5} perRow={10} dy={72} scale={1.4} era="today" phones flashAt={F(a)} seed={61} flow={0.6} />
      <Layer depth={1.2}><g transform={`translate(860 ${lerp(1180, 1180, 1)})`} opacity={1 - pr(t, B.stole - 0.4, 0.4)}><K.Gauge fr={fr} v={1.12} odo={odo} size={0.8} /></g></Layer>
    </Camera>
  );
};
void NoteBundle; void Chalk;
