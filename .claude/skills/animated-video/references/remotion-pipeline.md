# Remotion pipeline

## Template (`templates/remotion-film/`): style-neutral infrastructure

Usage lines live in each script's header.
- `src/lib.ts`: `cue()`/`cueEnd()` (phrase to seconds; a phrase said twice needs `nth`), `f()`
  (seconds to frames), `prog()` (eased 0→1), `pop()` (spring), `voLevel(fr)` (VO loudness),
  `chunk()` (hand-authored caption lines checked against the transcript), and an `ACTS` table.
- `src/kit/camera.tsx`: keyframed pan, zoom and rotate, shake, handheld drift, parallax layers.
- `src/kit/three-canvas.tsx`, `src/kit/finish.tsx`: see [three.js](three.md).
- `audio/dsp.py`: numpy/scipy synthesis and mixing helpers, plus a `cue()` that reads the same
  `src/words.json`, so sound is timed from the words too.
- `align.py` (word timestamps and VO envelope), `beats.py` ([timing spine](#timing-spine-beatsjson)),
  `snap.sh` (stills from one bundle plus a contact sheet and `findings.json`, via `snap.mjs`; allow-list in `findings-allow.txt`), `cuts.py` (numbered cut registry and note answers: [versions](versions.md)), `board.py` (key-frame board from `board.json`), `frame.mjs` (camera solver: world points to screen spots), `../sourcing/` (search, download and test-render free models: [sourcing](sourcing.md)), `render.sh` (full MP4, two-pass linear loudnorm to -14 LUFS with a peak limiter; reuses an unchanged film's MP4: [render cache](#render-cache)),
  `deliver.py` (the [delivery pack](#delivery): presets, SRT/VTT, cover, manifest, loudness measured per MP4),
  `sheet.py`, `board.py` (key-frame board with each beat's time and line), `motion_check.py`,
  `analytics.py` ([production analytics](production-analytics.md)).
- Optional parts with a look of their own: [templates/parts/](../templates/parts/README.md).
- Written per project: `src/index.ts`, `src/Root.tsx`, a film shell that switches acts and draws
  captions and audio, the scenes, and every visual asset.
- Setup: `npm i remotion @remotion/cli @remotion/google-fonts react react-dom typescript
  @types/react`, a tsconfig with `lib: ["ES2023","DOM"]`, a Python venv with `faster-whisper`,
  and `git init`.

## Structural conventions

- Scene logic uses absolute frames (`fr`), with no nested `<Sequence>` offsets, so a cue means the
  same frame everywhere. Every time comes from `cue()`, so re-aligning a new VO re-times the film.
- Draw every frame from `useCurrentFrame()` and Remotion's `random(seed)`, never `Math.random()`
  or a clock, so every render matches its stills. A `<canvas>` inside a component suits
  procedural art (grain, boil, particles).
- Captions come from hand-authored sense-unit lines, verified against the transcript at load.
  Their look is a per-project choice. Give the film shell a `captions` prop (on by default) so the
  [mute test](review.md#mute-test) can render without them.
- If the film will be sped up for delivery, lock the speed before final renders, and derive every
  on-screen number that depends on runtime (a video length, an elapsed-time chip) from one
  delivery-speed constant: the platform shows the sped-up length.

## Timing spine: beats.json

One file times picture, captions and sound (Trip clip 01 v2, Grand Canyon 01).
- `words.json` (from `align.py`, or [ai-voiceover](ai-voiceover.md)) → `beats.py` (template) →
  `src/beats.json`: named beats in seconds, each from a spoken phrase (`at("phrase")`,
  `after=` for a phrase said twice, `end=True` for its last word), plus `total`.
- The film imports `beats.json` and times every event as `beat + offset`; the sound script
  (`events.py` or `mix.py`) reads the same file. Moving a beat moves its picture and its sound.
- A re-recorded VO: re-align, re-run `beats.py`; a phrase no longer said stops it by name.
- Name beats for what happens (`pushed`, `rockfall`, `smart_add`), not for times.

## Captions

The look-agnostic `chunk()` is in `lib.ts`; a ready look is `templates/parts/src/kit/captions.tsx`.
- Hand-written sense units, checked word for word against `words.json` at load; captions follow
  what the voice said, not the script.
- At the top, inside the safe area (y 250–470 in 9:16), over a dark top scrim so the picture never
  fights them; one line at a time, fading in 0.12 s before its first word.
- The whole line is readable muted; each word brightens as it is spoken.
- Key words take the film's accent (the visual language's "found" look: colour, weight, lift,
  glow, never a box), one idea per line.
- A `captions` prop turns them off for the mute test.

## Platform facts (Instagram Reels 9:16, as of 2026-09; recheck)

- The top ~220 px and bottom ~420 px are covered by UI, and so is a right rail (x > 930 at
  y > 1100). Keep faces, key props and on-screen text inside the rest.
- Frame 0 is the cover: legible at phone size and already moving.
- Deliver around -14 LUFS integrated and under -1.5 dBTP.
- File under 50 MB (Matthew's rule for every Reel): `render.sh` caps video at 6 Mbit/s (about 40 MB
  for 60 s) and fails above 50 MB. A music swap muxes onto the delivered picture with `-c:v copy`.

## Render cache

`render.sh <name>` hashes what the render reads (`src/`, `public/`, `package.json`, `package-lock.json`,
`remotion.config.ts`, `tsconfig.json`, `render.sh` itself, the extra render arguments and a `--props=FILE`'s
contents, Node, Remotion and FFmpeg versions). When an earlier render in `out/` has the same hash and its MP4 is
still the file that render wrote, it is reused at once (copied to the new name if needed) and the script prints
`reused: true`; otherwise it prints which inputs changed and renders. `--fresh` always renders.
- Beside each render: `out/<name>.inputs.sha256` (`inputs <hash>` and `output <sha256> <name>.mp4`) and
  `out/<name>.inputs.txt` (the hashed list). The cut registry (`renders/cuts.json`) records the `inputs` hash per
  cut; `deliver.py` copies it into the manifest.
- Anything the film reads at render time must live in `src/` or `public/` (or be pinned by the lockfile). A file
  imported from outside the film folder, or a mix written elsewhere, is invisible to the cache: render `--fresh`.
- Partial re-renders (`--frames=A-B`) and chunked finals don't go through `render.sh`, so they aren't cached.

## Delivery

After the user approves a cut, pack it from the film folder:
`python3 deliver.py out/v3.mp4 [out/v3-square.mp4] [--cut 3] [--cover-frame N | --cover still.png] [--review]`
→ `PROJECT/renders/deliver/<cut>/` (the cut number comes from `renders/cuts.json` when the master is there):
- One preset per layout the film was built in, from its own master: 9:16 → `reels.mp4` (Reels, TikTok, Shorts;
  under 50 MB), 1:1 → `square.mp4`, 4:5 → `feed.mp4`, 16:9 → `youtube.mp4`. Never a crop of the vertical film: a
  square or landscape version is its own composition, rendered as its own master. `--review` adds a half-size copy.
- A master that already fits (H.264, AAC, size, under the cap) is stream-copied, so the picture is encoded once.
- `captions.srt` and `captions.vtt` from `src/words.json` and the film's hand-written `LINES` (found in
  `src/**/*.tsx`, or `--lines`), timed as `captions.tsx` shows them; with no lines, words are auto-chunked and the
  manifest says so. `--ass`/`--srt` take ready timing instead. A line that no longer matches the words stops it.
- `cover.png`: master frame 0 by default (the cover is frame 0, see above); for full quality render the still
  (`npx remotion still src/index.ts Film out/cover.png --frame=0`) and pass `--cover`.
- `manifest.json`: cut, git commit (and whether the project had uncommitted changes), each master's sha256, size and
  frames, the inputs hash, per deliverable its size, durations and loudness/true peak measured on that MP4, caption
  counts, credits (every `CREDITS*.md` in the project, plus `--credits`, `--declared` for the asset-library
  declaration) and `problems`.
- Checks on every delivered MP4: -14 LUFS ±1 LU, true peak ≤ -1.5 dBTP, under the cap, audio and picture the same
  length. Any failure is listed in `problems` and exits 1; the pack is still written so it can be inspected.
  `--normalize` re-runs `render.sh`'s loudness chain on a master that didn't come from it.
- Posting stays manual (CLAUDE.md): the pack is what the user or a posting step uploads.

## Before the VO exists

Generate `words.json` from the script at the speaker's measured pace (words per second of an
earlier recording) and build every beat from `cue()` as usual; label it a stand-in. After
recording, align the real VO and re-render: a cue phrase the speaker changed throws by name, and
so does the caption check at load. Update the caption lines with the words, then run a script that
loads each act's cue module on its own and lists every phrase that no longer resolves, with the
nearest phrase in the new transcript, so each act owner fixes only their own.

## Sound events

Sound stays on the picture when both come from the same numbers.
- The template's convention: each act has a pure events module (no React, three or DOM imports)
  exporting `EVENTS: SoundEvent[]` (`{id, fr, dur?, what, x?}` from `lib.ts`): `fr` is the frame
  the thing visibly happens (contact, not the approach), `dur` for anything that lasts, `x` from -1
  to 1 for its place on screen. The scene imports its timing constants from it. To hand them to a
  Python mixer:
  `npx esbuild dump-events.mts --bundle --platform=node --format=esm | node --input-type=module > out/events.json`
  (a two-line script that prints `JSON.stringify(EVENTS)`).
- List what visibly happens (appearances, hits, landings, travel and camera moves, transitions)
  and each place change with its span, for an ambience bed; many repeats can be first, last and a
  count.
- One cue sheet maps event ids to sounds, levels and treatments: each place one ambience, each
  recurring thing one recognisable sound, the rest varied so no sample repeats until it's noticed.
- Drop effects under any stretch replaced by other footage (a talking-head insert).
- Simpler, for a film timed by [beats.json](#timing-spine-beatsjson): a Python events or mix
  script reads the same file and writes cues as `beat + offset` (rules and examples:
  [studio sound](../../real-sfx/references/studio-sound.md)).
- Exported events are candidates, not cues: sound the ones that carry meaning. Acts that export
  everything they draw can hand the mixer several events a second.

## Audio mechanics

- Keep the narrator's voice close to the raw recording: a high-pass, one static gain, a linear
  loudness pass, no compressor unless the raw needs it. The level changes between lines are the
  performance: give a take its own gain only when its level is clearly off (another mic distance
  or session), not to match the others. The master limiter shaves transients only (lookahead,
  short release); when it holds speech down, master quieter instead. Measure it: the narration
  stem's loudness range (`ebur128` LRA) in the mix stays close to the selected raw takes joined
  without gain (matched takes plus a busy limiter measured 2.6 LU against 4.5 raw, and the
  narrator heard his voice as flattened). Choose the speed-up stretcher by a round trip on the actual voice
  ([video-edit's audio notes](../../video-edit/references/technical.md)).
- Before the VO exists, mix music and effects at the level they will sit under the voice.
- Duck music by phrase, merging close words; per-word ducking pumps.
- Keep effects off key spoken words.
- Real footage brings its own sound (crowd, engines); duck it under speech like music, or it
  reads as a random burst over the voice.
- Measure instead of guessing: `ffmpeg -af ebur128` for loudness and true peak; render a stem
  without the VO for the VO-to-bed ratio in the 1–4 kHz band.

## Gotchas

- A killed `remotion still` or `render` can orphan its `chrome-headless-shell` (parent pid 1); in
  one long multi-agent session they reached about 175 processes and 3 GB. Reap before each render:
  `ps -A -o pid=,ppid=,command= | awk '$2==1 && /chrome-headless-shell/ {print $1}' | xargs kill`.
- Never rewrite a file a running render reads (a matte, texture, image sequence or audio): build
  replacements in a staging folder, swap them in between renders, re-render only the chunks that
  use them.
- zsh (the macOS default) doesn't word-split unquoted variables: in `for r in "0 300" "600 900";
  do set -- $r`, `$1` stays `"0 300"`, so a chunk loop can render nothing and exit 0. Call each
  range explicitly or use arrays.
- Agents rendering on one machine starve each other: a full render can be killed (exit 137), and a
  3,500-frame 3D render beside another job crashed a machine. Before fanning out, check memory,
  swap and load (`memory_pressure`, `sysctl vm.swapusage`, `uptime`): with swap 95% full and load
  20 on 12 cores every agent crawled, and stopping an idle VM halved the load. Route every heavy process
  (renders, encoders, compositing scripts, your own jobs) through one queue, render finals in
  chunks one at a time (300 frames worked), skip chunks already on disk so a rerun resumes, join
  with FFmpeg's concat demuxer (`-c copy`), mux the mix, and check the frame count against
  `TOTAL`.
- Parallel `remotion still` calls on the entry file race on the webpack cache. Bundle once, then
  render stills from the bundle (`snap.sh` does). Keep the bundle between batches and rebuild it
  only after source changes; deleting it per batch cost about 2 minutes each under load. Layout
  and motion checks can run at `--scale=0.5`; judge finish at full size.
- A React component defined inside another component's body is a new type on every render, so it
  remounts each frame: geometry rebuilds and state it set resets. It shows as one-frame pops and
  brightness differences between a sequence and a single still. Define components at module level.
- `rsync --exclude src` also strips `node_modules/*/src`. Copy projects without node_modules and
  reinstall.
- To extract an exact frame from a render, use `-vf "select=eq(n\,N)"`; `-ss` before `-i` on a
  concatenated file was off by one frame. The last renderable frame is `TOTAL - 1`.
- To re-cut a finished composition from source-frame segments, offset with nested sequences
  (`<Sequence from={outStart} durationInFrames={len}><Sequence from={-sourceIn}>…`).
  `<Freeze frame={n}>` clamps n to the host composition's last frame, so it silently shows the
  wrong frame for any source frame past the output length.
- `loudnorm` pads its output to a 100 ms boundary, so a normalised track can run up to 0.1 s past the picture
  (measured: 3.70 s picture, 3.80 s audio). `render.sh` and `deliver.py` trim it back with `atrim`; do the same
  in any other mix script.
- Browser console output may not reach the CLI log during renders; print debug values into the
  frame instead. `snap.sh` records the stills' console errors and warnings in `findings.json`
  ([recover](recover.md#findings)).
- Whisper merges and splits words and hyphenations. Fix `words.json` with a kept script.
- TTS job JSON can hold a voice-preview URL as well as the output. Take the job's result URL.

## Checking without watching

- Stills: `./snap.sh out/check 0 1.5 3 …`, then read the sheet.
- From a render: `ffmpeg -vf fps=2,scale=360:-1` for the whole piece, or fps=10 around cuts.
  Frame N at fps=2 is t=(N-1)/2.
