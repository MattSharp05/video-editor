# Review: motion, judges, stills, fact-check, mute test, restart

## Motion

Stills can't show the difference between a second where one thing drifts and a second where many
things transform, so check motion moving, or as strips of consecutive frames.
- **Required before every full render:** a quarter-scale preview (`npx remotion render ... --scale=0.25`) checked
  with `motion_check.py` against an accepted film; redesign flagged seconds ([a movie, not a presentation](motion-principles.md)).
  Moon tides 01 skipped this and shipped 14 slide-like seconds the tool would have flagged.
- **Look for holds:** stretches where the voice explains and the picture only drifts or pans. In
  two rejected explainers the composition stayed nearly unchanged three to four times as often as
  in the film they were measured against.
- **Each beat has an event.** Secondary action it causes, the place's own life and a camera that
  answers it (with anticipation and settle) make it physical.
- **Effects are punctuation:** tied to an event, brief, the hero kept in view.
- No bar film on disk (cloud sessions: renders are git-ignored)? Read the cut's own readout
  (`projects/octopus-01/film/mc_readout.py CUT.mp4`) against recorded medians of accepted films: Grand Canyon 01 11
  movers/s, Lightsaber 01 20, Octopus 01 24.5; redesign any second under ~6 unless it is still on purpose.
- `templates/remotion-film/motion_check.py film CUT.mp4 --bar BAR.mp4` counts separately moving
  things second by second against a film the user accepted and writes frame strips of the
  stillest seconds. Read it as a diagnosis, then fix with better pictures.
- When a film reads flat beside its anchor, put matched beats side by side at the same size and
  measure what differs: near-flat and near-black area, edge density, chroma, repeated frames
  (perceptual hash), camera movement versus objects moving.

## Temporal checks

On each shot's fastest second, and on every 3D shot. When a tool can play the shot, watch it at
full speed first. Then:
1. **Consecutive frames.** Tile one second around the fastest motion: one second is `fps` frames
   from frame `start_s × fps`; at 24 fps, seconds 2–3:
   `ffmpeg -i shot.mp4 -vf "select='between(n\,48\,71)',scale=480:-1,tile=6x4" -frames:v 1 -fps_mode vfr sheet.png`
   (at 30 fps, `between(n\,60\,89)` and `tile=6x5`). Look for popping detail, sliding contacts,
   crawling shadow edges and textures swimming across surfaces.
2. **Flicker.** Mean brightness per frame:
   `ffprobe -v error -f lavfi -i "movie=shot.mp4,signalstats" -show_entries frame_tags=lavfi.signalstats.YAVG -of csv=p=0`.
   A one- or two-frame jump that the camera, objects and light don't explain is worth finding in
   the frames. Common causes: a shadow camera that moves with the view, noise that changes every
   frame, per-frame denoising.
3. **Determinism.** Render a few frames twice and compare `ffmpeg -i a/%04d.png -f framemd5 -`
   with the same for `b/`. A difference points at an unseeded random value, a clock or a late
   texture (GPU path tracing and denoisers can also differ slightly); look before calling it a bug.

These are screening, not pass marks.

## Judges

Independent fresh agents judge a render against the current brief and platform, extracting frames
themselves and relating them to `words.json`. Useful output: issues with time ranges and fixes,
plus what to keep, so fixes don't break what works. Between them, cover:
- **Motion:** on-model consistency, acting, continuity across cuts, broken frames, a presenter's
  eyeline at every cut.
- **Story and ideas:** does frame 0 stop the scroll; can a newcomer retell what physically
  happens in each line with the sound off; which pictures would a viewer share, and which are the
  literal default a better idea would beat; dead stretches.
- **Design and sound:** the bar against each shot's anchor frame, whether the accent is where the
  eye should go, safe zones, caption legibility, and the audio measured with ffmpeg (VO-to-bed
  ratio, masking, loudness, true peak, effects on their events).

Scores plateau fast and recalibrate between rounds (one film's judges stuck at 6–7 out of 10
across rework): track open issues, not the number. The top issue after a couple of rounds is
usually one only the user can decide.

**Real footage:** each real clip must show what the words over it claim. A fresh agent checking
frames it extracts itself, through the crop actually used, catches what descriptions hide: on one
film a crop centred on the wrong rocket stage, misspelled creator handles, and a borrowed clip's
trailing frames.

Breakages to look for on every contact sheet: limbs lost when a shot is cropped, ghosting from
opacity fades, recurring entities changing scale, an empty first frame after a canvas mounts, and
a blurred or unstable final frame.

## Assembled assets

Every assembled asset: the joint check passes (no declared joint gap over tolerance, the contact graph is one
piece) and its colour-per-part turntable sheet plus a close-up of every joint were read before boarding: no
floating, cut-off or offset part from any angle. How: [assembly](assembly.md). A frame review that asks only
whether a shot reads misses this (Dream brain 01 v1: a floating neck and a spinal cord off the brainstem).

## Stills before renders

A full render costs tens of minutes (Grand Canyon 01: 36 min for 77 s of 3D); a still costs
seconds. Before each full render, render stills at every beat from one bundle (`snap.sh`, or a
`stills.mjs` with `renderStill`, at 0.4–0.5 scale for layout) and read them as a contact sheet.
On Grand Canyon 01 about 20 problems were caught this way (a reversed river, labels off screen,
an invisible flash flood, a caption wrapping, a camera inside the ground), before and after the
first full render. Check finish at full size on the beats that carry the look.

Two blind spots of stills taken at round seconds (Octopus 01, ~45 min of re-render):
- **Take a still at every claim's key word** (its time in `beats.json`), not every N seconds: a line-up of three
  colour sacs read as nothing at its key word, but no round-second still fell inside the 2 s it was on screen.
- **Check the camera between its keys.** A key still shows where the camera is, not what it flies through to get to
  the next key: Octopus 01's move to a dish passed through a brain coral, then a branching coral, and no key still
  showed either. For every camera segment, render stills at 1/4, 1/2 and 3/4 of the way, or test the sampled path
  against each prop's bounding sphere in code (distance > radius + near plane) and move the key or the prop.

## Fix by partial re-render

After the first full render, fix a problem by re-rendering only its frame range
(`npx remotion render … --muted --frames=A-B`), splicing it into the silent master over exactly
those frames, checking the total frame count, and muxing the mix back on with `-c:v copy`. Grand
Canyon 01 fixed three problems in 2–10 min each instead of a 36 min re-render. Check the frames
either side of each seam; the full method is in
[splicing](handoffs.md#splicing-new-parts-into-a-finished-film).

## Fact-check

Before the board, a fresh agent checks every claim the film makes, spoken and on screen (labels,
numbers, captions), as worded against its sources: research that is right is often overstated in
the wording. On Grand Canyon 01 nothing was wrong but five lines were reworded ("with sand" →
"with grit", "only cuts down" → "mostly cuts down"). For a product, the source is the product's
code and screens (Trip clip 01: every toast checked against the code). Keep the table of claims
and sources in `script.md`; unverified facts stay out of the film.

## Mute test

Does the picture tell the story without the voice? A fresh judge, who has never seen the script, describes the film
from frames with the narration hidden. Run it twice, and on each act as it lands when acts are built separately:

1. **On the stills, before the first full render** (the cheap pass). Render one still per second across the film with
   captions off (`--props='{"captions":false}'`; `snap.sh` or a `stills.mjs`, 0.4 scale is enough). A full render costs
   an hour on the CPU; this pass costs ~5 minutes of stills and ~1 minute of judging. Black hole 01 ran the test only on
   the first full cut: every miss it found (the flashback, the swirling gas, the stretch zone, a camera through a prop)
   was visible in stills, and the fixes forced a second 68-minute full render.
2. **On the first full cut**, before it goes to the user: motion, crops and pops between stills only show here. No
   re-render: paint the caption band black on the cut's frames.

How:
1. Make the sheets: `python3 templates/remotion-film/mute_sheets.py CUT.mp4 OUTDIR` (frames at 2 fps, caption band
   blacked out) or `python3 mute_sheets.py STILLS_DIR OUTDIR` (stills named by their second). It writes timestamped
   contact sheets of 24 tiles plus single frames for close looks. On-screen cards stay: they are part of the picture;
   captions would hand the judge the narration. A film whose captions sit elsewhere passes `--band TOP:HEIGHT`.
2. Spawn a fresh judge with only the sheet paths (no script, no plans, no notes, no other project files) and this
   prompt:
   > You are judging a short silent vertical video from still frames only. You have never seen its script. Read these
   > contact sheets in order (each tile is labelled with its timestamp; the top band where narration captions would be
   > has been blacked out on purpose, but on-screen cards in the picture are part of the film). Single frames are at
   > OUTDIR/f_NNN.jpg for a closer look. Describe what happens and what it explains, second by second (group into
   > short spans). Say where you can't tell. Be concrete about what physically happens to what. Then list (a) the
   > moments that were confusing or that you could not interpret, and (b) anything that looked broken (glitches,
   > cropped subjects, objects popping, unreadable cards). Under 700 words. Do not read any other files in the project.
3. List the script's claims, one per sentence. A claim is recovered when the judge's account states it or shows its
   mechanism. Each missed claim goes back to its shot with the judge's words; fix it in the picture first (show the
   mechanism acting), and add a card only where the picture can't carry it (Black hole 01: "LONG AGO: A GIANT STAR"
   for a flashback). Fix everything in list (b) too.
4. After fixes, re-run the stills pass on the changed seconds; record what the judge recovered and missed in the brief.

## Restart after a rejected cut

When the user rejects a whole cut ("low quality", "not immersive", "start over"), the problem is
the pictures or the concept, not the shots. Stop all builds and renders. A fresh agent judges the
finished film (and any reference film) before reading the plans; give it the films and the
script, not your own diagnosis, and ask for ranked problems, what to keep and different
directions. Take the user's notes on it, record what they lock (often the script, the voice and
any camera footage), and restart at step 1 of the skill. A new agent carrying the lessons avoids
inheriting the old plan's assumptions.
