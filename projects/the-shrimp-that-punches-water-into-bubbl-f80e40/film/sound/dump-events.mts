// Prints the film's timing (beats, cuts, strikes, slowed-down hits) as JSON for mix.py, from the same timeline.ts that
// draws the picture.
import * as TL from '../src/timeline.ts';
console.log(JSON.stringify({dur: TL.DUR_S, beats: TL.BEATS, cuts: TL.CUTS, strikes: TL.STRIKES, contact: TL.CONTACT, rebound: TL.REBOUND_END,
  tear: TL.TEAR, collapseA: TL.COLLAPSE_A, collapseB: TL.COLLAPSE_B, hit2: TL.HIT2, cutGap: TL.CUT_GAP, cutEnd: TL.CUT_END}));
