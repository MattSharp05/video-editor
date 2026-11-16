// The lidar look, drawn on every surface by a shader patch: laser returns from a sensor at L.pos land in rings
// (one ring per laser beam, fixed elevation angles) and along each ring at fixed azimuth steps, exactly where a
// spinning lidar's points fall on the world. Illustration: real beam counts and spacing differ by sensor.
//   L.mix      0 = the lit world, 1 = only the points on black (the car's 3D picture)
//   L.sweep    radians of azimuth revealed so far (a pulse sweeping round from L.start); >= 2π shows all
//   L.ring     0..1 a ring-shaped pulse travelling out from the sensor (radius = L.ringR metres)
// Patch a material once with lidar(material); all patched materials share the uniforms in L.
import * as THREE from 'three';

export const L = {
  pos: {value: new THREE.Vector3(0, 2.1, 0)},
  mix: {value: 0},
  sweep: {value: 0},
  start: {value: 0},
  ringR: {value: 0},
  ring: {value: 0},
  range: {value: 70},
  dots: {value: 0},       // 0 hides the dots (world only)
  camO: {value: new THREE.Vector3()}, camD: {value: new THREE.Vector3(0, 0, 1)}, camCos: {value: 0.9}, camA: {value: 0}, // camera cone: true colour inside
  you: {value: 0},        // the pedestrian's orange glow (set on the walker only)
};

const VERT_DECL = 'varying vec3 vLidarW;\n';
const VERT_BODY = `
  { vec4 lw = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    lw = instanceMatrix * lw;
  #endif
    vLidarW = (modelMatrix * lw).xyz; }
`;
const FRAG_DECL = `
varying vec3 vLidarW;
uniform vec3 uLPos, uCamO, uCamD; uniform float uLMix, uLSweep, uLStart, uLRingR, uLRing, uLRange, uLDots, uLMove, uCamCos, uCamA, uYou;
vec3 lidarRamp(float k) { // near = warm white, mid = accent cyan, far = deep blue
  return k < 0.5 ? mix(vec3(0.85, 1.0, 1.0), vec3(0.25, 0.95, 1.0), k * 2.0) : mix(vec3(0.25, 0.95, 1.0), vec3(0.12, 0.3, 0.9), (k - 0.5) * 2.0);
}
`;
const FRAG_BODY = `
  {
    vec3 d = vLidarW - uLPos; float r = length(d) + 1e-4;
    float el = degrees(asin(clamp(d.y / r, -1.0, 1.0)));
    float az = atan(d.z, d.x);
    // beams: dense near the horizon, sparser below (like a real roof lidar), from +12 to -30 degrees
    float b = el > -8.0 ? (el + 8.0) / 0.55 : -(sqrt(-el - 8.0 + 1.0) - 1.0) / 0.32;
    float bf = fract(b) - 0.5;
    float stepAz = radians(0.32);
    float af = fract(az / stepAz) - 0.5;
    vec2 cell = vec2(bf / max(fwidth(b), 1e-4), af / max(fwidth(az / stepAz), 1e-4));
    float dotR = 1.15;
    float dotA = (1.0 - smoothstep(dotR - 0.6, dotR + 0.6, length(cell))) * step(el, 12.0) * step(-30.0, el);
    float inRange = 1.0 - smoothstep(uLRange * 0.8, uLRange, r);
    float rel = mod(az - uLStart + 6.2831853, 6.2831853);
    float swept = uLSweep >= 6.283 ? 1.0 : step(rel, uLSweep);
    float head = uLSweep >= 6.283 ? 0.0 : exp(-pow((uLSweep - rel) * 6.0, 2.0)) * step(rel, uLSweep);
    float pts = dotA * inRange * swept * uLDots;
    vec3 pc = lidarRamp(clamp(r / uLRange, 0.0, 1.0)) * (1.0 + 1.5 * head);
    pc = mix(pc, vec3(0.62, 0.42, 1.0), uLMove);   // radar: things that move turn violet
    float ringA = uLRing * exp(-pow((r - uLRingR) * 1.4, 2.0));
    vec3 cd = vLidarW - uCamO; float inCone = uCamA * smoothstep(uCamCos - 0.02, uCamCos + 0.02, dot(normalize(cd), uCamD));
    float mixL = uLMix * (1.0 - inCone);
    vec3 base = gl_FragColor.rgb * (1.0 - 0.94 * mixL) + vec3(1.0, 0.92, 0.75) * inCone * 0.04;
    base += vec3(1.0, 0.45, 0.08) * uYou * (0.55 + 0.45 * uLMix);
    gl_FragColor.rgb = base + pc * pts * (0.35 + 0.65 * mixL) * 1.6 + vec3(0.3, 0.95, 1.0) * ringA * 0.9;
  }
`;

export const lidar = <T extends THREE.Material>(m: T, move?: {value: number}, you?: {value: number}): T => {
  if (m.userData.lidar) return m; m.userData.lidar = true;
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (s, r) => {
    prev?.call(m, s, r);
    Object.assign(s.uniforms, {uLPos: L.pos, uLMix: L.mix, uLSweep: L.sweep, uLStart: L.start, uLRingR: L.ringR, uLRing: L.ring,
      uLRange: L.range, uLDots: L.dots, uLMove: move ?? {value: 0},
      uCamO: L.camO, uCamD: L.camD, uCamCos: L.camCos, uCamA: L.camA, uYou: you ?? {value: 0}});
    s.vertexShader = VERT_DECL + s.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n' + VERT_BODY);
    s.fragmentShader = FRAG_DECL + s.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n' + FRAG_BODY);
  };
  m.customProgramCacheKey = () => 'lidar' + (move ? 'm' : '') + (you ? 'y' : '');
  m.needsUpdate = true;
  return m;
};

// Patch every mesh material under an object (clones shared materials so a per-object `move` uniform stays its own).
export const lidarAll = (o: THREE.Object3D, move?: {value: number}, you?: {value: number}) => {
  o.traverse((c) => {
    const mesh = c as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const out = mats.map((mm) => { const c = move || you ? mm.clone() : mm; if (c !== mm) delete c.userData.lidar; return lidar(c, move, you); });
    mesh.material = Array.isArray(mesh.material) ? out : out[0];
  });
};
