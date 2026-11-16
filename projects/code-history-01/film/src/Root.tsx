import React from 'react';
import {Composition} from 'remotion';
import './kit/fonts';
import {StyleFrame} from './StyleFrame';
import {HandTest} from './HandTest';
import {Film, DUR, FPS} from './Film';
export const Root: React.FC = () => (
  <>
  <Composition id="Film" component={Film} durationInFrames={DUR} fps={FPS} width={1080} height={1920} />
  <Composition id="HandTest" component={HandTest} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{poses: []}} />
  <Composition id="StyleFrame" component={StyleFrame} durationInFrames={90} fps={30} width={1080} height={1920}
    defaultProps={{beat: "hook"}} />
  </>
);
