// Every state of the film as a pure function of time t (seconds), cued from the spoken words, so a new voiceover
// re-times the film. Units: metres. The motel's rooms run along -z: room n's door at z = doorZ(n), in the wall x = 0,
// facing +x. Walkway x 0..1.9, road x 5..11 (the bus at x 6.5..9.1), the sign by the road near room 1.
import * as THREE from 'three';
import {cue, cueEnd, VO_END} from './lib';

export const DUR_S = VO_END + 2.0;
export const AMBER = '#FFB547', BLUE = '#7CC4FF', WARM = '#FFD9A0', NEON = '#FF4F6A';

// ---------- small maths
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const fract = (x: number) => x - Math.floor(x);
export const hash = (i: number, k = 0) => fract(Math.sin(i * 127.1 + k * 311.7) * 43758.5453);

// ---------- beats (from the words)
export const B = {
  hook: cue('This hotel is full,'), forYou: cue('room for you.'), endless: cue('It has endless'), taken: cueEnd('every room is taken.'),
  guest: cue('A new guest'), where: cue('Where do they go?'), easy: cue('Easy.'), moves: cue('Everyone moves to the next'), nextEnd: cueEnd('the next room.'),
  free: cue('Room one is free'), takes: cue('The new guest takes'), bus: cue('Now an endless bus'), pulls: cue('pulls up,'),
  double: cue('Everyone moves to double'), oneTwo: cue('One goes to two,'), sixEnd: cueEnd('three to six.'),
  odd: cue('Now every odd'), fits: cue('the whole bus fits.'), crowd: cue('So can every'), no: cue('No.', 0),
  lastBus: cue('One last bus:'), between: cue('every number between'), give: cue('Give each a room.'),
  build: cue('Build a new number.'), first: cue("Change room one's"), second: cue("room two's second,"), forever: cue('and so on forever.'),
  differs: cue('It differs from'), digit: cueEnd('at least one digit.'), noRoom: cue('So it has no room.'),
  however: cue('However you fill'), leftOut: cue('some numbers are left out.'), bigger: cue('Some infinities are'),
  end: VO_END,
};

// ---------- the motel
export const PITCH = 3.2, NR = 400, NB = 220, NUM_N = 40;
export const doorZ = (n: number) => -PITCH * (n - 1);
export const STAND_X = 0.95; // where a guest stands, in front of its door
export const BOARD_X = 1.2; // where a number board stands
export const SIGN = {x: 3.6, z: 4.2};
export const BUS_X = 7.8, BUS_STOP_Z = 2.4;
export const BUS_SEAT_Z = (j: number) => 0.8 - 0.8 * (j - 1); // passenger j's seat (j = 1..)

// a wave down the row: room r starts a little after room 1; far rooms catch up, so the ripple reaches the horizon
export const waveDelay = (r: number, span: number) => span * Math.log(Math.max(1, r)) / Math.log(NR);
export const MOVE_D = 1.25;
const M1 = () => B.moves + 0.35, M2 = () => B.double + 0.45, FILL = () => B.fits - 1.0, OUT = () => B.no + 0.35;
export const NEW_ARRIVE = () => B.takes + 0.85; // the newcomer reaches room 1

// ---------- guests: residents 1..NR, the newcomer, the bus's NB passengers. Each is a list of moves.
export type Kind = 0 | 1 | 2; // resident / newcomer / bus
type Stop = {t: number; dur: number; to: [number, number]; arc: number}; // be at `to` (x, z) by t+dur
export type Guest = {kind: Kind; start: [number, number]; appear: number; stops: Stop[]; out: number};
const at = (room: number): [number, number] => [STAND_X, doorZ(room)];
export const GUESTS: Guest[] = (() => {
  const g: Guest[] = [];
  for (let i = 1; i <= NR; i++) g.push({kind: 0, start: at(i), appear: -1, out: OUT() + waveDelay(2 * i + 2, 0.9), stops: [
    {t: M1() + waveDelay(i, 0.9), dur: MOVE_D, to: at(i + 1), arc: 0.9},
    {t: M2() + waveDelay(i + 1, 0.9), dur: MOVE_D + 0.35, to: at(2 * (i + 1)), arc: 0.8 + 0.12 * PITCH * (i + 1)},
  ]});
  // the newcomer walks up the road under the sign, waits, walks to room 1, then doubles to room 2
  g.push({kind: 1, start: [7.2, 30], appear: -1, out: OUT() + waveDelay(2, 0.9), stops: [
    {t: B.guest - 0.6, dur: 2.6, to: [4.4, 3.2], arc: 0},
    {t: B.takes + 0.05, dur: 0.8, to: at(1), arc: 0},
    {t: M2(), dur: MOVE_D + 0.35, to: at(2), arc: 1.2},
  ]});
  for (let j = 1; j <= NB; j++) g.push({kind: 2, start: [BUS_X, BUS_SEAT_Z(j)], appear: FILL() + waveDelay(2 * j - 1, 0.8), out: OUT() + waveDelay(2 * j - 1, 0.9), stops: [
    {t: FILL() + waveDelay(2 * j - 1, 0.8), dur: MOVE_D, to: at(2 * j - 1), arc: 1.0 + 0.05 * Math.abs(doorZ(2 * j - 1) - BUS_SEAT_Z(j))},
  ]});
  return g;
})();
export const CHECKOUT_D = 0.9;

// a guest's place at t: position, how much it is travelling (0..1), visibility (0..1)
export const guestAt = (gu: Guest, t: number) => {
  let from = gu.start, x = from[0], y = 0, z = from[1], moving = 0, settled = true;
  for (const s of gu.stops) {
    if (t < s.t) break;
    const u = (t - s.t) / s.dur;
    if (u < 1) {
      const k = smooth(u); x = lerp(from[0], s.to[0], k); z = lerp(from[1], s.to[1], k);
      y = s.arc > 0 ? s.arc * Math.sin(Math.PI * k) : 0.04 * Math.abs(Math.sin(u * s.dur * 9));
      moving = s.arc > 0 ? Math.sin(Math.PI * u) : 0; settled = false; break;
    }
    from = s.to; x = from[0]; z = from[1];
  }
  // checkout: rise and fade
  const co = clamp01((t - gu.out) / CHECKOUT_D);
  y += 2.5 * co * co;
  const vis = (t >= gu.appear ? 1 : 0) * (1 - co);
  return {x, y, z, moving: Math.max(moving, co > 0 && co < 1 ? 0.6 : 0), vis, settled: settled && co === 0};
};
// the room a settled guest stands at (or -1)
export const roomOf = (x: number, z: number) => (Math.abs(x - STAND_X) < 0.05 ? Math.round(-z / PITCH) + 1 : -1);

// ---------- the bus: slides up out of the fog to room 1; its body never ends. Trip 1 = guests (blue), trip 2 = numbers.
export const busFront = (t: number) => {
  const F = -260;
  const arrive = (a: number, b: number) => lerp(F, BUS_STOP_Z, 1 - Math.pow(1 - clamp01((t - a) / (b - a)), 3));
  const leave = (a: number, b: number) => lerp(BUS_STOP_Z, F, Math.pow(clamp01((t - a) / (b - a)), 2.2));
  if (t < B.bus + 0.2) return F;
  if (t < B.no + 0.6) return arrive(B.bus + 0.2, B.pulls + 1.1);
  if (t < B.lastBus - 0.1) return leave(B.no + 0.6, B.lastBus - 0.2);
  if (t < B.build) return arrive(B.lastBus - 0.1, B.between + 0.6);
  return leave(B.build, B.first + 0.8);
};
export const busTrip = (t: number) => (t < B.lastBus - 0.15 ? 1 : 2);
export const busEmpty = (t: number) => busTrip(t) === 1 ? ramp(t, FILL(), FILL() + 1.2) : ramp(t, NUM_IN() , NUM_IN() + 1.0);

// ---------- numbers: the last bus's passengers. Room k gets ROOM_NUM[k]; the first eight are numbers people know.
export const DECIMALS: [string, string][] = [
  ['π − 3', '14159265'], ['e − 2', '71828182'], ['√2 − 1', '41421356'], ['√3 ÷ 2', '86602540'],
  ['φ − 1', '61803398'], ['1 ÷ 2', '50000000'], ['1 ÷ 4', '25000000'], ['1 ÷ 3', '33333333'],
];
export const numDigits = (r: number) => r <= DECIMALS.length ? DECIMALS[r - 1][1]
  : Array.from({length: 8}, (_, k) => String(Math.floor(hash(r, k + 3) * 10))).join('');
export const NUM_IN = () => B.give - 0.1;
const NUM_D = 1.25;
// reshuffles ("however you fill the hotel"): two new orders of the numbers among rooms 1..NUM_N
const perm = (seed: number) => { const p = Array.from({length: NUM_N}, (_, i) => i + 1); for (let i = NUM_N - 1; i > 0; i--) { const j = Math.floor(hash(i, seed) * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; };
export const SHUFFLES = [{t: () => B.however + 0.25, p: perm(41)}, {t: () => B.leftOut + 0.15, p: perm(77)}];
// which room number n is in at time t (the board's place); identity until the first shuffle
const roomAfter = (n: number, s: number) => (s === 0 ? n : SHUFFLES[s - 1].p.indexOf(n) + 1);
export const boardAt = (n: number, t: number) => {
  const a = NUM_IN() + waveDelay(n, 0.9);
  const seat: [number, number] = [BUS_X, BUS_SEAT_Z(n)];
  const pos = (r: number): [number, number] => [BOARD_X, doorZ(r)];
  let from = seat, to = pos(1), k = 0, arc = 0, vis = t >= a ? 1 : 0, settled = false;
  if (t < a) return {x: seat[0], z: seat[1], y: 0, vis: 0, moving: 0, settled: false, room: -1};
  if (t < a + NUM_D) { to = pos(n); k = smooth((t - a) / NUM_D); arc = 1.0 + 0.05 * Math.abs(doorZ(n) - seat[1]); }
  else {
    from = pos(n); to = from; k = 1; settled = true;
    SHUFFLES.forEach((s, i) => {
      const st = s.t() + waveDelay(n, 0.4);
      if (t >= st) { from = pos(roomAfter(n, i)); to = pos(roomAfter(n, i + 1)); k = smooth((t - st) / NUM_D); arc = 0.6 + 0.05 * Math.abs(from[1] - to[1]); settled = k >= 1; }
    });
  }
  const x = lerp(from[0], to[0], k), z = lerp(from[1], to[1], k), y = arc * Math.sin(Math.PI * k) * (k < 1 ? 1 : 0);
  return {x, z, y, vis, moving: k < 1 ? Math.sin(Math.PI * k) : 0, settled, room: settled ? Math.round(-z / PITCH) + 1 : -1};
};
// numbers fade out into the final pull-back? no: they stay; the left-out crowd joins them
// board geometry: 2.4 × 0.6 m facing (sin φ, 0, cos φ); text runs along (cos φ, 0, −sin φ), i.e. down the row
export const BOARD = {w: 2.4, h: 0.6, y: 1.35, phi: 1.22};
// character slots on the board canvas (1024 × 256): '0' '.' d1..d8 '…'
export const SLOT_PX = (k: number) => (k === -1 ? 120 : k === 0 ? 172 : k === 9 ? 862 : 228 + 78 * (k - 1)); // k: -1 = '0', 0 = '.', 1..8 digits, 9 = '…'
export const slotWorld = (cx: number, cz: number, y: number, k: number): [number, number, number] => {
  const u = (SLOT_PX(k) / 1024 - 0.5) * BOARD.w;
  return [cx + Math.cos(BOARD.phi) * u, y, cz - Math.sin(BOARD.phi) * u];
};

// ---------- the diagonal: room k's k-th digit is copied up, +1, into the new number
export const NEW_DIGITS = DECIMALS.map((d, i) => String(Number(d[1][i]) + 1)).join(''); // 22514114: no 0 or 9
export const pickAt = (k: number) => {
  if (k === 1) return B.first + 0.35; if (k === 2) return B.second + 0.15;
  return lerp(B.second + 0.15, B.forever + 0.25, (k - 2) / 6);
};
export const PICK_FLY = 0.6;
export const picked = (k: number, t: number) => ramp(t, pickAt(k), pickAt(k) + 0.2);
export const builtDigits = (t: number) => DECIMALS.filter((_, i) => t >= pickAt(i + 1) + PICK_FLY).length;
export const cardOn = (t: number) => ramp(t, B.build, B.build + 0.4) * (1 - ramp(t, B.differs - 0.3, B.differs + 0.1));
// the new number (a board in amber) walks the row in front of the boards from room 1 to room 9, then out to the road
export const WALK = {a: () => B.differs + 0.1, b: () => B.noRoom + 0.2};
export const WALK_X = 2.2; export const WALK_Y = 1.05; // passes above the room boards
export const walkerZ = (t: number) => {
  const a = WALK.a(), b = WALK.b(), u = clamp01((t - a) / (b - a));
  // slow past rooms 1-3 (the ≠ labels), faster after
  const s = u < 0.55 ? (u / 0.55) * 0.3 : 0.3 + ((u - 0.55) / 0.45) * 0.7;
  return lerp(doorZ(1) + 1.2, doorZ(9), smooth(s) * 0.15 + s * 0.85);
};
export const walkerOn = (t: number) => ramp(t, B.differs - 0.25, B.differs + 0.15);
// the left-out numbers wait by the road: the first one walks back there, the shuffles add two more
export const leftOutPos = (i: number): [number, number] => [4.6 + 0.0 * i, 2.0 - 1.1 * i];
export const walkerHome = (t: number) => ramp(t, B.noRoom + 0.3, B.however + 0.1);
export const leftOutOn = (i: number, t: number) => (i === 0 ? 1 : ramp(t, SHUFFLES[i - 1].t() + 0.8, SHUFFLES[i - 1].t() + 1.2));
export const LEFT_DIGITS = [NEW_DIGITS, ...SHUFFLES.map((s) => s.p.slice(0, 8).map((n, k) => { const d = Number(numDigits(n)[k]); return String(d >= 8 ? 1 : d + 1); }).join(''))];
export const mismatch = (k: number, t: number) => { const z = walkerZ(t), d = (z - doorZ(k)) / 1.3; return t > WALK.b() ? 0 : Math.exp(-d * d) * walkerOn(t); };

// ---------- the end: the road fills with an endless crowd of left-out numbers
export const crowd = (t: number) => ramp(t, B.bigger - 0.3, B.bigger + 1.6);

// ---------- the sign: "NO" lit = full; dark while a room is free
export const noLit = (t: number) => {
  const flick = (a: number) => (t > a && t < a + 0.35 ? (hash(Math.floor(t * 30), 9) > 0.5 ? 1 : 0.15) : 1);
  let v = 1;
  if (t > M1() + MOVE_D * 0.5 && t < NEW_ARRIVE() + 0.1) v = 0.06; // room 1 free
  if (t > M2() + 0.7 && t < FILL() + 1.3) v = 0.06; // the odd rooms free
  if (t > OUT() + 0.4 && t < NUM_IN() + 1.6) v = 0.06; // checked out: empty
  const p = Math.exp(-Math.pow((t - B.no - 0.1) / 0.22, 2));
  return Math.min(1.5, v * flick(NEW_ARRIVE() + 0.1) * flick(FILL() + 1.3) * flick(NUM_IN() + 1.6) + 0.6 * p);
};
// the row's light pulse on "endless rooms": a flare racing to the horizon
export const pulse = (r: number, t: number) => { const a = B.endless + 0.15 + waveDelay(r, 1.5); const d = (t - a) / 0.28; return Math.exp(-d * d); };

// ---------- labels (screen overlays projected from world points)
type V3 = [number, number, number];
export type Label = {id: string; text: string; at: V3; o: number; color: string; size: number};
export const labels = (t: number): Label[] => {
  const L: Label[] = [];
  const on = (a: number, b: number) => ramp(t, a, a + 0.3) * (1 - ramp(t, b, b + 0.3));
  const add = (id: string, text: string, p: V3, o: number, color: string, size = 46) => L.push({id, text, at: p, o, color, size});
  add('allfull', '∞ rooms · all full', [0, 3.9, doorZ(7)], on(0.15, B.guest - 0.3), WARM, 54);
  add('newg', 'new guest', [7.6, 2.3, 9], on(B.guest + 0.3, B.easy), AMBER, 48);
  add('a1', '1 → 2', [STAND_X, 2.6, doorZ(1) - 1.6], on(M1(), B.free + 0.3), WARM); add('a2', '2 → 3', [STAND_X, 2.6, doorZ(2) - 1.6], on(M1() + 0.12, B.free + 0.3), WARM);
  add('a3', '3 → 4', [STAND_X, 2.6, doorZ(3) - 1.6], on(M1() + 0.24, B.free + 0.3), WARM);
  add('r1', 'room 1: free', [1.2, 2.9, doorZ(1) + 0.4], on(B.free, NEW_ARRIVE()), AMBER, 52);
  add('busl', 'endless bus', [BUS_X, 4.5, -14], on(B.pulls + 0.5, B.double + 0.2), BLUE, 52);
  add('d1', '1 → 2', [1.2, 3.0, doorZ(1) - 1.6], on(B.oneTwo, B.odd), WARM); add('d2', '2 → 4', [1.2, 3.0, doorZ(3) - 1.6], on(B.oneTwo + 0.55, B.odd), WARM);
  add('d3', '3 → 6', [1.2, 3.0, doorZ(5) - 1.6], on(B.oneTwo + 1.1, B.odd), WARM);
  add('odd', 'odd rooms free', [1.2, 3.2, doorZ(4)], on(B.odd + 0.2, B.fits + 0.4), BLUE, 52);
  add('numbus', 'every number from 0 to 1', [BUS_X - 1.5, 4.4, -3], on(B.between - 0.1, B.build - 0.2), WARM, 50);
  add('out', 'no room', [leftOutPos(0)[0], 2.3, leftOutPos(0)[1]], on(B.noRoom + 0.2, B.however + 0.3), AMBER, 52);
  add('lo', 'left out', [leftOutPos(1)[0], 2.4, leftOutPos(1)[1] - 1], on(B.leftOut + 0.4, B.bigger + 0.4), AMBER, 50);
  add('rooms', 'every room', [0.5, 3.4, doorZ(9)], ramp(t, B.bigger + 0.6, B.bigger + 1.0), WARM, 50);
  add('left', 'still left out', [9.5, 0.5, doorZ(16)], ramp(t, B.bigger + 1.0, B.bigger + 1.4), AMBER, 50);
  return L;
};

// ---------- camera keys (Catmull-Rom; `cut` starts a new shot)
export type Key = {t: number; pos: V3; look: V3; mm: number; cut?: boolean};
export const KEYS: Key[] = [
  {t: 0, pos: [11.5, 1.5, 13.5], look: [1.6, 4.6, -6], mm: 28},
  {t: B.endless, pos: [7.4, 1.6, 6.5], look: [0, 3.4, -16], mm: 28},
  {t: B.taken + 0.1, pos: [4.0, 1.9, -3], look: [-0.4, 3.0, -40], mm: 28},
  {t: B.guest + 0.5, pos: [13.0, 2.0, 17.5], look: [4.5, 3.0, 2], mm: 30},
  {t: B.where + 0.5, pos: [9.6, 2.2, 10.5], look: [2.4, 2.6, -1], mm: 30},
  {t: B.moves + 0.2, pos: [8.4, 2.5, 7.0], look: [0, 2.6, -12], mm: 28},
  {t: B.nextEnd + 0.4, pos: [8.0, 5.2, 3.5], look: [0, 1.0, -36], mm: 28},
  {t: B.free + 0.4, pos: [9.2, 2.4, 6.8], look: [0.8, 2.5, -2.5], mm: 30},
  {t: B.bus - 0.1, pos: [10.5, 3.4, 10], look: [2, 1.5, -10], mm: 30},
  {t: B.pulls + 0.9, pos: [15.5, 4.8, 13.5], look: [4, 1.6, -18], mm: 30},
  {t: B.double + 0.3, pos: [12.0, 12.5, 10.0], look: [1, 1.0, -17], mm: 30},
  {t: B.sixEnd, pos: [10.0, 10.0, 3.5], look: [0.5, 1.0, doorZ(5)], mm: 30},
  {t: B.fits + 0.4, pos: [12.0, 11.0, 9.0], look: [1, 1.0, -18], mm: 30},
  {t: B.no + 0.2, pos: [13.0, 9.0, 15], look: [2.5, 2.4, -8], mm: 30},
  {t: B.between + 0.2, pos: [14.5, 5.5, 13], look: [3, 1.6, -14], mm: 30},
  {t: B.give, pos: [11.0, 9.5, 8.0], look: [1.5, 1.2, -10], mm: 30},
  {t: B.give + 1.3, pos: [4.6, 2.6, 1.2], look: [1.0, 1.6, doorZ(5)], mm: 28},
  {t: B.first, pos: [6.0, 1.75, doorZ(1) + 1.6], look: [0.6, 1.35, doorZ(1) - 0.5], mm: 30},
  {t: pickAt(2) + 0.2, pos: [6.0, 1.75, doorZ(2) + 1.6], look: [0.6, 1.35, doorZ(2) - 0.5], mm: 30},
  {t: pickAt(4), pos: [6.6, 1.9, doorZ(4) + 1.8], look: [0.6, 1.35, doorZ(4) - 0.8], mm: 30},
  {t: B.forever + 0.6, pos: [8.0, 2.4, doorZ(8) + 3.0], look: [0.6, 1.35, doorZ(8) - 1.5], mm: 30},
  {t: B.differs + 0.4, pos: [6.6, 1.8, doorZ(1) + 2.0], look: [1.2, 1.45, doorZ(1) - 1.0], mm: 30},
  {t: WALK.a() + 0.55 * (WALK.b() - WALK.a()), pos: [6.8, 1.9, doorZ(3) + 2.0], look: [1.2, 1.45, doorZ(3) - 1.0], mm: 30},
  {t: B.noRoom + 0.5, pos: [8.6, 2.3, 7.0], look: [3.8, 2.0, -1], mm: 30},
  {t: B.leftOut + 0.6, pos: [9.6, 2.8, 8.0], look: [3.6, 1.9, -3], mm: 30},
  {t: B.bigger + 0.5, pos: [26, 24, 22], look: [3, 0, -30], mm: 30},
  {t: DUR_S - 0.6, pos: [44, 62, 34], look: [4, 0, -80], mm: 30},
  {t: DUR_S, pos: [46, 66, 35], look: [4, 0, -84], mm: 30},
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
  const u = smooth(u0) * 0.35 + clamp01(u0) * 0.65;
  const v = (f: (k: Key) => V3) => [0, 1, 2].map((j) => cr(f(a)[j], f(b)[j], f(c)[j], f(d)[j], u)) as V3;
  return {pos: v((k) => k.pos), look: v((k) => k.look), mm: lerp(b.mm, c.mm, clamp01(u))};
};
export const fovOf = (mm: number) => (2 * Math.atan(18 / mm) * 180) / Math.PI;
const _cam = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.1, 5000), _v = new THREE.Vector3();
export const project = (t: number, p: V3) => {
  const c = camAt(t); _cam.fov = fovOf(c.mm); _cam.updateProjectionMatrix();
  _cam.position.set(...c.pos); _cam.lookAt(...c.look); _cam.updateMatrixWorld();
  _v.set(...p).project(_cam);
  return {x: (_v.x * 0.5 + 0.5) * 1080, y: (-_v.y * 0.5 + 0.5) * 1920, front: _v.z < 1 && _v.z > -1};
};
