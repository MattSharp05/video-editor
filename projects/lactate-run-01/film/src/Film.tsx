// Lactate run 01: one canvas (world.ts) + captions from the voice + honesty tag + audio.
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {drawFrame, isIllustration, AMBER} from './world';
import words from './words.json';
import B from './beats.json';

export const FPS = 30;
export const DUR = Math.ceil(B.total * FPS);

const LINES = [
  'Most people think lactic acid', 'is just waste from running hard.',
  "But actually, it's [fuel.]",
  'When you run, your muscles', 'break down sugar to make energy.',
  'At an easy pace, tiny engines in your muscles', 'burn almost all of it.',
  'But when you run hard,', 'sugar breaks down super fast.', "The tiny engines can't keep up.",
  'So the extra turns into [lactate,]', 'and some spills into your blood.',
  'Your heart, your brain, and other muscles', 'grab it and burn it again.',
  'So why do your legs burn?', 'Hard running makes acid and other leftovers.', 'Together, they make the burn', 'and help slow you down.',
  'Run fast enough, and [lactate] piles up', 'faster than you can use it.', 'That pace is your [lactate] [threshold.]',
  'Training pushes that line.', 'One big reason:', 'you grow more tiny engines.',
  "So [lactate] isn't trash.", "It's [fuel,]", 'and fit runners burn even more of it.',
];

const Canvas: React.FC<{t: number}> = ({t}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [h] = useState(() => delayRender('fonts for canvas'));
  useEffect(() => { document.fonts.ready.then(() => { setReady(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => {
    if (!ready || !ref.current) return;
    const ctx = ref.current.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    drawFrame(ctx, t);
  }, [t, ready]);
  return <canvas ref={ref} width={1080} height={1920} style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />;
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const t = useCurrentFrame() / FPS;
  const ill = isIllustration(t);
  return (
    <AbsoluteFill style={{background: '#2a2050'}}>
      <Canvas t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1452, textAlign: 'center', fontFamily: SANS, fontSize: 28, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase', color: '#fff', opacity: ill ? 0.8 : 0, textShadow: '0 1px 10px rgba(0,0,0,0.8)'}}>Illustration</div>
      {captions && <Captions t={t} words={words} lines={LINES} accent={AMBER} font={SANS} scrim="22,12,30" scrimAlpha={0.6} />}
      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};
