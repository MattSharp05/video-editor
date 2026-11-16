// Everything drawn on top of the street, built once and posed by time: the aerial city with ride trails, the 2004
// truck, lidar pulses, radar shell, rain, camera cones, ghosts, the plan's ghost cars and ribbon, practice tiles,
// Tesla's cameras and network, a driver silhouette, the night map of the US with 15 Waymo metros.
// Looks follow concept.md "One visual language". All procedural (ours).
import * as THREE from 'three';
import {rng} from './kit/realism/noise';
import {lidar} from './lidar';
import {STREET_END, DESERT_Z} from './world';

export const C = {
  you: '#ff8a2a', lidar: '#46e8ff', radar: '#9b6bff', cam: '#fff1d6', ghost: '#e9f2ff', plan: '#3dff8c',
};

const additive = (color: string, opacity = 1) => new THREE.MeshBasicMaterial({color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false});

// ---------- aerial city: instanced towers around the street + light trails on a street grid ----------
export const buildCity = () => {
  const g = new THREE.Group(); const r = rng(21);
  const N = 2600; const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  const winTex = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d')!;
    x.fillStyle = '#07090d'; x.fillRect(0, 0, 64, 128);
    for (let y = 2; y < 128; y += 4) for (let i = 1; i < 64; i += 4) { const lit = r() < 0.3; x.fillStyle = lit ? `rgba(255,${200 + r() * 40},${140 + r() * 60},${0.5 + r() * 0.5})` : '#10141b'; x.fillRect(i, y, 2, 2); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  })();
  const mat = lidar(new THREE.MeshStandardMaterial({color: '#151820', map: winTex, emissiveMap: winTex, emissive: '#ffffff', emissiveIntensity: 1.1, roughness: 0.7}));
  const towers = new THREE.InstancedMesh(box, mat, N); const m = new THREE.Matrix4(); let k = 0;
  const BLOCK = 80;
  for (let bx = -14; bx <= 14 && k < N; bx++) for (let bz = -16; bz <= 5 && k < N; bz++) {
    const cx = bx * BLOCK, cz = bz * BLOCK + 40;
    if (Math.abs(cx) < 30 && cz > -200 && cz < STREET_END + 40) continue; // our detailed street
    if (cz > STREET_END - 20) continue;                                     // the desert begins
    for (let q = 0; q < 4 && k < N; q++) {
      const w = 22 + r() * 12, d = 22 + r() * 12, dist = Math.hypot(cx, cz + 300) / 1100;
      const h = (10 + r() * 30) * (1 + 3 * Math.max(0, 1 - dist) * r());
      m.compose(new THREE.Vector3(cx + (q % 2 ? 1 : -1) * 18, 0, cz + (q < 2 ? 1 : -1) * 18), new THREE.Quaternion(), new THREE.Vector3(w, h, d));
      towers.setMatrixAt(k++, m);
    }
  }
  towers.count = k; g.add(towers);
  // trails: each a thin bright bar riding a grid street; head white, tail red alternating
  const T = 1800; const tg = new THREE.BoxGeometry(1, 1, 1);
  const trails = new THREE.InstancedMesh(tg, new THREE.MeshBasicMaterial({color: '#ffffff', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false}), T);
  const spec = Array.from({length: T}, (_, i) => ({axis: r() < 0.5 ? 0 : 1, line: Math.round((r() - 0.5) * 30) * BLOCK + (r() < 0.5 ? -3 : 3), off: r() * 2400, sp: 30 + r() * 40, dir: r() < 0.5 ? 1 : -1, red: i % 3 === 0}));
  spec.forEach((s, i) => trails.setColorAt(i, new THREE.Color(s.red ? '#ff4a3a' : '#fff4e0')));
  g.add(trails);
  const update = (t: number, on: number) => {
    const q = new THREE.Quaternion();
    spec.forEach((s, i) => {
      const p = ((s.off + s.dir * s.sp * t * 3) % 2400 + 2400) % 2400 - 1200;
      const len = 14 * on + 0.001;
      const pos = s.axis ? new THREE.Vector3(s.line, 0.8, p * 0.77 - 680) : new THREE.Vector3(p, 0.8, s.line * 0.8 - 700);
      m.compose(pos, q, s.axis ? new THREE.Vector3(1.6, 1.0, len) : new THREE.Vector3(len, 1.0, 1.6)); trails.setMatrixAt(i, m);
    });
    trails.instanceMatrix.needsUpdate = true; trails.visible = on > 0.01;
  };
  return {group: g, update};
};

// ---------- the 2004 desert truck: a generic boxy SUV with a sensor rack, nose in the berm ----------
export const buildTruck = () => {
  const g = new THREE.Group();
  const paint = lidar(new THREE.MeshStandardMaterial({color: '#8b1e1a', roughness: 0.5, metalness: 0.3}));
  const dark = lidar(new THREE.MeshStandardMaterial({color: '#1a1b1d', roughness: 0.8}));
  const glass = lidar(new THREE.MeshStandardMaterial({color: '#141a20', roughness: 0.15, metalness: 0.6}));
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  add(new THREE.BoxGeometry(2.0, 1.0, 4.6), paint, 0, 1.15, 0);
  add(new THREE.BoxGeometry(1.86, 0.75, 2.6), glass, 0, 2.0, -0.4);
  add(new THREE.BoxGeometry(2.1, 0.12, 2.2), dark, 0, 2.45, -0.4);              // roof rack
  for (const x of [-0.7, 0, 0.7]) add(new THREE.BoxGeometry(0.3, 0.22, 0.3), dark, x, 2.62, 0.4);   // sensor boxes
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), dark, 0.8, 2.9, -1.2);   // mast
  for (const [x, z] of [[-1, 1.5], [1, 1.5], [-1, -1.5], [1, -1.5]]) { const w = add(new THREE.CylinderGeometry(0.48, 0.48, 0.35, 20), dark, x, 0.48, z); w.rotation.z = Math.PI / 2; }
  g.position.set(0.8, 0.0, DESERT_Z - 1); g.rotation.set(-0.12, 0.25, 0.04); // nose up the berm, stuck
  return g;
};

// ---------- lidar pulse beads with a short trail ----------
export const buildPulses = () => {
  const mk = () => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 10), additive(C.lidar)); const halo = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 10), additive(C.lidar, 0.3)); s.add(halo); return s; };
  const a = mk(), b = mk(); const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({color: C.lidar, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending}));
  const lineB = line.clone(); lineB.material = (line.material as THREE.LineBasicMaterial).clone();
  const g = new THREE.Group(); g.add(a, b, line, lineB);
  const pose = (bead: THREE.Mesh, ln: THREE.Line, from: THREE.Vector3, to: THREE.Vector3, k: number, on: boolean) => {
    // k: 0..1 out, 1..2 back
    bead.visible = ln.visible = on;
    if (!on) return;
    const out = k <= 1, u = out ? k : 2 - k;
    bead.position.lerpVectors(from, to, u);
    ln.geometry.setFromPoints([from, bead.position.clone()]);
  };
  return {group: g, a, b, line, lineB, pose};
};

// ---------- radar shell ----------
export const buildShell = () => {
  const m = new THREE.MeshBasicMaterial({color: C.radar, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, wireframe: true});
  const s = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), m);
  const fill = new THREE.Mesh(new THREE.SphereGeometry(0.995, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({color: C.radar, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide}));
  fill.name = 'fill'; s.add(fill);
  return s;
};

// ---------- rain: instanced streaks in a box that follows the camera ----------
export const buildRain = () => {
  const N = 2400, r = rng(5);
  const geo = new THREE.BoxGeometry(0.012, 0.5, 0.012);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({color: '#bcd6ff', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending}), N);
  const seeds = Array.from({length: N}, () => [r(), r(), r(), 0.8 + r() * 0.4]);
  const m = new THREE.Matrix4();
  const update = (t: number, centre: THREE.Vector3, on: number) => {
    mesh.visible = on > 0.01; if (!mesh.visible) return;
    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.35 * on;
    seeds.forEach(([a, b, c, sp], i) => {
      const y = 14 - ((c * 14 + t * 9 * sp) % 14);
      const ang = a * Math.PI * 2, rr = 3 + b * 17; m.makeTranslation(centre.x + Math.cos(ang) * rr, y, centre.z + Math.sin(ang) * rr); mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  return {mesh, update};
};

// ---------- camera cone (a frustum-ish cone from a lens, pale warm white) ----------
export const cone = (len: number, angle: number, color = C.cam, opacity = 0.045) => {
  const r = Math.tan(angle) * len;
  const geo = new THREE.ConeGeometry(r, len, 32, 1, true); geo.translate(0, -len / 2, 0); geo.rotateX(-Math.PI / 2); // apex at origin, opens toward +z
  const mat = new THREE.MeshBasicMaterial({color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide});
  const o = new THREE.Mesh(geo, mat);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ConeGeometry(r, len, 8, 1, true).translate(0, -len / 2, 0).rotateX(-Math.PI / 2)), new THREE.LineBasicMaterial({color, transparent: true, opacity: opacity * 2.5, blending: THREE.AdditiveBlending}));
  o.add(edge); return o;
};

// ---------- ghosts: a see-through white copy (for possible futures) ----------
export const ghostMat = (opacity: number) => new THREE.MeshBasicMaterial({color: C.ghost, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false});
export const ghostify = (o: THREE.Object3D, opacity: number) => {
  const mat = ghostMat(opacity);
  o.traverse((c) => { const m = c as THREE.Mesh; if (m.isMesh) { m.material = mat; m.castShadow = false; } });
  return mat;
};

// ---------- the plan: ghost cars along a fan of paths, and the chosen ribbon ----------
export const carProxy = () => {
  const g = new THREE.BoxGeometry(1.9, 0.75, 4.6); g.translate(0, 0.55, 0);
  const cab = new THREE.BoxGeometry(1.6, 0.55, 2.4); cab.translate(0, 1.18, -0.2);
  const merged = new THREE.BufferGeometry();
  const pos = [...(g.toNonIndexed().attributes.position.array as Float32Array), ...(cab.toNonIndexed().attributes.position.array as Float32Array)];
  merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); merged.computeVertexNormals();
  return merged;
};
export const buildPlan = () => {
  const N = 36; const mesh = new THREE.InstancedMesh(carProxy(), new THREE.MeshBasicMaterial({color: '#ffffff', transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false}), N);
  for (let i = 0; i < N; i++) mesh.setColorAt(i, new THREE.Color(C.ghost));
  const edges = new THREE.InstancedMesh(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.9, 1.4, 4.6).translate(0, 0.75, 0)) as unknown as THREE.BufferGeometry, new THREE.MeshBasicMaterial({color: '#fff'}), 1);
  edges.visible = false;
  const ribbonMat = new THREE.MeshBasicMaterial({color: C.plan, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide});
  const ribbon = new THREE.Mesh(new THREE.BufferGeometry(), ribbonMat);
  const setRibbon = (pts: THREE.Vector3[], upto: number, width = 1.9) => {
    const n = Math.max(2, Math.floor(pts.length * upto)); const v: number[] = []; const idx: number[] = [];
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[Math.min(i + 1, pts.length - 1)], pr = pts[Math.max(i - 1, 0)];
      const d = new THREE.Vector3().subVectors(q, pr).setY(0).normalize(); const sx = -d.z * width / 2, sz = d.x * width / 2;
      v.push(p.x + sx, 0.03, p.z + sz, p.x - sx, 0.03, p.z - sz);
      if (i < n - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.setIndex(idx);
    ribbon.geometry.dispose(); ribbon.geometry = geo;
  };
  const g = new THREE.Group(); g.add(mesh, ribbon);
  return {group: g, mesh, ribbon, ribbonMat, setRibbon, N};
};

// ---------- practice tiles: copies of a street block drawn as point tiles, to the horizon ----------
export const buildTiles = () => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d')!; const r = rng(9);
  x.fillStyle = '#02060a'; x.fillRect(0, 0, 256, 256);
  const dot = (px: number, py: number, a: number, col = '70,232,255') => { x.fillStyle = `rgba(${col},${a})`; x.fillRect(px, py, 2, 2); };
  for (let y = 0; y < 256; y += 3) { dot(110 + r() * 2, y, 0.8); dot(146 + r() * 2, y, 0.8); }              // kerbs
  for (let i = 0; i < 26; i++) { const bx = r() < 0.5 ? 10 + r() * 80 : 166 + r() * 80, by = r() * 230, w = 20 + r() * 40, h = 20 + r() * 40;
    for (let k = 0; k < w; k += 3) { dot(bx + k, by, 0.55); dot(bx + k, by + h, 0.55); } for (let k = 0; k < h; k += 3) { dot(bx, by + k, 0.55); dot(bx + w, by + k, 0.55); } }
  x.strokeStyle = 'rgba(70,232,255,0.5)'; x.lineWidth = 2; x.strokeRect(1, 1, 254, 254);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const S = 180, R = 26; const N = (2 * R + 1) ** 2;
  const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(S * 0.96, S * 0.96).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false}), N);
  const cells: [number, number, number][] = [];
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) cells.push([i, j, Math.hypot(i, j)]);
  // agents: tiny cars/people dots moving in each visible tile are carried by the texture offset (cheap)
  const m = new THREE.Matrix4(); const cars = new THREE.InstancedMesh(new THREE.BoxGeometry(2, 1, 4.5), additive(C.plan, 0.9), 900);
  const update = (wave: number, t: number, y = 0.3) => {
    mesh.visible = cars.visible = wave > 0;
    cells.forEach(([i, j, d], k) => {
      const s = d < 0.5 ? 0 : THREE.MathUtils.clamp(wave * (R + 2) - d, 0, 1);
      m.compose(new THREE.Vector3(i * S, y, j * S + 80), new THREE.Quaternion(), new THREE.Vector3(s, 1, s)); mesh.setMatrixAt(k, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    for (let k = 0; k < 900; k++) {
      const [i, j, d] = cells[(k * 37) % cells.length]; const s = THREE.MathUtils.clamp(wave * (R + 2) - d, 0, 1);
      const zz = ((k * 13.7 + t * 25) % S) - S / 2;
      m.compose(new THREE.Vector3(i * S + (k % 2 ? 4 : -4), y + 0.5, j * S + 80 + zz), new THREE.Quaternion(), new THREE.Vector3(s, s, s)); cars.setMatrixAt(k, m);
    }
    cars.instanceMatrix.needsUpdate = true;
  };
  const g = new THREE.Group(); g.add(mesh, cars);
  return {group: g, update};
};

// ---------- Tesla: eight camera cones, light streams into one knot, a beam to the wheel ----------
export const buildTeslaNet = () => {
  const g = new THREE.Group();
  // lens positions on a current Model Y (car frame, nose +z): windscreen x2, front bumper x1, B-pillars x2,
  // front fenders x2, rear x1 (owner's manual layout; fact-check 2026-11-16)
  const lenses: [number, number, number, number][] = [ // x, y, z, yaw(deg; 0 = forward)
    [0.06, 1.45, 0.75, 0], [-0.06, 1.45, 0.75, 0], [0, 0.5, 2.3, 0], [0.92, 1.1, -0.2, 70], [-0.92, 1.1, -0.2, -70],
    [0.95, 0.85, 1.2, 120], [-0.95, 0.85, 1.2, -120], [0, 1.05, -2.25, 180]];
  const cones = lenses.map(([x, y, z, yaw], i) => {
    const c = cone(i === 0 ? 30 : i === 1 ? 16 : i === 2 ? 10 : 12, i === 0 ? 0.3 : i === 1 ? 0.6 : i === 2 ? 0.75 : 0.62); c.position.set(x, y, z); c.rotation.y = THREE.MathUtils.degToRad(yaw); g.add(c); return c;
  });
  const knot = new THREE.Group(); knot.position.set(0, 3.2, 0); g.add(knot);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), additive(C.cam, 0.9)); knot.add(core);
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 1), new THREE.MeshBasicMaterial({color: C.cam, wireframe: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending})); knot.add(shell);
  // node layers (the network): three rings of nodes
  const nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), additive(C.cam, 0.9), 48);
  const m = new THREE.Matrix4(); for (let i = 0; i < 48; i++) { const ring = Math.floor(i / 16), a = (i % 16) / 16 * Math.PI * 2; m.makeTranslation(Math.cos(a) * (0.9 - ring * 0.2), (ring - 1) * 0.28, Math.sin(a) * (0.9 - ring * 0.2)); nodes.setMatrixAt(i, m); }
  knot.add(nodes);
  const S = 400; const streams = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 6, 4), additive(C.cam, 1), S); g.add(streams);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 8).translate(0, -0.5, 0), additive(C.cam, 0.9)); beam.position.set(0, 3.2, 0); g.add(beam);
  const update = (t: number, k: {cones: number; streams: number; knot: number; beam: number}, wheel: THREE.Vector3) => {
    cones.forEach((c, i) => { const s = THREE.MathUtils.clamp(k.cones * 8 - i * 0.6, 0, 1); c.scale.setScalar(Math.max(s, 0.001)); c.visible = s > 0; });
    knot.visible = k.knot > 0; knot.scale.setScalar(Math.max(0.001, k.knot)); knot.rotation.y = t * 0.8; shell.rotation.x = t * 0.5;
    streams.visible = k.streams > 0;
    for (let i = 0; i < S; i++) {
      const L = lenses[i % 8], ph = ((i / S) * 7.3 + t * 0.9) % 1; const tip = new THREE.Vector3(L[0], L[1], L[2]);
      const out = new THREE.Vector3(Math.sin(THREE.MathUtils.degToRad(L[3])), 0, Math.cos(THREE.MathUtils.degToRad(L[3]))).multiplyScalar(5 * (1 - ph)).add(tip);
      const p = ph < 0.6 ? out.lerp(tip, ph / 0.6) : tip.clone().lerp(knot.position, (ph - 0.6) / 0.4).add(new THREE.Vector3(0, Math.sin((ph - 0.6) / 0.4 * Math.PI) * 0.6, 0));
      const s = k.streams * (0.6 + 0.4 * Math.sin(i));
      m.compose(p, new THREE.Quaternion(), new THREE.Vector3(s, s, s)); streams.setMatrixAt(i, m);
    }
    streams.instanceMatrix.needsUpdate = true;
    beam.visible = k.beam > 0; const dl = knot.position.distanceTo(wheel); beam.scale.set(1, Math.max(0.001, dl * k.beam), 1);
    beam.lookAt(g.localToWorld(wheel.clone())); beam.rotateX(-Math.PI / 2);
  };
  return {group: g, update, cones};
};

// ---------- a seated driver silhouette (seen through tinted glass only) ----------
export const buildDriver = () => {
  const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({color: '#2a2622', roughness: 0.9});
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.45, 6, 12), m); torso.position.set(0, 0.85, -0.05); torso.rotation.x = -0.25; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), new THREE.MeshStandardMaterial({color: '#6b4c3a', roughness: 0.7})); head.position.set(0, 1.28, 0.05); g.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({color: '#1a1410', roughness: 0.8})); hair.position.copy(head.position).add(new THREE.Vector3(0, 0.01, -0.01)); g.add(hair);
  for (const s of [-1, 1]) { const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.42, 4, 8), m); arm.position.set(s * 0.2, 0.95, 0.25); arm.rotation.x = -1.1; g.add(arm); }
  const eyeCone = cone(4.5, 0.3, C.cam, 0.25); eyeCone.position.set(0, 1.3, 0.12); g.add(eyeCone);
  return {group: g, eyeCone};
};

// ---------- night map of the US: a crop of NASA Black Marble on a flat plane at true scale, Phoenix at the origin ----------
export const LL0 = {lon: -112.074, lat: 33.448}; // Phoenix
const KX = 111320 * Math.cos(THREE.MathUtils.degToRad(38)), KZ = 110540;
export const ll = (lon: number, lat: number) => new THREE.Vector3((lon - LL0.lon) * KX, 0, -(lat - LL0.lat) * KZ);
export const METROS: [string, number, number][] = [
  ['Phoenix', -112.07, 33.45], ['SF Bay Area', -122.42, 37.77], ['Los Angeles', -118.24, 34.05], ['San Diego', -117.16, 32.72],
  ['Las Vegas', -115.14, 36.17], ['Denver', -104.99, 39.74], ['Austin', -97.74, 30.27], ['San Antonio', -98.49, 29.42],
  ['Dallas', -96.80, 32.78], ['Houston', -95.37, 29.76], ['Nashville', -86.78, 36.16], ['Atlanta', -84.39, 33.75],
  ['Orlando', -81.38, 28.54], ['Tampa', -82.46, 27.95], ['Miami', -80.19, 25.76]];
export const buildMap = (night: THREE.Texture) => {
  const lon0 = -127, lon1 = -64, lat0 = 22, lat1 = 51;
  const a = ll(lon0, lat1), b = ll(lon1, lat0);
  const geo = new THREE.PlaneGeometry(b.x - a.x, b.z - a.z); geo.rotateX(-Math.PI / 2); geo.translate((a.x + b.x) / 2, 0, (a.z + b.z) / 2);
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) { const u = uv.getX(i), v = uv.getY(i); uv.setXY(i, ((lon0 + (lon1 - lon0) * u) + 180) / 360, ((lat0 + (lat1 - lat0) * v) + 90) / 180); }
  night.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({map: night, color: new THREE.Color(0.55, 0.6, 0.75), transparent: true, opacity: 0, depthWrite: false});
  const plane = new THREE.Mesh(geo, mat); plane.position.y = -40; plane.renderOrder = -1;
  const dots = METROS.map(([, lon, lat]) => {
    const d = new THREE.Mesh(new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2), additive(C.lidar, 1)); d.position.copy(ll(lon, lat)).setY(-30);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32).rotateX(-Math.PI / 2), additive(C.lidar, 0.25)); d.add(halo);
    return d;
  });
  const g = new THREE.Group(); g.add(plane, ...dots);
  return {group: g, plane, mat, dots};
};
