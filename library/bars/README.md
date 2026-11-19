# Bar films for the motion check

Accepted films rendered small, committed so every cloud session can run
`templates/remotion-film/motion_check.py film PREVIEW.mp4 --bar library/bars/<film>_q.mp4`
(`.claude/skills/animated-video/references/review.md#motion`). The checker samples at 108x192, so a quarter-scale
render (270x480) is enough; render the candidate the same way: `--scale=0.25 --props='{"captions":false}' --muted`.

| File | Film | Accepted | Kind | How it was made |
|---|---|---|---|---|
| `turbulence-seat-01_q.mp4` | projects/turbulence-seat-01 (v3 source) | Matthew, 2026-11-18/19 ("the video came out a lot better"; the 3D series model) | realistic 3D explainer, hard cuts | re-rendered 2026-11-19 from the committed source and rebuilt models (`film/models-prep/README.md`), captionless, quarter scale |

Add a film only after Matthew accepts it. Keep each file small (quarter scale, crf ~23).
