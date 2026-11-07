// Series cards and grade, to the pick's spec (§1.3, §2.6, §2.7); replaced by the kit's when READY.
import React from 'react';
import {Img, interpolate, random, staticFile} from 'remotion';
import {C} from './paper';
import {TYPE, SERIF} from './cast';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// grain (3 tiles cycled on twos, overlay 7 %), paper fibre (multiply 22 %), vignette, flicker 1 ± 0.015
export const Grade: React.FC<{frame: number}> = ({frame}) => {
  const step = Math.floor(frame / 2);
  const flick = 1 + (random(`fl${step}`) - 0.5) * 0.03;
  return (
    <>
      <Img src={staticFile('paper.png')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, mixBlendMode: 'multiply', opacity: 0.22}} />
      <Img src={staticFile(`grain${step % 3}.png`)} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, mixBlendMode: 'overlay', opacity: 0.07, imageRendering: 'pixelated'}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(35,27,22,0) 55%, rgba(35,27,22,0.18) 100%)'}} />
      <div style={{position: 'absolute', inset: 0, background: flick > 1 ? '#FFFFFF' : '#000000', opacity: Math.abs(flick - 1) * 0.6}} />
    </>
  );
};

export const CornerTab: React.FC<{t: number; hideAt: number}> = ({t, hideAt}) => {
  const out = interpolate(t, [hideAt - 0.3, hideAt], [0, 1], clamp);
  if (out >= 1) return null;
  return (
    <div style={{position: 'absolute', left: 64 - out * 700, top: 230, padding: '10px 22px 8px', background: C.card, border: `2.5px solid ${C.ink}`,
      boxShadow: '8px 10px 0 rgba(35,27,22,0.28)', fontFamily: TYPE, fontSize: 34, color: C.ink, transform: 'rotate(-1.5deg)'}}>
      The Stolen Smile · Part 1 of 3
    </div>
  );
};

// museum plaque in an oldGold frame dropping on two strings, swinging twice; typed label under it
export const TitlePlaque: React.FC<{t: number; typeAt: number; until: number}> = ({t, typeAt, until}) => {
  if (t < 0 || t > until + 0.5) return null;
  const drop = interpolate(t, [0, 0.35], [-900, 0], clamp) + interpolate(t, [until, until + 0.5], [0, -1300], clamp);
  const sw = Math.sin(t * 6) * 7 * Math.exp(-t * 1.6);
  const label = 'Part one: the vanishing';
  const n = Math.floor(interpolate(t, [typeAt, typeAt + 0.9], [0, label.length], clamp));
  return (
    <div style={{position: 'absolute', left: 90, width: 900, top: 760 + drop, transformOrigin: '50% -300px', transform: `rotate(${sw}deg)`}}>
      <div style={{position: 'absolute', left: 250, top: -300, width: 2.5, height: 300, background: C.ink, transform: 'rotate(8deg)', transformOrigin: 'bottom'}} />
      <div style={{position: 'absolute', left: 650, top: -300, width: 2.5, height: 300, background: C.ink, transform: 'rotate(-8deg)', transformOrigin: 'bottom'}} />
      <div style={{background: C.oldGold, border: `3.5px solid ${C.ink}`, padding: 16, boxShadow: '8px 10px 0 rgba(35,27,22,0.28)'}}>
        <div style={{background: C.card, border: `2.5px solid ${C.ink}`, padding: '34px 20px 30px', textAlign: 'center'}}>
          <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 96, color: C.ink, lineHeight: 1}}>The Stolen Smile</div>
          <div style={{fontFamily: TYPE, fontSize: 44, color: C.ink, marginTop: 22, minHeight: 52}}>{label.slice(0, n)}<span style={{opacity: n < label.length ? 1 : 0}}>|</span></div>
        </div>
      </div>
    </div>
  );
};

// a small card gallery label pinned on with one stamp thump
export const EndCard: React.FC<{t: number; text: string}> = ({t, text}) => {
  if (t < 0) return null;
  const s = interpolate(t, [0, 0.12, 0.2], [1.5, 0.96, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 140, right: 140, top: 1200, display: 'flex', justifyContent: 'center', opacity: interpolate(t, [0, 0.06], [0, 1], clamp)}}>
      <div style={{background: C.card, border: `2.5px solid ${C.ink}`, padding: '22px 44px 18px', textAlign: 'center', transform: `scale(${s}) rotate(-1deg)`, boxShadow: '8px 10px 0 rgba(0,0,0,0.35)'}}>
        <div style={{fontFamily: TYPE, fontSize: 52, color: C.ink}}>{text}</div>
        <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 30, color: C.sepia, marginTop: 6}}>The Stolen Smile</div>
        <div style={{position: 'absolute', left: '50%', top: -12, width: 22, height: 22, borderRadius: 11, background: C.clueRed, border: `2px solid ${C.ink}`, marginLeft: -11}} />
      </div>
    </div>
  );
};

export const Honesty: React.FC<{text: string; show: boolean}> = ({text, show}) =>
  show ? <div style={{position: 'absolute', left: 70, top: 1340, fontFamily: TYPE, fontSize: 28, color: C.card, opacity: 0.8, textShadow: '0 1px 6px rgba(0,0,0,0.7)'}}>{text}</div> : null;
