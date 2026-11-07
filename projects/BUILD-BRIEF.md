# Builder brief (shared by the three films of 2026-11-07)

You build ONE finished animated Reel end to end, unattended: Matthew asked for the whole film to be made without his
approval, so the concept, board and voice gates are already self-approved by the orchestrator. Don't stop to ask; decide,
note the decision in `film/PLAN.md`, and keep going. Work only inside your own project folder (plus reading shared files).

## Read first (in this order)
1. `/home/user/video-editor/CLAUDE.md` and `profiles/animated-video.md`, `profiles/video-edit.md` (his taste: binding).
2. `.claude/skills/animated-video/SKILL.md`, then `references/motion-principles.md`, `references/remotion-pipeline.md`,
   `references/review.md` (stills, motion, temporal checks), `references/three.md` only if you use three.js.
3. Your project: `lines.txt` (locked script, fact-checked: don't change wording), `pictures-pick.md` (the approved beat
   sheet: it fixes each beat's idea; you own how it moves and may swap in a better picture if you see one: note why),
   `research.md` (facts; every on-screen number must equal the narration).
4. A worked film for structure: `projects/moon-tides-01/film/` (Film.tsx shell, beats.py, captions kit, sound/mix.py).

## Inputs that arrive while you work
- Voiceover (AI, American male design-m2 clone): `vo/vo.wav`, `vo/words.json`, `vo/line_starts.json`. It is being
  generated now in the render queue; progress in `/tmp/claude-0/-home-user/2e856e1b-0c03-5394-b668-746268e55d77/scratchpad/vo.log`
  (order: ai-image-01, vegas-sphere-01, lactate-run-01). Until it exists, build on stand-in timings (2.8 words/s), then
  copy `vo/words.json` to `film/src/words.json`, write `beats.py` → `src/beats.json` and time everything from beats.
  If `assemble.py` printed DIFF (ASR mishearing), fix `words.json` to the script words and keep the timings.

## Format and hard rules
- 1080×1920, 30 fps, total = last word + ~1.2 s tail, and **under 60 s**. Frame 0 is the cover: legible, already moving.
- Made in code (Remotion: React/SVG/canvas, three.js only where it earns it). CPU only, software WebGL: keep frames cheap.
- Motion principles, all of them: one shot, no cuts; every hand-off has a named carrier; one lead at a time in the accent;
  the camera never parks; several things move at once at different scales; **never more than ~3 s where only
  overlays/labels change** (Matthew: "feels more like a presentation rather than a movie"); each step changes the state of
  the world; no empty black background (the background is the film's own world, dim, slow); emphasis without boxes;
  one look per state for the whole film (write the state → look table in PLAN.md before building, plus the thread table:
  lead → move → next lead → carrier).
- Entertaining, engaging, fun (Matthew's words for this batch): jokes live in the pictures, characters act, payoffs land.
- Captions: hand-written sense units from the transcript (`src/kit/captions.tsx` from templates/parts), top safe area
  y 250–470 over a dark scrim, key words in the accent. A `captions` prop (default true) so the mute test can turn them off.
- Reels safe zones: nothing important in the top 220 px, bottom 420 px, or x > 930 at y > 1100.
- Deterministic: frames only from `useCurrentFrame()` and Remotion `random(seed)`; no Math.random or clocks. Components
  at module level. Preload all assets before mounting canvases.
- Original art only: no logos, brand marks, copyrighted characters or show content (draw our own emoji, eyeball, etc.).
- Honesty tags on screen where a picture simplifies (e.g. "Illustration", "Not to scale") when it matters.

## Sound (`film/sound/mix.py`, modelled on moon-tides-01's)
- Voice up front, close to raw. Music: Floating Cities (Kevin MacLeod, CC BY 4.0) at
  `/home/user/video-editor/lab/sound-picker/music-src/Floating_Cities.mp3` (quiet file: +12 dB puts it ~10–12 dB under
  speech; duck gently by phrase; up in the pauses; clearly audible; fade in/out).
- Effects: only CC0 `library/sfx/cstack-cc0/*` or synthesized (ffmpeg lavfi / numpy). Subtle, soft, dark-warm, short:
  "Not big clinks or chimes". Swipes silent. Each sound has a visible cause and is timed from beats.json. ~7 weighted
  events per 10 s at most. Write `sound/cues.json`.
- Master: -14 LUFS integrated, under -1.5 dBTP, measured on the final MP4 (`ffmpeg -af ebur128=peak=true`).

## Process (record machine-clock times: `date -u +%T`, in PLAN.md under "Timeline")
1. Setup `film/`: copy `templates/remotion-film/` (lib.ts, kit/, scripts) and the parts you need; `package.json`
   `{"type":"module"}`; `npm i remotion@4 @remotion/cli@4 react react-dom typescript @types/react` (+ `@remotion/three
   three @react-three/fiber @types/three` only if used); fonts from `projects/moon-tides-01/film/public/fonts/`
   (Hanken Grotesk etc.). `remotion.config.ts` like moon-tides (swangle, delayRender timeout 120000).
2. PLAN.md (language table, thread table, beat → time map, decisions), then build.
3. Stills at every beat at `--scale=0.5` from one bundle; read the contact sheet; fix. Repeat. Check full-size stills on
   2–3 hero frames.
4. Quarter-scale preview (`--scale=0.25 --muted`), then `python3 motion_check.py film PREVIEW.mp4 --bar
   /home/user/video-editor/projects/grand-canyon-01/film/out/bar_q.mp4 --strips out/strips` (the bar is Grand Canyon 01,
   an accepted film; if the file isn't there yet, wait for it, don't skip). Redesign every flagged second with better
   pictures (not camera drift); re-run until it passes or only defensible seconds remain (say which and why).
5. Full render (`--concurrency=3`, crf 18), mix, mux, loudness pass (template `render.sh` logic). Check frame 0, the last
   second, the frame count, loudness and true peak. Temporal check (consecutive-frame strip + YAVG flicker) on the
   fastest second.
6. Final file: `projects/<slug>/renders/<slug>_v1.mp4` (git-ignored). Key stills worth keeping → `projects/<slug>/stills/`.

## Shared machine (4 cores, 15 GB, no swap; three builders + TTS)
- Run EVERY heavy job through the queue wrapper: `/tmp/claude-0/-home-user/2e856e1b-0c03-5394-b668-746268e55d77/scratchpad/rq <command>`
  (remotion render, remotion still batches, previews, big ffmpeg encodes, motion_check). It serialises with flock, so a
  call may wait: that is expected. Bundle once per source change and render stills from the bundle.
- Before each render, reap orphaned chrome: `ps -A -o pid=,ppid=,command= | awk '$2==1 && /chrome-headless-shell/ {print $1}' | xargs -r kill`.
- Never edit another project's files. **Don't git commit or push** (the orchestrator commits; three agents share one repo).
- Never post or upload anything anywhere.

## Report back (your final answer)
Final path, duration and frame count, loudness/true peak, motion_check result (movers median vs bar, flagged seconds and
what you did), stills sheet paths, what is synthetic/AI (voice AI, music credit), the caption text for Instagram (with
caveats from research.md and the music credit), open issues, skipped checks, every error you hit and every rewrite or
redesign (with times), and your phase timeline from PLAN.md.
