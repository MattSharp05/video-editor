// The background world for an app about travel: the same journey as the foreground, at globe scale.
// three.js (tier 2) behind the CSS-3D interface. Quiet: dark, soft, slow, never cuts.
import React from 'react';
import {interpolate, useVideoConfig} from 'remotion';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {ThreeCanvas} from './kit/three-canvas';
import {Earth, Route, Stars, Dot, arc, ll, over, useEarth, LL} from './kit/globe';
import {clamp, travel, arrive} from './kit/space';
import B from './beats.json';
const S = (sec: number) => Math.round(sec * 60);

// The flight arc is a dim echo of the lead: never brighter than the foreground orange.
const TPA: LL = {lat: 27.98, lon: -82.53};
const LAS: LL = {lat: 36.08, lon: -115.15};
const MID: LL = {lat: 34, lon: -99};

// camera keys: [frame, look-at point, distance in planet radii]
type Key = [number, LL, number];
// Timed from the voiceover (beats.json): wide while the TikToks are saved, closes on Las Vegas as the places land,
// holds over the city while the app works, pulls back for the end card.
const KEYS: Key[] = [
  [0, MID, 3.4], [S(B.l3), MID, 3.0], [S(B.l4_end), LAS, 1.5], [S(B.l7), LAS, 1.32], [S(B.l7_end), MID, 2.9], [S(B.total), MID, 2.85],
];
const lerpLL = (a: LL, b: LL, t: number): LL => ({lat: a.lat + (b.lat - a.lat) * t, lon: a.lon + (b.lon - a.lon) * t});
const camAt = (fr: number): {at: LL; dist: number} => {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [fa, a, da] = KEYS[i], [fb, b, db] = KEYS[i + 1];
    if (fr <= fb) {
      const t = interpolate(fr, [fa, fb], [0, 1], {...clamp, easing: travel});
      return {at: lerpLL(a, b, t), dist: Math.exp(Math.log(da) + (Math.log(db) - Math.log(da)) * t)};
    }
  }
  return {at: KEYS[KEYS.length - 1][1], dist: KEYS[KEYS.length - 1][2]};
};

const Rig: React.FC<{fr: number}> = ({fr}) => {
  const {camera} = useThree();
  const {at, dist} = camAt(fr);
  // look from slightly south of the point so the globe sits low and the horizon curves (more depth)
  const eye = over({lat: at.lat - 14 / dist, lon: at.lon + Math.sin(fr / 300) * 2}, dist);
  camera.position.set(...eye);
  camera.up.set(0, 1, 0);
  camera.lookAt(ll(at).multiplyScalar(0.85));
  (camera as THREE.PerspectiveCamera).fov = 34;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

export const Background: React.FC<{fr: number}> = ({fr}) => {
  const {width, height} = useVideoConfig();
  const earth = useEarth();
  const flight = React.useMemo(() => arc(TPA, LAS, 1, 0.08, 96), []);
  const draw = interpolate(fr, [S(B.l2), S(B.names)], [0, 1], {...clamp, easing: travel});
  // soft and dark while the interface is up; clearer at the start and the end
  const blur = interpolate(fr, [0, S(B.open_trip), S(B.open_trip) + 90, S(B.l7), S(B.l7) + 110], [1.5, 2, 11, 11, 1.5], clamp);
  const bright = interpolate(fr, [0, S(B.open_trip), S(B.open_trip) + 90, S(B.l7), S(B.l7) + 110], [0.75, 0.7, 0.36, 0.36, 0.8], clamp);
  const lasGlow = interpolate(fr, [S(B.names) - 30, S(B.names) + 10], [0, 1], {...clamp, easing: arrive});
  return (
    <div style={{position: 'absolute', inset: 0, filter: `blur(${blur}px) brightness(${bright})`}}>
      <ThreeCanvas width={width} height={height} linear={false} gl={{antialias: true, preserveDrawingBuffer: true}}>
        <color attach="background" args={['#04060D']} />
        <Rig fr={fr} />
        <Stars fr={fr} opacity={0.7} />
        <Earth tex={earth} night={1.1} day={0.35} air={0.9} />
        <Route points={flight} color="#C8643A" width={0.0022} progress={draw} glow={0.15} head={draw < 1 ? 0.008 : 0} opacity={0.4} />
        <Dot at={ll(LAS, 1.003)} size={0.018} color="#FF6B22" opacity={0.85 * lasGlow} />
        <Dot at={ll(TPA, 1.003)} size={0.012} color="#FF6B22" opacity={0.5 * Math.min(1, draw * 8)} />
      </ThreeCanvas>
    </div>
  );
};
