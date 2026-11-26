import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import * as THREE from 'three';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {useEarth} from './kit/globe';
import {Scene, macroCount} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

const LINES = [
  'Sunlight is every color.',
  'So why does the sky choose [blue?]',
  'The answer is the [air.]',
  'It is full of tiny gas molecules.',
  'When sunlight hits them,',
  'the molecules [bounce] it in new directions.',
  'But they bounce [blue] light',
  'about [five] [times] more than red.',
  'Red mostly keeps going straight.',
  'Blue gets [scattered] all across the sky.',
  'So wherever you look up,',
  '[blue] light is coming at you.',
  'At sunset, the light crosses',
  '[much] [more] [air] to reach you.',
  'Along the way, most of the blue',
  'gets [bounced] [aside.]',
  'Only the reds and oranges are left.',
  "The sky doesn't choose blue.",
  'The air [scatters] it to you.',
];

// screen position of a world point with the scene's space camera
const project = (t: number, p: THREE.Vector3, w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(c.fov, w / h, 0.01, 100);
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};

const shadow = '0 0 14px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.8)';
const Tag: React.FC<{x: number; y: number; o: number; color: string; size?: number; children: React.ReactNode; anchor?: 'left' | 'center' | 'right'}> = ({x, y, o, color, size = 52, children, anchor = 'center'}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0'},-50%) translateY(${interpolate(o, [0, 1], [12, 0])}px)`, opacity: o,
      font: `800 ${size}px ${SANS}`, color, textShadow: `${shadow}, 0 0 22px ${color}66`, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.05}}>
      {children}
    </div>
  );

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const earth = useEarth();
  const shot = TL.shotAt(t);
  const noonS = shot === 'sunset' ? project(t, new THREE.Vector3(...TL.NOON_P), width, height) : {x: 0, y: 0};
  const duskS = shot === 'sunset' ? project(t, new THREE.Vector3(...TL.DUSK_P), width, height) : {x: 0, y: 0};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.3}>
        {earth && (
          <ThreeCanvas width={width} height={height} gl={{logarithmicDepthBuffer: true, antialias: true}}>
            <Scene t={t} earth={earth} />
          </ThreeCanvas>
        )}
      </Finish>
      {shot === 'hook' && <>
        <Tag x={width / 2} y={1330} o={TL.hookCard(t)} color="#FFFFFF" size={60}>white light = every color</Tag>
        <Tag x={width / 2} y={1420} o={TL.hookCard(t) * TL.ramp(t, TL.BEATS.choose - 0.2, TL.BEATS.choose + 0.2)} color={TL.BLUE} size={96}>why blue?</Tag>
      </>}
      {shot === 'macro' && <MacroTally t={t} />}
      {shot === 'sunset' && <>
        <Tag x={noonS.x + 40} y={noonS.y - 75} o={TL.noonTag(t)} color="#FFFFFF" size={50} anchor="left">noon: short trip</Tag>
        <Tag x={Math.min(duskS.x + 40, width - 90)} y={duskS.y + 120} o={TL.duskTag(t)} color={TL.ORANGE} size={54} anchor="right">sunset: long trip</Tag>
      </>}
      {shot === 'end' && <Tag x={width / 2} y={1420} o={TL.endTag(t)} color="#FFFFFF" size={70}><span style={{color: '#7FB8FF'}}>blue</span> = scattered light</Tag>}
      {shot === 'sky' && <Tag x={width / 2} y={1330} o={TL.fade(t, TL.BEATS.look, 0.3, TL.CUT_SUNSET, 0.2)} color="#FFFFFF" size={58}>blue from every direction</Tag>}
      {shot === 'sunset' && <Tag x={width / 2} y={1470} o={0.85} color="#C8D6F0" size={38}>air drawn thicker than real</Tag>}
      {shot === 'dusk' && <Tag x={width / 2} y={1330} o={TL.fade(t, TL.BEATS.reds, 0.3, TL.CUT_END, 0.2)} color="#FFFFFF" size={62}>only <span style={{color: '#FF8A3C'}}>red + orange</span> arrive</Tag>}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.BLUE} font={SANS} />}
    </AbsoluteFill>
  );
};

// live counts of ricochets in the macro shot, from the same simulation that draws them
const MacroTally: React.FC<{t: number}> = ({t}) => {
  const o = TL.tallyOn(t); if (o <= 0.01) return null;
  const {b, r} = macroCount(t, TL.BEATS.but + 0.2);
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 1250, padding: '22px 0 90px', borderRadius: 34, background: 'rgba(2,8,24,0.62)', boxShadow: '0 0 40px rgba(2,8,24,0.6)', display: 'flex', justifyContent: 'center', gap: 70, opacity: o, font: `800 54px ${SANS}`, textShadow: shadow}}>
      <div style={{color: '#7FB8FF'}}>blue bounces <span style={{fontSize: 74}}>{b}</span></div>
      <div style={{color: TL.RED}}>red <span style={{fontSize: 74}}>{r}</span></div>
      {TL.fiveTag(t) > 0.01 && <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', color: '#FFFFFF', fontSize: 64, opacity: TL.fiveTag(t)}}><span style={{color: '#7FB8FF'}}>blue</span>: about 5× more</div>}
    </div>
  );
};
