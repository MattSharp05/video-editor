import React from 'react';
import {Composition} from 'remotion';
import {H, W} from './kit/space';
import './kit/fonts';
import {GlassTest} from './GlassTest';
import {Thread, DUR} from './Thread';

export const Root: React.FC = () => (
  <>
    <Composition id="GlassTest" component={GlassTest} durationInFrames={240} fps={60} width={W} height={H} />
    <Composition id="Thread" component={Thread} durationInFrames={DUR} fps={60} width={W} height={H} />
  </>
);
