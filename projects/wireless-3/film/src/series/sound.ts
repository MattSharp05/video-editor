// Series sound palette (film-kit/sound/*.wav) and cue helpers. Mix with sound/series_sfx.py at the series gains.
import { endCardTimes, titlePlaqueTimes } from './cards';
import { morseTimes } from './spark';
export const SERIES_SOUNDS = ['sting', 'spark-crackle', 'morse-beep', 'wing-flutter', 'moustache-click', 'feather-chime', 'paper-flip', 'headline-thunk',
  'newspaper-rustle', 'ship-horn-bed', 'ticker', 'clue-ring', 'hunch-click', 'stamp', 'type-tick'] as const;
export type SeriesSound = (typeof SERIES_SOUNDS)[number];
export type SeriesCue = { sound: SeriesSound; fr: number; gain_db?: number; pan?: number; dur_fr?: number; what?: string };
/** Title: sting as the plate rises + one Morse beep per tap (C-B-W) + a crackle under the taps. */
export const titleCues = (at = 72): SeriesCue[] => {
  const T = titlePlaqueTimes(at);
  return [{ sound: 'sting', fr: T.sting, what: 'title sting' }, { sound: 'spark-crackle', fr: at - 2, what: 'spark' },
    ...T.taps.map((t) => ({ sound: 'morse-beep' as const, fr: t.fr, dur_fr: t.dur, what: `tap ${t.kind}` }))];
};
/** One beep per Morse tap (pass the same args as MorseTap/morseTimes). */
export const morseCues = (code: string, at: number): SeriesCue[] => morseTimes(code, at).map((t) => ({ sound: 'morse-beep', fr: t.fr, dur_fr: t.dur, what: `morse ${t.kind}` }));
/** End card: paper slide + one type tick per letter. */
export const endCardCues = (at: number, text: string): SeriesCue[] => [{ sound: 'paper-flip', fr: at, what: 'end card' }, ...endCardTimes(at, text).letterFrames.map((fr) => ({ sound: 'type-tick' as const, fr, what: 'type' }))];
/** Moustache: flutter when it flies, click when it lands (moustacheLandFrame). */
export const moustacheCues = (flyAt: number | null, landFrame: number | null): SeriesCue[] => [
  ...(flyAt != null ? [{ sound: 'wing-flutter' as const, fr: flyAt, what: 'moustache flies' }] : []),
  ...(landFrame != null ? [{ sound: 'moustache-click' as const, fr: landFrame, what: 'moustache lands' }] : [])];
/** Daily Wire: paper flip + headline thunk at the headline flip. */
export const headlineCues = (flipAt: number): SeriesCue[] => [{ sound: 'paper-flip', fr: flipAt - 4 }, { sound: 'headline-thunk', fr: flipAt + 10 }];
