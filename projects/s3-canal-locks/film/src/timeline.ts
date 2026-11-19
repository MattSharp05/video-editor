// Every state of the film as a pure function of time t (seconds), cued from the spoken words, so a new voiceover
// re-times the film. No React, no three scene objects.
import {cue, VO_END} from './lib';

export const DUR_S = VO_END + 2.2;

// ---------- world (metres): ships climb toward +X; lane A at z = 0 (our ship), lane B at z = LANE_B (going down)
export const CH_L = 320, CH_W = 33.5, GAP = 20, STEP = 26 / 3, WALL_TOP = 29, WALL_T = 18;
export const chX0 = (i: number) => i * (CH_L + GAP); // chamber i spans [chX0, chX0 + CH_L]
export const chMid = (i: number) => chX0(i) + CH_L / 2;
export const LAKE_X = chX0(3) - GAP / 2; // the upper gate of chamber 2 at x = 1010
export const floorY = (i: number) => STEP * i - 13.5;
export const LANE_B = -(CH_W + WALL_T); // twin lane beyond the centre wall
export const SHIP_L = 290, DRAFT = 12;
export const CYAN = '#6FD6FF', AMBER = '#FFB547', CORAL = '#FF5A4E', GLASS = '#EAF6FF';

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- beats
export const B = {
  rise: cue('ship rise'), notOne: cue('Not one'), middle: cue("canal's middle"), above: cue('above the sea.'),
  steps: cue('in steps:'), locks: cue('called locks.'), gate: cue('The gate'), closes: cue('closes.'),
  valve: cue('A valve'), pours: cue('pours in.'), rushes: cue('It rushes'), wells: cue('wells up'), floor: cue('the floor.'),
  minutes: cue('eight minutes'), fills: cue('fills,'), floats: cue('floats up'),
  three: cue('Three steps,'), sails: cue('sails out'), gatun: cue('Gatun'),
  goingDown: cue('Going down,'), flows: cue('flows on'), sea: cue('out to sea.'),
  each: cue('Each ship'), liters: cue('liters,'), rain: cue('the rain'), refills: cue('refills'),
  end: VO_END,
};

// ---------- cuts between worlds (motion-principles: hard cuts)
export const CUT_SECTION = B.gate - 0.12; // aerial -> the x-ray section of the top chamber
export const CUT_BACK = B.three - 0.12;   // section -> aerial
export const CUT_SEA = B.each - 0.12;     // aerial -> the sea end, the water cube
export const CUTS = [CUT_SECTION, CUT_BACK, CUT_SEA];
export const inSection = (t: number) => t >= CUT_SECTION && t < CUT_BACK;

// ---------- water levels (lane A chambers 0..2, lane B chambers 0..2); sea = 0, lake = 26
export const levelA = (t: number, i: number) => {
  if (i === 0) return 0;
  if (i === 1) return lerp(STEP, 2 * STEP, ramp(t, 0.15, B.notOne + 0.9)); // the hook: the ship rises a step
  // chamber 2 starts at the middle level (the ship sails in), fills from the lake in the section
  return lerp(2 * STEP, 3 * STEP, ramp(t, B.wells, B.floats + 0.6));
};
export const levelB = (t: number, i: number) => {
  if (i === 2) return lerp(3 * STEP, 2 * STEP, ramp(t, B.goingDown - 0.2, B.sea + 0.6)); // the down ship's chamber drains
  if (i === 1) return 2 * STEP;
  return STEP;
};

// ---------- gates: 0 closed .. 1 open; gate g sits between chamber g-1 and g (g = 0 the sea gate, 3 the lake gate)
export const gateA = (t: number, g: number) => {
  if (g === 2) return t < CUT_SECTION ? ramp(t, B.steps - 0.8, B.steps - 0.1) : 1 - ramp(t, B.gate, B.closes + 0.4);
  if (g === 3) return t >= CUT_BACK ? ramp(t, CUT_BACK, B.sails - 0.2) : 0;
  return 0;
};

// ---------- the ship (lane A): centre x and keel; sails from chamber 1 into chamber 2, then out onto the lake
export const shipX = (t: number) => {
  const a = chMid(1) - 10, b = chMid(2) - 6, c = chMid(3) + 260;
  if (t < B.steps) return a;
  if (t < CUT_BACK) return lerp(a, b, ramp(t, B.steps, B.locks + 0.3));
  return lerp(b, c, ramp(t, B.three + 0.2, B.goingDown + 0.2));
};
export const shipLevel = (t: number) => {
  const x = shipX(t);
  if (x < chX0(2) - GAP / 2) return levelA(t, 1);
  if (x < LAKE_X) return levelA(t, 2);
  return 3 * STEP;
};
// the down ship in lane B sits in chamber 2
export const shipBX = () => chMid(2) + 4;

// ---------- the section's water: valve, culvert front, floor wells (0..1 progress)
export const valveOpen = (t: number) => (inSection(t) ? ramp(t, B.valve, B.valve + 0.5) : 0);
export const culvertFront = (t: number) => (inSection(t) ? ramp(t, B.pours - 0.4, B.wells + 0.1) : t >= CUT_BACK ? 1 : 0);
export const wellsOn = (t: number) => (inSection(t) ? ramp(t, B.wells - 0.2, B.wells + 0.4) * (1 - ramp(t, B.floats + 0.3, B.floats + 1.0)) : 0);
export const levelLine = (t: number) => (inSection(t) ? ramp(t, B.minutes - 0.5, B.minutes) : 0); // amber line at the lake level
export const xray = (t: number) => (inSection(t) ? 1 : 0);
// lane B draining: its culvert flow toward the sea
export const drainOn = (t: number) => (t >= CUT_BACK && t < CUT_SEA ? ramp(t, B.goingDown, B.goingDown + 0.5) : 0);

// ---------- overlays
export const stepMarks = (t: number, i: number) => (t < CUT_SECTION ? ramp(t, B.steps + 0.35 * i, B.steps + 0.35 * i + 0.35) : t >= CUT_BACK && t < CUT_SEA ? hump(t, B.three - 0.1 + 0.35 * i, 1.6) : 0);
export const cardNoPumps = (t: number) => ramp(t, B.notOne - 0.1, B.notOne + 0.25) * (1 - ramp(t, B.middle - 0.2, B.middle + 0.1)) + (t < 0.1 ? 0 : 0);
export const cardLake = (t: number) => (t < CUT_SECTION ? ramp(t, B.above - 0.6, B.above) * (1 - ramp(t, B.steps - 0.1, B.steps + 0.3)) : 0);
export const card8min = (t: number) => (inSection(t) ? ramp(t, B.minutes - 0.1, B.minutes + 0.3) : 0);
export const cardLiters = (t: number) => (t >= CUT_SEA ? ramp(t, B.liters - 0.9, B.liters - 0.4) * (1 - ramp(t, B.refills, B.refills + 0.4)) : 0);

// ---------- the sea end: a 58 m cube of water (200,000 m3) tips into the sea; rain over the lake
export const CUBE = 58;
export const cubeOn = (t: number) => (t >= CUT_SEA ? ramp(t, B.each - 0.05, B.each + 0.5) : 0);
export const cubeTip = (t: number) => (t >= CUT_SEA ? ramp(t, B.liters - 0.3, B.liters + 1.6) : 0); // 0 standing .. 1 poured out
export const rainOn = (t: number) => (t >= CUT_SEA ? ramp(t, B.rain - 0.4, B.rain + 0.4) : 0);

// ---------- camera keys
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; cut?: boolean};
export const KEYS: Key[] = [
  // 1 the hook: above the near wall of chamber 1, looking down at the hull as it rises; then up and back to the aerial
  {t: 0, pos: [chX0(1) + 10, 62, 58], look: [chX0(1) + 110, 14, -6], mm: 24},
  {t: B.notOne + 0.6, pos: [chX0(1) - 5, 70, 66], look: [chX0(1) + 110, 18, -6], mm: 24},
  {t: B.above, pos: [chX0(0) - 70, 175, 235], look: [chMid(1) + 30, 8, -20], mm: 24},
  {t: CUT_SECTION, pos: [chX0(0) - 90, 190, 250], look: [chMid(1) + 90, 8, -20], mm: 24},
  // 2 the section of the top chamber: the gate behind the stern, along the wall to the valve, back for the wells
  {t: CUT_SECTION, cut: true, pos: [chX0(2) + 40, 34, 62], look: [chX0(2) - 15, 12, 0], mm: 24},
  {t: B.closes + 0.5, pos: [chX0(2) + 50, 34, 64], look: [chX0(2) + 10, 10, 18], mm: 24},
  {t: B.valve, pos: [LAKE_X - 115, 22, 64], look: [LAKE_X - 15, 10, 20], mm: 24},
  {t: B.wells + 0.3, pos: [chX0(2) + 190, 22, 66], look: [chX0(2) + 250, 5, 0], mm: 24},
  {t: B.floats + 0.5, pos: [chX0(2) + 130, 40, 135], look: [chX0(2) + 220, 15, 0], mm: 24},
  {t: CUT_BACK, pos: [chX0(2) + 120, 44, 145], look: [chX0(2) + 220, 17, 0], mm: 24},
  // 3 the aerial: out onto the lake, then the down lane draining
  {t: CUT_BACK, cut: true, pos: [chX0(1) + 80, 170, 230], look: [chMid(2) + 170, 12, -25], mm: 24},
  {t: B.goingDown, pos: [chX0(1) - 20, 180, 240], look: [chMid(2) + 20, 10, -25], mm: 24},
  {t: CUT_SEA, pos: [chX0(0) - 100, 190, 250], look: [chMid(1) - 40, 6, -30], mm: 24},
  // 4 the sea end: the cube, then rise and turn up-canal to the lake under the rain
  {t: CUT_SEA, cut: true, pos: [-760, 42, 165], look: [-640, 32, 20], mm: 24},
  {t: B.liters + 0.6, pos: [-790, 56, 186], look: [-640, 30, 15], mm: 24},
  {t: B.rain + 0.3, pos: [-800, 70, 200], look: [-600, 36, 10], mm: 24},
  {t: DUR_S + 0.3, pos: [-320, 240, 300], look: [1500, 20, -60], mm: 24},
];
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
export const camAt = (t: number) => {
  let s0 = 0;
  KEYS.forEach((k, i) => { if (k.cut && k.t <= t) s0 = i; });
  let s1 = KEYS.findIndex((k, i) => i > s0 && k.cut); if (s1 < 0) s1 = KEYS.length;
  const S = KEYS.slice(s0, s1);
  let i = S.findIndex((k) => k.t > t) - 1;
  if (i < 0) i = t < S[0].t ? 0 : S.length - 2;
  const a = S[Math.max(i - 1, 0)], b = S[i], c = S[i + 1], d = S[Math.min(i + 2, S.length - 1)];
  const u = smooth((t - b.t) / (c.t - b.t)) * 0.5 + clamp01((t - b.t) / (c.t - b.t)) * 0.5;
  const v = (f: (k: Key) => V3) => [0, 1, 2].map((j) => cr(f(a)[j], f(b)[j], f(c)[j], f(d)[j], u)) as V3;
  return {pos: v((k) => k.pos), look: v((k) => k.look), mm: lerp(b.mm, c.mm, u)};
};

// the hook: the amber line the ship rises to, and the start line, on chamber 1's walls
export const hookLines = (t: number) => (t < CUT_SECTION ? 1 - ramp(t, B.middle, B.middle + 0.6) : 0);
export const cardEnd = (t: number) => ramp(t, B.refills + 0.6, B.refills + 1.0);
