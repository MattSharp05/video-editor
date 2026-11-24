# Montage vs our skills: map, proposals, non-adoptions (2026-11-24)

Sources. Montage: its SKILL.md, nine guides and ten tool descriptions (read this session). `describe {help:"blender"}`
returned session_starting twice, so the `montage.scene` reference was NOT read. Ours: read in full: animated-video
SKILL.md, references/review.md, remotion-pipeline.md, handoffs.md, three.md, sourcing.md, styles/realistic-3d,
video-edit SKILL.md, references/technical.md, publish.md, real-sfx references/studio-sound.md and the head of its
SKILL.md, asset-library SKILL.md, video-script SKILL.md, profiles/animated-video.md and video-edit.md, render.sh,
board.py. Skimmed only: reflect, avatar-cutins, remaining style packs and kit READMEs, real-sfx body. [V] = verified in a file, [I] = inferred.

## 1. Map

| Montage | Ours | Status |
|---|---|---|
| Storyboard cards (text, seconds, still, status, linked shot), approved in studio before build | Key-frame board `board.py` (stills + line); concept approval in SKILL.md step 1/4; profile "show a key-frame board" [V] | Covered as an image; no editable card data, no per-card status |
| Stills after every edit + `findings` (page errors, failed loads, warnings with file/line) | `snap.sh` contact sheets, "stills before renders" (first/middle/last frame per beat) [V] | Covered for picture; no automatic findings list (console errors don't reach the CLI, per pipeline gotchas) |
| Numbered, permanent cuts; unchanged film returns cached cut | "Commit each version in the project's git repo" [V]; renders git-ignored | Partial: no cut numbering/registry, no input-hash cache |
| Partial re-render (element re-renders only when its folder changes) | Partial re-render + splicing by frame range (review.md, handoffs.md) [V] | Covered, manual; ours is finer (frame ranges) |
| Marks on frames (click/box/clip), batched Send, per-note answers in next cut | Brief.md "every outstanding correction until verified in an export" [V]; user timestamps mapped back (video-edit) [V] | Gap: no visual pointer, no note IDs, no per-note answer record |
| timeline.json as data (tracks, clips, keyframes, effects, grade, mix) | Remotion code + `beats.json` timing spine; FFmpeg cutlists/filter files in video-edit [V] | Different model; ours is code |
| Voice chain / music EQ dip / panning with measured numbers (mix guide) | studio-sound.md mix (static gain, duck `sidechaincompress` settings, music 10–12 dB under, -14 LUFS / -1.5 dBTP on the MP4); technical.md "process a voice as little as it needs" [V] | Covered with a deliberately lighter voice treatment; no noisy-recording chain, no music presence dip |
| Captions timed from words file, style options, SRT/VTT at delivery | `chunk()` hand-written sense units checked against words.json; captions.tsx; make_captions.py (ASS); "caption data plus an SRT" in video-edit [V] | Covered for burned-in; no SRT/VTT from animated-video [V: no mention found] |
| Delivery pack: presets youtube/vertical/square/x/linkedin/review, SRT+VTT, cover, manifest, loudness check vs approval | `render.sh` (-14 LUFS, limiter, 6 Mbit/s cap, fails >50 MB) [V]; platform facts for Reels; "frame 0 is the cover" [V]; publish.md checklist [V] | Partial: one Reel target; no multi-preset pack, cover file, sidecar captions or manifest |
| Credit record per sound (source, licence, credit line) | asset-library ingest with source/creator/licence [V]; `library/sfx/CREDITS.md`; sourcing.md "Record it" [V]; rights rules in CLAUDE.md [V] | Covered, stronger (versions, uses per cut) |
| recover guide: error codes, timeouts, traps | Gotchas sections (orphaned chrome, zsh splitting, exit 137, webpack race) [V]; asset-library "error + hint" JSON [V] | Covered as prose; no single page indexed by symptom |
| "Tested recipe + Traps + Checked against version" format | Our pages carry measured numbers and failure stories inline (e.g. "Moon tides 01 skipped this and shipped 14 slide-like seconds") [V] | Partial: no runnable starter recipes per film shape; no tool-version stamp |
| Blender: scene.py by script, factory reset each run, montage.scene helpers, presets layout/fast/draft/cycles/final, describe objects in/partly/out of frame, Python errors with file/line | realistic-3d: Blender route table, headless commands, EXR/PNG transform rules, subframe re-render, "block motion in an animatic first" [V]; profile "Blender is a tool for its strengths" [V] | Gap in tooling: no template, no preview presets, no in-frame report |
| Sound library find (CC0/CC BY) / generate / transcribe | real-sfx libraries + palette ranking by Matthew's picks [V]; ai-voiceover (free Qwen3-TTS) [V]; transcribe.py / align.py [V] | Covered, ours stronger on taste |
| Intent line per action shown to the person | none | Gap (only matters for a UI) |
| "Never grade your own cut" | Fresh independent judges, mute test, unsupervised by default (profile 2026-11-16) [V] | Ours deliberately differs |

## 2. Proposals, ranked by value

1. **Blender path for animated-video (template + presets + in-frame report).** L.
   - Add `templates/blender-shot/`: `scene.py` that builds the whole scene from a factory-reset file
     (`blender -b --factory-startup -P scene.py -- --preset P --frames A,B`), reads `beats.json`/cue JSON for timing,
     seeds everything, writes a PNG sequence at film fps/size; a `props.py` helpers module (material, camera, look_at,
     light rigs) in the spirit of `montage.scene`.
   - Presets as one flag: `layout` (Workbench, framing), `fast` (EEVEE 480 px), `draft` (EEVEE half size), `cycles`
     (GPU Cycles, low samples), `final` (script settings). Montage: "layout (Workbench, for framing, not materials),
     fast (EEVEE, 480 px wide), draft (the default: EEVEE at half size)".
   - `describe.py`: JSON of camera and each object in / partly in / out of frame, materials, animated, plus
     warnings; optional region query. Montage's describe names "each object in, partly in or out of frame". This is the
     biggest win for an agent that only sees stills; it is the Blender analogue of our `frame.mjs`.
   - Python errors returned with file/line and the Blender API change hint: wrap the run, parse the traceback.
   - New page `references/blender.md` (route rules move from realistic-3d; keep its colour-transform and subframe
     sections, which Montage's guide lacks), a row in SKILL.md "Read before each step" (4–5, "Blender shot").
   - Each Blender shot in its own folder; cache key = hash of that folder. Montage trap: "an edit to the type alone
     rendered the shot again for 44 s ... Keep each entry in its own folder."
   - Runs on Matthew's Mac through Remote Control; frames come back for Remotion compositing. Cost/risk: untested
     file transfer between Mac and cloud; Blender 4.x API drift; realistic-3d's warning that offline renders push films
     toward static plates still applies. Verify with one product shot and measured s/frame.

2. **Review loop with note IDs and per-note answers.** M.
   - `brief.md` corrections get IDs (`n1`, `n2`…) with version, frame/time and region; each new version's change
     summary answers every open ID with "answered: <what changed>" or "not changed: <why>". Montage: cut
     `answers: ["b1", {id: "m1", reply: "Logo smaller"}]`, verdict `answered | not_changed`.
   - Cut registry: `renders/cuts.json` (git-tracked list even though MP4s are ignored): cut number, git commit,
     input hash, length, checks run, notes answered. Montage: "one whole render of one snapshot, numbered and kept forever".
   - Visual marks (click/box on a frame) belong in the Broadcast page being scoped in the other session; this file
     format is what that page would write. Files: video-edit SKILL.md (Recover the active brief), animated-video
     SKILL.md step 6, CLAUDE.md Projects section. Risk: low; adds bookkeeping.

3. **Delivery pack script.** M.
   - `deliver.sh` (or extend `render.sh`): from one master, write presets (reels 9:16 ≤50 MB, square, 16:9/youtube
     when the film has a landscape cut), `captions.srt` + `.vtt` from the caption data, `cover.png` (frame 0 or chosen
     frame, final quality), `manifest.json` (cut number, commit, durations, loudness/true peak measured on each MP4,
     sizes, credits). Montage finish: "packs the master, each preset, SRT and VTT captions, a cover and a manifest",
     loudness checked "against the timeline's own mix.loudness". Ours already measures on the MP4 (better than on
     WAV); keep -1.5 dBTP. Feeds Broadcast's posting step directly. Risk: square/landscape need recomposition, not a
     crop; only emit presets the film was laid out for.

4. **Automatic findings on every still batch.** S–M.
   - `snap.sh` collects page errors, failed network/asset loads and console warnings (Remotion `--log=verbose` or a
     Playwright hook) into `findings.json` and fails loudly. Montage: "still ... `findings` lists page errors, failed
     loads"; "Fix each fail finding, even when ok is true". Our gotcha says console output may not reach the CLI, so
     today a missing texture shows only as an absent object. Add a check that every file the film loads is inside the
     project (Montage refuses remote fonts/CDNs: "font_not_in_tree"). Risk: noise from benign warnings; whitelist.

5. **Recover page indexed by symptom.** S.
   - `animated-video/references/recover.md`: symptom → cause → fix table pulled from existing gotchas (exit 137,
     orphaned chrome, webpack race, empty first frame, zsh loop renders nothing, late texture, off-by-one `-ss`), plus
     time estimates ("time a 30-frame test" already in three.md). Montage recover: "Estimate before calling it stuck."
     Link from SKILL.md "Fixes" row. No new rules, just a route to existing ones (CLAUDE.md: fix the route).

6. **Starter recipes with Traps and a version stamp.** S–M.
   - `templates/recipes/` with three runnable shapes we make most: Trip app reel (iPhone part + captions + beats),
     narrated 3D explainer (terrain/look pass), talking-head with captions (video-edit). Each: steps, a working
     minimal project, "Traps" (measured), "Checked against Remotion x.y / Node z". Montage: "Three tested starting
     points ... Checked against Montage 0.4.1-cloud-a". Risk: recipes rot; stamp + one CI-free smoke command each.

7. **Mix additions with measured numbers.** S.
   - Add to studio-sound.md, as options not defaults: a noisy-recording pre-chain (60 Hz dehum, denoise) and a music
     presence dip (≈-4 dB at 3 kHz, Q 0.7) under voice, measured on our stems before adoption. Montage mix: "Music
     under voice ... b4_freq 3000, b4_gain -4 ... -3.8 dB at 3 kHz". Keep our light voice rule: Montage's full voice
     chain (expander, de-esser, +3 dB at 3.5 kHz, 3:1 compressor, limiter at -6) conflicts with Matthew's measured
     complaint that a busy limiter flattened his voice (pipeline.md: "2.6 LU against 4.5 raw"). Risk: none if opt-in.

8. **Storyboard as data.** S.
   - `board.py` reads `board.json` (cards: id, text, seconds, still, status planned/rendering/done, shot) and writes the
     image; card IDs referenced in notes. Montage board: "cards in order, each what happens or is said, seconds, a
     still, a status and the shot that realizes it". Gives Broadcast a board to show/edit. Approval stays as today.

9. **Input-hash render cache.** S.
   - `render.sh` hashes src + public + words/beats + props; same hash → reuse the last MP4 and say so. Montage: "An
     unchanged film ... gets its cut back at once, reused: true". technical.md already states the rule ("A cache is
     valid when its source identity, timing and layout inputs are unchanged"); this makes it mechanical. Risk: missed
     inputs (env, fonts in node_modules) → stale reuse; include lockfile hash.

10. **Timeline-as-data for video-edit only.** M, optional.
    - A `timeline.json` schema (tracks, clips at/in/length in frames, gain/opacity/scale keyframes, fades, effects)
      that the FFmpeg builder renders, replacing ad-hoc filter files. Montage timeline: "integer frames at its fps".
      Matches video-edit's "edit in integer frames and round only at conversions". Do not apply to animated-video.

## Where ours is already better (keep)

- Picture judgement: mute test, fresh independent judges, motion_check, temporal checks (flicker, determinism),
  fact-check. Montage only says "Never grade your own cut"; Matthew chose unsupervised review by judges (profile 2026-11-16).
- Sound taste: Sound Picker palette and ranking by Matthew's picks; Montage picks library sounds "by title and length".
- Voice: minimal processing, measured LRA preservation; Montage's default chain compresses.
- Loudness measured on the delivered AAC MP4 (true peak rises after AAC); Montage's guide doesn't mention it.
- Partial re-render by frame range and splicing; Montage re-renders whole elements.
- Provenance: asset-library versions and per-cut uses; sourcing.md licence tiers.
- Blender colour handoff (PNG vs EXR, one transform) and subframe re-timing in realistic-3d.
- Timing spine `beats.json` driving picture, captions and sound together; Montage captions follow words but effects
  are placed by frame.

## 3. Not to adopt

- **Moving production onto Montage hosting** (files on Montage, not in git): breaks "commit the film source" (CLAUDE.md)
  and the asset library; credits per render. Use Montage for occasional review or GPU Blender only if wanted.
- **HyperFrames/GSAP pages instead of Remotion**: no gain over our kit; would fork every part and template.
- **Montage's default voice chain** (above): contradicts measured feedback.
- **Agents never judge their own cuts**: replaced in our studio by fresh judges because Matthew wants it unsupervised.
- **Montage-generated music/voice** (`sound make`): not in the plan; ours are free (Qwen3-TTS) and taste-picked.
- **Captions on a bottom box by default** (Montage style default anchor bottom, background box): our Reels rule puts
  them at the top safe area with no box (pipeline.md Captions).
- **"Intent" line per action**: only useful inside a UI; reconsider for the Broadcast page.
