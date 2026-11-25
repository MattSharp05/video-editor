import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Scene} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

// caption sense units; [bracketed] words carry the accent
export const LINES = [
  'This hotel is [full,]', 'but it still has room for [you.]',
  'It has [endless] rooms,', 'and every room is taken.',
  'A [new] [guest] shows up.', 'Where do they go?',
  'Easy. Everyone moves', 'to the [next] [room.]',
  'Room one is free now.', 'The new guest takes it.',
  'Now an [endless] [bus] pulls up,', 'full of guests.',
  'Everyone moves to [double]', 'their room number.',
  'One goes to two,', 'two to four, three to six.',
  'Now every [odd] room is empty,', 'and the whole bus [fits.]',
  'So can every endless crowd fit in?', '[No.]',
  'One last bus:', 'every [number] between zero and one.', 'Give each a room.',
  'Build a [new] [number.]', "Change room one's first digit,", "room two's second,", 'and so on forever.',
  'It differs from every guest', 'by at least [one] [digit.]', 'So it has [no] [room.]',
  'However you fill the hotel,', 'some numbers are [left] [out.]', 'Some infinities are [bigger]', 'than others.',
];

// mount the canvas only once the fonts are in (the number boards are drawn with them)
const useReady = () => {
  const [ok, setOk] = useState(false); const [h] = useState(() => delayRender('fonts-ready'));
  useEffect(() => { document.fonts.ready.then(() => { setOk(true); continueRender(h); }); }, [h]);
  return ok;
};

const shadow = '0 2px 10px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.55)';
const Labels: React.FC<{t: number}> = ({t}) => (
  <>
    {TL.labels(t).filter((l) => l.o > 0.01).map((l) => {
      const p = TL.project(t, l.at); if (!p.front) return null;
      const x = Math.min(1000, Math.max(80, p.x)), y = Math.min(1500, Math.max(520, p.y));
      return (
        <div key={l.id} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translateY(${(1 - l.o) * 10}px)`,
          opacity: l.o, color: l.color, fontFamily: SANS, fontWeight: 800, fontSize: l.size, whiteSpace: 'nowrap', textShadow: shadow}}>{l.text}</div>
      );
    })}
  </>
);

// the title on the cover and first seconds
const Title: React.FC<{t: number}> = ({t}) => {
  const o = 1 - TL.ramp(t, 2.6, 3.2); if (o <= 0) return null;
  return <div style={{position: 'absolute', left: 60, right: 60, top: 1260, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 70, lineHeight: 1.08, color: '#F6EEDF', opacity: o, textShadow: shadow}}>
    trying to conceptualize <span style={{color: TL.AMBER}}>infinity</span></div>;
};

// the new number's card: digits copied up from each room's board (they fly from the board to their slot)
const CARD = {x: 540, y: 600};
const cardSlot = (k: number) => CARD.x - 250 + 58 * (k + 1.4);
const Card: React.FC<{t: number}> = ({t}) => {
  const o = TL.cardOn(t); if (o <= 0.01) return null;
  const n = TL.builtDigits(t);
  const fly = TL.DECIMALS.map((_, i) => {
    const k = i + 1, a = TL.pickAt(k);
    if (t < a || t > a + TL.PICK_FLY) return null;
    const u = TL.smooth((t - a) / TL.PICK_FLY);
    const w = TL.slotWorld(TL.BOARD_X, TL.doorZ(k), TL.BOARD.y, k), p = TL.project(t, w);
    const x = TL.lerp(p.x, cardSlot(k), u), y = TL.lerp(p.y - 40, CARD.y + 52, u);
    const old = TL.numDigits(k)[k - 1];
    return <div key={k} style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', fontFamily: SANS, fontWeight: 800, fontSize: 84, color: TL.AMBER, textShadow: shadow}}>
      {u < 0.45 ? old : TL.NEW_DIGITS[k - 1]}<span style={{position: 'absolute', left: 54, top: -6, fontSize: 40, opacity: Math.sin(Math.PI * Math.min(1, u * 1.6))}}>+1</span></div>;
  });
  return (
    <>
      <div style={{position: 'absolute', left: CARD.x - 320, width: 640, top: CARD.y - 20, height: 150, borderRadius: 26, background: 'rgba(14,16,24,0.72)', border: `3px solid ${TL.AMBER}66`, opacity: o}}>
        <div style={{position: 'absolute', left: 30, top: 12, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: '#E8E1D2'}}>new number</div>
      </div>
      {['0', '.', ...TL.NEW_DIGITS.slice(0, n).split('')].map((d, j) => (
        <div key={j} style={{position: 'absolute', left: j < 2 ? cardSlot(j - 1) - (j ? 6 : 0) : cardSlot(j - 1), top: CARD.y + 52, transform: 'translate(-50%,-50%)', fontFamily: SANS, fontWeight: 800, fontSize: 84, color: TL.AMBER, opacity: o, textShadow: shadow}}>{d}</div>
      ))}
      {fly}
    </>
  );
};

// on the walk: at rooms 1-3 (then faster), the plate's digit against the new number's: "1 ≠ 2"
const Neq: React.FC<{t: number}> = ({t}) => (
  <>
    {TL.DECIMALS.map((_, i) => {
      const k = i + 1, m = TL.mismatch(k, t); if (m < 0.05) return null;
      const p = TL.project(t, TL.slotWorld(TL.BOARD_X, TL.doorZ(k), TL.BOARD.y - 0.6, k)); if (!p.front) return null;
      return <div key={k} style={{position: 'absolute', left: Math.min(980, Math.max(100, p.x)), top: Math.max(560, p.y + 10), transform: 'translate(-50%,-50%)', opacity: Math.min(1, m * 1.4), fontFamily: SANS, fontWeight: 800, fontSize: 84, color: TL.AMBER, textShadow: shadow, whiteSpace: 'nowrap'}}>
        {TL.numDigits(k)[k - 1]} ≠ {TL.NEW_DIGITS[k - 1]}</div>;
    })}
  </>
);

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const ready = useReady();
  return (
    <AbsoluteFill style={{background: '#0A1020'}}>
      <Finish fr={fr} bloom={0.55}>
        {ready && (
          <ThreeCanvas width={width} height={height} gl={{antialias: true}}>
            <Scene t={t} />
          </ThreeCanvas>
        )}
      </Finish>
      <AbsoluteFill><Labels t={t} /><Card t={t} /><Neq t={t} /><Title t={t} /></AbsoluteFill>
      {captions && <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,6,12,0.55) 0px, rgba(4,6,12,0.45) 470px, rgba(4,6,12,0) 600px)'}} />}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.AMBER} font={SANS} />}
    </AbsoluteFill>
  );
};
