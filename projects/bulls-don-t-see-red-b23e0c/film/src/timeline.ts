// Bulls don't see red: every time comes from the words (lib.ts cue()), so a new VO re-times the film.
// One world, a sunlit bullring with a red-painted barrier, 1 unit = 1 m. Hard cuts between camera set-ups on the words:
//   HOOK    the black bull faces a red cape on a stand; a split line sweeps in: left = as you see it, right = bull vision
//   EYE     push into the bull's eye, then a field of colour cells: your half has red, green and blue cells, the bull's
//           half only blue and yellow-green (the red slots stay dark as a wave of light passes)
//   PLATE   from above: a colour-test plate of dots on the sand; a red cape shape among green dots vanishes in bull vision
//   CAPE    close on the red cape flapping; the split slides across it and the red drains to dull brown
//   CHARGE  the cape flicks; the bull drops its head and charges at the camera
//   FLAGS   tracking alongside: the bull charges a red, a blue and a white flag in turn, the same each time
//   MOTION  from above: a still figure in red and two moving cowboys (stand-ins); the bull runs past the red one
//   IMPACT  a cape on a swinging arm; the bull hits it, sand bursts (slowed)
//   END     crane up over the ring, split view again: the bull chases the swinging cape round the ring
// Colour language (one meaning for the whole film): RED = red things (the myth); GOLD (the accent) = movement, what the
// bull really follows (motion trails, MOVING tags, the word MOTION); white line = the split between your eyes and the bull's.
import {cue, cueEnd, VO_END, clamp} from './lib';
import {interpolate, Easing} from 'remotion';

export const DUR_S = VO_END + 1.6;
export const RED = '#FF3B3B', GOLD = '#FFC940', DULL = '#B5A36A';

const T = {
  hate: cue("don't hate"), see: cue('even see'), asRed: cue('as red.'),
  your: cue('Your'), three: cue('three'), bulls2: cue("A bull's"), two: cue('only two.', 0),
  with: cue('With only'), alike: cue('almost'),
  so: cue('So'), dull: cue('dull and'), brownish: cue('brownish'),
  then: cue('Then'), charge: cue('charge?'),
  test: cue('In a'), redF: cue('red,', 4), blueF: cue('blue'), whiteF: cue('white'), same: cue('same.', 1),
  chased: cue('It chased'), cowboys: cue('cowboys'), ignored: cue('ignored'), still: cue('still.'),
  colour: cue("It's not"), movement: cue('movement.'),
  crowd: cue('The red is'), toBull: cue('To a bull,', 2), cape: cue('cape that'), moves: cueEnd('moves.'),
};
export {T};

const B = 0.1; // cut a beat before the line's first word
export const CUT = {
  eye: T.your - B, plate: T.with - B, cape: T.so - B, charge: T.then - B, flags: T.test - B,
  motion: T.chased - B, impact: T.colour - B, end: T.crowd - B,
};
export type Shot = 'hook' | 'eye' | 'plate' | 'cape' | 'charge' | 'flags' | 'motion' | 'impact' | 'end';
export const shotAt = (t: number): Shot =>
  t < CUT.eye ? 'hook' : t < CUT.plate ? 'eye' : t < CUT.cape ? 'plate' : t < CUT.charge ? 'cape' : t < CUT.flags ? 'charge'
    : t < CUT.motion ? 'flags' : t < CUT.impact ? 'motion' : t < CUT.end ? 'impact' : 'end';
export const shotStart = (s: Shot) => ({hook: 0, eye: CUT.eye, plate: CUT.plate, cape: CUT.cape, charge: CUT.charge, flags: CUT.flags,
  motion: CUT.motion, impact: CUT.impact, end: CUT.end})[s];

const io = Easing.bezier(0.45, 0, 0.55, 1), out = Easing.bezier(0.2, 0.8, 0.2, 1);
const ramp = (t: number, a: number, b: number, e = io) => interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, out), 1 - ramp(t, b - fo, b));

// ---- the split line: x position of the line across the frame (0 = left edge, 1 = right edge); right of it is bull
// vision. Off-frame (> 1) means no bull vision.
export const split = (t: number): number => {
  const s = shotAt(t);
  if (s === 'hook') return interpolate(t, [T.see - 0.15, T.see + 0.75], [1.08, 0.5], {...clamp, easing: out});
  if (s === 'eye') return 0.5;               // the cell field uses the same divide (drawn, not filtered)
  if (s === 'plate') return interpolate(t, [CUT.plate + 0.3, T.alike + 0.4], [0.92, 0.32], {...clamp, easing: io});
  if (s === 'cape') return interpolate(t, [CUT.cape, T.brownish + 0.3], [0.86, 0.42], {...clamp, easing: io});
  if (s === 'end') return interpolate(t, [CUT.end + 0.2, CUT.end + 1.2], [1.08, 0.5], {...clamp, easing: out});
  return 1.2;
};
export const filterOn = (t: number) => shotAt(t) !== 'eye';

// ---- cards and tags (opacity 0..1)
export const hookCard = (t: number) => win(t, -1, CUT.eye, 0.01, 0.2);
export const sideLabels = (t: number) => {
  const s = shotAt(t);
  if (s === 'hook') return win(t, T.see + 0.4, CUT.eye, 0.3, 0.15);
  if (s === 'eye') return win(t, CUT.eye + 0.2, CUT.plate, 0.3, 0.15);
  if (s === 'cape') return win(t, CUT.cape + 0.2, CUT.charge, 0.3, 0.15);
  if (s === 'end') return win(t, CUT.end + 1.0, DUR_S + 1, 0.3, 0.1);
  return 0;
};
export const countYou = (t: number) => win(t, T.three - 0.05, CUT.plate, 0.25, 0.15);
export const countBull = (t: number) => win(t, T.two - 0.05, CUT.plate, 0.25, 0.15);
export const plateCard = (t: number) => win(t, T.alike - 0.1, CUT.cape, 0.25, 0.15);
export const capeCard = (t: number) => win(t, T.dull - 0.1, CUT.charge, 0.25, 0.15);
export const flagTick = (t: number, i: number) => win(t, FLAG_HIT[i] - 0.05, CUT.motion, 0.15, 0.15);
export const sameCard = (t: number) => win(t, T.same - 0.1, CUT.motion, 0.25, 0.15);
export const stillTag = (t: number) => win(t, T.ignored - 0.4, CUT.impact, 0.25, 0.15);
export const moveTag = (t: number) => win(t, T.cowboys - 0.1, CUT.impact, 0.25, 0.15);
export const motionCard = (t: number) => win(t, T.ignored + 0.3, CUT.impact, 0.25, 0.15);
export const illusTag = (t: number) => win(t, CUT.motion + 0.2, CUT.impact, 0.25, 0.15);
export const notRedCard = (t: number) => win(t, T.colour + 0.1, CUT.end, 0.25, 0.15);
export const endCard = (t: number) => win(t, T.toBull - 0.1, DUR_S + 1, 0.3, 0.1);

// ---- the bull's actions
// CHARGE: the cape flicks at `flick`, the head drops, the bull launches toward the camera.
export const FLICK = T.charge - 0.35;
export const LAUNCH = FLICK + 0.3;
// FLAGS: three flags along a straight run; the bull reaches each on the colour's word.
export const FLAG_HIT = [T.redF + 0.05, T.blueF + 0.05, T.whiteF + 0.05];
// IMPACT: the swinging cape meets the bull on 'movement'
export const HIT = T.movement + 0.05;
export const slowmo = (t: number) => (shotAt(t) === 'impact' ? (t < HIT ? t : HIT + (t - HIT) * 0.18) : t);
export const whyCard = (t: number) => win(t, T.then - 0.05, CUT.flags, 0.2, 0.15);
