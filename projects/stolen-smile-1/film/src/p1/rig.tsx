// Camera and plane rig (pick §1.4): stage coordinates have (0,0) at the stage centre; the camera looks at (x,y) with
// zoom z; a plane with factor k moves k times as far (backdrop 0.2 … fore 1.35). Keyframes ease in-out; a minimum
// drift keeps the camera from ever parking.
import React from 'react';
import {Easing, interpolate} from 'remotion';

export type Cam = {x: number; y: number; z: number; r?: number};
const io = Easing.bezier(0.45, 0, 0.55, 1);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const camAt = (t: number, keys: [number, Cam][]): Cam => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, a] = keys[i], [tb, b] = keys[i + 1];
    if (t <= tb) {
      const k = io((t - ta) / Math.max(1e-6, tb - ta));
      return {x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z * Math.pow(b.z / a.z, k), r: (a.r ?? 0) + ((b.r ?? 0) - (a.r ?? 0)) * k};
    }
  }
  return keys[keys.length - 1][1];
};
// never park: add a slow drift
export const drift = (c: Cam, t: number): Cam => ({...c, x: c.x + Math.sin(t * 0.37) * 10, y: c.y + Math.cos(t * 0.29) * 7});

const CamCtx = React.createContext<Cam>({x: 0, y: 0, z: 1});
export const Stage: React.FC<{cam: Cam; children: React.ReactNode; bg: string}> = ({cam, children, bg}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, background: bg}}>
    <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>
  </svg>
);
export const Plane: React.FC<{k: number; children: React.ReactNode; dark?: number}> = ({k, children, dark = 0}) => {
  const c = React.useContext(CamCtx);
  const z = 1 + (c.z - 1) * Math.min(1, Math.max(0.15, k));
  return (
    <g transform={`translate(540,960) rotate(${c.r ?? 0}) scale(${z}) translate(${-c.x * k},${-c.y * k})`}>
      {children}
      {dark > 0 && <rect x={-4000} y={-4000} width={8000} height={8000} fill="#231B16" opacity={dark} />}
    </g>
  );
};
export const win = (t: number, a: number, b: number, f = 0.3) =>
  Math.min(interpolate(t, [a, a + f], [0, 1], clamp), interpolate(t, [b - f, b], [1, 0], clamp));
export const ramp = (t: number, a: number, d = 0.4) => interpolate(t, [a, a + d], [0, 1], {...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1)});
export const rampIO = (t: number, a: number, d = 0.4) => interpolate(t, [a, a + d], [0, 1], {...clamp, easing: io});
