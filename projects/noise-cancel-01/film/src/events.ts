// Every timed event in the film, in seconds, from beats.json. Pure data: the picture reads it, and
// dump-events.mts writes it to out/events.json for sound/mix.py, so a sound sits on its picture's own number.
import B from './beats.json';

// L2: noise squiggles leak through the shell; the speaker fires a twin for each (launch -> lands flipped)
export const L2 = {
  pop: B.actually + 0.05,
  n: [{y: 410, t0: B.actually + 0.6, t1: B.actually + 2.2}, {y: 600, t0: B.more + 0.8, t1: B.more + 2.4}],
  twin: [{launch: B.more + 0.45, land: B.more + 1.2}, {launch: B.upside, land: B.upside + 0.75}],
};
// L3: the dive into the lead squiggle and the climb back out
export const L3 = {dive0: B.copyof + 0.55, deep: B.sound3 + 0.55, up0: B.over + 0.75, up1: B.wave3 + 0.6};
// L4: three mics pop up and catch three squiggles
export const L4 = {up: B.mics - 0.05, catch: [B.mics + 0.55, B.listen4 + 0.2, B.listen4 + 0.75], sink: B.l4 - 0.6};
// L5/L6/L8 belt: slices arrive at the chip and get flipped (arc 0.42 s), then ride the out-belt to the cone
const IN = 0.9, ARC = 0.42, OUT = 0.95;
type Item = {kind: 'slice' | 'note'; spawn: number; flip: number; land: number; drop: number; spared?: boolean};
const items: Item[] = [];
{
  let t = B.chip5 + 0.15;
  while (t < B.l5 + 0.4) { // line 5 + line 6: slices, faster towards the end of line 5
    const gap = t < B.where ? 0.62 : 0.5;
    items.push({kind: 'slice', spawn: t - IN, flip: t, land: t + ARC, drop: t + ARC + OUT});
    t += gap;
  }
  // line 8: slices and notes mixed; the chip spares the notes
  const pat = ['slice', 'note', 'slice', 'slice', 'note', 'slice', 'note', 'slice', 'slice'];
  t = B.playing + 0.2; let i = 0;
  while (t < B.l8 - 0.6) {
    const k = pat[i % pat.length] as 'slice' | 'note';
    items.push({kind: k, spawn: t - IN, flip: t, land: t + ARC, drop: t + ARC + OUT, spared: k === 'note'});
    t += 0.55; i++;
  }
}
export const BELT = {items, IN, ARC, OUT};
// L6: music box notes hop to the cone
export const NOTES = Array.from({length: 6}, (_, i) => ({spawn: B.plays + 0.1 + i * 0.42, cone: B.plays + 0.75 + i * 0.42}));
// L7a: push meets pull at the eardrum
export const L7 = {go: B.when7 + 0.2, meet: B.cancel - 0.15, popT: B.cancel + 0.1, out0: B.most - 0.2};
// L7b: squiggles pop at the calm bubble's edge (one survives inside)
export const CALMPOPS = [0, 1, 2, 3].map((i) => B.most + 0.5 + i * 0.55);
// L9: engine metronome: each squiggle meets a copy and pops on the beat; then voices that keep changing
export const ENGINE = Array.from({length: 7}, (_, i) => ({spawn: B.best - 0.5 + i * 0.5, pop: B.best + 0.75 + i * 0.5}));
export const VOICES = Array.from({length: 5}, (_, i) => ({spawn: B.quick - 0.2 + i * 0.55, lop: B.quick + 0.85 + i * 0.55, survive: i % 2 === 0}));
// L10: voice squiggles plunge into the cushion
export const DENTS = [0, 1, 2].map((i) => ({t0: B.cushions + 0.15 + i * 0.42, a: Math.PI * (0.9 - i * 0.35)}));
export const BRICK = {on: B.blockthose - 0.05, off: B.blockthose + 0.75};
// L11 recap
export const L11 = {mics: B.listen11, flip: B.flip11 + 0.05, punch: B.withsound - 0.25, out0: B.withsound + 0.15};
