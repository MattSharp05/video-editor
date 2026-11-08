// Stage boundaries and shared event times (seconds), from beats.json. Pure (no React): the picture (scenes.tsx) and the
// sound cue sheet (cues.ts) both import these, so a moved beat moves both.
import B from '../beats.json';
import {titlePlaqueTimes} from '../series/cards';
export const T1 = B.cora - 0.05, T2 = B.winter - 0.1, T3 = B.else + 0.3, T4 = B.police - 0.1, T5 = B.showed - 0.1;
export const T6 = B.insleft - 0.1, T7 = B.searched - 0.1, T8 = B.vanished2 + 0.2;
export const TITLE_AT = 72;                                   // kit plaque: taps from frame 72 (2.4 s), settled by 4.0 s
export const TAPS = titlePlaqueTimes(TITLE_AT).taps.map((x) => ({s: x.fr / 30, d: x.dur / 30}));
export const LAND = B.mustache - 0.27;                        // the Moustache drops onto his lip (kit 'land', click at +8 f)
export const ENDCARD_AT = T8 + 0.15;
