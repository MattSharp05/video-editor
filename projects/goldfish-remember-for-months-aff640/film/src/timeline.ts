// Goldfish remember for months: every time comes from the words (lib.ts cue()), so a new VO re-times the film.
// One world: a planted home aquarium (units: centimetres) with a comet goldfish (Sketchfab, CC BY), a lever and
// feeder from above, a 24-hour wall clock behind the back glass. Hard cuts between camera set-ups on the words.
// Colour language: the goldfish (orange) is the lead; CYAN = a cue the fish has learned (the lever when it pays,
// the feeding hour on the clock, the smell cloud); white-tan pellets = food.
import {cue, cueEnd, VO_END, clamp} from './lib';
import {interpolate, Easing} from 'remotion';

export const DUR_S = VO_END + 1.4;
export const CYAN = '#38E0FF', ORANGE = '#FF8A2A', WHITE = '#FFFFFF', GREY = '#9AA3AD';

// ---------- tank (cm): x across the front, y up from the gravel top, z from the front glass (0) to the back (-TD)
export const TW = 100, TH = 52, TD = 44;      // inner width, water height above gravel, depth
export const LEVER_X = 13, LEVER_Z = -14;     // lever hangs here from the lid
export const FEED_X = 20, FEED_Z = -18;       // pellets fall from the feeder above here
export const DROP_X = -20, DROP_Z = -14;      // the smell dropper
export const CLOCK: [number, number, number] = [-2, 33, -TD - 5];   // seen through the back glass // wall clock centre, on the wall above the tank
export const CLOCK_R = 11;
export const HOUR = 9;                          // the feeding hour on the 24-hour dial (9:00-10:00)

const T = {
  hook: 0,
  not: cue('Not even close.'),
  sci: cue('Scientists in England'),
  lever: cue('a little lever.'),
  push: cue('Push the lever,'),
  food: cue('food drops in.'),
  then: cue('Then they made'),
  hour: cue('one hour a day.'),
  so: cue('So the fish learned'),
  time: cue('the time.'),
  pushed: cue('They pushed'),
  close: cue('came close.'),
  germ: cue('In Germany,'),
  smells: cue('certain smells'),
  meant: cue('meant food.'),
  three: cue('Three months later,'),
  still: cue('still knew'),
  myth: cue('So the three-second'),
  isMyth: cue('is a myth.'),
  rem: cue('Goldfish remember'),
  months: cue('for months.'),
  end: cueEnd('for months.'),
};
export {T as BEATS};
const pre = 0.08;
export type Shot = 'hook' | 'lever' | 'clock' | 'learn' | 'smell' | 'later' | 'end';
export const CUT = {lever: T.sci - pre, clock: T.then - pre, learn: T.so - pre, smell: T.germ - pre, later: T.three - pre, end: T.myth - pre};
const SHOTS: [number, Shot][] = [[CUT.lever, 'hook'], [CUT.clock, 'lever'], [CUT.learn, 'clock'], [CUT.smell, 'learn'], [CUT.later, 'smell'], [CUT.end, 'later'], [1e9, 'end']];
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

export const camAt = (t: number): Cam => {
  const s = shotAt(t);
  switch (s) {
    case 'hook': return move(t, s, {pos: [-4, 24, 46], look: [2, 22, -14], fov: 40}, {pos: [0, 23, 36], look: [2, 22, -14], fov: 40}, lin);
    case 'lever': return move(t, s, {pos: [2, 40, 48], look: [8, 36, -16], fov: 42}, {pos: [5, 38, 40], look: [10, 35, -16], fov: 42});
    case 'clock': return move(t, s, {pos: [8, 34, 72], look: [8, 33, -30], fov: 46}, {pos: [8, 34, 66], look: [8, 33, -30], fov: 46});
    case 'learn': return move(t, s, {pos: [14, 35, 70], look: [12, 33, -30], fov: 46}, {pos: [13, 34, 64], look: [12, 33, -30], fov: 46});
    case 'smell': return move(t, s, {pos: [-22, 40, 52], look: [-14, 35, -18], fov: 42}, {pos: [-19, 37, 46], look: [-13, 33, -18], fov: 42});
    case 'later': return move(t, s, {pos: [-4, 36, 58], look: [-6, 35, -30], fov: 46}, {pos: [-8, 35, 50], look: [-8, 35, -30], fov: 46});
    case 'end': return move(t, s, {pos: [-14, 36, 40], look: [-12, 34, -16], fov: 42}, {pos: [-2, 40, 88], look: [-2, 36, -24], fov: 44}, Easing.bezier(0.45, 0, 0.35, 1));
  }
};

// ---------- the hero fish: a path per shot (position in cm). Heading comes from the same path a frame later
// (sampled inside the shot only, so nothing straddles a cut).
type V3 = [number, number, number];
const wander = (t: number, c: V3, r: [number, number, number], sp = 0.35, ph = 0): V3 =>
  [c[0] + r[0] * Math.sin(t * sp + ph), c[1] + r[1] * Math.sin(t * sp * 1.7 + ph * 2), c[2] + r[2] * Math.sin(t * sp * 0.8 + 1 + ph)];
const toward = (a: V3, b: V3, k: number): V3 => [L(a[0], b[0], k), L(a[1], b[1], k), L(a[2], b[2], k)];
export const LEVER_TIP: V3 = [LEVER_X, 40, LEVER_Z];
// push pulses: the fish darts at the lever tip; returns the offset 0..1 (1 = touching)
const pulse = (t: number, times: number[], w = 0.45) => Math.max(0, ...times.map((p) => Math.exp(-(((t - p) / w) ** 2) * 3)));
export const pushTimes = (s: Shot): number[] => {
  if (s === 'lever') return [T.push + 0.1];
  if (s === 'clock') return [T.then + 0.7, T.then + 1.9];   // pushes outside the hour: nothing comes
  if (s === 'learn') { const out: number[] = []; let p = T.pushed - 0.2; let gap = 1.1; while (p < shotEnd('learn') - 0.3) { out.push(p); p += gap; gap = Math.max(0.42, gap * 0.8); } return out; }
  return [];
};
export const fishAt = (t: number): V3 => {
  const s = shotAt(t);
  switch (s) {
    case 'hook': return toward([18, 20, -24], [2, 21, -11], ramp(t, 0, shotEnd(s), Easing.bezier(0.3, 0, 0.3, 1)));
    case 'lever': {
      const base = toward([0, 34, -14], [LEVER_X - 14, 39, LEVER_Z + 2], ramp(t, shotStart(s), T.push - 0.3));
      const hit = pulse(t, pushTimes(s)); const p = toward(base, [LEVER_X - 6, 40, LEVER_Z], hit);
      const eat = ramp(t, T.food + 0.2, shotEnd(s)); return toward(p, [FEED_X - 4, 36, FEED_Z + 3], eat);
    }
    case 'clock': {
      const w = wander(t, [14, 14, -8], [6, 2, 3], 0.5);
      return toward(w, [LEVER_X + 7, 40, LEVER_Z], pulse(t, pushTimes(s), 0.5));
    }
    case 'learn': {
      const w = wander(t, [14, 14, -8], [5, 2, 3], 0.6);
      const near = toward(w, [LEVER_X + 10, 34, LEVER_Z + 3], ramp(t, T.so, T.pushed - 0.2));
      const p = toward(near, [LEVER_X + 7, 40, LEVER_Z], pulse(t, pushTimes(s), 0.32));
      return toward(p, [FEED_X - 4, 36, FEED_Z + 3], ramp(t, FEED_T + 0.3, shotEnd(s)));
    }
    case 'smell': {
      const w = wander(t, [-16, 30, -12], [6, 3, 3], 0.6);
      return toward(w, cloudCentre(t, 'smell'), ramp(t, T.smells, T.meant + 0.4));
    }
    case 'later': {
      const w = wander(t, [-2, 28, -10], [8, 4, 3], 0.9, 1);
      return toward(w, cloudCentre(t, 'later'), ramp(t, DROP2 + 0.3, DROP2 + 1.4, Easing.bezier(0.5, 0, 0.2, 1)));
    }
    case 'end': return toward(cloudCentre(t, 'later'), [-4, 34, -12], ramp(t, shotStart(s), shotEnd(s)));
  }
};
export const fishSpeedK = (t: number) => {   // tail-beat speed up while it darts
  const s = shotAt(t); return 1 + 1.6 * Math.max(pulse(t, pushTimes(s), 0.6), s === 'later' ? ramp(t, DROP2 + 0.2, DROP2 + 0.5) - ramp(t, DROP2 + 1.3, DROP2 + 1.8) : 0);
};

// ---------- lever: swing angle (rad) from each push; glow when it pays (lever shot, and the feeding hour)
export const leverDrop = (t: number) => shotAt(t) === 'hook' ? 0 : shotAt(t) === 'lever' ? ramp(t, T.sci + 0.2, T.lever + 0.6, Easing.bezier(0.2, 0.9, 0.3, 1)) : 1;
export const leverSwing = (t: number) => { const s = shotAt(t); return 0.22 * pulse(t, pushTimes(s).map((p) => p + 0.12), 0.35); };
// the clock: one rotation per day; time of day in hours
export const clockHour = (t: number): number => {
  const s = shotAt(t);
  if (s === 'clock') return 13 + 22 * ramp(t, shotStart(s), shotEnd(s), lin);          // a day spins by (13:00 -> 11:00)
  if (s === 'learn') return 6.2 + (HOUR + 0.15 - 6.2) * ramp(t, shotStart(s), FEED_T, Easing.bezier(0.3, 0, 0.6, 1)) + 0.5 * ramp(t, FEED_T, shotEnd(s), lin);
  if (s === 'later') return (shotStart(s) + (t - shotStart(s)) * 40) % 24;
  return 15.3;
};
export const hourLit = (t: number) => { const s = shotAt(t); return s === 'clock' ? ramp(t, T.hour - 0.2, T.hour + 0.4) : s === 'learn' ? 1 : 0; };
// food is given at the feeding hour in the learn shot; in the lever shot right after the push
export const FEED_T = T.close + 0.1;
export const leverPays = (t: number) => {
  const s = shotAt(t);
  if (s === 'lever') return ramp(t, T.push + 0.15, T.push + 0.35) * (1 - ramp(t, T.food + 1.4, T.food + 2));
  if (s === 'learn') return ramp(t, FEED_T - 0.1, FEED_T + 0.2);
  return 0;
};
// pellets: release times (each drops a few pellets from the feeder)
export const pelletDrops = (s: Shot): number[] => s === 'lever' ? [T.push + 0.25] : s === 'learn' ? [FEED_T] : s === 'smell' ? [T.meant - 0.3] : s === 'later' ? [DROP2 + 0.9] : [];
// pushes counted in the learn shot (for the on-screen counter)
export const pushCount = (t: number) => pushTimes('learn').filter((p) => t >= p + 0.1).length;

// ---------- smell cloud: dropped at DROP times, spreads and sinks
export const DROP1 = T.germ + 0.3;
export const DROP2 = T.still - 0.2;
export const cloudT = (t: number, s: Shot) => (s === 'smell' ? t - DROP1 : s === 'later' || s === 'end' ? t - DROP2 : -1);
export const cloudCentre = (t: number, s: Shot): V3 => { const k = Math.max(0, cloudT(t, s)); return [DROP_X + 2 * Math.min(k, 3), TH - 6 - 7 * Math.min(k, 3) ** 0.7, DROP_Z + 1.5 * Math.min(k, 3)]; };
// days passing in the later shot (0..90)
export const dayCount = (t: number) => Math.round(1 + 89 * ramp(t, CUT.later + 0.1, T.still - 0.4, Easing.bezier(0.5, 0, 0.5, 1)));
export const dayNight = (t: number) => { // 1 = day light, ~0.25 = night (fast cycle while the days count)
  if (shotAt(t) !== 'later') return 1;
  const k = ramp(t, CUT.later + 0.1, T.still - 0.4, Easing.bezier(0.5, 0, 0.5, 1)) * 89;
  const on = t < T.still - 0.4 && t > CUT.later + 0.1; return on ? 0.62 + 0.38 * Math.cos(k * Math.PI * 2) : 1;
};
export const hookTimer = (t: number) => Math.max(0, 3 - Math.max(0, t - 0.2) * (3 / Math.max(0.5, T.not - 0.4)));
