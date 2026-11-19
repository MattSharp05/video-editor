// Every state of the film as a pure function of time t (seconds), cued from the spoken words (src/words.json).
// Units: millimetres everywhere (a hair is 0.08 mm wide; the skin block is 24 mm across).
import {cue, VO_END} from './lib';

export const DUR_S = VO_END + 2.2;
export type V3 = [number, number, number];
export const AMBER = '#FFB547', CORAL = '#FF5A4E', STEEL = '#CFE6F2';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const hump = (t: number, a: number, d: number) => { const x = (t - a) / d; return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const B = {
  watch: cue('Watch'), think: cue("You've probably heard"), thicker: cue('thicker.', 0), but: cue('But a razor'), dead: cue('hair above'),
  above: cue('above your skin.'), root: cue('The root'), downHere: cue('sits deeper,'), never: cue('never touches'),
  why: cue('So why'), feel: cue('feel thicker?'), hairThat: cue("A hair that's"), tapered: cue('tapered tip.'),
  slices: cue('Shaving slices'), blunt: cue('blunt end.'), same: cue('Same width.'), coarser: cue('feels coarser.'),
  tested: cue('Scientists tested'), y1928: cue('in 1928,'), y1970: cue('in 1970.'), didnt: cue("Shaving didn't"),
  real: cue('The real change'), puberty: cue('hormones at puberty,'), shaveOr: cue('So shave'), stays: cue('stays the same.'), end: VO_END,
};

// ---------- worlds and cuts
export const CUT_ROOT = B.root - 0.12;     // skin from above -> the section through the skin
export const CUT_TIPS = B.hairThat - 0.12; // section -> two hairs side by side (the tip study)
export const CUT_END = B.real - 0.12;      // tip study -> back on the skin: puberty thickens fine hairs; then a shave and regrowth
export const CUTS = [CUT_ROOT, CUT_TIPS, CUT_END];
export const world = (t: number) => (t < CUT_ROOT ? 'skin' : t < CUT_TIPS ? 'section' : t < CUT_END ? 'tips' : 'skin');

// ---------- the skin and its hairs (mm). Hairs grow from the skin at y = 0, 4 mm long, 0.08 mm wide.
export const SKIN = 24, HAIR_R = 0.04, HAIR_L = 4.0, TIP_L = 1.2, STUB = 0.05;
// the blade sweeps along +x across the skin, edge just above the surface
export const BLADE_X0 = -13, BLADE_X1 = 13;
export const bladeX = (t: number) => lerp(BLADE_X0, BLADE_X1, ramp(t, 0.15, B.think + 0.6));
export const bladeOn = (t: number) => (t < CUT_ROOT ? 1 : 0) * (1 - ramp(t, B.think + 0.6, B.think + 1.0));
// the myth: the cut stubble swells into "thicker" coral ghosts, then deflates on "But"
export const mythSwell = (t: number) => ramp(t, B.thicker - 0.5, B.thicker + 0.2) * (1 - ramp(t, B.but - 0.1, B.but + 0.5));
export const cutLineGlow = (t: number) => hump(t, B.dead - 0.2, 2.4); // the cut level glows on "above your skin"
// end world: regrowth over "days" (time-lapse) to the same width
export const puberty = (t: number) => ramp(t, B.puberty - 0.3, B.shaveOr - 0.4);           // fine pale hairs -> thick dark
export const blade2X = (t: number) => lerp(BLADE_X0, BLADE_X1, ramp(t, B.shaveOr - 0.1, B.shaveOr + 1.3));
export const blade2On = (t: number) => (t >= B.shaveOr - 0.2 ? 1 : 0) * (1 - ramp(t, B.shaveOr + 1.2, B.shaveOr + 1.5));
export const regrow = (t: number) => ramp(t, B.shaveOr + 1.0, B.end + 1.2);                   // stubble regrows, same width

// ---------- the section (mm): a block of skin cut in half at z = 0. Follicle 3 mm deep, bulb at the bottom.
export const FOLLICLE_D = 3.0;
export const rootGlow = (t: number) => ramp(t, B.downHere - 0.2, B.downHere + 0.4);
export const sectionBlade = (t: number) => ramp(t, B.never - 0.4, B.never + 1.2); // the blade passes over again, far above the root
export const depthLabel = (t: number) => ramp(t, B.downHere + 0.2, B.downHere + 0.6) * (t < CUT_TIPS ? 1 : 0);

// ---------- the tips study: an uncut hair (tapered tip) and a shaved hair (blunt end), the caliper on both
export const cutSecond = (t: number) => ramp(t, B.slices - 0.1, B.slices + 0.5);       // the right hair is sliced
export const caliper = (t: number) => ramp(t, B.same - 0.4, B.same + 0.3) * (1 - ramp(t, B.tested - 0.4, B.tested));
export const caliperMove = (t: number) => ramp(t, B.same + 0.5, B.same + 1.3);          // from the left hair to the right
export const flex = (t: number) => hump(t, B.coarser - 0.2, 1.6);                       // a fingertip brushes both tips
export const studyOn = (t: number) => ramp(t, B.tested - 0.1, B.tested + 0.4);
export const resultOn = (t: number) => ramp(t, B.didnt - 0.1, B.didnt + 0.4);

// ---------- camera keys (mm)
export type Key = {t: number; pos: V3; look: V3; mm: number; up?: V3; cut?: boolean};
export const KEYS: Key[] = [
  // skin from just above, low over the hair forest, tracking the blade
  {t: 0, pos: [-9, 2.6, 9], look: [-3, 1.2, 0], mm: 24},
  {t: B.think, pos: [-2, 3.5, 11], look: [1, 0.6, 0], mm: 24},
  {t: B.but, pos: [1, 5, 12], look: [2, 0, 0], mm: 24},
  {t: CUT_ROOT, pos: [2, 3.2, 8], look: [2, 0.1, 0], mm: 24},
  // the section, seen from the cut side (+z): surface at the top, the root 3 mm down
  {t: CUT_ROOT, cut: true, pos: [0.4, -0.6, 9.5], look: [0.2, -1.3, 0], mm: 35},
  {t: B.never + 1.4, pos: [-0.3, -0.9, 8.5], look: [0.1, -1.5, 0], mm: 35},
  {t: CUT_TIPS, pos: [-0.5, -1.0, 8.2], look: [0.0, -1.6, 0], mm: 35},
  // the tips: two hairs 0.6 mm apart, standing up; tips at y ~ 3.6 (uncut) and 2.4 (cut)
  {t: CUT_TIPS, cut: true, pos: [0.15, 2.9, 3.6], look: [0.0, 2.7, 0], mm: 50},
  {t: B.blunt + 0.4, pos: [0.05, 2.8, 3.3], look: [0.0, 2.6, 0], mm: 50},
  {t: B.same + 0.2, pos: [0.0, 2.3, 2.6], look: [0.0, 2.2, 0], mm: 50},
  {t: B.tested, pos: [0.3, 2.7, 3.8], look: [0.0, 2.5, 0], mm: 50},
  {t: CUT_END, pos: [0.5, 2.8, 4.2], look: [0.0, 2.5, 0], mm: 50},
  // back on the skin: fine hairs thicken (puberty), then a shave and the stubble regrows
  {t: CUT_END, cut: true, pos: [-5, 3.2, 10], look: [-1, 1.2, 0], mm: 24},
  {t: B.shaveOr, pos: [-3, 3.6, 11], look: [0, 1.0, 0], mm: 24},
  {t: DUR_S, pos: [-1, 4.2, 10], look: [1, 0.5, 0], mm: 24},
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
  return {pos: v((k) => k.pos), look: v((k) => k.look), mm: lerp(b.mm, c.mm, u), up: v((k) => k.up ?? [0, 1, 0])};
};
