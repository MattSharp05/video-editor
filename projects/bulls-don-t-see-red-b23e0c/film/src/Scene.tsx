// One world for the whole film (timeline.ts): a sunlit bullring, 1 unit = 1 m. The bull is a sourced model ("Black
// Bull" by Znvne179, Sketchfab, CC BY 4.0), rigged but without animations: its gallop, pawing, head and tail are
// driven here from its bones. Everything else is built here. Bull vision: every material ends with bvApply(), which
// swaps the colour for a cattle-like dichromat's (Vienot et al. 1999 deuteranope matrix in linear RGB: cattle cones
// peak ~455 and ~555 nm, close to a human deuteranope) on the right of the split line. Everything is a pure function of t.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {staticFile, random} from 'remotion';
import * as TL from './timeline';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const col = (h: string) => new THREE.Color(h);
const sm = (a: number, b: number, x: number) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- bull vision (the split)
export const BVU = {uSplit: {value: 1.2}, uRes: {value: new THREE.Vector2(1080, 1920)}, uBvOn: {value: 1}};
const BV_GLSL = /* glsl */`
uniform float uSplit; uniform vec2 uRes; uniform float uBvOn;
vec3 bullVision(vec3 c){ float l = dot(c, vec3(0.29275, 0.70725, 0.0)); return max(vec3(l, l, -0.02234 * c.r + 0.02234 * c.g + c.b), 0.0); }
vec3 bvApply(vec3 c){ float x = gl_FragCoord.x / uRes.x; float m = smoothstep(uSplit - 0.0012, uSplit + 0.0012, x) * uBvOn; return mix(c, bullVision(c), m); }`;
const bv = <M extends THREE.Material>(m: M, key: string): M => {
  const prev = m.onBeforeCompile.bind(m);
  m.onBeforeCompile = (sh, r) => {
    prev(sh, r);
    Object.assign(sh.uniforms, BVU);
    sh.fragmentShader = BV_GLSL + '\n' + sh.fragmentShader.replace('#include <tonemapping_fragment>',
      'gl_FragColor.rgb = bvApply(gl_FragColor.rgb);\n#include <tonemapping_fragment>');
  };
  const k0 = m.customProgramCacheKey.bind(m);
  m.customProgramCacheKey = () => k0() + '|bv-' + key;
  return m;
};
const std = (o: THREE.MeshStandardMaterialParameters, key: string) => bv(new THREE.MeshStandardMaterial(o), key);

// ---------------------------------------------------------------- the bull (sourced, posed from its bones)
type Bone = {b: THREE.Bone; q0: THREE.Quaternion; lat: THREE.Vector3; up: THREE.Vector3};
export type Assets = {bull: THREE.Group; bones: Record<string, Bone>; len: number};
const BONES = ['hip', 'abdomen', 'chest', 'neck', 'head', 'lShldr', 'lForeArm', 'lfrontHoof', 'rShldr', 'rForeArm', 'rfrontHoof',
  'lThigh', 'lShin', 'lFoot', 'rThigh', 'rShin', 'rFoot', 'tail01', 'tail02', 'tail03', 'tail04', 'tail05'];
let cache: Promise<Assets> | null = null;
export const loadAssets = () => cache ??= (async () => {
  const gltf = await new GLTFLoader().loadAsync(staticFile('models/bull.glb'));
  const inner = gltf.scene;
  inner.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true; m.frustumCulled = false;
      const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshStandardMaterial[];
      mats.forEach((mt) => { mt.metalness = 0; if (mt.name === 'Skin') { mt.roughness = 0.62; mt.color.setScalar(1.0); } bv(mt, 'bull-' + mt.name); });
    }
  });
  const holder = new THREE.Group(); holder.add(inner); holder.updateMatrixWorld(true);
  const find = (p: string) => { let r: THREE.Bone | null = null; inner.traverse((o) => { if (!r && (o as THREE.Bone).isBone && o.name.startsWith(p + '_')) r = o as THREE.Bone; }); return r as unknown as THREE.Bone; };
  const head = find('head').getWorldPosition(V(0, 0, 0)), hip = find('hip').getWorldPosition(V(0, 0, 0));
  const fwd = head.clone().sub(hip); fwd.y = 0; fwd.normalize();
  inner.rotation.y = -Math.atan2(-fwd.z, fwd.x);      // head toward +x
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(holder); const sz = box.getSize(V(0, 0, 0));
  const s = 2.75 / sz.x; holder.scale.setScalar(s); holder.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(holder); const c2 = b2.getCenter(V(0, 0, 0));
  holder.position.set(-c2.x, -b2.min.y, -c2.z); holder.updateMatrixWorld(true);
  const bull = new THREE.Group(); bull.add(holder); bull.updateMatrixWorld(true);
  const bones: Record<string, Bone> = {};
  const wq = new THREE.Quaternion();
  for (const n of BONES) {
    const b = find(n); if (!b) continue;
    b.getWorldQuaternion(wq); const inv = wq.clone().invert();
    bones[n] = {b, q0: b.quaternion.clone(), lat: V(0, 0, 1).applyQuaternion(inv).normalize(), up: V(0, 1, 0).applyQuaternion(inv).normalize()};
  }
  return {bull, bones, len: 2.75};
})();

const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
const turn = (B: Bone | undefined, lat: number, up = 0) => {
  if (!B) return;
  qa.setFromAxisAngle(B.lat, lat); qb.setFromAxisAngle(B.up, up);
  B.b.quaternion.copy(B.q0).multiply(qa).multiply(qb);
};
// gait: phase in strides, amt 0 (standing) .. 1 (full gallop); headDown 0..1; paw 0..1 (right fore scrapes the sand)
type Pose = {phase: number; amt: number; headDown: number; paw: number; t: number; look?: number};
const poseBull = (A: Assets, p: Pose) => {
  const B = A.bones; const g = p.amt;
  const sw = (off: number) => Math.sin(TAU * (p.phase + off));
  const fl = (off: number) => Math.max(0, Math.sin(TAU * (p.phase + off) + 1.4));
  // rotary gallop: hind left, hind right, fore right, fore left (lead changes ignored)
  // positive lat rotation swings a limb forward (checked in stills, sign SWING)
  const SW = 1;
  turn(B.lThigh, SW * g * 0.5 * sw(0.0)); turn(B.lShin, -SW * g * 0.6 * fl(0.0)); turn(B.lFoot, SW * g * 0.5 * fl(0.05));
  turn(B.rThigh, SW * g * 0.5 * sw(0.1)); turn(B.rShin, -SW * g * 0.6 * fl(0.1)); turn(B.rFoot, SW * g * 0.5 * fl(0.15));
  const pw = p.paw * Math.max(0, Math.sin(p.t * 5.2));
  turn(B.rShldr, SW * g * 0.55 * sw(0.5) - 0.25 * pw); turn(B.rForeArm, SW * (g * 0.9 * fl(0.5) + 0.9 * pw)); turn(B.rfrontHoof, SW * (g * 0.5 * fl(0.55) + 0.5 * pw));
  turn(B.lShldr, SW * g * 0.55 * sw(0.6)); turn(B.lForeArm, SW * g * 0.9 * fl(0.6)); turn(B.lfrontHoof, SW * g * 0.5 * fl(0.65));
  const rock = g * 0.07 * Math.sin(TAU * (p.phase + 0.3));
  turn(B.chest, rock * 0.6); turn(B.abdomen, -rock * 0.3);
  const breathe = 0.012 * Math.sin(p.t * 2.1);
  turn(B.neck, -SW * (0.42 * p.headDown) + breathe + g * 0.05 * sw(0.45), (p.look ?? 0) * 0.5);
  turn(B.head, -SW * 0.18 * p.headDown + 0.03 * Math.sin(p.t * 0.9), (p.look ?? 0) * 0.3);
  ['tail01', 'tail02', 'tail03', 'tail04', 'tail05'].forEach((n, i) => turn(B[n], (0.12 + g * 0.25) * Math.sin(p.t * (1.6 + g * 6) - i * 0.6) * 0.5,
    (0.18 + g * 0.2) * Math.sin(p.t * (1.3 + g * 5) - i * 0.7)));
};

// ---------------------------------------------------------------- the ring
const R_RING = 22;
const sandGeo = () => {
  const g = new THREE.CircleGeometry(R_RING + 0.2, 220, 0, TAU); // radial segments only
  const pg = new THREE.PlaneGeometry(2 * R_RING + 1, 2 * R_RING + 1, 300, 300); pg.rotateX(-Math.PI / 2); g.dispose();
  const p = pg.attributes.position as THREE.BufferAttribute; const c: number[] = [];
  const base = col('#c99a62'), dark = col('#a9784a'), light = col('#dcb27c');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i); const r = Math.hypot(x, z), a = Math.atan2(z, x);
    // raked in rings, scuffed by hooves near the middle
    const rake = Math.sin(r * 9 + Math.sin(a * 3) * 0.8) * 0.5 + 0.5;
    const n1 = Math.sin(x * 0.7 + Math.sin(z * 0.4) * 2) * Math.sin(z * 0.6 - x * 0.2);
    const scuff = random(`sd${i}`);
    p.setY(i, (rake - 0.5) * 0.012 + n1 * 0.03 + (scuff - 0.5) * 0.01);
    const k = 0.35 * rake + 0.25 * (n1 * 0.5 + 0.5) + 0.25 * scuff;
    const cc = base.clone().lerp(dark, 0.6 * (1 - k)).lerp(light, 0.4 * Math.max(0, k - 0.5));
    c.push(cc.r, cc.g, cc.b);
  }
  pg.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); pg.computeVertexNormals(); return pg;
};
// barrier: red-painted vertical planks with dark seams, a dark top rail, four plank shields (burladeros)
const barrierTex = () => {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 128; const g = cv.getContext('2d')!;
  g.fillStyle = '#8f1a17'; g.fillRect(0, 0, 1024, 128);
  for (let i = 0; i < 64; i++) {
    const x = i * 16; const v = random(`pl${i}`); g.fillStyle = `rgba(${120 + v * 40},${18 + v * 10},${16 + v * 8},1)`; g.fillRect(x, 0, 15, 128);
    g.fillStyle = 'rgba(30,6,4,0.9)'; g.fillRect(x + 15, 0, 1, 128);
    for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(255,220,200,${0.05 * random(`sc${i}${k}`)})`; g.fillRect(x + random(`sx${i}${k}`) * 14, random(`sy${i}${k}`) * 128, 2, 6 + random(`sl${i}${k}`) * 20); }
  }
  g.fillStyle = 'rgba(70,40,20,0.55)'; g.fillRect(0, 112, 1024, 16);   // sand splashed on the foot
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(10, 1); tx.anisotropy = 8; return tx;
};
// stands: concrete tiers with coloured seats, a white arcade wall on top
const standsGeo = () => {
  const pts: THREE.Vector2[] = [V2(R_RING + 0.15, 0), V2(R_RING + 0.15, 1.5), V2(R_RING + 1.6, 1.5), V2(R_RING + 1.6, 2.4)];
  for (let i = 0; i < 16; i++) { const r = R_RING + 2.2 + i * 0.85, y = 2.4 + i * 0.5; pts.push(V2(r, y), V2(r + 0.85, y), V2(r + 0.85, y + 0.5)); }
  const last = pts[pts.length - 1]; pts.push(V2(last.x, last.y + 0.2), V2(last.x + 0.4, last.y + 0.2));
  const g = new THREE.LatheGeometry(pts, 200); return g;
};
function V2(x: number, y: number) { return new THREE.Vector2(x, y); }
const arcadeTex = () => {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const g = cv.getContext('2d')!;
  g.fillStyle = '#e9e0cf'; g.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 8; i++) { const x = i * 64 + 10; g.fillStyle = '#4a3a2c'; g.beginPath(); g.moveTo(x, 118); g.lineTo(x, 50); g.arc(x + 22, 50, 22, Math.PI, 0); g.lineTo(x + 44, 118); g.fill(); }
  g.fillStyle = '#a0281f'; g.fillRect(0, 0, 512, 10);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(24, 1); return tx;
};
// crowd: instanced seated figures on the tiers, random shirt colours (reds among them)
const CROWD_N = 2600;
const personGeo = () => {
  const body = new THREE.CapsuleGeometry(0.2, 0.42, 3, 8); body.translate(0, 0.42, 0);
  const head = new THREE.SphereGeometry(0.12, 10, 8); head.translate(0, 0.98, 0);
  return mergeGeos([body, head]);
};

// sky: blue gradient, warm near the sun
const skyMat = () => {
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: {...BVU, uSun: {value: V(0.35, 0.75, 0.55).normalize()}},
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `${BV_GLSL}
      uniform vec3 uSun; varying vec3 vD;
      void main(){ float y = max(vD.y, 0.0);
        vec3 c = mix(vec3(0.62, 0.72, 0.85), vec3(0.10, 0.25, 0.62), pow(y, 0.55));
        float s = max(dot(normalize(vD), uSun), 0.0); c += vec3(1.0, 0.85, 0.6) * (pow(s, 8.0) * 0.35 + pow(s, 400.0) * 4.0);
        c = bvApply(c); gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  return m;
};

// ---------------------------------------------------------------- cloth (cape and flags): a grid hung from its top edge
type Cloth = {mesh: THREE.Mesh; base: Float32Array; w: number; h: number};
const makeCloth = (w: number, h: number, color: string, key: string, nx = 22, ny = 18): Cloth => {
  const g = new THREE.PlaneGeometry(w, h, nx, ny); g.translate(w / 2, -h / 2, 0);   // top-left corner at the pole
  const m = std({color, roughness: 0.85, side: THREE.DoubleSide}, key);
  const mesh = new THREE.Mesh(g, m); mesh.castShadow = true;
  return {mesh, base: (g.attributes.position.array as Float32Array).slice(), w, h};
};
// wave: wind ripple; flick: a big travelling fold (0..1); sag: how much the free corner droops (capes hang, flags fly)
const driveCloth = (c: Cloth, t: number, o: {amp: number; speed: number; flick?: number; hang?: number; seed?: number}) => {
  const p = c.mesh.geometry.attributes.position as THREE.BufferAttribute; const a = p.array as Float32Array; const s = o.seed ?? 0;
  for (let i = 0; i < p.count; i++) {
    const x = c.base[i * 3], y = c.base[i * 3 + 1];
    const u = x / c.w, v = -y / c.h;      // u along from the pole, v down from the top
    const free = o.hang ? v : u;          // a cape hangs (free at the bottom), a flag flies (free away from the pole)
    let z = o.amp * free * Math.sin(u * 5.5 - t * o.speed + s) * (0.6 + 0.4 * Math.sin(v * 3 + t * o.speed * 0.6 + s));
    z += o.amp * 0.4 * free * Math.sin(v * 4.2 - t * o.speed * 0.8 + s * 2);
    z += 0.07 * Math.sin(u * Math.PI * 2 + 0.6) * v * (o.hang ? 1 : 0);
    if (o.flick) z += o.flick * free * 0.45 * Math.sin(u * 3.2 - o.flick * 7);
    a[i * 3 + 2] = z; a[i * 3] = x - Math.abs(z) * 0.15 * u; a[i * 3 + 1] = y + Math.abs(z) * 0.1 * v;
  }
  p.needsUpdate = true; c.mesh.geometry.computeVertexNormals();
};

// ---------------------------------------------------------------- people stand-ins (mannequins, illustration)
type Figure = {g: THREE.Group; lLeg: THREE.Object3D; rLeg: THREE.Object3D; lArm: THREE.Object3D; rArm: THREE.Object3D};
const makeFigure = (suit: string, shirt: string, hat: boolean, key: string): Figure => {
  const g = new THREE.Group();
  const skin = std({color: '#d9b89a', roughness: 0.7}, 'fig-skin');
  const sm1 = std({color: suit, roughness: 0.8}, key + '-suit'), sm2 = std({color: shirt, roughness: 0.8}, key + '-shirt');
  const limb = (len: number, r: number, m: THREE.Material) => { const p = new THREE.Group(); const c = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 10), m); c.position.y = -len / 2; c.castShadow = true; p.add(c); return p; };
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.42, 4, 12), sm2); torso.position.y = 1.22; torso.castShadow = true; g.add(torso);
  const hips = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.1, 4, 10), sm1); hips.position.y = 0.95; g.add(hips);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), skin); head.position.y = 1.66; head.castShadow = true; g.add(head);
  const lLeg = limb(0.82, 0.075, sm1), rLeg = limb(0.82, 0.075, sm1); lLeg.position.set(0, 0.95, 0.1); rLeg.position.set(0, 0.95, -0.1); g.add(lLeg, rLeg);
  const lArm = limb(0.6, 0.055, sm2), rArm = limb(0.6, 0.055, sm2); lArm.position.set(0, 1.45, 0.25); rArm.position.set(0, 1.45, -0.25); g.add(lArm, rArm);
  if (hat) {
    const hm = std({color: '#7a5a38', roughness: 0.9}, 'hat');
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 20), hm); brim.position.y = 1.76;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 16), hm); crown.position.y = 1.84; g.add(brim, crown);
  }
  return {g, lLeg, rLeg, lArm, rArm};
};
const runFigure = (f: Figure, phase: number, amt: number) => {
  const s = Math.sin(TAU * phase) * amt;
  f.lLeg.rotation.z = 0.7 * s; f.rLeg.rotation.z = -0.7 * s; f.lArm.rotation.z = -0.8 * s; f.rArm.rotation.z = 0.8 * s;
  f.g.children[0].rotation.z = -0.15 * amt;
};

// ---------------------------------------------------------------- utilities
function mergeGeos(gs: THREE.BufferGeometry[]) {
  let n = 0; gs.forEach((g) => { n += (g.index ? g.index.count : g.attributes.position.count); });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  gs.forEach((g) => { const ng = g.index ? g.toNonIndexed() : g; ng.computeVertexNormals(); const p = ng.attributes.position.array as Float32Array;
    pos.set(p, o * 3); nor.set(ng.attributes.normal.array as Float32Array, o * 3); o += p.length / 3; });
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return out;
}

// ---------------------------------------------------------------- set positions
const CAPE_P = V(0.12, 0, -2.4);          // the hook's cape stand (in front of the camera)
const PLATE_C = V(4, 0, 6);              // the dot plate on the sand
const FLAGS = [V(-3, 0, -14), V(-1, 0, -8), V(1, 0, -2)];   // red, blue, white along the run
const FLAG_COL = ['#c4161c', '#1f4fbf', '#f2f0ea'];
const ARM_C = V(0, 0, 0), ARM_R = 7.5; // the swinging-cape machine in the middle of the ring
// muleta-shaped test plate (red dots inside a semicircle on a stick)
const inCape = (x: number, z: number) => { const r = Math.hypot(x, z + 0.25); return (z > -0.25 && r < 1.05 && r > 0.0) || (Math.abs(z + 0.3) < 0.07 && Math.abs(x) < 1.25); };

// ---------------------------------------------------------------- the world
const useWorld = (A: Assets) => useMemo(() => {
  const root = new THREE.Group();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 48, 24), skyMat()); root.add(sky);
  const sand = new THREE.Mesh(sandGeo(), std({vertexColors: true, roughness: 0.97}, 'sand')); sand.receiveShadow = true; root.add(sand);
  // barrier
  const bt = barrierTex();
  const barrier = new THREE.Mesh(new THREE.CylinderGeometry(R_RING, R_RING, 1.5, 240, 1, true), std({map: bt, roughness: 0.7, side: THREE.DoubleSide}, 'barrier'));
  barrier.position.y = 0.75; barrier.receiveShadow = true; root.add(barrier);
  const rail = new THREE.Mesh(new THREE.TorusGeometry(R_RING + 0.05, 0.07, 8, 240), std({color: '#3a2416', roughness: 0.6}, 'rail')); rail.rotation.x = Math.PI / 2; rail.position.y = 1.5; root.add(rail);
  for (let i = 0; i < 4; i++) {
    const a = i * TAU / 4 + 0.4; const sh = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.7, 0.08), std({map: bt, roughness: 0.7}, 'barrier'));
    sh.position.set(Math.cos(a) * (R_RING - 0.9), 0.85, Math.sin(a) * (R_RING - 0.9)); sh.lookAt(0, 0.85, 0); sh.castShadow = true; root.add(sh);
  }
  const stands = new THREE.Mesh(standsGeo(), std({color: '#bdb3a4', roughness: 0.95, side: THREE.DoubleSide}, 'stands')); stands.receiveShadow = true; root.add(stands);
  const at = arcadeTex();
  const arcade = new THREE.Mesh(new THREE.CylinderGeometry(R_RING + 16.6, R_RING + 16.6, 5, 200, 1, true), std({map: at, roughness: 0.9, side: THREE.BackSide}, 'arcade'));
  arcade.position.y = 2.4 + 16 * 0.5 + 0.7 + 2.5; root.add(arcade);
  // crowd
  const crowd = new THREE.InstancedMesh(personGeo(), std({roughness: 0.85}, 'crowd'), CROWD_N);
  const shirts = ['#c41e24', '#e8e4dc', '#2a3f7a', '#e0b030', '#3b6b3a', '#d86a2a', '#f2f2f2', '#7a1e4a', '#1c1c1c', '#b8312f', '#5c86c4'];
  { const m4 = new THREE.Matrix4(); let n = 0;
    for (let i = 0; n < CROWD_N && i < CROWD_N * 3; i++) {
      const row = Math.floor(random(`cr${i}`) * 16), a = random(`ca${i}`) * TAU;
      if (random(`ce${i}`) < 0.25) continue;
      const r = R_RING + 2.2 + row * 0.85 + 0.45, y = 2.4 + row * 0.5;
      const s = 0.9 + random(`cs${i}`) * 0.2;
      m4.compose(V(Math.cos(a) * r, y, Math.sin(a) * r), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), -a - Math.PI / 2), V(s, s, s));
      crowd.setMatrixAt(n, m4); crowd.setColorAt(n, col(shirts[Math.floor(random(`cc${i}`) * shirts.length)])); n++;
    }
    crowd.count = n; }
  root.add(crowd);

  // the bull
  const bull = A.bull; root.add(bull);
  // the hook's cape on a wooden stand: a post and a stick, the cloth hangs from the stick
  const wood = std({color: '#5a3b22', roughness: 0.75}, 'wood');
  const mkStand = (h: number, stickL: number) => {
    const s = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, h, 10), wood); post.position.y = h / 2; post.castShadow = true;
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.06, 16), wood); foot.position.y = 0.03;
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, stickL, 8), wood); stick.rotation.z = Math.PI / 2; stick.position.set(stickL / 2, h, 0); stick.castShadow = true;
    s.add(post, foot, stick); return s;
  };
  const cape = makeCloth(1.0, 0.85, '#b8101c', 'cape');
  const capeStand = mkStand(1.45, 1.05); cape.mesh.position.set(0, 1.45, 0); capeStand.add(cape.mesh);
  capeStand.position.copy(CAPE_P); root.add(capeStand);
  const greenCape = makeCloth(1.0, 0.85, '#2f7d32', 'gcape');
  const greenStand = mkStand(1.45, 1.05); greenCape.mesh.position.set(0, 1.45, 0); greenStand.add(greenCape.mesh); greenStand.visible = false; root.add(greenStand);
  // flags on springy posts
  const flags = FLAGS.map((p, i) => {
    const pivot = new THREE.Group(); pivot.position.copy(p);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 2.2, 10), wood); post.position.y = 1.1; post.castShadow = true;
    const cl = makeCloth(1.1, 0.75, FLAG_COL[i], 'flag' + i, 20, 14); cl.mesh.position.set(0.02, 2.15, 0);
    pivot.add(post, cl.mesh);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.08, 16), wood); base.position.copy(p).setY(0.04);
    root.add(pivot, base); return {pivot, cl, base};
  });
  // the swinging-cape machine: a post with an arm; the cape hangs from the arm's tip
  const machine = new THREE.Group(); machine.position.copy(ARM_C);
  const mpost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.6, 14), std({color: '#4b4b4f', roughness: 0.5, metalness: 0.6}, 'steel')); mpost.position.y = 1.3; mpost.castShadow = true;
  const mbase = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.2, 20), std({color: '#3a3a3c', roughness: 0.6, metalness: 0.5}, 'steel2')); mbase.position.y = 0.1;
  const arm = new THREE.Group(); arm.position.y = 2.55;
  const beam = new THREE.Mesh(new THREE.BoxGeometry(ARM_R, 0.08, 0.08), std({color: '#58585c', roughness: 0.5, metalness: 0.6}, 'steel3')); beam.position.x = ARM_R / 2; beam.castShadow = true; arm.add(beam);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.0, 6), std({color: '#d8cdb0', roughness: 0.9}, 'rope')); rope.position.set(ARM_R, -0.5, 0); arm.add(rope);
  const swing = makeCloth(1.0, 0.85, '#b8101c', 'swing'); const swingHolder = new THREE.Group(); swingHolder.position.set(ARM_R - 0.5, -1.0, 0);
  const sstick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.05, 8), wood); sstick.rotation.z = Math.PI / 2; sstick.position.x = 0.5;
  swingHolder.add(sstick, swing.mesh); arm.add(swingHolder);
  machine.add(mpost, mbase, arm); root.add(machine);
  // people stand-ins
  const red = makeFigure('#b8101c', '#b8101c', false, 'redman');
  const cb1 = makeFigure('#2b3e63', '#c9a46a', true, 'cb1'), cb2 = makeFigure('#2b3e63', '#e6dccb', true, 'cb2');
  root.add(red.g, cb1.g, cb2.g);
  // gold motion trails behind the movers (the accent: movement)
  const trailMat = new THREE.MeshBasicMaterial({color: col(TL.GOLD), transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide});
  const mkTrail = () => { const m = new THREE.Mesh(new THREE.BufferGeometry(), trailMat); m.renderOrder = 2; root.add(m); return m; };
  const trails = [mkTrail(), mkTrail(), mkTrail()];
  // dot plate (instanced flat dots)
  const dots: {x: number; z: number; r: number; red: boolean; k: number}[] = [];
  for (let i = 0; dots.length < 1700 && i < 40000; i++) {
    const a = random(`pa${i}`) * TAU, d = Math.sqrt(random(`pd${i}`)) * 1.85, r = 0.025 + random(`pr${i}`) * 0.05;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (dots.some((o) => (o.x - x) ** 2 + (o.z - z) ** 2 < (o.r + r + 0.008) ** 2)) continue;
    dots.push({x, z, r, red: inCape(x, z), k: 0.75 + random(`pk${i}`) * 0.5});
  }
  const dotMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 0.02, 14), std({roughness: 0.6}, 'dots'), dots.length);
  { const m4 = new THREE.Matrix4();
    dots.forEach((d, i) => {
      m4.compose(V(PLATE_C.x + d.x, 0.03, PLATE_C.z + d.z), new THREE.Quaternion(), V(d.r, 1, d.r)); dotMesh.setMatrixAt(i, m4);
      // linear colours chosen so the dichromat's long-wave signal (0.293 r + 0.707 g) is the same for both: red and
      // green then collapse to one hue in bull vision (an isoluminant test plate)
      const c = d.red ? new THREE.Color().setRGB(0.55 * d.k, 0.045 * d.k, 0.03 * d.k, THREE.LinearSRGBColorSpace)
        : new THREE.Color().setRGB(0.07 * d.k, 0.2 * d.k, 0.04 * d.k, THREE.LinearSRGBColorSpace);
      dotMesh.setColorAt(i, c);
    }); }
  dotMesh.receiveShadow = true; root.add(dotMesh);
  const plateBack = new THREE.Mesh(new THREE.CircleGeometry(1.95, 64), std({color: '#efe8da', roughness: 0.9}, 'plateback')); plateBack.rotation.x = -Math.PI / 2; plateBack.position.copy(PLATE_C).setY(0.015); plateBack.receiveShadow = true; root.add(plateBack);
  // sand: kicked-up particles (hooves) and the impact burst
  const NP = 900; const pGeo = new THREE.BufferGeometry(); const pp = new Float32Array(NP * 3); pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const pMat = bv(new THREE.PointsMaterial({color: col('#d2a873'), size: 0.05, sizeAttenuation: true, transparent: true, opacity: 0.85, depthWrite: false}), 'sandpts');
  const puff = new THREE.Points(pGeo, pMat); puff.frustumCulled = false; root.add(puff);

  // cone cells (EYE shot) far below the ring, in their own little world
  const cells = new THREE.Group(); cells.position.set(0, -200, 0); root.add(cells);
  const cellGeo = new THREE.CapsuleGeometry(0.08, 0.45, 4, 10); cellGeo.translate(0, 0.3, 0);
  const cellMat = new THREE.MeshBasicMaterial({color: '#ffffff'});
  // per-instance emissive via instanceColor * uGlow (patched)
  const glowU = {uWave: {value: -10}};
  const cellBase: {c: THREE.Color; z: number}[] = [];
  if (false) cellMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, glowU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vCW;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvCW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uWave; varying vec3 vCW;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { float w = exp(-pow((vCW.z - uWave) * 0.45, 2.0)); totalEmissiveRadiance = vColor * (0.18 + 2.2 * w) * smoothstep(0.2, 0.9, vCW.y + 200.0); }`);
  };
  const CN = 2160; const cellMesh = new THREE.InstancedMesh(cellGeo, cellMat, CN);
  { const m4 = new THREE.Matrix4(); let n = 0;
    const HUM = ['#ff3030', '#30e040', '#3a6bff'], BULL = ['#3a6bff', '#d8e030'];
    for (let i = 0; i < 60 && n < CN; i++) for (let j = 0; j < 36 && n < CN; j++) {
      const x = (j - 17.75) * 0.26 + (i % 2) * 0.13 + (random(`cx${i}_${j}`) - 0.5) * 0.04, z = -i * 0.24 + 5;
      if (Math.abs(x) < 0.07) continue;
      const right = x > 0.0; const set = right ? BULL : HUM;
      // cattle: S cones are a small share; humans ~ L:M:S = 10:5:1 (rounded for the picture)
      const rr = random(`ct${i}_${j}`); const c = right ? (rr < 0.2 ? set[0] : set[1]) : (rr < 0.12 ? set[2] : rr < 0.55 ? set[1] : set[0]);
      const s = 0.85 + random(`cs${i}_${j}`) * 0.3;
      m4.compose(V(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((random(`cq${i}${j}`) - 0.5) * 0.12, 0, (random(`cr${i}${j}`) - 0.5) * 0.12)), V(s, s, s));
      cellMesh.setMatrixAt(n, m4); cellMesh.setColorAt(n, col(c)); cellBase.push({c: col(c), z}); n++;
    }
    cellMesh.count = n; }
  cells.add(cellMesh);
  const tissue = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({color: '#3a0d12', roughness: 0.9})); tissue.rotation.x = -Math.PI / 2; cells.add(tissue);
  const divide = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 40), new THREE.MeshBasicMaterial({color: '#ffffff'})); divide.rotation.x = -Math.PI / 2; divide.position.y = 0.01; cells.add(divide);

  // lights
  const hemi = new THREE.HemisphereLight(col('#a9c6ff'), col('#c49a6a'), 1.1); root.add(hemi);
  const sun = new THREE.DirectionalLight(col('#fff1dc'), 3.4); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; root.add(sun, sun.target);
  const cellLight = new THREE.PointLight(col('#ffd9c2'), 30, 30, 1.5); cellLight.position.set(0, -194, 4); root.add(cellLight);
  return {root, cellMesh, cellBase, sky, bull, capeStand, cape, greenStand, greenCape, flags, machine, arm, swing, swingHolder, red, cb1, cb2, trails, dotMesh, plateBack, puff, pp, cells, glowU, sun, hemi, cellLight, crowd};
}, [A]);

// ---------------------------------------------------------------- per-shot staging
type Cam = {p: THREE.Vector3; l: THREE.Vector3; fov: number};
const ease = (k: number) => k * k * (3 - 2 * k);
// a point on the run path: piecewise linear in time between keys, smoothed
const along = (t: number, keys: [number, THREE.Vector3][]) => {
  if (t <= keys[0][0]) return keys[0][1].clone();
  for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t <= t1) return a.clone().lerp(b, (t - t0) / (t1 - t0)); }
  return keys[keys.length - 1][1].clone();
};

export const Scene: React.FC<{t: number; assets: Assets}> = ({t, assets}) => {
  const W = useWorld(assets);
  const {camera, gl, scene, size} = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const shot = TL.shotAt(t);
  const t0 = TL.shotStart(shot);
  const lt = t - t0;
  const db = gl.getDrawingBufferSize(new THREE.Vector2()); BVU.uRes.value.copy(db); void size;
  BVU.uSplit.value = TL.split(t); BVU.uBvOn.value = TL.filterOn(t) ? 1 : 0;
  scene.background = col('#9db6d8'); scene.fog = null;

  // defaults
  W.greenStand.visible = false; W.capeStand.visible = true; W.flags.forEach((f) => { f.pivot.visible = false; f.base.visible = false; });
  W.machine.visible = false; [W.red, W.cb1, W.cb2].forEach((f) => { f.g.visible = false; }); W.trails.forEach((m) => { m.visible = false; });
  W.dotMesh.visible = false; W.plateBack.visible = false; W.puff.visible = false; W.bull.visible = true;
  const pose: Pose = {phase: 0, amt: 0, headDown: 0.15, paw: 0, t};
  let c: Cam = {p: V(0, 1.6, 6), l: V(0, 1, 0), fov: 40};
  let bullP = V(0, 0, -8), bullYaw = Math.PI / 2; // yaw: heading angle, 0 = +x, PI/2 = toward -z? (heading vector (cos, 0, -sin))
  const heading = (yaw: number) => V(Math.cos(yaw), 0, -Math.sin(yaw));
  let shadowC = V(0, 0, 0), shadowR = 12;
  const puffs: {p: THREE.Vector3; t0: number; n: number; v: number}[] = [];

  driveCloth(W.cape, t, {amp: 0.13, speed: 2.4, hang: 1, seed: 1});

  if (shot === 'hook') {
    // the bull 8 m away faces the camera at a slant; the cape fills the right foreground; slow push in
    bullP = V(-1.3, 0, -10.5); bullYaw = -Math.PI / 2 + 0.75; W.capeStand.rotation.y = 0.55;
    pose.paw = 1; pose.headDown = 0.35 + 0.1 * Math.sin(t * 1.3); pose.look = 0.15;
    const k = ease(Math.min(1, lt / 3.4));
    c = {p: V(0, lerp(1.3, 1.2, k), lerp(2.6, 1.9, k)), l: V(0, 0.8, -6), fov: 40};
    shadowC = V(0, 0, -5); shadowR = 9;
    for (let i = 0; i < 8; i++) { const tp = Math.floor(t * 5.2 / TAU + 0.25) - i; puffs.push({p: bullP.clone().add(V(-0.5, 0, 0.1)), t0: (tp + 0.25) * TAU / 5.2, n: 30, v: 0.8}); }
  } else if (shot === 'eye') {
    W.bull.visible = false; W.capeStand.visible = false;
    scene.background = col('#1c0507');
    const k = ease(Math.min(1, lt / (TL.CUT.plate - TL.CUT.eye)));
    c = {p: V(0, -200 + lerp(5.2, 3.9, k), lerp(6.4, 5.2, k)), l: V(0, -200, lerp(-0.5, -1.0, k)), fov: 46};
    const wave = lerp(9, -16, (lt % 2.6) / 2.6); const tmpc = new THREE.Color();
    W.cellBase.forEach((b, i) => { const w = Math.exp(-(((b.z - wave) * 0.5) ** 2)); W.cellMesh.setColorAt(i, tmpc.copy(b.c).multiplyScalar(0.22 + 1.6 * w)); });
    W.cellMesh.instanceColor!.needsUpdate = true;
  } else if (shot === 'plate') {
    // looking down on the test plate; the bull stands at its edge, head down
    W.capeStand.visible = false; W.dotMesh.visible = true; W.plateBack.visible = true;
    bullP = PLATE_C.clone().add(V(-0.6, 0, -3.2)); bullYaw = -Math.PI / 2 + 0.25; pose.headDown = 0.75; pose.look = -0.1;
    const k = ease(Math.min(1, lt / 4));
    c = {p: PLATE_C.clone().add(V(lerp(0.2, 0.0, k), lerp(5.6, 4.9, k), lerp(2.6, 2.1, k))), l: PLATE_C.clone().add(V(0, 0, -0.35)), fov: 42};
    shadowC = PLATE_C.clone(); shadowR = 6;
  } else if (shot === 'cape') {
    // close on the cape, the bull soft behind it; the camera arcs slowly
    bullP = V(-0.2, 0, -8.5); bullYaw = -Math.PI / 2 + 0.5; pose.headDown = 0.45; pose.paw = 0.6; W.capeStand.rotation.y = 0.35;
    const k = ease(Math.min(1, lt / 4));
    const a = lerp(-0.35, 0.15, k);
    c = {p: CAPE_P.clone().add(V(0.3 + Math.sin(a) * 3.2, 1.3, Math.cos(a) * 3.2)), l: CAPE_P.clone().add(V(0.2, 0.9, -2.5)), fov: 38};
    shadowC = CAPE_P.clone(); shadowR = 6;
    driveCloth(W.cape, t, {amp: 0.16, speed: 3.2, hang: 1, seed: 1});
  } else if (shot === 'charge') {
    // low behind the cape: the cape flicks, the bull drops its head and charges at it
    const fl = Math.max(0, t - TL.FLICK); const flick = fl > 0 ? Math.exp(-fl * 2.5) * Math.sin(Math.min(fl * 9, Math.PI)) : 0;
    driveCloth(W.cape, t, {amp: 0.07, speed: 2.6, hang: 1, seed: 1, flick: flick * 1.6});
    W.capeStand.rotation.y = 0.5 * flick;
    const run = Math.max(0, t - TL.LAUNCH);
    const v = 7.5, acc = 7.5;                     // m/s top speed, reached in ~1 s
    const dist = run < v / acc ? 0.5 * acc * run * run : (v * v) / (2 * acc) + v * (run - v / acc);
    const start = V(-0.8, 0, -14), dir = CAPE_P.clone().sub(start).setY(0).normalize();
    bullP = start.clone().addScaledVector(dir, Math.min(dist, 11.2)); bullYaw = Math.atan2(-dir.z, dir.x);
    pose.amt = sm(TL.LAUNCH - 0.05, TL.LAUNCH + 0.5, t); pose.phase = dist / 3.2; pose.headDown = 0.4 + 0.6 * sm(TL.FLICK, TL.LAUNCH + 0.2, t);
    c = {p: CAPE_P.clone().add(V(1.6, 0.6, 2.6)), l: bullP.clone().add(V(0, 0.9, 0)).lerp(CAPE_P.clone().add(V(0.5, 0.9, 0)), 0.3), fov: 40};
    shadowC = bullP.clone().lerp(CAPE_P, 0.5); shadowR = 9;
    for (let i = 0; i < 14; i++) { const st = TL.LAUNCH + i * (1 / (v / 3.2)); if (st < t) puffs.push({p: start.clone().addScaledVector(dir, Math.min(11.2, Math.max(0, (st - TL.LAUNCH)) * v * 0.85)), t0: st, n: 40, v: 1.2}); }
  } else if (shot === 'flags') {
    W.capeStand.visible = false;
    W.flags.forEach((f, i) => {
      f.pivot.visible = true; f.base.visible = true;
      const dt = t - TL.FLAG_HIT[i];
      const knock = dt > 0 ? Math.exp(-dt * 2.2) * Math.sin(dt * 9) * 0.9 + (dt < 0.12 ? dt / 0.12 * 0.9 : 0) * 0 : 0;
      f.pivot.rotation.x = -knock; f.pivot.rotation.z = 0.3 * knock;
      driveCloth(f.cl, t, {amp: 0.08 + (dt > 0 ? 0.25 * Math.exp(-dt * 2) : 0), speed: 4 + i * 0.3, seed: i * 2.1});
    });
    // the run: from far down the line, through each flag on its word, out toward the camera
    const keys: [number, THREE.Vector3][] = [[TL.CUT.flags, V(-6, 0, -23)], ...TL.FLAG_HIT.map((h, i): [number, THREE.Vector3] => [h, FLAGS[i].clone().add(V(-0.25, 0, -1.3))]), [TL.CUT.motion + 0.5, V(2.2, 0, 4.5)]];
    bullP = along(t, keys); const ahead = along(t + 0.1, keys); const d = ahead.clone().sub(bullP); bullYaw = Math.atan2(-d.z, d.x);
    const spd = d.length() / 0.1; pose.amt = Math.min(1, spd / 5); pose.headDown = 0.8;
    pose.phase = (t - TL.CUT.flags) * 2.4;
    const k = ease(sm(TL.CUT.flags, TL.CUT.motion, t));
    c = {p: V(lerp(3.4, 2.8, k), lerp(4.6, 4.2, k), lerp(8.6, 7.6, k)), l: V(-2, 0.6, -12).lerp(bullP, 0.25), fov: 40};
    shadowC = V(-1, 0, -8); shadowR = 11;
    for (let i = 0; i < 20; i++) { const st = TL.CUT.flags + i * 0.42; if (st < t) puffs.push({p: along(st, keys), t0: st, n: 30, v: 1.0}); }
  } else if (shot === 'motion') {
    // from above: a still figure in red; two cowboys move; the bull runs past the red figure after the movers
    W.capeStand.visible = false;
    const RP = V(0, 0, 0);
    W.red.g.visible = true; W.red.g.position.copy(RP); W.red.g.rotation.y = 0.6; runFigure(W.red, 0, 0);
    const cbPath = (i: number, tt: number) => { const a0 = i ? 2.4 : -0.6, dir = i ? 1 : -1; const a = a0 + dir * (tt - TL.CUT.motion) * 0.9; const r = i ? 4.0 : 3.2; return V(Math.cos(a) * r, 0, Math.sin(a) * r); };
    [W.cb1, W.cb2].forEach((f, i) => {
      f.g.visible = true; const p = cbPath(i, t), q = cbPath(i, t + 0.05); f.g.position.copy(p);
      const d = q.sub(p); f.g.rotation.y = Math.atan2(-d.z, d.x); runFigure(f, t * 2.6 + i * 0.3, 1);
      f.g.position.y = Math.abs(Math.sin(TAU * (t * 2.6 + i * 0.3))) * 0.06;
      // trail
      const pts: number[] = []; const N = 30;
      for (let j = 0; j < N; j++) { const tt = t - j * 0.04; if (tt < TL.CUT.motion) break; const a = cbPath(i, tt), b = cbPath(i, tt + 0.04); const n2 = V(-(b.z - a.z), 0, b.x - a.x).normalize().multiplyScalar(0.16 * (1 - j / N));
        pts.push(a.x + n2.x, 0.05, a.z + n2.z, a.x - n2.x, 0.05, a.z - n2.z); }
      const tr = W.trails[i]; tr.visible = pts.length > 6;
      const idx: number[] = []; for (let j = 0; j + 1 < pts.length / 6; j++) { const a = j * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      tr.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); tr.geometry.setIndex(idx);
    });
    // the bull: comes from the far side, passes ~1.6 m from the red figure, swings after cowboy 1
    const keys: [number, THREE.Vector3][] = [[TL.CUT.motion, V(-8, 0, -6)], [TL.T.ignored, V(-1.4, 0, -1.0)]];
    const tgt = (tt: number) => cbPath(0, tt - 0.6);
    const pAt = (tt: number) => (tt <= TL.T.ignored ? along(tt, keys) : V(-1.4, 0, -1.0).lerp(tgt(tt), sm(TL.T.ignored, TL.CUT.impact + 0.8, tt)));
    bullP = pAt(t); const d = pAt(t + 0.08).sub(bullP); bullYaw = Math.atan2(-d.z, d.x);
    pose.amt = 1; pose.phase = (t - TL.CUT.motion) * 2.3; pose.headDown = 0.7;
    const k = ease(sm(TL.CUT.motion, TL.CUT.impact, t));
    c = {p: V(lerp(3, 2, k), lerp(12.5, 11.5, k), lerp(9.5, 8.5, k)), l: V(-0.4, 0, -0.4), fov: 44};
    shadowC = V(-1, 0, -1); shadowR = 10;
    for (let i = 0; i < 20; i++) { const st = TL.CUT.motion + i * 0.4; if (st < t) puffs.push({p: pAt(st), t0: st, n: 30, v: 1.0}); }
  } else if (shot === 'impact' || shot === 'end') {
    // the machine swings the cape round the ring; the bull chases it
    W.capeStand.visible = false; W.machine.visible = true;
    const ts = TL.slowmo(t);
    const w = 0.62;                               // rad/s: ~4.6 m/s at the cape
    const a = (shot === 'impact' ? 2.2 : 0.4) + w * (ts - TL.CUT.impact);
    W.arm.rotation.y = a;
    const tip = V(Math.cos(a) * ARM_R, 0, -Math.sin(a) * ARM_R);
    driveCloth(W.swing, ts, {amp: 0.12, speed: 4, hang: 1, seed: 3});
    const hitK = shot === 'impact' ? sm(TL.HIT - 0.05, TL.HIT + 0.3, ts) : 0;
    W.swingHolder.rotation.x = -0.4 * Math.sin(ts * 2) * 0.2 - 1.2 * hitK * Math.exp(-(ts - TL.HIT) * 1.5);
    const lag = shot === 'impact' ? lerp(0.75, 0.0, sm(TL.CUT.impact, TL.HIT, ts)) : 0.55;
    const ba = a - lag; const R = ARM_R - 0.2;
    bullP = V(Math.cos(ba) * R, 0, -Math.sin(ba) * R); bullYaw = ba + Math.PI / 2;
    pose.amt = 1; pose.phase = ts * 2.2; pose.headDown = 0.85; pose.t = ts;
    if (shot === 'impact') {
      // ground-level, ahead of the cape on the circle: the cape sweeps in, the bull catches it on 'movement'
      const ca = 2.2 + w * (TL.HIT - TL.CUT.impact) + 0.42;
      const cp = V(Math.cos(ca) * (ARM_R + 2.6), 0, -Math.sin(ca) * (ARM_R + 2.6));
      c = {p: cp.clone().setY(0.7), l: V(Math.cos(ca - 0.45) * ARM_R, 1.0, -Math.sin(ca - 0.45) * ARM_R), fov: 46};
      shadowC = tip.clone(); shadowR = 7;
      if (ts > TL.HIT) puffs.push({p: tip.clone().add(V(0, 0.2, 0)), t0: TL.HIT, n: 400, v: 3.2});
    } else {
      const k = ease(sm(TL.CUT.end, TL.DUR_S, t));
      const rad = V(Math.cos(ba), 0, -Math.sin(ba)), tan = V(-Math.sin(ba), 0, -Math.cos(ba));
      c = {p: bullP.clone().addScaledVector(tan, -lerp(4.5, 6, k)).addScaledVector(rad, lerp(5.5, 8, k)).setY(lerp(2.2, 9, k)), l: bullP.clone().lerp(tip, 0.45).add(V(0, lerp(0.9, 0, k), 0)), fov: lerp(42, 50, k)};
      shadowC = V(0, 0, 0); shadowR = 11;
    }
    for (let i = 0; i < 16; i++) { const st = ts - i * 0.38; puffs.push({p: V(Math.cos(a - lag - (ts - st) * w) * R, 0, -Math.sin(a - lag - (ts - st) * w) * R), t0: st, n: 24, v: 0.9}); }
  }

  // bull placement and pose
  W.bull.position.copy(bullP);
  W.bull.rotation.y = bullYaw;
  const bob = pose.amt * 0.07 * Math.abs(Math.sin(TAU * pose.phase));
  W.bull.position.y = bob;
  poseBull(assets, pose);

  // sand particles: each puff throws n grains up and out, they fall back
  W.puff.visible = puffs.length > 0; (W.puff.material as THREE.PointsMaterial).size = shot === 'impact' ? 0.022 : 0.05;
  { let n = 0; const P = W.pp; const tp = shot === 'impact' ? TL.slowmo(t) : t;
    for (let j = 0; j < puffs.length && n < 900; j++) {
      const f = puffs[j]; const e = tp - f.t0; if (e < 0 || e > 1.6) continue;
      for (let i = 0; i < f.n && n < 900; i++, n++) {
        const a = random(`pa${j}_${i}_${Math.round(f.t0 * 100)}`) * TAU, v = f.v * (0.3 + random(`pv${j}_${i}`) * 0.9), up = f.v * (0.6 + random(`pu${j}_${i}`) * 1.4);
        const x = f.p.x + Math.cos(a) * v * e, z = f.p.z + Math.sin(a) * v * e, y = Math.max(0.02, f.p.y + up * e - 4.9 * e * e);
        P[n * 3] = x; P[n * 3 + 1] = y; P[n * 3 + 2] = z;
      }
    }
    for (; n < 900; n++) { P[n * 3] = 0; P[n * 3 + 1] = -500; P[n * 3 + 2] = 0; }
    (W.puff.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true; }

  // sun: shadow box over the action
  const sunDir = V(0.35, 0.75, 0.55).normalize();
  W.sun.position.copy(shadowC).addScaledVector(sunDir, 30); W.sun.target.position.copy(shadowC);
  const sc = W.sun.shadow.camera as THREE.OrthographicCamera; sc.left = -shadowR; sc.right = shadowR; sc.top = shadowR; sc.bottom = -shadowR; sc.near = 1; sc.far = 70; sc.updateProjectionMatrix();
  W.sun.visible = shot !== 'eye'; W.hemi.visible = shot !== 'eye'; W.cellLight.visible = shot === 'eye';

  cam.fov = c.fov; cam.near = 0.05; cam.far = 900; cam.position.copy(c.p); cam.lookAt(c.l); cam.updateProjectionMatrix();
  return <primitive object={W.root} />;
};
