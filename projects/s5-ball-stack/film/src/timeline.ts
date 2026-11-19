// Every state of the film as a pure function of time t (seconds), cued from the spoken words (cue()), so a new
// voiceover re-times the film. No React, no three scene objects. World: 1 unit = 1 m, origin on the court at the drop
// spot, +y up, the brick wall behind at z = WALL_Z facing +z (the camera side).
import {cue, VO_END} from './lib';

export const DUR_S = VO_END + 2.2;

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- colours
export const LIME = '#D8FF3E', ORANGE = '#FF8A3D', GLASS = '#EAF6FF', CORAL = '#FF5A4E';

// ---------- world
export const WALL_Z = -2.6, WALL_H = 8.2;
export const RIM = {x: 0.75, y: 3.05, z: -0.25, r: 0.23};
export const RB = 0.12, RT = 0.0335; // ball radii (m)
export const D = 1.1; // drop height: the basketball's bottom at release
export const LAUNCH_Y = 2 * RB + RT; // tennis ball centre when it sits on the basketball on the court
export const START_Y = D + 2 * RB + RT; // tennis ball centre at release (= LAUNCH_Y + D)
export const BAR_Z = -0.14; // guess bars sit just behind the ball path
export const TOWER_X = -0.35, TILE = D; // the height tower stands left of the path, one tile per drop height
export const G = 9.81;

// ---------- the drop, in sim seconds s (s = 0 at release)
export const S_HIT = Math.sqrt((2 * D) / G); // basketball touches the court
export const V = G * S_HIT; // impact speed (4.65 m/s)
export const SQ_A = 0.03; // basketball squash (m) at its deepest
export const TC = (SQ_A * Math.PI) / V; // contact time so the squash starts at speed V (~20 ms)
export const S_LAUNCH = S_HIT + 1.25 * TC; // the tennis ball leaves the basketball
export const K_REAL = Math.sqrt(3.5), K_IDEAL = 3; // launch speed / impact speed: real (3.5x height), perfect (9x)
export const VX = -0.12; // tennis ball's small sideways drift after launch (lands clear of the basketball)
export const peakS = (k: number) => S_LAUNCH + (k * V) / G;
export const PEAK_REAL = LAUNCH_Y + (K_REAL * V) ** 2 / (2 * G); // 4.12 m
export const PEAK_IDEAL = LAUNCH_Y + (K_IDEAL * V) ** 2 / (2 * G); // 10.2 m

export type Balls = {bY: number; bSquash: number; tX: number; tY: number; tSquash: number};
export const balls = (s: number, k = K_REAL): Balls => {
  if (s <= S_HIT) { const yb = D - 0.5 * G * Math.max(0, s) ** 2; return {bY: yb + RB, bSquash: 0, tX: 0, tY: yb + 2 * RB + RT, tSquash: 0}; }
  // contact: the basketball squashes on the court and springs back; the tennis ball squashes into its top a beat later
  const x = (s - S_HIT) / TC, q = x < 1 ? SQ_A * Math.sin(Math.PI * x) : 0;
  const xt = (s - S_HIT - 0.25 * TC) / TC, qt = xt > 0 && xt < 1 ? 0.018 * Math.sin(Math.PI * xt) : 0;
  // after contact the basketball hops ~1 cm (Cross 2007: it nearly stops)
  const sb = s - (S_HIT + TC), hop = sb > 0 ? Math.max(0, 0.45 * sb - 0.5 * G * sb * sb) : 0;
  const bTop = 2 * RB - q + hop;
  if (s <= S_LAUNCH) return {bY: RB - q / 2 + hop, bSquash: q / (2 * RB), tX: 0, tY: bTop + RT - qt, tSquash: qt / (2 * RT)};
  const u = k * V, st = s - S_LAUNCH;
  let tY = LAUNCH_Y + u * st - 0.5 * G * st * st, tX = VX * st;
  const tDown = (u + Math.sqrt(u * u + 2 * G * (LAUNCH_Y - RT))) / G; // back on the court
  if (st > tDown) { // one bounce, then a smaller one
    const s2 = st - tDown, u2 = 0.55 * Math.sqrt(u * u + 2 * G * (LAUNCH_Y - RT)), t2 = (2 * u2) / G;
    tY = RT + (s2 < t2 ? u2 * s2 - 0.5 * G * s2 * s2 : Math.max(0, 0.5 * u2 * (s2 - t2) - 0.5 * G * (s2 - t2) ** 2));
  }
  return {bY: RB + hop, bSquash: 0, tX, tY, tSquash: 0};
};
export const tennisVel = (s: number, k = K_REAL) => { const h = 1e-4; return (balls(s + h, k).tY - balls(s - h, k).tY) / (2 * h); };

// a sim clock driven by a rate that depends on the sim state: ds/dt = rate(s), integrated once into a table
const clock = (t0: number, s0: number, rate: (s: number) => number, len = 20) => {
  const dt = 1 / 600, n = Math.ceil(len / dt), tab = new Float64Array(n + 1);
  tab[0] = s0; for (let i = 0; i < n; i++) { const s = tab[i]; tab[i + 1] = s + dt * rate(s); }
  return (t: number) => { const x = (t - t0) / dt; if (x <= 0) return s0; const i = Math.min(n - 1, Math.floor(x)); return lerp(tab[i], tab[i + 1], Math.min(1, x - i)); };
};
const band = (s: number, a: number, b: number, r0: number, r1: number) => lerp(r0, r1, smooth((s - a) / (b - a)));

// ---------- beats (from the words)
export const B = {
  fly: cue('fly?'), back: cue('Back to'), twice: cue('Twice'), guess: cue('guess.'),
  way: cue('Over the rim!', 0), squash: cue('squashes'), rim1: cue('rim!', 0), why: cue("Here's"), springs: cue('springs'), still: cue('still falling'),
  so: cue('So the'), rushing: cue('rushing'), with: cue('With perfect'), three: cue('three times as'), fell: cue('fell.'),
  and3: cue('And three'), nine: cue('nine'), height: cue('height.'), real: cue('Real'), lose: cue('lose'),
  four: cue('three or four'), still2: cue('Still over'), rim2: cue('rim.', 1), tryIt: cue('Try'), end: VO_END,
};

// ---------- cuts (hard cuts between viewpoints, on the words)
export const CUT_WHY = B.why - 0.1;   // the reveal -> side-view replay
export const CUT_POV = B.so - 0.1;    // replay -> the chase cam on the tennis ball
export const CUT_SIDE = B.with - 0.1; // chase cam -> side view, frozen at contact
export const CUTS = [CUT_WHY, CUT_POV, CUT_SIDE];

// ---------- shot A: hook, guesses, reveal (one continuous shot)
const S_FREEZE = Math.sqrt((2 * (D - 0.12)) / G); // the fall freezes with the basketball 12 cm above the court
const softMin = (u: number, m: number, k: number) => (u < m - k ? u : m - k * Math.exp(-(u - (m - k)) / k));
export const REVEAL = B.way - 0.55; // time resumes a beat before "Way"
const revealClock = clock(REVEAL, S_FREEZE, (s) => {
  const pk = peakS(K_REAL);
  if (s < S_LAUNCH + 0.01) return band(s, S_FREEZE, S_FREEZE + 0.01, 0.06, 0.15);
  if (s < pk - 0.3) return band(s, S_LAUNCH + 0.01, S_LAUNCH + 0.12, 0.15, 0.9);
  return band(s, pk - 0.3, pk - 0.02, 0.9, 0.07);
});
export const DROP_T = 0.6;
export const simA = (t: number) => (t < REVEAL ? softMin(0.2 * Math.max(0, t - DROP_T), S_FREEZE, 0.05) : revealClock(t));

// ---------- shot B: side replay with strobe ghosts, slowing into the contact
const replayClock = clock(CUT_WHY, 0.33, (s) => band(s, 0.38, S_HIT + 0.6 * TC, 0.11, 0.006));
export const simB = (t: number) => replayClock(t);
export const GHOST_DT = 0.02; // sim seconds between ghosts

// ---------- shot C: chase cam, from 0.3 m above the court to the contact
const povClock = clock(CUT_POV, 0.4, (s) => band(s, 0.42, S_HIT + 0.9 * TC, 0.07, 0.0));
export const simC = (t: number) => Math.min(S_HIT + 0.85 * TC, povClock(t));
// arrows in the chase cam: the tennis ball's (down) from the cut, the basketball's (up) on "rushing"
export const povArrowT = (t: number) => ramp(t, CUT_POV + 0.3, CUT_POV + 0.9);
export const povArrowB = (t: number) => ramp(t, B.rushing - 0.1, B.rushing + 0.4);

// ---------- shot D: side view, frozen at the contact; arrows -> 3 units -> tiles -> tower -> real tower
export const S_CONTACT = S_HIT + 0.85 * TC;
export const UNIT = 0.45, POV_UNIT = 0.2; // one speed unit (arrow length)
// the down arrow flips to up (its bounce off a ball rushing up: 2 units relative to it), then the basketball's unit joins
export const flip = (t: number) => ramp(t, B.with + 0.6, B.with + 1.4);
export const double = (t: number) => ramp(t, B.with + 1.4, B.with + 2.0);
export const join = (t: number) => ramp(t, B.three - 0.4, B.three + 0.3);
export const arrowLabel = (t: number) => ramp(t, B.three, B.three + 0.4) * (1 - ramp(t, B.and3 + 0.1, B.and3 + 0.5));
// the three units swing into a 3x3 square of small tiles, then the nine fly up and stack as drop-height tiles
export const square = (t: number) => ramp(t, B.and3 - 0.1, B.and3 + 0.9);
export const squareLabel = (t: number) => ramp(t, B.and3 + 0.6, B.and3 + 1.0) * (1 - ramp(t, B.nine + 0.1, B.nine + 0.5));
export const tileFly = (t: number, i: number) => ramp(t, B.nine - 0.2 + i * 0.16, B.nine + 0.5 + i * 0.16);
export const ghostUp = (t: number) => ramp(t, B.nine + 0.2, B.height + 0.6);
export const idealLabel = (t: number) => ramp(t, B.height, B.height + 0.5) * (1 - ramp(t, B.lose - 0.2, B.lose + 0.2));
// tiles lost to heat, from the top down; tile index 3 (the 4th) loses half
export const lost = (t: number, i: number) => (i < 3 ? 0 : ramp(t, B.lose + (8 - i) * 0.22, B.lose + 0.5 + (8 - i) * 0.22));
export const REAL_TILES = 3.5;
export const warmSpots = (t: number) => hump(t, B.lose, 2.4);
// the two guesses come back, faint, beside the real tower (the answer against the guess)
export const guessBack = (t: number) => ramp(t, B.four - 0.2, B.four + 0.4) * (1 - ramp(t, B.tryIt, B.tryIt + 0.4));
export const realLabel = (t: number) => ramp(t, B.four, B.four + 0.4) * (1 - ramp(t, B.tryIt, B.tryIt + 0.4));
const realRiseClock = clock(B.still2 - 0.5, S_LAUNCH, (s) => band(s, peakS(K_REAL) - 0.3, peakS(K_REAL), 0.75, 0.05));
const fallClock = clock(B.tryIt - 0.2, peakS(K_REAL) - 0.01, () => 1.0);
// the real ball in shot D: hidden until its replay rise, then falls back on "Try it"
export const simD = (t: number) => (t < B.still2 - 0.5 ? -1 : t < B.tryIt - 0.2 ? realRiseClock(t) : fallClock(t));
export const towerFade = (t: number) => 1 - ramp(t, B.tryIt, B.tryIt + 0.8);

// ---------- shot A overlays: the "your hand" line, guess bars, "?" and their smash
export const handLine = (t: number) => 1 + 0 * t; // on from frame 0 (the cover)
export const bar2 = (t: number) => ramp(t, B.twice - 0.15, B.twice + 0.3);
export const qMark = (t: number) => ramp(t, B.guess - 0.15, B.guess + 0.3);
export const Q_Y = 3.35; // the '?' sits on the ball path; the rising ball pops it
export const ticks = () => [B.guess + 0.45, B.guess + 0.85, B.guess + 1.25];
// when the rising tennis ball crosses a height in shot A
export const crossT = (y: number) => { for (let t = REVEAL; t < CUT_WHY; t += 1 / 120) if (balls(simA(t)).tY >= y) return t; return 1e9; };

// ---------- camera keys: [t, pos, look, mm]; a key with cut: true starts a new shot at its t
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; cut?: boolean};
export const KEYS: Key[] = [
  // A: close and low on the stack, down with the fall, back to show the guesses, then up with the ball
  {t: 0, pos: [0.05, 0.32, 2.5], look: [0.3, 1.9, -0.6], mm: 24},
  {t: B.fly, pos: [0.3, 0.4, 1.6], look: [0.1, 0.75, -0.5], mm: 24},
  {t: B.back - 0.1, pos: [0.5, 0.6, 1.45], look: [0.05, 0.8, -0.4], mm: 24},
  {t: B.guess + 0.3, pos: [0.9, 1.45, 3.7], look: [0.15, 2.4, -0.4], mm: 24},
  {t: REVEAL + 0.45, pos: [0.85, 1.35, 3.4], look: [0.15, 2.25, -0.4], mm: 24},
  {t: B.rim1 + 0.1, pos: [0.4, 3.45, 1.75], look: [0.3, 3.55, -0.4], mm: 24},
  {t: CUT_WHY, pos: [0.38, 3.6, 1.45], look: [0.32, 3.6, -0.4], mm: 24},
  // B: replay, low three-quarter view with the wall behind
  {t: CUT_WHY, cut: true, pos: [-1.25, 0.48, 1.95], look: [0, 0.4, 0], mm: 35},
  {t: CUT_POV, pos: [-1.05, 0.42, 1.8], look: [0, 0.36, 0], mm: 35},
  // C: chase cam: offsets from the tennis ball (see camAt)
  {t: CUT_POV, cut: true, pos: [-0.62, 0.3, 0.95], look: [0.05, -0.06, 0], mm: 24},
  {t: CUT_SIDE, pos: [-0.55, 0.24, 0.88], look: [0.05, -0.04, 0], mm: 24},
  // D: frozen contact and the arrows; the square; up the ideal tower; down to the real one; wide
  {t: CUT_SIDE, cut: true, pos: [-0.15, 0.85, 2.4], look: [0, 0.85, 0], mm: 35},
  {t: B.three + 0.4, pos: [-0.3, 1.0, 2.9], look: [-0.1, 1.0, 0], mm: 35},
  {t: B.and3 + 0.4, pos: [-0.55, 1.0, 3.2], look: [-0.45, 1.0, 0], mm: 35},
  {t: B.nine + 0.4, pos: [-0.4, 3.4, 9.0], look: [-0.35, 3.6, 0], mm: 35},
  {t: B.height + 0.6, pos: [-0.35, 5.6, 20.0], look: [-0.35, 5.6, 0], mm: 35},
  {t: B.lose + 0.9, pos: [-0.35, 5.0, 17.0], look: [-0.35, 4.9, 0], mm: 35},
  {t: B.four + 0.2, pos: [-0.1, 3.2, 6.2], look: [-0.1, 3.2, 0], mm: 35},
  {t: B.rim2 + 0.3, pos: [0.05, 3.1, 5.4], look: [0.05, 3.1, 0], mm: 35},
  {t: DUR_S, pos: [0.6, 1.1, 4.6], look: [0.1, 1.8, -0.5], mm: 24},
];
export const CHASE = [CUT_POV, CUT_SIDE];
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
export const camAt = (t: number) => {
  let s0 = 0;
  KEYS.forEach((k, i) => { if (k.cut && k.t <= t) s0 = i; });
  let s1 = KEYS.findIndex((k, i) => i > s0 && k.cut); if (s1 < 0) s1 = KEYS.length;
  const S = KEYS.slice(s0, s1);
  let i = S.findIndex((k) => k.t > t) - 1;
  if (i < 0) i = t < S[0].t ? 0 : S.length - 2;
  i = Math.min(i, S.length - 2);
  const a = S[Math.max(i - 1, 0)], b = S[i], c = S[i + 1], d = S[Math.min(i + 2, S.length - 1)];
  const u = smooth((t - b.t) / (c.t - b.t)) * 0.5 + clamp01((t - b.t) / (c.t - b.t)) * 0.5;
  const v = (f: (k: Key) => V3) => [0, 1, 2].map((j) => cr(f(a)[j], f(b)[j], f(c)[j], f(d)[j], u)) as V3;
  let pos = v((k) => k.pos), look = v((k) => k.look);
  if (t > REVEAL + 0.3 && t < CUT_WHY) { // the reveal: the camera tilts and cranes after the rising ball, a beat behind it
    const by = Math.max(2.2, balls(simA(t - 0.07)).tY), w = ramp(t, REVEAL + 0.3, REVEAL + 0.55);
    look = [look[0], lerp(look[1], by + 0.05, w), look[2]]; pos = [pos[0], lerp(pos[1], by - 0.05, w), pos[2]];
  }
  if (t >= CUT_POV && t < CUT_SIDE) { // chase cam rides the tennis ball
    const bl = balls(simC(t));
    pos = [pos[0] + bl.tX, pos[1] + bl.tY, pos[2]]; look = [look[0] + bl.tX, look[1] + bl.tY, look[2]];
  }
  return {pos, look, mm: lerp(b.mm, c.mm, u)};
};
// which shot holds t, and the sim time of the balls in it
export const shotAt = (t: number) => (t < CUT_WHY ? 'A' : t < CUT_POV ? 'B' : t < CUT_SIDE ? 'C' : 'D');
export const simAt = (t: number) => { const s = shotAt(t); return s === 'A' ? simA(t) : s === 'B' ? simB(t) : s === 'C' ? simC(t) : S_CONTACT; };
