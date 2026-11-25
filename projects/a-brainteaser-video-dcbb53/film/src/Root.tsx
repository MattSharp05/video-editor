import React from 'react';
import {Composition, Still} from 'remotion';
import './kit/fonts';
import {Style} from './Style';
import {Board} from './Board';
import {Film, TOTAL, FPS} from './Film';

export const Root: React.FC = () => (
  <>
    <Composition id="film" component={Film} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{captions: true, audio: false}} />
    <Still id="style" component={Style} width={1080} height={1920} defaultProps={{}} />
    <Still id="board" component={Board} width={1080} height={1920} defaultProps={{id: 's1', text: true}} />
  </>
);
