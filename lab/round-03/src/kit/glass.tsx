// Glass: the interface as a physical material (principle 2).
// A pane has thickness (stacked edge layers), a bright rim where light catches, a soft inner
// highlight, a specular band that slides as the pane turns, and an optional frost.
import React from 'react';
import {Layer} from './space';

export type GlassLook = 'frosted' | 'clear' | 'tinted';

export const Glass: React.FC<{w: number; h: number; x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number;
  radius?: number; look?: GlassLook; turn?: number; thickness?: number; opacity?: number; scale?: number;
  style?: React.CSSProperties; children?: React.ReactNode; behind?: React.ReactNode}> =
  ({w, h, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, radius = 40, look = 'clear', turn = 0, thickness = 10, opacity = 1, scale = 1, style, children, behind}) => {
  const fill = look === 'tinted' ? 'rgba(255,140,80,0.10)' : look === 'frosted' ? 'rgba(235,240,255,0.10)' : 'rgba(10,12,22,0.5)' /* clear, tinted dark so UI reads over the background */;
  // specular band position follows the pane's turn (deg) so it slides as the camera orbits
  const band = 30 + turn * 1.6;
  return (
    <Layer x={x} y={y} z={z} w={w} h={h} rx={rx} ry={ry} rz={rz} scale={scale} style={{opacity, ...style}}>
      {/* thickness: edge layers behind the face */}
      {Array.from({length: 4}, (_, i) => (
        <div key={i} style={{position: 'absolute', inset: 0, borderRadius: radius, transform: `translateZ(${-(i + 1) * thickness / 4}px)`,
          border: '1.5px solid rgba(255,255,255,0.16)', background: i === 3 ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.015)'}} />
      ))}
      {/* the face */}
      <div style={{position: 'absolute', inset: 0, borderRadius: radius, overflow: 'hidden', background: fill,
        border: '1.5px solid rgba(255,255,255,0.32)',
        boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(255,255,255,0.10), 0 40px 80px rgba(0,0,0,0.55)',
        }}>
        {/* frost: CSS backdrop-filter doesn't render in 3D, so blur a copy of what sits behind */}
        {look === 'frosted' && behind && <div style={{position: 'absolute', inset: -30, filter: 'blur(16px) saturate(140%)', opacity: 0.85}}>{behind}</div>}
        {children}
        {/* soft inner highlight from the top-left */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(150deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 38%)'}} />
        {/* specular band */}
        <div style={{position: 'absolute', top: '-40%', bottom: '-40%', width: '22%', left: `${band}%`, transform: 'rotate(18deg)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.10), rgba(255,255,255,0))'}} />
      </div>
    </Layer>
  );
};

// Defs for the SVG filter that turns an app screenshot's black into transparency, so dark UI
// fills become tinted glass and text stays solid. Render <GlassDefs /> once per frame.
export const GlassDefs: React.FC = () => (
  <svg width="0" height="0" style={{position: 'absolute'}}>
    <filter id="ui-on-glass" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.6 1.6 1.6 0 -0.04" />
    </filter>
  </svg>
);
export const UI_ON_GLASS = 'url(#ui-on-glass)';
