# s1 Shave thicker (brief)

Status: board approved (v4 with fixes), mute stills pass and motion check running (2026-11-19). 3D explainer series, session 1 (the human body and health), video 3 (Matthew via the
coordinating session: "make one more video, a third mythbuster in your area"). Unsupervised: decisions logged here;
approvals go to fresh judge agents.

## Facts
- Format: Instagram Reel 9:16, 1080x1920, 30 fps, 30-45 s, captions on, goal reach.
- Voice m5 (`library/voices/m5/`); music Floating Cities ducked 10-12 dB; CC0 sfx-29-61 or synthesized only.
- Caption: no voice credit line (Matthew, 2026-11-19); the AI-label note stays.
- Skills updated from main (9bd773f) before starting: render probe and CPU guard, two-pass loudness in mux.sh,
  masked mute test (`mute_sheets.py`), motion_check without a bar, three hooks with `check_script.py`, analogies
  checked before the brainstorm, assembly checks for parts that touch.

## Decisions
- 2026-11-19 Topic: "Shaving makes hair grow back thicker": it doesn't; a razor cuts only the dead shaft above the
  skin, and the blunt cut end feels coarser than the hair's natural tapered tip. Why: a myth nearly everyone has heard,
  a stake for everyone who shaves, and a picture only a macro 3D scale can give (a razor through a forest of hairs, a
  cut-away to the root that never feels the blade, tapered vs blunt tips under a giant caliper). Not a repeat of
  s1-heart-middle or s1-knuckle-crack, and inside session 1's area.
- Rejected: tongue map (needs a tongue model; less of a stake), 10 % of the brain (overdone), blue blood in veins
  (skin optics hard to make real in three.js), gum stays 7 years (gross, weak picture).
- Hooks (video-script, three formulas, `check_script.py --hooks hooks.txt --wps 3.0`: 0 flags): chosen "Watch what this
  razor actually cuts." (Cold Open Demo: the film opens mid-cut). Alternatives: "In 1928, a scientist shaved legs for
  months." (needs the Trotter study confirmed) and "Shaved hair versus unshaved hair: same 0.1 millimetres wide."
  (Head To Head). The series' "Lots of people think ..." line becomes the second sentence.

## Plan (picture-first step 1)
- Angle: shaving cuts the hair, not the root; the stubble only feels thicker because of its blunt tip. Goal: reach,
  shares. Stake: everyone who shaves (or was told not to).
- Hook picture (0-2 s): macro skin landscape, hairs as tall tapered trunks; a giant steel razor edge sweeps through
  and slices them level with the skin. Already moving at frame 0.
- Key moments: (1) the cut: blade through the hair forest; (2) a cut-away through the skin: the living root (bulb,
  amber) 3 mm down, the blade passing far above it; (3) two hairs side by side, one with a natural tapered tip, one cut
  blunt, a giant caliper reads the same width on both; (4) the blunt stub regrows looking darker/coarser; (5) the
  1928/1970 test result.
- Thread: the blade (cut) -> the cut line on the skin -> the cut-away plane -> the two tips -> the caliper.
- Build or source: hairs, skin, follicles, the blade edge built in code (the lead, must change on cue); the safety
  razor (wide shot) and the caliper sourced.

## Assets (scout 2026-11-19; Sketchfab CC BY 4.0, caption credit)
- "Realistic Safety Razor" by MasterYogurt, sketchfab.com/3d-models/1305e997c73449379251bfdfd29b20fc, 19.7k tris,
  static. Chosen over two blade-only models.
- "Digital Measuring Caliper (Preciva)" by AleixoAlonso, sketchfab.com/3d-models/37f189663fb64847829c6f42cf95e90a,
  8.3k tris, static. Chosen over a vernier caliper (the digital readout can show a number).
- Model files stay out of git (`film/.gitignore`); rebuild with `find_asset.py` + `models-prep/prep.mjs` (see the
  s1-heart-middle `models-prep/README.md`).

## Guidance read
- 2026-11-19 (after merging main 9bd773f), step 1: video-script SKILL.md (new: three hooks, on-screen text, picture
  column, check_script.py), hooks.json, explainers.md#analogies, picture-first.md changes; animated-video SKILL.md (in
  full), direct.md and motion-principles.md changes (analogy check before the brainstorm; cuts reset state).
- Steps 4-5: assembly.md (new, in full), three.md, sourcing.md, realistic-3d README, ai-voiceover.md,
  remotion-pipeline.md changes (Sketchfab RootNode 100x scale, winding, chained shader patches, scene-wide state
  only in the shell, cut-away worlds, additive glows saturate).

- Board and review steps: animated-video review.md (in full: motion, judges, stills, fact-check, mute test), direct.md,
  motion-principles.md (one shot, one thread; hard cuts), board.py/snap.sh usage, mute_frames.sh and mute_sheets.py.

## Checks
- Board: v1 approve with fixes; v2 reject; v3 reject (22-34 s, 38-40 s); v4 approve with fixes, fixes checked on single
  stills (out/b10). Changes listed in script.md "What the board changed".
- Fact check: fresh agent (script.md). Added after the v2 judge: readout 0.14 mm (J Soc Cosmet Chem 34(7), beard hair
  mean 123-144 µm).
- Mute test, stills pass (88 captionless stills every 0.5 s, fresh judge, review.md prompt): recovered every claim
  (razor cuts above the skin, the myth, cut at the surface, root below the blade, tapered vs blunt, same width, blunt
  end feels sharp, 1928/1970 studies, puberty as the real cause, shaving changes nothing). Missed or broken, fixed: the
  13.5-15.5 s push-in read as abstract bars (camera kept wider); fingertip and readout cards ran off the frame or into
  the caption band; the cut top popped out (now tips over and lies on the skin); the test cards were dense ("studies:",
  "growth: not faster"); the second readout said nothing about sameness ("0.14 mm: same"); no closing verdict
  ("myth busted: same hair, blunt tip").

## Lessons for the skills
- A prop extruded long for a wide world (a 40 mm blade) swallowed the camera when reused in a close cut-away world: the
  blade vanished and the frame filled with glare. Size every prop to the world it is placed in, and check that no mesh
  contains the camera.
- InstancedMesh with non-uniform scale shades wrong (the instance matrix is not inverse-transposed for normals): flat
  hair tops scaled 20x in y looked domed. Grow a thing by sliding it out of the surface (translate along its axis) rather
  than scaling it.
- An instance "hidden" with scale (1, 0.0001, 1) still draws a flat disc that z-fights the ground (white rings). Hide
  with scale 0 on every axis.
- Labels on light 3D ground (skin, sky) need a dark backing pill; a text glow alone failed three times on the board.
- At macro scale an everyday object can't be shrunk: a 0.5 mm fingertip read as an egg twice. Show it at its true size
  as a surface (a wall of ridged skin pressing down).
- A study shown on screen needs its control on screen (unshaved next to shaved), or a muted viewer sees "two things grow".
- The hook read only when the camera sat ahead of the moving device, looking back at it through what it was about to
  cut; from behind, the blade was a grey slab.
- Every number on screen, including a prop's readout, goes through the fact check: "0.15 mm" reached the board unchecked.
- mute_frames.sh names stills fNNNN.png (frame numbers) but mute_sheets.py reads names as seconds: rename to s_<sec>.png
  (done by hand here; fix the template).
