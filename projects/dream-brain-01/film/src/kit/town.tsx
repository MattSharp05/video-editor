// His town: one deterministic layout used at three scales (the real town at night, the glowing model the dream builds
// inside his brain, and the full-size dream town). Houses, pitched roofs, windows, a main street of streetlights and a
// few named buildings the memory beat swaps around.
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {rnd} from './shared';

export type Bldg = {x: number; z: number; w: number; d: number; h: number; rot: number; name?: string};
export type Win = {b: number; p: THREE.Vector3; n: THREE.Vector3; r: number};

export const LAYOUT = (() => {
  const B: Bldg[] = [];
  const named: Record<string, [number, number, number, number, number]> = {
    // x, z, w, d, h
    home: [7, -6, 3.2, 3, 2.6], office: [-7, 6, 3.4, 3.4, 7.5], church: [7, 14, 3, 5, 4], school: [-14, -10, 6, 3.4, 3.2],
    childhood: [14, 2, 3, 3, 2.4], coffee: [-6.5, -6, 2.6, 2.6, 2.2], clock: [-7, 18, 2.2, 2.2, 9],
  };
  for (const [name, [x, z, w, d, h]] of Object.entries(named)) B.push({x, z, w, d, h, rot: 0, name});
  for (let gx = -4; gx <= 4; gx++) for (let gz = -5; gz <= 6; gz++) {
    for (let k = 0; k < 2; k++) {
      const s = `${gx},${gz},${k}`;
      const x = gx * 7 + (k ? 2.2 : -2.2) + (rnd('jx' + s) - 0.5) * 0.8, z = gz * 6 + (rnd('jz' + s) - 0.5) * 1.2;
      if (Math.abs(x) < 3) continue; // main street (x = 0)
      if (B.some((b) => Math.abs(b.x - x) < (b.w + 2.6) / 2 + 0.3 && Math.abs(b.z - z) < (b.d + 2.6) / 2 + 0.3)) continue;
      if (rnd('skip' + s) < 0.12) continue;
      const far = Math.hypot(x, z) / 40;
      B.push({x, z, w: 2.2 + rnd('w' + s) * 1.2, d: 2.2 + rnd('d' + s) * 1.0, h: 1.8 + rnd('h' + s) * (far < 0.4 ? 3.2 : 1.6), rot: (rnd('r' + s) - 0.5) * 0.12});
    }
  }
  // windows: a grid on each long face
  const W: Win[] = [];
  B.forEach((b, i) => {
    const floors = Math.max(1, Math.floor(b.h / 1.25));
    for (const side of [-1, 1]) for (const face of ['x', 'z'] as const) {
      const len = face === 'x' ? b.d : b.w, cols = Math.max(1, Math.floor(len / 1.1));
      for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
        const u = (c + 0.5) / cols - 0.5, y = 0.75 + f * 1.25;
        const p = face === 'x' ? new THREE.Vector3(b.x + side * (b.w / 2 + 0.02), y, b.z + u * len) : new THREE.Vector3(b.x + u * len, y, b.z + side * (b.d / 2 + 0.02));
        const n = face === 'x' ? new THREE.Vector3(side, 0, 0) : new THREE.Vector3(0, 0, side);
        W.push({b: i, p, n, r: rnd(`win${i}-${side}-${face}-${f}-${c}`)});
      }
    }
  });
  const lights = Array.from({length: 18}, (_, i) => new THREE.Vector3(i % 2 ? 2.3 : -2.3, 3.0, -30 + i * 3.6));
  const homeWin = W.findIndex((w) => B[w.b].name === 'home' && w.n.z === 1 && w.p.y < 1.5);
  return {B, W, lights, homeWin};
})();

// Window brightness 0..1 and colour per window, decided by the world using the town.
export type WinState = (i: number, w: Win) => [number, string];

export const Town: React.FC<{
  winState: WinState; wall?: string; roof?: string; ground?: string | null; street?: number; glowEdges?: number;
  only?: (b: Bldg, i: number) => number; // 0..1 per building: how built it is (the dream builds it block by block)
  swap?: Record<string, [number, number]>; // memory beat: move named buildings to new x,z
}> = ({winState, wall = '#121a33', roof = '#0c1226', ground = '#070b18' as string | null, street = 1, glowEdges = 0, only, swap}) => {
  const {B, W, lights} = LAYOUT;
  const body = useRef<THREE.InstancedMesh>(null), top = useRef<THREE.InstancedMesh>(null), win = useRef<THREE.InstancedMesh>(null);
  const boxG = useMemo(() => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), []);
  const roofG = useMemo(() => new THREE.ConeGeometry(0.75, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0), []);
  const winG = useMemo(() => new THREE.PlaneGeometry(0.42, 0.55), []);
  const edgeG = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0)), []);
  const m = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  // all building outlines merged into one geometry each frame (one draw call instead of hundreds)
  const edges = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(B.length * 24 * 3), 3)), []);
  if (glowEdges > 0) {
    const src = edgeG.attributes.position as THREE.BufferAttribute, dst = edges.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3(), mm = new THREE.Matrix4();
    let n = 0;
    B.forEach((b, i) => { const k = only ? only(b, i) : 1; if (k <= 0.01) return; const [x, z] = (swap && b.name && swap[b.name]) ? swap[b.name] : [b.x, b.z];
      mm.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, b.rot, 0)), new THREE.Vector3(b.w, b.h * k, b.d));
      for (let j = 0; j < src.count; j++) { v.fromBufferAttribute(src, j).applyMatrix4(mm); dst.setXYZ(n++, v.x, v.y, v.z); } });
    edges.setDrawRange(0, n); dst.needsUpdate = true; edges.computeBoundingSphere();
  }
  const pos = (b: Bldg) => (swap && b.name && swap[b.name] ? swap[b.name] : [b.x, b.z]);
  useLayoutEffect(() => {
    B.forEach((b, i) => {
      const k = only ? only(b, i) : 1, [x, z] = pos(b), h = b.h * Math.max(0.001, k);
      m.position.set(x, 0, z); m.rotation.set(0, b.rot, 0); m.scale.set(b.w, h, b.d); m.updateMatrix(); body.current!.setMatrixAt(i, m.matrix);
      const tall = b.name === 'clock' || b.name === 'church';
      m.position.set(x, h, z); m.scale.set(b.w * 1.05, (tall ? 2.6 : 1.1) * Math.max(0.001, k), b.d * 1.05); m.updateMatrix(); top.current!.setMatrixAt(i, m.matrix);
    });
    body.current!.instanceMatrix.needsUpdate = true; top.current!.instanceMatrix.needsUpdate = true;
    W.forEach((w, i) => {
      const b = B[w.b], k = only ? only(b, w.b) : 1, [x, z] = pos(b);
      const [lvl, c] = winState(i, w);
      const vis = w.p.y < b.h * k - 0.3 ? 1 : 0;
      m.position.set(w.p.x - b.x + x, w.p.y, w.p.z - b.z + z); m.lookAt(m.position.clone().add(w.n)); m.scale.setScalar(vis ? 1 : 0.0001); m.updateMatrix();
      win.current!.setMatrixAt(i, m.matrix);
      col.set(c).multiplyScalar(lvl * vis); win.current!.setColorAt(i, col);
    });
    win.current!.instanceMatrix.needsUpdate = true; if (win.current!.instanceColor) win.current!.instanceColor.needsUpdate = true;
  });
  return (
    <group>
      {ground && <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}><planeGeometry args={[800, 800]} /><meshStandardMaterial color={ground} roughness={1} /></mesh>}
      {street > 0 && <mesh rotation-x={-Math.PI / 2} position={[0, 0.0, 0]}><planeGeometry args={[4, 120]} /><meshStandardMaterial color="#0b1022" emissive="#FFB060" emissiveIntensity={0.015} roughness={0.6} /></mesh>}
      <instancedMesh ref={body} args={[boxG, undefined, B.length]}><meshStandardMaterial color={wall} roughness={0.9} /></instancedMesh>
      <instancedMesh ref={top} args={[roofG, undefined, B.length]}><meshStandardMaterial color={roof} roughness={0.9} /></instancedMesh>
      <instancedMesh ref={win} args={[winG, undefined, W.length]}><meshBasicMaterial toneMapped={false} /></instancedMesh>
      {glowEdges > 0 && <lineSegments geometry={edges}><lineBasicMaterial color="#FFC56E" transparent opacity={glowEdges * 0.55} toneMapped={false} /></lineSegments>}
      {street > 0 && lights.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.05, 0.07, 3, 8]} /><meshStandardMaterial color="#1b2340" /></mesh>
          <mesh position={[0, 3.05, 0]}><sphereGeometry args={[0.16, 16, 12]} /><meshBasicMaterial color="#FFD9A0" toneMapped={false} /></mesh>
        </group>
      ))}
    </group>
  );
};
