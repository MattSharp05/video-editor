// Joints: anchor a child part on its parent's real surface, and check that declared joints touch.
// Rules and why: references/assembly.md. Needs `npm i three-mesh-bvh@0.8.3` (three r169).
//
//   const end = anchorFromEnd(stemGeo, new THREE.Vector3(0, -1, 0));          // cut end: centroid + outward normal
//   const cord = tube([end.at(-0.06), end.at(0.3), ...], end.radius * 0.85);  // starts INSIDE the stem
//   useJointCheck([{name: 'stem-cord', a: stemGeo, b: cord, maxGap: 0.004}]); // throws in stills if they part
import * as THREE from 'three';
import {useMemo} from 'react';
import {MeshBVH} from 'three-mesh-bvh';

// The end of a part along `dir` (world space): centroid and mean normal of the vertices within `frac` of that end,
// plus a radius estimate. at(s) walks s units out of the end along its own direction (negative = into the part).
export const anchorFromEnd = (geo: THREE.BufferGeometry, dir: THREE.Vector3, frac = 0.04) => {
  const p = geo.attributes.position as THREE.BufferAttribute;
  if (!geo.attributes.normal) geo.computeVertexNormals();
  const n = geo.attributes.normal as THREE.BufferAttribute, d = dir.clone().normalize(), v = new THREE.Vector3();
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < p.count; i++) { const s = v.fromBufferAttribute(p, i).dot(d); lo = Math.min(lo, s); hi = Math.max(hi, s); }
  const cut = hi - (hi - lo) * frac, c = new THREE.Vector3(), nn = new THREE.Vector3(), pts: THREE.Vector3[] = [];
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); if (v.dot(d) >= cut) { c.add(v); nn.add(new THREE.Vector3().fromBufferAttribute(n, i)); pts.push(v.clone()); } }
  c.divideScalar(pts.length); nn.normalize(); if (nn.dot(d) < 0) nn.negate();
  const radius = pts.reduce((a, q) => a + q.clone().sub(c).projectOnPlane(nn).length(), 0) / pts.length;
  return {point: c, normal: nn, radius, at: (s: number) => c.clone().addScaledVector(nn, s)};
};

const asGeo = (x: THREE.BufferGeometry | THREE.Object3D) => {
  if ((x as THREE.BufferGeometry).isBufferGeometry) return x as THREE.BufferGeometry;
  const o = x as THREE.Object3D, parts: THREE.BufferGeometry[] = [];
  o.updateWorldMatrix(true, true);
  o.traverse((m) => { const mesh = m as THREE.Mesh; if (mesh.isMesh) parts.push(mesh.geometry.clone().applyMatrix4(mesh.matrixWorld)); });
  if (parts.length !== 1) throw new Error('jointGap: pass one mesh or a geometry in world space');
  return parts[0];
};
const bvh = new WeakMap<THREE.BufferGeometry, MeshBVH>();
// Smallest distance between two surfaces (world space), with the closest points.
export const jointGap = (a: THREE.BufferGeometry | THREE.Object3D, b: THREE.BufferGeometry | THREE.Object3D) => {
  const A = asGeo(a), Bg = asGeo(b);
  if (!bvh.has(A)) bvh.set(A, new MeshBVH(A));
  const t1: any = {}, t2: any = {};
  bvh.get(A)!.closestPointToGeometry(Bg, new THREE.Matrix4(), t1, t2);
  return {gap: t1.distance as number, onA: t1.point as THREE.Vector3, onB: t2.point as THREE.Vector3};
};

export type Joint = {name: string; a: THREE.BufferGeometry | THREE.Object3D; b: THREE.BufferGeometry | THREE.Object3D; maxGap: number};
// Measure once per set of parts; throw (fails the still/render) when a joint is open.
export const useJointCheck = (joints: Joint[] | null) => {
  useMemo(() => {
    if (!joints) return;
    const bad = joints.map((j) => ({j, r: jointGap(j.a, j.b)})).filter(({j, r}) => r.gap > j.maxGap);
    if (bad.length) throw new Error('open joints: ' + bad.map(({j, r}) => `${j.name} gap ${r.gap.toFixed(4)} > ${j.maxGap} near ${r.onA.toArray().map((x) => x.toFixed(3))}`).join('; '));
  }, [joints]);
};

// The same check without a hook, for parts only known after mount (refs): call in useLayoutEffect.
export const checkJoints = (joints: Joint[]) => {
  const bad = joints.map((j) => ({j, r: jointGap(j.a, j.b)})).filter(({j, r}) => r.gap > j.maxGap);
  if (bad.length) throw new Error('open joints: ' + bad.map(({j, r}) => `${j.name} gap ${r.gap.toFixed(4)} > ${j.maxGap} near ${r.onA.toArray().map((x) => x.toFixed(3))}`).join('; '));
};
