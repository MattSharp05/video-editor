// Cars from sourced models (see brief "Assets"), normalised to metres, nose toward +z.
// Robotaxi: Jaguar I-PACE (Sketchfab, CC BY) repainted white, with our own roof sensor dome and side sensor pods
// (a generic robotaxi sensor suite; no logos). Its wheels are merged per material in the file, so we split the
// wheel meshes into four pivots by quadrant and spin them by distance travelled (angle = distance / radius).
import * as THREE from 'three';
import {fit} from './assets';
import {lidarAll} from './lidar';

export type Car = {root: THREE.Group; body: THREE.Group; wheels: THREE.Object3D[]; radius: number; dome?: THREE.Object3D; spinner?: THREE.Object3D;
  lights: {head: THREE.MeshStandardMaterial[]; tail: THREE.MeshStandardMaterial[]}; seat: THREE.Vector3; move: {value: number}};

const WHEEL_MATS = /pneu|jante|disk|frein|tire|tyre|rim|wheel/i;

const splitWheels = (model: THREE.Object3D) => {
  // gather wheel meshes (world-space geometry inside the fitted model)
  model.updateMatrixWorld(true);
  const pieces: {geo: THREE.BufferGeometry; mat: THREE.Material}[] = [];
  const kill: THREE.Mesh[] = [];
  model.traverse((c) => {
    const m = c as THREE.Mesh; if (!m.isMesh) return;
    const mat = m.material as THREE.Material;
    if (!WHEEL_MATS.test(mat.name)) return;
    // copy to plain Float32 (sourced GLBs store quantised int16 positions; transforming those in place overflows)
    const src = m.geometry, geo = new THREE.BufferGeometry();
    for (const name of ['position', 'normal', 'uv']) {
      const a = src.getAttribute(name) as THREE.BufferAttribute | undefined; if (!a) continue;
      const out = new Float32Array(a.count * a.itemSize);
      for (let i = 0; i < a.count; i++) for (let c = 0; c < a.itemSize; c++) out[i * a.itemSize + c] = a.getComponent(i, c);
      geo.setAttribute(name, new THREE.BufferAttribute(out, a.itemSize));
    }
    if (src.index) geo.setIndex(Array.from(src.index.array as ArrayLike<number>));
    geo.applyMatrix4(m.matrixWorld); pieces.push({geo, mat}); kill.push(m);
  });
  kill.forEach((m) => m.parent?.remove(m));
  const quads: THREE.Group[] = [];
  const box = new THREE.Box3();
  pieces.forEach((p) => box.union(new THREE.Box3().setFromBufferAttribute(p.geo.attributes.position as THREE.BufferAttribute)));
  const cz = (box.min.z + box.max.z) / 2;
  for (let q = 0; q < 4; q++) {
    const sx = q % 2 ? 1 : -1, sz = q < 2 ? 1 : -1;
    const grp = new THREE.Group(); const parts: THREE.Mesh[] = [];
    pieces.forEach((p) => {
      const pos = p.geo.attributes.position as THREE.BufferAttribute; const idx = p.geo.index;
      const tri = idx ? idx.count / 3 : pos.count / 3; const keep: number[] = [];
      for (let t = 0; t < tri; t++) {
        const a = idx ? idx.getX(t * 3) : t * 3;
        if (Math.sign(pos.getX(a)) === sx && Math.sign(pos.getZ(a) - cz) === sz) keep.push(t);
      }
      if (!keep.length) return;
      const g2 = new THREE.BufferGeometry();
      for (const name of Object.keys(p.geo.attributes)) {
        const src = p.geo.attributes[name] as THREE.BufferAttribute; const out = new Float32Array(keep.length * 3 * src.itemSize);
        keep.forEach((t, k) => { for (let v = 0; v < 3; v++) { const vi = idx ? idx.getX(t * 3 + v) : t * 3 + v; for (let c = 0; c < src.itemSize; c++) out[(k * 3 + v) * src.itemSize + c] = src.array[vi * src.itemSize + c] as number; } });
        g2.setAttribute(name, new THREE.BufferAttribute(out, src.itemSize));
      }
      parts.push(new THREE.Mesh(g2, p.mat));
    });
    const wb = new THREE.Box3(); parts.forEach((m) => wb.union(new THREE.Box3().setFromObject(m)));
    const c = wb.getCenter(new THREE.Vector3());
    grp.position.copy(c); parts.forEach((m) => { m.geometry.translate(-c.x, -c.y, -c.z); grp.add(m); });
    grp.userData.radius = (wb.max.y - wb.min.y) / 2;
    quads.push(grp);
  }
  return quads;
};

const domeParts = (roofY: number, roofZ: number) => {
  const g = new THREE.Group(); g.position.set(0, roofY, roofZ);
  const white = new THREE.MeshStandardMaterial({color: '#e9ebee', roughness: 0.35, metalness: 0.1});
  const dark = new THREE.MeshPhysicalMaterial({color: '#0a0c10', roughness: 0.12, metalness: 0.2, clearcoat: 1});
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.12, 40), white); base.position.y = 0.06; g.add(base);
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.32, 40), dark); can.position.y = 0.28; g.add(can);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.3, 0.06, 40), white); cap.position.y = 0.47; g.add(cap);
  const spinner = new THREE.Group(); spinner.position.y = 0.28; g.add(spinner);
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.02), new THREE.MeshStandardMaterial({color: '#103040', emissive: '#40e8ff', emissiveIntensity: 1.5}));
  win.position.set(0, 0, 0.315); spinner.add(win);
  return {g, spinner};
};

const pod = (x: number, y: number, z: number) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.16, 20), new THREE.MeshPhysicalMaterial({color: '#0a0c10', roughness: 0.15, clearcoat: 1}));
  m.position.set(x, y, z); return m;
};

export const makeRobotaxi = (src: THREE.Group): Car => {
  const model = src.clone(true);
  model.traverse((c) => {
    const m = c as THREE.Mesh; if (!m.isMesh) return;
    const mat = (m.material as THREE.MeshStandardMaterial).clone(); m.material = mat; m.castShadow = true;
    if (/^body|jaguar_bleu|ipace/i.test(mat.name)) { mat.color.set('#eef0f2'); mat.map = null; mat.metalness = 0.25; mat.roughness = 0.28; }
    if (/vitre|glass/i.test(mat.name)) { mat.color.set('#20262c'); mat.transparent = true; mat.opacity = 0.42; mat.roughness = 0.05; mat.metalness = 0.4; mat.depthWrite = false; }
  });
  const body = fit(model, 4.68);
  const wheels = splitWheels(body);
  const root = new THREE.Group(); root.add(body); wheels.forEach((w) => root.add(w));
  const b = new THREE.Box3().setFromObject(body);
  const {g, spinner} = domeParts(b.max.y - 0.02, -0.25); g.scale.setScalar(0.78); root.add(g);
  for (const s of [-1, 1]) { root.add(pod(s * 0.96, 0.95, 1.95)); root.add(pod(s * 0.98, 0.95, -1.7)); }
  const lights = {head: [] as THREE.MeshStandardMaterial[], tail: [] as THREE.MeshStandardMaterial[]};
  root.traverse((c) => {
    const m = c as THREE.Mesh; if (!m.isMesh) return; const mat = m.material as THREE.MeshStandardMaterial;
    if (/phare_led|led_blanc|phare_vitre/i.test(mat.name)) { mat.emissive = new THREE.Color('#f4f8ff'); mat.emissiveIntensity = 3; lights.head.push(mat); }
    if (/feux_rouge|feux_led_red|feux_glass_red/i.test(mat.name)) { mat.emissive = new THREE.Color('#ff1810'); mat.emissiveIntensity = 2; lights.tail.push(mat); }
  });
  const move = {value: 0}; lidarAll(root, move);
  return {root, body, wheels, radius: wheels[0]?.userData.radius ?? 0.36, dome: g, spinner, lights, seat: new THREE.Vector3(-0.38, 0.95, 0.15), move};
};

export const makeTesla = (src: THREE.Group, paint = '#d9dde2'): Car => {
  const model = src.clone(true);
  model.traverse((c) => { const m = c as THREE.Mesh; if (!m.isMesh) return; m.material = (m.material as THREE.Material).clone(); m.castShadow = true;
    const mat = m.material as THREE.MeshStandardMaterial; mat.roughness = 0.35; mat.metalness = 0.2; mat.color.set(paint); });
  const body = fit(model, 4.75);
  const root = new THREE.Group(); root.add(body);
  const move = {value: 0}; lidarAll(root, move);
  return {root, body, wheels: [], radius: 0.36, lights: {head: [], tail: []}, seat: new THREE.Vector3(-0.38, 0.95, 0.1), move};
};

// Pose a car at (x, z) heading `yaw` (0 = +z), having travelled `dist` metres (wheel spin).
export const poseCar = (c: Car, x: number, z: number, yaw: number, dist: number) => {
  c.root.position.set(x, 0, z); c.root.rotation.y = yaw;
  c.wheels.forEach((w) => { w.rotation.x = dist / c.radius; });
};
