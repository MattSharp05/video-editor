// Every state of the film as a pure function of time t (seconds), cued from the spoken words, so a new voiceover
// re-times the film. Units: metres. A storage building at night: 10 floors × 10 units, wide double doors facing +z.
import {cue, cueEnd, VO_END} from './lib';

export const DUR_S = VO_END + 2.0;
export const AMBER = '#FFB547', CORAL = '#FF5A4E', ICE = '#CFE6FF';

// ---------- building
export const COLS = 10, FLOORS = 10, CW = 3.0, FH = 3.2, DW = 2.6, DH = 2.5, UNIT_D = 6.0;
export const unitX = (c: number) => (c - 5) * CW;             // c = 4, 5, 6 are doors 1, 2, 3 of the three-door game
export const floorY = (f: number) => f * FH;
export const idx = (c: number, f: number) => f * COLS + c;
export const GAME = [idx(4, 0), idx(5, 0), idx(6, 0)];      // doors 1, 2, 3
export const MINE = GAME[0];                                  // your pick, in both games
export const CAR100 = idx(7, 6);                             // the door the host leaves shut in the hundred game
export const FACADE_C: [number, number] = [unitX(4.5), floorY(FLOORS) / 2];

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const keys1d = (t: number, K: [number, number][]) => {
  if (t <= K[0][0]) return K[0][1];
  if (t >= K[K.length - 1][0]) return K[K.length - 1][1];
  let i = 0; while (K[i + 1][0] < t) i++;
  return lerp(K[i][1], K[i + 1][1], smooth((t - K[i][0]) / (K[i + 1][0] - K[i][0])));
};

// ---------- beats (from the words)
export const B = {
  three: cue('Three doors: a', 0), car: cue('a car behind'), goats: cue('goats behind'), pick: cue('You pick door one.'),
  host: cue('The host knows'), alwaysOpens: cue('always opens a goat'), goatDoor: cue('goat door you'), didnt: cueEnd("you didn't pick."),
  switchQ: cue('Should you switch'), pause: cue('Pause and guess.'), guessEnd: cueEnd('Pause and guess.'), fifty: cue('It feels'),
  hundred: cue('Now try'), yourPick: cue('Your pick'), chance: cueEnd('chance.'), host98: cue('The host always'),
  leftShut: cue('The one door'), chances: cue('chances.'), threeAgain: cue('With three doors'), twoTimes: cue('two times'),
  marilyn: cue('Marilyn'), alwaysSwitch: cue('always switch.'), end: VO_END,
};
export const CUT_BACK = B.threeAgain - 0.12; // the hundred-door building -> the three doors again

// ---------- the three-door game (before CUT_BACK) and its replay after it
// reveal: the three doors open (goat, goat, car), close, the lights black out; behind the blackout the car moves to door 2
const REVEAL0 = B.three + 0.15, RCLOSE = B.goats + 1.05;
export const BLACK = [RCLOSE + 0.3, Math.max(RCLOSE + 0.85, B.pick - 0.1)] as const;
export const lights = (t: number) => {
  // the yard's pole lights: 1, out for the blackout (the car is hidden), then on again
  const black = ramp(t, BLACK[0] - 0.08, BLACK[0]) * (1 - ramp(t, BLACK[1] - 0.12, BLACK[1]));
  return 1 - 0.94 * black;
};
export const carAt = (t: number) => (t < (BLACK[0] + BLACK[1]) / 2 ? 2 : 1); // game index of the car's door (0..2)
// the host's searchlight in the three-door game: comes on over door 2 (skipping your door), lingers, moves to door 3
export const beam3 = (t: number) => ({
  on: ramp(t, B.host + 0.05, B.host + 0.4) * (1 - ramp(t, B.didnt + 0.3, B.didnt + 0.8)),
  x: keys1d(t, [[B.host + 0.4, unitX(5)], [B.alwaysOpens + 0.2, unitX(5)], [B.goatDoor - 0.1, unitX(6)]]),
});
export const carGleam = (t: number) => hump(t, B.host + 0.4, B.alwaysOpens - B.host + 0.1); // under door 2 while the beam lingers
// door opening 0..1 for the three game doors
export const gameDoor = (t: number, g: number): number => {
  if (t >= CUT_BACK) {
    if (g === 2) return 1;                                        // door 3 stays open (its goat)
    if (g === 1) return ramp(t, B.marilyn + 0.15, B.marilyn + 0.9); // door 2: the car
    return 0;
  }
  const reveal = ramp(t, REVEAL0 + g * 0.18, REVEAL0 + g * 0.18 + 0.55) * (1 - ramp(t, RCLOSE + g * 0.08, RCLOSE + g * 0.08 + 0.45));
  const host = g === 2 ? ramp(t, B.goatDoor + 0.05, B.goatDoor + 0.65) * (1 - ramp(t, B.hundred - 0.1, B.hundred + 0.5)) : 0;
  return Math.max(reveal, host);
};
export const pickGlow = (t: number) => ramp(t, B.pick + 0.25, B.pick + 0.7);
export const goat3Step = (t: number) => ramp(t, B.switchQ, B.fifty + 0.6) * (t < B.hundred ? 1 : 0); // door 3's goat steps out a little
export const fiftyOn = (t: number) => ramp(t, B.fifty + 0.05, B.fifty + 0.4) * (1 - ramp(t, B.hundred - 0.2, B.hundred + 0.2));

// ---------- the hundred-door game
// the building's walkway lamps come on in a wave from the three doors outward as the camera pulls back
export const lampOn = (t: number, c: number, f: number) => {
  if (t >= CUT_BACK) return 1;
  const d = Math.hypot(unitX(c) - unitX(5), floorY(f));
  return ramp(t, B.hundred + 0.2 + d * 0.035, B.hundred + 0.5 + d * 0.035);
};
// your 1 against the other 99: an amber glow on every other door's frame
export const group = (t: number) => ramp(t, B.yourPick + 0.5, B.chance + 0.1) * (t < CUT_BACK ? 1 : 0);
export const onePct = (t: number) => ramp(t, B.yourPick + 0.6, B.yourPick + 1.0) * (t < CUT_BACK ? 1 : 0);
// the host's sweep: serpentine from the top floor down, skipping your door and the car's
export const ORDER: number[] = (() => {
  const o: number[] = [];
  for (let f = FLOORS - 1; f >= 0; f--) for (let k = 0; k < COLS; k++) { const c = (FLOORS - 1 - f) % 2 ? COLS - 1 - k : k; const i = idx(c, f); if (i !== MINE && i !== CAR100) o.push(i); }
  return o;
})();
const W0 = B.host98 + 0.45, W1 = B.leftShut - 0.15;
export const openAt = (rank: number) => W0 + ((W1 - W0) * rank) / (ORDER.length - 1);
export const RANK: Record<number, number> = Object.fromEntries(ORDER.map((d, r) => [d, r]));
export const door100 = (t: number, i: number) => {
  if (t >= CUT_BACK || !(i in RANK)) return 0;
  const a = openAt(RANK[i]); return ramp(t, a, a + 0.45) * (1 - ramp(t, B.threeAgain - 0.5, B.threeAgain)) ;
};
// the searchlight follows the opening order
export const beam100 = (t: number) => {
  const on = ramp(t, W0 - 0.4, W0) * (1 - ramp(t, W1, W1 + 0.4));
  const r = Math.max(0, Math.min(ORDER.length - 1, ((t - W0) / (W1 - W0)) * (ORDER.length - 1)));
  const a = ORDER[Math.floor(r)], b = ORDER[Math.min(ORDER.length - 1, Math.floor(r) + 1)], k = r - Math.floor(r);
  const p = (i: number) => [unitX(i % COLS), floorY(Math.floor(i / COLS)) + DH / 2];
  return {on, x: lerp(p(a)[0], p(b)[0], k), y: lerp(p(a)[1], p(b)[1], k)};
};
// each opened door's amber flows to the last shut door: a streak launched at its open time, 0.9 s flight
export const FLIGHT = 0.9;
export const absorbed = (t: number) => ORDER.filter((_, r) => t >= openAt(r) + 0.25 + FLIGHT).length / ORDER.length;
export const pct99 = (t: number) => ramp(t, B.chance - 0.1, B.chance + 0.35) * (t < CUT_BACK ? 1 : 0); // "99%" appears on the group
export const pct99Move = (t: number) => ramp(t, B.leftShut, B.chances + 0.2);                     // and travels to the last door

// ---------- back at three doors: 1/3 on yours, 2/3 on the pair, door 3's share flows into door 2
export const thirds = (t: number) => (t >= CUT_BACK ? 1 : 0) * (1 - ramp(t, B.marilyn + 0.1, B.marilyn + 0.6));
export const flow3 = (t: number) => ramp(t, B.twoTimes - 0.1, B.twoTimes + 0.9);
export const headlights = (t: number) => (t >= B.alwaysSwitch - 0.15 ? 1 : 0) * (0.6 + 0.4 * (1 - hump(t, B.alwaysSwitch - 0.15, 0.25)));

// ---------- envelopes (the letters): falling through the hook
export const envelopeTime = (t: number) => t;

// ---------- camera keys
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; cut?: boolean};
const WIDE_LOOK: V3 = [FACADE_C[0], 17.8, 0];
export const KEYS: Key[] = [
  {t: 0, pos: [0.5, 0.9, 16.5], look: [0.2, 3.6, 0], mm: 35},
  {t: B.three, pos: [0, 1.0, 15.6], look: [0, 3.4, 0], mm: 35},
  {t: B.pick, pos: [-0.3, 1.0, 16.2], look: [0, 3.4, 0], mm: 35},
  {t: B.host, pos: [0.4, 1.05, 16.2], look: [0.2, 3.4, 0], mm: 35},
  {t: B.pause, pos: [-0.3, 1.0, 16.4], look: [0, 3.3, 0], mm: 35},
  {t: B.hundred, pos: [0.3, 1.1, 16.2], look: [0, 3.4, 0], mm: 35},
  {t: B.yourPick, pos: [-1.0, 10, 42], look: [-1.0, 12, 0], mm: 35},
  {t: B.chance + 0.3, pos: [FACADE_C[0], 17.8, 63], look: WIDE_LOOK, mm: 35},
  {t: B.leftShut, pos: [FACADE_C[0] + 0.8, 17.8, 64], look: WIDE_LOOK, mm: 35},
  {t: CUT_BACK, pos: [1.5, 17.5, 54], look: [1.5, 16.5, 0], mm: 35},
  {t: CUT_BACK, cut: true, pos: [0.6, 1.0, 15.6], look: [0.2, 3.4, 0], mm: 35},
  {t: B.marilyn, pos: [0.3, 1.0, 13.5], look: [0.1, 2.6, 0], mm: 35},
  {t: DUR_S, pos: [0.1, 0.95, 11.5], look: [0, 2.2, 0], mm: 35},
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
