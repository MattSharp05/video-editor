// PENCIL world: a yellow pencil (7 mm across the flats, 17.5 cm long) lying on a mown football pitch. The camera
// pulls back from 25 cm to 400 m, the same ratio as the wall (about 6 m) seen from the Space Station (400 km).
// Units: metres; pencil at the origin along x; pitch lines in a 105 x 68 m pitch around it.
import * as THREE from 'three';

export const PENCIL_W = 0.007, PENCIL_L = 0.175;

export const buildPencil = (amber: string) => {
  const g = new THREE.Group();
  const r = PENCIL_W / Math.sqrt(3);                 // hexagon circumradius for 7 mm across the flats
  const paint = new THREE.MeshStandardMaterial({color: amber, roughness: 0.38, metalness: 0, flatShading: true, emissive: new THREE.Color(amber), emissiveIntensity: 0.05});
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.14, 6), paint); body.rotation.z = Math.PI / 2; g.add(body);
  const wood = new THREE.Mesh(new THREE.CylinderGeometry(r, 0.0011, 0.022, 6), new THREE.MeshStandardMaterial({color: '#E3C18F', roughness: 0.8, flatShading: true}));
  wood.rotation.z = Math.PI / 2; wood.position.x = 0.081; g.add(wood);
  const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.0011, 0.0001, 0.005, 12), new THREE.MeshStandardMaterial({color: '#2b2b2e', roughness: 0.35, metalness: 0.5}));
  lead.rotation.z = Math.PI / 2; lead.position.x = 0.0945; g.add(lead);
  const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.011, 24), new THREE.MeshStandardMaterial({color: '#C9C5BC', roughness: 0.25, metalness: 0.9}));
  ferrule.rotation.z = Math.PI / 2; ferrule.position.x = -0.0755; g.add(ferrule);
  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.98, r * 0.98, 0.009, 24), new THREE.MeshStandardMaterial({color: '#E58A8F', roughness: 0.9}));
  eraser.rotation.z = Math.PI / 2; eraser.position.x = -0.0855; g.add(eraser);
  g.position.y = PENCIL_W / 2 + 0.004; g.rotation.y = 0.35;
  g.traverse((o) => { (o as THREE.Mesh).castShadow = true; });
  return g;
};

// mown grass: world-space noise in several octaves (blade streaks up close, mowing stripes and pitch lines far)
export const grassMaterial = () => new THREE.MeshStandardMaterial({roughness: 0.95, color: '#ffffff'});
export const patchGrass = (m: THREE.MeshStandardMaterial) => {
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWp;
      float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(h2(i), h2(i+vec2(1,0)), f.x), mix(h2(i+vec2(0,1)), h2(i+vec2(1,1)), f.x), f.y); }
      float fb(vec2 p){ float fw = length(fwidth(p)); float s = 0.0, a = 0.5;
        for (int k = 0; k < 7; k++){ s += a * vn(p) * (1.0 - smoothstep(0.25, 0.6, fw)); p *= 2.07; fw *= 2.07; a *= 0.55; } return s; }
      float line(float d, float w){ float fw = fwidth(d) + 1e-5; return 1.0 - smoothstep(w - fw, w + fw, abs(d)); }`)
      .replace('#include <map_fragment>', `
      vec2 p = vWp.xz;
      float blades = fb(vec2(p.x * 900.0, p.y * 140.0));           // fine blade streaks
      float clump = fb(p * 6.0), patchy = fb(p * 0.35);
      float stripe = step(0.5, fract((p.x + 3.0) / 10.0));        // 5 m mowing stripes
      vec3 g1 = vec3(0.10, 0.24, 0.06), g2 = vec3(0.16, 0.33, 0.08);
      vec3 grass = mix(g1, g2, 0.45 * blades + 0.35 * clump + 0.2 * patchy);
      grass *= mix(0.86, 1.08, stripe);
      // pitch lines: halfway line 2 m from the pencil, centre circle, touch lines
      float ln = max(line(p.x + 2.0, 0.06), line(length(p - vec2(-2.0, 0.0)) - 9.15, 0.06));
      ln = max(ln, max(line(p.y - 34.0, 0.06), line(p.y + 34.0, 0.06)));
      ln = max(ln, max(line(p.x - 50.5, 0.06), line(p.x + 54.5, 0.06)) * step(abs(p.y), 34.0));
      ln *= step(abs(p.x + 2.0), 52.6) * step(abs(p.y), 34.06);
      diffuseColor.rgb = mix(grass, vec3(0.78, 0.8, 0.76), ln * 0.9);`);
  };
  return m;
};
