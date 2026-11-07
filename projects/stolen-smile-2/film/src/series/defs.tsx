import React from 'react';
import { C } from './tokens';

/**
 * Shared SVG defs (filters, gradients). Rendered once by <SeriesGrade> in a hidden svg; any inline
 * svg in the page can reference them. If you render without SeriesGrade, mount <SeriesDefs/> yourself.
 *  filter ss-cut / ss-cut-l : paper cut-out: 4 px card rim + flat paper shadow (+8,+10) / (-8,+10)
 *  filter ss-shadow / ss-shadow-l : shadow only (props, flats)
 *  filter ss-fore : foreground plane darkened 15 % toward ink
 *  gradient ss-amber : amber glow (her), ss-amber-soft, ss-lamp : warm lamp pool, ss-beam : skylight beam
 */
const cutFilter = (id: string, dx: number, rim: number) => (
  <filter id={id} x="-25%" y="-25%" width="160%" height="160%" colorInterpolationFilters="sRGB">
    {rim > 0 && <feMorphology in="SourceAlpha" operator="dilate" radius={rim} result="d" />}
    {rim > 0 && <feFlood floodColor={C.card} result="cc" />}
    {rim > 0 && <feComposite in="cc" in2="d" operator="in" result="rim" />}
    <feOffset in={rim > 0 ? 'd' : 'SourceAlpha'} dx={dx} dy={10} result="so" />
    <feFlood floodColor={C.ink} floodOpacity={0.28} />
    <feComposite in2="so" operator="in" result="sh" />
    <feMerge>
      <feMergeNode in="sh" />
      {rim > 0 && <feMergeNode in="rim" />}
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);
export const SeriesDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
    <defs>
      {cutFilter('ss-cut', 8, 4)}
      {cutFilter('ss-cut-l', -8, 4)}
      {cutFilter('ss-shadow', 8, 0)}
      {cutFilter('ss-shadow-l', -8, 0)}
      {cutFilter('ss-shadow-s', 4, 0)}
      <filter id="ss-fore" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.85 0 0 0 0.02  0 0.85 0 0 0.015  0 0 0.85 0 0.012  0 0 0 1 0" />
      </filter>
      <radialGradient id="ss-amber">
        <stop offset="0%" stopColor={C.amberGlow} stopOpacity={0.95} />
        <stop offset="45%" stopColor={C.amber} stopOpacity={0.55} />
        <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="ss-amber-soft">
        <stop offset="0%" stopColor={C.amberGlow} stopOpacity={0.7} />
        <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="ss-lamp">
        <stop offset="0%" stopColor="#FFF4D6" stopOpacity={0.55} />
        <stop offset="100%" stopColor="#FFF4D6" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="ss-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFF8E6" stopOpacity={0.4} />
        <stop offset="100%" stopColor="#FFF8E6" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="ss-night-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.duskBlue} stopOpacity={0.45} />
        <stop offset="100%" stopColor={C.duskBlue} stopOpacity={0} />
      </linearGradient>
    </defs>
  </svg>
);
/** filter attribute for a cut-out: lamp 'left' (default, interiors: shadow falls right) or 'right' (night halls). */
export const cutout = (lamp: 'left' | 'right' = 'left') => (lamp === 'left' ? 'url(#ss-cut)' : 'url(#ss-cut-l)');
export const shadowOnly = (lamp: 'left' | 'right' = 'left') => (lamp === 'left' ? 'url(#ss-shadow)' : 'url(#ss-shadow-l)');
