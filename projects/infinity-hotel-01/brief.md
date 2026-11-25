# Infinity hotel 01 (brief)

Status: script v0.1 (2026-11-25). Unsupervised: every decision is logged; approvals go to fresh judge agents.

## Request
Matthew, 2026-11-25: "Can you make a video 3d style. Title "trying to conceptualize infinity"? Use our skills and then
add to our storytimescroll account that has 8 followers (the older one) for next available slot."

## Facts
- Title: "Trying to conceptualize infinity". 3D explainer, same series rules as s1–s4 (voice m5, Floating Cities).
- Format: Instagram Reel 1080x1920, 30 fps, ~50-55 s, captions on, hook by 3 s. Goal: reach (saves and shares).
- Voice: AI m5 (`library/voices/m5`). Music: Floating Cities (Kevin MacLeod, CC BY 4.0), 10-12 dB under the voice.
  SFX: CC0 cstack `sfx-29`–`sfx-61` or synthesized.
- Delivery: -14 LUFS, true peak < -1.5 dBTP, < 50 MB, measured on the MP4.
- Destination: Broadcast, @storytimescroll (the older account, 8 followers), next open slot. Posting only through
  Broadcast's scheduler (content API queues it).

## Decisions
- 2026-11-25 topic: **Hilbert's hotel, then Cantor's diagonal.** The way to picture infinity is a place you can walk
  through: a motel with endless rooms that is full, yet fits one more guest (everyone moves up one) and an endless bus
  (everyone doubles their room number). The turn: the numbers between 0 and 1 can't all get rooms (Cantor's diagonal
  builds a number that differs from every room's), so some infinities are bigger than others.
- Rejected: "infinity is not a number" alone (no event to show), Zeno's paradox (a sum, not a size), the infinite
  monkey theorem (probability, needs huge counts to feel), Gabriel's horn (needs calculus to land).
- World: a roadside motel at night (luminous 3D: the light comes from the rooms, the neon sign and the bus). The
  "NO VACANCY" sign is the film's mute-readable state: "NO" goes dark when a room is free.
- Guests are simple capsule figures (built in code), so the doors, lights and moves carry the idea. Built in code, not
  sourced: the motel and the bus must repeat endlessly and change state on cue (picture-first: build what is the lead
  or thread).

## Guidance read
- 2026-11-25, plan/script (after merging main af8d2cd): animated-video SKILL.md, references/direct.md,
  references/motion-principles.md, styles/README.md, styles/luminous-3d/README.md, references/look-pass.md,
  references/three.md, references/remotion-pipeline.md, templates/parts/README.md, references/ai-voiceover.md,
  references/review.md; video-script SKILL.md, references/picture-first.md, references/explainers.md; all four
  profiles; broadcast-factory SKILL.md; library/voices/m5/README.md; s2-buffon-matches brief, script and film as the
  bar.
- Skipped: the brainstorm and picker agents of direct.md (the picture-first plan sets every beat's picture, as in the
  s1–s4 films); a fresh concept judge and fact-checker review instead. Scout skipped: nothing in the film is a
  recognisable real object that code can't make (motel, bus, figures, signs are repeated and state-driven).

## Outstanding corrections
None yet.
