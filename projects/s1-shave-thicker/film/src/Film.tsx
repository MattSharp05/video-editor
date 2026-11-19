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

const LINES = [
  'Watch what this razor actually cuts.',
  "You've probably heard shaving makes hair grow back [thicker.|#FF5A4E]",
  "But a razor only cuts the hair at your skin's [surface.]",
  'The [root] that grows the hair sits deeper, and the blade never touches it.',
  'So why does stubble feel thicker?',
  "A hair that's never been cut ends in a fine, [tapered] tip.",
  'Shaving slices it straight across, and leaves a [blunt] end.',
  '[Same] [width.] It just feels coarser.',
  'Scientists tested this in [1928,] and again in [1970.]',
  "Hair didn't grow faster, and in [1970,] not thicker either.",
  '[Hormones] at [puberty] thicken hair, around when many start shaving.',
  "So shave or don't. Shaving won't change your hair.",
];

export const project = (t: number, p: THREE.Vector3, w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(50, w / h, 0.02, 400);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};

const Label: React.FC<{o: number; x: number; y: number; color: string; size?: number; children: React.ReactNode}> = ({o, x, y, color, size = 52, children}) => o > 0.01 ? (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) translateY(${interpolate(o, [0, 1], [12, 0])}px)`, opacity: o,
    font: `800 ${size}px ${SANS}`, color, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.1, textShadow: `0 0 14px rgba(0,0,0,0.85), 0 0 26px rgba(0,0,0,0.6), 0 0 22px ${color}55`}}>{children}</div>) : null;

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const w = TL.world(t); const P = (v: TL.V3) => project(t, new THREE.Vector3(...v), width, height);
  const r = TL.ramp;
  const myth = w === 'skin' ? TL.mythSwell(t) : 0;
  const cutLab = w === 'skin' && t < TL.CUT_END ? TL.cutLineGlow(t) : 0;
  const rootLab = w === 'section' ? TL.rootGlow(t) : 0, depth = w === 'section' ? TL.depthLabel(t) : 0;
  const rp = P([0.2, -3.0, 0]);
  const inside = w === 'section' ? TL.insideLab(t) : 0;
  const tipL = w === 'tips' ? r(t, TL.B.tapered - 0.3, TL.B.tapered + 0.1) * (1 - r(t, TL.B.same - 0.6, TL.B.same - 0.3)) : 0;
  const tipR = w === 'tips' ? r(t, TL.B.blunt - 0.3, TL.B.blunt + 0.1) * (1 - r(t, TL.B.same - 0.6, TL.B.same - 0.3)) : 0;
  const cl = w === 'tips' ? Math.max(TL.caliper(t), TL.caliper2(t) * (t > TL.B.didnt ? 1 : 0)) : 0;
  const mv = TL.caliper2(t) > 0 ? 1 : TL.caliperMove(t);
  const jp = P([-TL.TIP_X + 2 * TL.TIP_X * mv, 0.42, 0]);
  const calName = w === 'tips' ? r(t, TL.B.same - 0.5, TL.B.same - 0.2) * (1 - r(t, TL.B.same + 1.2, TL.B.same + 1.5)) : 0;
  const fing = w === 'tips' ? TL.fingerOn(t) * (1 - r(t, TL.B.coarser + 1.0, TL.B.coarser + 1.3)) : 0;
  const pokes = w === 'tips' ? r(t, TL.B.coarser + 0.6, TL.B.coarser + 0.9) * (1 - r(t, TL.B.tested - 0.4, TL.B.tested - 0.1)) : 0;
  const days = w === 'tips' ? r(t, TL.B.tested + 0.7, TL.B.tested + 1.0) : 0;
  const study = w === 'tips' ? TL.studyOn(t) : 0, result = w === 'tips' ? TL.resultOn(t) : 0;
  const ending = w === 'skin' && t >= TL.CUT_END ? r(t, TL.B.stays - 0.2, TL.B.stays + 0.3) : 0;
  const pubLab = w === 'skin' && t >= TL.CUT_END ? r(t, TL.B.puberty - 0.2, TL.B.puberty + 0.2) * (1 - r(t, TL.B.shaveOr - 0.3, TL.B.shaveOr)) : 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.25}>
        <ThreeCanvas width={width} height={height} gl={{antialias: true}}>
          <Scene t={t} />
        </ThreeCanvas>
      </Finish>
      <Label o={myth} x={540} y={1380} color={TL.CORAL} size={68}>thicker?</Label>
      <Label o={cutLab} x={540} y={1400} color={TL.AMBER} size={54}>cut at the surface</Label>
      <Label o={rootLab} x={rp.x + 230} y={rp.y} color={TL.AMBER} size={50}>living root</Label>
      <Label o={depth} x={540} y={1440} color="#EAF6FF" size={48}>a few mm below the blade</Label>
      <Label o={inside} x={540} y={1440} color="#EAF6FF" size={52}>inside the skin</Label>
      <Label o={tipL} x={215} y={1240} color="#EAF6FF" size={46}>uncut:<br />tapered</Label>
      <Label o={tipR} x={830} y={1240} color={TL.CORAL} size={46}>shaved:<br />blunt</Label>
      <Label o={calName} x={540} y={1470} color="#EAF6FF" size={46}>caliper</Label>
      <Label o={cl} x={jp.x - 190} y={jp.y + 10} color={TL.AMBER} size={50}>0.15 mm</Label>
      <Label o={fing} x={540} y={1470} color="#EAF6FF" size={46}>fingertip</Label>
      <Label o={pokes} x={700} y={1150} color={TL.CORAL} size={48}>blunt end pokes</Label>
      <Label o={days * (1 - result)} x={540} y={1470} color="#EAF6FF" size={50}>{`1928 · 1970 tests: day ${Math.max(1, Math.round(1 + 13 * TL.grow(t)))}`}</Label>
      <Label o={result} x={540} y={1470} color={TL.AMBER} size={50}>not faster · 1970: not thicker</Label>
      <Label o={pubLab} x={540} y={1420} color={TL.AMBER} size={58}>puberty: hormones</Label>
      <Label o={ending} x={540} y={1420} color={TL.AMBER} size={62}>same hair, blunt tip</Label>
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.AMBER} font={SANS} />}
    </AbsoluteFill>
  );
};
