// Every state of the film as a pure function of time t (seconds), cued from the spoken words (cue()). No React, no
// three objects. World: 1 unit = 1 m. The microwave sits on the counter with its front facing +z; the lasagne slab
// is centred at SLAB (its cut plane faces the camera, z = SLAB.z).
import {cue, VO_END} from './lib';

export const DUR_S = VO_END + 2.0;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const CYAN = '#6FE7FF', GOLD = '#FFD27A';

// ---------- world
export const COUNTER_Y = 0.92;
export const MW = {x: 0, z: -0.25, w: 0.5}; // microwave box centre on the counter, width (front face at z ~ -0.05) // microwave centre on the counter, width
export const SLAB = {x: -0.047, y: 0.983, z: -0.2, w: 0.13, h: 0.098, d: 0.123}; // lasagne slab: x, z centre, y of its bottom (on the plate on the turntable)
export const SLAB_CY = SLAB.y + SLAB.h / 2;
export const INCH = 0.0254;
export const MOL = {x: 40, y: 1, z: 0}; // the molecule set, far from the kitchen

// ---------- beats
export const B = {
  think: cue('think'), inside: cue('inside'), watch: cue('Watch'), really: cue('really'),
  micro: cue('Microwaves mostly'), outer: cue('outer'), inch: cue('inch'),
  they: cue('They'), flip: cue('twist'), billions: cue('billions'), layer: cue('that layer'),
  middle: cue('The middle gets'), less: cue('much less'), creeps: cue('creeps'),
  why: cue("That's why"), boiling: cue('scalding'), icy: cue('cold in'),
  so: cue('So let'), stand: cue('stand'), heat: cue('and the heat'), job: cue('job.'), end: VO_END,
};

// ---------- cuts
export const CUT_FACE = B.really - 0.1;   // kitchen -> the cut face in heat vision
export const CUT_MOL = B.they - 0.1;      // face -> molecule scale
export const CUT_BACK = B.middle - 0.1;   // molecules -> the face
export const CUT_OUT = B.heat - 0.1;      // face -> the kitchen, door open, steaming
export const CUTS = [CUT_FACE, CUT_MOL, CUT_BACK, CUT_OUT];
export const shotAt = (t: number) => (t < CUT_FACE ? 'K' : t < CUT_MOL ? 'F' : t < CUT_BACK ? 'M' : t < CUT_OUT ? 'F' : 'E');

// ---------- the microwave
export const doorOpen = (t: number) => (t < CUT_FACE ? ramp(t, B.watch - 0.45, B.watch + 0.45) : 1); // 0 closed .. 1 open
export const running = (t: number) => (t < B.watch ? 1 : t < CUT_OUT ? 0 : 0); // lamp and turntable while it runs
export const turntable = (t: number) => (t < B.watch ? t * 0.5 : B.watch * 0.5); // radians
export const myth = (t: number) => 1 * (1 - ramp(t, B.watch + 0.1, B.watch + 0.6));
export const mythGlitch = (t: number) => hump(t, B.watch - 0.1, 0.8);

// ---------- the cut: the front half slides away
export const split = (t: number) => (t < CUT_FACE ? 0 : ramp(t, CUT_FACE + 0.05, CUT_FACE + 0.6));
export const scanLine = (t: number) => {
  // a sweep 0..1 down the face when heat vision turns on (cut), up when it turns off (boiling), down again (ice)
  const s = [[CUT_FACE + 0.05, 0.6], [B.why + 0.1, 0.6], [B.so - 0.25, 0.6]] as const;
  for (const [a, d] of s) if (t >= a && t < a + d) return (t - a) / d;
  return -1;
};
// heat vision on (1) or the real food (0); switches as the scan line passes
export const thermal = (t: number) => (t < CUT_FACE ? 0 : t < B.why + 0.4 ? 1 : t < B.so + 0.05 ? 0 : 1);

// ---------- the temperature field on the cut face: T(d) for d = distance in from the nearest surface (cm)
// heat: energy put in so far (0..1); creep: cm the rim front has moved inward by conduction; even: standing time
export const heat = (t: number) => 0.65 * ramp(t, B.micro + 0.2, B.inch + 0.6) + 0.35 * ramp(t, B.layer - 0.4, B.layer + 0.6);
export const creep = (t: number) => 1.4 * ramp(t, B.creeps - 0.3, B.why - 0.2);
export const even = (t: number) => ramp(t, B.stand, B.job + 0.4);
export const T0 = 4; // fridge-cold leftovers (C)
export const DELTA_CM = 1.0; // power penetration depth (cm) in thawed food
export const tempAt = (t: number, dCm: number) => {
  const front = Math.max(0, dCm - creep(t));
  const T = T0 + heat(t) * 110 * Math.exp(-front / DELTA_CM);
  return lerp(Math.min(T, 96), 66, even(t));
};
export const coreT = (t: number) => tempAt(t, 4.5);
export const rimT = (t: number) => tempAt(t, 0.3);

// wave fronts: [start time, side (0 top, 1 left, 2 right)]; they travel at WAVE_V m/s in the picture (slowed)
export const WAVE_V = 0.09;
export const waves = (t: number) => {
  const out: {age: number; side: number; ice: number}[] = [];
  const burst = (a: number, n: number, ice: number) => { for (let i = 0; i < n; i++) { const age = t - (a + i * 0.22); if (age > 0 && age < 1.4) out.push({age, side: i % 3, ice}); } };
  burst(B.micro - 0.1, 12, 0);
  return out;
};
export const ruler = (t: number) => ramp(t, B.inch - 0.3, B.inch + 0.2) * (1 - ramp(t, CUT_MOL - 0.3, CUT_MOL));

// ---------- molecules (shot M)
export const fieldOn = (t: number) => ramp(t, CUT_MOL + 0.2, B.flip);
export const flipAngle = (t: number, phase: number) => 0.75 * Math.sin(2 * Math.PI * 1.6 * t + phase) * fieldOn(t); // radians, visual slow motion
export const molHeat = (t: number) => ramp(t, B.billions, B.layer + 0.5);

// ---------- the real face (frozen meal): bubbles, steam, frost, probes
export const probes = (t: number) => ramp(t, B.boiling - 0.2, B.boiling + 0.4) * (1 - ramp(t, B.so - 0.3, B.so));
export const probeIcy = (t: number) => ramp(t, B.icy - 0.2, B.icy + 0.3) * (1 - ramp(t, B.so - 0.3, B.so));
export const steam = (t: number) => (t < CUT_OUT ? ramp(t, B.why + 0.3, B.why + 0.9) * (1 - ramp(t, B.so - 0.2, B.so)) : 1);
export const standTimer = (t: number) => ramp(t, B.stand - 0.2, B.stand + 0.2) * (1 - ramp(t, CUT_OUT - 0.2, CUT_OUT));
export const standLeft = (t: number) => 180 * (1 - ramp(t, B.stand, B.job));
export const clockOn = (t: number) => ramp(t, B.creeps - 0.2, B.creeps + 0.2) * (1 - ramp(t, B.why - 0.2, B.why + 0.1));

// ---------- camera
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; cut?: boolean};
const F = (dz: number, dy = 0, dx = 0): V3 => [SLAB.x + dx, SLAB_CY + dy, SLAB.z + dz];
export const KEYS: Key[] = [
  // K: the kitchen, front-left of the microwave, pushing in
  {t: 0, pos: [-0.3, 1.12, 0.42], look: [-0.03, 1.04, -0.25], mm: 24},
  {t: B.watch, pos: [-0.22, 1.1, 0.32], look: [-0.03, 1.03, -0.25], mm: 24},
  {t: CUT_FACE, pos: [-0.18, 1.09, 0.26], look: [-0.04, 1.02, -0.25], mm: 24},
  // F: the cut face, level, close
  {t: CUT_FACE, cut: true, pos: F(0.34, 0.01), look: F(0, 0.005), mm: 35},
  {t: CUT_MOL, pos: F(0.3, 0.008), look: F(0, 0.005), mm: 35},
  // M: molecules
  {t: CUT_MOL, cut: true, pos: [MOL.x - 0.4, MOL.y, MOL.z + 3.2], look: [MOL.x - 0.3, MOL.y, MOL.z], mm: 35},
  {t: CUT_BACK, pos: [MOL.x + 0.4, MOL.y + 0.1, MOL.z + 3.0], look: [MOL.x + 0.2, MOL.y, MOL.z], mm: 35},
  // F again: creep, the real face, the runaway, standing
  {t: CUT_BACK, cut: true, pos: F(0.3, 0.01), look: F(0, 0.005), mm: 35},
  {t: B.why, pos: F(0.34, 0.015, 0.01), look: F(0, 0.005), mm: 35},
  {t: B.so, pos: F(0.32, 0.03, -0.06), look: F(0, 0.0), mm: 35},
  {t: CUT_OUT, pos: F(0.36, 0.01, 0.0), look: F(0, 0.005), mm: 35},
  // E: back in the kitchen, door open, steaming
  {t: CUT_OUT, cut: true, pos: [-0.36, 1.15, 0.5], look: [0.0, 1.02, -0.25], mm: 24},
  {t: DUR_S, pos: [-0.44, 1.19, 0.66], look: [0.0, 1.03, -0.25], mm: 24},
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
  i = Math.min(i, S.length - 2);
  const a = S[Math.max(i - 1, 0)], b = S[i], c = S[i + 1], d = S[Math.min(i + 2, S.length - 1)];
  const u = smooth((t - b.t) / (c.t - b.t)) * 0.5 + clamp01((t - b.t) / (c.t - b.t)) * 0.5;
  const v = (f: (k: Key) => V3) => [0, 1, 2].map((j) => cr(f(a)[j], f(b)[j], f(c)[j], f(d)[j], u)) as V3;
  return {pos: v((k) => k.pos), look: v((k) => k.look), mm: lerp(b.mm, c.mm, u)};
};
