// Every state of the film as a pure function of time t (seconds), cued from the spoken words, so a new voiceover
// re-times the film. One world: a road at the edge of a field, and the ground under it sliced open at z = 0 (the cut
// face). One hard cut: to the drone view after the collapse (CUT_DRONE).
import {cue, VO_END} from './lib';

export const DUR_S = VO_END + 2.2;

// ---------- colours (fixed meanings)
export const LIME = '#B8F25C', RAIN = '#7CC8FF', AMBER = '#FFB547', CORAL = '#FF5A4E', GLASS = '#EAF6FF';

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- beats
export const B = {
  underneath: cue('But underneath,'), hollow: cue("it's hollow."),
  rain: cue('It starts'), soaks: cue('Rain soaks'), soil: cue('and soil,'), acid: cue('weak acid.'),
  deep: cue('Under the dirt,'), limestone: cue('into limestone,'), cave: cue('cracks and holes.'),
  clay: cue('The sticky'), arch: cue('an arch,'), nothing: cue('empty space underneath.'),
  grains: cue('But bit'), crumbles: cue('crumbles down'), climbs: cue('climbs upward.'),
  upTop: cue('Up top,'), wrong: cue('looks wrong.'),
  until: cue('Until the'), thin: cue('too thin'), weight: cue('the weight.'), drops: cue('drops all'),
  why: cue("That's why"), overnight: cue('overnight.'), years: cue('for months,'),
  end: VO_END,
};
export const CUT_DRONE = B.why - 0.12;

// ---------- the world (metres). Cut face at z = 0; ground top y = 0; the road along x, z -7.5..-0.5.
export const ROAD_Z: [number, number] = [-7.5, -0.5];
export const COVER_BOTTOM = -11, CAVE_Y = -12.4; // the limestone opening: widened cracks just under the clay
export const VOID_R = 4.5;        // half-width of the void in the cover, and the plug's radius
export const ROOF_LAST = -1.0;    // the void's top just before the collapse

// ---------- the scan line (hook): the ground in front of the cut vanishes from z = 0 toward and past the camera
export const scanZ = (t: number) => -0.5 + 75 * ramp(t, B.underneath - 0.05, B.underneath + 1.5) ** 1.6;

// ---------- geologic progress
// the cave in the limestone: full in the hook; rewinds to nothing as the rain begins; grows with "eats ... a cave"
export const caveK = (t: number) => {
  if (t < B.rain - 0.3) return 1;
  if (t < B.deep) return 1 - ramp(t, B.rain - 0.3, B.rain + 0.6);
  return ramp(t, B.limestone - 0.2, B.cave + 0.5);
};
// the void's top in the cover (y). -11 = no void. Hook: high (-2.6); rewinds; small dome for the arch; climbs.
export const domeTop = (t: number) => {
  if (t < B.rain - 0.3) return -2.6;
  if (t < B.clay) return lerp(-2.6, COVER_BOTTOM, ramp(t, B.rain - 0.3, B.rain + 0.5));
  if (t < B.grains) return lerp(COVER_BOTTOM, -8.6, ramp(t, B.clay, B.arch + 0.3));
  if (t < B.upTop) return lerp(-8.6, -3.0, ramp(t, B.grains + 0.2, B.climbs + 0.8));
  return lerp(-3.0, ROOF_LAST, ramp(t, B.upTop - 0.2, B.thin));
};
// height of the rubble cone on the cave floor: grows with the void volume (sand that fell)
export const pileH = (t: number) => 0.18 * (domeTop(t) - COVER_BOTTOM);
// rain and acid
export const rainOn = (t: number) => ramp(t, B.rain - 0.2, B.rain + 0.4) * (1 - ramp(t, B.cave, B.cave + 0.8));
export const co2On = (t: number) => ramp(t, B.soaks, B.soaks + 0.6) * (1 - ramp(t, B.deep + 0.5, B.deep + 1.2));
export const acidTint = (t: number) => ramp(t, B.soil, B.acid + 0.3); // drops turn lime
export const seepOn = (t: number) => ramp(t, B.soaks + 0.5, B.soaks + 1.2) * (1 - ramp(t, B.cave + 0.4, B.cave + 1.2));
export const dissolveGlow = (t: number) => ramp(t, B.limestone - 0.3, B.limestone + 0.3) * (1 - ramp(t, B.cave + 0.6, B.cave + 1.4));
export const yearsTag = (t: number) => ramp(t, B.limestone - 0.3, B.limestone) * (1 - ramp(t, B.clay - 0.3, B.clay + 0.1));
export const acidTag = (t: number) => ramp(t, B.acid - 0.2, B.acid + 0.2) * (1 - ramp(t, B.deep + 0.3, B.deep + 0.7));
// the arch: stone blocks trace the dome, then melt into grains
export const archOn = (t: number) => ramp(t, B.arch - 0.5, B.arch + 0.1) * (1 - ramp(t, B.grains, B.grains + 0.7));
// grains falling from the dome's ceiling
export const grainsOn = (t: number) => ramp(t, B.grains - 0.1, B.grains + 0.4) * (1 - ramp(t, B.thin + 0.2, B.drops));
// the car: drives through in the hook; drives in and parks over the void on "Up top"; falls with the plug
export const CAR_SPEED = 9;
export const carX = (t: number) => {
  if (t < B.rain) return -16 + CAR_SPEED * t * 0.75;
  const park = B.upTop + 1.4, a = park - 1.9; // decelerates to a stop at x = 0
  if (t < a) return -40;
  const u = clamp01((t - a) / (park - a));
  return lerp(-17, 0, 1 - (1 - u) ** 2);
};
export const carOn = (t: number) => (t < B.rain - 0.1 || t > B.upTop - 1.0 ? 1 : 0);
export const cracks = (t: number) => ramp(t, B.until + 0.2, B.drops - 0.05);
// the collapse: the plug falls 16 m (ease-in, ~gravity) in 1.3 s
// free fall: 9 m takes sqrt(2 * 9 / 9.81) = 1.35 s (fact check: 16 m in 1.1 s was too fast)
export const FALL_S = 1.35;
export const collapse = (t: number) => clamp01((t - B.drops) / FALL_S);
export const PLUG_FALL = 9;
export const plugDrop = (t: number) => PLUG_FALL * collapse(t) ** 2;
export const dust = (t: number) => (t < B.drops ? 0 : hump(t, B.drops + 0.6, 3.5));
export const shake = (t: number) => (t < B.drops + 0.9 ? 0 : Math.exp(-(t - B.drops - 0.9) * 4) * Math.sin((t - B.drops) * 70));
// the drone shot's bar: years of hollowing vs one second
export const barOn = (t: number) => ramp(t, B.overnight - 0.2, B.overnight + 0.3);
export const barYears = (t: number) => ramp(t, B.years - 0.6, B.years + 0.5);

// ---------- camera keys
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; up?: V3; cut?: boolean};
export const KEYS: Key[] = [
  // 1 street level, the sedan crosses; the ground opens and the camera cranes back to see road above cave
  {t: 0, pos: [-3, 1.7, 15], look: [0, 1.0, -4], mm: 35},
  {t: B.underneath, pos: [-2, 1.4, 17], look: [0, 0.2, -4], mm: 35},
  {t: B.hollow + 0.9, pos: [0, -7, 46], look: [0, -9, 0], mm: 35},
  // 2 rain: push in on the top of the cut
  {t: B.soaks + 0.4, pos: [1, -3.5, 26], look: [0, -5, 0], mm: 35},
  {t: B.acid + 0.4, pos: [0, -5, 24], look: [0, -7, 0], mm: 35},
  // 3 down the face to the limestone
  {t: B.cave + 0.3, pos: [-1, -11, 22], look: [0, -12.5, 0], mm: 35},
  // 4 up to the dome
  {t: B.nothing, pos: [1, -9, 22], look: [0, -9.5, 0], mm: 35},
  // 5 pull back: road to cave
  {t: B.climbs + 0.8, pos: [0, -8, 42], look: [0, -9.5, 0], mm: 35},
  // 6 road level, the cut face below: split frame at the ground line
  {t: B.wrong + 0.3, pos: [-1, 2.2, 24], look: [0, -2.5, -2], mm: 35},
  // 7 wider for the collapse
  {t: B.drops, pos: [0, 0.5, 32], look: [0, -4.5, -1], mm: 35},
  {t: CUT_DRONE, pos: [0, -1.5, 36], look: [0, -7, -1], mm: 35},
  // 8 drone view from above-front, slow rise
  {t: CUT_DRONE, cut: true, pos: [6, 17, 15], look: [0, -3, -3], mm: 35},
  {t: DUR_S, pos: [7, 22, 19], look: [0, -3.5, -3], mm: 35},
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
  const up = (k: Key) => k.up ?? [0, 1, 0];
  const sh = shake(t) * 0.25;
  const pos = v((k) => k.pos); pos[1] += sh; pos[0] += sh * 0.6;
  return {pos, look: v((k) => k.look), mm: lerp(b.mm, c.mm, u), up: v(up)};
};
