// How a suspension bridge stays up: every time comes from the words (lib.ts cue()), so a new VO re-times the film.
// One world: a red-orange suspension bridge (Golden Gate proportions, a stand-in) over a strait at golden hour.
// Hard cuts between camera set-ups on the words (motion-principles "Hard cuts are allowed").
// Colour language (one meaning for the whole film): CYAN = tension (the pull up the hangers, along the main cables,
// back to the anchors; also the wires that carry it); AMBER = compression (the push down the towers).
import {cue, cueEnd, VO_END, clamp} from './lib';
import {interpolate, Easing} from 'remotion';

export const DUR_S = VO_END + 1.4;
export const CYAN = '#38E0FF', AMBER = '#FFB020', ORANGE = '#C0362C', WHITE = '#FFFFFF', RED = '#FF4433';

// ---------- bridge geometry (metres; x along the bridge, y up from the water, z across; camera mostly on +z)
export const HALF = 640;          // half the main span (Golden Gate main span 1,280 m)
export const SIDE = 343;          // side spans
export const ANCH_X = HALF + SIDE; // anchorages
export const TOWER_H = 227;       // tower top above the water
export const DECK_Y = 67;         // road height
export const CAB_LOW = 74;        // main cable low point at mid-span
export const CAB_Z = 13.7;        // the two main cables, one each side of the road
export const HANG_DX = 15.2;      // hanger spacing (50 ft)
export const CAB_R = 0.46;        // main cable radius (92 cm across)
// main cable height at x
export const cableY = (x: number) => {
  const a = Math.abs(x);
  if (a <= HALF) return CAB_LOW + (TOWER_H - CAB_LOW) * (a / HALF) ** 2;
  const k = Math.min(1, (a - HALF) / SIDE);
  return TOWER_H + (DECK_Y + 6 - TOWER_H) * k - 14 * Math.sin(Math.PI * k);
};

const T = {
  flat: cue('A flat road'),
  sag: cue('sag and break.'),
  brk: cue('break.'),
  so: cue('So the road'),
  hangs: cue('It hangs.'),
  rows: cue('Rows of'),
  they: cue('They hang'),
  two: cue('two huge'),
  steel: cue('Steel cable'),
  pull: cue('pull it.'),
  tension: cue('That pull is tension.'),
  run: cue('The main cables run'),
  over: cue('over two'),
  towers: cue('The towers get'),
  down: cue('straight down.'),
  comp: cue('That push is compression.'),
  each: cue('At each end,'),
  anchors: cue('concrete anchors'),
  back: cue('hold the cables back.'),
  gg: cue('Each Golden Gate'),
  num: cue('27,572'),
  wires: cue('steel wires.'),
  rHang: cue('The road hangs,'),
  rPull: cue('the cables pull,'),
  rPush: cue('the towers push,'),
  rHold: cue('the anchors hold'),
  why: cue("That's why"),
  end: cueEnd("That's why it doesn't snap."),
};
export {T as BEATS};
const pre = 0.08;
export type Shot = 'hook' | 'sag' | 'hangs' | 'hangers' | 'main' | 'tension' | 'towers' | 'compress' | 'anchors' | 'wires' | 'recap';
export const CUT = {
  sag: T.flat - pre, hangs: T.so - pre, hangers: T.rows - pre, main: T.they - pre, tension: T.steel - pre,
  towers: T.run - pre, compress: T.towers - pre, anchors: T.each - pre, wires: T.gg - pre, recap: T.rHang - pre,
};
const SHOTS: [number, Shot][] = [[CUT.sag, 'hook'], [CUT.hangs, 'sag'], [CUT.hangers, 'hangs'], [CUT.main, 'hangers'], [CUT.tension, 'main'],
  [CUT.towers, 'tension'], [CUT.compress, 'towers'], [CUT.anchors, 'compress'], [CUT.wires, 'anchors'], [CUT.recap, 'wires'], [1e9, 'recap']];
export const shotAt = (t: number): Shot => SHOTS.find(([c]) => t < c)![1];
export const shotStart = (s: Shot) => (s === 'hook' ? 0 : CUT[s]);
export const shotEnd = (s: Shot) => { const i = SHOTS.findIndex(([, n]) => n === s); return Math.min(SHOTS[i][0], DUR_S); };

export const io = Easing.bezier(0.45, 0, 0.55, 1);
export const lin = (x: number) => x;
export const ramp = (t: number, a: number, b: number, e = io) => interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
export const fade = (t: number, a: number, inD: number, b: number, outD: number) => Math.min(ramp(t, a, a + inD), 1 - ramp(t, b - outD, b));

// ---------- cameras
export type Cam = {pos: [number, number, number]; look: [number, number, number]; fov: number};
const mix3 = (a: number[], b: number[], k: number) => a.map((x, i) => x + (b[i] - x) * k) as [number, number, number];
export const camLerp = (a: Cam, b: Cam, k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: a.fov + (b.fov - a.fov) * k});
// a move from a to b over the shot, eased (gentle start, gentle stop)
const move = (t: number, s: Shot, a: Cam, b: Cam, e = Easing.bezier(0.33, 0, 0.3, 1)) => camLerp(a, b, ramp(t, shotStart(s), shotEnd(s) + 0.3, e));

export const camAt = (t: number): Cam => {
  const s = shotAt(t);
  switch (s) {
    // hook: low and fast along the span toward the near tower, the whole bridge sweeping past
    case 'hook': return move(t, s, {pos: [-120, 95, 150], look: [-640, 140, -10], fov: 50}, {pos: [-330, 105, 95], look: [-700, 150, -20], fov: 50}, lin);
    // sag: side-on view of the whole main span from the water
    case 'sag': return move(t, s, {pos: [-1850, 680, 340], look: [-150, 60, 0], fov: 50}, {pos: [-1700, 600, 320], look: [-150, 40, 0], fov: 50});
    case 'hangs': return move(t, s, {pos: [-1700, 600, 320], look: [-150, 50, 0], fov: 50}, {pos: [-1450, 470, 300], look: [-250, 90, 0], fov: 50});
    // hangers: close on the deck edge, a car passing; hangers rise out of frame
    case 'hangers': return move(t, s, {pos: [-268, 73.5, 30], look: [-305, 74, 8], fov: 50}, {pos: [-276, 73.5, 30], look: [-312, 76, 8], fov: 50});
    // main: crane up the hangers to the main cable, both cables in view
    case 'main': return move(t, s, {pos: [-276, 73.5, 30], look: [-312, 78, 8], fov: 50}, {pos: [-220, 150, 120], look: [-340, 100, 0], fov: 50});
    // tension: the sweep of the main span toward the tower, arrows racing to the top
    case 'tension': return move(t, s, {pos: [-120, 140, 230], look: [-520, 150, 0], fov: 52}, {pos: [-300, 175, 250], look: [-640, 200, 0], fov: 50});
    // towers: at the tower top, the cable riding over the saddle
    case 'towers': return move(t, s, {pos: [-585, 245, 95], look: [-640, 222, 6], fov: 46}, {pos: [-570, 238, 110], look: [-640, 215, 0], fov: 48});
    // compress: tilt and crane down the tower to the water
    case 'compress': return move(t, s, {pos: [-520, 230, 210], look: [-640, 180, 0], fov: 50}, {pos: [-470, 60, 300], look: [-640, 90, 0], fov: 54});
    // anchors: the side span diving into the concrete anchorage on the shore
    case 'anchors': return move(t, s, {pos: [-820, 120, 170], look: [-960, 85, 0], fov: 50}, {pos: [-880, 100, 120], look: [-985, 78, 0], fov: 50});
    // wires: dive into the cut end of a piece of main cable
    case 'wires': {
      const k = ramp(t, shotStart(s), T.wires + 0.2, Easing.bezier(0.4, 0, 0.2, 1));
      const c = WIRE_AT, n = WIRE_N;
      const far: Cam = {pos: [c[0] + n[0] * 9 + 3, c[1] + 2.2, c[2] + n[2] * 9 + 2], look: c, fov: 44};
      const near: Cam = {pos: [c[0] + n[0] * 2.4, c[1] + 0.05, c[2] + n[2] * 2.4], look: [c[0], c[1] - 0.15, c[2]], fov: 44};
      const c2 = camLerp(far, near, k); const d = ramp(t, T.num, shotEnd(s), lin) * 0.5; c2.pos = [c2.pos[0] + d * 0.25, c2.pos[1] + d * 0.3, c2.pos[2] - d * 0.6]; return c2;
    }
    // recap: the whole bridge, slowly pulling back
    case 'recap': return move(t, s, {pos: [-1150, 330, 520], look: [-520, 120, 0], fov: 50}, {pos: [-2100, 850, 420], look: [-150, 60, 0], fov: 48}, Easing.bezier(0.45, 0, 0.35, 1));
  }
};

// ---------- the floating cable piece for the wires shot (beside the main cable at x = WIRE_X)
export const WIRE_X = -230;
// its end face centre and the unit direction it faces (toward the camera side, +z, a little toward -x)
export const WIRE_N: [number, number, number] = [0.42, 0, 0.907];
export const WIRE_AT: [number, number, number] = [WIRE_X, cableY(WIRE_X) - 2, CAB_Z + 12];

// ---------- states
// sag shot: towers, cables and hangers fade out, the bare road sags then breaks
export const support = (t: number) => {
  const s = shotAt(t);
  if (s === 'hook') return 1;
  if (s === 'sag') return 1 - ramp(t, CUT.sag + 0.1, T.flat + 1.0);
  if (s === 'hangs') return ramp(t, T.so + 0.3, T.hangs + 0.1);
  return 1;
};
export const sagK = (t: number) => {   // 0..1 sag amount
  const s = shotAt(t);
  if (s === 'sag') return ramp(t, T.flat + 0.8, T.brk + 0.1, Easing.bezier(0.5, 0, 0.8, 0.6));
  if (s === 'hangs') return 1 - ramp(t, CUT.hangs, T.so + 0.6);
  return 0;
};
export const breakK = (t: number) => {  // 0..1 the crack opening at mid-span
  const s = shotAt(t);
  if (s === 'sag') return ramp(t, T.brk, T.brk + 0.6, Easing.bezier(0.6, 0, 0.9, 0.5));
  if (s === 'hangs') return 1 - ramp(t, CUT.hangs, T.so + 0.4);
  return 0;
};
// hangers dropping from the cable (hangs shot): 0..1 length grown downward, staggered from the towers inward
export const hangerDrop = (t: number, x: number) => {
  if (shotAt(t) !== 'hangs') return 1;
  const d = 1 - Math.min(1, Math.abs(Math.abs(x) - HALF) / HALF);
  const a = T.hangs - 0.6 + (1 - d) * 0.5;
  return ramp(t, a, a + 0.45);
};
// the car (hangers shot): x along the near lane
export const carX = (t: number) => -335 + 12 * (t - CUT.hangers);

// glow amounts per frame: hangers, main span cables, side span (to the anchors), towers, anchors
export type Glow = {hang: number; main: number; side: number; tower: number; anchor: number; focusX: number; focusW: number};
export const glow = (t: number): Glow => {
  const s = shotAt(t), g: Glow = {hang: 0, main: 0, side: 0, tower: 0, anchor: 0, focusX: 0, focusW: 1e5};
  if (s === 'hangers') { g.hang = ramp(t, T.rows + 0.5, T.rows + 1.0); g.focusX = carX(t); g.focusW = 40; }
  if (s === 'main') { g.hang = 1; g.main = ramp(t, T.two, T.two + 0.6) * 0.6; g.focusX = carX(t); g.focusW = 80 + 400 * ramp(t, CUT.main, CUT.tension); }
  if (s === 'tension') { g.hang = 1; g.main = ramp(t, CUT.tension, T.steel + 0.5); g.side = ramp(t, T.tension, T.tension + 0.6); }
  if (s === 'towers') { g.hang = 0.5; g.main = 1; g.side = 0.8; }
  if (s === 'compress') { g.hang = 0.35; g.main = 0.6; g.side = 0.5; g.tower = ramp(t, T.towers + 0.4, T.towers + 1.0); }
  if (s === 'anchors') { g.main = 0.4; g.side = 1; g.tower = 0.4; g.anchor = ramp(t, T.anchors, T.back + 0.2); }
  if (s === 'recap') {
    g.hang = ramp(t, T.rHang, T.rHang + 0.5); g.main = ramp(t, T.rPull, T.rPull + 0.5); g.side = ramp(t, T.rPull + 0.3, T.rPull + 0.8);
    g.tower = ramp(t, T.rPush, T.rPush + 0.5); g.anchor = ramp(t, T.rHold, T.rHold + 0.5);
  }
  return g;
};
// wires: the piece slides out of the main cable, then the wire ends light up from the centre outward
export const wireOut = (t: number) => (shotAt(t) === 'wires' ? ramp(t, CUT.wires, CUT.wires + 0.9) : 0);
export const wireLit = (t: number) => (shotAt(t) === 'wires' ? ramp(t, T.num - 0.1, T.wires + 0.3, Easing.bezier(0.3, 0, 0.6, 1)) : 0);

// card timings
export const hookCard = (t: number) => (t < CUT.sag ? 1 : 0);
