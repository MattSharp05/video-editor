import React from 'react';
import { C, FONT, T } from './tokens';
import { blob, cut, rnd, stepped, swing, wrect, smooth } from './util';
import { Hooks } from './props';
import { MonaLisa } from './monalisa';
import { Crowd } from './characters';

/**
 * Sets (pick §3.2). World-space <g>s in the 1080×1920 frame (floor line y = 1500 for actors' feet; walls extend
 * x −400…1480 so the camera can truck). Every set takes `only` to draw a subset of its planes, so a scene can
 * put each part in its own <Plane>:  only={['backdrop']} → <Plane depth={PLANE.backdrop}> etc.
 * Planes: 'backdrop' (0.2) | 'far' (0.45) | 'mid' (0.7) | 'actors' (1.0: set pieces at actor depth) | 'fore' (1.35).
 */
export type SetPlane = 'backdrop' | 'far' | 'mid' | 'actors' | 'fore';
const has = (only: SetPlane[] | undefined, p: SetPlane) => !only || only.includes(p);
type SetProps = { fr: number; only?: SetPlane[] };

/** A cartoon paper Old Master in an oldGold frame (never an imitation of a real work). Dot eyes slide by eyeX (-1..1). */
export const PaperPainting: React.FC<{ x: number; y: number; w: number; h: number; kind?: number; eyeX?: number; eyeY?: number; seed?: string }> = ({ x, y, w, h, kind = 0, eyeX = 0, eyeY = 0, seed = 'pp' }) => {
  const bg = [C.duskBlue, C.sepia, T.landscape, C.nightBlue][kind % 4];
  const f = Math.min(w, h) * 0.09;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g filter="url(#ss-shadow)"><path d={wrect(-w / 2 - f, -h / 2 - f, w + 2 * f, h + 2 * f, `${seed}f`, 1.5)} fill={C.oldGold} stroke={C.ink} strokeWidth={3} /></g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={bg} stroke={C.ink} strokeWidth={2} />
      {kind % 3 === 0 && <g>{/* portrait */}
        <path d={`M${-w * 0.35},${h / 2} C${-w * 0.35},${h * 0.05} ${w * 0.35},${h * 0.05} ${w * 0.35},${h / 2}Z`} fill={kind % 2 ? C.clueRed : C.suit} stroke={C.ink} strokeWidth={2} />
        <ellipse cx={0} cy={-h * 0.1} rx={w * 0.18} ry={h * 0.16} fill={C.skin1} stroke={C.ink} strokeWidth={2} />
        <path d={`M${-w * 0.2},${-h * 0.16} C${-w * 0.2},${-h * 0.36} ${w * 0.2},${-h * 0.36} ${w * 0.2},${-h * 0.16} C${w * 0.1},${-h * 0.22} ${-w * 0.1},${-h * 0.22} ${-w * 0.2},${-h * 0.16}Z`} fill={C.ink} />
        {[-1, 1].map((s) => <g key={s}><ellipse cx={s * w * 0.07} cy={-h * 0.12} rx={w * 0.04} ry={h * 0.028} fill="#fff" stroke={C.ink} strokeWidth={1} /><circle cx={s * w * 0.07 + eyeX * w * 0.025} cy={-h * 0.12 + eyeY * h * 0.012} r={Math.max(2, w * 0.018)} fill={C.ink} /></g>)}
        <path d={`M${-w * 0.05},${-h * 0.03} Q0,${-h * 0.01} ${w * 0.05},${-h * 0.03}`} stroke={C.ink} strokeWidth={1.5} fill="none" />
      </g>}
      {kind % 3 === 1 && <g>{/* landscape with a little figure */}
        <path d={`M${-w / 2},${h * 0.15} Q${-w * 0.1},${-h * 0.1} ${w / 2},${h * 0.2} L${w / 2},${h / 2} L${-w / 2},${h / 2}Z`} fill={T.landscape} />
        <circle cx={w * 0.25} cy={-h * 0.25} r={Math.min(w, h) * 0.08} fill={C.card} opacity={0.8} />
        <g transform={`translate(${-w * 0.1} ${h * 0.12})`}><ellipse cx={0} cy={-16} rx={7} ry={8} fill={C.skin2} stroke={C.ink} strokeWidth={1.5} /><path d="M-8,-8 L8,-8 L10,18 L-10,18Z" fill={C.clueRed} stroke={C.ink} strokeWidth={1.5} />
          <circle cx={-2 + eyeX * 2} cy={-17} r={1.4} fill={C.ink} /><circle cx={3 + eyeX * 2} cy={-17} r={1.4} fill={C.ink} /></g>
      </g>}
      {kind % 3 === 2 && <g>{/* two figures */}
        {[-1, 1].map((s) => <g key={s} transform={`translate(${s * w * 0.2} ${h * 0.05})`}>
          <path d={`M${-w * 0.14},${h * 0.45} C${-w * 0.14},${0} ${w * 0.14},${0} ${w * 0.14},${h * 0.45}Z`} fill={s > 0 ? C.duskBlue : C.oldGold} stroke={C.ink} strokeWidth={2} />
          <ellipse cx={0} cy={-h * 0.08} rx={w * 0.1} ry={h * 0.1} fill={s > 0 ? C.skin3 : C.skin1} stroke={C.ink} strokeWidth={2} />
          {[-1, 1].map((e) => <circle key={e} cx={e * w * 0.035 + eyeX * w * 0.02} cy={-h * 0.09 + eyeY * 2} r={Math.max(2, w * 0.014)} fill={C.ink} />)}
        </g>)}
      </g>}
    </g>
  );
};

/**
 * Salon Carré (MUST 1,2,3). state 'with-her' | 'empty' | 'empty+web' | 'crowd'; light 'monday' (cold nightBlue dawn) | 'day' (warm).
 * Her spot: centre x 540, hooks line y = HER.hookY; she hangs at HER.y (true scale 270 px). paintingEyes −1..1 slides
 * every paper painting's dot eyes (the "wave of eyes": pass per-painting values via eyeFn(i)). herGlow, glintAt pass to her.
 * Pass herOff to hide her while the room still says 'with-her' (e.g. Vincenzo is holding her). web 0..1 for 'empty+web'.
 */
export const HER = { x: 540, y: 1040, hookY: 880, h: 270 };
export const SalonCarre: React.FC<SetProps & { state?: 'with-her' | 'empty' | 'empty+web' | 'crowd'; light?: 'monday' | 'day'; eyeFn?: (i: number) => number; herGlow?: number; glintAt?: number | number[]; herOff?: boolean; web?: number; hookCountAt?: number; hookSwayAt?: number; shadowLean?: number }> =
  ({ fr, only, state = 'with-her', light = 'day', eyeFn = () => Math.sin(fr * 0.02) * 0.3, herGlow = 0.4, glintAt, herOff, web = 1, hookCountAt, hookSwayAt, shadowLean }) => {
    const night = light === 'monday';
    const PAINT: [number, number, number, number, number][] = [ // x,y,w,h,kind
      [-250, 760, 300, 420, 0], [150, 640, 230, 300, 1], [930, 700, 330, 460, 2], [1300, 760, 260, 380, 0],
      [210, 1070, 210, 260, 2], [860, 1100, 200, 240, 0], [-260, 1240, 260, 200, 1], [1310, 1230, 240, 200, 1],
      [540, 470, 380, 200, 1],
    ];
    return (
      <g>
        {has(only, 'backdrop') && <g>
          <rect x={-800} y={-400} width={2680} height={2800} fill={night ? C.duskBlue : C.paperShade} />
          {/* skylight */}
          <path d={cut([[-300, 0], [1380, 0], [1200, 260], [-120, 260]], 'sky', 3)} fill={night ? C.nightBlue : T.skylight} stroke={C.ink} strokeWidth={3} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1={-200 + i * 240} y1={0} x2={-60 + i * 210} y2={260} stroke={C.ink} strokeWidth={3} />)}
        </g>}
        {has(only, 'mid') && <g>
          <path d={wrect(-500, 250, 2080, 1260, 'wall', 2)} fill={night ? T.mondayWall : C.paper} stroke={C.ink} strokeWidth={3} />
          <rect x={-500} y={250} width={2080} height={40} fill={C.sepia} />
          <rect x={-500} y={1420} width={2080} height={36} fill={C.sepia} stroke={C.ink} strokeWidth={2} />
          {PAINT.map(([x, y, w, h, k], i) => <PaperPainting key={i} x={x} y={y} w={w} h={h} kind={k} eyeX={eyeFn(i)} seed={`sc${i}`} />)}
          {/* skylight beam */}
          <path d="M-100,260 L700,260 L900,1500 L-200,1500Z" fill={night ? 'url(#ss-night-beam)' : 'url(#ss-beam)'} opacity={0.8 + 0.2 * Math.sin(fr * 0.03)} />
          {/* her spot */}
          <Hooks fr={fr} x={HER.x} y={HER.hookY} state={state === 'empty+web' ? 'web' : state === 'with-her' && !herOff ? 'holding' : 'empty'} web={web} countAt={hookCountAt} swayAt={hookSwayAt} shadowLean={shadowLean} />
          {(state === 'with-her' || state === 'crowd') && !herOff && <MonaLisa fr={fr} x={HER.x} y={HER.y} height={HER.h} glow={herGlow} glintAt={glintAt} />}
          {[0, 1, 2, 3, 4].map((i) => { const t = ((fr * 0.6 + i * 37) % 160) / 160; return <circle key={i} cx={100 + i * 140 + Math.sin(fr * 0.03 + i) * 30} cy={400 + t * 900} r={3} fill="#FFF8E6" opacity={0.6 * Math.sin(t * Math.PI)} />; })}
        </g>}
        {has(only, 'actors') && <g>
          <rect x={-800} y={1456} width={2680} height={900} fill={C.parquet} />
          {[...Array(24)].map((_, i) => <line key={i} x1={-800 + i * 120} y1={1456} x2={-1000 + i * 150} y2={2400} stroke={C.sepia} strokeWidth={2} opacity={0.5} />)}
          {state === 'crowd' && <Crowd fr={fr} y={1700} rows={3} perRow={7} era="1911" seed={11} />}
        </g>}
        {has(only, 'fore') && <g>
          <path d={`M-420,-200 L-140,-200 L-140,2200 L-420,2200Z M1220,-200 L1500,-200 L1500,2200 L1220,2200Z`} fill={C.stone} stroke={C.ink} strokeWidth={3} />
          <path d="M-140,-200 Q540,240 1220,-200" fill="none" stroke={C.ink} strokeWidth={70} opacity={0.0} />
        </g>}
      </g>
    );
  };

/** Louvre exterior (MUST 1,3): very long paper façade along a curving duskBlue Seine, shutters = closed eyelids.
 *  state 'asleep' (snoring chimney puffs, eyelids closed) | 'awake' (shutters open). length: façade length px (default 3200, starting x −400).
 *  lift: index of one shutter whose eyelid lifts (lid 0..1). Sign "Closed on Mondays" swings on its chain (signAt). */
export const LouvreExterior: React.FC<SetProps & { state?: 'asleep' | 'awake'; length?: number; liftIndex?: number; lid?: number; signAt?: number; night?: boolean }> =
  ({ fr, only, state = 'asleep', length = 3200, liftIndex = -1, lid = 0, signAt = 0, night = false }) => {
    const n = Math.floor(length / 150);
    const breath = Math.sin(fr * 0.08);
    return (
      <g>
        {has(only, 'backdrop') && <g><rect x={-1200} y={-600} width={length + 2400} height={3200} fill={night ? C.nightBlue : C.duskBlue} />
          {[...Array(30)].map((_, i) => <circle key={i} cx={-800 + rnd(`st${i}`) * (length + 1600)} cy={-300 + rnd(`sy${i}`) * 700} r={2 + rnd(`sr${i}`) * 2} fill={C.card} opacity={night ? 0.8 : 0.25} />)}</g>}
        {has(only, 'far') && <g>{[...Array(Math.ceil((length + 1600) / 220))].map((_, i) => { const hh = 160 + rnd(`roof${i}`) * 140; return <path key={i} d={wrect(-800 + i * 220, 760 - hh, 200, hh + 200, `rf${i}`, 3)} fill={C.duskBlue} stroke={C.ink} strokeWidth={2} opacity={0.75} />; })}</g>}
        {has(only, 'mid') && <g>
          <path d={wrect(-400, 600, length, 520, 'facade', 3)} fill={C.stone} stroke={C.ink} strokeWidth={3.5} filter="url(#ss-shadow)" />
          <path d={cut([[-420, 600], [length - 380, 600], [length - 420, 520], [-380, 520]], 'roof', 3)} fill={C.nightBlue} stroke={C.ink} strokeWidth={3} />
          {[...Array(Math.floor(length / 400))].map((_, i) => { const t = ((stepped(fr) + i * 23) % 60) / 60; return <g key={i}>
            <rect x={-300 + i * 400} y={470} width={40} height={60} fill={C.stone} stroke={C.ink} strokeWidth={2.5} />
            {state === 'asleep' && <circle cx={-280 + i * 400 + t * 30} cy={455 - t * 120} r={10 + t * 24 * (0.6 + 0.4 * breath)} fill={C.card} opacity={0.6 * (1 - t)} />}
          </g>; })}
          {[...Array(n)].map((_, i) => [0, 1].map((row) => {
            const wx = -330 + i * 150, wy = 680 + row * 220;
            const idx = i * 2 + row;
            const open = state === 'awake' ? 1 : idx === liftIndex ? lid : 0;
            return <g key={`${i}-${row}`}>
              <rect x={wx} y={wy} width={80} height={150} fill={night ? C.nightBlue : C.ink} stroke={C.ink} strokeWidth={2.5} />
              {open > 0 && <rect x={wx + 6} y={wy + 6} width={68} height={138} fill={C.amberGlow} opacity={0.35 * open} />}
              <path d={`M${wx},${wy} L${wx + 80},${wy} L${wx + 80},${wy + 150 * (1 - open * 0.85)} Q${wx + 40},${wy + 150 * (1 - open * 0.85) + 18} ${wx},${wy + 150 * (1 - open * 0.85)}Z`} fill={C.paperShade} stroke={C.ink} strokeWidth={2.5} />
              {open < 0.9 && [0, 1, 2, 3].map((l) => <path key={l} d={`M${wx + 12 + l * 18},${wy + 150 * (1 - open * 0.85) + 10} l${-3 + l * 2},10`} stroke={C.ink} strokeWidth={2} />)}
            </g>;
          }))}
          {/* door + sign */}
          <path d="M420,1120 L420,960 Q490,890 560,960 L560,1120Z" fill={C.sepia} stroke={C.ink} strokeWidth={3} />
          <g transform={`translate(490 905) rotate(${swing(fr, signAt, 10, 80, 0.2) + Math.sin(fr * 0.07) * 2})`}>
            <path d="M-60,0 L0,-30 L60,0" stroke={C.ink} strokeWidth={2.5} fill="none" strokeDasharray="5 3" />
            <path d={wrect(-120, 0, 240, 64, 'closed', 1.5)} fill={C.card} stroke={C.ink} strokeWidth={2.5} />
            <text x={0} y={42} textAnchor="middle" fontFamily={FONT.type} fontSize={26} fill={C.ink}>Closed on Mondays</text>
          </g>
        </g>}
        {has(only, 'actors') && <g>
          <path d={`M-1200,1120 L${length + 1200},1120 L${length + 1200},1220 L-1200,1220Z`} fill={C.paperShade} stroke={C.ink} strokeWidth={3} />
          <path d={`M-1200,1250 C0,1200 ${length * 0.4},1330 ${length * 0.7},1260 S${length + 1000},1240 ${length + 1200},1280 L${length + 1200},2400 L-1200,2400Z`} fill={C.duskBlue} stroke={C.ink} strokeWidth={3} />
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${-600 + i * 700 + Math.sin(fr * 0.05 + i) * 40},${1340 + (i % 3) * 120} q30,-12 60,0 t60,0`} stroke={C.card} strokeWidth={3} fill="none" opacity={0.5} />)}
        </g>}
      </g>
    );
  };

/** Back staircase + locked door (MUST 1,2): narrow stone spiral of 7 steps, one wall lamp (flickers), a heavy door at the
 *  bottom (doorX, floor y 1500) with a brass knob (knobOff = knob gone). door 0..1 opens (daylight spills in). stretch 0..1 door-stretch gag. */
export const Staircase: React.FC<SetProps & { door?: number; knobOff?: boolean; stretch?: number }> = ({ fr, only, door = 0, knobOff, stretch = 0 }) => {
  const flick = 0.85 + 0.15 * rnd(`lamp${Math.floor(fr / 3)}`);
  const dx = 760, dTop = 900 - stretch * 260;
  return (
    <g>
      {has(only, 'backdrop') && <rect x={-600} y={-400} width={2280} height={2800} fill={C.nightBlue} />}
      {has(only, 'mid') && <g>
        <path d={wrect(-300, 100, 1680, 1420, 'stairwall', 2)} fill={C.stone} stroke={C.ink} strokeWidth={3} />
        {[...Array(9)].map((_, r) => [...Array(7)].map((_, c) => <rect key={`${r}${c}`} x={-280 + c * 240 + (r % 2) * 120} y={120 + r * 150} width={230} height={140} fill="none" stroke={C.ink} strokeWidth={1.5} opacity={0.35} />))}
        <ellipse cx={220} cy={520} rx={420 * flick} ry={480 * flick} fill="url(#ss-lamp)" />
        <g transform="translate(220 470)"><rect x={-6} y={0} width={12} height={40} fill={C.ink} /><path d="M-26,-50 L26,-50 L18,0 L-18,0Z" fill={C.amberGlow} opacity={0.4 + 0.3 * flick} stroke={C.ink} strokeWidth={2.5} /></g>
        {/* the door */}
        <g>
          {door > 0 && <path d={`M${dx},${dTop} L${dx + 260},${dTop} L${dx + 260},1500 L${dx},1500Z`} fill={T.doorLight} />}
          {door > 0 && <path d={`M${dx},1500 L${dx + 260},1500 L${dx + 800},2100 L${dx - 300},2100Z`} fill={T.doorLight} opacity={0.5 * door} />}
          <g transform={`translate(${dx} 0) scale(${1 - door * 0.85} 1)`} filter="url(#ss-cut)">
            <path d={wrect(0, dTop, 260, 1500 - dTop, 'door', 1.5)} fill={C.sepia} stroke={C.ink} strokeWidth={3.5} />
            {[0, 1, 2].map((i) => <rect key={i} x={30} y={dTop + 40 + i * ((1500 - dTop - 80) / 3)} width={200} height={(1500 - dTop - 140) / 3} fill="none" stroke={C.ink} strokeWidth={2} opacity={0.6} />)}
            {!knobOff && <circle cx={220} cy={1220} r={16} fill={C.oldGold} stroke={C.ink} strokeWidth={2.5} />}
            {knobOff && <circle cx={220} cy={1220} r={7} fill={C.ink} />}
          </g>
        </g>
      </g>}
      {has(only, 'actors') && <g>
        {/* 7 steps spiralling down from upper left to the floor */}
        {[...Array(7)].map((_, i) => <path key={i} d={wrect(-200 + i * 70, 760 + i * 106, 520 - i * 20, 112, `step${i}`, 2)} fill={i % 2 ? C.stone : T.stoneLight} stroke={C.ink} strokeWidth={3} />)}
        <rect x={-600} y={1500} width={2280} height={900} fill={T.stoneFloor} stroke={C.ink} strokeWidth={3} />
      </g>}
    </g>
  );
};

/** Paris street (MUST 1,2): three-storey paper façades with balconies, a lamp-post (lampX), bakery awning, cobbles,
 *  far plane of rooftops. Floor y 1500. width: street length (from −400). morning=true warm light. */
export const ParisStreet: React.FC<SetProps & { width?: number; lampX?: number; morning?: boolean }> = ({ fr, only, width = 2400, lampX = 860, morning = true }) => {
  const nb = Math.ceil(width / 420);
  const col = [C.paper, C.card, C.paperShade, T.facade4];
  return (
    <g>
      {has(only, 'backdrop') && <rect x={-1000} y={-500} width={width + 2000} height={3000} fill={morning ? T.morningSky : C.duskBlue} />}
      {has(only, 'far') && <g>{[...Array(Math.ceil((width + 1200) / 180))].map((_, i) => { const hh = 120 + rnd(`pr${i}`) * 160; return <g key={i}><path d={cut([[-700 + i * 180, 900], [-700 + i * 180, 900 - hh], [-610 + i * 180, 860 - hh], [-520 + i * 180, 900 - hh], [-520 + i * 180, 900]], `prf${i}`, 3)} fill={C.duskBlue} opacity={0.6} stroke={C.ink} strokeWidth={2} />
        <rect x={-640 + i * 180} y={840 - hh - 40} width={22} height={50} fill={C.duskBlue} stroke={C.ink} strokeWidth={2} opacity={0.6} /></g>; })}</g>}
      {has(only, 'mid') && <g>
        {[...Array(nb)].map((_, b) => { const bx = -400 + b * 420; return <g key={b} filter="url(#ss-shadow)">
          <path d={wrect(bx, 560, 400, 940, `bld${b}`, 2)} fill={col[b % 4]} stroke={C.ink} strokeWidth={3} />
          <path d={cut([[bx - 10, 560], [bx + 410, 560], [bx + 380, 480], [bx + 20, 480]], `mans${b}`, 2)} fill={C.stone} stroke={C.ink} strokeWidth={3} />
          {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <g key={`${r}${c}`}>
            <rect x={bx + 40 + c * 120} y={620 + r * 230} width={80} height={140} fill={r === 1 && (b + c) % 3 === 0 ? T.windowLit : C.duskBlue} stroke={C.ink} strokeWidth={2.5} />
            {r < 2 && <path d={`M${bx + 30 + c * 120},${770 + r * 230} L${bx + 130 + c * 120},${770 + r * 230}`} stroke={C.ink} strokeWidth={5} />}
            {r < 2 && [0, 1, 2, 3].map((k) => <line key={k} x1={bx + 36 + c * 120 + k * 30} y1={770 + r * 230} x2={bx + 36 + c * 120 + k * 30} y2={746 + r * 230} stroke={C.ink} strokeWidth={2} />)}
          </g>))}
          {b % 3 === 1 && <g><path d={`M${bx + 20},${1290} L${bx + 380},${1290} L${bx + 400},${1350} L${bx},${1350}Z`} fill={C.card} stroke={C.ink} strokeWidth={3} />
            {[0, 1, 2, 3, 4, 5].map((s) => <path key={s} d={`M${bx + 20 + s * 60},1290 L${bx + 50 + s * 60},1290 L${bx + 60 + s * 66},1350 L${bx + 30 + s * 66},1350Z`} fill={C.sepia} opacity={0.7} />)}
            <text x={bx + 200} y={1395} textAnchor="middle" fontFamily={FONT.type} fontSize={30} fill={C.ink}>Boulangerie</text></g>}
          <rect x={bx + 150} y={1360} width={100} height={140} fill={C.sepia} stroke={C.ink} strokeWidth={2.5} />
        </g>; })}
      </g>}
      {has(only, 'actors') && <g>
        <rect x={-1000} y={1500} width={width + 2000} height={900} fill={C.stone} stroke={C.ink} strokeWidth={3} />
        {[...Array(Math.ceil((width + 2000) / 60))].map((_, i) => [0, 1, 2, 3, 4].map((r) => <ellipse key={`${i}-${r}`} cx={-1000 + i * 60 + (r % 2) * 30} cy={1530 + r * 50} rx={24} ry={12} fill="none" stroke={C.ink} strokeWidth={1.5} opacity={0.35} />))}
        <g transform={`translate(${lampX} 1500)`} filter="url(#ss-cut)">
          <rect x={-9} y={-560} width={18} height={560} fill={C.ink} />
          <path d="M-40,-640 L40,-640 L28,-560 L-28,-560Z" fill={morning ? C.card : C.amberGlow} stroke={C.ink} strokeWidth={3} />
          <path d="M-20,-660 L20,-660 L0,-690Z" fill={C.ink} />
        </g>
      </g>}
    </g>
  );
};

/**
 * Paper map (MUST 1,2,3). view 'paris' (street grid + Seine, bird's eye) | 'europe' (France–Alps–Italy with Paris,
 * Florence, Rome, Milan). fold 0..1 folds the map closed (1 = folded strip). Map spans the frame (0..1080 × 300..1700).
 * route: list of city names to draw a dashed route through (progress 0..1). dot: amber dot position [x,y] (she is here).
 * MAP_CITIES gives the city points for aiming planes, dots, routes.
 */
export const MAP_CITIES: Record<string, [number, number]> = { Paris: [420, 620], Milan: [700, 1080], Florence: [790, 1290], Rome: [880, 1480] };
export const PaperMap: React.FC<SetProps & { view?: 'paris' | 'europe'; fold?: number; route?: string[]; routeP?: number; dot?: [number, number]; dotGlow?: number; labels?: string[] }> =
  ({ fr, only, view = 'europe', fold = 0, route, routeP = 1, dot, dotGlow = 1, labels }) => {
    const panels = 4;
    const show = labels ?? Object.keys(MAP_CITIES);
    return (
      <g>
        {has(only, 'backdrop') && <rect x={-600} y={-400} width={2280} height={2800} fill={C.sepia} />}
        {has(only, 'mid') && <g>
          {[...Array(panels)].map((_, i) => {
            const pw = 1080 / panels, px = i * pw;
            const k = 1 - fold * 0.92;
            const x0 = 540 + (px - 540) * k;
            return <g key={i} transform={`translate(${x0} 0) scale(${k} 1)`} filter={i === 0 ? 'url(#ss-shadow)' : undefined}>
              <rect x={0} y={300} width={pw} height={1400} fill={i % 2 ? C.paper : C.paperShade} stroke={C.ink} strokeWidth={2.5} />
              <rect x={0} y={300} width={pw} height={1400} fill={C.ink} opacity={i % 2 ? 0.03 * fold * 10 : 0} />
            </g>;
          })}
          {fold < 0.3 && <g opacity={1 - fold / 0.3}>
            {view === 'paris' ? <g>
              {[...Array(14)].map((_, i) => <line key={`h${i}`} x1={20} y1={360 + i * 95 + Math.sin(i) * 20} x2={1060} y2={340 + i * 95 - Math.cos(i) * 20} stroke={C.ink} strokeWidth={3} opacity={0.55} />)}
              {[...Array(10)].map((_, i) => <line key={`v${i}`} x1={60 + i * 110} y1={310} x2={40 + i * 112 + Math.sin(i * 2) * 40} y2={1690} stroke={C.ink} strokeWidth={3} opacity={0.55} />)}
              <path d="M0,1100 C200,980 420,1180 600,1020 S900,900 1080,980" stroke={C.duskBlue} strokeWidth={40} fill="none" />
              <path d={wrect(380, 900, 330, 70, 'mapLouvre', 2)} fill={C.stone} stroke={C.ink} strokeWidth={2.5} />
              <text x={545} y={950} textAnchor="middle" fontFamily={FONT.type} fontSize={30} fill={C.ink}>Louvre</text>
              <text x={540} y={420} textAnchor="middle" fontFamily={FONT.type} fontSize={54} fill={C.ink}>Paris</text>
            </g> : <g>
              {/* France–Alps–Italy, simplified */}
              <path d="M120,380 L560,330 L700,520 L640,820 L560,980 L300,1040 L160,880 L90,620Z" fill={C.card} stroke={C.ink} strokeWidth={3} opacity={0.9} />
              <path d="M640,860 L780,880 L860,1040 L820,1180 L900,1360 L1000,1560 L960,1620 L860,1520 L760,1340 L700,1180 L640,1040Z" fill={C.card} stroke={C.ink} strokeWidth={3} opacity={0.9} />
              {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${600 + i * 40},${900 + (i % 2) * 20} l26,-50 l26,50Z`} fill={C.stone} stroke={C.ink} strokeWidth={2} />)}
              <text x={640} y={840} fontFamily={FONT.type} fontSize={26} fill={C.ink} opacity={0.7}>Alps</text>
              <text x={330} y={760} fontFamily={FONT.type} fontSize={40} fill={C.ink} opacity={0.5}>France</text>
              <text x={850} y={1220} fontFamily={FONT.type} fontSize={40} fill={C.ink} opacity={0.5}>Italy</text>
              {show.map((c) => { const [cx, cy] = MAP_CITIES[c]; return <g key={c}><circle cx={cx} cy={cy} r={9} fill={C.ink} /><text x={cx + (c === 'Paris' ? -18 : 18)} y={cy - 14} textAnchor={c === 'Paris' ? 'end' : 'start'} fontFamily={FONT.type} fontSize={36} fill={C.ink}>{c}</text></g>; })}
              {route && route.length > 1 && <path d={smooth(route.map((c) => MAP_CITIES[c]), false)} pathLength={1000} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={`${routeP * 1000} 1000`} />}
            </g>}
          </g>}
          {dot && <g><circle cx={dot[0]} cy={dot[1]} r={46} fill="url(#ss-amber-soft)" opacity={dotGlow} /><circle cx={dot[0]} cy={dot[1]} r={11} fill={C.amber} stroke={C.ink} strokeWidth={2.5} opacity={dotGlow} /></g>}
        </g>}
      </g>
    );
  };

/** Vincenzo's little room (MUST 1,2,3): iron bed, small table, chair, stove, window with curtain (curtain 0..1 drawn
 *  aside), coat hook, the white trunk corner spot (TRUNK_SPOT: draw <Trunk> there). night=true very dark (only the amber leak
 *  shows); windowView: node drawn in the window (seasons). stove 0..1 opens the stove door. */
export const TRUNK_SPOT: [number, number] = [860, 1500];
export const LittleRoom: React.FC<SetProps & { night?: boolean; curtain?: number; stove?: number; windowView?: React.ReactNode; bedSheet?: number }> =
  ({ fr, only, night = false, curtain = 0, stove = 0, windowView, bedSheet = 0 }) => (
    <g>
      {has(only, 'backdrop') && <rect x={-600} y={-400} width={2280} height={2800} fill={night ? C.nightBlue : C.paperShade} />}
      {has(only, 'mid') && <g>
        <path d={wrect(-200, 300, 1480, 1210, 'roomwall', 2)} fill={night ? T.nightWall : C.paper} stroke={C.ink} strokeWidth={3} />
        {[...Array(12)].map((_, i) => <line key={i} x1={-200 + i * 130} y1={300} x2={-200 + i * 130} y2={1500} stroke={night ? C.ink : C.paperShade} strokeWidth={10} opacity={0.4} />)}
        {/* window */}
        <g transform="translate(420 520)">
          <rect x={0} y={0} width={280} height={340} fill={night ? C.nightBlue : T.daySky} stroke={C.ink} strokeWidth={3} />
          {windowView && <g><clipPath id="lr-win"><rect x={0} y={0} width={280} height={340} /></clipPath><g clipPath="url(#lr-win)">{windowView}</g></g>}
          <path d="M140,0 L140,340 M0,170 L280,170" stroke={C.sepia} strokeWidth={10} />
          <rect x={-10} y={-10} width={300} height={360} fill="none" stroke={C.sepia} strokeWidth={14} />
          <path d={`M-30,-30 L${60 - curtain * 70},-30 Q${40 - curtain * 70 + Math.sin(fr * 0.05) * 6},180 ${70 - curtain * 70},370 L-30,370Z`} fill={C.duskBlue} stroke={C.ink} strokeWidth={2.5} opacity={0.95} />
          <path d={`M310,-30 L${220 + curtain * 70},-30 Q${240 + curtain * 70 + Math.sin(fr * 0.05 + 1) * 6},180 ${210 + curtain * 70},370 L310,370Z`} fill={C.duskBlue} stroke={C.ink} strokeWidth={2.5} opacity={0.95} />
          <rect x={-40} y={-40} width={360} height={14} fill={C.ink} />
        </g>
        {/* coat hook */}
        <g transform="translate(140 640)"><rect x={-20} y={-8} width={40} height={14} fill={C.sepia} stroke={C.ink} strokeWidth={2} /><path d="M0,0 L0,24 Q0,34 10,30" stroke={C.ink} strokeWidth={4} fill="none" /></g>
        {/* stove */}
        <g transform="translate(-60 1500)" filter="url(#ss-cut)">
          <rect x={-10} y={-1150} width={40} height={900} fill={C.ink} />
          <path d={wrect(-80, -260, 180, 260, 'stove', 2)} fill={C.ink} stroke={C.ink} strokeWidth={3} />
          <g transform={`translate(-50 -180) scale(${1 - stove * 0.9} 1)`}><rect x={0} y={0} width={120} height={90} fill={C.suit} stroke={C.stone} strokeWidth={3} /></g>
          <rect x={-40} y={-170} width={100} height={70} fill={T.fire} opacity={night ? 0.1 : 0.5} />
        </g>
      </g>}
      {has(only, 'actors') && <g>
        <rect x={-600} y={1500} width={2280} height={900} fill={night ? T.nightFloor : T.floorboards} stroke={C.ink} strokeWidth={3} />
        {[...Array(12)].map((_, i) => <line key={i} x1={-600 + i * 200} y1={1500} x2={-800 + i * 240} y2={2400} stroke={C.ink} strokeWidth={2} opacity={0.3} />)}
        {/* iron bed */}
        <g transform="translate(60 1500)" filter="url(#ss-cut)">
          <path d="M-20,-300 L-20,0 M420,-200 L420,0" stroke={C.ink} strokeWidth={10} />
          <path d="M-20,-300 Q40,-340 60,-290 M-20,-240 L60,-240" stroke={C.ink} strokeWidth={6} fill="none" />
          <rect x={-20} y={-150} width={440} height={50} fill={night ? C.duskBlue : C.card} stroke={C.ink} strokeWidth={3} />
          <path d={`M60,${-150} L${430 + bedSheet * 60},${-150} L${440 + bedSheet * 80},${-40 + bedSheet * 40} L50,-60Z`} fill={night ? C.duskBlue : C.smock} stroke={C.ink} strokeWidth={2.5} />
          <ellipse cx={20} cy={-170} rx={50} ry={22} fill={night ? C.duskBlue : C.card} stroke={C.ink} strokeWidth={2.5} />
        </g>
        {/* table + chair */}
        <g transform="translate(600 1500)" filter="url(#ss-cut)">
          <rect x={-90} y={-230} width={180} height={20} fill={C.sepia} stroke={C.ink} strokeWidth={3} />
          <path d="M-75,-210 L-75,0 M75,-210 L75,0" stroke={C.sepia} strokeWidth={14} />
          <path d="M-75,-210 L-75,0 M75,-210 L75,0" stroke={C.ink} strokeWidth={2} />
          <g transform="translate(150 0)"><path d="M0,-320 L0,0 M70,-150 L70,0 M0,-150 L80,-150" stroke={C.sepia} strokeWidth={12} fill="none" /></g>
          <g transform="translate(0 -230)"><rect x={-20} y={-40} width={22} height={40} fill={C.card} stroke={C.ink} strokeWidth={2} /><path d="M-9,-40 Q-12,-52 -6,-58" stroke={T.fire} strokeWidth={4} opacity={night ? 0 : 0.0} fill="none" /></g>
        </g>
      </g>}
    </g>
  );

/** Geri's desk, Florence (MUST 2,3): dealer's shop: paintings stacked against the wall, desk (top at y 1250) with lamp,
 *  letter opener, inkwell; window with a paper Duomo dome. lampOn 0..1. Floor y 1500. DESK_TOP = [x0,x1,y]. */
export const DESK_TOP = [260, 980, 1250] as const;
export const GeriDesk: React.FC<SetProps & { lampOn?: number }> = ({ fr, only, lampOn = 1 }) => (
  <g>
    {has(only, 'backdrop') && <rect x={-600} y={-400} width={2280} height={2800} fill={C.paperShade} />}
    {has(only, 'far') && <g transform="translate(560 420)">
      <rect x={-60} y={-60} width={440} height={520} fill={T.florenceSky} />
      <path d="M40,330 C40,160 260,160 260,330Z" fill={T.terracotta} stroke={C.ink} strokeWidth={3} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${80 + i * 45},${330} Q${110 + i * 25},${200} 150,${190}`} stroke={C.ink} strokeWidth={2} fill="none" opacity={0.6} />)}
      <rect x={135} y={150} width={30} height={45} fill={C.card} stroke={C.ink} strokeWidth={2.5} /><circle cx={150} cy={142} r={8} fill={C.oldGold} stroke={C.ink} strokeWidth={2} />
      <rect x={0} y={330} width={320} height={130} fill={C.card} stroke={C.ink} strokeWidth={3} />
      <rect x={280} y={120} width={40} height={340} fill={C.card} stroke={C.ink} strokeWidth={3} />
    </g>}
    {has(only, 'mid') && <g>
      <path d={`M-200,300 L1280,300 L1280,1500 L-200,1500Z M500,330 L1000,330 L1000,920 L500,920Z`} fillRule="evenodd" fill={C.paper} stroke={C.ink} strokeWidth={3} />
      <rect x={500} y={330} width={500} height={590} fill="none" stroke={C.sepia} strokeWidth={18} />
      <path d="M750,330 L750,920 M500,625 L1000,625" stroke={C.sepia} strokeWidth={10} />
      <text x={750} y={980} textAnchor="middle" fontFamily={FONT.type} fontSize={30} fill={C.ink}>Florence</text>
      {[[-40, 1100, 260, 320, 1], [60, 1150, 220, 260, 2], [140, 1190, 200, 220, 0]].map(([x, y, w, h, k], i) => <g key={i} transform={`rotate(${-6 + i * 3} ${x} ${y + h / 2})`}><PaperPainting x={x} y={y} w={w} h={h} kind={k} eyeX={Math.sin(fr * 0.02 + i) * 0.5} seed={`gd${i}`} /></g>)}
    </g>}
    {has(only, 'actors') && <g>
      <rect x={-600} y={1500} width={2280} height={900} fill={T.floorboards} stroke={C.ink} strokeWidth={3} />
      <g filter="url(#ss-cut)">
        <path d={wrect(DESK_TOP[0], DESK_TOP[2], DESK_TOP[1] - DESK_TOP[0], 40, 'desk', 1.5)} fill={C.sepia} stroke={C.ink} strokeWidth={3} />
        <path d={wrect(DESK_TOP[0] + 20, DESK_TOP[2] + 40, DESK_TOP[1] - DESK_TOP[0] - 40, 210, 'deskb', 1.5)} fill={T.darkWood} stroke={C.ink} strokeWidth={3} />
        {[0, 1].map((i) => <rect key={i} x={DESK_TOP[0] + 60 + i * 380} y={DESK_TOP[2] + 80} width={200} height={70} fill="none" stroke={C.ink} strokeWidth={2} />)}
      </g>
      {/* lamp */}
      <g transform={`translate(${DESK_TOP[1] - 110} ${DESK_TOP[2]})`}>
        <ellipse cx={-80} cy={0} rx={260} ry={120} fill="url(#ss-lamp)" opacity={lampOn} />
        <rect x={-6} y={-150} width={12} height={150} fill={C.oldGold} stroke={C.ink} strokeWidth={2} />
        <path d="M-60,-150 L60,-150 L35,-210 L-35,-210Z" fill={T.lampGreen} stroke={C.ink} strokeWidth={3} />
        <ellipse cx={0} cy={0} rx={40} ry={10} fill={C.oldGold} stroke={C.ink} strokeWidth={2} />
      </g>
      {/* inkwell + letter opener */}
      <g transform={`translate(${DESK_TOP[0] + 90} ${DESK_TOP[2]})`}><rect x={-26} y={-44} width={52} height={44} fill={C.ink} rx={6} /><path d="M10,-44 L44,-120" stroke={C.card} strokeWidth={4} /></g>
      <path d={`M${DESK_TOP[0] + 170},${DESK_TOP[2] - 6} L${DESK_TOP[0] + 300},${DESK_TOP[2] - 14}`} stroke={C.stone} strokeWidth={7} strokeLinecap="round" />
    </g>}
  </g>
);

/** Prison cell (MUST 2,3): stone walls, small high barred window with a sunbeam (drifts), bench. tally 0..7 chalk marks;
 *  postcard node pinned on the wall (P3). Bars are plain; P2's handwriting-bars are a part overlay. Floor y 1500. */
export const PrisonCell: React.FC<SetProps & { tally?: number; postcard?: React.ReactNode }> = ({ fr, only, tally = 0, postcard }) => (
  <g>
    {has(only, 'backdrop') && <rect x={-600} y={-400} width={2280} height={2800} fill={C.nightBlue} />}
    {has(only, 'mid') && <g>
      <path d={wrect(-300, 200, 1680, 1310, 'cellwall', 2)} fill={C.stone} stroke={C.ink} strokeWidth={3} />
      {[...Array(10)].map((_, r) => [...Array(8)].map((_, c) => <rect key={`${r}${c}`} x={-300 + c * 220 + (r % 2) * 110} y={200 + r * 130} width={210} height={120} fill="none" stroke={C.ink} strokeWidth={1.5} opacity={0.3} />))}
      <g transform="translate(600 420)">
        <rect x={0} y={0} width={220} height={170} fill={T.daylight} stroke={C.ink} strokeWidth={4} />
        {[1, 2, 3, 4].map((i) => <rect key={i} x={i * 44 - 5} y={0} width={10} height={170} fill={C.ink} />)}
      </g>
      <path d={`M600,590 L820,590 L${560 + Math.sin(fr * 0.01) * 40},1500 L${200 + Math.sin(fr * 0.01) * 40},1500Z`} fill="url(#ss-beam)" opacity={0.9} />
      {[0, 1, 2, 3, 4].map((i) => { const t = ((fr * 0.5 + i * 29) % 140) / 140; return <circle key={i} cx={500 + i * 40 + Math.sin(fr * 0.02 + i) * 20 - t * 200} cy={700 + t * 700} r={2.5} fill="#FFF8E6" opacity={0.7 * Math.sin(t * Math.PI)} />; })}
      <g transform="translate(140 900)">{[...Array(Math.floor(tally))].map((_, i) => <path key={i} d={i === 4 ? 'M-6,10 L150,60' : `M${i * 32},0 L${i * 32 + 4},80`} stroke={C.card} strokeWidth={6} strokeLinecap="round" />)}</g>
      {postcard && <g transform="translate(860 860) rotate(4)">{postcard}</g>}
    </g>}
    {has(only, 'actors') && <g>
      <rect x={-600} y={1500} width={2280} height={900} fill={T.cellFloor} stroke={C.ink} strokeWidth={3} />
      <g filter="url(#ss-cut)"><rect x={-60} y={1290} width={520} height={34} fill={C.sepia} stroke={C.ink} strokeWidth={3} /><rect x={-30} y={1324} width={24} height={176} fill={C.sepia} stroke={C.ink} strokeWidth={2} /><rect x={410} y={1324} width={24} height={176} fill={C.sepia} stroke={C.ink} strokeWidth={2} /></g>
    </g>}
  </g>
);

/** Modern Louvre (MUST 1,3): today's Mona Lisa wall: wide wall, rope barrier, her behind glass (true-scale ×1.4 here),
 *  crowd plane of <Crowd era="today"> with phones and white flashes (flashAt). Identical layout in P1 1.1 and P3 3.16.
 *  flow px/frame moves the crowd sideways (P3: "flows past like a river"). stamp: node over the glass (P1 red "?" stamp). */
export const MODERN_HER = { x: 540, y: 900, h: 380 };
export const ModernLouvre: React.FC<SetProps & { flashAt?: number; flow?: number; herGlow?: number; glintAt?: number | number[] }> = ({ fr, only, flashAt = 0, flow = 0, herGlow = 0.5, glintAt }) => (
  <g>
    {has(only, 'backdrop') && <rect x={-600} y={-400} width={2280} height={2800} fill={T.modernBack} />}
    {has(only, 'mid') && <g>
      <path d={wrect(-400, 250, 1880, 1250, 'mwall', 2)} fill={T.modernWall} stroke={C.ink} strokeWidth={3} />
      <rect x={180} y={560} width={720} height={720} fill={T.modernPanel} stroke={C.ink} strokeWidth={2} />
      <MonaLisa fr={fr} x={MODERN_HER.x} y={MODERN_HER.y} height={MODERN_HER.h} glow={herGlow} glass glintAt={glintAt} />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-200 + i * 400},1180 L${-200 + i * 400},1420`} stroke={C.oldGold} strokeWidth={10} />)}
      <path d={`M-200,1200 Q0,1250 200,1200 Q400,1250 600,1200 Q800,1250 1000,1200 Q1200,1250 1400,1200`} stroke={C.silk} strokeWidth={10} fill="none" />
    </g>}
    {has(only, 'actors') && <g>
      <rect x={-600} y={1420} width={2280} height={900} fill={T.modernFloor} />
      <Crowd fr={fr} x={-200} w={1480} y={1780} rows={3} perRow={9} era="today" phones flashAt={flashAt} seed={21} flow={flow} />
    </g>}
  </g>
);
