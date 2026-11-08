import React from 'react';
import { C, FONT } from './tokens';
import { Layer } from './look';
import { clamp, ease } from './util';

/** One spoken word with frame timing. */
export type CapWord = { text: string; s: number; e: number };
export type CapChunk = { words: CapWord[]; s: number; e: number; lines: CapWord[][] };
// Hanken Grotesk 800 at 58 px: approximate advance per character (for line breaks and the Morse dash width).
const CW: Record<string, number> = { i: 16, l: 16, j: 16, t: 21, f: 20, r: 24, ' ': 15, '.': 15, ',': 15, "'": 13, '’': 13, ':': 16, '!': 18, '?': 30, m: 52, w: 46, M: 54, W: 60, I: 18 };
export const capWidth = (s: string) => s.split('').reduce((a, ch) => a + (CW[ch] ?? (/[A-Z]/.test(ch) ? 40 : /[0-9]/.test(ch) ? 35 : 33)), 0);
/**
 * chunksFromWords(words, fps=30, maxChars=30, maxLines=2) — words.json ([{w,s,e}] in seconds, the align output)
 * → caption chunks: ≤ 2 lines of ≤ 30 characters, broken at sentence ends. Frames in the result.
 */
export const chunksFromWords = (words: { w?: string; text?: string; word?: string; s?: number; e?: number; start?: number; end?: number }[], fps = 30, maxChars = 30, maxLines = 2): CapChunk[] => {
  const ws: CapWord[] = words.map((w) => ({ text: (w.w ?? w.text ?? w.word ?? '').trim(), s: Math.round((w.s ?? w.start ?? 0) * fps), e: Math.round((w.e ?? w.end ?? 0) * fps) })).filter((w) => w.text);
  const chunks: CapChunk[] = []; let lines: CapWord[][] = [[]];
  const flush = () => { const all = lines.flat(); if (all.length) chunks.push({ words: all, lines: lines.filter((l) => l.length), s: all[0].s, e: all[all.length - 1].e }); lines = [[]]; };
  ws.forEach((w, i) => {
    let cur = lines[lines.length - 1];
    const len = cur.map((x) => x.text).join(' ').length + (cur.length ? 1 : 0) + w.text.length;
    if (len > maxChars) { if (lines.length >= maxLines) { flush(); } else { lines.push([]); } cur = lines[lines.length - 1]; }
    cur.push(w);
    const prev = ws[i + 1];
    if (/[.!?]["”]?$/.test(w.text) || (prev && prev.s - w.e > fps * 0.6)) flush();
  });
  flush();
  // chunks stay up until the next one starts (or 12 f after their last word)
  chunks.forEach((c, i) => { c.e = i + 1 < chunks.length ? Math.min(chunks[i + 1].s, c.e + 24) : c.e + 12; });
  return chunks;
};
/**
 * <Captions fr chunks show?=true y?=1300> — Hanken 800 58 px captionText with a 7 px deep stroke, no box, centred,
 * ≤ 2 lines inside y 1300–1470. The spoken word gets the Morse dash: an 8 px spark bar its width, sliding word to
 * word (6-frame ease). Pass show={false} for the mute test.
 */
export const Captions: React.FC<{ fr: number; chunks: CapChunk[]; show?: boolean; y?: number }> = ({ fr, chunks, show = true, y = 1300 }) => {
  if (!show) return null;
  const c = chunks.find((k) => fr >= k.s && fr < k.e); if (!c) return null;
  const lineH = 74; const top = y + 58 + (c.lines.length === 1 ? 40 : 0);
  const placed: { w: CapWord; x: number; y: number; width: number }[] = [];
  c.lines.forEach((line, li) => {
    const widths = line.map((w) => capWidth(w.text)); const tot = widths.reduce((a, b) => a + b, 0) + (line.length - 1) * 15;
    let x = 540 - tot / 2;
    line.forEach((w, i) => { placed.push({ w, x, y: top + li * lineH, width: widths[i] }); x += widths[i] + 15; });
  });
  // active word index (last word that has started)
  let ai = -1; placed.forEach((p, i) => { if (fr >= p.w.s) ai = i; });
  const cur = placed[Math.max(0, ai)]; const prev = placed[Math.max(0, ai - 1)];
  const k = ai <= 0 ? 1 : ease(clamp((fr - cur.w.s) / 6));
  const dx = prev.x + (cur.x - prev.x) * k, dw = prev.width + (cur.width - prev.width) * k, dy = prev.y + (cur.y - prev.y) * k;
  return (
    <Layer>
      {ai >= 0 && <g>
        <rect x={dx} y={dy + 12} width={dw} height={8} rx={4} fill={C.deep} stroke={C.deep} strokeWidth={6} />
        <rect x={dx} y={dy + 12} width={dw} height={8} rx={4} fill={C.spark} />
      </g>}
      {placed.map((p, i) => (
        <text key={i} x={p.x} y={p.y} fontFamily={FONT.ui} fontWeight={800} fontSize={58} fill={C.captionText} stroke={C.deep} strokeWidth={7} strokeLinejoin="round" paintOrder="stroke" style={{ whiteSpace: 'pre' }}>{p.w.text}</text>
      ))}
    </Layer>
  );
};
/** textChunk(text, s, e) — a test chunk with evenly spaced word timings (frames). */
export const textChunk = (text: string, s: number, e: number): CapChunk[] => {
  const ws = text.split(' '); const d = (e - s) / ws.length;
  return chunksFromWords(ws.map((w, i) => ({ w, s: (s + i * d) / 30, e: (s + (i + 1) * d) / 30 })));
};
