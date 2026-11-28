// The rock in the boat: one glass-walled pool seen side-on (picture pick: "glass tank, red line on the glass, blue water
// blocks as the unit"). Units: metres. Glass front at z = GLASS; water rest level y = 0; floor y = FLOOR.
// Everything is drawn from the frame number (state(t) below); nothing is simulated at render time.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {rock as rockGeo} from './kit/realism/shapes.ts';
import {NOISE} from './kit/water/glsl';
import {skyDome, SkyColors} from './kit/water/env';
import B from './beats.json';

export const GLASS = 1.5, BACK = -1.5, FLOOR = -1.6, HALF_X = 3.2;
export const DROP = 0.11;                       // shown drop of the water level (exaggerated; real: well under 1 mm)
export const RED = '#FF3B30', BLUE = '#5CC8FF';
const SKY: SkyColors = {zenith: '#4F86C6', horizon: '#D6E4EE', ground: '#9A927F', sun: '#FFF3DA', sunDir: new THREE.Vector3(-0.35, 0.62, 0.7).normalize()};
const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (a: number, b: number, x: number) => { const u = cl((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

// ---------- timeline (seconds, all from the VO's beats) ----------
export const T = (() => {
  const b = B as Record<string, number>;
  return {
    tipStart: b.over + 0.05, freeze: b.over + 1.05, release: b.falls - 0.25, splash: b.falls - 0.05,
    floor: b.falls + 1.35, weight: b.l4 + 0.35, size: b.l5 + 0.25, split: b.three, less: b.less, bob: b.l7, end: b.total,
  };
})();

const BOAT_X = -0.15, BOAT_Z = -0.25, ROCK_FLOOR = new THREE.Vector3(0.55, FLOOR + 0.13, 0.75);
export const state = (t: number) => {
  // water level: drops once the rock is in the water (the real change, exaggerated)
  const level = -DROP * sm(T.splash + 0.1, T.splash + 1.6, t);
  // boat draft: deeper while it carries the rock, then bobs up (damped)
  const out = t > T.splash ? t - T.splash : -1;
  const bob = out < 0 ? 0 : 0.045 * Math.exp(-out * 1.6) * Math.sin(out * 6.2);
  const draft = (out < 0 ? -0.07 : -0.07 * Math.exp(-out * 2.2)) + bob;
  // rock: rests in the boat, rolls up and over the near side, hangs (the pause), drops, sinks to the floor
  const inBoat = new THREE.Vector3(BOAT_X + 0.15, 0.06, BOAT_Z);
  const hang = new THREE.Vector3(0.45, 0.42, 0.62);
  let rp = inBoat.clone(), rr = 0;
  const slow = (x: number) => x; // freeze stretches time below
  if (t >= T.tipStart && t < T.freeze) {
    const u = sm(T.tipStart, T.freeze, t);
    rp = new THREE.Vector3(lerp(inBoat.x, hang.x, u), inBoat.y + Math.sin(u * Math.PI * 0.85) * 0.55 + u * (hang.y - inBoat.y) * 0.6, lerp(inBoat.z, hang.z, u));
    rr = u * 2.2;
  } else if (t >= T.freeze && t < T.release) {
    const u = (t - T.freeze) / (T.release - T.freeze);        // nearly still: a slow drift so it never parks
    rp = hang.clone().add(new THREE.Vector3(0.02 * u, -0.03 * u, 0.01 * u)); rr = 2.2 + 0.12 * u;
  } else if (t >= T.release) {
    const a = t - T.release, airT = 0.32;
    if (a < airT) { rp = new THREE.Vector3(hang.x + 0.1 * a, hang.y - 0.03 - 4.9 * a * a, hang.z + 0.1 * a); rr = 2.32 + a * 1.5; }
    else {
      const w = a - airT, u = 1 - Math.exp(-w * 1.9);                       // sinks fast then slows (drag)
      const top = new THREE.Vector3(hang.x + 0.03, level - 0.05, hang.z + 0.03);
      rp = top.clone().lerp(ROCK_FLOOR, cl(u * 1.04)); rr = 2.8 + u * 0.9;
    }
  }
  void slow;
  return {level, draft, rp, rr, out};
};

// ---------- materials ----------
// tiles in world space (grout lines), with the water tint and caustics applied below the waterline
const tileMat = (base: string, size: number, axis: 'xz' | 'xy', uLevel: THREE.IUniform, uTime: THREE.IUniform) => {
  const m = new THREE.MeshStandardMaterial({color: base, roughness: 0.35, metalness: 0});
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uLevel = uLevel; sh.uniforms.uTime = uTime;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vW; uniform float uLevel, uTime;\n${NOISE}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 q = ${axis === 'xz' ? 'vW.xz' : 'vW.xy'} / ${size.toFixed(3)};
        vec2 g = abs(fract(q) - 0.5); float grout = smoothstep(0.47, 0.49, max(g.x, g.y));
        float var = wh2(floor(q)) * 0.08;
        diffuseColor.rgb = mix(diffuseColor.rgb * (0.96 + var), vec3(0.72, 0.76, 0.78), grout * 0.85);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        if (vW.y < uLevel) {
          vec2 c2 = vW.xz * 2.2 + vec2(vW.y * 0.7, 0.0); float c = 0.0;
          for (int i = 0; i < 3; i++){ c2 += vec2(sin(c2.y * 1.3 + uTime * 0.9), cos(c2.x * 1.1 - uTime * 0.7)) * 0.6; c += 1.0 / (1.0 + 22.0 * abs(sin(c2.x) * sin(c2.y))); }
          totalEmissiveRadiance += vec3(0.75, 0.95, 1.0) * pow(c / 3.0, 2.4) * 0.9 * diffuseColor.rgb;
        }`)
      .replace('#include <fog_fragment>', `#include <fog_fragment>
        if (vW.y < uLevel) { float d = max(${GLASS.toFixed(2)} - vW.z, 0.0) * 0.55 + (uLevel - vW.y) * 0.8; vec3 tr = exp(-vec3(0.5, 0.13, 0.09) * d);
          gl_FragColor.rgb = gl_FragColor.rgb * vec3(0.78, 0.95, 1.0) * tr + mix(vec3(0.10, 0.55, 0.70), vec3(0.02, 0.22, 0.36), clamp((uLevel - vW.y) / 1.6, 0.0, 1.0)) * (1.0 - tr); }`);
  };
  m.customProgramCacheKey = () => 'tile-' + axis + base;
  return m;
};
// any standard material below the waterline gets the same water tint (rock, hull)
const underTint = (m: THREE.MeshStandardMaterial, uLevel: THREE.IUniform, key: string) => {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uLevel = uLevel;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vW; uniform float uLevel;')
      .replace('#include <fog_fragment>', `#include <fog_fragment>
        if (vW.y < uLevel) { float d = max(${GLASS.toFixed(2)} - vW.z, 0.0) + (uLevel - vW.y) * 0.35; vec3 tr = exp(-vec3(0.42, 0.10, 0.07) * d * 1.6);
          gl_FragColor.rgb = gl_FragColor.rgb * vec3(0.7, 0.9, 0.97) * tr + vec3(0.06, 0.42, 0.58) * (1.0 - tr); }`);
  };
  m.customProgramCacheKey = () => 'under-' + key;
  return m;
};

// the water surface: sky reflection by Fresnel, fine ripples, splash rings from the rock's entry point
const surfaceMat = (env: THREE.Texture, uTime: THREE.IUniform, uSplash: THREE.IUniform, uSplashP: THREE.IUniform) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide,
  uniforms: {uEnv: {value: env}, uTime, uSplash, uSplashP},
  vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: /* glsl */`varying vec3 vW; uniform sampler2D uEnv; uniform float uTime, uSplash; uniform vec2 uSplashP; ${NOISE}
    #include <common>
    #include <cube_uv_reflection_fragment>
    void main(){
      vec2 p = vW.xz; float h = wfbm(p * 3.0 + vec2(uTime * 0.25, uTime * 0.18)) * 0.6 + wfbm(p * 9.0 - uTime * 0.4) * 0.25;
      if (uSplash > 0.0) { float r = length(p - uSplashP); float w = uSplash * 1.1; h += 1.4 * sin((r - w) * 26.0) * exp(-abs(r - w) * 9.0) * exp(-uSplash * 1.1); }
      vec3 dpx = dFdx(vW), dpy = dFdy(vW); vec3 n = vec3(0.0, 1.0, 0.0); vec2 dh = vec2(dFdx(h), dFdy(h)) * 0.04;
      vec3 r1 = cross(dpy, n), r2 = cross(n, dpx); float det = dot(dpx, r1); n = normalize(abs(det) * n - sign(det) * (dh.x * r1 + dh.y * r2));
      vec3 v = normalize(cameraPosition - vW); bool below = cameraPosition.y < vW.y; if (below) n = -n;
      float fr = 0.02 + 0.98 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
      vec3 refl = textureCubeUV(uEnv, reflect(-v, n), 0.05).rgb;
      vec3 deep = vec3(0.05, 0.38, 0.52);
      vec3 col = below ? mix(vec3(0.5, 0.85, 0.95), deep, 0.4) : mix(deep, refl, fr);
      float a = below ? 0.55 : mix(0.45, 0.97, fr);
      gl_FragColor = vec4(col, a);
      #include <colorspace_fragment>
    }`,
});

// ---------- boat: a small rowing dinghy in real units (2.0 m x 0.95 m x 0.42 m), white hull, varnished inside ----------
const hullGeo = (inner: boolean) => {
  const NU = 48, NV = 20, L = 1.0, g = new THREE.BufferGeometry(), pos: number[] = [], idx: number[] = [];
  const s = inner ? 0.95 : 1;
  for (let i = 0; i <= NU; i++) {
    const u = -1 + (2 * i) / NU;                                  // -1 transom, +1 bow
    const half = 0.475 * (u < 0 ? Math.sqrt(1 - 0.55 * u * u) : Math.pow(Math.max(1 - u * u, 0), 0.62)) * s;
    const depth = (0.4 - 0.06 * u * u - (u > 0.6 ? (u - 0.6) * 0.25 : 0)) * s;
    const sheer = 0.06 * u * u + (u > 0 ? 0.05 * u : 0);          // gunwale rises to the bow
    for (let j = 0; j <= NV; j++) {
      const v = -1 + (2 * j) / NV;                                // across, port to starboard
      const y = sheer - depth * (1 - Math.pow(Math.abs(v), 2.2)) * 0.92 - depth * 0.08 * (1 - v * v);
      pos.push(u * L, y + (inner ? 0.012 : 0), v * half);
    }
  }
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
    const a = i * (NV + 1) + j, b = a + NV + 1;
    if (inner) idx.push(a, a + 1, b, b, a + 1, b + 1); else idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
};
const gunwaleGeo = () => {
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 96; k++) {
    const a = (k / 96) * Math.PI * 2, u = Math.cos(a), side = Math.sin(a) >= 0 ? 1 : -1;
    const half = 0.475 * (u < 0 ? Math.sqrt(1 - 0.55 * u * u) : Math.pow(Math.max(1 - u * u, 0), 0.62));
    const sheer = 0.06 * u * u + (u > 0 ? 0.05 * u : 0);
    pts.push(new THREE.Vector3(u, sheer + 0.01, side * half * Math.abs(Math.sin(a)) ** 0.15));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 200, 0.022, 8, true);
};

// ---------- the scene ----------
export const Scene: React.FC<{t: number; fr: number; cam: (t: number) => {p: THREE.Vector3; l: THREE.Vector3; mm: number}}> = ({t, cam}) => {
  const {gl, camera} = useThree();
  const set = useMemo(() => {
    const uLevel = {value: 0}, uTime = {value: 0}, uSplash = {value: -1}, uSplashP = {value: new THREE.Vector2()};
    const pm = new THREE.PMREMGenerator(gl); const sc = new THREE.Scene(); sc.add(new THREE.Mesh(new THREE.SphereGeometry(10, 48, 24), skyDome(SKY)));
    const env = pm.fromScene(sc, 0.01).texture; pm.dispose();
    const floorM = tileMat('#E9F3F6', 0.25, 'xz', uLevel, uTime);
    const wallM = tileMat('#DDEFF5', 0.25, 'xy', uLevel, uTime);
    const sideM = tileMat('#DDEFF5', 0.25, 'xz', uLevel, uTime);
    const hullOut = underTint(new THREE.MeshStandardMaterial({color: '#F4F1EA', roughness: 0.32}), uLevel, 'hull');
    hullOut.side = THREE.FrontSide;
    const hullIn = underTint(new THREE.MeshStandardMaterial({color: '#B9824E', roughness: 0.45}), uLevel, 'hullin');
    hullIn.side = THREE.FrontSide;
    const rim = new THREE.MeshStandardMaterial({color: '#7A4B2A', roughness: 0.5});
    const stripe = new THREE.MeshStandardMaterial({color: '#1F4E79', roughness: 0.4});
    const rg = rockGeo({seed: 11, size: [0.2, 0.15, 0.17], detail: 4, rough: 0.25, cuts: 6});
    const rockM = underTint(new THREE.MeshStandardMaterial({color: '#7E7A73', roughness: 0.85, vertexColors: false}), uLevel, 'rock');
    rockM.onBeforeCompile = ((prev) => (sh: THREE.WebGLProgramParametersWithUniforms, r: THREE.WebGLRenderer) => {
      prev.call(rockM, sh, r);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vO;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvO = position;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vO;\n${NOISE}`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          float n1 = wfbm(vO.xy * 30.0 + vO.z * 17.0), n2 = wn2(vO.yz * 90.0);
          diffuseColor.rgb *= 0.72 + 0.45 * n1 + 0.12 * n2; diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.55, 0.5, 0.44), smoothstep(0.55, 0.8, n1) * 0.4);`);
    })(rockM.onBeforeCompile);
    const glassM = new THREE.MeshPhysicalMaterial({color: '#E6F6F8', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.12, envMap: env, envMapIntensity: 0.6, depthWrite: false});
    const edgeM = new THREE.MeshStandardMaterial({color: '#BFE7EE', roughness: 0.2, emissive: '#6FB6C4', emissiveIntensity: 0.25});
    const deckM = new THREE.MeshStandardMaterial({color: '#CBBBA0', roughness: 0.9});
    const copeM = new THREE.MeshStandardMaterial({color: '#E8E2D6', roughness: 0.7});
    const hedgeM = new THREE.MeshStandardMaterial({color: '#4E7040', roughness: 0.95});
    hedgeM.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vH;').replace('#include <project_vertex>', '#include <project_vertex>\nvH = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vH;\n${NOISE}`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          float lf = wfbm(vH.xy * 7.0 + vH.z * 3.0), cl2 = wfbm(vH.xy * 1.2);
          diffuseColor.rgb *= 0.55 + 0.75 * lf + 0.25 * cl2; diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.45, 0.55, 0.25), smoothstep(0.6, 0.85, lf) * 0.5);`);
    };
    const lineM = new THREE.MeshBasicMaterial({color: RED, toneMapped: false});
    const gapM = new THREE.MeshBasicMaterial({color: RED, transparent: true, opacity: 0, toneMapped: false, depthWrite: false});
    const blockM = new THREE.MeshPhysicalMaterial({color: BLUE, roughness: 0.08, transparent: true, opacity: 0.75, emissive: '#1C8FD8', emissiveIntensity: 0.9, envMap: env, envMapIntensity: 0.9, depthWrite: false});
    const blockEdge = new THREE.LineBasicMaterial({color: '#DFF6FF', transparent: true, opacity: 0.9});
    const ghostM = new THREE.MeshBasicMaterial({color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false, wireframe: false});
    const surface = surfaceMat(env, uTime, uSplash, uSplashP);
    const front = new THREE.MeshBasicMaterial({color: '#2D8FB0', transparent: true, opacity: 0.07, depthWrite: false});
    const meniscus = new THREE.MeshBasicMaterial({color: '#E8FBFF', transparent: true, opacity: 0.8, toneMapped: false});
    const drops = new THREE.MeshStandardMaterial({color: '#E9FAFF', roughness: 0.05, transparent: true, opacity: 0.85, emissive: '#7FD3F0', emissiveIntensity: 0.4});
    const dg = new THREE.SphereGeometry(1, 8, 6);
    const DROPS = Array.from({length: 46}, (_, i) => {
      const a = (i * 2.399) % (Math.PI * 2), sp = 0.9 + ((i * 37) % 11) / 11 * 1.6, up = 1.6 + ((i * 53) % 13) / 13 * 2.0;
      return {vx: Math.cos(a) * sp * 0.6, vz: Math.sin(a) * sp * 0.6, vy: up, r: 0.008 + ((i * 7) % 5) * 0.004};
    });
    const blk = new THREE.BoxGeometry(1, 1, 1);
    const blkEdges = new THREE.EdgesGeometry(blk);
    return {uLevel, uTime, uSplash, uSplashP, env, floorM, wallM, sideM, hullOut, hullIn, rim, stripe, rg, rockM, glassM, edgeM, deckM, copeM, hedgeM,
      lineM, gapM, blockM, blockEdge, ghostM, surface, front, meniscus, drops, dg, DROPS, blk, blkEdges,
      hullO: hullGeo(false), hullI: hullGeo(true), gun: gunwaleGeo(), dome: skyDome(SKY)};
  }, [gl]);

  const s = state(t);
  set.uTime.value = t; set.uLevel.value = s.level;
  const sp = t - T.splash; set.uSplash.value = sp > 0 ? sp : -1; set.uSplashP.value.set(0.5, 0.65);
  const c = cam(t);
  const pc = camera as THREE.PerspectiveCamera;
  pc.position.copy(c.p); pc.setFocalLength(c.mm); pc.lookAt(c.l); pc.near = 0.05; pc.far = 80; pc.updateProjectionMatrix();

  const boatY = s.draft;
  const boatRoll = s.out < 0 && t > T.tipStart ? -0.08 * Math.sin(sm(T.tipStart, T.freeze, t) * Math.PI * 0.5) : (s.out >= 0 ? -0.08 * Math.exp(-s.out * 2) * Math.cos(s.out * 5) : 0);
  const W = HALF_X * 2, D = GLASS - BACK, H = -FLOOR;
  const lvl = s.level;

  // blocks (twin = the rock's own volume as a cube; big = its weight in water, 2.7 x the volume)
  const twin = 0.3, big = twin * Math.cbrt(2.7);
  const wIn = sm(T.weight, T.weight + 0.9, t), sIn = sm(T.size, T.size + 0.9, t), split = sm(T.split, T.split + 1.0, t), less = sm(T.less, T.less + 1.0, t);
  const bigPos = new THREE.Vector3(1.12, lvl + lerp(-big / 2, big / 2 + 0.05, wIn), 0.55);
  const twinPos = new THREE.Vector3(ROCK_FLOOR.x + 0.42, lerp(FLOOR - twin, FLOOR + twin / 2 + 0.005, sIn), ROCK_FLOOR.z);
  // the split: the big block becomes three rock-size twins side by side; then two of them melt back into the pool
  const splitPos = (k: number) => new THREE.Vector3(bigPos.x + (k - 1) * (twin + 0.06) * split, bigPos.y - (big - twin) / 2 * split, bigPos.z);

  return (
    <>
      <mesh geometry={new THREE.SphereGeometry(40, 32, 16)} material={set.dome} />
      <hemisphereLight args={['#CFE6FF', '#B5A88E', 0.9]} />
      <directionalLight position={[SKY.sunDir.x * 10, SKY.sunDir.y * 10, SKY.sunDir.z * 10]} intensity={2.6} color={'#FFF1DC'} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-bias={-0.0004} />
      {/* pool shell */}
      <mesh position={[0, FLOOR, 0]} rotation={[-Math.PI / 2, 0, 0]} material={set.floorM} ><planeGeometry args={[W, D + 0.2]} /></mesh>
      <mesh position={[0, (FLOOR + 0.3) / 2, BACK]} material={set.wallM}><planeGeometry args={[W, H + 0.3]} /></mesh>
      <mesh position={[-HALF_X, (FLOOR + 0.3) / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={set.wallM}><planeGeometry args={[D + 0.2, H + 0.3]} /></mesh>
      <mesh position={[HALF_X, (FLOOR + 0.3) / 2, 0]} rotation={[0, -Math.PI / 2, 0]} material={set.wallM}><planeGeometry args={[D + 0.2, H + 0.3]} /></mesh>
      {/* coping, deck, hedge behind */}
      <mesh position={[0, 0.34, BACK - 0.2]} material={set.copeM} castShadow receiveShadow><boxGeometry args={[W + 1.2, 0.08, 0.5]} /></mesh>
      <mesh position={[0, 0.3, BACK - 4]} rotation={[-Math.PI / 2, 0, 0]} material={set.deckM} receiveShadow><planeGeometry args={[30, 7.6]} /></mesh>
      {Array.from({length: 13}, (_, i) => -13 + i * 2.15).map((x, i) => <mesh key={i} position={[x, 0.55 + (i % 3) * 0.12, BACK - 7 - (i % 2) * 0.5]} scale={[1.3, 0.85 + (i % 4) * 0.06, 1]} material={set.hedgeM}><sphereGeometry args={[1.0, 20, 10]} /></mesh>)}
      {/* glass front: pane, top edge, frame posts */}
      <mesh position={[0, (FLOOR + 0.36) / 2, GLASS]} material={set.glassM} renderOrder={5}><planeGeometry args={[W, H + 0.36]} /></mesh>
      <mesh position={[0, 0.36, GLASS]} material={set.edgeM}><boxGeometry args={[W, 0.02, 0.03]} /></mesh>
      <mesh position={[0, FLOOR - 0.02, GLASS]} material={set.copeM}><boxGeometry args={[W + 0.4, 0.06, 0.12]} /></mesh>
      {/* the water: surface, the face against the glass, the bright meniscus line on the glass */}
      <mesh position={[0, lvl, 0]} rotation={[-Math.PI / 2, 0, 0]} material={set.surface} renderOrder={3}><planeGeometry args={[W, D, 1, 1]} /></mesh>
      <mesh position={[0, (FLOOR + lvl) / 2, GLASS - 0.01]} material={set.front} renderOrder={4}><planeGeometry args={[W, lvl - FLOOR]} /></mesh>
      <mesh position={[0, lvl, GLASS - 0.004]} material={set.meniscus} renderOrder={6}><planeGeometry args={[W, 0.012]} /></mesh>
      {/* the red waterline marked on the glass (draws on from the left), and the glowing gap once the water falls */}
      {(() => {
        const draw = sm(B.mark - 0.1, B.mark + 0.9, t);
        const gap = sm(T.splash + 0.6, T.splash + 1.8, t) * (1 - 0.35 * sm(T.weight, T.weight + 1, t)) + 0.35 * sm(T.bob, T.bob + 0.8, t);
        set.gapM.opacity = 0.32 * cl(gap);
        return <>
          {draw > 0 && <mesh position={[-HALF_X + (W * draw) / 2, 0, GLASS + 0.006]} material={set.lineM} renderOrder={7}><planeGeometry args={[W * draw, 0.022]} /></mesh>}
          {gap > 0 && lvl < -0.005 && <mesh position={[0, lvl / 2, GLASS + 0.004]} material={set.gapM} renderOrder={7}><planeGeometry args={[W, -lvl]} /></mesh>}
        </>;
      })()}
      {/* boat */}
      <group position={[BOAT_X, boatY, BOAT_Z]} rotation={[boatRoll, 0.28, 0]}>
        <mesh geometry={set.hullO} material={set.hullOut} castShadow />
        <mesh geometry={set.hullI} material={set.hullIn} />
        <mesh geometry={set.gun} material={set.rim} castShadow />
        <mesh position={[0.15, -0.12, 0]} material={set.rim} castShadow><boxGeometry args={[0.2, 0.03, 0.84]} /></mesh>
        <mesh position={[-0.6, -0.1, 0]} material={set.rim} castShadow><boxGeometry args={[0.22, 0.03, 0.72]} /></mesh>
        <mesh position={[0.02, -0.03, 0.47]} rotation={[0.04, 0, 0]} material={set.stripe}><boxGeometry args={[1.5, 0.035, 0.012]} /></mesh>
        <mesh position={[0.02, -0.03, -0.47]} rotation={[-0.04, 0, 0]} material={set.stripe}><boxGeometry args={[1.5, 0.035, 0.012]} /></mesh>
      </group>
      {/* rock: carried with the boat while aboard */}
      <mesh geometry={set.rg} material={set.rockM} castShadow
        position={t < T.tipStart ? [s.rp.x, s.rp.y + boatY, s.rp.z] : [s.rp.x, s.rp.y + (t < T.freeze ? boatY * (1 - sm(T.tipStart, T.freeze, t)) : 0), s.rp.z]}
        rotation={[s.rr * 0.6, s.rr * 0.25, s.rr]} />
      {/* splash droplets: ballistic from the entry point for 0.9 s */}
      {sp > 0 && sp < 0.9 && set.DROPS.map((d, i) => {
        const y = lvl + d.vy * sp - 4.9 * sp * sp; if (y < lvl) return null;
        return <mesh key={i} geometry={set.dg} material={set.drops} position={[0.5 + d.vx * sp, y, 0.65 + d.vz * sp]} scale={d.r} />;
      })}
      {/* water blocks */}
      {wIn > 0 && split < 0.02 && <Block geo={set.blk} edges={set.blkEdges} m={set.blockM} e={set.blockEdge} p={bigPos} s={big} o={wIn} />}
      {split >= 0.02 && [0, 1, 2].map((k) => {
        const melt = k === 1 ? 0 : less;
        const p = splitPos(k); p.y = lerp(p.y, lvl - twin * 0.55, melt);
        return <Block key={k} geo={set.blk} edges={set.blkEdges} m={set.blockM} e={set.blockEdge} p={p} s={lerp(twin, twin * 0.92, melt)} o={1 - melt * 0.95} />;
      })}
      {sIn > 0 && <Block geo={set.blk} edges={set.blkEdges} m={set.blockM} e={set.blockEdge} p={twinPos} s={twin} o={sIn} />}
    </>
  );
};

const Block: React.FC<{geo: THREE.BufferGeometry; edges: THREE.BufferGeometry; m: THREE.Material; e: THREE.LineBasicMaterial; p: THREE.Vector3; s: number; o: number}> = ({geo, edges, m, e, p, s, o}) => {
  m.opacity = 0.75 * o; e.opacity = 0.9 * o;
  return <group position={p} scale={s}><mesh geometry={geo} material={m} renderOrder={8} /><lineSegments geometry={edges} material={e} renderOrder={9} /></group>;
};
