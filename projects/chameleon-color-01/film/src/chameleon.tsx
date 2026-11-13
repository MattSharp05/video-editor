// An original chameleon (a generic panther-type chameleon, built from the real animal's proportions: body deep and
// flattened side to side, a low casque, turret eyes, a crest of small spikes, a prehensile tail curled in a spiral,
// feet split into two grasping bundles). Real scale in metres: ~0.29 m nose to hip, ~0.45 m with the tail.
// One lofted body surface (body + head), a tapering tail tube that starts INSIDE the body, four legs whose roots
// are sunk in the body, two toe bundles per foot wrapped around the branch, turret eyes.
// The skin is one shader: calm (green with yellow bars), hot (red-orange with yellow bars and blue spots) and dark
// (brown-black, for cold) palettes, a pale lip stripe, granular scales with bump, and spots.
// Local frame: +x toward the snout, +y up, +z the chameleon's left side. The branch runs along x under the feet,
// its centre at (x, BRANCH_Y, 0), radius BRANCH_R.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {N3} from './glsl';
import {BUMP} from './kit/water/glsl';

export const BRANCH_Y = -0.085, BRANCH_R = 0.02;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// monotone cubic through (xs, ys)
const pchip = (xs: number[], ys: number[], t: number) => {
  const n = xs.length;
  if (t <= xs[0]) return ys[0];
  if (t >= xs[n - 1]) return ys[n - 1];
  let i = 0;
  while (t > xs[i + 1]) i++;
  const h = (k: number) => xs[k + 1] - xs[k], d = (k: number) => (ys[k + 1] - ys[k]) / h(k);
  const m = (k: number) => {
    if (k === 0 || k === n - 1) return 0;
    const a = d(k - 1), b = d(k);
    if (a * b <= 0) return 0;
    const w1 = 2 * h(k) + h(k - 1), w2 = h(k) + 2 * h(k - 1);
    return (w1 + w2) / (w1 / a + w2 / b);
  };
  const u = (t - xs[i]) / h(i), u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h(i) * m(i) + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h(i) * m(i + 1);
};

// side profile (top, bottom) and half-width along x
const PX = [-0.03, 0.02, 0.08, 0.15, 0.188, 0.205, 0.226, 0.25, 0.268, 0.278, 0.283];
const TOP = [0.012, 0.04, 0.054, 0.046, 0.03, 0.047, 0.04, 0.027, 0.015, 0.007, 0.0];
const BOT = [-0.012, -0.03, -0.056, -0.046, -0.028, -0.03, -0.026, -0.02, -0.012, -0.006, -0.002];
const WID = [0.011, 0.021, 0.027, 0.025, 0.019, 0.023, 0.022, 0.017, 0.011, 0.006, 0.001];
export const top = (x: number) => pchip(PX, TOP, x);
export const bot = (x: number) => pchip(PX, BOT, x);
export const wid = (x: number) => pchip(PX, WID, x);

const withRest = (g: THREE.BufferGeometry) => {
  g.setAttribute('aRest', new THREE.Float32BufferAttribute((g.attributes.position.array as Float32Array).slice(), 3));
  g.computeVertexNormals();
  return g;
};

const bodyGeometry = () => {
  const N = 150, M = 64, pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    const x = PX[0] + (PX[PX.length - 1] - PX[0]) * (i / N);
    const tp = top(x), bt = bot(x), w = wid(x), mid = (tp + bt) / 2;
    // crest of small spikes along the back (body only)
    const crestOn = Math.max(0, Math.min(1, (x + 0.01) / 0.03)) * Math.max(0, Math.min(1, (0.185 - x) / 0.02));
    const tooth = Math.pow(Math.max(0, Math.cos((x * 2 * Math.PI) / 0.011)), 3);
    for (let j = 0; j <= M; j++) {
      const a = (j / M) * Math.PI * 2, s = Math.sin(a), c = Math.cos(a);
      const half = s > 0 ? tp - mid : mid - bt;
      let y = mid + half * s;
      if (s > 0) y += Math.pow(s, 14) * 0.0055 * tooth * crestOn;   // the crest
      const z = w * c * (s > 0 ? 1 - 0.38 * s * s : 1 - 0.15 * s * s); // keeled back, rounder belly
      pos.push(x, y, z);
    }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = i * (M + 1) + j, b = a + M + 1;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return withRest(g);
};

// a tube along points with radius r(s), s in 0..1; optional vertical stretch of the section
export const tube = (pts: THREE.Vector3[], r: (s: number) => number, o: {seg?: number; rad?: number; tall?: number} = {}) => {
  const seg = o.seg ?? 80, rad = o.rad ?? 20, tall = o.tall ?? 1;
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const fr = curve.computeFrenetFrames(seg, false);
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const s = i / seg, p = curve.getPointAt(s), R = r(s);
    const N = fr.normals[i], B = fr.binormals[i];
    for (let j = 0; j <= rad; j++) {
      const a = (j / rad) * Math.PI * 2;
      const q = p.clone().addScaledVector(N, Math.cos(a) * R).addScaledVector(B, Math.sin(a) * R * tall);
      pos.push(q.x, q.y, q.z);
    }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) {
    const a = i * (rad + 1) + j, b = a + rad + 1;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return withRest(g);
};

const tailGeometry = () => {
  const pts = [V(0.0, 0.0, 0.0), V(-0.035, -0.004, 0.012), V(-0.065, -0.012, 0.03)];
  const C = V(-0.085, -0.06, 0.036), th0 = Math.PI / 2;
  for (let k = 1; k <= 40; k++) {
    const th = th0 + (k / 40) * 2.3 * Math.PI, r = 0.045 * Math.exp(-0.28 * (th - th0));
    pts.push(V(C.x + r * Math.cos(th) * 1.0, C.y + r * Math.sin(th), C.z));
  }
  pts[3] = V(-0.085, -0.015, 0.036).lerp(pts[3], 0.5);
  return tube(pts, (s) => 0.013 * (1 - s) + 0.0016 * s - 0.003 * Math.sin(Math.PI * s) * 0, {seg: 160, rad: 22, tall: 1.15});
};

// legs: [root (inside body), elbow, wrist]; toes: two bundles wrapped round the branch either side
const LEGS: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
  [V(0.165, -0.012, 0.012), V(0.188, -0.04, 0.036), V(0.192, -0.06, 0.006)],
  [V(0.165, -0.012, -0.012), V(0.178, -0.04, -0.036), V(0.176, -0.06, -0.006)],
  [V(0.03, -0.012, 0.012), V(0.008, -0.042, 0.036), V(0.024, -0.06, 0.006)],
  [V(0.03, -0.012, -0.012), V(0.016, -0.042, -0.036), V(0.04, -0.06, -0.006)],
];
// A walk along the branch: body travel s (metres, + = toward the snout). Diagonal pairs step together; each foot
// stays planted while the body moves, then lifts and swings forward over the last 40 % of its cycle.
const STRIDE = 0.032, PHASE = [0, 0.5, 0.5, 0];
const ease = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };
export const footAt = (k: number, travel: number) => {
  const c = travel / STRIDE + PHASE[k], i = Math.floor(c), f = c - i, sw = ease((f - 0.6) / 0.4);
  const dx = STRIDE * (i + sw) - travel - STRIDE * (PHASE[k] + 0.3);
  return {dx, lift: Math.sin(Math.PI * Math.min(1, Math.max(0, (f - 0.6) / 0.4))) * 0.012};
};
const legGeometries = (travel = 0) => {
  const out: THREE.BufferGeometry[] = [];
  const Rb = BRANCH_R + 0.0035;
  LEGS.forEach(([a, b, c0], k) => {
    const {dx, lift} = travel === 0 ? {dx: 0, lift: 0} : footAt(k, travel);
    const c = c0.clone().add(V(dx, lift, 0));
    const el = b.clone().add(V(dx * 0.5, lift * 0.6, 0));
    out.push(tube([a, el, c], (s) => 0.0075 - 0.0028 * s, {seg: 30, rad: 14}));
    for (const side of [1, -1]) {
      for (const ddx of [-0.003, 0.003]) {
        const pts: THREE.Vector3[] = [c.clone()];
        for (let j = 0; j <= 6; j++) {
          const phi = Math.PI / 2 - side * (0.25 + (j / 6) * 1.15 * (1 - 0.6 * lift / 0.012));
          pts.push(V(c.x + ddx + side * 0.0005 * j, BRANCH_Y + Rb * Math.sin(phi) + lift, Rb * Math.cos(phi)));
        }
        out.push(tube(pts, (s) => 0.0034 - 0.0016 * s, {seg: 24, rad: 10}));
      }
    }
  });
  return out;
};

// eye turrets: skin-covered domes with a small dark pupil looking out and forward
export const EYES = [1, -1].map((side) => {
  const x = 0.226, z = side * wid(0.226) * 0.72, y = 0.011;
  const dir = V(0.55, 0.18, side).normalize();
  return {c: V(x, y, z), dir, r: 0.0165};
});

export type SkinState = {hot: number; dark: number};
export const skinUniforms = () => ({uHot: {value: 0}, uDark: {value: 0}});
const PARS = /* glsl */`uniform float uHot, uDark; varying vec3 vRest;\n${N3}\n${BUMP}`;
export const skinMaterial = (U: ReturnType<typeof skinUniforms>) => {
  const m = new THREE.MeshStandardMaterial({roughness: 0.48, metalness: 0, side: THREE.DoubleSide});
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\nattribute vec3 aRest;\nvarying vec3 vRest;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\nvRest = aRest;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${PARS}\nfloat gH;`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', /* glsl */`
        vec3 R = vRest; float x = R.x;
        // palettes (linear): base, bars, lip stripe, spots
        vec3 cB = vec3(0.07, 0.36, 0.05), cR = vec3(0.2, 0.5, 0.06), cS = vec3(0.45, 0.62, 0.3), cP = vec3(0.02, 0.13, 0.03);
        vec3 hB = vec3(0.78, 0.13, 0.04), hR = vec3(0.95, 0.62, 0.04), hS = vec3(0.95, 0.86, 0.5), hP = vec3(0.04, 0.26, 0.78);
        vec3 dB = vec3(0.045, 0.035, 0.026), dR = vec3(0.09, 0.07, 0.045), dS = vec3(0.2, 0.17, 0.12), dP = vec3(0.02);
        float dn = clamp((0.3 - x) / 0.45, 0.0, 1.0) + 0.06 * fbm3(R * 40.0);   // 0 at the nose, ~1 at the tail tip
        float kH = smoothstep(dn - 0.18, dn + 0.04, uHot * 1.25 - 0.05), kD = smoothstep(dn - 0.18, dn + 0.04, uDark * 1.25 - 0.05);
        kH = min(kH, uHot * 1.5); kD = min(kD, uDark * 1.5);
        vec3 pB = mix(mix(cB, hB, kH), dB, kD), pR = mix(mix(cR, hR, kH), dR, kD);
        vec3 pS = mix(mix(cS, hS, kH), dS, kD), pP = mix(mix(cP, hP, kH), dP, kD);
        float wob = fbm3(R * 60.0);
        float bars = smoothstep(0.5, 0.72, 0.5 + 0.5 * sin(x * 6.2832 / 0.042 + 1.2 * wob)) * step(-0.01, x) * step(x, 0.19);
        bars *= smoothstep(-0.035, 0.0, R.y) * 0.8;
        vec3 col = mix(pB, pR, bars);
        // pale lip / flank stripe
        float sy = R.y + 0.021 - 0.003 * sin(x * 90.0) + (x > 0.2 ? (x - 0.2) * 0.12 : 0.0);
        float stripe = (1.0 - smoothstep(0.003, 0.007, abs(sy))) * smoothstep(0.0, 0.03, x) * (1.0 - smoothstep(0.24, 0.27, x)) * 0.75;
        col = mix(col, pS, stripe);
        // spots
        vec2 w = worley(R * 150.0);
        col = mix(col, pP, step(0.86, w.y) * smoothstep(0.33, 0.2, w.x) * (1.0 - stripe));
        // eye-turret rings: concentric ridges of scales around each eye
        { vec3 E = vec3(0.226, 0.011, 0.0); vec3 q = R - E; float side = sign(q.z); vec3 ax = normalize(vec3(0.55, 0.18, side));
          vec3 c = E + vec3(0.0, 0.0, side * 0.0119); float dd = length(R - c);
          if (dd < 0.0175) { float ang = acos(clamp(dot(normalize(R - c), ax), -1.0, 1.0)); col *= 0.82 + 0.25 * smoothstep(0.3, 0.7, abs(sin(ang * 22.0))); } }
        // granular scales: bright centres, dark seams (fade out where they'd alias)
        vec2 g = worley(R * 1050.0);
        float far = clamp(length(fwidth(R * 1050.0)) * 1.3 - 0.45, 0.0, 1.0);
        float gran = mix(mix(0.62, 1.08, smoothstep(0.78, 0.18, g.x)), 0.9, far);
        col *= gran * (0.9 + 0.2 * vn3(R * 300.0));
        gH = (1.0 - smoothstep(0.0, 0.75, g.x)) * (1.0 - far);
        vec4 diffuseColor = vec4(col, opacity);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\nnormal = wbump(-vViewPosition, normal, gH * 0.0006, 1.0);`);
  };
  m.customProgramCacheKey = () => 'cham-skin';
  return m;
};

export type ChamPose = {travel?: number; puff?: number; eye?: [number, number][]; gape?: number};
export const Chameleon: React.FC<{skin: SkinState; pose?: ChamPose; position?: THREE.Vector3; yaw?: number}> = ({skin, pose = {}, position, yaw = 0}) => {
  const travel = pose.travel ?? 0, puff = pose.puff ?? 0;
  const parts = useMemo(() => ({body: bodyGeometry(), tail: tailGeometry(), eyes: EYES.map((e) => {
    const g = new THREE.SphereGeometry(e.r, 40, 28);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), e.dir));
    const r = withRest(g), a = r.attributes.aRest as THREE.BufferAttribute;
    for (let i = 0; i < a.count; i++) a.setXYZ(i, a.getX(i) + e.c.x, a.getY(i) + e.c.y, a.getZ(i) + e.c.z);
    return r;
  })}), []);
  const legs = useMemo(() => legGeometries(Math.round(travel * 4000) / 4000), [travel]);
  const U = useMemo(() => skinUniforms(), []);
  const mat = useMemo(() => skinMaterial(U), [U]);
  U.uHot.value = skin.hot; U.uDark.value = skin.dark;
  const eyeMats = useMemo(() => ({
    iris: new THREE.MeshStandardMaterial({color: '#8a6a1c', roughness: 0.2}),
    pupil: new THREE.MeshStandardMaterial({color: '#050505', roughness: 0.05, metalness: 0.1}),
  }), []);
  // body sway with the gait (the rocking walk), and the threat display: flattened sideways, taller
  const sway = travel === 0 ? 0 : Math.sin((travel / STRIDE) * Math.PI * 2) * 0.004;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <group position={[0.1, 0.006 * puff, sway]} scale={[1, 1 + 0.12 * puff, 1 - 0.2 * puff]}>
        <group position={[-0.1, 0, 0]}>
          <mesh geometry={parts.body} material={mat} castShadow receiveShadow />
          {parts.eyes.map((g, i) => {
            const e = EYES[i], [yawE, pitch] = pose.eye?.[i] ?? [0, 0];
            const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yawE * (i === 0 ? 1 : -1), 0));
            const qd = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), e.dir);
            return (
              <group key={i} position={e.c} quaternion={q}>
                <mesh geometry={g} material={mat} castShadow />
                <group quaternion={qd}>
                  <mesh material={eyeMats.iris} position={[0, 0, e.r * 0.9]} scale={[1, 1, 0.45]}><sphereGeometry args={[e.r * 0.24, 24, 16]} /></mesh>
                  <mesh material={eyeMats.pupil} position={[0, 0, e.r * 0.97]} scale={[1, 1, 0.5]}><sphereGeometry args={[e.r * 0.12, 20, 14]} /></mesh>
                </group>
              </group>
            );
          })}
        </group>
      </group>
      <mesh geometry={parts.tail} material={mat} castShadow receiveShadow />
      {legs.map((g, i) => <mesh key={i} geometry={g} material={mat} castShadow receiveShadow />)}
    </group>
  );
};
