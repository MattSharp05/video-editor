import React from 'react';
import {Composition} from 'remotion';
import './kit/fonts';
import {Film} from './Film';
import {FPS, TOTAL} from './timeline';

export const Root: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{captions: true, audio: true}} />
  </>
);
