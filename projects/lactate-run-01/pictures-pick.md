# Lactate run 01: picture picks

Inputs: `pictures-brainstorm.md` and `lines.txt` (11 lines, about 55 s, 9:16 Reel, 3rd-grade level).
Route: everything drawn in Remotion (SVG and 2D canvas). One builder, about 1.5 h, a 4-core CPU with
software WebGL. That rules out three.js beyond a trivial layer, so every pick here is 2D: SVG shapes
plus canvas particle fields, both of which render fast on a CPU.

## The spine: one world, one zoom axis

Everything happens inside and around **one runner on a dusk track**. The runner is drawn as a
**glass body**: a warm silhouette with see-through legs, blood vessels and organs. The camera only
moves in and out along one axis that passes through **the glowing spot on the right thigh**:

```
track (1-2) -> into thigh -> muscle fibre (3-5) -> through the fibre wall -> blood river (6)
  -> ride the river up and pull out to the whole glass body (7) -> dive back into the thigh (8)
  -> pull out to the runner on the track (9-10) -> pull wide (11)
```

This gives one continuous camera with no cuts. Every frame grows out of the last through a single
point: the thigh glow, then one sugar cube, one amber lantern, the runner's foot. It also builds
little: one runner rig, one fibre interior and one blood river, each used two or three times. A
change of world, such as a bathtub, kitchen, factory or pinball table, would buy clarity at only one
beat, and each one costs a new set plus a cut-like jump. The one place where the brainstorm's best
analogy (the bathtub for the threshold) really beats the literal picture is rebuilt inside this
world instead (see line 9). So no beat changes world.

**Linking devices**. Each one is a picture from the beats themselves, not an extra overlay.
- **The amber lantern** (lactate). It is born in the fibre (6), floats through the blood (7),
  steps aside to reveal the real culprits (8), fills the glass body (9) and is gobbled by the
  trained runner (11). Sugar is white and lactate is amber, and colour is the whole code.
- **The stride beat**. Footfalls set the pulse of every interior shot: the fibre contracts on each
  footstrike. It is calm in 3-4, frantic in 5, sluggish in 8, rising in 9, and easy again in 10-11.
  The viewer can feel the pace without a label.
- **The trash bag** from line 1 comes back as the last image of line 11.

**Accuracy guards, built into the pictures.**
- **Oxygen is never shown running out.** A capillary runs alongside the fibre in 3-6, and its
  little red cells and oxygen bubbles keep streaming **at full rate in line 5**. The bottleneck is
  plainly the engines' speed, not the air supply. There are no gauges, no gasping and no empty
  bubbles anywhere.
- **The burn belongs to acid and leftovers.** In line 8 the lanterns visibly move *away* and the
  red heat sits on the spiky red sprites (acid) and grey grit (leftovers). The heat glow is never
  drawn on the amber.
- **"Tiny engines" means mitochondria**, always drawn the same way: a bean-shaped engine with a
  glowing striped core and a spinning rotor. They appear in 4, 5, 7 (inside heart, brain and arm),
  10 and 11, so the viewer learns one shape. They carry no other name and no alternate drawing.
- In line 1 the words "lactic acid" appear only as the myth. From line 6 on, the amber thing is
  lactate.

## Judging, beat by beat

Scores: clarity (C), surprise (S), spectacle (Sp), each out of 5. Cost is build time inside the
1.5 h budget.

**Line 1, the myth.** The literal flaming thighs (1.1) are clear but a cliché (C5 S2 Sp3). The
trash-bag blob (1.5) is set up best for the line 2 flip, but a character with a pitchfork and a
booing crowd is expensive. **Pick: combine 1.1 and 1.5 without the character.** The runner's thighs
glow red and flicker on each stride. The camera pushes in, and inside the glowing thigh sits a
lumpy black **trash bag printed "lactic acid"**, with flies circling. It is clear (burning legs plus
garbage reads as "waste that burns") and it plants the prop that line 2 flips. C5 S3 Sp3. Cost:
low, since the runner rig is shared anyway.

**Line 2, the flip.** The trash bag rips open to reveal fuel (2.1) and the flames get sucked into a
lantern that lights the path (2.3); both are strong. **Pick: combine them.** The bag splits, the red
flames are *sucked into* the tear, and a fat **amber glowing drop** swells where the trash was. The
whole frame swings from angry red to warm gold, and the runner's path ahead lights up. There is one
object, one state change and a colour reversal: it is screenshot-able with no words, and the drop
becomes the film's colour key. C4 S4 Sp4. Cost: low.

**Line 3, sugar breakdown.** Literal (3.1) beats the locomotive and the vending machine. The fibre
interior is the set the next three beats need anyway, and "a cube snaps, a spark fires, the muscle
squeezes" reads with the sound off. **Pick 3.1 with 3.4's focus:** one hero cube with a tiny face
(cheap in SVG) leads a stream of white cubes. Each cube snaps into two halves, the snap fires a
spark, and the fibre's strands all squeeze together on the footstrike. C5 S3 Sp4 (dozens of cubes
and a whole wall of strands pulsing as one). Cost: medium; this is the main interior set.

**Line 4, easy pace, burn all the way.** The chefs (4.2) mean a new world. **Pick 4.1 with 4.4's
pull-out.** The hero's halves drift into a mitochondrion, its rotor turns calmly, and out come only
soft puffs (bubbles and droplets) plus sparks of energy. Nothing is left over and the halves vanish
completely. Then the camera eases back and there are hundreds of engines glowing evenly through the
fibre like a city at night, all breathing on the slow stride beat. C4 S3 Sp5. Cost: medium; the
engines are one SVG symbol instanced on canvas.

**Line 5, the bottleneck.** This is one of the biggest beats. The Lucy-and-Ethel conveyor (5.1) is
the clearest bottleneck ever filmed, but it is a kitchen world plus characters. The funnel (5.4) is
clear but abstract. **Pick 5.2 plus 5.3, inside the same fibre.** The stride beat doubles, the drip
of cubes becomes a **firehose**, and halves rain down by the hundreds. Every engine's rotor spins
flat-out and wobbles, steam whistles from it, and it still takes halves at the same fixed rate
through its door. The surplus **heaps up around each engine like a snowdrift**, the drifts join, and
the fibre fills white. Meanwhile, in the capillary beside it, the oxygen bubbles keep streaming at
full rate (the accuracy guard). The image is "engines at max, pile growing", and the pile itself is
the spectacle. C5 S4 Sp5. Cost: medium. The pile is a height field that grows per column; it is not
real physics.

**Line 6, it becomes lactate and spills into the blood.** **Pick 6.1, continuing the drift.** A
colour wave runs through the white heap and turns it to **amber**, from the engines outward. The
amber pieces round off into little glowing lanterns, squeeze through pores in the fibre wall, and
drop into the **red blood river** next to it, where they float away like a lantern festival. The
colour change *is* "turns into", and the river *is* "spills into your blood". C5 S4 Sp5 (hundreds of
lanterns on moving water). Cost: medium; the river is a scrolling canvas band and the lanterns are
particles.

**Line 7, heart, brain and other muscles burn it again.** This is a big beat. The relay of hands,
a butterfly net and a frog tongue (7.1) is fun but means three gags to animate. The pinball machine
(7.3) is a new world. The city map (7.4) is pure spectacle. **Pick 7.4's pull-out carrying 7.1's
grabs.** The camera rides one lantern up the river, then pulls out until the river is just one
vessel in the **whole glass body**, with lantern streams flowing up the vessel tree. The **heart**
squash-gulps a stream and flares, the **brain** sips one and sparkles, and the **resting arm**
catches one and glows. Each flare is the same tiny engine shape lighting up inside the organ, so
"burn it again" uses the line 4 picture. The whole body ends lit in amber. C5 S4 Sp5. Cost: medium;
it reuses the runner rig plus vessel paths.

**Line 8, why it burns.** **Pick 8.1 plus 8.4.** The camera dives back through the thigh spot into
the fibre. The lanterns *slide aside* like a curtain, and behind them are **spiky red sprites
(acid)** and **grey grit (leftovers)** jammed between the strands. The red heat glow from line 1
comes back but sits on *them*. The strands squeak and squeeze slower, the stride beat visibly drags
from fast to sluggish, and through the end of the shot the runner's legs slow down. This answers
line 1's question with line 1's own colour, and it keeps lactate innocent. C4 S4 Sp4. Cost: low to
medium, since it reuses the fibre set.

**Line 9, the threshold.** This is the biggest beat, and the only one where an outside analogy
seriously threatened the literal picture. The bathtub (9.1) is the clearest model of "made faster
than used". The hill-road curve (9.3) is the most surprising. The amber tower (9.2) is literal but
reads as "a pile", not as "a pace". **Pick: the bathtub and the hill road, both built from the glass
body.** The camera pulls out to the runner on the track. The glass body *is* the tub: lanterns pour
in from the legs (the tap) and the heart, brain and arm drain them (the drains, as in line 7). The
runner speeds up, and you see it in the stride rate, the track lines streaking and the background
whipping by. The amber level inside the body stays low and flat. As the runner runs, **the level
draws a glowing ribbon on the ground behind them**, flat, flat, flat. Then, at one speed, the tap
outruns the drains and the amber shoots up the body to the chest, and the ribbon **bends sharply
upward**. A flag plants itself at the bend: "your lactate threshold". The tub gives the mechanism
and the ribbon gives "that pace" as a place you can point at. It is all one world and is drawn by
motion, not a chart on a slide. C5 S5 Sp4. Cost: medium to high, the costliest beat (about 15 min),
because the level, ribbon and flag must stay in sync with the pace.

**Line 10, training pushes the line.** The popcorn engines (10.1) are literal and fun. Opening more
checkouts (10.3) and widening the drains (10.4) are clear. **Pick 10.1 inside the line 9 frame,
plus a replay.** Days flash past as dusk-to-dawn sweeps across the sky, with no calendar card. Each
sweep makes **new engines pop like popcorn** inside the glass legs, heart and arm, so the body
fills with little lights. Then the run *replays*. The old run stays as a faint ghost runner and a
ghost ribbon. The new ribbon stays flat **past the old flag**, and the flag pulls up and replants
further along. "More engines, line moves" lands in one frame, and the ghost sets up line 11. More
engines in the leg (less overflow) and in heart, brain and arm (bigger drains) are both shown, which
is accurate. C5 S4 Sp4. Cost: low to medium, since it reuses the line 9 machinery.

**Line 11, the payoff.** The stadium pull-out (11.4) is spectacle but no new idea. The superhero
blob (11.1) needs the character we skipped. The side-by-side contrast (11.2) is clearest for "fit
runners burn even more". **Pick 11.2, grown from line 10's ghost, plus the trash-bag bookend.** The
ghost (untrained) and the trained runner run side by side. Lanterns pile up and slosh in the ghost.
The trained runner's many engines **gobble lanterns** like Pac-Man, so it glows brighter, strides
easier and pulls ahead. The camera pulls wide as it passes the track-side bin, and the **line 1
trash bag** tips out of it. Out rolls the amber drop, and the trained runner scoops it up mid-stride
and blazes gold down the lit track. End there. C5 S4 Sp4. Cost: low to medium.

## Runners-up for the biggest beats

| Beat | Pick | Runner-up | Why it lost |
|---|---|---|---|
| 1-2 myth and flip | Trash bag in the burning thigh rips, flames sucked in, amber drop | Trash-bag blob character turns hero (1.5 + 2.1) | Equally surprising, but a character rig plus a crowd costs 15+ min, and the bag alone does the flip |
| 5 can't keep up | Engines at max, white surplus drifts up around them, oxygen still flowing | Lucy-and-Ethel conveyor (5.1) | Clearest bottleneck, but a kitchen world with characters breaks the one-world thread and doubles the build; the drift also flows straight into line 6 |
| 6 spills into blood | Drift turns amber, lanterns drop into the blood river | Takeaway boxes on delivery bikes (6.3) | Cute, but a new world; the lantern river is more spectacular and carries 7-11 |
| 7 burn it again | Ride a lantern, pull out to the glass body, heart, brain and arm gulp and flare | Body pinball (7.3) | Most fun, but a new world and an arcade look; the pull-out gives the same "lights up" payoff on the body we keep using |
| 9 threshold | Glass body as a tub, plus the level drawing a ribbon that bends up at the flag | Classic bathtub (9.1) / hill road alone (9.3) | The bathtub alone leaves the set; the hill road alone hides *why* it bends. Combined, each covers the other's gap |
| 10 training | Days sweep, engines pop, replay with ghost, flag moves | Wider drains on the tub (10.4) | The line says "more tiny engines", so the engines themselves should multiply |
| 11 payoff | Ghost against trained runner, trash bag returns as fuel | Stadium of glowing runners (11.4) | Spectacle with no new information; the contrast says "fit runners burn more" |

## The set as one film

- **Where the camera is:** outside (1-2), in (3-6), out to the body (7), in (8), out to the runner
  (9-10), wide (11). The film breathes in and out through the same thigh spot. Each change of scale
  goes through an object the viewer is already watching, so it never feels like a cut.
- **Presentation check:** in every beat the frame's main event is a state change (snap, fill, colour
  wave, gulp, slowdown, ribbon bend, popcorn, overtake). Text is at most one printed word on an
  object ("lactic acid" on the bag) and one flag ("your lactate threshold"). There are no arrows
  and no label build-ups.
- **Colour code:** white = sugar, amber = lactate, red heat = acid and leftovers, gold sparks =
  energy. The palette is dusk navy plus these four, so the colour shifts carry the story with the
  sound off.
- **Fun:** the hero cube's face (3-4), the engines red-lining with steam whistles (5), the heart's
  squash-gulp (7), the squeaky gummed-up strands (8), the ghost getting overtaken (11), and the
  trash-bag return.

## Build budget (about 1.5 h, CPU render)

| Asset | Used in | Est. |
|---|---|---|
| Glass-body runner rig (parametric capsule limbs, run cycle with a stride-rate prop, vessels, heart, brain and arm hot spots, amber fill mask) | 1, 2, 7, 9, 10, 11 | 20 min |
| Dusk track, streaking lines, sky sweep | 1, 2, 9, 10, 11 | 5 min |
| Fibre interior (pulsing strands, capillary with oxygen, cube stream, snap and spark) | 3, 4, 5, 8 | 15 min |
| Engine symbol, instanced field, rotor speed, steam | 4, 5, 7, 10, 11 | 8 min |
| Surplus drift (height field), amber colour wave, lanterns, blood river | 5, 6, 7 | 12 min |
| Threshold ribbon and flag, replay ghost | 9, 10, 11 | 12 min |
| Acid sprites and grit, trash bag and drop | 1, 2, 8, 11 | 6 min |
| Camera rig (one continuous zoom path through anchor points), timing to VO, render and check | all | 12 min |

Everything is SVG plus 2D canvas: no three.js, no blur-heavy filters (use pre-drawn radial-gradient
glows), and particles kept under about 1,500 so software rendering keeps up at 1080x1920.

## Beat sheet

| # | Line | Picture as an event (what moves, what changes state) | Camera | Hand-off / carrier |
|---|---|---|---|---|
| 1 | Most people think lactic acid is waste that makes your legs burn. | A dusk track and one glass-body runner. On each footstrike both thighs flare red and flames lick up. Inside the right thigh a lumpy black trash bag printed "lactic acid" bulges, with flies circling. | Starts mid-wide on the runner (tracking alongside), then pushes in toward the right thigh. | The trash bag, now filling the frame in the red glow. |
| 2 | But actually, it's fuel. | The bag rips. The red flames are sucked into the tear, and a fat amber drop swells where the trash was. The frame swings from red to gold and the path ahead lights up. | A small hold and recoil at the rip, then a continued slow push into the drop. | The amber drop's glow. The camera goes *through* it into the muscle. |
| 3 | When you run, your muscles break down sugar to make energy. | Fibre interior: strands, plus a capillary running alongside with oxygen bubbles. A stream of white cubes, led by the hero cube with a face. Each cube snaps in two, a gold spark fires, and all strands squeeze on the calm footstrike beat. | Lands inside the fibre and drifts along with the hero cube. | The hero cube's two halves drifting toward a bean-shaped engine. |
| 4 | At an easy pace, tiny engines in your muscles burn it all the way. | The halves enter a mitochondrion. Its rotor turns calmly and only soft puffs and gold sparks come out; the halves vanish completely. The view widens to hundreds of engines glowing evenly, breathing on the slow beat. | Follows the halves in, then eases back to reveal the engine "city". | The engine field. The beat starts to quicken. |
| 5 | But when you run hard, sugar breaks down super fast. The tiny engines can't keep up. | The beat doubles. The cube drip becomes a firehose of halves. Every rotor spins flat-out, wobbles and whistles steam, but the doors take halves at the same rate. White surplus drifts up around each engine, joins up and fills the fibre. Oxygen keeps streaming in the capillary at full rate. | A slight push-in on one red-lining engine with handheld shake, then a pull back as the drift rises. | The white drift, nearly frame-filling. |
| 6 | So the extra turns into lactate, and it spills into your blood. | A colour wave turns the drift amber, starting at the engines. The pieces round into glowing lanterns, squeeze through pores in the fibre wall and drop into the red blood river, where they float away. | Slides sideways through the fibre wall and settles on the river surface. | One lantern on the current. |
| 7 | Your heart, your brain, and other muscles grab it and burn it again. | The camera rides the lantern upstream, then pulls out: the river is one vessel in the whole glass body, with streams of lanterns flowing up the vessel tree. The heart squash-gulps a stream and flares (engine shapes lighting inside), the brain sips and sparkles, and the resting arm catches one and glows. The body ends lit amber. | Rides the lantern, then makes one long pull-out to the full body (the runner frozen mid-stride, glass). | The thigh hot spot still glowing red at the edge of the lit body. The camera aims at it. |
| 8 | So why do your legs burn? Hard running also makes acid and other leftovers. Those help slow you down. | Dive back into the thigh fibre. The lanterns slide aside like a curtain, revealing spiky red acid sprites and grey grit jammed between the strands. The red heat glow returns, sitting on them. The strands squeak and squeeze slower, and the beat drags. | A fast dive in through the thigh spot, a hold as the curtain parts, then a slow pull back as the legs slow. | The slowed footfall. The camera exits through the thigh to the runner. |
| 9 | Run fast enough, and lactate piles up faster than you can use it. That pace is your lactate threshold. | The runner on the track speeds up: stride rate rising, track lines streaking. Lanterns pour into the glass body from the legs, and the heart, brain and arm drain them. The amber level stays low and draws a flat glowing ribbon on the ground behind the runner. At one speed the level shoots up to the chest, the ribbon bends sharply upward, and a flag plants at the bend: "your lactate threshold". | Pulls out to a side-on tracking shot, then a slight tilt up the ribbon's bend to the flag. | The flag at the bend. |
| 10 | Training pushes that line, because you grow more tiny engines. | Dusk-to-dawn sweeps flash across the sky. With each one, new engines pop like popcorn inside the legs, heart and arm. The run replays: the old run becomes a faint ghost runner with its ghost ribbon. The new ribbon stays flat past the old flag, which pulls up and replants further along. | Holds the side-on track view, then a short dolly along the ribbon to the new flag. | The ghost runner beside the trained runner. |
| 11 | So lactate isn't trash. It's backup fuel, and fit runners burn even more of it. | Ghost and trained runner side by side. Lanterns slosh and pile up in the ghost, while the trained runner's engines gobble lanterns, glow brighter and pull ahead. Passing the track-side bin, the line 1 trash bag tips out and the amber drop rolls free. The trained runner scoops it up mid-stride and blazes gold down the lit track. | Tracks with the pair, then a final wide pull-out and up over the glowing track. | End frame: the runner a gold streak on the dusk track. It can loop back to the line 1 runner if wanted. |
