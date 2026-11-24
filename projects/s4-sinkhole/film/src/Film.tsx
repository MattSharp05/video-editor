import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
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
  'This road looks solid.',
  "But underneath, it's [hollow.]",
  'It starts with rain.',
  'Rain soaks up carbon dioxide',
  'from the air and soil,',
  'and turns into a weak [acid.]',
  'Under the dirt, that acid eats into limestone,',
  'a little every year,',
  'and opens up cracks and holes.',
  'The sticky clay above',
  'can hold up like an [arch,]',
  'even with empty space underneath.',
  'But bit by bit, its ceiling crumbles',
  'down into the cracks,',
  'and the empty space [climbs] [upward.]',
  'Up top, nothing looks wrong.',
  'Until the roof gets too thin to hold the weight.',
  'Then it drops [all] [at] [once.]',
  "That's why sinkholes seem to open overnight.",
  'The hole was growing for months, or [years.]',
];

const useAssets = () => {
  const [a, setA] = useState<Assets | null>(null);
  const [h] = useState(() => delayRender('models'));
  useEffect(() => { new GLTFLoader().loadAsync(staticFile('models/car.glb')).then((car) => { setA({car}); continueRender(h); }); }, [h]);
  return a;
};
const project = (t: number, p: THREE.Vector3, w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 5000);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};
const shadow = '0 0 14px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.8)';
const Tag: React.FC<{x: number; y: number; o: number; color: string; size?: number; children: React.ReactNode; box?: boolean}> = ({x, y, o, color, size = 52, children, box = false}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: Math.min(Math.max(x, 260), 820), top: y, transform: `translate(-50%,-50%) translateY(${interpolate(o, [0, 1], [12, 0])}px)`, opacity: o,
      font: `800 ${size}px ${SANS}`, color, textShadow: `${shadow}, 0 0 22px ${color}66`, whiteSpace: 'nowrap', ...(box ? {background: 'rgba(10,8,6,0.62)', padding: '8px 22px', borderRadius: 14} : {})}}>{children}</div>
  );

export const Film: React.FC<{captions?: boolean; off?: string[]}> = ({captions = true, off = []}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const assets = useAssets();
  const at = (x: number, y: number, z = 0.2) => project(t, new THREE.Vector3(x, y, z), width, height);
  const clayS = at(-6.5, -5.5), limeS = at(-6.5, -14.5), acidS = at(0, -6.5), voidS = at(0, -3);
  const lay = (a: number, b: number) => TL.ramp(t, a, a + 0.4) * (1 - TL.ramp(t, b, b + 0.4));
  const bar = TL.barOn(t), yrs = TL.barYears(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.25}>
        {assets && (
          <ThreeCanvas width={width} height={height} gl={{logarithmicDepthBuffer: true, antialias: true}} shadows>
            <Scene t={t} assets={assets} off={off} />
          </ThreeCanvas>
        )}
      </Finish>
      <Tag x={acidS.x} y={acidS.y} o={TL.acidTag(t)} color={TL.LIME} size={50} box>CO₂ + water = weak acid</Tag>
      <Tag x={clayS.x} y={clayS.y} o={lay(TL.B.clay - 0.3, TL.B.grains)} color={TL.GLASS} size={46}>clay</Tag>
      <Tag x={limeS.x} y={limeS.y} o={lay(TL.B.limestone - 0.3, TL.B.clay)} color={TL.GLASS} size={46}>limestone</Tag>
      <Tag x={width / 2} y={1460} o={TL.yearsTag(t)} color={TL.GLASS} size={52}>over thousands of years</Tag>
      <Tag x={voidS.x} y={Math.max(voidS.y, 560)} o={lay(TL.B.upTop - 0.1, TL.B.until + 0.4)} color={TL.AMBER} size={50} box>empty space</Tag>
      {bar > 0.01 && (
        <div style={{position: 'absolute', left: 90, top: 560, width: 900, opacity: bar, font: `800 34px ${SANS}`, color: TL.GLASS, textShadow: shadow, whiteSpace: 'nowrap', background: 'rgba(10,8,6,0.62)', padding: '18px 22px', borderRadius: 18}}>
          <div style={{display: 'flex', height: 34, borderRadius: 17, overflow: 'hidden', background: 'rgba(0,0,0,0.45)', boxShadow: '0 0 0 2px rgba(255,255,255,0.25)'}}>
            <div style={{width: `${96 * yrs}%`, background: TL.AMBER, boxShadow: `0 0 20px ${TL.AMBER}`}} />
            <div style={{width: '1.2%', marginLeft: `${2.8 - 0}%`, background: TL.CORAL, opacity: TL.ramp(t, TL.B.overnight, TL.B.overnight + 0.3)}} />
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', gap: 24, marginTop: 12}}>
            <span style={{color: TL.AMBER, opacity: yrs}}>growing: months to years</span>
            <span style={{color: TL.CORAL}}>collapse: seconds</span>
          </div>
        </div>
      )}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.AMBER} font={SANS} />}
    </AbsoluteFill>
  );
};
