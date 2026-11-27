// Three worlds in one three.js scene, switched on the hard cuts (timeline.ts CUT_*):
//  SPACE    the photographic Earth (globe kit) with a glowing rope round the equator. The rope is one tube whose
//           vertices are re-placed every frame from a unit ring: radius per angle (the lift ripple), thickness per
//           shot, a gap at the front (the splice). The red metre is a second tube that grows into the gap and, on
//           "sounds like nothing", smears thin all the way round. Posts (instanced) rise in a ripple under the ring.
//  GROUND   on the equator, dry savanna at ground level: Preetham sky, sun with shadows, sand, pebbles, grass tufts,
//           acacias on the horizon; the rope 16 cm up on stakes, a cyan tape, a cat (Sketchfab, CC BY) crawling under.
//  DIAGRAM  the view from straight above, flat: the Earth as a disc that squares off, the rope offset round it by the
//           gap h, its four red corner arcs flying down into one circle that unrolls along a ruler (2 pi h).
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {random} from 'remotion';
import {makeSky, sunColor, sunDirection} from './kit/realism/sky.ts';
import {tuft} from './kit/realism/plants.ts';
import {Earth, Stars, Dot, type EarthTex} from './kit/globe';
import {type CatAsset, poseCat} from './cat';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);

// ---------- space: the deformable rope ring
const RSEG = 1440, RRAD = 8;
type Ring = {mesh: THREE.Mesh; base: Float32Array; ang: Float32Array; cx: Float32Array; cz: Float32Array};
const makeRing = (a0: number, a1: number, segs: number, mat: THREE.Material): Ring => {
  const pts = Array.from({length: segs + 1}, (_, i) => { const a = a0 + (a1 - a0) * (i / segs); return new THREE.Vector3(Math.sin(a), 0, Math.cos(a)); });
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0), segs, 1, RRAD, false);
  const base = (g.getAttribute('position').array as Float32Array).slice();
  const n = base.length / 3, ang = new Float32Array(n), cx = new Float32Array(n), cz = new Float32Array(n);
  for (let i = 0; i < n; i++) { const seg = Math.floor(i / (RRAD + 1)); const a = a0 + (a1 - a0) * (seg / segs); ang[i] = a; cx[i] = Math.sin(a); cz[i] = Math.cos(a); }
  const mesh = new THREE.Mesh(g, mat); mesh.frustumCulled = false;
  return {mesh, base, ang, cx, cz};
};
// place: radius(angle), tube thickness, and an angle map (for growing/smearing the red piece)
const placeRing = (r: Ring, radius: (a: number) => number, thick: number, angMap?: (a: number) => number) => {
  const p = r.mesh.geometry.getAttribute('position') as THREE.BufferAttribute, arr = p.array as Float32Array, n = arr.length / 3;
  for (let i = 0; i < n; i++) {
    const a0 = r.ang[i], a = angMap ? angMap(a0) : a0, s = Math.sin(a), c = Math.cos(a), R = radius(a);
    // offset from the unit centre line, rotated from the base angle to the new one
    const ox = r.base[i * 3] - r.cx[i], oy = r.base[i * 3 + 1], oz = r.base[i * 3 + 2] - r.cz[i];
    const rad = ox * r.cx[i] + oz * r.cz[i];
    arr[i * 3] = s * (R + rad * thick); arr[i * 3 + 1] = oy * thick; arr[i * 3 + 2] = c * (R + rad * thick);
  }
  p.needsUpdate = true; r.mesh.geometry.computeBoundingSphere();
};
const NPOST = 200;

// ---------- ground: textures drawn once
const sandTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d')!;
  g.fillStyle = '#b58a5e'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26000; i++) {
    const x = random(`sx${i}`) * 512, y = random(`sy${i}`) * 512, v = random(`sv${i}`);
    g.fillStyle = v < 0.5 ? `rgba(90,58,34,${0.12 + v * 0.2})` : `rgba(236,206,160,${(v - 0.5) * 0.35})`;
    g.fillRect(x, y, 1 + random(`ss${i}`) * 2.2, 1 + random(`st${i}`) * 2.2);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
const patchTex = () => { // large-scale colour patches (darker damp, paler dust), no repeat
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d')!;
  g.fillStyle = '#808080'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) {
    const x = random(`px${i}`) * 512, y = random(`py${i}`) * 512, r = 6 + random(`pr${i}`) * 40, v = random(`pv${i}`);
    const gr = g.createRadialGradient(x, y, 0, x, y, r); const cc = v < 0.5 ? '96,84,76' : '168,160,150';
    gr.addColorStop(0, `rgba(${cc},0.45)`); gr.addColorStop(1, `rgba(${cc},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const ropeTex = () => { // three twisted strands
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d')!;
  g.fillStyle = '#d9c08e'; g.fillRect(0, 0, 256, 64);
  for (let k = -4; k < 12; k++) {
    const x = k * 32; const gr = g.createLinearGradient(x, 0, x + 40, 64);
    gr.addColorStop(0, 'rgba(120,92,52,0.55)'); gr.addColorStop(0.5, 'rgba(255,240,205,0.35)'); gr.addColorStop(1, 'rgba(120,92,52,0.55)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 22, 0); g.lineTo(x + 22 + 40, 64); g.lineTo(x + 40, 64); g.fill();
  }
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(80,60,30,${random(`rf${i}`) * 0.25})`; g.fillRect(random(`rx${i}`) * 256, random(`ry${i}`) * 64, 3, 1); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
};
const tapeTex = () => { // cyan tape, a tick per cm, numbers every 5 cm (0..20 cm over 1024 px)
  const c = document.createElement('canvas'); c.width = 128; c.height = 1024; const g = c.getContext('2d')!;
  g.fillStyle = TL.CYAN; g.fillRect(0, 0, 128, 1024);
  g.fillStyle = '#04222a'; g.font = 'bold 34px sans-serif'; g.textAlign = 'right';
  for (let cm = 0; cm <= 20; cm++) {
    const y = 1024 - cm * (1024 / 20.6) - 4; g.fillRect(0, y, cm % 5 === 0 ? 70 : 38, cm % 5 === 0 ? 7 : 4);
    if (cm % 5 === 0 && cm > 0) g.fillText(String(cm), 122, y + 12);
    for (let mm = 1; mm < 10 && cm < 20; mm++) g.fillRect(0, y - mm * (1024 / 20.6) / 10, 18, 2);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
const feltTex = () => { // tennis ball felt with its white seam (equirect)
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d')!;
  g.fillStyle = '#cfe83a'; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${random(`fv${i}`) < 0.5 ? '120,150,20' : '250,255,170'},${random(`fa${i}`) * 0.25})`; g.fillRect(random(`fx${i}`) * 512, random(`fy${i}`) * 256, 2, 2); }
  g.strokeStyle = '#f4f4ea'; g.lineWidth = 7; g.beginPath();
  for (let i = 0; i <= 512; i++) { const u = i / 512 * Math.PI * 2; const y = 128 + 70 * Math.sin(2 * u); i ? g.lineTo(i, y) : g.moveTo(i, y); }
  g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

// ---------- diagram helpers: flat ribbons through 2D points, rebuilt per frame (a few hundred vertices)
type Rib = THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
const rib = (color: string, z = 0): Rib => { const m = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({color, toneMapped: false, transparent: true, side: THREE.DoubleSide, depthTest: false})); m.position.z = z; m.frustumCulled = false; return m; };
const setRib = (m: Rib, pts: [number, number][], w: number, opacity = 1) => {
  m.visible = pts.length > 1 && opacity > 0.01; if (!m.visible) return; m.material.opacity = opacity;
  const pos: number[] = [], idx: number[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    pos.push(p[0] - dy * w / 2, p[1] + dx * w / 2, 0, p[0] + dy * w / 2, p[1] - dx * w / 2, 0);
    if (i) { const k = (i - 1) * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  });
  m.geometry.dispose(); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); m.geometry = g;
};
const arcPts = (cx: number, cy: number, r: number, a0: number, a1: number, n = 24): [number, number][] =>
  Array.from({length: n + 1}, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
// rounded square (half-side q, corner radius c) as a closed outline
const roundRect = (cx: number, cy: number, q: number, c: number, n = 20) => {
  const out: [number, number][] = [];
  [[1, 1, 0], [-1, 1, Math.PI / 2], [-1, -1, Math.PI], [1, -1, Math.PI * 1.5]].forEach(([sx, sy, a]) => out.push(...arcPts(cx + sx * q, cy + sy * q, c, a, a + Math.PI / 2, n)));
  out.push(out[0]); return out;
};

export const Scene: React.FC<{t: number; earth: EarthTex; cat: CatAsset}> = ({t, earth, cat}) => {
  const {gl, camera, scene} = useThree();
  const shot = TL.shotAt(t), world = TL.world(shot);

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    // ----- space
    const space = new THREE.Group(); scene.add(space);
    const ropeMat = new THREE.MeshBasicMaterial({color: col(TL.ROPE), toneMapped: false});
    const ring = makeRing(0, Math.PI * 2, RSEG, ropeMat); space.add(ring.mesh);
    const redMat = new THREE.MeshBasicMaterial({color: col(TL.RED), toneMapped: false, transparent: true});
    const red = makeRing(-TL.GAP_A / 2, TL.GAP_A / 2, 240, redMat); red.mesh.renderOrder = 4; space.add(red.mesh);
    const halo = makeRing(0, Math.PI * 2, RSEG, new THREE.MeshBasicMaterial({color: col('#FFB45A'), toneMapped: false, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false}));
    space.add(halo.mesh);
    const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 6).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({color: col('#C9B18A'), toneMapped: false}), NPOST);
    posts.frustumCulled = false; space.add(posts);

    // ----- ground
    const ground = new THREE.Group(); scene.add(ground);
    const SKY = {elevation: 38, azimuth: 35, turbidity: 3.2, rayleigh: 1.4, mie: 0.004, mieG: 0.8};
    const sky = makeSky(SKY); ground.add(sky);
    const sc = sunColor(SKY), sd = sunDirection(SKY.elevation, SKY.azimuth);
    const sun = new THREE.DirectionalLight(sc.color, sc.intensity * 0.42); sun.position.copy(sd).multiplyScalar(20); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, {left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 1, far: 50}); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.01;
    sun.target.position.set(0, 0, -1); ground.add(sun, sun.target);
    ground.add(new THREE.HemisphereLight(col('#9DBBE8'), col('#8A6A48'), sc.intensity * 0.16));
    const sand = sandTex(); sand.repeat.set(1400, 1400);
    const floorMat = new THREE.MeshStandardMaterial({map: sand, roughness: 0.97, metalness: 0, color: col('#ffffff')});
    floorMat.onBeforeCompile = (s) => { // large colour patches over the fine grain
      s.uniforms.uPatch = {value: patchTex()};
      s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vWp;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed,1.0)).xz;');
      s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uPatch; varying vec2 vWp;')
        .replace('#include <map_fragment>', '#include <map_fragment>\nfloat pa = texture2D(uPatch, vWp / 9.0).r * 0.6 + texture2D(uPatch, vWp / 61.0).g * 0.4; diffuseColor.rgb *= 0.62 + pa * 0.75;');
    };
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), floorMat); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; ground.add(floor);
    // pebbles and dry grass tufts, denser near the camera
    const peb = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshStandardMaterial({color: col('#8d7058'), roughness: 0.9, flatShading: true}), 2600);
    const M = new THREE.Matrix4(), Qt = new THREE.Quaternion(), Sv = new THREE.Vector3(), Pv = new THREE.Vector3(), E = new THREE.Euler();
    for (let i = 0; i < 2600; i++) {
      const r = Math.pow(random(`pr${i}`), 1.4) * 14, a = random(`pa${i}`) * Math.PI * 2, s = 0.003 + Math.pow(random(`ps${i}`), 4) * 0.016;
      Pv.set(Math.sin(a) * r, s * 0.35, -1 + Math.cos(a) * r); if (Math.abs(Pv.x) < 0.05) Pv.x += 0.12;
      E.set(random(`pe${i}`) * 3, random(`pf${i}`) * 3, 0); Qt.setFromEuler(E); Sv.set(s, s * (0.5 + random(`pg${i}`) * 0.4), s * (0.8 + random(`ph${i}`) * 0.5));
      peb.setMatrixAt(i, M.compose(Pv, Qt, Sv)); peb.setColorAt(i, col('#8d7058').multiplyScalar(0.7 + random(`pc${i}`) * 0.6));
    }
    peb.castShadow = true; peb.receiveShadow = true; ground.add(peb);
    const tg = tuft({seed: 3, blades: 14, width: 0.012, segments: 3, spread: 0.6, curl: 0.4});
    const grassMat = new THREE.MeshStandardMaterial({color: col('#c8ad6e'), roughness: 0.85, side: THREE.DoubleSide});
    const NT = 1800, tufts = new THREE.InstancedMesh(tg, grassMat, NT);
    for (let i = 0; i < NT; i++) {
      const r = 2.2 + Math.pow(random(`tr${i}`), 1.3) * 40, a = random(`ta${i}`) * Math.PI * 2, s = 0.1 + random(`ts${i}`) * 0.18;
      Pv.set(Math.sin(a) * r, 0, -2 + Math.cos(a) * r); if (Math.abs(Pv.x) < 0.25) Pv.x += Math.sign(Pv.x || 1) * 0.35;
      if (Math.abs(Pv.x) < 2.5 && Pv.z > -5 && Pv.z < 3) Pv.x += Math.sign(Pv.x || 1) * 2.5;     // keep the stage (camera, tape, cat's path) clear
      Qt.setFromAxisAngle(new THREE.Vector3(0, 1, 0), random(`tq${i}`) * 6.3); Sv.set(s, s * (0.7 + random(`tv${i}`) * 0.7), s);
      tufts.setMatrixAt(i, M.compose(Pv, Qt, Sv)); tufts.setColorAt(i, col('#c8ad6e').lerp(col('#7f6a3c'), random(`tc${i}`)));
    }
    tufts.castShadow = true; ground.add(tufts);
    // acacias on the horizon: trunk + a flat crown, dark against the haze
    const acMat = new THREE.MeshStandardMaterial({color: col('#3d4a2a'), roughness: 1});
    for (let i = 0; i < 22; i++) {
      const a = (random(`aa${i}`) - 0.5) * 2.6 + (i % 3 === 0 ? Math.PI : 0), r = 140 + random(`ar${i}`) * 260, h = 5 + random(`ah${i}`) * 4;
      const tree = new THREE.Group(); tree.position.set(Math.sin(a) * r, 0, -Math.cos(a) * r);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.4, h, 6), acMat); trunk.position.y = h / 2; tree.add(trunk);
      for (let k = 0; k < 4; k++) { const crown = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), acMat); const w = h * (0.28 + random(`aw${i}${k}`) * 0.2); crown.scale.set(w, h * 0.13, w * 0.9); crown.position.set((random(`ax${i}${k}`) - 0.5) * h * 0.6, h * (0.92 + random(`ay${i}${k}`) * 0.1), (random(`az${i}${k}`) - 0.5) * h * 0.4); tree.add(crown); }
      ground.add(tree);
    }
    // the rope 16 cm up, on stakes every 2 m, from behind the camera to the horizon
    const rt = ropeTex(); const ropeLen = 600; rt.repeat.set(ropeLen / 0.05, 1);
    const groundRope = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, ropeLen, 12, 1, true), new THREE.MeshStandardMaterial({map: rt, roughness: 0.8}));
    groundRope.rotation.x = Math.PI / 2; groundRope.position.set(TL.ROPE_X, TL.GAP_M + 0.009, 3 - ropeLen / 2); groundRope.castShadow = true; ground.add(groundRope);
    const stakes = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.011, 0.013, TL.GAP_M + 0.03, 6).translate(0, (TL.GAP_M + 0.03) / 2, 0), new THREE.MeshStandardMaterial({color: col('#6b4f33'), roughness: 0.9}), 160);
    for (let i = 0; i < 160; i++) stakes.setMatrixAt(i, M.compose(Pv.set(TL.ROPE_X, 0, 1.2 - i * 2), Qt.identity(), Sv.set(1, 1, 1)));
    stakes.castShadow = true; ground.add(stakes);
    // tape: stands from the sand to the underside of the rope, beside it (and lies flat at the tennis ball)
    const tape = new THREE.Mesh(new THREE.PlaneGeometry(0.024, 0.2), new THREE.MeshStandardMaterial({map: tapeTex(), roughness: 0.5, side: THREE.DoubleSide, emissive: col('#0a4a58'), emissiveIntensity: 0.6}));
    tape.castShadow = true; ground.add(tape);
    const tapeGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.2), new THREE.MeshBasicMaterial({color: col(TL.CYAN), transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}));
    ground.add(tapeGlow);
    // tennis ball, its horizontal ring and six tiny stakes
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.033, 48, 32), new THREE.MeshStandardMaterial({map: feltTex(), roughness: 1}));
    ball.position.set(0, 0.033, 0); ball.rotation.set(0.4, 0.8, 0.2); ball.castShadow = true; ground.add(ball);
    const RB = 0.033 + TL.GAP_M;
    const ballRing = new THREE.Mesh(new THREE.TorusGeometry(RB, 0.004, 10, 160), new THREE.MeshStandardMaterial({map: rt, roughness: 0.8}));
    ballRing.rotation.x = Math.PI / 2; ballRing.position.y = 0.033; ballRing.castShadow = true; ground.add(ballRing);
    const ballStakes = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.004, 0.005, 0.034, 6).translate(0, 0.017, 0), stakes.material, 6);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; ballStakes.setMatrixAt(i, M.compose(Pv.set(Math.sin(a) * RB, 0, Math.cos(a) * RB), Qt.identity(), Sv.set(1, 1, 1))); }
    ballStakes.castShadow = true; ground.add(ballStakes);
    const tennis = [ball, ballRing, ballStakes];
    const field = [groundRope, stakes];
    // the cat
    ground.add(cat.root); cat.root.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.frustumCulled = false; } });

    // ----- diagram (flat, z = 0 plane, viewed from +z)
    const diagram = new THREE.Group(); scene.add(diagram);
    const bgc = document.createElement('canvas'); bgc.width = bgc.height = 256; const bg = bgc.getContext('2d')!;
    bg.fillStyle = '#071226'; bg.fillRect(0, 0, 256, 256); bg.strokeStyle = 'rgba(120,170,255,0.10)'; bg.lineWidth = 2;
    for (let i = 0; i <= 256; i += 32) { bg.beginPath(); bg.moveTo(i, 0); bg.lineTo(i, 256); bg.stroke(); bg.beginPath(); bg.moveTo(0, i); bg.lineTo(256, i); bg.stroke(); }
    const bgt = new THREE.CanvasTexture(bgc); bgt.wrapS = bgt.wrapT = THREE.RepeatWrapping; bgt.repeat.set(12, 20); bgt.colorSpace = THREE.SRGBColorSpace;
    const back = new THREE.Mesh(new THREE.PlaneGeometry(48, 80), new THREE.MeshBasicMaterial({map: bgt, toneMapped: false})); back.position.z = -0.5; diagram.add(back);
    const earthFill = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({map: earth.day, toneMapped: false, transparent: true, depthTest: false}));
    earthFill.frustumCulled = false; diagram.add(earthFill);
    const ballFill = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({map: feltTex(), toneMapped: false, depthTest: false})); diagram.add(ballFill);
    const D = {sides: rib(TL.ROPE), corners: [0, 1, 2, 3].map(() => rib(TL.RED)), laid: rib(TL.RED), ruler: rib('#5d7396'), ticks: Array.from({length: 7}, () => rib(TL.CYAN)),
      gapStick: rib(TL.CYAN), radius: rib(TL.CYAN), outline: rib('#9CC3FF')};
    [D.ruler, D.sides, D.laid, ...D.corners, ...D.ticks, D.gapStick, D.radius, D.outline].forEach((m) => diagram.add(m));
    return {space, ring, red, halo, posts, ground, sky, sun, floor, tape, tapeGlow, tennis, field, diagram, earthFill, ballFill, D};
  }, [gl, scene]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  W.space.visible = world === 'space'; W.ground.visible = world === 'ground'; W.diagram.visible = world === 'diagram';
  if (world === 'space') {
    scene.background = col('#000000'); scene.fog = null; gl.toneMappingExposure = 1;
    const c = TL.spaceCam(t); cam.fov = c.fov; cam.near = 0.002; cam.far = 400; cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look);
    const d = cam.position.distanceTo(new THREE.Vector3(...c.look));
    const thick = 0.0016 * d;                               // ~5 px wide at any distance
    const lift = (a: number) => TL.RING_R + TL.LIFT_H * TL.liftK(t, a);
    placeRing(W.ring, lift, thick); placeRing(W.halo, lift, thick * 3.2);
    // draw-on (wrap) or a gap at the front (splice)
    const segN = RSEG * (RRAD) * 6, per = RRAD * 6;
    const g = W.ring.mesh.geometry, gh = W.halo.mesh.geometry;
    if (shot === 'wrap') { const n = Math.floor(TL.ringDraw(t) * RSEG) * per; g.setDrawRange(0, n); gh.setDrawRange(0, n); }
    else if (shot === 'splice') {
      const k = TL.gapOpen(t) * (1 - TL.redIn(t) * 0) ; const s0 = Math.ceil(TL.GAP_A / 2 * k / (Math.PI * 2) * RSEG);
      g.setDrawRange(s0 * per, Math.max(0, segN - 2 * s0 * per)); gh.setDrawRange(s0 * per, Math.max(0, segN - 2 * s0 * per));
    } else { g.setDrawRange(0, Infinity); gh.setDrawRange(0, Infinity); }
    const showRed = shot === 'splice' ? TL.redIn(t) : (shot === 'hook' || shot === 'wrap') ? 0 : 1;
    W.red.mesh.visible = showRed > 0.001;
    if (W.red.mesh.visible) {
      const sm = TL.smear(t), span = shot === 'splice' ? Math.max(0.001, TL.redIn(t)) : 1 + sm * (Math.PI * 2 / TL.GAP_A - 1);
      placeRing(W.red, (a) => lift(a) + 0.0008 * d, thick * (1.25 - 0.45 * sm), (a) => a * span);
      (W.red.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - 0.15 * sm;
    }
    // posts under the lifted ring
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < NPOST; i++) {
      const a = (i / NPOST) * Math.PI * 2, h = TL.LIFT_H * TL.liftK(t, a) * TL.postsOn(t);
      P.set(Math.sin(a), 0, Math.cos(a)); Q.setFromUnitVectors(Y, P); S.set(thick * 0.7, Math.max(h, 1e-5), thick * 0.7);
      W.posts.setMatrixAt(i, M.compose(P, Q, S));
    }
    W.posts.instanceMatrix.needsUpdate = true; W.posts.visible = TL.postsOn(t) > 0;
  } else if (world === 'ground') {
    const c = TL.groundCam(t); cam.fov = c.fov; cam.near = 0.01; cam.far = 3000; cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look);
    gl.toneMappingExposure = 0.16; scene.background = null; scene.fog = new THREE.FogExp2(col('#c9d3dc').getHex(), 0.0042);
    const tennis = shot === 'tennis';
    W.tennis.forEach((o) => { o.visible = tennis; }); W.field.forEach((o) => { o.visible = !tennis; });
    const up = TL.tapeUp(t);
    W.tape.visible = W.tapeGlow.visible = up > 0.001;
    if (tennis) { // flat on the sand from the ball's surface to the ring, along +x
      const L = TL.GAP_M * up; W.tape.scale.set(1, L / 0.2, 1); W.tape.rotation.set(-Math.PI / 2, 0, Math.PI / 2); W.tape.position.set(0.033 + L / 2, 0.0015, 0.0);
      W.tapeGlow.scale.copy(W.tape.scale); W.tapeGlow.rotation.copy(W.tape.rotation); W.tapeGlow.position.set(0.033 + L / 2, 0.002, 0);
      (W.tape.material as THREE.MeshStandardMaterial).map!.offset.set(0, 0);
    } else {
      const L = TL.GAP_M * up; W.tape.scale.set(1, L / 0.2, 1); W.tape.rotation.set(0, Math.PI / 2 - 0.5, 0); W.tape.position.set(TL.ROPE_X + 0.016, L / 2, -0.95);
      W.tapeGlow.scale.copy(W.tape.scale); W.tapeGlow.rotation.copy(W.tape.rotation); W.tapeGlow.position.set(TL.ROPE_X + 0.018, L / 2, -0.948);
    }
    // texture shows 0..L of the tape (bottom part of the 20.6 cm scale)
    const map = (W.tape.material as THREE.MeshStandardMaterial).map!; map.repeat.set(1, (TL.GAP_M * up) / 0.206); map.offset.set(0, 0);
    // the cat
    const x = TL.catX(t); W.ground.children.includes(cat.root);
    cat.root.visible = !tennis && x < 50;
    if (cat.root.visible) poseCat(cat, t, x, TL.CAT_Z, TL.catCrouch(x));
  } else {
    // ----- diagram
    scene.background = col('#071226'); scene.fog = null; gl.toneMappingExposure = 1;
    const dc = TL.diagCam(t); cam.fov = dc.fov; cam.near = 0.1; cam.far = 200;
    cam.position.set(...dc.pos); cam.up.set(0, 1, 0); cam.lookAt(...dc.look);
    const s = TL.diag(t), D = W.D, [cx, cy] = TL.SQ_C;
    // the Earth: disc -> square (half-side q, corner c), shrinking in the last shot; then a tennis ball
    const R0 = TL.Q * 1.12, qS = s.q * s.square, cS = R0 * (1 - s.square) * (s.q / TL.Q);
    const shape = roundRect(cx, cy, qS, cS, 24);
    const geo = new THREE.BufferGeometry(); const pos: number[] = [], uv: number[] = [];
    const span = Math.max(qS + cS, 1e-3);
    shape.forEach((p, i) => { if (!i) return; const p0 = shape[i - 1]; pos.push(cx, cy, 0, p0[0], p0[1], 0, p[0], p[1], 0);
      [[cx, cy], p0, p].forEach(([x, y]) => uv.push(0.5 + (x - cx) / span * 0.18 + 0.03, 0.5 + (y - cy) / span * 0.36)); });
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    W.earthFill.geometry.dispose(); W.earthFill.geometry = geo; W.earthFill.visible = span > 0.01;
    setRib(D.outline, shape, 0.05, span > 0.01 ? 0.8 : 0);
    const br = TL.BALL_R * s.ball; W.ballFill.visible = br > 0.002; W.ballFill.position.set(cx, cy, 0.01); W.ballFill.scale.setScalar(Math.max(br, 1e-3));
    // the rope: straight sides at offset (c + h), corners as arcs of radius c + h; the corners carry the red
    const h = s.h, cR = cS + br + h, sides: [number, number][][] = [];
    const corners: [number, number, number][] = [[1, 1, 0], [-1, 1, Math.PI / 2], [-1, -1, Math.PI], [1, -1, Math.PI * 1.5]];
    corners.forEach(([sx, sy, a], i) => {
      const ox = cx + sx * qS, oy = cy + sy * qS;
      // gather: fly each corner arc to the rolling circle's centre
      const tx = TL.ROLL_X0 + s.roll * 2 * Math.PI, ty = TL.ROLL_Y + 1, g = s.gather;
      const px = ox + (tx - ox) * g, py = oy + (ty - oy) * g;
      let pts: [number, number][];
      if (s.roll > 0.001 && g > 0.999) { // unrolled: the circle rolls right along the ruler, laying the red line down
        const L = 2 * Math.PI, u = s.roll * L, full: [number, number][] = [];
        const lo = i * L / 4, hi = (i + 1) * L / 4; // this corner's share of the length
        for (let k = 0; k <= 24; k++) { const sArc = lo + (hi - lo) * k / 24; full.push(sArc < u ? [TL.ROLL_X0 + sArc, TL.ROLL_Y] : [TL.ROLL_X0 + u + Math.sin((sArc - u)), TL.ROLL_Y + 1 - Math.cos(sArc - u)]); }
        pts = full;
      } else pts = arcPts(px, py, g > 0.001 ? h : cR, a + (g > 0 ? 0 : 0), a + Math.PI / 2, 24);
      const redK = s.square * (h > 0.02 ? 1 : 0);
      D.corners[i].material.color.set(redK > 0.5 ? TL.RED : TL.ROPE);
      setRib(D.corners[i], pts, redK > 0.5 ? 0.16 : 0.1);
      // straight side from this corner to the next (ccw)
      const [nx, ny] = corners[(i + 1) % 4];
      const d0: [number, number] = [Math.cos(a + Math.PI / 2), Math.sin(a + Math.PI / 2)];
      sides.push([[ox + d0[0] * cR, oy + d0[1] * cR], [cx + nx * qS + d0[0] * cR, cy + ny * qS + d0[1] * cR]]);
    });
    // sides as one ribbon per side (joined by NaN-free separate strips)
    const sidePts: [number, number][] = []; sides.forEach((sd) => { sidePts.push(sd[0], sd[1]); });
    setRib(D.sides, [], 0.1); D.sides.visible = false;
    D.sides.children.forEach((c) => D.sides.remove(c));
    sides.forEach((sd, i) => { const m = (D as any)[`side${i}`] as Rib | undefined ?? (() => { const r = rib(TL.ROPE); (D as any)[`side${i}`] = r; W.diagram.add(r); return r; })(); setRib(m, qS > 0.005 ? sd : [], 0.1); });
    // the ruler and its step ticks (each tick = h), the laid red line under it
    setRib(D.ruler, s.gather > 0.5 ? [[TL.ROLL_X0 - 0.3, TL.ROLL_Y - 0.06], [TL.ROLL_X0 + 2 * Math.PI + 0.4, TL.ROLL_Y - 0.06]] : [], 0.05, s.gather);
    D.ticks.forEach((m, k) => setRib(m, [[TL.ROLL_X0 + k, TL.ROLL_Y - 0.32], [TL.ROLL_X0 + k, TL.ROLL_Y - 0.06]], 0.06, s.ticks * (k < 7 ? 1 : 0)));
    // the gap: a cyan stick from the square's right side to the rope (1 step), then the circle's radius
    const showGap = s.h > 0.05 && s.gather < 0.05 && shotAtIs(t, 'why');
    setRib(D.gapStick, showGap ? [[cx + qS + cS + br, cy - 0.25], [cx + qS + cS + br + h, cy - 0.25]] : [], 0.09);
    const rad = s.radius;
    if (shotAtIs(t, 'why')) setRib(D.radius, rad > 0 ? [[TL.ROLL_X0, TL.ROLL_Y + 1], [TL.ROLL_X0 + rad, TL.ROLL_Y + 1]] : [], 0.08);
    else setRib(D.radius, rad > 0 ? [[cx + br + cS + qS, cy], [cx + br + cS + qS + h * rad, cy]] : [], 0.08);
    setRib(D.laid, [], 0.1);
  }
  cam.updateProjectionMatrix();

  return world === 'space' ? (
    <>
      <Stars fr={Math.round(t * 30)} count={5000} opacity={0.8} />
      <Earth tex={earth} day={1.5} night={0.6} sunVec={new THREE.Vector3(...TL.SUN_VEC)} air={0.6} />
      {shot === 'hook' ? [0, 1, 2].map((k) => { const a = t * 1.1 + k * 2.09; return Math.cos(a) < 0.15 ? null : <Dot key={k} at={new THREE.Vector3(Math.sin(a) * TL.RING_R, 0, Math.cos(a) * TL.RING_R)} size={0.16 * Math.min(1, (Math.cos(a) - 0.15) * 4)} color={TL.ROPE} />; }) : null}
      {shot === 'wrap' && TL.ringDraw(t) < 0.999 ? <Dot at={(() => { const a = TL.ringDraw(t) * Math.PI * 2; return new THREE.Vector3(Math.sin(a) * TL.RING_R, 0, Math.cos(a) * TL.RING_R); })()} size={0.22} color={TL.ROPE} /> : null}
    </>
  ) : null;
};
const shotAtIs = (t: number, s: TL.Shot) => TL.shotAt(t) === s;
