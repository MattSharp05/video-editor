---
name: avatar-cutins
description: >-
  Add short AI-avatar talking-head cut-ins to an animated video: the animation carries the film and the
  account's avatar appears in 2-5 s bursts (hook, turns, reaction, call to action) over one continuous
  voiceover. Covers the avatar profile (identity card, face pack, voice), marking FACE lines in the script,
  face slots on the beats timeline, a free placeholder draft, quoting and generating the face clips through a
  chosen model (fal, Broadcast proxy, or later direct APIs), checking them, and compositing them in Remotion
  with AI disclosure. Use when a video's account has an avatar profile, or when asked for avatar cut-ins,
  talking-head inserts, a face for an explainer, or to test face models. Not for full-length avatar videos
  or for swapping one performance onto many faces.
---

# Avatar cut-ins

The animation is the film; the avatar is the person who brings it to you. A face opens the video, comes
back at the turns and closes it, about a quarter of the runtime, each burst short enough that the AI face
never has time to drift. The voice runs under everything and is the clock: the animation is built around
face slots fixed before anything is paid for, and one Remotion render composites it all.

`animated-video` still owns the film. This skill adds steps to its pipeline; read
`~/.animated-video/profile.md` first, then the avatar's profile.

## Rules that don't bend
- **Disclose.** Every avatar account carries Instagram's "AI-generated profile" label and an "AI creator" bio
  line; every post sets `is_ai_generated` (Instagram) / `is_aigc` (TikTok) and keeps C2PA metadata. The goal
  is a warm, human-led video, never making viewers believe a real person speaks
  ([disclosure](references/disclosure.md)).
- **The avatar is nobody real**, never claims to be human, and never claims first-hand use of a product
  (it explains, reacts and presents; it doesn't review).
- **Quote before spending.** Show the total for the whole run and wait for the one approval; it covers every
  slot. Never exceed the profile's cost cap. Retries of a confirmed failure are quoted again.
- **Never pay twice.** Every job has an idempotency key saved before submit; a rerun polls submitted jobs
  instead of resubmitting.
- **Placeholder first.** Placement and timing are approved on the free placeholder draft before any paid
  generation.

## Pipeline (inserted into animated-video)

1. **Load the avatar profile** (`avatar.json` + `refs/`, exported from Broadcast's Avatar studio or written by
   hand; schema in [avatar-profile.md](references/avatar-profile.md)). Check the master reference: one clear
   face, eyes to camera, mouth closed, head and shoulders, 9:16 framing, plain or on-brand background. Resolve
   any provider asset IDs fresh at run time; never trust a stored one blindly.
2. **Script with FACE marks.** `video-script` writes each line as FACE or ANIM. FACE lines: the hook (the face
   speaks within 0-3 s), turns in the argument ("here's the catch"), a reaction to the reveal, the call to
   action. Explanations are ANIM: the picture explains. FACE lines under ~12 words; the avatar's speaking
   style from the profile.
3. **Voice.** Generate the whole VO in the profile's voice (Qwen clone: design once, clone every line; see
   `animated-video/references/ai-voiceover.md`), assemble `vo/vo.wav`, words and `beats.json` as usual. The
   face clips are cut from this clean VO stem: never from a mix with music under it (lip-sync models read
   music as speech).
4. **Face slots.** Write `film/face_plan.json` (phrases or times per slot, layout) and run
   `python3 scripts/face_slots.py` from the film folder. It finds each slot on the word timings, adds handles,
   checks the rules below, slices `vo/face/<slot>.wav` and writes `src/face_slots.json`.
   - Each burst 2-5 s on screen (warn > 5, refuse > 7); total 20-30 % of the runtime; first slot starts by 3 s;
     at least ~3 s of animation between slots.
   - J/L cuts: a slot may start after its line begins or end before it does; the voice carries the seam.
   - Handles (default 0.4 s) are generated but not shown, so cuts land on clean frames, and the drift-prone tail
     of a clip is never on screen.
5. **Placeholder draft.** `python3 scripts/gen_face.py run --model placeholder` makes free stand-in clips from
   the master reference (a slow push-in). Render a preview or stills with `AvatarSlot` and get the placement
   approved with the rest of the key-frame board.
6. **Quote, then generate.** `python3 scripts/gen_face.py quote --model <key>` prints seconds and dollars per
   slot and the total, from `face_models.json`. After approval: `gen_face.py run --model <key> --budget <usd>`.
   Offer a pilot (`--only hook`) when the model or avatar is new: a bad shared input then costs one clip.
   Jobs run in parallel with building the animation.
7. **Check every clip** before compositing ([checks](references/face-checks.md)): same person as the master
   reference, mouth in sync with the slice, no teeth/eye/hand artefacts, framing and light as the profile.
   Re-roll a bad clip alone (`--only <slot> --retry`, quoted). Two failures on the same slot: change the line
   or the model, not the seed again.
8. **Composite and render.** `AvatarSlot` (`templates/AvatarSlot.tsx`) places each clip on its frames, muted,
   trimmed by its handles; the master VO plays underneath, so lip-sync matches by construction. Layouts: `full`
   (start here), `pip`, `cutout` (needs a clean plate or matte; test first). Captions, sound events from
   beats.json, stills check and one full render as usual.
9. **Record.** `face/manifest.json` (written by gen_face.py) holds model, seconds, cost, seed and avatar
   version per slot; copy its totals into the video's manifest and `analytics.md`, so Broadcast can show
   performance by face model, face share and avatar version.

## Models and keys
Models live in [face_models.json](scripts/face_models.json): key, provider, endpoint, price per second, limits,
default prompt and status (`ready`, `untested`, `planned`). The avatar profile names its default; a video may
override it. Providers ([face-models.md](references/face-models.md)):
- `placeholder`: free, local FFmpeg; for drafts and tests.
- `fal`: one key for Kling Avatar, OmniHuman and others. Key in `FAL_KEY`, or injected by the cloud
  environment's network secret for `queue.fal.run` (then any dummy value works).
- `broadcast`: Broadcast's generation proxy holds the keys, enforces caps and logs cost; the session sends
  `BROADCAST_URL` + `BROADCAST_TOKEN`. Contract in face-models.md.
Keys never go in the repo, the profile or a prompt.

## What to try (log results in the avatar's notes)
Face share (15/25/35 %), burst length, layout (full vs PiP), and face model are the variables; test them as
A/B Trial Reels and read retention by part in Broadcast.

## Status (2026-11-12)
- **Tested end to end on Grand Canyon 01's real VO and words**, using the `placeholder` model:
  - face_plan → face_slots, with slices and rule checks;
  - gen_face quote and run, an idempotent rerun, and the budget and cap refusals;
  - the manifest;
  - `AvatarSlot` type-checked and rendered on Remotion 4.0.540 (full and pip).
- **Not yet run:** the `fal` and `broadcast` adapters. Run a one-slot pilot to check the first paid model's input
  schema, then set it to `ready`.
