// S5 · Push-through. Says: "go deeper into this one thing".
// The camera dives into one pin on the map; the pin's photo opens like an iris until it is
// the whole frame, and that photo becomes the next screen (the carrier is the photo).
import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Caption, Frame, Honesty} from '../kit/caption';
import {ACCENT, H, K, Layer, P, PhoneBody, Slice, Stage, SW, SH, W, arrive, camAt, clamp, leave, t01, toWorld} from '../kit/space';

const SRC = staticFile('vegas-plan-day-2.png');
const PIN = {x: 439, y: 1099}; // the photo pin (Bellagio Fountains)
const PHOTO = staticFile('photos/strip-rw.jpg');

export const S5PushThrough: React.FC = () => {
  const fr = useCurrentFrame();
  const pin = toWorld(PIN.x, PIN.y);
  const cam = camAt(fr, [[6, {dist: P}], [52, {dist: P * 0.07, tx: pin.x, ty: pin.y, yaw: -8, pitch: 6}, leave]]);
  // iris: once the pin fills ~half the frame, its photo takes over as a 2D circle that grows to the corners
  const iris = interpolate(fr, [46, 62], [0, 1], {...clamp, easing: arrive as any});
  const r = interpolate(iris, [0, 1], [180, Math.hypot(W, H) / 2 + 40]);
  const card = t01(fr, 58, 76, arrive);
  const photoZoom = interpolate(fr, [40, 120], [1.25, 1.05], clamp);
  return (
    <Frame>
      {fr < 62 && (
        <Stage cam={cam}>
          <PhoneBody />
          <Slice src={SRC} r={[0, 0, SW, SH]} radius={64} />
          <Layer x={pin.x} y={pin.y} z={2} w={92 * K} h={92 * K} style={{borderRadius: '50%', overflow: 'hidden', border: '2px solid #fff'}}>
            <Img src={PHOTO} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </Layer>
        </Stage>
      )}
      {fr >= 46 && (
        <div style={{position: 'absolute', inset: 0, clipPath: `circle(${r}px at 50% 50%)`}}>
          <Img src={PHOTO} style={{position: 'absolute', width: '100%', height: 1150, objectFit: 'cover', transform: `scale(${photoZoom})`}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 560, background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0))'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 850, height: 300, background: 'linear-gradient(rgba(0,0,0,0), #000)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1150, bottom: 0, background: '#000'}} />
          <div style={{position: 'absolute', left: 70, right: 70, top: 1000, color: '#fff', opacity: card,
            transform: `translateY(${(1 - card) * 40}px)`}}>
            <div style={{fontSize: 30, color: ACCENT, fontWeight: 700}}>12:00 PM · Fri 13</div>
            <div style={{fontSize: 76, fontWeight: 800, letterSpacing: -2, marginTop: 6}}>Bellagio Fountains</div>
            <div style={{fontSize: 32, color: '#A0A0A0', marginTop: 8}}>3600 Las Vegas Blvd S</div>
            <div style={{display: 'flex', gap: 16, marginTop: 34}}>
              {['9 min drive', 'Free', 'Every 15 min'].map((c, i) => (
                <div key={c} style={{padding: '14px 24px', borderRadius: 999, background: '#151517', border: '1.5px solid rgba(255,255,255,0.12)',
                  fontSize: 28, fontWeight: 600, opacity: t01(fr, 70 + i * 4, 80 + i * 4)}}>{c}</div>
              ))}
            </div>
          </div>
        </div>
      )}
      <Caption fr={fr} at={4} text="Tap a pin to go inside" key_="inside" />
      {fr >= 58 && <Honesty text="Stand-in photo and details" />}
    </Frame>
  );
};
