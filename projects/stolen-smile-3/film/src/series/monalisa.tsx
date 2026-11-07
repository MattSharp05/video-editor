import React from 'react';
import { staticFile } from 'remotion';
import { C, MONA_H } from './tokens';
import { wrect } from './util';

/**
 * The Mona Lisa: the public-domain photograph (public/monalisa.jpg, Wikimedia Commons, see README). NEVER redrawn,
 * warped, or covered on the face. Image aspect 1280×1908. World-space <g>, centred on (x, y).
 *   height  px (true scale next to Vincenzo: 270)
 *   glow    0..1 amber halo (the "smile meter")
 *   glintAt frame of a glint (8 frames) on her eye; glints = several frames
 *   frame   oldGold frame on; glass = glass box layer; board 'front' | 'back' (wood + seal) | 'edge' (6 px sepia sliver)
 *   turn    0..1 rotate toward edge-on (0 front, 1 edge): a squash in x with the board edge showing
 *   crop    'full' | 'eyes' (top band: eyes peeking over a cloth) | 'smile' (Cheshire mouth crop)
 */
export const ML_W = 1280, ML_H = 1908;
// feature positions as fractions of the image (measured on the file)
export const ML_EYES = { x0: 0.30, x1: 0.64, y0: 0.185, y1: 0.262 };
export const ML_SMILE = { x0: 0.385, x1: 0.565, y0: 0.27, y1: 0.325 };
export const ML_GLINT: [number, number] = [0.515, 0.223]; // her left eye (viewer's right)

export const Glint: React.FC<{ fr: number; at: number; x: number; y: number; size?: number }> = ({ fr, at, x, y, size = 1 }) => {
  const t = fr - at; if (t < 0 || t > 8) return null;
  const s = Math.sin((t / 8) * Math.PI) * size;
  return (
    <g transform={`translate(${x} ${y}) rotate(${t * 6}) scale(${s})`}>
      <circle r={9} fill={C.amberGlow} opacity={0.5} />
      <path d="M0,-22 L3,-3 L22,0 L3,3 L0,22 L-3,3 L-22,0 L-3,-3Z" fill="#FFFDF2" />
    </g>
  );
};

export const MonaLisa: React.FC<{
  fr: number; x?: number; y?: number; height?: number; glow?: number; glintAt?: number | number[];
  frame?: boolean; glass?: boolean; board?: 'front' | 'back' | 'edge'; turn?: number; crop?: 'full' | 'eyes' | 'smile'; shadow?: boolean; id?: string;
}> = ({ fr, x = 540, y = 960, height = MONA_H, glow = 0.4, glintAt, frame = false, glass = false, board = 'front', turn = 0, crop = 'full', shadow = true, id = 'ml' }) => {
  const h = height, w = (h * ML_W) / ML_H;
  const glints = glintAt === undefined ? [] : Array.isArray(glintAt) ? glintAt : [glintAt];
  if (crop !== 'full') {
    const R = crop === 'eyes' ? ML_EYES : ML_SMILE;
    // `height` = the crop band's height on screen
    const bh = height, bw = (bh * (R.x1 - R.x0) * ML_W) / ((R.y1 - R.y0) * ML_H);
    const iw = bw / (R.x1 - R.x0), ih = (iw * ML_H) / ML_W;
    const cid = `${id}-crop-${crop}`;
    return (
      <g transform={`translate(${x} ${y})`}>
        {glow > 0 && <ellipse cx={0} cy={0} rx={bw * 0.9} ry={bh * 1.6} fill="url(#ss-amber-soft)" opacity={glow} />}
        <clipPath id={cid}><path d={crop === 'smile' ? `M${-bw / 2},0 C${-bw / 2},${-bh * 0.62} ${bw / 2},${-bh * 0.62} ${bw / 2},0 C${bw / 2},${bh * 0.62} ${-bw / 2},${bh * 0.62} ${-bw / 2},0Z` : wrect(-bw / 2, -bh / 2, bw, bh, cid, 0)} /></clipPath>
        <g clipPath={`url(#${cid})`}>
          <image href={staticFile('monalisa.jpg')} x={-bw / 2 - R.x0 * iw} y={-bh / 2 - R.y0 * ih} width={iw} height={ih} preserveAspectRatio="none" />
        </g>
        {glints.map((g) => crop === 'eyes' && <Glint key={g} fr={fr} at={g} x={-bw / 2 + (ML_GLINT[0] - R.x0) * iw} y={-bh / 2 + (ML_GLINT[1] - R.y0) * ih} size={bh / 60} />)}
      </g>
    );
  }
  const sx = Math.max(0.035, Math.cos((turn * Math.PI) / 2));
  const edge = Math.sin((turn * Math.PI) / 2) * 6 * (h / 270) * 1.0;
  const fw = frame ? w * 0.16 : 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      {glow > 0 && <ellipse cx={0} cy={0} rx={w * 1.25 + fw} ry={h * 0.95 + fw} fill="url(#ss-amber)" opacity={glow} />}
      <g filter={shadow ? 'url(#ss-shadow)' : undefined}>
        {/* board edge (6 px poplar, sepia) shows as it turns */}
        {edge > 0.2 && <path d={`M${(w / 2) * sx},${-h / 2} L${(w / 2) * sx + edge},${-h / 2 + 2} L${(w / 2) * sx + edge},${h / 2 - 2} L${(w / 2) * sx},${h / 2}Z`} fill={C.sepia} stroke={C.ink} strokeWidth={1.5} />}
        {frame && <path d={wrect(-w / 2 - fw, -h / 2 - fw, w + fw * 2, h + fw * 2, `${id}fr`, 1)} fill={C.oldGold} stroke={C.ink} strokeWidth={2.5} transform={`scale(${sx} 1)`} />}
        {frame && <rect x={-w / 2 - 4} y={-h / 2 - 4} width={w + 8} height={h + 8} fill={C.sepia} transform={`scale(${sx} 1)`} />}
        <g transform={`scale(${sx} 1)`}>
          {board === 'back'
            ? <g><rect x={-w / 2} y={-h / 2} width={w} height={h} fill={C.wood} stroke={C.ink} strokeWidth={2} />
                {[0.2, 0.45, 0.7].map((k) => <path key={k} d={`M${-w / 2 + 6},${-h / 2 + h * k} Q0,${-h / 2 + h * k + 6} ${w / 2 - 6},${-h / 2 + h * k - 4}`} stroke={C.sepia} strokeWidth={2} fill="none" />)}
                <circle cx={0} cy={h * 0.18} r={w * 0.13} fill={C.clueRed} stroke={C.ink} strokeWidth={2} />
                <circle cx={0} cy={h * 0.18} r={w * 0.08} fill="none" stroke={C.card} strokeWidth={1.5} opacity={0.7} /></g>
            : <image href={staticFile('monalisa.jpg')} x={-w / 2} y={-h / 2} width={w} height={h} preserveAspectRatio="none" />}
          <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={C.ink} strokeWidth={2} />
        </g>
      </g>
      {glass && <g>
        <rect x={-w / 2 - fw - 14} y={-h / 2 - fw - 14} width={w + fw * 2 + 28} height={h + fw * 2 + 28} fill={C.glass} fillOpacity={0.35} stroke={C.ink} strokeWidth={2} />
        <path d={`M${-w / 2 - fw},${-h / 2 + 30} L${-w / 2 - fw + 40},${-h / 2 - fw - 8} M${-w / 2 - fw + 18},${-h / 2 + 60} L${-w / 2 - fw + 70},${-h / 2 - fw - 6}`} stroke="#fff" strokeWidth={5} opacity={0.75} strokeLinecap="round" />
      </g>}
      {board !== 'back' && turn < 0.5 && glints.map((g) => <Glint key={g} fr={fr} at={g} x={(-w / 2 + ML_GLINT[0] * w) * sx} y={-h / 2 + ML_GLINT[1] * h} size={h / 270} />)}
    </g>
  );
};
