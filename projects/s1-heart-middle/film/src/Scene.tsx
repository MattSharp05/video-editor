// One three.js world: a dark studio (floor, backdrop with a faint heartbeat trace), a man (sourced base mesh) whose
// skin turns to glass, his ribcage and heart (sourced), the myth glow, the amber centre sheet, the heart's axis,
// apex pulses, and for the CPR shot the same body lying down with two kit hands pressing the centre of the chest.
// Built once; per frame only transforms and uniforms change, all from timeline.ts.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {random} from 'remotion';
import {KHand, type Pose} from './khand';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
export type Assets = {body: GLTF; thorax: GLTF; heart: GLTF; handR: GLTF; handL: GLTF};

// press deformation shared by body and ribs (body-local metres): the front of the chest sinks around the push spot
const PRESS_GLSL = /* glsl */ `
uniform float uPress;
vec3 pressed(vec3 p) {
  float r = (p.x * p.x) / (0.11 * 0.11) + ((p.y - ${TL.PUSH[1].toFixed(3)}) * (p.y - ${TL.PUSH[1].toFixed(3)})) / (0.15 * 0.15);
  float front = smoothstep(-0.03, 0.13, p.z);
  p.z -= uPress * ${TL.PRESS_DEPTH.toFixed(3)} * exp(-r) * front;
  return p;
}`;

// skin -> glass, with the amber centre line drawn on the skin as the sheet passes
const bodyMaterial = (env: THREE.Texture, u: Record<string, THREE.IUniform>) => {
  const m = new THREE.MeshPhysicalMaterial({color: col('#C49A80'), roughness: 0.62, sheen: 0.6, sheenColor: col('#FFC9AE'), sheenRoughness: 0.5,
    clearcoat: 0.05, envMap: env, envMapIntensity: 0.35, transparent: true, side: THREE.FrontSide});
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLocal; varying vec3 vWPos;' + PRESS_GLSL)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed = pressed(transformed); vLocal = transformed;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uGlass; uniform float uWipeY; uniform float uRimK; uniform float uSheetY; uniform float uSheetA; uniform vec3 uAmber; varying vec3 vLocal; varying vec3 vWPos;')
      .replace('#include <dithering_fragment>', `
        vec3 V = normalize(cameraPosition - vWPos);
        vec3 Nn = normalize(cross(dFdx(vWPos), dFdy(vWPos)));
        float rim = pow(1.0 - abs(dot(Nn, V)), 2.6);
        vec3 glassCol = vec3(0.78, 0.88, 0.95) * 0.16 + vec3(0.88, 0.95, 1.0) * rim * 1.25 * uRimK;
        float gA = uGlass * smoothstep(uWipeY - 0.03, uWipeY + 0.03, vLocal.y);
        float edgeW = exp(-pow((vLocal.y - uWipeY) / 0.012, 2.0)) * uGlass * (1.0 - step(1.0, uGlass + step(uWipeY, 0.0)));
        gl_FragColor.rgb = mix(gl_FragColor.rgb, glassCol, gA) + vec3(0.85, 0.95, 1.0) * edgeW * 0.6;
        gl_FragColor.a = mix(1.0, 0.05 + rim * 0.5, gA);
        // centre line on the skin: |x| small, above the sweep front
        float line = (1.0 - smoothstep(0.0015, 0.0045, abs(vLocal.x))) * step(uSheetY, vLocal.y) * uSheetA;
        gl_FragColor.rgb += uAmber * line * 1.3; gl_FragColor.a = max(gl_FragColor.a, line);
        #include <dithering_fragment>`);
  };
  m.customProgramCacheKey = () => 'body';
  return m;
};

const boneMaterial = (env: THREE.Texture, u: Record<string, THREE.IUniform>) => {
  const m = new THREE.MeshPhysicalMaterial({color: col('#CFC2AA'), roughness: 0.6, envMap: env, envMapIntensity: 0.4, transparent: true, opacity: 0.4, depthWrite: false});
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform mat4 uBodyInv; uniform mat4 uBody;' + PRESS_GLSL)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        // to body-local, press, and back (the ribs sit in their own model frame)
        vec4 bl = uBodyInv * modelMatrix * vec4(transformed, 1.0);
        vec3 bp = pressed(bl.xyz);
        transformed = (inverse(modelMatrix) * uBody * vec4(bp, 1.0)).xyz;`);
  };
  m.customProgramCacheKey = () => 'bone';
  return m;
};

// soft round glow texture and a heart-shaped one (the myth: "the heart is here")
const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const heartTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
  const path = () => { g.beginPath(); g.moveTo(128, 214); g.bezierCurveTo(40, 150, 20, 100, 52, 66); g.bezierCurveTo(82, 36, 120, 52, 128, 84); g.bezierCurveTo(136, 52, 174, 36, 204, 66); g.bezierCurveTo(236, 100, 216, 150, 128, 214); g.closePath(); };
  g.filter = 'blur(14px)'; g.fillStyle = 'rgba(255,255,255,0.8)'; path(); g.fill();
  g.filter = 'blur(3px)'; g.fillStyle = 'rgba(255,255,255,1)'; g.save(); g.translate(128, 128); g.scale(0.78, 0.78); g.translate(-128, -128); path(); g.fill(); g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const ringTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
  g.filter = 'blur(4px)'; g.strokeStyle = 'rgba(255,255,255,1)'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 100, 0, Math.PI * 2); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const sprite = (tex: THREE.Texture, c: string, size: number, order = 20) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col(c), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true}));
  s.scale.setScalar(size); s.renderOrder = order; return s;
};
const additive = (c: string, o = 1) => new THREE.MeshBasicMaterial({color: col(c), transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false});

// backdrop: dark teal studio wall with a faint heartbeat trace that beats with the heart
const backdropMaterial = () => new THREE.ShaderMaterial({
  uniforms: {uT: {value: 0}, uBeat: {value: 0}, uOn: {value: 1}},
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `uniform float uT; uniform float uBeat; uniform float uOn; varying vec2 vUv;
    float ecg(float x){ float f=fract(x); return 0.06*exp(-((f-0.18)*(f-0.18))/(0.03*0.03)) - 0.08*exp(-((f-0.34)*(f-0.34))/(0.008*0.008)) + 0.55*exp(-((f-0.37)*(f-0.37))/(0.010*0.010)) - 0.16*exp(-((f-0.40)*(f-0.40))/(0.010*0.010)) + 0.12*exp(-((f-0.6)*(f-0.6))/(0.045*0.045)); }
    void main(){
      vec2 p=vUv; vec3 top=vec3(0.010,0.018,0.024), mid=vec3(0.030,0.060,0.068);
      vec3 c=mix(mid,top,smoothstep(0.35,1.0,p.y)); c*=0.75+0.5*exp(-((p.x-0.5)*(p.x-0.5))/0.1024);
      float x=p.x*3.2 - uT*${(TL.BPM / 60).toFixed(4)}; float y=0.5+ecg(x)*0.35;
      float d=abs(p.y-y); float head=fract(uT*${(TL.BPM / 60).toFixed(4)}/3.2);
      float fade=0.35+0.65*smoothstep(0.0,0.9,fract((p.x - head)));
      c+=vec3(0.35,0.75,0.70)*(exp(-d*d/0.000012)*0.55+exp(-d*d/0.0004)*0.12)*(0.6+0.6*uBeat)*fade*uOn;
      gl_FragColor=vec4(c,1.0);
      #include <colorspace_fragment>
    }`,
});

const floorMaterial = (env: THREE.Texture) => {
  const m = new THREE.MeshPhysicalMaterial({color: col('#2B2A2C'), roughness: 0.42, metalness: 0, specularIntensity: 0.35, envMap: env, envMapIntensity: 0.25});
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW2;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW2 = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vW2;')
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\nfloat r = length(vW2.xz - vec2(0.0, -0.4)); gl_FragColor.rgb *= 0.25 + 0.75 * exp(-r * r / 4.5);');
  };
  return m;
};

export const Scene: React.FC<{t: number; assets: Assets}> = ({t, assets}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMappingExposure = 1.0;
    const pm = new THREE.PMREMGenerator(gl); const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.background = col('#040708');
    const root = new THREE.Group(); scene.add(root);

    // lights: warm key from front-left above, cool rim from behind right, dim sky-coloured fill
    const key = new THREE.DirectionalLight(col('#FFE2C4'), 2.6); key.position.set(-1.6, 3.2, 2.4); root.add(key);
    const rim = new THREE.DirectionalLight(col('#9FD8E6'), 2.2); rim.position.set(1.8, 2.0, -2.5); root.add(rim);
    const fill = new THREE.HemisphereLight(col('#A9C4CC'), col('#2A2420'), 0.55); root.add(fill);
    const heartLight = new THREE.PointLight(col('#FF8A70'), 0, 0.6, 2); root.add(heartLight);

    const U = {
      uGlass: {value: 0}, uWipeY: {value: 3}, uRimK: {value: 1}, uSheetY: {value: 3}, uSheetA: {value: 0}, uAmber: {value: col(TL.AMBER)}, uPress: {value: 0},
      uBody: {value: new THREE.Matrix4()}, uBodyInv: {value: new THREE.Matrix4()},
    };

    // studio
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMaterial(env)); floor.rotation.x = -Math.PI / 2; root.add(floor);
    const wallM = backdropMaterial();
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), wallM); wall.position.set(0, 3.0, -3.6); root.add(wall);

    // body rig (standing at the origin; lying = rotated -90 deg about X and lifted)
    const bodyRig = new THREE.Group(); root.add(bodyRig);
    // bake the model's node transforms into its geometry, so the shader's local coordinates are body metres (y up)
    const bodyMat = bodyMaterial(env, U);
    const body = new THREE.Group(); const src = assets.body.scene.clone(true); src.updateMatrixWorld(true);
    src.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { const mm = new THREE.Mesh(m.geometry.clone().applyMatrix4(m.matrixWorld), bodyMat); mm.renderOrder = 8; body.add(mm); } });
    bodyRig.add(body);

    // ribcage: model is in millimetres, back toward +Z: turn it round and fit it to the chest
    const ribs = assets.thorax.scene.clone(true);
    const boneM = boneMaterial(env, U);
    ribs.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.material = boneM; m.renderOrder = 6; } });
    const ribHolder = new THREE.Group(); ribHolder.add(ribs); bodyRig.add(ribHolder);
    const RS = 0.00088; ribs.scale.setScalar(RS); ribs.rotation.y = Math.PI;
    ribs.updateMatrixWorld(true);
    const rb = new THREE.Box3().setFromObject(ribs); const rc = rb.getCenter(new THREE.Vector3());
    ribs.position.sub(rc).add(new THREE.Vector3(0, 1.36, 0.05));
    ribs.updateMatrixWorld(true); const ribFrontZ = new THREE.Box3().setFromObject(ribs).max.z;

    // heart: outer = body-frame squeeze, inner = lean, model centred
    const heartOuter = new THREE.Group(); heartOuter.position.set(...TL.HEART_C); bodyRig.add(heartOuter);
    const heartLean = new THREE.Group(); heartOuter.add(heartLean);
    const heart = assets.heart.scene.clone(true);
    heart.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { const mm = (m.material as THREE.MeshStandardMaterial).clone(); mm.envMap = env; mm.envMapIntensity = 0.85; mm.emissive = col('#5C0A12'); m.material = mm; m.renderOrder = 4; } });
    const hb = new THREE.Box3().setFromObject(heart); const hs = hb.getSize(new THREE.Vector3()); const hc = hb.getCenter(new THREE.Vector3());
    const HS = 0.145 / hs.y; heart.scale.setScalar(HS); heart.position.copy(hc).multiplyScalar(-HS).add(new THREE.Vector3(0, 0.012, 0));
    heartLean.add(heart);
    const tex = glowTex(), htex = heartTex(), rtex = ringTex();
    // axis line through the heart (base -> apex) in the lean frame
    const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.0024, 0.0024, 0.14, 8).translate(0, 0.01, 0), new THREE.MeshBasicMaterial({color: col(TL.AMBER), transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false})); axis.renderOrder = 22; heartLean.add(axis);
    const apex = sprite(tex, TL.CORAL, 0.06, 23); apex.position.set(0, -0.06, 0.0); heartLean.add(apex);

    // myth glow on the skin (left of the chest), and the skin pulse rings at the same spot
    const myth = sprite(htex, TL.CORAL, 0.13, 24); myth.position.set(...TL.MYTH); bodyRig.add(myth);
    (myth.material as THREE.SpriteMaterial).blending = THREE.NormalBlending; (myth.material as THREE.SpriteMaterial).color = col('#FF4A3E');
    const mythHalo = sprite(tex, TL.CORAL, 0.32, 23); mythHalo.position.set(...TL.MYTH); bodyRig.add(mythHalo);
    const rings = [0, 1, 2].map(() => { const r = sprite(rtex, TL.CORAL, 0.05, 24); r.position.set(...TL.APEX_SKIN); bodyRig.add(r); return r; });

    // centre sheet: a vertical plane of light at x = 0, revealed from the top down
    const sheetM = new THREE.ShaderMaterial({transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      uniforms: {uY: {value: 3}, uA: {value: 0}, uC: {value: col(TL.AMBER)}},
      vertexShader: `varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform float uY; uniform float uA; uniform vec3 uC; varying vec3 vP;
        void main(){ float on=step(uY, vP.y); float dy=(vP.y-uY)/0.02; float edge=exp(-dy*dy);
        float side=1.0-smoothstep(0.2,0.42,abs(vP.z-0.02)); float a=(0.012*on + 0.7*edge)*side*uA;
        gl_FragColor=vec4(uC*1.3, a); }`});
    const sheetMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.3).rotateY(Math.PI / 2).translate(0, 1.15, 0.02), sheetM);
    sheetMesh.renderOrder = 21; bodyRig.add(sheetMesh);
    // breastbone glow (overlay along the sternum)
    const stern = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, TL.STERNUM.top - TL.STERNUM.bottom - 0.03, 6, 12), additive(TL.AMBER, 0));
    stern.position.set(0, (TL.STERNUM.top + TL.STERNUM.bottom) / 2, ribFrontZ - 0.012); stern.renderOrder = 22; bodyRig.add(stern);

    // CPR: push spot on the chest, the "no" glow on the left, blood beads to the brain
    const spot = sprite(tex, TL.AMBER, 0.12, 24); spot.position.set(TL.PUSH[0], TL.PUSH[1], TL.PUSH[2] + 0.01); bodyRig.add(spot);
    const wrong = sprite(tex, TL.CORAL, 0.16, 24); wrong.position.set(TL.MYTH[0] + 0.005, TL.MYTH[1], TL.MYTH[2]); bodyRig.add(wrong);
    const vessel = new THREE.CatmullRomCurve3([[0.0, 1.425, 0.06], [-0.012, 1.47, 0.045], [-0.03, 1.55, 0.035], [-0.032, 1.63, 0.03], [-0.02, 1.71, 0.03], [0.0, 1.80, 0.03]].map((p) => new THREE.Vector3(...p)));
    const vesselMesh = new THREE.Mesh(new THREE.TubeGeometry(vessel, 60, 0.004, 8, false), additive(TL.AMBER, 0)); vesselMesh.renderOrder = 22; bodyRig.add(vesselMesh);
    const beads = Array.from({length: 10}, () => { const s = sprite(tex, TL.AMBER, 0.05, 25); bodyRig.add(s); return s; });
    const headGlow = sprite(tex, TL.AMBER, 0.3, 24); headGlow.position.set(0, 1.79, 0.03); bodyRig.add(headGlow);
    // contact shadow under the lying body
    const shadowM = new THREE.MeshBasicMaterial({map: tex, color: col('#000000'), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.MultiplyBlending});
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.2), new THREE.MeshBasicMaterial({map: tex, color: 0x000000, transparent: true, opacity: 0.6, depthWrite: false}));
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, 0.002, -0.95); root.add(shadow); void shadowM;
    // dust motes in the light
    const motes = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({map: tex, color: col('#CFE3E8'), transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending}), 160);
    const moteSeeds = Array.from({length: 160}, (_, i) => ({x: (random('mx' + i) - 0.5) * 3, y: random('my' + i) * 2.6, z: -2.5 + random('mz' + i) * 3.2, s: 0.004 + random('ms' + i) * 0.008, v: 0.01 + random('mv' + i) * 0.03, p: random('mp' + i) * 6.28}));
    root.add(motes);

    return {key, rim, fill, heartLight, U, wallM, bodyRig, body, ribHolder, headGlow, wall, heartOuter, heartLean, axis, apex, myth, mythHalo, rings, sheetM, stern, spot, wrong, vesselMesh, vessel, beads, shadow, motes, moteSeeds, bodyMat, boneM};
  }, [gl, scene, assets]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.02; cam.far = 80;
  cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();

  const lie = TL.lying(t);
  W.bodyRig.rotation.set(lie ? -Math.PI / 2 : 0, 0, 0);
  W.bodyRig.position.set(0, lie ? TL.LIE_LIFT : 0, 0);
  W.bodyRig.updateMatrixWorld(true);
  W.U.uBody.value.copy(W.bodyRig.matrixWorld); W.U.uBodyInv.value.copy(W.bodyRig.matrixWorld).invert();
  W.shadow.visible = lie;

  const g = lie ? 1 : TL.glass(t);
  W.U.uGlass.value = g; W.U.uWipeY.value = TL.wipeY(t); W.U.uRimK.value = lie ? 1.9 : 1;
  W.bodyMat.depthWrite = false; W.wall.visible = !lie;
  const hin = lie ? 1 : TL.heartIn(t);
  W.ribHolder.visible = hin > 0.01; W.boneM.opacity = 0.4 * hin;
  W.heartOuter.visible = hin > 0.01;
  // centre sheet + skin line
  const sw = TL.sheet(t), sf = TL.sheetFade(t);
  const sy = 2.05 - sw * 2.1;
  W.sheetM.uniforms.uY.value = sy; W.sheetM.uniforms.uA.value = (sw > 0 ? 1 : 0) * sf * (lie ? 0 : 1);
  W.U.uSheetY.value = sy; W.U.uSheetA.value = (sw > 0 ? 1 : 0) * sf * (lie ? 0 : 1);
  (W.stern.material as THREE.MeshBasicMaterial).opacity = 0.55 * TL.sternumGlow(t) * (lie ? 0 : 1);

  // heart: beat (standing), lean, squeeze (CPR)
  const bt = lie ? 0 : TL.beat(t);
  const pr = lie ? TL.press(t) : 0;
  W.U.uPress.value = pr;
  const ln = TL.lean(t);
  W.heartLean.rotation.set(THREE.MathUtils.degToRad(-TL.LEAN_FWD * ln), 0, THREE.MathUtils.degToRad(TL.LEAN * ln));
  const s = 1 + 0.035 * bt;
  W.heartOuter.scale.set(s * (1 + 0.06 * pr), s, s * (1 - 0.3 * pr));
  W.heartOuter.position.set(TL.HEART_C[0], TL.HEART_C[1], TL.HEART_C[2] - 0.012 * pr);
  W.heartLight.intensity = 0;
  (W.axis.material as THREE.MeshBasicMaterial).opacity = 0.9 * TL.axisOn(t) * (lie ? 0 : 1);
  const ag = TL.apexGlow(t);
  (W.apex.material as THREE.SpriteMaterial).opacity = ag * (0.55 + 0.45 * bt);
  W.apex.scale.setScalar(0.05 + 0.03 * bt);

  // myth glow on the skin: pulses with the beat, gone as the glass comes
  const mo = TL.myth(t) * (lie ? 0 : 1);
  (W.myth.material as THREE.SpriteMaterial).opacity = mo * (0.75 + 0.25 * bt);
  W.myth.scale.setScalar(0.11 * (1 + 0.25 * Math.min(1, bt)));
  (W.mythHalo.material as THREE.SpriteMaterial).opacity = mo * 0.25 * (0.6 + 0.4 * bt);
  // skin pulse rings at the same spot, one per beat, after "That tip"
  const sp = Math.max(TL.skinPulse(t), 0.6 * mo);
  const per = 60 / TL.BPM;
  W.rings.forEach((r, i) => {
    const age = ((t - 0.05 * per) / per - i / 3) % 1;
    const a = age < 0 ? age + 1 : age;
    (r.material as THREE.SpriteMaterial).opacity = sp * (1 - a) * 0.9;
    r.scale.setScalar(0.03 + a * 0.12);
  });

  // CPR
  const ps = lie ? TL.pushSpot(t) : 0;
  (W.spot.material as THREE.SpriteMaterial).opacity = ps * 0.9;
  W.spot.position.z = TL.PUSH[2] + 0.01 - pr * TL.PRESS_DEPTH;
  (W.wrong.material as THREE.SpriteMaterial).opacity = lie ? TL.wrongX(t) * 0.9 + 0.3 * TL.ramp(t, TL.B.push + 0.6, TL.B.push + 1.2) : 0;
  const bo = lie ? TL.bloodOn(t) : 0;
  (W.vesselMesh.material as THREE.MeshBasicMaterial).opacity = 0.35 * bo;
  const tp = TL.pressTimes(t + 0.01);
  W.beads.forEach((b, i) => {
    const k = tp.length - 1 - Math.floor(i / 2);
    const t0 = (tp[k] ?? -99) + (i % 2) * 0.08;
    const u = (t - t0) / 0.6;
    const on = bo > 0.01 && u >= 0 && u <= 1;
    b.visible = on;
    if (on) { b.position.copy(W.vessel.getPointAt(Math.min(u, 1))); (b.material as THREE.SpriteMaterial).opacity = bo * Math.sin(Math.PI * u); b.scale.setScalar(0.055 + 0.03 * (1 - u)); }
  });

  const arrive = tp.reduce((m, p0) => Math.max(m, TL.hump(t, p0 + 0.45, 0.5)), 0);
  (W.headGlow.material as THREE.SpriteMaterial).opacity = bo * (0.25 + 0.75 * arrive);
  // backdrop and motes
  W.wallM.uniforms.uT.value = t; W.wallM.uniforms.uBeat.value = bt;
  const tmp = new THREE.Object3D();
  W.moteSeeds.forEach((m, i) => {
    tmp.position.set(m.x + 0.05 * Math.sin(t * 0.3 + m.p), ((m.y + m.v * t) % 2.6), m.z);
    tmp.quaternion.copy(cam.quaternion); tmp.scale.setScalar(m.s); tmp.updateMatrix(); W.motes.setMatrixAt(i, tmp.matrix);
  });
  W.motes.instanceMatrix.needsUpdate = true;
  W.motes.visible = !lie;

  return <Hands t={t} assets={assets} />;
};

// ---------- the rescuer's hands (lying shot only). The rescuer kneels on the body's left (+X). CPR posture (ERC/AHA):
// heel of the lower hand on the lower half of the breastbone, fingers lifted off the ribs, the other hand on top with
// its fingers curled through, arms straight and near vertical (shoulders over the hands).
const LOWER: Pose = {index: {bend: [0, 0.18, -0.05, -0.05]}, middle: {bend: [0, 0.18, -0.05, -0.05]}, ring: {bend: [0, 0.15, -0.08, -0.05]}, pinky: {bend: [0, 0.1, -0.1, -0.05]}, thumb: {bend: [-0.1, -0.1, -0.05]}};
const UPPER: Pose = {index: {bend: [0, -0.95, -0.7, -0.3]}, middle: {bend: [0, -1.0, -0.7, -0.3]}, ring: {bend: [0, -1.0, -0.75, -0.3]}, pinky: {bend: [0, -1.0, -0.75, -0.3]}, thumb: {bend: [-0.2, -0.25, -0.15]}};
const Hands: React.FC<{t: number; assets: Assets}> = ({t, assets}) => {
  const lie = TL.lying(t);
  const hin = TL.handIn(t), sl = TL.slide(t), st = TL.stack(t), pr = TL.press(t);
  const P = TL.lieP(TL.PUSH), M = TL.lieP(TL.MYTH);
  const x = M[0] + (P[0] - M[0]) * sl, z = M[2] + (P[2] - M[2]) * sl;
  const lift = (1 - hin) * 0.45 + 0.02 * Math.sin(Math.PI * sl);
  const y = P[1] - pr * TL.PRESS_DEPTH + lift;
  // wrist just above and beyond the heel; the palm runs across the chest toward -X
  const wrist = [x + 0.05, y + 0.035, z];
  const wristTop = [x + 0.05, y + 0.062 + (1 - st) * 0.4, z + 0.005];
  return (
    <>
      <KHand g={assets.handR} visible={lie && hin > 0.001} s={{model: 'right', wrist, f: [-1, 0.1, 0], b: [0, 1, 0], pose: LOWER, arm: [0.18, 1, -0.16], armLen: 0.9}} />
      <KHand g={assets.handL} visible={lie && st > 0.001} s={{model: 'left', wrist: wristTop, f: [-1, -0.05, 0.05], b: [0, 1, 0], pose: UPPER, arm: [0.18, 1, 0.16], armLen: 0.9}} />
    </>
  );
};
