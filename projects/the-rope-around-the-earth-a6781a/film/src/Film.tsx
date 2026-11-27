import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import * as THREE from 'three';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {useEarth} from './kit/globe';
import {useCat} from './cat';
import {Scene} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);
const C = TL.CYAN, R = TL.RED;

const LINES = [
  'One [extra] [meter] around Earth.', 'Could a [cat] crawl under?',
  'Wrap a rope tight', 'around the whole Earth.',
  'Now make it just', 'one meter [longer.]',
  'Lift it [evenly,]', 'all the way around.',
  'How big is the [gap?|#38E0FF]', 'Pause and guess.',
  'One meter, spread around', 'forty thousand kilometers,', 'sounds like nothing.',
  'But the gap is about', '[sixteen|#38E0FF] [centimeters.|#38E0FF]',
  'That is enough for a [cat]', 'to crawl under.',
  'A rope lifted [one|#38E0FF] [step|#38E0FF]', 'gets about [six] [steps] longer.',
  'So one extra meter', 'lifts it about a [sixth|#38E0FF] of a meter.',
  'And the size of the ball', '[never] matters.',
  'Around a tennis ball,', 'it is the same [sixteen|#38E0FF] [centimeters.|#38E0FF]',
  'What did you [guess?]',
];

const sh = '0 0 14px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.8)';
// a card: dark glass pill so it reads over any picture
const Card: React.FC<{y: number; o: number; size?: number; children: React.ReactNode; x?: number; pill?: boolean}> = ({y, o, size = 74, children, x, pill = true}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x ?? 540, top: y, transform: `translate(-50%,-50%) translateY(${interpolate(o, [0, 1], [14, 0])}px) scale(${interpolate(o, [0, 1], [0.96, 1])})`, opacity: o,
      font: `800 ${size}px ${SANS}`, color: '#fff', letterSpacing: -0.5, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.05, textShadow: sh,
      padding: pill ? '18px 36px' : 0, borderRadius: 28, background: pill ? 'rgba(6,12,24,0.62)' : 'none', boxShadow: pill ? '0 0 40px rgba(4,8,18,0.5)' : 'none', border: pill ? '1.5px solid rgba(255,255,255,0.14)' : 'none'}}>
      {children}
    </div>
  );
// a label pinned to a point in the picture
const Tag: React.FC<{x: number; y: number; o: number; color: string; size?: number; children: React.ReactNode; anchor?: 'left' | 'center' | 'right'}> = ({x, y, o, color, size = 54, children, anchor = 'center'}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0'},-50%)`, opacity: o,
      font: `800 ${size}px ${SANS}`, color, textShadow: `${sh}, 0 0 22px ${color}66`, whiteSpace: 'nowrap', padding: '6px 16px', borderRadius: 18, background: 'rgba(6,12,24,0.55)'}}>
      {children}
    </div>
  );

const proj = (pos: number[], look: number[], fov: number, p: THREE.Vector3, w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(fov, w / h, 0.01, 3000); cam.position.set(pos[0], pos[1], pos[2]); cam.up.set(0, 1, 0); cam.lookAt(look[0], look[1], look[2]);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld(); const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};
const diagCam = TL.diagCam;

// countdown ring for the pause-and-guess beat
const Countdown: React.FC<{t: number}> = ({t}) => {
  const a = TL.BEATS.guessEnd, b = TL.CUT_NOTHING, o = TL.fade(t, a - 0.2, 0.2, b, 0.15); if (o <= 0.01) return null;
  const k = TL.ramp(t, a, b - 0.1, (x) => x), n = Math.max(1, 3 - Math.floor(k * 3));
  return (
    <div style={{position: 'absolute', left: 540, top: 1150, transform: 'translate(-50%,-50%)', opacity: o, width: 190, height: 190}}>
      <svg width={190} height={190}><circle cx={95} cy={95} r={80} fill="rgba(6,12,24,0.6)" stroke="rgba(255,255,255,0.2)" strokeWidth={10} />
        <circle cx={95} cy={95} r={80} fill="none" stroke={C} strokeWidth={10} strokeDasharray={`${2 * Math.PI * 80 * (1 - k)} 999`} transform="rotate(-90 95 95)" strokeLinecap="round" /></svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 96px ${SANS}`, color: '#fff', textShadow: sh}}>{n}</div>
    </div>
  );
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const earth = useEarth(); const cat = useCat();
  const shot = TL.shotAt(t), B = TL.BEATS;
  // pinned label positions
  const g = TL.groundCam(t), d = diagCam(t), dg = TL.diag(t);
  const tapeTop = TL.world(shot) === 'ground' ? (shot === 'tennis' ? proj(g.pos, g.look, g.fov, new THREE.Vector3(0.033 + TL.GAP_M / 2, 0.0, 0.03), width, height) : proj(g.pos, g.look, g.fov, new THREE.Vector3(0.02, TL.GAP_M * 0.55, -0.95), width, height)) : {x: 0, y: 0};
  const gapStick = proj(d.pos, d.look, d.fov, new THREE.Vector3(TL.SQ_C[0] + TL.Q + 0.5, TL.SQ_C[1] - 0.25, 0), width, height);
  const lineMid = proj(d.pos, d.look, d.fov, new THREE.Vector3(TL.ROLL_X0 + Math.PI, TL.ROLL_Y, 0), width, height);
  const rollC = proj(d.pos, d.look, d.fov, new THREE.Vector3(TL.ROLL_X0 + 0.5, TL.ROLL_Y + 1, 0), width, height);
  const shrinkR = proj(d.pos, d.look, d.fov, new THREE.Vector3(TL.SQ_C[0] + dg.q + TL.BALL_R * dg.ball + 0.5, TL.SQ_C[1], 0), width, height);
  const ticks = Array.from({length: 7}, (_, k) => proj(d.pos, d.look, d.fov, new THREE.Vector3(TL.ROLL_X0 + k, TL.ROLL_Y - 0.62, 0), width, height));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={TL.world(shot) === 'space' ? 0.35 : 0}>
        {earth && cat && (
          <ThreeCanvas width={width} height={height} gl={{logarithmicDepthBuffer: true, antialias: true}} shadows>
            <Scene t={t} earth={earth} cat={cat} />
          </ThreeCanvas>
        )}
      </Finish>
      {shot === 'hook' && <Card y={1360} o={TL.hookCard(t)} size={84}><span style={{color: R}}>+1 METER.</span> CAT UNDER?</Card>}
      {shot === 'wrap' && <Card y={1380} o={TL.ramp(t, TL.CUT_WRAP, TL.CUT_WRAP + 0.3)} size={76}>≈ {Math.round(40000 * TL.ringDraw(t)).toLocaleString('en-US')} KM OF ROPE</Card>}
      {shot === 'splice' && <>
        <Card y={1380} o={TL.ramp(t, B.now + 0.6, B.now + 0.9)} size={84}><span style={{color: R}}>+1 METER</span></Card>
        <Card y={1480} o={TL.ramp(t, B.now + 0.8, B.now + 1.1) * 0.9} size={42} pill={false}>(red piece drawn far bigger)</Card>
      </>}
      {shot === 'lift' && <Card y={1380} o={TL.ramp(t, B.lift + 0.4, B.lift + 0.7)} size={76}>LIFTED <span style={{color: C}}>EVENLY</span></Card>}
      {(shot === 'lift' || shot === 'guess' || shot === 'nothing') && <Card y={1490} o={0.85} size={42} pill={false}>gap drawn far bigger than real</Card>}
      {shot === 'guess' && <>
        <Card y={1380} o={TL.ramp(t, B.pause - 0.1, B.pause + 0.2)} size={80}>PAUSE AND <span style={{color: C}}>GUESS</span></Card>
        <Card y={960} o={TL.ramp(t, B.how + 0.3, B.how + 0.6)} size={52}>A HAIR? · PAPER? · A CAT? · YOU?</Card>
        <Countdown t={t} />
      </>}
      {shot === 'nothing' && <Card y={1380} o={TL.ramp(t, B.spread + 0.3, B.spread + 0.6)} size={76}><span style={{color: R}}>1 M</span> ÷ 40,000 KM?</Card>}
      {shot === 'reveal' && <>
        <Tag x={tapeTop.x + 60} y={tapeTop.y} o={TL.ramp(t, B.sixteen - 0.1, B.sixteen + 0.2)} color={C} size={64} anchor="left">≈ 16 CM</Tag>
        <Card y={1380} o={TL.fade(t, B.sixteen, 0.3, B.enough + 0.2, 0.3)} size={76}>GAP <span style={{color: C}}>≈ 16 CM</span></Card>
      </>}
      {shot === 'why' && <>
        <Tag x={gapStick.x} y={gapStick.y + 70} o={TL.fade(t, TL.CUT_WHY + 1.4, 0.3, B.six - 0.3, 0.3)} color={C} size={44}>LIFT 1 STEP</Tag>
        {ticks.map((p, k) => <Tag key={k} x={p.x} y={p.y} o={TL.diag(t).ticks * (k > 0 ? 1 : 0)} color={C} size={36}>{k}</Tag>)}
        <Tag x={lineMid.x} y={lineMid.y - 70} o={TL.fade(t, B.six + 1.6, 0.3, B.so, 0.25)} color={R} size={48}>6.28 STEPS</Tag>
        <Tag x={lineMid.x} y={lineMid.y - 70} o={TL.fade(t, B.so + 0.05, 0.3, B.sixth, 0.3)} color={R} size={48}>1 M</Tag>
        <Tag x={rollC.x + 30} y={rollC.y - 60} o={TL.ramp(t, B.sixth + 0.9, B.sixth + 1.2)} color={C} size={48} anchor="left">≈ 16 CM</Tag>
        <Card y={1500} o={TL.fade(t, B.why + 0.6, 0.3, B.so - 0.1, 0.25)} size={56}><span style={{color: C}}>1 STEP</span> UP → <span style={{color: R}}>6.28 STEPS</span> LONGER</Card>
        <Card y={1500} o={TL.ramp(t, B.so + 0.2, B.so + 0.5)} size={64}><span style={{color: R}}>1 M</span> ÷ 2π <span style={{color: C}}>≈ 16 CM</span></Card>
      </>}
      {shot === 'shrink' && <>
        <Tag x={shrinkR.x + 20} y={shrinkR.y - 70} anchor="left" o={TL.diag(t).radius} color={C} size={48}>≈ 16 CM</Tag>
        <Card y={1450} o={TL.ramp(t, B.size + 0.3, B.size + 0.6)} size={70}>SIZE DOESN'T MATTER</Card>
      </>}
      {shot === 'tennis' && <>
        <Tag x={tapeTop.x} y={tapeTop.y + 70} o={TL.ramp(TL.tapeUp(t), 0.85, 1)} color={C} size={56}>≈ 16 CM</Tag>
        <Card y={1420} o={TL.ramp(t, B.same - 0.2, B.same + 0.1)} size={76}>SAME <span style={{color: C}}>≈ 16 CM</span></Card>
      </>}
      {shot === 'end' && <Card y={1380} o={TL.ramp(t, B.what - 0.05, B.what + 0.25)} size={84}>WHAT DID YOU <span style={{color: R}}>GUESS?</span></Card>}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={R} font={SANS} />}
    </AbsoluteFill>
  );
};
