// Caught by Wireless, part 2: "The chase". One camera thread: the Spark across the sea.
// Stages hand off by push-through: the next stage grows inside the carrier's circle while the old one zooms into it.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import words from './words.json';
import B from './beats.json';
import {chunkLines} from './kit/captions';
import {Captions as KitCaptions, CapChunk, CapWord} from './series/captions';
import {Grade} from './series/look';
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

// Captions: the kit's series look (Hanken 800 58, deep stroke, spark Morse dash) from hand-written sense units.
const wrap = (ws: CapWord[]): CapWord[][] => {
  const lines: CapWord[][] = [[]]; let n = 0;
  ws.forEach((w) => { const l = w.text.length + (n ? 1 : 0); if (n + l > 30 && lines[lines.length - 1].length) { lines.push([]); n = 0; } lines[lines.length - 1].push(w); n += w.text.length + 1; });
  return lines;
};
const KCHUNKS: CapChunk[] = CHUNKS.map((c, n) => {
  const ws = c.ws.map((w, j) => ({text: c.toks[j], s: Math.round(w.s * 30), e: Math.round(w.e * 30)}));
  const s = ws[0].s - 3, e = n < CHUNKS.length - 1 ? Math.round(CHUNKS[n + 1].ws[0].s * 30) - 3 : ws[ws.length - 1].e + 21;
  return {words: ws, s, e, lines: wrap(ws)};
});

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
    <Grade fr={fr}>
      {body}
      <Overlays t={t} fr={fr} />
      <KitCaptions fr={fr} chunks={KCHUNKS} show={captions} />
    </Grade>
  );
};
