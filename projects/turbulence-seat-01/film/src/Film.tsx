import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Scene, type Assets} from './Scene';
import {WORDS, FPS} from './lib';
import * as TL from './timeline';

export {FPS};
export const DUR = Math.round(TL.DUR_S * FPS);

const LINES = [
  'Most people think turbulence shakes the whole plane the same.',
  'But watch these three cups.',
  'Front. Middle. Back.',
  'Same bump.',
  'The back cup spills.',
  'The [middle] one moves least.',
  "That's because a plane doesn't just bounce.",
  'It [rocks,] like a seesaw.',
  'And the middle of that seesaw is near the [wings.]',
  "That's where the plane's weight is balanced,",
  "so that's where it [pivots.]",
  'The farther your seat is from that point,',
  'the more it moves.',
  'So the back rows feel it most.',
  'The seats over the [wing] feel it least.',
  'Book a seat over the wing,',
  'and keep your [seatbelt] on.',
  "Most passengers seriously hurt by turbulence weren't wearing one.",
];

// Load every model once, outside the canvas, and mount the canvas only when all are ready.
const useAssets = () => {
  const [a, setA] = useState<Assets | null>(null);
  const [h] = useState(() => delayRender('models'));
  useEffect(() => {
    const l = new GLTFLoader();
    Promise.all(['models/b757.glb', 'models/seat.glb', 'models/seat_lo.glb'].map((p) => l.loadAsync(staticFile(p))))
      .then(([plane, seat, seatLo]) => { setA({plane, seat, seatLo}); continueRender(h); });
  }, [h]);
  return a;
};

// screen position of a world point, using the same camera the scene uses
const project = (t: number, p: THREE.Vector3, w: number, h: number) => {
  const c = TL.camAt(t); const cam = new THREE.PerspectiveCamera(50, w / h, 0.03, 60000);
  cam.filmGauge = 36; cam.setFocalLength(c.mm); cam.position.set(...c.pos); cam.up.set(...c.up).normalize(); cam.lookAt(...c.look);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = p.clone().project(cam); return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h};
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame(); const {width, height} = useVideoConfig(); const t = fr / FPS;
  const assets = useAssets();
  const lab = TL.labelOn(t);
  const lp = lab > 0 ? project(t, new THREE.Vector3(4.5, 2.5, 2.6), width, height) : {x: 0, y: 0};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Finish fr={fr} bloom={0.35}>
        {assets && (
          <ThreeCanvas width={width} height={height} gl={{logarithmicDepthBuffer: true, antialias: true}}>
            <Scene t={t} assets={assets} />
          </ThreeCanvas>
        )}
      </Finish>
      {TL.glare(t) > 0.01 && <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(255,246,228,1) 0%, rgba(255,236,205,0.9) 45%, rgba(255,226,190,0.75) 100%)', opacity: Math.min(1, TL.glare(t) * 1.1)}} />}
      {lab > 0 && (
        <div style={{position: 'absolute', left: lp.x, top: lp.y, transform: `translate(0,-50%) translateY(${interpolate(lab, [0, 1], [14, 0])}px)`, opacity: lab,
          font: `800 58px ${SANS}`, color: TL.AMBER, textShadow: '0 0 24px rgba(255,181,71,0.65), 0 2px 8px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>
          smoothest rows
        </div>
      )}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent={TL.AMBER} font={SANS} />}
    </AbsoluteFill>
  );
};
