// The film's look (upgrades from lab/3d-skills-research.md): satellite imagery and baked light on the real terrain,
// procedural rock detail, sky-matched height fog, a sky dome that also lights the scene, flowing water, caustics.
// Everything is WebGL2 that SwiftShader renders headless; nothing depends on frame history.
import * as THREE from 'three';
import {staticFile, delayRender, continueRender} from 'remotion';
import {useEffect, useState} from 'react';

// the sun: winter, low, from the south-south-east (matches the USGS imagery's shadows and data/bake_light.py)
export const SUN = new THREE.Vector3(0.30, 0.50, 0.81).normalize();
// output-space colours (fog and sky are applied after tone mapping, like three's own fog)
export const HORIZON = new THREE.Color('#D8C3AA');
export const ZENITH = new THREE.Color('#6F8FB8');
export const GROUND = new THREE.Color('#BFA58A');
export const SUNGLOW = new THREE.Color('#FFE2B8');
export const UNDER = new THREE.Color('#3F7A6C');
HORIZON.convertLinearToSRGB(); // keep authoring values as written: three converts hex to linear on set; undo for output space
ZENITH.convertLinearToSRGB(); GROUND.convertLinearToSRGB(); SUNGLOW.convertLinearToSRGB(); UNDER.convertLinearToSRGB();

// ---------- textures ----------
export type Look = {imagery: THREE.Texture; normals: THREE.Texture; light: THREE.Texture; grain: string[]};
let cache: Look | null = null;
export const useLook = (): Look | null => {
  const [l, setL] = useState<Look | null>(cache);
  useEffect(() => {
    if (cache) return;
    const h = delayRender('look textures');
    const load = (f: string, srgb: boolean) => new Promise<THREE.Texture>((res, rej) => new THREE.TextureLoader().load(staticFile(f), (t) => {
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 4; t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; res(t);
    }, undefined, rej));
    Promise.all([load('imagery.jpg', true), load('normals.png', false), load('light.png', false)]).then(([imagery, normals, light]) => {
      cache = {imagery, normals, light, grain: [0, 1, 2, 3].map((i) => staticFile(`grain${i}.png`))};
      setL(cache); continueRender(h);
    });
  }, []);
  return l;
};

// ---------- shared GLSL ----------
const NOISE = /* glsl */`
float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vn3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm3(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++){ s += a * vn3(p); p *= 2.13; a *= 0.5; } return s; }
// bump from a scalar height via screen derivatives (no tangents needed)
vec3 bumpN(vec3 surfPos, vec3 n, float hgt, float k){
  vec3 dpx = dFdx(surfPos), dpy = dFdy(surfPos); vec2 dh = vec2(dFdx(hgt), dFdy(hgt)) * k;
  vec3 r1 = cross(dpy, n), r2 = cross(n, dpx); float det = dot(dpx, r1);
  return normalize(abs(det) * n - sign(det) * (dh.x * r1 + dh.y * r2)); }
`;
const FOG_PARS = /* glsl */`
varying vec3 vWPos;
uniform vec3 uHorizon; uniform vec3 uSunGlow; uniform vec3 uSunDir; uniform vec3 uUnderCol;
uniform float uFogDensity; uniform float uFogBase; uniform float uUnder; uniform float uUnderDensity;
uniform float uDetailFar; uniform float uDetail;
`;
// height fog: thicker low in the canyon, warmer toward the sun; under the river, short green fog
const FOG_APPLY = /* glsl */`
{
  vec3 V = vWPos - cameraPosition; float dist = length(V);
  float dens = uFogDensity * (0.45 + 1.4 * exp(-max(vWPos.y - uFogBase, 0.0) * 1.2));
  float fa = 1.0 - exp(-dist * dens);
  vec3 fc = mix(uHorizon, uSunGlow, pow(max(dot(V / max(dist, 1e-6), uSunDir), 0.0), 6.0) * 0.65);
  fa = mix(fa, 1.0 - exp(-dist * uUnderDensity), uUnder); fc = mix(fc, uUnderCol, uUnder);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fc, clamp(fa, 0.0, 1.0));
}
`;
export type FogU = {[k: string]: THREE.IUniform};
export const fogUniforms = (): FogU => ({
  uHorizon: {value: HORIZON.clone()}, uSunGlow: {value: SUNGLOW.clone()}, uSunDir: {value: SUN.clone()}, uUnderCol: {value: UNDER.clone()},
  uFogDensity: {value: 0.0065}, uFogBase: {value: 1.5}, uUnder: {value: 0}, uUnderDensity: {value: 260},
  uDetailFar: {value: 14}, uDetail: {value: 1},
});

const addWorldPos = (vs: string) => vs.replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
  .replace('#include <project_vertex>', '#include <project_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');

// ---------- terrain top: imagery + baked light where the shape is the real canyon, strata colours elsewhere ----------
export const terrainMaterial = (look: Look, U: FogU) => {
  const m = new THREE.MeshStandardMaterial({vertexColors: true, map: look.imagery, roughness: 0.96, metalness: 0, fog: false});
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U, {uNormals: {value: look.normals}, uLight: {value: look.light}});
    sh.vertexShader = addWorldPos(sh.vertexShader).replace('#include <common>', '#include <common>\nattribute float imgW;\nvarying float vImgW;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvImgW = imgW;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${FOG_PARS}\n${NOISE}\nuniform sampler2D uNormals; uniform sampler2D uLight; varying float vImgW;`)
      .replace('#include <map_fragment>', '')
      .replace('#include <color_fragment>', /* glsl */`
        vec3 sat = texture2D(map, vMapUv).rgb;
        sat = pow(sat, vec3(0.92)) * vec3(1.10, 1.0, 0.88);                     // warm the winter imagery a little
        vec2 L = texture2D(uLight, vMapUv).rg;
        vec3 baked = sat * (0.5 + 0.5 * L.r) * (0.45 + 0.55 * L.g);
        float dist0 = length(vWPos - cameraPosition);
        float det = uDetail * clamp(1.0 - dist0 / uDetailFar, 0.0, 1.0);
        float grain = det > 0.0 ? fbm3(vWPos * 55.0) : 0.5;
        vec3 strata = vColor.rgb * (1.0 + det * (grain - 0.5) * 0.35);
        diffuseColor.rgb = mix(strata, baked, vImgW);`)
      .replace('#include <normal_fragment_maps>', /* glsl */`#include <normal_fragment_maps>
        vec3 nObj = texture2D(uNormals, vMapUv).xyz * 2.0 - 1.0;
        normal = normalize(mix(normal, normalize((viewMatrix * vec4(nObj, 0.0)).xyz), vImgW * 0.85));
        { float d1 = length(vWPos - cameraPosition); float dk = uDetail * clamp(1.0 - d1 / (uDetailFar * 0.5), 0.0, 1.0);
          if (dk > 0.0) normal = bumpN(-vViewPosition, normal, fbm3(vWPos * 140.0), 0.0035 * dk); }`)
      .replace('#include <fog_fragment>', FOG_APPLY);
  };
  m.customProgramCacheKey = () => 'gc-terrain';
  return m;
};

// ---------- the block's cut faces: strata with bedding planes, ledges and grain ----------
export const sideMaterial = (U: FogU) => {
  const m = new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.97, metalness: 0, side: THREE.DoubleSide, fog: false});
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = addWorldPos(sh.vertexShader);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${FOG_PARS}\n${NOISE}`)
      .replace('#include <color_fragment>', /* glsl */`#include <color_fragment>
        if (uDetail > 0.0) {
          float bed = sin(vWPos.y * 260.0 + fbm3(vWPos * vec3(3.0, 0.0, 3.0)) * 6.0);         // thin bedding planes
          float g = fbm3(vWPos * vec3(18.0, 70.0, 18.0));
          diffuseColor.rgb *= 0.86 + 0.16 * g + 0.06 * bed; }
        diffuseColor.rgb *= 0.92;`)
      .replace('#include <normal_fragment_maps>', /* glsl */`#include <normal_fragment_maps>
        { float d1 = length(vWPos - cameraPosition); float dk = uDetail * clamp(1.0 - d1 / uDetailFar, 0.0, 1.0);
          if (dk > 0.0) normal = bumpN(-vViewPosition, normal, fbm3(vWPos * vec3(30.0, 120.0, 30.0)), 0.004 * dk); }`)
      .replace('#include <fog_fragment>', FOG_APPLY);
  };
  m.customProgramCacheKey = () => 'gc-side';
  return m;
};

// ---------- the river: flowing ripples, depth tint across the channel, sky reflection through the environment ----------
export const waterMaterial = (U: FogU, uTime: THREE.IUniform) => {
  const m = new THREE.MeshStandardMaterial({color: '#2F5E55', roughness: 0.07, metalness: 0.0, transparent: true, opacity: 0.94,
    side: THREE.DoubleSide, fog: false, envMapIntensity: 1.2});
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U, {uTime});
    sh.vertexShader = addWorldPos(sh.vertexShader).replace('#include <common>', '#include <common>\nattribute vec2 flow;\nvarying vec2 vFlow;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFlow = flow;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${FOG_PARS}\n${NOISE}\nuniform float uTime; varying vec2 vFlow;`)
      .replace('#include <color_fragment>', /* glsl */`#include <color_fragment>
        float across = sin(clamp(vFlow.y, 0.0, 1.0) * 3.14159);            // deeper (darker, greener) mid-channel
        diffuseColor.rgb = mix(vec3(0.20, 0.30, 0.24), diffuseColor.rgb, 0.55 + 0.45 * (1.0 - across));`)
      .replace('#include <normal_fragment_maps>', /* glsl */`#include <normal_fragment_maps>
        { vec3 q = vec3(vFlow.x * 900.0 - uTime * 1.6, vFlow.y * 9.0, uTime * 0.35);   // metres along the flow
          float rip = vn3(q) * 0.6 + vn3(q * 2.7 + 3.1) * 0.4;
          float d1 = length(vWPos - cameraPosition);
          normal = bumpN(-vViewPosition, normal, rip, 0.0006 * clamp(1.0 - d1 / 6.0, 0.15, 1.0)); }`)
      .replace('#include <fog_fragment>', FOG_APPLY);
  };
  m.customProgramCacheKey = () => 'gc-water';
  return m;
};

// ---------- caustics on the riverbed (light focused by the ripples) ----------
export const bedMaterial = (uTime: THREE.IUniform, uCaustic: THREE.IUniform) => {
  const m = new THREE.MeshStandardMaterial({color: '#7C6C5A', roughness: 0.95});
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, {uTime, uCaustic});
    sh.vertexShader = addWorldPos(sh.vertexShader);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWPos; uniform float uTime; uniform float uCaustic;\n${NOISE}`)
      .replace('#include <color_fragment>', /* glsl */`#include <color_fragment>
        diffuseColor.rgb *= 0.8 + 0.4 * fbm3(vWPos * 4000.0);`)
      .replace('#include <emissivemap_fragment>', /* glsl */`#include <emissivemap_fragment>
        { vec2 p = vWPos.xz * 1400.0; float c = 0.0; vec2 q = p;
          for (int i = 0; i < 4; i++){ q += vec2(sin(q.y * 1.3 + uTime * 1.1), cos(q.x * 1.1 - uTime * 0.9)) * 0.55; c += 1.0 / (1.0 + 18.0 * abs(sin(q.x) * sin(q.y))); }
          totalEmissiveRadiance += vec3(0.55, 0.75, 0.62) * pow(c / 4.0, 3.0) * uCaustic; }`);
  };
  m.customProgramCacheKey = () => 'gc-bed';
  return m;
};

// ---------- sky dome (follows the camera); also baked once into the environment that lights everything ----------
export const skyMaterial = () => new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
  uniforms: {uHorizon: {value: HORIZON}, uZenith: {value: ZENITH}, uGround: {value: GROUND}, uSunGlow: {value: SUNGLOW}, uSunDir: {value: SUN}, uUnder: {value: 0}, uUnderCol: {value: UNDER}},
  vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: /* glsl */`varying vec3 vDir; uniform vec3 uHorizon, uZenith, uGround, uSunGlow, uSunDir, uUnderCol; uniform float uUnder;
    void main(){ vec3 d = normalize(vDir); float up = d.y;
      vec3 c = up > 0.0 ? mix(uHorizon, uZenith, pow(up, 0.55)) : mix(uHorizon, uGround, pow(-up, 0.4));
      float s = max(dot(d, uSunDir), 0.0); c += uSunGlow * (pow(s, 12.0) * 0.35 + pow(s, 400.0) * 0.8);
      gl_FragColor = vec4(mix(c, uUnderCol, uUnder), 1.0); }`,
});
export const makeEnvironment = (gl: THREE.WebGLRenderer) => {
  const sc = new THREE.Scene();
  const m = skyMaterial(); m.toneMapped = true;
  sc.add(new THREE.Mesh(new THREE.SphereGeometry(10, 48, 24), m));
  const pm = new THREE.PMREMGenerator(gl);
  const rt = pm.fromScene(sc, 0.02); pm.dispose();
  return rt.texture;
};

// ---------- rocks: a lumpy, flattened stone (pebbles, rockfall) ----------
export const stoneGeometry = (seed: number, detail = 3) => {
  const g = new THREE.IcosahedronGeometry(1, detail), p = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
  const n = (x: number, y: number, z: number) => { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 4.7) * 43758.5453; return s - Math.floor(s); };
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const k = 0.78 + 0.16 * Math.sin(v.x * 2.1 + seed) * Math.cos(v.z * 1.7 - seed) + 0.1 * n(Math.round(v.x * 3), Math.round(v.y * 3), Math.round(v.z * 3));
    v.multiplyScalar(k); v.y *= 0.62; p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
};

// soft contact-shadow disc (radial gradient), shared
let blob: THREE.Texture | null = null;
export const blobTexture = () => {
  if (blob) return blob;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d')!; const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(0,0,0,0.75)'); g.addColorStop(0.6, 'rgba(0,0,0,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  blob = new THREE.CanvasTexture(c); return blob;
};

// ---------- the schist boulder: foliation, a granite vein and grain computed per pixel (sharp at any distance) ----------
export const boulderMaterial = (origin: THREE.Vector3) => {
  const m = new THREE.MeshStandardMaterial({roughness: 0.72, metalness: 0.04});
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uOrigin = {value: origin};
    sh.vertexShader = addWorldPos(sh.vertexShader);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWPos; uniform vec3 uOrigin;\n${NOISE}`)
      .replace('#include <color_fragment>', /* glsl */`#include <color_fragment>
        vec3 q = (vWPos - uOrigin) * 1000.0;                                     // metres from the boulder
        float n1 = fbm3(q * 0.9), n3 = fbm3(q * 9.0 + 3.0);
        float fol = sin((q.y * 1.6 + q.x * 0.45) * 2.6 + n1 * 6.0) * (0.55 + 0.45 * fbm3(q * 2.7 + 7.0));
        vec3 c = mix(vec3(0.20, 0.19, 0.22), vec3(0.42, 0.39, 0.45), smoothstep(-0.2, 0.9, fol));
        c = mix(c, vec3(0.13, 0.12, 0.15), smoothstep(-0.3, -0.9, fol));
        float vd = abs(q.y - 0.35 * q.x - 0.9 + (n1 - 0.5) * 0.9);
        float vein = 1.0 - smoothstep(0.05, 0.09 + n3 * 0.04, vd);
        c = mix(c, vec3(0.78, 0.58, 0.52), vein);
        c *= (0.8 + 0.4 * n3) * 0.62;                                             // dark schist
        diffuseColor.rgb = c;`)
      .replace('#include <normal_fragment_maps>', /* glsl */`#include <normal_fragment_maps>
        { vec3 q2 = (vWPos - uOrigin) * 1000.0;
          normal = bumpN(-vViewPosition, normal, fbm3(q2 * 6.0) * 0.6 + fbm3(q2 * 22.0) * 0.4, 0.0009); }`);
  };
  m.customProgramCacheKey = () => 'gc-boulder';
  return m;
};
