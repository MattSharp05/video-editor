import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const sets = JSON.parse(process.argv[2]);
for (const [name, props] of Object.entries(sets)) {
  const comp = await selectComposition({serveUrl, id: 'Proto', inputProps: props, chromiumOptions: {gl: 'swangle'}});
  await renderStill({composition: comp, serveUrl, frame: props.frame ?? 30, output: `out/proto/${name}.png`, scale: 0.4, inputProps: props, chromiumOptions: {gl: 'swangle'}});
  console.log(name);
}
