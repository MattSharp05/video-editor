// River surface along any path. Geometry carries `flow` (metres along, 0..1 across) and `slope` (drop per metre,
// smoothed): the material uses them for two-phase flowing ripples (faster mid-channel and on steep reaches), depth
// colour across the channel, bank foam, and rapids: standing waves that stay put with foam flowing through them.
// Scene units = metres unless you pass mpu (metres per unit). Cost: no extra render passes; a few noise lookups per
// water pixel.
import * as THREE from 'three';
import {NOISE, BUMP, AA} from './glsl';
import {WaterPreset, presetUniforms} from './presets';

// standing waves in rapids: a train of crests below the constriction, bent into a downstream-pointing V (they lie
// across the current, further downstream at the banks), uneven in height, fixed in place (no time term)
const CREST = /* glsl */`
float rcrest(vec2 mm, float across, float width){
  float chev = abs(across - 0.5) * width * 0.7;
  float ph = (mm.x - chev) * 1.5 + wn2(mm * 0.12) * 3.0;
  return pow(0.5 + 0.5 * sin(ph), 4.0) * (0.35 + 0.65 * wn2(mm * vec2(0.18, 0.3) + 11.0)); }
`;

export const riverGeometry = (path: THREE.Vector3[], width: number, opts: {lift?: number; mpu?: number} = {}) => {
  const lift = opts.lift ?? 0, mpu = opts.mpu ?? 1;
  const p: number[] = [], fl: number[] = [], sl: number[] = [], idx: number[] = [];
  let run = 0;
  const slope: number[] = path.map((a, i) => {                 // drop per metre over a +-3 point window
    const b = path[Math.max(0, i - 3)], c = path[Math.min(path.length - 1, i + 3)];
    const d = Math.hypot(c.x - b.x, c.z - b.z) * mpu; return d > 0 ? Math.max(0, (b.y - c.y) * mpu / d) : 0;
  });
  path.forEach((a, i) => {
    if (i) run += a.distanceTo(path[i - 1]) * mpu;
    const b = path[Math.min(path.length - 1, i + 1)], c = path[Math.max(0, i - 1)];
    const d = b.clone().sub(c).setY(0).normalize(), n = new THREE.Vector3(-d.z, 0, d.x).multiplyScalar(width / 2);
    p.push(a.x + n.x, a.y + lift, a.z + n.z, a.x - n.x, a.y + lift, a.z - n.z);
    fl.push(run, 0, run, 1); sl.push(slope[i], slope[i]);
    if (i < path.length - 1) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute('flow', new THREE.Float32BufferAttribute(fl, 2));
  g.setAttribute('slope', new THREE.Float32BufferAttribute(sl, 1));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};

export type RiverOpts = {width: number; speed?: number; depth?: number; rapids?: [number, number]; mpu?: number; envMap?: THREE.Texture | null};
export const riverMaterial = (preset: WaterPreset, uTime: THREE.IUniform, o: RiverOpts) => {
  const m = new THREE.MeshStandardMaterial({color: '#ffffff', roughness: preset.roughness, metalness: 0, transparent: true, opacity: 0.96,
    side: THREE.DoubleSide, envMap: o.envMap ?? null, envMapIntensity: preset.reflect});
  const U = {...presetUniforms(preset), uTime, uWidth: {value: o.width}, uSpeed: {value: o.speed ?? 1.2}, uDepth: {value: o.depth ?? 4},
    uRapid: {value: new THREE.Vector2(...(o.rapids ?? [0.006, 0.02]))}};
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\nattribute vec2 flow; attribute float slope; varying vec2 vFlow; varying float vSlope; uniform vec2 uRapid; uniform float uWidth;\n${NOISE}\n${CREST}`)
      .replace('#include <begin_vertex>', /* glsl */`#include <begin_vertex>
        vFlow = flow; vSlope = slope;
        { // standing waves in rapids lift the surface itself (fixed in place: no time term)
          float r = smoothstep(uRapid.x, uRapid.y, slope), c = 4.0 * flow.y * (1.0 - flow.y);
          vec2 mm = vec2(flow.x, flow.y * uWidth);
          transformed.y += (rcrest(mm, flow.y, uWidth) - 0.2) * 0.8 * r * c; }`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform vec3 uShallow, uDeep, uFoamCol, uExt; uniform float uTime, uWidth, uSpeed, uDepth, uReflect; uniform vec2 uRapid;
        varying vec2 vFlow; varying float vSlope; ${NOISE} ${BUMP} ${AA} ${CREST}
        float vRapid; float vFoam; float vRip;`)
      .replace('#include <color_fragment>', /* glsl */`#include <color_fragment>
        vec2 m = vec2(vFlow.x, vFlow.y * uWidth);                          // metres: along, across
        float across = vFlow.y, centre = 4.0 * across * (1.0 - across);
        vRapid = smoothstep(uRapid.x, uRapid.y, vSlope);
        float spd = uSpeed * (0.35 + 0.65 * centre) * (1.0 + 2.5 * vRapid);
        // flowing ripples at two scales (metres), phase-jittered so the surface never pulses as one
        float jit = wn2(m * 0.05);
        vRip = wflow(m * vec2(0.55, 0.9), vec2(1.0, 0.0), uTime * spd / 3.0, jit) * 0.65
             + wflow(m * vec2(1.7, 2.6), vec2(1.0, 0.0), uTime * spd / 1.2, jit + 0.37) * 0.35;
        // standing waves in rapids: crests fixed in place (no time term), foam flows through them
        float crest = rcrest(m, across, uWidth) * vRapid * centre;
        // depth across the channel (deepest mid-channel), Beer-Lambert colour
        float d = uDepth * (1.0 - pow(2.0 * across - 1.0, 2.0));
        vec3 col = mix(uShallow, uDeep, 1.0 - exp(-dot(uExt, vec3(0.33)) * d));
        // foam: banks, rapids, crests; textured by flowing noise; fades where the pattern would alias
        float bank = smoothstep(0.1, 0.0, min(across, 1.0 - across));
        float fn = wflow(m * vec2(0.9, 1.4), vec2(1.0, 0.0), uTime * spd / 2.0, jit + 0.71);
        vFoam = clamp(smoothstep(0.6, 0.82, fn * 0.85 + bank * 0.35 + vRapid * 0.12 + crest * 0.55) * (bank + 0.6 * vRapid + crest), 0.0, 1.0);
        vFoam *= mix(0.6, 1.0, wdetail(m, 0.5));
        diffuseColor.rgb = mix(col, uFoamCol, vFoam);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.6, vFoam);')
      .replace('#include <normal_fragment_maps>', /* glsl */`#include <normal_fragment_maps>
        { vec2 mm = vec2(vFlow.x, vFlow.y * uWidth);
          float k = 0.5 * (1.0 + 1.5 * vRapid) * wdetail(mm, 0.6);
          normal = wbump(-vViewPosition, normal, vRip + rcrest(mm, vFlow.y, uWidth) * vRapid * 0.8, k); }`);
  };
  m.customProgramCacheKey = () => 'water-river';
  return m;
};
