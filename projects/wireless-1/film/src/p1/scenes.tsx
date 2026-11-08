// Part 1 stages. One camera thread; each stage is a world with its own camera keys, handed off by push-throughs
// (thru.tsx). Every time is a beat from beats.json + an offset. Shared characters/sets/devices come through the adapter
// (cast.tsx → kit), part-only sets/props from sets.tsx / props.tsx.
import React from 'react';
import {interpolate} from 'remotion';
import B from '../beats.json';
import {World, PLayer as Layer, camAt, drift, ramp, rampIO, win, lerp, clamp, hash, toScreen, Cam} from './rig';
import {InkDefs, Sh, R, E, LampGlow as Glow} from './ink';
import {K, FONT} from './tok';
import {LondonStreet, STREET, MusicHall, STAGE, Ballroom, BALL, AlbionDoor, ALBION} from './sets';
import {P1Card, P1OperaGlasses, P1StoryCard, P1Picture} from './props';
import {Hilldrop, HilldropSection, CellarFloor, ScotlandYard, Sea, Montrose, MONTROSE_PTS, Snow as KSnow} from '../series/sets';
import {WallCalendar, Notebook, PoliceLamp, SeaBirds} from '../series/props';
import {FogBand as KFog} from '../series/look';
import {
  Fig, SparkA, SparkTrailA, MoustacheA, FeatherA, ClueRingA, BalloonA, PaperA, WantedA, H39, PAPER_MAST, PAPER_PORTRAIT, WANTED_OVAL,
} from './cast';
import type {StageFC} from './thru';
import {T1, T2, T3, T4, T5, T6, T7, T8, TAPS, LAND} from './times';
export {T1, T2, T3, T4, T5, T6, T7, T8};

type Clip = {x: number; y: number; r: number} | undefined;
const pathAt = (pts: [number, number][], k: number): [number, number] => {
  const n = pts.length - 1, u = Math.min(n - 1e-6, Math.max(0, k * n)), i = Math.floor(u), f = u - i;
  return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
};
// large independent drifters for the fore plane (each its own path: snowflakes, lamp-lit dust, petals)
export const Drifters: React.FC<{t: number; n?: number; color: string; r?: [number, number]; o?: number; seed?: number; fall?: number; box?: [number, number, number, number]}> =
  ({t, n = 10, color, r = [12, 24], o = 0.55, seed = 0, fall = 40, box = [-200, -200, 1480, 2320]}) => (
  <g>{Array.from({length: n}).map((_, i) => {
    const h = (k: number) => hash(i * 7.31 + seed * 13.7 + k), [x0, y0, w, hh] = box;
    const sp = fall * (0.5 + h(1)), x = x0 + ((h(2) * w + Math.sin(t * (0.5 + h(3)) + i) * 60 + t * 12 * (h(4) - 0.5)) % w + w) % w, y = y0 + ((h(5) * hh + t * sp) % hh);
    return <circle key={i} cx={x} cy={y} r={r[0] + h(6) * (r[1] - r[0])} fill={color} opacity={o * (0.6 + 0.4 * Math.sin(t * 2 + i))} />;
  })}</g>
);
// a printed label ribbon (part-only, kit style): newsprint, Old Standard; optional leader line to its object
export const P1Label: React.FC<{x: number; y: number; text: string; o: number; lineTo?: [number, number]}> = ({x, y, text, o, lineTo}) => o > 0 ? (
  <g opacity={o}>
    {lineTo && <path d={`M${x},${y + 26}L${lineTo[0]},${lineTo[1]}`} stroke={K.ink} strokeWidth={3} />}
    <Sh d={R(x - text.length * 10 - 22, y - 31, text.length * 20 + 44, 58, 6)} fill={K.newsprint} line={3} />
    <text x={x} y={y + 8} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={34} fill={K.ink}>{text}</text>
  </g>
) : null;
// a small bird that hops / flaps on its own clock
export const Bird: React.FC<{x: number; y: number; t: number; s?: number; fly?: boolean; seed?: number}> = ({x, y, t, s = 1, fly, seed = 0}) => {
  const w = Math.sin(t * 18 + seed * 3) * 14, hop = fly ? 0 : Math.max(0, Math.sin(t * 5 + seed * 2)) * 14;
  return <g transform={`translate(${x},${y - hop}) scale(${s})`}>
    {fly ? <path d={`M-30,0q15,${-14 + w} 30,0q15,${-14 + w} 30,0`} stroke={K.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
      : <><Sh d={E(0, -14, 22, 14)} fill={K.slate} line={3} /><Sh d={E(18, -26, 10, 10)} fill={K.slate} line={3} /><path d="M26,-26l10,3l-10,3" fill={K.ink} /></>}
  </g>;
};
// chimney smoke as separate puffs
export const Puffs: React.FC<{x: number; y: number; t: number; n?: number; c?: string; o?: number; s?: number}> = ({x, y, t, n = 4, c = K.fog, o = 0.45, s = 1}) => (
  <g>{Array.from({length: n}).map((_, i) => { const k = (t * 0.35 + i / n) % 1; return <circle key={i} cx={x + k * 120 * s + Math.sin(k * 5 + i) * 20} cy={y - k * 320 * s} r={(22 + k * 60) * s} fill={c} opacity={o * (1 - k)} />; })}</g>
);

// ======================= S1 · London street at night (L1–L2) =======================
const PB = STREET.playbill, PB_PIC: [number, number] = [PB.x + 180, PB.y + 347];
const NEWS: [number, number] = [250, 1500];            // newsboy's feet
const PAPER: [number, number] = [372, 1080];           // centre of the paper he holds up (world)
const PS = 0.42, MAST: [number, number] = [PAPER[0] + PAPER_MAST[0] * PS, PAPER[1] + PAPER_MAST[1] * PS], PORT: [number, number] = [PAPER[0] + PAPER_PORTRAIT[0] * PS, PAPER[1] + PAPER_PORTRAIT[1] * PS];
const s1Cam = (t: number): Cam => drift(camAt(t, [
  [0, {x: 640, y: 40, z: 0.92}], [1.4, {x: 620, y: 260, z: 0.95}], [4.0, {x: 540, y: 980, z: 1}],
  [4.9, {x: PAPER[0], y: PAPER[1] + 20, z: 1.9}], [7.5, {x: PAPER[0] + 20, y: PAPER[1], z: 2.0}],
  [8.7, {x: 700, y: 1060, z: 1.25}], [11.3, {x: PB_PIC[0] - 20, y: PB_PIC[1] - 60, z: 1.55}], [T1, {x: PB_PIC[0], y: PB_PIC[1], z: 7}],
]), t, t < T1 - 0.6 ? 1 : 0);
// the Spark's path in world coords: star → onto the wire → along it → into the paper (ad mast, portrait) → playbill
const sparkS1 = (t: number): [number, number] => {
  const st: [number, number] = [STREET.starX, STREET.starY];
  if (t < 0.9) return [st[0] + Math.sin(t * 3) * 4, st[1]];
  if (t < 1.7) { const k = rampIO(t, 0.9, 0.8); return [lerp(st[0], 900, k), lerp(st[1], STREET.wireY(900), k * k)]; }
  if (t < 4.3) { const x = lerp(900, 380, rampIO(t, 1.7, 2.4)); return [x, STREET.wireY(x) - 6]; }
  if (t < 5.0) { const k = rampIO(t, 4.3, 0.7); return [lerp(380, MAST[0], k), lerp(STREET.wireY(380), MAST[1], k)]; }      // the ad's mast
  if (t < 6.9) return [MAST[0] + Math.sin(t * 9) * 2, MAST[1]];
  if (t < 7.5) { const a = rampIO(t, 6.9, 0.6) * Math.PI * 2; return [PORT[0] + Math.cos(a) * 70, PORT[1] + Math.sin(a) * 80]; } // lasso the portrait
  if (t < 9.6) { const k = rampIO(t, 7.5, 2.1); return pathAt([[PORT[0] + 70, PORT[1]], [560, 1100], [620, 980], [PB.x + 70, PB.y + 430]], k); }
  const k = rampIO(t, 9.6, 1.2); return [lerp(PB.x + 70, PB.x + 292, k), PB.y + 430];          // along the footlights
};
export const S1: StageFC = ({t, clip}) => {
  const cam = s1Cam(t), sp = sparkS1(t);
  const trail = Array.from({length: 8}).map((_, i) => sparkS1(Math.max(0, t - i * 0.05)));
  const coraX = interpolate(t, [0.6, 6.4], [-140, 1180], clamp), coraOn = t < 6.6;
  const foot = ramp(t, 9.8, 1.0);
  return (
    <World cam={cam} bg={K.deep} clip={clip} id="s1">
      <InkDefs />
      <Layer k={0.2}><LondonStreet t={t} plane="sky" /></Layer>
      <Layer k={0.35}><g opacity={0.45}><FogBand t={t} y={760} sp={14} /></g></Layer>
      <Layer k={0.5}><LondonStreet t={t} plane="far" /></Layer>
      <Layer k={0.8}><LondonStreet t={t} plane="mid" /></Layer>
      <Layer k={1}>
        <LondonStreet t={t} plane="near" footlights={foot} />
        {coraOn && <Fig who="cora" x={coraX} y={1500} s={0.55} pose="walk" expr="laugh" t={t} />}
        <Fig who="newsboy" x={NEWS[0]} y={NEWS[1]} s={0.9} pose="shout" t={t} />
        <PaperA x={PAPER[0]} y={PAPER[1]} s={PS} rot={Math.sin(t * 2.2) * 1.5} date="31 January 1910" ad portrait t={t} />
        {t < 2.0 && <text x={560} y={-150} textAnchor="middle" fontFamily={FONT.display} fontSize={190} fill="none" stroke={K.spark} strokeWidth={6}
          strokeDasharray={`${rampIO(t, 0, 0.8) * 900} 900`} opacity={1 - ramp(t, 1.3, 0.6)} style={{filter: 'drop-shadow(0 0 10px #2FB8E0)'}}>1910</text>}
        <SparkTrailA pts={trail} />
        <SparkA x={sp[0]} y={sp[1]} t={t} s={t < 1 ? 1.3 : 0.8} tap={tapAt(t)} />
      </Layer>
      <Layer k={1}>{[0, 1, 2].map((i) => <circle key={i} cx={110 + Math.sin(t * (3 + i) + i) * 70} cy={960 + Math.cos(t * (2.3 + i * 0.7)) * 60} r={7} fill={K.newsprint} opacity={0.8} />)}<Puffs x={-200} y={640} t={t} /><Puffs x={1250} y={640} t={t + 1.3} /></Layer>
      <Layer k={1.4}><g opacity={0.5}><FogBand t={t + 3} y={1650} sp={26} /></g><Drifters t={t} color={K.fog} n={9} o={0.35} fall={25} seed={1} /></Layer>
    </World>
  );
};
// title Morse taps (C-B-W): 2.4–4.0 s, one flash per tap
export const tapAt = (t: number) => (TAPS.some((a) => t >= a.s && t < a.s + a.d + 0.04) ? 1 : 0);
const FogBand: React.FC<{t: number; y: number; sp: number}> = ({t, y, sp}) => (
  <g>{Array.from({length: 6}).map((_, i) => <ellipse key={i} cx={-400 + ((i * 420 + t * sp) % 2400)} cy={y + Math.sin(i) * 40} rx={360} ry={70} fill={K.fog} opacity={0.35} />)}</g>
);

// ======================= S2 · the music hall (L3–L4) =======================
const DOC_X = 790, DOC_S = 0.95, LENS: [number, number] = [DOC_X + 30, STAGE.floor - 610 * DOC_S * 0.85];
const s2Cam = (t: number): Cam => drift(camAt(t, [
  [T1 - 0.6, {x: 540, y: 1000, z: 1.0}], [B.friends + 0.4, {x: 520, y: 1060, z: 1.05}], [B.hawley, {x: 640, y: 1120, z: 1.15}],
  [B.called + 0.8, {x: 720, y: 1080, z: 1.45}], [B.mustache + 0.3, {x: LENS[0] - 20, y: LENS[1] + 30, z: 2.6}], [T2, {x: LENS[0], y: LENS[1], z: 9}],
]), t, t < T2 - 0.5 ? 1 : 0);
export const s2Lens = () => toScreen(s2Cam(T2 - 0.001), LENS);
export const S2: StageFC = ({t, clip}) => {
  const brim = ramp(t, B.hats, 0.7);
  const friends = ['clara', 'paul', 'guildLady', 'guildMan'] as const;
  const docIn = ramp(t, B.husband - 0.2, 0.6);
  const mFly = rampIO(t, B.mustache - 1.1, 0.83);
  const mPos: [number, number] = [lerp(160, LENS[0] - 20, mFly) + Math.sin(t * 9) * 40 * (1 - mFly), lerp(560, LENS[1] - 30, mFly) + Math.sin(t * 13) * 30 * (1 - mFly)];
  return (
    <World cam={s2Cam(t)} bg={K.deep} clip={clip} id="s2">
      <InkDefs />
      <Layer k={0.6}><MusicHall t={t} plane="back" spot={1} /></Layer>
      <Layer k={1}>
        {/* the big hat brim grows into an umbrella; friends pop up under it */}
        <g transform={`translate(470,${STAGE.floor - 760 * 0.95 * 1.0}) scale(${1 + brim * 1.6},${1 + brim * 0.5})`}>
          {brim > 0 && <Sh d="M-260,10Q0,-110 260,10Q0,40 -260,10z" fill={K.deep} line={4} o={brim} />}
        </g>
        {friends.map((w, i) => {
          const pop = ramp(t, B.friends + i * 0.22, 0.4), x = 120 + i * 120 + (i > 1 ? 560 : 0) - (i > 1 ? 120 : 0);
          return pop > 0 ? <g key={w} transform={`translate(0,${(1 - pop) * 300})`}><Fig who={w} x={i < 2 ? 170 + i * 150 : 760 + (i - 2) * 140} y={STAGE.floor} s={0.62} pose={t > B.husband ? 'stand' : 'wave'} expr="laugh" t={t + i} /></g> : null;
        })}
        <Fig who="cora" x={470} y={STAGE.floor} s={0.95} pose={t < B.husband ? 'sing' : 'laugh'} expr="smile" t={t} />
        {/* the reserved chair in the wings: his name, printed */}
        <g transform={`translate(${DOC_X + 150},${STAGE.floor})`}>
          <Sh d="M-50,0V-120H50V0M-50,-120V-260H50V-120" fill="none" line={6} />
          <Sh d={R(-150, -334, 300, 76, 6)} fill={K.newsprint} line={3} />
          <text x={0} y={-284} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={34} fill={K.ink}>Mr. H. H. Crippen</text>
        </g>
        {docIn > 0 && <g transform={`translate(${(1 - docIn) * 160},0)`}><Fig who="doctor" x={DOC_X} y={STAGE.floor} s={DOC_S} pose="stand" expr={t > B.mustache + 0.3 ? 'nervous' : 'polite'} t={t} glintAt={Math.round(B.glasses * 30)}
          m={t < LAND ? 'none' : t < B.mustache + 0.3 ? 'land' : t < B.mustache + 1.0 ? 'twitch' : 'on'} mAt={Math.round(LAND * 30)} /></g>}
        {t > B.mustache - 1.1 && t < LAND && <MoustacheA x={mPos[0]} y={mPos[1]} s={0.8} state="fly" t={t} />}
        {t > B.glasses + 0.3 && <SparkA x={LENS[0]} y={LENS[1]} t={t} s={0.25} />}
      </Layer>
      <Layer k={1}><MusicHall t={t} plane="house" /></Layer>
      <Layer k={1}>{Array.from({length: 6}).map((_, i) => { const k = ((t - T1) * 0.55 + i / 6) % 1; const x0 = 60 + i * 190, x1 = 380 + (i % 3) * 120;
        return <g key={i} transform={`translate(${lerp(x0, x1, k)},${1750 - Math.sin(k * Math.PI) * 700 - k * 300}) rotate(${k * 540})`} opacity={k < 0.95 ? 1 : 0}><path d="M0,0l-6,40" stroke={K.slate} strokeWidth={4} /><circle r={14} fill={i % 2 ? K.newsprint : K.lamp} stroke={K.ink} strokeWidth={3} /></g>; })}</Layer>
      <Layer k={1.4}><MusicHall t={t} plane="fore" />{[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${120 + i * 280},${1700 + Math.sin(t * 4 + i * 2) * 30}) rotate(${Math.sin(t * 6 + i) * 25})`}><Sh d={R(-40, -60, 80, 100, 4)} fill={K.newsprint} line={3} /></g>)}
        <Drifters t={t} color={K.lamp} n={8} o={0.3} fall={-20} seed={2} r={[10, 18]} /></Layer>
    </World>
  );
};

// ======================= S3 · 39 Hilldrop Crescent (L5–L9) =======================
// kit Hilldrop: door x 770 (690–850, y 980–1330), top step (770,1330), bay window panes x 170–430 y 1050–1290.
const WIN: [number, number] = [H39.winX, H39.winY];
const STEP_TOP: [number, number] = [H39.doorX, H39.stepTop];
const DAY = B.never + 0.3;            // night holds through "never saw her" (part 2's recap R1 is the snowy night steps)
const DOC_HEAD: [number, number] = [STEP_TOP[0], STEP_TOP[1] - 608 * 0.55 * 0.86];
const CLARA_AT: [number, number] = [430, 1500], PAUL_AT: [number, number] = [250, 1500];
const s3Cam = (t: number): Cam => drift(camAt(t, [
  [T2 - 0.5, {x: WIN[0], y: WIN[1], z: 3.4}], [B.dinner + 1.2, {x: WIN[0] + 20, y: WIN[1] + 10, z: 3.0}],
  [B.left + 0.9, {x: 560, y: 1150, z: 1.15}], [B.steps_end, {x: 600, y: 1160, z: 1.25}], [B.again + 0.6, {x: 620, y: 1220, z: 1.35}],
  [B.america, {x: 560, y: 1080, z: 1.25}], [B.sick + 0.3, {x: 540, y: 1150, z: 1.4}], [B.died + 0.5, {x: 360, y: 1150, z: 2.1}], [B.where + 0.3, {x: 380, y: 1060, z: 1.5}], [B.funeral + 1.0, {x: 540, y: 1000, z: 1.2}],
  [B.fuzzy_end, {x: 640, y: 960, z: 1.4}], [T3, {x: 640, y: 960, z: 2.6}],
]), t);
export const S3: StageFC = ({t, clip}) => {
  const fr = Math.round(t * 30), f = (x: number) => Math.round(x * 30);
  const day = rampIO(t, DAY, 0.8);
  const leave = rampIO(t, B.left, 1.8);
  const doorClose = ramp(t, B.steps_end - 0.1, 0.4);
  const featherFall = rampIO(t, B.steps_end - 0.05, 0.7);
  const coraOn = t < B.steps_end + 0.1;
  const docAt = t > B.soon - 0.5;
  const friendsBack = rampIO(t, B.soon - 0.4, 1.0);
  const blow = rampIO(t, B.soon - 0.3, 0.9);
  const fPos: [number, number] = t < B.soon - 0.3
    ? [lerp(STEP_TOP[0] - 40, STEP_TOP[0] - 70, featherFall), lerp(STEP_TOP[1] - 330, STEP_TOP[1] - 6, featherFall)]
    : [lerp(STEP_TOP[0] - 70, CLARA_AT[0] + 60, blow), lerp(STEP_TOP[1] - 6, 1496, blow) - Math.sin(blow * Math.PI) * 160];
  const fog = ramp(t, B.fuzzy + 0.3, 1.2), glint = ramp(t, B.fuzzy_end + 0.1, 0.4);
  const mState = (t < B.america ? 'on' : t < B.sick ? 'twitch' : t < B.questions ? 'sob' : t < B.fuzzy ? 'on' : 'twitch') as 'on';
  const doorOpen = t < B.steps_end ? 1 - doorClose : docAt ? ramp(t, B.soon - 0.4, 0.3) : 0;
  const houseNight = <Hilldrop fr={fr} variant="snow" door={doorOpen} />;
  return (
    <World cam={s3Cam(t)} bg={K.deep} clip={clip} id="s3">
      <InkDefs />
      <Layer k={1}>
        {day < 1 && houseNight}
        {day > 0 && <g opacity={day}><Hilldrop fr={fr} variant="day" door={doorOpen} /></g>}
        {/* the bay window: the parlour at night (cards, laughter, the clock racing to 1:30), the calendar by day */}
        <g clipPath="url(#p1-win)">
          <defs><clipPath id="p1-win"><rect x={WIN[0] - H39.winW / 2} y={WIN[1] - H39.winH / 2} width={H39.winW} height={H39.winH} /></clipPath></defs>
          {day < 1 && <g opacity={1 - day}><ParlourView t={t} /></g>}
          {day > 0 && <g opacity={day}><rect x={WIN[0] - 140} y={WIN[1] - 130} width={280} height={260} fill={K.fog} />
            <WallCalendar fr={fr} x={WIN[0] - 60} y={WIN[1] - 60} scale={0.5} months={['February 1910', 'March 1910']} flipAt={[f(B.again + 0.45)]} /></g>}
          <path d={`M${WIN[0] - 45},${WIN[1] - 125}V${WIN[1] + 125}M${WIN[0] + 45},${WIN[1] - 125}V${WIN[1] + 125}`} stroke={K.ink} strokeWidth={6} />
        </g>
        {/* the friends leave down the steps (night) */}
        {t < B.never && <>
          <Fig who="clara" x={lerp(STEP_TOP[0] - 60, -300, leave)} y={lerp(STEP_TOP[1], H39.ground, Math.min(1, leave * 2.4))} s={0.55} pose={leave > 0 && leave < 1 ? 'walk' : 'wave'} t={t} flip={leave > 0.02} />
          <Fig who="paul" x={lerp(STEP_TOP[0] + 60, -160, leave)} y={lerp(STEP_TOP[1], H39.ground, Math.min(1, leave * 2.0))} s={0.55} pose={leave > 0 && leave < 1 ? 'walk' : 'wave'} t={t + 1} flip={leave > 0.02} />
        </>}
        {coraOn && t > B.left - 0.6 && <Fig who="cora" x={STEP_TOP[0]} y={STEP_TOP[1]} s={0.5} pose={t > B.goodbye - 0.1 ? 'wave' : 'stand'} expr="smile" t={t} />}
        {t > B.steps_end - 0.05 && t < B.america - 0.1 && <FeatherA x={fPos[0]} y={fPos[1]} s={0.42} rot={featherFall < 1 ? 70 - featherFall * 20 : 80} t={t} />}
        {day > 0 && t < B.soon && Array.from({length: 6}).map((_, i) => <ellipse key={i} cx={STEP_TOP[0] - 200 - i * 80} cy={1530 + (i % 2) * 22} rx={24} ry={9} fill={K.deep} opacity={0.5 * (1 - ramp(t, DAY + 0.2, 1.6))} />)}
        {t > DAY && t < B.soon + 1 && <Cat x={interpolate(t, [DAY, B.soon + 1], [-120, 560], clamp)} y={1400} t={t} />}
        {docAt && <>
          <Fig who="doctor" x={STEP_TOP[0]} y={STEP_TOP[1]} s={0.55} pose={t < B.sick ? 'talk' : t < B.questions ? 'telegram' : t < B.fuzzy ? 'stand' : 'shrug'} expr={t < B.questions ? 'polite' : 'nervous'} t={t} m={mState} />
          <g transform={`translate(${(1 - friendsBack) * -600},0)`}>
            <Fig who="clara" x={CLARA_AT[0]} y={CLARA_AT[1]} s={0.6} pose={t < B.soon + 0.6 ? 'walk' : t < B.america + 0.2 ? 'lean' : t > B.where - 0.2 && t < B.funeral ? 'lean' : 'stand'} expr={t > B.died ? 'browUp' : 'neutral'} t={t} flip={t > B.sick + 0.6 && t < B.died + 0.5} />
            <Fig who="paul" x={PAUL_AT[0]} y={PAUL_AT[1]} s={0.6} pose={t < B.soon + 0.6 ? 'walk' : t > B.funeral - 0.2 && t < B.fuzzy ? 'lean' : 'stand'} expr={t > B.sick + 0.8 ? 'browUp' : 'neutral'} t={t + 2} />
          </g>
          {t > B.america - 0.1 && <FeatherA x={CLARA_AT[0] + 70} y={CLARA_AT[1] - 220} s={0.38} rot={-15} t={t} state="flag" />}
        </>}
        {/* a nosy neighbour's curtain twitches upstairs while the doctor tells his sad news */}
        {t > B.sick - 0.4 && t < B.questions + 0.6 && (() => { const k = win(t, B.sick - 0.4, B.questions + 0.6, 0.4); return <g opacity={Math.min(1, k * 2.5)}>
          <clipPath id="p1-nosy"><rect x={222} y={702} width={146} height={206} /></clipPath>
          <g clipPath="url(#p1-nosy)"><circle cx={300} cy={800 + (1 - k) * 160} r={34} fill={K.skin} stroke={K.ink} strokeWidth={4} /><circle cx={290} cy={796 + (1 - k) * 160} r={4} fill={K.ink} /><circle cx={312} cy={796 + (1 - k) * 160} r={4} fill={K.ink} />
            <rect x={222 - k * 40 + Math.sin(t * 9) * 3 * k} y={702} width={74} height={206} fill={K.newsprint} stroke={K.ink} strokeWidth={3} /><rect x={296 + k * 40} y={702} width={74} height={206} fill={K.newsprint} stroke={K.ink} strokeWidth={3} /></g></g>; })()}
        {t > B.died + 0.1 && t < B.where && <text x={CLARA_AT[0]} y={CLARA_AT[1] - 640 * 0.6 - 30 - ramp(t, B.died + 0.1, 0.4) * 30} textAnchor="middle" fontFamily={FONT.display} fontSize={90} fill={K.newsprint} opacity={ramp(t, B.died + 0.1, 0.3)}>?</text>}
        {t < B.sick + 0.2 && <g opacity={1 - ramp(t, B.sick - 0.1, 0.25)}><BalloonA x={540} y={700} w={420} h={300} tail={DOC_HEAD} t={t} at={B.america - 0.2} text="AMERICA" picture={P1Picture('america')} wet wetAt={B.america + 0.3} /></g>}
        <ClueRingA x={540 - 210 + 420 * 0.55} y={700 - 150 + 300 * 0.7 + 110} r={42} at={B.america + 1.1} t={t} out={B.sick - 0.1} />
        {t > B.sick && t < B.questions + 0.45 && <g opacity={1 - ramp(t, B.questions + 0.15, 0.25)}><BalloonA x={400} y={860} w={460} h={150} tail={DOC_HEAD} t={t} at={B.sick + 0.15} text="She got sick… and died." fontSize={36} /></g>}
        {t < B.fuzzy + 0.3 && <g opacity={1 - ramp(t, B.fuzzy - 0.05, 0.3)}><BalloonA x={330} y={860} w={430} h={130} tail={[CLARA_AT[0], CLARA_AT[1] - 400]} t={t} at={B.where - 0.1} text="Where in America?" fontSize={42} /></g>}
        {t < B.fuzzy + 0.5 && <g opacity={1 - ramp(t, B.fuzzy + 0.15, 0.3)}><BalloonA x={360} y={660} w={460} h={130} tail={[PAUL_AT[0] + 20, PAUL_AT[1] - 470]} t={t} at={B.funeral - 0.1} text="When was the funeral?" fontSize={40} /></g>}
        {[0, 1, 2].map((i) => <g key={i} opacity={1 - fog * 0.5}><BalloonA x={800 - i * 30} y={820 - i * 170} w={300 + fog * 200} h={120 + fog * 90} tail={DOC_HEAD} t={t} at={B.fuzzy - 0.1 + i * 0.25} text={['well… er…', 'somewhere…', 'hmm…'][i]} fuzzy fontSize={38} /></g>)}
        {fog > 0 && Array.from({length: 9}).map((_, i) => <ellipse key={i} cx={640 + Math.cos(i * 1.7 + t * 0.4) * (200 + fog * 260)} cy={960 + Math.sin(i * 2.3 + t * 0.3) * (160 + fog * 220)} rx={240 + fog * 160} ry={150 + fog * 90} fill="url(#wn-fog)" opacity={0.9 * fog} />)}
        {glint > 0 && <SparkA x={640} y={960} t={t} s={0.3 + glint * 0.5} />}
      </Layer>
      <Layer k={1}><Puffs x={830} y={360} t={t} c={day > 0.5 ? K.mist : K.fog} />
        {day > 0.3 && [0, 1, 2].map((i) => <Bird key={i} x={60 + i * 150 + Math.sin(t * 0.7 + i) * 40} y={1404} t={t} s={0.7} seed={i} />)}
        {day > 0.3 && [0, 1].map((i) => <Bird key={i} x={((t * (90 + i * 40) + i * 500) % 1600) - 300} y={300 + i * 140 + Math.sin(t * 2 + i) * 30} t={t} fly s={0.9} seed={i + 4} />)}</Layer>
      <Layer k={1.3}><g opacity={day * (1 - fog)}>{Array.from({length: 9}).map((_, i) => { const k = ((t * (0.18 + hash(i) * 0.12) + hash(i + 5)) % 1); return <path key={i} d="M0,-10Q12,0 0,10Q-12,0 0,-10z" transform={`translate(${-150 + k * 1400},${700 + hash(i + 2) * 900 + Math.sin(t * 3 + i) * 60}) rotate(${t * 200 + i * 40}) scale(${1.6 + hash(i + 9)})`} fill={i % 2 ? K.slate : K.mist} stroke={K.ink} strokeWidth={2} />; })}</g>
        <g opacity={1 - day}><KSnow fr={fr} count={50} seed={9} /><Drifters t={t} color={K.newsprint} n={12} o={0.7} fall={120} seed={3} r={[9, 16]} /></g></Layer>
    </World>
  );
};
const ParlourView: React.FC<{t: number}> = ({t}) => {
  const [x, y] = WIN, clock = interpolate(t, [T2, B.left], [0, 1], clamp);
  return (
    <g>
      <rect x={x - 140} y={y - 130} width={280} height={260} fill={K.lamp} />
      <rect x={x - 140} y={y - 130} width={280} height={260} fill="url(#wn-htf)" />
      <g transform={`translate(${x + 90},${y - 80})`}>
        <circle r={24} fill={K.newsprint} stroke={K.ink} strokeWidth={3} />
        <path d={`M0,0L${Math.sin(clock * Math.PI * 2 * 5.5) * 18},${-Math.cos(clock * Math.PI * 2 * 5.5) * 18}`} stroke={K.ink} strokeWidth={3} />
        <path d={`M0,0L${Math.sin(clock * Math.PI * (2 * 5.5 / 12) + Math.PI * 1.5) * 12},${-Math.cos(clock * Math.PI * (2 * 5.5 / 12) + Math.PI * 1.5) * 12}`} stroke={K.ink} strokeWidth={4} />
      </g>
      <Sh d={R(x - 110, y + 50, 220, 18)} fill={K.deep} line={2} />
      {t < B.left && <g opacity={1 - ramp(t, B.left - 0.6, 0.5)}>
        <Fig who="clara" x={x - 95} y={y + 135} s={0.3} pose="laugh" expr="laugh" t={t} />
        <Fig who="cora" x={x - 10} y={y + 135} s={0.3} pose="deal" expr="laugh" t={t} />
        <Fig who="paul" x={x + 70} y={y + 135} s={0.28} pose="laugh" expr="laugh" t={t + 1} flip />
      </g>}
      <Fig who="doctor" x={x + 125} y={y + 135} s={0.26} pose="stand" expr="blank" t={t} flip />
      {t < B.left && [0, 1, 2, 3].map((i) => { const k = ((t * 1.3 + i * 0.25) % 1); return <P1Card key={i} x={x - 10 + (i - 1.5) * 44 * k} y={y + 40 - Math.sin(k * Math.PI) * 26} s={0.28} flip={k} suit={(i % 4) as 0} rot={(i - 1.5) * 10} />; })}
    </g>
  );
};
const Cat: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <g transform={`translate(${x},${y + Math.abs(Math.sin(t * 8)) * -6})`}>
    <Sh d="M-50,0Q-50,-40 0,-40Q40,-40 50,-10L50,0z" fill={K.ink} line={3} />
    <Sh d={E(58, -36, 20, 18)} fill={K.ink} line={3} />
    <path d="M48,-50l6,-16l8,14M62,-50l8,-16l4,16" fill={K.ink} />
    <path d={`M-50,-20q-30,${-20 + Math.sin(t * 6) * 10} -40,-50`} stroke={K.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);

// ======================= S4 · the ball (L10) =======================
const ETH: [number, number] = [470, BALL.floor];
const ETH_H = 650 * 0.62, BROOCH: [number, number] = [ETH[0] + 26 * ETH_H / 760, ETH[1] - 500 * ETH_H / 760];
const GL: [number, number] = [BALL.box.x + 30, BALL.box.y + 50];  // Clara's opera glasses (world)
const s4Cam = (t: number): Cam => drift(camAt(t, [
  [T3 - 0.5, {x: BROOCH[0], y: BROOCH[1], z: 7}], [B.typist - 0.2, {x: BROOCH[0] + 10, y: BROOCH[1] + 20, z: 4.2}],
  [B.ethel + 0.4, {x: 560, y: 1080, z: 1.05}], [B.jewelry + 0.2, {x: 700, y: 900, z: 1.15}], [T4 - 0.3, {x: GL[0] - 40, y: GL[1] - 40, z: 2.6}], [T4, {x: GL[0] - 46, y: GL[1] - 44, z: 8}],
]), t);
export const s4Lens = () => toScreen(s4Cam(T4 - 0.001), [GL[0] - 46, GL[1] - 44]);
export const S4: StageFC = ({t, clip}) => {
  const twirl = Math.sin(t * 2.4) * 18, glass = ramp(t, B.ethel + 0.8, 0.6);
  return (
    <World cam={s4Cam(t)} bg={K.slate} clip={clip} id="s4">
      <InkDefs />
      <Layer k={0.6}><Ballroom t={t} plane="back" /></Layer>
      <Layer k={0.85}><Ballroom t={t} plane="dancers" /></Layer>
      <Layer k={1}>
        <g transform={`translate(${ETH[0] + twirl},0)`}><Fig who="ethel" x={0} y={ETH[1]} s={0.62} pose="dance" expr="smile" t={t} brooch /></g>
        {/* the brooch (clue yellow gem), with the hidden Spark glinting in it */}
        <g transform={`translate(${BROOCH[0] + twirl},${BROOCH[1]})`}>
          <SparkA x={4} y={-4} t={t} s={0.14 + 0.06 * Math.sin(t * 5)} />
        </g>
        <ClueRingA x={BROOCH[0] + twirl} y={BROOCH[1]} r={30} at={B.jewelry} t={t} />
        <P1Label x={ETH[0] + twirl} y={ETH[1] - 470} text="Ethel · the doctor's typist" o={win(t, B.typist, B.jewelry + 0.2, 0.3)} />
        <P1Label x={BROOCH[0] + twirl + 200} y={BROOCH[1] - 150} text="Cora's brooch" o={win(t, B.jewelry, T4 - 0.2, 0.25)} lineTo={[BROOCH[0] + twirl + 18, BROOCH[1] - 14]} />
        {/* Clara in her box, opera glasses up */}
        <Fig who="clara" x={BALL.box.x + 30} y={BALL.box.y + 260} s={0.5} pose="stand" expr="browUp" t={t} />
        <P1OperaGlasses x={GL[0]} y={lerp(GL[1] + 140, GL[1], glass)} s={0.5} rot={-8} glint={glass} />
      </Layer>
      <Layer k={1.4}><Ballroom t={t} plane="fore" /><Drifters t={t} color={K.lamp} n={9} o={0.3} fall={-15} seed={4} r={[10, 20]} /></Layer>
    </World>
  );
};

// ======================= S5 · Scotland Yard → Albion House (L11–L13) =======================
// kit ScotlandYard outside: shutter window x 460–620 y 640–880, door x 450–630 y 1080–1500, door lamps (400|680, 1080)
const AX = 2300;                          // Albion House door world x offset
const YWIN = {x: 462, y: 642, w: 156, h: 236};
const s5Cam = (t: number): Cam => drift(camAt(t, [
  [T4 - 0.5, {x: 400, y: 1080, z: 3.6}], [B.police + 0.8, {x: 470, y: 1060, z: 1.0}], [B.yard + 0.6, {x: 540, y: 960, z: 1.05}],
  [B.dew + 0.9, {x: 560, y: 1080, z: 1.3}], [B.ask + 1.6, {x: AX + 300, y: 1020, z: 1.0}], [B.thistime, {x: AX + 400, y: 1200, z: 1.5}],
  [B.ranaway + 0.3, {x: AX + 420, y: 1160, z: 1.6}], [T5 - 0.4, {x: AX + 600, y: 1260, z: 2.6}], [T5, {x: AX + 610, y: 1270, z: 9}],
]), t);
const POCKET: [number, number] = [AX + 610, 1270];
export const s5Pocket = () => toScreen(s5Cam(T5 - 0.001), POCKET);
export const S5: StageFC = ({t, clip}) => {
  const fr = Math.round(t * 30), f = (x: number) => Math.round(x * 30);
  const march = interpolate(t, [T4 - 0.3, B.yard + 0.3], [-560, 0], clamp);
  const shutter = ramp(t, B.yard, 0.5), hand = rampIO(t, B.dew + 0.4, 0.7);
  const dewWalk = rampIO(t, B.ask - 0.1, 1.9);
  const dewX = lerp(560, AX + 300, dewWalk);
  const doorOpen = ramp(t, B.ask + 1.4, 0.6);
  const nb = ramp(t, B.ask + 1.8, 0.4);
  const crumple = ramp(t, B.thistime + 0.3, 0.4), toss = rampIO(t, B.thistime + 0.7, 0.6);
  const card2 = ramp(t, B.newstory, 0.5), wet2 = ramp(t, B.ranaway + 0.2, 0.8);
  return (
    <World cam={s5Cam(t)} bg={K.deep} clip={clip} id="s5">
      <InkDefs />
      <Layer k={0.3}><rect x={-800} y={-800} width={5000} height={3600} fill={K.deep} /><KFog fr={fr} y={700} speed={0.6} op={0.4} seed={3} /></Layer>
      <Layer k={1}>
        <ScotlandYard fr={fr} view="outside" shutter={shutter} />
        {/* Dew in the window, lifting his bowler (clipped to the window) */}
        {t < B.dew + 0.2 && shutter > 0.3 && <g clipPath="url(#p1-ywin)" opacity={ramp(t, B.yard + 0.2, 0.3)}>
          <defs><clipPath id="p1-ywin"><rect x={YWIN.x} y={YWIN.y} width={YWIN.w} height={YWIN.h} /></clipPath></defs>
          <rect x={YWIN.x} y={YWIN.y} width={YWIN.w} height={YWIN.h} fill={K.lamp} opacity={0.6} />
          <Fig who="dew" x={540} y={1060} s={0.48} pose="liftHat" t={t} />
        </g>}
        {/* street between: shopfronts */}
        {[1250, 1600, 1950].map((x, i) => <Sh key={i} d={R(x, 520, 320, 980)} fill={i % 2 ? K.slate : K.mist} ht="far" line={4} />)}
        <g transform={`translate(${AX - 540 + 600},0)`}><AlbionDoor t={t} open={doorOpen} /></g>
        <g transform={`translate(${AX + 1030},760)`}><circle r={60} fill={K.newsprint} stroke={K.ink} strokeWidth={4} /><path d={`M0,0L${Math.sin(t * 0.8) * 44},${-Math.cos(t * 0.8) * 44}`} stroke={K.ink} strokeWidth={4} />
          <path d={`M0,70L${Math.sin(t * 3.1) * 40},200`} stroke={K.ink} strokeWidth={4} /><circle cx={Math.sin(t * 3.1) * 40} cy={206} r={16} fill={K.lamp} stroke={K.ink} strokeWidth={3} /></g>
        <Sh d={R(1000, 1500, 4000, 500)} fill={K.slate} line={3} />
        {/* pigeons lift as they march */}
        {Array.from({length: 5}).map((_, i) => { const k = ramp(t, B.police + 0.6 + i * 0.12, 1.6); return <Bird key={i} x={720 + i * 50 + k * 420} y={1490 - i * 8 - k * 900} t={t} fly={k > 0.02} s={0.9} seed={i} />; })}
        {/* the friends march, Clara with the Feather held high */}
        {(['clara', 'paul', 'guildLady', 'guildMan'] as const).map((w, i) => <Fig key={w} who={w} x={march + 100 + i * 100} y={1500} s={0.55} pose={march < -5 ? 'march' : i === 0 && t < B.dew + 0.4 ? 'flag' : 'stand'} expr="neutral" t={t + i * 0.3} />)}
        {t >= B.dew + 0.4 && t < B.dew + 1.1 && <FeatherA x={lerp(150, 590, hand)} y={lerp(1500 - 520, 1500 - 470 * 0.95, hand)} s={0.45} rot={lerp(-10, 60, hand)} t={t} state="flag" />}
        {/* Dew at the door: the Feather goes in his hatband; he strides to Albion House */}
        {t >= B.dew + 0.2 && <Fig who="dew" x={dewX} y={1500} s={0.66} pose={dewWalk > 0 && dewWalk < 1 ? 'walk' : t < B.dew + 1.2 ? 'liftHat' : t < B.thistime ? 'leanDoor' : 'write'} feather={t > B.dew + 1.1} t={t} expr="serious" />}
        {/* the tiny doctor in the doorway, looking up and up */}
        {doorOpen > 0.3 && <Fig who="doctor" x={AX + 580} y={1500} s={0.6} pose={t < B.thistime ? 'stand' : t < B.ranaway ? 'pocket' : 'talk'} expr="nervous" t={t}
          m={t < B.thistime ? 'bristle' : t < B.ranaway + 0.4 ? 'twitch' : 'sweat'} />}
        {nb > 0 && <Notebook fr={fr} x={AX + 170} y={740} scale={0.5 + nb * 0.06} rot={-4} open={ramp(t, B.ask + 2.2, 0.4)} lines={['Story 1: America', 'Story 2: ran away']} writeAt={f(B.ranaway - 0.2) - 20} />}
        {/* story cards from his pocket */}
        {t > B.thistime - 0.2 && toss < 1 && <P1StoryCard x={lerp(AX + 700, AX + 1300, toss)} y={lerp(1000, 640, toss) + toss * toss * 900} s={0.5} rot={toss * 300} kind="america" t={t} crumple={crumple} />}
        {card2 > 0 && <P1StoryCard x={AX + 610} y={lerp(1320, 950, card2)} s={0.66} kind="ranaway" t={t} wet={wet2} />}
        {card2 > 0 && <ClueRingA x={AX + 610 + 60 * 0.66} y={950 + (300 / 2 - 88 + 120) * 0.66} r={34} at={B.ranaway + 1.0} t={t} />}
      </Layer>
      <Layer k={1.4}><Drifters t={t} color={K.lamp} n={9} o={0.3} fall={-12} seed={5} r={[10, 20]} box={[-200, -200, 4200, 2320]} /></Layer>
    </World>
  );
};

// ======================= S6 · 39, dolls'-house section (L14) =======================
// kit HilldropSection (x 90–990, y 180–1820): parlour floor y 640, hall/kitchen floor y 1080 (hall x 600–970,
// kitchen 110–560), stairs from (600,1080) up to (920,680), COAL door x 400–520, cellar steps down-left to y ~1370,
// cellar floor y 1600.
const TOUR: [number, number][] = [[940, 1080], [640, 1080], [900, 690], [560, 640], [900, 690], [640, 1080], [470, 1080], [430, 1130], [230, 1380], [300, 1600], [600, 1600]];
const tour = (t: number): [number, number] => pathAt(TOUR, rampIO(t, B.showed - 0.1, B.cellar1 + 0.4 - B.showed));
const s6Cam = (t: number): Cam => {
  const [x, y] = tour(t);
  return drift(camAt(t, [
    [T5 - 0.5, {x: 940, y: 980, z: 3.4}], [B.showed + 0.5, {x: 560, y: 960, z: 1.0}], [B.cellar1 - 0.8, {x: (x + 540) / 2, y: (y + 960) / 2, z: 1.15}],
    [B.cellar1 + 0.5, {x: 470, y: 1500, z: 1.55}], [T6 - 0.35, {x: 900, y: 1040, z: 1.6}], [T6, {x: 940, y: 1000, z: 6}],
  ]), t, 0.6);
};
export const s6Door = () => toScreen(s6Cam(T6 - 0.001), [940, 1000]);
export const S6: StageFC = ({t, clip}) => {
  const fr = Math.round(t * 30);
  const [dx, dy] = tour(t), [px] = tour(t - 0.05);
  const goingLeft = dx < px - 0.5;
  const up = rampIO(t, B.cellar1 + 0.6, T6 - B.cellar1 - 0.6);
  const [ux, uy] = pathAt([[600, 1600], [300, 1600], [230, 1380], [430, 1130], [470, 1080], [940, 1080]], up);
  const fx = t > B.cellar1 + 0.6 ? ux : dx, fy = t > B.cellar1 + 0.6 ? uy : dy;
  return (
    <World cam={s6Cam(t)} bg={K.deep} clip={clip} id="s6">
      <InkDefs />
      <Layer k={0.3}><rect x={-800} y={-1600} width={2700} height={4400} fill={K.deep} /><KFog fr={fr} y={400} speed={0.5} op={0.3} seed={4} /></Layer>
      <Layer k={1}>
        <HilldropSection fr={fr} clockSpeed={3} />
        <Fig who="doctor" x={fx + 46} y={fy} s={0.3} pose={t > B.cellar1 && t < B.cellar1 + 0.7 ? 'usher' : 'walk'} expr="polite" t={t} flip={goingLeft} m="twitch" />
        <Fig who="dew" x={fx - 30} y={fy} s={0.36} pose={t > B.cellar1 && t < B.cellar1 + 0.7 ? 'holdLamp' : 'walk'} feather expr="serious" t={t + 0.2} flip={goingLeft} />
        {t > B.cellar1 - 0.3 && t < B.cellar1 + 0.8 && <PoliceLamp fr={fr} x={fx + 10} y={fy - 150} angle={30 + Math.sin(t * 3) * 20} scale={0.5} beamLen={420} />}
        <Cat x={interpolate(t, [T5, T6], [640, 940], clamp)} y={interpolate(t, [T5, T6], [1080, 700], clamp)} t={t} />
      </Layer>
      <Layer k={1.3}><Drifters t={t} color={K.lamp} n={10} o={0.3} fall={-14} seed={6} r={[8, 16]} box={[-200, -200, 1480, 2400]} /></Layer>
    </World>
  );
};

// ======================= S7 · 39 by day (L15) =======================
const s7Cam = (t: number): Cam => drift(camAt(t, [
  [T6 - 0.5, {x: H39.fan[0], y: H39.fan[1], z: 4}], [B.insleft + 0.7, {x: 560, y: 1120, z: 1.1}], [B.cameback, {x: 600, y: 1140, z: 1.15}],
  [B.gone + 0.2, {x: H39.doorX - 60, y: 1100, z: 1.6}], [T7 - 0.3, {x: H39.doorX + 10, y: 1170, z: 3.4}], [T7, {x: H39.doorX + 10, y: 1170, z: 9}],
]), t);
export const s7Steam = () => toScreen(s7Cam(T7 - 0.001), [H39.doorX + 10, 1170]);
export const S7: StageFC = ({t, clip}) => {
  const fr = Math.round(t * 30), f = (x: number) => Math.round(x * 30);
  const off = rampIO(t, B.insleft, 1.2), back = rampIO(t, B.cameback - 0.9, 0.9);
  const dewX = t < B.cameback - 0.9 ? lerp(H39.doorX - 110, -300, off) : lerp(-300, H39.doorX - 150, back);
  const dewY = t < B.cameback - 0.9 ? lerp(H39.stepTop, H39.ground, Math.min(1, off * 2)) : lerp(H39.ground, H39.stepTop, Math.max(0, back * 2 - 1));
  const knock = t > B.cameback + 0.1 && t < B.cameback + 0.9 ? Math.abs(Math.sin((t - B.cameback) * 18)) : 0;
  const open = ramp(t, B.cameback + 1.2, 0.6);
  const D = {x: 706, y: 1000, w: 128, h: 322};
  return (
    <World cam={s7Cam(t)} bg={K.fog} clip={clip} id="s7">
      <InkDefs />
      <Layer k={1}>
        <Hilldrop fr={fr} variant="day" door={open} />
        <g clipPath="url(#p1-win7)"><defs><clipPath id="p1-win7"><rect x={WIN[0] - H39.winW / 2} y={WIN[1] - H39.winH / 2} width={H39.winW} height={H39.winH} /></clipPath></defs>
          <rect x={WIN[0] - 140} y={WIN[1] - 130} width={280} height={260} fill={K.fog} />
          <WallCalendar fr={fr} x={WIN[0] - 60} y={WIN[1] - 60} scale={0.5} months={['8 July 1910', '11 July 1910']} flipAt={[f(B.insleft + 1.0)]} />
          <path d={`M${WIN[0] - 45},${WIN[1] - 125}V${WIN[1] + 125}M${WIN[0] + 45},${WIN[1] - 125}V${WIN[1] + 125}`} stroke={K.ink} strokeWidth={6} />
        </g>
        {/* the open door shows the hall: a chair still spinning, a cup still steaming, two empty hat-pegs, one swinging */}
        {open > 0.2 && <g opacity={open} clipPath="url(#p1-door7)">
          <defs><clipPath id="p1-door7"><rect x={D.x} y={D.y} width={D.w} height={D.h} /></clipPath></defs>
          <rect x={D.x} y={D.y} width={D.w} height={D.h} fill={K.mist} />
          <path d={`M${D.x},${D.y + 260}H${D.x + D.w}`} stroke={K.ink} strokeWidth={4} />
          {[0, 1].map((i) => <path key={i} d={`M${D.x + 40 + i * 50},${D.y + 60}l${i ? Math.sin(t * 4) * 10 : 0},26`} stroke={K.ink} strokeWidth={7} strokeLinecap="round" />)}
          <g transform={`translate(${D.x + 40},${D.y + 300}) scale(${Math.cos(t * 7)},1)`}><path d="M-26,0V-50H26V0M-26,-50V-110" stroke={K.ink} strokeWidth={6} fill="none" /></g>
          <Sh d={R(D.x + 78, D.y + 230, 34, 26, 6)} fill={K.newsprint} line={3} />
          {[0, 1, 2].map((i) => { const k = ((t * 0.8 + i / 3) % 1); return <circle key={i} cx={D.x + 95 + Math.sin(k * 6 + i) * 10} cy={D.y + 220 - k * 120} r={7 + k * 12} fill={K.newsprint} opacity={0.75 * (1 - k)} />; })}
        </g>}
        <Puffs x={830} y={360} t={t} c={K.mist} />
        {[0, 1].map((i) => <Bird key={i} x={((t * (110 + i * 50) + i * 700) % 1700) - 300} y={300 + i * 160 + Math.sin(t * 2 + i) * 30} t={t} fly s={0.9} seed={i} />)}
        <g opacity={0.9 * (1 - ramp(t, B.cameback, 0.5))}><Fig who="guildLady" x={1250 - ((t - T6) * 150)} y={1560} s={0.52} pose="walk" t={t} flip far /></g>
        <g opacity={0.9 * (1 - ramp(t, B.cameback, 0.5))}><Fig who="guildMan" x={-200 + ((t - T6) * 210)} y={1590} s={0.55} pose="walk" t={t + 0.5} far /></g>
        <Fig who="dew" x={dewX} y={dewY} s={0.55} pose={(off > 0 && off < 1) || (back > 0 && back < 1) ? 'walk' : t > B.gone ? 'leanDoor' : 'stand'} feather expr="serious" flip={t < B.cameback - 0.9 && off > 0} t={t} />
        {t > B.gone - 1.0 && <Notebook fr={fr} x={865} y={850} scale={0.5} rot={4} open={ramp(t, B.gone - 1.0, 0.3)} lines={['Doctor + Ethel: gone']} writeAt={f(B.gone - 0.7)} />}
        {knock > 0 && <path d={`M${H39.doorX - 80},${1170}l${30 + knock * 30},0`} stroke={K.ink} strokeWidth={12} strokeLinecap="round" />}
      </Layer>
    </World>
  );
};

// ======================= S8 · the cellar, then up to the street (L16–L17) =======================
// kit CellarFloor: a closed brick floor (y 700–1700) viewed from above, three lamp pools, the wall above it; nothing
// under it, ever. Above the wall (y < 0) this stage adds the street: the newsboy's board and the WANTED poster.
const BOARD: [number, number] = [560, -420];
const s8Cam = (t: number): Cam => drift(camAt(t, [
  [T7 - 0.5, {x: 560, y: 700, z: 2.4}], [B.under, {x: 560, y: 820, z: 1.3}], [B.remains + 0.4, {x: 540, y: 640, z: 1.6}],
  [B.remains + 1.2, {x: 540, y: -330, z: 1.2}], [B.doctor + 0.6, {x: BOARD[0], y: BOARD[1] + 40, z: 1.5}],
  [T8 - 0.4, {x: BOARD[0], y: BOARD[1] + WANTED_OVAL[1] * 0.62, z: 2.6}], [T8, {x: BOARD[0], y: BOARD[1] + WANTED_OVAL[1] * 0.62, z: 9}],
]), t);
export const s8Oval = () => toScreen(s8Cam(T8 - 0.001), [BOARD[0], BOARD[1] + WANTED_OVAL[1] * 0.62]);
export const S8: StageFC = ({t, clip}) => {
  const fr = Math.round(t * 30), f = (x: number) => Math.round(x * 30);
  const hatOff = t > B.remains;
  const slam = ramp(t, B.remains + 1.0, 0.25), toWanted = rampIO(t, B.doctor - 0.1, 0.3);
  return (
    <World cam={s8Cam(t)} bg={K.deep} clip={clip} id="s8">
      <InkDefs />
      <Layer k={1}>
        {/* the street above */}
        <rect x={-800} y={-2200} width={2700} height={2200} fill={K.deep} />
        <KFog fr={fr} y={-700} speed={0.6} op={0.35} seed={7} />
        <Sh d={R(-600, -60, 2300, 60)} fill={K.slate} line={4} />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${440 + i * 40},-60v60`} stroke={K.ink} strokeWidth={6} />)}
        <CellarFloor fr={fr} lamps={3} wobbleAt={f(B.under + 0.3)} />
        <Fig who="constable" x={230} y={980} s={0.75} pose="lampLow" expr="still" litBelow={1} t={t} />
        <Fig who="constable" x={860} y={980} s={0.75} pose="lampLow" expr="still" litBelow={1} t={t + 1} flip />
        <Fig who="dew" x={545} y={940} s={0.78} pose={hatOff ? 'hatOff' : 'holdLamp'} expr="still" litBelow={1} feather t={t} />
        <Fig who="newsboy" x={240} y={-60} s={0.75} pose="shout" t={t} />
        <g transform={`translate(${BOARD[0]},${BOARD[1] - (1 - slam) * 400})`}>
          <g transform={`scale(${Math.max(0.02, Math.abs(Math.cos(toWanted * Math.PI)))},1)`}>
            {toWanted < 0.5 ? <PaperA x={0} y={0} s={0.5} headline="CELLAR DISCOVERY" date="14 July 1910" t={t} /> : <WantedA x={0} y={0} s={0.62} t={t} walkAt={Math.round((B.doctor + 0.1) * 30)} />}
          </g>
        </g>
      </Layer>
      <Layer k={1.3}><Drifters t={t} color={K.lamp} n={10} o={0.3} fall={-14} seed={8} r={[8, 16]} box={[-200, -1200, 1480, 3200]} /></Layer>
    </World>
  );
};

// ======================= S9 · the night sea (L17 end) =======================
const SHIP = {x: 520, y: 1330, s: 0.62};
const PORTHOLE: [number, number] = [SHIP.x + MONTROSE_PTS.porthole[0] * SHIP.s, SHIP.y + MONTROSE_PTS.porthole[1] * SHIP.s];
export const S9: StageFC = ({t, clip}) => {
  const fr = Math.round(t * 30);
  const cam = drift(camAt(t, [[T8 - 0.5, {x: PORTHOLE[0], y: PORTHOLE[1], z: 3.2}], [T8 + 1.2, {x: 540, y: 1080, z: 1.2}], [B.total, {x: 540, y: 1060, z: 1.12}]]), t);
  return (
    <World cam={cam} bg={K.deep} clip={clip} id="s9">
      <InkDefs />
      <Layer k={0.5}><Sea fr={fr} sky="night" horizon={1100} layer="back" /></Layer>
      <Layer k={1}>
        <Sea fr={fr} sky="night" horizon={1100} skyOn={false} layer="mid" />
        <g transform={`translate(${(t - T8) * 70},0)`}>
          {Array.from({length: 5}).map((_, i) => { const k = ((t * 0.7 + i / 5) % 1); return <path key={i} d={`M${SHIP.x - 330 - k * 300},${SHIP.y + 10 + i * 6}h${80 - k * 60}`} stroke={K.newsprint} strokeWidth={5} opacity={0.6 * (1 - k)} strokeLinecap="round" />; })}
          <Montrose fr={fr} x={SHIP.x} y={SHIP.y} scale={SHIP.s} lit />
          <SparkA x={PORTHOLE[0] + 16} y={PORTHOLE[1] - 14} t={t} s={0.45} />
        </g>
        {Array.from({length: 12}).map((_, i) => <circle key={i} cx={60 + i * 90 + Math.sin(i) * 30} cy={560 + (i % 4) * 80} r={3 + (i % 3)} fill={K.newsprint} opacity={0.3 + 0.6 * Math.abs(Math.sin(t * (1 + (i % 4) * 0.6) + i))} />)}
        <g transform="translate(1000,1080)"><rect x={-10} y={-140} width={20} height={140} fill={K.newsprint} stroke={K.ink} strokeWidth={3} /><path d={`M0,-130L${Math.cos(t * 1.4) * 900},${-130 + Math.sin(t * 1.4) * 40}`} stroke={K.lamp} strokeWidth={30} opacity={0.25} strokeLinecap="round" /></g>
        <SeaBirds fr={fr} count={4} area={[0, 1060, 1080, 360]} seed={2} size={1.3} color={K.mist} />
      </Layer>
      <Layer k={1.3}><Sea fr={fr} sky="night" horizon={1100} skyOn={false} layer="front" /></Layer>
    </World>
  );
};
