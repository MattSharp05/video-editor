import React from 'react';
import {Composition} from 'remotion';
import './kit/fonts';
import {Film, DUR, FPS} from './Film';
import {Sheet} from './Sheet';

export const Root: React.FC = () => (<>
  <Composition id="Film" component={Film} durationInFrames={DUR} fps={FPS} width={1080} height={1920} defaultProps={{captions: true}} />
  <Composition id="Sheet" component={Sheet} durationInFrames={1} fps={30} width={1080} height={1920} />
</>);
