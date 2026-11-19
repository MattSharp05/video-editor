// Every state of the film as a pure function of time t (seconds). Times come from spoken words
// (cue/cueEnd), so a new voiceover re-times the film. No React, no three scene objects.
import {cue, VO_END} from './lib';

export const DUR_S = VO_END + 2.2;

// ---------- world (metres). Body stands at the origin, feet on y = 0, faces +Z; the body's LEFT is +X.
export const CHEST_Y = 1.36;            // heart centre height (standing)
export const SKIN_Z = 0.188;            // front of the chest at the midline
export const HEART_C: V3 = [0.035, CHEST_Y, 0.075];  // heart centre (just behind the breastbone)
export const HEART_LEN = 0.13;          // base -> apex
export const LEAN = 45;                 // degrees the long axis leans toward the body's left (front view)
export const LEAN_FWD = 18;             // degrees the apex tips forward
// the apex (tip) projected forward onto the skin: ~8 cm left of the midline (Gray's: 8-9 cm, 5th rib gap). The myth glow
// sits here too: the beat people feel on the left is the tip.
export const MYTH: V3 = [0.08, 1.31, 0.19];
export const STERNUM = {top: 1.52, bottom: 1.29, z: 0.17};
export const PUSH: V3 = [0, 1.34, SKIN_Z];
export const APEX_SKIN: V3 = [0.08, 1.31, 0.19]; // where the apex beat is felt: 5th rib gap, ~8-9 cm left of the midline // CPR spot: centre of the chest, lower half of the breastbone
export const AMBER = '#FFB547', CORAL = '#FF5A4E', GLASS = '#EAF6FF', HEART_RED = '#B3202A';
export type V3 = [number, number, number];

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- beats (from the words)
export const B = {
  left: cue('left side', 0), look: cue('Look inside.'), middle: cue('near the middle'), breast: cue('breastbone', 0),
  leans: cue('leans'), tip: cue('tip points'), thatTip: cue('That tip'), feel: cue('feel the beat.'),
  matters: cue('And that matters'), cpr: cue('CPR.'), dont: cue("Don't push"), push: cue('Push hard'),
  centre: cue('lower half'), squeezes: cue('squeezes'), spine: cue('spine,'), blood: cue('some blood'),
  brain: cue('brain.'), two: cue('two times'), help: cue('help comes.'), end: VO_END,
};

// ---------- cuts (hard cuts between worlds; motion-principles "Hard cuts are allowed")
export const CUT_CPR = B.matters - 0.12;   // standing glass body -> lying body seen from above
export const lying = (t: number) => t >= CUT_CPR;

// ---------- heartbeat (standing): ~70 bpm, lub-dub. Returns 0..1 contraction.
export const BPM = 70;
export const beat = (t: number) => {
  const p = (t * BPM) / 60; const f = p - Math.floor(p);
  return Math.exp(-((f - 0.05) ** 2) / 0.003) + 0.6 * Math.exp(-((f - 0.2) ** 2) / 0.003);
};
export const beatTimes = (a: number, b: number) => { const out: number[] = []; for (let k = Math.ceil((a * BPM) / 60); (k * 60) / BPM < b; k++) out.push((k * 60) / BPM + 0.05 * 60 / BPM); return out; };

// ---------- skin -> glass, the myth glow, the centre sheet, the lean, the apex pulses
export const glass = (t: number) => ramp(t, B.left - 0.1, B.look + 0.4);
// the glass wipes down from the shoulders: skin below this height, glass above
export const wipeY = (t: number) => (t >= CUT_CPR ? -1 : 1.78 - 1.0 * glass(t));
export const myth = (t: number) => (t < 0.05 ? 1 : 1) * (1 - 0.45 * ramp(t, B.look, B.look + 0.5)) * (1 - ramp(t, B.middle - 0.3, B.middle + 0.3));
export const heartIn = (t: number) => ramp(t, B.left + 0.3, B.look + 0.3);
export const sheet = (t: number) => ramp(t, B.middle + 0.35, B.middle + 1.2);         // 0..1 sweep top -> bottom
export const sheetFade = (t: number) => 1 - ramp(t, B.thatTip - 0.2, B.thatTip + 0.5);
export const sternumGlow = (t: number) => hump(t, B.breast - 0.3, 1.6);
export const lean = (t: number) => ramp(t, B.leans - 0.05, B.leans + 1.0);           // 0 upright -> 1 real tilt
export const axisOn = (t: number) => ramp(t, B.leans - 0.3, B.leans + 0.1) * (1 - ramp(t, B.feel + 0.4, B.feel + 1.0));
export const apexGlow = (t: number) => ramp(t, B.tip - 0.1, B.tip + 0.4) * (t < CUT_CPR ? 1 : 0);
export const skinPulse = (t: number) => ramp(t, B.thatTip - 0.1, B.thatTip + 0.3) * (t < CUT_CPR ? 1 : 0);

// ---------- CPR (lying): the hand lands on the left, slides to the centre, the second hand stacks, then pushes
export const CPR_HZ = 110 / 60;
export const handIn = (t: number) => ramp(t, B.cpr - 0.5, B.dont + 0.1);              // hovers in over the left
export const wrongX = (t: number) => hump(t, B.dont + 0.2, 1.3);                      // coral "no" on the left
export const slide = (t: number) => ramp(t, B.push - 0.2, B.push + 0.6);              // left -> centre
export const stack = (t: number) => ramp(t, B.push + 0.3, B.push + 0.9);              // the second hand lands on top
export const pushOn = (t: number) => ramp(t, B.centre - 0.1, B.centre + 0.4);
export const pushSpot = (t: number) => ramp(t, B.dont - 0.2, B.dont + 0.3);
// compression depth 0..1 (1 = 5 cm), a sharp push and a full release
export const press = (t: number) => {
  const a = B.centre + 0.2; if (t < a) return 0;
  const p = (t - a) * CPR_HZ; const f = p - Math.floor(p);
  const d = f < 0.45 ? Math.sin((Math.PI * f) / 0.45) : 0;
  return d * pushOn(t) * (1 - ramp(t, B.end + 1.4, B.end + 1.9));
};
export const pressTimes = (to: number) => { const a = B.centre + 0.2; const out: number[] = []; for (let k = 0; a + (k + 0.25) / CPR_HZ < to; k++) out.push(a + (k + 0.225) / CPR_HZ); return out; };
export const PRESS_DEPTH = 0.055;
export const bloodOn = (t: number) => ramp(t, B.blood - 0.3, B.blood + 0.3);
export const counterOn = (t: number) => ramp(t, B.two - 0.1, B.two + 0.4);

// ---------- camera keys: [t, pos, look, mm, up]. A key with cut: true starts a new shot at its t.
export type Key = {t: number; pos: V3; look: V3; mm: number; up?: V3; cut?: boolean};
// lying body: rotated -90 deg about X, lifted so the back rests on the floor; head toward -Z.
export const LIE_LIFT = 0.12;
export const lieP = (p: V3): V3 => [p[0], p[2] + LIE_LIFT, -p[1]];
const H = HEART_C;
const PUSH_L = lieP(PUSH);
export const KEYS: Key[] = [
  // A: standing. Chest close, cropped at the chin, slow push in from front-right
  {t: 0, pos: [-0.22, 1.34, 1.3], look: [0.04, 1.29, 0.1], mm: 50},
  {t: B.look, pos: [-0.14, 1.36, 1.12], look: [0.03, 1.32, 0.08], mm: 50},
  // full side profile on "breastbone": breastbone, heart, spine front to back
  {t: B.breast + 0.45, pos: [-1.05, 1.4, 0.1], look: [0.0, 1.36, 0.06], mm: 50},
  // back to the front for "middle": the centre line runs straight through the heart
  {t: B.middle + 0.75, pos: [-0.04, 1.38, 1.15], look: [0.0, 1.35, 0.07], mm: 50},
  {t: B.leans + 0.6, pos: [-0.1, 1.36, 0.95], look: [0.03, 1.34, 0.08], mm: 50},
  {t: B.feel + 0.4, pos: [0.12, 1.33, 0.88], look: [0.05, 1.32, 0.1], mm: 50},
  {t: CUT_CPR, pos: [0.16, 1.32, 0.86], look: [0.06, 1.32, 0.1], mm: 50},
  // B: lying on the floor, seen from beyond the feet and above: head at the top of the frame
  {t: CUT_CPR, cut: true, pos: [0.05, 1.0, PUSH_L[2] + 0.85], look: [0.02, 0.24, PUSH_L[2] - 0.14], mm: 35},
  {t: B.dont + 0.3, pos: [0.04, 0.88, PUSH_L[2] + 0.68], look: [0.02, 0.26, PUSH_L[2] - 0.08], mm: 35},
  {t: B.squeezes - 0.4, pos: [0.0, 0.82, PUSH_L[2] + 0.62], look: [0.01, 0.26, PUSH_L[2] - 0.08], mm: 35},
  // side, near chest height: breastbone, heart and spine in one line; the arms rise vertically beyond
  {t: B.spine + 0.2, pos: [-0.88, 0.42, PUSH_L[2] + 0.02], look: [0.03, 0.27, PUSH_L[2] - 0.03], mm: 35},
  // along the body toward the head as the blood arrives
  {t: B.brain + 0.4, pos: [-0.92, 0.5, PUSH_L[2] - 0.12], look: [0.02, 0.25, PUSH_L[2] - 0.17], mm: 35},
  // up to three-quarters: the stacked hands on the lit centre spot, the dim coral spot on the left
  {t: DUR_S, pos: [-0.55, 0.95, PUSH_L[2] + 0.42], look: [0.03, 0.26, PUSH_L[2] - 0.08], mm: 35},
];
export const CUTS = [CUT_CPR];
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
  const up = (k: Key) => k.up ?? [0, 1, 0];
  return {pos: v((k) => k.pos), look: v((k) => k.look), mm: lerp(b.mm, c.mm, u), up: v(up)};
};
export {H as HEART};
