# Motion bar: Grand Canyon 01 (measurements only)

`grand-canyon-01_q.json` is the motion bar for `.claude/skills/animated-video/templates/remotion-film/motion_check.py`:
the per-second readout (separately moving things, change, stillness) of Grand Canyon 01 v1, the film Matthew accepted.
It was measured from a quarter-scale silent render (270×480, **2311 frames, 77.03 s**; 76 one-second rows), made in
`projects/grand-canyon-01/film` with `npx remotion render src/index.ts Film out/bar_q.mp4 --scale=0.25 --muted
--concurrency=2` (about 88 min on a 4-core cloud container, software GL). **No video is stored** (renders stay out of git);
regenerate it with that command if ever needed, then `python3 motion_check.py readout out/bar_q.mp4 > grand-canyon-01_q.json`.
Use: `python3 motion_check.py film PREVIEW.mp4 --bar /home/user/video-editor/lab/motion-bar/grand-canyon-01_q.json`.
Checked on 2026-11-07: Vegas Sphere 01 v1.1 against this JSON and against the mp4 gives identical results (bar movers
median 18, p25 9, ≤2 movers 11%, still 36%, 2 s change 0.36).
