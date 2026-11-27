// Lightning strikes twice: every time comes from the words (lib.ts cue()), so a new VO re-times the film.
// One world (a night city under a storm cloud, 1 unit = 10 m), hard cuts between camera set-ups on the words:
//   HOOK    low wide on the Art Deco tower: bolts land on its mast again and again, a tally counts them
//   WHY     possible paths flicker from the cloud to every roof and collapse onto the tower; camera cranes up the mast
//   CLOUD   inside the cloud base: charge specks churn and pile up at the base
//   LEADER  side view, cloud to city: the stepped leader drops in ~50 m jumps; streamers rise from the roofs
//   CONTACT close on the mast: the mast's streamer touches the leader, the path turns cyan, the return stroke climbs
//   GAP     long-lens wide: rulers from every tall roof to the cloud; the tower's (cyan) is the shortest
//   AGAIN   the hook framing: strikes land faster and faster, tally climbing
//   YEAR    long exposure: a year of strikes (23) stacks up as cyan scars on one mast
//   END     one more bolt, pull back to the skyline in the rain
// Colour language (one meaning for the whole film): CYAN (the accent) = the path the current takes (a connected
// channel, its afterglow, the tower's ruler, the scars); dim blue-white = the stepped leader; violet = streamers;
// white = the return stroke's flash.
import {cue, cueEnd, VO_END, clamp} from './lib';
import {interpolate, Easing} from 'remotion';

export const DUR_S = VO_END + 2.2;
export const CYAN = '#3FE6FF', LEADER = '#AFC3FF', VIOLET = '#B98CFF', WARM = '#FFC77A';

const T = {
  twice: cue('strikes twice?'),
  building: cue('This building'),
  twenty: cue('over twenty'),
  why: cue('So why'),
  same: cue('same place?'),
  storm: cue('A storm'),
  fills: cue('fills up'),
  reach: cue('To reach'),
  jumps: cue('short jumps.'),
  close: cue('As it'),
  tall: cue('tall things'),
  meet: cue('to meet'),
  first: cue('The first'),
  touch: cue('to touch'),
  path: cue('makes the'),
  then: cue('Then the'),
  flash: cue('bright flash'),
  rushes: cue('rushes along'),
  tower: cue('A tall,'),
  closest: cue('closest point'),
  wins: cue('So it wins'),
  again: cue('again and'),
  empire: cue('The Empire'),
  twentyfive: cue('twenty-five', 0),
  so: cue('So lightning'),
  strike2: cue('strike twice.'),
  often: cue('It often'),
  shortest: cue('shortest.'),
  end: cueEnd('path is shortest.'),
};
export {T as BEATS};
const pre = 0.1;
export const CUT_WHY = T.why - pre, CUT_CLOUD = T.storm - pre, CUT_LEADER = T.reach - pre, CUT_CONTACT = T.first - pre,
  CUT_GAP = T.tower - pre, CUT_AGAIN = T.wins - pre, CUT_YEAR = T.empire - pre, CUT_END = T.so - pre;
export type Shot = 'hook' | 'why' | 'cloud' | 'leader' | 'contact' | 'gap' | 'again' | 'year' | 'end';
export const shotAt = (t: number): Shot =>
  t < CUT_WHY ? 'hook' : t < CUT_CLOUD ? 'why' : t < CUT_LEADER ? 'cloud' : t < CUT_CONTACT ? 'leader' : t < CUT_GAP ? 'contact'
    : t < CUT_AGAIN ? 'gap' : t < CUT_YEAR ? 'again' : t < CUT_END ? 'year' : 'end';
export const shotStart = (s: Shot) => ({hook: 0, why: CUT_WHY, cloud: CUT_CLOUD, leader: CUT_LEADER, contact: CUT_CONTACT, gap: CUT_GAP,
  again: CUT_AGAIN, year: CUT_YEAR, end: CUT_END})[s];

const io = Easing.bezier(0.45, 0, 0.55, 1);
export const ramp = (t: number, a: number, b: number, e = io) => interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
export const fade = (t: number, a: number, inD: number, b: number, outD: number) => Math.min(ramp(t, a, a + inD), 1 - ramp(t, b - outD, b));

// ---------- the world (1 unit = 10 m)
export const CLOUD_Y = 110;            // cloud base ~1.1 km
export const TIP: [number, number, number] = [0, 44.3, 0];   // antenna tip, 443 m
export const MAST_TOP = 38.1;
// the race bolt: leader comes down to J; the mast's streamer climbs from TIP to J
export const J: [number, number, number] = [0.6, 51.5, 0.3];

// ---------- strikes: each is a full connected bolt to the antenna tip; `t` is its return stroke
export type Strike = {t: number; seed: number; dx: number; dz: number};
const S = (t: number, seed: number, dx = 0, dz = 0): Strike => ({t, seed, dx, dz});
const againN = 7;
export const STRIKES: Strike[] = [
  S(-0.1, 1, -18, -10), S(T.twice + 0.1, 2, 22, -6), S(T.building + 0.3, 3, -8, 14), S(T.twenty + 0.2, 4, 14, 8),
  // AGAIN: faster and faster
  ...Array.from({length: againN}, (_, i) => S(CUT_AGAIN + 0.15 + (CUT_YEAR - CUT_AGAIN - 0.45) * Math.pow(i / (againN - 1), 0.75), 10 + i, (i % 2 ? 1 : -1) * (8 + 3 * i), (i % 3 - 1) * 9)),
  S(T.strike2 + 0.05, 30, -20, 6), S(T.shortest - 0.1, 31, 16, -12),
];
// the race bolt's return stroke
export const RETURN_T = T.flash;
// tally shown in HOOK and AGAIN: the count of strikes so far
export const tallyAt = (t: number) => STRIKES.filter((s) => s.t <= t + 1e-6).length;
export const YEAR_N = 23;   // NWS: an average of 23 a year
export const yearCount = (t: number) => Math.min(YEAR_N, Math.floor(YEAR_N * ramp(t, CUT_YEAR + 0.2, T.twentyfive + 0.6, (x) => x)));

// flash envelope of one return stroke at time t (with two re-strokes, as real flashes flicker)
export const strokeEnv = (t: number, ts: number) => {
  let v = 0;
  for (const [o, a] of [[0, 1], [0.07, 0.6], [0.17, 0.45]] as const) {
    const d = t - (ts + o);
    if (d >= -1 / 60) v += a * Math.exp(-Math.max(0, d) / 0.045);
  }
  return Math.min(1.3, v);
};
export const afterglow = (t: number, ts: number) => (t < ts ? 0 : Math.exp(-(t - ts) / 0.55));

// ---------- cameras
export type Cam = {pos: [number, number, number]; look: [number, number, number]; fov: number};
const mix3 = (a: number[], b: number[], k: number) => a.map((x, i) => x + (b[i] - x) * k) as [number, number, number];
const camLerp = (a: Cam, b: Cam, k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: a.fov + (b.fov - a.fov) * k});
const lin = (x: number) => x;

const HOOK_A: Cam = {pos: [14, 9, 118], look: [0, 44, 0], fov: 56};
const HOOK_B: Cam = {pos: [10, 10, 100], look: [0, 44, 0], fov: 56};
const WHY_A: Cam = {pos: [26, 22, 70], look: [0, 42, 0], fov: 60};
const WHY_B: Cam = {pos: [22, 48, 58], look: [0, 64, 0], fov: 60};
const CLD_A: Cam = {pos: [10, 104, 46], look: [0, 100, -40], fov: 64};
const CLD_B: Cam = {pos: [6, 105, 32], look: [0, 99, -44], fov: 62};
const LEA_A: Cam = {pos: [40, 70, 140], look: [0, 75, 0], fov: 50};
const LEA_B: Cam = {pos: [30, 58, 112], look: [0, 60, 0], fov: 50};
const CON_A: Cam = {pos: [10, 44, 30], look: [0, 49, 0], fov: 52};
const CON_B: Cam = {pos: [12, 40, 44], look: [0, 54, 0], fov: 56};
const GAP_A: Cam = {pos: [-24, 96, 250], look: [0, 62, 0], fov: 28};
const GAP_B: Cam = {pos: [8, 98, 240], look: [0, 62, 0], fov: 28};
const AGA_A: Cam = {pos: [-14, 10, 96], look: [0, 46, 0], fov: 56};
const AGA_B: Cam = {pos: [-10, 11, 84], look: [0, 46, 0], fov: 56};
const YEA_A: Cam = {pos: [6, 30, 62], look: [0, 50, 0], fov: 58};
const YEA_B: Cam = {pos: [4, 26, 74], look: [0, 50, 0], fov: 58};
const END_A: Cam = {pos: [12, 10, 90], look: [0, 44, 0], fov: 56};
const END_B: Cam = {pos: [30, 26, 210], look: [0, 52, 0], fov: 56};

// camera ground tracks (start, end): the city keeps these clear of buildings
export const CAM_PATHS: [number[], number[]][] = [[HOOK_A.pos, HOOK_B.pos], [WHY_A.pos, WHY_B.pos], [CON_A.pos, CON_B.pos], [AGA_A.pos, AGA_B.pos],
  [YEA_A.pos, YEA_B.pos], [END_A.pos, END_B.pos]].map(([a, b]) => [a, b]);
export const camAt = (t: number): Cam => {
  const s = shotAt(t);
  if (s === 'hook') return camLerp(HOOK_A, HOOK_B, ramp(t, 0, CUT_WHY, lin));
  if (s === 'why') return camLerp(WHY_A, WHY_B, ramp(t, CUT_WHY, CUT_CLOUD));
  if (s === 'cloud') return camLerp(CLD_A, CLD_B, ramp(t, CUT_CLOUD, CUT_LEADER, lin));
  if (s === 'leader') return camLerp(LEA_A, LEA_B, ramp(t, CUT_LEADER, CUT_CONTACT));
  if (s === 'contact') return camLerp(CON_A, CON_B, ramp(t, CUT_CONTACT, CUT_GAP));
  if (s === 'gap') return camLerp(GAP_A, GAP_B, ramp(t, CUT_GAP, CUT_AGAIN, lin));
  if (s === 'again') return camLerp(AGA_A, AGA_B, ramp(t, CUT_AGAIN, CUT_YEAR, lin));
  if (s === 'year') return camLerp(YEA_A, YEA_B, ramp(t, CUT_YEAR, CUT_END));
  return camLerp(END_A, END_B, ramp(t, CUT_END, DUR_S - 0.3, Easing.bezier(0.3, 0.1, 0.4, 1)));
};

// ---------- the race (LEADER + CONTACT): leader steps visible, streamer growth, contact
export const LEADER_STEPS = 12;
// how many leader steps are shown at t (jumps every ~0.33 s from "To reach" until it hangs above the city)
export const leaderSteps = (t: number) => {
  if (t < T.reach + 0.2) return 0;
  const k = Math.floor((t - (T.reach + 0.2)) / 0.36) + 1;
  return Math.min(LEADER_STEPS, k);
};
export const streamerGrow = (t: number) => ramp(t, T.tall - 0.1, T.touch + 0.1, Easing.bezier(0.3, 0, 0.7, 1));
export const CONTACT_T = T.touch + 0.15;
export const pathLit = (t: number) => (t >= CONTACT_T ? 1 : 0);

// ---------- overlay cards (0..1)
export const hookCard = (t: number) => 1 - ramp(t, CUT_WHY - 0.3, CUT_WHY);
export const sameCard = (t: number) => fade(t, T.same - 0.1, 0.25, CUT_CLOUD, 0.2);
export const firstCard = (t: number) => fade(t, CONTACT_T, 0.2, T.then + 0.2, 0.3);
export const gapCard = (t: number) => fade(t, T.closest, 0.3, CUT_AGAIN, 0.2);
export const yearCard = (t: number) => fade(t, T.twentyfive - 0.3, 0.3, CUT_END, 0.2);
export const endCard = (t: number) => ramp(t, T.strike2, T.strike2 + 0.35);
export const rulerGrow = (t: number) => ramp(t, CUT_GAP + 0.3, T.closest + 0.2);
