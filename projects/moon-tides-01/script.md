# Moon tides 01: script v0.3 (hook B, 3rd-grade reading level; draft for Matthew)

**Idea:** The moon doesn't make the waves you surf; it makes the tide, the biggest wave on Earth, by stretching the
ocean into two bulges that most coasts turn through twice a day. **Goal:** reach (default).
**Format:** Instagram Reel 9:16, narrated explainer, one continuous shot (motion principles), the new look pass and
water kit. **Voice:** American male (design-m2, cloned from the approved clip). **No call to action** (profile).
**Runtime:** about 70-73 s (~205 words; this voice speaks ~2.8 words/s in full sentences).

## The chain (each part answers the problem the one before created)
1. Hook: the moon doesn't make beach waves (wind does); it makes the biggest wave on Earth, the tide.
2. Problem: how can the moon move a whole ocean? By pulling the near side harder than the centre, the centre harder
   than the far side: the difference stretches the ocean.
3. Result: two bulges, toward the moon and opposite it.
4. Earth turns through both: two high tides a day, ~50 min later each day (the moon moves on in its orbit).
5. The sun does the same at about half strength: lined up = spring tides, at right angles = neap tides.
6. Size: under a metre on the open ocean; funnelled into the Bay of Fundy, about 16 m.
7. Recap back to the beach as the tide comes in.

## Script (v0.3: hook B, written at about a 3rd-grade reading level)
| Spoken line | What the viewer sees |
|---|---|
| Most people think the moon makes the waves at the beach. | Frame 0, already moving: waves breaking on a beach at dusk (ocean kit, approved beach look), a full moon low over the sea. |
| But the wind makes those. The moon makes the biggest wave on Earth, and you've probably never noticed it. | A gust ruffles the water on "wind"; then the camera starts to rise off the beach. |
| It's the tide: a wave so long, it can stretch across a whole ocean. | Pull back up to orbit: Earth and moon; a long, low swell of water sweeps across a whole ocean. Label: "Height exaggerated". |
| So how does the moon make it? The moon pulls on everything, but its pull gets weaker the farther away you are. | Side-on view: Earth, moon; the ocean shell lies flat. On "weaker", a glow around the moon fades with distance. |
| It pulls hardest on the side of Earth near it. It pulls the middle a little less. And it pulls the far side the least. | Three arrows grow on their words: long on the near side, medium at the middle, short on the far side. |
| That stretches the ocean into two bumps. One bump points at the moon. The other is on the far side, left behind. | The ocean shell stretches into an oval: one bump toward the moon on "points at the moon", one away on "far side". |
| Earth spins through both bumps every day. So most beaches get two high tides a day. | Earth spins under the two bumps; a beach dot rises and falls twice. Label: "12 hours 25 minutes" between highs. |
| The sun pulls too, about half as hard. When the sun and moon line up, the tides get even bigger. | The sun appears far off; when it lines up with the moon, the bumps grow taller. Label: "Not to scale". |
| In the open ocean, the tide is small. It's usually less than one meter. But in one narrow bay in Canada, the water can go up and down more than fifteen meters. | Dive from orbit into the Bay of Fundy (real terrain): the water drops and rises against the bay walls; a height bar shows 15 m+. |
| So the moon pulls, the ocean stretches, and Earth spins. And twice a day, at most beaches, the biggest wave on Earth rolls in. | Recap at speed, one beat per clause, landing back on the beach from frame 0 as the tide line creeps up the sand (loops). |

Reading level: Flesch-Kincaid grade 2.3 overall (`python3 readability.py lines_v03.txt`), about 205 words, ~10 words per
sentence; ~70-73 s at this voice's pace. Dropped from v0.2 for length: "fifty minutes later each day", neap tides.

## Alternative hooks (each with its own second sentence)
1. "The biggest wave on Earth isn't at a surf beach." / "You've seen it every day: it's the tide, and the moon makes it."
2. "Twice a day the ocean comes to you, and the moon is why." / "Not the waves: the wind makes those. The moon makes the tide."

## Draft caption
The moon doesn't make surf: wind does. The moon (and the sun, about half as strongly) makes the tides: very
long-period waves that most coasts turn through twice a day. Real tides are more complicated: continents get in the way and
tides swing around points of no tide, so the two neat bulges are a simplification. The Bay of Fundy's 15 m+ range comes
from resonance as well as its funnel shape. Bulges exaggerated; not to scale.
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS). Earth imagery: NASA.

## Claims to verify (sources)
| Claim as worded | Source |
|---|---|
| Beach waves are made by wind, not the moon | NOAA ocean facts / tides vs waves |
| Tides are waves (very long-period waves) | NOAA Tides & Currents education ("very long-period waves") |
| "half the planet long" (two bulges -> wavelength about half Earth's circumference) | to verify |
| The moon pulls the near side harder than the centre, the centre harder than the far side; the difference stretches the ocean | NOAA tutorial "Gravity, Inertia, and the Two Bulges"; NASA gravity gradient |
| Two bulges, toward and opposite the moon | NOAA tides03 |
| Two high tides a day at most coasts; ~50 min later each day | NOAA "How frequent are tides" (24 h 50 min lunar day) |
| Sun's tidal effect about half the moon's | NOAA tides02 (citing Thurman): about half |
| Spring tides when aligned, neap at right angles | NOAA |
| Open-ocean tide under a metre | to verify |
| Bay of Fundy about 16 m | Wikipedia / Ocean Networks Canada (16 m+); Guinness 14.5 m mean spring range (Burntcoat Head) |

## Fact-check (v0.1 -> v0.2, fresh agent, 2026-11-06)
Confirmed: wind makes surf (NOAA wavesinocean); differential pull near > centre > far (NASA, NOAA tides03); most coasts
two highs a day, 24 h 50 min (NOAA tides07, tidefrequency); sun about half (NOAA tides02); spring/neap (NOAA springtide).
Reworded: "one wave, half the planet long" (only true for an idealised water planet; "one" clashed with two bulges) ->
"the biggest wave on Earth: the tide, with a crest thousands of kilometres long"; far side "left behind" (both NOAA and
NASA framings accept it); open ocean "usually under a metre" (Ocean Motion: amplitude well under a metre);
Fundy "rise and fall more than fifteen metres" (Guinness mean spring range 14.5 m; extremes 16-17 m; it's a range, not
a height); recap adds "on most coasts". Alternative hook 2 was wrong (both bulges exist at once) and was replaced.
