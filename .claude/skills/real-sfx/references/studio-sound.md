# Studio sound: picks, palette, events, mix

How this studio (video-editor) chooses, places and mixes sound for every film. Claude can't hear:
**the user's ear picks, Claude places.** The user's standing defaults are in
`~/.video-edit/profile.md` (Sound); evidence in `lab/PRINCIPLES.md` (8, 9), `lab/TASTE.md` and
`lab/sound-picker/`.

## 1. A Sound Picker round (when the palette lacks a category, or the user asks)

The lab's picker is the template: `lab/sound-picker/build.py` + `picker.html`.
1. One row per recurring moment (tap, select/found, appear, land, lift, confirm, notify, toggle,
   typing, error, swipe, send, small move, camera move, background bed, music), each with the
   moment it is for in one line.
2. Four options per row, **softest first by measurement** (brightness / 1000 + 3 × ring), from
   CC0 sources only (uisfx packs, `library/sfx/`; music with its licence shown).
3. Level-match so options compare by character, not loudness: effects peak-normalised to -6 dBFS,
   beds 10 s at -26 LUFS, music 22 s from 20 s in at -18 LUFS.
4. Show each option's measured words (dark / warm / bright, dry / rings, soft / crisp attack).
   Offer "silence" and "none fits" per row, and a note field. Picks save to the page's database
   (`picks/<category>`).
5. Pull the picks (`ArtifactData` list → a folder of JSON), then
   `python3 scripts/palette.py build PICKS_DIR`. Copy the user's notes verbatim into `lab/TASTE.md`.

## 2. The palette (`scripts/palette.py`, data in `lab/sound-picker/sound-palette.json`)

Three layers, used in this order:
- **References:** category → the file picked. A reference, not a sound to reuse ("not the same
  sounds each video, but this sort of vibe"): each film picks fresh sounds closest to it; the
  reference itself is the fallback when nothing new is close.
- **Profile:** the measured character of all picks (median ~680 Hz brightness, ring ~0.10 s,
  attack ~44 ms, length ~0.16 s: dark-warm, dry, short). Rank new candidates:
  `python3 scripts/palette.py rank CATEGORY FILE...` (distance to 0.7 × the category's reference +
  0.3 × the profile; passed-over files pushed down, never banned).
- **Silent / unfilled:** categories the user wants silent (swipe), or where nothing fit yet (send,
  camera move): leave those moments quiet until a new round fills them.
- `palette.py taste` prints `taste.py love` lines for picks that sit in the library index so the
  auto-pick ranks them first; uisfx picks are not in the index, so place them by path.

## 3. Events from the same beats as the picture

- Times come from the film's own numbers: `beats.json` (animated-video's timing spine) or an
  exported event list, never read off the picture. One-shot films have no cuts: ignore cut-sync
  warnings.
- Write a small events script per film: `(beat + offset, kind, gain, note)` rows, one sound per
  state of the visual language, mapped to files through the palette
  (`projects/trip-social-01/film-v2/sound/events.py` writes real-sfx's cue sheet with explicit
  files; `projects/grand-canyon-01/film/sound/mix.py` mixes directly with FFmpeg).
- Repeats of one kind rise in pitch item by item (found 1, 2, 3) or vary the file.
- Restraint: every sound has a visible cause; about 7 weighted events per 10 s in an app reel,
  2.7 per 10 s under a voice-led explainer (Grand Canyon 01: 21 cues in 77 s). Print the density.
- Where the library has no real sound (deep rumble, crumble, grit), a filtered noise layer
  (`anoisesrc` + filters) is acceptable in this studio; label it synthesized. Library gaps:
  `library/sfx/CREDITS.md`.

## 4. The mix

- **Voice up front:** a static gain to bring it forward (+10 to +14 dB on the two films), no
  per-line levelling.
- **Music under it:** clearly audible: about 10-12 dB under the voice while it speaks, rising ~6 dB in the pauses,
  with a gentle sidechain duck (`sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700`). Set the music gain
  from measurement, not from a fixed number: tracks differ (Floating Cities' opening is -20.5 LUFS and needed +12 dB).
  Write voice and ducked-music stems and measure the gap (projects/moon-tides-01/film/sound/mix.py `stem` +
  measure.py). Matthew, 2026-11-06: the old setting (-15 dB, ratio 8, "17 dB under") measured 46 dB under speech on
  Moon tides v1 and he heard no music at all. Fade in 1.5 s, out 2.5 s.
- **Effects** around -16 to -30 dB, low-passed (1.5–3 kHz) so they sit soft; keep them off key
  spoken words.
- **Master:** `loudnorm=I=-14:TP=-1.5`. Measure the delivered MP4, not the WAV: AAC raises true
  peaks (Grand Canyon 01's first export read -1.2 dBTP; remastered lower, it read -1.8).
- Mux the mix onto the silent picture with `-c:v copy`.
- Say what was measured and list the moments the user should listen to.

## Rights

Published films use only CC0 (uisfx, `library/sfx/`), the user's own files, synthesized sound, and
credited CC BY music (Kevin MacLeod tracks: credit line in the post caption). `sfx-01`–`sfx-28` from
video-edit are drafts only.
