// Contact sheet of animatic stills from one bundle: node stills.mjs 1,5,10 [scale]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const times = process.argv[2].split(',').map(Number), scale = Number(process.argv[3] || 0.3);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'Film', chromiumOptions: {gl: 'swangle'}});
for (const t of times) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(t * comp.fps));
  await renderStill({composition: comp, serveUrl, frame, output: `../stills/anim/a_${String(t).padStart(5, '0')}.png`, scale, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000});
  console.log('t', t);
}
