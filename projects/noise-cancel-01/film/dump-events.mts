// writes every film event to out/events.json for sound/mix.py   usage: node --experimental-strip-types dump-events.mts
import * as E from './src/events';
import fs from 'node:fs';
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/events.json', JSON.stringify(E, null, 1));
console.log('events', Object.keys(E).join(' '));
