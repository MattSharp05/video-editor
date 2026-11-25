// The film: the approved key-frame board (Board.tsx) set in motion. One butter cube on the oak board
// carries every scene; each scene is a function of time that returns the cube's state (cut, halves,
// overlays) and the camera, timed from beats.json (the VO's words). Hard cuts on each line's first word.
// Colour roles as on the board: cyan = the hexagon and its count, white = the corner-to-corner guide,
// magenta = the cube's faces. Units: 1 = 1 cm; the cube's centre rests at (0, H, 0).
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {SANS} from './kit/fonts';
import {Captions} from './kit/captions';
import {Room, ACCENT} from './Scene';
import {half, sectionRing, hexSides, H, R, N_CUT, MIDS, FACES} from './butter';
import {GUIDE, FACE, D, SQ_N, N_W, UP_W, tube, glowMat, lineMat, useMats} from './Board';
import beats from './beats.json';
import words from './words.json';

export const FPS = 30;
const B = beats as Record<string, number>;
export const TOTAL = Math.round(B.total * FPS);
const W = 1080, HGT = 1920;
type V3 = [number, number, number];

// ---------- timing helpers ----------
const cl = (x: number) => Math.min(1, Math.max(0, x));
const sm = (x: number) => { const u = cl(x); return u * u * (3 - 2 * u); };
const eo = (x: number) => 1 - Math.pow(1 - cl(x), 3);
const u = (t: number, a: number, d: number, e = sm) => e((t - a) / d); // eased 0..1 from a over d seconds
const mix = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const bump = (t: number, a: number, rise: number, hold: number, fall: number) => Math.min(u(t, a, rise), 1 - u(t, a + rise + hold, fall));
const v3 = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];
const add = (...vs: V3[]): V3 => vs.reduce((s, v) => [s[0] + v[0], s[1] + v[1], s[2] + v[2]], [0, 0, 0] as V3);
const sc = (v: THREE.Vector3, k: number): V3 => [v.x * k, v.y * k, v.z * k];
const qY = (a: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a, 0));
const Z6 = () => [0, 0, 0, 0, 0, 0];

// Scene starts: cut a beat before each line's first word.
export const CUTS = Array.from({length: 11}, (_, i) => (i === 0 ? 0 : B[`L${i + 1}`] - 0.08));

type St = {
  cam: V3; look: V3; mm: number;
  q: THREE.Quaternion; lift: number;
  cut: 'none' | 'square' | 'hex'; cheese?: boolean;
  slide: V3; tip: V3; top: boolean;
  wire?: {from: V3; to: V3; o: number};
  trace: number[]; traceO: number;
  nums: number[]; ticks: number[]; dots: number[];
  diagA: number; diagB: number; diagLine: number;
  blade: number | null; right: number;
  ring: number; faces: number[]; bright: number[];
  title: [string, string?]; title2White?: boolean; titleAt: number; pause?: number;
};

const base = (): St => ({
  cam: [-8, 25, 26], look: [0, 4, 0], mm: 48, q: qY(D), lift: 0, cut: 'none', slide: [0, 0, 0], tip: [0, 0, 0], top: true,
  trace: Z6(), traceO: 0, nums: Z6(), ticks: Z6(), dots: Z6(), diagA: 0, diagB: 0, diagLine: 0, blade: null, right: 0,
  ring: 0, faces: Z6(), bright: Z6(), title: [''], titleAt: 0,
});

// cube-local directions of the slanted (corner-to-corner) cut
const A_LOC = new THREE.Vector3(1, -1, 0).normalize(); // along the cut, level with the board after the turn
const B_LOC = new THREE.Vector3().crossVectors(N_CUT, A_LOC).normalize(); // in the cut, pointing up
const toW = (p: THREE.Vector3, rotY = D) => v3(p.clone().applyEuler(new THREE.Euler(0, rotY, 0)).add(new THREE.Vector3(0, H, 0)));
// a taut wire lying in the slanted cut plane, k cm from the centre (k > 0 above, k < 0 below)
const slantWire = (k: number, o: number) => ({
  from: toW(B_LOC.clone().multiplyScalar(k).addScaledVector(A_LOC, -7)),
  to: toW(B_LOC.clone().multiplyScalar(k).addScaledVector(A_LOC, 7)), o,
});
const HEX_SLIDE = (k: number): V3 => add(sc(UP_W, 3.4 * k), sc(N_W, 0.35 * k * k));
const HEX_AWAY: V3 = add(sc(UP_W, 15), sc(N_W, 4));
const HEX_TIP: V3 = [0.06, 0.08, -0.05];
// count k (1..6) goes clockwise from the top: side index on the hexagon
const SIDE_OF = (k: number) => (9 - k) % 6;

// s10: the cube turns to show each face in turn; faces in hexagon order, each turned to face P.
const S10_CAM: V3 = [-5, 20, 24], S10_LIFT = 1.8;
const S10_Q = (() => {
  const centre = new THREE.Vector3(0, H + S10_LIFT, 0);
  const P = new THREE.Vector3(...S10_CAM).sub(centre).normalize().add(new THREE.Vector3(0.38, 0.32, 0)).normalize();
  const qs: THREE.Quaternion[] = [qY(D + 0.5)];
  FACES.forEach((f) => {
    const prev = qs[qs.length - 1];
    const cur = f.clone().applyQuaternion(prev);
    qs.push(new THREE.Quaternion().setFromUnitVectors(cur, P).multiply(prev));
  });
  return qs; // qs[0] = start, qs[i + 1] = face i shown
})();

const state = (t: number): St => {
  const s = base();
  const sc_ = CUTS.filter((c) => t >= c).length - 1; // scene index 0..10
  const L = (i: number) => B[`L${i}`];
  switch (sc_) {
    case 0: { // l1: a wire drops straight down; the front half tips onto its back: a square face
      s.cut = 'square';
      const w1 = Math.min(1.0, B.squares - 0.5);
      const y = interpolate(t, [0, w1], [6.6, 0.08], {extrapolateRight: 'clamp', easing: (x) => x * (2 - x)});
      s.wire = {from: [-30, y, -30], to: [30, y, 30], o: 1};
      const k = u(t, w1 + 0.12, 0.95);
      s.slide = add(sc(new THREE.Vector3(-4.2, 0, 6.4), k), [0, 2.6 * Math.sin(Math.PI * k), 0]);
      s.tip = [(Math.PI / 2) * k, 0, 0.25 * k];
      const c = u(t, 0, CUTS[1]);
      s.cam = mix([-7.5, 26.5, 33], [-6, 24, 30], c); s.look = mix([-0.5, 3.2, 1.2], [-1.5, 2.0, 3.0], c); s.mm = 44;
      s.title = ['ONE CUT.', 'WHAT SHAPE?']; s.title2White = true; s.titleAt = -1;
      break;
    }
    case 1: { // l2: cut again on the slant; the top half slides up the cut: six sides
      s.cut = 'hex';
      const a = B.straight - 0.1;
      const k = interpolate(t, [a, a + 0.75], [6.5, -6.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      s.wire = slantWire(k, 1 - u(t, a + 0.55, 0.25));
      const sl = u(t, Math.max(a + 0.8, B.perfect - 0.3), 1.0);
      s.slide = HEX_SLIDE(sl); s.tip = sc(new THREE.Vector3(...HEX_TIP), sl);
      const c = u(t, CUTS[1], CUTS[2] - CUTS[1]);
      s.cam = mix([-9.5, 27, 29.5], [-8, 25, 26], c); s.look = mix([0, 4.0, 0], [0, 5.0, 0], c); s.mm = 47 + c;
      s.title = ['A', 'HEXAGON?']; s.titleAt = B.hexagon - 0.15;
      break;
    }
    case 2: { // l3: the top half leaves; the face is traced and counted 1..6
      s.cut = 'hex';
      const away = u(t, CUTS[2], 0.6);
      s.slide = mix(HEX_SLIDE(1), HEX_AWAY, away); s.tip = sc(new THREE.Vector3(...HEX_TIP), 1 + away);
      s.top = away < 1;
      s.traceO = 1;
      for (let k = 1; k <= 6; k++) {
        const at = B[`n${k}`];
        s.trace[SIDE_OF(k)] = u(t, at - 0.06, 0.26, eo);
        s.nums[SIDE_OF(k)] = cl((t - at + 0.04) / 0.08);
      }
      const c = u(t, CUTS[2], 0.9);
      s.cam = mix(mix([-8, 25, 26], [-4, 24, 19], c), [-3.4, 23.4, 18], u(t, CUTS[2] + 0.9, CUTS[3] - CUTS[2])) as V3;
      s.look = mix([0, 5.0, 0], [0, 2.7, 0.6], c); s.mm = 48 - 3 * c;
      s.title = ['COUNT', 'THE SIDES']; s.titleAt = CUTS[2] + 0.05;
      break;
    }
    case 3: { // l4: the halves close; the whole cube turns while the viewer guesses
      const close = u(t, CUTS[3], 0.95);
      const turnAt = CUTS[3] + 1.05;
      s.cut = close < 1 ? 'hex' : 'none';
      s.slide = mix(HEX_AWAY, [0, 0, 0], close); s.tip = sc(new THREE.Vector3(...HEX_TIP), 2 * (1 - close));
      s.traceO = 1 - u(t, CUTS[3], 0.35); s.trace = [1, 1, 1, 1, 1, 1];
      s.q = qY(D + 0.32 * Math.max(0, t - turnAt));
      const c = u(t, CUTS[3], CUTS[4] - CUTS[3]);
      s.cam = mix([-6, 23, 24], [-8.5, 20.5, 29], c); s.look = mix([0, 3.0, 0.3], [0, 3.6, 0], c); s.mm = 46;
      s.title = ['PAUSE', 'AND GUESS']; s.title2White = true; s.titleAt = B.pause - 0.1; s.pause = B.pause;
      break;
    }
    case 4: { // l5: one corner, then the far corner; a line runs through the butter between them
      s.diagA = u(t, B.corner1 - 0.05, 0.3, eo); s.diagB = u(t, B.farthest - 0.05, 0.3, eo);
      s.diagLine = u(t, B.farthest + 0.15, 0.75, eo);
      const c = u(t, CUTS[4], CUTS[5] - CUTS[4]);
      s.cam = mix([25, 10.5, 11.5], [23, 12, 15], c); s.look = [0, 2.6, 0]; s.mm = 50;
      s.title = ['CORNER', 'TO CORNER']; s.title2White = true; s.titleAt = CUTS[4] + 0.05;
      break;
    }
    case 5: { // l6: the knife comes down square to that line and stops at the middle
      s.diagA = 1; s.diagB = 1; s.diagLine = 1;
      s.blade = interpolate(t, [B.knife - 0.35, B.middle6 + 0.05], [10, -0.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 2)});
      s.right = u(t, B.middle6 + 0.05, 0.3, eo);
      const c = u(t, CUTS[5], CUTS[6] - CUTS[5]);
      s.cam = mix([22.5, 16, 17], [20.5, 17.5, 20], c); s.look = [0, 3.4, 0]; s.mm = 46;
      s.title = ['SQUARE', 'TO THE LINE']; s.title2White = true; s.titleAt = CUTS[5] + 0.05;
      break;
    }
    case 6: { // l7: the cut passes the middle of six edges: a dot lights on each
      const a = B.crosses, e = Math.max(B.edges_end, a + 1.2);
      for (let i = 0; i < 6; i++) s.dots[i] = u(t, a + (i * (e - a)) / 6, 0.2, eo);
      const ang = interpolate(t, [CUTS[6], CUTS[7]], [0.18, -0.12]);
      const p = new THREE.Vector3(-5, 24, 22).applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
      s.cam = v3(p); s.look = [0, 2.6, 0]; s.mm = 55;
      s.title = ['6 EDGE', 'MIDDLES']; s.titleAt = CUTS[6] + 0.05;
      break;
    }
    case 7: { // l8: the cut face again; the dots join into the hexagon; equal ticks on every side
      s.cut = 'hex'; s.top = false; s.traceO = 1;
      s.dots = [1, 1, 1, 1, 1, 1];
      const dr = u(t, CUTS[7] + 0.1, 0.7, eo); s.trace = [dr, dr, dr, dr, dr, dr];
      for (let i = 0; i < 6; i++) s.ticks[i] = u(t, B.same + i * 0.12, 0.18, eo);
      const c = u(t, CUTS[7], CUTS[8] - CUTS[7]);
      s.cam = mix([-4.5, 24.5, 20], [-3.6, 23.4, 18], c); s.look = [0, 2.7, 0.6]; s.mm = 45;
      s.title = ['6 EQUAL', 'SIDES']; s.titleAt = CUTS[7] + 0.05;
      break;
    }
    case 8: { // l9: pull back to the whole cube with the hexagon drawn on it; the faces ripple
      const c = u(t, CUTS[8], 1.4);
      s.cam = mix([-4.5, 23, 19.5], [-10, 30, 40], c); s.look = mix([0, 2.6, 0.4], [0, 3.0, 0], c); s.mm = 50 - 4 * c;
      s.q = qY(D + 0.5 * u(t, CUTS[8], CUTS[9] - CUTS[8], (x) => x));
      s.ring = 0.9;
      for (let i = 0; i < 6; i++) s.faces[i] = 0.6 * bump(t, B.most + i * 0.13, 0.15, 0.1, 0.35);
      s.title = ['NEVER', 'MORE THAN 6']; s.titleAt = B.six9 - 0.1;
      break;
    }
    case 9: { // l10: the cube rises and turns each face to us; each face holds one side of the hexagon
      s.lift = S10_LIFT * u(t, CUTS[9], 0.6);
      s.ring = 0.55;
      const a = Math.max(B.six_faces, CUTS[9] + 0.5), e = CUTS[10] - 0.35, step = (e - a) / 6;
      let q = S10_Q[0].clone();
      for (let i = 0; i < 6; i++) {
        const ti = a + i * step;
        const k = u(t, ti - 0.42, 0.42);
        if (k > 0) q = S10_Q[i].clone().slerp(S10_Q[i + 1], k);
        const lit = bump(t, ti - 0.05, 0.15, step - 0.35, 0.25);
        s.faces[i] = 0.72 * lit; s.bright[i] = lit;
      }
      s.q = q;
      s.cam = S10_CAM; s.look = [0, 2.4 + S10_LIFT * 0.8, 0]; s.mm = 52;
      s.title = ['6 FACES', '= 6 SIDES']; s.titleAt = CUTS[9] + 0.05;
      break;
    }
    default: { // l11: the same cut in a cube of cheddar
      s.cut = 'hex'; s.cheese = true;
      const a = CUTS[10] + 0.1;
      const k = interpolate(t, [a, a + 0.7], [6.5, -6.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      s.wire = slantWire(k, 1 - u(t, a + 0.5, 0.25));
      const sl = u(t, a + 0.75, 0.9);
      s.slide = add(sc(UP_W, 4.6 * sl), sc(N_W, 0.45 * sl * sl)); s.tip = [0.1 * sl, 0.12 * sl, -0.08 * sl];
      s.traceO = 1; const dr = u(t, a + 1.35, 0.6, eo); s.trace = [dr, dr, dr, dr, dr, dr];
      const c = u(t, CUTS[10], B.total - CUTS[10]);
      s.cam = mix([-9.5, 27, 29.5], [-7.6, 24.6, 25], c); s.look = mix([0, 4.4, 0], [0, 5.2, 0], c); s.mm = 48;
      s.title = ['TRY IT', 'ON CHEESE']; s.titleAt = CUTS[10] + 0.05;
    }
  }
  return s;
};

// ---------- geometry built once per page ----------
const GEO: Record<string, {bottom: {rind: THREE.BufferGeometry; cut: THREE.BufferGeometry}; top: {rind: THREE.BufferGeometry; cut: THREE.BufferGeometry}}> = {};
const halves = (cut: 'square' | 'hex') => {
  if (!GEO[cut]) { const n = cut === 'square' ? SQ_N : N_CUT; GEO[cut] = {bottom: half(-1, 26000, n), top: half(1, 26000, n)}; }
  return GEO[cut];
};
let WHOLE: THREE.BufferGeometry | null = null;
const whole = () => (WHOLE ??= new RoundedBoxGeometry(2 * H, 2 * H, 2 * H, 6, R));
let FACE_SIDES: THREE.Vector3[][] | null = null; // the cut face's outline split into its six sides
const faceSides = () => {
  if (FACE_SIDES) return FACE_SIDES;
  const {pts} = sectionRing(720);
  const ring = pts.map((p) => p.clone().multiplyScalar(0.985).addScaledVector(N_CUT, -0.012));
  const sides: THREE.Vector3[][] = FACES.map(() => []);
  pts.forEach((p, j) => { let b = 0; FACES.forEach((f, i) => { if (p.dot(f) > p.dot(FACES[b])) b = i; }); sides[b].push(ring[j]); });
  FACE_SIDES = sides.map((s, i) => s.sort((p, q) => p.distanceTo(MIDS[i]) - q.distanceTo(MIDS[i])));
  return FACE_SIDES;
};
let SURF_SIDES: THREE.Vector3[][] | null = null;
const surfSides = () => (SURF_SIDES ??= hexSides(720).map((side) => side.map((p) => p.clone().multiplyScalar(1.012))));
const partial = (pts: THREE.Vector3[], k: number) => pts.slice(0, Math.max(2, Math.round(pts.length * k)));

const Cam: React.FC<{s: St}> = ({s}) => {
  const cam = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  cam.position.set(...s.cam); cam.filmGauge = 36; cam.setFocalLength(s.mm); cam.near = 1; cam.far = 400;
  cam.lookAt(...s.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
};
const camOfSt = (s: St) => {
  const c = new THREE.PerspectiveCamera(40, W / HGT, 1, 400);
  c.position.set(...s.cam); c.filmGauge = 36; c.setFocalLength(s.mm); c.lookAt(...s.look);
  c.updateProjectionMatrix(); c.updateMatrixWorld();
  return c;
};

const Cube: React.FC<{s: St}> = ({s}) => {
  const mats = useMats(!!s.cheese);
  const steel = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#d8dde2', metalness: 1, roughness: 0.22, transparent: true}), []);
  const centre = new THREE.Vector3(0, H + s.lift, 0);
  const visible = (f: THREE.Vector3) => f.clone().applyQuaternion(s.q).dot(new THREE.Vector3(...s.cam).sub(centre)) > 0;
  const g = s.cut !== 'none' ? halves(s.cut) : null;
  const fs = faceSides(), ss = surfSides();
  steel.opacity = s.wire?.o ?? 1;
  return (
    <>
      <group position={centre} quaternion={s.q}>
        {!g && <mesh geometry={whole()} material={mats.rind} castShadow receiveShadow />}
        {g && (
          <>
            <mesh geometry={g.bottom.rind} material={mats.rind} castShadow receiveShadow />
            <mesh geometry={g.bottom.cut} material={mats.cut} castShadow receiveShadow />
          </>
        )}
        {/* the hexagon on the cut face, side by side */}
        {s.traceO > 0 && fs.map((side, i) => s.trace[i] > 0 && (
          <group key={i}>
            <mesh geometry={tube(partial(side, s.trace[i]), 0.05)} material={lineMat(ACCENT, 1.6, true, s.traceO)} />
            <mesh geometry={tube(partial(side, s.trace[i]), 0.13)} material={glowMat(ACCENT, 0.14 * s.traceO)} />
          </group>
        ))}
        {/* equal-side ticks */}
        {MIDS.map((m, i) => {
          if (!s.ticks[i]) return null;
          const b = MIDS[(i + 1) % 6];
          const mid = m.clone().add(b).multiplyScalar(0.5).multiplyScalar(0.985).addScaledVector(N_CUT, -0.012);
          const across = new THREE.Vector3().crossVectors(N_CUT, b.clone().sub(m).normalize()).normalize();
          const L = 0.34 * s.ticks[i];
          return <mesh key={i} geometry={tube([mid.clone().addScaledVector(across, -L), mid.clone().addScaledVector(across, L)], 0.065)} material={lineMat(ACCENT, 1.6)} />;
        })}
        {/* edge-middle dots */}
        {MIDS.map((m, i) => {
          const o = s.dots[i];
          if (!o) return null;
          const p = m.clone().normalize().multiplyScalar(m.length() - R * (Math.SQRT2 - 1) + 0.02);
          const p2 = g ? p.clone().multiplyScalar(0.985).addScaledVector(N_CUT, -0.012) : p;
          const k = 0.4 + 0.6 * o + 0.35 * Math.sin(Math.PI * o);
          return (
            <group key={i} position={p2} scale={k}>
              <mesh material={lineMat('#ffffff', 1.4)}><sphereGeometry args={[0.13, 20, 12]} /></mesh>
              <mesh material={glowMat(ACCENT, 0.55 * o)}><sphereGeometry args={[0.26, 20, 12]} /></mesh>
              <mesh material={glowMat(ACCENT, 0.18 * o)}><sphereGeometry args={[0.5, 20, 12]} /></mesh>
            </group>
          );
        })}
        {/* the hexagon drawn on the whole cube: sides on faces turned to us full, the rest seen through */}
        {s.ring > 0 && ss.map((side, i) => {
          const front = visible(FACES[i]);
          const hot = s.bright[i];
          const op = Math.min(1, (s.ring + (1 - s.ring) * hot) * (front ? 1 : 0.3 + 0.7 * hot));
          return (
            <group key={i}>
              <mesh geometry={tube(side, 0.05 + 0.04 * hot)} material={lineMat(ACCENT, 1.4 + 0.6 * hot, front || hot > 0.5, op)} renderOrder={front ? 0 : 5} />
              {hot > 0 && <mesh geometry={tube(side, 0.24)} material={glowMat(ACCENT, 0.35 * hot, front)} />}
            </group>
          );
        })}
        {/* face tints */}
        {s.faces.map((o, i) => {
          if (o <= 0.001) return null;
          const f = FACES[i];
          const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), f);
          return (
            <mesh key={i} position={f.clone().multiplyScalar(H + 0.015)} quaternion={q} renderOrder={2}
              material={new THREE.MeshBasicMaterial({color: FACE, transparent: true, opacity: o, depthWrite: false, toneMapped: false})}>
              <planeGeometry args={[2 * (H - R), 2 * (H - R)]} />
            </mesh>
          );
        })}
        {/* corner glows and the corner-to-corner line, seen through the butter */}
        {[1, -1].map((k) => {
          const o = k === 1 ? s.diagA : s.diagB;
          if (!o) return null;
          return (
            <group key={k} position={[k * (H - 0.08), k * (H - 0.08), k * (H - 0.08)]} scale={0.3 + 0.7 * o + 0.4 * Math.sin(Math.PI * o)}>
              <mesh material={lineMat(GUIDE, 1.2, false)} renderOrder={6}><sphereGeometry args={[0.16, 20, 12]} /></mesh>
              <mesh material={glowMat(GUIDE, 0.45 * o, false)} renderOrder={6}><sphereGeometry args={[0.42, 20, 12]} /></mesh>
              <mesh material={glowMat(GUIDE, 0.15 * o, false)} renderOrder={6}><sphereGeometry args={[0.9, 20, 12]} /></mesh>
            </group>
          );
        })}
        {s.diagLine > 0 && (() => {
          const a = new THREE.Vector3(H, H, H).multiplyScalar(0.97), b = a.clone().lerp(a.clone().negate(), s.diagLine);
          return (
            <>
              <mesh geometry={tube([a, b], 0.035)} material={lineMat(GUIDE, 1.1, false, 0.85)} renderOrder={6} />
              <mesh geometry={tube([a, b], 0.12)} material={glowMat(GUIDE, 0.12, false)} renderOrder={6} />
            </>
          );
        })()}
        {s.right > 0 && <RightAngle k={0.95 * s.right} />}
      </group>

      {/* the moving half */}
      {g && s.top && (
        <group position={centre.clone().add(new THREE.Vector3(...s.slide))} quaternion={s.q}>
          <group rotation={s.tip}>
            <mesh geometry={g.top.rind} material={mats.rind} castShadow receiveShadow />
            <mesh geometry={g.top.cut} material={mats.cut} castShadow receiveShadow />
          </group>
        </group>
      )}
      {s.wire && s.wire.o > 0.01 && (
        <mesh geometry={tube([new THREE.Vector3(...s.wire.from), new THREE.Vector3(...s.wire.to)], 0.03)} material={steel} castShadow />
      )}
      {s.blade !== null && <Blade off={s.blade} />}
    </>
  );
};

// A chef's knife held flat across the corner-to-corner line; `off` = cm of the edge above the centre.
const Blade: React.FC<{off: number}> = ({off}) => {
  const m = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-6, 0); shape.lineTo(5, 0); shape.quadraticCurveTo(8.5, 0.6, 9.6, 3.9);
    shape.lineTo(-6, 3.9); shape.lineTo(-6, 0);
    const geo = new THREE.ExtrudeGeometry(shape, {depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1});
    geo.translate(0, 0, -0.04);
    const steel = new THREE.MeshPhysicalMaterial({color: '#c9ced4', metalness: 1, roughness: 0.3});
    const handle = new THREE.MeshPhysicalMaterial({color: '#1d1a18', roughness: 0.55});
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), UP_W, N_W));
    return {geo, steel, handle, q};
  }, []);
  const pos = new THREE.Vector3(-1.6, H, 0).addScaledVector(UP_W, off);
  return (
    <group position={pos} quaternion={m.q}>
      <mesh geometry={m.geo} material={m.steel} castShadow />
      <mesh position={[-9.4, 2.2, 0]} material={m.handle} castShadow><boxGeometry args={[7, 2.5, 1.4]} /></mesh>
    </group>
  );
};

// The right-angle mark where the line meets the knife's plane (enlarged from the board's).
const RightAngle: React.FC<{k: number}> = ({k}) => {
  const d = N_CUT.clone(), a = new THREE.Vector3(1, -1, 0).normalize();
  const pts = [a.clone().multiplyScalar(k), a.clone().multiplyScalar(k).addScaledVector(d, k), d.clone().multiplyScalar(k)];
  return (
    <>
      <mesh geometry={tube(pts, 0.05)} material={lineMat(GUIDE, 1.3, false)} renderOrder={7} />
      <mesh geometry={tube(pts, 0.14)} material={glowMat(GUIDE, 0.18, false)} renderOrder={7} />
    </>
  );
};

const Numbers: React.FC<{s: St}> = ({s}) => {
  const cam = camOfSt(s);
  return (
    <>
      {MIDS.map((m, i) => {
        const o = s.nums[i];
        if (!o) return null;
        const mid = m.clone().add(MIDS[(i + 1) % 6]).multiplyScalar(0.5);
        const p = mid.multiplyScalar(1.5).addScaledVector(N_CUT, -0.05).applyQuaternion(s.q).add(new THREE.Vector3(0, H + s.lift, 0)).project(cam);
        const x = ((p.x + 1) / 2) * W, y = ((1 - p.y) / 2) * HGT;
        const k = 0.6 + 0.4 * o + 0.25 * Math.sin(Math.PI * o);
        return (
          <div key={i} style={{position: 'absolute', left: x - 50, top: y - 60, width: 100, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 96,
            color: ACCENT, opacity: o, transform: `scale(${k})`, textShadow: '0 3px 18px rgba(0,0,0,0.7)'}}>{((2 - i + 6) % 6) + 1}</div>
        );
      })}
    </>
  );
};

const Title: React.FC<{s: St; t: number; fr: number}> = ({s, t, fr}) => {
  if (!s.title[0] || t < s.titleAt) return null;
  const p = s.titleAt < 0 ? 1 : spring({frame: fr - Math.round(s.titleAt * FPS), fps: FPS, config: {damping: 14, stiffness: 190, mass: 0.7}});
  const st = (c: string): React.CSSProperties => ({fontSize: 104, fontWeight: 800, color: c, letterSpacing: -1, lineHeight: 1.03, textShadow: '0 4px 30px rgba(0,0,0,0.6)'});
  const pulse = s.pause !== undefined ? 0.75 + 0.25 * Math.cos((t - s.pause) * Math.PI * 2 * 0.9) : 1;
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 230, fontFamily: SANS, textAlign: 'center', opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * -26}px) scale(${0.94 + 0.06 * p})`}}>
      <div style={st('#fff')}>{s.title[0]}</div>
      {s.title[1] && <div style={st(s.title2White ? '#fff' : ACCENT)}>{s.title[1]}</div>}
      {s.pause !== undefined && <div style={{marginTop: 30, display: 'flex', gap: 26, opacity: pulse}}>{[0, 1].map((k) => <div key={k} style={{width: 34, height: 120, borderRadius: 8, background: '#fff', boxShadow: '0 4px 30px rgba(0,0,0,0.6)'}} />)}</div>}
    </AbsoluteFill>
  );
};

// Hand-written sense units; each must match the transcript word for word (checked at load).
const LINES = [
  'Most people think a cube cuts into [squares.|#ffffff]',
  'But one straight cut can make a perfect [hexagon.]',
  'Count the sides: [one,] [two,] [three,] [four,] [five,] [six.]',
  'So where does the knife go?', 'Pause and guess.',
  'Pick one [corner|#ffffff] of the cube,', 'and the corner [farthest|#ffffff] from it.',
  'Hold the knife flat across that line,', 'right in the [middle.|#ffffff]',
  'The cut crosses the [middle] of [six] [edges.]',
  'So all six sides come out the [same] [length.]',
  'And [six] is the most a cut can ever have.',
  'A cube has [six] [faces,|#ff4fb0]', 'and the cut crosses each face [once] at most.',
  'Try it on a block of [cheese.]',
];

export const Film: React.FC<{captions?: boolean; audio?: boolean}> = ({captions = true, audio = false}) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const s = state(t);
  return (
    <AbsoluteFill style={{background: '#16120f'}}>
      <Finish fr={fr} bloom={0}>
        <ThreeCanvas width={W} height={HGT} dpr={1} shadows="percentage"
          onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 0.85; }}>
          <Cam s={s} />
          <Room />
          <Cube s={s} />
        </ThreeCanvas>
      </Finish>
      <Numbers s={s} />
      <Title s={s} t={t} fr={fr} />
      {captions && <Captions t={t} words={words} lines={LINES} accent={ACCENT} font={SANS} place="bottom" top={1280} size={60} />}
      {audio && <Audio src={staticFile('mix.wav')} />}
    </AbsoluteFill>
  );
};
