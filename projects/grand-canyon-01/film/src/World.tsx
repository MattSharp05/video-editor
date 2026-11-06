// One continuous 3D world: the real canyon as a block of layered rock, a schist boulder and a riverbed at true scale
// inside it, and the sea to the west. The camera never cuts; it travels in scale (metres -> 60 km) on the words.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {interpolate, getInputProps} from 'remotion';
import {useThree} from '@react-three/fiber';
import {Fields, makeBlock, shapeBlock, riverPoint, Y, VEX, wx, wz, Shape} from './terrain';
import {Look, SUN, HORIZON, UNDER, fogUniforms, terrainMaterial, sideMaterial, boulderMaterial, waterMaterial, bedMaterial, skyMaterial, makeEnvironment, stoneGeometry, blobTexture} from './look';
import B from './beats.json';

export const FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t: number) => 1 - Math.pow(1 - t, 3);
export const ramp = (t: number, a: number, b: number, e = ease) => e(interpolate(t, [a, b], [0, 1], clamp));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const K0 = 200;                       // the river point where the boulder sits and the camera dives
export const UP = -2.0 * VEX;                // the block before uplift: ~2 km lower ("thousands of feet")

// ---------- the story's state at time t: canyon shape, block height, highlights ----------
export type State = Shape & {up: number; glow: number; glowAmt: number; line: number; steep: number; flood: number; fall: number};
export const stateAt = (t: number): State => {
  let depth = 1, width = 40, up = 0;
  // "Long before the canyon": fill it and lower the block; "pushed up": raise it; "cut straight down": a narrow slot
  const fill = ramp(t, B.before, B.before + 1.6), rise = ramp(t, B.pushed, B.pushed + 2.2), cut = ramp(t, B.cut, B.cut + 2.4);
  if (t >= B.before && t < B.mostly) {
    depth = t < B.cut ? 1 - fill : cut;
    width = t < B.cut ? 40 : lerp(1.6, 3.5, ramp(t, B.l6, B.l7 + 3, ease));
    up = t < B.pushed ? UP * fill : UP * (1 - rise);
  }
  if (t >= B.mostly) width = lerp(3.5, 40, ramp(t, B.sidecanyons - 0.4, B.eighteen + 0.6, ease));
  // recap: reset to the low plateau, then rise / cut / widen on each clause
  if (t >= B.l9 - 0.2 && t < B.l10) {
    const reset = ramp(t, B.l9 - 0.2, B.rose - 0.05);
    depth = t < B.ground ? 1 - reset : ramp(t, B.ground, B.ground + 1.0);
    width = t < B.pulled ? 1.0 : lerp(1.0, 40, ramp(t, B.pulled, B.pulled + 1.2));
    up = t < B.rose ? UP * reset : UP * (1 - ramp(t, B.rose, B.rose + 0.9));
  }
  // band highlights: seabeds (Redwall), swamps (Hermit), desert of dunes (Coconino)
  let glow = -1, glowAmt = 0;
  const g = (at: number, until: number) => Math.min(ramp(t, at, at + 0.3), 1 - ramp(t, until - 0.2, until));
  if (t >= B.seabeds && t < B.swamps) { glow = 5; glowAmt = g(B.seabeds, B.swamps); }
  else if (t >= B.swamps && t < B.desert) { glow = 3; glowAmt = g(B.swamps, B.desert); }
  else if (t >= B.desert && t < B.hard) { glow = 2; glowAmt = g(B.desert, B.hard); }
  // the river's drop to the sea (profile line), shown from "fast water" to "cut straight down" and in the recap
  const line = Math.max(Math.min(ramp(t, B.l4 + 0.4, B.l4 + 1.4), 1 - ramp(t, B.cut + 0.5, B.cut + 1.2)),
    Math.min(ramp(t, B.fell - 0.2, B.fell + 0.2), 1 - ramp(t, B.ground, B.ground + 0.4)));
  const steep = Math.max(Math.min(ramp(t, B.drop1, B.drop1 + 0.5, out), 1 - ramp(t, B.drop1 + 1.4, B.drop1 + 1.8)),
    Math.min(ramp(t, B.drop2, B.drop2 + 0.5, out), 1 - ramp(t, B.cut + 0.3, B.cut + 0.8)), Math.min(ramp(t, B.fell, B.fell + 0.3), 1 - ramp(t, B.ground, B.ground + 0.3)));
  const flood = Math.max(interpolate(t, [B.flash - 0.3, B.flash + 1.1], [0, 1], clamp) * (t < B.rockfall + 1 ? 1 : 0),
    interpolate(t, [B.floods - 0.1, B.floods + 1.6], [0, 1], clamp) * (t >= B.l10 ? 1 : 0));
  const fall = t >= B.l10 ? interpolate(t, [B.fall - 0.25, B.fall + 1.4], [0, 1], clamp) : interpolate(t, [B.rockfall - 0.2, B.rockfall + 1.6], [0, 1], clamp);
  return {depth, width, up, glow, glowAmt, line, steep, flood, fall};
};

// ---------- camera: keys of [time, target, distance (km, log-interpolated), azimuth deg (0 = from south), elevation deg] ----------
type Key = [number, THREE.Vector3, number, number, number];
export type Rig = {pos: THREE.Vector3; target: THREE.Vector3};
export const makeKeys = (f: Fields, rock: THREE.Vector3, bed: THREE.Vector3, todayRiver: (k: number) => THREE.Vector3): Key[] => {
  const mid = todayRiver(f.river.length * 0.5).clone().setY(Y(1500));
  const west = new THREE.Vector3(wx(f, 0), Y(1300), todayRiver(0).z);   // river[0] = west end (downstream)
  const trib = f.trib[Math.floor(f.trib.length * 0.45)];
  const tribP = new THREE.Vector3(wx(f, trib[0]), Y(1500), wz(f, trib[1]));
  const fallP = rockfallPoint(f);
  const sea = new THREE.Vector3(-34, Y(500), 0);
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  return [
    [0, rock, 0.0062, 10, 7],
    [B.l1 - 0.1, rock, 0.0054, 6, 7],
    [B.l1 + 2.4, mid, 30, 18, 34],
    [B.l2 + 0.6, todayRiver(K0 - 40).clone().setY(Y(1400)), 11, 58, 14],
    [B.mile + 0.8, todayRiver(K0 - 20).clone().setY(Y(1300)), 8, 70, 12],
    [B.l3 + 0.55, rock, 0.35, 80, 72],                         // straight down onto the green river
    [B.l3 + 1.3, bed, 0.0042, 92, 9],
    [B.l4 - 0.2, bed, 0.0040, 100, 8],
    [B.l4 + 1.6, west, 28, -38, 14],
    [B.drop1 + 0.6, sea.clone().add(v(14, 0, 0)), 62, -6, 6],
    [B.pushed + 1.0, sea.clone().add(v(16, 0.6, 0)), 60, -2, 7],
    [B.drop2 + 0.4, sea.clone().add(v(18, 0.4, 0)), 58, 0, 8],
    [B.cut + 1.6, mid, 24, 22, 38],
    [B.l6 + 0.4, west.clone().setY(Y(600)), 9.5, -84, 4],
    [B.cliff, west.clone().setY(Y(2000)), 9.0, -78, 6],
    [B.staircase + 0.6, west.clone().setY(Y(1500)), 10.5, -70, 10],
    [B.mostly + 0.2, mid, 26, 8, 62],
    [B.flash - 0.2, tribP, 16, 20, 58],
    [B.rockfall + 0.2, fallP, 3.2, 40, 18],
    [B.eighteen + 0.2, mid, 34, 4, 66],
    [B.l9 + 0.3, mid, 33, 28, 30],
    [B.l10 - 0.3, mid, 30, 34, 30],
    [B.fall + 0.1, fallP, 3.6, 44, 18],
    [B.total - 1.7, rock, 0.4, 30, 70],
    [B.total - 0.9, rock, 0.014, 14, 9],
    [B.total, rock, 0.0062, 10, 7],
  ];
};
export const rockfallPoint = (f: Fields) => { const p = f.trib[Math.floor(f.trib.length * 0.82)]; return new THREE.Vector3(wx(f, p[0]), Y(1350), wz(f, p[1])); };

// monotone cubic (Fritsch-Carlson): smooth through every key, never overshoots (no dips through the ground)
const pchip = (ts: number[], ys: number[], t: number) => {
  const n = ts.length; if (t <= ts[0]) return ys[0]; if (t >= ts[n - 1]) return ys[n - 1];
  let i = 0; while (t > ts[i + 1]) i++;
  const h = (k: number) => ts[k + 1] - ts[k], d = (k: number) => (ys[k + 1] - ys[k]) / h(k);
  const m = (k: number) => {
    if (k === 0 || k === n - 1) return 0;                       // start and end at rest
    const a = d(k - 1), b = d(k); if (a * b <= 0) return 0;
    const w1 = 2 * h(k) + h(k - 1), w2 = h(k) + 2 * h(k - 1); return (w1 + w2) / (w1 / a + w2 / b);
  };
  const u = (t - ts[i]) / h(i), u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h(i) * m(i) + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h(i) * m(i + 1);
};
export const rigAt = (keys: Key[], t: number): Rig => {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const [ta, , da] = keys[i], [tb, , db] = keys[i + 1];
  const ts = keys.map((k) => k[0]);
  const ch = (f: (k: Key) => number, tt = t) => pchip(ts, keys.map(f), tt);
  const dist = Math.exp(ch((k) => Math.log(k[2])));
  // a big zoom aims at its new subject early, so the camera falls onto it instead of passing through walls
  const zoom = Math.abs(Math.log(db / da)) > 3, u = interpolate(t, [ta, tb], [0, 1], clamp);
  const tt = zoom ? ta + (tb - ta) * (db > da ? Math.pow(u, 0.35) : Math.pow(u, 0.45)) : t;
  const target = new THREE.Vector3(ch((k) => k[1].x, tt), ch((k) => k[1].y, tt), ch((k) => k[1].z, tt));
  const az = THREE.MathUtils.degToRad(ch((k) => k[3])), el = THREE.MathUtils.degToRad(ch((k) => k[4]));
  const pos = target.clone().add(new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(dist));
  return {pos, target};
};

// ---------- small 3D pieces ----------
const strip = (pts: THREE.Vector3[], width: number, lift: number) => {
  const g = new THREE.BufferGeometry(), p: number[] = [], idx: number[] = [], fl: number[] = [];
  let run = 0;
  pts.forEach((a, i) => {
    if (i) run += a.distanceTo(pts[i - 1]); fl.push(run, 0, run, 1);
    const b = pts[Math.min(pts.length - 1, i + 1)], c = pts[Math.max(0, i - 1)];
    const d = b.clone().sub(c).setY(0).normalize(), n = new THREE.Vector3(-d.z, 0, d.x).multiplyScalar(width / 2);
    p.push(a.x + n.x, a.y + lift, a.z + n.z, a.x - n.x, a.y + lift, a.z - n.z);
    if (i < pts.length - 1) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  });
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('flow', new THREE.Float32BufferAttribute(fl, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};

const vh = (x: number, y: number) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
const vnoise = (x: number, y: number) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return (vh(xi, yi) * (1 - u) + vh(xi + 1, yi) * u) * (1 - v) + (vh(xi, yi + 1) * (1 - u) + vh(xi + 1, yi + 1) * u) * v; };
// schist boulder face: foliation bands with pink granite veins, a displaced plane facing the camera (south)
const Boulder: React.FC<{at: THREE.Vector3}> = ({at}) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.0062, 0.0042, 120, 90), p = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) * 1000, y = p.getY(i) * 1000;                     // metres
      // foliation: wavy, uneven bands (warped by noise, never a clean stripe), lumpy surface, one granite vein
      const n1 = vnoise(x * 0.9, y * 0.9), n2 = vnoise(x * 3.1 + 7, y * 3.1), n3 = vnoise(x * 9 + 3, y * 9 + 5);
      const fol = Math.sin((y * 1.6 + x * 0.45) * 2.2 + n1 * 5.0) * (0.5 + n2 * 0.5);
      const bump = 0.22 * n1 + 0.07 * n2 + 0.025 * n3 + 0.04 * fol + 0.3 * Math.exp(-((x + 0.8) ** 2) / 3);
      p.setZ(i, bump / 1000);
      const vein = Math.abs(y - 0.35 * x - 0.4 + (n1 - 0.5) * 0.9) < 0.05 + n3 * 0.04;
      c.set('#5C5662').lerp(new THREE.Color('#857C86'), Math.max(0, fol) * 0.7).lerp(new THREE.Color('#3E3A43'), Math.max(0, -fol) * 0.6);
      if (vein) c.set('#D7AFA4');
      c.multiplyScalar(0.82 + 0.3 * n3);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    return g;
  }, []);
  const mat = useMemo(() => boulderMaterial(at.clone()), [at.x, at.z]);
  // the face plus a rounded body behind it, so the boulder has mass when seen from above
  return (
    <group>
      <mesh geometry={geo} position={[at.x, at.y + 0.0012, at.z - 0.0016]} material={mat} castShadow receiveShadow />
      <mesh position={[at.x, at.y + 0.0006, at.z - 0.0036]} scale={[0.0034, 0.0024, 0.0022]} castShadow receiveShadow><icosahedronGeometry args={[1, 3]} /><meshStandardMaterial color="#4A4550" roughness={0.85} flatShading /></mesh>
    </group>
  );
};

// riverbed under the water: pebbles hop downstream; on "scour" they chip the bed (sparks of grit)
const Bed: React.FC<{at: THREE.Vector3; dir: THREE.Vector3; t: number; mats: Mats}> = ({at, dir, t, mats}) => {
  const stones = useMemo(() => Array.from({length: 6}, (_, i) => stoneGeometry(i + 1)), []);
  const rocks = useMemo(() => Array.from({length: 16}, (_, i) => ({
    r: (0.06 + ((i * 37) % 11) / 11 * 0.32) / 1000, off: ((i * 53) % 29) / 29, lane: (((i * 17) % 13) / 13 - 0.5) * 0.0026,
    sp: 0.5 + ((i * 29) % 7) / 7 * 0.6, col: ['#9A8C7C', '#B49E80', '#857C74', '#C4A886', '#6E6660'][i % 5]})), []);
  const flood = interpolate(t, [B.l3 + 1.5, B.scour - 0.2, B.l4 + 1], [0.35, 1, 1], clamp);
  const side = new THREE.Vector3(-dir.z, 0, dir.x);
  const chips = t > B.scour - 0.3 && t < B.l4 + 1.4;
  return (
    <group>
      {rocks.map((k, i) => {
        const span = 0.006, u = ((t * k.sp * flood * 0.0016) / span + k.off) % 1;
        const hopPh = (u * 9 + k.off * 3) % 1, hop = Math.pow(Math.abs(Math.sin(hopPh * Math.PI)), 2) * (k.r * 1.1 + 0.00005) * flood;
        const p = at.clone().add(dir.clone().multiplyScalar((u - 0.5) * span)).add(side.clone().multiplyScalar(k.lane)).setY(at.y + k.r * 0.34 + hop);
        const roll = (u * span) / k.r;                                  // rolls as far as it travels
        return (
          <group key={i}>
            <mesh geometry={stones[i % 6]} position={p} scale={k.r} rotation={[0, i * 1.7, -roll * 0.35]} castShadow receiveShadow><meshStandardMaterial color={k.col} roughness={0.55} /></mesh>
            <mesh position={[p.x, at.y + 0.000004, p.z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[k.r * 2.6, k.r * 2.0]} /><meshBasicMaterial map={blobTexture()} transparent depthWrite={false} opacity={Math.max(0, 0.8 - hop / (k.r * 1.2))} /></mesh>
          </group>
        );
      })}
      {chips && Array.from({length: 40}, (_, i) => {
        const ph = ((t - B.scour) * 1.8 + i / 40) % 1, a = i * 2.39;
        const base = at.clone().add(dir.clone().multiplyScalar(((i * 7) % 10 / 10 - 0.5) * 0.004));
        const p = base.add(new THREE.Vector3(Math.cos(a) * ph * 0.0006, ph * 0.0007 * (1 - ph) * 4 + 0.00002, Math.sin(a) * ph * 0.0006));
        return <mesh key={'c' + i} position={p}><boxGeometry args={[0.00003, 0.00003, 0.00003]} /><meshBasicMaterial color="#E9DCC0" transparent opacity={1 - ph} /></mesh>;
      })}
      {/* the bed itself: dark bedrock with scratches that brighten as it is scoured */}
      <mesh position={[at.x, at.y - 0.00001, at.z]} rotation={[-Math.PI / 2, 0, Math.atan2(dir.x, dir.z)]} receiveShadow>
        <planeGeometry args={[0.03, 0.03, 64, 64]} /><primitive object={mats.bed} attach="material" />
      </mesh>
    </group>
  );
};

const Chunks: React.FC<{at: THREE.Vector3; k: number}> = ({at, k}) => {
  const stones = useMemo(() => Array.from({length: 4}, (_, i) => stoneGeometry(i + 11, 2)), []);
  return (
  <group>
    {k > 0 && k < 1 && Array.from({length: 9}, (_, i) => {
      const d = Math.max(0, k * 1.25 - i * 0.03), g = d * d;
      const p = at.clone().add(new THREE.Vector3(0.05 + (i % 3) * 0.04, 0.35 - g * 0.9, 0.06 + i * 0.012 + d * 0.25));
      const s = 0.045 + (i % 4) * 0.025;
      return <mesh key={i} geometry={stones[i % 4]} position={p} scale={s * 0.6} rotation={[d * 5 + i, d * 3, i]} castShadow><meshStandardMaterial color="#A5705A" roughness={0.95} /></mesh>;
    })}
    {k > 0.35 && k < 1 && <mesh position={at.clone().add(new THREE.Vector3(0.1, -0.5, 0.25))}><sphereGeometry args={[0.08 + k * 0.25, 16, 12]} /><meshBasicMaterial color="#D8B898" transparent opacity={0.12 * (1 - k)} depthWrite={false} /></mesh>}
  </group>
  );
};

// ---------- the plan: fixed positions and the camera keys, shared by the 3D scene and the HTML overlay ----------
const plans = new WeakMap<Fields, ReturnType<typeof buildPlan>>();
const buildPlan = (f: Fields) => {
  const todayElev = shapeBlock(f, makeBlock(f), {depth: 1, width: 40});
  const today = (k: number) => riverPoint(f, k, todayElev);
  const rp = today(K0);
  const bedM = ((rp.y / VEX) * 1000 + 700) - 4;                  // a little beach flattened 4 m under the water
  const flat: [number, number, number, number] = [rp.x, rp.z, 0.22, bedM];
  const dir = today(K0 - 3).sub(today(K0 + 3)).setY(0).normalize();   // downstream = toward river[0]
  const bed = rp.clone().add(dir.clone().multiplyScalar(0.03)).setY(Y(bedM) + 0.0002);
  const rockC = new THREE.Vector3(rp.x, Y(bedM) + 0.0025 + 0.0018, rp.z - 0.0016);
  const keys = makeKeys(f, rockC, bed.clone().setY(bed.y + 0.0007), today);
  return {todayElev, today, rp, flat, dir, bed, keys};
};
export const planFor = (f: Fields) => { let p = plans.get(f); if (!p) { p = buildPlan(f); plans.set(f, p); } return p; };

// ---------- the world ----------
type Mats = {top: THREE.Material; side: THREE.Material; water: THREE.Material; bed: THREE.Material; sky: THREE.ShaderMaterial;
  U: ReturnType<typeof fogUniforms>; uTime: THREE.IUniform; uCaustic: THREE.IUniform; env: THREE.Texture};
export const World: React.FC<{f: Fields; t: number; look: Look}> = ({f, t, look}) => {
  const {camera, scene, gl} = useThree();
  const blk = useMemo(() => makeBlock(f), [f]);
  const mats: Mats = useMemo(() => {
    const U = fogUniforms(), uTime = {value: 0}, uCaustic = {value: 0};
    return {top: terrainMaterial(look, U), side: sideMaterial(U), water: waterMaterial(U, uTime), bed: bedMaterial(uTime, uCaustic),
      sky: skyMaterial(), U, uTime, uCaustic, env: makeEnvironment(gl)};
  }, [look, gl]);
  const sun = useMemo(() => { const l = new THREE.DirectionalLight('#FFE2BC', 2.4); l.shadow.mapSize.set(1536, 1536); l.shadow.radius = 4; return l; }, []);
  const s = stateAt(t);
  const {rp, flat, dir, bed, keys} = planFor(f);
  const elev = shapeBlock(f, blk, {depth: s.depth, width: s.width, flat}, s.glow, s.glowAmt);
  const waterY = (k: number) => riverPoint(f, k, elev).y + 0.0025;
  const rock = new THREE.Vector3(rp.x, waterY(K0), rp.z);
  const rig = rigAt(keys, t);
  camera.position.copy(rig.pos); camera.lookAt(rig.target);
  const cam = camera as THREE.PerspectiveCamera; cam.fov = 40; cam.near = 0.0002; cam.far = 400; cam.updateProjectionMatrix();
  const camDist = rig.pos.distanceTo(rig.target);
  // colour: film-like tone mapping, exposure per shot; the sky lights everything through the environment
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  const under = rig.pos.y < waterY(K0) - 0.0001 && rig.pos.distanceTo(rock) < 0.3;
  gl.toneMappingExposure = under ? 1.1 : camDist < 0.05 ? 1.0 : 0.9;
  // profiling switches (render --props): {"off": ["detail", "env", "shadow"]}
  const OFF: string[] = ((getInputProps() as {off?: string[]}).off) || [];
  scene.environment = OFF.includes('env') ? null : mats.env; scene.environmentIntensity = 0.6;
  mats.U.uDetail.value = OFF.includes('detail') ? 0 : 1;
  mats.U.uUnder.value = under ? 1 : 0; (mats.sky.uniforms.uUnder as THREE.IUniform).value = under ? 1 : 0;
  mats.uTime.value = t; mats.uCaustic.value = under ? 1 : 0.4;
  // small objects use three's fog, in the same colours as the custom height fog
  const fog = under ? new THREE.Fog(0xffffff, 0.0012, 0.014) : new THREE.Fog(0xffffff, 40, 150);
  fog.color.copy(under ? UNDER : HORIZON); scene.fog = fog;
  // the sun: one tight shadow map for the close shots only (boulder, riverbed, rockfall); otherwise baked light does it
  const shadowShot = camDist < 0.06 || (camDist < 6 && s.fall > 0 && s.fall < 1);
  sun.castShadow = shadowShot && !OFF.includes('shadow');
  const half = Math.max(0.004, camDist * 0.85);
  sun.position.copy(rig.target).add(SUN.clone().multiplyScalar(half * 6)); sun.target.position.copy(rig.target); sun.target.updateMatrixWorld();
  Object.assign(sun.shadow.camera, {left: -half, right: half, top: half, bottom: -half, near: half * 0.5, far: half * 14});
  sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias = -0.0004; sun.shadow.normalBias = half * 0.004;
  const river = f.river.map((_, k) => riverPoint(f, k, elev));
  const riverGeo = strip(river, 0.095, 0.0025);
  const lift = s.up;
  // river profile to the sea: from the block's west edge down to sea level (dashed by segments)
  const exit = river[0].clone().setY(river[0].y + lift);
  const seaP = new THREE.Vector3(-58, Y(0), exit.z);
  const tribPts = f.trib.map(([c, r]) => new THREE.Vector3(wx(f, c), Y(elev[r * f.G + c]) + 0.01, wz(f, r)));
  const fl = s.flood, head = Math.floor(fl * (tribPts.length - 1)), tail = Math.max(0, head - 26);
  const floodPts = tribPts.slice(tail, head + 1).filter((_, i, a) => i % 4 === 0 || i === a.length - 1);
  const floodCurve = fl > 0 && fl < 1 && floodPts.length > 2 ? new THREE.CatmullRomCurve3(floodPts.map((p) => p.clone().setY(p.y + 0.03))) : null;
  const floodO = Math.min(1, (1 - fl) * 4);
  return (
    <>
      <mesh position={rig.pos} material={mats.sky} renderOrder={-1} frustumCulled={false}><sphereGeometry args={[250, 48, 24]} /></mesh>
      <hemisphereLight args={['#BFD3EA', '#6A4A34', 0.35]} />
      <primitive object={sun} />
      <primitive object={sun.target} />
      <group position={[0, lift, 0]}>
        <mesh geometry={blk.top} material={mats.top} receiveShadow />
        <mesh geometry={blk.side} material={mats.side} />
        <mesh geometry={riverGeo} material={mats.water} receiveShadow />
        {floodCurve && <>
          <mesh><tubeGeometry args={[floodCurve, 48, 0.05, 8, false]} /><meshBasicMaterial color="#E6F7FF" transparent opacity={0.85 * floodO} depthTest={false} toneMapped={false} /></mesh>
          <mesh><tubeGeometry args={[floodCurve, 48, 0.26, 8, false]} /><meshBasicMaterial color="#9ED8F0" transparent opacity={0.16 * floodO} depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
        </>}
        <Boulder at={rock} />
        {Array.from({length: 36}, (_, i) => {
          const u = ((t * 0.18 + i * 0.137) % 1), lane = ((i * 37) % 17) / 17 - 0.5;
          const p = rock.clone().add(dir.clone().multiplyScalar((u - 0.5) * 0.02)).add(new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.0008 + lane * 0.006)).setY(rock.y + 0.00002);
          return <mesh key={'foam' + i} position={p} rotation={[-Math.PI / 2, 0, Math.atan2(dir.x, dir.z)]}><planeGeometry args={[0.00012, 0.0011]} /><meshBasicMaterial color="#E8F2EC" transparent opacity={0.55 * Math.sin(u * Math.PI)} /></mesh>;
        })}
        <Bed at={bed} dir={dir} t={t} mats={mats} />
        <Chunks at={rockfallPoint(f)} k={s.fall} />
      </group>
      {/* the sea to the west, and the river's drop to it */}
      <mesh position={[-48, Y(0), 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[60, 40]} /><meshStandardMaterial color="#3E6E7E" roughness={0.2} transparent opacity={0.85 * s.line} /></mesh>
      {s.line > 0.01 && Array.from({length: 18}, (_, i) => {
        const a = i / 18, b = (i + 0.55) / 18;
        const pa = exit.clone().lerp(seaP, a), pb = exit.clone().lerp(seaP, b);
        const mid = pa.clone().add(pb).multiplyScalar(0.5), len = pa.distanceTo(pb);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), pb.clone().sub(pa).normalize());
        return <mesh key={i} position={mid} quaternion={q}><boxGeometry args={[len, 0.18 + 0.12 * s.steep, 0.18 + 0.12 * s.steep]} /><meshBasicMaterial color={s.steep > 0.3 ? '#FFE1A8' : '#F4EBDD'} transparent opacity={s.line} toneMapped={false} /></mesh>;
      })}
    </>
  );
};

// for the HTML overlay: where things are on screen
export const project = (p: THREE.Vector3, rig: Rig, w = 1080, h = 1920) => {
  const c = new THREE.PerspectiveCamera(40, w / h, 0.0002, 400);
  c.position.copy(rig.pos); c.lookAt(rig.target); c.updateMatrixWorld(); c.updateProjectionMatrix();
  const v = p.clone().project(c);
  return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, visible: v.z < 1};
};
