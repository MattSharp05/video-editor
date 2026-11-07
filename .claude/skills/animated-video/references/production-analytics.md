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

## Token budget (Octopus 01, 2026-11-07)

Output is small and input is huge: Octopus 01 used 176 k output tokens but 63.4 M cache reads, because every response
re-reads the whole conversation (~350 k tokens on average by the end) and everything viewed stays in it. Even at about
a tenth of the input price, cache reads were most of the cost. Two habits cut them by an estimated 40-50 % for ~2-5 min
more wall time per film:
- **A watcher agent reads the render chunks, not the main session.** Waking the main session for every chunk cost
  Octopus 01 83 responses and 37 M cache reads for 41 k output during its renders. Spawn one agent that waits for each
  chunk, reads it as a strip, and reports only a real bug (a pop, a draw-order flip, a broken object, a camera through
  a prop) or "done". The render itself takes the same time; the early stop on a real bug is kept (Volcano 01 saved
  ~33 min that way), and the main session wakes once.
- **One-off big reviews go to fresh agents:** the mute test (already one), the final QA pass, motion-check strips. Each
  adds ~45-70 s of agent start-up but its images never enter the main conversation.
- **Keep the stills fix rounds in the main session.** They are a fast look-fix-look loop: a ~1 min agent per round
  adds ~10 min over a board, and a summary drops the small details (Octopus 01's blade-thin arms, a ring at the frame
  edge) that cost an extra round.
