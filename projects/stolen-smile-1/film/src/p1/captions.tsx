// Captions: hand-written sense units checked word for word against words.json (chunkLines throws on a mismatch).
// Look (pick §1.5): ink text on a torn card strip with the paper shadow, seeded tilt, a 4-frame drop, an ink underline
// sliding under the active word; "Mona Lisa" always amber with an ink outline. Position: top safe area (BUILD-BRIEF).
import React, {useMemo} from 'react';
import {interpolate, random} from 'remotion';
import words from '../words.json';
import {chunkLines} from '../kit/captions';
import {C} from './paper';

const SANS = "'Hanken Grotesk', sans-serif";
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const LINES = [
  'Lots of people think', 'the [Mona] [Lisa] was always', 'the most famous painting in the world.',
  'But actually, before 1911,', 'she was no superstar.', 'Mostly art lovers knew her.', 'Then someone stole her.',
  'This is The Stolen Smile.', 'Part one: the vanishing.',
  'Paris, 1911.', 'The Louvre is a giant museum,', "and on Mondays it's closed.",
  'One Monday morning,', 'a small man in a white work smock', 'walks through the quiet halls.',
  'His name is Vincenzo.', 'He knows this place.', 'He helped make the glass box', 'that protects the [Mona] [Lisa.]',
  'He walks into her room.', 'She hangs on the wall', 'on four iron hooks.',
  'He lifts her off.', 'Nobody stops him.',
  'He carries her to a back staircase.', 'There, he takes off', 'her heavy frame and glass,', 'and leaves them behind.',
  "Now she's just a painting", 'on a thin wooden board.', 'He wraps her up', 'in his white work clothes.',
  'But the door at the bottom', 'of the stairs is locked.',
  'Then a plumber walks by.', 'He thinks Vincenzo is a worker,', 'so he opens the door for him!',
  'Vincenzo walks out', 'into the streets of Paris,', 'carrying the [Mona] [Lisa.]',
  'The next day,', 'a painter comes to paint her.', 'He finds only four empty hooks.',
  'At first, the guards think', 'the photographers took her', "for pictures. They didn't.",
  'The [Mona] [Lisa] is gone.', 'And no one knows who took her.',
];

export const Captions: React.FC<{t: number}> = ({t}) => {
  const chunks = useMemo(() => chunkLines(words, LINES), []);
  const idx = chunks.findIndex((c, n) => t >= c.ws[0].s - 0.12 && (n === chunks.length - 1 || t < chunks[n + 1].ws[0].s - 0.12));
  if (idx < 0) return null;
  const c = chunks[idx], next = chunks[idx + 1];
  const outAt = next ? next.ws[0].s - 0.12 : c.ws[c.ws.length - 1].e + 0.9;
  if (t > outAt) return null;
  const inK = interpolate(t, [c.ws[0].s - 0.12, c.ws[0].s + 0.01], [0, 1], clamp);
  const tilt = (random(`cap${idx}`) - 0.5) * 3;
  const active = c.ws.findIndex((w, j) => t >= w.s - 0.03 && (j === c.ws.length - 1 || t < c.ws[j + 1].s - 0.03));
  return (
    <div style={{position: 'absolute', top: 320, left: 60, right: 60, display: 'flex', justifyContent: 'center', opacity: inK,
      transform: `translateY(${(1 - inK) * -22}px) rotate(${tilt}deg)`}}>
      <div style={{position: 'relative', maxWidth: 900, padding: '18px 34px 22px', background: C.card, textAlign: 'center',
        clipPath: 'polygon(0% 6%, 3% 0%, 22% 4%, 41% 0%, 63% 5%, 82% 1%, 100% 4%, 99% 52%, 100% 96%, 78% 100%, 55% 95%, 33% 100%, 12% 96%, 0% 100%, 1% 48%)',
        filter: 'drop-shadow(8px 10px 0 rgba(35,27,22,0.28))', fontFamily: SANS, fontWeight: 800, fontSize: 60, lineHeight: 1.12, color: C.ink}}>
        {c.toks.map((tok, j) => {
          const ml = c.key[j];
          return <span key={j} style={{display: 'inline-block', margin: '0 8px', position: 'relative',
            color: ml ? C.amber : C.ink, WebkitTextStroke: ml ? `2px ${C.ink}` : undefined, fontWeight: ml ? 900 : 800}}>
            {tok}
            {j === active && <span style={{position: 'absolute', left: 0, right: 0, bottom: -4, height: 5, background: C.ink, borderRadius: 3}} />}
          </span>;
        })}
      </div>
    </div>
  );
};
