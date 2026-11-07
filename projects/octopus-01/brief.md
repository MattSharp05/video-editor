# Octopus 01 (brief)

Status: v5 delivered (film/out/octopus-01_final.mp4 + octopus-01_share.mp4), produced unattended (Matthew, 2026-11-07: "just make the whole thing don't ask for my approval. Make them
interesting, entertaining, informative, 3rd grade reading level."). Every approval stop in the skills is skipped by
that instruction; each skip is listed below and in the delivery.

## Facts
- Topic (Matthew): "How does an octopus turn invisible?" (chromatophores, iridophores, leucophores, papillae, colour
  blindness and open questions such as light-sensing skin). Slug `octopus-01`.
- Reel 9:16, 30 fps, ~75 s. Style: 3D (three.js in Remotion), underwater on a reef, water kit (`references/water.md`,
  "underwater clear" rated 4/5) with the `tropical` preset tuned (reef ~6 m down, clear turquoise). Original models only.
- Voice: American male design-m2, cloned for every line from `projects/grand-canyon-01/vo/ref_design-m2_hook.wav`.
- Music: "Floating Cities" (Kevin MacLeod, CC BY 4.0). Effects: CC0 `library/sfx/cstack-cc0` or synthesized only.
- No call to action. Spoken spelling American ("color"), matching the American voice.

## Skipped approval stops (by instruction)
- Concept and pictures approval (direct.md alignment stop): picked by a fresh brainstorm agent + a separate picker agent.
- Style frames / style pick: style fixed by the request (3D underwater reef).
- Key-frame board approval: board made and fixed by Claude's own review, not shown before the render.
- Voice choice: fixed by the request (design-m2 clone).
- Sound Picker picks: sounds chosen by measurement against `lab/sound-picker/sound-palette.json`, not by ear.

## The thread (one shot; lead -> move -> next lead, carrier)
| # | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| 1 | the "rock" with a fish resting on it | transform | the octopus's eye | the fish bolts as the eye opens under it; the rock flashes into an octopus |
| 2 | the eye | travel (blinks) | the skin beside it | each blink lifts on a new outfit; colour spreads out from the eye |
| 3 | the skin | travel (push in) | one colour sac | the dots resolve as the camera pushes in; one stays centred while everything grows |
| 4 | the field of sacs | split | three sacs + an empty slot | yellow, red and brown sacs rise out of the field; a fourth slot stays dark |
| 5 | the yellow sac | open | the whole field | its spoke muscles pull it wide and let go; then the field opens in a wave |
| 6 | the spokes | travel (up the nerve and back) | the field firing at once | the spark from the brain |
| 7 | the empty slot | pass through | the mirror plates | a sunbeam goes down the gap and comes back blue-green |
| 8 | the plates | pass through | the white cells | coloured light pools sinking down |
| 9 | the white cells | pull back | the bumpy octopus on the rock | bumps rise as the camera climbs out of the skin |
| 10 | the eye | pass through | the grey reef | the pupil; inside, the world drains to grey |
| 11 | the grey reef | transform | the coloured octopus | colour floods back into the octopus first: the paradox |
| 12 | question bubbles | travel | the dish of skin on the sand | the bubbles rise into the sunbeam over the dish |
| 13 | the dish's skin | pass through | the layers (recap) | the camera dives into the disc; each layer flashes as named |
| 14 | the layers | pull back | the reef, the fish, rocks with eyes | the camera rises out; the fish comes back and backs away |

## One visual language
| Thing | State | Look (one per state) |
|---|---|---|
| Octopus | hidden / seen / alarmed | copies the rock (REEF_COLOR) / red-brown with pale web / pale white flash |
| Colour sac | closed / open | a small dot / a wide flat disc (yellow, red or brown; never another colour) |
| Spoke muscles | relaxed / pulling | long thin pink spokes / short thick spokes |
| Nerve | carrying a signal | warm white line, the spark a bright bead; nothing else is warm white |
| Shiny cells (iridophores) | lit | stacked plates, blue-green light coming back |
| White cells (leucophores) | lit | take the colour of the lamp over them (gold, then blue) |
| Bumps (papillae) | flat / raised | smooth skin / cones and horns |
| Eye-view | color-blind | the whole frame drained to grey |
| Cards | science names | centred card, white text; key words in captions take the accent (warm gold) |

## Production
- Research: subagent report `research.md` (Hanlon/MBL, Mäthger 2009, Ramirez & Oakley 2015, Stubbs 2016, OIST 2023).
- Script: three hooks (`hooks.txt`, 0 flags); `check_script.py` 0 flags at 2.8 words/s; grade 1.8 (`readability.py`).
- Fact-check (fresh agent, 2026-11-07), applied: "whole look" -> "colors" + "as little as" (200 ms is the fastest case);
  "just a single color: yellow, red or brown" -> "a single color, like yellow, red or brown" (sacs can also be orange
  or black); "can't make blue or white" -> "blue or green" (white is the leucophores' job); "Scientists think
  octopuses can't see color at all" -> "Most scientists think octopuses are color-blind"; "octopus skin reacted to light
  all by itself" -> "a bit of octopus skin in a dish reacted to light, with no eyes or brain" (skin cut from one
  species; 6.5 s latency).
- Pictures: fresh brainstorm agent (4-6 ideas per beat) -> separate picker agent; picks in the thread above (fish on
  the rock, blinks as the unit of time, push into the dots, spoke muscles, nerve spark, empty slot -> plates, white
  cells under coloured light, into the pupil -> grey, dish with slow skin, rocks that open eyes).
- VO: 14 lines cloned from the design-m2 hook clip (~25 s/line on CPU), joined with pauses: 72.6 s, 209 words
  (2.9 words/s); faster-whisper transcript matches the script word for word.
- Build: `film/src/octopus.tsx` (lofted body, 8 CPU-rebuilt arms, web, eyes with lids, suckers; skin shader with
  chromatophore cells, iridophore sheen, leucophore base, papillae displacement + bump, REEF_COLOR match), `reef.tsx`
  (water kit underwater set, tropical preset tuned), `skin.tsx` (macro skin: sacs + spoke muscles, nerve and brain,
  plates, white cells). Joints checked on mount with three-mesh-bvh (arms, web, eyes vs body); QA views
  `stills/qa_octopus_joints.png`. Stills board: three fix rounds (inverted arm winding made arms look like blades; sacs
  too sparse; reef background overwritten by a mount effect; blown-out beam/lamp; recap clutter; rock eyes too small).
- Sound: `film/sound/mix.py`: voice +10 dB, Floating Cities +12 dB ducked (10.7 dB under speech, ~5.6 dB up in
  pauses), CC0 underwater-deep bed (quieter in the skin), 30 cues (4.1 per 10 s incl. the bed and six eye pops),
  two synthesized layers (sac stretch, bumps). Mix -14.2 LUFS.

- Render: v1 chunked full render (reef ~3.3 s/frame, skin ~1 s/frame; a container restart mid-render, resumed from
  chunks on disk); v2 + v5 partial re-renders spliced (see benchmark.md). Final -14.2 LUFS, -1.8 dBTP, 72.9 s.

## Caption credits
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS). Original 3D models.

## Outstanding corrections
None yet (no review by design).
