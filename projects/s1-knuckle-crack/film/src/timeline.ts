// Every state of the film as a pure function of time t (seconds), cued from the spoken words (src/words.json).
import {cue, VO_END} from './lib';

export const DUR_S = VO_END + 2.2;
export type V3 = [number, number, number];
export const AMBER = '#FFB547', CORAL = '#FF5A4E', GAS = '#BFF4FF', FLUID = '#F2D58A';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const B = {
  myth: cue('arthritis.', 0), what: cue("So what's"), each: cue('Each knuckle'), capsule: cue('capsule'),
  pull: cue('Pull the bones'), pressure: cue('pressure'), drops: cue('drops.'), gas: cue('Gas rushes'), bubble: cue('bubble,'),
  pop: cue('with a pop.'), noBone: cue('No bone'), grinds: cue('Nothing grinds.'), takes: cue('The gas takes'),
  twenty: cue('twenty minutes'), dissolve: cue('dissolve'), why: cue("That's why"), inRow: cue('in a row.'),
  doctor: cue('One doctor'), leftHand: cue('left hand'), twiceDay: cue('twice a day,'), fifty: cue('fifty years.'),
  neither: cue('Neither hand'), study: cue('A study'), noLink: cue('no link'), stop: cue('Just stop'), end: VO_END,
};

// ---------- cuts
export const CUT_IN = B.each - 0.12;     // the fist at the desk -> inside one knuckle (the giant joint)
export const CUT_OUT = B.doctor - 0.12;  // inside the joint -> two hands on the desk
export const CUTS = [CUT_IN, CUT_OUT];
export const shot = (t: number) => (t < CUT_IN ? 0 : t < CUT_OUT ? 1 : 2);

// ---------- shot 0: the fist. Fingers curl 0 -> 1, then the four knuckles pop in turn (index first)
export const curl0 = (t: number) => ramp(t, 0.0, 0.9);
export const POPS0 = [1.0, 1.3, 1.6, 1.9];
export const ringAge = (t: number, at: number) => (t >= at && t < at + 0.7 ? (t - at) / 0.7 : -1);

// ---------- shot 1: the giant joint, in millimetres (real size). Axis along X: metacarpal head at x = 0,
// the finger bone (proximal phalanx) to +X across the gap.
export const GAP0 = 0.9, GAP1 = 1.9;                         // Kawchuk 2015: 0.93 -> 1.89 mm
export const capsuleOn = (t: number) => ramp(t, B.capsule - 0.3, B.capsule + 0.5);
export const pull1 = (t: number) => ramp(t, B.pull - 0.05, B.drops + 0.1);              // the first pull
// the second pull while the bubble is still there: no pop
export const pull2 = (t: number) => hump(t, B.why + 0.3, 2.2);
export const gap = (t: number) => {
  const relax = ramp(t, B.noBone - 0.2, B.noBone + 0.8);     // the finger settles back a little after the pop
  const g = lerp(GAP0, GAP1, pull1(t)) - 0.35 * relax + 0.45 * pull2(t);
  return t < CUT_IN ? GAP0 : g;
};
export const pressure = (t: number) => 1 - ramp(t, B.pressure - 0.1, B.drops + 0.3) + ramp(t, B.pop + 0.05, B.pop + 0.6) * 0.85; // 1 normal, 0 low
export const POP_T = () => B.pop + 0.08;                      // the bubble forms on "pop"
export const gather = (t: number) => ramp(t, B.gas - 0.1, POP_T());                        // dissolved specks rush together
export const bubble = (t: number) => {
  // radius (mm): forms on the pop, then shrinks over "twenty minutes" (time-lapse)
  const r0 = 0.62;
  const born = ramp(t, POP_T() - 0.06, POP_T() + 0.12);
  const fade = ramp(t, B.twenty, B.why - 0.2);
  return r0 * born * (1 - 0.55 * fade);
};
export const flash = (t: number) => hump(t, POP_T() - 0.03, 0.35);
export const intact = (t: number) => hump(t, B.noBone - 0.1, B.takes - B.noBone + 0.3);
export const clockOn = (t: number) => ramp(t, B.takes - 0.1, B.takes + 0.3) * (1 - ramp(t, B.why + 0.2, B.why + 0.6));
export const clockMin = (t: number) => 20 * ramp(t, B.twenty - 0.2, B.why - 0.2);
export const noPop = (t: number) => hump(t, B.why + 0.9, 1.4);   // a dull "no" mark when the second pull finds no pop

// ---------- shot 2: two hands on the desk. The left hand cracks (fist and pops), the right stays flat.
export const leftCrack = (t: number) => { // returns curl 0..1 and the time of the latest pop
  const a = B.leftHand - 0.2, b = B.neither - 0.3; if (t < a || t > b + 0.8) return {curl: 0, pop: -1};
  const per = 1.1; const k = Math.floor((t - a) / per); const f = (t - a) / per - k;
  const curl = t > b ? 1 - ramp(t, b, b + 0.6) : f < 0.45 ? smooth(f / 0.45) : 1 - smooth((f - 0.65) / 0.35);
  return {curl, pop: a + k * per + 0.45 * per};
};
export const counter = (t: number) => Math.round(36500 * ramp(t, B.twiceDay - 0.2, B.fifty + 0.5) ** 1.6);
export const counterOn = (t: number) => ramp(t, B.twiceDay - 0.3, B.twiceDay + 0.1) * (1 - ramp(t, B.study - 0.2, B.study + 0.2));
export const yearsOn = (t: number) => ramp(t, B.fifty - 0.2, B.fifty + 0.3) * (1 - ramp(t, B.study - 0.2, B.study + 0.2));
export const healthy = (t: number) => ramp(t, B.neither - 0.1, B.neither + 0.5) * (1 - ramp(t, B.stop - 0.3, B.stop + 0.4));
export const studyOn = (t: number) => ramp(t, B.study, B.study + 0.4) * (1 - ramp(t, B.stop - 0.2, B.stop + 0.2));
export const relaxOpen = (t: number) => ramp(t, B.stop, B.stop + 1.0);

// ---------- camera keys (shot 0 and 2 in metres at the desk; shot 1 in millimetres inside the joint)
export type Key = {t: number; pos: V3; look: V3; mm: number; up?: V3; cut?: boolean};
export const FIST: V3 = [0.0, 0.11, 0.0];  // the fist's knuckles at the desk
export const KEYS: Key[] = [
  {t: 0, pos: [0.08, 0.2, 0.42], look: [0.0, 0.1, 0.0], mm: 50},
  {t: B.what, pos: [0.03, 0.16, 0.3], look: [0.0, 0.105, 0.0], mm: 50},
  {t: CUT_IN, pos: [0.012, 0.13, 0.17], look: [0.0, 0.105, 0.0], mm: 50},
  // inside: start wide on the joint (capsule fills the frame), push in to the gap
  {t: CUT_IN, cut: true, pos: [-6, 10, 62], look: [2, 0, 0], mm: 35},
  {t: B.pull, pos: [-3, 6, 48], look: [1, 0, 0], mm: 35},
  {t: B.pop + 0.4, pos: [0, 3, 30], look: [1, 0, 0], mm: 35},
  // orbit: the smooth cartilage surfaces, nothing broken
  {t: B.grinds + 0.6, pos: [22, 14, 30], look: [1, 0, 0], mm: 35},
  {t: B.dissolve + 0.4, pos: [8, 6, 38], look: [1, 0, 0], mm: 35},
  {t: CUT_OUT, pos: [2, 4, 42], look: [1, 0, 0], mm: 35},
  // two hands on the desk
  {t: CUT_OUT, cut: true, pos: [0.0, 0.3, 0.42], look: [0.0, 0.07, 0.0], mm: 40},
  {t: B.neither, pos: [0.0, 0.34, 0.46], look: [0.0, 0.07, 0.0], mm: 40},
  {t: DUR_S, pos: [0.0, 0.52, 0.6], look: [0.0, 0.06, -0.02], mm: 40},
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
  return {pos: v((k) => k.pos), look: v((k) => k.look), mm: lerp(b.mm, c.mm, u), up: v((k) => k.up ?? [0, 1, 0])};
};
