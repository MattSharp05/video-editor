// Trip clip 01 v2: one continuous shot timed to Matthew's voiceover (beats.json from words.json).
// Principles: one shot, one thread · glass interface · one visual language · the background is the app's world.
// Thread (lead -> move -> next lead):
//   point -> splits into 40 saved TikToks -> they slide into a folder that closes ("none")
//   folder opens -> one TikTok rises and grows into the card ("an actual plan")
//   share button -> a link chip is copied -> it flies down as the app assembles ("open Trip") -> it becomes the
//   "Add this TikTok?" banner -> tap -> the banner becomes the "From TikTok" sheet ("reads the caption")
//   found names lift off the sheet -> fly to the map, which tilts into a floor, and stand up as pins ("the place it names")
//   Golden Tiki row lifts -> Smart Add pressed -> drops into Sun 15 -> confirmation ("least extra travel")
//   Plan my bucket list pressed -> the rest fly to their days together ("at once")
//   pull back -> the suitcase zips -> the end card ("with you", "Would you use this?")
import React from 'react';
import {Img, interpolate, interpolateColors, spring, staticFile, useCurrentFrame} from 'remotion';
import {Background} from './Background';
import {Frame} from './kit/caption';
import {SANS} from './kit/fonts';
import {ACCENT, Cam, Layer, P, Stage, arrive, camAt, clamp, leave, lerp, t01, travel} from './kit/space';
import {Glass, GlassDefs, UI_ON_GLASS} from './kit/glass';
import {VoCaptions} from './VoCaptions';
import B from './beats.json';

export const FPS = 60;
const S = (sec: number) => Math.round(sec * FPS);
export const DUR = S(B.total);
const BUCKET = staticFile('vegas-bucket.png');
const RESULTS = staticFile('link-results.png');
const SMART = staticFile('vegas-bucket-smart-add.png');   // after Smart Add: Sun 15 itinerary, Golden Tiki at 4:00 PM, the toast
const PLANALL = staticFile('vegas-bucket-plan-all.png'); // after Plan my bucket list: "Placed 5 items across your trip"
const PHOTOS = ['photos/strip-2012.jpg', 'photos/strip-rw.jpg', 'photos/patisserie.jpg', 'photos/bartender.jpg'].map((p) => staticFile(p));
const K = 0.6, SW = 1206, SH = 2622;
const wy = (sy: number) => (sy - SH / 2) * K;
const wx = (sx: number) => (sx - SW / 2) * K;
const spr = (fr: number, at: number, damping = 16, stiffness = 140) => spring({frame: fr - at, fps: FPS, config: {damping, stiffness, mass: 1}});
const shot = (src: string, sy: number): React.CSSProperties => ({backgroundImage: `url(${src})`, backgroundSize: `${SW * K}px ${SH * K}px`,
  backgroundPosition: `0px ${-sy * K}px`, filter: UI_ON_GLASS});

// ---- world layout ----
const TOP = -1350;                                   // the TikTok world, above the app
const CARD = {w: 560, h: 996};
const TILE = {w: 140, h: 249};
const tilePos = (i: number) => ({x: ((i % 4) - 1.5) * 172, y: TOP + (Math.floor(i / 4) - 1) * 292 - 40});
const FOLDER = {y: TOP + 20, w: 420, h: 330};
const MAP = {y: wy(566 + 449), w: SW * K, h: 898 * K};
// the found places: rows in the "From TikTok" sheet (screenshot y), and where their pins land on the map (fractions)
const PLACES = [
  {name: "Esther's Kitchen", rowY: 1466, mx: 0.62, my: 0.14},
  {name: 'Eggslut', rowY: 1647, mx: 0.33, my: 0.32},
  {name: 'Tacos El Gordo', rowY: 1826, mx: 0.80, my: 0.30},
];
const PILL_X = [129, 315, 501, 687, 873];            // Thu..Mon centres (screenshot x)
const LATER = [{name: 'Fremont Street Experience', day: 0}, {name: 'Pinball Hall of Fame', day: 1}, {name: 'Lotus of Siam', day: 2}];

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

const TileFace: React.FC<{i: number; grey: number; caption?: boolean}> = ({i, grey, caption = true}) => (
  <>
    <Img src={PHOTOS[i % 4]} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover',
      objectPosition: `${(i * 23) % 100}% 50%`, filter: `grayscale(${grey}) brightness(${1 - grey * 0.5})`}} />
    {caption && <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%', background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.7))'}} />}
  </>
);

export const Film: React.FC = () => {
  const fr = useCurrentFrame();

  // ---------------- camera: one move for the whole film ----------------
  const cam: Cam = camAt(fr, [
    [0, {dist: P * 1.0, ty: TOP - 40}],
    [S(B.l2), {dist: P * 1.02, ty: TOP - 30}],
    [S(B.l2_end), {dist: P * 1.12, ty: TOP + 10, pitch: 3}, arrive],                     // the card
    [S(B.l3) + 20, {dist: P * 1.06, ty: TOP + 40, tx: 60, yaw: -3}],                      // toward the share button
    [S(B.open_trip) - 10, {dist: P * 1.0, ty: TOP + 150, tx: 120, yaw: 4}],
    [S(B.asks) + 10, {dist: P * 1.5, ty: 30}, travel],                                    // follow the link down: the app assembles
    [S(B.add_tiktok) - 10, {dist: P * 1.12, ty: wy(400) + 230}, arrive],                // lean in: read the banner
    [S(B.l4) + 20, {dist: P * 1.3, ty: -40, pitch: 2}, travel],                         // lean in on the caption being read (phone top stays below the captions)
    [S(B.pulls) + 20, {dist: P * 1.32, ty: -150, pitch: -6}],                            // up to the map as it tilts
    [S(B.l4_end) + 20, {dist: P * 1.45, ty: 30, pitch: 0}],  // phone top stays below the captions (y > 470)
    [S(B.smart_add) + 30, {dist: P * 1.3, ty: -60, yaw: -3}, arrive],                    // the lifted row
    [S(B.picks) + 70, {dist: P * 1.08, ty: wy(1950)}, arrive],                          // Sun 15's itinerary: Golden Tiki at 4:00 PM
    [S(B.least) + 10, {dist: P * 1.12, ty: wy(2080)}],                                  // the drive lines glow: least extra travel
    [S(B.l6) + 10, {dist: P * 1.3, ty: wy(1720)}],                                      // back to the list: Plan my bucket list
    [S(B.at_once) + 10, {dist: P * 1.2, ty: wy(720)}],                                   // the days light up
    [S(B.at_once) + 60, {dist: P * 1.25, ty: wy(1900)}],                                 // "Placed 5 items across your trip"
    [S(B.l7) + 60, {dist: P * 1.6, ty: 160}, travel],                                    // pull back for the end card
    [DUR, {dist: P * 1.6, ty: 160}],
  ]);
  const drift = Math.sin(fr / 160) * 0.8;
  const camF = {...cam, yaw: cam.yaw + drift};

  // ---------------- beat 1: 40 saves, opened none ----------------
  const burst = (i: number) => t01(fr, S(B.l1) + i * 3, S(B.l1) + 34 + i * 3, arrive);
  const count = Math.round(interpolate(fr, [S(B.forty) - 26, S(B.forty) + 6], [1, 40], {...clamp, easing: arrive}));
  const grey = t01(fr, S(2.55), S(2.55) + 30);
  const folderIn = t01(fr, S(3.2), S(3.2) + 24, arrive);
  const fall = (i: number) => t01(fr, S(3.45) + i * 3, S(3.45) + 22 + i * 3, travel);
  const shut = t01(fr, S(B.none) - 6, S(B.none) + 4, arrive);
  const flipped = fr >= S(B.none) - 12;
  // ---------------- beat 2: one TikTok rises out and becomes the card ----------------
  const reopen = t01(fr, S(B.l2), S(B.l2) + 14, arrive);
  const rise = t01(fr, S(B.l2) + 10, S(B.l2) + 50, arrive);
  const grow = t01(fr, S(B.l2) + 44, S(B.plan) - 10, arrive);
  const folderOut = t01(fr, S(B.l2) + 30, S(B.l2) + 70);
  const cardW = lerp(TILE.w, CARD.w, grow), cardH = lerp(TILE.h, CARD.h, grow);
  const cardY = lerp(FOLDER.y - 40 - rise * 130, TOP, grow);
  // ---------------- beat 3: copy the link, open Trip, the banner asks ----------------
  const share = {x: CARD.w / 2 - 49, y: TOP - CARD.h / 2 + 600};
  const chipIn = t01(fr, S(B.l3), S(B.l3) + 26, arrive);
  const copied = fr >= S(B.l3) + 50;
  const chipGo = t01(fr, S(B.open_trip) - 6, S(B.asks), travel);
  const bannerY = wy(400);
  const chipX = lerp(share.x - 160, 0, chipGo), chipY = lerp(share.y + 70, bannerY, chipGo) - Math.sin(chipGo * Math.PI) * 120;
  const toBanner = t01(fr, S(B.asks), S(B.asks) + 20, arrive);
  const app = (i: number) => t01(fr, S(B.open_trip) + 6 + i * 8, S(B.open_trip) + 64 + i * 8, arrive);
  const tap = t01(fr, S(B.add_tiktok) + 20, S(B.add_tiktok) + 40);
  const bannerOut = t01(fr, S(B.add_tiktok) + 42, S(B.l3_end) + 30, travel);
  const cardFade = 1 - t01(fr, S(B.open_trip) - 30, S(B.open_trip) + 2, leave);
  // ---------------- beat 4: the From TikTok sheet; found names fly to the map ----------------
  const sheetA = t01(fr, S(B.add_tiktok) + 44, S(B.l4) + 10, arrive) * (1 - t01(fr, S(B.l4_end), S(B.l5), travel));
  const readP = interpolate(fr, [S(B.l4) + 6, S(B.pulls) - 14], [0, 3], clamp);
  const found = (i: number) => t01(fr, S(B.pulls) + i * 22, S(B.pulls) + 12 + i * 22, arrive);
  const go = (i: number) => t01(fr, S(B.pulls) + 18 + i * 22, S(B.pulls) + 52 + i * 22, travel);
  const landAt = (i: number) => S(B.pulls) + 50 + i * 22;
  const tilt = t01(fr, S(B.pulls) - 10, S(B.pulls) + 20, arrive) * (1 - t01(fr, S(B.l4_end) - 4, S(B.l5) + 4, travel));
  // ---------------- beat 5: Smart Add ----------------
  const rowY = wy(2133), rowH = 190 * K, rowW = SW * K - 34;
  const mUp = t01(fr, S(B.l5), S(B.l5) + 34, arrive);
  const press = interpolate(fr, [S(B.smart_add) + 18, S(B.smart_add) + 24, S(B.smart_add) + 36], [0, 1, 0], clamp);
  const glow = t01(fr, S(B.smart_add) + 22, S(B.smart_add) + 36);
  const fly = t01(fr, S(B.picks), S(B.picks) + 44, travel);
  const landSun = S(B.picks) + 44;
  const sun = {x: wx(PILL_X[3]), y: wy(427)};
  const rx_ = lerp(0, sun.x, fly), ry_ = lerp(lerp(rowY, 140, mUp), sun.y, fly);
  const rz = lerp(0, 260, mUp * (1 - fly)) + Math.sin(fly * Math.PI) * 180;
  const rs = lerp(1.12, 0.24, fly) * lerp(1 / 1.12, 1, mUp);
  const toast = t01(fr, landSun + 6, landSun + 28, arrive) * (1 - t01(fr, S(B.l6) - 20, S(B.l6), travel));
  const least = t01(fr, S(B.least), S(B.least) + 18);
  // ---------------- app screen states (the real app's result screens, crossfaded inside each glass pane) ----------------
  const stSmart = t01(fr, S(B.picks) + 48, S(B.picks) + 62);          // Sun 15 itinerary after the row lands
  const stBack = t01(fr, S(B.l6) - 12, S(B.l6) + 4);                  // back to the bucket list to plan the rest
  const stAll = t01(fr, S(B.at_once) + 30, S(B.at_once) + 44);        // everything placed
  const bucketShown = Math.max(1 - stSmart, stBack) * (1 - stAll);
  // each later screen sits on its own solid backing, so screens never show through each other
  const state = (src: string, sy: number, o: number) => o > 0 ? (
    <div style={{position: 'absolute', inset: 0, opacity: o, background: 'rgb(14,14,16)'}}><div style={{position: 'absolute', inset: 0, ...shot(src, sy)}} /></div>) : null;
  const pane = (sy: number, withBack: boolean) => (
    <>
      <div style={{position: 'absolute', inset: 0, ...shot(BUCKET, sy)}} />
      {state(SMART, sy, stSmart)}
      {withBack && state(BUCKET, sy, stBack)}
      {state(PLANALL, sy, stAll)}
    </>
  );
  // ---------------- beat 6: plan the whole list at once ----------------
  const planBtnY = wy(1901);
  const planPress = interpolate(fr, [S(B.l6) + 20, S(B.l6) + 26, S(B.l6) + 40], [0, 1, 0], clamp);
  const chipLift = (i: number) => t01(fr, S(B.l6) + 40 + i * 8, S(B.l6) + 70 + i * 8, arrive);
  const together = t01(fr, S(B.at_once), S(B.at_once) + 34, travel);
  const dayLit = (d: number) => (d === 3 ? fr >= landSun : fr >= S(B.at_once) + 34);
  const pillPop = (d: number) => spr(fr, d === 3 ? landSun : S(B.at_once) + 34, 12, 220);
  // ---------------- beat 7-8: pull back, the suitcase, the end card ----------------
  const appFade = 1 - t01(fr, S(B.l7) - 6, S(B.l7) + 30, travel) * 0.96;
  const suitcase = {x: wx(216), y: wy(2440)};
  const sUp = t01(fr, S(B.l7), S(B.l7) + 48, arrive);
  const sx = lerp(suitcase.x, 0, sUp), sy = lerp(suitcase.y, -160, sUp), sSize = lerp(60, 420, sUp);
  const zipT = fr - (S(B.l7) + 40);
  const endIn = t01(fr, S(B.l7_end) + 6, S(B.l7_end) + 36, arrive);

  const showApp = fr >= S(B.open_trip) - 4;
  return (
    <Frame>
      <Background fr={fr} />
      <GlassDefs />
      <Stage cam={camF}>
        {/* ================= the saved TikToks, the folder, the card ================= */}
        {fr < S(B.l2) + 60 && Array.from({length: 12}, (_, i) => {
          const p = tilePos(i), b = burst(i), f = fall(i);
          if (i === 5 && fr >= S(B.l2)) return null; // this one becomes the card
          const x = lerp(lerp(0, p.x, b), 0, f), y = lerp(lerp(TOP, p.y, b), FOLDER.y, f);
          return (
            <Glass key={i} x={x} y={y} z={2} w={lerp(TILE.w, 70, f)} h={lerp(TILE.h, 124, f)} radius={14} look="clear" thickness={6} turn={camF.yaw}
              scale={lerp(0.2, 1, b)} opacity={b * (1 - t01(fr, S(3.45) + 16 + i * 3, S(3.45) + 22 + i * 3))}>
              <TileFace i={i} grey={grey} />
            </Glass>
          );
        })}
        {/* the count */}
        {fr < S(B.l2) + 40 && (
          <Layer y={TOP + 520} z={4} w={360} h={74} style={{opacity: t01(fr, S(B.forty) - 24, S(B.forty)) * (1 - t01(fr, S(B.l2), S(B.l2) + 30))}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 999, background: 'rgba(16,18,26,0.75)', border: '1.5px solid rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: SANS, fontSize: 40, fontWeight: 700, color: '#fff'}}>
              <span style={{color: '#A0A0A0'}}>{flipped ? 'Opened' : 'Saved'}</span>
              <span style={{color: flipped && fr >= S(B.none) ? ACCENT : '#fff', minWidth: 54, textAlign: 'right'}}>{flipped ? 0 : count}</span>
            </div>
          </Layer>
        )}
        {/* the folder */}
        {fr >= S(3.2) && fr < S(B.l2) + 80 && (
          <Glass y={FOLDER.y} z={0} w={FOLDER.w} h={FOLDER.h} radius={30} look="clear" thickness={10} turn={camF.yaw}
            scale={lerp(0.85, 1, folderIn)} opacity={folderIn * (1 - folderOut)}>
            {/* the lid: a band at the top while open, covering the folder when shut */}
            <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: FOLDER.h, borderBottom: '1.5px solid rgba(255,255,255,0.22)',
              transform: `scaleY(${lerp(0.28, 1, shut * (1 - reopen))})`, transformOrigin: 'top', background: 'rgba(255,255,255,0.06)'}} />
            <div style={{position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', color: '#fff', fontFamily: SANS, fontSize: 44, fontWeight: 700}}>Saved</div>
          </Glass>
        )}
        {/* the card: tile 5 rises out of the folder and grows */}
        {fr >= S(B.l2) && fr < S(B.asks) + 30 && (
          <Glass y={cardY} z={6} w={cardW} h={cardH} radius={lerp(14, 38, grow)} look="clear" thickness={12} turn={camF.yaw} opacity={cardFade}>
            <TileFace i={5} grey={lerp(1, 0, rise)} />
            <div style={{position: 'absolute', inset: 0, opacity: grow}}>
              {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', right: 22, top: 420 + i * 92, width: 54, height: 54, borderRadius: '50%',
                border: `3px solid ${i === 2 && chipIn > 0 && !copied ? ACCENT : 'rgba(255,255,255,0.85)'}`,
                transform: `scale(${i === 2 ? 1 + 0.15 * Math.sin(chipIn * Math.PI) : 1})`}} />)}
              <div style={{position: 'absolute', left: 30, right: 90, bottom: 40, color: '#fff', fontFamily: SANS}}>
                <div style={{fontWeight: 800, fontSize: 26}}>@vegas.eats</div>
                <div style={{fontSize: 23, lineHeight: 1.35, marginTop: 8, opacity: 0.92}}>Where locals eat in Vegas: Esther's Kitchen downtown, Eggslut at the Cosmo, Tacos El Gordo on the Strip</div>
              </div>
            </div>
          </Glass>
        )}
        {/* the copied link: a chip that flies down into the app and becomes the banner */}
        {fr >= S(B.l3) && fr < S(B.asks) + 22 && (
          <Glass x={chipX} y={chipY} z={lerp(40, 60, chipGo)} w={lerp(360, SW * K - 60, toBanner)} h={lerp(70, 132, toBanner)} radius={lerp(35, 24, toBanner)}
            look="clear" thickness={6} turn={camF.yaw} scale={lerp(0.3, 1, chipIn)} opacity={chipIn}>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', fontFamily: SANS, color: '#fff',
              fontSize: 22, fontWeight: 600, opacity: 1 - toBanner}}>
              <span style={{color: copied ? ACCENT : '#fff'}}>{copied ? 'Link copied' : 'Copy link'}</span>
              <span style={{color: '#A0A0A0', whiteSpace: 'nowrap', overflow: 'hidden'}}>tiktok.com/@vegas.eats/…</span>
            </div>
          </Glass>
        )}

        {/* ================= the app ================= */}
        {showApp && (
          <div style={{position: 'absolute', transformStyle: 'preserve-3d', opacity: appFade}}>
            <Layer z={-30} w={SW * K + 26} h={SH * K + 26} style={{borderRadius: 96, background: '#16171B', border: '2px solid rgba(255,255,255,0.14)',
              opacity: app(0), boxShadow: '0 60px 120px rgba(0,0,0,0.7)'}} />
            <Layer z={-16} w={SW * K} h={SH * K} style={{borderRadius: 84, background: '#000', opacity: app(0)}} />
            {/* header + date pills */}
            <Glass y={wy(283)} z={8 + (1 - app(1)) * 600} w={SW * K} h={566 * K} radius={60} look="clear" turn={camF.yaw} opacity={app(1)} thickness={8}>
              {pane(0, false)}
              {[0, 1, 2, 3].map((d) => (
                <div key={d} style={{position: 'absolute', left: (PILL_X[d] - 81) * K, top: 325 * K, width: 162 * K, height: 205 * K, borderRadius: 22,
                  background: ACCENT, opacity: dayLit(d) ? 1 - t01(fr, d === 3 ? landSun + 8 : S(B.at_once) + 36, d === 3 ? landSun + 30 : S(B.at_once) + 60) : 0, transform: `scale(${1 + (1 - pillPop(d)) * 0.25})`, color: '#fff', fontFamily: SANS,
                  textAlign: 'center', paddingTop: 10, boxSizing: 'border-box', lineHeight: 1.15, fontSize: 20}}>
                  {['Thu', 'Fri', 'Sat', 'Sun'][d]}<br /><b style={{fontSize: 30}}>{12 + d}</b><br />{['73°', '75°', '74°', '71°'][d]}</div>
              ))}
            </Glass>
            {/* a flat copy of the map stays in place, so the lifted map never leaves a hole */}
            <Layer y={MAP.y} z={-2} w={MAP.w} h={MAP.h} style={{opacity: app(1) * 0.55, backgroundImage: `url(${BUCKET})`,
              backgroundSize: `${SW * K}px ${SH * K}px`, backgroundPosition: `0px ${-566 * K}px`}} />
            {/* the map: lifts and tilts into a floor while the places land, then returns */}
            <Layer y={MAP.y} z={lerp(0, 70, tilt)} w={MAP.w} h={MAP.h} rx={lerp(0, 38, tilt)} style={{opacity: app(1)}}>
              <div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: tilt > 0.01 ? 24 : 0,
                backgroundImage: `url(${BUCKET})`, backgroundSize: `${SW * K}px ${SH * K}px`, backgroundPosition: `0px ${-566 * K}px`,
                border: tilt > 0.01 ? '1.5px solid rgba(255,255,255,0.18)' : undefined}} />
              {[SMART, PLANALL].map((src, j) => <div key={j} style={{position: 'absolute', inset: 0, backgroundImage: `url(${src})`,
                backgroundSize: `${SW * K}px ${SH * K}px`, backgroundPosition: `0px ${-566 * K}px`, opacity: j === 0 ? stSmart : stAll}} />)}
              {PLACES.map((p, i) => {
                const at = landAt(i), up = spr(fr, at, 13, 170);
                if (fr < at) return null;
                return (
                  <div key={p.name} style={{position: 'absolute', left: p.mx * MAP.w - 24, top: p.my * MAP.h - 110, width: 48, height: 110,
                    transformOrigin: '50% 100%', transform: `rotateX(${-38 * tilt}deg) scale(${up * lerp(0.75, 1, tilt)})`, transformStyle: 'preserve-3d'}}>
                    <div style={{position: 'absolute', left: 22, top: 46, width: 4, height: 64 * tilt, background: '#fff', opacity: 0.85}} />
                    <div style={{position: 'absolute', left: 0, top: lerp(62, 0, tilt), width: 48, height: 48, borderRadius: '50%', background: ACCENT,
                      border: '4px solid #fff', boxSizing: 'border-box', boxShadow: '0 0 20px rgba(255,107,34,0.6)'}} />
                    <div style={{position: 'absolute', left: 58, top: lerp(70, 8, tilt), whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 800, fontSize: 24,
                      color: interpolateColors(fr, [at, at + 45], [ACCENT, '#FFFFFF']), textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>{p.name}</div>
                  </div>
                );
              })}
            </Layer>
            {/* the bucket list sheet (under the From TikTok sheet) */}
            <Glass y={wy(1464 + 579)} z={8 + (1 - app(2)) * 800} w={SW * K} h={1158 * K} radius={48} look="clear" turn={camF.yaw} opacity={app(2)} thickness={8}>
              {pane(1464, true)}
              {/* the Golden Tiki slot, once the row has left (only while the bucket list is shown) */}
              <div style={{position: 'absolute', left: 10, right: 10, top: (2133 - 95 - 1464) * K, height: rowH, background: '#0A0A0C', borderRadius: 14, opacity: mUp > 0.02 ? bucketShown : 0}} />
              {/* least extra travel: the drive lines glow (no boxes) */}
              {[[2032, 300, 760], [2228, 120, 1000]].map(([y, x0, x1], j) => (
                <div key={j} style={{position: 'absolute', left: x0 * K, width: (x1 - x0) * K, top: (y - 1464) * K - 26, height: 52, borderRadius: 26,
                  background: 'radial-gradient(ellipse at center, rgba(255,107,34,0.45), rgba(255,107,34,0) 70%)', opacity: least * stSmart * (1 - stBack)}} />
              ))}
              {/* Plan my bucket list, pressed */}
              <div style={{position: 'absolute', left: 48 * K, right: 48 * K, top: (1901 - 75 - 1464) * K, height: 150 * K, borderRadius: 24,
                boxShadow: `0 0 ${40 * planPress}px rgba(255,107,34,${0.8 * planPress})`, transform: `scale(${1 - planPress * 0.04})`}} />
              {/* the rows that leave together */}
              <div style={{position: 'absolute', left: 10, right: 10, top: (2230 - 1464) * K, height: 330 * K, background: '#0A0A0C', opacity: chipLift(0) > 0.02 ? bucketShown : 0}} />
            </Glass>
            {/* the From TikTok sheet: what Trip read in the link */}
            {sheetA > 0.001 && (
              <Glass y={wy(957 + 832) + (1 - sheetA) * 260} z={30} w={SW * K} h={1665 * K} radius={48} look="clear" turn={camF.yaw} thickness={8} opacity={Math.min(1, sheetA * 1.6)}>
                {/* a sheet over a sheet is opaque: nothing from the bucket list ghosts through */}
                <div style={{position: 'absolute', inset: 0, background: 'rgb(20,20,22)'}} />
                <div style={{position: 'absolute', inset: 0, ...shot(RESULTS, 957)}} />
                {/* Kaiseki Yuzu dropped from this film (decision 2026-11-05): its row is covered */}
                <div style={{position: 'absolute', left: 36 * K, right: 36 * K, top: (1945 - 957) * K, height: 180 * K, background: 'rgb(20,20,22)'}} />
                {/* the reading light passes the caption, line by line */}
                {[1168, 1222, 1276].map((ly, i) => (
                  <div key={i} style={{position: 'absolute', top: (ly - 957) * K - 26, left: interpolate(readP, [i, i + 1], [180, 880], clamp) * K - 60,
                    width: 120, height: 52, borderRadius: 30, background: 'radial-gradient(rgba(255,255,255,0.35), rgba(255,255,255,0) 70%)',
                    opacity: readP > i && readP < i + 1 ? 1 : 0}} />
                ))}
              </Glass>
            )}
            {/* tab bar */}
            <Glass y={wy(2465)} z={18 + (1 - app(3)) * 900} w={1086 * K} h={200 * K} radius={70} look="clear" turn={camF.yaw} opacity={app(3) * (1 - sheetA)} thickness={8}>
              <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${BUCKET})`, backgroundSize: `${SW * K}px ${SH * K}px`,
                backgroundPosition: `${-60 * K}px ${-2365 * K}px`, filter: UI_ON_GLASS}} />
              <div style={{position: 'absolute', left: (216 - 60 - 60) * K, top: 20 * K, width: 120 * K, height: 110 * K, background: '#2a2a2e',
                borderRadius: 16, opacity: sUp > 0.01 ? 1 : 0}} />
            </Glass>
            {/* the banner: the copied link, asking */}
            {fr >= S(B.asks) + 14 && bannerOut < 1 && (
              <Glass y={bannerY} z={70} w={SW * K - 60} h={132} radius={24} look="clear" thickness={8} turn={camF.yaw}
                scale={(1 - tap * 0.04) * lerp(1, 0.9, bannerOut)} opacity={1 - bannerOut}>
                <div style={{position: 'absolute', inset: 0, background: 'rgba(28,28,32,0.9)'}} />
                <div style={{position: 'absolute', left: 26, top: 26, fontFamily: SANS, color: '#fff'}}>
                  <div style={{fontSize: 30, fontWeight: 800}}>Add this TikTok?</div>
                  <div style={{fontSize: 22, color: '#A0A0A0', marginTop: 6}}>Find the places in the link you copied</div>
                </div>
              </Glass>
            )}
          </div>
        )}
        {/* tap ring on the banner */}
        {fr >= S(B.add_tiktok) + 20 && fr < S(B.add_tiktok) + 44 && (
          <Layer x={0} y={bannerY} z={90} w={110} h={110} scale={0.6 + tap * 0.9}
            style={{borderRadius: '50%', border: `4px solid rgba(255,255,255,${0.9 * (1 - tap)})`}} />
        )}
        {/* found names: lift off the sheet and fly to the map */}
        {PLACES.map((p, i) => {
          const f = found(i), g = go(i);
          if (f <= 0 || fr >= landAt(i) + 2) return null;
          const x0 = wx(194) , y0 = wy(p.rowY) + (1 - sheetA) * 260;
          const x1 = (p.mx - 0.5) * MAP.w - 30, y1 = MAP.y + (p.my - 0.5) * MAP.h * Math.cos(38 * tilt * Math.PI / 180) - 100;
          return (
            <Layer key={p.name} x={lerp(x0, x1, g)} y={lerp(y0, y1, g)} z={lerp(40, 110, g) + Math.sin(g * Math.PI) * 160} w={1} h={1} style={{overflow: 'visible'}}>
              <div style={{position: 'absolute', left: 0, top: -20, whiteSpace: 'nowrap', fontFamily: SANS, fontSize: lerp(27, 24, g), fontWeight: 800,
                color: ACCENT, transform: `translateY(${-8 * f}px) scale(${1 + 0.06 * f})`, transformOrigin: 'left center',
                textShadow: `0 0 ${26 * f}px rgba(255,107,34,${0.6 * f})`}}>{p.name}</div>
            </Layer>
          );
        })}
        {/* Smart Add: the Golden Tiki row, lifted fully into frame */}
        {fr >= S(B.l5) && fr < landSun + 2 && (
          <Glass x={rx_} y={ry_} z={rz + 300} w={rowW} h={rowH} scale={rs} radius={20} look="clear" turn={camF.yaw} thickness={10}>
            <div style={{position: 'absolute', inset: 0, background: 'rgba(22,22,26,0.9)'}} />
            <div style={{position: 'absolute', left: 22, top: 16, color: '#fff', fontFamily: SANS}}>
              <div style={{fontSize: 28, fontWeight: 800}}>Golden Tiki</div>
              <div style={{fontSize: 19, color: '#A0A0A0', marginTop: 4}}>3939 Spring Mountain Rd · Bar</div>
              <div style={{fontSize: 19, color: '#A0A0A0', marginTop: 2}}>Saved from TikTok</div>
            </div>
            <div style={{position: 'absolute', right: 96, top: 34, padding: '12px 22px', borderRadius: 999, fontFamily: SANS, fontSize: 22, fontWeight: 800,
              color: '#fff', background: glow > 0 ? `rgba(255,107,34,${0.25 + 0.75 * glow})` : 'rgba(60,60,66,0.9)', transform: `scale(${1 - press * 0.08})`,
              boxShadow: glow > 0 ? `0 0 ${30 * glow}px rgba(255,107,34,0.7)` : undefined}}>Smart Add</div>
          </Glass>
        )}
        {/* Plan my bucket list: the rest of the list flies to its days together */}
        {LATER.map((c, i) => {
          const l = chipLift(i);
          if (l <= 0 || fr > S(B.at_once) + 36) return null;
          const x0 = wx(603), y0 = wy(2290 + i * 110), x1 = wx(PILL_X[c.day]), y1 = wy(427);
          return (
            <Glass key={c.name} x={lerp(x0, x1, together)} y={lerp(y0 - 20 * l, y1, together)} z={lerp(120, 60, together) + Math.sin(together * Math.PI) * 140}
              w={480} h={64} radius={18} look="clear" thickness={6} turn={camF.yaw} scale={lerp(0.9, 0.22, together) * l}>
              <div style={{position: 'absolute', inset: 0, background: 'rgba(22,22,26,0.9)', display: 'flex', alignItems: 'center', padding: '0 20px',
                fontFamily: SANS, fontSize: 24, fontWeight: 700, color: '#fff'}}>{c.name}</div>
            </Glass>
          );
        })}
        {/* the suitcase leaves the tab bar, zips, and becomes the end card */}
        {fr >= S(B.l7) && (
          <Layer x={sx} y={sy} z={lerp(270, 120, sUp)} w={sSize} h={sSize * 1.05}>
            <Suitcase t={zipT} lit={t01(fr, S(B.l7_end), S(B.l7_end) + 14)} />
          </Layer>
        )}
      </Stage>

      <div style={{position: 'absolute', top: 1180, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, color: '#fff', opacity: endIn,
        transform: `translateY(${(1 - endIn) * 24}px)`}}>
        <div style={{fontSize: 110, fontWeight: 900, letterSpacing: -3}}>Trip</div>
      </div>
      <VoCaptions fr={fr} />
    </Frame>
  );
};
