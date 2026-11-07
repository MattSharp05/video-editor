// AI image 01: desk (the myth, static, typing, send) -> through the paper plane -> room (words to number tapes, the
// old TV, the denoise steps, the wall of TVs) -> through the dog TV's glass -> corridor of steps -> the last frame is
// the phone's picture bubble -> pull back to the phone. One continuous move; each change of world is a pass-through.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {ACCENT, B, camAt, FPS, Key, pr, win, World} from './common';
import {Captions} from './kit/captions';
import {SANS} from './kit/fonts';
import {DeskWorld, deskPlane, REPLY, T_FILL, T_LAND} from './Desk';
import {C0, RED_CAR, RoomBG, roomPlane, RoomWorld, SCR, TV, noiseURL} from './Room';
import {Corridor} from './Corridor';
import {Plane} from './Plane';
import {drawDogPhoto, drawPizzaPhoto, drawTarget, drawWavePhoto, picURL, TRAINING} from './art';
import words from './words.json';

export const DUR = Math.ceil(B.total * FPS);

const LINES = [
  'Most people think AI [glues] together', 'bits of real [photos.]', 'But actually, many AI picture makers', 'start with fuzzy [static.]',
  'You type: a dog surfing on a pizza.', 'Then you hit [send.]', "The AI can't use words directly,", 'so it turns them into [numbers.]',
  'Then it makes a picture of pure [static,]', 'like an old TV.', 'It [guesses] which part is just noise,', 'and [wipes] a little away.',
  'It often does that [twenty] to [fifty] times.', 'Each time, the whole picture gets [clearer.]', 'Your words [steer] every guess.',
  'So the blobs become', 'a [dog,] a [wave,] and a [pizza.]', 'How did it learn?', 'It practiced on [billions] of pictures with captions.',
  'It [covered] each one in static,', 'then learned to [clean] it up.', 'So words become [numbers,]', 'static gets [cleaned,]',
  'and a brand new picture', 'lands on your [phone.]',
];

// desk camera (phone at 0,0): tight on the scissors, pull back to the collage, down to the keyboard, chase the plane
const DESK_KEYS: Key[] = [
  [0, -470, -700, 1.55], [1.3, -280, -430, 1.15], [2.9, 0, -150, 0.92], [B.static2 - 0.2, 0, -150, 0.99], [B.static2 + 0.7, 0, -20, 1.0],
  [B.type, 0, 170, 1.05], [B.then3, 10, 175, 1.09], [B.send + 0.3, 60, -120, 1.0], [T_FILL, 300, -360, 1.3],
];
const END_KEYS: Key[] = [[T_LAND, REPLY.x, REPLY.y, 900 / REPLY.w], [T_LAND + 1.15, 0, -40, 0.95], [B.total, 0, -30, 0.92]];
// room camera
const ROOM_KEYS: Key[] = [
  [T_FILL, 0, -380, 1.05], [B.words4, -50, -260, 1.18], [B.so4 + 0.2, 20, 60, 1.05], [B.numbers + 0.5, 700, 180, 0.9],
  [B.purestatic - 0.2, 1750, 150, 0.72], [B.oldtv - 0.1, SCR.x, SCR.y, 1.0], [B.l5 - 0.05, SCR.x, SCR.y, 1.38],
  [B.l6, SCR.x + 15, SCR.y - 10, 1.44], [B.l7 + 0.1, SCR.x - 10, SCR.y, 1.5], [B.blobs - 0.2, 2420, 260, 0.78], [B.l8 - 0.1, 2400, 230, 0.82],
  [B.billions + 0.4, 2950, 180, 0.22], [B.covered, 3150, 170, 0.27], [B.clean + 0.6, RED_CAR.x - 60, RED_CAR.y + 20, 0.5], [B.l9 + 0.05, RED_CAR.x - 200, RED_CAR.y, 0.52],
  [C0, SCR.x, SCR.y, 900 * 3 / SCR.w],
];

const usePreload = () => {
  const [h] = useState(() => delayRender('pictures'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const urls = [picURL('dogp', drawDogPhoto), picURL('pizzap', drawPizzaPhoto), picURL('wavep', drawWavePhoto), picURL('tgt', drawTarget),
      ...TRAINING.map((p) => picURL(p.id, p.draw)), ...[0, 1, 2, 3].map(noiseURL)];
    Promise.all(urls.map((u) => { const im = new Image(); im.src = u; return im.decode(); })).then(() => { setOk(true); continueRender(h); });
  }, [h]);
  return ok;
};

export const Film: React.FC<{captions?: boolean}> = ({captions = true}) => {
  const t = useCurrentFrame() / FPS;
  const ready = usePreload();
  if (!ready) return <AbsoluteFill style={{background: '#2A1A12'}} />;
  const where = t < T_FILL ? 'desk' : t < C0 ? 'room' : t < T_LAND ? 'corridor' : 'end';
  let body: React.ReactNode = null;
  if (where === 'desk' || where === 'end') {
    const cam = camAt(t, where === 'desk' ? DESK_KEYS : END_KEYS);
    const pl = deskPlane(t);
    body = (
      <World cam={cam}>
        <DeskWorld t={t} phase={where === 'desk' ? 'start' : 'end'} />
        {pl.on && <div style={{position: 'absolute', left: pl.x - pl.size / 2, top: pl.y - pl.size / 2, transform: `rotate(${pl.rot}deg)`,
          filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.45))'}}><Plane size={pl.size} fold={pl.fold} /></div>}
      </World>
    );
  } else if (where === 'room') {
    const cam = camAt(t, ROOM_KEYS);
    const pl = roomPlane(t);
    body = (
      <>
        <RoomBG t={t} cam={cam} />
        <World cam={cam}>
          <RoomWorld t={t} />
          <div style={{position: 'absolute', left: pl.x - pl.size / 2, top: pl.y - pl.size / 2, transform: `rotate(${pl.rot}deg)`,
            filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.45))'}}><Plane size={pl.size} fold={pl.fold} text={pl.text} /></div>
        </World>
      </>
    );
  } else {
    body = <Corridor t={t} />;
  }
  const honest = win(t, B.l5 + 0.4, B.l7 - 0.3, 0.35);
  return (
    <AbsoluteFill style={{background: '#2A1A12', overflow: 'hidden'}}>
      {body}
      {/* the plane fills the lens at the desk -> room pass-through: paper white for a moment */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #FFFFFF, #EDE6D8)', opacity: Math.max(0, 1 - Math.abs(t - T_FILL) / 0.16) * 0.97, pointerEvents: 'none'}} />
      {/* honesty tag: shown once, legibly, between the captions and the TV glass */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 1520 - 1000 + 0, textAlign: 'center', opacity: honest * 0.92, fontFamily: SANS, fontWeight: 700, fontSize: 31,
        color: '#FFF3E0', textShadow: '0 2px 10px rgba(0,0,0,0.9)', background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(14,8,5,0.7), rgba(14,8,5,0))', padding: '10px 0'}}>Illustration: real models clean a small hidden grid, then enlarge it</div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 62% at 50% 48%, rgba(0,0,0,0) 55%, rgba(12,6,3,0.4) 100%)', pointerEvents: 'none'}} />
      {captions && <Captions t={t} words={words} lines={LINES} accent={ACCENT} font={SANS} scrim="14,8,5" />}
    </AbsoluteFill>
  );
};
export {pr, TV};
