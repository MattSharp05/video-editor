// Captions from the voiceover itself (hand-written sense units, checked word for word against words.json). Every
// word is readable muted and brightens as it is spoken; [bracketed] words carry the line: sunlit gold, heavier, lifted.
import React from 'react';
import {interpolate} from 'remotion';
import words from './words.json';
import {SANS} from './kit/fonts';

export const GOLD = '#FFC56E';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type Wd = {w: string; s: number; e: number};
const W = words as Wd[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
const LINES = [
  'This rock is almost [2] [billion] years old.', 'The canyon around it is only [5] [or] [6] [million.]',
  'So how does one river cut [a] [mile]', 'into solid rock that fast?', 'With [grit.]',
  'The Colorado River carries sand, gravel,', 'and even boulders,', 'and in floods they [scour] the riverbed', 'like sandpaper.',
  'But grit only cuts when the water is [fast,]', 'and fast water needs a [steep] [drop] to the sea.',
  'Long before the canyon,', 'the ground here was [pushed] [up]', 'thousands of feet into a high, flat plateau.',
  'So when the river found its way to the sea,', 'it had a steep drop,', 'and it cut [straight] [down.]',
  'As it cut, it opened up', 'a stack of [old] [worlds.]', '[Seabeds,] [swamps,] and a [desert] of sand dunes', 'frozen into a [cliff.]',
  '[Hard] layers stand as cliffs.', 'Soft ones [crumble] into slopes,', 'so the walls step down like a [staircase.]',
  'But the river [mostly] cuts down.', 'The width comes from [side] [canyons,]', '[flash] [floods] and rockfall after rockfall,',
  'pulling the walls up to [18] [miles] apart.', 'So the land [rose,]', 'the river [fell] fast,', 'its grit ground [a] [mile] down,',
  'and the side canyons pulled the walls [apart,]', "and it's not [finished.]", 'Floods still [cut,]', 'and the walls still [fall.]',
];
const CHUNKS = (() => {
  let i = 0;
  return LINES.map((line) => {
    const raw = line.split(' ');
    const key = raw.map((t) => /^\[.*\]$/.test(t));
    const toks = raw.map((t) => t.replace(/[[\]]/g, ''));
    const ws = W.slice(i, i + toks.length);
    toks.forEach((t, j) => { if (!ws[j] || norm(t) !== norm(ws[j].w)) throw new Error(`caption mismatch: "${t}" vs "${ws[j]?.w}" in "${line}"`); });
    i += toks.length;
    return {toks, ws, key};
  });
})();

export const Captions: React.FC<{t: number}> = ({t}) => {
  const idx = CHUNKS.findIndex((c, n) => t >= c.ws[0].s - 0.12 && (n === CHUNKS.length - 1 || t < CHUNKS[n + 1].ws[0].s - 0.12));
  if (idx < 0) return null;
  const c = CHUNKS[idx], next = CHUNKS[idx + 1];
  const outAt = next ? next.ws[0].s - 0.12 : c.ws[c.ws.length - 1].e + 0.9;
  const o = Math.min(interpolate(t, [c.ws[0].s - 0.12, c.ws[0].s], [0, 1], clamp), interpolate(t, [outAt - 0.1, outAt], [1, 0], clamp));
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 560, background: 'linear-gradient(rgba(12,8,6,0.72), rgba(12,8,6,0.45) 70%, rgba(12,8,6,0))'}} />
      <div style={{position: 'absolute', top: 250, left: 70, right: 70, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', fontFamily: SANS, fontSize: 66, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, color: '#fff', opacity: o,
        textShadow: '0 2px 18px rgba(0,0,0,0.55)'}}>
        <span>{c.toks.map((tok, j) => {
          const w = c.ws[j];
          const lit = interpolate(t, [w.s - 0.04, w.s + 0.08], [0.6, 1], clamp);
          const k = c.key[j] ? interpolate(t, [w.s, w.s + 0.2], [0, 1], clamp) : 0;
          return <span key={j} style={{display: 'inline-block', margin: '0 9px', opacity: lit, color: k > 0 ? GOLD : '#fff', fontWeight: c.key[j] ? 900 : 800,
            transform: c.key[j] ? `translateY(${-6 * k}px) scale(${1 + 0.06 * k})` : undefined,
            textShadow: c.key[j] ? `0 0 ${22 * k}px rgba(255,197,110,${0.5 * k}), 0 2px 18px rgba(0,0,0,0.55)` : undefined}}>{tok}</span>;
        })}</span>
      </div>
    </>
  );
};
