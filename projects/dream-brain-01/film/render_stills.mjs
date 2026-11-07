// Fallback full render: every frame as a still (one browser per worker, reused), then FFmpeg. Measured faster than
// `remotion render` for this film under software WebGL. usage: node render_stills.mjs <outdir> [workers=4] [from] [to]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import fs from 'fs'; import path from 'path';
const [out = 'out/frames', W = '4', from, to] = process.argv.slice(2);
const FRESH = process.env.FRESH !== '0';
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser0 = await openBrowser('chrome', {chromiumOptions: {gl: 'swangle'}});
const comp = await selectComposition({serveUrl, id: 'Film', puppeteerInstance: browser0});
const a = from ? +from : 0, b = to ? +to : comp.durationInFrames - 1;
const todo = []; for (let f = a; f <= b; f++) if (!fs.existsSync(`${out}/f${String(f).padStart(5, '0')}.png`)) todo.push(f);
console.log('frames to render', todo.length);
let done = 0; const t0 = Date.now();
const worker = async (k) => {
  const browser = k === 0 ? browser0 : await openBrowser('chrome', {chromiumOptions: {gl: 'swangle'}});
  while (todo.length) {
    const f = todo.shift();
    // a fresh browser per frame: a reused page measured ~5x slower per frame on this film (cause not found yet)
    const br = FRESH ? await openBrowser('chrome', {chromiumOptions: {gl: 'swangle'}}) : browser;
    await renderStill({composition: comp, serveUrl, frame: f, output: `${out}/f${String(f).padStart(5, '0')}.png`, puppeteerInstance: br, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000});
    if (FRESH) await br.close({silent: true});
    if (++done % 25 === 0) console.log(new Date().toISOString().slice(11, 19), done, 'frames', ((Date.now() - t0) / done / 1000).toFixed(2), 's/frame overall');
  }
  await browser.close({silent: true});
};
await Promise.all(Array.from({length: +W}, (_, k) => worker(k)));
console.log('done', done, 'frames in', ((Date.now() - t0) / 1000).toFixed(0), 's');
