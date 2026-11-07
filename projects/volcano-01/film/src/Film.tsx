// Lightsaber 01: one continuous shot. Ridge at night (figure, battle station in the sky) -> the blade as a laser that
// never ends -> two beams passing through each other -> into the blade (plasma, lightning, thermometer) -> the emitter
// (spray, burning hand) -> glass hilt (magnets, field, the loop) -> the clash -> the crystal -> (through the crystal's
// light: the only haze) -> the station's dish charges and fires -> follow the beam down to the ridge -> recap -> battery.
// Every time is a beat from the voice (beats.json); every pose is a pure function of t.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {
  Blade, BLUE, RED, DISH, Dust, FieldLines, Figure, Ground, Hilt, HILT_LEN, Plasma, Sky, Sparks, Station, Superlaser, useRoomEnv, Arcs,
} from './world';
import words from './words.json';
import B from './beats.json';

export const FPS = 30;
export const DUR = Math.ceil(B.total * FPS);
const ACC = '#7fd6ff';
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sm = (x: number) => x * x * (3 - 2 * x);
const rise = (t: number, a: number, d = 0.4) => sm(Math.min(1, Math.max(0, (t - a) / d)));
const win = (t: number, a: number, b: number, f = 0.3) => Math.min(rise(t, a, f), 1 - rise(t, b - f, f));

// ---------- the world's layout ----------
const JB = V(0.05, 1.1, 0.32), A0 = V(-0.12, 1, 0.04).normalize(); // the Jedi's hilt base and blade axis
const E = JB.clone().addScaledVector(A0, HILT_LEN);                // the emitter
const P = (s: number) => E.clone().addScaledVector(A0, s);          // a point s metres up the blade
const BL = 0.95;
const SP: [number, number, number] = [0.85, 0, -0.25], SYAW = -0.997; // the second figure
const SB = V(0.85 - 0.266, 1.1, -0.25 + 0.178);
const C = P(0.55);                                                   // where the blades meet
const ST = V(150, 255, -1000), SR = 110;                             // the station
const SUN = V(-0.8, 0.35, 0.6).normalize();
const FOCUS = ST.clone().addScaledVector(DISH, SR * 1.35);
const TARGET = V(-60, 40, 900);                                      // the beam passes ~180 m over the ridge
const CRY = JB.clone().addScaledVector(A0, 0.172);                   // the crystal

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
    if (k === 0 || k === n - 1) return 0; // ease out of the first key and into the last
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
  const lx = ch((k) => k.look.x), ly = ch((k) => k.look.y), lz = ch((k) => k.look.z), fv = ch((k) => k.fov);
  return (t: number) => ({
    pos: V(pchip(ts, px, t), pchip(ts, py, t), pchip(ts, pz, t)),
    look: V(pchip(ts, lx, t), pchip(ts, ly, t), pchip(ts, lz, t)), fov: pchip(ts, fv, t),
  });
};
const off = (p: THREE.Vector3, x: number, y: number, z: number) => p.clone().add(V(x, y, z));
const HAZE = B.empire - 0.05; // the one pass-through: into the hilt crystal's light, out of the station's dish
const RIDGE = track([
  {t: 0, pos: V(0.55, 1.75, 1.55), look: P(0.3), fov: 36},
  {t: B.laser + 0.3, pos: V(0.68, 1.62, 2.3), look: P(0.15), fov: 38},
  {t: B.l1 - 0.1, pos: V(0.75, 1.45, 3.3), look: V(0.05, 1.5, 0), fov: 40},
  {t: B.never - 0.2, pos: V(0.55, 0.95, 1.7), look: E.clone().addScaledVector(A0, 6), fov: 46},
  {t: B.never + 1.1, pos: V(0.45, 1.0, 1.45), look: E.clone().addScaledVector(A0, 60), fov: 36},
  {t: B.l2 + 0.2, pos: V(0.45, 1.5, 2.7), look: V(0.4, 1.55, 0), fov: 42},
  {t: B.noclash + 0.5, pos: V(0.4, 1.55, 2.45), look: V(0.35, 1.6, 0), fov: 42},
  {t: B.plasma, pos: off(P(0.38), 0.34, 0.05, 0.5), look: P(0.4), fov: 38},
  {t: B.lightning + 0.2, pos: off(P(0.32), 0.1, 0.0, 0.16), look: P(0.33), fov: 34},
  {t: B.cutters, pos: off(P(0.3), 0.25, -0.3, 0.22), look: off(P(0.38), 0.07, 0, 0), fov: 40},
  {t: B.sun + 0.5, pos: off(P(0.8), 0.24, -0.18, 0.26), look: off(P(0.86), 0.07, 0, 0), fov: 40},
  {t: B.still, pos: off(E, 0.24, 0.08, 0.4), look: E.clone().addScaledVector(A0, 0.1), fov: 38},
  {t: B.burn + 0.3, pos: off(E, 0.26, 0.02, 0.42), look: E.clone().addScaledVector(A0, 0.02), fov: 38},
  {t: B.magnets + 0.2, pos: off(JB.clone().addScaledVector(A0, 0.22), 0.13, 0.0, 0.2), look: off(JB.clone().addScaledVector(A0, 0.24), 0.03, 0, 0), fov: 34},
  {t: B.tube + 0.5, pos: off(E, 0.13, 0.07, 0.21), look: E.clone().addScaledVector(A0, 0.18), fov: 36},
  {t: B.loops, pos: off(P(0.8), 0.07, 0.0, 0.12), look: P(0.93), fov: 36},
  {t: B.back + 0.3, pos: off(P(0.55), 0.3, 0.04, 0.5), look: P(0.52), fov: 40},
  {t: B.bend, pos: off(P(0.5), 0.36, 0.05, 0.62), look: P(0.48), fov: 40},
  {t: B.touch + 0.3, pos: off(C, 0.26, 0.04, 0.72), look: C, fov: 40},
  {t: B.clash, pos: off(C, 0.3, 0.12, 0.92), look: C, fov: 42},
  {t: B.kyber, pos: off(CRY, 0.07, 0.075, 0.1), look: CRY, fov: 30},
  {t: HAZE, pos: off(CRY, 0.01, 0.009, 0.014), look: CRY, fov: 30},
]);
const SKY = track([
  {t: HAZE, pos: FOCUS.clone().addScaledVector(DISH, SR * 0.5), look: ST, fov: 46},
  {t: B.gun + 0.5, pos: ST.clone().addScaledVector(DISH, SR * 3.3).add(V(-SR * 0.6, SR * 0.5, 0)), look: ST, fov: 40},
  // follow the beam down to the ridge: alongside it, then under it, then the figure
  {t: B.gun + 1.05, pos: FOCUS.clone().lerp(TARGET, 0.32).add(V(60, -40, -40)), look: FOCUS.clone().lerp(TARGET, 0.5), fov: 50},
  {t: B.notlaser - 0.15, pos: V(1.6, 1.2, 4.2), look: FOCUS.clone().lerp(TARGET, 0.42), fov: 50},
  {t: B.notlaser + 0.45, pos: V(1.0, 1.3, 3.2), look: V(0.3, 1.9, 0), fov: 46},
  {t: B.r_plasma, pos: off(E, 0.42, 0.1, 0.9), look: P(0.3), fov: 40},
  {t: B.r_crystal, pos: off(E, 0.02, -0.06, 0.8), look: JB.clone().addScaledVector(A0, 0.2), fov: 37},
  {t: B.battery, pos: off(E, 0.34, 0.05, 0.7), look: P(0.18), fov: 40},
  {t: B.total, pos: V(0.95, 1.5, 3.9), look: V(0.25, 1.6, 0), fov: 42},
]);
export const camAt = (t: number) => (t < HAZE ? RIDGE(t) : SKY(t));
const hazeAt = (t: number) => interpolate(t, [HAZE - 0.45, HAZE, HAZE + 0.5], [0, 1, 0], clamp);

// ---------- the state of the world at t (one visual language: see brief.md) ----------
const stateAt = (t: number) => {
  const laser = Math.min(rise(t, B.l1 + 0.35, 0.5), 1 - rise(t, B.plasma - 0.1, 0.6));
  const ext = t < B.l1 + 0.6 ? 0 : Math.min(3000, Math.exp((t - B.l1 - 0.6) * 4.2) - 1);
  const jLen = BL + ext * (1 - rise(t, B.plasma - 0.1, 0.6));
  const sIgn = rise(t, B.two - 0.1, 0.25) * (1 - rise(t, B.kyber + 0.4, 0.4));
  const wild = Math.min(rise(t, B.still + 0.1, 0.5), 1 - rise(t, B.tube - 0.2, 1.0));
  const see = Math.min(rise(t, B.plasma + 0.3, 0.6), 1 - rise(t, B.kyber + 0.8, 0.8)) * (0.5 + 0.35 * rise(t, B.still - 0.2, 0.5)) + win(t, B.r_plasma - 0.2, B.r_magnets + 0.2) * 0.6;
  const xray = Math.min(rise(t, B.magnets - 0.5, 0.6), 1 - rise(t, HAZE + 0.6, 0.6)) + win(t, B.r_plasma - 0.3, B.battery) * 0.9;
  const coils = Math.min(rise(t, B.magnets, 0.3), 1 - rise(t, B.kyber + 0.6, 0.6)) + win(t, B.r_magnets - 0.1, B.r_crystal + 0.2) * 1.2;
  const field = Math.min(rise(t, B.tube - 0.6, 0.6), 1 - rise(t, B.kyber + 0.3, 0.6)) + win(t, B.r_magnets - 0.1, B.r_crystal + 0.1);
  const crystal = 0.35 + rise(t, B.kyber, 0.3) * (0.65 + 0.25 * Math.sin(t * 9)) * (1 - rise(t, HAZE + 1, 1)) + win(t, B.r_crystal - 0.1, B.battery) * 1.0;
  const heat = Math.min(rise(t, B.burn - 0.3, 0.6), 1 - rise(t, B.tube, 0.8));
  const arcs = win(t, B.plasma + 0.2, B.cutters + 0.8, 0.4);
  // the second blade: a beam that sweeps through ours (no clash), then a plasma blade that meets ours (the clash)
  const aUp = V(0.3, 1, 0.08).normalize(), aSweep = V(-1, 0.32, 0.5).normalize(), aHit = C.clone().sub(SB).normalize();
  const sweep = rise(t, B.through - 0.35, 0.8);
  const hit = Math.min(rise(t, B.touch - 0.1, 0.35), 1 - rise(t, B.kyber - 0.2, 0.8));
  const press = hit > 0.99 ? 0.012 * Math.sin((t - B.touch) * 18) * Math.exp(-(t - B.touch) * 1.5) : 0;
  let sAxis = aUp.clone().lerp(aSweep, sweep).normalize();
  sAxis.lerp(aUp, rise(t, B.plasma - 0.3, 0.8)).normalize();
  sAxis.lerp(aHit, hit).normalize().add(V(press, 0, 0)).normalize();
  const contact = hit > 0.95 ? Math.min(1, 1 - rise(t, B.kyber - 0.5, 0.4)) : 0;
  const burst = interpolate(t, [B.burst - 0.1, B.burst + 0.1, B.burst + 0.9], [0, 1, 0], clamp);
  const charge = 0.45 * rise(t, HAZE - 0.1, 0.4) + 0.55 * rise(t, B.deathstar - 0.2, 1.2); // the crystal's light carries into the dish
  const trib = rise(t, B.gun - 0.1, 0.35);
  const fire = rise(t, B.gun + 0.35, 0.25) * (1 - rise(t, B.r_plasma + 0.3, 0.6));
  const skyFlash = 0.4 * fire * (0.7 + 0.3 * Math.sin(t * 40)) * (1 - rise(t, B.l11 + 0.4, 1.0));
  // the battery: flickers, shrinks to a stub, dies
  const fl = t > B.battery + 0.2 ? 0.75 + 0.25 * Math.sin(t * 47) * Math.sin(t * 13) : 1;
  const die = rise(t, B.nothing - 0.2, 1.8);
  const jIgn = (1 - die * 0.97) * (die > 0.96 ? 1 - rise(t, B.yet - 0.1, 0.3) : 1) * fl;
  return {laser, jLen, sIgn, wild, see, xray: Math.min(1, xray), coils: Math.min(1, coils), field: Math.min(1, field), crystal, heat, arcs, sAxis, contact, burst, press,
    charge, trib, fire, skyFlash, jIgn, die};
};

// ---------- the scene ----------
const Cam: React.FC<{t: number}> = ({t}) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const c = camAt(t);
  // the clash jolts the camera
  const j = interpolate(t, [B.touch + 0.2, B.touch + 0.25, B.touch + 0.6], [0, 1, 0], clamp) + 0.6 * interpolate(t, [B.burst, B.burst + 0.05, B.burst + 0.5], [0, 1, 0], clamp);
  const sh = V(Math.sin(t * 71) * 0.006 * j, Math.sin(t * 53 + 1) * 0.006 * j, 0);
  cam.position.copy(c.pos).add(sh); cam.fov = c.fov; cam.near = 0.004; cam.far = 6000; cam.updateProjectionMatrix(); cam.lookAt(c.look);
  return null;
};
const qAxis = (a: THREE.Vector3) => new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), a);

const Scene: React.FC<{t: number}> = ({t}) => {
  const env = useRoomEnv();
  const scene = useThree((s) => s.scene);
  useMemo(() => { scene.fog = new THREE.FogExp2('#1d2a44', 0.0045); }, [scene]);
  const s = stateAt(t);
  const jq = useMemo(() => qAxis(A0), []);
  const sq = qAxis(s.sAxis);
  const sE = SB.clone().addScaledVector(s.sAxis, HILT_LEN);
  const jBright = s.jIgn * (1 - s.wild * 0.6);
  return (
    <>
      <Cam t={t} />
      <Sky flash={s.skyFlash} />
      <hemisphereLight args={['#46557a', '#09090e', 0.45 + s.skyFlash * 0.6]} />
      <directionalLight position={SUN.clone().multiplyScalar(50)} intensity={0.35} color="#9fb0d8" />
      <directionalLight position={[3, 4, -6]} intensity={1.6} color="#aebfe6" />
      {s.fire > 0 && <directionalLight position={[60, 200, -400]} intensity={2.2 * s.skyFlash} color="#9dff8a" />}
      <pointLight position={P(0.4)} color={BLUE} intensity={1.7 * jBright} distance={4} decay={2} />
      {s.sIgn > 0 && <pointLight position={sE.clone().addScaledVector(s.sAxis, 0.4)} color={RED} intensity={1.4 * s.sIgn} distance={4} decay={2} />}
      {s.contact > 0 && <pointLight position={C} color="#ffd9a0" intensity={(1.2 + 4 * s.burst) * s.contact} distance={3} decay={2} />}
      <Ground />
      <Station pos={ST} r={SR} charge={s.charge} sun={SUN} haze={t < HAZE ? 0.12 : 0} spin={0} />
      <Superlaser station={ST} r={SR} k={s.trib} fire={s.fire} target={TARGET} />
      <Figure pos={[0, 0, 0]} yaw={0} cloth="#1f1813" base={JB} axis={A0} sway={Math.sin(t * 0.7)} heat={s.heat} />
      <Figure pos={SP} yaw={SYAW} cloth="#0d0c0e" base={SB} axis={s.sAxis} sway={Math.sin(t * 0.6 + 1)} heat={0} />
      <group position={JB} quaternion={jq}>
        <Hilt env={env} xray={s.xray} coils={s.coils} crystal={s.crystal} color={BLUE} />
        <group position={[0, HILT_LEN, 0]}>
          <Blade len={s.jLen * (1 - s.die * 0.96)} color={BLUE} ign={s.jIgn > 0.01 ? 1 : 0} t={t} laser={s.laser} see={s.see} dim={1 - s.wild * 0.85} />
          <Plasma t={t} len={BL} wild={s.wild} loop={Math.max(s.see, 0.0001) * (1 - s.die)} color={BLUE} />
          <FieldLines len={BL} on={s.field * (1 - s.die)} t={t} bulge={s.contact * (0.4 + 2.5 * s.burst)} />
          <Arcs t={t} len={BL} on={s.arcs} />
        </group>
      </group>
      <group position={SB} quaternion={sq}>
        <Hilt env={env} xray={0} coils={0} crystal={s.sIgn} color={RED} dark />
        <group position={[0, HILT_LEN, 0]}>
          <Blade len={s.laser > 0.5 ? 3 : BL} color={RED} ign={s.sIgn} t={t} laser={s.laser} seed={3} />
          <FieldLines len={BL} on={s.contact * 0.9} t={t + 3} bulge={s.contact * (0.4 + 2.5 * s.burst)} />
        </group>
      </group>
      <Sparks t={t} on={s.contact * (0.35 + 0.65 * s.burst)} pos={C} />
      <Dust t={t} center={JB} amount={1} />
    </>
  );
};

// ---------- overlays: cards, the thermometer, distance markers, labels, captions ----------
const projector = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.004, 6000);
const toScreen = (t: number, p: THREE.Vector3) => {
  const c = camAt(t);
  projector.position.copy(c.pos); projector.fov = c.fov; projector.updateProjectionMatrix(); projector.lookAt(c.look); projector.updateMatrixWorld();
  const v = p.clone().project(projector);
  return {x: (v.x * 0.5 + 0.5) * 1080, y: (1 - (v.y * 0.5 + 0.5)) * 1920, front: v.z < 1};
};
const Card: React.FC<{text: string; o: number; y?: number; size?: number; color?: string}> = ({text, o, y = 1290, size = 76, color = '#fff'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px) scale(${0.96 + 0.04 * o})`}}>
    <div style={{padding: '10px 30px 14px', borderRadius: 26, background: 'rgba(6,10,18,0.55)', fontFamily: SANS, color, fontSize: size, fontWeight: 800,
      letterSpacing: -1, whiteSpace: 'nowrap', textShadow: '0 2px 18px rgba(0,0,0,0.6)'}}>{text}</div>
  </div>
);
const Tag: React.FC<{text: string; o: number}> = ({text, o}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1440, textAlign: 'center', opacity: o * 0.85, fontFamily: SANS, fontSize: 30, fontWeight: 700, color: '#dfe8f5',
    textShadow: '0 1px 10px rgba(0,0,0,0.9)'}}>{text}</div>
);
// a label pinned to a 3D point: a short tick and text
const Pin: React.FC<{t: number; p: THREE.Vector3; text: string; o: number; dx?: number; big?: boolean}> = ({t, p, text, o, dx = 60, big}) => {
  const s = toScreen(t, p);
  if (!s.front || o <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: s.x, top: s.y, opacity: o, transform: 'translateY(-50%)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: dx - 10, height: 3, background: 'rgba(255,255,255,0.75)', borderRadius: 2}} />
      <div style={{position: 'absolute', left: dx, top: big ? -34 : -24, fontFamily: SANS, fontSize: big ? 60 : 42, fontWeight: 800, color: big ? ACC : '#fff', whiteSpace: 'nowrap',
        textShadow: '0 2px 14px rgba(0,0,0,0.85)'}}>{text}</div>
    </div>
  );
};

const LINES = [
  'Most people think this is a [laser.]',
  'But a laser would make a [terrible] [sword.]', "Light doesn't stop,", 'so your blade would [never] [end.]',
  'And two lasers would pass right [through] each other.', 'No [clash] at all.',
  'So many fans think the blade is [plasma:]', 'gas so hot that it glows, like [lightning.]',
  'Real plasma cutters run at over [20,000] [degrees.]', "That's hotter than the surface of the [Sun.]",
  "But plasma won't hold still.", 'It [sprays] [out,]', 'and it would [burn] the hand holding it.',
  'So the hilt could use [magnets]', 'to hold the plasma in a thin [tube.]',
  'In the old Star Wars books,', 'the plasma [loops] at the tip', 'and flows [back] into the hilt.', 'That loop gives the blade its [end.]',
  'When two blades [touch,]', 'their magnetic fields [snap] and join up,', 'and throw off a [burst] of plasma.', "That's the [clash.]",
  'In Star Wars, the power comes', 'from a [kyber] [crystal] inside the hilt.',
  'The Empire put giant kyber crystals', "in the [Death] [Star's] main gun.",
  "So it's not a laser.", "It's [plasma,]", 'held by [magnets,]', 'powered by a [crystal.]',
  'The hard part is the [battery.]', 'Nothing that small is strong enough [yet.]',
];

const Overlays: React.FC<{t: number}> = ({t}) => {
  const s = stateAt(t);
  return (
    <>
      {/* distance markers ride up the beam that never ends */}
      {[[1, '1 m', B.never - 0.6], [10, '10 m', B.never - 0.15], [1000, '1 km', B.never + 0.4], [2900, 'still going…', B.never + 0.8]].map(([d, txt, a]) => (
        <Pin key={txt as string} t={t} p={E.clone().addScaledVector(A0, d as number)} text={txt as string} o={win(t, a as number, B.l2 - 0.1, 0.25) * s.laser} dx={50} />
      ))}
      {/* the thermometer up the blade */}
      {[[0.3, 'Oven · 250 °C', B.cutters - 0.1], [0.48, 'Lava · 1,200 °C', B.cutters + 0.9], [0.66, "Sun's surface · 5,500 °C", B.sun - 0.4], [0.88, 'Plasma cutter · 20,000 °C+', B.twenty]].map(([sv, txt, a], i) => (
        <Pin key={i} t={t} p={P(sv as number).add(V(0.02, 0, 0))} text={txt as string} o={win(t, a as number, B.sun + 1.2, 0.3)} dx={40} />
      ))}
      <Card text="Burns your hand" o={win(t, B.burn - 0.1, B.magnets - 0.2, 0.3)} color="#ffb37a" />
      <Card text="Fields push back" o={win(t, B.touch + 0.6, B.clash + 0.9, 0.3)} color="#cfc3ff" />
      <Pin t={t} p={JB.clone().addScaledVector(A0, 0.244).add(V(0.025, 0, 0))} text="magnets" o={win(t, B.magnets + 0.1, B.loops - 0.2, 0.3)} dx={40} />
      <Pin t={t} p={CRY.clone().add(V(0.02, 0, 0))} text="kyber crystal" o={win(t, B.kyber + 0.2, HAZE - 0.3, 0.3)} dx={40} big />
      <Card text="A laser?" o={win(t, 0.15, B.l1 + 0.2, 0.25)} />
      <Card text="No clash" o={win(t, B.noclash - 0.1, B.plasma - 0.2, 0.25)} />
      <Card text="20,000 °C+" o={win(t, B.twenty, B.sun + 1.0, 0.25)} y={1320} color={ACC} />
      <Card text="Low battery" o={win(t, B.battery + 0.1, B.total, 0.3)} color="#ff8a80" />
      <Card text="Death Star" o={win(t, B.deathstar - 0.1, B.l11 - 0.4, 0.3)} />
      <Tag text="Fan theory · not how the films explain it" o={win(t, B.plasma, B.kyber - 0.2, 0.4) * (1 - win(t, B.l7, B.touch - 0.2, 0.3))} />
      <Tag text="From the old Star Wars Legends books" o={win(t, B.l7 + 0.1, B.touch - 0.3, 0.3)} />
      <Tag text="Star Wars canon" o={win(t, B.kyber - 0.1, B.l11 - 0.2, 0.3)} />
    </>
  );
};

export const Film: React.FC<{captions?: boolean; audio?: boolean; aa?: boolean; bloom?: number}> = ({captions = true, audio = true, aa = true, bloom = 1}) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const haze = hazeAt(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={bloom}>
        <ThreeCanvas width={1080} height={1920} gl={{antialias: aa, toneMapping: THREE.ACESFilmicToneMapping, logarithmicDepthBuffer: true}}>
          <Scene t={t} />
        </ThreeCanvas>
        {/* the crystal's light the camera passes through */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #e8f7ff 0%, #8fd6ff 45%, #2a78b8 100%)', opacity: haze}} />
      </Finish>
      <Overlays t={t} />
      {captions && <Captions t={t} words={words} lines={LINES} accent={ACC} font={SANS} />}
      {audio && <Audio src={staticFile('mix.wav')} />}
    </AbsoluteFill>
  );
};
