// Pure timing module (no React, no DOM): keystrokes and denoise steps, shared by the picture and by sound/mix.py
// (dumped with `npx esbuild dump-events.mts --bundle --platform=node --format=esm | node --input-type=module`).
import {random} from 'remotion';
import B from './beats.json';

export const N = 50;
export type Stroke = {t: number; key: string; text: string};
// keystrokes: type up to "pizz", hit "s" by mistake, backspace, "a"
export const STROKES: Stroke[] = (() => {
  const seq: string[] = [...'a dog surfing on a pizz', 's', '⌫', 'a'];
  const t0 = B.type - 0.12, t1 = B.send - 0.42;
  const w = seq.map((k, i) => (k === ' ' ? 1.25 : k === '⌫' ? 1.9 : 1) * (0.75 + 0.5 * random(`ks${i}`)));
  const sum = w.reduce((a, b) => a + b, 0);
  let t = t0, text = '';
  return seq.map((k, i) => {
    text = k === '⌫' ? text.slice(0, -1) : text + k;
    const s = {t, key: k, text}; t += (w[i] / sum) * (t1 - t0); return s;
  });
})();

// when each noise sheet lifts off: step 1 on "wipes"; accelerating to step 28 by the end of line 7; 29-50 in line 8
export const STEP_T: number[] = (() => {
  const s: number[] = [B.wipes, B.wipes + 0.95, B.wipes + 1.65];
  const end7 = B.clearer + 0.55;
  let dt = 0.5; while (s.length < 28) { dt = Math.max(0.1, dt * 0.84); s.push(s[s.length - 1] + dt); }
  const k = (end7 - s[2]) / (s[27] - s[2]); for (let i = 3; i < 28; i++) s[i] = s[2] + (s[i] - s[2]) * k;
  const a = B.steer - 0.1, b = B.pizza8 + 0.45;
  for (let i = 28; i < N; i++) s.push(a + ((i - 28 + 1) / (N - 28)) * (b - a));
  return s;
})();
