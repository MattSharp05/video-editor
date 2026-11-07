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

## Start-up jobs (start in the background first thing, then plan and build while they run)
- Voiceover (AI, American male design-m2, cloned from the approved clip): `vo/` has `lines.json`, `gaps.json`,
  `gen_vo.py`, `assemble.py` (trim + join) and `align_lines.py` (word timings line by line; never whole-file: whisper
  hallucinated on the joined VO in every 2026-11-07 film). Set up once:
  `cd lab/voice-picker && uv venv -p 3.12 .venv-qw && VIRTUAL_ENV=.venv-qw uv pip install qwen-tts soundfile faster-whisper scipy numpy 'av==16.0.1' --extra-index-url https://download.pytorch.org/whl/cpu --index-strategy unsafe-best-match`
  (the av pin avoids a known crash), then from `vo/`: `PY=../../../lab/voice-picker/.venv-qw/bin/python; $PY gen_vo.py all 7 && $PY assemble.py && $PY align_lines.py`.
  Until it exists, build on stand-in timings (2.8 words/s); then copy `vo/words.json` to `film/src/words.json`, write
  `beats.py` → `src/beats.json` and time everything from beats. A DIFF line: ASR mishearing → fix `words.json` to the
  script words; a dropped/changed word in the audio → regenerate that line alone with another seed (`gen_vo.py 4 11`).
- Music: `lab/sound-picker/music-src/` is git-ignored: `mkdir -p lab/sound-picker/music-src && curl -sSL -o
  lab/sound-picker/music-src/Floating_Cities.mp3 "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Floating%20Cities.mp3"`.
- Motion bar: **already committed** at `lab/motion-bar/grand-canyon-01_q.mp4` (Grand Canyon 01, quarter scale). Never
  re-render it. The python tools (motion_check, measure) can run with the voice venv (it has numpy/scipy/soundfile).

## Format and hard rules
- 1080×1920, 30 fps, total = last word + ~1.2 s tail, and **under 60 s**. Frame 0 is the cover: legible, already moving.
- Made in code (Remotion: React/SVG/canvas, three.js only where it earns it). CPU only, software WebGL: keep frames cheap.
- Motion principles, all of them: one shot, no cuts; every hand-off has a named carrier; one lead at a time in the accent;
  the camera never parks; several things move at once at different scales; **never more than ~3 s where only
  overlays/labels change** (Matthew: "feels more like a presentation rather than a movie"); each step changes the state of
  the world; no empty black background (the background is the film's own world, dim, slow); emphasis without boxes;
  one look per state for the whole film (write the state → look table in PLAN.md before building, plus the thread table:
  lead → move → next lead → carrier).
- Entertaining, engaging, fun (Matthew's words): jokes live in the pictures, characters act, payoffs land. Every key
  object the voice names carries one printed word the first time it appears (muted viewers missed unlabelled ones).
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
4. Quarter-scale preview (`--scale=0.25 --muted`), then `motion_check.py film PREVIEW.mp4 --bar
   /home/user/video-editor/lab/motion-bar/grand-canyon-01_q.mp4 --strips out/strips`. motion_check counts *separately*
   moving things: one big field moving as a whole counts as one mover (the 2026-11-07 Sphere failed this way), so give
   every close-up independent life (particles, props, neighbours reacting, a character's face). Redesign every flagged second with better
   pictures (not camera drift); re-run until it passes or only defensible seconds remain (say which and why).
5. **Mute test, required, never skipped** (`references/review.md#mute-test`): render captions-off muted frames (2 fps
   sheets with timestamps) and give them to a fresh agent (Agent tool) that has never seen the script: "Describe what
   happens and what it explains, second by second. Say where you can't tell." List the script's claims; fix every miss
   in its shot. Cheapest fix that worked last time: one printed word on each key object the voice names, and faces on
   things that struggle. Re-judge the fixed shots with a second fresh agent.
6. Full render (`--concurrency=3`, crf 18), mix, mux, loudness pass (template `render.sh` logic). Check frame 0, the last
   second, the frame count, loudness and true peak. Mux with padded audio (`apad`) and `-t`, never `-shortest` (it cut 4
   frames twice). Temporal check (consecutive-frame strip + YAVG flicker) on the
   fastest second.
7. Final file: `projects/<slug>/renders/<slug>_v1.mp4` (git-ignored). Key stills worth keeping → `projects/<slug>/stills/`.

## Never go idle
Nobody is watching. Never end a turn while work remains: run long jobs with `run_in_background` (you're re-invoked
when they finish) or wait with Monitor until-loops; background Bash jobs are capped at 60 min, so split long renders
into chunks. When everything is delivered, send the orchestrator (session_01WProZZXsgMxE5Vt8fwTbeJ) a one-paragraph
summary with the `send_message` tool of the claude-code-remote server.

## Machine and git (your own cloud session: 4 cores, ~15 GB, no swap)
- One heavy job at a time (TTS, bar render, previews, full render). Bundle once per source change and render stills from
  the bundle. Before each render, reap orphaned chrome:
  `ps -A -o pid=,ppid=,command= | awk '$2==1 && /chrome-headless-shell/ {print $1}' | xargs -r kill`.
- Three sessions (one per film) share the branch `claude/generate-three-videos-02e0kn` of MattSharp05/video-editor. Only
  touch your own `projects/<slug>/` folder. Commit often (source, PLAN.md, VO takes, stills; never node_modules, out/,
  renders, mp4) with `git pull --rebase origin claude/generate-three-videos-02e0kn` before every
  `git push -u origin claude/generate-three-videos-02e0kn`. Don't create PRs.
- Renders are git-ignored, so the final MP4 must be delivered with the session's file delivery (SendUserFile with the
  final MP4, display "render") as well as kept at its path.
- Never post or upload anything anywhere else (no Broadcast upload, no social posting).

## Report back (your final answer)
Write it to `projects/<slug>/REPORT.md` (committed) and also give it as your final message: final path, duration and frame count, loudness/true peak, motion_check result (movers median vs bar, flagged seconds and
what you did), stills sheet paths, what is synthetic/AI (voice AI, music credit), the caption text for Instagram (with
caveats from research.md and the music credit), open issues, skipped checks, every error you hit and every rewrite or
redesign (with times), your phase timeline from PLAN.md, and a production-analytics table from
`templates/remotion-film/analytics.py` over your own session transcript (find the newest .jsonl under `~/.claude/projects/`)
if it runs; otherwise say so.
