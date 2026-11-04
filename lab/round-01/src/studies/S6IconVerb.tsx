// S6 · The icon performs its verb. Says: "packed, ready to go".
// The suitcase icon lifts out of the tab bar, grows, zips itself shut (the pull travels round,
// the teeth close behind it), the handle extends, it hops once, and drops back into place lit.
import React from 'react';
import {interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Caption, Frame} from '../kit/caption';
import {ACCENT, K, Layer, P, PhoneBody, Slice, Stage, SW, SH, arrive, camAt, clamp, lerp, spr, t01, toWorld, travel} from '../kit/space';

const SRC = staticFile('vegas-plan-day-2.png');
const TRIPS = {x: 216, y: 2440}; // the Trips tab icon
// Suitcase drawn on a 200 x 200 box, front view. The verb: lid open with clothes in it ->
// lid shuts (the body squashes on contact) -> the pull runs along the seam and closes it ->
// the handle pops up.
const Suitcase: React.FC<{fr: number; lit: number}> = ({fr, lit}) => {
  const shut = t01(fr, 30, 44, arrive);
  const thud = interpolate(fr, [44, 47, 52], [0, 1, 0], clamp);
  const zip = t01(fr, 50, 78, travel);
  const handle = spr(fr, 80, 11, 230);
  const ink = lit > 0.5 ? ACCENT : '#fff';
  const px = lerp(28, 172, zip);
  const hy = -handle * 22;
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" style={{overflow: 'visible'}}>
      <g transform={`translate(100 185) scale(${1 + thud * 0.05} ${1 - thud * 0.06}) translate(-100 -185)`}>
        {/* handle, tucked in until it pops up */}
        <path d={`M 80 ${52 + hy} L 80 ${34 + hy} Q 80 ${26 + hy} 88 ${26 + hy} L 112 ${26 + hy} Q 120 ${26 + hy} 120 ${34 + hy} L 120 ${52 + hy}`}
          stroke={ink} strokeWidth={9} fill="none" strokeLinecap="round" opacity={shut} />
        {/* clothes in the open case */}
        <g opacity={1 - shut}>
          <rect x={34} y={74} width={60} height={30} rx={6} fill="#2C2C30" stroke="#fff" strokeWidth={3} />
          <rect x={98} y={70} width={66} height={34} rx={6} fill="#2C2C30" stroke="#fff" strokeWidth={3} />
          <rect x={60} y={64} width={40} height={14} rx={5} fill={ACCENT} />
        </g>
        {/* body */}
        <rect x={20} y={100} width={160} height={85} rx={20} stroke={ink} strokeWidth={9} fill="#0B0B0C" />
        {/* lid: hinged at the back-left, swings down onto the body */}
        <g transform={`rotate(${lerp(-24, 0, shut)} 20 100) translate(0 ${lerp(-14, 0, shut)})`}>
          <rect x={20} y={50} width={160} height={52} rx={20} stroke={ink} strokeWidth={9} fill="#0B0B0C" />
        </g>
        {/* the seam: open teeth ahead of the pull, closed orange behind it */}
        <line x1={28} y1={101} x2={172} y2={101} stroke="#fff" strokeWidth={4} strokeDasharray="3 5" opacity={shut} />
        <line x1={28} y1={101} x2={px} y2={101} stroke={ACCENT} strokeWidth={6} strokeLinecap="round" opacity={shut} />
        <rect x={px - 6} y={98} width={12} height={22} rx={4} fill="#fff" opacity={shut} />
        <circle cx={55} cy={194} r={8} fill={ink} /><circle cx={145} cy={194} r={8} fill={ink} />
      </g>
    </svg>
  );
};

export const S6IconVerb: React.FC = () => {
  const fr = useCurrentFrame();
  const icon = toWorld(TRIPS.x, TRIPS.y);
  const up = t01(fr, 10, 36, arrive);
  const back = t01(fr, 104, 128, travel);
  const k = up * (1 - back);
  const hop = interpolate(fr, [86, 92, 98, 102], [0, -60, 0, 0], clamp);
  const squash = interpolate(fr, [84, 87, 98, 100, 104], [1, 0.9, 1, 0.92, 1], clamp);
  const x = lerp(icon.x, 0, k), y = lerp(icon.y, -40, k) + hop;
  const size = lerp(70, 560, k);
  const lit = t01(fr, 120, 128);
  const cam = camAt(fr, [[0, {dist: P}], [36, {dist: P * 0.95, pitch: 10, yaw: -10}, arrive], [130, {dist: P}]]);
  return (
    <Frame>
      <Stage cam={cam}>
        <PhoneBody />
        <Slice src={SRC} r={[0, 0, SW, SH]} radius={64} />
        <Layer w={SW * K} h={SH * K} z={1} style={{borderRadius: 64, background: `rgba(0,0,0,${0.6 * k})`}} />
        {/* the empty slot in the tab bar */}
        <Layer x={icon.x} y={icon.y - 6} z={1.5} w={70} h={56} style={{background: '#1C1C1E', opacity: fr > 12 && fr < 128 ? 1 : 0, borderRadius: 10}} />
        <Layer x={x} y={y} z={lerp(2, 380, k)} w={size} h={size} style={{transformOrigin: '50% 100%', transform: `scaleY(${squash}) scaleX(${2 - squash})`}}>
          <Suitcase fr={fr} lit={lit} />
        </Layer>
        <Layer x={icon.x} y={icon.y + 44} z={2} w={120} h={40} style={{color: ACCENT, opacity: lit, fontSize: 22, fontWeight: 700,
          textAlign: 'center', background: '#1C1C1E'}}>Trips</Layer>
      </Stage>
      <Caption fr={fr} at={4} text="Every trip, packed and ready" key_="packed" />
    </Frame>
  );
};
