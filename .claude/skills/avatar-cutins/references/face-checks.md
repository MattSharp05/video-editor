# Checking face clips

Check every clip before it goes into the composite. Look at stills, not playback: sample frames at the slot's in point,
middle and out point, plus one frame per spoken word you want to check.

| Check | How | If it fails |
|---|---|---|
| **Same person** | Put the clip's mid frame next to the master ref and the face pack, then look at skin tone, asymmetry, marks and hairline. | Re-roll once. If it fails again, lower the motion in the prompt or use the fallback model. |
| **Mouth in sync** | Check frames at a few plosives (p, b, m) from words.json: the lips should be closed or nearly closed. | Make sure the slice comes from the clean VO stem. Then re-roll. |
| **Artefacts** | Look for teeth smearing, a flickering iris, extra fingers or hands, ear or earring warping, and the background breathing. | Re-roll. Shorten the slot if the artefact appears late in the clip. |
| **Framing and light** | Compare against the profile's `framing` and setting; every slot in one film must match. | Fix the master ref or setting ref, not the clip. |
| **Length** | The clip should be at least as long as `clip_out − clip_in` (handles included). | Re-run the slot. Some models trim silence at the end, so the handle audio is padded with room tone. |

## Prompting talking clips
Restraint keeps identity (adapted from 0xAnni's `video-kling.md`):
- **One action:** "looks into the camera and speaks."
- **Small life:** subtle blinking and breathing only.
- **Static camera:** write "static camera" twice. Models ignore it when it's said only once.
- **Big motion breaks the face.** Head turns, hands near the face and walking all do this.
