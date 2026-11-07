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
- 14:24 TTS done (11 lines, ~25 s each); assemble.py's whisper step failed (PyAV 19 dropped `metadata_errors`): pinned
  av==16.0.1 in the voice venv; whole-file whisper then hallucinated the first 16 words, so wrote `vo/align_lines.py`
  (per-line transcription, offset by line_starts): all 11 lines MATCH, 149 words, last word 54.02 s → total 55.22 s.
- 14:27 bar render (grand-canyon-01, quarter scale) started in the background.
- 14:31 first stills sheet (36 beats). Fixes: drop and flag text drawn with a colour array (invisible) → string colour;
  bag halves clipped off-screen (clip rect in wrong space); bin invisible on the hills → lit grey-teal bin; flag and
  bend off-screen in line 9 → slower world speed on the threshold run (cadence + streaks carry the speed) and a camera
  that frames bend and runner together; bin out of reach in line 11 → slower world speed until the scoop; flag faded
  after line 10; body lactate level cleared after training; hard-edged path light → soft glows.
- 14:38 second full sheet clean. 14:39 mix.py: 34 cues; music 12 dB under speech, ~4 dB up in pauses (stems measured).
- 15:26 the bar render (full 77 s Grand Canyon, quarter scale, software WebGL, sharing cores with my stills) hit the
  60-min background limit unfinished and was stopped. Decision: render only its first 20 s (frames 0-599) as the bar;
  motion_check compares per-second statistics, so a 20 s slice of the accepted film is a fair baseline.
- 15:37 own preview v1 rendered (11 min). Self-readout before the bar: median 26 movers/s, 0 seconds with <=2 movers;
  thinnest: 38-42 s (threshold run, world slowed to keep the flag in frame) and 49-54 s (ending, slowed for the bin).
  Redesign: runner back at full speed (track ticks, streaks and parallax move again), the ribbon drawn compressed x0.2
  behind the runner so the bend and flag stay in frame, camera frames flag + runner, flag cloth trails left of its
  pole (no longer covers the runner), amber spark trail behind the gold runner in the ending.
- 16:01 bar slice done (24 min for 20 s). 16:12 motion_check v2: film median 25 movers vs bar 20, <=2 movers 0% (bar 0%),
  but 12 seconds below the bar on both movers and 2 s change: 26, 28, 38-41, 44, 49-51, 53-54 (runner small and alone
  in a wide frame; slow-mo body view). Redesign: runner framed bigger until the bend (z 0.9) and in the ending (0.95,
  wide only at the end); in line 9 lanterns visibly drain from the torso to heart, brain and arm while more pour in;
  foreground track-side posts (parallax 1.35) whip past outside; body view less slow (0.4) with denser lantern flows;
  flies scatter from the tipped bin.
- 16:25 motion_check v3: film median 26 movers vs bar 20, <=2 movers 0%; flagged only 41 s (14 movers, the amber level
  shooting up and the ribbon bending) and 50 s (15 movers, bin tipping, bag falling, flies, drop rolling). Both sit just
  under the bar's quarter mark (16) with a state change on screen; kept as defensible.
- 16:26 full render started (render.sh: crf 18, concurrency 3, two-pass loudnorm + limiter).
- 16:38 full render (13 min): 1657 frames, -14.1 LUFS, -2.2 dBTP. YAVG flicker scan: one-frame spike at frame 728 (outside
  zoom term double-counted in the 0.4 s before the second passage) → fixed, frames 700-735 re-rendered and overlaid.
  Spike gone, seams smooth. Day sweeps (43-46 s) are deliberate smooth brightness ramps.
- 16:43 delivered renders/lactate-run-01_v1.mp4; REPORT.md written.
