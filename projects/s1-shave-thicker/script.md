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
| 6.0 | But a razor only cuts the hair above your skin. | cut here: above the skin | The ghosts deflate; an amber line glows along the cut level just above the skin | built in code |
| 9.4 | The root that grows the hair sits deeper, and the blade never touches it. | living root | Cut to a section through the skin: layers, three follicles going down a few mm, the root at the bottom glowing amber; label "a few mm below the blade" | built in code |
| 14.2 | So why does stubble feel thicker? | | Section holds; the camera eases toward the stubs at the surface | built in code |
| 16.0 | A hair that's never been cut ends in a fine, tapered tip. | uncut: tapered | Cut to two hairs side by side on skin; the left one's long fine tip | built in code |
| 19.5 | Shaving slices it straight across, and leaves a blunt end. | shaved: blunt | The right hair is sliced; the top falls away leaving a flat blunt end | built in code |
| 22.6 | Same width. It just feels coarser. | same width | Steel caliper jaws close on the left hair, slide to the right one: amber edges, same gap; a soft pad brushes both tips: the fine tip bends away, the blunt end stays stiff and glows coral | built in code |
| 25.6 | Scientists tested this in 1928, and again in 1970. | 1928 · 1970 shaving tests | The two hairs, slow pull back | built in code |
| 28.9 | Shaving didn't change how thick, or how fast, hair grew. | no change | Same picture: both hairs the same width | built in code |
| 32.2 | The real change comes from hormones at puberty, right when most people start shaving. | puberty: hormones | Cut back to the skin: fine pale hairs thicken and darken into terminal hairs | built in code |
| 37.0 | So shave or don't. Your hair stays the same. | same hair, blunt tip | The blade sweeps again; time-lapse: the stubble regrows to the same width with blunt ends | built in code |

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

## Assets
| Asset | Source | Licence |
|---|---|---|
| Hairs, skin, follicles, section, blade, caliper jaws, pad | built in code | ours |
| (scouted, not used) "Realistic Safety Razor" by MasterYogurt; "Digital Measuring Caliper (Preciva)" by AleixoAlonso | Sketchfab | CC BY 4.0 |

## What the board changed
(after the board)
