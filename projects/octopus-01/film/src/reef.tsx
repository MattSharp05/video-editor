// The reef world: a sunlit tropical reef ~6 m down (clear turquoise water, water kit `tropical` preset). A rounded
// rock slab the octopus lives on (its colour is REEF_COLOR, so the octopus's "match" pattern copies it exactly),
// sand, brain-coral domes, branching coral, sea fans, sponges, algae tufts that sway, a school of small fish, silt,
// light shafts and the surface seen from below. Everything is a pure function of t.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {fbm2} from './kit/noise';
import {rock as rockGeo} from './kit/realism/shapes';
import {tuft} from './kit/realism/plants';
import {PRESETS} from './kit/water/presets';
import {underwaterUniforms, withUnderwater, UnderU} from './kit/water/underwater';
import {UnderwaterSet} from './kit/water/components';
import {N3, REEF_COLOR} from './glsl';

export const WATER = {...PRESETS.tropical, haze: '#2a8fa6', extinction: [0.36, 0.075, 0.06] as [number, number, number], caustics: 0.9, silt: 0.35};
export const SURFACE_Y = 6;
const SAND_Y = -0.55;
// the slab: a low dome ~2.2 x 1.8 m, top near y = 0 under the octopus, bumpy; drops to the sand at its edge
export const rockY = (x: number, z: number) => {
  const r = Math.hypot(x / 1.15, (z + 0.1) / 0.95);
  const dome = -0.16 * r * r - 0.02 * x;
  const bumps = 0.018 * fbm2(x * 5, z * 5, 3) + 0.006 * fbm2(x * 19, z * 19, 9);
  const edge = r < 0.85 ? 0 : -(((r - 0.85) / 0.25) ** 2) * 0.6;
  return dome + bumps + edge;
};
export const sandY = (x: number, z: number) => SAND_Y + 0.04 * fbm2(x * 0.8, z * 0.8, 21) + 0.01 * fbm2(x * 6, z * 6, 4);
export const groundY = (x: number, z: number) => Math.max(rockY(x, z), sandY(x, z));

// a shared underwater uniform set (one per canvas)
export const useWater = (t: number) => {
  const U = useMemo(() => underwaterUniforms(WATER, {value: 0}, SURFACE_Y), []);
  U.uTime.value = t;
  return U;
};

const reefRockMaterial = (U: UnderU) => {
  const m = new THREE.MeshStandardMaterial({roughness: 0.9});
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRW;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvRW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vRW;\n${N3}\n${REEF_COLOR}`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4(reefColor(vRW), opacity);');
  };
  m.customProgramCacheKey = () => 'reef-rock';
  return withUnderwater(m, U, 'reefrock');
};
const sandMaterial = (U: UnderU) => {
  const m = new THREE.MeshStandardMaterial({roughness: 1, color: '#cdbd98'});
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSW;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvSW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vSW;\n${N3}`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', `float rip = 0.5 + 0.5 * sin(vSW.x * 9.0 + vn3(vec3(vSW.xz * 1.5, 0.0)) * 6.0);
        vec4 diffuseColor = vec4(diffuse * (0.86 + 0.14 * rip) * (0.9 + 0.2 * vn3(vec3(vSW.xz * 30.0, 1.0))), opacity);`);
  };
  m.customProgramCacheKey = () => 'reef-sand';
  return withUnderwater(m, U, 'sand');
};

const slabGeometry = () => {
  const n = 220, size = 2.8, g = new THREE.PlaneGeometry(size, size, n, n); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.max(rockY(x, z), SAND_Y - 0.1)); }
  g.computeVertexNormals(); return g;
};
const sandGeometry = () => {
  const g = new THREE.PlaneGeometry(70, 70, 120, 120); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setY(i, sandY(p.getX(i), p.getZ(i)));
  g.computeVertexNormals(); return g;
};
// branching coral: tapered tubes forking upward, merged
const branchCoral = (seed: number, depth = 4) => {
  const parts: THREE.BufferGeometry[] = [];
  let s = seed * 7919;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const grow = (p: THREE.Vector3, d: THREE.Vector3, len: number, r: number, depth: number) => {
    const end = p.clone().addScaledVector(d, len);
    const g = new THREE.CylinderGeometry(r * 0.7, r, len, 7, 1); g.translate(0, len / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d)); g.translate(p.x, p.y, p.z);
    parts.push(g);
    const tip = new THREE.SphereGeometry(r * 0.7, 7, 5); tip.translate(end.x, end.y, end.z); parts.push(tip);
    if (depth <= 0) return;
    for (let k = 0; k < 2 + (rnd() < 0.4 ? 1 : 0); k++) {
      const nd = d.clone().add(new THREE.Vector3(rnd() - 0.5, rnd() * 0.3, rnd() - 0.5).multiplyScalar(1.2)).normalize();
      if (nd.y < 0.25) nd.y = 0.25;
      grow(end.clone().addScaledVector(d, -r * 0.5), nd.normalize(), len * (0.65 + rnd() * 0.2), r * 0.72, depth - 1);
    }
  };
  grow(new THREE.Vector3(0, -0.05, 0), new THREE.Vector3(0, 1, 0), depth > 4 ? 0.12 : 0.16, depth > 4 ? 0.018 : 0.025, depth);
  const merged = mergeAll(parts); parts.forEach((g) => g.dispose()); return merged;
};
const mergeAll = (gs: THREE.BufferGeometry[]) => {
  let n = 0, ni = 0; gs.forEach((g) => { n += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), idx: number[] = [];
  let o = 0;
  gs.forEach((g) => { const gg = g.index ? g : g; pos.set(gg.attributes.position.array as Float32Array, o * 3); nor.set(gg.attributes.normal.array as Float32Array, o * 3);
    if (gg.index) for (let i = 0; i < gg.index.count; i++) idx.push(gg.index.getX(i) + o); o += gg.attributes.position.count; });
  const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); m.setIndex(idx);
  return m;
};
// brain coral: a squashed dome with meandering grooves (shader)
const brainMaterial = (U: UnderU, color: string) => {
  const m = new THREE.MeshStandardMaterial({roughness: 0.8, color});
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vBP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvBP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vBP;\n${N3}`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', `float gr = abs(sin(vBP.x * 70.0 + vn3(vBP * 9.0) * 14.0 + vBP.z * 30.0 + vn3(vBP * 3.0) * 6.0));
        vec4 diffuseColor = vec4(diffuse * mix(0.55, 1.05, smoothstep(0.15, 0.6, gr)) * (0.85 + 0.3 * vn3(vBP * 40.0)), opacity);`);
  };
  m.customProgramCacheKey = () => 'brain-' + color;
  return withUnderwater(m, U, 'brain' + color);
};
// sea fan: a flat lattice (alpha from a net pattern)
const fanMaterial = (U: UnderU) => {
  const m = new THREE.MeshStandardMaterial({color: '#8b3b7e', roughness: 0.8, side: THREE.DoubleSide, alphaTest: 0.5});
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vFU;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvFU = uv;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec2 vFU;\n${N3}`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', `vec2 c = vFU - vec2(0.5, 0.0); float r = length(c * vec2(1.0, 0.8));
        float net = max(smoothstep(0.82, 0.95, abs(sin((vFU.x + vn3(vec3(vFU * 8.0, 1.0)) * 0.05) * 90.0))), smoothstep(0.86, 0.97, abs(sin((vFU.y + vn3(vec3(vFU * 7.0, 3.0)) * 0.04) * 70.0))));
        float a = net * step(r, 0.5) * step(0.0, vFU.y);
        vec4 diffuseColor = vec4(diffuse, a);`);
  };
  m.customProgramCacheKey = () => 'fan';
  return withUnderwater(m, U, 'fan');
};

// layout of the props (metres; the octopus sits near the origin on the slab)
const BRAINS = [[-1.25, -0.4, 0.42, '#a8865a'], [1.35, -0.9, 0.5, '#9a8a5c'], [-0.4, -1.9, 0.6, '#a87a54'], [2.4, 0.6, 0.38, '#b08a60'], [-2.6, -1.2, 0.55, '#a07a52'], [0.3, 1.9, 0.45, '#9e8458']] as const;
const BRANCHES = [[0.95, -1.15, 1.3, '#c97a58'], [-1.45, 0.25, 1.0, '#b86a8a'], [1.5, 0.75, 0.9, '#d6a05a'], [-1.0, -1.3, 1.1, '#d69a6a'], [1.9, -1.8, 1.6, '#c5845e'], [-2.0, -0.2, 1.2, '#cf8d6c'], [0.2, -2.6, 1.8, '#c07a5a'], [2.8, -0.4, 1.3, '#d0956c']] as const;
const FANS = [[-0.7, -2.2, 1.4, 0.4], [1.6, -2.6, 1.7, -0.5], [-2.3, -2.4, 1.5, 0.9]] as const;
const SPONGES = [[-1.5, 0.6, 0.9], [1.2, 0.9, 0.7], [2.2, -1.2, 1.0]] as const;
const ROCKS = [[-1.7, 0.9, 0.35], [1.7, 0.2, 0.3], [-0.6, 1.4, 0.25], [0.9, 1.6, 0.3], [-2.8, 0.6, 0.5], [3.0, -1.8, 0.6]] as const;

export const Reef: React.FC<{t: number; U: UnderU; fish?: boolean}> = ({t, U, fish = true}) => {
  const {scene} = useThree();
  const M = useMemo(() => {

    const tufts = Array.from({length: 4}, (_, i) => tuft({seed: i + 3, blades: 9, width: 0.012, segments: 6, spread: 0.08, curl: 0.6}));
    return {
      slab: slabGeometry(), sand: sandGeometry(), rockM: reefRockMaterial(U), sandM: sandMaterial(U),
      brains: BRAINS.map((b) => brainMaterial(U, b[3])), branches: BRANCHES.map((b, i) => ({g: branchCoral(i + 2), m: withUnderwater(new THREE.MeshStandardMaterial({color: b[3], roughness: 0.75}), U, 'br' + i)})),
      fanG: [branchCoral(11, 6), branchCoral(13, 6)], fanM: withUnderwater(new THREE.MeshStandardMaterial({color: '#8e3f86', roughness: 0.8}), U, 'fanm'), sponge: withUnderwater(new THREE.MeshStandardMaterial({color: '#d97a2b', roughness: 0.85, side: THREE.DoubleSide}), U, 'sponge'),
      stones: [1, 2, 3, 4].map((s) => rockGeo({seed: s, size: [1, 0.6, 0.85], detail: 3})),
      tufts, tuftM: withUnderwater(new THREE.MeshStandardMaterial({color: '#6f7a36', roughness: 0.8, side: THREE.DoubleSide}), U, 'tuft'),
      fishG: (() => { const g = new THREE.SphereGeometry(1, 10, 6); g.scale(1, 0.45, 0.22); const tail = new THREE.ConeGeometry(0.45, 0.7, 4); tail.rotateZ(Math.PI / 2); tail.translate(-1.2, 0, 0); tail.scale(1, 1, 0.3);
        const m = mergeAll([g.toNonIndexed().attributes.normal ? g : g, tail]); return m; })(),
      fishM: withUnderwater(new THREE.MeshStandardMaterial({color: '#f2c84b', roughness: 0.4, metalness: 0.1}), U, 'fish'),
      fish2M: withUnderwater(new THREE.MeshStandardMaterial({color: '#6fb6e8', roughness: 0.4, metalness: 0.1}), U, 'fish2'),
    };
  }, []);
  const sway = (i: number) => 0.18 * Math.sin(t * 1.1 + i * 1.9);
  return (
    <>
      <hemisphereLight args={['#bfefff', '#5a6a55', 1.25]} />
      <directionalLight position={[0.6, 8, 1.4]} intensity={2.1} color="#fff3d8" />
      <mesh geometry={M.sand} material={M.sandM} />
      <mesh geometry={M.slab} material={M.rockM} />
      {BRAINS.map((b, i) => <mesh key={i} position={[b[0], sandY(b[0], b[1]) - b[2] * 0.2, b[1]]} scale={[b[2], b[2] * 0.62, b[2] * 0.9]} material={M.brains[i]}><sphereGeometry args={[1, 48, 32]} /></mesh>)}
      {BRANCHES.map((b, i) => <mesh key={i} geometry={M.branches[i].g} material={M.branches[i].m} position={[b[0], sandY(b[0], b[1]), b[1]]} scale={b[2]} rotation={[0, i * 1.3, 0]} />)}
      {FANS.map((f, i) => <mesh key={i} geometry={M.fanG[i % 2]} material={M.fanM} position={[f[0], sandY(f[0], f[1]) - 0.05, f[1]]} rotation={[sway(i) * 0.15, f[3], sway(i + 4) * 0.1]} scale={[f[2] * 1.1, f[2] * 1.2, f[2] * 0.08]} />)}
      {SPONGES.map((s, i) => <group key={i} position={[s[0], sandY(s[0], s[1]) - 0.02, s[1]]} scale={s[2]}>
        {[0, 1, 2].map((k) => <mesh key={k} position={[(k - 1) * 0.09, 0.15 + k * 0.03, (k % 2) * 0.07]} material={M.sponge}><cylinderGeometry args={[0.055, 0.045, 0.3 + k * 0.06, 14, 1, true]} /></mesh>)}
      </group>)}
      {ROCKS.map((r, i) => <mesh key={i} geometry={M.stones[i % 4]} position={[r[0], groundY(r[0], r[1]) - r[2] * 0.15, r[1]]} scale={r[2]} rotation={[0, i * 2.1, 0]} material={M.rockM} />)}
      {Array.from({length: 26}, (_, i) => {
        const a = i * 2.39996, rr = 0.75 + (i % 7) * 0.12, x = Math.cos(a) * rr * 1.1, z = Math.sin(a) * rr * 0.9 - 0.1;
        return <mesh key={i} geometry={M.tufts[i % 4]} material={M.tuftM} position={[x, groundY(x, z) - 0.01, z]} rotation={[sway(i) * 0.4, i, sway(i + 2) * 0.4]} scale={0.18 + (i % 3) * 0.06} />;
      })}
      {fish && Array.from({length: 14}, (_, i) => {
        // a loose school circling behind the reef
        const ph = t * 0.22 + i * 0.37, R = 3.2 + (i % 4) * 0.3, y = 1.0 + (i % 5) * 0.18 + 0.1 * Math.sin(t + i);
        const x = Math.cos(ph) * R, z = -2.4 + Math.sin(ph) * R * 0.5;
        return <mesh key={i} geometry={M.fishG} material={i % 3 ? M.fishM : M.fish2M} position={[x, y, z]} rotation={[0, -ph - Math.PI / 2 + 0.25 * Math.sin(t * 6 + i), 0]} scale={0.055 + (i % 3) * 0.01} />;
      })}
      <UnderwaterSet center={new THREE.Vector3(0, 0.5, 0)} surfaceY={SURFACE_Y} preset={WATER} t={t} flow={new THREE.Vector3(0.12, 0.02, 0.05)} sky="#cfefff" />
    </>
  );
};
