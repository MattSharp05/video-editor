// TEMP look-test of the part-only sets (replaced by the real film shell once the kit lands)
import React from 'react';
import {useCurrentFrame} from 'remotion';
import B from './beats.json';
import {World, Layer, camAt} from './p1/rig';
import {InkDefs} from './p1/ink';
import {K} from './p1/tok';
import {LondonStreet, MusicHall, Ballroom, AlbionDoor} from './p1/sets';
import {P1Card, P1OperaGlasses, P1StoryCard} from './p1/props';
export const FPS = 30;
export const DUR = Math.round(B.total * FPS);
export const Film: React.FC<{captions?: boolean}> = () => {
  const t = useCurrentFrame() / 30;
  const st = Math.floor(t / 2) % 5;
  const cam = st === 0 ? camAt(t, [[0, {x: 540, y: -700, z: 1}], [1.6, {x: 540, y: 960, z: 1}]]) : {x: 540, y: 960, z: 1};
  return (
    <World cam={cam} bg={K.deep}>
      <InkDefs />
      {st === 0 && <><Layer k={0.2}><LondonStreet t={t} plane="sky" /></Layer><Layer k={0.5}><LondonStreet t={t} plane="far" /></Layer><Layer k={0.8}><LondonStreet t={t} plane="mid" /></Layer><Layer k={1}><LondonStreet t={t} plane="near" footlights={0.6} /></Layer></>}
      {st === 1 && <><Layer k={1}><MusicHall t={t} plane="back" /><MusicHall t={t} plane="house" /></Layer><Layer k={1.4}><MusicHall t={t} plane="fore" /></Layer></>}
      {st === 2 && <><Layer k={1}><Ballroom t={t} plane="back" /><Ballroom t={t} plane="dancers" /></Layer><Layer k={1.4}><Ballroom t={t} plane="fore" /></Layer><P1OperaGlasses x={900} y={700} s={1.2} /></>}
      {st === 3 && <AlbionDoor t={t} open={0.3} />}
      {st === 4 && <><rect width={1080} height={1920} fill={K.slate} /><P1StoryCard x={540} y={600} kind="america" t={t} wet={0.6} /><P1StoryCard x={540} y={1050} kind="ranaway" t={t} wet={0.3} /><P1Card x={300} y={1400} flip={1} suit={0} /><P1Card x={450} y={1400} flip={0.2} suit={2} /><P1Card x={600} y={1400} flip={0} /></>}
    </World>
  );
};
