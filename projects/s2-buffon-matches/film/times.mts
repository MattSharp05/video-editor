// Exports the timeline's numbers for the mixer and for choosing stills: npx esbuild times.mts --bundle --platform=node --format=esm | node --input-type=module
import * as TL from './src/timeline.ts';
import {crossings, ROOM_N} from './src/sim.ts';
const r = (x: number) => Math.round(x * 1000) / 1000;
console.log(JSON.stringify({
  dur: r(TL.DUR_S), cut: r(TL.CUT_HALL), B: Object.fromEntries(Object.entries(TL.B).map(([k, v]) => [k, r(v)])),
  landRoom: Array.from({length: ROOM_N}, (_, i) => r(TL.landRoom(i))), measure: r(TL.measureLand()), demo: [r(TL.demoLand(0)), r(TL.demoLand(1))],
  raft: Array.from({length: ROOM_N}, (_, i) => r(TL.raftStart(i))), hoopDrops: [0, 1, 2, 3].map((k) => r(TL.hoopDropAt(k))),
  throws: [0, 1, 2].map((k) => r(TL.throwAt(k))), throwCounts: TL.THROW_COUNT, avg1000: TL.AVG_1000, roomCross: crossings(ROOM_N),
}, null, 1));
