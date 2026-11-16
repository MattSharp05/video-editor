// Pure timing and camera: no React, no scene. Every time is a beat (src/beats.json) + an offset, so a new VO re-times
// the film. Sound reads the same beats (../sound/mix.py). One continuous camera (no cuts): keys are joined by a
// centripetal Catmull-Rom path whose progress is a monotone cubic (PCHIP) of time, so it never stops at a key;
// the map rise and dive interpolate altitude in log space.
import * as THREE from 'three';
import B from './beats.json';
import {CROSS_Z, DESERT_Z} from './world';

export {B};
export const FPS = 30;
export const TOTAL = Math.round(B.total * FPS);
export const sm = (x: number) => x * x * (3 - 2 * x);
export const ramp = (t: number, a: number, b: number) => sm(THREE.MathUtils.clamp((t - a) / (b - a), 0, 1));
export const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a - fi, a), 1 - ramp(t, b, b + fo));

// ---- choreography in world terms ----
export const LANE = -3.5;                       // robotaxi lane (US right-hand traffic, heading +z)
export const STOP_Z = CROSS_Z - 7.4;            // where the robotaxi waits
// robotaxi: glides in and stops (hook); creeps after you clear the lane (plan); drives around you at the end
export const taxiZ = (t: number) => {
  if (t < 2.6) return STOP_Z - 5.2 * (1 - t / 2.6) ** 2;
  if (t < B.drives + 0.3) return STOP_Z;
  const u = t - (B.drives + 0.3); return STOP_Z + 0.6 * u * u;  // gentle pull-away
};
export const taxiX = (t: number) => LANE + (t > B.drives + 0.3 ? 2.2 * ramp(t, B.drives + 0.3, B.drives + 2.4) : 0);
// you: wait at the kerb, cross during the plan beat; the finale replays a crossing (time has passed)
export const YOU_START = new THREE.Vector3(-8.2, 0.15, CROSS_Z - 0.4);
export const youX = (t: number) => {
  if (t < B.plans) return YOU_START.x;
  if (t < B.cracked) return Math.min(8.2, YOU_START.x + 1.35 * (t - B.plans));
  const s = B.a_car - 1.2; return t < s ? YOU_START.x : YOU_START.x + 1.35 * (t - s);
};
export const walking = (t: number) => (t >= B.plans && youX(t) < 8.2 && t < B.cracked) || (t >= B.a_car - 1.2);
// cyclist on the cross street, moving -x (lane at z = CROSS_Z + 5.5)
export const BIKE_Z = CROSS_Z + 5.5, BIKE_V = 2.6;
export const bikeX = (t: number) => 10 - BIKE_V * (t - 20);
// a car on the cross street moving +x (far lane)
export const CAR_Z = CROSS_Z + 12;
export const crossCarX = (t: number) => -60 + 9 * (t - 22);
// Tesla (consumer car, driver watching) on the next block; Tesla robotaxi further on, empty front seats
export const teslaZ = (t: number) => 58 + 2.2 * Math.max(0, t - B.tesla) + 0.5 * Math.max(0, t - B.driving) ** 2;
export const TESLA_X = LANE;
export const ROBOTESLA_Z = 150;
// lidar mix (0 = lit world, 1 = points only)
export const lidarMix = (t: number) => {
  const on = ramp(t, B.building, B.street3d + 0.2) * 0.88;
  const off = 1 - ramp(t, B.cams_only - 0.3, B.cams_only + 0.6);
  const fin = 0.55 * win(t, B.sees - 0.1, 99, 0.3, 0);
  return Math.max(on * off, fin);
};

// ---- camera ----
type K = [number, [number, number, number], [number, number, number], number];
const tz = (t: number) => taxiZ(t);
const seat = (t: number): [number, number, number] => [LANE + 0.38, 0.95, tz(t) + 0.15];
const KEYS: K[] = [
  [0.0, [LANE + 2.9, 1.75, tz(0) + 1.0], [LANE + 0.25, 1.05, tz(0) + 0.25], 32],
  [0.8, [LANE + 2.9, 1.8, tz(0.8) + 1.0], [LANE + 0.25, 1.05, tz(0.8) + 0.3], 32],
  [1.7, [LANE + 3.1, 2.2, tz(1.7) + 0.4], [LANE + 0.1, 1.25, tz(1.7) + 1.6], 28],
  [2.9, [0.9, 2.5, 0.6], [-6.6, 1.0, 10.6], 24],
  [B.y2004 + 0.55, [0.0, 1.7, 22], [0, 1.1, 70], 24],
  [B.y2004 + 1.25, [0.0, 2.2, 300], [0, 1.0, DESERT_Z], 26],
  [B.y2004 + 1.8, [5.5, 2.2, DESERT_Z - 15], [0.6, 1.3, DESERT_Z], 30],
  [B.this_year - 0.1, [8.0, 3.2, DESERT_Z - 9], [0.6, 1.4, DESERT_Z], 30],
  [B.half_million - 0.2, [120, 260, DESERT_Z + 160], [0, 0, 120], 22],
  [B.no_wheel + 0.2, [150, 430, 120], [0, 0, -180], 22],
  [B.first - 0.5, [LANE - 1.0, 9, STOP_Z - 26], [LANE, 1.2, STOP_Z + 2], 24],
  [B.first + 0.1, [1.6, 1.5, STOP_Z - 6.2], [LANE - 0.5, 1.15, STOP_Z + 3], 24],
  [B.roof - 0.1, [0.6, 2.0, STOP_Z - 2.5], [-6.0, 1.5, CROSS_Z - 1], 24],
  [B.fires - 0.1, [0.6, 3.4, STOP_Z - 4.2], [-5.4, 1.7, CROSS_Z - 1.6], 24],
  [B.times + 0.2, [1.2, 3.6, STOP_Z - 3.2], [-5.6, 1.6, CROSS_Z - 1.4], 24],
  [B.street3d + 0.2, [12, 13, STOP_Z - 14], [-3, 0.5, CROSS_Z + 3], 22],
  [B.rain + 0.2, [7, 6.5, STOP_Z - 6], [-1, 1.2, CROSS_Z + 6], 22],
  [B.signs + 0.2, [-0.6, 2.6, STOP_Z - 1.2], [-4.5, 3.8, CROSS_Z - 1.5], 22],
  [B.guesses + 0.4, [6.5, 9.5, STOP_Z - 8], [-3.5, 0.2, CROSS_Z + 5], 22],
  [B.next + 0.6, [-14, 10.5, STOP_Z - 5], [-2, 0.2, CROSS_Z + 4], 22],
  [B.again1, [-13, 8.5, STOP_Z - 9], [-1, 0.2, CROSS_Z + 5], 22],
  [B.sim - 0.2, [-8, 13, STOP_Z - 14], [-1, 0, CROSS_Z + 12], 22],
  [B.billion + 0.3, [-6, 130, -70], [0, 0, 60], 22],
  [B.tesla - 0.3, [-12, 320, -160], [0, 0, 140], 22],
  [B.cams_only - 0.2, [4.5, 7.5, teslaZ(B.cams_only) - 9], [TESLA_X, 1.2, teslaZ(B.cams_only) + 2], 22],
  [B.one_net + 0.4, [5.0, 5.2, teslaZ(B.one_net + 0.4) - 6], [TESLA_X, 2.0, teslaZ(B.one_net + 0.4) + 1], 22],
  [B.driving + 0.2, [2.2, 3.4, teslaZ(B.driving) + 1.0], [TESLA_X, 1.5, teslaZ(B.driving) + 0.4], 22],
  [B.watching - 0.4, [LANE + 3.0, 1.7, teslaZ(B.watching - 0.4) + 5.2], [LANE + 0.2, 1.1, teslaZ(B.watching - 0.4) + 0.4], 26],
  [B.robotaxis + 0.2, [LANE + 3.2, 1.9, teslaZ(B.robotaxis + 0.2) + 6], [LANE, 1.2, ROBOTESLA_Z - 10], 24],
  [B.texas + 0.6, [LANE + 3.0, 1.6, ROBOTESLA_Z - 4], [LANE + 0.3, 1.0, ROBOTESLA_Z + 0.2], 26],
  [B.cracked - 0.05, [LANE + 3.2, 1.9, ROBOTESLA_Z + 5.6], [LANE + 0.2, 0.9, ROBOTESLA_Z + 0.3], 28],
];
const pchip = (xs: number[], ys: number[]) => {
  const n = xs.length, h = xs.slice(1).map((x, i) => x - xs[i]), d = h.map((hh, i) => (ys[i + 1] - ys[i]) / hh);
  const m = xs.map((_, i) => {
    if (i === 0) return d[0]; if (i === n - 1) return d[n - 2];
    if (d[i - 1] * d[i] <= 0) return 0;
    const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; return (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
  });
  return (x: number) => {
    if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const t = (x - xs[i]) / h[i], t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1];
  };
};
const v3 = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
const posC = new THREE.CatmullRomCurve3(KEYS.map((k) => v3(k[1])), false, 'centripetal');
const lookC = new THREE.CatmullRomCurve3(KEYS.map((k) => v3(k[2])), false, 'centripetal');
const uOf = pchip(KEYS.map((k) => k[0]), KEYS.map((_, i) => i / (KEYS.length - 1)));
const mmOf = pchip(KEYS.map((k) => k[0]), KEYS.map((k) => Math.log(k[3])));

// map: rise from the Tesla robotaxi's seat to the whole US, then dive into Phoenix (our street) and the crosswalk
export const MAP_CENTER = new THREE.Vector3(1.25e6, 0, -0.62e6);
const RISE0 = B.cracked, RISE1 = B.cities - 0.25, HOLD1 = B.a_car - 0.55, DIVE1 = B.sees - 0.3;
const END_POS = new THREE.Vector3(3.8, 3.2, STOP_Z - 9.5), END_LOOK = new THREE.Vector3(-4.5, 1.0, CROSS_Z + 1);
const TOP = new THREE.Vector3(MAP_CENTER.x, 6.2e6, MAP_CENTER.z + 1.6e6);
const lerpLog = (a: THREE.Vector3, b: THREE.Vector3, k: number, la: THREE.Vector3, lb: THREE.Vector3) => {
  // altitude in log space; ground position eased so the target stays centred
  const ya = Math.log(Math.max(a.y, 1)), yb = Math.log(Math.max(b.y, 1));
  const y = Math.exp(ya + (yb - ya) * k);
  const g = THREE.MathUtils.clamp((Math.log(y) - Math.min(ya, yb)) / Math.abs(yb - ya), 0, 1);
  const kk = ya < yb ? g : 1 - g; // fraction of the way "up"
  const lo = ya < yb ? a : b, hi = ya < yb ? b : a, llo = ya < yb ? la : lb, lhi = ya < yb ? lb : la;
  void kk; const e = THREE.MathUtils.clamp((y - lo.y) / (hi.y - lo.y), 0, 1); // ground travel ∝ altitude: the street stays in frame
  const pos = new THREE.Vector3().lerpVectors(lo, hi, e); pos.y = y;
  // look straight down and a little north (like the top view); near the ground blend to the key's own look
  const down = new THREE.Vector3(pos.x, 0, pos.z - 0.26 * y);
  const w = THREE.MathUtils.clamp((y - 6) / 60, 0, 1);
  const ends = y < 1000 ? llo : lhi; void lhi;
  const look = new THREE.Vector3().lerpVectors(ends, down, w);
  return {pos, look};
};
export type Pose = {pos: THREE.Vector3; look: THREE.Vector3; mm: number; near: number; far: number};
export const camAt = (t: number): Pose => {
  if (t >= RISE0) {
    const startP = v3(KEYS[KEYS.length - 1][1]), startL = v3(KEYS[KEYS.length - 1][2]);
    if (t < RISE1) { const k = sm((t - RISE0) / (RISE1 - RISE0)); const r = lerpLog(startP, TOP, k, startL, MAP_CENTER); return {...r, mm: 30 - 6 * k, near: Math.max(0.05, r.pos.y * 0.02), far: Math.max(4000, r.pos.y * 4)}; }
    if (t < HOLD1) { const k = (t - RISE1) / (HOLD1 - RISE1); const pos = TOP.clone(); pos.y *= 1 - 0.04 * k; return {pos, look: MAP_CENTER.clone(), mm: 24, near: pos.y * 0.02, far: pos.y * 4}; }
    if (t < DIVE1) { const k = sm((t - HOLD1) / (DIVE1 - HOLD1)); const top = TOP.clone(); top.y *= 0.96; const r = lerpLog(top, END_POS, k, MAP_CENTER, END_LOOK); return {...r, mm: 24, near: Math.max(0.05, r.pos.y * 0.02), far: Math.max(4000, r.pos.y * 4)}; }
    const k = ramp(t, DIVE1, B.total); const pos = END_POS.clone().add(new THREE.Vector3(-1.2 * k, -0.6 * k, 1.6 * k)); return {pos, look: END_LOOK.clone().add(new THREE.Vector3(0.6 * k, 0.1 * k, 0)), mm: 24 + 4 * k, near: 0.2, far: 4000};
  }
  const u = uOf(t);
  const far = t > B.this_year && t < B.first ? 6000 : t > B.sim && t < B.cams_only ? 8000 : 2500;
  return {pos: posC.getPoint(u), look: lookC.getPoint(u), mm: Math.exp(mmOf(t)), near: Math.max(0.2, posC.getPoint(u).y * 0.01), far};
};
export const altitude = (t: number) => camAt(t).pos.y;
