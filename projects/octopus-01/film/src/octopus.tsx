// An original octopus (a generic day/common octopus, built from measurements of the real animal: mantle ~1/3 of the
// arm length, eyes on top of the head with a bar-shaped pupil, two rows of suckers, a web between the arm bases).
// One lofted body surface (bottom closed, eye bulges in the surface) + eight tapered arms whose roots start INSIDE the
// body (sunk, never butted) + a web that starts inside the body and inside the arms. Arms are rebuilt every frame on
// the CPU from a pose (no new geometry: positions are rewritten in place). The skin is one shader: chromatophore cells
// (yellow, red, brown sacs that open and close), iridophore sheen, a white leucophore base and papillae (bumps).
// Joints (assembly.md): arm roots, web and eyes are checked against the body on mount (kit/joints.ts).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {N3, REEF_COLOR} from './glsl';
import {BUMP} from './kit/water/glsl';
import {checkJoints} from './kit/joints';

export const ARM_L = 0.42;          // metres, base to tip
export const ARMS = 8;
const NS = 72, NR = 14, S0 = -0.1;  // samples along an arm (from S0, inside the body, to 1), around
const armR = (s: number) => 0.019 * Math.pow(1 - 0.9 * Math.min(1, Math.max(0, s)), 0.85) + 0.0012;

// ---------- the body: one lofted surface along a spine ----------
const SPINE = [new THREE.Vector3(0, 0.022, 0.0), new THREE.Vector3(0, 0.062, 0.012), new THREE.Vector3(0, 0.092, -0.025),
  new THREE.Vector3(0, 0.118, -0.085), new THREE.Vector3(0, 0.114, -0.17)];
const spine = new THREE.CatmullRomCurve3(SPINE, false, 'centripetal');
const RAD = [[0, 0.0], [0.07, 0.036], [0.28, 0.046], [0.45, 0.042], [0.7, 0.06], [0.86, 0.05], [1, 0]];
const radAt = (u: number) => {
  let i = 0; while (i < RAD.length - 2 && u > RAD[i + 1][0]) i++;
  const [u0, r0] = RAD[i], [u1, r1] = RAD[i + 1], k = Math.min(1, Math.max(0, (u - u0) / (u1 - u0))), sm = k * k * (3 - 2 * k);
  let r = r0 + (r1 - r0) * sm;
  if (u < 0.07) r = 0.036 * Math.sqrt(Math.max(0, u / 0.07 * (2 - u / 0.07)));          // round bottom
  if (u > 0.86) r = 0.05 * Math.sqrt(Math.max(0, 1 - ((u - 0.86) / 0.14) ** 2));        // round mantle tip
  return r;
};
export const EYE_U = 0.33, EYE_A = [0.42, Math.PI - 0.42]; // angle 0 = +x (side), PI/2 = +z (front)
const ringFrame = (u: number) => {
  const c = spine.getPointAt(u), tn = spine.getTangentAt(u), X = new THREE.Vector3(1, 0, 0);
  const Y = new THREE.Vector3().crossVectors(X, tn).normalize();
  return {c, X, Y};
};
export const bodyPoint = (u: number, a: number) => {
  const {c, X, Y} = ringFrame(u);
  let r = radAt(u);
  for (const ea of EYE_A) { const da = Math.atan2(Math.sin(a - ea), Math.cos(a - ea)); r += 0.011 * Math.exp(-(da * da) / 0.16 - ((u - EYE_U) ** 2) / 0.003); }
  return c.clone().addScaledVector(X, Math.cos(a) * r).addScaledVector(Y, Math.sin(a) * r * 0.92);
};
const bodyGeometry = () => {
  const NU = 90, NA = 72, pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NU; i++) for (let j = 0; j <= NA; j++) { const p = bodyPoint(i / NU, (j / NA) * Math.PI * 2); pos.push(p.x, p.y, p.z); }
  for (let i = 0; i < NU; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aRest', new THREE.Float32BufferAttribute(pos.slice(), 3));
  g.setIndex(idx); g.computeVertexNormals();
  // weld the seam normals (j = 0 and j = NA are the same points)
  const n = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i <= NU; i++) { const a = i * (NA + 1), b = a + NA, x = (n.getX(a) + n.getX(b)) / 2, y = (n.getY(a) + n.getY(b)) / 2, z = (n.getZ(a) + n.getZ(b)) / 2; n.setXYZ(a, x, y, z); n.setXYZ(b, x, y, z); }
  return g;
};
export const eyeAnchor = (k: number) => {
  const a = EYE_A[k], p = bodyPoint(EYE_U, a), q = bodyPoint(EYE_U, a + 0.02), r = bodyPoint(EYE_U + 0.01, a);
  const nrm = new THREE.Vector3().crossVectors(q.clone().sub(p), r.clone().sub(p)).normalize();
  if (nrm.dot(p.clone().sub(ringFrame(EYE_U).c)) < 0) nrm.negate();
  return {p, n: nrm};
};

// ---------- arms: a pose -> centre lines with an exact frame (yaw/pitch, no roll) ----------
export type Pose = {spread: number; curl: number; lift: number; wave: number; tuck: number; reach: number; t: number};
export const REST_POSE: Pose = {spread: 1, curl: 0.4, lift: 0, wave: 1, tuck: 0, reach: 0, t: 0};
export type ArmFrames = {p: Float32Array; T: Float32Array; S: Float32Array; U: Float32Array; s: Float32Array};
const PHI = Array.from({length: ARMS}, (_, i) => (i + 0.5) / ARMS * Math.PI * 2 + 0.12 * Math.sin(i * 2.3));
const CURL_YAW = [1.4, -1.0, 1.8, -1.5, 1.1, -1.6, 1.5, -0.9];
const CURL_UP = [0.2, 0.9, 0.1, 0.5, 0.3, 0.1, 0.8, 0.2];
// ground(x, z) in the octopus's local frame: height of the surface under it
export const armFrames = (pose: Pose, ground: (x: number, z: number) => number): ArmFrames[] =>
  PHI.map((phi0, i) => {
    const n = NS + 1, p = new Float32Array(n * 3), T = new Float32Array(n * 3), S = new Float32Array(n * 3), U = new Float32Array(n * 3), ss = new Float32Array(n);
    const ds = (1 - S0) / NS;
    // front arms (pointing +z) are the ones raised in a "lift"
    const front = Math.max(0, Math.sin(phi0)) ** 3;
    // tucked: the arms fold in under the body and point down/back
    const phi = phi0 * (1 - 0.25 * pose.tuck) + pose.tuck * 0.25 * (-Math.PI / 2);
    let x = Math.cos(phi) * 0.008, y = 0.03, z = Math.sin(phi) * 0.008 + 0.002, chi = -0.25;
    let curlAcc = 0, yawAcc = 0;
    for (let k = 0; k < n; k++) {
      const s = S0 + k * ds; ss[k] = s;
      const sp = Math.max(0, s);
      const r = armR(s);
      // pitch: follow the ground (rest on it), plus lift and curl
      const gy = ground(x, z) + r * 0.85 + pose.lift * front * ARM_L * sp * 0.55 + pose.reach * sp * 0.02;
      const target = Math.atan2(gy - y, 0.035) * (s < 0.05 ? 0.4 : 1);
      chi += (Math.max(-1.1, Math.min(1.1, target)) - chi) * 0.32;
      const cu = pose.curl * Math.max(0, sp - 0.55) ** 2 * 14;
      curlAcc += cu * ds * CURL_UP[i] * 3;
      yawAcc += cu * ds * CURL_YAW[i] * 3;
      const yaw = phi + yawAcc + pose.wave * 0.22 * Math.sin(pose.t * 1.1 + i * 1.7 - sp * 4.5) * sp * (0.6 + 0.4 * (i % 3) / 2) + 0.55 * Math.sin(sp * 5.5 + i * 2.1) * sp + (1 - pose.spread) * 0.35 * Math.sin(i * 1.3) * sp;
      const c = chi + curlAcc;
      const tx = Math.cos(c) * Math.cos(yaw), ty = Math.sin(c), tz = Math.cos(c) * Math.sin(yaw);
      const sx = -Math.sin(yaw), sz = Math.cos(yaw);
      // U = S x T
      const ux = 0 * tz - sz * ty, uy = sz * tx - sx * tz, uz = sx * ty - 0 * tx;
      p.set([x, y, z], k * 3); T.set([tx, ty, tz], k * 3); S.set([sx, 0, sz], k * 3); U.set([ux, uy, uz], k * 3);
      const step = ARM_L * ds * (1 + 0.15 * pose.reach);
      x += tx * step; y += ty * step; z += tz * step;
    }
    return {p, T, S, U, s: ss};
  });

// arm tubes in one geometry (positions rewritten each frame)
const armGeometry = () => {
  const vPer = (NS + 1) * (NR + 1), pos = new Float32Array(ARMS * vPer * 3), rest = new Float32Array(ARMS * vPer * 3), idx: number[] = [];
  for (let i = 0; i < ARMS; i++) {
    const o = i * vPer;
    for (let k = 0; k <= NS; k++) for (let j = 0; j <= NR; j++) {
      const s = S0 + k * (1 - S0) / NS, th = (j / NR) * Math.PI * 2, r = armR(s);
      rest.set([i * 7 + s * ARM_L + 3, r * Math.cos(th), r * Math.sin(th)], (o + k * (NR + 1) + j) * 3);
    }
    for (let k = 0; k < NS; k++) for (let j = 0; j < NR; j++) { const a = o + k * (NR + 1) + j, b = a + NR + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aRest', new THREE.BufferAttribute(rest, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(pos.length), 3));
  g.setIndex(idx); g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2);
  return g;
};
const writeArms = (g: THREE.BufferGeometry, F: ArmFrames[]) => {
  const pos = g.attributes.position as THREE.BufferAttribute, nrm = g.attributes.normal as THREE.BufferAttribute, vPer = (NS + 1) * (NR + 1);
  F.forEach((f, i) => {
    for (let k = 0; k <= NS; k++) {
      const r = armR(f.s[k]) * (k === NS ? 0.3 : 1);
      for (let j = 0; j <= NR; j++) {
        const th = (j / NR) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th), v = i * vPer + k * (NR + 1) + j;
        // flatten slightly on the sucker side (-U) like a real arm
        const fl = s < 0 ? 0.82 : 1;
        const nx = f.S[k * 3] * c + f.U[k * 3] * s, ny = f.S[k * 3 + 1] * c + f.U[k * 3 + 1] * s, nz = f.S[k * 3 + 2] * c + f.U[k * 3 + 2] * s;
        pos.setXYZ(v, f.p[k * 3] + (f.S[k * 3] * c + f.U[k * 3] * s * fl) * r, f.p[k * 3 + 1] + (f.S[k * 3 + 1] * c + f.U[k * 3 + 1] * s * fl) * r, f.p[k * 3 + 2] + (f.S[k * 3 + 2] * c + f.U[k * 3 + 2] * s * fl) * r);
        nrm.setXYZ(v, nx, ny, nz);
      }
    }
  });
  pos.needsUpdate = true; nrm.needsUpdate = true;
};
// a point on arm i's centre line at arm-length s (interpolated), with its frame's U
const armAt = (f: ArmFrames, s: number) => {
  const k = Math.min(NS - 1e-6, Math.max(0, (s - S0) / ((1 - S0) / NS))), k0 = Math.floor(k), w = k - k0;
  const g = (a: Float32Array, c: number) => a[k0 * 3 + c] * (1 - w) + a[(k0 + 1) * 3 + c] * w;
  return {p: new THREE.Vector3(g(f.p, 0), g(f.p, 1), g(f.p, 2)), U: new THREE.Vector3(g(f.U, 0), g(f.U, 1), g(f.U, 2)), S: new THREE.Vector3(g(f.S, 0), g(f.S, 1), g(f.S, 2))};
};
// the web between neighbouring arms: rows from inside the body out to a scalloped edge
const WC = 8, WR = 10;
const webGeometry = () => {
  const cols = ARMS * WC, pos = new Float32Array((cols + 1) * (WR + 1) * 3), rest = new Float32Array(pos.length), idx: number[] = [];
  for (let r = 0; r <= WR; r++) for (let c = 0; c <= cols; c++) rest.set([c / cols * 0.4 + 60, r / WR * 0.1, 0], (r * (cols + 1) + c) * 3);
  for (let r = 0; r < WR; r++) for (let c = 0; c < cols; c++) { const a = r * (cols + 1) + c, b = a + cols + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aRest', new THREE.BufferAttribute(rest, 3));
  g.setIndex(idx); g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2);
  return g;
};
const writeWeb = (g: THREE.BufferGeometry, F: ArmFrames[], webLen: number) => {
  const pos = g.attributes.position as THREE.BufferAttribute, cols = ARMS * WC;
  for (let r = 0; r <= WR; r++) for (let c = 0; c <= cols; c++) {
    const i = Math.floor(c / WC) % ARMS, f = (c % WC) / WC, u = r / WR;
    const s = -0.06 + u * (webLen + 0.06) * (1 - 0.55 * Math.sin(Math.PI * f));
    const a = armAt(F[i], s), b = armAt(F[(i + 1) % ARMS], s);
    const p = a.p.lerp(b.p, f).addScaledVector(a.U.lerp(b.U, f), -0.35 * armR(s));
    pos.setXYZ(r * (cols + 1) + c, p.x, p.y, p.z);
  }
  pos.needsUpdate = true; g.computeVertexNormals();
};

// ---------- the skin shader ----------
export type SkinU = ReturnType<typeof skinUniforms>;
export const skinUniforms = () => ({
  uSkT: {value: 0}, uChroma: {value: 0.8}, uMottle: {value: 0}, uWave: {value: 0}, uMatch: {value: 0}, uPale: {value: 0},
  uPap: {value: 0}, uIrid: {value: 0.25}, uCellD: {value: 420}, uHue: {value: new THREE.Color('#9a3a22')}, uSpot: {value: 0},
});
const SKIN_PARS = /* glsl */`
uniform float uSkT, uChroma, uMottle, uWave, uMatch, uPale, uPap, uIrid, uCellD, uSpot; uniform vec3 uHue;
varying vec3 vRest; varying vec3 vWorld;
${N3}
float papH(vec3 R){
  if (uPap < 0.01) return 0.0;
  vec2 a = worley(R * 80.0), b = worley(R * 34.0 + 5.0);
  float small = pow(max(0.0, 1.0 - a.x / 0.55), 2.0) * (0.4 + a.y) * 0.0035;
  float big = pow(max(0.0, 1.0 - b.x / 0.6), 2.2) * step(0.4, b.y) * 0.011;
  return uPap * (small + big); }
`;
export const skinMaterial = (U: SkinU, side: THREE.Side = THREE.FrontSide) => {
  const m = new THREE.MeshStandardMaterial({roughness: 0.55, metalness: 0, side});
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\nattribute vec3 aRest;\n${SKIN_PARS}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\nvRest = aRest; transformed += objectNormal * papH(aRest);`)
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>\nvWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${SKIN_PARS}\n${REEF_COLOR}\n${BUMP}`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', /* glsl */`
        vec3 R = vRest;
        vec3 leuco = vec3(0.88, 0.84, 0.76);
        // what fraction of skin the open sacs should cover, from the pattern being shown
        float mott = smoothstep(0.40, 0.62, fbm3(R * 16.0 + 2.0));
        float cov = uChroma * (0.86 + 0.14 * vn3(R * 40.0));
        cov = mix(cov, 0.12 + 0.82 * mott, uMottle);
        float wv = smoothstep(0.35, 0.9, 0.5 + 0.5 * sin(dot(R, vec3(55.0, 8.0, 34.0)) - uSkT * 6.0));
        cov = mix(cov, mix(0.15, 0.95, wv), uWave);
        cov *= 1.0 - uPale;
        // chromatophore sacs: yellow, red-orange, brown; each opens to a radius set by 'cov'
        vec3 CP = R * uCellD;
        vec2 wc = worley(CP);
        vec3 cc = wc.y < 0.1 ? vec3(0.8, 0.55, 0.14) : (wc.y < 0.68 ? uHue * 1.15 : vec3(0.26, 0.1, 0.05));
        float rad = mix(0.1, 0.8, cov * cov * (3.0 - 2.0 * cov));
        leuco = mix(leuco, uHue * 0.9 + 0.08, 0.45 * cov);
        float aaw = fwidth(wc.x) + 0.02;
        float sac = smoothstep(rad + aaw, rad - aaw, wc.x);
        vec3 avgC = mix(vec3(0.86, 0.6, 0.12), uHue * 1.15, 0.55) * 0.55 + vec3(0.24, 0.1, 0.05) * 0.45;
        avgC = mix(avgC, uHue, 0.5);
        float cover = clamp(1.6 * rad * rad + 0.2 * rad, 0.0, 1.0);
        float far = clamp(length(fwidth(CP)) * 1.6 - 0.6, 0.0, 1.0);
        vec3 col = mix(mix(leuco, cc, sac), mix(leuco, avgC, cover), far);
        // match: copy the reef colour under it (still through the sacs: dots in close-ups)
        vec3 T = reefColor(vWorld);
        float dots = mix(0.85 + 0.3 * sac, 1.0, far);
        col = mix(col, T * dots, uMatch);
        // spot highlight used for 'this is a sac' moments: one cell pulses
        vec4 diffuseColor = vec4(col, opacity);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\nif (uPap > 0.01) normal = wbump(-vViewPosition, normal, papH(vRest), 1.0);`)
      .replace('#include <emissivemap_fragment>', /* glsl */`#include <emissivemap_fragment>
        { float ndv = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
          float im = smoothstep(0.45, 0.7, fbm3(vRest * 9.0 + 4.0));
          vec3 ir = 0.5 + 0.5 * cos(6.2831 * (ndv * 1.6 + vec3(0.55, 0.68, 0.82)));
          totalEmissiveRadiance += ir * vec3(0.25, 0.65, 0.9) * uIrid * im * pow(1.0 - ndv, 1.5) * 0.5 * step(vRest.x, 2.0) * (1.0 - uMatch); }`);
  };
  m.customProgramCacheKey = () => 'octo-skin-' + side;
  return m;
};

// eyes: gold iris, black bar pupil (horizontal), skin-coloured back
export const eyeMaterial = () => {
  const m = new THREE.MeshStandardMaterial({roughness: 0.18, metalness: 0});
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vL;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvL = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vL;').replace('vec4 diffuseColor = vec4( diffuse, opacity );', /* glsl */`
      vec3 q = normalize(vL);
      float front = smoothstep(0.1, 0.35, q.z);
      float pupil = smoothstep(0.03, 0.0, abs(q.y) - 0.13) * smoothstep(0.03, 0.0, abs(q.x) - 0.42) * step(0.5, q.z);
      vec3 iris = mix(vec3(0.75, 0.55, 0.18), vec3(0.95, 0.82, 0.45), 0.5 + 0.5 * sin(atan(q.y, q.x) * 18.0));
      vec3 col = mix(vec3(0.6, 0.3, 0.2), iris, front);
      col = mix(col, vec3(0.02), pupil);
      vec4 diffuseColor = vec4(col, 1.0);`);
  };
  m.customProgramCacheKey = () => 'octo-eye';
  return m;
};

const sucker = (() => { const g = new THREE.CylinderGeometry(1, 0.8, 0.7, 12, 1); g.translate(0, 0.35, 0); return g; })();
const SPR = 26; // suckers per row

export type OctoProps = {
  pose: Pose; ground: (x: number, z: number) => number; skin: Partial<Record<keyof SkinU, number>>; hue?: string;
  position?: THREE.Vector3; yaw?: number; breathe?: number; lid?: number; under?: (m: THREE.MeshStandardMaterial, key: string) => THREE.MeshStandardMaterial;
};
export const Octopus: React.FC<OctoProps> = ({pose, ground, skin, hue, position, yaw = 0, breathe = 0, lid = 0, under}) => {
  const U = useMemo(skinUniforms, []);
  const wrap = under ?? ((m: THREE.MeshStandardMaterial) => m);
  const parts = useMemo(() => {
    const body = bodyGeometry(), arms = armGeometry(), web = webGeometry();
    const mSkin = wrap(skinMaterial(U), 'octo'), mWeb = wrap(skinMaterial(U, THREE.DoubleSide), 'octoweb');
    const mEye = wrap(eyeMaterial(), 'eye');
    const mSuck = wrap(new THREE.MeshStandardMaterial({color: '#e7c9b4', roughness: 0.6}), 'suck');
    const eyes = [0, 1].map((k) => {
      const a = eyeAnchor(k), r = 0.0135;
      const c = a.p.clone().addScaledVector(a.n, -0.45 * r);
      const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(), a.n.clone().negate(), new THREE.Vector3(0, 1, 0)));
      return {c, q, r};
    });
    // upper eyelids: skin hemispheres a little larger than the eye, hinged on the eye's horizontal axis
    const lidGeo = new THREE.SphereGeometry(0.0135 * 1.08, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    lidGeo.setAttribute('aRest', new THREE.Float32BufferAttribute(Array.from(lidGeo.attributes.position.array as Float32Array).map((x) => x + 0.3), 3));
    const suck = new THREE.InstancedMesh(sucker, mSuck, ARMS * SPR * 2);
    suck.frustumCulled = false;
    return {body, arms, web, mSkin, mWeb, mEye, mSuck, eyes, suck, lidGeo, checked: false};
  }, []);
  U.uSkT.value = pose.t;
  for (const [k, v] of Object.entries(skin)) (U as any)[k].value = v;
  if (hue) U.uHue.value.set(hue);
  const F = armFrames(pose, ground);
  writeArms(parts.arms, F);
  writeWeb(parts.web, F, 0.2);
  // suckers: two rows on the underside (-U) of each arm, sized to the arm
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  F.forEach((f, i) => {
    for (let k = 0; k < SPR; k++) for (let row = 0; row < 2; row++) {
      const s = 0.06 + (k + row * 0.5) / SPR * 0.9, a = armAt(f, s), r = armR(s);
      const down = a.U.clone().negate();
      const p = a.p.clone().addScaledVector(down, r * 0.62).addScaledVector(a.S, (row ? 1 : -1) * r * 0.36);
      q.setFromUnitVectors(up, down); sc.setScalar(r * 0.36);
      mtx.compose(p, q, sc); parts.suck.setMatrixAt((i * SPR + k) * 2 + row, mtx);
    }
  });
  parts.suck.instanceMatrix.needsUpdate = true;
  if (!parts.checked) {
    parts.checked = true;
    // joints: every arm root and the web start inside the body; eyes sunk into the head
    const armOnly = parts.arms.clone(); armOnly.computeVertexNormals();
    checkJoints([
      {name: 'arms-body', a: parts.body, b: armOnly, maxGap: 0.0005},
      {name: 'web-body', a: parts.body, b: parts.web, maxGap: 0.0005},
      ...parts.eyes.map((e, k) => ({name: `eye${k}-head`, a: parts.body, b: new THREE.SphereGeometry(e.r, 16, 12).translate(e.c.x, e.c.y, e.c.z), maxGap: 0.0005})),
    ]);
    armOnly.dispose();
  }
  const br = 1 + breathe * 0.035 * Math.sin(pose.t * 2.4);
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <group scale={[br, 1 + (br - 1) * 0.5, br]}>
        <mesh geometry={parts.body} material={parts.mSkin} />
        {parts.eyes.map((e, k) => <group key={k} position={e.c} quaternion={e.q}>
          <mesh material={parts.mEye}><sphereGeometry args={[e.r, 28, 20]} /></mesh>
          <mesh geometry={parts.lidGeo} material={parts.mWeb} rotation={[-0.55 + lid * (Math.PI / 2 + 0.55), 0, 0]} />
        </group>)}
      </group>
      <mesh geometry={parts.arms} material={parts.mSkin} frustumCulled={false} />
      <mesh geometry={parts.web} material={parts.mWeb} frustumCulled={false} />
      <primitive object={parts.suck} />
    </group>
  );
};
