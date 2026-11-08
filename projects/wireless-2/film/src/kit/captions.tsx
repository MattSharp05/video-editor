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

