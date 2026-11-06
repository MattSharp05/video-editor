// Under the water: RGB absorption fog (red fades first in clear water; murky brown in a flood), caustics (light
// focused by the surface) projected onto anything below the surface, silt particles, light shafts, and the surface
// seen from below (Snell's window: sky inside a 48.6 deg cone, mirrored water outside). Scene units = metres.
import * as THREE from 'three';
import {NOISE} from './glsl';
import {WaterPreset, presetUniforms} from './presets';

export type UnderU = ReturnType<typeof underwaterUniforms>;
export const underwaterUniforms = (preset: WaterPreset, uTime: THREE.IUniform, surfaceY: number) => ({
  ...presetUniforms(preset), uTime, uSurfaceY: {value: surfaceY}, uUnder: {value: 1}, uVisScale: {value: 1},
});

// Patch any MeshStandardMaterial (bed, rocks, the boulder) for the underwater look: caustics on upward faces below the
// surface, then RGB absorption fog toward the haze colour. uUnder = 0 turns it off (camera above the water).
export const withUnderwater = <M extends THREE.MeshStandardMaterial>(m: M, U: UnderU, key: string): M => {
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    prev?.call(m, sh, r);
    Object.assign(sh.uniforms, U);
    if (!sh.vertexShader.includes('varying vec3 vUW;'))
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vUW;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvUW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform vec3 uHaze, uExt; uniform float uTime, uSurfaceY, uUnder, uVisScale, uCaustics; varying vec3 vUW;\n${NOISE}`)
      .replace('#include <emissivemap_fragment>', /* glsl */`#include <emissivemap_fragment>
        if (uUnder > 0.5 && vUW.y < uSurfaceY) {
          vec2 q = vUW.xz * 1.6; float c = 0.0;
          for (int i = 0; i < 3; i++){ q += vec2(sin(q.y * 1.3 + uTime * 0.9), cos(q.x * 1.1 - uTime * 0.7)) * 0.6;
            c += 1.0 / (1.0 + 22.0 * abs(sin(q.x) * sin(q.y))); }
          vec3 nW = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
          float depth = uSurfaceY - vUW.y;
          totalEmissiveRadiance += diffuseColor.rgb * pow(c / 3.0, 2.5) * 1.6 * uCaustics * max(nW.y, 0.0) * exp(-uExt.g * depth);
        }`)
      .replace('#include <fog_fragment>', /* glsl */`#include <fog_fragment>
        if (uUnder > 0.5) { float d = length(vUW - cameraPosition) * uVisScale; vec3 tr = exp(-uExt * d);
          gl_FragColor.rgb = gl_FragColor.rgb * tr + uHaze * (1.0 - tr); }`);
  };
  m.customProgramCacheKey = () => 'water-under-' + key;
  return m;
};

// suspended silt: closed-form drifting particles in a box around a centre (wraps); deterministic per frame
export const siltPoints = (count: number, seed = 1) => {
  const g = new THREE.BufferGeometry(), b = new Float32Array(count * 3), s = new Float32Array(count);
  let x = seed * 9301 + 49297;
  const rnd = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  for (let i = 0; i < count; i++) { b.set([rnd(), rnd(), rnd()], i * 3); s[i] = rnd(); }
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  g.setAttribute('base', new THREE.BufferAttribute(b, 3)); g.setAttribute('seed', new THREE.BufferAttribute(s, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
  return g;
};
export const siltMaterial = (preset: WaterPreset, uTime: THREE.IUniform) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: {...presetUniforms(preset), uTime, uCenter: {value: new THREE.Vector3()}, uBox: {value: 6}, uVel: {value: new THREE.Vector3(0.6, 0.02, 0)}, uSize: {value: 0.02}},
  vertexShader: /* glsl */`attribute vec3 base; attribute float seed; uniform vec3 uCenter, uVel; uniform float uTime, uBox, uSize; varying float vA;
    void main(){ vec3 drift = uVel * uTime * (0.6 + 0.8 * seed) + vec3(0.0, sin(uTime * 0.7 + seed * 40.0) * 0.05, 0.0);
      vec3 p = uCenter + (fract(base + drift / uBox) - 0.5) * uBox;
      vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
      gl_PointSize = clamp(uSize * (0.5 + seed) * 1400.0 / -mv.z, 1.0, 9.0); vA = smoothstep(uBox * 0.5, uBox * 0.15, length(p - uCenter)); }`,
  fragmentShader: /* glsl */`uniform vec3 uFoamCol, uHaze; varying float vA;
    void main(){ vec2 c = gl_PointCoord - 0.5; float r = length(c); if (r > 0.5) discard;
      gl_FragColor = vec4(mix(uHaze, uFoamCol, 0.6), vA * smoothstep(0.5, 0.1, r) * 0.55); }`,
});

// light shafts: a fan of additive vertical quads from the surface, noise-masked and scrolling
export const shaftMaterial = (preset: WaterPreset, uTime: THREE.IUniform) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: {...presetUniforms(preset), uTime, uStrength: {value: 0.35}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: /* glsl */`uniform float uTime, uStrength, uCaustics; uniform vec3 uFoamCol, uHaze; varying vec2 vUv; ${NOISE}
    void main(){ float n = wfbm(vec2(vUv.x * 7.0 + uTime * 0.15, vUv.y * 0.6));
      float a = pow(n, 2.2) * smoothstep(0.0, 0.25, vUv.y) * smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x) * vUv.y;
      gl_FragColor = vec4(mix(uHaze, uFoamCol, 0.5) * a * uStrength * (0.3 + 0.7 * uCaustics), 1.0); }`,
});

// the surface from below: Snell's window (sky within 48.6 deg of straight up), total internal reflection outside
export const surfaceFromBelowMaterial = (preset: WaterPreset, uTime: THREE.IUniform, sky: string) => new THREE.ShaderMaterial({
  side: THREE.DoubleSide, transparent: true,
  uniforms: {...presetUniforms(preset), uTime, uSky: {value: new THREE.Color(sky)}},
  vertexShader: 'varying vec3 vW; void main(){ vW = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.0); }',
  fragmentShader: /* glsl */`uniform vec3 uSky, uHaze, uExt; uniform float uTime; varying vec3 vW; ${NOISE}
    void main(){ vec3 V = normalize(vW - cameraPosition);
      float rip = wfbm(vW.xz * 1.5 + uTime * 0.4) - 0.5;
      float up = V.y + rip * 0.12;
      float win = smoothstep(0.62, 0.70, up);                            // cos(48.6 deg) = 0.66
      vec3 c = mix(uHaze * 0.6, uSky * 1.3, win);
      float d = length(vW - cameraPosition); vec3 tr = exp(-uExt * d);
      gl_FragColor = vec4(c * tr + uHaze * (1.0 - tr), 1.0); }`,
});
