# Recipe: Trip app reel

A 20–35 s Instagram Reel for Trip (or another app): one continuous shot in the product-UI style,
the app's real screens on glass, Matthew's voiceover, top captions, music and soft UI sounds, all
timed from `beats.json`. Made once as `projects/trip-social-01/film-v2/` (Trip clip 01 v2, 60 fps,
34.4 s). Skill: animated-video; sound rules: [studio sound](../../../real-sfx/references/studio-sound.md).

**Pick it when** the subject is an app and the film shows what it does with its real interface.
Not for a screen recording cut with a voice (that is video-edit's screen-demo pack) or a 3D world
(the [narrated 3D explainer](narrated-3d-explainer.md)).

## Steps

1. **Brief.** Start `brief.md` from `projects/trip-social-01/brief.md`: product facts with sources,
   Reels format and safe area, length, goal, and the product's design rules (Trip: `docs/design.md`
   in MattSharp05/Trip: black, `#FF6B22` the only accent, SF Pro, no emoji, gradients or glows).
   Trip is not in the App Store: no "download" call to action.
2. **Script** with video-script; Matthew records the VO after approval. Until then, build on
   stand-in words at his measured pace, 2.7 words/s
   ([before the VO exists](../../references/remotion-pipeline.md#before-the-vo-exists)).
3. **Pictures and language** (steps 1–2 pages): a written thread (lead → move → next lead, one
   carrier per hand-off), the state table of the visual language, the background from the app's
   world (Trip: the globe). Board as data: `board.json`, drawn with `board.py board.json`
   ([versions](../../references/versions.md#board)); approval before the build.
4. **Skeleton.** Copy `templates/remotion-film/` to `projects/<slug>/film/` and install
   (pipeline Setup, plus `@remotion/three three @react-three/fiber @types/three` for the globe or
   phone). Before the first still: replace the placeholder phrases in `src/lib.ts` `ACTS` (they
   throw), set `FPS` (v2 ran at 60), and give the composition `Math.ceil(beats.total * FPS)` frames.
5. **Screens.** The app's own screens come from Matthew's screenshots or recordings in `refs/`
   (Trip: Settings → Developer → Add the sample Las Vegas trip; scenario links load exact states),
   placed as images on glass panes. v2's glass, space and caption helpers are in
   `projects/trip-social-01/film-v2/src/kit/` (not yet in parts). The phone part
   (`templates/parts/src/kit/phone.tsx`) is for Messages moments: a link or photo sent, a lock
   screen, a notification; it draws iMessage, not the app. The globe part is the travel background.
6. **VO and timing.** `align.py public/vo.m4a "Trip, TikTok, Smart Add"` → `src/words.json`
   (needs `faster-whisper`; not in the container: `uv run --with faster-whisper python align.py …`,
   not run on 2026-11-24). Fix ASR splits with a kept script. Name the beats in `beats.py`
   (`at("open Trip")`, `after=` for a phrase said twice) → `src/beats.json`.
7. **Captions.** Copy `templates/parts/src/kit/captions.tsx`; write `LINES` as sense units of what
   he said, key words in `[brackets]`, accent `#FF6B22`. Keep the lead below y ≈ 560 so the
   caption zone (y 250–470) and its scrim stay clear.
8. **Sound.** An events script reading `beats.json` (`projects/trip-social-01/film-v2/sound/events.py`
   writes real-sfx's cue sheet; a `mix.py` with FFmpeg works too): one sound per state of the
   visual language from the palette, ~7 weighted events per 10 s, effects -16 to -30 dB low-passed,
   VO +10 to +14 dB, music 10–12 dB under it with the sidechain duck. Master the WAV to
   `loudnorm=I=-14:TP=-2` (AAC adds ~0.5 dB of peak). Optional: the music presence dip
   ([studio sound](../../../real-sfx/references/studio-sound.md#optional-music-presence-dip)).
9. **Check.** `./snap.sh out/check <a still per beat>` and fix every `fail` in `findings.json`;
   `board.py`; fresh-judge mute test; `motion_check.py` on a preview (review page).
10. **Render and deliver.** `./render.sh <name>` (picture), mux the mix
    (`ffmpeg -i out/<name>.mp4 -i sound/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k out/<name>_mix.mp4`),
    `cuts.py add`, then `python3 deliver.py out/<name>_mix.mp4 --lines src/Film.tsx` and fix every
    `problems` entry. Music credit in the post caption.

## Traps

From `projects/trip-social-01` unless marked "smoke" (the 2026-11-24 smoke run below).
- **He says it differently from the script.** Take 1 had "the place it names" (script: places),
  "time that fits", "plan your whole list out. At once." Captions follow what he said; the
  caption check throws on a line that doesn't match the words, which is the point.
- **ASR timings lie at the edges.** "saved" came back 20 ms long (0.69–0.71 s) and "and" stretched
  0.78 s over a pause. Fix `words.json` with a kept script before cueing a beat on such a word.
- **A trimmed VO shifts every word.** The film's VO starts 2.85 s into `take1.m4a`; `words.json` is
  the take's timings minus 2.85. Trim and shift together, once, in a script.
- **"trip" is said twice in one sentence.** `cue("trip")` throws; pass `nth`, or `after=` in
  `beats.py`.
- **SF Pro can't be bundled for rendering here.** v1–v2 used Hanken Grotesk as a stand-in, labelled.
- **Music too low.** v2 shipped with the music "ducked 17 dB under speech"; the same kind of
  setting measured 46 dB under on Moon tides v1 and Matthew heard no music. Now: 10–12 dB under,
  measured from stems every film.
- **The first mute test failed on payoffs.** A fresh judge couldn't follow v2 until the payoff
  screens were held, captions got a scrim, and Trip was named early.
- **The captions kit glows key words; Trip's rules forbid glows.** Drop the glow `textShadow` in
  your copy (keep colour, weight and lift).
- **Template `ACTS` throws at the first still** (smoke): `cue not found: second line first words`.
- **Composition shorter than the mix** (smoke): `lib.ts` `TOTAL` ends 1.2 s after the last word,
  `beats.py` `total` 1.4 s: picture 6.30 s, mix 6.51 s, and `-shortest` cut the tail. Use
  `beats.total` for both.
- **`render.sh` on a film with no audio exits 0 with a silent MP4** (smoke: one video stream, no
  audio). Mux the mix afterwards, as above, and check `ffprobe` shows an audio stream.
- **A tall screenshot as the phone's photo** shows as a small square thumbnail (smoke): app
  screens go on glass, not into the iMessage photo slot.
- **A centred phone sits under the captions** (smoke): its top reached y ≈ 300.
- **-1.5 dBTP in the WAV is -1.49 dBTP after AAC** (smoke): `deliver.py` failed the true-peak
  check; mastering the WAV at TP -2 gave -1.95 dBTP and passed.
- **`deliver.py` found two `LINES` arrays** (smoke): the film's and the example in `captions.tsx`'s
  header. Pass `--lines src/Film.tsx`.

## Smoke

Builds a 6.5 s film from the current template with the phone and captions parts, Matthew's real
take (first sentence) and its word timings, a music sample and two CC0 effects, then stills,
render, mix, mux and the delivery pack. Run from anywhere in the repo; `NM=/path/to/node_modules`
reuses an install.

```bash
R=$(git rev-parse --show-toplevel); T=$R/.claude/skills/animated-video/templates; D=$(mktemp -d)/reel
cp -r $T/remotion-film $D && cd $D && mkdir -p public sound
cp $T/parts/src/kit/phone.tsx $T/parts/src/kit/captions.tsx src/kit/
echo '{"name":"recipe-smoke","private":true,"type":"module"}' > package.json
if [ -n "$NM" ]; then ln -s "$NM" node_modules; else npm i -s remotion @remotion/cli @remotion/three react react-dom three @react-three/fiber @types/three typescript @types/react; fi
printf "import {Config} from '@remotion/cli/config';\nConfig.setChromiumOpenGlRenderer('swangle');\n" > remotion.config.ts
P=$R/projects/trip-social-01
ffmpeg -v error -y -ss 2.85 -t 5.6 -i $P/vo/take1.m4a -ac 1 -ar 48000 public/vo.wav
cp $P/film-v2/public/link-results.png public/
python3 -c "import json; W=json.load(open('$P/film-v2/src/words.json')); json.dump(W[:16], open('src/words.json','w')); json.dump([0.5]*400, open('src/vo_env.json','w'))"
sed -i "s|    # 'hook': at('first words'),|    'forty': at('40'), 'none': at('none'), 'again': at('trip', after=at('on the')),|" beats.py
sed -i 's/cue("second line first words")/cue("and on the")/; s/cue("last line first words")/cue("and on the")/' src/lib.ts
python3 beats.py
cat > src/index.ts <<'EOF'
import {registerRoot} from 'remotion';
import {Root} from './Root';
registerRoot(Root);
EOF
cat > src/Root.tsx <<'EOF'
import {Composition} from 'remotion';
import {Film} from './Film';
import {FPS} from './lib';
import B from './beats.json';
export const Root = () => <Composition id="Film" component={Film} durationInFrames={Math.ceil(B.total * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{captions: true}} />;
EOF
cat > src/Film.tsx <<'EOF'
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from './kit/three-canvas';
import {Phone3D, usePhone} from './kit/phone';
import {Captions} from './kit/captions';
import {FPS, WORDS, prog, f} from './lib';
import B from './beats.json';
const LINES = ["You've saved [40] TikToks for this trip", "and on the trip you'll open [none] of them."];
export const Film = ({captions}: {captions: boolean}) => {
  const fr = useCurrentFrame(), phone = usePhone('link-results.png');
  const sent = prog(fr, f(B.forty), 18), shut = prog(fr, f(B.none), 12);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {phone && <ThreeCanvas width={1080} height={1920} camera={{position: [0, -0.1, 3.4], fov: 40}}>
        <ambientLight intensity={0.6} /><directionalLight position={[2, 3, 4]} intensity={1.4} />
        <group rotation={[0, -0.3 + 0.3 * sent, 0]} position={[0, -0.25, 0]}>
          <Phone3D assets={phone} state={{time: '9:41', contact: 'Blake', messages: [{from: 'them', text: 'Vegas list?'}, {from: 'me', photo: true, appear: sent}], brightness: 1 - 0.7 * shut}} />
        </group>
      </ThreeCanvas>}
      {captions && <Captions t={fr / FPS} words={WORDS} lines={LINES} accent="#FF6B22" font="Helvetica, Arial, sans-serif" />}
    </AbsoluteFill>
  );
};
EOF
cat > sound/mix.py <<'EOF'
import json, subprocess, sys
B = json.load(open('src/beats.json')); T = B['total']; L = sys.argv[2] + '/library/sfx/cstack-cc0'
CUES = [(B['forty'], f'{L}/pop-soft.flac', -18), (B['none'] + 0.25, f'{L}/padlock-close.flac', -20)]
a = ['ffmpeg', '-v', 'error', '-y', '-i', 'public/vo.wav', '-i', sys.argv[1]] + sum([['-i', c[1]] for c in CUES], [])
fc = [f'[0]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur={T},volume=12dB,asplit=2[vo][key]',
      f'[1]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{T},volume=-6dB,afade=t=in:d=1.5,afade=t=out:st={T-2.5}:d=2.5[m]',
      '[m][key]sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700[duck]']
for i, (t, _, g) in enumerate(CUES):
    fc.append(f'[{i+2}]aformat=sample_rates=48000:channel_layouts=stereo,lowpass=f=3000,volume={g}dB,adelay={int(t*1000)}|{int(t*1000)}[c{i}]')
fc.append('[vo][duck][c0][c1]amix=inputs=4:normalize=0:duration=first,' + f'atrim=0:{T},loudnorm=I=-14:TP=-2:LRA=11[out]')
subprocess.run(a + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', 'sound/mix.wav'], check=True)
EOF
./snap.sh out/check 0.3 1.0 4.6
python3 sound/mix.py $R/projects/code-history-01/music/samples/km-half-mystery.mp3 $R
./render.sh smoke
ffmpeg -v error -y -i out/smoke.mp4 -i sound/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/smoke_mix.mp4
python3 deliver.py out/smoke_mix.mp4 --project $D --cut 1 --lines src/Film.tsx
echo "$D"
```

Pass: `findings.json` with 0 fail, a sheet with the phone and the two caption lines, and
`deliver.py` printing "all checks passed". The music sample is git-ignored
(`projects/*/music/*.mp3`); on a fresh clone pass any music file.

## Checked against

2026-11-24, cloud container: Remotion 4.0.547 (`remotion`, `@remotion/cli`, `@remotion/three`),
chrome-headless-shell 158.0.8127.2, React 19.3.1, three 0.187.0, @react-three/fiber 9.8.2,
TypeScript 7.0.2, Node 22.23.5, FFmpeg 6.1.1 (Ubuntu 6.1.1-3ubuntu5), Python 3.13.18.
The block above, verbatim, with `NM` set: 1 min 30 s in all (snap.sh 3 stills, findings 0 fail;
render.sh 196 frames at concurrency 2; mix; mux; deliver.py reels.mp4 6.51 s, -14.8 LUFS,
-1.95 dBTP, all checks passed). Not run: align.py
(faster-whisper not installed), real-sfx's cue-sheet route (uisfx not installed in
`real-sfx/vendor`), motion_check.py, cuts.py.
