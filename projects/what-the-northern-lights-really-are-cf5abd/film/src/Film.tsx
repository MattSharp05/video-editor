import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import * as THREE from 'three';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {useEarth} from './kit/globe';
import {Scene, sph, ovalColat} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

const LINES = [
  'The Northern Lights are',
  "the [Sun's] [wind] crashing into our sky.",
  'The Sun blows out a stream',
  'of tiny [charged] [bits.]',
  'We call it the [solar] [wind.]',
  "Earth's [magnetic] [field] pushes most of it away.",
  'But it steers some of it',
  'down toward the [poles.]',
  'There, about a [hundred] [kilometers] up,',
  'the bits [slam] into the air.',
  'Oxygen glows [green.|#5CFF8F]',
  'Higher up, it glows [red.|#FF5A6A]',
  'Nitrogen adds [blue|#8FA8FF] and [purple.|#B48CFF]',
  'So every curtain of light',
  "is the [Sun's] [wind,] lighting up our air.",
];

const project = (t: number, p: THREE.Vector3, w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(c.fov, w / h, 0.0001, 100);
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ((c.roll * Math.PI) / 180); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
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

// height ruler beside the curtain in the slice shot: ticks at real altitudes, projected from the world
const Ruler: React.FC<{t: number; w: number; h: number}> = ({t, w, h}) => {
  const o = TL.rulerOn(t); if (o <= 0.01) return null;
  const lon = TL.SLICE_LON + 0.02 + 0.08 * TL.ramp(t, TL.CUT_SLICE, TL.CUT_END, (x) => x);
  const cl = ovalColat(lon);
  const at = (km: number) => project(t, sph(cl, lon, 1 + km * TL.KM), w, h);
  const x0 = 120;
  const ticks = [100, 200, 300].map((km) => ({km, y: at(km).y}));
  const top = ticks[2].y, bot = ticks[0].y + 60;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: x0, top, width: 5, height: Math.max(0, bot - top), background: 'rgba(235,242,255,0.85)', boxShadow: '0 0 10px rgba(0,0,0,0.9)'}} />
      {ticks.map((k) => (
        <div key={k.km} style={{position: 'absolute', left: x0 - 14, top: k.y - 2, width: 33, height: 5, background: 'rgba(235,242,255,0.9)'}}>
          <div style={{position: 'absolute', left: 46, top: -22, font: `800 40px ${SANS}`, color: '#EAF2FF', textShadow: shadow, whiteSpace: 'nowrap'}}>{`${k.km} km`}</div>
        </div>
      ))}
    </div>
  );
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const earth = useEarth();
  const shot = TL.shotAt(t);
  const B = TL.BEATS;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.35}>
        {earth && (
          <ThreeCanvas width={width} height={height} gl={{logarithmicDepthBuffer: true, antialias: true}}>
            <Scene t={t} earth={earth} />
          </ThreeCanvas>
        )}
      </Finish>
      {shot === 'hook' && <Tag x={width / 2} y={1380} o={TL.hookTag(t)} color={TL.AMBER} size={84}>the Sun's wind</Tag>}
      {shot === 'sun' && <>
        <Tag x={width / 2} y={1380} o={TL.fade(t, B.charged - 0.1, 0.3, B.call, 0.25)} color="#FFFFFF" size={56}>tiny <span style={{color: TL.AMBER}}>charged bits</span></Tag>
        <Tag x={width / 2} y={1380} o={TL.windTag(t)} color={TL.AMBER} size={96}>SOLAR WIND</Tag>
      </>}
      {shot === 'field' && <>
        <Tag x={width / 2} y={1380} o={TL.shieldTag(t)} color={TL.CYAN} size={62}>magnetic field</Tag>
        <Tag x={width / 2} y={1380} o={TL.polesTag(t)} color="#FFFFFF" size={62}>down to the <span style={{color: TL.GREEN}}>poles</span></Tag>
        <Tag x={width / 2} y={1560} o={0.8 * TL.fade(t, TL.CUT_FIELD, 0.4, TL.CUT_SLICE, 0.2)} color="#C8D6F0" size={36}>sizes not to scale</Tag>
      </>}
      {(shot === 'slice' || shot === 'end') && <Ruler t={t} w={width} h={height} />}
      {(shot === 'slice' || shot === 'end') && <>
        <Tag x={width - 90} y={1180} o={TL.oxyTag(t)} color={TL.GREEN} size={60} anchor="right">oxygen: green</Tag>
        <Tag x={width - 90} y={1270} o={TL.redTag(t)} color={TL.RED} size={60} anchor="right">higher oxygen: red</Tag>
        <Tag x={width - 90} y={1360} o={TL.nitTag(t)} color={TL.PURPLE} size={60} anchor="right">nitrogen: blue + purple</Tag>
      </>}
      {shot === 'end' && <Tag x={width / 2} y={1420} o={TL.endTag(t)} color="#FFFFFF" size={64}><span style={{color: TL.AMBER}}>Sun's wind</span> + our <span style={{color: TL.GREEN}}>air</span> = aurora</Tag>}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.AMBER} font={SANS} />}
    </AbsoluteFill>
  );
};
