// Screen-space overlays for part 3 that the kit does not own: honesty tags and the "Last time…" strip are kit items
// (adopted at READY via K.tsx); this file only times them. Until READY, simple stand-ins render here.
import React from 'react';
import {interpolate} from 'remotion';
import {T, FONT} from './tok';
import {CL} from './util';
import type {Chunk} from '../lib';

const fade = (fr: number, at: number, out: number, d = 6) => interpolate(fr, [at, at + d, out - d, out], [0, 1, 1, 0], CL);
export const tag3 = (fr: number, at: number, text: string, dur = 75, x = 64, y = 1180) => {
  const o = fade(fr, at, at + dur);
  if (o <= 0) return null;
  return <div key={text + at} style={{position: 'absolute', left: x, top: y, opacity: o, background: T.newsprint, color: T.ink, fontFamily: FONT.ui, fontWeight: 600, fontSize: 28, padding: '6px 18px', borderRadius: 4}}>{text}</div>;
};
// captions in the series look (stand-in for the kit's Caption): Hanken 800 58 px, deep stroke, spark Morse dash
export const caps3 = (fr: number, chunks: Chunk[], show: boolean) => {
  if (!show) return null;
  const t = fr / 30;
  const c = chunks.find((k) => t >= k.s - 0.12 && t < k.e);
  if (!c) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1300, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center',
      fontFamily: FONT.ui, fontWeight: 800, fontSize: 58, lineHeight: 1.18, color: T.captionText, WebkitTextStroke: `7px ${T.deep}`, paintOrder: 'stroke fill'}}>
      {c.words.map((w, i) => {
        const on = t >= w.s && t < (c.words[i + 1]?.s ?? c.e);
        return <span key={i} style={{margin: '0 0.14em', position: 'relative'}}>{w.w}
          {on && <span style={{position: 'absolute', left: 0, right: 0, bottom: -6, height: 8, background: T.spark, borderRadius: 4}} />}</span>;
      })}
    </div>
  );
};
