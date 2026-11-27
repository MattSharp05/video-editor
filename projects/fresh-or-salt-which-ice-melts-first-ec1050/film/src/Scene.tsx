// One world: a kitchen counter (units: centimetres) in soft window light.
//  COUNTER  oiled oak worktop, a tiled wall behind (soft, low contrast), a window glow from the left, a plant.
//  GLASSES  two tumblers (thick base, thin wall, environment reflections), water with a bright surface and meniscus,
//           FRESH left, SALT right; a salt shaker and a little spilled salt beside the salt glass.
//  ICE      rounded cubes with a frosted core; drop and splash at the hook; shrink with melt progress.
//  DYE      blue meltwater as soft points: fresh = thin streams that sink and spread through the glass;
//           salt = a layer that spreads along the surface and thickens around the cube.
//  WARM     amber points: fresh = rising up the sides to the cube; salt = slow loops held below the blue layer.
//  ROAD     a cutaway: icy asphalt, salt grains falling, dark wet spots spreading around each grain.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {fbm2, rng} from './kit/realism/noise.ts';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, srgb = true) => {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d')!);
  const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.anisotropy = 8;
  if (srgb) tx.colorSpace = THREE.SRGBColorSpace; return tx;
};
const radial = (stops: [number, string][]) => canvasTex(256, 256, (c) => {
  const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); stops.forEach(([k, s]) => g.addColorStop(k, s)); c.fillStyle = g; c.fillRect(0, 0, 256, 256);
});

// soft points with per-point alpha and size (world cm)
const pointsMat = (color: string, order: number) => {
  const m = new THREE.ShaderMaterial({
    uniforms: {uColor: {value: col(color)}, uScale: {value: 1000}},
    vertexShader: `attribute float aA; attribute float aS; varying float vA; uniform float uScale;
      void main(){ vA = aA; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aS * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; varying float vA;
      void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; float a = vA * smoothstep(1.0, 0.0, r) * (0.6 + 0.4 * smoothstep(1.0, 0.2, r));
        if (a < 0.002) discard; gl_FragColor = vec4(uColor, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false,
  });
  return {m, order};
};
type Cloud = {pts: THREE.Points; pos: Float32Array; a: Float32Array; s: Float32Array; seed: number[][]; n: number};
const makeCloud = (n: number, color: string, order: number, r: () => number): Cloud => {
  const pos = new Float32Array(n * 3), a = new Float32Array(n), s = new Float32Array(n);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aA', new THREE.BufferAttribute(a, 1)); g.setAttribute('aS', new THREE.BufferAttribute(s, 1));
  const {m} = pointsMat(color, order); const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = order;
  return {pts, pos, a, s, seed: Array.from({length: n}, () => [r(), r(), r(), r(), r(), r()]), n};
};
const touch = (c: Cloud) => { const g = c.pts.geometry; (g.attributes.position as THREE.BufferAttribute).needsUpdate = true; (g.attributes.aA as THREE.BufferAttribute).needsUpdate = true; (g.attributes.aS as THREE.BufferAttribute).needsUpdate = true; };

type G = 'fresh' | 'salt';
const NSTREAM = 7;

export const Scene: React.FC<{t: number}> = ({t}) => {
  const {gl, camera, scene, size} = useThree();
  const shot = TL.shotAt(t);

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const root = new THREE.Group(); scene.add(root);
    const r = rng(7);
    const pm = new THREE.PMREMGenerator(gl); const envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture;

    // ----- lights: window key from the left-back (warm daylight), fill from the room, sky-coloured hemisphere
    const key = new THREE.DirectionalLight(col('#fff1dc'), 3.0); key.position.set(-60, 70, -30); key.target.position.set(0, 0, 0);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {left: -30, right: 30, top: 30, bottom: -30, near: 20, far: 220}); key.shadow.camera.updateProjectionMatrix(); key.shadow.bias = -0.0005; key.shadow.radius = 6;
    root.add(key, key.target);
    const hemi = new THREE.HemisphereLight(col('#dfe9f2'), col('#6b4b30'), 1.3); root.add(hemi);
    const fill = new THREE.DirectionalLight(col('#ffe2c4'), 0.8); fill.position.set(40, 30, 80); root.add(fill);

    // ----- counter: oak worktop
    const oak = canvasTex(1024, 1024, (c) => {
      const img = c.createImageData(1024, 1024);
      for (let y = 0; y < 1024; y++) for (let x = 0; x < 1024; x++) {
        const g = fbm2(x / 400, y / 22, 3, 4) * 0.5 + fbm2(x / 60, y / 3, 9, 2) * 0.18; const v = 0.5 + 0.5 * Math.sin((y / 9 + g * 10) * 1.0);
        const k = 0.78 + 0.22 * v + fbm2(x / 30, y / 30, 5, 3) * 0.08; const i = (y * 1024 + x) * 4;
        img.data[i] = 168 * k; img.data[i + 1] = 118 * k; img.data[i + 2] = 74 * k; img.data[i + 3] = 255; }
      c.putImageData(img, 0, 0);
    });
    oak.repeat.set(1.2, 1.2); oak.rotation = Math.PI / 2;
    const counter = new THREE.Mesh(new THREE.BoxGeometry(160, 4, 80), new THREE.MeshPhysicalMaterial({map: oak, roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.4, specularIntensity: 0.4}));
    counter.position.set(0, -2, -10); counter.receiveShadow = true; root.add(counter);
    // tiled wall behind, far and soft
    const tiles = canvasTex(1024, 1024, (c) => {
      c.fillStyle = '#9aa3aa'; c.fillRect(0, 0, 1024, 1024); const q = rng(3);
      for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) { const ox = (y % 2) * 64; const v = 205 + Math.floor(q() * 18);
        const g = c.createLinearGradient(0, y * 64, 0, y * 64 + 64); g.addColorStop(0, `rgb(${v - 12},${v - 4},${v})`); g.addColorStop(1, `rgb(${v - 30},${v - 24},${v - 18})`);
        c.fillStyle = g; c.fillRect(x * 128 + ox - 64 + 4, y * 64 + 4, 120, 56); }
    });
    tiles.repeat.set(5, 3);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(220, 120), new THREE.MeshStandardMaterial({map: tiles, roughness: 0.35, color: col('#c4cacf')}));
    wall.position.set(0, 50, -48); wall.receiveShadow = true; root.add(wall);
    // window glow on the wall (left) and a pot plant silhouette, both soft
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), new THREE.MeshBasicMaterial({map: radial([[0, 'rgba(255,238,205,0.85)'], [0.55, 'rgba(255,226,180,0.25)'], [1, 'rgba(255,220,170,0)']]), transparent: true, depthWrite: false}));
    glow.position.set(-40, 34, -47.5); root.add(glow);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 3.6, 8, 32), new THREE.MeshStandardMaterial({color: col('#b8673f'), roughness: 0.8})); pot.position.set(-26, 4, -30); pot.castShadow = true; root.add(pot);
    const leafM = new THREE.MeshStandardMaterial({color: col('#4c7a3a'), roughness: 0.6, side: THREE.DoubleSide});
    for (let i = 0; i < 16; i++) { const lf = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8).scale(1.2, 0.18, 3.2), leafM); const a = r() * Math.PI * 2;
      lf.position.set(-26 + Math.cos(a) * 3, 9 + r() * 7, -30 + Math.sin(a) * 3); lf.rotation.set(r() - 0.5, a, 0.6 + r() * 0.8); lf.castShadow = true; root.add(lf); }
    // a cutting board and a lemon far right for depth (quiet)
    const board = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 14), new THREE.MeshStandardMaterial({color: col('#c89a66'), roughness: 0.6})); board.position.set(26, 0.6, -26); board.rotation.y = -0.3; board.castShadow = board.receiveShadow = true; root.add(board);
    const lemon = new THREE.Mesh(new THREE.SphereGeometry(2.4, 24, 18).scale(1.25, 1, 1), new THREE.MeshStandardMaterial({color: col('#e8c23a'), roughness: 0.55})); lemon.position.set(24, 3.4, -25); lemon.castShadow = true; root.add(lemon);

    // ----- glasses
    const glassMat = (side: THREE.Side) => new THREE.MeshPhysicalMaterial({color: col('#f4fbff'), roughness: 0.04, metalness: 0, transparent: true, opacity: side === THREE.BackSide ? 0.1 : 0.16,
      envMap: envTex, envMapIntensity: 1.6, specularIntensity: 1, clearcoat: 1, side, depthWrite: false});
    const waterMat = new THREE.MeshPhysicalMaterial({color: col('#dceefa'), roughness: 0.05, transparent: true, opacity: 0.12, envMap: envTex, envMapIntensity: 0.6, depthWrite: false, side: THREE.FrontSide});
    const surfMat = new THREE.MeshPhysicalMaterial({color: col('#eaf6ff'), roughness: 0.03, transparent: true, opacity: 0.32, envMap: envTex, envMapIntensity: 1.4, depthWrite: false});
    const iceMat = new THREE.MeshPhysicalMaterial({color: col('#eef8ff'), roughness: 0.14, transparent: true, opacity: 0.42, envMap: envTex, envMapIntensity: 1.7, clearcoat: 1, clearcoatRoughness: 0.08, depthWrite: false,
      emissive: col('#a9cfe6'), emissiveIntensity: 0.12});
    const coreMat = new THREE.MeshStandardMaterial({color: col('#ffffff'), roughness: 0.9, transparent: true, opacity: 0.22, depthWrite: false});
    const shadowTex = radial([[0, 'rgba(0,0,0,0.55)'], [0.6, 'rgba(0,0,0,0.25)'], [1, 'rgba(0,0,0,0)']]);
    const causticTex = radial([[0, 'rgba(255,250,235,0.9)'], [0.5, 'rgba(255,245,220,0.35)'], [1, 'rgba(255,240,210,0)']]);
    const glasses = {} as Record<G, {g: THREE.Group; cube: THREE.Group; ripples: THREE.Mesh[]; drops: THREE.Mesh[]; dye: Cloud; warm: Cloud; seedTilt: number}>;
    (['fresh', 'salt'] as G[]).forEach((name, gi) => {
      const g = new THREE.Group(); g.position.set(TL.GX[name], 0, 0); root.add(g);
      const H = TL.GH;
      const back = new THREE.Mesh(new THREE.CylinderGeometry(TL.GR, TL.GR * 0.94, H, 64, 1, true).translate(0, H / 2, 0), glassMat(THREE.BackSide)); back.renderOrder = 1; g.add(back);
      const front = new THREE.Mesh(new THREE.CylinderGeometry(TL.GR, TL.GR * 0.94, H, 64, 1, true).translate(0, H / 2, 0), glassMat(THREE.FrontSide)); front.renderOrder = 8; g.add(front);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(TL.GR - TL.GWALL / 2, TL.GWALL / 2, 10, 64).rotateX(Math.PI / 2).translate(0, H, 0), new THREE.MeshPhysicalMaterial({color: col('#ffffff'), roughness: 0.05, transparent: true, opacity: 0.55, envMap: envTex, envMapIntensity: 2, depthWrite: false}));
      rim.renderOrder = 9; g.add(rim);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(TL.GR * 0.94 - 0.02, TL.GR * 0.93, TL.GBASE, 64), new THREE.MeshPhysicalMaterial({color: col('#e6f4f6'), roughness: 0.06, transparent: true, opacity: 0.45, envMap: envTex, envMapIntensity: 1.5, depthWrite: false}));
      base.position.y = TL.GBASE / 2; base.renderOrder = 2; g.add(base);
      const wr = TL.RIN * 0.985, wh = TL.WH - TL.GBASE;
      const water = new THREE.Mesh(new THREE.CylinderGeometry(wr, wr * 0.95, wh, 64, 1, true).translate(0, TL.GBASE + wh / 2, 0), waterMat); water.renderOrder = 6; g.add(water);
      const surf = new THREE.Mesh(new THREE.CircleGeometry(wr, 64).rotateX(-Math.PI / 2).translate(0, TL.WH, 0), surfMat); surf.renderOrder = 7; g.add(surf);
      const men = new THREE.Mesh(new THREE.TorusGeometry(wr - 0.05, 0.09, 8, 64).rotateX(Math.PI / 2).translate(0, TL.WH + 0.04, 0), new THREE.MeshBasicMaterial({color: col('#ffffff'), transparent: true, opacity: 0.5, depthWrite: false}));
      men.renderOrder = 7; g.add(men);
      // contact shadow and a caustic spot thrown away from the window
      const sh = new THREE.Mesh(new THREE.PlaneGeometry(TL.GR * 3.2, TL.GR * 3.2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({map: shadowTex, transparent: true, depthWrite: false}));
      sh.position.set(1.2, 0.02, 0.8); g.add(sh);
      const ca = new THREE.Mesh(new THREE.PlaneGeometry(TL.GR * 2.4, TL.GR * 1.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({map: causticTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5}));
      ca.position.set(TL.GR * 1.8, 0.03, 1.6); ca.rotation.y = -0.5; g.add(ca);
      // ice cube
      const cube = new THREE.Group(); g.add(cube);
      const ice = new THREE.Mesh(new RoundedBoxGeometry(TL.CUBE, TL.CUBE, TL.CUBE, 3, 0.42), iceMat); ice.renderOrder = 5; cube.add(ice);
      const core = new THREE.Mesh(new THREE.SphereGeometry(TL.CUBE * 0.26, 16, 12).scale(1, 0.7, 1.2), coreMat); core.renderOrder = 4; cube.add(core);
      cube.rotation.set(0.12 * (gi ? -1 : 1), 0.5 + gi * 0.7, 0.08);
      // splash: ripples on the surface and droplets
      const ripples = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({color: col('#ffffff'), transparent: true, opacity: 0, depthWrite: false})); m.position.y = TL.WH + 0.03; m.renderOrder = 7; g.add(m); return m; });
      const drops = Array.from({length: 14}, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshPhysicalMaterial({color: col('#e8f6ff'), roughness: 0.02, transparent: true, opacity: 0.45, envMap: envTex, envMapIntensity: 2})); m.renderOrder = 9; g.add(m); return m; });
      const dye = makeCloud(1400, TL.BLUE, 3, r); g.add(dye.pts);
      const warm = makeCloud(170, TL.AMBER, 3, r); g.add(warm.pts);
      glasses[name] = {g, cube, ripples, drops, dye, warm, seedTilt: gi};
    });
    // salt shaker and spilled salt beside the salt glass
    const shaker = new THREE.Group(); shaker.position.set(TL.GX.salt + 3.5, 0, -16); root.add(shaker);
    const shGlass = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 7, 32).translate(0, 3.5, 0), new THREE.MeshPhysicalMaterial({color: col('#f6fbff'), roughness: 0.06, transparent: true, opacity: 0.3, envMap: envTex, envMapIntensity: 1.5}));
    const shSalt = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 4.4, 32).translate(0, 2.4, 0), new THREE.MeshStandardMaterial({color: col('#f4f2ee'), roughness: 0.95}));
    const shCap = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.85, 2.2, 32).translate(0, 8.1, 0), new THREE.MeshPhysicalMaterial({color: col('#c9ccd0'), metalness: 1, roughness: 0.25, envMap: envTex, envMapIntensity: 1.2}));
    shaker.add(shSalt, shGlass, shCap); shaker.visible = false;   // read as a cylinder inside the salt glass; the spilled salt stays shCap.castShadow = shSalt.castShadow = true;
    const NG = 220; const grains = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 0.12, 0.14), new THREE.MeshStandardMaterial({color: col('#ffffff'), roughness: 0.5, emissive: col('#888888'), emissiveIntensity: 0.2}), NG);
    { const M = new THREE.Matrix4(), q = new THREE.Quaternion(); for (let i = 0; i < NG; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 2.2; q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3));
      M.compose(new THREE.Vector3(TL.GX.salt + 4.4 + Math.cos(a) * d * 0.9, 0.06, -3.5 + Math.sin(a) * d * 0.8), q, new THREE.Vector3(1, 1, 1)); grains.setMatrixAt(i, M); } }
    root.add(grains);
    // salt poured into the SALT glass: grains fall from above the rim and vanish as they dissolve below the surface
    const NPOUR = 160; const pour = new THREE.InstancedMesh(new THREE.BoxGeometry(0.13, 0.11, 0.13), new THREE.MeshStandardMaterial({color: col('#ffffff'), roughness: 0.4, emissive: col('#bbbbbb'), emissiveIntensity: 0.4}), NPOUR);
    pour.frustumCulled = false; pour.renderOrder = 4; root.add(pour); const pSeed = Array.from({length: NPOUR}, () => [r(), r(), r(), r()]);

    // ----- road cutaway: asphalt under a sheet of ice, salt grains fall, wet dark spots spread
    const road = new THREE.Group(); road.position.set(...TL.ROAD_O); root.add(road);
    const asph = canvasTex(1024, 1024, (c) => {
      const img = c.createImageData(1024, 1024); const q = rng(9);
      for (let y = 0; y < 1024; y++) for (let x = 0; x < 1024; x++) { const v = 52 + fbm2(x / 8, y / 8, 2, 3) * 22 + (q() < 0.06 ? 40 * q() : 0); const i = (y * 1024 + x) * 4;
        img.data[i] = v; img.data[i + 1] = v + 2; img.data[i + 2] = v + 6; img.data[i + 3] = 255; }
      c.putImageData(img, 0, 0);
    });
    asph.repeat.set(3, 3);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({map: asph, roughness: 0.9})); ground.receiveShadow = true; road.add(ground);
    const frost = canvasTex(1024, 1024, (c) => {
      const img = c.createImageData(1024, 1024);
      for (let y = 0; y < 1024; y++) for (let x = 0; x < 1024; x++) { const v = fbm2(x / 90, y / 90, 4, 4) * 0.5 + 0.5; const k = 0.35 + 0.5 * v + fbm2(x / 6, y / 6, 8, 2) * 0.15; const i = (y * 1024 + x) * 4;
        img.data[i] = 220; img.data[i + 1] = 235; img.data[i + 2] = 245; img.data[i + 3] = 255 * Math.min(1, Math.max(0, k)); }
      c.putImageData(img, 0, 0);
    });
    frost.repeat.set(2, 2);
    const iceSheet = new THREE.Mesh(new THREE.PlaneGeometry(120, 120).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({map: frost, transparent: true, roughness: 0.25, clearcoat: 1, envMap: envTex, envMapIntensity: 0.8, depthWrite: false}));
    iceSheet.position.y = 0.05; iceSheet.renderOrder = 1; road.add(iceSheet);
    const NR = 60; const rSeed = Array.from({length: NR}, () => [(r() - 0.5) * 14, (r() - 0.5) * 10, r(), r()]);
    const rGrains = new THREE.InstancedMesh(new THREE.BoxGeometry(0.24, 0.2, 0.24), new THREE.MeshStandardMaterial({color: col('#ffffff'), roughness: 0.4, emissive: col('#aaaaaa'), emissiveIntensity: 0.3}), NR); rGrains.castShadow = true; road.add(rGrains);
    const wet = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({color: col('#2c323a'), roughness: 0.08, clearcoat: 0.6, envMap: envTex, envMapIntensity: 0.35, transparent: true, opacity: 0.85, depthWrite: false}), NR);
    wet.position.y = 0.09; wet.renderOrder = 2; road.add(wet);
    const roadSun = new THREE.DirectionalLight(col('#dfe8ff'), 2.2); roadSun.position.set(TL.ROAD_O[0] - 30, 50, -20); roadSun.target.position.set(...TL.ROAD_O); roadSun.castShadow = true;
    Object.assign(roadSun.shadow.camera, {left: -20, right: 20, top: 20, bottom: -20, near: 10, far: 150}); roadSun.shadow.camera.updateProjectionMatrix(); root.add(roadSun, roadSun.target);

    return {root, key, hemi, glasses, pour, pSeed, road, rGrains, wet, rSeed, roadSun, envTex};
  }, [gl, scene]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.fov = c.fov; cam.near = 0.5; cam.far = 1200; cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.updateProjectionMatrix();
  const scale = size.height / (2 * Math.tan((c.fov * Math.PI) / 360));
  gl.toneMappingExposure = shot === 'road' ? 0.85 : 1.0;
  scene.background = col(shot === 'road' ? '#9aa6b4' : '#b9c0c4');
  scene.fog = shot === 'road' ? new THREE.Fog(0x9aa6b4, 25, 90) : new THREE.Fog(0xb9c0c4, 70, 170);
  W.key.intensity = shot === 'road' ? 0 : 3.0; W.roadSun.intensity = shot === 'road' ? 2.2 : 0;

  (['fresh', 'salt'] as G[]).forEach((name) => {
    const G0 = W.glasses[name];
    G0.g.visible = !((shot === 'fresh' && name === 'salt') || (shot === 'salt' && name === 'fresh'));   // close shots: only the glass being explained
    const p = TL.meltP(t, name), k = TL.cubeScale(p), side = TL.CUBE * k;
    // floating: ~90 % under water, rides lower as it shrinks
    const dy = TL.dropY(t, name);
    G0.cube.visible = k > 0.02;
    G0.cube.scale.set(k, k * (name === 'salt' ? 1 - 0.18 * p : 1), k);   // the salt cube melts at the waterline into a squat shape
    G0.cube.position.set(0.15 * Math.sin(t * 0.7 + G0.seedTilt), TL.WH - side * 0.4 + dy, 0.1 * Math.cos(t * 0.6));
    G0.cube.rotation.y = 0.5 + G0.seedTilt * 0.7 + 0.04 * Math.sin(t * 0.5);
    // splash
    const sp = TL.splash(t, name);
    G0.ripples.forEach((m, i) => { const a = sp - i * 0.18; const mm = m.material as THREE.MeshBasicMaterial; if (a < 0 || a > 1.6) { mm.opacity = 0; return; }
      const rr = 1.6 + a * 2.2; m.scale.set(Math.min(rr, TL.RIN - 0.1), 1, Math.min(rr, TL.RIN - 0.1)); mm.opacity = 0.55 * (1 - a / 1.6); });
    G0.drops.forEach((m, i) => { const a = sp; if (a < 0 || a > 0.7) { m.visible = false; return; } m.visible = true; const ang = (i / 14) * 6.28 + G0.seedTilt;
      const v = 0.9 + (i % 3) * 0.35; m.position.set(Math.cos(ang) * (1.2 + a * 3 * v), TL.WH + a * 9 * v - 0.5 * 30 * a * a, Math.sin(ang) * (1.2 + a * 3 * v)); });

    // ----- blue meltwater
    const D = G0.dye, cubeY = TL.WH - side * 0.4, R = TL.RIN * 0.92;
    for (let i = 0; i < D.n; i++) {
      const [s0, s1, s2, s3, s4, s5] = D.seed[i];
      const born = (i / D.n) * (name === 'fresh' ? 1.0 : 0.52);
      let x = 0, y = -100, z = 0, a = 0, sz = 0.5;
      if (p > born && p > 0.002) {
        const age = p - born;
        if (name === 'fresh') {
          // thin streams peel off the cube's bottom edge, fall, then spread through the lower glass and slowly fill it
          const st = Math.floor(s0 * NSTREAM), ang = (st / NSTREAM) * 6.283 + 0.4 + (s1 - 0.5) * 0.25;
          const r0 = TL.CUBE * 0.36 * (0.7 + 0.3 * k);
          const x0 = Math.cos(ang) * r0, z0 = Math.sin(ang) * r0, y0 = cubeY - TL.CUBE * k * 0.45;
          const fall = 0.09 * (0.8 + s2 * 0.5);
          const floorY = TL.GBASE + 0.25 + s3 * (0.4 + 3.8 * p) * (0.4 + 0.6 * s4);
          if (age < fall) {
            const q = age / fall; y = y0 + (floorY - y0) * q ** 1.4;
            const sw = 0.25 * q; x = x0 * (1 + 0.6 * q) + sw * Math.sin(q * 9 + s4 * 6); z = z0 * (1 + 0.6 * q) + sw * Math.cos(q * 7 + s5 * 6);
            a = 0.42; sz = 0.32 + 0.25 * q;
          } else {
            const q = Math.min(1, (age - fall) / 0.25); const rr = Math.min(R, Math.hypot(x0, z0) * 1.6 + (Math.sqrt(s5) * R - Math.hypot(x0, z0) * 1.6) * q);
            const aa = ang + (s2 - 0.5) * 2.5 * q;
            const sw = aa + 0.3 * t * (s1 - 0.5); x = Math.cos(sw) * rr; z = Math.sin(sw) * rr; y = floorY + 0.35 * Math.sin(t * 1.4 + s1 * 9);
            a = 0.16 + 0.1 * (1 - q); sz = 0.7 + 0.9 * q;
          }
        } else {
          // spreads sideways along the surface and thickens into a layer around the cube
          const ang = s0 * 6.283, r0 = TL.CUBE * 0.5 * (0.6 + 0.4 * k);
          const q = Math.min(1, age / 0.1);
          const thick = 0.35 + 3.2 * p;
          const rr = r0 + (Math.max(r0, Math.sqrt(s1) * R) - r0) * (1 - (1 - q) ** 2);
          const aa = ang + 0.6 * q * (s2 - 0.5) + 0.25 * t * (0.5 + s4);
          x = Math.cos(aa) * rr; z = Math.sin(aa) * rr; y = TL.WH - 0.15 - s3 * thick * (0.3 + 0.7 * q) + 0.08 * Math.sin(t * 1.3 + s4 * 9);
          a = 0.12 * (0.6 + 0.4 * q); sz = 0.4 + 0.6 * q;
        }
      }
      D.pos[i * 3] = x; D.pos[i * 3 + 1] = y; D.pos[i * 3 + 2] = z; D.a[i] = a; D.s[i] = sz;
    }
    touch(D); (D.pts.material as THREE.ShaderMaterial).uniforms.uScale.value = scale;

    // ----- warmer water (amber)
    const Wm = G0.warm, on = TL.warmOn(t, name);
    for (let i = 0; i < Wm.n; i++) {
      const [s0, s1, s2, s3] = Wm.seed[i];
      let x = 0, y = -100, z = 0, a = 0;
      if (on > 0) {
        const ph = (t * 0.32 + s0) % 1, ang = s1 * 6.283 + t * 0.35;
        if (name === 'fresh') {
          // rises up the sides from below, then turns in toward the cube
          const yb = TL.GBASE + 1.2 + p * 2.5, yt = cubeY - 0.6;
          const up = Math.min(1, ph / 0.75), inn = Math.max(0, (ph - 0.75) / 0.25);
          const rr = R * (0.88 - 0.06 * s2) * (1 - inn) + TL.CUBE * 0.55 * k * inn;
          x = Math.cos(ang) * rr; z = Math.sin(ang) * rr; y = yb + (yt - yb) * up + 0.6 * inn;
          a = 0.45 * on * Math.sin(Math.PI * Math.min(1, ph * 1.05));
        } else {
          // slow loops below the blue layer, never reaching the cube
          const top = TL.WH - 0.6 - (0.35 + 3.2 * p), bot = TL.GBASE + 0.6;
          const lp = ph * 6.283; const rr = R * (0.35 + 0.5 * s2);
          x = Math.cos(ang) * rr; z = Math.sin(ang) * rr; y = bot + (top - bot) * (0.5 + 0.45 * Math.sin(lp + s3 * 6));
          a = 0.24 * on;
        }
      }
      Wm.pos[i * 3] = x; Wm.pos[i * 3 + 1] = y; Wm.pos[i * 3 + 2] = z; Wm.a[i] = a; Wm.s[i] = 0.4 + s3 * 0.25;
    }
    touch(Wm); (Wm.pts.material as THREE.ShaderMaterial).uniforms.uScale.value = scale;
  });

  // ----- salt pour (hook only)
  { const M = new THREE.Matrix4(), hid = new THREE.Matrix4().makeScale(0, 0, 0);
    W.pSeed.forEach(([a, b, c2, d], i) => {
      const k = t - TL.POUR - a * 0.6; if (shot !== 'hook' || k < 0) { W.pour.setMatrixAt(i, hid); return; }
      const y = TL.GH + 6 - 0.5 * 600 * k * k - (TL.GH + 6 - TL.WH > 0 && k * k * 300 > TL.GH + 6 - TL.WH ? (k * k * 300 - (TL.GH + 6 - TL.WH)) * 0.0 : 0);
      const yy = Math.max(y, TL.WH - 2.5 * Math.min(1, Math.max(0, (TL.GH + 6 - TL.WH - 300 * k * k) * -0.05)));
      const under = y < TL.WH; const sub = TL.WH - (TL.WH - y) * 0.08;
      if (under && TL.WH - y > 40) { W.pour.setMatrixAt(i, hid); return; }
      M.makeTranslation(TL.GX.salt + (b - 0.5) * 1.2 + 0.8, under ? sub : yy, (c2 - 0.5) * 1.2); W.pour.setMatrixAt(i, M);
    });
    W.pour.instanceMatrix.needsUpdate = true; }

  // ----- road
  W.road.visible = shot === 'road';
  if (shot === 'road') {
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    W.rSeed.forEach(([x, z, d, s], i) => {
      const k = t - TL.ROAD_SALT_T - d * 0.6; const y = k < 0 ? 30 : Math.max(0.2, 14 - 0.5 * 980 * 0.02 * k * k * 3);
      e.set(d * 9 + t * (y > 0.2 ? 6 : 0), s * 9, 0); q.setFromEuler(e); M.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1)); W.rGrains.setMatrixAt(i, M);
      const land = k - Math.sqrt(14 / (0.5 * 980 * 0.02 * 3)); const wr = land < 0 ? 0.0001 : Math.min(0.55 + 0.35 * s, 0.05 + land * (0.45 + s * 0.3));
      M.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion(), new THREE.Vector3(wr, 1, wr * (0.8 + 0.3 * d))); W.wet.setMatrixAt(i, M);
    });
    W.rGrains.instanceMatrix.needsUpdate = true; W.wet.instanceMatrix.needsUpdate = true;
  }
  return null;
};
