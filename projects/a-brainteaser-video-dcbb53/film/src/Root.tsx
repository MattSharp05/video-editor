import React from 'react';
import {Still} from 'remotion';
import './kit/fonts';
import {Style} from './Style';
import {Board} from './Board';

export const Root: React.FC = () => (
  <>
    <Still id="style" component={Style} width={1080} height={1920} defaultProps={{}} />
    <Still id="board" component={Board} width={1080} height={1920} defaultProps={{id: 's1', text: true}} />
  </>
);
