// Concept frames for chameleon-color-01: SVG scenes screenshotted with Playwright at 1080x1920.
// Usage: node film/sample_frames.mjs   (from the project folder) -> stills/sample-*.png
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'stills');
mkdirSync(out, { recursive: true });
const font = readFileSync(path.join(here, 'public/fonts/Fredoka.woff2')).toString('base64');

// ---------- palette ----------
const SKIN = {
  green: { body: '#3fbf4a', dark: '#23893a', light: '#b8f26a', spot: '#ffe14d' },
  red: { body: '#ff5a36', dark: '#c4301f', light: '#ffd23f', spot: '#3fd0ff' },
  brown: { body: '#6b4a3a', dark: '#46302a', light: '#9b7a5a', spot: '#8a6a4a' },
  blue: { body: '#2fa7e8', dark: '#1a6fb0', light: '#9fe8ff', spot: '#ff8ad8' },
};

// ---------- the chameleon (local box ~1000x620, faces right, feet on y=470) ----------
function chameleon(c, { mood = 'calm', puff = 1, flip = false } = {}) {
  const sx = flip ? -1 : 1;
  const eyeX = mood === 'angry' ? 768 : 774;
  return `
  <g transform="scale(${sx},1) ${flip ? 'translate(-1000,0)' : ''}">
    <!-- tail spiral, tapering -->
    <path d="M330 400 C230 420 170 500 220 565" stroke="${c.body}" stroke-width="52" fill="none" stroke-linecap="round"/>
    <path d="M220 565 C265 625 345 590 330 535" stroke="${c.body}" stroke-width="38" fill="none" stroke-linecap="round"/>
    <path d="M330 535 C318 500 278 505 280 532" stroke="${c.body}" stroke-width="26" fill="none" stroke-linecap="round"/>
    <path d="M330 400 C230 420 170 500 220 565" stroke="${c.dark}" stroke-width="8" fill="none" stroke-dasharray="4 26" stroke-linecap="round" opacity=".6"/>
    <!-- back leg -->
    <path d="M400 420 C390 450 370 465 360 478" stroke="${c.dark}" stroke-width="34" fill="none" stroke-linecap="round"/>
    <!-- body -->
    <g transform="translate(500 340) scale(${puff}) translate(-500 -340)">
      <path d="M300 340 C330 235 560 205 668 262 C735 300 742 382 700 420 C610 478 390 478 302 425 C285 400 288 368 300 340 Z" fill="${c.body}"/>
      <path d="M318 420 C420 468 610 470 698 418 C690 440 640 462 560 470 C450 478 360 458 318 420 Z" fill="${c.light}" opacity=".9"/>
      <!-- stripes -->
      <path d="M420 250 C440 320 440 390 420 455" stroke="${c.light}" stroke-width="22" fill="none" stroke-linecap="round" opacity=".75"/>
      <path d="M520 232 C545 310 545 390 525 466" stroke="${c.light}" stroke-width="22" fill="none" stroke-linecap="round" opacity=".75"/>
      <path d="M612 248 C635 315 632 380 615 448" stroke="${c.light}" stroke-width="20" fill="none" stroke-linecap="round" opacity=".75"/>
      <!-- spots -->
      <circle cx="370" cy="330" r="14" fill="${c.spot}"/><circle cx="470" cy="300" r="11" fill="${c.spot}"/>
      <circle cx="575" cy="300" r="13" fill="${c.spot}"/><circle cx="470" cy="395" r="10" fill="${c.spot}"/>
      <circle cx="575" cy="400" r="12" fill="${c.spot}"/><circle cx="660" cy="350" r="10" fill="${c.spot}"/>
      <!-- crest -->
      <path d="M330 290 L345 262 L362 282 L380 252 L398 274 L418 244 L438 266 L460 238 L482 260 L506 232 L530 256 L555 234 L578 258 L602 242 L622 266" fill="none" stroke="${c.dark}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>
    </g>
    <!-- head with casque -->
    <path d="M640 262 C665 185 745 165 800 218 L885 318 C882 360 812 392 700 384 C660 360 640 310 640 262 Z" fill="${c.body}"/>
    <path d="M660 250 C690 200 750 190 790 225" stroke="${c.dark}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M885 318 C850 336 790 346 735 340" stroke="${c.dark}" stroke-width="8" fill="none" stroke-linecap="round"/>
    ${mood === 'happy' ? `<path d="M835 335 C850 345 868 338 878 326" stroke="${c.dark}" stroke-width="7" fill="none" stroke-linecap="round"/>` : ''}
    ${mood === 'angry' ? `<path d="M700 384 C760 420 840 400 885 318 C850 380 760 395 700 384Z" fill="${c.light}"/>` : ''}
    <!-- eye turret -->
    <circle cx="768" cy="290" r="46" fill="${c.dark}"/>
    <circle cx="768" cy="290" r="38" fill="${c.body}"/>
    <circle cx="768" cy="290" r="30" fill="none" stroke="${c.dark}" stroke-width="4" opacity=".5"/>
    <circle cx="${eyeX}" cy="288" r="17" fill="#fff"/>
    <circle cx="${eyeX + 3}" cy="288" r="10" fill="#1b1b2b"/>
    <circle cx="${eyeX + 6}" cy="284" r="3.5" fill="#fff"/>
    ${mood === 'angry' ? `<path d="M730 252 L800 268" stroke="${c.dark}" stroke-width="10" stroke-linecap="round"/>` : ''}
    <!-- front leg -->
    <path d="M650 405 C660 440 680 460 690 478" stroke="${c.dark}" stroke-width="34" fill="none" stroke-linecap="round"/>
    <path d="M676 482 l-14 -10 M690 484 l0 -14 M704 482 l14 -10" stroke="${c.dark}" stroke-width="12" stroke-linecap="round"/>
    <path d="M346 482 l-14 -10 M360 484 l0 -14 M374 482 l14 -10" stroke="${c.dark}" stroke-width="12" stroke-linecap="round"/>
  </g>`;
}

const branch = (y, x1 = -40, x2 = 1120) => `
  <path d="M${x1} ${y + 18} C300 ${y - 10} 700 ${y + 30} ${x2} ${y}" stroke="#7a4a2a" stroke-width="44" fill="none" stroke-linecap="round"/>
  <path d="M${x1} ${y + 8} C300 ${y - 20} 700 ${y + 20} ${x2} ${y - 10}" stroke="#a8693d" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/>
  <path d="M760 ${y + 8} C800 ${y - 60} 870 ${y - 90} 930 ${y - 100}" stroke="#7a4a2a" stroke-width="20" fill="none" stroke-linecap="round"/>
  ${leaf(930, y - 110, 70, -30, '#4fd16a')}${leaf(860, y - 70, 55, 40, '#2fb85a')}`;

function leaf(x, y, s, rot, col, op = 1) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s / 100})" opacity="${op}">
    <path d="M0 0 C40 -60 140 -60 200 0 C140 60 40 60 0 0Z" fill="${col}"/>
    <path d="M10 0 L185 0" stroke="#ffffff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/></g>`;
}

// jungle backdrop: gradient sky, soft big leaves around the edges, light shafts, sparkles
function jungle({ top = '#36d1c4', bottom = '#b4f05a', leaves = ['#1f9e6e', '#28b47a', '#178a5e'], warm = false } = {}) {
  let ls = '';
  const spots = [[-60, 200, 260, 20], [1000, 140, 240, 160], [-80, 900, 300, -10], [1080, 1050, 280, 190], [-40, 1600, 320, 15],
    [1100, 1700, 300, 200], [880, 520, 160, 150], [60, 560, 150, 30]];
  spots.forEach(([x, y, s, r], i) => { ls += leaf(x, y, s, r, leaves[i % 3], 0.85); });
  let sp = '';
  for (let i = 0; i < 26; i++) {
    const x = (i * 397) % 1080, y = (i * 733) % 1920, r = 3 + (i % 4) * 2;
    sp += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${0.25 + (i % 3) * 0.15}"/>`;
  }
  return `
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
  <radialGradient id="sun" cx=".75" cy=".12" r=".6"><stop offset="0" stop-color="${warm ? '#ffe9a0' : '#fffbe0'}" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
  <rect width="1080" height="1920" fill="url(#sky)"/>
  <rect width="1080" height="1920" fill="url(#sun)"/>
  <g opacity=".18" fill="#fff"><path d="M820 0 L1000 0 L520 1920 L300 1920Z"/><path d="M620 0 L700 0 L180 1920 L80 1920Z"/></g>
  ${ls}${sp}`;
}

// captions: big rounded words, outlined; *word* = highlighted (colour, no box)
function caption(lines, y, { size = 92, hi = '#ffe14d' } = {}) {
  return lines.map((ln, i) => {
    const parts = ln.split(/(\*[^*]+\*)/).filter(Boolean).map(p => p.startsWith('*')
      ? `<tspan fill="${hi}">${p.slice(1, -1)}</tspan>` : `<tspan>${p}</tspan>`).join('');
    return `<text x="540" y="${y + i * size * 1.12}" text-anchor="middle" font-size="${size}" class="cap">${parts}</text>`;
  }).join('');
}
const label = (x, y, t, col = '#fff', size = 44, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" class="lab" fill="${col}">${t}</text>`;

// ---------- skin close-up (the "lens") ----------
function lens(cx, cy, r, { spread = false, outCol = '#3aa0ff' }) {
  const gap = spread ? 74 : 44, cr = spread ? 14 : 15;
  let crystals = '';
  for (let row = 0; row < 12; row++) for (let col = 0; col < 16; col++) {
    const x = cx - r + 30 + col * gap + (row % 2) * gap / 2, y = cy - 95 + row * gap * 0.62;
    if (y > cy + 140) continue;
    crystals += `<rect x="${x - cr}" y="${y - cr * 0.7}" width="${cr * 2}" height="${cr * 1.4}" rx="6" fill="#e8fbff" stroke="#9ad7ff" stroke-width="3"/>`;
  }
  const wave = (x0, y0, x1, y1, col, n = 6) => {
    const dx = (x1 - x0) / n, dy = (y1 - y0) / n; let d = `M${x0} ${y0}`;
    for (let i = 0; i < n; i++) d += ` q ${dx / 2 - dy / 2} ${dy / 2 + dx / 2 * 0.4} ${dx} ${dy}`;
    return `<path d="${d}" stroke="${col}" stroke-width="14" fill="none" stroke-linecap="round"/>`;
  };
  return `
  <defs><clipPath id="lc"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>
  <circle cx="${cx}" cy="${cy}" r="${r + 26}" fill="#fff" opacity=".35"/>
  <g clip-path="url(#lc)">
    <rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="#2b1f3a"/>
    <rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${r - 160}" fill="#ffe14d" opacity=".95"/>
    <rect x="${cx - r}" y="${cy - 150}" width="${2 * r}" height="320" fill="#5b4b8a"/>
    ${crystals}
    <rect x="${cx - r}" y="${cy + 170}" width="${2 * r}" height="${r}" fill="#2b1f3a"/>
    ${wave(cx - 330, cy - r + 10, cx - 60, cy - 60, '#ffffff')}
    ${wave(cx + 10, cy - 60, cx + 300, cy - r + 10, outCol)}
  </g>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="16"/>`;
}

// ---------- scenes ----------
const W = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:F;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:300 700}
html,body{margin:0;background:#000}svg{display:block}
.cap{font-family:F;font-weight:700;fill:#fff;stroke:#1b1b2b;stroke-width:14px;paint-order:stroke;stroke-linejoin:round}
.lab{font-family:F;font-weight:600;stroke:#1b1b2b;stroke-width:9px;paint-order:stroke;stroke-linejoin:round}
.tag{font-family:F;font-weight:700}
</style></head><body><svg width="1080" height="1920" viewBox="0 0 1080 1920">${body}</svg></body></html>`;

const tag = (t, col) => `<g><rect x="40" y="60" width="${t.length * 26 + 60}" height="72" rx="36" fill="${col}"/><text x="70" y="108" font-size="40" class="tag" fill="#fff">${t}</text></g>`;

const scenes = {
  // Option A: myth-buster. Hook frame.
  'A1-hook': W(`${jungle()}
    ${branch(1240)}
    <g transform="translate(40 770)">${chameleon(SKIN.green, { mood: 'calm' })}</g>
    <g transform="translate(540 600)"><circle r="120" fill="#fff" opacity=".9"/><text y="45" text-anchor="middle" font-size="150" class="tag" fill="#ff5a36">?</text></g>
    ${caption(['Most people think', 'chameleons change', 'color to *hide*.'], 1490, { size: 96 })}
    ${tag('A · Myth-buster', '#ff5a36')}`),
  // Option A: the reveal — two chameleons "talking" in colour.
  'A2-talk': W(`${jungle({ top: '#5ad0ff', bottom: '#ffd86b', warm: true })}
    ${branch(1200)}
    <g transform="translate(-200 826) scale(.78)">${chameleon(SKIN.red, { mood: 'angry', puff: 1.08 })}</g>
    <g transform="translate(520 864) scale(.7)">${chameleon(SKIN.blue, { mood: 'calm', flip: true })}</g>
    <g stroke="#ffe14d" stroke-width="12" stroke-linecap="round"><path d="M520 900 l30 -40"/><path d="M545 960 l50 -5"/><path d="M520 1010 l30 35"/></g>
    ${caption(['But mostly, they', 'change color', 'to *talk*!'], 330, { size: 100 })}
    ${label(240, 1400, '“Back off!”', '#ffe14d', 58)}
    ${label(840, 1420, '“Okay, okay…”', '#9fe8ff', 52, 'middle')}
    ${tag('A · Myth-buster', '#ff5a36')}`),
  // Option B: tiny mirrors — calm: crystals close together, blue bounces back + yellow = green.
  'B1-calm-crystals': W(`${jungle({ top: '#2fc7b8', bottom: '#8fe36a' })}
    <g transform="translate(250 230) scale(.58)">${chameleon(SKIN.green, { mood: 'happy' })}${branch(480, 100, 900)}</g>
    <path d="M530 470 L180 900 L900 900 Z" fill="#fff" opacity=".22"/>
    ${lens(540, 1180, 400, { spread: false, outCol: '#3aa0ff' })}
    ${label(200, 870 + 50, 'yellow layer', '#fff', 40)}
    ${label(560, 1350, 'tiny crystals, close together', '#fff', 40, 'middle')}
    ${caption(['Blue light + yellow', '= *green*!'], 1720, { size: 92, hi: '#7dff6a' })}
    ${tag('B · Tiny mirrors', '#2f7dff')}`),
  // Option B: excited — crystals spread apart, red/orange bounces back.
  'B2-excited-crystals': W(`${jungle({ top: '#ff9a5a', bottom: '#ffe36b', leaves: ['#d0732a', '#e8913a', '#b85a20'], warm: true })}
    <g transform="translate(250 230) scale(.58)">${chameleon(SKIN.red, { mood: 'angry', puff: 1.06 })}${branch(480, 100, 900)}</g>
    <path d="M530 470 L180 900 L900 900 Z" fill="#fff" opacity=".22"/>
    ${lens(540, 1180, 400, { spread: true, outCol: '#ff3b2f' })}
    <g stroke="#fff" stroke-width="10" stroke-linecap="round"><path d="M360 1290 l-60 0 m20 -18 l-20 18 l20 18"/><path d="M720 1290 l60 0 m-20 -18 l20 18 l-20 18"/></g>
    ${label(540, 1350, 'crystals spread apart', '#fff', 40, 'middle')}
    ${caption(['Spread them out…', 'now *red* bounces back!'], 1720, { size: 88, hi: '#ff5a36' })}
    ${tag('B · Tiny mirrors', '#2f7dff')}`),
  // Option C: a day in Ziggy's life — cold morning, dark to soak up sun.
  'C1-cold-morning': W(`${jungle({ top: '#5b6fd6', bottom: '#ffb36b', leaves: ['#2a5a6a', '#336b72', '#244c5c'], warm: true })}
    <circle cx="820" cy="560" r="150" fill="#ffd23f"/><circle cx="820" cy="560" r="210" fill="#ffd23f" opacity=".25"/>
    <g stroke="#ffd23f" stroke-width="14" stroke-linecap="round" opacity=".9">
      <path d="M640 720 L470 960"/><path d="M700 760 L600 1000"/><path d="M590 680 L360 900"/></g>
    ${branch(1240)}
    <g transform="translate(40 770)">${chameleon(SKIN.brown, { mood: 'calm' })}</g>
    ${label(180, 300, 'Meet Ziggy.', '#fff', 88)}
    ${label(180, 380, '6:00 a.m. Brrr!', '#ffe14d', 56)}
    ${caption(['Dark colors soak up', 'the *warm sun*.'], 1560, { size: 96, hi: '#ffd23f' })}
    ${tag('C · Ziggy’s day', '#9b4dff')}`),
  // Option C: Ziggy meets a rival — color as a message.
  'C2-rival': W(`${jungle({ top: '#ff7ad9', bottom: '#ffe36b', leaves: ['#2fb85a', '#3fcf6a', '#22995a'] })}
    ${branch(1180)}
    <g transform="translate(-200 806) scale(.78)">${chameleon(SKIN.red, { mood: 'angry', puff: 1.1 })}</g>
    <g transform="translate(520 844) scale(.7)">${chameleon(SKIN.green, { mood: 'calm', flip: true })}</g>
    <text x="600" y="800" font-size="110" class="tag" fill="#fff" stroke="#1b1b2b" stroke-width="10" paint-order="stroke">!?</text>
    ${label(180, 300, '12:00 p.m.', '#fff', 64)}
    ${caption(['Ziggy turns *bright*', 'to say “This is', 'MY branch!”'], 1480, { size: 92, hi: '#ff5a36' })}
    ${tag('C · Ziggy’s day', '#9b4dff')}`),
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
for (const [name, html] of Object.entries(scenes)) {
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, `sample-${name}.png`) });
  console.log('wrote', `sample-${name}.png`);
}
// contact board: all six side by side
const imgs = Object.keys(scenes).map(n => readFileSync(path.join(out, `sample-${n}.png`)).toString('base64'));
await page.setViewportSize({ width: 2160, height: 660 });
await page.setContent(`<html><body style="margin:0;background:#151522;display:grid;grid-template-columns:repeat(6,1fr);gap:18px;padding:20px;box-sizing:border-box">
${imgs.map(b => `<img src="data:image/png;base64,${b}" style="width:100%;border-radius:18px">`).join('')}</body></html>`);
await page.screenshot({ path: path.join(out, 'sample-board.png'), fullPage: false });
await browser.close();
