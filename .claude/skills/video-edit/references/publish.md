# Publish or schedule

## Delivery pack

Pack every approved cut with the animated-video template's `deliver.py` (one script for camera edits and animated
films; options and checks in its header and in
[remotion-pipeline: Delivery](../../animated-video/references/remotion-pipeline.md#delivery)):

```bash
python3 ../animated-video/templates/remotion-film/deliver.py renders/master.mp4 \
  --ass captions.ass --cut v3 --project PROJECT_DIR [--normalize] [--cover-frame N] [--declared assets.json]
```

(the path is relative to this skill's folder; from a project use the absolute path.)

- Input: the high-quality master (the CRF 19 render), one per layout actually edited (a 1:1 or 16:9 version is
  re-framed on the content, never a blind crop of the vertical master). `--ass` takes `make_captions.py`'s output,
  already in output time; `--srt` takes a hand-checked SRT. Words in source time are wrong after a cut: don't pass
  `--words` for an edit unless its timings are in output time.
- `--normalize` applies a linear loudness pass plus a lookahead limiter to a master that isn't already at
  -14 LUFS; a mix that is already mastered needs no flag, and the script only measures it.
- Output in `PROJECT/renders/deliver/<cut>/`: `reels.mp4` (under 50 MB) and any other layout's preset,
  `captions.srt` and `.vtt`, `cover.png`, `manifest.json` (git commit, durations, size, loudness and true peak
  measured on each delivered MP4 against -14 LUFS ±1 / -1.5 dBTP, credits from the project's `CREDITS*.md` and the
  asset declaration). It exits 1 and lists `problems` when a check fails: fix those before calling the cut delivered.
- Upload the files from the pack, its cover and its caption file, so what is posted is what was checked.

## Posting

Publish or schedule only when the user requests it.

Use the authorized account and latest approved video. Read the browser's current
upload instructions before opening its file chooser. Verify intended crop, full
length, sound, cover, caption, and destination. For scheduling, verify today's
actual date, timezone, and AM/PM in the UI; never silently substitute another date
or post immediately when scheduling is unavailable.

Submit when authorized, then wait for explicit success. An upload spinner is not
success and is not a reason to submit again. After ambiguous results, inspect the
profile or scheduled queue first. Verify the requested time/caption in the queue
for scheduling, or retrieve the published post link for immediate posting. Leave
the useful result page open. Distinguish scheduled from already published.
