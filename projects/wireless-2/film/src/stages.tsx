import React from 'react';
import B from './beats.json';
import {StageA, A_OUT, StageB, B_OUT} from './scenesA';
import {StageC, C_OUT, StageD, D_OUT, StageE, E_OUT, StageF, F_OUT} from './scenesB';

type Out = {x: number; y: number; r: number} | null;
export const STAGES: {at: number; C: React.FC<{t: number}>; out: Out}[] = [
  {at: 0, C: StageA, out: A_OUT},
  {at: B.l3 - 0.3, C: StageB, out: B_OUT},
  {at: B.l5 - 0.3, C: StageC, out: C_OUT},
  {at: B.l6 - 0.3, C: StageD, out: D_OUT},
  {at: B.l7 - 0.3, C: StageE, out: E_OUT},
  {at: B.l10 - 0.3, C: StageF, out: F_OUT},
];
