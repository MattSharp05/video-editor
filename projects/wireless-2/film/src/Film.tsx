// Caught by Wireless, part 2: "The chase". One camera thread: the Spark across the sea.
// Stages hand off by push-through: the next stage grows inside the carrier's circle while the old one zooms into it.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import words from './words.json';
import B from './beats.json';
import {chunkLines} from './kit/captions';
import {C, Defs, FONT, ramp, lin, osc, mix, win} from './look';
import {STAGES} from './stages';
import {Overlays} from './overlays';

export const FPS = 30;
export const DUR = Math.round(B.total * FPS);
const PT = 9 / 30; // push-through length (s)

const LINES = [
  'Last time, Cora Crippen vanished,', 'and police found human remains', 'under the cellar floor of their house.', 'Her husband had run away.',
  'This is Caught by Wireless.', 'Part two: the chase.',
  'Police sent out his description,', 'and newspapers printed his picture.',
  'But the doctor had shaved off', 'his big mustache', 'and stopped wearing his glasses.',
  'And Ethel cut her hair short', 'and dressed as a boy.',
  'They called themselves', 'Mr. Robinson and his son,', 'and got on a big ship to Canada.',
  "The ship's captain", 'was named Henry Kendall.', 'He watched his passengers closely.',
  "The captain later said the boy's", "clothes didn't fit,", 'and the "son" tenderly held', 'his "father\'s" hand.',
  'The captain had read', 'about the missing doctor.', 'He wondered,', 'could this be him?',
  'His ship had wireless,', 'a fairly new way', 'to send messages through the air,', 'with no wires.',
  'So the captain sent', 'a secret message back to land.', 'It said the doctor', 'might be on board,', 'with a helper dressed as a boy.',
  'Inspector Dew got the news.', 'He jumped on a faster ship', 'to beat them to Canada.',
  'Newspapers everywhere', 'wrote about the chase.', 'But the doctor had no idea', 'Inspector Dew was racing', 'to get there first.',
  'For days, the two ships', 'raced across the sea.',
  'Then one morning,', 'on a big river in Canada,', 'a small boat came out', "to meet the doctor's ship.",
  "A man dressed as a ship's pilot", 'climbed aboard.', "But he wasn't really a pilot.",
];
type Wd = {w: string; s: number; e: number};
const CHUNKS = chunkLines(words as Wd[], LINES);

// Series caption look (pick §1.5): Hanken 800 58 px, captionText with a deep stroke, no box, block in y 1300–1470;
// the spoken word gets a sliding spark "Morse dash" under it.
const Captions: React.FC<{t: number}> = ({t}) => {
  const idx = CHUNKS.findIndex((c, n) => t >= c.ws[0].s - 0.12 && (n === CHUNKS.length - 1 || t < CHUNKS[n + 1].ws[0].s - 0.12));
  if (idx < 0) return null;
  const c = CHUNKS[idx];
  const end = idx === CHUNKS.length - 1 ? c.ws[c.ws.length - 1].e + 0.7 : 1e9;
  if (t > end) return null;
  const o = Math.min(lin(t, c.ws[0].s - 0.12, 0.1), 1 - lin(t, end - 0.15, 0.15));
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 1300, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o}}>
      <div style={{textAlign: 'center', fontFamily: FONT.sans, fontWeight: 800, fontSize: 58, lineHeight: 1.18, color: C.captionText,
        WebkitTextStroke: `7px ${C.deep}`, paintOrder: 'stroke fill', letterSpacing: -0.3}}>
        {c.toks.map((tok, j) => {
          const w = c.ws[j];
          const active = t >= w.s - 0.03 && t < (c.ws[j + 1]?.s ?? w.e + 0.35);
          const k = active ? Math.min(1, (t - w.s + 0.03) / 0.2) : 0;
          return (
            <span key={j} style={{display: 'inline-block', margin: '0 9px', position: 'relative'}}>
              {tok}
              <span style={{position: 'absolute', left: 2, right: 2, bottom: -6, height: 8, borderRadius: 3, background: C.spark,
                boxShadow: `0 0 10px ${C.sparkHalo}`, transformOrigin: 'left', transform: `scaleX(${k})`, opacity: active ? 1 : 0}} />
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Grain: React.FC<{fr: number}> = ({fr}) => (
  <>
    <Img src={staticFile(`grain${Math.floor(fr / 2) % 3}.png`)} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, mixBlendMode: 'multiply', opacity: 0.06}} />
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 45%, rgba(38,65,79,0) 55%, rgba(38,65,79,0.25) 100%)`}} />
  </>
);

const StageSvg: React.FC<{i: number; t: number}> = ({i, t}) => {
  const S = STAGES[i].C;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <Defs />
      <rect width={1080} height={1920} fill={C.fog} />
      <S t={t} />
    </svg>
  );
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  let i = 0;
  while (i < STAGES.length - 1 && t >= STAGES[i + 1].at) i++;
  const next = STAGES[i + 1];
  // push-through into the next stage: during [next.at - PT, next.at)
  const p = next ? lin(t, next.at - PT, PT) : 0;
  const car = STAGES[i].out;
  let body: React.ReactNode;
  if (p > 0 && next && car) {
    const pe = p * p * (3 - 2 * p);
    const S = 1 + pe * 5;
    const R = car.r * S;
    const k = mix(car.r * 2.2 / 1080, 1, pe); // incoming scale
    const cx = mix(car.x, 540, pe), cy = mix(car.y, 960, pe);
    body = (
      <>
        <AbsoluteFill style={{transform: `scale(${S})`, transformOrigin: `${car.x}px ${car.y}px`}}><StageSvg i={i} t={t} /></AbsoluteFill>
        <AbsoluteFill style={{clipPath: `circle(${R}px at ${car.x + (cx - car.x) * 0}px ${car.y}px)`}}>
          <AbsoluteFill style={{transform: `translate(${car.x - 540 + (540 - car.x) * pe}px, ${car.y - 960 + (960 - car.y) * pe}px) scale(${k})`, transformOrigin: '540px 960px'}}>
            <StageSvg i={i + 1} t={t} />
          </AbsoluteFill>
        </AbsoluteFill>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <circle cx={car.x} cy={car.y} r={R} fill="none" stroke={C.spark} strokeWidth={8} opacity={1 - pe} />
          <circle cx={car.x} cy={car.y} r={R} fill="none" stroke={C.sparkHalo} strokeWidth={22} opacity={0.4 * (1 - pe)} />
        </svg>
      </>
    );
  } else {
    body = <StageSvg i={i} t={t} />;
  }
  return (
    <AbsoluteFill style={{background: C.fog, overflow: 'hidden'}}>
      {body}
      <Grain fr={fr} />
      <Overlays t={t} fr={fr} />
      {captions && <Captions t={t} />}
    </AbsoluteFill>
  );
};
