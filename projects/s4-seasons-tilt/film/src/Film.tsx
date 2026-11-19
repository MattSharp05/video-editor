import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {useEarth, ll} from './kit/globe';
import {Scene, type Assets} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

const LINES = [
  "Lots of people think it's summer",
  'when Earth is closest to the Sun.',
  "But we're closest in early [January,]",
  'in winter up north.',
  "The real reason is Earth's [tilt.]",
  'In June, the north leans toward the Sun.',
  'Follow one beam of sunlight.',
  'In summer, it hits almost [straight] down.',
  'All its heat lands on one small patch.',
  'In winter, the Sun sits low.',
  'The same beam hits at a [slant]',
  'and spreads over about twice the ground.',
  'So every patch gets about [half] the heat.',
  "That's why it's summer in New York",
  "while it's winter in Sydney.",
  "It's not how close the Sun is.",
  "It's mostly how [straight] its light hits.",
];

const useAssets = () => {
  const [a, setA] = useState<Assets | null>(null);
  const [h] = useState(() => delayRender('models'));
  useEffect(() => {
    new GLTFLoader().loadAsync(staticFile('models/barn.glb')).then((barn) => { setA({barn}); continueRender(h); });
  }, [h]);
  return a;
};

// screen position of a world point, using the scene's camera
const project = (t: number, p: THREE.Vector3, w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(50, w / h, 0.05, 20000);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};

const shadow = '0 0 14px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.8)';
const Tag: React.FC<{x: number; y: number; o: number; color: string; size?: number; children: React.ReactNode; strike?: number; anchor?: 'left' | 'center'}> = ({x, y, o, color, size = 52, children, strike = 0, anchor = 'left'}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'center' ? '-50%' : '0'},-50%) translateY(${interpolate(o, [0, 1], [12, 0])}px)`, opacity: o,
      font: `800 ${size}px ${SANS}`, color, textShadow: `${shadow}, 0 0 22px ${color}66`, whiteSpace: 'nowrap'}}>
      {children}
      {strike > 0 && <div style={{position: 'absolute', left: -6, top: '52%', height: 7, width: `calc(${strike * 100}% + 12px)`, background: TL.CORAL, borderRadius: 4, boxShadow: '0 0 10px rgba(255,90,78,0.7)'}} />}
    </div>
  );

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const assets = useAssets();
  const earth = useEarth();
  const space = !TL.inMeadow(t);
  // anchors for the tags
  const ep = TL.earthPos(t), eq = TL.earthQ(t);
  const at = (v: THREE.Vector3) => project(t, v, width, height);
  const earthS = space ? at(ep) : {x: 0, y: 0};
  // Earth's screen radius: project a point one radius along the camera's up vector
  const camUp = (() => { const c = TL.camAt(t); const f = new THREE.Vector3(...c.look).sub(new THREE.Vector3(...c.pos)).normalize(); const r = f.clone().cross(new THREE.Vector3(...c.up)).normalize(); return r.cross(f).normalize(); })();
  const earthR = space ? Math.abs(earthS.y - at(ep.clone().addScaledVector(camUp, TL.EARTH_R)).y) : 0;
  const nyS = space ? at(ll(TL.NY, TL.EARTH_R).applyQuaternion(eq).add(ep)) : {x: 0, y: 0};
  const sydS = space ? at(ll(TL.SYD, TL.EARTH_R).applyQuaternion(eq).add(ep)) : {x: 0, y: 0};
  const arcS = space ? at(ep.clone().add(new THREE.Vector3(0.6, TL.EARTH_R * 1.55, 0))) : {x: 0, y: 0};
  const tileA = !space ? at(new THREE.Vector3(0, 0.3, -2.1)) : {x: 0, y: 0};
  const tileB = !space ? at(new THREE.Vector3(0, 0.3, 2.1)) : {x: 0, y: 0};
  const janS = space ? at(TL.orbitPos(TL.PERI, TL.E_TRUE)) : {x: 0, y: 0};
  const orbitS = space ? at(new THREE.Vector3(0, 0, 0)) : {x: 0, y: 0};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.25}>
        {assets && earth && (
          <ThreeCanvas width={width} height={height} gl={{logarithmicDepthBuffer: true, antialias: true}} shadows>
            <Scene t={t} assets={assets} earth={earth} />
          </ThreeCanvas>
        )}
      </Finish>
      {space && <>
        <Tag x={earthS.x} y={earthS.y + earthR + 55} o={TL.mythTag(t)} color={TL.CORAL} anchor="center">closest = summer?</Tag>
        <Tag x={earthS.x} y={earthS.y - earthR - 60} o={TL.janTag(t)} anchor="center" color={TL.GLASS} size={58}>JAN 3</Tag>
        <Tag x={earthS.x} y={earthS.y - earthR - 125} o={TL.winterTag(t)} color={TL.ICE} size={50} anchor="center">winter in the north</Tag>
        <Tag x={width / 2} y={1440} o={TL.closerTag(t)} color={TL.GLASS} size={46} anchor="center">only 3% closer than in July</Tag>
        <Tag x={arcS.x + 20} y={arcS.y} o={TL.tiltArc(t)} color={TL.AMBER} size={56}>23.4°</Tag>
        <Tag x={janS.x} y={janS.y - 70} o={TL.lapJanTag(t)} color={TL.GLASS} size={44} anchor="center">JAN</Tag>
        <Tag x={earthS.x} y={earthS.y - earthR - 60} o={TL.junTag(t)} color={TL.GLASS} size={58} anchor="center">JUN 21</Tag>
        <Tag x={width / 2} y={Math.max(560, earthS.y - earthR - 70)} o={TL.nyTag(t)} color={TL.AMBER} size={58} anchor="center">New York: summer</Tag>
        <Tag x={width / 2} y={Math.min(1460, earthS.y + earthR + 70)} o={TL.sydTag(t)} color={TL.ICE} size={58} anchor="center">Sydney: winter</Tag>
        <Tag x={width / 2} y={1000} o={TL.distWord(t)} color={TL.CORAL} size={64} strike={TL.distStrike(t)} anchor="center">distance</Tag>
        <Tag x={width / 2} y={1110} o={TL.angleWord(t)} color={TL.AMBER} size={72} anchor="center">angle</Tag>
      </>}
      {!space && <>
        <Tag x={tileA.x} y={tileA.y - 230} o={TL.count100(t)} color={TL.AMBER} size={72} anchor="center">100% heat</Tag>
        <Tag x={width / 2} y={600} o={TL.summerRef(t)} color={TL.GLASS} size={50} anchor="center">summer patch: 100%</Tag>
        <Tag x={tileA.x} y={tileA.y - 230} o={TL.count46(t)} color={TL.AMBER} size={68} anchor="center">46%</Tag>
        <Tag x={tileB.x} y={tileB.y - 230} o={TL.count46(t)} color={TL.AMBER} size={68} anchor="center">46%</Tag>
      </>}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.AMBER} font={SANS} />}
    </AbsoluteFill>
  );
};
