// Render a contact sheet of stills (one bundle, many frames): node stills.mjs 0.5,4,8 [scale]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const times = process.argv[2].split(',').map(Number), scale = Number(process.argv[3] || 0.4);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {audio: false, ...JSON.parse(process.argv[4] || '{}')};
const comp = await selectComposition({serveUrl, id: 'Film', inputProps, chromiumOptions: {gl: 'swangle'}});
let T0 = Date.now();
for (const t of times) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(t * comp.fps));
  await renderStill({composition: comp, serveUrl, frame, output: `${process.env.OUT || '../stills'}/s_${String(t).padStart(5, '0')}.png`, scale, inputProps, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000});
  console.log('t', t, ((Date.now() - T0) / 1000).toFixed(1)); T0 = Date.now();
}
