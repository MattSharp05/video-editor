import React from 'react';
import {Composition} from 'remotion';
import './kit/fonts';
import {Film, DUR, FPS} from './Film';
import {Sample} from './Sample';

export const Root: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={DUR} fps={FPS} width={1080} height={1920} defaultProps={{captions: true, audio: true}} />
    <Composition id="Sample" component={Sample} durationInFrames={30} fps={30} width={1080} height={1920} defaultProps={{shot: 'hook', overlay: true}} />
  </>
);
