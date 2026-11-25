// Print the film's beats and event times (from src/timeline.ts) as JSON for sound/mix.py.
import * as TL from '../src/timeline.ts';
const B = TL.B;
console.log(JSON.stringify({B, dur: TL.DUR_S,
  m1: B.moves + 0.35, m2: B.double + 0.45, fill: B.fits - 1.0, out: B.no + 0.35, newArrive: TL.NEW_ARRIVE(), numIn: TL.NUM_IN(),
  picks: [1, 2, 3, 4, 5, 6, 7, 8].map((k) => TL.pickAt(k) + TL.PICK_FLY), shuffles: TL.SHUFFLES.map((s) => s.t()),
  walkA: TL.WALK.a(), walkB: TL.WALK.b(), busArrive: [B.bus + 0.2, B.pulls + 1.1], busLeave: [B.no + 0.6, B.lastBus - 0.2],
  neq: [1, 2, 3, 4, 5, 6, 7, 8].map((k) => { for (let t = TL.WALK.a(); t < TL.WALK.b(); t += 1 / 60) if (TL.walkerZ(t) <= TL.doorZ(k)) return t; return TL.WALK.b(); }),
  bus2: [B.lastBus - 0.1, B.between + 0.6], bus2Leave: [B.build, B.first + 0.8]}));
