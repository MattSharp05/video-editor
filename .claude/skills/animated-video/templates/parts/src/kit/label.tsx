// A label pinned to a 3D point: projected with the film's own camera, on a dark pill, kept inside the frame's safe
// width. Both s5 films (ball stack, microwave myth) lost labels off the frame edge or against a busy picture until
// they had the pill and the clamp.
//
//   import {Label} from './kit/label';
//   const cam = (t: number) => TL.camAt(t);            // {pos, look, mm, up?} in metres, focal length on 36 mm
//   <Label cam={cam(t)} p={[0.5, 1.4, 0]} o={opacity} text="your hand" color="#EAF6FF" font={SANS} dx={14} />
// align: 'left' (text starts at the point + dx), 'right' (ends there) or 'center'. Width is estimated from the text.
import React from 'react';
import * as THREE from 'three';

export type CamState = {pos: [number, number, number]; look: [number, number, number]; mm: number; up?: [number, number, number]};
export const projectPoint = (c: CamState, p: [number, number, number], w = 1080, h = 1920) => {
  const cam = new THREE.PerspectiveCamera(50, w / h, 0.01, 100000);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.set(...c.pos);
  if (c.up) cam.up.set(...c.up).normalize();
  cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, behind: v.z > 1};
};

export const Label: React.FC<{
  cam: CamState; p: [number, number, number]; o: number; text: string; color: string; font: string;
  size?: number; dx?: number; dy?: number; align?: 'left' | 'right' | 'center'; minX?: number; maxX?: number; sub?: string;
}> = ({cam, p, o, text, color, font, size = 48, dx = 0, dy = 0, align = 'left', minX = 50, maxX = 1010, sub}) => {
  if (o <= 0.01) return null;
  const q = projectPoint(cam, p);
  if (q.behind) return null;
  const wEst = text.length * size * 0.52 + 32;
  const x0 = q.x + dx - (align === 'left' ? 0 : align === 'right' ? wEst : wEst / 2);
  const x = q.x + Math.max(0, minX - x0) - Math.max(0, x0 + wEst - maxX);
  const tx = align === 'left' ? '0' : align === 'right' ? '-100%' : '-50%';
  return (
    <div style={{position: 'absolute', left: x + dx, top: q.y + dy, transform: `translate(${tx},-50%) translateY(${(1 - o) * 10}px)`, opacity: o,
      font: `800 ${size}px ${font}`, color, whiteSpace: 'nowrap', textAlign: align, textShadow: '0 2px 10px rgba(0,0,0,0.75)',
      background: 'rgba(8,8,12,0.55)', padding: '4px 16px', borderRadius: 14}}>
      {text}
      {sub && <div style={{font: `700 ${Math.round(size * 0.6)}px ${font}`, color: '#fff', opacity: 0.85}}>{sub}</div>}
    </div>
  );
};
