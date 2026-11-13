import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {EniacSet} from './eniac';
import {SwitchSet} from './switches';
import {CardSet} from './cards';
import {BatchSet} from './batch';
import {SANS} from './kit/fonts';
import {Hand} from './hand';
import {BEATS, HandSpec} from './beats';

const Cam: React.FC<{cam: number[]; look: number[]; fov: number}> = ({cam, look, fov}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(cam[0], cam[1], cam[2]);
  camera.fov = fov; camera.near = 0.02; camera.far = 40;
  camera.lookAt(look[0], look[1], look[2]); camera.updateProjectionMatrix();
  return null;
};

// Place a hand by where its fingertips pinch (p), the finger direction (f) and the back of the hand (b).
// The model's back of hand is +x and its fingers point along -y (a left hand mirrors: back is -x).
const HandAt: React.FC<{g: GLTF; h: HandSpec}> = ({g, h}) => {
  const F = new THREE.Vector3(...(h.f as [number, number, number])).normalize();
  const B = new THREE.Vector3(...(h.b as [number, number, number]));
  B.sub(F.clone().multiplyScalar(B.dot(F))).normalize();
  const Xm = h.model === 'left' ? B.clone().negate() : B;
  const Y = F.clone().negate(), Z = new THREE.Vector3().crossVectors(Xm, Y);
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xm, Y, Z));
  return <Hand gltf={g} pose={h.pose} anchor={h.anchor} pinch={new THREE.Vector3(...(h.p as [number, number, number]))} quat={q} />;
};

// Caption in the reference reels' manner: spoken words white, words still to come grey.
const Caption: React.FC<{words: string[]; lit: number}> = ({words, lit}) => (
  <div style={{position: 'absolute', top: 300, left: 90, right: 90, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 84, lineHeight: 1.08, letterSpacing: -1.5}}>
    {words.map((w, i) => (
      <span key={i} style={{color: i < lit ? '#ffffff' : 'rgba(255,255,255,0.38)', textShadow: '0 2px 18px rgba(0,0,0,0.6)'}}>{w} </span>
    ))}
  </div>
);

export const StyleFrame: React.FC<{beat: string}> = ({beat}) => {
  const fr = useCurrentFrame();
  const b = BEATS[beat];
  const [g, setG] = useState<{right: GLTF; left: GLTF} | null>(null);
  const [h] = useState(() => delayRender('hand models'));
  useEffect(() => {
    const l = new GLTFLoader();
    Promise.all(['right', 'left'].map((m) => l.loadAsync(staticFile(`models/hand-${m}.glb`)))).then(([right, left]) => { setG({right, left}); continueRender(h); });
  }, [h]);
  if (!g) return null;
  return (
    <AbsoluteFill style={{background: '#100f0e'}}>
      <Finish fr={fr} bloom={0.45}>
        <ThreeCanvas width={1080} height={1920} dpr={2} shadows
          onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; }}>
          <Cam cam={b.cam} look={b.look} fov={b.fov} />
          {b.set === 'eniac' && <EniacSet glow={1} fill={b.fill ?? 0} />}
          {b.set === 'switches' && <SwitchSet />}
          {b.set === 'cards' && <CardSet cols={23} />}
          {b.set === 'batch' && <BatchSet mode={b.mode} clock={b.clock} />}
          {b.hands.map((hs, i) => <HandAt key={i} g={g[hs.model]} h={hs} />)}
        </ThreeCanvas>
      </Finish>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,9,8,0.75) 0%, rgba(10,9,8,0) 32%, rgba(10,9,8,0) 80%, rgba(10,9,8,0.6) 100%)'}} />
      <Caption {...b.caption} />
      <div style={{position: 'absolute', bottom: 230, left: 64, fontFamily: SANS, fontWeight: 500, fontSize: 34, color: 'rgba(255,255,255,0.72)'}}>{b.label}</div>
      <div style={{position: 'absolute', bottom: 230, right: 64, fontFamily: SANS, fontWeight: 500, fontSize: 34, color: 'rgba(255,255,255,0.72)'}}>Illustration</div>
    </AbsoluteFill>
  );
};
