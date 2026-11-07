import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cat} from './Cat';
const P = Math.PI;
const poses = [
  {rollF: 0, rollB: 0, face: {mouth: 'smile' as const}},
  {rollF: P, rollB: P, face: {mouth: 'o' as const, eyes: 1.3}},
  {rollF: P / 2, rollB: P, bend: 1.0, tuckF: 1, face: {mouth: 'flat' as const, brows: 1}},
  {rollF: 0.2, rollB: P * 0.9, bend: 1.0, tuckF: 1, tuckB: 0, face: {mouth: 'grin' as const}},
  {rollF: 0, rollB: P / 2, bend: 0.9, tuckF: 0, tuckB: 1, face: {mouth: 'smug' as const}},
  {rollF: 0, rollB: 0, reachF: 1, reachB: 1, face: {mouth: 'o' as const}},
  {rollF: 0, rollB: 0, reachF: 1, reachB: 1, squash: 1, face: {mouth: 'smile' as const, eyes: 0.4}},
  {rollF: P, rollB: P, tail: 0, face: {mouth: 'wobble' as const, brows: -1, sweat: 1}},
];
export const Sheet: React.FC = () => (
  <AbsoluteFill style={{background: '#FFE7C2'}}>
    <svg width={1080} height={1920}>
      {poses.map((p, i) => <Cat key={i} x={300 + (i % 2) * 480} y={260 + Math.floor(i / 2) * 440} s={1} {...p} />)}
    </svg>
  </AbsoluteFill>
);
