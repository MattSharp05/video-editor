// @ts-nocheck
// Lactate run 01: the whole film drawn on one 2D canvas per frame. Two places on one camera axis:
// OUT = the dusk track and the glass-body runner; IN = the muscle fibre inside the right thigh.
// Passages are zoom-throughs on the thigh (OUT keeps zooming in while IN starts small and settles).
// Deterministic: everything from t (seconds) and remotion random(seed); runner distance/stride integrated at load.
import {random} from 'remotion';
import B from './beats.json';

export const AMBER = '#FFB23F';
const AM = [255, 178, 63], CREAM = [255, 240, 200], RED = [255, 77, 94];
const FPS = 30, TT = B.total;
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sm = (a, b, x) => { const u = cl((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const lerp = (a, b, u) => a + (b - a) * u;
const R = (s) => random(s);
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (c1, c2, u) => [lerp(c1[0], c2[0], u), lerp(c1[1], c2[1], u), lerp(c1[2], c2[2], u)];
// keyframes [[t, v], ...] smooth between keys
const kf = (t, ks) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], sm(ks[i - 1][0], ks[i][0], t));
  return ks[ks.length - 1][1];
};
const kfz = (t, ks) => Math.exp(kf(t, ks.map(([a, b]) => [a, Math.log(b)])));

// ---------- the one timeline ----------
export const T = {
  in1: B.e0 + 0.08, rip: B.l1 + 0.05, burst: B.fuel + 0.32, out1: B.heart - 0.32, in2: B.why + 0.8, out2: B.slow + 0.72,
};
const HW = 0.42; // half-width of a zoom-through
const thru = (t, c) => cl((t - (c - HW)) / (2 * HW)); // 0..1 across a passage
// how much of IN is visible
export const inside = (t) => {
  if (t < T.in1 - HW) return 0;
  if (t < T.in1 + HW) return sm(0.3, 0.7, thru(t, T.in1));
  if (t < T.out1 - HW) return 1;
  if (t < T.out1 + HW) return 1 - sm(0.3, 0.7, thru(t, T.out1));
  if (t < T.in2 - HW) return 0;
  if (t < T.in2 + HW) return sm(0.3, 0.7, thru(t, T.in2));
  if (t < T.out2 - HW) return 1;
  if (t < T.out2 + HW) return 1 - sm(0.3, 0.7, thru(t, T.out2));
  return 0;
};
// zoom multipliers for the passages: OUT dives x6 into the thigh, IN grows from 1/6
const K = Math.log(6);
const outZm = (t) => Math.exp(K * (thru(t, T.in1) * (t < T.out1 ? 1 : 0) + (t >= T.out1 - HW && t < T.in2 - HW ? 1 - thru(t, T.out1) : 0) + (t >= T.in2 - HW && t < T.out2 - HW ? thru(t, T.in2) : 0) + (t >= T.out2 - HW ? 1 - thru(t, T.out2) : 0)));
const inZm = (t) => Math.exp(-K * (t < T.out1 - HW ? 1 - thru(t, T.in1) : t < T.in2 - HW ? thru(t, T.out1) : t < T.out2 - HW ? 1 - thru(t, T.in2) : thru(t, T.out2)));

// ---------- runner kinematics (integrated once) ----------
const slowmo = (t) => kf(t, [[0.9, 1], [2.7, 0.14], [T.in1 + 1, 0.14], [T.out1 - 0.5, 0.4], [T.in2, 0.4], [T.out2, 0.3], [B.l8 + 0.3, 1],
  [B.reason, 1], [B.grow - 0.2, 0.3], [B.e9 + 0.1, 0.3], [B.l10 + 0.3, 1]]);
const baseV = (t) => kf(t, [[0, 1050], [T.out1 - 1, 1050], [T.out1, 800], [T.out2 - 0.3, 800], [T.out2 + 0.2, 380], [B.l8 + 0.4, 380],
  [B.threshold + 0.4, 1300], [B.training, 1150], [B.pushes, 1050], [B.e9, 900], [B.l10 + 0.2, 380], [B.fuel2 + 0.3, 380], [B.fit + 0.4, 1000], [TT, 1000]]);
const baseC = (t) => kf(t, [[0, 1.62], [T.out1 - 1, 1.62], [T.out1, 1.4], [T.out2 - 0.3, 1.4], [T.out2 + 0.2, 0.95], [B.l8 + 0.4, 0.95],
  [B.threshold + 0.4, 1.8], [B.training, 1.6], [B.l10, 1.5], [TT, 1.5]]);
const NF = Math.ceil(TT * FPS) + 2;
const XS = new Float64Array(NF), PS = new Float64Array(NF);
for (let i = 1; i < NF; i++) {
  const t = (i - 0.5) / FPS, s = slowmo(t);
  XS[i] = XS[i - 1] + s * baseV(t) / FPS; PS[i] = PS[i - 1] + s * baseC(t) / FPS;
}
const at = (arr, t) => { const f = cl(t * FPS, 0, NF - 1.001), i = Math.floor(f); return lerp(arr[i], arr[i + 1], f - i); };
export const runX = (t) => at(XS, t);
const runPh = (t) => at(PS, t) + 0.15;

// threshold: where the ribbon bends (world x), moved further by training
const xT0 = runX(B.piles + 0.35), xT1 = runX(B.reason) + 900;
const xThr = (t) => lerp(xT0, xT1, sm(B.pushes + 0.1, B.reason - 0.1, t));
const RIB_W = runX(B.threshold) - xT0;
// the ribbon is drawn compressed behind the runner (distance x0.2), so the whole run and the bend stay in frame
const KR = 0.2;
const mapX = (x, t) => runX(t) - (runX(t) - x) * KR;
const lvlAtX = (x, xt) => 0.1 + 0.72 * Math.pow(cl((x - xt) / RIB_W), 1.5);
// lactate level in the body (0..1): low and flat, then piling up past the threshold; cleared after training
const bodyLevel = (t) => {
  if (t < B.l8) return 0;
  const l = lvlAtX(runX(t), xThr(t)) * sm(B.l8, B.l8 + 0.6, t);
  return t > B.reason ? lerp(l, 0.1, sm(B.reason, B.reason + 0.6, t)) : l;
};

// ---------- pose ----------
const LT = 190, LS = 186, LTOR = 235;
function pose(t) {
  const ph = runPh(t), x = runX(t);
  const slump = sm(T.out2 - 0.3, T.out2 + 0.3, t) * (1 - sm(B.l8 + 0.3, B.l8 + 1.6, t));
  const amp = 0.58 - 0.2 * slump, lean = 0.2 - 0.12 * slump + 0.05 * sm(B.l8 + 1, B.threshold, t) * (1 - sm(B.training, B.pushes, t));
  const hip = {x, y: 984 + 13 * Math.cos(4 * Math.PI * ph) + 22 * slump};
  const leg = (p) => {
    const a = amp * Math.sin(2 * Math.PI * p), k = 0.15 + (1.25 * amp / 0.58) * Math.pow(Math.max(0, Math.cos(2 * Math.PI * p - 0.3)), 1.4);
    const knee = {x: hip.x + LT * Math.sin(a), y: hip.y + LT * Math.cos(a)}, b = a - k;
    const ank = {x: knee.x + LS * Math.sin(b), y: knee.y + LS * Math.cos(b)};
    const toe = {x: ank.x + 46 * Math.cos(b - 0.2), y: ank.y - 46 * Math.sin(b - 0.2)};
    return {hip, knee, ank, toe};
  };
  const sh = {x: hip.x + LTOR * Math.sin(lean), y: hip.y - LTOR * Math.cos(lean)};
  const arm = (p) => {
    const a = -0.85 * (amp / 0.58) * Math.sin(2 * Math.PI * p);
    const el = {x: sh.x + 135 * Math.sin(a), y: sh.y + 135 * Math.cos(a)}, b = a + 1.55;
    return {sh, el, hand: {x: el.x + 120 * Math.sin(b), y: el.y + 120 * Math.cos(b)}};
  };
  const neck = {x: sh.x + 28 * Math.sin(lean), y: sh.y - 28 * Math.cos(lean)};
  const head = {x: neck.x + 58 * Math.sin(lean + 0.1), y: neck.y - 58 * Math.cos(lean + 0.1)};
  const nl = leg(ph), fl = leg(ph + 0.5);
  return {ph, hip, sh, neck, head, lean, nl, fl, na: arm(ph + 0.5), fa: arm(ph), slump,
    thigh: {x: (hip.x + nl.knee.x) / 2, y: (hip.y + nl.knee.y) / 2}, heart: {x: lerp(hip.x, sh.x, 0.78) + 18, y: lerp(hip.y, sh.y, 0.78) + 4}};
}

// ---------- helpers ----------
function glow(ctx, x, y, r, c, a) {
  if (a <= 0.003 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(c, a)); g.addColorStop(0.35, rgba(c, a * 0.45)); g.addColorStop(1, rgba(c, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
const line = (ctx, a, b) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
let GRAIN = null;
function grain() {
  if (GRAIN) return GRAIN;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), im = g.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const v = (R('g' + i) * 255) | 0; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0); GRAIN = c; return c;
}

// ---------- shared props ----------
function lantern(ctx, x, y, s, a = 1, hot = 0) {
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, x, y, 58 * s, AM, 0.5 * a);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a;
  ctx.fillStyle = rgba(mix(AM, [255, 225, 150], hot), 1);
  ctx.beginPath(); ctx.ellipse(x, y, 17 * s, 20 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,236,190,0.9)'; ctx.beginPath(); ctx.ellipse(x - 4 * s, y - 5 * s, 6 * s, 8 * s, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(170,90,20,0.55)'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.ellipse(x, y, 7 * s, 20 * s, 0, 0, 7); ctx.stroke();
  ctx.fillStyle = 'rgba(110,50,30,0.9)'; rrect(ctx, x - 7 * s, y - 25 * s, 14 * s, 6 * s, 2 * s); ctx.fill();
  ctx.globalAlpha = 1;
}
function cube(ctx, x, y, s, rot = 0, face = 0, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a;
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, 46 * s, [255, 250, 235], 0.22); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#FFF8EC'; rrect(ctx, -20 * s, -20 * s, 40 * s, 40 * s, 8 * s); ctx.fill();
  ctx.strokeStyle = 'rgba(190,175,170,0.9)'; ctx.lineWidth = 2.5 * s; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; rrect(ctx, -14 * s, -15 * s, 12 * s, 6 * s, 3 * s); ctx.fill();
  if (face) {
    ctx.fillStyle = '#2b2236';
    ctx.beginPath(); ctx.arc(-7 * s, -3 * s, 3 * s, 0, 7); ctx.arc(7 * s, -3 * s, 3 * s, 0, 7); ctx.fill();
    ctx.strokeStyle = '#2b2236'; ctx.lineWidth = 2.2 * s; ctx.beginPath(); ctx.arc(0, 4 * s, 6 * s, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,140,150,0.6)'; ctx.beginPath(); ctx.arc(-12 * s, 5 * s, 3 * s, 0, 7); ctx.arc(12 * s, 5 * s, 3 * s, 0, 7); ctx.fill();
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
// half a cube (top or bottom), whitening to amber with u (lactate), rounding into a lantern
function half(ctx, x, y, s, top, rot, amber = 0, face = 0, a = 1) {
  if (amber >= 0.999) return lantern(ctx, x, y, s * 0.8, a);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a;
  const c = mix([255, 248, 236], AM, amber);
  if (amber > 0) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, 44 * s, AM, 0.45 * amber); ctx.globalCompositeOperation = 'source-over'; }
  ctx.fillStyle = rgba(c, 1); rrect(ctx, -20 * s, -10 * s, 40 * s, 20 * s, (5 + 6 * amber) * s); ctx.fill();
  ctx.strokeStyle = rgba(mix([190, 175, 170], [170, 90, 20], amber), 0.9); ctx.lineWidth = 2.2 * s; ctx.stroke();
  if (face) {
    ctx.fillStyle = '#2b2236';
    if (top) { ctx.beginPath(); ctx.arc(-7 * s, 1 * s, 3 * s, 0, 7); ctx.arc(7 * s, 1 * s, 3 * s, 0, 7); ctx.fill(); }
    else { ctx.beginPath(); ctx.ellipse(0, -1 * s, 4 * s, 4.5 * s, 0, 0, 7); ctx.fill(); }
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
function spark(ctx, x, y, s, a, c = CREAM) {
  if (a <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, x, y, 60 * s, c, 0.6 * a);
  ctx.strokeStyle = rgba(c, a); ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const an = i * Math.PI / 4 + 0.4; ctx.beginPath(); ctx.moveTo(x - Math.cos(an) * 26 * s, y - Math.sin(an) * 26 * s); ctx.lineTo(x + Math.cos(an) * 26 * s, y + Math.sin(an) * 26 * s); ctx.stroke(); }
  ctx.globalCompositeOperation = 'source-over';
}
// the tiny engine (one design for the whole film): bean, glowing stripes, rotor
function engine(ctx, x, y, s, t, act, flash = 0, amberFlash = 0, seed = 0) {
  const spin = (0.7 + 5 * act) * t * 2 * Math.PI + seed * 7;
  const sh = act > 0.6 ? 3.5 * (act - 0.6) / 0.4 * Math.sin(t * 71 + seed * 13) : 0;
  ctx.save(); ctx.translate(x + sh, y + sh * 0.6); ctx.scale(s, s);
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, 0, 0, 190, [255, 220, 170], 0.16 + 0.22 * act + 0.4 * flash);
  if (amberFlash > 0) glow(ctx, 0, 0, 230, AM, 0.75 * amberFlash);
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath(); ctx.ellipse(0, 0, 122, 64, 0, 0, 7);
  ctx.fillStyle = 'rgba(120,58,70,0.85)'; ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(255,214,186,0.85)'; ctx.stroke();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = rgba(mix([255, 226, 190], AM, amberFlash * 0.8), 0.45 + 0.45 * act + 0.3 * flash); ctx.lineWidth = 9;
  for (let i = -3; i <= 2; i++) {
    ctx.beginPath();
    for (let k = 0; k <= 12; k++) { const yy = -60 + k * 10, xx = i * 30 + 8 * Math.sin(k * 1.3 + i); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.stroke();
  }
  ctx.restore();
  // door (left) and rotor (right)
  ctx.fillStyle = 'rgba(60,24,40,0.9)'; ctx.beginPath(); ctx.ellipse(-112, 0, 14, 24, 0, 0, 7); ctx.fill();
  ctx.translate(104, -38);
  ctx.fillStyle = 'rgba(70,30,46,0.95)'; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,214,186,0.9)'; ctx.lineWidth = 4; ctx.stroke();
  if (act > 0.5) { ctx.fillStyle = `rgba(255,236,210,${0.25 * act})`; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,236,210,0.95)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const an = spin + i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * 24, Math.sin(an) * 24); ctx.stroke(); }
  ctx.restore();
}
function steam(ctx, x, y, s, t, seed) {
  for (let i = 0; i < 4; i++) {
    const u = ((t * 2.2 + i * 0.25 + seed * 0.37) % 1);
    ctx.fillStyle = `rgba(255,245,235,${0.45 * (1 - u)})`;
    ctx.beginPath(); ctx.arc(x + 104 * s + 30 * u * s * Math.sin(seed + i), y - 70 * s - 120 * u * s, (12 + 26 * u) * s, 0, 7); ctx.fill();
  }
}
function bag(ctx, x, y, s, t, a = 1, label = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
  ctx.fillStyle = '#17141c'; ctx.strokeStyle = 'rgba(120,118,140,0.9)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-30, -150);
  ctx.bezierCurveTo(-90, -120, -150, -60, -140, 40); ctx.bezierCurveTo(-130, 130, -60, 160, 0, 158);
  ctx.bezierCurveTo(70, 160, 140, 120, 140, 30); ctx.bezierCurveTo(145, -60, 90, -120, 30, -150); ctx.closePath(); ctx.fill(); ctx.stroke();
  // tie
  ctx.beginPath(); ctx.moveTo(-30, -150); ctx.quadraticCurveTo(-60, -200, -20, -205); ctx.quadraticCurveTo(0, -180, 20, -205); ctx.quadraticCurveTo(60, -200, 30, -150); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(-95, -60); ctx.quadraticCurveTo(-115, 10, -90, 80); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(40, -110); ctx.quadraticCurveTo(70, -60, 85, -20); ctx.stroke();
  if (label) {
    ctx.fillStyle = 'rgba(240,236,230,0.92)'; ctx.font = "800 46px 'Hanken Grotesk'"; ctx.textAlign = 'center';
    ctx.save(); ctx.rotate(-0.06); ctx.fillText('LACTIC', 0, 20); ctx.fillText('ACID', 0, 68); ctx.restore();
  }
  ctx.restore(); ctx.globalAlpha = 1;
  // flies
  for (let i = 0; i < 4; i++) {
    const an = t * (2.2 + i * 0.5) + i * 1.7, rx = (190 + 40 * i) * s, ry = (120 + 20 * i) * s;
    const fx = x + Math.cos(an) * rx, fy = y - 120 * s + Math.sin(an * 1.3) * ry;
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(230,235,255,0.55)';
    const fl = Math.sin(t * 90 + i) > 0 ? 1 : 0.5;
    ctx.beginPath(); ctx.ellipse(fx - 4 * s, fy - 7 * s, 7 * s, 4 * s * fl, -0.5, 0, 7); ctx.ellipse(fx + 4 * s, fy - 7 * s, 7 * s, 4 * s * fl, 0.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#121016'; ctx.beginPath(); ctx.arc(fx, fy, 6 * s, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ================= OUT: track + glass runner =================
const outCam = (t, p) => {
  const thighW = kf(t, [[0.9, 0], [3.0, 1], [T.in1 + 1, 1], [T.out1 + 0.1, 1], [T.out1 + 1.0, 0], [T.in2 - 1.1, 0], [T.in2 - 0.3, 1], [T.out2 + 0.1, 1],
    [T.out2 + 1.0, 0], [B.reason, 0], [B.grow - 0.1, 0.85], [B.e9, 0.85], [B.l10 + 0.4, 0]]);
  const oy = kf(t, [[0, 1040], [T.out1, 1040], [T.out1 + 1, 820], [B.again + 0.6, 870], [T.out2 + 0.5, 1000], [B.l8 + 1, 1080], [B.threshold - 0.6, 1000],
    [B.training + 0.4, 1030], [B.l10, 1080], [B.fit, 1060], [TT, 980]]);
  const ox = kf(t, [[0, 40], [T.out1 + 1, 30], [B.again + 0.6, -20], [T.out2 + 0.5, -100], [B.l8 + 1.2, -150], [B.pace - 0.3, -200], [B.threshold + 0.2, 20], [B.pushes, -100],
    [B.reason, 0], [B.l10, 0], [B.l10 + 0.8, 300], [B.trash + 0.3, 360], [B.fuel2 + 0.2, 120], [TT, 150]]);
  const z = kfz(t, [[0, 0.86], [0.9, 0.9], [3.0, 3.1], [T.in1 + 1, 3.1], [T.out1 + 0.4, 2.2], [B.brain, 1.4], [B.again + 0.4, 1.25], [T.in2 - 1.0, 1.35], [T.in2 - 0.3, 2.6],
    [T.out2 + 0.4, 2.0], [B.l8 + 1.2, 0.9], [B.pace - 0.6, 0.82], [B.threshold + 0.4, 0.56], [B.pushes, 0.6], [B.reason + 0.1, 0.9], [B.grow + 0.1, 2.4], [B.e9, 2.6], [B.l10 + 0.8, 0.8],
    [B.fuel2 + 0.2, 0.95], [B.more, 0.88], [TT, 0.55]]) * outZm(t);
  let bx = p.hip.x + ox, by = oy, zz = z;
  // line 9-10: keep the bend (flag) and the runner in one frame
  const thrW = sm(B.pace - 0.9, B.threshold - 0.2, t) * (1 - sm(B.pushes + 0.2, B.reason, t));
  if (thrW > 0) { const xt = mapX(xThr(t), t), sep = Math.max(300, p.hip.x - xt); const L0 = xt - 1000, R0 = p.hip.x + 280; bx = lerp(bx, (L0 + R0) / 2, thrW); zz = lerp(zz, Math.min(zz, 1040 / (R0 - L0)), thrW); }
  return {fx: lerp(bx, p.thigh.x, thighW), fy: lerp(by, p.thigh.y, thighW), z: zz};
};
const dayK = (t) => (t > B.training - 0.2 && t < B.pushes + 1.6) ? Math.pow(Math.sin(Math.PI * sm(B.training - 0.2, B.pushes + 1.6, t) * 2), 2) * 0.95 : 0;
function sky(ctx, t, cam) {
  const d = dayK(t);
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, rgba(mix([38, 36, 92], [96, 160, 222], d), 1));
  g.addColorStop(0.42, rgba(mix([108, 74, 140], [150, 200, 240], d), 1));
  g.addColorStop(0.62, rgba(mix([232, 136, 110], [214, 232, 246], d), 1));
  g.addColorStop(0.8, rgba(mix([255, 196, 140], [240, 246, 250], d), 1));
  g.addColorStop(1, rgba(mix([255, 210, 160], [240, 246, 250], d), 1));
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // stars (dusk), sun low behind
  for (let i = 0; i < 40; i++) {
    const sx = (R('sx' + i) * 1300 - cam.fx * 0.01) % 1080, sy = R('sy' + i) * 700;
    ctx.fillStyle = `rgba(255,250,240,${(0.25 + 0.4 * R('sa' + i)) * (0.6 + 0.4 * Math.sin(t * 2 + i)) * (1 - d)})`;
    ctx.fillRect((sx + 1080) % 1080, sy, 3, 3);
  }
}
// screen y of a world y for a parallax layer p (0 = far, 1 = the runner's plane)
const lay = (cam, p) => {
  const z = Math.pow(cam.z, p), fy = lerp(1080, cam.fy, p), fx = cam.fx * p;
  return {z, X: (x) => (x - fx) * z + 540, Y: (y) => (y - fy) * z + 960};
};
function background(ctx, t, cam) {
  sky(ctx, t, cam);
  const d = dayK(t);
  // sun: sets behind the runner; in the day sweeps it arcs
  {
    const L = lay(cam, 0.08); let sx = L.X(-300), sy = L.Y(1240);
    if (d > 0) { const u = sm(B.training - 0.2, B.pushes + 1.6, t) * 2 % 1; sx = lerp(sx, 140 + 800 * u, Math.min(1, d * 2)); sy = lerp(sy, 900 - 520 * Math.sin(Math.PI * u), Math.min(1, d * 2)); }
    ctx.globalCompositeOperation = 'lighter'; glow(ctx, sx, sy, 520 * L.z, [255, 170, 110], 0.55); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255,226,170,0.95)'; ctx.beginPath(); ctx.arc(sx, sy, 70 * L.z, 0, 7); ctx.fill();
  }
  // far hills
  for (const [p, base, amp, col, sd] of [[0.15, 1235, 90, [92, 62, 120], 'h1'], [0.32, 1268, 60, [70, 48, 98], 'h2']]) {
    const L = lay(cam, p); ctx.fillStyle = rgba(mix(col, [120, 150, 170], d * 0.6), 1); ctx.beginPath(); ctx.moveTo(0, 1920);
    for (let sx = -20; sx <= 1100; sx += 40) {
      const wx = (sx - 540) / L.z + cam.fx * p;
      const h = amp * (0.5 + 0.3 * Math.sin(wx * 0.0021 + 1) + 0.2 * Math.sin(wx * 0.0057 + 3));
      ctx.lineTo(sx, L.Y(base - h));
    }
    ctx.lineTo(1100, 1920); ctx.fill();
  }
  // stadium light towers (mid layer) with warm glows
  {
    const L = lay(cam, 0.45), sp = 1700;
    const first = Math.floor((cam.fx * 0.45 - 540 / L.z) / sp) - 1;
    for (let k = first; k < first + 4; k++) {
      const wx = k * sp + 400, x = L.X(wx), y0 = L.Y(1290), y1 = L.Y(820);
      ctx.strokeStyle = 'rgba(52,38,74,0.95)'; ctx.lineWidth = 9 * L.z; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
      ctx.fillStyle = 'rgba(52,38,74,0.95)'; ctx.fillRect(x - 46 * L.z, y1 - 26 * L.z, 92 * L.z, 30 * L.z);
      ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y1 - 10 * L.z, 220 * L.z, [255, 214, 160], 0.38 * (1 - d)); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(255,236,200,${0.9 - 0.5 * d})`; ctx.fillRect(x - 40 * L.z, y1 - 22 * L.z, 80 * L.z, 14 * L.z);
    }
  }
}
function track(ctx, t, cam) {
  const L = lay(cam, 1), d = dayK(t);
  const yG = L.Y(1268), yT = L.Y(1350), yB = L.Y(1600);
  ctx.fillStyle = rgba(mix([54, 70, 74], [96, 140, 110], d), 1); ctx.fillRect(0, yG, 1080, yT - yG); // infield
  const g = ctx.createLinearGradient(0, yT, 0, yB);
  g.addColorStop(0, rgba(mix([168, 78, 66], [196, 104, 82], d), 1)); g.addColorStop(1, rgba(mix([120, 52, 54], [170, 86, 70], d), 1));
  ctx.fillStyle = g; ctx.fillRect(0, yT, 1080, yB - yT);
  ctx.fillStyle = rgba(mix([40, 52, 56], [80, 120, 96], d), 1); ctx.fillRect(0, yB, 1080, 1920 - yB);
  // lane lines + distance ticks
  ctx.strokeStyle = 'rgba(255,240,230,0.42)'; ctx.lineWidth = Math.max(1, 5 * L.z);
  for (const wy of [1352, 1440, 1525]) { ctx.beginPath(); ctx.moveTo(0, L.Y(wy)); ctx.lineTo(1080, L.Y(wy)); ctx.stroke(); }
  const sp = 420, x0 = Math.floor((cam.fx - 540 / L.z) / sp) - 1;
  for (let k = x0; k < x0 + 1080 / L.z / sp + 3; k++) {
    const x = L.X(k * sp); ctx.fillStyle = 'rgba(255,240,230,0.35)';
    ctx.fillRect(x, L.Y(1440), 60 * L.z, 7 * L.z); ctx.fillRect(x + 140 * L.z, L.Y(1525), 60 * L.z, 7 * L.z);
  }
}
// the glowing path on the track ahead (fuel lights the way: line 2 and the ending)
function pathLight(ctx, cam, x0, a) {
  if (a <= 0) return;
  const L = lay(cam, 1);
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 9; k++) { ctx.save(); ctx.translate(L.X(x0 + k * 300), L.Y(1440)); ctx.scale(1, 0.25); glow(ctx, 0, 0, 420 * L.z, AM, 0.3 * a * (1 - k / 9)); ctx.restore(); }
  ctx.globalCompositeOperation = 'source-over';
}
const ENG_SLOTS = Array.from({length: 30}, (_, i) => ({limb: ['nt', 'tor', 'ns', 'na', 'nt', 'tor', 'ft'][i % 7], u: 0.18 + 0.64 * R('eu' + i), off: (R('eo' + i) - 0.5) * 34, rot: R('er' + i) * 6}));
const engCount = (t) => Math.round(kf(t, [[B.training, 3], [B.training + 0.4, 3], [B.pushes + 1.6, 12], [B.grow, 13], [B.grow + 1.4, 30]]));
function limbPt(p, limb, u) {
  const [a, b] = limb === 'nt' ? [p.hip, p.nl.knee] : limb === 'ns' ? [p.nl.knee, p.nl.ank] : limb === 'ft' ? [p.hip, p.fl.knee] : limb === 'na' ? [p.na.sh, p.na.el] : [p.hip, p.sh];
  return {x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), an: Math.atan2(b.y - a.y, b.x - a.x)};
}
// a mini engine for the body (same design, small)
const miniEngine = (ctx, x, y, s, t, an, fl, seed) => { ctx.save(); ctx.translate(x, y); ctx.rotate(an); engine(ctx, 0, 0, s, t, 0.3, 0, fl, seed); ctx.restore(); };

function runner(ctx, t, p, o) {
  const RIM = [255, 226, 204], GL = 'rgba(44,38,84,0.80)';
  const gold = o.gold || 0;
  const limb = (a, b, w, rim) => {
    ctx.lineCap = 'round'; ctx.strokeStyle = rim; ctx.lineWidth = w; line(ctx, a, b);
  };
  const group = (segs, near) => {
    for (const [a, b, w] of segs) limb(a, b, w + 9, rgba(mix(RIM, AM, gold), near ? 0.9 : 0.5));
    for (const [a, b, w] of segs) limb(a, b, w, near ? GL : 'rgba(36,30,70,0.86)');
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    for (const [a, b, w] of segs) { ctx.lineWidth = w * 0.16; const n = Math.atan2(b.y - a.y, b.x - a.x) - Math.PI / 2; const dx = Math.cos(n) * w * 0.26, dy = Math.sin(n) * w * 0.26; line(ctx, {x: a.x + dx, y: a.y + dy}, {x: b.x + dx, y: b.y + dy}); }
  };
  // far side
  group([[p.fa.sh, p.fa.el, 44], [p.fa.el, p.fa.hand, 38], [p.fl.hip, p.fl.knee, 76], [p.fl.knee, p.fl.ank, 58], [p.fl.ank, p.fl.toe, 32]], false);
  // torso + head
  group([[p.hip, p.sh, 112], [p.sh, p.neck, 46]], true);
  ctx.beginPath(); ctx.arc(p.head.x, p.head.y, 60, 0, 7); ctx.fillStyle = rgba(mix(RIM, AM, gold), 0.9); ctx.fill();
  ctx.beginPath(); ctx.arc(p.head.x, p.head.y, 55.5, 0, 7); ctx.fillStyle = GL; ctx.fill();
  // lactate level inside the torso (amber fill, sloshing)
  const lv = o.level || 0;
  if (lv > 0.01) {
    ctx.save(); ctx.translate(p.hip.x, p.hip.y); ctx.rotate(p.lean);
    rrect(ctx, -52, -LTOR - 50, 104, LTOR + 100, 52); ctx.clip();
    const top = 50 - (LTOR + 100) * lv, wob = 8 * Math.sin(t * 9);
    ctx.fillStyle = 'rgba(255,170,60,0.62)'; ctx.beginPath(); ctx.moveTo(-60, 60); ctx.lineTo(-60, top + wob); ctx.quadraticCurveTo(0, top - wob * 1.5, 60, top - wob); ctx.lineTo(60, 60); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, top + 40, 120, AM, 0.5 * lv); ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }
  // vessels + organs
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,96,110,0.55)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(p.heart.x, p.heart.y); ctx.lineTo(lerp(p.hip.x, p.sh.x, 0.3) + 10, lerp(p.hip.y, p.sh.y, 0.3)); ctx.lineTo(p.hip.x + 8, p.hip.y); ctx.lineTo(p.nl.knee.x, p.nl.knee.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(p.heart.x, p.heart.y); ctx.lineTo(p.neck.x + 4, p.neck.y); ctx.lineTo(p.head.x, p.head.y + 6); ctx.stroke();
  // heart
  {
    const g = o.heartGulp || 0, s = 1 + 0.35 * Math.sin(Math.PI * cl(g)) - 0.12 * Math.sin(2 * Math.PI * cl(g)) + 0.05 * Math.sin(t * 8);
    ctx.save(); ctx.translate(p.heart.x, p.heart.y); ctx.scale(s * 1.05, s / 1.05 * (1 + 0.1 * Math.sin(Math.PI * cl(g)) ));
    ctx.fillStyle = 'rgba(232,82,104,0.95)'; ctx.beginPath(); ctx.moveTo(0, 20);
    ctx.bezierCurveTo(-34, -2, -22, -32, 0, -14); ctx.bezierCurveTo(22, -32, 34, -2, 0, 20); ctx.fill();
    ctx.restore();
    if (o.heartFlare) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, p.heart.x, p.heart.y, 120, AM, 0.8 * o.heartFlare); ctx.globalCompositeOperation = 'source-over'; }
  }
  // brain
  ctx.fillStyle = 'rgba(240,150,170,0.75)';
  ctx.beginPath(); ctx.ellipse(p.head.x + 4, p.head.y - 8, 36, 26, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(160,70,100,0.7)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(p.head.x - 22, p.head.y - 12); ctx.quadraticCurveTo(p.head.x - 6, p.head.y - 26, p.head.x + 6, p.head.y - 8); ctx.quadraticCurveTo(p.head.x + 18, p.head.y + 6, p.head.x + 28, p.head.y - 10); ctx.stroke();
  if (o.brainFlare) {
    ctx.globalCompositeOperation = 'lighter'; glow(ctx, p.head.x, p.head.y - 8, 130, AM, 0.75 * o.brainFlare); ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 6; i++) { const an = i * 1.05 + t * 1.5, r = 70 + 20 * Math.sin(t * 5 + i); spark(ctx, p.head.x + Math.cos(an) * r, p.head.y - 8 + Math.sin(an) * r, 0.35, o.brainFlare * (0.5 + 0.5 * Math.sin(t * 9 + i * 2))); }
  }
  // eye
  ctx.fillStyle = 'rgba(255,240,230,0.95)'; ctx.beginPath(); ctx.arc(p.head.x + 34, p.head.y - 4, 6, 0, 7); ctx.fill();
  if (o.sweat) for (let i = 0; i < 5; i++) {
    const u = (t * 2.6 + i * 0.2) % 1; const x = p.head.x - 30 - 140 * u, y = p.head.y - 30 + 60 * u * u - 30 * u;
    ctx.fillStyle = `rgba(200,230,255,${0.8 * (1 - u) * o.sweat})`; ctx.beginPath(); ctx.ellipse(x, y, 7, 10, 0.6, 0, 7); ctx.fill();
  }
  // near leg: muscle stripes inside the glass thigh (the place we dive into)
  group([[p.nl.hip, p.nl.knee, 80], [p.nl.knee, p.nl.ank, 60], [p.nl.ank, p.nl.toe, 34]], true);
  {
    const a = p.hip, b = p.nl.knee, an = Math.atan2(b.y - a.y, b.x - a.x);
    ctx.save(); ctx.translate(p.thigh.x, p.thigh.y); ctx.rotate(an);
    rrect(ctx, -LT / 2 - 10, -36, LT + 20, 72, 36); ctx.clip();
    ctx.strokeStyle = 'rgba(232,120,140,0.33)'; ctx.lineWidth = 6;
    for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(-LT / 2, k * 10); ctx.lineTo(LT / 2, k * 10); ctx.stroke(); }
    if (o.thighBag > 0) bag(ctx, 0, 4, 0.24 * o.thighBag, t, 1, false);
    ctx.restore();
    if (o.thighBag > 0) bag(ctx, p.thigh.x, p.thigh.y + 4, 0.24, t, 0, false); // flies only (alpha 0 body)
  }
  // tiny engines in the body (training)
  const n = o.engines || 0;
  for (let i = 0; i < n; i++) {
    const sl = ENG_SLOTS[i], q = limbPt(p, sl.limb, sl.u), born = i < 3 ? -9 : kf(i, [[3, B.training + 0.3], [12, B.pushes + 1.6], [13, B.grow], [30, B.grow + 1.4]]);
    const pop = cl((t - born) / 0.25), s = 0.1 * (pop < 1 ? Math.sin(pop * Math.PI * 0.5) * (1 + 0.4 * Math.sin(pop * Math.PI)) : 1);
    const nx = Math.cos(q.an + Math.PI / 2) * sl.off, ny = Math.sin(q.an + Math.PI / 2) * sl.off;
    miniEngine(ctx, q.x + nx, q.y + ny, s, t, q.an + sl.rot * 0.2, o.eatFlash ? o.eatFlash(i) : 0, i);
  }
  // near arm (with an "other muscles" glow)
  group([[p.na.sh, p.na.el, 46], [p.na.el, p.na.hand, 40]], true);
  if (o.armFlare) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, (p.na.sh.x + p.na.el.x) / 2, (p.na.sh.y + p.na.el.y) / 2, 120, AM, 0.75 * o.armFlare); ctx.globalCompositeOperation = 'source-over'; }
  if (gold > 0) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, p.hip.x, p.hip.y - 100, 520, AM, 0.4 * gold); ctx.globalCompositeOperation = 'source-over'; }
}
// lanterns flowing along a polyline (body vessels)
function flowAlong(ctx, pts, t, rate, n, a, s = 0.55, seed = 0) {
  const segL = [], tot = pts.slice(1).reduce((acc, q, i) => { const l = Math.hypot(q.x - pts[i].x, q.y - pts[i].y); segL.push(l); return acc + l; }, 0);
  for (let k = 0; k < n; k++) {
    let d = (((t * rate + k / n + seed) % 1) + 1) % 1 * tot, i = 0;
    while (i < segL.length - 1 && d > segL[i]) { d -= segL[i]; i++; }
    const u = d / segL[i], x = lerp(pts[i].x, pts[i + 1].x, u), y = lerp(pts[i].y, pts[i + 1].y, u);
    const edge = Math.min(1, 6 * Math.min(((t * rate + k / n + seed) % 1 + 1) % 1, 1 - (((t * rate + k / n + seed) % 1) + 1) % 1));
    lantern(ctx, x, y, s, a * edge);
  }
}
function drawOut(ctx, t) {
  const p = pose(t), cam = outCam(t, p);
  background(ctx, t, cam);
  const L = lay(cam, 1);
  ctx.save();
  // world transform for the runner's plane
  track(ctx, t, cam);
  pathLight(ctx, cam, p.hip.x + 100, sm(B.fuel2 + 0.2, B.fit, t));
  ctx.translate(540, 960); ctx.scale(L.z, L.z); ctx.translate(-cam.fx, -cam.fy);
  // speed streaks on the track
  const v = 0.0 + (t < 2.4 ? 1 : 0) * (1 - sm(1.2, 2.4, t)) + sm(B.piles, B.threshold, t) * (1 - sm(B.training, B.pushes, t));
  if (v > 0) for (let i = 0; i < 14; i++) {
    const y = 1365 + R('sy' + i) * 220, x = p.hip.x - 900 + ((R('sx' + i) * 3000 - t * 2600) % 2200 + 2200) % 2200;
    ctx.fillStyle = `rgba(255,240,230,${0.28 * v})`; ctx.fillRect(x, y, 260, 5);
  }
  // threshold ribbon + flag (lines 9-11)
  if (t > B.l8) {
    const x0 = runX(B.l8 + 0.2), xr = p.hip.x - 30, xt = xThr(t);
    const rib = (xt2, alpha, w, dash) => {
      ctx.beginPath();
      for (let x = x0; x <= xr; x += 100) { const y = 1335 - lvlAtX(x, xt2) * 540, X = mapX(x, t); x === x0 ? ctx.moveTo(X, y) : ctx.lineTo(X, y); }
      ctx.setLineDash(dash); ctx.strokeStyle = rgba(AM, alpha); ctx.lineWidth = w; ctx.stroke(); ctx.setLineDash([]);
    };
    const ghost = sm(B.pushes, B.pushes + 0.5, t);
    if (ghost > 0) rib(xT0, 0.35 * ghost, 8, [30, 26]);
    ctx.globalCompositeOperation = 'lighter'; rib(xt, 0.25, 40, []); ctx.globalCompositeOperation = 'source-over';
    rib(xt, 0.95, 12, []);
    // flag
    const flagA = 1 - sm(B.e9, B.l10 + 0.3, t), plant = sm(B.threshold - 0.25, B.threshold + 0.1, t), lift = Math.sin(Math.PI * sm(B.pushes + 0.1, B.reason - 0.1, t));
    if (plant > 0 && xr > xT0 && flagA > 0) { ctx.globalAlpha = flagA;
      const fx = mapX(xt, t), fy = 1340 - 320 * (1 - plant) - 140 * lift;
      ctx.save(); ctx.translate(fx, fy); ctx.scale(1.5, 1.5); ctx.translate(-fx, -fy);
      ctx.strokeStyle = 'rgba(255,240,230,0.95)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - 560); ctx.stroke();
      const wv = Math.sin(t * 6) * 10;
      ctx.fillStyle = 'rgba(40,30,70,0.92)'; ctx.beginPath(); ctx.moveTo(fx, fy - 560); ctx.quadraticCurveTo(fx - 300, fy - 560 + wv, fx - 640, fy - 545); ctx.lineTo(fx - 640, fy - 345); ctx.quadraticCurveTo(fx - 300, fy - 360 - wv, fx, fy - 360); ctx.fill();
      ctx.strokeStyle = rgba(AM, 0.9); ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = AMBER; ctx.font = "800 82px 'Hanken Grotesk'"; ctx.textAlign = 'left';
      ctx.fillText('your lactate', fx - 610, fy - 472); ctx.fillText('threshold', fx - 610, fy - 388); ctx.globalAlpha = 1; ctx.restore();
    }
  }
  // the trash bin by the track (line 11)
  const Xb = runX(B.fuel2 + 0.05) + 330;
  if (t > B.l10 - 0.5) {
    const tip = sm(B.trash - 0.1, B.trash + 0.45, t);
    ctx.save(); ctx.translate(Xb + 60, 1330); ctx.rotate(-1.25 * tip);
    ctx.fillStyle = 'rgba(128,150,160,1)'; rrect(ctx, -120, -260, 120, 260, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(235,240,245,0.85)'; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = 'rgba(90,104,116,0.9)'; ctx.lineWidth = 5; for (const xx of [-90, -60, -30]) { ctx.beginPath(); ctx.moveTo(xx, -230); ctx.lineTo(xx, -30); ctx.stroke(); }
    ctx.fillStyle = 'rgba(150,172,182,1)'; rrect(ctx, -132, -280, 144, 30, 10); ctx.fill();
    ctx.restore();
    const out = sm(B.trash + 0.1, B.trash + 0.6, t);
    for (let i = 0; i < 6 && t > B.trash; i++) { const u = (t - B.trash) * (0.8 + 0.15 * i), an = i * 1.1 + Math.sin(t * 7 + i);
      const fx = Xb - 60 + Math.cos(an) * 160 * u + 40 * Math.sin(t * 9 + i), fy = 1100 - 120 * u + 30 * Math.sin(t * 11 + i * 2);
      if (u < 2.5) { ctx.fillStyle = '#121016'; ctx.beginPath(); ctx.arc(fx, fy, 7, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(230,235,255,0.6)'; ctx.beginPath(); ctx.ellipse(fx, fy - 9, 9, 4, 0, 0, 7); ctx.fill(); } }
    if (out < 1) { const bx = lerp(Xb, Xb - 120, out), by = lerp(1010, 1230, out); ctx.globalCompositeOperation = 'lighter'; glow(ctx, bx, by, 160, [200, 200, 230], 0.18); ctx.globalCompositeOperation = 'source-over'; bag(ctx, bx, by, 0.6, t, 1 - sm(B.trash + 0.5, B.trash + 0.8, t), true); }
    // the amber drop rolls out to the runner and is scooped into the body
    const scoop = B.fuel2 + 0.12;
    if (t > B.trash + 0.4 && t < scoop + 0.45) {
      const r = sm(B.trash + 0.4, scoop, t), up = sm(scoop, scoop + 0.4, t);
      const x = lerp(lerp(Xb - 60, p.nl.toe.x + 40, r), p.heart.x, up), y = lerp(1300 - 30 * Math.abs(Math.sin(r * 9)), p.heart.y + 60, up);
      lantern(ctx, x, y, 1.5 * (1 - 0.5 * up), 1);
    }
  }
  // the runner
  const heartG = (t - B.heart - 0.15) / 0.6, eatF = (i) => (t > B.fit ? Math.max(0, Math.sin((t - B.fit) * 4 + i * 1.7)) * 0.9 : 0);
  const body = t > T.out1 - 0.6 && t < T.in2 + 0.5;
  const f1 = (b) => sm(b, b + 0.25, t) * (1 - 0.5 * sm(b + 0.6, b + 1.4, t)) + sm(B.again, B.again + 0.3, t) * 0.5;
  runner(ctx, t, p, {
    thighBag: t < T.in1 + 0.5 ? 1 : 0, sweat: t < 2.8 ? 1 : sm(B.threshold - 0.5, B.threshold, t) * (1 - sm(B.training, B.pushes, t)),
    level: bodyLevel(t), engines: t > B.training - 0.2 ? engCount(t) : (t > B.l8 ? 3 : 0), eatFlash: eatF,
    heartGulp: body ? heartG : 0, heartFlare: body ? f1(B.heart) : 0, brainFlare: body ? f1(B.brain) : 0, armFlare: body ? f1(B.muscles) : 0,
    gold: sm(B.fuel2 + 0.3, B.fuel2 + 0.7, t) * (0.6 + 0.4 * sm(B.fit, B.more, t)),
  });
  // ending: an amber spark trail behind the gold runner (fuel burning)
  const trail = sm(B.fuel2 + 0.3, B.fuel2 + 0.8, t);
  if (trail > 0) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const u = ((t * 1.4 + i / 26) % 1), q = pose(Math.max(0, t - u * 1.1));
      const x = q.hip.x - 60 + (R('tx' + i) - 0.5) * 120, y = q.hip.y - 120 + (R('ty' + i) - 0.5) * 260 - 80 * u;
      glow(ctx, x, y, 26 * (1 - u) + 8, AM, 0.7 * trail * (1 - u));
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  // body view (line 7): lanterns flow from the thigh up the vessels; heart, brain and arm grab them
  if (body) {
    const a = sm(T.out1 - 0.2, T.out1 + 0.3, t) * (1 - sm(T.in2 - 0.6, T.in2, t));
    const thighPts = [p.nl.knee, {x: p.hip.x + 8, y: p.hip.y}, {x: lerp(p.hip.x, p.sh.x, 0.3) + 10, y: lerp(p.hip.y, p.sh.y, 0.3)}, p.heart];
    flowAlong(ctx, thighPts, t, 0.55, 12, a, 0.5);
    if (t > B.heart - 0.2) flowAlong(ctx, [p.heart, {x: p.neck.x + 4, y: p.neck.y}, {x: p.head.x, y: p.head.y + 6}], t, 0.9, 5, a * sm(B.brain - 0.6, B.brain, t), 0.45, 0.3);
    if (t > B.heart) flowAlong(ctx, [p.heart, p.na.sh, p.na.el], t, 0.9, 5, a * sm(B.muscles - 0.6, B.muscles, t), 0.45, 0.6);
  }
  if (t > B.l8 + 0.4 && t < B.reason) {
    const da = sm(B.l8 + 0.4, B.l8 + 1, t) * (1 - sm(B.pushes, B.reason, t)), mid = {x: lerp(p.hip.x, p.sh.x, 0.45), y: lerp(p.hip.y, p.sh.y, 0.45)};
    flowAlong(ctx, [mid, p.heart], t, 0.8, 2, da, 0.42, 0.1);
    flowAlong(ctx, [p.heart, {x: p.neck.x + 4, y: p.neck.y}, {x: p.head.x, y: p.head.y + 6}], t, 0.7, 3, da, 0.42, 0.4);
    flowAlong(ctx, [p.heart, p.na.sh, p.na.el], t, 0.7, 3, da, 0.42, 0.7);
  }
  // lanterns rising from the legs into the body (lines 9-11: production vs use)
  if (t > B.l8 + 0.3) {
    const rate = 0.6 + 1.6 * sm(B.l8, B.threshold, t);
    flowAlong(ctx, [p.nl.ank, p.nl.knee, p.hip, {x: lerp(p.hip.x, p.sh.x, 0.4), y: lerp(p.hip.y, p.sh.y, 0.4)}], t, rate * 0.5, Math.round(3 + 4 * sm(B.l8, B.threshold, t)), 0.9 * (1 - sm(B.reason, B.reason + 0.3, t) * 0.6), 0.5);
  }
  ctx.restore();
  const fgA = 1 - sm(0.6, 1.3, cam.z);
  if (fgA > 0) {
    const F = lay(cam, 1.35), sp = 1100, x0 = Math.floor((cam.fx * 1.35 - 700 / F.z) / sp) - 1;
    for (let k = x0; k < x0 + 1400 / F.z / sp + 3; k++) {
      const x = F.X(k * sp), yb = F.Y(1760), w = 70 * F.z;
      ctx.fillStyle = `rgba(28,24,44,${0.92 * fgA})`; rrect(ctx, x - w / 2, F.Y(1530), w, yb - F.Y(1530), w / 2); ctx.fill();
      ctx.fillStyle = `rgba(255,236,214,${0.5 * fgA})`; ctx.fillRect(x - w / 2, F.Y(1565), w, 16 * F.z);
    }
  }
}

// ================= IN: the muscle fibre =================
const BANDS = Array.from({length: 13}, (_, i) => -1680 + 340 * i).filter((y) => y !== 1380); // strand centres
const LANES = BANDS.map((y) => y + 170).filter((y) => y !== 1210 && y < 3000);           // between strands
const CAP = [1100, 1330];                                                                // capillary (blood river)
const MAIN = 870;
const ENG = [];
for (const ly of LANES) {
  const off = ly === MAIN ? 0 : ((ly * 7.3) % 700 + 700) % 700;
  for (let k = -2; k < 7; k++) {
    const x = ly === MAIN ? 1250 + 700 * k : off + 700 * k;
    if (ly === MAIN && x < 1200) continue;
    ENG.push({x, y: ly + (ly === MAIN ? 0 : (R('ey' + x + ly) - 0.5) * 30), s: ly === MAIN ? 1 : 0.85 + 0.2 * R('es' + x + ly), lane: ly, id: ENG.length});
  }
}
const nextEngine = (lane, x) => ENG.filter((e) => e.lane === lane && e.x - 120 > x).sort((a, b) => a.x - b.x)[0];
// fibre beat: footstrikes (calm, frantic, dragging)
const beatRate = (t) => kf(t, [[0, 1.1], [B.runhard, 1.1], [B.runhard + 0.8, 2.4], [T.out1, 2.4], [T.in2, 2.1], [B.together, 2.0], [B.slow + 0.6, 0.7], [TT, 0.7]]);
const BPH = new Float64Array(NF);
for (let i = 1; i < NF; i++) BPH[i] = BPH[i - 1] + beatRate((i - 0.5) / FPS) / FPS;
const squeeze = (t) => Math.pow(Math.max(0, Math.cos(2 * Math.PI * at(BPH, t))), 4);

// cubes: easy stream in the main lane, then a firehose in all lanes near the camera
const CUBES = [];
{
  const hero = {ts: B.l2 - 0.5, hero: true, lane: MAIN, y: MAIN};
  CUBES.push(hero);
  for (let ts = T.burst - 0.5, k = 0; ts < B.runhard; ts += 0.62, k++) if (Math.abs(ts - hero.ts) > 0.4) CUBES.push({ts, lane: MAIN, y: MAIN + (R('cy' + k) - 0.5) * 90, k});
  let k = 0;
  for (const lane of [530, 870, 1550, 190]) for (let ts = B.runhard + 0.3; ts < B.lactate + 0.6; ts += lane === MAIN ? 0.075 : 0.11, k++) CUBES.push({ts, lane, y: lane + (R('hy' + k) - 0.5) * 110, k, hard: true});
  for (const c of CUBES) {
    const r = R('cv' + c.ts + c.lane);
    c.v = c.hard ? 460 + 120 * r : 190 + 30 * r; c.x0 = c.hard ? -200 + (B.runhard - c.ts) * 0 + 400 + 2200 * R('cx' + c.k + c.lane) * 0 : -260;
    c.snapT = c.ts + (c.hard ? 0.5 + 0.5 * r : 2.0 + 1.0 * r);
    if (c.hero) { c.v = 0; c.x0 = -230; c.snapT = B.sugar - 0.12; }
    if (c.hard) c.x0 = 600 + 700 * Math.floor(R('cz' + c.k + c.lane) * 3) - 380 - c.v * 0.6;
    c.snapX = c.hero ? 300 : c.x0 + c.v * (c.snapT - c.ts);
    c.amber = !c.hero && !c.hard && c.k % 4 === 1;
    c.halves = [0, 1].map((h) => {
      const e = nextEngine(c.lane, c.snapX + 20);
      const door = e ? e.x - 118 * e.s : c.snapX + 3000, vh = c.hard ? 430 : 175;
      const ta = c.hero ? B.engines + 0.65 + h * 0.18 : c.snapT + (door - c.snapX) / vh + h * 0.12;
      return {h, e, door, vh, ta, y: c.y + (h ? 18 : -18)};
    });
  }
  // engine intake: flat-out engines take one half every 0.3 s; the rest heap up around them
  const byE = new Map();
  for (const c of CUBES) for (const hh of c.halves) if (hh.e) { if (!byE.has(hh.e.id)) byE.set(hh.e.id, []); byE.get(hh.e.id).push(hh); hh.c = c; }
  for (const [, list] of byE) {
    list.sort((a, b) => a.ta - b.ta); let last = -9, n = 0;
    for (const hh of list) {
      if (!hh.c.hard || hh.ta - last >= 0.3) { hh.burn = true; last = hh.ta; } else { hh.burn = false; hh.slot = n++; }
    }
  }
}
// heap slot n around engine e: a mound on the strand below, growing outward
const slotPos = (e, n) => {
  const ring = Math.floor(Math.sqrt(n * 1.6)), an = Math.PI * (0.06 + 0.88 * R('sa' + n)), r = 30 + ring * 30;
  return {x: e.x - 60 + Math.cos(an) * r * 1.5 - 40 * R('sb' + n), y: e.lane + 128 - Math.sin(an) * r * 0.75 - 6, rot: (R('sr' + n) - 0.5) * 0.8};
};
const cubeAt = (c, t) => (c.hero ? kf(t, [[c.ts, -230], [B.sugar - 0.12, 300]]) : c.x0 + c.v * (t - c.ts));
const halfAt = (c, hh, t) => {
  if (c.hero) {
    const x = kf(t, [[B.sugar - 0.12, 300], [B.engines + 0.65 + hh.h * 0.18, hh.door]]);
    return {x, y: lerp(c.y + (hh.h ? 22 : -22), MAIN, sm(B.engines - 0.3, B.engines + 0.6, t))};
  }
  const x = Math.min(hh.door, c.snapX + hh.vh * (t - c.snapT));
  const sep = sm(c.snapT, c.snapT + 0.3, t);
  return {x, y: lerp(c.y, hh.y, sep) + (hh.e ? (hh.e.y - hh.y) * sm(hh.ta - 0.8, hh.ta, t) : 0)};
};
const waveT = (e, pos) => B.lactate + 0.1 + Math.hypot(pos.x - e.x, pos.y - e.y) / 520 + Math.abs(e.x - 1250) / 2600;

const inCam = (t) => {
  const heroX = t < B.sugar ? cubeAt(CUBES[0], t) : kf(t, [[B.sugar - 0.12, 300], [B.engines + 0.6, 1130]]);
  const fx = t < T.out1 + 0.5 ? kf(t, [[0, 0], [T.burst - 0.1, 0], [B.l2 + 0.3, heroX + 120], [B.engines + 0.6, 1050], [B.almost + 0.6, 1150], [B.runhard + 0.5, 1180], [B.cant, 1200], [B.lactate, 1150], [B.spills + 0.4, 1350], [T.out1 + 0.5, 1650]])
    : kf(t, [[T.in2 - 0.5, 3050], [T.out2, 2950]]);
  const fy = t < T.out1 + 0.5 ? kf(t, [[0, 860], [B.lactate + 0.3, 860], [B.spills + 0.5, 1150], [T.out1, 1210]]) : kf(t, [[T.in2 - 0.5, 900], [T.out2, 870]]);
  const z = (t < T.out1 + 0.5 ? kfz(t, [[0, 0.95], [B.l1, 1.0], [B.fuel + 0.2, 1.2], [T.burst + 0.4, 0.95], [B.engines + 0.6, 1.05], [B.almost + 0.5, 0.48], [B.runhard + 0.3, 0.5],
    [B.superfast, 0.85], [B.cant + 0.3, 0.9], [B.e4, 0.62], [B.lactate + 0.5, 0.62], [B.spills + 0.5, 0.78], [T.out1 + 0.5, 0.82]])
    : kfz(t, [[T.in2 - 0.5, 0.95], [B.together, 0.82], [T.out2, 0.78]])) * inZm(t);
  const shake = squeeze(t) * (t > B.runhard && t < T.out1 ? 6 : 2);
  return {fx, fy: fy - shake, z};
};
function fibreBg(ctx, t, cam) {
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#5c2540'); g.addColorStop(0.5, '#84354f'); g.addColorStop(1, '#5e2640');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // far layer: soft strands and dim engine lights (parallax 0.4)
  const p = 0.4, z = Math.pow(cam.z, 0.5) * 0.7;
  for (let k = -6; k <= 6; k++) {
    const y = (k * 300 - cam.fy * p * 0.3) * z + 960 + ((cam.fy * p) % 300) * 0;
    const gg = ctx.createLinearGradient(0, y - 60 * z, 0, y + 60 * z);
    gg.addColorStop(0, 'rgba(200,90,120,0)'); gg.addColorStop(0.5, 'rgba(200,90,120,0.13)'); gg.addColorStop(1, 'rgba(200,90,120,0)');
    ctx.fillStyle = gg; ctx.fillRect(0, y - 60 * z, 1080, 120 * z);
    for (let j = 0; j < 5; j++) {
      const x = ((j * 290 + k * 137 - cam.fx * p * z) % 1450 + 1450) % 1450 - 180;
      ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y + 150 * z, 110 * z, [255, 210, 170], 0.08 + 0.05 * Math.sin(t * 1.3 + j + k)); ctx.globalCompositeOperation = 'source-over';
    }
  }
}
function strands(ctx, t, cam, x0, x1) {
  const sq = squeeze(t), sp = 52 * (1 - 0.14 * sq);
  for (const y of BANDS) {
    const h = 84 + 10 * sq;
    if ((y + h - cam.fy) * cam.z + 960 < -50 || (y - h - cam.fy) * cam.z + 960 > 1970) continue;
    const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
    g.addColorStop(0, '#b3546c'); g.addColorStop(0.5, '#e08a98'); g.addColorStop(1, '#a24a62');
    ctx.fillStyle = g; rrect(ctx, x0, y - h / 2, x1 - x0, h, h / 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120,30,60,0.55)'; ctx.lineWidth = 7;
    const ox = (cam.fx % sp);
    ctx.beginPath();
    for (let x = Math.floor(x0 / sp) * sp; x < x1; x += sp) { ctx.moveTo(x, y - h / 2 + 8); ctx.lineTo(x, y + h / 2 - 8); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,220,225,0.35)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x0, y - h / 4); ctx.lineTo(x1, y - h / 4); ctx.stroke();
  }
}
function capillary(ctx, t, x0, x1) {
  const [y0, y1] = CAP;
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, '#8e1e30'); g.addColorStop(0.5, '#b42a3c'); g.addColorStop(1, '#7c1a2c');
  ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  // wall with pores
  ctx.fillStyle = 'rgba(240,170,170,0.85)'; ctx.fillRect(x0, y0 - 12, x1 - x0, 14); ctx.fillRect(x0, y1 - 2, x1 - x0, 14);
  ctx.fillStyle = '#8e1e30'; for (let x = Math.floor(x0 / 220) * 220; x < x1; x += 220) { rrect(ctx, x, y0 - 13, 40, 16, 6); ctx.fill(); }
  // red cells and oxygen bubbles: always streaming at full rate
  const sp = 300;
  for (let i = 0; i < 60; i++) {
    const L = 4400, x = x0 + (((R('rx' + i) * L + t * sp) % L) + L) % L, y = y0 + 25 + R('ry' + i) * (y1 - y0 - 50);
    if (x > x1) continue;
    ctx.fillStyle = '#e04456'; ctx.beginPath(); ctx.ellipse(x, y, 30, 18, R('rr' + i), 0, 7); ctx.fill();
    ctx.fillStyle = '#b02a3e'; ctx.beginPath(); ctx.ellipse(x, y, 13, 7, R('rr' + i), 0, 7); ctx.fill();
  }
  for (let i = 0; i < 46; i++) {
    const L = 4400, x = x0 + (((R('ox' + i) * L + t * sp * 1.1) % L) + L) % L, y = y0 + 20 + R('oy' + i) * (y1 - y0 - 40) + 6 * Math.sin(t * 3 + i);
    if (x > x1) continue;
    ctx.fillStyle = 'rgba(205,235,255,0.55)'; ctx.beginPath(); ctx.arc(x, y, 9 + 4 * R('os' + i), 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(240,250,255,0.9)'; ctx.lineWidth = 2; ctx.stroke();
  }
}
function drawIn(ctx, t) {
  const cam = inCam(t);
  fibreBg(ctx, t, cam);
  ctx.save(); ctx.translate(540, 960); ctx.scale(cam.z, cam.z); ctx.translate(-cam.fx, -cam.fy);
  const vx0 = cam.fx - 560 / cam.z - 200, vx1 = cam.fx + 560 / cam.z + 200, vy0 = cam.fy - 980 / cam.z - 200, vy1 = cam.fy + 980 / cam.z + 200;
  const inView = (x, y, m = 0) => x > vx0 - m && x < vx1 + m && y > vy0 - m && y < vy1 + m;
  const early = t < T.burst + 0.6;
  // dim the fibre while the trash bag is the lead; the drop's light floods it
  strands(ctx, t, cam, vx0, vx1);
  capillary(ctx, t, vx0, vx1);
  const phase2 = t > T.in2 - 1;
  // engines
  const hard = sm(B.runhard, B.runhard + 0.8, t) * (1 - sm(B.lactate + 0.6, B.spills, t)) * (phase2 ? 0 : 1);
  for (const e of ENG) {
    if (!inView(e.x, e.y, 200)) continue;
    let fl = 0, am = 0;
    if (!phase2 && Math.abs(e.y - MAIN) < 1 && Math.abs(e.x - 1250) < 1) { fl = sm(B.engines + 0.6, B.engines + 0.75, t) * (1 - sm(B.engines + 0.9, B.engines + 1.6, t)); }
    if (phase2) am = 0.25 + 0.25 * Math.sin(t * 3 + e.id);
    engine(ctx, e.x, e.y, e.s, t, Math.max(phase2 ? 0.5 : 0.15, hard), fl, am, e.id);
    if (hard > 0.5) steam(ctx, e.x, e.y, e.s, t, e.id);
  }
  // cubes, halves, heaps, lanterns (lines 3-6)
  if (!phase2 && t > T.burst - 0.8) {
    for (const c of CUBES) {
      if (t < c.ts) continue;
      if (t < c.snapT) {
        const x = cubeAt(c, t); if (!inView(x, c.y)) continue;
        cube(ctx, x, c.y + 6 * Math.sin(t * 4 + c.ts), c.hero ? 1.9 : 1, 0.1 * Math.sin(t * 2 + c.ts), c.hero ? 1 : 0);
        continue;
      }
      const sa = 1 - cl((t - c.snapT) / 0.35);
      for (const hh of c.halves) {
        let pos = halfAt(c, hh, t), amber = 0, a = 1, rot = 0;
        if (t >= hh.ta) {
          if (hh.burn || !hh.e) { // burned: in through the door, puff
            const u = (t - hh.ta) / 0.5; if (u > 1 || !hh.e) continue;
            const ex = hh.e;
            if (u < 0.3 && inView(ex.x, ex.y)) {
              ctx.fillStyle = `rgba(255,245,235,${0.6 * (1 - u / 0.3)})`;
              for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(ex.x + 125 * ex.s + 30 * u * j, ex.y - 20 + 25 * j - 40 * u, 10 + 18 * u, 0, 7); ctx.fill(); }
              spark(ctx, ex.x + 130 * ex.s, ex.y, 0.6, 1 - u / 0.3);
            }
            if (c.amber) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, ex.x, ex.y, 200, AM, 0.6 * (1 - u)); ctx.globalCompositeOperation = 'source-over'; }
            continue;
          }
          // surplus: hop onto the heap, turn amber in the colour wave, become a lantern, some spill into the blood
          const sp = slotPos(hh.e, hh.slot), hop = sm(hh.ta, hh.ta + 0.3, t);
          pos = {x: lerp(hh.door, sp.x, hop), y: lerp(hh.e.y, sp.y, hop) - 60 * Math.sin(Math.PI * hop)}; rot = sp.rot * hop;
          const wt = waveT(hh.e, sp); amber = sm(wt, wt + 0.35, t);
          if (amber > 0.99) {
            const spill = (hh.slot % 3 === 0) && hh.e.lane === MAIN, ts = B.spills - 0.4 + R('sp' + hh.slot) * 1.4;
            if (spill && t > ts) {
              const u = cl((t - ts) / 1.0), pore = Math.round(sp.x / 220) * 220 + 20;
              pos = u < 1 ? {x: lerp(sp.x, pore, u), y: lerp(sp.y, CAP[0] + 40, u * u)} : {x: pore + (t - ts - 1) * 330, y: CAP[0] + 60 + R('sv' + hh.slot) * 140 + 10 * Math.sin(t * 3 + hh.slot)};
            } else pos = {x: sp.x + 14 * Math.sin(t * 1.7 + hh.slot), y: sp.y - 160 * sm(wt + 0.3, wt + 2.5, t) * R('fl' + hh.slot) - 6 * Math.sin(t * 2 + hh.slot)};
            if (!inView(pos.x, pos.y)) continue;
            lantern(ctx, pos.x, pos.y, 0.8, 1); continue;
          }
        } else if (c.amber) amber = sm(hh.ta - 1.6, hh.ta - 1.1, t);
        if (!inView(pos.x, pos.y)) continue;
        half(ctx, pos.x, pos.y, c.hero ? 1.9 : 1, hh.h === 0, rot + 0.06 * Math.sin(t * 3 + c.ts + hh.h), amber, c.hero ? 1 : 0, a);
      }
      if (sa > 0) spark(ctx, c.snapX, c.y, c.hero ? 1.4 : 0.7, sa);
    }
  }
  // the myth bag and the amber drop (lines 1-2)
  if (early) {
    const rip = sm(T.rip, T.rip + 1.0, t), dark = 1 - sm(T.rip, B.fuel, t);
    // dim + reddish wash while the bag is the lead
    ctx.fillStyle = `rgba(20,10,22,${0.55 * dark})`; ctx.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
    if (rip < 1) {
      for (const side of [-1, 1]) {
        ctx.save(); ctx.translate(side * 160 * rip, MAIN + 600 * rip * rip); ctx.rotate(side * 0.8 * rip);
        ctx.beginPath(); side < 0 ? ctx.rect(-400, -400, 400 + 10 * Math.sin(1), 900) : ctx.rect(0, -400, 400, 900); ctx.clip();
        bag(ctx, 0, 0, 1.35, t, 1 - sm(0.5, 1, rip), true); ctx.restore();
      }
    }
    // drop: swells in the tear, glows, then zips off along the lane (its light floods the fibre)
    const sw = sm(T.rip + 0.1, B.fuel + 0.1, t), go = sm(T.burst, T.burst + 0.7, t);
    if (sw > 0 && go < 1) {
      const x = lerp(0, 1500, go * go), y = MAIN + 20;
      ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y, 700 * sw, AM, 0.55 * sw); ctx.globalCompositeOperation = 'source-over';
      const s = 3.6 * sw * (1 + 0.04 * Math.sin(t * 7)) * (1 - 0.6 * go);
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = AMBER; ctx.beginPath(); ctx.moveTo(0, -46); ctx.bezierCurveTo(14, -24, 32, -6, 32, 14); ctx.bezierCurveTo(32, 34, 16, 44, 0, 44); ctx.bezierCurveTo(-16, 44, -32, 34, -32, 14); ctx.bezierCurveTo(-32, -6, -14, -24, 0, -46); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,200,0.9)'; ctx.beginPath(); ctx.ellipse(-10, 8, 7, 12, 0.3, 0, 7); ctx.fill();
      ctx.restore();
      for (let i = 0; i < 8; i++) if (go > 0) { const u = cl(go * 1.3 - i * 0.05); lantern(ctx, x - 200 * i * u - 60, y + 30 * Math.sin(i * 2.1), 0.4, (1 - go) * 0.8); }
    }
  }
  // line 8: lanterns part like a curtain; acid sprites and grit sit between the strands with the heat on them
  if (phase2) {
    const part = sm(B.why + 1.1, B.why + 2.0, t);
    for (let i = 0; i < 46; i++) {
      const bx = 3050 + (R('cx' + i) - 0.5) * 900, by = 870 + (R('cyy' + i) - 0.5) * 520;
      const side = bx < 3050 ? -1 : 1, x = bx + side * 700 * part * (0.7 + 0.5 * R('cp' + i)), y = by + 10 * Math.sin(t * 2 + i);
      lantern(ctx, x, y, 0.85, 1);
    }
    const rev = sm(B.why + 1.3, B.why + 2.2, t), grab = sm(B.together, B.together + 0.6, t);
    for (let i = 0; i < 22; i++) { // grit on the strands
      const x = 2600 + R('gx' + i) * 900, by = [700, 1040][i % 2], y = by + (i % 2 ? -48 : 48) + (R('gy' + i) - 0.5) * 30;
      ctx.save(); ctx.translate(x, y); ctx.rotate(R('gr' + i) * 6); ctx.scale(rev, rev);
      ctx.fillStyle = 'rgba(142,138,150,0.98)'; ctx.beginPath();
      for (let k = 0; k < 7; k++) { const an = k / 7 * 6.283, r = 14 + 10 * R('gk' + i + k); ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
      ctx.fill(); ctx.strokeStyle = 'rgba(80,76,90,0.9)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    }
    for (let i = 0; i < 9; i++) { // acid sprites
      const hx = 2700 + 90 * i + 30 * R('ax' + i), hy0 = 870 + (R('ay' + i) - 0.5) * 160, hy1 = i % 2 ? 760 : 980;
      const x = hx + 8 * Math.sin(t * 5 + i), y = lerp(hy0, hy1, grab) + 6 * Math.sin(t * 7 + i * 2);
      const s = rev * (1 + 0.12 * Math.sin(t * 6 + i));
      if (s <= 0.01) continue;
      ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y, 150 * s, RED, 0.55 + 0.2 * Math.sin(t * 8 + i)); ctx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(t * 0.8 * (i % 2 ? 1 : -1));
      ctx.fillStyle = '#ff4d5e'; ctx.beginPath();
      for (let k = 0; k < 20; k++) { const an = k / 20 * 6.283, r = k % 2 ? 22 : 40; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
      ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#b81e34'; ctx.lineWidth = 3; ctx.stroke();
      ctx.rotate(-t * 0.8 * (i % 2 ? 1 : -1));
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-9, -2, 7, 0, 7); ctx.arc(9, -2, 7, 0, 7); ctx.fill();
      ctx.fillStyle = '#2b1020'; ctx.beginPath(); ctx.arc(-8, 0, 3.5, 0, 7); ctx.arc(10, 0, 3.5, 0, 7); ctx.fill();
      ctx.strokeStyle = '#2b1020'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-17, -12); ctx.lineTo(-3, -7); ctx.moveTo(17, -12); ctx.lineTo(3, -7); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

// ================= compose =================
export function drawFrame(ctx, t, opts = {}) {
  const a = inside(t);
  if (a < 1) drawOut(ctx, t);
  if (a > 0) { ctx.globalAlpha = a; drawInLayer(ctx, t); ctx.globalAlpha = 1; }
  // glass-rim flash ring at each passage
  for (const c of [T.in1, T.out1, T.in2, T.out2]) {
    const u = thru(t, c); if (u <= 0 || u >= 1) continue;
    const r = c === T.in1 || c === T.in2 ? lerp(150, 1500, u) : lerp(1500, 150, u), al = Math.sin(Math.PI * u) * 0.5;
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,236,214,${al})`; ctx.lineWidth = 60;
    ctx.beginPath(); ctx.arc(540, 960, r, 0, 7); ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
  }
  // vignette + grain
  const v = ctx.createRadialGradient(540, 980, 500, 540, 980, 1250);
  v.addColorStop(0, 'rgba(20,10,30,0)'); v.addColorStop(1, 'rgba(20,10,30,0.42)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, 1080, 1920);
  const g = grain(), fr = Math.round(t * FPS);
  ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'overlay';
  ctx.save(); ctx.translate(-((fr * 97) % 256), -((fr * 61) % 256)); ctx.scale(2, 2);
  for (let x = 0; x < 1080 / 2 + 256; x += 256) for (let y = 0; y < 1920 / 2 + 256; y += 256) ctx.drawImage(g, x, y);
  ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
// IN drawn to an offscreen layer so it can fade as a whole over OUT during a passage
let OFF = null;
function drawInLayer(ctx, t) {
  if (inside(t) >= 1) return drawIn(ctx, t);
  if (!OFF) { OFF = document.createElement('canvas'); OFF.width = 1080; OFF.height = 1920; }
  const o = OFF.getContext('2d'); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, 1080, 1920);
  drawIn(o, t);
  const a = ctx.globalAlpha; ctx.drawImage(OFF, 0, 0); ctx.globalAlpha = a;
}
export const isIllustration = (t) => inside(t) > 0.5 || (t > T.out1 && t < T.in2) || (t > B.reason && t < B.l10);
