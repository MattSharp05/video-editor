// Captions from the voiceover itself: hand-written sense units, checked word for word against words.json,
// each word lighting as it is spoken; the [bracketed] word carries the line (orange, heavier, lifted, glowing:
// the same look as "found" in the visual language). Sits inside the Reels safe area (y 250-470).
import React from 'react';
import {interpolate} from 'remotion';
import words from './words.json';
import {SANS} from './kit/fonts';
import {ACCENT, clamp} from './kit/space';

type Wd = {w: string; s: number; e: number};
const W = words as Wd[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
const LINES = [
  "You've saved [40] TikToks for this trip", 'and on the trip', "you'll open [none] of them.",
  "So I'm building an app", 'that turns them into an actual [plan.]',
  'Copy a TikTok link, open Trip', 'and it asks, [add this TikTok.]',
  'It reads the [caption]', 'and pulls out the place it names.',
  'Tap [Smart Add]', 'and it picks the day and time that fits', 'with the [least extra travel.]',
  'Or plan your whole list out.', '[At once.]',
  'Your saves finally coming', 'on the trip with [you.]', 'Would you [use] this?',
];
// Split each line into tokens matched to words; the bracketed span is the key phrase.
const CHUNKS = (() => {
  let i = 0;
  return LINES.map((line) => {
    const toks = line.replace(/[[\]]/g, '').split(' ');
    const m = line.match(/\[(.+?)\]/); const keyWords = m ? m[1].split(' ').map(norm) : [];
    const ws = W.slice(i, i + toks.length);
    toks.forEach((t, j) => { if (norm(t) !== norm(ws[j].w)) throw new Error(`caption mismatch: "${t}" vs "${ws[j].w}" in "${line}"`); });
    i += toks.length;
    const keyStart = m ? toks.findIndex((t, j) => keyWords.every((k, q) => norm(toks[j + q] || '') === k)) : -1;
    return {toks, ws, keyStart, keyLen: keyWords.length};
  });
})();

export const VoCaptions: React.FC<{fr: number; fps?: number}> = ({fr, fps = 60}) => {
  const t = fr / fps;
  const idx = CHUNKS.findIndex((c, n) => t >= c.ws[0].s - 0.12 && (n === CHUNKS.length - 1 || t < CHUNKS[n + 1].ws[0].s - 0.12));
  if (idx < 0) return null;
  const c = CHUNKS[idx];
  const next = CHUNKS[idx + 1];
  const outAt = next ? next.ws[0].s - 0.12 : 999;
  const lineIn = interpolate(t, [c.ws[0].s - 0.12, c.ws[0].s], [0, 1], clamp);
  const lineOut = interpolate(t, [outAt - 0.1, outAt], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 250, left: 70, right: 70, height: 220, display: 'flex', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', fontFamily: SANS, fontSize: 68, fontWeight: 800, letterSpacing: -1,
      lineHeight: 1.1, color: '#fff', opacity: Math.min(lineIn, lineOut), textShadow: '0 2px 18px rgba(0,0,0,0.55)'}}>
      <span>
        {c.toks.map((tok, j) => {
          const w = c.ws[j];
          const lit = interpolate(t, [w.s - 0.04, w.s + 0.08], [0.3, 1], clamp);
          const isKey = c.keyStart >= 0 && j >= c.keyStart && j < c.keyStart + c.keyLen;
          const k = isKey ? interpolate(t, [w.s, w.s + 0.2], [0, 1], clamp) : 0;
          return (
            <span key={j} style={{display: 'inline-block', margin: '0 9px', opacity: lit, color: isKey && k > 0 ? ACCENT : '#fff',
              fontWeight: isKey ? 900 : 800, transform: isKey ? `translateY(${-6 * k}px) scale(${1 + 0.06 * k})` : undefined,
              textShadow: isKey ? `0 0 ${24 * k}px rgba(255,107,34,${0.55 * k}), 0 2px 18px rgba(0,0,0,0.55)` : undefined}}>{tok}</span>
          );
        })}
      </span>
    </div>
  );
};
