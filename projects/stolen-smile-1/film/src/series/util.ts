import { Easing, interpolate, random, spring } from 'remotion';
import { FPS } from './tokens';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
export const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);
/** 0→1 over `dur` frames from `at`. */
export const prog = (fr: number, at: number, dur = 12, e: (t: number) => number = ease) =>
  interpolate(fr, [at, at + dur], [0, 1], { ...clamp, easing: e });
export const pop = (fr: number, at: number, damping = 14) =>
  spring({ frame: fr - at, fps: FPS, config: { damping, stiffness: 180, mass: 0.7 } });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Frame stepped on n's (puppets and small props animate on twos: pick §1.3). */
export const stepped = (fr: number, n = 2) => fr - (((fr % n) + n) % n);
/** Seeded random in [0,1). Deterministic (Remotion random). */
export const rnd = (seed: string | number) => random(String(seed));
export const rndRange = (seed: string | number, a: number, b: number) => a + rnd(seed) * (b - a);

/** Hand-cut wobbly ellipse path (drawn once, no boiling: the seed fixes it). */
export const blob = (cx: number, cy: number, rx: number, ry: number, seed: string | number = 0, wob = 0.035, n = 14) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (rnd(`${seed}-${i}`) - 0.5) * 2 * wob;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smooth(pts);
};
/** Closed Catmull-Rom → cubic bezier through points. */
export const smooth = (pts: [number, number][], closed = true) => {
  const n = pts.length; const p = (i: number) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? d + 'Z' : d;
};
/** Hand-cut polygon: straight edges with a slight seeded jitter at each corner. */
export const cut = (pts: [number, number][], seed: string | number = 0, j = 1.5) =>
  'M' + pts.map(([x, y], i) => `${(x + (rnd(`${seed}c${i}`) - 0.5) * 2 * j).toFixed(1)},${(y + (rnd(`${seed}d${i}`) - 0.5) * 2 * j).toFixed(1)}`).join(' L') + 'Z';
/** Hand-cut rectangle. */
export const wrect = (x: number, y: number, w: number, h: number, seed: string | number = 0, j = 1.5) =>
  cut([[x, y], [x + w / 2, y], [x + w, y], [x + w, y + h / 2], [x + w, y + h], [x + w / 2, y + h], [x, y + h], [x, y + h / 2]], seed, j);
/** Damped swing (deg) starting at `at`: amp, decays over ~dur frames. */
export const swing = (fr: number, at: number, amp = 12, dur = 45, speed = 0.32) => {
  const t = fr - at; if (t < 0) return 0;
  return amp * Math.exp(-t / (dur / 3)) * Math.sin(t * speed);
};
/** Gentle idle wobble (deg or px), never stops. */
export const idle = (fr: number, amp = 1, seed = 0, speed = 0.05) => amp * Math.sin(fr * speed + seed * 1.7);
