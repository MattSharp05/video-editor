// Render one still per shot (mid-shot) and time it: node stills.mjs [scale] [id,id,...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const scale = Number(process.argv[2] || 0.4), only = process.argv[3]?.split(',');
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), webpackOverride: (c) => ({...c, resolve: {...c.resolve, modules: [path.resolve('node_modules'), 'node_modules']}})});
const ids = ['river-aerial', 'river-bank', 'rapids', 'under-clear', 'under-flood', 'flood-front', 'ocean-open', 'ocean-shore', 'waterfall'].filter((i) => !only || only.includes(i));
for (const id of ids) {
  const comp = await selectComposition({serveUrl, id, chromiumOptions: {gl: 'swangle'}});
  const t0 = Date.now();
  await renderStill({composition: comp, serveUrl, frame: 45, output: `stills/${id}.png`, scale, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000});
  console.log(id, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
