// Prints the kit-timed series cues (title plaque taps + sting, end card typing) as JSON for sound/mix.py.
// usage: npx esbuild sound/dump-cues.mts --bundle --platform=node --format=esm --loader:.png=empty | node --input-type=module > sound/kit_cues.json
import {titleCues, endCardCues} from '../src/series/sound';
import B from '../src/beats.json';
const F = (s: number) => Math.round(s * 30);
console.log(JSON.stringify([...titleCues(72), ...endCardCues(F((B as Record<string, number>).end - 0.6), 'THE END')]));
