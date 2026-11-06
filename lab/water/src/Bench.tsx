// Water lab: fixed test shots for the water kit (.claude/skills/animated-video/templates/parts/src/kit/water).
// Each shot is 3 s; units are metres; everything derives from the frame. Change the kit, re-render the bench, compare.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {PRESETS, WaterPreset} from '../../../.claude/skills/animated-video/templates/parts/src/kit/water/presets';
import {River, Ocean, Waterfall, UnderwaterSet, FloodFront} from '../../../.claude/skills/animated-video/templates/parts/src/kit/water/components';
import {withUnderwater, underwaterUniforms} from '../../../.claude/skills/animated-video/templates/parts/src/kit/water/underwater';
import {skyDome, skyEnvironment, SKY_DAY, SKY_LOW_SUN, SKY_FRONT, SkyColors} from '../../../.claude/skills/animated-video/templates/parts/src/kit/water/env';
import {stoneGeometry} from '../../../.claude/skills/animated-video/templates/parts/src/kit/terrain/look';

export const FPS = 30, DUR = 90;
export type ShotId = 'river-aerial' | 'river-bank' | 'rapids' | 'under-clear' | 'under-flood' | 'flood-front' | 'ocean-open' | 'ocean-shore' | 'waterfall';
export const SHOTS: {id: ShotId; title: string}[] = [
  {id: 'river-aerial', title: 'River from the air (clear green)'}, {id: 'river-bank', title: 'River at the bank'},
  {id: 'rapids', title: 'Rapids'}, {id: 'under-clear', title: 'Under clear water'}, {id: 'under-flood', title: 'Under a muddy flood'},
  {id: 'flood-front', title: 'Flood front in a dry gully'}, {id: 'ocean-open', title: 'Open ocean'}, {id: 'ocean-shore', title: 'Waves on a beach'},
  {id: 'waterfall', title: 'Waterfall'},
];

// ----- a valley with a meandering channel (river shots and the gully) -----
const zc = (x: number) => 18 * Math.sin(x / 38) + 6 * Math.sin(x / 13);
const bedY = (x: number, steep: number) => -x * steep;                // the channel falls toward +x
const n2 = (x: number, z: number) => Math.sin(x * 0.11 + Math.sin(z * 0.07) * 2) * Math.cos(z * 0.09 - x * 0.03);
const valleyY = (x: number, z: number, w: number, steep: number) => {
  const d = Math.abs(z - zc(x)), base = bedY(x, steep);
  if (d < w / 2) return base - 1.2 * (1 - (2 * d / w) ** 2);
  return base + Math.min(14, 0.5 * (d - w / 2) + 0.012 * (d - w / 2) ** 2) + n2(x, z) * 0.8 * Math.min(1, (d - w / 2) / 6);
};
const Ground: React.FC<{f: (x: number, z: number) => number; size: number; res?: number; tint?: 'valley' | 'sand' | 'gully'; center?: [number, number]}> = ({f, size, res = 220, tint = 'valley', center = [0, 0]}) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, res, res); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute, col = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + center[0], z = p.getZ(i) + center[1], y = f(x, z); p.setXYZ(i, x, y, z);
      const r = 0.5 + 0.5 * Math.sin(x * 1.7 + z * 2.3) * Math.cos(x * 0.9 - z * 1.3);
      if (tint === 'sand') c.set('#D9C4A0').lerp(new THREE.Color('#B89E78'), r * 0.5);
      else if (tint === 'gully') c.set('#A89A8E').lerp(new THREE.Color('#857A72'), r);   // pale rock, so muddy water reads
      else c.set('#A3A06A').lerp(new THREE.Color('#87925A'), r).lerp(new THREE.Color('#B09C7E'), Math.min(1, Math.max(0, y - 3) / 8));
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
  }, [size, res, tint]);
  return <mesh geometry={geo} receiveShadow><meshStandardMaterial vertexColors roughness={0.95} /></mesh>;
};
const channelPath = (x0: number, x1: number, steep: number, step = 2) => {
  const pts: THREE.Vector3[] = []; for (let x = x0; x <= x1; x += step) pts.push(new THREE.Vector3(x, bedY(x, steep), zc(x))); return pts;
};

// ----- shared sky, lights and camera -----
const Sky: React.FC<{c: SkyColors}> = ({c}) => {
  const {camera} = useThree(); const m = useMemo(() => skyDome(c), [c]);
  return <mesh position={camera.position} material={m} frustumCulled={false} renderOrder={-1}><sphereGeometry args={[900, 48, 24]} /></mesh>;
};
const Lights: React.FC<{c: SkyColors}> = ({c}) => (
  <>
    <hemisphereLight args={['#B8CBDD', '#8C7C64', 1.7]} />
    <directionalLight position={c.sunDir.clone().multiplyScalar(300).toArray()} intensity={2.4} color={c.sun} />
  </>
);
const Cam: React.FC<{from: [number, number, number]; to: [number, number, number]; drift?: [number, number, number]; t: number; fov?: number}> = ({from, to, drift = [0, 0, 0], t, fov = 45}) => {
  const {camera, gl} = useThree();
  camera.position.set(from[0] + drift[0] * t, from[1] + drift[1] * t, from[2] + drift[2] * t); camera.lookAt(to[0] + drift[0] * t, to[1] + drift[1] * t * 0.5, to[2] + drift[2] * t);
  const c = camera as THREE.PerspectiveCamera; c.fov = fov; c.near = 0.02; c.far = 2000; c.updateProjectionMatrix();
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0;
  return null;
};
const useEnv = (c: SkyColors) => { const {gl} = useThree(); return useMemo(() => skyEnvironment(gl, c), [gl, c]); };

// ----- scenes -----
const RiverScene: React.FC<{t: number; steep: number; preset: WaterPreset; cam: [number, number, number][]; drift: [number, number, number]; rocks?: boolean}> = ({t, steep, preset, cam, drift, rocks}) => {
  const env = useEnv(SKY_DAY); const w = 16;
  const path = useMemo(() => channelPath(-140, 140, steep), [steep]);
  const stones = useMemo(() => Array.from({length: 4}, (_, i) => stoneGeometry(i + 3)), []);
  return (
    <>
      <Sky c={SKY_DAY} /><Lights c={SKY_DAY} />
      <Cam from={cam[0]} to={cam[1]} drift={drift} t={t} />
      <Ground f={(x, z) => valleyY(x, z, w + 4, steep)} size={300} />
      <River path={path} preset={preset} t={t} opts={{width: w + 2, speed: 1.4, depth: 3, rapids: [0.01, 0.03], envMap: env}} lift={-0.35} />
      {rocks && Array.from({length: 14}, (_, i) => {
        const x = -20 + i * 5.3, side = i % 2 ? 1 : -1, z = zc(x) + side * (w / 2 - 0.5 - (i % 3) * 1.6), s = 0.5 + (i % 4) * 0.35;
        return <mesh key={i} geometry={stones[i % 4]} position={[x, bedY(x, steep) - 0.3, z]} scale={s} rotation={[0, i, 0]}><meshStandardMaterial color="#7C766C" roughness={0.8} /></mesh>;
      })}
    </>
  );
};

const UnderScene: React.FC<{t: number; preset: WaterPreset; moving: boolean}> = ({t, preset, moving}) => {
  const surfaceY = 1.6;
  const U = useMemo(() => underwaterUniforms(preset, {value: 0}, surfaceY), [preset]); U.uTime.value = t;
  const bed = useMemo(() => withUnderwater(new THREE.MeshStandardMaterial({color: moving ? '#B09070' : '#C8B48E', roughness: 0.95}), U, 'bed'), [U]);
  const rock = useMemo(() => withUnderwater(new THREE.MeshStandardMaterial({color: '#A89C8C', roughness: 0.6}), U, 'rock'), [U]);
  const stones = useMemo(() => Array.from({length: 6}, (_, i) => stoneGeometry(i + 1)), []);
  const {scene} = useThree(); scene.background = new THREE.Color(preset.haze);
  return (
    <>
      <Lights c={SKY_DAY} />
      <Cam from={[0, 0.55, 3.2]} to={[0, 0.7, -2]} drift={[0.15, 0, -0.2]} t={t} fov={55} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={bed}><planeGeometry args={[40, 40, 80, 80]} /></mesh>
      {Array.from({length: 22}, (_, i) => {
        const r = 0.08 + ((i * 37) % 11) / 11 * 0.22, lane = ((i * 17) % 13) / 13 - 0.5;
        const sp = moving ? 0.8 + ((i * 29) % 7) / 7 : 0, u = (((t * sp) / 8 + ((i * 53) % 29) / 29) % 1);
        const hop = moving ? Math.pow(Math.abs(Math.sin((u * 9 + i) * Math.PI)), 2) * r * 1.2 : 0;
        return <mesh key={i} geometry={stones[i % 6]} material={rock} position={[(u - 0.5) * 8, r * 0.34 + hop, lane * 5 - 1]} scale={r} rotation={[0, i, -u * 6]} />;
      })}
      <UnderwaterSet center={new THREE.Vector3(0, 0.6, -1)} surfaceY={surfaceY} preset={preset} t={t} flow={new THREE.Vector3(moving ? 1.8 : 0.25, 0.02, 0)} sky={SKY_DAY.horizon} />
    </>
  );
};

const arcTo = (path: THREE.Vector3[], x: number) => { let s = 0; for (let i = 1; i < path.length && path[i].x <= x; i++) s += path[i].distanceTo(path[i - 1]); return s; };
const FloodScene: React.FC<{t: number}> = ({t}) => {
  const steep = 0.03, w = 7;
  const path = useMemo(() => channelPath(-80, 120, steep, 1), []);
  return (
    <>
      <Sky c={SKY_LOW_SUN} /><Lights c={SKY_LOW_SUN} />
      <Cam from={[22, 26, zc(16) + 26]} to={[14, -16 * steep, zc(14)]} drift={[0.6, 0, 0]} t={t} />
      <Ground f={(x, z) => valleyY(x, z, w, steep)} size={260} tint="gully" center={[20, 0]} />
      {/* the front passes the camera's target (x = 16) mid-shot: distance along the winding path, not along x */}
      <FloodFront path={path} width={w + 2} front={arcTo(path, 16) - 12 + t * 7} preset={PRESETS.muddyFlood} t={t} height={1.8} />
    </>
  );
};

const OceanScene: React.FC<{t: number; shore: boolean}> = ({t, shore}) => {
  const c = shore ? SKY_DAY : SKY_LOW_SUN; const env = useEnv(c);
  const beach = shore ? {y0: -3, dir: 90, slope: 0.05} : null;
  return (
    <>
      <Sky c={c} /><Lights c={c} />
      {shore ? <Cam from={[0, 3.6, 67]} to={[0, 0, 18]} drift={[0.3, 0, 0]} t={t} /> : <Cam from={[0, 4, 30]} to={[0, 1, -60]} drift={[0, 0, -0.8]} t={t} />}
      {shore && <Ground f={(x, z) => -3 + z * 0.05} size={300} tint="sand" center={[0, 60]} />}
      <Ocean preset={shore ? PRESETS.tropical : PRESETS.deepOcean} t={t} size={shore ? 300 : 700} res={shore ? 220 : 256}
        opts={{height: shore ? 0.8 : 1.6, beach, envMap: env, sunDir: c.sunDir}} position={[0, 0, shore ? 0 : -150]} />
    </>
  );
};

const FallScene: React.FC<{t: number}> = ({t}) => {
  const env = useEnv(SKY_FRONT); const H = 24;
  const lip = useMemo(() => new THREE.Vector3(0, H, 0), []), dir = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const top = useMemo(() => Array.from({length: 30}, (_, i) => new THREE.Vector3(0, H, -60 + i * 2.05)), []);
  const cliff = useMemo(() => {
    const g = new THREE.BoxGeometry(60, H, 40, 60, 24, 4), p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (z > 19) p.setZ(i, z + Math.sin(x * 0.6 + y * 0.9) * 0.8 + Math.sin(y * 2.1) * 0.4); }
    g.computeVertexNormals(); return g;
  }, []);
  return (
    <>
      <Sky c={SKY_FRONT} /><Lights c={SKY_FRONT} />
      <Cam from={[16, 7, 44]} to={[0, 11, 4]} drift={[-0.4, 0.1, 0]} t={t} />
      <mesh geometry={cliff} position={[0, H / 2, -20.1]}><meshStandardMaterial color="#7A6E62" roughness={0.9} /></mesh>
      <Ground f={(x, z) => (Math.hypot(x, (z - 4) * 1.4) < 12 ? -1.2 : -1.2 + Math.min(4, (Math.hypot(x, (z - 4) * 1.4) - 12) * 0.4))} size={160} center={[0, 40]} />
      <mesh position={[0, -0.25, 6]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[13, 64]} /><meshStandardMaterial color={PRESETS.clearGreen.deep} roughness={0.08} envMap={env} envMapIntensity={0.9} /></mesh>
      <River path={top} preset={PRESETS.clearGreen} t={t} opts={{width: 7, speed: 2, depth: 1, envMap: env}} lift={0.05} />
      <Waterfall lip={lip} dir={dir} width={7} height={H + 0.3} preset={PRESETS.clearGreen} t={t} />
    </>
  );
};

const Scene: React.FC<{id: ShotId; t: number}> = ({id, t}) => {
  switch (id) {
    case 'river-aerial': return <RiverScene t={t} steep={0.004} preset={PRESETS.clearGreen} cam={[[-40, 55, 60], [10, 0, zc(10)]]} drift={[2, 0, 0]} />;
    case 'river-bank': return <RiverScene t={t} steep={0.004} preset={PRESETS.clearGreen} cam={[[-6, 1.6, zc(-6) + 9.5], [14, -0.4, zc(14)]]} drift={[0.3, 0, 0]} rocks />;
    case 'rapids': return <RiverScene t={t} steep={0.035} preset={PRESETS.clearGreen} cam={[[34, 1 - 34 * 0.035 + 2.2, zc(34) + 6], [6, -6 * 0.035, zc(6)]]} drift={[0, 0, 0]} rocks />;
    case 'under-clear': return <UnderScene t={t} preset={PRESETS.clearGreen} moving={false} />;
    case 'under-flood': return <UnderScene t={t} preset={PRESETS.muddyFlood} moving />;
    case 'flood-front': return <FloodScene t={t} />;
    case 'ocean-open': return <OceanScene t={t} shore={false} />;
    case 'ocean-shore': return <OceanScene t={t} shore />;
    case 'waterfall': return <FallScene t={t} />;
  }
};

export const Bench: React.FC<{id: ShotId}> = ({id}) => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: '#9DB4C8'}}>
      <ThreeCanvas width={1080} height={1920} gl={{antialias: true}} camera={{fov: 45, near: 0.02, far: 2000, position: [0, 5, 20]}}>
        <Scene id={id} t={t} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
