// Prints the film's timing (cuts, the flick, the launch, flag hits, the impact) as JSON for mix.py, from the same
// timeline.ts that draws the picture.
import * as TL from '../src/timeline.ts';
console.log(JSON.stringify({dur: TL.DUR_S, T: TL.T, cuts: TL.CUT, flick: TL.FLICK, launch: TL.LAUNCH, flagHit: TL.FLAG_HIT, hit: TL.HIT}));
