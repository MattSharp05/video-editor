import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, delayRender, continueRender, staticFile} from 'remotion';
import * as THREE from 'three';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {useEarth} from './kit/globe';
import {Scene, issAt, type GroundData} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';
import * as G from './ground';
import {groundSpec, orbitSpec, pencilSpec, projector, carS, llv} from './cams';
import {PENCIL_W} from './pencil';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

const LINES = [
  'Can you see the [Great] [Wall] from space?',
  'Most astronauts say [no.]',
  'The wall is [long.]',
  'More than [twenty] [thousand] [kilometres,]',
  'with all its branches.',
  'But it is [thin.]',
  'Most of it is about as wide as [a] [road.]',
  'And it is made of earth and stone,',
  'the [same] [colours] as the hills around it.',
  'The Space Station flies',
  'four hundred [kilometres|#62D8FF] up.',
  'From there, seeing the wall',
  'is like spotting [a] [pencil]',
  'from [four] [hundred] [metres] away.',
  'So astronauts almost never spot it',
  'with just their eyes.',
  'What do they see?',
  '[Cities,|#FFE3A6] airports and highways, lit up at night.',
  'The wall is [huge.]',
  'Just not from up there.',
];

// ground data: heights (dem512.bin) and the autumn colour map, loaded once
const useGround = (): GroundData | null => {
  const [g, setG] = useState<GroundData | null>(null);
  const [handle] = useState(() => delayRender('ground data'));
  useEffect(() => {
    Promise.all([fetch(staticFile('dem512.bin')).then((r) => r.arrayBuffer()), new THREE.TextureLoader().loadAsync(staticFile('ground.jpg'))]).then(([buf, tex]) => {
      tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      const dem = new Float32Array(buf), h = G.heightAt(dem);
      setG({dem, tex, h, L: G.wallLine(h)}); continueRender(handle);
    });
  }, [handle]);
  return g;
};

const shadow = '0 0 14px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.8)';
const Tag: React.FC<{x: number; y: number; o: number; color: string; size?: number; children: React.ReactNode; anchor?: 'left' | 'center' | 'right'}> = ({x, y, o, color, size = 52, children, anchor = 'center'}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0'},-50%) translateY(${interpolate(o, [0, 1], [12, 0])}px)`, opacity: o,
      font: `800 ${size}px ${SANS}`, color, textShadow: `${shadow}, 0 0 22px ${color}55`, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.05}}>
      {children}
    </div>
  );

// the station's eye: a cyan ring that hunts between points and finds nothing
const Ring: React.FC<{x: number; y: number; r: number; o: number; label?: string; lo?: number}> = ({x, y, r, o, label, lo = 0}) => o <= 0.01 ? null : (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, opacity: o}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `5px solid ${TL.CYAN}`, boxShadow: `0 0 18px ${TL.CYAN}99, inset 0 0 14px ${TL.CYAN}55`}} />
    {[0, 90, 180, 270].map((a) => <div key={a} style={{position: 'absolute', left: r - 2.5, top: -16, width: 5, height: 26, background: TL.CYAN, transformOrigin: `2.5px ${r + 16}px`, transform: `rotate(${a}deg)`}} />)}
    {label && lo > 0.01 && <div style={{position: 'absolute', left: 2 * r + 18, top: r - 30, font: `800 50px ${SANS}`, color: '#fff', opacity: lo, textShadow: shadow, whiteSpace: 'nowrap'}}>{label}</div>}
  </div>
);

const searchRing = (t: number, proj: (p: THREE.Vector3) => {x: number; y: number}, stops: {ll: TL.LL; t: number; label: string}[]) => {
  // glide from stop to stop (each reached at its t), with a small wobble while hunting
  const pts = stops.map((s) => ({...proj(llv(s.ll, 1)), t: s.t, label: s.label}));
  let i = 0; while (i < pts.length - 1 && t > pts[i + 1].t) i++;
  const a = pts[i], b = pts[Math.min(pts.length - 1, i + 1)];
  const k = b === a ? 1 : TL.ramp(t, a.t + 0.35, b.t, (x) => x * x * (3 - 2 * x));
  const settle = b === a || k > 0.98 ? b : null;
  return {x: a.x + (b.x - a.x) * k + 6 * Math.sin(t * 7), y: a.y + (b.y - a.y) * k + 5 * Math.cos(t * 5.3), label: (settle ?? (k < 0.05 ? a : null))?.label};
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const earth = useEarth(); const ground = useGround();
  const shot = TL.shotAt(t);
  const B = TL.BEATS;
  const over = useMemo(() => {
    if (!ground) return null;
    if (shot === 'hook' || shot === 'thin' || shot === 'end') return projector(groundSpec(ground.L, ground.h, t), width, height);
    if (shot === 'pencil') return projector(pencilSpec(t), width, height);
    return projector(orbitSpec(t), width, height);
  }, [ground, shot, t, width, height]);

  let overlays: React.ReactNode = null;
  if (over && ground) {
    if (shot === 'hook') overlays = <Tag x={width / 2} y={1330} o={TL.hookTag(t)} color="#FFFFFF" size={84}>Visible from <span style={{color: TL.CYAN}}>space?</span></Tag>;
    if (shot === 'long') {
      const r = searchRing(t, over, [{ll: {lat: 37.2, lon: 106.5}, t: TL.CUT_LONG, label: ''}, {ll: {lat: 40.2, lon: 111.2}, t: B.no + 0.2, label: '?'}]);
      overlays = <>
        <Ring x={r.x} y={r.y} r={78} o={TL.searchOn(t)} label="?" lo={TL.ramp(t, B.no, B.no + 0.2)} />
        <Tag x={width / 2} y={1400} o={TL.counterOn(t)} color={TL.AMBER} size={108}>{TL.counter(t).toLocaleString('en-US')} km</Tag>
        <Tag x={width / 2} y={1500} o={TL.fade(t, B.branches - 0.1, 0.3, TL.CUT_THIN, 0.15)} color="#FFFFFF" size={44}>with every branch</Tag>
      </>;
    }
    if (shot === 'thin') {
      const s = carS(ground.L, t), a = ground.L.at(s + 1 / ground.L.len);
      const y = a.p.clone().add(new THREE.Vector3(0, 1.35, 0));
      const p1 = over(y.clone().addScaledVector(a.n, -G.WALL_W / 2)), p2 = over(y.clone().addScaledVector(a.n, G.WALL_W / 2));
      const o = TL.rulerOn(t), len = Math.hypot(p2.x - p1.x, p2.y - p1.y), ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const so = TL.swatchOn(t);
      overlays = <>
        {o > 0.01 && <div style={{position: 'absolute', left: p1.x, top: p1.y, width: len, height: 0, transformOrigin: '0 0', transform: `rotate(${ang}rad)`, opacity: o}}>
          <div style={{position: 'absolute', left: 0, top: -3, width: len * TL.ramp(t, B.wide - 0.1, B.wide + 0.4), height: 6, background: '#fff', boxShadow: shadow}} />
          {[0, len].map((x) => <div key={x} style={{position: 'absolute', left: x - 3, top: -22, width: 6, height: 44, background: '#fff', boxShadow: shadow}} />)}
        </div>}
        <Tag x={width / 2} y={1340} o={o} color="#FFFFFF" size={56}>about 6 m: <span style={{color: TL.AMBER}}>a road</span></Tag>
        {so > 0.01 && <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', gap: 60, opacity: so}}>
          {[['wall', '#8E7F6A'], ['hills', '#8C7A62']].map(([n, c], i) => (
            <div key={n} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, transform: `scale(${interpolate(TL.ramp(t, B.same - 0.15 + i * 0.25, B.same + 0.25 + i * 0.25), [0, 1], [0.6, 1])})`}}>
              <div style={{width: 150, height: 150, borderRadius: '50%', background: c, border: '6px solid #fff', boxShadow: shadow}} />
              <div style={{font: `800 50px ${SANS}`, color: '#fff', textShadow: shadow}}>{n}</div>
            </div>))}
        </div>}
        <Tag x={width / 2} y={1520} o={TL.fade(t, B.hills, 0.3, TL.CUT_STATION, 0.2)} color="#FFFFFF" size={50}>same colours</Tag>
      </>;
    }
    if (shot === 'station') {
      const iss = issAt(t), surf = iss.clone().normalize();
      const a = over(surf), b = over(iss), o = TL.altOn(t);
      const len = Math.hypot(b.x - a.x, b.y - a.y), ang = Math.atan2(b.y - a.y, b.x - a.x);
      overlays = <>
        <Tag x={b.x + 40} y={b.y - 70} o={TL.fade(t, TL.CUT_STATION + 0.1, 0.3, TL.CUT_PENCIL, 0.15)} color={TL.CYAN} size={50} anchor="left">Space Station</Tag>
        {o > 0.01 && <div style={{position: 'absolute', left: a.x, top: a.y, width: len, height: 0, transformOrigin: '0 0', transform: `rotate(${ang}rad)`, opacity: o}}>
          <div style={{position: 'absolute', left: 0, top: -2.5, width: len * TL.ramp(t, B.four - 0.1, B.four + 0.5), height: 5, background: TL.CYAN, boxShadow: `0 0 10px ${TL.CYAN}`}} />
          <div style={{position: 'absolute', left: -2.5, top: -18, width: 5, height: 36, background: TL.CYAN}} />
        </div>}
        <Tag x={a.x - 40} y={(a.y + b.y) / 2} o={o} color={TL.CYAN} size={72} anchor="right">400 km</Tag>
      </>;
    }
    if (shot === 'pencil') {
      const p = over(new THREE.Vector3(0, PENCIL_W / 2, 0));
      const d = TL.pencilDist(t);
      const lost = TL.ramp(t, B.fourM + 0.1, B.away);
      overlays = <>
        <Tag x={width / 2} y={1330} o={TL.pencilTag(t)} color={TL.AMBER} size={64}>pencil: 7 mm wide</Tag>
        <Ring x={p.x} y={p.y} r={64} o={lost * TL.distTag(t)} />
        <Tag x={width / 2} y={1400} o={TL.distTag(t)} color="#FFFFFF" size={96}>{Math.round(d)} m away</Tag>
        <Tag x={width / 2} y={1500} o={TL.fade(t, B.away + 0.2, 0.3, TL.CUT_SEARCH, 0.15)} color="#FFFFFF" size={44}>about the same as <span style={{color: TL.AMBER}}>6 m</span> from <span style={{color: TL.CYAN}}>400 km</span></Tag>
      </>;
    }
    if (shot === 'search') {
      const r = searchRing(t, over, TL.SEARCH_STOPS);
      const night = TL.ramp(t, B.cities - 0.3, B.cities + 0.3);
      const bj = over(llv({lat: 39.9, lon: 116.4}, 1));
      overlays = <>
        <Ring x={r.x} y={r.y} r={78} o={TL.searchOn(t)} label={r.label} lo={1} />
        <Tag x={width / 2} y={1400} o={TL.fade(t, B.eyes - 0.1, 0.3, B.what + 0.1, 0.3)} color="#FFFFFF" size={60}>the wall: <span style={{color: TL.AMBER}}>too thin to see</span></Tag>
        <Tag x={bj.x + 30} y={bj.y - 60} o={night * TL.fade(t, B.cities, 0.3, TL.CUT_END, 0.15)} color={TL.LIGHTS} size={48} anchor="left">Beijing</Tag>
      </>;
    }
    if (shot === 'end') overlays = <Tag x={width / 2} y={1360} o={TL.endTag(t)} color="#FFFFFF" size={70}>Huge. Just not <span style={{color: TL.CYAN}}>from space.</span></Tag>;
  }

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.3}>
        {earth && ground && (
          <ThreeCanvas width={width} height={height} gl={{logarithmicDepthBuffer: true, antialias: true}} shadows>
            <Scene t={t} fr={fr} earth={earth} ground={ground} />
          </ThreeCanvas>
        )}
      </Finish>
      {overlays}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.AMBER} font={SANS} />}
    </AbsoluteFill>
  );
};
