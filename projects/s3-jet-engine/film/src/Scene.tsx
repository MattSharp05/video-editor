// One three.js world: blue hour on a runway, the underside of a wing with its pylon, and a cutaway turbofan ("Jet
// Engine" by Pilot, CC BY 4.0) whose rotors spin from one joint. A mirrored copy of its half nacelle is the near cowl
// that swings open. Air is a field of beads following the two real paths (bypass duct / core), timed from timeline.ts.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {random} from 'remotion';
import {skyLight} from './kit/realism/sky.ts';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
const S = 2.5 / 750; // model units -> metres (nacelle 2.5 m across)
const MODEL_FAN = new THREE.Vector3(-688, 399, 0); // fan face on the axis, in model units

const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const sprite = (tex: THREE.Texture, c: string, size: number) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col(c), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, toneMapped: false}));
  s.scale.setScalar(size); s.renderOrder = 20; return s;
};

// runway: asphalt, markings, grass beyond the edges, scrolling with the takeoff roll
const groundMaterial = () => new THREE.ShaderMaterial({
  uniforms: {uShift: {value: 0}, uSky: {value: col('#2A3A62')}, uHorizon: {value: col('#D99A72')}},
  vertexShader: `varying vec3 vW; varying vec3 vL; void main(){ vL = position; vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `uniform float uShift; uniform vec3 uSky; uniform vec3 uHorizon; varying vec3 vW; varying vec3 vL;
    float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
    float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
    void main(){
      vec2 p = vec2(vL.x + uShift, vL.y); // plane-local: x along the runway, y across (z in the world)
      float d = length(vW - cameraPosition);
      float across = -p.y; // world z
      float onRunway = step(-28.5, across) * step(across, 16.5);
      vec3 asphalt = vec3(0.045, 0.047, 0.052) * (0.8 + 0.4 * vn(p * 0.7)) * (0.9 + 0.2 * vn(p * 9.0));
      vec3 grass = vec3(0.025, 0.035, 0.028) * (0.7 + 0.6 * vn(p * 0.2));
      vec3 c = mix(grass, asphalt, onRunway);
      // centre line dashes (30 m dash, 20 m gap) and edge stripes
      float cl = (1.0 - smoothstep(0.35, 0.45, abs(across + 6.0))) * step(0.4, fract(p.x / 50.0));
      float edge = (1.0 - smoothstep(0.4, 0.5, abs(across - 15.5))) + (1.0 - smoothstep(0.4, 0.5, abs(across + 27.5)));
      c = mix(c, vec3(0.42, 0.42, 0.40), (cl + edge) * onRunway * 0.85);
      // sky sheen on the damp asphalt at grazing angles
      vec3 V = normalize(cameraPosition - vW);
      float fr = pow(1.0 - clamp(V.y, 0.0, 1.0), 5.0);
      c += mix(uSky, uHorizon, fr) * fr * 0.35 * onRunway;
      c = mix(c, uHorizon * 0.55, 1.0 - exp(-d / 2600.0));
      gl_FragColor = vec4(c, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});

// a beam/streak shader for the streams behind the engine
const streamMaterial = (c: string) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: {uC: {value: col(c)}, uO: {value: 0}, uT: {value: 0}, uSpeed: {value: 1}},
  vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `uniform vec3 uC; uniform float uO; uniform float uT; uniform float uSpeed; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
    void main(){ vec3 V = normalize(cameraPosition - vW); float rim = pow(1.0 - abs(dot(normalize(vN), V)), 1.6);
      float along = vUv.y; float streak = 0.6 + 0.4 * sin((along * 30.0 - uT * uSpeed) * 1.0 + vUv.x * 40.0);
      float fade = smoothstep(0.0, 0.08, along) * (1.0 - smoothstep(0.55, 1.0, along));
      float a = (0.12 + rim * 0.6) * streak * fade * uO;
      gl_FragColor = vec4(uC * a * 1.6, a); }`,
});

const arrowGeometry = (len: number, w: number) => {
  const s = new THREE.Shape(); const hw = w / 2, head = Math.min(len * 0.45, w * 1.1);
  s.moveTo(0, 0); s.lineTo(head, hw * 1.7); s.lineTo(head, hw * 0.55); s.lineTo(len, hw * 0.55); s.lineTo(len, -hw * 0.55); s.lineTo(head, -hw * 0.55); s.lineTo(head, -hw * 1.7); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: w * 0.25, bevelEnabled: true, bevelThickness: w * 0.05, bevelSize: w * 0.05, bevelSegments: 2}); g.translate(0, 0, -w * 0.125); return g;
};

export const Scene: React.FC<{t: number; engine: GLTF}> = ({t, engine}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    const opts = {elevation: 1.5, azimuth: 300, turbidity: 4, rayleigh: 2.2, visibility: 20000, hazeHeight: 800, ground: '#3a3e44'};
    const L = skyLight(gl, opts);
    const sky = L.sky; sky.scale.setScalar(20000); scene.add(sky);
    const env = L.envMap;
    const root = new THREE.Group(); scene.add(root);
    const sun = new THREE.DirectionalLight(L.sunColor, L.sunIntensity * 0.05); sun.position.copy(L.sunDir).multiplyScalar(100); root.add(sun);
    const skyCol = L.skyIrradiance.clone(); skyCol.multiplyScalar(1 / Math.max(skyCol.r, skyCol.g, skyCol.b));
    const hemi = new THREE.HemisphereLight(skyCol, col('#3A3A40'), 1.1); root.add(hemi);
    const tex = glowTex();

    // ground (rotates and drops for the liftoff)
    const groundG = new THREE.Group(); root.add(groundG);
    const gm = groundMaterial(); gm.uniforms.uHorizon.value.copy(L.horizon);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), gm); ground.rotation.x = -Math.PI / 2; groundG.add(ground);
    // runway lights: edges every 60 m, centre line every 15 m; streaked by speed (scrolled per frame)
    const lightGeo = new THREE.SphereGeometry(0.16, 8, 6);
    const lights = new THREE.InstancedMesh(lightGeo, new THREE.MeshBasicMaterial({color: col('#FFF0D8').multiplyScalar(3), toneMapped: false}), 260);
    groundG.add(lights);
    const lightSpots: [number, number, number][] = []; // [phase x, z, spacing]
    for (let i = 0; i < 70; i++) { lightSpots.push([i * 60, 16.5, 60 * 70]); lightSpots.push([i * 60 + 30, -28.5, 60 * 70]); }
    for (let i = 0; i < 120; i++) lightSpots.push([i * 15, -6, 15 * 120]);
    lights.count = lightSpots.length;
    const halos = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({map: tex, color: col('#FFE2B8'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}), lightSpots.length);
    groundG.add(halos);

    // the plane: wing underside, pylon, engine (all in one group that pitches for the liftoff about the main gear)
    const plane = new THREE.Group(); root.add(plane);
    const paint = new THREE.MeshPhysicalMaterial({color: col('#E6E9EE'), roughness: 0.38, clearcoat: 0.5, envMap: env, envMapIntensity: 0.9});
    const af = new THREE.Shape(); // airfoil (chord 5.2 m along +x), thickness 0.5 m
    const N = 24; for (let i = 0; i <= N; i++) { const u = i / N, x = u * u; af.lineTo(x * 5.2, 0.6 * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4)); }
    for (let i = N; i >= 0; i--) { const u = i / N, x = u * u; af.lineTo(x * 5.2, -0.35 * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4)); }
    const wingGeo = new THREE.ExtrudeGeometry(af, {depth: 46, bevelEnabled: false, curveSegments: 4}); wingGeo.translate(0, 0, -30);
    const wing = new THREE.Mesh(wingGeo, paint); wing.position.set(1.0, 4.15, 0); wing.rotation.x = 0.05; plane.add(wing);
    const py = new THREE.Shape(); py.moveTo(0.3, 0); py.lineTo(3.9, 0); py.lineTo(4.6, 0.95); py.lineTo(1.4, 0.95); py.closePath(); // side profile, swept
    const pyGeo = new THREE.ExtrudeGeometry(py, {depth: 0.34, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3}); pyGeo.translate(0, 0, -0.17);
    const pylon = new THREE.Mesh(pyGeo, paint); pylon.position.set(0, TL.AXIS_Y + 1.12, 0); plane.add(pylon);

    // engine
    const eng = new THREE.Group(); eng.scale.setScalar(S * 100); eng.position.copy(MODEL_FAN.clone().multiplyScalar(-S)).add(new THREE.Vector3(0, TL.AXIS_Y, 0)); plane.add(eng);
    const e = engine.scene; eng.add(e);
    const metal = new THREE.MeshStandardMaterial({color: col('#A9B0B8'), metalness: 0.9, roughness: 0.32, envMap: env, envMapIntensity: 1.1});
    const darkMetal = new THREE.MeshStandardMaterial({color: col('#55504B'), metalness: 0.85, roughness: 0.42, envMap: env, envMapIntensity: 0.8, emissive: col(TL.CORAL), emissiveIntensity: 0});
    const U = {uBurn: {value: 0}, uTurb: {value: 0}, uFire: {value: 0}};
    darkMetal.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vMp;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMp = position;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vMp; uniform float uBurn; uniform float uTurb; uniform float uFire;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          float xm = (vMp.x + 688.0) * ${S.toFixed(6)};
          float burn = smoothstep(${TL.X_BURN[0] - 0.15}, ${TL.X_BURN[0] + 0.1}, xm) * (1.0 - smoothstep(${TL.X_BURN[1]}, ${TL.X_BURN[1] + 0.2}, xm));
          float turb = smoothstep(${TL.X_TURB[0]}, ${TL.X_TURB[0] + 0.2}, xm) * (1.0 - smoothstep(${TL.X_TURB[1]}, ${TL.X_TURB[1] + 0.3}, xm));
          float noz = smoothstep(${TL.X_TURB[1]}, ${TL.X_NOZZLE}, xm);
          vec3 hot = mix(vec3(1.0, 0.25, 0.10), vec3(1.0, 0.65, 0.3), burn);
          totalEmissiveRadiance = hot * (burn * uBurn * 3.0 + turb * uTurb * 1.6 + noz * uFire * 0.9);`);
    };
    darkMetal.customProgramCacheKey = () => 'hot';
    const shellMat = new THREE.MeshPhysicalMaterial({color: col('#E3E6EA'), roughness: 0.4, clearcoat: 0.4, envMap: env, envMapIntensity: 0.9, side: THREE.DoubleSide});
    shellMat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vMp; varying vec3 vMn;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMp = position; vMn = objectNormal;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vMp; varying vec3 vMn;')
        .replace('#include <color_fragment>', `#include <color_fragment>
          vec2 rad = normalize(vMp.yz - vec2(399.0, 0.0));
          float outward = dot(normalize(vMn.yz + 1e-4), rad) * (gl_FrontFacing ? 1.0 : -1.0);
          diffuseColor.rgb = mix(vec3(0.30, 0.32, 0.35), diffuseColor.rgb, step(0.0, outward));`);
    };
    let shellMesh: THREE.SkinnedMesh | null = null;
    e.traverse((o) => {
      const m = o as THREE.Mesh; if (!m.isMesh) return;
      m.frustumCulled = false;
      if (m.name === 'Object_16') { m.material = shellMat; shellMesh = m as THREE.SkinnedMesh; }
      else if (m.name === 'Object_19') m.material = darkMetal;
      else m.material = metal;
    });
    let rotor: THREE.Object3D | null = null;
    e.traverse((o) => { if (o.name.startsWith('core_rot_joint')) rotor = o; });
    // the near cowl: a mirrored copy of the half nacelle, hinged at the top of the nacelle
    const cowlHinge = new THREE.Group(); const cowlMirror = new THREE.Group();
    if (shellMesh) {
      const sm = shellMesh as THREE.SkinnedMesh;
      const g = sm.geometry.clone(); g.deleteAttribute('skinIndex'); g.deleteAttribute('skinWeight');
      const copy = new THREE.Mesh(g, shellMat); copy.frustumCulled = false;
      sm.parent!.add(cowlHinge); cowlHinge.position.set(0, 399 + 380, 0);
      cowlHinge.add(cowlMirror); cowlMirror.position.set(0, -(399 + 380), 0); cowlMirror.scale.set(1, 1, -1);
      cowlMirror.add(copy);
    }

    // beads of air
    const NB = 520;
    const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.02, 8, 6), new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false}), NB);
    beads.renderOrder = 15; beads.frustumCulled = false; plane.add(beads);
    const beadSeeds = Array.from({length: NB}, (_, i) => {
      const core = i % 10 === 0;
      const r0 = core ? TL.CORE_R * Math.sqrt(0.08 + 0.92 * random('r' + i)) : Math.sqrt(TL.CORE_R ** 2 + (TL.FAN_R ** 2 - TL.CORE_R ** 2) * random('r' + i));
      const side = random('s' + i) < 0.5 ? -1 : 1;
      const phi = core ? (random('p' + i) - 0.5) * Math.PI * 0.9 : side * (0.75 + random('p' + i) * 0.75); // bypass: above and below the core in view
      return {core, r0, phi, born: random('b' + i) * TL.BEAD_LIFE, size: 0.7 + 0.6 * random('z' + i)};
    });
    beads.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NB * 3), 3);
    // the ten counting beads
    const ten = TL.TEN_R.map((_, k) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshBasicMaterial({color: col(TL.CYAN), toneMapped: false, depthTest: false, transparent: true}));
      m.renderOrder = 18; plane.add(m);
      const h = sprite(tex, k === 4 ? '#FFFFFF' : TL.CYAN, 0.42); plane.add(h);
      return {m, h};
    });
    // hot glows: combustor ring, turbines, the exhaust (the belief in the hook)
    const burnGlows = Array.from({length: 7}, () => { const s = sprite(tex, TL.CORAL, 0.55); plane.add(s); return s; });
    const turbGlows = Array.from({length: 5}, () => { const s = sprite(tex, '#FF7A3C', 0.5); plane.add(s); return s; });
    const exhaust = Array.from({length: 9}, (_, i) => { const s = sprite(tex, i < 3 ? '#FFB070' : TL.CORAL, 0.9 + i * 0.25); plane.add(s); return s; });
    // shaft pulse (amber) and the fan hub glow
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1, 10), new THREE.MeshBasicMaterial({color: col(TL.AMBER), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false}));
    shaft.rotation.z = Math.PI / 2; shaft.renderOrder = 16; plane.add(shaft);
    const pulse = sprite(tex, TL.AMBER, 0.6); plane.add(pulse);
    const hubGlow = sprite(tex, TL.AMBER, 1.6); plane.add(hubGlow);
    // streams behind and thrust arrows
    const bypassStream = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.05, 10, 48, 1, true, -Math.PI / 2, Math.PI), streamMaterial(TL.CYAN));
    bypassStream.rotation.z = Math.PI / 2; bypassStream.rotation.y = 0; bypassStream.position.set(TL.X_DUCT_END + 5, TL.AXIS_Y, 0); bypassStream.renderOrder = 12; plane.add(bypassStream);
    const coreStream = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 8, 24, 1, true), streamMaterial(TL.CORAL));
    coreStream.rotation.z = Math.PI / 2; coreStream.position.set(TL.X_NOZZLE + 4, TL.AXIS_Y, 0); coreStream.renderOrder = 13; plane.add(coreStream);
    const arrowMat = (c: string) => new THREE.MeshBasicMaterial({color: col(c), transparent: true, opacity: 0, toneMapped: false, depthTest: false});
    const bigArrow = new THREE.Mesh(arrowGeometry(3.2, 0.7), arrowMat(TL.CYAN)); bigArrow.position.set(-2.9, TL.AXIS_Y + 1.55, 0.3); bigArrow.renderOrder = 19; plane.add(bigArrow);
    const smallArrow = new THREE.Mesh(arrowGeometry(0.75, 0.24), arrowMat(TL.CORAL)); smallArrow.position.set(0.15, TL.AXIS_Y - 1.5, 0.6); smallArrow.renderOrder = 19; plane.add(smallArrow);
    return {L, groundG, gm, lights, halos, lightSpots, plane, U, rotor: rotor as THREE.Object3D | null, cowlHinge, beads, beadSeeds, ten, burnGlows, turbGlows, exhaust, shaft, pulse, hubGlow, bypassStream, coreStream, bigArrow, smallArrow};
  }, [gl, scene, engine]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.05; cam.far = 30000;
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  gl.toneMappingExposure = 0.9;

  // ground: scroll, and drop/tilt for the liftoff (the plane stays framed; the world falls away)
  W.gm.uniforms.uShift.value = TL.groundShift(t);
  W.groundG.position.y = -TL.climb(t);
  W.groundG.rotation.z = (-TL.pitchDeg(t) * Math.PI) / 180;
  const shift = TL.groundShift(t), sp = TL.groundSpeed(t);
  const o = new THREE.Object3D(); const camQ = cam.quaternion;
  W.lightSpots.forEach(([px, z, span], i) => {
    const x = ((((px - shift) % span) + span) % span) - span * 0.35;
    o.position.set(x, 0.12, z); o.quaternion.identity(); o.scale.set(1 + sp * 0.022, 1, 1); o.updateMatrix(); W.lights.setMatrixAt(i, o.matrix);
    o.position.set(x, 0.2, z); o.quaternion.copy(camQ); o.scale.set(1.6, 1.6, 1.6); o.updateMatrix(); W.halos.setMatrixAt(i, o.matrix);
  });
  W.lights.instanceMatrix.needsUpdate = true; W.halos.instanceMatrix.needsUpdate = true;

  // engine: rotor spin, cowl, heat
  if (W.rotor) W.rotor.rotation.x = TL.fanSpin(t) * Math.PI * 2;
  W.cowlHinge.rotation.x = (-150 * Math.PI / 180) * TL.cowlOpen(t);
  W.cowlHinge.visible = t < TL.CUT_IN; // swung open in the side shot, gone after the cut (judge: it hovered like wreckage)
  W.U.uBurn.value = TL.burnGlow(t); W.U.uTurb.value = TL.turbineGlow(t) * 0.8 + 0.15; W.U.uFire.value = TL.fireGlow(t);

  // beads
  const flow = TL.flowOn(t), close = t >= TL.CUT_IN && t < TL.CUT_BACK;
  const bc = new THREE.Color(), cyan = col(TL.CYAN), white = col('#F2FBFF'), coral = col(TL.CORAL), amber = col(TL.AMBER);
  W.beadSeeds.forEach((b, i) => {
    const age = (((t - b.born) % TL.BEAD_LIFE) + TL.BEAD_LIFE) % TL.BEAD_LIFE;
    const x = TL.xAfter(b.core, age);
    const r = b.core ? TL.radiusCore(x, b.r0) : TL.radiusBypass(x, b.r0);
    const fadeIn = TL.clamp01((x + 1.8) / 1.2), fadeOut = 1 - TL.clamp01((x - 6) / 2.5); // beads appear at the intake: no snow in open sky
    const k = flow * fadeIn * fadeOut * (close && !b.core ? 0.45 : 1);
    const v = b.core ? TL.speedCore(x) : TL.speedBypass(x);
    o.position.set(x, TL.AXIS_Y + r * Math.sin(b.phi), r * Math.cos(b.phi)); o.quaternion.identity();
    o.scale.set(b.size * (1 + v * 0.45), b.size, b.size).multiplyScalar(k > 0.01 ? 1 : 0); o.updateMatrix(); W.beads.setMatrixAt(i, o.matrix);
    if (b.core) { const h = TL.coreHeat(x); if (h < 1) bc.copy(cyan).lerp(white, h); else bc.copy(white).lerp(coral, Math.min(1, (h - 1) * 2)).lerp(amber, Math.max(0, x - 5) * 0.1); }
    else bc.copy(cyan);
    bc.multiplyScalar((b.core ? 1.5 : 0.95) * k); W.beads.setColorAt(i, bc);
  });
  W.beads.instanceMatrix.needsUpdate = true; W.beads.instanceColor!.needsUpdate = true;

  // the ten counting beads
  const ton = TL.tenOn(t);
  W.ten.forEach((b, k) => {
    const isCore = k === 4;
    const x = isCore ? TL.coreBeadX(t) : TL.tenBypassX(t);
    const sgn = Math.sign(TL.TEN_R[k]) || 1, r0 = Math.abs(TL.TEN_R[k]);
    const y = isCore ? (x < 0.05 ? 0 : TL.radiusCore(x, 0.12) * 0.6) : sgn * (x < 0 ? r0 : TL.radiusBypass(x, r0));
    b.m.position.set(x, TL.AXIS_Y + y, 0.12); b.h.position.copy(b.m.position);
    const fade = isCore ? 1 : 1 - TL.clamp01((x - 4.5) / 1.5);
    b.m.visible = b.h.visible = ton * fade > 0.01;
    const h = isCore ? TL.coreHeat(x) : 0;
    const cc = isCore ? (h < 1 ? cyan.clone().lerp(white, h) : white.clone().lerp(coral, Math.min(1, (h - 1) * 2))) : cyan.clone();
    (b.m.material as THREE.MeshBasicMaterial).color.copy(cc).multiplyScalar(1.6);
    (b.m.material as THREE.MeshBasicMaterial).opacity = ton * fade;
    (b.h.material as THREE.SpriteMaterial).color.copy(cc); (b.h.material as THREE.SpriteMaterial).opacity = ton * fade * (isCore ? 1 : 0.7);
    b.h.scale.setScalar(isCore ? 0.32 * (1 + 0.8 * Math.max(0, h - 1)) : 0.24);
  });

  // glows
  const burn = TL.burnGlow(t), turb = TL.turbineGlow(t), fire = TL.fireGlow(t);
  W.burnGlows.forEach((s, i) => { const a = (i / 6 - 0.5) * Math.PI * 0.9; s.position.set((TL.X_BURN[0] + TL.X_BURN[1]) / 2, TL.AXIS_Y + 0.36 * Math.sin(a), 0.36 * Math.cos(a) + 0.05); (s.material as THREE.SpriteMaterial).opacity = 0.85 * burn * (0.85 + 0.15 * Math.sin(t * 23 + i * 2)); });
  W.turbGlows.forEach((s, i) => { s.position.set(TL.X_TURB[0] + (i / 4) * (TL.X_TURB[1] - TL.X_TURB[0]), TL.AXIS_Y + 0.36, 0.25); (s.material as THREE.SpriteMaterial).opacity = 0.55 * turb; });
  W.exhaust.forEach((s, i) => { s.position.set(TL.X_NOZZLE + 0.2 + i * 0.55, TL.AXIS_Y, 0); (s.material as THREE.SpriteMaterial).opacity = Math.min(1, (1.1 - i * 0.08) * fire * (0.85 + 0.15 * Math.sin(t * 17 + i))); s.scale.setScalar((1.1 + i * 0.45) * (0.7 + 0.5 * fire)); });
  const so = TL.shaftOn(t), p = TL.shaftPulse(t);
  (W.shaft.material as THREE.MeshBasicMaterial).opacity = 0.75 * so;
  const sx0 = TL.X_TURB[1] - 0.2, sx = sx0 + (0.15 - sx0) * p;
  W.shaft.scale.set(1, Math.max(0.01, sx0 - sx), 1); W.shaft.position.set((sx0 + sx) / 2, TL.AXIS_Y, 0.3);
  W.pulse.position.set(sx, TL.AXIS_Y, 0.3); (W.pulse.material as THREE.SpriteMaterial).opacity = so;
  W.hubGlow.position.set(0.1, TL.AXIS_Y, 0.3); (W.hubGlow.material as THREE.SpriteMaterial).opacity = 0.9 * TL.fanHubGlow(t);
  // streams and arrows
  const st = TL.streamsOn(t);
  const hook = t < TL.B.but + 0.6 ? TL.fireGlow(t) : 0;
  W.bypassStream.visible = st > 0.01; W.coreStream.visible = st > 0.01 || hook > 0.01;
  const bm = W.bypassStream.material as THREE.ShaderMaterial, cm = W.coreStream.material as THREE.ShaderMaterial;
  bm.uniforms.uO.value = st * 3.5; bm.uniforms.uT.value = t; bm.uniforms.uSpeed.value = 6;
  cm.uniforms.uO.value = Math.max(st * 2.0, hook * 2.4); cm.uniforms.uT.value = t; cm.uniforms.uSpeed.value = 16;
  const ar = TL.arrowsOn(t);
  W.bigArrow.visible = W.smallArrow.visible = ar > 0.01;
  (W.bigArrow.material as THREE.MeshBasicMaterial).opacity = 0.95 * ar; (W.smallArrow.material as THREE.MeshBasicMaterial).opacity = 0.95 * ar;
  W.bigArrow.scale.setScalar(0.6 + 0.4 * ar); W.smallArrow.scale.setScalar(0.6 + 0.4 * ar);
  return null;
};
