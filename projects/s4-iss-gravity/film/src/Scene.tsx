// The whole film is one three.js world in km with Earth's centre at the origin; the shot decides the camera and which
// props are drawn. Close objects are separate meshes with small local vertices, so three's float64 model-view maths
// keeps a 2 m astronaut steady 6,771 km from the origin.
//   station / crew   the ISS (sourced), the astronaut (sourced, float loop), a bathroom scale, a pen; Earth below
//   tower            the globe with a needle tower growing to 400 km, Everest, the station as an amber light
//   top              the tower top: a platform, the scale, the astronaut stepping off and falling
//   globe            the orbit: straight-ahead path vs real path; cannon shots from the tower top; the lap
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {Earth, Stars, Route, type EarthTex} from './kit/globe';
import * as TL from './timeline';

export type Assets = {iss: GLTF; astro: GLTF; earth: EarthTex};

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
// orientation that maps local x -> a, y -> b, z -> a x b
const basis = (x: THREE.Vector3, y: THREE.Vector3) => {
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x.clone().normalize(), y.clone().normalize(), z));
};
const Q_LOCAL = basis(TL.T, TL.UP); // x along track, y up, z = T x UP (= -N)

// ---------- the scale's display
const lcdTexture = () => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return {c, tex, last: ''};
};
const drawLcd = (l: ReturnType<typeof lcdTexture>, text: string, color: string) => {
  const key = text + color; if (l.last === key) return; l.last = key;
  const g = l.c.getContext('2d')!; g.fillStyle = '#0d1512'; g.fillRect(0, 0, 256, 128);
  g.fillStyle = color; g.font = '700 84px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 128, 68);
  l.tex.needsUpdate = true;
};

// ---------- cannon trajectories (level shots from the tower top, no air, Earth not turning): Kepler, RK4
const GM = 398600.4418;
const trajectory = (v0: number) => {
  let p = TL.TOP.clone(), v = TL.T.clone().multiplyScalar(v0); const pts = [p.clone()], dt = 5;
  const acc = (q: THREE.Vector3) => q.clone().multiplyScalar(-GM / q.length() ** 3);
  for (let i = 0; i < 4000; i++) {
    const a1 = acc(p), k1v = a1, k1p = v.clone();
    const p2 = p.clone().addScaledVector(k1p, dt / 2), v2 = v.clone().addScaledVector(k1v, dt / 2), k2v = acc(p2), k2p = v2;
    const p3 = p.clone().addScaledVector(k2p, dt / 2), v3 = v.clone().addScaledVector(k2v, dt / 2), k3v = acc(p3), k3p = v3;
    const p4 = p.clone().addScaledVector(k3p, dt), v4 = v.clone().addScaledVector(k3v, dt), k4v = acc(p4), k4p = v4;
    p = p.clone().addScaledVector(k1p.add(k2p.multiplyScalar(2)).add(k3p.multiplyScalar(2)).add(k4p), dt / 6);
    v = v.clone().addScaledVector(k1v.add(k2v.multiplyScalar(2)).add(k3v.multiplyScalar(2)).add(k4v), dt / 6);
    if (p.length() < TL.R) { pts.push(p.clone().setLength(TL.R)); break; }
    pts.push(p.clone());
    if (i * dt > 5600) break; // one lap (~92 min)
  }
  return pts;
};
// the lap is drawn as the circle at 400 km (fact check: 7.7 km/s is within 1.5 % of circular)
const circle = (n = 256) => Array.from({length: n + 1}, (_, i) => TL.onOrbit((i / n) * Math.PI * 2));

const Arrow: React.FC<{at: THREE.Vector3; len: number; o: number; q: THREE.Quaternion}> = ({at, len, o, q}) =>
  o <= 0.01 ? null : (
    <group position={at} quaternion={q}>
      <mesh position={[0, -len * 0.4, 0]}><cylinderGeometry args={[len * 0.05, len * 0.05, len * 0.8, 12]} /><meshBasicMaterial color={TL.AMBER} transparent opacity={o} toneMapped={false} /></mesh>
      <mesh position={[0, -len * 0.88, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[len * 0.13, len * 0.25, 16]} /><meshBasicMaterial color={TL.AMBER} transparent opacity={o} toneMapped={false} /></mesh>
    </group>
  );

export const Scene: React.FC<{t: number; assets: Assets}> = ({t, assets}) => {
  const {gl, camera, scene} = useThree();
  const shot = TL.shotAt(t);
  const close = shot === 'station' || shot === 'crew' || shot === 'top';

  const W = useMemo(() => {
    // station: model x = truss (-> N), y = up, z = along track; 14.4 units = 109 m
    const iss = assets.iss.scene.clone(true);
    const box = new THREE.Box3().setFromObject(iss), c = box.getCenter(V());
    iss.position.sub(c); const issG = new THREE.Group(); issG.add(iss);
    issG.scale.setScalar(0.109 / box.getSize(V()).x);
    issG.quaternion.copy(basis(TL.N, TL.UP));
    issG.position.copy(TL.ISS_POS);
    iss.traverse((o) => { if ((o as THREE.Mesh).isMesh) { const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial; if (m && m.color) { const hsl = {h: 0, s: 0, l: 0}; m.color.getHSL(hsl);
      if (hsl.h > 0.2 && hsl.h < 0.45 && hsl.s > 0.35) m.color.setHSL(hsl.h, hsl.s * 0.35, hsl.l * 0.8); } } }); // the toy-green module, desaturated
    // astronaut (skinned, animated)
    // measured from the file's nodes (python, glTF accessors x node transforms): 3.117 units tall, feet at y 0; a skinned
    // mesh's Box3 isn't reliable before its skeleton has been posed
    // GPU skinning 6,771 km from the origin shreds the mesh (float32 bone matrices), so the pose is baked on the CPU each
    // frame from an off-scene copy at the origin into static meshes with small local coordinates.
    const src = SkeletonUtils.clone(assets.astro.scene);
    const mixer = new THREE.AnimationMixer(src); const action = mixer.clipAction(assets.astro.animations[0]); action.play();
    const clipLen = assets.astro.animations[0].duration;
    const astroG = new THREE.Group(); const inner = new THREE.Group(); astroG.add(inner);
    const h = 3.117; inner.scale.setScalar(0.0018 / h); inner.position.y = -0.0009;
    const baked: {skin: THREE.SkinnedMesh; mesh: THREE.Mesh}[] = [];
    src.updateMatrixWorld(true);
    src.traverse((o) => {
      if (!(o as THREE.SkinnedMesh).isSkinnedMesh) return;
      const skin = o as THREE.SkinnedMesh; const g = skin.geometry.clone();
      for (const k of ['skinIndex', 'skinWeight']) g.deleteAttribute(k);
      const mesh = new THREE.Mesh(g, skin.material); mesh.matrixAutoUpdate = false; mesh.frustumCulled = false;
      inner.add(mesh); baked.push({skin, mesh});
    });
    const pose = (time: number) => {
      mixer.setTime(time); src.updateMatrixWorld(true); const v = new THREE.Vector3();
      for (const {skin, mesh} of baked) {
        skin.skeleton.update(); const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) { skin.getVertexPosition(i, v); pos.setXYZ(i, v.x, v.y, v.z); }
        pos.needsUpdate = true; mesh.geometry.computeVertexNormals(); mesh.matrix.copy(skin.matrixWorld);
      }
    };
    // the scale: white body, glass top, LCD on its front edge
    const lcd = lcdTexture();
    const scaleG = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.00032, 0.00005, 0.00032), new THREE.MeshStandardMaterial({color: '#f2f2ee', roughness: 0.35}));
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.0003, 0.000004, 0.0003), new THREE.MeshStandardMaterial({color: '#cfd8dc', roughness: 0.08, metalness: 0.1}));
    glass.position.y = 0.000027;
    const lcdM = new THREE.Mesh(new THREE.PlaneGeometry(0.00012, 0.00006), new THREE.MeshBasicMaterial({map: lcd.tex, toneMapped: false}));
    lcdM.position.set(0, 0.0000295, 0.00009); lcdM.rotation.x = -Math.PI / 2;
    scaleG.add(body, glass, lcdM); scaleG.scale.setScalar(1.5);
    // pen
    const pen = new THREE.Group();
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.000005, 0.000005, 0.00014, 12), new THREE.MeshStandardMaterial({color: '#1d3f8f', roughness: 0.4}));
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.000005, 0.00002, 12), new THREE.MeshStandardMaterial({color: '#c0c0c0', metalness: 0.8, roughness: 0.3}));
    tip.position.y = -0.00008; tip.rotation.x = Math.PI; pen.add(barrel, tip); pen.scale.setScalar(2.2);
    // platform and tower shaft at the top
    const platform = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.0026, 0.0026, 0.0003, 48), new THREE.MeshStandardMaterial({color: '#b9bec4', roughness: 0.6, metalness: 0.3}));
    deck.position.y = -0.00015; platform.add(deck);
    const rail = new THREE.Mesh(new THREE.TorusGeometry(0.0025, 0.00003, 6, 64, Math.PI * 1.4), new THREE.MeshStandardMaterial({color: '#e8e8e8', metalness: 0.5, roughness: 0.4}));
    rail.rotation.x = Math.PI / 2; rail.rotation.z = Math.PI * 0.8; rail.position.y = 0.001; platform.add(rail);
    for (let i = 0; i < 12; i++) { const a = Math.PI * 0.8 + (i / 11) * Math.PI * 1.4; const post = new THREE.Mesh(new THREE.CylinderGeometry(0.00002, 0.00002, 0.001, 6), rail.material); post.position.set(Math.cos(a) * 0.0025, 0.0005, -Math.sin(a) * 0.0025); platform.add(post); }
    const panel = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d')!;
      g.fillStyle = '#e6e9ec'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#8f979f'; g.lineWidth = 3;
      for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, 256); g.stroke(); }
      for (let j = 0; j <= 4; j++) { g.beginPath(); g.moveTo(0, j * 64); g.lineTo(256, j * 64); g.stroke(); }
      g.lineWidth = 2; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32 + 32, 64); g.moveTo(i * 32 + 32, 0); g.lineTo(i * 32, 64); g.stroke(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 500); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const shaftMat = new THREE.MeshStandardMaterial({color: '#ffffff', map: panel, roughness: 0.45, metalness: 0.35});
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 2, 24, 1, true), shaftMat); shaft.position.y = -1.0003; platform.add(shaft);
    for (let i = 0; i < 70; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.00225, 0.00006, 6, 32), shaftMat); ring.rotation.x = Math.PI / 2; ring.position.y = -0.0006 - i * 0.004; platform.add(ring); }
    platform.position.copy(TL.TOP); platform.quaternion.copy(Q_LOCAL);
    // globe-scale tower: a glowing needle
    const needleMat = new THREE.MeshBasicMaterial({color: '#f4f8ff', toneMapped: false});
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 12), needleMat);
    const everest = new THREE.Mesh(new THREE.ConeGeometry(14, 9, 4), new THREE.MeshBasicMaterial({color: '#f0e6d2', toneMapped: false}));
    // station marker at globe scale
    const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!; const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      r.addColorStop(0, 'rgba(255,240,210,1)'); r.addColorStop(0.15, 'rgba(255,181,71,0.9)'); r.addColorStop(0.5, 'rgba(255,181,71,0.18)'); r.addColorStop(1, 'rgba(255,181,71,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
    const marker = new THREE.Sprite(new THREE.SpriteMaterial({map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, transparent: true}));
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, transparent: true}));
    const trajs = TL.SHOTS.slice(0, 3).map(trajectory);
    return {issG, astroG, inner, pose, clipLen, scaleG, lcd, pen, platform, needle, everest, marker, flash, trajs, ring: circle()};
  }, [assets]);

  // ---------- renderer, camera, light
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.toneMappingExposure = close ? 0.95 : 1.0;
  scene.background = new THREE.Color('#000000');
  const c = TL.camAt(t); const cam = camera as THREE.PerspectiveCamera;
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.near = close && TL.pullBack(t) < 0.3 ? 0.0001 : 1; cam.far = 200000;
  cam.position.copy(c.pos); cam.up.copy(c.up); cam.lookAt(c.look); cam.updateProjectionMatrix();

  // Earth slides beneath the station in the close shots (the station is drawn fixed; real angular rate)
  const earthSpin = shot === 'station' ? -TL.ISS_OMEGA * t : shot === 'crew' ? -TL.ISS_OMEGA * (t - 5) : 0;
  const earthQ = new THREE.Quaternion().setFromAxisAngle(TL.N, -earthSpin);
  const sunLocal = TL.SUN.clone().applyQuaternion(earthQ.clone().invert());

  // ---------- astronaut state
  const A = W.astroG; if (shot === 'station' || shot === 'crew' || shot === 'top') W.pose(shot === 'top' ? 1.6 : (t * 0.9) % W.clipLen);
  if (shot === 'station' || shot === 'crew') {
    A.position.copy(TL.ASTRO); A.quaternion.copy(Q_LOCAL).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.08 * Math.sin(t * 0.7), 0.9 + 0.05 * t, 0.1 * Math.sin(t * 0.5))));
    W.scaleG.position.copy(TL.SCALE_ST).addScaledVector(TL.UP, 0.00004 * Math.sin(t * 1.3));
    W.scaleG.quaternion.copy(Q_LOCAL).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12 + 0.03 * Math.sin(t), -0.5, 0.05)));
    W.pen.position.copy(TL.at(TL.ASTRO, 0.0006, 0.0002 + 0.00003 * Math.sin(t), 0.0005));
    W.pen.quaternion.copy(Q_LOCAL).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(t * 0.6, t * 0.35, 0.4)));
  } else if (shot === 'top') {
    const f = TL.fallPos(t);
    W.scaleG.position.copy(TL.SCALE_TOP).addScaledVector(TL.UP, 0.000025); W.scaleG.quaternion.copy(Q_LOCAL).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -0.6, 0)));
    A.position.copy(TL.at(TL.SCALE_TOP, f.x, 0.00005 + 0.0009 + f.y, 0));
    A.quaternion.copy(Q_LOCAL).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 1.2, -f.tilt)));
    // stand him on the scale: lowest baked vertex (sampled) onto the scale's top, before the step
    if (t < TL.STEP_T()) {
      A.updateMatrixWorld(true); let lo = Infinity; const v = V(), top = W.scaleG.position.clone().addScaledVector(TL.UP, 0.00003);
      W.inner.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; const p = m.geometry.attributes.position;
        for (let i = 0; i < p.count; i += 37) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); lo = Math.min(lo, v.clone().sub(top).dot(TL.UP)); } });
      if (isFinite(lo)) A.position.addScaledVector(TL.UP, -lo);
    }
  }
  const read = TL.scaleRead(t);
  TL.shotAt(t) === 'top' && read > 0.01 ? drawLcd(W.lcd, read > 0.88 ? '~90%' : `${Math.round(read * 100)}%`, TL.AMBER) : drawLcd(W.lcd, '0.0', '#bfe8d0');

  // ---------- globe-scale props
  const towerH = TL.towerH(t);
  const showTower = (shot === 'tower' && towerH > 0.5) || shot === 'globe';
  const hT = shot === 'globe' ? TL.H : towerH;
  W.needle.scale.set(TL.TOWER_W / 2, hT, TL.TOWER_W / 2); W.needle.position.copy(TL.UP).multiplyScalar(TL.R + hT / 2); W.needle.quaternion.copy(Q_LOCAL);
  W.everest.position.copy(TL.at(TL.UP.clone().multiplyScalar(TL.R), -60, 4.5, 0)); W.everest.quaternion.copy(Q_LOCAL);
  const issP = TL.onOrbit(TL.issTheta(t));
  const mk = shot === 'tower' ? 170 : shot === 'crew' ? 1100 : 520; W.marker.scale.set(mk, mk, 1); W.marker.position.copy(issP);

  // straight-ahead vs real path (globe)
  const pOn = TL.pathsOn(t), th = TL.issTheta(t);
  const tang = TL.T.clone().multiplyScalar(Math.cos(th)).addScaledVector(TL.UP, -Math.sin(th));
  const PL = 2300;
  const dashes = Array.from({length: 8}, (_, i) => [issP.clone().addScaledVector(tang, i * 290 + 40), issP.clone().addScaledVector(tang, i * 290 + 190)]);
  const dEnd = issP.clone().addScaledVector(tang, PL), rEnd = TL.onOrbit(th + PL / TL.RS);
  const real = Array.from({length: 41}, (_, i) => TL.onOrbit(th + (i / 40) * (PL / TL.RS)));

  // cannon
  const lap = TL.lapProgress(t);

  return (
    <>
      <ambientLight intensity={close ? 0.05 : 0} />
      <hemisphereLight args={['#0b0f18', '#5b8fc4', close ? 0.55 : 0]} position={TL.UP.clone().multiplyScalar(-1)} />
      <directionalLight position={TL.SUN.clone().multiplyScalar(100000)} intensity={close ? 3.2 : 0} />
      <Stars fr={Math.round(t * 30)} opacity={close ? 0.6 : 1} />
      <group quaternion={earthQ}>
        <Earth tex={assets.earth} radius={TL.R} day={shot === 'globe' || (shot === 'crew' && TL.pullBack(t) > 0.5) ? 0.95 : 1.3} night={0.6} air={1.2} sunVec={sunLocal} />
      </group>
      {(shot === 'station' || shot === 'crew') && <primitive object={W.issG} />}
      {(shot === 'station' || shot === 'crew' || shot === 'top') && <primitive object={W.astroG} />}
      {(shot === 'station' || shot === 'crew' || shot === 'top') && <primitive object={W.scaleG} />}
      {(shot === 'station' || shot === 'crew') && <primitive object={W.pen} />}
      {shot === 'top' && <primitive object={W.platform} />}
      {showTower && <primitive object={W.needle} />}
      {shot === 'tower' && <primitive object={W.everest} />}
      {(shot === 'tower' || shot === 'globe' || (shot === 'crew' && TL.pullBack(t) > 0.6)) && <primitive object={W.marker} />}
      {shot === 'crew' && TL.arrowsOn(t) > 0.01 && (
        <>
          <Arrow at={TL.at(TL.ASTRO, 0.0, 0.0001, -0.0007)} len={0.0011} o={TL.arrowsOn(t)} q={Q_LOCAL} />
          <Arrow at={W.scaleG.position} len={0.0011} o={TL.arrowsOn(t)} q={Q_LOCAL} />
          <Arrow at={W.pen.position} len={0.0011} o={TL.arrowsOn(t)} q={Q_LOCAL} />
          <Arrow at={TL.at(TL.ISS_POS, -0.036, -0.003, 0.002)} len={0.0011} o={TL.arrowsOn(t)} q={Q_LOCAL} />
        </>
      )}
      {shot === 'globe' && pOn > 0.01 && (
        <>
          {dashes.map((d, i) => <Route key={i} points={d} color={TL.ICE} width={30} opacity={pOn * 0.9} />)}
          <Route points={real} color={TL.ICE} width={34} glow={0.7} opacity={pOn} />
          <Route points={[dEnd, dEnd.clone().lerp(rEnd, 0.5), rEnd]} color={TL.AMBER} width={30} glow={0.6} opacity={pOn} />
        </>
      )}
      {shot === 'globe' && W.trajs.map((pts, i) => {
        const s = TL.shotStart(i), p = TL.clamp01((t - s) / TL.SHOT_DUR[i]);
        if (t < s) return null;
        return <Route key={'s' + i} points={pts} color={TL.ICE} width={30} glow={0.7} progress={p} head={p < 1 ? 160 : 0} opacity={i < 2 && t > TL.shotStart(i + 1) ? 0.4 : 1 - 0.6 * TL.ramp(t, TL.shotStart(3), TL.shotStart(3) + 1)} />;
      })}
      {shot === 'globe' && W.trajs.map((pts, i) => {
        const land = TL.shotStart(i) + TL.SHOT_DUR[i], k = (t - land) / 0.6;
        return k > 0 && k < 1 ? <sprite key={'f' + i} position={pts[pts.length - 1]} scale={[260 + 400 * k, 260 + 400 * k, 1]} material={W.flash.material} /> : null;
      })}
      {shot === 'globe' && t >= TL.shotStart(3) && lap > 0.004 && <Route points={W.ring} color={TL.ICE} width={110} glow={0.9} progress={lap} head={lap < 1 ? 700 : 0} />}
      {shot === 'crew' && TL.pullBack(t) > 0.5 && <Route points={W.ring} color={TL.ICE} width={90} glow={0.8} opacity={TL.ramp(TL.pullBack(t), 0.5, 0.8)} />}
    </>
  );
};
