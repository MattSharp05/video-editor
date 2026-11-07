// The one denoise engine (pictures-pick decision 4). A seeded noise field and the drawn target picture are mixed
// along a noise schedule: x_k = a_k * blur(target, r_k) + b_k * noise_k, k = 0 (pure static) .. N (clean).
// r_k shrinks as k grows, so big colour blobs resolve before fine detail, and every pixel changes at every step
// (never a regional wipe). The "sheet" lifted off at step k is exactly x_k - x_{k+1}: the noise removed in that step.
// Deterministic: the noise comes from a PRNG seeded through Remotion's random(seed); no Math.random, no clock.
import {random} from 'remotion';
import {Draw, paint} from './art';

export const GW = 200, GH = 150, N = 50;
const mulberry = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());

type Field = Float32Array; // GW*GH*3, values 0..1 (targets) or ~N(0,1) (noise)
const noises = new Map<string, Field>();
// mostly grey grain (old-TV static) with a little colour in it
export const noiseField = (seed: string, w = GW, h = GH): Field => {
  const key = `${seed}:${w}`;
  if (!noises.has(key)) {
    const r = mulberry(Math.floor(random(seed) * 4294967296)), f = new Float32Array(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      const l = gauss(r);
      f[i * 3] = l + 0.35 * gauss(r); f[i * 3 + 1] = l + 0.35 * gauss(r); f[i * 3 + 2] = l + 0.35 * gauss(r);
    }
    noises.set(key, f);
  }
  return noises.get(key)!;
};

const targets = new Map<string, Field>();
export const targetField = (id: string, d: Draw, w = GW, h = GH): Field => {
  const key = `${id}:${w}`;
  if (!targets.has(key)) {
    const cv = document.createElement('canvas'); cv.width = w * 2; cv.height = h * 2; paint(cv, d);
    const sm = document.createElement('canvas'); sm.width = w; sm.height = h;
    const c = sm.getContext('2d')!; c.imageSmoothingQuality = 'high'; c.drawImage(cv, 0, 0, w, h);
    const px = c.getImageData(0, 0, w, h).data, f = new Float32Array(w * h * 3);
    for (let i = 0; i < w * h; i++) for (let ch = 0; ch < 3; ch++) f[i * 3 + ch] = px[i * 4 + ch] / 255;
    targets.set(key, f);
  }
  return targets.get(key)!;
};

// separable box blur, three passes (close to a gaussian)
const boxBlur = (src: Field, w: number, h: number, r: number): Field => {
  if (r < 0.5) return src;
  const R = Math.round(r); let a = new Float32Array(src), b = new Float32Array(src.length);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) for (let ch = 0; ch < 3; ch++) {
      let s = 0; for (let x = -R; x <= R; x++) s += a[(y * w + Math.min(w - 1, Math.max(0, x))) * 3 + ch];
      for (let x = 0; x < w; x++) {
        b[(y * w + x) * 3 + ch] = s / (2 * R + 1);
        s += a[(y * w + Math.min(w - 1, x + R + 1)) * 3 + ch] - a[(y * w + Math.max(0, x - R)) * 3 + ch];
      }
    }
    for (let x = 0; x < w; x++) for (let ch = 0; ch < 3; ch++) {
      let s = 0; for (let y = -R; y <= R; y++) s += b[(Math.min(h - 1, Math.max(0, y)) * w + x) * 3 + ch];
      for (let y = 0; y < h; y++) {
        a[(y * w + x) * 3 + ch] = s / (2 * R + 1);
        s += b[(Math.min(h - 1, y + R + 1) * w + x) * 3 + ch] - b[(Math.max(0, y - R) * w + x) * 3 + ch];
      }
    }
  }
  return a;
};

// the schedule: signal grows, noise shrinks, blur radius (detail not yet resolved) shrinks
export const sched = (k: number) => {
  const s = Math.max(0, Math.min(1, k / N));
  return {a: Math.pow(Math.sin((Math.PI / 2) * s), 0.75), b: Math.pow(Math.cos((Math.PI / 2) * s), 1.35), r: 16 * Math.pow(1 - s, 1.7)};
};

const steps = new Map<string, ImageData>();
// the picture after k steps (k may be fractional for the line 2 / line 9 static levels)
export const stepImage = (id: string, d: Draw, k: number, w = GW, h = GH): ImageData => {
  const key = `${id}:${w}:${k.toFixed(2)}`;
  if (!steps.has(key)) {
    const {a, b, r} = sched(k), T = boxBlur(targetField(id, d, w, h), w, h, r * (w / GW));
    const n0 = noiseField('n0', w, h), nk = noiseField(`n${Math.floor(k)}`, w, h);
    const img = new ImageData(w, h), px = img.data;
    for (let i = 0; i < w * h; i++) for (let ch = 0; ch < 3; ch++) {
      const j = i * 3 + ch, n = 0.88 * n0[j] + 0.47 * nk[j];
      const v = a * T[j] + b * (0.5 + 0.24 * n);
      px[i * 4 + ch] = Math.max(0, Math.min(255, v * 255));
    }
    for (let i = 0; i < w * h; i++) px[i * 4 + 3] = 255;
    steps.set(key, img);
  }
  return steps.get(key)!;
};

// the sheet lifted off between step k and k+1: the removed noise, shown as grain whose opacity is its size
const sheets = new Map<string, ImageData>();
export const sheetImage = (id: string, d: Draw, k: number): ImageData => {
  const key = `${id}:${k}`;
  if (!sheets.has(key)) {
    const A = stepImage(id, d, k).data, B = stepImage(id, d, k + 1).data, img = new ImageData(GW, GH), px = img.data;
    for (let i = 0; i < GW * GH; i++) {
      let m = 0; for (let ch = 0; ch < 3; ch++) m += (A[i * 4 + ch] - B[i * 4 + ch]) / 3;
      const g = Math.max(0, Math.min(255, 150 + m * 3.2));
      px[i * 4] = g; px[i * 4 + 1] = g; px[i * 4 + 2] = Math.min(255, g + 8);
      px[i * 4 + 3] = Math.min(170, 35 + Math.abs(m) * 7);
    }
    sheets.set(key, img);
  }
  return sheets.get(key)!;
};

// pure static for a given frame (live TV snow)
export const staticImage = (fr: number, w = GW, h = GH): ImageData => {
  const key = `s${fr % 24}:${w}`;
  if (!steps.has(key)) {
    const n = noiseField(`live${fr % 24}`, w, h), img = new ImageData(w, h), px = img.data;
    for (let i = 0; i < w * h; i++) {
      for (let ch = 0; ch < 3; ch++) px[i * 4 + ch] = Math.max(0, Math.min(255, (0.5 + 0.26 * n[i * 3 + ch]) * 255));
      px[i * 4 + 3] = 255;
    }
    steps.set(key, img);
  }
  return steps.get(key)!;
};
