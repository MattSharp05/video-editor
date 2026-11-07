// S0: the kitchen and the microwave front. Drawn in S0 coords (microwave centre 540,1060) and placed in S1 (oven space)
// by S0_TO_S1, so the door window lines up exactly with the oven cavity: pushing through the window is one move.
import React from 'react';
import {C, Kitchen, MW} from './art';
import {SANS} from './kit/fonts';

export const K = 1200 / MW.win.w;                 // S0 -> S1 scale
export const WC = {x: 540 + MW.win.x + MW.win.w / 2, y: 1060 + MW.win.y + MW.win.h / 2}; // window centre in S0
export const S0_TO_S1 = `scale(${K}) translate(${-WC.x},${-WC.y})`;
const W = MW.win, OX = 540, OY = 1060;
const WX = OX + W.x, WY = OY + W.y;

// hole grid of the door (S0 units: holes r 5.5, spacing 18)
const holes: React.ReactNode[] = [];
for (let y = WY + 12; y < WY + W.h - 6; y += 18) for (let x = WX + 12 + ((Math.round((y - WY - 12) / 18)) % 2) * 9; x < WX + W.w - 6; x += 18) holes.push(<circle key={`${x},${y}`} cx={x} cy={y} r={5.5} />);

export const S0: React.FC<{t: number; op: number; open: number; on: number; label: number; time: string}> = ({t, op, open, on, label, time}) => {
  if (op <= 0.001) return null;
  const doorW = W.w + 60;
  return (
    <g transform={S0_TO_S1} opacity={op}>
      <defs>
        <mask id="s0hole"><rect x={-2000} y={-2000} width={5000} height={6000} fill="white" /><rect x={WX} y={WY} width={W.w} height={W.h} rx={34} fill="black" /></mask>
        <mask id="meshM"><rect x={WX} y={WY} width={W.w} height={W.h} fill="white" /><g fill="black">{holes}</g></mask>
      </defs>
      <g mask="url(#s0hole)">
        <Kitchen t={t} />
        <g transform={`translate(${OX},${OY})`}>
          <ellipse cx={0} cy={MW.h / 2 + 18} rx={MW.w * 0.52} ry={26} fill="#2A1A20" opacity={0.35} />
          <rect x={-MW.w / 2} y={-MW.h / 2} width={MW.w} height={MW.h} rx={70} fill={C.sage} />
          <rect x={-MW.w / 2 + 14} y={-MW.h / 2 + 10} width={MW.w - 28} height={40} rx={20} fill="#BDE0CB" opacity={0.6} />
          {[-300, 300].map((x) => <rect key={x} x={x - 40} y={MW.h / 2 - 8} width={80} height={30} rx={12} fill={C.sageD} />)}
          <rect x={W.x - 18} y={W.y - 18} width={W.w + 36} height={W.h + 36} rx={46} fill={open > 0.02 ? '#4A3530' : C.sageD} />
          {/* control panel */}
          <g transform="translate(300,0)">
            <rect x={-80} y={-220} width={160} height={440} rx={30} fill="#B3D8C2" />
            <rect x={-62} y={-196} width={124} height={60} rx={12} fill="#2E2230" />
            <text x={0} y={-152} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={36} fill={on > 0.5 ? C.gold : '#9A8A7A'}>{time}</text>
            {[-40, 90].map((y, i) => (
              <g key={y} transform={`translate(0,${y}) rotate(${i === 0 ? -t * 40 : 60 + Math.sin(t) * 4})`}>
                <circle r={46} fill={C.cream} /><circle r={36} fill="#E9DCC0" />
                <rect x={-6} y={-40} width={12} height={30} rx={6} fill={C.hot} />
              </g>
            ))}
            <rect x={-50} y={170} width={100} height={30} rx={15} fill={C.cream} />
          </g>
        </g>
        <text x={OX} y={OY + MW.h / 2 + 120} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={60} letterSpacing={8}
          fill={C.cream} opacity={label} style={{paintOrder: 'stroke'}} stroke="#3B2534" strokeWidth={10}>MICROWAVE</text>
      </g>
      {/* the door: mesh + glass over the window; when it opens it swings toward us on its left hinge */}
      <g opacity={1 - open}>
        <rect x={WX} y={WY} width={W.w} height={W.h} fill="#2C2B2E" opacity={0.5} mask="url(#meshM)" />
        <path d={`M${WX + 40} ${WY + 30} L${WX + 200} ${WY + 30}`} stroke="#fff" strokeOpacity={0.35} strokeWidth={10} strokeLinecap="round" />
      </g>
      {open > 0.02 && (
        <g>
          {/* the open door slab seen edge-on-ish: a narrow panel on the left hinge */}
          <path d={`M${WX - 30} ${WY - 40} L${WX - 30 - doorW * 0.32 * open} ${WY - 90 * open} L${WX - 30 - doorW * 0.32 * open} ${WY + W.h + 90 * open} L${WX - 30} ${WY + W.h + 40} Z`}
            fill={C.sage} stroke={C.sageD} strokeWidth={8} />
          <path d={`M${WX - 40 - doorW * 0.08 * open} ${WY + 20} L${WX - 30 - doorW * 0.27 * open} ${WY - 30 * open} L${WX - 30 - doorW * 0.27 * open} ${WY + W.h + 30 * open} L${WX - 40 - doorW * 0.08 * open} ${WY + W.h - 20} Z`}
            fill="#5B6F68" opacity={0.7} />
        </g>
      )}
    </g>
  );
};
