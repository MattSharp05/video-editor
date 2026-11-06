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

export const Ocean: React.FC<{preset: WaterPreset; t: number; size?: number; res?: number; opts?: OceanOpts; position?: [number, number, number]}> = ({preset, t, size = 400, res = 256, opts = {}, position = [0, 0, 0]}) => {
  const uTime = useT(t); uTime.value = t;
  const geo = useMemo(() => oceanGeometry(size, res), [size, res]);
  const mat = useMemo(() => oceanMaterial(preset, uTime, opts), [preset, opts.envMap]);
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
  return <mesh geometry={geo} material={mat} />;
};
