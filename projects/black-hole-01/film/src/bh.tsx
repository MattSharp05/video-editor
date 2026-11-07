// The black hole: one full-screen shader that bends light around a Schwarzschild hole (units: horizon radius Rs = 1,
// hole at the origin, disk in the y = 0 plane). Each pixel's ray is traced backwards through curved space
// (photon acceleration -1.5 h² x / r⁵, the standard trick that reproduces Schwarzschild light bending), so the stars
// smear around the hole, the far side of the disk shows over the top and under the bottom, and the shadow is black
// because no ray that falls inside r = 1 comes back. Drawn first, behind everything (meshes sit in front of it).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
`;

const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3 camPos;
uniform mat4 camWorld;
uniform mat4 projInv;
uniform float time;      // seconds of film time (disk spin)
uniform float diskOn;    // 0..1 disk brightness
uniform float diskHeat;  // 0..1 extra white-hot inner disk
uniform float horizonLine; // 0..1 a glowing line on the edge (the event horizon label beat)
uniform float holeScale; // world units per Rs (the hole may be shown small or giant)
uniform vec3 holePos;
uniform float starOn;    // 0..1 the dying star stage (hides the hole, shows a star)
uniform float starR;     // the star's radius in Rs
uniform float exposure;
uniform float spin;      // disk angular speed factor

float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
vec3 stars(vec3 d) {
  vec3 col = vec3(0.0);
  // two layers of point stars on a direction grid
  for (int k = 0; k < 2; k++) {
    float sc = k == 0 ? 120.0 : 260.0;
    vec3 p = d * sc; vec3 c = floor(p); vec3 f = fract(p) - 0.5;
    float h = hash(c);
    if (h > (k == 0 ? 0.965 : 0.985)) {
      vec3 o = vec3(hash(c + 1.3), hash(c + 2.7), hash(c + 4.1)) - 0.5;
      float r = length(f - o * 0.6);
      float b = smoothstep(0.16, 0.0, r) * (0.5 + 2.0 * fract(h * 37.0));
      vec3 tint = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.85, 0.65), fract(h * 91.0));
      col += tint * b;
    }
  }
  // a faint violet-blue nebula band
  float n = noise(d * 3.0) * 0.6 + noise(d * 7.0) * 0.3 + noise(d * 15.0) * 0.1;
  float band = exp(-pow((d.y + 0.25 * d.x) * 2.2, 2.0));
  col += vec3(0.10, 0.07, 0.20) * pow(n, 2.2) * (0.35 + band) * 1.4;
  col += vec3(0.02, 0.03, 0.06) * band;
  return col;
}
// disk emission at radius r, angle a (hot inner edge at r = 3, fading out by r = 14)
vec4 disk(vec3 p, vec3 v) {
  float r = length(p.xz);
  if (r < 2.6 || r > 15.0) return vec4(0.0);
  float a = atan(p.z, p.x);
  float om = spin * 1.4 * pow(r, -1.5);         // Kepler: inner gas laps the outer
  float sw = a + time * om * 6.0;               // swirl angle carried with the gas
  float spiral = sw + log(r) * 2.2;             // spiral streaks: gas drains inward
  float n = noise(vec3(cos(spiral) * 3.0, sin(spiral) * 3.0, r * 1.6)) * 0.65 + noise(vec3(cos(sw) * 9.0, sin(sw) * 9.0, r * 5.0)) * 0.35;
  float edge = smoothstep(2.6, 3.4, r) * (1.0 - smoothstep(9.0, 15.0, r));
  float t = pow(3.0 / r, 1.6);                  // temperature falls outward
  // Doppler: gas moving toward the viewer (the ray comes from the camera, v points away from it) is brighter
  vec3 gasV = normalize(vec3(-p.z, 0.0, p.x));
  float toward = -dot(gasV, normalize(v)) * clamp(0.6 / sqrt(r), 0.0, 0.5);
  float beam = pow(1.0 + toward, 3.0);
  vec3 hot = mix(vec3(1.0, 0.42, 0.12), vec3(1.0, 0.86, 0.62), clamp(t * 1.2, 0.0, 1.0));
  hot = mix(hot, vec3(1.0, 0.97, 0.92), clamp(t * diskHeat * 1.4, 0.0, 1.0));
  float I = 0.5 * edge * (0.35 + 1.3 * n) * (0.5 + 2.6 * t) * beam * (1.0 + diskHeat * 1.6 * t);
  return vec4(hot * I * diskOn, clamp(edge * (0.55 + 0.45 * n) * diskOn, 0.0, 1.0));
}

void main() {
  vec4 ndc = vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  vec4 vd = projInv * ndc; vd /= vd.w;
  vec3 dir = normalize((camWorld * vec4(vd.xyz, 0.0)).xyz);
  vec3 pos = (camPos - holePos) / holeScale;
  vec3 col = vec3(0.0);
  float trans = 1.0;
  vec3 v = dir;
  float R0 = 40.0;
  // jump straight to the bounding sphere
  float b = dot(pos, v), c = dot(pos, pos) - R0 * R0;
  float disc = b * b - c;
  bool inside = c < 0.0;
  bool hit = false;
  if (!inside && (disc < 0.0 || b > 0.0)) {
    // misses the sphere: weak-field bend toward the hole (deflection 2 Rs / impact parameter)
    vec3 L = cross(pos, v); float imp = length(L);
    vec3 toward = normalize(cross(v, L));
    v = normalize(v + toward * (2.0 / max(imp, R0)));
  } else {
    if (!inside) pos += v * (-b - sqrt(disc));
    vec3 h = cross(pos, v); float h2 = dot(h, h);
    for (int i = 0; i < 120; i++) {
      float r = length(pos);
      if (r < 1.0) { hit = true; break; }
      if (r > R0 + 1.0) break;
      float dt = clamp(0.09 * (r - 0.6), 0.02, 2.0);
      vec3 acc = -1.5 * h2 * pos / pow(r, 5.0);
      vec3 np = pos + v * dt + 0.5 * acc * dt * dt;
      vec3 nv = v + acc * dt;
      if (pos.y * np.y < 0.0 && trans > 0.01) {
        float f = pos.y / (pos.y - np.y);
        vec3 hp = mix(pos, np, f);
        vec4 d = disk(hp, v);
        col += trans * d.rgb;
        trans *= 1.0 - d.a;
      }
      pos = np; v = normalize(nv);
    }
  }
  if (!hit) col += trans * stars(v);
  // the edge line: rays that skim the photon sphere
  if (horizonLine > 0.0) {
    vec3 L = cross((camPos - holePos) / holeScale, dir);
    float imp = length(L);
    float bc = 2.598; // critical impact parameter 3*sqrt(3)/2 Rs: the shadow's edge
    col += vec3(0.55, 0.85, 1.0) * horizonLine * exp(-pow((imp - bc) * 9.0, 2.0)) * 1.2;
  }
  col *= exposure;
  // filmic shoulder
  col = 1.25 * col / (1.0 + col);
  col = pow(col, vec3(1.0 / 1.1));
  gl_FragColor = vec4(col, 1.0);
}
`;

const DISP_F = /* glsl */ `
precision highp float; varying vec2 vUv; uniform sampler2D map;
void main() { gl_FragColor = texture2D(map, vUv); }
`;

// Traced at a fraction of the frame size (res, default 0.5: a quarter of the pixels) into a render target, then
// drawn behind everything; the hole is all soft light, so the upscale doesn't show. Full size cost ~7.7 s/frame on the CPU.
export const BlackHole: React.FC<{
  time: number; diskOn?: number; diskHeat?: number; horizonLine?: number; scale?: number; pos?: THREE.Vector3; exposure?: number; spin?: number; res?: number;
}> = ({time, diskOn = 1, diskHeat = 0, horizonLine = 0, scale = 1, pos, exposure = 1, spin = 1, res = 0.5}) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const {mat, scene, rt, disp, geo} = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, depthWrite: false, depthTest: false, toneMapped: false,
      uniforms: {
        camPos: {value: new THREE.Vector3()}, camWorld: {value: new THREE.Matrix4()}, projInv: {value: new THREE.Matrix4()},
        time: {value: 0}, diskOn: {value: 1}, diskHeat: {value: 0}, horizonLine: {value: 0}, holeScale: {value: 1},
        holePos: {value: new THREE.Vector3()}, starOn: {value: 0}, starR: {value: 1}, exposure: {value: 1}, spin: {value: 1},
      },
    });
    const geo = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    const q = new THREE.Mesh(geo, mat); q.frustumCulled = false; scene.add(q);
    const rt = new THREE.WebGLRenderTarget(Math.round(1080 * res), Math.round(1920 * res), {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false});
    const disp = new THREE.ShaderMaterial({vertexShader: vert, fragmentShader: DISP_F, depthWrite: false, depthTest: false, toneMapped: false, uniforms: {map: {value: rt.texture}}});
    return {mat, scene, rt, disp, geo};
  }, [res]);
  cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const u = mat.uniforms;
  u.camPos.value.copy(cam.position); u.camWorld.value.copy(cam.matrixWorld); u.projInv.value.copy(cam.projectionMatrixInverse);
  u.time.value = time; u.diskOn.value = diskOn; u.diskHeat.value = diskHeat; u.horizonLine.value = horizonLine; u.holeScale.value = scale;
  u.holePos.value.copy(pos ?? new THREE.Vector3()); u.exposure.value = exposure; u.spin.value = spin;
  // trace into the target before the main render (negative priority keeps r3f's own render)
  useFrame(() => {
    const prev = gl.getRenderTarget();
    gl.setRenderTarget(rt); gl.render(scene, cam); gl.setRenderTarget(prev);
  }, -1);
  return <mesh geometry={geo} material={disp} frustumCulled={false} renderOrder={-10} />;
};
