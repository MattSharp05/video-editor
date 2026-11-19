// One world: a road at the edge of a field, and the ground under it sliced open at z = 0.
//  - the cut face: a vertical plane whose shader draws the layers (asphalt, clay, limestone with joints), the widened
//    cracks (acid-lit while they dissolve) and discards the open void so the 3D void behind it shows;
//  - the void interior: dark rock shells behind the face (the clay dome, the limestone opening, the hole after the fall);
//  - above ground: realism kit sky, sun, grass, trees, the road, the sedan; the ground in front of the cut (hook only)
//    vanishes behind the scan line;
//  - particles: rain, CO2 motes, acid beads seeping down the face, grains crumbling from the void's ceiling, dust.
// Built once in useMemo; per frame only uniforms, transforms and instance matrices change, all from timeline.ts.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {random} from 'remotion';
import {skyLight, makeSky} from './kit/realism/sky.ts';
import {makeSun} from './kit/realism/sun.ts';
import {scatter, instances, tuft, tree, leafCard} from './kit/realism/plants.ts';
import {patch, wind, air, time, type Patch} from './kit/realism/shade.ts';
import * as TL from './timeline';

export type Assets = {car: GLTF};
const col = (h: string) => new THREE.Color(h);
const EXPO = 0.11;

const NOISE = /* glsl */ `
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float fbm3(vec2 p){ return 0.57 * vn(p) + 0.29 * vn(p * 2.03 + 1.7) + 0.14 * vn(p * 4.1 + 9.2); }`;
// Kept cheap on purpose: every noise call runs per pixel of a full-screen plane on a CPU renderer (v1 of this shader,
// with 5-octave fbm called ~20 times per pixel, cost ~11 s a frame).

// the void's half-width at the cut face for a void of height h: narrow while low, the full radius once tall
export const voidW = (h: number) => TL.VOID_R * (0.45 + 0.55 * Math.min(1, Math.max(0, h / 8.5)));
const FACE_SDF = /* glsl */ `
uniform float uCave; uniform float uTop; uniform float uPile; uniform float uGlow; uniform float uCrack; uniform float uW;
float jointD(vec2 p){
  float col = floor(p.x / 3.3 + 0.5), ph = h21(vec2(col, 3.1)) * 6.28, am = 0.25 + 0.35 * h21(vec2(col, 7.7));
  float x = p.x + am * sin(p.y * 0.23 + ph) + 0.12 * sin(p.y * 1.7 + ph * 2.0) + (h21(vec2(col, 1.3)) - 0.5) * 1.2;
  return abs(fract(x / 3.3 + 0.5) - 0.5) * 3.3;
}
float caveSdf(vec2 p){
  if (uCave < 0.01) return 9.0;
  vec2 r = vec2(2.6, 1.5) * uCave + 0.02;
  vec2 q = (p - vec2(0.0, ${TL.CAVE_Y.toFixed(2)})) / r;
  return (length(q) - 1.0) * min(r.x, r.y) + (vn(p * 1.3) - 0.5) * 0.8 * uCave;
}
float jointSdf(vec2 p){
  if (p.y > -11.0 || p.y < -24.0) return 9.0;
  float jw = 0.05 + 0.2 * uCave * smoothstep(-21.0, -12.0, p.y) * (1.0 - smoothstep(3.0, 8.0, abs(p.x)));
  return jointD(p) - jw;
}
float domeSdf(vec2 p){
  float hgt = uTop + 11.0; if (hgt < 0.05) return 9.0;
  float k = (p.y + 11.0) / hgt; if (k < 0.0 || k > 1.0) return 9.0;
  return abs(p.x) - uW * sqrt(max(1.0 - k * k, 0.0)) - (vn(p * 2.2) - 0.5) * 0.25;
}
float gFront, gLines, gRim;`;

const faceMaterial = () => {
  const m = new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.95});
  const U = {uCave: {value: 1}, uTop: {value: -2.6}, uPile: {value: 0}, uGlow: {value: 0}, uCrack: {value: 0}, uW: {value: TL.VOID_R}};
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vFW;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvFW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vFW;\n${NOISE}\n${FACE_SDF}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 p = vFW.xy;
        float dC = caveSdf(p), dD = domeSdf(p);
        bool inPile = dD < 0.0 && p.y < -11.0 + uPile * (1.0 - abs(p.x) / max(uW, 0.1));
        if ((dC < 0.0) || (dD < 0.0 && !inPile)) discard;
        vec3 c;
        float n = fbm3(p * vec2(0.6, 1.4)), n2 = vn(p * 3.0 + 7.0);
        if (p.y > -0.25) c = vec3(0.10, 0.10, 0.11) * (0.8 + 0.4 * n2);                      // asphalt
        else if (p.y > -0.6) c = vec3(0.55, 0.52, 0.47) * (0.75 + 0.5 * n2);                // road base gravel
        else if (p.y > -11.0) {                                                              // clay with some sand
          float band = 0.5 + 0.5 * sin(p.y * 2.1 + n * 4.0);
          c = mix(vec3(0.30, 0.15, 0.08), vec3(0.50, 0.30, 0.15), band * 0.6 + n * 0.4);
          c *= 0.85 + 0.3 * n2;
          float peb = smoothstep(0.86, 0.9, vn(p * 4.0)); c = mix(c, vec3(0.62, 0.58, 0.52), peb * 0.7);
          c = mix(c, vec3(0.30, 0.16, 0.09), smoothstep(-1.4, -0.6, p.y) * 0.4);
        } else {                                                                             // limestone
          c = vec3(0.48, 0.46, 0.40) * (0.82 + 0.3 * n);
          float bed = smoothstep(0.46, 0.5, abs(fract(p.y / 2.4) - 0.5)); c *= 1.0 - 0.25 * bed;
          float jd = jointSdf(p); c = mix(c, vec3(0.16, 0.10, 0.06), 1.0 - smoothstep(-0.02, 0.04, jd));
          gLines = uGlow * 0.7 * (1.0 - smoothstep(-0.05, 0.12, jd)) * (1.0 - smoothstep(3.0, 10.0, abs(p.x)));
        }
        float rim = min(abs(dC), abs(dD)); c *= 0.45 + 0.55 * smoothstep(0.0, 0.35, rim);
        gFront = uGlow * (1.0 - smoothstep(0.0, 0.45, dC)) * step(p.y, -10.6);
        gRim = (1.0 - smoothstep(0.0, 0.25, abs(dD))) * step(dD, 9.0);
        if (inPile) c = vec3(0.45, 0.28, 0.16) * (0.7 + 0.5 * n2);
        diffuseColor.rgb = c;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        {
          vec2 p = vFW.xy;
          totalEmissiveRadiance += vec3(0.72, 0.95, 0.36) * (gFront * 2.2 + gLines * 1.2);  // acid at work (lime)
          totalEmissiveRadiance += vec3(1.0, 0.71, 0.28) * gRim * 0.5;                      // the void's edge (amber)
          float ck = uCrack * step(-0.6, p.y) * (1.0 - smoothstep(0.0, 0.05, abs(fract(p.x * 0.9 + 0.3 * sin(p.y * 9.0)) - 0.5) - 0.42)) * (1.0 - smoothstep(2.0, 4.0, abs(p.x)));
          totalEmissiveRadiance += vec3(1.0, 0.35, 0.3) * ck * 2.0;                         // cracks before the fall
        }`).replace('void main() {', 'void main() {\n  gFront = 0.0; gLines = 0.0; gRim = 0.0;');
  };
  m.customProgramCacheKey = () => 'face';
  return {m, U};
};

// ground surface (z < 0): the road with lane lines, grass margins; a hole after the fall; coral cracks before it
const groundMaterial = (U: Record<string, THREE.IUniform>, front: boolean) => {
  const m = new THREE.MeshPhysicalMaterial({color: 0xffffff, roughness: 0.9, specularIntensity: 0.3});
  const P: Patch = {
    key: front ? 'groundFront' : 'ground',
    uniforms: U,
    vertexPars: 'varying vec3 vGW;',
    vertex: [{at: 'project_vertex', before: true, code: 'vGW = (modelMatrix * vec4(transformed, 1.0)).xyz;'}],
    fragmentPars: `varying vec3 vGW; uniform float uScanZ; uniform float uOpen; uniform float uCrack; uniform float uHole; ${NOISE}`,
    fragment: [{at: 'color_fragment', code: `{
      vec2 g = vGW.xz;
      ${front ? 'if (g.y < uScanZ) discard;' : 'if (uOpen > 0.5 && length(g) < uHole + (vn(g * 2.0) - 0.5) * 0.35) discard;'}
      float road = step(${TL.ROAD_Z[0].toFixed(2)}, g.y) * step(g.y, ${TL.ROAD_Z[1].toFixed(2)});
      float n = vn(g * 0.8), n2 = vn(g * 6.0);
      vec3 grass = mix(vec3(0.22, 0.30, 0.10), vec3(0.33, 0.36, 0.14), n) * (0.8 + 0.3 * n2);
      vec3 asph = vec3(0.13, 0.13, 0.14) * (0.85 + 0.3 * n2);
      float mid = (1.0 - smoothstep(0.06, 0.09, abs(g.y - (-4.0)))) * step(0.5, fract(g.x / 6.0));
      float edge = (1.0 - smoothstep(0.06, 0.09, abs(g.y - (-7.1)))) + (1.0 - smoothstep(0.06, 0.09, abs(g.y - (-0.9))));
      asph = mix(asph, vec3(0.85, 0.75, 0.35), mid * 0.85); asph = mix(asph, vec3(0.85), edge * 0.8);
      diffuseColor.rgb = mix(grass, asph, road);
    }`}],
  };
  if (!front) P.fragment!.push({at: 'emissivemap_fragment', code: `{
      vec2 g = vGW.xz; float r = length(g), a = atan(g.y, g.x);
      float rays = 1.0 - smoothstep(0.0, 0.06, abs(fract(a * 2.2 + 0.4 * sin(r * 1.7)) - 0.5) - 0.44);
      float ring = 1.0 - smoothstep(0.0, 0.08, abs(r - uHole + 0.3 * sin(a * 7.0)));
      float reach = smoothstep(uCrack * (uHole + 1.0), uCrack * (uHole + 1.0) - 0.6, r);
      totalEmissiveRadiance += vec3(1.0, 0.35, 0.3) * uCrack * max(rays * reach * 1.4, ring * step(0.6, uCrack) * 2.0);
    }`});
  return patch(m, P, air());
};

const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3();
const setI = (im: THREE.InstancedMesh, i: number, x: number, y: number, z: number, s = 1, sy = s) => im.setMatrixAt(i, M4.compose(V.set(x, y, z), Q, S.set(s, sy, s)));
const instanced = (g: THREE.BufferGeometry, m: THREE.Material, n: number) => { const im = new THREE.InstancedMesh(g, m, n); im.frustumCulled = false; im.count = 0; return im; };

export const Scene: React.FC<{t: number; assets: Assets; off?: string[]}> = ({t, assets, off = []}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.localClippingEnabled = true;
    const behindCut = [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)]; // void meshes stop at the cut face (z <= 0)
    const opts = {elevation: 38, azimuth: 315, turbidity: 3, rayleigh: 1.5, ground: '#4d5a30', visibility: 9000, hazeHeight: 80};
    const L = skyLight(gl, opts);
    const sky = makeSky(opts); sky.scale.setScalar(3000); scene.add(sky);
    const sun = makeSun({direction: L.sunDir, color: L.sunColor, intensity: L.sunIntensity, center: new THREE.Vector3(0, -4, -6), radius: 30, mapSize: 2048, distance: 90});
    scene.add(sun, sun.target);
    scene.add(new THREE.HemisphereLight(L.skyIrradiance.clone(), col('#5a5040').multiplyScalar(L.skyIrradiance.r), 1));
    // a warm lamp inside the void so its walls read (very dim)
    const voidLamp = new THREE.PointLight(col('#ffcf9a'), 60, 22, 2); voidLamp.position.set(0, -7, -2.5); scene.add(voidLamp);

    const GU = {uScanZ: {value: -1}, uOpen: {value: 0}, uCrack: {value: 0}, uHole: {value: TL.HOLE_R}};
    // ground behind the cut (with the road) and in front of it (hook only)
    const back = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), groundMaterial(GU, false)); back.rotation.x = -Math.PI / 2; back.position.z = -200; back.receiveShadow = true; scene.add(back);
    const frontG = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), groundMaterial(GU, true)); frontG.rotation.x = -Math.PI / 2; frontG.position.z = 100; frontG.receiveShadow = true; scene.add(frontG);
    // the cut face
    const F = faceMaterial();
    const face = new THREE.Mesh(new THREE.PlaneGeometry(120, 60, 1, 1), F.m); face.position.set(0, -30, 0); face.receiveShadow = true; scene.add(face);
    // the void interior, behind the face: a dark rock dome (scaled per frame), the limestone opening, and the open shaft after the fall
    const rock = new THREE.MeshStandardMaterial({color: col('#3b2a1e'), roughness: 1, side: THREE.BackSide, clippingPlanes: behindCut});
    const domeGeo = new THREE.LatheGeometry(Array.from({length: 17}, (_, i) => { const k = i / 16; return new THREE.Vector2(Math.sqrt(Math.max(1 - k * k, 0)) * 1.06 + 0.001, k); }), 40);
    const dome = new THREE.Mesh(domeGeo, rock); dome.position.y = TL.COVER_BOTTOM; scene.add(dome);
    const cave = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.MeshStandardMaterial({color: col('#4a4438'), roughness: 1, side: THREE.BackSide, clippingPlanes: behindCut}));
    cave.position.y = TL.CAVE_Y; scene.add(cave);
    const voidFloor = new THREE.Mesh(new THREE.CircleGeometry(1.06, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({color: col('#4a3020'), roughness: 1, clippingPlanes: behindCut}));
    voidFloor.position.y = TL.COVER_BOTTOM + 0.02; scene.add(voidFloor);
    // the rubble cone on the void floor
    const pile = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1, 32, 1, true), new THREE.MeshStandardMaterial({color: col('#6b4a30'), roughness: 1, clippingPlanes: behindCut}));
    scene.add(pile);
    // the plug: a half-disc of road and soil, 1 m thick (the face cuts it at z = 0)
    const plugTop = new THREE.Mesh(new THREE.CircleGeometry(TL.HOLE_R, 40, 0, Math.PI).rotateX(-Math.PI / 2) /* the half behind the cut (z < 0) */, groundMaterial({uScanZ: {value: -1}, uOpen: {value: 0}, uCrack: {value: 0}, uHole: {value: 0}}, false));
    const plugSide = new THREE.Mesh(new THREE.CylinderGeometry(TL.HOLE_R, TL.HOLE_R * 0.8, 1.0, 40, 1, true, Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({color: col('#5a3a24'), roughness: 1, side: THREE.DoubleSide}));
    plugSide.position.y = -0.5;
    const plugFront = new THREE.Mesh(new THREE.PlaneGeometry(TL.HOLE_R * 2, 1.0), new THREE.MeshStandardMaterial({color: col('#5a3a24'), roughness: 1}));
    plugFront.position.set(0, -0.5, 0.01);
    const plug = new THREE.Group(); plug.add(plugTop, plugSide, plugFront); scene.add(plug);
    // grass, trees (behind the road), and in front of the cut (vanishes with the scan)
    const grassMat = patch(new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.85, side: THREE.DoubleSide}), wind({amp: 1.1}), {
      key: 'scanGrass', uniforms: GU, vertexPars: 'uniform float uScanZ; varying float vSZ;',
      vertex: [{at: 'project_vertex', before: true, code: '{ vec4 sw = modelMatrix * instanceMatrix * vec4(transformed, 1.0); vSZ = sw.z; }'}],
      fragmentPars: 'uniform float uScanZ; varying float vSZ;', fragment: [{at: 'color_fragment', code: 'if (vSZ > 0.2 && vSZ < uScanZ) discard;'}],
    }, air());
    const spotsB = scatter({seed: 7, count: 12000, bounds: [-40, -45, 40, -8.2], scale: [0.35, 0.6], density: (x, z) => Math.max(0.15, Math.exp(-(x * x + (z + 10) ** 2) / 800))});
    const spotsF = scatter({seed: 8, count: 9000, bounds: [-20, 0.4, 20, 30], scale: [0.45, 0.75], density: (x, z) => Math.max(0.1, Math.exp(-(x * x + (z - 12) ** 2) / 300))});
    const gcol = (s: {r: number}) => new THREE.Color().setHSL(0.22 + 0.05 * s.r, 0.45, 0.3 + 0.1 * s.r);
    // grass is ~95 % of the frame cost on the CPU (measured: 6 frames 87 s with, 29 s without); the near field is only
    // drawn until the scan has swept it away
    const grassB = instances(tuft({seed: 4, blades: 6}), grassMat, spotsB, {shadows: false, color: gcol});
    const grassF = instances(tuft({seed: 5, blades: 6}), grassMat, spotsF, {shadows: false, color: gcol});
    if (!off.includes('grass')) scene.add(grassB, grassF);
    if (off.includes('shadow')) gl.shadowMap.enabled = false;
    if (off.includes('trees')) scene.userData.noTrees = true;
    const leafTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
      for (let i = 0; i < 9; i++) {
        const a = random('la' + i) * Math.PI * 2, r = 18 + random('lr' + i) * 26, x = 64 + Math.cos(a) * r * 0.9, y = 64 + Math.sin(a) * r * 0.9;
        g.save(); g.translate(x, y); g.rotate(a + 1.2); const l = 0.75 + 0.5 * random('ll' + i);
        g.fillStyle = `hsl(${92 + random('lh' + i) * 20}, 45%, ${30 + random('lv' + i) * 18}%)`;
        g.beginPath(); g.ellipse(0, 0, 9 * l, 20 * l, 0, 0, Math.PI * 2); g.fill(); g.restore();
      }
      const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
    })();
    const leafMat = patch(new THREE.MeshStandardMaterial({map: leafTex, roughness: 0.8, side: THREE.DoubleSide, alphaTest: 0.5}), wind({sway: 0.05, flutter: 0.02}), air());
    const leafDepth = new THREE.MeshDepthMaterial({map: leafTex, alphaTest: 0.5});
    const woodMat = patch(new THREE.MeshStandardMaterial({color: col('#4a3a2c'), roughness: 0.9}), air());
    for (const [x, z, h, seed] of [[-16, -16, 11, 1], [9, -19, 12, 2], [22, -14, 9, 3], [-6, -28, 10, 4], [-28, -22, 12, 5]] as const) {
      const tr = tree({seed: seed * 11, height: h, leaves: 1400});
      const wood = new THREE.Mesh(tr.wood, woodMat); wood.position.set(x, 0, z); wood.castShadow = true; scene.add(wood);
      scene.add(instances(leafCard(1.1), leafMat, tr.leaves.map((l) => ({...l, x: l.x + x, z: l.z + z})), {depth: leafDepth, color: (s) => new THREE.Color().setHSL(0.22, 0.2, 0.8 + 0.2 * s.r)}));
    }
    // the sedan, 4.9 m, along +x
    const carRoot = assets.car.scene.clone(true);
    const bb = new THREE.Box3().setFromObject(carRoot); const sz = bb.getSize(new THREE.Vector3());
    const along = sz.x >= sz.z ? 'x' : 'z';
    const k = 4.9 / Math.max(sz.x, sz.z);
    carRoot.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
    const carIn = new THREE.Group(); carIn.add(carRoot); carIn.scale.setScalar(k); if (along === 'z') carIn.rotation.y = Math.PI / 2;
    const car = new THREE.Group(); car.add(carIn); scene.add(car);
    carRoot.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; m.castShadow = true; const mt = (m.material as THREE.MeshStandardMaterial); if (mt && 'envMap' in mt) { mt.envMap = L.envMap; mt.envMapIntensity = 0.8; } });

    // particles
    const tex = glowTex();
    const rain = instanced(new THREE.BoxGeometry(0.035, 0.9, 0.035), new THREE.MeshBasicMaterial({color: col(TL.RAIN), transparent: true, opacity: 0.55, toneMapped: false, depthWrite: false}), 900);
    const co2 = instanced(new THREE.PlaneGeometry(0.22, 0.22), new THREE.MeshBasicMaterial({map: tex, color: col('#F2F6FF'), transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}), 260);
    const beads = instanced(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({color: col(TL.LIME), toneMapped: false}), 420);
    const beadGlow = instanced(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({map: tex, color: col(TL.LIME), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}), 420);
    const grains = instanced(new THREE.IcosahedronGeometry(0.09, 0), new THREE.MeshStandardMaterial({color: col('#c49a62'), roughness: 1, emissive: col('#5a3a10')}), 220);
    const dust = instanced(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({map: tex, color: col('#b89a78'), transparent: true, opacity: 0.35, depthWrite: false}), 140);
    scene.add(rain, co2, beads, beadGlow, grains, dust);
    // arch: amber stone blocks along the dome's underside (built for the dome height during the arch beat)
    const arch = new THREE.Group(); scene.add(arch);
    const archTop = -8.6, NB = 9, AW = voidW(archTop + 11);
    for (let i = 0; i < NB; i++) {
      const a0 = (i / NB) * Math.PI, a1 = ((i + 1) / NB) * Math.PI, am = (a0 + a1) / 2;
      const ell = (a: number, s: number) => new THREE.Vector2(Math.cos(a) * AW * s, TL.COVER_BOTTOM + Math.sin(a) * (archTop + 11) * s);
      const sh = new THREE.Shape([ell(a0, 1.02), ell(a1, 1.02), ell(a1, 1.5), ell(a0, 1.5)].map((v) => v.clone().lerp(ell(am, 1.26), 0.06)));
      const blk = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({color: col('#F2D7A6'), transparent: true, opacity: 0.0, toneMapped: false, depthWrite: false}));
      blk.position.z = 0.05; blk.userData.i = i; arch.add(blk);
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ShapeGeometry(sh)), new THREE.LineBasicMaterial({color: col('#FFE2A8'), transparent: true, opacity: 0, toneMapped: false}));
      edge.position.z = 0.06; arch.add(edge);
    }
    return {grassF, sky, F, GU, face, dome, cave, voidFloor, pile, plug, car, rain, co2, beads, beadGlow, grains, dust, arch, voidLamp};
  }, [gl, scene, assets, off.join()]);

  // ======================================================== per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.1; cam.far = 5000;
  cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  W.sky.position.copy(cam.position);
  gl.toneMappingExposure = EXPO;
  time.value = t;

  const open = TL.collapse(t) > 0 ? 1 : 0;
  const top = TL.domeTop(t), cv = TL.caveK(t);
  const hgt = top - TL.COVER_BOTTOM, vw = voidW(hgt);
  const FU = W.F.U; FU.uCave.value = cv; FU.uTop.value = top; FU.uW.value = vw; FU.uPile.value = TL.pileH(t); FU.uGlow.value = TL.dissolveGlow(t); FU.uCrack.value = open ? 0 : TL.cracks(t);
  W.grassF.visible = TL.scanZ(t) < 38;
  W.GU.uScanZ.value = TL.scanZ(t); W.GU.uOpen.value = open; W.GU.uCrack.value = open ? 0 : TL.cracks(t);
  // void interior
  W.dome.visible = hgt > 0.05; W.dome.scale.set(vw, Math.max(hgt, 0.01), vw);
  W.voidFloor.visible = hgt > 0.05; W.voidFloor.scale.setScalar(vw);
  W.cave.visible = cv > 0.02; W.cave.scale.set(3.1 * cv + 0.01, 1.7 * cv + 0.01, 2.6 * cv + 0.01);
  const ph = TL.pileH(t); W.pile.visible = ph > 0.05; W.pile.scale.set(vw, Math.max(ph, 0.01), vw); W.pile.position.y = TL.COVER_BOTTOM + ph / 2;
  W.voidLamp.intensity = hgt > 0.3 || open ? 60 : 0;
  // the plug and the car
  const drop = TL.plugDrop(t);
  W.plug.visible = !!open; W.plug.position.y = -drop; W.plug.rotation.z = 0.12 * TL.collapse(t); W.plug.rotation.x = -0.06 * TL.collapse(t);
  W.car.visible = TL.carOn(t) > 0.5;
  W.car.position.set(TL.carX(t), -drop + (open ? 0.5 * TL.collapse(t) : 0), -2.3 + (open ? 0.6 * TL.collapse(t) : 0)); W.car.rotation.z = open ? 0.3 * TL.collapse(t) : 0; W.car.rotation.x = open ? -0.12 * TL.collapse(t) : 0;
  // rain streaks over the scene (in front of and above the cut)
  const rOn = TL.rainOn(t); let n = 0;
  const rc = new THREE.Color(TL.RAIN).lerp(new THREE.Color(TL.LIME), TL.acidTint(t) * 0.85);
  (W.rain.material as THREE.MeshBasicMaterial).color.copy(rc);
  if (rOn > 0.01) for (let i = 0; i < 900; i++) {
    const x = (random('rx' + i) - 0.5) * 34, z = -14 + random('rz' + i) * 30, ph0 = random('rp' + i);
    const y = 16 - (((t * 1.1 + ph0) % 1) * 17);
    if (random('ro' + i) > rOn) continue;
    setI(W.rain, n++, x, y, z);
  }
  W.rain.count = n; W.rain.instanceMatrix.needsUpdate = true;
  // CO2 motes: drifting in the air and topsoil (the drops gather them)
  const co = TL.co2On(t); n = 0;
  if (co > 0.01) for (let i = 0; i < 260; i++) {
    const x = (random('cx' + i) - 0.5) * 28, y = -1.6 + random('cy' + i) * 6 + 0.3 * Math.sin(t * 0.8 + i), z = 0.12 + (i % 3 === 0 ? 0 : random('cz' + i) * 10);
    setI(W.co2, n++, x + 0.4 * Math.sin(t * 0.5 + i * 1.7), y, z, co);
  }
  W.co2.count = n; W.co2.instanceMatrix.needsUpdate = true;
  // acid beads seeping down the face: through the clay, then down the joints in the limestone
  const sp = TL.seepOn(t); n = 0;
  if (sp > 0.01) for (let i = 0; i < 420; i++) {
    const u = (t * 0.09 + random('bp' + i)) % 1;     // 0 at the surface, 1 at -21 m
    const y = -0.6 - u * 20.4;
    let x = (random('bx' + i) - 0.5) * 22;
    if (y < -11) { const jx = Math.round(x / 3.3) * 3.3; x = jx - 1.1 * Math.sin(y * 0.37) - 0.6 * Math.sin(y * 1.3); }
    if (random('bo' + i) > sp) continue;
    setI(W.beads, n, x, y, 0.1); setI(W.beadGlow, n, x, y, 0.12); n++;
  }
  W.beads.count = W.beadGlow.count = n; W.beads.instanceMatrix.needsUpdate = W.beadGlow.instanceMatrix.needsUpdate = true;
  // grains crumbling from the void's ceiling onto the floor (in the void, just behind the face)
  const gr = TL.grainsOn(t); n = 0;
  if (gr > 0.01 && hgt > 0.3) for (let i = 0; i < 220; i++) {
    const per = 0.9 + random('gp' + i) * 0.8, u = ((t + random('gt' + i) * per) % per) / per;
    const fx = (random('gx' + i) - 0.5) * 2, fz = -0.3 - random('gz' + i) * 2.5;
    const w = voidW(hgt) * Math.sqrt(Math.max(1 - fx * fx, 0)) * 0.95;
    const ky = Math.sqrt(Math.max(1 - (fx * fx), 0));
    const y0 = TL.COVER_BOTTOM + hgt * ky * 0.97, y1 = TL.COVER_BOTTOM + TL.pileH(t) * (1 - Math.abs(fx)) + 0.1;
    const y = y0 - (y0 - y1) * u * u;
    if (random('go' + i) > gr) continue;
    setI(W.grains, n++, fx * w * 0.9, y, fz, 1 + random('gs' + i) * 1.5);
  }
  W.grains.count = n; W.grains.instanceMatrix.needsUpdate = true;
  // dust after the fall
  const du = TL.dust(t); n = 0;
  if (du > 0.01) for (let i = 0; i < 140; i++) {
    const age = t - TL.B.drops - 0.9, a = random('da' + i) * Math.PI * 2, r = (0.5 + random('dr' + i) * 4.5) * (0.4 + Math.min(age, 3) * 0.5);
    const y = -6 + random('dy' + i) * 6 + Math.min(age, 3) * (1 + random('du' + i) * 2.5);
    const s = (2 + random('ds' + i) * 3) * (0.6 + Math.min(age, 3) * 0.4);
    W.dust.setMatrixAt(n++, M4.compose(V.set(Math.cos(a) * r, y, -Math.abs(Math.sin(a)) * r + 0.5), cam.quaternion, S.set(s, s, s)));
  }
  W.dust.count = n; W.dust.instanceMatrix.needsUpdate = true; (W.dust.material as THREE.MeshBasicMaterial).opacity = 0.4 * du;
  // arch blocks
  const ao = TL.archOn(t);
  W.arch.visible = ao > 0.01;
  W.arch.children.forEach((m) => {
    const isEdge = (m as THREE.LineSegments).isLineSegments;
    const i = (m.userData.i ?? 0) as number;
    ((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = isEdge ? ao : 0.55 * ao * (0.85 + 0.15 * Math.sin(t * 3 + i));
  });
  return null;
};
