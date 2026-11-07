# Cat landing 01: report (v1)

Built unattended. Matthew asked for the whole film to be made without his approval. Nothing was posted or uploaded.

## Deliverable
- **File:** `projects/cat-landing-01/renders/cat-landing-01_v1.mp4` (git-ignored). Delivered through this session's file delivery.
- **Format:** 1080×1920 at 30 fps; 51.07 s (1532 frames, matching `ceil(total × 30)`; total = last word 49.79 s + 1.25 s tail).
- **Video:** H.264 at crf 18. **Audio:** AAC 192k, 48 kHz.
- **Loudness**, measured on the final MP4 (ebur128): −14.1 LUFS integrated, true peak −2.2 dBTP.
- **Music under the voice**, measured from the stems: 10.1 dB below the voice while it speaks, rising in the pauses.
- **Stills:** `stills/v1_sheet.jpg` (13 key frames of the final) and `stills/v1_t*.jpg`; first board `stills/board_v1_sheet.jpg`.

## The film
Miso is an original orange tabby. She swats a slice of toast off a sunny windowsill and falls after it. The whole film is one shot riding the fall down a tall, warm kitchen wall: shelf, clock, framed pictures, a hanging plant, a calendar, and a sunbeam full of dust.

1. **Myth.** Her tail spins like a helicopter rotor. Thought bubbles with doodled rotor-tails rise, tagged "myth?".
2. **No tail.** A grey Manx (tagged "no tail") drops past and flips neatly. The rotor sputters and Miso flops back, embarrassed.
3. **Inner ear and eyes.** We go in through the ear to a cockpit. Inner-ear loops slosh. The portholes ("eyes") show the floor upside down. A tiny pilot cat turns the UP dial and pulls a lever. We leave through a porthole into her eye.
4. **Nothing to push on.** She paddles in the dust ("air"), a chalk wall crumbles at her touch ("nothing to push on"), and she curls under a "?".
5. **Bend.** The curl becomes a V at the glowing waist ("middle"). The halves get teal and violet rims ("front", "back"), and turn rings with orbiting beads appear.
6. **Tuck and turn.** Front legs tuck and the front half turns ~190° ("a lot!"). The back legs stick out and the back turns ~10° the other way ("barely").
7. **Swap.** Back legs in, front legs out. The back half turns ~200° to catch up while the front gives back ~7°, and the halves click together.
8. **Half a second.** A fan of afterimages and a stopwatch: the flip zips through in 12 frames ("flip < ½ second").
9. **Landing.** The floor rushes up, she reaches down, then bends to land softly on the rug with dust puffs. The toast flops beside her.
10. **Warning.** She looks serious under a gentle "ouch" thought bubble (a cartoon cat with a plaster, tagged "can get hurt"). She raises a paw whose pad reads "never / drop a cat". A hand then gives her a chin scratch (purr, hearts). Then the camera tilts up the wall to show the height.
11. **Recap.** A ghost replays the flip down the wall, and the verbs stack up: bend · tuck · twist · swap · lands. Miso leaps back to the sill, and the last frame matches frame 0, so the Reel loops.

On-screen honesty tags: "Slowed down" (lines 2–8), "Simplified" (lines 5–7), "Replay · Not to scale" (recap).

## Checks
- **Script:** `lines.txt` was used unchanged.
- **Voice:** AI, Qwen3-TTS cloned from the approved design-m2 clip (seed 7, every line). Line-by-line alignment matched the script on 11 of 11 lines, so `words.json` needed no fixes.
- **Motion check** against the Grand Canyon 01 readout (never re-rendered):
  - Quarter preview: first run, movers median 20 vs the bar's 18, with seconds 39 and 41 flagged. After adding settling dust, a tail swish and a head tilt, it passed (20 vs 18; seconds with ≤2 movers: 0% vs the bar's 11%).
  - Final (downscaled): movers 19 vs 18; second 41 is flagged. It is the warning beat, held on purpose so it reads: the cat looks serious under the "ouch" bubble while her tail, head and the dust still move. I kept it as a defensible second.
  - Change over 2 s is lower than the bar (median 0.21 vs 0.36). That metric is not a fail criterion, but the film changes its picture less than Grand Canyon 01.
- **Mute test 1** (fresh agent, captions off, 2 fps sheets): it recovered 8 of 11 claims.
  - Missed or partial:
    - the myth bubbles meant nothing to it;
    - it only guessed "nothing to push on" from the AIR tag;
    - it confused ½ second with the toast tag;
    - it missed "can get hurt / never drop a cat" (it read the hand as a fist bump).
  - It also flagged a worried tear that lasted ~12 s as distress, and the tiny honesty text.
  - All of these were fixed.
- **Mute test 2** (second fresh agent) on the fixed shots, 0–16 s and 32.5–45 s: every targeted claim was recovered. Three of its notes were also fixed:
  - the wall clock raced during "Slowed down";
  - the hand covered "drop a cat";
  - the recap looked like a second fall.

  Not re-judged after those last three fixes; they were checked in stills only.
- **Stills:** checked at every beat (5 rounds) plus full-size hero frames. Frame 0 is legible and already moving (she is batting the toast). The last frame matches frame 0.
- **Temporal check:** I looked at the consecutive-frame strip of the fastest second (the 33.3 s zip) and found no popping. In the YAVG brightness readout, the largest jumps are explained:
  - frame 1: the caption scrim fades in;
  - 11.3 s: the cockpit exit;
  - 43.4 s and 49.5 s: deliberate camera whips (the tilt up the wall and the leap back to the sill).
- **Safe zones:** captions sit at y 250–470 over a warm scrim; the honesty tag is at y 1460.
- **Mux:** padded audio and `-t`, not `-shortest`. The frame count was checked.

## What is synthetic or credited
- **Voice:** AI (Qwen3-TTS, a clone of Matthew's Voice Picker pick design-m2).
- **Music:** "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0.
- **Sound effects:** CC0 `library/sfx/cstack-cc0` (pop-soft, whooshes, bubbles, underwater, servo, relay click, tile clicks, padlock click, clock tick, impact) plus synthesized noise (the tail-rotor whop and the purr). 29 cues; see `film/sound/cues.json`.
- **Art:** all drawn in code, original. There are no known characters, logos or brands.

## Instagram caption (draft)
> Why do cats land on their feet? 🐈 Not the tail (cats with no tail do it too). Inner ear + eyes find "up", then the
> cat bends in the middle, tucks one end to spin it, swaps, and lands softly, all in under half a second.
> Cats can still get badly hurt in falls: never drop a cat, and keep window screens closed.
> Simplified and slowed down. Real cats mix "bend and twist" with "tuck and turn"; the tail helps a little.
> Voice: AI. Music: "Floating Cities" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0.

## Open issues
- **Sound, unheard.** Nobody listened to the mix; all audio checks are measurements. Moments to listen to:
  - the tail-rotor whop (1.6–4.5 s);
  - the cockpit slosh (7.6 s);
  - the landing thump (37.35 s);
  - the purr (42.85 s);
  - the five recap pops (45–48.7 s).
- **Toast joke.** The toast lands beside her, but the art shows its buttered face either way, so a "butter side down" joke doesn't read. It isn't in the script; the toast is a prop and a timing gag.
- **Thin second.** Motion check second 41 is flagged (see Checks).
- **Clutter.** The second judge found 2.5–5.5 s crowded (rotor disc, bubbles, Manx, tags) and the rotor disc unclear on its own.
- **Physics.** Simplified, and tagged as such. The film shows tuck-and-turn with the bend; real cats mix both models (research.md).

## Skipped checks
- No second mute round after the three final fixes (clock, hand timing, replay tag); they were checked in stills only.
- No determinism double-render. Everything is driven by the frame number and seeded random values, so none is expected.

## Errors, rewrites and redesigns (machine clock, UTC)
- **19:33 – stills round 1.** The cat was too small through the mechanism. The recap at a 0.4 wide was unreadable. The hand covered the face. Fixed at 19:37–19:39: zoom 1.5–1.7, the recap camera follows the ghost at 0.75, a "?" over the curl, the "never" paw drawn in front of the head, the camera follows the leap.
- **TypeScript:** a duplicate-prop error on the afterimage spread was fixed by reordering.
- **19:40 – motion check.** Seconds 39 and 41 flagged; fixed with settling dust, a tail swish and a head tilt (PASS at 19:43).
- **19:42 – mute test 1.** Four claims missed or partial; fixed 19:43–19:45 with tags, the "ouch" bubble, the pad text, a shorter tear and a bigger honesty tag.
- **19:46 – mute test 2 notes.** Clock, hand and replay fixed. The first full render, already running, was stopped because the clock fix touched most frames. Re-rendered at 19:47 (99 s).
- **Process note:** a polling `sleep` was blocked by the harness; I waited for notifications instead.

## Timeline
See `film/PLAN.md` → Timeline. In short (UTC):

| Time | Step |
|---|---|
| 19:25 | Start; voice job and music download |
| 19:26–19:31 | Read; rig + model sheet |
| 19:31 | Pick arrived |
| 19:32 | Voice aligned |
| 19:33–19:39 | Build + 3 stills rounds |
| 19:40–19:43 | Preview + motion |
| 19:42–19:47 | Two mute tests + fixes |
| 19:47–19:49 | Full render |
| 19:50–19:52 | Mux, loudness, checks, delivery |

## Production analytics
`analytics.py` over this session's transcript (phases split at 19:25 / 19:33 / 19:40 / 19:47):

| Phase | Minutes | Output tok | Cache read | Cache write | Tool calls | Subagent in/out |
|---|---|---|---|---|---|---|
| Setup (read, VO, rig) | 8.0 | 38,969 | 3.96 M | 122 k | 30 | – |
| Build (film, stills) | 7.0 | 32,432 | 3.36 M | 56 k | 17 | – |
| Checks (motion, mute ×2, fixes) | 7.0 | 19,176 | 6.40 M | 37 k | 24 | 655 k / 7.3 k |
| Render + deliver | 4.4 | 6,663 | 3.79 M | 19 k | 13 | – |

The two mute judges reported about 115 k and 105 k tokens each.
