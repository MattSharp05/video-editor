# Lactate run 01: build plan (v1)

Locked script: `../lines.txt` (v1). Beat sheet: `../pictures-pick.md` (lines.txt wins where they differ). Facts: `../research.md`.
1080×1920, 30 fps, one shot. Everything is drawn on one 2D `<canvas>` per frame (no three.js, no blur filters: glows are
radial gradients, grain is a pre-made noise tile), captions in the DOM. Deterministic: all motion from the frame number
and `random(seed)`; the runner's distance and stride phase are integrated once at module load from the beat times.

## Worlds (one camera path, the film breathes in and out through the right thigh)

- **Track** (outside): dusk sky (violet → peach, low sun, never black), far hills and stadium lights (parallax 0.1/0.3),
  infield, terracotta track with lane marks, one glass-body runner (bright rim, tinted glass, vessels, heart, brain).
- **Fibre** (inside the thigh, tagged "Illustration"): warm rose tissue, striped strands that squeeze on each
  footstrike, a lane of tiny engines, and the capillary (blood river) along the bottom with red cells and oxygen
  bubbles that never stop.
- **Body** = the track world with the camera close on the glass runner in slow motion (tagged "Illustration").

Passages between worlds are **zoom-throughs** on one point: the outside camera keeps zooming into the thigh while the
inside camera starts small and settles, scale-matched, with a glass-rim flash ring (a pass-through, not a cut).

## Language: one look per state, for the whole film

| Thing | State | Look |
|---|---|---|
| Sugar | travelling | white rounded cube, soft white glow (hero cube has a face) |
| Sugar | broken | two white halves split apart + small cream spark |
| Sugar half | burned | enters an engine door and vanishes; engine puffs 2-3 pale bubbles and a cream spark |
| Sugar half | surplus | white half stacked in a heap around an engine |
| Lactate | made | the white piece turns **amber** (the accent) and rounds into a glowing lantern |
| Lactate | travelling | amber lantern with a soft amber halo, bobbing |
| Lactate | burned again | lantern flies into an engine, engine flashes amber |
| Engine (mitochondrion) | idle/easy | bean with glowing cream stripes, rotor turning slowly |
| Engine | flat-out | rotor blur, shake, steam puffs, stripes brighter |
| Acid | present | spiky red sprite with angry eyes, red heat halo (heat only ever on these) |
| Leftovers | present | grey grit lumps jammed on the strands |
| Myth | — | black trash bag printed "lactic acid", flies |
| Runner effort | hard | fast stride, sweat drops, speed streaks on the track |
| Lactate level | in body | amber fill rising inside the glass torso; ribbon behind the runner at the same height |
| Threshold | marked | flag "lactate threshold" planted at the ribbon's bend |

Colour code: amber (#FFB23F) = lactate only (the lead), white = sugar, red = acid/heat, grey = leftovers, cream = energy
sparks. World colours are dusk navy/violet/peach and muted rose, kept dim.

## Thread (lead → move → next lead → carrier)

| # | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| 1 | runner sprinting | slow-mo push-in | trash bag in the glass thigh | the thigh (glass) |
| 1→2 | trash bag | pass-through the glass | bag, big | the bag (scale-matched) |
| 2 | bag | rips → transform | amber drop | the tear |
| 2→3 | amber drop | bursts into light, camera travels right | hero sugar cube | the drop's light along the lane |
| 3 | hero cube | snaps (split) | two halves | the halves |
| 4 | halves | enter engine, camera pulls back | engine field (a few amber pieces) | the hero engine |
| 5 | engines | flood, red-line | white heaps | the heaps |
| 6 | heaps | colour wave → lanterns, travel down | lanterns in the blood river | lanterns |
| 6→7 | lantern stream | zoom-through out | lanterns flowing up the body vessels | the stream |
| 7 | heart / brain / arm | gulp, sparkle, glow | thigh (still pulsing) | thigh glow |
| 7→8 | thigh | zoom-through in | lanterns as a curtain | lanterns |
| 8 | curtain parts | reveal | acid sprites + grit | the gap |
| 8→9 | slowed strands | zoom-through out | slowed runner | stride beat |
| 9 | runner speeds up | amber level + ribbon | flag at the bend | ribbon |
| 10 | days sweep, engines pop | flag pushed along | runner's thigh (engines) | flag/ribbon |
| 11 | trash bin | bag tips, drop rolls | runner scoops drop, gobbles lanterns | the drop |

## Decisions (made unattended)
- Line 1 shows the myth as waste (trash bag + flies inside a hard-pushing runner's thigh); no flames anywhere on lactate.
- Line 2's drop does not stay as an object: its light floods the fibre (carrier into line 3) so amber stays "lactate".
- Line 4: one in ~5 halves turns amber even at easy pace and is then pulled into an engine too ("made all the time").
- Line 10 "pushes that line": instead of a replay with a ghost (costly, two runs), the flag uproots and slides further
  along the track while the old ribbon stays as a faint ghost and the new one flattens; then the camera pushes into the
  thigh where engines pop in like popcorn. Same idea (more engines → line moves), one run.
- Line 11: the line 1 trash bag sits in a track-side bin; it tips, the amber drop rolls out, the runner scoops it.

## Timeline (machine clock, UTC)
- 14:16 start; voice job and music download started.
- 14:21 reading done; film/ set up; plan written.
