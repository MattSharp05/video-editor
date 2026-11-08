import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import './fonts';
import { C } from './tokens';
import { osc } from './util';

/**
 * Global SVG defs (halftone patterns, shade masks, lamp/fog gradients). <Grade> mounts it; mount it yourself
 * (once) only if you render without <Grade>.
 *  patterns: wn-ht (near: r2.2 pitch 9 45°, ink 35 %), wn-htf (far: r1.4 pitch 7, 25 %), wn-htc (Cora cheeks, cora 30 %),
 *            wn-htl (light dots for deep fills: newsprint 18 %)
 *  masks (objectBoundingBox): wn-shR wn-shL wn-shB wn-shT (shadow side right/left/bottom/top), wn-shRB (lower-right)
 *  gradients: wn-lamp (radial lamp halo), wn-fog (radial fog puff), wn-beam (lamp beam cone), wn-dawn (sky)
 */
export const KitDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
    <defs>
      <pattern id="wn-ht" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx={4.5} cy={4.5} r={2.2} fill={C.ink} fillOpacity={0.35} />
      </pattern>
      <pattern id="wn-htf" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx={3.5} cy={3.5} r={1.4} fill={C.ink} fillOpacity={0.25} />
      </pattern>
      <pattern id="wn-htc" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx={4.5} cy={4.5} r={2.6} fill={C.cora} fillOpacity={0.3} />
      </pattern>
      <pattern id="wn-htl" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx={4.5} cy={4.5} r={1.8} fill={C.newsprint} fillOpacity={0.18} />
      </pattern>
      {([['R', 0, 0, 1, 0], ['L', 1, 0, 0, 0], ['B', 0, 0, 0, 1], ['T', 0, 1, 0, 0], ['RB', 0, 0, 1, 1]] as const).map(([k, x1, y1, x2, y2]) => (
        <React.Fragment key={k}>
          <linearGradient id={`wn-g${k}`} x1={x1} y1={y1} x2={x2} y2={y2}>
            <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.62" stopColor="#fff" stopOpacity={1} />
          </linearGradient>
          <mask id={`wn-sh${k}`} maskContentUnits="objectBoundingBox">
            <rect x={-0.1} y={-0.1} width={1.2} height={1.2} fill={`url(#wn-g${k})`} />
          </mask>
        </React.Fragment>
      ))}
      <radialGradient id="wn-lamp"><stop offset="0" stopColor={C.lamp} stopOpacity={0.85} /><stop offset="0.35" stopColor={C.lamp} stopOpacity={0.35} /><stop offset="1" stopColor={C.lamp} stopOpacity={0} /></radialGradient>
      <radialGradient id="wn-fog"><stop offset="0" stopColor={C.fog} stopOpacity={0.75} /><stop offset="0.6" stopColor={C.fog} stopOpacity={0.3} /><stop offset="1" stopColor={C.fog} stopOpacity={0} /></radialGradient>
      <radialGradient id="wn-spark"><stop offset="0" stopColor={C.sparkCore} stopOpacity={1} /><stop offset="0.25" stopColor={C.spark} stopOpacity={0.8} /><stop offset="1" stopColor={C.sparkHalo} stopOpacity={0} /></radialGradient>
      <linearGradient id="wn-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={C.lamp} stopOpacity={0.55} /><stop offset="1" stopColor={C.lamp} stopOpacity={0} /></linearGradient>
      <linearGradient id="wn-dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.mist} /><stop offset="0.55" stopColor={C.fog} /><stop offset="1" stopColor={C.lamp} /></linearGradient>
      <linearGradient id="wn-day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.mist} /><stop offset="1" stopColor={C.fog} /></linearGradient>
      <linearGradient id="wn-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.ink} /><stop offset="1" stopColor={C.deep} /></linearGradient>
      <linearGradient id="wn-rays" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.lamp} stopOpacity={0.6} /><stop offset="1" stopColor={C.lamp} stopOpacity={0} /></linearGradient>
    </defs>
  </svg>
);

/** Print context: misregistration on/off (fills offset +3,+2 from the ink line, in the drawing's own units). */
const PrintCtx = createContext({ on: true, far: false });
/** <Print> wraps any world drawing; `off` disables misregistration, `far` switches halftone to the far screen. */
export const Print: React.FC<{ off?: boolean; far?: boolean; children?: React.ReactNode }> = ({ off, far, children }) => (
  <PrintCtx.Provider value={{ on: !off, far: !!far }}>{children}</PrintCtx.Provider>
);
export type Shade = 'R' | 'L' | 'B' | 'T' | 'RB' | 'full' | 'none';
/**
 * <Ink d fill shade sw line/> — THE kit primitive: one shape = offset fill (+ halftone on its shadow side) + ink line.
 * shade: which side carries the halftone ('R' default for figures lit from the left), 'full', 'none'.
 * sw: line width (5 on figures at near scale, 3 on props). line=false for fill-only shapes.
 */
export const Ink: React.FC<{ d: string; fill?: string; shade?: Shade; sw?: number; line?: boolean; lc?: string; op?: number; dots?: 'near' | 'far' | 'cora' | 'light'; transform?: string }> =
  ({ d, fill = 'none', shade = 'none', sw = 5, line = true, lc = C.ink, op, dots, transform }) => {
    const p = useContext(PrintCtx);
    const pat = dots === 'cora' ? 'wn-htc' : dots === 'light' ? 'wn-htl' : (dots === 'far' || (p.far && dots !== 'near')) ? 'wn-htf' : (fill === C.deep || fill === C.ink ? 'wn-htl' : 'wn-ht');
    const off = p.on ? 'translate(3,2)' : undefined;
    return (
      <g opacity={op} transform={transform}>
        {fill !== 'none' && (
          <g transform={off}>
            <path d={d} fill={fill} />
            {shade !== 'none' && <path d={d} fill={`url(#${pat})`} mask={shade === 'full' ? undefined : `url(#wn-sh${shade})`} />}
          </g>
        )}
        {line && sw > 0 && <path d={d} fill="none" stroke={lc} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />}
      </g>
    );
  };
/** Halftone patch: a shape filled only with dots (shadow masses, cheeks). */
export const Halftone: React.FC<{ d: string; dots?: 'near' | 'far' | 'cora' | 'light'; side?: Shade; op?: number }> = ({ d, dots = 'near', side = 'full', op }) => {
  const pat = { near: 'wn-ht', far: 'wn-htf', cora: 'wn-htc', light: 'wn-htl' }[dots];
  return <path d={d} fill={`url(#${pat})`} opacity={op} mask={side === 'full' || side === 'none' ? undefined : `url(#wn-sh${side})`} />;
};
/** Stacked-stroke glow (core white 2, spark 6, halo 16 @40 %) along a path. Never blur. */
export const Glow: React.FC<{ d: string; k?: number; op?: number; color?: string }> = ({ d, k = 1, op = 1, color = C.spark }) => (
  <g opacity={op} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={C.sparkHalo} strokeOpacity={0.4} strokeWidth={16 * k} />
    <path d={d} stroke={color} strokeWidth={6 * k} />
    <path d={d} stroke={C.sparkCore} strokeWidth={2 * k} />
  </g>
);

/**
 * <FogBand fr y speed? width? height? op? seed?> — one drifting fog band (SVG, radial-gradient puffs, no blur, no image).
 * Use two per exterior at different speeds (they count as two movers). Returns <g> in world/frame coords.
 */
export const FogBand: React.FC<{ fr: number; y: number; speed?: number; height?: number; op?: number; seed?: number; tone?: string }> =
  ({ fr, y, speed = 0.6, height = 220, op = 0.7, seed = 1 }) => {
    const span = 1800; const shift = ((fr * speed) % span + span) % span;
    const puffs = Array.from({ length: 9 }, (_, i) => ({ x: (i / 9) * span + ((seed * 97 + i * 53) % 120), ry: height * (0.35 + ((seed * 31 + i * 17) % 40) / 100), rx: 260 + ((seed * 13 + i * 71) % 160), dy: (((seed * 7 + i * 29) % 60) - 30) }));
    return (
      <g opacity={op}>
        {[0, 1].map((rep) => puffs.map((p, i) => (
          <ellipse key={`${rep}-${i}`} cx={p.x + rep * span - shift - 360} cy={y + p.dy + osc(fr, 240 + i * 20, i / 9) * 8} rx={p.rx} ry={p.ry} fill="url(#wn-fog)" />
        )))}
      </g>
    );
  };

/**
 * <Grade fr grain? vignette? bg?> — the top layer for every film: mounts KitDefs, background (fog by default),
 * your children, then grain (3 pre-baked 540×960 PNGs cycled every 2 frames, 6 % multiply) and a deep radial
 * vignette at 25 %. `night` darkens the background to deep.
 */
export const Grade: React.FC<{ fr: number; children?: React.ReactNode; grain?: boolean; vignette?: number; bg?: string }> =
  ({ fr, children, grain = true, vignette = 0.25, bg = C.fog }) => {
    const tile = Math.floor(fr / 2) % 3;
    return (
      <AbsoluteFill style={{ backgroundColor: bg, overflow: 'hidden' }}>
        <KitDefs />
        <AbsoluteFill>{children}</AbsoluteFill>
        {grain && (
          <AbsoluteFill style={{ mixBlendMode: 'multiply', opacity: 0.06 }}>
            <Img src={staticFile(`kit/grain${tile}.png`)} style={{ width: '100%', height: '100%' }} />
          </AbsoluteFill>
        )}
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 48%, rgba(38,65,79,0) 50%, rgba(38,65,79,${vignette}) 100%)` }} />
      </AbsoluteFill>
    );
  };
/** Full-frame SVG layer in frame coordinates (1080×1920). */
export const Layer: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style }}>{children}</svg>
);
