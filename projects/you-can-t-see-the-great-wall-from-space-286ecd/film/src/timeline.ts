// You can't see the Great Wall from space: every time comes from the words (lib.ts cue()), so a new VO re-times it.
// Seven shots in three worlds, hard cuts between worlds on the words (motion-principles "Hard cuts are allowed"):
//   HOOK    ground: the wall on the Jinshanling ridges, glowing amber; the camera cranes up off the wall toward the sky
//   LONG    orbit: a cyan search ring hunts over China ("Astronauts say no"), then the wall draws itself as an amber
//           ribbon from the desert to the sea, a counter running to 21,196 km; branches sprout on "branches"
//   THIN    ground: beside the wall; a car drives along the top (as wide as a road); then the wall's amber drains into
//           the hills' colours while the camera climbs away and the wall vanishes into the slopes
//   STATION orbit: the Earth from the side; the Space Station (cyan) rides its orbit 400 km up, a bracket measures it
//   PENCIL  a pencil on a football pitch; the camera pulls back 400 m and the pencil disappears
//   SEARCH  orbit, the station's view of China: the cyan ring hunts and finds nothing; then night sweeps in from the
//           east and the cities light up
//   END     ground: low under a watchtower; the wall looms (huge), climbing the ridge
// Colour language: AMBER = the wall (and the pencil that stands in for it); CYAN = the station and its eye (the search
// ring, the 400 km bracket); warm white = city lights.
import {cue, cueEnd, VO_END, clamp} from './lib';
import {interpolate, Easing} from 'remotion';

export const DUR_S = VO_END + 2.0;
export const AMBER = '#FFB547', CYAN = '#62D8FF', LIGHTS = '#FFE3A6';

const T = {
  can: 0,
  space: cue('from space?'),
  astro: cue('Most astronauts'),
  no: cue('say no.'),
  wall: cue('The wall is long.'),
  long: cue('long.'),
  more: cue('More than'),
  km: cue('kilometres, with'),
  branches: cue('branches.'),
  branchesEnd: cueEnd('all its branches.'),
  thin: cue('But it'),
  thinW: cue('thin.'),
  wide: cue('as wide'),
  road: cue('a road.'),
  made: cue('And it is made'),
  earth: cue('earth and'),
  same: cue('the same colours'),
  hills: cue('the hills'),
  around: cueEnd('around it.'),
  station: cue('The Space Station'),
  four: cue('four hundred kilometres'),
  up: cue('kilometres up.'),
  from: cue('From there,'),
  pencil: cue('a pencil'),
  fourM: cue('four hundred metres'),
  away: cue('metres away.'),
  so: cue('So astronauts'),
  pick: cue('spot it'),
  eyes: cue('their eyes.'),
  what: cue('What do'),
  cities: cue('Cities,'),
  airports: cue('airports'),
  roads: cue('highways,'),
  night: cue('at night.'),
  huge: cue('The wall is huge.'),
  hugeW: cue('huge.'),
  just: cue('Just not'),
  end: cueEnd('from up there.'),
};
export {T as BEATS};
const pre = 0.1;
export const CUT_LONG = T.astro - pre, CUT_THIN = T.thin - pre, CUT_STATION = T.station - pre, CUT_PENCIL = T.from - pre,
  CUT_SEARCH = T.so - pre, CUT_END = T.huge - pre;
export type Shot = 'hook' | 'long' | 'thin' | 'station' | 'pencil' | 'search' | 'end';
export const shotAt = (t: number): Shot =>
  t < CUT_LONG ? 'hook' : t < CUT_THIN ? 'long' : t < CUT_STATION ? 'thin' : t < CUT_PENCIL ? 'station' : t < CUT_SEARCH ? 'pencil' : t < CUT_END ? 'search' : 'end';

const io = Easing.bezier(0.45, 0, 0.55, 1);
export const ramp = (t: number, a: number, b: number, e = io) => interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
export const fade = (t: number, a: number, inD: number, b: number, outD: number) => Math.min(ramp(t, a, a + inD), 1 - ramp(t, b - outD, b));

// ---------- the wall in orbit: the Ming line (Jiayuguan to Shanhaiguan) drawn first, then the branches
export type LL = {lat: number; lon: number};
const P = (lat: number, lon: number): LL => ({lat, lon});
export const MAIN: LL[] = [P(39.8, 98.2), P(39.4, 99.6), P(38.8, 101.1), P(37.95, 102.6), P(37.3, 103.9), P(37.55, 105.2), P(38.5, 106.1),
  P(38.0, 107.2), P(37.65, 108.0), P(37.75, 108.9), P(38.3, 109.7), P(38.85, 110.5), P(39.15, 111.2), P(39.6, 111.9), P(40.1, 112.6),
  P(40.2, 113.3), P(40.45, 114.2), P(40.85, 114.9), P(41.0, 115.9), P(40.68, 117.24), P(40.3, 118.4), P(40.0, 119.75)];
export const BRANCHES: LL[][] = [
  [P(39.8, 98.2), P(40.3, 97.0), P(40.5, 95.8), P(40.35, 93.85)],                                       // west to Yumenguan (Han)
  [P(39.15, 111.2), P(39.0, 112.3), P(39.2, 112.9), P(39.3, 113.9), P(39.4, 115.2), P(40.36, 116.0)],     // inner line
  [P(40.0, 119.75), P(40.6, 120.6), P(41.1, 121.1), P(41.8, 123.4), P(40.6, 124.0), P(40.1, 124.4)],      // Liaodong
  [P(40.3, 106.9), P(40.9, 109.5), P(41.15, 111.5), P(41.5, 113.5), P(41.9, 116.0)],                     // northern (Qin/Han) line
  [P(38.5, 106.1), P(39.3, 106.6), P(40.3, 106.9)],
];
export const wallDraw = (t: number) => ramp(t, T.wall - 0.1, T.km + 0.6, Easing.bezier(0.35, 0, 0.6, 1));
export const branchDraw = (t: number) => ramp(t, T.branches - 0.35, T.branchesEnd + 0.4, Easing.bezier(0.3, 0, 0.5, 1));
export const counter = (t: number) => Math.round(21196 * (0.8 * wallDraw(t) + 0.2 * branchDraw(t)));

// ---------- orbit cameras: Earth radius 1 at the origin (globe kit), the camera given by where it looks
export type OCam = {at: LL; dist: number; tilt: number; head: number; fov: number};
export const ISS_ALT = 400 / 6371;
export const orbitCam = (t: number): OCam => {
  const s = shotAt(t);
  if (s === 'long') {
    const k = ramp(t, CUT_LONG, CUT_THIN, (x) => x);
    return {at: P(38.0 + 1.0 * k, 108 + 3 * k), dist: 1.05 + 0.3 * k, tilt: 12 - 6 * k, head: 0, fov: 40};
  }
  if (s === 'station') { const k = ramp(t, CUT_STATION, CUT_PENCIL, (x) => x); return {at: P(37 + 1.5 * k, 104 + 3 * k), dist: 0.75 - 0.08 * k, tilt: 58, head: 0, fov: 40}; }
  // search: the station's view, then night
  const k = ramp(t, CUT_SEARCH, CUT_END, (x) => x);
  return {at: P(38.8 + 0.6 * k, 112.5 + 1.5 * k), dist: 0.62 - 0.05 * k, tilt: 16, head: 0, fov: 44};
};
// where the sun is overhead: day over China until "What do they see", then night sweeps in from the east
export const sunLL = (t: number): LL => {
  const s = shotAt(t);
  if (s === 'search') { const k = ramp(t, T.what - 0.3, T.roads + 0.2, Easing.bezier(0.4, 0, 0.5, 1)); return P(-12, 112 - 125 * k); }
  return P(-12, 110);
};
export const nightLights = (t: number) => (shotAt(t) === 'search' ? 0.2 + 1.2 * ramp(t, T.cities - 0.6, T.night, (x) => x) : 0.25);

// search ring path over the station's view (lat/lon it hunts across), with a lock on each stop
export const SEARCH_STOPS: {ll: LL; t: number; label: string}[] = [
  {ll: P(40.3, 110.3), t: T.so + 0.1, label: 'river'},
  {ll: P(40.1, 113.3), t: T.pick + 0.15, label: 'wall?'},
  {ll: P(40.9, 115.6), t: T.eyes - 0.05, label: 'wall?'},
];
export const searchOn = (t: number) => {
  const s = shotAt(t);
  if (s === 'long') return fade(t, CUT_LONG, 0.25, T.wall + 0.1, 0.3);
  if (s === 'search') return fade(t, CUT_SEARCH, 0.25, T.what + 0.1, 0.3);
  return 0;
};

// ---------- ground: the amber glow on the wall (the lead), draining on "the same colours"
export const wallGlow = (t: number) => {
  const s = shotAt(t);
  if (s === 'hook') return 0.6;
  if (s === 'thin') return 0.6 * (1 - ramp(t, T.same - 0.1, T.hills + 0.4));
  return 0;
};
export const carRun = (t: number) => ramp(t, CUT_THIN, T.made + 0.8, (x) => x);

// ---------- pencil: camera distance (m), log-space pull back from 25 cm to 400 m
export const pencilDist = (t: number) => {
  const k = ramp(t, T.from + 0.15, T.away + 0.2, Easing.bezier(0.5, 0, 0.3, 1));
  return 0.5 * Math.pow(400 / 0.5, k);
};

// ---------- overlays (0..1 opacity)
export const hookTag = (t: number) => fade(t, T.can + 0.15, 0.3, CUT_LONG, 0.2);
export const counterOn = (t: number) => fade(t, T.more - 0.1, 0.3, CUT_THIN, 0.15);
export const rulerOn = (t: number) => fade(t, T.wide - 0.1, 0.3, T.same - 0.1, 0.3);
export const swatchOn = (t: number) => fade(t, T.same - 0.15, 0.3, CUT_STATION, 0.25);
export const altOn = (t: number) => fade(t, T.four - 0.1, 0.35, CUT_PENCIL, 0.15);
export const pencilTag = (t: number) => fade(t, T.pencil - 0.1, 0.3, T.fourM + 0.2, 0.3);
export const distTag = (t: number) => fade(t, T.fourM - 0.2, 0.3, CUT_SEARCH, 0.15);
export const endTag = (t: number) => ramp(t, T.just - 0.05, T.just + 0.35);
