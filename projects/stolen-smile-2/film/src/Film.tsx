// The Stolen Smile, part 2: "The hunt". One continuous paper stage: each stage hands off to the next through its carrier
// (the camera pushes into it until it fills the frame, and the next stage grows out of the same colour).
// Captions: series look (torn card strip, baseline y≈1480). Overlays: corner tab, "Last time…", honesty tags, end card.
import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import './kit/fonts';
import words from './words.json';
import B from './beats.json';
import {chunkLines} from './kit/captions';
import {C, Defs, Grade, NameTag, SANS, TYPE, SERIF, ramp, lin, osc, Cut, rect} from './look';
import {S1, S1_OUT, S2, S2_OUT, S3, S3_OUT, S4, S4_OUT, S5, S5_OUT} from './scenesA';
import {S6, S6_OUT, S7, S7_OUT, S8a, S8a_OUT, S8b, S8b_OUT, S8c, S8c_OUT, S9a, S9a_OUT, S9b, S9b_OUT, S9c, S9c_OUT, S10a, S10a_OUT, S10b, S10b_OUT, S11} from './scenesB';

export const FPS = 30;
export const DUR = Math.round(B.total * FPS);

type Out = {x: number; y: number; color: string};
const STAGES: [number, React.FC<{t: number}>, Out | null][] = [
  [0, S1, S1_OUT], [B.l2 - 0.3, S2, S2_OUT], [B.l3 - 0.3, S3, S3_OUT], [B.l4 - 0.3, S4, S4_OUT], [B.l5 - 0.3, S5, S5_OUT],
  [B.l7 - 0.3, S6, S6_OUT], [B.l10 - 0.3, S7, S7_OUT], [B.l12 - 0.3, S8a, S8a_OUT], [B.l13 - 0.15, S8b, S8b_OUT],
  [B.hidden + 0.6, S8c, S8c_OUT], [B.l14 - 0.3, S9a, S9a_OUT], [B.l15 - 0.4, S9b, S9b_OUT], [B.fear + 0.4, S9c, S9c_OUT],
  [B.l16 + 0.2, S10a, S10a_OUT], [B.florence + 1.0, S10b, S10b_OUT], [B.l17 - 0.1, S11, null],
];
export const BOUNDS = STAGES.map((s) => s[0]);
const PUSH = 0.38; // seconds each side of a hand-off

const LINES = [
  'Last time, a man named Vincenzo', 'walked out of the Louvre', 'with the Mona Lisa.',
  'This is The Stolen Smile.', 'Part two: the hunt.',
  'The museum closes', 'for a whole week', 'while police search it.',
  'Newspapers all over the world', 'tell the story.', 'Suddenly, people all over the world', 'know her name.',
  'People sing songs about her,', 'and sell funny postcards.',
  'When the museum opens again,', 'crowds line up', 'to stare at an empty wall.',
  'One of them is Franz Kafka,', 'who later became a famous writer.',
  'Who did it?', 'Police arrest a well-known poet', 'and lock him up', 'for a few days.',
  'They even question a young painter', 'named Pablo Picasso.',
  'But neither one stole her.', 'Both are let go.',
  'The thief left a thumbprint.', 'But the police', 'never match it to him.',
  'Back then, police sorted their files', 'by body measurements,', 'not fingerprints.',
  "Police even knock on Vincenzo's door.", 'They look around his little room,', 'and leave.',
  'And where is the Mona Lisa?', 'Hidden in that same little room.',
  'Days turn into months.', 'Months turn into years.',
  "Many people fear she's gone forever.",
  'Then, two years later,', 'an art dealer in Florence, Italy,', 'opens a letter.',
  'The writer says', 'he has the Mona Lisa.', 'And he signs it', "with the painter's name, Leonardo.",
];
type Wd = {w: string; s: number; e: number};
const CHUNKS = chunkLines(words as Wd[], LINES);

const Captions: React.FC<{t: number}> = ({t}) => {
  const idx = CHUNKS.findIndex((c, n) => t >= c.ws[0].s - 0.1 && (n === CHUNKS.length - 1 || t < CHUNKS[n + 1].ws[0].s - 0.1));
  if (idx < 0) return null;
  const c = CHUNKS[idx];
  const end = idx === CHUNKS.length - 1 ? c.ws[c.ws.length - 1].e + 0.6 : 1e9;
  if (t > end) return null;
  const drop = Math.min(1, (t - (c.ws[0].s - 0.1)) / (4 / 30));
  const tilt = (random(`cap${idx}`) - 0.5) * 3;
  const isMona = (j: number) => {
    const w = c.toks[j].toLowerCase().replace(/[^a-z]/g, '');
    const nx = (c.toks[j + 1] ?? '').toLowerCase().replace(/[^a-z]/g, ''), pv = (c.toks[j - 1] ?? '').toLowerCase().replace(/[^a-z]/g, '');
    return (w === 'mona' && nx === 'lisa') || (w === 'lisa' && pv === 'mona');
  };
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1480 - 150 - (1 - drop) * 30, height: 150, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', opacity: drop}}>
      <div style={{position: 'relative', maxWidth: 860, padding: '14px 30px 20px', background: C.card, transform: `rotate(${tilt}deg)`,
        boxShadow: '8px 10px 0 rgba(35,27,22,0.28)', border: `3px solid ${C.ink}`,
        clipPath: 'polygon(0% 6%, 4% 0%, 12% 5%, 22% 1%, 35% 4%, 50% 0%, 63% 5%, 78% 1%, 90% 4%, 100% 0%, 99% 94%, 92% 100%, 80% 95%, 66% 100%, 52% 96%, 38% 100%, 24% 95%, 10% 100%, 0% 96%)',
        fontFamily: SANS, fontWeight: 800, fontSize: 60, lineHeight: 1.12, color: C.ink, textAlign: 'center', letterSpacing: -0.5}}>
        {c.toks.map((tok, j) => {
          const w = c.ws[j];
          const active = t >= w.s - 0.03 && t < (c.ws[j + 1]?.s ?? w.e + 0.3);
          const mona = isMona(j);
          return (
            <span key={j} style={{display: 'inline-block', margin: '0 8px', position: 'relative', color: mona ? C.amber : C.ink,
              WebkitTextStroke: mona ? `2px ${C.ink}` : undefined}}>
              {tok}
              <span style={{position: 'absolute', left: 0, right: 0, bottom: -4, height: 5, background: C.ink, transformOrigin: 'left', transform: `scaleX(${active ? 1 : 0})`}} />
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Honesty: React.FC<{text: string; o: number}> = ({text, o}) => (
  <div style={{position: 'absolute', left: 64, top: 1318, opacity: o * 0.8, fontFamily: TYPE, fontSize: 28, color: C.ink, background: 'rgba(248,241,225,0.75)', padding: '4px 12px'}}>{text}</div>
);
const win = (t: number, a: number, b: number) => Math.min(ramp(t, a, 0.3), 1 - ramp(t, b - 0.3, 0.3));

const CornerTab: React.FC<{t: number}> = ({t}) => {
  const away = ramp(t, B.l1 - 0.2, 0.5) * (1 - ramp(t, B.l2 + 0.5, 0.5));
  return (
    <div style={{position: 'absolute', left: 64 - away * 700, top: 230, fontFamily: TYPE, fontSize: 34, color: C.ink, background: C.card, padding: '8px 18px',
      border: `2.5px solid ${C.ink}`, boxShadow: '8px 10px 0 rgba(35,27,22,0.28)', transform: `rotate(${-1 + osc(t, 0.3) * 0.5}deg)`}}>The Stolen Smile · Part 2 of 3</div>
  );
};
const LastTime: React.FC<{t: number}> = ({t}) => {
  const pin = ramp(t, 0.1, 0.25), out = ramp(t, B.l1 - 0.5, 0.4);
  if (out >= 1) return null;
  return (
    <div style={{position: 'absolute', left: 64, top: 320 - out * 300, opacity: 1 - out, transform: `scale(${1.3 - 0.3 * pin}) rotate(${-3 + (1 - pin) * 8}deg)`, transformOrigin: 'left top',
      fontFamily: TYPE, fontSize: 52, color: C.ink, background: C.card, padding: '10px 26px', border: `2.5px solid ${C.ink}`, boxShadow: '8px 10px 0 rgba(35,27,22,0.28)'}}>
      Last time…
      <div style={{position: 'absolute', left: '50%', top: -12, width: 22, height: 22, borderRadius: 11, background: C.clueRed, border: `2px solid ${C.ink}`}} />
    </div>
  );
};
const EndCard: React.FC<{t: number}> = ({t}) => {
  const at = B.total - 1.9;
  if (t < at - 0.2) return null;
  const k = Math.min(1, Math.max(0, (t - at) / 0.13));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 240, display: 'flex', justifyContent: 'center'}}>
      <div style={{transform: `scale(${1 + (1 - k) * 0.6}) rotate(${2 + osc(t, 0.3) * 0.4}deg)`, opacity: k, background: C.card, border: `3px solid ${C.ink}`, boxShadow: '8px 10px 0 rgba(35,27,22,0.28)',
        padding: '18px 40px 22px', textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 40, color: C.ink}}>The Stolen Smile</div>
        <div style={{fontFamily: TYPE, fontSize: 52, color: C.ink, marginTop: 6}}>Next: The return</div>
      </div>
    </div>
  );
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  let i = 0;
  while (i < STAGES.length - 1 && t >= STAGES[i + 1][0]) i++;
  const [start, Stage] = STAGES[i];
  const next = STAGES[i + 1];
  const out = next ? STAGES[i][2] : null;
  // outgoing push: scale about the carrier and grow the carrier's colour over the frame
  const pOut = next && out ? ramp(t, next[0] - PUSH, PUSH) : 0;
  const prevOut = i > 0 ? STAGES[i - 1][2] : null;
  const pIn = i > 0 ? 1 - ramp(t, start, PUSH) : 0;
  const ox = out?.x ?? 540, oy = out?.y ?? 960;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <AbsoluteFill style={{transform: `scale(${1 + pOut * 0.8 + pIn * 0.35})`, transformOrigin: pOut > 0 ? `${ox}px ${oy}px` : '540px 960px'}}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
          <Defs />
          <Stage t={t} />
        </svg>
      </AbsoluteFill>
      {pOut > 0 && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={ox} cy={oy} r={pOut * pOut * 1500} fill={out!.color} stroke={C.ink} strokeWidth={6} />
      </svg>}
      {pIn > 0 && prevOut && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={`M0,0 H1080 V1920 H0 Z M540,${960 - pIn * pIn * 1500} a${pIn * pIn * 1500},${pIn * pIn * 1500} 0 1,0 0.1,0 Z`} fillRule="evenodd" fill={prevOut.color} />
        <circle cx={540} cy={960} r={pIn * pIn * 1500} fill="none" stroke={C.ink} strokeWidth={6} />
      </svg>}
      {/* overlays */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <NameTag x={300} y={430} text="Vincenzo" k={lin(t, 0.7, 0.9) * (1 - ramp(t, B.l1 - 0.6, 0.4))} t={t} size={44} />
      </svg>
      <CornerTab t={t} />
      <LastTime t={t} />
      <Honesty text="Illustration" o={win(t, B.postcards - 0.2, B.l5 - 0.4)} />
      <Honesty text="Illustration" o={win(t, B.picasso + 0.3, B.l9 - 0.2)} />
      <Honesty text="Some say: in a trunk" o={Math.max(win(t, B.look - 0.3, B.l13 - 0.2), win(t, B.hidden + 0.7, B.l14 - 0.3))} />
      <Honesty text="Illustration · the letter's words are not quoted" o={win(t, B.l17 + 0.3, B.total)} />
      <Grade fr={fr} />
      {captions && <Captions t={t} />}
      <EndCard t={t} />
    </AbsoluteFill>
  );
};
