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
  -0.6 * hump(t, B.jolt, 0.5) + 0.8 * hump(t, B.bump, 1.3) + 2.0 * hump(t, B.bounce - 0.35, 1.1); // the bounce: all three cups rise and fall together
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
export const glass = (t: number) => ramp(t, B.watch + 0.6, B.watch + 1.8) * (1 - ramp(t, CUT_DIVE - 0.04, CUT_DIVE));

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
// trails start before the bounce, so the bounce draws three equal strokes and the rock then splits them
export const trailOn = (t: number) => ramp(t, B.bounce - 0.75, B.bounce - 0.4) * (1 - ramp(t, B.backRows - 0.8, B.backRows));
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
export const rowSpread = (t: number) => 22 * ramp(t, B.farther, B.farther + 2.2) * (1 - ramp(t, CUT_DIVE - 0.04, CUT_DIVE));
export const distLines = (t: number) => ramp(t, B.farther + 0.6, B.farther + 1.6) * (1 - ramp(t, B.backRows - 0.6, B.backRows));
export const tailPulse = (t: number) => hump(t, B.backRows, 1.0);
export const wingLift = (t: number) => ramp(t, B.overWing, B.overWing + 0.6) * (1 - ramp(t, CUT_DIVE - 0.04, CUT_DIVE));
// "balance point" label at the pivot while it glows and the plane sits on the wedge (mute test: the wedge was unclear)
export const balanceLabel = (t: number) => ramp(t, B.wings - 0.1, B.wings + 0.4) * (1 - ramp(t, B.farther - 0.2, B.farther + 0.3));
export const labelOn = (t: number) => ramp(t, B.overWing + 0.4, B.overWing + 1.0) * (1 - ramp(t, CUT_DIVE - 0.04, CUT_DIVE));

// ---------- seatbelt (hero seat, row over the wing, right window seat)
// the middle cup's glow pulses on "moves least"
export const middlePulse = (t: number) => hump(t, B.least - 0.25, 1.3);
export const buckle = (t: number) => ramp(t, B.belt - 0.1, B.belt + 0.35);

// ---------- exposure and clouds
export const cloudShift = (t: number) => t * 55; // metres the deck has scrolled (plane flies +X)

// ---------- camera keys: [t, pos, look, mm, up]. A key with cut: true starts a new shot at its t.
// v3 (Matthew, 2026-11-18: "we dont need a single shot in this one"): the four hull crossings (window in, roof out,
// the aisle dive, window out) glitched in v1 and v2, so they are hard cuts on the words instead of fly-throughs.
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; up?: V3; cut?: boolean};
export const CUT_IN = cue('But watch') - 0.12;   // exterior -> cabin
export const CUT_ROOF = B.front - 0.15;          // cabin -> exterior as the front cup appears
export const CUT_DIVE = cue('and keep') - 0.15;  // seat map -> the seat (the map holds through "Book a seat over the wing")
export const CUT_OUT = B.end + 0.7;              // the seat -> the plane from outside (bookends the opening)
export const CUTS = [CUT_IN, CUT_ROOF, CUT_DIVE, CUT_OUT];
const CABIN_LOOK: V3 = [-16.64, -0.64, 0.42];
const LAP_LOOK: V3 = [0.25, -0.92, 1.5];
export const KEYS: Key[] = [
  // 1 exterior: push in toward the back window
  {t: 0, pos: [-2.5, -3.5, 98], look: [-2.5, 0.6, 0], mm: 35},
  {t: CUT_IN, pos: [-13, -0.5, 16], look: [-16, -0.2, 0], mm: 35},
  // 2 cabin: the tray cup, slow drift
  {t: CUT_IN, cut: true, pos: [-17.6, 0.0, 0.24], look: CABIN_LOOK, mm: 24},
  {t: CUT_ROOF, pos: [-17.42, -0.1, 0.3], look: CABIN_LOOK, mm: 24},
  // 3 exterior: the cups, the seesaw, the wedge, the crane to the seat map
  {t: CUT_ROOF, cut: true, pos: [2, 3.4, 72], look: [2, 3.0, 0], mm: 35},
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
  {t: CUT_DIVE, pos: [-0.5, 61, 0.5], look: [-0.5, 0, 0], mm: 35, up: [1, 0, 0]},
  // 4 the seat in the wing row, looking at the lap (forward = top of frame), settling on the belt
  {t: CUT_DIVE, cut: true, pos: [0.05, 0.45, 0.62], look: LAP_LOOK, mm: 24, up: [1, 0, 0]},
  {t: B.belt + 0.4, pos: [0.05, 0.22, 0.95], look: LAP_LOOK, mm: 24, up: [1, 0, 0]},
  {t: CUT_OUT, pos: [0.08, 0.12, 1.0], look: LAP_LOOK, mm: 24, up: [1, 0, 0]},
  // 5 exterior: slow pull back, the opening frame
  {t: CUT_OUT, cut: true, pos: [-2.5, -3.2, 86], look: [-2.5, 0.6, 0], mm: 35},
  {t: DUR_S, pos: [-2.5, -3.5, 98], look: [-2.5, 0.6, 0], mm: 35},
];
// Catmull-Rom through keys (velocity continuous), parameter linear in time within each segment
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
// row colour by distance from the pivot (same gradient as the seat shader)
export const rowColour = (d: number) => {
  const s = (a: number, b: number, x: number) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  const c = new Color(AMBER).lerp(new Color(ORANGE), s(2.5, 11, d));
  return c.lerp(new Color(CORAL), s(11, 17, d));
};
export const camAt = (t: number) => {
  // the shot holding t: from the last cut key at or before t to the key before the next cut
  let s0 = 0;
  KEYS.forEach((k, i) => { if (k.cut && k.t <= t) s0 = i; });
  let s1 = KEYS.findIndex((k, i) => i > s0 && k.cut); if (s1 < 0) s1 = KEYS.length;
  const S = KEYS.slice(s0, s1);
  let i = S.findIndex((k) => k.t > t) - 1;
  if (i < 0) i = t < S[0].t ? 0 : S.length - 2;
  const a = S[Math.max(i - 1, 0)], b = S[i], c = S[i + 1], d = S[Math.min(i + 2, S.length - 1)];
  const u = smooth((t - b.t) / (c.t - b.t)) * 0.5 + clamp01((t - b.t) / (c.t - b.t)) * 0.5;
  const v = (f: (k: Key) => V3) => [0, 1, 2].map((j) => cr(f(a)[j], f(b)[j], f(c)[j], f(d)[j], u)) as V3;
  const up = (k: Key) => k.up ?? [0, 1, 0];
  return {pos: v((k) => k.pos), look: v((k) => k.look), mm: lerp(b.mm, c.mm, u), up: v(up)};
};
