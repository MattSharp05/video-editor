// Shared helpers for the dream-brain film: easing, a monotone camera path, glow textures, seeded random, colours.
import * as THREE from 'three';
import {interpolate, random} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const ramp = (t: number, a: number, b: number) => ease(interpolate(t, [a, b], [0, 1], clamp));
export const lin = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const pulse = (t: number, at: number, w = 0.35) => Math.exp(-Math.pow((t - at) / w, 2));
export const rnd = (s: string | number) => random(String(s));

// Colour meaning, fixed for the whole film.
export const C = {
  gold: '#FFC56E',      // dream and signals: the thing to follow
  red: '#FF4D6D',       // feelings
  rest: '#3550C8',      // resting brain tissue light
  trail: '#8FB4FF',     // ordinary brain traffic
  today: '#DDEBFF',     // memory: today (cool white)
  past: '#FFB45A',      // memory: long ago (warm amber)
  quiet: '#6B7088',     // the quiet front
  night: '#050812',
};

// Monotone cubic (PCHIP) through keyed values: no stop at each key, no overshoot (look pass #10).
export const pchip = (keys: [number, number][], t: number) => {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][1];
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0;
  while (t > keys[i + 1][0]) i++;
  const h = (k: number) => keys[k + 1][0] - keys[k][0];
  const d = (k: number) => (keys[k + 1][1] - keys[k][1]) / h(k);
  const m = (k: number) => {
    if (k === 0) return d(0);
    if (k === n - 1) return d(n - 2);
    const a = d(k - 1), b = d(k);
    if (a * b <= 0) return 0;
    const w1 = 2 * h(k) + h(k - 1), w2 = h(k) + 2 * h(k - 1);
    return (w1 + w2) / (w1 / a + w2 / b);
  };
  const x0 = keys[i][0], hh = h(i), s = (t - x0) / hh;
  const y0 = keys[i][1], y1 = keys[i + 1][1];
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  return h00 * y0 + h10 * hh * m(i) + h01 * y1 + h11 * hh * m(i + 1);
};
// A 3D path: keys of [time, [x,y,z]].
export const path3 = (keys: [number, [number, number, number]][], t: number) =>
  new THREE.Vector3(...([0, 1, 2].map((a) => pchip(keys.map(([k, v]) => [k, v[a]] as [number, number]), t)) as [number, number, number]));

let glowT: THREE.Texture | null = null;
export const glowTex = () => {
  if (glowT) return glowT;
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d')!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.22, 'rgba(255,255,255,0.5)'); g.addColorStop(0.55, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); glowT = new THREE.CanvasTexture(c); return glowT;
};

// Text drawn to a canvas texture (clock digits, the REM tag in-world).
export const textTex = (text: string, color: string, w = 512, h = 256, font = '800 170px Hanken Grotesk, sans-serif') => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d')!;
  x.fillStyle = color; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 6);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

// Seeded scatter helper.
export const seq = (n: number, f: (i: number) => any) => Array.from({length: n}, (_, i) => f(i));

// Many soft glows in ONE draw call (dust, particles, ribbons): points with a radial falloff, additive.
// items: [x, y, z, size(world units), r, g, b, opacity]
const GP_VS = `attribute float aSize; attribute vec4 aCol; varying vec4 vCol;
void main(){ vCol = aCol; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * projectionMatrix[1][1] * 960.0 / -mv.z; }`;
const GP_FS = `varying vec4 vCol; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; if (r > 1.0) discard;
  float a = exp(-r * r * 4.0) + 0.6 * exp(-r * r * 28.0); gl_FragColor = vec4(vCol.rgb * a * vCol.a, 1.0); }`;
export const makeGlowPoints = (max: number) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(max * 3), 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(max), 1));
  g.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(max * 4), 4));
  const m = new THREE.ShaderMaterial({vertexShader: GP_VS, fragmentShader: GP_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending});
  const pts = new THREE.Points(g, m); pts.frustumCulled = false;
  const col = new THREE.Color();
  const set = (items: {p: THREE.Vector3 | [number, number, number]; s: number; c: string; o: number}[]) => {
    const P = g.attributes.position as THREE.BufferAttribute, S = g.attributes.aSize as THREE.BufferAttribute, A = g.attributes.aCol as THREE.BufferAttribute;
    const n = Math.min(max, items.length);
    for (let i = 0; i < n; i++) { const it = items[i], p = it.p as any; P.setXYZ(i, p.x ?? p[0], p.y ?? p[1], p.z ?? p[2]); S.setX(i, it.s); col.set(it.c); A.setXYZW(i, col.r, col.g, col.b, Math.max(0, Math.min(1, it.o))); }
    g.setDrawRange(0, n); P.needsUpdate = S.needsUpdate = A.needsUpdate = true;
  };
  return {pts, set};
};
