// The hook frame (style step): a 5 cm cube of butter on an oak board, cut once through its centre.
// The top half lifts away up the cut and the bottom half shows the six-sided face, traced in the
// accent colour. Window light from the left, a dark kitchen behind. Units: 1 = 1 cm.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {half, sectionRing, H} from './butter';
import {backdrop, butterCut, butterRind, stone, wood} from './textures';

export const ACCENT = '#35d4ff'; // the thing to follow: the hexagon and its count

const CUBE_ROT = new THREE.Euler(0, -Math.PI / 4, 0); // puts the cut's normal in the y-z plane, facing the camera
const N_W = new THREE.Vector3(0, 1, Math.SQRT2).normalize(); // cut normal in the world
const UP_CUT = new THREE.Vector3(0, Math.SQRT2, -1).normalize(); // in the cut plane, pointing up and back

const Env: React.FC = () => {
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene);
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.35;
  }, [gl, scene]);
  return null;
};

// The kitchen set shared by every shot: board, counter, backdrop, window light.
export const Room: React.FC = () => {
  const m = useMemo(() => {
    const woodT = wood(), stoneT = stone();
    woodT.color.repeat.set(1.6, 1.6); woodT.bump.repeat.set(1.6, 1.6); woodT.rough.repeat.set(1.6, 1.6);
    const board = new THREE.MeshPhysicalMaterial({map: woodT.color, roughnessMap: woodT.rough, roughness: 1, bumpMap: woodT.bump, bumpScale: 0.8, specularIntensity: 0.3});
    const counter = new THREE.MeshPhysicalMaterial({map: stoneT.color, roughnessMap: stoneT.rough, roughness: 1, specularIntensity: 0.4});
    stoneT.color.repeat.set(3, 3); stoneT.rough.repeat.set(3, 3);
    const back = new THREE.MeshBasicMaterial({map: backdrop(), fog: false});
    return {board, counter, back};
  }, []);
  return (
    <>
      <Env />
      <fog attach="fog" args={['#1d1814', 60, 160]} />
      {/* window light from the left and a little behind, warm; cool fill from the room */}
      <directionalLight position={[-30, 34, -6]} intensity={2.6} color="#fff1dc" castShadow
        shadow-mapSize-width={4096} shadow-mapSize-height={4096} shadow-bias={-0.0004} shadow-normalBias={0.02}
        shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-camera-near={1} shadow-camera-far={100} shadow-radius={6} />
      <hemisphereLight args={['#c9d6e8', '#4a3424', 0.35]} />
      <pointLight position={[14, 10, 18]} intensity={35} distance={0} decay={2} color="#ffd9b0" />

      {/* counter, board, backdrop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow material={m.counter}>
        <planeGeometry args={[220, 220]} />
      </mesh>
      <mesh position={[0, -0.9, -1]} receiveShadow castShadow material={m.board}>
        <boxGeometry args={[30, 1.8, 22]} />
      </mesh>
      <mesh position={[0, 30, -95]} material={m.back}>
        <planeGeometry args={[260, 150]} />
      </mesh>

    </>
  );
};

export const Set: React.FC<{lift: number}> = ({lift}) => {
  const m = useMemo(() => {
    const rindT = butterRind(), cutT = butterCut();
    const rind = new THREE.MeshPhysicalMaterial({map: rindT.color, roughnessMap: rindT.rough, roughness: 1, bumpMap: rindT.bump, bumpScale: 0.6, sheen: 0.4, sheenColor: new THREE.Color('#fff0c0'), sheenRoughness: 0.6, specularIntensity: 0.5, emissive: new THREE.Color('#5a3a00'), emissiveIntensity: 0.12});
    const cut = new THREE.MeshPhysicalMaterial({map: cutT.color, roughnessMap: cutT.rough, roughness: 1, bumpMap: cutT.bump, bumpScale: 0.35, clearcoat: 0.25, clearcoatRoughness: 0.35, specularIntensity: 0.7, emissive: new THREE.Color('#6a4500'), emissiveIntensity: 0.1});
    const bottom = half(-1), top = half(1);
    const {pts} = sectionRing(240);
    const ring = new THREE.CatmullRomCurve3(pts.map((p) => p.clone().multiplyScalar(1.004).addScaledVector(new THREE.Vector3(1, 1, 1).normalize(), 0.012)), true);
    const line = new THREE.TubeGeometry(ring, 480, 0.045, 8, true);
    const glow = new THREE.TubeGeometry(ring, 480, 0.16, 8, true);
    const lineM = new THREE.MeshBasicMaterial({color: new THREE.Color(ACCENT).multiplyScalar(1.6), toneMapped: false});
    const glowM = new THREE.MeshBasicMaterial({color: ACCENT, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false});
    return {rind, cut, bottom, top, line, glow, lineM, glowM};
  }, []);

  const topPos = new THREE.Vector3(0, H, 0).addScaledVector(UP_CUT, 6.6 * lift).addScaledVector(N_W, 1.6 * lift);
  return (
    <>
      <Room />
      {/* bottom half stays on the board; its cut face carries the traced hexagon */}
      <group position={[0, H, 0]} rotation={CUBE_ROT}>
        <mesh geometry={m.bottom.rind} material={m.rind} castShadow receiveShadow />
        <mesh geometry={m.bottom.cut} material={m.cut} castShadow receiveShadow />
        <mesh geometry={m.line} material={m.lineM} />
        <mesh geometry={m.glow} material={m.glowM} />
      </group>
      {/* top half lifting away up the cut */}
      <group position={topPos} rotation={CUBE_ROT}>
        <group rotation={[0.1 * lift, 0.12 * lift, -0.08 * lift]}>
          <mesh geometry={m.top.rind} material={m.rind} castShadow receiveShadow />
          <mesh geometry={m.top.cut} material={m.cut} castShadow receiveShadow />
        </group>
      </group>
    </>
  );
};
