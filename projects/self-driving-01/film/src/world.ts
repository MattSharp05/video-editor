// The night street: road along z (cars drive toward +z), crosswalk at z = CROSS_Z, kerbs at x = ±7, sidewalks to ±11,
// buildings beyond. Built once; update(t) poses the few things that change (traffic light, desert dust).
// Units: metres. Everything built here is ours (procedural); sourced pieces are placed by Film/scene.
import * as THREE from 'three';
import {lidar} from './lidar';
import {rng} from './kit/realism/noise';
import {dustSprite} from './sprite';

export const ROAD_W = 14, WALK = 4, CROSS_Z = 12, STREET_END = 330, DESERT_Z = 430;

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
};

// Asphalt: dark, slightly wet (low roughness, noisy), lane paint drawn in a tiling texture.
const asphalt = () => {
  const r = rng(7);
  const col = canvasTex(1024, 1024, (g) => {
    g.fillStyle = '#1b1c1f'; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 26000; i++) { const v = 18 + r() * 26; g.fillStyle = `rgb(${v},${v},${v + 2})`; g.fillRect(r() * 1024, r() * 1024, 2, 2); }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(0,0,0,${0.15 + r() * 0.2})`; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 30 + r() * 120, 10 + r() * 40, r() * 3, 0, 7); g.fill(); }
  }, [3, 24]);
  const rough = canvasTex(512, 512, (g) => {
    g.fillStyle = '#8a8a8a'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(20,20,20,${0.4 + r() * 0.5})`; g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 60, 8 + r() * 25, r() * 3, 0, 7); g.fill(); }
  }, [3, 24]);
  rough.colorSpace = THREE.NoColorSpace;
  return new THREE.MeshStandardMaterial({map: col, roughnessMap: rough, roughness: 0.62, metalness: 0.0});
};

// Paint: lane dashes, centre double line, crosswalk stripes, stop line; one plane slightly above the road.
const paint = (len: number, z0: number) => {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({color: '#d9d6cc', roughness: 0.5});
  const y = new THREE.MeshStandardMaterial({color: '#d8a52a', roughness: 0.5});
  const strip = (x: number, z: number, w: number, l: number, mat: THREE.Material) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, l), mat); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.012, z); g.add(p);
  };
  for (const x of [-0.12, 0.12]) strip(x, z0 + len / 2, 0.1, len, y);                                 // centre double yellow
  for (let z = z0; z < z0 + len; z += 9) for (const x of [-3.5, 3.5]) if (Math.abs(z - CROSS_Z) > 9) strip(x, z + 1.5, 0.12, 3, m);
  for (let x = -6.4; x <= 6.4; x += 1.1) strip(x, CROSS_Z, 0.55, 3.6, m);                             // crosswalk
  strip(-3.5, CROSS_Z - 2.6, 7, 0.4, m);                                                                 // stop line
  return g;
};

// Window glow for procedural towers: a grid of panes, some lit warm, some cool, most dark (seeded per building).
const windowsMat = (seed: number, hue: 'warm' | 'cool' | 'mix') => {
  const r = rng(seed);
  const tex = canvasTex(256, 512, (gg) => {
    gg.fillStyle = '#0b0d12'; gg.fillRect(0, 0, 256, 512);
    for (let y = 8; y < 512; y += 16) for (let x = 6; x < 256; x += 14) {
      const lit = r() < 0.32; const warm = hue === 'warm' || (hue === 'mix' && r() < 0.6);
      gg.fillStyle = lit ? (warm ? `rgba(255,${190 + r() * 40},${120 + r() * 50},${0.55 + r() * 0.45})` : `rgba(${170 + r() * 40},${210 + r() * 30},255,${0.5 + r() * 0.4})`) : `rgba(30,36,46,${0.6 + r() * 0.4})`;
      gg.fillRect(x, y, 10, 11);
    }
  });
  return new THREE.MeshStandardMaterial({color: '#1a1d24', roughness: 0.55, metalness: 0.2, emissiveMap: tex, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 1.25, map: tex});
};

export type World = {sign: THREE.Object3D; group: THREE.Group; tl: {setState: (s: 'red' | 'green' | 'yellow', k?: number) => void; head: THREE.Object3D}; desertDust: THREE.Points; lamps: THREE.Vector3[]};

export const buildWorld = (): World => {
  const g = new THREE.Group(); const r = rng(11);
  const zs = -160, ze = STREET_END, len = ze - zs;
  // road + sidewalks + far ground
  const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W, len, 4, 120), lidar(asphalt())); road.rotation.x = -Math.PI / 2; road.position.set(0, 0, zs + len / 2);
  road.receiveShadow = true; g.add(road);
  const crossM = asphalt(); crossM.polygonOffset = true; crossM.polygonOffsetFactor = -1; crossM.polygonOffsetUnits = -2; // wins over the road it overlaps
  const cross = new THREE.Mesh(new THREE.PlaneGeometry(400, ROAD_W, 40, 2), lidar(crossM)); cross.rotation.x = -Math.PI / 2; cross.position.set(0, 0.002, CROSS_Z + 2 + ROAD_W / 2); cross.receiveShadow = true; g.add(cross);
  const pt = paint(len, zs); const seen = new Set<THREE.Material>(); pt.traverse((c) => { const m = (c as THREE.Mesh).material as THREE.Material; if ((c as THREE.Mesh).isMesh && !seen.has(m)) { seen.add(m); lidar(m); } }); g.add(pt);
  const walkMat = lidar(new THREE.MeshStandardMaterial({color: '#4a4844', roughness: 0.8}));
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(WALK, 0.15, len), walkMat); w.position.set(s * (ROAD_W / 2 + WALK / 2), 0.075, zs + len / 2); w.receiveShadow = true; g.add(w);
    const kerb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, len), lidar(new THREE.MeshStandardMaterial({color: '#7b7770', roughness: 0.7})));
    kerb.position.set(s * (ROAD_W / 2 + 0.1), 0.08, zs + len / 2); g.add(kerb);
  }
  // cross-street opening: cut sidewalk visually with a dark patch is enough at night; ground plane around city
  // The ground sits under the road and sidewalks. It is 6 km across: as one 2-triangle quad 2 cm down, CPU (SwiftShader)
  // depth interpolation across the huge clipped triangles lost the gap, and on single frames the unlit, unshadowed
  // ground won over the road (v2: the corner lamp's pool and the car's shadow blinked out). Subdivided, 10 cm down, and
  // pushed back in depth so the road always wins.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 3000 + STREET_END, 120, 66), lidar(new THREE.MeshStandardMaterial({color: '#141516', roughness: 0.95,
    polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 8})));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.1, (STREET_END - 3000) / 2); g.add(ground); // stops where the desert begins

  // buildings: two rows of towers, broken by the cross street
  const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  let seed = 100;
  for (const s of [-1, 1]) for (let z = zs; z < ze - 20;) {
    const d = 14 + r() * 16;
    if (z < CROSS_Z + 2 + ROAD_W && z + d > CROSS_Z + 2) { z = CROSS_Z + 2 + ROAD_W + 0.5; continue; }
    const h = 12 + r() * (r() < 0.25 ? 70 : 32), w = 14 + r() * 12;
    const b = new THREE.Mesh(box, lidar(windowsMat(seed++, r() < 0.5 ? 'warm' : 'mix')));
    const mat = b.material as THREE.MeshStandardMaterial; (mat.map as THREE.Texture).repeat.set(Math.max(1, Math.round(d / 10)), Math.max(1, Math.round(h / 20)));
    (mat.map as THREE.Texture).wrapS = (mat.map as THREE.Texture).wrapT = THREE.RepeatWrapping;
    b.scale.set(w, h, d - 0.6); b.position.set(s * (ROAD_W / 2 + WALK + w / 2), 0, z + d / 2); g.add(b);
    z += d;
  }
  // street lamps: poles with a warm head; real lights only near the hero area (cost)
  const lamps: THREE.Vector3[] = [];
  const poleM = lidar(new THREE.MeshStandardMaterial({color: '#2b2d31', roughness: 0.5, metalness: 0.6}));
  const headM = new THREE.MeshStandardMaterial({color: '#fff2d8', emissive: '#ffd9a0', emissiveIntensity: 4});
  for (let z = zs + 10; z < ze; z += 26) for (const s of [-1, 1]) {
    const x = s * (ROAD_W / 2 + 0.7), zz = z + (s > 0 ? 13 : 0);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 7.5, 8), poleM); pole.position.set(x, 3.75, zz); g.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.08), poleM); arm.position.set(x - s * 0.8, 7.4, zz); g.add(arm);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.3), headM); head.position.set(x - s * 1.5, 7.32, zz); g.add(head);
    lamps.push(new THREE.Vector3(x - s * 1.5, 7.1, zz));
  }
  // traffic light on the near corner, facing the car (-z), mast arm over the lane
  const tl = new THREE.Group(); tl.position.set(-(ROAD_W / 2 + 0.6), 0, CROSS_Z - 2.2);
  const tp = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 6, 10), poleM); tp.position.y = 3; tl.add(tp);
  const tarm = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 0.12), poleM); tarm.position.set(2.1, 5.9, 0); tl.add(tarm);
  const head = new THREE.Group(); head.position.set(3.6, 5.2, 0); tl.add(head);
  head.add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.25, 0.32), lidar(new THREE.MeshStandardMaterial({color: '#1d1f22', roughness: 0.6}))));
  const lens = (['red', 'yellow', 'green'] as const).map((c, i) => {
    const col = {red: '#ff2a1a', yellow: '#ffb81a', green: '#22ff8a'}[c];
    const m = new THREE.MeshStandardMaterial({color: '#111', emissive: col, emissiveIntensity: 0});
    const l = new THREE.Mesh(new THREE.CircleGeometry(0.13, 20), m); l.position.set(0, 0.38 - i * 0.38, -0.165); l.rotation.y = Math.PI; head.add(l);
    return {c, m};
  });
  const tlLight = new THREE.PointLight('#ff3020', 0, 9, 2); tlLight.position.set(3.6, 5.2, -0.6); tl.add(tlLight);
  g.add(tl);
  const signTex = canvasTex(256, 320, (c) => { c.fillStyle = '#f4f4f0'; c.fillRect(0, 0, 256, 320); c.strokeStyle = '#111'; c.lineWidth = 10; c.strokeRect(14, 14, 228, 292);
    c.fillStyle = '#111'; c.textAlign = 'center'; c.font = 'bold 50px sans-serif'; c.fillText('SPEED', 128, 80); c.fillText('LIMIT', 128, 132); c.font = 'bold 140px sans-serif'; c.fillText('25', 128, 276); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), lidar(new THREE.MeshStandardMaterial({map: signTex, roughness: 0.6, emissive: '#ffffff', emissiveMap: signTex, emissiveIntensity: 0.08})));
  sign.position.set(-(ROAD_W / 2 + 0.5), 2.3, CROSS_Z - 6); sign.rotation.y = Math.PI; g.add(sign);
  const sp2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8), poleM); sp2.position.set(-(ROAD_W / 2 + 0.5), 1.3, CROSS_Z - 5.95); g.add(sp2);
  const setState = (s: 'red' | 'green' | 'yellow', k = 1) => {
    lens.forEach((l) => { l.m.emissiveIntensity = l.c === s ? 6 * k : 0; });
    tlLight.color.set({red: '#ff3020', yellow: '#ffb020', green: '#30ff90'}[s]); tlLight.intensity = 3 * k;
  };
  setState('red');

  const dustTex = dustSprite();
  const dustG = new THREE.BufferGeometry(); const dp: number[] = [];
  for (let i = 0; i < 900; i++) dp.push(-3 + r() * 6, r() * 3, DESERT_Z - 3 + r() * 5);
  dustG.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
  const desertDust = new THREE.Points(dustG, new THREE.PointsMaterial({color: '#cdb08a', size: 0.42, sizeAttenuation: true, transparent: true, opacity: 0.22, depthWrite: false, map: dustTex}));
  g.add(desertDust);
  return {group: g, tl: {setState, head}, desertDust, lamps, sign};
};
