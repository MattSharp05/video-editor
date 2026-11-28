// Three worlds in one three.js scene, switched on the hard cuts (timeline.ts CUT_*):
//   GROUND  the Jinshanling ridges and the wall (ground.ts), late-afternoon light, haze
//   ORBIT   the photographic Earth (globe kit), the wall as an amber ribbon, the Space Station on its orbit
//   PENCIL  a pencil on a football pitch (pencil.ts)
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Earth, Stars, Route, Dot, type EarthTex} from './kit/globe';
import * as TL from './timeline';
import * as G from './ground';
import {buildPencil, grassMaterial, patchGrass} from './pencil';
import {applySpec, groundSpec, orbitSpec, pencilSpec, carS, llv} from './cams';

export type GroundData = {dem: Float32Array; tex: THREE.Texture; L: G.WallLine; h: (x: number, z: number) => number};

const lineOf = (pts: TL.LL[], r = 1.0016) => {
  // densify along great circles so the tube hugs the sphere
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = llv(pts[i]).normalize(), b = llv(pts[i + 1]).normalize(), w = a.angleTo(b), n = Math.max(2, Math.ceil(w / 0.004));
    for (let k = 0; k < n; k++) { const f = k / n; out.push(a.clone().multiplyScalar(Math.sin((1 - f) * w) / Math.sin(w)).add(b.clone().multiplyScalar(Math.sin(f * w) / Math.sin(w))).multiplyScalar(r)); }
  }
  out.push(llv(pts[pts.length - 1], r)); return out;
};
const MAIN_PTS = lineOf(TL.MAIN), BRANCH_PTS = TL.BRANCHES.map((b) => lineOf(b));
// the station's orbit: a great circle at 400 km through two points over China (51.6 deg inclination near enough)
const ORBIT_N = new THREE.Vector3().crossVectors(llv({lat: 33, lon: 96}), llv({lat: 45, lon: 122})).normalize();
const ORBIT_A = llv({lat: 33, lon: 96}).normalize();
export const issAt = (t: number) => {
  const k = TL.ramp(t, TL.CUT_STATION - 0.5, TL.CUT_PENCIL + 0.5, (x) => x);
  const ang = 0.13 + 0.1 * k;                     // radians along the orbit from ORBIT_A
  return ORBIT_A.clone().applyAxisAngle(ORBIT_N, ang).multiplyScalar(1 + TL.ISS_ALT);
};
const ORBIT_RING = Array.from({length: 361}, (_, i) => ORBIT_A.clone().applyAxisAngle(ORBIT_N, (i / 360) * Math.PI * 2).multiplyScalar(1 + TL.ISS_ALT));

export const Scene: React.FC<{t: number; fr: number; earth: EarthTex; ground: GroundData}> = ({t, fr, earth, ground}) => {
  const {gl, camera, scene, size} = useThree();
  const shot = TL.shotAt(t);

  const W = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    // ground world
    const gw = new THREE.Group(); scene.add(gw);
    const terr = G.buildTerrain(ground.dem, ground.tex); gw.add(terr.grp);
    const wm = G.wallMaterial();
    const wall = G.buildWall(ground.L, ground.h, wm); gw.add(wall.grp);
    gw.add(G.buildScrub(ground.L, ground.h));
    const car = G.buildCar(); gw.add(car);
    const sky = G.skyDome(new THREE.Color('#E9CFAE'), new THREE.Color('#5E86B8')); gw.add(sky);
    const sun = new THREE.DirectionalLight(new THREE.Color('#FFE1B5'), 3.2); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.4; gw.add(sun, sun.target);
    const hemi = new THREE.HemisphereLight(new THREE.Color('#A9C2E6'), new THREE.Color('#6B5440'), 1.1); gw.add(hemi);
    // pencil world
    const pw = new THREE.Group(); scene.add(pw);
    const pencil = buildPencil(TL.AMBER); pw.add(pencil);
    const field = new THREE.Mesh(new THREE.PlaneGeometry(30000, 30000), patchGrass(grassMaterial())); field.rotation.x = -Math.PI / 2; field.receiveShadow = true; pw.add(field);
    const psky = G.skyDome(new THREE.Color('#DCE6EE'), new THREE.Color('#4F7FBF')); pw.add(psky);
    const psun = new THREE.DirectionalLight(new THREE.Color('#FFF1DC'), 3.0); psun.castShadow = true; psun.shadow.mapSize.set(2048, 2048);
    psun.shadow.bias = -0.0002; pw.add(psun, psun.target);
    const phemi = new THREE.HemisphereLight(new THREE.Color('#BFD4F0'), new THREE.Color('#3E5A2A'), 1.0); pw.add(phemi);
    return {gw, wm, car, sun, pw, psun, pencil};
  }, [gl, scene, ground]);

  const cam = camera as THREE.PerspectiveCamera;
  const aspect = size.width / size.height;
  const isGround = shot === 'hook' || shot === 'thin' || shot === 'end', isOrbit = shot === 'long' || shot === 'station' || shot === 'search', isPencil = shot === 'pencil';
  W.gw.visible = isGround; W.pw.visible = isPencil;
  gl.toneMappingExposure = 1;

  if (isGround) {
    const spec = groundSpec(ground.L, ground.h, t); applySpec(cam, spec, aspect);
    scene.fog = new THREE.FogExp2(new THREE.Color('#D9C6AE'), shot === 'end' ? 0.00012 : 0.00016);
    gl.toneMappingExposure = 0.95;
    W.wm.emissiveIntensity = 0.28 * TL.wallGlow(t);
    // shadow box around what the camera looks at, sized to the shot
    const focus = spec.look.clone(), span = Math.min(900, Math.max(60, spec.pos.distanceTo(spec.look) * 1.3));
    W.sun.target.position.copy(focus); W.sun.position.copy(focus).addScaledVector(G.SUN, 2000);
    const sc = W.sun.shadow.camera as THREE.OrthographicCamera; sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 100; sc.far = 4000; sc.updateProjectionMatrix();
    // car along the walkway
    W.car.visible = shot === 'thin';
    if (shot === 'thin') {
      const a = ground.L.at(carS(ground.L, t)); W.car.position.copy(a.p).add(new THREE.Vector3(0, 0.03, 0));
      W.car.rotation.set(0, Math.atan2(-a.t.z, a.t.x), 0);
      const b = ground.L.at(carS(ground.L, t) + 2 / ground.L.len); W.car.rotateZ(Math.atan2(b.p.y - a.p.y, 2));
    }
  } else scene.fog = null;

  if (isPencil) {
    const spec = pencilSpec(t); applySpec(cam, spec, aspect);
    const d = spec.pos.length();
    scene.fog = new THREE.FogExp2(new THREE.Color('#D8E2E8'), 0.00035);
    const span = Math.max(0.3, d * 0.9);
    W.psun.target.position.set(0, 0, 0); W.psun.position.copy(new THREE.Vector3(-0.4, 0.75, 0.5).normalize().multiplyScalar(span * 4 + 2));
    const sc = W.psun.shadow.camera as THREE.OrthographicCamera; sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 0.01; sc.far = span * 10 + 5; sc.updateProjectionMatrix();
    W.psun.shadow.bias = -0.0002 * Math.max(1, d / 2);
  }

  if (isOrbit) { applySpec(cam, orbitSpec(t), aspect); scene.background = new THREE.Color('#000'); }
  else scene.background = null;

  const lead = TL.AMBER;
  return isOrbit ? (
    <>
      <Stars fr={fr} />
      <Earth tex={earth} day={1.25} night={TL.nightLights(t)} sun={TL.sunLL(t)} air={1.1} melt={0.6} />
      {shot === 'long' && <>
        <Route points={MAIN_PTS} color={lead} width={0.0042} progress={TL.wallDraw(t)} glow={0.9} head={0.05} />
        {BRANCH_PTS.map((b, i) => <Route key={i} points={b} color={lead} width={0.0032} progress={TL.branchDraw(t)} glow={0.8} head={0.035} />)}
      </>}
      {shot === 'station' && <>
        <Route points={ORBIT_RING} color={TL.CYAN} width={0.0016} opacity={0.75} glow={0.5} />
        <Dot at={issAt(t)} size={0.05} cyan />
        <Dot at={issAt(t)} size={0.016} color="#FFFFFF" />
      </>}
    </>
  ) : null;
};
