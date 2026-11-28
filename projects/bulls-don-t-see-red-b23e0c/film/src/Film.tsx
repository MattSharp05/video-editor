import React, {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, delayRender, continueRender} from 'remotion';
import * as THREE from 'three';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Scene, Assets, loadAssets} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

// caption sense units; [key] words take the accent (gold = movement), [word|#hex] its own colour
export const LINES = [
  "Bulls don't hate [red,|#FF3B3B]",
  "they can't even see it as [red.|#FF3B3B]",
  'Your eyes have [three] kinds of colour cells.',
  "A bull's eyes have only [two.]",
  'With only two, red and green',
  'look [almost] [the] [same] to a bull.',
  'So this bright [red|#FF3B3B] cape',
  'looks [dull] [and] [brownish] to a bull.',
  'Then why does it [charge?]',
  'In a test, a bull charged',
  '[red,|#FF3B3B] [blue,|#6E9BFF] and [white] flags just the [same.]',
  'It chased the cowboys who [moved]',
  'and ignored the man in [red|#FF3B3B] standing [still.]',
  "It's not the colour.",
  "It's the [movement.]",
  'The red is for the crowd.',
  "To a bull, it's just a dull cape",
  'that [moves.]',
];

const shadow = '0 0 14px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.8)';
const Card: React.FC<{y: number; o: number; size?: number; color?: string; children: React.ReactNode}> = ({y, o, size = 84, color = '#fff', children}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center', opacity: o, transform: `translateY(${interpolate(o, [0, 1], [14, 0])}px)`,
      font: `800 ${size}px ${SANS}`, letterSpacing: -1, color, textShadow: shadow, lineHeight: 1.05}}>
      <span style={{display: 'inline-block', padding: '10px 26px', borderRadius: 26, background: 'rgba(20,10,6,0.55)', boxShadow: '0 0 40px rgba(20,10,6,0.5)'}}>{children}</span></div>
  );
const Tag: React.FC<{x: number; y: number; o: number; c: string; size?: number; children: React.ReactNode}> = ({x, y, o, c, size = 54, children}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * o})`, opacity: o,
      padding: '10px 26px', borderRadius: 40, background: 'rgba(20,10,6,0.7)', border: `3px solid ${c}`, boxShadow: `0 0 30px ${c}55`,
      font: `900 ${size}px ${SANS}`, color: c, textShadow: shadow, whiteSpace: 'nowrap'}}>{children}</div>
  );

// the split: a bright line with "YOU" on the left and "BULL" on the right
const Split: React.FC<{t: number}> = ({t}) => {
  const x = TL.split(t); if (x > 1.02) return null;
  const lab = TL.sideLabels(t); const px = x * 1080;
  return (
    <>
      <div style={{position: 'absolute', left: px - 3, top: 0, width: 6, height: 1920, background: '#fff', boxShadow: '0 0 18px rgba(255,255,255,0.9), 0 0 4px #fff', opacity: 0.95}} />
      {lab > 0.01 && <>
        <div style={{position: 'absolute', left: px - 30, top: 1330, transform: 'translateX(-100%)', opacity: lab, font: `900 50px ${SANS}`, color: '#fff', textShadow: shadow, textAlign: 'right', lineHeight: 1}}>
          YOUR<br />EYES</div>
        <div style={{position: 'absolute', left: px + 30, top: 1330, opacity: lab, font: `900 50px ${SANS}`, color: TL.DULL, textShadow: shadow, lineHeight: 1}}>
          BULL<br />EYES</div>
      </>}
    </>
  );
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const [assets, setAssets] = useState<Assets | null>(null);
  const [handle] = useState(() => delayRender('bull model'));
  useEffect(() => { loadAssets().then((a) => { setAssets(a); continueRender(handle); }); }, [handle]);
  const shot = TL.shotAt(t);
  return (
    <AbsoluteFill style={{background: '#6a5034'}}>
      <Finish fr={fr} bloom={0.25}>
        {assets && <ThreeCanvas width={width} height={height} gl={{antialias: true}} shadows
          onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; gl.shadowMap.type = THREE.PCFSoftShadowMap; }}>
          <Scene t={t} assets={assets} />
        </ThreeCanvas>}
      </Finish>
      <Split t={t} />
      {shot === 'hook' && <Card y={600} o={TL.hookCard(t)} size={92}>BULLS DON'T<br />SEE <span style={{color: TL.RED}}>RED</span></Card>}
      {shot === 'eye' && <>
        <Tag x={300} y={1300} o={TL.countYou(t)} c="#ffffff" size={64}>YOU: 3</Tag>
        <Tag x={780} y={1300} o={TL.countBull(t)} c={TL.DULL} size={64}>BULL: 2</Tag>
        <Card y={1480} o={TL.countYou(t)} size={46} color="#f3e6d8">COLOUR CELLS IN THE EYE</Card>
      </>}
      {shot === 'plate' && <Card y={600} o={TL.plateCard(t)} size={92}><span style={{color: TL.RED}}>RED</span> ≈ <span style={{color: '#4CC35A'}}>GREEN</span></Card>}
      {shot === 'cape' && <Card y={600} o={TL.capeCard(t)} size={80}>DULL <span style={{color: TL.DULL}}>BROWN</span></Card>}
      {shot === 'flags' && <>
        <Card y={560} o={TL.sameCard(t)} size={84}>SAME <span style={{color: TL.GOLD}}>CHARGE</span></Card>
        {['RED', 'BLUE', 'WHITE'].map((n, i) => <Tag key={n} x={220 + i * 320} y={1400} o={TL.flagTick(t, i)} c={['#FF4B4B', '#6E9BFF', '#ffffff'][i]} size={46}>✓ {n}</Tag>)}
      </>}
      {shot === 'motion' && <>
        <Card y={560} o={TL.motionCard(t)} size={84}>IT CHASES <span style={{color: TL.GOLD}}>MOTION</span></Card>
        <Card y={1500} o={TL.illusTag(t)} size={38} color="#f3e6d8">MythBusters test (illustration)</Card>
      </>}
      {shot === 'impact' && <Card y={560} o={TL.notRedCard(t)} size={92}>NOT RED.<br /><span style={{color: TL.GOLD}}>MOTION.</span></Card>}
      {shot === 'end' && <Card y={560} o={TL.endCard(t)} size={80}>THE <span style={{color: TL.RED}}>RED</span> IS<br />FOR THE CROWD</Card>}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.GOLD} font={SANS} />}
    </AbsoluteFill>
  );
};
