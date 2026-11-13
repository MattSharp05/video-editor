// Chameleon color 01 (script v1, option A): one continuous shot. A green chameleon on a mossy branch -> a rival
// walks up; the hero flushes bright and puffs up, the rival goes dark and backs away into a sunbeam -> the hero calms to
// green and the camera pushes into its flank -> inside the skin: the yellow layer, the crystal lattice; a sunbeam
// bounces back blue and leaves green; the crystals spread and it leaves orange; dark arms rise from the bottom ->
// recap at speed -> back out to the branch, where the hero turns an eye to us. Every time is a beat from the voice
// (beats.json); every pose is a function of t.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Chameleon} from './chameleon';
import {Forest, ROLL} from './forest';
import {SkinWorld} from './skinworld';
import words from './words.json';
import B from './beats.json';

export const FPS = 30;
export const DUR = Math.ceil(B.total * FPS);
const ACC = '#ffc65a';
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const rig = (x: number, y: number, z: number) => V(x, y, z).applyAxisAngle(V(0, 0, 1), ROLL);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sm = (x: number) => x * x * (3 - 2 * x);
const rise = (t: number, a: number, d = 0.4) => sm(Math.min(1, Math.max(0, (t - a) / d)));
const win = (t: number, a: number, b: number, f = 0.3) => Math.min(rise(t, a, f), 1 - rise(t, b - f, f));

// ---------- the two switches between the branch and the skin (each hidden in a soft green flash) ----------
export const SW1 = B.nopaint_end + 0.35, SW2 = B.next - 0.55;
const act = (t: number) => (t < SW1 ? 'forest1' : t < SW2 ? 'skin' : 'forest2');
const flashAt = (t: number) => Math.max(...[SW1, SW2].map((s) => interpolate(t, [s - 0.35, s, s + 0.4], [0, 1, 0], clamp)));

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

const FOREST1 = track([
  {t: 0, pos: rig(0.2, 0.07, 0.95), look: rig(0.12, -0.03, 0), fov: 34},
  {t: B.talk, pos: rig(0.22, 0.065, 0.86), look: rig(0.15, -0.03, 0), fov: 34},
  {t: B.bright - 0.1, pos: rig(0.27, 0.14, 1.35), look: rig(0.29, -0.02, 0), fov: 40},
  {t: B.win, pos: rig(0.3, 0.13, 1.3), look: rig(0.32, -0.02, 0), fov: 39},
  {t: B.sun, pos: rig(0.42, 0.13, 1.22), look: rig(0.48, -0.02, 0), fov: 38},
  {t: B.how + 0.7, pos: rig(0.14, 0.02, 0.32), look: rig(0.1, -0.012, 0.02), fov: 32},
  {t: SW1, pos: rig(0.1, -0.009, 0.05), look: rig(0.1, -0.012, 0.025), fov: 30},
]);
const SKIN = track([
  {t: SW1, pos: V(0.3, 5.2, 2.4), look: V(0, 1.7, 1.2), fov: 40},
  {t: B.yellow, pos: V(4.2, 2.6, 11.5), look: V(0, 0.2, 0), fov: 36},
  {t: B.calm, pos: V(1.6, 1.9, 9.0), look: V(0, 1.0, 1.2), fov: 40},
  {t: B.excited, pos: V(1.3, 1.6, 8.0), look: V(0, 0.8, 1.3), fov: 40},
  {t: B.turndark, pos: V(3.8, 2.2, 10.8), look: V(0, 0.1, 0), fov: 36},
  {t: B.recap + 0.5, pos: V(3.4, 2.4, 10.2), look: V(0, 0.4, 0), fov: 36},
  {t: SW2 - 1.4, pos: V(3.0, 2.5, 9.6), look: V(0, 0.5, 0.3), fov: 36},
  {t: SW2, pos: V(0.3, 5.6, 2.4), look: V(0, 1.7, 1.2), fov: 40},
]);
const FOREST2 = track([
  {t: SW2, pos: rig(0.1, -0.009, 0.05), look: rig(0.1, -0.012, 0.025), fov: 30},
  {t: B.closely, pos: rig(0.3, 0.04, 0.3), look: rig(0.2, -0.005, 0), fov: 32},
  {t: B.total, pos: rig(0.36, 0.05, 0.24), look: rig(0.215, -0.005, 0), fov: 32},
]);

const Cam: React.FC<{t: number}> = ({t}) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const a = act(t), c = a === 'forest1' ? FOREST1(t) : a === 'skin' ? SKIN(t) : FOREST2(t);
  cam.position.copy(c.pos); cam.fov = c.fov; cam.near = a === 'skin' ? 0.05 : 0.004; cam.far = 80; cam.updateProjectionMatrix(); cam.lookAt(c.look);
  return null;
};

// ---------- the branch: hero and rival ----------
const R0 = 0.8; // rival's start (rig x); it walks toward the hero, then backs away
const rivalTravel = (t: number) => 0.14 * sm(Math.min(1, Math.max(0, (t - (B.talk - 0.2)) / (B.bright - B.talk + 0.4)))) - 0.2 * rise(t, B.win + 0.2, B.how - B.win);
const Branch: React.FC<{t: number}> = ({t}) => {
  const a = act(t);
  const hot = a === 'forest1' ? rise(t, B.bright, 1.3) * (1 - rise(t, B.how + 0.1, 1.4)) : 0.35 * rise(t, B.talking, 0.8);
  const puff = a === 'forest1' ? win(t, B.bright + 0.3, B.cold, 0.6) : 0;
  const look = a === 'forest1' ? 0.35 * rise(t, B.talk, 0.6) * (1 - rise(t, B.how, 0.6)) : -0.32 * rise(t, B.closely, 0.5);
  const pitch = a === 'forest2' ? -0.12 * rise(t, B.closely, 0.5) : 0;
  const rt = rivalTravel(t);
  return (
    <>
      <Chameleon skin={{hot, dark: 0}} pose={{puff, eye: [[look, pitch], [look, 0]]}} />
      {a === 'forest1' && t > B.talk - 0.5 && (
        <Chameleon skin={{hot: 0, dark: rise(t, B.dark, 1.5)}} pose={{travel: rt, eye: [[0.3, 0], [0.3, 0]]}} position={V(R0 - rt, 0, 0)} yaw={Math.PI} />
      )}
      {a === 'forest1' && <Shaft o={win(t, B.cold - 0.3, B.how + 0.3, 0.5)} at={V(R0 - rt, -0.03, 0)} />}
    </>
  );
};
// a soft sunbeam falling on the rival as it warms up
const Shaft: React.FC<{o: number; at: THREE.Vector3}> = ({o, at}) => {
  if (o < 0.01) return null;
  return (
    <mesh position={at.clone().add(V(-0.12, 0.35, -0.02))} rotation={[0, 0, 0.35]}>
      <cylinderGeometry args={[0.07, 0.12, 0.8, 24, 1, true]} />
      <meshBasicMaterial color="#fff2c0" transparent opacity={0.28 * o} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} />
    </mesh>
  );
};

// ---------- inside the skin ----------
const skinAnim = (t: number) => {
  const recap = t >= B.recap;
  return {
    t,
    yellowGlow: win(t, B.yellow, B.crystals + 0.3, 0.3),
    crysGlow: win(t, B.crystals, B.calm, 0.3) + (recap ? 0.4 * win(t, B.recap, B.r_far + 0.3, 0.3) : 0),
    beamIn: rise(t, B.calm + 0.2, 0.9),
    out: rise(t, B.blue - 0.1, 0.7),
    exit: rise(t, B.through + 0.2, 0.9),
    spread: recap ? 1 - rise(t, B.recap, 0.6) + rise(t, B.r_far, 0.6) : rise(t, B.apart - 0.3, 1.3),
    dark: recap ? 1 - rise(t, B.recap, 0.5) + rise(t, B.r_dark + 0.1, 1.0) : rise(t, B.turndark + 0.3, 1.6),
  };
};

// ---------- cards ----------
const Card: React.FC<{text: string; o: number; y?: number; size?: number; color?: string; sub?: string}> = ({text, o, y = 1250, size = 72, color = '#fff', sub}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px) scale(${0.96 + 0.04 * o})`}}>
    <div style={{padding: '12px 32px 16px', borderRadius: 28, background: 'rgba(4,16,22,0.55)', fontFamily: SANS, color, fontSize: size, fontWeight: 800, letterSpacing: -1, whiteSpace: 'nowrap', textAlign: 'center', textShadow: '0 2px 18px rgba(0,0,0,0.6)'}}>
      {text}
      {sub && <div style={{fontSize: size * 0.45, fontWeight: 700, color: '#d8eef2', letterSpacing: 0, marginTop: 2}}>{sub}</div>}
    </div>
  </div>
);

// caption sense units, checked word for word against words.json; [key] words take the accent
import {LINES} from './lines';

export const Film: React.FC<{captions?: boolean; audio?: boolean}> = ({captions = true, audio = true}) => {
  const fr = useCurrentFrame(), t = fr / FPS, a = act(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={a === 'skin' ? 0.55 : 0.4}>
        <ThreeCanvas key={a === 'skin' ? 'skin' : 'forest'} width={1080} height={1920} shadows gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping}}>
          <Cam t={t} />
          {a === 'skin' ? <SkinWorld {...skinAnim(t)} /> : (
            <Forest><Branch t={t} /></Forest>
          )}
        </ThreeCanvas>
      </Finish>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #f4ffe8 0%, #c8f0b0 45%, #7cc46a 100%)', opacity: flashAt(t), pointerEvents: 'none'}} />
      <Card text="Bright = back off" o={win(t, B.bright + 0.3, B.dark - 0.1, 0.25)} color="#ffab7a" />
      <Card text="Dark = you win" o={win(t, B.dark + 0.2, B.cold - 0.1, 0.25)} color="#e6dccb" />
      <Card text="No green pigment" o={win(t, B.nopaint, B.outer - 0.1, 0.25)} color="#9dff7a" />
      <Card text="Iridophores" sub="crystal cells" o={win(t, B.crystals, B.calm - 0.1, 0.25)} color="#8ff0e4" />
      <Card text="Blue + yellow = green" o={win(t, B.green - 0.2, B.excited - 0.1, 0.25)} color="#9dff7a" />
      <Card text="Spread apart = orange" o={win(t, B.glows, B.turndark - 0.1, 0.25)} color="#ffb36a" />
      <Card text="Melanophores" sub="dark cells" o={win(t, B.turndark + 0.3, B.recap - 0.1, 0.25)} color="#e6dccb" />
      {captions && <Captions t={t} words={words} lines={LINES} accent={ACC} font={SANS} />}
      {audio && <Audio src={staticFile('mix.wav')} />}
    </AbsoluteFill>
  );
};
