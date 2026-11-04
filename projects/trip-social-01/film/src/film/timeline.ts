// Every time in the film comes from Matthew's VO (src/words.json, take 1 trimmed by 2.85 s).
import {chunk, cue, f, TOTAL, WORDS} from '../lib';

export const T = {
  none: cue('and on the trip') - 0.08,
  build: cue("So I'm building") - 0.08,
  plan: cue('an actual plan'),
  copy: cue('Copy a TikTok link') - 0.08,
  asks: cue('add this TikTok'),
  reads: cue('It reads the caption') - 0.08,
  smart: cue('Tap Smart Add') - 0.08,
  picks: cue('picks the day'),
  planAll: cue('Or plan your') - 0.08,
  atOnce: cue('At once'),
  saves: cue('Your saves finally') - 0.08,
  end: cue('Would you use') - 0.08,
};

// The acts, in order, each [start, end) in frames.
export const ACT_LIST = [
  ['hook', 0, T.none], ['none', T.none, T.build], ['build', T.build, T.copy],
  ['copy', T.copy, T.reads], ['reads', T.reads, T.smart], ['smart', T.smart, T.planAll],
  ['planAll', T.planAll, T.saves], ['saves', T.saves, T.end], ['end', T.end, TOTAL / 30],
].map(([name, s, e]) => ({name: name as string, s: f(s as number), e: f(e as number)}));

// Headline lines: hand-written sense units, checked word for word against the transcript.
// The [bracketed] word is the one that carries the line (drawn in orange).
const LINES = [
  "You've saved [40] TikToks for this trip", 'and on the trip', "you'll open [none] of them.",
  "So I'm building an app", 'that turns them into an actual [plan.]',
  'Copy a TikTok link, open Trip', 'and it asks, [add this TikTok.]',
  'It reads the [caption]', 'and pulls out the place it names.',
  'Tap [Smart Add]', 'and it picks the day and time that fits', 'with the least extra travel.',
  'Or plan your whole list out.', '[At once.]',
  'Your saves finally coming', 'on the trip with you.', 'Would you use this?',
];
const clean = (l: string) => l.replace(/[[\]]/g, '');
export const HEADLINES = chunk(WORDS, LINES.map(clean)).map((c, i) => {
  const m = LINES[i].match(/\[(.+?)\]/);
  return {...c, text: clean(LINES[i]), key: m ? m[1] : ''};
});
