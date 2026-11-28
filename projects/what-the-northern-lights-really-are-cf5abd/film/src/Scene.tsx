// Worlds in one three.js scene, switched on the hard cuts (timeline.ts CUT_*):
//  GROUND  night: dark hills, faint snow, stars, two aurora curtains 250-450 km to the north (units: km); amber
//          solar-wind streaks pour down into the curtains' lower edge
//  SUN     the Sun (granulated shader + corona) sheds amber particles that stream off toward +x
//  SPACE   the photographic Earth (globe kit), cyan dipole field lines squashed on the day side, the amber stream
//          parting round the bubble, steered particles sliding down the lines into the auroral ovals (both poles);
//          the oval is the same curtain shader as on the ground, at real height (85-320 km)
// Every particle is a pure function of time (spawn index, seeded path), so any frame renders alone.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {random} from 'remotion';
import {Earth, Stars, type EarthTex} from './kit/globe';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
const C_AMBER = col(TL.AMBER), C_GREEN = col(TL.GREEN), C_RED = col(TL.RED), C_PURPLE = col(TL.PURPLE), C_WARM = col('#FFE6B0');
const MAXP = 40000;
const D2R = Math.PI / 180;

// ---------- glowing points (additive), log-depth so they sort against the planet
const pointsMaterial = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  uniforms: {uPx: {value: 1000}},
  vertexShader: `attribute vec4 pc; attribute float ps; uniform float uPx; varying vec4 vC;
    #include <common>
    #include <logdepthbuf_pars_vertex>
    void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
      gl_PointSize = clamp(ps * uPx / -mv.z, 0.0, 80.0); vC = pc; if (ps <= 0.0) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      #include <logdepthbuf_vertex>
    }`,
  fragmentShader: `varying vec4 vC;
    #include <common>
    #include <logdepthbuf_pars_fragment>
    void main(){
      #include <logdepthbuf_fragment>
      float r = length(gl_PointCoord - 0.5) * 2.0; if (r > 1.0) discard;
      float core = exp(-r * r * 14.0), halo = exp(-r * r * 3.5) * 0.35;
      gl_FragColor = vec4(vC.rgb * (core * 1.6 + halo) * vC.a + vec3(1.0) * core * core * 0.45 * vC.a, 1.0); }`,
});
type Pts = {obj: THREE.Points; pos: Float32Array; pc: Float32Array; ps: Float32Array; n: number};
const makePoints = (): Pts => {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(MAXP * 3), pc = new Float32Array(MAXP * 4), ps = new Float32Array(MAXP);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('pc', new THREE.BufferAttribute(pc, 4)); g.setAttribute('ps', new THREE.BufferAttribute(ps, 1));
  const obj = new THREE.Points(g, pointsMaterial()); obj.frustumCulled = false; obj.renderOrder = 6;
  return {obj, pos, pc, ps, n: 0};
};
const put = (P: Pts, v: THREE.Vector3, c: THREE.Color, a: number, size: number) => {
  if (P.n >= MAXP || a <= 0.003) return; const i = P.n++;
  P.pos[i * 3] = v.x; P.pos[i * 3 + 1] = v.y; P.pos[i * 3 + 2] = v.z;
  P.pc[i * 4] = c.r; P.pc[i * 4 + 1] = c.g; P.pc[i * 4 + 2] = c.b; P.pc[i * 4 + 3] = a; P.ps[i] = size;
};
const flush = (P: Pts) => {
  P.ps.fill(0, P.n); const g = P.obj.geometry;
  (['position', 'pc', 'ps'] as const).forEach((k) => { g.getAttribute(k).needsUpdate = true; });
};

// ---------- aurora curtain: a ribbon of rows at real altitudes; colour from altitude, rays from noise along it
const curtainMaterial = (kmScale: number) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
  uniforms: {uT: {value: 0}, uG: {value: 1}, uR: {value: 1}, uN: {value: 1}, uO: {value: 1}, uS: {value: kmScale}, uGain: {value: 1}},
  vertexShader: `attribute float aAlt; attribute float aU; attribute vec3 aSide; attribute float aEnd; uniform float uT; uniform float uS;
    varying float vAlt; varying float vU; varying float vEnd;
    #include <common>
    #include <logdepthbuf_pars_vertex>
    void main(){ vAlt = aAlt; vU = aU; vEnd = aEnd;
      float fold = 28.0 * sin(aU * 0.0042 + uT * 0.35) + 11.0 * sin(aU * 0.0135 - uT * 0.8 + aAlt * 0.004) + 4.0 * sin(aU * 0.05 + uT * 1.7);
      vec3 p = position + aSide * fold * uS;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      #include <logdepthbuf_vertex>
    }`,
  fragmentShader: `uniform float uT; uniform float uG; uniform float uR; uniform float uN; uniform float uO; uniform float uGain;
    varying float vAlt; varying float vU; varying float vEnd;
    #include <common>
    #include <logdepthbuf_pars_fragment>
    float h1(float x){ return fract(sin(x * 127.1) * 43758.5453); }
    float n1(float x){ float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
    void main(){
      #include <logdepthbuf_fragment>
      float e = 100.0 + 9.0 * n1(vU * 0.01 + uT * 0.2) - 4.0;          // lower edge, km
      float a = vAlt;
      float ray = n1(vU * 0.11 + uT * 0.6) * 0.6 + n1(vU * 0.37 - uT * 1.1) * 0.4;
      ray = 0.3 + 1.5 * ray * ray;
      float rayH = 0.6 + 0.8 * n1(vU * 0.05 + 3.0);                   // how tall the rays reach
      float g = smoothstep(e - 5.0, e + 3.0, a) * exp(-max(a - e - 12.0, 0.0) / (55.0 * rayH));
      float r = smoothstep(175.0, 235.0, a) * (1.0 - smoothstep(270.0, 320.0, a)) * (0.55 + 0.45 * n1(vU * 0.02 - uT * 0.15));
      float nb = exp(-pow((a - e + 1.0) / 5.5, 2.0));
      vec3 cg = vec3(0.30, 1.0, 0.50), cr = vec3(1.0, 0.16, 0.26), cn = vec3(0.62, 0.36, 1.0);
      vec3 c = cg * g * uG * 1.25 * ray + cr * r * uR * 0.75 * (0.6 + 0.4 * ray) + cn * nb * uN * 1.1 * ray;
      gl_FragColor = vec4(c * uO * uGain * vEnd, 1.0); }`,
});
type RibbonPt = {p: THREE.Vector3; up: THREE.Vector3; side: THREE.Vector3; u: number};
const ribbon = (pts: RibbonPt[], s: number, rows = 28, closed = false) => {
  const g = new THREE.BufferGeometry(); const pos: number[] = [], alt: number[] = [], uu: number[] = [], side: number[] = [], end: number[] = [], idx: number[] = [];
  const [h0, h1] = TL.CURTAIN_KM; const n = pts.length;
  pts.forEach((q, i) => {
    const fe = closed ? 1 : Math.min(1, Math.min(i, n - 1 - i) / (n * 0.12));
    for (let j = 0; j <= rows; j++) {
      const a = h0 + (h1 - h0) * Math.pow(j / rows, 1.4);
      const v = q.p.clone().addScaledVector(q.up, a * s);
      pos.push(v.x, v.y, v.z); alt.push(a); uu.push(q.u); side.push(q.side.x, q.side.y, q.side.z); end.push(fe * fe * (3 - 2 * fe));
    }
  });
  const R = rows + 1;
  for (let i = 0; i < n - 1 + (closed ? 1 : 0); i++) { const i2 = (i + 1) % n; for (let j = 0; j < rows; j++) { const a = i * R + j, b = i2 * R + j; idx.push(a, b, a + 1, a + 1, b, b + 1); } }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aAlt', new THREE.Float32BufferAttribute(alt, 1));
  g.setAttribute('aU', new THREE.Float32BufferAttribute(uu, 1)); g.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 3)); g.setAttribute('aEnd', new THREE.Float32BufferAttribute(end, 1));
  g.setIndex(idx); return g;
};
// the auroral oval round the north pole on the unit sphere (bigger toward the night side, +x)
export const ovalColat = (lon: number) => TL.OVAL_COLAT + 3 * Math.cos(lon) + 1.6 * Math.sin(3 * lon + 1) + 0.8 * Math.sin(7 * lon + 2);
export const sph = (colat: number, lon: number, r = 1) => { const c = colat * D2R; return new THREE.Vector3(r * Math.sin(c) * Math.cos(lon), r * Math.cos(c), r * Math.sin(c) * Math.sin(lon)); };
const ovalPts = (): RibbonPt[] => {
  const N = 900, out: RibbonPt[] = []; let u = 0, prev: THREE.Vector3 | null = null;
  for (let i = 0; i < N; i++) {
    const lon = (i / N) * Math.PI * 2, p = sph(ovalColat(lon), lon); if (prev) u += p.distanceTo(prev) * 6371; prev = p;
    const nx = sph(ovalColat(lon + 0.001), lon + 0.001); const tan = nx.sub(p).normalize(); const up = p.clone().normalize();
    out.push({p, up, side: tan.clone().cross(up).normalize(), u});
  }
  return out;
};
const groundCurtain = (z0: number, seed: number, x0 = -800, x1 = 800): RibbonPt[] => {
  const out: RibbonPt[] = []; const up = new THREE.Vector3(0, 1, 0); let u = seed * 1000, prev: THREE.Vector3 | null = null;
  for (let x = x0; x <= x1; x += 2) {
    const z = z0 + 70 * Math.sin(x / 260 + seed) + 25 * Math.sin(x / 75 + seed * 2);
    const p = new THREE.Vector3(x, 0, z); if (prev) u += p.distanceTo(prev); prev = p;
    const dz = (70 / 260) * Math.cos(x / 260 + seed) + (25 / 75) * Math.cos(x / 75 + seed * 2);
    const tan = new THREE.Vector3(1, 0, dz).normalize();
    out.push({p, up, side: tan.clone().cross(up).normalize(), u});
  }
  return out;
};

// ---------- the Sun
const sunMaterial = () => new THREE.ShaderMaterial({
  toneMapped: false, uniforms: {uT: {value: 0}},
  vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP;
    #include <common>
    #include <logdepthbuf_pars_vertex>
    void main(){ vP = position; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv;
      #include <logdepthbuf_vertex>
    }`,
  fragmentShader: `uniform float uT; varying vec3 vN; varying vec3 vV; varying vec3 vP;
    #include <common>
    #include <logdepthbuf_pars_fragment>
    float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
    float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
    void main(){
      #include <logdepthbuf_fragment>
      vec3 p = normalize(vP);
      float gr = n3(p * 26.0 + uT * 0.25) * 0.55 + n3(p * 60.0 - uT * 0.4) * 0.3 + n3(p * 7.0 + uT * 0.08) * 0.15;
      float mu = max(dot(vN, vV), 0.0); float limb = 0.35 + 0.65 * pow(mu, 0.55);
      vec3 hot = vec3(1.45, 1.05, 0.55), cool = vec3(1.25, 0.42, 0.08);
      vec3 c = mix(cool, hot, smoothstep(0.25, 0.85, gr * limb + 0.25 * mu));
      gl_FragColor = vec4(c * limb * (0.8 + 0.4 * gr), 1.0); }`,
});
const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!; const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,240,210,0.55)'); gr.addColorStop(0.5, 'rgba(255,200,140,0.12)'); gr.addColorStop(1, 'rgba(255,180,120,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
};

// ---------- night sky dome for the ground shot (additive glow low in the north, tinted by the aurora)
const skyGlow = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide, toneMapped: false,
  uniforms: {uA: {value: 1}},
  vertexShader: `varying vec3 vD;
    #include <common>
    #include <logdepthbuf_pars_vertex>
    void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      #include <logdepthbuf_vertex>
    }`,
  fragmentShader: `uniform float uA; varying vec3 vD;
    #include <common>
    #include <logdepthbuf_pars_fragment>
    void main(){
      #include <logdepthbuf_fragment>
      float el = max(vD.y, 0.0); float north = smoothstep(0.2, -1.0, vD.z);
      vec3 base = vec3(0.012, 0.022, 0.05) * exp(-el * 2.5);
      vec3 aur = vec3(0.05, 0.22, 0.12) * exp(-el * 3.5) * north * uA;
      gl_FragColor = vec4(base + aur, 1.0); }`,
});

// ---------- magnetic field: dipole lines r = L sin^2(theta), squashed on the day side (-x) and stretched at night
const comp = (lon: number) => { const cx = Math.cos(lon); return cx < 0 ? 1 + 0.46 * cx : 1 + 0.55 * cx; };
const smooth = (a: number, b: number, x: number) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
export const linePt = (L: number, lon: number, th: number, sgn = 1, out = new THREE.Vector3()) => {
  const r0 = L * Math.sin(th) ** 2, r = r0 * (1 + (comp(lon) - 1) * smooth(1.0, 3.2, r0));
  return out.set(r * Math.sin(th) * Math.cos(lon), sgn * r * Math.cos(th), r * Math.sin(th) * Math.sin(lon));
};
const footTh = (L: number) => Math.asin(Math.sqrt(1 / L));
const fieldLines = () => {
  const gs: THREE.BufferGeometry[] = [];
  const Ls = [2.1, 3.3, 1 / Math.sin(TL.OVAL_COLAT * D2R) ** 2];
  for (let i = 0; i < 12; i++) {
    const lon = (i / 12) * Math.PI * 2 + 0.13;
    for (const L of Ls) {
      const a = footTh(L) * 1.02, b = Math.PI - a, pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 90; k++) pts.push(linePt(L, lon, a + (b - a) * (k / 90)));
      gs.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.009, 5, false));
    }
  }
  const m = new THREE.MeshBasicMaterial({color: col(TL.CYAN), transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false});
  const mesh = new THREE.Mesh(mergeGeometries(gs), m); mesh.renderOrder = 4; return mesh;
};
// the bubble: radius of the boundary at x (nose at -NOSE, opening toward +x)
const rb = (x: number) => (x > -TL.NOSE ? Math.sqrt(1.7 * TL.NOSE * (x + TL.NOSE)) : 0);

const V = new THREE.Vector3(), V2 = new THREE.Vector3(), E1 = new THREE.Vector3(), E2 = new THREE.Vector3();

// stream particles (field and end shots)
const ST_RATE = 1100, ST_V = 2.6, ST_X0 = -11, ST_T0 = TL.CUT_FIELD - 8;
const drawStream = (P: Pts, t: number, glowK: number, steerFrom: number) => {
  const i1 = Math.floor((t - ST_T0) * ST_RATE), life = 22 / ST_V, i0 = Math.max(0, Math.floor((t - life - ST_T0) * ST_RATE));
  for (let i = i0; i <= i1; i++) {
    const t0 = ST_T0 + i / ST_RATE, age = t - t0; if (age < 0) continue;
    const steer = i % 7 === 0 && t0 > steerFrom - 4.5;
    if (steer) { drawSteered(P, i, t0, age); continue; }
    const b = Math.sqrt(random(`b${i}`)) * 4.6, al = random(`a${i}`) * Math.PI * 2, x = ST_X0 + age * ST_V; if (x > 11) continue;
    const R = rb(x), r = Math.sqrt(b * b + R * R), gl = R > 0 ? Math.exp(-(((r - R) / 0.25) ** 2)) : 0;
    V.set(x, r * Math.cos(al), r * Math.sin(al));
    const a = (0.28 + 0.3 * random(`l${i}`)) * (1 + glowK * gl * 3.5) * Math.min(1, age * 3);
    put(P, V, C_AMBER, Math.min(a, 1.5), 0.06 + 0.05 * glowK * gl);
    V.x -= 0.12; put(P, V, C_AMBER, a * 0.45, 0.045); V.x -= 0.12; put(P, V, C_AMBER, a * 0.2, 0.035);
  }
};
// a particle that catches on a field line and slides down into the oval
const drawSteered = (P: Pts, i: number, t0: number, age: number) => {
  const sgn = random(`h${i}`) < 0.55 ? 1 : -1, lon = (random(`o${i}`) - 0.5) * 2.4 + (random(`q${i}`) < 0.5 ? 0 : Math.PI);
  const L = 1 / Math.sin((TL.OVAL_COLAT + (random(`c${i}`) - 0.5) * 4) * D2R) ** 2, th0 = 1.08, thf = footTh(L) * 1.01;
  const start = linePt(L, lon, th0, sgn, V2.clone());
  const from = new THREE.Vector3(ST_X0, start.y * 0.7 + (random(`y${i}`) - 0.5) * 1.5, start.z * 0.7 + (random(`z${i}`) - 0.5) * 1.5);
  const dA = from.distanceTo(start), tA = dA / ST_V, tB = 2.2;
  if (age < tA) { V.copy(from).lerp(start, age / tA); put(P, V, C_AMBER, 0.9 * Math.min(1, age * 3), 0.06); return; }
  const k = (age - tA) / tB;
  if (k < 1) {
    const th = th0 + (thf - th0) * (k * k * (3 - 2 * k)); linePt(L, lon, th, sgn, V);
    const rr = V.length(); E1.copy(V).normalize(); E2.set(-Math.sin(lon), 0, Math.cos(lon));
    const amp = 0.05 * (rr - 1), ph = k * 40 + i;
    V.addScaledVector(E1, Math.cos(ph) * amp).addScaledVector(E2, Math.sin(ph) * amp);
    put(P, V, C_AMBER, 1.2, 0.055); return;
  }
  const a2 = (k - 1) * tB; if (a2 > 0.8) return;
  linePt(L, lon, thf, sgn, V).multiplyScalar(1 + 110 * TL.KM / V.length());
  put(P, V, C_GREEN, (1 - a2 / 0.8) * 1.3, 0.12);
};

export const Scene: React.FC<{t: number; earth: EarthTex}> = ({t, earth}) => {
  const {gl, camera, scene, size} = useThree();
  const shot = TL.shotAt(t);

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    const gt = glowTex();
    // ground
    const ground = new THREE.Group(); scene.add(ground);
    const gMats = [curtainMaterial(1), curtainMaterial(1)];
    ground.add(new THREE.Mesh(ribbon(groundCurtain(-270, 0.3), 1, 32), gMats[0]), new THREE.Mesh(ribbon(groundCurtain(-470, 2.1, -1000, 900), 1, 32), gMats[1]));
    gMats[1].uniforms.uGain.value = 0.6;
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), skyGlow()); sky.renderOrder = -1; ground.add(sky);
    const hills = (() => {
      const segs = 720, g = new THREE.BufferGeometry(), pos: number[] = [], idx: number[] = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2, r = 4;
        const north = Math.max(0, -Math.cos(a));
        const h = 0.04 + (0.16 * (0.5 + 0.5 * Math.sin(a * 3 + 1)) + 0.1 * (0.5 + 0.5 * Math.sin(a * 7 + 2)) + 0.03 * Math.sin(a * 23) + 0.012 * Math.sin(a * 61 + 1)) * (0.5 + north);
        pos.push(Math.sin(a) * r, -0.05, -Math.cos(a) * r, Math.sin(a) * r, h, -Math.cos(a) * r);
        if (i < segs) { const b = i * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
      }
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
      return new THREE.Mesh(g, new THREE.MeshBasicMaterial({color: col('#03060A'), side: THREE.DoubleSide}));
    })();
    ground.add(hills);
    // snow: dark blue-grey, catching green toward the north
    const snowMat = new THREE.ShaderMaterial({toneMapped: false, uniforms: {uA: {value: 1}},
      vertexShader: `varying vec3 vW;
        #include <common>
        #include <logdepthbuf_pars_vertex>
        void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w;
          #include <logdepthbuf_vertex>
        }`,
      fragmentShader: `uniform float uA; varying vec3 vW;
        #include <common>
        #include <logdepthbuf_pars_fragment>
        float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){
          #include <logdepthbuf_fragment>
          float d = length(vW.xz); float n = h2(floor(vW.xz * 900.0)) * 0.05;
          vec3 c = vec3(0.035, 0.05, 0.075) * (1.0 + n) + vec3(0.02, 0.09, 0.05) * uA * smoothstep(0.0, -3.0, vW.z) ;
          gl_FragColor = vec4(c * mix(1.0, 0.5, smoothstep(0.2, 3.5, d)), 1.0); }`});
    const snow = new THREE.Mesh(new THREE.CircleGeometry(4.2, 64), snowMat); snow.rotation.x = -Math.PI / 2; ground.add(snow);

    // sun
    const sunG = new THREE.Group(); scene.add(sunG);
    const sunM = sunMaterial(); sunG.add(new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), sunM));
    const corona = new THREE.Sprite(new THREE.SpriteMaterial({map: gt, color: col('#FFD9A0'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false}));
    corona.scale.setScalar(5.2); sunG.add(corona);
    const dot = new THREE.Sprite(new THREE.SpriteMaterial({map: gt, color: col('#7FB6FF'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false}));
    dot.position.set(10, 0, 0); dot.scale.setScalar(0.7); sunG.add(dot);

    // space
    const space = new THREE.Group(); scene.add(space);
    const field = fieldLines(); space.add(field);
    const ovalGeo = ribbon(ovalPts(), TL.KM, 30, true);
    const ovM = curtainMaterial(TL.KM), ovS = curtainMaterial(TL.KM);
    const ovN = new THREE.Mesh(ovalGeo, ovM); ovN.renderOrder = 5; space.add(ovN);
    const ovSouth = new THREE.Mesh(ovalGeo, ovS); ovSouth.scale.y = -1; ovSouth.rotation.y = 0.4; ovSouth.renderOrder = 5; space.add(ovSouth);
    const P = makePoints(); scene.add(P.obj);
    return {ground, gMats, sky, snowMat, sunG, sunM, space, field, ovM, ovS, P};
  }, [gl, scene]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const P = W.P; P.n = 0;
  W.ground.visible = shot === 'hook'; W.sunG.visible = shot === 'sun'; W.space.visible = shot === 'field' || shot === 'slice' || shot === 'end';
  scene.background = col('#000000'); gl.toneMappingExposure = 1;
  const Ly = TL.layers(t);
  const setC = (m: THREE.ShaderMaterial, gain = 1) => { const u = m.uniforms; u.uT.value = t; u.uG.value = Ly.g; u.uR.value = Ly.r; u.uN.value = Ly.n; u.uO.value = Ly.o * gain; };

  if (shot === 'hook') {
    W.gMats.forEach((m) => setC(m));
    const g = TL.groundCam(t); cam.fov = g.fov; cam.near = 0.0005; cam.far = 3000; cam.position.set(...g.pos); cam.up.set(0, 1, 0);
    const yaw = g.yaw * D2R, pit = g.pitch * D2R;
    cam.lookAt(g.pos[0] + Math.sin(yaw) * Math.cos(pit) * 10, g.pos[1] + Math.sin(pit) * 10, g.pos[2] - Math.cos(yaw) * Math.cos(pit) * 10);
    // amber streaks pouring down into the near curtain's lower edge, more from "crashing"
    const rate = 70, n = Math.floor((t + 3) * rate);
    for (let i = 0; i < n; i++) {
      const t0 = -3 + i / rate; if (t0 > TL.BEATS.wind - 0.5 && t0 < TL.BEATS.crash && i % 3) continue;
      if (t0 < TL.BEATS.wind - 0.5 && i % 4) continue;
      const age = t - t0, x = (random(`gx${i}`) - 0.5) * 900, z = -270 + 70 * Math.sin(x / 260 + 0.3) + 25 * Math.sin(x / 75 + 0.6);
      const hit = 98 + random(`gh${i}`) * 40, y0 = 900, sp = 700, y = y0 - age * sp;
      if (y > hit) { for (let j = 0; j < 6; j++) { V.set(x, y + j * 9, z); put(P, V, C_AMBER, (1 - j / 6) * 0.95, 5.5 - j * 0.5); } }
      else { const a2 = (hit - y) / sp; if (a2 < 0.6) { V.set(x, hit, z); put(P, V, C_GREEN, (1 - a2 / 0.6) * 1.1, 16); } }
    }
  } else if (shot === 'sun') {
    W.sunM.uniforms.uT.value = t;
    const c = TL.camAt(t); cam.fov = c.fov; cam.near = 0.01; cam.far = 500; cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll * D2R);
    const rate = 900, t00 = TL.CUT_SUN - 8, i1 = Math.floor((t - t00) * rate);
    for (let i = Math.max(0, i1 - 9000); i <= i1; i++) {
      const t0 = t00 + i / rate, age = t - t0; if (age < 0) continue;
      const u = random(`su${i}`) * 2 - 1, a = random(`sa${i}`) * Math.PI * 2, s = Math.sqrt(1 - u * u);
      const nrm = V2.set(Math.abs(s * Math.cos(a)) * 0.9 + 0.1, u, s * Math.sin(a)).normalize();
      const dir = E1.copy(nrm).multiplyScalar(0.45).add(V.set(1.4, 0, 0)).normalize(); const sp = 1.5 + random(`sv${i}`) * 0.8;
      V.copy(nrm).multiplyScalar(1.01).addScaledVector(dir, age * sp); if (V.x > 10.5) continue;
      const a0 = Math.min(1, age * 2.5) * (0.5 + 0.5 * random(`sl${i}`));
      put(P, V, age < 0.25 ? C_WARM : C_AMBER, a0 * 1.1, 0.045);
      V.addScaledVector(dir, -0.09); put(P, V, C_AMBER, a0 * 0.45, 0.032);
    }
  } else {
    const c = TL.camAt(t); cam.fov = c.fov; cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll * D2R);
    const dist = Math.hypot(...c.pos) - 1; cam.near = Math.max(0.0005, dist * 0.05); cam.far = 400;
    const og = 1 + 0.55 * Math.max(0, dist - 0.3); setC(W.ovM, og); setC(W.ovS, og);
    (W.field.material as THREE.MeshBasicMaterial).opacity = 0.42 * TL.fieldOn(t);
    W.field.visible = TL.fieldOn(t) > 0.01;
    if (shot === 'field' || shot === 'end') drawStream(P, t, shot === 'field' ? TL.ramp(t, TL.BEATS.earth, TL.BEATS.pushes + 0.4) : 0.6, shot === 'field' ? TL.BEATS.steers : -99);
    if (shot === 'slice' || shot === 'end') {
      // rain of particles down the near-vertical field lines into the curtain ahead of the camera
      const rate = 260, t00 = TL.CUT_SLICE - 3, i1 = Math.floor((t - t00) * rate), sp = 0.07;
      const late = (k: number, from: number) => t00 + k / rate > from;
      for (let i = Math.max(0, i1 - 1200); i <= i1; i++) {
        const t0 = t00 + i / rate, age = t - t0; if (age < 0) continue;
        const lon = TL.SLICE_LON - 0.08 + random(`rl${i}`) * 0.3, cl = ovalColat(lon) + (random(`rc${i}`) - 0.5) * 0.25;
        const q = random(`rq${i}`);
        const kind = late(i, TL.BEATS.higher) && q < 0.18 ? 1 : late(i, TL.BEATS.nitrogen) && q > 0.84 ? 2 : 0;
        const hit = kind === 1 ? 210 + random(`rh${i}`) * 60 : kind === 2 ? 96 + random(`rh${i}`) * 8 : 105 + random(`rh${i}`) * 45;
        const r0 = 1 + 700 * TL.KM, rh = 1 + hit * TL.KM, r = r0 - age * sp;
        if (r > rh) { for (let j = 0; j < 5; j++) { V.copy(sph(cl, lon, r + j * 0.0014)); put(P, V, C_AMBER, (1 - j / 5) * 0.95, 0.0011 - j * 0.00014); } }
        else { const a2 = (rh - r) / sp; if (a2 < 0.5) { V.copy(sph(cl, lon, rh)); put(P, V, kind === 1 ? C_RED : kind === 2 ? C_PURPLE : C_GREEN, (1 - a2 / 0.5) * 1.1, 0.0035); } }
      }
    }
  }
  (P.obj.material as THREE.ShaderMaterial).uniforms.uPx.value = size.height * gl.getPixelRatio() / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2));
  cam.updateProjectionMatrix();
  flush(P);

  const sunVec = new THREE.Vector3(...TL.SUN_DIR);
  return (
    <>
      {shot !== 'sun' && <Stars fr={Math.round(t * 30)} count={shot === 'hook' ? 9000 : 5000} opacity={shot === 'hook' ? 1 : 0.8} />}
      {shot === 'sun' && <Stars fr={Math.round(t * 30)} count={4000} opacity={0.6} />}
      {(shot === 'field' || shot === 'slice' || shot === 'end') && <Earth tex={earth} day={1.5} night={1.0} sunVec={sunVec} air={0.5} />}
    </>
  );
};
