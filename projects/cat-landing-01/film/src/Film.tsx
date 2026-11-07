// Cat landing 01: one shot down one sunny kitchen wall. Miso slips off the sill after a slice of toast; the camera
// rides the fall; time slows for the explanation (myth, no-tail Manx, a trip into the head, nothing to push on,
// bend, tuck and turn, swap, half a second); she lands on the rug, asks us never to drop a cat, the wide view recaps
// the flip down the whole wall, and she leaps back to the sill (loops to frame 0). Every time comes from beats.json.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing, random} from 'remotion';
import {Captions} from './kit/captions';
import {SANS, MARKER} from './kit/fonts';
import {Cat, CatPose, Face, headLocal, HALF_X} from './Cat';
import {Wall, Beam, Motes, Defs, FLOOR} from './World';
import {Toast, Tag, Bubble, Ring, Stopwatch, Hand, Puff, Burst, ChalkWall, Cockpit, Manx, TEAL, VIOLET, INK} from './Props';
import words from './words.json';
import B from './beats.json';

export const FPS = 30;
export const DUR = Math.ceil(B.total * FPS);
const P = Math.PI;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = Easing.bezier(0.45, 0, 0.55, 1);
// keyframes: smooth (ease in-out per segment) and linear
const ks = (t: number, k: [number, number][]) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return interpolate(t, [k[i - 1][0], k[i][0]], [k[i - 1][1], k[i][1]], {...clamp, easing: io});
  return k[k.length - 1][1];
};
const kl = (t: number, k: [number, number][]) => interpolate(t, k.map((x) => x[0]), k.map((x) => x[1]), clamp);
const win = (t: number, a: number, b: number, f = 0.25) => Math.min(interpolate(t, [a, a + f], [0, 1], clamp), interpolate(t, [b - f, b], [1, 0], clamp));

const S = 1.5; // the star's scale in world units
const LAND = FLOOR - 58; // waist y when standing on the rug
const SILL_Y = -140; // waist y when standing on the sill
const CAT_X = 560;

// ---- the star's pose over time ----
const catY = (t: number) => kl(t, [[0, SILL_Y], [0.95, SILL_Y], [1.25, -90], [1.7, 120], [2.4, 480], [3.2, 820], [3.83, 960], [4.4, 990],
  [7.13, 1060], [11.29, 1180], [16.09, 1400], [20.41, 1640], [27.85, 2050], [32.8, 2330], [35.0, 2460], [35.6, 2620], [36.3, 3200], [36.9, 3900],
  [B.bendthem - 0.02, LAND], [B.bendthem + 0.35, LAND + 34], [B.bendthem + 0.9, LAND], [49.3, LAND]]);
const recapY = (t: number) => interpolate(interpolate(t, [B.l10 + 0.2, B.r_lands], [0, 1], clamp), [0, 1], [SILL_Y + 150, LAND], {easing: Easing.in(Easing.quad)});
const leapT = (t: number) => interpolate(t, [49.35, 50.35], [0, 1], {...clamp, easing: Easing.bezier(0.3, 0, 0.4, 1)});

const pose = (t: number): CatPose => {
  // rolls (0 = paws down, PI = paws up); see PLAN.md physics guard: halves counter-rotate at the same time
  let rollF = ks(t, [[0.95, 0], [1.6, P], [2.2, P], [3.6, P - 0.55], [4.3, P - 0.55], [5.2, P], [18.9, P], [20.3, P - 0.35], [21.6, P - 0.35], [23.6, -0.12], [29.2, -0.12], [31.9, 0]]);
  let rollB = ks(t, [[0.95, 0], [1.6, P], [2.2, P], [3.6, P - 0.55], [4.3, P - 0.55], [5.2, P], [18.9, P], [20.3, P + 0.15], [21.6, P + 0.15], [23.6, P + 0.33], [29.2, P + 0.33], [31.9, 0]]);
  if (t > B.l10) { rollF = 0; rollB = 0; }
  const paddle = win(t, 11.6, 14.5, 0.4);
  const bat = win(t, 0, 1.0, 0.1);
  const tuckF = Math.max(paddle * (0.5 + 0.5 * Math.sin(t * 9)), bat * (0.5 + 0.5 * Math.sin(t * 11)),
    ks(t, [[20.5, 0], [21.15, 1], [29.95, 1], [30.45, 0], [35, 0]]));
  const tuckB = Math.max(paddle * (0.5 + 0.5 * Math.sin(t * 9 + 1.6)), ks(t, [[28.7, 0], [29.2, 1], [32.0, 1], [32.6, 0.25], [35.9, 0.25], [36.4, 0]]));
  const reach = Math.max(ks(t, [[0.9, 1], [1.4, 0]]), ks(t, [[35.95, 0], [36.6, 1]]));
  const bend = t > B.l10 ? 0 : ks(t, [[14.5, 0], [15.5, 1.9], [16.3, 1.9], [16.9, 1.1], [31.4, 1.1], [32.1, 0.08]]);
  const squash = kl(t, [[B.bendthem - 0.02, 0], [B.bendthem + 0.3, 1], [B.bendthem + 0.9, 0.15], [B.bendthem + 1.4, 0]]);
  const pitch = ks(t, [[0.95, 0], [1.3, -0.5], [1.9, 0.1], [3.8, -0.05], [11, 0.06], [14.5, 0], [15.5, -0.25], [16.9, 0], [35, 0]]) + Math.sin(t * 0.7) * 0.03 * win(t, 2, 35, 1);
  // face by beat
  let face: Face = {mouth: 'smile', look: [0.6, 0.2]};
  if (t < 0.95) face = {mouth: 'smug', look: [1, 0.4], eyes: 1};
  else if (t < 2.0) face = {mouth: 'o', eyes: 1.35, brows: -1};
  else if (t < 3.83) face = {mouth: 'smug', eyes: 0.8, brows: 0.6, look: [-0.6, 0]};
  else if (t < 6.6) face = {mouth: t < 5.2 ? 'flat' : 'wobble', eyes: 0.75, brows: -0.6, look: [-0.8, t < 5 ? 0.6 : -0.6], sweat: win(t, 4.4, 5.6, 0.2)};
  else if (t < 11.29) face = {mouth: 'flat', eyes: 1, look: [0.2, 0.6]};
  else if (t < 14.5) face = {mouth: 'flat', eyes: 1.1, brows: 1, look: [0.8, 0]};
  else if (t < 16.4) face = {mouth: 'o', eyes: 1.1, brows: -0.5, look: [0, -1]};
  else if (t < 20.5) face = {mouth: 'flat', eyes: 1, brows: 1, look: [0.5, 0]};
  else if (t < 24) face = {mouth: 'grin', eyes: 1.2, brows: 0.5, look: [0.5, -0.3]};
  else if (t < 27.85) face = {mouth: 'smile', eyes: 0.8, brows: 0, look: [-1, 0.2]};
  else if (t < 32) face = {mouth: 'flat', eyes: 1, brows: 1, look: [-1, 0]};
  else if (t < 35.6) face = {mouth: 'smug', eyes: 0.9, look: [1, -0.2]};
  else if (t < B.bendthem) face = {mouth: 'o', eyes: 1.2, brows: 1, look: [0, 1]};
  else if (t < 39.4) face = {mouth: 'smile', eyes: 0.45, blush: 0.6, look: [0, 0]};
  else if (t < 42.6) face = {mouth: 'flat', eyes: 1, brows: 1.3, look: [-0.3, 0.2]};
  else if (t < 44.2) face = t < 42.85 ? {mouth: 'flat', eyes: 1, brows: 1.3, look: [-0.3, 0.2]} : {mouth: 'smile', eyes: 0.25, blush: 1, look: [0, 0]};
  else face = {mouth: 'smile', eyes: 1, look: [0.4, -0.5]};
  const rotor = win(t, B.tail - 0.1, 4.6, 0.5) * (t > 4.0 ? interpolate(t, [4.0, 4.6], [1, 0], clamp) : 1);
  const rotorA = t * (t < 4.0 ? 40 : 40 - (t - 4) * 30);
  const tint = win(t, 17.6, 32.1, 0.4);
  const leap = leapT(t);
  let x = CAT_X + Math.sin(t * 0.5) * 12 * win(t, 2, 35, 1), y = catY(t);
  if (leap > 0) { x = CAT_X; y = interpolate(leap, [0, 1], [LAND, SILL_Y]) - Math.sin(leap * P) * 500; }
  const raise = ks(t, [[41.7, 0], [42.0, 1], [42.85, 1], [43.15, 0]]);
  return {
    x, y, s: S, pitch: leap > 0 ? -Math.sin(leap * P) * 0.5 : pitch, rollF, rollB, bend, tuckF: leap > 0 ? Math.sin(leap * P) : tuckF, tuckB: leap > 0 ? Math.sin(leap * P) : tuckB,
    reachF: t > B.l10 ? 1 - Math.sin(leap * P) : reach, reachB: t > B.l10 ? 1 - Math.sin(leap * P) : reach, squash, face, t,
    tail: 1, tailWag: t * 2 + (t > 37.5 && t < 44.3 ? Math.sin(t * 2.2) * 2.5 : 0) + (t > 30.8 && t < 31.6 ? Math.sin((t - 30.8) * 8) * 2 : 0), rotor, rotorA,
    headTilt: (t > 6.5 && t < 7.1 ? Math.sin((t - 6.5) * 30) * 6 : 0) + (t > 38.4 && t < 41.8 ? Math.sin((t - 38.4) * 2.6) * 9 : 0), raise, padText: 'never',
    frontTint: tint > 0.02 ? `rgba(20,184,200,${tint})` : undefined, backTint: tint > 0.02 ? `rgba(139,108,240,${tint})` : undefined,
  };
};

// world position of a point given in the rig's local frame of one half (dir +1 front, -1 back)
const rigToWorld = (p: CatPose, lx: number, ly: number, dir: number) => {
  const hb = ((p.bend ?? 0) / 2) * (dir > 0 ? -1 : 1), a = (p.pitch ?? 0);
  const x1 = lx * Math.cos(hb) - ly * Math.sin(hb), y1 = lx * Math.sin(hb) + ly * Math.cos(hb);
  return {x: p.x + p.s * (x1 * Math.cos(a) - y1 * Math.sin(a)), y: p.y + p.s * (x1 * Math.sin(a) + y1 * Math.cos(a))};
};

// ---- camera (world point at screen centre, zoom) ----
const camera = (t: number, cy: number) => {
  const head = 0;
  void head;
  const zoom = ks(t, [[0, 1.15], [1.0, 1.15], [2.0, 1.0], [3.4, 1.05], [3.83, 1.5], [4.2, 1.0], [6.4, 1.1], [7.0, 1.6], [7.6, 2.6], [10.9, 2.8], [11.6, 2.2], [12.6, 1.3],
    [14.5, 1.35], [16.0, 1.55], [18.5, 1.5], [20.4, 1.6], [23.5, 1.68], [27.8, 1.6], [32.4, 1.5], [33.2, 0.82], [34.9, 0.85], [35.5, 1.0], [36.8, 0.9],
    [B.bendthem + 0.2, 1.15], [39.4, 1.35], [41.6, 1.5], [43.35, 1.4], [43.9, 0.7], [44.25, 0.75], [49.3, 0.75], [50.6, 1.15]]);
  const cyk = kl(t, [[0, -250], [1.0, -250], [1.7, 60], [3.83, 900], [6.6, 1020], [7.13, 1000], [11.29, 1120], [16.09, 1360], [20.41, 1600], [27.85, 2020], [32.8, 2280], [34.9, 2400],
    [35.6, 2560], [36.3, 3100], [36.9, 3700], [B.bendthem, LAND - 110], [39.4, LAND - 80], [43.35, LAND - 70], [44.25, recapY(44.25) + 120]]);
  const cxk = ks(t, [[0, 560], [3.6, 540], [3.83, 330], [4.2, 470], [6.4, 560], [7.6, 700], [11.6, 700], [12.6, 600], [16, 580], [21, 620], [24, 500], [27.5, 500], [29, 570], [33, 560],
    [39, 690], [43.35, 700], [43.9, 560], [44.25, 520], [49.3, 520], [50.6, 560]]);
  const cyR = t > 44.25 && t < 49.3 ? recapY(t) + 120 : t >= 49.3 ? cy + interpolate(t, [49.3, 50.4], [120, -110], {...clamp, easing: io}) : cyk;
  void cy;
  // never parks: a slow handheld drift
  return {cx: cxk + Math.sin(t * 0.43) * 14, cy: cyR + Math.cos(t * 0.37) * 12, zoom: zoom * (1 + Math.sin(t * 0.29) * 0.012)};
};

const LINES = [
  "Lots of people think a cat's [tail] flips it over when it falls.",
  'But actually, cats with [no] [tail] can do it too.',
  "First, the cat's [inner] [ear] and [eyes]", 'tell it which way is [up.]',
  'But in the air,', "there's [nothing] to push on.", 'So how can it [turn?]',
  'The cat [bends] in the middle,', 'so each half can turn a [different] [way.]',
  'It [tucks] its front legs in,', 'so the front turns [a] [lot.]', 'Its back legs [stick] [out,]', 'so the back [barely] turns.',
  'Then it [swaps.]', 'Back legs in, front legs out,', 'and the back half [catches] [up.]',
  'It can all happen in less than [half] [a] [second.]',
  'Then it [reaches] its legs down', 'and [bends] them to land [softly.]',
  'But cats can still get [badly] [hurt.]', 'So [never] drop a cat to test this.',
  'So the cat [bends,] [tucks,] [twists,] [swaps,]', 'and [lands] on four paws.',
];

const BUBBLES = Array.from({length: 9}).map((_, i) => ({dx: [-330, 300, -200, 360, -380, 180, -60, 330, -270][i], r: 62 + (i % 3) * 16, sp: 0.8 + (i % 4) * 0.18, d: i * 0.25}));
const VERBS: [string, number, number][] = [['bend', B.r_bends, 0.18], ['tuck', B.r_tucks, 0.36], ['twist', B.r_twists, 0.56], ['swap', B.r_swaps, 0.75], ['lands', B.r_lands, 0.98]];

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const p = pose(t);
  const cam = camera(t, p.y);
  const camPrev = camera(t - 1 / FPS, pose(t - 1 / FPS).y);
  const streak = (cam.cy - camPrev.cy) * cam.zoom; // screen px per frame of world scroll
  const W2S = (x: number, y: number) => ({x: 540 + (x - cam.cx) * cam.zoom, y: 960 + (y - cam.cy) * cam.zoom});
  const camT = `translate(540,960) scale(${cam.zoom}) translate(${-cam.cx},${-cam.cy})`;

  // toast: falls beside her, tumbling slowly; real speed where she does; lands butter side down at ~38.6
  const toastLand = B.softly + 0.3;
  let tx = CAT_X + 360 + Math.sin(t * 0.6) * 30, ty = catY(t) - 170 + Math.sin(t * 0.9) * 40, ta = 40 + t * 9 + kl(t, [[1, 0], [3.8, 260]]);
  if (t < 0.95) { tx = 770 + Math.sin(t * 11) * 6; ty = -82; ta = 6 + Math.sin(t * 11) * 5; }
  else if (t < 1.4) { tx = interpolate(t, [0.95, 1.4], [770, 860]); ty = interpolate(t, [0.95, 1.4], [-82, -40]); ta = interpolate(t, [0.95, 1.4], [6, 70]); }
  if (t > 36.2) {
    const k = interpolate(t, [36.2, toastLand], [0, 1], clamp);
    tx = CAT_X + 330; ty = interpolate(k, [0, 1], [catY(36.2) - 170, FLOOR + 70], {easing: Easing.in(Easing.quad)}); ta = interpolate(k, [0, 1], [ta, 180]);
    if (t >= toastLand) { ty = FLOOR + 70 - Math.max(0, Math.sin((t - toastLand) * 14) * 20 * Math.exp(-(t - toastLand) * 6)); ta = 180; }
  }
  const toastFlat = t > toastLand;

  // Manx drops past at full speed (line 2)
  const mk = interpolate(t, [B.actually + 0.35, B.l2 - 0.3], [0, 1], clamp);
  const manx: CatPose | null = mk > 0 && mk < 1 ? {
    x: CAT_X - 230 + Math.sin(mk * 5) * 20, y: catY(t) - 1100 + mk * 2300, s: 1.25, pitch: 0.1, rollF: interpolate(mk, [0.25, 0.55], [P, 0], {...clamp, easing: io}), rollB: interpolate(mk, [0.3, 0.6], [P, 0], {...clamp, easing: io}),
    bend: Math.sin(Math.min(1, Math.max(0, (mk - 0.2) / 0.45)) * P) * 0.9, tuckF: interpolate(mk, [0.2, 0.3, 0.5, 0.6], [0, 1, 1, 0], clamp), tuckB: interpolate(mk, [0.4, 0.5, 0.6, 0.7], [0, 1, 1, 0], clamp),
    reachF: interpolate(mk, [0.6, 0.8], [0, 1], clamp), reachB: interpolate(mk, [0.6, 0.8], [0, 1], clamp), face: {mouth: 'grin', eyes: 1.1, look: [1, -0.5]}, t: t + 3,
  } : null;

  // the cockpit (line 3): enter through the ear, leave through a porthole that becomes her eye
  const headW = rigToWorld(p, headLocal(p.rollF).x, headLocal(p.rollF).y, 1);
  const headS = W2S(headW.x, headW.y + 50 * p.s);
  const inR = interpolate(t, [7.25, 7.75], [0, 1500], {...clamp, easing: Easing.in(Easing.quad)});
  const outR = interpolate(t, [10.85, 11.35], [0, 1600], {...clamp, easing: Easing.in(Easing.quad)});
  const cockpitOn = t > 7.25 && t < 11.35;
  const dial = ks(t, [[9.55, 0], [B.up + 0.15, 1]]);
  const lever = ks(t, [[10.45, 0], [10.7, 1]]);

  // turn rings (lines 5-7): phases follow each half's roll
  const ringO = win(t, 18.3, 32.3, 0.35);
  const fC = rigToWorld(p, HALF_X, 0, 1), bC = rigToWorld(p, -HALF_X, 0, -1);
  const hb = ((p.bend ?? 0) / 2) * 180 / P, pd = ((p.pitch ?? 0) * 180) / P;
  const waist = {x: p.x, y: p.y};

  // afterimages (line 8)
  const ghostO = win(t, 32.85, 34.6, 0.3);
  const zip = interpolate(t, [33.35, 33.75], [0, 1], clamp);
  const GH: Partial<CatPose>[] = [{rollF: P, rollB: P}, {rollF: P, rollB: P, bend: 1.9, pitch: -0.25}, {rollF: P - 0.35, rollB: P + 0.15, bend: 1.1}, {rollF: -0.12, rollB: P + 0.33, bend: 1.1, tuckF: 1}, {rollF: 0, rollB: 1.6, bend: 1.1, tuckB: 1}];

  // recap ghost cat (line 11): replays the flip down the full wall
  const rk = interpolate(t, [B.l10 + 0.2, B.r_lands], [0, 1], clamp);
  const recapO = win(t, B.l10 + 0.1, 49.6, 0.3);
  const ghostRecap: CatPose = {
    x: 250, y: interpolate(rk, [0, 1], [SILL_Y + 150, LAND], {easing: Easing.in(Easing.quad)}), s: 1.9,
    rollF: interpolate(rk, [0.05, 0.12, 0.4, 0.6, 0.75], [0, P, P, -0.12, 0], clamp), rollB: interpolate(rk, [0.05, 0.12, 0.45, 0.6, 0.78], [0, P, P + 0.3, P + 0.3, 0], clamp),
    bend: interpolate(rk, [0.12, 0.2, 0.75, 0.82], [0, 1.2, 1.2, 0], clamp), tuckF: interpolate(rk, [0.3, 0.36, 0.6, 0.66], [0, 1, 1, 0], clamp), tuckB: interpolate(rk, [0.6, 0.66, 0.8, 0.86], [0, 1, 1, 0], clamp),
    reachF: interpolate(rk, [0.86, 0.95], [0, 1], clamp), reachB: interpolate(rk, [0.86, 0.95], [0, 1], clamp), face: {mouth: 'smile'}, t,
  };

  // the hand (line 10): drifts in, stops, turns over, gives a chin scratch, leaves
  const hIn = ks(t, [[41.9, 0], [42.6, 1], [43.35, 1], [43.9, 0]]);
  const hTurn = ks(t, [[42.6, 0], [42.85, 1]]);
  const handW = {x: interpolate(hIn, [0, 1], [1700, p.x + 600 - hTurn * 200]), y: p.y + 70 + hTurn * 10};

  const slowO = win(t, B.l1 + 0.2, 34.9, 0.3), simpO = win(t, B.bends, 32.6, 0.3), scaleO = win(t, B.l10 + 0.3, 49.4, 0.3);
  const vig = 0.55 + 0.45 * slowO;

  return (
    <AbsoluteFill style={{background: '#FFE3BD'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <Defs />
        <g transform={camT}>
          <Wall t={t} camY={cam.cy} zoom={cam.zoom} />
          <Beam t={t} />
          <Motes t={t} camY={cam.cy} zoom={cam.zoom} streak={-streak / cam.zoom} boost={win(t, 11.3, 15.5, 0.5) * 0.8} swirl={win(t, 11.3, 15.5, 0.6)} />
          {/* the toast */}
          {(t < 44.25 || t > 46) && <Toast x={t > 44.25 ? 780 : tx} y={t > 44.25 ? -82 : ty} a={t > 44.25 ? 6 + Math.sin(t * 3) * 2 : (toastFlat ? 180 : ta)} s={toastFlat && t <= 44.25 ? 1.0 : 1.05} />}
          {t > 44.25 && <Toast x={890} y={FLOOR + 70} a={180} />}
          {/* myth bubbles rise from below */}
          {t > 0.5 && t < 6.6 && BUBBLES.map((b, i) => {
            const by = catY(t) + 1100 - (t - 0.5 - b.d) * 330 * b.sp - Math.max(0, t - 3.83) * -260 * b.sp;
            const pp = interpolate(t, [4.0 + i * 0.22, 4.25 + i * 0.22], [0, 1], clamp);
            return t - 0.5 - b.d > 0 ? <Bubble key={i} x={CAT_X + b.dx + Math.sin(t * 2 + i) * 20} y={Math.max(catY(t) - 650 + i * 70, by)} r={b.r} t={t} seed={i} pop={pp} /> : null;
          })}
          {/* chalk wall (line 4) */}
          {win(t, B.how, 16.6, 0.3) > 0 && <text x={p.x + 60} y={p.y - 210 + Math.sin(t * 4) * 10} textAnchor="middle" fontFamily={MARKER} fontSize={190} fill="#0E8C99" stroke={INK} strokeWidth={5} opacity={win(t, B.how, 16.6, 0.3)} transform={`rotate(${Math.sin(t * 3) * 8} ${p.x + 60} ${p.y - 260})`}>?</text>}
          {win(t, B.l9 - 0.1, 41.9, 0.25) > 0 && (() => {
            const o = win(t, B.l9 - 0.1, 41.9, 0.25), bx = p.x - 5, by = p.y - 255 + Math.sin(t * 2) * 8;
            return <g opacity={o}>
              <circle cx={p.x + 40} cy={p.y - 130} r={12} fill="#fff" stroke={INK} strokeWidth={4} />
              <circle cx={p.x - 20} cy={p.y - 190} r={20} fill="#fff" stroke={INK} strokeWidth={4} />
              <ellipse cx={bx} cy={by} rx={170} ry={135} fill="#fff" stroke={INK} strokeWidth={5} />
              <Cat x={bx - 30} y={by + 40} s={0.6} rollF={0} rollB={0} reachF={1} reachB={1} t={t} face={{mouth: 'wobble', eyes: 0.8, brows: -1}} />
              <g transform={`translate(${bx + 52},${by - 25}) rotate(30)`}><rect x={-32} y={-11} width={64} height={22} rx={8} fill="#F6D7B0" stroke={INK} strokeWidth={3} /><rect x={-11} y={-11} width={22} height={22} fill="#FCE9D2" /></g>
              <g transform={`translate(${bx + 52},${by - 25}) rotate(-60)`}><rect x={-32} y={-11} width={64} height={22} rx={8} fill="#F6D7B0" stroke={INK} strokeWidth={3} /></g>
              <text x={bx + 110} y={by - 70} textAnchor="middle" fontFamily={MARKER} fontSize={40} fill="#C8392B">ouch</text>
            </g>;
          })()}
          <ChalkWall x={p.x + 330} y={p.y + 20} o={win(t, 12.5, 14.6, 0.3)} crumble={interpolate(t, [13.2, 14.2], [0, 1], clamp)} />
          {/* afterimages (line 8) */}
          {ghostO > 0 && GH.map((g, i) => {
            const passed = zip * 5 > i + 0.5;
            const gy = p.y - (5 - i) * 300;
            return <g key={i} opacity={ghostO * (passed ? 0.12 : 0.42)} style={{filter: 'saturate(0.35) brightness(1.35)'}}><Cat {...(g as CatPose)} x={p.x} y={gy} s={S} t={t} face={{mouth: "o"}} /></g>;
          })}
          {zip > 0 && zip < 1 && <g opacity={0.9}><Cat x={p.x} y={p.y - (5 - zip * 5) * 300} s={S} t={t} rollF={interpolate(zip, [0, 0.6, 1], [P, -0.1, 0])} rollB={interpolate(zip, [0, 0.6, 1], [P, P, 0])} bend={Math.sin(zip * P) * 1.1} face={{mouth: 'grin'}} /></g>}
          {/* recap ghost cat down the whole wall + verbs */}
          {recapO > 0 && <g opacity={recapO * 0.85} style={{filter: 'brightness(1.12)'}}><Cat {...ghostRecap} /></g>}
          {VERBS.map(([w, at, k], i) => {
            const o = interpolate(t, [at - 0.05, at + 0.1], [0, 1], clamp) * win(t, B.l10, 50.0, 0.4);
            if (o <= 0) return null;
            const gy = interpolate(k, [0, 1], [SILL_Y + 150, LAND], {easing: Easing.in(Easing.quad)});
            const sc = interpolate(t, [at, at + 0.1, at + 0.2], [0.5, 1.2, 1], clamp);
            return <g key={w} transform={`translate(${900},${gy}) scale(${sc}) rotate(${i % 2 ? 3 : -3})`} opacity={o}>
              <rect x={-230} y={-95} width={460} height={170} rx={30} fill="#FFFDF6" stroke={INK} strokeWidth={10} />
              <text x={0} y={42} textAnchor="middle" fontFamily={MARKER} fontSize={130} fill={i === 4 ? '#0E8C99' : INK}>{w}</text>
            </g>;
          })}
          {/* back ring behind the cat */}
          <Ring x={bC.x} y={bC.y} rx={R2} ry={R2} phase={-(p.rollB)} color={VIOLET} o={ringO} front={false} rot={pd + hb} />
          <Ring x={fC.x} y={fC.y} rx={R2} ry={R2} phase={-(p.rollF)} color={TEAL} o={ringO} front={false} rot={pd - hb} />
          {manx && <Manx {...manx} />}
          {/* waist joint glow (line 5) */}
          {win(t, B.bends, 32.3, 0.3) > 0 && <circle cx={waist.x} cy={waist.y} r={70 + Math.sin(t * 6) * 8} fill="rgba(255,236,150,0.55)" opacity={win(t, B.bends, 32.3, 0.3)} />}
          <Cat {...p} />
          <Ring x={bC.x} y={bC.y} rx={R2} ry={R2} phase={-(p.rollB)} color={VIOLET} o={ringO} front rot={pd + hb} />
          <Ring x={fC.x} y={fC.y} rx={R2} ry={R2} phase={-(p.rollF)} color={TEAL} o={ringO} front rot={pd - hb} />
          <Burst x={waist.x} y={waist.y} t={t} at={B.catches + 0.25} r={150} />
          <Burst x={p.x} y={p.y} t={t} at={33.75} color="#FFFFFF" r={200} />
          {t > B.bendthem && t < 44.3 && Array.from({length: 28}).map((_, i) => {
            const k = (t - B.bendthem) / (2.5 + random(`dk${i}`) * 3.5);
            if (k > 1) return null;
            const dx = (random(`dx${i}`) - 0.5) * 700, up = 60 + random(`du${i}`) * 260;
            return <circle key={`d${i}`} cx={p.x + dx * (0.4 + k) + Math.sin(t * 2 + i) * 20} cy={LAND + 130 - up * Math.sin(k * P * 0.8)} r={6 + random(`dr${i}`) * 9} fill="#FFF3DD" stroke="#E9CFA8" strokeWidth={2} opacity={(1 - k) * 0.9} />;
          })}
          {[-150, -60, 70, 160].map((dx, i) => <Puff key={i} x={p.x + dx} y={LAND + 120} t={t} at={B.bendthem + i * 0.03} dir={dx < 0 ? -1 : 1} />)}
          <Burst x={tx} y={FLOOR + 70} t={t} at={toastLand} color="#FFE066" r={110} n={8} />
          {hIn > 0 && <Hand x={handW.x} y={handW.y} rot={-90 + hTurn * 180 * 0 - 20 + hTurn * 30} s={1.3} scratch={t > 42.85 && t < 43.35 ? 0.5 + 0.5 * Math.sin(t * 22) : 0} />}
          {t > 42.85 && t < 44.0 && [0, 1, 2].map((i) => {
            const k = ((t - 42.85 - i * 0.25) / 0.9);
            if (k < 0 || k > 1) return null;
            const hw = rigToWorld(p, headLocal(0).x, headLocal(0).y - 60, 1);
            return <path key={i} transform={`translate(${hw.x + 40 + i * 30},${hw.y - 40 - k * 160}) scale(${1.6})`} opacity={1 - k} d="M0,8 C-14,-4 -10,-16 0,-8 C10,-16 14,-4 0,8 Z" fill="#FF7B8A" stroke={INK} strokeWidth={2} />;
          })}
        </g>
        {/* grade: warm vignette, deeper in slow motion */}
        <rect width={1080} height={1920} fill="url(#vig)" opacity={vig} />
        {/* screen-space labels on objects */}
        {(() => {
          const tag = (wx: number, wy: number, text: string, at: number, extra: Partial<React.ComponentProps<typeof Tag>> = {}) => {
            const sp = W2S(wx, wy);
            return <Tag key={text} x={sp.x} y={sp.y} text={text} t={t} at={at} {...extra} />;
          };
          const tailW = rigToWorld(p, -190, -40, -1);
          return <g>
            {tag(tailW.x, tailW.y - 80, 'tail', B.tail)}
            {manx && tag(manx.x, manx.y - 170, 'no tail', B.notail, {hold: 1.4})}
            {tag(p.x + 230, p.y - 200, 'air', B.air, {hold: 1.6})}
            {tag(waist.x, waist.y + 120, 'middle', B.middle)}
            {tag(fC.x + 40, fC.y - 150, 'front', B.each, {hold: 2.6, color: '#0E8C99'})}
            {tag(bC.x - 30, bC.y - 150, 'back', B.each + 0.2, {hold: 2.4, color: '#6B4FD0'})}
            {tag(fC.x + 80, fC.y + 170, 'front legs', B.frontlegs, {hold: 1.6})}
            {tag(bC.x - 60, bC.y + 190, 'back legs', B.backlegs, {hold: 1.7})}
            {tag(CAT_X - 120, catY(Math.min(t, 3.8)) + 470, 'myth?', B.tail + 0.35, {hold: 2.6, color: '#C8392B', size: 54})}
            {tag(p.x + 120, p.y - 330, 'nothing to push on', B.nothing - 0.1, {hold: 2.0, size: 40})}
            {tag(p.x - 60, p.y - 115, 'can get hurt', B.hurt - 0.1, {hold: 1.6, size: 40, color: '#C8392B'})}
          </g>;
        })()}
        {/* ring speed words: the front turns a lot, the back barely */}
        {(() => {
          const sf = W2S(fC.x, fC.y - 135), sb = W2S(bC.x, bC.y - 135);
          return <g>
            <Tag x={sf.x + 70} y={sf.y} text="a lot!" t={t} at={B.alot} hold={2.0} size={40} color="#0E8C99" />
            <Tag x={sb.x - 40} y={sb.y} text="barely" t={t} at={B.barely} hold={1.5} size={40} color="#6B4FD0" />
          </g>;
        })()}
        <Stopwatch x={830} y={760} s={0.85} sweep={interpolate(t, [33.35, 33.75], [0, 0.42], clamp)} o={win(t, 33.0, 35.4, 0.25)} />
        <Tag x={760} y={590} text="flip < ½ second" t={t} at={B.half_s - 0.15} hold={1.3} size={40} />
        {/* the cockpit inside the head (line 3): enter through the ear, leave through a porthole */}
        {cockpitOn && <g>
          <mask id="ckm">
            {t < 10.85 ? <circle cx={headS.x} cy={headS.y} r={inR} fill="#fff" /> : <><rect width={1080} height={1920} fill="#fff" /><circle cx={780} cy={640} r={outR} fill="#000" /></>}
          </mask>
          <g mask="url(#ckm)">
            <g transform={`translate(540,960) scale(${ks(t, [[7.25, 0.8], [8.2, 1.0], [10.5, 1.08], [11.35, 1.6]])}) translate(-540,-960) translate(${interpolate(t, [10.5, 11.35], [0, -240 * 0.4], clamp)},0)`}>
              <Cockpit t={t} t0={7.25} dial={dial} lever={lever} />
              <Tag x={540} y={1010} text="inner ear" t={t} at={B.inner} hold={2.2} />
              <Tag x={540} y={420} text="eyes" t={t} at={B.eyes} hold={1.6} />
              <Tag x={300} y={1720} text="which way is up?" t={t} at={B.up - 0.6} hold={1.2} size={36} />
            </g>
          </g>
        </g>}
        {/* honesty tags */}
        {(slowO > 0 || scaleO > 0) && <text x={540} y={1460} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} letterSpacing={3} fill="#fff" opacity={0.92 * Math.max(slowO, scaleO)}
          style={{paintOrder: 'stroke', stroke: 'rgba(90,40,10,0.75)', strokeWidth: 8} as React.CSSProperties}>
          {scaleO > 0 ? 'REPLAY · NOT TO SCALE' : simpO > 0.5 ? 'SLOWED DOWN · SIMPLIFIED' : 'SLOWED DOWN'}
        </text>}
      </svg>
      {captions && <Captions t={t} words={words} lines={LINES} accent="#3FE0EE" font={SANS} scrim="40,18,6" scrimAlpha={0.55} />}
    </AbsoluteFill>
  );
};

const R2 = 95;
