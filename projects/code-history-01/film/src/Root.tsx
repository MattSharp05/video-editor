import React from 'react';
import {Composition} from 'remotion';
import './kit/fonts';
import {StyleFrame} from './StyleFrame';
import {HandTest} from './HandTest';
export const Root: React.FC = () => (
  <>
  <Composition id="HandTest" component={HandTest} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{poses: []}} />
  <Composition id="StyleFrame" component={StyleFrame} durationInFrames={90} fps={30} width={1080} height={1920}
    defaultProps={{cam: [1.05, 1.02, 0.62], look: [0.42, 0.8, 0.0], fov: 38}} />
  </>
);
