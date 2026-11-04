// Style C: editorial collage. A paper map of Las Vegas on a desk; the saved TikToks are printed
// cut-outs pinned to the map with orange string; the phone is a cut-out print. Animated on twos.
import React, {useMemo} from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {TYPE, MARKER} from './fonts';
import {H, ORANGE, TILES, W, lerp, prog, tileT, ease} from './shared';

const type = TYPE;
const PW = 430, PH = PW * 2622 / 1206, PX = (W - PW) / 2 + 40, PY = 620;
const PAPER = '#EDE6D6', INK = '#2B2722';

// A paper map drawn once: street grid, the Strip, a few labels.
const MapPaper: React.FC = () => {
  const streets = useMemo(() => Array.from({length: 26}, (_, i) => i), []);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="rough"><feTurbulence baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 -1.4 0.9" /></filter>
      </defs>
      <rect x={60} y={170} width={W - 120} height={H - 380} fill={PAPER} transform="rotate(-1.5 540 960)" />
      <g transform="rotate(-1.5 540 960)" stroke="#C9BFA8" strokeWidth={3}>
        {streets.map((i) => <line key={`h${i}`} x1={60} x2={W - 60} y1={200 + i * 58} y2={200 + i * 58 + (random(`s${i}`) - 0.5) * 20} />)}
        {streets.slice(0, 16).map((i) => <line key={`v${i}`} y1={170} y2={H - 210} x1={80 + i * 64} x2={80 + i * 64 + (random(`v${i}`) - 0.5) * 30} />)}
        <path d="M 600 180 C 560 600, 520 1000, 470 1720" stroke="#B5A88C" strokeWidth={16} fill="none" />
      </g>
      <rect x={60} y={170} width={W - 120} height={H - 380} filter="url(#rough)" opacity={0.35} transform="rotate(-1.5 540 960)" />
      <text x={100} y={290} fontFamily={type} fontSize={64} fill={INK} transform="rotate(-1.5 540 960)">LAS VEGAS</text>
      <text x={104} y={340} fontFamily={type} fontSize={28} fill={INK} opacity={0.7} transform="rotate(-1.5 540 960)">NOV 12 – 16</text>
      <text x={640} y={1660} fontFamily={type} fontSize={30} fill={INK} opacity={0.6} transform="rotate(-80 640 1660)">LAS VEGAS BLVD</text>
    </svg>
  );
};

export const StyleCollage: React.FC = () => {
  const raw = useCurrentFrame();
  const fr = Math.floor(raw / 2) * 2; // on twos
  const phoneIn = prog(fr, 6, 26, ease);
  const circle = prog(fr, 70, 96, ease);
  return (
    <AbsoluteFill style={{background: '#3A2F27'}}>
      <MapPaper />
      {/* phone print */}
      <div style={{position: 'absolute', left: PX - 14, top: PY - 14, width: PW + 28, height: PH + 28,
        background: '#FAF7F0', boxShadow: '0 18px 30px rgba(0,0,0,0.35)', opacity: phoneIn,
        transform: `rotate(${lerp(-8, 2.5, phoneIn)}deg) scale(${lerp(1.15, 1, phoneIn)})`}}>
        <Img src={staticFile('vegas-bucket.png')} style={{position: 'absolute', left: 14, top: 14, width: PW, height: PH}} />
      </div>
      {/* marker circle around the map */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d="M 760 700 C 900 760, 860 1180, 620 1200 C 380 1220, 330 900, 470 760 C 560 680, 700 670, 790 720"
          stroke={ORANGE} strokeWidth={10} fill="none" strokeLinecap="round"
          strokeDasharray={1400} strokeDashoffset={1400 * (1 - circle)} />
      </svg>
      {/* string + cut-outs */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {TILES.map((t) => {
          const {burst, fly} = tileT(fr, t);
          const ox = W / 2 + t.sx * burst * 1.05, oy = 980 + t.sy * burst * 0.95;
          const ax = lerp(ox, lerp(ox, PX + t.land[0] * PW, 0.22), fly);
          const ay = lerp(oy, lerp(oy, PY + t.land[1] * PH, 0.22), fly);
          const tx = PX + t.land[0] * PW, ty = PY + t.land[1] * PH;
          const s = prog(fr, 30 + t.delay, 50 + t.delay);
          return <path key={t.i} d={`M ${ax} ${ay} Q ${(ax + tx) / 2} ${(ay + ty) / 2 + 60} ${lerp(ax, tx, s)} ${lerp(ay, ty, s)}`}
            stroke={ORANGE} strokeWidth={4} fill="none" opacity={burst} />;
        })}
      </svg>
      {TILES.map((t) => {
        const {burst, fly} = tileT(fr, t);
        const ox = W / 2 + t.sx * burst * 1.05, oy = 980 + t.sy * burst * 0.95;
        const x = lerp(ox, lerp(ox, PX + t.land[0] * PW, 0.22), fly);
        const y = lerp(oy, lerp(oy, PY + t.land[1] * PH, 0.22), fly);
        const s = lerp(1, 0.62, fly);
        const jitter = (random(`j${t.i}${fr}`) - 0.5) * 0.8;
        return (
          <div key={t.i} style={{position: 'absolute', left: x - 95, top: y - 150, width: 190, height: 290,
            background: '#FAF7F0', padding: 10, boxShadow: '0 10px 18px rgba(0,0,0,0.35)', opacity: burst,
            transform: `scale(${s}) rotate(${t.rot * 0.8 + jitter}deg)`}}>
            <Img src={staticFile(t.photo)} style={{width: 170, height: 210, objectFit: 'cover',
              objectPosition: `${(t.i * 23) % 100}% 50%`, filter: 'saturate(0.85) contrast(1.05)'}} />
            <div style={{fontFamily: type, fontSize: 17, color: INK, marginTop: 8, lineHeight: 1.1}}>{t.cap}</div>
            <div style={{position: 'absolute', left: 85, top: -12, width: 22, height: 22, borderRadius: 11,
              background: ORANGE, boxShadow: '0 3px 4px rgba(0,0,0,0.4)'}} />
          </div>
        );
      })}
      {/* label */}
      <div style={{position: 'absolute', left: 560, top: 300, fontFamily: MARKER, fontSize: 56, color: ORANGE,
        transform: 'rotate(-4deg)', opacity: prog(fr, 76, 90)}}>40 saves → 1 map</div>
    </AbsoluteFill>
  );
};
