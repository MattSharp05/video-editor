// Trip clip 01, style B (product UI film): pure black stage, the real interface on a flat
// front-on phone, Trip's orange as the only accent, smooth ease-in-out with no bounce.
// Layout respects the Reels safe area: nothing that must be read above y=220 or below y=1500.
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SANS} from '../styles/fonts';
import {ORANGE, TILES, lerp} from '../styles/shared';
import {clamp, cue, ease, easeInOut, f, prog, TOTAL, WORDS} from '../lib';
import {ACT_LIST, HEADLINES, T} from './timeline';

const W = 1080;
const PW = 455, PH = PW * 2622 / 1206, PX = (W - PW) / 2, PY = 505; // phone screen
const GREY = '#A0A0A0';

// ---------- shared pieces ----------

const Phone: React.FC<{src: string; y?: number; scale?: number; opacity?: number; zoom?: [number, number, number];
  children?: React.ReactNode}> = ({src, y = 0, scale = 1, opacity = 1, zoom = [1, 0.5, 0.5], children}) => (
  <div style={{position: 'absolute', left: PX - 14, top: PY - 14 + y, width: PW + 28, height: PH + 28,
    borderRadius: 74, background: '#1A1A1A', border: '2px solid rgba(255,255,255,0.12)', opacity,
    transform: `scale(${scale})`, transformOrigin: '50% 50%'}}>
    <div style={{position: 'absolute', left: 12, top: 12, width: PW, height: PH, borderRadius: 62,
      overflow: 'hidden', background: '#000'}}>
      <Img src={staticFile(src)} style={{width: PW, height: PH, transform: `scale(${zoom[0]})`,
        transformOrigin: `${zoom[1] * 100}% ${zoom[2] * 100}%`}} />
      {children}
    </div>
  </div>
);

// A TikTok-style saved video thumbnail.
const Thumb: React.FC<{t: (typeof TILES)[number]; x: number; y: number; w: number; o?: number; rot?: number; grey?: number}> =
  ({t, x, y, w, o = 1, rot = 0, grey = 0}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.89, width: w, height: w * 1.78,
    borderRadius: w * 0.08, overflow: 'hidden', background: '#111', border: '2px solid rgba(255,255,255,0.12)',
    opacity: o, transform: `rotate(${rot}deg)`}}>
    <Img src={staticFile(t.photo)} style={{width: '100%', height: '100%', objectFit: 'cover',
      objectPosition: `${(t.i * 23) % 100}% 50%`, filter: `grayscale(${grey}) brightness(${1 - grey * 0.5})`}} />
    {w > 120 && <div style={{position: 'absolute', left: w * 0.07, right: w * 0.07, bottom: w * 0.08, color: '#fff',
      fontSize: w * 0.1, fontWeight: 700, lineHeight: 1.15}}>{t.cap}</div>}
  </div>
);

const Headline: React.FC<{fr: number}> = ({fr}) => {
  const sec = fr / 30;
  const h = HEADLINES.find((c) => sec >= c.s - 0.05 && sec < c.e);
  if (!h) return null;
  const a = prog(fr, f(h.s - 0.05), 6), out = 1 - prog(fr, f(h.e) - 5, 5);
  const parts = h.key ? h.text.split(h.key) : [h.text];
  return (
    <div style={{position: 'absolute', top: 250, left: 70, right: 70, height: 220, display: 'flex',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#fff', fontSize: 74,
      fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.06, opacity: Math.min(a, out),
      transform: `translateY(${(1 - a) * 16}px)`}}>
      <span>{parts[0]}{h.key && <span style={{color: ORANGE}}>{h.key}</span>}{parts[1]}</span>
    </div>
  );
};

const StandIn: React.FC<{label: string}> = ({label}) => (
  <div style={{position: 'absolute', left: 40, top: 1560, color: GREY, fontSize: 26, fontWeight: 500}}>
    Stand-in screenshot · replaced by {label}
  </div>
);

// ---------- acts ----------

// Wall of saved TikToks: 4 columns x 3 rows, built up one by one while a counter ticks to 40.
const wallPos = (i: number) => {
  const col = i % 4, row = Math.floor(i / 4);
  return {x: 195 + col * 230, y: 660 + row * 330};
};

const Hook: React.FC<{fr: number}> = ({fr}) => {
  const end = f(T.none);
  const count = Math.round(interpolate(fr, [0, end - 6], [1, 40], {...clamp, easing: ease}));
  return (
    <>
      {TILES.map((t) => {
        const a = prog(fr, t.i * 5, 8);
        const p = wallPos(t.i);
        return <Thumb key={t.i} t={t} x={p.x} y={p.y + (1 - a) * 40} w={180} o={a} rot={t.rot * 0.15} />;
      })}
      <Counter label="Saved" value={String(count)} fr={fr} accent={false} />
    </>
  );
};

const Counter: React.FC<{label: string; value: string; fr: number; accent: boolean}> = ({label, value, accent}) => (
  <div style={{position: 'absolute', top: 1385, left: 0, width: W, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: '#111', border: '2px solid rgba(255,255,255,0.12)', borderRadius: 999,
      padding: '14px 34px', color: '#fff', fontSize: 46, fontWeight: 700, display: 'flex', gap: 18}}>
      <span style={{color: GREY}}>{label}</span>
      <span style={{color: accent ? ORANGE : '#fff', minWidth: 56, textAlign: 'right'}}>{value}</span>
    </div>
  </div>
);

// The folder all the tiles fall into.
const FOLDER = {x: W / 2, y: 900, w: 420, h: 330};
const Folder: React.FC<{open: number; o: number; burst?: number; zoom?: number}> = ({open, o, burst = 0, zoom = 1}) => (
  <div style={{position: 'absolute', left: FOLDER.x - FOLDER.w / 2, top: FOLDER.y - FOLDER.h / 2,
    width: FOLDER.w, height: FOLDER.h, opacity: o * (1 - burst), transform: `scale(${zoom * (1 + burst * 0.3)})`}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 28, background: '#1A1A1A',
      border: '2px solid rgba(255,255,255,0.12)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: FOLDER.h * (0.25 + 0.75 * (1 - open)),
      borderRadius: 28, background: '#222', border: '2px solid rgba(255,255,255,0.12)'}} />
    <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', color: '#fff',
      fontSize: 48, fontWeight: 700}}>Saved</div>
  </div>
);

// Beat 2 rides the words: tiles grey on "and", fall in on "on the trip", the counter flips to
// Opened on "open", and the lid shuts with the 0 turning orange on "none".
const None: React.FC<{fr: number}> = ({fr}) => {
  const s = f(T.none), fallAt = f(cue('and on the trip')) + 2, openAt = f(cue("you'll open")) + 6, noneAt = f(cue('none'));
  const fall = (i: number) => prog(fr, fallAt + i * 3, 18, easeInOut);
  const push = prog(fr, noneAt, f(T.build) - noneAt + 4, easeInOut); // slow push-in on the shut folder
  const shut = prog(fr, noneAt - 4, 6);
  const grey = prog(fr, s, 10);
  const flipped = fr >= openAt;
  return (
    <>
      <Folder open={1 - shut} o={prog(fr, s, 6)} zoom={lerp(1, 1.14, push)} />
      {TILES.map((t) => {
        const p = wallPos(t.i), q = fall(t.i);
        return <Thumb key={t.i} t={t} x={lerp(p.x, FOLDER.x, q)} y={lerp(p.y, FOLDER.y, q)}
          w={lerp(180, 90, q)} o={1 - prog(fr, fallAt + 15 + t.i * 3, 4)} rot={lerp(t.rot * 0.15, t.rot, q)} grey={grey} />;
      })}
      <Counter label={flipped ? 'Opened' : 'Saved'} value={flipped ? '0' : '40'} fr={fr} accent={fr >= noneAt} />
    </>
  );
};

// Tiles burst out of the folder and fly into the phone, each landing as a pin.
const LAND = TILES.map((t) => t.land);
const Build: React.FC<{fr: number}> = ({fr}) => {
  const s = f(T.build);
  const burst = prog(fr, s, 14, ease);
  const phoneIn = prog(fr, s + 10, 24, ease);
  return (
    <>
      <Folder open={prog(fr, s, 5)} o={1} burst={burst} zoom={1.14} />
      <Phone src="vegas-bucket.png" y={(1 - phoneIn) * 140} opacity={phoneIn} />
      {TILES.map((t) => {
        const fly = prog(fr, s + 22 + t.delay, 34, easeInOut);
        const pin = prog(fr, s + 50 + t.delay, 10);
        const ox = FOLDER.x + t.sx * burst * 0.95, oy = FOLDER.y + t.sy * burst * 0.75;
        const tx = PX + LAND[t.i][0] * PW, ty = PY + (1 - phoneIn) * 140 + LAND[t.i][1] * PH;
        return (
          <React.Fragment key={t.i}>
            <Thumb t={t} x={lerp(ox, tx, fly)} y={lerp(oy, ty, fly)} w={lerp(190, 24, fly)}
              o={burst * (1 - pin)} rot={lerp(t.rot * burst, 0, fly)} />
            <div style={{position: 'absolute', left: tx - 16, top: ty - 16, width: 32, height: 32, borderRadius: 16,
              background: ORANGE, border: '3px solid #000', transform: `scale(${pin})`}} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// REC beats: the phone holds still and the screen does the work; stand-ins until the recordings arrive.
const Copy: React.FC<{fr: number}> = ({fr}) => {
  const s = f(T.copy), b = prog(fr, f(T.asks) - 8, 10), tap = prog(fr, f(T.asks) + 14, 6);
  return (
    <>
      <Phone src="vegas-plan-day-2.png">
        {/* the "Add this TikTok?" banner as LinkBanner.tsx draws it (drawn here as a stand-in) */}
        <div style={{position: 'absolute', left: 14, right: 14, top: 118 + (1 - b) * -30, opacity: b,
          background: '#1A1A1A', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '14px 16px',
          transform: `scale(${1 - tap * 0.03})`}}>
          <div style={{color: '#fff', fontSize: 20, fontWeight: 700}}>Add this TikTok?</div>
          <div style={{color: GREY, fontSize: 15, marginTop: 3}}>Find the places in the link you copied</div>
        </div>
      </Phone>
      <Tap x={PX + PW * 0.5} y={PY + 150} t={tap} />
      <StandIn label="REC 1" />
      {fr < s + 2 ? null : null}
    </>
  );
};

const Tap: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <div style={{position: 'absolute', left: x - 40, top: y - 40, width: 80, height: 80, borderRadius: 40,
    border: `4px solid rgba(255,255,255,${0.8 * (1 - t)})`, transform: `scale(${0.6 + t * 0.8})`,
    opacity: t > 0 ? 1 : 0}} />
);

const Reads: React.FC<{fr: number}> = ({fr}) => {
  const s = f(T.reads), e = f(T.smart);
  return (
    <>
      <Phone src="link-results.png" zoom={[lerp(1, 1.12, prog(fr, s, e - s, easeInOut)), 0.5, 0.62]} />
      <StandIn label="REC 2" />
    </>
  );
};

const Smart: React.FC<{fr: number}> = ({fr}) => {
  const s = f(T.smart), e = f(T.planAll);
  return (
    <>
      <Phone src="vegas-bucket-smart-add.png" zoom={[lerp(1, 1.18, prog(fr, s, e - s, easeInOut)), 0.5, 0.85]} />
      <StandIn label="REC 3" />
    </>
  );
};

const PlanAll: React.FC<{fr: number}> = ({fr}) => (
  <>
    <Phone src="vegas-bucket-plan-all.png" zoom={[lerp(1, 1.1, prog(fr, f(T.planAll), 40, easeInOut)), 0.5, 0.3]} />
    <StandIn label="REC 4" />
  </>
);

// The saves come back as pins on the trip: phone pulls back, thumbnails orbit in and land.
const Saves: React.FC<{fr: number}> = ({fr}) => {
  const s = f(T.saves);
  const back = prog(fr, s, 30, easeInOut);
  return (
    <>
      <Phone src="demo-4-day-planning.png" scale={lerp(1, 0.92, back)} />
      {TILES.slice(0, 8).map((t) => {
        const a = prog(fr, s + 6 + t.i * 3, 26, easeInOut);
        const ang = t.i / 8 * Math.PI * 2;
        const ox = W / 2 + Math.cos(ang) * 470, oy = 1000 + Math.sin(ang) * 620;
        const tx = PX + LAND[t.i][0] * PW, ty = PY + LAND[t.i][1] * PH;
        const pin = prog(fr, s + 30 + t.i * 3, 8);
        return (
          <React.Fragment key={t.i}>
            <Thumb t={t} x={lerp(ox, tx, a)} y={lerp(oy, ty, a)} w={lerp(150, 24, a)} o={(1 - pin) * prog(fr, s + t.i * 3, 8)} rot={t.rot * (1 - a)} />
            <div style={{position: 'absolute', left: tx - 16, top: ty - 16, width: 32, height: 32, borderRadius: 16,
              background: ORANGE, border: '3px solid #000', transform: `scale(${pin})`}} />
          </React.Fragment>
        );
      })}
    </>
  );
};

const End: React.FC<{fr: number}> = ({fr}) => {
  const s = f(T.end), a = prog(fr, s, 14, ease);
  return (
    <div style={{position: 'absolute', top: 760, width: W, display: 'flex', flexDirection: 'column',
      alignItems: 'center', opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
      <div style={{color: '#fff', fontSize: 120, fontWeight: 800, letterSpacing: -3}}>Trip</div>
      <div style={{width: 90, height: 8, borderRadius: 4, background: ORANGE, marginTop: 18}} />
      <div style={{color: GREY, fontSize: 34, fontWeight: 500, marginTop: 10}}>Tell me in the comments</div>
    </div>
  );
};

// Music bed (Kevin MacLeod, "Wallpaper", CC BY 4.0): ducked under the VO by phrase, so gaps
// shorter than 0.6 s stay ducked and the bed doesn't pump between words; fades in and out.
const PHRASES = (() => {
  const out: [number, number][] = [];
  for (const w of WORDS) {
    const last = out[out.length - 1];
    if (last && w.s - last[1] < 0.6) last[1] = w.e; else out.push([w.s, w.e]);
  }
  return out;
})();
const BED = 0.035, GAP = 0.06; // linear gain: VO ~17.5 dB over the bed in 1-4 kHz during speech (measured)
const musicVolume = (fr: number) => {
  const t = fr / 30;
  let duck = 0;
  for (const [a, b] of PHRASES) duck = Math.max(duck, interpolate(t, [a - 0.2, a, b, b + 0.25], [0, 1, 1, 0], clamp));
  const env = interpolate(fr, [0, 6, TOTAL - 36, TOTAL - 1], [0, 1, 1, 0], clamp);
  return env * lerp(GAP, BED, duck);
};

const SCENES: Record<string, React.FC<{fr: number}>> = {
  hook: Hook, none: None, build: Build, copy: Copy, reads: Reads, smart: Smart, planAll: PlanAll, saves: Saves, end: End,
};

export const Film: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const fr = useCurrentFrame();
  const act = ACT_LIST.find((a) => fr >= a.s && fr < a.e) ?? ACT_LIST[ACT_LIST.length - 1];
  const Scene = SCENES[act.name];
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: SANS}}>
      <Scene fr={fr} />
      <Headline fr={fr} />
      {audio && <Audio src={staticFile('vo.m4a')} />}
      {audio && <Audio src={staticFile('music.mp3')} volume={(fr) => musicVolume(fr)} />}
    </AbsoluteFill>
  );
};
