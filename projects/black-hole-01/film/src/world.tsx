// Black hole 01: the objects, all original and built in code. Units: the small hole's horizon radius Rs = 1, hole at
// the origin, its disk in the y = 0 plane. The "edge" the film talks about is drawn where the eye sees it: the rim of
// the black shadow (EDGE = 2.6 Rs, where light skims the hole). Every component is a pure function of its props.
import React, {useMemo} from 'react';
import * as THREE from 'three';

export const BASE = 0.5;                         // world units per Rs for the small hole
export const EDGE = 2.598;                       // the shadow's rim, in Rs
export const CYAN = new THREE.Color('#7fe3ff');   // the edge (and only the edge)
export const VIOLET = new THREE.Color('#c08bff'); // gravity's stretch (arrows, the stretch zone)
export const LIGHT = new THREE.Color('#e9f6ff');  // light: rays and pulses
export const RED = new THREE.Color('#ff3b2f');    // you, as your friend sees you
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------- canvas textures ----------
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
};

// ---------- the astronaut ("you"): a toy-like suit, one piece by construction ----------
// JOINTS (assembly.md): every part sinks into its parent by at least half its own radius.
//  torso (capsule r .16, len .18, centre y .40) <- helmet (sphere r .17 at y .70: sinks .07 into the torso top at .67)
//  torso <- backpack (box at z -.13: sinks .07)  torso <- arms (capsule r .065 from shoulders y .55, x ±.15: sink .05)
//  torso <- legs (capsule r .075 from hips y .27, x ±.08: sink .08)  legs <- boots (r .085 at the leg ends: sink .06)
//  arm <- glove (sphere r .07 at the hand)  left arm <- watch (cylinder r .06 at the wrist, sunk .03 into the sleeve)
// Origin at the body's middle (y .40); local +y = head. Height ~.95.
const SUIT = new THREE.Color('#eef1f6'), TRIM = new THREE.Color('#ff8a3d'), DARK = new THREE.Color('#2b3240');
export const ASTRO_JOINTS = [
  ['torso', 'helmet', 0.07], ['torso', 'backpack', 0.07], ['torso', 'armL', 0.05], ['torso', 'armR', 0.05],
  ['torso', 'legL', 0.08], ['torso', 'legR', 0.08], ['legL', 'bootL', 0.06], ['legR', 'bootR', 0.06], ['armL', 'watch', 0.03],
];
const limb = (a: THREE.Vector3, b: THREE.Vector3, r: number) => {
  const d = b.clone().sub(a), g = new THREE.CapsuleGeometry(r, d.length(), 8, 16);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()));
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
};
export const useAstronautParts = () => useMemo(() => {
  const sticker = canvasTex(256, 128, (g) => {
    g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(4, 4, 248, 120, 22); g.fill();
    g.fillStyle = '#e8492f'; g.fillRect(4, 4, 248, 34);
    g.fillStyle = '#fff'; g.font = 'bold 22px sans-serif'; g.textAlign = 'center'; g.fillText('HELLO, I AM', 128, 29);
    g.fillStyle = '#111'; g.font = 'bold 74px sans-serif'; g.fillText('YOU', 128, 112);
  });
  const face = canvasTex(128, 128, (g) => {
    g.fillStyle = '#10141c'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill();
    g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.beginPath(); g.arc(64, 64, 54, 0, 7); g.stroke();
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillStyle = '#fff'; g.fillRect(64 + Math.cos(a) * 44 - 3, 64 + Math.sin(a) * 44 - 3, 6, 6); }
  });
  const y0 = -0.4; // geometry authored with feet at 0, shifted so the origin is the body's middle
  const geo = {
    torso: new THREE.CapsuleGeometry(0.16, 0.18, 8, 20).translate(0, 0.40 + y0, 0),
    helmet: new THREE.SphereGeometry(0.17, 32, 24).translate(0, 0.70 + y0, 0),
    visor: new THREE.SphereGeometry(0.13, 32, 20).scale(1, 0.78, 0.62).translate(0, 0.71 + y0, 0.118),
    backpack: new THREE.BoxGeometry(0.26, 0.3, 0.12).translate(0, 0.45 + y0, -0.13),
    armL: limb(V(0.15, 0.55 + y0, 0), V(0.25, 0.33 + y0, 0.04), 0.065),
    armR: limb(V(-0.15, 0.55 + y0, 0), V(-0.27, 0.36 + y0, 0.06), 0.065),
    gloveL: new THREE.SphereGeometry(0.07, 16, 12).translate(0.26, 0.30 + y0, 0.045),
    gloveR: new THREE.SphereGeometry(0.07, 16, 12).translate(-0.28, 0.33 + y0, 0.065),
    legL: limb(V(0.08, 0.27 + y0, 0), V(0.09, 0.07 + y0, 0.01), 0.075),
    legR: limb(V(-0.08, 0.27 + y0, 0), V(-0.09, 0.07 + y0, 0.01), 0.075),
    bootL: new THREE.SphereGeometry(0.085, 16, 12).scale(1, 0.8, 1.3).translate(0.09, 0.03 + y0, 0.03),
    bootR: new THREE.SphereGeometry(0.085, 16, 12).scale(1, 0.8, 1.3).translate(-0.09, 0.03 + y0, 0.03),
    belt: new THREE.TorusGeometry(0.162, 0.018, 8, 32).rotateX(Math.PI / 2).translate(0, 0.30 + y0, 0),
    collar: new THREE.TorusGeometry(0.13, 0.03, 10, 32).rotateX(Math.PI / 2).translate(0, 0.57 + y0, 0),
    watch: new THREE.CylinderGeometry(0.06, 0.06, 0.03, 24).rotateZ(Math.PI / 2).rotateY(-0.3).translate(0.255, 0.36 + y0, 0.07),
    watchFace: new THREE.CircleGeometry(0.05, 24).rotateY(Math.PI / 2 - 0.3).translate(0.275, 0.36 + y0, 0.064),
    sticker: new THREE.PlaneGeometry(0.2, 0.1).translate(0, 0.46 + y0, 0.165),
  };
  return {geo, sticker, face};
}, []);

// tint: 0 = as you see yourself, 1 = as the far friend sees you (red, dim); fade 0..1 hides
export const Astronaut: React.FC<{tint?: number; fade?: number; flash?: number; sticker?: number}> = ({tint = 0, fade = 0, flash = 0, sticker: stickerOn = 1}) => {
  const {geo, sticker, face} = useAstronautParts();
  const mats = useMemo(() => ({
    suit: new THREE.MeshStandardMaterial({color: SUIT, roughness: 0.55, metalness: 0.0, transparent: true}),
    trim: new THREE.MeshStandardMaterial({color: TRIM, roughness: 0.5, transparent: true}),
    dark: new THREE.MeshStandardMaterial({color: DARK, roughness: 0.6, transparent: true}),
    visor: new THREE.MeshStandardMaterial({color: '#3b2a12', roughness: 0.18, metalness: 0.35, emissive: new THREE.Color('#ff9a40'), emissiveIntensity: 0.07, transparent: true}),
    sticker: new THREE.MeshStandardMaterial({map: sticker, roughness: 0.7, transparent: true}),
    face: new THREE.MeshBasicMaterial({map: face, transparent: true, toneMapped: false}),
  }), [sticker, face]);
  const col = new THREE.Color().copy(SUIT).lerp(RED, tint * 0.85).multiplyScalar(1 - 0.55 * tint);
  mats.suit.color.copy(col); mats.suit.emissive.copy(RED).multiplyScalar(0.25 * tint + 0.15 * flash);
  const o = 1 - fade;
  Object.values(mats).forEach((m) => { m.opacity = o; m.depthWrite = o > 0.98; });
  mats.trim.color.copy(TRIM).multiplyScalar(1 - 0.6 * tint); mats.dark.color.copy(DARK).multiplyScalar(1 - 0.5 * tint);
  mats.sticker.color.setRGB(1, 1 - 0.7 * tint, 1 - 0.75 * tint);
  mats.sticker.opacity = o * stickerOn;
  if (o <= 0.001) return null;
  return (
    <group>
      {(['torso', 'armL', 'armR', 'legL', 'legR', 'helmet'] as const).map((k) => <mesh key={k} geometry={geo[k]} material={mats.suit} />)}
      {(['gloveL', 'gloveR', 'bootL', 'bootR', 'backpack'] as const).map((k) => <mesh key={k} geometry={geo[k]} material={mats.dark} />)}
      <mesh geometry={geo.belt} material={mats.trim} />
      <mesh geometry={geo.collar} material={mats.trim} />
      <mesh geometry={geo.visor} material={mats.visor} />
      <mesh geometry={geo.watch} material={mats.dark} />
      <mesh geometry={geo.watchFace} material={mats.face} />
      <mesh geometry={geo.sticker} material={mats.sticker} />
    </group>
  );
};

// Spaghetti: stretch along local y (the line to the hole), thin across, more at the end nearest the hole.
// s = 1 normal, 4 = a noodle. The group's +y must point away from the hole (feet toward it).
export const Stretch: React.FC<{s: number; children: React.ReactNode}> = ({s, children}) => {
  const w = 1 / Math.sqrt(s);
  return <group scale={[w, s, w]} position={[0, -(s - 1) * 0.12, 0]}>{children}</group>;
};

// ---------- the friend's ship: a small rounded capsule with a lit window and a friend inside ----------
export const Ship: React.FC<{t: number}> = ({t}) => {
  const parts = useMemo(() => ({
    hull: new THREE.CapsuleGeometry(0.55, 1.1, 10, 28).rotateZ(Math.PI / 2),
    fin: new THREE.BoxGeometry(0.5, 0.06, 0.9),
    win: new THREE.SphereGeometry(0.42, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.42).rotateX(-Math.PI / 2).translate(0.75, 0.02, 0),
    head: new THREE.SphereGeometry(0.17, 20, 16).translate(0.62, 0.0, 0),
    eng: new THREE.CircleGeometry(0.3, 24).rotateY(-Math.PI / 2).translate(-1.12, 0, 0),
    m: {
      hull: new THREE.MeshStandardMaterial({color: '#c9d2e0', roughness: 0.35, metalness: 0.5}),
      stripe: new THREE.MeshStandardMaterial({color: '#ff8a3d', roughness: 0.5}),
      win: new THREE.MeshStandardMaterial({color: '#9fd8ff', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.45, emissive: new THREE.Color('#3a8fd0'), emissiveIntensity: 0.6}),
      head: new THREE.MeshStandardMaterial({color: '#eef1f6', roughness: 0.5}),
      eng: new THREE.MeshBasicMaterial({color: '#8fd8ff', toneMapped: false, fog: false}),
    },
  }), []);
  return (
    <group>
      <mesh geometry={parts.hull} material={parts.m.hull} />
      <mesh geometry={parts.fin} material={parts.m.stripe} position={[-0.7, 0.45, 0]} rotation={[0, 0, -0.5]} />
      <mesh geometry={parts.fin} material={parts.m.stripe} position={[-0.7, -0.45, 0]} rotation={[0, 0, 0.5]} />
      <mesh geometry={parts.head} material={parts.m.head} />
      <mesh geometry={parts.win} material={parts.m.win} />
      <mesh geometry={parts.eng} material={parts.m.eng} scale={0.9 + 0.1 * Math.sin(t * 13)} />
    </group>
  );
};

// ---------- the giant star (the hole's past) ----------
const STAR_V = /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec3 vV;
void main(){ vP = position; vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`;
const STAR_F = /* glsl */ `uniform float uT; uniform float uHot; varying vec3 vP; varying vec3 vN; varying vec3 vV;
float h(vec3 p){ p = fract(p*0.3183+0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float n(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
 return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
void main(){ vec3 p = normalize(vP);
 float g = n(p*6.0+uT*0.4)*0.6 + n(p*14.0-uT*0.7)*0.3 + n(p*30.0)*0.1;
 float limb = pow(max(dot(normalize(vN),normalize(vV)),0.0), 0.45);
 vec3 c = mix(vec3(0.85,0.2,0.04), vec3(1.0,0.62,0.25), g) * (0.4+0.7*limb);
 c = mix(c, vec3(1.0,0.97,0.9), uHot);
 gl_FragColor = vec4(c*(0.72+1.1*uHot), 1.0); }`;
export const Star: React.FC<{r: number; t: number; hot: number}> = ({r, t, hot}) => {
  const geo = useMemo(() => new THREE.SphereGeometry(1, 64, 48), []);
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: STAR_V, fragmentShader: STAR_F, uniforms: {uT: {value: 0}, uHot: {value: 0}}, toneMapped: false}), []);
  const halo = useMemo(() => glowSprite('#ff9a4a'), []);
  mat.uniforms.uT.value = t; mat.uniforms.uHot.value = hot;
  if (r <= 0.01) return null;
  return (
    <group>
      <mesh geometry={geo} material={mat} scale={r} />
      <sprite material={halo} scale={r * (3.2 + 2 * hot)} />
    </group>
  );
};

// soft round additive sprite
const spriteTex = (() => {
  let t: THREE.Texture | null = null;
  return () => t ?? (t = canvasTex(128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  }));
})();
export const glowSprite = (color: string) => new THREE.SpriteMaterial({map: spriteTex(), color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false});

// ---------- points with soft round sprites (gas, river, sparks) ----------
const PTS_V = /* glsl */ `attribute float aSize; attribute vec3 aColor; varying vec3 vC;
void main(){ vC = aColor; vec4 mv = modelViewMatrix*vec4(position,1.0); gl_PointSize = aSize * 900.0 / -mv.z; gl_Position = projectionMatrix*mv; }`;
const PTS_F = /* glsl */ `varying vec3 vC; void main(){ vec2 d = gl_PointCoord-0.5; float a = exp(-dot(d,d)*18.0); gl_FragColor = vec4(vC*a, 1.0); }`;
export const usePoints = (n: number) => useMemo(() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(n), 1));
  const m = new THREE.ShaderMaterial({vertexShader: PTS_V, fragmentShader: PTS_F, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false});
  const p = new THREE.Points(g, m); p.frustumCulled = false;
  return p;
}, [n]);
const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// Gas that swirls down the drain: points on spiral orbits in the disk plane, inner ones lapping faster.
// on 0..1, heat 0..1 (orange -> white), sparks 0..1 (bumping bits flash)
export const Gas: React.FC<{t: number; on: number; heat: number; sparks: number; scale?: number}> = ({t, on, heat, sparks, scale = 1}) => {
  const N = 2600;
  const pts = usePoints(N);
  const pos = pts.geometry.attributes.position.array as Float32Array, col = pts.geometry.attributes.aColor.array as Float32Array, siz = pts.geometry.attributes.aSize.array as Float32Array;
  for (let i = 0; i < N; i++) {
    const life = 7 + 5 * rnd(i, 1), ph = rnd(i, 2) * life;
    const u = ((t + ph) % life) / life;                            // 0 at the outer rim -> 1 at the inner edge
    const r = 14 - 10.6 * Math.pow(u, 1.4) + rnd(i, 4) * 1.2;
    const a = rnd(i, 3) * 6.283 + (t + ph) * 1.6 * Math.pow(r, -1.5) * 6 + 0.0;
    const y = (rnd(i, 5) - 0.5) * 0.25 * (r / 10);
    pos[i * 3] = Math.cos(a) * r * scale; pos[i * 3 + 1] = y * scale; pos[i * 3 + 2] = Math.sin(a) * r * scale;
    const hot = Math.min(1, Math.pow(3.6 / r, 1.5) * (0.6 + 0.9 * heat));
    const fl = sparks * (rnd(i, Math.floor(t * 12)) > 0.985 ? 1 : 0);
    const c = new THREE.Color().setRGB(1, 0.45 + 0.5 * hot, 0.15 + 0.8 * hot * hot);
    const b = on * (0.45 + 0.9 * hot) * Math.min(1, u * 8) * Math.min(1, (1 - u) * 6) + fl * 2.5;
    col[i * 3] = c.r * b; col[i * 3 + 1] = c.g * b; col[i * 3 + 2] = c.b * b;
    siz[i] = (0.13 + 0.12 * rnd(i, 6) + fl * 0.15) * scale;
  }
  pts.geometry.attributes.position.needsUpdate = true; pts.geometry.attributes.aColor.needsUpdate = true; pts.geometry.attributes.aSize.needsUpdate = true;
  if (on <= 0.001 && sparks <= 0.001) return null;
  return <primitive object={pts} />;
};

// The river of space (line 5): in a plane facing the camera, dots stream inward at a speed that reaches light speed
// at the edge (v = c·sqrt(EDGE/r), the "river" picture of a black hole). Two light pulses swim outward at c: the
// one outside the edge creeps out, the one just inside is carried in.
export const River: React.FC<{t: number; t0: number; on: number; basis: THREE.Matrix4}> = ({t, t0, on, basis}) => {
  const N = 900, c = 0.75, E = EDGE * BASE;
  const pts = usePoints(N + 2);
  const pos = pts.geometry.attributes.position.array as Float32Array, col = pts.geometry.attributes.aColor.array as Float32Array, siz = pts.geometry.attributes.aSize.array as Float32Array;
  const k = 1.5 * c * Math.sqrt(E);
  const put = (i: number, r: number, a: number) => {
    const v = V(Math.cos(a) * r, Math.sin(a) * r, 0).applyMatrix4(basis);
    pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
  };
  for (let i = 0; i < N; i++) {
    const R0 = 3.4 * E, span = (Math.pow(R0, 1.5) - Math.pow(0.35 * E, 1.5)) / k;
    const s = (t + rnd(i, 1) * span) % span;
    const r = Math.pow(Math.pow(R0, 1.5) - k * s, 2 / 3);
    const a = rnd(i, 2) * 6.283;
    put(i, r, a);
    const inside = r < E;
    const b = on * Math.min(1, (R0 - r) * 1.5) * (inside ? 0.6 : 1.0);
    col[i * 3] = 0.55 * b; col[i * 3 + 1] = 0.75 * b; col[i * 3 + 2] = 1.0 * b;
    siz[i] = 0.11;
  }
  // the pulses: dr/dt = c - c·sqrt(EDGE/r), integrated from t0
  const pulse = (r0: number, i: number, ang: number) => {
    let r = r0;
    for (let s = 0, dt = 1 / 60; s < Math.max(0, t - t0); s += dt) r += (c - c * Math.sqrt(E / r)) * dt;
    put(i, Math.max(0.2, r), ang);
    const b = on * 4;
    col[i * 3] = b; col[i * 3 + 1] = b; col[i * 3 + 2] = b; siz[i] = 0.22;
  };
  pulse(E * 1.2, N, 0.6);
  pulse(E * 0.95, N + 1, 0.6 + Math.PI);
  pts.geometry.attributes.position.needsUpdate = true; pts.geometry.attributes.aColor.needsUpdate = true; pts.geometry.attributes.aSize.needsUpdate = true;
  if (on <= 0.001) return null;
  return <primitive object={pts} />;
};

// ---------- light rays traced in JS with the same law the shader uses (Rs = 1) ----------
export const tracePhoton = (p0w: THREE.Vector3, d0: THREE.Vector3, steps = 1400, dt = 0.03) => {
  const p = p0w.clone().divideScalar(BASE), v = d0.clone().normalize(), pts = [p.clone()];
  const h2 = p.clone().cross(v).lengthSq();
  for (let i = 0; i < steps; i++) {
    const r = p.length();
    if (r < 1.0) break;
    if (r > 60) break;
    const a = p.clone().multiplyScalar(-1.5 * h2 / Math.pow(r, 5));
    v.addScaledVector(a, dt).normalize(); p.addScaledVector(v, dt);
    if (i % 3 === 0) pts.push(p.clone());
  }
  pts.push(p.clone());
  return pts.map((q) => q.multiplyScalar(BASE));
};
// A fan of rays from `src`: each grows along its path at the speed of light (grow = distance travelled).
export const Rays: React.FC<{src: THREE.Vector3; dirs: THREE.Vector3[]; grow: number; on: number}> = ({src, dirs, grow, on}) => {
  const tubes = useMemo(() => dirs.map((d) => {
    const pts = tracePhoton(src, d);
    const len = pts.reduce((s, q, i) => (i ? s + q.distanceTo(pts[i - 1]) : 0), 0);
    const curve = new THREE.CatmullRomCurve3(pts);
    const segs = Math.max(8, Math.round(len * 14));
    return {geo: new THREE.TubeGeometry(curve, segs, 0.03, 6, false), len, segs};
  }), [src, dirs]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({color: LIGHT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false}), []);
  const head = useMemo(() => glowSprite('#ffffff'), []);
  mat.opacity = on;
  if (on <= 0.001) return null;
  return (
    <group>
      {tubes.map((tb, i) => {
        const f = Math.min(1, grow / tb.len);
        tb.geo.setDrawRange(0, Math.floor(tb.segs * f) * 6 * 6);
        const tip = tb.geo.parameters.path.getPointAt(Math.max(0.0001, f));
        return (
          <group key={i}>
            <mesh geometry={tb.geo} material={mat} />
            {f < 1 && <sprite material={head} position={tip} scale={0.22} />}
          </group>
        );
      })}
    </group>
  );
};

// ---------- a rock that falls in (line 4) ----------
export const Rock: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.22, 2); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)); v.multiplyScalar(1 + 0.22 * (rnd(i, 9) - 0.5)); p.setXYZ(i, v.x, v.y * 0.8, v.z); }
    g.computeVertexNormals(); return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({color: '#8a7f74', roughness: 0.9}), []);
  return <mesh geometry={geo} material={mat} />;
};

// ---------- gravity arrows (violet): from a point toward the hole, length = pull ----------
export const Arrow: React.FC<{from: THREE.Vector3; dir: THREE.Vector3; len: number; o: number; w?: number}> = ({from, dir, len, o, w = 0.05}) => {
  const parts = useMemo(() => ({
    shaft: new THREE.CylinderGeometry(1, 1, 1, 12).translate(0, 0.5, 0),
    head: new THREE.ConeGeometry(1, 1, 16).translate(0, 0.5, 0),
    mat: new THREE.MeshBasicMaterial({color: VIOLET, transparent: true, toneMapped: false, fog: false}),
  }), []);
  parts.mat.opacity = o;
  if (o <= 0.001 || len <= 0.01) return null;
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
  const hl = Math.min(len * 0.45, w * 4.5);
  return (
    <group position={from} quaternion={q}>
      <mesh geometry={parts.shaft} material={parts.mat} scale={[w, len - hl, w]} />
      <mesh geometry={parts.head} material={parts.mat} position={[0, len - hl, 0]} scale={[w * 2.6, hl, w * 2.6]} />
    </group>
  );
};

// ---------- the stretch zone: a violet shell around the hole where tides turn you into a noodle ----------
const ZONE_F = /* glsl */ `uniform vec3 uC; uniform float uO; varying vec3 vN; varying vec3 vV;
void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(uC * uO * (0.08 + 0.9 * pow(f, 3.0)), 1.0); }`;
export const Zone: React.FC<{r: number; o: number}> = ({r, o}) => {
  const geo = useMemo(() => new THREE.SphereGeometry(1, 64, 32), []);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: ZONE_F, uniforms: {uC: {value: VIOLET.clone()}, uO: {value: 0}}, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false,
  }), []);
  mat.uniforms.uO.value = o;
  if (o <= 0.001) return null;
  return <mesh geometry={geo} material={mat} scale={r} renderOrder={2} />;
};
