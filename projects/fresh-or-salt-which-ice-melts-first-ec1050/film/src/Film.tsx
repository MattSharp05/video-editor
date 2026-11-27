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
const B = TL.BLUE, A = TL.AMBER, Y = TL.GOLD;

const LINES = [
  'Two ice cubes,', '[fresh] water and [salt] water.', 'Which melts first?',
  'Pause and guess.', 'Most people pick salt,', 'because salt melts ice on roads.',
  'But the cube in [fresh] water', '[melts] [first.|#FFD35A]',
  'Watch the [blue] [meltwater.]', 'Cold water is heavier than warm water,', 'so it [sinks.]',
  '[Warmer|#FFA43A] [water|#FFA43A] comes up in its place,', 'and melts the cube faster.',
  'In salt water, the meltwater', 'is [lighter] than the salty water.',
  'So it [floats] on top,', 'and wraps the cube', 'in a [cold] [blanket.]',
  'So salt does not always win.', 'Try it at home with two glasses.',
];
const sh = '0 0 14px rgba(0,0,0,0.85), 0 0 30px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.7)';
const Card: React.FC<{y: number; o: number; size?: number; children: React.ReactNode}> = ({y, o, size = 74, children}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: 540, top: y, transform: `translate(-50%,-50%) translateY(${interpolate(o, [0, 1], [14, 0])}px) scale(${interpolate(o, [0, 1], [0.96, 1])})`, opacity: o,
      font: `800 ${size}px ${SANS}`, color: '#fff', letterSpacing: -0.5, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.05, textShadow: sh,
      padding: '18px 36px', borderRadius: 28, background: 'rgba(14,16,22,0.78)', boxShadow: '0 0 40px rgba(4,8,18,0.35)', border: '1.5px solid rgba(255,255,255,0.16)'}}>
      {children}
    </div>
  );
const Tag: React.FC<{x: number; y: number; o: number; color?: string; size?: number; children: React.ReactNode}> = ({x, y, o, color = '#fff', size = 50, children}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: Math.min(Math.max(x, 170), 910), top: Math.min(Math.max(y, 600), 1440), transform: 'translate(-50%,-50%)', opacity: o,
      font: `800 ${size}px ${SANS}`, color, textShadow: `${sh}, 0 0 22px ${color}55`, whiteSpace: 'nowrap', padding: '6px 18px', borderRadius: 18, background: 'rgba(14,16,22,0.6)'}}>
      {children}
    </div>
  );

const proj = (c: TL.Cam, p: THREE.Vector3, w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(c.fov, w / h, 0.5, 2000); cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld(); const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const shot = TL.shotAt(t), T = TL.BEATS, c = TL.camAt(t);
  const P = (x: number, y: number, z: number) => proj(c, new THREE.Vector3(x, y, z), width, height);
  const fT = P(TL.GX.fresh, TL.GH + 2.2, 0), sT = P(TL.GX.salt, TL.GH + 2.2, 0);
  const fM = P(TL.GX.fresh, 4.5, 0), sM = P(TL.GX.salt, 4.5, 0);
  const labels = (o: number, size = 50) => <>
    <Tag x={fT.x} y={fT.y} o={o} size={size}>FRESH</Tag>
    <Tag x={sT.x} y={sT.y} o={o} size={size}>SALT</Tag>
  </>;
  const clock = TL.raceClock(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0}>
        <ThreeCanvas width={width} height={height} gl={{antialias: true}} shadows>
          <Scene t={t} />
        </ThreeCanvas>
      </Finish>
      {shot === 'hook' && <>
        {labels(1)}
        <Card y={1350} o={1} size={78}>WHICH <span style={{color: B}}>MELTS</span> FIRST?</Card>
        <Tag x={540} y={1470} o={TL.ramp(t, T.which - 0.2, T.which + 0.05)} size={46}>BOTH AT ROOM TEMPERATURE</Tag>
      </>}
      {shot === 'guess' && <>
        {labels(1)}
        <Tag x={fM.x} y={fM.y} o={TL.ramp(t, T.pause, T.pause + 0.3)} size={70}>?</Tag>
        <Tag x={sM.x} y={sM.y} o={TL.ramp(t, T.pause + 0.2, T.pause + 0.5)} size={70} color={TL.ramp(t, T.most, T.most + 0.2) > 0.5 ? Y : '#fff'}>?</Tag>
        <Card y={1350} o={TL.ramp(t, T.pause - 0.05, T.pause + 0.25)} size={78}>PAUSE AND <span style={{color: Y}}>GUESS</span></Card>
        <Tag x={sM.x} y={sM.y + 110} o={TL.ramp(t, T.most - 0.1, T.most + 0.1)} size={52} color={Y}>MOST PICK SALT</Tag>
      </>}
      {shot === 'road' && <>
        <Tag x={540} y={640} o={TL.ramp(t, TL.CUT.road + 0.1, TL.CUT.road + 0.4)} size={52}>ROAD SALT ON ICE</Tag>
        <Card y={1350} o={TL.ramp(t, T.because + 0.3, T.because + 0.55)} size={66}>SALT <span style={{color: B}}>MELTS</span> ROAD ICE</Card>
      </>}
      {shot === 'race' && <>
        {labels(1)}
        <Tag x={540} y={1465} o={TL.ramp(t, TL.CUT.race + 0.1, TL.CUT.race + 0.3) * (1 - TL.ramp(t, T.first - 0.3, T.first - 0.1))} size={44}>⏱ TIME-LAPSE</Tag>
        <Tag x={fM.x} y={fM.y} o={TL.ramp(t, T.first + 0.6, T.first + 0.9)} size={40} color={Y}>GONE</Tag>
        <Tag x={sM.x} y={sM.y} o={TL.ramp(t, T.first + 0.6, T.first + 0.9)} size={40}>STILL HERE</Tag>
        <Card y={1350} o={TL.ramp(t, T.first - 0.1, T.first + 0.2)} size={80}><span style={{color: Y}}>FRESH</span> WINS</Card>
      </>}
      {shot === 'fresh' && <>
        <Tag x={300} y={720} o={TL.ramp(t, TL.CUT.fresh + 0.05, TL.CUT.fresh + 0.25) * (1 - TL.ramp(t, T.cold - 0.3, T.cold - 0.1))} size={50}>↺ FRESH, REPLAY</Tag>
        <Tag x={540} y={640} o={TL.fade(t, T.cold - 0.1, 0.2, T.warm, 0.3)} size={54}><span style={{color: B}}>COLD</span> = HEAVY ↓</Tag>
        <Card y={1430} o={TL.ramp(t, T.warm - 0.1, T.warm + 0.2)} size={62}><span style={{color: A}}>WARM WATER</span> RISES ↑</Card>
      </>}
      {shot === 'salt' && <>
        <Tag x={780} y={720} o={TL.ramp(t, TL.CUT.salt + 0.05, TL.CUT.salt + 0.25)} size={50}>↺ SALT, REPLAY</Tag>
        <Tag x={540} y={1430} o={TL.fade(t, T.lighter - 0.1, 0.2, T.blanket - 0.2, 0.3)} size={48}><span style={{color: B}}>LIGHTER</span> THAN SALT WATER ↑</Tag>
        <Card y={1350} o={TL.ramp(t, T.blanket - 0.1, T.blanket + 0.2)} size={78}><span style={{color: B}}>COLD</span> BLANKET</Card>
      </>}
      {shot === 'end' && <>
        {labels(TL.ramp(t, TL.CUT.end + 0.2, TL.CUT.end + 0.5))}
        <Tag x={fM.x} y={fM.y} o={TL.ramp(t, TL.CUT.end + 0.2, TL.CUT.end + 0.5)} size={40} color={Y}>GONE</Tag>
        <Tag x={sM.x} y={sM.y} o={TL.ramp(t, TL.CUT.end + 0.2, TL.CUT.end + 0.5)} size={40}>STILL HERE</Tag>
        <Card y={1290} o={TL.ramp(t, TL.CUT.end, TL.CUT.end + 0.25)} size={60}>SALT DOESN'T ALWAYS WIN</Card>
        <Card y={1420} o={TL.ramp(t, T.tryIt - 0.1, T.tryIt + 0.2)} size={70}><span style={{color: Y}}>TRY IT</span> AT HOME</Card>
      </>}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={B} font={SANS} />}
    </AbsoluteFill>
  );
};
