// Every state of the film as a pure function of time t (seconds), cued from the spoken words (cue/cueEnd), so a new
// voiceover re-times the film. No React, no three scene objects.
import {cue, VO_END} from './lib';

export const DUR_S = VO_END + 2.2;

// ---------- world (metres): tower axis x = z = 0, ground y = 0, sway along +X, camera on the +Z side
export const FLOOR = 4.29;
export const TRUNK_TOP = 112, MOD_H = 34.3, MODS = 8, CROWN_TOP = 448, SPIRE_TOP = 508;
export const MODS_TOP = TRUNK_TOP + MODS * MOD_H; // 386.4
export const BALL_R = 2.75, BALL_Y = 380, HANG_Y = 395.5, PISTON_Y = 376.4, SLAB_LOW = 375.0;
export const BAND: [number, number] = [358.5, 398.5]; // floors ~86-93: the x-ray / cutaway band
export const GOLD = '#FFB547', CORAL = '#FF5A4E', HEAT = '#FF8A4C', GLASS = '#EAF6FF';

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- beats (from the words)
export const B = {
  ball: cue('ball hanging'), taipei: cue('Taipei'), wind: cue('Wind'), shoves: cue('shoves'), sway: cue('starts to sway.'),
  but: cue('But'), cables: cue('cables,'), pendulum: cue('pendulum.'),
  tuned: cue("It's tuned"), behind: cue('behind it.'),
  so: cue('So as'), against: cue('against it.'),
  pistons: cue('Pistons'), heat: cue('heat.'),
  without: cue('Without'), farther: cue('farther.'),
  withIt: cue('With it,'), percent: cue('percent.'),
  typhoon2015: cue('In a'), meter: cue('meter.'),
  end: VO_END,
};

// ---------- cuts (hard cuts between the exterior and the cutaway; motion-principles "Hard cuts are allowed")
export const CUT_IN = B.but - 0.12;          // exterior wide -> cutaway on the ball
export const CUT_OUT = B.without - 0.12;     // cutaway (pistons) -> exterior wide with the ghost
export const CUT_IN2 = B.typhoon2015 - 0.12; // exterior -> low on the ball and the 1 m bar
export const CUT_END = B.end + 0.9;          // -> the cover frame (loop)
export const CUTS = [CUT_IN, CUT_OUT, CUT_IN2, CUT_END];
export const closeShot = (t: number) => (t >= CUT_IN && t < CUT_OUT) || (t >= CUT_IN2 && t < CUT_END);

// ---------- sway: tower x(t) = A sin(wt), ball relative to the floor y(t) = -A k cos(wt) (a quarter wave behind:
// a tuned damper's motion lags the tower's by ~90 deg, so its pull opposes the tower's velocity)
export const PERIOD = 4.0;
const W = (2 * Math.PI) / PERIOD;
const T0 = B.shoves + 0.1;
export const swayAmp = (t: number) => 0.1 + 0.9 * ramp(t, B.shoves - 0.2, B.shoves + 2.2) + 0.6 * ramp(t, B.typhoon2015 + 0.2, B.meter + 0.25);
const phase = (t: number) => W * (t - T0);
export const towerX = (t: number) => swayAmp(t) * Math.sin(phase(t)); // -1..1 (1.6 in the 2015 typhoon)
export const ballY = (t: number) => -swayAmp(t) * Math.cos(phase(t));
export const ballV = (t: number) => { const h = 1 / 60; return (ballY(t + h) - ballY(t - h)) / (2 * h); };
export const towerV = (t: number) => { const h = 1 / 60; return (towerX(t + h) - towerX(t - h)) / (2 * h); };
// tip amplitude (m) shown in each place: exaggerated in the wide, near real in the cutaway
export const TIP_WIDE = 18, GHOST_K = 1 / 0.6; // 40 % less with the ball -> the ghost sways 1.67x
// after the last cut the film loops to the calm cover frame: the sway drops back to the cover's
const calm = (t: number) => (t >= CUT_END ? 0.1 / swayAmp(t) : 1);
export const tipAmp = (t: number) => (closeShot(t) ? 0.35 / bendShape(BALL_Y) : TIP_WIDE * calm(t));
// ball swing relative to its floor (m): 0.62 m at full sway, 1.0 m in the 2015 typhoon
export const BALL_SWING = 0.62;
export const ballAmp = (t: number) => (closeShot(t) ? BALL_SWING : 2.2 * calm(t));
// cantilever bending shape, 1 at the crown roof
export const bendShape = (h: number) => { const u = Math.min(h, CROWN_TOP) / CROWN_TOP; return (u * u * (3 - u)) / 2 + Math.max(0, h - CROWN_TOP) * 0.0034; };

// ---------- x-ray / cutaway
export const XRAY0 = 0.4; // the cover already shows the ball faintly through the glass
export const xray = (t: number) => (t < CUT_IN ? XRAY0 + (1 - XRAY0) * ramp(t, B.ball - 0.1, B.ball + 0.6) : t >= CUT_END ? XRAY0 : 1);
export const cutaway = (t: number) => (closeShot(t) ? 1 : 0); // front wall of the band removed in close shots
export const labelTaipei = (t: number) => ramp(t, B.taipei - 0.1, B.taipei + 0.4) * (1 - ramp(t, B.wind - 0.2, B.wind + 0.2));
export const exaggerated = (t: number) => (t < CUT_IN ? ramp(t, B.shoves, B.shoves + 0.5) : t >= CUT_OUT && t < CUT_IN2 ? 1 : 0);
// wind and rain
export const windOn = (t: number) => 0.25 + 0.75 * ramp(t, B.wind - 0.3, B.wind + 0.5);
export const rainOn = (t: number) => 0.45 + 0.55 * ramp(t, B.taipei, B.wind + 0.5);
export const cloudShift = (t: number) => 30 * t + 40 * Math.max(0, t - B.wind);

// ---------- trails (wide): the tip's arc over the last `len` seconds, for the real tower and the ghost
export const tipTrailOn = (t: number) => (t < CUT_IN ? ramp(t, B.shoves, B.shoves + 0.6) : 0);
export const ghostOn = (t: number) => (t >= CUT_OUT && t < CUT_IN2 ? ramp(t, B.without - 0.05, B.without + 0.5) * (1 - 0.75 * ramp(t, B.percent - 0.3, B.percent + 0.6)) : 0);
export const realTrailOn = (t: number) => (t >= CUT_OUT && t < CUT_IN2 ? ramp(t, B.withIt - 0.2, B.withIt + 0.4) : 0);
export const lessLabel = (t: number) => (t >= CUT_OUT && t < CUT_IN2 ? ramp(t, B.percent - 0.6, B.percent - 0.1) : 0);
export const tipPoint = (tt: number, amp: number): [number, number] => {
  const x = amp * towerX(tt); return [x, CROWN_TOP - (x * x) / 70];
};
export const tipTrail = (t: number, amp: number, len = 4.0, n = 64): [number, number, number][] => {
  const pts: [number, number, number][] = [];
  for (let k = 0; k < n; k++) { const tt = t - len + (len * k) / (n - 1); const [x, y] = tipPoint(tt, amp); pts.push([x, y, (k / n) * 0.5]); }
  return pts;
};

// ---------- cutaway devices
export const cableGlow = (t: number) => hump(t, B.cables - 0.1, 1.2);
// pens: a coral one on the floor edge (the tower), an amber one under the ball; each draws its wave on a strip
// that scrolls down at TRACE_V m/s; TRACE_K scales the side-to-side motion so both waves read
export const TRACE_V = 1.15, TRACE_K = 3.2, TRACE_LEN = 4.4;
export const tracesOn = (t: number) => (t >= CUT_IN && t < CUT_OUT ? ramp(t, B.tuned - 0.1, B.tuned + 0.5) * (1 - ramp(t, B.pistons - 0.2, B.pistons + 0.5)) : 0);
export const pullOn = (t: number) => (t >= CUT_IN && t < CUT_OUT ? ramp(t, B.so - 0.1, B.so + 0.4) * (1 - ramp(t, B.pistons - 0.2, B.pistons + 0.3)) : 0);
export const heatOn = (t: number) => (t >= CUT_IN && t < CUT_OUT ? ramp(t, B.pistons - 0.3, B.pistons + 0.3) : t >= CUT_IN2 ? 0.6 : 0.25);
export const meterBar = (t: number) => (t >= CUT_IN2 && t < CUT_END ? ramp(t, B.typhoon2015 + 0.3, B.typhoon2015 + 0.9) : 0);
export const meterHit = (t: number) => (t >= CUT_IN2 && t < CUT_END ? ramp(t, B.meter - 0.2, B.meter + 0.15) : 0);
// in the 2015 typhoon the ball's swing grows to exactly 1.0 m and is held there on "meter"
export const ballSwingM = (t: number) => {
  if (t >= CUT_IN2) {
    const a = lerp(BALL_SWING, 1.0, ramp(t, B.typhoon2015 + 0.2, B.meter + 0.1));
    return a * (ballY(t) / swayAmp(t));
  }
  return ballAmp(t) * ballY(t);
};

// ---------- camera keys: [t, pos, look, mm]. A key with cut: true starts a new shot at its t.
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; cut?: boolean};
const WIDE_POS: V3 = [-30, 300, 375], WIDE_LOOK: V3 = [0, 330, 0];
export const KEYS: Key[] = [
  // 1-3 exterior: the tower top, the ball through the glass, pull back to the upper tower, slow orbit in the wind
  {t: 0, pos: [7, 384, 70], look: [0, 382, 0], mm: 35},
  {t: B.ball + 0.7, pos: [4, 381, 56], look: [0, 380.5, 0], mm: 35},
  {t: B.taipei + 0.3, pos: [-6, 350, 190], look: [0, 365, 0], mm: 35},
  {t: B.wind + 0.3, pos: [-25, 305, 360], look: [0, 335, 0], mm: 35},
  {t: CUT_IN, pos: [-60, 300, 355], look: [0, 340, 0], mm: 35},
  // 4-7 cutaway: the ball, the pens, the pull, crane down to the pistons
  {t: CUT_IN, cut: true, pos: [3, 380.5, 31], look: [0, 380.5, 0], mm: 35},
  {t: B.tuned + 0.4, pos: [0, 377.5, 34], look: [0, 377.5, 0], mm: 35},
  {t: B.so + 0.3, pos: [-2, 379, 30], look: [0, 378.5, 0], mm: 35},
  {t: B.pistons + 0.4, pos: [6, 381.5, 17], look: [0, 376.6, 0], mm: 35},
  {t: CUT_OUT, pos: [8, 381, 15.5], look: [0, 376.6, 0], mm: 35},
  // 8-9 exterior: ghost and real tower
  {t: CUT_OUT, cut: true, pos: [-20, 380, 410], look: [0, 398, 0], mm: 35},
  {t: CUT_IN2, pos: [10, 385, 375], look: [0, 404, 0], mm: 35},
  // 10 the ball and the 1 m bar, low
  {t: CUT_IN2, cut: true, pos: [3, 381.5, 19], look: [0.5, 376.8, 3], mm: 35},
  {t: CUT_END, pos: [1.5, 381, 16.5], look: [0.5, 376.6, 3.5], mm: 35},
  // loop: the cover frame
  {t: CUT_END, cut: true, pos: [7.3, 384.2, 72], look: [0, 382, 0], mm: 35},
  {t: DUR_S + 0.5, pos: [7, 384, 70], look: [0, 382, 0], mm: 35},
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
