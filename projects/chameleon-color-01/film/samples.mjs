// Render the sample frames: node samples.mjs [shot,shot,...] [scale]  -> ../stills/sample-<shot>.png
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const shots = (process.argv[2] || 'hook,eye,faceoff,layers,tight,spread').split(','), scale = Number(process.argv[3] || 0.5);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const shot of shots) {
  const inputProps = {shot, overlay: process.env.BARE ? false : true};
  const comp = await selectComposition({serveUrl, id: 'Sample', inputProps, chromiumOptions: {gl: 'swangle'}});
  const T0 = Date.now();
  await renderStill({composition: comp, serveUrl, frame: 0, output: `${process.env.OUT || '../stills'}/sample-${shot}.png`, scale, inputProps,
    chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 180000});
  console.log(shot, ((Date.now() - T0) / 1000).toFixed(1) + 's');
}
