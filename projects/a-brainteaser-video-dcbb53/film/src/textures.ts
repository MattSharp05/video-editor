// Procedural canvas textures for the kitchen set (seeded, so every render is identical).
import * as THREE from 'three';
import {fbm2, rng} from './kit/realism/noise';

const canvasTex = (size: number, fn: (u: number, v: number) => [number, number, number], srgb: boolean) => {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const d = g.createImageData(size, size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const [r, gg, b] = fn(x / size, y / size);
      const i = (y * size + x) * 4;
      d.data[i] = r; d.data[i + 1] = gg; d.data[i + 2] = b; d.data[i + 3] = 255;
    }
  g.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const clamp = (x: number) => Math.max(0, Math.min(255, x));

// Butter rind: matte, faint wrapper creases and finger smears.
export const butterRind = () => {
  const r = rng(7);
  const creases = Array.from({length: 26}, () => ({a: r() * Math.PI, o: r(), w: 0.002 + r() * 0.004, k: 0.3 + r() * 0.7}));
  const crease = (u: number, v: number) => {
    let s = 0;
    for (const c of creases) {
      const d = Math.abs(((u * Math.cos(c.a) + v * Math.sin(c.a) - c.o) % 0.5 + 0.5) % 0.5 - 0.25);
      s += c.k * Math.exp(-((d / c.w) ** 2));
    }
    return s;
  };
  const bump = canvasTex(512, (u, v) => {
    const h = 128 + fbm2(u * 22, v * 22, 3, 5) * 70 - crease(u, v) * 40 + fbm2(u * 90, v * 90, 9, 2) * 20;
    return [clamp(h), clamp(h), clamp(h)];
  }, false);
  const rough = canvasTex(256, (u, v) => {
    const q = 150 + fbm2(u * 6, v * 6, 5, 3) * 70 - crease(u, v) * 30; // greener channel = roughness
    return [0, clamp(q), 0];
  }, false);
  const color = canvasTex(256, (u, v) => {
    const k = fbm2(u * 4, v * 4, 11, 3) * 10;
    return [clamp(236 + k), clamp(194 + k), clamp(78 + k * 1.4)];
  }, true);
  return {bump, rough, color};
};

// The cut face: smoother and paler, with fine drag streaks along the wire's path (along u).
export const butterCut = () => {
  const bump = canvasTex(512, (u, v) => {
    const h = 128 + fbm2(u * 3, v * 120, 21, 3) * 60 + fbm2(u * 30, v * 30, 22, 3) * 25;
    return [clamp(h), clamp(h), clamp(h)];
  }, false);
  const rough = canvasTex(256, (u, v) => [0, clamp(95 + fbm2(u * 2, v * 50, 23, 3) * 60), 0], false);
  const color = canvasTex(256, (u, v) => {
    const k = fbm2(u * 5, v * 5, 25, 3) * 6;
    return [clamp(242 + k), clamp(208 + k), clamp(104 + k)];
  }, true);
  return {bump, rough, color};
};

// End-grain-free oak board: long grain along u, knife scratches, a few darker rays.
export const wood = () => {
  const r = rng(41);
  const cuts = Array.from({length: 50}, () => ({x: r(), y: r(), a: (r() - 0.5) * 1.2, l: 0.03 + r() * 0.12}));
  const scratch = (u: number, v: number) => {
    let s = 0;
    for (const c of cuts) {
      const dx = u - c.x, dy = v - c.y, ca = Math.cos(c.a), sa = Math.sin(c.a);
      const along = dx * ca + dy * sa, across = -dx * sa + dy * ca;
      if (Math.abs(along) < c.l && Math.abs(across) < 0.0006) s += 0.5;
    }
    return Math.min(s, 1);
  };
  const grain = (u: number, v: number) => {
    const w = v * 55 + fbm2(u * 1.2, v * 3, 43, 4) * 3.5;
    const f = w - Math.floor(w);
    const line = Math.exp(-(((f - 0.5) / (0.05 + 0.08 * (fbm2(u * 4, v * 9, 48, 2) * 0.5 + 0.5))) ** 2));
    return line * (0.5 + 0.5 * fbm2(u * 6, v * 2, 44, 3)) + 0.25 * (fbm2(u * 0.8, v * 6, 49, 3) * 0.5 + 0.5);
  };
  const color = canvasTex(1024, (u, v) => {
    const g = grain(u, v), f = fbm2(u * 3, v * 12, 45, 4) * 18, s = scratch(u, v) * 10;
    return [clamp(184 - g * 22 + f + s), clamp(142 - g * 20 + f * 0.8 + s), clamp(98 - g * 16 + f * 0.6 + s * 0.8)];
  }, true);
  const bump = canvasTex(512, (u, v) => {
    const h = 128 + (grain(u, v) - 0.5) * 50 - scratch(u, v) * 90 + fbm2(u * 60, v * 200, 47, 2) * 14;
    return [clamp(h), clamp(h), clamp(h)];
  }, false);
  const rough = canvasTex(256, (u, v) => [0, clamp(190 + grain(u, v) * 30 + scratch(u, v) * 30), 0], false);
  return {color, bump, rough};
};

// Dark honed stone counter.
export const stone = () => {
  const color = canvasTex(512, (u, v) => {
    const k = fbm2(u * 8, v * 8, 61, 5) * 14 + (fbm2(u * 300, v * 300, 62, 1) > 0.42 ? 6 : 0);
    return [clamp(46 + k), clamp(44 + k), clamp(42 + k)];
  }, true);
  const rough = canvasTex(256, (u, v) => [0, clamp(150 + fbm2(u * 5, v * 5, 63, 3) * 60), 0], false);
  return {color, rough};
};

// Out-of-focus kitchen behind: a warm window glow on the left, dark cabinets, two soft bokeh lights.
export const backdrop = () =>
  canvasTex(512, (u, v) => {
    const win = Math.exp(-(((u - 0.18) / 0.22) ** 2) - (((v - 0.45) / 0.35) ** 2));
    const lamp = 0.6 * Math.exp(-(((u - 0.78) / 0.05) ** 2) - (((v - 0.3) / 0.05) ** 2)) + 0.4 * Math.exp(-(((u - 0.9) / 0.04) ** 2) - (((v - 0.36) / 0.04) ** 2));
    const k = fbm2(u * 3, v * 3, 71, 3) * 6;
    return [clamp(26 + win * 150 + lamp * 160 + k), clamp(22 + win * 120 + lamp * 120 + k), clamp(19 + win * 88 + lamp * 70 + k)];
  }, true);

// Mild cheddar: deeper orange-yellow, a slightly crumbly matte surface, a few tiny cracks.
export const cheese = (cutFace: boolean) => {
  const r = rng(cutFace ? 83 : 81);
  const pits = Array.from({length: 90}, () => ({x: r(), y: r(), s: 0.002 + r() * 0.006}));
  const pit = (u: number, v: number) => {
    let s = 0;
    for (const p of pits) { const d = Math.hypot(u - p.x, v - p.y); if (d < p.s) s = Math.max(s, 1 - d / p.s); }
    return s;
  };
  const bump = canvasTex(512, (u, v) => {
    const h = 128 + fbm2(u * 40, v * 40, 84, 4) * 55 + fbm2(u * 140, v * 140, 85, 2) * 25 - pit(u, v) * 90;
    return [clamp(h), clamp(h), clamp(h)];
  }, false);
  const rough = canvasTex(256, (u, v) => [0, clamp((cutFace ? 150 : 185) + fbm2(u * 8, v * 8, 86, 3) * 50), 0], false);
  const color = canvasTex(256, (u, v) => {
    const k = fbm2(u * 5, v * 5, 87, 3) * 10 - pit(u, v) * 30;
    return cutFace ? [clamp(250 + k), clamp(178 + k), clamp(64 + k)] : [clamp(232 + k), clamp(150 + k), clamp(42 + k)];
  }, true);
  return {bump, rough, color};
};
