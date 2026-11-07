import {STROKES, STEP_T} from './src/events';
console.log(JSON.stringify({strokes: STROKES.map((s) => s.t), steps: STEP_T}));
