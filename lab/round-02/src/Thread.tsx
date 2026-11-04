// Round 2: one continuous shot along the thread in THREAD.md. 60 fps, no cuts.
// Everything lives in one world under one camera; each scene is born from the previous lead.
import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {Caption, Frame} from './kit/caption';
import {SANS} from './kit/fonts';
import {ACCENT, Cam, Layer, P, Stage, arrive, camAt, clamp, leave, lerp, t01, travel} from './kit/space';
import {Glass, GlassDefs, UI_ON_GLASS} from './kit/glass';

export const FPS60 = 60, DUR = 1260;
const SRC = staticFile('vegas-bucket.png');
const PHOTO = staticFile('photos/strip-2012.jpg');
const K = 0.6;                      // screenshot px -> world px for the phone
const SW = 1206, SH = 2622;
const wy = (sy: number) => (sy - SH / 2) * K;   // screenshot y -> world y (phone centred at 0,0)
const wx = (sx: number) => (sx - SW / 2) * K;
const spr = (fr: number, at: number, damping = 16, stiffness = 140) =>
  spring({frame: fr - at, fps: FPS60, config: {damping, stiffness, mass: 1}});

// ---- world layout ----
const CARD = {y: -1150, w: 560, h: 996};          // the TikTok, high above the floor
const MAP = {w: SW * K, h: 898 * K, y: wy(566 + 449)}; // the map region as it sits in the phone
const FLOOR_Y = 520;                              // where the map lies as a floor before it stands up
// caption lines on the card, each place name at the start of its line (so its position is known)
const LINES = [
  {t: 'Where locals eat in Vegas:'},
  {name: "Esther's Kitchen", t: ' downtown,', mx: 0.60, my: 0.16},
  {name: 'Eggslut', t: ' at the Cosmo,', mx: 0.38, my: 0.56},
  {name: 'Tacos El Gordo', t: ' on the Strip,', mx: 0.78, my: 0.66},
  {name: 'Kaiseki Yuzu', t: ' if you can find it.', lost: true, mx: 0.2, my: 0.8},
];
const CAP = {x: -CARD.w / 2 + 34, y: CARD.y + 170, line: 46, size: 31};
const PLACES = LINES.filter((l) => l.name);

// ---- beats (frames) ----
const B = {grow: [10, 100], read: [110, 290], split: [300, 470], route: [480, 610], stand: [620, 760], fold: [790, 850],
  macro: [870, 1060], end: [1060, 1260]} as const;

// The suitcase, front view: lid open -> shuts -> zip runs -> handle pops (from round 1, S6).
const Suitcase: React.FC<{t: number; lit: number}> = ({t, lit}) => {
  const shut = t01(t, 0, 24, arrive), thud = interpolate(t, [24, 28, 34], [0, 1, 0], clamp);
  const zip = t01(t, 30, 80, travel), handle = spr(t, 84, 12, 200);
  const ink = lit > 0.5 ? ACCENT : '#fff', px = lerp(28, 172, zip), hy = -handle * 22;
  return (
    <svg viewBox="0 0 200 210" width="100%" height="100%" style={{overflow: 'visible'}}>
      <g transform={`translate(100 185) scale(${1 + thud * 0.05} ${1 - thud * 0.06}) translate(-100 -185)`}>
        <path d={`M 80 ${52 + hy} L 80 ${34 + hy} Q 80 ${26 + hy} 88 ${26 + hy} L 112 ${26 + hy} Q 120 ${26 + hy} 120 ${34 + hy} L 120 ${52 + hy}`}
          stroke={ink} strokeWidth={9} fill="none" strokeLinecap="round" opacity={shut} />
        <g opacity={1 - shut}>
          <rect x={34} y={74} width={60} height={30} rx={6} fill="#2C2C30" stroke="#fff" strokeWidth={3} />
          <rect x={98} y={70} width={66} height={34} rx={6} fill="#2C2C30" stroke="#fff" strokeWidth={3} />
          <rect x={60} y={64} width={40} height={14} rx={5} fill={ACCENT} />
        </g>
        <rect x={20} y={100} width={160} height={85} rx={20} stroke={ink} strokeWidth={9} fill="rgba(20,20,24,0.85)" />
        <g transform={`rotate(${lerp(-24, 0, shut)} 20 100) translate(0 ${lerp(-14, 0, shut)})`}>
          <rect x={20} y={50} width={160} height={52} rx={20} stroke={ink} strokeWidth={9} fill="rgba(20,20,24,0.85)" />
        </g>
        <line x1={28} y1={101} x2={172} y2={101} stroke="#fff" strokeWidth={4} strokeDasharray="3 5" opacity={shut} />
        <line x1={28} y1={101} x2={px} y2={101} stroke={ACCENT} strokeWidth={6} strokeLinecap="round" opacity={shut} />
        <rect x={px - 6} y={98} width={12} height={22} rx={4} fill="#fff" opacity={shut} />
        <circle cx={55} cy={194} r={8} fill={ink} /><circle cx={145} cy={194} r={8} fill={ink} />
      </g>
    </svg>
  );
};

const slice = (sy: number, sh: number): React.CSSProperties => ({backgroundImage: `url(${SRC})`,
  backgroundSize: `${SW * K}px ${SH * K}px`, backgroundPosition: `0px ${-sy * K}px`, filter: UI_ON_GLASS});

export const Thread: React.FC = () => {
  const fr = useCurrentFrame();

  // ---------- camera: one move for the whole film ----------
  const cam: Cam = camAt(fr, [
    [0, {dist: P * 0.9, ty: CARD.y - 90}],
    [100, {dist: P * 1.0, ty: CARD.y - 90, pitch: 4}, arrive],
    [290, {dist: P * 0.84, ty: CARD.y + 120, pitch: 6, yaw: -4}],                    // lean into the caption
    [360, {dist: P * 1.1, ty: (CARD.y + FLOOR_Y) / 2, pitch: -12, yaw: 2}, travel],      // follow the names down...
    [430, {dist: P * 1.0, ty: FLOOR_Y - 40, pitch: -30, yaw: 6}, arrive],                // ...onto the floor
    [470, {dist: P * 0.98, ty: FLOOR_Y - 30, pitch: -32, yaw: 4}],
    [610, {dist: P * 0.96, ty: FLOOR_Y - 20, pitch: -28, yaw: -10}],                          // ride the route
    [760, {dist: P * 1.55, ty: MAP.y + 140, pitch: 22, yaw: -30, roll: -3}, travel],    // floor stands up: the app assembles around it
    [850, {dist: P * 1.4, ty: 40, pitch: 0, yaw: 0}, travel],                           // fold flat, face it
    [960, {dist: P * 1.28, ty: 110, pitch: 3, yaw: -3}, arrive],                        // lean toward the lifted row
    [1060, {dist: P * 1.4, ty: 40}],
    [1150, {dist: P * 1.6, ty: 160}, travel],                                           // pull back for the end card
    [1260, {dist: P * 1.55, ty: 160}],
  ]);
  const drift = Math.sin(fr / 140) * 0.8;
  const camF = {...cam, yaw: cam.yaw + drift};

  // ---------- beat A: point -> TikTok card ----------
  const grow = t01(fr, B.grow[0], B.grow[1], arrive);
  const cw = lerp(26, CARD.w, grow), ch = lerp(26, CARD.h, Math.pow(grow, 0.8));
  const pulse = fr < B.grow[0] + 10 ? 1 + Math.sin(fr / 3) * 0.08 : 1;

  // ---------- beat B: reading ----------
  const readP = interpolate(fr, [B.read[0], B.read[1] - 20], [0, LINES.length], clamp); // line position of the reading light
  // ---------- beat C: names split off and fall to the floor ----------
  const depart = (i: number) => t01(fr, B.split[0] + i * 12, B.split[0] + 100 + i * 12, travel);
  // ---------- beat E: the floor stands up into the app ----------
  const up = t01(fr, B.stand[0], B.stand[0] + 110, travel);
  const floorRx = lerp(90, 0, up), floorY = lerp(FLOOR_Y, MAP.y, up);
  const arriveL = (i: number) => t01(fr, B.stand[0] + 50 + i * 10, B.stand[0] + 120 + i * 10, arrive); // other layers fly in
  const fold = t01(fr, B.fold[0], B.fold[1], travel);
  const lift = (i: number) => (1 - fold) * arriveL(i);
  const Z = {header: 170, sheet: 110, tab: 260};
  const appIn = (i: number) => arriveL(i);

  // ---------- beat F: component macro ----------
  const rowY = wy(2133), rowH = 190 * K, rowW = SW * K - 34;
  const mUp = t01(fr, 880, 920, arrive), press = interpolate(fr, [930, 936, 946], [0, 1, 0], clamp);
  const glow = t01(fr, 934, 946), fly = t01(fr, 960, 1004, travel), pillPop = spr(fr, 1004, 12, 220);
  const sun = {x: wx(687), y: wy(427)};
  const rx_ = lerp(0, sun.x, fly), ry_ = lerp(lerp(rowY, 120, mUp), sun.y, fly); // lifts to mid-frame so it is never under the platform UI
  const rz = lerp(0, 260, mUp * (1 - fly)) + Math.sin(fly * Math.PI) * 180;
  const rs = lerp(1.25, 0.24, fly) * lerp(1 / 1.25, 1, mUp);
  const toast = t01(fr, 1010, 1032, arrive);
  // ---------- beat G: the confirmation becomes a point, travels to the suitcase ----------
  const toDot = t01(fr, 1060, 1084, travel), dotGo = t01(fr, 1084, 1112, travel);
  const suitcase = {x: wx(216), y: wy(2440)};
  const toastY = wy(2240);
  const dotX = lerp(0, suitcase.x, dotGo), dotY = lerp(toastY, suitcase.y, dotGo) - Math.sin(dotGo * Math.PI) * 120;
  const sUp = t01(fr, 1112, 1160, arrive);
  const appFade = 1 - t01(fr, 1120, 1180, travel) * 0.94;
  const sx = lerp(suitcase.x, 0, sUp), sy = lerp(suitcase.y, -160, sUp), sSize = lerp(60, 420, sUp);
  const endIn = t01(fr, 1205, 1240, arrive);

  const appVisible = fr >= B.stand[0] + 40;
  return (
    <Frame>
      <GlassDefs />
      <Stage cam={camF}>
        {/* ============ the TikTok card ============ */}
        {fr < B.stand[1] && (
          <Glass y={CARD.y} w={cw} h={ch} radius={lerp(13, 38, grow)} look="clear" turn={camF.yaw} thickness={12}
            scale={pulse} style={{opacity: 1 - t01(fr, B.split[1] - 40, B.split[1] + 40)}}>
            <div style={{position: 'absolute', inset: 0, background: ACCENT, opacity: 1 - t01(fr, B.grow[0] + 20, B.grow[0] + 60)}} />
            <div style={{position: 'absolute', inset: 0, opacity: t01(fr, B.grow[0] + 30, B.grow[1])}}>
              <Img src={PHOTO} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover',
                transform: `scale(${1.15 - fr * 0.0003})`, filter: `brightness(${lerp(0.95, 0.45, t01(fr, B.read[0], B.read[0] + 40))})`}} />
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: '62%', background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.85))'}} />
              {/* right rail */}
              {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', right: 22, top: 420 + i * 92, width: 54, height: 54,
                borderRadius: '50%', border: '3px solid rgba(255,255,255,0.85)'}} />)}
              <div style={{position: 'absolute', left: 34, top: CAP.y - CARD.y + CARD.h / 2 - 64, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 26}}>@vegas.eats</div>
            </div>
          </Glass>
        )}
        {/* caption lines, as their own layer on the card so names can leave it */}
        {fr < B.stand[1] && LINES.map((l, i) => {
          const y = CAP.y + i * CAP.line;
          const lit = interpolate(readP, [i - 0.2, i + 0.6], [0, 1], clamp);
          const vis = t01(fr, B.grow[1] - 20, B.grow[1]);
          const fade = 1 - t01(fr, B.split[0] + 40, B.split[0] + 90);
          return (
            <Layer key={i} x={CAP.x} y={y} z={2} w={1} h={1} style={{overflow: 'visible', opacity: vis}}>
              <div style={{position: 'absolute', left: 0, top: -CAP.size * 0.6, whiteSpace: 'nowrap', fontFamily: SANS, fontSize: CAP.size, fontWeight: 600}}>
                {l.name && <span style={{color: 'transparent'}}>{l.name}</span>}
                <span style={{color: `rgba(255,255,255,${(0.4 + 0.6 * lit) * fade})`}}>{l.t}</span>
              </div>
              {/* the reading light: a soft glow that travels along the line */}
              <div style={{position: 'absolute', left: interpolate(readP, [i, i + 1], [-40, 480], clamp) - 60, top: -32, width: 120, height: 56,
                borderRadius: 30, background: 'radial-gradient(rgba(255,255,255,0.35), rgba(255,255,255,0) 70%)',
                opacity: readP > i && readP < i + 1 ? 1 : 0}} />
            </Layer>
          );
        })}
        {/* the place names: they brighten as read, lift off, and fall to their pins */}
        {fr < B.stand[0] + 120 && PLACES.map((l, i) => {
          const lineI = LINES.indexOf(l);
          const lit = interpolate(readP, [lineI - 0.2, lineI + 0.5], [0, 1], clamp);
          const d = depart(i);
          const x0 = CAP.x, y0 = CAP.y + lineI * CAP.line;
          // landing spot on the floor, in world space (floor lies flat at FLOOR_Y)
          const fx = (l.mx! - 0.5) * MAP.w, fz = (l.my! - 0.5) * MAP.h;
          const x = lerp(x0, fx, d), y = lerp(y0, FLOOR_Y - 90, d), z = lerp(2, fz, d) + Math.sin(d * Math.PI) * 260;
          const land = t01(fr, B.split[0] + 80 + i * 14, B.split[0] + 100 + i * 14);
          if (l.lost) {
            const fall = t01(fr, B.split[0] + 30, B.split[0] + 110, leave);
            return (
              <Layer key={l.name} x={x0} y={y0 + fall * 500} z={2} w={1} h={1} style={{overflow: 'visible', opacity: (1 - fall) * t01(fr, B.grow[1] - 20, B.grow[1])}}>
                <div style={{position: 'absolute', top: -CAP.size * 0.6, whiteSpace: 'nowrap', fontFamily: SANS, fontSize: CAP.size,
                  fontWeight: 600, color: fall > 0.05 ? '#777' : `rgba(255,255,255,${0.4 + 0.6 * lit})`, transform: `rotate(${fall * 12}deg)`}}>{l.name}</div>
              </Layer>
            );
          }
          return (
            <Layer key={l.name} x={x} y={y} z={z} w={1} h={1} style={{overflow: 'visible', opacity: (1 - land) * t01(fr, B.grow[1] - 20, B.grow[1])}}>
              <div style={{position: 'absolute', top: -CAP.size * 0.6, whiteSpace: 'nowrap', fontFamily: SANS, fontSize: CAP.size * lerp(1, 0.9, d),
                fontWeight: lit > 0.5 ? 800 : 600, color: lit > 0.5 ? ACCENT : `rgba(255,255,255,${0.4 + 0.6 * lit})`,
                transform: `translateY(${-8 * lit}px) scale(${1 + 0.06 * lit})`, transformOrigin: 'left center',
                textShadow: `0 0 ${26 * lit}px rgba(255,107,34,${0.6 * lit})`}}>{l.name}</div>
            </Layer>
          );
        })}

        {/* ============ the map: a floor, then the app's map layer ============ */}
        {fr >= B.split[0] && (
          <Layer y={floorY} z={0} w={MAP.w} h={MAP.h} rx={floorRx}
            style={{opacity: t01(fr, B.split[0], B.split[0] + 60) * appFade, borderRadius: 24}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.18)',
              backgroundImage: `url(${SRC})`, backgroundSize: `${SW * K}px ${SH * K}px`, backgroundPosition: `0px ${-566 * K}px`}} />
            {/* the route, drawn pin to pin */}
            <svg width={MAP.w} height={MAP.h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              {(() => {
                const pts = PLACES.filter((p) => !p.lost).map((p) => [p.mx! * MAP.w, p.my! * MAP.h]);
                const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ');
                const draw = t01(fr, B.route[0], B.route[1] - 20, travel);
                return <path d={d} stroke={ACCENT} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1}
                  strokeDasharray={1} strokeDashoffset={1 - draw} style={{filter: 'drop-shadow(0 0 8px rgba(255,107,34,0.8))'}} />;
              })()}
            </svg>
            {/* pins: stand up off the floor; lie back down as the floor stands up */}
            {PLACES.filter((p) => !p.lost).map((p, i) => {
              const at = B.split[0] + 92 + i * 14, rise = spr(fr, at, 13, 170);
              const flat = lerp(-90, 0, up);
              return (
                <React.Fragment key={p.name}>
                  <div style={{position: 'absolute', left: p.mx! * MAP.w - 24, top: p.my! * MAP.h - 9, width: 48, height: 18, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', filter: 'blur(4px)', opacity: rise * (1 - up)}} />
                  <div style={{position: 'absolute', left: p.mx! * MAP.w - 28, top: p.my! * MAP.h - 130, width: 56, height: 130, transformOrigin: '50% 100%',
                    transform: `rotateX(${flat}deg) scale(${rise * lerp(1, 0.75, up)})`, transformStyle: 'preserve-3d', opacity: fr >= at ? 1 : 0}}>
                    <div style={{position: 'absolute', left: 26, top: 54, width: 4, height: 76 * (1 - up), background: '#fff', opacity: 0.85}} />
                    <div style={{position: 'absolute', left: 0, top: up > 0.5 ? 100 : 0, width: 56, height: 56, borderRadius: '50%', background: ACCENT,
                      border: '4px solid #fff', boxSizing: 'border-box', boxShadow: '0 0 24px rgba(255,107,34,0.6)'}} />
                    <div style={{position: 'absolute', left: 68, top: up > 0.5 ? 110 : 10, whiteSpace: 'nowrap', color: '#fff', fontFamily: SANS,
                      fontWeight: 800, fontSize: 28, textShadow: '0 2px 8px rgba(0,0,0,0.9)', opacity: 1 - up * 0.3}}>{p.name}</div>
                  </div>
                </React.Fragment>
              );
            })}
          </Layer>
        )}

        {/* ============ the app assembles around the map (glass layers) ============ */}
        {appVisible && (
          <div style={{position: 'absolute', transformStyle: 'preserve-3d', opacity: appFade}}>
            {/* phone body */}
            <Layer z={-24} w={SW * K + 26} h={SH * K + 26} style={{borderRadius: 96, background: '#16171B', border: '2px solid rgba(255,255,255,0.14)',
              opacity: appIn(0), boxShadow: '0 60px 120px rgba(0,0,0,0.7)'}} />
            <Layer z={-12} w={SW * K} h={SH * K} style={{borderRadius: 84, background: '#000', opacity: appIn(0)}} />
            {/* header + date pills */}
            <Glass y={wy(283)} z={Z.header * lift(1) + (1 - appIn(1)) * 500} w={SW * K} h={566 * K} radius={60} look="clear"
              turn={camF.yaw} opacity={appIn(1)} thickness={8} style={{}}>
              <div style={{position: 'absolute', inset: 0, ...slice(0, 566)}} />
              {/* Sun 15 lights up when the row lands */}
              <div style={{position: 'absolute', left: (606) * K, top: 325 * K, width: 162 * K, height: 205 * K, borderRadius: 22, background: ACCENT,
                opacity: fr >= 1004 ? 1 : 0, transform: `scale(${1 + (1 - pillPop) * 0.25})`, color: '#fff', fontFamily: SANS, textAlign: 'center',
                paddingTop: 10, boxSizing: 'border-box', lineHeight: 1.15, fontSize: 20}}>Sun<br /><b style={{fontSize: 30}}>15</b><br />71°</div>
            </Glass>
            {/* bottom sheet */}
            <Glass y={wy(1464 + 579)} z={Z.sheet * lift(2) + (1 - appIn(2)) * 700} w={SW * K} h={1158 * K} radius={48} look="frosted"
              turn={camF.yaw} opacity={appIn(2)} thickness={8}
              behind={<div style={{position: 'absolute', inset: 0, backgroundImage: `url(${SRC})`, backgroundSize: `${SW * K}px ${SH * K}px`, backgroundPosition: `0px ${-1000 * K}px`}} />}>
              <div style={{position: 'absolute', inset: 0, ...slice(1464, 1158)}} />
              {/* the slot the Golden Tiki row leaves */}
              <div style={{position: 'absolute', left: 10, right: 10, top: (2133 - 95 - 1464) * K, height: rowH, background: '#0A0A0C', borderRadius: 14,
                opacity: mUp > 0.02 && fr < 1060 ? 1 : 0}} />
              {/* the confirmation */}
              <div style={{position: 'absolute', left: 18, right: 18, top: (2240 - 1464) * K - 52 + (1 - toast) * 40, height: 104, borderRadius: 22,
                background: 'rgba(40,40,46,0.92)', border: '1.5px solid rgba(255,255,255,0.22)', color: '#fff', fontFamily: SANS, fontSize: 22,
                padding: '18px 22px', boxSizing: 'border-box', lineHeight: 1.3, opacity: toast * (1 - toDot),
                transform: `scale(${lerp(1, 0.1, toDot)})`}}>
                Added to Sun 15, 4:00 PM · 9 min drive from AREA15
                <span style={{position: 'absolute', right: 22, top: 34, color: ACCENT, fontWeight: 700, fontSize: 24}}>Undo</span>
              </div>
            </Glass>
            {/* tab bar */}
            <Glass y={wy(2465)} z={Z.tab * lift(3) + (1 - appIn(3)) * 900} w={1086 * K} h={200 * K} radius={70} look="frosted"
              turn={camF.yaw} opacity={appIn(3)} thickness={8}
              behind={<div style={{position: 'absolute', inset: 0, background: '#222'}} />}>
              <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${SRC})`, backgroundSize: `${SW * K}px ${SH * K}px`,
                backgroundPosition: `${-60 * K}px ${-2365 * K}px`, filter: UI_ON_GLASS}} />
              <div style={{position: 'absolute', left: (216 - 60 - 60) * K, top: 20 * K, width: 120 * K, height: 110 * K, background: '#2a2a2e',
                borderRadius: 16, opacity: fr >= 1112 ? 1 : 0}} />
            </Glass>
          </div>
        )}

        {/* the lifted row (component macro), always fully on screen */}
        {fr >= 880 && fr < 1006 && (
          <Glass x={rx_} y={ry_} z={rz + 300} w={rowW} h={rowH} scale={rs} radius={20} look="clear" turn={camF.yaw} thickness={10}>
            <div style={{position: 'absolute', inset: 0, background: 'rgba(22,22,26,0.88)'}} />
            <div style={{position: 'absolute', left: 22, top: 16, color: '#fff', fontFamily: SANS}}>
              <div style={{fontSize: 28, fontWeight: 800}}>Golden Tiki</div>
              <div style={{fontSize: 19, color: '#A0A0A0', marginTop: 4}}>3939 Spring Mountain Rd · Bar</div>
              <div style={{fontSize: 19, color: '#A0A0A0', marginTop: 2}}>Saved from TikTok</div>
            </div>
            <div style={{position: 'absolute', right: 96, top: 34, padding: '12px 22px', borderRadius: 999, fontFamily: SANS, fontSize: 22,
              fontWeight: 800, color: '#fff', background: glow > 0 ? `rgba(255,107,34,${0.25 + 0.75 * glow})` : 'rgba(60,60,66,0.9)',
              transform: `scale(${1 - press * 0.08})`, boxShadow: glow > 0 ? `0 0 ${30 * glow}px rgba(255,107,34,0.7)` : undefined}}>Smart Add</div>
          </Glass>
        )}
        {/* the point travelling from the confirmation to the suitcase */}
        {fr >= 1076 && fr < 1116 && (
          <Layer x={dotX} y={dotY} z={260} w={28} h={28} style={{borderRadius: '50%', background: ACCENT, boxShadow: '0 0 30px rgba(255,107,34,0.9)'}} />
        )}
        {/* the suitcase lifts out of the tab bar and becomes the end card */}
        {fr >= 1110 && (
          <Layer x={sx} y={sy} z={lerp(270, 120, sUp)} w={sSize} h={sSize * 1.05}>
            <Suitcase t={fr - 1150} lit={t01(fr, 1230, 1245)} />
          </Layer>
        )}
      </Stage>

      {/* end card type, in screen space */}
      <div style={{position: 'absolute', top: 1180, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, color: '#fff', opacity: endIn,
        transform: `translateY(${(1 - endIn) * 24}px)`}}>
        <div style={{fontSize: 110, fontWeight: 900, letterSpacing: -3}}>Trip</div>
      </div>

      {/* captions: one line per beat, word by word */}
      <Caption fps={60} fr={fr} at={20} text="You saved a TikTok" key_="TikTok" out={104} />
      <Caption fps={60} fr={fr} at={118} text="Trip reads the caption" key_="caption" out={292} />
      <Caption fps={60} fr={fr} at={306} text="and drops each place on your map" key_="place" out={472} />
      <Caption fps={60} fr={fr} at={486} text="in the order you'll visit" key_="order" out={612} />
      <Caption fps={60} fr={fr} at={630} text="right inside your trip plan" key_="trip plan" out={862} />
      <Caption fps={60} fr={fr} at={876} text="Smart Add finds the time" key_="Smart Add" out={1062} />
      <Caption fps={60} fr={fr} at={1170} text="Would you use this?" key_="use" />
    </Frame>
  );
};
