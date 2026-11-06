// A minimal sky for water scenes: a gradient dome with a sun glow, and the same sky baked once into a PMREM
// environment for reflections. Pass the environment to water materials as envMap (cheaper than scene.environment
// on every surface: measured ~0.8 s/frame saved in software rendering; see references/look-pass.md).
import * as THREE from 'three';

export type SkyColors = {zenith: string; horizon: string; ground: string; sun: string; sunDir: THREE.Vector3};
export const SKY_DAY: SkyColors = {zenith: '#5F8FC8', horizon: '#CFDDE8', ground: '#8A8578', sun: '#FFF1D6', sunDir: new THREE.Vector3(0.3, 0.45, -0.85).normalize()};
export const SKY_LOW_SUN: SkyColors = {zenith: '#4E6E9E', horizon: '#F0C9A0', ground: '#6E5E50', sun: '#FFD9A0', sunDir: new THREE.Vector3(0.2, 0.12, -0.97).normalize()};

export const SKY_FRONT: SkyColors = {zenith: '#5F8FC8', horizon: '#D5E2EC', ground: '#8A8578', sun: '#FFF1D6', sunDir: new THREE.Vector3(0.35, 0.55, 0.76).normalize()};
export const skyDome = (c: SkyColors) => new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: {uZ: {value: new THREE.Color(c.zenith)}, uH: {value: new THREE.Color(c.horizon)}, uG: {value: new THREE.Color(c.ground)}, uS: {value: new THREE.Color(c.sun)}, uD: {value: c.sunDir}},
  vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: /* glsl */`varying vec3 vD; uniform vec3 uZ, uH, uG, uS, uD;
    void main(){ vec3 d = normalize(vD); vec3 c = d.y > 0.0 ? mix(uH, uZ, pow(d.y, 0.5)) : mix(uH, uG, pow(-d.y, 0.35));
      float s = max(dot(d, uD), 0.0); c += uS * (pow(s, 10.0) * 0.4 + pow(s, 900.0) * 3.0);
      gl_FragColor = vec4(c, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});
export const skyEnvironment = (gl: THREE.WebGLRenderer, c: SkyColors) => {
  const sc = new THREE.Scene(); sc.add(new THREE.Mesh(new THREE.SphereGeometry(10, 48, 24), skyDome(c)));
  const pm = new THREE.PMREMGenerator(gl); const rt = pm.fromScene(sc, 0.01); pm.dispose(); return rt.texture;
};
