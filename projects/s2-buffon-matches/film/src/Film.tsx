import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Scene, type Assets} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';
import {N} from './sim';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

// caption sense units; [bracketed] words carry the accent
export const LINES = [
  'Drop matches on a floor,',
  'and counting them can find [pi.]',
  'Each match is exactly as long',
  'as a floorboard is wide.',
  'What share land across a crack?',
  'Pause and guess.',
  'Most of them: about [two] [in] [three.]',
  "Here's why: bend a wire",
  'into a hoop as wide as a board.',
  'Wherever it lands,',
  'it crosses the cracks [twice.]',
  "Straighten it: it's [pi] matches long.",
  'Cut it into matches and scatter them:',
  'still [two] crossings, on average.',
  'So each match has a two-in-pi chance:',
  '[sixty-four] [percent.]',
  'Count the crossings,',
  'and you can estimate [pi.]',
  'Twenty thousand matches:',
  '[three] [point] [one] [four.]',
];

// Load the board atlas once, outside the canvas, and mount the canvas only when it is ready.
const useAssets = () => {
  const [a, setA] = useState<Assets | null>(null);
  const [h] = useState(() => delayRender('boards'));
  useEffect(() => {
    const img = new Image(); img.onload = () => { setA({boards: img}); continueRender(h); }; img.src = staticFile('tex/boards.jpg');
  }, [h]);
  return a;
};

const fmt = (n: number) => n.toLocaleString('en-US');
const shadow = '0 2px 10px rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.5)';

const Labels: React.FC<{t: number}> = ({t}) => (
  <>
    {TL.labels(t).filter((l) => l.o > 0.01).map((l) => {
      const p = TL.project(t, l.at);
      return (
        <div key={l.id} style={{position: 'absolute', left: p.x, top: p.y, transform: `translate(-50%, -50%) translateY(${(1 - l.o) * 10}px)`,
          opacity: l.o, color: l.color, fontFamily: SANS, fontWeight: 800, fontSize: l.size, whiteSpace: 'nowrap', textShadow: shadow, letterSpacing: 0.5}}>
          {l.text}
        </div>
      );
    })}
  </>
);

// the hall's running count: π ≈ 2 × matches ÷ crossings, from the film's one seeded run
const Count: React.FC<{t: number}> = ({t}) => {
  if (t < TL.CUT_HALL) return null;
  const o = TL.ramp(t, TL.CUT_HALL + 0.5, TL.CUT_HALL + 0.9), {n, c, pi} = TL.count(t), fin = TL.finalPi(t);
  const nShow = t > TL.B.three14 - 0.2 ? N : n;
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 1150, padding: '26px 0 30px', borderRadius: 28, background: 'rgba(14,9,5,0.62)', textAlign: 'center', fontFamily: SANS, opacity: o, textShadow: shadow}}>
      <div style={{color: '#F2E8DA', fontSize: 46, fontWeight: 700}}>π ≈ 2 × matches ÷ crossings</div>
      <div style={{color: TL.AMBER, fontSize: 64, fontWeight: 800, marginTop: 14, fontVariantNumeric: 'tabular-nums'}}>
        2 × {fmt(nShow)} ÷ {fmt(c)} = {pi.toFixed(3)}
      </div>
      <div style={{color: TL.ICE, fontSize: 50, fontWeight: 800, marginTop: 14, opacity: fin}}>π = 3.14159…</div>
    </div>
  );
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const assets = useAssets();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.15}>
        {assets && (
          <ThreeCanvas width={width} height={height} gl={{antialias: true}} shadows>
            <Scene t={t} assets={assets} />
          </ThreeCanvas>
        )}
      </Finish>
      <AbsoluteFill><Labels t={t} /><Count t={t} /></AbsoluteFill>
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.AMBER} font={SANS} />}
    </AbsoluteFill>
  );
};
