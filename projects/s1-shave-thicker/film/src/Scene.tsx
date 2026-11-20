// Three worlds in one canvas, switched on hard cuts (timeline.ts), all in millimetres:
//  skin:    a macro landscape of skin with a forest of hairs; a steel blade edge sweeps through and the cut tops fall;
//           the myth swells the stubs coral; at the end the stubble regrows to the same width.
//  section: the skin cut in half: layers, follicles 3 mm deep, the living root (amber) far below the blade's path.
//  tips:    an uncut hair (tapered tip) and a shaved one (blunt end); steel caliper jaws close on both: same width;
//           a soft pad brushes both tips: the fine tip bends away, the blunt end pokes.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {random} from 'remotion';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
const V = (x: number, y: number) => new THREE.Vector2(x, y);

// a hair along +y from y = 0: full width up to the taper, then a fine tapered tip (uncut), or a blunt flat top (cut)
export const hairGeo = (len: number, r: number, tapered: boolean, base = 0.6) => {
  const p: THREE.Vector2[] = [V(0.0001, -base), V(r * 1.05, -base), V(r, 0)];
  // the taper starts with zero slope (no kink) and closes to a fine point
  if (tapered) { const t0 = len - TL.TIP_L; p.push(V(r, t0)); for (let i = 1; i <= 18; i++) { const k = i / 18; p.push(V(r * Math.pow(Math.cos(k * Math.PI / 2), 1.3) + 0.0004, t0 + TL.TIP_L * k)); } }
  else { p.push(V(r, len - 0.003), V(r * 0.97, len), V(0.0001, len)); }
  return new THREE.LatheGeometry(p, 20);
};

const hairMaterial = (env: THREE.Texture, u: Record<string, THREE.IUniform>, key: string) => {
  const m = new THREE.MeshPhysicalMaterial({color: col('#2A1B14'), roughness: 0.32, clearcoat: 0.4, clearcoatRoughness: 0.25, sheen: 0.4, sheenColor: col('#8A6A55'), envMap: env, envMapIntensity: 0.7});
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    // bend: the part above y0 swings toward +x by bend * (y - y0)^2 (a fingertip brushing it)
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uHbBend; uniform float uHbY0;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat hbd = max(transformed.y - uHbY0, 0.0); transformed.x += uHbBend * hbd * hbd;');
  };
  m.customProgramCacheKey = () => 'hair' + key;
  return m;
};

const skinMaterial = (env: THREE.Texture) => {
  const m = new THREE.MeshPhysicalMaterial({color: col('#B8846E'), roughness: 0.55, sheen: 0.45, sheenColor: col('#FFD6C4'), sheenRoughness: 0.5, clearcoat: 0.15, clearcoatRoughness: 0.5, envMap: env, envMapIntensity: 0.35});
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSk;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvSk = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vSk;
      vec2 hk(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
      float vor(vec2 p){ vec2 i = floor(p), f = fract(p); float d = 8.0, d2 = 8.0;
        for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 g = vec2(x, y); vec2 o = hk(i + g); float e = length(g + o - f); if (e < d) { d2 = d; d = e; } else if (e < d2) d2 = e; }
        return d2 - d; }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); float a = hk(i).x, b = hk(i+vec2(1,0)).x, c = hk(i+vec2(0,1)).x, d = hk(i+vec2(1,1)).x; return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        // skin furrows (a cell pattern ~1.5 mm), fine grain, blotchy tone; fade to a warm dark far away
        float cr = smoothstep(0.0, 0.09, vor(vSk.xz * 0.7));
        diffuseColor.rgb *= 0.72 + 0.28 * cr;
        diffuseColor.rgb *= 0.9 + 0.12 * vn(vSk.xz * 9.0) + 0.1 * vn(vSk.xz * 0.35);
        float far = smoothstep(9.0, 30.0, length(vSk.xz));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.12, 0.06, 0.05), far);`);
  };
  return m;
};

// the section face: skin layers by depth (epidermis, dermis, fat)
const layersMaterial = () => new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `varying vec3 vP;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
    void main(){
      float d = -vP.y;                                    // depth below the surface (mm)
      vec3 epi = vec3(0.86, 0.66, 0.56), derm = vec3(0.78, 0.42, 0.40), fat = vec3(0.95, 0.80, 0.45);
      vec3 c = d < 0.12 ? epi : d < 3.6 ? derm : fat;
      c *= 0.86 + 0.2 * vn(vP.xy * vec2(4.0, 6.0));
      if (d > 3.6) { vec2 q = vP.xy * 2.2; vec2 i = floor(q), f = fract(q) - 0.5; c *= 0.8 + 0.2 * smoothstep(0.5, 0.35, length(f)); }
      c *= 1.0 - 0.5 * smoothstep(5.0, 7.5, d);
      gl_FragColor = vec4(c, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});

const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const sprite = (tex: THREE.Texture, c: string, size: number, order = 20) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col(c), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true}));
  s.scale.setScalar(size); s.renderOrder = order; return s;
};

// a blade: a steel slab whose bevelled edge runs along z, edge at the origin, body up and back (-x)
const bladeGeo = (depth = 40, z0 = -20) => {
  const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(-1.2, 0.22); s.lineTo(-5, 0.32); s.lineTo(-5, 0.1); s.lineTo(-1.2, 0.08); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth, bevelEnabled: false}); g.translate(0, 0, z0); return g;
};

type Hair = {x: number; z: number; len: number; tilt: number; yaw: number; cutAt: number; fallDir: number; s: number};

const CUT_TOP = TL.CUT_H;
export const Scene: React.FC<{t: number}> = ({t}) => {
  const {gl, camera, scene} = useThree();
  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace; gl.localClippingEnabled = true;
    const pm = new THREE.PMREMGenerator(gl); const envScene = new RoomEnvironment(); const env = pm.fromScene(envScene, 0.04).texture;
    const tex = glowTex();
    const U = {uHbBend: {value: 0}, uHbY0: {value: 0}};
    const U2 = {uHbBend: {value: 0}, uHbY0: {value: 0}};
    const CLIP = [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)];

    // lights (shared)
    const key = new THREE.DirectionalLight(col('#FFE8D2'), 2.8); key.position.set(-6, 10, 7); scene.add(key);
    const rim = new THREE.DirectionalLight(col('#A8D4F0'), 1.5); rim.position.set(8, 4, -9); scene.add(rim);
    scene.add(new THREE.HemisphereLight(col('#F2DDD0'), col('#40241C'), 0.6));

    // ---------- skin world
    const skinW = new THREE.Group(); scene.add(skinW);
    const skin = new THREE.Mesh(new THREE.PlaneGeometry(80, 80, 1, 1), skinMaterial(env)); skin.rotation.x = -Math.PI / 2; skinW.add(skin);
    const hairs: Hair[] = [];
    for (let i = 0; i < 520; i++) {
      const x = (random('hx' + i) - 0.5) * 30, z = (random('hz' + i) - 0.5) * 26;
      if (Math.hypot(x, z) > 16) continue;
      if (x > 2 && z > 3 && Math.hypot(x - 5, z - 6) < 4.2) continue;   // keep the hook camera's lens clear
      if (Math.hypot(x + 4, z - 10.5) < 4.5) continue;                   // and the end camera's
      hairs.push({x, z, len: TL.HAIR_L * (0.85 + 0.3 * random('hl' + i)), tilt: 0.35 + 0.25 * random('ht' + i), yaw: 0.6 + (random('hy' + i) - 0.5) * 0.6,
        cutAt: 0, fallDir: random('hf' + i) * 6.28, s: 0.85 + 0.3 * random('hs' + i)});
    }
    const UF = {uHbBend: {value: 0}, uHbY0: {value: 0.6}}; const hm = hairMaterial(env, UF, 'f');
    const hairCol = col('#2A1B14'), vellusCol = col('#8E6E5C');
    const full = new THREE.InstancedMesh(hairGeo(TL.HAIR_L, TL.HAIR_R, true), hm, hairs.length);
    const stubM = hairMaterial(env, {uHbBend: {value: 0}, uHbY0: {value: 0}}, 'st'); stubM.emissive = col(TL.AMBER); stubM.emissiveIntensity = 0;
    const stubs = new THREE.InstancedMesh(hairGeo(TL.REGROW_L, TL.HAIR_R, false, 2.4), stubM, hairs.length);
    full.frustumCulled = stubs.frustumCulled = false; skinW.add(full, stubs);
    const ghostM = new THREE.MeshBasicMaterial({color: col(TL.CORAL), transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false});
    const ghosts = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 20, 1, false).translate(0, 0.5, 0), ghostM, hairs.length); ghosts.frustumCulled = false; skinW.add(ghosts);
    const bladeM = new THREE.MeshPhysicalMaterial({color: col('#7C8892'), metalness: 1, roughness: 0.22, envMap: env, envMapIntensity: 0.85, clearcoat: 0.5});
    const blade = new THREE.Mesh(bladeGeo(), bladeM); skinW.add(blade);
    const edgeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 40), new THREE.MeshBasicMaterial({color: col(TL.STEEL), transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}));
    skinW.add(edgeGlow);
    const cutLine = new THREE.Mesh(new THREE.PlaneGeometry(40, 0.06).rotateX(-Math.PI / 2).translate(0, TL.STUB + 0.02, 0), new THREE.MeshBasicMaterial({color: col(TL.AMBER), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}));
    skinW.add(cutLine);

    // ---------- section world (cut in half at z = 0; the face drawn just behind the follicles)
    const secW = new THREE.Group(); scene.add(secW);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(16, 9).translate(0, -4.5, 0), layersMaterial()); face.position.z = -0.16; secW.add(face);
    const topSkin = new THREE.Mesh(new THREE.PlaneGeometry(16, 10).rotateX(-Math.PI / 2).translate(0, 0, -5), skinMaterial(env)); secW.add(topSkin);
    const sheathM = new THREE.MeshPhysicalMaterial({color: col('#E8B4A8'), roughness: 0.5, side: THREE.DoubleSide, clippingPlanes: CLIP, envMap: env, envMapIntensity: 0.3});
    const secHairM = hairMaterial(env, U2, 's'); secHairM.clippingPlanes = CLIP; secHairM.side = THREE.DoubleSide;
    const follicles = [-2.2, 0.2, 2.6].map((x, i) => {
      const g = new THREE.Group(); g.position.set(x, 0, 0); g.rotation.z = (i - 1) * 0.12; secW.add(g);
      const sheath = new THREE.Mesh(new THREE.LatheGeometry([V(0.12, 0.05), V(0.13, -1.0), V(0.14, -2.4), V(0.22, -2.8), V(0.26, -3.05), V(0.18, -3.25), V(0.001, -3.3)], 24), sheathM); g.add(sheath);
      const shaft = new THREE.Mesh(hairGeo(TL.HAIR_L, TL.HAIR_R, true), secHairM); shaft.position.y = -2.7; g.add(shaft);
      const stubShaft = new THREE.Mesh(hairGeo(2.25 + TL.STUB, TL.HAIR_R, false), secHairM); stubShaft.position.y = -2.25; g.add(stubShaft);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16).scale(1, 1.2, 1), new THREE.MeshStandardMaterial({color: col('#C9705A'), emissive: col(TL.AMBER), emissiveIntensity: 0, roughness: 0.6, clippingPlanes: CLIP, side: THREE.DoubleSide}));
      bulb.position.y = -3.0; g.add(bulb);
      const glow = sprite(tex, TL.AMBER, 0.9, 22); glow.position.y = -3.0; g.add(glow);
      return {g, shaft, stubShaft, bulb, glow};
    });
    const secBlade = new THREE.Mesh(bladeGeo(5, -4.9), bladeM); secW.add(secBlade);
    const bracket = new THREE.Group(); secW.add(bracket);
    const dashM = new THREE.MeshBasicMaterial({color: col(TL.AMBER), transparent: true, opacity: 0, depthTest: false, toneMapped: false});
    for (let k = 0; k < 12; k++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.15, 0.01), dashM); d.position.set(0.6, 0.0 - k * 0.25, 0.05); d.renderOrder = 30; bracket.add(d); }
    [TL.STUB + 0.1, -3.0].forEach((y) => { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.035, 0.01), dashM); tk.position.set(0.5, y, 0.05); tk.renderOrder = 30; bracket.add(tk); });
    secBlade.material = bladeM;

    // ---------- tips world: two hairs from a strip of skin, 0.6 mm apart
    const tipW = new THREE.Group(); scene.add(tipW);
    const tipSkin = new THREE.Mesh(new THREE.PlaneGeometry(30, 30).rotateX(-Math.PI / 2), skinMaterial(env)); tipW.add(tipSkin);
    const backdrop = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({color: col('#1A0F0C'), side: THREE.BackSide})); tipW.add(backdrop);
    const hmL = hairMaterial(env, U, 'L'); const hmR = hairMaterial(env, U2, 'R');
    const leftHair = new THREE.Mesh(hairGeo(TL.TIP_HAIR, TL.HAIR_R, true, 1.6), hmL); leftHair.position.set(-TL.TIP_X, 0, 0); tipW.add(leftHair);
    const rightFull = new THREE.Mesh(hairGeo(TL.TIP_HAIR, TL.HAIR_R, true), hmR); rightFull.position.set(TL.TIP_X, 0, 0); tipW.add(rightFull);
    const stubGeo = hairGeo(1.0, TL.HAIR_R, false);   // blunt, top at 1 mm: scaled in y to the stub's height
    const rightStub = new THREE.Mesh(stubGeo, hmR); rightStub.position.set(TL.TIP_X, 0, 0); tipW.add(rightStub);
    const fallR = new THREE.Mesh(hairGeo(TL.TIP_HAIR - TL.CUT_H, TL.HAIR_R, true, 0.001), hmR); tipW.add(fallR);
    // the 1928/1970 test: a level line both hairs cross together as they grow
    const level = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.012, 0.01), new THREE.MeshBasicMaterial({color: col(TL.AMBER), transparent: true, opacity: 0, depthTest: false, toneMapped: false})); level.renderOrder = 30; tipW.add(level);
    const ringM = new THREE.MeshBasicMaterial({color: col(TL.AMBER), transparent: true, opacity: 0, toneMapped: false});
    const ring = new THREE.Mesh(new THREE.TorusGeometry(TL.HAIR_R + 0.02, 0.026, 10, 40).rotateX(Math.PI / 2), ringM); tipW.add(ring);
    const ringGlow = sprite(tex, TL.AMBER, 0.5, 22); tipW.add(ringGlow); const stubGlow = sprite(tex, TL.AMBER, 0.5, 22); tipW.add(stubGlow);   // both growth marks glow: they rise together
    // caliper: a steel beam behind the hair with a readout, two jaws reaching forward around the shaft (y 0.05-0.27)
    const jawM = new THREE.MeshPhysicalMaterial({color: col('#C9D2D8'), metalness: 1, roughness: 0.22, envMap: env, envMapIntensity: 1.2});
    const jawGeo = new THREE.BoxGeometry(0.04, 0.22, 0.3);
    const jawL = new THREE.Mesh(jawGeo, jawM), jawR = new THREE.Mesh(jawGeo, jawM); tipW.add(jawL, jawR);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.06), jawM); tipW.add(beam);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.03), new THREE.MeshStandardMaterial({color: col('#141A1E'), roughness: 0.4})); tipW.add(screen);
    const jawEdgeM = new THREE.MeshBasicMaterial({color: col(TL.AMBER), transparent: true, opacity: 0, depthWrite: false, toneMapped: false});
    const eg = new THREE.BoxGeometry(0.01, 0.2, 0.3);
    const edgeL = new THREE.Mesh(eg, jawEdgeM), edgeR = new THREE.Mesh(eg, jawEdgeM); tipW.add(edgeL, edgeR);
    // fingertip: at this scale a wall of ridged skin (fingerprint ridges ~0.45 mm apart) that presses down from above
    const ridges = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d')!; g.fillStyle = '#707070'; g.fillRect(0, 0, 512, 512);
      g.strokeStyle = '#E8E8E8'; g.lineWidth = 7;
      for (let k = 0; k < 40; k++) { g.beginPath(); for (let x = 0; x <= 512; x += 8) { const y = k * 12.8 + 3 * Math.sin(x * 0.03 + k * 0.7); x === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t; })();
    const pad = new THREE.Mesh(new THREE.SphereGeometry(3, 96, 64).scale(1, 0.3, 0.6),
      new THREE.MeshPhysicalMaterial({color: col('#D99A84'), roughness: 0.55, bumpMap: ridges, bumpScale: 4, sheen: 0.6, sheenColor: col('#FFD8C8'), clearcoat: 0.2, envMap: env, envMapIntensity: 0.4}));
    tipW.add(pad);
    const tipGlow = sprite(tex, TL.CORAL, 0.6, 22); tipW.add(tipGlow);
    const tipBlade = new THREE.Mesh(bladeGeo(1.4, -0.7), bladeM); tipBlade.rotation.y = Math.PI; tipBlade.scale.setScalar(0.5); tipW.add(tipBlade);

    // the place's own life: dust motes drifting in the light (every world), blood cells flowing in a capillary (section)
    const NM = 160, mp = new Float32Array(NM * 3);
    const motes = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(mp, 3)),
      new THREE.PointsMaterial({map: tex, color: col('#FFE9D6'), size: 0.07, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false}));
    motes.frustumCulled = false; scene.add(motes);
    const MS = Array.from({length: NM}, (_, i) => ({x: random('mx' + i), y: random('my' + i), z: random('mz' + i), v: 0.3 + random('mv' + i), p: random('mp' + i) * 6.28}));
    const vessel = new THREE.Mesh(new THREE.PlaneGeometry(16, 0.34).translate(0, -1.55, -0.12), new THREE.MeshBasicMaterial({color: col('#B4545A'), transparent: true, opacity: 0.55}));
    secW.add(vessel);
    const NC = 26; const cells = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 16, 10).scale(1, 0.55, 0.4), new THREE.MeshStandardMaterial({color: col('#C8242C'), roughness: 0.45, emissive: col('#5A0A0E'), emissiveIntensity: 0.4}), NC);
    cells.frustumCulled = false; secW.add(cells);
    return {ringGlow, stubGlow, tipBlade, UF, motes, MS, mp, cells, NC, dashM, hairCol, vellusCol, skinW, secW, tipW, hairs, full, stubs, stubM, ghosts, ghostM, blade, edgeGlow, cutLine, follicles, secBlade, leftHair, rightFull, rightStub, fallR, jawL, jawR, beam, screen, edgeL, edgeR, jawEdgeM, pad, U, U2, tipGlow, level, ring, ringM};
  }, [gl, scene]);

  // ---------- per frame
  const w = TL.world(t);
  const cam = camera as THREE.PerspectiveCamera; const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.02; cam.far = 400;
  cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  scene.background = col(w === 'skin' ? '#1E0F0B' : w === 'section' ? '#140A08' : '#1A0F0C');
  gl.toneMappingExposure = 1.0;
  W.skinW.visible = w === 'skin'; W.secW.visible = w === 'section'; W.tipW.visible = w === 'tips';

  // motes drift around the camera's target in a 7 x 9 x 5 mm box, wrapping (deterministic in t)
  W.MS.forEach((m, i) => {
    const wrap = (v: number) => v - Math.floor(v);
    W.mp[i * 3] = c.look[0] + (wrap(m.x + 0.015 * m.v * t) - 0.5) * 7 + 0.15 * Math.sin(t * 0.7 + m.p);
    W.mp[i * 3 + 1] = c.look[1] + (wrap(m.y + 0.02 * m.v * t) - 0.5) * 9;
    W.mp[i * 3 + 2] = c.look[2] + (m.z - 0.3) * 5 + 0.1 * Math.cos(t * 0.5 + m.p);
  });
  (W.motes.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  if (w === 'section') {
    const o2 = new THREE.Object3D();
    for (let k = 0; k < W.NC; k++) {
      const u = (random('cu' + k) + 0.06 * t * (0.8 + 0.4 * random('cv' + k))) % 1;
      o2.position.set(-8 + 16 * u, -1.55 + (random('cy' + k) - 0.5) * 0.18, -0.08); o2.rotation.set(0, 0, t * 1.5 + k); o2.updateMatrix(); W.cells.setMatrixAt(k, o2.matrix);
    }
    W.cells.instanceMatrix.needsUpdate = true;
  }
  if (w === 'skin') {
    W.UF.uHbBend.value = 0.018 * Math.sin(t * 1.2) + 0.008 * Math.sin(t * 2.9);   // a breath of air through the forest
    const end = t >= TL.CUT_END;
    // one blade sweep at the start, a second on "So shave or don't"
    const bx = end ? TL.blade2X(t) : TL.bladeX(t), bo = end ? TL.blade2On(t) : TL.bladeOn(t);
    W.blade.visible = W.edgeGlow.visible = bo > 0.01;
    W.blade.position.set(bx, TL.STUB + 0.01, 0);
    W.edgeGlow.position.set(bx, TL.STUB + 0.02, 0);
    const o = new THREE.Object3D(); const sw = TL.mythSwell(t); const pb = end ? TL.puberty(t) : 1; const rg = TL.regrow(t);
    const swept = bo > 0.01 || (end ? t > TL.B.shaveOr + 1.2 : true);
    // puberty: fine pale hairs (vellus) become thick dark ones; colour on the shared material
    (W.full.material as THREE.MeshPhysicalMaterial).color.copy(W.vellusCol).lerp(W.hairCol, pb);
    const wid = 0.35 + 0.65 * pb;
    W.hairs.forEach((h, i) => {
      const cut = swept && bx > h.x;
      const sinceCut = cut ? Math.max(0, (bx - h.x) / 9) : 0;
      o.position.set(h.x, 0, h.z); o.rotation.set(Math.sin(h.yaw) * h.tilt, h.yaw, Math.cos(h.yaw) * h.tilt);
      o.scale.set(h.s * wid, (h.len / TL.HAIR_L) * (end ? 0.35 + 0.65 * pb : 1), h.s * wid);
      if (cut) {
        // the cut top tips back onto the blade's top face and rides away with it
        const f = TL.smooth(Math.min(1, sinceCut * 3));
        const back = 0.35 + 0.9 * h.fallDir / 6.28;
        o.position.set(bx - back * f + (h.x - bx) * (1 - f), TL.STUB + 0.02 + 0.22 * f, h.z);
        o.rotation.set(0, 0, (Math.cos(h.yaw) * h.tilt) * (1 - f) + f * (Math.PI / 2 - 0.12));
        if (bo < 0.01) o.scale.set(0.0001, 0.0001, 0.0001);   // gone with the blade
      }
      o.updateMatrix(); W.full.setMatrixAt(i, o.matrix);
      // stub: after the cut; in the end world it regrows (same width, blunt tip)
      // stub: after the cut. It never scales: in the end world it rises out of the skin (grows from the root), blunt top, same width
      const sh = end ? TL.STUB + (1.6 - TL.STUB) * rg : TL.STUB;
      o.rotation.set(Math.sin(h.yaw) * h.tilt * 0.6, h.yaw, Math.cos(h.yaw) * h.tilt * 0.6);
      const ax = new THREE.Vector3(0, 1, 0).applyEuler(o.rotation).multiplyScalar(sh - TL.REGROW_L);
      o.position.set(h.x + ax.x, ax.y, h.z + ax.z); o.scale.setScalar(cut ? h.s : 0);
      o.updateMatrix(); W.stubs.setMatrixAt(i, o.matrix);
      if (end) {   // "same width": a thin amber sleeve at the original width around each regrown stub
        o.position.set(h.x, 0, h.z); const k = i % 7 === 0 && cut ? 1 : 0; o.scale.set(TL.HAIR_R * h.s * 1.3 * k, sh * k, TL.HAIR_R * h.s * 1.3 * k);
      } else { o.position.set(h.x, 0, h.z); o.rotation.set(0, 0, 0); o.scale.set(TL.HAIR_R * (1 + 2.2 * sw), 0.1 + 0.8 * sw, TL.HAIR_R * (1 + 2.2 * sw)); }
      o.updateMatrix(); W.ghosts.setMatrixAt(i, o.matrix);
    });
    W.full.instanceMatrix.needsUpdate = W.stubs.instanceMatrix.needsUpdate = W.ghosts.instanceMatrix.needsUpdate = true;
    const sleeve = 0;   // amber sleeves at the end read as gold hairs (board v3): dropped
    W.ghosts.visible = end ? sleeve > 0.01 : sw > 0.01; W.ghostM.color.set(end ? TL.AMBER : TL.CORAL); W.ghostM.opacity = end ? 0.45 * sleeve : 0.55 * sw;
    W.cutLine.visible = false;
    W.stubM.emissiveIntensity = end ? 0 : 1.6 * TL.cutLineGlow(t);   // the cut faces glow on "surface": the cut level
  } else { (W.full.material as THREE.MeshPhysicalMaterial).color.copy(W.hairCol); }
  if (w === 'section') {
    const rgl = TL.rootGlow(t);
    W.follicles.forEach((f) => {
      f.shaft.visible = false; f.stubShaft.visible = true;
      (f.bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.9 * rgl;
      (f.glow.material as THREE.SpriteMaterial).opacity = 0.7 * rgl;
    });
    W.secBlade.position.set(TL.secBladeX(t), TL.STUB + 0.01, 0);
    W.dashM.opacity = 0.95 * TL.depthLabel(t);
  }
  if (w === 'tips') {
    const cs = TL.cutSecond(t), gr = TL.grow(t), dy = 0.82 * gr;
    // the test: the unshaved hair (left) and the shaved one (right) both grow from the root by the same amount
    W.rightFull.visible = cs < 0.02; W.rightStub.visible = cs >= 0.02; W.rightStub.scale.set(1, TL.CUT_H + dy, 1);
    W.leftHair.position.y = dy;
    const so = Math.min(1, TL.studyOn(t) + TL.resultOn(t));
    (W.level.material as THREE.MeshBasicMaterial).opacity = 0.9 * so; W.level.position.set(0, TL.CUT_H + dy, 0.12);
    W.ringM.opacity = so; W.ring.position.set(-TL.TIP_X, TL.CUT_H + dy, 0);
    (W.ringGlow.material as THREE.SpriteMaterial).opacity = 0.8 * so; W.ringGlow.position.set(-TL.TIP_X, TL.CUT_H + dy, 0.1);
    (W.stubGlow.material as THREE.SpriteMaterial).opacity = 0.8 * so; W.stubGlow.position.set(TL.TIP_X, TL.CUT_H + dy, 0.1);
    // the cut top tips over about the cut and lies on the skin beside its stub (gone before the test)
    W.fallR.visible = cs >= 0.02 && t < TL.B.tested - 0.3; W.fallR.position.set(TL.TIP_X + 0.12 * cs, TL.CUT_H * (1 - cs) + 0.07 * cs, -0.25 * cs); W.fallR.rotation.set(0, 0, -1.5 * cs);
    // caliper jaws at the base (y 0.15), first on the left hair, then the right; again on "not thicker"
    const cl = Math.max(TL.caliper(t), TL.caliper2(t) * (t > TL.B.didnt ? 1 : 0)), mv = TL.caliper2(t) > 0 ? 1 : TL.caliperMove(t);
    const hx = -TL.TIP_X + 2 * TL.TIP_X * mv, gap = TL.HAIR_R + 0.22 * (1 - cl), cy = 0.16, cz = 0.12;
    const entering = t < TL.B.same || (t > TL.B.didnt && t < TL.CUT_END);
    const drop = entering ? 0.6 * (1 - cl) : 0;   // lowers into place; leaves by vanishing (never floats off)
    W.jawL.position.set(hx - gap - 0.02, cy + drop, cz); W.jawR.position.set(hx + gap + 0.02, cy + drop, cz);
    W.edgeL.position.set(hx - gap + 0.003, cy + drop, cz); W.edgeR.position.set(hx + gap - 0.003, cy + drop, cz);
    W.beam.position.set(hx - gap - 0.62, 0.3 + drop, 0.3); W.screen.position.set(hx - gap - 0.55, 0.3 + drop, 0.34);
    W.jawL.visible = W.jawR.visible = W.edgeL.visible = W.edgeR.visible = W.beam.visible = cl > (entering ? 0.01 : 0.5);
    W.screen.visible = false;   // the readout label is the display (a black box beside it read as a glitch)
    W.jawEdgeM.opacity = cl;
    // fingertip presses down from above: the fine tip folds away, the blunt stub meets the skin and pokes (coral)
    const pr = TL.press(t), padBottom = CUT_TOP + 1.9 * (1 - pr);
    W.pad.visible = pr > 0.001 || TL.fingerOn(t) > 0.01; W.pad.position.set(0.35, padBottom + 0.9, 0);
    const fold = 1.0 * TL.smooth((TL.TIP_HAIR - padBottom) / 1.6);
    W.leftHair.rotation.z = t < TL.B.tested ? fold : 0;
    W.U.uHbBend.value = 0.012 * Math.sin(t * 1.3); W.U.uHbY0.value = 0.3; W.U2.uHbBend.value = 0.012 * Math.sin(t * 1.1 + 1.5); W.U2.uHbY0.value = 0.3;   // a slight sway
    const tbx = TL.tipBladeX(t); W.tipBlade.visible = tbx < 3.1; W.tipBlade.position.set(tbx, TL.CUT_H - 0.02, 0);
    const poke = TL.ramp(pr, 0.9, 1.0) * TL.fingerOn(t);
    (W.tipGlow.material as THREE.SpriteMaterial).opacity = poke; W.tipGlow.position.set(TL.TIP_X, TL.CUT_H, 0.3);
  }
  return null;
};
