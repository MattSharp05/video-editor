// Dump event times (seconds) from timeline.ts for mix.py. usage: npx tsx sound/times.mts > sound/times.json
import * as TL from '../src/timeline.ts';
const out = {...TL.B, dur: TL.DUR_S, cuts: TL.CUTS, cutFace: TL.CUT_FACE, cutMol: TL.CUT_MOL, cutBack: TL.CUT_BACK, cutOut: TL.CUT_OUT,
  waves: TL.waves(1e9).length === 0 ? Array.from({length: 12}, (_, i) => TL.B.micro - 0.1 + i * 0.22) : [],
  scans: [TL.B.watch + 0.1, TL.B.why + 0.1, TL.B.so - 0.25]};
console.log(JSON.stringify(out, (k, v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v)));
