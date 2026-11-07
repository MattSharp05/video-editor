import React from 'react';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { C, FONT } from './tokens';
import { clamp, rnd } from './util';

/**
 * Caption look (pick §1.5): phrase captions (2–6 words, ≤2 lines), Hanken Grotesk 800 60 px, ink on a torn
 * card strip with the paper shadow, seeded tilt −1.5°…1.5°, 4-frame drop. Strip baseline y = 1480 (Reels safe),
 * width ≤ 860. Active word: 5 px ink underline. "Mona Lisa" always amber with an ink outline.
 * Chunk = { s, e, words: {w,s,e}[] } in seconds (the parts' lib.ts `chunk()` makes these).
 *   <Captions fr chunks={CHUNKS} show={captions} />     (show=false for the mute test)
 */
export type CapWord = { w: string; s: number; e: number };
export type CapChunk = { s: number; e: number; words: CapWord[] };
const FPS = 30;
const torn = (seed: string) => {
  const pts: string[] = []; const n = 22;
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${rnd(`${seed}t${i}`) * 9}px`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% calc(100% - ${rnd(`${seed}b${i}`) * 9}px)`);
  return `polygon(${pts.join(',')})`;
};
const isAmber = (ws: CapWord[], i: number) => {
  const n = (k: number) => (ws[k]?.w ?? '').toLowerCase().replace(/[^a-z]/g, '');
  return (n(i) === 'mona' && n(i + 1).startsWith('lisa')) || (n(i).startsWith('lisa') && n(i - 1) === 'mona');
};
export const CaptionStrip: React.FC<{ fr: number; chunk: CapChunk; index?: number; y?: number }> = ({ fr, chunk, index = 0, y = 1480 }) => {
  const t = fr / FPS;
  const at = Math.round(chunk.s * FPS);
  const drop = interpolate(fr, [at, at + 4], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out = interpolate(fr, [Math.round(chunk.e * FPS) - 3, Math.round(chunk.e * FPS)], [1, 0], clamp);
  const tilt = (rnd(`cap${index}${chunk.words[0]?.w}`) - 0.5) * 3;
  const seed = `cap${index}`;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 1920 - y - 22, display: 'flex', justifyContent: 'center', opacity: drop * out }}>
      <div style={{ position: 'relative', maxWidth: 860, transform: `translateY(${(1 - drop) * -26}px) rotate(${tilt}deg)` }}>
        <div style={{ position: 'absolute', inset: 0, transform: 'translate(8px, 10px)', background: C.shadow, clipPath: torn(seed) }} />
        <div style={{ position: 'relative', background: C.card, clipPath: torn(seed), padding: '16px 34px 22px', textAlign: 'center',
          fontFamily: FONT.caption, fontWeight: 800, fontSize: 60, lineHeight: 1.12, color: C.ink }}>
          {chunk.words.map((w, i) => {
            const active = t >= w.s && t < (chunk.words[i + 1]?.s ?? chunk.e);
            const u = active ? interpolate(fr, [w.s * FPS, w.s * FPS + 3], [0, 1], clamp) : 0;
            const amber = isAmber(chunk.words, i);
            return (
              <span key={i} style={{ position: 'relative', display: 'inline-block', marginRight: i < chunk.words.length - 1 ? '0.26em' : 0,
                color: amber ? C.amber : C.ink, WebkitTextStroke: amber ? `2.5px ${C.ink}` : undefined, paintOrder: 'stroke fill' }}>
                {w.w}
                <span style={{ position: 'absolute', left: 0, right: 0, bottom: -2, height: 5, background: C.ink, transform: `scaleX(${u})`, transformOrigin: 'left' }} />
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export const Captions: React.FC<{ fr: number; chunks: CapChunk[]; show?: boolean; y?: number }> = ({ fr, chunks, show = true, y }) => {
  if (!show) return null;
  const t = fr / FPS;
  const i = chunks.findIndex((c) => t >= c.s - 0.001 && t < c.e);
  if (i < 0) return null;
  return <AbsoluteFill style={{ pointerEvents: 'none' }}><CaptionStrip fr={fr} chunk={chunks[i]} index={i} y={y} /></AbsoluteFill>;
};
/** Build a quick chunk from plain text spread evenly over [s,e] seconds (sheets/tests; parts use real word times). */
export const textChunk = (text: string, s: number, e: number): CapChunk => {
  const ws = text.split(/\s+/); const d = (e - s) / ws.length;
  return { s, e, words: ws.map((w, i) => ({ w, s: s + i * d, e: s + (i + 1) * d })) };
};
