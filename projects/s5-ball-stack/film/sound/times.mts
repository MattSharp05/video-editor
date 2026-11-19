// Dump the film's event times (seconds) from timeline.ts for mix.py, so sound and picture share one source.
// usage: npx tsx sound/times.mts > sound/times.json
import * as TL from '../src/timeline.ts';
const cross = (y: number) => TL.crossT(y);
// the contact (sim S_HIT) in shot A and in the replay (shot B), the real ball's landing in shot D
const findT = (f: (t: number) => number, target: number, a: number, b: number) => { for (let t = a; t < b; t += 1 / 240) if (f(t) >= target) return t; return -1; };
const landD = (() => { let prev = 9; for (let t = TL.B.tryIt - 0.2; t < TL.DUR_S; t += 1 / 240) { const s = TL.simD(t); const y = TL.balls(s).tY; if (y <= TL.RT + 0.002 && prev > TL.RT + 0.002) return t; prev = y; } return -1; })();
const out = {
  ...TL.B, dur: TL.DUR_S, cuts: TL.CUTS, cutWhy: TL.CUT_WHY, cutPov: TL.CUT_POV, cutSide: TL.CUT_SIDE,
  dropT: TL.DROP_T, reveal: TL.REVEAL,
  hitA: findT(TL.simA, TL.S_HIT, TL.REVEAL, TL.CUT_WHY), launchA: findT(TL.simA, TL.S_LAUNCH, TL.REVEAL, TL.CUT_WHY),
  bar1: cross(TL.START_Y), bar2: cross(TL.LAUNCH_Y + 2 * TL.D),
  hitB: findT(TL.simB, TL.S_HIT, TL.CUT_WHY, TL.CUT_POV), hitC: findT(TL.simC, TL.S_HIT, TL.CUT_POV, TL.CUT_SIDE),
  ticks: TL.ticks(), riseD: TL.B.still2 - 0.5, landD,
  tiles: Array.from({length: 9}, (_, i) => TL.B.nine - 0.2 + i * 0.16 + 0.55),
  lost: [8, 7, 6, 5, 4].map((i) => TL.B.lose + (8 - i) * 0.22 + 0.25),
};
console.log(JSON.stringify(out, (k, v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v)));
