// Part 1 sound cue sheet: the kit's series sounds (identical in every part) placed on the frames the picture uses.
// Pure module: `npx esbuild src/p1/dump-cues.ts --bundle --platform=node --format=esm | node --input-type=module > sound/cues.json`
// Every cue has a visible cause ('what'). Local synthesized cues (knock, brick) are 'local:*' and made in mix.py.
import B from '../beats.json';
import {titleCues, moustacheCues, endCardCues, headlineCues, SeriesCue} from '../series/sound';
import {moustacheLandFrame} from '../series/devices';
import {TITLE_AT, LAND, T3, T8, ENDCARD_AT} from './times';
const f = (s: number) => Math.round(s * 30);
type Cue = (SeriesCue | {sound: 'local:knock' | 'local:brick'; fr: number; what?: string}) & {what?: string};
export const CUES: Cue[] = [
  {sound: 'spark-crackle', fr: f(0.9), gain_db: -3, what: 'the star drops onto the telegraph wire'},
  ...titleCues(TITLE_AT),
  {sound: 'newspaper-rustle', fr: f(4.4), what: "the newsboy's paper fills the frame"},
  {sound: 'spark-crackle', fr: f(5.0), what: 'the Spark lands on the Montrose ad mast'},
  {sound: 'spark-crackle', fr: f(6.9), gain_db: -3, what: 'the Spark lassoes the portrait'},
  {sound: 'spark-crackle', fr: f(9.7), gain_db: -4, what: 'the Spark lights the playbill footlights'},
  {sound: 'spark-crackle', fr: f(B.glasses), gain_db: -8, what: 'Spark glint on his lens'},
  ...moustacheCues(f(B.mustache - 1.1), moustacheLandFrame(f(LAND))),
  {sound: 'feather-chime', fr: f(B.steps_end), what: "a feather slips from Cora's hat onto the step"},
  {sound: 'paper-flip', fr: f(B.again), gain_db: -4, what: 'calendar February → March'},
  {sound: 'feather-chime', fr: f(B.america - 0.1), gain_db: -2, what: 'Clara picks up the Feather'},
  {sound: 'clue-ring', fr: f(B.america + 1.1), what: 'ring on the wet paint drip'},
  {sound: 'spark-crackle', fr: f(B.fuzzy_end + 0.1), gain_db: -5, what: 'one sparkle in the fog'},
  {sound: 'clue-ring', fr: f(B.jewelry), what: "ring on Cora's brooch"},
  {sound: 'feather-chime', fr: f(B.dew + 1.1), what: "the Feather goes into Dew's hatband"},
  {sound: 'paper-flip', fr: f(B.ask + 2.2), gain_db: -4, what: "Dew's notebook flaps open"},
  {sound: 'newspaper-rustle', fr: f(B.thistime + 0.3), what: 'the AMERICA card crumples'},
  {sound: 'clue-ring', fr: f(B.ranaway + 1.0), what: 'ring on the RAN AWAY drip'},
  {sound: 'paper-flip', fr: f(B.insleft + 1.0), gain_db: -4, what: 'calendar 8 July → 11 July'},
  {sound: 'local:knock', fr: f(B.cameback + 0.1), what: 'Dew knocks'},
  {sound: 'local:brick', fr: f(B.under + 0.3), what: 'one brick wobbles'},
  ...headlineCues(f(B.remains + 1.0)).map((c) => ({...c, what: 'CELLAR DISCOVERY slams down'})),
  {sound: 'paper-flip', fr: f(B.doctor - 0.05), what: 'the board turns to WANTED'},
  {sound: 'spark-crackle', fr: f(T8 + 0.2), gain_db: -4, what: 'the Spark at the porthole rim'},
  ...endCardCues(f(ENDCARD_AT), 'NEXT: THE CHASE'),
];
void T3;
