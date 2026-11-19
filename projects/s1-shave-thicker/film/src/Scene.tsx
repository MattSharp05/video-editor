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
export const hairGeo = (len: number, r: number, tapered: boolean) => {
  const p: THREE.Vector2[] = [V(0.0001, -0.6), V(r * 1.05, -0.6), V(r, 0)];
  if (tapered) { const t0 = len - TL.TIP_L; p.push(V(r, t0)); for (let i = 1; i <= 12; i++) { const k = i / 12; p.push(V(r * Math.pow(1 - k, 1.6) + 0.0004, t0 + TL.TIP_L * k)); } }
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
  const m = new THREE.MeshPhysicalMaterial({color: col('#D8A48C'), roughness: 0.55, sheen: 0.6, sheenColor: col('#FFD6C4'), sheenRoughness: 0.5, clearcoat: 0.15, clearcoatRoughness: 0.5, envMap: env, envMapIntensity: 0.35});
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
const bladeGeo = () => {
  const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(-1.2, 0.22); s.lineTo(-8, 0.32); s.lineTo(-8, 0.1); s.lineTo(-1.2, 0.08); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: 40, bevelEnabled: false}); g.translate(0, 0, -20); return g;
};

type Hair = {x: number; z: number; len: number; tilt: number; yaw: number; cutAt: number; fallDir: number; s: number};

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
      hairs.push({x, z, len: TL.HAIR_L * (0.85 + 0.3 * random('hl' + i)), tilt: 0.15 + 0.35 * random('ht' + i), yaw: random('hy' + i) * 6.28,
        cutAt: 0, fallDir: random('hf' + i) * 6.28, s: 0.85 + 0.3 * random('hs' + i)});
    }
    const hm = hairMaterial(env, {uHbBend: {value: 0}, uHbY0: {value: 0}}, 'f');
    const hairCol = col('#2A1B14'), vellusCol = col('#C9A48A');
    const full = new THREE.InstancedMesh(hairGeo(TL.HAIR_L, TL.HAIR_R, true), hm, hairs.length);
    const stubs = new THREE.InstancedMesh(hairGeo(TL.STUB + 0.6, TL.HAIR_R, false), hm, hairs.length);
    full.frustumCulled = stubs.frustumCulled = false; skinW.add(full, stubs);
    const ghostM = new THREE.MeshBasicMaterial({color: col(TL.CORAL), transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending});
    const ghosts = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 20, 1, true).translate(0, 0.5, 0), ghostM, hairs.length); ghosts.frustumCulled = false; skinW.add(ghosts);
    const bladeM = new THREE.MeshPhysicalMaterial({color: col('#9AA8B2'), metalness: 1, roughness: 0.16, envMap: env, envMapIntensity: 0.9, clearcoat: 0.6});
    const blade = new THREE.Mesh(bladeGeo(), bladeM); skinW.add(blade);
    const edgeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 40), new THREE.MeshBasicMaterial({color: col(TL.STEEL), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}));
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
      const stubShaft = new THREE.Mesh(hairGeo(2.7 + TL.STUB, TL.HAIR_R, false), secHairM); stubShaft.position.y = -2.7; g.add(stubShaft);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16).scale(1, 1.2, 1), new THREE.MeshStandardMaterial({color: col('#C9705A'), emissive: col(TL.AMBER), emissiveIntensity: 0, roughness: 0.6, clippingPlanes: CLIP, side: THREE.DoubleSide}));
      bulb.position.y = -3.0; g.add(bulb);
      const glow = sprite(tex, TL.AMBER, 0.9, 22); glow.position.y = -3.0; g.add(glow);
      return {g, shaft, stubShaft, bulb, glow};
    });
    const secBlade = new THREE.Mesh(bladeGeo(), bladeM); secBlade.scale.setScalar(0.8); secW.add(secBlade);
    secBlade.material = bladeM;

    // ---------- tips world: two hairs from a strip of skin, 0.6 mm apart
    const tipW = new THREE.Group(); scene.add(tipW);
    const tipSkin = new THREE.Mesh(new THREE.PlaneGeometry(30, 30).rotateX(-Math.PI / 2), skinMaterial(env)); tipW.add(tipSkin);
    const backdrop = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({color: col('#1A0F0C'), side: THREE.BackSide})); tipW.add(backdrop);
    const hmL = hairMaterial(env, U, 'L'); const hmR = hairMaterial(env, U2, 'R');
    const leftHair = new THREE.Mesh(hairGeo(TL.HAIR_L - 0.4, TL.HAIR_R, true), hmL); leftHair.position.set(-0.3, 0, 0); tipW.add(leftHair);
    const rightFull = new THREE.Mesh(hairGeo(TL.HAIR_L - 0.4, TL.HAIR_R, true), hmR); rightFull.position.set(0.3, 0, 0); tipW.add(rightFull);
    const rightCut = new THREE.Mesh(hairGeo(2.4, TL.HAIR_R, false), hmR); rightCut.position.set(0.3, 0, 0); tipW.add(rightCut);
    const fallen = new THREE.Mesh(hairGeo(TL.HAIR_L - 0.4 - 2.4, TL.HAIR_R, true), hmR); tipW.add(fallen);
    // caliper jaws: two steel blades closing from the sides onto a hair at y = 2.0
    const jawM = new THREE.MeshPhysicalMaterial({color: col('#C9D2D8'), metalness: 1, roughness: 0.22, envMap: env, envMapIntensity: 1.2});
    const jawGeo = new THREE.BoxGeometry(0.6, 0.12, 0.1);
    const jawL = new THREE.Mesh(jawGeo, jawM), jawR = new THREE.Mesh(jawGeo, jawM); tipW.add(jawL, jawR);
    const jawEdgeM = new THREE.MeshBasicMaterial({color: col(TL.AMBER), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false});
    const edgeL = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.13, 0.11), jawEdgeM), edgeR = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.13, 0.11), jawEdgeM); tipW.add(edgeL, edgeR);
    const pad = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20).scale(1.6, 0.5, 1.2), new THREE.MeshPhysicalMaterial({color: col('#D9A58E'), roughness: 0.6, sheen: 0.6, sheenColor: col('#FFD6C4')}));
    tipW.add(pad);
    const tipGlow = sprite(tex, TL.CORAL, 0.25, 22); tipW.add(tipGlow);

    return {hairCol, vellusCol, skinW, secW, tipW, hairs, full, stubs, ghosts, blade, edgeGlow, cutLine, follicles, secBlade, leftHair, rightFull, rightCut, fallen, jawL, jawR, edgeL, edgeR, jawEdgeM, pad, U, U2, tipGlow};
  }, [gl, scene]);

  // ---------- per frame
  const w = TL.world(t);
  const cam = camera as THREE.PerspectiveCamera; const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.02; cam.far = 400;
  cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  scene.background = col(w === 'skin' ? '#1E0F0B' : w === 'section' ? '#140A08' : '#1A0F0C');
  gl.toneMappingExposure = 1.0;
  W.skinW.visible = w === 'skin'; W.secW.visible = w === 'section'; W.tipW.visible = w === 'tips';

  if (w === 'skin') {
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
        const f = TL.smooth(Math.min(1, sinceCut * 1.4));
        o.position.set(h.x + Math.cos(h.fallDir) * 0.6 * f + 1.2 * f, TL.STUB + 0.02 + f * 0.05, h.z + Math.sin(h.fallDir) * 0.6 * f);
        o.rotation.set(Math.sin(h.yaw) * h.tilt * (1 - f), h.fallDir, (Math.cos(h.yaw) * h.tilt) * (1 - f) - f * (Math.PI / 2 - 0.05));
        if (end && f >= 1) o.scale.set(0.0001, 0.0001, 0.0001);   // the cut tops are gone in the regrowth time-lapse
      }
      o.updateMatrix(); W.full.setMatrixAt(i, o.matrix);
      // stub: after the cut; in the end world it regrows (same width, blunt tip)
      o.position.set(h.x, 0, h.z); o.rotation.set(Math.sin(h.yaw) * h.tilt, h.yaw, Math.cos(h.yaw) * h.tilt);
      o.scale.set(h.s, cut ? (end ? 1 + 9 * rg : 1) : 0.0001, h.s);
      o.updateMatrix(); W.stubs.setMatrixAt(i, o.matrix);
      o.scale.set(TL.HAIR_R * h.s * (1 + 3.5 * sw), 0.25 + 0.6 * sw, TL.HAIR_R * h.s * (1 + 3.5 * sw)); o.updateMatrix(); W.ghosts.setMatrixAt(i, o.matrix);
    });
    W.full.instanceMatrix.needsUpdate = W.stubs.instanceMatrix.needsUpdate = W.ghosts.instanceMatrix.needsUpdate = true;
    W.ghosts.visible = sw > 0.01 && !end; (W.ghosts.material as THREE.MeshBasicMaterial).opacity = 0.55 * sw;
    (W.cutLine.material as THREE.MeshBasicMaterial).opacity = 0.8 * TL.cutLineGlow(t) * (end ? 0 : 1);
  } else { (W.full.material as THREE.MeshPhysicalMaterial).color.copy(W.hairCol); }
  if (w === 'section') {
    const rgl = TL.rootGlow(t);
    W.follicles.forEach((f) => {
      f.shaft.visible = false; f.stubShaft.visible = true;
      (f.bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.9 * rgl;
      (f.glow.material as THREE.SpriteMaterial).opacity = 0.7 * rgl;
    });
    const sb = TL.sectionBlade(t);
    W.secBlade.visible = sb > 0.001 && sb < 0.999; W.secBlade.position.set(-9 + 18 * sb, TL.STUB + 0.01, 0);
  }
  if (w === 'tips') {
    const cs = TL.cutSecond(t);
    W.rightFull.visible = cs < 0.02; W.rightCut.visible = cs >= 0.02;
    // the cut-off piece falls away to the right
    W.fallen.visible = cs >= 0.02 && cs < 0.999; W.fallen.position.set(0.3 + 0.8 * cs, 2.4 - 2.0 * cs * cs, 0); W.fallen.rotation.set(0, 0, -1.2 * cs);
    const cl = TL.caliper(t), mv = TL.caliperMove(t);
    const hx = -0.3 + 0.6 * mv, gap = TL.HAIR_R + 0.3 * (1 - cl);
    const cy = 2.0;
    W.jawL.position.set(hx - gap - 0.3, cy, 0); W.jawR.position.set(hx + gap + 0.3, cy, 0);
    W.edgeL.position.set(hx - gap, cy, 0); W.edgeR.position.set(hx + gap, cy, 0);
    W.jawL.visible = W.jawR.visible = W.edgeL.visible = W.edgeR.visible = cl > 0.01;
    W.jawEdgeM.opacity = 0.9 * TL.ramp(t, TL.B.same - 0.1, TL.B.same + 0.2);
    // a soft pad brushes across both tips: the fine tip bends, the blunt end stays stiff
    const fx = TL.flex(t);
    W.pad.visible = fx > 0.01; W.pad.position.set(-1.6 + 3.2 * TL.ramp(t, TL.B.coarser - 0.2, TL.B.coarser + 1.4), 3.55 - 0.15 * fx, 0);
    W.U.uHbBend.value = 0.9 * fx; W.U.uHbY0.value = TL.HAIR_L - 0.4 - TL.TIP_L;
    W.U2.uHbBend.value = 0.03 * fx; W.U2.uHbY0.value = 1.5;
    (W.tipGlow.material as THREE.SpriteMaterial).opacity = 0.8 * fx * (cs > 0.5 ? 1 : 0); W.tipGlow.position.set(0.3, 2.4, 0.05);
  }
  return null;
};
