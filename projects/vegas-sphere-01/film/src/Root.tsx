import React from 'react';
import {Composition} from 'remotion';
import './kit/fonts';
import {Film, DUR, FPS} from './Film';

export const Root: React.FC = () => <Composition id="Film" component={Film} defaultProps={{captions: true}} durationInFrames={DUR} fps={FPS} width={1080} height={1920} />;
