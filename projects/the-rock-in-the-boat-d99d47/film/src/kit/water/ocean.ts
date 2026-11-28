// Open ocean and shoreline: Gerstner waves summed in the vertex shader (analytic normals, deterministic in time),
// Fresnel sky reflection through the environment map, sun glint, light through the crests, crest foam, and a beach:
// the shore is a plane (height at origin + slope), giving depth for colour, transparency and breaking-wave foam lines.
// Scene units = metres. Cost: no extra passes; vertex work scales with the grid (256^2 is fine on CPU).
import * as THREE from 'three';
import {NOISE, BUMP, AA} from './glsl';
import {WaterPreset, presetUniforms} from './presets';

export type Wave = {dir: number; length: number; steep: number; speed?: number};  // dir in degrees; length in metres
export const SWELL: Wave[] = [
  {dir: 0, length: 60, steep: 0.28}, {dir: 18, length: 31, steep: 0.24}, {dir: -25, length: 18, steep: 0.2},
  {dir: 40, length: 9, steep: 0.16}, {dir: -60, length: 5.5, steep: 0.12}, {dir: 75, length: 3.2, steep: 0.1},
];
export const oceanGeometry = (size: number, res = 256) => { const g = new THREE.PlaneGeometry(size, size, res, res); g.rotateX(-Math.PI / 2); return g; };

export type OceanOpts = {waves?: Wave[]; height?: number; beach?: {y0: number; dir: number; slope: number} | null; envMap?: THREE.Texture | null; sunDir?: THREE.Vector3};
export const oceanMaterial = (preset: WaterPreset, uTime: THREE.IUniform, o: OceanOpts = {}) => {
  const waves = o.waves ?? SWELL, N = waves.length, g = 9.81;
  const m = new THREE.MeshStandardMaterial({color: '#ffffff', roughness: preset.roughness, metalness: 0, transparent: true,
    envMap: o.envMap ?? null, envMapIntensity: preset.reflect});
  const b = o.beach;
  const U = {...presetUniforms(preset), uTime,
    uW: {value: waves.map((w) => { const k = 2 * Math.PI / w.length; const a = THREE.MathUtils.degToRad(w.dir);
      return new THREE.Vector4(Math.cos(a), Math.sin(a), k, w.speed ?? Math.sqrt(g / k)); })},
    uQ: {value: waves.map((w) => w.steep)}, uAmp: {value: (o.height ?? 1) },
    uBeach: {value: b ? new THREE.Vector4(Math.cos(THREE.MathUtils.degToRad(b.dir)), Math.sin(THREE.MathUtils.degToRad(b.dir)), b.y0, b.slope) : new THREE.Vector4(1, 0, -999, 0)},
    uSun: {value: (o.sunDir ?? new THREE.Vector3(0.3, 0.35, -0.9)).clone().normalize()}};
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    const pars = `uniform vec4 uW[${N}]; uniform float uQ[${N}]; uniform float uTime, uAmp; uniform vec4 uBeach;`;
    const gerst = /* glsl */`
      void gerst(vec3 P0, out vec3 off, out vec3 nn, out float crest, out float ground) {
        // depth to the beach plane: waves shorten and steepen as it shallows, and die on the sand
        ground = uBeach.z + dot(P0.xz, uBeach.xy) * uBeach.w;
        float shoal = clamp(max(0.0, -ground) / 6.0, 0.15, 1.0);
        off = vec3(0.0); nn = vec3(0.0, 1.0, 0.0); crest = 0.0;
        for (int i = 0; i < ${N}; i++) {
          vec2 D = uW[i].xy; float k = uW[i].z, c = uW[i].w;
          float A = uAmp * uQ[i] / (k * ${N}.0) * 1.6 * mix(0.35, 1.0, shoal);
          float ph = k * dot(D, P0.xz) - k * c * uTime;
          float Q = uQ[i] / (k * A * ${N}.0 + 1e-4) * (2.0 - shoal);
          off.xz += Q * A * D * cos(ph); off.y += A * sin(ph);
          nn.xz -= D * k * A * cos(ph); nn.y -= Q * k * A * sin(ph);
          crest += A * sin(ph);
        }
      }`;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\n${pars}\nvarying vec3 vWP; varying float vCrest; varying float vDepth;\n${gerst}`)
      .replace('#include <beginnormal_vertex>', /* glsl */`#include <beginnormal_vertex>
        vec3 gOff, gN; float gCrest, gGround; vec3 gP0 = (modelMatrix * vec4(position, 1.0)).xyz;
        gerst(gP0, gOff, gN, gCrest, gGround);
        objectNormal = normalize(gN);`)
      .replace('#include <begin_vertex>', /* glsl */`#include <begin_vertex>
        transformed += gOff;
        vWP = gP0 + gOff; vCrest = gCrest / max(uAmp, 1e-3); vDepth = max(0.0, vWP.y - gGround);`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform vec3 uShallow, uDeep, uFoamCol, uExt, uSun; uniform float uTime, uReflect; uniform vec4 uBeach;
        varying vec3 vWP; varying float vCrest; varying float vDepth; ${NOISE} ${BUMP} ${AA} float vFoam;`)
      .replace('#include <color_fragment>', /* glsl */`#include <color_fragment>
        vec3 V = normalize(cameraPosition - vWP);
        float thin = 1.0 - exp(-dot(uExt, vec3(0.33)) * vDepth * 1.5);
        vec3 col = mix(uShallow, uDeep, clamp(thin, 0.0, 1.0));
        // light through the wave crests when looking toward the sun
        col += uShallow * 0.35 * smoothstep(0.2, 0.9, vCrest) * pow(max(dot(-V, uSun), 0.0), 3.0);
        // foam: crests (whitecaps), breaking lines near shore that run up the beach, and the swash edge
        float n = wfbm(vWP.xz * 0.35 + vec2(uTime * 0.2, 0.0));
        float caps = smoothstep(0.55, 0.85, vCrest + n * 0.4) * 0.8;
        float toShore = dot(vWP.xz, uBeach.xy);
        float lines = smoothstep(0.6, 0.95, sin(toShore * 0.45 - uTime * 1.3 + n * 2.0)) * smoothstep(3.5, 0.6, vDepth);
        float swash = smoothstep(0.35, 0.0, vDepth);
        vFoam = clamp(max(max(caps, lines), swash) * smoothstep(0.35, 0.7, n + 0.3), 0.0, 1.0);
        diffuseColor.rgb = mix(col, uFoamCol, vFoam);
        diffuseColor.a = mix(0.55, 1.0, smoothstep(0.0, 1.2, vDepth)) * opacity;`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.7, vFoam);')
      .replace('#include <normal_fragment_maps>', /* glsl */`#include <normal_fragment_maps>
        { float ripples = wfbm(vWP.xz * 2.2 + vec2(uTime * 0.6, uTime * 0.25)) + 0.5 * wfbm(vWP.xz * 6.0 - uTime * 0.9);
          normal = wbump(-vViewPosition, normal, ripples, 0.25 * wdetail(vWP.xz, 0.4)); }`)
      .replace('#include <emissivemap_fragment>', /* glsl */`#include <emissivemap_fragment>
        { vec3 R = reflect(-normalize(cameraPosition - vWP), normal);
          totalEmissiveRadiance += vec3(1.0, 0.93, 0.8) * pow(max(dot(R, (viewMatrix * vec4(uSun, 0.0)).xyz), 0.0), 380.0) * 6.0 * (1.0 - vFoam); }`);
  };
  m.customProgramCacheKey = () => 'water-ocean-' + N;
  return m;
};
