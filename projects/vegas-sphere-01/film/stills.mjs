// Stills from one bundle: node stills.mjs 0.5,4,8 [scale] [outdir]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const times = process.argv[2].split(',').map(Number), scale = Number(process.argv[3] || 0.5), dir = process.argv[4] || 'out/check';
fs.mkdirSync(dir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'Film', chromiumOptions: {gl: 'swangle'}});
for (const t of times) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(t * comp.fps));
  const t0 = Date.now();
  await renderStill({composition: comp, serveUrl, frame, output: `${dir}/s_${t.toFixed(2).padStart(6, '0')}.png`, scale, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000});
  console.log('t', t, Date.now() - t0, 'ms');
}
