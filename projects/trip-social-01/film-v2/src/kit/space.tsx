// Interface in space: one orbit camera and layers placed in world coordinates (CSS 3D).
// World origin = centre of the frame. The camera orbits a target point:
//   yaw (deg, + turns the world to its left), pitch (deg, + tips the top away), roll, dist (px;
//   dist === P shows the world at 1:1), tx/ty/tz = the point the camera looks at.
import React from 'react';
import {Easing, interpolate, spring} from 'remotion';

export const W = 1080, H = 1920, FPS = 30;
export const P = 2400; // CSS perspective in px
export const BG = '#050506';
export const ACCENT = '#FF6B22';
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type Cam = {yaw: number; pitch: number; roll: number; dist: number; tx: number; ty: number; tz: number};
export const CAM0: Cam = {yaw: 0, pitch: 0, roll: 0, dist: P, tx: 0, ty: 0, tz: 0};

// Easing vocabulary (numbers from the lab notes): travel, arrive, leave.
export const travel = Easing.bezier(0.77, 0, 0.175, 1);
export const arrive = Easing.bezier(0.16, 1, 0.3, 1); // ~expo.out
export const leave = Easing.bezier(0.55, 0, 1, 0.45);
export const t01 = (fr: number, a: number, b: number, e = travel) => interpolate(fr, [a, b], [0, 1], {...clamp, easing: e});
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const spr = (fr: number, at: number, damping = 18, stiffness = 170) =>
  spring({frame: fr - at, fps: FPS, config: {damping, stiffness, mass: 1}});

// Blend camera keys: list of [frame, cam] with travel easing between neighbours.
export const camAt = (fr: number, keys: [number, Partial<Cam>, ((t: number) => number)?][]): Cam => {
  const full = keys.map(([f, c, e]) => [f, {...CAM0, ...c}, e] as const);
  if (fr <= full[0][0]) return full[0][1];
  for (let i = 0; i < full.length - 1; i++) {
    const [fa, a] = full[i], [fb, b, e] = full[i + 1];
    if (fr <= fb) {
      const t = interpolate(fr, [fa, fb], [0, 1], {...clamp, easing: e ?? travel});
      const o = {} as Cam;
      (Object.keys(a) as (keyof Cam)[]).forEach((k) => {
        // distance moves in log space so each doubling takes the same time
        o[k] = k === 'dist' ? Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), t)) : lerp(a[k], b[k], t);
      });
      return o;
    }
  }
  return full[full.length - 1][1];
};

// A slow creep so a hold is never parked (2–5 % over the hold).
export const creep = (fr: number, amt = 1) => ({yaw: Math.sin(fr / 70) * 1.2 * amt, pitch: Math.cos(fr / 90) * 0.8 * amt});

export const Stage: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <div style={{position: 'absolute', inset: 0, perspective: P, perspectiveOrigin: '50% 50%', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: W / 2, top: H / 2 + 70, width: 0, height: 0, transformStyle: 'preserve-3d',
      transform: `translateZ(${P - cam.dist}px) rotateX(${cam.pitch}deg) rotateY(${cam.yaw}deg) rotateZ(${cam.roll}deg) translate3d(${-cam.tx}px, ${-cam.ty}px, ${-cam.tz}px)`}}>
      {children}
    </div>
  </div>
);

// A flat layer centred at (x, y, z) in world space.
export const Layer: React.FC<{x?: number; y?: number; z?: number; w: number; h: number; rx?: number; ry?: number; rz?: number;
  scale?: number; style?: React.CSSProperties; children?: React.ReactNode}> =
  ({x = 0, y = 0, z = 0, w, h, rx = 0, ry = 0, rz = 0, scale = 1, style, children}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transformStyle: 'preserve-3d',
    transform: `translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`, ...style}}>
    {children}
  </div>
);

// ---- the app's screenshot as material ----
// Screenshots are 1206 x 2622 px (iPhone 17 Pro at 3x). K maps screenshot px to world px.
export const SW = 1206, SH = 2622;
export const K = 0.42; // screen = 506 x 1101 world px
export const toWorld = (sx: number, sy: number) => ({x: (sx - SW / 2) * K, y: (sy - SH / 2) * K});

// A rectangle cut out of a screenshot, placed where it sits on the screen (plus z).
export const Slice: React.FC<{src: string; r: [number, number, number, number]; z?: number; k?: number;
  radius?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({src, r, z = 0, k = K, radius = 0, style, children}) => {
  const [sx, sy, sw, sh] = r;
  const c = {x: (sx + sw / 2 - SW / 2) * k, y: (sy + sh / 2 - SH / 2) * k};
  return (
    <Layer x={c.x} y={c.y} z={z} w={sw * k} h={sh * k} style={{backgroundImage: `url(${src})`,
      backgroundSize: `${SW * k}px ${SH * k}px`, backgroundPosition: `${-sx * k}px ${-sy * k}px`, borderRadius: radius, ...style}}>
      {children}
    </Layer>
  );
};

// A phone body with thickness: stacked edge layers behind the screen.
export const PhoneBody: React.FC<{k?: number; depth?: number}> = ({k = K, depth = 26}) => {
  const w = SW * k + 22, h = SH * k + 22;
  return (
    <>
      {Array.from({length: 9}, (_, i) => (
        <Layer key={i} z={-2 - (i * depth) / 8} w={w} h={h}
          style={{borderRadius: 76, background: i === 8 ? '#0D0D0F' : '#232327', border: '1.5px solid rgba(255,255,255,0.10)'}} />
      ))}
    </>
  );
};

// Soft contact shadow a lifted layer casts on the layer beneath (fakes light in CSS).
export const Shadow: React.FC<{x?: number; y?: number; z: number; w: number; h: number; lift: number; radius?: number}> =
  ({x = 0, y = 0, z, w, h, lift, radius = 24}) => (
  <Layer x={x + lift * 0.06} y={y + lift * 0.12} z={z + 0.5} w={w} h={h}
    style={{borderRadius: radius, background: 'rgba(0,0,0,0.75)', filter: `blur(${6 + lift * 0.09}px)`, opacity: Math.min(1, lift / 60)}} />
);

// A label with a hairline leader, in the world (it tilts with its layer).
export const Tag: React.FC<{x: number; y: number; z: number; text: string; o: number; dx?: number}> = ({x, y, z, text, o, dx = 120}) => (
  <Layer x={x + dx / 2} y={y} z={z} w={Math.abs(dx)} h={2}>
    <div style={{position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.55)', transformOrigin: dx > 0 ? 'left' : 'right',
      transform: `scaleX(${o})`}} />
    <div style={{position: 'absolute', [dx > 0 ? 'left' : 'right']: Math.abs(dx) + 12, top: -14, whiteSpace: 'nowrap',
      color: '#fff', opacity: o, fontSize: 30, fontWeight: 800, letterSpacing: 4}}>{text}</div>
  </Layer>
);
