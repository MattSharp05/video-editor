// Every state of the film as a pure function of time t (seconds), cued from the spoken words, so a new voiceover
// re-times the film. No React, no three scene objects.
import {cue, VO_END} from './lib';

export const DUR_S = VO_END + 2.2;

// ---------- world (metres): engine axis along +X (air flows +X; the plane moves toward -X), fan face x = 0
export const AXIS_Y = 2.2;
export const FAN_R = 1.08, CORE_R = 0.34; // lanes inside CORE_R at the fan go into the core: (0.34/1.08)^2 = 1 in 10
export const DUCT: [number, number] = [0.62, 1.1];
export const X_COMP: [number, number] = [0.45, 1.55], X_BURN: [number, number] = [1.6, 2.15], X_TURB: [number, number] = [2.15, 3.1];
export const X_DUCT_END = 2.75, X_NOZZLE = 4.2;
export const CYAN = '#6FD6FF', CORAL = '#FF5A3C', AMBER = '#FFB547', GLASS = '#EAF6FF';

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- beats
export const B = {
  fire: cue('with fire.'), but: cue('But most'), air: cue('air that'), flame: cue('flame.'),
  watch: cue('Watch'), fan: cue('giant fan'), gulp: cue('gulp.'),
  today: cue("In today's"), one: cue('one part'), core: cue('the core.', 0),
  there: cue("There it's"), squeezed: cue('squeezed,'), fuel: cue('fuel'), burned: cue('burned.'),
  blast: cue('hot blast'), turbines: cue('turbines,'), last: cue('last one'), turnsFan: cue('turns the fan.'),
  other: cue('The other'), never: cue('never burn.'), shoves: cue('shoves'), around: cue('around the core.'),
  that: cue('That huge'), slower: cue('slower'), most: cue('most of the thrust.'),
  so: cue('So the fire'), spins: cue('spins the fan,'), pushing: cue('pushing.'),
  end: VO_END,
};

// ---------- cuts
export const CUT_IN = B.today - 0.12;  // side view -> close at the fan face (the ten beads)
export const CUT_BACK = B.that - 0.12; // inside -> behind the engine (the two streams)
export const CUTS = [CUT_IN, CUT_BACK];

// ---------- plane motion: takeoff roll, then liftoff at the end
export const groundSpeed = (t: number) => 38 + 1.1 * t; // m/s along +X (ground moves past the engine)
export const groundShift = (t: number) => 38 * t + 0.55 * t * t;
export const liftoff = (t: number) => ramp(t, B.spins - 0.6, B.end + 2.0); // 0..1
export const climb = (t: number) => { const k = Math.max(0, t - (B.spins - 0.6)); return 0.9 * k * k; }; // metres the ground has dropped
export const pitchDeg = (t: number) => 7 * liftoff(t);

// ---------- engine states
export const cowlOpen = (t: number) => ramp(t, B.but - 0.05, B.but + 0.9); // the near cowling swings up on its hinge
export const fanSpin = (t: number) => 0.9 * t + 1.1 * Math.max(0, t - B.fan) ** 2 * 0.5 * (1 - 0) ; // turns (revs) of the rotor joint (display speed)
// the exhaust's hot glow: strong in the hook (the belief), down to a trace in the cutaway, the hot jet again behind
export const fireGlow = (t: number) => (t >= CUT_BACK ? 0.6 : 0.75 + 0.25 * hump(t, B.fire - 0.2, 1.4) - 0.65 * ramp(t, B.but, B.but + 1));
export const burnGlow = (t: number) => ramp(t, B.burned - 0.3, B.burned + 0.2) * (t < CUT_BACK ? 1 : 0.7) + 0.25;
export const turbineGlow = (t: number) => ramp(t, B.blast - 0.2, B.blast + 0.6);
export const shaftPulse = (t: number) => clamp01((t - (B.last - 0.1)) / (B.turnsFan - B.last + 0.5)); // 0 at the last turbine -> 1 at the fan
export const shaftOn = (t: number) => (t < CUT_BACK ? ramp(t, B.last - 0.3, B.last) * (1 - ramp(t, B.other - 0.2, B.other + 0.4)) : 0);
export const fanHubGlow = (t: number) => (t < CUT_BACK ? hump(t, B.turnsFan - 0.2, 1.6) : 0);

// ---------- air beads: two streams. Flow on from "air".
export const flowOn = (t: number) => ramp(t, B.but + 0.3, B.air + 0.4);
// speed (m/s, display) along x for each path; the core slows in the compressor (bunching = squeezed) and races out
export const speedBypass = (x: number) => (x < 0 ? 2.2 : 3.0);
export const speedCore = (x: number) => (x < X_COMP[0] ? 2.2 : x < X_COMP[1] ? 0.9 : x < X_BURN[1] ? 1.6 : 4.5);
// radius along the path for a lane with radius r0 at the fan face
export const radiusBypass = (x: number, r0: number) => {
  const d = DUCT[0] + ((r0 - CORE_R) / (FAN_R - CORE_R)) * (DUCT[1] - DUCT[0]);
  if (x < 0) return lerp(r0, r0 * 1.15, clamp01(-x / 4));
  if (x < 0.5) return lerp(r0, d, x / 0.5);
  if (x < X_DUCT_END) return d;
  return d * (1 - 0.06 * Math.min(1, (x - X_DUCT_END) / 3));
};
export const radiusCore = (x: number, r0: number) => {
  const k = r0 / CORE_R;
  if (x < 0) return lerp(r0, r0 * 1.15, clamp01(-x / 4));
  if (x < X_COMP[0]) return lerp(r0, 0.26 + 0.1 * k, x / X_COMP[0]);
  if (x < X_TURB[1]) return 0.26 + 0.1 * k + 0.06 * Math.sin(Math.PI * clamp01((x - X_BURN[0]) / (X_TURB[1] - X_BURN[0])));
  if (x < X_NOZZLE) return lerp(0.26 + 0.1 * k, 0.06 + 0.15 * k, (x - X_TURB[1]) / (X_NOZZLE - X_TURB[1]));
  return 0.06 + 0.15 * k;
};
// tables: x after `age` seconds from x0 = -4
const X0 = -4.5;
const table = (sp: (x: number) => number) => { const xs = [X0]; let x = X0; for (let i = 0; i < 1600; i++) { x += sp(x) / 60; xs.push(x); } return xs; };
const TB = table(speedBypass), TC = table(speedCore);
export const xAfter = (core: boolean, age: number) => { const T = core ? TC : TB; const f = Math.max(0, age * 60); const i = Math.floor(f); return i >= T.length - 1 ? T[T.length - 1] : lerp(T[i], T[i + 1], f - i); };
export const BEAD_LIFE = 9;
// colour state of a core bead at x: 0 cold, 1 squeezed, 2 burned
export const coreHeat = (x: number) => (x < X_COMP[0] ? 0 : x < X_BURN[0] ? (x - X_COMP[0]) / (X_BURN[0] - X_COMP[0]) : 1 + clamp01((x - X_BURN[0]) / 0.25));

// ---------- the ten counting beads (beat 4): a column arrives at the fan; the one in the middle goes into the core
export const TEN_R = [1.06, 0.92, 0.78, 0.64, 0.0, -0.5, -0.66, -0.82, -0.98, 0.5]; // signed radius (y), index 4 = core
export const tenOn = (t: number) => (t >= CUT_IN && t < CUT_BACK ? ramp(t, CUT_IN, CUT_IN + 0.3) : 0);
// x of the column: arrives at the fan face on "one part", the core bead then travels on its own clock
export const tenX = (t: number) => lerp(-2.6, 0.05, smooth((t - CUT_IN) / (B.one + 0.25 - CUT_IN)));
export const tenBypassX = (t: number) => (t < B.one + 0.25 ? tenX(t) : 0.05 + 0.75 * (t - B.one - 0.25) + 0.12 * Math.max(0, t - B.burned) ** 2);
export const coreBeadX = (t: number) => {
  const k = [[B.one + 0.25, 0.05], [B.core + 0.3, 0.4], [B.squeezed + 0.2, 1.0], [B.fuel, 1.55], [B.burned + 0.2, 1.95], [B.blast + 0.3, 2.35], [B.turbines + 0.2, 2.9], [B.last + 0.2, 3.3], [B.turnsFan + 0.6, 4.6], [CUT_BACK, 6.5]];
  if (t <= k[0][0]) return tenX(t);
  for (let i = 0; i < k.length - 1; i++) if (t < k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], smooth((t - k[i][0]) / (k[i + 1][0] - k[i][0])));
  return k[k.length - 1][1];
};
export const labelOne = (t: number) => (t >= CUT_IN && t < CUT_BACK ? ramp(t, B.one, B.one + 0.4) * (1 - ramp(t, B.there - 0.3, B.there)) : 0);
export const labelNine = (t: number) => (t >= CUT_IN && t < CUT_BACK ? Math.max(ramp(t, B.one + 0.5, B.one + 0.9) * (1 - ramp(t, B.there - 0.2, B.there + 0.2)), ramp(t, B.other - 0.1, B.other + 0.4)) : 0);
export const labelParts = (t: number) => (t >= CUT_IN && t < CUT_BACK ? ramp(t, B.there, B.there + 0.4) * (1 - ramp(t, B.other - 0.4, B.other)) : 0);

// ---------- behind the engine: two streams and two thrust arrows
export const streamsOn = (t: number) => (t >= CUT_BACK ? ramp(t, CUT_BACK, CUT_BACK + 0.5) : 0);
export const arrowsOn = (t: number) => (t >= CUT_BACK ? ramp(t, B.most - 0.5, B.most + 0.2) : 0);
export const labelMost = (t: number) => (t >= CUT_BACK ? ramp(t, B.most - 0.2, B.most + 0.3) * (1 - ramp(t, B.so - 0.3, B.so + 0.2)) : 0);

// ---------- camera keys
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; cut?: boolean};
export const KEYS: Key[] = [
  // 1-3: the engine on the takeoff roll: front 3/4, then the side, drifting toward the intake
  {t: 0, pos: [2.3, 0.8, 11.2], look: [2.7, 2.45, 0], mm: 24},
  {t: B.fire + 0.2, pos: [2.5, 1.2, 9.6], look: [2.8, 2.3, 0], mm: 30},
  {t: B.flame, pos: [2.1, 2.0, 8.4], look: [2.1, 2.25, 0], mm: 35},
  {t: CUT_IN, pos: [0.3, 2.15, 7.4], look: [0.9, 2.25, 0], mm: 35},
  // 4-7: close at the fan face, then follow the core bead back, pull back along the bypass
  {t: CUT_IN, cut: true, pos: [-2.3, 2.3, 4.5], look: [0.0, 2.25, 0], mm: 35},
  {t: B.core + 0.4, pos: [0.0, 2.3, 4.0], look: [0.45, 2.2, 0], mm: 35},
  {t: B.squeezed + 0.3, pos: [0.6, 2.2, 2.9], look: [1.0, 2.2, 0], mm: 35},
  {t: B.burned + 0.3, pos: [1.5, 2.2, 2.8], look: [1.9, 2.2, 0], mm: 35},
  {t: B.turbines, pos: [2.2, 2.25, 3.2], look: [2.5, 2.2, 0], mm: 35},
  {t: B.turnsFan + 0.2, pos: [1.5, 2.3, 6.3], look: [1.6, 2.2, 0], mm: 35},
  {t: B.around, pos: [2.6, 2.3, 7.8], look: [2.4, 2.2, 0], mm: 35},
  {t: CUT_BACK, pos: [3.0, 2.3, 8.0], look: [2.6, 2.2, 0], mm: 35},
  // 8-9: behind and to the side, the two streams and arrows, then pull back for the liftoff
  {t: CUT_BACK, cut: true, pos: [6.4, 1.9, 5.6], look: [1.6, 2.15, 0], mm: 30},
  {t: B.so, pos: [7.4, 2.1, 6.8], look: [1.3, 2.25, 0], mm: 30},
  {t: DUR_S + 0.3, pos: [9.5, 1.5, 10.0], look: [1.0, 2.6, 0], mm: 30},
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
