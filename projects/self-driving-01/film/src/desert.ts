// The 2004 desert (Matthew, 2026-11-17: "the toy car in the desert looks terrible. I'm sure we can do a better desert than
// that. And a better toy car"). Mojave-like gravel desert at dusk at the far end of our street: a fine near patch (berm,
// a dirt track with tyre ruts that continues the road's centre line, gentle undulation), a coarse far ring rising into
// mountains, creosote-like scrub and scanned rocks, soft dust. The 2004-era robot vehicle is a sourced Humvee (CMU's
// Sandstorm, the 2004 leader, was a modified Humvee that got stuck on a berm) with our generic roof sensor rack.
// Sources: Poly Haven "Gravelly Sand" (CC0); "Humvee Transport" by karmy2k, "Desert Rock" by James, "Desert rock" by
// SeGook (CC BY, Sketchfab). Illustration: not a replica of any team's vehicle.
import * as THREE from 'three';
import {fit} from './assets';
import {lidar} from './lidar';
import {fbm2, rng} from './kit/realism/noise';
import {STREET_END, DESERT_Z} from './world';

export type DesertAssets = {humvee: THREE.Group; rockA: THREE.Group; rockB: THREE.Group; sand: {diff: THREE.Texture; nor: THREE.Texture; arm: THREE.Texture}};

const BERM_Z = DESERT_Z + 3.5;
// ground height (m) at x, z: track and ruts, berm across the track, undulation, mountains far away
export const desertH = (x: number, z: number) => {
  const dz = z - STREET_END;
  const rise = THREE.MathUtils.smoothstep(dz, 0, 30);                 // the road's end blends into the desert
  let h = (fbm2(x * 0.06, z * 0.06, 3) - 0.5) * 1.2 + (fbm2(x * 0.5, z * 0.5, 7) - 0.5) * 0.18;
  const track = Math.exp(-((x / 3.2) ** 2));                         // the dirt track along x = 0
  h *= 1 - 0.85 * track;
  for (const rx of [-0.95, 0.95]) h -= 0.07 * Math.exp(-(((x - rx) / 0.22) ** 2)) * track;   // tyre ruts
  h += 2.1 * Math.exp(-(((z - BERM_Z) / 3.0) ** 2)) * Math.exp(-((x / 14) ** 2));              // the berm
  const r = Math.hypot(x, (z - DESERT_Z) * 0.8);
  h += Math.max(0, r - 520) ** 1.15 * 0.16 * (0.5 + 0.9 * fbm2(x * 0.003, z * 0.003, 11));     // distant ranges
  return h * rise;
};

const groundMat = (a: DesertAssets, rep: number) => {
  const t = [a.sand.diff, a.sand.nor, a.sand.arm].map((x) => { const c = x.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(rep, rep); c.anisotropy = 8; c.needsUpdate = true; return c; });
  t[0].colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshStandardMaterial({map: t[0], normalMap: t[1], normalScale: new THREE.Vector2(1.4, 1.4), roughnessMap: t[2], aoMap: t[2], roughness: 1, metalness: 0, vertexColors: true, color: '#cdb69a'});
  return lidar(m);
};

const heightPlane = (w: number, d: number, nx: number, nz: number, cx: number, cz: number, uvScale: number) => {
  const g = new THREE.PlaneGeometry(w, d, nx, nz); g.rotateX(-Math.PI / 2); g.translate(cx, 0, cz);
  const p = g.attributes.position as THREE.BufferAttribute; const col: number[] = []; const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i); p.setY(i, desertH(x, z));
    const track = Math.exp(-((x / 3.2) ** 2)) * THREE.MathUtils.smoothstep(z - STREET_END, 0, 30);
    const v = 0.92 + 0.16 * fbm2(x * 0.03, z * 0.03, 5) - 0.18 * track;           // the track is darker and packed
    col.push(v, v * 0.97, v * 0.93); uv.setXY(i, x / uvScale, z / uvScale);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  return g;
};

export const buildDesert = (a: DesertAssets) => {
  const g = new THREE.Group(); const r = rng(77);
  // near patch, ~0.45 m cells; far ring, coarse (both start where the street ends)
  const near = new THREE.Mesh(heightPlane(130, 150, 280, 320, 0, DESERT_Z - 40, 1), groundMat(a, 1)); near.receiveShadow = true; g.add(near);
  const farG = heightPlane(2400, 1500, 240, 150, 0, STREET_END + 740, 1);
  { const fp = farG.attributes.position as THREE.BufferAttribute;          // drop the far ring under the near patch
    for (let i = 0; i < fp.count; i++) { const x = fp.getX(i), z = fp.getZ(i); if (Math.abs(x) < 62 && z > DESERT_Z - 112 && z < DESERT_Z + 32) fp.setY(i, fp.getY(i) - 1.5); }
    farG.computeVertexNormals(); }
  const far = new THREE.Mesh(farG, groundMat(a, 1)); g.add(far);
  // scrub: creosote-like clumps (jittered icosahedra), denser off the track
  const bush = new THREE.IcosahedronGeometry(0.5, 1); const bp = bush.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < bp.count; i++) { const k = 0.7 + 0.6 * r(); bp.setXYZ(i, bp.getX(i) * k, Math.max(-0.1, bp.getY(i) * k * 0.8), bp.getZ(i) * k); }
  bush.computeVertexNormals(); bush.translate(0, 0.25, 0);
  const NB = 520; const bushes = new THREE.InstancedMesh(bush, lidar(new THREE.MeshStandardMaterial({color: '#4f5a33', roughness: 0.9, flatShading: true})), NB);
  const m = new THREE.Matrix4(); let k = 0;
  while (k < NB) {
    const x = (r() - 0.5) * 120, z = DESERT_Z - 110 + r() * 140;
    if (Math.abs(x) < 4 || z < STREET_END + 8) continue;
    const s = 0.5 + r() * 1.3; m.compose(new THREE.Vector3(x, desertH(x, z) - 0.05, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 6.3, 0)), new THREE.Vector3(s, s * (0.6 + 0.4 * r()), s));
    bushes.setMatrixAt(k, m); bushes.setColorAt(k++, new THREE.Color().setHSL(0.18 + r() * 0.06, 0.25, 0.22 + r() * 0.1));
  }
  bushes.castShadow = true; g.add(bushes);
  // rocks: the two scans, scattered and a few large ones framing the berm
  const rockSrc = [fit(a.rockA.clone(true), 1, 'height'), fit(a.rockB.clone(true), 1, 'height')];
  rockSrc.forEach((o) => o.traverse((c) => { const mm = c as THREE.Mesh; if (mm.isMesh) { mm.material = lidar((mm.material as THREE.Material).clone()); mm.castShadow = true; mm.receiveShadow = true; } }));
  const placed: [number, number, number, number][] = [[-6.5, BERM_Z + 2, 2.2, 0], [7.5, BERM_Z + 5, 3.0, 1], [-14, DESERT_Z - 12, 1.4, 1], [11, DESERT_Z - 20, 1.1, 0]];
  for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * 90, z = DESERT_Z - 80 + r() * 110; if (Math.abs(x) > 4) placed.push([x, z, 0.25 + r() * 0.9, i % 2]); }
  placed.forEach(([x, z, s, w]) => { const o = rockSrc[w].clone(true); o.scale.setScalar(s); o.position.set(x, desertH(x, z) - 0.15 * s, z); o.rotation.y = x * 1.7; g.add(o); });
  return g;
};

// the 2004 robot vehicle: a sourced Humvee, our sensor rack on the roof (generic: no team markings), nose into the berm
export const buildHumvee = (src: THREE.Group) => {
  const body = fit(src.clone(true), 4.6, 'length', -Math.PI / 2); // nose toward +z, into the berm
  body.traverse((c) => { const mm = c as THREE.Mesh; if (mm.isMesh) { mm.material = lidar((mm.material as THREE.Material).clone()); mm.castShadow = true; } });
  const b = new THREE.Box3().setFromObject(body); const top = b.max.y;
  const rack = new THREE.Group(); rack.position.y = top;
  const metal = lidar(new THREE.MeshStandardMaterial({color: '#2a2b2e', roughness: 0.5, metalness: 0.7}));
  const white = lidar(new THREE.MeshStandardMaterial({color: '#b9b5ac', roughness: 0.55}));
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; rack.add(o); return o; };
  for (const x of [-0.8, 0.8]) add(new THREE.BoxGeometry(0.06, 0.06, 1.8), metal, x, 0.12, 0.1);
  for (const z of [-0.7, 0.2, 0.9]) add(new THREE.BoxGeometry(1.7, 0.06, 0.06), metal, 0, 0.12, z);
  add(new THREE.BoxGeometry(0.5, 0.28, 0.4), white, -0.45, 0.3, 0.85);             // sensor boxes
  add(new THREE.BoxGeometry(0.5, 0.28, 0.4), white, 0.45, 0.3, 0.85);
  const gimbal = add(new THREE.SphereGeometry(0.28, 20, 14), white, 0, 0.45, 0.2);   // a domed pod on a post
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), metal, 0, 0.2, 0.2); void gimbal;
  add(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 6), metal, -0.75, 0.7, -0.6);    // radio mast
  const root = new THREE.Group(); root.add(body, rack);
  const rest = new THREE.Vector3(0.6, desertH(0.6, BERM_Z - 3.6), BERM_Z - 3.6);
  root.position.copy(rest); root.rotation.set(-0.16, 0.18, 0.03);                    // nose up the berm, stuck
  root.userData.rest = rest;
  return root;
};

export const BERM = BERM_Z;
