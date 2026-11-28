// One world for the whole film (timeline.ts): a reef sand flat, 1 unit = 1 cm. A peacock mantis shrimp (sourced
// model, "Mantis Shrimp" by all of life, CC BY 4.0, Sketchfab) faces a snail shell (built here). The close, slowed
// shots use a club built here, the water drawn as packed beads, and vapour bubbles. Everything is a pure function of t.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {random} from 'remotion';
import * as TL from './timeline';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const col = (h: string) => new THREE.Color(h);
const sm = (a: number, b: number, x: number) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const gauss = (k: string) => { const u = Math.max(1e-6, random(k + 'u')), v = random(k + 'v'); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * v); };

// ---------------------------------------------------------------- shared underwater patch (caustics, sand grain)
const U = {uT: {value: 0}};
const NOISE = /* glsl */`
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1,0)), f.x), mix(h21(i + vec2(0,1)), h21(i + vec2(1,1)), f.x), f.y); }
float caust(vec2 q, float t){ float c = 0.0;
  for (int i = 0; i < 3; i++){ q += vec2(sin(q.y * 1.3 + t * 0.9), cos(q.x * 1.1 - t * 0.7)) * 0.6; c += 1.0 / (1.0 + 22.0 * abs(sin(q.x) * sin(q.y))); }
  return pow(c / 3.0, 2.5); }`;
const under = <M extends THREE.MeshStandardMaterial>(m: M, key: string, opt: {grain?: number; caust?: number} = {}): M => {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uT = U.uT;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vUW;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvUW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nuniform float uT; varying vec3 vUW;\n${NOISE}`)
      .replace('#include <map_fragment>', `#include <map_fragment>
        ${opt.grain ? `{ float g = h21(floor(vUW.xz * 22.0)); float g2 = vn(vUW.xz * 3.0);
          diffuseColor.rgb *= 0.82 + 0.26 * g2; diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.35,0.3,0.25), step(0.93, g) * ${opt.grain.toFixed(2)});
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0,0.97,0.9), step(0.975, h21(floor(vUW.xz * 31.0) + 7.0)) * 0.5); }` : ''}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { vec3 nW = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
          float c = caust(vUW.xz * 0.22 + vec2(0.0, vUW.y * 0.1), uT * 0.8);
          totalEmissiveRadiance += diffuseColor.rgb * c * ${(opt.caust ?? 1.4).toFixed(2)} * max(nW.y, 0.0) * vec3(0.85, 1.0, 1.0); }`);
  };
  m.customProgramCacheKey = () => 'under-' + key;
  return m;
};

// ---------------------------------------------------------------- the set: sand, rubble, coral, specks, backdrop
const sandGeo = () => {
  const g = new THREE.PlaneGeometry(700, 700, 260, 260); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute; const c: number[] = [];
  const base = col('#d8c59c'), dark = col('#b49a72');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const r = Math.hypot(x, z);
    const rip = Math.sin(x * 0.55 + Math.sin(z * 0.08) * 3) * 0.18 * sm(6, 20, r) + Math.sin(x * 0.07 + z * 0.05) * 1.2 * sm(30, 120, r);
    const y = rip + (random(`sd${i}`) - 0.5) * 0.04 - 0.6 * sm(60, 300, r) * Math.sin(z * 0.01 + 1);
    p.setY(i, y);
    const k = 0.5 + 0.5 * Math.sin(x * 0.55 + Math.sin(z * 0.08) * 3);
    const cc = base.clone().lerp(dark, 0.25 * k + 0.2 * random(`sc${i}`)); c.push(cc.r, cc.g, cc.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); g.computeVertexNormals(); return g;
};
const rockGeo = (seed: number, detail = 3) => {
  const g = new THREE.IcosahedronGeometry(1, detail); const p = g.attributes.position as THREE.BufferAttribute;
  const a = random(`ra${seed}`) * 6, b = random(`rb${seed}`) * 6;
  for (let i = 0; i < p.count; i++) {
    const v = V(p.getX(i), p.getY(i), p.getZ(i)).normalize();
    const n = 1 + 0.22 * Math.sin(v.x * 3 + a) * Math.sin(v.y * 4 + b) + 0.12 * Math.sin(v.z * 7 + a * 2) + 0.05 * Math.sin(v.x * 13 + v.y * 11);
    p.setXYZ(i, v.x * n, v.y * n * 0.62, v.z * n);
  }
  g.computeVertexNormals(); return g;
};
type Rock = {p: THREE.Vector3; s: number; r: number; c: string; seed: number};
const ROCKS: Rock[] = (() => {
  const out: Rock[] = []; const cs = ['#8c8478', '#9b7d86', '#7d7f74', '#a8877c', '#b08aa6', '#6f7d76'];
  for (let i = 0; i < 70; i++) {
    const a = random(`rk${i}a`) * 6.283, d = 22 + Math.pow(random(`rk${i}d`), 0.7) * 230;
    const x = Math.cos(a) * d, z = Math.sin(a) * d - 10;
    if (z > 20 && Math.abs(x - 10) < 40) continue; // keep the camera side open
    out.push({p: V(x, 0, z), s: 2.5 + random(`rk${i}s`) * (6 + d * 0.06), r: random(`rk${i}r`) * 6, c: cs[i % cs.length], seed: i});
  }
  // a few pebbles and shell bits near the set
  for (let i = 0; i < 26; i++) {
    const a = random(`pb${i}a`) * 6.283, d = 4 + random(`pb${i}d`) * 16;
    const x = Math.cos(a) * d + 3, z = Math.sin(a) * d;
    if (Math.abs(z) < 3.5 && x > -8 && x < 14) continue;
    out.push({p: V(x, 0, z), s: 0.25 + random(`pb${i}s`) * 0.6, r: random(`pb${i}r`) * 6, c: ['#cfc4b0', '#a79f93', '#e6dccb', '#9c8f86'][i % 4], seed: 100 + i});
  }
  return out;
})();
// branching coral heads in the background (purple, orange, olive)
const coralGeo = (seed: number) => {
  const parts: THREE.BufferGeometry[] = [];
  const grow = (o: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number, depth: number, k: string) => {
    const end = o.clone().addScaledVector(dir, len);
    const c = new THREE.CylinderGeometry(rad * 0.7, rad, len, 14); c.translate(0, len / 2, 0);
    c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().normalize())); c.translate(o.x, o.y, o.z); parts.push(c);
    const tip = new THREE.SphereGeometry(rad * 0.75, 14, 10); tip.translate(end.x, end.y, end.z); parts.push(tip);
    if (depth > 0) for (let j = 0; j < 2 + (random(k + 'n') < 0.4 ? 1 : 0); j++) {
      const d2 = dir.clone().add(V(gauss(k + j + 'x') * 0.55, 0.25, gauss(k + j + 'z') * 0.55)).normalize();
      grow(end, d2, len * (0.6 + 0.25 * random(k + j + 'l')), rad * 0.72, depth - 1, k + j);
    }
  };
  for (let i = 0; i < 4; i++) grow(V(gauss(`c${seed}${i}a`) * 0.8, 0, gauss(`c${seed}${i}b`) * 0.8), V(gauss(`c${seed}${i}c`) * 0.3, 1, gauss(`c${seed}${i}d`) * 0.3).normalize(), 3, 0.9, 3, `c${seed}${i}`);
  return mergeGeos(parts);
};
const mergeGeos = (gs: THREE.BufferGeometry[]) => {
  let n = 0; gs.forEach((g) => { n += (g.index ? g.index.count : g.attributes.position.count); });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  gs.forEach((g) => { const ng = g.index ? g.toNonIndexed() : g; const p = ng.attributes.position.array as Float32Array; ng.computeVertexNormals();
    pos.set(p, o * 3); nor.set(ng.attributes.normal.array as Float32Array, o * 3); o += p.length / 3; });
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return out;
};
const CORALS = [
  {p: V(-60, 0, -70), s: 6, c: '#8d4fa0'}, {p: V(40, 0, -95), s: 8, c: '#d0703c'}, {p: V(-20, 0, -150), s: 10, c: '#7e8f3e'},
  {p: V(85, 0, -40), s: 5, c: '#b0466a'}, {p: V(-110, 0, -20), s: 7, c: '#c48a3a'}, {p: V(10, 0, -60), s: 4, c: '#9a5bb5'},
  {p: V(70, 0, 40), s: 6, c: '#8d4fa0'}, {p: V(-70, 0, 60), s: 7, c: '#d0703c'},
];

const backdropMat = () => new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: {uTop: {value: col('#7cc9dc')}, uMid: {value: col('#1f7a92')}, uBot: {value: col('#0c3b4e')}, uT: U.uT},
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform vec3 uTop, uMid, uBot; uniform float uT; varying vec3 vD;
    void main(){ float y = vD.y; vec3 c = y > 0.0 ? mix(uMid, uTop, pow(clamp(y * 1.6, 0.0, 1.0), 0.8)) : mix(uMid, uBot, clamp(-y * 3.0, 0.0, 1.0));
      float a = atan(vD.x, vD.z); float rays = pow(max(0.0, sin(a * 9.0 + sin(a * 3.0 + uT * 0.3) * 2.0)), 6.0) * smoothstep(0.0, 0.7, y) * 0.12;
      gl_FragColor = vec4(c + rays * vec3(0.7, 1.0, 1.0), 1.0); }`,
});

const specks = (n: number) => {
  const g = new THREE.BufferGeometry(); const p = new Float32Array(n * 3), s = new Float32Array(n);
  for (let i = 0; i < n; i++) { p[i * 3] = (random(`sp${i}x`) - 0.5) * 90; p[i * 3 + 1] = random(`sp${i}y`) * 30; p[i * 3 + 2] = (random(`sp${i}z`) - 0.5) * 90; s[i] = 0.4 + random(`sp${i}s`) * 1.2; }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(s, 1)); return g;
};
const speckMat = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: {uW: {value: 0}, uPx: {value: 1000}},
  vertexShader: `attribute float aS; uniform float uW; uniform float uPx; varying float vA;
    void main(){ vec3 p = position; p.y = mod(p.y + uW * 0.25 * aS, 30.0); p.x += sin(uW * 0.4 + p.z) * 0.6; p.z += cos(uW * 0.3 + p.x) * 0.6;
      vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; float d = -mv.z;
      gl_PointSize = clamp(uPx * 0.05 * aS / d, 1.0, 14.0); vA = 0.55 * smoothstep(1.0, 4.0, d) * (1.0 - smoothstep(30.0, 60.0, d)); }`,
  fragmentShader: `varying float vA; void main(){ vec2 c = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.1, length(c)) * vA; gl_FragColor = vec4(vec3(0.85, 0.97, 1.0) * a, a); }`,
});

// ---------------------------------------------------------------- the snail shell (a coiled whorl surface)
const SHELL_C = V(10.2, 0, 0.3);
const shellGeo = () => {
  const NT = 320, NP = 40, TH = 6.2 * Math.PI, k = 0.115;
  const pos: number[] = [], uv: number[] = [], colr: number[] = [], idx: number[] = [];
  const cream = col('#efe2c6'), brown = col('#7a4a2a'), rose = col('#c9876a');
  for (let i = 0; i <= NT; i++) {
    const th = (i / NT) * TH, e = Math.exp(k * th), R = 1.0 * e, a = 0.78 * e, H = 1.75 * e;
    for (let j = 0; j <= NP; j++) {
      const ph = (j / NP) * Math.PI * 2;
      const rib = 1 + 0.035 * Math.sin(th * 14) + 0.02 * Math.sin(ph * 9);
      const rr = R + a * Math.cos(ph) * rib;
      pos.push(rr * Math.cos(th), -H + a * Math.sin(ph) * rib, rr * Math.sin(th)); uv.push(i / NT, j / NP);
      const band = 0.5 + 0.5 * Math.sin(ph * 3 + th * 0.4), spot = random(`sh${Math.floor(th * 3)}_${Math.floor(ph * 2.5)}`) > 0.72 ? 1 : 0;
      const c = cream.clone().lerp(rose, 0.35 * band).lerp(brown, 0.75 * spot * sm(0.3, 0.6, band)); colr.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < NT; i++) for (let j = 0; j < NP; j++) { const a = i * (NP + 1) + j, b = a + NP + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setIndex(idx);
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3)); g.computeVertexNormals();
  // apex up and tilted away from the shrimp, body whorl toward it; fit to ~4.2 cm long
  g.rotateX(Math.PI); g.rotateZ(-1.05); g.rotateY(0.5);
  g.computeBoundingBox(); const b = g.boundingBox!; const s = 4.2 / (b.max.x - b.min.x);
  g.scale(s, s, s); g.computeBoundingBox(); const b2 = g.boundingBox!;
  g.translate(-(b2.min.x + b2.max.x) / 2, -b2.min.y - 0.25, -(b2.min.z + b2.max.z) / 2);
  return g;
};
const shellMat = () => {
  const m = under(new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.45, metalness: 0}), 'shell', {caust: 1.0});
  const prev = m.onBeforeCompile;
  const u = {uCrackP: {value: V(0, 0, 0)}, uCrack: {value: 0}, uGlow: {value: 0}, uGlowC: {value: col(TL.CYAN)}};
  m.onBeforeCompile = (sh, r) => {
    prev.call(m, sh, r); Object.assign(sh.uniforms, u);
    sh.fragmentShader = sh.fragmentShader.replace('uniform float uT;', 'uniform float uT; uniform vec3 uCrackP; uniform float uCrack; uniform float uGlow; uniform vec3 uGlowC;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        { vec3 q = (vUW - uCrackP) * 2.6; vec3 i = floor(q), f = fract(q); float d1 = 9.0, d2 = 9.0;
          for (int x=-1;x<=1;x++) for (int y=-1;y<=1;y++) for (int z=-1;z<=1;z++){ vec3 o = vec3(x,y,z);
            vec3 pp = o + vec3(h21(i.xy + o.xy + i.z + o.z), h21(i.yz + o.yz + 3.1), h21(i.zx + o.zx + 7.7)) - f; float d = dot(pp,pp);
            if (d < d1){ d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
          float edge = 1.0 - smoothstep(0.0, 0.08, sqrt(d2) - sqrt(d1));
          float reach = 1.0 - smoothstep(uCrack * 2.2 - 0.3, uCrack * 2.2, length(vUW - uCrackP));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.12, 0.08, 0.06), edge * reach * step(0.01, uCrack)); }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += uGlowC * uGlow * (1.0 - smoothstep(0.0, 2.2, length(vUW - uCrackP)));`);
  };
  m.customProgramCacheKey = () => 'shell-crack';
  return {m, u};
};

// ---------------------------------------------------------------- the club arm, built here (Matthew's note on v1:
// "the clubs are not attached to the shrimp's body"). One jointed arm, origin at the shoulder: the propodus runs along
// local +x from the shoulder (sunk into the model's merus) to the dactyl heel (the club), and the dactyl folds back
// under the propodus from the heel. Joints (sink, never butt; assembly.md): propodus end sinks 0.3 into the heel;
// dactyl starts inside the heel. The propodus is unit length, scaled in x to the shoulder-heel distance each frame.
const HEEL_R = 0.55;
const clubParts = () => {
  const heel = new THREE.SphereGeometry(HEEL_R, 40, 28); heel.scale(1.0, 0.82, 0.78);
  const heelMat = under(new THREE.MeshPhysicalMaterial({color: col('#f0a58f'), roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.2}), 'heel', {caust: 0.6});
  // dactyl: from inside the heel back along the propodus' underside (local -x from the heel, a little below)
  const dactyl = new THREE.CapsuleGeometry(0.15, 0.55, 6, 14); dactyl.rotateZ(Math.PI / 2); dactyl.translate(-0.55, -0.24, 0);
  // propodus: a tapered cylinder from x=0 (shoulder, r 0.22) to x=1 (heel, r 0.27), with a rounded shoulder end
  const prop = new THREE.CylinderGeometry(0.27, 0.22, 1, 22, 1, false); prop.rotateZ(-Math.PI / 2); prop.translate(0.5, 0, 0);
  const propCap = new THREE.SphereGeometry(0.22, 22, 14);
  const propMat = under(new THREE.MeshPhysicalMaterial({color: col('#b8362c'), roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3}), 'prop', {caust: 0.6});
  const dacMat = under(new THREE.MeshPhysicalMaterial({color: col('#e06a4a'), roughness: 0.35, clearcoat: 0.6}), 'dac', {caust: 0.6});
  // pale spots on the heel
  const spots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshStandardMaterial({color: '#ffe9dc', roughness: 0.4}), 24);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 24; i++) {
    const v = V(gauss(`hs${i}a`), gauss(`hs${i}b`), gauss(`hs${i}c`)).normalize(); if (v.x > 0.6) v.x = 0.6 - v.x;
    const p = V(v.x * 0.545, v.y * 0.445, v.z * 0.425); m4.compose(p, new THREE.Quaternion(), V(1, 1, 0.2)); spots.setMatrixAt(i, m4);
  }
  return {heel, heelMat, dactyl, dacMat, prop, propCap, propMat, spots};
};
// the shoulder: where the model's own raptorial appendage on the camera side (+z) leaves the body, measured from the
// GLB's vertices (its folded mass hangs at x 2.4-3.6, y 1.0-2.0, z 0.6-1.1 in shrimp space); the model's own folded
// propodus and dactyl on that side are hidden while the built arm is out (Film.tsx, uHide).
export const SHOULDER = V(3.15, 1.95, 0.9);

// ---------------------------------------------------------------- water beads (the water in the gap, illustrated)
const NB = 2200;
type Bead = {b: THREE.Vector3; ph: number};
const BEAD_BOX = {x0: -2.4, x1: 0.05, y: 1.1, z: 0.55};

// ---------------------------------------------------------------- bubbles
type Bub = {c: THREE.Vector3; r: number; t0: number; t1: number};
const bubbleMat = (glow = 0) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: {uRim: {value: col('#d9fbff')}, uC: {value: col(TL.CYAN)}, uGlow: {value: glow}},
  vertexShader: `varying vec3 vN; varying vec3 vV; varying float vI;
    void main(){ vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
      vV = normalize(cameraPosition - w.xyz); vI = instanceColor.r; gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `uniform vec3 uRim, uC; uniform float uGlow; varying vec3 vN; varying vec3 vV; varying float vI;
    void main(){ float f = 1.0 - abs(dot(normalize(vN), vV)); float rim = pow(f, 2.2);
      vec3 hl = normalize(vec3(-0.3, 0.8, 0.5)); float spec = pow(max(dot(reflect(-vV, normalize(vN)), hl), 0.0), 40.0);
      vec3 c = mix(uC * 0.5, uRim, rim) + spec * 1.6 + uC * uGlow * 0.6;
      float a = clamp(0.1 + rim * 0.95 + spec, 0.0, 1.0) * vI;
      gl_FragColor = vec4(c, a); }`,
});
// a glow sprite (sparks, ring flashes)
const glowMat = (c: string) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  uniforms: {uC: {value: col(c)}, uA: {value: 0}, uRing: {value: 0}},
  vertexShader: `varying vec2 vU; void main(){ vU = uv - 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform vec3 uC; uniform float uA, uRing; varying vec2 vU;
    void main(){ float d = length(vU) * 2.0; float core = exp(-d * d * 60.0) * 2.0 + exp(-d * 7.0) * 0.6;
      float star = (exp(-abs(vU.x) * 90.0) + exp(-abs(vU.y) * 90.0)) * exp(-d * 2.5) * 0.8;
      float ring = exp(-pow((d - 0.82) * 14.0, 2.0));
      float v = mix(core + star, ring, uRing) * uA; gl_FragColor = vec4(uC * v, v); }`,
});

// ---------------------------------------------------------------- camera per shot
type Cam = {p: THREE.Vector3; at: THREE.Vector3; fov: number};
const camAt = (t: number, P: THREE.Vector3): Cam => {
  const s = TL.shotAt(t); const t0 = TL.shotStart(s);
  const k = (a: number, b: number) => sm(a, b, t);
  const shake = (amp: number) => { const ls = TL.lastStrike(t); const e = Math.exp(-(t - ls) * 9) * (t >= ls ? 1 : 0);
    return V(Math.sin(t * 91) * amp * e, Math.sin(t * 73 + 1) * amp * e, 0); };
  switch (s) {
    case 'hook': { const u = k(0, TL.CUT_ID);
      return {p: V(lerp(27.5, 24.0, u), lerp(5.4, 4.2, u), lerp(11.5, 8.2, u)).add(shake(0.25)), at: V(lerp(5.0, 6.0, u), 2.0, 0.6), fov: 40}; }
    case 'id': { const u = k(t0, TL.CUT_FAST);
      return {p: V(lerp(-9, 3.5, u), lerp(5.5, 4.0, u), lerp(13, 10.5, u)).add(shake(0.15)), at: V(lerp(-3, 5.5, u), 1.8, 0), fov: 38}; }
    case 'fast': { const u = k(t0, TL.CUT_GAP);
      return {p: V(lerp(14, 18, u), lerp(1.4, 2.6, u), lerp(16, 14, u)).add(shake(0.3)), at: V(6.8, 1.8, 0), fov: 46}; }
    case 'gap': { const u = k(t0, TL.CUT_COLLAPSE);
      return {p: V(P.x - lerp(1.5, 0.9, u), P.y + lerp(0.55, 0.3, u), lerp(6.5, 4.6, u)), at: V(P.x - lerp(0.6, 0.4, u), P.y - 0.05, 0), fov: 34}; }
    case 'collapse': { const u = k(t0, TL.CUT_FLASH);
      return {p: V(P.x - lerp(2.6, 2.1, u), P.y + lerp(2.1, 1.7, u), lerp(2.7, 3.4, u)), at: V(P.x - 0.35, P.y - 0.15, 0.1), fov: 40}; }
    case 'flash': { const u = k(t0, TL.CUT_END);
      return {p: V(P.x - lerp(1.6, 1.35, u), P.y + 0.15, lerp(1.6, 1.2, u)), at: V(P.x - 0.32, P.y, 0.05), fov: 34}; }
    default: { const u = k(t0, TL.DUR_S);
      return {p: V(lerp(21, 27, u), lerp(4.0, 6.5, u), lerp(8, 12, u)).add(shake(0.25)), at: V(6, 3.6, 0.4), fov: 42}; }
  }
};

// ---------------------------------------------------------------- the scene
export type Assets = {shrimp: THREE.Object3D; armHide: {value: number}};
export const Scene: React.FC<{t: number; assets: Assets; dbg?: number[]}> = ({t, assets, dbg}) => {
  const {camera, scene, gl, size} = useThree();
  const W = useMemo(() => {
    const sand = new THREE.Mesh(sandGeo(), under(new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.95}), 'sand', {grain: 1}));
    sand.receiveShadow = true;
    const rocks = new THREE.Group();
    const rockGeos = [0, 1, 2, 3, 4, 5].map((i) => rockGeo(i));
    ROCKS.forEach((r, i) => { const m = new THREE.Mesh(rockGeos[i % 6], under(new THREE.MeshStandardMaterial({color: r.c, roughness: 0.9}), 'rock' + (i % 6), {caust: 1.2}));
      m.position.copy(r.p).setY(r.s * 0.18); m.scale.setScalar(r.s); m.rotation.y = r.r; m.castShadow = r.s < 3; m.receiveShadow = true; rocks.add(m); });
    const corals = new THREE.Group();
    CORALS.forEach((c, i) => { const m = new THREE.Mesh(coralGeo(i), under(new THREE.MeshStandardMaterial({color: c.c, roughness: 0.7}), 'coral' + i, {caust: 1.0}));
      m.position.copy(c.p); m.scale.setScalar(c.s); corals.add(m); });
    const back = new THREE.Mesh(new THREE.SphereGeometry(800, 32, 16), backdropMat());
    const sp = new THREE.Points(specks(2600), speckMat());
    const shellG = shellGeo(); const sh = shellMat(); const shell = new THREE.Mesh(shellG, sh.m); shell.castShadow = true; shell.receiveShadow = true;
    shell.position.copy(SHELL_C);
    // contact point: the shell surface met by a ray from the shrimp's front along +x
    shell.updateMatrixWorld(true);
    const ray = new THREE.Raycaster(V(-5, 1.55, 0.2), V(1, 0, 0)); sh.m.side = THREE.DoubleSide;
    const hit = ray.intersectObject(shell)[0]; const P = hit ? hit.point.clone() : V(8.1, 1.55, 0.2); sh.m.side = THREE.FrontSide;
    sh.u.uCrackP.value.copy(P);
    // club
    const cp = clubParts(); const club = new THREE.Group();   // origin = shoulder, +x toward the heel
    const heelG = new THREE.Group();                              // origin = heel centre, at x = arm length
    const heel = new THREE.Mesh(cp.heel, cp.heelMat), dac = new THREE.Mesh(cp.dactyl, cp.dacMat);
    const prop = new THREE.Mesh(cp.prop, cp.propMat), cap = new THREE.Mesh(cp.propCap, cp.propMat);
    [heel, dac].forEach((m) => { m.castShadow = true; heelG.add(m); }); heelG.add(cp.spots);
    [prop, cap].forEach((m) => { m.castShadow = true; club.add(m); }); club.add(heelG);
    // beads
    const beads: Bead[] = []; let n = 0, tries = 0;
    while (n < NB && tries < 40000) { tries++;
      const near = random(`bd${tries}n`) < 0.45, kk = near ? 0.4 : 1;
      const b = V(lerp(near ? -1.0 : BEAD_BOX.x0, BEAD_BOX.x1, random(`bd${tries}x`)), (random(`bd${tries}y`) * 2 - 1) * BEAD_BOX.y * kk, (random(`bd${tries}z`) * 2 - 1) * BEAD_BOX.z * kk).add(P);
      if (b.y < 0.15) continue; beads.push({b, ph: random(`bd${tries}p`) * 6.28}); n++; }
    const beadMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.017, 8, 6), new THREE.MeshBasicMaterial({color: TL.BEAD, transparent: true, opacity: 0.85, depthWrite: false}), NB);
    beadMesh.frustumCulled = false;
    // bubbles in the gap (club side of the contact point)
    const bubs: Bub[] = [];
    for (let i = 0; i < 46; i++) {
      const c = V(-Math.abs(gauss(`bb${i}x`)) * 0.32 - 0.06, gauss(`bb${i}y`) * 0.42, gauss(`bb${i}z`) * 0.42).add(P);
      const r = 0.05 + Math.pow(random(`bb${i}r`), 1.6) * 0.2;
      bubs.push({c, r, t0: TL.TEAR + random(`bb${i}t`) * 0.9, t1: lerp(TL.COLLAPSE_A, TL.COLLAPSE_B, random(`bb${i}c`))});
    }
    const bubMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 28, 18), bubbleMat(), 120);
    bubMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(120 * 3), 3); bubMesh.frustumCulled = false; bubMesh.renderOrder = 5;
    // flash shot: three big bubbles on the shell
    const fb: Bub[] = [
      {c: V(-0.34, 0.08, 0.06).add(P), r: 0.15, t0: 0, t1: 0}, {c: V(-0.22, -0.2, -0.12).add(P), r: 0.11, t0: 0, t1: 0}, {c: V(-0.5, -0.12, 0.2).add(P), r: 0.12, t0: 0, t1: 0},
    ];
    // sparks and rings: a pool of glow sprites
    const sprites = Array.from({length: 14}, (_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMat(i < 7 ? '#e8f6ff' : TL.CYAN)); m.renderOrder = 10; m.frustumCulled = false; return m; });
    // real-speed burst: small bubbles thrown out of the contact point
    const burst = Array.from({length: 70}, (_, i) => ({d: V(-Math.abs(gauss(`bu${i}x`)) - 0.2, gauss(`bu${i}y`) * 0.9, gauss(`bu${i}z`) * 0.9).normalize(), s: 0.04 + random(`bu${i}s`) * 0.16, v: 0.8 + random(`bu${i}v`) * 2.2}));
    // smear arc (the club's path at real speed), orange
    const A = V(5.2, 1.15, 0.2);
    const arc = new THREE.QuadraticBezierCurve3(A, V((A.x + P.x) / 2, P.y + 1.4, 0.2), P.clone().add(V(-0.25, 0, 0)));
    const smear = new THREE.Mesh(new THREE.TubeGeometry(arc, 40, 0.42, 12), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: {uA: {value: 0}, uC: {value: col(TL.ORANGE)}},
      vertexShader: `varying vec2 vU; varying vec3 vN; varying vec3 vV; void main(){ vU = uv; vec4 w = modelMatrix * vec4(position,1.0); vN = normalize(mat3(modelMatrix)*normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uA; uniform vec3 uC; varying vec2 vU; varying vec3 vN; varying vec3 vV;
        void main(){ float f = abs(dot(normalize(vN), vV)); float a = pow(vU.x, 1.6) * f * uA; gl_FragColor = vec4(mix(uC, vec3(1.0, 0.95, 0.85), pow(vU.x, 4.0)) * a, a); }`,
    }));
    smear.frustumCulled = false;
    // sand puff at the shell's foot
    const puff = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({color: '#e8dcc0', size: 0.18, transparent: true, opacity: 0.7, depthWrite: false}));
    const pp = new Float32Array(160 * 3); puff.geometry.setAttribute('position', new THREE.BufferAttribute(pp, 3)); puff.frustumCulled = false;
    // lights
    const sun = new THREE.DirectionalLight('#eafcff', 2.6); sun.position.set(8, 40, 14); sun.target.position.set(6, 0, 0);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, {left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 90});
    sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02; sun.shadow.camera.updateProjectionMatrix();
    const hemi = new THREE.HemisphereLight('#9fe6ff', '#c9b48c', 1.15);
    const fill = new THREE.DirectionalLight('#7fd6ff', 0.6); fill.position.set(30, 6, 20);
    // shrimp
    const shrimp = assets.shrimp; shrimp.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    const root = new THREE.Group();
    [sand, rocks, corals, back, sp, shell, club, beadMesh, bubMesh, smear, puff, sun, sun.target, hemi, fill, shrimp, ...sprites].forEach((o) => root.add(o));
    return {armHide: assets.armHide, root, shell, sh, P, club, heelG, heel, prop, beads, beadMesh, bubs, bubMesh, fb, sprites, burst, smear, puff, pp, shrimp, sp, A};
  }, [assets]);

  // ---------------- per frame
  scene.background = col('#1c6f86');
  
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05;
  gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
  const shot = TL.shotAt(t); const slowShot = shot === 'gap' || shot === 'collapse' || shot === 'flash';
  scene.fog = new THREE.FogExp2('#1f7890', slowShot ? 0.035 : 0.0085);
  // world clock for ambient life: nearly frozen in the slowed shots
  const tw = slowShot ? TL.CUT_GAP + (t - TL.CUT_GAP) * 0.04 : t;
  U.uT.value = tw;
  const P = W.P;
  const c = dbg ? {p: V(dbg[0], dbg[1], dbg[2]), at: V(dbg[3], dbg[4], dbg[5]), fov: dbg[6]} : camAt(t, P); const cam = camera as THREE.PerspectiveCamera;
  cam.position.copy(c.p); cam.lookAt(c.at); cam.fov = c.fov; cam.near = slowShot ? 0.05 : 0.3; cam.far = 1500; cam.aspect = size.width / size.height; cam.updateProjectionMatrix();
  (W.sp.material as THREE.ShaderMaterial).uniforms.uW.value = tw; (W.sp.material as THREE.ShaderMaterial).uniforms.uPx.value = size.height / Math.tan((c.fov * Math.PI) / 360);
  W.sp.position.set(c.at.x, 0, c.at.z);

  // ---- real-speed strikes: smear, body jolt, shell jolt, burst, puff
  const ls = TL.lastStrike(t), dt = t - ls; const realShot = !slowShot;
  const sm1 = realShot && dt >= 0 && dt < 0.2 ? (1 - dt / 0.2) : 0;
  (W.smear.material as THREE.ShaderMaterial).uniforms.uA.value = sm1 * 1.4;
  void 0; W.smear.visible = sm1 > 0;
  const jolt = realShot && dt >= 0 ? Math.exp(-dt * 14) * Math.sin(Math.min(dt * 40, Math.PI)) : 0;
  W.shrimp.visible = !slowShot; W.shrimp.position.x = 0.35 * jolt; W.shrimp.userData.wrapX.value = W.shrimp.position.x;
  // shell: jolt on each strike; crack grows over the film's hits
  const crack = shot === 'end' ? lerp(0.35, 1.0, sm(TL.BEATS.two, TL.BEATS.two + 0.4, t)) : slowShot ? (t >= TL.HIT2 ? lerp(0.15, 0.55, sm(TL.HIT2, TL.HIT2 + 0.6, t)) : t >= TL.CONTACT ? 0.15 : 0) : (t > TL.CUT_FAST ? 0.12 : 0);
  W.sh.u.uCrack.value = crack;
  const hitGlow = slowShot ? Math.exp(-Math.max(0, t - TL.HIT2) * 4) * (t >= TL.HIT2 ? 1 : 0) * 0.9 : (realShot && dt >= 0 ? Math.exp(-dt * 10) * 0.5 : 0);
  W.sh.u.uGlow.value = hitGlow + (shot === 'end' && t > TL.BEATS.two ? 0.45 * Math.exp(-(t - TL.BEATS.two) * 5) : 0);
  W.shell.position.copy(SHELL_C).add(V(0.22 * jolt, 0, 0));
  // sand puff
  const pf = realShot && dt >= 0 && dt < 1.5 ? dt : -1;
  for (let i = 0; i < 160; i++) {
    const a = random(`pf${i}a`) * 6.283, v = 0.6 + random(`pf${i}v`) * 2.2, e = pf < 0 ? 0 : 1 - Math.exp(-pf * 3);
    W.pp[i * 3] = P.x + Math.cos(a) * v * e * 1.2 - 0.5; W.pp[i * 3 + 1] = 0.1 + random(`pf${i}y`) * 1.5 * e; W.pp[i * 3 + 2] = P.z + Math.sin(a) * v * e * 1.2;
  }
  (W.puff.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  (W.puff.material as THREE.PointsMaterial).opacity = pf < 0 ? 0 : 0.6 * Math.exp(-pf * 1.6); W.puff.visible = pf >= 0;

  // ---- club arm: shoulder -> heel. Real speed: it swings out from the folded pose to the shell in ~2 frames and
  // folds back; slowed: the heel approaches, touches (HIT 1) and rebounds, the propodus leading back to the shoulder.
  const heelR = HEEL_R;
  let clubX: number;
  // slowed macro shots: the shrimp is out of frame (hidden), so the arm leads up and back toward it at ~55 degrees and
  // stays in the frame above the club instead of leaving flat off the left edge
  const S = slowShot ? P.clone().add(V(-1.7, 2.8, 0.35)) : SHOULDER.clone().add(V(0.35 * jolt, 0, 0));
  const hitP = P.clone().add(V(-heelR, 0.02, 0));
  let H: THREE.Vector3;
  if (!slowShot) {
    const k = dt < 0 ? 0 : dt < 0.05 ? dt / 0.05 : dt < 0.16 ? 1 : 1 - sm(0.16, 0.3, dt);   // snaps back as fast as it strikes
    const out = k > 0.02;
    // a straight shot along the strike line from under the head (a hinge from the folded pose swept the arm through the
    // sand mid-swing): the arm extends from the shoulder to the shell and pulls back the same way
    const d1 = hitP.clone().add(V(0.35 * jolt * 0.6, 0, 0)).sub(S);
    const L = lerp(0.9, d1.length(), k);
    H = S.clone().addScaledVector(d1.normalize(), L);
    W.club.visible = out; W.armHide.value = out ? 1 : 0;
  } else {
    if (t < TL.CONTACT) clubX = lerp(-1.4, -heelR, sm(TL.CUT_GAP, TL.CONTACT, t) * 0.25 + 0.75 * Math.pow(sm(TL.CUT_GAP, TL.CONTACT, t), 2.2));
    else clubX = -heelR - 0.75 * sm(TL.CONTACT, TL.REBOUND_END, t) - 0.25 * sm(TL.REBOUND_END, TL.COLLAPSE_B + 1, t);
    H = V(P.x + clubX, P.y + 0.02, P.z);
    W.club.visible = true; W.armHide.value = 0;
  }
  {
    const d = H.clone().sub(S); const L = d.length();
    W.club.position.copy(S); W.club.quaternion.setFromUnitVectors(V(1, 0, 0), d.normalize());
    W.prop.scale.set(L - 0.3, 1, 1);          // ends 0.3 inside the heel
    W.heelG.position.set(L, 0, 0);
    // keep the heel's own up the world's up (roll about the arm axis only follows the hinge)
    W.club.scale.setScalar(1);
  }
  const clubC = H;

  // ---- bubbles: gap bubbles in GAP/COLLAPSE; three big ones in FLASH; a burst at real speed
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  let nb = 0; const live: {c: THREE.Vector3; r: number}[] = [];
  const sprites = W.sprites; sprites.forEach((s) => { s.visible = false; });
  let si = 0, ri = 7;
  const sprite = (pos: THREE.Vector3, sizeV: number, a: number, ring: boolean, c?: string) => {
    const pool = ring ? ri++ : si++; if ((ring && pool >= 14) || (!ring && pool >= 7)) return; const s = sprites[pool];
    s.visible = a > 0.005; s.position.copy(pos); s.quaternion.copy(cam.quaternion); s.scale.setScalar(sizeV);
    const u = (s.material as THREE.ShaderMaterial).uniforms; u.uA.value = a; u.uRing.value = ring ? 1 : 0; u.uC.value.set(c ?? (ring ? TL.CYAN : '#e8f6ff'));
  };
  if (shot === 'gap' || shot === 'collapse') {
    const sparkList: {p: THREE.Vector3; e: number}[] = [];
    for (const b of W.bubs) {
      if (t < b.t0) continue;
      const g = sm(b.t0, b.t0 + 0.7, t); const wob = 1 + 0.06 * Math.sin(t * 9 + b.r * 50);
      let r = b.r * g * wob;
      if (t > b.t1) { const k = Math.min(1, (t - b.t1) / 0.28); r = b.r * (1 - k * k * k); if (k >= 1) { r = 0; sparkList.push({p: b.c, e: t - b.t1 - 0.28}); } }
      if (r > 0.004) { live.push({c: b.c, r}); m4.compose(b.c, q, V(r, r, r)); W.bubMesh.setMatrixAt(nb, m4); W.bubMesh.instanceColor!.setXYZ(nb, 1, 1, 1); nb++; }
    }
    // collapse rings (cyan) for the most recent few
    sparkList.sort((a, b) => a.e - b.e).slice(0, 5).forEach((s) => { if (s.e < 0.5) sprite(s.p.clone().add(V(0.05, 0, 0)), 0.15 + s.e * 2.4, 0.9 * (1 - s.e / 0.5), true); });
    // HIT 1: an orange flash where the club meets the shell
    if (t >= TL.CONTACT && t < TL.CONTACT + 0.7) { const e = t - TL.CONTACT; sprite(P.clone().add(V(-0.1, 0, 0.1)), 0.5 + e * 3, 1.1 * (1 - e / 0.7), true, TL.ORANGE); if (e < 0.2) sprite(P.clone().add(V(-0.1, 0, 0.1)), 1.2, 1.2 * (1 - e / 0.2), false, '#ffd2a8'); }
    // HIT 2: one big ring across the shell
    if (t >= TL.HIT2 && t < TL.HIT2 + 0.8) sprite(P.clone().add(V(-0.1, 0, 0.1)), 0.6 + (t - TL.HIT2) * 4.5, 1.2 * (1 - (t - TL.HIT2) / 0.8), true);
  }
  if (shot === 'flash') {
    const times = [TL.BEATS.flash - 0.15, TL.BEATS.light - 0.1, TL.BEATS.faint + 0.35];
    W.fb.forEach((b, i) => {
      const tc = times[i]; let r = b.r * (1 + 0.04 * Math.sin(t * 7 + i));
      if (t > tc - 0.45) { const k = Math.min(1, (t - (tc - 0.45)) / 0.45); r = b.r * (1 - k * k * k); }
      if (r > 0.003) { live.push({c: b.c, r}); m4.compose(b.c, q, V(r, r, r)); W.bubMesh.setMatrixAt(nb, m4); W.bubMesh.instanceColor!.setXYZ(nb, 1, 1, 1); nb++; }
      const e = t - tc; if (e >= -0.03 && e < 0.7) { sprite(b.c, 0.5 + 0.2 * Math.exp(-e * 6), Math.exp(-Math.max(0, e) * 6) * 1.6, false); if (e > 0) sprite(b.c, 0.1 + e * 1.4, 0.7 * (1 - e / 0.7), true); }
    });
  }
  if (realShot && dt >= 0 && dt < 0.9) {
    const k = 1 - Math.exp(-dt * 7), fadeA = 1 - sm(0.35, 0.9, dt);
    W.burst.forEach((b, i) => { if (nb >= 120) return; const r = b.s * (0.4 + 0.8 * k) * (1 - sm(0.5, 0.9, dt)); if (r < 0.004) return;
      const pos = P.clone().add(V(-0.25, 0, 0)).addScaledVector(b.d, b.v * k * 1.5);
      m4.compose(pos, q, V(r * 1.8, r * 1.8, r * 1.8)); W.bubMesh.setMatrixAt(nb, m4); W.bubMesh.instanceColor!.setXYZ(nb, fadeA, 1, 1); nb++; void i; });
    if (dt < 0.25) sprite(P.clone().add(V(-0.3, 0, 0)), 1.5 + dt * 10, 1.0 * (1 - dt / 0.25), true);
    if (dt < 0.06) sprite(P.clone().add(V(-0.3, 0, 0)), 2.2, 1.2 * (1 - dt / 0.06), false);
  }
  W.bubMesh.count = nb; W.bubMesh.instanceMatrix.needsUpdate = true; W.bubMesh.instanceColor!.needsUpdate = true;

  // ---- beads (GAP, COLLAPSE, FLASH): jitter, pushed around the club, stretched apart, pushed out by bubbles
  const showBeads = shot === 'gap' || shot === 'collapse';
  W.beadMesh.visible = showBeads;
  if (showBeads) {
    const vis = shot === 'gap' ? sm(TL.BEATS.watch - 0.2, TL.BEATS.watch + 0.5, t) : 1;
    (W.beadMesh.material as THREE.MeshBasicMaterial).opacity = 0.75 * vis;
    const stretch = sm(TL.CONTACT + 0.1, TL.REBOUND_END, t) * (1 - sm(TL.COLLAPSE_A, TL.COLLAPSE_B + 0.3, t));
    const tmp = V(0, 0, 0);
    for (let i = 0; i < W.beads.length; i++) {
      const b = W.beads[i]; tmp.copy(b.b);
      tmp.x += Math.sin(t * 2.1 + b.ph) * 0.012; tmp.y += Math.cos(t * 1.7 + b.ph * 1.3) * 0.012;
      // stretched: beads near the contact point pulled away from it (low pressure, the water spread thin)
      const d0 = tmp.distanceTo(P); const w = Math.exp(-d0 * d0 * 1.2) * stretch;
      tmp.sub(P).multiplyScalar(1 + 1.6 * w).add(P);
      // pushed around the club's heel
      const dc = tmp.distanceTo(clubC); const R = heelR * 1.05 + 0.05;
      if (dc < R) tmp.sub(clubC).setLength(R).add(clubC);
      // behind the heel: the propodus (keep beads off a capsule-ish volume up-left of the heel)
      for (const l of live) { const d = tmp.distanceTo(l.c); const rr = l.r + 0.05; if (d < rr) tmp.sub(l.c).setLength(rr).add(l.c); }
      if (tmp.x > P.x + 0.02) tmp.x = P.x + 0.02 - (tmp.x - P.x) * 0.2; // never inside the shell
      const s = (1 - 0.45 * w) * (tmp.distanceTo(cam.position) < 0.9 ? 0 : 1);
      m4.compose(tmp, q, V(s, s, s)); W.beadMesh.setMatrixAt(i, m4);
    }
    W.beadMesh.instanceMatrix.needsUpdate = true;
  }
  return <primitive object={W.root} />;
};

export {SHELL_C};
