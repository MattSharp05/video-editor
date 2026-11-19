import React from 'react';
import {Composition} from 'remotion';
import './kit/fonts';
import {Film, DUR, FPS} from './Film';
import {makeAssetQA} from './kit/qa';
import {StemCordQA} from './kit/brain';

// QA sheets for assembled assets (assembly.md): ./qa_sheet.sh <asset> <outdir> <n_focus>
const AssetQA = makeAssetQA({stemcord: {render: () => <StemCordQA />, focus: [[0.333, -1.181, 0]], focusDist: 0.6}});

export const Root: React.FC = () => (<>
  <Composition id="Film" component={Film} durationInFrames={DUR} fps={FPS} width={1080} height={1920} defaultProps={{captions: true}} />
  <Composition id="QA" component={AssetQA} durationInFrames={1} fps={FPS} width={1080} height={1080} defaultProps={{asset: 'stemcord', view: 0}} />
</>);
