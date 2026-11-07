// Volcano 01: one continuous shot. Two real volcanoes float as terrain blocks over a sea of cloud at dawn: Kilauea
// (front) oozes lava rivers, Mount St. Helens (behind) blows its top, then rewinds. Kilauea is cut open: magma full of
// gas, a glass soda-bottle outline (chamber + pipe + cap), the rock's squeeze, one bubble rising and growing. Pull back:
// St. Helens is cut open too. Ride the bubbles up and out of Kilauea; follow the lava rivers; cross to St. Helens:
// sticky magma, a spoon standing in it, stuck bubbles under the cap. The 1980 bulge, quake, slide, sideways blast,
// the cap pops; ride the ash column 15 miles up and back down to today's horseshoe crater. Pull back to both.
// Every time is a beat from the voice (beats.json); every pose is a pure function of t.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {rng} from './kit/noise';
import {
  Block, BlockSpec, Bottle, Ghost, Slabs, Bub, Bubbles, Clouds, LavaRivers, Magma, Puff, Puffs, RUNNY, STICKY, Sky, Spoon, SUN, Y, bottleProfile, data, heightAt, usePreload,
} from './world';
import words from './words.json';
import B from './beats.json';

export const FPS = 30;
export const DUR = Math.ceil(B.total * FPS);
const ACC = '#9fe8ff';
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sm = (x: number) => x * x * (3 - 2 * x);
const rise = (t: number, a: number, d = 0.4) => sm(Math.min(1, Math.max(0, (t - a) / d)));
const win = (t: number, a: number, b: number, f = 0.3) => Math.min(rise(t, a, f), 1 - rise(t, b - f, f));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- the world's layout ----------
export const KS: BlockSpec = {name: 'kil13', uc: 0.357, vc: 0.42, u0: 0.02, u1: 0.72, v0: 0.28, v1: 0.98};
export const HS: BlockSpec = {name: 'helens', uc: 0.4131, vc: 0.4997, u0: 0.10, u1: 0.75, v0: 0.17, v1: 0.83};
const KP = V(0, 0, 0), HP = V(-34, 0, -10);                      // block origins (each block's summit at its local x = z = 0)
const KB = bottleProfile(-7.0, -3.6, -1.6, 1.45, 2.0, 0.32);       // Kilauea: shallow chamber, pipe to Halema'uma'u
const HB = bottleProfile(-8.2, -4.6, -2.6, 4.25, 2.0, 0.32);       // St. Helens: deeper chamber, pipe to the old summit
const FLAT = 0.32;                                                  // the bottle is a relief on the cut face (x squashed)
const KTOP = 1.45, HTOP = 4.25;
const bodyY = (P: THREE.Vector2[], y: number) => {                  // radius of the bottle at height y
  for (let i = 1; i < P.length - 4; i++) if (P[i].y >= y) { const a = P[i - 1], b = P[i]; return a.x + (b.x - a.x) * ((y - a.y) / Math.max(1e-6, b.y - a.y)); }
  return P[P.length - 5].x;
};

// ---------- St. Helens 1980 as a function of "eruption time" tau (s) ----------
const erupt = (tau: number) => ({
  bulge: rise(tau, 0, 1.5) * (1 - rise(tau, 1.55, 0.5)),
  morph: rise(tau, 1.5, 1.1),
  pre: 1 - rise(tau, 2.2, 3.5),
  shake: tau > 1.2 && tau < 2.6 ? 1 - Math.abs(tau - 1.8) / 0.8 : 0,
  cap: tau < 3.2 ? 0 : (tau - 3.2) * 3,
});
const tauAt = (t: number) => t < B.helens - 2
  ? interpolate(t, [B.blow - 1.6, B.blow + 1.6, B.secret + 0.3, B.secret + 1.8], [0, 4.6, 4.6, 0], clamp)
  : interpolate(t, [B.helens + 0.8, B.quake + 0.2, B.slid + 0.5, B.boom + 0.6, B.ash, B.minutes + 0.9, B.total], [0, 1.45, 2.2, 3.0, 4.2, 8.2, 14], clamp);

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
  const ts = keys.map((k) => k.t);
  const ch = (f: (k: K) => number) => keys.map(f);
  const P = [ch((k) => k.pos.x), ch((k) => k.pos.y), ch((k) => k.pos.z), ch((k) => k.look.x), ch((k) => k.look.y), ch((k) => k.look.z), ch((k) => k.fov)];
  return (t: number) => {
    const v = P.map((y) => pchip(ts, y, t));
    return {pos: V(v[0], v[1], v[2]), look: V(v[3], v[4], v[5]), fov: v[6]};
  };
};
const kc = (x: number, y: number, z: number) => KP.clone().add(V(x, y, z));
const hc = (x: number, y: number, z: number) => HP.clone().add(V(x, y, z));
const COLUMN_TOP = Y(24000);
const colTop = (tau: number) => Y(2600) + (COLUMN_TOP - Y(2600)) * Math.min(1, Math.max(0, (tau - 3.0) / 5.0)) ** 0.8;
const CAM = track([
  // hook: both volcanoes, Kilauea's rivers in front, St. Helens behind
  {t: 0, pos: kc(24, 14, 12), look: V(-16, 0.5, -4), fov: 42},
  {t: B.blow + 0.3, pos: V(-12, 9, 5), look: hc(0, 2.5, -1.5), fov: 44},
  {t: B.secret + 0.4, pos: kc(15, 6, 4), look: kc(0, 0, 1), fov: 42},
  // into Kilauea's cut: the magma and its gas
  {t: B.magma, pos: kc(12.5, -0.5, 4.5), look: kc(0, -3, 0.2), fov: 46},
  {t: B.fizz + 0.6, pos: kc(8.5, -3.2, -2.8), look: kc(0, -4.3, 0), fov: 44},
  {t: B.squeeze + 0.6, pos: kc(11, 0.2, 3.0), look: kc(0, -2.2, 0), fov: 50},
  // ride Fizz up the neck
  {t: B.rises + 0.3, pos: kc(7.5, -2.6, 0.8), look: kc(0, -2.4, 0), fov: 56},
  {t: B.bubbles + 0.6, pos: kc(4.6, -1.0, 0.5), look: kc(0, -1.2, 0), fov: 42},
  // pull back: both cut volcanoes
  {t: B.depends + 1.4, pos: kc(26, 3, 3), look: V(-17, -2.5, -5), fov: 44},
  // Hawaii: up the neck with the bubbles, out of the summit
  {t: B.hawaii + 0.8, pos: kc(6.5, -1.6, 1.0), look: kc(0, -1.0, 0), fov: 44},
  {t: B.pop + 0.4, pos: kc(5.0, 1.6, 0.9), look: kc(0, 1.3, 0), fov: 42},
  {t: B.easily + 0.6, pos: kc(4.5, 3.6, 2.5), look: kc(-0.3, 1.6, 0.6), fov: 44},
  // the rivers: follow them down the slope to the south-west
  {t: B.rivers + 0.4, pos: kc(2.5, 3.8, 6.5), look: kc(-1.8, 1.0, 3.5), fov: 46},
  {t: B.rivers + 2.4, pos: kc(0.5, 3.6, 12.5), look: kc(-4.2, 0.9, 8.0), fov: 46},
  // across to St. Helens' cut: sticky magma, the spoon
  {t: B.silica + 0.9, pos: hc(14, 2, 3), look: hc(0, -3.0, 0), fov: 46},
  {t: B.peanut, pos: hc(9.5, -1.6, 1.4), look: hc(0, -3.4, 0), fov: 44},
  {t: B.push + 0.3, pos: hc(7.5, 0.4, 0.9), look: hc(0, -0.8, 0), fov: 44},
  // out to the mountain's north side: the bulge (camera east-north-east, north is to the right)
  {t: B.helens - 0.5, pos: hc(15.5, 3.5, -2.5), look: hc(0, -0.5, -1.5), fov: 48},
  {t: B.helens + 0.9, pos: hc(13, 7.5, -10), look: hc(0, 2.4, -1.5), fov: 46},
  {t: B.side - 1.5, pos: hc(12, 6.0, -12), look: hc(0, 2.6, -1.5), fov: 44},
  {t: B.side + 0.6, pos: hc(10, 6.5, -7), look: hc(0, 2.8, -1.5), fov: 44},
  {t: B.slid, pos: hc(13, 8, -2), look: hc(-0.5, 2.5, -2.0), fov: 52},
  {t: B.boom + 0.6, pos: hc(15, 9, -2.5), look: hc(-1, 2.2, -2.5), fov: 58},
  {t: B.shaken + 0.6, pos: hc(13, 8, -2), look: hc(0, 4.5, -1.5), fov: 56},
  // ride the column up to 15 miles, then back down to the crater
  {t: B.ash + 0.3, pos: hc(22, 13, -10), look: hc(0, 11, 0), fov: 52},
  {t: B.minutes + 0.6, pos: hc(24, COLUMN_TOP * 0.78, -8), look: hc(0, COLUMN_TOP * 0.74, 0), fov: 58},
  {t: B.gone + 0.6, pos: hc(8, 8.5, -7), look: hc(-0.8, 2.6, -0.6), fov: 46},
  // recap: both blocks
  {t: B.recap + 0.9, pos: kc(16, 12, 14), look: kc(-1, 0, 2), fov: 48},
  {t: B.oozes + 0.3, pos: kc(18, 7, 6), look: kc(-2, 0.6, 2), fov: 44},
  {t: B.traps + 0.3, pos: V(-8, 13, 9), look: hc(0, 4, -2), fov: 46},
  {t: B.total, pos: V(-12, 15, 6), look: hc(0, 6, -2), fov: 50},
]);
export const camAt = (t: number) => CAM(t);

// ---------- state of the world at t ----------
const stateAt = (t: number) => {
  const tau = tauAt(t), E = erupt(tau);
  const kcut = lerp(6.8, 0, rise(t, B.secret + 0.1, 1.4));            // the knife sweeps through Kilauea
  const hcut = lerp(9.4, 0, rise(t, B.depends + 0.1, 1.3) * (1 - rise(t, B.helens - 0.45, 1.0)));   // St. Helens: opens, then heals for 1980
  const kin = rise(t, B.hiding - 0.2, 1.4);                           // Kilauea's interior shows
  const hin = rise(t, B.depends + 0.6, 0.8) * (1 - rise(t, B.helens - 0.5, 0.5));
  const bottle = rise(t, B.fizz - 0.1, 0.9);
  const squeeze = win(t, B.squeeze - 0.2, B.rises + 0.6, 0.5);
  const rivers = 0.35 + 0.65 * rise(t, B.rivers - 0.3, 3.0);         // rivers already creeping in the hook; grow on "pours"
  return {tau, E, kcut, hcut, kin, hin, bottle, squeeze, rivers};
};

// ---------- bubbles: Kilauea (runny: free, rising, popping) and St. Helens (sticky: stuck, swelling, then bursting) ----------
const R = rng(5); const SEEDS = Array.from({length: 90}, () => [R(), R(), R(), R()]);
const inBody = (P: THREE.Vector2[], y: number, f: number) => (f * 2 - 1) * bodyY(P, y) * 0.8;   // z within the bottle
const front = (P: THREE.Vector2[], y: number, z: number) => FLAT * Math.sqrt(Math.max(0, (bodyY(P, y) * 0.93) ** 2 - z * z)) + 0.03;
const kBubbles = (t: number, s: ReturnType<typeof stateAt>): Bub[] => {
  const out: Bub[] = [];
  if (s.kin < 0.01) return out;
  const yb = -6.6, yt = -3.4;
  const shrink = 1 - 0.65 * s.squeeze;
  const freed = rise(t, B.rises, 1.0);                                 // bubbles form and start to rise
  const runny = rise(t, B.hawaii - 0.6, 0.8);                          // the full stream up the pipe
  SEEDS.forEach(([a, b, c, d], i) => {
    const fizz = win(t, B.fizz - 0.3, B.squeeze, 0.5);
    let y = lerp(yb, yt, a) + 0.15 * Math.sin(t * 0.6 + i) + fizz * (((t * (0.4 + d) + b * 3) % 1.2) - 0.6) * 0.6;
    let r = (0.05 + 0.035 * c) * (1 + 0.25 * Math.sin(t * 7 + i * 1.7)) * shrink;
    // rising: each bubble climbs on its own clock and grows as the squeeze weakens (higher = bigger)
    const sp = 0.55 + 0.5 * d, phase = (t * sp * (0.6 + 1.6 * runny) + b * 9) % 9;
    const rising = freed * (i % 3 === 0 || runny > 0.5 ? 1 : 0);
    if (rising > 0) { const yy = lerp(yb + a * 2, KTOP + 0.3, phase / 9); y = lerp(y, yy, rising); }
    if (rising > 0) r = lerp(r, 0.045 + 0.12 * Math.max(0, (y - yb) / (KTOP - yb)) ** 1.5, rising);
    if (y > KTOP - 0.05) return;                                        // popped at the surface
    const z = y > -1.7 ? (b - 0.5) * 0.35 : inBody(KB, y, b);
    out.push({x: front(KB, y, z), y, z, r: r * s.kin});
  });
  // Fizz: the one bubble the camera rides up the pipe while the squeeze lets go
  const fz = rise(t, B.rises - 0.1, B.depends - B.rises + 0.4);
  if (t < B.depends + 1.2) { const y = lerp(-3.9, -0.6, fz); out.push({x: front(KB, y, 0) + 0.02, y, z: 0, r: (0.06 + 0.2 * fz) * (1 - 0.5 * s.squeeze) * s.kin}); }
  return out;
};
// small puffs where Kilauea's bubbles pop at the summit (the gas getting out easily)
const kPops = (t: number): Puff[] => {
  const out: Puff[] = []; const on = rise(t, B.pop - 0.5, 0.6) * (1 - rise(t, B.silica, 1.5)) + 0.5 * win(t, B.recap, B.total, 0.6);
  if (on <= 0) return out;
  for (let i = 0; i < 26; i++) { const ph = ((t * 0.7 + i * 0.37) % 1.6) / 1.6; const r = rng(i + 40);
    out.push({x: (r() - 0.5) * 0.4, y: KTOP + 0.1 + ph * 1.8, z: (r() - 0.5) * 0.4 + ph * 0.6, s: 0.25 + ph * 1.2, o: on * 0.5 * (1 - ph) * Math.min(1, ph * 6), c: new THREE.Color('#f3f6f8')}); }
  return out;
};
const hBubbles = (t: number, s: ReturnType<typeof stateAt>): Bub[] => {
  const out: Bub[] = [];
  if (s.hin < 0.01) return out;
  const yb = -7.8, yt = -4.6;
  const stuck = rise(t, B.stuck - 0.3, 1.0), push = rise(t, B.push, 2.0);
  const burst = rise(s.tau, 3.2, 1.0);
  SEEDS.slice(0, 60).forEach(([a, b, c, d], i) => {
    // creep up a little, then stall under the neck; swell as they push; at the blast, race up and out
    const y0 = lerp(yb, yt, a);
    let y = lerp(y0, lerp(-4.0, -2.4, a), stuck * 0.7) + 0.05 * Math.sin(t * 9 + i) * push;
    let r = (0.035 + 0.025 * c) * (1 + 1.2 * stuck * c + 1.4 * push);
    y = lerp(y, HTOP + 2, Math.min(1, burst * (1 + d))); r *= 1 + 1.5 * burst;
    if (y > HTOP) return;
    const z = y > -2.7 ? (b - 0.5) * 0.4 : inBody(HB, y, b);
    out.push({x: front(HB, y, z), y, z, r: r * s.hin});
  });
  return out;
};

// ---------- ash: the sideways blast, the landslide's dust, the column ----------
const ASH = new THREE.Color('#857a6e'), DUST = new THREE.Color('#7e6a55'), ASHD = new THREE.Color('#544c46');
const ashPuffs = (tau: number): Puff[] => {
  const out: Puff[] = [];
  if (tau < 1.4) return out;
  const r = rng(7);
  // debris and dust from the slide, rolling north and down
  for (let i = 0; i < 50; i++) { const a = r(), b = r(), k = Math.max(0, Math.min(1, (tau - 1.5 - a * 0.4) / 1.6));
    if (k <= 0) continue;
    out.push({x: (b - 0.5) * 3 + (r() - 0.5), y: Y(2300) - k * 2.5 + r() * 0.4, z: -1.8 - k * (4 + 3 * a), s: 0.8 + k * 2.2, o: 0.75 * (1 - rise(tau, 4.5, 3)), c: DUST}); }
  // the lateral blast: low, fast, fanning north
  for (let i = 0; i < 220; i++) { const a = r(), b = r(), c = r(); const k = Math.max(0, (tau - 1.75 - a * 0.5) / 1.4);
    if (k <= 0) continue; const kk = Math.min(1, k);
    const ang = (b - 0.5) * 1.6;
    const d = 1.2 + kk * (10 + 6 * c);
    out.push({x: Math.sin(ang) * d, y: Y(2200) - kk * 1.5 + c * 1.2 * kk + 0.6 * Math.max(0, k - 1), z: -1.6 - Math.cos(ang) * d, s: 0.7 + kk * 3.4, o: 0.92 * (1 - rise(tau, 6, 4)), c: i % 3 ? ASH : ASHD}); }
  // the column: rises 24 km in under 15 minutes (tau 3 -> 8 here)
  const top = colTop(tau);
  for (let i = 0; i < 260; i++) { const a = r(), b = r(), c = r(); const h = Y(2400) + (top - Y(2400)) * Math.pow(a, 0.7);
    if (tau < 3) continue;
    const w = 0.5 + 0.1 * (h - Y(2400)) + (h > top - 4 ? 3.5 * (1 - (top - h) / 4) : 0);
    const ang = b * Math.PI * 2;
    out.push({x: Math.cos(ang) * w * c * 0.8, y: h + Math.sin(tau * 0.5 + i) * 0.3, z: Math.sin(ang) * w * c * 0.8, s: 0.8 + w * 0.55, o: 0.85 * rise(tau, 3 + a * 0.5, 0.6) * (1 - rise(tau, 11, 4) * 0.6), c: c > 0.6 ? ASHD : ASH}); }
  return out;
};

// ---------- the scene ----------
const Cam: React.FC<{t: number; shake: number}> = ({t, shake}) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const c = camAt(t);
  const sh = V(Math.sin(t * 61) * 0.08 * shake, Math.sin(t * 47 + 1) * 0.08 * shake, Math.sin(t * 53 + 2) * 0.05 * shake);
  cam.position.copy(c.pos).add(sh); cam.fov = c.fov; cam.near = 0.1; cam.far = 2500; cam.updateProjectionMatrix(); cam.lookAt(c.look);
  return null;
};

const Scene: React.FC<{t: number}> = ({t}) => {
  const gl = useThree((s) => s.gl); gl.localClippingEnabled = true;
  const scene = useThree((s) => s.scene);
  useMemo(() => { scene.fog = new THREE.FogExp2('#d9a894', 0.0032); }, [scene]);
  const s = stateAt(t);
  const kb = useMemo(() => kBubbles(t, s), [t]);
  const hb = useMemo(() => hBubbles(t, s), [t]);
  const ash = useMemo(() => ashPuffs(s.tau), [s.tau]);
  const pops = useMemo(() => kPops(t), [t]);
  const sticky = 1;
  const spoonIn = win(t, B.sticky - 0.4, B.push + 0.6, 0.5);
  return (
    <>
      <Cam t={t} shake={s.E.shake * (t > B.helens - 2 ? 1 : 0.4)} />
      <Sky />
      <Clouds t={t} />
      <hemisphereLight args={['#ffd9c4', '#3a2a2e', 0.9]} />
      <directionalLight position={SUN.clone().multiplyScalar(100)} intensity={2.4} color="#ffd2b0" />
      {/* Kilauea */}
      <group position={KP}>
        <Block spec={KS} cut={s.kcut} ox={KP.x} rockA="#3a2f2a" rockB="#4f4038" squeeze={s.squeeze} sq={V(0, -3.4, 1.5)} />
        <LavaRivers spec={KS} grow={s.rivers} glow={1.2} t={t} width={0.17} />
        {s.kin > 0.01 && <group scale={[FLAT, 1, 1]}>
          <Magma pts={KB} color={RUNNY} t={t} glow={1.1} fill={lerp(-7.1, KTOP, s.kin)} />
          <Bottle pts={KB} on={s.bottle * 0.9} cap={s.bottle * (1 - rise(t, B.hawaii + 0.6, 0.8))} capLift={0.8 * rise(t, B.hawaii, 1.4)} />
        </group>}
        <Bubbles list={kb} max={100} />
        <Slabs k={[0, 1, 2].map((i) => rise(t, B.squeeze - 0.6 + i * 0.45, 0.35) * (1 - rise(t, B.rises + 0.4 + i * 0.5, 0.8)))} y0={-1.3} w={3.2} />
        <Puffs list={pops} max={30} />
        {/* the lava lake glow in the summit pit */}
        <pointLight position={[0, KTOP + 0.8, 0]} color="#ff7a2a" intensity={6} distance={6} decay={2} />
      </group>
      {/* St. Helens */}
      <group position={HP}>
        <Block spec={HS} cut={s.hcut} ox={HP.x} rockA="#463a33" rockB="#5f5146" deform={{morph: s.E.morph, bulge: s.E.bulge, pre: s.E.pre}} />
        {s.hin > 0.01 && <group scale={[FLAT, 1, 1]}>
          <Magma pts={HB} color={STICKY} t={t} glow={0.9 * (1 + 0.6 * rise(s.tau, 1.8, 0.4))} fill={lerp(-8.3, HTOP, s.hin)} sticky={sticky} />
          <Bottle pts={HB} on={s.hin * 0.9 * (1 - 0.75 * rise(s.tau, 4, 2))} cap={s.hin * (1 - rise(s.tau, 3.5, 0.6))} capLift={s.E.cap} />
        </group>}
        <Bubbles list={hb} max={70} />
        {spoonIn > 0.01 && <Spoon pos={V(0.45, lerp(-0.5, -3.7, rise(t, B.sticky - 0.4, 0.9)), 0)} tilt={0.05 * Math.sin(t * 3) * spoonIn} scale={1.6 * spoonIn} />}
        <Puffs list={ash} max={540} />
        {/* the blast's flash on the north flank */}
        <pointLight position={[0, Y(2300), -2.5]} color="#ffb070" intensity={40 * win(s.tau, 1.75, 2.6, 0.2)} distance={14} decay={2} />
        <Ghost spec={HS} o={win(t, B.gone - 0.3, B.recap + 0.5, 0.5)} ox={HP.x + s.hcut} />
      </group>
    </>
  );
};

// ---------- overlays: cards, the column's markers, captions ----------
const projector = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.05, 3000);
const toScreen = (t: number, p: THREE.Vector3) => {
  const c = camAt(t);
  projector.position.copy(c.pos); projector.fov = c.fov; projector.updateProjectionMatrix(); projector.lookAt(c.look); projector.updateMatrixWorld();
  const v = p.clone().project(projector);
  return {x: (v.x * 0.5 + 0.5) * 1080, y: (1 - (v.y * 0.5 + 0.5)) * 1920, front: v.z < 1};
};
const Card: React.FC<{text: string; o: number; y?: number; size?: number; color?: string}> = ({text, o, y = 1290, size = 76, color = '#fff'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px) scale(${0.96 + 0.04 * o})`}}>
    <div style={{padding: '10px 30px 14px', borderRadius: 26, background: 'rgba(20,12,10,0.5)', fontFamily: SANS, color, fontSize: size, fontWeight: 800,
      letterSpacing: -1, whiteSpace: 'nowrap', textShadow: '0 2px 18px rgba(0,0,0,0.6)'}}>{text}</div>
  </div>
);
const Tag: React.FC<{text: string; o: number}> = ({text, o}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1440, textAlign: 'center', opacity: o * 0.85, fontFamily: SANS, fontSize: 30, fontWeight: 700, color: '#f3e6dc',
    textShadow: '0 1px 10px rgba(0,0,0,0.9)'}}>{text}</div>
);
const Pin: React.FC<{t: number; p: THREE.Vector3; text: string; o: number; dx?: number}> = ({t, p, text, o, dx = 50}) => {
  const s = toScreen(t, p);
  if (!s.front || o <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: s.x, top: s.y, opacity: o, transform: 'translateY(-50%)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: dx - 10, height: 3, background: 'rgba(255,255,255,0.8)', borderRadius: 2}} />
      <div style={{position: 'absolute', left: dx, top: -24, fontFamily: SANS, fontSize: 40, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', textShadow: '0 2px 14px rgba(0,0,0,0.85)'}}>{text}</div>
    </div>
  );
};

const LINES = [
  'Watch this volcano [ooze.]', 'Then watch this mountain [blow] [its] [top] [off.]',
  'The secret is [gas,]', 'hiding inside the hot melted rock.',
  'Deep underground, melted rock is called [magma.]', 'Magma holds gas, like the [fizz] in a soda.',
  'Down deep, the heavy rock above [squeezes] the gas in.',
  'But as magma [rises,]', 'the squeeze gets weaker.', 'So the gas makes [bubbles.]',
  'What happens next depends on the magma.',
  'In Hawaii, the magma is [runny.]', 'Bubbles rise right through it and [pop.]', 'The gas gets out [easily.]',
  'So the lava pours out in glowing [rivers.]',
  'Other magma has more [silica,]', 'the stuff that glass is mostly made of.', 'That makes it thick and [sticky,]', 'like peanut butter.',
  'Bubbles get [stuck] inside.', 'They push harder and harder.',
  'That is what happened at Mount Saint Helens in [1980.]', 'Sticky magma pushed the side of the mountain [out.]',
  'Then an [earthquake] shook it,', 'and the side [slid] [away.]', 'The trapped gas burst out with a [boom.]',
  'It was like opening a [shaken] [soda.]',
  'Ash shot up [15] [miles]', 'in under 15 minutes.', 'The top of the mountain was [gone.]',
  'So runny magma lets gas [out.]', 'It [oozes.]', 'Sticky magma [traps] gas.', 'It can blow its [top.]',
];

const Overlays: React.FC<{t: number}> = ({t}) => {
  const s = stateAt(t);
  const colO = win(t, B.ash - 0.2, B.gone + 0.2, 0.4);
  const mins = Math.min(15, Math.max(0, (s.tau - 3) / 5.0 * 15));
  return (
    <>
      <Card text="OOZE OR BOOM?" o={win(t, -1, B.secret - 0.1, 0.25)} />
      <Card text="MAGMA" o={win(t, B.magma + 0.2, B.squeeze - 0.2, 0.3)} color="#ffb070" />
      <Card text="HAWAII · RUNNY" o={win(t, B.hawaii, B.rivers + 1.2, 0.3)} color="#ffb070" />
      <Card text="HEAVY ROCK PRESSES" o={win(t, B.squeeze - 0.3, B.rises + 0.2, 0.3)} size={64} />
      <Card text="A SPOON STANDS UP IN IT" o={win(t, B.sticky + 0.3, B.stuck - 0.1, 0.3)} size={58} color="#e8d6c0" />
      <Card text="GAS TRAPPED" o={win(t, B.stuck + 0.1, B.helens - 0.4, 0.3)} color={ACC} />
      <Card text="THE SIDE BULGES OUT" o={win(t, B.side + 0.2, B.quake - 0.1, 0.3)} size={62} />
      <Card text="OLD TOP · GONE" o={win(t, B.gone, B.recap - 0.1, 0.3)} color={ACC} />
      <Card text="SILICA" o={win(t, B.silica + 0.2, B.sticky + 0.2, 0.3)} color="#e8d6c0" />
      <Card text="MOUNT ST. HELENS · 1980" o={win(t, B.helens + 0.2, B.side + 0.1, 0.3)} size={62} />
      <Card text="15 MILES UP" o={colO} color={ACC} />
      <Card text={`${Math.floor(mins)} min`} o={colO} y={1400} size={54} />
      <Card text="OOZE" o={win(t, B.oozes - 0.1, B.traps - 0.1, 0.25)} color="#ffb070" />
      <Card text="BOOM" o={win(t, B.blowtop - 0.2, B.total, 0.25)} color={ACC} />
      <Pin t={t} p={HP.clone().add(V(2.5, Y(11000), 0))} text="Jets fly here" o={colO * (1 - win(t, B.minutes - 1.5, B.gone, 0.3))} />
      <Pin t={t} p={HP.clone().add(V(4, COLUMN_TOP, 0))} text="15 miles" o={colO} />
      <Tag text="Real terrain (USGS) · heights ×1.5" o={win(t, 0, B.secret, 0.4)} />
      <Tag text="Old summit rebuilt from the slopes" o={win(t, B.helens, B.quake, 0.4)} />
    </>
  );
};

export const Film: React.FC<{captions?: boolean; audio?: boolean; aa?: boolean; bloom?: number}> = ({captions = true, audio = true, aa = true, bloom = 0.8}) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const ready = usePreload();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={bloom}>
        {ready && <ThreeCanvas width={1080} height={1920} gl={{antialias: aa, toneMapping: THREE.ACESFilmicToneMapping, logarithmicDepthBuffer: false}}>
          <Scene t={t} />
        </ThreeCanvas>}
      </Finish>
      <Overlays t={t} />
      {captions && <Captions t={t} words={words} lines={LINES} accent={ACC} font={SANS} />}
      {audio && <Audio src={staticFile('mix.wav')} />}
    </AbsoluteFill>
  );
};
