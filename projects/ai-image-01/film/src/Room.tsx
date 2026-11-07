// Room world (lines 4-9 and the dive of line 10): a dim warm room. The plane unfolds into the sheet with the prompt,
// the three words drop out as split-flap tiles that spool number tapes, the tapes plug into an old CRT, the TV shows
// pure static, and the denoise engine runs on its screen with whole-screen noise sheets lifting off onto a pile.
// Then the TV turns out to be one in a wall of TVs showing captioned training photos.
import React from 'react';
import {random} from 'remotion';
import {ACCENT, At, B, ease, easeIn, easeOut, Grid, lerp, PAPER, pr, win} from './common';
import {drawTarget, picURL, TRAINING} from './art';
import {GH, GW, N, sheetImage, staticImage, stepImage} from './engine';
import {Plane} from './Plane';
import {SANS} from './kit/fonts';
import {T_FILL} from './Desk';

// ---------- geometry (room world px) ----------
export const TV = {x: 2400, y: 150, w: 1000, h: 820};
export const SCR = {x: 2310, y: 120, w: 760, h: 570}; // the dog TV's screen
const PILE = {x: 3090, y: 600};
const TILE_X = -160, TILE_Y = [0, 200, 400], TILE_W = 300, TILE_H = 140;
const WORDS = ['dog', 'surfing', 'pizza'];
const TAPE_END = (i: number): [number, number] => [TV.x - TV.w / 2 + 14, TV.y + 40 + (i - 1) * 74];
const tapePath = (i: number) => {
  const y = TILE_Y[i], [ex, ey] = TAPE_END(i);
  return `M ${TILE_X + TILE_W / 2} ${y} L ${900 + i * 80} ${y} C ${1350 + i * 60} ${y}, ${1500} ${ey}, ${ex} ${ey}`;
};
export const C0 = B.l9 + 0.88; // the camera is through the dog TV's glass: the corridor starts

import {STEP_T} from './events';
export {STEP_T};
export const stepAt = (t: number) => { let k = 0; while (k < N && STEP_T[k] <= t) k++; return k; };
const sheetLife = (k: number) => (k < 3 ? 1.2 : k < 28 ? 0.8 : 0.7);

// ---------- background ----------
export const RoomBG: React.FC<{t: number; cam: {x: number; y: number; z: number}}> = ({t, cam}) => {
  const px = -cam.x * 0.06, py = -cam.y * 0.06;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#2A1A12'}}>
      <div style={{position: 'absolute', left: -1000 + (px % 120), top: -200, width: 3200, height: 2400,
        background: 'repeating-linear-gradient(90deg, rgba(255,220,170,0.035) 0 40px, rgba(0,0,0,0) 40px 120px)'}} />
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 900px 700px at ${300 + px * 0.5 + 60 * Math.sin(t * 0.2)}px ${500 + py * 0.5}px, rgba(255,170,90,0.22), rgba(0,0,0,0) 70%), radial-gradient(ellipse 800px 900px at ${900 + px * 0.7}px ${1500 + py * 0.7}px, rgba(255,140,70,0.14), rgba(0,0,0,0) 70%)`}} />
      {/* soft bokeh lights drifting in the dark */}
      {Array.from({length: 9}, (_, i) => {
        const x = ((random(`bx${i}`) * 1400 + px * (0.6 + random(`bz${i}`)) + t * 6 * (random(`bv${i}`) - 0.5)) % 1400 + 1400) % 1400 - 160;
        const y = ((random(`by${i}`) * 2200 + py * (0.6 + random(`bz${i}`))) % 2200 + 2200) % 2200 - 140, r = 40 + random(`br${i}`) * 90;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: 'rgba(255,190,120,0.07)', filter: 'blur(6px)'}} />;
      })}
    </div>
  );
};

// ---------- split-flap tiles and number tapes ----------
const num = (i: number, j: number) => { const v = (random(`v${i}-${j}`) * 2 - 1) * 1.6; return (v < 0 ? '−' : '') + Math.abs(v).toFixed(2); };
const TAPE_TEXT = [0, 1, 2].map((i) => Array.from({length: 120}, (_, j) => num(i, j)).join('   '));
const T_DROP = B.words4 - 0.05, T_FLIP = (i: number) => B.so4 + 0.15 + i * 0.22, T_SPOOL = B.so4 + 0.4, T_PLUG = B.l4 + 0.9;

const Tile: React.FC<{i: number; t: number}> = ({i, t}) => {
  const drop = pr(t, T_DROP + i * 0.12, T_DROP + i * 0.12 + 0.5, easeOut);
  const y = lerp(-380, TILE_Y[i], drop) + Math.sin(drop * Math.PI) * -40;
  const x = lerp(-60 + (i - 1) * 140, TILE_X, drop);
  const tf = T_FLIP(i), flip = pr(t, tf, tf + 0.22, easeIn);
  // after the flip the flaps keep clacking through numbers while the tape spools out
  const clack = t > tf + 0.22 ? Math.floor((t - tf) / 0.11) : -1;
  const front = clack < 0 ? WORDS[i] : num(i, clack % 120);
  const glow = i === 0 ? win(t, B.dog8, B.dog8 + 0.9) : i === 1 ? win(t, B.wave8, B.wave8 + 0.9) : win(t, B.pizza8, B.pizza8 + 0.9);
  if (t < T_DROP + i * 0.12) return null;
  const half = (top: boolean, txt: string, extra?: React.CSSProperties) => (
    <div style={{position: 'absolute', left: 0, top: top ? 0 : TILE_H / 2, width: TILE_W, height: TILE_H / 2, overflow: 'hidden', background: top ? '#2E2924' : '#26211D',
      borderRadius: top ? '14px 14px 0 0' : '0 0 14px 14px', ...extra}}>
      <div style={{position: 'absolute', left: 0, top: top ? 0 : -TILE_H / 2, width: TILE_W, height: TILE_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: SANS, fontWeight: 800, fontSize: 64, color: txt === WORDS[i] ? PAPER : ACCENT}}>{txt}</div>
    </div>
  );
  return (
    <At x={x} y={y} w={TILE_W} h={TILE_H} style={{filter: `drop-shadow(0 16px 18px rgba(0,0,0,0.5)) drop-shadow(0 0 ${30 * glow}px rgba(255,181,71,${0.8 * glow}))`, perspective: 600}}>
      {half(true, flip < 1 && clack < 0 ? WORDS[i] : front)}
      {half(false, flip < 0.5 && clack < 0 ? WORDS[i] : front)}
      {flip > 0 && flip < 1 && (
        <div style={{position: 'absolute', left: 0, top: 0, width: TILE_W, height: TILE_H / 2, transformOrigin: '50% 100%', transform: `rotateX(${-180 * flip}deg)`, backfaceVisibility: 'hidden'}}>
          {half(true, WORDS[i])}
        </div>
      )}
      {clack >= 0 && <div style={{position: 'absolute', left: 0, top: TILE_H / 2 - 1, width: TILE_W, height: 2, background: 'rgba(0,0,0,0.7)', transform: `scaleY(${1 + ((t - tf) % 0.11 < 0.04 ? 2 : 0)})`}} />}
    </At>
  );
};

const Tapes: React.FC<{t: number}> = ({t}) => {
  const k = pr(t, T_SPOOL, T_PLUG, ease);
  if (t < T_SPOOL) return null;
  const k8 = STEP_T.slice(28);
  return (
    <svg style={{position: 'absolute', left: -400, top: -600, overflow: 'visible'}} width={10} height={10}>
      <g transform="translate(400 600)">
        <defs>
          {[0, 1, 2].map((i) => (
            <mask id={`tm${i}`} key={i} maskUnits="userSpaceOnUse" x={-600} y={-600} width={4000} height={2000}>
              <path d={tapePath(i)} pathLength={1000} stroke="#fff" strokeWidth={80} fill="none" strokeDasharray={`${1000 * k} 2000`} />
            </mask>
          ))}
        </defs>
        {[0, 1, 2].map((i) => {
          const glow = i === 0 ? win(t, B.dog8, B.dog8 + 0.9) : i === 1 ? win(t, B.wave8, B.wave8 + 0.9) : win(t, B.pizza8, B.pizza8 + 0.9);
          // light pulses running down the tape into the TV on every step of line 8 (the words steering each guess)
          const pulses = k8.filter((s) => t > s - 0.42 && t < s + 0.02).map((s) => pr(t, s - 0.42, s, easeIn));
          return (
            <g key={i}>
              <path d={tapePath(i)} pathLength={1000} stroke="rgba(0,0,0,0.35)" strokeWidth={70} fill="none" transform="translate(6 14)" mask={`url(#tm${i})`} />
              <path d={tapePath(i)} pathLength={1000} stroke={glow > 0 ? `rgb(${lerp(238, 255, glow)},${lerp(228, 205, glow)},${lerp(205, 140, glow)})` : '#EEE4CD'} strokeWidth={64} fill="none" mask={`url(#tm${i})`} />
              <text fontFamily={SANS} fontWeight={700} fontSize={30} fill="#3A2D20" mask={`url(#tm${i})`} dy={10}>
                <textPath href={`#tp${i}`} startOffset={-1600 + (t - T_SPOOL) * 260}>{TAPE_TEXT[i]}</textPath>
              </text>
              <path id={`tp${i}`} d={tapePath(i)} fill="none" stroke="none" />
              {pulses.map((p, j) => (
                <path key={j} d={tapePath(i)} pathLength={1000} stroke={ACCENT} strokeOpacity={0.9} strokeWidth={64} fill="none" strokeDasharray="40 2000" strokeDashoffset={-(p * 960)}
                  style={{filter: 'drop-shadow(0 0 12px rgba(255,181,71,0.9))'}} />
              ))}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// ---------- the old TV ----------
export const TVSet: React.FC<{x: number; y: number; content: React.ReactNode; power: number; bright?: number; caption?: string; counter?: string; t: number}> =
  ({x, y, content, power, bright = 1, caption, counter, t}) => {
    const sx = SCR.x - TV.x, sy = SCR.y - TV.y;
    return (
      <div style={{position: 'absolute', left: x - TV.w / 2, top: y - TV.h / 2, width: TV.w, height: TV.h}}>
        {/* antenna */}
        <div style={{position: 'absolute', left: TV.w / 2 - 60, top: -230, width: 6, height: 260, background: '#9A9A9A', transform: 'rotate(-28deg)', transformOrigin: '50% 100%'}} />
        <div style={{position: 'absolute', left: TV.w / 2 - 60, top: -230, width: 6, height: 260, background: '#9A9A9A', transform: 'rotate(24deg)', transformOrigin: '50% 100%'}} />
        <div style={{position: 'absolute', left: TV.w / 2 - 120, top: 0, width: 130, height: 30, borderRadius: '65px 65px 0 0', background: '#3A2A20', transform: 'translateY(-26px)'}} />
        {/* legs */}
        <div style={{position: 'absolute', left: 140, top: TV.h - 10, width: 22, height: 90, background: '#3A2416', transform: 'rotate(12deg)'}} />
        <div style={{position: 'absolute', right: 140, top: TV.h - 10, width: 22, height: 90, background: '#3A2416', transform: 'rotate(-12deg)'}} />
        {/* wooden cabinet */}
        <div style={{position: 'absolute', inset: 0, borderRadius: 60, background: 'linear-gradient(160deg, #9A6A42 0%, #7A4E2E 45%, #5A361E 100%)', boxShadow: '0 30px 60px rgba(0,0,0,0.55), inset 0 3px 0 rgba(255,220,180,0.25)'}} />
        <div style={{position: 'absolute', inset: 22, borderRadius: 44, background: 'repeating-linear-gradient(170deg, rgba(0,0,0,0) 0 22px, rgba(0,0,0,0.05) 22px 30px)'}} />
        {/* screen bezel and the glass */}
        <div style={{position: 'absolute', left: TV.w / 2 + sx - SCR.w / 2 - 30, top: TV.h / 2 + sy - SCR.h / 2 - 30, width: SCR.w + 60, height: SCR.h + 60, borderRadius: 70, background: '#1A1410', boxShadow: 'inset 0 6px 18px rgba(0,0,0,0.8)'}} />
        <div style={{position: 'absolute', left: TV.w / 2 + sx - SCR.w / 2, top: TV.h / 2 + sy - SCR.h / 2, width: SCR.w, height: SCR.h, borderRadius: 56, overflow: 'hidden', background: '#0E0F10'}}>
          <div style={{position: 'absolute', inset: 0, opacity: power, filter: `brightness(${bright})`, transform: `scaleY(${power < 1 ? Math.max(0.01, power * power) : 1})`}}>{content}</div>
          {counter && <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, rgba(255,255,255,0) ${lerp(-40, 140, pr(t, B.blobs, B.l8 - 0.2)) - 12}%, rgba(255,240,210,0.22) ${lerp(-40, 140, pr(t, B.blobs, B.l8 - 0.2))}%, rgba(255,255,255,0) ${lerp(-40, 140, pr(t, B.blobs, B.l8 - 0.2)) + 12}%)`}} />}
          {/* scanlines, curvature shading, glow and a moving reflection */}
          <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 2px, rgba(0,0,0,0) 2px 5px)'}} />
          <div style={{position: 'absolute', inset: 0, borderRadius: 56, boxShadow: 'inset 0 0 70px rgba(0,0,0,0.75)'}} />
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${120 + 6 * Math.sin(t * 0.5)}deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.05) 100%)`}} />
        </div>
        {/* side panel: knobs and speaker */}
        {[0, 1].map((i) => (
          <div key={i} style={{position: 'absolute', left: TV.w - 150, top: 120 + i * 150, width: 90, height: 90, borderRadius: 45, background: 'radial-gradient(circle at 35% 30%, #E8D9C0, #8A7A62)', boxShadow: '0 6px 10px rgba(0,0,0,0.5)'}}>
            <div style={{position: 'absolute', left: 41, top: 6, width: 8, height: 34, borderRadius: 4, background: '#4A3A2A', transform: `rotate(${i * 70 - 20}deg)`, transformOrigin: '50% 39px'}} />
          </div>
        ))}
        {Array.from({length: 7}, (_, i) => <div key={i} style={{position: 'absolute', left: TV.w - 160, top: 450 + i * 26, width: 110, height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.35)'}} />)}
        {/* power glow on the cabinet */}
        <div style={{position: 'absolute', left: TV.w / 2 + sx - SCR.w / 2 - 80, top: TV.h / 2 + sy - SCR.h / 2 - 80, width: SCR.w + 160, height: SCR.h + 160, borderRadius: 120,
          boxShadow: `0 0 ${120 * power * bright}px rgba(190,210,255,${0.25 * power * bright})`, pointerEvents: 'none'}} />
        {caption && <div style={{position: 'absolute', left: 0, width: TV.w - 160, top: TV.h - 105, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 64, color: PAPER, opacity: 0.92}}>“{caption}”</div>}
        {counter && <div style={{position: 'absolute', left: TV.w / 2 + sx - 140, top: TV.h - 92, width: 280, height: 64, borderRadius: 14, background: '#140E0A',
          fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: 3, color: '#FFE9C8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)'}}>{counter}</div>}
      </div>
    );
  };

// ---------- the dog TV's screen over time ----------
const DogScreen: React.FC<{t: number}> = ({t}) => {
  const fr = Math.round(t * 30);
  if (t < B.wipes) {
    // pure live static; during "guesses" it trembles all over at once
    return <Grid img={staticImage(fr)} style={{transform: `scale(${1 + 0.012 * win(t, B.guesses, B.wipes + 0.1) * Math.sin(t * 40)})`}} />;
  }
  if (t > B.l9) {
    // the dive: the TV replays its steps backwards to static, so the corridor can fly forward through them
    const k = Math.round(lerp(N, 0, pr(t, B.l9 + 0.15, C0 - 0.05, easeIn)));
    return <Grid img={stepImage('target', drawTarget, k)} />;
  }
  return <Grid img={stepImage('target', drawTarget, stepAt(t))} />;
};

// one sheet in flight: lifts off the whole screen toward the camera, curls, glints and lands on the pile
const Sheet: React.FC<{k: number; t: number}> = ({k, t}) => {
  // lifts straight off the whole screen toward the camera (grows), curls and glints, then sails up-right to the pile;
  // it clears the glass within the first third of its life so the cleaner picture is seen underneath
  const t0 = STEP_T[k], L = sheetLife(k), u = pr(t, t0, t0 + L, Easing01);
  const a = Math.min(1, u / 0.35), late = k >= 28;
  const sc = u < 0.35 ? lerp(1, late ? 1.15 : 1.35, a) : lerp(late ? 1.15 : 1.35, 0.22, (u - 0.35) / 0.65);
  const bx = lerp(SCR.x, SCR.x + 900, Math.pow(a, 1.3)) * (u < 0.35 ? 1 : 0) + (u >= 0.35 ? lerp(SCR.x + 900, PILE.x, (u - 0.35) / 0.65) : 0);
  const by = u < 0.35 ? lerp(SCR.y, SCR.y - 700, Math.pow(a, 1.3)) : lerp(SCR.y - 700, PILE.y - 70, Math.pow((u - 0.35) / 0.65, 1.6));
  const curl = Math.sin(Math.min(1, u * 1.5) * Math.PI) * 40, glint = Math.max(0, 1 - Math.abs(u - 0.12) * 9);
  return (
    <div style={{position: 'absolute', left: bx - SCR.w / 2, top: by - SCR.h / 2, width: SCR.w, height: SCR.h, perspective: 1400,
      transform: `scale(${sc}) rotate(${a * 14}deg)`, opacity: (late ? 0.7 : 1) * (u > 0.92 ? 1 - (u - 0.92) / 0.08 : 1)}}>
      <div style={{position: 'absolute', inset: 0, transform: `rotateX(${curl}deg) rotateY(${-curl * 0.4}deg)`, transformOrigin: '50% 100%', borderRadius: 40, overflow: 'hidden',
        boxShadow: `0 20px 40px rgba(0,0,0,0.25), inset 0 0 0 3px rgba(255,255,255,${0.3 + glint * 0.5})`}}>
        <Grid img={sheetImage('target', drawTarget, k)} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0) ${lerp(-20, 120, a) - 15}%, rgba(255,255,255,${0.12 + 0.45 * glint}) ${lerp(-20, 120, a)}%, rgba(255,255,255,0) ${lerp(-20, 120, a) + 15}%)`}} />
      </div>
    </div>
  );
};
const Easing01 = (x: number) => x;

// a small noise tile for piles, wall TVs and flocking sheets
export const noiseURL = (i: number) => picURL(`noise${i}`, (c) => {
  const img = staticImage(i * 7 + 3, GW, GH), cv = document.createElement('canvas'); cv.width = GW; cv.height = GH; cv.getContext('2d')!.putImageData(img, 0, 0);
  c.imageSmoothingEnabled = false; c.drawImage(cv, 0, 0, 400, 300);
}, 200, 150);

const Pile: React.FC<{t: number}> = ({t}) => {
  const landed = STEP_T.filter((s, k) => t > s + sheetLife(k)).length;
  const fly = pr(t, B.covered - 0.25, B.covered + 0.6, easeIn); // the pile lifts and flocks onto the wall
  const n = Math.round(landed * (1 - fly));
  return (
    <>
      {Array.from({length: n}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: PILE.x - 85 + (random(`px${i}`) - 0.5) * 18, top: PILE.y - 8 - i * 4.2, width: 170, height: 128,
          transform: `perspective(500px) rotateX(70deg) rotate(${(random(`pr${i}`) - 0.5) * 14}deg)`, borderRadius: 8,
          background: `url(${noiseURL(i % 4)})`, backgroundSize: '100% 100%', opacity: 0.85, boxShadow: '0 2px 3px rgba(0,0,0,0.4)'}} />
      ))}
    </>
  );
};

// ---------- the wall of TVs (line 9) ----------
const COLS = [-3, -2, -1, 0, 1, 2, 3, 4], ROWS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
const PITCH = {x: 1160, y: 1000};
export const RED_CAR = {x: TV.x + PITCH.x, y: TV.y};
const T_WALL = B.l8 + 0.1;
const WallTV: React.FC<{c: number; r: number; t: number}> = ({c, r, t}) => {
  const x = TV.x + c * PITCH.x, y = TV.y + r * PITCH.y, d = Math.hypot(c * PITCH.x, r * PITCH.y);
  const on = pr(t, T_WALL + d * 0.00022, T_WALL + d * 0.00022 + 0.3);
  const ph = TRAINING[c === 1 && r === 0 ? 0 : Math.floor(random(`ph${c},${r}`) * TRAINING.length)];
  // covered: a flocking sheet lands on it; cleaned: a sheet lifts off (both waves spread out from the pile)
  const dp = Math.hypot(x - PILE.x, y - PILE.y);
  const tc = B.covered + 0.15 + dp * 0.00016, tcl = B.clean + 0.05 + dp * 0.00014;
  const level = pr(t, tc, tc + 0.25) * (1 - pr(t, tcl, tcl + 0.35));
  const fr = Math.round(t * 30);
  const content = (
    <div style={{position: 'absolute', inset: 0}}>
      <img src={picURL(ph.id, ph.draw)} style={{width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated'}} />
      <div style={{position: 'absolute', inset: 0, opacity: level, backgroundImage: `url(${noiseURL(fr % 4)})`, backgroundSize: '100% 100%'}} />
    </div>
  );
  // the sheet flying in from the pile, and the one lifting off
  const fin = pr(t, tc - 0.45, tc, easeOut), fout = pr(t, tcl, tcl + 0.5, easeIn);
  return (
    <>
      <TVSet x={x} y={y} t={t} power={on} bright={1 - 0.25 * pr(t, B.l9, B.l9 + 0.3)} caption={ph.cap} content={content} />
      {fin > 0 && fin < 1 && (
        <div style={{position: 'absolute', left: lerp(PILE.x, SCR.x - TV.x + x, fin) - SCR.w / 2, top: lerp(PILE.y - 200, SCR.y - TV.y + y, fin) - SCR.h / 2 - Math.sin(fin * Math.PI) * 500,
          width: SCR.w, height: SCR.h, transform: `scale(${lerp(0.3, 1, fin)}) rotate(${(1 - fin) * 30}deg)`, background: `url(${noiseURL(1)})`, backgroundSize: '100% 100%', opacity: 0.8, borderRadius: 40}} />
      )}
      {fout > 0 && fout < 1 && (
        <div style={{position: 'absolute', left: SCR.x - TV.x + x - SCR.w / 2, top: SCR.y - TV.y + y - SCR.h / 2 - fout * 500, width: SCR.w, height: SCR.h,
          transform: `scale(${1 + fout * 0.6}) rotate(${fout * 14}deg) perspective(900px) rotateX(${fout * 40}deg)`, background: `url(${noiseURL(2)})`, backgroundSize: '100% 100%', opacity: 0.8 * (1 - fout), borderRadius: 40}} />
      )}
    </>
  );
};

// ---------- the room as a whole ----------
export const RoomWorld: React.FC<{t: number}> = ({t}) => {
  const power = pr(t, B.purestatic - 0.05, B.purestatic + 0.3, easeOut);
  const k = stepAt(t);
  const counter = t >= B.wipes - 0.3 && t < B.l9 ? `STEP ${String(k).padStart(2, '0')}` : undefined;
  const bright = t > B.l9 ? 1 + 0.6 * pr(t, B.l9, B.l9 + 0.3) : 1;
  const flying = STEP_T.map((s, i) => i).filter((i) => t >= STEP_T[i] && t < STEP_T[i] + sheetLife(i));
  return (
    <>
      {/* the shelf the TVs stand on, one per row once the wall appears */}
      {[0, ...(t > T_WALL ? ROWS.filter((r) => r !== 0) : [])].map((r) => (
        <div key={r} style={{position: 'absolute', left: -3000, top: TV.y + TV.h / 2 + 70 + r * PITCH.y, width: 12000, height: 40, background: 'linear-gradient(#5A3A24, #3A2416)', boxShadow: '0 20px 30px rgba(0,0,0,0.4)'}} />
      ))}
      {t > T_WALL && COLS.flatMap((c) => ROWS.map((r) => (c === 0 && r === 0 ? null : <WallTV key={`${c},${r}`} c={c} r={r} t={t} />)))}
      <TVSet x={TV.x} y={TV.y} t={t} power={power} bright={bright} counter={counter} content={<DogScreen t={t} />} />
      <Tapes t={t} />
      {[0, 1, 2].map((i) => <Tile key={i} i={i} t={t} />)}
      <Pile t={t} />
      {flying.map((i) => <Sheet key={i} k={i} t={t} />)}
    </>
  );
};

// the plane in the room: arrives from the camera, unfolds into the sheet with the prompt, the words drop out, then it
// refolds and perches on the TV, and in line 10 it leads the dive into the screen
export const roomPlane = (t: number) => {
  const arrive = pr(t, T_FILL, B.l3 + 0.5, easeOut);
  const unfold = pr(t, B.l3 + 0.45, B.l3 + 0.85, ease), refold = pr(t, B.numbers + 0.3, B.numbers + 0.7, ease);
  const toTV = pr(t, B.numbers + 0.6, B.oldtv - 0.2, ease);
  const dive = pr(t, B.l9 + 0.05, C0 - 0.1, easeIn);
  let x = lerp(150, -40, arrive), y = lerp(-420, -520, arrive) - (1 - arrive) * 120, size = lerp(4200, 560, Math.pow(arrive, 0.6));
  x = lerp(x, TV.x - 150, toTV); y = lerp(y, TV.y - TV.h / 2 - 50, toTV) - Math.sin(toTV * Math.PI) * 300; size = lerp(size, 240, toTV);
  // line 10: from its perch it swoops ahead of the camera into the glass
  x = lerp(x, SCR.x, dive); y = lerp(y, SCR.y + 62, dive); size = lerp(size, 68, dive);
  return {x, y, size, fold: t < B.numbers ? 1 - unfold : refold, rot: lerp(-20, 0, arrive) + toTV * 0 + dive * -90, text: 'a dog surfing on a pizza'};
};
