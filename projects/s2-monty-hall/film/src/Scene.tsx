// One world: a storage building at night, 10 floors × 10 units with wide double doors, an asphalt yard, pole lights,
// the host's searchlight, goats (CC BY model, instanced and varied), one car (CC BY model), falling envelopes, glowing
// door frames, amber light that flows between doors, and numbers projected onto the doors. Built once; per frame only
// transforms, instance colours, light levels and the flow particles change, all from timeline.ts.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {random} from 'remotion';
import * as TL from './timeline';
import * as SET from './set';

const col = (h: string) => new THREE.Color(h);
export type Assets = {goat: GLTF; car: GLTF};
const N_ENV = 520;

// flatten a loaded model into one geometry+material list, normalised: bottom at y = 0, centred in x/z, scaled so the
// given axis has the given size
const normalise = (root: THREE.Object3D, size: number, axis: 'x' | 'y' | 'z') => {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root), s = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const k = size / s[axis];
  const g = new THREE.Group(); const inner = new THREE.Group(); inner.add(root); g.add(inner);
  inner.scale.setScalar(k); inner.position.set(-c.x * k, -box.min.y * k, -c.z * k);
  return g;
};
const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

export const Scene: React.FC<{t: number; assets: Assets}> = ({t, assets}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.25; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.background = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 512; const g = c.getContext('2d')!; const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#05070C'); gr.addColorStop(0.55, '#0F1624'); gr.addColorStop(1, '#1B2232'); g.fillStyle = gr; g.fillRect(0, 0, 4, 512); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; })(); scene.fog = new THREE.Fog(col('#0A0D13'), 30, 140);
    const root = new THREE.Group(); scene.add(root);
    const tex = glowTex();

    // environment for the car's paint and chrome: a dark yard with a few warm lamps
    const pm = new THREE.PMREMGenerator(gl); const es = new THREE.Scene(); es.background = col('#14161B');
    const panel = (w: number, h: number, c: string, k: number, pos: [number, number, number]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: col(c).multiplyScalar(k), side: THREE.DoubleSide})); m.position.set(...pos); m.lookAt(0, 0, 0); es.add(m); };
    panel(4, 1, '#FFD9A6', 5, [0, 6, 3]); panel(2, 2, '#FFE6C0', 3, [-5, 3, -2]); panel(10, 10, '#2A2622', 0.8, [0, -4, 0]);
    const env = pm.fromScene(es, 0.02).texture;

    // fill
    const hemi = new THREE.HemisphereLight(col('#7F93B4'), col('#211B15'), 0.35); root.add(hemi);
    const moon = new THREE.DirectionalLight(col('#AFC4E6'), 0.25); moon.position.set(-20, 40, 40); root.add(moon);
    const front = new THREE.DirectionalLight(col('#FFE2C0'), 0.7); front.position.set(4, 9, 30); root.add(front);
    const yardLight = new THREE.SpotLight(col('#FFD6A0'), 90, 30, 0.7, 0.8, 1.4); yardLight.position.set(-3, 9, 19); yardLight.target.position.set(0, 0, 9); root.add(yardLight, yardLight.target);
    // pole lights over the three game doors (one casts shadows)
    const poles = [-3, 0, 3].map((x, i) => {
      const s = new THREE.SpotLight(col('#FFD9A6'), 120, 26, 0.62, 0.6, 1.5); s.position.set(x, 8, 8); s.target.position.set(x, 0.6, 0.5);
      if (i === 1) { s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -0.0005; Object.assign(s.shadow.camera, {near: 2, far: 20}); }
      root.add(s, s.target); return s;
    });

    // yard: asphalt with a little sheen and noise
    const yardMat = new THREE.MeshStandardMaterial({color: col('#2B2C2E'), roughness: 0.82});
    yardMat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWy;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWy = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWy;\nfloat hY(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }\nfloat vnY(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hY(i), hY(i + vec2(1, 0)), f.x), mix(hY(i + vec2(0, 1)), hY(i + vec2(1, 1)), f.x), f.y); }')
        .replace('#include <color_fragment>', '#include <color_fragment>\nfloat n = hY(floor(vWy.xz * 60.0)) * 0.6 + vnY(vWy.xz * 1.3) * 0.4; diffuseColor.rgb *= 0.78 + 0.35 * n;')
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = 0.6 + 0.32 * vnY(vWy.xz * 0.45);');
    };
    const yard = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), yardMat); yard.rotation.x = -Math.PI / 2; yard.receiveShadow = true; root.add(yard);
    // painted kerb line in front of the units
    const kerb = new THREE.Mesh(new THREE.PlaneGeometry(TL.COLS * TL.CW, 0.12), new THREE.MeshStandardMaterial({color: col('#C9A63A'), roughness: 0.7}));
    kerb.rotation.x = -Math.PI / 2; kerb.position.set(TL.FACADE_C[0], 0.004, 2.2); root.add(kerb);

    // the building
    const N = TL.COLS * TL.FLOORS;
    const cell = (i: number) => new THREE.Vector3(TL.unitX(i % TL.COLS), TL.floorY(Math.floor(i / TL.COLS)), 0);
    const inst = (geo: THREE.BufferGeometry, mat: THREE.Material, count: number, place: (o: THREE.Object3D, i: number) => void, shadow = true) => {
      const m = new THREE.InstancedMesh(geo, mat, count); const o = new THREE.Object3D();
      for (let i = 0; i < count; i++) { o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); place(o, i); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }
      m.castShadow = m.receiveShadow = shadow; root.add(m); return m;
    };
    inst(SET.facadeCellGeometry(), SET.facadeMaterial(), N, (o, i) => o.position.copy(cell(i)));
    const units = inst(SET.unitGeometry(), SET.unitMaterial(), N, (o, i) => o.position.copy(cell(i)), false);
    for (let i = 0; i < N; i++) units.setColorAt(i, new THREE.Color(1, 1, 1));
    const W_ALL = TL.COLS * TL.CW;
    for (let f = 1; f < TL.FLOORS; f++) { const w = new THREE.Mesh(SET.walkwayGeometry(W_ALL + 1), SET.steelMaterial()); w.position.set(TL.FACADE_C[0], TL.floorY(f), 0); w.castShadow = w.receiveShadow = true; root.add(w); }
    // roof slab and end walls
    const shell = new THREE.MeshStandardMaterial({color: col('#4F4C48'), roughness: 0.9});
    const roof = new THREE.Mesh(new THREE.BoxGeometry(W_ALL + 1.2, 0.5, TL.UNIT_D + 0.6), shell); roof.position.set(TL.FACADE_C[0], TL.floorY(TL.FLOORS) + 0.25, -TL.UNIT_D / 2); root.add(roof);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.6, TL.floorY(TL.FLOORS), TL.UNIT_D + 0.6), shell); e.position.set(TL.FACADE_C[0] + s * (W_ALL / 2 + 0.3), TL.floorY(TL.FLOORS) / 2, -TL.UNIT_D / 2 + 0.15); e.castShadow = true; root.add(e); }
    // stair stacks at both ends (so the walkways lead somewhere)
    for (const s of [-1, 1]) for (let f = 0; f < TL.FLOORS - 1; f++) {
      const st = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 4.2), SET.steelMaterial()); st.position.set(TL.FACADE_C[0] + s * (W_ALL / 2 + 1.3), TL.floorY(f) + TL.FH / 2, 0.9); st.rotation.x = (f % 2 ? 1 : -1) * Math.atan2(TL.FH, 4.2) * 0.98; root.add(st);
    }

    // door leaves (2 per unit), updated per frame
    const leaves = new THREE.InstancedMesh(SET.leafGeometry(), SET.leafMaterial(), N * 2); leaves.castShadow = leaves.receiveShadow = true; root.add(leaves);
    // walkway lamps above each door (emissive boxes + glow sprites), instance colour = on/off
    const lampBox = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.1, 0.16), new THREE.MeshBasicMaterial({color: 0xffffff, toneMapped: false}), N);
    const lampGlow = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({map: tex, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}), N);
    { const o = new THREE.Object3D(); for (let i = 0; i < N; i++) { o.position.copy(cell(i)).add(new THREE.Vector3(0, SET.OPEN_H + 0.28, 0.12)); o.updateMatrix(); lampBox.setMatrixAt(i, o.matrix); o.position.z += 0.06; o.updateMatrix(); lampGlow.setMatrixAt(i, o.matrix); lampBox.setColorAt(i, new THREE.Color(0, 0, 0)); lampGlow.setColorAt(i, new THREE.Color(0, 0, 0)); } }
    root.add(lampBox, lampGlow);
    // frame glows (ice / amber), additive
    const frames = new THREE.InstancedMesh(SET.frameGlowGeometry(), new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide}), N);
    { const o = new THREE.Object3D(); for (let i = 0; i < N; i++) { o.position.copy(cell(i)); o.updateMatrix(); frames.setMatrixAt(i, o.matrix); frames.setColorAt(i, new THREE.Color(0, 0, 0)); } }
    frames.renderOrder = 5; root.add(frames);
    const blaze = new THREE.Mesh(new THREE.PlaneGeometry(SET.OPEN_W, SET.OPEN_H), new THREE.MeshBasicMaterial({map: tex, color: col(TL.AMBER), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}));
    blaze.position.copy(cell(TL.CAR100)).add(new THREE.Vector3(0, SET.OPEN_H / 2, 0.15)); blaze.scale.set(1.6, 1.4, 1); blaze.renderOrder = 6; root.add(blaze);
    // stencilled numbers 1 2 3 over the game doors
    TL.GAME.forEach((gi, k) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshStandardMaterial({map: SET.textTexture(String(k + 1), '#EDE6D6', 256, 128, "700 120px 'DejaVu Sans', sans-serif", 0), transparent: true, roughness: 0.8, depthWrite: false})); p.position.copy(cell(gi)).add(new THREE.Vector3(-1.05, SET.OPEN_H + 0.34, 0.01)); root.add(p); });

    // goats: one per unit except the car's, varied (turn, size, mirror)
    let goatMesh: THREE.Mesh | null = null;
    assets.goat.scene.traverse((o) => { if (!goatMesh && (o as THREE.Mesh).isMesh) goatMesh = o as THREE.Mesh; });
    const gScene = normalise(assets.goat.scene.clone(true), 0.95, 'y'); gScene.updateMatrixWorld(true);
    let gm: THREE.Mesh | null = null; gScene.traverse((o) => { if (!gm && (o as THREE.Mesh).isMesh) gm = o as THREE.Mesh; });
    const goatGeo = (gm as unknown as THREE.Mesh).geometry.clone().applyMatrix4((gm as unknown as THREE.Mesh).matrixWorld);
    const goatMat = ((gm as unknown as THREE.Mesh).material as THREE.MeshStandardMaterial).clone(); goatMat.side = THREE.DoubleSide;
    goatGeo.computeBoundingBox(); const gb = goatGeo.boundingBox!; const gLong = gb.max.z - gb.min.z > gb.max.x - gb.min.x ? 'z' : 'x';
    const goats = new THREE.InstancedMesh(goatGeo, goatMat, N); goats.castShadow = true; root.add(goats);
    const goatPose = Array.from({length: N}, (_, i) => ({yaw: (gLong === 'z' ? 0 : -Math.PI / 2) + (random('gy' + i) - 0.5) * 1.6 + (random('gm' + i) > 0.5 ? Math.PI : 0) * 0.0, s: 0.88 + random('gs' + i) * 0.24, mx: random('gx' + i) > 0.5 ? -1 : 1, dx: (random('gdx' + i) - 0.5) * 0.8, dz: -1.2 - random('gdz' + i) * 1.6}));

    // the car: normalised to 4.6 m along its long axis, nose toward the door; headlights
    const carRoot = assets.car.scene.clone(true);
    const box0 = new THREE.Box3().setFromObject(carRoot), s0 = box0.getSize(new THREE.Vector3());
    const carLongX = s0.x > s0.z;
    const car = normalise(carRoot, 4.6, carLongX ? 'x' : 'z'); car.rotation.y = carLongX ? -Math.PI / 2 : 0;
    car.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; m.castShadow = true; const mat = m.material as THREE.MeshStandardMaterial; if (mat && 'envMap' in mat) { mat.envMap = env; mat.envMapIntensity = 1.2; if (/Body/.test(mat.name)) { const p = new THREE.MeshPhysicalMaterial({color: mat.color, map: mat.map, roughness: 0.25, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, envMap: env, envMapIntensity: 1.3}); m.material = p; } } });
    const carG = new THREE.Group(); carG.add(car); root.add(carG);
    const heads = [-0.62, 0.62].map((x) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col('#FFF4D8'), blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, transparent: true})); s.position.set(x, 0.78, 2.35); s.scale.setScalar(0.9); carG.add(s); return s; });
    const headLight = new THREE.SpotLight(col('#FFF1D0'), 0, 30, 0.5, 0.6, 1.2); headLight.position.set(0, 0.8, 2.3); headLight.target.position.set(0, 0.3, 12); carG.add(headLight, headLight.target);
    const unitBulb = new THREE.PointLight(col('#FFD9A6'), 0, 7, 1.6); carG.add(unitBulb); unitBulb.position.set(0, 2.6, -1);

    // the host's searchlight: a light, a visible beam (additive cone) and a bright pool
    const search = new THREE.SpotLight(col('#FFF3E2'), 0, 120, 0.04, 0.35, 1.0); search.position.set(14, 26, 34); root.add(search, search.target);
    const beamGeo = new THREE.ConeGeometry(1, 1, 32, 1, true); beamGeo.translate(0, -0.5, 0); beamGeo.rotateX(-Math.PI / 2);
    const beamMat = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: {uO: {value: 0}},
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform float uO; varying vec3 vP; void main(){ float a = uO * 0.10 * smoothstep(0.0, 0.25, -vP.z) * (0.4 + 0.6 * (1.0 + vP.z)); gl_FragColor = vec4(vec3(1.0, 0.96, 0.9) * a * 1.8, a); }'});
    const beam = new THREE.Mesh(beamGeo, beamMat); beam.renderOrder = 8; root.add(beam);
    const pool = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col('#FFF0DA'), blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, transparent: true})); root.add(pool);
    const gleam = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.25), new THREE.MeshBasicMaterial({map: tex, color: col(TL.AMBER), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}));
    gleam.rotation.x = -Math.PI / 2; gleam.position.copy(cell(TL.GAME[1])).add(new THREE.Vector3(0, 0.01, 0.25)); root.add(gleam);

    // envelopes
    const envs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.004, 0.15), new THREE.MeshStandardMaterial({map: SET.envelopeTexture(), roughness: 0.85, side: THREE.DoubleSide}), N_ENV);
    envs.castShadow = true; envs.receiveShadow = true; root.add(envs);
    const envSeeds = SET.envelopeSeeds(N_ENV);

    // projected numbers
    const label = (text: string, c: string, w: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 2), new THREE.MeshBasicMaterial({map: SET.textTexture(text, c), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false})); m.renderOrder = 12; root.add(m); return m; };
    const L = {
      f1: label('50%', TL.CORAL, 2.0), f2: label('50%', TL.CORAL, 2.0),
      one: label('1%', TL.ICE, 4.6), nn: label('99%', TL.AMBER, 9),
      t1: label('1/3', TL.ICE, 1.9), t2: label('2/3', TL.AMBER, 2.4),
    };

    // amber flow particles (heads + trails)
    const TRAIL = 9, NP = TL.ORDER.length * TRAIL + 40;
    const flowGeo = new THREE.BufferGeometry(); flowGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NP * 3), 3)); flowGeo.setAttribute('size', new THREE.BufferAttribute(new Float32Array(NP), 1));
    const flowMat = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: {uTex: {value: tex}, uC: {value: col(TL.AMBER)}},
      vertexShader: 'attribute float size; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * 900.0 / -mv.z; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform sampler2D uTex; uniform vec3 uC; void main(){ float a = texture2D(uTex, gl_PointCoord).a; gl_FragColor = vec4(uC * 1.6 * a, a); }'});
    const flow = new THREE.Points(flowGeo, flowMat); flow.frustumCulled = false; flow.renderOrder = 10; root.add(flow);

    return {blaze, units, yardLight, front, cell, poles, hemi, moon, leaves, lampBox, lampGlow, frames, goats, goatPose, carG, heads, headLight, unitBulb, search, beam, beamMat, pool, gleam, envs, envSeeds, L, flowGeo, TRAIL, NP, N};
  }, [gl, scene, assets]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.1; cam.far = 600;
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();

  const after = t >= TL.CUT_BACK, hundredOn = t >= TL.B.hundred && !after;
  const lv = TL.lights(t);
  W.poles.forEach((p) => (p.intensity = 120 * lv * (hundredOn ? 1 - TL.ramp(t, TL.B.hundred, TL.B.hundred + 2) * 0.6 : 1)));
  W.hemi.intensity = 0.5 * (0.2 + 0.8 * lv); W.moon.intensity = 0.3 * (0.2 + 0.8 * lv); W.front.intensity = 0.7 * (0.1 + 0.9 * lv); W.yardLight.intensity = 90 * lv * (hundredOn ? 0.4 : 1);

  // door state per unit: 0 closed .. 1 open
  const openOf = (i: number) => { const g = TL.GAME.indexOf(i); return Math.max(g >= 0 ? TL.gameDoor(t, g) : 0, TL.door100(t, i)); };
  const o = new THREE.Object3D(), ang = (100 * Math.PI) / 180;
  for (let i = 0; i < W.N; i++) {
    const p = W.cell(i), k = openOf(i);
    o.rotation.set(0, -ang * k, 0); o.position.set(p.x - SET.LEAF_W, p.y, 0.03); o.scale.set(1, 1, 1); o.updateMatrix(); W.leaves.setMatrixAt(i * 2, o.matrix);
    o.rotation.set(0, Math.PI + ang * k, 0); o.position.set(p.x + SET.LEAF_W, p.y, 0.03); o.updateMatrix(); W.leaves.setMatrixAt(i * 2 + 1, o.matrix);
  }
  W.leaves.instanceMatrix.needsUpdate = true;

  // lamps
  for (let i = 0; i < W.N; i++) { const on = TL.lampOn(t, i % TL.COLS, Math.floor(i / TL.COLS)) * lv; W.lampBox.setColorAt(i, new THREE.Color(0.16, 0.16, 0.17).lerp(new THREE.Color(1.6, 1.3, 0.9), on)); W.lampGlow.setColorAt(i, new THREE.Color(1.0, 0.75, 0.45).multiplyScalar(0.55 * on)); }
  W.lampBox.instanceColor!.needsUpdate = W.lampGlow.instanceColor!.needsUpdate = true;

  // contents: the car's unit holds the car; every other unit a goat (in the hundred game the car waits in CAR100, unseen)
  const carUnit = after ? TL.GAME[1] : hundredOn ? TL.CAR100 : TL.GAME[TL.carAt(t)];
  for (let i = 0; i < W.N; i++) {
    const p = W.cell(i), gp = W.goatPose[i];
    const step = i === TL.GAME[2] ? TL.goat3Step(t) : 0;
    o.position.set(p.x + gp.dx * (1 - step), p.y, gp.dz + 1.1 * step); o.rotation.set(0, gp.yaw + 0.5 * step, 0);
    const vis = i === carUnit ? 0 : 1;
    o.scale.set(gp.s * gp.mx * vis, gp.s * vis, gp.s * vis); o.updateMatrix(); W.goats.setMatrixAt(i, o.matrix);
  }
  W.goats.instanceMatrix.needsUpdate = true;
  const cp = W.cell(carUnit); W.carG.position.set(cp.x, cp.y, -TL.UNIT_D + 0.6 + 0.0); W.carG.position.z = -3.0;
  W.carG.visible = !hundredOn || true;
  const hl = after ? TL.headlights(t) : 0;
  W.heads.forEach((s) => ((s.material as THREE.SpriteMaterial).opacity = 0.15 + 0.85 * hl));
  W.headLight.intensity = 60 * hl; W.unitBulb.intensity = 6 * Math.max(openOf(carUnit), 0.0);

  for (let i = 0; i < W.N; i++) W.units.setColorAt(i, new THREE.Color(1, 1, 1).multiplyScalar(after ? 1 : TL.unitDim(t, i)));
  W.units.instanceColor!.needsUpdate = true;
  (W.blaze.material as THREE.MeshBasicMaterial).opacity = hundredOn ? 1.1 * TL.absorbed(t) : 0;

  // frame glows: ice for your pick, amber for the group / the last door / the pair
  const ice = new THREE.Color(TL.ICE), amb = new THREE.Color(TL.AMBER);
  for (let i = 0; i < W.N; i++) {
    let cc = new THREE.Color(0, 0, 0);
    if (!after) {
      if (i === TL.MINE) cc = ice.clone().multiplyScalar(0.9 * TL.pickGlow(t));
      else if (hundredOn) {
        const g = TL.group(t) * 0.9;
        if (i === TL.CAR100) cc = amb.clone().multiplyScalar(g + 1.6 * TL.absorbed(t));
        else cc = amb.clone().multiplyScalar(g * (1 - TL.door100(t, i)));
      }
    } else {
      if (i === TL.GAME[0]) cc = ice.clone().multiplyScalar(0.9 * TL.thirds(t));
      if (i === TL.GAME[1]) cc = amb.clone().multiplyScalar((0.55 + 0.9 * TL.flow3(t)) * Math.max(TL.thirds(t), 0.3));
      if (i === TL.GAME[2]) cc = amb.clone().multiplyScalar(0.55 * (1 - TL.flow3(t)) * TL.thirds(t));
    }
    W.frames.setColorAt(i, cc);
  }
  W.frames.instanceColor!.needsUpdate = true;

  // searchlight
  let target = new THREE.Vector3(0, 1.3, 0.3), bo = 0;
  if (!after && t < TL.B.hundred) { const b = TL.beam3(t); bo = b.on; target.set(b.x, 1.4, 0.3); }
  else if (hundredOn) { const b = TL.beam100(t); bo = b.on; target.set(b.x, b.y, 0.3); }
  W.search.intensity = 1500 * bo; W.search.target.position.copy(target); W.search.target.updateMatrixWorld();
  const src = W.search.position, dir = target.clone().sub(src), len = dir.length();
  W.beam.position.copy(src); W.beam.lookAt(target); W.beam.scale.set(len * 0.07, len * 0.07, len); W.beamMat.uniforms.uO.value = bo; W.beam.visible = bo > 0.01;
  W.pool.position.copy(target).add(new THREE.Vector3(0, 0, 0.2)); W.pool.scale.setScalar(hundredOn ? 3.4 : 2.2); (W.pool.material as THREE.SpriteMaterial).opacity = 0.35 * bo; W.pool.visible = bo > 0.01;
  (W.gleam.material as THREE.MeshBasicMaterial).opacity = 0.9 * TL.carGleam(t) * (after ? 0 : 1);

  // envelopes: fall, tumble, land flat; lie on the yard afterwards
  W.envSeeds.forEach((e, i) => {
    const age = t - e.t0;
    if (age < 0) { o.scale.setScalar(0); }
    else {
      const k = Math.min(1, age / e.fall);
      const y = e.h * (1 - k) * (1 - k * 0.0) + 0.004 + i * 0.000004;
      o.position.set(e.x + Math.sin(age * 2.3 + e.ax) * e.sway * (1 - k), k < 1 ? y * (1 - k * k * 0) : 0.004 + (i % 7) * 0.0012, e.z);
      if (k < 1) o.rotation.set(e.ax + age * e.spin, e.yaw + age * 0.7, Math.sin(age * 3 + e.ax) * 0.8);
      else o.rotation.set(e.flip ? Math.PI : 0, e.yaw, 0);
      o.scale.setScalar(1);
    }
    o.updateMatrix(); W.envs.setMatrixAt(i, o.matrix);
  });
  W.envs.instanceMatrix.needsUpdate = true;
  W.envs.visible = !hundredOn || cam.position.z < 30;

  // projected numbers
  const place = (m: THREE.Mesh, p: THREE.Vector3, op: number) => { m.position.copy(p); (m.material as THREE.MeshBasicMaterial).opacity = op; m.visible = op > 0.01; };
  const doorFace = (i: number, dy = 1.35) => W.cell(i).clone().add(new THREE.Vector3(0, dy, 0.12));
  const fo = after ? 0 : TL.fiftyOn(t);
  place(W.L.f1, doorFace(TL.GAME[0]), fo); place(W.L.f2, doorFace(TL.GAME[1]), fo);
  place(W.L.one, doorFace(TL.MINE, 1.35), TL.onePct(t));
  const nnFrom = new THREE.Vector3(TL.FACADE_C[0], 17, 2), nnTo = doorFace(TL.CAR100, 1.3).add(new THREE.Vector3(4.6, 0.2, 2));
  const mv = TL.pct99Move(t); place(W.L.nn, nnFrom.clone().lerp(nnTo, mv), hundredOn || (t >= TL.CUT_BACK - 0.01 && !after) ? TL.pct99(t) : 0); W.L.nn.scale.setScalar(1 - 0.35 * mv);
  const th = TL.thirds(t);
  place(W.L.t1, doorFace(TL.GAME[0]), th);
  const pairC = W.cell(TL.GAME[1]).clone().add(W.cell(TL.GAME[2])).multiplyScalar(0.5).add(new THREE.Vector3(0, 3.0, 0.3));
  place(W.L.t2, pairC.clone().lerp(doorFace(TL.GAME[1]), TL.flow3(t)), th);

  // amber flow particles
  const pos = W.flowGeo.attributes.position as THREE.BufferAttribute, size = W.flowGeo.attributes.size as THREE.BufferAttribute;
  let n = 0;
  const emit = (a: THREE.Vector3, b: THREE.Vector3, u: number, bulge: number, sz: number) => {
    for (let k = 0; k < W.TRAIL && n < W.NP; k++) {
      const uu = u - k * 0.03; if (uu < 0 || uu > 1) { size.setX(n, 0); n++; continue; }
      const mid = a.clone().add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, 0, bulge));
      const p = a.clone().multiplyScalar((1 - uu) ** 2).add(mid.multiplyScalar(2 * uu * (1 - uu))).add(b.clone().multiplyScalar(uu * uu));
      pos.setXYZ(n, p.x, p.y, p.z); size.setX(n, sz * (1 - k / W.TRAIL)); n++;
    }
  };
  if (hundredOn) {
    const tgt = doorFace(TL.CAR100, 1.2);
    TL.ORDER.forEach((d, r) => { const a0 = TL.openAt(r) + 0.25; const u = (t - a0) / TL.FLIGHT; emit(doorFace(d, 1.2), tgt, u, 4 + (r % 5), 1.5); });
  } else if (after) {
    const u = TL.flow3(t) * 1.0; for (let j = 0; j < 6; j++) emit(doorFace(TL.GAME[2], 0.8 + j * 0.25), doorFace(TL.GAME[1], 0.8 + j * 0.25), u * 1.15 - j * 0.03, 1.5, 0.12);
  }
  for (; n < W.NP; n++) size.setX(n, 0);
  pos.needsUpdate = true; size.needsUpdate = true;
  return null;
};
