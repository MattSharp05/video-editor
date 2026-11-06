// Dream brain 01: town -> (window) -> bedroom -> (skin) -> brain city -> (the dream model) -> dream town -> (a streetlight)
// -> brain cell -> (out) -> brain recap -> (alarm) -> bedroom waking -> (window) -> town at morning.
// One canvas; the world changes only inside a glow the camera passes through. Captions from the voice, two small labels.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from './kit/three-canvas';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {C, ramp} from './kit/shared';
import {TownNight, Bedroom, BrainCity, DreamTown, Neuron} from './scenes';
import words from './words.json';
import B from './beats.json';

export const FPS = 30;
export const DUR = Math.ceil(B.total * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const win = (t: number, a: number, b: number, f = 0.3) => Math.min(interpolate(t, [a, a + f], [0, 1], clamp), interpolate(t, [b - f, b], [1, 0], clamp));

// world changes: [time, half-width of the glow, glow colour]
const PASS: [number, number, string][] = [
  [B.into_room, 0.3, '#FFC98A'], [B.into_brain, 0.35, '#FFC56E'], [B.into_dream, 0.4, '#FFC56E'], [B.into_cell, 0.4, '#FFD9A0'],
  [B.recap, 0.35, '#BFD4FF'], [B.into_wake, 0.3, '#FFFFFF'], [B.into_town, 0.35, '#FFD9B8'],
];
const worldAt = (t: number) => (t < B.into_room ? 'town' : t < B.into_brain ? 'bed' : t < B.into_dream ? 'brain' : t < B.into_cell ? 'dream'
  : t < B.recap ? 'cell' : t < B.into_wake ? 'recap' : t < B.into_town ? 'wake' : 'morning');

export const LINES = [
  'Most people think your brain [switches] [off] when you sleep.',
  "But when you dream, parts of it are almost as [busy] as when you're awake.",
  'Deep inside, the [brainstem] switches on', 'a kind of sleep called [REM.]', "That's when most big, vivid dreams happen.",
  'It makes your eyes [dart] around.', 'And it keeps most of your muscles [still,]', "so you don't act out your dream.",
  'At the back, the [seeing] [parts] make pictures,', 'even with your eyes shut.', "That's how he can [fly] over his town.",
  'The [feelings] [part] turns up.', "That's why a dream can feel [scary] or [exciting.]",
  'But the [front] [part,] the one that asks', '"does this make sense?", gets very [quiet.]', 'So flying feels [normal.]',
  'The [memory] [parts] mix bits of [today]', 'with [older] [memories.]',
  'All of this is tiny brain [cells] talking.', 'One cell sends a [spark] down its long arm.', 'At the end, it sends [chemicals]', 'across a tiny [gap] to the next cell.',
  'So the brainstem holds you [still,]', 'the back makes [pictures,]', 'the feelings [turn] [up,]', 'and the front stops asking [questions.]',
  'Then the alarm rings,', 'and most of the dream [slips] [away.]',
];

const Tag: React.FC<{text: string; o: number; y?: number; color?: string}> = ({text, o, y = 1300, color = '#fff'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 12}px)`}}>
    <div style={{padding: '8px 26px', borderRadius: 30, background: 'rgba(6,8,18,0.55)', fontFamily: SANS, color, fontSize: 44, fontWeight: 900, letterSpacing: 1,
      whiteSpace: 'nowrap', textShadow: '0 2px 18px rgba(0,0,0,0.6)'}}>{text}</div>
  </div>
);
// AWAKE vs DREAMING: two activity bars, nearly equal
const Busy: React.FC<{t: number}> = ({t}) => {
  const o = win(t, B.busy - 0.2, B.l2 - 0.1), k = ramp(t, B.busy - 0.1, B.busy + 0.9);
  const Bar = ({label, v, c}: {label: string; v: number; c: string}) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <div style={{width: 230, textAlign: 'right', fontSize: 34, fontWeight: 800, letterSpacing: 2}}>{label}</div>
      <div style={{width: 420, height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.15)'}}>
        <div style={{width: 420 * v * k, height: 18, borderRadius: 9, background: c, boxShadow: `0 0 16px ${c}`}} /></div>
    </div>);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1260, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: o, fontFamily: SANS, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,.7)'}}>
      <Bar label="AWAKE" v={1} c="#BFD4FF" /><Bar label="DREAMING" v={0.9} c={C.gold} />
    </div>);
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const t = useCurrentFrame() / FPS;
  const w = worldAt(t);
  const pass = PASS.map(([c, hw, col]) => [interpolate(t, [c - hw, c, c + hw], [0, 1, 0], clamp), col] as [number, string]).sort((a, b) => b[0] - a[0])[0];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('mix.wav')} />
      <ThreeCanvas width={1080} height={1920} gl={{antialias: true}} camera={{fov: 40, near: 0.01, far: 500, position: [0, 3, 30]}}>
        {w === 'town' && <TownNight t={t} phase="open" />}
        {w === 'bed' && <Bedroom t={t} phase="asleep" />}
        {w === 'brain' && <BrainCity t={t} phase="dive" />}
        {w === 'dream' && <DreamTown t={t} />}
        {w === 'cell' && <Neuron t={t} />}
        {w === 'recap' && <BrainCity t={t} phase="recap" />}
        {w === 'wake' && <Bedroom t={t} phase="wake" />}
        {w === 'morning' && <TownNight t={t} phase="morning" />}
      </ThreeCanvas>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, #FFFFFF 0%, ${pass[1]} 45%, ${pass[1]}00 100%)`, opacity: pass[0]}} />
      <Busy t={t} />
      <Tag text="REM sleep" o={win(t, B.rem - 0.1, B.eyes - 0.3)} color={C.gold} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(4,6,12,0.4) 100%)'}} />
      {captions && <Captions t={t} words={words} lines={LINES} accent={C.gold} font={SANS} />}
    </AbsoluteFill>
  );
};
