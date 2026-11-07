// The Stolen Smile, Part 1: The vanishing. One continuous camera through eight paper stages; every hand-off is a
// carrier push (the camera pushes into the carrier, the next stage is swapped behind it) or a pop-up fold.
// Times: beats.json (from the VO). Look: pictures-pick §1 (toy theatre, printed in 1911). Captions: ./p1/captions.
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, random} from 'remotion';
import B from './beats.json';
import {
  C, Cut, Ell, rect, Person, MonaLisa, Hooks, Vincenzo, GUARD_TALL, GUARD_ROUND, ARTLOVER, Monocle, FameGauge, Calendar, Question,
  Label, Bundle, Glint, Easel, BoxCamera, Knob, Pliers, Toolbag, Baguettes, Dog, ML_RATIO, glintK, fr, lerp, Dust, Skylight, Parquet,
  camAt, drift, clamp, ramp, rampIO, win, Plane, Cam,
  SalonWall, ModernCrowd, Rope, LouvreExterior, Pigeon, Gallery, Stair, Street, ParisMap, DarkRoom, ML_W, ML_Y, HOOK_Y,
} from './p1/sets';
import {Stage} from './p1/rig';
import {Defs, TYPE, SERIF, SANS, Guard, ArtLover} from './p1/cast';
import {CHUNKS} from './p1/captions';
import {SeriesGrade} from './series/grade';
import {Captions} from './series/captions';
import {CornerTab, TitleCard, EndCard, NameTag, HonestyTag} from './series/cards';

export const FPS = 30;
export const DUR = Math.round(B.total * FPS);

// stage boundaries (seconds): each is inside a carrier push or fold
export const T = {
  louvre: B.paris - 0.15, gallery: B.monday - 0.2, glass: B.name - 0.25, salon2: B.room - 0.3, stair: B.staircase - 0.2,
  street: B.walksout + 0.1, salon3: B.nextday + 0.05, dark: B.noone + 0.75,
};
// carrier pushes: an iris of the carrier's colour grows from a screen point, the stage swaps, it opens on the next
type Iris = {at: number; color: string; x: number; y: number; x2?: number; y2?: number; d?: number};
const IRIS: Iris[] = [
  {at: T.gallery, color: C.nightBlue, x: 540, y: 960},
  {at: T.glass, color: '#DDE6EE', x: 540, y: 900, d: 0.3},
  {at: T.salon2, color: '#DDE6EE', x: 860, y: 960, x2: 540, y2: 700},
  {at: T.stair, color: C.ink, x: 900, y: 1150, x2: 300, y2: 700},
  {at: B.door - 0.15, color: C.smock, x: 540, y: 1000, x2: 600, y2: 1000},
  {at: T.street, color: '#FFF7E2', x: 560, y: 1000, x2: 400, y2: 1100},
  {at: T.dark, color: '#1C2438', x: 540, y: 980, d: 0.3},
];
const IrisLayer: React.FC<{t: number}> = ({t}) => {
  for (const ir of IRIS) {
    const d = ir.d ?? 0.35;
    if (t > ir.at - d && t < ir.at + d) {
      const grow = t < ir.at;
      const k = grow ? interpolate(t, [ir.at - d, ir.at], [0, 1], clamp) : interpolate(t, [ir.at, ir.at + d], [1, 0], clamp);
      const x = grow ? ir.x : ir.x2 ?? ir.x, y = grow ? ir.y : ir.y2 ?? ir.y;
      const r = Math.pow(k, 1.6) * 2300;
      return <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><circle cx={x} cy={y} r={r} fill={ir.color} /></svg>;
    }
  }
  return null;
};

// ================= stage 1: the Salon Carré, today -> 1911; the theft; the title =================
const Salon1: React.FC<{t: number}> = ({t}) => {
  const fold = rampIO(t, B.l1 + 0.6, 1.0);         // 1911 paintings fold up
  const crowdFold = 1 - rampIO(t, B.l1 + 0.2, 0.7);   // today's crowd folds down
  const rise = ramp(t, 0.1, 2.6);
  // the hand: reaches in from frame right, grabs, zips her off
  const reach = rampIO(t, B.stole - 0.1, 0.5), zip = rampIO(t, B.stole + 0.75, 0.35);
  const mlX = zip * 1500, mlRot = zip * 18;
  const smileO = t > B.stole + 0.9 ? win(t, B.stole + 0.9, B.title + 0.9, 0.25) : 0;
  const smileX = interpolate(t, [B.title + 0.3, B.title + 0.9], [0, 380], clamp);
  const cam = drift(camAt(t, [
    [0, {x: 0, y: ML_Y + 92, z: 3.4}], [B.think + 1.6, {x: 0, y: 140, z: 0.95}], [B.l1, {x: 0, y: 160, z: 0.95}],
    [B.artlovers - 0.4, {x: 120, y: 120, z: 1.0}], [B.stole, {x: 60, y: -40, z: 1.15}], [B.stole + 0.9, {x: 120, y: -60, z: 1.2, r: 4}],
    [B.title, {x: 0, y: -120, z: 1.35, r: 0}], [B.vanishing + 0.6, {x: 0, y: -60, z: 1.75}],
  ]), t);
  const lovers = ramp(t, B.artlovers - 0.6, 1.4);
  const monoPop = ramp(t, B.stole + 0.6, 0.4);
  const wallLight = t < B.l1 + 0.6 ? '#EDE7DA' : C.paper;
  const hookClink = (i: number) => ramp(t, B.title + 0.35 + i * 0.18, 0.15);
  return (
    <>
      <Plane k={0.2}><rect x={-3000} y={-3000} width={6000} height={6000} fill={wallLight} /></Plane>
      <Plane k={0.7}>
        <SalonWall t={t} fold={fold} eyes={[0, lovers > 0.5 ? -0.6 : 0, 0, 0, 0]} />
        {/* today's plain wall panel behind her (folds away) */}
        <g transform={`translate(0,500) scale(1,${crowdFold}) translate(0,-500)`}>
          <Cut d={rect(-520, -760, 1040, 1260, 4)} fill="#E7E1D3" w={3} />
        </g>
        <Skylight t={t} o={fold} />
      </Plane>
      <Plane k={1}>
        <g transform={`translate(0,${HOOK_Y})`}><Hooks lit={[0, 1, 2, 3].map(hookClink)} sway={t > B.stole + 0.8 ? Math.sin((t - B.stole) * 9) * 6 * Math.exp(-(t - B.stole) * 2) : 0} tags={[0, 0, 0, 0]} /></g>
        <g transform={`translate(${mlX},${ML_Y - zip * 120}) rotate(${mlRot})`}>
          <MonaLisa w={ML_W} glow={0.55 + 0.2 * Math.sin(t * 2)} glass={crowdFold} />
        </g>
        {/* the Cheshire smile left floating in the empty spot */}
        {smileO > 0 && <g transform={`translate(${smileX},${ML_Y + 82})`} opacity={smileO}><MonaLisa w={110} crop="smile" /></g>}
        {/* the hand (white sleeve) from frame right */}
        {reach > 0 && zip < 1 && <g transform={`translate(${lerp(900, 130, reach) + zip * 1500},${ML_Y + 120})`}>
          <Cut d={rect(0, -40, 900, 80, 30)} fill={C.smock} />
          <Ell cx={0} cy={0} rx={48} ry={42} fill={C.skin[1]} />
        </g>}
        {/* art lovers admiring the bigger painting (left) */}
        {(['tall', 'medium', 'short'] as const).map((v, i) => {
          const x = lerp(1400, 200 + i * 150, lovers), pop = i === 0 ? monoPop : 0;
          const sc = 0.62 - i * 0.03;
          return <g key={i} transform={`translate(${x},${760 - i * 8})`} opacity={fold}>
            <ArtLover variant={v} monocle={pop < 0.15} fr={fr(t) + i * 7} walk={lovers < 1 ? 1 : 0} s={sc} flip={t <= B.stole + 0.5}
              expr={pop > 0.15 ? 'jawDrop' : lovers >= 1 ? 'smile' : 'calm'} />
            {pop > 0 && pop < 1 && <g transform={`translate(${20 + pop * 120},${-sc * 640 * 0.8 + pop * 160}) rotate(${pop * 300})`}>
              <circle r={14} fill="rgba(255,255,255,0.4)" stroke={C.oldGold} strokeWidth={4} /></g>}
          </g>;
        })}
        <ModernCrowd t={t} rise={rise} fold={crowdFold} />
        <Rope fold={crowdFold} />
        <Parquet y={500} tint={t < B.l1 + 0.5 ? '#CFC6B4' : C.paperShade} />
      </Plane>
      <Plane k={1.35}>
        {/* the "?" stamp on the glass, on "think" */}
        {t > B.think && t < B.l1 + 0.4 && <g transform={`translate(${140},${ML_Y + 40}) rotate(-12) scale(${interpolate(t, [B.think, B.think + 0.12], [1.8, 1], clamp)})`} opacity={win(t, B.think, B.l1 + 0.4, 0.15) * 0.92}>
          <Question s={0.9} />
        </g>}
        {/* the fame gauge, needle trembling at the monocle */}
        <g transform={`translate(${-170},${190 + (1 - ramp(t, B.superstar, 0.5)) * 900})`} opacity={t < B.title + 0.4 ? 1 : 1 - ramp(t, B.title + 0.4, 0.4)}>
          <FameGauge needle={0.02} fr={fr(t)} s={0.9} />
        </g>
        {/* calendar 1911 on the wall */}
        <g transform={`translate(${-250},${-520 + (1 - ramp(t, B.before, 0.4)) * -900})`} opacity={t < B.title ? 1 : 1 - ramp(t, B.title, 0.3)}>
          <Calendar pages={['1911']} idx={0} s={0.85} />
        </g>
      </Plane>
    </>
  );
};

// ================= stage 2: Paris, 1911: the sleeping Louvre =================
const Louvre: React.FC<{t: number}> = ({t}) => {
  const openWin = ramp(t, T.gallery - 1.0, 0.7);
  const cam = drift(camAt(t, [
    [T.louvre, {x: -700, y: -200, z: 0.55}], [B.giant, {x: 200, y: -260, z: 0.62}], [B.mondays, {x: 1100, y: -240, z: 0.75}],
    [T.gallery - 0.9, {x: 1467, y: -217, z: 0.95}], [T.gallery, {x: 1467, y: -217, z: 4.5}],
  ]), t);
  const pig = interpolate(t, [B.giant - 0.6, B.closed + 0.2], [0, 1], clamp);
  return (
    <Stage cam={cam} bg="#C9C2B0">
      <Defs />
      <LouvreExterior t={t} openWin={openWin} />
      <Plane k={0.6}>
        <g transform={`translate(${lerp(-900, -230, pig)},${lerp(-520, -110, pig) - Math.sin(pig * Math.PI) * 120})`}><Pigeon t={t} /></g>
      </Plane>
      <Plane k={0.85}>
        <g transform={`translate(${-640},${-820 + (1 - ramp(T.louvre + 0.1 > t ? 0 : t, T.louvre + 0.1, 0.4)) * -600})`}><Label text="Paris, 1911" size={70} rot={-3} /></g>
        <g transform={`translate(${1150},${-640 + (1 - ramp(t, B.mondays - 0.1, 0.4)) * -900})`}><Calendar pages={['Monday']} idx={0} s={1.1} /></g>
      </Plane>
    </Stage>
  );
};

// ================= stage 3: the quiet halls =================
const GalleryStage: React.FC<{t: number}> = ({t}) => {
  const vx = interpolate(t, [T.gallery, T.glass], [-900, 2700]);
  const cam = drift(camAt(t, [
    [T.gallery, {x: -600, y: -150, z: 0.85}], [B.halls, {x: 1900, y: -100, z: 0.9}], [T.glass - 0.5, {x: 2550, y: 160, z: 2.6}], [T.glass, {x: 2650, y: 180, z: 5}],
  ]), t);
  return (
    <Stage cam={cam} bg={C.duskBlue}>
      <Defs />
      <Gallery t={t} vx={vx} />
      <Plane k={1}>
        <ellipse cx={vx + 30} cy={500} rx={110} ry={18} fill="rgba(20,24,36,0.5)" />
        <g transform={`translate(${vx},500)`}><Vincenzo fr={fr(t)} walk={1} s={0.62} /></g>
      </Plane>
    </Stage>
  );
};

// ================= stage 4: the glass box =================
const Glass: React.FC<{t: number}> = ({t}) => {
  const write = interpolate(t, [B.name + 0.15, B.name + 1.2], [0, 1], clamp);
  const wipe = rampIO(t, B.knows + 0.1, 1.0);
  const cam = drift(camAt(t, [
    [T.glass, {x: 0, y: -40, z: 1.25}], [B.helped, {x: 40, y: 0, z: 1.1, r: -2}], [T.salon2 - 0.4, {x: 260, y: 40, z: 1.0, r: 1}], [T.salon2, {x: 330, y: 0, z: 1.3}],
  ]), t);
  const taps = [B.glassbox + 0.05, B.glassbox + 0.35];
  const tapK = Math.max(...taps.map((a) => (t > a && t < a + 0.35 ? 1 - (t - a) / 0.35 : 0)));
  const glowUp = 0.5 + 0.4 * ramp(t, B.protects, 0.6);
  const breath = 0.6 + 0.4 * Math.sin(Math.min(1, (t - T.glass) / 0.6) * Math.PI / 2);
  return (
    <Stage cam={cam} bg="#3C4C6E">
      <Defs />
      <Plane k={0.4}>
        <rect x={-2000} y={-2000} width={4000} height={4000} fill="#3C4C6E" />
        {Array.from({length: 5}).map((_, i) => <path key={i} d={`M${-900 + i * 450},-1100 L${-760 + i * 450},-1100 L${-460 + i * 450},900 L${-700 + i * 450},900Z`} fill="#AFC2E0" opacity={0.08 + 0.04 * Math.sin(t + i)} />)}
      </Plane>
      <Plane k={1}>
        {/* her, close, behind the glass */}
        <g transform="translate(0,-460)"><MonaLisa w={560} glow={glowUp} frame /></g>
        {/* his reflection on the glass, to her side (never over her face) */}
        <g transform="translate(-470,120)" opacity={0.28 * ramp(t, B.knows + 0.6, 0.6)}><Vincenzo fr={fr(t)} s={1.2} smock /></g>
        {/* knuckle taps */}
        <g transform={`translate(${380},${360 - tapK * 20})`} opacity={ramp(t, B.glassbox - 0.4, 0.3)}>
          <Ell cx={0} cy={0} rx={52} ry={44} fill={C.skin[1]} />
          <Cut d={rect(-10, 20, 600, 90, 30)} fill={C.smock} />
        </g>
        {taps.map((a, i) => t > a && t < a + 0.6 ? <circle key={i} cx={360} cy={340} r={30 + (t - a) * 260} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={1 - (t - a) / 0.6} /> : null)}
      </Plane>
      <Plane k={1.15}>
        {/* the glass pane we look through: fog, then the sleeve wipe */}
        <rect x={-1400} y={-1600} width={2800} height={3200} fill="#DDE6EE" opacity={0.12} />
        <g>
          <defs><clipPath id="fogclip"><rect x={-1400 + wipe * 2800} y={-1600} width={2800} height={3200} /></clipPath></defs>
          <g clipPath="url(#fogclip)">
            <rect x={-1400} y={-1600} width={2800} height={3200} fill="#E8EEF2" opacity={0.78 * breath} />
            <text x={0} y={-60} textAnchor="middle" fontFamily={TYPE} fontSize={190} fill="#7D8FA8" opacity={0.95}
              style={{clipPath: `inset(0 ${100 - write * 100}% 0 0)`}}>Vincenzo</text>
          </g>
          {/* the sleeve doing the wipe */}
          {wipe > 0 && wipe < 1 && <g transform={`translate(${-1400 + wipe * 2800},0) rotate(-8)`}><Cut d={rect(-120, -500, 240, 1000, 100)} fill={C.smock} /></g>}
        </g>
        {/* glass edge highlights */}
        <path d="M-1400,-900 L-200,-1700" stroke="#FFFFFF" strokeWidth={30} opacity={0.18} />
        <rect x={500} y={-1600} width={22} height={3200} fill="#FFFFFF" opacity={0.25 + 0.3 * ramp(t, T.salon2 - 0.9, 0.6)} />
      </Plane>
    </Stage>
  );
};

// ================= stage 5: her room, Monday: the hooks, the lift =================
const Salon2: React.FC<{t: number}> = ({t}) => {
  const vx = interpolate(t, [T.salon2, B.hangs], [-900, -150], clamp);
  const lift = rampIO(t, B.lifts + 0.1, 0.8);
  const walkOff = interpolate(t, [B.carries - 0.1, T.stair], [0, 1], clamp);
  const cam = drift(camAt(t, [
    [T.salon2, {x: -200, y: 60, z: 0.9}], [B.hangs, {x: 0, y: -60, z: 1.2}], [B.hooks, {x: 0, y: HOOK_Y, z: 2.4}], [B.hooks_end + 0.2, {x: 0, y: HOOK_Y + 10, z: 2.5}],
    [B.lifts + 0.3, {x: 0, y: 0, z: 1.25}], [B.nobody, {x: 0, y: 40, z: 0.95}], [B.carries, {x: 120, y: 60, z: 1.0}], [T.stair, {x: 700, y: 200, z: 1.9}],
  ]), t);
  const look = interpolate(t, [B.nobody - 0.2, B.nobody + 0.3], [0, 1], clamp);
  const eyes = [0.8 * look, -0.9 * look, 0.7 * look, 0.6 * look, 0.2 * look, 0.9 * look, -0.9 * look];
  const hookK = (i: number) => ramp(t, B.hooks + 0.05 + i * 0.22, 0.12) * (1 - ramp(t, B.lifts + 0.6, 0.5));
  const vinX = t < B.carries ? vx : lerp(-150, 760, walkOff);
  const carry = lift; // painting from wall to under his arm
  const mlX = lerp(0, vinX + 70, carry), mlY = lerp(ML_Y, 120, carry);
  const cricket = interpolate(t, [B.nobody + 0.2, B.carries], [0, 1], clamp);
  return (
    <Stage cam={cam} bg="#C8CBCB">
      <Defs />
      <Plane k={0.2}><rect x={-3000} y={-3000} width={6000} height={6000} fill="#C8CBCB" /></Plane>
      <Plane k={0.7} dark={0.18}>
        <SalonWall t={t} eyes={eyes} light="#D9D6CC" />
        {/* small service door right */}
        <Cut d={rect(980, -40, 240, 540, 6)} fill={C.ink} />
      </Plane>
      <Plane k={1}>
        <g transform={`translate(0,${HOOK_Y})`}><Hooks lit={[0, 1, 2, 3].map(hookK)} sway={t > B.lifts + 0.6 ? Math.sin((t - B.lifts) * 8) * 7 * Math.exp(-(t - B.lifts - 0.6) * 1.5) : 0} /></g>
        <ellipse cx={vinX + 20} cy={500} rx={120} ry={16} fill="rgba(20,24,36,0.35)" />
        <g transform={`translate(${vinX},500)`}>
          <Vincenzo fr={fr(t)} walk={(t < B.hangs || t > B.carries) ? 1 : 0} s={0.9} armR={t > B.lifts - 0.3 && t < B.lifts + 0.9 ? -150 * (1 - lift) - 20 : t >= B.lifts + 0.9 ? -20 : 0} eyeX={t > B.nobody && t < B.carries ? 4 * Math.sin(t * 3) : 0} />
        </g>
        <g transform={`translate(${mlX},${mlY}) rotate(${carry * 6})`}><MonaLisa w={ML_W} glow={0.6} glint={glintK(t, B.nobody + 0.45)} /></g>
        {/* the cricket hops across the parquet */}
        {cricket > 0 && cricket < 1 && <g transform={`translate(${lerp(-700, 800, cricket)},${560 - Math.abs(Math.sin(cricket * Math.PI * 5)) * 70})`}>
          <Ell cx={0} cy={0} rx={22} ry={11} fill="#4F5A2E" w={2} /><path d="M-6,0 L-30,-24 L-40,8 M8,0 L30,-26 L44,6" stroke={C.ink} strokeWidth={3} fill="none" />
        </g>}
        <Parquet y={500} tint="#BDB7A6" />
      </Plane>
    </Stage>
  );
};

// ================= stage 6: the back staircase; frame and glass off; the wrap; the locked door; the plumber =================
const STEP = (i: number) => ({x: -150 + i * 120, y: -900 + i * 220}); // top of step i (stage coords)
const StairStage: React.FC<{t: number}> = ({t}) => {
  // Vincenzo goes down steps 0..4, then at the wrap he is on step 6, then the door landing
  const stepIdx = interpolate(t, [T.stair, B.frame - 0.2, B.leaves, B.leaves + 1.0], [0, 3, 3, 4.2], clamp);
  const atDoor = t > B.door - 0.15;
  const vx = atDoor ? interpolate(t, [B.door - 0.15, B.door + 0.4], [420, 470], clamp) : STEP(stepIdx).x;
  const vy = atDoor ? 640 : STEP(stepIdx).y;
  const strip = rampIO(t, B.frame + 0.05, 0.6);
  const edge = rampIO(t, B.board + 0.4, 0.8) * (1 - rampIO(t, B.wraps - 0.2, 0.4));
  const wrap = ramp(t, B.wraps, 0.9);
  const doorStretch = 1 + 0.32 * rampIO(t, B.locked, 0.6);
  const knob = ramp(t, B.locked + 0.5, 0.3);
  const doorOpen = rampIO(t, B.opens, 0.6);
  const daylight = ramp(t, B.opens + 0.1, 0.4);
  const pl = interpolate(t, [B.plumber - 0.1, B.plumber + 1.6], [-400, 210], clamp);
  const bow = t > B.opens + 0.4 ? 32 * Math.sin(Math.min(1, (t - B.opens - 0.4) / 0.7) * Math.PI * 0.5) : 0;
  const shadowX = interpolate(t, [B.plumber - 0.6, B.plumber + 0.6], [900, 640], clamp);
  const cam = drift(camAt(t, [
    [T.stair, {x: -200, y: -900, z: 0.95}], [B.frame, {x: 120, y: -360, z: 0.95}], [B.leaves, {x: 300, y: -180, z: 0.85, r: 2}],
    [B.board + 0.2, {x: 470, y: -160, z: 1.7, r: 0}], [B.thin + 0.6, {x: 500, y: -160, z: 1.85, r: -3}], [B.wraps + 0.8, {x: 330, y: -100, z: 2.3}], [B.door - 0.15, {x: 330, y: -100, z: 4.5}],
    [B.door - 0.1, {x: 560, y: 380, z: 1.5, r: 0}], [B.locked + 0.4, {x: 600, y: 300, z: 1.25}], [B.plumber + 0.5, {x: 420, y: 340, z: 1.05}],
    [B.opens, {x: 520, y: 360, z: 1.15}], [T.street, {x: 710, y: 330, z: 2.6}],
  ]), t);
  const holdingML = t < B.frame + 0.1;
  // frame bars clatter down the steps; glass box slides 3 steps
  const bars = [0, 1, 2, 3].map((i) => {
    const k = rampIO(t, B.frame + 0.2 + i * 0.12, 0.9);
    const s0 = STEP(3), s1 = STEP(Math.min(6, 4 + i * 0.6));
    return {x: lerp(s0.x + 60, s1.x + 80 + i * 60, k), y: lerp(s0.y - 160, s1.y - 14, k) - Math.sin(k * Math.PI * 2) * 50, r: k * (200 + i * 90)};
  });
  const gk = rampIO(t, B.frame + 0.55, 1.0);
  const gs0 = STEP(3), gs1 = STEP(5.2);
  const vinLook = atDoor;
  const mlPos = {x: vx + 70, y: vy - 360};
  const shake = t > B.door + 0.4 && t < B.locked + 0.4 ? Math.sin(t * 60) * 4 : 0;
  const sweat = t > B.locked + 0.6 && t < B.opens ? ramp(t, B.locked + 0.6, 0.3) : 0;
  return (
    <Stage cam={cam} bg="#7F786C">
      <Defs />
      <Stair t={t} doorStretch={doorStretch} lampFlick={random(`lf${Math.floor(t * 6)}`)} daylight={daylight} doorOpen={doorOpen} />
      <Plane k={1}>
        {/* the frame and glass left behind on the steps like an empty shell */}
        {t > B.frame && bars.map((b, i) => <g key={i} transform={`translate(${b.x},${b.y}) rotate(${b.r})`}><Cut d={rect(-90, -11, 180, 22, 4)} fill={C.oldGold} w={2.5} /></g>)}
        {t > B.frame + 0.5 && <g transform={`translate(${lerp(gs0.x + 120, gs1.x + 200, gk)},${lerp(gs0.y - 150, gs1.y - 110, gk)}) rotate(${gk * -6})`}>
          <rect x={-120} y={-150} width={240} height={290} fill="#DDE6EE" opacity={0.4} stroke="#FFFFFF" strokeWidth={5} />
          <path d="M-100,-100 L-40,-150 M-110,-40 L0,-150" stroke="#FFFFFF" strokeWidth={6} opacity={0.6} />
        </g>}
        {/* Vincenzo */}
        <g transform={`translate(${vx + shake},${vy})`}>
          <Vincenzo fr={fr(t)} walk={(t < B.frame - 0.2) || (t > B.leaves && t < B.leaves + 1.0) ? 1 : 0} s={0.95} smock={t < B.wraps}
            armR={atDoor ? (t < B.locked + 0.4 ? -70 + shake * 3 : -40) : -30} brows={sweat * 6} mouth={sweat > 0 ? 'flat' : 'smile'}
            eyeX={vinLook && t > B.plumber ? -4 : 0} />
          {atDoor && knob > 0 && <g transform={`translate(${60},${-310 + knob * 10})`}><Knob /></g>}
          {sweat > 0 && [0, 1, 2].map((i) => <path key={i} transform={`translate(${-40 + i * 50},${-640 + ((t * 1.6 + i * 0.33) % 1) * 90})`} d="M0,0 Q10,16 0,24 Q-10,16 0,0Z" fill="#AFC2E0" stroke={C.ink} strokeWidth={2} opacity={sweat} />)}
        </g>
        {/* her: in the frame (being carried), then the bare board turning edge-on, then the bundle */}
        {t < B.wraps + 0.3 && <g transform={`translate(${holdingML ? mlPos.x : 480},${holdingML ? mlPos.y : -500}) scale(${Math.max(0.04, Math.cos(edge * Math.PI * 0.47))},1)`}>
          <MonaLisa w={ML_W} glow={0.5} frame={t < B.frame + 0.3} glass={t < B.frame + 0.5 ? 0.8 * (1 - strip) : 0} />
          {edge > 0.6 && <rect x={-3} y={0} width={6 / Math.max(0.04, Math.cos(edge * Math.PI * 0.47))} height={ML_W * ML_RATIO} fill={C.sepia} />}
        </g>}
        {/* the notebook ghost-outline next to her (size check) */}
        {t > B.thin - 0.3 && t < B.wraps + 0.3 && <g transform="translate(700,-500)" opacity={win(t, B.thin - 0.3, B.wraps + 0.3, 0.3)}>
          <rect x={-90} y={0} width={180} height={240} fill="none" stroke={C.ink} strokeWidth={3} strokeDasharray="12 10" />
          <text x={0} y={280} textAnchor="middle" fontFamily={TYPE} fontSize={28} fill={C.ink}>a notebook</text>
        </g>}
        {t > B.thin && t < B.wraps + 0.2 && <g transform="translate(560,-60)" opacity={win(t, B.thin, B.wraps + 0.2, 0.25)}><Label text="thin wooden board" size={34} rot={-2} /></g>}
        {/* the wrap: the smock closes round her, her eyes peek over, amber leaks at the folds */}
        {t >= B.wraps && !atDoor && <g transform={`translate(${vx + 80},${vy - 300}) scale(${(0.3 + 0.7 * wrap) * 0.6})`} opacity={Math.min(1, wrap * 3)}><Bundle fr={fr(t)} leak={wrap} eyes={ramp(t, B.wraps + 0.5, 0.4)} s={0.95} /></g>}
        {atDoor && <g transform={`translate(${vx + shake - 70},${vy - 330})`}><Bundle fr={fr(t)} leak={0.9} eyes={1} s={0.55} glint={glintK(t, B.opens + 0.6)} /></g>}
        {/* the plumber's shadow with the pliers, then the plumber */}
        {t > B.plumber - 0.6 && t < B.plumber + 1.2 && <g transform={`translate(${shadowX},120)`} opacity={0.35 * win(t, B.plumber - 0.6, B.plumber + 1.2, 0.3)}>
          <ellipse cx={0} cy={0} rx={90} ry={220} fill={C.ink} /><rect x={60} y={-60} width={120} height={22} fill={C.ink} />
        </g>}
        {t > B.plumber - 0.1 && <g transform={`translate(${pl},640)`}>
          <Person look={{coat: C.duskBlue, trousers: C.duskBlue, skin: C.skin[2], hat: 'cap', hatFill: C.duskBlue, moustache: true, hair: '#5A4636'}}
            fr={fr(t)} walk={t < B.plumber + 1.6 ? 1 : 0} s={1.0} bow={bow} armR={t > B.opens - 0.4 ? -60 : 0} eyeX={t > B.worker ? 4 : 0} brows={t > B.worker && t < B.opens ? 4 : 0}>
            {t > B.opens - 0.5 && <g transform="rotate(-30)"><Pliers /></g>}
          </Person>
          <g transform="translate(-120,0)"><Toolbag /></g>
        </g>}
      </Plane>
    </Stage>
  );
};

// ================= stage 7: the streets of Paris, then the map =================
const StreetStage: React.FC<{t: number}> = ({t}) => {
  const vx = interpolate(t, [T.street, B.carrying + 0.4], [0, 1500], clamp);
  const mapFold = rampIO(t, B.carrying + 0.35, 0.45);   // the map flap folds down from the top over the street
  const mapUp = rampIO(t, T.salon3 - 0.45, 0.45);       // and folds back up onto the next morning
  const cam = drift(camAt(t, [[T.street, {x: -100, y: -200, z: 1.0}], [B.carrying, {x: 1300, y: -260, z: 0.9}], [B.carrying + 0.6, {x: 1500, y: -500, z: 0.7}]]), t);
  const walkers = [
    {x0: 1700, kind: 'baker'}, {x0: 2500, kind: 'lady'}, {x0: 3300, kind: 'police'},
  ];
  const dot = interpolate(t, [B.carrying + 0.6, T.salon3 - 0.3], [0, 1], clamp);
  return (
    <>
      <Stage cam={cam} bg="#EADFC6">
        <Defs />
        <Street t={t} />
        <Plane k={1}>
          {walkers.map((w, i) => {
            const x = w.x0 - (t - T.street) * 260;
            const tip = w.kind === 'police' && Math.abs(x - vx) < 260;
            return <g key={i} transform={`translate(${x},${560 + i * 14})`}>
              {w.kind === 'baker' && <Person look={{coat: C.card, trousers: C.stone, skin: C.skin[0], hat: 'beret', hatFill: C.card, moustache: true, hair: '#6B5A4A', apron: '#FFFFFF'}} fr={fr(t)} walk={1} s={0.95} flip><Baguettes /></Person>}
              {w.kind === 'lady' && <><Person look={{coat: '#8A5A4A', skin: C.skin[3], hat: 'bonnet', hatFill: C.clueRed, skirt: true, hair: C.ink}} fr={fr(t) + 5} walk={1} s={0.92} flip /><g transform="translate(-200,0)"><Dog fr={fr(t)} /></g></>}
              {w.kind === 'police' && <Person look={{coat: C.nightBlue, trousers: C.nightBlue, skin: C.skin[1], hat: 'kepi', moustache: true, hair: C.ink}} fr={fr(t) + 9} walk={1} s={1.0} flip armR={tip ? -150 : 0} eyeX={-3} />}
            </g>;
          })}
          <g transform={`translate(${vx},580)`}>
            <Vincenzo fr={fr(t)} walk={1} s={0.95} smock={false} armR={-20} />
            <g transform="translate(70,-330)"><Bundle fr={fr(t)} leak={0.9} eyes={0.8} s={0.55} /></g>
          </g>
        </Plane>
      </Stage>
      {mapFold > 0 && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <Defs />
        <g transform={`translate(0,0) scale(1,${mapFold * (1 - mapUp)})`}>
          <g transform="translate(540,1000) scale(1.0)"><ParisMap t={t} dot={dot} dotO={win(t, B.carrying + 0.5, T.salon3 - 0.15, 0.2)} /></g>
          <rect x={0} y={0} width={1080} height={1920} fill={C.ink} opacity={0.25 * (1 - mapFold)} />
        </g>
      </svg>}
    </>
  );
};

// ================= stage 8: the next day: the painter, the empty hooks, the guards, the "?", the dark room =================
const Salon3: React.FC<{t: number}> = ({t}) => {
  const bx = interpolate(t, [T.salon3, B.painter + 0.8], [-1300, -460], clamp);
  const easel = rampIO(t, B.painter + 0.9, 0.6);
  const lookUp = ramp(t, B.finds, 0.3);
  const brush = ramp(t, B.finds + 0.6, 0.5);
  const gx = interpolate(t, [B.guards - 0.6, B.guards + 0.5], [1300, 420], clamp);
  const shrug = t > B.guards + 0.4 && t < B.photographers ? Math.sin((t - B.guards - 0.4) * 9) * 10 : 0;
  const bubble = ramp(t, B.photographers - 0.1, 0.5) * (1 - ramp(t, B.didnt + 0.1, 0.12));
  const popAt = B.didnt + 0.1;
  const jaw = t > popAt;
  const dim = rampIO(t, B.gone, 0.8);
  const q = rampIO(t, B.gone + 0.3, 0.8);
  const cam = drift(camAt(t, [
    [T.salon3, {x: -400, y: 0, z: 0.95}], [B.painter + 0.6, {x: -250, y: -20, z: 1.0}], [B.finds, {x: -120, y: -80, z: 1.1}],
    [B.empty + 0.4, {x: 0, y: HOOK_Y + 40, z: 2.2}], [B.guards, {x: 0, y: HOOK_Y + 40, z: 2.3}], [B.guards + 0.8, {x: 180, y: -60, z: 1.0}],
    [B.photographers + 0.4, {x: 260, y: -260, z: 1.05}], [B.didnt + 0.4, {x: 120, y: -80, z: 1.0}], [B.gone + 0.2, {x: 0, y: -140, z: 1.25}],
    [B.noone, {x: 0, y: HOOK_Y + 30, z: 1.8}], [T.dark, {x: 0, y: HOOK_Y + 20, z: 7}],
  ]), t);
  const flash = (a: number) => (t > a && t < a + 0.35 ? 1 - (t - a) / 0.35 : 0);
  return (
    <Stage cam={cam} bg={C.paper}>
      <Defs />
      <Plane k={0.2}><rect x={-3000} y={-3000} width={6000} height={6000} fill={C.paper} /></Plane>
      <Plane k={0.7} dark={0.55 * dim}>
        <SalonWall t={t} eyes={[0, 0.5 * lookUp, 0, 0, 0, 0, 0]} />
        <Skylight t={t} o={1 - dim} />
      </Plane>
      <Plane k={1} dark={0.45 * dim}>
        {/* the empty spot: a paler patch where she hung */}
        <rect x={-ML_W / 2 - 20} y={ML_Y - 20} width={ML_W + 40} height={ML_W * ML_RATIO + 40} fill="#E9DDC2" opacity={0.85} />
        <g transform={`translate(0,${HOOK_Y})`}><Hooks /></g>
        {/* the hooks' four shadows lean together into a red "?" */}
        {q > 0 && <g transform={`translate(0,${HOOK_Y + 150})`}>
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${(i - 1.5) * 60},-110 l${lerp(26, ((1.5 - i) * 60) * 0.9, q)},${lerp(110, 60, q)}`} stroke={C.ink} strokeWidth={9} opacity={0.5 * (1 - q)} strokeLinecap="round" />)}
          <g opacity={q}><Question s={1.0} /></g>
        </g>}
        {/* Béroud with his easel and copy */}
        <g transform={`translate(${bx + 230},500)`} opacity={1 - dim}><Easel open={easel} /></g>
        <g transform={`translate(${bx},500)`} opacity={1 - dim}>
          <Person look={{coat: '#3A2F2A', trousers: C.ink, skin: C.skin[0], hat: 'none', beard: true, hair: '#4A3A2E'}} fr={fr(t)} walk={t < B.painter + 0.8 ? 1 : 0} s={1.0}
            brows={lookUp * 10} mouth={lookUp > 0.5 ? 'o' : 'smile'} eyeX={lookUp * 4} armR={-40 + lookUp * -20}>
            {brush < 1 && <g transform={`translate(${brush * 30},${brush * 280}) rotate(${brush * 160})`}><Cut d={rect(-5, -70, 10, 90, 3)} fill={C.sepia} w={2} /><rect x={-6} y={-80} width={12} height={16} fill={C.clueRed} /></g>}
          </Person>
        </g>
        {/* two guards: shrug, point down the hall, jaws drop */}
        {t > B.guards - 0.7 && [0, 1].map((i) => <g key={i} transform={`translate(${gx + i * 230},${500 + i * 6})`} opacity={1 - dim * 0.8}>
          <Guard variant={i ? 'short' : 'tall'} fr={fr(t) + i * 5} walk={t < B.guards + 0.5 ? 1 : 0} s={1} flip pose={t > B.guards + 0.4 && t < B.photographers - 0.1 ? 'shrug' : t > B.photographers - 0.1 && t < B.didnt ? 'point' : t > B.didnt ? 'surprised' : undefined}
            armR={t > B.photographers - 0.1 && t < B.didnt ? -110 : shrug} armL={shrug} mouth={jaw ? 'o' : 'smile'} brows={jaw ? 10 : 0} eyeX={jaw ? -4 : 0} />
        </g>)}
        {/* the daydream: a photo studio, her on an easel, a box camera flashing */}
        {bubble > 0 && <g transform={`translate(${560},${-560}) scale(${bubble})`}>
          {[0, 1, 2].map((i) => <circle key={i} cx={-60 + i * 40} cy={500 - i * 120} r={18 + i * 10} fill={C.card} stroke={C.ink} strokeWidth={3} />)}
          <Cut d="M-360,-260 Q-420,-420 -200,-430 Q-80,-560 120,-450 Q340,-500 380,-300 Q480,-120 330,40 Q300,180 80,160 Q-100,240 -250,140 Q-460,100 -360,-260Z" fill={C.card} />
          <g transform="translate(-170,-300)"><MonaLisa w={150} glow={0.4} frame={false} /></g>
          <g transform="translate(150,-80) scale(0.9)"><BoxCamera flash={Math.max(flash(B.photographers + 0.6), flash(B.photographers + 1.3))} /></g>
          <g transform="translate(40,-420)"><Label text="Photographers" size={34} rot={2} /></g>
        </g>}
        {t > popAt && t < popAt + 0.4 && <g transform="translate(560,-700)">{Array.from({length: 10}).map((_, i) => {
          const a = (i / 10) * Math.PI * 2, k = (t - popAt) / 0.4;
          return <circle key={i} cx={Math.cos(a) * (100 + k * 300)} cy={Math.sin(a) * (100 + k * 300)} r={16 * (1 - k)} fill={C.card} stroke={C.ink} strokeWidth={2} />;
        })}</g>}
        <Parquet y={500} />
      </Plane>
      <Plane k={1.3}>
        <g transform={`translate(${-560},${-640 + (1 - ramp(t, B.nextday - 0.1, 0.4)) * -900})`} opacity={1 - ramp(t, B.guards, 0.4)}><Calendar pages={['Monday', 'Tuesday']} idx={interpolate(t, [B.nextday, B.nextday + 0.6], [0, 1], clamp)} s={1.0} /></g>
      </Plane>
    </Stage>
  );
};

const DarkStage: React.FC<{t: number}> = ({t}) => {
  const cam = drift(camAt(t, [[T.dark, {x: 0, y: 240, z: 1.2}], [B.total, {x: -20, y: 300, z: 1.45}]]), t);
  return (
    <Stage cam={cam} bg="#1C2438">
      <Defs />
      <Plane k={1}><DarkRoom t={t} glint={glintK(t, T.dark + 0.7)} /></Plane>
    </Stage>
  );
};

const STAGES: [number, React.FC<{t: number}>][] = [
  [T.louvre, ({t}) => <Stage cam={{x: 0, y: 0, z: 1}} bg={C.paper}><Defs /><Salon1Inner t={t} /></Stage>],
  [T.gallery, Louvre], [T.glass, GalleryStage], [T.salon2, Glass], [T.stair, Salon2], [T.street, StairStage], [T.salon3, StreetStage], [T.dark, Salon3], [99999, DarkStage],
];
// Salon1 needs its own camera: wrap it
const Salon1Inner: React.FC<{t: number}> = ({t}) => <Salon1 t={t} />;

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
  const idx = STAGES.findIndex(([end]) => t < end);
  const S = STAGES[idx][1];
  const s1cam = drift(camAt(t, [
    [0, {x: 0, y: ML_Y + 92, z: 3.4}], [B.think + 1.6, {x: 0, y: 140, z: 0.95}], [B.l1, {x: 0, y: 160, z: 0.95}],
    [B.artlovers - 0.4, {x: 120, y: 120, z: 1.0}], [B.stole, {x: 60, y: -40, z: 1.15}], [B.stole + 0.9, {x: 120, y: -60, z: 1.2, r: 4}],
    [B.title, {x: 0, y: -120, z: 1.35, r: 0}], [B.vanishing + 0.6, {x: 0, y: -60, z: 1.75}],
  ]), t);
  return (
    <SeriesGrade fr={frame} grade="modern" wash={rampIO(t, B.l1, 1.2)}>
      {idx === 0 ? <Stage cam={s1cam} bg={C.paper}><Defs /><Salon1 t={t} /></Stage> : <S t={t} />}
      <SmileToSeine t={t} />
      <IrisLayer t={t} />
      <TitleCard fr={frame} at={fr(B.title + 0.15)} part={1} hangX={540} hangY={860} plateY={1060} outAt={fr(B.vanishing + 0.45)} />
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
