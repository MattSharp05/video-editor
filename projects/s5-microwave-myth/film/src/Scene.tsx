// One three.js world: a found kitchen at night, a found microwave (animated door) on the counter, and a found lasagne
// scan cut in half by clipping planes. The cut face is drawn by a cap shader: the real layers (pasta, ragu, cheese,
// bubbling where hot) or heat vision (a thermal ramp of the temperature field from timeline.ts). A molecule set far
// away carries the molecule-scale shot. Built once; per frame only uniforms and transforms change.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {random} from 'remotion';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
export const DOOR_OPEN = 0.33; // fraction of the clip at which the door is open
export type Assets = {microwave: GLTF; lasagna: GLTF; kitchen: GLTF};

// thermal ramp (shared with the HTML scale bar): -> deep blue, violet, red, orange, yellow-white
export const RAMP = ['#1B2A8C', '#6A2C9C', '#C42A3A', '#FF7A1E', '#FFF2B0'];
export const T_LO = 0, T_HI = 100;
const GLSL_RAMP = /* glsl */ `
vec3 thermalRamp(float T) {
  float x = clamp((T - ${T_LO.toFixed(1)}) / ${(T_HI - T_LO).toFixed(1)}, 0.0, 1.0) * 4.0;
  vec3 c0 = vec3(0.106,0.165,0.549), c1 = vec3(0.416,0.173,0.612), c2 = vec3(0.769,0.165,0.227), c3 = vec3(1.0,0.478,0.118), c4 = vec3(1.0,0.949,0.690);
  vec3 c = mix(c0, c1, clamp(x, 0.0, 1.0));
  c = mix(c, c2, clamp(x - 1.0, 0.0, 1.0)); c = mix(c, c3, clamp(x - 2.0, 0.0, 1.0)); c = mix(c, c4, clamp(x - 3.0, 0.0, 1.0));
  return pow(c, vec3(2.2)); // to linear
}
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1,0)), f.x), mix(hash21(i + vec2(0,1)), hash21(i + vec2(1,1)), f.x), f.y); }
// temperature at a depth d (cm) from the nearest surface: mirrors TL.tempAt
uniform float uHeat; uniform float uCreep; uniform float uEven;
float tempAt(float dCm) {
  float front = max(0.0, dCm - uCreep);
  float T = ${TL.T0.toFixed(1)} + uHeat * ${TL.AMP.toFixed(1)} * exp(-front / ${TL.DELTA_CM.toFixed(2)});
  return mix(min(T, 96.0), 66.0, uEven);
}`;

// the lasagne material: the scan's texture outside; the cap (back faces seen through the cut) gets the layers or heat vision
const slabMaterial = (base: THREE.MeshStandardMaterial, U: Record<string, THREE.IUniform>, planes: THREE.Plane[], key: string) => {
  const m = base.clone();
  m.side = THREE.DoubleSide; m.clippingPlanes = planes; m.clipShadows = true;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform mat4 uSlabInv; varying vec3 vS;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvS = (uSlabInv * modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vS; uniform float uThermA; uniform float uThermB; uniform float uScan; uniform float uTime; uniform float uBubble; uniform float uMythF;\n${GLSL_RAMP}`)
      .replace('#include <map_fragment>', `#include <map_fragment>
        // slab-local metres: x across (centre 0), y up from the bottom, z toward the camera
        float W = ${TL.SLAB.w.toFixed(4)}, H = ${TL.SLAB.h.toFixed(4)};
        float dEdge = min(min(W * 0.5 - abs(vS.x), H - vS.y), vS.y);
        float dCm = max(dEdge, 0.0) * 100.0;
        bool cap = !gl_FrontFacing;
        if (cap) {
          // the cut face, real: layers by height (pasta sheets, ragu, bechamel, cheese top)
          float v = vS.y / H;
          float n = vnoise(vS.xy * 900.0) * 0.5 + vnoise(vS.xy * 260.0) * 0.5;
          vec3 ragu = mix(vec3(0.42, 0.08, 0.04), vec3(0.62, 0.17, 0.07), n);
          vec3 pasta = mix(vec3(0.86, 0.74, 0.46), vec3(0.95, 0.86, 0.58), n);
          vec3 cheese = mix(vec3(0.93, 0.74, 0.36), vec3(0.72, 0.45, 0.16), smoothstep(0.55, 0.8, vnoise(vS.xy * 180.0)));
          float wob = (vnoise(vec2(vS.x * 60.0, 3.0)) - 0.5) * 0.07 + (vnoise(vec2(vS.x * 260.0, 9.0)) - 0.5) * 0.025;
          float vv = v + wob;
          float sheet = max(max(smoothstep(0.0, 0.012, 0.045 - abs(vv - 0.06)), smoothstep(0.0, 0.012, 0.04 - abs(vv - 0.38))), smoothstep(0.0, 0.012, 0.04 - abs(vv - 0.68)));
          vec3 c = mix(ragu, pasta, sheet);
          c = mix(c, vec3(0.95, 0.9, 0.78), smoothstep(0.02, 0.0, abs(vv - 0.47) - 0.03) * 0.8); // bechamel line
          c = mix(c, cheese, smoothstep(0.86, 0.9, vv));
          diffuseColor.rgb = pow(c, vec3(2.2));
          // hot rim: glossy and bubbling where it's past ~80 C (real view only)
          float Tr = tempAt(dCm);
          float hot = smoothstep(55.0, 90.0, Tr) * uBubble;
          float cold = (1.0 - smoothstep(15.0, 40.0, Tr)) * uBubble;
          vec3 lum = vec3(dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11)));
          diffuseColor.rgb = mix(diffuseColor.rgb, lum * vec3(0.95, 0.93, 1.0) * 1.15, cold * 0.45); // cold: dull, pale, congealed
          diffuseColor.rgb *= 1.0 + 0.35 * hot;                                                    // hot: saturated, wet
          vec2 g = vS.xy * 170.0; vec2 cell = floor(g); vec2 fp = fract(g) - 0.5;
          float ph = fract(hash21(cell) + uTime * (0.6 + hash21(cell + 7.0)));
          float bub = smoothstep(0.32 * ph, 0.32 * ph - 0.06, length(fp)) * smoothstep(1.0, 0.7, ph) * step(0.55, hash21(cell + 3.0));
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 2.2 + vec3(0.12, 0.05, 0.0), hot * bub);
        }
        // heat vision: old state below the scan line, new above it (the line sweeps down from the top)
        float above = step(1.0 - vS.y / H, uScan);
        float th = mix(uThermA, uThermB, above);
        float T = tempAt(cap ? dCm : 0.4);
        // the myth: hottest in the very middle (wiped away from the top by the scan line)
        float dc = length((vS.xy - vec2(0.0, H * 0.5)) * vec2(1.0, 1.3)) * 100.0;
        float mythT = ${TL.T0.toFixed(1)} + 96.0 * exp(-dc / 2.6);
        float mf = uMythF * (uScan < 0.0 ? 1.0 : step(uScan, 1.0 - vS.y / H));
        T = mix(T, mythT, mf);
        vec3 tc = thermalRamp(T + (vnoise(vS.xy * 400.0) - 0.5) * 3.0);
        diffuseColor.rgb = mix(diffuseColor.rgb, tc * 0.25, th);
        `)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += tc * 1.6 * th;
        // the scan line itself
        float sl = exp(-pow((1.0 - vS.y / H - uScan) * 90.0, 2.0)) * step(0.0, uScan) * step(uScan, 1.0);
        totalEmissiveRadiance += vec3(1.0, 0.82, 0.48) * 3.0 * sl;`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        if (!gl_FrontFacing) roughnessFactor = mix(mix(0.6, 0.9, (1.0 - smoothstep(15.0, 40.0, tempAt(dCm))) * uBubble), 0.12, smoothstep(55.0, 90.0, tempAt(dCm)) * uBubble);`);
  };
  m.customProgramCacheKey = () => 'slab' + key;
  return m;
};

// a soft glow sprite
const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

// the wave fronts and the myth hologram: one additive plane over the cut face, drawn in slab-local coordinates
const overlayMaterial = (U: Record<string, THREE.IUniform>) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, toneMapped: false,
  uniforms: {...U, uWaves: {value: Array.from({length: 12}, () => new THREE.Vector3(-1, 0, 0))}, uWaveN: {value: 0}, uMyth: {value: 0}, uGlitch: {value: 0}},
  vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `varying vec2 vP; uniform vec3 uWaves[12]; uniform int uWaveN; uniform float uMyth; uniform float uGlitch; uniform float uTime; uniform float uScan;
    ${GLSL_RAMP}
    void main(){
      float W = ${TL.SLAB.w.toFixed(4)}, H = ${TL.SLAB.h.toFixed(4)};
      vec2 p = vec2(vP.x, vP.y + H * 0.5); // y from the slab bottom
      bool inside = abs(p.x) < W * 0.5 && p.y > 0.0 && p.y < H;
      vec3 c = vec3(0.0); float a = 0.0;
      // wave fronts: x = age (s), y = side (0 top, 1 left, 2 right)
      for (int i = 0; i < 12; i++) {
        if (i >= uWaveN) break;
        vec3 w = uWaves[i];
        float travel = w.x * ${TL.WAVE_V.toFixed(3)} - 0.02; // metres past the food's surface (negative: still outside)
        float s, along, span;
        if (w.y < 0.5) { s = (H - p.y); along = p.x; span = W * 0.5 + 0.035; }
        else if (w.y < 1.5) { s = (p.x + W * 0.5); along = p.y - H * 0.5; span = H * 0.5 + 0.035; }
        else { s = (W * 0.5 - p.x); along = p.y - H * 0.5; span = H * 0.5 + 0.035; }
        float band = exp(-pow((s - travel) * 700.0, 2.0)) + 0.35 * exp(-pow((s - travel) * 160.0, 2.0)) * step(s, travel);
        float pen = max(travel, 0.0) * 100.0; // cm into the food
        float dim = inside || travel > 0.0 ? exp(-pen / ${TL.DELTA_CM.toFixed(2)}) : 1.0;
        float fade = smoothstep(span, span - 0.015, abs(along)) * smoothstep(1.4, 1.0, w.x);
        float wav = 0.5 + 0.5 * sin(along * 260.0 - w.x * 18.0);
        c += vec3(1.0, 0.78, 0.38) * band * dim * fade * (0.75 + 0.25 * wav) * 2.2;
      }
      // the myth: a hologram heat map hottest in the very centre, cyan-tinted, with scanlines and rings
      if (uMyth > 0.001 && inside) {
        float dc = length((p - vec2(0.0, H * 0.5)) * vec2(1.0, 1.25)) * 100.0;
        float T = ${TL.T0.toFixed(1)} + 92.0 * exp(-dc / 2.2);
        vec3 h = mix(thermalRamp(T), vec3(0.44, 0.9, 1.0) * 0.6, 0.35);
        float scan = 0.75 + 0.25 * sin(p.y * 2400.0 + uTime * 8.0);
        float ring = exp(-pow(fract(dc / 3.0 - uTime * 0.8) - 0.5, 2.0) * 60.0) * 0.5;
        float gl = step(0.5, fract(p.y * 90.0 + floor(uTime * 24.0) * 0.37)) * uGlitch;
        float keep = uScan < 0.0 ? 1.0 : step(uScan, 1.0 - p.y / H); // the scan line wipes the myth away from the top
        c += (vec3(0.44, 0.9, 1.0) * (ring * 1.1 + (1.0 - scan) * 0.12)) * uMyth * keep * (1.0 - gl);
        float sl = exp(-pow((1.0 - p.y / H - uScan) * 90.0, 2.0)) * step(0.0, uScan); c += vec3(1.0, 0.82, 0.48) * 2.0 * sl * uMyth;
      }
      gl_FragColor = vec4(c, 1.0);
    }`,
});

export const Scene: React.FC<{t: number; assets: Assets; debugCam?: number[]}> = ({t, assets, debugCam}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace; gl.localClippingEnabled = true;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const pm = new THREE.PMREMGenerator(gl); const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.background = col('#0b0d12');
    const root = new THREE.Group(); scene.add(root);
    const tex = glowTex();

    // light: warm ceiling downlights over the counter, a cool window fill, a low hemisphere
    const hemi = new THREE.HemisphereLight(col('#cfd8ea'), col('#3b3026'), 0.35); root.add(hemi);
    const key = new THREE.SpotLight(col('#FFD9A8'), 18, 6, Math.PI / 5, 0.6, 1.5);
    key.position.set(-0.35, 2.6, 0.55); key.target.position.set(0, 0.95, -0.25); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0005;
    root.add(key, key.target);
    const fill = new THREE.DirectionalLight(col('#9fb6e6'), 0.45); fill.position.set(-3, 2, 1); root.add(fill);
    const lamp = new THREE.PointLight(col('#FFD28A'), 0, 0.6, 1.5); lamp.position.set(-0.05, 1.15, -0.2); root.add(lamp);
    const faceLight = new THREE.PointLight(col('#fff1dc'), 0, 1.2, 1.5); faceLight.position.set(TL.SLAB.x - 0.05, TL.SLAB_CY + 0.12, TL.SLAB.z + 0.3); root.add(faceLight);

    // kitchen (found): scaled so its counter is 0.92 m high, a free run of counter under the microwave
    const k = assets.kitchen.scene.clone(true); const ks = 1.15;
    const kg = new THREE.Group(); kg.add(k); kg.scale.setScalar(ks); kg.position.set(-0.95 * ks, 0.92 + 0.95 * ks, -0.5 + 3.9 * ks); root.add(kg);
    k.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.receiveShadow = true; } });

    // microwave (found): front (-x in the file) turned to +z, 0.5 m wide, on the counter
    const mw = assets.microwave.scene.clone(true);
    const mg = new THREE.Group(); mg.add(mw); mg.rotation.y = Math.PI / 2; mg.scale.setScalar(0.122); mg.position.set(-0.0025, 1.053, -0.2115); root.add(mg);
    mw.traverse((o) => {
      const m = o as THREE.Mesh; if (!m.isMesh) return;
      m.castShadow = true; m.receiveShadow = true;
      const mt = m.material as THREE.MeshPhysicalMaterial;
      if (mt.transmission > 0) { // door glass: a dark tinted pane (three's transmission pass is slow on the CPU)
        m.material = new THREE.MeshPhysicalMaterial({color: col('#20262c'), roughness: 0.05, metalness: 0, transparent: true, opacity: 0.32, envMap: env, envMapIntensity: 0.8, depthWrite: false});
        m.renderOrder = 30;
      } else { mt.envMap = env; mt.envMapIntensity = 0.6; }
    });
    const mixer = new THREE.AnimationMixer(mw); const clip = assets.microwave.animations[0]; const act = mixer.clipAction(clip); act.play(); act.paused = true;

    // the plate on the turntable
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.072, 0.012, 48), new THREE.MeshPhysicalMaterial({color: col('#f3f1ec'), roughness: 0.25, clearcoat: 0.6, envMap: env}));
    plate.position.set(TL.SLAB.x, TL.SLAB.y - 0.006, TL.SLAB.z); plate.receiveShadow = true; root.add(plate);

    // the lasagne: two clipped halves of the found scan; the slab frame is centred on the cut, y from the bottom
    const slab = new THREE.Group(); slab.position.set(TL.SLAB.x, TL.SLAB.y, TL.SLAB.z); root.add(slab);
    const U = {uSlabInv: {value: new THREE.Matrix4()}, uMythF: {value: 0}, uThermA: {value: 0}, uThermB: {value: 0}, uScan: {value: -1}, uTime: {value: 0}, uBubble: {value: 0}, uHeat: {value: 0}, uCreep: {value: 0}, uEven: {value: 0}};
    const lasScale = TL.SLAB.w / 0.99;
    let baseMat: THREE.MeshStandardMaterial | null = null; let lasGeo: THREE.BufferGeometry | null = null; const lasM = new THREE.Matrix4();
    assets.lasagna.scene.updateMatrixWorld(true);
    assets.lasagna.scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && !lasGeo) { lasGeo = m.geometry; baseMat = m.material as THREE.MeshStandardMaterial; lasM.copy(m.matrixWorld); } });
    const back = new THREE.Group(), front = new THREE.Group(); slab.add(back, front);
    const planeBack = new THREE.Plane(new THREE.Vector3(0, 0, -1), TL.SLAB.z); // keep z < SLAB.z (world)
    const planeFront = new THREE.Plane(new THREE.Vector3(0, 0, 1), -TL.SLAB.z);
    const mkHalf = (parent: THREE.Group, plane: THREE.Plane, key: string) => {
      const mesh = new THREE.Mesh(lasGeo!, slabMaterial(baseMat!, U, [plane], key));
      mesh.applyMatrix4(lasM); const g = new THREE.Group(); g.add(mesh);
      g.scale.setScalar(lasScale); g.position.set(-0.023 * lasScale, 0.36 * lasScale, 0.02 * lasScale); // bottom on the plate, centred
      mesh.castShadow = true; parent.add(g); return mesh;
    };
    mkHalf(back, planeBack, 'b'); mkHalf(front, planeFront, 'f');

    // the overlay plane on the cut face (wave fronts, the myth hologram)
    const ov = new THREE.Mesh(new THREE.PlaneGeometry(TL.SLAB.w + 0.1, TL.SLAB.h + 0.1), overlayMaterial(U));
    ov.position.set(0, TL.SLAB.h / 2, 0.0015); ov.renderOrder = 40; slab.add(ov);

    // the ruler: a clear strip laid across the left band, ticks every 2 mm, the first inch lit
    const rc = document.createElement('canvas'); rc.width = 512; rc.height = 96; const rg = rc.getContext('2d')!;
    rg.fillStyle = 'rgba(220,235,255,0.22)'; rg.fillRect(0, 0, 512, 96);
    const pxPerCm = 512 / 4;
    rg.fillStyle = 'rgba(255,255,255,0.5)'; rg.fillRect(0, 0, 2.54 * pxPerCm, 96);
    rg.fillStyle = '#fff'; for (let i = 0; i <= 20; i++) { const x = i * pxPerCm / 5; const L = i % 5 ? 22 : 44; rg.fillRect(x - 2, 0, 4, L); }
    rg.fillRect(2.54 * pxPerCm - 4, 0, 8, 96);
    const rtex = new THREE.CanvasTexture(rc); rtex.colorSpace = THREE.SRGBColorSpace;
    const ruler = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.011), new THREE.MeshBasicMaterial({map: rtex, transparent: true, toneMapped: false, depthWrite: false}));
    ruler.position.set(-TL.SLAB.w / 2 + 0.02, TL.SLAB.h * 0.5, 0.004); ruler.renderOrder = 41; slab.add(ruler);

    // probes (real view): two steel rods entering the cut face
    const steel = new THREE.MeshStandardMaterial({color: col('#c9ccd0'), metalness: 1, roughness: 0.25, envMap: env});
    const probe = (tip: THREE.Vector3) => {
      const g = new THREE.Group(); const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.09, 12), steel); rod.position.y = 0.045;
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.04, 16), new THREE.MeshStandardMaterial({color: col('#26292e'), roughness: 0.5})); grip.position.y = 0.11;
      g.add(rod, grip); g.position.copy(tip); slab.add(g); return g;
    };
    const pRim = probe(new THREE.Vector3(-TL.SLAB.w / 2 + 0.01, TL.SLAB.h * 0.45, 0)); const pCore = probe(new THREE.Vector3(0.0, TL.SLAB.h * 0.45, 0));
    pRim.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-0.45, 0.55, 0.7).normalize());
    pCore.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.4, 0.6, 0.7).normalize());
    (pRim.children[1] as THREE.Mesh).material = new THREE.MeshStandardMaterial({color: col('#E8742A'), roughness: 0.5});
    (pCore.children[1] as THREE.Mesh).material = new THREE.MeshStandardMaterial({color: col('#4C6BD8'), roughness: 0.5});

    // steam puffs
    const steam = Array.from({length: 30}, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col('#f4f6f8'), transparent: true, depthWrite: false, opacity: 0}));
      s.renderOrder = 35; root.add(s); return {s, ph: random('sp' + i), x: (random('sx' + i) - 0.5) * TL.SLAB.w * 0.9, z: (random('sz' + i) - 0.5) * 0.1}; });

    // molecules (shot M): a field of water molecules, the left half in the hot outer layer, the right in the middle
    const NM = 170;
    const oGeo = new THREE.SphereGeometry(0.05, 16, 12), hGeo = new THREE.SphereGeometry(0.032, 12, 10);
    const oMesh = new THREE.InstancedMesh(oGeo, new THREE.MeshStandardMaterial({color: col('#ffffff'), roughness: 0.35, envMap: env}), NM);
    const hMesh = new THREE.InstancedMesh(hGeo, new THREE.MeshStandardMaterial({color: col('#f4f4f4'), roughness: 0.35, envMap: env}), NM * 2);
    root.add(oMesh, hMesh);
    for (let i = 0; i < NM; i++) { const hotSide = TL.MOL.x + (random('mx' + i) - 0.5) * 2.6 < TL.MOL.x - 0.05;
      oMesh.setColorAt(i, col(hotSide ? '#FF6A2E' : '#8E5A6E')); hMesh.setColorAt(i * 2, col(hotSide ? '#FFF1E2' : '#B8C4DC')); hMesh.setColorAt(i * 2 + 1, col(hotSide ? '#FFF1E2' : '#B8C4DC')); }
    const mols = Array.from({length: NM}, (_, i) => ({x: TL.MOL.x + (random('mx' + i) - 0.5) * 2.6, y: TL.MOL.y - 1.55 + random('my' + i) * 2.3, z: TL.MOL.z + (random('mz' + i) - 0.5) * 0.8, a: random('ma' + i) * 6.28, ph: random('mp' + i) * 0.6}));
    const molLight = new THREE.PointLight(col('#ffffff'), 4, 8, 1.2); molLight.position.set(TL.MOL.x - 0.5, TL.MOL.y + 1, TL.MOL.z + 2); root.add(molLight);
    // backdrop: warm on the left (outer layer), cool blue on the right (middle), a soft boundary at x = MOL.x
    const bdMat = new THREE.ShaderMaterial({uniforms: {uHot: {value: 0}}, toneMapped: false,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec2 vUv; uniform float uHot; void main(){ float k = smoothstep(0.42, 0.58, vUv.x);
        vec3 hot = mix(vec3(0.35, 0.1, 0.04), vec3(1.1, 0.42, 0.08), uHot); vec3 cold = vec3(0.04, 0.07, 0.3);
        vec3 c = mix(hot, cold, k) * (0.75 + 0.25 * vUv.y); gl_FragColor = vec4(c, 1.0); }`});
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), bdMat); backdrop.position.set(TL.MOL.x, TL.MOL.y, TL.MOL.z - 1.5); root.add(backdrop);
    // field arrows: a row of gold arrows across the top and bottom that reverse with the field
    const arrowMat = new THREE.MeshBasicMaterial({color: col(TL.GOLD).multiplyScalar(1.6), toneMapped: false, transparent: true});
    const arrows = Array.from({length: 10}, (_, i) => { const g = new THREE.Group(); g.scale.set(1, 1.8, 1.8);
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 8), arrowMat); sh.rotation.z = Math.PI / 2;
      const hd = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.09, 12), arrowMat); hd.rotation.z = -Math.PI / 2; hd.position.x = 0.22;
      g.add(sh, hd); g.position.set(TL.MOL.x - 1.05 + (i % 5) * 0.52, TL.MOL.y + (i < 5 ? 1.25 : -1.25), TL.MOL.z + 0.5); root.add(g); return g; });

    return {env, hemi, key, fill, lamp, faceLight, mixer, act, clip, slab, U, back, front, ov, ruler, pRim, pCore, steam, oMesh, hMesh, mols, molLight, bdMat, arrows, arrowMat, mw};
  }, [gl, scene, assets]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.01; cam.far = 200;
  cam.position.set(...c.pos); cam.lookAt(...c.look);
  if (debugCam) { cam.position.set(debugCam[0], debugCam[1], debugCam[2]); cam.lookAt(debugCam[3], debugCam[4], debugCam[5]); }
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const shot = TL.shotAt(t);
  gl.toneMappingExposure = shot === 'F' ? 0.7 : shot === 'M' ? 1.0 : 0.85;

  // microwave: door, lamp, turntable
  W.act.time = (debugCam && debugCam[6] !== undefined ? debugCam[6] : TL.doorOpen(t) * DOOR_OPEN) * W.clip.duration; W.mixer.update(0);
  W.lamp.intensity = 0.25 + 0.65 * (1 - TL.ramp(t, TL.B.watch - 0.1, TL.B.watch + 0.5)); // the oven runs during the myth, its lamp fades as it stops
  W.faceLight.intensity = shot === 'F' ? 1.3 : 0;
  // the turntable turns the food (both halves; the clip planes are fixed in the world so the joined halves stay whole)

  // the slab
  W.slab.updateMatrixWorld(true);
  W.U.uSlabInv.value.copy(W.slab.matrixWorld).invert();
  const sp = TL.split(t);
  W.front.position.set(-0.1 * sp, -0.22 * sp * sp, 0.1 * sp); W.front.visible = sp < 0.98 && shot !== 'M';
  // the clip planes follow the slab (world space)
  const th = shot === 'E' ? 0 : TL.thermal(t), scan = shot === 'E' ? -1 : TL.scanLine(t);
  const before = TL.thermal(t - 0.7);
  W.U.uThermA.value = scan >= 0 ? before : th; W.U.uThermB.value = th; W.U.uScan.value = scan;
  W.U.uTime.value = t; W.U.uBubble.value = 1 - th; W.U.uMythF.value = shot === 'F' ? TL.myth(t) : 0;
  const dim = shot === 'F' ? (th > 0.5 ? 0.2 : 0.3) : 1; // heat vision: the set falls dark so the thermal face leads
  W.key.intensity = 18 * dim; W.hemi.intensity = 0.35 * dim; W.fill.intensity = 0.45 * dim; W.faceLight.intensity *= dim;
  W.U.uHeat.value = TL.heat(t); W.U.uCreep.value = TL.creep(t); W.U.uEven.value = TL.even(t);
  const ovm = W.ov.material as THREE.ShaderMaterial;
  const ws = shot === 'F' && th > 0.5 ? TL.waves(t) : [];
  ws.forEach((w, i) => ovm.uniforms.uWaves.value[i].set(w.age, w.side, 0)); ovm.uniforms.uWaveN.value = Math.min(12, ws.length);
  ovm.uniforms.uMyth.value = shot === 'F' ? TL.myth(t) : 0; ovm.uniforms.uScan.value = scan;
   ovm.uniforms.uGlitch.value = TL.mythGlitch(t);
  (W.ruler.material as THREE.MeshBasicMaterial).opacity = shot === 'F' ? TL.ruler(t) : 0; W.ruler.visible = shot === 'F' && TL.ruler(t) > 0.01;
  const pr = shot === 'F' ? TL.probes(t) : 0;
  W.pRim.visible = W.pCore.visible = pr > 0.01;
  W.pRim.position.z = W.pCore.position.z = 0.015 * (1 - pr); // pushed in as they appear
  // steam rises off the hot food (real view, and the end)
  const st = shot === 'E' || (shot === 'F' && th < 0.5) ? TL.steam(t) : 0;
  W.steam.forEach((p, i) => {
    const a = (t * 0.35 + p.ph) % 1;
    const edge = i % 3 === 0 ? -1 : i % 3 === 1 ? 1 : 0; // steam rises off the hot edges and the top
    p.s.position.set(TL.SLAB.x + (edge ? edge * (TL.SLAB.w / 2 + 0.004) : p.x) + Math.sin(a * 6 + i) * 0.008, TL.SLAB.y + (edge ? TL.SLAB.h * (0.15 + 0.7 * p.ph) : TL.SLAB.h) + a * 0.12, TL.SLAB.z + (edge ? 0.01 : p.z));
    p.s.scale.setScalar(0.025 + a * 0.07); (p.s.material as THREE.SpriteMaterial).opacity = st * 0.5 * Math.sin(Math.PI * a);
  });

  // molecules
  const mOn = shot === 'M';
  W.oMesh.visible = W.hMesh.visible = mOn;
  if (mOn) {
    const tmp = new THREE.Object3D(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const hOff = [new THREE.Vector3(0.062, 0.048, 0), new THREE.Vector3(-0.062, 0.048, 0)];
    W.mols.forEach((m, i) => {
      const hot = m.x < TL.MOL.x - 0.05;
      const ang = hot ? TL.flipAngle(t, m.ph) : 0.06 * Math.sin(t * 9 + m.a * 3); // the middle: locked, a faint jiggle
      e.set(0.3 * Math.sin(m.a), m.a * 0.3, m.a + ang); q.setFromEuler(e);
      const jig = hot ? 0.012 * TL.molHeat(t) : 0.003;
      tmp.position.set(m.x + jig * Math.sin(t * 31 + i), m.y + jig * Math.cos(t * 27 + i), m.z); tmp.quaternion.copy(q); tmp.scale.setScalar(1); tmp.updateMatrix();
      W.oMesh.setMatrixAt(i, tmp.matrix);
      hOff.forEach((h, k) => { const p = h.clone().applyQuaternion(q).add(tmp.position); tmp.position.copy(p); tmp.updateMatrix(); W.hMesh.setMatrixAt(i * 2 + k, tmp.matrix);
        tmp.position.set(m.x + jig * Math.sin(t * 31 + i), m.y + jig * Math.cos(t * 27 + i), m.z); });
    });
    W.oMesh.instanceMatrix.needsUpdate = W.hMesh.instanceMatrix.needsUpdate = true;
    W.bdMat.uniforms.uHot.value = TL.molHeat(t);
    const f = Math.sin(2 * Math.PI * 1.6 * t) * TL.fieldOn(t);
    W.arrows.forEach((a) => { a.scale.x = 1.4 * f; a.visible = Math.abs(f) > 0.05; });
    W.arrowMat.opacity = TL.fieldOn(t);
  }
  W.arrows.forEach((a) => { if (!mOn) a.visible = false; });
  return null;
};
