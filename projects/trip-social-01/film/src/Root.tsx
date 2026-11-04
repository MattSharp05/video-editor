import React from 'react';
import {Composition} from 'remotion';
import {DUR, FPS, H, W} from './styles/shared';
import {StyleLuminous} from './styles/StyleLuminous';
import {StyleProduct} from './styles/StyleProduct';
import {StyleCollage} from './styles/StyleCollage';
import {Film} from './film/Film';
import {TOTAL} from './lib';

export const Root: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="StyleA-Luminous" component={StyleLuminous} durationInFrames={DUR} fps={FPS} width={W} height={H} />
    <Composition id="StyleB-Product" component={StyleProduct} durationInFrames={DUR} fps={FPS} width={W} height={H} />
    <Composition id="StyleC-Collage" component={StyleCollage} durationInFrames={DUR} fps={FPS} width={W} height={H} />
  </>
);
