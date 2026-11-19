import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Scene, type Assets} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

// caption sense units; [bracketed] words carry the accent
export const LINES = [
  'Nearly a thousand PhDs wrote in',
  'to say this answer was wrong.',
  'Three doors:',
  'a [car] behind one, goats behind the others.',
  'You pick door one.',
  'The host knows where the car is,',
  "and always opens a goat door you didn't pick.",
  'Should you [switch] to door two?',
  'Pause and guess.',
  'It feels like fifty-fifty.',
  'Now try a hundred doors.',
  'Your pick is a one-in-a-hundred chance.',
  'The host always opens ninety-eight goat doors.',
  'The one door he left shut',
  'holds the other [ninety-nine] chances.',
  'With three doors, switching wins [two] times out of three.',
  'Marilyn vos Savant was right:',
  '[always] [switch.]',
];

// Load both models once, outside the canvas, and mount the canvas only when all are ready.
const useAssets = () => {
  const [a, setA] = useState<Assets | null>(null);
  const [h] = useState(() => delayRender('models'));
  useEffect(() => {
    const l = new GLTFLoader();
    Promise.all(['models/goat.glb', 'models/car.glb'].map((p) => l.loadAsync(staticFile(p))))
      .then(([goat, car]) => { setA({goat, car}); continueRender(h); });
  }, [h]);
  return a;
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const assets = useAssets();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.3}>
        {assets && (
          <ThreeCanvas width={width} height={height} gl={{antialias: true}}>
            <Scene t={t} assets={assets} />
          </ThreeCanvas>
        )}
      </Finish>
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.AMBER} font={SANS} />}
    </AbsoluteFill>
  );
};
