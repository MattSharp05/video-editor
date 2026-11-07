import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import './fonts';
import { SeriesDefs } from './defs';
import { C } from './tokens';
import { rnd } from './util';

/**
 * <SeriesGrade fr grade wash> wraps the whole film (or each scene stack): the paper world's grade.
 *  - paper-fibre texture (multiply 22 %), grain (3 tiles, cycled on twos, overlay 7 %), vignette (ink 0→18 %),
 *    flicker (brightness ±1.5 %, seeded, on twos)
 *  - grade '1911' (default): warm sepia wash; 'modern': none (today's scenes)
 *  - wash 0..1: the sepia wash sweeping in left→right (modern → 1911 transition); undefined = fully applied
 *    for grade '1911'. Mounts <SeriesDefs/> and loads the fonts.
 */
export const SeriesGrade: React.FC<{ fr: number; grade?: '1911' | 'modern'; wash?: number; children?: React.ReactNode; grain?: boolean }> =
  ({ fr, grade = '1911', wash, children, grain = true }) => {
    const w = grade === 'modern' ? (wash ?? 0) : (wash ?? 1);
    const tile = Math.floor(fr / 2) % 3;
    const flick = (rnd(`flick-${Math.floor(fr / 2)}`) - 0.5) * 0.03; // ±1.5 %
    return (
      <AbsoluteFill style={{ backgroundColor: C.paper, overflow: 'hidden' }}>
        <SeriesDefs />
        <AbsoluteFill>{children}</AbsoluteFill>
        {w > 0 && (
          <AbsoluteFill style={{
            backgroundColor: '#E7CC98', mixBlendMode: 'multiply', opacity: 0.32,
            clipPath: w >= 1 ? undefined : `polygon(0 0, ${w * 120 - 10}% 0, ${w * 120 - 20}% 100%, 0 100%)`,
          }} />
        )}
        <AbsoluteFill style={{ mixBlendMode: 'multiply', opacity: 0.22 }}>
          <Img src={staticFile('kit/paper.jpg')} style={{ width: '100%', height: '100%' }} />
        </AbsoluteFill>
        {grain && (
          <AbsoluteFill style={{ mixBlendMode: 'overlay', opacity: 0.07 }}>
            <Img src={staticFile(`kit/grain${tile}.jpg`)} style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }} />
          </AbsoluteFill>
        )}
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(35,27,22,0) 55%, rgba(35,27,22,0.18) 100%)' }} />
        <AbsoluteFill style={{ backgroundColor: flick > 0 ? '#FFFFFF' : C.ink, opacity: Math.abs(flick) }} />
      </AbsoluteFill>
    );
  };
