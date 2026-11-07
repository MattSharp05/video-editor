// The 2D layers around the shader: the dusk Strip behind the ball, the props in front of it, and the two worlds the
// camera passes into (backstage through a gap, the dome through the pupil). All deterministic (random(seed)).
import {Easing, interpolate, random} from 'remotion';
import B from './beats.json';
import {CX, CY, H, W, Cam, toScreen, ramp, lerp, win, io, out, OURP, NEXTP, BACK, INTERIOR, ANTENNA_POP, pitchR} from './timeline';
import {DT} from './shader';
import {drawEye, PIC} from './pictures';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const GOLD = '#FFC56E';
export const SANSF = "'Hanken Grotesk', sans-serif";

// ---------- the Strip (generic silhouettes, original) ----------
type Bld = {x: number; w: number; h: number; top: number; far: boolean; hue: number; seed: number};
const BLDS: Bld[] = [];
for (let i = 0; i < 70; i++) {
  const far = i < 34;
  let x = (random(`bx${i}`) * 2 - 1) * 6.5;
  if (!far && Math.abs(x) < 1.35) x = Math.sign(x || 1) * (1.35 + random(`bxo${i}`) * 0.8);
  BLDS.push({x, w: 0.22 + random(`bw${i}`) * (far ? 0.45 : 0.6), h: (far ? 0.9 : 0.3) + random(`bh${i}`) * (far ? 1.9 : 1.6),
    top: Math.floor(random(`bt${i}`) * 4), far, hue: random(`bc${i}`), seed: i});
}
BLDS.sort((a, b) => Number(b.far) - Number(a.far));
const GROUND = -1.0;
let skyCanvas: HTMLCanvasElement | null = null;
const SKY_PX = 260, SKY_X0 = -7.5, SKY_Y1 = 3.4, SKY_W = 15, SKY_H = 4.6;   // world rect [-7.5,7.5]x[-1.2,3.4]
const skyline = () => {
  if (skyCanvas) return skyCanvas;
  const c = document.createElement('canvas');
  c.width = SKY_W * SKY_PX; c.height = SKY_H * SKY_PX;
  const g = c.getContext('2d')!;
  const sx = (x: number) => (x - SKY_X0) * SKY_PX, sy = (y: number) => (SKY_Y1 - y) * SKY_PX;
  for (const b of BLDS) {
    const x0 = sx(b.x - b.w / 2), x1 = sx(b.x + b.w / 2), y0 = sy(GROUND + b.h), yb = sy(GROUND - 0.2);
    g.fillStyle = b.far ? '#1a1838' : '#0d0c1e';
    g.beginPath();
    if (b.top === 0) g.rect(x0, y0, x1 - x0, yb - y0);
    else if (b.top === 1) { g.moveTo(x0, yb); g.lineTo(x0, y0 + 30); g.lineTo((x0 + x1) / 2, y0 - 30); g.lineTo(x1, y0 + 30); g.lineTo(x1, yb); }
    else if (b.top === 2) { g.rect(x0, y0, x1 - x0, yb - y0); g.rect(x0 + (x1 - x0) * 0.25, y0 - 40, (x1 - x0) * 0.5, 40); g.rect((x0 + x1) / 2 - 3, y0 - 110, 6, 70); }
    else { g.moveTo(x0, yb); g.lineTo(x0, y0 + 50); g.quadraticCurveTo((x0 + x1) / 2, y0 - 50, x1, y0 + 50); g.lineTo(x1, yb); }
    g.fill();
    // windows: warm and cool points of light
    const cols = Math.max(2, Math.floor((x1 - x0) / 14)), rows = Math.floor((yb - y0 - 40) / 16);
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const q = random(`w${b.seed}_${r}_${k}`);
      if (q < (b.far ? 0.55 : 0.45)) continue;
      const warm = random(`wc${b.seed}_${r}`) > 0.35;
      g.fillStyle = warm ? `rgba(255,${190 + q * 50},${110 + q * 60},${b.far ? 0.35 : 0.7})` : `rgba(150,200,255,${b.far ? 0.3 : 0.6})`;
      g.fillRect(x0 + 6 + k * ((x1 - x0 - 12) / cols), y0 + 26 + r * 16, 5, 7);
    }
    // a neon edge on some near ones
    if (!b.far && b.hue > 0.6) {
      g.strokeStyle = b.hue > 0.8 ? 'rgba(255,90,170,0.8)' : 'rgba(90,230,255,0.75)'; g.lineWidth = 4;
      g.beginPath(); g.moveTo(x0, yb); g.lineTo(x0, y0); g.lineTo(x1, y0); g.lineTo(x1, yb); g.stroke();
    }
  }
  // road and ground
  g.fillStyle = '#07060f'; g.fillRect(0, sy(GROUND), c.width, c.height);
  g.fillStyle = '#15132a'; g.fillRect(0, sy(GROUND - 0.02), c.width, 0.09 * SKY_PX);
  skyCanvas = c;
  return c;
};

export function drawBG(g: CanvasRenderingContext2D, t: number, cam: Cam, morph: number, glow: string) {
  // sky: dusk, with a slow drift of light
  const sk = g.createLinearGradient(0, 0, 0, H);
  const hy = toScreen(cam, 0, GROUND)[1];
  sk.addColorStop(0, '#070a24');
  sk.addColorStop(Math.max(0.05, Math.min(0.9, (hy - 900) / H)), '#2b1850');
  sk.addColorStop(Math.max(0.1, Math.min(0.97, hy / H)), '#c2507a');
  sk.addColorStop(1, '#f0a060');
  g.fillStyle = sk; g.fillRect(0, 0, W, H);
  if (cam.R > 6000) return;
  // stars
  for (let i = 0; i < 70; i++) {
    const x = random(`sx${i}`) * W, y = random(`sy${i}`) * hy * 0.6;
    g.fillStyle = `rgba(255,255,255,${0.25 + 0.35 * Math.sin(t * 1.3 + i) ** 2})`;
    g.fillRect(x, y, 2, 2);
  }
  // the Strip's own life: searchlights sweeping from behind the towers, aircraft blinking across the sky
  const [, sky0] = toScreen(cam, 0, GROUND + 0.4);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const [bx] = toScreen(cam, -3.2 + i * 2.1 + (i > 1 ? 0.4 : 0), 0);
    const a = -Math.PI / 2 + Math.sin(t * (0.55 + i * 0.13) + i * 1.9) * 0.55;
    const len = 2200, wd = 0.07;
    const lg = g.createLinearGradient(bx, sky0, bx + Math.cos(a) * len, sky0 + Math.sin(a) * len);
    lg.addColorStop(0, 'rgba(200,210,255,0.16)'); lg.addColorStop(1, 'rgba(200,210,255,0)');
    g.fillStyle = lg; g.beginPath(); g.moveTo(bx, sky0);
    g.lineTo(bx + Math.cos(a - wd) * len, sky0 + Math.sin(a - wd) * len); g.lineTo(bx + Math.cos(a + wd) * len, sky0 + Math.sin(a + wd) * len); g.fill();
  }
  g.restore();
  for (let i = 0; i < 3; i++) {
    const x = ((random(`pl${i}`) * 1400 + t * (40 + i * 18)) % 1500) - 200, y = 300 + i * 170 + random(`ply${i}`) * 80;
    const on = (t * 1.6 + i * 0.37) % 1 < 0.18;
    g.fillStyle = on ? 'rgba(255,90,90,0.95)' : 'rgba(255,255,255,0.6)';
    g.fillRect(x, y - (t * 6) % 1, on ? 5 : 3, on ? 5 : 3);
  }
  // far mountains, slower parallax
  const pr = Math.pow(cam.R / 330, 0.5) * 330;
  const mc = {X: cam.X * 0.4, Y: cam.Y, R: pr};
  g.fillStyle = '#1e1640';
  g.beginPath();
  const [mx0, my0] = toScreen(mc, -9, GROUND);
  g.moveTo(mx0, my0 + 40);
  for (let i = 0; i <= 36; i++) {
    const x = -9 + i * 0.5, y = GROUND + 0.35 + 0.35 * Math.sin(i * 1.7) ** 2 + 0.2 * random(`m${i}`);
    const [px, py] = toScreen(mc, x, y); g.lineTo(px, py);
  }
  const [mx1, my1] = toScreen(mc, 9, GROUND); g.lineTo(mx1, my1 + 40); g.closePath(); g.fill();
  // the ball's light on the city
  const [sx, sy] = toScreen(cam, 0, 0);
  const rg = g.createRadialGradient(sx, sy, cam.R * 0.9, sx, sy, cam.R * 2.6);
  rg.addColorStop(0, glow); rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // skyline
  const sc = skyline();
  const [x0, y0] = toScreen(cam, SKY_X0, SKY_Y1);
  g.drawImage(sc, x0, y0, SKY_W * cam.R, SKY_H * cam.R);
  // ground below the Strip: dark, with the city's light pooled on it
  const [, gy0] = toScreen(cam, 0, GROUND - 0.02);
  const gg = g.createLinearGradient(0, gy0, 0, H);
  gg.addColorStop(0, '#120f24'); gg.addColorStop(1, '#040308');
  g.fillStyle = gg; g.fillRect(0, gy0, W, H - gy0);
  g.fillStyle = glow; g.beginPath(); g.ellipse(sx, gy0 + 0.25 * cam.R, 1.6 * cam.R, 0.25 * cam.R, 0, 0, Math.PI * 2); g.fill();
  // cars on the road: light streaks moving both ways
  const [, ry] = toScreen(cam, 0, GROUND - 0.04);
  for (let i = 0; i < 26; i++) {
    const dir = i % 2 ? 1 : -1, sp = 0.25 + random(`cs${i}`) * 0.3;
    const x = ((random(`cx${i}`) * 14 + dir * t * sp) % 14 + 14) % 14 - 7;
    const [px] = toScreen(cam, x, 0);
    g.fillStyle = dir > 0 ? 'rgba(255,240,210,0.9)' : 'rgba(255,60,60,0.9)';
    g.fillRect(px, ry + (dir > 0 ? 0 : 0.03 * cam.R), Math.max(2, 0.05 * cam.R), Math.max(1.5, 0.012 * cam.R));
  }
  // the TV cabinet around the screen, until it inflates away
  if (morph < 0.98) drawTV(g, cam, morph);
}

function drawTV(g: CanvasRenderingContext2D, cam: Cam, m: number) {
  const k = 1 - m;
  g.save();
  g.globalAlpha = Math.min(1, k * 2.2);
  const [x0, y0] = toScreen(cam, -1.12 - 0.1 * m, 0.92 + 0.08 * m);
  const w = (2.24 + 0.2 * m) * cam.R, h = (1.84 + 0.16 * m) * cam.R;
  // legs
  g.fillStyle = '#2a1a12';
  for (const s of [-1, 1]) {
    const [lx, ly] = toScreen(cam, s * 0.8, -0.92);
    g.beginPath(); g.moveTo(lx - 0.05 * cam.R, ly); g.lineTo(lx + s * 0.1 * cam.R, ly + 0.1 * cam.R); g.lineTo(lx + s * 0.1 * cam.R + 0.06 * cam.R * -s, ly + 0.1 * cam.R); g.lineTo(lx + 0.05 * cam.R, ly); g.fill();
  }
  const wood = g.createLinearGradient(x0, y0, x0 + w, y0 + h);
  wood.addColorStop(0, '#8a5a3a'); wood.addColorStop(1, '#4a2c1c');
  g.fillStyle = wood;
  g.beginPath(); g.roundRect(x0, y0, w, h, 0.18 * cam.R + m * 0.8 * cam.R); g.fill();
  g.strokeStyle = 'rgba(255,220,180,0.25)'; g.lineWidth = 3; g.stroke();
  // speaker grille + knobs under the screen
  const [gx, gy] = toScreen(cam, -0.7, -0.74);
  g.fillStyle = 'rgba(20,10,5,0.55)';
  for (let i = 0; i < 8; i++) g.fillRect(gx + i * 0.09 * cam.R, gy, 0.05 * cam.R, 0.1 * cam.R);
  for (const kx of [0.45, 0.72]) {
    const [kx2, ky2] = toScreen(cam, kx, -0.8);
    g.fillStyle = '#d8c3a0'; g.beginPath(); g.arc(kx2, ky2, 0.06 * cam.R, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#3a2416'; g.fillRect(kx2 - 2, ky2 - 0.05 * cam.R, 4, 0.04 * cam.R);
  }
  // dark bezel behind the glass
  const [bx, by] = toScreen(cam, -0.97, 0.75);
  g.fillStyle = '#0b0b0e'; g.beginPath(); g.roundRect(bx, by, 1.94 * cam.R, 1.5 * cam.R, 0.2 * cam.R); g.fill();
  g.restore();
}

// ---------- props in front of the ball ----------
const puckScreen = (cam: Cam, p: [number, number]) => toScreen(cam, p[0], p[1]);

function drawAntenna(g: CanvasRenderingContext2D, t: number, cam: Cam, morph: number) {
  if (t > ANTENNA_POP + 2.5) return;
  const topY = lerp(0.92, 1.0, morph);
  let [bx, by] = toScreen(cam, 0, topY);
  const L = 0.78 * cam.R;
  const wob = Math.sin(t * 9) * 0.12 * Math.exp(-Math.max(0, t - 2.4) * 1.2) + Math.sin(t * 2.1) * 0.03;
  let rot = 0, alpha = 1;
  if (t > ANTENNA_POP) {   // blinked off: pops up and tumbles away
    const u = t - ANTENNA_POP;
    bx += u * 0.5 * cam.R; by -= (2.4 * u - 1.6 * u * u) * cam.R; rot = u * 5; alpha = 1 - ramp(t, ANTENNA_POP + 1.2, ANTENNA_POP + 2.0);
  }
  g.save(); g.translate(bx, by); g.rotate(rot); g.globalAlpha = alpha;
  g.strokeStyle = '#c9ccd6'; g.lineWidth = Math.max(2, 0.022 * cam.R); g.lineCap = 'round';
  for (const s of [-1, 1]) {
    const a = s * (0.42 + wob * s);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * L, -Math.cos(a) * L); g.stroke();
    g.fillStyle = '#e8e8f0'; g.beginPath(); g.arc(Math.sin(a) * L, -Math.cos(a) * L, 0.035 * cam.R, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#3a3d48'; g.beginPath(); g.ellipse(0, 0, 0.12 * cam.R, 0.07 * cam.R, 0, Math.PI, 0); g.fill();
  g.restore();
}

// a hockey puck seen at a tilt: face ellipse plus a side band (its thickness)
function drawPuck3D(g: CanvasRenderingContext2D, x: number, y: number, r: number, tilt: number, lit: number, spin: number) {
  const ry = r * Math.cos(tilt), th = r * 0.42 * Math.sin(tilt);
  g.fillStyle = '#16171c';
  g.beginPath(); g.ellipse(x, y + th, r, ry, 0, 0, Math.PI); g.lineTo(x - r, y); g.ellipse(x, y, r, ry, 0, Math.PI, 0, true); g.closePath(); g.fill();
  g.fillRect(x - r, y, 2 * r, th);
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 2;
  g.beginPath(); g.ellipse(x, y + th, r, ry, 0, 0, Math.PI); g.stroke();
  const fg = g.createRadialGradient(x - r * 0.3, y - ry * 0.3, r * 0.1, x, y, r);
  fg.addColorStop(0, lit > 0 ? '#fff3c0' : '#3a3c44'); fg.addColorStop(1, lit > 0 ? '#ffc23a' : '#1e1f25');
  g.fillStyle = fg; g.beginPath(); g.ellipse(x, y, r, ry, 0, 0, Math.PI * 2); g.fill();
  // grip ridges on the side band
  g.strokeStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 14; i++) {
    const a = Math.PI * (i / 14) + spin % (Math.PI / 14);
    const px = x + Math.cos(a) * r;
    g.beginPath(); g.moveTo(px, y + Math.sin(a) * ry); g.lineTo(px, y + Math.sin(a) * ry + th); g.stroke();
  }
}

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, o: number, accentPart?: string) {
  g.save(); g.globalAlpha = o; g.font = `800 ${size}px ${SANSF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(0,0,0,0.75)'; g.shadowBlur = 18;
  if (accentPart && text.startsWith(accentPart)) {
    const rest = text.slice(accentPart.length);
    const wa = g.measureText(accentPart).width, wr = g.measureText(rest).width, x0 = x - (wa + wr) / 2;
    g.textAlign = 'left'; g.fillStyle = GOLD; g.fillText(accentPart, x0, y); g.fillStyle = '#fff'; g.fillText(rest, x0 + wa, y);
  } else { g.fillStyle = '#fff'; g.fillText(text, x, y); }
  g.restore();
}

export function drawFG(g: CanvasRenderingContext2D, t: number, cam: Cam, morph: number) {
  const P = cam.R * DT;   // puck pitch on screen near the centre
  const [ox, oy] = puckScreen(cam, OURP);
  drawAntenna(g, t, cam, morph);

  // line 2: a sparrow darts in and through a gap
  const bA = B.gaps - 0.3, bB = B.gaps + 0.9;
  if (t > bA && t < bB) {
    const u = ramp(t, bA, bB, Easing.bezier(0.3, 0.1, 0.6, 1));
    const gx = ox + 1.0 * P, gy = oy - 0.5 * P;   // a gap up-right of our puck
    const x = lerp(-80, gx, u) + Math.sin(u * 9) * 30 * (1 - u), y = lerp(560, gy, u) - Math.sin(u * Math.PI) * 160;
    const s = 70 * (1 - Math.pow(u, 3)) + 2;
    const flap = Math.sin(t * 38);
    g.save(); g.translate(x, y); g.rotate(0.5 - u * 0.4); g.fillStyle = `rgba(12,10,20,${1 - ramp(u, 0.9, 1)})`;
    g.beginPath(); g.ellipse(0, 0, s * 0.5, s * 0.18, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(-s * 0.1, 0); g.lineTo(-s * 0.35, -s * 0.75 * flap); g.lineTo(s * 0.2, 0); g.fill();
    g.beginPath(); g.moveTo(s * 0.4, -s * 0.05); g.arc(s * 0.45, -s * 0.08, s * 0.14, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(-s * 0.45, 0); g.lineTo(-s * 0.8, -s * 0.15); g.lineTo(-s * 0.8, s * 0.15); g.fill();
    g.restore();
  }

  // line 3: the slapshot
  const hit = B.pucks - 0.12, swing = hit - 0.75, strike = hit - 0.45;
  if (t > swing - 0.4 && t < hit + 0.6) {
    // stick: pivots from off-frame upper left, blade sweeps through the strike point
    const sx = ox - 4.2 * P, sy = oy + 0.05 * P;
    const a = interpolate(t, [swing - 0.4, swing, strike, strike + 0.25, hit + 0.6], [-0.9, -1.15, 0.15, 0.55, 0.2], {...clamp, easing: io});
    const o = win(t, swing - 0.4, hit + 0.6, 0.2);
    const pivX = sx - 1.0 * P, pivY = sy - 3.6 * P;
    g.save(); g.globalAlpha = o; g.translate(pivX, pivY); g.rotate(a);
    const len = 3.7 * P;
    g.fillStyle = '#c99a5b'; g.fillRect(-0.07 * P, 0, 0.14 * P, len);
    g.fillStyle = '#1b1b1f'; g.fillRect(-0.075 * P, 0, 0.15 * P, 0.9 * P);   // grip tape
    g.fillStyle = '#e8e2d4'; g.beginPath(); g.moveTo(-0.07 * P, len); g.lineTo(0.95 * P, len + 0.05 * P); g.lineTo(0.95 * P, len + 0.32 * P); g.lineTo(-0.1 * P, len + 0.28 * P); g.closePath(); g.fill();
    g.fillStyle = '#1b1b1f'; g.fillRect(0.15 * P, len + 0.06 * P, 0.6 * P, 0.24 * P);
    g.restore();
    // the puck: sits, then shoots into the slot, tilting flat as it lands
    if (t < hit + 0.02) {
      const u = ramp(t, strike, hit, Easing.bezier(0.15, 0.6, 0.4, 1));
      const x = lerp(sx + 0.5 * P, ox, u), y = lerp(sy + 0.25 * P, oy, u) - Math.sin(u * Math.PI) * 0.35 * P;
      const tilt = lerp(1.1, 0.0, Math.pow(u, 2.5));
      drawPuck3D(g, x, y, 0.36 * P * lerp(1.05, 1, u), tilt, 0, u * 12);
      if (u > 0 && u < 1) {   // ice-spray streak behind it
        g.strokeStyle = 'rgba(220,235,255,0.35)'; g.lineWidth = 0.08 * P; g.lineCap = 'round';
        g.beginPath(); g.moveTo(x - 0.4 * P, y); g.lineTo(x - (0.4 + 2.2 * (1 - u)) * P, y + 0.05 * P); g.stroke();
      }
    }
  }
  // the counter rides with the wave
  const cA = hit + 0.3, cB = B.million12 + 1.3;
  if (t > cA && t < B.l3 + 0.4) {
    const n = Math.min(1.2, interpolate(t, [cA, cB], [0.1, 1.2], {...clamp, easing: Easing.bezier(0.3, 0, 0.5, 1)}));
    const o = win(t, cA, B.l3 + 0.4, 0.25);
    label(g, `${n.toFixed(1)} million`, CX, 1350, 104, o, `${n.toFixed(1)}`);
    label(g, 'pucks', CX, 1440, 52, o * 0.85);
  }

  // line 4: the tape measure, centre to centre: whips out, reads 8 in, snaps back
  const tA = B.apart - 0.25, tHold = B.apart + 0.35, tBack = B.fortyeight - 0.55;
  if (t > tA - 0.3 && t < tBack + 0.5) {
    const [nx] = puckScreen(cam, NEXTP);
    const ext = t < tBack ? interpolate(t, [tA, tA + 0.35, tA + 0.5], [0, 1.06, 1], {...clamp, easing: out}) : 1 - ramp(t, tBack, tBack + 0.25, Easing.bezier(0.6, 0, 1, 1));
    const wob = t > tBack + 0.25 ? Math.sin((t - tBack) * 40) * 8 * Math.exp(-(t - tBack - 0.25) * 8) : 0;
    const y = oy + 0.62 * P, x0 = ox, len = (nx - ox) * ext;
    const o = win(t, tA - 0.3, tBack + 0.5, 0.2);
    g.save(); g.globalAlpha = o;
    // case
    g.fillStyle = '#f2c230'; g.beginPath(); g.roundRect(x0 - 0.42 * P + wob, y - 0.2 * P, 0.4 * P, 0.4 * P, 0.08 * P); g.fill();
    g.fillStyle = '#2b2b30'; g.beginPath(); g.arc(x0 - 0.22 * P + wob, y, 0.1 * P, 0, Math.PI * 2); g.fill();
    // blade
    g.fillStyle = '#f7dc4a'; g.fillRect(x0 - 0.02 * P, y - 0.055 * P, len + 0.02 * P, 0.11 * P);
    g.fillStyle = '#222';
    for (let i = 0; i <= 16; i++) { const x = x0 + (i / 16) * (nx - ox); if (x - x0 <= len) g.fillRect(x, y - 0.055 * P, 2, i % 4 === 0 ? 0.08 * P : 0.04 * P); }
    g.fillStyle = '#9a9aa2'; g.fillRect(x0 + len - 2, y - 0.08 * P, 0.03 * P, 0.16 * P);   // hook
    // centre marks on both pucks
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 3; g.setLineDash([8, 6]);
    for (const x of [ox, nx]) { g.beginPath(); g.moveTo(x, oy - 0.3 * P); g.lineTo(x, y); g.stroke(); }
    g.setLineDash([]);
    g.restore();
    label(g, '8 in apart', (ox + nx) / 2, y + 0.32 * P, 84, o * ramp(t, tA + 0.3, tA + 0.5), '8 in');
  }
  // the steel frame: named on the rail it lights up
  if (t > B.frame - 0.1 && t < B.apart - 0.15) {
    // the rail one row below our puck glows along its length, and the label sits on it, away from the pucks
    const o = win(t, B.frame - 0.1, B.apart - 0.15, 0.25), ry = oy + 0.5 * P;
    const sweep = ramp(t, B.frame - 0.1, B.frame + 0.5, out);
    g.save(); g.globalAlpha = o; g.strokeStyle = 'rgba(225,232,245,0.9)'; g.lineWidth = Math.max(4, 0.06 * P);
    g.shadowColor = 'rgba(200,215,255,0.9)'; g.shadowBlur = 20;
    g.beginPath(); g.moveTo(0, ry); g.lineTo(W * sweep, ry); g.stroke(); g.restore();
    label(g, 'steel frame', ox + 1.0 * P, ry + 0.11 * P + 26, 60, o);
  }
  // the 48 LEDs counter
  const lA = B.fortyeight + 0.2;
  if (t > lA - 0.2 && t < B.l4 + 0.5) {
    const n = Math.round(interpolate(t, [lA, lA + 1.2], [0, 48], {...clamp, easing: Easing.bezier(0.3, 0, 0.6, 1)}));
    label(g, `${n} lights`, CX, 1450, 96, win(t, lA - 0.2, B.l4 + 0.5, 0.2), `${n}`);
  }

  // line 7: a tourist with a phone rises into the bottom of the frame; the phone shows the eye
  const uA = B.faraway, uB = B.l7 + 0.6;
  if (t > uA && t < uB) {
    const rise = ramp(t, uA, uA + 1.2, out) * (1 - ramp(t, B.l7 - 0.3, uB));
    const by = H + 40 - rise * 520;
    g.save(); g.fillStyle = '#05040b';
    g.beginPath(); g.ellipse(300, by + 60, 92, 110, 0, 0, Math.PI * 2); g.fill();            // head
    g.beginPath(); g.ellipse(300, by + 330, 240, 170, 0, Math.PI, 0); g.lineTo(540, H + 300); g.lineTo(60, H + 300); g.fill(); // shoulders
    g.lineWidth = 64; g.lineCap = 'round'; g.strokeStyle = '#05040b';
    g.beginPath(); g.moveTo(450, by + 250); g.lineTo(560, by + 20); g.lineTo(610, by - 150); g.stroke();   // raised arm
    g.fillStyle = '#111018'; g.beginPath(); g.roundRect(560, by - 330, 120, 220, 18); g.fill();
    g.fillStyle = '#5b2d6e'; g.beginPath(); g.roundRect(568, by - 320, 104, 200, 12); g.fill();
    g.fillStyle = '#eef1f6'; g.beginPath(); g.ellipse(620, by - 220, 46, 30, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2a8fd8'; g.beginPath(); g.arc(620, by - 220, 19, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#05060a'; g.beginPath(); g.arc(620, by - 220, 8, 0, Math.PI * 2); g.fill();
    g.restore();
  }
}

// ---------- backstage: wires to the computer (line 6) ----------
// world units: our puck's back at (0,0); computer at (2.2,-9). Camera rides the wire.
const WIRE: [number, number][] = [[0, 0], [0.15, -1.2], [0.9, -2.6], [1.4, -4.6], [2.0, -6.6], [2.2, -8.3]];
const along = (pts: [number, number][], u: number): [number, number] => {
  const n = pts.length - 1, k = Math.min(n - 1, Math.floor(u * n)), f = u * n - k;
  return [lerp(pts[k][0], pts[k + 1][0], f), lerp(pts[k][1], pts[k + 1][1], f)];
};
const BRANCH: [number, number][][] = [];
for (let i = 0; i < 26; i++) {   // the tree of wires fanning out from the computer to pucks above
  const ex = (i - 12.5) * 0.42 + random(`be${i}`) * 0.2, sx0 = 2.2 + (random(`bs${i}`) - 0.5) * 0.3;
  BRANCH.push([[sx0, -8.3], [lerp(sx0, ex, 0.3), -6.0 - random(`bm${i}`) * 0.6], [lerp(sx0, ex, 0.75), -2.8], [ex, -0.4], [ex, 0.15]]);
}
export function drawBackstage(g: CanvasRenderingContext2D, t: number) {
  const a = BACK.in, b = BACK.out;
  const fire = B.manytimes - 1.0;            // the computer fires
  const ride0 = fire + 0.15;                 // we ride one pulse home
  // camera: from our puck's back down the wire to the computer, then back up with a pulse
  let cxw: number, cyw: number, sc: number;
  if (t < fire) {
    const u = ramp(t, a + 0.15, fire - 0.25, Easing.bezier(0.6, 0, 0.3, 1));
    [cxw, cyw] = along(WIRE, u); cyw = lerp(cyw, cyw + 0.6, u);
    sc = interpolate(t, [a, a + 0.25, fire - 0.25, fire], [2600, 380, 240, 200], {...clamp, easing: io});
  } else {
    const u = ramp(t, ride0, b, Easing.bezier(0.5, 0, 0.75, 1));
    [cxw, cyw] = along(WIRE, 1 - u);
    sc = interpolate(t, [fire, ride0, b - 0.3, b], [200, 210, 600, 3200], {...clamp, easing: io});
  }
  const S = (x: number, y: number): [number, number] => [CX + (x - cxw) * sc, CY - (y - cyw) * sc];
  // backdrop: the dark inside of the frame, a faint diagrid of steel
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0c1024'); bg.addColorStop(1, '#05060e');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(120,130,160,0.13)'; g.lineWidth = Math.max(2, 0.05 * sc);
  for (let i = -14; i <= 14; i++) {
    const [x1, y1] = S(i * 0.9 - 6, 1.5), [x2, y2] = S(i * 0.9 + 6, -10.5);
    const [x3, y3] = S(i * 0.9 + 6, 1.5), [x4, y4] = S(i * 0.9 - 6, -10.5);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.moveTo(x3, y3); g.lineTo(x4, y4); g.stroke();
  }
  // the row of puck backs along the top, with rails
  g.fillStyle = 'rgba(150,160,185,0.25)';
  const [, ry0] = S(0, 0.6), [, ry1] = S(0, -0.45);
  g.fillRect(0, ry0, W, Math.max(2, 0.06 * sc)); g.fillRect(0, ry1, W, Math.max(2, 0.06 * sc));
  for (let i = -16; i <= 16; i++) {
    const [px, py] = S(i * 0.42, 0.1);
    if (px < -sc || px > W + sc) continue;
    g.fillStyle = '#1c1f2a'; g.beginPath(); g.arc(px, py, 0.16 * sc, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,200,120,0.25)'; g.lineWidth = Math.max(1, 0.012 * sc); g.stroke();
    g.fillStyle = '#2b2f3c'; g.fillRect(px - 0.04 * sc, py - 0.04 * sc, 0.08 * sc, 0.08 * sc);
  }
  // wires: the branching tree (dim), our wire (brighter)
  const path = (pts: [number, number][]) => { g.beginPath(); pts.forEach((p, i) => { const [x, y] = S(p[0], p[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const br of BRANCH) { g.strokeStyle = 'rgba(90,110,150,0.55)'; g.lineWidth = Math.max(1.5, 0.025 * sc); path(br); g.stroke(); }
  g.strokeStyle = '#8a95b8'; g.lineWidth = Math.max(3, 0.05 * sc); path(WIRE); g.stroke();
  // our puck's back glows (the lead)
  const [ox, oy] = S(0, 0.1);
  g.strokeStyle = GOLD; g.lineWidth = Math.max(2, 0.025 * sc); g.beginPath(); g.arc(ox, oy, 0.17 * sc, 0, Math.PI * 2); g.stroke();
  // speed streaks while we whip down the wire
  const spd = win(t, a + 0.2, fire - 0.2, 0.3) + win(t, ride0, b - 0.1, 0.3);
  if (spd > 0.01) {
    g.strokeStyle = `rgba(160,180,230,${0.18 * spd})`; g.lineWidth = 3;
    for (let i = 0; i < 18; i++) {
      const x = random(`st${i}`) * W, y = ((random(`sty${i}`) * H + t * 2600 * (t < fire ? -1 : 1)) % H + H) % H;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30, y + 260); g.stroke();
    }
  }
  // the computer: a friendly box with a face
  const [kx, ky] = S(2.2, -8.95);
  const ks = 1.25 * sc, fireK = win(t, fire - 0.1, fire + 0.5, 0.1);
  g.fillStyle = '#20263a'; g.beginPath(); g.roundRect(kx - ks / 2, ky - ks * 0.38, ks, ks * 0.76, ks * 0.08); g.fill();
  g.strokeStyle = 'rgba(160,180,230,0.5)'; g.lineWidth = Math.max(2, 0.02 * sc); g.stroke();
  g.fillStyle = `rgb(${lerp(18, 40, fireK)},${lerp(40, 70, fireK)},${lerp(60, 90, fireK)})`;
  g.beginPath(); g.roundRect(kx - ks * 0.4, ky - ks * 0.3, ks * 0.8, ks * 0.45, ks * 0.05); g.fill();
  const blink = win(t, fire - 0.9, fire - 0.7, 0.08);
  g.fillStyle = '#9ff0ff';
  for (const s of [-1, 1]) { g.beginPath(); g.roundRect(kx + s * ks * 0.16 - ks * 0.05, ky - ks * 0.17, ks * 0.1, ks * 0.17 * (1 - blink * 0.9) + 2, ks * 0.04); g.fill(); }
  g.strokeStyle = '#9ff0ff'; g.lineWidth = ks * 0.03;
  g.beginPath(); g.arc(kx, ky - ks * 0.04, ks * (0.1 + 0.04 * fireK), 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  for (let i = 0; i < 6; i++) {
    const on = Math.sin(t * 13 + i * 2.1) > 0.2 || fireK > 0.5;
    g.fillStyle = on ? ['#ff6b8a', '#ffd166', '#6be3ff', '#9dff8a', '#ffffff', '#c39bff'][i] : '#2b3247';
    g.beginPath(); g.arc(kx - ks * 0.3 + i * ks * 0.12, ky + ks * 0.27, ks * 0.025, 0, Math.PI * 2); g.fill();
  }
  // pulses: colour commands racing out along every wire, faster and faster; we ride the gold one on our wire
  if (t > fire) {
    const u = t - fire;
    const cols = ['#ffffff', '#9fd8ff', '#ff8ab0', '#ffe08a', '#a7ff9e'];
    for (let i = 0; i < BRANCH.length; i++) for (let k = 0; k < 4; k++) {
      const v = ((u * (0.75 + 0.5 * u) + k * 0.22 + random(`pd${i}`) * 0.2) % 1);
      if (u * (0.75 + 0.5 * u) + k * 0.22 < 0) continue;
      const [x, y] = along(BRANCH[i], v); const [px, py] = S(x, y);
      g.fillStyle = cols[(i + k) % cols.length]; g.shadowColor = g.fillStyle as string; g.shadowBlur = 16;
      g.beginPath(); g.arc(px, py, Math.max(3, 0.05 * sc), 0, Math.PI * 2); g.fill();
    }
    const v = ramp(t, ride0, b, Easing.bezier(0.5, 0, 0.75, 1));
    const [x, y] = along(WIRE, 1 - v); const [px, py] = S(x, y);
    g.fillStyle = GOLD; g.shadowColor = GOLD; g.shadowBlur = 30;
    g.beginPath(); g.arc(px, py, Math.max(6, 0.09 * sc), 0, Math.PI * 2); g.fill();
    g.shadowBlur = 0;
  }
  // flash as the pulse reaches the puck (the carrier back out to the front)
  const fl = ramp(t, b - 0.18, b);
  if (fl > 0) { g.fillStyle = `rgba(255,236,200,${fl * 0.9})`; g.fillRect(0, 0, W, H); }
  const fi = 1 - ramp(t, a, a + 0.2);
  if (fi > 0) { g.fillStyle = `rgba(2,3,6,${fi})`; g.fillRect(0, 0, W, H); }
}

// ---------- the interior: a dome screen over rows of seats (line 9 - 10) ----------
let domeCanvas: HTMLCanvasElement | null = null;
const DOME = 1400;
function domePicture(t: number) {
  if (!domeCanvas) { domeCanvas = document.createElement('canvas'); domeCanvas.width = DOME; domeCanvas.height = DOME; }
  const g = domeCanvas.getContext('2d')!;
  const sky = g.createLinearGradient(0, 0, 0, DOME);
  sky.addColorStop(0, '#2a3f8f'); sky.addColorStop(0.45, '#e88a5a'); sky.addColorStop(0.62, '#ffd08a'); sky.addColorStop(1, '#ffe2a8');
  g.fillStyle = sky; g.fillRect(0, 0, DOME, DOME);
  const sun = g.createRadialGradient(DOME * 0.5, DOME * 0.66, 10, DOME * 0.5, DOME * 0.66, 260);
  sun.addColorStop(0, 'rgba(255,250,220,1)'); sun.addColorStop(0.3, 'rgba(255,220,150,0.8)'); sun.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = sun; g.fillRect(0, 0, DOME, DOME);
  // dunes
  const dune = (y: number, amp: number, col: string, ph: number) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, DOME);
    for (let x = 0; x <= DOME; x += 20) g.lineTo(x, y + Math.sin(x / 210 + ph) * amp + Math.sin(x / 90 + ph * 2) * amp * 0.25);
    g.lineTo(DOME, DOME); g.fill();
  };
  dune(DOME * 0.72, 30, '#c46a45', 0.3); dune(DOME * 0.8, 40, '#8c3f34', 1.4); dune(DOME * 0.9, 34, '#4e2230', 2.2);
  // a hot-air balloon drifting across
  const bx = DOME * (0.4 + (t - INTERIOR.in) * 0.02), by = DOME * 0.42 - (t - INTERIOR.in) * 10;
  g.save(); g.translate(bx, by);
  const cols = ['#e83f5b', '#ffd23f', '#3bc4e0', '#e83f5b', '#ffd23f'];
  for (let i = 0; i < 5; i++) { g.fillStyle = cols[i]; g.beginPath(); g.ellipse(0, 0, 70 - i * 14, 85, 0, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#5a3a2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(-30, 70); g.lineTo(-12, 120); g.moveTo(30, 70); g.lineTo(12, 120); g.stroke();
  g.fillStyle = '#6b4226'; g.fillRect(-14, 118, 28, 20);
  g.restore();
  return domeCanvas;
}
let dotTile: HTMLCanvasElement | null = null;
const tile = () => {
  if (dotTile) return dotTile;
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const g = c.getContext('2d')!;
  g.fillStyle = 'rgba(0,0,0,0.85)'; g.fillRect(0, 0, 32, 32);
  g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(16, 16, 12.5, 0, Math.PI * 2); g.fill();
  dotTile = c; return c;
};
export function drawInterior(g: CanvasRenderingContext2D, t: number) {
  const a = INTERIOR.in, b = INTERIOR.out;
  // look: starts level with the seats, tilts up over the head; a push toward the dome shows its tiny dots
  const tilt = interpolate(t, [a, B.wraps - 0.2, B.l9 + 0.5], [0, 0.15, 1], {...clamp, easing: io});
  const push = interpolate(t, [a, B.sharper - 0.1, B.sharper + 0.9, B.wraps + 0.1], [1, 1.15, 7.5, 1.05], {...clamp, easing: io});
  const domeR = 1500, dcx = CX, dcy = lerp(1650, 2900, tilt);
  g.fillStyle = '#0a0812'; g.fillRect(0, 0, W, H);
  // zoom about the push point (on the dome, near the balloon)
  const pxp = 380, pyp = lerp(820, 700, tilt);
  g.save();
  g.translate(pxp, pyp); g.scale(push, push); g.translate(-pxp, -pyp);
  // dome picture clipped to the dome's circle
  g.save(); g.beginPath(); g.arc(dcx, dcy, domeR, Math.PI, 0); g.clip();
  const dp = domePicture(t);
  g.drawImage(dp, dcx - domeR, dcy - domeR, domeR * 2, domeR);
  // dome curvature: darker toward the rim, brighter at the top
  const shade = g.createRadialGradient(dcx, dcy - domeR * 0.3, domeR * 0.2, dcx, dcy, domeR);
  shade.addColorStop(0, 'rgba(0,0,0,0)'); shade.addColorStop(0.85, 'rgba(0,0,0,0.15)'); shade.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = shade; g.fillRect(dcx - domeR, dcy - domeR, domeR * 2, domeR);
  // the dome's own dots: so fine they only show at the push (pitch 2.4 px at 1x)
  const pitch = 2.4 * push;
  if (pitch > 4) {
    const pat = g.createPattern(tile(), 'repeat')!;
    pat.setTransform(new DOMMatrix().scale(2.4 / 32));
    g.globalAlpha = ramp(pitch, 4, 9) * 0.9;
    g.fillStyle = pat; g.fillRect(dcx - domeR, dcy - domeR, domeR * 2, domeR);
    g.globalAlpha = 1;
  }
  g.restore();
  // rows of seats: heads facing the dome, lit from above
  for (let r = 0; r < 7; r++) {
    const y = dcy - 120 + r * 70 + 0 * r, n = 14 + r * 3, rw = 900 + r * 160;
    for (let k = 0; k < n; k++) {
      const x = CX - rw / 2 + (k + 0.5) * (rw / n) + (r % 2) * 12;
      const s = 18 + r * 4;
      g.fillStyle = '#07060c';
      g.beginPath(); g.arc(x, y, s, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(x, y + s * 1.9, s * 1.9, s * 1.3, 0, Math.PI, 0); g.fill();
      g.strokeStyle = 'rgba(255,200,140,0.35)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, s, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    }
  }
  g.fillStyle = '#07060c'; g.fillRect(0, dcy + 400, W, H);
  g.restore();
  // one outside puck, to scale, over the dome's dots: the inside packs ~27 dots across the same 8 inches
  const ring = win(t, B.sharper + 0.35, B.wraps + 0.05, 0.25);
  if (ring > 0 && pitch > 9) {
    const R0 = 0.36 * 27 * pitch;
    g.save(); g.globalAlpha = ring; g.strokeStyle = GOLD; g.lineWidth = 7; g.shadowColor = GOLD; g.shadowBlur = 18;
    g.beginPath(); g.arc(pxp, pyp, R0, 0, Math.PI * 2); g.stroke(); g.restore();
    label(g, 'one outside dot', Math.min(W - 240, pxp + 40), pyp + R0 + 60, 56, ring);
  }
  // passing through the outside layer: fat puck backs as a screen door, flying past the camera
  const door = 1 - ramp(t, a, a + 0.75, Easing.bezier(0.3, 0, 0.6, 1));
  if (door > 0) {
    const sc = lerp(5, 1, door) * 260;
    g.fillStyle = `rgba(14,12,22,${Math.min(1, door * 1.6)})`;
    for (let i = -4; i <= 4; i++) for (let j = -6; j <= 6; j++) {
      const x = CX + (i + 0.5) * sc, y = CY + (j + (i % 2) * 0.5) * sc * 0.98;
      g.beginPath(); g.arc(x, y, sc * 0.36, 0, Math.PI * 2); g.fill();
    }
  }
  // bright light at the moment we come through
  const fl = 1 - ramp(t, a, a + 0.35);
  if (fl > 0) { g.fillStyle = `rgba(255,214,160,${fl})`; g.fillRect(0, 0, W, H); }
  // going out the top: the dome's sky fills the frame
  const up = ramp(t, b - 0.45, b);
  if (up > 0) { g.fillStyle = `rgba(91,45,110,${up})`; g.fillRect(0, 0, W, H); }
}

export function drawEyeCanvas(c: CanvasRenderingContext2D, e: {gx: number; gy: number; lid: number; dil: number}) {
  drawEye(c, e.gx, e.gy, e.lid, e.dil);
}
export {PIC, pitchR};
