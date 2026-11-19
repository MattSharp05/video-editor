import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
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
  'In 1982, a puzzle like this tripped up the S.A.T.',
  'Roll one coin around another the same size.',
  'How many times does it [turn?]',
  'Pause and guess.',
  'Looks like once, right?',
  'Watch the [arrow.]',
  "Halfway round, it's already turned [once.]",
  'All the way round: [twice.]',
  'Roll it along a straight strip: just [once.]',
  'Bend the strip into a circle,',
  'and the bend adds a [turn.]',
  'The 1982 test used a circle a third as wide.',
  'Three turns, plus one for the circle.',
  '[Four.] The key said three,',
  "and four wasn't a choice.",
  'Three students caught it,',
  'and three hundred thousand scores were recalculated.',
];

// Load every texture once, outside the canvas, and mount the canvas only when all are ready.
const useAssets = () => {
  const [a, setA] = useState<Assets | null>(null);
  const [h] = useState(() => delayRender('textures'));
  useEffect(() => {
    const l = new THREE.TextureLoader();
    Promise.all(['models/wood_table_diff_1k.jpg', 'models/wood_table_nor_gl_1k.jpg'].map((p) => l.loadAsync(staticFile(p))))
      .then(([wood, woodN]) => { setA({wood, woodN}); continueRender(h); });
  }, [h]);
  return a;
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const assets = useAssets();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.25}>
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
