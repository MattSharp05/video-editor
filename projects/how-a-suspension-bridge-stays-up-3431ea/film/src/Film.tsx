import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import * as THREE from 'three';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Scene} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);
const C = TL.CYAN, A = TL.AMBER;

const LINES = [
  'A bridge this long', 'should [snap.]', "Here's why it doesn't.",
  'A flat road this long,', 'on its own,', 'would [sag] and [break.|#FF4433]',
  "So the road doesn't", 'stand on legs.', 'It [hangs.]',
  'Rows of thin cables', 'hold it up.',
  'They hang from two', 'huge main cables.',
  'Steel cable is very strong', 'when you [pull] it.', 'That pull is [tension.]',
  'The main cables run', 'over two tall towers.',
  'The towers get pressed', 'straight [down.|#FFB020]', 'That push is [compression.|#FFB020]',
  'At each end,', 'giant concrete [anchors]', 'hold the cables back.',
  'Each Golden Gate main cable', 'is made of [27,572]', 'steel wires.',
  'The road hangs,', 'the cables [pull,]', 'the towers [push,|#FFB020]', 'the anchors hold them back.',
  "That's why it doesn't [snap.]",
];

const sh = '0 0 14px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.8)';
const Card: React.FC<{y: number; o: number; size?: number; children: React.ReactNode; pill?: boolean}> = ({y, o, size = 74, children, pill = true}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: 540, top: y, transform: `translate(-50%,-50%) translateY(${interpolate(o, [0, 1], [14, 0])}px) scale(${interpolate(o, [0, 1], [0.96, 1])})`, opacity: o,
      font: `800 ${size}px ${SANS}`, color: '#fff', letterSpacing: -0.5, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.05, textShadow: sh,
      padding: pill ? '18px 36px' : 0, borderRadius: 28, background: pill ? 'rgba(10,12,18,0.58)' : 'none', boxShadow: pill ? '0 0 40px rgba(4,8,18,0.45)' : 'none', border: pill ? '1.5px solid rgba(255,255,255,0.14)' : 'none'}}>
      {children}
    </div>
  );
const Tag: React.FC<{x: number; y: number; o: number; color: string; size?: number; children: React.ReactNode}> = ({x, y, o, color, size = 50, children}) =>
  o <= 0.01 || x < 60 || x > 1020 || y < 560 || y > 1480 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: o,
      font: `800 ${size}px ${SANS}`, color, textShadow: `${sh}, 0 0 22px ${color}66`, whiteSpace: 'nowrap', padding: '6px 16px', borderRadius: 18, background: 'rgba(10,12,18,0.55)'}}>
      {children}
    </div>
  );

const proj = (c: TL.Cam, p: THREE.Vector3, w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(c.fov, w / h, 0.05, 40000); cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld(); const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, z: v.z};
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const shot = TL.shotAt(t), B = TL.BEATS, c = TL.camAt(t);
  const P = (x: number, y: number, z: number) => proj(c, new THREE.Vector3(x, y, z), width, height);
  const twr = P(-TL.HALF, 150, TL.CAB_Z), anc = P(-(TL.ANCH_X + 31), TL.DECK_Y + 6, 0), mid = P(-470, TL.cableY(-470) + 12, TL.CAB_Z);
  const recT = P(-TL.HALF, 200, TL.CAB_Z), recA = P(-(TL.ANCH_X + 31), TL.DECK_Y, 0), recH = P(-330, 90, TL.CAB_Z);
  const n = Math.round(27572 * TL.ramp(t, B.num - 0.1, B.wires + 0.3, TL.lin));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0}>
        <ThreeCanvas width={width} height={height} gl={{logarithmicDepthBuffer: true, antialias: true}} shadows>
          <Scene t={t} />
        </ThreeCanvas>
      </Finish>
      {shot === 'hook' && <Card y={1340} o={TL.hookCard(t)} size={78}>GOLDEN GATE: <span style={{color: C}}>1,280 M</span></Card>}
      {shot === 'hook' && <Card y={1440} o={TL.ramp(t, 0.4, 0.8) * 0.9} size={40} pill={false}>(stand-in model)</Card>}
      {shot === 'sag' && <Card y={1340} o={TL.ramp(t, B.flat + 0.9, B.flat + 1.2)} size={78}>NO CABLES: <span style={{color: TL.RED}}>SNAP</span></Card>}
      {shot === 'hangs' && <Card y={1340} o={TL.ramp(t, B.hangs - 0.1, B.hangs + 0.2)} size={84}>IT <span style={{color: C}}>HANGS</span></Card>}
      {shot === 'tension' && <>
        <Card y={1340} o={TL.ramp(t, B.tension, B.tension + 0.3)} size={84}><span style={{color: C}}>TENSION</span></Card>
        <Tag x={mid.x} y={mid.y - 60} o={TL.ramp(t, B.pull - 0.2, B.pull + 0.2)} color={C} size={46}>PULL →</Tag>
      </>}
      {shot === 'compress' && <>
        <Card y={1340} o={TL.ramp(t, B.comp, B.comp + 0.3)} size={80}><span style={{color: A}}>COMPRESSION</span></Card>
        <Tag x={twr.x + 150} y={twr.y} o={TL.ramp(t, B.down - 0.2, B.down + 0.2)} color={A} size={46}>PUSH ↓</Tag>
      </>}
      {shot === 'anchors' && <Tag x={anc.x} y={anc.y - 150} o={TL.ramp(t, B.anchors, B.anchors + 0.3)} color={C} size={48}>CONCRETE ANCHOR</Tag>}
      {shot === 'wires' && <>
        <Card y={1340} o={TL.ramp(t, B.num - 0.2, B.num + 0.1)} size={74}>GOLDEN GATE: <span style={{color: C}}>{n.toLocaleString('en-US')}</span> WIRES</Card>
        <Card y={1440} o={TL.ramp(t, B.gg + 0.3, B.gg + 0.7) * 0.9} size={40} pill={false}>one main cable, cut open (drawn)</Card>
      </>}
      {shot === 'recap' && <>
        <Tag x={recH.x + 190} y={recH.y + 90} o={TL.ramp(t, B.rHang, B.rHang + 0.3)} color="#fff" size={40}>ROAD HANGS</Tag>
        <Tag x={recT.x + 200} y={recT.y - 30} o={TL.ramp(t, B.rPull, B.rPull + 0.3)} color={C} size={40}>CABLES PULL</Tag>
        <Tag x={recT.x - 190} y={recT.y + 40} o={TL.ramp(t, B.rPush, B.rPush + 0.3)} color={A} size={40}>TOWERS PUSH</Tag>
        <Tag x={Math.max(recA.x + 120, 200)} y={Math.min(recA.y, 1420)} o={TL.ramp(t, B.rHold, B.rHold + 0.3)} color={C} size={40}>ANCHORS HOLD</Tag>
      </>}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={C} font={SANS} />}
    </AbsoluteFill>
  );
};
