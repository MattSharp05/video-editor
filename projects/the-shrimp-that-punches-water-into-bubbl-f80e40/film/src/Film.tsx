import React, {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, staticFile, delayRender, continueRender} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Scene, Assets} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

export const LINES = [
  'This shrimp punches so fast',
  'the water around it [bursts.]',
  "It's a peacock mantis shrimp,",
  'and its club can hit',
  'up to [eighty] kilometres an hour.',
  "That's one of the [fastest]",
  'strikes of any animal.',
  'Slow it right down,',
  'and watch the [water.]',
  'The club moves so fast,',
  'it [pulls] the water [apart.]',
  'The water tears open',
  'into tiny [bubbles] of [vapour.]',
  'Then the bubbles [collapse,]',
  'and slam into the shell',
  'a [second] [time.]',
  'Collapsing bubbles like these',
  'can even [flash] with [light,]',
  'too faint to see.',
  'One punch, two hits:',
  'first the club,',
  'then the [bubbles.]',
];

// ---- assets: the sourced shrimp, loaded once before the canvas mounts
// "Mantis Shrimp" by all of life (Sketchfab), CC BY 4.0. Its material uses KHR_materials_pbrSpecularGlossiness, which
// three dropped (it loads white): we put its diffuse texture back on a standard material.
const HEAD_YAW = Math.PI / 2;   // turn the model so its head faces +x (toward the shell)
let cache: Promise<Assets> | null = null;
const loadAssets = () => cache ??= (async () => {
  const [gltf, tex] = await Promise.all([
    new GLTFLoader().loadAsync(staticFile('models/shrimp.glb')),
    new THREE.TextureLoader().loadAsync(staticFile('models/shrimp_diffuse.png')),
  ]);
  tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mat = new THREE.MeshPhysicalMaterial({map: tex, roughness: 0.38, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.35, side: THREE.DoubleSide, alphaTest: 0.4});
  const inner = gltf.scene; inner.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = mat; });
  inner.rotation.y = HEAD_YAW; inner.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(inner); const sz = box.getSize(new THREE.Vector3());
  const s = 11 / Math.max(sz.x, sz.z);
  const wrap = new THREE.Group(); const holder = new THREE.Group(); holder.add(inner); wrap.add(holder);
  holder.scale.setScalar(s); holder.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(holder); const c2 = b2.getCenter(new THREE.Vector3());
  holder.position.set(-c2.x, -b2.min.y + 0.05, -c2.z);
  return {shrimp: wrap};
})();

const shadow = '0 0 14px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.8)';
const Card: React.FC<{y: number; o: number; size?: number; color?: string; children: React.ReactNode}> = ({y, o, size = 84, color = '#fff', children}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center', opacity: o, transform: `translateY(${interpolate(o, [0, 1], [14, 0])}px)`,
      font: `800 ${size}px ${SANS}`, letterSpacing: -1, color, textShadow: shadow, lineHeight: 1.05}}>
      <span style={{display: 'inline-block', padding: '10px 26px', borderRadius: 26, background: 'rgba(2,18,26,0.5)', boxShadow: '0 0 40px rgba(2,18,26,0.5)'}}>{children}</span></div>
  );
// a hit tag: a pill with its number, in its colour
const Tag: React.FC<{x: number; y: number; o: number; c: string; children: React.ReactNode}> = ({x, y, o, c, children}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * o})`, opacity: o,
      padding: '12px 30px', borderRadius: 40, background: 'rgba(2,14,22,0.7)', border: `3px solid ${c}`, boxShadow: `0 0 30px ${c}66`,
      font: `900 60px ${SANS}`, color: c, textShadow: shadow, whiteSpace: 'nowrap'}}>{children}</div>
  );

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const [assets, setAssets] = useState<Assets | null>(null);
  const [handle] = useState(() => delayRender('shrimp model'));
  useEffect(() => { loadAssets().then((a) => { setAssets(a); continueRender(handle); }); }, [handle]);
  const shot = TL.shotAt(t);
  return (
    <AbsoluteFill style={{background: '#0c3b4e'}}>
      <Finish fr={fr} bloom={0.4}>
        {assets && <ThreeCanvas width={width} height={height} gl={{antialias: true}} shadows>
          <Scene t={t} assets={assets} />
        </ThreeCanvas>}
      </Finish>
      {shot === 'hook' && <Card y={1180} o={TL.hookCard(t)} size={78}>WATER <span style={{color: TL.CYAN}}>BURSTS</span><br />FROM ONE PUNCH</Card>}
      {shot === 'id' && <Card y={1200} o={TL.nameCard(t)} size={64}>PEACOCK <span style={{color: '#7CE38B'}}>MANTIS SHRIMP</span></Card>}
      {shot === 'id' && <Card y={1200} o={TL.speedCard(t)} size={92}>UP TO <span style={{color: TL.ORANGE}}>{TL.speedVal(t)} KM/H</span></Card>}
      {shot === 'gap' && <Card y={560} o={TL.slowCard(t)} size={52} color="#d6f3ff">◷ SLOWED DOWN</Card>}
      {shot === 'gap' && <Tag x={700} y={1240} o={TL.hit1Tag(t)} c={TL.ORANGE}>HIT 1: CLUB</Tag>}
      {shot === 'gap' && <Tag x={330} y={1180} o={TL.clubLabel(t)} c={TL.ORANGE}>THE CLUB</Tag>}
      {shot === 'gap' && <Tag x={860} y={1420} o={TL.clubLabel(t)} c="#f3e6cc">SHELL</Tag>}
      {shot === 'gap' && <Card y={1330} o={TL.vapourCard(t)} size={76}><span style={{color: TL.CYAN}}>VAPOUR</span> BUBBLES</Card>}
      {shot === 'collapse' && <Tag x={560} y={1300} o={TL.hit2Tag(t)} c={TL.CYAN}>HIT 2: BUBBLES</Tag>}
      {shot === 'flash' && <Card y={1330} o={TL.collapsingCard(t)} size={68}>BUBBLES <span style={{color: TL.CYAN}}>COLLAPSING</span></Card>}
      {shot === 'flash' && <Card y={1330} o={TL.faintCard(t)} size={64}>LIGHT <span style={{color: TL.CYAN}}>TOO FAINT TO SEE</span></Card>}
      {shot === 'flash' && <Card y={1500} o={TL.illusTag(t)} size={40} color="#cfe6ee">illustration</Card>}
      {shot === 'end' && <>
        <Tag x={400} y={1240} o={TL.endHit1(t)} c={TL.ORANGE}>HIT 1: CLUB</Tag>
        <Tag x={640} y={1380} o={TL.endHit2(t)} c={TL.CYAN}>HIT 2: BUBBLES</Tag>
        <Card y={560} o={TL.endCard(t)} size={92}>ONE PUNCH.<br /><span style={{color: TL.CYAN}}>TWO HITS.</span></Card>
      </>}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.CYAN} font={SANS} />}
    </AbsoluteFill>
  );
};
