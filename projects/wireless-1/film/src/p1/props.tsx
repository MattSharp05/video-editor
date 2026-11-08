// Part-only props for Part 1 (pick §3.3): playing cards, opera glasses, the doctor's story cards. Series style.
import React from 'react';
import {K, FONT} from './tok';
import {Sh, R, E} from './ink';

// one playing card, flipping (flip 0 = back, 1 = face) around its vertical axis
export const P1Card: React.FC<{x: number; y: number; rot?: number; flip?: number; suit?: 0 | 1 | 2 | 3; s?: number}> = ({x, y, rot = 0, flip = 1, suit = 0, s = 1}) => {
  const sx = Math.max(0.05, Math.abs(Math.cos(flip * Math.PI)));
  const face = flip > 0.5;
  const red = suit < 2;
  const pip = ['M0,-14C-14,-30 -30,-8 0,14C30,-8 14,-30 0,-14z', 'M0,-18L14,0L0,18L-14,0z', 'M0,-18C-24,4 -10,16 0,6C10,16 24,4 0,-18zM-4,6h8l4,14h-16z', 'M0,-18A9,9 0 1 0 -6,-2A9,9 0 1 0 0,10A9,9 0 1 0 6,-2A9,9 0 1 0 0,-18zM-4,6h8l4,14h-16z'][suit];
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s * sx},${s})`}>
      <Sh d={R(-40, -58, 80, 116, 8)} fill={face ? K.newsprint : K.deep} line={3} />
      {face ? <path d={pip} fill={red ? K.cora : K.ink} opacity={red ? 0.9 : 1} /> : <path d={R(-30, -48, 60, 96, 5)} fill="url(#p1-ht)" stroke={K.newsprint} strokeWidth={2} />}
    </g>
  );
};

// opera glasses on a handle (Clara's), lenses glint
export const P1OperaGlasses: React.FC<{x: number; y: number; rot?: number; s?: number; glint?: number}> = ({x, y, rot = 0, s = 1, glint = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Sh d="M-8,30L-14,140h28L8,30z" fill={K.newsprint} line={3} />
    {[-46, 46].map((cx) => <g key={cx}>
      <Sh d={R(cx - 32, -40, 64, 70, 10)} fill={K.deep} ht="near" line={4} />
      <Sh d={E(cx, -44, 34, 14)} fill={K.fog} line={4} />
      <ellipse cx={cx - 10} cy={-48} rx={8} ry={4} fill="#fff" opacity={0.5 + glint * 0.5} />
    </g>)}
    <Sh d={R(-16, -24, 32, 30, 6)} fill={K.newsprint} line={3} />
  </g>
);

// a story card from the doctor's pocket: a little painted picture with a word. `kind` picks the picture.
// `wet` (0..1) runs a clue-yellow paint drip down from the picture (the pick's "paint is wet" tell).
export const P1StoryCard: React.FC<{x: number; y: number; rot?: number; s?: number; kind: 'america' | 'ranaway'; t: number; wet?: number; crumple?: number}> = ({x, y, rot = 0, s = 1, kind, t, wet = 0, crumple = 0}) => {
  const W = 420, H = 300, sq = 1 - crumple * 0.75;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot + crumple * 40}) scale(${s * sq},${s * (1 - crumple * 0.6)})`}>
      <Sh d={crumple > 0.05 ? `M${-W / 2},${-H / 2}L${-W / 6},${-H / 2 + 20}L${W / 2},${-H / 2}L${W / 2 - 20},0L${W / 2},${H / 2}L0,${H / 2 - 24}L${-W / 2},${H / 2}L${-W / 2 + 26},0z` : R(-W / 2, -H / 2, W, H, 10)} fill={K.newsprint} line={4} />
      <g clipPath="url(#p1-cardclip)">
        <defs><clipPath id="p1-cardclip"><rect x={-W / 2 + 22} y={-H / 2 + 22} width={W - 44} height={H - 110} rx={6} /></clipPath></defs>
        <rect x={-W / 2 + 22} y={-H / 2 + 22} width={W - 44} height={H - 110} fill={K.fog} />
        {kind === 'america' ? (
          <g>
            {/* painted sea and a steamship sailing right */}
            {[0, 1, 2].map((i) => <path key={i} d={`M${-W / 2},${20 + i * 22}${Array.from({length: 12}).map((_, j) => `q18,${(j + i) % 2 ? -10 : 10} 36,0`).join('')}`} transform={`translate(${-((t * 40 + i * 13) % 36)},0)`} stroke={K.slate} strokeWidth={5} fill="none" />)}
            <g transform={`translate(${-60 + ((t * 30) % 120)},0)`}>
              <Sh d="M-70,0L70,0L50,24H-56z" fill={K.slate} line={3} />
              <Sh d={R(-40, -26, 70, 26)} fill={K.newsprint} line={3} />
              <Sh d={R(-6, -56, 22, 32)} fill={K.fog} line={3} />
              <circle cx={10 - ((t * 20) % 30)} cy={-70 - ((t * 20) % 30)} r={10} fill={K.mist} opacity={0.7} />
            </g>
          </g>
        ) : (
          <g>
            {/* painted train steaming away left, a big hat in its window */}
            <path d={`M${-W / 2},40H${W / 2}`} stroke={K.ink} strokeWidth={4} />
            <g transform={`translate(${70 - ((t * 36) % 140)},0)`}>
              <Sh d={R(-80, -30, 110, 66, 6)} fill={K.slate} line={3} />
              <Sh d={R(30, -10, 70, 46, 4)} fill={K.deep} line={3} />
              <Sh d={R(-62, -18, 40, 26)} fill={K.lamp} line={2} />
              <path d="M-66,-16q16,-16 32,0z" fill={K.deep} />
              <path d="M-38,-22q6,-20 -4,-30" stroke={K.cora} strokeWidth={5} fill="none" strokeLinecap="round" />
              <Sh d={R(-104, -50, 22, 26)} fill={K.deep} line={2} />
              {[0, 1, 2].map((i) => <circle key={i} cx={-60 + i * 50} cy={40} r={12} fill={K.ink} />)}
              {[0, 1, 2].map((i) => { const k = (t * 1.4 + i / 3) % 1; return <circle key={i} cx={-94 + k * 40} cy={-60 - k * 50} r={10 + k * 16} fill={K.mist} opacity={0.7 * (1 - k)} />; })}
            </g>
          </g>
        )}
      </g>
      {/* wet paint: a clue drip from the picture's lower edge */}
      {wet > 0 && <path d={`M${60},${H / 2 - 88}v${wet * 120}`} stroke={K.clue} strokeWidth={10} strokeLinecap="round" />}
      {wet > 0 && <circle cx={60} cy={H / 2 - 88 + wet * 120 + 6} r={9} fill={K.clue} />}
      <text x={0} y={H / 2 - 30} textAnchor="middle" fontFamily={FONT.display} fontSize={54} fill={K.ink}>{kind === 'america' ? 'AMERICA' : 'RAN AWAY'}</text>
    </g>
  );
};
