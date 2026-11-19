# s4 ISS gravity (brief)

Status: full render v1 running. 3D explainer series, session 4 (Earth, space and nature), video 3: a
**brain teaser**, asked for by Matthew through the coordinating session (2026-11-19: "make one more video"; pose a
puzzle in the 3D world, "pause and guess", a visual reveal that is an event). Unsupervised: every decision is logged
here; approvals go to fresh judge agents.

## Facts
- Format: Instagram Reel 1080×1920, 30 fps, 30–45 s, captions on, hook in 2 s. Goal: reach (shares, arguments).
- Voice m5 (cloned from `ref_m5.wav`, never redesigned). Music: Floating Cities, ducked 10–12 dB under the voice
  (measured). SFX: CC0 `sfx-29`–`sfx-61` (`library/sfx/cstack-cc0`) or synthesized only.
- Delivery: -14 LUFS, true peak < -1.5 dBTP, < 50 MB, measured on the MP4. Caption: no voice credit line; the
  Instagram AI label note stays.
- Free assets only (CC BY / CC0), credited; model files gitignored with a rebuild README; no paid generation.

## Decisions
- 2026-11-19 topic, from a fresh brainstorm agent's 12 candidates (its top pick): **how much gravity is on the Space
  Station? About 90 %**; the crew floats because everything up there is falling together. Chosen over all Earth's
  water in one ball and the raindrop shape: the most argued-about, the reveal is an event (step off a 400 km tower and
  fall), and it needs no caveat beyond "about". The gravity tunnel through Earth was dropped: its 42-minute answer holds
  only for a uniform Earth (38 min real; Klotz 2015).
- Not a repeat: moon-tides-01 is about tides; s4-seasons-tilt about the tilt.
- Pictures: brainstorm and picker in fresh agents (direct.md). Picker's set: a bathroom scale as the question and the
  answer (0.0 floating, ~90 % on the tower top, 0.0 again falling with the crew); the tower that becomes Newton's
  mountain (cannon shots from its top; the last one orbits and becomes the station's path); bookend wide shots.
  Dropped: elevator with a cut cable, Newton under the apple, contestants, tug of war (each a new world unearned).
- Analogy check (direct.md step 2): the draft has no analogy beyond Newton's cannon, which is the real mechanism; the
  tower is a thought experiment, checked by the fact-check. (The brainstorm ran before this check: no effect here.)
- Hooks: three from different formulas (`hooks.txt`, `check_script.py`): Cold Open Demo chosen ("Watch this astronaut
  float. How much gravity is up here?", 1.4 s, no flags).

## Assets (scouted 2026-11-19, `find_asset.py`, test-rendered with `render_glb.mjs`)
- Station: "ISS" by uperesito (sketchfab.com/3d-models/813f5b296e584c26bf386ca39de6c3d4), CC BY 4.0, 32k triangles,
  2.6 MB, static. Chosen over a 19.7 MB copy of the same mesh and Peter Stephan's 38k (failed to frame: tiny parts).
- Astronaut: "Animated Floating Astronaut in Space Suit Loop" by LasquetiSpice
  (sketchfab.com/3d-models/e2c4b146e58141e4b87917456a9970b1), CC BY 4.0, 58k triangles, a 7 s float loop (controllable:
  animated). Chosen over its 34 s version (same mesh) and Antropik's untextured one.
- Earth: globe kit (NASA Blue Marble / Black Marble, public domain; NASA credit).
- Built in code: tower, platform, scale, pen, paths, cannon trails, labels.

## Guidance read
- 2026-11-19, step 1 (re-read after merging main): video-script SKILL.md (hooks.json + check_script.py are new),
  references/picture-first.md; animated-video SKILL.md, references/direct.md, references/motion-principles.md;
  references/sourcing.md (scout); s2-monty-hall/brief.md (the series' other brain teaser: its lessons).
- 2026-11-19, step 2: styles/README.md, references/look-pass.md (re-read); styles/realistic-3d/README.md read in full
  earlier this session for s4-seasons-tilt and s4-sinkhole.
- 2026-11-19, steps 3-5: references/ai-voiceover.md, references/remotion-pipeline.md, real-sfx/references/studio-sound.md,
  references/three.md, references/assembly.md (new on main), library/voices/m5/README.md (all re-read for this film).
- 2026-11-19, step 6: references/review.md (mute test section re-read before the stills pass).

## VO
- 9 lines in m5 (`vo/lines.json`, say.py default seed; 6 min 55 s with the CPU to itself, 16-31 s a line), assembled
  with a 1.7 s pause after "Pause and guess" and 0.5 s before "So why" / "The crew falls": 38.52 s. Aligned with the
  template's align.py; `vo/fix_words.py` puts "four hundred", "ninety percent as", "eight", "Free fall," back where
  the ASR wrote 400 / 90 % is / 8 / Freefall (97 = 97 words).
- Listen for: "ninety percent **as** strong" (the ASR heard "is"; the audio may say "is").

## Sound
- `film/sound/mix.py`: 28 cues (7.0 per 10 s; more than the 2.7 the studio page gives for a voice-led explainer:
  most are one-per-event teaser beats: three needle clicks, four cannon shots and three landings). CC0 cstack set +
  synthesized brown/pink noise (tower rumble, rushing air while he falls). Whooshes peak on each of the four cuts.
  Music +7.5 dB measures **11.3 dB** under the voice while it speaks (median of momentary loudness, voice active).

## Board (fresh judge in place of Matthew's approval)
- Board v1 (`stills/board_v1.png`): APPROVE WITH FIXES. Fixed: the 90 % shown as a card 4 s early → the beat-2 dial
  returns on "ninety" (inset) and swings 0 → 90 % with an overshoot, readout "~90%"; the fall read as floating → the
  camera stays on top and tilts down, he shrinks down the tower; cannon arcs a 270 px tangle → camera square to the
  orbit plane, arcs fill the frame, earlier shots fade to 40 %, landing flashes; the lap hugging the right rail →
  seen at an angle so it passes in front of the globe, 3× thicker with a bright head, day side dimmed; no station at
  the tower top → its amber light arrives there as the tower is finished; arrows floating → one equal arrow on the
  astronaut, the scale, the pen and the station, label below; FALLING gap too small → paths 2,300 km long with an
  amber drop line; caption scrim 0.82 in the station shots; "ALMOST ALL?" out of the rail; green module desaturated;
  tower panel lattice; pen ×2.2 and scale ×1.5 (devices). Also found by me: white shards on the horizon (the globe
  kit's shaders had no log-depth chunks: z-fighting with the air shell at near 0.1 m), the astronaut shredded (GPU
  skinning 6,771 km from the origin: baked on the CPU instead), the pull-back losing its subject (34 s).
- Board v2 (`film/out/s6`, `s7` stills): checked by me against the list; accepted.

## Mute test 1 (stills every 0.5 s, captions off, fresh judge, before the render)
- Recovered every claim: the scale at 0.0, the three options and the pause, the ~400 km tower, the step-off and fall,
  ~90 %, the straight path vs the falling one, the cannon shots up to 7.7 km/s, the orbit, the same fall with the scale
  at 0.0, "ZERO G" struck out for FREE FALL.
- Fixed from its lists: the needle settling low in the pause (read as the answer) → it keeps sweeping the range; the
  station read as the Sun → labelled "space station"; the tower's height not carried → "400 km up" card on the top;
  2.5 s dead at 17.5 s → paths start on the cut; arrows unequal in perspective → drawn in screen space, equal; a white
  flash at 35.5 s (three causes found in turn: a 1,100 km marker sprite near the camera, the orbit ring tube drawn
  while the camera sat on it, and the pull-back's camera anchored on its moving aim, which dragged it inside the
  Earth) → marker sized by distance, ring only from 16,000 km, camera anchored on the station; a stray rectangle at
  25.5 s (the lap tube's first segment, too thick near) → width scales with the view; the dial see-through → opaque;
  ~90 % hidden by the needle → boxed under it; astronaut's head in the caption band → framed lower.
- Not changed: earlier cannon arcs stay as 40 % ghosts (they show the farther landings); "ZERO G" strike on red is busy.
- Render probe: station and globe shots ~1.5-2 s a frame at CONC 3 (6-frame ranges, setup included): PROBE=skip.

## Outstanding corrections
- none yet

## Lessons for the skills
- (to fill)
