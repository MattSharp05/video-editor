# Lightsaber 01: script v1 (written and produced without review: Matthew's benchmark run, 2026-11-06)

**Idea:** A lightsaber can't be a laser; the best fan model is plasma held in a magnetic loop that sets the blade's
end, fed by a crystal. **Goal:** reach (default). **Format:** Instagram Reel 9:16, narrated explainer, one continuous
3D shot (luminous 3D). **Voice:** American male (design-m2, cloned from the approved clip, as Grand Canyon and Moon
tides). **No call to action.** **Runtime:** ~72 s (196 words at the voice's ~2.8 words/s). Reading level: Flesch-Kincaid
grade 2.4 (`python3 ../moon-tides-01/readability.py lines.txt`).

## The chain (each part answers the problem the one before made)
1. Hook: most people think it's a laser. Problem: a laser never ends and can't clash.
2. Answer: plasma (glowing gas, hotter than the Sun's surface). New problem: plasma sprays out and burns the hand.
3. Answer: magnets hold it in a thin tube; the loop back into the hilt gives the blade its end.
4. Payoff of the hook's problem: two blades' fields snap together, so they clash.
5. Power: the kyber crystal (canon); the same crystals, giant, in the Death Star's gun.
6. Recap: not a laser; plasma, magnets, crystal. The catch: the battery.

## Script
| Time | Spoken line | On-screen text | What the viewer sees | Capture |
|---|---|---|---|---|
| 0:00 | Most people think this is a laser. | A LASER? | Frame 0, already moving: so close to a humming blue blade it fills the frame; pull back to a hooded figure on a night ridge, a battle station rising in the sky behind. | code (three.js) |
| 0:03 | But a laser would make a terrible sword. Light doesn't stop, so your blade would never end. |  | The blade thins into a hard beam that shoots up and keeps going; the camera rides it up past distance markers (1 m, 1 km, 100 km, still going) into the stars, then drops back. | code |
| 0:10 | And two lasers would pass right through each other. No clash at all. | NO CLASH | A second hooded figure with a red beam swings; the two beams pass straight through each other, no sparks; both freeze. | code |
| 0:15 | So many fans think the blade is plasma: gas so hot that it glows, like lightning. |  | The beams thicken back into blades; the camera dives at ours; inside, glowing gas with forks of lightning crawling through it. | code |
| 0:21 | Real plasma cutters run at over 20,000 degrees. That's hotter than the surface of the Sun. | 20,000 °C+ | A thermometer runs up the blade as the camera climbs it: oven 250 °C, lava 1,200 °C, Sun's surface 5,500 °C, plasma cutter 20,000 °C+. | code |
| 0:27 | But plasma won't hold still. It sprays out, and it would burn the hand holding it. |  | At the emitter: the plasma loses its shape and sprays out in a wide cone; the gloved hand on the grip glows orange. | code |
| 0:33 | So the hilt could use magnets to hold the plasma in a thin tube. | MAGNETS | The hilt turns to glass; three magnet rings light up violet; violet field lines grow up around the spray and squeeze it into a thin column. | code |
| 0:38 | In the old Star Wars books, the plasma loops at the tip and flows back into the hilt. That loop gives the blade its end. | STAR WARS LEGENDS LORE | The camera rides the particles up the core to the tip, where they curl over and stream back down the outside into the hilt. | code |
| 0:46 | When two blades touch, their magnetic fields snap and join up, and throw off a burst of plasma. That's the clash. |  | The red blade swings in and meets ours; the two cages of field lines press, snap and rejoin; a burst of sparks and light; the camera jolts. | code |
| 0:54 | In Star Wars, the power comes from a kyber crystal inside the hilt. | STAR WARS CANON: KYBER CRYSTAL | Down into the glass hilt: the crystal under the magnets glows and pulses with the blade. | code |
| 0:59 | The Empire put giant kyber crystals in the Death Star's main gun. | DEATH STAR | Into the crystal's light and out of the Empire's Death Star dish (a generic battle station, original model): the dish charges green, eight beams meet, one fires over the ridge. | code |
| 1:04 | So it's not a laser. It's plasma, held by magnets, powered by a crystal. |  | Back down to the figure on the ridge; as each is named the plasma loop, the field lines and the crystal flash in the blade and hilt. | code |
| 1:09 | The hard part is the battery. Nothing that small is strong enough yet. | LOW BATTERY | The blade sputters, shrinks to a stub and dies; a low-battery icon on the hilt; the ridge goes dark under the station. | code |

Times are the stand-in estimate; the film times every beat from the generated voice (`film/src/beats.json`).

## Alternative hooks (from `hooks.txt`, checked with `check_script.py --hooks`)
1. "Watch a laser lightsaber fail." / card WATCH THIS / second sentence: "Light doesn't stop, so the blade would never end." (Cold Open Demo formula.)
2. "A real lightsaber would hit 20,000 degrees." / card 20,000 °C BLADE / "That's plasma, hotter than the surface of the Sun." (number-led.)
Chosen: "Most people think this is a laser." (Matthew's stated favourite hook format, 2026-11-06; the proof, the beam that never ends, is on screen by 0:05.)

## Draft caption
How would a lightsaber actually work? In Star Wars canon the blade is just "energy" from a kyber crystal. The
plasma-held-by-magnets idea is a fan and physics thought experiment (Michio Kaku; physicist Martin Archer, who notes two
magnetic blades touching would cause magnetic reconnection, an explosive burst of plasma). The loop back into the hilt
comes from the old Legends books. A real magnetic plasma blade would bulge rather than stay straight, and no battery
that size comes close (Kaku: decades away). Plasma cutters run above 20,000 °C (TWI); the Sun's surface is about
5,500 °C. In canon the Death Star's superlaser is powered by a hypermatter reactor; giant kyber crystals channel the beam.
Fan explainer; not affiliated with Lucasfilm. Original 3D models.
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS).

## Claims to verify (fact-checked by a fresh agent 2026-11-06; rewordings applied)
| Claim as worded | Verdict | Source |
|---|---|---|
| Light doesn't stop, so the blade would never end (was "shoot off into space") | reworded | methodsforphysics.blogspot.com/2019/01/the-physics-of-lightsabers.html |
| Two lasers pass right through each other | OK | same |
| Many fans think the blade is plasma (was "most") | reworded | starwars.archivum.wiki/article/Lightsaber ("plasma blade") |
| Lightning is plasma; plasma = gas so hot it glows | OK | |
| Plasma cutters over 20,000 °C; hotter than the Sun's surface (~5,500 °C) | OK | twi-global.com/technical-knowledge/faqs/faq-what-is-plasma-cutting ; scied.ucar.edu/learning-zone/sun-space-weather/sun-photosphere |
| The hilt could use magnets (was "would") | reworded | Kaku via scienceworld.ca/stories/science-star-wars-light-sabers |
| In the old books the plasma loops back into the hilt (was stated as physics) | reworded | Legends (Wookieepedia Legends "Lightsaber"; not opened, 402; second-hand quotes) |
| Fields snap and join up, throwing off a burst of plasma (was "crash together") | reworded | Archer, magnetic reconnection (methodsforphysics blog) |
| Power from a kyber crystal in the hilt | OK | starwars.com/databank/lightsaber ("an energy core powered by a kyber crystal") |
| Giant kyber crystals in the Death Star's main gun (was "to power") | reworded: canon power is a hypermatter reactor | starwars.com/news/star-wars-inside-intel-the-death-star |
| No battery that small is strong enough yet | OK | Kaku (nanobatteries ~50 years away); Allain, Wired (figures seen in search only) |
Sources not opened: Wookieepedia (HTTP 402), Wired's own page (mirror only), starwars.com kyber databank (404).
