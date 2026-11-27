import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import * as THREE from 'three';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Scene} from './Scene';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {continueRender, delayRender, staticFile} from 'remotion';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);
const C = TL.CYAN, A = TL.ORANGE;

const LINES = [
  'Goldfish forget everything', 'in [three] [seconds?]', 'Not even close.',
  'Scientists in England', 'gave goldfish a little [lever.]',
  '[Push] the lever,', 'and [food] drops in.',
  'Then they made it harder.', 'The food came for just', '[one] [hour] a day.',
  'So the fish learned [the] [time.]', 'They pushed the lever more', 'as feeding time came close.',
  'In Germany, scientists taught goldfish', 'that certain [smells]', 'meant food.',
  '[Three] [months] later,', 'the fish still knew those smells.',
  'So the three-second memory', 'is a [myth.|#FF8A2A]', 'Goldfish remember', 'for [months.]',
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
  o <= 0.01 || x < 60 || x > 1020 || y < 520 || y > 1480 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: o,
      font: `800 ${size}px ${SANS}`, color, textShadow: `${sh}, 0 0 22px ${color}66`, whiteSpace: 'nowrap', padding: '6px 16px', borderRadius: 18, background: 'rgba(10,12,18,0.55)'}}>
      {children}
    </div>
  );

const proj = (c: TL.Cam, p: THREE.Vector3, w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(c.fov, w / h, 0.5, 2000); cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld(); const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, z: v.z};
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const shot = TL.shotAt(t), B = TL.BEATS, c = TL.camAt(t);
  const P = (x: number, y: number, z: number) => proj(c, new THREE.Vector3(x, y, z), width, height);
  const lv = P(TL.LEVER_X, TL.LEVER_TIP[1] + 4, TL.LEVER_Z), ck = P(TL.CLOCK[0], TL.CLOCK[1] + TL.CLOCK_R + 4, TL.CLOCK[2]);
  const cl = TL.cloudCentre(t, shot), cp = P(cl[0], cl[1] + 9, cl[2]);
  const timer = TL.hookTimer(t);
  const [gltf, setGltf] = React.useState<any>(null); const [err, setErr] = React.useState('');
  React.useEffect(() => { const h = delayRender('goldfish model');
    new GLTFLoader().loadAsync(staticFile('models/comet-goldfish.glb')).then((g) => { setGltf(g); continueRender(h); }).catch((e) => { setErr(String(e)); continueRender(h); }); }, []);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0}>
        <ThreeCanvas width={width} height={height} gl={{antialias: true}} shadows>
          <Scene t={t} gltf={gltf} />
        </ThreeCanvas>
      </Finish>
      {shot === 'hook' && <>
        <Card y={1340} o={1} size={70}><span style={{color: A}}>3-SECOND</span> MEMORY?</Card>
        <Card y={1460} o={TL.ramp(t, B.not - 0.05, B.not + 0.2)} size={62}>NOT EVEN <span style={{color: C}}>CLOSE</span></Card>
        <Card y={560} o={1 - TL.ramp(t, B.not + 0.3, B.not + 0.6)} size={88}><span style={{color: timer > 0 ? '#fff' : A}}>{timer.toFixed(1)} s</span></Card>
      </>}
      {shot === 'lever' && <>
        <Tag x={300} y={600} o={TL.ramp(t, B.sci, B.sci + 0.3)} color="#fff" size={52}>ENGLAND, 1994</Tag>
        <Tag x={Math.min(Math.max(lv.x + 170, 260), 860)} y={lv.y + 40} o={TL.fade(t, B.lever, 0.3, B.food + 0.2, 0.3)} color="#fff" size={48}>LEVER</Tag>
        <Card y={1340} o={TL.ramp(t, B.food - 0.1, B.food + 0.2)} size={76}><span style={{color: C}}>PUSH</span> = FOOD</Card>
      </>}
      {shot === 'clock' && <>
        <Tag x={Math.min(Math.max(ck.x, 230), 850)} y={ck.y - 20} o={TL.ramp(t, TL.CUT.clock + 0.1, TL.CUT.clock + 0.4)} color="#fff" size={44}>24-HOUR CLOCK</Tag>
        <Card y={1340} o={TL.ramp(t, B.hour - 0.1, B.hour + 0.2)} size={70}>FOOD: <span style={{color: C}}>1 HOUR</span> A DAY</Card>
        <Tag x={Math.min(Math.max(lv.x, 200), 880)} y={lv.y - 150} o={TL.ramp(t, B.then + 0.6, B.then + 0.8) * (1 - TL.ramp(t, B.hour - 0.3, B.hour))} color="#fff" size={44}>PUSH... NOTHING</Tag>
      </>}
      {shot === 'learn' && <>
        <Card y={1340} o={TL.ramp(t, B.time - 0.1, B.time + 0.2)} size={66}>IT LEARNED <span style={{color: C}}>THE TIME</span></Card>
        <Tag x={Math.min(Math.max(lv.x, 230), 850)} y={lv.y - 170} o={TL.ramp(t, B.pushed - 0.2, B.pushed + 0.1)} color="#fff" size={46}>PUSHES: {TL.pushCount(t)}</Tag>
      </>}
      {shot === 'smell' && <>
        <Tag x={300} y={600} o={TL.ramp(t, B.germ, B.germ + 0.3)} color="#fff" size={52}>GERMANY, 1993</Tag>
        <Card y={1340} o={TL.ramp(t, B.meant - 0.1, B.meant + 0.2)} size={76}><span style={{color: C}}>SMELL</span> = FOOD</Card>
      </>}
      {shot === 'later' && <>
        <Card y={600} o={1 - TL.ramp(t, B.still + 0.2, B.still + 0.5)} size={64}>DAY <span style={{color: C}}>{TL.dayCount(t)}</span></Card>
        <Card y={1340} o={TL.ramp(t, B.three, B.three + 0.3)} size={70}><span style={{color: C}}>3 MONTHS</span> LATER</Card>
        <Card y={1460} o={TL.ramp(t, B.still + 0.4, B.still + 0.7)} size={56}>FISH <span style={{color: C}}>STILL KNOWS IT</span></Card>
      </>}
      {shot === 'end' && <>
        <Card y={1300} o={TL.ramp(t, B.isMyth - 0.1, B.isMyth + 0.2)} size={62}>3 SECONDS? <span style={{color: A}}>MYTH</span></Card>
        <Card y={1420} o={TL.ramp(t, B.rem, B.rem + 0.3)} size={76}><span style={{color: C}}>MONTHS</span>, NOT SECONDS</Card>
      </>}
      {err && <div style={{position: 'absolute', top: 900, left: 40, color: 'red', font: '30px sans-serif'}}>{err}</div>}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={C} font={SANS} />}
    </AbsoluteFill>
  );
};
