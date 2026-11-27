// Prints the film's timing (beats, cuts, strikes) as JSON for mix.py, from the same timeline.ts that draws the picture.
import * as TL from '../src/timeline.ts';
const cuts = {why: TL.CUT_WHY, cloud: TL.CUT_CLOUD, leader: TL.CUT_LEADER, contact: TL.CUT_CONTACT, gap: TL.CUT_GAP, again: TL.CUT_AGAIN, year: TL.CUT_YEAR, end: TL.CUT_END};
const steps: number[] = []; for (let i = 1; i <= TL.LEADER_STEPS; i++) steps.push(TL.BEATS.reach + 0.2 + (i - 1) * 0.36);
console.log(JSON.stringify({dur: TL.DUR_S, beats: TL.BEATS, cuts, strikes: TL.STRIKES.map((s) => s.t), contact: TL.CONTACT_T, ret: TL.RETURN_T + 0.12, steps: steps.filter((s) => s < TL.CUT_CONTACT + 1)}));
