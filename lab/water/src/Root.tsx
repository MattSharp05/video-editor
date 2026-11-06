import React from 'react';
import {Composition} from 'remotion';
import {Bench, SHOTS, FPS, DUR} from './Bench';
export const Root: React.FC = () => <>{SHOTS.map((s) => <Composition key={s.id} id={s.id} component={Bench} defaultProps={{id: s.id}} durationInFrames={DUR} fps={FPS} width={1080} height={1920} />)}</>;
