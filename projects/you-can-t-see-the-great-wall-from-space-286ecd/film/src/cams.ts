// Cameras for both the three.js scene and the 2D overlays (labels, rulers, search ring), so both project alike.
import * as THREE from 'three';
import {Easing} from 'remotion';
import * as TL from './timeline';
import {SUN, WALL_H, type WallLine} from './ground';
import {PENCIL_W} from './pencil';

const D2R = Math.PI / 180;
export const llv = ({lat, lon}: TL.LL, r = 1) => {
  const phi = ((90 - lat) * Math.PI) / 180, theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
};
export type CamSpec = {pos: THREE.Vector3; look: THREE.Vector3; up: THREE.Vector3; fov: number; near: number; far: number};

export const orbitSpec = (t: number): CamSpec => {
  const c = TL.orbitCam(t);
  const T = llv(c.at), n = T.clone().normalize();
  const north = new THREE.Vector3(0, 1, 0).sub(n.clone().multiplyScalar(n.y)).normalize();
  const tl = c.tilt * D2R;
  const pos = T.clone().add(n.clone().multiplyScalar(Math.cos(tl) * c.dist)).add(north.clone().multiplyScalar(-Math.sin(tl) * c.dist));
  // look a little above the target when tilted, so the limb sits in the upper frame
  const look = T.clone().add(north.clone().multiplyScalar(c.dist * 0.12 * Math.sin(tl)));
  return {pos, look, up: north, fov: c.fov, near: 0.002, far: 100};
};

// ground: s along the wall (0..1), the side the sun lights
export const litSide = (L: WallLine, s: number) => (L.at(s).n.dot(SUN) > 0 ? 1 : -1);
export const heroS = (L: WallLine) => 1440 / L.len;          // the fourth watchtower (towers every 420 m from 180 m)
export const carS = (L: WallLine, t: number) => (1075 + 64 * TL.carRun(t)) / L.len;

export const groundSpec = (L: WallLine, h: (x: number, z: number) => number, t: number): CamSpec => {
  const shot = TL.shotAt(t);
  const up = new THREE.Vector3(0, 1, 0);
  const B = TL.BEATS;
  if (shot === 'hook') {
    const sH = heroS(L), a = L.at(sH - 34 / L.len), sg = litSide(L, sH);
    const k = TL.ramp(t, 0.2, TL.CUT_LONG + 0.3, Easing.bezier(0.5, 0, 0.75, 1));
    const p0 = a.p.clone().addScaledVector(a.n, 13 * sg).add(new THREE.Vector3(0, -1.5, 0));
    const p1 = a.p.clone().addScaledVector(a.n, 150 * sg).addScaledVector(a.t, -120).add(new THREE.Vector3(0, 170, 0));
    const pos = p0.lerp(p1, k);
    const look = L.at(sH).p.clone().add(new THREE.Vector3(0, 5, 0)).lerp(L.at(sH + 260 / L.len).p, k);
    return {pos, look, up, fov: 50 + 6 * k, near: 0.3, far: 70000};
  }
  if (shot === 'thin') {
    const sc = carS(L, t), c = L.at(sc), sg = litSide(L, sc);
    const climb = TL.ramp(t, B.made - 0.2, TL.CUT_STATION + 0.2, Easing.bezier(0.55, 0, 0.6, 1));
    const p0 = c.p.clone().addScaledVector(c.n, 15 * sg).addScaledVector(c.t, 12).add(new THREE.Vector3(0, 6.5, 0));
    const p1 = c.p.clone().addScaledVector(c.n, 420 * sg).addScaledVector(c.t, 260).add(new THREE.Vector3(0, 520, 0));
    const pos = p0.lerp(p1, climb * climb);
    const look = c.p.clone().add(new THREE.Vector3(0, 1.2, 0)).addScaledVector(c.t, 2).lerp(L.at(sc - 120 / L.len).p, climb);
    const g = h(pos.x, pos.z) + 2; if (pos.y < g) pos.y = g;
    return {pos, look, up, fov: 46, near: 0.3, far: 70000};
  }
  // end: low at the foot of the hero tower, looking up; a slow push and rise
  const sH = heroS(L) + 0, a = L.at(sH), sg = litSide(L, sH);
  const k = TL.ramp(t, TL.CUT_END, TL.DUR_S, (x) => x);
  const base = a.p.clone().addScaledVector(a.n, (19 - 5 * k) * sg).addScaledVector(a.t, -14 + 3 * k);
  base.y = h(base.x, base.z) + 1.6 + 1.2 * k;
  const look = a.p.clone().add(new THREE.Vector3(0, 7 - WALL_H * 0, 0)).addScaledVector(a.t, 10);
  return {pos: base, look, up, fov: 58, near: 0.3, far: 70000};
};

export const pencilSpec = (t: number): CamSpec => {
  const d = TL.pencilDist(t);
  const el = (34 + 8 * TL.ramp(t, TL.CUT_PENCIL, TL.CUT_SEARCH, (x) => x)) * D2R, az = (-118 + 14 * TL.ramp(t, TL.CUT_PENCIL, TL.CUT_SEARCH, (x) => x)) * D2R;
  const pos = new THREE.Vector3(Math.cos(el) * Math.cos(az) * d, Math.sin(el) * d + PENCIL_W, Math.cos(el) * Math.sin(az) * d);
  return {pos, look: new THREE.Vector3(0, PENCIL_W / 2, 0), up: new THREE.Vector3(0, 1, 0), fov: 40, near: Math.max(0.005, d * 0.02), far: 40000};
};

export const applySpec = (cam: THREE.PerspectiveCamera, c: CamSpec, aspect: number) => {
  cam.fov = c.fov; cam.near = c.near; cam.far = c.far; cam.aspect = aspect;
  cam.position.copy(c.pos); cam.up.copy(c.up); cam.lookAt(c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
};
export const projector = (c: CamSpec, w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(); applySpec(cam, c, w / h);
  return (p: THREE.Vector3) => { const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, front: v.z < 1}; };
};
