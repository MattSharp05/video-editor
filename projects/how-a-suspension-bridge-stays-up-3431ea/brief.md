# How a suspension bridge stays up (brief)

Broadcast routine video (routine "First routine test", slot 4, post_at 2026-11-27 14:35 UTC, approval: review),
video 3431ea91-f2da-4448-b55c-749793347138, made in one unsupervised session (STEP=all, broadcast-factory section 8).

## Goal and format
- Account @storytime_scroll. Genre: explainer. Goal: reach. Instagram Reel 1080x1920, 30 fps, aim 30-40 s.
- Idea: a suspension bridge hangs its road from thin vertical cables (hangers) on two huge main cables, which drape
  over the towers and are tied into heavy concrete anchorages at each end. The cables carry the load in tension and
  the towers carry it down in compression, so a light deck can span over a kilometre; each Golden Gate main cable
  bundles 27,572 steel wires.
- Hook (planner, bold statement): "A bridge this long should snap. Here's why it doesn't."
- Planner note: show the load path as glowing arrows through cable, tower and anchorage.
- Style: realistic-3d (three.js in Remotion). Hero assets: off (routine, nobody to approve).
- Voice: r3-m07, British documentary (Broadcast library). Credit: "Voice: AI (Qwen3-TTS)".
- Music: "Beauty Flow" by Kevin MacLeod (incompetech.com), CC BY 4.0, baked in and ducked under the voice.
- Routine rules (Matthew): "Read all the skills before starting." References: four Instagram reels (animations,
  style, colours, graphics, transitions).
- Reading level: about grade 3 (profile).

## Audience and stake
- Anyone who has driven over a long bridge or seen the Golden Gate and wondered what holds it up. No maths.

## Facts (to verify in the script step)
- Golden Gate Bridge: main span 1,280 m (4,200 ft); two main cables, each about 92 cm (36 3/8 in) across, each made
  of 27,572 parallel galvanised steel wires (61 strands); towers 227 m above water; opened 1937.
- Load path: deck weight -> hangers (tension) -> main cables (tension) -> over the tower saddles -> towers push down
  into the foundations (compression); the cables' pull at the ends is held by anchorages (Golden Gate: huge concrete
  blocks, about 60,000 t each).
- Steel is far stronger pulled (tension) than a long beam is bent; that is why the span can be so long.

## Guidance read
- 2026-11-27, intake: broadcast-factory SKILL.md (main), CLAUDE.md, ~/.animated-video/profile.md,
  ~/.video-script/profile.md, animated-video SKILL.md, video-script SKILL.md, references/explainers.md, animated-video
  references/direct.md. Precedent: factory/the-rope-around-the-earth-a6781a (same routine, style and voice; film
  scaffolding copied from it) and its brief.
- 2026-11-27, steps 1-6: video-script hooks.json (via check_script.py --hooks), check_script.py; animated-video
  styles/realistic-3d/README.md, references/look-pass.md, three.md, ai-voiceover.md, review.md; real-sfx
  references/studio-sound.md.
- Skipped, with reason: motion-principles.md and remotion-pipeline.md (read in the sibling films of this routine the
  same day; the copied template follows them), sourcing.md (generic bridge built in code; no found model needed),
  characters/water/compositing/assembly (none in the film), hero-assets (off for routines), avatar-cutins (no avatar).

## Decisions (unsupervised; logged)
- Pictures: no brainstorm agent (time and the planner's own picture note: "show the load path as glowing arrows
  through cable, tower and anchorage"). Picks: the impossible "no cables" beat (towers and cables fade, the bare road
  sags and breaks, then rewinds and the hangers drop to catch it); comet pulses that travel the way the load goes;
  a piece of main cable cut open showing 61 strands x 452 wires that light from the centre as the count runs.
- Colour language: cyan = tension (hangers, main cables, side spans into the anchors, the wires); amber =
  compression (down the tower legs); red = the break.
- One world (strait at golden hour), hard cuts on the words. Bridge: Golden Gate proportions (1,280 m main span,
  227 m towers, hangers every 15.2 m) built in code, labelled "(stand-in model)" on the hook.
- VO: say.py r3-m07, 11 lines, 47.2 s; transcript matches the script word for word (Whisper's "27 ,572" merged into
  one word by fix_words.py).
- Music: Beauty Flow from incompetech (sound/src). Stems: voice -10.1 LUFS, ducked music -21.7 (11.6 dB under);
  mix -14.8 LUFS. 25 cues (2 beds, CC0 library + one synthesized wind bed). Not listened to (measured only).

## Checks before the render (2026-11-27)
- Script: check_script.py flags left: slot timing (timing comes from the VO) and "two" shown as two cables/towers in
  the picture rather than as a digit. Grade 1.4. Fact check (fresh agent): five wordings fixed (script.md).
- Stills: four rounds. Fixed: whole scene underexposed (exposure 0.16 -> 0.3, sun 9 -> 15 deg); wide shots too far
  (bridge a sliver on the horizon; now tilted to climb the frame diagonally, solved by projecting the anchorages);
  tower amber glow hidden inside the legs (moved to the outer faces); deck close-up camera below the road; a 300 m
  cliff along the shore (terrain ramp); beige snow-like far hills.
- Mute test, stills pass (fresh judge, 1 still/s, captions off): recovered the bridge, no cables -> the road breaks,
  it hangs, load up the hangers, tension, compression down the towers, the concrete anchor, 27,572 wires in one main
  cable, and the recap. Fixed: unreadable "stand-in model" note, "PULL ->" tag (now "PULLED TIGHT"), the tower-top
  shot unexplained (tag "CABLE OVER THE TOWER"), anchor tag at the frame edge ("ANCHOR HOLDS CABLE"), wire close-up
  overfilling the frame (camera further back), static 8 s recap (now a sweeping pull-back), sag too small (120 m).
  Not changed: the cut cable piece floats beside the real cable (labelled "cut open (drawn)").
- Quarter-scale preview + motion_check: skipped for time (the 0.25 preview ran past 15 min on the CPU); motion is
  checked on the full cut instead. Probe: 30 frames of the recap in 78 s at concurrency 4.

## Checks on the render (2026-11-27)
- v1: 1,420 frames in 5 chunks of 300 at concurrency 4 (12:21-13:02 UTC, ~1.7 s/frame), muxed 49.0 MB, -14.8 LUFS,
  true peak -1.8 dBTP. Flicker scan: luma steps only at the cuts (3.90, 10.97, 16.07, 23.57, 28.00, 32.33, 38.93 s).
- Motion readout (mc_readout.py, no bar on disk): median 14 movers/s (bars 11-20); slow seconds 0-9 (wide shots, the
  slow sag), 36-38 (the wire face held still once the count finished), 44-45 (end of the recap pull-back).
- Mute test on v1 (fresh judge, caption band blacked out): every claim recovered (no cables -> snap, it hangs,
  hangers, tension, cable over the tower, compression, anchor holds cable, 27,572 wires in one main cable, recap).
  Fixed by partial re-render (v2, frames 0-117, 329-643, 970-1167): "1,280 M" now "1,280 M SPAN", stand-in note
  reworded and enlarged; "HANGERS HOLD THE ROAD" card on the unlabelled hanger glow; "PULLED TIGHT" clipped at the
  right edge; wire face cropped at the top (camera further back) and held still (the piece now turns slowly, camera
  drifts); "61 strands x 452 wires (drawn)" explains the count against the drawn strands.
  Not changed: towers vanish without a visible removal and the broken road resets without a transition (the cards
  "NO CABLES: SNAP" and "IT HANGS" carry both); the dark shape on the far hill (the far tower's shadow); the short
  posts on the deck (street lamps); the cut cable piece floating beside the real one (labelled "drawn"); recap tags
  close to the bridge.
