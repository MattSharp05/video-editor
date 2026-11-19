// Dump event times (seconds) and the loudness curve from timeline.ts for mix.py. usage: npx tsx sound/times.mts > sound/times.json
import * as TL from '../src/timeline.ts';
const env: number[] = [], envR: number[] = [], heat: number[] = [];
// the roar follows the picture: the main timeline until the split, then the right (boiling) panel after "quieter"
for (let i = 0; i <= Math.ceil(TL.DUR_S * 100); i++) {
  const t = i / 100;
  const split = t >= TL.CUT_S, right = t >= TL.B.quieter2 - 0.15;
  env.push(split ? (right ? TL.loudAt(t, 'R') : TL.loudAt(t, 'L')) : TL.loudAt(t));
  heat.push(split ? (right ? 1 : 0) : TL.heatAt(t));
}
const out = {...TL.B, dur: TL.DUR_S, cuts: TL.CUTS, cutX: TL.CUT_X, cutK2: TL.CUT_K2, cutG: TL.CUT_G, cutS: TL.CUT_S,
  jumpFwd: TL.JUMP_FWD, jumpBack: TL.JUMP_BACK, heroGone: TL.HERO.gone, heroDetach: TL.HERO.detach, env, heat};
console.log(JSON.stringify(out, (k, v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v)));
