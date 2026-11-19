// Set constructors for the storage building at night (1 unit = 1 m). Pure builders: geometry + materials, no timing.
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {random} from 'remotion';
import {CW, FH, DW, DH, UNIT_D} from './timeline';

const col = (h: string) => new THREE.Color(h);
const merge = (parts: THREE.BufferGeometry[]) => mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)))!;
export const LEAF_W = DW / 2, LEAF_T = 0.05;
export const OPEN_W = DW + 0.08, OPEN_H = DH + 0.06;

// one door leaf, hinge edge at x = 0 extending to +x, bottom at y = 0, face toward +z; two panel columns × three rows
export const leafGeometry = () => {
  const parts: THREE.BufferGeometry[] = [];
  const slab = new THREE.BoxGeometry(LEAF_W, DH, LEAF_T); slab.translate(LEAF_W / 2, DH / 2, 0); parts.push(slab);
  const ph = [0.55, 0.8, 0.7], py = [0.18, 0.86, 1.78];
  for (const cx of [0.34, 0.96]) for (let r = 0; r < 3; r++) {
    const p = new THREE.BoxGeometry(0.46, ph[r], 0.014); p.translate(cx, py[r] + ph[r] / 2, LEAF_T / 2 + 0.007); parts.push(p);
    const m = new THREE.BoxGeometry(0.52, ph[r] + 0.06, 0.005); m.translate(cx, py[r] + ph[r] / 2, LEAF_T / 2 + 0.0025); parts.push(m);
  }
  // a vertical steel handle bar near the meeting edge
  const h = new THREE.BoxGeometry(0.03, 0.42, 0.05); h.translate(LEAF_W - 0.12, 1.1, LEAF_T / 2 + 0.035); parts.push(h);
  return merge(parts);
};
export const leafMaterial = () => new THREE.MeshPhysicalMaterial({color: col('#2F4A55'), roughness: 0.48, clearcoat: 0.25, clearcoatRoughness: 0.4, side: THREE.DoubleSide});

// the facade of one unit: jambs, lintel, the slab of the floor above's walkway lip; opening from y = 0, centred at x = 0
export const facadeCellGeometry = () => {
  const parts: THREE.BufferGeometry[] = [];
  const side = (CW - OPEN_W) / 2;
  for (const s of [-1, 1]) { const b = new THREE.BoxGeometry(side, FH, 0.3); b.translate(s * (OPEN_W / 2 + side / 2), FH / 2, -0.15); parts.push(b); }
  const top = new THREE.BoxGeometry(OPEN_W, FH - OPEN_H, 0.3); top.translate(0, OPEN_H + (FH - OPEN_H) / 2, -0.15); parts.push(top);
  // steel frame round the opening
  for (const s of [-1, 1]) { const a = new THREE.BoxGeometry(0.08, OPEN_H + 0.08, 0.06); a.translate(s * (OPEN_W / 2 + 0.04), (OPEN_H + 0.08) / 2, 0.03); parts.push(a); }
  const at = new THREE.BoxGeometry(OPEN_W + 0.16, 0.08, 0.06); at.translate(0, OPEN_H + 0.04, 0.03); parts.push(at);
  return merge(parts);
};
export const facadeMaterial = () => {
  const m = new THREE.MeshStandardMaterial({color: col('#6A6660'), roughness: 0.9});
  m.onBeforeCompile = (sh) => {
    // block courses: faint mortar lines every 0.4 m (world space) and grime toward the bottom of each floor
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWf;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvec4 wf = modelMatrix * vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\nwf = modelMatrix * instanceMatrix * vec4(transformed, 1.0);\n#endif\nvWf = wf.xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWf;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float course = smoothstep(0.02, 0.0, abs(fract(vWf.y / 0.4) - 0.5) - 0.48);
        float joint = smoothstep(0.02, 0.0, abs(fract(vWf.x / 0.8 + step(0.5, fract(vWf.y / 0.8)) * 0.5) - 0.5) - 0.485);
        diffuseColor.rgb *= 1.0 - 0.18 * max(course, joint);
        diffuseColor.rgb *= 0.85 + 0.15 * fract(sin(dot(floor(vWf.xy / vec2(0.8, 0.4)), vec2(12.9898, 78.233))) * 43758.5453);`);
  };
  m.customProgramCacheKey = () => 'facade';
  return m;
};

// a unit's interior: back wall, sides, ceiling, floor (open at the front), warm bulb near the ceiling
export const unitGeometry = () => {
  const parts: THREE.BufferGeometry[] = [];
  const w = OPEN_W + 0.3, h = FH - 0.05, d = UNIT_D;
  const back = new THREE.PlaneGeometry(w, h); back.translate(0, h / 2, -d); parts.push(back);
  const l = new THREE.PlaneGeometry(d, h); l.rotateY(Math.PI / 2); l.translate(-w / 2, h / 2, -d / 2); parts.push(l);
  const r = new THREE.PlaneGeometry(d, h); r.rotateY(-Math.PI / 2); r.translate(w / 2, h / 2, -d / 2); parts.push(r);
  const c = new THREE.PlaneGeometry(w, d); c.rotateX(Math.PI / 2); c.translate(0, h, -d / 2); parts.push(c);
  const f = new THREE.PlaneGeometry(w, d); f.rotateX(-Math.PI / 2); f.translate(0, 0.003, -d / 2); parts.push(f);
  return merge(parts);
};
export const unitMaterial = () => {
  const m = new THREE.MeshStandardMaterial({color: col('#9C8F7E'), roughness: 0.9, side: THREE.DoubleSide});
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vU;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvU = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vU;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float bulb = exp(-length(vU - vec3(0.0, ${(FH - 0.3).toFixed(2)}, -2.2)) * 0.75);
        totalEmissiveRadiance += vec3(1.0, 0.8, 0.55) * (0.04 + 0.9 * bulb);`);
  };
  m.customProgramCacheKey = () => 'unit';
  return m;
};

// walkway (floors 1..9): a slab with a railing (posts + top rail + mid rail)
export const walkwayGeometry = (len: number) => {
  const parts: THREE.BufferGeometry[] = [];
  const slab = new THREE.BoxGeometry(len, 0.16, 1.7); slab.translate(0, -0.08, 0.85); parts.push(slab);
  for (let x = -len / 2; x <= len / 2 + 1e-3; x += 1.5) { const p = new THREE.BoxGeometry(0.05, 1.05, 0.05); p.translate(x, 0.52, 1.66); parts.push(p); }
  for (const y of [1.05, 0.55]) { const r = new THREE.BoxGeometry(len, 0.05, 0.05); r.translate(0, y, 1.66); parts.push(r); }
  return merge(parts);
};
export const steelMaterial = () => new THREE.MeshStandardMaterial({color: col('#3A3D42'), roughness: 0.55, metalness: 0.6});

// a glowing outline round an opening (for the ice pick and the amber group); additive
export const frameGlowGeometry = () => {
  const parts: THREE.BufferGeometry[] = [];
  const t = 0.07, w = OPEN_W + 0.22, h = OPEN_H + 0.11;
  for (const s of [-1, 1]) { const b = new THREE.PlaneGeometry(t, h); b.translate(s * (w / 2), h / 2, 0.08); parts.push(b); }
  const top = new THREE.PlaneGeometry(w + t, t); top.translate(0, h, 0.08); parts.push(top);
  return merge(parts);
};

// big stencilled unit numbers (canvas) and projected labels
export const textTexture = (text: string, colr: string, w = 512, h = 256, font = "700 190px 'DejaVu Sans', sans-serif", glow = 18) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d')!;
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = colr; g.shadowColor = colr; g.shadowBlur = glow;
  g.fillText(text, w / 2, h / 2 + 8);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

// envelopes: canvas face + seeded fall parameters
export const envelopeTexture = () => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const g = c.getContext('2d')!;
  g.fillStyle = '#EFEBE3'; g.fillRect(0, 0, 256, 160);
  g.strokeStyle = 'rgba(120,110,100,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(128, 86); g.lineTo(256, 0); g.stroke();
  g.fillStyle = '#C8473A'; g.fillRect(206, 112, 34, 34);
  g.fillStyle = 'rgba(40,40,60,0.6)'; for (let i = 0; i < 3; i++) g.fillRect(70, 104 + i * 14, 90 - i * 18, 5);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
export const envelopeSeeds = (n: number) => Array.from({length: n}, (_, i) => ({
  x: (random('ex' + i) - 0.5) * 9, z: 0.9 + random('ez' + i) * 6.5, t0: random('et' + i) * 5.2 - 1.6,
  h: 7 + random('eh' + i) * 4, fall: 2.0 + random('ef' + i) * 1.2, spin: 2 + random('es' + i) * 5, ax: random('ea' + i) * Math.PI * 2,
  yaw: random('ey' + i) * Math.PI * 2, sway: 0.2 + random('ew' + i) * 0.5, flip: random('ef2' + i) > 0.5,
}));
