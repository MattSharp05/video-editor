// Line 10 recap inside the dog TV: the denoise steps hang one behind the other like a corridor, from static to sharp,
// and the paper plane leads the camera down it. The last frame arrives exactly where the phone's picture bubble will
// be (900 px wide, centred), so the pull-back to the phone continues the same move.
import React from 'react';
import {random} from 'remotion';
import {B, ease, Grid, lerp, pr} from './common';
import {drawTarget} from './art';
import {N, stepImage} from './engine';
import {Plane} from './Plane';
import {C0} from './Room';
import {T_LAND} from './Desk';

export const FRAMES = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, N];
const D = 520, P = 1000, FW = 900, FH = 675;
const S0 = P * (1 - 1 / 3.0); // frame 0 starts at 3x (the TV glass filling the frame)
const S1 = (FRAMES.length - 1) * D;

export const Corridor: React.FC<{t: number}> = ({t}) => {
  const u = pr(t, C0, T_LAND, (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2) * 0.15 + x * 0.85);
  const s = lerp(S0, S1, u);
  const sway = Math.sin(t * 1.7) * 30 * (1 - u);
  // frames hang staggered left/right and tilted, settling to the centre near the end, so each one visibly passes the lens
  const stag = (i: number) => (i === FRAMES.length - 1 ? 0 : (i % 2 ? 1 : -1) * 170 * (1 - Math.pow(i / (FRAMES.length - 1), 2)));
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 50%, #4A2C1A 0%, #2A170D 55%, #170D07 100%)'}}>
      <div style={{position: 'absolute', inset: 0, perspective: P, perspectiveOrigin: '50% 50%'}}>
        {FRAMES.map((k, i) => {
          const dz = s - i * D;
          if (dz > (i === 0 ? P * 0.93 : P * 0.6) || dz < -14 * D) return null;
          // fade as it nears the lens (frame 0 starts filling the glass, so it fades only once it passes)
          const near = i === 0 ? Math.max(0, (dz - P * 0.67) / (P * 0.26)) : Math.min(1, Math.max(0, (dz - P * 0.2) / (P * 0.35)));
          return (
            <div key={k} style={{position: 'absolute', left: 540 - FW / 2 + sway * (i % 2 ? 1 : -1) * 0.3 + stag(i) * (1 - pr(t, T_LAND - 0.7, T_LAND)), top: 960 - FH / 2 + (i % 3 - 1) * 60 * (1 - pr(t, T_LAND - 0.7, T_LAND)), width: FW, height: FH, borderRadius: 28, overflow: 'hidden',
              transform: `translateZ(${dz}px) rotateZ(${(i % 3 - 1) * 4 * (1 - pr(t, T_LAND - 0.7, T_LAND))}deg) rotateY(${(i % 2 ? -1 : 1) * 10 * (1 - pr(t, T_LAND - 0.7, T_LAND))}deg)`, opacity: 1 - near,
              boxShadow: `0 0 60px rgba(255,170,90,${0.25 + 0.4 * (i / FRAMES.length)})`}}>
              <Grid img={stepImage('target', drawTarget, k)} />
            </div>
          );
        })}
      </div>
      {/* warm dust motes streaming past the lens: parallax for the flight */}
      <div style={{position: 'absolute', inset: 0, perspective: P}}>
        {Array.from({length: 90}, (_, i) => {
          const z = ((random(`mz${i}`) * 14 * D + s * 1.0) % (14 * D)) - 13 * D;
          if (z > P * 0.85) return null;
          const a = random(`ma${i}`) * Math.PI * 2, r = 300 + random(`mr${i}`) * 700;
          return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * r, top: 960 + Math.sin(a) * r * 1.4, width: 48, height: 48, borderRadius: 24,
            background: 'radial-gradient(circle, rgba(255,215,150,0.95) 0%, rgba(255,170,90,0.5) 55%, rgba(255,170,90,0) 100%)', transform: `translateZ(${z}px)`, opacity: Math.min(1, (z + 13 * D) / (3 * D))}} />;
        })}
      </div>
      {/* the plane leading the way, just ahead of the camera */}
      <div style={{position: 'absolute', left: 540 - 120 + Math.sin(t * 2.3) * 120, top: lerp(1180, 1060, u) + Math.cos(t * 1.9) * 40, opacity: 1 - pr(t, T_LAND - 0.45, T_LAND - 0.1),
        transform: `rotate(${-90 + Math.sin(t * 2.3) * 12}deg) scale(${lerp(1, 0.5, pr(t, T_LAND - 0.6, T_LAND - 0.1, ease))})`, filter: 'drop-shadow(0 14px 14px rgba(0,0,0,0.5))'}}>
        <Plane size={240} fold={1} />
      </div>
    </div>
  );
};
export {B};
