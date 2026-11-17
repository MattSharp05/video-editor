// Every state of the film as a pure function of time t (seconds). Times come from spoken words
// (cue/cueEnd), so a new voiceover re-times the film. No React, no three scene objects.
import {cue, cueEnd, VO_END} from './lib';
import {Color} from 'three';

export const DUR_S = VO_END + 2.2;

// ---------- world constants (metres; plane-local frame: +X nose, +Y up, +Z right side, pivot = origin)
export const PIVOT_X = 0; // centre of gravity, near the wing root
export const CUPS = [
  {name: 'front', x: 12.6, color: '#FF8A4C'},
  {name: 'middle', x: 0.0, color: '#FFB547'},
  {name: 'back', x: -16.9, color: '#FF5A4E'},
] as const;
export const ROOF_Y = 2.05;
export const FLOOR_Y = -1.37;
export const CABIN_X: [number, number] = [-18.1, 18.8];
export const AMBER = '#FFB547', CORAL = '#FF5A4E', ORANGE = '#FF8A4C', GLASS = '#EAF6FF';

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
// one smooth hump 0 -> 1 -> 0 over [a, a+d]
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
// a damped wobble starting at a
export const wobble = (t: number, a: number, f: number, decay: number) => (t < a ? 0 : Math.sin(2 * Math.PI * f * (t - a)) * Math.exp(-decay * (t - a)));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- beats (from the words)
export const B = {
  jolt: 1.4,
  watch: cue('watch'), front: cue('Front.'), middle: cue('Middle. Back.'), back: cue('Back. Same'),
  bump: cue('Same bump.'), spills: cue('spills.'), least: cue('moves least.'),
  bounce: cue('bounce.'), rocks: cue('rocks,'), seesaw: cue('seesaw', 0),
  wings: cue('near the wings.'), balanced: cue('balanced,'), pivots: cue('pivots.'),
  farther: cue('The farther'), moreMoves: cue('the more it moves.'),
  backRows: cue('back rows'), overWing: cue('over the wing feel'),
  book: cue('Book'), belt: cue('seatbelt'), passengers: cue('Most passengers'),
  end: VO_END,
};
export const BEAT_STARTS = [0, cue('But watch'), cue('Same bump.'), cue("That's because"), cue('And the middle'),
  cue("That's where", 0), cue('The farther'), cue('So the back'), cue('Book'), cue('Most passengers')];

// ---------- plane motion: heave (m) and pitch (deg, + = nose up), rigid about the pivot
export const heave = (t: number) =>
  -0.6 * hump(t, B.jolt, 0.5) + 0.8 * hump(t, B.bump, 1.3) + 0.9 * hump(t, B.bounce - 0.2, 1.0);
export const pitch = (t: number) => {
  let p = -4 * hump(t, B.bump + 0.05, 1.5);
  // the seesaw: up 6 deg, down to -6, settle
  const r = B.rocks - 0.1;
  if (t > r) p += t < r + 1.2 ? 8 * smooth((t - r) / 1.2) : t < r + 2.7 ? lerp(8, -8, smooth((t - r - 1.2) / 1.5)) : -8 * (1 - smooth((t - r - 2.7) / 1.0));
  p += 3 * Math.sin(2 * Math.PI * (t - B.wings + 0.6) / 2.4) * hump(t, B.wings - 0.6, 2.4) * 1.0; // gentle rock round the pivot
  p += -5 * hump(t, B.balanced - 0.2, 2.2); // tipping on the fulcrum
  p += 4 * Math.sin(2 * Math.PI * (t - B.moreMoves + 0.4) / 2.0) * hump(t, B.moreMoves - 0.4, 2.0);
  return p;
};
// world position of a plane-local point (x along, y up) at time t
export const planePoint = (t: number, x: number, y: number): [number, number] => {
  const a = (pitch(t) * Math.PI) / 180;
  return [x * Math.cos(a) - y * Math.sin(a), heave(t) + x * Math.sin(a) + y * Math.cos(a)];
};

// ---------- hull: 0 = white paint, 1 = glass
export const glass = (t: number) => ramp(t, B.watch + 0.6, B.watch + 1.8) * (1 - ramp(t, B.book + 0.6, B.book + 1.6));

// ---------- giant cups: growth 0..1 on their words, back to 0 for the map
export const cupGrow = (t: number, i: number) => {
  const at = [B.front, B.middle, B.back][i];
  return ramp(t, at - 0.05, at + 0.45) * (1 - ramp(t, B.backRows - 0.6, B.backRows + 0.2));
};
export const BEAD_UP = 1.2;
export const CUP_H = 6, CUP_R0 = 1.55, CUP_R1 = 2.05, CUP_FILL = 0.62;

// vertical displacement of a cup (relative to its rest place) and its acceleration proxy
const disp = (t: number, x: number) => planePoint(t, x, ROOF_Y)[1] - ROOF_Y;
export const cupAccel = (t: number, x: number) => { const h = 1 / 30; return (disp(t + h, x) - 2 * disp(t, x) + disp(t - h, x)) / (h * h); };
// water state per cup: surface tilt (rad), surface rise above fill (m), spill amount 0..1
export const water = (t: number, i: number) => {
  const amp = [0.55, 0.12, 1.0][i];
  const base = wobble(t, B.bump + 0.1, 0.9, 1.2) + 0.5 * wobble(t, B.rocks + 0.3, 0.6, 0.9) + 0.3 * wobble(t, B.balanced, 0.7, 1.0);
  const tilt = amp * 0.32 * base + (i === 1 ? 0.02 * Math.sin(t * 23) * hump(t, B.bump, 2.5) : 0);
  const rise = amp * 0.9 * Math.max(0, wobble(t, B.bump + 0.1, 0.9, 1.4));
  const spill = i === 2 ? hump(t, B.bump + 0.25, 2.6) : 0;
  return {tilt, rise, spill};
};
// spill droplets of the back cup: launched over [bump+0.3, bump+1.4]
export const SPILL_T0 = () => B.bump + 0.3;

// ---------- trails: sampled past positions of each cup's rim over the last `len` seconds
export const trailOn = (t: number) => ramp(t, B.rocks - 0.2, B.rocks + 0.2) * (1 - ramp(t, B.backRows - 0.8, B.backRows));
export const trail = (t: number, i: number, len = 3.0, n = 60): [number, number][] => {
  const pts: [number, number][] = [];
  for (let k = 0; k < n; k++) {
    const tt = t - len + (len * k) / (n - 1);
    pts.push(planePoint(tt, CUPS[i].x, ROOF_Y + CUP_H + BEAD_UP));
  }
  return pts;
};

// ---------- pivot, fulcrum wedge, rows coloured by distance
export const pivotGlow = (t: number) => ramp(t, B.wings - 0.2, B.wings + 0.6) * (1 - ramp(t, B.backRows, B.backRows + 1));
export const wedge = (t: number) => ramp(t, B.balanced - 1.0, B.balanced + 0.2) * (1 - ramp(t, B.moreMoves + 0.6, B.moreMoves + 1.6));
// colour front: |x| within this radius is coloured
export const rowSpread = (t: number) => 22 * ramp(t, B.farther, B.farther + 2.2) * (1 - ramp(t, B.book + 0.4, B.book + 1.2));
export const distLines = (t: number) => ramp(t, B.farther + 0.6, B.farther + 1.6) * (1 - ramp(t, B.backRows - 0.6, B.backRows));
export const tailPulse = (t: number) => hump(t, B.backRows, 1.0);
export const wingLift = (t: number) => ramp(t, B.overWing, B.overWing + 0.6) * (1 - ramp(t, B.book + 0.8, B.book + 1.6));
export const labelOn = (t: number) => ramp(t, B.overWing + 0.4, B.overWing + 1.0) * (1 - ramp(t, B.book + 0.3, B.book + 0.8));

// ---------- seatbelt (hero seat, row over the wing, right window seat)
export const buckle = (t: number) => ramp(t, B.belt - 0.1, B.belt + 0.35);

// ---------- exposure and clouds
export const cloudShift = (t: number) => t * 55; // metres the deck has scrolled (plane flies +X)

// ---------- camera keys: [t, pos, look, mm, up]
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; up?: V3};
const WIN_X = -16.4; // the row-32 window (back cup row) on the right side
export const WIN_IN = 2.75; // the camera crosses the window into the cabin
export const KEYS: Key[] = [
  {t: 0, pos: [-2.5, -3.5, 98], look: [-2.5, 0.6, 0], mm: 35},
  {t: WIN_IN - 0.75, pos: [-12, -0.6, 22], look: [-15, 0, 0], mm: 35},
  {t: WIN_IN - 0.15, pos: [WIN_X, -0.15, 3.2], look: [WIN_X - 0.4, -0.2, 0], mm: 35},
  {t: WIN_IN + 0.2, pos: [WIN_X, -0.2, 1.2], look: [WIN_X + 2, -0.45, 0.3], mm: 24},
  {t: WIN_IN + 0.6, pos: [-17.55, -0.02, 0.26], look: [-16.64, -0.64, 0.42], mm: 24},
  {t: B.front - 0.55, pos: [-17.42, -0.1, 0.3], look: [-16.64, -0.64, 0.42], mm: 24},
  {t: B.front - 0.05, pos: [-17.6, 4.0, 5], look: [-14, 0.5, 0], mm: 24},
  {t: B.back + 0.5, pos: [-2.5, 3.2, 92], look: [-2.5, 3.0, 0], mm: 35},
  {t: B.spills + 0.3, pos: [-6.5, 3.0, 80], look: [-7, 3.0, 0], mm: 35},
  {t: B.least + 0.4, pos: [-3.5, 3.0, 78], look: [-1.5, 3.0, 0], mm: 35},
  {t: B.rocks + 0.2, pos: [-2.5, 3.2, 96], look: [-2.5, 3.0, 0], mm: 35},
  {t: B.seesaw + 0.8, pos: [-2.5, 3.2, 100], look: [-2.5, 3.0, 0], mm: 35},
  {t: B.wings + 1.2, pos: [18, 1.0, 58], look: [-0.5, 3.0, 0], mm: 35},
  {t: B.pivots + 0.2, pos: [12, -22, 88], look: [-1, -12, 0], mm: 35},
  {t: B.moreMoves + 0.6, pos: [-2.5, 20, 96], look: [-2.5, 1.0, 0], mm: 35},
  {t: B.backRows + 0.6, pos: [-2.5, 66, 0.5], look: [-2.5, 0, 0], mm: 35, up: [1, 0, 0]},
  {t: B.book + 0.4, pos: [-0.5, 64, 0.5], look: [-0.5, 0, 0], mm: 35, up: [1, 0, 0]},
  {t: B.book + 1.4, pos: [0.4, 1.2, 1.2], look: [0.2, -0.9, 1.5], mm: 24, up: [1, 0, 0]},
  {t: B.belt + 0.4, pos: [0.62, 0.12, 0.62], look: [0.18, -0.93, 1.5], mm: 24},
  {t: B.passengers + 1.0, pos: [0.55, 0.02, 0.72], look: [0.18, -0.93, 1.5], mm: 24},
  {t: B.end + 0.1, pos: [0.5, -0.05, 0.8], look: [0.18, -0.93, 1.5], mm: 24},
  // turn to the window and pull out through it
  {t: DUR_S - 1.25, pos: [0.25, -0.12, 1.25], look: [0.25, -0.1, 8], mm: 24},
  {t: DUR_S - 0.85, pos: [0.25, -0.12, 2.6], look: [0.0, 0.0, 0], mm: 30},
  {t: DUR_S, pos: [-2.5, -3.5, 98], look: [-2.5, 0.6, 0], mm: 35},
];
// Catmull-Rom through keys (velocity continuous), parameter linear in time within each segment
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
// glass glare as the camera crosses a window (0..1)
export const glare = (t: number) => hump(t, WIN_IN - 0.25, 0.45) + hump(t, DUR_S - 1.3, 0.45);
// row colour by distance from the pivot (same gradient as the seat shader)
export const rowColour = (d: number) => {
  const s = (a: number, b: number, x: number) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  const c = new Color(AMBER).lerp(new Color(ORANGE), s(2.5, 11, d));
  return c.lerp(new Color(CORAL), s(11, 17, d));
};
export const camAt = (t: number) => {
  let i = KEYS.findIndex((k) => k.t > t) - 1;
  if (i < 0) i = t < KEYS[0].t ? 0 : KEYS.length - 2;
  const a = KEYS[Math.max(i - 1, 0)], b = KEYS[i], c = KEYS[i + 1], d = KEYS[Math.min(i + 2, KEYS.length - 1)];
  const u = smooth((t - b.t) / (c.t - b.t)) * 0.5 + clamp01((t - b.t) / (c.t - b.t)) * 0.5;
  const v = (f: (k: Key) => V3) => [0, 1, 2].map((j) => cr(f(a)[j], f(b)[j], f(c)[j], f(d)[j], u)) as V3;
  const up = (k: Key) => k.up ?? [0, 1, 0];
  return {pos: v((k) => k.pos), look: v((k) => k.look), mm: lerp(b.mm, c.mm, u), up: v(up)};
};
