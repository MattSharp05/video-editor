// Black hole 01: one continuous shot. A toy astronaut ("you") drifts near a small black hole -> the hole's past (a giant
// star swells and caves in) -> the edge (a rock and a fan of light fall in) -> the river of space (light too slow to
// swim out) -> the black shadow -> the glowing gas down the drain, white-hot -> you fall feet first and stretch into a
// noodle -> back to your friend's ship: through the friend's eyes you slow, stop, redden and fade -> dive back to your
// own watch, ticking, as you fall in -> the stretch zone outside a small hole's edge -> the hole grows giant and swallows
// the zone; a second you crosses whole -> no way back.
// Every time is a beat from the voice (beats.json); every pose is a pure function of t.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {BlackHole} from './bh';
import {Arrow, Astronaut, BASE, EDGE, glowSprite, Gas, Rays, River, Rock, Ship, Star, Stretch, Zone} from './world';
import words from './words.json';
import B from './beats.json';

export const FPS = 30;
export const DUR = Math.ceil(B.total * FPS);
const ACC = '#ffc65a';
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sm = (x: number) => x * x * (3 - 2 * x);
const rise = (t: number, a: number, d = 0.4) => sm(Math.min(1, Math.max(0, (t - a) / d)));
const win = (t: number, a: number, b: number, f = 0.3) => Math.min(rise(t, a, f), 1 - rise(t, b - f, f));

// ---------- camera: monotone cubic (PCHIP) through keys, so it never stops at a key or overshoots ----------
type K = {t: number; pos: THREE.Vector3; look: THREE.Vector3; fov: number};
const pchip = (ts: number[], ys: number[], t: number) => {
  const n = ts.length;
  if (t <= ts[0]) return ys[0];
  if (t >= ts[n - 1]) return ys[n - 1];
  let i = 0;
  while (t > ts[i + 1]) i++;
  const h = (k: number) => ts[k + 1] - ts[k], d = (k: number) => (ys[k + 1] - ys[k]) / h(k);
  const m = (k: number) => {
    if (k === 0 || k === n - 1) return 0;
    const a = d(k - 1), b = d(k);
    if (a * b <= 0) return 0;
    const w1 = 2 * h(k) + h(k - 1), w2 = h(k) + 2 * h(k - 1);
    return (w1 + w2) / (w1 / a + w2 / b);
  };
  const u = (t - ts[i]) / h(i), u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h(i) * m(i) + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h(i) * m(i + 1);
};
const track = (keys: K[]) => {
  const ts = keys.map((k) => k.t);
  const ch = (f: (k: K) => number) => keys.map(f);
  const px = ch((k) => k.pos.x), py = ch((k) => k.pos.y), pz = ch((k) => k.pos.z);
  const lx = ch((k) => k.look.x), ly = ch((k) => k.look.y), lz = ch((k) => k.look.z), fv = ch((k) => Math.log(k.fov));
  return (t: number) => ({
    pos: V(pchip(ts, px, t), pchip(ts, py, t), pchip(ts, pz, t)),
    look: V(pchip(ts, lx, t), pchip(ts, ly, t), pchip(ts, lz, t)), fov: Math.exp(pchip(ts, fv, t)),
  });
};

// ---------- the world's layout ----------
const O = V(0, 0, 0);
const SHIP = V(4.5, 6.2, 17.5);
// your path toward the hole (u = 0 start .. 1 inside), and how far along it you are at t
const PATH = new THREE.CatmullRomCurve3([V(7.6, 2.5, 9.4), V(6.3, 2.0, 7.7), V(4.6, 1.35, 5.4), V(2.8, 0.7, 3.0), V(1.4, 0.3, 1.4), V(0.4, 0.05, 0.4)]);
const U_FREEZE = 0.74;                        // where your friend sees you stop (just outside the edge)
const uAt = (t: number) => {
  if (t < B.fall) return 0.12 * (t / B.fall);
  if (t < B.friend) return 0.12 + 0.36 * sm(Math.min(1, (t - B.fall) / (B.friend - B.fall)));
  if (t < B.watch) return U_FREEZE - (U_FREEZE - 0.48) * Math.exp(-(t - B.friend) * 0.9); // seen from far: slower and slower
  return Math.min(1, U_FREEZE + 0.34 * sm(Math.min(1, (t - B.watch - 0.6) / (B.fallin + 0.9 - B.watch - 0.6))));
};
const youAt = (t: number) => PATH.getPointAt(uAt(t));
const A0 = PATH.getPointAt(0.0), AF = PATH.getPointAt(0.3), AS = PATH.getPointAt(0.48), AZ = PATH.getPointAt(U_FREEZE);
const OUT = (p: THREE.Vector3) => p.clone().normalize();               // away from the hole
const SIDE = (p: THREE.Vector3) => OUT(p).cross(V(0, 1, 0)).normalize(); // sideways, across the fall
const add = (...vs: THREE.Vector3[]) => vs.reduce((a, b) => a.clone().add(b), V(0, 0, 0));
const sc = (v: THREE.Vector3, k: number) => v.clone().multiplyScalar(k);
// the hole grows from small to giant (lines 14-15)
const holeScaleAt = (t: number) => Math.exp(Math.log(12) * rise(t, B.giant - 0.4, 2.6));
const G = 12; // final giant scale

// a camera key placed from where you are at time kt: out (away from the hole), side, up; look partway to the hole
const ys = (kt: number, out: number, side: number, up: number, lerp: number, fov: number): K => {
  const y = youAt(kt);
  return {t: kt, pos: add(y, sc(OUT(y), out), sc(SIDE(y), side), V(0, up, 0)), look: y.clone().lerp(O, lerp), fov};
};
const SD = AZ.clone().sub(SHIP).normalize(), SS = SD.clone().cross(V(0, 1, 0)).normalize(); // the friend's line of sight
const CAM = track([
  {t: 0, pos: add(A0, sc(OUT(A0), 2.9), sc(SIDE(A0), 0.35), V(0, 0.75, 0)), look: A0.clone().lerp(O, 0.27), fov: 48},
  {t: B.word, pos: add(A0, sc(OUT(A0), 2.5), sc(SIDE(A0), 0.5), V(0, 0.5, 0)), look: A0.clone().lerp(O, 0.22), fov: 46},
  {t: B.you + 0.7, pos: add(PATH.getPointAt(0.05), sc(OUT(A0), 2.1), sc(SIDE(A0), 0.3), V(0, 0.2, 0)), look: add(PATH.getPointAt(0.05), V(0, -0.05, 0)), fov: 40},
  {t: B.star, pos: V(13, 8, 38), look: V(0, 0.5, 0), fov: 44},
  {t: B.tiny + 0.6, pos: V(10.5, 6.2, 32), look: V(0, 0, 0), fov: 42},
  {t: B.edge, pos: V(7.5, 3.6, 18), look: V(0, 0, 0), fov: 42},
  {t: B.light - 0.4, pos: add(AF, sc(OUT(AF), 3.4), sc(SIDE(AF), 1.4), V(0, 1.6, 0)), look: AF.clone().lerp(O, 0.7), fov: 50},
  {t: B.faster + 0.4, pos: V(4.2, 3.0, 9.5), look: V(0, 0, 0), fov: 50},
  {t: B.black, pos: V(3.0, 2.0, 6.6), look: V(0, 0, 0), fov: 52},
  {t: B.drain, pos: V(4.6, 9.5, 9.8), look: V(0, -0.5, 0), fov: 52},
  {t: B.millions + 0.3, pos: V(8.4, 1.7, 4.2), look: V(0, 0, 0.6), fov: 50},
  ys(B.fall + 0.4, 2.5, 0.6, 0.8, 0.15, 46),
  ys(B.feet + 0.6, 1.7, -3.2, 0.6, 0.06, 44),
  ys(B.stretch + 0.6, 2.4, -3.4, 1.2, 0.08, 46),
  {t: B.friend + 0.9, pos: add(SHIP, sc(SD, -6.0), V(0, 1.9, 0), sc(SS, 1.5)), look: add(SHIP, sc(SD, 6), V(0, -0.3, 0)), fov: 46},
  {t: B.slow + 0.5, pos: add(SHIP, sc(SD, -1.4), V(0, 0.6, 0), sc(SS, 0.4)), look: AZ.clone(), fov: 30},
  {t: B.red, pos: add(SHIP, sc(SD, -1.2), V(0, 0.55, 0), sc(SS, 0.35)), look: AZ.clone(), fov: 20},
  {t: B.fade + 0.6, pos: add(SHIP, sc(SD, -1.2), V(0, 0.55, 0), sc(SS, 0.35)), look: AZ.clone(), fov: 19},
  ys(B.always - 0.1, 1.5, -0.9, 0.7, 0.1, 42),
  ys(B.fallin + 0.3, 2.4, -1.2, 0.9, 0.5, 46),
  {t: B.small + 0.6, pos: V(9, 7.5, 21), look: V(0, 0, 0), fov: 44},
  {t: B.giant + 2.3, pos: V(9 * 3.6, 4.0 * 3.6, 21 * 3.6), look: V(0, 0, 0), fov: 44},
  {t: B.never + 0.6, pos: V(9 * 3.9, 2.6 * 3.9, 21 * 3.9), look: V(0, 0, 0), fov: 44},
  {t: B.total, pos: V(9 * 4.5, 2.2 * 4.5, 21 * 4.5), look: V(0, 0, 0), fov: 44},
]);
export const camAt = (t: number) => CAM(t);

// ---------- the state of the world at t (one visual language: see brief.md) ----------
const stateAt = (t: number) => {
  // the hook: boots stretch a little, then snap back
  const hookS = 1 + 0.45 * Math.sin(Math.PI * Math.min(1, t / (B.scientists + 0.3))) * (1 - rise(t, B.you - 0.4, 0.6));
  const stretch = Math.max(hookS, 1 + 2.1 * rise(t, B.harder - 0.2, B.stretch + 1.2 - B.harder));
  // the star (the hole's past): appears, swells, flashes white, caves in to nothing
  const starIn = rise(t, B.star - 0.5, 0.8);
  const swell = rise(t, B.star, B.dies - B.star + 0.2);
  const cave = rise(t, B.crush, B.tiny - B.crush + 0.3);
  const starR = starIn * (6.5 + 2.6 * swell) * (1 - cave);
  const starHot = interpolate(t, [B.dies - 0.05, B.dies + 0.15, B.dies + 0.7, B.tiny], [0, 0.9, 0.15, 0.6], clamp);
  const flash = interpolate(t, [B.tiny + 0.15, B.tiny + 0.4, B.tiny + 1.1], [0, 1, 0], clamp);
  const disk = 1 - starIn + starIn * rise(t, B.tiny, 0.9);
  const edgeLine = win(t, B.edge - 0.3, B.black + 0.3, 0.4) + win(t, B.small - 0.2, B.piece + 1.0, 0.5);
  const rays = win(t, B.cant - 0.3, B.faster + 0.4, 0.3), raysGrow = Math.max(0, t - (B.cant - 0.2)) * 7;
  const rock = Math.max(0, Math.min(1, (t - (B.edge - 0.6)) / 1.7));
  const river = win(t, B.faster - 0.1, B.black + 0.5, 0.4);
  const spin = 1 + 1.6 * rise(t, B.glow, 1.2);
  const heat = rise(t, B.rubs, 1.2) * (1 - 0.6 * rise(t, B.fall, 1.5));
  const gas = win(t, B.glow - 0.2, B.fall + 0.6, 0.6) + 0.35 * win(t, B.giant + 0.6, B.total + 1, 1.2);
  const sparks = win(t, B.rubs - 0.1, B.shines + 0.8, 0.3);
  const arrows = win(t, B.feet - 0.1, B.friend + 0.2, 0.3);
  const tint = rise(t, B.red - 0.2, 0.9) * (1 - rise(t, B.watch - 0.2, 0.7));
  const fade = rise(t, B.red + 0.1, B.fade + 0.4 - B.red) * (1 - rise(t, B.watch - 0.2, 0.6)) + rise(t, B.fallin + 0.2, 0.8);
  const zone = win(t, B.small - 0.3, B.piece - 0.2, 0.5);
  const hs = holeScaleAt(t);
  const you2 = win(t, B.giant + 1.6, B.never + 1.0, 0.5);
  return {stretch, starR, starHot, flash, disk, edgeLine, rays, raysGrow, rock, river, spin, heat, gas, sparks, arrows, tint, fade, zone, hs, you2};
};

// orientation of "you": upright and turning to face the camera, then feet toward the hole once you fall
const youQuat = (t: number, p: THREE.Vector3) => {
  const face = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(V(0, 0, 0), OUT(A0).negate(), V(0, 1, 0)));
  const tumble = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25 * Math.sin(t * 0.6), 0.6 * Math.sin(t * 0.35) - 0.5 * (1 - rise(t, B.you - 0.5, 1.0)), 0.18 * Math.sin(t * 0.5)));
  const upright = face.clone().multiply(tumble);
  const feet = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), OUT(p));
  feet.multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), 1.2 + 0.05 * t));
  return upright.slerp(feet, rise(t, B.fall - 0.2, 1.4));
};

const Cam: React.FC<{t: number}> = ({t}) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const c = camAt(t);
  cam.position.copy(c.pos); cam.fov = c.fov; cam.near = 0.02; cam.far = 8000; cam.updateProjectionMatrix(); cam.lookAt(c.look);
  return null;
};

// the light fan for line 4: from you toward the hole, spread across it (impact parameters ~0.6 .. 5 Rs)
const FAN = (() => {
  const toHole = OUT(AF).negate(), side = SIDE(AF), up = toHole.clone().cross(side).normalize();
  const dirs: THREE.Vector3[] = [];
  for (const [a, b] of [[-0.42, 0.05], [-0.3, -0.12], [-0.2, 0.1], [-0.1, -0.04], [0, 0.0], [0.08, 0.12], [0.16, -0.1], [0.27, 0.06], [0.4, -0.08], [0.05, 0.3], [-0.06, -0.3]]) {
    dirs.push(toHole.clone().addScaledVector(side, a).addScaledVector(up, b).normalize());
  }
  return dirs;
})();
const RAY_SRC = AF.clone().add(V(0, 0.15, 0));
const FLASH = glowSprite('#fff1dc');

const Scene: React.FC<{t: number}> = ({t}) => {
  const s = stateAt(t);
  const you = youAt(t);
  const q = youQuat(t, you);
  const c = camAt(t);
  // the river plane faces the camera
  const basis = useMemo(() => new THREE.Matrix4(), []);
  const fwd = c.look.clone().sub(c.pos).normalize(), right = fwd.clone().cross(V(0, 1, 0)).normalize(), up = right.clone().cross(fwd).normalize();
  basis.makeBasis(right, up, fwd.clone().negate());
  const rockP = AF.clone().add(V(0.4, 0.5, 0.2)).lerp(V(0, 0.2, 0), Math.pow(s.rock, 1.8));
  const rockFade = Math.max(0, Math.min(1, (rockP.length() - 1.6) / 1.4));
  const you2 = add(c.pos, sc(c.look.clone().sub(c.pos).normalize(), 4.5 + 9 * rise(t, B.piece - 0.6, 3.2)), V(0.5, -0.9 + 0.5 * rise(t, B.piece, 2), 0));
  return (
    <>
      <Cam t={t} />
      <BlackHole time={t} diskOn={s.disk} diskHeat={s.heat} horizonLine={s.edgeLine} spin={s.spin} scale={s.hs * BASE} exposure={1 + 0.2 * s.heat} />
      <hemisphereLight args={['#5a6aa0', '#1a0d08', 0.55]} />
      <pointLight position={[0, 0.4, 0]} color="#ffb070" intensity={(25 + 25 * s.heat) * s.disk * s.hs * s.hs} distance={0} decay={2} />
      <directionalLight position={[-6, 8, 10]} intensity={1.2} color="#bcd0ff" />
      <pointLight position={c.pos} intensity={2.2} distance={14} decay={1} color="#dfe6ff" />
      <Star r={s.starR} t={t} hot={s.starHot} />
      {s.flash > 0 && <sprite scale={45 * s.flash + 1} material={FLASH} material-opacity={s.flash} />}
      <group position={SHIP} rotation={[0, -0.9, 0.08 * Math.sin(t * 0.5)]} scale={0.55}><Ship t={t} /></group>
      {s.hs < 1.5 && (
        <group position={you} quaternion={q}>
          <Stretch s={s.stretch}><Astronaut tint={s.tint} fade={Math.min(1, s.fade)} sticker={rise(t, B.you - 0.5, 0.5)} /></Stretch>
        </group>
      )}
      {/* gravity arrows: long at the feet, short at the head (toward the hole) */}
      {s.arrows > 0 && (() => {
        const toH = OUT(you).negate(), feet = you.clone().addScaledVector(toH, 0.45 * s.stretch), head = you.clone().addScaledVector(toH, -0.45 * s.stretch);
        const side = V(0, 0.42, 0);
        const k = 1 + 0.6 * rise(t, B.harder, 1.0);
        return (<>
          <Arrow from={feet.clone().add(side)} dir={toH} len={0.9 * k} o={s.arrows} />
          <Arrow from={head.clone().add(side)} dir={toH} len={0.35} o={s.arrows} />
        </>);
      })()}
      {s.rock > 0 && s.rock < 1 && rockFade > 0 && <group position={rockP} rotation={[t * 2, t * 1.3, 0]} scale={rockFade}><Rock /></group>}
      <Rays src={RAY_SRC} dirs={FAN} grow={s.raysGrow} on={s.rays} />
      <River t={t} t0={B.faster} on={s.river} basis={basis} />
      <Gas t={t} on={s.gas} heat={s.heat} sparks={s.sparks} scale={s.hs * BASE} />
      <Zone r={4} o={s.zone * 0.9 * Math.max(0, 1 - Math.max(0, (EDGE * BASE * s.hs - 3.4) / 2))} />
      {s.zone > 0 && s.hs < 2 && (
        <group position={PATH.getPointAt(0.36)} quaternion={new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), OUT(PATH.getPointAt(0.36)))}>
          <Stretch s={3.1}><Astronaut fade={1 - s.zone * 0.8} /></Stretch>
        </group>
      )}
      {s.you2 > 0 && (
        <group position={you2} rotation={[0.3, 2.5 + t * 0.2, 0.2]}>
          <Astronaut fade={1 - s.you2} />
          <pointLight position={[1.5, 1.5, 2.5]} intensity={6} distance={8} color="#fff2e0" />
        </group>
      )}
    </>
  );
};

// ---------- overlays: cards and the two clocks ----------
const Card: React.FC<{text: string; o: number; y?: number; size?: number; color?: string; stretch?: number}> = ({text, o, y = 1300, size = 74, color = '#fff', stretch = 0}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px) scale(${0.96 + 0.04 * o})`}}>
    <div style={{padding: '10px 30px 14px', borderRadius: 26, background: 'rgba(6,8,16,0.55)', fontFamily: SANS, color, fontSize: size, fontWeight: 800,
      letterSpacing: -1 + stretch * 6, whiteSpace: 'nowrap', textShadow: '0 2px 18px rgba(0,0,0,0.6)', transform: `scaleY(${1 + stretch * 0.5}) scaleX(${1 - stretch * 0.18})`}}>{text}</div>
  </div>
);
const Dial: React.FC<{label: string; ang: number; color: string; o: number}> = ({label, ang, color, o}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: o}}>
    <svg width="230" height="230" viewBox="-115 -115 230 230">
      <circle r="104" fill="rgba(8,10,18,0.72)" stroke={color} strokeWidth="8" />
      {Array.from({length: 12}, (_, i) => <rect key={i} x="-4" y="-96" width="8" height="18" rx="3" fill={color} transform={`rotate(${i * 30})`} />)}
      <rect x="-4" y="-84" width="8" height="92" rx="4" fill={color} transform={`rotate(${ang})`} />
      <circle r="10" fill={color} />
    </svg>
    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>{label}</div>
  </div>
);
// seconds hands that tick: friend's ticks once a second; yours (as seen from far) ticks slower and slower, then stops
const ticks = (secs: number) => Math.floor(secs) * 30;
const seenSecs = (t: number) => {
  const t0 = B.friend + 0.3;
  return t < t0 ? 0 : (1 - Math.exp(-(t - t0) * 0.55)) / 0.55;
};

const Overlays: React.FC<{t: number}> = ({t}) => {
  const s = stateAt(t);
  const clocks = win(t, B.friend + 0.3, B.watch - 0.1, 0.35);
  const mine = win(t, B.watch, B.small - 0.2, 0.35);
  return (
    <>
      <Card text="ASTRONAUT → SPAGHETTI" o={win(t, 0, B.word - 0.15, 0.2) * (t < 0.2 ? 1 : 1)} />
      <Card text="SPAGHETTIFICATION" o={win(t, B.word - 0.1, B.star - 0.4, 0.3)} size={68} stretch={rise(t, B.word, 1.1) * (1 - rise(t, B.you, 0.6)) * 0.9} />
      <Card text="EVENT HORIZON" o={win(t, B.edge - 0.1, B.faster - 0.2, 0.3)} color="#9eeaff" />
      <Card text="LIGHT IS TOO SLOW" o={win(t, B.nothing - 0.4, B.black + 0.9, 0.3)} color="#e9f6ff" />
      <Card text="MILLIONS OF DEGREES" o={win(t, B.millions - 0.1, B.fall - 0.1, 0.3)} color="#ffd7a0" />
      <Card text="FEET ARE CLOSER" o={win(t, B.feet + 0.3, B.harder - 0.1, 0.3)} color="#dcc2ff" />
      <Card text="PULLED HARDER" o={win(t, B.harder, B.friend - 0.2, 0.3)} color="#dcc2ff" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center', gap: 70}}>
        {clocks > 0 && <Dial label="FRIEND" ang={ticks(Math.max(0, t - B.friend - 0.3))} color="#ffffff" o={clocks} />}
        {clocks > 0 && <Dial label="YOU, SEEN FROM FAR" ang={ticks(seenSecs(t))} color={`rgb(255,${Math.round(255 - 190 * s.tint)},${Math.round(255 - 200 * s.tint)})`} o={clocks * (1 - 0.75 * s.fade)} />}
        {mine > 0 && <Dial label="YOUR WATCH" ang={ticks(Math.max(0, t - B.watch))} color="#ffffff" o={mine} />}
      </div>
      <Card text="SMALL: NOODLE FIRST" o={win(t, B.small, B.giant - 0.1, 0.3)} color="#dcc2ff" />
      <Card text="GIANT: IN ONE PIECE" o={win(t, B.giant + 0.2, B.either - 0.1, 0.3)} />
      <Card text="NO WAY BACK" o={rise(t, B.either + 0.4, 0.4)} size={84} />
    </>
  );
};

const LINES = [
  'This tiny [astronaut] is about to become [spaghetti.]',
  'Scientists really call it [spaghettification.]', 'Pretend the astronaut is [you.]',
  'Some black holes are left when a [giant] [star] dies.', 'It [crushes] itself into a tiny space.',
  'Its gravity is so strong', "that once anything crosses its [edge,] it can't get back out.", 'Not even [light.]',
  'To get out, you would have to go [faster] [than] [light.]', 'And nothing can.', 'That is why the hole looks [black.]',
  'But gas near it can [glow.]', 'It swirls in like water down a [drain.]', 'It [rubs] and heats up to [millions] of degrees,', 'so it shines.',
  'Now you [fall] in.', 'Your [feet] are closer to the hole than your head.', 'So gravity pulls your feet [harder,]', 'and you [stretch] long and thin.',
  'Your [friend] watches from far away.', 'To your friend, you seem to [slow] [down.]',
  'You seem to [stop] near the edge.', 'You turn [red] and dim, and fade away fast.',
  'But your own [watch] ticks just like always.', "You don't stop.", 'You fall right [in.]',
  'A [small] black hole like this one', 'stretches you before you even reach the [edge.]',
  'But you could cross the edge of a [giant] one', 'in [one] [piece.]',
  'Either way, once you cross,', 'you can [never] come back out.',
];

export const Film: React.FC<{captions?: boolean; audio?: boolean; bloom?: number}> = ({captions = true, audio = true, bloom = 1}) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={bloom}>
        <ThreeCanvas width={1080} height={1920} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping}}>
          <Scene t={t} />
        </ThreeCanvas>
      </Finish>
      <Overlays t={t} />
      {captions && <Captions t={t} words={words} lines={LINES} accent={ACC} font={SANS} />}
      {audio && <Audio src={staticFile('mix.wav')} />}
    </AbsoluteFill>
  );
};
