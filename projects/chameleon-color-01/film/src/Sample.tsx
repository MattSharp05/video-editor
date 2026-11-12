// Sample frames for the three script options: one composition, the shot picked by props. Same finish, caption and
// card style as Octopus 01 (top caption with gold key words over a scrim; a centred card for science names).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {SANS} from './kit/fonts';
import {Chameleon} from './chameleon';
import {Forest, ROLL} from './forest';
import {SkinWorld} from './skinworld';

const ACC = '#ffc65a';
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const rig = (x: number, y: number, z: number) => V(x, y, z).applyAxisAngle(V(0, 0, 1), ROLL); // rig frame -> world

type Shot = {
  world: 'forest' | 'skin'; cam: THREE.Vector3; look: THREE.Vector3; fov: number;
  hero?: {hot: number; dark: number}; rival?: {hot: number; dark: number}; spread?: number; sun?: number;
  caption: string; card?: string; sub?: string; cardColor?: string; tag: string;
};
export const SHOTS: Record<string, Shot> = {
  // A: myth-buster hook. Wide: a green chameleon on a mossy branch among leaves.
  hook: {world: 'forest', cam: rig(0.2, 0.07, 0.95), look: rig(0.12, -0.03, 0), fov: 34, hero: {hot: 0, dark: 0},
    caption: 'Most people think chameleons change color to [hide.]', tag: 'A · Myth-buster'},
  // C: "no green" hook. Close on the head and turret eye.
  eye: {world: 'forest', cam: rig(0.38, 0.05, 0.22), look: rig(0.215, -0.005, 0.0), fov: 32, hero: {hot: 0, dark: 0},
    caption: 'This chameleon is green. But its skin has no [green] in it.', tag: 'C · No green paint'},
  // A/B: two males meet; one flares red and yellow, the other goes dark and backs down.
  faceoff: {world: 'forest', cam: rig(0.3, 0.14, 1.2), look: rig(0.3, -0.02, 0), fov: 38, hero: {hot: 1, dark: 0}, rival: {hot: 0, dark: 0.85},
    caption: 'Bright colors say: [back] [off!]', card: 'Talking in color', sub: 'bright = back off · dark = I give up', tag: 'A · Myth-buster'},
  // B: the cut-away skin: yellow layer, crystal layer, dark layer
  layers: {world: 'skin', cam: V(4.2, 2.6, 11.5), look: V(0, 0.2, 0), fov: 36, spread: 0,
    caption: 'Under its skin is a [yellow] layer. Under that are tiny [crystals.]', card: 'Iridophores', sub: 'crystal cells', cardColor: '#8ff0e4', tag: 'B · Tiny mirrors'},
  // B: crystals packed close: blue comes back, leaves green
  tight: {world: 'skin', cam: V(1.6, 1.9, 9.0), look: V(0.0, 1.0, 1.2), fov: 40, spread: 0,
    caption: 'Packed close, the crystals bounce back [blue] light.', card: 'Blue + yellow = green', cardColor: '#9dff7a', tag: 'B · Tiny mirrors'},
  // B: crystals spread apart: red-orange comes back
  spread: {world: 'skin', cam: V(1.6, 1.9, 9.0), look: V(0.0, 1.0, 1.2), fov: 40, spread: 1,
    caption: 'Spread them apart, and [red] bounces back instead.', card: 'Calm → excited', sub: 'the chameleon spreads its crystals', cardColor: '#ff9a6a', tag: 'B · Tiny mirrors'},
};

const Cam: React.FC<{s: Shot}> = ({s}) => {
  const cam = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  cam.position.copy(s.cam); cam.fov = s.fov; cam.near = 0.005; cam.far = 80; cam.updateProjectionMatrix(); cam.lookAt(s.look);
  return null;
};

const Caption: React.FC<{text: string}> = ({text}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 560, background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.37) 70%, rgba(0,0,0,0))'}} />
    <div style={{position: 'absolute', top: 250, left: 70, right: 70, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      fontFamily: SANS, fontSize: 66, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, color: '#fff', textShadow: '0 2px 18px rgba(0,0,0,0.55)'}}>
      <span>{text.split(' ').map((w, i) => {
        const k = /^\[.*\]$/.test(w), t = w.replace(/[[\]]/g, '');
        return <span key={i} style={{display: 'inline-block', margin: '0 9px', color: k ? ACC : '#fff', fontWeight: k ? 900 : 800,
          transform: k ? 'translateY(-6px) scale(1.06)' : undefined, textShadow: k ? `0 0 22px rgba(255,198,90,0.5), 0 2px 18px rgba(0,0,0,0.55)` : undefined}}>{t}</span>;
      })}</span>
    </div>
  </>
);
const Card: React.FC<{text: string; sub?: string; color?: string}> = ({text, sub, color = '#fff'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center'}}>
    <div style={{padding: '12px 32px 16px', borderRadius: 28, background: 'rgba(4,16,22,0.55)', fontFamily: SANS, color, fontSize: 72, fontWeight: 800, letterSpacing: -1, whiteSpace: 'nowrap', textAlign: 'center', textShadow: '0 2px 18px rgba(0,0,0,0.6)'}}>
      {text}
      {sub && <div style={{fontSize: 32, fontWeight: 700, color: '#d8eef2', letterSpacing: 0, marginTop: 2}}>{sub}</div>}
    </div>
  </div>
);

export const Sample: React.FC<{shot: string; overlay?: boolean}> = ({shot, overlay = true}) => {
  const fr = useCurrentFrame();
  const s = SHOTS[shot] ?? SHOTS.hook;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.4}>
        <ThreeCanvas width={1080} height={1920} shadows gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping}}>
          <Cam s={s} />
          {s.world === 'forest' ? (
            <Forest sun={s.sun ?? 1}>
              <Chameleon skin={s.hero ?? {hot: 0, dark: 0}} />
              {s.rival && <Chameleon skin={s.rival} position={V(0.64, 0, 0)} yaw={Math.PI} />}
            </Forest>
          ) : (
            <SkinWorld spread={s.spread ?? 0} />
          )}
        </ThreeCanvas>
      </Finish>
      {overlay && <Caption text={s.caption} />}
      {overlay && s.card && <Card text={s.card} sub={s.sub} color={s.cardColor} />}
      {overlay && <div style={{position: 'absolute', left: 40, bottom: 60, padding: '8px 22px', borderRadius: 20, background: 'rgba(0,0,0,0.45)', color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 30}}>{s.tag} · sample frame</div>}
    </AbsoluteFill>
  );
};
