# s3-canal-locks (brief)

Status: script v0.2 (fact-checked), VO generating, scene v0 (2026-11-19). 3D explainer series, session 3 (big machines
and engineering), video 3 (Matthew via the coordinating session, 2026-11-19: "get each of them to make one more
video"). Unsupervised: decisions logged here; approvals go to fresh judge agents.

## Facts
- Topic (picked by Claude): the Panama Canal locks lift ships 26 m with no pumps: water from above falls through
  culverts in the walls and wells up through the chamber floor; each ship's water ends up in the sea, and rain refills
  Gatun Lake. Why: a ship climbing a staircase of water stops the scroll, the mechanism is cause and effect (gate shuts,
  valve opens, water falls, ship floats up), and it is big-machine engineering seen from inside (a section through the
  wall). Not another session's area (not body, puzzles, Earth/space science or home physics) or an existing project.
- Reel 9:16 1080x1920, 30 fps, target 36-42 s, goal reach, captions on. Voice m5, music Floating Cities.

## Research and fact check (fresh agent, 2026-11-19)
- pancanal.com "Design of the locks": "No pumps are used ... the water does its work by force of gravity alone"; 18 ft
  (5.5 m) culverts in the centre and side walls; 20 cross culverts with 5 holes each (100 floor openings per chamber);
  usable chamber 1,000 x 110 ft (304.8 x 33.5 m); Gatun Lake 85 ft (26 m) above sea level.
- Linda Hall Library: a chamber fills in about 8 minutes; ~52 million US gallons (~197 million L) per transit.
  Britannica (403, from snippets): 48 million gal for the new locks.
- Steps ~8.6-8.7 m (26 m over 3); Gatun (Atlantic) and both Neopanamax flights have 3 steps; the old Pacific route is
  Miraflores 2 + Pedro Miguel 1. Rain-fed watershed: 2023 drought cut daily transits from 32 to 18 (ACP via press).
- Reworded: "rise eight meters" -> "nine meters" (a step is ~8.7 m); "the lake falls in" -> "water from above pours in"
  (lower chambers fill from the chamber above); "bursts up through the floor" -> "wells up through holes in the floor"
  (the holes exist to spread the flow); "onto the lake" -> "onto Gatun Lake"; "the water just drains to the sea" ->
  "that water flows on out to sea" (Neopanamax basins reuse ~60 %, so not "just").
- Hook chosen from three formulas (`hooks.txt`, `check_script.py --hooks` 0 flags): Cold Open Demo. `check_script.py
  script.md`: one flag left on purpose ("Not one pump" is an idiom, not a count).

## Decisions
- Ship: "Container Ship" by RM02 (Sketchfab aaa41cca946b4a08bc08cf692b7757be, CC BY 4.0, 189k tris), scaled to 290 m
  (Panamax max 294.1 m). Scouted three (`stills/scout_ships.png`). Locks, gates, culverts, terrain, water, cube, rain
  built in code. Model file kept out of git (`film/models-prep/README.md`).
- The film follows one ship up the top two steps: the hook rises in chamber 2 of 3, the ship sails into the top
  chamber, the section shows the top chamber filling straight from the lake, then it sails out onto Gatun Lake. A
  second ship in the twin lane goes down for "flows on out to sea". The 200,000 m3 per transit is a 58 m cube.
- Time-lapse: an 8-minute fill shown in ~3-5 s (stated by "In about eight minutes" and the card).

## Guidance read (2026-11-19, after merging main 9bd773f with the other sessions' lessons)
- video-script SKILL.md (three hooks, on-screen cards, check_script.py), references/picture-first.md (incl. usable band,
  props fit the set, myth-buster hooks need a poll), explainers.md, hooks.json.
- animated-video SKILL.md, references/direct.md (analogy check before the brainstorm), motion-principles.md,
  review.md (mute test on stills before the full render, mute_sheets.py, motion check without a bar, flicker.sh,
  stills at each claim's key word and between camera keys), three.md (section views, additive glow alpha, sourced mesh
  node transforms), sourcing.md, remotion-pipeline.md, ai-voiceover.md (one CPU job at a time), realistic-3d README,
  look-pass.md, real-sfx studio-sound.md; templates render_chunks.sh (PROBE, CPU guard), mux.sh (two-pass loudness).

## Assets
- "Container Ship" by RM02, CC BY 4.0 via Sketchfab (sketchfab.com/3d-models/aaa41cca946b4a08bc08cf692b7757be).

## Outstanding corrections
- none

## Lessons for the skills
- (filled as the session goes)
