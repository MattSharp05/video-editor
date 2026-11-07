// Captions: hand-written sense units checked word for word against words.json (chunkLines throws on a mismatch).
// Look (pick §1.5): ink text on a torn card strip with the paper shadow, seeded tilt, a 4-frame drop, an ink underline
// sliding under the active word; "Mona Lisa" always amber with an ink outline. Position: top safe area (BUILD-BRIEF).
import words from '../words.json';
import {chunkLines} from '../kit/captions';

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

// chunks for the kit's <Captions> (series look, strip at y 1480)
export const CHUNKS = chunkLines(words, LINES).map((c, n, all) => {
  const next = all[n + 1];
  const last = c.ws[c.ws.length - 1];
  return {s: c.ws[0].s - 0.08, e: next ? next.ws[0].s - 0.08 : last.e + 0.9, words: c.ws.map((w, j) => ({w: c.toks[j], s: w.s, e: w.e}))};
});
