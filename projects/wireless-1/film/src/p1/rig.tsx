// Part-1 camera rig (pick §1.4). Each stage is a world in frame coords (1080×1920). The camera looks at world (x,y) with
// zoom z and rotation r; a plane with factor k (far 0.2 · mid 0.5 · near 1 · fore 1.4) moves k times as far.
// Keys ease in-out; drift() keeps it from ever parking. Times are seconds (t = frame / 30).
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
export const drift = (c: Cam, t: number, a = 1): Cam => ({...c, x: c.x + a * (Math.sin(t * 0.37) * 12 + Math.sin(t * 0.91) * 5), y: c.y + a * (Math.cos(t * 0.29) * 9 + Math.sin(t * 0.77) * 4)});
// screen point of a world point on plane k
export const toScreen = (c: Cam, p: [number, number], k = 1): [number, number] => {
  const z = 1 + (c.z - 1) * Math.min(1.6, Math.max(0.15, k)), r = ((c.r ?? 0) * Math.PI) / 180;
  const dx = (p[0] - 540 - (c.x - 540) * k) * z, dy = (p[1] - 960 - (c.y - 960) * k) * z;
  return [540 + dx * Math.cos(r) - dy * Math.sin(r), 960 + dx * Math.sin(r) + dy * Math.cos(r)];
};
const CamCtx = React.createContext<Cam>({x: 540, y: 960, z: 1});
export const useCam = () => React.useContext(CamCtx);
export const World: React.FC<{cam: Cam; children: React.ReactNode; bg: string; clip?: {x: number; y: number; r: number}; id?: string}> = ({cam, children, bg, clip, id = 'w'}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    {clip && <defs><clipPath id={`clip-${id}`}><circle cx={clip.x} cy={clip.y} r={clip.r} /></clipPath></defs>}
    <g clipPath={clip ? `url(#clip-${id})` : undefined}>
      <rect width={1080} height={1920} fill={bg} />
      <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>
    </g>
  </svg>
);
// a parallax plane: world coords in frame space; centre of the frame is (540,960)
export const Layer: React.FC<{k: number; children: React.ReactNode}> = ({k, children}) => {
  const c = React.useContext(CamCtx);
  const z = 1 + (c.z - 1) * Math.min(1.6, Math.max(0.15, k));
  return <g transform={`translate(540,960) rotate(${c.r ?? 0}) scale(${z}) translate(${-540 - (c.x - 540) * k},${-960 - (c.y - 960) * k})`}>{children}</g>;
};
export const ramp = (t: number, a: number, d = 0.4) => interpolate(t, [a, a + d], [0, 1], {...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1)});
export const rampIO = (t: number, a: number, d = 0.4) => interpolate(t, [a, a + d], [0, 1], {...clamp, easing: io});
export const win = (t: number, a: number, b: number, f = 0.3) => Math.min(interpolate(t, [a, a + f], [0, 1], clamp), interpolate(t, [b - f, b], [1, 0], clamp));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const fr = (t: number) => Math.round(t * 30);
// deterministic hash noise
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
