// What the Northern Lights really are: every time comes from the words (lib.ts cue()), so a new VO re-times the film.
// Five shots, hard cuts between worlds on the words (motion-principles "Hard cuts are allowed"):
//   HOOK   on the ground at night: green curtains over dark hills; amber solar-wind streaks pour down into them
//   SUN    space: the Sun sheds a stream of amber particles (the solar wind) toward a tiny Earth
//   FIELD  space: the stream hits an invisible bubble round a photoreal Earth and parts; cyan field lines light up;
//          some particles catch on the lines and slide down to the poles, where green crowns ignite
//   SLICE  low over the north polar night side: particles rain down along the lines and hit the air ~100 km up;
//          the curtain builds band by band beside a height ruler (oxygen green, red higher, nitrogen blue/purple)
//   END    continuous pull back from the curtain to the whole Earth, field lines and the stream still flowing in
// Colour language (one meaning for the whole film): AMBER = solar-wind particles (the lead); CYAN = field lines only;
// green / red / blue-purple appear only where particles hit the air (oxygen low, oxygen high, nitrogen).
import {cue, cueEnd, VO_END, clamp} from './lib';
import {interpolate, Easing} from 'remotion';

export const DUR_S = VO_END + 2.0;
export const AMBER = '#FFC46B', CYAN = '#5FD8FF', GREEN = '#5CFF8F', RED = '#FF4D5E', PURPLE = '#A97BFF';

const T = {
  hook: 0,
  wind: cue('a wind'),
  crash: cue('from the'),
  sky: cue('from the') + 0.8,
  sun: cue('The Sun blows'),
  tiny: cue('tiny'),
  charged: cue('charged bits', 0),
  call: cue('We call'),
  solar: cue('solar wind.'),
  earth: cue("Earth's magnetic"),
  pushes: cue('pushes most'),
  away: cue('it away.'),
  but: cue('But it'),
  steers: cue('shakes the'),
  rain: cue('rain down'),
  poles: cue('the poles.'),
  there: cue('There, about'),
  km: cue('kilometers up,'),
  slam: cue('slam into'),
  oxygen: cue('Oxygen glows'),
  green: cue('green.'),
  higher: cue('Higher up,'),
  red: cue('glows red.'),
  nitrogen: cue('Nitrogen adds'),
  blue: cue('blue and purple.'),
  so: cue('So every'),
  curtain: cue('curtain of'),
  lighting: cue('lit up'),
  end: cueEnd("by the Sun's wind."),
};
export {T as BEATS};
const pre = 0.1;
export const CUT_SUN = T.sun - pre, CUT_FIELD = T.earth - pre, CUT_SLICE = T.there - pre, CUT_END = T.so - pre;
export type Shot = 'hook' | 'sun' | 'field' | 'slice' | 'end';
export const shotAt = (t: number): Shot =>
  t < CUT_SUN ? 'hook' : t < CUT_FIELD ? 'sun' : t < CUT_SLICE ? 'field' : t < CUT_END ? 'slice' : 'end';

const io = Easing.bezier(0.45, 0, 0.55, 1);
export const ramp = (t: number, a: number, b: number, e = io) => interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
export const fade = (t: number, a: number, inD: number, b: number, outD: number) => Math.min(ramp(t, a, a + inD), 1 - ramp(t, b - outD, b));

// ---------- space: Earth radius 1 at the origin, Sun far off along -x (wind travels +x), dipole axis = +y
export const SUN_DIR: [number, number, number] = [-1, 0, 0];
export const NOSE = 2.4;                 // bubble nose (drawn ~4x closer than the real ~10 Earth radii)
export const OVAL_COLAT = 24;            // auroral oval, degrees from the pole (~66 deg latitude)
export const KM = 1 / 6371;              // space units per km
export const CURTAIN_KM: [number, number] = [85, 320];

// layer strengths 0..1 over time: the curtain's three gases, everywhere it is drawn
export const layers = (t: number) => {
  const s = shotAt(t);
  if (s === 'hook') return {g: 0.75 + 0.35 * ramp(t, T.crash, T.sky + 0.3), r: 0.55, n: 0.5, o: 1};
  if (s === 'sun') return {g: 0, r: 0, n: 0, o: 0};
  if (s === 'field') { const k = ramp(t, T.steers + 0.6, T.poles + 0.8); return {g: k, r: 0.3 * k, n: 0.2 * k, o: 1}; }
  if (s === 'slice') {
    return {g: 0.12 + 0.5 * ramp(t, T.slam, T.oxygen) + 0.5 * ramp(t, T.oxygen, T.green + 0.2),
      r: ramp(t, T.higher, T.red + 0.3), n: ramp(t, T.nitrogen, T.blue + 0.3), o: 1};
  }
  return {g: 1.12, r: 1, n: 1, o: 1};   // = the slice's last values: no pop on the pull back
};
export const fieldOn = (t: number) => {
  const s = shotAt(t);
  if (s === 'field') return ramp(t, T.earth + 0.3, T.pushes + 0.6);
  if (s === 'end') return ramp(t, T.curtain, T.lighting + 0.3);
  return 0;
};

// ---------- cameras
export type Cam = {pos: [number, number, number]; look: [number, number, number]; fov: number; roll: number};
const mix3 = (a: number[], b: number[], k: number) => a.map((x, i) => x + (b[i] - x) * k) as [number, number, number];
const camLerp = (a: Cam, b: Cam, k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k});

// ground (units km, eye at 2 m; curtains 150-400 km to the north = -z)
export const groundCam = (t: number) => {
  const k = ramp(t, 0, CUT_SUN, Easing.bezier(0.3, 0.1, 0.5, 1));
  return {pos: [0, 0.002 + 0.05 * k, -2 * k] as [number, number, number], pitch: 17 + 13 * k, yaw: -6 + 8 * k, fov: 66 - 12 * k};
};
// sun shot (Sun radius 1 at origin of its own group; wind goes +x)
const SUN_A: Cam = {pos: [2.4, 0.3, 7.6], look: [0.6, 0, 0], fov: 55, roll: 90};
const SUN_B: Cam = {pos: [5.6, 0.3, 8.6], look: [6.6, 0, 0], fov: 55, roll: 90};
// field shot (Earth); roll tilts the Sun-Earth line so it climbs the 9:16 frame
const FLD_A: Cam = {pos: [1.6, 3.2, 12.5], look: [0.4, 0.4, 0], fov: 44, roll: 40};
const FLD_B: Cam = {pos: [0.9, 3.6, 7.2], look: [0.2, 0.75, 0], fov: 44, roll: 32};
// slice: low over the north polar night side (camera at colat 31 deg, toward +x), facing the pole
export const SLICE_LON = 0; // radians round y from +x
const sp = (colat: number, r: number, lon = SLICE_LON): [number, number, number] => {
  const c = (colat * Math.PI) / 180; return [r * Math.sin(c) * Math.cos(lon), r * Math.cos(c), r * Math.sin(c) * Math.sin(lon)];
};
export const SLICE_A: Cam = {pos: sp(33.6, 1.024, SLICE_LON - 0.05), look: sp(OVAL_COLAT, 1.036, SLICE_LON + 0.02), fov: 42, roll: 0};
export const SLICE_B: Cam = {pos: sp(33.0, 1.022, SLICE_LON + 0.07), look: sp(OVAL_COLAT, 1.036, SLICE_LON + 0.1), fov: 42, roll: 0};
const END_B: Cam = {pos: [6.5, 4.6, 9.5], look: [0.3, 0.5, 0], fov: 44, roll: 28};

export const camAt = (t: number): Cam => {
  const s = shotAt(t);
  if (s === 'sun') return camLerp(SUN_A, SUN_B, ramp(t, CUT_SUN, CUT_FIELD, (x) => x));
  if (s === 'field') return camLerp(FLD_A, FLD_B, ramp(t, T.but - 0.2, CUT_SLICE, Easing.bezier(0.4, 0, 0.6, 1)));
  if (s === 'slice') return camLerp(SLICE_A, SLICE_B, ramp(t, CUT_SLICE, CUT_END, (x) => x));
  // end: pull back anchored on Earth, distance interpolated in log space
  const k = ramp(t, CUT_END + 0.15, DUR_S - 0.3, Easing.bezier(0.55, 0, 0.35, 1));
  const a = SLICE_B, b = END_B;
  const ra = Math.hypot(...a.pos), rb = Math.hypot(...b.pos), r = ra * Math.pow(rb / ra, k);
  const d = mix3(a.pos.map((x) => x / ra), b.pos.map((x) => x / rb), k); const dl = Math.hypot(...d);
  const kl = ramp(t, CUT_END + 0.15, DUR_S - 0.6, Easing.bezier(0.3, 0, 0.3, 1));
  return {pos: d.map((x) => (x / dl) * r) as [number, number, number], look: mix3(a.look, b.look, kl), fov: a.fov + (b.fov - a.fov) * k, roll: b.roll * kl};
};

// ---------- overlay tags (0..1 opacity)
export const hookTag = (t: number) => fade(t, T.wind - 0.1, 0.3, CUT_SUN - 0.3, 0.35);
export const windTag = (t: number) => fade(t, T.solar - 0.05, 0.3, CUT_FIELD, 0.25);
export const shieldTag = (t: number) => fade(t, T.pushes, 0.3, T.but, 0.3);
export const shake = (t: number) => fade(t, T.steers - 0.15, 0.2, T.rain + 0.7, 0.5);
export const polesTag = (t: number) => fade(t, T.poles - 0.1, 0.3, CUT_SLICE, 0.2);
export const rulerOn = (t: number) => fade(t, T.there + 0.2, 0.4, CUT_END + 0.5, 0.5);
export const oxyTag = (t: number) => fade(t, T.oxygen, 0.3, CUT_END + 0.4, 0.4);
export const redTag = (t: number) => fade(t, T.higher + 0.1, 0.3, CUT_END + 0.4, 0.4);
export const nitTag = (t: number) => fade(t, T.nitrogen, 0.3, CUT_END + 0.4, 0.4);
export const endTag = (t: number) => ramp(t, T.lighting, T.lighting + 0.4);
