// Prototype: the octopus on the reef, one camera, skin state from props (for stills while building).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Reef, useWater, groundY} from './reef';
import {Octopus, REST_POSE} from './octopus';
import {withUnderwater} from './kit/water/underwater';

const Cam: React.FC<{pos: number[]; look: number[]; fov: number}> = ({pos, look, fov}) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  cam.position.set(pos[0], pos[1], pos[2]); cam.fov = fov; cam.near = 0.005; cam.far = 80; cam.updateProjectionMatrix(); cam.lookAt(look[0], look[1], look[2]);
  return null;
};
const OPOS = new THREE.Vector3(0.05, 0, 0.1);
const Scene: React.FC<{t: number; p: any}> = ({t, p}) => {
  const U = useWater(t);
  const g = (x: number, z: number) => groundY(x + OPOS.x, z + OPOS.z) - OPOS.y;
  return (
    <>
      <Cam pos={p.cam ?? [0.5, 0.55, 1.0]} look={p.look ?? [0.05, 0.05, 0.05]} fov={p.fov ?? 40} />
      <Reef t={t} U={U} />
      <Octopus pose={{...REST_POSE, t, curl: p.curl ?? 0.5, lift: p.lift ?? 0}} ground={g} position={OPOS.clone().setY(groundY(OPOS.x, OPOS.z) - 0.012)} yaw={p.yaw ?? 0.3}
        skin={{uChroma: p.chroma ?? 0.8, uMatch: p.match ?? 0, uMottle: p.mottle ?? 0, uPap: p.pap ?? 0, uPale: p.pale ?? 0, uWave: p.wave ?? 0, uIrid: p.irid ?? 0.25}}
        breathe={1} under={(m, k) => withUnderwater(m, U, k)} />
    </>
  );
};
export const Proto: React.FC<any> = (p) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.4}>
        <ThreeCanvas width={1080} height={1920} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping}}>
          <Scene t={fr / 30} p={p} />
        </ThreeCanvas>
      </Finish>
    </AbsoluteFill>
  );
};
