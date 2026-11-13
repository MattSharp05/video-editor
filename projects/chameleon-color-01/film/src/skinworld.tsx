// Inside the skin: a cut block of chameleon skin, top to bottom: a clear outer skin with scales, the YELLOW layer
// (xanthophores: flattened yellow cells), the CRYSTAL layer (iridophores: tiny flat crystals in a neat lattice) and
// the DARK layer (melanophores) at the bottom. One beam of sunlight comes in; the crystals bounce one color back out.
// Packed close (spacing ~ calm): blue comes back; through the yellow layer it leaves green. Spread apart (excited):
// orange-red comes back. Units: arbitrary (block 4.4 wide). spread 0 = calm lattice, 1 = excited lattice.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {rng} from './kit/realism/noise';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
export const HALF = 2.2;
export const Y = {skinTop: 1.75, yellowTop: 1.45, yellowBot: 0.85, crysTop: 0.6, crysBot: -1.1, darkTop: -1.3, darkBot: -1.9};
export const HIT = V(0.0, 0.42, 1.75);

// blue -> pale -> orange (a straight blend would pass through pink, which the skin never shows)
const outColor = (spread: number) => spread < 0.5 ? new THREE.Color('#2f7bff').lerp(new THREE.Color('#d8e0c8'), spread * 2) : new THREE.Color('#d8e0c8').lerp(new THREE.Color('#ff6a10'), spread * 2 - 1);
// what leaves the skin: blue through yellow reads green; orange-red through yellow stays orange-red
const exitColor = (spread: number) => new THREE.Color('#5be04a').lerp(new THREE.Color('#ffa21e'), spread);

const Beam: React.FC<{a: THREE.Vector3; b: THREE.Vector3; color: THREE.Color | string; r?: number; o?: number; grow?: number}> = ({a, b: b0, color, r = 0.09, o = 1, grow = 1}) => {
  const b = useMemo(() => a.clone().lerp(b0, Math.max(0.02, grow)), [a, b0, grow]);
  const {pos, q, len} = useMemo(() => {
    const d = b.clone().sub(a);
    return {pos: a.clone().add(b).multiplyScalar(0.5), q: new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()), len: d.length()};
  }, [a, b]);
  const mats = useMemo(() => [0.9, 0.35, 0.12].map((op) => new THREE.MeshBasicMaterial({color, transparent: true, opacity: op * o, blending: THREE.AdditiveBlending, depthWrite: false, fog: false})), [color, o]);
  return (
    <group position={pos} quaternion={q}>
      <mesh material={mats[0]}><cylinderGeometry args={[r * 0.45, r * 0.45, len, 20, 1, true]} /></mesh>
      <mesh material={mats[1]}><cylinderGeometry args={[r, r, len, 20, 1, true]} /></mesh>
      <mesh material={mats[2]}><cylinderGeometry args={[r * 2.2, r * 2.2, len, 20, 1, true]} /></mesh>
    </group>
  );
};

// little wave squiggle riding a beam (the light as a wave: short wiggles = blue, long = red)
const Wave: React.FC<{a: THREE.Vector3; b: THREE.Vector3; color: THREE.Color | string; wl: number; amp?: number; ph?: number; grow?: number}> = ({a, b, color, wl, amp = 0.1, ph = 0, grow = 1}) => {
  const geo = useMemo(() => {
    const d = b.clone().sub(a), L = d.length() * Math.max(0.02, grow), t = d.clone().normalize();
    const side = t.clone().cross(V(0, 0, 1)).normalize();
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 240; i++) {
      const s = (i / 240) * L;
      pts.push(a.clone().addScaledVector(t, s).addScaledVector(side, amp * Math.sin((s / wl - ph) * Math.PI * 2)));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 480, 0.022, 8, false);
  }, [a, b, wl, amp, ph, grow]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({color, toneMapped: false}), [color]);
  return <mesh geometry={geo} material={mat} />;
};

export type SkinAnim = {t?: number; spread: number; beamIn?: number; out?: number; exit?: number; yellowGlow?: number; crysGlow?: number; dark?: number};
export const SkinWorld: React.FC<SkinAnim & {beams?: boolean}> = ({t = 0, spread, beamIn = 1, out = 1, exit = 1, yellowGlow = 0, crysGlow = 0, dark = 0, beams = true}) => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.6;
    scene.background = null;
    scene.fog = new THREE.Fog('#06140f', 9, 22);
  }, [gl, scene]);

  const parts = useMemo(() => {
    const r = rng(5);
    // yellow cells: flattened blobs packed in one layer
    const ycells: THREE.Matrix4[] = [];
    for (let x = -HALF + 0.25; x < HALF; x += 0.5) for (let z = -HALF + 0.25; z < HALF; z += 0.5) {
      const p = V(x + (r() - 0.5) * 0.14, (Y.yellowTop + Y.yellowBot) / 2 + (r() - 0.5) * 0.08, z + (r() - 0.5) * 0.14);
      ycells.push(new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 3, 0)), V(0.25 + r() * 0.04, 0.14, 0.25 + r() * 0.04)));
    }
    // dark cells with arms reaching up
    const dcells: THREE.Matrix4[] = [];
    for (let x = -HALF + 0.4; x < HALF; x += 0.8) for (let z = -HALF + 0.4; z < HALF; z += 0.8)
      dcells.push(new THREE.Matrix4().compose(V(x + (r() - 0.5) * 0.3, (Y.darkTop + Y.darkBot) / 2, z + (r() - 0.5) * 0.3), new THREE.Quaternion(), V(0.42, 0.26, 0.42)));
    // skin scales on top
    const scales: THREE.Matrix4[] = [];
    for (let x = -HALF + 0.12; x < HALF; x += 0.24) for (let z = -HALF + 0.12; z < HALF; z += 0.24)
      scales.push(new THREE.Matrix4().compose(V(x + ((Math.round(z / 0.24) % 2) * 0.12), Y.skinTop - 0.04, z), new THREE.Quaternion(), V(0.13, 0.07, 0.13)));
    // dark-cell arms: branches that climb between the crystals toward the yellow layer
    const arms: {p: THREE.Vector3; tilt: number; spin: number}[] = [];
    for (const m of dcells) {
      const p = new THREE.Vector3().setFromMatrixPosition(m);
      for (let k = 0; k < 5; k++) arms.push({p: p.clone().add(V((r() - 0.5) * 0.4, 0.1, (r() - 0.5) * 0.4)), tilt: (r() - 0.5) * 0.5, spin: r() * 6.28});
    }
    return {ycells, dcells, scales, arms};
  }, []);

  // crystal lattice: flat hexagonal plates in a triangular lattice; spacing grows with 'spread'
  const crystals = useMemo(() => {
    const sp = Math.round(spread * 60) / 60, d = 0.2 * (1 + 0.75 * sp), dy = d * 0.75;
    const list: THREE.Matrix4[] = [];
    for (let y = Y.crysBot + 0.12; y < Y.crysTop - 0.05; y += dy)
      for (let x = -HALF + d / 2; x < HALF; x += d)
        for (let zi = 0, z = -HALF + d / 2; z < HALF; z += d * 0.866, zi++) {
          const xx = x + (zi % 2) * d * 0.5;
          if (xx > HALF - 0.05) continue;
          list.push(new THREE.Matrix4().compose(V(xx, y, z), new THREE.Quaternion(), V(1, 1, 1)));
        }
    return list;
  }, [spread]);

  const mats = useMemo(() => ({
    yellow: new THREE.MeshStandardMaterial({color: '#f2b70f', roughness: 0.4, emissive: '#c98a00', emissiveIntensity: 0.3, transparent: true, opacity: 0.8}),
    dark: new THREE.MeshStandardMaterial({color: '#1a0f0a', roughness: 0.7}),
    darkSlab: new THREE.MeshStandardMaterial({color: '#120b08', roughness: 0.8}),
    scale: new THREE.MeshPhysicalMaterial({color: '#cfe8c8', roughness: 0.2, transparent: true, opacity: 0.35, clearcoat: 1}),
    cellWall: new THREE.MeshStandardMaterial({color: '#9fd8ff', transparent: true, opacity: 0.07, roughness: 0.2, depthWrite: false}),
  }), []);
  const crystalMat = useMemo(() => new THREE.MeshStandardMaterial({color: '#7d7d7d', roughness: 0.3, metalness: 0.1, emissive: outColor(spread), emissiveIntensity: (0.95 + 0.9 * crysGlow) * (1 - 0.8 * dark)}), [spread, crysGlow, dark]);

  const inst = (geo: THREE.BufferGeometry, mat: THREE.Material, ms: THREE.Matrix4[]) => {
    const im = new THREE.InstancedMesh(geo, mat, ms.length);
    ms.forEach((m, i) => im.setMatrixAt(i, m));
    return im;
  };
  const meshes = useMemo(() => ({
    y: inst(new THREE.SphereGeometry(1, 24, 14), mats.yellow, parts.ycells),
    d: inst(new THREE.SphereGeometry(1, 20, 12), mats.dark, parts.dcells),
    s: inst(new THREE.SphereGeometry(1, 16, 10), mats.scale, parts.scales),
  }), [parts, mats]);
  const crys = useMemo(() => inst(new THREE.CylinderGeometry(0.055, 0.055, 0.016, 6), crystalMat, crystals), [crystals, crystalMat]);

  mats.yellow.emissiveIntensity = 0.3 + 0.9 * yellowGlow;
  const armLen = Y.yellowBot - 0.05 - (Y.darkTop + Y.darkBot) / 2;
  const armMesh = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.035, 0.08, 1, 8, 1); g.translate(0, 0.5, 0);
    return new THREE.InstancedMesh(g, mats.dark, parts.arms.length);
  }, [parts, mats]);
  parts.arms.forEach((a, i) => armMesh.setMatrixAt(i, new THREE.Matrix4().compose(a.p, new THREE.Quaternion().setFromEuler(new THREE.Euler(a.tilt * Math.cos(a.spin), 0, a.tilt * Math.sin(a.spin))), V(1, Math.max(0.001, dark * armLen), 1))));
  armMesh.instanceMatrix.needsUpdate = true;
  const sunFrom = V(-2.0, 3.8, 1.9), outTo = V(1.9, 3.5, 1.9);
  const exitAt = HIT.clone().lerp(outTo, (Y.yellowTop + 0.02 - HIT.y) / (outTo.y - HIT.y));
  const midAt = HIT.clone().lerp(outTo, (Y.yellowBot - HIT.y) / (outTo.y - HIT.y));
  const oc = outColor(spread), ec = exitColor(spread);

  return (
    <>
      <mesh scale={40}><sphereGeometry args={[1, 32, 16]} /><meshBasicMaterial color="#0a2a1e" side={THREE.BackSide} fog={false} /></mesh>
      <ambientLight intensity={0.35} color="#bfe8ff" />
      <directionalLight position={[-3, 6, 4]} intensity={2.2} color="#fff6e0" />
      <directionalLight position={[4, 2, 5]} intensity={0.6} color="#9fd0ff" />
      {/* layer slabs: faint glass walls so the block reads as a cut-away */}
      <mesh position={[0, (Y.crysTop + Y.crysBot) / 2, 0]} material={mats.cellWall}><boxGeometry args={[HALF * 2, Y.crysTop - Y.crysBot, HALF * 2]} /></mesh>
      <mesh position={[0, (Y.darkTop + Y.darkBot) / 2 - 0.1, 0]} material={mats.darkSlab}><boxGeometry args={[HALF * 2, 0.5, HALF * 2]} /></mesh>
      <mesh position={[0, Y.skinTop - 0.08, 0]}><boxGeometry args={[HALF * 2, 0.12, HALF * 2]} /><meshPhysicalMaterial color="#d8f0d0" transparent opacity={0.18} roughness={0.15} /></mesh>
      <primitive object={meshes.s} />
      <primitive object={meshes.y} />
      <primitive object={crys} />
      <primitive object={meshes.d} />
      {dark > 0.01 && <primitive object={armMesh} />}
      {dark > 0.01 && <mesh position={[0, Y.crysBot + (Y.crysTop - Y.crysBot) * dark * 0.5, 0]} scale={[1, Math.max(0.01, dark), 1]}><boxGeometry args={[HALF * 2.01, Y.crysTop - Y.crysBot, HALF * 2.01]} /><meshStandardMaterial color="#1c120c" transparent opacity={0.5 * dark} depthWrite={false} roughness={0.9} /></mesh>}
      {beams && (
        <>
          {beamIn > 0.01 && <Beam a={sunFrom} b={HIT} color="#fffbe8" r={0.1} grow={beamIn} />}
          {beamIn > 0.01 && <Wave a={sunFrom} b={HIT} color="#ffffff" wl={0.34} amp={0.07} grow={beamIn} ph={t * 2.2} />}
          {out > 0.01 && <Beam a={HIT} b={midAt} color={oc} r={0.1} grow={out} o={1 - 0.7 * dark} />}
          {out > 0.01 && <Wave a={HIT} b={midAt} color={oc} wl={0.22 + 0.3 * spread} amp={0.08} grow={out} ph={t * 2.2} />}
          {exit > 0.01 && <Beam a={exitAt} b={outTo} color={ec} r={0.14} grow={exit} o={1 - 0.7 * dark} />}
          {exit > 0.01 && <Wave a={exitAt} b={outTo} color={ec} wl={0.3 + 0.25 * spread} amp={0.08} grow={exit} ph={t * 2.2} />}
          {exit > 0.01 && <mesh position={exitAt}><sphereGeometry args={[0.22, 20, 14]} /><meshBasicMaterial color={ec} transparent opacity={0.55 * exit * (1 - 0.7 * dark)} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>}
          {out > 0.01 && <mesh position={HIT}><sphereGeometry args={[0.16, 20, 14]} /><meshBasicMaterial color={oc} transparent opacity={0.6 * out} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>}
        </>
      )}
    </>
  );
};
