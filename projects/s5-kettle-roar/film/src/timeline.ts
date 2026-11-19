// Every state of the film as a pure function of time t (seconds), cued from the spoken words (cue()). No React, no
// three objects. World: 1 unit = 1 m. The glass kettle stands on the counter at KET; a phone leans beside it showing
// a noise bar. A macro set far away (MAC, x20 scale) carries the shots at the element. Physics (fact check
// 2026-11-19): loud = bubbles collapse low in cooler water; boil = whole column near 100 C, bubbles reach the top,
// quieter but never silent; the switch clicks a moment after the boil starts.
import {cue, VO_END} from './lib';

export const DUR_S = VO_END + 1.6;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- world
export const COUNTER_Y = 0.92;
export const KS = 0.8; // kettle model scale (file is mm; 0.8 -> glass jug 16 cm across, kettle ~26 cm tall)
export const KET = {x: 0, y: COUNTER_Y, z: -0.25};
// the water inside the jug, kettle-local metres (already scaled)
export const WATER = {r: 0.1 * KS - 0.004, y0: 0.0625 * KS, y1: 0.2 * KS};
export const PLATE_Y = WATER.y0 + 0.005; // the steel plate over the element
export const PHONE = {x: KET.x - 0.15, z: KET.z + 0.16, tilt: 0.42, yaw: 0.3};
export const MAC = {x: 40, y: 1, z: 0, s: 20}; // macro set: the plate top at y, x20 scale

// ---------- beats
export const B = {
  watch: cue('Watch'), loud: cue('loud,'), quieter1: cue('quieter.', 0),
  that: cue('That roar'), yet: cue("isn't boiling"),
  heres: cue("Here's"), touching: cue('touching'), first: cue('boils first'), steam: cue('bubbles of steam'),
  but: cue('But the water'), cooler: cue('is cooler'), rises: cue('rises,'), collapses: cue('collapses back'),
  all: cue('All those'), ringing: cue('ringing'), roar2: cue("that's the roar"),
  once: cue('Once all'), hundred: cue('100'), survive: cue('survive'), pop: cue('pop gently'),
  so: cue('So the'), notyet: cue('not yet.'), quieter2: cue('quieter bubbling'), boil: cue('the boil,'), click: cue('click.'),
  end: VO_END,
};

// ---------- shots: K counter (wide, pushing in to the glass), X macro at the element, G the glass close, S split
export const CUT_X = B.heres - 0.08;
export const CUT_K2 = B.roar2 - 0.12;
export const CUT_G = B.once - 0.1;
export const CUT_S = B.so - 0.1;
export const CUTS = [CUT_X, CUT_K2, CUT_G, CUT_S];
export type Shot = 'K' | 'X' | 'G' | 'S';
export const shotAt = (t: number): Shot => (t < CUT_X ? 'K' : t < CUT_K2 ? 'X' : t < CUT_G ? 'K' : t < CUT_S ? 'G' : 'S');

// ---------- the kettle's state: heat 0 = loud phase (subcooled), 1 = whole column near 100 C (boil)
// The hook jumps forward to the boil on "quieter", and back (rewind) on "That roar".
export const JUMP_FWD = B.quieter1 - 0.15, JUMP_BACK = B.that - 0.1;
export const heatAt = (t: number, panel?: 'L' | 'R') => {
  if (panel === 'L') return 0;
  if (panel === 'R') return 1;
  if (t < JUMP_FWD) return 0;
  if (t < JUMP_BACK) return 1;
  if (t < B.once + 0.2) return 0;
  return ramp(t, B.once + 0.2, B.pop + 0.2);
};
export const clicked = (t: number, panel?: 'L' | 'R') => panel === 'R' && t >= B.click + 0.15;
export const afterClick = (t: number, panel?: 'L' | 'R') => (panel === 'R' ? ramp(t, B.click + 0.15, B.click + 1.4) : 0);
// loudness 0..1: the hook builds from a hiss into the roar; the boil is quieter but never silent; fades after the click
export const loudAt = (t: number, panel?: 'L' | 'R') => {
  const h = heatAt(t, panel);
  const build = panel || t >= JUMP_FWD ? 1 : lerp(0.45, 1, ramp(t, 0, JUMP_FWD - 0.2));
  return lerp(lerp(0.45, 1, build) * (h < 1 ? 1 : 1), 0.3, smooth(h)) * (1 - 0.75 * afterClick(t, panel));
};
// how high (m, real) above the plate a bubble survives before collapsing; above the surface = all survive
export const dieHeight = (h: number) => lerp(0.012, 0.3, Math.pow(smooth(h), 1.6));
// water tint: 0 blue (cooler) .. 1 orange (near 100 C, whole column; convection mixes it, no climbing front)
export const tint = (h: number) => smooth(h);
export const roll = (h: number) => smooth((h - 0.55) / 0.45); // a rolling surface once the whole column is hot
export const plume = (t: number, panel?: 'L' | 'R') => ramp(heatAt(t, panel), 0.6, 1) * (panel === 'R' ? 1 : 1);
export const switchOn = (t: number, panel?: 'L' | 'R') => !clicked(t, panel);
// the time-jump chips in the hook
export const fwdChip = (t: number) => ramp(t, JUMP_FWD - 0.05, JUMP_FWD + 0.1) * (1 - ramp(t, JUMP_BACK - 0.25, JUMP_BACK - 0.05));
export const backChip = (t: number) => ramp(t, JUMP_BACK - 0.05, JUMP_BACK + 0.1) * (1 - ramp(t, JUMP_BACK + 0.9, JUMP_BACK + 1.2));

// ---------- macro (X): the hero bubble grows on the plate, detaches, rises into the blue, crumples to nothing
export const HERO = {
  grow0: B.steam - 0.6, detach: B.but + 0.15, crumple0: B.collapses - 0.05, gone: B.collapses + 0.3,
  r: 0.07, // m at macro scale (3.5 mm real)
};
export const heroY = (t: number) => { // height of the hero's centre above the macro plate (macro metres)
  if (t < HERO.detach) return HERO.r * smooth((t - HERO.grow0) / 0.8);
  const u = (t - HERO.detach) / (HERO.crumple0 - HERO.detach);
  return HERO.r + 0.62 * (1 - Math.pow(1 - clamp01(u), 1.8)) + 0.04 * clamp01((t - HERO.crumple0) / 0.3); // slows as it rises
};
export const heroR = (t: number) => {
  if (t < HERO.grow0) return 0;
  if (t < HERO.detach) return HERO.r * (0.25 + 0.75 * smooth((t - HERO.grow0) / 1.2));
  if (t < HERO.crumple0) return HERO.r * (1 - 0.18 * smooth((t - HERO.detach - 0.6) / (HERO.crumple0 - HERO.detach - 0.6))); // shrinks as it cools
  return HERO.r * 0.82 * (1 - Math.pow(clamp01((t - HERO.crumple0) / (HERO.gone - HERO.crumple0)), 0.6));
};
export const heroCrumple = (t: number) => ramp(t, HERO.crumple0 - 0.25, HERO.crumple0 + 0.12);
export const heroRing = (t: number) => t - (HERO.gone - 0.05); // age of the hero's ring (s), < 0 before
// the swarm: background bubbles in the macro shot; dims during the hero's solo, then the band of collapses
export const swarm = (t: number) => lerp(0.55, 0.12, ramp(t, B.but - 0.2, B.but + 0.6)) + 0.88 * ramp(t, B.all - 0.3, B.all + 0.5);
export const macroLabels = {
  hot: (t: number) => ramp(t, B.touching - 0.1, B.touching + 0.3) * (1 - ramp(t, B.but + 0.6, B.but + 1.0)),
  cool: (t: number) => ramp(t, B.cooler - 0.2, B.cooler + 0.2) * (1 - ramp(t, B.rises + 0.2, B.rises + 0.6)),
};

// ---------- cards (HTML; cards sit at y ~1330, clear of the captions and the Reels cover)
export const cards = (t: number) => [
  {text: 'LOUDEST BEFORE IT BOILS', o: 1 - ramp(t, B.that - 0.3, B.that - 0.05)},
  {text: 'KETTLE NOT BOILING YET', o: ramp(t, B.that, B.that + 0.25) * (1 - ramp(t, CUT_X - 0.25, CUT_X))},
  {text: 'STEAM → WATER', o: ramp(t, B.collapses + 0.15, B.collapses + 0.4) * (1 - ramp(t, B.all + 0.4, B.all + 0.7))},
  {text: 'NEAR 100 °C: BUBBLES SURVIVE', o: ramp(t, B.hundred - 0.1, B.hundred + 0.2) * (1 - ramp(t, CUT_S - 0.2, CUT_S))},
];
export const splitLabels = (t: number) => ({L: ramp(t, B.so + 0.1, B.so + 0.4), R: ramp(t, B.quieter2 - 0.15, B.quieter2 + 0.2)});

// ---------- camera
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; cut?: boolean};
const K = (x: number, y: number, z: number): V3 => [KET.x + x, KET.y + y, KET.z + z];
const M = (x: number, y: number, z: number): V3 => [MAC.x + x, MAC.y + y, MAC.z + z];
export const KEYS: Key[] = [
  // K: the counter, kettle and phone; push in to the glass bottom over line 2
  {t: 0, pos: K(0.1, 0.2, 0.62), look: K(-0.05, 0.12, 0), mm: 32},
  {t: B.that, pos: K(0.07, 0.17, 0.52), look: K(-0.04, 0.11, 0), mm: 32},
  {t: CUT_X, pos: K(0.02, 0.08, 0.26), look: K(0, 0.06, 0), mm: 40},
  // X: macro at the element; drift in, track the hero up, then pull back over the band
  {t: CUT_X, cut: true, pos: M(-0.12, 0.1, 1.45), look: M(0, 0.2, 0), mm: 32},
  {t: B.but, pos: M(0, 0.12, 1.2), look: M(0, 0.22, 0), mm: 32},
  {t: HERO.crumple0, pos: M(0.02, 0.75, 1.15), look: M(0, 0.7, 0), mm: 32},
  {t: B.all, pos: M(0.02, 0.8, 1.3), look: M(0, 0.6, 0), mm: 32},
  {t: CUT_K2, pos: M(0, 0.9, 3.0), look: M(0, 0.3, 0), mm: 32},
  // K again: the counter, the phone in the red
  {t: CUT_K2, cut: true, pos: K(0.12, 0.19, 0.56), look: K(-0.06, 0.11, 0), mm: 32},
  {t: CUT_G, pos: K(0.09, 0.18, 0.5), look: K(-0.06, 0.11, 0), mm: 32},
  // G: the glass close, the whole column of water
  {t: CUT_G, cut: true, pos: K(0.0, 0.17, 0.42), look: K(0, 0.1, 0), mm: 40},
  {t: CUT_S, pos: K(0.0, 0.17, 0.37), look: K(0, 0.1, 0), mm: 40},
  // S: (each panel; see splitCam)
  {t: CUT_S, cut: true, pos: K(0.0, 0.2, 0.6), look: K(-0.04, 0.1, 0), mm: 32},
  {t: DUR_S + 1, pos: K(0.0, 0.2, 0.6), look: K(-0.04, 0.1, 0), mm: 32},
];
// each half of the split ending: the same framing of kettle + phone, tall and narrow (540 x 1920)
export const splitCam = (t: number) => ({pos: K(-0.05, 0.26, 0.92 - 0.04 * clamp01((t - CUT_S) / 6)) as V3, look: K(-0.05, 0.1, 0) as V3, mm: 30});
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
  return {pos: v((k) => k.pos), look: v((k) => k.look), mm: lerp(b.mm, c.mm, u)};
};
