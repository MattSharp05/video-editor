// One world: a red-orange suspension bridge (Golden Gate proportions, a stand-in) over a strait at golden hour.
//  SET      Preetham sky (realism kit) with a shadowing sun, water with a moving normal map and the sky as its
//           environment, shores and far hills from noise, fog toward the horizon colour.
//  BRIDGE   two towers (legs, portal struts, piers), two main cables (parabola over the main span, side spans down
//           to the anchorages), instanced hangers every 15.2 m, a deck with truss sides that sags and breaks in the
//           "no cables" beat (vertex patch), traffic, and concrete anchorages.
//  LOAD     glow tubes over hangers, cables and tower legs: comet pulses travelling the way the load goes, cyan for
//           tension and amber for compression. Their width never drops below a few pixels (vertex shader).
//  WIRES    a piece of main cable cut open beside the real one: 61 strands x 452 wires = 27,572 instanced wire ends.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {skyLight} from './kit/realism/sky.ts';
import {makeSun} from './kit/realism/sun.ts';
import {fbm2, rng} from './kit/realism/noise.ts';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
const {HALF, ANCH_X, TOWER_H, DECK_Y, CAB_Z, cableY} = TL;
const DECK_W = 27.4, DECK_END = ANCH_X - 4;
const SKY = {elevation: 15, azimuth: 32, turbidity: 3.2, rayleigh: 1.4, clouds: 0.15, ground: '#56603e', visibility: 9000};

// ---------- canvas textures
const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, srgb = true) => {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d')!);
  const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.anisotropy = 8;
  if (srgb) tx.colorSpace = THREE.SRGBColorSpace; return tx;
};
const roadTex = () => canvasTex(512, 256, (c) => {
  const r = rng(3); c.fillStyle = '#4a4a4c'; c.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 3000; i++) { const g = 60 + r() * 30; c.fillStyle = `rgb(${g},${g},${g + 2})`; c.fillRect(r() * 512, r() * 256, 2, 2); }
  // box UV: v runs across the road (27.4 m); 6 lanes, dashes along u
  c.fillStyle = '#e8e4d8';
  for (let k = 1; k < 6; k++) { const y = 18 + k * (220 / 6); if (k === 3) { c.fillStyle = '#e0b43a'; c.fillRect(0, y - 3, 512, 6); c.fillStyle = '#e8e4d8'; } else for (let x = 0; x < 512; x += 128) c.fillRect(x, y - 2, 64, 4); }
  c.fillStyle = '#8a8680'; c.fillRect(0, 0, 512, 16); c.fillRect(0, 240, 512, 16);   // sidewalks
});
const trussTex = () => canvasTex(512, 128, (c) => {
  c.clearRect(0, 0, 512, 128); c.strokeStyle = '#fff'; c.lineWidth = 12;
  c.strokeRect(6, 6, 500, 116);
  c.beginPath(); for (let x = 0; x <= 512; x += 128) { c.moveTo(x, 6); c.lineTo(x + 64, 122); c.lineTo(x + 128, 6); c.moveTo(x, 6); c.lineTo(x, 122); } c.stroke();
});
const waterNormal = () => canvasTex(512, 512, (c) => {
  const img = c.createImageData(512, 512); const H = (x: number, y: number) => fbm2(x / 40, y / 40, 9, 4) + 0.5 * fbm2(x / 13, y / 11, 4, 3);
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const dx = H((x + 1) % 512, y) - H((x + 511) % 512, y), dy = H(x, (y + 1) % 512) - H(x, (y + 511) % 512);
    const i = (y * 512 + x) * 4; img.data[i] = 128 + dx * 300; img.data[i + 1] = 128 + dy * 300; img.data[i + 2] = 255; img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
}, false);

// ---------- deck sag/break patch: hinge at the towers, the two halves of the main span drop and part
const deckU = {uSag: {value: 0}, uBreak: {value: 0}};
const deckPatch = (m: THREE.MeshStandardMaterial) => {
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, deckU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\nuniform float uSag; uniform float uBreak;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float ax = abs(transformed.x);
        if (ax < ${HALF.toFixed(1)}) {
          float u = ax / ${HALF.toFixed(1)};
          transformed.y -= uSag * 120.0 * (1.0 - u * u);
          float th = uBreak * 0.33, arm = ${HALF.toFixed(1)} - ax;
          transformed.x = sign(transformed.x) * (${HALF.toFixed(1)} - arm * cos(th));
          transformed.y -= arm * sin(th);
        }`);
  };
  return m;
};

// ---------- load-path glow tubes: radius-1 tubes re-sized in the vertex shader, comet pulses along s
type GlowU = {uT: {value: number}; uOn: {value: number}; uFocusX: {value: number}; uFocusW: {value: number}};
const glowMat = (color: string, speed: number, spacing: number, px: number, minR: number): THREE.ShaderMaterial & {uniforms: GlowU} =>
  new THREE.ShaderMaterial({
    uniforms: {uT: {value: 0}, uOn: {value: 0}, uFocusX: {value: 0}, uFocusW: {value: 1e5}, uC: {value: col(color)}},
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute float s; attribute vec3 ctr; varying float vS; varying float vX; varying float vEdge;
      void main() {
        vec4 wc = modelMatrix * vec4(ctr, 1.0);
        float d = distance(cameraPosition, wc.xyz);
        float r = max(${minR.toFixed(3)}, d * ${(px * 0.00055).toFixed(6)});
        vec3 p = ctr + normalize(position - ctr) * r;
        vS = s; vX = wc.x;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vec3 nV = normalize(normalMatrix * normalize(position - ctr));
        vEdge = abs(dot(nV, normalize(-mv.xyz)));
        gl_Position = projectionMatrix * mv;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <logdepthbuf_pars_fragment>
      uniform float uT; uniform float uOn; uniform float uFocusX; uniform float uFocusW; uniform vec3 uC;
      varying float vS; varying float vX; varying float vEdge;
      void main() {
        #include <logdepthbuf_fragment>
        float ph = fract((vS - uT * ${speed.toFixed(2)}) / ${spacing.toFixed(2)});
        float head = ph * ph * ph * ph * ph * ph;            // sharp front, long tail: reads as travel direction
        head *= smoothstep(1.0, 0.97, ph);
        float f = exp(-pow((vX - uFocusX) / uFocusW, 2.0));
        float core = smoothstep(0.0, 0.8, vEdge);
        float a = uOn * f * (0.28 + 1.5 * head) * (0.35 + 0.65 * core);
        gl_FragColor = vec4(uC * (1.0 + 0.8 * head), a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false,
  }) as THREE.ShaderMaterial & {uniforms: GlowU};

// one tube along points (in order of the load's travel), with s = metres along and ctr = the centre line
const glowTube = (pts: THREE.Vector3[], radial = 6) => {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const n = Math.max(8, Math.round(curve.getLength() / 4));
  const g = new THREE.TubeGeometry(curve, n, 1, radial, false);
  const L = curve.getLength(), uv = g.getAttribute('uv'), pos = g.getAttribute('position');
  const s = new Float32Array(uv.count), ctr = new Float32Array(uv.count * 3);
  const frames = curve.computeFrenetFrames(n, false);
  for (let i = 0; i < uv.count; i++) {
    const seg = Math.floor(i / (radial + 1)); s[i] = uv.getX(i) * L;
    const c = curve.getPointAt(seg / n); ctr[i * 3] = c.x; ctr[i * 3 + 1] = c.y; ctr[i * 3 + 2] = c.z;
  }
  void frames; void pos;
  g.setAttribute('s', new THREE.BufferAttribute(s, 1)); g.setAttribute('ctr', new THREE.BufferAttribute(ctr, 3));
  return g;
};
const line = (a: THREE.Vector3, b: THREE.Vector3, n = 6) => Array.from({length: n + 1}, (_, i) => a.clone().lerp(b, i / n));

// hanger positions: every 15.2 m where the cable is above the road
const hangerXs = (() => {
  const xs: number[] = [];
  for (let x = -ANCH_X + 40; x <= ANCH_X - 40; x += TL.HANG_DX) {
    if (Math.abs(Math.abs(x) - HALF) < 9) continue;
    if (cableY(x) - DECK_Y < 3) continue;
    xs.push(x);
  }
  return xs;
})();

// terrain height: shores at both ends, far hills across the strait, water elsewhere
const landH = (x: number, z: number) => {
  const ax = Math.abs(x);
  const shore = THREE.MathUtils.smoothstep(ax, 900, 1000);
  const far = THREE.MathUtils.smoothstep(-z, 2600, 3600);
  const hill = fbm2(x / 520, z / 520, 2, 5);
  const nearRoad = THREE.MathUtils.smoothstep(Math.abs(z), 40, 160);
  const back = THREE.MathUtils.smoothstep(ax, 1000, 1700);
  const hS = 50 + 8 * hill + (0.5 + hill) * 190 * nearRoad * back;
  const hF = 40 + (0.5 + hill) * 230;
  const m = Math.max(shore, far);
  return m > 0 ? Math.max(shore * hS, far * hF) * Math.min(1, m * 1.4) - (1 - m) * 25 : -25;
};

export const Scene: React.FC<{t: number}> = ({t}) => {
  const {gl, camera, scene} = useThree();
  const shot = TL.shotAt(t);

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const root = new THREE.Group(); scene.add(root);
    const L = skyLight(gl, SKY);
    const sky = L.sky; sky.scale.setScalar(40000); root.add(sky);
    const sun = makeSun({direction: L.sunDir, color: L.sunColor, intensity: L.sunIntensity, center: new THREE.Vector3(-300, 90, 0), radius: 1150, distance: 3000});
    sun.shadow.camera.far = 6000; sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias = -0.0006;
    root.add(sun, sun.target);
    const hemi = new THREE.HemisphereLight(L.skyIrradiance.clone().multiplyScalar(0.32), L.ground.clone().multiplyScalar(1.4), 1); root.add(hemi);
    const horizon = L.horizon.clone(); const fogC = new THREE.Color(horizon.r, horizon.g, horizon.b);
    // fog is applied after tone mapping: approximate the horizon colour as it is displayed
    fogC.setRGB(...([fogC.r, fogC.g, fogC.b].map((v) => Math.pow(Math.min(1, v * 0.3 * 0.9), 1 / 2.2)) as [number, number, number]));

    // ----- water
    const wn = waterNormal(); wn.repeat.set(900, 900);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(40000, 40000), new THREE.MeshStandardMaterial({color: col('#1a3442'), roughness: 0.07, metalness: 0, normalMap: wn, normalScale: new THREE.Vector2(0.35, 0.35), envMap: L.envMap, envMapIntensity: 1.0}));
    water.rotation.x = -Math.PI / 2; water.receiveShadow = true; root.add(water);

    // ----- land
    const tg = new THREE.PlaneGeometry(18000, 13000, 360, 260); tg.rotateX(-Math.PI / 2); tg.translate(0, 0, -3500);
    const tp = tg.getAttribute('position'); const tc = new Float32Array(tp.count * 3);
    const cGrass = col('#3f5230'), cDry = col('#7d7048'), cRock = col('#7b736a'), tmp = new THREE.Color();
    for (let i = 0; i < tp.count; i++) {
      const x = tp.getX(i), z = tp.getZ(i), h = landH(x, z); tp.setY(i, h);
      const n = 0.5 + fbm2(x / 90, z / 90, 7, 3);
      tmp.copy(cGrass).lerp(cDry, THREE.MathUtils.clamp(n * 1.2 - 0.1, 0, 1)); if (h < 4) tmp.lerp(cRock, 0.7);
      tc[i * 3] = tmp.r; tc[i * 3 + 1] = tmp.g; tc[i * 3 + 2] = tmp.b;
    }
    tg.setAttribute('color', new THREE.BufferAttribute(tc, 3)); tg.computeVertexNormals();
    const land = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({vertexColors: true, roughness: 1, metalness: 0})); land.receiveShadow = true; root.add(land);

    // ----- bridge materials
    const paint = new THREE.MeshStandardMaterial({color: col('#C8432B'), roughness: 0.5, metalness: 0.15});
    const paintF = paint.clone();          // the parts that fade out in the "no cables" beat
    const concrete = new THREE.MeshStandardMaterial({color: col('#a8a196'), roughness: 0.92});
    const steel = new THREE.MeshStandardMaterial({color: col('#8d949c'), roughness: 0.35, metalness: 0.75, envMap: L.envMap});
    const bridge = new THREE.Group(); root.add(bridge);
    const fading = new THREE.Group(); bridge.add(fading);    // towers, cables, hangers
    const add = (g: THREE.Group, geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => {
      const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; g.add(o); return o;
    };

    // towers: two tapered legs per tower (one under each cable), portal struts, a concrete pier
    for (const sx of [-1, 1]) {
      const X = sx * HALF;
      for (const sz of [-1, 1]) {
        const leg = new THREE.BoxGeometry(1, 1, 1, 1, 8, 1); leg.translate(0, 0.5, 0);
        const p = leg.getAttribute('position');
        for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = 1 - 0.45 * y; p.setX(i, p.getX(i) * 10.5 * (0.75 + 0.25 * k)); p.setZ(i, p.getZ(i) * 9.5 * k); p.setY(i, 12 + y * (TOWER_H - 12)); }
        leg.computeVertexNormals();
        add(fading, leg, paintF, X, 0, sz * CAB_Z);
        // vertical stepped ribs on the outer faces
        for (const r of [-3, 3]) add(fading, new THREE.BoxGeometry(1.2, TOWER_H - 20, 1.2), paintF, X + r, 12 + (TOWER_H - 20) / 2, sz * (CAB_Z + 3.2));
        // saddle on top
        add(fading, new THREE.BoxGeometry(8, 5, 4), paintF, X, TOWER_H - 1.5, sz * CAB_Z);
      }
      for (const [y, h] of [[78, 9], [128, 7], [172, 7], [208, 6], [TOWER_H - 6, 7]]) add(fading, new THREE.BoxGeometry(6.5, h, 2 * CAB_Z), paintF, X, y, 0);
      add(bridge, new THREE.BoxGeometry(46, 16, 2 * CAB_Z + 30), concrete, X, 4, 0);
    }

    // main cables: steel-wrapped tubes along cableY, ending inside the anchorages
    const cabPts = (sz: number) => { const pts: THREE.Vector3[] = []; for (let x = -ANCH_X - 6; x <= ANCH_X + 6; x += 6) pts.push(new THREE.Vector3(x, Math.abs(x) > ANCH_X ? cableY(Math.sign(x) * ANCH_X) - 6 : cableY(x), sz * CAB_Z)); return pts; };
    const cableMat = paintF;
    for (const sz of [-1, 1]) { const c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cabPts(sz)), 700, TL.CAB_R, 10), cableMat); c.castShadow = true; fading.add(c); }

    // hangers (instanced, two per x)
    const hangGeo = new THREE.CylinderGeometry(0.09, 0.09, 1, 5).translate(0, -0.5, 0);
    const hangers = new THREE.InstancedMesh(hangGeo, paintF, hangerXs.length * 2); hangers.castShadow = true; fading.add(hangers);
    const placeHangers = (tt: number) => {
      const M = new THREE.Matrix4(); let i = 0;
      for (const x of hangerXs) for (const sz of [-1, 1]) {
        const top = cableY(x), len = (top - DECK_Y - 3.5) * TL.hangerDrop(tt, x);
        M.makeScale(1, Math.max(len, 0.001), 1).setPosition(x, top, sz * CAB_Z); hangers.setMatrixAt(i++, M);
      }
      hangers.instanceMatrix.needsUpdate = true;
    };
    placeHangers(0);

    // deck: road slab + truss sides; two halves (left x<0, right x>0) so the break can part them
    const rt = roadTex(); rt.repeat.set(1, 1);
    const roadMat = deckPatch(new THREE.MeshStandardMaterial({color: col('#ffffff'), map: rt, roughness: 0.9}));
    const tt = trussTex(); tt.repeat.set(DECK_END / 16, 1);
    const trussMat = deckPatch(new THREE.MeshStandardMaterial({color: col('#C8432B'), roughness: 0.55, metalness: 0.15, alphaMap: tt, alphaTest: 0.5, side: THREE.DoubleSide}));
    const chordMat = deckPatch(paint.clone() as THREE.MeshStandardMaterial);
    for (const sx of [-1, 1]) {
      const len = DECK_END - 0.6, cx = sx * (0.6 + len / 2);
      const road = new THREE.BoxGeometry(len, 0.8, DECK_W, 600, 1, 1); road.translate(cx, DECK_Y, 0);
      const ruv = road.getAttribute('uv'); for (let i = 0; i < ruv.count; i++) ruv.setX(i, ruv.getX(i) * len / 30);
      add(bridge, road, roadMat, 0, 0, 0);
      for (const sz of [-1, 1]) {
        const tr = new THREE.PlaneGeometry(len, 7.6, 600, 1); tr.translate(cx, DECK_Y - 4.2, sz * (DECK_W / 2 - 0.2)); add(bridge, tr, trussMat, 0, 0, 0);
        for (const y of [DECK_Y - 0.6, DECK_Y - 7.8]) { const ch = new THREE.BoxGeometry(len, 0.7, 0.7, 600, 1, 1); ch.translate(cx, y, sz * (DECK_W / 2 - 0.2)); add(bridge, ch, chordMat, 0, 0, 0); }
        const rail = new THREE.BoxGeometry(len, 1.1, 0.15, 600, 1, 1); rail.translate(cx, DECK_Y + 0.95, sz * (DECK_W / 2 - 1.2)); add(bridge, rail, chordMat, 0, 0, 0);
      }
    }
    // approach roads on the land beyond the anchorages
    for (const sx of [-1, 1]) add(bridge, new THREE.BoxGeometry(1400, 0.8, DECK_W), roadMat, sx * (DECK_END + 700), DECK_Y, 0);
    // street lights along the rail
    const lamps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.25, 8, 0.25).translate(0, 4, 0), chordMat, Math.ceil(DECK_END * 2 / 50) * 2);
    { const M = new THREE.Matrix4(); let i = 0; for (let x = -DECK_END + 20; x < DECK_END; x += 50) for (const sz of [-1, 1]) lamps.setMatrixAt(i++, M.makeTranslation(x, DECK_Y + 0.4, sz * (DECK_W / 2 - 1.0))); lamps.count = i; }
    lamps.castShadow = true; bridge.add(lamps);

    // anchorages: concrete blocks the cables dive into, the road running over them
    const anchors: THREE.Mesh[] = [];
    for (const sx of [-1, 1]) {
      const a = add(bridge, new THREE.BoxGeometry(70, 42, DECK_W + 22), concrete, sx * (ANCH_X + 31), DECK_Y - 21.4, 0); anchors.push(a);
      add(bridge, new THREE.BoxGeometry(74, 3, DECK_W + 26), concrete, sx * (ANCH_X + 31), DECK_Y - 41, 0);
    }

    // traffic: instanced car bodies and cabins on six lanes, plus the hero car (near lane)
    const NC = 90, r = rng(11);
    const carCols = ['#d9d9d6', '#2b2f36', '#8b1e1e', '#6f7a86', '#c9c3b5', '#24467a', '#111214'].map(col);
    const bodies = new THREE.InstancedMesh(new THREE.BoxGeometry(4.6, 1.0, 1.85).translate(0, 0.75, 0), new THREE.MeshStandardMaterial({roughness: 0.35, metalness: 0.4}), NC);
    const cabins = new THREE.InstancedMesh(new THREE.BoxGeometry(2.5, 0.65, 1.7).translate(-0.2, 1.55, 0), new THREE.MeshStandardMaterial({color: col('#1b2026'), roughness: 0.15, metalness: 0.6}), NC);
    const lanes = [-11, -7.4, -3.8, 3.8, 7.4, 11].map((z) => z * 0.92);
    const cars = Array.from({length: NC}, (_, i) => ({lane: i % 6, x0: -DECK_END + r() * 2 * DECK_END, v: 22 + r() * 6}));
    cars.forEach((_, i) => bodies.setColorAt(i, carCols[i % carCols.length]));
    bodies.castShadow = cabins.castShadow = true; bridge.add(bodies, cabins);
    const hero = new THREE.Group();
    add(hero, new THREE.BoxGeometry(4.7, 1.0, 1.9).translate(0, 0.78, 0), new THREE.MeshStandardMaterial({color: col('#e6e3dc'), roughness: 0.3, metalness: 0.5}), 0, 0, 0);
    add(hero, new THREE.BoxGeometry(2.6, 0.7, 1.75).translate(-0.25, 1.62, 0), new THREE.MeshStandardMaterial({color: col('#1b2026'), roughness: 0.1, metalness: 0.7}), 0, 0, 0);
    for (const [wx, wz] of [[1.5, 0.9], [-1.5, 0.9], [1.5, -0.9], [-1.5, -0.9]]) { const w = add(hero, new THREE.CylinderGeometry(0.36, 0.36, 0.25, 14), new THREE.MeshStandardMaterial({color: col('#141414'), roughness: 0.8}), wx, 0.36, wz); w.rotation.x = Math.PI / 2; }
    bridge.add(hero);

    // ----- load glows
    const gHang = glowMat(TL.CYAN, 26, 22, 3.2, 0.16), gMain = glowMat(TL.CYAN, 60, 90, 4.2, 0.6), gSide = glowMat(TL.CYAN, 60, 90, 4.2, 0.6);
    const gTower = glowMat(TL.AMBER, 45, 55, 6.5, 1.8), gAnchor = glowMat(TL.CYAN, 60, 90, 4.2, 0.6); gAnchor.depthTest = false;
    const hangGeos: THREE.BufferGeometry[] = [];
    for (const x of hangerXs) for (const sz of [-1, 1]) hangGeos.push(glowTube(line(new THREE.Vector3(x, DECK_Y + 0.5, sz * CAB_Z), new THREE.Vector3(x, cableY(x), sz * CAB_Z), 2), 5));
    const glowRoot = new THREE.Group(); root.add(glowRoot);
    const mk = (g: THREE.BufferGeometry, m: THREE.Material, order = 5) => { const o = new THREE.Mesh(g, m); o.frustumCulled = false; o.renderOrder = order; glowRoot.add(o); return o; };
    mk(mergeGeometries(hangGeos), gHang);
    const mainGeos: THREE.BufferGeometry[] = [], sideGeos: THREE.BufferGeometry[] = [], anchorGeos: THREE.BufferGeometry[] = [], towerGeos: THREE.BufferGeometry[] = [];
    for (const sz of [-1, 1]) for (const sx of [-1, 1]) {
      const m: THREE.Vector3[] = []; for (let x = 0; x <= HALF; x += 8) m.push(new THREE.Vector3(sx * x, cableY(x) + 0.3, sz * CAB_Z)); mainGeos.push(glowTube(m, 6));
      const s: THREE.Vector3[] = []; for (let x = HALF; x <= ANCH_X; x += 8) s.push(new THREE.Vector3(sx * x, cableY(x) + 0.3, sz * CAB_Z)); sideGeos.push(glowTube(s, 6));
      anchorGeos.push(glowTube(line(new THREE.Vector3(sx * (ANCH_X - 30), cableY(ANCH_X - 30), sz * CAB_Z), new THREE.Vector3(sx * (ANCH_X + 40), DECK_Y - 30, sz * CAB_Z), 8), 6));
      for (const ox of [-3, 3]) towerGeos.push(glowTube(line(new THREE.Vector3(sx * HALF + ox, TOWER_H + 1, sz * (CAB_Z + 5.6)), new THREE.Vector3(sx * HALF + ox, 10, sz * (CAB_Z + 5.6)), 10), 8));
    }
    mk(mergeGeometries(mainGeos), gMain); mk(mergeGeometries(sideGeos), gSide); mk(mergeGeometries(anchorGeos), gAnchor); mk(mergeGeometries(towerGeos), gTower);
    // anchorage glow shell (it holds: a soft cyan rim that brightens)
    const shellMat = new THREE.MeshBasicMaterial({color: col(TL.CYAN), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false});
    for (const sx of [-1, 1]) { const sh = new THREE.Mesh(new THREE.BoxGeometry(73, 45, DECK_W + 25), shellMat); sh.position.set(sx * (ANCH_X + 31), DECK_Y - 21.4, 0); sh.renderOrder = 4; glowRoot.add(sh); }

    // ----- the cut cable piece: 61 strands x 452 wires
    const piece = new THREE.Group(); root.add(piece);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(TL.CAB_R, TL.CAB_R, 6, 64, 1, true).translate(0, -3, 0), steel); piece.add(body);
    const NS = 61, NW = 452, strands: [number, number][] = [[0, 0]];
    for (let ring = 1; ring <= 4; ring++) for (let side = 0; side < 6; side++) for (let k = 0; k < ring; k++) {
      const a0 = (side * Math.PI) / 3, a1 = ((side + 1) * Math.PI) / 3;
      const p0 = [Math.cos(a0) * ring, Math.sin(a0) * ring], p1 = [Math.cos(a1) * ring, Math.sin(a1) * ring], u = k / ring;
      strands.push([p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u]);
    }
    const SP = 0.098, RS = 0.0475, WR = RS * 0.86 * Math.sqrt(1 / NW);
    const wires = new THREE.InstancedMesh(new THREE.CircleGeometry(WR, 7), new THREE.MeshBasicMaterial({toneMapped: false}), NS * NW);
    const order: {i: number; d: number}[] = [];
    { const M = new THREE.Matrix4(); let i = 0; const r2 = rng(5);
      strands.slice(0, NS).forEach(([sx, sy]) => { for (let k = 0; k < NW; k++) {
        const rr = RS * Math.sqrt((k + 0.5) / NW), a = k * 2.39996323;
        const x = sx * SP + rr * Math.cos(a), y = sy * SP + rr * Math.sin(a);
        M.makeRotationX(-Math.PI / 2).setPosition(x, 0.004, y); wires.setMatrixAt(i, M);
        order.push({i, d: Math.hypot(x, y) + r2() * 0.03}); i++;
      } });
    }
    const rank = new Float32Array(NS * NW); order.sort((a, b) => a.d - b.d).forEach((o, k) => { rank[o.i] = k / (NS * NW); });
    const face = new THREE.Mesh(new THREE.CircleGeometry(TL.CAB_R, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({color: col('#0d1014'), toneMapped: false}));
    piece.add(face, wires);
    const wireBase = Array.from({length: NS * NW}, (_, i) => { const v = 0.62 + 0.25 * Math.abs(Math.sin(i * 12.9898) * 43758.5453 % 1); return v; });

    return {root, sky, water, wn, fading, paintF, hangers, placeHangers, cars, bodies, cabins, lanes, hero, gHang, gMain, gSide, gTower, gAnchor, shellMat,
      piece, wires, rank, wireBase, fogC, anchors};
  }, [gl, scene]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.fov = c.fov; cam.near = shot === 'wires' ? 0.05 : 0.5; cam.far = 40000; cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.updateProjectionMatrix();
  gl.toneMappingExposure = 0.3; scene.background = null; scene.fog = new THREE.FogExp2(W.fogC.getHex(), 0.00016);
  W.sky.position.copy(cam.position);
  W.wn.offset.set(t * 0.004, t * 0.0025);

  // fading supports and the sagging deck
  const sup = TL.support(t);
  W.fading.visible = sup > 0.01;
  W.paintF.transparent = sup < 0.999; W.paintF.opacity = sup; W.paintF.depthWrite = sup > 0.5;
  deckU.uSag.value = TL.sagK(t); deckU.uBreak.value = TL.breakK(t);
  W.placeHangers(t);

  // traffic (stopped in the break beat: no cars on a breaking road)
  const traffic = shot !== 'sag' && shot !== 'hangs';
  W.bodies.visible = W.cabins.visible = traffic;
  if (traffic) {
    const M = new THREE.Matrix4(), span = 2 * (ANCH_X - 4);
    W.cars.forEach((k, i) => {
      const dir = k.lane < 3 ? -1 : 1; let x = ((k.x0 + dir * k.v * t + span * 10) % span) - span / 2;
      if (Math.abs(x - TL.carX(t)) < 14 && k.lane === 5) x += 30;
      M.makeTranslation(x, DECK_Y + 0.4, W.lanes[k.lane]); W.bodies.setMatrixAt(i, M); W.cabins.setMatrixAt(i, M);
    });
    W.bodies.instanceMatrix.needsUpdate = W.cabins.instanceMatrix.needsUpdate = true;
  }
  W.hero.visible = shot === 'hangers' || shot === 'main';
  W.hero.position.set(TL.carX(t), DECK_Y + 0.4, W.lanes[5]);
  W.hero.children.slice(2).forEach((w) => { w.rotation.y = -(TL.carX(t) + 330) / 0.36; });

  // load glows
  const g = TL.glow(t);
  for (const m of [W.gHang, W.gMain, W.gSide, W.gTower, W.gAnchor]) m.uniforms.uT.value = t;
  W.gHang.uniforms.uOn.value = g.hang; W.gHang.uniforms.uFocusX.value = g.focusX; W.gHang.uniforms.uFocusW.value = g.focusW;
  W.gMain.uniforms.uOn.value = g.main; W.gSide.uniforms.uOn.value = g.side; W.gTower.uniforms.uOn.value = g.tower; W.gAnchor.uniforms.uOn.value = g.anchor;
  W.shellMat.opacity = g.anchor * (0.2 + 0.08 * Math.sin(t * 6));

  // the cut cable piece
  W.piece.visible = shot === 'wires';
  if (W.piece.visible) {
    const n = new THREE.Vector3(...TL.WIRE_N), out = TL.wireOut(t);
    W.piece.position.set(...TL.WIRE_AT).addScaledVector(n, -7 * (1 - out));
    W.piece.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    W.piece.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (t - TL.CUT.wires) * 0.35));
    const lit = TL.wireLit(t), cc = new THREE.Color(), base = new THREE.Color('#8e979f'), hot = new THREE.Color('#c8f6ff');
    for (let i = 0; i < W.rank.length; i++) {
      const b = W.wireBase[i]; const on = THREE.MathUtils.clamp((lit - W.rank[i]) * 40, 0, 1);
      cc.copy(base).multiplyScalar(b).lerp(hot, on * 0.85); W.wires.setColorAt(i, cc);
    }
    W.wires.instanceColor!.needsUpdate = true;
  }
  return null;
};
