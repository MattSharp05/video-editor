// One three.js world: a found kitchen in the morning, a found glass kettle on the counter with water built in code
// (tinted by temperature: blue cooler, orange near 100 C, a thin red superheated layer on the plate), bubbles from a
// deterministic site model (they collapse at dieHeight, or reach the top at the boil), sound rings in the air, a
// phone leaning beside it showing a noise bar, and a macro set (x20) far away for the element shots: the plate, the
// red layer, a swarm of bubbles and the hero bubble that crumples to nothing. Built once; per frame only uniforms,
// instance matrices and transforms change.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {random} from 'remotion';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
export type Assets = {kettle: GLTF; kitchen: GLTF};
export type Panel = 'L' | 'R' | undefined;

// ---------- bubbles: a site model, pure in t
type Site = {x: number; z: number; P: number; ph: number; r: number; seed: string};
type BubCfg = {sites: Site[]; rise: number; grow: number; die: number; surface: number; collapse: number; rate: (te: number) => number; dieVar?: number};
type Bub = {x: number; y: number; z: number; r: number};
type Ring = {x: number; y: number; z: number; age: number; pop: boolean};
const simBubbles = (t: number, c: BubCfg, bubs: Bub[], rings: Ring[], maxRingAge: number) => {
  const life = c.grow + (c.surface + 0.2) / c.rise + c.collapse + maxRingAge;
  for (const s of c.sites) {
    const k1 = Math.floor((t - s.ph) / s.P), k0 = Math.max(Math.floor((t - s.ph - life) / s.P), -2);
    for (let k = k0; k <= k1; k++) {
      const te = s.ph + k * s.P; const a = t - te; if (a < 0) continue;
      if (random(s.seed + k) > c.rate(te)) continue;
      const r0 = s.r * (0.7 + 0.6 * random(s.seed + 'r' + k));
      const jx = (random(s.seed + 'x' + k) - 0.5) * s.r * 1.2, jz = (random(s.seed + 'z' + k) - 0.5) * s.r * 1.2;
      if (a < c.grow) { const r = r0 * (0.2 + 0.8 * a / c.grow); bubs.push({x: s.x, y: r * 0.9, z: s.z, r}); continue; }
      const h = r0 + c.rise * (a - c.grow); // height of the centre above the plate
      const die = c.die * (1 - (c.dieVar ?? 0.5) / 2 + (c.dieVar ?? 0.5) * random(s.seed + 'd' + k));
      const wob = Math.sin(a * 9 + k) * r0 * 0.4;
      if (die < c.surface) {
        if (h < die) { bubs.push({x: s.x + jx * (h / die) + wob, y: h, z: s.z + jz * (h / die), r: r0 * (1 - 0.25 * h / die)}); continue; }
        const ac = (h - die) / c.rise; // time since it reached its collapse height
        if (ac < c.collapse) { bubs.push({x: s.x + jx + wob, y: die, z: s.z + jz, r: r0 * 0.75 * (1 - ac / c.collapse)}); continue; }
        const ra = ac - c.collapse; if (ra < maxRingAge) rings.push({x: s.x + jx + wob, y: die, z: s.z + jz, age: ra, pop: false});
      } else {
        const top = c.surface - r0 * 0.5;
        if (h < top) { bubs.push({x: s.x + jx * (h / top) + wob, y: h, z: s.z + jz * (h / top), r: r0 * (1 + 0.5 * h / c.surface)}); continue; }
        const ra = (h - top) / c.rise; if (ra < maxRingAge) rings.push({x: s.x + jx, y: c.surface, z: s.z + jz, age: ra, pop: true});
      }
    }
  }
};
const mkSites = (n: number, R: number, P0: number, P1: number, r: number, tag: string, rect?: [number, number]): Site[] =>
  Array.from({length: n}, (_, i) => {
    let x: number, z: number;
    if (rect) { x = (random(tag + 'sx' + i) - 0.5) * rect[0]; z = (random(tag + 'sz' + i) - 0.5) * rect[1]; }
    else { const a = random(tag + 'sa' + i) * Math.PI * 2, d = Math.sqrt(random(tag + 'sd' + i)) * R; x = Math.cos(a) * d; z = Math.sin(a) * d; }
    return {x, z, P: P0 + (P1 - P0) * random(tag + 'sp' + i), ph: random(tag + 'ph' + i) * 2, r, seed: tag + i + '_'};
  });

// a clear bubble: a bright fresnel rim, nearly empty middle, a highlight; brightness from instanceColor.r
const bubbleMat = (flash = 0) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, toneMapped: false,
  uniforms: {uFlash: {value: flash}, uTint: {value: new THREE.Color('#dff1ff')}},
  vertexShader: `varying vec3 vN; varying vec3 vV; varying float vB;
    void main(){ vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
      vV = normalize(cameraPosition - wp.xyz); vB = 1.0;
      #ifdef USE_INSTANCING_COLOR
      vB = instanceColor.r;
      #endif
      gl_Position = projectionMatrix * viewMatrix * wp; }`,
  fragmentShader: `varying vec3 vN; varying vec3 vV; varying float vB; uniform vec3 uTint;
    void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
      vec3 L = normalize(vec3(-0.4, 0.8, 0.5)); float sp = pow(max(dot(reflect(-L, normalize(vN)), normalize(vV)), 0.0), 40.0);
      vec3 c = uTint * (0.25 + 1.6 * f) * vB + vec3(1.0) * sp * 1.5;
      gl_FragColor = vec4(c, clamp(0.08 + 0.85 * f + sp, 0.0, 1.0)); }`,
});
// a ring: a thin bright annulus on a camera-facing quad; instanceColor = (alpha, hue 0 gold / 1 white, -)
const ringMat = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending,
  vertexShader: `varying vec2 vUv; varying vec3 vC; void main(){ vUv = uv; vC = vec3(1.0);
      #ifdef USE_INSTANCING_COLOR
      vC = instanceColor;
      #endif
      gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }`,
  fragmentShader: `varying vec2 vUv; varying vec3 vC; void main(){ float d = length(vUv - 0.5) * 2.0;
      float ring = exp(-pow((d - 0.86) * 18.0, 2.0)) + 0.5 * exp(-pow(d * 4.0, 2.0)) * vC.b;
      vec3 c = mix(vec3(1.0, 0.86, 0.55), vec3(0.92, 0.96, 1.0), vC.g);
      gl_FragColor = vec4(c * ring * vC.r * 1.6, 1.0); }`,
});
const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const NOISE = /* glsl */ `float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1,0)), f.x), mix(hash21(i + vec2(0,1)), hash21(i + vec2(1,1)), f.x), f.y); }`;

// the phone's screen: a noise bar and the last few seconds of level, drawn each frame
const drawPhone = (g: CanvasRenderingContext2D, t: number, panel: Panel) => {
  const W = 300, H = 640; g.fillStyle = '#0c0e12'; g.fillRect(0, 0, W, H);
  const lvl = (tt: number) => clampL(TL.loudAt(Math.max(0, tt), panel) * (0.86 + 0.14 * Math.sin(tt * 23.1) * Math.sin(tt * 7.3 + 1)));
  g.fillStyle = '#e8ecf2'; g.font = '700 40px sans-serif'; g.textAlign = 'center'; g.fillText('NOISE', W / 2, 74);
  // history: bars for the last 4 s, newest on the right
  const N = 40, gx = 24, gw = W - 48, gy = 120, gh = 220;
  g.fillStyle = '#1a1e25'; g.fillRect(gx, gy, gw, gh);
  for (let i = 0; i < N; i++) {
    const tt = t - (N - 1 - i) * 0.1; const v = tt < 0 ? 0 : lvl(tt); const bh = v * gh;
    g.fillStyle = barCol(v); g.fillRect(gx + i * gw / N + 1, gy + gh - bh, gw / N - 2, bh);
  }
  // the big level bar (segments)
  const v = lvl(t), segs = 12, bx = 40, bw = W - 80, by = 380, bh = 230;
  for (let i = 0; i < segs; i++) {
    const on = (i + 0.5) / segs < v; const y = by + bh - (i + 1) * bh / segs;
    g.fillStyle = on ? barCol((i + 0.5) / segs) : '#20252d'; g.fillRect(bx, y + 3, bw, bh / segs - 6);
  }
};
const clampL = (x: number) => Math.min(1, Math.max(0, x));
const barCol = (v: number) => (v > 0.72 ? '#ff3b2f' : v > 0.48 ? '#ffc21a' : '#36d46b');

export const Scene: React.FC<{t: number; assets: Assets; panel?: Panel; aspect?: number; debugCam?: number[]}> = ({t, assets, panel, debugCam}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const pm = new THREE.PMREMGenerator(gl); const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.background = col('#0b0d12');
    const root = new THREE.Group(); scene.add(root);
    const tex = glowTex();

    // ---------- light: morning, a warm window key from the right, a soft sky fill
    const hemi = new THREE.HemisphereLight(col('#dfe8f5'), col('#4a3c2e'), 0.35); root.add(hemi);
    const key = new THREE.DirectionalLight(col('#FFE2B8'), 1.5);
    key.position.set(TL.KET.x + 1.6, TL.KET.y + 1.4, TL.KET.z + 1.0); key.target.position.set(TL.KET.x, TL.KET.y + 0.1, TL.KET.z);
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004;
    const sc = key.shadow.camera as THREE.OrthographicCamera; sc.left = -0.6; sc.right = 0.6; sc.top = 0.6; sc.bottom = -0.6; sc.near = 0.5; sc.far = 5;
    root.add(key, key.target);
    const fill = new THREE.DirectionalLight(col('#b9c9e6'), 0.6); fill.position.set(TL.KET.x - 2, TL.KET.y + 1.2, TL.KET.z + 1.5); root.add(fill);
    const rim = new THREE.SpotLight(col('#fff4e0'), 3, 3, Math.PI / 6, 0.6, 1.5); rim.position.set(TL.KET.x - 0.4, TL.KET.y + 0.8, TL.KET.z - 0.6); rim.target.position.set(TL.KET.x, TL.KET.y + 0.12, TL.KET.z); root.add(rim, rim.target);

    // ---------- kitchen (found): counter at 0.92 m (same placement as s5-microwave-myth)
    const k = assets.kitchen.scene.clone(true); const ks = 1.15;
    const kg = new THREE.Group(); kg.add(k); kg.scale.setScalar(ks); kg.position.set(-0.95 * ks, 0.92 + 0.95 * ks, -0.5 + 3.9 * ks); root.add(kg);
    k.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.receiveShadow = true; const mt = m.material as THREE.MeshStandardMaterial; if (mt) { mt.envMap = env; mt.envMapIntensity = 0.5; } } });

    // ---------- the kettle (found): glass jug, black base; the file's floor shadow plane hidden
    const kettle = new THREE.Group(); kettle.position.set(TL.KET.x, TL.KET.y, TL.KET.z); root.add(kettle);
    const km = assets.kettle.scene.clone(true); km.scale.setScalar(TL.KS); km.rotation.y = -Math.PI / 2; kettle.add(km); // handle to the right (+x), spout to the left
    km.traverse((o) => {
      const m = o as THREE.Mesh; if (!m.isMesh) return;
      const mt = m.material as THREE.MeshStandardMaterial;
      if (mt.name === 'Floor') { m.visible = false; return; }
      m.castShadow = true; m.receiveShadow = true;
      if (mt.name === 'Glass') {
        m.material = new THREE.MeshPhysicalMaterial({color: col('#f4fbff'), roughness: 0.04, metalness: 0, transparent: true, opacity: 0.14,
          envMap: env, envMapIntensity: 1.4, clearcoat: 1, clearcoatRoughness: 0.03, depthWrite: false, side: THREE.DoubleSide});
        m.renderOrder = 30; m.castShadow = false;
      } else if (mt.name === 'Body') { // the original is spec-gloss chrome: brushed steel
        m.material = new THREE.MeshStandardMaterial({color: col('#c9ccd1'), metalness: 1, roughness: 0.28, envMap: env, envMapIntensity: 1.1});
      } else if (mt.name === 'StandCap') { // the base and lid knob: black plastic
        m.material = new THREE.MeshStandardMaterial({color: col('#1c1e22'), metalness: 0.1, roughness: 0.38, envMap: env, envMapIntensity: 0.7});
      } else { mt.envMap = env; mt.envMapIntensity = 0.8; mt.color = col('#2a2c30'); }
    });
    // the water: a cylinder tinted by temperature (shader), a surface disc that rolls at the boil
    const WU = {uTint: {value: 0}, uLayer: {value: 1}, uTime: {value: 0}, uRoll: {value: 0}};
    const wH = TL.WATER.y1 - TL.WATER.y0;
    // the water follows the glass's inside profile (file mm: z 62..200, r 90..99), 3 mm in from the wall
    const prof = [[62, 87], [70, 91], [80, 94], [92, 96], [130, 96], [170, 93], [200, 89]].map(([z, r]) => new THREE.Vector2(r * 0.001 * TL.KS, z * 0.001 * TL.KS - TL.WATER.y0 - wH / 2));
    const water = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: WU, toneMapped: false,
      vertexShader: `varying vec3 vP; varying vec3 vN; varying vec3 vW; void main(){ vP = position; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `varying vec3 vP; varying vec3 vN; varying vec3 vW; uniform float uTint; uniform float uLayer; uniform float uTime; ${NOISE}
        void main(){ float y = vP.y + ${(wH / 2).toFixed(4)}; // height above the plate (m)
          vec3 cool = vec3(0.10, 0.38, 0.95), hot = vec3(1.0, 0.52, 0.16);
          vec3 c = mix(cool, hot, uTint);
          float layer = exp(-y / 0.004) * uLayer; // the superheated layer on the plate
          c = mix(c, vec3(1.0, 0.18, 0.08), clamp(layer, 0.0, 1.0));
          float sh = 0.85 + 0.15 * vnoise(vec2(atan(vP.z, vP.x) * 20.0, y * 300.0 - uTime * 2.0));
          float f = pow(1.0 - abs(dot(normalize(vN), normalize(cameraPosition - vW))), 1.5);
          gl_FragColor = vec4(c * sh * (0.55 + 0.6 * f), 0.13 + 0.25 * f + 0.4 * layer); }`,
    }));
    water.position.y = TL.WATER.y0 + wH / 2; water.renderOrder = 20; kettle.add(water);
    const surf = new THREE.Mesh(new THREE.CircleGeometry(0.089 * TL.KS, 64), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: WU, toneMapped: false,
      vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec2 vP; uniform float uTint; uniform float uRoll; uniform float uTime; ${NOISE}
        void main(){ float n = vnoise(vP * 120.0 + vec2(uTime * 3.0, -uTime * 2.2)) * vnoise(vP * 60.0 - uTime * 1.7);
          vec3 c = mix(vec3(0.75, 0.88, 1.0), vec3(1.0, 0.85, 0.65), uTint) * (0.5 + 1.4 * n * uRoll);
          gl_FragColor = vec4(c, 0.12 + 0.35 * uRoll * n); }`,
    }));
    surf.rotation.x = -Math.PI / 2; surf.position.y = TL.WATER.y1; surf.renderOrder = 21; kettle.add(surf);
    const steelMat = new THREE.MeshStandardMaterial({color: col('#b8bcc2'), metalness: 1, roughness: 0.3, envMap: env, envMapIntensity: 1});
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.089 * TL.KS, 0.089 * TL.KS, 0.004, 64), steelMat);
    plate.position.y = TL.PLATE_Y - 0.002; kettle.add(plate); plate.scale.setScalar(1.02);
    const plateGlow = new THREE.PointLight(col('#ff7a3a'), 0.12, 0.15, 2); plateGlow.position.set(0, TL.PLATE_Y + 0.02, 0); kettle.add(plateGlow);
    // the switch light on the base, and the plume of steam from the lid
    const sw = new THREE.Mesh(new THREE.SphereGeometry(0.008, 16, 12), new THREE.MeshBasicMaterial({color: col('#7fd0ff').multiplyScalar(2), toneMapped: false}));
    sw.position.set(0, 0.012, 0.079); kettle.add(sw);
    const swGlow = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col('#3aa0ff'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending}));
    swGlow.scale.setScalar(0.1); swGlow.position.copy(sw.position); kettle.add(swGlow);
    const steam = Array.from({length: 36}, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col('#c9d1da'), transparent: true, depthWrite: false, opacity: 0}));
      s.renderOrder = 35; kettle.add(s); return {s, ph: random('sp' + i), dx: (random('sx' + i) - 0.5), dz: (random('sz' + i) - 0.5)}; });

    // real-scale bubbles and rings inside the jug
    const realSites = mkSites(70, 0.08 * TL.KS, 0.18, 0.5, 0.0022, 'k');
    const NB = 500;
    const bub = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), bubbleMat(), NB); bub.renderOrder = 25; bub.frustumCulled = false; kettle.add(bub);
    bub.setColorAt(0, col('#ffffff'));
    const NR = 160;
    const rings = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), ringMat(), NR); rings.renderOrder = 26; rings.frustumCulled = false; kettle.add(rings);
    rings.setColorAt(0, col('#ffffff'));
    // sound rings in the air around the jug (pale, camera-facing)
    const NA = 7;
    const air = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), ringMat(), NA); air.renderOrder = 36; air.frustumCulled = false; kettle.add(air);
    air.setColorAt(0, col('#ffffff'));

    // ---------- the phone, leaning on a small stand beside the kettle
    const phone = new THREE.Group(); phone.position.set(TL.PHONE.x, TL.COUNTER_Y, TL.PHONE.z); phone.rotation.y = TL.PHONE.yaw; root.add(phone);
    const lean = new THREE.Group(); lean.rotation.x = -TL.PHONE.tilt; phone.add(lean);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.155, 0.008), new THREE.MeshPhysicalMaterial({color: col('#16181c'), roughness: 0.3, metalness: 0.4, clearcoat: 1, envMap: env}));
    body.position.y = 0.0775; body.castShadow = true; lean.add(body);
    const pc = document.createElement('canvas'); pc.width = 300; pc.height = 640; const pg = pc.getContext('2d')!;
    const ptex = new THREE.CanvasTexture(pc); ptex.colorSpace = THREE.SRGBColorSpace; ptex.anisotropy = 4;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.145), new THREE.MeshBasicMaterial({map: ptex, toneMapped: false}));
    screen.position.set(0, 0.0775, 0.0042); lean.add(screen);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.05), new THREE.MeshStandardMaterial({color: col('#2a2d33'), roughness: 0.6}));
    stand.position.set(0, 0.006, -0.03); phone.add(stand);

    // ---------- the macro set (x20): the plate, the superheated layer, the cooler water, the bubbles, the hero
    const mac = new THREE.Group(); mac.position.set(TL.MAC.x, TL.MAC.y, TL.MAC.z); root.add(mac);
    const mPlate = new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 14), new THREE.MeshStandardMaterial({color: col('#5a5e64'), metalness: 0.9, roughness: 0.42, envMap: env, envMapIntensity: 0.35}));
    mPlate.position.y = -0.15; mac.add(mPlate);
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(70, 30), new THREE.ShaderMaterial({toneMapped: false, depthWrite: false,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec2 vUv; void main(){ vec3 deep = vec3(0.012, 0.05, 0.16), up = vec3(0.05, 0.18, 0.42);
        vec3 c = mix(deep, up, smoothstep(0.45, 0.85, vUv.y)); 
        gl_FragColor = vec4(c, 1.0); }`}));
    backdrop.position.set(0, 0.5, -7.2); mac.add(backdrop);
    const LU = {uTime: {value: 0}};
    // the superheated layer: a few vertical temperature slices across the plate (additive), red hugging the metal
    const layerMat = new THREE.ShaderMaterial({transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, uniforms: LU, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vP; uniform float uTime; ${NOISE} void main(){ float y = vP.y + 0.2;
        float k = exp(-y / 0.045) * (0.7 + 0.3 * vnoise(vec2(vP.x * 6.0 + uTime * 0.6, y * 30.0 - uTime * 1.5)));
        float edge = smoothstep(9.0, 6.0, abs(vP.x)) * smoothstep(0.0, 0.035, y);
        gl_FragColor = vec4(vec3(1.0, 0.24, 0.07) * k * edge * 0.085, 1.0); }`});
    Array.from({length: 36}, (_, i) => 0.7 - i * 0.17).forEach((z) => { const sl = new THREE.Mesh(new THREE.PlaneGeometry(18, 0.4), layerMat); sl.position.set(0, 0.2, z); sl.renderOrder = 10; mac.add(sl); });
    const mLight = new THREE.PointLight(col('#ff6a30'), 0, 4, 1.2); mLight.position.set(0, 0.6, -1.5); mac.add(mLight);
    const mKey = new THREE.DirectionalLight(col('#cfe2ff'), 1.4); mKey.position.set(TL.MAC.x - 1, TL.MAC.y + 3, TL.MAC.z + 2); mKey.target.position.set(TL.MAC.x, TL.MAC.y, TL.MAC.z); root.add(mKey, mKey.target);
    const macSites = mkSites(170, 0, 0.45, 1.0, 0.026, 'm', [5, 2.6]);
    const fog = new THREE.FogExp2(col('#06142e'), 0.32);
    const mBub = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), bubbleMat(), 600); mBub.renderOrder = 25; mBub.frustumCulled = false; mac.add(mBub);
    mBub.setColorAt(0, col('#ffffff'));
    const mRings = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), ringMat(), 300); mRings.renderOrder = 26; mRings.frustumCulled = false; mac.add(mRings);
    mRings.setColorAt(0, col('#ffffff'));
    // the hero: a sphere that dents and crumples (vertex noise) as it shrinks to nothing
    const HU = {uCrumple: {value: 0}, uTime: {value: 0}};
    const heroMat = bubbleMat(); heroMat.uniforms.uCrumple = HU.uCrumple; heroMat.uniforms.uT = HU.uTime;
    heroMat.vertexShader = heroMat.vertexShader.replace('void main(){ vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);',
      `uniform float uCrumple; uniform float uT;
       void main(){ vec3 p = position; float d = sin(p.x * 5.1 + uT * 3.0) * sin(p.y * 4.3 - uT * 2.0) * sin(p.z * 6.2 + 1.3);
         float d2 = sin(p.x * 11.0 + 2.0) * sin(p.y * 9.0 + uT) * sin(p.z * 12.0);
         p *= 1.0 - uCrumple * (0.28 * (d * 0.5 + 0.5) + 0.12 * d2) - uCrumple * 0.12 * max(0.0, p.y);
         vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.0);`);
    const hero = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 64, 48), heroMat, 1); hero.renderOrder = 27; hero.frustumCulled = false; mac.add(hero);
    hero.setColorAt(0, col('#ffffff'));
    const heroFlash = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col('#ffe1a0'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false}));
    heroFlash.renderOrder = 28; mac.add(heroFlash);

    return {phone, fog, hemi, key, fill, rim, kettle, water, surf, WU, plateGlow, sw, swGlow, steam, realSites, bub, rings, air, pg, ptex, mac, mLight, LU, macSites, mBub, mRings, HU, hero, heroFlash, mKey};
  }, [gl, scene, assets]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const shot = panel ? 'S' : TL.shotAt(t);
  const c = panel ? TL.splitCam(t, panel) : TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.005; cam.far = 200;
  cam.position.set(...c.pos); cam.lookAt(...c.look);
  if (debugCam) { cam.position.set(debugCam[0], debugCam[1], debugCam[2]); cam.lookAt(debugCam[3], debugCam[4], debugCam[5]); }
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const macro = shot === 'X';
  gl.toneMappingExposure = macro ? 1.0 : 0.52;
  scene.fog = macro ? W.fog : null;

  // ---------- the kettle's state
  const h = TL.heatAt(t, panel), L = TL.loudAt(t, panel);
  W.WU.uTint.value = TL.tint(h) * 0.9; W.WU.uTime.value = t; W.WU.uRoll.value = TL.roll(h) * (1 - 0.7 * TL.afterClick(t, panel)); W.WU.uLayer.value = 1;
  const on = TL.switchOn(t, panel);
  W.sw.visible = on; (W.swGlow.material as THREE.SpriteMaterial).opacity = on ? 0.9 : 0; W.plateGlow.intensity = on ? 0.12 : 0.03;
  // steam from the lid
  const pl = TL.plume(t, panel) * (panel === 'R' ? 1 - 0.3 * TL.afterClick(t, panel) : 1);
  W.steam.forEach((p, i) => {
    const a = (t * 0.32 + p.ph) % 1;
    const spout = i % 2 === 0; // from the spout (left) and the lid vent
    p.s.position.set((spout ? -0.1 - a * 0.05 : 0) + p.dx * 0.02 + Math.sin(a * 5 + i) * 0.015 * a, (spout ? 0.205 : 0.25) + a * 0.2, p.dz * 0.02);
    p.s.scale.setScalar(0.03 + a * 0.12); (p.s.material as THREE.SpriteMaterial).opacity = pl * 0.85 * Math.sin(Math.PI * a);
  });
  // real-scale bubbles: rise slowed a little so they read; the collapse height follows the heat
  const tmp = new THREE.Object3D(); const cq = cam.quaternion;
  {
    const bubs: Bub[] = [], rs: Ring[] = [];
    const rate = (te: number) => 0.25 + 0.75 * TL.loudAt(te, panel) * (1 - 0.6 * TL.afterClick(te, panel));
    simBubbles(t, {sites: W.realSites, rise: 0.09, grow: 0.25, die: TL.dieHeight(h), surface: TL.WATER.y1 - TL.PLATE_Y, collapse: 0.05, rate, dieVar: 0.8}, bubs, rs, 0.35);
    const n = Math.min(bubs.length, 500);
    for (let i = 0; i < n; i++) { const b = bubs[i]; tmp.position.set(b.x, TL.PLATE_Y + b.y, b.z); tmp.quaternion.identity(); tmp.scale.setScalar(Math.max(b.r, 1e-5)); tmp.updateMatrix(); W.bub.setMatrixAt(i, tmp.matrix); W.bub.setColorAt(i, new THREE.Color(1, 1, 1)); }
    W.bub.count = n; W.bub.instanceMatrix.needsUpdate = true; if (W.bub.instanceColor) W.bub.instanceColor.needsUpdate = true;
    const nr = Math.min(rs.length, 160);
    const kq = W.kettle.quaternion.clone().invert().multiply(cq);
    for (let i = 0; i < nr; i++) { const r = rs[i]; const u = r.age / 0.35; tmp.position.set(r.x, TL.PLATE_Y + r.y, r.z); tmp.quaternion.copy(kq); tmp.scale.setScalar(0.004 + 0.02 * u); tmp.updateMatrix();
      W.rings.setMatrixAt(i, tmp.matrix); W.rings.setColorAt(i, new THREE.Color((1 - u) * (r.pop ? 0.2 : 0.35), r.pop ? 1 : 0, r.pop ? 0 : 1)); }
    W.rings.count = nr; W.rings.instanceMatrix.needsUpdate = true; if (W.rings.instanceColor) W.rings.instanceColor.needsUpdate = true;
  }
  // sound rings in the air: one every 1/NA s, their brightness from the loudness when they left
  {
    const NA = 7, per = 0.32;
    for (let i = 0; i < NA; i++) {
      const k = Math.floor(t / per) - i; const te = k * per; const age = t - te; const u = age / (NA * per);
      const l = TL.loudAt(Math.max(0, te), panel);
      tmp.position.set(0, 0.11, 0); tmp.quaternion.copy(cq); tmp.scale.setScalar(0.24 + 0.55 * u); tmp.updateMatrix();
      W.air.setMatrixAt(i, tmp.matrix); W.air.setColorAt(i, new THREE.Color(Math.pow(l, 2.2) * 0.13 * (1 - u) * (macro ? 0 : 1), 1, 0));
    }
    W.air.instanceMatrix.needsUpdate = true; if (W.air.instanceColor) W.air.instanceColor.needsUpdate = true;
  }
  // the phone (in the split it stands in front of each kettle so each half holds both)
  if (panel) { W.phone.position.set(TL.KET.x - 0.07, TL.COUNTER_Y, TL.KET.z + 0.2); W.phone.rotation.y = 0.05; }
  else { W.phone.position.set(TL.PHONE.x, TL.COUNTER_Y, TL.PHONE.z); W.phone.rotation.y = TL.PHONE.yaw; }
  drawPhone(W.pg, t, panel); W.ptex.needsUpdate = true;

  // ---------- macro
  W.mac.visible = macro;
  if (macro) {
    W.LU.uTime.value = t;
    const bubs: Bub[] = [], rs: Ring[] = [];
    simBubbles(t, {sites: W.macSites, rise: 0.22, grow: 0.7, die: 0.1, surface: 99, collapse: 0.22, rate: (te) => TL.swarm(te), dieVar: 0.8}, bubs, rs, 0.6);
    const n = Math.min(bubs.length, 600);
    for (let i = 0; i < n; i++) { const b = bubs[i]; tmp.position.set(b.x, b.y, b.z); tmp.quaternion.identity(); tmp.scale.setScalar(Math.max(b.r, 1e-5)); tmp.updateMatrix(); W.mBub.setMatrixAt(i, tmp.matrix); W.mBub.setColorAt(i, new THREE.Color(1, 1, 1)); }
    W.mBub.count = n; W.mBub.instanceMatrix.needsUpdate = true; if (W.mBub.instanceColor) W.mBub.instanceColor.needsUpdate = true;
    const hr = TL.heroRing(t);
    const all = hr >= 0 && hr < 0.9 ? [...rs, {x: 0, y: TL.heroY(t), z: 0.3, age: hr * 0.6, pop: false}] : rs;
    const nr = Math.min(all.length, 300);
    for (let i = 0; i < nr; i++) { const r = all[i]; const big = i === all.length - 1 && all !== rs; const u = r.age / 0.6;
      tmp.position.set(r.x, r.y, r.z); tmp.quaternion.copy(cq); tmp.scale.setScalar((big ? 0.05 + 0.9 * u : 0.03 + 0.16 * u)); tmp.updateMatrix();
      W.mRings.setMatrixAt(i, tmp.matrix); W.mRings.setColorAt(i, new THREE.Color((1 - u) * (big ? 1.3 : 0.7 + 0.5 * TL.ramp(t, TL.B.all - 0.6, TL.B.all + 0.2)), 0, 1)); }
    W.mRings.count = nr; W.mRings.instanceMatrix.needsUpdate = true; if (W.mRings.instanceColor) W.mRings.instanceColor.needsUpdate = true;
    // the hero
    const r = TL.heroR(t);
    tmp.position.set(0, TL.heroY(t), 0.3); tmp.quaternion.identity(); tmp.scale.setScalar(Math.max(r, 1e-5)); tmp.updateMatrix(); W.hero.setMatrixAt(0, tmp.matrix); W.hero.instanceMatrix.needsUpdate = true;
    W.hero.visible = r > 0.002;
    W.HU.uCrumple.value = TL.heroCrumple(t); W.HU.uTime.value = t;
    const fl = hr >= 0 ? Math.exp(-hr * 9) : 0;
    W.heroFlash.position.set(0, TL.heroY(t), 0.32); W.heroFlash.scale.setScalar(0.5 * fl + 0.01); (W.heroFlash.material as THREE.SpriteMaterial).opacity = fl;
  }
  return null;
};
