// A modern code editor on a flat monitor. Frame 8 (mode 'complete'): syntax colour and an autocomplete
// list finishing "cou" as "count" (IntelliSense-style, 1996 onward). Frame 9 (mode 'ghost'): AI suggests the
// rest of the line and the next one as faint text, accepted with Tab (GitHub Copilot preview, June 2021).
// The story continues from the card: ADD TOTAL,COUNT is now `total += person.count`.
// The amber stays the code being written: the chosen completion, the AI's suggestion, the caret.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {C} from './eniac';

export type EditorMode = 'complete' | 'ghost' | 'claude';
export const MON = {w: 0.6, h: 0.34, y: 0.3, z: 0};

const COL = {bg: '#191714', gutter: '#4e4840', kw: '#7fb2ad', id: '#d8d1c3', num: '#d4a86c', punct: '#8a8379', fn: '#e0c48c', amber: '#ffb347', sel: '#4a3210', panel: '#26221e', line: '#221f1b'};
type Tok = [string, string]; // [text, colour key]
const KW = new Set(['function', 'let', 'const', 'for', 'of', 'return']);
function tokens(line: string): Tok[] {
  const out: Tok[] = [];
  const re = /(\s+|[A-Za-z_][A-Za-z0-9_]*|\d+|[^\sA-Za-z0-9_])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const t = m[0];
    out.push([t, /^\s+$/.test(t) ? 'id' : KW.has(t) ? 'kw' : /^\d/.test(t) ? 'num' : /^[A-Za-z_]/.test(t) ? (t === 'payroll' ? 'fn' : 'id') : 'punct']);
  }
  return out;
}

function editorTexture(mode: EditorMode) {
  const W = 2400, H = Math.round(W * MON.h / MON.w), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, W, H);
  // title bar + tab
  ctx.fillStyle = '#121110'; ctx.fillRect(0, 0, W, 90);
  ctx.fillStyle = COL.bg; ctx.fillRect(40, 20, 420, 70);
  ctx.fillStyle = '#b8b0a2'; ctx.font = '600 38px "Hanken Grotesk", sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText('payroll.js', 80, 56);
  const fs = 58, lh = 100, x0 = 240, y0 = 560, cw = fs * 0.6;
  ctx.font = `600 ${fs}px "Overpass Mono", monospace`;
  const lines = [
    'function payroll(staff) {',
    '  let total = 0;',
    '  for (const person of staff) {',
    mode === 'complete' ? '    total += person.cou' : '    total += person.',
    '  }',
    '  return total;',
    '}',
  ];
  const caretLine = 3;
  // current-line highlight
  ctx.fillStyle = COL.line; ctx.fillRect(0, y0 + caretLine * lh - lh / 2, W, lh);
  lines.forEach((l, i) => {
    const y = y0 + i * lh;
    ctx.fillStyle = COL.gutter; ctx.textAlign = 'right'; ctx.fillText(String(i + 1), x0 - 60, y); ctx.textAlign = 'left';
    let x = x0;
    for (const [t, c] of tokens(l)) { ctx.fillStyle = (COL as Record<string, string>)[c]; for (const ch of t) { ctx.fillText(ch, x, y); x += cw; } }
  });
  const caretX = x0 + lines[caretLine].length * cw, caretY = y0 + caretLine * lh;
  if (mode === 'complete') {
    // autocomplete list under the caret
    const items: [string, string][] = [['count', 'number'], ['countBy', 'function'], ['country', 'string'], ['coupon', 'string']];
    const px = caretX - 3 * cw - 20, py = caretY + lh * 0.55, pw = 820, rh = 92;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(px + 10, py + 14, pw, rh * items.length + 16);
    ctx.fillStyle = COL.panel; ctx.fillRect(px, py, pw, rh * items.length + 16);
    ctx.strokeStyle = '#3a352f'; ctx.lineWidth = 3; ctx.strokeRect(px, py, pw, rh * items.length + 16);
    items.forEach(([name, kind], i) => {
      const ry = py + 8 + i * rh;
      if (i === 0) { ctx.fillStyle = COL.sel; ctx.fillRect(px + 4, ry, pw - 8, rh); }
      ctx.font = `600 ${fs * 0.86}px "Overpass Mono", monospace`;
      ctx.fillStyle = i === 0 ? COL.amber : COL.id; ctx.fillText(name.slice(0, 3), px + 40, ry + rh / 2);
      ctx.fillStyle = i === 0 ? COL.amber : '#a39b8e'; ctx.fillText(name.slice(3), px + 40 + 3 * fs * 0.86 * 0.6, ry + rh / 2);
      ctx.font = `500 ${fs * 0.6}px "Hanken Grotesk", sans-serif`; ctx.fillStyle = '#857d71'; ctx.textAlign = 'right'; ctx.fillText(kind, px + pw - 36, ry + rh / 2); ctx.textAlign = 'left';
    });
    ctx.font = `600 ${fs}px "Overpass Mono", monospace`;
  } else {
    // AI suggestion: the rest of the line and the next line, faint amber, with a Tab hint
    ctx.globalAlpha = 0.55; ctx.fillStyle = COL.amber;
    ctx.fillText('hours * rate;', caretX, caretY);
    ctx.globalAlpha = 1;
    // shift the closing lines down by one to make room
    ctx.fillStyle = COL.bg; ctx.fillRect(0, y0 + 4 * lh - lh / 2, W, lh * 3.2);
    ctx.globalAlpha = 0.55; ctx.fillStyle = COL.amber; ctx.fillText('    total += bonus(person);', x0, caretY + lh); ctx.globalAlpha = 1;
    ['  }', '  return total;', '}'].forEach((l, k) => {
      const i = 5 + k, y = y0 + i * lh;
      ctx.fillStyle = COL.gutter; ctx.textAlign = 'right'; ctx.fillText(String(i), x0 - 60, y); ctx.textAlign = 'left';
      let x = x0; for (const [t, c] of tokens(l)) { ctx.fillStyle = (COL as Record<string, string>)[c]; for (const ch of t) { ctx.fillText(ch, x, y); x += cw; } }
    });
    // "Tab to accept" hint at the end of the suggestion
    const hx = caretX + 'hours * rate;'.length * cw + 40, hy = caretY;
    ctx.fillStyle = '#2c2823'; ctx.fillRect(hx, hy - 34, 200, 68);
    ctx.font = `600 ${fs * 0.55}px "Hanken Grotesk", sans-serif`; ctx.fillStyle = '#b8b0a2'; ctx.fillText('Tab', hx + 26, hy + 2);
    ctx.font = `600 ${fs}px "Overpass Mono", monospace`;
  }
  // caret
  ctx.fillStyle = COL.amber; ctx.fillRect(caretX, caretY - fs * 0.62, 7, fs * 1.24);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

// Frame 10: the Claude desktop app (dark theme). The request in plain English, Claude's reply with a diff of
// payroll.js (added lines green, as diffs show them), and Approve. Claude's spark and Approve carry the amber.
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function spark(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, col: string) {
  ctx.strokeStyle = col; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx - Math.cos(a) * r, cy - Math.sin(a) * r); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke(); }
}
function claudeTexture() {
  const W = 2400, H = Math.round(W * MON.h / MON.w), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;
  const bg = '#262624', side = '#1f1e1c', fg = '#ece8e0', mute = '#9c968b', card = '#30302d', claude = '#d97757';
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // sidebar
  ctx.fillStyle = side; ctx.fillRect(0, 0, 420, H);
  ctx.font = '600 44px "Hanken Grotesk", sans-serif'; ctx.textBaseline = 'middle';
  spark(ctx, 70, 80, 22, claude); ctx.fillStyle = fg; ctx.fillText('Claude', 110, 82);
  ctx.font = '500 34px "Hanken Grotesk", sans-serif';
  ctx.fillStyle = mute; ctx.fillText('New chat', 60, 190);
  ctx.fillText('Recents', 60, 290);
  ctx.fillStyle = '#34322e'; rr(ctx, 36, 330, 350, 70, 16); ctx.fill();
  ctx.fillStyle = fg; ctx.fillText('Payroll overtime', 60, 366);
  ctx.fillStyle = mute; ['Fix CSV import', 'Release notes'].forEach((t, i) => ctx.fillText(t, 60, 450 + i * 80));
  // main column, laid out in the lower-middle of the screen (the portrait frame sees x ≈ 400–1800 px)
  const mx = 520, mw = 1240;
  ctx.font = '500 40px "Hanken Grotesk", sans-serif';
  const msg = 'Add overtime: 1.5× pay for hours over 40.';
  const tw = ctx.measureText(msg).width;
  ctx.fillStyle = '#3a3935'; rr(ctx, mx + mw - tw - 230, 520, tw + 70, 96, 32); ctx.fill();
  ctx.fillStyle = fg; ctx.fillText(msg, mx + mw - tw - 195, 569);
  spark(ctx, mx + 22, 680, 20, claude);
  ctx.fillStyle = fg; ctx.font = '500 38px "Hanken Grotesk", sans-serif';
  ctx.fillText("I'll update payroll() to pay overtime at 1.5×.", mx + 70, 682);
  const cy = 740, rows: [string, string][] = [
    [' ', 'for (const person of staff) {'],
    ['-', '  total += person.hours * rate;'],
    ['+', '  const base = Math.min(person.hours, 40);'],
    ['+', '  const extra = person.hours - base;'],
    ['+', '  total += (base + extra * 1.5) * rate;'],
    [' ', '}'],
  ];
  const fs = 36, lh = 58, cw = fs * 0.6, ch = 100 + rows.length * lh;
  ctx.fillStyle = card; rr(ctx, mx, cy, mw, ch, 22); ctx.fill();
  ctx.fillStyle = mute; ctx.font = '600 30px "Overpass Mono", monospace'; ctx.fillText('payroll.js', mx + 36, cy + 44);
  ctx.fillStyle = '#8fbf96'; ctx.fillText('+3', mx + 260, cy + 44); ctx.fillStyle = '#d99482'; ctx.fillText('−1', mx + 320, cy + 44);
  rows.forEach(([k, t], i) => {
    const y = cy + 110 + i * lh;
    if (k !== ' ') { ctx.fillStyle = k === '+' ? 'rgba(110,160,115,0.16)' : 'rgba(200,110,90,0.14)'; ctx.fillRect(mx + 4, y - lh / 2, mw - 8, lh); }
    ctx.font = `600 ${fs}px "Overpass Mono", monospace`;
    ctx.fillStyle = k === '+' ? '#a6cfa9' : k === '-' ? '#dba494' : '#b9b2a5';
    let x = mx + 36; for (const c of (k + ' ' + t)) { ctx.fillText(c, x, y); x += cw; }
  });
  const by = cy + ch + 70;
  ctx.fillStyle = '#ffb347'; rr(ctx, mx, by - 42, 270, 84, 18); ctx.fill();
  ctx.fillStyle = '#1a1206'; ctx.font = '700 38px "Hanken Grotesk", sans-serif'; ctx.fillText('Approve', mx + 62, by + 2);
  ctx.strokeStyle = '#5a5650'; ctx.lineWidth = 3; rr(ctx, mx + 300, by - 42, 230, 84, 18); ctx.stroke();
  ctx.fillStyle = fg; ctx.fillText('Reject', mx + 362, by + 2);
  ctx.fillStyle = mute; ctx.font = '500 30px "Hanken Grotesk", sans-serif'; ctx.fillText('Enter to approve', mx + 580, by + 2);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export const EKEY = {pitch: 0.019, size: 0.0165, z0: 0.09};
const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
export const ekeyPos = (ch: string) => {
  const r = ROWS.findIndex((row) => row.includes(ch)), c = ROWS[r].indexOf(ch);
  return new THREE.Vector3(-0.09 + c * EKEY.pitch + r * 0.005, 0.016, EKEY.z0 + r * EKEY.pitch);
};
export const enterPos = () => new THREE.Vector3(-0.09 + 9 * EKEY.pitch + 0.005 + 0.006, 0.016, EKEY.z0 + EKEY.pitch);
function capTex(label: string) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#2e2b28'; ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#cfc8bb'; ctx.font = `500 ${label.length > 1 ? 30 : 40}px "Hanken Grotesk", sans-serif`; ctx.fillText(label, 22, 50);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export const EditorSet: React.FC<{mode: EditorMode; pressed?: string}> = ({mode, pressed}) => {
  const {gl, scene} = useThree();
  const env = useMemo(() => { const pm = new THREE.PMREMGenerator(gl); const t = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); return t; }, [gl]);
  scene.environment = env; scene.environmentIntensity = 0.25;
  scene.background = new THREE.Color(C.ground);
  scene.fog = new THREE.FogExp2(C.haze, 0.4);

  const built = useMemo(() => {
    const g = new THREE.Group();
    const alu = new THREE.MeshPhysicalMaterial({color: '#2c2a28', metalness: 0.8, roughness: 0.35});
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 0.9), new THREE.MeshPhysicalMaterial({color: '#24211e', roughness: 0.5, clearcoat: 0.3}));
    desk.position.set(0, -0.015, 0.15); g.add(desk);
    // monitor: thin bezel, stand
    const frame = new THREE.Mesh(new RoundedBoxGeometry(MON.w + 0.02, MON.h + 0.02, 0.02, 3, 0.006), alu); frame.position.set(0, MON.y, MON.z - 0.011); g.add(frame);
    const tex = mode === 'claude' ? claudeTexture() : editorTexture(mode);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(MON.w, MON.h), new THREE.MeshStandardMaterial({map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.75, roughness: 0.95, metalness: 0}));
    screen.position.set(0, MON.y, MON.z); g.add(screen);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.02), alu); neck.position.set(0, 0.07, -0.05); g.add(neck);
    const foot = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.01, 0.16, 2, 0.004), alu); foot.position.set(0, 0.005, -0.03); g.add(foot);
    // low-profile keyboard
    const kb = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.012, 0.11, 3, 0.004), alu); kb.position.set(0.0, 0.006, EKEY.z0 + 0.02); g.add(kb);
    const capGeo = new RoundedBoxGeometry(EKEY.size, 0.006, EKEY.size, 2, 0.002);
    ROWS.forEach((row) => [...row].forEach((ch) => {
      const p = ekeyPos(ch);
      const mats = [0, 1, 2, 3, 4, 5].map((i) => new THREE.MeshPhysicalMaterial(i === 2 ? {map: capTex(ch), roughness: 0.55} : {color: '#2e2b28', roughness: 0.55}));
      const cap = new THREE.Mesh(capGeo, mats); cap.position.set(p.x, p.y - 0.003 - (ch === pressed ? 0.002 : 0), p.z); g.add(cap);
    }));
    const ep = enterPos();
    const enter = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.006, EKEY.size, 2, 0.002), [0, 1, 2, 3, 4, 5].map((i) => new THREE.MeshPhysicalMaterial(i === 2 ? {map: capTex('enter'), roughness: 0.55} : {color: '#2e2b28', roughness: 0.55})));
    enter.position.set(ep.x, ep.y - 0.003 - (pressed === 'ENTER' ? 0.002 : 0), ep.z); g.add(enter);
    return {g};
  }, [mode, pressed]);

  return (
    <>
      <primitive object={built.g} />
      <pointLight position={[0, 0.02, 0.3]} color={'#ffcf9a'} intensity={0.12} distance={1.2} decay={2} />
      <spotLight position={[-0.8, 1.1, 0.9]} angle={0.5} penumbra={1} intensity={2.5} color={'#ffe2c0'} distance={3} decay={2} />
      <spotLight position={[0.9, 0.9, -0.8]} angle={0.6} penumbra={1} intensity={5} color={'#ffcf9a'} distance={3} decay={2} />
      <hemisphereLight args={['#4a3c30', '#0a0908', 0.35]} />
    </>
  );
};
