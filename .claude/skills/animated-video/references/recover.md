# Recover: find a fix by its symptom

Every failure below is already documented on another page; this page indexes them by what you
see. It adds no rules: when a row and its source disagree, the source wins, and a new lesson goes
to its source page (then gets a row here). Read the source before applying a fix you don't
remember in full.

1. Run the stills first: `./snap.sh out/check 0 1.5 3 …` writes `findings.json` beside the sheet.
   Most broken renders announce themselves there ([findings](#findings)).
2. A render looks slow? [Estimate before calling it stuck](#estimate-before-calling-it-stuck).
3. Otherwise find the symptom in the tables below.

## Findings

`snap.sh` renders the stills through `snap.mjs` and records what the browser reported while it
drew them. Remotion's CLI (`remotion still --log=verbose`, 4.0.543) printed failed loads but not
the film's `console.error` or `console.warn` (measured 2026-11-24; the pipeline gotcha "browser
console output may not reach the CLI log"), so the stills go through `renderStill` with a browser
log hook and a network listener instead. The film's `remotion.config.ts` (gl renderer,
delayRender timeout) applies as it does in the CLI.

`findings.json`: `ok` (no unallowed `fail`), counts of `fail`, `warn` and `allowed`, `notes`, and
`findings`, each with `kind`, `severity`, `message`, `url` or `source` (`src/File.tsx:line`,
mapped through the bundle's source maps) and the `frames` it appeared on (`load` = while the
composition loaded). `snap.sh` exits 1 when `ok` is false, after writing the stills and the sheet.

**Fix each `fail` finding before a full render, even when the stills look right.** A missing
texture or a failed image shows in a still only as an absent object (late textures:
[three.js](three.md)); a remote file can be there for the still and gone for the render.

| Kind | Severity | Usual cause | Fix |
| --- | --- | --- | --- |
| `render_error` | fail | the film threw on that frame; an `<Img>` failed after retries; a `delayRender` timed out | the `page_error` beside it has the file and line; for a load, the `load_failed` has the URL |
| `page_error` | fail | an uncaught exception in the film's code | fix at `source` |
| `console_error` | fail | the film or a library logged an error | read the message; an "object argument" entry is usually React or Remotion reporting the error listed beside it |
| `load_failed` | fail | a file under `public/` that isn't there (wrong name, not copied, staged elsewhere), an HTTP error, a blocked host | fix the path, or put the file in `public/`; never rewrite a file a running render reads ([pipeline](remotion-pipeline.md#gotchas)) |
| `remote_request` | fail | an image, model, script or API fetched from the internet during the render | download it into `public/` and load it with `staticFile()`; record where it came from ([sourcing](sourcing.md#record-it)) |
| `font_not_in_tree` | fail | a font file fetched from outside the project (a CDN, Google Fonts at render time) | put the font file in `public/fonts/` with an `@font-face`, as the films in `projects/` do |
| `font_failed` | fail | a declared `@font-face` whose file didn't load | fix its `src` path |
| `console_warn` | warn | deprecations, retries, library notices | read once; allow-list it if harmless |
| `font_undeclared` | warn | DOM text whose first family has no `@font-face`, so a system font draws it (differs between Matthew's Mac and the cloud) | declare the family, or name a generic family (`system-ui`, `sans-serif`) first if a system font is intended |

`font_undeclared` sees DOM text only: text drawn on a `<canvas>` (`ctx.font`) isn't checked.

**Allow-list:** `findings-allow.txt` in the film folder (the template ships one; `FINDINGS_ALLOW=path`
overrides), one regular expression per line, matched against `kind: message url`. Add a line only
for a message you've read and understood, with a comment saying where it was seen. Allowed
findings stay in the file with `"allowed": true`. The template's two lines are the warnings
code-history-01 gave on every still (a three.js deprecation, and Chrome's notice that it fell
back to software WebGL), with 0 fail.

Options: `SCALE=0.5` (layout checks at half size), `PAR=n` stills at a time (default 2, one
browser each), `COMP=Id` for another composition. Measured: three stills of code-history-01 at
0.4 scale took 44 s; a 2D test film, 16 s including the type check and bundle.

## Estimate before calling it stuck

- **Time a short test, not Remotion's ETA.** Render 30–40 frames of a typical shot
  (`npx remotion render … --frames=A-B`), subtract ~20 s start-up, divide by the frame count, and
  multiply by the film's frames. Remotion's own estimate in the first minutes said 7 h for a
  render that took 67 min ([three.js](three.md); [look pass](look-pass.md)).
- **Known costs (CPU, no GPU, 1080×1920):** lit 3D set about 2.3 s/frame at `dpr={1}`
  (code-history-01: 67 min for 58 s), and `dpr={1.5}` roughly tripled it; Grand Canyon 01 went
  from 0.85 to 1.8 s/frame with the whole look pass (36 → ~70 min for 77 s); environment lighting on
  every surface added ~0.8 s/frame ([look pass](look-pass.md)). A partial re-render of a frame
  range took 2–10 min ([review](review.md#fix-by-partial-re-render)).
- **Slow, not stuck:** the frame count in the progress line rises, chunk files keep landing on
  disk at about the measured rate, and `chrome-headless-shell` processes use CPU.
- **Starved:** swap nearly full and load far above the core count (95% swap and load 20 on 12
  cores made every agent crawl). Stop idle jobs and route heavy work through one queue
  ([pipeline](remotion-pipeline.md#gotchas)).
- **Stuck:** the count stops for many times the measured seconds per frame; usually a
  `delayRender` waiting on something that never loads, which ends in a timeout error naming its
  label. Run `snap.sh` on that frame: its findings show the failed load.
- Run long renders and transcription in the background at capped parallelism: a foreground job
  killed for memory can end the agent session with it
  ([video-edit technical](../../video-edit/references/technical.md#shell-gotchas-in-build-scripts)).

## Rendering and the machine

| Symptom | Cause | Fix | Source |
| --- | --- | --- | --- |
| Render killed, exit 137; a machine crashed | agents rendering at once starve each other of memory | check memory, swap and load before fanning out; one queue; finals in 300-frame chunks, one at a time, skipping chunks on disk; concat with `-c copy`; check the frame count | [pipeline](remotion-pipeline.md#gotchas), [technical](../../video-edit/references/technical.md#shell-gotchas-in-build-scripts) |
| Hundreds of `chrome-headless-shell` processes, GBs of memory | killed `still`/`render` runs orphan their browser (parent pid 1) | reap before each render: `ps -A -o pid=,ppid=,command= \| awk '$2==1 && /chrome-headless-shell/ {print $1}' \| xargs kill` | [pipeline](remotion-pipeline.md#gotchas) |
| Parallel stills fail or race | `remotion still` calls on the entry file share the webpack cache | bundle once and render from the bundle (`snap.sh` does) | [pipeline](remotion-pipeline.md#gotchas) |
| Each still batch costs ~2 min more under load | the bundle is rebuilt per batch | keep it between batches; rebuild only after source changes | [pipeline](remotion-pipeline.md#gotchas) |
| A chunk loop on macOS renders nothing and exits 0 | zsh doesn't word-split unquoted variables (`set -- $r`) | call each range explicitly, or use arrays | [pipeline](remotion-pipeline.md#gotchas) |
| A chunk or texture changes mid-render | a file the render reads was rewritten | build replacements in a staging folder, swap between renders, re-render the chunks that use them | [pipeline](remotion-pipeline.md#gotchas) |
| A copied project fails in odd places | `rsync --exclude src` also stripped `node_modules/*/src` | copy without node_modules and reinstall | [pipeline](remotion-pipeline.md#gotchas) |
| `console.log` debugging shows nothing | browser console output didn't reach the CLI | `snap.sh` records errors and warnings in `findings.json`; for values, print them into the frame | [pipeline](remotion-pipeline.md#gotchas), [findings](#findings) |
| A WebGPU-only technique (TSL, GTAO node) won't render in the cloud | headless Chrome there has WebGL2 only | use a WebGL2 route | [look pass](look-pass.md) |
| `render.sh` says "over 50 MB" | the video bitrate is too high for the length | lower `--encoding-max-rate` | [render.sh](../templates/remotion-film/render.sh), [pipeline](remotion-pipeline.md#platform-facts-instagram-reels-916-as-of-2026-09-recheck) |

## Picture: frames and stills

| Symptom | Cause | Fix | Source |
| --- | --- | --- | --- |
| An object missing in random frames | a texture or image requested but not yet drawn when the frame was captured | hold the frame with `delayRender` until it is drawn; check `findings.json` for a `load_failed` | [three.js](three.md) |
| Terrain or a model missing in stills even with `settle()` | loaded inside a scene that mounts mid-film | load every texture and data file once at the top of the composition and mount the canvas when all are ready (`usePreload`) | [three.js](three.md) |
| Empty first frame after a canvas mounts | stock `ThreeCanvas` captures before the scene draws | use the template's `src/kit/three-canvas.tsx` | [three.js](three.md), [review](review.md#judges) |
| One-frame pops; a still and the same frame in a render differ in brightness | a component defined inside another component's body remounts every frame | define components at module level | [pipeline](remotion-pipeline.md#gotchas) |
| Two renders of the same frames differ | an unseeded random value, a clock, or a late texture | `random(seed)` and `useCurrentFrame()` only; compare with `framemd5` | [pipeline](remotion-pipeline.md#structural-conventions), [review](review.md#temporal-checks) |
| A one- or two-frame brightness jump | a shadow camera moving with the view, per-frame noise, per-frame denoising | find it with the `signalstats` YAVG check, then in the frames | [review](review.md#temporal-checks) |
| The extracted frame is one off | `-ss` before `-i` on a concatenated file | `-vf "select=eq(n\,N)"`; the last frame is `TOTAL - 1` | [pipeline](remotion-pipeline.md#gotchas) |
| `<Freeze>` shows the wrong frame | it clamps to the host composition's last frame | offset with nested `<Sequence>`s instead | [pipeline](remotion-pipeline.md#gotchas) |
| Problems in beat openings although every key frame was approved | stills checked only at key frames | snap each beat's first, middle and last frame | [review](review.md#stills-before-renders) |
| Ghosted characters | opacity crossfades | cut, or move the character | [characters](characters.md#check-every-rig-for), [review](review.md#judges) |
| Limbs lost or floating feet in a close-up | a wide rig cropped | frame deliberately or draw the full body | [characters](characters.md#check-every-rig-for) |
| Broken poses; "wiggly" fingers | guessed joint angles; hand bones set directly | IK for limbs; the hand part, placed by pinch point and direction | [characters](characters.md#build), [three.js](three.md) |

## 3D

| Symptom | Cause | Fix | Source |
| --- | --- | --- | --- |
| A black disc or bar spreading from one spot | a NaN or infinite pixel fed to a gathering pass (bloom, depth of field) | sanitise its input (non-finite to 0, clamp to half-float range) | [three.js](three.md) |
| Washed out, or contrast crushed | tone mapping applied twice, or a second curve on Blender PNGs | tone map exactly once; PNGs from Blender go in as they are, EXRs get one transform | [three.js](three.md), [realistic 3D](../styles/realistic-3d/README.md#handing-blender-frames-to-remotion) |
| The outer surface paints over an x-ray or glass reveal | nested transparent parts without order | explicit `renderOrder` | [three.js](three.md) |
| Cloned materials ignore per-frame updates | a wrapper cloned the materials; a compile hook reads the original's uniforms | bind hooks to the material being compiled; don't wrap subtrees that animate their own materials | [three.js](three.md) |
| `envMapIntensity` has no effect (r186) | the material is lit by `scene.environment` without its own `envMap` | assign the environment texture explicitly | [three.js](three.md) |
| A floor stays mirror-bright at grazing angles | metallic Fresnel | lower metalness along with specular | [three.js](three.md) |
| The camera dives through walls or ground on a big zoom; depth flickers across scales | depth precision, a near plane too close, linear distance interpolation | `logarithmicDepthBuffer`, near plane ~1/5 of the closest subject, interpolate distance in log space, aim early | [three.js](three.md), [look pass](look-pass.md) |
| SSAO/GTAO looks broken | screen-space AO with a logarithmic depth buffer | bake AO instead | [look pass](look-pass.md) |
| Sharp background props read as a set | no depth-of-field pass in the template | soft sprites, blurred planes, or the motion kit's `Shutter` soft layer | [three.js](three.md) |
| Fog or sky colours come out wrong | they are output-space after tone mapping | author them as sRGB | [look pass](look-pass.md) |

## Timing, voice and captions

| Symptom | Cause | Fix | Source |
| --- | --- | --- | --- |
| `cue "…" is said N times; pass nth` | the phrase occurs more than once in `words.json` | pass `nth` (`after=` in `beats.py`) | [lib.ts](../templates/remotion-film/src/lib.ts), [pipeline](remotion-pipeline.md#timing-spine-beatsjson) |
| A cue or the caption check throws by name after a new VO | the speaker changed that phrase | update the cue or caption line; list unresolved phrases per act | [pipeline](remotion-pipeline.md#before-the-vo-exists) |
| Words merged or split in `words.json` | Whisper | fix with a kept script | [pipeline](remotion-pipeline.md#gotchas) |
| A generated line is in a different voice | the TTS job JSON's voice-preview URL was taken | take the job's result URL | [pipeline](remotion-pipeline.md#gotchas) |
| Transcription loops one sentence for minutes | whole-file decoding with previous-text conditioning | transcribe per speech island, conditioning off | [technical](../../video-edit/references/technical.md#repeated-speech-checks) |

## Sound and delivery

| Symptom | Cause | Fix | Source |
| --- | --- | --- | --- |
| The narrator hears his voice as flattened | matched take gains plus a busy limiter (LRA 2.6 LU against 4.5 raw) | one static gain, limiter on transients only, master quieter; measure the stem's LRA | [pipeline](remotion-pipeline.md#audio-mechanics) |
| Music pumps under speech | per-word ducking | duck by phrase, merging close words | [pipeline](remotion-pipeline.md#audio-mechanics) |
| The music bed's tail or fade is missing | `sidechaincompress` stops when the key ends | `apad` the key, `atrim` the output | [technical](../../video-edit/references/technical.md#extending-a-short-music-recording) |
| The mix drifts 5 ms against picture, or level rises after limiting | `alimiter` lookahead and auto-level | `level=0:latency=1` | [technical](../../video-edit/references/technical.md#voice-loudness-and-mixing) |
| `loudnorm` misses its target | it silently switched to dynamic mode | measure first; compress and limit gently before a final linear pass | [technical](../../video-edit/references/technical.md#voice-loudness-and-mixing) |
| True peak over the limit after export | AAC raises true peak | measure on the MP4; `render.sh` limits for it | [render.sh](../templates/remotion-film/render.sh) |

## Shell and FFmpeg

| Symptom | Cause | Fix | Source |
| --- | --- | --- | --- |
| A filter label breaks in zsh (`"$k[out]"`) | zsh reads it as an array subscript | `"${k}[out]"` | [technical](../../video-edit/references/technical.md#shell-gotchas-in-build-scripts) |
| Caption text with an apostrophe breaks `${TEXT:-…}` | bash quoting | assign it to a variable first | [technical](../../video-edit/references/technical.md#shell-gotchas-in-build-scripts) |
| `-filter_complex_script` not recognised | dropped in newer FFmpeg | `-/filter_complex filters.txt` | [technical](../../video-edit/references/technical.md#cut-and-render) |
| A slow push-in on a still jitters | `zoompan` rounds to whole pixels | `perspective` with `eval=frame` | [technical](../../video-edit/references/technical.md#camera-moves-on-still-footage) |
| `zscale` or `drawtext` missing | this FFmpeg build lacks them | check `ffmpeg -filters` | [technical](../../video-edit/references/technical.md#source-color-and-storage) |
