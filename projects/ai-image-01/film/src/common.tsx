import React, {useLayoutEffect, useRef} from 'react';
import {Easing, interpolate} from 'remotion';
import B from './beats.json';
export {B};

export const FPS = 30;
export const ACCENT = '#FFB547';
export const PAPER = '#F6F1E7';
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
export const easeOut = Easing.bezier(0.2, 0.8, 0.2, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.9, 0.5);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// eased 0..1 between times a and b (seconds)
export const pr = (t: number, a: number, b: number, e = ease) => interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
export const win = (t: number, a: number, b: number, f = 0.3) => Math.min(pr(t, a - f, a), 1 - pr(t, b - f, b));

// keyframed camera: [time, x, y, zoom]; eased between keys
export type Key = [number, number, number, number];
export const camAt = (t: number, keys: Key[]) => {
  if (t <= keys[0][0]) return {x: keys[0][1], y: keys[0][2], z: keys[0][3]};
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, x0, y0, z0] = keys[i], [t1, x1, y1, z1] = keys[i + 1];
    if (t <= t1) {
      const k = Easing.bezier(0.45, 0, 0.55, 1)((t - t0) / (t1 - t0));
      // zoom eased in log space so pushes feel even
      return {x: lerp(x0, x1, k), y: lerp(y0, y1, k), z: Math.exp(lerp(Math.log(z0), Math.log(z1), k))};
    }
  }
  const l = keys[keys.length - 1];
  return {x: l[1], y: l[2], z: l[3]};
};

// a world layer seen through the camera: world point (x, y) lands at screen (540 + (x - cx) z, 960 + (y - cy) z)
export const World: React.FC<{cam: {x: number; y: number; z: number}; children: React.ReactNode; rot?: number}> = ({cam, children, rot = 0}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0,
    transform: `translate(540px, 960px) rotate(${rot}deg) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`, transformOrigin: '0 0'}}>
    {children}
  </div>
);

// absolutely placed box centred at (x, y)
export const At: React.FC<{x: number; y: number; w: number; h: number; rot?: number; style?: React.CSSProperties; children?: React.ReactNode}> =
  ({x, y, w, h, rot = 0, style, children}) => (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: rot ? `rotate(${rot}deg)` : undefined, ...style}}>{children}</div>
  );

// an engine grid (ImageData) shown scaled up with chunky pixels
export const Grid: React.FC<{img: ImageData; style?: React.CSSProperties}> = ({img, style}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { ref.current?.getContext('2d')?.putImageData(img, 0, 0); });
  return <canvas ref={ref} width={img.width} height={img.height} style={{width: '100%', height: '100%', imageRendering: 'pixelated', display: 'block', ...style}} />;
};
