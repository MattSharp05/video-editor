// Everything time-dependent, from beats.json: the camera, the shader's state, and which world we are in.
import {Easing, interpolate} from 'remotion';
import B from './beats.json';
import {DT} from './shader';

export const FPS = 30;
export const W = 1080, H = 1920;
export const CX = 540, CY = 960;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const io = Easing.bezier(0.45, 0, 0.55, 1);
export const out = Easing.bezier(0.2, 0.8, 0.2, 1);
export const ramp = (t: number, a: number, b: number, e = io) => interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const win = (t: number, a: number, b: number, f = 0.25) => Math.min(ramp(t, a, a + f), 1 - ramp(t, b - f, b));

// ---- the puck grid (same maths as the shader) ----
export const cellOf = (x: number, y: number) => {
  const z = Math.sqrt(Math.max(0, 1 - x * x - y * y));
  const lat = Math.asin(y), lon = Math.atan2(x, z);
  const cj = Math.floor(lat / DT), latc = (cj + 0.5) * DT;
  return [Math.floor((lon * Math.cos(latc)) / DT), cj];
};
export const cellCentre = (ci: number, cj: number): [number, number] => {
  const latc = (cj + 0.5) * DT, cl = Math.cos(latc), lonc = ((ci + 0.5) * DT) / cl;
  return [cl * Math.sin(lonc), Math.sin(latc)];
};
// our puck: on the yellow just above the emoji's grin, lower right
export const OUR = cellOf(0.255, -0.318);
export const OURP = cellCentre(OUR[0], OUR[1]);
export const NEXTP = cellCentre(OUR[0] + 1, OUR[1]);
export const pitchR = (pitch: number) => pitch / DT;   // R (px per sphere radius) for a puck pitch in px

// ---- camera: keys of (time, focus point, focus screen offset px (y up), R) ----
type Key = {t: number; f: [number, number]; s: [number, number]; R: number; e?: (x: number) => number};
const O = OURP;
const GAP: [number, number] = [(OURP[0] + NEXTP[0]) / 2, OURP[1] + DT * 0.5];   // the gap beside our puck (on the rail)
const PUPIL: [number, number] = [0, 0];
const TOP: [number, number] = [0.02, 0.5];   // out through the upper lid (face-on pucks)
const WIDE_R = 330, WIDE_S: [number, number] = [0, -70];   // sphere centre 70 px below frame centre
const WIDE_F: [number, number] = [0, 0];
const KEYS: Key[] = [
  {t: 0, f: WIDE_F, s: [0, -70], R: 300},
  {t: B.l1 - 0.6, f: WIDE_F, s: WIDE_S, R: WIDE_R},
  // line 2: push into the smile, the picture breaks into dots
  {t: B.gaps + 1.2, f: O, s: [0, -40], R: pitchR(150), e: Easing.bezier(0.55, 0, 0.25, 1)},
  {t: B.l2 + 0.3, f: O, s: [0, -40], R: pitchR(175)},
  // line 3: slapshot, then the wave lights the field while we rise
  {t: B.pucks + 0.4, f: O, s: [0, -40], R: pitchR(190)},
  {t: B.l3 - 0.3, f: O, s: [0, 60], R: pitchR(9)},
  // line 4: back in on our puck and its neighbour (rails, tape), then into its face
  {t: B.frame + 0.5, f: [(O[0] + NEXTP[0]) / 2, O[1]], s: [0, 0], R: pitchR(300)},
  {t: B.fortyeight - 0.4, f: [(O[0] + NEXTP[0]) / 2, O[1]], s: [-170, 30], R: pitchR(340)},   // slide along the rail
  {t: B.fortyeight + 0.5, f: O, s: [0, 0], R: pitchR(1150)},
  {t: B.l4 + 0.2, f: O, s: [0, 0], R: pitchR(1250)},
  // line 5: ease back to a patch of pucks
  {t: B.l5 - 0.6, f: O, s: [0, 0], R: pitchR(80)},
  // line 6: dive into the gap (backstage happens in its own world), come back out on the patch
  {t: B.l5 + 0.55, f: GAP, s: [0, 0], R: pitchR(4000), e: Easing.bezier(0.6, 0, 0.9, 0.6)},
  {t: B.manytimes + 0.55, f: O, s: [0, 0], R: pitchR(260)},
  {t: B.l6 + 0.2, f: O, s: [0, 0], R: pitchR(85), e: out},
  // line 7: the long pull-back
  {t: B.faraway - 0.2, f: O, s: [0, 0], R: pitchR(30)},
  {t: B.l7 - 0.2, f: PUPIL, s: WIDE_S, R: 340, e: Easing.bezier(0.5, 0, 0.3, 1)},
  // line 8: in to where the rows can just be read
  {t: B.blink - 0.3, f: PUPIL, s: [0, 0], R: pitchR(6.5)},
  {t: B.l8 - 0.1, f: PUPIL, s: [0, 0], R: pitchR(7.5)},
  // line 9: through the pupil (then the interior world)
  {t: B.l8 + 0.95, f: [0.004, 0.002], s: [0, 0], R: pitchR(5000), e: Easing.bezier(0.7, 0, 0.95, 0.5)},
  // line 10: (interior) ... then out of the top of the ball, pulling back to the city
  {t: B.l9 + 0.6, f: TOP, s: [0, 0], R: pitchR(260)},
  {t: B.l9 + 1.9, f: TOP, s: [9, -70], R: 460, e: Easing.bezier(0.3, 0, 0.3, 1)},
  {t: B.total, f: WIDE_F, s: [0, -20], R: 250},
];
export type Cam = {X: number; Y: number; R: number};
const camOfKey = (k: Key): Cam => ({X: k.f[0] - k.s[0] / k.R, Y: k.f[1] - k.s[1] / k.R, R: k.R});
export const camAt = (t: number): Cam => {
  let i = KEYS.findIndex((k, n) => n === KEYS.length - 1 || KEYS[n + 1].t > t);
  if (i >= KEYS.length - 1) i = KEYS.length - 2;
  const a = KEYS[i], b = KEYS[i + 1];
  const ca = camOfKey(a);
  const sa = [(b.f[0] - ca.X) * ca.R, (b.f[1] - ca.Y) * ca.R];
  const u = interpolate(t, [a.t, b.t], [0, 1], {...clamp, easing: b.e ?? io});
  const R = Math.exp(lerp(Math.log(a.R), Math.log(b.R), u));
  const s = [lerp(sa[0], b.s[0], u), lerp(sa[1], b.s[1], u)];
  return {X: b.f[0] - s[0] / R, Y: b.f[1] - s[1] / R, R};
};
// world -> screen px
export const toScreen = (c: Cam, x: number, y: number): [number, number] => [CX + (x - c.X) * c.R, CY - (y - c.Y) * c.R];

// ---- worlds: outside (ball), backstage (line 6), interior (line 9) ----
export const BACK = {in: B.l5 + 0.5, out: B.manytimes + 0.05};
export const INTERIOR = {in: B.l8 + 0.9, out: B.l9 + 0.6};
export const worldAt = (t: number) => (t >= BACK.in && t < BACK.out ? 'back' : t >= INTERIOR.in && t < INTERIOR.out ? 'interior' : 'out');

// ---- shader state ----
export const shaderState = (t: number) => {
  const morph = ramp(t, 0.9, B.tv + 0.2, Easing.bezier(0.5, -0.05, 0.4, 1.25));
  const missing = t < B.pucks - 0.12 ? ramp(t, B.gaps + 1.25, B.gaps + 1.5) : 0;
  const hit = B.pucks - 0.12;   // the slapshot puck lands
  const ourLit = t < hit ? 1 - missing : ramp(t, hit, hit + 0.12);
  const fieldLit = t < B.gaps + 1.3 ? 1 : t < hit + 0.3 ? 1 - ramp(t, B.gaps + 1.3, B.gaps + 1.9) * 0.97 + 0 : 1 - 0.97 * (1 - ramp(t, B.l3 - 0.2, B.l3 + 0.3));
  const waveR = t < hit + 0.25 ? 0 : Math.pow(ramp(t, hit + 0.25, B.l3 - 0.2, Easing.bezier(0.4, 0, 0.8, 1)), 2.2) * 2500;
  const ledOn = win(t, B.fortyeight - 0.3, B.l4 + 0.9, 0.3);
  const led = interpolate(t, [B.fortyeight + 0.2, B.fortyeight + 1.4], [0, 48], {...clamp, easing: Easing.bezier(0.3, 0, 0.6, 1)});
  const glowBlur = ramp(t, B.l4 - 0.05, B.l4 + 0.5);
  const reelT = t >= B.l4 + 0.25 && t < B.l5 + 0.4 ? t - (B.l4 + 0.25) : -1;
  const reelLand = B.colors + 0.2 - (B.l4 + 0.25);
  // the pulses repaint the patch into the eye, outward from our puck, faster and faster
  const repaint = t < B.manytimes + 0.2 ? 0 : 3 + Math.pow(ramp(t, B.manytimes + 0.2, B.faraway + 0.8, Easing.linear), 2.4) * 2500;
  const strobe = win(t, B.manytimes + 0.1, B.l6 + 0.4, 0.2) * 0;
  const gap = t < B.l9 ? ramp(t, B.l8 + 0.35, B.l8 + 0.9) : 1 - ramp(t, B.l9 + 0.6, B.l9 + 1.3);
  const gapCol = t < B.l9 ? [1.0, 0.72, 0.42] : [0.16, 0.12, 0.3];
  const ourGlow = win(t, B.gaps + 0.2, B.l6 + 0.8, 0.5) * (1 - 0.7 * ledOn);
  const tvScale = lerp(0.82, 1, morph);
  const frame = win(t, B.frame - 0.1, B.apart + 0.2, 0.3);   // the steel rails catch the light while the line names them
  const twinkle = win(t, B.frame + 0.3, B.fortyeight - 0.1, 0.4);
  return {morph, missing, ourLit, fieldLit, waveR, ledOn, led, glowBlur, reelT, reelLand, repaint, strobe, gap, gapCol, ourGlow, tvScale, twinkle, frame};
};

// ---- the eye's acting ----
export const eyeAt = (t: number) => {
  let gx = 0, gy = 0, lid = 0, dil = 1;
  // wakes up during the pull-back: looks left, right
  gx = interpolate(t, [B.l7 - 0.6, B.l7 - 0.1, B.eyeball, B.eyeball + 0.35, B.blink - 0.25, B.blink - 0.05], [0.15, -0.8, -0.8, 0.8, 0.8, 0], clamp);
  gy = interpolate(t, [B.l7 - 0.6, B.l7, B.blink - 0.2], [0, -0.2, 0], clamp);
  // the blink (row by row on the pucks), then a quick second blink (the wink)
  lid = Math.max(win(t, B.blink, B.blink + 0.7, 0.25), 0.9 * win(t, B.whole + 0.5, B.whole + 0.85, 0.15));
  // pupil opens into a doorway
  dil = interpolate(t, [B.l8 - 0.4, B.l8 + 0.5], [1, 2.6], {...clamp, easing: io});
  // line 10: glances up at the antenna, blinks it off
  if (t > B.l9) {
    gx = interpolate(t, [B.l9 + 1.4, B.l9 + 1.9, B.l9 + 3.6, B.l9 + 4.1], [0, 0.05, 0.05, 0], clamp);
    gy = interpolate(t, [B.l9 + 1.4, B.l9 + 1.9, B.l9 + 3.6, B.l9 + 4.1], [0, 1, 1, 0], clamp);
    lid = win(t, B.l9 + 2.35, B.l9 + 2.8, 0.2);
    dil = interpolate(t, [B.l9 + 0.5, B.l9 + 1.5], [1.6, 1], clamp);
  }
  return {gx, gy, lid, dil};
};
// the emoji acts once it is a ball: grins wider, glances up at its antenna, back
export const emojiAt = (t: number) => ({
  grin: interpolate(t, [0, 2.6, 3.2, 4.4], [1, 1, 1.7, 1.35], {...clamp, easing: io}),
  look: interpolate(t, [3.0, 3.35, 3.95, 4.35], [0, 1, 1, 0], {...clamp, easing: io}),
});
export const ANTENNA_POP = B.l9 + 2.6;
