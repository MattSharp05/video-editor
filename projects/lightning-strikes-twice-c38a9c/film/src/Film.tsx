import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Scene, flashAt} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

export const LINES = [
  'Lightning never strikes twice?',
  'This building gets hit',
  'over [twenty] times a year.',
  'So why does lightning keep',
  'picking the [same] [place?]',
  'A storm cloud fills up',
  'with electric charge.',
  'To reach the ground, it sends',
  'a spark down in [short] [jumps.]',
  'As it gets close, tall things',
  'send sparks [up] to meet it.',
  'The [first] spark to touch it',
  'makes the [path.]',
  'Then the bright flash',
  'rushes along that [path.]',
  'A tall, pointed tower is',
  'the [closest] point to the cloud.',
  'So it wins again and again.',
  'The Empire State Building gets hit',
  'about [twenty] to [twenty-five] times a year.',
  'So lightning does [strike] [twice.]',
  'It often strikes where',
  'the path is [shortest.]',
];

const shadow = '0 0 14px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.8)';
const Card: React.FC<{y: number; o: number; size?: number; color?: string; children: React.ReactNode}> = ({y, o, size = 84, color = '#fff', children}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center', opacity: o, transform: `translateY(${interpolate(o, [0, 1], [14, 0])}px)`,
      font: `800 ${size}px ${SANS}`, letterSpacing: -1, color, textShadow: shadow, lineHeight: 1.05}}>{children}</div>
  );

// strike tally: a pill under the tower, one tick per strike that has landed
const Tally: React.FC<{n: number; o: number; label: string}> = ({n, o, label}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{padding: '18px 40px', borderRadius: 40, background: 'rgba(4,10,22,0.68)', border: `2px solid ${TL.CYAN}55`, boxShadow: `0 0 30px ${TL.CYAN}22`,
        font: `800 52px ${SANS}`, color: '#fff', textShadow: shadow, display: 'flex', gap: 22, alignItems: 'baseline'}}>
        <span style={{color: '#cfe0ff', fontSize: 40}}>{label}</span>
        <span style={{color: TL.CYAN, fontSize: 86, minWidth: 90, textAlign: 'center'}}>{n}</span>
      </div>
    </div>
  );

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const shot = TL.shotAt(t);
  const fl = Math.min(1, flashAt(t));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.55}>
        <ThreeCanvas width={width} height={height} gl={{antialias: true}}>
          <Scene t={t} />
        </ThreeCanvas>
        <AbsoluteFill style={{background: `rgba(210,225,255,${0.1 * fl * fl})`, mixBlendMode: 'screen'}} />
      </Finish>
      {shot === 'hook' && <>
        <Card y={1130} o={TL.hookCard(t)} size={92}>HIT <span style={{color: TL.CYAN}}>20+</span> TIMES A YEAR</Card>
        <Tally n={TL.tallyAt(t)} o={TL.hookCard(t)} label="strikes" />
      </>}
      {shot === 'why' && <Card y={1250} o={TL.sameCard(t)} size={80}>SAME PLACE. <span style={{color: TL.CYAN}}>AGAIN.</span></Card>}
      {shot === 'contact' && <Card y={1250} o={TL.firstCard(t)} size={78}>FIRST TO TOUCH <span style={{color: TL.CYAN}}>WINS</span></Card>}
      {shot === 'gap' && <Card y={540} o={TL.gapCard(t)} size={74}><span style={{color: TL.CYAN}}>SHORTEST GAP</span><br />TO THE CLOUD</Card>}
      {shot === 'again' && <Tally n={TL.tallyAt(t)} o={TL.ramp(t, TL.CUT_AGAIN, TL.CUT_AGAIN + 0.2)} label="strikes" />}
      {shot === 'year' && <>
        <Tally n={TL.yearCount(t)} o={TL.ramp(t, TL.CUT_YEAR + 0.1, TL.CUT_YEAR + 0.3)} label="in one year" />
        <Card y={1450} o={TL.yearCard(t)} size={76}><span style={{color: TL.CYAN}}>20–25</span> STRIKES A YEAR</Card>
        <Card y={1110} o={TL.ramp(t, TL.CUT_YEAR + 0.2, TL.CUT_YEAR + 0.5)} size={40} color="#d8e2f5">Empire State Building (stand-in model)</Card>
      </>}
      {shot === 'end' && <Card y={1250} o={TL.endCard(t)} size={96}>IT STRIKES <span style={{color: TL.CYAN}}>TWICE</span></Card>}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.CYAN} font={SANS} />}
    </AbsoluteFill>
  );
};
