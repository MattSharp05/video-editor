// Word-by-word caption at the top (inside the Reels safe area), with the key word in a
// selection box. Words arrive at a speaking pace; until a voiceover exists the timing is a stand-in.
import React from 'react';
import {interpolate} from 'remotion';
import {ACCENT, W, clamp} from './space';
import {SANS} from './fonts';

export const Caption: React.FC<{fr: number; at: number; text: string; key_?: string; wps?: number; out?: number}> =
  ({fr, at, text, key_, wps = 2.7, out}) => {
  // the key phrase is one token so it gets one box
  const words: string[] = [];
  if (key_ && text.includes(key_)) {
    const [a, b] = text.split(key_);
    words.push(...a.trim().split(' ').filter(Boolean), key_, ...b.trim().split(' ').filter(Boolean));
  } else words.push(...text.split(' '));
  const per = 30 / wps;
  const gone = out ? interpolate(fr, [out, out + 6], [1, 0], clamp) : 1;
  return (
    <div style={{position: 'absolute', top: 250, left: 80, right: 80, textAlign: 'center', fontFamily: SANS,
      fontSize: 66, fontWeight: 800, letterSpacing: -1, lineHeight: 1.12, color: '#fff', opacity: gone}}>
      {words.map((w, i) => {
        const s = at + i * per;
        const a = interpolate(fr, [s, s + 4], [0.28, 1], clamp);
        const isKey = key_ && w === key_;
        const box = isKey ? interpolate(fr, [s, s + 6], [0, 1], clamp) : 0;
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', margin: '0 9px', opacity: fr < at - 2 ? 0 : a}}>
            {isKey && (
              <span style={{position: 'absolute', left: -8, right: -8, top: 2, bottom: 0, border: `3px solid ${ACCENT}`,
                borderRadius: 8, transform: `scale(${0.9 + box * 0.1})`, opacity: box}}>
                {[[-6, -6], [-6, 'r'], ['b', -6], ['b', 'r']].map(([t, l], j) => (
                  <span key={j} style={{position: 'absolute', width: 10, height: 10, background: ACCENT, borderRadius: 2,
                    top: t === 'b' ? undefined : -6, bottom: t === 'b' ? -6 : undefined, left: l === 'r' ? undefined : -6, right: l === 'r' ? -6 : undefined}} />
                ))}
              </span>
            )}
            <span style={{position: 'relative', color: isKey ? ACCENT : '#fff'}}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

export const Honesty: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', top: 420, color: 'rgba(255,255,255,0.45)', fontFamily: SANS, fontSize: 22,
    fontWeight: 500}}>{text}</div>
);

export const Frame: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', inset: 0, background: '#050506', fontFamily: SANS, overflow: 'hidden'}}>
    {/* faint floor glow so depth has somewhere to sit */}
    <div style={{position: 'absolute', left: -200, right: -200, top: 1150, height: 900,
      background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.05), rgba(0,0,0,0) 60%)'}} />
    {children}
  </div>
);
export {W};
