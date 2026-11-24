# Timeline as data

`scripts/timeline.py` renders an edit described in `film/timeline.json` with FFmpeg: integer
frames, tracks of clips, keyframed gain/opacity/position/scale, fades and crossfades, captions
through `make_captions.py`, text through `text_overlay.py`, music ducked under the voice, and
the mix mastered to -14 LUFS / -1.5 dBTP measured on the encoded MP4. The schema follows
Montage's `timeline.json`, adapted to this skill's rules.

```bash
python3 SKILL_DIR/scripts/timeline.py validate film/timeline.json
python3 SKILL_DIR/scripts/timeline.py describe film/timeline.json      # tracks and clips in frames and seconds
python3 SKILL_DIR/scripts/timeline.py still    film/timeline.json 0 45 312   # PNGs in ../stills/
python3 SKILL_DIR/scripts/timeline.py render   film/timeline.json --dry-run  # commands + filtergraph, runs nothing
python3 SKILL_DIR/scripts/timeline.py render   film/timeline.json            # ../renders/<name>.mp4
python3 SKILL_DIR/scripts/test_timeline.py      # synthetic media, measured checks (~20 s)
```

`render` prints a JSON report: frames written, size, loudness and true peak of the MP4, each
mastering attempt, and `ok`. It exits 1 when the frame count or the loudness targets are missed.

## When to use it

It is optional. Use it when the edit is cuts, overlays, captions and a music bed, and it will
be revised: a revision then changes one number in a file that `describe` can print, instead of a
hand-edited filtergraph. The validator catches the mistakes hand-written filter files hide: a clip
running past the source or the timeline, a scale of 2 meaning 2%, overlapping clips, a typo in a
key.

Write an ad-hoc filter file ([technical.md](technical.md#cut-and-render)) instead when the edit
needs what this does not support (list below): speed changes, `perspective` camera moves,
`borrow_camera.py` paths, keyed effects, split edits with different picture and audio joins.
Such shots can still enter a timeline as rendered clips: render the move to a `.mov`, then place
it. Resolve is not available here. This is not a Resolve project, so say there is no editable
project, as the profile asks.

Animated films are animated-video's (Remotion, `beats.json`). Do not use this there.

## Schema

All times are integer frames at the timeline's fps. Paths are relative to the folder holding
`timeline.json` (the film folder), not to where you run the command.

```jsonc
{
  "version": 1,
  "fps": 30,                       // or {"num": 30000, "den": 1001}
  "width": 1080, "height": 1920,   // even
  "duration": 900,                 // frames
  "acts": [{"id": "hook", "from": 0, "to": 90}],     // optional labels; describe prints them
  "tracks": [
    {"id": "camera", "role": "picture", "clips": [
      {"id": "take3", "at": 0, "length": 140, "in": 2895,
       "media": {"file": "../refs/IMG_0412.mov"}, "dialogue": true, "fit": "cover"}
    ]},
    {"id": "hook-text", "role": "picture", "clips": [
      {"id": "hook-line", "at": 0, "length": 90,
       "media": {"text": "ME AT *3 AM*", "args": ["--style", "highlight", "--y", "0.22"]}}
    ]},
    {"id": "music", "role": "music", "clips": [
      {"id": "bed", "at": 0, "length": 900, "media": {"file": "../sound/floating-cities.mp3"},
       "gain": -4, "fadeIn": 45, "fadeOut": 75}
    ]},
    {"id": "subs", "role": "captions", "clips": [
      {"id": "subs-1", "at": 0, "length": 900, "media": {"words": "../vo/IMG_0412.json"},
       "follows": "camera", "captions": {"fix": {"Alexx": "Alex"}}}
    ]}
  ],
  "mix": {"loudness": -14, "truePeak": -1.5, "duck": {"mode": "sidechain"}}
}
```

| Field | Unit | Meaning |
| --- | --- | --- |
| `at`, `length` | frames | Where the clip sits on the timeline and how long. `at + length <= duration`. |
| `in` | frames | Source in-point: source seconds × timeline fps (frame 2895 at 30 fps = 96.5 s), whatever the source's own fps. |
| `fadeIn`, `fadeOut` | frames | Picture: alpha fade (from/to whatever is below; black on the bottom track). Sound: linear fade. |
| `gain` | dB | Sound level. Keyframes allowed. |
| `opacity` | percent | 0–100. |
| `scale` | percent | Of the fitted size: 100 = `fit` result. `2` is a dot and is rejected. |
| `position` | `[x, y]` px | Clip centre on the canvas. Default the canvas centre. |
| `fit` | | `contain` (default), `cover` (fill, crop the overflow) or `none` (native pixels). |
| `sound` | bool | A picture clip's own audio plays (default off). |
| `dialogue` | bool | This audio is speech: it keys the duck and can be captioned. Voice clips are dialogue by default. |
| `effects` | | `[{"ffmpeg": "eq=saturation=1.1"}]`: a raw filter chain on the clip's picture (picture tracks) or its sound (sound tracks), applied before scale/fades. |

Keyframes: `[{"frame": 0, "value": 100}, {"frame": 45, "value": 112}]`, frames counted from the
clip's start, linear between keyframes, held before the first and after the last. A static
number (or `[x, y]`) is one value for the whole clip.

Roles: `picture` (video or image; later picture tracks draw on top, and within a track a later
clip draws over an earlier one), `voice`, `music`, `effects` (sound only), `captions`. Ids share
one namespace across acts, tracks and clips.

Crossfades: two neighbouring clips on one track that overlap crossfade over the overlap. The later
clip fades in over the earlier one (a dissolve) and their sounds fade out and in. The overlap must
be shorter than both clips. Three clips may not overlap at once. A dip to black is `fadeOut` on
the outgoing clip and `fadeIn` on the next one on the bottom track, with a gap or not.

Audio edges without a fade get the 5 ms in / 8 ms out micro-fades from technical.md.

### Captions

Two forms, both burned with libass (`subtitles`):

- `media: {words: "words.json"}` with `follows: "<track id>"`: the followed track's speech clips
  (every voice clip, or a picture track's `dialogue` clips) become `make_captions.py`'s cutlist
  (`src_start = in/fps`, `src_end = (in+length)/fps`, `out_start = at/fps`). Its chunking,
  clamping and overlap report apply unchanged. Render stops on "FIX BEFORE BURNING". `captions`
  passes its `fix`, `drop_word_before`, `capitalize_first` and `style` (`play_res`, `margin_v`…).
  The words file holds that source's timestamps, so the followed clips must share one source file.
  When the edit cuts between sources, put each source's speech on its own voice track and give
  each a caption clip on its own captions track.
- `media: {file: "captions.ass"}`: an ASS you made, shifted by `at` and clipped to the clip's span.

Caption events are clamped to the caption clip's span. Everything in technical.md's
[Captions](technical.md#captions) still applies: review clamped and lowercased words, measure
the safe area, and after a speed change supply output-time words.

### Text

`media: {text, args}` runs `text_overlay.py OUT.png TEXT ARGS…` and places the 1080x1920 PNG
like an image (`fit: contain` maps it to the canvas). On Linux pass `"--font", "/path"` because the
default Avenir is macOS-only. Validation says so, and `--index 0` is added for a single-face font.

### Mix

- Buses: dialogue (voice and dialogue clips), music, the rest. Summed with `amix normalize=0`.
- `duck.mode: "sidechain"` (default): `sidechaincompress` on the music keyed by the dialogue bus,
  with studio-sound's settings (`threshold 0.06, ratio 3, attack 60, release 700`, all overridable).
  The key is the pre-master dialogue level, so the dip depends on the voice gain you set. Measured
  on the test: a -18 dBFS tone dipped 1.8 dB, the same with `gain: 10` dipped 8.3 dB. Give the voice
  its forward gain (+10 to +14 dB, studio-sound) on the clips, then measure the music gap from
  stems as studio-sound asks.
- `duck.mode: "keyframes"`: a deterministic volume dip of `reduceDb` (default 10) over each
  dialogue clip, ramping `fadeSeconds` (default 0.3) before and after; clips closer than two
  ramps merge. It follows clips, not words, so pauses inside a clip stay ducked. Measured: asked
  12 dB, got 11.8.
- Master: the float mix is measured, raised by linear gain to `loudness` (a sample-peak
  `alimiter` with `level=0:latency=1` is added only when the gain would push the peak past the
  ceiling), encoded to AAC 192k, and the MP4 re-measured. Gain and ceiling are corrected until the
  MP4 reads within 0.5 LU of the target and at or under `truePeak` (5 tries). `"loudness": null`
  skips mastering for a draft.

## Traps

- Scale is percent of the fitted size. `1` or `2` draws a dot (rejected under 5).
- Paths resolve from the film folder. `../refs/x.mov` from `projects/<slug>/film/`.
- `in` is in timeline frames, not source frames: a 60 fps source in a 30 fps timeline at 10 s is
  `in: 300`.
- Keyframe frames count from the clip's start, not the timeline.
- Keyframed scale is evaluated per frame and rounds to whole pixels, so slow push-ins on footage
  jitter, the same as `zoompan`. Render a smooth move with the `perspective` recipe and place the
  result. Keyframed opacity uses `geq` (slow on 1080x1920; fine for short overlays).
- FFmpeg filters after a per-frame `scale` keep the first frame's size (`colorchannelmixer`,
  `geq`): the builder scales last. Keep `effects` free of size-changing filters on keyframed clips.
- A track that alternates two cameras cannot carry one words file; see Captions.
- `follows` captions span whole clips: a clip that runs past the last spoken word is fine, but
  ASR errors are not repaired here.
- Sidechain ducking depends on the voice's pre-master level (see Mix).

## Not supported (write a filter file or extend the script)

Speed changes and retiming; split edits (picture and sound joins at different frames; put the
sound on a separate voice track instead, which does work); `perspective`/handheld camera moves;
wipes and other `xfade` transitions (dissolve and fade only); rotation, crop and colour as fields
(use `effects`); eased keyframes (linear only); per-track gain or mute; panning; partial renders by
frame range; SRT/VTT export; Montage's `grade` and effect presets; a Resolve project.
Unknown keys are errors, so a Montage-only field fails loudly rather than being ignored.

## Checks that still apply

`render` checks frame count, size and loudness on the MP4. The editorial and technical checks in
SKILL.md are still yours: stills at cue frames (`still`), joins, eyeline, a QA transcript of the
final mix, and saying what was measured versus listened to.
