import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Background} from './Background';
export const BgOnly: React.FC = () => <div style={{position: 'absolute', inset: 0, background: '#04060D'}}><Background fr={useCurrentFrame()} /></div>;
