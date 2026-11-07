// Moon tides 01: beach -> (up through the sky) -> space -> (down through the clouds) -> Bay of Fundy -> space recap ->
// beach. One canvas; the scene changes only inside a haze the camera flies through (a pass-through, not a cut).
// Captions from the voice (kit/captions.tsx), labels in the safe area, honesty tags, grade.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from './kit/three-canvas';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {Beach, Space, Fundy, tideLevel, usePreload} from './scenes';
import {useEarth} from './kit/globe';
import words from './words.json';
import B from './beats.json';

export const FPS = 30;
export const DUR = Math.ceil(B.total * FPS);
const GOLD = '#FFC56E';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const win = (t: number, a: number, b: number, f = 0.3) => Math.min(interpolate(t, [a, a + f], [0, 1], clamp), interpolate(t, [b - f, b], [1, 0], clamp));

// the scene at time t, and the haze the camera passes through at each change (centre time, half-width)
const CUTS: [number, number][] = [[B.l2 + 0.15, 0.55], [B.canada - 0.3, 0.45], [B.l9 + 0.1, 0.45], [B.twice - 0.25, 0.45]];
const sceneAt = (t: number) => (t < CUTS[0][0] ? 'beach' : t < CUTS[1][0] ? 'space' : t < CUTS[2][0] ? 'fundy' : t < CUTS[3][0] ? 'space' : 'beach-end');
const hazeAt = (t: number) => Math.max(...CUTS.map(([c, w]) => interpolate(t, [c - w, c, c + w], [0, 1, 0], clamp)));

const LINES = [
  'Most people think the moon makes the [waves] at the beach.',
  'But the [wind] makes those.', 'The moon makes the [biggest] [wave] on Earth,', "and you've probably never noticed it.",
  "It's the [tide:] a wave so long,", 'it can stretch across a whole [ocean.]',
  'So how does the moon make it?', 'The moon pulls on everything,', 'but its pull gets [weaker] the farther away you are.',
  'It pulls [hardest] on the side of Earth near it.', 'It pulls the [middle] a little less.', 'And it pulls the far side the [least.]',
  'That stretches the ocean into [two] [bumps.]', 'One bump points at the [moon.]', 'The other is on the [far] [side,] left behind.',
  'Earth [spins] through both bumps every day.', 'So most beaches get [two] [high] [tides] a day.',
  'The [sun] pulls too, about half as hard.', 'When the sun and moon [line] [up,]', 'the tides get even [bigger.]',
  'In the open ocean, the tide is [small.]', "It's usually less than [one] [meter.]", 'But in one narrow bay in [Canada,]',
  'the water can go up and down more than [15] [meters.]',
  'So the moon [pulls,] the ocean [stretches,]', 'and Earth [spins.]', 'And twice a day, at most beaches,', 'the biggest wave on Earth [rolls] [in.]',
];

const Tag: React.FC<{text: string; o: number; y?: number; big?: boolean}> = ({text, o, y = 1250, big}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 12}px)`}}>
    <div style={{padding: big ? '12px 36px 16px' : '8px 22px', borderRadius: 30, background: 'rgba(8,14,22,0.5)', fontFamily: SANS, color: big ? GOLD : '#fff',
      fontSize: big ? 84 : 40, fontWeight: 900, letterSpacing: big ? -2 : 0, whiteSpace: 'nowrap', textShadow: '0 2px 18px rgba(0,0,0,0.6)'}}>{text}</div>
  </div>
);
const Honest: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1440, textAlign: 'center', opacity: 0.85, fontFamily: SANS, fontSize: 28, fontWeight: 700,
    letterSpacing: 2, textTransform: 'uppercase', color: '#fff', textShadow: '0 1px 10px rgba(0,0,0,0.8)'}}>{text}</div>
);
// the Fundy height bar: low tide to high tide, filling as the water rises
const TideBar: React.FC<{t: number}> = ({t}) => {
  const o = win(t, B.canada + 0.2, B.l9 + 0.1), lvl = tideLevel(t), k = (lvl + 7.5) / 15.3;
  return (
    <div style={{position: 'absolute', right: 120, top: 640, width: 70, height: 560, opacity: o, fontFamily: SANS, color: '#fff'}}>
      <div style={{position: 'absolute', left: 30, top: 0, width: 10, height: 560, borderRadius: 5, background: 'rgba(255,255,255,0.25)'}} />
      <div style={{position: 'absolute', left: 30, bottom: 0, width: 10, height: 560 * Math.max(0, Math.min(1, k)), borderRadius: 5, background: GOLD, boxShadow: `0 0 16px ${GOLD}`}} />
      <div style={{position: 'absolute', right: 56, top: -14, fontSize: 34, fontWeight: 900, whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,.7)'}}>15 m+</div>
      <div style={{position: 'absolute', right: 56, bottom: -12, fontSize: 28, fontWeight: 700, whiteSpace: 'nowrap', opacity: 0.85, textShadow: '0 2px 10px rgba(0,0,0,.7)'}}>low tide</div>
    </div>
  );
};

export const Film: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const scene = sceneAt(t), haze = hazeAt(t);
  const pre = usePreload(), earthTex = useEarth();
  const ready = pre && !!earthTex;
  const honest = scene === 'space' ? (t < B.l3 ? 'Height exaggerated' : 'Not to scale · bumps exaggerated') : scene === 'fundy' ? 'Real terrain · heights ×6' : '';
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {ready && <ThreeCanvas width={1080} height={1920} gl={{antialias: true}} camera={{fov: 40, near: 0.01, far: 3000, position: [0, 3, 60]}}>
        {scene === 'beach' && <Beach t={t} phase="open" />}
        {scene === 'space' && <Space t={t} />}
        {scene === 'fundy' && <Fundy t={t} />}
        {scene === 'beach-end' && <Beach t={t} phase="end" />}
      </ThreeCanvas>}
      {/* the haze the camera passes through between worlds: sky-white from the beach, cloud-white into Fundy */}
      {/* the first passage is up through the night sky (dark); the others are through daylight cloud (white) */}
      <AbsoluteFill style={{background: t < CUTS[0][0] + CUTS[0][1] ? 'radial-gradient(ellipse at 50% 45%, #1A2440 0%, #0B1226 70%, #05080F 100%)' : 'radial-gradient(ellipse at 50% 45%, #F4F8FC 0%, #DCE8F2 60%, #C9D9E8 100%)', opacity: haze * (t < CUTS[0][0] + CUTS[0][1] ? 0.85 : 1)}} />
      <Tag text="Less than 1 m" o={win(t, B.meter - 0.1, B.canada - 0.6)} y={1180} />
      <TideBar t={t} />
      <Tag text="2 high tides a day" o={win(t, B.twohigh - 0.1, B.l7 - 0.2)} y={1180} />
      <Tag text="Bigger tides" o={win(t, B.bigger - 0.1, B.l8 - 0.2)} y={1180} />
      {honest && <Honest text={honest} />}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(6,8,12,0.34) 100%)'}} />
      <Captions t={t} words={words} lines={LINES} accent={GOLD} font={SANS} />
    </AbsoluteFill>
  );
};
