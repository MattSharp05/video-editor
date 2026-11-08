import { Easing, interpolate, random } from 'remotion';
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = Easing.bezier(0.45, 0, 0.55, 1);
export const easeOut = Easing.bezier(0.2, 0.8, 0.3, 1);
/** 0..1 progress from frame `at` over `dur` frames, eased (in-out by default). */
export const prog = (fr: number, at: number, dur: number, e: (t: number) => number = ease) =>
  e(clamp((fr - at) / Math.max(1, dur)));
/** Damped spring-like pop 0→1 (overshoots) from `at`. */
export const pop = (fr: number, at: number, dur = 14) => {
  const t = clamp((fr - at) / dur); if (t <= 0) return 0; if (t >= 1) return 1;
  return 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-t * 5);
};
/** Seeded random 0..1 (Remotion random: deterministic). */
export const rnd = (seed: string | number) => random(String(seed));
/** Hold a value on twos (frame stepping for drawn things). */
export const stepped = (fr: number, n = 2) => Math.floor(fr / n) * n;
export const osc = (fr: number, period: number, phase = 0) => Math.sin(((fr / period) + phase) * Math.PI * 2);
/** Pre-wobbled closed polygon path from points (deterministic irregular line). */
export const wob = (pts: [number, number][], amt = 2, seed = 'w', closed = true) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(x + (rnd(`${seed}x${i}`) - 0.5) * amt).toFixed(1)} ${(y + (rnd(`${seed}y${i}`) - 0.5) * amt).toFixed(1)}`).join(' ') + (closed ? 'Z' : '');
/** Rounded rectangle path. */
export const rrect = (x: number, y: number, w: number, h: number, r = 8) =>
  `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
export const ellipse = (cx: number, cy: number, rx: number, ry = rx) =>
  `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
/** Point along a polyline (t 0..1 by length). */
export const along = (pts: [number, number][], t: number): [number, number] => {
  const seg: number[] = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  let L = clamp(t) * tot;
  for (let i = 0; i < seg.length; i++) {
    if (L <= seg[i] || i === seg.length - 1) { const k = seg[i] ? clamp(L / seg[i]) : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; }
    L -= seg[i];
  }
  return pts[pts.length - 1];
};
/** Smooth Catmull-Rom sample of control points into n points (for paths). */
export const smoothPts = (cp: [number, number][], n = 40): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * (cp.length - 1); const k = Math.min(cp.length - 2, Math.floor(t)); const u = t - k;
    const p0 = cp[Math.max(0, k - 1)], p1 = cp[k], p2 = cp[k + 1], p3 = cp[Math.min(cp.length - 1, k + 2)];
    const f = (a: number, b: number, c: number, d: number) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
};
export const polyD = (pts: [number, number][], closed = false) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + (closed ? 'Z' : '');
export const keyed = (fr: number, keys: [number, number][]) =>
  interpolate(fr, keys.map((k) => k[0]), keys.map((k) => k[1]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
