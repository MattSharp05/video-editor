import {Easing, interpolate, random} from 'remotion';
import B from './beats.json';
export {B};
export const FPS = 30;
export const NOISE = '#FF8A3D', COPY = '#4C8DFF', MUSIC = '#D8E86A', CALM = '#9FE3D6', INK = '#141A26', CREAM = '#F4EEE2';
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
export const easeOut = Easing.bezier(0.2, 0.8, 0.2, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.9, 0.5);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const pr = (t: number, a: number, b: number, e = ease) => (b <= a ? (t >= a ? 1 : 0) : interpolate(t, [a, b], [0, 1], {...clamp, easing: e}));
export const win = (t: number, a: number, b: number, f = 0.3) => Math.min(pr(t, a - f, a), 1 - pr(t, b - f, b));
export const rnd = (s: string | number) => random(s);
export const smooth = (x: number) => x * x * (3 - 2 * x);
// spring-ish overshoot 0..1
export const pop = (t: number, a: number, d = 0.45) => {
  const k = Math.max(0, Math.min(1, (t - a) / d));
  return k >= 1 ? 1 : 1 - Math.exp(-6 * k) * Math.cos(9 * k);
};

// Master camera in CABIN units: cabin point (x, y) lands on screen at (540 + (x - cx) z, 960 + (y - cy) z).
export type Cam = {x: number; y: number; z: number};
export type Key = [number, number, number, number];
export const camAt = (t: number, keys: Key[]): Cam => {
  if (t <= keys[0][0]) return {x: keys[0][1], y: keys[0][2], z: keys[0][3]};
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, x0, y0, z0] = keys[i], [t1, x1, y1, z1] = keys[i + 1];
    if (t <= t1) {
      const k = Easing.bezier(0.45, 0, 0.55, 1)((t - t0) / (t1 - t0));
      // zoom in log space; position follows the zoom so dives aim at the target (no swing)
      const lz = lerp(Math.log(z0), Math.log(z1), k);
      const z = Math.exp(lz);
      const w = Math.abs(z1 - z0) / Math.max(z0, z1) > 0.25 ? (1 / z - 1 / z0) / (1 / z1 - 1 / z0 || 1) : k;
      return {x: lerp(x0, x1, w), y: lerp(y0, y1, w), z};
    }
  }
  const l = keys[keys.length - 1];
  return {x: l[1], y: l[2], z: l[3]};
};

// The cutaway cup ("machine room") lives in its own 1000-unit space; (500, 500) sits on the hero's ear cup.
export const CUP = {x: 150, y: 20, r: 62};
export const SM = (CUP.r * 2) / 1000;
export const mToC = (mx: number, my: number) => ({x: CUP.x + (mx - 500) * SM, y: CUP.y + (my - 500) * SM});
// camera key given in machine units (zoom = machine units → px)
export const MK = (t: number, mx: number, my: number, mz: number): Key => { const c = mToC(mx, my); return [t, c.x, c.y, mz / SM]; };
// The sky (plane exterior) space: the hero's window sits at WIN_SKY, cabin shrunk by SK
export const WIN = {x: -170, y: -190, w: 150, h: 210};
export const SK = 0.018;
export const WIN_SKY = {x: 600, y: 880};
// SVG transform string for a world whose origin maps to cabin point O with scale s
export const layer = (cam: Cam, ox: number, oy: number, s: number) => `translate(${540 + (ox - cam.x) * cam.z} ${960 + (oy - cam.y) * cam.z}) scale(${s * cam.z})`;
