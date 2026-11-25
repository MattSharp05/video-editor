// The brain at night: a real cortex (BodyParts3D 4.0, CC BY 4.0, (c) The Database Center for Life Science; built by
// data/build_brain.py into public/brain.glb, one mesh per region) whose folds carry streams of light like traffic in a
// city at night, plus the parts the film visits: brainstem, seeing parts, feelings part (amygdala), front, memory
// parts, the eyes and the spinal cord. Units: brain ~2.6 long. Front = -x, top = +y, left/right = z.
import React, {useMemo, useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {continueRender, delayRender, staticFile} from 'remotion';
import {C, glowTex} from './shared';
import {anchorFromEnd, checkJoints} from './joints';

export type Levels = {all: number; front: number; back: number; feel: number; memory: number; stem: number; awake: number};
type Parts = {geo: Record<string, THREE.BufferGeometry>; at: Record<string, THREE.Vector3>; box: THREE.Box3; cordPts: THREE.Vector3[]};

// ---- load once, hold the frame until it's there ----
let parts: Parts | null = null, pending: Promise<Parts> | null = null;
const load = () => (pending ??= new Promise<Parts>((res) => {
  new GLTFLoader().load(staticFile('brain.glb'), (g) => {
    const geo: Record<string, THREE.BufferGeometry> = {}, box = new THREE.Box3();
    g.scene.updateMatrixWorld(true);
    g.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) { const m = o as THREE.Mesh; const gg = m.geometry.clone().applyMatrix4(m.matrixWorld); gg.computeVertexNormals(); geo[m.name] = gg; gg.computeBoundingBox(); box.union(gg.boundingBox!); } });
    const ctr = (k: string) => geo[k].boundingBox!.getCenter(new THREE.Vector3());
    // the spinal cord leaves the brainstem's real cut end (assembly.md: anchor on the surface, never the bounding box)
    const end = anchorFromEnd(geo.stem, new THREE.Vector3(0, -1, 0));
    const cordPts = [end.at(-0.08), end.at(0.25), end.at(0.25).add(new THREE.Vector3(0, -1.0, 0)), end.at(0.25).add(new THREE.Vector3(0, -6.0, 0))];
    const stem = geo.stem.boundingBox!, hip = geo.memory.boundingBox!, fr = geo.front.boundingBox!, see = geo.seeing.boundingBox!;
    const at = {
      stemTop: new THREE.Vector3(ctr('stem').x, stem.max.y - 0.1, 0), stemBottom: end.at(0.25), stemEnd: end.point, cordR: new THREE.Vector3(end.radius * 0.9, 0, 0),
      memory: ctr('memory'), front: ctr('front'), seeing: new THREE.Vector3(see.max.x - 0.25, see.min.y + 0.35, 0),
      // the amygdala sits just in front of the hippocampus, deep in each temporal lobe
      feel: new THREE.Vector3(hip.min.x + 0.02, hip.min.y + 0.1, Math.max(Math.abs(hip.min.z), Math.abs(hip.max.z)) * 0.7),
      eye: new THREE.Vector3(fr.min.x - 0.06, fr.min.y - 0.14, 0.4),
      model: new THREE.Vector3(ctr('cortex').x, ctr('cortex').y + 0.05, 0),
      centre: box.getCenter(new THREE.Vector3()),
    };
    res(parts = {geo, at, box, cordPts});
  });
}));
export const useBrainParts = () => {
  const [p, set] = useState<Parts | null>(parts);
  useState(() => { if (!parts) { const h = delayRender('brain.glb'); load().then((x) => { set(x); continueRender(h); }); } return 0; });
  return p;
};

// ---- the cortex material: standard lighting + streams of light along noise contours (they wrap over the folds)
// + a region glow + a rim. All stateless: a function of uTime only.
const NOISE = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+2.0*C.xxx;vec3 x3=x0-1.0+3.0*C.xxx;
i=mod(i,289.0);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
float n_=1.0/7.0;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;
vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;
type U = {uTime: {value: number}; uStreak: {value: number}; uStreakC: {value: THREE.Color}; uGlow: {value: number}; uGlowC: {value: THREE.Color}; uRim: {value: number}; uSeed: {value: number}};
const cortexMat = (base: string, seed: number) => {
  const u: U = {uTime: {value: 0}, uStreak: {value: 0}, uStreakC: {value: new THREE.Color(C.trail)}, uGlow: {value: 0}, uGlowC: {value: new THREE.Color(C.gold)}, uRim: {value: 0.6}, uSeed: {value: seed}};
  const m = new THREE.MeshStandardMaterial({color: base, roughness: 0.55, metalness: 0});
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    // the noise is evaluated per vertex (the cortex is dense), only the thin band is shaped per pixel
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\nuniform float uTime,uSeed;varying float vN,vSpark;\n${NOISE}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vN = snoise(position * 2.2 + uSeed) + 0.35 * snoise(position * 5.0 - uSeed);
        vSpark = pow(max(0.0, snoise(position * 9.0 + vec3(0.0, uTime * 0.8, 0.0))), 3.0);`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying float vN,vSpark;\nuniform float uTime,uStreak,uGlow,uRim,uSeed;uniform vec3 uStreakC,uGlowC;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float band = fract(vN * 3.0 - uTime * 0.35);
        float head = smoothstep(0.0, 0.025, band) * (1.0 - smoothstep(0.025, 0.11, band));
        float spark = vSpark;
        totalEmissiveRadiance += uStreakC * (head * 1.6 + spark * 0.9) * uStreak;
        totalEmissiveRadiance += uGlowC * uGlow;
        float fr = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 2.5);
        totalEmissiveRadiance += vec3(0.25, 0.35, 0.9) * fr * uRim;`);
  };
  return {m, u};
};

export const Brain: React.FC<{t: number; lv: Levels; clear?: number}> = ({t, lv, clear = 0}) => {
  const P = useBrainParts();
  const mats = useMemo(() => ({
    cortex: cortexMat('#232c5c', 0.0), front: cortexMat('#232c5c', 3.1), seeing: cortexMat('#232c5c', 5.7),
    memory: cortexMat('#2a2550', 8.3), cereb: cortexMat('#1e2854', 11.0), stem: cortexMat('#1d2552', 13.0),
  }), []);
  const cord = useMemo(() => {
    if (!P) return null;
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P.cordPts, false, 'centripetal'), 80, P.at.cordR.x, 16);
    checkJoints([{name: 'brainstem-cord', a: g, b: P.geo.stem, maxGap: 0.002}]);
    return g;
  }, [P]);
  if (!P) return null;
  Object.values(mats).forEach(({m}) => { m.transparent = clear > 0.01; m.opacity = 1 - 0.78 * clear; m.depthWrite = clear < 0.01; });
  const w = lv.awake, base = 0.55 * lv.all;
  const set = (k: keyof typeof mats, streak: number, glow: number, glowC: string, streakC = C.trail) => {
    const u = mats[k].u; u.uTime.value = t; u.uStreak.value = streak; u.uGlow.value = glow; (u.uGlowC.value as THREE.Color).set(glowC);
    (u.uStreakC.value as THREE.Color).set(streakC).lerp(new THREE.Color('#ffffff'), w * 0.6);
  };
  set('cortex', base + w * 0.6, 0.02, C.rest);
  set('front', (lv.front > 0.5 ? base : base * lv.front * 2) + w * 0.6, 0.0, C.quiet, lv.front < 0.3 && w < 0.5 ? C.quiet : C.trail);
  set('seeing', base + lv.back * 1.1 + w * 0.6, lv.back * 0.08, C.gold, lv.back > 0.3 ? C.gold : C.trail);
  set('memory', base + lv.memory * 0.9, Math.max(0, lv.memory - 0.25) * 0.12, C.past, C.past);
  set('cereb', base * 0.7 + w * 0.4, 0.0, C.rest);
  set('stem', base * 0.4 + lv.stem * 1.3, lv.stem * 0.1, C.gold, C.gold);
  const glow = glowTex();
  const G = ({p, c, s, o, top}: {p: THREE.Vector3; c: string; s: number; o: number; top?: boolean}) => o > 0.01 ? (
    <sprite position={p} scale={[s, s, s]} renderOrder={top ? 10 : 0}><spriteMaterial map={glow} color={c} transparent opacity={Math.min(1, o)} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={!top} toneMapped={false} /></sprite>) : null;
  const {at} = P;
  return (
    <group>
      {(Object.keys(mats) as (keyof typeof mats)[]).map((k) => <mesh key={k} geometry={P.geo[k]} material={mats[k].m} />)}
      {cord && <mesh geometry={cord}><meshStandardMaterial color="#2a3570" emissive={C.rest} emissiveIntensity={0.15} roughness={0.4} /></mesh>}
      {[-1, 1].map((s) => (
        <group key={s}>
          {/* the feelings part and the memory parts glow through the cortex when they are busy */}
          <G p={new THREE.Vector3(at.feel.x, at.feel.y, s * at.feel.z)} c={C.red} s={0.3 + 0.45 * lv.feel} o={lv.feel * 0.95} top />
          <G p={new THREE.Vector3(at.memory.x, at.memory.y, s * Math.abs(at.memory.z))} c={C.past} s={0.7} o={Math.max(0, lv.memory - 0.25) * 0.9} top />
          <G p={new THREE.Vector3(at.seeing.x, at.seeing.y, s * 0.45)} c={C.gold} s={1.1} o={lv.back * 0.55} />
          <mesh position={[at.eye.x, at.eye.y, s * at.eye.z]}><sphereGeometry args={[0.17, 32, 24]} /><meshPhysicalMaterial color="#c9d3f2" roughness={0.25} clearcoat={1} emissive="#33407a" emissiveIntensity={0.3} /></mesh>
        </group>
      ))}
      <G p={at.stemTop.clone().add(new THREE.Vector3(0, -0.25, 0))} c={C.gold} s={0.8 + 0.8 * lv.stem} o={lv.stem} />
      <pointLight position={at.stemTop.clone().add(new THREE.Vector3(0, -0.3, 0.6))} color={C.gold} intensity={3 * lv.stem} distance={3} decay={1.5} />
    </group>
  );
};

// QA view of one assembly: the brainstem and the spinal cord that leaves its cut end (kit/qa.tsx).
export const StemCordQA: React.FC = () => {
  const P = useBrainParts();
  const cord = useMemo(() => P && new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P.cordPts.slice(0, 3), false, 'centripetal'), 60, P.at.cordR.x, 16), [P]);
  if (!P || !cord) return null;
  return (<><mesh geometry={P.geo.stem}><meshBasicMaterial /></mesh><mesh geometry={cord}><meshBasicMaterial /></mesh></>);
};
