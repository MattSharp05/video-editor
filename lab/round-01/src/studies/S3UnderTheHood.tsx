// S3 · Under the hood. Says: "this is what the app actually reads, and where it goes".
// The invisible step (AI reading a caption) is made physical: a scan passes the words, the
// place names get selected, lift off as chips and drop onto a tilted map as standing pins.
// The one the map can't find greys out and falls away: honest about limits.
import React from 'react';
import {interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Caption, Frame, Honesty} from '../kit/caption';
import {ACCENT, Layer, P, Stage, arrive, camAt, clamp, creep, lerp, spr, t01, travel} from '../kit/space';

const MAP = staticFile('vegas-bucket.png');
const TEXT = ['Where', 'locals', 'eat', 'in', 'Vegas:', "Esther's Kitchen", 'downtown,', 'Eggslut', 'at', 'the', 'Cosmopolitan,',
  'Tacos El Gordo', 'on', 'the', 'Strip,', 'and', 'Kaiseki Yuzu.'];
const PLACES: Record<string, {mx: number; my: number; found: boolean; order: number}> = {
  "Esther's Kitchen": {mx: 0.70, my: 0.18, found: true, order: 0},
  'Eggslut': {mx: 0.42, my: 0.58, found: true, order: 1},
  'Tacos El Gordo': {mx: 0.55, my: 0.40, found: true, order: 2},
  'Kaiseki Yuzu.': {mx: 0.25, my: 0.75, found: false, order: 3},
};
const MAPW = 860, MAPH = 640, PITCH = 56;
const CARD = {y: -300, w: 860, h: 400};

export const S3UnderTheHood: React.FC = () => {
  const fr = useCurrentFrame();
  const scan = interpolate(fr, [14, 62], [0, 1], clamp);       // scan line across the caption
  const mapIn = t01(fr, 4, 30, arrive);
  const cam = camAt(fr, [[0, {dist: P * 1.05, pitch: 6}], [70, {dist: P, pitch: 10}], [150, {dist: P * 0.95, pitch: 14, ty: 80}]]);
  const c = creep(fr, 0.7);
  // where each word sits inside the card (laid out as wrapped text; positions measured by order)
  return (
    <Frame>
      <Stage cam={{...cam, yaw: cam.yaw + c.yaw, pitch: cam.pitch + c.pitch}}>
        {/* the map, tilted into a floor */}
        <Layer y={300} z={-40} w={MAPW} h={MAPH} rx={PITCH} style={{opacity: mapIn, borderRadius: 28, overflow: 'visible',
          backgroundImage: `url(${MAP})`, backgroundSize: `${1206 * 1.6}px ${2622 * 1.6}px`, backgroundPosition: `${-150 * 1.6}px ${-600 * 1.6}px`,
          border: '1.5px solid rgba(255,255,255,0.12)'}}>
          {Object.entries(PLACES).map(([name, p]) => {
            const land = 78 + p.order * 9;
            const rise = spr(fr, land, 14, 200);
            if (!p.found) return null;
            return (
              <React.Fragment key={name}>
                <div style={{position: 'absolute', left: p.mx * MAPW - 26, top: p.my * MAPH - 10, width: 52, height: 20, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', filter: 'blur(4px)', opacity: rise}} />
                {/* a pin standing up off the floor */}
                <Layer x={p.mx * MAPW} y={p.my * MAPH - 60} w={60} h={120} rx={-PITCH}
                  style={{transformOrigin: '50% 100%', opacity: fr >= land ? 1 : 0, transform: `rotateX(${-PITCH}deg) scale(${rise})`}}>
                  <div style={{position: 'absolute', left: 28, top: 52, width: 4, height: 68, background: '#fff', opacity: 0.8}} />
                  <div style={{position: 'absolute', left: 0, top: 0, width: 60, height: 60, borderRadius: '50%', background: ACCENT,
                    border: '4px solid #fff', boxSizing: 'border-box'}} />
                  <div style={{position: 'absolute', left: 70, top: 10, whiteSpace: 'nowrap', color: '#fff', fontWeight: 700, fontSize: 30}}>
                    {name.replace('.', '')}</div>
                </Layer>
              </React.Fragment>
            );
          })}
        </Layer>
        {/* the TikTok caption card */}
        <Layer y={CARD.y} w={CARD.w} h={CARD.h} style={{background: '#111113', borderRadius: 30, border: '1.5px solid rgba(255,255,255,0.12)',
          padding: '34px 40px', boxSizing: 'border-box', color: '#fff'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, color: '#A0A0A0', fontSize: 24, fontWeight: 600}}>
            <div style={{width: 0, height: 0, borderTop: '13px solid transparent', borderBottom: '13px solid transparent',
              borderLeft: '20px solid #A0A0A0'}} />From TikTok · @trip.sample
          </div>
          <div style={{marginTop: 22, fontSize: 40, lineHeight: 1.32, fontWeight: 600, position: 'relative'}}>
            {TEXT.map((w, i) => {
              const p = PLACES[w];
              const reached = scan * TEXT.length > i;
              const sel = p ? t01(fr, 14 + (i / TEXT.length) * 48, 20 + (i / TEXT.length) * 48) : 0;
              const leaveAt = 66 + (p?.order ?? 0) * 9;
              const go = p ? t01(fr, leaveAt, leaveAt + 14, travel) : 0;
              const fail = p && !p.found ? t01(fr, leaveAt + 4, leaveAt + 20) : 0;
              return (
                <span key={i} style={{position: 'relative', display: 'inline-block', marginRight: 12,
                  color: p ? (p.found ? ACCENT : lerp(0, 1, fail) > 0.5 ? '#6B6B6B' : ACCENT) : reached ? '#fff' : '#6B6B6B'}}>
                  {p && (
                    <span style={{position: 'absolute', left: -6, right: -6, top: 2, bottom: 0, borderRadius: 8,
                      border: `3px solid ${p.found || fail < 0.5 ? ACCENT : '#6B6B6B'}`, opacity: sel * (1 - go * (p.found ? 1 : 0))}} />
                  )}
                  <span style={{display: 'inline-block', opacity: p && p.found ? 1 - go : 1,
                    transform: p ? (p.found ? `translate(${go * (((PLACES[w].mx - 0.5) * MAPW) * 0.6)}px, ${go * (520 + PLACES[w].my * 260)}px) scale(${1 - go * 0.5})` : `translateY(${fail * 40}px) rotate(${fail * 8}deg)`) : undefined}}>{w}</span>
                  {p && !p.found && <span style={{position: 'absolute', left: 0, top: 54, whiteSpace: 'nowrap', fontSize: 22, color: '#A0A0A0',
                    opacity: fail}}>Not found on the map</span>}
                </span>
              );
            })}
            {/* the scan line */}
            <div style={{position: 'absolute', left: -20, right: -20, top: `${scan * 100}%`, height: 3, background: ACCENT,
              opacity: interpolate(fr, [14, 18, 58, 64], [0, 0.9, 0.9, 0], clamp)}} />
          </div>
        </Layer>
      </Stage>
      <Caption fr={fr} at={2} text="It reads the caption and finds the places" key_="places" />
      <Honesty text="Sample video · places from a demo caption" />
    </Frame>
  );
};
