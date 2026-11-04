// Style B: product UI film. Pure black stage, the real interface, flat front-on phone, one accent.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {SANS} from './fonts';
import {H, ORANGE, TILES, W, lerp, prog, tileT, ease} from './shared';

const fontFamily = SANS;
const PW = 600, PH = PW * 2622 / 1206, PX = (W - PW) / 2, PY = 560;

export const StyleProduct: React.FC = () => {
  const fr = useCurrentFrame();
  const phoneIn = prog(fr, 10, 40, ease);
  const head = prog(fr, 60, 80, ease);
  return (
    <AbsoluteFill style={{background: '#000', fontFamily}}>
      {/* headline */}
      <div style={{position: 'absolute', top: 250, width: W, textAlign: 'center', color: '#fff',
        fontSize: 92, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05,
        opacity: head, transform: `translateY(${(1 - head) * 24}px)`}}>
        40 saves.<br /><span style={{color: ORANGE}}>One plan.</span>
      </div>
      {/* phone */}
      <div style={{position: 'absolute', left: PX - 18, top: PY - 18 + (1 - phoneIn) * 120,
        width: PW + 36, height: PH + 36, borderRadius: 96, background: '#1A1A1A',
        border: '2px solid rgba(255,255,255,0.12)', opacity: phoneIn}}>
        <div style={{position: 'absolute', left: 16, top: 16, width: PW, height: PH,
          borderRadius: 80, overflow: 'hidden', background: '#000'}}>
          <Img src={staticFile('vegas-bucket.png')} style={{width: PW, height: PH}} />
        </div>
      </div>
      {/* tiles */}
      {TILES.map((t) => {
        const {burst, fly} = tileT(fr, t);
        const tx = PX + t.land[0] * PW, ty = PY + (1 - phoneIn) * 120 + t.land[1] * PH;
        const ox = W / 2 + t.sx * burst, oy = 900 + t.sy * burst;
        const x = lerp(ox, tx, fly), y = lerp(oy, ty, fly);
        const s = lerp(1, 0.12, fly);
        const pin = prog(fr, 58 + t.delay, 70 + t.delay);
        return (
          <React.Fragment key={t.i}>
            <div style={{position: 'absolute', left: x - 110, top: y - 195, width: 220, height: 390,
              borderRadius: 18, overflow: 'hidden', background: '#111',
              border: '2px solid rgba(255,255,255,0.12)', opacity: burst * (1 - pin),
              transform: `scale(${s}) rotate(${lerp(t.rot * burst, 0, fly)}deg)`}}>
              <Img src={staticFile(t.photo)} style={{width: '100%', height: '100%', objectFit: 'cover',
                objectPosition: `${(t.i * 23) % 100}% 50%`}} />
              <div style={{position: 'absolute', left: 14, right: 14, bottom: 16, color: '#fff',
                fontSize: 22, fontWeight: 700, lineHeight: 1.15}}>{t.cap}</div>
              <div style={{position: 'absolute', right: 12, top: 14, color: '#fff', fontSize: 18,
                fontWeight: 700}}>{t.likes}</div>
            </div>
            <div style={{position: 'absolute', left: tx - 22, top: ty - 22, width: 44, height: 44,
              borderRadius: 22, background: ORANGE, border: '4px solid #000',
              transform: `scale(${pin})`}} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
