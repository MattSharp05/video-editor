// The film's one random run of match drops (mulberry32, seed 1777, fixed before any result was seen). Each match:
// w picks its board (room: one of 7 boards, hall: one of 133), s its centre's distance from the board's lower crack
// (0..D cm), u its position along the board (0..1), a its angle (0..pi). A match crosses a crack when its half-height
// L/2·|sin a| reaches past either crack. Crossing depends only on s and a, so the room's first 200 and the hall's
// 20,000 are one run: the hall count continues the room's.
export const D = 6, L = 6;           // board width = match length, cm
export const SEED = 1777, N = 20000, ROOM_N = 200;
const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export type Drop = {w: number; s: number; u: number; a: number; cross: boolean; up: boolean};
export const DROPS: Drop[] = (() => {
  const r = mulberry32(SEED), out: Drop[] = [];
  for (let i = 0; i < N; i++) {
    const w = r(), s = r() * D, u = r(), a = r() * Math.PI, h = (L / 2) * Math.abs(Math.sin(a));
    out.push({w, s, u, a, cross: s - h < 0 || s + h > D, up: s + h > D}); // up: the crack it crosses is the upper one
  }
  return out;
})();
// crossings among the first n drops
const CUM: number[] = (() => { const c = [0]; DROPS.forEach((d) => c.push(c[c.length - 1] + (d.cross ? 1 : 0))); return c; })();
export const crossings = (n: number) => CUM[Math.max(0, Math.min(N, Math.round(n)))];
export const piEst = (n: number) => (2 * n) / Math.max(1, crossings(n));
