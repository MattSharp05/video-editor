// Voiceover captions: hand-written sense units, checked word for word against words.json at load (a mismatch
// throws with the line). The whole line is readable muted; each word brightens as it is spoken; [bracketed] words
// carry the line: accent colour, heavier, lifted, glowing (give them the film's "found" look). A dark scrim keeps
// them legible over any picture. Sits in the 9:16 Reels safe area (top 250 px, 220 px tall).
// From Trip clip 01 v2 (VoCaptions.tsx) and Grand Canyon 01 (Captions.tsx).
//
//   const LINES = ['This rock is almost [2] [billion] years old.', 'The canyon around it is only [5] [or] [6] [million.]'];
//   {captions && <Captions t={frame / fps} words={words} lines={LINES} accent="#FFC56E" font={SANS} />}
// Lines must cover the transcript in order (start at word 0); bracket each key word separately.
import React, {useMemo} from 'react';
import {interpolate} from 'remotion';

type Wd = {w: string; s: number; e: number};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const chunkLines = (words: Wd[], lines: string[]) => {
  let i = 0;
  return lines.map((line) => {
    const raw = line.split(' ');
    const key = raw.map((t) => /^\[.*\]$/.test(t));
    const toks = raw.map((t) => t.replace(/[[\]]/g, ''));
    const ws = words.slice(i, i + toks.length);
    toks.forEach((t, j) => {
      if (!ws[j] || norm(t) !== norm(ws[j].w)) throw new Error(`caption mismatch: "${t}" vs "${ws[j]?.w}" in "${line}"`);
    });
    i += toks.length;
    return {toks, ws, key};
  });
};

export const Captions: React.FC<{
  t: number; words: Wd[]; lines: string[]; accent: string; font: string;
  top?: number; size?: number; scrim?: string; scrimAlpha?: number; // scrim: 'r,g,b' of the top gradient (warm films: '12,8,6')
}> = ({t, words, lines, accent, font, top = 250, size = 66, scrim = '0,0,0', scrimAlpha = 0.65}) => {
  const chunks = useMemo(() => chunkLines(words, lines), [words, lines]);
  const idx0 = chunks.findIndex((c, n) => t >= c.ws[0].s - 0.12 && (n === chunks.length - 1 || t < chunks[n + 1].ws[0].s - 0.12));
  // frame 0 is the cover: the first line is already up before its first word
  const idx = t < chunks[0].ws[0].s ? 0 : idx0;
  if (idx < 0) return null;
  const c = chunks[idx], next = chunks[idx + 1];
  const outAt = next ? next.ws[0].s - 0.12 : c.ws[c.ws.length - 1].e + 0.9;
  const o = Math.min(idx === 0 ? 1 : interpolate(t, [c.ws[0].s - 0.12, c.ws[0].s], [0, 1], clamp), interpolate(t, [outAt - 0.1, outAt], [1, 0], clamp));
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: top + 310,
        background: `linear-gradient(rgba(${scrim},${scrimAlpha}), rgba(${scrim},${scrimAlpha * 0.62}) 70%, rgba(${scrim},0))`}} />
      <div style={{position: 'absolute', top, left: 70, right: 70, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', fontFamily: font, fontSize: size, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, color: '#fff', opacity: o,
        textShadow: '0 2px 18px rgba(0,0,0,0.55)'}}>
        <span>{c.toks.map((tok, j) => {
          const w = c.ws[j];
          const lit = interpolate(t, [w.s - 0.04, w.s + 0.08], [0.6, 1], clamp);
          const k = c.key[j] ? interpolate(t, [w.s, w.s + 0.2], [0, 1], clamp) : 0;
          return <span key={j} style={{display: 'inline-block', margin: '0 9px', opacity: lit, color: k > 0 ? accent : '#fff',
            fontWeight: c.key[j] ? 900 : 800, transform: c.key[j] ? `translateY(${-6 * k}px) scale(${1 + 0.06 * k})` : undefined,
            textShadow: c.key[j] ? `0 0 ${22 * k}px ${rgba(accent, 0.5 * k)}, 0 2px 18px rgba(0,0,0,0.55)` : undefined}}>{tok}</span>;
        })}</span>
      </div>
    </>
  );
};
