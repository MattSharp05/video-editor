// Two worlds, one canvas, switched on the hard cuts (timeline.ts CUT_IN / CUT_OUT):
//  desk (metres): a wooden desk in a warm room, the kit's rigged hands (khand.tsx) making fists, pops at the knuckles;
//  joint (millimetres, real size): one knuckle built in code: the hand bone's round head, the finger bone's cup, the
//  cartilage on both, the glass capsule around them, the fluid in the gap, dissolved gas, the bubble.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {random} from 'remotion';
import {useKHand, mixPose, OPEN, FIST, KNUCKLES} from './khand';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
export type Assets = {handR: GLTF; handL: GLTF};

const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const ringTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
  g.filter = 'blur(3px)'; g.strokeStyle = 'rgba(255,255,255,1)'; g.lineWidth = 9; g.beginPath(); g.arc(128, 128, 104, 0, Math.PI * 2); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const sprite = (tex: THREE.Texture, c: string, size: number, order = 20, depthTest = false) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col(c), blending: THREE.AdditiveBlending, depthWrite: false, depthTest, transparent: true}));
  s.scale.setScalar(size); s.renderOrder = order; return s;
};

// ---------- desk world
const woodMaterial = () => {
  const m = new THREE.MeshPhysicalMaterial({color: col('#7A5236'), roughness: 0.48, clearcoat: 0.35, clearcoatRoughness: 0.3, specularIntensity: 0.5});
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW3;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW3 = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vW3;
      float h1(float n){ return fract(sin(n)*43758.5453); }
      float n1(float x){ float i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f); return mix(h1(i),h1(i+1.0),f); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float g = vW3.x * 1.0 + n1(vW3.z * 9.0) * 0.6 + n1(vW3.z * 40.0 + vW3.x * 3.0) * 0.12;
        float ring = 0.5 + 0.5 * sin(g * 140.0 + n1(vW3.x * 20.0) * 4.0);
        float plank = step(0.5, fract(vW3.x * 5.0 + 0.27));
        diffuseColor.rgb *= 0.78 + 0.22 * ring * ring + 0.06 * plank;
        float r = length(vW3.xz); diffuseColor.rgb *= 0.55 + 0.45 * exp(-r * r / 0.35);`);
  };
  return m;
};
const roomMaterial = () => new THREE.ShaderMaterial({
  uniforms: {uT: {value: 0}},
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `uniform float uT; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      vec2 p = vUv; vec3 c = mix(vec3(0.050,0.032,0.024), vec3(0.16,0.095,0.055), smoothstep(0.0,0.75,p.y)) ;
      // a warm window glow upper left and soft out-of-focus lamps (bokeh)
      c += vec3(0.55,0.33,0.16) * exp(-((p.x-0.25)*(p.x-0.25)/0.02 + (p.y-0.7)*(p.y-0.7)/0.05)) * 0.35;
      for (int i = 0; i < 9; i++) { vec2 q = vec2(h(vec2(float(i),1.3)), 0.35 + 0.5*h(vec2(float(i),7.1)));
        float d = length((p - q) * vec2(1.0, 1.6)); float rr = 0.025 + 0.03*h(vec2(float(i),3.7));
        c += vec3(1.0,0.72,0.42) * smoothstep(rr, rr*0.8, d) * 0.10 * (0.6 + 0.4*sin(uT*0.7 + float(i))); }
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }`,
});

// ---------- joint world (mm). Lathe profiles turned about +Y, then laid along +X.
const R_HEAD = 7.4;           // radius of the hand bone's round head
const along = (g: THREE.BufferGeometry) => g.rotateZ(-Math.PI / 2); // lathe axis Y -> +X
const V = (x: number, y: number) => new THREE.Vector2(x, y);
// hand bone (metacarpal): shaft from y=-70 to the head, whose tip is at y=0 (lathe coords: (radius, height))
const metacarpalGeo = () => {
  const p: THREE.Vector2[] = [V(0.001, -70), V(4.6, -70), V(4.3, -40), V(4.6, -22), V(6.2, -13)];
  for (let i = 0; i <= 24; i++) { const a = (Math.PI / 2) * (1 - i / 24); p.push(V(R_HEAD * Math.sin(a) + 0.001, -R_HEAD + R_HEAD * Math.cos(a))); }
  return along(new THREE.LatheGeometry(p, 72));
};
// finger bone (proximal phalanx) base: a cup concentric with the head, shifted by the gap (built at gap 0)
const phalanxGeo = () => {
  const p: THREE.Vector2[] = [];
  const RC = R_HEAD + 0.15;
  for (let i = 0; i <= 18; i++) { const r = 6.4 * (i / 18); p.push(V(r + 0.001, -R_HEAD + Math.sqrt(RC * RC - r * r) - 0.15)); }
  p.push(V(7.6, -2.6), V(7.4, 2), V(5.2, 12), V(4.3, 30), V(4.6, 45), V(0.001, 45));
  return along(new THREE.LatheGeometry(p, 72));
};
// cartilage caps (thin, glossy) on the head and in the cup
const capGeo = (r: number, a0: number) => {
  const p: THREE.Vector2[] = [];
  for (let i = 0; i <= 16; i++) { const a = a0 * (1 - i / 16); p.push(V(r * Math.sin(a) + 0.001, -R_HEAD + r * Math.cos(a))); }
  return along(new THREE.LatheGeometry(p, 72));
};
// fluid lens between head and cup at a given gap
const fluidGeo = (gap: number) => {
  const p: THREE.Vector2[] = [];
  const RO = R_HEAD + 0.12;
  for (let i = 0; i <= 14; i++) { const r = 6.2 * (i / 14); p.push(V(r + 0.001, -R_HEAD + Math.sqrt(RO * RO - r * r) - 0.12 + 0.06)); }
  for (let i = 14; i >= 0; i--) { const r = 6.2 * (i / 14); p.push(V(r + 0.001, gap - R_HEAD + Math.sqrt(RO * RO - r * r) - 0.12 - 0.06)); }
  return along(new THREE.LatheGeometry(p, 64));
};
// capsule: a sleeve over the joint; `suck` pulls its middle in (low pressure)
const capsuleGeo = (gap: number, suck: number) => {
  const p: THREE.Vector2[] = [];
  for (let i = 0; i <= 30; i++) {
    const y = -14 + (28 + gap) * (i / 30); const m = Math.exp(-((y - gap / 2) ** 2) / 30);
    p.push(V(9.2 + 1.6 * m - suck * 1.4 * m, y));
  }
  return along(new THREE.LatheGeometry(p, 72));
};
const rimGlass = (tint: string, base: number, rimK: number) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide,
  uniforms: {uTint: {value: col(tint)}, uBase: {value: base}, uRim: {value: rimK}, uOpacity: {value: 1}},
  vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `uniform vec3 uTint; uniform float uBase; uniform float uRim; uniform float uOpacity; varying vec3 vN; varying vec3 vW;
    void main(){ vec3 V=normalize(cameraPosition-vW); float d=1.0-abs(dot(normalize(vN),V)); float r=d*d*d;
    gl_FragColor=vec4(uTint*(0.5+1.4*r), (uBase+uRim*r)*uOpacity); }`,
});
const tissueMaterial = () => new THREE.ShaderMaterial({
  side: THREE.BackSide, uniforms: {uT: {value: 0}},
  vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `uniform float uT; varying vec3 vP;
    float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
    float n3(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
      return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
    void main(){
      float fib = n3(vec3(vP.x*3.0, vP.y*18.0, vP.z*3.0)) * 0.6 + n3(vP*7.0) * 0.4;
      vec3 c = mix(vec3(0.05,0.012,0.012), vec3(0.20,0.05,0.045), fib) * (0.7 + 0.5*smoothstep(-0.6,0.8,vP.y));
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }`,
});

export const Scene: React.FC<{t: number; assets: Assets}> = ({t, assets}) => {
  const {gl, camera, scene} = useThree();
  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace; gl.localClippingEnabled = true;
    const CLIP = [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)];
    const env = new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.background = col('#060404');
    const tex = glowTex(), rtex = ringTex();

    // desk world
    const desk = new THREE.Group(); scene.add(desk);
    const key = new THREE.DirectionalLight(col('#FFD9B0'), 3.0); key.position.set(-0.6, 1.0, 0.5); desk.add(key);
    const rim = new THREE.DirectionalLight(col('#9FC6E6'), 1.4); rim.position.set(0.7, 0.6, -0.8); desk.add(rim);
    desk.add(new THREE.HemisphereLight(col('#E8D2BC'), col('#3A2618'), 0.7));
    const top = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), woodMaterial()); top.rotation.x = -Math.PI / 2; desk.add(top);
    const roomM = roomMaterial();
    const room = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.4), roomM); room.position.set(0, 1.0, -1.6); desk.add(room);
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.26), new THREE.MeshBasicMaterial({map: tex, color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false}));
    contact.rotation.x = -Math.PI / 2; contact.position.y = 0.001; desk.add(contact);
    const contact2 = contact.clone(); desk.add(contact2);

    // joint world (mm)
    const joint = new THREE.Group(); scene.add(joint);
    const jl = new THREE.DirectionalLight(col('#FFE6D0'), 2.4); jl.position.set(-30, 60, 50); joint.add(jl);
    const jr = new THREE.DirectionalLight(col('#7FB8FF'), 1.6); jr.position.set(40, -10, -60); joint.add(jr);
    joint.add(new THREE.HemisphereLight(col('#F0C8B8'), col('#301010'), 0.6));
    const tissue = new THREE.Mesh(new THREE.SphereGeometry(400, 48, 32), tissueMaterial()); joint.add(tissue);
    const boneMat = new THREE.MeshPhysicalMaterial({color: col('#E2D2B4'), roughness: 0.6, envMap: env, envMapIntensity: 0.4, clippingPlanes: CLIP, side: THREE.DoubleSide});
    boneMat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vO;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvO = position;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vO;
        float hb(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
        float nb(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(mix(hb(i),hb(i+vec3(1,0,0)),f.x),mix(hb(i+vec3(0,1,0)),hb(i+vec3(1,1,0)),f.x),f.y),
                     mix(mix(hb(i+vec3(0,0,1)),hb(i+vec3(1,0,1)),f.x),mix(hb(i+vec3(0,1,1)),hb(i+vec3(1,1,1)),f.x),f.y),f.z); }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          float nn = nb(vO * 0.9) * 0.6 + nb(vO * 3.1) * 0.3 + nb(vO * 9.0) * 0.1;
          diffuseColor.rgb *= 0.9 + 0.14 * nn;
          // the cut face (seen from inside): spongy bone, darker and warmer
          if (!gl_FrontFacing) diffuseColor.rgb = vec3(0.62, 0.47, 0.36) * (0.85 + 0.25 * nb(vO * 2.5));`);
    };
    const cartMat = new THREE.MeshPhysicalMaterial({color: col('#D6E6EE'), roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08, envMap: env, envMapIntensity: 0.9, emissive: col('#000000'), clippingPlanes: CLIP, side: THREE.DoubleSide});
    const meta = new THREE.Mesh(metacarpalGeo(), boneMat); joint.add(meta);
    const metaCap = new THREE.Mesh(capGeo(R_HEAD + 0.08, 1.05), cartMat); joint.add(metaCap);
    const phal = new THREE.Group(); joint.add(phal);
    phal.add(new THREE.Mesh(phalanxGeo(), boneMat));
    const cupCap = new THREE.Mesh(capGeo(R_HEAD + 0.1, 0.75), cartMat); cupCap.material = cartMat; phal.add(cupCap);
    const fluidM = new THREE.MeshPhysicalMaterial({color: col(TL.FLUID), roughness: 0.05, transmission: 0, transparent: true, opacity: 0.85, emissive: col('#B07A18'), envMap: env, envMapIntensity: 1.0, depthWrite: false, clippingPlanes: CLIP, side: THREE.DoubleSide});
    const fluid = new THREE.Mesh(fluidGeo(TL.GAP0), fluidM); fluid.renderOrder = 5; joint.add(fluid);
    const capsM = rimGlass('#E8F4FF', 0.05, 0.75);
    const caps = new THREE.Mesh(capsuleGeo(TL.GAP0, 0), capsM); caps.renderOrder = 8; joint.add(caps);
    // dissolved gas: tiny specks in the fluid lens
    const specks = Array.from({length: 46}, (_, i) => {
      const r = Math.sqrt(random('sr' + i)) * 5.6, a = random('sa' + i) * Math.PI * 2;
      const s = sprite(tex, TL.GAS, 0.35, 12); joint.add(s); return {s, r, a, f: random('sf' + i)};
    });
    const bubbleM = new THREE.MeshPhysicalMaterial({color: col('#FFFFFF'), roughness: 0.02, metalness: 0, transmission: 0, transparent: true, opacity: 0.55, clearcoat: 1, envMap: env, envMapIntensity: 2.2, emissive: col('#4FAFC8'), emissiveIntensity: 0.6, depthWrite: false});
    const bubbleMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), bubbleM); bubbleMesh.renderOrder = 10; joint.add(bubbleMesh);
    const bubbleGlow = sprite(tex, TL.GAS, 3, 11); joint.add(bubbleGlow);
    const popRing = sprite(rtex, TL.GAS, 2, 13); joint.add(popRing);

    // hands' knuckle rings (desk): 4 per hand, reused
    const rings = Array.from({length: 8}, () => { const r = sprite(rtex, TL.CORAL, 0.02, 30); desk.add(r); return r; });
    const glows = Array.from({length: 8}, () => { const r = sprite(tex, TL.AMBER, 0.03, 29); desk.add(r); return r; });
    return {desk, joint, roomM, contact, contact2, meta, phal, fluid, fluidM, caps, capsM, specks, bubbleMesh, bubbleM, bubbleGlow, popRing, cartMat, rings, glows, tissue};
  }, [gl, scene]);

  const R = useKHand(assets.handR), L = useKHand(assets.handL);

  // ---------- per frame
  const sh = TL.shot(t);
  const cam = camera as THREE.PerspectiveCamera; const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm);
  if (sh === 1) { cam.near = 0.5; cam.far = 2000; } else { cam.near = 0.01; cam.far = 20; }
  cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  W.desk.visible = sh !== 1; W.joint.visible = sh === 1;
  R.root.visible = sh !== 1; L.root.visible = sh === 2;
  gl.toneMappingExposure = sh === 1 ? 1.05 : 0.95;
  W.roomM.uniforms.uT.value = t;
  W.rings.forEach((r) => (r.visible = false)); W.glows.forEach((g) => (g.visible = false));

  if (sh === 0) {
    // one right fist, knuckles toward the camera; the four knuckles pop in turn
    const k = TL.curl0(t);
    R.pose({model: 'right', wrist: [0.0, 0.075, -0.13], f: [0, -0.15, 1], b: [0, 1, 0.15], pose: mixPose(OPEN, FIST, k), arm: [0, 0.05, -1], armLen: 0.7});
    W.contact.position.set(0, 0.001, -0.06); W.contact2.visible = false;
    TL.POPS0.forEach((p, i) => {
      const a = TL.ringAge(t, p); const r = W.rings[i];
      r.visible = a >= 0; if (a < 0) return;
      r.position.copy(R.bone(KNUCKLES[i])).add(new THREE.Vector3(0, 0.006, 0.004));
      r.scale.setScalar(0.012 + 0.05 * a); (r.material as THREE.SpriteMaterial).color = col(TL.CORAL); (r.material as THREE.SpriteMaterial).opacity = (1 - a) * 0.95;
    });
  }
  if (sh === 2) {
    // two hands flat on the desk, backs up, fingers away from the camera; the LEFT hand cracks over and over
    const lc = TL.leftCrack(t); const ro = TL.relaxOpen(t);
    L.pose({model: 'left', wrist: [-0.07, 0.04, 0.06], f: [0.1, -0.1, -1], b: [0, 1, 0], pose: mixPose(OPEN, FIST, lc.curl * 0.85), arm: [-0.3, 0.12, 1], armLen: 0.6});
    R.pose({model: 'right', wrist: [0.07, 0.04, 0.06], f: [-0.1, -0.1, -1], b: [0, 1, 0], pose: OPEN, arm: [0.3, 0.12, 1], armLen: 0.6});
    W.contact.position.set(-0.08, 0.001, 0.0); W.contact2.position.set(0.08, 0.001, 0.0); W.contact2.visible = true; void ro;
    const hl = TL.healthy(t);
    KNUCKLES.forEach((n, i) => {
      // pop rings (gas: pale cyan) on the left hand
      const a = lc.pop > 0 ? TL.ringAge(t, lc.pop + i * 0.06) : -1; const r = W.rings[i];
      if (a >= 0) { r.visible = true; r.position.copy(L.bone(n)).add(new THREE.Vector3(0, 0.008, 0)); r.scale.setScalar(0.01 + 0.035 * a); (r.material as THREE.SpriteMaterial).color = col(TL.GAS); (r.material as THREE.SpriteMaterial).opacity = (1 - a) * 0.8; }
      // healthy: soft amber on every knuckle of both hands
      [L, R].forEach((h, j) => { const g = W.glows[i + 4 * j]; g.visible = hl > 0.01; g.position.copy(h.bone(n)).add(new THREE.Vector3(0, 0.008, 0)); (g.material as THREE.SpriteMaterial).opacity = hl * 0.7; g.scale.setScalar(0.035); });
    });
  }
  if (sh === 1) {
    const gp = TL.gap(t), pr = TL.pressure(t);
    W.phal.position.x = gp; W.fluid.geometry.dispose(); W.fluid.geometry = fluidGeo(gp);
    W.caps.geometry.dispose(); W.caps.geometry = capsuleGeo(gp, 1 - pr);
    W.capsM.uniforms.uOpacity.value = TL.capsuleOn(t) * 0.9 + 0.1;
    // fluid: warm gold at normal pressure, cooler and darker when the pressure drops
    W.fluidM.color.copy(col(TL.FLUID)).lerp(col('#3D7FA8'), 1 - pr); W.fluidM.emissive.copy(col('#B07A18')).lerp(col('#1A4A70'), 1 - pr);
    // cartilage glows amber while "nothing breaks, nothing grinds"
    W.cartMat.emissive.copy(col(TL.AMBER)).multiplyScalar(0.35 * TL.intact(t));
    const gth = TL.gather(t), br = TL.bubble(t), fl = TL.flash(t);
    const bc = new THREE.Vector3(gp / 2, 1.4, 0.6);
    W.specks.forEach((sp, i) => {
      const home = new THREE.Vector3(gp * (0.25 + 0.5 * sp.f), Math.cos(sp.a) * sp.r, Math.sin(sp.a) * sp.r);
      home.y += 0.25 * Math.sin(t * 1.3 + i); const k = TL.smooth(gth * (0.7 + 0.3 * sp.f));
      sp.s.position.copy(home.lerp(bc, k)); sp.s.visible = br < 0.2 && t > TL.CUT_IN + 0.3;
      (sp.s.material as THREE.SpriteMaterial).opacity = 0.35 + 0.5 * k;
    });
    W.bubbleMesh.visible = br > 0.01; W.bubbleMesh.position.copy(bc); W.bubbleMesh.scale.setScalar(Math.max(br, 0.01));
    W.bubbleGlow.position.copy(bc); (W.bubbleGlow.material as THREE.SpriteMaterial).opacity = Math.min(1, br * 1.2) * 0.8 + fl; W.bubbleGlow.scale.setScalar(3.2 + 4 * fl);
    W.popRing.position.copy(bc); W.popRing.visible = fl > 0.01; W.popRing.scale.setScalar(1.5 + 9 * (1 - fl) * (t > TL.POP_T() ? 1 : 0)); (W.popRing.material as THREE.SpriteMaterial).opacity = fl;
  }
  return <><primitive object={R.root} /><primitive object={L.root} /></>;
};
