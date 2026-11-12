// Hero-assets bench: one Sphere-like focal object (Las Vegas Sphere stand-in) in a dusk scene lit by the water kit's
// sky and PMREM environment (from moon-tides-01). The same shot renders the three.js version or a fitted .glb, so the
// proposal and the comparison stills are like for like.
//   npx remotion still src/index.ts Bench out/threejs-wide.png --props='{"variant":"threejs","angle":"wide"}'
//   npx remotion still src/index.ts Bench out/glb-wide.png --props='{"variant":"glb","angle":"wide","glb":"hero/P/placeholder.glb"}'
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {skyDome, skyEnvironment, type SkyColors} from './kit/water/env';
import {HeroModel, useGlb} from './kit/HeroModel';

export type BenchProps = {variant: 'threejs' | 'glb'; angle: 'wide' | 'close'; glb: string | null; light: 'keep' | 'neutralise'};
const SKY: SkyColors = {zenith: '#2E3F6E', horizon: '#E8A878', ground: '#4A3C34', sun: '#FFC890', sunDir: new THREE.Vector3(-0.62, 0.22, 0.75).normalize()};
const H = 112, W = 157; // the real Sphere: 112 m tall, 157 m wide

// three.js version: a truncated sphere with an LED dot-matrix display (emissive canvas texture) on a dark plinth
const ledTexture = () => {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, 0, 1024); g.addColorStop(0, '#1A2A6A'); g.addColorStop(0.5, '#3C8CF0'); g.addColorStop(1, '#1A2A6A');
  x.fillStyle = g; x.fillRect(0, 0, 2048, 1024);
  x.fillStyle = '#F2F2F2'; x.beginPath(); x.ellipse(1024, 520, 300, 220, 0, 0, Math.PI * 2); x.fill();       // an eye: the classic show
  x.fillStyle = '#2E7A3A'; x.beginPath(); x.arc(1024, 520, 150, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#0A0A0A'; x.beginPath(); x.arc(1024, 520, 70, 0, Math.PI * 2); x.fill();
  // LED grid: keep only dots, the gaps go dark
  const img = x.getImageData(0, 0, 2048, 1024), p = img.data;
  for (let y = 0; y < 1024; y++) for (let X = 0; X < 2048; X++) if (X % 6 > 3 || y % 6 > 3) { const i = (y * 2048 + X) * 4; p[i] *= 0.08; p[i + 1] *= 0.08; p[i + 2] *= 0.08; }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
const ThreeSphere: React.FC<{env: THREE.Texture}> = ({env}) => {
  const R = W / 2, cy = H - R;  // centre height so the top is at H
  const theta = Math.acos(-cy / R); // polar angle from the top down to where the sphere meets the ground
  const tex = useMemo(ledTexture, []);
  return (
    <group rotation={[0, -0.75, 0]}>{/* turn the eye toward the camera */}
      <mesh position={[0, cy, 0]} castShadow receiveShadow>
        <sphereGeometry args={[R, 128, 64, 0, Math.PI * 2, 0, theta]} />
        <meshStandardMaterial color="#202024" emissive="#FFFFFF" emissiveMap={tex} emissiveIntensity={1.4} roughness={0.45} metalness={0} envMap={env} envMapIntensity={0.5} />
      </mesh>
      <mesh position={[0, 4, 0]} receiveShadow><cylinderGeometry args={[R * 0.72, R * 0.78, 8, 96]} /><meshStandardMaterial color="#1C1C20" roughness={0.6} /></mesh>
    </group>
  );
};

const Scene: React.FC<BenchProps & {gltf: ReturnType<typeof useGlb>}> = ({variant, angle, gltf, light}) => {
  const {camera, gl, scene} = useThree();
  const f = useCurrentFrame();
  const env = useMemo(() => skyEnvironment(gl, SKY), [gl]);
  const sky = useMemo(() => skyDome(SKY), []);
  // the shell owns scene-wide state, every frame (three.md)
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 0.9; gl.shadowMap.enabled = true;
  scene.fog = new THREE.Fog(new THREE.Color(SKY.horizon).multiplyScalar(0.8), 600, 2600);
  const c = camera as THREE.PerspectiveCamera;
  const orbit = 0.25 + f * 0.0015;
  const [d, y, look, fov] = angle === 'wide' ? [430, 40, 50, 40] : [190, 70, 80, 34];
  c.position.set(Math.sin(orbit) * d, y, Math.cos(orbit) * d); c.lookAt(0, look, 0); c.fov = fov; c.near = 1; c.far = 6000; c.updateProjectionMatrix();
  const ground = useMemo(() => {
    const g = new THREE.PlaneGeometry(6000, 6000, 1, 1); g.rotateX(-Math.PI / 2); return g; }, []);
  return (
    <>
      <mesh material={sky} frustumCulled={false} renderOrder={-1} position={camera.position}><sphereGeometry args={[5000, 48, 24]} /></mesh>
      <hemisphereLight args={['#8C9CC8', '#5A4636', 0.9]} />
      <directionalLight position={SKY.sunDir.clone().multiplyScalar(800).toArray()} intensity={2.6} color={SKY.sun} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-180} shadow-camera-right={180} shadow-camera-top={180} shadow-camera-bottom={-180} shadow-camera-far={2000} shadow-bias={-0.0004} />
      <mesh geometry={ground} receiveShadow><meshStandardMaterial color="#6E5A48" roughness={0.95} /></mesh>
      {/* a few low blocks for scale: the casino buildings beside it */}
      {[[-190, 30, -60, 60, 60, 90], [170, 22, -90, 80, 44, 60], [-60, 14, -260, 160, 28, 50]].map(([x, yy, z, w, h, dd], i) => (
        <mesh key={i} position={[x, yy, z]} castShadow receiveShadow><boxGeometry args={[w, h, dd]} /><meshStandardMaterial color="#8A8072" roughness={0.8} /></mesh>))}
      {variant === 'threejs' && <ThreeSphere env={env} />}
      {variant === 'glb' && gltf && (
        <HeroModel gltf={gltf} size={H} axis="height" origin="base" light={light} envMap={env} envIntensity={0.5}
          onFit={(r) => console.log('[hero fit] ' + r.report.join(' | ') + ` | fitted ${r.size.x.toFixed(1)} x ${r.size.y.toFixed(1)} x ${r.size.z.toFixed(1)} m`)} />)}
    </>
  );
};

export const Bench: React.FC<BenchProps> = (p) => {
  const gltf = useGlb(p.variant === 'glb' ? p.glb : null);  // preloaded outside the canvas
  const ready = p.variant !== 'glb' || !!gltf;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {ready && <ThreeCanvas width={1080} height={1920} shadows gl={{antialias: true}} camera={{fov: 40, near: 1, far: 6000, position: [0, 40, 430]}}>
        <Scene {...p} gltf={gltf} />
      </ThreeCanvas>}
    </AbsoluteFill>
  );
};
