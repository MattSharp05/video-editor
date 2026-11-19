// The whole film is one three.js world: a typhoon dusk sky, a lit city, Taipei 101 (built in code: stacked flared
// modules with a glass facade shader that bends with the sway, turns to x-ray and opens as a cutaway), the damper floors
// (slabs, steel frame, the gold ball of 41 plates on 8 cables, 8 pistons), trails, pens and traces. Built once; per frame
// only uniforms, transforms and the trail/trace tubes change, all from timeline.ts.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {random} from 'remotion';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);

// ---------- shared GLSL: the storm sky (also used for reflections and for windows seen from inside)
const SKY_GLSL = /* glsl */ `
uniform float uShift; uniform float uWind;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*vn(p); p=p*2.07+vec2(1.7,9.2); a*=0.5; } return s; }
vec3 skyBase(vec3 d){
  float e = clamp(d.y, -0.2, 1.0);
  vec3 zen = vec3(0.012, 0.020, 0.040), hor = vec3(0.075, 0.090, 0.120);
  vec3 c = mix(hor, zen, smoothstep(0.0, 0.55, e));
  // the last light of the sun low in the west (-X): a dim copper band
  float w = pow(max(0.0, -d.x * 0.85 + 0.15), 3.0) * (1.0 - smoothstep(0.0, 0.22, e));
  c += vec3(0.42, 0.16, 0.06) * w * 0.55;
  return c;
}
vec3 skyCol(vec3 d){
  vec3 c = skyBase(d);
  if (d.y > 0.0) {
    vec2 p = d.xz / (d.y + 0.08) * 900.0 + vec2(uShift, uShift * 0.15);
    float n = fbm(p * 0.0011); float n2 = fbm(p * 0.0042 + vec2(uShift * 0.002, 0.0));
    float dens = smoothstep(0.32, 0.75, n * 0.75 + n2 * 0.4);
    vec3 cl = mix(vec3(0.030, 0.036, 0.048), vec3(0.11, 0.115, 0.13), smoothstep(0.4, 0.95, n2));
    cl += vec3(0.30, 0.12, 0.05) * pow(max(0.0, -d.x), 3.0) * 0.18;
    c = mix(c, cl, dens * smoothstep(0.0, 0.06, d.y));
  }
  // mountains round the Taipei basin
  float az = atan(d.z, d.x);
  float m = 0.018 + 0.03 * fbm(vec2(az * 3.0, 0.0)) + 0.012 * fbm(vec2(az * 14.0, 3.0));
  float mt = 1.0 - smoothstep(m - 0.002, m + 0.002, d.y);
  c = mix(c, vec3(0.022, 0.028, 0.038), mt * step(-0.01, d.y));
  if (d.y < 0.0) c = vec3(0.035, 0.04, 0.05);
  return c;
}`;

const skyMaterial = () => new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: {uShift: {value: 0}, uWind: {value: 0}},
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = p.xyww; }`,
  fragmentShader: `${SKY_GLSL} varying vec3 vD; void main(){ gl_FragColor = vec4(skyCol(normalize(vD)), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`,
});

// ---------- haze toward the horizon colour
const HAZE = `vec3 haze(vec3 c, float d){ return mix(c, vec3(0.075, 0.090, 0.120), 1.0 - exp(-d / 4200.0)); }`;

// ---------- ground: dark wet city floor with sodium street grid
const groundMaterial = () => new THREE.ShaderMaterial({
  uniforms: {},
  vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `${HAZE}
    float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
    varying vec3 vW; void main(){
      vec2 g = vW.xz; float d = length(vW.xz - cameraPosition.xz);
      vec3 c = vec3(0.012, 0.014, 0.018);
      float sx = abs(fract(g.x / 118.0) - 0.5) * 118.0, sz = abs(fract(g.y / 96.0) - 0.5) * 96.0;
      float street = max(1.0 - smoothstep(1.5, 3.5, sx), 1.0 - smoothstep(1.5, 3.5, sz));
      float aa = clamp(d / 2500.0, 0.0, 1.0);
      c += vec3(1.0, 0.55, 0.22) * street * mix(0.22, 0.08, aa);
      // car lights and lamps
      vec2 cell = floor(g / 9.0); float lamp = step(0.93, h21(cell)) * street;
      c += vec3(1.2, 0.8, 0.5) * lamp * 0.6;
      gl_FragColor = vec4(haze(c, d), 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});

// ---------- city blocks: instanced boxes with lit windows
const cityMaterial = () => new THREE.ShaderMaterial({
  uniforms: {},
  vertexShader: `varying vec3 vW; varying vec3 vN; varying vec2 vSeed; void main(){
    vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0); vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal); vSeed = instanceMatrix[3].xz;
    gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `${HAZE}
    float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
    varying vec3 vW; varying vec3 vN; varying vec2 vSeed; void main(){
      float d = length(vW - cameraPosition);
      vec3 n = normalize(vN);
      vec3 c = vec3(0.020, 0.023, 0.030) * (0.6 + 0.4 * max(n.y, 0.0)) + vec3(0.03, 0.035, 0.045) * max(n.y, 0.0);
      if (abs(n.y) < 0.5) {
        vec2 uv = vec2(abs(n.x) > 0.5 ? vW.z : vW.x, vW.y);
        vec2 cell = floor(uv / vec2(3.4, 3.6)); vec2 f = fract(uv / vec2(3.4, 3.6));
        float win = step(0.18, f.x) * step(f.x, 0.82) * step(0.25, f.y) * step(f.y, 0.8);
        float r = h21(cell + vSeed * 0.37);
        float lit = step(0.62, r) * win;
        vec3 wc = mix(vec3(1.0, 0.72, 0.42), vec3(0.62, 0.78, 1.0), step(0.86, h21(cell * 1.7 + vSeed)));
        float far = smoothstep(600.0, 2500.0, d);
        c += wc * mix(lit * (0.15 + 0.4 * r), 0.07 * step(0.5, h21(vSeed)) + 0.025, far) * 0.6;
        c += vec3(0.02, 0.025, 0.03) * win;
      }
      gl_FragColor = vec4(haze(c, d), 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});

// ---------- the tower: chamfered square rings stacked into trunk, eight flared modules, crown
type Sec = {y0: number; y1: number; hw0: number; hw1: number; rows: number};
const SECS: Sec[] = [
  {y0: 0, y1: TL.TRUNK_TOP, hw0: 31, hw1: 22, rows: 26},
  ...Array.from({length: TL.MODS}, (_, k) => ({y0: TL.TRUNK_TOP + k * TL.MOD_H, y1: TL.TRUNK_TOP + (k + 1) * TL.MOD_H, hw0: 20, hw1: 25.5, rows: 16})),
  {y0: TL.MODS_TOP, y1: TL.CROWN_TOP, hw0: 17.5, hw1: 13, rows: 16},
];
export const halfWidthAt = (h: number) => {
  for (const s of SECS) if (h >= s.y0 && h <= s.y1) return s.hw0 + ((s.hw1 - s.hw0) * (h - s.y0)) / (s.y1 - s.y0);
  return 13;
};
const ring = (hw: number) => {
  const c = hw * 0.22;
  return [[hw, -hw + c], [hw, hw - c], [hw - c, hw], [-hw + c, hw], [-hw, hw - c], [-hw, -hw + c], [-hw + c, -hw], [hw - c, -hw]] as [number, number][];
};
const towerGeometry = () => {
  const pos: number[] = [], u: number[] = [];
  const quad = (a: number[], b: number[], c: number[], d: number[], ua: number[]) => {
    // a b (bottom) d c (top), counter-clockwise from outside
    pos.push(...a, ...b, ...c, ...a, ...c, ...d); u.push(ua[0], ua[1], ua[2], ua[0], ua[2], ua[3]);
  };
  for (const s of SECS) {
    for (let r = 0; r < s.rows; r++) {
      const ya = s.y0 + ((s.y1 - s.y0) * r) / s.rows, yb = s.y0 + ((s.y1 - s.y0) * (r + 1)) / s.rows;
      const ha = s.hw0 + ((s.hw1 - s.hw0) * r) / s.rows, hb = s.hw0 + ((s.hw1 - s.hw0) * (r + 1)) / s.rows;
      const A = ring(ha), Bv = ring(hb), M = ring((s.hw0 + s.hw1) / 2);
      let um = 0;
      for (let i = 0; i < 8; i++) {
        const j = (i + 1) % 8;
        const lm = Math.hypot(M[j][0] - M[i][0], M[j][1] - M[i][1]); // one width per face per section: window columns stay vertical
        quad([A[i][0], ya, A[i][1]], [A[j][0], ya, A[j][1]], [Bv[j][0], yb, Bv[j][1]], [Bv[i][0], yb, Bv[i][1]], [um, um + lm, um + lm, um]);
        um += lm;
      }
    }
  }
  // ledges: the flat ring at the top of each section stepping in to the next one, and the roof
  for (let k = 0; k < SECS.length; k++) {
    const s = SECS[k], next = SECS[k + 1];
    const O = ring(s.hw1), I = ring(next ? next.hw0 : 0.01);
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      pos.push(O[i][0], s.y1, O[i][1], I[j][0], s.y1, I[j][1], O[j][0], s.y1, O[j][1]);
      pos.push(O[i][0], s.y1, O[i][1], I[i][0], s.y1, I[i][1], I[j][0], s.y1, I[j][1]);
      u.push(-1, -1, -1, -1, -1, -1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aU', new THREE.Float32BufferAttribute(u, 1));
  g.computeVertexNormals();
  return g;
};

const BEND_GLSL = /* glsl */ `
uniform float uTip;
float bendShape(float h){ float u = min(h, ${TL.CROWN_TOP.toFixed(1)}) / ${TL.CROWN_TOP.toFixed(1)}; return u*u*(3.0-u)/2.0 + max(0.0, h - ${TL.CROWN_TOP.toFixed(1)}) * 0.0034; }`;

const towerMaterial = (u: Record<string, THREE.IUniform>) => new THREE.ShaderMaterial({
  transparent: true, side: THREE.DoubleSide,
  uniforms: u,
  vertexShader: `${BEND_GLSL}
    attribute float aU; varying float vU; varying vec3 vO; varying vec3 vW; varying vec3 vN;
    void main(){ vU = aU; vO = position; vec3 p = position; p.x += uTip * bendShape(p.y);
      vec4 w = modelMatrix * vec4(p, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `${SKY_GLSL}
    uniform float uXray; uniform float uCut; uniform vec2 uBand;
    varying float vU; varying vec3 vO; varying vec3 vW; varying vec3 vN;
    void main(){
      float band = smoothstep(uBand.x - 0.4, uBand.x, vO.y) * (1.0 - smoothstep(uBand.y, uBand.y + 0.4, vO.y));
      if (uCut > 0.5 && band > 0.5 && vO.z > 0.0) discard;
      vec3 V = normalize(cameraPosition - vW);
      vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
      float fl = floor(vO.y / ${TL.FLOOR}); float fy = fract(vO.y / ${TL.FLOOR});
      float bay = floor(vU / 1.6); float fx = fract(vU / 1.6);
      float spandrel = 1.0 - step(0.27, fy);
      float mull = step(0.465, abs(fx - 0.5));
      float ledge = step(vU, -0.5);
      // inside of the opened band: dark wall, windows onto the storm
      if (!gl_FrontFacing && uCut > 0.5 && band > 0.5) {
        float win = (1.0 - spandrel) * (1.0 - mull);
        vec3 out_ = skyCol(normalize(-V * vec3(1.0, 0.25, 1.0) + vec3(0.0, 0.06, 0.0))) * 1.7 + vec3(0.03, 0.035, 0.045);
        vec3 c = mix(vec3(0.030, 0.030, 0.032), out_, win);
        c += vec3(0.10, 0.08, 0.05) * (1.0 - win) * 0.6;
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        return;
      }
      float cosT = clamp(dot(N, V), 0.0, 1.0);
      float F = 0.04 + 0.96 * pow(1.0 - cosT, 5.0);
      vec3 R = reflect(-V, N);
      vec3 refl = skyCol(normalize(R)) * (0.7 + 0.6 * h21(vec2(bay * 0.37, fl * 0.71)));
      vec3 interior = vec3(0.004, 0.014, 0.016);
      float h = h21(vec2(fl, bay));
      float zone = h21(vec2(fl, floor(vU / 9.0)));
      float lit = step(0.80, h) * step(0.35, zone) * step(vO.y, ${TL.CROWN_TOP.toFixed(1)});
      interior += vec3(1.0, 0.68, 0.38) * lit * (0.06 + 0.10 * h21(vec2(bay, fl * 1.3)));
      vec3 glassC = interior * (1.0 - F) + refl * (0.35 + F * 1.8) * vec3(0.75, 1.0, 0.98);
      vec3 frameC = vec3(0.018, 0.034, 0.036) + refl * 0.3 + vec3(0.02) * max(N.y, 0.0);
      vec3 c = mix(glassC, frameC, max(max(spandrel, mull), ledge));
      float a = 1.0;
      // x-ray: the band turns to glass with a bright rim and floor lines
      float rim = pow(1.0 - cosT, 2.5);
      float floorLine = 1.0 - smoothstep(0.0, 0.05, fy);
      vec3 xc = vec3(0.81, 0.90, 0.96) * 0.05 + vec3(0.92, 0.97, 1.0) * (rim * 1.1 + floorLine * 0.5);
      float x = uXray * band;
      c = mix(c, xc, x);
      a = mix(1.0, 0.14 + rim * 0.45 + floorLine * 0.35 + mull * 0.12, x);
      gl_FragColor = vec4(c, a);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});

// coral glass ghost of the tower (sway without the ball)
const ghostMaterial = (u: Record<string, THREE.IUniform>) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: u,
  vertexShader: `${BEND_GLSL} varying vec3 vW; varying vec3 vN;
    void main(){ vec3 p = position; p.x += uTip * bendShape(p.y); vec4 w = modelMatrix * vec4(p, 1.0); vW = w.xyz;
      vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `uniform float uOpacity; uniform vec3 uColor; varying vec3 vW; varying vec3 vN;
    void main(){ vec3 V = normalize(cameraPosition - vW); float r = pow(1.0 - abs(dot(normalize(vN), V)), 2.0);
      gl_FragColor = vec4(uColor * (0.32 + r * 1.5) * uOpacity, 1.0); }`,
});

// a soft round glow texture
const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.22, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const glowSprite = (tex: THREE.Texture, c: string, size: number, depthTest = true) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col(c), blending: THREE.AdditiveBlending, depthWrite: false, depthTest, transparent: true}));
  s.scale.setScalar(size); s.renderOrder = 10; return s;
};
const lineMat = (c: string, w: number, depthTest = false) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest, blending: THREE.AdditiveBlending,
  uniforms: {uC: {value: col(c)}, uO: {value: 0}, uW: {value: w}},
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `uniform vec3 uC; uniform float uO; uniform float uW; varying vec2 vUv; void main(){ float a=(0.2+0.8*pow(vUv.x,1.2))*uO*uW; gl_FragColor=vec4(uC*1.8*a, a); }`,
});
const tube = (pts: THREE.Vector3[], r: number, seg = 96) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 8, false);

export const Scene: React.FC<{t: number}> = ({t}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    const root = new THREE.Group(); scene.add(root);
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), skyMaterial()); sky.scale.setScalar(20000); sky.renderOrder = -10; sky.frustumCulled = false; root.add(sky);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000), groundMaterial()); ground.rotation.x = -Math.PI / 2; root.add(ground);

    // city: blocks over ~4 km, none within 75 m of the tower; a low podium (the mall) beside it
    const N = 2600; const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), cityMaterial(), N);
    const o = new THREE.Object3D(); let k = 0;
    for (let i = 0; k < N && i < N * 4; i++) {
      const r = 85 + Math.pow(random('cr' + i), 0.7) * 4200, a = random('ca' + i) * Math.PI * 2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.abs(((x % 118) + 118) % 118 - 59) > 50 || Math.abs(((z % 96) + 96) % 96 - 48) > 40) continue; // keep streets clear
      const near = Math.exp(-r / 1400);
      const h = 12 + Math.pow(random('ch' + i), 2.2) * (50 + 140 * near);
      o.position.set(x, 0, z); o.scale.set(14 + random('cw' + i) * 34, h, 14 + random('cd' + i) * 30); o.rotation.y = 0; o.updateMatrix();
      city.setMatrixAt(k++, o.matrix);
    }
    city.count = k; root.add(city);
    const podium = new THREE.Mesh(new THREE.BoxGeometry(110, 58, 70).translate(-10, 29, -55), new THREE.MeshStandardMaterial({color: col('#1A1F27'), roughness: 0.6, emissive: col('#2A1E12'), emissiveIntensity: 0.4}));
    root.add(podium);

    // lights for the standard materials (interior, ball, steel)
    const hemi = new THREE.HemisphereLight(col('#8A96AA'), col('#2A2622'), 0.35); root.add(hemi);
    const work = new THREE.PointLight(col('#FFD3A0'), 900, 40, 2); work.position.set(0, TL.HANG_Y - 1.5, 5); root.add(work);
    const work2 = new THREE.PointLight(col('#FFD3A0'), 500, 40, 2); work2.position.set(-6, TL.HANG_Y - 2, -4); root.add(work2);
    const fill = new THREE.PointLight(col('#9FB4D0'), 140, 50, 2); fill.position.set(4, 379, 14); root.add(fill);
    const low = new THREE.PointLight(col('#FFC890'), 420, 30, 2); low.position.set(0, TL.SLAB_LOW - 1.2, 3); root.add(low);

    // shared tower uniforms
    const U = {uTip: {value: 0}, uXray: {value: 0}, uCut: {value: 0}, uBand: {value: new THREE.Vector2(...TL.BAND)}, uShift: {value: 0}, uWind: {value: 0}};
    (sky.material as THREE.ShaderMaterial).uniforms = {uShift: U.uShift, uWind: U.uWind};
    const tgeo = towerGeometry();
    const tower = new THREE.Mesh(tgeo, towerMaterial(U)); tower.renderOrder = 5; root.add(tower);
    // spire and crown details (sway with the tower via the same bend, done on the CPU for these few parts)
    const spireMat = new THREE.MeshStandardMaterial({color: col('#7C8590'), roughness: 0.4, metalness: 0.6, envMap: env, envMapIntensity: 0.3});
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 3.2, TL.SPIRE_TOP - TL.CROWN_TOP, 12).translate(0, (TL.SPIRE_TOP - TL.CROWN_TOP) / 2, 0), spireMat);
    root.add(spire);
    const beacon = glowSprite(glowTex(), '#FF6A50', 9); root.add(beacon);
    const GU = {uTip: {value: 0}, uOpacity: {value: 0}, uColor: {value: col(TL.CORAL)}};
    const ghost = new THREE.Mesh(tgeo, ghostMaterial(GU)); ghost.renderOrder = 8; root.add(ghost);

    // ---------- damper floors (tower frame: a group that follows the tower's sway at the band's height)
    const rig = new THREE.Group(); root.add(rig);
    const concrete = new THREE.MeshStandardMaterial({color: col('#5E5A55'), roughness: 0.92});
    const steel = new THREE.MeshStandardMaterial({color: col('#2B2F36'), roughness: 0.5, metalness: 0.6, envMap: env, envMapIntensity: 0.6});
    const edgeMat = new THREE.MeshBasicMaterial({color: col(TL.GLASS).multiplyScalar(0.9), toneMapped: false});
    const lowSlabs: THREE.Mesh[] = [];
    const slabYs = [TL.SLAB_LOW - 4.29 * 3, TL.SLAB_LOW, TL.HANG_Y + 0.5, TL.BAND[1] - 0.3];
    for (const y of slabYs) {
      const hw = halfWidthAt(y) - 0.25, hole = y > TL.SLAB_LOW + 1 ? 7.5 : 0; const slabMat = concrete;
      const sh = new THREE.Shape(); sh.moveTo(-hw, -hw); sh.lineTo(hw, -hw); sh.lineTo(hw, hw); sh.lineTo(-hw, hw); sh.closePath();
      if (hole) { const hp = new THREE.Path(); hp.moveTo(-hole, -hole); hp.lineTo(-hole, hole); hp.lineTo(hole, hole); hp.lineTo(hole, -hole); hp.closePath(); sh.holes.push(hp); }
      const g = new THREE.ExtrudeGeometry(sh, {depth: 0.45, bevelEnabled: false}); g.rotateX(Math.PI / 2); g.translate(0, y + 0.45, 0);
      const m = new THREE.Mesh(g, slabMat); rig.add(m); if (y < TL.SLAB_LOW - 1) lowSlabs.push(m);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 0.06, 0.06), edgeMat); edge.position.set(0, y + 0.45, hw); rig.add(edge);
    }
    // the floor the visitors stand on: a lighter steel deck ring under the ball, with yellow safety edge
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(9.5, 9.5, 0.12, 64), new THREE.MeshStandardMaterial({color: col('#26292E'), roughness: 0.8, metalness: 0.2}));
    deck.position.y = TL.SLAB_LOW + 0.52; rig.add(deck);
    // hanging frame: steel beams across the top of the void
    for (const [x, z, lx, lz] of [[0, -2.1, 16, 0.7], [0, 2.1, 16, 0.7], [-2.1, 0, 0.7, 16], [2.1, 0, 0.7, 16]] as number[][]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(lx, 0.9, lz), steel); b.position.set(x, TL.HANG_Y + 0.2, z); rig.add(b);
    }
    // the ball: 41 stacked plates (grooves in the shader), gold
    const ballMat = new THREE.MeshStandardMaterial({color: col('#D9A548'), metalness: 1, roughness: 0.38, envMap: env, envMapIntensity: 1.25, emissive: col('#FFB547'), emissiveIntensity: 0.03});
    ballMat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vYl;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvYl = position.y;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vYl;')
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
          float gp = abs(fract(vYl / ${(2 * TL.BALL_R / 41).toFixed(4)}) - 0.5);
          float groove = 1.0 - smoothstep(0.38, 0.5, gp);
          roughnessFactor = mix(0.55, roughnessFactor, groove);
          diffuseColor.rgb *= mix(0.55, 1.0, groove);`);
    };
    const ballG = new THREE.Group(); rig.add(ballG);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(TL.BALL_R, 96, 64), ballMat); ballG.add(ball);
    const cradle = new THREE.Mesh(new THREE.TorusGeometry(TL.BALL_R * 1.03, 0.16, 12, 64), steel); cradle.rotation.x = Math.PI / 2; ballG.add(cradle);
    const brackets: THREE.Vector3[] = [];
    for (const [sx, sz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) for (const off of [-0.3, 0.3]) {
      const a = Math.atan2(sz, sx) + off * 0.12; brackets.push(new THREE.Vector3(Math.cos(a) * TL.BALL_R * 1.06, 0.15, Math.sin(a) * TL.BALL_R * 1.06));
    }
    for (const b of brackets.filter((_, i) => i % 2 === 0)) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), steel); m.position.copy(b); ballG.add(m); }
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 1.1, 16), steel); post.position.y = -TL.BALL_R - 0.45; ballG.add(post);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.5, 24), steel); hub.position.y = TL.PISTON_Y - TL.BALL_Y; ballG.add(hub);
    // cables: from fixed points under the frame to the ball's brackets (rebuilt per frame: they tilt)
    const cableMat = new THREE.MeshStandardMaterial({color: col('#9AA0A8'), roughness: 0.35, metalness: 0.9, envMap: env, envMapIntensity: 0.8, emissive: col(TL.GOLD), emissiveIntensity: 0});
    const cables = brackets.map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1, 8), cableMat); rig.add(m); return m; });
    // pistons: 8 around the hub, body on a pedestal at the outside, rod to the hub
    const pistons = Array.from({length: 8}, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const bodyMat = new THREE.MeshStandardMaterial({color: col('#3B4048'), roughness: 0.35, metalness: 0.8, envMap: env, envMapIntensity: 0.7, emissive: col(TL.HEAT), emissiveIntensity: 0});
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 2.6, 20), bodyMat); body.rotation.z = Math.PI / 2;
      const bodyG = new THREE.Group(); bodyG.add(body); rig.add(bodyG);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1, 12), new THREE.MeshStandardMaterial({color: col('#C8CDD3'), roughness: 0.15, metalness: 1, envMap: env, envMapIntensity: 1.0}));
      rod.rotation.z = Math.PI / 2; const rodG = new THREE.Group(); rodG.add(rod); rig.add(rodG);
      const ped = new THREE.Mesh(new THREE.BoxGeometry(0.9, TL.PISTON_Y - TL.SLAB_LOW - 0.5, 0.9), steel);
      ped.position.set(Math.cos(a) * 6.6, (TL.PISTON_Y + TL.SLAB_LOW + 0.5) / 2, Math.sin(a) * 6.6); rig.add(ped);
      const glow = glowSprite(glowTex(), TL.HEAT, 2.6); rig.add(glow);
      return {a, bodyG, rodG, rod, bodyMat, glow};
    });
    const tex = glowTex();
    const ballGlowWide = glowSprite(tex, TL.GOLD, 34); root.add(ballGlowWide);
    const ballGlowClose = glowSprite(tex, TL.GOLD, 9); ballGlowClose.renderOrder = 1; ballGlowClose.material.depthTest = true; rig.add(ballGlowClose);
    // 1 m bar on the deck in front of the ball, and the plumb spot that runs along it
    const barMat = new THREE.MeshBasicMaterial({color: col(TL.GOLD), transparent: true, opacity: 0, toneMapped: false});
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.42), barMat); bar.position.set(0.5, TL.SLAB_LOW + 0.6, 5.0); rig.add(bar);
    const ticks = [0, 1].map((x) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.3, 0.6), barMat); m.position.set(x, TL.SLAB_LOW + 0.61, 5.0); rig.add(m); return m; });
    const plumb = glowSprite(tex, TL.GOLD, 1.0); rig.add(plumb);
    void ticks;
    // pull chevrons: amber on the ball (its tug), coral on the floor edge (the tower's motion)
    const chev = (c: string) => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.2, 3), new THREE.MeshBasicMaterial({color: col(c), transparent: true, opacity: 0, toneMapped: false, depthTest: false})); m.renderOrder = 13; m.scale.set(1, 1, 0.2); rig.add(m); return m; };
    const chevBall = chev(TL.GOLD), chevFloor = chev(TL.CORAL);

    // trails (wide) and traces (cutaway), rebuilt per frame
    const mk = (c: string, w: number) => { const m = new THREE.Mesh(new THREE.BufferGeometry(), lineMat(c, w)); m.renderOrder = 12; m.frustumCulled = false; root.add(m); return m; };
    const trails = {ghostCore: mk(TL.CORAL, 1), ghostHalo: mk(TL.CORAL, 0.25), realCore: mk(TL.GOLD, 1), realHalo: mk(TL.GOLD, 0.25)};
    const traces = {tower: mk(TL.CORAL, 1), towerHalo: mk(TL.CORAL, 0.3), ball: mk(TL.GOLD, 1), ballHalo: mk(TL.GOLD, 0.3)};
    const penT = glowSprite(tex, TL.CORAL, 1.1, false), penB = glowSprite(tex, TL.GOLD, 1.1, false); root.add(penT, penB);
    const leadT = mk(TL.CORAL, 0.5), leadB = mk(TL.GOLD, 0.5);
    const plumbTrail = mk(TL.GOLD, 1), plumbHalo = mk(TL.GOLD, 0.35);
    // railing round the visitors' deck, for scale
    const rail = new THREE.Mesh(new THREE.TorusGeometry(9.3, 0.05, 6, 96), steel); rail.rotation.x = Math.PI / 2; rail.position.y = TL.SLAB_LOW + 1.65; rig.add(rail);
    for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2; const pm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.1, 6), steel); pm.position.set(Math.cos(a) * 9.3, TL.SLAB_LOW + 1.1, Math.sin(a) * 9.3); rig.add(pm); }
    return {lowSlabs, U, GU, sky, tower, ghost, spire, beacon, rig, ballG, cables, brackets, pistons, ballGlowWide, ballGlowClose, cableMat, bar, barMat, plumb, chevBall, chevFloor, trails, traces, penT, penB, leadT, leadB, hemi, plumbTrail, plumbHalo};
  }, [gl, scene]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.1; cam.far = 50000;
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  W.sky.position.copy(cam.position);
  const close = TL.closeShot(t);
  gl.toneMappingExposure = close ? 1.35 : 2.4;

  const tip = TL.tipAmp(t), x = TL.towerX(t);
  const tipOff = tip * x;
  W.U.uTip.value = tipOff; W.U.uXray.value = TL.xray(t); W.U.uCut.value = TL.cutaway(t);
  W.U.uBand.value.set(close ? TL.BAND[0] : 366.5, TL.BAND[1]);
  W.U.uShift.value = TL.cloudShift(t); W.U.uWind.value = TL.windOn(t);
  const off = (h: number, a = tipOff) => a * TL.bendShape(h);
  W.spire.position.set(off(TL.CROWN_TOP), TL.CROWN_TOP, 0); W.spire.rotation.z = -tipOff * 0.0034 * 0.9;
  W.beacon.position.set(off(TL.SPIRE_TOP), TL.SPIRE_TOP, 0); (W.beacon.material as THREE.SpriteMaterial).opacity = 0.5 + 0.5 * Math.max(0, Math.sin(t * 3.0));
  // ghost: same forcing, 1.67x the sway
  const go = TL.ghostOn(t);
  W.ghost.visible = go > 0.01; W.GU.uTip.value = tipOff * TL.GHOST_K; W.GU.uOpacity.value = go * 0.95;

  // damper floors ride with the tower at the band's height
  W.rig.position.set(off(TL.BALL_Y), 0, 0);
  const swing = close ? TL.ballSwingM(t) : TL.ballAmp(t) * TL.ballY(t);
  const L = TL.HANG_Y - TL.BALL_Y;
  W.ballG.position.set(swing, TL.BALL_Y + (swing * swing) / (2 * L), 0);
  W.ballG.rotation.z = -Math.asin(Math.max(-0.5, Math.min(0.5, swing / 14)));
  const cg = TL.cableGlow(t), pull = TL.pullOn(t);
  W.cableMat.emissiveIntensity = 1.6 * cg + 2.2 * pull * Math.min(1, Math.abs(TL.ballY(t)) * 1.3);
  W.cables.forEach((m, i) => {
    const b = W.brackets[i].clone().applyEuler(W.ballG.rotation).add(W.ballG.position);
    const top = new THREE.Vector3(W.brackets[i].x * 0.98, TL.HANG_Y - 0.3, W.brackets[i].z * 0.98);
    const mid = b.clone().add(top).multiplyScalar(0.5), d = top.clone().sub(b);
    m.position.copy(mid); m.scale.set(1, d.length(), 1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  });
  // pistons: the rod runs from the hub to the body; heat by speed along the piston
  const hubP = new THREE.Vector3(swing, TL.PISTON_Y, 0);
  const v = (close ? (t >= TL.CUT_IN2 ? TL.ballSwingM(t + 0.02) - TL.ballSwingM(Math.max(t - 0.02, TL.CUT_IN2 + 1e-4)) : TL.BALL_SWING * (TL.ballY(t + 0.02) - TL.ballY(t - 0.02))) / 0.04 : 0);
  const heat = TL.heatOn(t);
  W.pistons.forEach((p) => {
    const dir = new THREE.Vector3(Math.cos(p.a), 0, Math.sin(p.a));
    const anchor = dir.clone().multiplyScalar(6.6).setY(TL.PISTON_Y);
    const inner = hubP.clone().add(dir.clone().multiplyScalar(0.75));
    const bodyC = anchor.clone().addScaledVector(dir, -1.3);
    const rodEnd = anchor.clone().addScaledVector(dir, -2.4);
    const ang = Math.atan2(-dir.z, dir.x);
    p.bodyG.position.copy(bodyC); p.bodyG.rotation.set(0, ang, 0);
    const rl = inner.distanceTo(rodEnd); const rm = inner.clone().add(rodEnd).multiplyScalar(0.5);
    const rd = rodEnd.clone().sub(inner).normalize();
    p.rodG.position.copy(rm); p.rodG.rotation.set(0, Math.atan2(-rd.z, rd.x), 0); p.rod.scale.set(1, rl, 1);
    const sp = Math.abs(v * Math.cos(p.a)) / 1.2;
    const k = heat * Math.min(1, sp) ** 1.5;
    p.bodyMat.emissiveIntensity = 2.2 * k; p.bodyMat.emissive.copy(col(TL.HEAT)).lerp(col('#FFE2B0'), k * k);
    p.glow.position.copy(bodyC).add(new THREE.Vector3(0, 0.25, 0)); (p.glow.material as THREE.SpriteMaterial).opacity = 0.8 * k; p.glow.visible = close && k > 0.02;
  });
  // ball glow: big sprite through the glass in the wide, small halo in the cutaway
  const ballWorld = new THREE.Vector3(W.rig.position.x + W.ballG.position.x, W.ballG.position.y, 0);
  W.ballGlowWide.position.copy(ballWorld).add(new THREE.Vector3(0, 0, 0));
  (W.ballGlowWide.material as THREE.SpriteMaterial).opacity = close ? 0 : 0.85 * TL.xray(t);
  W.ballGlowWide.visible = !close;
  W.ballGlowClose.position.set(W.ballG.position.x, W.ballG.position.y, -3.2); (W.ballGlowClose.material as THREE.SpriteMaterial).opacity = close ? 0.5 : 0;
  // the interior shows only when the band is open or x-rayed
  W.rig.visible = close || TL.xray(t) > 0.02;
  W.lowSlabs.forEach((m) => (m.visible = close));
  // 1 m bar and plumb spot
  const mb = TL.meterBar(t), mh = TL.meterHit(t);
  W.bar.visible = mb > 0.01; W.barMat.opacity = mb * (0.55 + 0.45 * mh);
  W.plumb.visible = mb > 0.01; W.plumb.position.set(W.ballG.position.x, TL.SLAB_LOW + 0.7, 5.0); (W.plumb.material as THREE.SpriteMaterial).opacity = mb;
  // pull chevrons
  const by = TL.ballY(t), tv = TL.towerV(t);
  W.chevBall.visible = W.chevFloor.visible = pull > 0.01;
  W.chevBall.position.set(W.ballG.position.x + Math.sign(by) * 3.6, TL.BALL_Y, 3.4); W.chevBall.rotation.set(0, 0, -Math.sign(by) * Math.PI / 2);
  (W.chevBall.material as THREE.MeshBasicMaterial).opacity = pull * Math.min(1, Math.abs(by) * 1.6);
  const fe = halfWidthAt(TL.SLAB_LOW) - 1.5;
  void fe; W.chevFloor.position.set(Math.sign(tv) * 3.2, TL.SLAB_LOW + 1.3, 6.5); W.chevFloor.rotation.set(0, 0, -Math.sign(tv) * Math.PI / 2);
  (W.chevFloor.material as THREE.MeshBasicMaterial).opacity = pull * Math.min(1, Math.abs(tv) * 0.9);

  // trails at the tip (wide shots)
  const setTube = (m: THREE.Mesh, pts: [number, number, number][] | null, r: number, o: number) => {
    m.visible = !!pts && o > 0.01; if (!m.visible || !pts) return;
    m.geometry.dispose(); m.geometry = tube(pts.map((p) => new THREE.Vector3(...p)), r);
    (m.material as THREE.ShaderMaterial).uniforms.uO.value = o;
  };
  const tt = TL.tipTrailOn(t), gt = TL.ghostOn(t), rt = TL.realTrailOn(t);
  const realAmp = TL.TIP_WIDE, ghostAmp = TL.TIP_WIDE * TL.GHOST_K;
  const lift = (pts: [number, number, number][]) => pts.map(([a, b, cz]) => [a, b + 14, cz + 28] as [number, number, number]);
  const coralPts = tt > 0.01 ? lift(TL.tipTrail(t, realAmp)).map(([a, b, cz]) => [a, b + 12, cz] as [number, number, number]) : gt > 0.01 ? lift(TL.tipTrail(t, ghostAmp)).map(([a, b, cz]) => [a, b + 30, cz] as [number, number, number]) : null;
  setTube(W.trails.ghostCore, coralPts, 1.1, Math.max(tt, gt > 0.01 ? 1 : 0));
  setTube(W.trails.ghostHalo, coralPts, 3.6, Math.max(tt, gt > 0.01 ? 1 : 0));
  const realPts = rt > 0.01 ? lift(TL.tipTrail(t, realAmp)).map(([a, b, cz]) => [a, b + 8, cz + 0.6] as [number, number, number]) : null;
  setTube(W.trails.realCore, realPts, 1.2, rt);
  setTube(W.trails.realHalo, realPts, 3.8, rt);
  // the plumb spot's track on the deck in the 2015 typhoon: how far the ball swings over the 1 m bar
  const mbt = TL.meterBar(t);
  const plumbPts: [number, number, number][] | null = mbt > 0.01 ? Array.from({length: 40}, (_, i) => { const a = t - 2.0 * (1 - i / 39); return [W.rig.position.x + TL.ballSwingM(Math.max(a, TL.CUT_IN2)), TL.SLAB_LOW + 0.68, 5.0 + i * 0.002] as [number, number, number]; }) : null;
  setTube(W.plumbTrail, plumbPts, 0.06, mbt);
  setTube(W.plumbHalo, plumbPts, 0.22, mbt);

  // traces: pens on a strip in front of the ball, scrolling down; same visual amplitude, a quarter wave apart
  const tr = 0; // the waves are drawn as a flat panel in Film.tsx (board judge: 3D traces read as exhaust trails)
  const rigX = W.rig.position.x, zT = 7.5, yTop = TL.BALL_Y - TL.BALL_R - 0.6;
  const wave = (f: (tt: number) => number, cx: number) => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 70; i++) { const age = TL.TRACE_LEN * (1 - i / 69); pts.push([rigX + cx + 1.15 * f(t - age), yTop - age * TL.TRACE_V, zT]); }
    return pts;
  };
  const wT = tr > 0.01 ? wave(TL.towerX, -3.6) : null, wB = tr > 0.01 ? wave(TL.ballY, 3.6) : null;
  setTube(W.traces.tower, wT, 0.07, tr); setTube(W.traces.towerHalo, wT, 0.24, tr);
  setTube(W.traces.ball, wB, 0.07, tr); setTube(W.traces.ballHalo, wB, 0.24, tr);
  W.penT.visible = W.penB.visible = tr > 0.01;
  if (wT && wB) {
    W.penT.position.set(...wT[wT.length - 1]); W.penB.position.set(...wB[wB.length - 1]);
    (W.penT.material as THREE.SpriteMaterial).opacity = tr; (W.penB.material as THREE.SpriteMaterial).opacity = tr;
  }
  // leads: from the floor edge to the coral pen, from the ball to the amber pen
  setTube(W.leadT, wT ? [[rigX - 3.6 + 1.15 * TL.towerX(t) * 0.0, TL.SLAB_LOW + 0.5, halfWidthAt(TL.SLAB_LOW) - 0.3], [wT[wT.length - 1][0], wT[wT.length - 1][1] + 0.05, zT]] : null, 0.025, tr * 0.6);
  setTube(W.leadB, wB ? [[rigX + W.ballG.position.x, TL.BALL_Y - TL.BALL_R + 0.2, 1.2], [wB[wB.length - 1][0], wB[wB.length - 1][1] + 0.05, zT]] : null, 0.025, tr * 0.6);
  return null;
};
