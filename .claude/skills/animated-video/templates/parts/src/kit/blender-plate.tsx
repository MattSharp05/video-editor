// A Blender plate: a numbered PNG sequence (0000.png, 0001.png, ...) from templates/blender-shot, shown as one layer.
// File N is shot frame N, so the plate starts at film frame `from` (the shot's start beat) and shows file
// (frame - from). Outside the plate it draws nothing, or holds its first/last frame with `hold`.
// The PNGs already carry Blender's view transform (AgX/Filmic/Standard): composite them as they are, with no
// second curve, grade or bloom on top (styles/realistic-3d, "Handing Blender frames to Remotion"). RGBA plates
// (film_transparent) have straight alpha, which <Img> composites correctly over the layers beneath.
//
//   import beats from './beats.json';
//   <BlenderPlate dir="out/plates/box" from={f(beats.product)} frames={120} />            // full-frame plate
//   <BlenderPlate dir="out/plates/box" from={f(beats.product)} frames={120} hold="both" style={{opacity: o}} />
//
// `dir` is under the film's public/ (public/out/ is git-ignored: plates are renders, not source). Render the
// plate with: python3 shot.py --preset final --all --out <film>/public/out/plates/<shot>
// `frames` is the plate's length (shot.py prints it; out/<preset>/timing.json has frames_total). A missing
// file fails the render loudly rather than showing a gap. `rate` = plate fps / film fps (2 plays a 60 fps plate
// in a 30 fps film, using every other file); prefer rendering the plate at the film's fps. A speed change after
// rendering is a re-render at subframes, not a rate (realistic-3d).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';

export type BlenderPlateProps = {
  dir: string;
  from: number;
  frames: number;
  hold?: 'none' | 'start' | 'end' | 'both';
  rate?: number;
  fit?: 'cover' | 'contain' | 'fill';
  style?: React.CSSProperties;
};

export const plateFrame = (fr: number, from: number, frames: number, rate = 1, hold: BlenderPlateProps['hold'] = 'none') => {
  const n = Math.floor((fr - from) * rate + 1e-6);
  if (n < 0) return hold === 'start' || hold === 'both' ? 0 : null;
  if (n >= frames) return hold === 'end' || hold === 'both' ? frames - 1 : null;
  return n;
};

export const BlenderPlate: React.FC<BlenderPlateProps> = ({dir, from, frames, hold = 'none', rate = 1, fit = 'cover', style}) => {
  const n = plateFrame(useCurrentFrame(), from, frames, rate, hold);
  if (n === null) return null;
  const src = staticFile(`${dir.replace(/\/$/, '')}/${String(n).padStart(4, '0')}.png`);
  return (
    <AbsoluteFill style={style}>
      <Img src={src} style={{width: '100%', height: '100%', objectFit: fit}} />
    </AbsoluteFill>
  );
};
