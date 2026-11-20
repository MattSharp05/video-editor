// One three.js world: a flight of three lock chambers in two lanes between green hills, the sea below and Gatun Lake
// above, a sourced container ship ("Container Ship" by RM02, CC BY 4.0) and its twin going down. The top chamber of lane A
// turns to glass for the section: the culvert in the near wall, its valve, the cross culverts under the floor and the
// wells of water rising through the floor holes. Built once; per frame only levels, gates, ships, flows and the camera.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {random} from 'remotion';
import {skyLight} from './kit/realism/sky.ts';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);

// ---------- value noise for the terrain (deterministic)
const h2 = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const vn = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x: number, y: number) => { let s = 0, a = 0.5; for (let i = 0; i < 5; i++) { s += a * vn(x, y); x *= 2.03; y *= 2.03; a *= 0.5; } return s; };
const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const ZC = TL.LANE_B / 2; // centre line between the lanes
const X_END = TL.LAKE_X + 30;
// terrain height: land at the wall tops around the locks, hills beyond, sea below x < -250, the lake beyond the flight
const groundH = (x: number, z: number) => {
  const n = fbm(x * 0.0022 + 3, z * 0.0022 + 7);
  const dz = Math.abs(z - ZC);
  const hills = 29 + Math.pow(Math.max(0, n - 0.35), 1.3) * 260 * sstep(120, 420, dz);
  let h = hills;
  // the sea: land falls to sea level west of the locks
  const seaK = sstep(-120, -480, x - 0.25 * Math.abs(z) * 0);
  h = h * (1 - seaK) + (-10 + 30 * sstep(380, 900, dz) * fbm(x * 0.004, z * 0.004)) * seaK;
  // the lake: east of the flight the valleys flood; hills stand out as islands
  const lakeK = sstep(X_END + 40, X_END + 260, x);
  const lakeH = n > 0.55 ? 26 + (n - 0.55) * 300 : 14;
  h = h * (1 - lakeK) + lakeH * lakeK;
  // the approach channel from the sea and from the lake, and the lock lanes (cut below the floors)
  const inLanes = Math.abs(z) < TL.CH_W / 2 + 2 || Math.abs(z - TL.LANE_B) < TL.CH_W / 2 + 2;
  if (inLanes && x >= -60 && x < X_END + 400) h = Math.min(h, x > X_END ? 12 : -30);
  // the sea approach: one smooth trough wide enough for the 17 m grid (a lane-wide cut tore the hills)
  if (x < -60) { const k = sstep(70, 130, Math.abs(z - TL.LANE_B / 2)); h = Math.min(h, -14 * (1 - k) + h * k); }
  if (dz < 95 && x > -60 && x < X_END + 10) h = Math.max(h, 29) * (inLanes ? 0 : 1) + (inLanes ? -30 : 0);
  if (dz < 95 && x > -60 && x < X_END + 10 && !inLanes) h = TL.WALL_TOP - 0.4; // below the wall tops: coplanar faces z-fought (hook flicker)
  return h;
};

const terrain = () => {
  const N = 260, SZ = 4400;
  const g = new THREE.PlaneGeometry(SZ, SZ, N, N); g.rotateX(-Math.PI / 2); g.translate(400, 0, ZC);
  const p = g.attributes.position as THREE.BufferAttribute, colors: number[] = [];
  const grass = col('#4E7A33'), forest = col('#2C4A22'), apron = col('#8E8B82'), sand = col('#B9A77E'), rock = col('#5E5A4E');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), y = groundH(x, z);
    p.setY(i, y);
    const dz = Math.abs(z - ZC);
    let c = forest.clone().lerp(grass, fbm(x * 0.01, z * 0.01));
    if (dz < 95 && x > -60 && x < X_END + 10) c = apron.clone().lerp(grass, sstep(70, 95, dz) * 0.8);
    if (y < 3 && y > -3) c = sand.clone();
    if (y > 120) c.lerp(rock, 0.3);
    colors.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.95});
  // canopy detail the 17 m vertex grid can't hold: tree crowns and clearings from world-space noise
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWt;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWt = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWt;
      float ht(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
      float vnt(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(ht(i),ht(i+vec2(1,0)),f.x), mix(ht(i+vec2(0,1)),ht(i+vec2(1,1)),f.x), f.y); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float crowns = vnt(vWt.xz * 0.11) * 0.55 + vnt(vWt.xz * 0.37) * 0.3 + vnt(vWt.xz * 0.023) * 0.4;
        float isGreen = step(diffuseColor.g, diffuseColor.r * 2.5) * 0.0 + smoothstep(0.02, 0.06, diffuseColor.g - diffuseColor.b);
        diffuseColor.rgb *= mix(1.0, 0.55 + 0.75 * crowns, isGreen);`);
  };
  return new THREE.Mesh(g, m);
};

// water: deep green-blue, sky reflection, small ripples; transparent in the section
const waterMaterial = (env: THREE.Texture) => {
  const m = new THREE.MeshPhysicalMaterial({color: col('#2E5F5C'), roughness: 0.06, metalness: 0, envMap: env, envMapIntensity: 1.0, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 1});
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uT = {value: 0}; m.userData.sh = sh;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWw;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWw = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWw; uniform float uT;')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        vec2 q = vWw.xz * 0.35;
        float nx = sin(q.x * 1.7 + uT * 1.3) * 0.5 + sin(q.y * 2.3 - uT * 1.1 + q.x) * 0.5;
        float nz = sin(q.y * 1.9 + uT * 1.2) * 0.5 + sin(q.x * 2.1 + uT * 0.9 - q.y) * 0.5;
        normal = normalize(normal + vec3(nx, 0.0, nz) * 0.05);`);
  };
  return m;
};

// concrete: weathered grey, darker and greener low down, x-ray in the section
const concrete = (u: Record<string, THREE.IUniform>, xrayable: boolean) => {
  const m = new THREE.MeshStandardMaterial({color: col('#A39E92'), roughness: 0.9, transparent: xrayable});
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWc; varying vec3 vNc;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWc = (modelMatrix * vec4(transformed, 1.0)).xyz; vNc = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWc; varying vec3 vNc; uniform float uXray;
      float hc(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float panel = step(0.97, fract(vWc.x / 12.0)) + step(0.985, fract(vWc.y / 3.0)) * 0.5;
        float stain = smoothstep(14.0, -6.0, vWc.y) * 0.45 + hc(floor(vWc.xz / 6.0)) * 0.08;
        diffuseColor.rgb *= (1.0 - 0.18 * panel) * (1.0 - stain);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.75, 0.85, 0.72), smoothstep(6.0, -10.0, vWc.y));`)
      .replace('#include <dithering_fragment>', xrayable ? `#include <dithering_fragment>
        vec3 Vv = normalize(cameraPosition - vWc); float rim = pow(1.0 - abs(dot(normalize(vNc), Vv)), 2.5);
        vec3 xc = vec3(0.80, 0.90, 0.98) * (0.05 + rim * 0.5);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, xc, uXray);
        gl_FragColor.a = mix(1.0, 0.05 + rim * 0.22, uXray);` : '#include <dithering_fragment>');
  };
  m.customProgramCacheKey = () => (xrayable ? 'cx' : 'c');
  return m;
};

// flowing water inside a tube: cyan stripes running along the path, cut at the front
const flowMaterial = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  uniforms: {uFront: {value: 0}, uT: {value: 0}, uO: {value: 0}, uLen: {value: 100}, uC: {value: col(TL.CYAN)}},
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform float uFront; uniform float uT; uniform float uO; uniform float uLen; uniform vec3 uC; varying vec2 vUv;
    void main(){ if (vUv.x > uFront) discard;
      float s = 0.55 + 0.45 * sin(vUv.x * uLen * 0.6 - uT * 14.0) * sin(vUv.y * 6.2832 * 3.0 + vUv.x * uLen * 0.2);
      float head = smoothstep(uFront - 0.04, uFront, vUv.x) * 0.8;
      float a = (0.35 + 0.45 * s + head) * uO;
      gl_FragColor = vec4(uC * a * 1.3, a); }`,
});

const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

// a sourced model scaled to real metres: measure its world box (Sketchfab nests scales), length along +X, keel at y = 0
const placeShip = (gltf: GLTF) => {
  const s = gltf.scene.clone(true);
  s.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(s);
  const size = box.getSize(new THREE.Vector3());
  const holder = new THREE.Group(); holder.add(s);
  if (size.z > size.x) s.rotation.y = Math.PI / 2;
  s.updateMatrixWorld(true); box = new THREE.Box3().setFromObject(s);
  const sz = box.getSize(new THREE.Vector3());
  const k = TL.SHIP_L / sz.x; s.scale.multiplyScalar(k); s.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(s);
  const c = box.getCenter(new THREE.Vector3());
  s.position.sub(new THREE.Vector3(c.x, box.min.y, c.z));
  s.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.frustumCulled = false; } });
  return holder;
};

export const Scene: React.FC<{t: number; ship: GLTF}> = ({t, ship}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    const L = skyLight(gl, {elevation: 35, azimuth: 300, turbidity: 3, clouds: 0.35, visibility: 9000, hazeHeight: 300, ground: '#4a6a3a'});
    const sky = L.sky; sky.scale.setScalar(20000); scene.add(sky);
    const env = L.envMap;
    const root = new THREE.Group(); scene.add(root);
    const sun = new THREE.DirectionalLight(L.sunColor, L.sunIntensity); sun.position.copy(L.sunDir).multiplyScalar(1000); root.add(sun);
    const skyCol = L.skyIrradiance.clone(); skyCol.multiplyScalar(1 / Math.max(skyCol.r, skyCol.g, skyCol.b));
    const hemi = new THREE.HemisphereLight(skyCol, col('#5A6A40'), L.sunIntensity * 0.35); root.add(hemi);
    const tex = glowTex();

    const ter = terrain(); root.add(ter);
    // the section's cut face: everything nearer than the wall's outer face is clipped away (three.md: cut-away worlds),
    // and an earth face with the wall's outline cut out caps the hole
    gl.localClippingEnabled = true;
    const cutPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), TL.CH_W / 2 + TL.WALL_T + 0.2);
    const capShape = new THREE.Shape(); capShape.moveTo(-900, -60); capShape.lineTo(2600, -60); capShape.lineTo(2600, 29); capShape.lineTo(-900, 29); capShape.closePath();
    const hole = new THREE.Path(); hole.moveTo(TL.chX0(0) - 40, -32); hole.lineTo(TL.chX0(0) - 40, 29); hole.lineTo(X_END + 20, 29); hole.lineTo(X_END + 20, -32); hole.closePath(); capShape.holes.push(hole);
    const capMat = new THREE.MeshStandardMaterial({color: col('#5B4A38'), roughness: 1});
    capMat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWe;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWe = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWe;').replace('#include <color_fragment>', `#include <color_fragment>
        float band = 0.5 + 0.5 * sin(vWe.y * 0.9 + sin(vWe.x * 0.02) * 2.0);
        diffuseColor.rgb *= 0.65 + 0.35 * band;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.20, 0.32, 0.14), smoothstep(26.0, 28.5, vWe.y));`);
    };
    const cap = new THREE.Mesh(new THREE.ShapeGeometry(capShape), capMat); cap.position.z = TL.CH_W / 2 + TL.WALL_T + 0.2; root.add(cap);
    const wm = waterMaterial(env);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), wm); sea.rotation.x = -Math.PI / 2; sea.position.set(-9000, 0, 0); root.add(sea);
    const lake = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), wm); lake.rotation.x = -Math.PI / 2; lake.position.set(TL.LAKE_X + 4500, 26, 0); root.add(lake);
    const channelSea = new THREE.Mesh(new THREE.PlaneGeometry(1200, 120), wm); channelSea.rotation.x = -Math.PI / 2; channelSea.position.set(-610, 0, ZC); root.add(channelSea);

    // walls and floors; the near wall of lane A's top chamber and its floor can turn to glass
    const U = {uXray: {value: 0}};
    const cm = concrete(U, false), cx = concrete(U, true);
    const x0 = TL.chX0(0) - 40, x1 = X_END + 20;
    const wallAt = (z0: number, z1: number, xa: number, xb: number, mat: THREE.Material) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(xb - xa, TL.WALL_TOP + 32, z1 - z0), mat);
      b.position.set((xa + xb) / 2, (TL.WALL_TOP - 32) / 2, (z0 + z1) / 2); root.add(b); return b;
    };
    const hw = TL.CH_W / 2;
    const xs = TL.chX0(2) - 10, xe = x1;
    wallAt(hw, hw + TL.WALL_T, x0, xs, cm);
    const nearSection = wallAt(hw, hw + TL.WALL_T, xs, xe, cx); nearSection.renderOrder = 6;
    wallAt(-hw - TL.WALL_T, -hw, x0, x1, cm); // centre wall (lane A side ... lane B side)
    wallAt(TL.LANE_B - hw - TL.WALL_T, TL.LANE_B - hw, x0, x1, cm);
    const floors: THREE.Mesh[] = [];
    for (const zc of [0, TL.LANE_B]) for (let i = 0; i < 3; i++) {
      const f = new THREE.Mesh(new THREE.BoxGeometry(TL.CH_L + TL.GAP, 4, TL.CH_W), zc === 0 && i === 2 ? cx : cm);
      f.position.set(TL.chMid(i), TL.floorY(i) - 2, zc); root.add(f); floors.push(f);
    }
    // chamber water (lane, chamber)
    const wA = [0, 1, 2].map((i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(TL.CH_L + TL.GAP * 0.5, 1, TL.CH_W - 0.2), wm); m.position.x = TL.chMid(i); root.add(m); return m; });
    const wB = [0, 1, 2].map((i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(TL.CH_L + TL.GAP * 0.5, 1, TL.CH_W - 0.2), wm); m.position.set(TL.chMid(i), 0, TL.LANE_B); root.add(m); return m; });
    const wmSection = waterMaterial(env); wmSection.opacity = 0.55; wmSection.depthWrite = false;

    // mitre gates: two steel leaves per gate, hinged at the walls
    const steel = new THREE.MeshStandardMaterial({color: col('#3C4148'), roughness: 0.55, metalness: 0.6, envMap: env, envMapIntensity: 0.5});
    const leafL = hw / Math.cos((18 * Math.PI) / 180) + 0.6;
    const gates = (zc: number) => [0, 1, 2, 3].map((g) => {
      const gx = TL.chX0(g) - TL.GAP / 2, bottom = TL.floorY(Math.max(0, g - 1)) - 1, height = TL.WALL_TOP - bottom;
      return [1, -1].map((side) => {
        const pivot = new THREE.Group(); pivot.position.set(gx, bottom, zc + side * hw); root.add(pivot);
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(2.2, height, leafL), steel); leaf.position.set(0, height / 2, -side * leafL / 2); pivot.add(leaf);
        const rail = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, leafL), new THREE.MeshStandardMaterial({color: col('#E8C24A'), roughness: 0.6})); rail.position.set(0, height - 0.6, -side * leafL / 2); pivot.add(rail);
        return {pivot, side};
      });
    });
    const gatesA = gates(0), gatesB = gates(TL.LANE_B);

    // ships
    const shipA = placeShip(ship); root.add(shipA);
    const shipB = placeShip(ship); shipB.rotation.y = Math.PI; root.add(shipB);

    // the section: culvert in the near wall (intake from the lake, down a shaft, along the wall), cross culverts, wells
    const cz = hw + TL.WALL_T / 2, cy = TL.floorY(2) + 2.75;
    const mainPath = new THREE.CurvePath<THREE.Vector3>();
    mainPath.add(new THREE.LineCurve3(new THREE.Vector3(TL.LAKE_X + 26, 18, cz), new THREE.Vector3(TL.LAKE_X + 26, cy, cz)));
    mainPath.add(new THREE.LineCurve3(new THREE.Vector3(TL.LAKE_X + 26, cy, cz), new THREE.Vector3(TL.chX0(2) + 12, cy, cz)));
    const pipeMat = new THREE.MeshStandardMaterial({color: col('#55595E'), roughness: 0.8, side: THREE.DoubleSide, transparent: true, opacity: 0.55});
    const pipe = new THREE.Mesh(new THREE.TubeGeometry(mainPath, 200, 2.75, 20, false), pipeMat); root.add(pipe);
    const flowMain = new THREE.Mesh(new THREE.TubeGeometry(mainPath, 200, 2.3, 16, false), flowMaterial()); flowMain.renderOrder = 14; root.add(flowMain);
    (flowMain.material as THREE.ShaderMaterial).uniforms.uLen.value = 360;
    const CROSS = 8, crossX = Array.from({length: CROSS}, (_, k) => TL.chX0(2) + 30 + (k * (TL.CH_L - 60)) / (CROSS - 1));
    const crossFlows = crossX.map((x) => {
      const path = new THREE.LineCurve3(new THREE.Vector3(x, cy - 1.5, cz), new THREE.Vector3(x, TL.floorY(2) - 2.2, -hw + 1));
      const p = new THREE.Mesh(new THREE.TubeGeometry(path, 30, 1.4, 12, false), pipeMat); root.add(p);
      const f = new THREE.Mesh(new THREE.TubeGeometry(path, 30, 1.1, 10, false), flowMaterial()); f.renderOrder = 14; root.add(f);
      (f.material as THREE.ShaderMaterial).uniforms.uLen.value = 40;
      return f;
    });
    const wells: {m: THREE.Mesh; g: THREE.Sprite; x: number; z: number}[] = [];
    crossX.forEach((x) => [-12, -6, 0, 6, 12].forEach((z) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.6, 1, 10, 1, true), new THREE.MeshBasicMaterial({color: col(TL.CYAN), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide}));
      m.renderOrder = 15; root.add(m);
      const g = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col(TL.CYAN), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true}));
      g.scale.setScalar(5); g.renderOrder = 16; root.add(g);
      wells.push({m, g, x: x + (random('wx' + x + z) - 0.5) * 6, z});
    }));
    // level marks: two strips on the chamber's wall faces (not a plate across the chamber)
    const wallStrips = (x: number, y: number, c: string, h: number) => {
      const g = new THREE.Group(); const m = new THREE.MeshBasicMaterial({color: col(c), transparent: true, opacity: 0, toneMapped: false, depthWrite: false});
      for (const z of [hw - 0.1, -hw + 0.1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(TL.CH_L, h, 0.4), m); b.position.set(0, 0, z); b.renderOrder = 13; g.add(b); }
      g.position.set(x, y, 0); root.add(g); return {g, m};
    };
    const levelLine = wallStrips(TL.chMid(2), 26, TL.AMBER, 0.6);
    const cutEdges = new THREE.LineSegments(new THREE.EdgesGeometry(nearSection.geometry), new THREE.LineBasicMaterial({color: col(TL.GLASS), transparent: true, opacity: 0, toneMapped: false}));
    cutEdges.position.copy(nearSection.position); cutEdges.renderOrder = 18; root.add(cutEdges);
    const startLine = wallStrips(TL.chMid(2), 2 * TL.STEP, '#FFFFFF', 0.4);
    // the hook's lines on chamber 1: amber where the ship is going (+8.7 m), white where it starts
    const hookTop = wallStrips(TL.chMid(1), 2 * TL.STEP, TL.AMBER, 0.6);
    const hookStart = wallStrips(TL.chMid(1), TL.STEP, '#FFFFFF', 0.4);
    // a ship at the sea end beside the cube, for scale
    const shipC = placeShip(ship); shipC.position.set(-560, -TL.DRAFT, -90); root.add(shipC);
    const valve = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.55, 12, 40), new THREE.MeshBasicMaterial({color: col('#7E8790'), toneMapped: false}));
    valve.rotation.y = Math.PI / 2; valve.scale.setScalar(1.6); valve.position.set(TL.LAKE_X + 6, cy, cz); root.add(valve);
    const valveGlow = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col(TL.CYAN), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true}));
    valveGlow.scale.setScalar(30); valveGlow.position.copy(valve.position); valveGlow.renderOrder = 16; root.add(valveGlow);
    // step outlines (amber) round each lane A chamber at the wall top
    const gaugeMat = new THREE.MeshBasicMaterial({color: col(TL.AMBER), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, depthTest: false});
    const gBar = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 5), gaugeMat); gBar.renderOrder = 19; root.add(gBar);
    const gLine = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1.6), gaugeMat); gLine.renderOrder = 19; root.add(gLine);
    const stepMat = (i: number) => new THREE.MeshBasicMaterial({color: col(TL.AMBER), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, depthTest: false, userData: {i}});
    const steps = [0, 1, 2].map((i) => {
      const g = new THREE.Group(); const m = stepMat(i);
      for (const [w, d, x, z] of [[TL.CH_L, 1.6, 0, hw], [TL.CH_L, 1.6, 0, -hw], [1.6, TL.CH_W, -TL.CH_L / 2, 0], [1.6, TL.CH_W, TL.CH_L / 2, 0]]) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, 1.5, d * 2), m); b.position.set(x, 0, z); b.renderOrder = 17; g.add(b);
      }
      g.position.set(TL.chMid(i), TL.STEP * (i + 1) + 0.4, 0); root.add(g); return m;
    });
    // lane B drain flow, drawn over the centre wall from the top chamber to the sea
    const drainPath = new THREE.CatmullRomCurve3([new THREE.Vector3(TL.chMid(2), 30, TL.LANE_B + hw + TL.WALL_T / 2), new THREE.Vector3(TL.chX0(1), 30, TL.LANE_B + hw + TL.WALL_T / 2), new THREE.Vector3(TL.chX0(0), 30, TL.LANE_B + hw + TL.WALL_T / 2), new THREE.Vector3(-260, 2, TL.LANE_B + 10)]);
    const drain = new THREE.Mesh(new THREE.TubeGeometry(drainPath, 200, 4.5, 10, false), flowMaterial()); drain.renderOrder = 14; root.add(drain);
    (drain.material as THREE.ShaderMaterial).uniforms.uLen.value = 300;
    // the water cube at the sea end
    const cubeG = new THREE.Group(); cubeG.position.set(-611, 0, 15); root.add(cubeG);
    const cubeInner = new THREE.Group(); cubeG.add(cubeInner);
    const cubeMat = new THREE.MeshBasicMaterial({color: col(TL.CYAN), transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false, blending: THREE.NormalBlending});
    const cube = new THREE.Mesh(new THREE.BoxGeometry(TL.CUBE, TL.CUBE, TL.CUBE), cubeMat); cube.position.set(-TL.CUBE / 2, TL.CUBE / 2, 0); cube.renderOrder = 12; cubeInner.add(cube);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(TL.CUBE, TL.CUBE, TL.CUBE)), new THREE.LineBasicMaterial({color: col(TL.CYAN), transparent: true, toneMapped: false}));
    edges.position.copy(cube.position); cubeInner.add(edges);
    const splash = Array.from({length: 40}, (_, i) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col('#DDF6FF'), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending}));
      s.userData = {a: random('sa' + i) * Math.PI * 2, r: 10 + random('sr' + i) * 50, h: 10 + random('sh' + i) * 45, s: 8 + random('ss' + i) * 14};
      cubeG.add(s); return s;
    });
    return {gaugeMat, gBar, gLine, cutEdges, startLine, hookTop, hookStart, shipC, ter, cutPlane, cap, L, U, wm, wmSection, wA, wB, gatesA, gatesB, shipA, shipB, flowMain, crossFlows, wells, valveGlow, levelLine, steps, drain, cubeG, cubeInner, cubeMat, edges, splash, nearSection, floors, hemi, sun};
  }, [gl, scene, ship]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.5; cam.far = 40000;
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  gl.toneMappingExposure = 0.11;
  if (W.wm.userData.sh) W.wm.userData.sh.uniforms.uT.value = t;

  const sec = TL.inSection(t);
  (W.ter.material as THREE.Material).clippingPlanes = sec ? [W.cutPlane] : null; W.cap.visible = sec;
  W.wm.clippingPlanes = sec ? [W.cutPlane] : null;
  W.U.uXray.value = TL.xray(t);
  (W.nearSection.material as THREE.Material).depthWrite = !sec;
  (W.floors[2].material as THREE.Material).depthWrite = !sec;
  W.wA.forEach((m, i) => { const lv = TL.levelA(t, i); const fl = TL.floorY(i); m.scale.y = lv - fl; m.position.y = (lv + fl) / 2; m.material = sec && i === 2 ? W.wmSection : W.wm; });
  W.wB.forEach((m, i) => { const lv = TL.levelB(t, i); const fl = TL.floorY(i); m.scale.y = lv - fl; m.position.y = (lv + fl) / 2; });
  const leafAng = (open: number, side: number) => (side * (-18 + 108 * open) * Math.PI) / 180; // closed: a V pointing up-canal; open: folded along the wall
  W.gatesA.forEach((g, gi) => g.forEach(({pivot, side}) => { pivot.rotation.y = leafAng(TL.gateA(t, gi), side); }));
  W.gatesB.forEach((g) => g.forEach(({pivot, side}) => { pivot.rotation.y = leafAng(0, side); }));

  W.shipA.position.set(TL.shipX(t), TL.shipLevel(t) - TL.DRAFT, 0);
  W.shipB.position.set(TL.shipBX(), TL.levelB(t, 2) - TL.DRAFT, TL.LANE_B);

  // flows
  const front = TL.culvertFront(t), crossF = sec ? TL.ramp(t, TL.B.wells - 0.4, TL.B.wells + 0.2) : 0;
  const fm = W.flowMain.material as THREE.ShaderMaterial; fm.uniforms.uFront.value = front; fm.uniforms.uT.value = t; fm.uniforms.uO.value = sec ? 1 : 0;
  W.flowMain.visible = sec;
  W.crossFlows.forEach((f) => { const m = f.material as THREE.ShaderMaterial; m.uniforms.uFront.value = crossF; m.uniforms.uT.value = t; m.uniforms.uO.value = sec ? 1 : 0; f.visible = sec; });
  const wo = TL.wellsOn(t), lvl = TL.levelA(t, 2), fl2 = TL.floorY(2);
  W.wells.forEach((w, i) => {
    const hgt = Math.max(0.1, (lvl - fl2) * (0.55 + 0.35 * Math.abs(Math.sin(t * 3 + i))));
    w.m.visible = w.g.visible = wo > 0.01;
    w.m.scale.set(1, hgt, 1); w.m.position.set(w.x, fl2 + hgt / 2, w.z);
    (w.m.material as THREE.MeshBasicMaterial).opacity = 0.35 * wo;
    w.g.position.set(w.x, fl2 + 0.5, w.z); (w.g.material as THREE.SpriteMaterial).opacity = 0.8 * wo;
  });
  (W.valveGlow.material as THREE.SpriteMaterial).opacity = TL.valveOpen(t); W.valveGlow.visible = sec;
  W.levelLine.m.opacity = 0.9 * TL.levelLine(t); W.levelLine.g.visible = sec;
  W.startLine.m.opacity = 0.7 * TL.levelLine(t); W.startLine.g.visible = sec;
  (W.cutEdges.material as THREE.LineBasicMaterial).opacity = sec ? 0.9 : 0; W.cutEdges.visible = sec;
  const hl = TL.hookLines(t);
  W.hookTop.m.opacity = 0.95 * hl; W.hookStart.m.opacity = 0.7 * hl;
  W.hookTop.g.visible = W.hookStart.g.visible = hl > 0.01;
  W.shipC.visible = t >= TL.CUT_SEA;
  W.steps.forEach((m, i) => { m.opacity = 0.95 * TL.stepMarks(t, i); });
  { const hb = Math.max(0.01, 26 * TL.gaugeBar(t)), L = Math.max(0.01, (TL.LAKE_X - TL.GAUGE_X) * TL.gaugeLine(t));
    W.gaugeMat.opacity = 0.95 * TL.gaugeOn(t) * Math.min(1, TL.gaugeBar(t) * 4);
    W.gBar.scale.y = hb; W.gBar.position.set(TL.GAUGE_X, hb / 2, TL.GAUGE_Z);
    W.gLine.scale.x = L; W.gLine.position.set(TL.GAUGE_X + L / 2, 26, TL.GAUGE_Z);
    W.gBar.visible = W.gLine.visible = W.gaugeMat.opacity > 0.01; }
  const dr = TL.drainOn(t), dm = W.drain.material as THREE.ShaderMaterial;
  W.drain.visible = dr > 0.01; dm.uniforms.uFront.value = TL.ramp(t, TL.B.goingDown, TL.B.sea + 0.5); dm.uniforms.uT.value = t; dm.uniforms.uO.value = dr;

  // the cube tips over its sea-side bottom edge and pours out
  const co = TL.cubeOn(t), tip = TL.cubeTip(t);
  W.cubeG.visible = co > 0.01;
  W.cubeInner.rotation.z = (tip * Math.PI) / 2.2;
  W.cubeInner.scale.set(1, Math.max(0.02, 1 - TL.ramp(tip, 0.4, 1)), 1);
  W.cubeMat.opacity = 0.42 * co * (1 - TL.ramp(tip, 0.6, 1));
  (W.edges.material as THREE.LineBasicMaterial).opacity = co * (1 - TL.ramp(tip, 0.5, 0.9));
  W.splash.forEach((s) => {
    const u = s.userData as {a: number; r: number; h: number; s: number};
    const k = TL.hump(tip, 0.45, 0.55);
    s.visible = k > 0.01; s.position.set(-TL.CUBE - 20 + Math.cos(u.a) * u.r * (0.5 + tip), u.h * k, Math.sin(u.a) * u.r);
    s.scale.setScalar(u.s * (0.5 + tip)); (s.material as THREE.SpriteMaterial).opacity = 0.5 * k;
  });
  return null;
};
