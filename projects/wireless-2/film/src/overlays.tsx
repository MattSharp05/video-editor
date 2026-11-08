// Cards and tags over the picture: all from the series kit.
import React from 'react';
import B from './beats.json';
import {CornerTab, TitlePlaque, Subtitle, HonestyTag, EndCard} from './series/cards';

const f = (s: number) => Math.round(s * 30);
export const PLAQUE_OUT = B.l2 - 0.45;
export const END_AT = B.total - 2.3;

const Tag: React.FC<{fr: number; at: number; until: number; text: string; y?: number}> = ({fr, at, until, text, y = 1170}) =>
  <HonestyTag fr={fr} at={f(at)} dur={f(until - at)} text={text} y={y} />;

export const Overlays: React.FC<{t: number; fr: number}> = ({fr}) => (
  <>
    <CornerTab fr={fr} part={2} />
    <TitlePlaque fr={fr} at={72} outAt={f(PLAQUE_OUT)} />
    <Subtitle fr={fr} at={f(B.title)} part={2} beatAt={f(B.chase)} outAt={f(PLAQUE_OUT)} />
    <Tag fr={fr} at={0.4} until={B.l1 - 0.3} text="Last time…" />
    <Tag fr={fr} at={B.tenderly - 0.2} until={B.l8 - 0.2} text="As the captain told it" />
    <Tag fr={fr} at={B.onboard - 0.6} until={B.l11 - 0.3} text="Short version" />
    <Tag fr={fr} at={B.l13 + 0.3} until={B.l14 - 0.3} text="Short version: never side by side" />
    <EndCard fr={fr} at={f(END_AT)} part={2} />
  </>
);
