// Desk world (lines 1-3 and the landing in line 10): a craft table under a warm lamp, the phone running our own
// generic prompt app ("Picture Maker"), the collage myth (scissors, three printed photos, scraps glued onto the
// picture slot), static swallowing it, the CRT switch-off into the text box, the typing, the send press and the fold
// into the paper plane. Phone-local coordinates: the phone is 620 x 1270 centred on (0, 0) of the desk world.
import React from 'react';
import {random} from 'remotion';
import {ACCENT, At, B, clamp, ease, easeIn, easeOut, Grid, lerp, pr, win} from './common';
import {drawDogPhoto, drawPizzaPhoto, drawTarget, drawWavePhoto, picURL} from './art';
import {staticImage, stepImage, N} from './engine';
import {Plane} from './Plane';
import {SANS} from './kit/fonts';
import {interpolate} from 'remotion';

export const PW = 620, PH = 1270;
const SX = -290, SY = -615, SW = 580, SH = 1230; // screen rect in phone coords
const SLOT = {x: 0, y: -150, w: 500, h: 375};      // the picture slot (line 1)
export const REPLY = {x: -40, y: -60, w: 440, h: 330}; // the AI's picture bubble (line 10)
const INPUT_Y = 236, KB_TOP = 300;

// ---------- timings ----------
export const T_COLLAPSE = B.static2 + 0.42;          // static squeezes into a line
const T_BOX = T_COLLAPSE + 0.32;                      // the line opens into the text box
const TEXT = 'a dog surfing on a pizza';
// keystrokes: type up to "pizz", hit "s" by mistake, backspace, "a"
type Stroke = {t: number; key: string; text: string};
export const STROKES: Stroke[] = (() => {
  const seq: string[] = [...'a dog surfing on a pizz', 's', '⌫', 'a'];
  const t0 = B.type - 0.12, t1 = B.send - 0.42;
  const w = seq.map((k, i) => (k === ' ' ? 1.25 : k === '⌫' ? 1.9 : 1) * (0.75 + 0.5 * random(`ks${i}`)));
  const sum = w.reduce((a, b) => a + b, 0);
  let t = t0, text = '';
  return seq.map((k, i) => {
    text = k === '⌫' ? text.slice(0, -1) : text + k;
    const s = {t, key: k, text}; t += (w[i] / sum) * (t1 - t0); return s;
  });
})();
export const T_SEND = B.send;                          // thumb hits send
const T_RISE = T_SEND + 0.08, T_FOLD = T_SEND + 0.42, T_FLY = T_SEND + 0.72;
export const T_FILL = B.l3 + 0.12;                     // the plane fills the frame: pass-through to the room
export const T_LAND = B.lands - 0.05;                  // back from the corridor: the picture is in the bubble

// keyboard key centres (phone coords)
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const keyPos = (k: string): [number, number] => {
  if (k === ' ') return [0, KB_TOP + 262];
  if (k === '⌫') return [252, KB_TOP + 188];
  for (let r = 0; r < 3; r++) {
    const i = ROWS[r].indexOf(k);
    if (i >= 0) return [(r === 0 ? -261 : r === 1 ? -232 : -174) + i * 58, KB_TOP + 44 + r * 72];
  }
  return [0, 0];
};
const SEND_POS: [number, number] = [238, INPUT_Y];

// ---------- the desk ----------
const PHOTOS = [
  {id: 'dogp', d: drawDogPhoto, x: -560, y: -760, rot: -9},
  {id: 'pizzap', d: drawPizzaPhoto, x: 590, y: -260, rot: 11},
  {id: 'wavep', d: drawWavePhoto, x: -600, y: 470, rot: 7},
];
const Photo: React.FC<{id: string; d: any; x: number; y: number; rot: number; holes?: number}> = ({id, d, x, y, rot}) => (
  <At x={x} y={y} w={428} h={328} rot={rot} style={{background: '#FBF8F2', boxShadow: '0 18px 30px rgba(0,0,0,0.45)', padding: 14, boxSizing: 'border-box'}}>
    <img src={picURL(id, d)} style={{width: 400, height: 300, display: 'block'}} />
  </At>
);

export const DeskBG: React.FC<{t: number}> = ({t}) => (
  <>
    <div style={{position: 'absolute', left: -2600, top: -2600, width: 5200, height: 5200,
      background: 'repeating-linear-gradient(92deg, #4A2E1B 0px, #573722 38px, #4E311D 70px, #5C3B25 120px, #4A2E1B 160px)'}} />
    <div style={{position: 'absolute', left: -2600, top: -2600, width: 5200, height: 5200,
      background: `radial-gradient(ellipse 1500px 1300px at ${-300 + 40 * Math.sin(t * 0.3)}px -500px, rgba(255,196,120,0.28), rgba(0,0,0,0) 70%), radial-gradient(ellipse 2400px 2400px at 0 0, rgba(0,0,0,0) 30%, rgba(10,5,2,0.6) 100%)`}} />
    {/* a pencil and a few paper offcuts lying around */}
    <At x={560} y={700} w={520} h={26} rot={-32} style={{background: 'linear-gradient(#F3C03C, #D9A21F)', borderRadius: 6, boxShadow: '0 10px 16px rgba(0,0,0,0.4)'}} />
    <At x={-640} y={-120} w={120} h={70} rot={24} style={{background: '#EFE8DA', boxShadow: '0 6px 10px rgba(0,0,0,0.35)'}} />
  </>
);

// ---------- scraps of the collage ----------
// [photo, source rect in the 400x300 photo, landing centre in the slot, landing rotation, landing scale]
const SCRAPS: [number, [number, number, number, number], [number, number], number, number][] = [
  [2, [0, 40, 400, 220], [0, 30], -3, 1.2],        // the wave postcard as the background
  [1, [60, 40, 200, 220], [120, 110], 14, 0.95],   // half a pizza
  [0, [170, 110, 160, 130], [-40, -20], -10, 1.45],// the dog's head, too big
  [0, [80, 180, 170, 90], [-30, 110], 6, 0.9],      // a body that doesn't fit
  [1, [230, 70, 120, 120], [170, -90], -18, 0.8],  // a stray pizza bit
  [2, [220, 80, 90, 100], [-180, -110], 12, 0.9],   // the surfer
  [0, [10, 20, 120, 90], [-190, 120], -16, 0.8],   // a bit of grass
];
const T_SCRAP0 = 0.55;
const scrapTime = (i: number) => T_SCRAP0 + i * ((B.photos + 0.25 - T_SCRAP0) / SCRAPS.length);
const Scrap: React.FC<{i: number; t: number}> = ({i, t}) => {
  const [pi, [sx, sy, sw, sh], [lx, ly], lr, ls] = SCRAPS[i], P = PHOTOS[pi];
  const t0 = scrapTime(i), k = pr(t, t0, t0 + 0.55, easeOut);
  // from its place on the photo (desk) to the slot (in desk coords: slot centre is the phone's slot)
  const fx = P.x - 200 + sx + sw / 2, fy = P.y - 150 + sy + sh / 2;
  const x = lerp(fx, SLOT.x + lx, k), y = lerp(fy, SLOT.y + ly, k) - Math.sin(k * Math.PI) * 160;
  const s = lerp(1, ls, k) * (1 + Math.sin(k * Math.PI) * 0.25), rot = lerp(P.rot, lr, k) + Math.sin(k * Math.PI) * 25;
  // one scrap peels at a corner and flaps at the end of line 1
  const flap = i === 2 ? Math.max(0, Math.sin((t - B.photos) * 9)) * 18 * win(t, B.photos + 0.1, B.l1 + 0.2) : 0;
  const slap = i > 0 ? 1 - 0.12 * Math.max(0, 1 - Math.abs(t - (t0 + 0.55)) * 10) : 1;
  const pts = [0, 1, 2, 3].map((c) => [4 + 6 * random(`sc${i}${c}a`), 4 + 6 * random(`sc${i}${c}b`)]);
  const clip = `polygon(${pts[0][0]}% ${pts[0][1]}%, ${100 - pts[1][0]}% ${pts[1][1]}%, ${100 - pts[2][0]}% ${100 - pts[2][1]}%, ${pts[3][0]}% ${100 - pts[3][1]}%)`;
  if (t < t0 - 0.05) return null;
  return (
    <At x={x} y={y} w={sw + 20} h={sh + 20} rot={rot} style={{transform: `rotate(${rot}deg) scale(${s * slap}) perspective(600px) rotateX(${flap}deg)`, transformOrigin: '50% 100%',
      filter: `drop-shadow(0 ${6 + 14 * Math.sin(k * Math.PI)}px 8px rgba(0,0,0,0.4))`}}>
      <div style={{position: 'absolute', inset: 0, background: '#FDFBF6', clipPath: clip}} />
      <div style={{position: 'absolute', inset: 10, clipPath: clip, backgroundImage: `url(${picURL(['dogp', 'pizzap', 'wavep'][pi], [drawDogPhoto, drawPizzaPhoto, drawWavePhoto][pi])})`,
        backgroundSize: '400px 300px', backgroundPosition: `${-sx}px ${-sy}px`, filter: `brightness(${[1.08, 0.86, 1.0, 1.15, 0.9, 1.05, 0.8][i]}) saturate(${[1, 1.3, 0.9, 1.2, 1, 0.9, 1.1][i]})`}} />
    </At>
  );
};

// ---------- scissors (frame 0 is mid-snip on the dog photo) ----------
const Scissors: React.FC<{t: number}> = ({t}) => {
  const snip = Math.abs(Math.sin(t * 7.5)) * 16; // blades open and close
  const knocked = pr(t, B.static2 - 0.1, B.static2 + 0.7, easeIn);
  const x = -470 + t * 60 + knocked * -700, y = -700 + t * 18 + knocked * -300;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${-28 + knocked * -160}deg)`, filter: 'drop-shadow(0 16px 12px rgba(0,0,0,0.45))'}}>
      {[1, -1].map((s) => (
        <svg key={s} width={420} height={140} viewBox="-30 -70 420 140" style={{position: 'absolute', left: -30, top: -70, transform: `rotate(${s * snip}deg)`, transformOrigin: '30px 70px', overflow: 'visible'}}>
          <path d={`M0 0 L330 ${-6 * s} L340 ${2 * s} L0 ${10 * s} Z`} fill={s > 0 ? '#D9DEE3' : '#BCC3CA'} stroke="#7C858E" strokeWidth={2} />
          <ellipse cx={-70} cy={34 * s} rx={56} ry={34} fill="none" stroke={s > 0 ? '#E2453C' : '#C8352E'} strokeWidth={20} />
          <path d={`M-20 ${14 * s} L10 ${4 * s}`} stroke={s > 0 ? '#E2453C' : '#C8352E'} strokeWidth={22} strokeLinecap="round" />
        </svg>
      ))}
      <div style={{position: 'absolute', left: -9, top: -9, width: 18, height: 18, borderRadius: 9, background: '#888', border: '3px solid #555'}} />
    </div>
  );
};
const GlueStick: React.FC<{t: number}> = ({t}) => {
  // dabs onto the slot as each scrap lands, then gets knocked away by the static
  const ph = (t - T_SCRAP0) / ((B.photos + 0.25 - T_SCRAP0) / SCRAPS.length);
  const dab = t > T_SCRAP0 + 0.4 && t < B.photos + 0.9 ? Math.max(0, Math.sin(ph * Math.PI * 2)) : 0;
  const knocked = pr(t, B.static2 - 0.05, B.static2 + 0.7, easeIn);
  const x = 430 + knocked * 700, y = 420 - dab * 40 + knocked * 300;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${-20 + knocked * 140}deg) scale(${1 + dab * 0.06})`, filter: `drop-shadow(0 ${14 + dab * 18}px 12px rgba(0,0,0,0.45))`}}>
      <div style={{width: 92, height: 300, borderRadius: 14, background: 'linear-gradient(90deg, #3E6FC4, #5B8BE0 45%, #2F5AA6)'}} />
      <div style={{position: 'absolute', left: 6, top: -60, width: 80, height: 70, borderRadius: '30px 30px 6px 6px', background: 'linear-gradient(90deg, #EDEDE6, #FFFFFF 45%, #D8D8CF)'}} />
      <div style={{position: 'absolute', left: 10, top: 120, width: 72, fontFamily: SANS, fontWeight: 800, fontSize: 22, color: '#fff', textAlign: 'center', transform: 'rotate(-90deg)'}}>GLUE</div>
    </div>
  );
};

// ---------- the thumb ----------
const Thumb: React.FC<{t: number}> = ({t}) => {
  const on = win(t, B.type - 0.35, T_SEND + 0.55, 0.3);
  if (on <= 0) return null;
  // aim: the key being pressed now, easing toward the next one
  let i = STROKES.findIndex((s) => s.t > t) - 1; if (i < -1) i = STROKES.length - 1;
  const cur = i >= 0 ? keyPos(STROKES[i].key) : keyPos('a');
  const nxtS = STROKES[i + 1];
  const nxt = t > STROKES[STROKES.length - 1].t + 0.05 ? SEND_POS : nxtS ? keyPos(nxtS.key) : SEND_POS;
  const tNext = nxtS ? nxtS.t : T_SEND, tCur = i >= 0 ? STROKES[i].t : B.type - 0.5;
  const k = pr(t, tCur + 0.04, tNext - 0.01, ease);
  let x = lerp(cur[0], nxt[0], k), y = lerp(cur[1], nxt[1], k);
  const press = Math.max(0, 1 - Math.abs(t - (k > 0.9 ? tNext : tCur)) * 14) + Math.max(0, 1 - Math.abs(t - T_SEND) * 7);
  const lift = Math.sin(k * Math.PI) * 20;
  const away = 1 - on;
  return (
    <div style={{position: 'absolute', left: x + 30 + away * 260, top: y + 18 - lift + away * 500, transform: `rotate(-32deg) scale(${1 - 0.04 * press})`, transformOrigin: '0 0',
      filter: `drop-shadow(${10 + lift * 0.4}px ${18 + lift}px 14px rgba(40,20,10,0.45))`}}>
      <div style={{position: 'absolute', left: -62, top: -16, width: 124, height: 520, borderRadius: '62px 62px 40px 40px',
        background: 'linear-gradient(90deg, #C98B66 0%, #EAB591 35%, #F2C4A2 55%, #D79C77 100%)'}} />
      <div style={{position: 'absolute', left: -40, top: 2, width: 80, height: 96, borderRadius: '40px 40px 22px 22px',
        background: 'linear-gradient(180deg, #FBE2D3, #F1C9B3)', boxShadow: 'inset 0 -3px 0 rgba(180,110,80,0.35)'}} />
      <div style={{position: 'absolute', left: -46, top: 120, width: 92, height: 6, borderRadius: 3, background: 'rgba(150,90,60,0.35)'}} />
    </div>
  );
};

// ---------- the phone ----------
const Keyboard: React.FC<{t: number}> = ({t}) => {
  const up = pr(t, T_COLLAPSE + 0.05, T_BOX + 0.25, easeOut), down = pr(t, T_SEND + 0.2, T_SEND + 0.7, ease);
  const y = (1 - up) * 340 + down * 340;
  let i = STROKES.findIndex((s) => s.t > t) - 1; if (i < -1) i = STROKES.length - 1;
  const act = i >= 0 && t - STROKES[i].t < 0.13 ? STROKES[i].key : null;
  const key = (k: string, x: number, yy: number, w = 52, label = k) => {
    const on = act === k;
    return (
      <React.Fragment key={k + x}>
        <div style={{position: 'absolute', left: x - w / 2 - SX, top: yy - 30 - KB_TOP, width: w, height: 60, borderRadius: 10, background: on ? '#9AA0A8' : '#5E6168',
          boxShadow: '0 2px 0 rgba(0,0,0,0.45)', color: '#fff', fontFamily: SANS, fontSize: 30, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{label}</div>
        {on && k.length === 1 && k !== ' ' && k !== '⌫' && (
          <div style={{position: 'absolute', left: x - 42 - SX, top: yy - 150 - KB_TOP, width: 84, height: 100, borderRadius: 16, background: '#7A7E86',
            boxShadow: '0 6px 16px rgba(0,0,0,0.5)', color: '#fff', fontFamily: SANS, fontSize: 56, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{k}</div>
        )}
      </React.Fragment>
    );
  };
  return (
    <div style={{position: 'absolute', left: 0, top: KB_TOP - SY, width: SW, height: SH - (KB_TOP - SY), transform: `translateY(${y}px)`, background: 'rgba(38,40,46,0.96)'}}>
      {ROWS.flatMap((r, ri) => [...r].map((k) => { const [x, yy] = keyPos(k); return key(k, x, yy); }))}
      {key('⇧', -261, KB_TOP + 188, 52)}
      {key('⌫', 252, KB_TOP + 188, 66, '⌫')}
      {key(' ', 0, KB_TOP + 262, 300, 'space')}
    </div>
  );
};

// the frosted text box with the caret (it is born from the static's switch-off line)
const InputBox: React.FC<{t: number}> = ({t}) => {
  const born = pr(t, T_COLLAPSE + 0.12, T_BOX + 0.1, easeOut);
  if (t < T_COLLAPSE + 0.12) return null;
  let i = STROKES.findIndex((s) => s.t > t) - 1; if (i < -1) i = STROKES.length - 1;
  const typed = t >= T_RISE ? '' : i >= 0 ? STROKES[i].text : '';
  const caret = Math.floor(t * 2.2) % 2 === 0 || (i >= 0 && t - STROKES[i].t < 0.4);
  const press = Math.max(0, 1 - Math.abs(t - T_SEND) * 8);
  const down = pr(t, T_SEND + 0.2, T_SEND + 0.7, ease) * (t < T_LAND ? 1 : 0);
  const y = INPUT_Y + down * 340 + (t >= T_LAND ? 340 : 0);
  return (
    <>
      <div style={{position: 'absolute', left: -265 - SX, top: y - 31 - SY, width: 460, height: 62, borderRadius: 31, transform: `scaleY(${lerp(0.06, 1, born)})`,
        background: `rgba(255,255,255,${lerp(0.9, 0.1, born)})`, border: '2px solid rgba(255,255,255,0.22)', boxShadow: born < 1 ? `0 0 ${40 * (1 - born)}px rgba(255,255,255,0.8)` : undefined,
        display: 'flex', alignItems: 'center', paddingLeft: 26, boxSizing: 'border-box', fontFamily: SANS, fontSize: 30, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden'}}>
        {born > 0.8 && typed && <span>{typed}</span>}
        <span style={{display: 'inline-block', width: 3, height: 36, background: ACCENT, marginLeft: 2, opacity: born > 0.8 && caret && t < T_RISE ? 1 : 0}} />
        {born > 0.8 && !typed && <span style={{color: 'rgba(255,255,255,0.4)', marginLeft: 6}}>Describe a picture…</span>}
      </div>
      {/* send button: squashes when the thumb hits it */}
      <div style={{position: 'absolute', left: SEND_POS[0] - 30 - SX, top: y - 30 - SY, width: 60, height: 60, borderRadius: 30, opacity: born,
        background: typed || t > T_SEND - 0.1 ? ACCENT : 'rgba(255,255,255,0.18)', transform: `scale(${1 - 0.22 * press}, ${1 - 0.3 * press})`,
        boxShadow: typed ? `0 0 ${18 + 30 * press}px rgba(255,181,71,0.55)` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {t < T_FOLD && <svg width={30} height={30} viewBox="0 0 30 30"><path d="M15 25 V6 M7 13 L15 5 L23 13" stroke="#2A1A08" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
    </>
  );
};

const AppIcon = () => (
  <svg width={44} height={44} viewBox="0 0 44 44"><rect width={44} height={44} rx={12} fill={ACCENT} />
    <path d="M22 8 L25 19 L36 22 L25 25 L22 36 L19 25 L8 22 L19 19 Z" fill="#2A1A08" /></svg>
);

const Screen: React.FC<{t: number; phase: 'start' | 'end'}> = ({t, phase}) => {
  const fr = Math.round(t * 30);
  // static: fizzes out of the slot's seams first, then the whole screen
  const slotStatic = phase === 'start' ? pr(t, B.l1 - 0.1, B.static2 - 0.5) : 0;
  const fullStatic = phase === 'start' ? pr(t, B.static2 - 0.55, B.static2 - 0.05, easeIn) : 0;
  const squeeze = pr(t, T_COLLAPSE - 0.05, T_COLLAPSE + 0.22, easeIn), gone = pr(t, T_COLLAPSE + 0.2, T_COLLAPSE + 0.36);
  const chatIn = phase === 'end' ? 1 : pr(t, T_COLLAPSE + 0.15, T_BOX + 0.3);
  const rise = pr(t, T_RISE, T_FOLD, easeOut), fold = pr(t, T_FOLD, T_FLY, ease);
  return (
    <div style={{position: 'absolute', left: SX, top: SY, width: SW, height: SH, borderRadius: 66, overflow: 'hidden',
      background: 'linear-gradient(180deg, #1D1A22 0%, #15131A 100%)'}}>
      {/* status bar + header */}
      <div style={{position: 'absolute', left: 44, top: 26, fontFamily: SANS, fontSize: 26, fontWeight: 700, color: '#fff'}}>9:41</div>
      <div style={{position: 'absolute', right: 44, top: 30, width: 44, height: 20, borderRadius: 6, border: '2px solid rgba(255,255,255,0.7)'}}>
        <div style={{position: 'absolute', left: 2, top: 2, width: 30, height: 12, borderRadius: 3, background: '#fff'}} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 78, height: 84, display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 36,
        borderBottom: '1px solid rgba(255,255,255,0.08)', fontFamily: SANS, fontSize: 32, fontWeight: 800, color: '#fff'}}>
        <AppIcon /> Picture Maker
      </div>
      {phase === 'start' && t < T_COLLAPSE + 0.4 && (
        // the picture slot where the collage myth gets glued
        <div style={{position: 'absolute', left: SLOT.x - SLOT.w / 2 - SX, top: SLOT.y - SLOT.h / 2 - SY, width: SLOT.w, height: SLOT.h, borderRadius: 24,
          background: 'rgba(255,255,255,0.06)', border: '3px dashed rgba(255,255,255,0.18)', boxSizing: 'border-box'}} />
      )}
      {phase === 'start' && (slotStatic > 0 || fullStatic > 0) && gone < 1 && (
        // the static that swallows the collage, then switches off like an old TV
        <div style={{position: 'absolute', left: 0, top: 0, width: SW, height: SH, transformOrigin: `50% ${INPUT_Y - SY}px`,
          transform: `scale(${lerp(1, 0.8, squeeze)}, ${lerp(1, 0.005, squeeze)})`, opacity: 1 - gone,
          clipPath: fullStatic < 1 ? `inset(${lerp(SLOT.y - SLOT.h / 2 - SY, 0, fullStatic)}px ${lerp(SLOT.x - SLOT.w / 2 - SX, 0, fullStatic)}px ${lerp(SH - (SLOT.y + SLOT.h / 2 - SY), 0, fullStatic)}px ${lerp(SLOT.x - SLOT.w / 2 - SX, 0, fullStatic)}px round 24px)` : undefined,
          filter: `brightness(${1 + squeeze * 2.5})`}}>
          <Grid img={staticImage(fr)} style={{opacity: Math.max(slotStatic, fullStatic)}} />
        </div>
      )}
      {/* the chat */}
      <div style={{position: 'absolute', inset: 0, opacity: chatIn}}>
        {phase === 'start' && t >= T_RISE && t < T_FLY + 0.05 && (
          <div style={{position: 'absolute', right: 30, top: lerp(INPUT_Y - SY - 34, 300, rise), padding: '20px 28px', borderRadius: '34px 34px 10px 34px', background: ACCENT,
            fontFamily: SANS, fontSize: 32, fontWeight: 700, color: '#2A1A08', whiteSpace: 'nowrap', transformOrigin: '100% 50%',
            transform: `scale(${lerp(1, 0.2, fold)}) translateX(${fold * 120}px)`, opacity: 1 - pr(t, T_FOLD + 0.1, T_FLY)}}>{TEXT}</div>
        )}
        {phase === 'end' && (
          <>
            <div style={{position: 'absolute', right: 30, top: 200, padding: '20px 28px', borderRadius: '34px 34px 10px 34px', background: ACCENT,
              fontFamily: SANS, fontSize: 32, fontWeight: 700, color: '#2A1A08', whiteSpace: 'nowrap'}}>{TEXT}</div>
            <div style={{position: 'absolute', left: REPLY.x - REPLY.w / 2 - SX, top: REPLY.y - REPLY.h / 2 - SY, width: REPLY.w, height: REPLY.h, borderRadius: 28, overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>
              <Grid img={stepImage('target', drawTarget, N)} />
            </div>
            <div style={{position: 'absolute', left: REPLY.x - REPLY.w / 2 - SX + 8, top: REPLY.y + REPLY.h / 2 - SY + 14, fontFamily: SANS, fontSize: 24, fontWeight: 600,
              color: 'rgba(255,255,255,0.55)'}}>Picture Maker · just now</div>
          </>
        )}
        <InputBox t={t} />
        {phase === 'start' && <Keyboard t={t} />}
      </div>
      {/* glass: a soft diagonal highlight that slides a little with time */}
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${115 + 4 * Math.sin(t * 0.4)}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.07) 42%, rgba(255,255,255,0) 54%)`}} />
    </div>
  );
};

export const Phone: React.FC<{t: number; phase: 'start' | 'end'; shake?: number}> = ({t, phase, shake = 0}) => (
  <div style={{position: 'absolute', left: -PW / 2, top: -PH / 2, width: PW, height: PH, transform: `rotate(${shake}deg)`}}>
    <div style={{position: 'absolute', inset: -10, borderRadius: 104, background: 'rgba(0,0,0,0.55)', filter: 'blur(36px)', transform: 'translate(30px, 50px)'}} />
    {/* titanium frame */}
    <div style={{position: 'absolute', inset: 0, borderRadius: 96, background: 'linear-gradient(135deg, #B8BDC4 0%, #6C7178 30%, #4A4E55 60%, #9AA0A7 100%)'}} />
    <div style={{position: 'absolute', inset: 5, borderRadius: 91, background: '#050506'}} />
    {[[-316, -330, 70], [-316, -230, 70], [316, -260, 120]].map(([x, y, h], i) => (
      <div key={i} style={{position: 'absolute', left: x + PW / 2 - 4, top: y + PH / 2, width: 8, height: h, borderRadius: 4, background: '#5C6168'}} />
    ))}
    <div style={{position: 'absolute', left: PW / 2, top: PH / 2}}>
      <Screen t={t} phase={phase} />
      {/* dynamic island */}
      <div style={{position: 'absolute', left: -70, top: SY + 20, width: 140, height: 40, borderRadius: 20, background: '#000'}} />
    </div>
    {/* glass edge catching the lamp */}
    <div style={{position: 'absolute', inset: 5, borderRadius: 91, boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.25), inset -1px -1px 0 rgba(255,255,255,0.08)'}} />
  </div>
);

// ---------- the desk world as a whole ----------
export const DeskWorld: React.FC<{t: number; phase: 'start' | 'end'}> = ({t, phase}) => {
  const shake = phase === 'end' ? Math.sin((t - B.phone) * 40) * 1.6 * Math.max(0, 1 - Math.abs(t - B.phone - 0.15) * 4) * (t > B.phone - 0.1 ? 1 : 0) : 0;
  return (
    <>
      <DeskBG t={t} />
      {PHOTOS.map((p) => <Photo key={p.id} {...p} />)}
      {phase === 'start' && <GlueStick t={t} />}
      <Phone t={t} phase={phase} shake={shake} />
      {phase === 'start' && t < T_COLLAPSE && SCRAPS.map((_, i) => {
        // scraps dissolve into the static from the seams
        const fade = 1 - pr(t, B.static2 - 0.6, B.static2 - 0.1);
        return <div key={i} style={{opacity: fade}}><Scrap i={i} t={t} /></div>;
      })}
      {phase === 'start' && <Scissors t={t} />}
      {phase === 'start' && <Thumb t={t} />}
    </>
  );
};

// the plane leaving the phone: folds from the bubble at the send button side, then flies at the camera
export const deskPlane = (t: number) => {
  const fold = pr(t, T_FOLD, T_FLY, ease);
  const fly = pr(t, T_FLY, T_FILL, easeIn);
  // desk coords: starts at the risen bubble, flies right and toward the camera (grows)
  const x = lerp(170, 420, fly), y = lerp(-300, -380, fly) - Math.sin(fly * Math.PI) * 120;
  const size = lerp(lerp(90, 220, fold), 5200, Math.pow(fly, 2.2));
  return {on: t >= T_FOLD && t < T_FILL, x, y, size, fold, rot: lerp(-10, -24, fly)};
};
export {interpolate, clamp};
