# Volcano 01: script v1 (written and produced without review: Matthew, 2026-11-07, "just make the whole thing don't ask for my approval")

**Idea:** A volcano explodes when its magma is too sticky to let its gas out; runny magma lets the gas escape, so it
oozes. **Goal:** reach (default). **Format:** Instagram Reel 9:16, narrated explainer, one continuous 3D shot over real
terrain (Kilauea, Mount St. Helens). **Voice:** American male design-m2, cloned. **No call to action.** **Reading level:**
3rd grade (Flesch-Kincaid, `python3 ../moon-tides-01/readability.py lines.txt`).

## The chain (each part answers the problem the one before made)
1. Hook: one volcano oozes, one blows its top. Why? Gas.
2. Gas is dissolved in magma, held in by the weight of rock above (soda under its cap).
3. Problem: as magma rises, the squeeze weakens, so bubbles form. Where do they go?
4. Runny magma (Hawaii): bubbles rise and pop, gas leaks out, lava pours.
5. Sticky magma (more silica): bubbles stuck, pressure builds.
6. Proof: Mount St. Helens 1980: bulge, earthquake, landslide uncorks it, blast, ash, top gone.
7. Recap: runny lets gas out (ooze), sticky traps it (boom).

## Script
| Time | Spoken line | On-screen text | What the viewer sees | Capture |
|---|---|---|---|---|
| 0:00 | Watch this volcano ooze. Then watch this mountain blow its top off. | OOZE OR BOOM? | Kilauea at dusk, glowing lava pouring from its crater; then Mount St. Helens bursting, its top gone. | code (three.js, real terrain) |
| 0:04 | The secret is gas, hiding inside the hot melted rock. |  | Inside the glowing rock: tiny specks of gas held in it. | code |
| 0:08 | Deep underground, melted rock is called magma. Magma holds gas, like the fizz in a soda. | MAGMA | A cutaway under the volcano: a glowing pool of magma deep in the rock, a soda bottle's fizz held in the same way. | code |
| 0:14 | Down deep, the heavy rock above squeezes the gas in. But as magma rises, the squeeze gets weaker. So the gas makes bubbles. |  | Rock layers press down on the pool; a blob of magma rises up a crack; as it climbs, bubbles appear and grow. | code |
| 0:23 | What happens next depends on the magma. In Hawaii, the magma is runny. Bubbles rise right through it and pop. The gas gets out easily. So the lava pours out in glowing rivers. | HAWAII · RUNNY | Up Kilauea's pipe: bubbles race up through runny orange magma and pop at the surface in small puffs; lava spills out over the real slopes in rivers. | code |
| 0:37 | Other magma has more silica, the stuff glass is mostly made of. That makes it thick and sticky, like peanut butter. Bubbles get stuck inside. They push harder and harder. | SILICA | The magma turns darker and stiff; bubbles freeze in place, then swell and press. | code |
| 0:47 | That is what happened at Mount Saint Helens in 1980. Sticky magma pushed the side of the mountain out. | MOUNT ST. HELENS · 1980 | The snow-capped cone of St. Helens before 1980 (real terrain, reconstructed top); its north side bulges. | code |
| 0:53 | Then an earthquake shook it, and the side slid away. The trapped gas burst out with a boom. It was like opening a shaken soda. |  | The ground shakes; the north side slides off; the gas and magma blast out sideways. | code |
| 1:01 | Ash shot up fifteen miles in under fifteen minutes. The top of the mountain was gone. | 15 MILES UP | A grey ash column climbs past a height marker; the cloud clears to the real horseshoe crater of today. | code |
| 1:07 | So runny magma lets gas out. It oozes. Sticky magma traps gas. It can blow its top. |  | Both volcanoes side by side: Kilauea oozes, St. Helens' ash column. | code |

Times are the stand-in estimate; the film times every beat from the generated voice (`film/src/beats.json`).

## Alternative hooks (`hooks.txt`, `check_script.py --hooks`: 0 flags)
1. Chosen: "Watch this volcano ooze. Then watch this mountain blow its top off." | OOZE OR BOOM? (Cold Open Demo; both payoffs are on screen in the first seconds.)
2. "Ooze versus boom. Two volcanoes, one hidden difference." | OOZE VS BOOM (Head To Head)
3. "The biggest landslide ever seen uncorked this volcano." | BIGGEST LANDSLIDE EVER (Superlative)

## Draft caption
Why do some volcanoes ooze and others explode? Gas. Runny basalt magma (Kilauea, Hawaii) lets its bubbles escape;
sticky, silica-rich dacite (Mount St. Helens) traps them until they blast. On May 18, 1980, a magnitude 5.1 earthquake
set off the largest landslide in recorded history on St. Helens' bulging north side, and the ash column rose more than
24 km (15 miles) in under 15 minutes (USGS). Terrain: USGS 3DEP elevation via AWS Terrain Tiles; imagery: USGS National
Map (public domain); St. Helens' pre-1980 summit reconstructed from its surviving flanks; heights exaggerated where marked.
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS). Original 3D models.

## Claims to verify (fact-checked by a fresh agent 2026-11-07; rewordings applied)
| Claim as worded | Verdict | Source |
|---|---|---|
| The secret is gas (was "The difference is gas") | reworded | Volcano Watch (USGS) |
| Melted rock underground is magma; it holds gas like fizz in a soda | OK | nps.gov/subjects/volcanoes/volcanic-eruptions.htm |
| Rock above squeezes gas in; as magma rises the squeeze weakens; bubbles form | OK | Volcano Watch; NPS |
| Hawaii's magma is runny; bubbles rise and pop; the gas gets out easily (was "a little at a time") | reworded | Volcano Watch |
| Lava pours out in glowing rivers (picture: flows on the slopes, not the summit fountains) | OK | usgs.gov/volcanoes/kilauea |
| More silica, the stuff glass is mostly made of (was "made of") | reworded | USGS silica (search result only) |
| Thick and sticky, like peanut butter (was "cold honey": far too runny) | reworded | Volcano Watch ("hot tar") |
| Bubbles stuck, push harder | OK | Volcano Watch |
| St. Helens 1980: sticky magma pushed the side out; earthquake; side slid away | OK | usgs.gov/volcanoes/mount-st.-helens/science/1980-cataclysmic-eruption |
| The trapped gas burst out with a boom (was "All that trapped gas burst out at once": it went on 9 h) | reworded | same |
| Like opening a shaken soda | OK | NPS |
| Ash 15 miles in under 15 minutes (was "in fifteen minutes") | reworded | same (>24 km in <15 min) |
| The top of the mountain was gone (upper 300-400 m) | OK | same |
| Sticky magma traps gas. It can blow its top (was "It explodes": gas-poor sticky magma builds domes) | reworded | Volcano Watch; NPS |
