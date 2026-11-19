# s1 Shave thicker: script (v0.2, picture-first)

**Idea:** a razor cuts only the hair above the skin, never the root, so it can't make hair thicker; stubble only
feels coarser because the cut leaves a blunt end instead of the natural tapered tip. **Goal:** reach (shares second).
**Format:** Instagram Reel, 1080x1920, 30 fps, ~40 s. **Voice:** m5. **Music:** Floating Cities. Picture events are
cued from words in `film/src/timeline.ts`; times below are estimates until the VO is aligned.

## Script

| Time | Spoken line | On-screen text | What the viewer sees | Capture |
|---|---|---|---|---|
| 0.0 | Watch what this razor actually cuts. | WHAT THE RAZOR CUTS | Macro: skin as a landscape, hairs like tall tapered trunks; a steel blade edge sweeps in from the left, already moving at frame 0 | built in code |
| 2.2 | You've probably heard shaving makes hair grow back thicker. | thicker? | The blade slices every hair level with the skin; the cut tops topple and fall; the stubs swell into coral ghosts ("thicker?") | built in code |
| 6.0 | But a razor only cuts the hair at your skin's surface. | cut at the surface | The ghosts deflate; an amber line glows along the cut level just above the skin | built in code |
| 9.4 | The root that grows the hair sits deeper, and the blade never touches it. | living root | Cut to a section through the skin: layers, three follicles going down a few mm, the root at the bottom glowing amber; label "a few mm below the blade" | built in code |
| 14.2 | So why does stubble feel thicker? | | Section holds; the camera eases toward the stubs at the surface | built in code |
| 16.0 | A hair that's never been cut ends in a fine, tapered tip. | uncut: tapered | Cut to two hairs side by side on skin; the left one's long fine tip | built in code |
| 19.5 | Shaving slices it straight across, and leaves a blunt end. | shaved: blunt | The right hair is sliced; the top falls away leaving a flat blunt end | built in code |
| 22.8 | Same width. It just feels coarser. | caliper · 0.14 mm · fingertip: the blunt end pokes | A steel caliper lowers in front of the left hair (named), readout 0.14 mm, slides to the right one: same gap; then a fingertip (a wall of ridged skin at this scale) presses down: the fine tip folds away, the blunt end meets the skin and glows coral | built in code |
| 25.9 | Scientists tested this in 1928, and again in 1970. | 1928 · 1970: unshaved vs shaved | Time-lapse: the unshaved hair (amber ring) and the shaved stub both grow from the root; an amber level line rises with both | built in code |
| 30.0 | Hair didn't grow faster, and in 1970, not thicker either. | not faster · 1970: not thicker; 0.14 mm | Same picture, level line still shared; on "thicker" the caliper reads 0.14 mm on the regrown stub | built in code |
| 34.6 | Hormones at puberty thicken hair, around when many start shaving. | puberty: hormones | Cut back to the skin: fine pale hairs thicken and darken into terminal hairs | built in code |
| 38.5 | So shave or don't. Shaving won't change your hair. | same hair, blunt tip | The blade sweeps again; time-lapse: the stubble rises from the skin to ~1.6 mm, same width, flat blunt ends | built in code |

## Look sheet

**Style.** Realistic 3D macro (styles/realistic-3d), with one luminous layer: the cut line, the root glow, the caliper
edges. Look pass: ACES once (exposure 1.0), RoomEnvironment PMREM on the blade, hair and skin, hemisphere fill,
vignette and grain (`Finish`, bloom 0.25).

**World and scale.** 1 unit = 1 mm. Hairs 0.08-0.12 mm wide (terminal hair; beard 0.09-0.23 mm), ~4 mm long, tapered
over the last 1.2 mm. Skin furrows ~1.5 mm cells. Follicles ~3 mm deep (anagen bulbs 2-7 mm).

**Light.** Key warm #FFE8D2 from top-left front, rim cool #A8D4F0 from behind right, hemisphere #F2DDD0 / #40241C.
Backgrounds dark warm (#1E0F0B).

**Colour meanings.** Coral #FF5A4E = the myth ("thicker?" ghosts, the blunt end that feels coarse); amber #FFB547 = the
answer (cut level above the skin, the living root, same width, no change); steel = the blade.

**Camera.** 24 mm in the hair forest (frame height 13.5 mm at 9 mm: a hair ~11 px wide, 4 mm tall ~570 px); 35 mm on
the section (frame ~8.6 mm tall: the follicle 3 mm ~670 px); 50 mm on the two tips (frame ~2.6 mm tall: a hair
~60-90 px wide). Hard cuts on "The root", "A hair that's", "The real change".

**Visual language.** Hair: standing -> cut (top falls) -> stub (blunt) -> regrown stub (blunt, same width).
Myth ghost: coral sleeve swelling around a stub. Answer: amber glow.

**Thread.**
| From | Move | To | Carrier |
|---|---|---|---|
| Blade | slices | the cut line above the skin | the blade's edge height |
| Cut line | cut down through the skin | the living root | the stubs at the surface (same place on screen) |
| Root/stubs | cut to | two hairs, one cut | the stub |
| Blunt end | caliper | same width | the jaws |
| Two hairs | cut to | skin, puberty | hair thickness |
| Blade again | regrowth | same stubble | the blunt tips |

## Claims to verify
1. A razor cuts only the hair above the skin; the root sits deeper and isn't touched.
2. An uncut hair ends in a tapered tip; shaving leaves a blunt end of the same width that feels coarser.
3. Tested in 1928 (Trotter, beard, growth rate) and 1970 (Lynfield & Macwilliams, legs: weight, width, rate).
4. Shaving didn't change how thick or how fast hair grew.
5. Hormones at puberty thicken hair (androgens: vellus -> terminal), around when people start shaving.

## Fact check (fresh agent, 2026-11-19)
Sources: Trotter 1928 Anat Rec 37(4):373-379 (via Scientific American: four men shaved part of the beard; "no evidence
that shaving accelerates the rate of beard growth"); Lynfield & Macwilliams 1970 J Invest Dermatol 55(3):170-2 (no
difference in width, coarseness or rate); Mayo Clinic hair-removal FAQ (blunt tip, coarse/stubbly; no change in
thickness, color or rate); Cleveland Clinic (cut at the shaft, root unaffected); StatPearls Anatomy, Hair (terminal
follicles in the deep dermis); AAFP 2019 (androgens: vellus -> terminal); AXA Health poll (19 % believe the myth).
| Line | Verdict | Change |
|---|---|---|
| 2 You've probably heard ... | holds (only ~1 in 5 believe it: no "most") | |
| 3 "only cuts the hair above your skin" | reword: a close shave can cut slightly below the surface (ingrown hairs) | "... at your skin's surface." |
| 4 root sits deeper, never touched | holds | label "a few mm below the blade" holds for terminal hair |
| 8 Same width | caveat | the caliper measures both shafts at the same height (jaws 0.05-0.27 mm above the skin), never tip against blunt end |
| readout "0.14 mm" | holds | J Soc Cosmet Chem 34(7): Caucasian beard hair mean 123-144 µm (scalp 71-80 µm); terminal beard hair proposed 90-230 µm (keratin.com). The modelled hair is 0.14 mm |
| 10 "didn't change how thick, or how fast" | reword: Trotter measured speed only | "Hair didn't grow faster, and in 1970, not thicker either." |
| 11 "right when most people start shaving" | reword: no source for "most" | "Hormones at puberty thicken hair, around when many start shaving." |
| 12 "Your hair stays the same" | reword: hair changes with hormones and age | "So shave or don't. Shaving won't change your hair." |
| pictures | hold | cut flush (never below the skin); regrown stubs keep the blunt end and the same width |

## Assets
| Asset | Source | Licence |
|---|---|---|
| Hairs, skin, follicles, section, blade, caliper, fingertip | built in code | ours |
| (scouted, not used) "Realistic Safety Razor" by MasterYogurt; "Digital Measuring Caliper (Preciva)" by AleixoAlonso | Sketchfab | CC BY 4.0 |

## What the board changed
- v1 (judge: approve with fixes, v2 required): hook opens mid-cut; ghosts held; section blade and depth bracket; caliper and
  fingertip named; the 1928/1970 test became an event; regrowth capped; labels inside the safe area.
- v2 (reject): blade missing from the section (camera sat inside the 40 mm extrusion); caliper two grey blocks; fingertip an
  egg; no unshaved control in the test; unverified numbers; labels without backing; hook blade unnamed; domed regrown tops
  (instanced non-uniform scale) and white rings (zero-height stubs z-fighting the skin).
- v3 (reject, 22-34 s and 38-40 s): fingertip still an egg -> a wall of ridged skin pressing down; caliper in front of the
  hairs, screen only with a number, readout on both hairs; level line kept to the cut; camera pulled back for the
  regrowth; end camera cleared of near hairs; labels staggered and anchored; "blunt" coral in the caption.
- v4 (approve with fixes, checked on single stills): fingertip wall kept below the captions; regrowth camera tilted so
  the unshaved tip stays under y 520; readout beside the regrown stub; result label lower; darker steel blade.
