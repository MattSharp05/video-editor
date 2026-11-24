# Recipe: talking head with captions

A vertical camera edit: someone speaks to camera (or over a screen recording), the best takes cut
together, burned captions with a designed hook, a quiet music bed, mastered to -14 LUFS on the MP4.
Skill: **video-edit**, which owns this timeline even when it holds animated inserts (those come
from animated-video as shot briefs). Pages: video-edit SKILL.md, the
[talking-head pack](../../../video-edit/styles/talking-head/README.md),
[technical](../../../video-edit/references/technical.md),
[timeline](../../../video-edit/references/timeline.md),
[studio sound](../../../real-sfx/references/studio-sound.md).

**Pick it when** the footage is a person speaking. No talking-head project has been finished in
this repo yet, so its traps come from video-edit's measured notes (cited by section) and from a
smoke run on Matthew's own Trip take (`projects/trip-social-01/vo/take1.m4a`, real speech and word
timings under a test-pattern picture).

## Steps

1. **Set up.** `python3 SKILL_DIR/scripts/preflight.py --project PROJECT`; read
   `~/.video-edit/profile.md` and open with the defaults applied (FFmpeg render, no Resolve project).
2. **Probe** every camera file for rotation, HDR and channels; prove framing and colour on a short
   sample before long encodes (technical: Probe, Source color).
3. **Transcribe once** and cache the words (`transcribe.py` on Apple silicon; on Linux
   `uvx whisper-ctranslate2 … --word_timestamps True`). Keep the raw transcript beside corrections.
4. **Choose takes** by story order and fluency; start on the first intended word, eyes on the lens.
   `restart_scan.py AUDIO CUTLIST.json` before the first render (Apple silicon; elsewhere check
   joins with overlapping windows by hand).
5. **Build the edit as data**: `film/timeline.json` with the camera clips (`dialogue: true`,
   `sound: true`, `gain` +10 to +14 dB), a music clip, and a captions clip that `follows` the camera
   track; `timeline.py validate`, `describe`, `still` at each join and cue, then `render`
   ([timeline](../../../video-edit/references/timeline.md)). For what it doesn't support (speed
   changes, `perspective` moves, split edits) write a filter file
   ([cut and render](../../../video-edit/references/technical.md#cut-and-render)).
6. **Captions.** The hook is its own composition (`text_overlay.py --style highlight`, the user's
   exact words). Body captions come from `make_captions.py` through the timeline: set
   `style.margin_v` clear of the bottom 420 px Reels UI, review every clamped or lowercased word,
   and rewrite chunks that split a sense unit.
7. **Voice**: high-pass, one gain per take, a linear master; no compressor unless the raw needs it.
   Noisy room or hum: the opt-in [pre-chain](../../../real-sfx/references/studio-sound.md#optional-noisy-recording-pre-chain)
   only when measured. Music 10–12 dB under the voice, measured from stems.
8. **Verify the export**: decode, duration, loudness and true peak on the MP4, the voice's LRA
   against the raw takes, eyeline strips at each on-camera shot, a fresh QA transcript of the final
   mix checked at every join. Say what was measured and what was listened to.
9. **Deliver**: `cuts.py add`, then
   `python3 …/animated-video/templates/remotion-film/deliver.py renders/<name>.mp4 --ass captions.ass`
   (the same `make_captions.py` output, for SRT/VTT); fix every `problems` entry.

## Traps

- **A quiet, peaky take can't reach -14 LUFS linearly** (smoke; technical: Voice, loudness and
  mixing). Matthew's take, cut: -30.7 LUFS, true peak -10.2 dBTP, LRA 2.3. `loudnorm` with
  `linear=true` silently switched to dynamic mode: -16.0 LUFS, LRA 1.4, and `deliver.py` failed it
  on loudness and true peak (-1.38 dBTP). `timeline.py`'s master (linear gain plus a sample-peak
  limiter, re-measured on the MP4) reached -14.1 LUFS at -1.7 dBTP with the voice's LRA still 2.3.
  A compressor before it gave LRA 1.1: don't.
- **`-/filter_complex` needs FFmpeg 7** (smoke): FFmpeg 6.1 here said
  `Unrecognized option '/filter_complex'`. On 6.x write `-filter_complex_script filters.txt`.
- **`make_captions.py`'s default `margin_v` 350 sits inside the bottom ~420 px the Reels UI covers**
  (smoke; technical: "its sample margins are not a safe area"). The smoke uses 520.
- **Auto-chunks split sense units** (smoke): "trip and on / the trip you'll / open none of".
  Rewrite those lines before burning.
- **ASR stretches words over pauses** (smoke: "and" held 0.78 s across a breath; "saved" 20 ms).
  A caption that hangs or flashes has a bad word timing under it.
- **Whole-clip ASR merges a false start with its restart**, and long ASR drops repeated words at
  joins (video-edit SKILL.md, Cut the speech). A clean transcript of a take proves nothing.
- **`alimiter` delays its output by 5 ms and auto-levels** unless `level=0:latency=1`; `-ac 1`
  downmix adds ~3 dB and summing 6 dB (technical, measured).
- **`sidechaincompress` stops when the key ends**, dropping the bed's tail and its fade: pad the
  voice key with `apad` and trim (technical: Extending a short music recording).
- **A hand-built filter render failed `deliver.py`'s audio/picture length check** (smoke: the
  cut re-encoded with burned subtitles and a loudnorm pass, 9.90 s); the `timeline.py` render of
  the same two clips (9.80 s, frame count checked) passed. Run `deliver.py` on whatever you built.

## Smoke

A 9.8 s two-clip edit of Matthew's take under a test pattern, with a music bed and burned
captions, through `timeline.py`, then the delivery pack. Pass a music file as `$M` (the default is
a git-ignored sample; any MP3 works).

```bash
R=$(git rev-parse --show-toplevel); VE=$R/.claude/skills/video-edit/scripts; D=$(mktemp -d)/th
M=${M:-$R/projects/code-history-01/music/samples/km-half-mystery.mp3}
mkdir -p $D/film && cd $D
python3 $VE/test_make_captions.py && python3 $VE/test_timeline.py | tail -1
ffmpeg -v error -y -f lavfi -i "testsrc2=s=1080x1920:r=30:d=38.5" -i $R/projects/trip-social-01/vo/take1.m4a -map 0:v -map 1:a -c:v libx264 -crf 23 -preset veryfast -c:a aac -shortest cam.mp4
cp "$M" bed.mp3
python3 -c "
import json; W=json.load(open('$R/projects/trip-social-01/vo/take1.words.json'))
json.dump({'segments':[{'words':[{'word':w['w'],'start':w['s'],'end':w['e']} for w in W]}]}, open('audio.json','w'))
json.dump({'segments':[{'src_start':2.9,'src_end':8.1,'out_start':0.0},{'src_start':12.5,'src_end':17.1,'out_start':5.2}],'capitalize_first':True,'style':{'margin_v':520}}, open('cutlist.json','w'))"
cat > film/timeline.json <<'EOF'
{
  "version": 1, "fps": 30, "width": 1080, "height": 1920, "duration": 294,
  "tracks": [
    {"id": "camera", "role": "picture", "clips": [
      {"id": "s1", "at": 0, "length": 156, "in": 87, "media": {"file": "../cam.mp4"}, "sound": true, "dialogue": true, "gain": 12, "fit": "cover"},
      {"id": "s2", "at": 156, "length": 138, "in": 375, "media": {"file": "../cam.mp4"}, "sound": true, "dialogue": true, "gain": 12, "fit": "cover"}
    ]},
    {"id": "music", "role": "music", "clips": [
      {"id": "bed", "at": 0, "length": 294, "media": {"file": "../bed.mp3"}, "gain": -6, "fadeIn": 45, "fadeOut": 60}
    ]},
    {"id": "subs", "role": "captions", "clips": [
      {"id": "subs-1", "at": 0, "length": 294, "media": {"words": "../audio.json"}, "follows": "camera",
       "captions": {"capitalize_first": true, "style": {"margin_v": 520}}}
    ]}
  ],
  "mix": {"loudness": -14, "truePeak": -1.5, "duck": {"mode": "sidechain"}}
}
EOF
python3 $VE/timeline.py validate film/timeline.json && python3 $VE/timeline.py describe film/timeline.json
python3 $VE/timeline.py still film/timeline.json 30 200 --out-dir stills
python3 $VE/timeline.py render film/timeline.json --out th.mp4 | grep -E '"ok"|loudness|truePeak' | tail -3
python3 $VE/make_captions.py audio.json cutlist.json captions.ass
ffmpeg -hide_banner -nostats -i th.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I|LRA|Peak):'
python3 $R/.claude/skills/animated-video/templates/remotion-film/deliver.py th.mp4 --project $D --cut 1 --ass captions.ass
echo "$D"
```

Pass: both self-tests pass, `render` prints `"ok": true`, captions read in the two stills, and
`deliver.py` prints "all checks passed".

## Checked against

2026-11-24, cloud container: FFmpeg 6.1.1 (Ubuntu 6.1.1-3ubuntu5, libass `subtitles` present),
Python 3.13.18, Node 22.23.5 (not used here). Ran: the block above, verbatim, 28 s in all (both
self-tests passed; `render` ok in 2 mastering tries, -14.15 LUFS, -1.61 dBTP; mix LRA 1.7 with the
bed filling the pauses, voice alone 2.3 as raw; captions visible at `margin_v` 520 in both stills;
`deliver.py` all checks passed); `preflight.py` (ffmpeg, ffprobe, python, transcription ok; Resolve absent);
`restart_scan.py --self-test` ok (the scan itself needs Apple silicon); the loudnorm, limiter and
compressor comparisons in Traps. Not run: transcription (the take's cached words were used),
Resolve, `text_overlay.py` hook, a real camera file (rotation, HDR, eyeline).
