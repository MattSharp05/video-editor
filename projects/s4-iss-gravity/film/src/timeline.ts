// Every state of the film as a pure function of time t (seconds), cued from the spoken words, so a new voiceover
// re-times the film. Units: 1 = 1 km. Earth's centre at the origin. Four hard cuts between shots (CUT_*).
import * as THREE from 'three';
import {cue, VO_END} from './lib';

export const DUR_S = VO_END + 2.2;

// ---------- colours (fixed meanings)
export const AMBER = '#FFB547', ICE = '#8CCBFF', CORAL = '#FF5A4E', GLASS = '#EAF6FF';

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const win = (t: number, a: number, b: number, f = 0.25) => ramp(t, a, a + f) * (1 - ramp(t, b - f, b));

// ---------- beats
export const B = {
  watch: cue('Watch this'), gravity: cue('How much'),
  none: cue('None?'), half: cue('Half?'), all: cue('Almost all?'), pause: cue('Pause and guess.'),
  build: cue('Build a'), km: cue('four hundred'), step: cue('and step'),
  fall: cue("You'd fall,"), fast: cue('fast.'), ninety: cue('ninety percent'),
  why: cue('So why'), falling: cue('is falling'),
  sideways: cue("It's also"), eight: cue('almost eight'),
  asit: cue('As it'), curved: cue('curved Earth'), missing: cue('keeps missing.'),
  crew: cue('The crew falls'), zero: cue('reads zero.'),
  notZero: cue('Not zero'), freeFall: cue('Free fall,'), around: cue('all the way'),
  end: VO_END,
};
export const CUT_TOWER = B.build - 0.12;   // dial -> the globe with the tower growing
export const CUT_TOP = B.step - 0.12;      // globe -> the tower top
export const CUT_GLOBE = B.why - 0.12;     // falling astronaut -> the orbit, wide
export const CUT_CREW = B.crew - 0.12;     // orbit -> back at the station (then one pull-back to the end)
export type Shot = 'station' | 'tower' | 'top' | 'globe' | 'crew';
export const shotAt = (t: number): Shot =>
  t < CUT_TOWER ? 'station' : t < CUT_TOP ? 'tower' : t < CUT_GLOBE ? 'top' : t < CUT_CREW ? 'globe' : 'crew';

// ---------- the world
export const R = 6371, H = 400, RS = R + H;
const Y = new THREE.Vector3(0, 1, 0);
const ll = (lat: number, lon: number) => {
  const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180; // globe kit convention
  return new THREE.Vector3(-Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th));
};
// the tower's base direction (over the Atlantic west of Africa), east along it (T), the orbit's normal (N)
export const UP = ll(8, -28).normalize();
export const T = new THREE.Vector3().crossVectors(Y, UP).normalize();
export const N = new THREE.Vector3().crossVectors(UP, T).normalize();
// local frame at the tower: x along track (east), y up, z cross-track
export const at = (o: THREE.Vector3, x: number, y: number, z: number) =>
  o.clone().addScaledVector(T, x).addScaledVector(UP, y).addScaledVector(N, z);
export const onOrbit = (theta: number, r = RS) => UP.clone().multiplyScalar(Math.cos(theta) * r).addScaledVector(T, Math.sin(theta) * r);
// the sun: high over the tower's longitude, a little behind the close-shot cameras so the suit is lit from the side
export const SUN = UP.clone().multiplyScalar(0.8).addScaledVector(T, -0.35).addScaledVector(N, 0.5).normalize();

// the station: fixed over the tower point at THETA_ST in the close shots (Earth slides beneath, ISS_OMEGA real rate)
export const THETA_ST = 0.06;               // ~400 km downrange of the tower (the tower isn't in the close shots)
export const ISS_POS = onOrbit(THETA_ST);
export const ISS_OMEGA = 7.67 / RS;          // rad/s
// station in the globe shots: time-compressed so it travels visibly
export const issTheta = (t: number) => {
  if (t < CUT_GLOBE) return lerp(-0.045, 0, ramp(t, CUT_TOWER + 0.3, CUT_TOP - 0.1)); // arrives over the tower top as it is finished
  if (t < CUT_CREW) return -0.1 + 0.05 * (t - CUT_GLOBE);
  return -0.6 + 0.16 * (t - CUT_GLOBE);
};
export const TOP = UP.clone().multiplyScalar(RS); // the tower top (centre of the platform)

// ---------- the tower (globe scale: a needle, exaggerated width)
export const towerH = (t: number) => (t < CUT_TOWER ? 0 : H * ramp(t, B.build + 0.05, B.km + 0.9));
export const TOWER_W = 7; // km, shown width in the globe shots (real width is not the point)

// ---------- the scale: what its display reads (0..1 of ground weight) and its gauge overlay
export const scaleRead = (t: number) => {
  if (t < CUT_TOP) return 0;
  if (t < CUT_GLOBE) return 0.9 * ramp(t, CUT_TOP + 0.15, CUT_TOP + 0.9) * (1 - ramp(t, B.fall + 0.15, B.fall + 0.35));
  return 0;
};
// beat 2 gauge: the needle's position (0..1) for the options as they are spoken, trembling in the pause
export const needle = (t: number) => {
  const base = t < B.half ? 0 : t < B.all ? 0.5 : 0.97;
  const prev = t < B.half ? 0 : t < B.all ? 0 : 0.5;
  const at0 = t < B.half ? B.none : t < B.all ? B.half : B.all;
  const k = ramp(t, at0, at0 + 0.35);
  const tremble = t > B.pause ? 0.38 * Math.sin((t - B.pause) * 2.1) : 0;
  return t < B.pause ? lerp(prev, base, k) : 0.5 + tremble * ramp(t, B.pause, B.pause + 0.4) + (0.97 - 0.5) * (1 - ramp(t, B.pause, B.pause + 0.5));
};
export const gaugeOn = (t: number) => (t >= CUT_TOWER ? 0 : ramp(t, B.none - 0.35, B.none));
// the answer: the same dial comes back on "ninety" (inset over the fall) and swings 0 -> 0.9 with a small overshoot
export const answerOn = (t: number) => (t < CUT_TOP || t >= CUT_GLOBE ? 0 : ramp(t, B.ninety - 0.35, B.ninety - 0.1));
export const answerNeedle = (t: number) => { const u = clamp01((t - (B.ninety - 0.1)) / 0.55); return 0.9 * (1 - Math.cos(u * Math.PI * 1.5) * Math.exp(-u * 3.2)) * (u > 0 ? 1 : 0); };

// ---------- the step-off and fall (tower top), metres -> km
export const STEP_T = () => B.fall + 0.05;
export const G_TOP = 0.00868; // km/s^2 (88.5 % of 9.81 m/s^2)
export const fallPos = (t: number) => {
  const s = STEP_T(); if (t < s) return {x: 0, y: 0, tilt: 0};
  const d = t - s, slide = Math.min(d, 0.35) / 0.35;
  return {x: 0.0011 * smooth(slide) + 0.0012 * Math.max(0, d - 0.35), y: -0.5 * G_TOP * Math.max(0, d - 0.2) ** 2, tilt: Math.min(1.4, d * 0.9)};
};

// ---------- the globe beat: straight-ahead path vs the real one; cannon shots from the tower top
export const pathsOn = (t: number) => win(t, B.falling - 0.4, B.sideways + 0.4, 0.4);
export const SHOTS = [3, 5, 6.5, 7.67]; // km/s, level from 400 km
export const shotStart = (i: number) => B.sideways + 0.25 + i * 0.75;
export const SHOT_DUR = [0.7, 0.8, 0.9, 0]; // seconds on screen for each landing shot
export const lapProgress = (t: number) => ramp(t, B.asit - 0.2, B.missing + 0.4); // last shot laps the globe
export const shotReadout = (t: number) => {
  let v = 0; SHOTS.forEach((s, i) => { if (t >= shotStart(i)) v = s; }); return v;
};

// ---------- crew beat: "same fall" arrows; free-fall card
export const arrowsOn = (t: number) => ramp(t, B.crew + 0.2, B.crew + 0.6) * (1 - ramp(t, B.notZero, B.notZero + 0.4));
export const pullBack = (t: number) => ramp(t, B.notZero - 0.1, B.around + 1.2);

// ---------- cameras, one function per shot (no spline runs across a cut)
export type Cam = {pos: THREE.Vector3; look: THREE.Vector3; up: THREE.Vector3; mm: number};
const lerpV = (a: THREE.Vector3, b: THREE.Vector3, k: number) => a.clone().lerp(b, k);
// astronaut place in the close shots (station shots), ahead of the station along -T, a little below it
export const ASTRO = at(ISS_POS, -0.052, -0.006, 0.006); // ~14 m beyond the station's forward end, a little below
export const SCALE_ST = at(ASTRO, 0, -0.0013, 0);
// tower top: platform centre TOP; scale near the +T edge
export const SCALE_TOP = at(TOP, 0.0019, 0.00006, 0);
export const camAt = (t: number): Cam => {
  const s = shotAt(t);
  if (s === 'station') {
    const k = ramp(t, B.none - 0.6, B.none + 0.3), orb = 0.12 * t; // slow orbit, then push to the scale
    const far = at(ASTRO, -6.2e-3 * Math.cos(orb * 0.2), 1.8e-3, 2.4e-3 + 1e-3 * Math.sin(orb * 0.3));
    const near = at(SCALE_ST, -1.9e-3, 0.5e-3, 0.7e-3 + 0.1e-3 * (t - B.none));
    return {pos: lerpV(far, near, k), look: lerpV(at(ASTRO, 0, -0.3e-3, 0), SCALE_ST, k), up: UP.clone(), mm: lerp(35, 50, k)};
  }
  if (s === 'tower') {
    const u = (t - CUT_TOWER) / (CUT_TOP - CUT_TOWER);
    const base = UP.clone().multiplyScalar(R);
    return {pos: at(base, -260 + 80 * u, 250, -2300 + 150 * u), look: at(base, 0, 215, 0), up: UP.clone(), mm: 85};
  }
  if (s === 'top') {
    const f = fallPos(t), k = ramp(t, STEP_T(), STEP_T() + 2.2);
    // the camera drops with him (a little behind), so the tower's rings stream past: the speed shows
    // the camera stays up top and tilts down after him: he shrinks down the tower's side (the fall must read as a fall)
    const u = t - CUT_TOP, fy = Math.max(f.y, -0.09);
    const subj = at(SCALE_TOP, f.x * 0.8, 0.0006 + fy * 0.92, 0);
    return {pos: at(TOP, -0.0016 + 0.00012 * u + 0.004 * k, 0.0017 + 0.002 * k, 0.0078 + 0.0002 * u + 0.002 * k), look: subj, up: UP.clone(), mm: lerp(35, 40, k)};
  }
  if (s === 'globe') {
    // beats 5-6 close on the tower's side of the globe; beat 7 pulls out to the whole planet for the lap
    const k = ramp(t, B.asit - 0.3, B.curved + 0.6);
    const mid = onOrbit(0.27, R - 250); // centre of the shots' arcs (0 to 33 deg downrange)
    const near = {pos: mid.clone().addScaledVector(N, -11500).addScaledVector(T, 60 * (t - CUT_GLOBE)), look: mid};
    const fd = N.clone().multiplyScalar(-0.55).addScaledVector(T, -0.83).addScaledVector(UP, 0.12).normalize();
    const far = {pos: fd.multiplyScalar(36000), look: UP.clone().multiplyScalar(300)};
    const d0 = near.pos.length(), d1 = far.pos.length(), d = Math.exp(lerp(Math.log(d0), Math.log(d1), k));
    const dir = lerpV(near.pos.clone().normalize(), far.pos.clone().normalize(), k).normalize();
    return {pos: dir.multiplyScalar(d), look: lerpV(near.look, far.look, k), up: UP.clone(), mm: 50};
  }
  // crew: the other side of the astronaut, then one pull-back to the whole orbit
  const k = pullBack(t);
  const close = at(ASTRO, -5.6e-3, 1.0e-3, -3.4e-3 - 2e-4 * (t - CUT_CREW)); // station behind him again, seen from his other side
  const lookC = at(ASTRO, 0, -0.25e-3, 0);
  const farDir = UP.clone().multiplyScalar(0.45).addScaledVector(N, -0.89).addScaledVector(T, 0.1).normalize();
  const dC = close.distanceTo(lookC), dF = 42000;
  const d = Math.exp(lerp(Math.log(dC), Math.log(dF), Math.pow(k, 1.15)));
  const dirC = close.clone().sub(lookC).normalize();
  const dir = lerpV(dirC, farDir, smooth(k)).normalize();
  // keep the crew and the station centred while the camera backs away; only then swing to the planet
  const look = lerpV(lookC, new THREE.Vector3(0, 0, 0).addScaledVector(UP, 1500), ramp(k, 0.45, 0.95));
  return {pos: look.clone().addScaledVector(dir, d), look, up: UP.clone(), mm: lerp(35, 50, k)};
};
