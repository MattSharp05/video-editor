// One world for the whole film (timeline.ts): a night city (1 unit = 10 m) under a storm cloud base at 1.1 km, a generic
// Art Deco tower (setbacks, mooring mast, antenna to 443 m) standing in for the Empire State Building, rain, and bolts.
// Everything is a pure function of time t, so any frame renders alone.
//  - Buildings: one instanced box mesh with a shader that draws lit windows from world position, lights the faces
//    with the current flash (from where the bolt is), and fogs them.
//  - Bolts, streamers, rulers, rain: one instanced quad mesh of screen-space glowing segments (additive), refilled
//    every frame.
//  - Cloud: four noise layers at the base, lit from inside by the flash.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {random} from 'remotion';
import * as TL from './timeline';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const col = (h: string) => new THREE.Color(h);

// ---------------------------------------------------------------- buildings
type Box = {x: number; z: number; w: number; d: number; h: number; y0: number; seed: number; flood: number};
const segDist = (x: number, z: number, a: number[], b: number[]) => {
  const ax = a[0], az = a[2], bx = b[0] - ax, bz = b[2] - az; const L = bx * bx + bz * bz;
  const k = L ? Math.max(0, Math.min(1, ((x - ax) * bx + (z - az) * bz) / L)) : 0;
  return Math.hypot(x - ax - k * bx, z - az - k * bz);
};
const buildCity = (): Box[] => {
  const out: Box[] = [];
  const B = 9; // block pitch 90 m, streets ~15 m
  for (let gx = -16; gx <= 16; gx++) for (let gz = -22; gz <= 26; gz++) {
    const cx = gx * B, cz = gz * B;
    const r = Math.hypot(cx, cz);
    if (r < 9) continue; // the tower's block
    const k = `b${gx}_${gz}`;
    if (random(k + 'skip') < 0.08) continue;
    const n = 1 + Math.floor(random(k + 'n') * 3);
    for (let i = 0; i < n; i++) {
      const w = Math.min(7.0 / n, 2.2 + random(k + i + 'w') * (7.4 / n)), d = 2.5 + random(k + i + 'd') * 4.5;
      const x = cx - 3.6 + (i + 0.5) * (7.2 / n), z = cz + (random(k + i + 'z') - 0.5) * (7.5 - d);
      // Midtown: taller near the tower, a few skyscrapers (150-260 m) as neighbours
      const near = Math.exp(-r / 70);
      let h = 2 + Math.pow(random(k + i + 'h'), 2.2) * (6 + 16 * near);
      if (random(k + i + 'sky') < 0.05 + 0.12 * near) h = 15 + random(k + i + 'sk2') * 11;
      if (TL.CAM_PATHS.some(([a, b]) => segDist(x, z, a, b) < 7 + Math.max(w, d) / 2)) continue; // keep camera paths clear
      out.push({x, z, w, d, h, y0: 0, seed: random(k + i + 's') * 100, flood: 0});
    }
  }
  return out;
};
// the tower: footprints and heights (units of 10 m) roughly after the real building's setbacks
const TOWER: Box[] = [
  {x: 0, z: 0, w: 13, d: 6, h: 2.4, y0: 0, seed: 7, flood: 0},
  {x: 0, z: 0, w: 8.6, d: 5.4, h: 26, y0: 0, seed: 8, flood: 0.1},
  {x: 0, z: 0, w: 7.2, d: 4.6, h: 30.5, y0: 0, seed: 9, flood: 0.35},
  {x: 0, z: 0, w: 5.2, d: 3.8, h: 32.6, y0: 0, seed: 10, flood: 0.7},
  {x: 0, z: 0, w: 3.4, d: 3.4, h: 35.6, y0: 0, seed: 11, flood: 1},
];

const bMat = () => new THREE.ShaderMaterial({
  uniforms: {uFlashP: {value: V(0, 80, 0)}, uFlash: {value: 0}, uFog: {value: col('#0b1220')}, uCity: {value: 1}},
  vertexShader: `attribute vec3 aInfo; varying vec3 vW; varying vec3 vN; varying vec3 vInfo; varying float vY;
    void main(){ mat4 m = modelMatrix;
      #ifdef USE_INSTANCING
      m = m * instanceMatrix;
      #endif
      vec4 w = m * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(m) * normal); vInfo = aInfo;
      vY = clamp(position.y + 0.5, 0.0, 1.0); gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `uniform vec3 uFlashP; uniform float uFlash; uniform vec3 uFog; uniform float uCity;
    varying vec3 vW; varying vec3 vN; varying vec3 vInfo; varying float vY;
    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main(){
      vec3 n = normalize(vN); float seed = vInfo.x, flood = vInfo.y, top = vInfo.z;
      vec3 base = vec3(0.045, 0.05, 0.062) * (0.8 + 0.4 * h21(vec2(seed, 1.0)));
      vec3 c = base * 0.35;
      // windows on vertical faces
      if (abs(n.y) < 0.5 && seed >= 0.0) {
        float u = abs(n.x) > 0.5 ? vW.z : vW.x;
        vec2 g = vec2(u / 0.32, vW.y / 0.38); vec2 cell = floor(g), fr = fract(g);
        float win = step(0.18, fr.x) * step(fr.x, 0.82) * step(0.28, fr.y) * step(fr.y, 0.82);
        float lit = step(0.6, h21(cell + seed)) ;
        vec3 wc = mix(vec3(1.0, 0.72, 0.42), vec3(0.75, 0.85, 1.0), step(0.8, h21(cell * 1.7 + seed)));
        float fw = fwidth(g.x) + fwidth(g.y);
        float pat = mix(win * lit, 0.2, smoothstep(0.35, 0.9, fw));
        c += wc * pat * 0.55 * uCity * (0.6 + 0.8 * h21(cell + seed * 3.1));
        c += vec3(0.02, 0.025, 0.035) * win;
      }
      // floodlit crown (warm, brighter higher up)
      c += vec3(1.0, 0.78, 0.5) * flood * 0.32 * (0.4 + 0.6 * vY) * (abs(n.y) < 0.5 ? 1.0 : 0.5);
      // the flash: light from the bolt
      vec3 L = uFlashP - vW; float d = length(L);
      float lam = max(dot(n, L / d), 0.0) * 0.85 + 0.15;
      c += vec3(0.75, 0.85, 1.0) * uFlash * lam * 1.6 / (1.0 + d * d / 2500.0);
      c += vec3(0.25, 0.3, 0.45) * uFlash * 0.25 * max(n.y, 0.0);
      float fd = length(vW - cameraPosition);
      c = mix(c, uFog * (1.0 + uFlash * 2.5), 1.0 - exp(-fd * 0.0042));
      gl_FragColor = vec4(c, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});

const makeBoxes = (boxes: Box[], mat: THREE.ShaderMaterial) => {
  const g = new THREE.BoxGeometry(1, 1, 1);
  const info = new Float32Array(boxes.length * 3);
  const mesh = new THREE.InstancedMesh(g, mat, boxes.length);
  const m = new THREE.Matrix4();
  boxes.forEach((b, i) => {
    m.compose(V(b.x, b.y0 + b.h / 2, b.z), new THREE.Quaternion(), V(b.w, b.h, b.d)); mesh.setMatrixAt(i, m);
    info.set([b.seed, b.flood, b.h], i * 3);
  });
  g.setAttribute('aInfo', new THREE.InstancedBufferAttribute(info, 3));
  mesh.frustumCulled = false;
  return mesh;
};

// mooring mast + antenna (no windows: seed -1), warm floodlit
const makeMast = (mat: THREE.ShaderMaterial) => {
  const parts = [
    new THREE.CylinderGeometry(1.0, 1.5, 2.6, 8).translate(0, 35.6 + 1.3, 0),
    new THREE.CylinderGeometry(0.55, 0.95, 1.2, 8).translate(0, 38.2 + 0.6, 0),
    new THREE.CylinderGeometry(0.1, 0.22, 4.9, 6).translate(0, 39.4 + 2.45, 0),
    new THREE.CylinderGeometry(0.04, 0.08, 1.5, 6).translate(0, 44.3 - 0.75 + 0.0, 0),
  ];
  const group = new THREE.Group();
  parts.forEach((g, i) => {
    const n = g.getAttribute('position').count;
    const a = new Float32Array(n * 3); for (let k = 0; k < n; k++) a.set([-1, i < 2 ? 0.55 : 0.15, 0], k * 3);
    g.setAttribute('aInfo', new THREE.BufferAttribute(a, 3));
    group.add(new THREE.Mesh(g, mat));
  });
  return group;
};

// ---------------------------------------------------------------- glowing segments (screen-space quads)
const MAXS = 9000;
type Segs = {mesh: THREE.InstancedMesh; a: Float32Array; b: Float32Array; c: Float32Array; w: Float32Array; n: number; mat: THREE.ShaderMaterial};
const makeSegs = (): Segs => {
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0]), 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  const a = new Float32Array(MAXS * 3), b = new Float32Array(MAXS * 3), c = new Float32Array(MAXS * 4), w = new Float32Array(MAXS);
  g.setAttribute('aA', new THREE.InstancedBufferAttribute(a, 3)); g.setAttribute('aB', new THREE.InstancedBufferAttribute(b, 3));
  g.setAttribute('aC', new THREE.InstancedBufferAttribute(c, 4)); g.setAttribute('aW', new THREE.InstancedBufferAttribute(w, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: {uRes: {value: new THREE.Vector2(1080, 1920)}},
    vertexShader: `attribute vec3 aA; attribute vec3 aB; attribute vec4 aC; attribute float aW; uniform vec2 uRes; varying float vAc; varying vec4 vC;
      void main(){
        vec4 ca = projectionMatrix * viewMatrix * vec4(aA, 1.0), cb = projectionMatrix * viewMatrix * vec4(aB, 1.0);
        if (ca.w < 0.1 || cb.w < 0.1 || aW <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
        vec2 sa = ca.xy / ca.w * uRes * 0.5, sb = cb.xy / cb.w * uRes * 0.5;
        vec2 dir = sb - sa; float L = length(dir); dir = L > 1e-4 ? dir / L : vec2(1.0, 0.0);
        vec2 perp = vec2(-dir.y, dir.x); float hw = aW * 4.0;
        vec4 p = mix(ca, cb, position.x);
        vec2 off = perp * hw * position.y + dir * hw * 0.5 * (position.x * 2.0 - 1.0);
        p.xy += off / (uRes * 0.5) * p.w;
        gl_Position = p; vAc = position.y * 4.0; vC = aC; }`,
    fragmentShader: `varying float vAc; varying vec4 vC;
      void main(){ float a = abs(vAc); float core = exp(-a * a * 1.6), halo = exp(-a * 1.1) * 0.32;
        vec3 c = vC.rgb * (core + halo) * vC.a + vec3(1.0) * core * core * 0.55 * vC.a * step(0.5, length(vC.rgb));
        gl_FragColor = vec4(c, 1.0); }`,
  });
  const mesh = new THREE.InstancedMesh(g as unknown as THREE.BufferGeometry, mat, MAXS);
  mesh.frustumCulled = false; mesh.renderOrder = 10;
  return {mesh, a, b, c, w, n: 0, mat};
};
const seg = (S: Segs, p: THREE.Vector3, q: THREE.Vector3, c: THREE.Color, alpha: number, width: number) => {
  if (S.n >= MAXS || alpha <= 0.004) return; const i = S.n++;
  S.a.set([p.x, p.y, p.z], i * 3); S.b.set([q.x, q.y, q.z], i * 3); S.c.set([c.r, c.g, c.b, alpha], i * 4); S.w[i] = width;
};
const flushSegs = (S: Segs) => {
  S.w.fill(0, S.n); const g = S.mesh.geometry;
  (['aA', 'aB', 'aC', 'aW'] as const).forEach((k) => { g.getAttribute(k).needsUpdate = true; });
  S.mesh.count = Math.max(1, S.n);
};

// ---------------------------------------------------------------- bolt geometry
// A channel from `from` to `to`: steps of ~5 units (the stepped leader's ~50 m jumps), each step jagged in 4 kinks,
// with side branches that grope and die. Each segment knows its step (for the leader's reveal) and branch depth.
type BSeg = {p: THREE.Vector3; q: THREE.Vector3; step: number; depth: number};
const boltCache = new Map<string, BSeg[]>();
const walk = (key: string, from: THREE.Vector3, to: THREE.Vector3, steps: number, depth: number, step0: number, out: BSeg[]) => {
  let p = from.clone();
  for (let s = 0; s < steps; s++) {
    const remain = steps - s;
    const target = to.clone().sub(p).divideScalar(remain);
    const jit = V(random(`${key}x${s}`) - 0.5, (random(`${key}y${s}`) - 0.5) * 0.5, random(`${key}z${s}`) - 0.5).multiplyScalar(target.length() * (depth ? 1.1 : 0.75));
    const end = s === steps - 1 && depth === 0 ? to.clone() : p.clone().add(target).add(jit);
    // four kinks inside the step
    let a = p.clone();
    for (let k = 1; k <= 4; k++) {
      const b = k === 4 ? end.clone() : p.clone().lerp(end, k / 4).add(V(random(`${key}${s}k${k}x`) - 0.5, 0, random(`${key}${s}k${k}z`) - 0.5).multiplyScalar(1.4));
      out.push({p: a, q: b, step: step0 + s, depth}); a = b;
    }
    if (depth < 2 && random(`${key}br${s}`) < (depth ? 0.25 : 0.55) && s < steps - 1) {
      const len = 1 + Math.floor(random(`${key}bl${s}`) * 3);
      const dirB = target.clone().normalize().add(V((random(`${key}bx${s}`) - 0.5) * 2.2, -0.2, (random(`${key}bz${s}`) - 0.5) * 2.2)).normalize();
      walk(`${key}b${s}`, end, end.clone().add(dirB.multiplyScalar(5 * len)), len, depth + 1, step0 + s + 1, out);
    }
    p = end;
  }
  return out;
};
const bolt = (key: string, from: THREE.Vector3, to: THREE.Vector3, steps: number) => {
  if (!boltCache.has(key)) boltCache.set(key, walk(key, from, to, steps, 0, 0, []));
  return boltCache.get(key)!;
};
const TIP = V(...TL.TIP), JV = V(...TL.J);
const CITY = buildCity();
// the tallest roofs near the tower (streamers, rulers come from these)
const ROOFS = CITY.filter((b) => Math.hypot(b.x, b.z) < 75 && b.z < 30).sort((a, b) => b.h - a.h).slice(0, 7).map((b) => V(b.x, b.h, b.z));
const strikeBolt = (s: TL.Strike) => bolt(`st${s.seed}`, V(s.dx * 2.2, TL.CLOUD_Y + 2, s.dz * 1.5 - 4), TIP, 13);
const RACE_TOP = V(-14, TL.CLOUD_Y + 2, -6);
const raceBolt = () => bolt('race', RACE_TOP, JV, TL.LEADER_STEPS);
const raceStreamer = () => bolt('stream', TIP, JV, 2);

const WHITE = col('#ffffff'), CY = col(TL.CYAN), LEAD = col(TL.LEADER), VIO = col(TL.VIOLET);

// draw one strike at time t: the flash (white core, bluish halo) then a cyan afterglow of the main channel
const drawStrike = (S: Segs, segs: BSeg[], t: number, ts: number, scale = 1) => {
  if (t < ts - 0.12) return 0;
  // a quick leader in the last 0.12 s before the stroke (a few frames of stepping)
  if (t < ts) {
    const k = (t - (ts - 0.12)) / 0.12, maxStep = Math.floor(k * 13);
    for (const g of segs) if (g.step <= maxStep) seg(S, g.p, g.q, LEAD, 0.35 / (1 + g.depth), 1.2 * scale);
    return 0;
  }
  const e = TL.strokeEnv(t, ts), ag = TL.afterglow(t, ts);
  for (const g of segs) {
    const main = g.depth === 0;
    if (main) {
      seg(S, g.p, g.q, WHITE, 1.4 * e, 3.2 * scale);
      seg(S, g.p, g.q, CY, 0.9 * ag, 2.2 * scale);
    } else seg(S, g.p, g.q, col('#cfe0ff'), (0.7 * e) / g.depth + 0.18 * ag / g.depth, 1.6 * scale);
  }
  return e;
};

// ---------------------------------------------------------------- the scene
export const Scene: React.FC<{t: number}> = ({t}) => {
  const {scene, camera, size} = useThree();
  const W = useMemo(() => {
    const mat = bMat();
    const city = makeBoxes(CITY, mat), tower = makeBoxes(TOWER, mat), mast = makeMast(mat);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
      uniforms: {uFlash: mat.uniforms.uFlash, uFog: mat.uniforms.uFog},
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uFlash; uniform vec3 uFog; varying vec3 vW;
        void main(){ vec2 g = mod(vW.xz + 4.5, 9.0); float st = 1.0 - step(1.3, min(g.x, g.y));
          vec3 c = vec3(0.012, 0.014, 0.02) + vec3(1.0, 0.6, 0.3) * st * 0.05 * (0.6 + 0.4 * fract(sin(dot(floor((vW.xz + 4.5) / 9.0), vec2(12.9, 78.2))) * 43758.5)) + vec3(0.4, 0.5, 0.7) * uFlash * 0.05;
          float fd = length(vW - cameraPosition); c = mix(c, uFog * (1.0 + uFlash * 2.5), 1.0 - exp(-fd * 0.0042));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    }));
    // cloud base: four noise layers
    const cloudMat = (y: number, k: number) => new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: {uT: {value: 0}, uFlash: mat.uniforms.uFlash, uFlashP: mat.uniforms.uFlashP, uK: {value: k}, uCharge: {value: 0}, uSheet: {value: new THREE.Vector4(0, 0, 0, 0)}},
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uT; uniform float uFlash; uniform vec3 uFlashP; uniform float uK; uniform float uCharge; uniform vec4 uSheet; varying vec3 vW;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * n2(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
        void main(){
          vec2 p = vW.xz * 0.012 + vec2(uT * 0.07, uT * 0.025) * (1.0 + 0.3 * uK) + uK * 3.7;
          float d = fbm(p) * 0.75 + fbm(p * 3.1 - uT * 0.12) * 0.35;
          float a = smoothstep(0.42 - uK * 0.04, 0.78, d);
          float fd = length(vW.xz - cameraPosition.xz);
          a *= 1.0 - smoothstep(700.0, 1200.0, fd);
          vec3 c = vec3(0.07, 0.08, 0.105) * (0.55 + 0.6 * d);
          c += vec3(0.9, 0.55, 0.3) * 0.025;                             // city glow from below
          float r = length(vW - uFlashP);
          c += vec3(0.75, 0.82, 1.0) * uFlash * (1.1 * exp(-r / 60.0) + 0.18) * (0.5 + d);
          c += vec3(0.7, 0.75, 1.0) * uSheet.w * exp(-length(vW.xz - uSheet.xz) / 140.0) * (0.4 + d);
          c += vec3(0.6, 0.65, 1.0) * uCharge * 0.12 * fbm(p * 6.0 + uT * 0.5);
          gl_FragColor = vec4(c, a * (0.85 + 0.1 * uK));
          #include <colorspace_fragment>
        }`,
    });
    const clouds = [0, 1, 2, 3].map((k) => {
      const y = TL.CLOUD_Y + k * 5.5;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400).rotateX(Math.PI / 2).translate(0, y, 0), cloudMat(y, k));
      m.renderOrder = 4 - k; return m;
    });
    const segs = makeSegs();
    const g = new THREE.Group(); g.add(city, tower, mast, ground, ...clouds, segs.mesh);
    return {g, mat, segs, clouds};
  }, []);

  // ---- per frame
  const shot = TL.shotAt(t);
  const S = W.segs; S.n = 0;
  let flash = 0; const flashP = V(0, 70, 0);

  // strikes (every shot that shows the tower)
  if (shot === 'hook' || shot === 'again' || shot === 'end') {
    for (const s of TL.STRIKES) {
      const e = drawStrike(S, strikeBolt(s), t, s.t);
      if (e > flash) { flash = e; flashP.set(s.dx, 75, s.dz); }
    }
  }
  // WHY: possible paths to many roofs flicker, then collapse onto the tower's path
  if (shot === 'why') {
    const k = TL.ramp(t, TL.CUT_WHY + 0.2, TL.BEATS.same + 0.3, (x) => x);
    const roofs: THREE.Vector3[] = [];
    for (let i = 0; i < 9; i++) roofs.push(V((random(`rx${i}`) - 0.5) * 120, 8 + random(`ry${i}`) * 14, -10 - random(`rz${i}`) * 60));
    roofs.forEach((r, i) => {
      const b = bolt(`maybe${i}`, V(r.x * 0.6, TL.CLOUD_Y + 2, r.z - 10), r, 8);
      const fl = 0.5 + 0.5 * Math.sin(t * 23 + i * 2.1);
      for (const g of b) if (g.depth === 0) seg(S, g.p, g.q, LEAD, 0.16 * fl * (1 - k), 1.0);
    });
    const tb = strikeBolt(TL.STRIKES[3]);
    for (const g of tb) if (g.depth === 0) seg(S, g.p, g.q, CY, 0.25 + 0.6 * k, 1.4 + 0.8 * k);
    flash = 0.05 + 0.04 * Math.max(0, Math.sin(t * 9));
    flashP.set(0, 100, -20);
  }
  // CLOUD: charge builds (cloud flicker)
  let charge = 0;
  if (shot === 'cloud') {
    charge = TL.ramp(t, TL.CUT_CLOUD, TL.CUT_LEADER, (x) => x);
    const fl = Math.max(0, Math.sin(t * 17.0) * Math.sin(t * 6.3 + 1)) * charge;
    flash = 0.04 + 0.22 * fl; flashP.set(-20 + 30 * Math.sin(t * 1.7), 118, -40);
    // charge specks: more and more of them gather and sink toward the cloud base
    const nS = Math.floor(60 + 520 * charge);
    for (let i = 0; i < nS; i++) {
      const x = (random(`cx${i}`) - 0.5) * 160, z = -90 + random(`cz${i}`) * 130;
      const y0 = TL.CLOUD_Y - 4 + random(`cy${i}`) * 16, sink = ((t * (0.8 + random(`cv${i}`) * 1.2) + random(`cp${i}`) * 9) % 9);
      const y = y0 - sink * 0.9 * charge;
      const tw = 0.55 + 0.45 * Math.sin(t * (9 + random(`ct${i}`) * 9) + i);
      seg(S, V(x, y, z), V(x + 0.05, y + 0.05, z), col('#c9d4ff'), 0.9 * tw, 2.2);
    }
    // little intra-cloud sparks crawling along the base
    for (let i = 0; i < 6; i++) {
      const on = TL.ramp(t, TL.CUT_CLOUD + i * 0.4, TL.CUT_CLOUD + i * 0.4 + 0.2, (x) => x) * charge;
      const flk = 0.5 + 0.5 * Math.sin(t * 31 + i * 5);
      const b = bolt(`ic${i}`, V(-60 + i * 22, TL.CLOUD_Y + 9, -30 - i * 8), V(-40 + i * 22, TL.CLOUD_Y + 6, -45 - i * 6), 4);
      for (const g of b) seg(S, g.p, g.q, LEAD, on * flk * 0.45 / (1 + g.depth), 1.3);
    }
  }
  // LEADER + CONTACT: the race
  if (shot === 'leader' || shot === 'contact') {
    const rb = raceBolt(), st = raceStreamer();
    const shown = TL.leaderSteps(t), lit = TL.pathLit(t);
    const lastStepT = TL.BEATS.reach + 0.2 + (shown - 1) * 0.36;
    for (const g of rb) {
      if (g.step >= shown && !lit) continue;
      if (lit && g.depth > 0) { seg(S, g.p, g.q, LEAD, 0.25 * Math.exp(-(t - TL.CONTACT_T) / 0.15) / g.depth, 1.0); continue; }
      const tipBlink = g.step === shown - 1 ? Math.exp(-(t - lastStepT) / 0.12) : 0;
      if (lit) continue;
      seg(S, g.p, g.q, LEAD, (0.6 + 1.4 * tipBlink) / (1 + g.depth), 2.0 + tipBlink * 2.0);
    }
    // streamers: violet flickers up from roofs; the mast's grows longest and touches
    const gr = TL.streamerGrow(t);
    if (gr > 0 && !lit) {
      ROOFS.forEach((p, i) => {
        const b = bolt(`str${i}`, p, p.clone().add(V((random(`sx${i}`) - 0.5) * 3, 4 + random(`sy${i}`) * 4, 0)), 1);
        const fl = 0.6 + 0.4 * Math.sin(t * 37 + i * 3);
        for (const g of b) seg(S, g.p, g.q.clone().lerp(g.p, 1 - Math.min(1, gr * 1.6)), VIO, 1.0 * fl, 2.4);
      });
      for (const g of st) {
        const f = (g.p.y - TIP.y) / (JV.y - TIP.y); if (f > gr) continue;
        seg(S, g.p, g.q, VIO, 1.0, 2.8);
      }
    }
    if (lit) {
      // connected: the path is cyan; the return stroke climbs from the mast to the cloud, then the whole path blazes
      const climb = TL.ramp(t, TL.RETURN_T - 0.1, TL.RETURN_T + 0.12, (x) => x);
      const e = t >= TL.RETURN_T ? TL.strokeEnv(t, TL.RETURN_T + 0.12) : 0;
      const contactFlash = Math.exp(-Math.max(0, t - TL.CONTACT_T) / 0.1);
      const path = [...st, ...rb.filter((g) => g.depth === 0)];
      for (const g of path) {
        const h = (Math.min(g.p.y, g.q.y) - TIP.y) / (TL.CLOUD_Y - TIP.y);
        const hot = h <= climb ? 1 : 0;
        seg(S, g.p, g.q, CY, 0.9, 2.0);
        seg(S, g.p, g.q, WHITE, hot * (0.8 + 1.2 * e) * (t < TL.RETURN_T + 0.12 ? 0.8 : 1), 2.6 + 1.5 * e);
      }
      flash = Math.max(0.15 * contactFlash, e * 1.1 + 0.25 * climb * (t < TL.RETURN_T + 0.12 ? 1 : 0));
      flashP.set(0, 60, 0);
    }
  }
  // GAP: rulers from tall roofs to the cloud base; the tower's is cyan and shortest
  if (shot === 'gap') {
    const gr = TL.rulerGrow(t);
    ROOFS.forEach(({x, y, z}) => {
      const top = TL.CLOUD_Y, yy = y + (top - y) * Math.min(1, gr * 1.15);
      // dashed: 3-unit dashes
      for (let a = y; a < yy; a += 5) seg(S, V(x, a, z), V(x, Math.min(a + 3, yy), z), col('#b4c0dc'), 0.8, 1.2);
      if (gr > 0.05) seg(S, V(x - 1.6, y, z), V(x + 1.6, y, z), col('#b4c0dc'), 0.9, 1.4);
    });
    const yy = TIP.y + (TL.CLOUD_Y - TIP.y) * gr;
    for (let a = TIP.y; a < yy; a += 5) seg(S, V(0, a, 0), V(0, Math.min(a + 3, yy), 0), CY, 1.0, 2.0);
    seg(S, V(-2, TIP.y, 0), V(2, TIP.y, 0), CY, 1.0, 2.0);
    flash = 0.06 + 0.05 * Math.max(0, Math.sin(t * 5.1) * Math.sin(t * 2.3));
    flashP.set(-60, 115, -80);
  }
  // YEAR: long exposure, a year of strikes as cyan scars on one mast
  if (shot === 'year') {
    const n = TL.yearCount(t);
    for (let i = 0; i < n; i++) {
      const b = bolt(`yr${i}`, V((random(`yx${i}`) - 0.5) * 70, TL.CLOUD_Y + 2, (random(`yz${i}`) - 0.5) * 40 - 6), TIP, 12);
      const born = TL.CUT_YEAR + 0.2 + (i / TL.YEAR_N) * (TL.BEATS.twentyfive + 0.6 - TL.CUT_YEAR - 0.2);
      const fresh = Math.exp(-Math.max(0, t - born) / 0.12);
      for (const g of b) if (g.depth === 0) {
        seg(S, g.p, g.q, CY, 0.32 + 0.6 * fresh, 1.3);
        if (fresh > 0.05) seg(S, g.p, g.q, WHITE, fresh, 2.2);
      }
      flash = Math.max(flash, fresh * 0.5);
    }
    flash = Math.max(flash, 0.06); flashP.set(0, 70, 0);
  }

  // rain: streaks around the camera's target, falling fast and slanted
  const cam = TL.camAt(t);
  const look = V(...cam.look), cp = V(...cam.pos);
  const center = cp.clone().lerp(look, 0.25);
  const rc = col('#8fa3c8');
  for (let i = 0; i < 2200; i++) {
    const R = 26;
    const x = center.x + (random(`rx${i}`) - 0.5) * R * 2, z = center.z + (random(`rz${i}`) - 0.5) * R * 2;
    const yr = (random(`ry${i}`) * 60 - t * 9.0) % 60; const y = center.y - 25 + ((yr + 60) % 60);
    const p = V(x, y, z), q = V(x + 0.15, y + 1.1, z);
    seg(S, p, q, rc, 0.12 + 0.3 * flash, 0.5);
  }
  // distant sheet lightning in the cloud (life in every shot), seeded events every ~1.6 s
  const sheet = new THREE.Vector4(0, 0, 0, 0);
  for (let k = Math.max(0, Math.floor(t / 1.6) - 1); k <= Math.floor(t / 1.6); k++) {
    const t0 = k * 1.6 + random(`sh${k}`) * 1.2, d = t - t0;
    if (d < 0 || d > 0.5) continue;
    const a = (Math.exp(-d / 0.07) + 0.6 * (d > 0.12 ? Math.exp(-(d - 0.12) / 0.06) : 0)) * (0.5 + 0.5 * random(`sha${k}`));
    if (a > sheet.w) sheet.set(cp.x + (random(`shx${k}`) - 0.5) * 500, 0, cp.z - 150 - random(`shz${k}`) * 300, a);
  }
  flushSegs(S);
  W.segs.mat.uniforms.uRes.value.set(size.width, size.height);

  // world uniforms and the shell's scene-wide state, every frame
  W.mat.uniforms.uFlash.value = flash; W.mat.uniforms.uFlashP.value.copy(flashP);
  W.clouds.forEach((c) => { const m = c.material as THREE.ShaderMaterial; m.uniforms.uT.value = t; m.uniforms.uCharge.value = charge; m.uniforms.uSheet.value.copy(sheet); });
  scene.background = col('#060a14').lerp(col('#4a5878'), Math.min(1, flash * 0.45));
  const pc = camera as THREE.PerspectiveCamera;
  pc.position.copy(cp); pc.fov = cam.fov; pc.near = 0.5; pc.far = 3000; pc.up.set(0, 1, 0); pc.lookAt(look); pc.updateProjectionMatrix();
  return <primitive object={W.g} />;
};

// flash level for the overlay (the frame's white bloom)
export const flashAt = (t: number) => {
  const s = TL.shotAt(t);
  let f = 0;
  if (s === 'hook' || s === 'again' || s === 'end') for (const st of TL.STRIKES) f = Math.max(f, st.t <= t ? TL.strokeEnv(t, st.t) : 0);
  if ((s === 'contact') && t >= TL.RETURN_T) f = TL.strokeEnv(t, TL.RETURN_T + 0.12);
  return f;
};
