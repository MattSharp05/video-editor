// The paper plane: the send arrow's fold of the message. fold = 0 is a flat sheet (4:3), 1 a dart pointing right.
// Each wing is a quad whose corners slide from the sheet's halves to the plane's wings, so it folds, never fades.
import React from 'react';
import {lerp, PAPER} from './common';

type P = [number, number];
const SHEET1: P[] = [[1, 0], [1, -0.75], [-1, -0.75], [-1, 0]];
const SHEET2: P[] = [[1, 0], [-1, 0], [-1, 0.75], [1, 0.75]];
const PLANE1: P[] = [[1, 0], [-0.75, -0.62], [-0.55, -0.1], [-0.62, 0]];
const PLANE2: P[] = [[1, 0], [-0.62, 0], [-0.55, 0.16], [-0.75, 0.42]];
const mix = (a: P[], b: P[], k: number) => a.map((p, i) => `${lerp(p[0], b[i][0], k)},${lerp(p[1], b[i][1], k)}`).join(' ');

export const Plane: React.FC<{size: number; fold: number; text?: string; style?: React.CSSProperties}> = ({size, fold, text, style}) => (
  <svg width={size} height={size} viewBox="-1.1 -1.1 2.2 2.2" style={{overflow: 'visible', ...style}}>
    <defs>
      <linearGradient id="pw1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor={PAPER} /></linearGradient>
      <linearGradient id="pw2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E2DACB" /><stop offset="1" stopColor="#CFC5B2" /></linearGradient>
    </defs>
    <polygon points={mix(SHEET2, PLANE2, fold)} fill={fold > 0.02 ? 'url(#pw2)' : 'url(#pw1)'} stroke="rgba(90,70,50,0.25)" strokeWidth={0.012} />
    <polygon points={mix(SHEET1, PLANE1, fold)} fill="url(#pw1)" stroke="rgba(90,70,50,0.25)" strokeWidth={0.012} />
    <line x1={1} y1={0} x2={lerp(-1, -0.62, fold)} y2={0} stroke="rgba(90,70,50,0.35)" strokeWidth={0.014 * fold} />
    {text && fold < 0.4 && (
      <text x={0} y={0.08} textAnchor="middle" fontSize={0.135} fontFamily="'Hanken Grotesk', sans-serif" fontWeight={700} fill="#2A2018" opacity={1 - fold / 0.4}>{text}</text>
    )}
  </svg>
);
