// React (react-three-fiber) components for the water kit. Every component takes `t` (seconds) and derives everything
// from it: no clocks, no accumulated state, so any frame renders the same alone. Units: metres.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {WaterPreset} from './presets';
import {riverGeometry, riverMaterial, RiverOpts} from './river';
import {oceanGeometry, oceanMaterial, OceanOpts} from './ocean';
import {waterfallGeometry, waterfallMaterial} from './waterfall';
import {floodGeometry, floodMaterial} from './flood';
import {siltPoints, siltMaterial, shaftMaterial, surfaceFromBelowMaterial} from './underwater';

// a point and direction at distance s along a path
const along = (path: THREE.Vector3[], s: number) => {
  let run = 0;
  for (let i = 1; i < path.length; i++) { const d = path[i].distanceTo(path[i - 1]);
    if (run + d >= s) { const k = (s - run) / d; return {p: path[i - 1].clone().lerp(path[i], k), dir: path[i].clone().sub(path[i - 1]).normalize()}; } run += d; }
  return {p: path[path.length - 1].clone(), dir: path[path.length - 1].clone().sub(path[path.length - 2]).normalize()};
};

const useT = (t: number) => useMemo(() => ({value: 0}), []);
let puff: THREE.Texture | null = null;
export const puffTexture = () => {
  if (puff) return puff;
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d')!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); puff = new THREE.CanvasTexture(c); return puff;
};

export const River: React.FC<{path: THREE.Vector3[]; preset: WaterPreset; t: number; opts: RiverOpts; lift?: number}> = ({path, preset, t, opts, lift = 0.05}) => {
  const uTime = useT(t); uTime.value = t;
  const geo = useMemo(() => riverGeometry(path, opts.width, {lift, mpu: opts.mpu}), [path, opts.width, lift, opts.mpu]);
  const mat = useMemo(() => riverMaterial(preset, uTime, opts), [preset, opts.envMap]);
  return <mesh geometry={geo} material={mat} receiveShadow />;
};

// envIntensity scales the sky reflection per frame (dim it as day turns to night)
export const Ocean: React.FC<{preset: WaterPreset; t: number; size?: number; res?: number; opts?: OceanOpts; position?: [number, number, number]; envIntensity?: number}> = ({preset, t, size = 400, res = 256, opts = {}, position = [0, 0, 0], envIntensity}) => {
  const uTime = useT(t); uTime.value = t;
  const geo = useMemo(() => oceanGeometry(size, res), [size, res]);
  const mat = useMemo(() => oceanMaterial(preset, uTime, opts), [preset, opts.envMap]);
  mat.envMapIntensity = preset.reflect * (envIntensity ?? 1);
  return <mesh geometry={geo} material={mat} position={position} frustumCulled={false} />;
};

// a falling sheet, white water at the lip, a churning plunge pool with rings, and mist rising from the impact
export const Waterfall: React.FC<{lip: THREE.Vector3; dir: THREE.Vector3; width: number; height: number; preset: WaterPreset; t: number}> = ({lip, dir, width, height, preset, t}) => {
  const uTime = useT(t); uTime.value = t;
  const geo = useMemo(() => waterfallGeometry(lip, dir, width, height), [lip, dir, width, height]);
  const mat = useMemo(() => waterfallMaterial(preset, uTime, height), [preset]);
  const T = Math.sqrt(2 * height / 9.81), d = dir.clone().setY(0).normalize();
  const foot = lip.clone().addScaledVector(d, 2.0 * T).add(new THREE.Vector3(0, -height, 0));
  const pool = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {uTime, uFoam: {value: new THREE.Color(preset.foam)}, uW: {value: width}},
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */`uniform float uTime, uW; uniform vec3 uFoam; varying vec2 vP;
      void main(){ float r = length(vP / vec2(uW * 0.75, uW * 0.45));
        float rings = 0.5 + 0.5 * sin(r * 14.0 - uTime * 5.0);
        float a = smoothstep(1.6, 0.2, r) * (0.55 + 0.45 * rings) * (0.6 + 0.4 * fract(sin(dot(floor(vP * 6.0 + uTime * 3.0), vec2(12.9, 78.2))) * 4e4));
        gl_FragColor = vec4(uFoam, clamp(a, 0.0, 0.95)); }`,
  }), [preset, width]);
  const mist = 40;
  return (
    <group>
      <mesh geometry={geo} material={mat} renderOrder={2} />
      <mesh position={[foot.x, foot.y + 0.05, foot.z]} rotation={[-Math.PI / 2, 0, 0]} material={pool} renderOrder={1}><planeGeometry args={[width * 3, width * 2]} /></mesh>
      {Array.from({length: mist}, (_, i) => {
        const ph = (t * 0.25 + i / mist) % 1, a = i * 2.399;
        const p = foot.clone().add(new THREE.Vector3(Math.cos(a) * width * (0.3 + ph), ph * height * 0.45, Math.sin(a) * width * 0.5 * (0.3 + ph)));
        return <sprite key={i} position={p} scale={width * (0.5 + ph * 1.4)}><spriteMaterial map={puffTexture()} color={preset.foam} transparent opacity={0.22 * Math.sin(ph * Math.PI)} depthWrite={false} /></sprite>;
      })}
    </group>
  );
};

// the underwater set around a centre: silt, light shafts from the surface, and the surface seen from below
export const UnderwaterSet: React.FC<{center: THREE.Vector3; surfaceY: number; preset: WaterPreset; t: number; flow?: THREE.Vector3; sky?: string}> = ({center, surfaceY, preset, t, flow, sky = '#CFE3EE'}) => {
  const uTime = useT(t); uTime.value = t;
  const silt = useMemo(() => siltPoints(Math.round(600 + 4000 * preset.silt)), [preset]);
  const sm = useMemo(() => siltMaterial(preset, uTime), [preset]);
  sm.uniforms.uCenter.value.copy(center); if (flow) sm.uniforms.uVel.value.copy(flow);
  const sh = useMemo(() => shaftMaterial(preset, uTime), [preset]);
  const surf = useMemo(() => surfaceFromBelowMaterial(preset, uTime, sky), [preset, sky]);
  return (
    <group>
      <points geometry={silt} material={sm} frustumCulled={false} />
      {preset.caustics > 0.05 && Array.from({length: 8}, (_, i) => (
        <mesh key={i} position={[center.x + (i - 4) * 0.9, (surfaceY + center.y) / 2, center.z - 2 + (i % 3)]} rotation={[0, i * 0.7, 0.25]} material={sh}>
          <planeGeometry args={[1.2, surfaceY - center.y + 2]} />
        </mesh>
      ))}
      <mesh position={[center.x, surfaceY, center.z]} rotation={[-Math.PI / 2, 0, 0]} material={surf}><planeGeometry args={[80, 80]} /></mesh>
    </group>
  );
};

export const FloodFront: React.FC<{path: THREE.Vector3[]; width: number; front: number; preset: WaterPreset; t: number; height?: number}> = ({path, width, front, preset, t, height = 1.5}) => {
  const uTime = useT(t); uTime.value = t;
  const uFront = useMemo(() => ({value: 0}), []); uFront.value = front;
  const geo = floodGeometry(path, width, front, height);
  const mat = useMemo(() => floodMaterial(preset, uTime, uFront, width), [preset, width]);
  const rocks = useMemo(() => Array.from({length: 4}, (_, i) => {
    const g = new THREE.IcosahedronGeometry(1, 1), p = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
    for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k); v.multiplyScalar(0.75 + 0.25 * Math.sin(v.x * 3 + i) * Math.cos(v.z * 2 - i)); v.y *= 0.7; p.setXYZ(k, v.x, v.y, v.z); }
    g.computeVertexNormals(); return g; }), []);
  return (
    <group>
      <mesh geometry={geo} material={mat} />
      {/* debris carried just behind the snout: rocks and branches tumbling, half sunk in the mud */}
      {Array.from({length: 12}, (_, i) => {
        const back = 1.5 + ((i * 37) % 11) / 11 * 9, lane = (((i * 17) % 13) / 13 - 0.5) * width * 0.6;
        if (front - back < 0) return null;
        const {p, dir} = along(path, front - back), side = new THREE.Vector3(-dir.z, 0, dir.x);
        const pos = p.clone().addScaledVector(side, lane).add(new THREE.Vector3(0, height * 0.75, 0));
        const stick = i % 4 === 3, s = stick ? 0.12 : 0.25 + (i % 3) * 0.15;
        return stick
          ? <mesh key={i} position={pos} rotation={[t * 1.5 + i, i, t * 0.7]}><cylinderGeometry args={[s, s * 0.8, 2.2, 6]} /><meshStandardMaterial color="#5A4630" roughness={0.9} /></mesh>
          : <mesh key={i} geometry={rocks[i % 4]} position={pos} scale={s} rotation={[t * 3 + i, i * 2, 0]}><meshStandardMaterial color="#7E6A58" roughness={0.85} /></mesh>;
      })}
      {/* spray and spatter thrown forward off the snout */}
      {front > 2 && Array.from({length: 16}, (_, i) => {
        const ph = (t * 1.6 + i / 16) % 1, {p, dir} = along(path, front - 0.5), side = new THREE.Vector3(-dir.z, 0, dir.x);
        const pos = p.clone().addScaledVector(dir, ph * 2.5).addScaledVector(side, Math.sin(i * 2.4) * width * 0.35).add(new THREE.Vector3(0, height * 0.6 + ph * 1.6 - ph * ph * 2.2, 0));
        return <sprite key={'s' + i} position={pos} scale={0.5 + ph * 1.2}><spriteMaterial map={puffTexture()} color={preset.foam} transparent opacity={0.5 * (1 - ph)} depthWrite={false} /></sprite>;
      })}
    </group>
  );
};
