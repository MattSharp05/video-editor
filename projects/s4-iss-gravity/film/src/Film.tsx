import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader, type GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {useEarth} from './kit/globe';
import {Scene} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

const LINES = [
  'Watch this astronaut float.',
  'How much [gravity] is up here?',
  'None? Half? Almost all?',
  'Pause and guess.',
  'Build a tower four hundred kilometers tall,',
  'and step off the top.',
  "You'd fall, fast.",
  'Gravity up there is still about [ninety] [percent] as strong.',
  'So why does the crew float?',
  'The station is [falling] too.',
  "It's also flying sideways",
  'at almost eight kilometers a second.',
  'As it falls, the curved Earth drops away beneath it.',
  'It keeps [missing.]',
  'The crew falls with it, so the scale reads zero.',
  'Not zero gravity.',
  '[Free] [fall,] all the way around the planet.',
];

const useModels = () => {
  const [m, setM] = useState<{iss: GLTF; astro: GLTF} | null>(null);
  const [h] = useState(() => delayRender('models'));
  useEffect(() => {
    const l = new GLTFLoader();
    Promise.all([l.loadAsync(staticFile('models/iss.glb')), l.loadAsync(staticFile('models/astronaut.glb'))]).then(([iss, astro]) => { setM({iss, astro}); continueRender(h); });
  }, [h]);
  return m;
};
const project = (t: number, p: THREE.Vector3, w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(50, w / h, 0.0001, 200000);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.copy(c.pos); cam.up.copy(c.up); cam.lookAt(c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, front: v.z < 1};
};
const shadow = '0 0 14px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.8)';
const Tag: React.FC<{x: number; y: number; o: number; color: string; size?: number; children: React.ReactNode; box?: boolean}> = ({x, y, o, color, size = 52, children, box = false}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: Math.min(Math.max(x, 230), 850), top: Math.min(Math.max(y, 540), 1460), transform: `translate(-50%,-50%) translateY(${interpolate(o, [0, 1], [12, 0])}px)`, opacity: o,
      font: `800 ${size}px ${SANS}`, color, textShadow: `${shadow}, 0 0 22px ${color}66`, whiteSpace: 'nowrap', ...(box ? {background: 'rgba(8,10,16,0.62)', padding: '8px 22px', borderRadius: 14} : {})}}>{children}</div>
  );

// beat 2: the gravity gauge over the scale (0..100 % of the ground's gravity), options lit as spoken
const Gauge: React.FC<{t: number}> = ({t}) => {
  const o = TL.gaugeOn(t); if (o <= 0.01) return null;
  const n = TL.needle(t), a = -120 + 240 * n, cx = 540, cy = 1040, r = 300;
  const opt = (v: number, label: string, at: number, color: string) => {
    const lit = TL.ramp(t, at - 0.05, at + 0.2);
    const pos = v < 0.25 ? [cx - r - 20, cy + r + 40] : v < 0.75 ? [cx, cy - r - 95] : [cx + r + 10, cy + r + 55]; // fixed places, inside x 180-900
    return <div key={label} style={{position: 'absolute', left: pos[0], top: pos[1], transform: 'translate(-50%,-50%)', font: `800 ${44}px ${SANS}`, whiteSpace: 'pre', textAlign: 'center', lineHeight: 1.0,
      color: lit > 0.5 ? color : 'rgba(234,246,255,0.55)', textShadow: shadow, opacity: 0.4 + 0.6 * lit}}>{label}</div>;
  };
  const pause = TL.ramp(t, TL.B.pause, TL.B.pause + 0.3) * (t < TL.CUT_TOWER ? 1 : 0);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={cx} cy={cy} r={r + 40} fill="rgba(8,10,16,0.92)" />
        <path d={`M ${cx + r * Math.cos(-210 * Math.PI / 180)} ${cy + r * Math.sin(-210 * Math.PI / 180)} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(30 * Math.PI / 180)} ${cy + r * Math.sin(30 * Math.PI / 180)}`} stroke="rgba(234,246,255,0.8)" strokeWidth={10} fill="none" strokeLinecap="round" />
        {Array.from({length: 11}, (_, i) => { const g = (-210 + 24 * i) * Math.PI / 180; return <line key={i} x1={cx + Math.cos(g) * (r - 30)} y1={cy + Math.sin(g) * (r - 30)} x2={cx + Math.cos(g) * (r - 6)} y2={cy + Math.sin(g) * (r - 6)} stroke="rgba(234,246,255,0.8)" strokeWidth={i % 5 === 0 ? 8 : 4} />; })}
        {pause > 0 && <circle cx={cx} cy={cy} r={r + 22} fill="none" stroke={TL.AMBER} strokeWidth={8} strokeDasharray={`${2 * Math.PI * (r + 22) * TL.clamp01((t - TL.B.pause) / Math.max(0.5, TL.CUT_TOWER - TL.B.pause - 0.1))} 9999`} transform={`rotate(-90 ${cx} ${cy})`} opacity={pause} />}
        <g transform={`rotate(${a} ${cx} ${cy})`}>
          <line x1={cx} y1={cy + 30} x2={cx} y2={cy - r + 40} stroke={TL.AMBER} strokeWidth={12} strokeLinecap="round" />
        </g>
        <circle cx={cx} cy={cy} r={22} fill={TL.AMBER} />
      </svg>
      <div style={{position: 'absolute', left: cx, top: cy + 150, transform: 'translate(-50%,-50%)', font: `700 34px ${SANS}`, color: 'rgba(234,246,255,0.8)', textShadow: shadow, textAlign: 'center', lineHeight: 1.2}}>gravity up here<br />vs on the ground</div>
      {opt(0, 'NONE?', TL.B.none, TL.CORAL)}{opt(0.5, 'HALF?', TL.B.half, TL.GLASS)}{opt(0.97, 'ALMOST\nALL?', TL.B.all, TL.GLASS)}
      {pause > 0 && <div style={{position: 'absolute', left: cx, top: cy + r + 130, transform: 'translate(-50%,-50%)', font: `900 56px ${SANS}`, color: TL.AMBER, textShadow: shadow, opacity: pause}}>PAUSE &amp; GUESS</div>}
    </div>
  );
};

// the answer: beat 2's dial, smaller, over the fall; the needle swings to ~90 % on "ninety"
const Answer: React.FC<{t: number}> = ({t}) => {
  const o = TL.answerOn(t), n = TL.answerNeedle(t), a = -120 + 240 * n, cx = 540, cy = 1130, r = 190;
  const arc = (v: number) => { const g = (-210 + 240 * v) * Math.PI / 180; return [cx + r * Math.cos(g), cy + r * Math.sin(g)]; };
  const [x0, y0] = arc(0), [x1, y1] = arc(1), [xn, yn] = arc(Math.max(0.001, Math.min(1, n)));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={cx} cy={cy} r={r + 34} fill="rgba(8,10,16,0.88)" />
        <path d={`M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x1} ${y1}`} stroke="rgba(234,246,255,0.7)" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d={`M ${x0} ${y0} A ${r} ${r} 0 ${n > 0.75 ? 1 : 0} 1 ${xn} ${yn}`} stroke={TL.AMBER} strokeWidth={14} fill="none" strokeLinecap="round" />
        <g transform={`rotate(${a} ${cx} ${cy})`}><line x1={cx} y1={cy + 20} x2={cx} y2={cy - r + 30} stroke={TL.AMBER} strokeWidth={10} strokeLinecap="round" /></g>
        <circle cx={cx} cy={cy} r={16} fill={TL.AMBER} />
      </svg>
      <div style={{position: 'absolute', left: cx, top: cy + 95, transform: 'translate(-50%,-50%)', font: `900 72px ${SANS}`, color: TL.AMBER, textShadow: shadow, opacity: TL.ramp(t, TL.B.ninety + 0.25, TL.B.ninety + 0.5)}}>~90%</div>
      <div style={{position: 'absolute', left: cx, top: cy + r + 75, transform: 'translate(-50%,-50%)', font: `700 34px ${SANS}`, color: 'rgba(234,246,255,0.85)', textShadow: shadow, whiteSpace: 'nowrap'}}>gravity up here vs on the ground</div>
    </div>
  );
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const models = useModels(); const earth = useEarth();
  const shot = TL.shotAt(t);
  const P = (p: THREE.Vector3) => project(t, p, width, height);
  const hookCard = (1 - TL.ramp(t, TL.B.none - 0.5, TL.B.none - 0.2));
  const scaleS = P(shot === 'top' ? TL.SCALE_TOP : TL.SCALE_ST);
  const topRead = TL.scaleRead(t);
  const towerTop = P(TL.TOP.clone().addScaledVector(TL.UP, -TL.H + TL.towerH(t)));
  const everestS = P(TL.at(TL.UP.clone().multiplyScalar(TL.R), -60, 10, 0));
  const issNow = TL.onOrbit(TL.issTheta(t)); const fallS = P(issNow.clone().addScaledVector(TL.UP, -260));
  const v = TL.shotReadout(t);
  const pb = TL.pullBack(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.2}>
        {models && earth && (
          <ThreeCanvas width={width} height={height} gl={{logarithmicDepthBuffer: true, antialias: true}}>
            <Scene t={t} assets={{...models, earth}} />
          </ThreeCanvas>
        )}
      </Finish>
      {shot === 'station' && hookCard > 0.01 && (
        <div style={{position: 'absolute', left: 540, top: 1390, transform: 'translate(-50%,-50%)', opacity: hookCard, font: `900 64px ${SANS}`, color: TL.GLASS, textShadow: shadow, whiteSpace: 'nowrap', textAlign: 'center'}}>
          HOW MUCH <span style={{color: TL.AMBER}}>GRAVITY</span><br />UP HERE?
        </div>
      )}
      {shot === 'station' && <Tag x={scaleS.x + 120} y={scaleS.y} o={TL.ramp(t, TL.B.gravity, TL.B.gravity + 0.3) * (1 - TL.gaugeOn(t))} color="#bfe8d0" size={40} box>scale: 0.0</Tag>}
      <Gauge t={t} />
      {shot === 'tower' && <Tag x={towerTop.x + 170} y={towerTop.y + 40} o={TL.ramp(t, TL.B.km, TL.B.km + 0.3)} color={TL.GLASS} size={50}>~400 km</Tag>}
      {shot === 'tower' && <Tag x={everestS.x - 150} y={everestS.y - 20} o={TL.ramp(t, TL.B.build + 0.3, TL.B.build + 0.6)} color={TL.GLASS} size={34}>Everest</Tag>}
      {false && <Tag x={540} y={1330} o={TL.ramp(t, TL.B.ninety - 0.2, TL.B.ninety + 0.1) + (topRead > 0.02 ? 1 : 0)} color={TL.AMBER} size={64} box>{topRead > 0.02 && topRead < 0.88 ? `${Math.round(topRead * 100)}%` : '~90%'} <span style={{font: `700 34px ${SANS}`, color: TL.GLASS}}>of ground gravity</span></Tag>}
      {shot === 'globe' && <Tag x={fallS.x} y={fallS.y} o={TL.pathsOn(t)} color={TL.AMBER} size={46}>FALLING ↓</Tag>}
      {shot === 'globe' && v > 0 && <Tag x={540} y={1380} o={TL.ramp(t, TL.shotStart(0), TL.shotStart(0) + 0.2)} color={TL.ICE} size={60} box>{v.toFixed(1)} km/s</Tag>}
      {shot === 'crew' && <Tag x={540} y={1450} o={TL.arrowsOn(t)} color={TL.AMBER} size={50} box>SAME FALL · scale 0.0</Tag>}
      {shot === 'crew' && pb > 0.05 && (
        <div style={{position: 'absolute', left: 540, top: 1360, transform: 'translate(-50%,-50%)', opacity: TL.ramp(t, TL.B.notZero, TL.B.notZero + 0.3), textAlign: 'center', font: `900 64px ${SANS}`, textShadow: shadow, whiteSpace: 'nowrap'}}>
          <span style={{color: TL.CORAL, textDecoration: 'line-through', textDecorationThickness: 8}}>ZERO G</span>
          <div style={{color: TL.AMBER, opacity: TL.ramp(t, TL.B.freeFall, TL.B.freeFall + 0.3)}}>FREE FALL</div>
        </div>
      )}
      {shot === 'top' && TL.answerOn(t) > 0.01 && <Answer t={t} />}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.AMBER} font={SANS} scrimAlpha={shot === 'station' || shot === 'crew' ? 0.82 : 0.65} />}
    </AbsoluteFill>
  );
};
