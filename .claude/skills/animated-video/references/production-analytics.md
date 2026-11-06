# Production analytics

When the user asks what a film cost in time and tokens, measure it from the session transcript,
not from memory: self-reported times drift. Worked example: `projects/grand-canyon-01/analytics.md`.

1. At the start of each phase, write its start time down with the machine clock
   (`date -u +%FT%TZ > projects/<slug>/.start`, or a line in the brief): topic, script approved /
   go-ahead, first full render, delivery.
2. Run `templates/remotion-film/analytics.py TRANSCRIPT.jsonl "Script=…" "Production=…" --end=…`.
   It counts per phase: wall time, responses, tool calls, edits, still batches, images reviewed,
   renders, web lookups, subagents (with their tokens) and tokens (output, fresh input, cache
   reads and writes).
3. Report a table per phase and per step, and split wall time into Claude working, render waits
   and waiting on the user. Name what a step's time went to (fixes found by stills, partial
   re-renders) so the next film can cut it.

Grand Canyon 01 (77 s, 3D): about 96 min topic to delivery: 41 min working, 51 min of render
waits, 14.5 min waiting on the user; 118 k output tokens, 33 M input (99.5% cache reads). Renders
dominate, so stills and partial re-renders ([review](review.md#stills-before-renders)) are where
time is saved.
