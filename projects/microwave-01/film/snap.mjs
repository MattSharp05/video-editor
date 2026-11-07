// Stills from one bundle: node snap.mjs DIR t1,t2,... [scale] [propsJSON]   (bundle kept in out/bundle until src changes: pass REBUNDLE=1)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path'; import fs from 'node:fs';
const [dir, ts, sc = '0.5', props = '{}'] = process.argv.slice(2);
fs.mkdirSync(dir, {recursive: true});
let serveUrl = path.resolve('out/bundle');
if (process.env.REBUNDLE || !fs.existsSync(serveUrl)) serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir: serveUrl});
const inputProps = JSON.parse(props);
const comp = await selectComposition({serveUrl, id: 'Film', inputProps, chromiumOptions: {gl: 'swangle'}});
for (const t of ts.split(',').map(Number)) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(t * 30));
  await renderStill({composition: comp, serveUrl, frame, inputProps, output: `${dir}/f_${String(frame).padStart(4, '0')}.png`, scale: Number(sc), chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000});
}
console.log('done', comp.durationInFrames);
