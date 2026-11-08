// Push-through hand-offs (pick §1.4): the next stage opens inside a round carrier. During [at - d, at] the outgoing
// stage keeps running (its own camera pushes into the carrier) and the incoming stage is drawn clipped to a circle at
// the carrier's screen point, growing from r0 to past the frame corners. No colour flood, no cut.
import React from 'react';
import {Easing, interpolate} from 'remotion';

export type StageFC = React.FC<{t: number; clip?: {x: number; y: number; r: number}}>;
export type StageDef = {id: string; from: number; C: StageFC};
export type Thru = {at: number; d: number; x: number; y: number; r0?: number};
const e = Easing.bezier(0.55, 0, 0.75, 0.6);
export const Stages: React.FC<{t: number; stages: StageDef[]; thru: Thru[]}> = ({t, stages, thru}) => {
  let i = 0;
  for (let j = 0; j < stages.length; j++) if (t >= stages[j].from) i = j;
  const A = stages[i];
  const next = stages[i + 1];
  const th = next && thru.find((h) => Math.abs(h.at - next.from) < 1e-6);
  const inTh = th && t >= th.at - th.d;
  const k = inTh ? interpolate(t, [th!.at - th!.d, th!.at], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e}) : 0;
  return (
    <>
      <A.C t={t} />
      {inTh && next && <next.C t={t} clip={{x: th!.x, y: th!.y, r: (th!.r0 ?? 30) + k * 2300}} />}
    </>
  );
};
