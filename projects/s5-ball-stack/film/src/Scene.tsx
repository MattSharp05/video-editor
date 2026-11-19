// One three.js world: an outdoor school court at golden hour beside a brick wall, a weathered hoop, the basketball
// and the tennis ball, plus the luminous layer (guess bars, strobe ghosts, speed arrows, height tiles). Built once;
// per frame only transforms, colours and opacities change, all from timeline.ts.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {random} from 'remotion';
import {skyLight} from './kit/realism/sky.ts';
import * as TL from './timeline';

const col = (h: string) => new THREE.Color(h);
export type Assets = {basketball: GLTF; tennis: GLTF; hoop: GLTF; tex: Record<string, THREE.Texture>};

// glass: mostly clear, bright rim where the surface turns away, tinted
export const rimGlass = (tint: string, base = 0.12, rimK = 0.8) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
  uniforms: {uTint: {value: col(tint)}, uBase: {value: base}, uRim: {value: rimK}, uOpacity: {value: 1}, uGain: {value: 1}},
  vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `uniform vec3 uTint; uniform float uBase; uniform float uRim; uniform float uOpacity; uniform float uGain; varying vec3 vN; varying vec3 vW;
    void main(){ vec3 V=normalize(cameraPosition-vW); float r=pow(1.0-abs(dot(normalize(vN),V)),2.0);
    gl_FragColor=vec4(uTint*(0.7+1.4*r)*uGain, (uBase+uRim*r)*uOpacity); }`,
});
const glowTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const sprite = (tex: THREE.Texture, c: string, size: number, add = true) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color: col(c), blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false, transparent: true, toneMapped: false}));
  s.scale.setScalar(size); s.renderOrder = 20; return s;
};
// an arrow: glowing shaft + head along +y from its origin, length set per frame
const makeArrow = (c: string) => {
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({color: col(c).multiplyScalar(1.6), toneMapped: false, transparent: true, depthWrite: false});
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 12), m); shaft.renderOrder = 22;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 16), m); head.renderOrder = 22;
  const halo = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 12), new THREE.MeshBasicMaterial({color: col(c), toneMapped: false, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false}));
  halo.renderOrder = 21; g.add(shaft, head, halo);
  // ticks every UNIT along the shaft (speed units)
  const ticks: THREE.Mesh[] = [];
  for (let i = 1; i < 4; i++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.014, 0.13), m); tk.renderOrder = 23; g.add(tk); ticks.push(tk); }
  const set = (len: number, op: number) => {
    g.visible = op > 0.01 && Math.abs(len) > 0.01;
    const L = Math.max(0.001, Math.abs(len) - 0.12), sgn = Math.sign(len) || 1;
    shaft.scale.y = L; shaft.position.y = (sgn * L) / 2; halo.scale.y = L; halo.position.y = shaft.position.y;
    head.position.y = sgn * (L + 0.06); head.rotation.z = sgn > 0 ? 0 : Math.PI;
    ticks.forEach((tk, i) => { tk.visible = (i + 1) * TL.UNIT < Math.abs(len) - 0.05; tk.position.y = sgn * (i + 1) * TL.UNIT; });
    m.opacity = op; (halo.material as THREE.MeshBasicMaterial).opacity = 0.25 * op;
  };
  return {g, set};
};

// court paint: green acrylic inside the court, terracotta key, white lines; asphalt outside
const courtMaterial = (tex: Record<string, THREE.Texture>) => {
  const m = new THREE.MeshStandardMaterial({map: tex.asphaltD, roughnessMap: tex.asphaltR, normalMap: tex.asphaltN, roughness: 1, normalScale: new THREE.Vector2(0.6, 0.6)});
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        vec2 p = vWp.xz - vec2(${TL.RIM.x.toFixed(3)}, ${(TL.RIM.z - 1.2).toFixed(3)}); // origin: baseline under the rim
        float inCourt = step(-7.5, p.x) * step(p.x, 7.5) * step(0.0, p.y) * step(p.y, 14.0);
        float inKey = step(-2.45, p.x) * step(p.x, 2.45) * step(0.0, p.y) * step(p.y, 5.8);
        float dv = diffuseColor.r;
        vec3 paint = mix(vec3(0.20, 0.36, 0.27), vec3(0.50, 0.25, 0.19), inKey) * (0.75 + 0.5 * dv);
        diffuseColor.rgb = mix(diffuseColor.rgb, paint, inCourt * 0.88);
        float w = 0.025;
        float ln = 0.0;
        ln = max(ln, (1.0 - step(w, abs(p.y))) * step(-7.5, p.x) * step(p.x, 7.5));             // baseline
        ln = max(ln, (1.0 - step(w, abs(abs(p.x) - 7.5))) * step(0.0, p.y) * step(p.y, 14.0));  // sidelines
        ln = max(ln, (1.0 - step(w, abs(abs(p.x) - 2.45))) * step(0.0, p.y) * step(p.y, 5.8)); // lane
        ln = max(ln, (1.0 - step(w, abs(p.y - 5.8))) * step(-2.45, p.x) * step(p.x, 2.45));    // free throw
        float r = length(p - vec2(0.0, 1.2));
        ln = max(ln, (1.0 - step(w, abs(r - 6.75))) * step(1.2, p.y) * step(abs(p.x), 6.6));    // three-point arc
        ln = max(ln, (1.0 - step(w, abs(r - 1.8))) * step(5.8, p.y + 1.2 - 1.2) * step(5.8, p.y)); // top of the circle
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.85, 0.80) * (0.85 + 0.3 * dv), ln * 0.92);`);
  };
  return m;
};

export const Scene: React.FC<{t: number; assets: Assets}> = ({t, assets}) => {
  const {gl, camera, scene} = useThree();

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const opts = {elevation: 12, azimuth: 330, turbidity: 3, visibility: 6000, hazeHeight: 300, ground: '#6b6a5e'};
    const L = skyLight(gl, opts);
    L.sky.scale.setScalar(5000); L.sky.renderOrder = -10; scene.add(L.sky);
    const env = L.envMap;
    const root = new THREE.Group(); scene.add(root);
    const tex = glowTex();

    // lights: sun with one fitted shadow box over the drop area, sky-coloured hemisphere fill
    const sun = new THREE.DirectionalLight(L.sunColor, L.sunIntensity * 0.075);
    sun.position.copy(L.sunDir).multiplyScalar(30); sun.target.position.set(0, 2, -1);
    sun.castShadow = true; sun.intensity = L.sunIntensity * 0.11; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {left: -7, right: 7, top: 9, bottom: -5, near: 1, far: 80}); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    root.add(sun, sun.target);
    const skyCol = L.skyIrradiance.clone(); skyCol.multiplyScalar(1 / Math.max(skyCol.r, skyCol.g, skyCol.b));
    const hemi = new THREE.HemisphereLight(skyCol, col('#8a7a66'), 1.5); root.add(hemi);

    // court
    for (const k of ['asphaltD', 'asphaltR', 'asphaltN', 'brickD', 'brickR', 'brickN']) {
      const tx = assets.tex[k]; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.anisotropy = 8;
    }
    assets.tex.asphaltD.repeat.set(24, 24); assets.tex.asphaltR.repeat.set(24, 24); assets.tex.asphaltN.repeat.set(24, 24);
    const court = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), courtMaterial(assets.tex));
    court.rotation.x = -Math.PI / 2; court.position.z = 30; court.receiveShadow = true; root.add(court);

    // brick wall with a concrete cap, a few windows and a downpipe
    const wallW = 40;
    for (const k of ['brickD', 'brickR', 'brickN']) assets.tex[k].repeat.set(wallW / 1.6, TL.WALL_H / 1.6);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(wallW, TL.WALL_H), new THREE.MeshStandardMaterial({map: assets.tex.brickD, roughnessMap: assets.tex.brickR, normalMap: assets.tex.brickN, roughness: 1, color: col('#d8c8bc')}));
    wall.position.set(-4, TL.WALL_H / 2, TL.WALL_Z); wall.receiveShadow = true; root.add(wall);
    const concrete = new THREE.MeshStandardMaterial({color: col('#b9b2a6'), roughness: 0.85});
    const cap = new THREE.Mesh(new THREE.BoxGeometry(wallW, 0.3, 0.5), concrete); cap.position.set(-4, TL.WALL_H + 0.15, TL.WALL_Z + 0.1); cap.castShadow = true; root.add(cap);
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(wallW, 0.3, 0.12), new THREE.MeshStandardMaterial({color: col('#7d776d'), roughness: 0.9})); plinth.position.set(-4, 0.15, TL.WALL_Z + 0.06); plinth.receiveShadow = true; root.add(plinth);
    const winMat = new THREE.MeshPhysicalMaterial({color: col('#1d2733'), roughness: 0.08, metalness: 0.2, envMap: env, envMapIntensity: 1.2});
    const frameMat = new THREE.MeshStandardMaterial({color: col('#e9e4da'), roughness: 0.6});
    for (const x of [-11, -7.2, -3.4, 3.4, 7.2]) { // a gap of brick behind the ball's flight
      const fr = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.7, 0.08), frameMat); fr.position.set(x, 5.6, TL.WALL_Z + 0.04); fr.castShadow = true; root.add(fr);
      const gl2 = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.5), winMat); gl2.position.set(x, 5.6, TL.WALL_Z + 0.09); root.add(gl2);
      const mul = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.5, 0.04), frameMat); mul.position.set(x, 5.6, TL.WALL_Z + 0.11); root.add(mul);
      const sill = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 0.2), concrete); sill.position.set(x, 4.72, TL.WALL_Z + 0.1); sill.castShadow = true; root.add(sill);
    }
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, TL.WALL_H, 12), new THREE.MeshStandardMaterial({color: col('#5d6266'), roughness: 0.5, metalness: 0.3}));
    pipe.position.set(-3.6, TL.WALL_H / 2, TL.WALL_Z + 0.12); pipe.castShadow = true; root.add(pipe);
    // a fence line to the right
    const postMat = new THREE.MeshStandardMaterial({color: col('#6f7478'), roughness: 0.4, metalness: 0.5});
    for (let z = -2; z < 30; z += 3) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 8), postMat); p.position.set(9.5, 1.6, z); root.add(p); }

    // hoop (real metres; rim front at +z 1.89 in the file)
    const hoop = assets.hoop.scene.clone(true);
    hoop.position.set(TL.RIM.x, 0, TL.RIM.z - 1.66); root.add(hoop);
    hoop.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });

    // balls
    const bball = new THREE.Group(); const bm = assets.basketball.scene.clone(true); bm.position.y = -0.1197; bball.add(bm); root.add(bball);
    bm.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; const mt = m.material as THREE.MeshStandardMaterial; mt.roughness = 0.62; mt.envMap = env; mt.envMapIntensity = 0.5; } });
    const tball = new THREE.Group(); const tm = assets.tennis.scene.clone(true); tm.scale.setScalar(TL.RT / 0.0577); tball.add(tm); root.add(tball);
    tm.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; const mt = m.material as THREE.MeshStandardMaterial; mt.envMap = env; mt.envMapIntensity = 0.4; } });
    const tGlow = sprite(tex, TL.LIME, 0.28); tball.add(tGlow);

    // strobe ghosts (shot B): simple spheres in each ball's colour
    const ghostMat = (c: string) => new THREE.MeshBasicMaterial({color: col(c), transparent: true, opacity: 0.45, depthWrite: false, toneMapped: false});
    const NG = 24;
    const gB = new THREE.InstancedMesh(new THREE.SphereGeometry(TL.RB, 24, 16), ghostMat(TL.ORANGE), NG); gB.renderOrder = 15; gB.frustumCulled = false; root.add(gB);
    const gT = new THREE.InstancedMesh(new THREE.SphereGeometry(TL.RT, 16, 12), ghostMat(TL.LIME), NG); gT.renderOrder = 16; gT.frustumCulled = false; root.add(gT);
    // the ideal ghost ball (shot D)
    const ghost = new THREE.Mesh(new THREE.SphereGeometry(TL.RT * 1.6, 24, 16), rimGlass(TL.LIME, 0.25, 1.0)); ghost.renderOrder = 18; root.add(ghost);
    const ghostGlow = sprite(tex, TL.LIME, 0.9); ghost.add(ghostGlow);

    // dust ring at the contact
    const dust = Array.from({length: 22}, (_, i) => { const s = sprite(tex, '#d9c8ae', 0.1, false); (s.material as THREE.SpriteMaterial).opacity = 0; root.add(s); return {s, a: (i / 22) * Math.PI * 2 + random('da' + i) * 0.3, v: 0.5 + random('dv' + i) * 0.5}; });

    // guess bars (shot A): "your hand" line becomes "back to your hand?"; "twice as high?"; shards
    const barGeo = new THREE.BoxGeometry(0.6, 0.035, 0.035);
    const mkBar = (y: number) => { const b = new THREE.Mesh(barGeo, rimGlass(TL.GLASS, 0.5, 0.6)); b.position.set(-0.2, y, TL.BAR_Z); b.renderOrder = 19; root.add(b); const gl = sprite(tex, TL.GLASS, 0.0); root.add(gl); return {b, gl}; };
    const bars = [mkBar(TL.START_Y), mkBar(TL.LAUNCH_Y + 2 * TL.D)];
    const NS = 36;
    const shards = bars.map((bar, k) => {
      const im = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(0.03), new THREE.MeshBasicMaterial({color: col(TL.GLASS).multiplyScalar(1.3), transparent: true, toneMapped: false, depthWrite: false}), NS);
      im.renderOrder = 19; im.frustumCulled = false; root.add(im);
      const seeds = Array.from({length: NS}, (_, i) => ({x: -0.1 + 0.6 * random(`sx${k}${i}`), vx: (random(`svx${k}${i}`) - 0.5) * 1.4, vy: 0.5 + random(`svy${k}${i}`) * 1.8, vz: (random(`svz${k}${i}`) - 0.3) * 1.2, r: random(`sr${k}${i}`) * 6, s: 0.6 + random(`ss${k}${i}`) * 1.2}));
      return {im, seeds, y: bar.b.position.y};
    });
    const flash = sprite(tex, '#ffffff', 0.6); root.add(flash);
    // a lime streak behind the rising tennis ball (shot A reveal, shot D real rise)
    const trailMat = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
      uniforms: {uC: {value: col(TL.LIME)}, uO: {value: 1}},
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uC; uniform float uO; varying vec2 vUv; void main(){ float a=pow(vUv.x,1.6)*uO; gl_FragColor=vec4(uC*1.5*a, a); }`});
    const trail = new THREE.Mesh(new THREE.BufferGeometry(), trailMat); trail.renderOrder = 21; root.add(trail);

    // speed arrows (shots C, D)
    const aT = makeArrow(TL.LIME), aB = makeArrow(TL.ORANGE); root.add(aT.g, aB.g);

    // height tiles (shot D): 9 lime glass squares, each 1 drop height
    const tileGeo = new THREE.BoxGeometry(1, 1, 0.03);
    const edgeGeo = new THREE.EdgesGeometry(tileGeo);
    const tiles = Array.from({length: 9}, () => {
      const g = new THREE.Group();
      const mat = rimGlass(TL.LIME, 0.16, 0.5); const m = new THREE.Mesh(tileGeo, mat); m.renderOrder = 17;
      const em = new THREE.LineBasicMaterial({color: col(TL.LIME).multiplyScalar(1.5), transparent: true, toneMapped: false, depthWrite: false});
      const e = new THREE.LineSegments(edgeGeo, em); e.renderOrder = 18;
      g.add(m, e); root.add(g); return {g, mat, em};
    });
    const tileShards = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(0.06), new THREE.MeshBasicMaterial({color: col(TL.CORAL).multiplyScalar(1.4), transparent: true, toneMapped: false, depthWrite: false}), 5 * 30);
    tileShards.renderOrder = 19; tileShards.frustumCulled = false; root.add(tileShards);
    const tsSeeds = Array.from({length: 180}, (_, i) => ({x: random('tx' + i) - 0.5, y: random('ty' + i) - 0.5, vx: (random('tvx' + i) - 0.5) * 2.4, vy: random('tvy' + i) * 1.5, vz: (random('tvz' + i) - 0.2) * 2, r: random('tr' + i) * 8}));
    const warm = [sprite(tex, TL.CORAL, 0.5), sprite(tex, TL.CORAL, 0.35)]; warm.forEach((w) => root.add(w));

    return {trail, L, sun, hemi, bball, tball, tGlow, gB, gT, ghost, ghostGlow, dust, bars, shards, flash, aT, aB, tiles, tileShards, tsSeeds, warm, sky: L.sky};
  }, [gl, scene, assets]);

  // ---------- per frame
  const cam = camera as THREE.PerspectiveCamera;
  const c = TL.camAt(t);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = 0.02; cam.far = 8000;
  cam.position.set(...c.pos); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  W.sky.position.copy(cam.position);
  gl.toneMappingExposure = 0.78;

  const shot = TL.shotAt(t);
  const s = TL.simAt(t);
  // the real tennis ball in shot D: frozen at contact until its replay rise
  const sD = shot === 'D' ? TL.simD(t) : -1;
  const bl = TL.balls(s);
  const tl = sD >= 0 ? TL.balls(sD) : bl;
  W.bball.position.set(0, bl.bY, 0); W.bball.scale.set(1 + bl.bSquash * 0.6, 1 - bl.bSquash, 1 + bl.bSquash * 0.6);
  W.tball.position.set(tl.tX, tl.tY, 0); W.tball.scale.set(1 + tl.tSquash * 0.6, 1 - tl.tSquash, 1 + tl.tSquash * 0.6);
  // the tennis ball's lime rim glow: on as the question names it, through the reveal; low elsewhere
  const rising = (shot === 'A' && s > TL.S_LAUNCH) || sD >= TL.S_LAUNCH;
  const tg = shot === 'A' ? TL.ramp(t, TL.B.fly - 0.6, TL.B.fly) * 0.8 : shot === 'C' ? 0.3 : 0.5;
  (W.tGlow.material as THREE.SpriteMaterial).opacity = rising ? 1 : tg; W.tGlow.scale.setScalar(rising ? 0.5 : 0.28);

  // dust at the contact (shots A and B)
  const dAge = (s - TL.S_HIT) / 0.5;
  W.dust.forEach((d) => {
    const on = (shot === 'A' || shot === 'B') && dAge > 0 && dAge < 1;
    const r = 0.14 + d.v * 0.45 * Math.sqrt(Math.max(dAge, 0));
    d.s.position.set(Math.cos(d.a) * r, 0.03 + 0.05 * dAge, Math.sin(d.a) * r);
    d.s.scale.setScalar(0.06 + 0.12 * dAge); (d.s.material as THREE.SpriteMaterial).opacity = on ? 0.55 * (1 - dAge) : 0;
  });

  // ghosts (shot B): every GHOST_DT of sim time before the contact, five through it
  const ghostTimes: number[] = [];
  if (shot === 'B') {
    for (let gs = 0.335; gs < Math.min(s, TL.S_HIT - 0.005); gs += 0.034) ghostTimes.push(gs);
    for (const k of [0.5, 1.0, 1.25]) { const gs = TL.S_HIT + k * TL.TC; if (gs < s) ghostTimes.push(gs); }
  }
  // like a strobe photo on moving film: each older ghost sits further left (0.05 m per flash)
  const tmp = new THREE.Object3D();
  const live = ghostTimes.length;
  for (let i = 0; i < 24; i++) {
    const gs = ghostTimes[i];
    if (gs === undefined) { tmp.scale.setScalar(0); tmp.updateMatrix(); W.gB.setMatrixAt(i, tmp.matrix); W.gT.setMatrixAt(i, tmp.matrix); continue; }
    const g = TL.balls(gs), dx = -0.075 * (live - i);
    tmp.position.set(dx, g.bY, 0); tmp.scale.set(1 + g.bSquash * 0.6, 1 - g.bSquash, 1 + g.bSquash * 0.6); tmp.updateMatrix(); W.gB.setMatrixAt(i, tmp.matrix);
    tmp.position.set(dx, g.tY, 0); tmp.scale.set(1, 1 - g.tSquash, 1); tmp.updateMatrix(); W.gT.setMatrixAt(i, tmp.matrix);
  }
  W.gB.instanceMatrix.needsUpdate = W.gT.instanceMatrix.needsUpdate = true;
  W.gB.visible = W.gT.visible = shot === 'B';

  // guess bars and their smash (shot A)
  const barOn = [TL.handLine(t), TL.bar2(t)];
  W.bars.forEach((bar, k) => {
    const hitT = TL.crossT(bar.b.position.y);
    const broken = t >= hitT;
    const o = shot === 'A' && !broken ? barOn[k] : shot === 'D' ? 0.55 * TL.guessBack(t) : 0;
    bar.b.visible = o > 0.01; bar.b.scale.x = Math.max(0.01, barOn[k]);
    bar.b.position.x = shot === 'D' ? 0.55 : 0.2; // in shot D they stand right of the real tower
    (bar.b.material as THREE.ShaderMaterial).uniforms.uOpacity.value = o;
    const pulse = k === 0 ? TL.hump(t, TL.B.back - 0.1, 0.8) : TL.hump(t, TL.B.twice - 0.1, 0.8);
    const tick = TL.ticks()[k] ?? 0;
    (bar.b.material as THREE.ShaderMaterial).uniforms.uGain.value = 1 + 1.2 * pulse + 1.5 * TL.hump(t, tick - 0.05, 0.35);
    // shards
    const sh = W.shards[k]; const age = t - hitT;
    sh.im.visible = shot === 'A' && broken && age < 1.6;
    sh.seeds.forEach((sd, i) => {
      const a = Math.max(0, age) * 0.7; // slow motion
      tmp.position.set(sd.x + sd.vx * a, sh.y + sd.vy * a - 4.9 * a * a, TL.BAR_Z + sd.vz * a);
      tmp.rotation.set(sd.r + a * 5, sd.r * 2 + a * 4, 0); tmp.scale.setScalar(sd.s * (1 - Math.min(1, age / 1.6))); tmp.updateMatrix(); sh.im.setMatrixAt(i, tmp.matrix);
    });
    sh.im.instanceMatrix.needsUpdate = true;
  });
  const hits = [...W.bars.map((b) => TL.crossT(b.b.position.y)), TL.crossT(TL.Q_Y)];
  const fl = shot === 'A' ? Math.max(...hits.map((h) => TL.hump(t, h - 0.02, 0.18))) : 0;
  W.flash.visible = fl > 0.01; (W.flash.material as THREE.SpriteMaterial).opacity = fl; W.flash.position.set(tl.tX, tl.tY, 0.05);

  // the streak: the last 0.35 s of film time of the tennis ball while it flies up
  {
    const simOf = (tt: number) => (TL.shotAt(tt) === 'A' ? TL.simA(tt) : TL.simD(tt));
    const pts: THREE.Vector3[] = [];
    if (shot === 'A' || (shot === 'D' && sD >= 0)) for (let k = 0; k <= 16; k++) {
      const tt = t - 0.35 + (0.35 * k) / 16; if (TL.shotAt(tt) !== shot) continue;
      const ss = simOf(tt); if (ss < TL.S_LAUNCH) continue;
      const b = TL.balls(ss); pts.push(new THREE.Vector3(b.tX, b.tY, 0));
    }
    const len = pts.length > 1 ? pts[pts.length - 1].distanceTo(pts[0]) : 0;
    W.trail.visible = len > 0.08;
    if (W.trail.visible) { W.trail.geometry.dispose(); W.trail.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, TL.RT * 0.7, 8, false); }
  }
  // arrows
  if (shot === 'C') {
    // the tennis ball's arrow points down at it from above; the basketball's points up beside it
    const at = TL.povArrowT(t), ab = TL.povArrowB(t);
    W.aT.g.position.set(bl.tX, bl.tY + TL.RT + 0.03 + TL.POV_UNIT * at, 0); W.aT.set(-TL.POV_UNIT * at, at);
    W.aB.g.position.set(-0.02, bl.bY - 0.06, TL.RB + 0.03); W.aB.set(TL.POV_UNIT * ab, ab); // on the basketball's camera side, pointing up
  } else if (shot === 'D') {
    const f = TL.flip(t), dbl = TL.double(t), jn = TL.join(t), sq = TL.square(t);
    // tennis ball's arrow: down 1 unit above the ball -> flips up (1) -> doubles (2) -> the basketball's unit joins (3)
    const len = f < 0.5 ? -TL.UNIT * (1 - 2 * f) : TL.UNIT * (2 * f - 1) * (1 + dbl) + TL.UNIT * jn;
    W.aT.g.position.set(0.0, TL.LAUNCH_Y + TL.RT + 0.01, 0); W.aT.set(len, 1 - sq);
    if (len < 0) W.aT.g.position.y = TL.LAUNCH_Y + TL.RT + 0.01 + TL.UNIT;
    // the basketball's arrow points up beside it, then slides onto the tennis ball's arrow tail... onto its tip
    const bx = TL.lerp(-0.3, 0, jn), by = TL.lerp(TL.RB, TL.LAUNCH_Y + TL.RT + 0.01 + 2 * TL.UNIT, jn);
    W.aB.g.position.set(bx, by, 0); W.aB.set(TL.UNIT, (1 - TL.ramp(t, TL.B.three + 0.25, TL.B.three + 0.45)) * TL.ramp(t, TL.B.with - 0.05, TL.B.with + 0.4));
  } else { W.aT.set(0, 0); W.aB.set(0, 0); }

  // tiles: a 3x3 square of small tiles beside the arrow -> fly up into the tower -> top ones lost
  const sq = shot === 'D' ? TL.square(t) : 0;
  const fade = TL.towerFade(t);
  W.tiles.forEach((tile, i) => {
    const r = Math.floor(i / 3), cc = i % 3;
    const u = TL.UNIT * 0.98;
    // square position: columns sweep out to the left of the arrow, rows from the launch point up
    const sx = TL.lerp(0, -0.12 - (cc + 0.5) * TL.UNIT, TL.smooth(sq * 1.3 - cc * 0.15)), sy = TL.LAUNCH_Y + TL.RT + (r + 0.5) * TL.UNIT;
    const fly = TL.tileFly(t, i);
    const tx = TL.TOWER_X, ty = TL.LAUNCH_Y + (i + 0.5) * TL.TILE;
    const arc = Math.sin(Math.PI * fly) * 0.6;
    const x = TL.lerp(sx, tx, fly) - arc, y = TL.lerp(sy, ty, fly), size = TL.lerp(u, TL.TILE * 0.97, fly);
    const ls = TL.lost(t, i);
    let sy2 = 1, yOff = 0, op = (shot === 'D' ? Math.min(1, sq * 3) : 0) * fade;
    if (i === 3) { sy2 = 1 - 0.5 * ls; yOff = -size * 0.25 * ls; }
    else if (i > 3) { op *= 1 - TL.smooth((ls - 0.5) * 2); }
    tile.g.position.set(x, y + yOff, 0); tile.g.scale.set(size, size * sy2, 1);
    tile.g.visible = op > 0.01;
    const coral = i >= 3 ? TL.smooth(ls * 2.2) * (i === 3 ? 0.0 : 1) : 0;
    const cl = col(TL.LIME).lerp(col(TL.CORAL), coral);
    tile.mat.uniforms.uTint.value.copy(cl); tile.mat.uniforms.uOpacity.value = op; tile.em.color.copy(cl).multiplyScalar(1.5); tile.em.opacity = op;
  });
  // crumbling shards of the lost tiles
  let n = 0;
  for (let i = 4; i < 9; i++) {
    const ls = TL.lost(t, i), age = (ls - 0.45) * 1.2;
    for (let k = 0; k < 30; k++, n++) {
      const sd = W.tsSeeds[n];
      if (shot !== 'D' || ls < 0.45 || ls >= 1 || age > 0.8) { tmp.scale.setScalar(0); }
      else {
        const a = age * 1.4;
        tmp.position.set(TL.TOWER_X + sd.x * TL.TILE + sd.vx * a, TL.LAUNCH_Y + (i + 0.5 + sd.y) * TL.TILE + sd.vy * a - 4.9 * a * a, sd.vz * a);
        tmp.rotation.set(sd.r + a * 6, sd.r, a * 3); tmp.scale.setScalar(1.4 * (1 - age / 0.8));
      }
      tmp.updateMatrix(); W.tileShards.setMatrixAt(n, tmp.matrix);
    }
  }
  W.tileShards.instanceMatrix.needsUpdate = true;
  // warm spots at the two contacts while tiles are lost
  const ws = shot === 'D' ? TL.warmSpots(t) : 0;
  W.warm[0].position.set(0, 0.02, 0.0); W.warm[1].position.set(0, 2 * TL.RB, 0.0);
  W.warm.forEach((w) => { w.visible = ws > 0.01; (w.material as THREE.SpriteMaterial).opacity = ws * 0.9; });

  // the ideal ghost ball rides the tiles up to 9 drop heights
  const gu = shot === 'D' ? TL.ghostUp(t) : 0;
  const gop = shot === 'D' ? TL.ramp(t, TL.B.nine, TL.B.nine + 0.3) * (1 - TL.ramp(t, TL.B.lose - 0.1, TL.B.lose + 0.4)) : 0;
  W.ghost.visible = gop > 0.01; W.ghost.position.set(0, TL.lerp(TL.LAUNCH_Y, TL.PEAK_IDEAL, gu), 0);
  (W.ghost.material as THREE.ShaderMaterial).uniforms.uOpacity.value = gop; (W.ghostGlow.material as THREE.SpriteMaterial).opacity = gop;
  return null;
};
