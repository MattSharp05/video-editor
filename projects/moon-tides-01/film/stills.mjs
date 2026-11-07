// Render a contact sheet of stills (one bundle, many frames): node stills.mjs 0.5,4,8 [scale]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const times = process.argv[2].split(',').map(Number), scale = Number(process.argv[3] || 0.4);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'Film', chromiumOptions: {gl: 'swangle'}});
for (const t of times) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(t * comp.fps));
  await renderStill({composition: comp, serveUrl, frame, output: `../stills/s_${String(t).padStart(5, '0')}.png`, scale, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000});
  console.log('t', t);
}
