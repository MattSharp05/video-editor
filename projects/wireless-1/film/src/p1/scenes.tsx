// Part 1 stages. One camera thread; each stage is a world with its own camera keys, handed off by push-throughs
// (thru.tsx). Every time is a beat from beats.json + an offset. Shared characters/sets/devices come through the adapter
// (cast.tsx → kit), part-only sets/props from sets.tsx / props.tsx.
import React from 'react';
import {interpolate} from 'remotion';
import B from '../beats.json';
import {World, Layer, camAt, drift, ramp, rampIO, win, lerp, clamp, hash, toScreen, Cam} from './rig';
import {InkDefs, Sh, R, E, Glow} from './ink';
import {K, FONT} from './tok';
import {LondonStreet, STREET, MusicHall, STAGE, Ballroom, BALL, AlbionDoor, ALBION} from './sets';
import {P1Card, P1OperaGlasses, P1StoryCard} from './props';
import {
  Fig, SparkA, SparkTrailA, MoustacheA, FeatherA, ClueRingA, BalloonA, CalendarA, NotebookA, PaperA, WantedA, LampA,
  House39A, H39, SectionA, SEC, YardA, SeaA, PAPER_MAST, PAPER_PORTRAIT, WANTED_OVAL,
} from './cast';
import type {StageFC} from './thru';

type Clip = {x: number; y: number; r: number} | undefined;
const pathAt = (pts: [number, number][], k: number): [number, number] => {
  const n = pts.length - 1, u = Math.min(n - 1e-6, Math.max(0, k * n)), i = Math.floor(u), f = u - i;
  return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
};
export const Snow: React.FC<{t: number; n?: number; o?: number; x0?: number; w?: number; y0?: number; h?: number}> = ({t, n = 70, o = 1, x0 = -300, w = 1700, y0 = -200, h = 2300}) => (
  <g opacity={o}>{Array.from({length: n}).map((_, i) => {
    const sp = 60 + hash(i) * 90, x = x0 + ((hash(i + 3) * w + Math.sin(t * 0.8 + i) * 30) % w), y = y0 + ((hash(i + 7) * h + t * sp) % h);
    return <circle key={i} cx={x} cy={y} r={2.5 + hash(i + 11) * 4} fill={K.newsprint} opacity={0.75} />;
  })}</g>
);

// ======================= S1 · London street at night (L1–L2) =======================
export const T1 = B.cora - 0.05;
const PB = STREET.playbill, PB_PIC: [number, number] = [PB.x + 180, PB.y + 347];
const NEWS: [number, number] = [250, 1500];            // newsboy's feet
const PAPER: [number, number] = [372, 1080];           // centre of the paper he holds up (world)
const PS = 0.42, MAST: [number, number] = [PAPER[0] + PAPER_MAST[0] * PS, PAPER[1] + PAPER_MAST[1] * PS], PORT: [number, number] = [PAPER[0] + PAPER_PORTRAIT[0] * PS, PAPER[1] + PAPER_PORTRAIT[1] * PS];
const s1Cam = (t: number): Cam => drift(camAt(t, [
  [0, {x: 720, y: -820, z: 1.05}], [1.4, {x: 690, y: -560, z: 1}], [4.0, {x: 540, y: 980, z: 1}],
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
        <SparkTrailA pts={trail} />
        <SparkA x={sp[0]} y={sp[1]} t={t} s={t < 1 ? 1.3 : 0.8} tap={tapAt(t)} />
      </Layer>
      <Layer k={1.4}><g opacity={0.5}><FogBand t={t + 3} y={1650} sp={26} /></g></Layer>
    </World>
  );
};
// title Morse taps (C-B-W): 2.4–4.0 s, one flash per tap
export const TAPS = [2.4, 2.55, 2.75, 2.9, 3.15, 3.28, 3.4, 3.52, 3.72, 3.84, 3.97].map((x) => x);
export const tapAt = (t: number) => Math.max(0, ...TAPS.map((a) => (t >= a && t < a + 0.12 ? 1 - (t - a) / 0.12 : 0)));
const FogBand: React.FC<{t: number; y: number; sp: number}> = ({t, y, sp}) => (
  <g>{Array.from({length: 6}).map((_, i) => <ellipse key={i} cx={-400 + ((i * 420 + t * sp) % 2400)} cy={y + Math.sin(i) * 40} rx={360} ry={70} fill={K.fog} opacity={0.35} />)}</g>
);

// ======================= S2 · the music hall (L3–L4) =======================
export const T2 = B.winter - 0.1;
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
  const LAND = B.mustache - 0.27, mFly = rampIO(t, B.mustache - 1.1, 0.83);
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
          <Sh d={R(-120, -330, 240, 70, 6)} fill={K.newsprint} line={3} />
          <text x={0} y={-286} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={30} fill={K.ink}>Mr. H. H. Crippen</text>
        </g>
        {docIn > 0 && <g transform={`translate(${(1 - docIn) * 160},0)`}><Fig who="doctor" x={DOC_X} y={STAGE.floor} s={DOC_S} pose="stand" expr={t > B.mustache + 0.3 ? 'nervous' : 'polite'} t={t} glintAt={Math.round(B.glasses * 30)}
          m={t < LAND ? 'none' : t < B.mustache + 0.3 ? 'land' : t < B.mustache + 1.0 ? 'twitch' : 'on'} mAt={Math.round(LAND * 30)} /></g>}
        {t > B.mustache - 1.1 && t < LAND && <MoustacheA x={mPos[0]} y={mPos[1]} s={0.8} state="fly" t={t} />}
        {t > B.glasses + 0.3 && <SparkA x={LENS[0]} y={LENS[1]} t={t} s={0.25} />}
      </Layer>
      <Layer k={1}><MusicHall t={t} plane="house" /></Layer>
      <Layer k={1.4}><MusicHall t={t} plane="fore" /></Layer>
    </World>
  );
};

// ======================= S3 · 39 Hilldrop Crescent (L5–L9) =======================
export const T3 = B.else + 0.3;
const WIN: [number, number] = [H39.winX, H39.winY];
const STEP_TOP: [number, number] = [H39.doorX, H39.stepTop];
const DAY = B.never - 0.2;
const s3Cam = (t: number): Cam => drift(camAt(t, [
  [T2 - 0.5, {x: WIN[0], y: WIN[1], z: 2.8}], [B.dinner + 1.2, {x: WIN[0] + 20, y: WIN[1] + 10, z: 2.5}],
  [B.left + 0.9, {x: 520, y: 1080, z: 1.05}], [B.steps_end, {x: 560, y: 1080, z: 1.1}], [B.again + 0.6, {x: 600, y: 1140, z: 1.25}],
  [B.america, {x: 560, y: 1060, z: 1.2}], [B.died, {x: 520, y: 1100, z: 1.35}], [B.funeral + 1.0, {x: 540, y: 1020, z: 1.15}],
  [B.fuzzy_end, {x: 640, y: 980, z: 1.4}], [T3, {x: 640, y: 960, z: 2.6}],
]), t);
export const S3: StageFC = ({t, clip}) => {
  const day = rampIO(t, DAY, 0.8);
  const leave = rampIO(t, B.left, 1.8);
  const doorClose = ramp(t, B.steps_end - 0.1, 0.4);
  const featherFall = rampIO(t, B.steps_end, 0.6);
  const coraOn = t < B.steps_end + 0.1;
  const docAt = t > B.soon - 0.5;
  const friendsBack = rampIO(t, B.soon - 0.4, 1.0);
  const pick = rampIO(t, B.america - 0.6, 0.6);
  // feather: on the top step → blows down to the foot as the friends arrive → in Clara's hand (flag)
  const blow = rampIO(t, B.soon - 0.3, 0.9);
  const fPos: [number, number] = t < B.soon - 0.3 ? [lerp(STEP_TOP[0] + 40, STEP_TOP[0] - 10, featherFall), lerp(STEP_TOP[1] - 160, STEP_TOP[1] - 4, featherFall)] : [lerp(STEP_TOP[0] - 10, 380, blow), lerp(STEP_TOP[1] - 4, H39.ground - 6, blow) - Math.sin(blow * Math.PI) * 120];
  const balloonA = win(t, B.america - 0.2, B.sick - 0.1, 0.25), drip = ramp(t, B.america + 0.5, 0.8), ring1 = ramp(t, B.america + 1.0, 0.27);
  const tele = win(t, B.sick - 0.1, B.questions - 0.1, 0.25);
  const brow = ramp(t, B.died + 0.2, 0.3);
  const q1 = win(t, B.where - 0.1, B.fuzzy, 0.2), q2 = win(t, B.funeral - 0.1, B.fuzzy + 0.2, 0.2);
  const fz = ramp(t, B.fuzzy - 0.1, 0.5), fog = ramp(t, B.fuzzy + 0.3, 1.2);
  const glint = ramp(t, B.fuzzy_end + 0.1, 0.4);
  const mState = (t < B.america ? 'on' : t < B.sick ? 'twitch' : t < B.questions ? 'sob' : t < B.fuzzy ? 'on' : 'twitch') as 'on';
  return (
    <World cam={s3Cam(t)} bg={K.deep} clip={clip} id="s3">
      <InkDefs />
      <Layer k={0.3}>
        <rect x={-800} y={-800} width={2700} height={3600} fill={K.deep} />
        <rect x={-800} y={-800} width={2700} height={3600} fill={K.fog} opacity={day * 0.75} />
        <path d="M-600,560L-400,420L-200,560L100,400L400,560L700,380L1000,560L1300,420L1700,560V900H-600z" fill={K.mist} opacity={0.4} />
      </Layer>
      <Layer k={1}>
        <House39A t={t} mode={day > 0.5 ? 'day' : 'snow'} doorOpen={t < B.left + 1.2 || (docAt && t > B.soon - 0.3) ? 1 - doorClose * (t < B.soon - 0.3 ? 1 : 0) : 0} />
        {/* parlour interior through the window: cards, laughter, the clock racing to 1:30 */}
        <g clipPath="url(#p1-win)">
          <defs><clipPath id="p1-win"><rect x={WIN[0] - 156} y={WIN[1] - 136} width={312} height={272} /></clipPath></defs>
          {day < 1 && <ParlourView t={t} />}
          {day > 0 && <g opacity={day}><rect x={WIN[0] - 156} y={WIN[1] - 136} width={312} height={272} fill={K.fog} />
            <CalendarA x={WIN[0] + 60} y={WIN[1] - 20} s={0.7} label={t < B.again + 0.2 ? 'February 1910' : 'March 1910'} flip={win(t, B.again - 0.1, B.again + 0.5, 0.2)} /></g>}
        </g>
        {/* the friends leave down the steps (night), come back (day) */}
        {t < B.never && <>
          <Fig who="clara" x={lerp(STEP_TOP[0] - 40, -260, leave)} y={lerp(STEP_TOP[1], H39.ground, Math.min(1, leave * 2.2))} s={0.5} pose={leave > 0 && leave < 1 ? 'walk' : 'stand'} t={t} flip={leave > 0.5} />
          <Fig who="paul" x={lerp(STEP_TOP[0] + 30, -150, leave)} y={lerp(STEP_TOP[1], H39.ground, Math.min(1, leave * 1.8))} s={0.5} pose={leave > 0 && leave < 1 ? 'walk' : 'stand'} t={t + 1} flip={leave > 0.5} />
        </>}
        {coraOn && t > B.left - 0.4 && <Fig who="cora" x={STEP_TOP[0] + 20} y={STEP_TOP[1]} s={0.5 * (1 - doorClose * 0.15)} pose={t > B.goodbye - 0.1 ? 'wave' : 'stand'} expr="smile" t={t} />}
        {t > B.steps_end - 0.05 && !(t > B.america - 0.1) && <FeatherA x={fPos[0]} y={fPos[1]} s={0.5} rot={featherFall < 1 ? (1 - featherFall) * 60 : 80} t={t} />}
        {/* footprints in the snow, filling */}
        {day > 0 && day < 1.01 && t < B.soon && Array.from({length: 6}).map((_, i) => <ellipse key={i} cx={STEP_TOP[0] - 160 - i * 70} cy={H39.ground + 30 + (i % 2) * 18} rx={22} ry={8} fill={K.deep} opacity={0.5 * (1 - ramp(t, DAY + 0.2, 1.6))} />)}
        {/* a cat crosses the railings by day */}
        {t > DAY && t < B.soon + 1 && <Cat x={interpolate(t, [DAY, B.soon + 1], [-120, 1160], clamp)} y={H39.stepTop - 30} t={t} />}
        {docAt && <>
          <Fig who="doctor" x={STEP_TOP[0] + 10} y={STEP_TOP[1]} s={0.55} pose={t < B.sick ? 'talk' : t < B.questions ? 'telegram' : t < B.fuzzy ? 'stand' : 'shrug'} expr={t < B.questions ? 'polite' : 'nervous'} t={t} m={mState} />
          <g transform={`translate(${(1 - friendsBack) * -500},0)`}>
            <Fig who="clara" x={330} y={H39.ground} s={0.58} pose={pick > 0 && pick < 1 ? 'lean' : t > B.america ? 'march' : 'walk'} expr={brow > 0.5 ? 'browUp' : 'neutral'} t={t} />
            <Fig who="paul" x={170} y={H39.ground} s={0.6} pose="stand" expr="neutral" t={t + 2} />
          </g>
          {t > B.america - 0.1 && <FeatherA x={360} y={H39.ground - 400 * 0.58} s={0.5} rot={-10} t={t} />}
        </>}
        {balloonA > 0 && <g opacity={balloonA}><BalloonA x={720} y={560} w={420} h={300} tail={[STEP_TOP[0] + 30, STEP_TOP[1] - 380]}>
          <P1StoryCard x={720} y={560} s={0.9} kind="america" t={t} wet={drip} />
        </BalloonA><ClueRingA x={774} y={560 + 62 + drip * 105} r={40} k={ring1} /></g>}
        {tele > 0 && <g opacity={tele} transform={`translate(${STEP_TOP[0] + 120},${STEP_TOP[1] - 250}) rotate(${Math.sin(t * 5) * 6})`}>
          <Sh d={R(-80, -50, 160, 100, 4)} fill={K.newsprint} line={3} /><text x={0} y={8} textAnchor="middle" fontFamily={FONT.wire} fontWeight={700} fontSize={30} fill={K.ink}>TELEGRAM</text>
          <path d={`M-150,40q-20,${30 + Math.sin(t * 9) * 12} 10,60`} stroke={K.newsprint} strokeWidth={30} fill="none" strokeLinecap="round" />
        </g>}
        {brow > 0 && t < B.where && <text x={330} y={H39.ground - 680 * 0.58 - 40 - brow * 30} textAnchor="middle" fontFamily={FONT.display} fontSize={90} fill={K.newsprint} opacity={brow}>?</text>}
        {q1 > 0 && <g opacity={q1}><BalloonA x={330} y={760} w={400} h={120} tail={[330, H39.ground - 420]}><text x={330} y={776} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={44} fill={K.ink}>Where in America?</text></BalloonA></g>}
        {q2 > 0 && <g opacity={q2}><BalloonA x={300} y={600} w={430} h={120} tail={[180, H39.ground - 440]}><text x={300} y={616} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={40} fill={K.ink}>When was the funeral?</text></BalloonA></g>}
        {fz > 0 && [0, 1, 2].map((i) => {
          const g = ramp(t, B.fuzzy - 0.1 + i * 0.25, 0.6);
          return <g key={i} opacity={g * (1 - fog * 0.6)}><BalloonA x={780 + i * 40} y={700 - i * 140} w={300 + fog * 400} h={110 + fog * 200} tail={[STEP_TOP[0] + 30, STEP_TOP[1] - 380]} fuzzy={1}>
            <text x={780 + i * 40} y={712 - i * 140} textAnchor="middle" fontFamily={FONT.period} fontSize={40} fill={K.ink} opacity={0.45} style={{filter: 'blur(3px)'}}>{['well… er…', 'somewhere…', 'hmm…'][i]}</text></BalloonA></g>;
        })}
        {fog > 0 && Array.from({length: 9}).map((_, i) => <ellipse key={i} cx={640 + Math.cos(i * 1.7 + t * 0.4) * (200 + fog * 260)} cy={960 + Math.sin(i * 2.3 + t * 0.3) * (160 + fog * 220)} rx={220 + fog * 160} ry={140 + fog * 90} fill={K.fog} opacity={0.55 * fog} />)}
        {glint > 0 && <SparkA x={640} y={960} t={t} s={0.4 + glint * 0.5} />}
      </Layer>
      <Layer k={1.3}><Snow t={t} o={1 - day} n={60} /></Layer>
    </World>
  );
};
const ParlourView: React.FC<{t: number}> = ({t}) => {
  const [x, y] = WIN, clock = interpolate(t, [T2, B.left], [0, 1], clamp);
  return (
    <g>
      <rect x={x - 160} y={y - 140} width={320} height={280} fill={K.lamp} opacity={0.85} />
      <rect x={x - 160} y={y - 140} width={320} height={280} fill="url(#p1-htf)" />
      {/* mantel clock racing to 1:30 */}
      <g transform={`translate(${x + 100},${y - 80})`}>
        <circle r={26} fill={K.newsprint} stroke={K.ink} strokeWidth={3} />
        <path d={`M0,0L${Math.sin(clock * Math.PI * 2 * 5.5) * 20},${-Math.cos(clock * Math.PI * 2 * 5.5) * 20}`} stroke={K.ink} strokeWidth={3} />
        <path d={`M0,0L${Math.sin(clock * Math.PI * (2 * 5.5 / 12) + Math.PI * 1.5) * 13},${-Math.cos(clock * Math.PI * (2 * 5.5 / 12) + Math.PI * 1.5) * 13}`} stroke={K.ink} strokeWidth={4} />
      </g>
      <Sh d={R(x - 120, y + 50, 240, 20)} fill={K.deep} line={2} />
      <Fig who="clara" x={x - 110} y={y + 140} s={0.24} pose="laugh" t={t} />
      <Fig who="cora" x={x - 20} y={y + 140} s={0.26} pose="deal" t={t} />
      <Fig who="paul" x={x + 70} y={y + 140} s={0.24} pose="laugh" t={t + 1} />
      <Fig who="doctor" x={x + 135} y={y + 140} s={0.2} pose="stand" expr="blank" t={t} />
      {[0, 1, 2, 3].map((i) => { const k = ((t * 1.3 + i * 0.25) % 1); return <P1Card key={i} x={x - 20 + (i - 1.5) * 50 * k} y={y + 40 - Math.sin(k * Math.PI) * 30} s={0.3} flip={k} suit={(i % 4) as 0} rot={(i - 1.5) * 10} />; })}
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
export const T4 = B.police - 0.1;
const ETH: [number, number] = [470, BALL.floor];
const ETH_H = 650 * 0.62, BROOCH: [number, number] = [ETH[0] + 26 * ETH_H / 760, ETH[1] - 500 * ETH_H / 760];
const GL: [number, number] = [BALL.box.x + 30, BALL.box.y + 50];  // Clara's opera glasses (world)
const s4Cam = (t: number): Cam => drift(camAt(t, [
  [T3 - 0.5, {x: BROOCH[0], y: BROOCH[1], z: 7}], [B.typist - 0.2, {x: BROOCH[0] + 10, y: BROOCH[1] + 20, z: 4.2}],
  [B.ethel + 0.4, {x: 560, y: 1080, z: 1.05}], [B.jewelry + 0.2, {x: 700, y: 900, z: 1.15}], [T4 - 0.3, {x: GL[0] - 40, y: GL[1] - 40, z: 2.6}], [T4, {x: GL[0] - 46, y: GL[1] - 44, z: 8}],
]), t);
export const s4Lens = () => toScreen(s4Cam(T4 - 0.001), [GL[0] - 46, GL[1] - 44]);
export const S4: StageFC = ({t, clip}) => {
  const twirl = Math.sin(t * 2.4) * 18, glass = ramp(t, B.ethel + 0.8, 0.6), ring = ramp(t, B.jewelry, 0.27);
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
        <ClueRingA x={BROOCH[0] + twirl} y={BROOCH[1]} r={34} k={ring} />
        {/* her dance card */}
        <g transform={`translate(${ETH[0] + twirl + 120},${ETH[1] - 330}) rotate(${Math.sin(t * 3) * 10})`}><path d="M-30,-40L0,-60" stroke={K.ink} strokeWidth={2} /><Sh d={R(-50, -40, 100, 60, 4)} fill={K.newsprint} line={2} /><text x={0} y={-2} textAnchor="middle" fontFamily={FONT.period} fontStyle="italic" fontSize={28} fill={K.ink}>Ethel</text></g>
        {/* Clara in her box, opera glasses up */}
        <Fig who="clara" x={BALL.box.x + 30} y={BALL.box.y + 260} s={0.5} pose="stand" expr="browUp" t={t} />
        <P1OperaGlasses x={GL[0]} y={lerp(GL[1] + 140, GL[1], glass)} s={0.5} rot={-8} glint={glass} />
      </Layer>
      <Layer k={1.4}><Ballroom t={t} plane="fore" /></Layer>
    </World>
  );
};

// ======================= S5 · Scotland Yard → Albion House (L11–L13) =======================
export const T5 = B.showed - 0.1;
const YARD_DOOR: [number, number] = [540, 1500];
const AX = 2300;                          // Albion House door world x offset
const s5Cam = (t: number): Cam => drift(camAt(t, [
  [T4 - 0.5, {x: 380, y: 520, z: 3.5}], [B.police + 0.8, {x: 420, y: 980, z: 1.0}], [B.yard + 0.6, {x: 540, y: 900, z: 1.0}],
  [B.dew + 0.9, {x: 600, y: 1060, z: 1.3}], [B.ask + 1.6, {x: AX + 300, y: 1020, z: 1.0}], [B.thistime, {x: AX + 400, y: 1200, z: 1.5}],
  [B.ranaway + 0.3, {x: AX + 420, y: 1160, z: 1.6}], [T5 - 0.4, {x: AX + 600, y: 1260, z: 2.6}], [T5, {x: AX + 610, y: 1270, z: 9}],
]), t);
const POCKET: [number, number] = [AX + 610, 1270];
export const s5Pocket = () => toScreen(s5Cam(T5 - 0.001), POCKET);
export const S5: StageFC = ({t, clip}) => {
  const march = interpolate(t, [T4 - 0.3, B.yard + 0.3], [-500, 0], clamp);
  const shutter = ramp(t, B.yard, 0.5), hand = rampIO(t, B.dew + 0.4, 0.7);
  const dewWalk = rampIO(t, B.ask - 0.1, 1.9);
  const dewX = lerp(YARD_DOOR[0] + 60, AX + 300, dewWalk);
  const doorOpen = ramp(t, B.ask + 1.4, 0.6);
  const nb = ramp(t, B.ask + 1.8, 0.4);
  const crumple = ramp(t, B.thistime + 0.3, 0.4), toss = rampIO(t, B.thistime + 0.7, 0.6);
  const card2 = ramp(t, B.newstory, 0.5), wet2 = ramp(t, B.ranaway + 0.2, 0.8);
  const write = ramp(t, B.ranaway + 0.4, 1.0);
  return (
    <World cam={s5Cam(t)} bg={K.deep} clip={clip} id="s5">
      <InkDefs />
      <Layer k={0.3}><rect x={-800} y={-800} width={5000} height={3600} fill={K.deep} /><g opacity={0.5}><FogBand t={t} y={700} sp={18} /></g></Layer>
      <Layer k={1}>
        <YardA t={t} shutter={shutter} />
        {/* the two door lamps (where the opera-glass lenses landed) */}
        {[440, 640].map((x) => <g key={x}><Glow x={x} y={1060} r={120} o={0.7 + 0.15 * Math.sin(t * 6 + x)} /><Sh d={R(x - 20, 1030, 40, 56, 6)} fill={K.lamp} line={3} /></g>)}
        {/* street between: shopfronts passing */}
        {[1300, 1650, 2000].map((x, i) => <Sh key={i} d={R(x, 500, 320, 1000)} fill={i % 2 ? K.slate : K.mist} ht="far" line={4} />)}
        <g transform={`translate(${AX - 540 + 600},0)`}><AlbionDoor t={t} open={doorOpen} /></g>
        <Sh d={R(-600, 1500, 5000, 500)} fill={K.slate} line={3} />
        {/* pigeons lift as they march */}
        {Array.from({length: 5}).map((_, i) => { const k = ramp(t, B.police + 0.6 + i * 0.12, 1.6); return <path key={i} d={`M0,0q12,${-14 + Math.sin(t * 20 + i) * 10} 24,0q12,${-14 + Math.sin(t * 20 + i) * 10} 24,0`} transform={`translate(${700 + i * 50 + k * 400},${1480 - i * 8 - k * 900})`} stroke={K.ink} strokeWidth={5} fill="none" />; })}
        {/* the friends march, Clara with the Feather high */}
        {(['clara', 'paul', 'guildLady', 'guildMan'] as const).map((w, i) => <Fig key={w} who={w} x={march + 120 + i * 95 - (i > 1 ? 40 : 0)} y={1500} s={0.5} pose={march < -5 ? 'march' : 'stand'} t={t + i * 0.3} />)}
        {t < B.dew + 1.1 && <FeatherA x={lerp(march + 160, YARD_DOOR[0] + 60, hand)} y={lerp(1500 - 380, 1500 - 420, hand)} s={0.55} rot={-10} t={t} />}
        {/* Dew: bowler lifts in the window, then at the door; the feather goes in his band; he strides to Albion House */}
        {t < B.dew + 0.2 && shutter > 0.5 && <g opacity={ramp(t, B.yard + 0.3, 0.4)}><Fig who="dew" x={540} y={1030} s={0.32} pose="liftHat" t={t} /></g>}
        {t >= B.dew + 0.2 && <Fig who="dew" x={dewX} y={1500} s={0.62} pose={dewWalk > 0 && dewWalk < 1 ? 'walk' : t < B.ask ? 'liftHat' : 'stand'} feather={t > B.dew + 1.1} t={t} />}
        {/* the tiny doctor in the doorway, looking up and up */}
        {doorOpen > 0.3 && <>
          <Fig who="doctor" x={AX + 580} y={1500} s={0.55} pose={t < B.thistime ? 'stand' : t < B.ranaway ? 'pocket' : 'talk'} expr="nervous" t={t} m={t < B.thistime ? 'bristle' : t < B.ranaway + 0.4 ? 'twitch' : 'sweat'} />
          {t > B.ranaway + 0.5 && Array.from({length: 3}).map((_, i) => { const k = ((t - B.ranaway) * 1.4 + i / 3) % 1; return <path key={i} d="M0,0q-6,10 0,16q6,-6 0,-16z" transform={`translate(${AX + 540 + i * 40},${1500 - 610 * 0.55 * 0.92 + k * 70})`} fill={K.fog} stroke={K.ink} strokeWidth={2} opacity={1 - k} />; })}
        </>}
        {nb > 0 && <NotebookA x={AX + 200} y={1080} s={0.5 + nb * 0.1} open={ramp(t, B.ask + 2.3, 0.3)} lines={['Story 1: America', 'Story 2: ran away']} write={t < B.ranaway ? 0.5 * ramp(t, B.ask + 2.4, 0.8) : 0.5 + 0.5 * write} />}
        {/* story cards from his pocket */}
        {t > B.thistime - 0.2 && toss < 1 && <P1StoryCard x={lerp(AX + 620, AX + 1300, toss)} y={lerp(1150, 700, toss) + toss * toss * 900} s={0.45} rot={toss * 300} kind="america" t={t} crumple={crumple} />}
        {card2 > 0 && <P1StoryCard x={AX + 720} y={lerp(1300, 980, card2)} s={0.62} kind="ranaway" t={t} wet={wet2} />}
        {card2 > 0 && <ClueRingA x={AX + 720 + 60 * 0.62} y={980 + (300 / 2 - 88 + wet2 * 120) * 0.62} r={30} k={ramp(t, B.ranaway + 0.9, 0.27)} />}
      </Layer>
    </World>
  );
};

// ======================= S6/S8 · 39, dolls'-house section (L14, L16) =======================
export const T6 = B.insleft - 0.1, T7 = B.searched - 0.1, T8 = B.vanished2 + 0.2;
// section world: house x 40–1040, floors at SEC.floors; street with the newsboy above the roof (y < 0)
const tour = (t: number): [number, number] => pathAt([[160, 1080], [520, 1080], [800, 700], [880, 700], [700, 1480], [300, 1480], [300, 1840], [600, 1840]], rampIO(t, B.showed, B.cellar1 + 0.5 - B.showed));
const s6Cam = (t: number): Cam => {
  if (t < T6 + 1) return drift(camAt(t, [
    [T5 - 0.5, {x: 160, y: 1000, z: 3.2}], [B.showed + 0.6, {x: 540, y: 900, z: 1.0}], [B.cellar1 - 0.6, {x: 560, y: 1500, z: 1.4}],
    [B.cellar1 + 0.6, {x: 520, y: 1700, z: 1.7}], [T6 - 0.3, {x: 300, y: 1100, z: 1.5}], [T6, {x: 160, y: 1080, z: 5}],
  ]), t);
  return drift(camAt(t, [
    [T7 - 0.5, {x: 560, y: 1760, z: 2.6}], [B.remains + 0.3, {x: 540, y: 1720, z: 2.2}], [B.remains + 1.1, {x: 400, y: -60, z: 1.6}],
    [B.doctor + 0.6, {x: 420, y: -80, z: 1.9}], [T8 - 0.4, {x: 420, y: -120 + WANTED_OVAL[1] * 0.62, z: 2.6}], [T8, {x: 420, y: -120 + WANTED_OVAL[1] * 0.62, z: 9}],
  ]), t);
};
export const s6Door = () => toScreen(s6Cam(T6 - 0.001), [160, 1080]);
export const s8Oval = () => toScreen(s6Cam(T8 - 0.001), [420, -120 + WANTED_OVAL[1] * 0.62]);
export const S6: StageFC = ({t, clip}) => {
  const second = t > T7 - 1;
  const [dx, dy] = tour(t);
  const beamA = (i: number) => -150 + Math.sin(t * 0.9 + i * 2) * 25 + i * 20;
  const wob = t > B.under ? Math.sin((t - B.under) * 30) * 4 * (1 - ramp(t, B.under + 0.6, 0.4)) : 0;
  const hatOff = ramp(t, B.remains, 0.5);
  const slam = ramp(t, B.remains + 1.0, 0.25), toWanted = rampIO(t, B.doctor - 0.1, 0.5);
  return (
    <World cam={s6Cam(t)} bg={K.deep} clip={clip} id="s6">
      <InkDefs />
      <Layer k={0.3}><rect x={-800} y={-1600} width={2700} height={4400} fill={K.deep} /></Layer>
      <Layer k={1}>
        <SectionA t={t} />
        {/* cellar floor bricks (closed, plain) */}
        {Array.from({length: 16}).map((_, i) => <rect key={i} x={60 + i * 60} y={SEC.cellarFloor - 22 + (i === 8 ? wob * 0.5 : 0)} width={56} height={22} fill={K.slate} stroke={K.ink} strokeWidth={2} transform={i === 8 ? `rotate(${wob},${60 + i * 60 + 28},${SEC.cellarFloor - 11})` : undefined} />)}
        {!second && <>
          <Fig who="doctor" x={dx + 40} y={dy} s={0.32} pose="usher" t={t} />
          <Fig who="dew" x={dx - 40} y={dy} s={0.4} pose="walk" feather t={t} />
          {t > B.cellar1 && <LampA x={dx - 30} y={dy - 220} rot={20 + Math.sin(t * 2) * 15} s={0.5} />}
          {/* life in the house: the clock pendulum, a cat on the stairs */}
          <path d={`M900,420L${900 + Math.sin(t * 3) * 30},560`} stroke={K.ink} strokeWidth={4} /><circle cx={900 + Math.sin(t * 3) * 30} cy={566} r={12} fill={K.lamp} />
          <Cat x={interpolate(t, [T5, T6], [820, 980], clamp)} y={700} t={t} />
        </>}
        {second && <>
          {[0, 1, 2].map((i) => <LampA key={i} x={300 + i * 230} y={SEC.cellarFloor - 230} rot={90 + beamA(i) + 150} s={0.6} />)}
          <Fig who="constable" x={300} y={SEC.cellarFloor - 22} s={0.38} pose="lampLow" expr="still" t={t} />
          <Fig who="constable" x={760} y={SEC.cellarFloor - 22} s={0.38} pose="lampLow" expr="still" t={t + 1} flip />
          <Fig who="dew" x={530} y={SEC.cellarFloor - 22} s={0.42} pose={hatOff > 0.5 ? 'hatOff' : 'lampLow'} expr="still" feather t={t} />
          {Array.from({length: 10}).map((_, i) => <circle key={i} cx={200 + hash(i) * 700} cy={SEC.cellarFloor - 60 - ((t * 20 + hash(i + 4) * 300) % 300)} r={2.5} fill={K.lamp} opacity={0.5} />)}
          {/* the street above: the newsboy's board slams the headline, then turns to WANTED */}
          <Sh d={R(-600, 0, 2300, 40)} fill={K.slate} line={3} />
          <Fig who="newsboy" x={180} y={0} s={0.7} pose="shout" t={t} />
          <g transform={`translate(420,${-120 - (1 - slam) * 300})`}>
            <g transform={`scale(${Math.max(0.02, Math.abs(Math.cos(toWanted * Math.PI)))},1)`}>
              {toWanted < 0.5 ? <PaperA x={0} y={0} s={0.5} headline="CELLAR DISCOVERY" date="14 July 1910" t={t} /> : <WantedA x={0} y={0} s={0.62} t={t} walkAt={Math.round((B.vanished2 - 0.3) * 30)} />}
            </g>
          </g>
        </>}
      </Layer>
    </World>
  );
};

// ======================= S7 · 39 by day (L15) =======================
const s7Cam = (t: number): Cam => drift(camAt(t, [
  [T6 - 0.5, {x: H39.fan[0], y: H39.fan[1], z: 4}], [B.insleft + 0.7, {x: 540, y: 1060, z: 1.05}], [B.cameback, {x: 560, y: 1060, z: 1.1}],
  [B.gone + 0.2, {x: H39.doorX, y: H39.stepTop - 180, z: 1.9}], [T7 - 0.3, {x: H39.doorX + 20, y: H39.stepTop - 120, z: 3.2}], [T7, {x: H39.doorX + 20, y: H39.stepTop - 110, z: 9}],
]), t);
export const s7Steam = () => toScreen(s7Cam(T7 - 0.001), [H39.doorX + 20, H39.stepTop - 110]);
export const S7: StageFC = ({t, clip}) => {
  const off = rampIO(t, B.insleft, 1.2), back = rampIO(t, B.cameback - 0.9, 0.9);
  const dewX = t < B.cameback - 0.9 ? lerp(H39.doorX - 60, -300, off) : lerp(-300, H39.doorX - 80, back);
  const dewY = t < B.cameback - 0.9 ? lerp(H39.stepTop, H39.ground, Math.min(1, off * 1.6)) : lerp(H39.ground, H39.stepTop, Math.max(0, back * 1.6 - 0.6));
  const knock = t > B.cameback + 0.1 && t < B.cameback + 0.9 ? Math.abs(Math.sin((t - B.cameback) * 18)) : 0;
  const open = ramp(t, B.cameback + 1.2, 0.6);
  return (
    <World cam={s7Cam(t)} bg={K.fog} clip={clip} id="s7">
      <InkDefs />
      <Layer k={0.3}><rect x={-800} y={-800} width={2700} height={3600} fill={K.fog} /><path d="M-600,560L-400,420L-200,560L100,400L400,560L700,380L1000,560L1300,420L1700,560V900H-600z" fill={K.mist} opacity={0.5} /></Layer>
      <Layer k={1}>
        <House39A t={t} mode="day" doorOpen={open} />
        <g clipPath="url(#p1-win7)"><defs><clipPath id="p1-win7"><rect x={WIN[0] - 156} y={WIN[1] - 136} width={312} height={272} /></clipPath></defs>
          <rect x={WIN[0] - 156} y={WIN[1] - 136} width={312} height={272} fill={K.fog} />
          <CalendarA x={WIN[0] + 60} y={WIN[1] - 20} s={0.7} label={t < B.insleft + 1.4 ? 'July 1910' : 'July 1910'} flip={win(t, B.insleft + 1.0, B.insleft + 1.6, 0.2)} />
        </g>
        {/* the open door shows the hall: a chair still spinning, a cup still steaming, a hat-peg swinging, two empty hooks */}
        {open > 0.3 && <g opacity={open}>
          <g transform={`translate(${H39.doorX - 30},${H39.stepTop - 60}) scale(${Math.cos(t * 7)},1)`}><Sh d="M-30,0V-60H30V0M-30,-60V-120" fill="none" line={5} /></g>
          <Sh d={R(H39.doorX + 10, H39.stepTop - 90, 40, 30, 6)} fill={K.newsprint} line={3} />
          {[0, 1, 2].map((i) => { const k = ((t * 0.8 + i / 3) % 1); return <circle key={i} cx={H39.doorX + 30 + Math.sin(k * 6 + i) * 12} cy={H39.stepTop - 100 - k * 120} r={8 + k * 14} fill={K.newsprint} opacity={0.7 * (1 - k)} />; })}
          {[0, 1].map((i) => <path key={i} d={`M${H39.doorX - 50 + i * 60},${H39.stepTop - 280}l${Math.sin(t * 4 + i) * (i ? 0 : 10)},24`} stroke={K.ink} strokeWidth={6} strokeLinecap="round" />)}
        </g>}
        <Fig who="dew" x={dewX} y={dewY} s={0.55} pose={(off > 0 && off < 1) || (back > 0 && back < 1) ? 'walk' : 'stand'} feather flip={t < B.cameback - 0.9 && off > 0} t={t} />
        <circle cx={H39.doorX + 50} cy={H39.stepTop - 180 + knock * 10} r={12} fill={K.lamp} stroke={K.ink} strokeWidth={3} />
      </Layer>
    </World>
  );
};

// ======================= S9 · the night sea (L17 end) =======================
export const S9: StageFC = ({t, clip}) => {
  const cam = drift(camAt(t, [[T8 - 0.5, {x: 540, y: 1030, z: 2.4}], [T8 + 1.2, {x: 540, y: 1000, z: 1.25}], [B.total, {x: 540, y: 990, z: 1.18}]]), t);
  return (
    <World cam={cam} bg={K.deep} clip={clip} id="s9">
      <InkDefs />
      <Layer k={1}><SeaA t={t} /><SparkA x={554} y={1018} t={t} s={0.3} /></Layer>
    </World>
  );
};
