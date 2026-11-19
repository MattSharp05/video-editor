# s1 Knuckle crack (brief)

Status: v2 delivered (2026-11-19), `renders/s1-knuckle-crack_v2.mp4` (git-ignored; sent in the session). 3D explainer series, session 1 of 5 (area: the human body and health), video 2 of 2.
Unsupervised: decisions logged here; approvals go to fresh judge agents.

## Facts
- Format: Instagram Reel 9:16, 1080x1920, 30 fps, 30-45 s, captions on, goal reach.
- Voice m5 (`library/voices/m5/`); music Floating Cities ducked 10-12 dB; CC0 sfx-29-61 or synthesized only.

## Decisions
- 2026-11-19 Topic: "Lots of people think cracking your knuckles gives you arthritis": the pop is a gas bubble forming
  in the joint fluid, and the studies found no link. Why: one of the most common health myths, a satisfying mechanism
  that only a cut-away can show (the bubble appears in the gap), and a famous one-man experiment (Unger, 50 years, one
  hand) that is a picture on its own. Different from video 1 (anatomy position + CPR).
- Hook wording: the series' "Most people think" format, softened to "Lots of people think" (the only poll found, 42 %,
  couldn't be verified at its source; "most" is unsupported).
- Build or source: the hands are our kit's rigged hand (WebXR generic-hand, MIT), placed by the wrist with
  `film/src/khand.tsx` (from s1-heart-middle) so fingers can curl into a fist. The joint is built in code at real size
  in millimetres (lathe profiles: the hand bone's round head, the finger bone's cup, cartilage caps, fluid lens,
  capsule) and shown as a section (the near half clipped), because a real knuckle's gap is hidden inside the socket.
  Scouted and not used: "Hand Skeleton&Skin" (Sketchfab, CC BY, 30k): static, bones as one mesh, and the gap still
  hidden; "Hand Bones" (270k). No sourced models in this film: no CC BY model credits needed.
- Cuts: CUT_IN on "Each knuckle" (push in on the index knuckle, cut inside the joint), CUT_OUT on "One doctor"
  (inside the joint -> two hands on the desk).
- Colour meanings: coral = the myth (the scary crack at the desk), gas pale cyan = the bubble and the pops in the
  experiment, amber = the answer (cartilage intact, the counter, "no arthritis", "no link"); fluid gold at normal
  pressure, blue when the pressure drops.

## Guidance read
- 2026-11-19: same pages as s1-heart-middle (video-script SKILL.md + picture-first.md; animated-video SKILL.md, direct,
  motion-principles, styles/realistic-3d, look-pass, ai-voiceover, remotion-pipeline, parts README, three, sourcing,
  characters, review incl. fact-check; real-sfx studio-sound), read this session for video 1 and applied again.

## Fact check
Fresh agent, 2026-11-19; table in `script.md`. Reworded lines 5, 7, 8, 12.

## Board verdict (fresh judge standing in for Matthew, 2026-11-19)
APPROVE WITH FIXES. Applied: the 15-24 s hold became an event chain (cartilage glows amber with a 30° orbit on "No bone
breaks", a second tug on "can't crack" where the bubble only wobbles and "no pop" shows, specks drift back out of the
bubble on "Scientists" while a clock runs 0-20 min); the bubble is a flattened pale-cyan cavity filling the gap (not a
white sphere), glow capped; the camera holds still at 31 mm during the pull so the 1 mm opening is ~60 px; the capsule
dimples on "drops"; labels on their words, never stacked; sleeves shorter, cuffs over the wrists (and the left hand's
wrist offset mirrored in `khand.tsx`); wood grain frequency 140 -> 40 with an fwidth fade (moiré); cut faces with a
cortical rim and marrow, capsule sealed onto the shafts, bone darker so the gap leads; specks on the curved gap;
hook: fist formed at once, pops from 0.55 s, rings twice as big, knuckles flush coral on "arthritis"; cut carrier: a
skin-tone finger shell around the joint fading as the capsule appears; doctor beat labelled "cracked" / "never
cracked", cyan pops; ending: a coral pulse on a knuckle on "hurts or swells".
Not done: a camera kick per pop; thinner cartilage.

## Checks on v1 (2026-11-19)
- Render: 1,202 frames, 5 chunks at concurrency 3, 50 min (sharing the CPU with s1-heart-middle v3).
- Flicker scan: one step, at 24.2 s (= CUT_OUT). CUT_IN joins two similar-brightness frames.
- Muxed v1: 40.06 s, -14.0 LUFS, true peak -1.8 dBTP, 41.9 MB. Music at +5 dB measures 11.1 dB under the voice.
- Mute test (fresh judge, captionless frames every 0.5 s): main point recovered ("the pop is a gas bubble forming when
  the joint is pulled apart and the pressure drops; ~20 min before it can happen again; one hand cracked 50 years and
  215 people: no arthritis"). Most shareable: the bubble filling the gap (14.5 s). Fixed in v2 (partial re-render of
  the label frames): "no pop" over the clock; labels held longer ("gap", "pressure drops", "cracked / never cracked");
  a "gas bubble" label; "pain or swelling?" on the coral pulse; a closing card "cracking ≠ arthritis" so the last 3 s
  aren't empty. Not changed: the stylised kit hands (judge: "robotic sleeve"); the cut has no shared shape beyond the
  push-in and the skin shell.

## v2 delivered (2026-11-19)
- Label frames re-rendered and spliced (`partial.sh`, 6 pieces, 575 frames): 1,202 frames, 40.06 s, -14.0 LUFS, true
  peak -1.8 dBTP, 41.2 MB. Flicker scan: only the cut at 24.2 s. Contact sheet `stills/v2_contact.png`.
- Not listened to by Claude (measured only): the synthesized knuckle cracks (are they crisp, not harsh?), the pop
  layer (pop-soft + bubbles-burst) at 14.2 s, the clock ticks under "twenty minutes", the music level.

## Lessons for the skills
- The kit hand's wrist offset (where the sleeve starts) must be mirrored for the left-hand model (+x is the back of a
  right hand, -x of a left one): unmirrored, the left wrist's open end showed as a flat disc.
- Two films rendering at once on 4 CPUs, plus a TTS job: each 300-frame chunk took 12-24 min and one TTS line took
  ~5 min (vs 20 s alone). Queue heavy jobs; don't overlap TTS with renders.
- Labels for a mute viewer need ~1.5-2 s each and one at a time; two labels crossfading in one spot read as a glitch.
- A section view (`clippingPlanes` on the near half, back faces shaded as the cut) is the cheap way to show what
  happens inside a closed joint or machine in three.js; without it the knuckle's gap was hidden by the socket rim.
