# Hero-asset decisions

Matthew's decisions on AI-generated 3D models for focal objects (skill: `.claude/skills/hero-assets/`). Every
proposal and every comparison gets a line, with his reason in his words. `gen_mesh.py decide` / `sync` append here;
once Broadcast exports `GET /api/factory/hero-decisions`, this file is synced from it.

The `reflect` skill reads this log to change the skill's "when to propose" rubric, the default model and the fit
defaults. A rule needs at least 2 decisions behind it, quoted in the rule. Bench and test runs log elsewhere
(`lab/hero-assets/bench/test-decisions.md`).

Score columns: focal (0/1), secs on screen, closest frame (wide/mid/close), real & recognisable (0/1), fine detail
(0/1), deforms (0/1).

## Log

| Date | Proposal | Video | Object | On screen | Score | Stage | Choice | Model | Est. | Reason (his words) | Via |
|---|---|---|---|---|---|---|---|---|---|---|---|
