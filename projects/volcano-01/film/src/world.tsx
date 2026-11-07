// Volcano 01: the world. Two real volcanoes as terrain blocks (km, heights x VEX) floating over a sea of cloud at dawn,
// each cut open along a north-south plane through its summit to show the magma, its pipe (a glass soda-bottle outline)
// and the gas. Every component is posed from props only (pure function of film time), so stills match the render.
import React, {useEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {continueRender, delayRender, staticFile} from 'remotion';
import {settle} from './kit/three-canvas';
import {rng} from './kit/noise';

export const VEX = 1.5;                                   // heights x1.5 (labelled on screen)
export const Y = (m: number) => (m / 1000) * VEX;
export const BASE_M = -6000;                              // the block's bottom (m)
export const GAS = new THREE.Color('#d8f6ff');             // the gas: the film's lead and accent
export const RUNNY = new THREE.Color('#ff8a1e');
export const STICKY = new THREE.Color('#7a3b22');
export const SUN = new THREE.Vector3(0.55, 0.45, 0.70).normalize(); // matches data/prep.py's baked light (x east, z south)
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------- data: heightfields, baked light, imagery, river paths; loaded once before the canvas mounts ----------
type Site = {G: number; size: number; h: Float32Array; pre?: Float32Array; crater?: [number, number]};
const cache: Record<string, any> = {};
const tex = (f: string, srgb: boolean) => new Promise<THREE.Texture>((res, rej) => new THREE.TextureLoader().load(staticFile(f), (t) => {
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 4; res(t);
}, undefined, rej));
const bin = (f: string) => fetch(staticFile(f)).then((r) => r.arrayBuffer()).then((b) => new Float32Array(b));
export const usePreload = () => {
  const [ok, set] = useState(!!cache.ready);
  useEffect(() => {
    if (cache.ready) return;
    const h = delayRender('volcano data');
    const site = async (n: string, pre: boolean) => {
      const j = await fetch(staticFile(`${n}.json`)).then((r) => r.json());
      const s: Site = {G: j.G, size: j.size_km, h: await bin(`${n}_h.bin`), crater: j.crater};
      if (pre) s.pre = await bin(`${n}_pre.bin`);
      cache[n] = s;
      cache[n + '_img'] = await tex(`${n}_imagery.jpg`, true);
      cache[n + '_n'] = await tex(`${n}_h_n.png`, false); cache[n + '_l'] = await tex(`${n}_h_l.png`, false);
      if (pre) { cache[n + '_pn'] = await tex(`${n}_pre_n.png`, false); cache[n + '_pl'] = await tex(`${n}_pre_l.png`, false); }
    };
    Promise.all([site('kil13', false), site('helens', true), fetch(staticFile('kil13_rivers.json')).then((r) => r.json()).then((j) => { cache.rivers = j; })])
      .then(() => { cache.ready = true; set(true); settle(h); }).catch((e) => { console.error(e); continueRender(h); });
  }, []);
  return ok;
};
export const data = () => cache;

// bilinear sample of a G x G field at (u, v) in [0,1]
export const sample = (f: Float32Array, G: number, u: number, v: number) => {
  const x = Math.min(G - 1.001, Math.max(0, u * (G - 1))), y = Math.min(G - 1.001, Math.max(0, v * (G - 1)));
  const i = Math.floor(x), j = Math.floor(y), a = x - i, b = y - j;
  return f[j * G + i] * (1 - a) * (1 - b) + f[j * G + i + 1] * a * (1 - b) + f[(j + 1) * G + i] * (1 - a) * b + f[(j + 1) * G + i + 1] * a * b;
};

// ---------- a block of terrain ----------
// Local frame: x east, z south, km; the summit (uc, vc) at x = z = 0. The block spans u in [u0, u1], v in [v0, v1];
// everything east of `cut` (local x) is sliced away, and the cut face shows the rock inside.
export type BlockSpec = {name: string; uc: number; vc: number; u0: number; u1: number; v0: number; v1: number};
export type Deform = {morph: number; bulge: number; pre: number}; // morph 0 = pre-1980 shape, 1 = today; pre: forest look before
export const heightAt = (S: Site, spec: BlockSpec, x: number, z: number, d?: Deform) => {
  const u = spec.uc + x / S.size, v = spec.vc + z / S.size;
  let m = sample(S.h, S.G, u, v);
  if (S.pre && d) {
    const p = sample(S.pre, S.G, u, v);
    m = p + (m - p) * d.morph;
    m += bulgeAt(x, z) * d.bulge;
  }
  return m;
};
// the 1980 bulge: north flank (z < 0) swelling out, centred ~1.6 km north of the old summit (exaggerated, m)
const bulgeAt = (x: number, z: number) => {
  const dz = z + 1.5, r2 = (x * x) / 1.2 + (dz * dz) / 0.7;
  return 480 * Math.exp(-r2);
};

const ROCK_V = /* glsl */`
varying vec3 vW; varying vec3 vN; varying vec3 vL;
void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vL = position; vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w; }`;
// rock of the cut face: layered basalt/ash bands, grain, darker with depth, lit by the sun + sky
const ROCK_F = /* glsl */`
varying vec3 vW; varying vec3 vN; varying vec3 vL;
uniform vec3 uSun; uniform vec3 uA; uniform vec3 uB; uniform float uFog; uniform vec3 uFogC; uniform float uSqueeze; uniform vec3 uSq;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
void main(){
  float y = vL.y; vec2 q = vL.zy;
  float band = n2(vec2(q.x * 0.25, y * 4.5 + n2(q * 0.5) * 0.5));
  vec3 c = mix(uA, uB, smoothstep(0.2, 0.8, band));
  c = mix(c, vec3(0.32, 0.13, 0.08), smoothstep(0.82, 0.9, n2(vec2(q.x * 0.2, y * 3.1 + 7.0))) * 0.6);   // reddish ash layers
  c *= 0.82 + 0.3 * n2(q * 9.0) + 0.1 * n2(q * 31.0);
  c *= mix(0.55, 1.0, smoothstep(-9.0, 1.0, y));
  // the squeeze: the rock above the chamber darkens and presses (a pressure tint, rock colour only)
  float sq = uSqueeze * smoothstep(1.8, 0.0, abs(vL.z - uSq.x)) * smoothstep(uSq.y - 0.5, uSq.y + 0.6, y) * smoothstep(uSq.z + 0.3, uSq.z - 1.5, y);
  c = mix(c, c * vec3(0.62, 0.6, 0.66), sq);
  float lit = 0.45 + 0.55 * max(dot(normalize(vN), uSun), 0.0);
  c *= lit;
  float d = length(vW - cameraPosition); c = mix(c, uFogC, 1.0 - exp(-d * uFog));
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

export const terrainMat = (img: THREE.Texture, nrm: THREE.Texture, lt: THREE.Texture, pnrm?: THREE.Texture, plt?: THREE.Texture) => {
  const m = new THREE.MeshStandardMaterial({map: img, roughness: 0.95, metalness: 0, side: THREE.DoubleSide});
  const U = {uN: {value: nrm}, uL: {value: lt}, uPN: {value: pnrm || nrm}, uPL: {value: plt || lt}, uPre: {value: 0}, uSnow: {value: 0}, uSnowLine: {value: Y(2250)}};
  m.userData.U = U;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vHy;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvHy = position.y;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uN; uniform sampler2D uL; uniform sampler2D uPN; uniform sampler2D uPL; uniform float uPre; uniform float uSnow; uniform float uSnowLine; varying float vHy;')
      .replace('#include <map_fragment>', `#include <map_fragment>
{ vec2 L = mix(texture2D(uL, vMapUv).rg, texture2D(uPL, vMapUv).rg, uPre);
  vec3 c = diffuseColor.rgb;
  // before 1980 the grey blast zone was forest: grey, bright, unsaturated pixels turn dark green
  float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b)); float grey = smoothstep(0.12, 0.03, mx - mn) * smoothstep(0.08, 0.25, mx);
  c = mix(c, vec3(0.035, 0.07, 0.035), grey * uPre * 0.9);
  // snow cap on the high cone (May 1980)
  float sn = uSnow * smoothstep(uSnowLine - 0.25, uSnowLine + 0.35, vHy);
  c = mix(c, vec3(0.86, 0.88, 0.92), sn);
  diffuseColor.rgb = c * (0.5 + 0.5 * L.r) * (0.55 + 0.45 * L.g); }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{ vec3 nO = mix(texture2D(uN, vMapUv).xyz, texture2D(uPN, vMapUv).xyz, uPre) * 2.0 - 1.0; nO.y /= ${VEX.toFixed(2)};
  normal = normalize(mix(normal, normalize((viewMatrix * vec4(normalize(nO), 0.0)).xyz), 0.7)); }`);
  };
  return m;
};

export const rockMat = (a: string, b: string) => new THREE.ShaderMaterial({
  uniforms: {uSun: {value: SUN}, uA: {value: new THREE.Color(a)}, uB: {value: new THREE.Color(b)}, uFog: {value: 0.0015}, uFogC: {value: new THREE.Color('#c9a99a')},
    uSqueeze: {value: 0}, uSq: {value: new THREE.Vector3(0, 0, 0)}},
  vertexShader: ROCK_V, fragmentShader: ROCK_F, side: THREE.DoubleSide,
});

// The block: top surface (res cells per km), cut face at local x = cut, and the other three sides.
export const Block: React.FC<{spec: BlockSpec; cut: number; ox: number; deform?: Deform; squeeze?: number; sq?: THREE.Vector3; rockA: string; rockB: string}> = ({spec, cut, ox, deform, squeeze = 0, sq, rockA, rockB}) => {
  const C = data(); const S: Site = C[spec.name];
  const geo = useMemo(() => {
    const nx = Math.round((spec.u1 - spec.u0) * S.G * 0.9), nz = Math.round((spec.v1 - spec.v0) * S.G * 0.9);
    const g = new THREE.PlaneGeometry(1, 1, nx, nz); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const fu = p.getX(i) + 0.5, fv = p.getZ(i) + 0.5;
      const u = spec.u0 + (spec.u1 - spec.u0) * fu, v = spec.v0 + (spec.v1 - spec.v0) * fv;
      p.setX(i, (u - spec.uc) * S.size); p.setZ(i, (v - spec.vc) * S.size); uv.setXY(i, u, 1 - v);
    }
    g.userData = {nx, nz};
    return g;
  }, [S, spec]);
  const mat = useMemo(() => {
    const m = terrainMat(C[spec.name + '_img'], C[spec.name + '_n'], C[spec.name + '_l'], C[spec.name + '_pn'], C[spec.name + '_pl']);
    m.clippingPlanes = [new THREE.Plane(V(-1, 0, 0), 0)];
    return m;
  }, [spec]);
  const rock = useMemo(() => rockMat(rockA, rockB), [rockA, rockB]);
  // per frame: heights (pre/post morph, bulge), the clip plane, the sides
  const key = deform ? `${deform.morph.toFixed(4)}_${deform.bulge.toFixed(4)}` : 'static';
  useMemo(() => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, Y(heightAt(S, spec, p.getX(i), p.getZ(i), deform)));
    p.needsUpdate = true; geo.computeVertexNormals();
  }, [geo, key]);
  mat.clippingPlanes![0].constant = cut + ox;   // clipping planes are in world space
  if (deform) { mat.userData.U.uPre.value = deform.pre; mat.userData.U.uSnow.value = deform.pre; }
  rock.uniforms.uSqueeze.value = squeeze; if (sq) rock.uniforms.uSq.value.copy(sq);
  // sides: cut face (x = cut, facing east), west face, north face, south face (each a strip from the base to the surface)
  const x0 = (spec.u0 - spec.uc) * S.size, x1 = Math.min(cut, (spec.u1 - spec.uc) * S.size);
  const z0 = (spec.v0 - spec.vc) * S.size, z1 = (spec.v1 - spec.vc) * S.size;
  const side = useMemo(() => {
    const n = 220, g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(4 * n * 2 * 3), 3));
    const idx: number[] = [];
    for (let e = 0; e < 4; e++) for (let k = 0; k < n - 1; k++) { const a = (e * n + k) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    g.setIndex(idx); g.userData.n = n; return g;
  }, []);
  {
    const n = side.userData.n, p = side.attributes.position as THREE.BufferAttribute, yb = Y(BASE_M);
    const edge = (e: number, k: number): [number, number] => {
      const f = k / (n - 1);
      return e === 0 ? [x1, z0 + (z1 - z0) * f] : e === 1 ? [x0, z1 - (z1 - z0) * f] : e === 2 ? [x0 + (x1 - x0) * f, z0] : [x1 - (x1 - x0) * f, z1];
    };
    for (let e = 0; e < 4; e++) for (let k = 0; k < n; k++) {
      const [x, z] = edge(e, k), y = Y(heightAt(S, spec, x, z, deform)), j = (e * n + k) * 2;
      p.setXYZ(j, x, y, z); p.setXYZ(j + 1, x, yb, z);
    }
    p.needsUpdate = true; side.computeVertexNormals(); side.computeBoundingSphere();
  }
  return (
    <group>
      <mesh geometry={geo} material={mat} />
      <mesh geometry={side} material={rock} />
    </group>
  );
};

// ---------- sky and the sea of cloud (the background world: dawn over the clouds, drifting slowly) ----------
export const Sky: React.FC = () => {
  const m = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: {uSun: {value: SUN}},
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec3 vD; uniform vec3 uSun;
      void main(){ float y = vD.y; vec3 zen = vec3(0.16, 0.24, 0.42), hor = vec3(0.98, 0.68, 0.52), low = vec3(0.55, 0.42, 0.45);
        vec3 c = mix(hor, zen, pow(smoothstep(-0.02, 0.6, y), 0.7)); c = mix(low, c, smoothstep(-0.25, 0.0, y));
        float s = max(dot(vD, uSun), 0.0); c += vec3(1.0, 0.75, 0.5) * (pow(s, 40.0) * 0.6 + pow(s, 6.0) * 0.18);
        gl_FragColor = vec4(c, 1.0); }`,
  }), []);
  return <mesh material={m} scale={900}><sphereGeometry args={[1, 32, 16]} /></mesh>;
};
export const Clouds: React.FC<{t: number}> = ({t}) => {
  const m = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, uniforms: {uT: {value: 0}, uSun: {value: SUN}},
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `varying vec3 vW; uniform float uT; uniform vec3 uSun;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for(int i=0;i<5;i++){ s += a*n2(p); p *= 2.07; a *= 0.5; } return s; }
      void main(){ vec2 p = vW.xz * 0.045 + vec2(uT * 0.004, uT * 0.002);
        float c = fbm(p); float c2 = fbm(p * 2.3 + 4.0);
        float lit = 0.75 + 0.35 * (c2 - 0.5);
        vec3 col = mix(vec3(0.62, 0.5, 0.56), vec3(1.0, 0.82, 0.7), smoothstep(0.35, 0.75, c)) * lit;
        float d = length(vW.xz - cameraPosition.xz); float a = smoothstep(0.25, 0.6, c) * (1.0 - smoothstep(250.0, 600.0, d));
        gl_FragColor = vec4(col, a * 0.95); }`,
  }), []);
  m.uniforms.uT.value = t;
  return <mesh material={m} rotation-x={-Math.PI / 2} position={[0, Y(BASE_M) - 1.5, 0]}><planeGeometry args={[1400, 1400]} /></mesh>;
};

// ---------- glass soda-bottle outline: body = chamber, neck = pipe, cap at the summit ----------
// Built as a half lathe (the half facing the camera, +x) at the cut plane. Profile in (radius, height) km.
export const bottleProfile = (yBot: number, yBody: number, yNeck: number, yTop: number, R: number, r: number) => {
  const pts: THREE.Vector2[] = [];
  const add = (x: number, y: number) => pts.push(new THREE.Vector2(x, y));
  add(0.001, yBot);
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; add(R * 0.8 + R * 0.2 * Math.sin(a), yBot + R * 0.2 * (1 - Math.cos(a))); }
  add(R, yBody);
  for (let i = 1; i <= 10; i++) { const k = i / 10; add(r + (R - r) * (0.5 + 0.5 * Math.cos(k * Math.PI)), yBody + (yNeck - yBody) * k); }
  add(r, yTop); add(r * 1.25, yTop); add(r * 1.25, yTop + 0.18); add(0.001, yTop + 0.18);
  return pts;
};
const FRES_V = 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }';
export const Bottle: React.FC<{pts: THREE.Vector2[]; on: number; cap: number; capLift?: number}> = ({pts, on, cap, capLift = 0}) => {
  const geo = useMemo(() => new THREE.LatheGeometry(pts.slice(0, -3), 64, 0, Math.PI), [pts]);
  const capGeo = useMemo(() => { const n = pts.length; const a = pts[n - 4], b = pts[n - 2]; return new THREE.CylinderGeometry(a.x * 1.3, a.x * 1.3, b.y - a.y, 32).translate(0, (a.y + b.y) / 2, 0); }, [pts]);
  const glass = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, toneMapped: false,
    uniforms: {uI: {value: 0}}, vertexShader: FRES_V,
    fragmentShader: 'varying vec3 vN; varying vec3 vV; uniform float uI; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); f = pow(f, 2.5); gl_FragColor = vec4(vec3(0.85, 0.95, 1.0) * uI * (0.06 + 0.9 * f), 1.0); }',
  }), []);
  const capMat = useMemo(() => new THREE.MeshStandardMaterial({color: '#d8dde2', metalness: 0.6, roughness: 0.35, transparent: true, fog: false}), []);
  glass.uniforms.uI.value = on; capMat.opacity = Math.min(1, cap);
  return (
    <group>
      <mesh geometry={geo} material={glass} />
      {cap > 0.01 && <mesh geometry={capGeo} material={capMat} position={[0, capLift, 0]} rotation={[capLift * 0.4, 0, capLift * 0.6]} />}
    </group>
  );
};

// magma inside the bottle: a half lathe (slightly inside the glass), emissive with slow churning noise
export const Magma: React.FC<{pts: THREE.Vector2[]; color: THREE.Color; t: number; glow: number; fill: number; sticky?: number}> = ({pts, color, t, glow, fill, sticky = 0}) => {
  const geo = useMemo(() => new THREE.LatheGeometry(pts.slice(0, -3).map((p) => new THREE.Vector2(p.x * 0.93, p.y)), 48, 0, Math.PI), [pts]);
  const m = useMemo(() => new THREE.ShaderMaterial({
    fog: false, toneMapped: false, transparent: false, side: THREE.DoubleSide,
    uniforms: {uC: {value: color.clone()}, uT: {value: 0}, uG: {value: 1}, uFill: {value: 1}, uSticky: {value: 0}},
    vertexShader: 'varying vec3 vL; varying vec3 vN; varying vec3 vV; void main(){ vL = position; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: `varying vec3 vL; varying vec3 vN; varying vec3 vV; uniform vec3 uC; uniform float uT; uniform float uG; uniform float uFill; uniform float uSticky;
      float h(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.0-2.0*f);
        return mix(mix(mix(h(i), h(i+vec3(1,0,0)), f.x), mix(h(i+vec3(0,1,0)), h(i+vec3(1,1,0)), f.x), f.y), mix(mix(h(i+vec3(0,0,1)), h(i+vec3(1,0,1)), f.x), mix(h(i+vec3(0,1,1)), h(i+vec3(1,1,1)), f.x), f.y), f.z); }
      void main(){ if (vL.y > uFill) discard;
        float sp = mix(0.35, 0.03, uSticky);
        float n = n3(vL * 2.2 + vec3(0.0, -uT * sp, uT * sp * 0.3)) * 0.6 + n3(vL * 6.0 + vec3(uT * sp, 0.0, 0.0)) * 0.4;
        float rim = pow(abs(dot(normalize(vN), normalize(vV))), 0.6);
        vec3 c = uC * (0.55 + 0.75 * n) * uG * (0.5 + 0.5 * rim);
        c += vec3(1.0, 0.85, 0.5) * pow(n, 4.0) * uG * 0.6 * (1.0 - uSticky);
        // sticky magma: pale glinting silica grains
        float gr = step(0.985, h(floor(vL * 40.0))) * uSticky; c += vec3(0.9, 0.85, 0.75) * gr * 0.8;
        gl_FragColor = vec4(c, 1.0); }`,
  }), []);
  m.uniforms.uC.value.copy(color); m.uniforms.uT.value = t; m.uniforms.uG.value = glow; m.uniforms.uFill.value = fill; m.uniforms.uSticky.value = sticky;
  return <mesh geometry={geo} material={m} />;
};

// ---------- gas bubbles: instanced spheres, positions supplied per frame (local coords), radius in km ----------
export type Bub = {x: number; y: number; z: number; r: number; o?: number};
export const Bubbles: React.FC<{list: Bub[]; max: number}> = ({list, max}) => {
  const geo = useMemo(() => new THREE.SphereGeometry(1, 18, 12), []);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, toneMapped: false, vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * instanceMatrix * vec4(position,1.0); vN = normalize(normalMatrix * mat3(instanceMatrix) * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float d = abs(dot(normalize(vN), normalize(vV))); float rim = pow(1.0 - d, 2.0); vec3 hl = vec3(1.0) * pow(max(dot(normalize(vN), normalize(vec3(0.4, 0.7, 0.6))), 0.0), 24.0); gl_FragColor = vec4(vec3(0.85, 0.97, 1.0) * (0.35 + 1.1 * rim) + hl, 0.55 + 0.45 * rim); }',
  }), []);
  const inst = useMemo(() => { const m = new THREE.InstancedMesh(geo, mat, max); m.frustumCulled = false; m.renderOrder = 10; return m; }, [geo, mat, max]);
  const M = new THREE.Matrix4();
  let n = 0;
  for (const b of list) { if (n >= max || b.r <= 0.0005) continue; M.makeScale(b.r, b.r, b.r).setPosition(b.x, b.y, b.z); inst.setMatrixAt(n++, M); }
  inst.count = n; inst.instanceMatrix.needsUpdate = true;
  return <primitive object={inst} />;
};

// ---------- soft billboards (ash, steam, puffs), instanced; colour per instance ----------
export type Puff = {x: number; y: number; z: number; s: number; o: number; c: THREE.Color};
const puffTex = (() => { let t: THREE.Texture | null = null; return () => {
  if (t) return t; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const r = rng(11);
  for (let i = 0; i < 14; i++) { const x = 64 + (r() - 0.5) * 50, y = 64 + (r() - 0.5) * 50, rad = 18 + r() * 26;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,0.32)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
  t = new THREE.CanvasTexture(c); return t; }; })();
export const Puffs: React.FC<{list: Puff[]; max: number; additive?: boolean}> = ({list, max, additive}) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false,
    uniforms: {uMap: {value: puffTex()}},
    vertexShader: `attribute vec4 aC; varying vec4 vC; varying vec2 vU;
      void main(){ vC = aC; vU = uv; vec3 p = instanceMatrix[3].xyz; float s = length(instanceMatrix[0].xyz);
        vec4 mv = modelViewMatrix * vec4(p, 1.0); mv.xy += position.xy * s; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: 'uniform sampler2D uMap; varying vec4 vC; varying vec2 vU; void main(){ float a = texture2D(uMap, vU).a * vC.a; gl_FragColor = vec4(vC.rgb, a); }',
  }), [additive]);
  const inst = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, mat, max); m.frustumCulled = false;
    geo.setAttribute('aC', new THREE.InstancedBufferAttribute(new Float32Array(max * 4), 4)); return m;
  }, [geo, mat, max]);
  const M = new THREE.Matrix4(); const aC = geo.attributes.aC as THREE.InstancedBufferAttribute;
  let n = 0;
  for (const p of list) { if (n >= max || p.o <= 0.003) continue; M.makeScale(p.s, p.s, p.s).setPosition(p.x, p.y, p.z); inst.setMatrixAt(n, M); aC.setXYZW(n, Math.pow(p.c.r, 1 / 2.2), Math.pow(p.c.g, 1 / 2.2), Math.pow(p.c.b, 1 / 2.2), p.o); n++; }
  inst.count = n; inst.instanceMatrix.needsUpdate = true; aC.needsUpdate = true;
  return <primitive object={inst} />;
};

// ---------- lava rivers on Kilauea: ribbons draped on the terrain along the traced paths, growing from the vents ----------
export const LavaRivers: React.FC<{spec: BlockSpec; grow: number; glow: number; t: number; width?: number}> = ({spec, grow, glow, t, width = 0.11}) => {
  const C = data(); const S: Site = C[spec.name];
  const geos = useMemo(() => (C.rivers as number[][][]).map((path) => {
    const pts = path.map(([u, v]) => { const x = (u - spec.uc) * S.size, z = (v - spec.vc) * S.size; return V(x, Y(sample(S.h, S.G, u, v)) + 0.025, z); });
    const curve = new THREE.CatmullRomCurve3(pts);
    const N = 260, pos: number[] = [], arc: number[] = [], idx: number[] = [];
    for (let i = 0; i < N; i++) {
      const k = i / (N - 1), p = curve.getPointAt(k), tg = curve.getTangentAt(k); const side = V(-tg.z, 0, tg.x).normalize();
      const w = width * (0.7 + 0.9 * k);
      for (const s of [-1, 1]) { const q = p.clone().addScaledVector(side, s * w); const u = spec.uc + q.x / S.size, v = spec.vc + q.z / S.size;
        q.y = Y(sample(S.h, S.G, u, v)) + 0.02; pos.push(q.x, q.y, q.z); arc.push(k, s); }
      if (i < N - 1) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aK', new THREE.Float32BufferAttribute(arc, 2)); g.setIndex(idx);
    return g;
  }), [S, spec]);
  const m = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, toneMapped: false, side: THREE.DoubleSide,
    uniforms: {uGrow: {value: 0}, uG: {value: 1}, uT: {value: 0}},
    vertexShader: 'attribute vec2 aK; varying vec2 vK; void main(){ vK = aK; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec2 vK; uniform float uGrow; uniform float uG; uniform float uT;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      void main(){ if (vK.x > uGrow) discard;
        float edge = 1.0 - abs(vK.y); float head = smoothstep(uGrow, uGrow - 0.02, vK.x);
        float n = n2(vec2(vK.x * 160.0 - uT * 2.5, vK.y * 3.0)) * 0.6 + n2(vec2(vK.x * 420.0 - uT * 4.0, vK.y * 7.0)) * 0.4;
        float crust = smoothstep(0.55, 0.8, n) * 0.6 + (1.0 - smoothstep(0.0, 0.5, edge)) * 0.7;
        vec3 hot = mix(vec3(1.0, 0.45, 0.08), vec3(1.0, 0.85, 0.4), smoothstep(0.6, 1.0, edge) * (1.0 - n));
        vec3 c = mix(hot * 1.6, vec3(0.08, 0.03, 0.02), clamp(crust, 0.0, 0.85)) * uG;
        gl_FragColor = vec4(c, smoothstep(0.0, 0.25, edge) * head); }`,
  }), []);
  m.uniforms.uGrow.value = grow; m.uniforms.uG.value = glow; m.uniforms.uT.value = t;
  return <group>{geos.map((g, i) => <mesh key={i} geometry={g} material={m} />)}</group>;
};

// ---------- a kitchen spoon, giant (only prop from outside: "thick and sticky, like peanut butter") ----------
export const Spoon: React.FC<{pos: THREE.Vector3; tilt: number; scale: number}> = ({pos, tilt, scale}) => {
  const geo = useMemo(() => {
    const handle = new THREE.CylinderGeometry(0.2, 0.07, 3.2, 20).translate(0, 1.6, 0); handle.scale(1, 1, 0.3);
    const tip = new THREE.SphereGeometry(0.2, 20, 12); tip.scale(1, 0.7, 0.3); tip.translate(0, 3.2, 0);
    const bowl = new THREE.SphereGeometry(0.6, 24, 16); bowl.scale(0.75, 1.15, 0.3); bowl.translate(0, -0.55, 0);
    return [handle, bowl, tip];
  }, []);
  const m = useMemo(() => new THREE.MeshStandardMaterial({color: '#e6e9ec', metalness: 0.85, roughness: 0.22, fog: false}), []);
  return <group position={pos} rotation={[0, 0, tilt]} scale={scale}>{geo.map((g, i) => <mesh key={i} geometry={g} material={m} />)}</group>;
};

// ---------- the old summit as a ghost wireframe over today's crater ----------
export const Ghost: React.FC<{spec: BlockSpec; o: number; ox: number}> = ({spec, o, ox}) => {
  const C = data(); const S: Site = C[spec.name];
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(7, 7, 34, 34); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Y(sample(S.pre!, S.G, spec.uc + x / S.size, spec.vc + z / S.size)) + 0.02); }
    return g;
  }, [S, spec]);
  const m = useMemo(() => { const mm = new THREE.MeshBasicMaterial({color: '#e8f8ff', wireframe: true, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending});
    mm.clippingPlanes = [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0)]; return mm; }, []);
  m.opacity = 0.45 * o; m.clippingPlanes![0].constant = ox;
  return o > 0.01 ? <mesh geometry={geo} material={m} /> : null;
};
// ---------- rock slabs pressing down on the chamber (the weight of the rock above) ----------
export const Slabs: React.FC<{k: number[]; y0: number; w: number}> = ({k, y0, w}) => {
  const geo = useMemo(() => new THREE.BoxGeometry(0.5, 0.75, w), [w]);
  const m = useMemo(() => new THREE.MeshStandardMaterial({color: '#6a5a4e', roughness: 0.9, fog: false}), []);
  return <group>{k.map((v, i) => v > 0.001 ? <mesh key={i} geometry={geo} material={m} position={[0.3, y0 + i * 0.8 + (1 - v) * 2.5, 0]} /> : null)}</group>;
};
