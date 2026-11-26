// Why the sky is blue: every time comes from the words (lib.ts cue()), so a new VO re-times the film.
// Five shots, hard cuts between worlds on the words (motion-principles "Hard cuts are allowed"):
//   HOOK    space, low over Earth's limb: a white braid of sunlight crosses the air and splits into its colours
//   MACRO   inside the air: drifting gas molecules; the braid's photons ricochet off them, blue ~5x more than red
//   SKY     on the ground at midday: scattered blue streaks arrive from every part of the sky
//   SUNSET  space, side-on: a short noon path vs a long sunset path through the air; blue peels off the long one
//   DUSK    on the ground at sunset: only red and orange streaks arrive from the low Sun
//   END     space: pull back to the whole planet, blue rim on the day side, orange band on the terminator
// Colour language (one meaning for the whole film): white = mixed sunlight; BLUE (the accent, brightest) = light
// that was scattered; red/orange = light that kept going straight.
import {cue, cueEnd, VO_END, clamp} from './lib';
import {interpolate, Easing} from 'remotion';

export const DUR_S = VO_END + 2.2;
export const BLUE = '#4D9BFF', RED = '#FF4B3A', ORANGE = '#FF9A2E', GREEN = '#7DFF8A', WHITE = '#FFFFFF', GLASS = '#E8F1FF';
export const COLS = [RED, ORANGE, GREEN, BLUE];   // photon colours, long to short wavelength
export const NM = [700, 620, 530, 470];   // blue at 470 nm: (700/470)^4 = 4.9x red (fact check: 450 nm would be 5.9x)
// Rayleigh: scattering per molecule ~ 1/wavelength^4, relative to blue
export const REL = NM.map((n) => Math.pow(470 / n, 4)); // red 0.20 (blue ~4.9x red), orange 0.33, green 0.62, blue 1

const T = {
  hook: 0,
  every: cue('every color.'),
  choose: cue('choose blue?', 0),
  answer: cue('The answer'),
  molecules: cue('gas molecules.'),
  hits: cue('When sunlight'),
  bounce: cue('bounce it'),
  but: cue('But they'),
  five: cue('five times'),
  red: cue('Red mostly'),
  straight: cue('straight.'),
  blue: cue('Blue gets scattered'),
  across: cue('all across'),
  wherever: cue('So wherever'),
  look: cue('look up,'),
  coming: cue('coming at'),
  sunset: cue('At sunset,'),
  more: cue('much more'),
  reach: cue('to reach'),
  along: cue('Along the'),
  aside: cue('bounced aside.'),
  only: cue('Only the'),
  reds: cue('reds and'),
  sky: cue("The sky doesn't"),
  scatters: cue('scatters it'),
  end: cueEnd('scatters it to you.'),
};
export {T as BEATS};
const pre = 0.1;
export const CUT_MACRO = T.answer - pre, CUT_SKY = T.wherever - pre, CUT_SUNSET = T.sunset - pre, CUT_DUSK = T.only - pre, CUT_END = T.sky - pre;
export type Shot = 'hook' | 'macro' | 'sky' | 'sunset' | 'dusk' | 'end';
export const shotAt = (t: number): Shot =>
  t < CUT_MACRO ? 'hook' : t < CUT_SKY ? 'macro' : t < CUT_SUNSET ? 'sky' : t < CUT_DUSK ? 'sunset' : t < CUT_END ? 'dusk' : 'end';
export const isSpace = (s: Shot) => s === 'hook' || s === 'sunset' || s === 'end';

const io = Easing.bezier(0.45, 0, 0.55, 1);
export const ramp = (t: number, a: number, b: number, e = io) => interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
export const fade = (t: number, a: number, inD: number, b: number, outD: number) => Math.min(ramp(t, a, a + inD), 1 - ramp(t, b - outD, b));

// ---------- space: Sun far off along -x; Earth radius 1 at the origin; the air drawn ~4x thicker than real
export const SUN_DIR: [number, number, number] = [-1, 0.0, 0.0];
export const AIR_TOP = 1.06;
// hook beam: grazes the top of the air, left to right, a little in front of the planet
export const HOOK_Y = 1.028, HOOK_Z = 0.05;
// the sunset pass: the noon ray ends at the sub-solar point (-1,0,0); the sunset ray skims to the terminator (0,1,0)
export const NOON_P: [number, number, number] = [-1, 0, 0], DUSK_P: [number, number, number] = [0, 1, 0];

export type Cam = {pos: [number, number, number]; look: [number, number, number]; fov: number};
const mix3 = (a: number[], b: number[], k: number) => a.map((x, i) => x + (b[i] - x) * k) as [number, number, number];
const camLerp = (a: Cam, b: Cam, k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: a.fov + (b.fov - a.fov) * k});

const HOOK_A: Cam = {pos: [-0.55, 1.13, 0.62], look: [0.05, 1.0, -0.1], fov: 46};
const HOOK_B: Cam = {pos: [-0.2, 1.1, 0.5], look: [0.45, 1.01, -0.05], fov: 42};
const MAC_A: Cam = {pos: [-3.2, 0.9, 5.2], look: [0.0, 0.0, 0], fov: 44};
const MAC_B: Cam = {pos: [0.4, 0.5, 3.3], look: [1.6, 0.0, 0], fov: 46};
const MAC_C: Cam = {pos: [2.8, 1.2, 6.8], look: [3.0, 0.2, 0], fov: 50};
const SUN_A: Cam = {pos: [-0.5, 0.5, 3.5], look: [-0.45, 0.66, 0], fov: 42};
const SUN_B: Cam = {pos: [-0.38, 0.95, 1.25], look: [-0.22, 0.97, 0], fov: 42};
const END_A: Cam = {pos: [-0.35, 0.9, 1.6], look: [-0.2, 0.85, 0], fov: 42};
const END_B: Cam = {pos: [1.0, 0.5, 5.6], look: [-0.05, 0.12, 0], fov: 40};

export const camAt = (t: number): Cam => {
  const s = shotAt(t);
  if (s === 'hook') return camLerp(HOOK_A, HOOK_B, ramp(t, 0, CUT_MACRO, Easing.bezier(0.3, 0.1, 0.6, 1)));
  if (s === 'macro') {
    const k1 = ramp(t, CUT_MACRO, T.red + 0.3), k2 = ramp(t, T.red, CUT_SKY);
    return camLerp(camLerp(MAC_A, MAC_B, k1), MAC_C, k2);
  }
  if (s === 'sunset') return camLerp(SUN_A, SUN_B, ramp(t, T.along - 0.6, CUT_DUSK));
  if (s === 'end') return camLerp(END_A, END_B, ramp(t, CUT_END, DUR_S - 0.4, Easing.bezier(0.25, 0.1, 0.3, 1)));
  return {pos: [0, 0, 0], look: [0, 0, -1], fov: 60}; // ground shots set their own camera
};

// ground cameras: yaw (deg, 0 = toward -z) and pitch (deg up), eye at 1.7 m
export const groundCam = (t: number) => {
  const s = shotAt(t);
  if (s === 'sky') {
    const k = ramp(t, CUT_SKY, CUT_SUNSET, (x) => x);
    return {yaw: -18 + 40 * k, pitch: 24 + 8 * Math.sin(k * Math.PI), fov: 62};
  }
  const k = ramp(t, CUT_DUSK, CUT_END, (x) => x);
  return {yaw: -6 + 8 * k, pitch: 23 + 2 * k, fov: 55};
};
export const SKY_SUN = {elevation: 55, azimuth: 15};
export const DUSK_SUN = {elevation: 1.2, azimuth: 180}; // azimuth 180 = toward -z, straight ahead

// ---------- overlay tags (0..1 opacity)
export const hookCard = (t: number) => 1 - ramp(t, T.answer - 0.45, CUT_MACRO);
export const tallyOn = (t: number) => fade(t, T.five - 0.4, 0.3, CUT_SKY, 0.25);
export const fiveTag = (t: number) => fade(t, T.five, 0.25, CUT_SKY, 0.25);
export const noonTag = (t: number) => fade(t, T.sunset + 0.5, 0.3, T.along, 0.4);
export const duskTag = (t: number) => fade(t, T.more, 0.3, CUT_DUSK, 0.2);
export const endTag = (t: number) => ramp(t, T.scatters, T.scatters + 0.4);
