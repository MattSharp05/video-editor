// The film: one canvas, one continuous camera (timeline.ts), captions and labels on top, the VO for previews.
// The delivered sound is mixed separately (../sound/mix.py) and muxed onto the silent picture with -c:v copy.
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {useAssets, type Assets} from './assets';
import {buildScene} from './scene';
import {B, FPS, YOU_START, camAt, win, youX, bikeX, BIKE_Z, BIKE_V, teslaZ, TESLA_X} from './timeline';
import {CROSS_Z} from './world';
import words from './words.json';

// caption sense units (checked word for word against words.json at load)
const LINES = [
  "There's nobody driving this car.", 'So how does it see you?',
  'In 2004, not one robot car', 'could finish a desert race.', 'This year, Waymo passed', 'half a million rides a week,', 'with nobody at the wheel.',
  'First, the car has to see you.', 'On its roof, lidar fires laser pulses', 'and times each bounce,', 'building a 3D picture of the street.',
  'Radar tracks speed, even in rain.', 'Cameras pick out traffic lights and signs.',
  "But seeing isn't enough.", 'It guesses where the people, bikes and cars', 'around it might go next.',
  'Then it plans a path around all of them,', 'again and again as they move.',
  'Waymo has practised over 20 billion miles', 'in simulation.',
  'Tesla bet differently:', 'cameras only, no lidar,', 'and one neural network', 'that turns video into driving.',
  'Teslas people buy still need a driver watching.', 'But some Tesla robotaxis in Texas', 'now run with no employee on board.',
  'So, is it cracked? Not yet.', 'But in parts of about 15 US cities,', 'a car with no driver already sees you,', 'guesses your next step,', 'and drives around you.',
];

// labels: fact, source, window [from, to] (s); "Illustration" marks the sensor drawings
const LABELS: {text: string; src?: string; a: number; b: number}[] = [
  {text: 'DARPA Grand Challenge, 2004', src: 'No vehicle finished the course', a: B.y2004 + 1.7, b: B.this_year + 0.3},
  {text: 'Waymo: 500,000+ fully autonomous rides a week', src: 'Alphabet, April 2026', a: B.half_million - 0.3, b: B.first - 0.4},
  {text: 'To you and back: about 60 billionths of a second', src: 'Light travels about 30 cm a billionth of a second', a: B.times - 0.2, b: B.building + 0.6},
  {text: 'Waymo: 20 billion+ miles in simulation', src: 'waymo.com', a: B.billion - 0.2, b: B.tesla - 0.3},
  {text: 'Tesla FSD: cameras only, no lidar', src: 'Tesla', a: B.cams_only, b: B.buy - 0.3},
  {text: 'FSD (Supervised): the driver must watch the road', src: 'Tesla, Q3 2026 update', a: B.buy + 0.2, b: B.robotaxis - 0.2},
  {text: 'Some Tesla robotaxis in Texas: no employee on board', src: 'CNBC, Jan 2026; Tesla Q3 2026', a: B.robotaxis + 0.4, b: B.cracked - 0.1},
  {text: 'Waymo rides with no driver: parts of 15 US metros', src: 'waymo.com, Nov 2026', a: B.cities + 0.3, b: B.a_car - 0.2},
];

type Tag = {text: string; color: string; at: THREE.Vector3; o: number};
const project = (p: THREE.Vector3, cam: THREE.PerspectiveCamera) => { const v = p.clone().project(cam); return {x: (v.x + 1) * 540, y: (1 - v.y) * 960, ok: v.z < 1 && v.z > -1}; };

const Inner: React.FC<{a: Assets & {night: THREE.Texture}; t: number; off: string[]}> = ({a, t, off}) => {
  const {gl, camera, scene: root} = useThree();
  // memo on the switches' text, not the array: a default [] is a new array every frame and would rebuild the world each frame
  const key = off.join(',');
  const s = useMemo(() => { const b = buildScene(a, gl, key ? key.split(',') : []); root.add(b.scene); return b; }, [a, gl, root, key]);
  s.update(t);
  const p = camAt(t), c = camera as THREE.PerspectiveCamera;
  c.position.copy(p.pos); c.setFocalLength(p.mm); c.near = p.near; c.far = p.far; c.up.set(0, 1, 0); c.lookAt(p.look); c.updateProjectionMatrix();
  return null;
};

const useNight = () => {
  const [tex, setTex] = useState<THREE.Texture | null>(null); const [h] = useState(() => delayRender('night map'));
  useEffect(() => { new THREE.TextureLoader().loadAsync(staticFile('earth_night.jpg')).then((x) => { setTex(x); continueRender(h); }); }, [h]);
  return tex;
};

export const Film: React.FC<{captions?: boolean; audio?: boolean; off?: string[]}> = ({captions = true, audio = true, off = []}) => {
  const fr = useCurrentFrame(), t = fr / FPS;
  const a = useAssets(); const night = useNight();
  const assets = useMemo(() => (a && night ? {...a, night} : null), [a, night]);
  // a camera twin for anchoring tags (same pose function as the canvas)
  const p = camAt(t); const twin = new THREE.PerspectiveCamera(50, 1080 / 1920, p.near, p.far); twin.position.copy(p.pos); twin.setFocalLength(p.mm); twin.lookAt(p.look); twin.updateMatrixWorld(); twin.updateProjectionMatrix();
  const yx = youX(t);
  const tags: Tag[] = [
    {text: 'PEDESTRIAN', color: '#ff8a2a', at: new THREE.Vector3(yx, 2.15, YOU_START.z), o: Math.max(win(t, B.see_you + 0.3, B.y2004 + 0.3, 0.12, 0.25), win(t, B.fires + 0.8, B.times + 0.4, 0.1, 0.3), win(t, B.sees + 0.25, 99, 0.12, 0))},
    {text: `BIKE · ${Math.round(BIKE_V * 2.237)} MPH`, color: '#b38cff', at: new THREE.Vector3(bikeX(t), 2.3, BIKE_Z), o: win(t, B.speed + 0.05, B.cameras, 0.12, 0.3)},
    {text: 'RED LIGHT', color: '#fff1d6', at: new THREE.Vector3(-3.7, 6.0, CROSS_Z - 2.2), o: win(t, B.lights + 0.25, B.seeing + 0.1, 0.12, 0.3)},
    {text: 'SPEED LIMIT 25', color: '#fff1d6', at: new THREE.Vector3(-7.5, 3.0, CROSS_Z - 6), o: win(t, B.signs + 0.2, B.seeing + 0.2, 0.12, 0.3)},
    {text: 'CROSSING · LIKELY', color: '#e9f2ff', at: new THREE.Vector3(YOU_START.x + 3.2, 2.2, YOU_START.z), o: win(t, B.next, B.plans - 0.1, 0.15, 0.3)},
    {text: 'DRIVER WATCHING', color: '#fff1d6', at: new THREE.Vector3(TESLA_X + 0.38, 1.5, teslaZ(t) + 0.6), o: win(t, B.watching - 0.1, B.robotaxis - 0.3, 0.12, 0.3)},
    {text: 'NO ONE AT THE WHEEL', color: '#fff1d6', at: new THREE.Vector3(TESLA_X + 0.38, 1.4, 150.5), o: win(t, B.no_employee - 0.2, B.cracked - 0.1, 0.15, 0.25)},
  ];
  const lab = LABELS.find((l) => t >= l.a - 0.2 && t < l.b + 0.2);
  const labO = lab ? win(t, lab.a, lab.b, 0.2, 0.2) : 0;
  const count = interpolate(t, [B.billion - 0.3, B.simulation + 0.3], [0, 20], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const illus = t > B.see_you && t < B.y2004 + 0.2 || t > B.first && t < B.cracked + 1.2 || t > B.sees - 0.4;
  return (
    <AbsoluteFill style={{background: '#05070b'}}>
      <Finish fr={fr} bloom={off.includes('bloom') ? 0 : 0.55}>
        {assets && (
          <ThreeCanvas width={1080} height={1920} dpr={1} shadows={!off.includes('shadow')} gl={{antialias: true}}
            onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.15; }}>
            <Inner a={assets} t={t} off={off} />
          </ThreeCanvas>
        )}
      </Finish>
      {tags.map((tg, i) => {
        if (tg.o < 0.01) return null; const q = project(tg.at, twin); if (!q.ok) return null;
        return <div key={i} style={{position: 'absolute', left: q.x, top: q.y, transform: 'translate(-50%, -100%)', opacity: tg.o, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 2,
          color: tg.color, padding: '6px 12px', borderLeft: `3px solid ${tg.color}`, background: 'rgba(5,8,14,0.55)', whiteSpace: 'nowrap', textShadow: '0 1px 8px rgba(0,0,0,0.7)'}}>{tg.text}</div>;
      })}
      {t > B.billion - 0.4 && t < B.tesla - 0.2 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 120, color: '#ffffff', letterSpacing: -2,
          opacity: win(t, B.billion - 0.2, B.tesla - 0.5, 0.2, 0.3), textShadow: '0 4px 30px rgba(0,0,0,0.7)'}}>
          {count < 1 ? Math.round(count * 1000).toLocaleString('en-US') + ' million' : count.toFixed(count < 19.95 ? 1 : 0) + ' billion'}
          <div style={{fontSize: 42, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 0}}>miles of practice</div>
        </div>
      )}
      {lab && labO > 0.01 && (
        <div style={{position: 'absolute', left: 64, top: 1300, maxWidth: 820, opacity: labO, fontFamily: SANS, transform: `translateY(${(1 - labO) * 12}px)`}}>
          <div style={{width: 56, height: 3, background: '#ffffff', marginBottom: 14, opacity: 0.85}} />
          <div style={{fontWeight: 700, fontSize: 40, lineHeight: 1.15, color: '#fff', textShadow: '0 2px 14px rgba(0,0,0,0.8)'}}>{lab.text}</div>
          {lab.src && <div style={{fontWeight: 500, fontSize: 28, marginTop: 8, color: 'rgba(255,255,255,0.62)', textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>{lab.src}</div>}
        </div>
      )}
      {illus && <div style={{position: 'absolute', left: 64, top: 1462, fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: 2, color: 'rgba(255,255,255,0.5)'}}>ILLUSTRATION</div>}
      {captions && <Captions t={t} words={words} lines={LINES} accent="#ffffff" font={SANS} top={270} size={76} scrimAlpha={0.55} dim={0.38} />}
      {audio && <Audio src={staticFile('vo/vo.wav')} />}
    </AbsoluteFill>
  );
};
