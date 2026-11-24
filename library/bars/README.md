# Bar films for the motion check

Quarter-scale (270x480), muted copies of delivered films Matthew accepted as the bar (2026-11-19: "commit low-res
bars to library/bars"). Rendered films are git-ignored, so without these a cloud session has nothing to run
`motion_check.py` against (review.md: required before every full render). About 1 MB each.

| File | Film | Kind |
|---|---|---|
| `s3-taipei-damper_q.mp4` | projects/s3-taipei-damper v2 (36.9 s) | realistic three.js explainer, exterior + cutaway, 4 cuts |
| `s3-jet-engine_q.mp4` | projects/s3-jet-engine v2 (38.7 s) | realistic three.js explainer, cutaway machine + particles, 2 cuts |

Use the film of the same kind as the bar:

    ~/.venv-qw/bin/python .claude/skills/animated-video/templates/remotion-film/motion_check.py \
      film PREVIEW_q.mp4 --bar library/bars/<film>_q.mp4 --strips out/strips   # needs numpy + scipy

Add a bar for each delivered film Matthew accepts:

    ffmpeg -i projects/<slug>/renders/<slug>.mp4 -an -vf scale=270:480 -c:v libx264 -crf 28 -preset slow \
      -pix_fmt yuv420p library/bars/<slug>_q.mp4

Measured once (2026-11-19): jet engine against the Taipei bar flagged seconds 1-2 (the hook's slow push-in).
Turbulence-seat-01 has no bar yet: its models and renders aren't in the repo (rebuild per its models-prep README).
