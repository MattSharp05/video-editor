// Every state of the film as a pure function of time t (seconds), cued from the spoken words, so a new voiceover
// re-times the film. Units: centimetres. Floor at y = 0; boards run along x, cracks are the lines z = k·D. On screen
// "up" is -z. The room's matches live in x ±16, z -24..18; the measuring board is z 18..24; the hoop bench is around
// x = 45; the hall is a separate stretch of the same floor centred at HALL.
import * as THREE from 'three';
import {cue, cueEnd, VO_END} from './lib';
import {DROPS, D, L, ROOM_N, N, crossings} from './sim';

export const DUR_S = VO_END + 2.0;
export const AMBER = '#FFB547', ICE = '#8CCBFF';

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const fract = (x: number) => x - Math.floor(x);
const hash = (i: number, k = 0) => fract(Math.sin(i * 127.1 + k * 311.7) * 43758.5453);

// ---------- beats (from the words)
export const B = {
  drop: cue('Drop matches'), counting: cue('counting them'), each: cue('Each match is'), wide: cueEnd('floorboard is wide.'),
  what: cue('What share'), crack: cueEnd('across a crack?'), pause: cue('Pause and guess.'), guessEnd: cueEnd('Pause and guess.'),
  most: cue('Most of them'), twoIn3: cue('two in three.'), why: cue("Here's why"), bend: cue('bend a wire'),
  hoopWide: cue('as wide as'), wherever: cue('Wherever'), twice: cue('the cracks twice.'), straighten: cue('Straighten'),
  piLong: cue('pi matches long.'), cutIt: cue('Cut it into'), scatter: cue('scatter them'), still: cue('still two'),
  so: cue('So each match has'), sixty: cue('sixty-four'), count: cue('Count the crossings'), estimate: cue('estimate pi.'),
  twenty: cue('Twenty thousand'), three14: cue('three point one four.'), end: VO_END,
};
export const CUT_HALL = B.count - 0.12; // the room -> the hall

// ---------- the room's 200 matches
export const ROOM = {x0: -16, x1: 16, z0: -24, boards: 7};
export type Pose = {x: number; y: number; z: number; a: number; tilt: number; spin: number; roll: number};
export const roomBase = (i: number) => {
  const d = DROPS[i];
  return {x: lerp(ROOM.x0, ROOM.x1, d.u), z: ROOM.z0 + D * Math.floor(d.w * ROOM.boards) + d.s, a: d.a};
};
// land time: the first ones land just after frame 0 (some are already in the air), the rest over ~3 s
export const landRoom = (i: number) => -0.25 + 3.1 * Math.pow(i / ROOM_N, 0.85) + 0.18 * hash(i, 1);
const FALL = 0.55, HDROP = 38;
// a falling-and-settling pose: from height with a tumble to flat, one small bounce
export const fallPose = (t: number, land: number, x: number, z: number, a: number, seed: number): Pose & {vis: number} => {
  const u = (t - (land - FALL)) / FALL;
  if (u < 0) return {x, y: HDROP + 5, z, a, tilt: 0, spin: 0, roll: 0, vis: 0};
  const k = Math.min(u, 1), y = 0.12 + HDROP * (1 - k * k);
  const tumble = (1 - k) * (1 - k);
  const after = t - land;
  const bounce = after > 0 ? 0.45 * Math.max(0, Math.sin(Math.min(after / 0.16, 1) * Math.PI)) : 0;
  const wob = after > 0 ? 0.12 * Math.exp(-after * 12) * Math.sin(after * 60) : 0;
  return {x, y: y + bounce, z, a: a + tumble * (2.5 + 3 * hash(seed, 2)), tilt: tumble * 1.4 * (hash(seed, 3) - 0.5) + wob,
    spin: tumble * 4 * (hash(seed, 4) - 0.5), roll: 0, vis: 1};
};

// crossing points: where a match (centre x,z, angle a, length len) crosses the crack lines
export const crossPoints = (x: number, z: number, a: number, len: number) => {
  const h = (len / 2) * Math.sin(a), pts: [number, number][] = [];
  const lo = Math.min(z - h, z + h), hi = Math.max(z - h, z + h);
  for (let k = Math.ceil(lo / D); k * D <= hi; k++) { const zc = k * D; const s = (zc - z) / Math.sin(a); pts.push([x + s * Math.cos(a), zc]); }
  return pts;
};

// reveal: crossers light amber in a wave from the top (far edge), misses dim; then they slide into two rafts
export const waveAt = (z: number) => B.most + 0.05 + 0.75 * clamp01((z - ROOM.z0) / (ROOM.boards * D));
export const lit = (t: number, i: number) => DROPS[i].cross ? ramp(t, waveAt(roomBase(i).z), waveAt(roomBase(i).z) + 0.25) : 0;
export const dimmed = (t: number, i: number) => DROPS[i].cross ? 0 : ramp(t, waveAt(roomBase(i).z), waveAt(roomBase(i).z) + 0.25);
export const ROOM_CROSS = crossings(ROOM_N);
const crossRank: number[] = []; const missRank: number[] = [];
(() => { let c = 0, m = 0; for (let i = 0; i < ROOM_N; i++) { if (DROPS[i].cross) crossRank[i] = c++; else missRank[i] = m++; } })();
export const RAFT = {pitch: 0.26, x0: -16.8, zCross: -15, zMiss: -3};
export const raftSlot = (i: number) => DROPS[i].cross
  ? {x: RAFT.x0 + crossRank[i] * RAFT.pitch, z: RAFT.zCross}
  : {x: RAFT.x0 + missRank[i] * RAFT.pitch, z: RAFT.zMiss};
export const raftStart = (i: number) => B.most + 1.0 + 0.9 * (DROPS[i].cross ? crossRank[i] / 140 : missRank[i] / 140);
export const RAFT_DUR = 0.55;
export const raftK = (t: number, i: number) => ramp(t, raftStart(i), raftStart(i) + RAFT_DUR);
// the rafts leave the frame's attention once the hoop starts: they stay where they are

// ---------- the measuring board (z 18..24) and the two demo matches
export const MEASURE = {x: 0, z: 21, a: Math.PI / 2, land: 0};
export const DEMO = {cross: {x: -9, z: 18.8, a: (50 * Math.PI) / 180}, miss: {x: 9, z: 21.2, a: (8 * Math.PI) / 180}};
export const measureLand = () => B.each + 0.25;
export const demoLand = (k: 0 | 1) => B.what + 0.05 + 0.3 * k;
export const ticks = (t: number) => ramp(t, B.each + 0.9, B.each + 1.3) * (1 - ramp(t, B.what + 0.2, B.what + 0.6));
// the pile dims while the two demo matches are shown, so they lead
export const pileDim = (t: number) => ramp(t, B.what, B.what + 0.4) * (1 - ramp(t, B.pause - 0.1, B.pause + 0.4));
export const demoLit = (t: number) => ramp(t, demoLand(0) + 0.15, demoLand(0) + 0.45) * (1 - ramp(t, B.pause - 0.2, B.pause + 0.3));

// ---------- the hoop bench (x ≈ 45)
export const BENCH = {x: 45, z: 0}; // the hoop centre at rest; the straight wire lies R further on +z (z = 3, a board centre)
export const WIRE_LEN = Math.PI * D;            // 18.85 cm: a hoop 6 cm across
export const HOOP_R = D / 2;
// bend 0 = straight, 1 = closed hoop
export const bendK = (t: number) => ramp(t, B.bend + 0.2, B.hoopWide + 0.5) * (1 - ramp(t, B.straighten + 0.1, B.piLong + 0.2));
// the hoop drops: centres chosen so each straddles one crack (twice); not random, the claim holds for any place
export const HOOP_DROPS: [number, number][] = [[41.5, 1.2], [49.0, 4.7], [44.0, 9.6], [47.5, -2.3]];
export const hoopDropAt = (k: number) => B.wherever - 0.15 + k * ((B.straighten - 0.3 - (B.wherever - 0.15)) / 4.4);
// the hoop's centre and height over time (bench → four drops → back to the straight-wire line)
export const hoopPose = (t: number) => {
  let cx = BENCH.x, cz = BENCH.z, y = 0.1 + 4 * ramp(t, B.hoopWide + 0.2, B.hoopWide + 0.6);
  for (let k = 0; k < HOOP_DROPS.length; k++) {
    const a = hoopDropAt(k), [px, pz] = k === 0 ? [BENCH.x, BENCH.z] : HOOP_DROPS[k - 1];
    if (t >= a - 0.35) {
      const m = ramp(t, a - 0.35, a - 0.08);
      cx = lerp(px, HOOP_DROPS[k][0], m); cz = lerp(pz, HOOP_DROPS[k][1], m);
      const fall = clamp01((t - (a - 0.12)) / 0.12);
      y = t < a - 0.12 ? 4 : t < a ? 4 * (1 - fall * fall) + 0.1 : 0.1 + 0.35 * Math.max(0, Math.sin(Math.min((t - a) / 0.14, 1) * Math.PI));
      if (k < HOOP_DROPS.length - 1 && t > hoopDropAt(k + 1) - 0.35) y = 0.1 + 4 * ramp(t, hoopDropAt(k + 1) - 0.42, hoopDropAt(k + 1) - 0.3);
    }
  }
  // after the drops: lift and move to the straightening line (z = 9, x centred on the bench)
  const back = ramp(t, B.straighten - 0.25, B.straighten + 0.15);
  return {cx: lerp(cx, BENCH.x, back), cz: lerp(cz, STRAIGHT_Z, back), y: lerp(y, 0.1, back) + 3 * Math.sin(Math.PI * back)};
};
export const STRAIGHT_Z = 6, ROW_Z = 9.55; // straight wire at z = 9; the matches row lies right beside it (same depth, ends lined up)
export const hoopLanded = (t: number) => { // index of the drop it currently rests on (dots shown), or -1
  for (let k = HOOP_DROPS.length - 1; k >= 0; k--) { const a = hoopDropAt(k); if (t >= a && t < (k < 3 ? hoopDropAt(k + 1) - 0.42 : B.straighten - 0.25)) return k; }
  return -1;
};
export const hoopDots = (k: number) => {
  const [cx, cz] = HOOP_DROPS[k], pts: [number, number][] = [];
  for (let c = Math.ceil((cz - HOOP_R) / D); c * D <= cz + HOOP_R; c++) { const dz = c * D - cz, dx = Math.sqrt(Math.max(0, HOOP_R * HOOP_R - dz * dz)); pts.push([cx - dx, c * D], [cx + dx, c * D]); }
  return pts;
};
// three matches slide in beside the straight wire, plus a 0.85 cm ice stub (π − 3 match lengths)
export const rowIn = (t: number) => ramp(t, B.piLong - 0.3, B.piLong + 0.5);
export const rowMatch = (j: number) => ({x: BENCH.x - WIRE_LEN / 2 + L * j + L / 2, z: ROW_Z});
export const STUB = WIRE_LEN - 3 * L;

// ---------- cut and scatter: the straight wire splits into 3 match lengths + the stub; three seeded throws
const PIECES = [L, L, L, STUB];
const rnd = (() => { let s = 4242; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
export const THROWS = [0, 1, 2].map(() => PIECES.map((len) => {
  const x = BENCH.x - 9 + 18 * rnd(), z = -6 + D * Math.floor(rnd() * 4) + D * rnd(), a = Math.PI * rnd();
  return {len, x, z, a, pts: crossPoints(x, z, a, len)};
}));
export const THROW_COUNT = THROWS.map((th) => th.reduce((n, p) => n + p.pts.length, 0));
export const AVG_1000 = (() => { // average crossings over 1,000 throws of the four pieces, same generator
  let n = 0; for (let i = 0; i < 1000; i++) for (const len of PIECES) { const s = D * rnd(), a = Math.PI * rnd(), h = (len / 2) * Math.sin(a); n += Math.floor((s + h) / D) - Math.floor((s - h) / D); }
  return n / 1000;
})();
export const throwAt = (k: number) => B.cutIt + 0.55 + k * ((B.so - 0.35 - (B.cutIt + 0.55)) / 3.2);
export const snap = (t: number) => ramp(t, B.cutIt + 0.05, B.cutIt + 0.35); // the wire splits
export const piecesHome = (t: number) => ramp(t, B.so - 0.35, B.so + 0.35); // pieces return to the row line
export const avgLabel = (t: number) => ramp(t, B.still, B.still + 0.4) * (1 - ramp(t, B.so - 0.3, B.so));
export const sixtyFour = (t: number) => ramp(t, B.so + 0.4, B.so + 0.9);

// ---------- the hall: the same run continued to 20,000
export const HALL = {x: 3000, z: 0, half: 180, boards: 60}; // 3.6 m square at the room's density; half a multiple of D
export const hallBase = (i: number) => {
  const d = DROPS[i];
  return {x: HALL.x - HALL.half + 2 * HALL.half * d.u, z: HALL.z - HALL.half + D * Math.floor(d.w * HALL.boards) + d.s, a: d.a};
};
// the hall's matches land from the centre outward (the same run, counted in that order), so the camera can start
// close on a patch as dense as the room's and crane up as the carpet spreads. The count is over what has landed.
const ORDER = (() => {
  const r = (i: number) => { const b = hallBase(i); return Math.hypot(b.x - HALL.x, b.z - HALL.z) + 6 * hash(i, 7); };
  return Array.from({length: N}, (_, i) => i).sort((a, b) => r(a) - r(b));
})();
const RANK: number[] = []; ORDER.forEach((i, k) => { RANK[i] = k; });
const HCUM: number[] = (() => { const c = [0]; ORDER.forEach((i) => c.push(c[c.length - 1] + (DROPS[i].cross ? 1 : 0))); return c; })();
const N0 = ROOM_N, T0 = CUT_HALL, T1 = B.three14 - 0.2;
export const hallN = (t: number) => t < T0 ? 0 : N0 * Math.pow(N / N0, Math.pow(clamp01((t - T0) / (T1 - T0)), 1.15));
export const landHall = (i: number) => RANK[i] < N0 ? T0 - 1 : T0 + (T1 - T0) * Math.pow(Math.log(RANK[i] / N0) / Math.log(N / N0), 1 / 1.15);
export const count = (t: number) => { const n = Math.min(N, Math.floor(hallN(t))); const c = HCUM[n]; return {n, c, pi: (2 * n) / Math.max(1, c)}; };
export const finalPi = (t: number) => ramp(t, B.three14 - 0.1, B.three14 + 0.5);

// ---------- labels (screen overlays projected from world points)
export type Label = {id: string; text: string; at: [number, number, number]; o: number; color: string; size: number; dy?: number};
export const labels = (t: number): Label[] => {
  const L0: Label[] = [];
  const on = (a: number, b: number) => ramp(t, a, a + 0.3) * (1 - ramp(t, b, b + 0.3));
  if (t < CUT_HALL) {
    L0.push({id: 'eq', text: 'match = board', at: [MEASURE.x + 4.5, 0, MEASURE.z], o: on(B.each + 1.0, B.what + 0.2), color: ICE, size: 46});
    L0.push({id: 'cross', text: 'crosses', at: [DEMO.cross.x, 0, DEMO.cross.z - 4.5], o: on(B.what + 0.5, B.pause - 0.3), color: AMBER, size: 44});
    L0.push({id: 'miss', text: 'misses', at: [DEMO.miss.x, 0, DEMO.miss.z - 4.5], o: on(B.what + 0.8, B.pause - 0.3), color: '#D8D2C8', size: 44});
    L0.push({id: 'r1', text: `${ROOM_CROSS} cross`, at: [RAFT.x0 + ROOM_CROSS * RAFT.pitch * 0.5, 0, RAFT.zCross - 5.5], o: on(B.most + 1.9, B.why + 0.6), color: AMBER, size: 54});
    L0.push({id: 'r2', text: `${ROOM_N - ROOM_CROSS} miss`, at: [RAFT.x0 + (ROOM_N - ROOM_CROSS) * RAFT.pitch * 0.5, 0, RAFT.zMiss - 5.5], o: on(B.most + 2.1, B.why + 0.6), color: '#D8D2C8', size: 54});
    const k = hoopLanded(t);
    if (k >= 0) L0.push({id: 'two', text: '2', at: [HOOP_DROPS[k][0] + 5.2, 0, HOOP_DROPS[k][1]], o: 1, color: AMBER, size: 64});
    L0.push({id: 'pi', text: 'π matches', at: [BENCH.x, 0, STRAIGHT_Z + 0.4], o: on(B.piLong, B.cutIt), color: ICE, size: 50});
    for (let j = 0; j < 3; j++) {
      const k2 = THROWS[j], a = throwAt(j);
      L0.push({id: 'th' + j, text: `this throw: ${THROW_COUNT[j]}`, at: [BENCH.x, 0, 15.5], o: on(a + 0.1, j < 2 ? throwAt(j + 1) - 0.1 : B.so - 0.35), color: AMBER, size: 64});
      void k2;
    }
    L0.push({id: 'avg', text: `1,000 throws: ${AVG_1000.toFixed(2)} on average`, at: [BENCH.x, 0, 19.5], o: avgLabel(t), color: AMBER, size: 54});
    L0.push({id: '64', text: '2 ÷ π = 64%', at: [BENCH.x, 0, ROW_Z - 5], o: sixtyFour(t), color: AMBER, size: 64});
  }
  return L0;
};

// ---------- camera keys (cut: true starts a new shot; Catmull-Rom within a shot)
type V3 = [number, number, number];
export type Key = {t: number; pos: V3; look: V3; mm: number; cut?: boolean};
export const KEYS: Key[] = [
  {t: 0, pos: [0, 70, 40], look: [0, 0, -3], mm: 35},
  {t: B.counting, pos: [0, 63, 36], look: [0, 0, -2], mm: 35},
  {t: B.each + 0.2, pos: [0, 30, 38], look: [0, 0, 19.5], mm: 35},
  {t: B.wide, pos: [0, 24, 34], look: [0, 0, 20.5], mm: 35},
  {t: B.what + 0.6, pos: [0, 34, 40], look: [0, 0, 19], mm: 35},
  {t: B.crack + 0.2, pos: [0, 60, 36], look: [0, 0, -3], mm: 35},
  {t: B.guessEnd + 0.8, pos: [7, 58, 33], look: [0.5, 0, -3], mm: 35},
  {t: B.most + 0.4, pos: [3, 60, 33], look: [0, 0, -5], mm: 35},
  {t: B.why - 0.1, pos: [0, 58, 30], look: [0, 0, -6], mm: 35},
  {t: B.bend + 0.2, pos: [BENCH.x, 32, 29], look: [BENCH.x, 0, 4], mm: 35},
  {t: B.wherever + 0.3, pos: [BENCH.x, 31, 29], look: [BENCH.x, 0, 4], mm: 35},
  {t: B.straighten, pos: [BENCH.x + 1.5, 30, 31], look: [BENCH.x + 1.5, 0, 8], mm: 35},
  {t: B.cutIt, pos: [BENCH.x, 36, 33], look: [BENCH.x, 0, 5], mm: 35},
  {t: B.so, pos: [BENCH.x + 2, 31, 33], look: [BENCH.x + 1.5, 0, 9], mm: 35},
  {t: CUT_HALL, pos: [BENCH.x + 2, 29, 33], look: [BENCH.x + 1.5, 0, 9], mm: 35},
  {t: CUT_HALL, cut: true, pos: [HALL.x, 48, HALL.z + 30], look: [HALL.x, 0, HALL.z - 2], mm: 35},
  {t: B.estimate, pos: [HALL.x, 120, HALL.z + 75], look: [HALL.x, 0, HALL.z - 4], mm: 35},
  {t: B.three14, pos: [HALL.x, 360, HALL.z + 210], look: [HALL.x, 0, HALL.z - 10], mm: 35},
  {t: DUR_S, pos: [HALL.x, 330, HALL.z + 190], look: [HALL.x, 0, HALL.z - 10], mm: 35},
];
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
export const camAt = (t: number) => {
  let s0 = 0;
  KEYS.forEach((k, i) => { if (k.cut && k.t <= t) s0 = i; });
  let s1 = KEYS.findIndex((k, i) => i > s0 && k.cut); if (s1 < 0) s1 = KEYS.length;
  const S = KEYS.slice(s0, s1);
  let i = S.findIndex((k) => k.t > t) - 1;
  if (i < 0) i = t < S[0].t ? 0 : S.length - 2;
  const a = S[Math.max(i - 1, 0)], b = S[i], c = S[i + 1] ?? S[i], d = S[Math.min(i + 2, S.length - 1)];
  const u0 = c.t > b.t ? (t - b.t) / (c.t - b.t) : 1;
  const u = smooth(u0) * 0.5 + clamp01(u0) * 0.5;
  const v = (f: (k: Key) => V3) => [0, 1, 2].map((j) => cr(f(a)[j], f(b)[j], f(c)[j], f(d)[j], u)) as V3;
  return {pos: v((k) => k.pos), look: v((k) => k.look), mm: lerp(b.mm, c.mm, clamp01(u))};
};
export const fovOf = (mm: number) => (2 * Math.atan(18 / mm) * 180) / Math.PI; // 36 mm gauge maps to the frame height
const _cam = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.5, 20000), _v = new THREE.Vector3();
export const project = (t: number, p: [number, number, number]) => {
  const c = camAt(t); _cam.fov = fovOf(c.mm); _cam.updateProjectionMatrix();
  _cam.position.set(...c.pos); _cam.lookAt(...c.look); _cam.updateMatrixWorld();
  _v.set(...p).project(_cam);
  return {x: (_v.x * 0.5 + 0.5) * 1080, y: (-_v.y * 0.5 + 0.5) * 1920, front: _v.z < 1};
};
