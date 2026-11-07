import React from 'react';
import {Composition} from 'remotion';
import './kit/fonts';
import {Film, DUR} from './Film';

export const Root: React.FC = () => <Composition id="Film" component={Film} durationInFrames={DUR} fps={30} width={1080} height={1920} defaultProps={{captions: true}} />;
