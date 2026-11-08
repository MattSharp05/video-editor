// Caught by Wireless · Part 1: The missing singer. One continuous camera through nine stages, handed off by
// push-throughs (p1/thru.tsx). Times: beats.json (from the VO). Overlays: corner tab, title plaque, honesty tag,
// end card, captions, grade (kit look through the adapter).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import B from './beats.json';
import words from './words.json';
import {Stages, StageDef, Thru} from './p1/thru';
import {S1, S2, S3, S4, S5, S6, S7, S9, T1, T2, T3, T4, T5, T6, T7, T8, TAPS, s2Lens, s4Lens, s5Pocket, s6Door, s7Steam, s8Oval} from './p1/scenes';
import {Grade} from './series/look';
import {CornerTab, TitlePlaque, Subtitle, EndCard, HonestyTag} from './series/cards';
import {Captions, CapChunk, capWidth} from './series/captions';
import {LINES} from './p1/captions';
import {K} from './p1/tok';

export const FPS = 30;
export const DUR = Math.round(B.total * FPS);

const STAGES: StageDef[] = [
  {id: 'street', from: 0, C: S1}, {id: 'hall', from: T1, C: S2}, {id: 'house', from: T2, C: S3}, {id: 'ball', from: T3, C: S4},
  {id: 'yard', from: T4, C: S5}, {id: 'section', from: T5, C: S6}, {id: 'day', from: T6, C: S7}, {id: 'cellar', from: T7, C: S6}, {id: 'sea', from: T8, C: S9},
];
const at = (p: [number, number]) => ({x: p[0], y: p[1]});
const THRU: Thru[] = [
  {at: T1, d: 0.55, x: 540, y: 960, r0: 60}, {at: T2, d: 0.5, ...at(s2Lens())}, {at: T3, d: 0.5, x: 540, y: 960},
  {at: T4, d: 0.5, ...at(s4Lens())}, {at: T5, d: 0.5, ...at(s5Pocket())}, {at: T6, d: 0.5, ...at(s6Door())},
  {at: T7, d: 0.5, ...at(s7Steam())}, {at: T8, d: 0.5, ...at(s8Oval())},
];

// captions: hand-written sense units (p1/captions.ts), checked word for word against words.json, drawn by the kit's
// <Captions> (≤ 2 lines of ≤ 30 characters, Morse dash under the spoken word)
type W = {w: string; s: number; e: number};
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
const CHUNKS: CapChunk[] = (() => {
  const ws = words as W[]; let i = 0;
  const out = LINES.map((l) => {
    const toks = l.split(/\s+/), g = ws.slice(i, i + toks.length);
    if (g.map((w) => norm(w.w)).join(' ') !== toks.map(norm).join(' ')) throw new Error(`caption mismatch at "${l}"`);
    i += toks.length;
    const cw = g.map((w, j) => ({text: toks[j], s: Math.round(w.s * FPS), e: Math.round(w.e * FPS)}));
    const lines: (typeof cw)[] = [[]];
    cw.forEach((w) => { const cur = lines[lines.length - 1]; if (cur.length && cur.map((x) => x.text).join(' ').length + 1 + w.text.length > 30) lines.push([]); lines[lines.length - 1].push(w); });
    return {words: cw, lines, s: cw[0].s - 3, e: cw[cw.length - 1].e};
  });
  if (i !== ws.length) throw new Error(`captions cover ${i} of ${ws.length} words`);
  out.forEach((c, n) => { c.e = n + 1 < out.length ? out[n + 1].s : c.e + 27; });
  return out;
})();
void capWidth;

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(), t = fr / FPS;
  const f = (x: number) => Math.round(x * FPS);
  return (
    <Grade fr={fr} bg={K.deep}>
      <Stages t={t} stages={STAGES} thru={THRU} />
      <TitlePlaque fr={fr} at={72} outAt={f(B.singer + 0.7)} offset={[Math.sin(t * 0.37) * 7, Math.cos(t * 0.29) * 5]} />
      <Subtitle fr={fr} at={f(B.partone)} part={1} outAt={f(B.singer + 0.7)} />
      <HonestyTag fr={fr} at={f(B.typist)} text="Illustration" x={60} y={1170} dur={f(T4 - 0.3) - f(B.typist)} />
      <EndCard fr={fr} at={f(T8 + 0.15)} part={1} />
      <CornerTab fr={fr} part={1} />
      <Captions fr={fr} chunks={CHUNKS} show={captions} />
    </Grade>
  );
};
