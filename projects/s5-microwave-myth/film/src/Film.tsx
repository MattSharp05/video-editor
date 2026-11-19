import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Scene, RAMP, type Assets} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

const LINES = [
  'A lot of people think a microwave cooks food from the [inside] [out.]',
  'Watch what really happens.',
  'Microwaves mostly heat the [outer] [inch] or so of thick food.',
  'They make the water molecules there twist back and forth,',
  'billions of times a second, and that layer gets hot.',
  'The [middle] gets much less.',
  'It mostly warms as heat creeps in from the outside.',
  "That's why leftovers can be scalding at the edges",
  'and still cold in the middle.',
  'So let it stand a few minutes,',
  'and the heat finishes the job.',
];

const useAssets = () => {
  const [a, setA] = useState<Assets | null>(null);
  const [h] = useState(() => delayRender('assets'));
  useEffect(() => {
    const l = new GLTFLoader();
    Promise.all(['models/microwave.glb', 'models/lasagna.glb', 'models/kitchen.glb'].map((p) => l.loadAsync(staticFile(p))))
      .then(([microwave, lasagna, kitchen]) => { setA({microwave, lasagna, kitchen}); continueRender(h); });
  }, [h]);
  return a;
};

const project = (t: number, p: [number, number, number], w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(50, w / h, 0.01, 200);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.set(...c.pos); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};
const shadow = '0 2px 10px rgba(0,0,0,0.8), 0 0 24px rgba(0,0,0,0.5)';
const Label: React.FC<{t: number; p: [number, number, number]; o: number; text: string; color: string; size?: number; dx?: number; dy?: number; align?: 'left' | 'right' | 'center'}> = ({t, p, o, text, color, size = 46, dx = 0, dy = 0, align = 'left'}) => {
  const {width, height} = useVideoConfig();
  if (o <= 0.01) return null;
  const q = project(t, p, width, height);
  // keep the label inside x 50..1010 (width estimated from the text)
  const wEst = text.length * size * 0.52 + 32, x0 = q.x + dx - (align === 'left' ? 0 : align === 'right' ? wEst : wEst / 2);
  q.x += Math.max(0, 50 - x0) - Math.max(0, x0 + wEst - 1010);
  const tx = align === 'left' ? '0' : align === 'right' ? '-100%' : '-50%';
  return <div style={{position: 'absolute', left: q.x + dx, top: q.y + dy, transform: `translate(${tx},-50%) translateY(${(1 - o) * 10}px)`, opacity: o,
    font: `800 ${size}px ${SANS}`, color, whiteSpace: 'nowrap', textShadow: shadow, background: 'rgba(8,8,12,0.55)', padding: '4px 16px', borderRadius: 14}}>{text}</div>;
};
const tColour = (T: number) => { const x = Math.min(1, Math.max(0, T / 100)) * 4; const i = Math.min(3, Math.floor(x));
  return '#' + new THREE.Color(RAMP[i]).lerp(new THREE.Color(RAMP[i + 1]), x - i).getHexString(); };

export const Film: React.FC<{captions?: boolean; debugCam?: number[]}> = ({captions = true, debugCam}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const assets = useAssets();
  const shot = TL.shotAt(t), F = shot === 'F';
  const th = F ? TL.thermal(t) : 0;
  const S = TL.SLAB;
  const pr = F ? TL.probes(t) : 0;
  const mins = Math.floor(TL.standLeft(t) / 60), secs = Math.floor(TL.standLeft(t) % 60);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.3}>
        {assets && (
          <ThreeCanvas width={width} height={height} gl={{antialias: true}} shadows>
            <Scene t={t} assets={assets} debugCam={debugCam} />
          </ThreeCanvas>
        )}
      </Finish>
      {assets && <>
        {/* the myth hologram's label */}
        <Label t={t} p={[S.x, S.y + S.h + 0.03, S.z]} o={F ? TL.myth(t) * (1 - TL.mythGlitch(t) * 0.6) : 0} text="myth: hot in the middle?" color={TL.CYAN} size={50} align="center" />
        {/* heat vision: scale bar */}
        {F && (th > 0.5 || t < TL.B.watch + 0.6) && (
          <div style={{position: 'absolute', left: 948, top: 620, width: 30, height: 440, borderRadius: 15, background: `linear-gradient(to top, ${RAMP.join(',')})`, boxShadow: '0 0 18px rgba(0,0,0,0.6)'}}>
            <div style={{position: 'absolute', right: 40, top: -22, font: `800 42px ${SANS}`, color: '#fff', textShadow: shadow}}>hot</div>
            <div style={{position: 'absolute', right: 40, bottom: -22, font: `800 42px ${SANS}`, color: '#fff', textShadow: shadow}}>cold</div>
          </div>
        )}
        <Label t={t} p={[S.x, S.y + S.h + 0.006, S.z]} o={F && t < TL.B.micro + 0.3 ? TL.ramp(t, TL.B.watch + 0.6, TL.B.watch + 0.9) : 0} text="from the fridge: 4°C" color="#9FB4FF" size={50} align="center" dy={-34} />
        <Label t={t} p={[S.x - S.w / 2 + 0.0127, S.y + S.h * 0.5 - 0.012, S.z + 0.005]} o={F ? TL.ruler(t) : 0} text="1 inch" color="#ffffff" size={46} align="center" />
        {/* molecules */}
        <Label t={t} p={[TL.MOL.x - 0.45, TL.MOL.y - 0.4, TL.MOL.z + 0.5]} o={shot === 'M' ? TL.ramp(t, TL.CUT_MOL + 0.2, TL.CUT_MOL + 0.6) : 0} text="outer layer" color="#FFB070" size={52} align="center" />
        <Label t={t} p={[TL.MOL.x + 0.5, TL.MOL.y - 0.4, TL.MOL.z + 0.5]} o={shot === 'M' ? TL.ramp(t, TL.CUT_MOL + 0.2, TL.CUT_MOL + 0.6) : 0} text="middle" color="#8FA8FF" size={52} align="center" />
        <Label t={t} p={[TL.MOL.x, TL.MOL.y + 0.62, TL.MOL.z + 0.5]} o={shot === 'M' ? TL.ramp(t, TL.B.billions - 0.2, TL.B.billions + 0.3) : 0} text="field: 2.45 billion cycles a second" color={TL.GOLD} size={42} align="center" />
        {/* probes: fixed chips in clear space, coloured like the probe handles */}
        {pr > 0.01 && <div style={{position: 'absolute', left: 70, top: 580, opacity: pr, padding: '8px 20px', borderRadius: 16, background: 'rgba(8,8,12,0.7)', font: `800 58px ${SANS}`, color: '#FF9A4C', borderLeft: '10px solid #E8742A'}}>edge {Math.round(TL.rimT(t))}°C</div>}
        {F && TL.probeIcy(t) > 0.01 && <div style={{position: 'absolute', right: 150, top: 580, opacity: TL.probeIcy(t), padding: '8px 20px', borderRadius: 16, background: 'rgba(8,8,12,0.7)', font: `800 58px ${SANS}`, color: '#9FB4FF', borderLeft: '10px solid #4C6BD8'}}>middle {Math.round(TL.coreT(t))}°C</div>}
      </>}
      {/* the creep: a clock */}
      {F && TL.clockOn(t) > 0.01 && (
        <div style={{position: 'absolute', left: 80, top: 590, width: 130, height: 130, borderRadius: 65, border: '8px solid #fff', opacity: TL.clockOn(t), boxShadow: '0 0 16px rgba(0,0,0,0.6)'}}>
          <div style={{position: 'absolute', left: 57, top: 12, width: 8, height: 50, background: '#fff', transformOrigin: '4px 50px', transform: `rotate(${(t - TL.B.middle) * 540}deg)`}} />
          <div style={{position: 'absolute', left: 150, top: 30, font: `800 50px ${SANS}`, color: '#fff', whiteSpace: 'nowrap', textShadow: shadow}}>minutes later…</div>
        </div>
      )}
      {/* standing time */}
      {F && TL.standTimer(t) > 0.01 && (
        <div style={{position: 'absolute', left: 90, top: 560, padding: '14px 26px', borderRadius: 18, background: 'rgba(10,12,16,0.72)', opacity: TL.standTimer(t),
          font: `800 52px ${SANS}`, color: '#fff', letterSpacing: 1}}>STAND {mins}:{String(secs).padStart(2, '0')}</div>
      )}
      {shot === 'E' && TL.takeaway(t) > 0.01 && (
        <div style={{position: 'absolute', left: 90, right: 90, top: 1180, opacity: TL.takeaway(t), padding: '18px 26px', borderRadius: 20, background: 'rgba(10,12,16,0.75)',
          font: `800 54px ${SANS}`, color: '#fff', textAlign: 'center', lineHeight: 1.15}}>Let it stand, then check<br />the <span style={{color: '#FF9A3C'}}>middle</span> is hot too</div>
      )}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent="#FF9A3C" font={SANS} scrimAlpha={0.72} />}
    </AbsoluteFill>
  );
};
