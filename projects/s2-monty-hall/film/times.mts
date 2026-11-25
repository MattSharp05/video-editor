// Sound events straight from the timeline (seconds), for sound/mix.py:
//   npx esbuild times.mts --bundle --platform=node --format=esm --log-level=error | node --input-type=module > sound/events.json
import * as TL from './src/timeline';
const r = (v: number) => +v.toFixed(3);
console.log(JSON.stringify({
  dur: r(TL.DUR_S), cut: r(TL.CUT_BACK), B: Object.fromEntries(Object.entries(TL.B).map(([k, v]) => [k, r(v)])),
  black: TL.BLACK.map(r), opens: TL.ORDER.map((_, k) => r(TL.openAt(k))), flight: TL.FLIGHT,
}, null, 1));
