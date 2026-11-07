// Octopus 01: one continuous shot. The reef: a "rock" with a fish resting on it is an octopus -> it blinks through
// outfits -> push into its skin (the dots) -> the skin up close: colour sacs, spoke muscles, the nerve from the brain,
// shiny plates, white cells -> climb back out: bumps rise and it matches the rock -> into its eye: the world goes grey
// -> question bubbles rise to a dish of skin on the sand -> into that skin: the layers (recap) -> out: the fish comes
// back, and every rock opens an eye. Every time is a beat from the voice (beats.json); every pose is a function of t.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {withUnderwater} from './kit/water/underwater';
import {Reef, useWater, groundY, sandY} from './reef';
import {Octopus, REST_POSE, eyeAnchor, bodyPoint, eyeMaterial, skinMaterial, skinUniforms} from './octopus';
import {SkinBlock, SACS, SAC_COL, IRID_Y, LEUCO_Y, Sac} from './skin';
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

// ---------- the switches between the reef and the skin up close (each carried by the dots) ----------
const SW1 = B.millions + 0.55, SW2 = B.notenough + 0.45, SW3 = B.recap + 0.2, SW4 = B.r_bumps - 0.15;
const inSkin = (t: number) => (t >= SW1 && t < SW2) || (t >= SW3 && t < SW4);
const dotsAt = (t: number) => Math.max(...[SW1, SW2, SW3, SW4].map((s) => interpolate(t, [s - 0.4, s, s + 0.4], [0, 1, 0], clamp)));

// ---------- the reef layout ----------
const OPOS = V(0.05, groundY(0.05, 0.1) - 0.012, 0.1), YAW = 0.3;
const W = (x: number, y: number, z: number) => V(x, y, z).applyAxisAngle(V(0, 1, 0), YAW).add(OPOS);
const WL = (p: THREE.Vector3) => W(p.x, p.y, p.z);
const ea = eyeAnchor(0), EYE = WL(ea.p), EN = ea.n.clone().applyAxisAngle(V(0, 1, 0), YAW);
const MSK = bodyPoint(0.62, 0.9), MSKW = WL(MSK), MN = MSK.clone().sub(bodyPoint(0.62, 0.9 + Math.PI)).normalize().applyAxisAngle(V(0, 1, 0), YAW);
const DISH = V(0.95, sandY(0.95, 1.05) + 0.01, 1.05);
const ROCK_EYES = [[-0.75, 0.45, 0.3], [0.65, -0.55, 0.25], [-0.45, -0.75, 0.3], [0.85, 0.35, 0.22], [-1.05, -0.25, 0.35], [0.2, 0.75, 0.25]] as const;

// ---------- camera: monotone cubic (PCHIP) through keys ----------
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
  const ts = keys.map((k) => k.t), ch = (f: (k: K) => number) => keys.map(f);
  const px = ch((k) => k.pos.x), py = ch((k) => k.pos.y), pz = ch((k) => k.pos.z);
  const lx = ch((k) => k.look.x), ly = ch((k) => k.look.y), lz = ch((k) => k.look.z), fv = ch((k) => k.fov);
  return (t: number) => ({pos: V(pchip(ts, px, t), pchip(ts, py, t), pchip(ts, pz, t)), look: V(pchip(ts, lx, t), pchip(ts, ly, t), pchip(ts, lz, t)), fov: pchip(ts, fv, t)});
};
const along = (p: THREE.Vector3, n: THREE.Vector3, d: number, up = 0) => p.clone().addScaledVector(n, d).add(V(0, up, 0));

// the hero sacs: the yellow, red and brown sac nearest the middle; and the empty slot
const nearestOf = (k: number) => SACS.map((s, i) => ({s, i})).filter((q) => q.s.type === k).sort((a, b) => Math.hypot(a.s.x, a.s.z) - Math.hypot(b.s.x, b.s.z))[0].i;
const HEROES = [nearestOf(0), nearestOf(1), nearestOf(2)];
const ROW = [V(0, 1.8, -3.3), V(0, 1.8, -1.1), V(0, 1.8, 1.1)], SLOT = V(0, 1.8, 3.3);
const HY = SACS[HEROES[0]];

const REEF1 = track([
  {t: 0, pos: W(0.62, 0.42, 0.78), look: W(0, 0.04, -0.02), fov: 40},
  {t: B.octo, pos: W(0.48, 0.34, 0.62), look: W(0, 0.06, -0.02), fov: 38},
  {t: B.colors - 0.1, pos: along(EYE, EN, 0.26, 0.08), look: EYE.clone().add(V(0, 0.01, 0)), fov: 36},
  {t: B.blink + 0.4, pos: along(EYE, EN, 0.19, 0.06), look: EYE.clone().add(V(0, 0.01, 0)), fov: 34},
  {t: B.skin + 0.3, pos: along(MSKW, MN, 0.09), look: MSKW, fov: 34},
  {t: SW1, pos: along(MSKW, MN, 0.012), look: MSKW, fov: 34},
]);
const SKIN1 = track([
  {t: SW1, pos: V(0.3, 15, 2.2), look: V(0, 0, 0), fov: 50},
  {t: B.single, pos: V(0.2, 10.5, 3.2), look: V(0, 1.5, 0), fov: 46},
  {t: B.brown + 0.4, pos: V(0.6, 9.6, 3.6), look: V(0, 1.6, 0), fov: 44},
  {t: B.muscles + 0.9, pos: V(HY.x + 0.6, 6.2, HY.z + 3.6), look: V(HY.x, 0, HY.z), fov: 40},
  {t: B.letgo, pos: V(HY.x + 1.2, 5.4, HY.z + 3.4), look: V(HY.x, 0, HY.z), fov: 40},
  {t: B.dot + 0.6, pos: V(0.5, 9.5, 8.5), look: V(0, 0, 0), fov: 46},
  {t: B.nerves + 0.6, pos: V(7, 7, 9), look: V(-9, -0.5, -4.5), fov: 50},
  {t: B.pull + 0.1, pos: V(5.5, 7.5, 9.5), look: V(-7, -0.5, -3.5), fov: 50},
  {t: B.fast + 0.2, pos: V(0.4, 11, 9), look: V(0, 0, 0), fov: 48},
  {t: B.blue + 0.5, pos: V(0.6, 5, SLOT.z + 3.5), look: V(0, 0.1, SLOT.z), fov: 44},
  {t: B.shiny, pos: V(0.4, -0.3, SLOT.z + 2.6), look: V(0, IRID_Y, SLOT.z), fov: 46},
  {t: B.bounce + 0.4, pos: V(2.2, -0.9, SLOT.z + 4.2), look: V(0, IRID_Y + 0.2, SLOT.z), fov: 46},
  {t: B.white + 0.2, pos: V(1.2, -1.2, SLOT.z + 6.5), look: V(0, LEUCO_Y, SLOT.z - 1), fov: 46},
  {t: B.notenough, pos: V(-1.4, -1.4, SLOT.z + 6.0), look: V(0, LEUCO_Y, SLOT.z - 1), fov: 46},
  {t: SW2, pos: V(0, 4, SLOT.z + 1.5), look: V(0, 0, SLOT.z), fov: 46},
]);
const REEF2 = track([
  {t: SW2, pos: along(MSKW, MN, 0.02), look: MSKW, fov: 36},
  {t: B.bumpy, pos: W(0.4, 0.22, 0.45), look: W(-0.05, 0.03, -0.05), fov: 40},
  {t: B.bumps + 0.4, pos: W(0.3, 0.17, 0.36), look: W(0, 0.06, -0.05), fov: 38},
  {t: B.rough + 0.4, pos: W(0.62, 0.3, 0.55), look: W(0, 0.04, 0), fov: 38},
  {t: B.strange + 0.2, pos: along(EYE, EN, 0.12, 0.02), look: EYE, fov: 36},
  {t: B.most - 0.25, pos: along(EYE, EN, 0.006), look: EYE, fov: 36},
  // eye-view: from the eye looking out over the reef
  {t: B.most - 0.05, pos: along(EYE, EN, 0.02, 0.01), look: V(-1.1, 0.2, -1.2), fov: 52},
  {t: B.match - 0.4, pos: along(EYE, EN, 0.05, 0.03), look: V(-0.4, 0.1, -1.6), fov: 52},
  {t: B.match + 0.6, pos: W(0.7, 0.42, 0.75), look: W(0, 0.06, 0), fov: 42},
  {t: B.clue + 0.5, pos: W(0.8, 0.9, 0.9), look: V(DISH.x - 0.2, 0.3, DISH.z - 0.3), fov: 46},
  {t: B.dish + 0.3, pos: DISH.clone().add(V(0.26, 0.38, 0.5)), look: DISH, fov: 42},
  {t: B.slow + 0.2, pos: DISH.clone().add(V(0.14, 0.22, 0.28)), look: DISH, fov: 40},
  {t: SW3, pos: DISH.clone().add(V(0.01, 0.025, 0.012)), look: DISH, fov: 40},
]);
const SKIN2 = track([
  {t: SW3, pos: V(0, 9, 4), look: V(0, 0, 0), fov: 48},
  {t: B.r_bags, pos: V(1.2, 3.2, 9), look: V(0, -0.6, 0), fov: 46},
  {t: B.r_shiny, pos: V(0.6, 1.0, 9), look: V(0, -1.4, 0), fov: 46},
  {t: B.r_white, pos: V(-0.6, -0.4, 9), look: V(0, -2.4, 0), fov: 46},
  {t: SW4, pos: V(0, 5, 5), look: V(0, 0, 0), fov: 46},
]);
const REEF3 = track([
  {t: SW4, pos: along(MSKW, MN, 0.03), look: MSKW, fov: 36},
  {t: B.next, pos: W(0.62, 0.36, 0.7), look: W(0, 0.06, 0), fov: 40},
  {t: B.twice + 0.2, pos: W(1.25, 0.75, 1.65), look: W(-0.1, 0.0, -0.3), fov: 46},
  {t: B.total, pos: W(1.75, 1.05, 2.3), look: W(-0.15, 0.0, -0.5), fov: 48},
]);
export const camAt = (t: number) => (t < SW1 ? REEF1(t) : t < SW2 ? SKIN1(t) : t < SW3 ? REEF2(t) : t < SW4 ? SKIN2(t) : REEF3(t));

// ---------- the octopus's state (one visual language: see brief.md) ----------
const blinkAt = (t: number) => {
  const bs = [B.colors + 0.45, B.colors + 1.35, B.blink + 0.25];
  return Math.max(0, ...bs.map((b) => interpolate(t, [b - 0.1, b, b + 0.1], [0, 1, 0], clamp)));
};
const reefState = (t: number) => {
  // outfits: hidden (copies the rock) -> seen (red-brown) -> blinks through rock, pale, red
  const bs = [B.colors + 0.45, B.colors + 1.35, B.blink + 0.25];
  const outfit = t < B.octo - 0.05 ? 'rock' : t < bs[0] ? 'red' : t < bs[1] ? 'rock' : t < bs[2] ? 'pale' : 'red';
  let match = outfit === 'rock' ? 1 : 0, pale = outfit === 'pale' ? 0.6 : 0, pap = outfit === 'rock' ? 1 : 0;
  let lid = t < B.octo - 0.1 ? 0.82 : blinkAt(t);
  // the reveal: a pale flash as it lets go of the rock look
  pale = Math.max(pale, interpolate(t, [B.octo - 0.1, B.octo + 0.05, B.octo + 0.45], [0, 0.9, 0], clamp));
  if (t >= SW2) { // after the skin: red, then bumps rise and it matches the rock again
    pap = rise(t, B.bumps, 0.9); match = rise(t, B.rough + 0.1, 0.8); pale = 0; lid = 0;
  }
  if (t >= SW4) { match = 1; pap = 1; lid = t < B.twice ? 0.82 : 0.82 * (1 - rise(t, B.twice + 0.15, 0.25)); }
  const lift = win(t, B.octo, B.colors + 0.3, 0.35) * 0.7;
  return {match, pale, pap, lid, lift};
};
// the fish: rests on the "rock", bolts at the reveal; comes back at the end and backs away
const fishAt = (t: number) => {
  const perch = W(-0.01, 0.168, -0.085);
  if (t < B.octo + 0.05) {
    const k = rise(t, 0, 1.6);
    return {p: W(-0.7, 0.45, 0.55).lerp(perch, k).add(V(0, 0.01 * Math.sin(t * 5) * (1 - k), 0)), yaw: -2.0, s: 1};
  }
  if (t < B.colors + 0.5) {
    const k = Math.min(1, (t - B.octo - 0.05) / 0.5);
    return {p: perch.clone().lerp(W(-0.9, 0.7, -0.9), k * k * (3 - 2 * k)), yaw: -2.5, s: 1};
  }
  if (t > SW4) {
    const hover = W(0.05, 0.3, 0.05), k1 = rise(t, B.next - 0.3, 1.2), k2 = rise(t, B.twice + 0.1, 1.3);
    return {p: W(-0.9, 0.55, 0.6).lerp(hover, k1).lerp(W(-0.5, 0.5, 0.9), k2 * 0.8), yaw: -2.0 - k2 * 0.4, s: 1};
  }
  return null;
};

// ---------- the skin's state ----------
const skinState = (t: number) => {
  const recap = t >= SW3;
  const lifted = (i: number) => {
    const h = HEROES.indexOf(i); if (h < 0 || recap) return 0;
    const down = h === 0 ? rise(t, B.muscles + 0.1, 0.9) : rise(t, B.muscles - 0.2, 0.7);
    return rise(t, B.single - 0.3, 0.8) * (1 - down);
  };
  const place = (i: number, s: Sac): [number, number, number] => {
    const k = lifted(i); if (k <= 0) return [s.x, 0, s.z];
    const r = ROW[HEROES.indexOf(i)]; return [s.x + (r.x - s.x) * k, r.y * k, s.z + (r.z - s.z) * k];
  };
  const wave = (s: Sac) => rise(t, B.dot + 0.45 + Math.hypot(s.x - HY.x, s.z - HY.z) * 0.05, 0.3) * (1 - rise(t, B.nerves - 0.1, 0.6));
  const fire = rise(t, B.pull + 0.35, 0.15);
  const open = (i: number, s: Sac) => {
    if (recap) return 0.55 + 0.1 * Math.sin(t * 3 + s.seed * 9);
    let o = (s.type === 0 ? 0.3 : 0.72) * (1 - rise(t, B.single - 0.4, 0.6));   // the red skin we dived into
    const h = HEROES.indexOf(i);
    if (h >= 0) {
      const at = [B.yellow, B.red, B.brown][h];
      o = Math.max(o, 0.15 + 0.45 * rise(t, at - 0.1, 0.3));
      if (h === 0) o = Math.max(0.15, Math.min(1, o + 0.6 * rise(t, B.open - 0.4, 0.5) - 0.9 * rise(t, B.letgo, 0.45)));
    } else o = Math.max(o, 0.15);
    o = Math.max(o, 0.15 + 0.75 * wave(s));
    o = Math.max(o, 0.95 * fire * (1 - rise(t, B.blue, 0.6) * 0.6));
    return o;
  };
  const spark = t < B.nerves + 0.9 ? -1 : t > B.pull + 0.5 ? -1 : interpolate(t, [B.nerves + 0.9, B.pull + 0.2, B.pull + 0.45], [0, 0.75, 1], clamp);
  const lampGold = new THREE.Color('#ffb547'), lampBlue = new THREE.Color('#3d7bff');
  return {
    t, open, place, spark,
    nerve: recap ? 0 : rise(t, B.nerves - 0.5, 0.5) * (1 - rise(t, B.blue, 0.8)),
    plates: recap ? 1 : rise(t, B.blue, 0.8), recap, beam: recap ? 0 : win(t, B.shiny + 0.2, B.white + 0.2, 0.35),
    leuco: recap ? 1 : rise(t, B.white - 0.4, 0.6),
    lamp: lampGold.clone().lerp(lampBlue, rise(t, B.around + 0.1, 0.4)), lampOn: recap ? 0.3 : win(t, B.white - 0.2, SW2, 0.4),
    cut: 1, beamAt: [SLOT.x, SLOT.z] as [number, number],
    glowLayer: (recap ? [win(t, B.r_bags - 0.1, B.r_shiny - 0.1, 0.2), win(t, B.r_shiny - 0.1, B.r_white - 0.1, 0.2), win(t, B.r_white - 0.1, SW4 + 0.1, 0.2)] : [0, 0, 0]) as [number, number, number],
  };
};

// ---------- small props ----------
const fishGeo = (() => { const g = new THREE.SphereGeometry(1, 16, 10); g.scale(1, 0.48, 0.24); return g; })();
const tailGeo = (() => { const g = new THREE.ConeGeometry(0.5, 0.7, 4); g.rotateZ(Math.PI / 2); g.translate(-1.25, 0, 0); g.scale(1, 1, 0.25); return g; })();
const Fish: React.FC<{t: number; U: any}> = ({t, U}) => {
  const M = useMemo(() => ({body: withUnderwater(new THREE.MeshStandardMaterial({color: '#f6cf3e', roughness: 0.35}), U, 'herofish'),
    stripe: withUnderwater(new THREE.MeshStandardMaterial({color: '#1d2a3a', roughness: 0.5}), U, 'herofish2')}), []);
  const f = fishAt(t); if (!f) return null;
  const wag = Math.sin(t * 14) * 0.35;
  return (
    <group position={f.p} rotation={[0, f.yaw, 0]} scale={0.045}>
      <mesh geometry={fishGeo} material={M.body} />
      <mesh position={[0.55, 0.12, 0.2]} material={M.stripe}><sphereGeometry args={[0.11, 10, 8]} /></mesh>
      <mesh position={[0.55, 0.12, -0.2]} material={M.stripe}><sphereGeometry args={[0.11, 10, 8]} /></mesh>
      <group rotation={[0, wag, 0]}><mesh geometry={tailGeo} material={M.body} /></group>
    </group>
  );
};
// eyes in the other rocks: they open on "look twice"
const RockEyes: React.FC<{t: number; U: any}> = ({t, U}) => {
  const M = useMemo(() => ({eye: withUnderwater(eyeMaterial(), U, 'rockeye'), lid: withUnderwater(new THREE.MeshStandardMaterial({color: '#7a6d58', roughness: 0.9}), U, 'rocklid')}), []);
  if (t < SW4) return null;
  return (<>{ROCK_EYES.map((r, i) => {
    const open = rise(t, B.twice + 0.1 + i * 0.12, 0.3), r0 = 0.02 + r[2] * 0.04;
    const top = V(r[0], groundY(r[0], r[1]) + r0 * 0.15, r[1]);
    const n = W(1.75, 1.05, 2.3).sub(top).normalize();
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(V(0, 0, 0), n.clone().negate(), V(0, 1, 0)));
    return (
      <group key={i} position={top} quaternion={q}>
        <mesh material={M.eye}><sphereGeometry args={[r0, 20, 14]} /></mesh>
        <mesh material={M.lid} rotation={[-0.55 + (1 - open) * (Math.PI / 2 + 0.55), 0, 0]}><sphereGeometry args={[r0 * 1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
        <mesh material={M.lid} rotation={[Math.PI + 0.55 - (1 - open) * (Math.PI / 2 + 0.55), 0, 0]}><sphereGeometry args={[r0 * 1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      </group>
    );
  })}</>);
};
// the dish on the sand: a glass petri dish with a disc of skin that slowly darkens in a sunbeam
const Dish: React.FC<{t: number; U: any}> = ({t, U}) => {
  const M = useMemo(() => {
    const SU = skinUniforms();
    const disc = new THREE.CircleGeometry(0.075, 64); disc.rotateX(-Math.PI / 2);
    disc.setAttribute('aRest', new THREE.Float32BufferAttribute(Array.from(disc.attributes.position.array as Float32Array).map((x) => x + 2), 3));
    return {SU, disc, skin: withUnderwater(skinMaterial(SU), U, 'dishskin'),
      glass: withUnderwater(new THREE.MeshStandardMaterial({color: '#dff6ff', roughness: 0.05, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false}), U, 'glass'),
      beam: new THREE.MeshBasicMaterial({color: '#fff6dc', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false})};
  }, []);
  if (t < B.match) return null;
  const k = rise(t, B.noeyes + 0.3, 6.5);         // slow: seconds, not a blink
  M.SU.uChroma.value = 0.12 + 0.75 * k; M.SU.uSkT.value = t;
  M.beam.opacity = 0.045 * win(t, B.clue, SW3 + 0.3, 0.6);
  return (
    <group position={DISH}>
      <mesh material={M.glass} position={[0, 0.012, 0]}><cylinderGeometry args={[0.1, 0.1, 0.024, 48, 1, true]} /></mesh>
      <mesh material={M.glass} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}><circleGeometry args={[0.1, 48]} /></mesh>
      <mesh geometry={M.disc} material={M.skin} position={[0, 0.004, 0]} />
      <mesh material={M.beam} position={[0, 1.2, 0]}><cylinderGeometry args={[0.12, 0.3, 2.4, 32, 1, true]} /></mesh>
    </group>
  );
};
// question-mark bubbles rising from the octopus to the beam over the dish
const qTex = (() => { let tx: THREE.Texture | null = null; return () => {
  if (tx) return tx; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d')!;
  const g = x.createRadialGradient(64, 64, 20, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,0.05)'); g.addColorStop(0.85, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,0.95)'; x.font = 'bold 76px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', 64, 70);
  tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; }; })();
const Bubbles: React.FC<{t: number}> = ({t}) => {
  const mat = useMemo(() => new THREE.SpriteMaterial({map: qTex(), transparent: true, depthWrite: false, fog: false}), []);
  const a = B.match - 0.2, b = B.dish + 0.5;
  if (t < a || t > b + 0.6) return null;
  mat.opacity = win(t, a, b + 0.6, 0.4);
  return (<>{Array.from({length: 7}, (_, i) => {
    const t0 = a + i * 0.35, k = Math.max(0, t - t0);
    if (k <= 0) return null;
    const p = W(0.02 * Math.sin(i * 2), 0.18, -0.05).lerp(V(DISH.x - 0.05 + 0.04 * Math.sin(i), 0.75 + i * 0.05, DISH.z - 0.1), Math.min(1, k / 3.2));
    p.y += k * 0.06 + 0.01 * Math.sin(k * 4 + i);
    return <sprite key={i} material={mat} position={p} scale={0.05 + 0.01 * (i % 3)} />;
  })}</>);
};

// ---------- the scene ----------
const Cam: React.FC<{t: number}> = ({t}) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const c = camAt(t), sk = inSkin(t);
  cam.position.copy(c.pos); cam.fov = c.fov; cam.near = sk ? 0.05 : 0.002; cam.far = sk ? 200 : 80; cam.updateProjectionMatrix(); cam.lookAt(c.look);
  return null;
};
const SKIN_BG = new THREE.Color('#2a1310');
const Scene: React.FC<{t: number}> = ({t}) => {
  const U = useWater(t);
  const scene = useThree((s) => s.scene);
  const fog = useMemo(() => { const f = new THREE.FogExp2('#2a1310', 0); scene.fog = f; return f; }, [scene]);
  const sk = inSkin(t);
  fog.density = sk ? 0.035 : 0;
  const reefBg = useMemo(() => new THREE.Color('#2a8fa6'), []);
  scene.background = sk ? SKIN_BG : reefBg;
  U.uUnder.value = sk ? 0 : 1;
  const s = reefState(t);
  const g = (x: number, z: number) => {
    const w = V(x, 0, z).applyAxisAngle(V(0, 1, 0), YAW).add(OPOS);
    return groundY(w.x, w.z) - OPOS.y;
  };
  const ss = skinState(t);
  return (
    <>
      <Cam t={t} />
      <group visible={!sk}>
        <Reef t={t} U={U} />
        <Octopus pose={{...REST_POSE, t, curl: 0.85, lift: s.lift}} ground={g} position={OPOS} yaw={YAW} lid={s.lid}
          skin={{uChroma: 0.8, uMatch: s.match, uPap: s.pap, uPale: s.pale, uIrid: 0.3}} breathe={1} under={(m, k) => withUnderwater(m, U, k)} />
        <Fish t={t} U={U} />
        <RockEyes t={t} U={U} />
        <Dish t={t} U={U} />
        <Bubbles t={t} />
      </group>
      <group visible={sk}>
        <SkinBlock s={ss} />
        {t < B.blue + 1 && <mesh position={[SLOT.x, rise(t, B.blue - 0.3, 0.6) > 0 ? SLOT.y * (1 - rise(t, B.blue - 0.3, 0.6)) + 0.1 : SLOT.y, SLOT.z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.75, 0.05, 8, 48]} /><meshBasicMaterial color="#9fb8c8" transparent opacity={0.8 * win(t, B.single, B.blue + 0.9, 0.4)} fog={false} />
        </mesh>}
      </group>
    </>
  );
};

// ---------- overlays: cards, the dots that carry the dives, the pupil, grey vision ----------
const Card: React.FC<{text: string; o: number; y?: number; size?: number; color?: string; sub?: string}> = ({text, o, y = 1250, size = 72, color = '#fff', sub}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px) scale(${0.96 + 0.04 * o})`}}>
    <div style={{padding: '12px 32px 16px', borderRadius: 28, background: 'rgba(4,16,22,0.55)', fontFamily: SANS, color, fontSize: size, fontWeight: 800, letterSpacing: -1, whiteSpace: 'nowrap', textAlign: 'center',
      textShadow: '0 2px 18px rgba(0,0,0,0.6)'}}>
      {text}
      {sub && <div style={{fontSize: size * 0.45, fontWeight: 700, color: '#d8eef2', letterSpacing: 0, marginTop: 2}}>{sub}</div>}
    </div>
  </div>
);
const Dots: React.FC<{t: number}> = ({t}) => {
  const o = dotsAt(t);
  if (o <= 0.001) return null;
  // nearest switch: going in, the dots grow; coming out, they shrink
  const sw = [SW1, SW2, SW3, SW4].reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a));
  const into = sw === SW1 || sw === SW3;
  const k = (t - sw) / 0.4;                                   // -1..1 around the switch
  const size = 70 * Math.pow(2.2, into ? k : -k);
  const dot = (c: string, x: number, y: number, r: number) => `radial-gradient(circle at ${x}% ${y}%, ${c} 0 ${r}%, transparent ${r + 3}%)`;
  return (
    <AbsoluteFill style={{opacity: o, background: [dot(SAC_COL[1], 30, 30, 26), dot(SAC_COL[2], 78, 62, 20), dot(SAC_COL[0], 40, 85, 14), '#e9d8c6'].join(','),
      backgroundSize: `${size}px ${size}px`, backgroundPosition: '50% 50%'}} />
  );
};
const LINES = [
 "Watch this [rock.]",
 "It's an [octopus.]",
 "It can change its [colors]",
 "in as little as a [fifth] of a [second.]",
 "That's about as fast as a [blink.]",
 "How? Its [skin] is full",
 "of [millions] of tiny bags of [color.]",
 "Each bag holds a [single] color",
 "like [yellow,] [red,] or [brown.]",
 "Tiny [muscles] pull a bag wide [open]",
 "like stretching a [balloon.]",
 "When they let go it shrinks back to a [dot.]",
 "[Nerves] from the [brain]",
 "tell the muscles when to [pull.]",
 "That's why it's so [fast.]",
 "But the bags can't make [blue] or [green.]",
 "So under them are [shiny] cells",
 "that [bounce] those colors back",
 "and under those are [white] cells.",
 "They take on the color of the [light] around them.",
 "Color is not [enough.]",
 "Rocks are [bumpy.]",
 "So the octopus pushes up little [bumps]",
 "to make its skin [rough.]",
 "Here's the [strange] part.",
 "Most scientists think octopuses are [colorblind.]",
 "So how does it [match?]",
 "Nobody knows for [sure.]",
 "Here's a [clue:]",
 "in a test, a bit of octopus [skin] in a [dish]",
 "reacted to [light]",
 "with no [eyes] or [brain.]",
 "But it was [slow,]",
 "and nobody knows if it [helps.]",
 "So that's color [bags,]",
 "[shiny] cells, [white] cells",
 "and [bumps.]",
 "Next time you see a [rock,]",
 "look [twice.]"
];

const Overlays: React.FC<{t: number}> = ({t}) => {
  const k = rise(t, B.noeyes + 0.3, 6.5), secs = Math.max(0, Math.min(6.5, (t - B.noeyes - 0.3)));
  return (
    <>
      <Card text="Find the octopus" o={win(t, 0.1, B.octo + 0.5, 0.25)} />
      <Card text="0.2 seconds" sub="about one blink" o={win(t, B.colors + 0.3, B.skin - 0.1, 0.25)} color={ACC} />
      <Card text="Chromatophores" sub="color bags" o={win(t, B.millions, B.single - 0.1, 0.25)} />
      <Card text="Iridophores" sub="shiny cells" o={win(t, B.shiny, B.white - 0.1, 0.25)} color="#8ff0e4" />
      <Card text="Leucophores" sub="white cells" o={win(t, B.white, SW2 - 0.2, 0.25)} />
      <Card text="Papillae" sub="skin bumps" o={win(t, B.bumps, B.strange - 0.1, 0.25)} />
      <Card text="Color-blind?" o={win(t, B.most, B.match + 0.2, 0.25)} />
      <Card text="Skin senses light?" sub={t > B.noeyes + 0.3 ? `${secs.toFixed(1)} seconds…` : 'no eyes, no brain'} o={win(t, B.dish, SW3 - 0.1, 0.25)} />
      {k > 0 && null}
    </>
  );
};

export const Film: React.FC<{captions?: boolean; audio?: boolean; aa?: boolean; bloom?: number}> = ({captions = true, audio = true, aa = true, bloom = 0.5}) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const grey = win(t, B.most - 0.1, B.match + 0.3, 0.3);
  const pupil = interpolate(t, [B.most - 0.45, B.most - 0.2, B.most - 0.02], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={bloom}>
        <AbsoluteFill style={{filter: grey > 0.001 ? `grayscale(${grey})` : undefined}}>
          <ThreeCanvas width={1080} height={1920} gl={{antialias: aa, toneMapping: THREE.ACESFilmicToneMapping}}>
            <Scene t={t} />
          </ThreeCanvas>
        </AbsoluteFill>
        <Dots t={t} />
        <AbsoluteFill style={{background: '#000', opacity: pupil}} />
      </Finish>
      <Overlays t={t} />
      {captions && LINES.length > 0 && <Captions t={t} words={words} lines={LINES} accent={ACC} font={SANS} />}
      {audio && <Audio src={staticFile('mix.wav')} />}
    </AbsoluteFill>
  );
};
