# Black hole 01: benchmark notes (unattended run, 2026-11-07)

Matthew: "just make the whole thing don't ask for my approval. Make them interesting, entertaining, informative, 3rd
grade reading level." Topic: what would happen if you fell into a black hole. Second unattended run after Lightsaber 01;
these notes are for the reflect step. Nothing in the skills was changed; each item below is a proposal.

## Result
`renders/black-hole-01_v2.mp4` (git-ignored; delivered through the session): 72.6 s, 1080x1920, 30 fps. v1 was a full
render that went to the motion check and the mute test; v2 is a full re-render with their fixes (they touched almost
every section, so a full pass cost less than splicing ten ranges). Then frames 0-14 were re-rendered and spliced (the hook card faded in over
0.2 s, so frame 0 had no card). Delivered MP4: -14.5 LUFS, -1.8 dBTP; share copy 27.6 MB.

## Time (machine clock, UTC)
- 04:36 start; research agent, script, hooks, fact-check, brainstorm and picker agents: to ~04:55.
- Black hole shader prototype (first try rendered correctly) and its cost: 04:44-04:52.
- Voice: 16 lines on the CPU, 04:52-05:00 (~7 min; line 3 alone took 126 s while a render shared the CPU).
- World + film code and four still boards: 04:55-05:10.
- v1 full render: 05:10-06:18 (68 min, 2,177 frames, 1.9 s/frame). Mix built and measured during it.
- Motion readout + mute test (fresh judge, caption band blacked out): 06:18-06:22. Fixes + stills: to 06:26.
- v2 full render: 06:26-07:34; frame-0 fix, mux, checks, share copy: to 07:42. Total wall time ~3 h 05 min; render
  waits were ~2 h 20 min of it.

## What worked
- **The ray-traced black hole.** A Schwarzschild light-bending shader (the photon acceleration trick, -1.5 h² x / r⁵)
  made the shadow, the lensed disk over the top and under the bottom, and the bent stars in one pass; it rendered
  correctly on the first try. It cost 7.7 s/frame at full size on the CPU; tracing into a half-size render target and
  upscaling cut it to ~1.9 s/frame for the whole film with no visible loss (the hole is all soft light).
- **The fact-check changed the film, not just the words.** It found that line 13 ("you feel normal") contradicted
  the stretching, and that a tiny astronaut being stretched near a big hole contradicts lines 14-15. Making the main
  hole a small one, with the giant hole only at the end where it grows and swallows the stretch zone, fixed both and
  gave the ending its picture.
- **Brainstorm + picker** gave the linking device (one toy astronaut "you" plus clocks) and the friend's-view
  rule (keep the freeze on the friend's side) in ~2 min.
- **Stills before renders**: four boards caught ~20 problems (hole far too close, blown-out disk, invisible rays and gas,
  a square flash sprite, a visor hidden inside the helmet, camera keys aimed where the astronaut wasn't, a crop on the
  hook, a 0.5 s pull-back whip).
- **Mute test**: the judge recovered spaghettification, star to black hole, the edge, light falling in, the hot disk,
  feet pulled harder, the stretch, the friend's slow/red/fade view, the normal watch, the giant hole and "no way
  back". It missed: why the star appears (flashback), the swirling gas, the stretch zone's meaning; and flagged a
  blob (the camera passing through the friend's ship), a cropped astronaut and stray arrow heads. All fixed in v2
  (cards LONG AGO: A GIANT STAR, GAS SWIRLS IN, STRETCH ZONE; camera keys).
- **motion readout** (v1): median 12 separate movers per second (Grand Canyon bar 11), 7 % of seconds with two or
  fewer movers. Low seconds were the star collapse, the "looks black" push-in, the friend's freeze (intended) and the
  stretch zone hold; the zone got a ghost astronaut that falls in and stretches, plus a camera orbit.

## What broke or was missing (proposals)
1. **Camera keys must come from where the subject is at that time.** v2 board lost the astronaut for 5 s because keys
   used fixed points on its path while it moved along it. Proposal (motion-principles or three.md): place keys with a
   helper that reads the subject's position at the key's time (`ys(t, out, side, up)` here).
2. **A 9:16 frame's horizontal field of view is narrow** (46° vertical = ~27° horizontal): a side view that should hold
   a ship and the hole 20° apart can't. Worth one line in three.md next to the diagonal-axis rule.
3. **Light: a point light at a hole's centre blows out anything that gets close.** Scale it by the subject's distance.
4. **The chunked render re-bundles per chunk**, so no source edits for 70 min; fixes were staged as notes and applied
   after. A render from a frozen bundle (bundle once, `renderMedia` per chunk) would let work continue. Proposal for
   `render_chunks.sh`.
5. **motion_check still needs a bar film the cloud doesn't have** (lightsaber proposal 2, still open). Used
   `film/motion_readout.py` against the recorded number.
6. **No QA turntable for the astronaut** (assembly.md asks for one). Parts were sunk by construction and the joint list
   is in `world.tsx` (`ASTRO_JOINTS`), but the colour-per-part sheet was skipped for time; stills from many angles showed
   no gaps. Say so; worth a cheap generic `qa` composition in the template.
7. **The hook checker flags "in one piece" as a spoken number** not shown; the card says IN ONE PIECE. False positive.
8. **The profile's favourite hook ("Most people think...") again had nothing checkable** on this topic; "This tiny
   astronaut is about to become spaghetti" (The Reveal) was used.

9. **A card that fades in from t = 0 is invisible on frame 0** (the cover). Caught by the first-frame check; a card meant
   for frame 0 starts at full opacity.

## Skipped by instruction or environment (say so in delivery)
Concept and pictures approval, board approval, voice choice (design-m2 as instructed), Sound Picker picks (effects chosen
by measurement from CC0 + synthesis), the bar film for motion_check, the astronaut's QA turntable sheet, and listening
(Claude can't hear).

## Moments to listen to (Claude measured, didn't hear)
- 0:15-0:17 "crosses its edge, it can't get back out": the transcript of the joined VO read "you can't"; the line on its
  own reads "it can't". Check the audio says "it".
- 1:05-1:07 "a giant one in one piece": the transcript ran the words together ("one-in-one piece").
- 0:45-0:54 the clock ticks: friend's clock every second (left), yours once (right, lower), then your watch every second
  (centre) from 0:55. They should sit under the voice, not over it.
- 0:10-0:13 star flash and collapse (low impact + synthesized noise swell) and 1:05-1:08 the giant swell: the loudest
  effects; check they don't mask the words.
- Music: measured 10.0 dB under the voice while speaking, ~5 dB louder in the pauses.
