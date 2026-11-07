import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { clamp, easeInOut } from './util';

/**
 * Parallax-plane camera (pick §1.4). The world is drawn in 1080×1920 coordinates.
 *   <CameraRig fr keys={[[0,{x:540,y:960,zoom:1}],[90,{zoom:1.4}]]} drift={1}>
 *     <Plane depth={PLANE.backdrop}>…</Plane> … <Plane depth={PLANE.fore} fore>…</Plane>
 *   </CameraRig>
 * Cam {x,y} is the world point at frame centre; zoom 1 = 1:1; rot degrees (gags only, ±4°).
 * Keys ease cubic in-out by default. `drift` adds a slow handheld wander (min ~6 px/s) so the camera never parks.
 */
export type Cam = { x: number; y: number; zoom: number; rot: number };
export type CamKey = [frame: number, cam: Partial<Cam>, ease?: (t: number) => number];
export const CAM0: Cam = { x: 540, y: 960, zoom: 1, rot: 0 };
export const PLANE = { backdrop: 0.2, far: 0.45, mid: 0.7, actors: 1, fore: 1.35 } as const;
const CX = 540, CY = 960;

export const camAt = (fr: number, keys: CamKey[]): Cam => {
  let prev: Cam = { ...CAM0, ...keys[0]?.[1] };
  if (!keys.length || fr <= keys[0][0]) return prev;
  for (let i = 1; i < keys.length; i++) {
    const [k1, c1, e = easeInOut] = keys[i];
    const next: Cam = { ...prev, ...c1 };
    const k0 = keys[i - 1][0];
    if (fr < k1) {
      const t = interpolate(fr, [k0, k1], [0, 1], { ...clamp, easing: e });
      return {
        x: prev.x + (next.x - prev.x) * t, y: prev.y + (next.y - prev.y) * t,
        zoom: Math.exp(Math.log(prev.zoom) + (Math.log(next.zoom) - Math.log(prev.zoom)) * t),
        rot: prev.rot + (next.rot - prev.rot) * t,
      };
    }
    prev = next;
  }
  return prev;
};
export const drift = (fr: number, amount = 1, seed = 0) => ({
  x: amount * (Math.sin(fr * 0.031 + seed) * 6 + Math.sin(fr * 0.077 + seed * 2.1) * 4),
  y: amount * (Math.sin(fr * 0.027 + seed * 1.3 + 1) * 6 + Math.sin(fr * 0.069 + seed * 0.7) * 3),
  rot: amount * (Math.sin(fr * 0.019 + seed * 0.5) * 0.12),
});
/** SVG transform world→screen for a plane at `depth` (1 = actors, <1 farther, >1 foreground). */
export const parallax = (cam: Cam, depth = 1) => {
  const x = CX + (cam.x - CX) * depth, y = CY + (cam.y - CY) * depth, z = Math.pow(cam.zoom, depth);
  return `translate(${CX} ${CY}) rotate(${cam.rot}) scale(${z}) translate(${-x} ${-y})`;
};
/** Screen point of a world point on a plane (aim overlays/cards at world things). */
export const toScreen = (cam: Cam, p: [number, number], depth = 1): [number, number] => {
  const x = CX + (cam.x - CX) * depth, y = CY + (cam.y - CY) * depth, z = Math.pow(cam.zoom, depth);
  const r = (cam.rot * Math.PI) / 180, dx = (p[0] - x) * z, dy = (p[1] - y) * z;
  return [CX + dx * Math.cos(r) - dy * Math.sin(r), CY + dx * Math.sin(r) + dy * Math.cos(r)];
};

const CamCtx = createContext<Cam>(CAM0);
export const useCam = () => useContext(CamCtx);

export const CameraRig: React.FC<{ fr: number; keys?: CamKey[]; cam?: Cam; drift?: number; seed?: number; children?: React.ReactNode; bg?: string }> =
  ({ fr, keys = [], cam, drift: d = 1, seed = 0, children, bg }) => {
    const base = cam ?? camAt(fr, keys);
    const h = drift(fr, d, seed);
    const c: Cam = { x: base.x + h.x / base.zoom, y: base.y + h.y / base.zoom, zoom: base.zoom, rot: base.rot + h.rot };
    return (
      <CamCtx.Provider value={c}>
        <AbsoluteFill style={{ backgroundColor: bg }}>
          <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ overflow: 'hidden' }}>{children}</svg>
        </AbsoluteFill>
      </CamCtx.Provider>
    );
  };
/** One parallax plane. `fore` darkens it 15 % toward ink (foreground arches, jambs, crowd heads). */
export const Plane: React.FC<{ depth?: number; fore?: boolean; children?: React.ReactNode; opacity?: number }> =
  ({ depth = 1, fore, children, opacity }) => {
    const cam = useCam();
    return <g transform={parallax(cam, depth)} filter={fore ? 'url(#ss-fore)' : undefined} opacity={opacity}>{children}</g>;
  };

/**
 * Carrier push (the series' only hand-off). Children = the outgoing picture (full frame). From `at` over `dur`
 * frames the outgoing picture is pushed into the carrier at screen point (x,y), carrier radius r, until the
 * carrier fills the frame (≥120 %); the `next` picture is swapped in behind it; the carrier node then turns into
 * `becomes` (cross-dissolve of the carrier art only) and shrinks to rest at (toX,toY) size toR.
 * carrier / becomes are drawn inside an svg viewBox -100 -100 200 200 (centre 0,0, radius 100).
 */
export const CarrierPush: React.FC<{
  fr: number; at: number; dur?: number; x: number; y: number; r: number;
  carrier?: React.ReactNode; becomes?: React.ReactNode; next?: React.ReactNode; toX?: number; toY?: number; toR?: number;
  children?: React.ReactNode;
}> = ({ fr, at, dur = 30, x, y, r, carrier, becomes, next, toX = 540, toY = 960, toR, children }) => {
  const t = interpolate(fr, [at, at + dur], [0, 1], clamp);
  const fill = (Math.hypot(1080, 1920) / (2 * r)) * 1.25;
  const inT = Easing.in(Easing.cubic)(Math.min(1, t / 0.55));
  const outT = Easing.out(Easing.cubic)(Math.max(0, (t - 0.55) / 0.45));
  const s1 = Math.exp(Math.log(fill) * inT);
  const rr = toR ?? r;
  const s2 = Math.exp(Math.log(fill * r / rr) * (1 - outT));
  const phase1 = t < 0.55;
  const box = (node: React.ReactNode, cx: number, cy: number, rad: number, op = 1) => (
    <div style={{ position: 'absolute', left: cx - rad, top: cy - rad, width: rad * 2, height: rad * 2, opacity: op }}>
      <svg viewBox="-100 -100 200 200" width="100%" height="100%" style={{ overflow: 'visible' }}>{node}</svg>
    </div>
  );
  if (fr < at) return <AbsoluteFill>{children}{carrier && box(carrier, x, y, r)}</AbsoluteFill>;
  if (fr >= at + dur) return <AbsoluteFill>{next}{becomes && box(becomes, toX, toY, rr)}</AbsoluteFill>;
  // the carrier's own screen centre travels from (x,y) to the frame centre as it grows, then to (toX,toY)
  const cx = phase1 ? x + (540 - x) * inT : 540 + (toX - 540) * outT;
  const cy = phase1 ? y + (960 - y) * inT : 960 + (toY - 960) * outT;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {phase1 ? (
        <AbsoluteFill style={{ transformOrigin: `${x}px ${y}px`, transform: `translate(${cx - x}px, ${cy - y}px) scale(${s1})` }}>{children}</AbsoluteFill>
      ) : next}
      {phase1
        ? carrier && box(carrier, cx, cy, r * s1)
        : (<>{carrier && box(carrier, cx, cy, rr * s2, 1 - outT)}{becomes && box(becomes, cx, cy, rr * s2, outT)}</>)}
    </AbsoluteFill>
  );
};

/** Pop-up-book fold: a flat hinges up from the floor (dir 'up', hinge at its bottom y) or down from the top. 10–14 frames. */
export const FoldUp: React.FC<{ fr: number; at: number; dur?: number; hingeY: number; dir?: 'up' | 'down'; reverse?: boolean; children?: React.ReactNode }> =
  ({ fr, at, dur = 12, hingeY, dir = 'up', reverse, children }) => {
    let t = interpolate(fr, [at, at + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
    if (reverse) t = 1 - interpolate(fr, [at, at + dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
    if (t <= 0.001) return null;
    const sy = dir === 'up' ? t : t;
    return (
      <g transform={`translate(0 ${hingeY}) scale(1 ${sy}) translate(0 ${-hingeY})`} opacity={Math.min(1, t * 3)}>{children}</g>
    );
  };
