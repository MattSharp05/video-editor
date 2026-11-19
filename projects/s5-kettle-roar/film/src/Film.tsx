import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {Label, type CamState} from './kit/label';
import {SANS} from './kit/fonts';
import {Scene, type Assets} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

const LINES = [
  'Watch this kettle get [loud,] then go [quieter.]',
  "That roar means your kettle isn't [boiling] yet.",
  "Here's why.",
  'The water touching the [hot] element boils first,',
  'into tiny bubbles of [steam.]',
  'But the water above it is [cooler,]',
  'so each bubble rises, cools, and [collapses] back into water.',
  'All those tiny collapses, ringing through the kettle:',
  "that's the [roar.]",
  'Once all the water is near [100] degrees,',
  'the bubbles [survive] to the top and pop gently.',
  'So the roar means [not] [yet.]',
  'The quieter bubbling is the [boil,] right before the click.',
];

const useAssets = () => {
  const [a, setA] = useState<Assets | null>(null);
  const [h] = useState(() => delayRender('assets'));
  useEffect(() => {
    const l = new GLTFLoader();
    Promise.all(['models/kettle.glb', 'models/kitchen.glb'].map((p) => l.loadAsync(staticFile(p))))
      .then(([kettle, kitchen]) => { setA({kettle, kitchen}); continueRender(h); });
  }, [h]);
  return a;
};

const Card: React.FC<{text: string; o: number; top?: number}> = ({text, o, top = 1330}) => (o <= 0.01 ? null : (
  <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)`}}>
    <div style={{padding: '14px 30px', borderRadius: 18, background: 'rgba(10,12,16,0.78)', font: `900 60px ${SANS}`, color: '#fff', letterSpacing: 1, whiteSpace: 'nowrap'}}>{text}</div>
  </div>
));
const Chip: React.FC<{text: string; o: number}> = ({text, o}) => (o <= 0.01 ? null : (
  <div style={{position: 'absolute', left: 70, top: 560, opacity: o, padding: '10px 24px', borderRadius: 16, background: 'rgba(10,12,16,0.75)', font: `800 50px ${SANS}`, color: '#fff'}}>{text}</div>
));

export const Film: React.FC<{captions?: boolean; debugCam?: number[]}> = ({captions = true, debugCam}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const assets = useAssets();
  const shot = TL.shotAt(t);
  const cam = TL.camAt(t) as CamState;
  const split = shot === 'S';
  const sl = TL.splitLabels(t);
  const M = (x: number, y: number, z: number): [number, number, number] => [TL.MAC.x + x, TL.MAC.y + y, TL.MAC.z + z];
  const K = (x: number, y: number, z: number): [number, number, number] => [TL.KET.x + x, TL.KET.y + y, TL.KET.z + z];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.3}>
        {assets && !split && (
          <ThreeCanvas width={width} height={height} gl={{antialias: true}} shadows>
            <Scene t={t} assets={assets} debugCam={debugCam} />
          </ThreeCanvas>
        )}
        {assets && split && (['L', 'R'] as const).map((p) => (
          <div key={p} style={{position: 'absolute', top: 0, left: p === 'L' ? 0 : width / 2, width: width / 2, height}}>
            <ThreeCanvas width={width / 2} height={height} gl={{antialias: true}} shadows>
              <Scene t={t} assets={assets} panel={p} />
            </ThreeCanvas>
          </div>
        ))}
      </Finish>
      {split && <div style={{position: 'absolute', left: width / 2 - 3, top: 0, width: 6, height, background: '#0b0d12'}} />}
      {assets && <>
        {TL.cards(t).map((c) => <Card key={c.text} text={c.text} o={c.o} />)}
        <Chip text="▶▶ minutes later" o={TL.fwdChip(t)} />
        <Chip text="◀◀ back to the roar" o={TL.backChip(t)} />
        {/* macro labels */}
        <Label cam={cam} p={M(-0.35, 0.06, 0.3)} o={shot === 'X' ? TL.macroLabels.hot(t) : 0} text="over 100 °C" sub="water on the hot plate" color="#FF7A5A" font={SANS} size={50} align="center" dy={110} />
        <Label cam={cam} p={M(0.3, 0.45, 0)} o={shot === 'X' ? TL.macroLabels.cool(t) : 0} text="cooler water" color="#8FC2FF" font={SANS} size={50} align="center" />
        {/* the glass close: 100 C on the water */}
        <Label cam={cam} p={K(0.07, 0.13, 0.05)} o={shot === 'G' ? TL.ramp(t, TL.B.survive + 0.1, TL.B.survive + 0.4) : 0} text="100 °C" color="#FFB070" font={SANS} size={56} align="left" />
        {/* the split ending */}
        {split && <>
          <div style={{position: 'absolute', left: 0, width: width / 2, top: 1300, display: 'flex', justifyContent: 'center', opacity: sl.L}}>
            <div style={{padding: '12px 22px', borderRadius: 16, background: 'rgba(10,12,16,0.8)', font: `900 48px ${SANS}`, color: '#FF6A4A', textAlign: 'center', lineHeight: 1.1}}>ROAR:<br />NOT YET</div>
          </div>
          <div style={{position: 'absolute', left: width / 2, width: width / 2, top: 1300, display: 'flex', justifyContent: 'center', opacity: sl.R}}>
            <div style={{padding: '12px 22px', borderRadius: 16, background: 'rgba(10,12,16,0.8)', font: `900 48px ${SANS}`, color: '#7CE6A0', textAlign: 'center', lineHeight: 1.1}}>QUIETER:<br />BOILING</div>
          </div>
        </>}
      </>}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent="#FF9A3C" font={SANS} scrimAlpha={0.72} />}
    </AbsoluteFill>
  );
};
