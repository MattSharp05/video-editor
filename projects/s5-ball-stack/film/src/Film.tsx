import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
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

const LINES = [
  'Drop a basketball with a tennis ball on top.',
  'How high does the tennis ball fly?',
  'Back to your hand? Twice as high?',
  'Pause and guess.',
  'Over the [rim!]',
  "Here's why. The basketball squashes into the ground",
  'and springs back up, with the tennis ball still falling onto it.',
  "So the tennis ball is launched off a ball that's rushing up underneath it.",
  'With perfect bouncy balls, it could leave',
  'almost [three] [times] as fast as it fell.',
  'And three times the speed means [nine] [times] the height.',
  "Real balls lose some bounce, so it's more like three or four times.",
  'Still over the [rim.]',
  'Try it outside.',
];

const useAssets = () => {
  const [a, setA] = useState<Assets | null>(null);
  const [h] = useState(() => delayRender('assets'));
  useEffect(() => {
    const l = new GLTFLoader(); const tl = new THREE.TextureLoader();
    const T: [string, string, boolean][] = [['asphaltD', 'tex/asphalt_01_diff.jpg', true], ['asphaltR', 'tex/asphalt_01_rough.jpg', false], ['asphaltN', 'tex/asphalt_01_nor_gl.jpg', false],
      ['brickD', 'tex/brick_4_diff.jpg', true], ['brickR', 'tex/brick_4_rough.jpg', false], ['brickN', 'tex/brick_4_nor_gl.jpg', false]];
    Promise.all([
      Promise.all(['models/basketball.glb', 'models/tennis.glb', 'models/hoop.glb'].map((p) => l.loadAsync(staticFile(p)))),
      Promise.all(T.map(([, p, srgb]) => tl.loadAsync(staticFile(p)).then((x) => { if (srgb) x.colorSpace = THREE.SRGBColorSpace; return x; }))),
    ]).then(([[basketball, tennis, hoop], txs]) => {
      const tex: Record<string, THREE.Texture> = {}; T.forEach(([k], i) => (tex[k] = txs[i]));
      setA({basketball, tennis, hoop, tex}); continueRender(h);
    });
  }, [h]);
  return a;
};

const project = (t: number, p: [number, number, number], w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(50, w / h, 0.02, 8000);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.set(...c.pos); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};

const Label: React.FC<{t: number; p: [number, number, number]; o: number; text: string; color: string; size?: number; dx?: number; align?: 'left' | 'right' | 'center'; sub?: string}> = ({t, p, o, text, color, size = 50, dx = 0, align = 'left', sub}) => {
  const {width, height} = useVideoConfig();
  if (o <= 0.01) return null;
  const q = project(t, p, width, height);
  // keep the label inside the safe width (estimate its width from the text): a left-aligned label slides left
  const wEst = text.length * size * 0.52;
  if (align === 'left') q.x = Math.min(q.x, 1010 - wEst - dx);
  const tx = align === 'left' ? '0' : align === 'right' ? '-100%' : '-50%';
  return (
    <div style={{position: 'absolute', left: q.x + dx, top: q.y, transform: `translate(${tx},-50%) translateY(${(1 - o) * 12}px)`, opacity: o, textAlign: align,
      font: `800 ${size}px ${SANS}`, color, whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.75), 0 0 24px rgba(0,0,0,0.45)'}}>
      {text}
      {sub && <div style={{font: `700 ${Math.round(size * 0.6)}px ${SANS}`, color: '#ffffff', opacity: 0.85}}>{sub}</div>}
    </div>
  );
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const assets = useAssets();
  const shot = TL.shotAt(t);
  const A = shot === 'A', D = shot === 'D';
  const broke = (y: number) => (t >= TL.crossT(y) ? 0 : 1);
  const y1 = TL.START_Y, y2 = TL.LAUNCH_Y + 2 * TL.D;
  const hand = A ? TL.handLine(t) * broke(y1) : 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.3}>
        {assets && (
          <ThreeCanvas width={width} height={height} gl={{antialias: true}} shadows>
            <Scene t={t} assets={assets} />
          </ThreeCanvas>
        )}
      </Finish>
      {assets && <>
        <Label t={t} p={[0.52, y1, TL.BAR_Z]} o={hand} dx={14} text={t < TL.B.back - 0.1 ? 'your hand' : 'back to your hand?'} color={TL.GLASS} size={44} />
        <Label t={t} p={[0.52, y2, TL.BAR_Z]} o={A ? TL.bar2(t) * broke(y2) : 0} dx={14} text="twice as high?" color={TL.GLASS} size={44} />
        <Label t={t} p={[0, TL.Q_Y, TL.BAR_Z]} o={A ? TL.qMark(t) * broke(TL.Q_Y) : 0} text="?" color={TL.GLASS} size={120} align="center" />
        <Label t={t} p={[0.08, TL.LAUNCH_Y + 2.2 * TL.UNIT, 0]} o={D ? TL.arrowLabel(t) : 0} dx={20} text="≈3× speed" sub="perfect bounce" color={TL.LIME} size={54} />
        <Label t={t} p={[0.62, TL.START_Y, TL.BAR_Z]} o={D ? 0.8 * TL.guessBack(t) : 0} dx={10} text="your guess: 1×" color={TL.GLASS} size={36} />
        <Label t={t} p={[0.62, y2, TL.BAR_Z]} o={D ? 0.8 * TL.guessBack(t) : 0} dx={10} text="2×" color={TL.GLASS} size={36} />
        <Label t={t} p={[-0.12 - 1.5 * TL.UNIT, TL.LAUNCH_Y + 3.4 * TL.UNIT, 0]} o={D ? TL.squareLabel(t) : 0} text="3 × 3 = 9" color={TL.LIME} size={60} align="center" />
        <Label t={t} p={[0.35, TL.PEAK_IDEAL - 0.5, 0]} o={D ? TL.idealLabel(t) : 0} dx={10} text="9× higher" sub="perfect bounce" color={TL.LIME} size={64} />
        <Label t={t} p={[0.25, TL.PEAK_REAL + 0.2, 0]} o={D ? TL.realLabel(t) : 0} dx={10} text="real balls: 3–4×" color={TL.LIME} size={58} />
      </>}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.LIME} font={SANS} scrimAlpha={0.75} />}
    </AbsoluteFill>
  );
};
