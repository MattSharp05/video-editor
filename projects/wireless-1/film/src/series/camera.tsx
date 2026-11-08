import React, { createContext, useContext } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { ease, osc } from './util';
/**
 * One virtual camera per part (pick §1.4): x,y = the world point at screen centre (depth-1 plane), zoom, rot (deg, ≤ 8).
 * keys: [frame, {x,y,zoom,rot}] eased in-out; between keys the camera never parks: `drift` (default 1) adds a
 * 1–2 %/s breathing move. World is the 1080×1920 frame at zoom 1 (centre 540,960).
 */
export type Cam = { x: number; y: number; zoom: number; rot: number };
export type CamKey = [number, Partial<Cam>];
const BASE: Cam = { x: 540, y: 960, zoom: 1, rot: 0 };
export const camAt = (fr: number, keys: CamKey[], drift = 1): Cam => {
  const full: Cam[] = []; let prev = BASE;
  for (const [, c] of keys) { prev = { ...prev, ...c }; full.push(prev); }
  const frames = keys.map((k) => k[0]);
  const get = (f: keyof Cam) => frames.length < 2 ? (full[0]?.[f] ?? BASE[f]) :
    interpolate(fr, frames, full.map((c) => c[f]), { easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const c = { x: get('x'), y: get('y'), zoom: get('zoom'), rot: get('rot') };
  if (drift) { c.x += osc(fr, 210) * 6 * drift; c.y += osc(fr, 260, 0.3) * 5 * drift; c.zoom *= 1 + osc(fr, 300, 0.1) * 0.012 * drift; }
  return c;
};
const CamCtx = createContext<Cam>(BASE);
export const useCam = () => useContext(CamCtx);
/** Transform for a plane at `depth` (far .2, mid .5, near 1, fore 1.4). */
export const planeTransform = (c: Cam, depth = 1) => {
  const z = 1 + (c.zoom - 1) * depth; const cx = 540 + (c.x - 540) * depth; const cy = 960 + (c.y - 960) * depth;
  return `translate(540 960) rotate(${c.rot}) scale(${z}) translate(${-cx} ${-cy})`;
};
/** World point → screen point for a plane depth (aim overlays at world things). */
export const toScreen = (c: Cam, [x, y]: [number, number], depth = 1): [number, number] => {
  const z = 1 + (c.zoom - 1) * depth; const cx = 540 + (c.x - 540) * depth; const cy = 960 + (c.y - 960) * depth;
  const dx = (x - cx) * z, dy = (y - cy) * z; const r = (c.rot * Math.PI) / 180;
  return [540 + dx * Math.cos(r) - dy * Math.sin(r), 960 + dx * Math.sin(r) + dy * Math.cos(r)];
};
/** <CameraRig fr keys? cam? drift?> one full-frame SVG; put <Plane depth> groups inside. */
export const CameraRig: React.FC<{ fr: number; keys?: CamKey[]; cam?: Cam; drift?: number; children?: React.ReactNode }> = ({ fr, keys = [[0, {}]], cam, drift = 1, children }) => {
  const c = cam ?? camAt(fr, keys, drift);
  return (
    <CamCtx.Provider value={c}>
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ overflow: 'hidden' }}>{children}</svg>
      </AbsoluteFill>
    </CamCtx.Provider>
  );
};
export const Plane: React.FC<{ depth?: number; children?: React.ReactNode; opacity?: number }> = ({ depth = 1, children, opacity }) => {
  const c = useCam();
  return <g transform={planeTransform(c, depth)} opacity={opacity}>{children}</g>;
};
/** Push-through helper: zoom value that makes a round thing of radius r fill the frame (≈ r → 1100 px). */
export const pushZoom = (r: number) => 1100 / r;
