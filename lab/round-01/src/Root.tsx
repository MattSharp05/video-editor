import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, W} from './kit/space';
import './kit/fonts';
import {S1Exploded} from './studies/S1Exploded';
import {S2Macro} from './studies/S2Macro';
import {S3UnderTheHood} from './studies/S3UnderTheHood';
import {S4MapFloor} from './studies/S4MapFloor';
import {S5PushThrough} from './studies/S5PushThrough';
import {S6IconVerb} from './studies/S6IconVerb';

const S: [string, React.FC, number][] = [
  ['S1-Exploded', S1Exploded, 150], ['S2-Macro', S2Macro, 150], ['S3-UnderTheHood', S3UnderTheHood, 150],
  ['S4-MapFloor', S4MapFloor, 160], ['S5-PushThrough', S5PushThrough, 120], ['S6-IconVerb', S6IconVerb, 140],
];
export const Root: React.FC = () => (
  <>{S.map(([id, c, d]) => <Composition key={id} id={id} component={c} durationInFrames={d} fps={FPS} width={W} height={H} />)}</>
);
