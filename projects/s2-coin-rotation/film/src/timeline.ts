// Every state of the film as a pure function of time t (seconds), cued from the spoken words (cue/cueEnd), so a new
// voiceover re-times the film. No React, no three scene objects. Units: 1 = 1 cm; desk plane y = 0; -z = up the page.
import {cue, cueEnd, VO_END} from './lib';

export const DUR_S = VO_END + 2.2;
export const AMBER = '#FFB547', CORAL = '#FF5A4E', ICE = '#BFE3FF';

// ---------- world constants
export const R1 = 1.2, TH = 0.175;          // equal coins: radius 1.2 cm (24 mm), thickness 1.75 mm
export const B1: [number, number] = [0, 0];  // fixed coin B (x, z)
export const RS = 0.9, RB = 2.7;             // the 1982 pair: small coin and a coin three times as wide
export const B2: [number, number] = [0, 17.4];
export const LTRACK = 2 * Math.PI * R1;      // B's edge unrolled: 7.54 cm

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// monotone cubic through [t, v] keys (PCHIP): no overshoot, no stop at inner keys
export const keys1d = (t: number, K: [number, number][]) => {
  if (t <= K[0][0]) return K[0][1];
  if (t >= K[K.length - 1][0]) return K[K.length - 1][1];
  const n = K.length, d = K.map((_, i) => (i < n - 1 ? (K[i + 1][1] - K[i][1]) / (K[i + 1][0] - K[i][0]) : 0));
  const m = K.map((_, i) => {
    if (i === 0 || i === n - 1) return 0; // ease in and out at the ends
    if (d[i - 1] * d[i] <= 0) return 0;
    const h0 = K[i][0] - K[i - 1][0], h1 = K[i + 1][0] - K[i][0];
    return (3 * (h0 + h1)) / ((2 * h1 + h0) / d[i - 1] + (h1 + 2 * h0) / d[i]);
  });
  let i = 0; while (K[i + 1][0] < t) i++;
  const h = K[i + 1][0] - K[i][0], u = (t - K[i][0]) / h;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  return h00 * K[i][1] + h10 * h * m[i] + h01 * K[i + 1][1] + h11 * h * m[i + 1];
};

// ---------- beats (from the words)
export const B = {
  twitch: 0.0,
  roll: cue('Roll one'), turnQ: cue('does it turn?'), pause: cue('Pause and guess.'), guessEnd: cueEnd('Pause and guess.'),
  once: cue('once, right?'), watch: cue('Watch the arrow.'), half: cue('turned once.'), twice: cue('twice.'),
  along: cue('Roll it along'), justOnce: cue('just once.'), bend: cue('Bend the strip'), adds: cue('adds a turn.'),
  sat: cue('The 1982 test'), plus: cue('plus one'), four: cue('Four. The'), key: cue('The key said'), wasnt: cue("wasn't"),
  students: cue('Three students'), thousand: cue('three hundred thousand'), recalc: cue('recalculated.'), end: VO_END,
};
export const CUT_SAT = B.sat - 0.12; // the equal coins -> the 1982 pair further down the sheet

// ---------- coin A (equal pair). trip 0..1 round B (0 = due south of B; counter-clockwise seen from above).
// Rolling round B: spin = 2·phi. The strip: B's edge as a paper band of length LTRACK, start fixed at B's south point,
// curvature k (1/R1 = wrapped round B, 0 = straight east); A sits at distance ell along it and rolls (spin = ell/r),
// and while the strip bends A rides its end (spin += tangent turn k·ell).
const TAU = Math.PI * 2;
const START = -Math.PI / 2;
// the hook: A is already rolling at frame 0, then rolls back to the start under the question
const T0 = B.watch + 0.3, THALF = B.half + 0.3, TEND = B.twice + 0.12;
export const trip = (t: number) => (t < T0 ? keys1d(t, [[-1.0, -0.08], [B.roll - 0.1, 0.22], [B.turnQ + 0.25, 0]])
  : keys1d(t, [[T0, 0], [T0 + 0.6, 0.06], [THALF, 0.5], [TEND - 0.6, 0.94], [TEND, 1]]));
export const REVEAL = {T0, THALF, TEND};
const UNWRAP = [B.along - 0.25, B.along + 0.5] as const;
const ALONG = [B.along + 0.6, B.justOnce + 0.35] as const;
const BEND = [B.bend + 0.15, B.adds + 0.45] as const;
export const SPANS = {UNWRAP, ALONG, BEND};
export const stripOn = (t: number) => (t >= UNWRAP[0] - 0.05 && t < CUT_SAT ? 1 : 0);
export const stripStamp = (t: number, i: number) => (t < CUT_SAT ? ramp(t, i ? ALONG[1] - 0.1 : ALONG[0], i ? ALONG[1] + 0.2 : ALONG[0] + 0.3) : 0);
export const stripK = (t: number) => (1 / R1) * (t < BEND[0] ? 1 - ramp(t, UNWRAP[0], UNWRAP[1]) : ramp(t, BEND[0], BEND[1]));
export const stripEll = (t: number) => LTRACK * ramp(t, ALONG[0], ALONG[1]);
// point and outward normal of the strip at arc length s for curvature k (x, z)
export const stripAt = (s: number, k: number) => {
  const th = k * s;
  const p = k < 1e-6 ? [s, R1] : [Math.sin(th) / k, R1 - (1 - Math.cos(th)) / k];
  return {x: B1[0] + p[0], z: B1[1] + p[1], nx: Math.sin(th), nz: Math.cos(th), th};
};
export const coinA = (t: number) => {
  if (t >= UNWRAP[0] - 0.25 && t < CUT_SAT) {
    const ell = stripEll(t), k = stripK(t), p = stripAt(ell, k);
    const rolled = ell / R1, turn = t >= BEND[0] ? k * ell : 0;
    return {x: p.x + R1 * p.nx, z: p.z + R1 * p.nz, spin: 4 * Math.PI + rolled + turn};
  }
  const phi = trip(t) * TAU;
  return {...orbitPos(phi, R1, R1, B1), spin: 2 * phi};
};
export const orbitPos = (phi: number, R: number, r: number, c: [number, number]) => {
  const a = START + phi, D = R + r; // x = cos, z = -sin: counter-clockwise seen from above, -z up the page
  return {x: c[0] + D * Math.cos(a), z: c[1] - D * Math.sin(a)};
};

// ---------- graphite ink on the sheet (all self-drawing pencil: one look for every mark)
// 8 arrow stamps: where A was at each 1/8 of the trip, with its arrow; k = 0 and 4 point up the page (amber)
export const STAMPS = 8;
export const stamp = (t: number, k: number) => (t >= T0 && trip(t) >= k / STAMPS - 1e-6 ? ramp(t, stampT(k), stampT(k) + 0.25) : 0) * (1 - ramp(t, B.along - 0.5, B.along));
const stampT = (k: number) => { let a = T0, b = TEND; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (trip(m) < k / STAMPS) a = m; else b = m; } return k === 0 ? TEND : (a + b) / 2; };
export const stampAmber = (k: number) => k === 0 || k === 4;
// arrow pulse on A each time it points up the page again
export const arrowPulse = (t: number) =>
  hump(t, THALF - 0.15, 0.7) + hump(t, TEND - 0.15, 0.7) + hump(t, ALONG[1] - 0.2, 0.7) + hump(t, BEND[1] - 0.2, 0.7) + satPulse(t);
// A's centre route drawn round B during the pause (a pencil circle)
export const routeDraw = (t: number) => ramp(t, B.pause + 0.1, B.guessEnd + 1.2) * (1 - ramp(t, B.watch - 0.2, B.watch + 0.3));
// answer bubbles: lift on "Pause", 1 shaded (coral) on "once", 2 shaded (amber) on "twice"
export const bubbles = (t: number) => ramp(t, B.pause, B.pause + 0.4);
export const bubbleOne = (t: number) => ramp(t, B.once - 0.05, B.once + 0.55);
export const bubbleOneDim = (t: number) => ramp(t, B.twice, B.twice + 0.5);
export const bubbleTwo = (t: number) => ramp(t, B.twice + 0.05, B.twice + 0.65);
// tallies written beside the coins: [text, write-on 0..1]
export const tallyEq = (t: number): {text: string; w: number; pop: number}[] => {
  const out: {text: string; w: number; pop: number}[] = [];
  const fade = 1 - ramp(t, B.along - 0.5, B.along);
  if (t > THALF - 0.1 && fade > 0) out.push({text: t >= TEND - 0.05 ? '2' : '1', w: fade * ramp(t, THALF - 0.1, THALF + 0.2), pop: hump(t, THALF - 0.1, 0.5) + hump(t, TEND - 0.1, 0.5)});
  return out;
};
export const tallyStrip = (t: number) => ({one: ramp(t, ALONG[1] - 0.2, ALONG[1] + 0.15), plus: ramp(t, BEND[1] - 0.45, BEND[1] - 0.1), on: 1 - ramp(t, CUT_SAT - 0.3, CUT_SAT)});

// ---------- the 1982 pair: small coin rolls round the big one, spin = 4·phi, a count each quarter
const S0 = CUT_SAT + 0.6, S1 = B.four + 0.05;
export const satTrip = (t: number) => keys1d(t, [[S0, 0], [S0 + 0.5, 0.04], [S1 - 0.5, 0.96], [S1, 1]]);
const tripInv = (f: number) => { let a = S0, b = S1; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (satTrip(m) < f) a = m; else b = m; } return (a + b) / 2; };
export const SAT_COUNTS = [0.25, 0.5, 0.75, 1].map(tripInv);
export const satCount = (t: number) => SAT_COUNTS.filter((c) => t >= c - 0.05).length;
function satPulse(t: number) { return t < CUT_SAT ? 0 : SAT_COUNTS.reduce((a, c) => a + hump(t, c - 0.15, 0.6), 0); }
export const coinS = (t: number) => { const phi = satTrip(t) * TAU; return {...orbitPos(phi, RB, RS, B2), spin: 4 * phi}; };
// the key's answer: (B) 3 circled on "The key said three", struck in coral on "wasn't"; an amber 4 written beside
export const keyCircle = (t: number) => ramp(t, B.key + 0.35, B.key + 0.9);
export const keyStrike = (t: number) => ramp(t, B.wasnt - 0.05, B.wasnt + 0.3);
export const fourWrite = (t: number) => ramp(t, B.wasnt + 0.3, B.wasnt + 0.9);
// payoff: the stacks of answer sheets light up amber in a wave from ours outward
export const waveR = (t: number) => 320 * clamp01((t - B.thousand + 0.2) / (B.recalc + 1.6 - B.thousand)); // cm, an even-speed front
export const stacksOn = (t: number) => ramp(t, B.students - 0.6, B.students + 0.2);

// ---------- camera keys: [t, pos, look, mm]; a key with cut starts a new shot
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; cut?: boolean};
const at = (look: V3, d: number, elev: number, az = 0): V3 => {
  const e = (elev * Math.PI) / 180, a = (az * Math.PI) / 180;
  return [look[0] + d * Math.cos(e) * Math.sin(a), look[1] + d * Math.sin(e), look[2] + d * Math.cos(e) * Math.cos(a)];
};
const L1: V3 = [0, 0, -0.4];
const L2: V3 = [B2[0], 0, B2[1] + 0.6];
export const KEYS: Key[] = [
  {t: 0, pos: at([0.3, 0, 1.0], 18, 60, -3), look: [0, 0, 1.0], mm: 50},
  {t: B.roll, pos: at([0, 0, 0.9], 19, 62, 0), look: [0, 0, 0.9], mm: 50},
  {t: B.once, pos: at([0, 0, 0.6], 22, 64, 5), look: [0, 0, 0.6], mm: 50},
  {t: THALF, pos: at([0, 0, -0.6], 26, 72, 2), look: [0, 0, -0.6], mm: 50},
  {t: B.along, pos: at([2.6, 0, 0.4], 28, 72, -2), look: [2.6, 0, 0.4], mm: 50},
  {t: SPANS.ALONG[1], pos: at([3.4, 0, 0.4], 29, 72, -4), look: [3.4, 0, 0.4], mm: 50},
  {t: B.bend + 0.8, pos: at([0.6, 0, -1.3], 28, 72, 1), look: [0.6, 0, -1.3], mm: 50},
  {t: CUT_SAT, pos: at([0.4, 0, -1.2], 27, 71, 3), look: [0.4, 0, -1.2], mm: 50},
  {t: CUT_SAT, cut: true, pos: at(L2, 35, 70, -3), look: L2, mm: 50},
  {t: B.four, pos: at(L2, 36, 72, 2), look: L2, mm: 50},
  {t: B.wasnt + 0.6, pos: at([0, 0, L2[2] + 0.6], 36, 74, 3), look: [0, 0, L2[2] + 0.6], mm: 50},
  {t: B.thousand, pos: at([0, 0, 14], 70, 60, 6), look: [0, 0, 14], mm: 50},
  {t: DUR_S, pos: at([0, 0, -12], 165, 50, 10), look: [0, 0, -12], mm: 50},
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
  return {pos: v((k) => k.pos), look: v((k) => k.look), mm: lerp(b.mm, c.mm, u)};
};
