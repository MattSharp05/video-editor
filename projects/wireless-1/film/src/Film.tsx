// Caught by Wireless · Part 1: The missing singer. One continuous camera through nine stages, handed off by
// push-throughs (p1/thru.tsx). Times: beats.json (from the VO). Overlays: corner tab, title plaque, honesty tag,
// end card, captions, grade (kit look through the adapter).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import B from './beats.json';
import words from './words.json';
import {Stages, StageDef, Thru} from './p1/thru';
import {S1, S2, S3, S4, S5, S6, S7, S9, T1, T2, T3, T4, T5, T6, T7, T8, TAPS, s2Lens, s4Lens, s5Pocket, s6Door, s7Steam, s8Oval} from './p1/scenes';
import {CornerTabA, TitleA, EndCardA, TagA} from './p1/cast';
import {ramp, win} from './p1/rig';
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

// temporary captions (replaced by the kit's Captions at adoption): sense units, Morse dash under the spoken word
type W = {w: string; s: number; e: number};
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
const CH = (() => {
  const ws = words as W[]; let i = 0;
  return LINES.map((l) => {
    const n = l.split(/\s+/).length, g = ws.slice(i, i + n);
    if (g.map((w) => norm(w.w)).join(' ') !== l.split(/\s+/).map(norm).join(' ')) throw new Error(`caption mismatch at "${l}"`);
    i += n; return {toks: l.split(/\s+/), ws: g};
  });
})();
const Caps: React.FC<{t: number}> = ({t}) => {
  const idx = CH.findIndex((c, n) => t >= c.ws[0].s - 0.1 && t < (CH[n + 1] ? CH[n + 1].ws[0].s - 0.1 : c.ws[c.ws.length - 1].e + 0.9));
  if (idx < 0) return null;
  const c = CH[idx];
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 1300, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center',
      fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 800, fontSize: 58, lineHeight: 1.15, color: '#F7F1E6', WebkitTextStroke: `7px ${K.deep}`, paintOrder: 'stroke fill'}}>
      {c.toks.map((tok, j) => {
        const w = c.ws[j], on = t >= w.s - 0.05 && t < (c.ws[j + 1]?.s ?? w.e + 0.4);
        return <span key={j} style={{position: 'relative', margin: '0 9px'}}>{tok}{on && <span style={{position: 'absolute', left: 0, right: 0, bottom: -6, height: 8, background: K.spark, borderRadius: 4}} />}</span>;
      })}
    </div>
  );
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const t = useCurrentFrame() / FPS;
  const burn = Math.min(1, Math.max(0, TAPS.filter((a) => t >= a).length / TAPS.length));
  const sub = ramp(t, B.partone, 0.25), lift = ramp(t, B.singer + 0.6, 0.7);
  const endK = ramp(t, T8 + 0.15, 0.4), type = Math.min(1, Math.max(0, (t - T8 - 0.5) / 0.9));
  return (
    <AbsoluteFill style={{background: K.deep}}>
      <Stages t={t} stages={STAGES} thru={THRU} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {lift < 1 && t > 2.2 && <TitleA burn={burn} sub={sub} lift={lift} />}
        <TagA text="Illustration" x={760} y={1200} o={win(t, B.typist, T4, 0.3)} />
        {endK > 0 && <EndCardA k={endK} type={type} />}
        <CornerTabA />
      </svg>
      {captions && <Caps t={t} />}
    </AbsoluteFill>
  );
};
