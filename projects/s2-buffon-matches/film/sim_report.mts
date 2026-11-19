import {crossings, piEst, ROOM_N, N} from './src/sim.ts';
for (const n of [ROOM_N, 1000, 5000, N]) console.log(n, crossings(n), (100 * crossings(n) / n).toFixed(1) + '%', piEst(n).toFixed(4));
