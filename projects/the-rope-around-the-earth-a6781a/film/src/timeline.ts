// The rope around the Earth: every time comes from the words (lib.ts cue()), so a new VO re-times the film.
// Three worlds, hard cuts between them on the words (motion-principles "Hard cuts are allowed"):
//   SPACE    the photographic Earth (globe kit), a glowing rope round the equator: drawn on, spliced, lifted, guessed
//   GROUND   on the equator, dry savanna at ground level: the rope 16 cm over the sand on stakes, a tape, a cat
//   DIAGRAM  a view from straight above: Earth as a disc that squares off; the rope's extra length lives only in its
//            four red corners, which join into one circle of radius = the gap (2 pi x gap = 1 m)
// Colour language (one meaning for the whole film): warm white-gold = the rope; RED = the extra 1 m (the accent);
// CYAN = the gap (the height it is lifted, the tape measure). A colour keeps its meaning in every world.
import {cue, cueEnd, VO_END, clamp} from './lib';
import {interpolate, Easing} from 'remotion';

export const DUR_S = VO_END + 1.6;
export const ROPE = '#FFE7B8', RED = '#FF4433', CYAN = '#38E0FF', WHITE = '#FFFFFF';

const T = {
  hook: 0,
  cat1: cue('Could a cat'),
  wrap: cue('Wrap a rope'),
  whole: cue('whole Earth.'),
  now: cue('Now make'),
  longer: cue('meter longer.'),
  lift: cue('Lift it'),
  around: cue('all the way around.'),
  how: cue('How big'),
  pause: cue('Pause and guess.'),
  guessEnd: cueEnd('Pause and guess.'),
  spread: cue('One meter, spread'),
  nothing: cue('sounds like nothing.'),
  but: cue('But the gap'),
  sixteen: cue('sixteen centimeters.', 0),
  enough: cue('That is enough'),
  crawl: cue('crawl under.', 1),
  why: cue('A rope lifted'),
  six: cue('six steps'),
  so: cue('So one extra'),
  sixth: cue('a sixth'),
  size: cue('And the size'),
  never: cue('never matters.'),
  tennis: cue('Around a tennis'),
  same: cue('same sixteen'),
  what: cue('What did you'),
  end: cueEnd('What did you guess?'),
};
export {T as BEATS};
const pre = 0.08;
export const CUT_WRAP = T.wrap - pre, CUT_SPLICE = T.now - pre, CUT_LIFT = T.lift - pre, CUT_GUESS = T.how - pre,
  CUT_NOTHING = T.spread - pre, CUT_REVEAL = T.but - pre, CUT_WHY = T.why - pre, CUT_SHRINK = T.size - pre,
  CUT_TENNIS = T.tennis - pre, CUT_END = T.what - pre;
export type Shot = 'hook' | 'wrap' | 'splice' | 'lift' | 'guess' | 'nothing' | 'reveal' | 'why' | 'shrink' | 'tennis' | 'end';
const SHOTS: [number, Shot][] = [[CUT_WRAP, 'hook'], [CUT_SPLICE, 'wrap'], [CUT_LIFT, 'splice'], [CUT_GUESS, 'lift'], [CUT_NOTHING, 'guess'],
  [CUT_REVEAL, 'nothing'], [CUT_WHY, 'reveal'], [CUT_SHRINK, 'why'], [CUT_TENNIS, 'shrink'], [CUT_END, 'tennis'], [1e9, 'end']];
export const shotAt = (t: number): Shot => SHOTS.find(([c]) => t < c)![1];
export const world = (s: Shot): 'space' | 'ground' | 'diagram' =>
  s === 'reveal' || s === 'tennis' || s === 'end' ? 'ground' : s === 'why' || s === 'shrink' ? 'diagram' : 'space';

export const io = Easing.bezier(0.45, 0, 0.55, 1);
export const ramp = (t: number, a: number, b: number, e = io) => interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
export const fade = (t: number, a: number, inD: number, b: number, outD: number) => Math.min(ramp(t, a, a + inD), 1 - ramp(t, b - outD, b));

// ---------- space (Earth radius 1 at the origin, equator in the xz plane, the camera on +z side)
export const SUN_VEC: [number, number, number] = [-0.55, 0.45, 0.75];
export const RING_R = 1.004;            // the rope on the ground (drawn just above the surface)
export const LIFT_H = 0.055;            // the lift as drawn in space: hugely exaggerated, labelled
export type Cam = {pos: [number, number, number]; look: [number, number, number]; fov: number};
const mix3 = (a: number[], b: number[], k: number) => a.map((x, i) => x + (b[i] - x) * k) as [number, number, number];
export const camLerp = (a: Cam, b: Cam, k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: a.fov + (b.fov - a.fov) * k});
const orbit = (az: number, el: number, d: number, look: [number, number, number], fov: number): Cam =>
  ({pos: [look[0] + d * Math.sin(az) * Math.cos(el), look[1] + d * Math.sin(el), look[2] + d * Math.cos(az) * Math.cos(el)], look, fov});

export const spaceCam = (t: number): Cam => {
  const s = shotAt(t);
  if (s === 'hook') { const k = ramp(t, 0, CUT_WRAP, (x) => x); return orbit(-0.35 + 0.3 * k, 0.32, 5.4 - 0.5 * k, [0, -0.05, 0], 34); }
  if (s === 'wrap') { const k = ramp(t, CUT_WRAP, CUT_SPLICE, (x) => x); return orbit(-0.5 + 0.9 * k, 0.42 - 0.08 * k, 5.6, [0, -0.08, 0], 34); }
  if (s === 'splice') { const k = ramp(t, CUT_SPLICE, CUT_LIFT); return camLerp(orbit(-0.1, 0.32, 2.3, [0, -0.05, 0.85], 34), orbit(0.05, 0.26, 1.8, [0, -0.05, 0.9], 34), k); }
  if (s === 'lift') { const k = ramp(t, CUT_LIFT, CUT_GUESS); return orbit(-0.25 + 0.35 * k, 0.36 - 0.08 * k, 5.2 - 0.6 * k, [0, -0.02, 0], 34); }
  if (s === 'guess') { const k = ramp(t, CUT_GUESS, CUT_NOTHING, (x) => x); return camLerp(orbit(-0.55, 0.12, 0.95, [0, 0.02, 1.0], 36), orbit(-0.4, 0.1, 0.8, [0, 0.03, 1.0], 36), k); }
  const k = ramp(t, CUT_NOTHING, CUT_REVEAL - 0.5); return camLerp(orbit(0.2, 0.3, 4.6, [0, -0.04, 0], 34), orbit(0.05, 0.08, 1.3, [0, 0.0, 1.0], 34), k * k);
};

// ring state in space
export const ringDraw = (t: number) => shotAt(t) === 'wrap' ? ramp(t, CUT_WRAP + 0.15, Math.min(T.whole + 0.4, CUT_SPLICE - 0.35), Easing.bezier(0.3, 0, 0.5, 1)) : 1;
// splice: the gap opens, the red metre (drawn ~16,000 km long so it can be seen) slides in and the ends join
export const GAP_A = 0.42;                      // gap angle (rad) at the front (angle 0 = +z)
export const gapOpen = (t: number) => shotAt(t) === 'splice' ? ramp(t, CUT_SPLICE + 0.1, T.now + 0.6) : 0;
export const redIn = (t: number) => shotAt(t) === 'splice' ? ramp(t, T.now + 0.6, T.longer + 0.3) : 0;
// lift: posts rise in a ripple from the front round both sides, then the ring rides up on them
export const liftK = (t: number, ang: number) => {   // 0..1 at angle ang (rad from the front)
  const s = shotAt(t);
  if (s === 'lift') { const d = Math.abs(((ang + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI) / Math.PI; return ramp(t, CUT_LIFT + 0.15 + d * 0.9, CUT_LIFT + 0.75 + d * 0.9); }
  if (s === 'guess') return 1;
  if (s === 'nothing') return 1 - 0.93 * ramp(t, T.nothing - 0.3, T.nothing + 0.6);
  return 0;
};
export const postsOn = (t: number) => { const s = shotAt(t); return s === 'lift' || s === 'guess' || s === 'nothing' ? 1 : 0; };
// "sounds like nothing": the red metre smears thin all the way round
export const smear = (t: number) => shotAt(t) === 'nothing' ? ramp(t, T.spread + 0.4, T.nothing) : 0;

// ---------- ground (metres; the rope runs along -z from the camera to the horizon, 16 cm up)
export const GAP_M = 1 / (2 * Math.PI);        // 0.159 m
export const ROPE_X = 0;
export const CAT_Z = -1.45;
export type GCam = {pos: [number, number, number]; look: [number, number, number]; fov: number};
export const groundCam = (t: number): GCam => {
  const s = shotAt(t);
  if (s === 'reveal') {
    const drop = ramp(t, CUT_REVEAL, CUT_REVEAL + 1.1, Easing.bezier(0.15, 0.6, 0.25, 1));
    const after = ramp(t, T.enough, CUT_WHY, (x) => x);
    const hi: GCam = {pos: [1.4, 9, 3.5], look: [0, 0, -2.0], fov: 40};
    const lo: GCam = {pos: [0.95, 0.34, 0.55], look: [0, 0.12, -1.2], fov: 40};
    const lo2: GCam = {pos: [1.05, 0.4, 0.05], look: [-0.05, 0.1, -1.45], fov: 40};
    return camLerp(camLerp(hi, lo, drop), lo2, after);
  }
  if (s === 'tennis') { const k = ramp(t, CUT_TENNIS, CUT_END, (x) => x); return camLerp({pos: [0.55, 0.42, 0.62], look: [0, 0.02, 0], fov: 36}, {pos: [0.42, 0.36, 0.58], look: [0, 0.02, 0], fov: 36}, k); }
  const k = ramp(t, CUT_END, DUR_S, (x) => x);
  return camLerp({pos: [1.0, 0.38, 0.0], look: [-0.05, 0.1, -1.45], fov: 40}, {pos: [1.3, 0.6, 0.7], look: [-0.05, 0.1, -1.45], fov: 40}, k);
};
export const tapeUp = (t: number) => { const s = shotAt(t); return s === 'reveal' ? ramp(t, T.sixteen - 0.25, T.sixteen + 0.35) : s === 'tennis' ? ramp(t, T.same - 0.3, T.same + 0.3) : s === 'end' ? 1 : 0; };
// the cat: walks in from the right, crouches, crawls under the rope, stands up on the far side (x from +0.9 to -0.9)
export const catX = (t: number) => {
  const s = shotAt(t);
  if (s === 'reveal') return interpolate(t, [T.sixteen + 0.3, T.crawl - 0.2, T.crawl + 0.5, CUT_WHY], [1.1, 0.35, -0.2, -0.75], clamp);
  if (s === 'end') return interpolate(t, [CUT_END, DUR_S], [0.4, -0.25], clamp);
  return 99;
};
export const catCrouch = (x: number) => interpolate(Math.abs(x - ROPE_X), [0.3, 0.55], [1, 0], clamp);   // 1 = flat under the rope

// ---------- diagram (units: 1 = the gap h; the view from straight above, camera on +z looking down -z)
export const Q = 2.1;            // the square Earth's half-side
export const SQ_C: [number, number] = [0, 2.6];
export const ROLL_Y = -2.4, ROLL_X0 = -Math.PI;   // the line the red circle rolls along
export const diag = (t: number) => {
  const s = shotAt(t);
  if (s === 'why') {
    return {
      square: ramp(t, CUT_WHY + 0.1, CUT_WHY + 0.9),              // disc -> square
      h: ramp(t, CUT_WHY + 0.9, CUT_WHY + 1.9),                  // the rope lifts by h
      gather: ramp(t, T.six - 0.5, T.six + 0.4),                 // the four red corners fly down and join into a circle
      roll: ramp(t, T.six + 0.5, T.so - 0.2) - ramp(t, T.sixth - 0.2, T.sixth + 0.9),   // unrolls along the ruler, then rolls back up
      q: Q, ticks: ramp(t, T.six + 0.6, T.so - 0.3), radius: ramp(t, T.sixth + 0.7, T.sixth + 1.1), ball: 0,
    };
  }
  const k = ramp(t, T.size + 0.3, T.never + 0.4);
  return {square: 1, h: 1, gather: 0, roll: 0, q: Q * (1 - k), ticks: 0, radius: ramp(t, T.never + 0.3, T.never + 0.7), ball: ramp(t, T.never + 0.4, CUT_TENNIS - 0.1)};
};
export const diagCam = (t: number): Cam => {
  if (shotAt(t) !== 'shrink') { const z = 27 - (t - CUT_WHY) * 0.05; return {pos: [0, 1.3, z], look: [0, 1.3, 0], fov: 40}; }
  const k = ramp(t, CUT_SHRINK, T.never + 0.6); const y = 1.3 + (SQ_C[1] - 1.3) * k, z = 27 - 15 * k;
  return {pos: [0, y + 0.7 * k, z], look: [0, y + 0.7 * k, 0], fov: 40};
};
export const BALL_R = 0.033 / GAP_M;    // a tennis ball in gap units (0.21)

// ---------- cards (0..1)
export const hookCard = (t: number) => 1 - ramp(t, CUT_WRAP - 0.25, CUT_WRAP);
