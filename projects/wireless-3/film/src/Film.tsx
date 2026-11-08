// Caught by Wireless 3: "The verdict". One continuous camera through the series' "Wireless Night" world; each scene
// hands off to the next by a push-through or a ride (PLAN.md thread table). All timing from beats.json.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {T} from './p3/tok';
import {B, F} from './p3/util';
import {Defs3} from './p3/props';
import {chunk, WORDS} from './lib';
import {tag3, caps3} from './p3/cards';
import {Card} from './p3/K';
import {Recap, Title, Deck, Cabin, Ethel, London, CourtScene} from './p3/scenesA';
import {Free, FirstTime, Twist, Lab, Question, Rise} from './p3/scenesB';

export const FPS = 30;
export const DUR = Math.round(B.total * FPS);

// caption sense units (checked word for word against words.json at load)
const LINES = [
  'Last time, Inspector Dew', 'raced across the ocean,', 'and a man dressed as a pilot', "climbed onto the doctor's ship.",
  'This is Caught by Wireless.', 'Part three: the verdict.',
  'The pilot was really Inspector Dew,', 'in disguise.',
  'When Mr. Robinson came near,', 'the inspector said,', '"Good morning, Doctor Crippen."',
  'The chase was over.', 'Police found Ethel too,', 'still dressed as a boy.',
  'Back in London,', "the doctor said he didn't do it.", 'So a big trial began', 'at the famous Old Bailey court.',
  'A scientist said he found', 'an unusual, dangerous drug', 'in the remains.', 'The doctor had bought', 'that same drug that winter.',
  'And with them was', 'a piece of pajama shirt', 'from a store', 'where the doctor shopped.',
  'The jury said the doctor', 'was guilty of murder.', 'He was put to death,', 'which was the law back then.',
  'Ethel had a trial too.', 'She was found not guilty,', 'and went free.',
  'It was one of the first times', 'a wireless message from a ship', 'helped catch someone.',
  'But the story has', 'one last twist.',
  'In 2007, scientists tested', 'a tiny sample', 'kept from the trial.', 'They said it did not match', "people believed to be Cora's family.",
  'Other experts say', 'that test may be wrong.', 'The case has never been reopened.',
  'Did the doctor do it?', 'A jury said yes.', 'Some people still argue.',
  'And he was caught thanks to', 'a sharp-eyed captain', 'and a message', 'sent through the air.',
];
const CHUNKS = chunk(WORDS, LINES);

const SCENES: [number, React.FC<{t: number; fr: number}>][] = [
  [0, Recap], [B.l1, Title], [B.l2, Deck], [B.l3, Cabin], [B.l4, Ethel], [B.l5, London], [B.l6, CourtScene],
  [B.l9, Free], [B.l10, FirstTime], [B.l11, Twist], [B.l12, Lab], [B.l14, Question], [B.l15, Rise],
];

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  let idx = 0;
  for (let i = 0; i < SCENES.length; i++) if (t >= SCENES[i][0]) idx = i;
  const Scene = SCENES[idx][1];
  return (
    <AbsoluteFill style={{backgroundColor: T.deep}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><Defs3 /></svg>
      <Scene t={t} fr={fr} />
      {Card.cornerTab({fr, part: 3})}
      {tag3(fr, F(B.goodmorning), 'Illustration', 80)}
      {tag3(fr, F(B.experts + 0.2), 'Some say…', 100)}
      {caps3(fr, CHUNKS, captions)}
    </AbsoluteFill>
  );
};
