# Black hole 01: script v2 (fact-checked) (written and produced without review: Matthew, 2026-11-07, "just make the whole thing don't ask for my approval")

**Idea:** Falling into a black hole stretches you like a noodle, and a friend far away sees you freeze and fade, because
nothing (not even light) gets back out past the edge. **Goal:** reach (default). **Format:** Instagram Reel 9:16,
narrated explainer, one continuous luminous 3D shot. **Voice:** American male design-m2, cloned from the approved clip.
**No call to action.** **Runtime:** ~72 s (211 words; generated VO 72.1 s). Reading level: Flesch-Kincaid grade 1.9
(`python3 ../moon-tides-01/readability.py lines.txt`).

## The chain (each part answers the problem the one before made)
1. Hook: this astronaut is about to become spaghetti (a real science word). Question: why?
2. What a black hole is: a dead star crushed small; its pull is so strong nothing gets back out past the edge.
3. Why it's black: you'd have to go faster than light to get out. Problem: then how do we see one? The glowing gas.
4. The fall: feet pulled harder than head, so you stretch (the hook's promise paid).
5. Time: a far-away friend sees you slow, freeze and fade red (because your light struggles to climb out); you feel normal.
6. Payoff: small hole, stretched before the edge; giant hole, cross in one piece; either way, no way back.

## Script
| Time | Spoken line | On-screen text | What the viewer sees | Capture |
|---|---|---|---|---|
| 0:00 | This tiny astronaut is about to become spaghetti. | ASTRONAUT → SPAGHETTI | Frame 0, already moving: a tiny white astronaut drifts toward a huge black hole ringed by a glowing orange disk; the stars around it bend. | code (three.js) |
| 0:03 | Scientists really call it spaghettification. Pretend the astronaut is you. | SPAGHETTIFICATION | The astronaut wobbles and stretches a little, then snaps back; the camera swings in behind their helmet so the viewer is in their place. | code |
| 0:08 | Some black holes are left when a giant star dies. It crushes itself into a tiny space. | | A giant star swells and caves in; it shrinks to a point and the disk of gas lights up around the dark spot it left. | code |
| 0:15 | Its gravity is so strong that once anything crosses its edge, it can't get back out. Not even light. | EVENT HORIZON | A glowing line marks the edge; a passing rock crosses it and is gone; the astronaut's flashlight beam bends into the hole and vanishes. | code |
| 0:22 | To get out, you would have to go faster than light. And nothing can. | | A light pulse races outward from just inside the edge and is dragged back in; a speed bar tops out at "light speed" and still loses. | code |
| 0:27 | That is why the hole looks black. | | The camera pulls back: a perfect black circle inside the glowing ring. | code |
| 0:29 | But gas near it can glow. It swirls in like water down a drain. | | The disk spins, gas streaming in spirals toward the edge like a drain; one side brighter (moving toward us). | code |
| 0:34 | It rubs and heats up to millions of degrees, so it shines. | MILLIONS OF DEGREES | The inner disk turns from orange to white-hot as the camera skims over it. | code |
| 0:38 | Now you fall in. Your feet are closer to the hole than your head. | | The astronaut tips feet-first toward the hole; two arrows, a long one at the feet and a short one at the head. | code |
| 0:43 | So gravity pulls your feet harder, and you stretch long and thin. | | The astronaut stretches longer and thinner, like a noodle, as they fall. | code |
| 0:47 | Your friend watches from far away. To your friend, you seem to slow down. | | The camera pulls back to a friend in a small spaceship far away; through the window, the astronaut far below, falling slower and slower; the friend's clock runs fast beside the astronaut's slow one. | code |
| 0:52 | You seem to stop near the edge. You turn red and dim, and fade away fast. | | The astronaut stops just above the edge, turns red, dims and fades out. | code |
| 0:56 | But your own watch ticks just like always. You don't stop. You fall right in. | | Back with the astronaut: the watch on their wrist ticks steadily; they slide over the edge into the dark. | code |
| 1:02 | A small black hole like this one stretches you before you even reach the edge. | SMALL: NOODLE FIRST | A small black hole: the astronaut stretches into a noodle far from the edge. | code |
| 1:07 | But you could cross the edge of a giant one in one piece. | GIANT: IN ONE PIECE | A giant black hole: the astronaut floats across its edge whole. | code |
| 1:11 | Either way, once you cross, you can never come back out. | NO WAY BACK | The camera pulls back from the edge; the black circle fills, then the glowing ring; the film ends on the black hole. | code |

Times are the stand-in estimate; the film times every beat from the generated voice (`film/src/beats.json`).

## Alternative hooks (from `hooks.txt`, checked with `check_script.py --hooks`, 0 flags)
1. "Watch this astronaut fall into a black hole." / card WATCH HIM FALL / second sentence: "Scientists say he'd turn into spaghetti." (Cold Open Demo.)
2. "Nobody tells you a black hole does this." / card YOU, AS SPAGHETTI / "It stretches you like a noodle." (Nobody Tells You.)
Chosen: "This tiny astronaut is about to become spaghetti." (The Reveal: the astronaut and the black hole are on screen at
frame 0 and the promise, the stretch, starts at once; Matthew's favourite "Most people think..." format had nothing
checkable on this topic.)

## Draft caption
What would happen if you fell into a black hole? Near a small (star-sized) black hole, gravity pulls your feet much
harder than your head, so you'd be stretched long before reaching the edge; scientists really call it
spaghettification. Near a giant one, like the one at the centre of our galaxy, you could cross the edge (the event
horizon) in one piece, and the stretching comes later. To a friend far away you'd seem to slow, stop near the edge,
redden and fade; your own watch ticks normally. The glowing gas around black holes reaches millions of degrees.
Simulated in code: the black hole's light-bending is computed, the astronaut is a toy, sizes are not to scale.
Sources: NASA Science, ESO/EHT, Andrew Hamilton (JILA), John Baez (UCR physics FAQ).
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS).

## Claims (fact-checked by a fresh agent 2026-11-07; rewordings applied)
| Claim as worded | Verdict | Source |
|---|---|---|
| Scientists really call it spaghettification | OK | science.nasa.gov/universe/black-holes/ |
| Some black holes are left when a giant star dies (was "A black hole is what is left") | reworded: supermassive origins unknown | science.nasa.gov/universe/black-holes/types/ |
| Once anything crosses its edge, it can't get back out. Not even light | OK | science.nasa.gov/universe/black-holes/ |
| To get out, you would have to go faster than light | OK (NASA's escape-speed framing) | science.nasa.gov/universe/black-holes/anatomy/ ; jila.colorado.edu/~ajsh/insidebh/schw.html |
| Gas near it can glow (was "the gas around it glows") | reworded: many have no disk | science.nasa.gov/universe/black-holes/ |
| It rubs and heats up to millions of degrees | OK (friction; inner disk millions of degrees) | chandra.harvard.edu/resources/illustrations/blackholes3.html ; imagine.gsfc.nasa.gov/science/objects/black_holes2.html |
| Feet closer, pulled harder; you stretch long and thin | OK | science.nasa.gov/universe/black-holes/ |
| To your friend, you seem to slow down (was "you slow down") | reworded: an optical effect | math.ucr.edu/home/baez/physics/Relativity/BlackHoles/fall_in.html |
| You seem to stop near the edge... turn red and dim, and fade away fast | reworded (dimming is quick) | same; science.nasa.gov/universe/new-nasa-black-hole-visualization-takes-viewers-beyond-the-brink/ |
| Your own watch ticks just like always (dropped "you feel normal") | reworded: contradicted the stretching | same |
| A small black hole like this one stretches you before you reach the edge | OK | NASA visualization page above |
| You could cross the edge of a giant one in one piece | OK | jila.colorado.edu/~ajsh/insidebh/schw.html |
| Once you cross, you can never come back out | OK | same |
Picture rules taken from the fact-check: the main hole is small; light inside the edge is never shown rising and
falling back (the river picture: it is carried in from the start); the disk keeps a gap to the edge; reddening, dimming
and slowing happen together, seen only from the friend's side; no flash or wall at the crossing.
