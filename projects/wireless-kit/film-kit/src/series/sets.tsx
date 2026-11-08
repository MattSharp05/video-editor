import React from 'react';
import { C, FONT } from './tokens';
import { FogBand, Halftone, Ink, Print } from './look';
import { clamp, ease, ellipse, osc, pop, prog, rnd, rrect, stepped } from './util';
import { Spark } from './spark';
import { WirelessKey, TickerTape, WallCalendar, PoliceLamp } from './props';
import { Moustache } from './devices';

type SkyKind = 'night' | 'day' | 'dawn' | 'snow';
/** <Sky kind y0? h?> — sky gradient rect (night: ink→deep; day: mist→fog; dawn: mist→fog→lamp). */
export const Sky: React.FC<{ kind: SkyKind; y0?: number; h?: number; x0?: number; w?: number }> = ({ kind, y0 = -400, h = 2800, x0 = -600, w = 2280 }) => (
  <rect x={x0} y={y0} width={w} height={h} fill={`url(#${kind === 'night' || kind === 'snow' ? 'wn-night' : kind === 'dawn' ? 'wn-dawn' : 'wn-day'})`} />
);
/** <Snow fr area? count? seed?> — falling snow field (one mover). */
export const Snow: React.FC<{ fr: number; area?: [number, number, number, number]; count?: number; seed?: number }> = ({ fr, area = [-100, -100, 1280, 2100], count = 90, seed = 3 }) => (
  <g fill={C.newsprint}>{Array.from({ length: count }, (_, i) => {
    const r = (k: string) => rnd(`sn${seed}${i}${k}`); const sp = 1.2 + r('s') * 2.2;
    const y = area[1] + ((r('y') * area[3] + fr * sp) % area[3]); const x = area[0] + r('x') * area[2] + Math.sin(fr / 30 + i) * 14;
    return <circle key={i} cx={x} cy={y} r={2.5 + r('r') * 4} opacity={0.6 + r('o') * 0.4} />;
  })}</g>
);
const win = (x: number, y: number, w: number, h: number, lit: boolean, key?: string | number, fr = 0) => (
  <g key={key}>
    {lit && <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 1.1} ry={h * 0.9} fill="url(#wn-lamp)" opacity={0.6 + 0.05 * osc(fr, 23)} />}
    <Ink d={rrect(x, y, w, h, 3)} fill={lit ? C.lamp : C.deep} sw={4} />
    <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h * 0.45} H${x + w}`} stroke={C.ink} strokeWidth={4} />
    <Ink d={rrect(x - 10, y + h, w + 20, 14, 2)} fill={C.newsprint} sw={3} />
  </g>
);

/**
 * <Hilldrop fr variant?='night'|'snow'|'day' door?=0..1 calendar? sky?=true> — 39 Hilldrop Crescent, outside: semi-
 * detached Victorian front (x 120–960, ground y 1500), bay window, six steps up to the door with "39" in the fanlight,
 * railings, gas lamp, street sign "Hilldrop Crescent". Windows glow lamp at night/snow. door opens 0..1 (dark hall).
 * Step tops (for feet): STEP_TOP. Top step centre = HILLDROP.topStep.
 */
export const HILLDROP = { topStep: [770, 1330] as [number, number], doorX: 770, steps: Array.from({ length: 6 }, (_, i) => [770, 1500 - i * 28] as [number, number]), window: [300, 1040] as [number, number] };
export const Hilldrop: React.FC<{ fr: number; variant?: 'night' | 'snow' | 'day'; door?: number; sky?: boolean; fog?: boolean }> = ({ fr, variant = 'night', door = 0, sky = true, fog = true }) => {
  const night = variant !== 'day'; const lit = night;
  const brick = C.slate;
  return (
    <g>
      {sky && <Sky kind={variant} />}
      {night && <g>{[[120, 220], [860, 300], [520, 160], [300, 420], [980, 520]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.5} fill={C.newsprint} opacity={0.5 + 0.5 * Math.abs(osc(fr, 50 + i * 9))} />)}</g>}
      {/* neighbour (the other half) */}
      <Print far><Ink d="M-120 1500 L-120 640 L120 520 L120 1500Z" fill={C.mist} shade="R" sw={4} /></Print>
      <Print>
        {/* roof + chimney */}
        <Ink d="M100 640 L540 360 L980 640Z" fill={C.deep} shade="R" />
        <Ink d={rrect(760, 380, 90, 170, 2)} fill={brick} shade="R" />
        {[0, 1].map((i) => <Ink key={i} d={rrect(768 + i * 40, 360, 30, 30, 3)} fill={C.deep} sw={3} />)}
        {/* facade */}
        <Ink d="M120 640 L960 640 L960 1500 L120 1500Z" fill={brick} shade="R" />
        {Array.from({ length: 22 }, (_, i) => <line key={i} x1={124} y1={660 + i * 38} x2={956} y2={660 + i * 38} stroke={C.deep} strokeWidth={2} opacity={0.35} />)}
        {/* upstairs windows */}
        {win(220, 700, 150, 210, lit, 'u1', fr)}{win(470, 700, 150, 210, lit && variant !== 'snow' ? true : lit, 'u2', fr)}{win(710, 700, 150, 210, false, 'u3', fr)}
        {/* bay window */}
        <Ink d="M170 1000 L430 1000 L460 1040 L460 1360 L140 1360 L140 1040Z" fill={C.newsprint} shade="R" />
        {win(170, 1060, 80, 230, lit, 'b1', fr)}{win(260, 1050, 80, 240, lit, 'b2', fr)}{win(350, 1060, 80, 230, lit, 'b3', fr)}
        <Ink d="M130 1000 L470 1000 L450 970 L150 970Z" fill={C.deep} />
        {/* door */}
        <Ink d={rrect(690, 980, 160, 350, 4)} fill={C.newsprint} sw={5} />
        <Ink d="M690 980 A80 70 0 0 1 850 980Z" fill={lit ? C.lamp : C.fog} sw={4} />
        <text x={770} y={968} textAnchor="middle" fontFamily={FONT.display} fontSize={44} fill={C.ink}>39</text>
        <rect x={706} y={1000} width={128} height={322} fill={C.ink} opacity={door > 0 ? 0.9 : 0} />
        {door > 0 && <ellipse cx={770} cy={1180} rx={70} ry={120} fill="url(#wn-lamp)" opacity={0.5 * door} />}
        <g transform={`translate(706 1000) scale(${1 - ease(clamp(door)) * 0.85} 1)`}>
          <Ink d={rrect(0, 0, 128, 322, 2)} fill={C.deep} shade="R" sw={4} />
          <Ink d={rrect(16, 20, 96, 120, 2)} fill={C.slate} sw={3} /><Ink d={rrect(16, 170, 96, 130, 2)} fill={C.slate} sw={3} />
          <circle cx={104} cy={160} r={7} fill={C.lamp} stroke={C.ink} strokeWidth={2} />
        </g>
        {/* steps */}
        {Array.from({ length: 6 }, (_, i) => <Ink key={i} d={rrect(650 - i * 0 - (5 - i) * 14, 1330 + i * 28, 240 + (5 - i) * 28, 30, 2)} fill={variant === 'snow' ? C.newsprint : C.fog} shade="B" sw={4} />)}
        {/* railings */}
        <path d={`M560 1500 L640 1330 M980 1500 L900 1330`} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${20 + i * 40} 1500 V1400`} stroke={C.ink} strokeWidth={5} />)}
        <path d="M10 1404 H520" stroke={C.ink} strokeWidth={6} />
        {/* street sign */}
        <Ink d={rrect(160, 1420, 300, 60, 4)} fill={C.newsprint} sw={4} />
        <text x={310} y={1460} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={30} fill={C.ink}>Hilldrop Crescent</text>
      </Print>
      {/* gas lamp */}
      <Print>
        <path d="M60 1500 V1060" stroke={C.ink} strokeWidth={14} />
        {night && <circle cx={60} cy={1030} r={130} fill="url(#wn-lamp)" opacity={0.75 + 0.1 * osc(stepped(fr, 2), 11)} />}
        <Ink d="M30 990 L90 990 L80 1060 L40 1060Z" fill={night ? C.lamp : C.fog} sw={4} />
        <Ink d="M24 990 L60 960 L96 990Z" fill={C.deep} sw={4} />
      </Print>
      {/* pavement */}
      <rect x={-600} y={1500} width={2280} height={800} fill={variant === 'snow' ? C.fog : C.deep} />
      <path d="M-600 1500 H1680" stroke={C.ink} strokeWidth={5} />
      {variant === 'snow' && <g><path d="M100 642 L540 362 L980 642 L960 652 L540 380 L120 652Z" fill={C.newsprint} /><Snow fr={fr} /></g>}
      {fog && <><FogBand fr={fr} y={1450} speed={0.5} op={night ? 0.35 : 0.6} seed={2} /><FogBand fr={fr} y={600} speed={0.9} op={night ? 0.25 : 0.5} seed={5} /></>}
    </g>
  );
};

/**
 * <HilldropSection fr clock?=true lampBeam?> — the dolls'-house cut-away of 39 (x 90–990, y 180–1820): upstairs parlour
 * (card table, mantel clock with moving hands), stairs, hall (hat pegs + chair), kitchen, cellar door "COAL" and steps,
 * coal cellar (plain brick floor, coal heap). ROOMS gives each room's floor point for placing figures.
 */
export const SECTION_ROOMS = { parlour: [540, 640] as [number, number], hall: [700, 1080] as [number, number], kitchen: [300, 1080] as [number, number], cellar: [540, 1700] as [number, number], cellarDoor: [860, 1080] as [number, number] };
export const HilldropSection: React.FC<{ fr: number; clockSpeed?: number; calendar?: React.ReactNode }> = ({ fr, clockSpeed = 1 }) => {
  const mins = fr * clockSpeed * 2; const ha = (mins / 720) * 360, ma = (mins / 60) * 360;
  return (
    <Print>
      <Ink d="M60 260 L540 40 L1020 260Z" fill={C.deep} shade="R" />
      <Ink d="M90 260 H990 V1820 H90Z" fill={C.slate} shade="R" sw={8} />
      {/* rooms */}
      <Ink d="M110 280 H970 V640 H110Z" fill={C.fog} sw={4} />
      <Ink d="M110 680 H560 V1080 H110Z" fill={C.newsprint} sw={4} />
      <Ink d="M600 680 H970 V1080 H600Z" fill={C.fog} sw={4} />
      <Ink d="M110 1360 H970 V1700 H110Z" fill={C.mist} shade="full" sw={4} />
      <rect x={110} y={1120} width={860} height={220} fill={C.deep} opacity={0.4} />
      {/* parlour: card table + mantel clock */}
      <Ink d="M380 560 H700 L680 580 H400Z" fill={C.slate} sw={4} /><path d="M420 580 V640 M660 580 V640" stroke={C.ink} strokeWidth={6} />
      <Ink d="M760 460 H940 V480 H760Z" fill={C.deep} sw={4} /><Ink d="M780 480 H920 V640 H780Z" fill={C.slate} shade="R" sw={4} />
      <g transform="translate(850 418)"><Ink d={ellipse(0, 0, 34, 34)} fill={C.newsprint} sw={4} /><path d={`M0 0 L${Math.sin(ha * Math.PI / 180) * 18} ${-Math.cos(ha * Math.PI / 180) * 18}`} stroke={C.ink} strokeWidth={4} /><path d={`M0 0 L${Math.sin(ma * Math.PI / 180) * 27} ${-Math.cos(ma * Math.PI / 180) * 27}`} stroke={C.ink} strokeWidth={3} /></g>
      {win(180, 330, 120, 170, true, 'pw', fr)}
      {/* stairs (parlour → hall), hall pegs + chair */}
      {Array.from({ length: 8 }, (_, i) => <Ink key={i} d={rrect(600 + i * 40, 1080 - (i + 1) * 50, 60, 50, 1)} fill={C.slate} sw={3} />)}
      <path d="M620 750 H760" stroke={C.ink} strokeWidth={6} />
      {[640, 690, 740].map((x, i) => <circle key={i} cx={x} cy={760} r={7} fill={C.lamp} stroke={C.ink} strokeWidth={2} />)}
      <Ink d="M880 960 H950 V1080 M880 960 V1080 M870 1000 H960" fill="none" sw={6} />
      {/* kitchen */}
      <Ink d="M140 960 H330 V1080 H140Z" fill={C.slate} shade="R" sw={4} /><Ink d={ellipse(240, 940, 40, 18)} fill={C.deep} sw={3} />
      <path d={`M240 920 q${osc(fr, 30) * 8} -30 0 -60`} stroke={C.newsprint} strokeWidth={5} fill="none" opacity={0.7} />
      {/* COAL door + cellar steps */}
      <Ink d={rrect(400, 900, 120, 180, 3)} fill={C.deep} sw={4} />
      <text x={460} y={960} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={30} fill={C.newsprint}>COAL</text>
      {Array.from({ length: 6 }, (_, i) => <Ink key={i} d={rrect(420 - i * 40, 1120 + i * 42, 90, 42, 1)} fill={C.slate} sw={3} />)}
      {/* cellar: brick floor + coal heap */}
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 12 }, (_, i) => <rect key={`${r}-${i}`} x={112 + i * 72 + (r % 2) * 36} y={1600 + r * 25} width={70} height={23} fill={C.slate} stroke={C.ink} strokeWidth={2} />))}
      <Ink d="M700 1600 Q760 1440 840 1450 Q920 1470 960 1600Z" fill={C.deep} shade="full" sw={4} />
      {[0, 1, 2].map((i) => <circle key={i} cx={760 + i * 60 + osc(fr, 40, i * 0.3) * 6} cy={1430 - ((fr * 0.5 + i * 30) % 90)} r={4} fill={C.mist} opacity={0.6} />)}
      <Ink d="M90 1820 H990" sw={8} />
    </Print>
  );
};

/**
 * <CellarFloor fr lamps?=3 wobbleAt? lit?=1> — the closed brick cellar floor only (frame-filling, viewed from above at
 * an angle), three lamp beams on it, nothing under it, ever. One brick (at CELLAR_BRICK) wobbles from wobbleAt.
 */
export const CELLAR_BRICK: [number, number] = [560, 1240];
export const CellarFloor: React.FC<{ fr: number; lamps?: number; wobbleAt?: number; lit?: number }> = ({ fr, lamps = 3, wobbleAt, lit = 1 }) => {
  const rows = 16; const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const y0 = 700 + r * 62; const w = 120 + r * 6; const n = Math.ceil(1500 / w) + 1;
    for (let i = 0; i < n; i++) {
      const x0 = -200 + i * w + (r % 2) * (w / 2);
      const isB = Math.abs(x0 + w / 2 - CELLAR_BRICK[0]) < w / 2 && Math.abs(y0 + 30 - CELLAR_BRICK[1]) < 31;
      const wob = isB && wobbleAt != null && fr >= wobbleAt ? Math.sin((fr - wobbleAt) * 0.9) * 4 * Math.exp(-(fr - wobbleAt) / 40) : 0;
      out.push(<rect key={`${r}-${i}`} x={x0 + 2} y={y0 + 2} width={w - 4} height={58} rx={3} fill={isB ? C.mist : C.slate} stroke={C.ink} strokeWidth={3} transform={wob ? `rotate(${wob} ${x0 + w / 2} ${y0 + 30})` : undefined} />);
    }
  }
  const beams: [number, number][] = [[260, 1200], [560, 1260], [840, 1180]].slice(0, lamps) as [number, number][];
  return (
    <g>
      <rect x={-400} y={-400} width={1900} height={1110} fill={C.deep} />
      {Array.from({ length: 8 }, (_, r) => Array.from({ length: 12 }, (_, i) => <rect key={`w${r}-${i}`} x={-200 + i * 120 + (r % 2) * 60} y={150 + r * 68} width={116} height={64} fill={C.deep} stroke={C.ink} strokeWidth={2.5} />))}
      {out}
      <rect x={-400} y={700} width={1900} height={1300} fill="url(#wn-htf)" opacity={0.6} />
      {beams.map(([x, y], i) => <ellipse key={i} cx={x + osc(fr, 60 + i * 13, i * 0.3) * 30} cy={y} rx={210} ry={120} fill="url(#wn-lamp)" opacity={(0.75 + 0.05 * osc(fr, 9, i)) * lit} />)}
    </g>
  );
};

/**
 * <ScotlandYard fr view?='outside'|'inside' shutter?=0..1 lampsOn?=true> — outside: a solid building, "NEW SCOTLAND YARD"
 * over the door, two door lamps, one shutter window that opens (like a waking eye). inside: Dew's desk with a
 * lamp-shaded lamp, in-tray, hat stand. DESK_TOP is where papers/telegrams land.
 */
export const YARD = { deskTop: [560, 1250] as [number, number], window: [540, 760] as [number, number], doorLamps: [[400, 1080], [680, 1080]] as [number, number][] };
export const ScotlandYard: React.FC<{ fr: number; view?: 'outside' | 'inside'; shutter?: number }> = ({ fr, view = 'outside', shutter = 0 }) => {
  if (view === 'inside') return (
    <g>
      <rect x={-400} y={-400} width={1900} height={1900} fill={C.slate} />
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-400} y1={i * 160} x2={1500} y2={i * 160} stroke={C.deep} strokeWidth={3} opacity={0.4} />)}
      {win(120, 420, 260, 360, false, 'w', fr)}
      <rect x={-400} y={1500} width={1900} height={800} fill={C.deep} />
      <Print>
        <Ink d="M200 1250 H960 V1290 H200Z" fill={C.deep} shade="B" />
        <Ink d="M230 1290 H420 V1500 H230Z" fill={C.slate} shade="R" /><Ink d="M760 1290 H930 V1500 H760Z" fill={C.slate} shade="R" />
        <Ink d="M300 1210 H460 V1250 H300Z" fill={C.mist} sw={4} />{[0, 1, 2].map((i) => <Ink key={i} d={rrect(310, 1190 - i * 10, 140, 14, 2)} fill={C.newsprint} sw={2.5} />)}
        <path d="M820 1250 V1080" stroke={C.ink} strokeWidth={8} />
        <circle cx={830} cy={1060} r={150} fill="url(#wn-lamp)" opacity={0.8} />
        <Ink d="M760 1080 L900 1080 L860 1010 L800 1010Z" fill={C.lamp} sw={4} />
        <path d="M100 1500 V900 M50 900 H150 M60 940 L140 940" stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      </Print>
    </g>
  );
  const s = ease(clamp(shutter));
  return (
    <g>
      <Sky kind="night" />
      <Print>
        <Ink d="M80 400 H1000 V1500 H80Z" fill={C.slate} shade="R" />
        <Ink d="M60 400 L540 260 L1020 400Z" fill={C.deep} />
        {Array.from({ length: 18 }, (_, i) => <line key={i} x1={84} y1={430 + i * 60} x2={996} y2={430 + i * 60} stroke={C.deep} strokeWidth={2} opacity={0.3} />)}
        {[160, 820].map((x, i) => <React.Fragment key={i}>{win(x, 560, 120, 200, true, `a${i}`, fr)}</React.Fragment>)}
        {/* the shutter window (centre) */}
        <g>{win(460, 640, 160, 240, s > 0.2, 'sh', fr)}
          <Ink d={rrect(460, 640, 80 * (1 - s), 240, 2)} fill={C.deep} sw={4} /><Ink d={rrect(620 - 80 * (1 - s), 640, 80 * (1 - s), 240, 2)} fill={C.deep} sw={4} />
        </g>
        <Ink d={rrect(180, 940, 720, 90, 4)} fill={C.newsprint} sw={5} />
        <text x={540} y={1002} textAnchor="middle" fontFamily={FONT.display} fontSize={60} fill={C.ink}>NEW SCOTLAND YARD</text>
        <Ink d="M450 1080 H630 V1500 H450Z" fill={C.deep} shade="R" sw={5} />
        <Ink d="M450 1080 A90 70 0 0 1 630 1080Z" fill={C.lamp} sw={4} />
        {YARD.doorLamps.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={100} fill="url(#wn-lamp)" opacity={0.75 + 0.1 * osc(stepped(fr, 2), 13, i * 0.4)} /><Ink d={`M${x - 24} ${y - 40} L${x + 24} ${y - 40} L${x + 18} ${y + 30} L${x - 18} ${y + 30}Z`} fill={C.lamp} sw={4} /><Ink d={`M${x - 30} ${y - 40} L${x} ${y - 70} L${x + 30} ${y - 40}Z`} fill={C.deep} sw={4} /></g>)}
        <Ink d="M380 1500 H700 V1520 H380Z" fill={C.fog} sw={4} />
      </Print>
      <rect x={-600} y={1500} width={2280} height={800} fill={C.deep} />
      <FogBand fr={fr} y={1440} speed={0.5} op={0.35} seed={3} /><FogBand fr={fr} y={500} speed={0.8} op={0.25} seed={7} />
    </g>
  );
};

/**
 * <Sea fr sky?='day'|'night'|'dawn' horizon?=900 skyOn?=true> — sky + 3 parallax wave layers (each its own drift) + foam
 * flecks. Waves drift on their own; put it on one plane or split with layer='back'|'mid'|'front'.
 */
export const Sea: React.FC<{ fr: number; sky?: 'day' | 'night' | 'dawn'; horizon?: number; skyOn?: boolean; layer?: 'all' | 'back' | 'mid' | 'front' }> = ({ fr, sky = 'day', horizon = 900, skyOn = true, layer = 'all' }) => {
  const night = sky === 'night';
  const band = (y: number, amp: number, len: number, speed: number, fill: string, k: string, dots: 'near' | 'far') => {
    const off = ((fr * speed) % len + len) % len; let d = `M${-600 - off} ${y}`;
    for (let x = -600 - off; x < 1800; x += len) d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
    d += ` V2400 H-600Z`;
    return <g key={k}><path d={d} fill={fill} stroke={C.ink} strokeWidth={4} /><path d={d} fill={`url(#${dots === 'far' ? 'wn-htf' : 'wn-ht'})`} opacity={0.6} /></g>;
  };
  const foam = Array.from({ length: 14 }, (_, i) => { const x = ((rnd(`fo${i}`) * 1600 + fr * (1 + rnd(`fs${i}`))) % 1600) - 260; const y = horizon + 220 + rnd(`fy${i}`) * 700; return <path key={i} d={`M${x} ${y} q12 -8 24 0`} stroke={C.newsprint} strokeWidth={4} fill="none" opacity={0.7} />; });
  return (
    <g>
      {skyOn && <Sky kind={sky} />}
      {skyOn && sky === 'dawn' && <g><circle cx={760} cy={horizon - 40} r={260} fill="url(#wn-lamp)" /><circle cx={760} cy={horizon - 30} r={70} fill={C.lamp} /></g>}
      {(layer === 'all' || layer === 'back') && band(horizon, 10, 160, 0.4, night ? C.deep : C.mist, 'b', 'far')}
      {(layer === 'all' || layer === 'mid') && band(horizon + 180, 22, 260, -0.9, night ? C.deep : C.slate, 'm', 'far')}
      {(layer === 'all' || layer === 'front') && <>{band(horizon + 480, 40, 380, 1.6, C.deep, 'f', 'near')}{foam}</>}
    </g>
  );
};

/**
 * <Montrose fr x? y? scale? smoke?=true lit?=false sparkMast?=false> — Canadian Pacific single-funnel liner, side view
 * facing right: slate hull, newsprint upperworks, buff (fog) funnel with deep top, two masts with the aerial wire,
 * "MONTROSE" on the bow, portholes (lit at night), smoke. Native 1000 wide, waterline at y (origin = mid-waterline).
 * MONTROSE_PTS: masthead points (for the Spark), bow name, porthole row.
 */
export const MONTROSE_PTS = { mastFore: [330, -520] as [number, number], mastAft: [-360, -500] as [number, number], porthole: [180, -60] as [number, number], funnelTop: [-20, -430] as [number, number] };
const ShipSmoke: React.FC<{ fr: number; x: number; y: number; k?: number }> = ({ fr, x, y, k = 1 }) => (
  <g>{Array.from({ length: 6 }, (_, i) => { const t = ((fr * 0.6 + i * 20) % 120) / 120; return <ellipse key={i} cx={x - t * 340 * k} cy={y - t * 120 * k} rx={(30 + t * 70) * k} ry={(22 + t * 40) * k} fill={C.mist} stroke={C.ink} strokeWidth={3} opacity={(1 - t) * 0.85} />; })}</g>
);
export const Montrose: React.FC<{ fr: number; x?: number; y?: number; scale?: number; smoke?: boolean; lit?: boolean; sparkMast?: boolean; facing?: 1 | -1 }> = ({ fr, x = 540, y = 1100, scale = 1, smoke = true, lit = false, sparkMast = false, facing = 1 }) => {
  const bob = osc(fr, 70) * 6, roll = osc(fr, 90) * 0.8;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${roll}) scale(${scale * facing} ${scale})`}>
      {smoke && <ShipSmoke fr={fr} x={-20} y={-440} />}
      <Print>
        <path d="M-360 -150 L-360 -500 M330 -150 L330 -520" stroke={C.ink} strokeWidth={8} />
        <path d="M-360 -490 L330 -510" stroke={C.ink} strokeWidth={2.5} />
        <Ink d="M-80 -270 L40 -270 L50 -430 L-70 -430Z" fill={C.fog} shade="R" />
        <Ink d="M-72 -430 L50 -430 L48 -390 L-70 -390Z" fill={C.deep} />
        <Ink d="M-300 -150 L300 -150 L290 -230 L-290 -230Z" fill={C.newsprint} shade="R" />
        <Ink d="M-200 -230 L160 -230 L150 -280 L-190 -280Z" fill={C.newsprint} shade="R" />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-270 + i * 62} y={-210} width={34} height={22} fill={lit ? C.lamp : C.mist} stroke={C.ink} strokeWidth={2.5} />)}
        <Ink d="M-480 -150 L470 -150 Q520 -150 500 -90 L440 40 L-450 40 L-500 -110Z" fill={C.slate} shade="RB" />
        <path d="M-470 -10 L460 -10" stroke={C.newsprint} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <g key={i}>{lit && <circle cx={-380 + i * 70} cy={-60} r={22} fill="url(#wn-lamp)" />}<circle cx={-380 + i * 70} cy={-60} r={11} fill={lit ? C.lamp : C.fog} stroke={C.ink} strokeWidth={3} /></g>)}
        <text x={350} y={-92} textAnchor="middle" fontFamily={FONT.display} fontSize={40} fill={C.newsprint} transform={facing < 0 ? 'translate(700 0) scale(-1 1)' : undefined}>MONTROSE</text>
      </Print>
      {sparkMast && <Spark fr={fr} x={330} y={-524} size={1.1} />}
    </g>
  );
};
/** <Laurentic fr x? y? scale? smoke?=true> — White Star single-funnel liner, sleeker/longer, buff funnel deep top, "LAURENTIC" on the stern, big wake. Same origin rule as Montrose. */
export const Laurentic: React.FC<{ fr: number; x?: number; y?: number; scale?: number; smoke?: boolean; facing?: 1 | -1 }> = ({ fr, x = 540, y = 1100, scale = 1, smoke = true, facing = 1 }) => {
  const bob = osc(fr, 64, 0.3) * 5;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${scale * facing} ${scale})`}>
      {Array.from({ length: 8 }, (_, i) => { const t = ((fr * 2 + i * 30) % 240) / 240; return <path key={`wk${i}`} d={`M${-560 - t * 400} ${30 + t * 30} q30 -14 60 0`} stroke={C.newsprint} strokeWidth={6} fill="none" opacity={1 - t} />; })}
      {smoke && <ShipSmoke fr={fr} x={40} y={-430} />}
      <Print>
        <path d="M-420 -140 L-420 -470 M400 -140 L400 -480" stroke={C.ink} strokeWidth={7} />
        <path d="M-420 -462 L400 -472" stroke={C.ink} strokeWidth={2.5} />
        <Ink d="M-10 -260 L100 -260 L114 -420 L4 -420Z" fill={C.fog} shade="R" />
        <Ink d="M4 -420 L114 -420 L111 -385 L1 -385Z" fill={C.deep} />
        <Ink d="M-380 -140 L380 -140 L370 -210 L-370 -210Z" fill={C.newsprint} shade="R" />
        <Ink d="M-240 -210 L240 -210 L230 -260 L-230 -260Z" fill={C.newsprint} shade="R" />
        <Ink d="M-560 -140 L560 -140 Q620 -140 600 -80 L540 36 L-520 36 Q-580 -40 -560 -140Z" fill={C.deep} shade="RB" />
        <path d="M-550 -100 L580 -100" stroke={C.lamp} strokeWidth={4} />
        <text x={-440} y={-50} textAnchor="middle" fontFamily={FONT.display} fontSize={36} fill={C.newsprint} transform={facing < 0 ? 'translate(-880 0) scale(-1 1)' : undefined}>LAURENTIC</text>
      </Print>
    </g>
  );
};

/**
 * <MontroseDeck fr sky?='day'|'dawn'|'night' sparkMast?> — on deck: rails, deck chairs, a lifeboat, the bridge with brass
 * plate "Capt. H. G. Kendall", the mast with the aerial (DECK.mastTop for the Spark), sea beyond. Deck floor y 1500.
 */
export const DECK = { mastTop: [900, 260] as [number, number], bridge: [760, 900] as [number, number], chairs: [[230, 1500], [480, 1500]] as [number, number][], rail: 1300 };
export const MontroseDeck: React.FC<{ fr: number; sky?: 'day' | 'dawn' | 'night'; sparkMast?: boolean }> = ({ fr, sky = 'day', sparkMast }) => (
  <g>
    <Sea fr={fr} sky={sky} horizon={1080} />
    <Print>
      <path d="M900 1500 V260" stroke={C.ink} strokeWidth={14} />
      <path d="M900 280 L-200 360" stroke={C.ink} strokeWidth={3} />
      <path d="M900 420 L760 700" stroke={C.ink} strokeWidth={4} />
      <Ink d="M600 760 H1080 V1180 H600Z" fill={C.newsprint} shade="R" />
      {[640, 760, 880].map((x, i) => <Ink key={i} d={rrect(x, 800, 90, 80, 3)} fill={sky === 'night' ? C.lamp : C.mist} sw={3} />)}
      <Ink d={rrect(660, 930, 300, 60, 4)} fill={C.lamp} shade="B" sw={4} />
      <text x={810} y={972} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={30} fill={C.ink}>Capt. H. G. Kendall</text>
      <Ink d="M-100 640 Q140 700 380 640 L360 720 Q140 760 -80 720Z" fill={C.newsprint} shade="RB" />
      <path d="M0 640 V560 M280 640 V560 M-20 560 H300" stroke={C.ink} strokeWidth={6} />
      <rect x={-600} y={1300} width={2280} height={1000} fill={C.mist} />
      {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-600 + i * 80} y1={1300} x2={-600 + i * 80 - 40} y2={2300} stroke={C.slate} strokeWidth={3} opacity={0.5} />)}
      <path d="M-600 1300 H1680" stroke={C.ink} strokeWidth={5} />
      <path d="M-600 1180 H1680 M-600 1240 H1680" stroke={C.ink} strokeWidth={7} />
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-600 + i * 80} 1180 V1300`} stroke={C.ink} strokeWidth={5} />)}
      {DECK.chairs.map(([x, y], i) => <g key={i}><Ink d={`M${x - 90} ${y} L${x - 40} ${y - 120} L${x + 80} ${y - 130} L${x + 100} ${y - 110} L${x - 20} ${y - 100} L${x + 60} ${y}`} fill="none" lc={C.ink} sw={8} /><Ink d={`M${x - 40} ${y - 120} L${x - 90} ${y - 300} L${x - 60} ${y - 310} L${x - 10} ${y - 124}Z`} fill={C.newsprint} shade="R" sw={4} /></g>)}
    </Print>
    {sparkMast && <Spark fr={fr} x={DECK.mastTop[0]} y={DECK.mastTop[1]} size={1.2} />}
    <FogBand fr={fr} y={1060} speed={0.6} op={0.45} seed={4} />
  </g>
);

/**
 * <MontroseCabin fr kind?='captain'|'passenger' door?=0..1 sky?='day'> — captain's cabin (desk, porthole, door) or a
 * small passenger cabin (bunk, porthole). CABIN.porthole is the porthole centre (push-through target), CABIN.door.
 */
export const CABIN = { porthole: [540, 700] as [number, number], door: [880, 1500] as [number, number], seat: [380, 1500] as [number, number] };
export const MontroseCabin: React.FC<{ fr: number; kind?: 'captain' | 'passenger'; door?: number; sky?: 'day' | 'dawn' | 'night' }> = ({ fr, kind = 'captain', door = 0, sky = 'day' }) => (
  <g>
    <rect x={-600} y={-400} width={2280} height={2800} fill={kind === 'captain' ? C.slate : C.mist} />
    {Array.from({ length: 20 }, (_, i) => <line key={i} x1={-600 + i * 110} y1={-400} x2={-600 + i * 110} y2={1500} stroke={C.deep} strokeWidth={3} opacity={0.3} />)}
    <svg x={420} y={580} width={240} height={240} viewBox="420 580 240 240" overflow="hidden"><g transform="translate(0 -320)"><Sea fr={fr} sky={sky} horizon={980} /></g></svg>
    <Print>
      <circle cx={540} cy={700} r={120} fill="none" stroke={C.lamp} strokeWidth={26} />
      <circle cx={540} cy={700} r={133} fill="none" stroke={C.ink} strokeWidth={4} /><circle cx={540} cy={700} r={107} fill="none" stroke={C.ink} strokeWidth={4} />
      {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={540 + Math.cos(i * Math.PI / 4) * 120} cy={700 + Math.sin(i * Math.PI / 4) * 120} r={6} fill={C.deep} />)}
      {kind === 'captain' ? <g><Ink d="M120 1180 H560 V1220 H120Z" fill={C.deep} shade="B" /><Ink d="M150 1220 H300 V1500 H150Z" fill={C.deep} shade="R" /><Ink d={rrect(200, 1140, 160, 40, 2)} fill={C.newsprint} sw={3} /><path d="M480 1180 V1100" stroke={C.ink} strokeWidth={6} /><circle cx={490} cy={1080} r={90} fill="url(#wn-lamp)" /><Ink d="M450 1100 L530 1100 L510 1050 L470 1050Z" fill={C.lamp} sw={3} /></g>
        : <g><Ink d="M60 1260 H520 V1320 H60Z" fill={C.newsprint} shade="B" /><Ink d="M60 1320 H520 V1500 H60Z" fill={C.deep} shade="R" /><Ink d={rrect(80, 1220, 140, 50, 20)} fill={C.newsprint} sw={3} /></g>}
      <Ink d="M780 900 H980 V1500 H780Z" fill={C.ink} />
      <g transform={`translate(780 900) scale(${1 - ease(clamp(door)) * 0.8} 1)`}><Ink d="M0 0 H200 V600 H0Z" fill={C.deep} shade="R" /><circle cx={170} cy={320} r={10} fill={C.lamp} stroke={C.ink} strokeWidth={3} /></g>
      <rect x={-600} y={1500} width={2280} height={800} fill={C.deep} />
      <path d="M-600 1500 H1680" stroke={C.ink} strokeWidth={5} />
    </Print>
  </g>
);

/**
 * <WirelessRoom fr tapping?=false taps? tape?='' tapeAt?> — the Marconi set (brass plate "MARCONI", spark gap via
 * WirelessKey, headphones), ticker spool and tape, door sign "WIRELESS". ROOM.key is the key position, ROOM.seat.
 */
export const ROOM = { key: [540, 1240] as [number, number], seat: [300, 1500] as [number, number], tape: [620, 1170] as [number, number] };
export const WirelessRoom: React.FC<{ fr: number; tapping?: boolean; taps?: { fr: number; dur: number }[]; tape?: string; tapeAt?: number }> = ({ fr, tapping, taps, tape = '', tapeAt = 0 }) => (
  <g>
    <rect x={-600} y={-400} width={2280} height={2800} fill={C.slate} />
    {Array.from({ length: 20 }, (_, i) => <line key={i} x1={-600 + i * 110} y1={-400} x2={-600 + i * 110} y2={1500} stroke={C.deep} strokeWidth={3} opacity={0.3} />)}
    <Print>
      <Ink d="M80 300 H330 V1500 H80Z" fill={C.deep} shade="R" sw={5} />
      <Ink d={rrect(110, 380, 190, 64, 4)} fill={C.newsprint} sw={3} />
      <text x={205} y={424} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={34} fill={C.ink}>WIRELESS</text>
      <Ink d="M380 640 H1000 V1200 H380Z" fill={C.deep} shade="R" />
      <Ink d={rrect(560, 680, 260, 70, 6)} fill={C.lamp} shade="B" sw={4} />
      <text x={690} y={728} textAnchor="middle" fontFamily={FONT.display} fontSize={44} fill={C.ink}>MARCONI</text>
      {[460, 920].map((x, i) => <g key={i}><Ink d={ellipse(x, 860, 46, 46)} fill={C.newsprint} sw={4} /><path d={`M${x} 860 L${x + Math.cos(fr * 0.05 + i) * 34} ${860 + Math.sin(fr * 0.05 + i) * 34}`} stroke={C.ink} strokeWidth={4} /></g>)}
      {Array.from({ length: 4 }, (_, i) => <Ink key={i} d={ellipse(560 + i * 70, 960, 18, 18)} fill={C.slate} sw={3} />)}
      <path d="M380 1060 Q300 1000 330 900" stroke={C.ink} strokeWidth={4} fill="none" />
      <Ink d="M200 1240 H1000 V1290 H200Z" fill={C.slate} shade="B" />
      <Ink d="M240 1290 H320 V1500 H240Z M880 1290 H960 V1500 H880Z" fill={C.deep} />
    </Print>
    <WirelessKey fr={fr} x={ROOM.key[0]} y={ROOM.key[1] - 20} scale={0.9} tapping={tapping} taps={taps} />
    {tape && <TickerTape fr={fr} x={ROOM.tape[0]} y={ROOM.tape[1]} text={tape} at={tapeAt} len={380} rot={0} />}
    <rect x={-600} y={1500} width={2280} height={800} fill={C.deep} />
  </g>
);

/**
 * <RaceMap fr w?=600 laurentic?=square montrose?=square hopAt? dice? diceAt? flag?> — the Daily Wire map page as a board
 * game: Antwerp and Liverpool to Father Point, the route as date squares (RACE_DATES 20 Jul … 31 Jul), moving wave
 * doodles, the two ship tokens (Laurentic with a cora pennant; Montrose with the Moustache perched), dice, a finish flag
 * on "FATHER POINT". Token positions are square indices (fractions allowed); `hopAt` animates a token's hop arcs.
 * Drawn in a w×w box (top-left 0,0).
 */
export const RACE_DATES = ['20 Jul', '21 Jul', '22 Jul', '23 Jul', '24 Jul', '25 Jul', '26 Jul', '27 Jul', '28 Jul', '29 Jul', '30 Jul', '31 Jul'];
export const raceSquare = (i: number, w = 600): [number, number] => {
  const k = w / 600; const n = RACE_DATES.length; const t = Math.max(0, Math.min(n - 1, i)) / (n - 1);
  const x = 90 + t * 420, y = 470 - Math.sin(t * Math.PI) * 260 - t * 60;
  return [x * k, y * k];
};
export const RaceMap: React.FC<{ fr: number; w?: number; laurentic?: number; montrose?: number; dice?: number; diceAt?: number; flag?: boolean; moustache?: boolean }> =
  ({ fr, w = 600, laurentic = 2, montrose = 4, dice = 3, diceAt, flag = true, moustache = true }) => {
    const k = w / 600;
    const hopY = (v: number) => { const f = v - Math.floor(v); return f > 0 && f < 1 ? -Math.sin(f * Math.PI) * 40 * k : 0; };
    const token = (v: number, ship: 'L' | 'M') => {
      const [x, y] = raceSquare(Math.min(v, RACE_DATES.length - 1), w); const hy = hopY(v);
      return <g transform={`translate(${x + (ship === 'L' ? -12 : 12) * k} ${y + hy - 16 * k}) scale(${k})`}>
        <Ink d="M-30 0 L30 0 L22 14 L-24 14Z" fill={ship === 'L' ? C.deep : C.slate} sw={3} />
        <Ink d="M-14 0 L-10 -18 L4 -18 L6 0Z" fill={C.fog} sw={2.5} />
        {ship === 'L' && <><path d="M18 0 V-40" stroke={C.ink} strokeWidth={3} /><path d="M18 -40 L42 -33 L18 -26Z" fill={C.cora} stroke={C.ink} strokeWidth={2} /></>}
        {ship === 'M' && moustache && <g transform="translate(0 -32)"><Moustache fr={fr} x={0} y={0} size={0.3} state="perch" /></g>}
      </g>;
    };
    const roll = diceAt != null ? clamp((fr - diceAt) / 16) : 1; const face = roll < 1 ? 1 + Math.floor(rnd(`dc${Math.floor(fr / 2)}`) * 6) : dice;
    return (
      <Print><g>
        <rect x={0} y={0} width={w} height={w} fill={C.newsprint} stroke={C.ink} strokeWidth={3} />
        {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${(60 + i * 110 + ((fr * 0.5) % 40)) * k} ${(540 - (i % 2) * 60) * k} q${10 * k} ${-8 * k} ${20 * k} 0 t${20 * k} 0`} stroke={C.mist} strokeWidth={4} fill="none" />)}
        <path d={`M${20 * k} ${520 * k} Q${60 * k} ${440 * k} ${40 * k} ${380 * k} L${10 * k} ${380 * k} L${10 * k} ${590 * k} L${110 * k} ${590 * k}Z`} fill={C.mist} stroke={C.ink} strokeWidth={3} />
        <text x={16 * k} y={575 * k} textAnchor="start" fontFamily={FONT.period} fontWeight={700} fontSize={18 * k} fill={C.ink}>ANTWERP</text>
        <text x={16 * k} y={360 * k} textAnchor="start" fontFamily={FONT.period} fontWeight={700} fontSize={18 * k} fill={C.ink}>LIVERPOOL</text>
        <path d={`M${480 * k} ${10 * k} Q${540 * k} ${120 * k} ${590 * k} ${100 * k} L${590 * k} ${10 * k}Z`} fill={C.mist} stroke={C.ink} strokeWidth={3} />
        {RACE_DATES.map((d, i) => { const [x, y] = raceSquare(i, w); return <g key={i}><rect x={x - 26 * k} y={y - 18 * k} width={52 * k} height={36 * k} rx={4} fill={i === RACE_DATES.length - 1 ? C.fog : C.newsprint} stroke={C.ink} strokeWidth={2.5} /><text x={x} y={y + 6 * k} textAnchor="middle" fontFamily={FONT.period} fontSize={14 * k} fill={C.deep}>{d}</text></g>; })}
        {(() => { const [x, y] = raceSquare(RACE_DATES.length - 1, w); return <g><text x={Math.min(x, 600 * k - 100 * k)} y={y + 52 * k} textAnchor="middle" fontFamily={FONT.display} fontSize={26 * k} fill={C.ink}>FATHER POINT</text>{flag && <g transform={`translate(${x + 18 * k} ${y - 22 * k}) scale(${k})`}><path d="M0 0 V-34" stroke={C.ink} strokeWidth={3} /><path d={`M0 -34 L${24 + osc(fr, 12) * 3} -28 L0 -20Z`} fill={C.newsprint} stroke={C.ink} strokeWidth={2} /><rect x={2} y={-33} width={7} height={6} fill={C.ink} /><rect x={9} y={-27} width={7} height={6} fill={C.ink} /></g>}</g>; })()}
        {token(montrose, 'M')}{token(laurentic, 'L')}
        <g transform={`translate(${470 * k} ${510 * k}) rotate(${roll < 1 ? fr * 25 : 12}) scale(${k})`}>
          <Ink d={rrect(-26, -26, 52, 52, 8)} fill={C.newsprint} sw={3} />
          {({ 1: [[0, 0]], 2: [[-12, -12], [12, 12]], 3: [[-12, -12], [0, 0], [12, 12]], 4: [[-12, -12], [12, -12], [-12, 12], [12, 12]], 5: [[-12, -12], [12, -12], [0, 0], [-12, 12], [12, 12]], 6: [[-12, -12], [12, -12], [-12, 0], [12, 0], [-12, 12], [12, 12]] } as Record<number, number[][]>)[face].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={5} fill={C.ink} />)}
        </g>
      </g></Print>
    );
  };

/**
 * <FatherPoint fr beam?=true sun?=true boatX?=0..1 crew?=true> — dawn at Father Point: lighthouse (newsprint tower, deep
 * lantern top) with a sweeping beam, the wide St Lawrence, low fog hills, lamp dawn sun, sign "FATHER POINT", and the
 * pilot boat (small launch, two crew) at boatX along its run out to the ship (0 = at the pier, 1 = at the ship side).
 */
export const FATHER = { lantern: [220, 760] as [number, number], boatFrom: [300, 1360] as [number, number], boatTo: [820, 1420] as [number, number] };
export const PilotBoat: React.FC<{ fr: number; x: number; y: number; scale?: number; crew?: boolean }> = ({ fr, x, y, scale = 1, crew = true }) => (
  <g transform={`translate(${x} ${y + osc(fr, 24) * 4}) rotate(${osc(fr, 30) * 2}) scale(${scale})`}>
    {[0, 1, 2].map((i) => { const t = ((fr + i * 10) % 30) / 30; return <path key={i} d={`M${-90 - t * 120} ${8 + t * 6} q15 -8 30 0`} stroke={C.newsprint} strokeWidth={4} fill="none" opacity={1 - t} />; })}
    <Print>
      {crew && <g><circle cx={-20} cy={-62} r={14} fill={C.skin} stroke={C.ink} strokeWidth={3} /><Ink d="M-34 -50 L-6 -50 L-4 -14 L-36 -14Z" fill={C.deep} sw={3} /><circle cx={34} cy={-58} r={14} fill={C.skin} stroke={C.ink} strokeWidth={3} /><Ink d="M20 -46 L48 -46 L50 -14 L18 -14Z" fill={C.slate} sw={3} /></g>}
      <Ink d="M-90 -14 L100 -14 Q120 -14 110 4 L90 22 L-80 22Z" fill={C.newsprint} shade="RB" sw={4} />
      <Ink d={rrect(-60, -44, 50, 30, 3)} fill={C.slate} sw={3} />
      <path d="M-40 -44 V-70" stroke={C.ink} strokeWidth={5} />
    </Print>
  </g>
);
export const FatherPoint: React.FC<{ fr: number; beam?: boolean; boatX?: number; sun?: boolean; crew?: boolean; boat?: boolean }> = ({ fr, beam = true, boatX = 0.2, sun = true, crew = true, boat = true }) => {
  const a = Math.sin(fr / 40) * 40 - 10;
  const bx = FATHER.boatFrom[0] + (FATHER.boatTo[0] - FATHER.boatFrom[0]) * boatX, by = FATHER.boatFrom[1] + (FATHER.boatTo[1] - FATHER.boatFrom[1]) * boatX;
  return (
    <g>
      <Sky kind="dawn" />
      {sun && <g><circle cx={820} cy={980} r={340} fill="url(#wn-lamp)" /><circle cx={820} cy={1000} r={90} fill={C.lamp} /></g>}
      <Print far><Ink d="M-200 1050 Q100 920 380 1010 Q620 900 900 1000 Q1100 950 1300 1040 V1100 H-200Z" fill={C.fog} sw={3} /></Print>
      <Sea fr={fr} sky="dawn" horizon={1080} skyOn={false} />
      <Print>
        <Ink d="M-200 1240 L360 1200 L420 1300 L-200 1340Z" fill={C.slate} shade="R" />
        <Ink d="M170 1230 L270 1230 L250 800 L190 800Z" fill={C.newsprint} shade="R" />
        {[0, 1, 2].map((i) => <path key={i} d={`M${184 + i * 2} ${880 + i * 110} H${256 - i * 2}`} stroke={C.slate} strokeWidth={14} />)}
        <Ink d="M180 800 L260 800 L250 720 L190 720Z" fill={C.lamp} sw={4} />
        <Ink d="M176 722 L220 680 L264 722Z" fill={C.deep} sw={4} />
        <Ink d={rrect(300, 1110, 220, 54, 4)} fill={C.newsprint} sw={4} />
        <text x={410} y={1148} textAnchor="middle" fontFamily={FONT.period} fontWeight={700} fontSize={28} fill={C.ink}>FATHER POINT</text>
        <path d="M330 1164 V1210 M490 1164 V1210" stroke={C.ink} strokeWidth={6} />
      </Print>
      {beam && <g transform={`translate(${FATHER.lantern[0]} ${FATHER.lantern[1]}) rotate(${a})`}><path d="M0 -14 L900 -120 L900 120 L0 14Z" fill="url(#wn-beam)" /></g>}
      {boat && <PilotBoat fr={fr} x={bx} y={by} crew={crew} />}
      <FogBand fr={fr} y={1060} speed={0.4} op={0.55} seed={6} /><FogBand fr={fr} y={1250} speed={0.8} op={0.4} seed={8} />
    </g>
  );
};
