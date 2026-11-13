// The animatic: every board frame in order, timed from the narration (line starts), with the camera moving
// from where the last beat left the eye to the approved key frame. Within one set the move is continuous;
// between sets the camera ends close on the amber thing and the next set opens close on its amber thing,
// joined by a short dissolve (a stand-in for the true grow-into transitions of the final build).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import * as THREE from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ThreeCanvas} from './kit/three-canvas';
import {Finish} from './kit/finish';
import {EniacSet} from './eniac';
import {SwitchSet} from './switches';
import {CardSet} from './cards';
import {BatchSet} from './batch';
import {TerminalSet} from './terminal';
import {EditorSet} from './editor';
import {EndingSet, ERAS} from './ending';
import {SANS} from './kit/fonts';
import {BEATS, Beat} from './beats';
import {Cam, HandAt} from './StyleFrame';
import WORDS from './words_standin.json';
import LINES from './lines_standin.json';

export const FPS = 30;
const VO_END = 56.54;
export const DUR = Math.ceil((VO_END + 1.6) * FPS);

const ORDER = ['hook', 'cables', 'switches', 'cards', 'batch', 'typo', 'terminal', 'editors', 'ai_lines', 'describe', 'ending'];
const SCRIPT = [
  'How did people write code before screens?',
  'In 1946, programmers wrote code with cables. Each new problem took days to plug in.',
  'Some machines used switches. Each switch was a one or a zero.',
  'Then programmers typed short words, like ADD, onto paper cards.',
  'A program was a box of cards. You handed it in and often waited hours for the answer.',
  'One typo, and you waited all over again.',
  'Then terminals let programmers type straight into the computer, first on paper, then on screens. Mistakes took minutes to fix, not hours.',
  'Next, editors started helping. They coloured the code and finished your words.',
  'In 2021, AI started finishing whole lines.',
  'Now many programmers describe what they want in plain English. AI writes the code, and they check it.',
  'Cables, switches, cards, screens, sentences. The tools kept changing. The job stayed the same: tell the machine exactly what you mean.',
];
const LEAD = 0.3; // picture leads the voice slightly
const startOf = (i: number) => (i === 0 ? 0 : (LINES as number[])[i] - LEAD);
const endOf = (i: number) => (i === ORDER.length - 1 ? DUR / FPS : startOf(i + 1));

// Where each beat's camera starts: the previous key (same set) or close on this set's amber element.
type Pose = {cam: number[]; look: number[]; fov: number};
const closer = (k: Pose, f: number): Pose => ({cam: k.cam.map((c, i) => k.look[i] + (c - k.look[i]) * f), look: k.look, fov: k.fov});
const startPose = (i: number): Pose => {
  const b = BEATS[ORDER[i]], prev = i > 0 ? BEATS[ORDER[i - 1]] : null;
  if (prev && prev.set === b.set) return {cam: prev.cam, look: prev.look, fov: prev.fov};
  if (ORDER[i] === 'hook') return closer(b, 1.35);
  if (ORDER[i] === 'ending') return {cam: [0, 0.3, 1.0], look: [0, 0.3, 0], fov: b.fov}; // framed on the front (Claude) pane
  return closer(b, 0.45);
};

// Captions: sense units of at most ~7 words, split at sentence ends and commas; word timing from the VO.
type Chunk = {words: string[]; times: number[]};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = []; let wi = 0;
  const W = WORDS as {w: string; s: number; e: number}[];
  SCRIPT.forEach((line) => {
    const words = line.split(' ');
    let cur: Chunk = {words: [], times: []};
    words.forEach((w, k) => {
      cur.words.push(w); cur.times.push(W[Math.min(wi, W.length - 1)].s); wi++;
      const left = words.length - 1 - k;
      const end = /[.?:]$/.test(w) || (/,$/.test(w) && cur.words.length >= 4 && left >= 3) || (cur.words.length >= 7 && left >= 3);
      if (end || k === words.length - 1) { out.push(cur); cur = {words: [], times: []}; }
    });
  });
  return out;
})();

const Captions: React.FC<{t: number}> = ({t}) => {
  let c = CHUNKS.findIndex((ch, i) => t >= ch.times[0] - 0.12 && (i === CHUNKS.length - 1 || t < CHUNKS[i + 1].times[0] - 0.12));
  if (c < 0) return null;
  const ch = CHUNKS[c];
  const lit = ch.times.filter((s) => t >= s).length;
  return (
    <div style={{position: 'absolute', top: 300, left: 90, right: 90, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 84, lineHeight: 1.08, letterSpacing: -1.5}}>
      {ch.words.map((w, i) => (
        <span key={i} style={{color: i < lit ? '#ffffff' : 'rgba(255,255,255,0.38)', textShadow: '0 2px 18px rgba(0,0,0,0.6)'}}>{w} </span>
      ))}
    </div>
  );
};

const lerp = (a: number[], b: number[], p: number) => a.map((x, i) => x + (b[i] - x) * p);

export const Film: React.FC<{animatic?: boolean}> = ({animatic = false}) => {
  const fr = useCurrentFrame(), t = fr / FPS;
  const [g, setG] = useState<{right: GLTF; left: GLTF} | null>(null);
  const [board, setBoard] = useState<THREE.Texture[] | null>(null);
  const [h] = useState(() => delayRender('film assets'));
  useEffect(() => {
    const l = new GLTFLoader(), tl = new THREE.TextureLoader();
    Promise.all([
      Promise.all(['right', 'left'].map((m) => l.loadAsync(staticFile(`models/hand-${m}.glb`)))),
      Promise.all(ERAS.map((e) => tl.loadAsync(staticFile(`board/${e}.jpg`)))),
    ]).then(([[right, left], ts]) => {
      ts.forEach((x) => { x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 8; });
      setG({right, left}); setBoard(ts); continueRender(h);
    });
  }, [h]);
  if (!g || !board) return null;

  const i = Math.max(0, ORDER.findIndex((_, k) => t >= startOf(k) && t < endOf(k)));
  const key = ORDER[i], b: Beat = BEATS[key];
  const t0 = startOf(i), t1 = endOf(i), span = t1 - t0, local = (t - t0) / span;
  // camera: ease from the start pose to the key over the first 60%, then a slow 4% push
  const A = startPose(i);
  const p = Easing.inOut(Easing.cubic)(Math.min(1, local / 0.6));
  const K = closer(b, 1 - 0.04 * Math.max(0, (local - 0.6) / 0.4));
  const pose = {cam: lerp(A.cam, K.cam, p), look: lerp(A.look, K.look, p), fov: A.fov + (K.fov - A.fov) * p};
  // hands: the hook's hand arrives and plugs in; others hold their key pose
  const hands = b.hands.map((hs) => key === 'hook' ? {...hs, p: lerp([hs.p[0] + 0.05, hs.p[1] - 0.02, hs.p[2] + 0.09], hs.p, Easing.out(Easing.cubic)(Math.min(1, local / 0.7)))} : hs);
  // dissolve at a change of set
  const nextSet = i < ORDER.length - 1 ? BEATS[ORDER[i + 1]].set : null;
  const prevSet = i > 0 ? BEATS[ORDER[i - 1]].set : null;
  const fadeOut = nextSet && nextSet !== b.set ? interpolate(t, [t1 - 0.22, t1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const fadeIn = prevSet && prevSet !== b.set ? interpolate(t, [t0, t0 + 0.22], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const dip = Math.max(fadeOut, fadeIn);
  // per-beat motion
  const cols = key === 'cards' ? Math.round(11 + 12 * Math.min(1, local / 0.8)) : 23;
  const clock: [number, number] = key === 'batch' ? [4, 47 + Math.round(145 * Easing.inOut(Easing.quad)(Math.max(0, (local - 0.45) / 0.55)))] : (b.clock ?? [4, 47]);

  return (
    <AbsoluteFill style={{background: '#100f0e'}}>
      <Finish fr={fr} bloom={0.45}>
        <ThreeCanvas width={1080} height={1920} dpr={1} shadows
          onCreated={({gl}) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; }}>
          <Cam cam={pose.cam} look={pose.look} fov={pose.fov} />
          {b.set === 'eniac' && <EniacSet glow={1} fill={key === 'cables' ? 1.5 * p : 0} />}
          {b.set === 'switches' && <SwitchSet />}
          {b.set === 'cards' && <CardSet cols={cols} />}
          {b.set === 'batch' && <BatchSet mode={b.mode} clock={clock} />}
          {b.set === 'terminal' && <TerminalSet />}
          {b.set === 'editor' && <EditorSet mode={b.editor ?? 'complete'} pressed={b.editor === 'complete' ? 'U' : b.editor === 'claude' ? 'ENTER' : undefined} />}
          {b.set === 'ending' && <EndingSet tex={board} />}
          {hands.map((hs, k) => <HandAt key={`${key}${k}`} g={g[hs.model]} h={hs} />)}
        </ThreeCanvas>
      </Finish>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,9,8,0.75) 0%, rgba(10,9,8,0) 32%, rgba(10,9,8,0) 80%, rgba(10,9,8,0.6) 100%)'}} />
      <AbsoluteFill style={{background: '#120c06', opacity: dip}} />
      <Captions t={t} />
      <div style={{position: 'absolute', bottom: 230, left: 64, fontFamily: SANS, fontWeight: 500, fontSize: 34, color: 'rgba(255,255,255,0.72)'}}>{b.label}</div>
      <div style={{position: 'absolute', bottom: 230, right: 64, fontFamily: SANS, fontWeight: 500, fontSize: 34, color: 'rgba(255,255,255,0.72)'}}>Illustration</div>
      {animatic && <div style={{position: 'absolute', top: 70, left: 64, fontFamily: SANS, fontWeight: 600, fontSize: 28, color: 'rgba(255,179,71,0.8)'}}>Animatic · stand-in voice</div>}
    </AbsoluteFill>
  );
};
