// Series sound palette (film-kit/sound/*.wav, built by sound/synth.py; mixed by sound/series_sfx.py).
// Parts list their cues as SeriesCue[] (write them to sound/cues.json) and call series_sfx.build_sfx.
import { titleCardTimes } from './cards';
import { hookCountTimes } from './props';
export const SERIES_SOUNDS = ['sting-smile', 'hook-clink', 'hook-hum', 'cloth-swish', 'glint', 'amber-shimmer', 'question-plink',
  'question-plink-up', 'gauge-ratchet', 'gauge-boing', 'stamp', 'typewriter', 'paper-flap', 'calendar-tear'] as const;
export type SeriesSound = (typeof SERIES_SOUNDS)[number];
export type SeriesCue = { sound: SeriesSound; fr: number; gain_db?: number; pan?: number; what?: string };
/** The title card's cues: sting at the drop + one typewriter clack per typed letter. */
export const titleCardCues = (at: number, part: 1 | 2 | 3): SeriesCue[] => {
  const T = titleCardTimes(at, part);
  return [{ sound: 'sting-smile', fr: at, what: 'title sting' }, ...T.clacks.map((c) => ({ sound: 'typewriter' as const, fr: c.fr, what: 'title type' }))];
};
/** Four hook clinks for a count (P1 line 7, P3 line 12): same order, same timing every time. */
export const hookCountCues = (countAt: number, gap = 9): SeriesCue[] =>
  hookCountTimes(countAt, gap).map((fr, i) => ({ sound: 'hook-clink', fr, pan: -0.3 + i * 0.2, what: `hook ${i + 1}` }));
export const endCardCues = (at: number): SeriesCue[] => [{ sound: 'stamp', fr: at, what: 'end card pin' }];
