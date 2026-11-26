// Three worlds in one three.js scene, switched on the hard cuts (timeline.ts CUT_*):
//  SPACE   the photographic Earth (globe kit) lit by a far Sun along -x, an air shell drawn ~4x thicker than real
//          (blue where the Sun is high, orange along the terminator), stars, and rays of sunlight as photons.
//  MACRO   inside the air: 900 drifting N2/O2 molecules (dumbbells) and a braid of photons that ricochet off them,
//          with Rayleigh odds (blue ~5.9x red per molecule).
//  GROUND  three's Preetham sky (realism kit makeSky) over dark hills: midday blue streaks from every direction,
//          then sunset with red/orange streaks straight from the low Sun.
// Photons: every photon is a pure function of time (spawn time, path, where it scatters), so any frame renders alone.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {random} from 'remotion';
import {makeSky, sunDirection} from './kit/realism/sky.ts';
import {Earth, Stars, type EarthTex} from './kit/globe';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
const PCOL = TL.COLS.map((c) => col(c));
const MAXP = 16000;

// ---------- glowing points (additive), with log-depth chunks so they sort against the planet
const pointsMaterial = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  uniforms: {uPx: {value: 1000}},
  vertexShader: `attribute vec4 pc; attribute float ps; uniform float uPx; varying vec4 vC;
    #include <common>
    #include <logdepthbuf_pars_vertex>
    void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
      gl_PointSize = clamp(ps * uPx / -mv.z, 0.0, 90.0); vC = pc; if (ps <= 0.0) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      #include <logdepthbuf_vertex>
    }`,
  fragmentShader: `varying vec4 vC;
    #include <common>
    #include <logdepthbuf_pars_fragment>
    void main(){
      #include <logdepthbuf_fragment>
      float r = length(gl_PointCoord - 0.5) * 2.0; if (r > 1.0) discard;
      float core = exp(-r * r * 14.0), halo = exp(-r * r * 3.5) * 0.35;
      gl_FragColor = vec4(vC.rgb * (core * 1.6 + halo) * vC.a + vec3(1.0) * core * core * 0.5 * vC.a, 1.0); }`,
});
type Pts = {obj: THREE.Points; pos: Float32Array; pc: Float32Array; ps: Float32Array; n: number};
const makePoints = (): Pts => {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(MAXP * 3), pc = new Float32Array(MAXP * 4), ps = new Float32Array(MAXP);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('pc', new THREE.BufferAttribute(pc, 4)); g.setAttribute('ps', new THREE.BufferAttribute(ps, 1));
  const obj = new THREE.Points(g, pointsMaterial()); obj.frustumCulled = false; obj.renderOrder = 5;
  return {obj, pos, pc, ps, n: 0};
};
const put = (P: Pts, x: number, y: number, z: number, c: THREE.Color, a: number, size: number) => {
  if (P.n >= MAXP || a <= 0.003) return; const i = P.n++;
  P.pos[i * 3] = x; P.pos[i * 3 + 1] = y; P.pos[i * 3 + 2] = z;
  P.pc[i * 4] = c.r; P.pc[i * 4 + 1] = c.g; P.pc[i * 4 + 2] = c.b; P.pc[i * 4 + 3] = a; P.ps[i] = size;
};
const flush = (P: Pts) => {
  P.ps.fill(0, P.n); const g = P.obj.geometry;
  (['position', 'pc', 'ps'] as const).forEach((k) => { g.getAttribute(k).needsUpdate = true; });
};
const rdir = (seed: string) => { // seeded uniform direction
  const u = random(seed + 'u') * 2 - 1, a = random(seed + 'a') * Math.PI * 2, s = Math.sqrt(1 - u * u);
  return new THREE.Vector3(s * Math.cos(a), u, s * Math.sin(a));
};

// ---------- rays through the air shell: photons that may scatter inside it (free path ~ 1/(L0 * REL[k]))
type Ray = {t0: number; o: THREE.Vector3; d: THREE.Vector3; k: number; sEnd: number; sScat: number; sd: THREE.Vector3; seed: number};
const sphereHit = (o: THREE.Vector3, d: THREE.Vector3, R: number): [number, number] | null => {
  const b = o.dot(d), c = o.lengthSq() - R * R, h = b * b - c; if (h < 0) return null; const q = Math.sqrt(h); return [-b - q, -b + q];
};
const makeRays = (key: string, t0: number, t1: number, rate: number, L0: number, src: (i: number) => {o: THREE.Vector3; d: THREE.Vector3; sEnd?: number}, only?: number[]) => {
  const out: Ray[] = []; const n = Math.floor((t1 - t0) * rate);
  for (let i = 0; i < n; i++) {
    const k = only ? only[i % only.length] : i % 4; const {o, d, sEnd: se} = src(i);
    const ground = sphereHit(o, d, 1), air = sphereHit(o, d, TL.AIR_TOP);
    const sEnd = se ?? (ground && ground[0] > 0 ? ground[0] : 1e9);
    let sScat = 1e9;
    if (air && air[1] > 0) {
      const sIn = Math.max(air[0], 0), sOut = Math.min(air[1], sEnd);
      const free = -Math.log(1 - random(`${key}f${i}`) * 0.9999) / (L0 * TL.REL[k]);
      if (sIn + free < sOut) sScat = sIn + free;
    }
    out.push({t0: t0 + i / rate + random(`${key}j${i}`) * 0.6 / rate, o, d, k, sEnd, sScat, sd: rdir(`${key}d${i}`), seed: i});
  }
  return out;
};
const E1 = new THREE.Vector3(), E2 = new THREE.Vector3(), V = new THREE.Vector3();
const drawRays = (P: Pts, rays: Ray[], t: number, o: {speed: number; scatSpeed: number; size: number; braid: number; life: number; split?: (s: number) => number; blueBoost?: number; tail?: number}) => {
  for (const r of rays) {
    const s = (t - r.t0) * o.speed; if (s < 0) continue;
    const stop = Math.min(r.sScat, r.sEnd), c = PCOL[r.k];
    if (s < stop) {
      // braid: four strands twisted round the ray, fanned apart by colour where split() > 0
      E1.set(0, 1, 0).cross(r.d); if (E1.lengthSq() < 1e-4) E1.set(0, 0, 1); E1.normalize(); E2.copy(r.d).cross(E1).normalize();
      const ph = r.k * Math.PI / 2 + s * 9, fan = o.split ? o.split(s) : 0;
      V.copy(r.o).addScaledVector(r.d, s).addScaledVector(E1, Math.cos(ph) * o.braid).addScaledVector(E2, Math.sin(ph) * o.braid + (r.k - 1.5) * fan);
      put(P, V.x, V.y, V.z, c, 1, o.size);
      for (let j = 1; j <= (o.tail ?? 0); j++) { const b = s - j * o.size * 0.6; if (b < 0) break; V.addScaledVector(r.d, -o.size * 0.6); put(P, V.x, V.y, V.z, c, 0.55 * (1 - j / ((o.tail ?? 0) + 1)), o.size * 0.8); }
    } else if (r.sScat < r.sEnd) {
      const ts = r.sScat / o.speed, age = t - r.t0 - ts; if (age > o.life) continue;
      V.copy(r.o).addScaledVector(r.d, r.sScat).addScaledVector(r.sd, age * o.scatSpeed);
      const a = Math.min(1, age * 12) * (1 - age / o.life), boost = r.k === 3 ? (o.blueBoost ?? 1.25) : 0.9;
      put(P, V.x, V.y, V.z, c, a, o.size * boost);
      if (age < 0.18) { V.copy(r.o).addScaledVector(r.d, r.sScat); put(P, V.x, V.y, V.z, c, (1 - age / 0.18) * 0.8, o.size * 3); } // the hit
    }
  }
};

// ---------- the air shell seen from space: blue where the Sun is high, orange along the terminator
const airShell = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide, toneMapped: false,
  uniforms: {uSun: {value: new THREE.Vector3(...TL.SUN_DIR)}, uO: {value: 1}, uTop: {value: TL.AIR_TOP}},
  vertexShader: `varying vec3 vW;
    #include <common>
    #include <logdepthbuf_pars_vertex>
    void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w;
      #include <logdepthbuf_vertex>
    }`,
  fragmentShader: `uniform vec3 uSun; uniform float uO; uniform float uTop; varying vec3 vW;
    #include <common>
    #include <logdepthbuf_pars_fragment>
    void main(){
      #include <logdepthbuf_fragment>
      vec3 ro = cameraPosition, rd = normalize(vW - cameraPosition); vec3 near = ro - rd * dot(ro, rd);
      if (length(near) < 1.0 && dot(-ro, rd) > 0.0) discard; float h = max(length(near) - 1.0, 0.0); vec3 p = normalize(near); float mu = dot(p, uSun);
      float dens = exp(-h / 0.018) * smoothstep(uTop - 1.0, (uTop - 1.0) * 0.6, h);
      vec3 blue = vec3(0.25, 0.55, 1.0) * smoothstep(-0.05, 0.35, mu);
      vec3 dusk = vec3(1.0, 0.42, 0.12) * exp(-mu * mu / 0.012) * 1.3;
      gl_FragColor = vec4((blue * 0.95 + dusk) * dens * uO, 1.0); }`,
});

// ---------- macro: molecules
const N_MOL = 900, PATH_N = 22;
type Mol = {p: THREE.Vector3; ax: THREE.Vector3; w: number; ph: number};
const molecules = (): Mol[] => {
  const out: Mol[] = [];
  for (let i = 0; i < PATH_N; i++) out.push({p: new THREE.Vector3(-8 + i * 0.85 + random(`px${i}`) * 0.3, (random(`py${i}`) - 0.5) * 0.06, (random(`pz${i}`) - 0.5) * 0.06), ax: rdir(`pa${i}`), w: 0.6 + random(`pw${i}`), ph: random(`pp${i}`) * 6});
  for (let i = 0; out.length < N_MOL; i++) {
    const p = new THREE.Vector3((random(`mx${i}`) - 0.5) * 30, (random(`my${i}`) - 0.5) * 16, -12 + random(`mz${i}`) * 15);
    if (Math.abs(p.y) < 0.5 && Math.abs(p.z) < 0.5) continue;
    out.push({p, ax: rdir(`ma${i}`), w: 0.4 + random(`mw${i}`), ph: random(`mp${i}`) * 6});
  }
  return out;
};
const dumbbell = () => {
  const a = new THREE.SphereGeometry(0.11, 18, 12), b = a.clone();
  a.translate(0.085, 0, 0); b.translate(-0.085, 0, 0);
  return mergeGeometries([a, b]);
};
// macro photons: a braid along +x; each may ricochet off one of the molecules on its path (odds ~ REL[k])
const MAC_V = 3.4, MAC_X0 = -11, QB = 0.16;
type MP = {t0: number; k: number; j: number; ts: number; sd: THREE.Vector3};
const macroPhotons = (mols: Mol[]): MP[] => {
  const out: MP[] = []; const t0 = TL.CUT_MACRO - 3.5, t1 = TL.CUT_SKY, rate = 600;
  for (let i = 0; i < (t1 - t0) * rate; i++) {
    // thin slab of air: the share of each colour scattered is exactly QB * REL[k] (stratified, not sampled, so the
    // on-screen tally equals the odds: blue/red = (700/470)^4 = 4.9); the molecule it hits is random along the path
    const k = i % 4, n = Math.floor(i / 4), q = QB * TL.REL[k];
    const j = Math.floor((n + 1) * q) > Math.floor(n * q) ? Math.floor(random(`s${i}`) * PATH_N) : -1;
    const st = t0 + i / rate;
    out.push({t0: st, k, j, ts: j < 0 ? 1e9 : st + (mols[j].p.x - MAC_X0) / MAC_V, sd: rdir(`sd${i}`)});
  }
  return out;
};
let MACRO: {mols: Mol[]; mp: MP[]} | null = null;
const macroData = () => { if (!MACRO) { const mols = molecules(); MACRO = {mols, mp: macroPhotons(mols)}; } return MACRO; };
export const macroCount = (t: number, from: number) => tally(macroData().mp, t, from);
const tally = (mp: MP[], t: number, from: number) => {
  let b = 0, r = 0; for (const p of mp) if (p.ts >= from && p.ts <= t) { if (p.k === 3) b++; else if (p.k === 0) r++; }
  return {b, r};
};

export const Scene: React.FC<{t: number; earth: EarthTex}> = ({t, earth}) => {
  const {gl, camera, scene, size} = useThree();
  const shot = TL.shotAt(t);

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    // space
    const space = new THREE.Group(); scene.add(space);
    const air = new THREE.Mesh(new THREE.SphereGeometry(TL.AIR_TOP, 128, 96), airShell()); air.renderOrder = 3; space.add(air);
    const gt = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.15, 'rgba(255,250,235,0.7)'); gr.addColorStop(0.45, 'rgba(255,230,190,0.12)'); gr.addColorStop(1, 'rgba(255,220,180,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; })();
    const sun = new THREE.Sprite(new THREE.SpriteMaterial({map: gt, color: col('#FFF6E8'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false}));
    sun.position.set(...TL.SUN_DIR).multiplyScalar(60); sun.scale.setScalar(9); space.add(sun);
    // observer dots for the sunset pass
    const noonDot = new THREE.Sprite(new THREE.SpriteMaterial({map: gt, color: col('#FFFFFF'), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, toneMapped: false}));
    noonDot.position.set(...TL.NOON_P).multiplyScalar(1.003); space.add(noonDot);
    const duskDot = new THREE.Sprite(noonDot.material.clone()); duskDot.material.color = col(TL.ORANGE); duskDot.position.set(...TL.DUSK_P).multiplyScalar(1.003); space.add(duskDot);

    // macro
    const macro = new THREE.Group(); scene.add(macro);
    const {mols, mp} = macroData();
    const molMesh = new THREE.InstancedMesh(dumbbell(), new THREE.MeshStandardMaterial({color: col('#C9D6EE'), roughness: 0.32, metalness: 0.05, emissive: col('#0B1630')}), N_MOL);
    molMesh.frustumCulled = false; macro.add(molMesh);
    const key = new THREE.DirectionalLight(col('#FFF3E2'), 2.4); key.position.set(-6, 5, 6); macro.add(key);
    macro.add(new THREE.HemisphereLight(col('#6F9BFF'), col('#101830'), 1.1));
    const rim = new THREE.DirectionalLight(col('#6FA8FF'), 1.4); rim.position.set(5, -2, -6); macro.add(rim);

    // ground
    const ground = new THREE.Group(); scene.add(ground);
    const skyMid = makeSky({elevation: TL.SKY_SUN.elevation, azimuth: TL.SKY_SUN.azimuth, turbidity: 1.6, rayleigh: 2.6, mie: 0.003, mieG: 0.8});
    const skyDusk = makeSky({elevation: TL.DUSK_SUN.elevation, azimuth: TL.DUSK_SUN.azimuth, turbidity: 3.5, rayleigh: 2.2, mie: 0.006, mieG: 0.86});
    ground.add(skyMid, skyDusk);
    const hills = (() => { // a ring of low hills, 300-900 m away, as a dark silhouette
      const segs = 720, g = new THREE.BufferGeometry(), pos: number[] = [], idx: number[] = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2, r = 600;
        const h = 18 + 22 * Math.sin(a * 3 + 1) * 0.5 + 14 * Math.sin(a * 7 + 2) * 0.5 + 6 * Math.sin(a * 23) + 3 * Math.sin(a * 61 + 1);
        pos.push(Math.sin(a) * r, -30, -Math.cos(a) * r, Math.sin(a) * r, h, -Math.cos(a) * r);
        if (i < segs) { const b = i * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
      }
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
      return new THREE.Mesh(g, new THREE.MeshBasicMaterial({color: col('#0E1A14'), side: THREE.DoubleSide, fog: false}));
    })();
    ground.add(hills);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(700, 48), new THREE.MeshBasicMaterial({color: col('#0B140F')})); floor.rotation.x = -Math.PI / 2; ground.add(floor);

    const P = makePoints(); scene.add(P.obj);

    // rays
    const S = new THREE.Vector3(...TL.SUN_DIR).negate(); // direction the light travels (+x)
    const hookRays = makeRays('h', -6, TL.CUT_MACRO, 260, 3.2, () => ({o: new THREE.Vector3(-2.2, TL.HOOK_Y, TL.HOOK_Z), d: S.clone()}));
    const noonRays = makeRays('n', TL.CUT_SUNSET - 4, TL.CUT_DUSK, 150, 7, () => ({o: new THREE.Vector3(-3.2, 0, 0), d: S.clone()}));
    const duskRays = makeRays('k', TL.CUT_SUNSET - 4, TL.CUT_DUSK, 150, 7, () => ({o: new THREE.Vector3(-3.2, 1.004, 0), d: S.clone(), sEnd: 3.2}));
    const endRays = makeRays('e', TL.CUT_END - 4, TL.DUR_S, 700, 7, (i) => {
      const a = random(`ea${i}`) * Math.PI * 2, r = Math.sqrt(random(`er${i}`)) * 1.06;
      return {o: new THREE.Vector3(-3, Math.cos(a) * r, Math.sin(a) * r), d: S.clone()};
    });
    // ground streaks: blue from all over the sky (midday), red/orange straight from the low Sun (dusk)
    type Streak = {dir: THREE.Vector3; t0: number; k: number; off: THREE.Vector3};
    const skyStreaks: Streak[] = Array.from({length: 520}, (_, i) => {
      const el = 6 + Math.pow(random(`se${i}`), 0.8) * 80, az = random(`sa${i}`) * 360;
      return {dir: sunDirection(el, az), t0: TL.CUT_SKY - 3 + random(`st${i}`) * 3 + (i % 5) * 0.6, k: random(`sk${i}`) < 0.86 ? 3 : 2, off: rdir(`so${i}`).multiplyScalar(2.5)};
    });
    const duskStreaks: Streak[] = Array.from({length: 360}, (_, i) => {
      const sd = sunDirection(TL.DUSK_SUN.elevation, TL.DUSK_SUN.azimuth);
      return {dir: sd.clone().add(rdir(`dd${i}`).multiplyScalar(0.012)).normalize(), t0: TL.CUT_DUSK - 3 + random(`dt${i}`) * 3 + (i % 6) * 0.5, k: random(`dk${i}`) < 0.55 ? 0 : 1, off: (() => { const v = rdir(`do${i}`); v.y = Math.abs(v.y) * 0.6; return v.multiplyScalar(3.5); })()};
    });
    const duskSide: Streak[] = Array.from({length: 90}, (_, i) => ({dir: rdir(`ds${i}`), t0: TL.CUT_DUSK - 2 + (i / 90) * 5, k: 3, off: new THREE.Vector3((random(`dx${i}`) - 0.5) * 160, 3 + random(`dy${i}`) * 25, -120 - random(`dz${i}`) * 300)}));
    return {space, air, sun, noonDot, duskDot, macro, mols, molMesh, mp, ground, skyMid, skyDusk, P, hookRays, noonRays, duskRays, endRays, skyStreaks, duskStreaks, duskSide};
  }, [gl, scene]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const P = W.P; P.n = 0;
  (P.obj.material as THREE.ShaderMaterial).uniforms.uPx.value = size.height * gl.getPixelRatio() / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2));
  W.space.visible = TL.isSpace(shot); W.macro.visible = shot === 'macro'; W.ground.visible = shot === 'sky' || shot === 'dusk';
  W.skyMid.visible = shot === 'sky'; W.skyDusk.visible = shot === 'dusk';
  if (TL.isSpace(shot)) {
    scene.background = col('#000000'); gl.toneMappingExposure = 1;
    const c = TL.camAt(t); cam.fov = c.fov; cam.near = 0.002; cam.far = 400; cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look);
    W.noonDot.visible = W.duskDot.visible = shot === 'sunset';
    if (shot === 'hook') {
      const blue = TL.ramp(t, TL.BEATS.choose - 0.1, TL.BEATS.choose + 0.4);
      drawRays(P, W.hookRays, t, {speed: 0.55, scatSpeed: 0.12, size: 0.0065, braid: 0.0022, life: 2.6, blueBoost: 1.3 + 1.4 * blue, tail: 2,
        split: (s) => 0.0032 * THREE.MathUtils.smoothstep(s, 1.9, 2.3)});
    } else if (shot === 'sunset') {
      const o = {speed: 0.7, scatSpeed: 0.12, size: 0.026, braid: 0.007, life: 3, tail: 2, blueBoost: 1.9};
      drawRays(P, W.noonRays, t, o); drawRays(P, W.duskRays, t, o);
      const glow = 0.6 + 0.25 * Math.sin(t * 5);
      W.noonDot.scale.setScalar(0.09 * glow); W.duskDot.scale.setScalar(0.09 * glow * TL.ramp(t, TL.CUT_SUNSET, TL.CUT_SUNSET + 0.4));
    } else {
      const d = Math.hypot(...c.pos);
      drawRays(P, W.endRays, t, {speed: 0.9, scatSpeed: 0.08, size: 0.004 * d, braid: 0, life: 1.8, tail: 0});
    }
  } else if (shot === 'macro') {
    const glowBlue = TL.ramp(t, TL.BEATS.blue - 0.2, TL.CUT_SKY);
    scene.background = col('#050A18').lerp(col('#1A3F86'), glowBlue * 0.75); gl.toneMappingExposure = 1;
    const c = TL.camAt(t); cam.fov = c.fov; cam.near = 0.05; cam.far = 200; cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Sc = new THREE.Vector3(1, 1, 1), Pp = new THREE.Vector3();
    W.mols.forEach((m, i) => {
      Q.setFromAxisAngle(m.ax, m.ph + t * m.w);
      Pp.copy(m.p); if (i >= PATH_N) Pp.add(V.set(Math.sin(t * 0.3 * m.w + m.ph), Math.cos(t * 0.25 * m.w + m.ph * 2), Math.sin(t * 0.2 + m.ph * 3)).multiplyScalar(0.25));
      W.molMesh.setMatrixAt(i, M.compose(Pp, Q, Sc));
    });
    W.molMesh.instanceMatrix.needsUpdate = true;
    for (const p of W.mp) {
      const age = t - p.t0; if (age < 0) continue; const x = MAC_X0 + age * MAC_V, c2 = PCOL[p.k];
      if (t < p.ts) {
        if (x > 16) continue; const ph = p.k * Math.PI / 2 + x * 1.6;
        put(P, x, Math.cos(ph) * 0.07, Math.sin(ph) * 0.07, c2, 1, 0.09);
        put(P, x - 0.05, Math.cos(ph - 0.08) * 0.07, Math.sin(ph - 0.08) * 0.07, c2, 0.5, 0.055);
      } else {
        const a2 = t - p.ts; if (a2 > 3.2) continue; const m = W.mols[p.j].p;
        const k = Math.min(1, a2 * 10) * (1 - a2 / 3.2) * (p.k === 3 ? 1.3 : 1);
        put(P, m.x + p.sd.x * a2 * MAC_V * 0.8, m.y + p.sd.y * a2 * MAC_V * 0.8, m.z + p.sd.z * a2 * MAC_V * 0.8, c2, k, p.k === 3 ? 0.13 : 0.08);
        if (a2 < 0.35) put(P, m.x, m.y, m.z, c2, (1 - a2 / 0.35) * 1.0, 0.8);
      }
    }
  } else {
    const g = TL.groundCam(t); gl.toneMappingExposure = shot === 'sky' ? 0.085 : 0.5; scene.background = null;
    cam.fov = g.fov; cam.near = 0.1; cam.far = 2000; cam.position.set(0, 1.7, 0); cam.up.set(0, 1, 0);
    const yaw = THREE.MathUtils.degToRad(g.yaw), pit = THREE.MathUtils.degToRad(g.pitch);
    cam.lookAt(Math.sin(yaw) * Math.cos(pit) * 10, 1.7 + Math.sin(pit) * 10, -Math.cos(yaw) * Math.cos(pit) * 10);
    const eye = new THREE.Vector3(0, 1.7, 0), Pp = new THREE.Vector3();
    const streak = (s: {dir: THREE.Vector3; t0: number; k: number; off: THREE.Vector3}, period: number, dist: number, sz: number, a: number) => {
      let age = (t - s.t0) % period; if (t < s.t0) return; if (age < 0) age += period;
      const k = age / period, r = dist * (1 - k) + 1.2;
      const fadeIn = Math.min(1, k * 6), fadeOut = 1 - THREE.MathUtils.smoothstep(k, 0.85, 1);
      for (let j = 0; j < 5; j++) { const rr = r + j * dist * 0.025; Pp.copy(eye).addScaledVector(s.dir, rr).addScaledVector(s.off, 0.08 * rr * Math.pow(1 - rr / dist, 1.5) * 6); put(P, Pp.x, Pp.y, Pp.z, PCOL[s.k], a * fadeIn * fadeOut * (1 - j / 5), sz * (1 - j * 0.12)); }
    };
    if (shot === 'sky') W.skyStreaks.forEach((s) => streak(s, 3.0, 90, 1.1, 1));
    else {
      W.duskStreaks.forEach((s) => streak(s, 2.6, 160, 1.8, 1));
      // blue knocked aside on the way: drifting sideways far off, never toward the eye
      W.duskSide.forEach((s) => { const age = t - s.t0; if (age < 0 || age > 2.5) return; Pp.copy(s.off).addScaledVector(s.dir, age * 18); put(P, Pp.x, Pp.y, Pp.z, PCOL[3], Math.min(1, age * 5) * (1 - age / 2.5) * 0.8, 2.2); });
    }
  }
  cam.updateProjectionMatrix();
  flush(P);

  const shotSun = new THREE.Vector3(...TL.SUN_DIR);
  return TL.isSpace(shot) ? (
    <>
      <Stars fr={Math.round(t * 30)} count={5000} opacity={0.8} />
      <Earth tex={earth} day={1.6} night={0.9} sunVec={shotSun} air={0.35} />
    </>
  ) : null;
};
