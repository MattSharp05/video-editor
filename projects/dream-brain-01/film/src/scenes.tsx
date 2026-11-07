// Dream brain 01: the worlds of the one-shot film, each drawn only from t (seconds) and beats.json.
//   TownNight  his town at night: windows go dark; one stays lit; we drop to it. Also the morning at the end.
//   Bedroom    the man asleep, a glow under the skin of his head; the bedside clock; waking at the end.
//   BrainCity  inside his head: the brain as a city at night; brainstem, eyes, spinal barrier, the dream model; the recap.
//   DreamTown  the full-size dream: he flies over his town inside his brain (feelings, the front, memories).
//   Neuron     one streetlight becomes a brain cell: a spark down its arm, messengers across the gap.
// The worlds change only inside a glow the camera passes through (a window, his skin, the model, a streetlight).
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {anchorFromEnd, checkJoints} from './kit/joints';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {Town, LAYOUT, WinState} from './kit/town';
import {Brain, Levels, useBrainParts} from './kit/brain';
import {C, glowTex, lerp, lin, makeGlowPoints, path3, pulse, ramp, rnd, seq, textTex} from './kit/shared';
import {useNeuronGeo} from './kit/neuron';
import B from './beats.json';

const useCam = (pos: THREE.Vector3, look: THREE.Vector3, fov = 40, near = 0.05, far = 500, roll = 0) => {
  const {camera, gl, scene} = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.copy(pos); c.up.set(Math.sin(roll), Math.cos(roll), 0); c.lookAt(look); c.fov = fov; c.near = near; c.far = far; c.updateProjectionMatrix();
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0;
  return {scene, gl};
};
const Fog: React.FC<{color: string; density: number}> = ({color, density}) => {
  const {scene} = useThree();
  // mutate one fog object: a new fog object every frame makes three.js re-prepare every material (very slow renders)
  if (!(scene.fog instanceof THREE.FogExp2)) scene.fog = new THREE.FogExp2(color, density);
  (scene.fog as THREE.FogExp2).color.set(color); (scene.fog as THREE.FogExp2).density = density;
  if (!(scene.background instanceof THREE.Color)) scene.background = new THREE.Color(color);
  (scene.background as THREE.Color).set(color);
  return null;
};
const Glow: React.FC<{p: [number, number, number] | THREE.Vector3; c: string; s: number; o?: number}> = ({p, c, s, o = 1}) => o > 0.005 ? (
  <sprite position={p as any} scale={[s, s, s]}><spriteMaterial map={glowTex()} color={c} transparent opacity={Math.min(1, o)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} /></sprite>
) : null;
const Dust: React.FC<{n: number; box: [number, number, number]; c?: string; s?: number; seed: string; t: number; o?: number}> = ({n, box, c = '#7d93d8', s = 0.06, seed, t, o = 0.5}) => {
  const gp = useMemo(() => makeGlowPoints(n), [n]);
  gp.set(seq(n, (i) => ({p: [(rnd(seed + 'x' + i) - 0.5) * box[0] + Math.sin(t * 0.3 + i) * 0.1, (rnd(seed + 'y' + i) - 0.5) * box[1] + t * 0.03 * (rnd(seed + 'v' + i) - 0.3), (rnd(seed + 'z' + i) - 0.5) * box[2]] as [number, number, number],
    s: s * (0.5 + rnd(seed + 's' + i)), c, o: o * (0.4 + 0.6 * rnd(seed + 'o' + i))})));
  return <primitive object={gp.pts} />;
};
// A batch of glows drawn in one call: pass the items each frame.
const Glows: React.FC<{items: {p: THREE.Vector3 | [number, number, number]; s: number; c: string; o: number}[]; max: number}> = ({items, max}) => {
  const gp = useMemo(() => makeGlowPoints(max), [max]);
  gp.set(items);
  return <primitive object={gp.pts} />;
};
const Moon: React.FC<{p: [number, number, number]; s: number}> = ({p, s}) => (
  <group position={p}>
    <mesh><circleGeometry args={[s, 48]} /><meshBasicMaterial color="#E9EEFF" fog={false} toneMapped={false} /></mesh>
    <Glow p={[0, 0, -0.1]} c="#9fb6ff" s={s * 7} o={0.45} />
  </group>
);

// =====================================================================================================================
// TOWN AT NIGHT (metres). Opening: high above in fog, windows going dark one by one; one stays lit; we drop to it.
// Ending (phase 'morning'): pulled back out of his window; windows switch on for morning.
// =====================================================================================================================
export const TownNight: React.FC<{t: number; phase: 'open' | 'morning'}> = ({t, phase}) => {
  const {W, B: BL, homeWin} = LAYOUT;
  const home = W[homeWin].p;
  const winAt = useMemo(() => {
    // the windows that are on at the start, and when each goes dark (opening) or comes on (morning)
    return W.map((w, i) => ({on: w.r < 0.55 || i === homeWin, offT: lerp(0.3, B.l1 - 0.6, rnd('off' + i)), onT: lerp(B.slips - 0.2, B.total, rnd('mon' + i))}));
  }, []);
  const ws: WinState = (i) => {
    if (i === homeWin) return [1.25, '#FFD49A'];
    const a = winAt[i];
    if (phase === 'open') return [a.on && t < a.offT ? 0.9 : 0.0, '#FFC98A'];
    return [t > a.onT ? 0.8 : 0, '#CFE2FF'];
  };
  let pos: THREE.Vector3, look: THREE.Vector3;
  const win = new THREE.Vector3(home.x, home.y, home.z);
  if (phase === 'open') {
    // high above, drifting; then a long drop to the lit window, ending nose-to-glass (pass-through)
    pos = path3([[0, [-34, 46, 52]], [B.l0 + 2.2, [-18, 30, 34]], [B.l1 - 0.2, [win.x - 1, win.y + 4, win.z + 10]], [B.into_room, [win.x, win.y + 0.05, win.z + 0.6]]], t);
    look = path3([[0, [0, 0, 0]], [B.l0 + 2.2, [win.x * 0.6, 0, win.z * 0.5]], [B.into_room, [win.x, win.y, win.z]]], t);
  } else {
    const k = ramp(t, B.slips - 0.4, B.total);
    pos = new THREE.Vector3(lerp(win.x, -22, k), lerp(win.y, 26, k), lerp(win.z + 0.6, 40, k));
    look = new THREE.Vector3(lerp(win.x, 0, k), 0, lerp(win.z, 0, k));
  }
  useCam(pos, look, 42, 0.05, 400);
  const dawn = phase === 'morning' ? ramp(t, B.slips, B.total) : 0;
  const fogC = new THREE.Color('#0b1228').lerp(new THREE.Color('#3a4a7a'), dawn).getStyle();
  return (
    <>
      <Fog color={fogC} density={0.009} />
      <hemisphereLight args={['#5a70c0', '#0a0e1e', 1.1 + dawn]} />
      <directionalLight position={[-30, 40, 20]} color="#9fb6ff" intensity={2.2} />
      <Town winState={ws} />
      <Moon p={[-60, 55, -90]} s={4} />
      <Glow p={[win.x, win.y, win.z + 0.3]} c="#FFC98A" s={2.4} o={0.8} />
      <pointLight position={[win.x, win.y, win.z + 1.5]} color="#FFC98A" intensity={4} distance={8} decay={1.6} />
      <Glows max={40} items={LAYOUT.lights.map((p) => ({p: [p.x, 3.05, p.z] as [number, number, number], c: '#FFD9A0', s: 1.4, o: 0.55}))} />
      <Dust n={160} box={[80, 30, 80]} seed="tn" t={t} s={0.3} o={0.25} />
    </>
  );
};

// =====================================================================================================================
// BEDROOM (metres). The man asleep on his back, face up, side-on to us. Head made of a cranium, a face profile and
// soft details; lit by moonlight and, from inside, by the glow of his busy brain.
// =====================================================================================================================
const headProfile = () => {
  // upright profile facing -x, in metres (head ~0.24 tall), then extruded and rounded
  const k = 0.00062, P = (x: number, y: number): [number, number] => [x * k, -y * k];
  const s = new THREE.Shape(); s.moveTo(...P(70, 215));
  const Cv = (a: number, b: number, c: number, d: number, e: number, f: number) => s.bezierCurveTo(...P(a, b), ...P(c, d), ...P(e, f));
  Cv(150, 150, 175, 40, 165, -40); Cv(155, -145, 75, -205, -20, -205); Cv(-115, -205, -168, -140, -172, -62); Cv(-174, -30, -186, -8, -206, 24);
  Cv(-210, 34, -200, 44, -184, 46); Cv(-182, 58, -190, 68, -184, 78); Cv(-180, 92, -188, 104, -174, 118); Cv(-154, 148, -112, 150, -84, 150);
  Cv(-66, 168, -56, 192, -56, 215); s.lineTo(...P(70, 215));
  const g = new THREE.ExtrudeGeometry(s, {depth: 0.07, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.02, bevelSegments: 12, curveSegments: 64});
  g.translate(0, 0, -0.035); return g;
};
const sculptHead = () => {
  const g = new THREE.SphereGeometry(1, 160, 120), p = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
  const bump = (v: THREE.Vector3, c: [number, number, number], r: number) => Math.exp(-((v.x - c[0]) ** 2 + (v.y - c[1]) ** 2 + (v.z - c[2]) ** 2) / (r * r));
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let x = v.x * 0.1, y = v.y * 0.118, z = v.z * 0.078;
    if (v.y < -0.1) { x -= 0.02 * (-v.y - 0.1) * Math.max(0, -v.x); z *= 1 - 0.25 * (-v.y - 0.1); }   // jaw narrows, face comes forward
    x -= 0.03 * bump(v, [-1, -0.12, 0], 0.22);    // nose
    x -= 0.008 * bump(v, [-0.95, 0.25, 0], 0.35); // brow
    x -= 0.012 * bump(v, [-0.8, -0.72, 0], 0.25); // chin
    x -= 0.006 * bump(v, [-0.95, -0.42, 0], 0.18); // lips
    x += 0.008 * (bump(v, [-0.82, 0.08, 0.45], 0.2) + bump(v, [-0.82, 0.08, -0.45], 0.2)); // eye sockets
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals(); return g;
};
export const Bedroom: React.FC<{t: number; phase: 'asleep' | 'wake'}> = ({t, phase}) => {
  const head = useMemo(sculptHead, []);
  const clock = useMemo(() => ({night: textTex('3:04', '#7FD0FF'), morning: textTex('7:00', '#FF8A6E')}), []);
  // the head sits at the origin; face up (+y); top of head toward +x (headboard)
  const HEAD = new THREE.Vector3(0.02, 0.69, 0), HIP = new THREE.Vector3(-0.95, 0.5, 0);
  const headRef = useRef<THREE.Mesh>(null), neckRef = useRef<THREE.Mesh>(null), shoulderRef = useRef<THREE.Mesh>(null), torsoRef = useRef<THREE.Mesh>(null), legsRef = useRef<THREE.Mesh>(null);
  // joint check at every pose (fails the still if a part floats free)
  useLayoutEffect(() => checkJoints([
    {name: 'neck-head', a: neckRef.current!, b: headRef.current!, maxGap: 0.002},
    {name: 'neck-shoulders', a: neckRef.current!, b: shoulderRef.current!, maxGap: 0.002},
    {name: 'shoulders-torso', a: shoulderRef.current!, b: torsoRef.current!, maxGap: 0.002},
    {name: 'torso-legs', a: torsoRef.current!, b: legsRef.current!, maxGap: 0.002},
  ]));
  let pos: THREE.Vector3, look: THREE.Vector3;
  if (phase === 'asleep') {
    // arrive through the window glow, settle over him, push to his temple (pass-through into the brain)
    pos = path3([[B.into_room, [-1.3, 1.5, 2.8]], [B.l1 + 0.8, [-0.25, 0.85, 1.25]], [B.into_brain, [HEAD.x + 0.02, HEAD.y + 0.03, 0.12]]], t);
    look = path3([[B.into_room, [-0.5, 0.55, 0]], [B.l1 + 0.8, [HEAD.x - 0.05, HEAD.y, 0]], [B.into_brain, [HEAD.x + 0.02, HEAD.y + 0.03, 0]]], t);
  } else {
    const k = ramp(t, B.alarm, B.slips + 0.4);
    pos = new THREE.Vector3(lerp(HEAD.x, -1.2, k), lerp(HEAD.y + 0.05, 1.4, k), lerp(0.4, 2.6, k));
    look = new THREE.Vector3(lerp(HEAD.x, -0.3, k), lerp(HEAD.y, 0.6, k), 0);
  }
  useCam(pos, look, 40, 0.01, 60);
  const brainGlow = phase === 'asleep' ? 0.6 + 0.4 * ramp(t, B.l1, B.into_brain) : 0.9 * (1 - ramp(t, B.alarm + 0.4, B.slips));
  const ring = phase === 'wake' ? pulse(t % 0.5, 0.1, 0.08) * (t < B.slips ? 1 : 0) : 0;
  const morning = phase === 'wake' ? ramp(t, B.alarm, B.slips + 1) : 0;
  const skin = <meshPhysicalMaterial color="#a77a66" roughness={0.6} sheen={0.3} sheenColor="#ffb3a0" clearcoat={0.05} />;
  const sitUp = phase === 'wake' ? ramp(t, B.slips - 0.2, B.slips + 1.0) : 0;
  return (
    <>
      <Fog color={new THREE.Color('#05070f').lerp(new THREE.Color('#2a3150'), morning).getStyle()} density={0.12} />
      <hemisphereLight args={['#3a4a8a', '#05070f', 0.35 + morning * 0.8]} />
      <directionalLight position={[-3, 4, 3]} color="#8fa6ff" intensity={1.1} />
      <directionalLight position={[2, 1, -3]} color="#6f7dff" intensity={0.6} />
      {/* bed, pillow, blanket over the body (body runs toward -x) */}
      <mesh position={[-1.0, 0.22, 0]}><boxGeometry args={[2.6, 0.44, 1.5]} /><meshStandardMaterial color="#141a33" roughness={1} /></mesh>
      <mesh position={[0.15, 0.5, 0]} scale={[0.42, 0.1, 0.55]}><sphereGeometry args={[1, 48, 32]} /><meshStandardMaterial color="#5f6890" roughness={0.9} /></mesh>
      {/* the sleeper: one upper-body group pivoting at the hips, so head, neck and shoulders move together.
          Joints (assembly.md): neck sunk into the head and into the shoulders; checked below. */}
      <group position={HIP} rotation-z={sitUp * 1.1}>
        <mesh ref={torsoRef} position={[0.4, 0.06, 0]} scale={[0.4, 0.15, 0.3]}><sphereGeometry args={[1, 48, 32]} /><meshStandardMaterial color="#2c3a70" roughness={0.8} /></mesh>
        <mesh ref={shoulderRef} position={[0.7, 0.08, 0]} scale={[0.14, 0.12, 0.3]}><sphereGeometry args={[1, 48, 32]} /><meshStandardMaterial color="#2c3a70" roughness={0.8} /></mesh>
        <mesh ref={neckRef} position={[0.865, 0.15, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.046, 0.054, 0.23, 32]} />{skin}</mesh>
        <group position={[HEAD.x - HIP.x, HEAD.y - HIP.y, 0]} rotation-z={-Math.PI / 2}>
          <mesh ref={headRef} geometry={head}>{skin}</mesh>
          <mesh position={[0.02, 0.02, 0]} scale={[0.104, 0.124, 0.083]} rotation-z={-0.35}><sphereGeometry args={[1, 64, 40, 0, Math.PI * 2, 0, Math.PI * 0.5]} /><meshStandardMaterial color="#21161e" roughness={0.95} /></mesh>
          <mesh position={[0.025, -0.005, 0.074]} scale={[0.012, 0.022, 0.006]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#8a6150" roughness={0.7} /></mesh>
          {/* closed eye: a soft lid line */}
          <mesh position={[-0.084, 0.005, 0.034]} rotation={[Math.PI / 2, 0, -0.3]}><torusGeometry args={[0.011, 0.002, 6, 16, Math.PI]} /><meshBasicMaterial color="#3a2420" /></mesh>
        </group>
      </group>
      {/* legs under the blanket (stay down when he sits up); sunk into the torso */}
      <mesh ref={legsRef} position={[-1.5, 0.6, 0]} scale={[0.75, 0.14, 0.45]}><sphereGeometry args={[1, 48, 32]} /><meshStandardMaterial color="#2c3a70" roughness={0.8} /></mesh>
      {/* the busy brain shows through as light under the skin */}
      <Glow p={[HEAD.x + 0.04, HEAD.y + 0.05, 0.1]} c={C.gold} s={0.22 * brainGlow} o={0.32 * brainGlow} />
      <Glow p={[HEAD.x + 0.04, HEAD.y + 0.05, 0.1]} c={C.trail} s={0.1} o={0.35 * brainGlow} />
      <pointLight position={[HEAD.x, HEAD.y + 0.05, 0.2]} color={C.gold} intensity={0.25 * brainGlow} distance={0.6} decay={1.5} />
      {/* bedside table and clock */}
      <mesh position={[0.65, 0.3, -0.55]}><boxGeometry args={[0.4, 0.6, 0.35]} /><meshStandardMaterial color="#10142a" roughness={0.9} /></mesh>
      <mesh position={[0.62, 0.68, -0.5]}><boxGeometry args={[0.2, 0.1, 0.08]} /><meshStandardMaterial color="#0a0d1c" /></mesh>
      <mesh position={[0.62, 0.68, -0.459]}><planeGeometry args={[0.17, 0.085]} /><meshBasicMaterial map={phase === 'wake' ? clock.morning : clock.night} transparent toneMapped={false} /></mesh>
      <Glow p={[0.62, 0.68, -0.4]} c={phase === 'wake' ? '#FF8A6E' : '#7FD0FF'} s={0.35 + ring * 0.6} o={0.35 + ring * 0.6} />
      {/* rings of sound from the alarm */}
      {phase === 'wake' && seq(3, (i) => { const a = ((t - B.alarm) * 0.9 + i / 3) % 1; return t > B.alarm && t < B.slips + 0.5 ? (
        <mesh key={i} position={[0.62, 0.68, -0.45]} scale={0.1 + a * 1.4}><ringGeometry args={[0.95, 1, 64]} /><meshBasicMaterial color="#FF8A6E" transparent opacity={(1 - a) * 0.5} toneMapped={false} /></mesh>) : null; })}
      {/* window behind, moonlight */}
      <mesh position={[-1.2, 1.5, -1.6]}><planeGeometry args={[1.2, 1.4]} /><meshBasicMaterial color={new THREE.Color('#1d2c5e').lerp(new THREE.Color('#ffd3b0'), morning)} toneMapped={false} /></mesh>
      <mesh position={[0, 1.5, -1.65]}><planeGeometry args={[8, 4]} /><meshStandardMaterial color="#0c1226" roughness={1} /></mesh>
      <Dust n={70} box={[3, 2, 2.5]} seed="br" t={t} s={0.02} o={0.4} />
    </>
  );
};

// =====================================================================================================================
// BRAIN CITY (brain units ~2.6 long). Inside his head: traffic of light along the folds; the stem switches REM on; the
// eyes dart; signals to the body fizzle at a barrier; the seeing parts build the dream model; later the recap.
// =====================================================================================================================
export const brainLevels = (t: number): Levels => {
  const rec = (a: number) => ramp(t, a - 0.1, a + 0.4);
  const inRecap = t >= B.recap - 0.3;
  if (inRecap) {
    const awake = ramp(t, B.alarm, B.alarm + 0.8);
    return {all: 0.55, stem: 0.4 + 0.8 * rec(B.r_stem) * (1 - rec(B.r_back) * 0.5), back: 0.4 + 0.8 * rec(B.r_back), feel: 0.3 + 0.8 * rec(B.r_feel),
      front: 0.05 * (1 - rec(B.r_front)), memory: 0.4, awake};
  }
  return {
    all: lerp(0.15, 0.7, ramp(t, B.into_brain - 0.3, B.busy + 1.2)) * (1 - 0.45 * ramp(t, B.l2 - 0.2, B.rem)) + 0.45 * ramp(t, B.rem, B.rem + 1.0),
    stem: ramp(t, B.l2 + 0.6, B.rem) * (1 - 0.6 * ramp(t, B.seeing, B.seeing + 1)),
    back: ramp(t, B.seeing - 0.2, B.seeing + 0.6),
    feel: 0.2, front: 0.3, memory: 0.2, awake: 0,
  };
};
export const BrainCity: React.FC<{t: number; phase: 'dive' | 'recap'}> = ({t, phase}) => {
  const P = useBrainParts();
  const lv = brainLevels(t);
  let pos: THREE.Vector3, look: THREE.Vector3, fov = 38;
  if (phase === 'dive') {
    pos = path3([
      [B.into_brain, [-1.6, 0.5, 2.4]], [B.busy + 0.8, [0.0, -0.1, 7.4]],                // the whole city
      [B.rem, [1.6, -1.0, 4.4]],                                                          // down to the stem
      [B.eyes - 0.2, [-3.4, -0.4, 3.4]], [B.eyes + 1.0, [-4.6, -0.2, 2.2]],               // round to face the eyes
      [B.muscles + 0.3, [2.4, -2.6, 4.6]], [B.seeing - 0.4, [2.6, -3.2, 4.4]],            // down the cord to the barrier
      [B.seeing + 0.6, [3.4, 0.4, 4.0]], [B.fly - 0.3, [0.9, 0.55, 1.4]], [B.into_dream, [0.06, 0.4, 0.2]], // the back, then the model
    ], t);
    look = path3([
      [B.into_brain, [0, 0, 0]], [B.busy + 0.8, [0, -0.35, 0]], [B.rem, [0.08, -0.75, 0]],
      [B.eyes - 0.2, [-1.2, -0.2, 0]], [B.eyes + 1.0, [-1.36, -0.15, 0]],
      [B.muscles + 0.3, [0.12, -2.7, 0]], [B.seeing - 0.4, [0.12, -3.0, -0.3]],
      [B.seeing + 0.6, [0.5, 0.0, 0]], [B.fly - 0.3, [0, 0.38, 0]], [B.into_dream, [0, 0.38, 0]],
    ], t);
  } else {
    // the recap: out from the cell network to the whole brain, the model glowing at its centre
    pos = path3([[B.recap - 0.3, [0.05, 0.4, 0.25]], [B.r_stem + 0.6, [-0.9, 0.2, 4.0]], [B.r_back, [-0.8, -0.3, 7.0]], [B.alarm, [-0.6, -0.2, 7.6]], [B.into_wake, [-0.7, 0.2, 2.6]]], t);
    look = new THREE.Vector3(0, -0.45, 0); fov = 40;
  }
  useCam(pos, look, fov, 0.01, 80);
  // eyes dart left-right together
  const dart = phase === 'dive' ? Math.sin(t * 13) * Math.sin(t * 3.1) * ramp(t, B.eyes - 0.3, B.eyes) : 0;
  // signals heading down the cord, stopped at the barrier (y = -2.6)
  const sig = phase === 'dive' && t > B.muscles - 1.0 ? seq(7, (i) => ((t - B.muscles + 1.0) * 0.9 + i / 7) % 1) : [];
  const barrier = phase === 'dive' ? ramp(t, B.muscles - 0.3, B.muscles + 0.4) : 0;
  // the dream model: built block by block by particles from the seeing parts (low back and sides)
  const build = phase === 'dive' ? lin(t, B.seeing + 0.3, B.fly + 0.2) : 1;
  const crumble = phase === 'recap' ? lin(t, B.alarm, B.into_wake + 0.2) : 0;
  const modelGlow = phase === 'dive' ? ramp(t, B.seeing + 0.2, B.seeing + 1) : 1;
  if (!P) return null;
  const A = P.at, cordX = A.stemBottom.x, barY = A.stemBottom.y - 1.0;
  return (
    <>
      <Fog color="#03050c" density={0.06} />
      <hemisphereLight args={['#3a4a9a', '#04060c', 0.35]} />
      <directionalLight position={[-3, 4, 4]} color="#8fa6ff" intensity={0.6} />
      <Brain t={t} lv={lv} clear={phase === 'dive' ? ramp(t, B.seeing + 0.4, B.seeing + 1.4) : 0.55 * (1 - ramp(t, B.r_stem, B.r_stem + 1))} />
      {/* the eyes' gaze lines: a short bright flick showing the dart */}
      {phase === 'dive' && [-1, 1].map((s) => (
        <group key={s} position={[A.eye.x, A.eye.y, s * A.eye.z]} rotation-y={dart * 0.6}>
          <mesh position={[-0.203, 0, 0]} rotation-y={-Math.PI / 2}><circleGeometry args={[0.1, 32]} /><meshBasicMaterial color="#3a5ab0" side={THREE.DoubleSide} /></mesh>
          <mesh position={[-0.205, 0, 0]} rotation-y={-Math.PI / 2}><circleGeometry args={[0.05, 32]} /><meshBasicMaterial color="#05070f" side={THREE.DoubleSide} /></mesh>
          <Glow p={[-0.22, 0, 0]} c={C.gold} s={0.16} o={0.6 * ramp(t, B.eyes - 0.3, B.eyes)} />
        </group>
      ))}
      {/* REM: light climbing from the stem */}
      {phase === 'dive' && seq(5, (i) => { const a = lin(t, B.rem - 0.6 + i * 0.12, B.rem + 0.6 + i * 0.12); return a > 0 && a < 1 ? <Glow key={i} p={[A.stemBottom.x, A.stemBottom.y + a * 2.2, 0]} c={C.gold} s={0.5 + a} o={(1 - a) * 0.8} /> : null; })}
      {/* barrier on the spinal cord and the signals that fizzle there; the dark body below */}
      {phase === 'dive' && <>
        <mesh position={[cordX, barY, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[A.cordR.x * 2.2, 0.022, 12, 48]} /><meshBasicMaterial color={C.gold} transparent opacity={0.15 + 0.85 * barrier} toneMapped={false} /></mesh>
        <Glow p={[cordX, barY, 0]} c={C.gold} s={1.4} o={barrier * 0.8} />
        {sig.map((a, i) => { const y = lerp(A.stemBottom.y - 0.05, barY, Math.min(1, a / 0.8)), fade = a < 0.8 ? 1 : 1 - (a - 0.8) / 0.2; return <Glow key={i} p={[cordX, y, 0.06]} c="#BFD4FF" s={0.18 + (a > 0.75 ? (a - 0.75) * 2 : 0)} o={fade * 0.9} />; })}
        <group position={[cordX, barY - 2.0, -0.6]} rotation-x={-0.3}>
          {[[0, 0, 0, 0.35, 1.2], [-0.5, -0.1, 0, 0.09, 1.0], [0.5, -0.1, 0, 0.09, 1.0], [-0.18, -1.3, 0, 0.11, 1.3], [0.18, -1.3, 0, 0.11, 1.3]].map(([x, y, z, r, h], i) => (
            <mesh key={i} position={[x, y, z]}><capsuleGeometry args={[r, h, 6, 12]} /><meshBasicMaterial color="#3a4a8a" wireframe transparent opacity={0.3 * barrier} /></mesh>))}
        </group>
      </>}
      {/* the dream model at the brain's centre */}
      {build > 0 && (
        <group position={A.model} scale={0.0075}>
          <Town winState={(i, w) => [rnd('m' + w.b) * 0.5 + 0.6, C.gold]} wall="#1a1f3a" roof="#151a33" ground={null} street={0}
            only={(b, i) => Math.max(0, Math.min(1, (build * 1.3 - Math.hypot(b.x, b.z) / 45) * 3)) * Math.max(0, Math.min(1, (1 - crumble * 1.25 + (1 - Math.hypot(b.x, b.z) / 40) * 0.6 - rnd('cr' + i) * 0.2) * 3))} glowEdges={modelGlow * (1 - crumble)} />
        </group>
      )}
      {build > 0 && build < 1 && <Glows max={60} items={seq(60, (i) => {
        // particles flowing from the seeing parts to the model
        const side = i % 2 ? 1 : -1, a = ((t * 0.7 + rnd('pa' + i)) % 1);
        const from = new THREE.Vector3(A.seeing.x, A.seeing.y + (rnd('pf' + i) - 0.5) * 0.3, side * 0.6), to = A.model.clone().add(new THREE.Vector3((rnd('ptx' + i) - 0.5) * 0.3, 0.03, (rnd('ptz' + i) - 0.5) * 0.3));
        const p = from.clone().lerp(to, a); p.y += Math.sin(a * Math.PI) * 0.2;
        return {p, c: C.gold, s: 0.05, o: 0.9 * Math.sin(a * Math.PI)};
      })} />}
      <Glow p={A.model} c={C.gold} s={0.6} o={0.35 * modelGlow * (1 - crumble)} />
      {crumble > 0 && <Glows max={80} items={seq(80, (i) => {
        // crumbs breaking off the dream model and falling away
        const a = Math.max(0, crumble * 1.6 - rnd('cb' + i) * 0.6), ang = rnd('ca' + i) * 6.28, r0 = 0.12 + rnd('cr0' + i) * 0.18;
        const p = A.model.clone().add(new THREE.Vector3(Math.cos(ang) * (r0 + a * 0.3), 0.02 + rnd('cy' + i) * 0.05 - a * a * 0.6, Math.sin(ang) * (r0 + a * 0.3)));
        return {p, c: C.gold, s: 0.035, o: a > 0 ? (1 - a) * 0.9 : 0}; })} />}
      <Dust n={140} box={[6, 6, 6]} seed="bc" t={t} s={0.03} o={0.35} />
    </>
  );
};

// =====================================================================================================================
// DREAM TOWN (metres). Inside the brain at town scale: he flies over his town. The brain's walls far around; the
// feelings part glows red below; the front hangs ahead like a lighthouse; memory ribbons stream in.
// =====================================================================================================================
const Flyer: React.FC<{p: THREE.Vector3; yaw: number; pitch: number; t: number}> = ({p, yaw, pitch, t}) => {
  const m = <meshStandardMaterial color="#1d2350" emissive={C.gold} emissiveIntensity={0.28} roughness={0.5} />;
  const flap = Math.sin(t * 2.4) * 0.12;
  return (
    <group position={p} rotation={[0, yaw, 0]} scale={0.7}>
      <group rotation-z={pitch}>
        <mesh rotation-z={Math.PI / 2}><capsuleGeometry args={[0.22, 1.1, 8, 16]} />{m}</mesh>
        <mesh position={[0.85, 0.05, 0]}><sphereGeometry args={[0.23, 24, 16]} />{m}</mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[0.45, 0.02, s * 0.45]} rotation={[s * (0.5 + flap), 0, 1.35]}><capsuleGeometry args={[0.08, 0.8, 6, 10]} />{m}</mesh>)}
        {[-1, 1].map((s) => <mesh key={'l' + s} position={[-0.95, -0.02, s * 0.14]} rotation-z={Math.PI / 2}><capsuleGeometry args={[0.1, 0.8, 6, 10]} />{m}</mesh>)}
        <Glow p={[0, 0, 0]} c={C.gold} s={3} o={0.35} />
        <pointLight color={C.gold} intensity={3} distance={8} decay={1.5} />
      </group>
    </group>
  );
};
const ODD = {bus: new THREE.Vector3(-5, 9, -22), house: new THREE.Vector3(7, 11, -26), clockMoon: new THREE.Vector3(-14, 22, -46)};
export const DreamTown: React.FC<{t: number}> = ({t}) => {
  // flight path along the main street, then over the rooftops
  const fp = (tt: number) => path3([[B.into_dream, [0, 8, 26]], [B.feel, [0, 7.5, 18]], [B.scary, [0, 4.2, 11]], [B.exciting, [1.5, 9.5, 5]], [B.front, [1, 8.5, 1]],
    [B.normal, [0, 8, -3]], [B.memory, [-1, 7.5, -6]], [B.cells, [-1, 6.5, -10]], [B.into_cell, [-2.3, 3.6, -15.6]]], tt);
  const me = fp(t), ahead = fp(t + 0.4);
  const dir = ahead.clone().sub(me);
  const yaw = Math.atan2(-dir.z, dir.x), pitch = Math.atan2(dir.y, Math.hypot(dir.x, dir.z)) * 0.35;
  // camera behind and above him; at the end it dives at a streetlight
  const behind = me.clone().add(new THREE.Vector3(3.2, 2.6, 7.5));
  const lamp = new THREE.Vector3(LAYOUT.lights[4].x, 3.05, LAYOUT.lights[4].z);
  const dive = ramp(t, B.cells + 0.4, B.into_cell);
  const pos = behind.lerp(new THREE.Vector3(lamp.x + 0.05, lamp.y + 0.05, lamp.z + 0.4), dive);
  const look = me.clone().add(new THREE.Vector3(-0.8, -3.0, -9)).lerp(lamp, dive);
  useCam(pos, look, 46, 0.05, 400, 0);
  // the feelings part: red pulse floods the sky; the front: lighthouse beam until it goes quiet; memories
  const feel = ramp(t, B.feel, B.feel + 0.6) * (1 - 0.6 * ramp(t, B.front, B.front + 1.5));
  const beat = 0.5 + 0.5 * Math.sin(t * 7.5);
  const front = 1 - ramp(t, B.quiet - 0.2, B.quiet + 0.5);
  const sweep = Math.sin(t * 1.4) * 0.6;
  const oddVis = t < B.quiet ? 0.0 + (front < 1 ? 0 : 0) : ramp(t, B.quiet + 0.2, B.normal);
  const busCaught = t > B.front && t < B.quiet ? 1 - Math.abs(Math.sin(t * 6)) : 0; // a blink of the bus caught in the beam
  const mem = ramp(t, B.memory - 0.2, B.memory + 0.8);
  const swapK = ramp(t, B.older - 0.3, B.older + 1.2);
  const sw = (a: [number, number], b: [number, number]): [number, number] => [lerp(a[0], b[0], swapK), lerp(a[1], b[1], swapK)];
  const swap = {office: sw([-7, 6], [14, 2]), childhood: sw([14, 2], [-7, 6]), school: sw([-14, -10], [-6.5, -14]), coffee: sw([-6.5, -6], [-14, -10])};
  const fogC = new THREE.Color('#090b1e').lerp(new THREE.Color('#3a0d22'), feel * (0.6 + 0.4 * beat)).lerp(new THREE.Color('#0a0c18'), 1 - front < 1 ? 0 : 0).getStyle();
  const ws: WinState = (i, w) => [0.75 + 0.25 * rnd('dw' + i), C.gold];
  const brainWall = useMemo(() => {
    const g = new THREE.SphereGeometry(140, 64, 48); return g;
  }, []);
  return (
    <>
      <Fog color={fogC} density={0.011} />
      <hemisphereLight args={['#7a6ad0', '#1a1030', 1.4]} />
      <directionalLight position={[20, 30, 10]} color="#c9b8ff" intensity={0.6} />
      <Town winState={ws} wall="#262c58" roof="#353a6e" ground="#120f26" swap={swap} glowEdges={0.5} />
      <Glows max={40} items={LAYOUT.lights.map((p) => ({p: [p.x, 3.05, p.z] as [number, number, number], c: '#FFD9A0', s: 1.6, o: 0.7}))} />
      <Flyer p={me} yaw={yaw} pitch={pitch} t={t} />
      {/* the brain's folds far around, faint, as the sky */}
      <mesh geometry={brainWall}><meshBasicMaterial color="#1b2150" side={THREE.BackSide} wireframe transparent opacity={0.06} fog={false} /></mesh>
      {/* feelings part, deep below the town */}
      <Glow p={[0, -30, -160]} c={C.red} s={260 * (0.85 + 0.15 * beat)} o={0.15 + 0.6 * feel * (0.6 + 0.4 * beat)} />
      <pointLight position={[0, -2, -6]} color={C.red} intensity={12 * feel} distance={60} decay={1.2} />
      {/* the front: a lighthouse ahead whose beam sweeps the town and wipes out odd things, until it goes quiet */}
      <group position={[-10, 24, -50]}>
        <mesh><sphereGeometry args={[2.2, 32, 24]} /><meshBasicMaterial color={new THREE.Color(C.quiet).lerp(new THREE.Color('#CFE0FF'), front)} toneMapped={false} /></mesh>
        <Glow p={[0, 0, 0]} c={front > 0.3 ? '#CFE0FF' : C.quiet} s={22 * (0.3 + 0.7 * front)} o={0.2 + 0.6 * front} />
        <mesh rotation={[0.9, sweep, 0]} position={[0, 0, 0]}>
          <coneGeometry args={[9, 45, 32, 1, true]} /><meshBasicMaterial color="#CFE0FF" transparent opacity={0.1 * front} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      </group>
      {/* odd things that only stay once the front is quiet: a bus in a cloud, an upside-down house, a clock-faced moon */}
      <group position={ODD.bus} visible={oddVis > 0.01 || busCaught > 0.01}>
        <mesh><boxGeometry args={[4, 1.5, 1.4]} /><meshStandardMaterial color="#c0392b" emissive="#5a1410" emissiveIntensity={0.6} transparent opacity={Math.max(oddVis, busCaught * 0.6)} /></mesh>
        {seq(5, (i) => <mesh key={i} position={[-1.5 + i * 0.75, 0.25, 0.71]}><planeGeometry args={[0.5, 0.45]} /><meshBasicMaterial color={C.gold} transparent opacity={Math.max(oddVis, busCaught * 0.6)} toneMapped={false} /></mesh>)}
        {seq(6, (i) => <Glow key={'c' + i} p={[(rnd('cl' + i) - 0.5) * 7, -0.8 + rnd('cy' + i), (rnd('cz' + i) - 0.5) * 3]} c="#9aa6d8" s={4} o={0.5 * Math.max(oddVis, 0.3)} />)}
      </group>
      <group position={ODD.house} rotation-z={Math.PI} scale={oddVis}>
        <mesh position={[0, 1.2, 0]}><boxGeometry args={[2.6, 2.4, 2.4]} /><meshStandardMaterial color="#20264a" emissive="#2a2050" /></mesh>
        <mesh position={[0, 2.9, 0]}><coneGeometry args={[2.0, 1.2, 4]} /><meshStandardMaterial color="#151a33" /></mesh>
        <mesh position={[0, 1.2, 1.21]}><planeGeometry args={[0.6, 0.7]} /><meshBasicMaterial color={C.gold} toneMapped={false} /></mesh>
      </group>
      <group position={ODD.clockMoon} scale={0.2 + 0.8 * oddVis}>
        <mesh><circleGeometry args={[4, 48]} /><meshBasicMaterial color="#F4EEDC" fog={false} toneMapped={false} /></mesh>
        {[0, 1].map((i) => <mesh key={i} position={[0, 0, 0.05]} rotation-z={i ? t * 2 : -t * 0.3}><planeGeometry args={[0.25, i ? 3.2 : 2.2]} /><meshBasicMaterial color="#2a2f50" fog={false} /></mesh>)}
      </group>
      {/* memory ribbons: cool white today, warm amber long ago, streaming from the memory part into the town */}
      {mem > 0 && <Glows max={280} items={([[C.today, -1, 'office'], [C.past, 1, 'childhood'], [C.today, -1, 'coffee'], [C.past, 1, 'school']] as [string, number, keyof typeof swap][]).flatMap(([c, s, name], k) => seq(70, (i) => {
        const a = ((t * 0.45 + i / 70 + k * 0.13) % 1), src = me.clone().add(new THREE.Vector3(s * 7, 2.5, -8));
        const dst = me.clone().add(new THREE.Vector3(s * (2 + k), -6.5, -13 - k * 2)), p = src.clone().lerp(dst, a); p.y += Math.sin(a * Math.PI) * 4; p.x += Math.sin(a * 9 + k) * 0.6;
        return {p, c, s: 0.9 + 0.6 * Math.sin(a * Math.PI), o: mem * 0.9 * Math.sin(a * Math.PI) * (1 - swapK * 0.4)};
      }))} />}
      {mem > 0 && [0, 1, 2, 3].map((k) => <Glow key={'mb' + k} p={me.clone().add(new THREE.Vector3((k % 2 ? 1 : -1) * (2 + k), -6.5, -13 - k * 2))} c={k % 2 ? C.past : C.today} s={6} o={mem * 0.5} />)}
      <Dust n={160} box={[60, 30, 80]} seed="dt" t={t} c="#FFC56E" s={0.25} o={0.35} />
    </>
  );
};

// =====================================================================================================================
// NEURON (micrometres, nominal). The streetlight's glow resolves into a cell: a body, branches, a long arm wrapped in
// segments; the spark lights the gaps between segments in order like streetlights coming on; at the tip, messengers
// (the dream's fireflies) cross a tiny gap and dock on the next cell, which lights up.
// =====================================================================================================================
const Cell: React.FC<{seed: string; pos: [number, number, number]; color: string; emis: string; lit: number; rot?: number; scale?: number}> = ({seed, pos, color, emis, lit, rot = 0, scale = 1.25}) => {
  const g = useNeuronGeo();
  const m = <meshPhysicalMaterial color={color} emissive={emis} emissiveIntensity={0.25 + lit * 1.2} roughness={0.35} clearcoat={0.6} />;
  return (
    <group position={pos} rotation={[rnd(seed + 'rx') * 0.4, rnd(seed + 'ry') * 6.28, rot]} scale={scale}>
      <mesh scale={[1, 1.15, 1]}><sphereGeometry args={[0.42, 40, 28]} />{m}</mesh>
      {g && <mesh geometry={g}>{m}</mesh>}
      <Glow p={[0, 0, 0.3]} c={emis} s={2.5} o={lit * 0.6} />
    </group>
  );
};
export const Neuron: React.FC<{t: number}> = ({t}) => {
  // the long arm runs from the upper cell down to the gap near the frame centre
  const axon = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-2.0, 7.0, 0), new THREE.Vector3(-1.6, 4.5, 0.2), new THREE.Vector3(-0.9, 2.2, 0), new THREE.Vector3(-0.35, 0.6, 0), new THREE.Vector3(-0.1, 0.1, 0)]), []);
  const segs = 9;
  const G = useMemo(() => ({
    segs: seq(segs, (i) => { const a = (i + 0.08) / segs, b = (i + 0.92) / segs; return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seq(6, (k) => axon.getPoint(lerp(a, b, k / 5)))), 20, 0.2, 16, false); }),
    core: new THREE.TubeGeometry(axon, 120, 0.1, 12, false),
    dend: new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.7, -0.5, 0), new THREE.Vector3(1.1, -1.6, 0), new THREE.Vector3(1.6, -3.0, -0.3), new THREE.Vector3(1.9, -4.6, -0.5)]), 60, 0.17, 14, false),
  }), [axon]);
  const sparkK = lin(t, B.spark - 0.1, B.chem + 0.1); // 0..1 down the arm
  const cross = lin(t, B.chem + 0.1, B.gap + 0.5);   // messengers crossing
  const lit2 = ramp(t, B.gap + 0.2, B.gap + 0.8);
  const pos = path3([[B.into_cell, [-1.4, 4.8, 1.0]], [B.cells + 1.6, [-1.5, 4.6, 6.5]], [B.spark + 0.2, [-0.3, 3.0, 8.5]], [B.chem, [0.2, 0.8, 5.0]], [B.recap - 0.3, [0.2, 0.0, 2.2]]], t);
  const look = path3([[B.into_cell, [-1.5, 4.5, 0]], [B.cells + 1.6, [-1.2, 3.4, 0]], [B.spark + 0.2, [-0.6, 1.8, 0]], [B.chem, [0.15, -0.15, 0]], [B.recap - 0.3, [0.15, -0.15, 0]]], t);
  useCam(pos, look, 40, 0.01, 200);
  const sp = axon.getPoint(Math.min(1, sparkK));
  const mAx = <meshPhysicalMaterial color="#3b4f9a" emissive="#2a3c8c" emissiveIntensity={0.3} roughness={0.35} clearcoat={0.6} />;
  return (
    <>
      <Fog color="#03050d" density={0.07} />
      <hemisphereLight args={['#3a4a9a', '#04060c', 0.35]} />
      <directionalLight position={[-3, 5, 6]} color="#8fa6ff" intensity={0.9} />
      <Cell seed="n1" pos={[-2.2, 7.6, 0]} color="#3b4f9a" emis="#2a3c8c" lit={sparkK > 0 && sparkK < 0.2 ? 1 : 0.1} />
      {/* the arm, in segments; the gaps between them light in order as the spark passes */}
      {G.segs.map((g, i) => <mesh key={i} geometry={g}>{mAx}</mesh>)}
      <mesh geometry={G.core}>{mAx}</mesh>
      {seq(segs + 1, (i) => { const u = i / segs, on = sparkK >= u ? 1 : 0, fresh = pulse(sparkK, u, 0.06); const p = axon.getPoint(Math.min(0.999, u)).add(new THREE.Vector3(0, 0, 0.35));
        return <Glow key={i} p={p} c={C.gold} s={1.0 + fresh * 2.2} o={on * 0.75 + fresh * 0.6} />; })}
      {sparkK > 0 && sparkK < 1 && <><Glow p={sp} c="#FFF2D0" s={0.8} o={1} /><pointLight position={[sp.x, sp.y, sp.z + 0.5]} color={C.gold} intensity={10} distance={4} decay={1.6} /></>}
      {/* the tip bulb and the next cell's cup across the gap */}
      <mesh position={[0, -0.05, 0]} scale={[1, 0.8, 1]}><sphereGeometry args={[0.36, 48, 32]} />{mAx}</mesh>
      <mesh position={[0.62, -0.42, 0]} scale={[1, 0.8, 1]}><sphereGeometry args={[0.4, 48, 32]} /><meshPhysicalMaterial color="#2d7f86" emissive="#1b9aa4" emissiveIntensity={0.25 + lit2 * 1.3} roughness={0.35} clearcoat={0.6} /></mesh>
      <mesh geometry={G.dend}>
        <meshPhysicalMaterial color="#2d7f86" emissive="#1b9aa4" emissiveIntensity={0.25 + lit2 * 1.3} roughness={0.35} clearcoat={0.6} /></mesh>
      <Cell seed="n2" pos={[2.0, -5.2, -0.5]} color="#2d7f86" emis="#1b9aa4" lit={lit2} />
      {seq(28, (i) => { const a = Math.min(1, Math.max(0, cross * 1.4 - rnd('cd' + i) * 0.4)); const p = new THREE.Vector3(0.12 + (rnd('mx' + i) - 0.5) * 0.15, -0.12 + (rnd('my' + i) - 0.5) * 0.25, (rnd('mz' + i) - 0.5) * 0.35)
        .lerp(new THREE.Vector3(0.42 + (rnd('nx' + i) - 0.5) * 0.08, -0.28 + (rnd('ny' + i) - 0.5) * 0.3, (rnd('nz' + i) - 0.5) * 0.35), a);
        return cross > 0 ? <mesh key={i} position={p}><sphereGeometry args={[0.045, 10, 8]} /><meshBasicMaterial color={C.gold} toneMapped={false} /></mesh> : null; })}
      <Glow p={[0.3, -0.25, 0.1]} c={C.gold} s={1.2} o={cross > 0 ? 0.5 : 0} />
      {/* the network behind, in fog */}
      {seq(12, (i) => <Cell key={i} seed={'bg' + i} pos={[(rnd('bx' + i) - 0.5) * 16, (rnd('by' + i) - 0.5) * 22, -5 - rnd('bz' + i) * 10]} color="#1d2650" emis="#141c40" lit={rnd('bl' + i) > 0.6 ? 0.4 : 0} />)}
      <Dust n={200} box={[12, 18, 10]} seed="nn" t={t} s={0.05} o={0.4} />
    </>
  );
};
