import React from 'react';
import { Composition } from 'remotion';
import { KitSheet, KIT_SHEET_FRAMES } from './KitSheet';
export const Root: React.FC = () => (<>
  <Composition id="KitSheet" component={KitSheet} durationInFrames={KIT_SHEET_FRAMES} fps={30} width={1080} height={1920} />
</>);
