import React from 'react';
import B from './beats.json';
import {StageA, A_OUT, StageB, B_OUT} from './scenesA';
import {StageC, C_OUT, StageD, D_OUT, StageE, E_OUT, StageF, F_OUT} from './scenesB';
import {StageG, G_OUT, G_AT, StageH, H_OUT, H_AT, StageI, I_OUT, I_AT, StageJ, J_OUT, J_AT, StageK, K_OUT, K_AT, StageL, L_AT} from './scenesC';

type Out = {x: number; y: number; r: number} | null;
export const STAGES: {at: number; C: React.FC<{t: number}>; out: Out}[] = [
  {at: 0, C: StageA, out: A_OUT},
  {at: B.l3 - 0.3, C: StageB, out: B_OUT},
  {at: B.l5 - 0.3, C: StageC, out: C_OUT},
  {at: B.l6 - 0.3, C: StageD, out: D_OUT},
  {at: B.l7 - 0.3, C: StageE, out: E_OUT},
  {at: B.l10 - 0.3, C: StageF, out: F_OUT},
  {at: G_AT, C: StageG, out: G_OUT},
  {at: H_AT, C: StageH, out: H_OUT},
  {at: I_AT, C: StageI, out: I_OUT},
  {at: J_AT, C: StageJ, out: J_OUT},
  {at: K_AT, C: StageK, out: K_OUT},
  {at: L_AT, C: StageL, out: null},
];
