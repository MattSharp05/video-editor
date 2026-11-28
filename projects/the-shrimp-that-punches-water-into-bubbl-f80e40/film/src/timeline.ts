// The shrimp that punches water into bubbles: every time comes from the words (lib.ts cue()), so a new VO re-times
// the film. One world, a reef sand flat, 1 unit = 1 cm. Hard cuts between camera set-ups on the words:
//   HOOK    behind the snail shell, the shrimp faces camera: its club snaps (smear), bubbles burst at the shell
//   ID      a glide along the shrimp's side to its folded club; a speed counter climbs to UP TO 80 KM/H
//   FAST    low wide: two more strikes, sand puffs, specks thrown
//   GAP     macro on the gap between club and shell, slowed down: the water drawn as packed beads; the club hits
//           (HIT 1), rebounds and stretches the beads apart; they tear open into vapour bubbles
//   COLLAPSE from above the shell: the bubbles crush one by one, rings hit the shell (HIT 2), the shell cracks
//   FLASH   very close on three bubbles: each crushes to a point of light (illustration)
//   END     real speed again: one punch, two hits, the shell cracks open
// Colour language (one meaning for the whole film): ORANGE = the club and its hit (HIT 1, its smear);
// CYAN (the accent) = the vapour bubbles and their hit (HIT 2, rings); white-blue = the water beads; white = light.
import {cue, cueEnd, VO_END, clamp} from './lib';
import {interpolate, Easing} from 'remotion';

export const DUR_S = VO_END + 1.6;
export const CYAN = '#4FF0FF', ORANGE = '#FF8A3D', BEAD = '#CFEFFF';

const T = {
  punches: cue('punches'),
  bursts: cue('bursts.'),
  its: cue("It's"),
  peacock: cue('peacock'),
  hit80: cue('can hit'),
  eighty: cue('eighty'),
  hour: cueEnd('an hour.'),
  thats: cue("That's"),
  fastest: cue('fastest'),
  animal: cue('animal.'),
  slow: cue('Slow'),
  watch: cue('watch the'),
  clubMoves: cue('club moves'),
  soFast: cue('moves so fast'),
  pulls: cue('pulls the'),
  apart: cue('apart.'),
  tears: cue('water tears'),
  tiny: cue('tiny bubbles'),
  vapour: cue('vapour.'),
  then: cue('Then the bubbles collapse'),
  collapse: cue('collapse,'),
  slam: cue('slam into'),
  second: cue('second time.'),
  collapsing: cue('Collapsing'),
  flash: cue('flash with'),
  light: cue('light,'),
  faint: cue('too faint'),
  one: cue('One punch,'),
  two: cue('two hits:'),
  first: cue('first the'),
  thenB: cue('then the bubbles.', 1),
  end: VO_END,
};
export {T as BEATS};
const pre = 0.1;
export const CUT_ID = T.its - pre, CUT_FAST = T.thats - pre, CUT_GAP = T.slow - pre, CUT_COLLAPSE = T.then - pre,
  CUT_FLASH = T.collapsing - pre, CUT_END = T.one - pre;
export type Shot = 'hook' | 'id' | 'fast' | 'gap' | 'collapse' | 'flash' | 'end';
export const shotAt = (t: number): Shot =>
  t < CUT_ID ? 'hook' : t < CUT_FAST ? 'id' : t < CUT_GAP ? 'fast' : t < CUT_COLLAPSE ? 'gap' : t < CUT_FLASH ? 'collapse'
    : t < CUT_END ? 'flash' : 'end';
export const shotStart = (s: Shot) => ({hook: 0, id: CUT_ID, fast: CUT_FAST, gap: CUT_GAP, collapse: CUT_COLLAPSE, flash: CUT_FLASH, end: CUT_END})[s];
export const CUTS = [CUT_ID, CUT_FAST, CUT_GAP, CUT_COLLAPSE, CUT_FLASH, CUT_END];

const io = Easing.bezier(0.45, 0, 0.55, 1);
export const ramp = (t: number, a: number, b: number, e = io) => interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
export const fade = (t: number, a: number, inD: number, b: number, outD: number) => Math.min(ramp(t, a, a + inD), 1 - ramp(t, b - outD, b));

// ---------- real-speed strikes (seconds): each one is a smear, a burst of bubbles at the shell, a jolt
export const STRIKES = [0.45, T.bursts - 0.05, T.eighty + 0.1, T.fastest - 0.05, T.animal + 0.05, T.one + 0.05];
export const lastStrike = (t: number) => { let s = -99; for (const x of STRIKES) if (x <= t) s = x; return s; };

// ---------- slowed-down gap (GAP + COLLAPSE + FLASH): the club's contact and the bubbles
export const CONTACT = T.soFast + 0.1;            // the club touches the shell (HIT 1)
export const REBOUND_END = T.apart + 0.3;         // the club has bounced back, the water stretched
export const TEAR = T.tears + 0.15;               // the first bubbles open
export const COLLAPSE_A = T.collapse - 0.05, COLLAPSE_B = T.second + 0.2;  // bubbles crush between these
export const HIT2 = T.second;                     // the big ring and the crack

// cards
export const hookCard = (t: number) => fade(t, -1, 0.01, CUT_ID, 0.15);
export const speedCard = (t: number) => fade(t, T.eighty - 0.1, 0.2, CUT_FAST, 0.12);
export const speedVal = (t: number) => Math.round(80 * ramp(t, T.eighty - 0.15, T.eighty + 0.35, Easing.out(Easing.cubic)));
export const slowCard = (t: number) => fade(t, CUT_GAP, 0.1, CUT_COLLAPSE, 0.12);
export const clubLabel = (t: number) => fade(t, CUT_GAP + 0.1, 0.15, CONTACT - 0.2, 0.2);
export const nameCard = (t: number) => fade(t, CUT_ID + 0.1, 0.2, T.eighty - 0.2, 0.15);
export const hit1Tag = (t: number) => fade(t, CONTACT, 0.12, CONTACT + 1.9, 0.3);
export const vapourCard = (t: number) => fade(t, T.tiny, 0.25, CUT_COLLAPSE, 0.12);
export const hit2Tag = (t: number) => fade(t, HIT2 - 0.05, 0.08, CUT_FLASH, 0.08);
export const faintCard = (t: number) => fade(t, T.faint - 0.35, 0.12, CUT_END, 0.12);
export const collapsingCard = (t: number) => fade(t, CUT_FLASH + 0.05, 0.15, T.faint - 0.4, 0.12);
export const illusTag = (t: number) => fade(t, CUT_FLASH + 0.2, 0.25, CUT_END, 0.12);
export const endCard = (t: number) => fade(t, T.two, 0.25, 99, 0.1);
export const endHit1 = (t: number) => fade(t, T.one + 0.05, 0.08, 99, 0.1);
export const endHit2 = (t: number) => fade(t, T.two + 0.05, 0.08, 99, 0.1);
