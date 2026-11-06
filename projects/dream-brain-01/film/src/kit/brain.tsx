// The brain at night: a translucent folded shell whose traffic of light runs along the folds like car lights in a city,
// the parts the film visits (brainstem, seeing parts, feelings part, front, memory parts), the eyes, the spinal cord with
// the barrier that keeps the muscles still. Units: brain ~2.6 long. Front = -x, top = +y, left/right = z.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {C, glowTex, rnd} from './shared';

// The fold field and the shell shape, shared by the mesh and the trails so trails sit on the surface.
const fold = (v: THREE.Vector3) => 0.075 * Math.sin(9 * v.x + 3 * Math.sin(7 * v.y)) * Math.sin(8 * v.y + 4 * v.z) + 0.03 * Math.sin(17 * v.z + 11 * v.x);
export const shell = (v: THREE.Vector3, out = new THREE.Vector3()) => {
  let x = v.x * 1.28, y = v.y * 0.98, z = v.z * 1.02;
  if (y < 0) y *= 0.78;
  if (x < -0.6 && y < -0.1) y *= 0.85; // flatter under the front
  const gap = Math.exp(-Math.pow(v.z / 0.06, 2)) * 0.12 * Math.max(0, v.y + 0.25);
  const s = 1 + fold(v) - gap;
  return out.set(x * s, y * s, z * s);
};

// Region centres (brain units) and their reach.
export const REG = {
  front: new THREE.Vector3(-1.05, 0.35, 0), back: new THREE.Vector3(0.95, -0.25, 0), feel: new THREE.Vector3(-0.35, -0.42, 0.42),
  memory: new THREE.Vector3(0.1, -0.3, 0.5), stem: new THREE.Vector3(0.3, -0.75, 0),
};
export type Levels = {all: number; front: number; back: number; feel: number; memory: number; stem: number; awake: number};

const trailVS = `
attribute float u; attribute float off; attribute vec4 reg; attribute float spd;
uniform float uTime; uniform vec4 uLv; uniform float uAll; uniform float uAwake;
varying float vA; varying vec3 vC;
void main(){
  float d = fract(u * 3.0 - uTime * spd + off);
  float head = smoothstep(0.0, 0.06, d) * (1.0 - smoothstep(0.06, 0.32, d));
  float lv = uAll + dot(reg, uLv);
  vA = head * lv;
  vec3 base = mix(vec3(0.56,0.70,1.0), vec3(1.0,0.86,0.62), reg.y * uLv.y);
  base = mix(base, vec3(1.0,0.3,0.42), reg.z * uLv.z);
  base = mix(base, vec3(0.42,0.44,0.53), reg.x * (1.0 - clamp(uLv.x * 3.0, 0.0, 1.0)) * (1.0 - uAll));
  vC = mix(base, vec3(1.0), uAwake * 0.6);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const trailFS = `varying float vA; varying vec3 vC; void main(){ gl_FragColor = vec4(vC * vA * 1.6, vA); }`;

export const Brain: React.FC<{t: number; lv: Levels; shellOpacity?: number}> = ({t, lv, shellOpacity = 0.7}) => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 200, 150), p = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3(), o = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); shell(v, o); p.setXYZ(i, o.x, o.y, o.z); }
    g.computeVertexNormals(); return g;
  }, []);
  // trails: smooth random walks over the sphere, mapped onto the shell, as line segments with a moving bright head
  const trails = useMemo(() => {
    const pos: number[] = [], u: number[] = [], off: number[] = [], reg: number[] = [], spd: number[] = [];
    const N = 300, S = 48, v = new THREE.Vector3(), o = new THREE.Vector3(), dir = new THREE.Vector3(), tmp = new THREE.Vector3();
    const w = (p: THREE.Vector3, c: THREE.Vector3, r: number) => Math.exp(-p.distanceToSquared(new THREE.Vector3(c.x, c.y, Math.sign(p.z || 1) * Math.abs(c.z))) / (r * r));
    for (let k = 0; k < N; k++) {
      v.set(rnd('tx' + k) * 2 - 1, rnd('ty' + k) * 2 - 1, rnd('tz' + k) * 2 - 1).normalize();
      dir.set(rnd('dx' + k) - 0.5, rnd('dy' + k) - 0.5, rnd('dz' + k) - 0.5).cross(v).normalize();
      const of = rnd('of' + k), sp = 0.18 + rnd('sp' + k) * 0.25; let prev: THREE.Vector3 | null = null;
      for (let s = 0; s < S; s++) {
        tmp.set(rnd(`a${k}-${s}`) - 0.5, rnd(`b${k}-${s}`) - 0.5, rnd(`c${k}-${s}`) - 0.5).multiplyScalar(0.28);
        dir.add(tmp).projectOnPlane(v).normalize();
        v.addScaledVector(dir, 0.035).normalize();
        const q = shell(v, o).clone().multiplyScalar(1.006);
        if (prev) {
          for (const [pp, uu] of [[prev, (s - 1) / S], [q, s / S]] as [THREE.Vector3, number][]) {
            pos.push(pp.x, pp.y, pp.z); u.push(uu); off.push(of); spd.push(sp);
            reg.push(w(pp, REG.front, 0.6), w(pp, REG.back, 0.65), w(pp, REG.feel, 0.45), w(pp, REG.memory, 0.5));
          }
        }
        prev = q;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('u', new THREE.Float32BufferAttribute(u, 1));
    g.setAttribute('off', new THREE.Float32BufferAttribute(off, 1)); g.setAttribute('reg', new THREE.Float32BufferAttribute(reg, 4)); g.setAttribute('spd', new THREE.Float32BufferAttribute(spd, 1));
    const m = new THREE.ShaderMaterial({vertexShader: trailVS, fragmentShader: trailFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {uTime: {value: 0}, uLv: {value: new THREE.Vector4()}, uAll: {value: 0}, uAwake: {value: 0}}});
    return {g, m};
  }, []);
  trails.m.uniforms.uTime.value = t; trails.m.uniforms.uAll.value = lv.all; trails.m.uniforms.uAwake.value = lv.awake;
  (trails.m.uniforms.uLv.value as THREE.Vector4).set(lv.front, lv.back, lv.feel, lv.memory);
  const glow = glowTex();
  const G = ({p, c, s, o}: {p: [number, number, number]; c: string; s: number; o: number}) => o > 0.01 ? (
    <sprite position={p} scale={[s, s, s]}><spriteMaterial map={glow} color={c} transparent opacity={Math.min(1, o)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></sprite>) : null;
  // the hippocampus: a curved tube, one each side
  const hippo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.3, -0.42, 0), new THREE.Vector3(0.0, -0.36, 0.05), new THREE.Vector3(0.3, -0.22, 0.02), new THREE.Vector3(0.48, -0.02, -0.05)]), 40, 0.035, 10), []);
  const stemG = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.12, -0.35, 0), new THREE.Vector3(0.3, -0.8, 0), new THREE.Vector3(0.42, -1.25, 0), new THREE.Vector3(0.45, -1.7, 0)]), 40, 0.13, 20), []);
  const cordG = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.45, -1.7, 0), new THREE.Vector3(0.5, -3, 0), new THREE.Vector3(0.48, -5, 0), new THREE.Vector3(0.45, -8, 0)]), 60, 0.1, 14), []);
  const cereb = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 96, 64), p = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const s = 1 + 0.04 * Math.sin(v.y * 40); p.setXYZ(i, v.x * 0.42 * s, v.y * 0.3 * s, v.z * 0.62 * s); }
    g.computeVertexNormals(); return g;
  }, []);
  const tissue = <meshPhysicalMaterial color="#2a3570" emissive={C.rest} emissiveIntensity={0.22 + 0.25 * lv.all} roughness={0.3} clearcoat={1} sheen={1} sheenColor="#8fb4ff" transparent opacity={shellOpacity} depthWrite={false} />;
  const sides = [-1, 1];
  return (
    <group>
      <mesh geometry={geo} renderOrder={2}>{tissue}</mesh>
      <lineSegments geometry={trails.g} material={trails.m} renderOrder={3} />
      <mesh geometry={cereb} position={[0.92, -0.62, 0]} renderOrder={2}>{tissue}</mesh>
      <mesh geometry={stemG}><meshStandardMaterial color="#1d2552" emissive={C.gold} emissiveIntensity={0.9 * lv.stem} roughness={0.5} /></mesh>
      <mesh geometry={cordG}><meshStandardMaterial color="#1d2552" emissive={C.rest} emissiveIntensity={0.25} roughness={0.5} /></mesh>
      {sides.map((s) => (
        <group key={s}>
          <mesh geometry={hippo} position={[0, 0, s * 0.48]} scale={[1, 1, s]}><meshStandardMaterial color="#1d2552" emissive={C.past} emissiveIntensity={Math.max(0, lv.memory - 0.25) * 1.4} /></mesh>
          <mesh position={[REG.feel.x, REG.feel.y, s * REG.feel.z]} scale={[0.13, 0.1, 0.1]}><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color="#3a1830" emissive={C.red} emissiveIntensity={0.15 + 2.2 * lv.feel} /></mesh>
          <G p={[REG.feel.x, REG.feel.y, s * REG.feel.z]} c={C.red} s={0.35 + 0.5 * lv.feel} o={lv.feel * 0.9} />
          <G p={[REG.back.x, REG.back.y, s * 0.55]} c={C.gold} s={1.2} o={lv.back * 0.75} />
          <G p={[REG.front.x, REG.front.y, s * 0.45]} c={lv.front > 0.5 ? C.trail : C.quiet} s={1.1} o={0.12 + lv.front * 0.5} />
          <G p={[0.1, -0.25, s * 0.48]} c={C.past} s={0.6} o={lv.memory * 0.8} />
          {/* the eyes, in front of the brain, with the nerve back to it */}
          <mesh position={[-1.62, -0.38, s * 0.42]}><sphereGeometry args={[0.2, 32, 24]} /><meshPhysicalMaterial color="#c9d3f2" roughness={0.25} clearcoat={1} emissive="#33407a" emissiveIntensity={0.3} /></mesh>
        </group>
      ))}
      <G p={[0.32, -0.9, 0]} c={C.gold} s={0.9 + 0.8 * lv.stem} o={lv.stem} />
      <pointLight position={[0.3, -0.9, 0.6]} color={C.gold} intensity={3 * lv.stem} distance={3} decay={1.5} />
      <pointLight position={[1.0, -0.2, 1.0]} color={C.gold} intensity={2.5 * lv.back} distance={3} decay={1.5} />
      <pointLight position={[-0.35, -0.42, 0.8]} color={C.red} intensity={3 * lv.feel} distance={2.5} decay={1.5} />
    </group>
  );
};
