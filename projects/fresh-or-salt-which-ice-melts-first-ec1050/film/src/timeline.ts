// Fresh or salt: which ice melts first. Every time comes from the words (lib.ts cue()), so a new VO re-times the film.
// One world: a kitchen counter (units: centimetres) with two glasses of room-temperature water, FRESH on the left,
// SALT on the right, plus a cutaway to an icy road for "salt melts ice on roads". Hard cuts on the words.
// Colour language: BLUE = cold meltwater (dyed; the lead once the explanation starts); AMBER = warmer water moving;
// the ice is clear white; GOLD marks the winner. Each glass keeps its side for the whole film.
import {cue, cueEnd, VO_END, clamp} from './lib';
import {interpolate, Easing} from 'remotion';

export const DUR_S = VO_END + 1.4;
export const BLUE = '#3C8CFF', AMBER = '#FFA43A', GOLD = '#FFD35A', WHITE = '#FFFFFF';

// ---------- glasses (cm): y up from the counter top, glass centres on x, z toward the camera
export const GR = 3.6, GWALL = 0.22, GH = 12.5, GBASE = 0.9;   // outer radius, wall, height, base thickness
export const RIN = GR - GWALL;
export const WH = GBASE + 8.6;                                  // water surface height
export const GX = {fresh: -4.4, salt: 4.4};
export const CUBE = 2.9;                                        // ice cube side
export const ROAD_O: [number, number, number] = [400, 0, 0];   // the road cutaway sits far from the kitchen

const T = {
  two: cue('Two ice cubes,'),
  which: cue('Which melts first?'),
  pause: cue('Pause and guess.'),
  most: cue('Most people pick salt,'),
  because: cue('because salt melts'),
  roads: cue('on roads.'),
  but: cue('But the cube'),
  first: cue('melts first.', 1),
  watch: cue('Watch the blue'),
  cold: cue('Cold water is heavier'),
  sinks: cue('so it sinks.'),
  warm: cue('Warmer water comes up'),
  faster: cue('melts the cube faster.'),
  inSalt: cue('In salt water,'),
  lighter: cue('is lighter than'),
  floats: cue('So it floats'),
  blanket: cue('cold blanket.'),
  soSalt: cue('So salt does not'),
  tryIt: cue('Try it at home'),
  end: cueEnd('with two glasses.'),
};
export {T as BEATS};
const pre = 0.08;
export type Shot = 'hook' | 'guess' | 'road' | 'race' | 'fresh' | 'salt' | 'end';
export const CUT = {guess: T.pause - pre, road: T.because - pre, race: T.but - pre, fresh: T.watch - pre, salt: T.inSalt - pre, end: T.soSalt - pre};
const SHOTS: [number, Shot][] = [[CUT.guess, 'hook'], [CUT.road, 'guess'], [CUT.race, 'road'], [CUT.fresh, 'race'], [CUT.salt, 'fresh'], [CUT.end, 'salt'], [1e9, 'end']];
export const shotAt = (t: number): Shot => SHOTS.find(([c]) => t < c)![1];
export const shotStart = (s: Shot) => (s === 'hook' ? 0 : CUT[s]);
export const shotEnd = (s: Shot) => { const i = SHOTS.findIndex(([, n]) => n === s); return Math.min(SHOTS[i][0], DUR_S); };

export const io = Easing.bezier(0.45, 0, 0.55, 1);
export const lin = (x: number) => x;
export const ramp = (t: number, a: number, b: number, e = io) => interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
export const fade = (t: number, a: number, inD: number, b: number, outD: number) => Math.min(ramp(t, a, a + inD), 1 - ramp(t, b - outD, b));
const L = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- cameras
export type Cam = {pos: [number, number, number]; look: [number, number, number]; fov: number};
const mix3 = (a: number[], b: number[], k: number) => a.map((x, i) => x + (b[i] - x) * k) as [number, number, number];
export const camLerp = (a: Cam, b: Cam, k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: a.fov + (b.fov - a.fov) * k});
const move = (t: number, s: Shot, a: Cam, b: Cam, e = Easing.bezier(0.33, 0, 0.3, 1)) => camLerp(a, b, ramp(t, shotStart(s), shotEnd(s) + 0.3, e));
const R = ROAD_O;
export const camAt = (t: number): Cam => {
  const s = shotAt(t);
  switch (s) {
    case 'hook': return move(t, s, {pos: [-16, 19, 68], look: [0, 6.2, 0], fov: 34}, {pos: [-2, 13, 56], look: [0, 6.0, 0], fov: 34});
    case 'guess': return move(t, s, {pos: [4, 11, 58], look: [0.5, 6.0, 0], fov: 34}, {pos: [16, 10.5, 52], look: [1.4, 5.8, 0], fov: 34});
    case 'road': return move(t, s, {pos: [R[0] - 8, 12, 24], look: [R[0], 0, 0], fov: 38}, {pos: [R[0] + 1, 6, 14], look: [R[0], 0, 0], fov: 38});
    case 'race': return move(t, s, {pos: [-6, 11, 63], look: [0, 5.8, 0], fov: 34}, {pos: [5, 10, 56], look: [0, 5.8, 0], fov: 34});
    case 'fresh': return move(t, s, {pos: [GX.fresh - 14, 11, 31], look: [GX.fresh, 6.6, 0], fov: 38}, {pos: [GX.fresh + 12, 7.5, 30], look: [GX.fresh, 6.2, 0], fov: 38}, lin);
    case 'salt': return move(t, s, {pos: [GX.salt + 14, 12, 31], look: [GX.salt, 7.0, 0], fov: 38}, {pos: [GX.salt - 12, 10, 30], look: [GX.salt, 7.2, 0], fov: 38}, lin);
    case 'end': return move(t, s, {pos: [-9, 9, 50], look: [0, 6.0, 0], fov: 34}, {pos: [1, 13, 62], look: [0, 5.8, 0], fov: 34}, Easing.bezier(0.45, 0, 0.35, 1));
  }
};

// ---------- the ice: drop at the hook, then melt progress p (0 = whole cube, 1 = gone) per glass
export const DROP = {fresh: T.two + 0.55, salt: T.two + 0.85};
export const dropY = (t: number, g: 'fresh' | 'salt') => {   // cube centre height above the water line rest position
  const s = shotAt(t); if (s !== 'hook') return 0;
  const k = t - DROP[g]; if (k < -0.5) return 9;
  const hit = 0.32;
  if (k < hit) return 9 - 9 * Math.min(1, (k + 0.5) / (hit + 0.5)) ** 2;
  const a = k - hit; return -1.6 * Math.exp(-a * 3.2) * Math.sin(a * 11);
};
export const splash = (t: number, g: 'fresh' | 'salt') => (shotAt(t) === 'hook' ? t - DROP[g] - 0.32 : -1);
// progress: the race is a time-lapse; the fresh and salt shots replay the melt up close
export const meltP = (t: number, g: 'fresh' | 'salt'): number => {
  const s = shotAt(t);
  const k = g === 'fresh' ? 1 : 0.5;   // salt melts about half as fast (sources: about 2x the time)
  if (s === 'race') return k * ramp(t, CUT.race + 0.3, T.first + 0.45, Easing.bezier(0.3, 0, 0.6, 1));
  if (s === 'fresh') return g === 'fresh' ? L(0.06, 0.72, ramp(t, shotStart(s), shotEnd(s), lin)) : 0.36 * ramp(t, shotStart(s), shotEnd(s), lin);
  if (s === 'salt') return g === 'salt' ? L(0.12, 0.45, ramp(t, shotStart(s), shotEnd(s), lin)) : 0.8;
  if (s === 'end') return g === 'fresh' ? 1 : L(0.47, 0.5, ramp(t, shotStart(s), shotEnd(s), lin));
  return 0;
};
export const cubeScale = (p: number) => Math.max(0, 1 - p) ** 0.7 * (p >= 0.985 ? 0 : 1);
// warm water flow visible: fresh glass from "Warmer water", salt glass (held below the layer) from "In salt water"
export const warmOn = (t: number, g: 'fresh' | 'salt') => {
  const s = shotAt(t);
  if (g === 'fresh') return s === 'fresh' ? ramp(t, T.warm - 0.2, T.warm + 0.5) : 0;
  return s === 'salt' ? ramp(t, T.lighter - 0.2, T.lighter + 0.6) : 0;
};
// minutes shown on the race clock (no number is claimed: the clock only says time passes)
export const raceClock = (t: number) => ramp(t, CUT.race + 0.3, T.first + 0.45, Easing.bezier(0.3, 0, 0.6, 1));
// road: salt grains fall and wet spots spread from them
export const ROAD_SALT_T = CUT.road + 0.05;
// salt poured into the SALT glass on the word "salt" in the hook
export const POUR = cue('and salt water.') + 0.2;
