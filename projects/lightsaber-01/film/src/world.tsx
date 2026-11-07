// Lightsaber 01: the world and its objects, all built in code (no film props copied: an original hilt design,
// generic hooded figures, a generic battle station). Units: metres. Every component is posed from props only
// (pure function of the film time), so stills match the render.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {fbm2, rng} from './kit/noise';

export const BLUE = new THREE.Color('#5fc8ff');
export const RED = new THREE.Color('#ff3b30');
export const FIELD = new THREE.Color('#b9a7ff'); // the magnetic field: one colour, one meaning
export const GREEN = new THREE.Color('#7dff6a'); // the battle station's beam only

// ---------- shared shaders ----------
const GLOW_V = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`;
const GLOW_F = /* glsl */ `
uniform vec3 uColor; uniform float uI; uniform float uP;
varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), uP); gl_FragColor = vec4(uColor * uI * f, 1.0); }`;
const glowMat = (color: THREE.Color, p: number) =>
  new THREE.ShaderMaterial({
    uniforms: {uColor: {value: color.clone()}, uI: {value: 1}, uP: {value: p}},
    vertexShader: GLOW_V, fragmentShader: GLOW_F, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  });

// ---------- environment for metal reflections (hero objects only: look pass rule) ----------
export const useRoomEnv = () => {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return tex;
  }, [gl]);
};

// ---------- the blade ----------
// A plasma blade from the emitter (local y = 0) up to `len`: white core, two additive glow shells, a soft tip.
// `ign` 0..1 grows it; `laser` 0..1 turns it into a thin hard beam (the wrong idea) of length `len`.
export const Blade: React.FC<{len: number; color: THREE.Color; ign: number; t: number; laser?: number; flick?: number; seed?: number; see?: number; dim?: number}> = ({
  len, color, ign, t, laser = 0, flick = 1, seed = 0, see = 0, dim = 1,
}) => {
  const cyl = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 28, 1, true).translate(0, 0.5, 0), []);
  const sph = useMemo(() => new THREE.SphereGeometry(1, 24, 16), []);
  const core = useMemo(() => new THREE.MeshBasicMaterial({color: '#ffffff', toneMapped: false, transparent: true, fog: false}), []);
  const g1 = useMemo(() => glowMat(color, 1.6), [color]);
  const g2 = useMemo(() => glowMat(color, 2.6), [color]);
  const L = Math.max(1e-4, len * ign);
  // the hum made visible: a tiny shimmer in width and brightness
  const sh = 1 + flick * (0.04 * Math.sin(t * 61 + seed) + 0.03 * Math.sin(t * 37.3 + seed * 2));
  const w = THREE.MathUtils.lerp(1, 0.28, laser);
  const k = dim * (1 - 0.55 * see);
  core.opacity = dim * (1 - 0.8 * see);
  g1.uniforms.uI.value = 1.25 * sh * (ign > 0 ? 1 : 0) * k;
  g2.uniforms.uI.value = 0.55 * sh * (ign > 0 ? 1 : 0) * (1 - 0.6 * laser) * k;
  const rc = 0.0085 * w, r1 = 0.021 * w * sh, r2 = 0.062 * w * sh;
  if (ign <= 0) return null;
  if (laser > 0.5 && L > 3) {
    const tipR = 0.0035 + L * 0.0011;
    return (
      <group>
        <mesh material={core} position={[0, L / 2, 0]} renderOrder={5}><cylinderGeometry args={[tipR * 0.5, 0.003, L, 12, 1, true]} /></mesh>
        <mesh material={g1} position={[0, L / 2, 0]} renderOrder={6}><cylinderGeometry args={[tipR * 2.2, 0.009, L, 16, 1, true]} /></mesh>
      </group>
    );
  }
  return (
    <group>
      <mesh geometry={cyl} material={core} scale={[rc, L, rc]} renderOrder={5} />
      <mesh geometry={sph} material={core} scale={[rc, rc * (laser > 0.5 ? 1 : 2.2), rc]} position={[0, L, 0]} renderOrder={5} />
      <mesh geometry={cyl} material={g1} scale={[r1, L, r1]} renderOrder={6} />
      <mesh geometry={sph} material={g1} scale={[r1, r1 * 1.8, r1]} position={[0, L, 0]} renderOrder={6} />
      <mesh geometry={cyl} material={g2} scale={[r2, L, r2]} renderOrder={7} />
      <mesh geometry={sph} material={g2} scale={[r2, r2 * 1.4, r2]} position={[0, L, 0]} renderOrder={7} />
    </group>
  );
};

// ---------- the hilt ----------
// An original hilt: ribbed grip, a windowed chamber (the crystal), a ring of magnet coils, a flared emitter.
// Local y from the pommel (0) to the emitter mouth (HILT_LEN). `xray` 0..1 fades the shell to glass and reveals
// the parts inside; `coils` 0..1 energises the magnets; `crystal` 0..1 lights the crystal.
export const HILT_LEN = 0.29;
const lathe = (pts: [number, number][], seg = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
export const Hilt: React.FC<{env: THREE.Texture; xray: number; coils: number; crystal: number; color: THREE.Color; dark?: boolean}> = ({
  env, xray, coils, crystal, color, dark,
}) => {
  const geo = useMemo(() => {
    const grip: [number, number][] = [[0.0, 0.0], [0.017, 0.0], [0.0205, 0.006], [0.0205, 0.024], [0.016, 0.03]];
    for (let i = 0; i < 12; i++) { const y = 0.034 + i * 0.0085; grip.push([0.0168, y], [0.0186, y + 0.002], [0.0186, y + 0.0055], [0.0168, y + 0.0075]); }
    grip.push([0.0175, 0.138], [0.0195, 0.142]);
    const body: [number, number][] = [[0.0195, 0.142], [0.0198, 0.205], [0.0185, 0.21], [0.0185, 0.226], [0.021, 0.232], [0.0245, 0.268],
      [0.0255, 0.284], [0.0235, HILT_LEN], [0.0125, HILT_LEN], [0.0125, 0.27], [0.0, 0.27]];
    const tex = (() => { // brushed-metal roughness strip
      const c = document.createElement('canvas'); c.width = 8; c.height = 256; const g = c.getContext('2d')!; const r = rng(7);
      for (let y = 0; y < 256; y++) { const v = 140 + r() * 70; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(0, y, 8, 1); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
    })();
    return {
      grip: lathe(grip), body: lathe(body), tex,
      window: new THREE.CylinderGeometry(0.0201, 0.0201, 0.044, 40, 1, true, -0.7, 1.4).translate(0, 0.172, 0),
      cell: new THREE.CylinderGeometry(0.0105, 0.0105, 0.1, 24).translate(0, 0.085, 0),
      crystal: new THREE.OctahedronGeometry(0.011, 0).scale(0.85, 1.9, 0.85).translate(0, 0.172, 0),
      lens: new THREE.CylinderGeometry(0.011, 0.011, 0.0025, 32).translate(0, 0.205, 0),
      coil: new THREE.TorusGeometry(0.0145, 0.0026, 10, 40),
      button: new THREE.BoxGeometry(0.011, 0.008, 0.006),
    };
  }, []);
  const mats = useMemo(() => {
    const metal = new THREE.MeshPhysicalMaterial({color: '#c9ccd2', metalness: 1, roughness: 0.26, envMap: env, envMapIntensity: 1.1, clearcoat: 0.3, transparent: true});
    const grip = new THREE.MeshStandardMaterial({color: dark ? '#141414' : '#1c1d20', metalness: 0.2, roughness: 0.75, envMap: env, envMapIntensity: 0.6, transparent: true});
    const copper = new THREE.MeshStandardMaterial({color: '#b87333', metalness: 1, roughness: 0.35, envMap: env, emissive: FIELD.clone(), emissiveIntensity: 0});
    const cell = new THREE.MeshStandardMaterial({color: '#2a3140', metalness: 0.6, roughness: 0.4, envMap: env, emissive: new THREE.Color('#ffb347'), emissiveIntensity: 0});
    const cry = new THREE.MeshPhysicalMaterial({color: color.clone(), emissive: color.clone(), emissiveIntensity: 0.6, roughness: 0.05, metalness: 0, transmission: 0, envMap: env, flatShading: true, toneMapped: false});
    const lens = new THREE.MeshPhysicalMaterial({color: '#dfefff', roughness: 0.05, metalness: 0.1, envMap: env, transparent: true, opacity: 0.5});
    const glass = new THREE.MeshPhysicalMaterial({color: '#9fc4d8', roughness: 0.08, metalness: 0, envMap: env, transparent: true, opacity: 0.35});
    const button = new THREE.MeshStandardMaterial({color: '#d9a441', metalness: 1, roughness: 0.3, envMap: env});
    const halo = glowMat(color, 1.2);
    return {metal, grip, copper, cell, cry, lens, glass, button, halo};
  }, [env, geo, color, dark]);
  const shell = 1 - 0.86 * xray;
  mats.metal.opacity = shell; mats.grip.opacity = shell;
  mats.metal.depthWrite = mats.grip.depthWrite = xray < 0.5;
  mats.glass.opacity = 0.35 * (1 - 0.75 * xray);
  mats.copper.emissiveIntensity = 0.75 * coils;
  mats.cell.emissiveIntensity = 0.8 * xray;
  mats.cry.emissiveIntensity = 0.5 + 1.6 * crystal;
  mats.halo.uniforms.uI.value = 1.1 * crystal * xray;
  return (
    <group>
      {/* inside first (drawn under the glass shell) */}
      <group visible={xray > 0.02}>
        <mesh geometry={geo.cell} material={mats.cell} renderOrder={1} />
        <mesh geometry={geo.lens} material={mats.lens} renderOrder={2} />
        {[0.232, 0.244, 0.256].map((y, i) => <mesh key={i} geometry={geo.coil} material={mats.copper} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={1} />)}
      </group>
      <mesh geometry={geo.crystal} material={mats.cry} renderOrder={2} />
      <mesh geometry={geo.crystal} material={mats.halo} scale={[2.2, 1.35, 2.2]} position={[0, -0.175 * 0.35, 0]} renderOrder={8} />
      <mesh geometry={geo.grip} material={mats.grip} renderOrder={3} />
      <mesh geometry={geo.body} material={mats.metal} renderOrder={3} />
      <mesh geometry={geo.window} material={mats.glass} renderOrder={4} />
      <mesh geometry={geo.button} material={mats.button} position={[0, 0.152, 0.0205]} renderOrder={3} />
    </group>
  );
};

// ---------- a hooded, robed figure holding a hilt in two hands ----------
// `grip` is the world pose of the hilt base and its axis; the arms reach it (a two-bone reach, rebuilt per frame).
const robeGeo = () => {
  const pts: [number, number][] = [[0.0, 0.0], [0.42, 0.0], [0.4, 0.15], [0.33, 0.55], [0.24, 0.95], [0.2, 1.08], [0.23, 1.3], [0.25, 1.42], [0.2, 1.5], [0.09, 1.56], [0.0, 1.57]];
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 64);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { // cloth folds, deeper toward the hem; flatter front to back
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), k = Math.max(0, 1.1 - y) * 0.06;
    const s = 1 + k * Math.sin(a * 9 + y * 3) + 0.02 * Math.sin(a * 23);
    p.setXYZ(i, x * s, y, z * s * 0.78);
  }
  g.computeVertexNormals();
  return g;
};
export const Figure: React.FC<{pos: [number, number, number]; yaw: number; cloth: string; base: THREE.Vector3; axis: THREE.Vector3; sway: number; heat?: number}> = ({
  pos, yaw, cloth, base, axis, sway, heat = 0,
}) => {
  const robe = useMemo(robeGeo, []);
  const hood = useMemo(() => {
    // a cowl open at the front, peaked at the back, falling onto the shoulders
    const g = new THREE.SphereGeometry(1, 48, 32, Math.PI / 2 + 0.75, Math.PI * 2 - 1.5, 0, Math.PI * 0.8);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      y += 0.28 * Math.max(0, -z) * Math.max(0, y); z -= 0.12 * Math.max(0, y);          // peak, tipped back
      const flare = 1 + 0.35 * Math.max(0, -y);                                            // widens as it falls
      x *= flare; z *= flare; x *= 1 + 0.04 * Math.sin(Math.atan2(z, x) * 7);
      p.setXYZ(i, x * 0.175, y * 0.2, z * 0.2);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const mantle = useMemo(() => {
    const pts: [number, number][] = [[0.1, 1.6], [0.17, 1.53], [0.27, 1.42], [0.3, 1.32], [0.285, 1.24]];
    const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 64);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), s = 1 + 0.035 * Math.sin(a * 11); p.setXYZ(i, x * s, p.getY(i), z * s * 0.8); }
    g.computeVertexNormals();
    return g;
  }, []);
  const face = useMemo(() => new THREE.SphereGeometry(0.125, 24, 16), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({color: cloth, roughness: 0.95, metalness: 0, side: THREE.DoubleSide}), [cloth]);
  const shadow = useMemo(() => new THREE.MeshBasicMaterial({color: '#030304'}), []);
  const glove = useMemo(() => new THREE.MeshStandardMaterial({color: '#201812', roughness: 0.8, emissive: new THREE.Color('#ff6a1a'), emissiveIntensity: 0}), []);
  glove.emissiveIntensity = 2.4 * heat;
  // arms: shoulder -> elbow -> hand, in world space (the figure's group is at pos/yaw)
  const arms = useMemo(() => {
    const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(...pos);
    const out: THREE.TubeGeometry[] = [];
    ([[-1, 0.06], [1, 0.135]] as [number, number][]).forEach(([side, along]) => {
      const sh = new THREE.Vector3(side * 0.21, 1.43, 0.02).applyMatrix4(m);
      const hand = base.clone().addScaledVector(axis, along);
      const mid = sh.clone().lerp(hand, 0.5);
      const out_ = new THREE.Vector3(side * 0.16, -0.12, -0.02).applyMatrix4(new THREE.Matrix4().makeRotationY(yaw));
      const elbow = mid.add(out_);
      const curve = new THREE.CatmullRomCurve3([sh, elbow, hand]);
      const tube = new THREE.TubeGeometry(curve, 16, 0.043, 10, false);
      const r = tube.attributes.position as THREE.BufferAttribute; // sleeves taper toward the wrist
      out.push(tube);
      void r;
    });
    return out;
  }, [pos, yaw, base, axis]);
  const hands = [base.clone().addScaledVector(axis, 0.06), base.clone().addScaledVector(axis, 0.135)];
  return (
    <group>
      <group position={pos} rotation={[0, yaw, 0]}>
        <mesh geometry={robe} material={mat} rotation={[0, 0, sway * 0.02]} />
        <mesh geometry={mantle} material={mat} />
        <mesh geometry={hood} material={mat} position={[0, 1.64, -0.02]} rotation={[-0.12, 0, 0]} />
        <mesh geometry={face} material={shadow} position={[0, 1.61, 0.0]} scale={[0.95, 1.1, 0.9]} />
      </group>
      {arms.map((g, i) => <mesh key={i} geometry={g} material={mat} />)}
      {hands.map((h, i) => <mesh key={i} position={h} material={glove} scale={[0.04, 0.045, 0.04]}><sphereGeometry args={[1, 16, 12]} /></mesh>)}
    </group>
  );
};

// ---------- the battle station in the sky ----------
const DS_V = /* glsl */ `
varying vec3 vO; varying vec3 vW;
void main(){ vO = normalize(position); vW = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const DS_F = /* glsl */ `
uniform vec3 uSun; uniform vec3 uSky; uniform float uHaze; uniform float uCharge; uniform vec3 uBeam; uniform vec3 uDish;
varying vec3 vO; varying vec3 vW;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
void main(){
  vec3 n = normalize(vO);
  float lat = asin(clamp(n.y,-1.0,1.0)), lon = atan(n.z, n.x);
  vec2 g1 = vec2(lon * 30.0, lat * 30.0) / 3.14159; vec2 id1 = floor(g1), f1 = fract(g1);
  vec2 g2 = vec2(lon * 140.0, lat * 140.0) / 3.14159; vec2 id2 = floor(g2), f2 = fract(g2);
  float base = 0.42 + 0.14 * h(id1) + 0.07 * h(id2);
  float line1 = smoothstep(0.0, 0.05, min(min(f1.x, 1.0 - f1.x), min(f1.y, 1.0 - f1.y)));
  float line2 = smoothstep(0.0, 0.12, min(min(f2.x, 1.0 - f2.x), min(f2.y, 1.0 - f2.y)));
  base *= mix(0.55, 1.0, line1) * mix(0.8, 1.0, line2);
  // the equatorial trench
  float tr = abs(lat);
  base *= mix(0.12, 1.0, smoothstep(0.008, 0.016, tr));
  base += 0.18 * (1.0 - smoothstep(0.0, 0.004, abs(tr - 0.017)));
  // the dish: concave, ringed, with a focus that charges
  float a = acos(clamp(dot(n, normalize(uDish)), -1.0, 1.0));
  float inDish = 1.0 - smoothstep(0.30, 0.31, a);
  float rings = 0.75 + 0.25 * smoothstep(0.3, 0.7, abs(fract(a * 38.0) - 0.5) * 2.0);
  float dishShade = mix(0.55, 0.85, a / 0.3) * rings;
  base = mix(base, base * dishShade, inDish);
  base += 0.22 * (1.0 - smoothstep(0.0, 0.006, abs(a - 0.305)));
  float lit = max(dot(normalize(vW), normalize(uSun)), 0.0);
  // the dish faces away from the sun's angle: light it as concave (reversed)
  vec3 col = vec3(base) * (0.1 + 0.9 * lit);
  // small lights on the night side
  float on = step(0.985, h(id2 * 1.37 + 3.1)) * (1.0 - lit) * (1.0 - smoothstep(0.08, 0.16, length(f2 - 0.5)));
  col += vec3(1.0, 0.85, 0.6) * on * 0.45;
  // focus glow and charging rim on the dish
  float foc = exp(-a * a / 0.0009) * uCharge;
  float rim = inDish * smoothstep(0.2, 0.3, a) * uCharge * 0.35;
  col += uBeam * (foc * 3.0 + rim);
  col = mix(col, uSky, uHaze);
  gl_FragColor = vec4(col, 1.0);
}`;
export const DISH = new THREE.Vector3(0.62, 0.42, 0.66).normalize();
export const Station: React.FC<{pos: THREE.Vector3; r: number; charge: number; sun: THREE.Vector3; haze: number; spin: number}> = ({pos, r, charge, sun, haze, spin}) => {
  const geo = useMemo(() => new THREE.SphereGeometry(1, 128, 96), []);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {uSun: {value: new THREE.Vector3()}, uSky: {value: new THREE.Color('#141c30')}, uHaze: {value: 0}, uCharge: {value: 0}, uBeam: {value: GREEN.clone()}, uDish: {value: DISH.clone()}},
    vertexShader: DS_V, fragmentShader: DS_F, fog: false,
  }), []);
  mat.uniforms.uSun.value.copy(sun); mat.uniforms.uHaze.value = haze; mat.uniforms.uCharge.value = charge;
  return <mesh geometry={geo} material={mat} position={pos} scale={r} rotation={[0, spin, 0]} />;
};

// ---------- sky: gradient, stars and a faint galaxy band, all in one shader ----------
const SKY_F = /* glsl */ `
uniform vec3 uHor; uniform vec3 uZen; uniform float uFlash; uniform vec3 uFlashC;
varying vec3 vD;
float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
void main(){
  vec3 d = normalize(vD);
  float e = clamp(d.y, -0.2, 1.0);
  vec3 col = mix(uHor, uZen, pow(smoothstep(-0.05, 0.6, e), 0.7));
  vec3 p = d * 260.0; vec3 id = floor(p); vec3 f = fract(p) - 0.5;
  float s = step(0.9935, h3(id)); float b = h3(id + 7.0);
  col += vec3(0.8, 0.88, 1.0) * s * smoothstep(0.32, 0.0, length(f)) * (0.35 + 0.9 * b) * smoothstep(0.0, 0.25, e);
  float band = exp(-pow(dot(d, normalize(vec3(0.5, 0.3, -0.8))), 2.0) * 18.0);
  col += vec3(0.16, 0.13, 0.22) * band * 0.35 * smoothstep(0.05, 0.4, e) * (0.6 + 0.4 * h3(floor(d * 40.0)));
  col += uFlashC * uFlash * (0.3 + 0.7 * smoothstep(-0.1, 0.5, e));
  gl_FragColor = vec4(col, 1.0);
}`;
export const Sky: React.FC<{flash: number}> = ({flash}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {uHor: {value: new THREE.Color('#1d2a44')}, uZen: {value: new THREE.Color('#02040a')}, uFlash: {value: 0}, uFlashC: {value: GREEN.clone().multiplyScalar(0.25)}},
    vertexShader: `varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: SKY_F, side: THREE.BackSide, depthWrite: false, fog: false,
  }), []);
  mat.uniforms.uFlash.value = flash;
  const cam = useThree((s) => s.camera);
  return <mesh material={mat} position={cam.position} scale={1800} renderOrder={-10}><sphereGeometry args={[1, 48, 32]} /></mesh>;
};

// ---------- ground: a rocky ridge at night, falling to a valley and far mountains ----------
export const heightAt = (x: number, z: number) => {
  const ridge = -Math.max(0, -z - 2) * 0.45 - Math.max(0, z - 4) * 0.08; // the crest the figures stand on, falling away behind
  const far = Math.min(55, Math.max(0, -z - 60) * 0.25) * (0.45 + 0.55 * fbm2(x * 0.006, z * 0.006, 3)); // mountains rising beyond the valley
  return ridge + far + fbm2(x * 0.05, z * 0.05, 1) * 1.6 + fbm2(x * 0.6, z * 0.6, 2) * 0.12 - Math.min(0, 0) ;
};
export const Ground: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(900, 900, 300, 300).rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      // denser near the figures: warp the grid toward the origin
      let x = p.getX(i), z = p.getZ(i);
      const r = Math.hypot(x, z), k = Math.pow(r / 636, 1.9) * 636 / Math.max(r, 1e-6);
      x *= k; z *= k;
      const y = heightAt(x, z) - heightAt(0, 0.2);
      p.setXYZ(i, x, y, z);
      const v = 0.75 + 0.35 * fbm2(x * 0.3, z * 0.3, 5);
      col[i * 3] = 0.36 * v; col[i * 3 + 1] = 0.34 * v; col[i * 3 + 2] = 0.36 * v;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.97, metalness: 0}), []);
  const rocks = useMemo(() => {
    const r = rng(11), n = 140, ge = new THREE.IcosahedronGeometry(1, 2);
    const pp = ge.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pp.count; i++) { const s = 0.75 + 0.5 * r(); pp.setXYZ(i, pp.getX(i) * s, pp.getY(i) * s * 0.6, pp.getZ(i) * s); }
    ge.computeVertexNormals();
    const m = new THREE.InstancedMesh(ge, new THREE.MeshStandardMaterial({color: '#3e3b40', roughness: 0.95}), n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = 1.6 + Math.pow(r(), 1.6) * 40, x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.abs(x) < 1.2 && z > -1 && z < 3) continue;
      if (Math.hypot(x, z) < 6) continue; // nothing near the figures or the lens
      const s = 0.1 + Math.pow(r(), 3) * 0.7;
      o.position.set(x, heightAt(x, z) - heightAt(0, 0.2) - s * 0.25, z); o.rotation.set(r() * 3, r() * 3, r() * 3); o.scale.setScalar(s); o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    return m;
  }, []);
  return (
    <group>
      <mesh geometry={geo} material={mat} />
      <primitive object={rocks} />
    </group>
  );
};

// ---------- plasma particles: a wild spray (problem) or a loop up the core and back down the skin (the answer) ----------
const PL_V = /* glsl */ `
uniform float uT; uniform float uLen; uniform float uWild; uniform float uLoop; uniform float uSize; uniform float uSpread;
attribute vec4 aP; // phase, lane angle, speed, size
varying float vA;
const float PI = 3.14159265;
void main(){
  float ph = fract(aP.x + uT * aP.z);
  float ang = aP.y;
  // the loop: up the centre (r small), over the tip, down the outer skin
  vec3 loopP;
  float up = 0.55, over = 0.08;
  if (ph < up) { float k = ph / up; loopP = vec3(cos(ang) * 0.004, k * uLen, sin(ang) * 0.004); }
  else if (ph < up + over) { float k = (ph - up) / over; float r = mix(0.004, 0.017, k); loopP = vec3(cos(ang) * r, uLen + sin(k * PI) * 0.03, sin(ang) * r); }
  else { float k = (ph - up - over) / (1.0 - up - over); loopP = vec3(cos(ang) * 0.017, (1.0 - k) * uLen, sin(ang) * 0.017); }
  // the wild spray: leaves the emitter in a wide cone and spreads, some falling back toward the hand
  float k = fract(aP.x * 7.13 + uT * aP.z * 1.7);
  float cone = 0.25 + 1.2 * fract(aP.x * 3.7);
  vec3 dir = normalize(vec3(cos(ang) * cone, 1.0 - 0.9 * step(0.8, fract(aP.x * 11.0)) * 1.8, sin(ang) * cone));
  vec3 wildP = dir * k * uSpread + vec3(0.0, -0.5 * k * k * 0.1, 0.0);
  vec3 p = mix(loopP, wildP, uWild);
  vA = mix(uLoop, 1.0 - k, uWild);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * aP.w * (300.0 / max(-mv.z, 0.01));
  gl_Position = projectionMatrix * mv;
}`;
const PL_F = /* glsl */ `
uniform vec3 uColor; varying float vA;
void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(uColor * a * vA, 1.0); }`;
export const Plasma: React.FC<{t: number; len: number; wild: number; loop: number; color: THREE.Color; n?: number; size?: number}> = ({t, len, wild, loop, color, n = 900, size = 0.09}) => {
  const {geo, mat} = useMemo(() => {
    const r = rng(23), g = new THREE.BufferGeometry(), a = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) { a[i * 4] = r(); a[i * 4 + 1] = r() * Math.PI * 2; a[i * 4 + 2] = 0.35 + r() * 0.35; a[i * 4 + 3] = 0.5 + r(); }
    g.setAttribute('aP', new THREE.BufferAttribute(a, 4));
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
    const m = new THREE.ShaderMaterial({
      uniforms: {uT: {value: 0}, uLen: {value: 1}, uWild: {value: 0}, uLoop: {value: 1}, uSize: {value: size}, uSpread: {value: 0.45}, uColor: {value: color.clone()}},
      vertexShader: PL_V, fragmentShader: PL_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    });
    return {geo: g, mat: m};
  }, [n, color, size]);
  mat.uniforms.uT.value = t; mat.uniforms.uLen.value = len; mat.uniforms.uWild.value = wild; mat.uniforms.uLoop.value = loop;
  return <points geometry={geo} material={mat} renderOrder={9} />;
};

// ---------- the magnetic field: loops that leave the emitter, run up the blade and come back ----------
export const FieldLines: React.FC<{len: number; on: number; t: number; bulge?: number}> = ({len, on, t, bulge = 0}) => {
  const lines = useMemo(() => {
    const out: THREE.TubeGeometry[] = [];
    const N = 10;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2, pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 40; k++) {
        const u = k / 40, y = u * 1.0, r = 0.016 + 0.024 * Math.sin(Math.PI * Math.min(1, u * 1.05)) ** 0.6;
        pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      }
      out.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.0011, 5, false));
    }
    return out;
  }, []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({color: FIELD.clone(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false}), []);
  mat.opacity = on * (0.55 + 0.1 * Math.sin(t * 9));
  if (on <= 0.001) return null;
  return (
    <group scale={[1 + bulge, len, 1 + bulge]} rotation={[0, t * 0.8, 0]}>
      {lines.map((g, i) => <mesh key={i} geometry={g} material={mat} renderOrder={10} />)}
    </group>
  );
};

// ---------- sparks where two blades meet ----------
const SP_V = /* glsl */ `
uniform float uT; uniform float uOn; attribute vec4 aS; varying float vA;
void main(){
  float life = 0.35 + 0.3 * fract(aS.x * 9.1);
  float age = mod(uT * (0.8 + aS.z) + aS.x, life) / life;
  vec3 dir = normalize(vec3(cos(aS.y) * (0.6 + aS.w), sin(aS.y * 1.7) * 0.8 + 0.4, sin(aS.y) * (0.6 + aS.w)));
  vec3 p = dir * age * (0.25 + 0.35 * aS.w) * (0.6 + 0.8 * uOn) + vec3(0.0, -1.2 * age * age * 0.3, 0.0);
  vA = (1.0 - age) * uOn;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (0.03 + 0.05 * aS.w) * (300.0 / max(-mv.z, 0.01));
  gl_Position = projectionMatrix * mv;
}`;
export const Sparks: React.FC<{t: number; on: number; pos: THREE.Vector3}> = ({t, on, pos}) => {
  const {geo, mat} = useMemo(() => {
    const r = rng(41), n = 700, g = new THREE.BufferGeometry(), a = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) { a[i * 4] = r(); a[i * 4 + 1] = r() * Math.PI * 2; a[i * 4 + 2] = r(); a[i * 4 + 3] = r(); }
    g.setAttribute('aS', new THREE.BufferAttribute(a, 4));
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
    const m = new THREE.ShaderMaterial({
      uniforms: {uT: {value: 0}, uOn: {value: 0}},
      vertexShader: SP_V, fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(1.0, 0.85, 0.6) * smoothstep(0.5, 0.0, d) * vA * 2.0, 1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    });
    return {geo: g, mat: m};
  }, []);
  mat.uniforms.uT.value = t; mat.uniforms.uOn.value = on;
  if (on <= 0.001) return null;
  return <points geometry={geo} material={mat} position={pos} renderOrder={11} />;
};

// soft dust near the lens, catching the blade light
export const Dust: React.FC<{t: number; center: THREE.Vector3; amount: number}> = ({t, center, amount}) => {
  const {geo, mat} = useMemo(() => {
    const r = rng(5), n = 220, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { p[i * 3] = (r() - 0.5) * 6; p[i * 3 + 1] = r() * 3; p[i * 3 + 2] = (r() - 0.5) * 6; }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({color: '#9fb6d6', size: 0.012, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true});
    return {geo: g, mat: m};
  }, []);
  mat.opacity = 0.5 * amount;
  return <points geometry={geo} material={mat} position={[center.x - 3 + Math.sin(t * 0.1) * 0.3, center.y - 1 + t * 0.02, center.z - 3]} />;
};

// the battle station's beam: eight tributaries converge in front of the dish, then one beam leaves
export const Superlaser: React.FC<{station: THREE.Vector3; r: number; k: number; fire: number; target: THREE.Vector3}> = ({station, r, k, fire, target}) => {
  const focus = station.clone().addScaledVector(DISH, r * 1.35);
  const rimC = station.clone().addScaledVector(DISH, r * 0.955);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({color: GREEN.clone().multiplyScalar(2.2), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false}), []);
  const glow = useMemo(() => glowMat(GREEN, 1.4), []);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), DISH);
  const tribs = Array.from({length: 8}, (_, i) => {
    const a = (i / 8) * Math.PI * 2, off = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)).multiplyScalar(r * 0.29).applyQuaternion(q);
    const from = rimC.clone().add(off), dir = focus.clone().sub(from), len = dir.length() * k;
    const qq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return {from, len, qq};
  });
  const bd = target.clone().sub(focus), blen = bd.length() * fire, bq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), bd.normalize());
  if (k <= 0) return null;
  return (
    <group>
      {tribs.map((b, i) => (
        <group key={i} position={b.from} quaternion={b.qq}>
          <mesh material={mat} scale={[1, b.len, 1]} position={[0, b.len / 2, 0]}><cylinderGeometry args={[r * 0.006, r * 0.006, 1, 8, 1, true]} /></mesh>
          <mesh material={glow} scale={[r * 0.025, b.len, r * 0.025]} position={[0, b.len / 2, 0]}><cylinderGeometry args={[1, 1, 1, 12, 1, true]} /></mesh>
        </group>
      ))}
      {fire > 0 && <group position={focus} quaternion={bq}>
        <mesh material={mat} scale={[1, blen, 1]} position={[0, blen / 2, 0]}><cylinderGeometry args={[r * 0.02, r * 0.02, 1, 12, 1, true]} /></mesh>
        <mesh material={glow} scale={[r * 0.07, blen, r * 0.07]} position={[0, blen / 2, 0]}><cylinderGeometry args={[1, 1, 1, 16, 1, true]} /></mesh>
      </group>}
      <mesh material={glow} position={focus} scale={r * 0.08 * k}><sphereGeometry args={[1, 16, 12]} /></mesh>
    </group>
  );
};

// lightning forks crawling inside the blade (regenerated every frame from the frame number: deterministic)
export const Arcs: React.FC<{t: number; len: number; on: number}> = ({t, len, on}) => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({color: new THREE.Color('#f2fbff').multiplyScalar(2.4), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false}), []);
  const fr = Math.floor(t * 30 / 2); // a new fork every 2 frames
  const geos = useMemo(() => {
    if (on <= 0.001) return [];
    const r = rng(1000 + fr), out: THREE.TubeGeometry[] = [];
    for (let n = 0; n < 4; n++) {
      const y0 = r() * len * 0.8, span = 0.12 + r() * 0.25, pts: THREE.Vector3[] = [];
      let a = r() * Math.PI * 2;
      for (let k = 0; k <= 14; k++) { a += (r() - 0.5) * 1.4; const rr = 0.006 + r() * 0.007; pts.push(new THREE.Vector3(Math.cos(a) * rr, y0 + (k / 14) * span, Math.sin(a) * rr)); }
      out.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2), 40, 0.0017, 4, false));
    }
    return out;
  }, [fr, len, on > 0.001]);
  mat.opacity = on;
  return <group>{geos.map((g, i) => <mesh key={i} geometry={g} material={mat} renderOrder={12} />)}</group>;
};
