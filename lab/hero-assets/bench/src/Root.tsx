import React from 'react';
import {Composition} from 'remotion';
import {Bench, type BenchProps} from './Bench';

const defaults: BenchProps = {variant: 'threejs', angle: 'wide', glb: null, light: 'neutralise'};
export const Root: React.FC = () => (
  <Composition id="Bench" component={Bench} durationInFrames={90} fps={30} width={1080} height={1920} defaultProps={defaults} />
);
