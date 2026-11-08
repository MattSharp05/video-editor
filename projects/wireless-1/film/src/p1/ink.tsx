// Part-1 drawing helpers in the series style (pick §1.3): ink outline, fill offset +3/+2 (misregistration), halftone
// dot shading on the shadow side, no drop shadows. Used only by the part-only pieces; shared things are the kit's.
import React from 'react';
import {K} from './tok';

export const InkDefs: React.FC = () => (
  <defs>
    <pattern id="p1-ht" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx={4.5} cy={4.5} r={2.2} fill={K.ink} opacity={0.35} />
    </pattern>
    <pattern id="p1-htf" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx={3.5} cy={3.5} r={1.4} fill={K.ink} opacity={0.25} />
    </pattern>
    <radialGradient id="p1-lampglow"><stop offset="0" stopColor={K.lamp} stopOpacity={0.75} /><stop offset="1" stopColor={K.lamp} stopOpacity={0} /></radialGradient>
    <radialGradient id="p1-sparkglow"><stop offset="0" stopColor="#fff" stopOpacity={0.9} /><stop offset="0.3" stopColor={K.spark} stopOpacity={0.6} /><stop offset="1" stopColor={K.sparkHalo} stopOpacity={0} /></radialGradient>
    <linearGradient id="p1-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={K.lamp} stopOpacity={0.5} /><stop offset="1" stopColor={K.lamp} stopOpacity={0.05} /></linearGradient>
  </defs>
);
// a printed shape: fill offset by the misregistration, ink line on top, optional halftone shade
export const Sh: React.FC<{d: string; fill?: string; line?: number; ht?: 'near' | 'far' | false; o?: number; lineColor?: string}> = ({d, fill, line = 3, ht = false, o = 1, lineColor = K.ink}) => (
  <g opacity={o}>
    {fill && <path d={d} fill={fill} transform="translate(3,2)" />}
    {ht && <path d={d} fill={`url(#${ht === 'near' ? 'p1-ht' : 'p1-htf'})`} transform="translate(3,2)" />}
    {line > 0 && <path d={d} fill="none" stroke={lineColor} strokeWidth={line} strokeLinejoin="round" strokeLinecap="round" />}
  </g>
);
export const R = (x: number, y: number, w: number, h: number, r = 0) =>
  r ? `M${x + r},${y}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(w - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(h - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}z` : `M${x},${y}h${w}v${h}h${-w}z`;
export const E = (cx: number, cy: number, rx: number, ry = rx) => `M${cx - rx},${cy}a${rx},${ry} 0 1 0 ${2 * rx},0a${rx},${ry} 0 1 0 ${-2 * rx},0z`;
export const Glow: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => <circle cx={x} cy={y} r={r} fill="url(#p1-lampglow)" opacity={o} />;
