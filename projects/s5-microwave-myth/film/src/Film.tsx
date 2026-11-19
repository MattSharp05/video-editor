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
  const tx = align === 'left' ? '0' : align === 'right' ? '-100%' : '-50%';
  return <div style={{position: 'absolute', left: q.x + dx, top: q.y + dy, transform: `translate(${tx},-50%) translateY(${(1 - o) * 10}px)`, opacity: o,
    font: `800 ${size}px ${SANS}`, color, whiteSpace: 'nowrap', textShadow: shadow}}>{text}</div>;
};
const tColour = (T: number) => { const x = Math.min(1, Math.max(0, T / 100)) * 4; const i = Math.min(3, Math.floor(x));
  return '#' + new THREE.Color(RAMP[i]).lerp(new THREE.Color(RAMP[i + 1]), x - i).getHexString(); };

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
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
            <Scene t={t} assets={assets} />
          </ThreeCanvas>
        )}
      </Finish>
      {assets && <>
        {/* the myth hologram's label */}
        <Label t={t} p={[S.x, S.y + S.h + 0.03, S.z]} o={shot === 'K' ? TL.myth(t) * (1 - TL.mythGlitch(t) * 0.6) : 0} text="the myth?" color={TL.CYAN} size={56} align="center" />
        {/* heat vision: scale bar */}
        {th > 0.5 && (
          <div style={{position: 'absolute', left: 948, top: 620, width: 30, height: 640, borderRadius: 15, background: `linear-gradient(to top, ${RAMP.join(',')})`, boxShadow: '0 0 18px rgba(0,0,0,0.6)'}}>
            <div style={{position: 'absolute', right: 40, top: -18, font: `800 34px ${SANS}`, color: '#fff', textShadow: shadow}}>100°C</div>
            <div style={{position: 'absolute', right: 40, bottom: -18, font: `800 34px ${SANS}`, color: '#fff', textShadow: shadow}}>0°C</div>
          </div>
        )}
        <Label t={t} p={[S.x, S.y - 0.012, S.z]} o={F && t < TL.B.micro ? TL.ramp(t, TL.CUT_FACE + 0.5, TL.CUT_FACE + 0.9) : 0} text="from the fridge: 4°C" color={tColour(4)} size={50} align="center" dy={30} />
        <Label t={t} p={[S.x - S.w / 2 - 0.016, S.y + S.h - 0.0127, S.z]} o={F ? TL.ruler(t) : 0} text="1 inch" color="#ffffff" size={46} align="right" />
        {/* molecules */}
        <Label t={t} p={[TL.MOL.x - 0.65, TL.MOL.y + 1.05, TL.MOL.z + 0.5]} o={shot === 'M' ? TL.ramp(t, TL.CUT_MOL + 0.2, TL.CUT_MOL + 0.6) : 0} text="outer layer" color="#FFB070" size={52} align="center" />
        <Label t={t} p={[TL.MOL.x + 0.65, TL.MOL.y + 1.05, TL.MOL.z + 0.5]} o={shot === 'M' ? TL.ramp(t, TL.CUT_MOL + 0.2, TL.CUT_MOL + 0.6) : 0} text="middle" color="#8FA8FF" size={52} align="center" />
        <Label t={t} p={[TL.MOL.x, TL.MOL.y - 1.45, TL.MOL.z + 0.5]} o={shot === 'M' ? TL.ramp(t, TL.B.billions - 0.2, TL.B.billions + 0.3) : 0} text="field: 2.45 billion cycles a second" color={TL.GOLD} size={42} align="center" />
        {/* probes */}
        <Label t={t} p={[S.x + S.w / 2 - 0.007, S.y + S.h * 0.62 + 0.05, S.z + 0.06]} o={pr} text={`${Math.round(TL.rimT(t))}°C`} color={tColour(TL.rimT(t))} size={62} dx={10} />
        <Label t={t} p={[S.x, S.y + S.h * 0.48 + 0.05, S.z + 0.06]} o={F ? TL.probeIcy(t) : 0} text={`${Math.round(TL.coreT(t))}°C`} color={tColour(TL.coreT(t))} size={62} align="right" dx={-10} />
      </>}
      {/* the creep: a clock */}
      {F && TL.clockOn(t) > 0.01 && (
        <div style={{position: 'absolute', left: 90, top: 560, width: 96, height: 96, borderRadius: 48, border: '6px solid #fff', opacity: TL.clockOn(t), boxShadow: '0 0 16px rgba(0,0,0,0.6)'}}>
          <div style={{position: 'absolute', left: 42, top: 10, width: 6, height: 38, background: '#fff', transformOrigin: '3px 38px', transform: `rotate(${(t - TL.B.creeps) * 540}deg)`}} />
        </div>
      )}
      {/* standing time */}
      {F && TL.standTimer(t) > 0.01 && (
        <div style={{position: 'absolute', left: 90, top: 560, padding: '14px 26px', borderRadius: 18, background: 'rgba(10,12,16,0.72)', opacity: TL.standTimer(t),
          font: `800 52px ${SANS}`, color: '#fff', letterSpacing: 1}}>STAND {mins}:{String(secs).padStart(2, '0')}</div>
      )}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent="#FF9A3C" font={SANS} scrimAlpha={0.72} />}
    </AbsoluteFill>
  );
};
