// Stolen Smile 3: "The return". One continuous camera through paper toy-theatre worlds; each world hands off to the
// next by a carrier push (the camera dives into the carrier, the next world opens out of it). Overlays (cards,
// name tags, honesty tags, captions) are the kit's, in screen space. All timing from beats.json.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {SeriesGrade} from './series/grade';
import {C} from './series/tokens';
import {CornerTab, TitleCard, EndCard, LastTime, NameTag, HonestyTag} from './series/cards';
import {Captions} from './series/captions';
import {chunk, WORDS} from './lib';
import {B, CL, pr} from './p3/util';
import {Recap, Title, Desk, Hotel, Room, TrunkTop, Check, Arrest} from './p3/scenesA';
import {Motive, Tour, Salon, Cell, Famous, Today} from './p3/scenesB';

export const FPS = 30;
export const DUR = Math.round(B.total * FPS);
const F = (s: number) => Math.round(s * FPS);

const LINES = [
  'Last time, a letter arrived in Florence,', 'signed Leonardo.', 'This is The Stolen Smile.', 'Part three. the return.',
  'The art dealer is named Alfredo.', 'Alfredo says the man wants', 'a huge pile of money.',
  'Alfredo pretends', 'he wants to buy it.', 'He brings a museum expert', 'to a small hotel', 'to check it.',
  'In room twenty,', 'a thin man with a mustache', 'opens a white trunk.',
  'He lifts out a false bottom.', 'Underneath, wrapped in red silk,', 'is the Mona Lisa.',
  'The expert checks the tiny cracks', 'in the paint,', 'and a seal on the back.', "It's the real one!",
  'The police arrest the thief.', "It's Vincenzo.",
  'Why did he do it?', 'He said the Mona Lisa', 'belonged in Italy.', 'He said she had been', 'stolen from there.',
  "But that wasn't true.", 'Leonardo da Vinci', 'brought her to France himself,', 'and a French king bought her.',
  'Before she goes home,', 'Italy shows her off.', 'Huge crowds come to see her.',
  'Then, in January 1914,', 'she goes back on her wall', 'in Paris.',
  'In just two days,', 'more than a hundred thousand people', 'come to see her.',
  'Vincenzo spends about seven months', 'in jail.',
  'And the Mona Lisa?', "She's more famous than ever.",
  'Today, millions of people', 'visit her every year.',
  'So the man', 'who stole her smile', 'helped make it', 'the most famous smile', 'in the world.',
];
const CHUNKS = chunk(WORDS, LINES);

// scene windows [start, end) in seconds: each starts on its line
const SCENES: [number, React.FC<{t: number; fr: number}>][] = [
  [0, Recap], [B.title, Title], [B.l2, Desk], [B.l3, Hotel], [B.l4, Room], [B.l5, TrunkTop], [B.l6, Check], [B.l7, Arrest],
  [B.l8, Motive], [B.l10, Tour], [B.l11, Salon], [B.l13, Cell], [B.l14, Famous], [B.l15, Today],
];
// the carrier colour that fills the frame at each hand-off (the camera passes through the carrier)
const PASS: Record<number, string> = {
  [B.l2]: C.silk, [B.l3]: '#C9D3B0', [B.l4]: C.nightBlue, [B.l5]: '#C9C0AE', [B.l6]: C.amberGlow, [B.l7]: C.clueRed,
  [B.l8]: '#FBFAF4', [B.l10]: C.amber, [B.l11]: C.clueRed, [B.l13]: C.card, [B.l14]: C.card,
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  let idx = 0;
  for (let i = 0; i < SCENES.length; i++) if (t >= SCENES[i][0]) idx = i;
  const Scene = SCENES[idx][1];
  const passCol = Object.entries(PASS).map(([k, col]) => [Number(k), col] as const).find(([k]) => Math.abs(t - k) < 0.2);
  const passO = passCol ? interpolate(Math.abs(t - passCol[0]), [0, 0.1, 0.2], [1, 0.85, 0], CL) : 0;
  const modern = t >= B.l15 - 0.3;
  const wash = modern ? 1 - pr(t, B.l15 - 0.3, 0.9) : undefined;
  return (
    <SeriesGrade fr={fr} grade={modern ? 'modern' : '1911'} wash={wash}>
      <AbsoluteFill style={{backgroundColor: C.paper}}>
        <Scene t={t} fr={fr} />
        {passO > 0 && <AbsoluteFill style={{backgroundColor: passCol![1], opacity: passO}} />}
      </AbsoluteFill>
      {/* series cards */}
      <CornerTab fr={fr} part={3} outAt={F(B.title) - 4} />
      <LastTime fr={fr} at={0} outAt={F(B.title) - 10} />
      <TitleCard fr={fr} at={F(B.title)} part={3} hangX={540} hangY={300} plateY={760} outAt={F(B.l2) - 22} />
      <NameTag fr={fr} at={F(B.alfredo)} text="Alfredo Geri, art dealer" y={440} dur={95} />
      <NameTag fr={fr} at={F(B.expert)} text="Giovanni Poggi, Uffizi museum" y={440} dur={80} />
      <NameTag fr={fr} at={F(B.vincenzo)} text="Vincenzo Peruggia" y={440} dur={60} />
      <NameTag fr={fr} at={F(B.leo)} text="Leonardo da Vinci" y={440} dur={80} />
      <HonestyTag fr={fr} at={F(B.italy)} text="He said this" dur={110} />
      <HonestyTag fr={fr} at={F(B.leo)} text="Illustration" dur={110} />
      <HonestyTag fr={fr} at={F(B.stole)} text="Illustration" dur={70} />
      <NameTag fr={fr} at={F(B.stole) + 4} text="Vincenzo" y={440} dur={60} />
      <EndCard fr={fr} at={F(B.end - 0.3)} part={3} text="The end" x={540} y={1230} />
      <Captions fr={fr} chunks={CHUNKS} show={captions} />
    </SeriesGrade>
  );
};
