// Key-frame board (visuals step): one still per script line, s1..s11, in the style frame's kitchen.
// Every shot is the same butter cube (5 cm, rounded edges) on the oak board; each `Shot` lists what
// that beat shows. Colour roles: cyan = the hexagon and its count (the thing to follow), white = the
// corner-to-corner guide line, magenta = the cube's faces in the "six faces" proof.
// Units: 1 = 1 cm; the cube's centre sits at (0, H, 0).
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {SANS} from './kit/fonts';
import {Room, ACCENT} from './Scene';
import {half, sectionRing, hexSides, H, R, N_CUT, MIDS, FACES} from './butter';
import {butterCut, butterRind, cheese} from './textures';

export const GUIDE = '#ffffff';
export const FACE = '#ff4fb0';
const W = 1080, HGT = 1920;

type V3 = [number, number, number];
type Shot = {
  cam: V3; look: V3; mm: number;
  rotY: number; // cube turn about the vertical (radians); -45° puts the corner-to-corner line in the camera's plane
  cut?: 'square' | 'hex'; // cut halves (else a whole cube)
  slide?: V3; // world offset of the moving half
  tip?: V3; // extra rotation of the moving half
  hideTop?: boolean;
  wire?: {from: V3; to: V3}; // world points of the taut cheese wire
  trace?: number; // hexagon outline on the cut face (opacity)
  ticks?: boolean; // equal-length tick marks on the six sides
  nums?: boolean; // 1..6 beside the sides
  dots?: number; // edge-middle dots shown (0..6)
  diag?: boolean; // corner glows and the corner-to-corner line
  blade?: boolean; // the knife held square to that line, through the centre
  ring?: number; // the hexagon drawn on the whole cube (opacity; hidden sides at a third)
  faces?: number[]; // face tints: opacity per face (FACES order)
  bright?: number; // one side drawn bright (s10: the side the lit face holds)
  cheese?: boolean;
  title: [string, string?]; // on-screen text, second line in cyan unless noted
  title2White?: boolean;
  pause?: boolean;
};

const D = -Math.PI / 4;
export const SHOTS: Record<string, Shot> = {
  s1: {cam: [-6, 24, 30], look: [-1.5, 2.0, 3.0], mm: 44, rotY: D, cut: 'square', slide: [-4.2, 0, 6.4], tip: [Math.PI / 2, 0, 0.25],
    wire: {from: [-30, 0.08, -30], to: [30, 0.08, 30]}, title: ['ONE CUT.', 'WHAT SHAPE?'], title2White: true},
  s2: {cam: [-8, 25, 26], look: [0, 5.2, 0], mm: 48, rotY: D, cut: 'hex', slide: [0, 3.1, -1.1], tip: [0.06, 0.08, -0.05], title: ['A', 'HEXAGON?']},
  s3: {cam: [-4, 24, 19], look: [0, 2.6, 0.6], mm: 50, rotY: D, cut: 'hex', hideTop: true, trace: 1, nums: true, title: ['COUNT', 'THE SIDES']},
  s4: {cam: [-8, 21, 28], look: [0, 3.6, 0], mm: 46, rotY: D + 0.42, title: ['PAUSE', 'AND GUESS'], title2White: true, pause: true},
  s5: {cam: [24, 11, 13], look: [0, 2.6, 0], mm: 50, rotY: D, diag: true, title: ['CORNER', 'TO CORNER'], title2White: true},
  s6: {cam: [21, 17, 19], look: [0, 3.4, 0], mm: 46, rotY: D, diag: true, blade: true, title: ['SQUARE', 'TO THE LINE'], title2White: true},
  s7: {cam: [-5, 24, 22], look: [0, 2.6, 0], mm: 55, rotY: D, dots: 6, title: ['6 EDGE', 'MIDDLES']},
  s8: {cam: [-4, 24, 19], look: [0, 2.6, 0.6], mm: 50, rotY: D, cut: 'hex', hideTop: true, trace: 1, ticks: true, dots: 6, title: ['6 EQUAL', 'SIDES']},
  s9: {cam: [-10, 30, 40], look: [0, 3.0, 0], mm: 46, rotY: D, ring: 0.9, faces: [0.75, 0, 0.35, 0, 0, 0], title: ['NEVER', 'MORE THAN 6']},
  s10: {cam: [-5, 20, 24], look: [0, 2.4, 0], mm: 52, rotY: D + 0.55, ring: 0.5, faces: [0, 0, 0, 0, 0.7, 0], bright: 4, title: ['6 FACES', '= 6 SIDES']},
  s11: {cam: [-8, 25, 26], look: [0, 5.2, 0], mm: 48, rotY: D, cut: 'hex', cheese: true, slide: [0, 4.2, -1.5], tip: [0.1, 0.12, -0.08], trace: 1, title: ['TRY IT', 'ON CHEESE']},
};

const camOf = (s: Shot) => {
  const c = new THREE.PerspectiveCamera(40, W / HGT, 1, 400);
  c.position.set(...s.cam); c.filmGauge = 36; c.setFocalLength(s.mm); c.lookAt(...s.look);
  c.updateProjectionMatrix(); c.updateMatrixWorld();
  return c;
};
const Cam: React.FC<{s: Shot}> = ({s}) => {
  const cam = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  const c = camOf(s);
  cam.position.copy(c.position); cam.quaternion.copy(c.quaternion);
  cam.filmGauge = 36; cam.setFocalLength(s.mm); cam.near = 1; cam.far = 400; cam.updateProjectionMatrix();
  return null;
};
const toWorld = (p: THREE.Vector3, rotY: number) => p.clone().applyEuler(new THREE.Euler(0, rotY, 0)).add(new THREE.Vector3(0, H, 0));
const toScreen = (p: THREE.Vector3, s: Shot) => {
  const v = p.clone().project(camOf(s));
  return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * HGT];
};

const tube = (pts: THREE.Vector3[], r: number, closed = false) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), Math.max(8, pts.length * 2), r, 8, closed);
const glowMat = (c: string, o: number, depthTest = true) =>
  new THREE.MeshBasicMaterial({color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, depthTest, toneMapped: false});
const lineMat = (c: string, k = 1.5, depthTest = true, o = 1) =>
  new THREE.MeshBasicMaterial({color: new THREE.Color(c).multiplyScalar(k), toneMapped: false, depthTest, transparent: o < 1, opacity: o});

const useMats = (isCheese: boolean) => useMemo(() => {
  if (isCheese) {
    const r = cheese(false), c = cheese(true);
    return {
      rind: new THREE.MeshPhysicalMaterial({map: r.color, roughnessMap: r.rough, roughness: 1, bumpMap: r.bump, bumpScale: 0.9, specularIntensity: 0.35, emissive: new THREE.Color('#4a2200'), emissiveIntensity: 0.1}),
      cut: new THREE.MeshPhysicalMaterial({map: c.color, roughnessMap: c.rough, roughness: 1, bumpMap: c.bump, bumpScale: 0.6, specularIntensity: 0.5, emissive: new THREE.Color('#5a2a00'), emissiveIntensity: 0.1}),
    };
  }
  const rindT = butterRind(), cutT = butterCut();
  return {
    rind: new THREE.MeshPhysicalMaterial({map: rindT.color, roughnessMap: rindT.rough, roughness: 1, bumpMap: rindT.bump, bumpScale: 0.6, sheen: 0.4, sheenColor: new THREE.Color('#fff0c0'), sheenRoughness: 0.6, specularIntensity: 0.5, emissive: new THREE.Color('#5a3a00'), emissiveIntensity: 0.12}),
    cut: new THREE.MeshPhysicalMaterial({map: cutT.color, roughnessMap: cutT.rough, roughness: 1, bumpMap: cutT.bump, bumpScale: 0.35, clearcoat: 0.25, clearcoatRoughness: 0.35, specularIntensity: 0.7, emissive: new THREE.Color('#6a4500'), emissiveIntensity: 0.1}),
  };
}, [isCheese]);

const SQ_N = new THREE.Vector3(0, 0, 1); // the straight-down cut of s1, cube-local

const Cube: React.FC<{s: Shot}> = ({s}) => {
  const mats = useMats(!!s.cheese);
  const g = useMemo(() => {
    const n = s.cut === 'square' ? SQ_N : N_CUT;
    const halves = s.cut ? {bottom: half(-1, 26000, n), top: half(1, 26000, n)} : null;
    const whole = s.cut ? null : new RoundedBoxGeometry(2 * H, 2 * H, 2 * H, 6, R);
    // hexagon outline on the cut face, nudged off the face so it isn't buried
    const {pts} = sectionRing(240);
    const ringPts = pts.map((p) => p.clone().multiplyScalar(0.985).addScaledVector(N_CUT, -0.012));
    const surfRing = pts.map((p) => p.clone().multiplyScalar(1.01));
    const sides = hexSides(720).map((side) => side.map((p) => p.clone().multiplyScalar(1.012)));
    return {halves, whole, ringPts, surfRing, sides};
  }, [s.cut]);

  const rot = new THREE.Euler(0, s.rotY, 0);
  const visible = (f: THREE.Vector3) => {
    const w = f.clone().applyEuler(rot);
    const c = new THREE.Vector3(...s.cam).sub(new THREE.Vector3(0, H, 0));
    return w.dot(c) > 0;
  };

  return (
    <>
      {/* still half / whole cube */}
      <group position={[0, H, 0]} rotation={rot}>
        {g.whole && <mesh geometry={g.whole} material={mats.rind} castShadow receiveShadow />}
        {g.halves && (
          <>
            <mesh geometry={g.halves.bottom.rind} material={mats.rind} castShadow receiveShadow />
            <mesh geometry={g.halves.bottom.cut} material={mats.cut} castShadow receiveShadow />
          </>
        )}
        {/* the hexagon on the cut face */}
        {s.trace ? (
          <>
            <mesh geometry={tube(g.ringPts, 0.05, true)} material={lineMat(ACCENT, 1.6)} />
            <mesh geometry={tube(g.ringPts, 0.12, true)} material={glowMat(ACCENT, 0.12 * s.trace)} />
          </>
        ) : null}
        {/* equal-side ticks across each side's middle */}
        {s.ticks && MIDS.map((m, i) => {
          const a = m, b = MIDS[(i + 1) % 6];
          const mid = a.clone().add(b).multiplyScalar(0.5).multiplyScalar(0.985).addScaledVector(N_CUT, -0.012);
          const along = b.clone().sub(a).normalize();
          const across = new THREE.Vector3().crossVectors(N_CUT, along).normalize();
          return <mesh key={i} geometry={tube([mid.clone().addScaledVector(across, -0.32), mid.clone().addScaledVector(across, 0.32)], 0.06)} material={lineMat(ACCENT, 1.6)} />;
        })}
        {/* edge-middle dots */}
        {(s.dots ?? 0) > 0 && MIDS.slice(0, s.dots).map((m, i) => {
          const p = m.clone().normalize().multiplyScalar(m.length() - R * (Math.SQRT2 - 1) + 0.02);
          const p2 = s.cut ? p.clone().multiplyScalar(0.985).addScaledVector(N_CUT, -0.012) : p;
          return (
            <group key={i} position={p2}>
              <mesh material={lineMat('#ffffff', 1.4)}><sphereGeometry args={[0.13, 20, 12]} /></mesh>
              <mesh material={glowMat(ACCENT, 0.55)}><sphereGeometry args={[0.26, 20, 12]} /></mesh>
              <mesh material={glowMat(ACCENT, 0.18)}><sphereGeometry args={[0.5, 20, 12]} /></mesh>
            </group>
          );
        })}
        {/* the hexagon drawn on the whole cube: sides on faces turned to us full, the rest seen through */}
        {s.ring ? g.sides.map((side, i) => {
          const front = visible(FACES[i]);
          const hot = s.bright === i;
          const op = (hot ? 1 : s.ring!) * (front ? 1 : 0.3);
          return (
            <group key={i}>
              <mesh geometry={tube(side, hot ? 0.09 : 0.05)} material={lineMat(ACCENT, hot ? 2 : 1.4, front, op)} renderOrder={front ? 0 : 5} />
              {hot && <mesh geometry={tube(side, 0.24)} material={glowMat(ACCENT, 0.35)} />}
            </group>
          );
        }) : null}
        {/* face tints */}
        {s.faces?.map((o, i) => {
          if (!o) return null;
          const f = FACES[i];
          const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), f);
          return (
            <mesh key={i} position={f.clone().multiplyScalar(H + 0.015)} quaternion={q} material={new THREE.MeshBasicMaterial({color: FACE, transparent: true, opacity: o, depthWrite: false, toneMapped: false})}>
              <planeGeometry args={[2 * (H - R), 2 * (H - R)]} />
            </mesh>
          );
        })}
        {/* corner glows and the corner-to-corner line, seen through the butter */}
        {s.diag && (
          <>
            {[1, -1].map((k) => (
              <group key={k} position={[k * (H - 0.08), k * (H - 0.08), k * (H - 0.08)]}>
                <mesh material={lineMat(GUIDE, 1.2, false)} renderOrder={6}><sphereGeometry args={[0.16, 20, 12]} /></mesh>
                <mesh material={glowMat(GUIDE, 0.45, false)} renderOrder={6}><sphereGeometry args={[0.42, 20, 12]} /></mesh>
                <mesh material={glowMat(GUIDE, 0.15, false)} renderOrder={6}><sphereGeometry args={[0.9, 20, 12]} /></mesh>
              </group>
            ))}
            <mesh geometry={tube([new THREE.Vector3(-H, -H, -H).multiplyScalar(0.97), new THREE.Vector3(H, H, H).multiplyScalar(0.97)], 0.035)} material={lineMat(GUIDE, 1.1, false, 0.85)} renderOrder={6} />
            <mesh geometry={tube([new THREE.Vector3(-H, -H, -H).multiplyScalar(0.97), new THREE.Vector3(H, H, H).multiplyScalar(0.97)], 0.12)} material={glowMat(GUIDE, 0.12, false)} renderOrder={6} />
          </>
        )}
        {s.blade && <RightAngle />}
      </group>

      {/* the moving half */}
      {g.halves && !s.hideTop && (
        <group position={new THREE.Vector3(0, H, 0).add(new THREE.Vector3(...(s.slide ?? [0, 0, 0])))} rotation={rot}>
          <group rotation={s.tip ?? [0, 0, 0]}>
            <mesh geometry={g.halves.top.rind} material={mats.rind} castShadow receiveShadow />
            <mesh geometry={g.halves.top.cut} material={mats.cut} castShadow receiveShadow />
          </group>
        </group>
      )}
      {s.wire && <Wire {...s.wire} />}
      {s.blade && <Blade />}
    </>
  );
};

// A chef's knife blade held flat across the corner-to-corner line, its edge sunk to the cube's centre.
// World space: the cut plane holds world x and UP_W (up and back); N_W is its normal.
const N_W = N_CUT.clone().applyEuler(new THREE.Euler(0, D, 0));
const UP_W = new THREE.Vector3(1, 0, 0).cross(N_W).normalize().multiplyScalar(-1);
const Blade: React.FC = () => {
  const m = useMemo(() => {
    const shape = new THREE.Shape();
    // blade outline (x along the blade, y across, edge at y = 0): straight spine, edge curving up to the tip
    shape.moveTo(-6, 0); shape.lineTo(5, 0); shape.quadraticCurveTo(8.5, 0.6, 9.6, 3.9);
    shape.lineTo(-6, 3.9); shape.lineTo(-6, 0);
    const geo = new THREE.ExtrudeGeometry(shape, {depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1});
    geo.translate(0, 0, -0.04);
    const steel = new THREE.MeshPhysicalMaterial({color: '#c9ced4', metalness: 1, roughness: 0.3});
    const handle = new THREE.MeshPhysicalMaterial({color: '#1d1a18', roughness: 0.55});
    const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), UP_W, N_W);
    const q = new THREE.Quaternion().setFromRotationMatrix(basis);
    return {geo, steel, handle, q};
  }, []);
  // edge 0.3 cm below the centre: the blade has just reached the middle
  const pos = new THREE.Vector3(-1.6, H, 0).addScaledVector(UP_W, -0.3);
  return (
    <group position={pos} quaternion={m.q}>
      <mesh geometry={m.geo} material={m.steel} castShadow />
      <mesh position={[-9.4, 2.2, 0]} material={m.handle} castShadow><boxGeometry args={[7, 2.5, 1.4]} /></mesh>
    </group>
  );
};

// A small right-angle mark where the line meets the blade's plane (cube-local, drawn through the butter).
const RightAngle: React.FC = () => {
  const g = useMemo(() => {
    const d = N_CUT.clone(), a = new THREE.Vector3(1, -1, 0).normalize(), k = 0.55;
    const pts = [a.clone().multiplyScalar(k), a.clone().multiplyScalar(k).addScaledVector(d, k), d.clone().multiplyScalar(k)];
    return tube(pts, 0.03);
  }, []);
  return <mesh geometry={g} material={lineMat(GUIDE, 1.2, false)} renderOrder={7} />;
};

const Wire: React.FC<{from: V3; to: V3}> = ({from, to}) => {
  const geo = useMemo(() => tube([new THREE.Vector3(...from), new THREE.Vector3(...to)], 0.028), [from, to]);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#d8dde2', metalness: 1, roughness: 0.22}), []);
  return <mesh geometry={geo} material={mat} castShadow />;
};

const Labels: React.FC<{s: Shot}> = ({s}) => {
  if (!s.nums) return null;
  return (
    <>
      {MIDS.map((m, i) => {
        const mid = m.clone().add(MIDS[(i + 1) % 6]).multiplyScalar(0.5);
        const out = mid.clone().multiplyScalar(1.5).addScaledVector(N_CUT, -0.05);
        const [x, y] = toScreen(toWorld(out, s.rotY), s);
        return (
          <div key={i} style={{position: 'absolute', left: x - 50, top: y - 60, width: 100, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 96, color: ACCENT, textShadow: '0 3px 18px rgba(0,0,0,0.7)'}}>{((2 - i + 6) % 6) + 1}</div>
        );
      })}
    </>
  );
};

export const Board: React.FC<{id: string; text?: boolean}> = ({id, text = true}) => {
  const s = SHOTS[id];
  return (
    <AbsoluteFill style={{background: '#16120f'}}>
      <Finish fr={0} bloom={0}>
        <ThreeCanvas width={W} height={HGT} dpr={2} shadows="percentage"
          onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 0.85; }}>
          <Cam s={s} />
          <Room />
          <Cube s={s} />
        </ThreeCanvas>
      </Finish>
      <Labels s={s} />
      {text && (
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 230, fontFamily: SANS, textAlign: 'center'}}>
          <div style={{fontSize: 104, fontWeight: 800, color: '#fff', letterSpacing: -1, lineHeight: 1.0, textShadow: '0 4px 30px rgba(0,0,0,0.6)'}}>{s.title[0]}</div>
          {s.title[1] && <div style={{fontSize: 104, fontWeight: 800, color: s.title2White ? '#fff' : ACCENT, letterSpacing: -1, lineHeight: 1.05, textShadow: '0 4px 30px rgba(0,0,0,0.6)'}}>{s.title[1]}</div>}
          {s.pause && <div style={{marginTop: 30, display: 'flex', gap: 26}}>{[0, 1].map((k) => <div key={k} style={{width: 34, height: 120, borderRadius: 8, background: '#fff', boxShadow: '0 4px 30px rgba(0,0,0,0.6)'}} />)}</div>}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
