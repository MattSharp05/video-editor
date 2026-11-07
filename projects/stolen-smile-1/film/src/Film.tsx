// The Stolen Smile, Part 1: The vanishing. One continuous camera through eight stages; every hand-off is a carrier push
// (the camera pushes into the carrier, an iris of its colour covers the swap) or a pop-up fold.
// Shared sets, cast, devices, cards, captions and grade are the kit's (src/series, kit commit ce6aa37). Kit sets are
// drawn in frame coords (floor y 1500); <KW> maps them into this film's stage coords (origin = frame (540,1000), floor 500).
// Times: beats.json (from the VO).
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import B from './beats.json';
import {
  C, Cut, Ell, rect, MonaLisa, Easel, BoxCamera, Pliers, Toolbag, Baguettes, Dog, ML_RATIO, glintK, fr, lerp, Label,
  camAt, drift, clamp, ramp, rampIO, win, Plane, Vincenzo, Person, Pigeon,
} from './p1/sets';
import {Stage} from './p1/rig';
import {Defs, Guard, ArtLover} from './p1/cast';
import {CHUNKS} from './p1/captions';
import {SeriesGrade} from './series/grade';
import {Captions} from './series/captions';
import {CornerTab, TitleCard, EndCard, NameTag, HonestyTag} from './series/cards';
import {SalonCarre, ModernLouvre, LouvreExterior, Staircase, ParisStreet, PaperMap, LittleRoom, PaperPainting, HER, MODERN_HER, MAP_CITIES} from './series/sets';
import {QuestionMark, FameGauge, Calendar, SmockBundle, FrameGlass} from './series/props';
import {Crowd} from './series/characters';

export const FPS = 30;
export const DUR = Math.round(B.total * FPS);
const KW: React.FC<{children: React.ReactNode}> = ({children}) => <g transform="translate(-540,-1000)">{children}</g>;
// her spot in stage coords
export const ML_W = HER.h / ML_RATIO, ML_TOP = HER.y - 1000 - HER.h / 2, HOOK_Y = HER.hookY - 1000;
const M_W = MODERN_HER.h / ML_RATIO, M_TOP = MODERN_HER.y - 1000 - MODERN_HER.h / 2;
export const HOOK_GAP = 9; // frames between hook clinks (kit default gap)

// stage boundaries (seconds): each is inside a carrier push or fold
export const T = {
  louvre: B.paris - 0.15, gallery: B.monday - 0.2, glass: B.name - 0.25, salon2: B.room - 0.3, stair: B.staircase - 0.2,
  street: B.walksout + 0.1, salon3: B.nextday + 0.05, dark: B.noone + 0.75,
};
type Iris = {at: number; color: string; x: number; y: number; x2?: number; y2?: number; d?: number};
const IRIS: Iris[] = [
  {at: T.gallery, color: C.nightBlue, x: 540, y: 960},
  {at: T.glass, color: C.glass, x: 540, y: 900, d: 0.3},
  {at: T.salon2, color: C.glass, x: 860, y: 960, x2: 540, y2: 760},
  {at: T.stair, color: C.ink, x: 900, y: 1150, x2: 300, y2: 700},
  {at: B.door - 0.15, color: C.smock, x: 540, y: 1000, x2: 640, y2: 1100},
  {at: T.street, color: '#FFF7E2', x: 640, y: 1000, x2: 400, y2: 1100},
  {at: T.dark, color: C.nightBlue, x: 540, y: 980, d: 0.3},
];
const IrisLayer: React.FC<{t: number}> = ({t}) => {
  for (const ir of IRIS) {
    const d = ir.d ?? 0.35;
    if (t > ir.at - d && t < ir.at + d) {
      const grow = t < ir.at;
      const k = grow ? interpolate(t, [ir.at - d, ir.at], [0, 1], clamp) : interpolate(t, [ir.at, ir.at + d], [1, 0], clamp);
      const x = grow ? ir.x : ir.x2 ?? ir.x, y = grow ? ir.y : ir.y2 ?? ir.y;
      return <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><circle cx={x} cy={y} r={Math.pow(k, 1.6) * 2300} fill={ir.color} /></svg>;
    }
  }
  return null;
};
// the kit's Salon Carré in this film's planes: backdrop 0.2; wall + paintings + hooks + floor on the actors plane (so her
// hooks and the paintings stay locked to her); fore pillars 1.35
type SalonP = Omit<React.ComponentProps<typeof SalonCarre>, 'fr' | 'only'>;
const Salon: React.FC<{t: number; layer: 'back' | 'main' | 'fore'} & SalonP> = ({t, layer, ...p}) => (
  <KW><SalonCarre fr={fr(t)} only={layer === 'back' ? ['backdrop'] : layer === 'main' ? ['mid', 'actors'] : ['fore']} {...p} /></KW>
);
const Motes: React.FC<{t: number; n?: number; x0?: number; w?: number; y0?: number; h?: number}> = ({t, n = 14, x0 = -700, w = 1400, y0 = -900, h = 1300}) => (
  <g>{Array.from({length: n}).map((_, i) => {
    const x = x0 + ((i * 271 + t * (8 + (i % 5) * 4)) % w), y = y0 + ((i * 397 + t * (14 + (i % 3) * 6)) % h);
    return <circle key={i} cx={x + Math.sin(t * 0.9 + i) * 24} cy={y} r={2 + (i % 3)} fill="#FFF6DE" opacity={0.35 + 0.3 * Math.sin(t * 1.7 + i)} />;
  })}</g>
);

// ================= stage 1: today's room -> the Salon Carré, 1911; the theft; the title =================
const s1Cam = (t: number) => drift(camAt(t, [
  [0, {x: 0, y: M_TOP + MODERN_HER.h * 0.33, z: 3.2}], [B.think + 1.6, {x: 0, y: 120, z: 0.95}], [B.l1, {x: 0, y: 140, z: 0.95}],
  [B.superstar, {x: 140, y: 100, z: 1.0}], [B.stole, {x: 60, y: 0, z: 1.15}], [B.stole + 0.9, {x: 120, y: -20, z: 1.2, r: 4}],
  [B.title, {x: 0, y: -60, z: 1.25, r: 0}], [B.vanishing + 0.6, {x: 0, y: -20, z: 1.6}],
]), t);
const Salon1: React.FC<{t: number}> = ({t}) => {
  const f = fr(t);
  const fold = rampIO(t, B.l1 + 0.6, 1.0);            // the 1911 room folds up
  const modern = 1 - rampIO(t, B.l1 + 0.2, 0.7);      // today's room folds down
  const shrink = rampIO(t, B.l1 + 0.2, 1.1);          // she settles from today's case to her 1911 spot
  const reach = rampIO(t, B.stole - 0.1, 0.5), zip = rampIO(t, B.stole + 0.75, 0.35);
  const smileO = t > B.stole + 0.9 ? win(t, B.stole + 0.9, B.title + 0.9, 0.25) : 0;
  const smileX = interpolate(t, [B.title + 0.3, B.title + 0.9], [0, 380], clamp);
  const lovers = ramp(t, B.before, 2.2);
  const monoPop = ramp(t, B.stole + 0.6, 0.4);
  const w = lerp(M_W, ML_W, shrink), top = lerp(M_TOP, ML_TOP, shrink);
  return (
    <Stage cam={s1Cam(t)} bg={C.paper}>
      <Defs />
      <Plane k={0.2}>
        <g opacity={fold}><Salon t={t} layer="back" /></g>
        <g opacity={1 - fold}><KW><ModernLouvre fr={f} only={['backdrop']} /></KW></g>
      </Plane>
      <Plane k={1}>
        <g transform={`translate(0,500) scale(1,${Math.max(0.001, fold)}) translate(0,-500)`}>
          <Salon t={t} layer="main" state="with-her" herOff light="day" eyeFn={(i) => (lovers > 0.5 ? (i % 2 ? 0.7 : -0.5) : Math.sin(f * 0.03 + i) * 0.4)}
            hookCountAt={fr(B.title + 0.35)} />
        </g>
        {modern > 0.001 && <g transform={`translate(0,500) scale(1,${modern}) translate(0,-500)`}><KW><ModernLouvre fr={f} only={['mid', 'actors']} flashAt={fr(B.think)} flow={0.7} herGlow={0} /></KW></g>}
        {/* her (over the kit's copy so she can move): today's case → her 1911 spot → zipped off */}
        <g transform={`translate(${zip * 1500},${top - zip * 120}) rotate(${zip * 18})`}>
          <MonaLisa w={w} glow={0.5 + 0.2 * Math.sin(t * 2)} frame={shrink > 0.5} glass={modern > 0.5 ? 1 : 0} />
        </g>
        {smileO > 0 && <g transform={`translate(${smileX},${ML_TOP + ML_W * ML_RATIO * 0.3})`} opacity={smileO}><MonaLisa w={110} crop="smile" /></g>}
        {reach > 0 && zip < 1 && <g transform={`translate(${lerp(900, 130, reach) + zip * 1500},${ML_TOP + 120})`}>
          <Cut d={rect(0, -40, 900, 80, 30)} fill={C.smock} /><Ell cx={0} cy={0} rx={48} ry={42} fill={C.skin2} />
        </g>}
        {(['tall', 'medium', 'short'] as const).map((v, i) => {
          const up = interpolate(t, [B.title + 0.6 + i * 0.25, B.vanishing + 0.4], [0, 1], clamp);
          const x = lerp(lerp(1400, 200 + i * 150, lovers), -260 + i * 170, up), pop = i === 0 ? monoPop : 0;
          const sc = 0.62 - i * 0.03;
          return <g key={i} transform={`translate(${x},${600 - i * 8})`} opacity={fold}>
            <ArtLover variant={v} monocle={pop < 0.15} fr={f + i * 7} walk={lovers < 1 || (up > 0 && up < 1) ? 1 : 0} s={sc} flip={t <= B.stole + 0.5}
              expr={pop > 0.15 ? 'jawDrop' : lovers >= 1 ? 'smile' : 'calm'} pose={lovers >= 1 && t < B.stole + 0.5 && i === 1 ? 'point' : undefined} />
            {pop > 0 && pop < 1 && <g transform={`translate(${20 + pop * 120},${-sc * 640 * 0.8 + pop * 160}) rotate(${pop * 300})`}>
              <circle r={14} fill="rgba(255,255,255,0.4)" stroke={C.oldGold} strokeWidth={4} /></g>}
          </g>;
        })}
        <g opacity={fold}><Motes t={t} /></g>
      </Plane>
      <Plane k={1.35}>
        <g opacity={fold}><Salon t={t} layer="fore" /></g>
        {modern > 0.05 && t > B.think && Array.from({length: 9}).map((_, i) => {
          const per = 0.9 + (i % 4) * 0.23, ph = ((t + i * 0.37) % per) / per;
          return ph < 0.22 ? <circle key={i} cx={-480 + i * 120 + (i % 2) * 40} cy={380 + (i % 3) * 70} r={50 + 60 * (1 - ph / 0.22)} fill="#FFFFFF" opacity={0.75 * (1 - ph / 0.22) * modern} /> : null;
        })}
        {modern > 0.001 && <g transform={`translate(0,560) scale(1,${modern}) translate(0,-560)`}><KW><Crowd fr={f} x={-300} w={1700} y={1880} rows={1} perRow={7} era="today" phones flashAt={fr(B.think + 0.4)} flow={-1.4} seed={5} scale={1.8} /></KW></g>}
        {t > B.think && t < B.l1 + 0.4 && <g opacity={win(t, B.think, B.l1 + 0.4, 0.15)}>
          <QuestionMark fr={f} x={150} y={M_TOP + 60} size={1.1} stamp rot={-12} /></g>}
        <g opacity={(t < B.superstar - 0.1 ? 0 : 1) * (t < B.title + 0.4 ? 1 : 1 - ramp(t, B.title + 0.4, 0.4))}>
          <FameGauge fr={f} x={-60} y={190 + (1 - ramp(t, B.superstar, 0.5)) * 900} size={0.9} value={0.03} tremble={3} />
        </g>
        <g opacity={t < B.title ? 1 : 1 - ramp(t, B.title, 0.3)}>
          <Calendar fr={f} x={-250} y={-500 + (1 - ramp(t, B.before, 0.4)) * -900} pages={['1911']} />
        </g>
      </Plane>
    </Stage>
  );
};

// ================= stage 2: Paris, 1911: the sleeping Louvre (kit LouvreExterior) =================
// we push into shutter 17 (column 8, lower row): kit (910, 975) → stage (370, -25) on the 0.7 plane
const LIFT = 17;
const Louvre: React.FC<{t: number}> = ({t}) => {
  const f = fr(t);
  const lid = ramp(t, T.gallery - 1.0, 0.7);
  const wx = 370 / 0.7, wy = -25 / 0.7;
  const cam = drift(camAt(t, [
    [T.louvre, {x: -700, y: -150, z: 0.62}], [B.giant, {x: -200, y: -120, z: 0.66}], [B.mondays, {x: 250, y: -80, z: 0.78}],
    [T.gallery - 0.9, {x: wx, y: wy, z: 1.0}], [T.gallery, {x: wx, y: wy, z: 4.5}],
  ]), t);
  const pig = interpolate(t, [B.giant - 0.6, B.closed + 0.2], [0, 1], clamp);
  return (
    <Stage cam={cam} bg={C.duskBlue}>
      <Defs />
      <Plane k={0.2}><KW><LouvreExterior fr={f} only={['backdrop']} /></KW></Plane>
      <Plane k={0.45}><KW><LouvreExterior fr={f} only={['far']} /></KW></Plane>
      <Plane k={0.7}>
        <KW><LouvreExterior fr={f} only={['mid', 'actors']} liftIndex={LIFT} lid={lid} signAt={fr(B.closed)} /></KW>
        <g transform={`translate(${lerp(-1100, -60, pig)},${lerp(-560, -150, pig) - Math.sin(pig * Math.PI) * 120})`}><Pigeon t={t} /></g>
        <g transform={`translate(${-700 + (t - T.louvre) * 60},${420 + Math.sin(t * 2) * 6})`}>
          <Cut d="M-90,0 L90,0 L60,40 L-60,40Z" fill={C.sepia} w={2.5} /><Cut d="M0,0 L0,-120 L60,-20Z" fill={C.card} w={2.5} />
        </g>
      </Plane>
      <Plane k={0.9}>
        <g transform={`translate(${-560},${-760 + (1 - ramp(t, T.louvre + 0.1, 0.4)) * -600})`}><Label text="Paris, 1911" size={70} rot={-3} /></g>
        <Calendar fr={f} x={560} y={-640 + (1 - ramp(t, B.mondays - 0.1, 0.4)) * -900} pages={['Monday']} size={1.1} />
        <g transform={`translate(${-160 + (t - T.louvre) * 40},${-420 + (1 - ramp(t, B.giant - 0.2, 0.4)) * -900})`}><Label text="the Louvre" size={56} rot={2} /></g>
        <g transform={`translate(${520},${-300 + (1 - ramp(t, B.closed - 0.15, 0.35)) * -1100}) rotate(${Math.sin((t - B.closed) * 5) * 6 * Math.exp(-Math.max(0, t - B.closed) * 1.2)})`}>
          <line x1={-90} y1={-260} x2={-90} y2={-40} stroke={C.ink} strokeWidth={3} /><line x1={90} y1={-260} x2={90} y2={-40} stroke={C.ink} strokeWidth={3} />
          <Label text="Closed on Mondays" size={52} fill={C.card} />
        </g>
      </Plane>
    </Stage>
  );
};

// ================= stage 3: the quiet halls (part-only set: a long gallery, kit PaperPainting portraits) =================
const GalleryStage: React.FC<{t: number}> = ({t}) => {
  const f = fr(t);
  const vx = interpolate(t, [T.gallery, T.glass], [-900, 2700]);
  const cam = drift(camAt(t, [
    [T.gallery, {x: -600, y: -150, z: 0.85}], [B.halls, {x: 1900, y: -100, z: 0.9}], [T.glass - 0.5, {x: 2550, y: 200, z: 2.6}], [T.glass, {x: 2650, y: 220, z: 5}],
  ]), t);
  return (
    <Stage cam={cam} bg={C.duskBlue}>
      <Defs />
      <Plane k={0.45}>
        <rect x={-1400} y={-1600} width={5200} height={2400} fill={C.duskBlue} />
        {Array.from({length: 9}).map((_, i) => <Cut key={i} d={`M${-1200 + i * 520},500 L${-1200 + i * 520},-300 Q${-940 + i * 520},-620 ${-680 + i * 520},-300 L${-680 + i * 520},500Z`} fill="#4E6185" w={3} shadow={false} />)}
      </Plane>
      <Plane k={1}>
        <rect x={-1400} y={-1700} width={5600} height={2200} fill={C.nightBlue} opacity={0.85} />
        {Array.from({length: 6}).map((_, i) => <path key={i} d={`M${-900 + i * 700},-1100 L${-700 + i * 700},-1100 L${-300 + i * 700},500 L${-640 + i * 700},500Z`} fill="#AFC2E0" opacity={0.12} />)}
        {Array.from({length: 7}).map((_, i) => {
          const px = -800 + i * 560;
          const look = Math.max(-1, Math.min(1, (vx - px) / 260));
          const wake = interpolate(vx, [px - 700, px - 300], [0, 1], clamp);
          return <PaperPainting key={i} x={px} y={-400} w={260} h={330} kind={i % 4} eyeX={look * wake} seed={`gal${i}`} />;
        })}
        <rect x={-2000} y={500} width={7000} height={1400} fill="#6E7A92" />
        {Array.from({length: 40}).map((_, i) => <line key={i} x1={-1500 + i * 150} y1={500} x2={-1800 + i * 150} y2={1900} stroke={C.ink} strokeWidth={2} opacity={0.3} />)}
        <line x1={-2000} y1={500} x2={5000} y2={500} stroke={C.ink} strokeWidth={3.5} />
        <Motes t={t} n={22} x0={-1000} w={4000} />
        <ellipse cx={vx + 30} cy={500} rx={110} ry={18} fill="rgba(20,24,36,0.5)" />
        <g transform={`translate(${vx},500)`}><Vincenzo fr={f} walk={1} s={0.62} /></g>
      </Plane>
    </Stage>
  );
};

// ================= stage 4: the glass box (part-only) =================
const Glass: React.FC<{t: number}> = ({t}) => {
  const f = fr(t);
  const write = interpolate(t, [B.name + 0.15, B.name + 1.2], [0, 1], clamp);
  const wipe = rampIO(t, B.knows + 0.1, 1.0);
  const cam = drift(camAt(t, [
    [T.glass, {x: 0, y: -40, z: 1.25}], [B.helped, {x: 40, y: 0, z: 1.1, r: -2}], [T.salon2 - 0.4, {x: 260, y: 40, z: 1.0, r: 1}], [T.salon2, {x: 330, y: 0, z: 1.3}],
  ]), t);
  const taps = [B.glassbox + 0.05, B.glassbox + 0.35];
  const tapK = Math.max(...taps.map((a) => (t > a && t < a + 0.35 ? 1 - (t - a) / 0.35 : 0)));
  const breath = 0.6 + 0.4 * Math.sin(Math.min(1, (t - T.glass) / 0.6) * Math.PI / 2);
  return (
    <Stage cam={cam} bg={C.nightBlue}>
      <Defs />
      <Plane k={0.4}>
        <rect x={-2000} y={-2000} width={4000} height={4000} fill="#3C4C6E" />
        {Array.from({length: 5}).map((_, i) => <path key={i} d={`M${-900 + i * 450},-1100 L${-760 + i * 450},-1100 L${-460 + i * 450},900 L${-700 + i * 450},900Z`} fill="#AFC2E0" opacity={0.08 + 0.04 * Math.sin(t + i)} />)}
        <Motes t={t} n={20} x0={-1000} w={2000} y0={-1100} h={2000} />
      </Plane>
      <Plane k={1}>
        <g transform="translate(0,-460)"><MonaLisa w={560} glow={0.5 + 0.4 * ramp(t, B.protects, 0.6)} frame /></g>
        <g transform="translate(-470,140)" opacity={0.3 * ramp(t, B.knows + 0.6, 0.6)}><Vincenzo fr={f} s={1.2} /></g>
        <g transform={`translate(${380},${360 - tapK * 20})`} opacity={ramp(t, B.glassbox - 0.4, 0.3)}>
          <Ell cx={0} cy={0} rx={52} ry={44} fill={C.skin2} /><Cut d={rect(-10, 20, 600, 90, 30)} fill={C.smock} />
        </g>
        {taps.map((a, i) => t > a && t < a + 0.6 ? <circle key={i} cx={360} cy={340} r={30 + (t - a) * 260} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={1 - (t - a) / 0.6} /> : null)}
      </Plane>
      <Plane k={1.15}>
        <rect x={-1400} y={-1600} width={2800} height={3200} fill={C.glass} opacity={0.12} />
        <defs><clipPath id="fogclip"><rect x={-1400 + wipe * 2800} y={-1600} width={2800} height={3200} /></clipPath></defs>
        <g clipPath="url(#fogclip)">
          <rect x={-1400} y={-1600} width={2800} height={3200} fill="#E8EEF2" opacity={0.74 * breath} />
          {/* fog blooms where he breathes */}
          {[0, 1, 2].map((i) => { const k = ((t - T.glass) * 0.8 + i * 0.33) % 1; return <ellipse key={i} cx={-300 + i * 300} cy={300 - i * 120} rx={160 + k * 380} ry={110 + k * 260} fill="#FFFFFF" opacity={0.6 * (1 - k)} />; })}
          <text x={0} y={-60} textAnchor="middle" fontFamily="'Special Elite', monospace" fontSize={190} fill="#7D8FA8" style={{clipPath: `inset(0 ${100 - write * 100}% 0 0)`}}>Vincenzo</text>
          {/* the finger writing it */}
          {write > 0 && write < 1 && <g transform={`translate(${-430 + write * 860},${-100 + Math.sin(write * 40) * 30})`}><Ell cx={0} cy={0} rx={30} ry={26} fill={C.skin2} /><Cut d={rect(-18, 10, 36, 400, 16)} fill={C.smock} /></g>}
        </g>
        {Array.from({length: 12}).map((_, i) => {
          const x = -560 + i * 100 + (i % 3) * 17, sp = 90 + (i % 4) * 60, y = -700 + ((t - T.glass) * sp + i * 137) % 1500;
          return <g key={i}><path d={`M${x},${y - 160} L${x},${y}`} stroke="#FFFFFF" strokeWidth={12} opacity={0.45} strokeLinecap="round" /><circle cx={x} cy={y} r={20} fill="#FFFFFF" opacity={0.7} /></g>;
        })}
        <Motes t={t} n={26} x0={-800} w={1600} y0={-1000} h={1900} />
        {wipe > 0 && wipe < 1 && <g transform={`translate(${-1400 + wipe * 2800},0) rotate(-8)`}><Cut d={rect(-120, -500, 240, 1000, 100)} fill={C.smock} /></g>}
        <path d="M-1400,-900 L-200,-1700" stroke="#FFFFFF" strokeWidth={30} opacity={0.18} />
        {t > B.glassbox - 0.1 && <g transform={`translate(-60,${330 + (1 - ramp(t, B.glassbox - 0.1, 0.35)) * 600})`}><Label text="the glass box he helped make" size={36} rot={-2} /></g>}
        <rect x={500} y={-1600} width={22} height={3200} fill="#FFFFFF" opacity={0.25 + 0.3 * ramp(t, T.salon2 - 0.9, 0.6)} />
      </Plane>
    </Stage>
  );
};

// ================= stage 5: her room, Monday: four iron hooks; the lift; nobody stops him =================
const Salon2: React.FC<{t: number}> = ({t}) => {
  const f = fr(t);
  const vx = interpolate(t, [T.salon2, B.hangs], [-900, -150], clamp);
  const lift = rampIO(t, B.lifts + 0.1, 0.8);
  const walkOff = interpolate(t, [B.carries - 0.1, T.stair], [0, 1], clamp);
  const cam = drift(camAt(t, [
    [T.salon2, {x: -200, y: 80, z: 0.9}], [B.hangs, {x: 0, y: 0, z: 1.2}], [B.hooks, {x: 0, y: HOOK_Y + 30, z: 2.4}], [B.hooks_end + 0.2, {x: 0, y: HOOK_Y + 40, z: 2.5}],
    [B.lifts + 0.3, {x: 0, y: 40, z: 1.25}], [B.nobody, {x: 0, y: 60, z: 0.95}], [B.carries, {x: 120, y: 80, z: 1.0}], [T.stair, {x: 700, y: 200, z: 1.9}],
  ]), t);
  const look = interpolate(t, [B.nobody - 0.2, B.nobody + 0.3], [0, 1], clamp);
  const vinX = t < B.carries ? vx : lerp(-150, 760, walkOff);
  const mlX = lerp(0, vinX + 70, lift), mlY = lerp(ML_TOP, 130, lift);
  const cricket = interpolate(t, [B.nobody + 0.2, B.carries], [0, 1], clamp);
  return (
    <Stage cam={cam} bg={C.duskBlue}>
      <Defs />
      <Plane k={0.2}><Salon t={t} layer="back" light="monday" /></Plane>
      <Plane k={1}>
        <Salon t={t} layer="main" state="with-her" herOff light="monday" hookCountAt={fr(B.hooks + 0.05)} hookSwayAt={fr(B.lifts + 0.6)}
          eyeFn={(i) => (look > 0 ? (i % 2 ? 0.9 : -0.9) * look : Math.sin(f * 0.02 + i) * 0.2)} />
        <Cut d={rect(980, -40, 240, 540, 6)} fill={C.ink} />
        <ellipse cx={vinX + 20} cy={500} rx={120} ry={16} fill="rgba(20,24,36,0.35)" />
        <g transform={`translate(${vinX},500)`}>
          <Vincenzo fr={f} s={0.95} walk={(t < B.hangs || t > B.carries) ? 1 : 0} pose={t > B.lifts - 0.2 && t < B.lifts + 0.6 ? 'lift' : t > B.carries ? 'carryWalk' : t >= B.lifts + 0.6 ? 'carry' : undefined}
            expr={t > B.nobody && t < B.carries ? 'poker' : 'calm'} eyeX={t > B.nobody && t < B.carries ? 4 * Math.sin(t * 3) : 0} />
        </g>
        <g transform={`translate(${mlX},${mlY}) rotate(${lift * 6})`}><MonaLisa w={ML_W} glow={0.6} glint={glintK(t, B.nobody + 0.45)} /></g>
        {cricket > 0 && cricket < 1 && <g transform={`translate(${lerp(-700, 800, cricket)},${560 - Math.abs(Math.sin(cricket * Math.PI * 5)) * 70})`}>
          <Ell cx={0} cy={0} rx={22} ry={11} fill="#4F5A2E" w={2} /><path d="M-6,0 L-30,-24 L-40,8 M8,0 L30,-26 L44,6" stroke={C.ink} strokeWidth={3} fill="none" />
        </g>}
      </Plane>
      <Plane k={1.35}><Salon t={t} layer="fore" /></Plane>
    </Stage>
  );
};

// ================= stage 6: the back staircase (kit Staircase); frame and glass off; the wrap; the door; the plumber =================
// kit step i: x −200+70i … +520−20i, top y 760+106i → stage: centre x −480+60i, top −240+106i. Door x 220…480, floor 500.
const STEP = (i: number) => ({x: -480 + i * 60, y: -240 + i * 106});
const StairStage: React.FC<{t: number}> = ({t}) => {
  const f = fr(t);
  const stepIdx = interpolate(t, [T.stair, B.frame - 0.2, B.leaves, B.board], [0, 3, 3, 6], clamp);
  const atDoor = t > B.door - 0.15;
  const vx = atDoor ? interpolate(t, [B.door - 0.15, B.door + 0.4], [60, 120], clamp) : STEP(stepIdx).x;
  const vy = atDoor ? 500 : STEP(stepIdx).y;
  const strip = rampIO(t, B.frame + 0.05, 0.9);
  const turn = rampIO(t, B.board + 0.4, 0.8) * (1 - rampIO(t, B.wraps - 0.2, 0.4)) * 0.94;
  const wrap = ramp(t, B.wraps, 0.9);
  const stretch = rampIO(t, B.locked, 0.6);
  const knobOff = t > B.locked + 0.5;
  const doorOpen = rampIO(t, B.opens, 0.6);
  const pl = interpolate(t, [B.plumber - 0.1, B.plumber + 1.6], [-500, -160], clamp);
  const shadowX = interpolate(t, [B.plumber - 0.6, B.plumber + 0.6], [460, 300], clamp);
  const cam = drift(camAt(t, [
    [T.stair, {x: -420, y: -500, z: 1.15}], [B.frame, {x: -260, y: -260, z: 1.1}], [B.leaves, {x: -160, y: -120, z: 1.0, r: 2}],
    [B.board + 0.2, {x: 20, y: -300, z: 1.7, r: 0}], [B.thin + 0.6, {x: 50, y: -300, z: 1.85, r: -3}], [B.wraps + 0.8, {x: -60, y: 60, z: 1.9}], [B.door - 0.15, {x: -60, y: 60, z: 4.5}],
    [B.door - 0.1, {x: 200, y: 160, z: 1.6, r: 0}], [B.locked + 0.4, {x: 220, y: 120, z: 1.3}], [B.plumber + 0.5, {x: 120, y: 160, z: 1.05}],
    [B.opens, {x: 200, y: 180, z: 1.15}], [T.street, {x: 350, y: 120, z: 2.6}],
  ]), t);
  const holdingML = t < B.frame + 0.1;
  const fgx = STEP(3).x + 90, fgy = STEP(3).y - 160;
  const sweat = t > B.locked + 0.6 && t < B.opens ? ramp(t, B.locked + 0.6, 0.3) : 0;
  const vPose = atDoor ? (t > B.door + 0.4 && t < B.locked + 0.4 ? 'rattle' : t > B.opens + 0.3 ? 'nod' : 'carry') : (t < B.frame - 0.2 || (t > B.leaves && t < B.board)) ? 'carryWalk' : t < B.leaves ? 'reach' : 'stand';
  return (
    <Stage cam={cam} bg={C.nightBlue}>
      <Defs />
      <Plane k={0.2}><KW><Staircase fr={f} only={['backdrop']} /></KW></Plane>
      <Plane k={1}>
        <KW><Staircase fr={f} only={['mid', 'actors']} door={doorOpen} knobOff={knobOff} stretch={stretch} /></KW>
        {t > B.frame + 0.6 && t < B.board + 0.2 && <g opacity={win(t, B.frame + 0.6, B.board + 0.2, 0.25)}>
          <g transform={`translate(${fgx - 160},${fgy + 150})`}><Label text="frame" size={34} rot={-4} /></g>
          <g transform={`translate(${fgx + 170},${fgy - 40})`}><Label text="glass box" size={34} rot={3} /></g>
        </g>}
        {t > B.frame && <FrameGlass fr={f} x={fgx} y={fgy} w={ML_W + 40} h={ML_W * ML_RATIO + 40} show="both" split={strip} fall={200} />}
        <g transform={`translate(${vx},${vy})`}>
          <Vincenzo fr={f} s={0.95} smock={t < B.wraps} pose={vPose as never} expr={sweat > 0 ? 'sweat' : t > B.opens + 0.3 ? 'smile' : 'calm'} eyeX={atDoor && t > B.plumber ? -4 : 0}>
            {atDoor && knobOff && t < B.opens ? <g><circle r={16} fill={C.oldGold} stroke={C.ink} strokeWidth={2.5} /><rect x={-5} y={14} width={10} height={36} fill={C.oldGold} stroke={C.ink} strokeWidth={2} /></g> : undefined}
          </Vincenzo>
        </g>
        {t < B.wraps + 0.3 && <g transform={`translate(${holdingML ? vx + 60 : 120},${holdingML ? vy - 330 : -620})`}>
          <MonaLisa w={ML_W} glow={0.5} frame={t < B.frame + 0.3} glass={t < B.frame + 0.2 ? 1 : 0} turn={turn} />
        </g>}
        {t > B.thin - 0.3 && t < B.wraps + 0.3 && <g transform="translate(380,-620)" opacity={win(t, B.thin - 0.3, B.wraps + 0.3, 0.3)}>
          <rect x={-90} y={0} width={180} height={240} fill="none" stroke={C.ink} strokeWidth={3} strokeDasharray="12 10" />
          <text x={0} y={280} textAnchor="middle" fontFamily="'Special Elite', monospace" fontSize={28} fill={C.card}>a notebook</text>
        </g>}
        {t > B.thin && t < B.wraps + 0.2 && <g transform="translate(140,-250)" opacity={win(t, B.thin, B.wraps + 0.2, 0.25)}><Label text="thin wooden board" size={34} rot={-2} /></g>}
        {t >= B.wraps && !atDoor && <SmockBundle fr={f} x={vx + 70} y={vy - 290} size={0.25 + 0.4 * wrap} leak={wrap} eyes={ramp(t, B.wraps + 0.5, 0.4)} />}
        {atDoor && <SmockBundle fr={f} x={vx + 70} y={vy - 290} size={0.62} leak={0.9} eyes={1} glintAt={fr(B.opens + 0.6)} />}
        {sweat > 0 && [0, 1, 2].map((i) => <path key={i} transform={`translate(${vx - 40 + i * 50},${vy - 600 + ((t * 1.6 + i * 0.33) % 1) * 90})`} d="M0,0 Q10,16 0,24 Q-10,16 0,0Z" fill="#AFC2E0" stroke={C.ink} strokeWidth={2} opacity={sweat} />)}
        <Motes t={t} n={18} x0={-700} w={1300} y0={-700} h={1200} />
        {[{x: vx, on: true, w: 1}, {x: pl, on: t > B.plumber - 0.1, w: 1.1}].map((sh, i) => sh.on ? <g key={i} opacity={0.22} transform={`translate(${-320 + (sh.x + 320) * 1.5 + Math.sin(t * 7 + i) * 14},${atDoor ? 120 : vy - 200}) scale(${1.6 * sh.w},1.6) skewX(${(sh.x + 320) * 0.02})`}>
          <ellipse cx={0} cy={-330} rx={40} ry={46} fill={C.ink} /><path d="M-60,-280 L60,-280 L70,0 L-70,0Z" fill={C.ink} />
        </g> : null)}
        {t > B.worker - 0.6 && t < B.opens + 0.3 && <g transform={`translate(${interpolate(t, [B.worker - 0.6, B.opens + 0.3], [520, -700])},${492 - Math.abs(Math.sin(t * 22)) * 6})`}>
          <Ell cx={0} cy={0} rx={52} ry={28} fill={C.stone} w={2.5} /><Ell cx={-52} cy={-12} rx={22} ry={18} fill={C.stone} w={2.5} /><circle cx={-60} cy={-16} r={4} fill={C.ink} />
          <path d={`M24,0 Q50,${-14 + Math.sin(t * 15) * 8} 70,-4`} stroke={C.ink} strokeWidth={2.5} fill="none" />
        </g>}
        {t > B.plumber - 0.6 && t < B.plumber + 1.2 && <g transform={`translate(${shadowX},120)`} opacity={0.35 * win(t, B.plumber - 0.6, B.plumber + 1.2, 0.3)}>
          <ellipse cx={0} cy={0} rx={90} ry={220} fill={C.ink} /><rect x={60} y={-60} width={120} height={22} fill={C.ink} />
        </g>}
        {t > B.worker - 0.1 && t < B.opens && <g transform={`translate(${pl + 40},${-330}) scale(${ramp(t, B.worker - 0.1, 0.3)})`}>
          <circle cx={-30} cy={150} r={12} fill={C.card} stroke={C.ink} strokeWidth={2.5} /><circle cx={-10} cy={110} r={18} fill={C.card} stroke={C.ink} strokeWidth={2.5} />
          <Cut d="M-170,-60 Q-200,-170 -60,-170 Q20,-230 120,-160 Q230,-160 200,-40 Q220,60 80,70 Q-40,110 -130,50 Q-230,20 -170,-60Z" fill={C.card} />
          <text x={10} y={-40} textAnchor="middle" fontFamily="'Special Elite', monospace" fontSize={40} fill={C.ink}>a worker,</text>
          <text x={10} y={14} textAnchor="middle" fontFamily="'Special Elite', monospace" fontSize={40} fill={C.ink}>like me</text>
        </g>}
        {t > B.plumber - 0.1 && <g transform={`translate(${pl},500)`}>
          <Person look={{coat: C.duskBlue, trousers: C.duskBlue, skin: C.skin3, hat: 'cap', hatFill: C.duskBlue, moustache: true, hair: '#5A4636'}}
            fr={f} walk={t < B.plumber + 1.6 ? 1 : 0} s={0.95} pose={t > B.opens + 0.4 ? 'bow' : t > B.opens - 0.4 ? 'doorOpen' : undefined}
            expr={t > B.worker && t < B.opens ? 'smile' : 'calm'} eyeX={t > B.worker && t < B.opens ? 4 * Math.sin(t * 2.4) : t > B.worker ? 4 : 0}>
            {t > B.opens - 0.5 && t < B.opens + 0.4 ? <g transform="rotate(-30)"><Pliers /></g> : undefined}
          </Person>
          <g transform="translate(-120,0)"><Toolbag /></g>
        </g>}
      </Plane>
    </Stage>
  );
};

// ================= stage 7: the streets of Paris (kit ParisStreet), then the map folds down (kit PaperMap) =================
const StreetStage: React.FC<{t: number}> = ({t}) => {
  const f = fr(t);
  const vx = interpolate(t, [T.street, B.carrying + 0.4], [0, 1500], clamp);
  const mapFold = rampIO(t, B.carrying + 0.35, 0.45);
  const mapUp = rampIO(t, T.salon3 - 0.45, 0.45);
  const cam = drift(camAt(t, [[T.street, {x: -100, y: -120, z: 1.0}], [B.carrying, {x: 1300, y: -180, z: 0.9}], [B.carrying + 0.6, {x: 1500, y: -420, z: 0.7}]]), t);
  const walkers = [{x0: 1700, kind: 'baker'}, {x0: 2500, kind: 'lady'}, {x0: 3300, kind: 'police'}];
  const P = MAP_CITIES.Paris;
  const pts: [number, number][] = [[0, 0], [0, 120], [160, 120], [160, 280], [330, 280], [330, 430], [180, 430]];
  const dk = interpolate(t, [B.carrying + 0.6, T.salon3 - 0.3], [0, 1], clamp) * (pts.length - 1);
  const di = Math.min(pts.length - 2, Math.floor(dk)), dd = dk - di;
  const dot: [number, number] = [P[0] + lerp(pts[di][0], pts[di + 1][0], dd), P[1] + 200 + lerp(pts[di][1], pts[di + 1][1], dd)];
  return (
    <>
      <Stage cam={cam} bg={C.paper}>
        <Defs />
        <Plane k={0.2}><KW><ParisStreet fr={f} only={['backdrop']} width={3600} /></KW></Plane>
        <Plane k={0.45}><KW><ParisStreet fr={f} only={['far']} width={3600} /></KW></Plane>
        <Plane k={1}>
          <KW><ParisStreet fr={f} only={['mid', 'actors']} width={3600} lampX={2400} /></KW>
          {walkers.map((w, i) => {
            const x = w.x0 - (t - T.street) * 260;
            const tip = w.kind === 'police' && Math.abs(x - vx) < 300;
            return <g key={i} transform={`translate(${x},${500 + i * 10})`}>
              {w.kind === 'baker' && <Person look={{coat: C.card, trousers: C.stone, skin: C.skin1, hat: 'beret', hatFill: C.card, moustache: true, hair: '#6B5A4A', apron: '#FFFFFF'}} fr={f} walk={1} s={0.95} flip><Baguettes /></Person>}
              {w.kind === 'lady' && <><Person look={{coat: '#8A5A4A', skin: C.skin4, hat: 'bonnet', hatFill: C.clueRed, skirt: true, hair: C.ink}} fr={f + 5} walk={1} s={0.92} flip /><g transform="translate(-200,0)"><Dog fr={f} /></g></>}
              {w.kind === 'police' && <Person look={{coat: C.nightBlue, trousers: C.nightBlue, skin: C.skin2, hat: 'kepi', moustache: true, hair: C.ink}} fr={f + 9} walk={tip ? 0 : 1} s={1.0} flip pose={tip ? 'tipCap' : undefined} expr={tip ? 'smile' : 'calm'} />}
            </g>;
          })}
          <g transform={`translate(${vx},500)`}><Vincenzo fr={f} s={0.95} smock={false} pose="carryWalk" /></g>
          <SmockBundle fr={f} x={vx + 70} y={500 - 290} size={0.62} leak={0.9} eyes={0.8} />
        </Plane>
      </Stage>
      {mapFold > 0 && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`scale(1,${Math.max(0.001, mapFold * (1 - mapUp))})`}>
          <PaperMap fr={f} view="paris" dot={dot} dotGlow={win(t, B.carrying + 0.5, T.salon3 - 0.15, 0.2)} labels={['Paris']} />
        </g>
      </svg>}
    </>
  );
};

// ================= stage 8: the next day: the painter, four empty hooks, the guards, the "?" =================
const Salon3: React.FC<{t: number}> = ({t}) => {
  const f = fr(t);
  const bx = interpolate(t, [T.salon3, B.painter + 0.8], [-1300, -460], clamp);
  const easel = rampIO(t, B.painter + 0.9, 0.6);
  const lookUp = ramp(t, B.finds, 0.3);
  const brush = ramp(t, B.finds + 0.6, 0.5);
  const gx = interpolate(t, [B.guards - 0.6, B.guards + 0.5], [1300, 380], clamp);
  const bubble = ramp(t, B.photographers - 0.1, 0.5) * (1 - ramp(t, B.didnt + 0.1, 0.12));
  const popAt = B.didnt + 0.1;
  const dim = rampIO(t, B.gone, 0.8);
  const q = rampIO(t, B.gone + 0.3, 0.8);
  const cam = drift(camAt(t, [
    [T.salon3, {x: -400, y: 40, z: 0.95}], [B.painter + 0.6, {x: -250, y: 20, z: 1.0}], [B.finds, {x: -120, y: -20, z: 1.1}],
    [B.empty + 0.4, {x: 0, y: HOOK_Y + 60, z: 2.2}], [B.guards, {x: 0, y: HOOK_Y + 60, z: 2.3}], [B.guards + 0.8, {x: 180, y: 0, z: 1.0}],
    [B.photographers + 0.4, {x: 260, y: -220, z: 1.05}], [B.didnt + 0.4, {x: 120, y: -20, z: 1.0}], [B.gone + 0.2, {x: 0, y: -40, z: 1.25}],
    [B.noone, {x: 0, y: HOOK_Y + 140, z: 1.8}], [T.dark, {x: 0, y: HOOK_Y + 130, z: 7}],
  ]), t);
  const flash = (a: number) => (t > a && t < a + 0.35 ? 1 - (t - a) / 0.35 : 0);
  const guardPose = t > B.guards + 0.4 && t < B.photographers - 0.1 ? 'shrug' : t > B.photographers - 0.1 && t < B.didnt + 0.1 ? 'point' : t > B.didnt + 0.1 ? 'surprised' : undefined;
  return (
    <Stage cam={cam} bg={C.paper}>
      <Defs />
      <Plane k={0.2}><Salon t={t} layer="back" light="day" /></Plane>
      <Plane k={1} dark={0.5 * dim}>
        <Salon t={t} layer="main" state="empty" light="day" shadowLean={q} eyeFn={(i) => (i === 1 ? 0.5 * lookUp : Math.sin(f * 0.02 + i) * 0.3)} />
        {q > 0 && <g opacity={q}><QuestionMark fr={f} x={0} y={HOOK_Y + 230} size={2.2} /></g>}
        <rect x={-ML_W / 2 - 20} y={ML_TOP - 20} width={ML_W + 40} height={ML_W * ML_RATIO + 40} fill={C.card} opacity={0.35 * (1 - q)} />
        <g transform={`translate(${bx + 230},500)`} opacity={1 - dim}><Easel open={easel} /></g>
        <g transform={`translate(${bx},500)`} opacity={1 - dim}>
          <Person look={{coat: '#3A2F2A', trousers: C.ink, skin: C.skin1, hat: 'none', beard: true, hair: '#4A3A2E'}} fr={f} walk={t < B.painter + 0.8 ? 1 : 0} s={1.0}
            pose={lookUp > 0.5 ? 'surprised' : undefined} expr={lookUp > 0.5 ? 'jawDrop' : 'calm'} eyeX={lookUp * 4}>
            {brush < 1 ? <g transform={`translate(${brush * 30},${brush * 280}) rotate(${brush * 160})`}><Cut d={rect(-5, -70, 10, 90, 3)} fill={C.sepia} w={2} /><rect x={-6} y={-80} width={12} height={16} fill={C.clueRed} /></g> : undefined}
          </Person>
        </g>
        {t > B.guards - 0.7 && ([['tall', 0], ['short', 1]] as const).map(([v, i]) => <g key={v} transform={`translate(${gx + i * 240},${500 + i * 6})`} opacity={1 - dim * 0.8}>
          <Guard variant={v} fr={f + i * 5} walk={t < B.guards + 0.5 ? 1 : 0} s={1} flip pose={guardPose} expr={t > B.didnt + 0.1 ? 'jawDrop' : 'calm'} />
        </g>)}
        {bubble > 0 && <g transform={`translate(${330},${-500}) scale(${bubble * 0.9})`}>
          {[0, 1, 2].map((i) => <circle key={i} cx={-40 + i * 40} cy={500 - i * 120} r={18 + i * 10} fill={C.card} stroke={C.ink} strokeWidth={3} />)}
          <Cut d="M-360,-260 Q-420,-420 -200,-430 Q-80,-560 120,-450 Q340,-500 380,-300 Q480,-120 330,40 Q300,180 80,160 Q-100,240 -250,140 Q-460,100 -360,-260Z" fill={C.card} />
          <g transform="translate(-170,-300)"><MonaLisa w={150} glow={0.4} frame={false} /></g>
          <g transform="translate(150,-80) scale(0.9)"><BoxCamera flash={Math.max(flash(B.photographers + 0.6), flash(B.photographers + 1.3))} /></g>
          <g transform="translate(10,-400)"><Label text="Photographers" size={34} rot={2} /></g>
        </g>}
        {t > popAt && t < popAt + 0.4 && <g transform="translate(330,-640)">{Array.from({length: 10}).map((_, i) => {
          const a = (i / 10) * Math.PI * 2, k = (t - popAt) / 0.4;
          return <circle key={i} cx={Math.cos(a) * (100 + k * 300)} cy={Math.sin(a) * (100 + k * 300)} r={16 * (1 - k)} fill={C.card} stroke={C.ink} strokeWidth={2} />;
        })}</g>}
        <Motes t={t} />
      </Plane>
      <Plane k={1.35}>
        <Salon t={t} layer="fore" />
        <g opacity={1 - ramp(t, B.guards, 0.4)}><Calendar fr={f} x={-560} y={-560 + (1 - ramp(t, B.nextday - 0.1, 0.4)) * -900} pages={['Monday', 'Tuesday']} tearAt={[fr(B.nextday)]} /></g>
      </Plane>
    </Stage>
  );
};

// the little room at night (kit LittleRoom): the bundle under the bed, amber leaking, her eyes, glint
const DarkStage: React.FC<{t: number}> = ({t}) => {
  const f = fr(t);
  const cam = drift(camAt(t, [[T.dark, {x: -180, y: 240, z: 1.25}], [B.total, {x: -230, y: 300, z: 1.5}]]), t);
  return (
    <Stage cam={cam} bg={C.nightBlue}>
      <Defs />
      <Plane k={0.2}><KW><LittleRoom fr={f} only={['backdrop']} night /></KW></Plane>
      <Plane k={1}>
        <KW><LittleRoom fr={f} only={['mid', 'actors']} night /></KW>
        <SmockBundle fr={f} x={260 - 540} y={1440 - 1000} size={0.5} leak={1} eyes={1} glintAt={fr(T.dark + 0.7)} />
        <Motes t={t} n={8} x0={-700} w={900} y0={-300} h={700} />
      </Plane>
    </Stage>
  );
};

const STAGES: [number, React.FC<{t: number}>][] = [
  [T.louvre, Salon1], [T.gallery, Louvre], [T.glass, GalleryStage], [T.salon2, Glass], [T.stair, Salon2], [T.street, StairStage],
  [T.salon3, StreetStage], [T.dark, Salon3], [99999, DarkStage],
];

// the smile curve that becomes the Seine (hand-off stage 1 -> 2)
const SmileToSeine: React.FC<{t: number}> = ({t}) => {
  const a = B.vanishing + 0.35, b = T.louvre + 0.35;
  if (t < a || t > b + 0.3) return null;
  const k = interpolate(t, [a, b], [0, 1], clamp), fade = 1 - interpolate(t, [b, b + 0.3], [0, 1], clamp);
  const w = lerp(120, 1500, k), y = lerp(860, 1250, k);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}} opacity={fade}>
      <path d={`M${540 - w / 2},${y} Q540,${y + lerp(30, 260, k)} ${540 + w / 2},${y}`} stroke={k < 0.5 ? C.ink : C.duskBlue} strokeWidth={lerp(8, 120, k)} fill="none" strokeLinecap="round" />
    </svg>
  );
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const S = STAGES[STAGES.findIndex(([end]) => t < end)][1];
  return (
    <SeriesGrade fr={frame} grade="modern" wash={rampIO(t, B.l1, 1.2)}>
      <S t={t} />
      <SmileToSeine t={t} />
      <IrisLayer t={t} />
      <TitleCard fr={frame} at={fr(B.title + 0.15)} part={1} hangX={540} hangY={880} plateY={1080} outAt={fr(B.vanishing + 0.45)} />
      <CornerTab fr={frame} part={1} outAt={fr(B.title - 0.2)} />
      <NameTag fr={frame} at={fr(B.name + 0.1)} text="Vincenzo Peruggia" x={540} y={560} />
      <NameTag fr={frame} at={fr(B.plumber + 0.4)} text="Sauvet, plumber" x={420} y={600} />
      <NameTag fr={frame} at={fr(B.painter + 0.1)} text="Louis Béroud, painter" x={560} y={560} />
      <HonestyTag fr={frame} at={fr(B.photographers + 0.2)} text="Illustration" dur={60} />
      <HonestyTag fr={frame} at={fr(T.dark + 0.2)} text="Illustration" dur={90} />
      <EndCard fr={frame} at={fr(B.total - 2.2)} part={1} y={640} />
      {captions && <Captions fr={frame} chunks={CHUNKS} />}
    </SeriesGrade>
  );
};
