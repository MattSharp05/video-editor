// A cube of butter (5 cm, softly rounded edges) cut once through its centre, square-on to the line
// from one corner to the opposite corner. The two halves are convex hulls of points on the rounded
// cube plus the exact cross-section ring, so the cut face is the true section (a regular hexagon
// with slightly softened corners where the cut crosses the rounded edges).
// Units: 1 = 1 cm. Cube-local coordinates, centred on the origin.
import * as THREE from 'three';
import {ConvexGeometry} from 'three/examples/jsm/geometries/ConvexGeometry.js';
import {toCreasedNormals} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const H = 2.5; // half side (cm)
export const R = 0.28; // edge rounding (cm)
export const N_CUT = new THREE.Vector3(1, 1, 1).normalize();

const sdf = (p: THREE.Vector3) => {
  const q = new THREE.Vector3(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)).subScalar(H - R);
  const out = new THREE.Vector3(Math.max(q.x, 0), Math.max(q.y, 0), Math.max(q.z, 0)).length();
  return out + Math.min(Math.max(q.x, q.y, q.z), 0) - R;
};

// Surface point along direction d from the centre (the rounded cube is convex, so star-shaped).
const surf = (d: THREE.Vector3) => {
  let lo = 0, hi = H * 1.8;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (sdf(d.clone().multiplyScalar(m)) < 0) lo = m; else hi = m;
  }
  return d.clone().multiplyScalar((lo + hi) / 2);
};

// The cut's outline in cube-local coordinates, in order around the face.
export const sectionRing = (count = 720) => {
  const a = new THREE.Vector3(1, -1, 0).normalize();
  const b = new THREE.Vector3().crossVectors(N_CUT, a).normalize();
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    pts.push(surf(a.clone().multiplyScalar(Math.cos(t)).addScaledVector(b, Math.sin(t))));
  }
  return {pts, a, b};
};

// One half: side = +1 keeps the corner (+H,+H,+H), -1 keeps (-H,-H,-H).
// Returns the rind (outer faces) and the cut face as separate geometries.
export const half = (side: 1 | -1, dirs = 26000) => {
  const pts: THREE.Vector3[] = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < dirs; i++) {
    const y = 1 - (2 * (i + 0.5)) / dirs, r = Math.sqrt(1 - y * y), t = g * i;
    const d = new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r);
    const p = surf(d);
    if (side * p.dot(N_CUT) > 0.02) pts.push(p);
  }
  const {pts: ring, a, b} = sectionRing();
  pts.push(...ring);
  const hull = toCreasedNormals(new ConvexGeometry(pts), (38 * Math.PI) / 180);
  const pos = hull.getAttribute('position'), nor = hull.getAttribute('normal');
  const rind: number[] = [], rindN: number[] = [], rindUV: number[] = [];
  const cut: number[] = [], cutN: number[] = [], cutUV: number[] = [];
  const v = new THREE.Vector3(), n = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
  for (let t = 0; t < pos.count; t += 3) {
    const p0 = new THREE.Vector3().fromBufferAttribute(pos, t), p1 = new THREE.Vector3().fromBufferAttribute(pos, t + 1), p2 = new THREE.Vector3().fromBufferAttribute(pos, t + 2);
    const fn = e1.subVectors(p1, p0).cross(e2.subVectors(p2, p0)).normalize();
    const isCut = fn.dot(N_CUT) * side < -0.9995;
    const ax = Math.abs(fn.x) > Math.abs(fn.y) ? (Math.abs(fn.x) > Math.abs(fn.z) ? 0 : 2) : Math.abs(fn.y) > Math.abs(fn.z) ? 1 : 2;
    for (let k = 0; k < 3; k++) {
      v.fromBufferAttribute(pos, t + k); n.fromBufferAttribute(nor, t + k);
      if (isCut) {
        cut.push(v.x, v.y, v.z); cutN.push(-side * N_CUT.x, -side * N_CUT.y, -side * N_CUT.z);
        cutUV.push(v.dot(a) / 5 + 0.5, v.dot(b) / 5 + 0.5);
      } else {
        rind.push(v.x, v.y, v.z); rindN.push(n.x, n.y, n.z);
        const uv = ax === 0 ? [v.z, v.y] : ax === 1 ? [v.x, v.z] : [v.x, v.y];
        rindUV.push(uv[0] / 5 + 0.5 + ax * 0.31, uv[1] / 5 + 0.5 + ax * 0.17);
      }
    }
  }
  const mk = (p: number[], nn: number[], uv: number[]) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nn, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    return geo;
  };
  return {rind: mk(rind, rindN, rindUV), cut: mk(cut, cutN, cutUV)};
};
