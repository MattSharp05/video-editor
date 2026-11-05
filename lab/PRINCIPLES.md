# Motion principles for app videos (draft v0.2, 2026-11-05)

App-agnostic. These are the rules any app video follows; the techniques are a vocabulary for
inventing new shots, never shots to copy. Trip is only the test subject while the vocabulary forms.
Format: always 9:16 (Reels / TikTok), safe area x 60–1020, y 250–1500.

## 1. One shot, one thread (Matthew, 2026-11-04)
At every moment there is exactly one thing the eye follows: **the lead**. The film never cuts away
from it. Every new scene grows out of the lead, so the viewer never has to find their place again.

1. **One lead at a time.** It carries the accent and is the brightest, sharpest, most-moving thing in
   frame. Everything else supports it or waits.
2. **The next frame grows from this one.** Nothing appears from nowhere. A new scene is born from the
   lead by one of these moves:
   - **Transform**: the lead becomes something else (a point becomes a cursor that types a sentence).
   - **Travel**: the lead moves and the camera rides with it (an object down a timeline).
   - **Open**: the lead opens and reveals the next world (a pin's photo becomes the screen).
   - **Pass through**: the camera flies into the lead and comes out the other side.
   - **Pull back**: the camera retreats and the lead turns out to be part of something bigger.
   - **Split / merge**: one becomes many (a caption becomes four places) or many become one.
3. **Hand-offs are relays.** When the lead changes, the old one hands focus to the new one at a touch
   point. Every transition names its carrier; one that can't is a cut, and cuts are not allowed.
4. **Motion carries through.** The new lead starts in the direction and speed the old one was going.
5. **The camera serves the lead.** It keeps the lead inside the safe area and never lets it leave
   frame; zooms never crop the thing being shown (Matthew, S2).
6. **Rhythm from change, not cuts.** Pace comes from changes of scale, speed and state, landing on
   the words.
7. **No hidden cuts.** Swapping a 3D scene for a flat overlay mid-move is a cut (what made S5 feel off).

Planning artefact: before any shot is built, write the film's **thread**: one line per hand-off,
lead → move → next lead, with its carrier.

## 2. Material: the interface is real glass (Matthew, 2026-11-04)
- Interface layers are physical glass: thickness, a bright edge where light catches, frosted blur of
  what is behind, soft contact shadows. "More glassy" (S1, S2), "glass" (round note).
- 3D components look real: depth, light and shadow, not flat cards in space.
- Motion is fluid: no mechanical stops; things ease into each other (S2, S3, S5).

## 3. Emphasis
- Emphasise words by lifting, glowing, weight or colour, **not boxes** (Matthew, S3).
- A scan must look like reading: it leaves highlighted words behind it as it passes (S3).

## 4. Returns
- Anything that leaves its place returns smoothly and lands (S6): no snap back.

## 5. One visual language per film (Matthew, 2026-11-05)
Before building, declare the states things can be in and the one look for each state (a short
table: idle, being read, found, travelling, placed, pressed...). Then:
- Every item of one kind passes through the same states, in the same order, with the same look.
- A look never changes meaning during the film; the accent means "follow this / found / chosen".
- A new look is shown clearly once before it is relied on; a second idea that needs its own look
  (e.g. "not found") is cut from short reels unless it is the point.
- Check: list every state change in the film and confirm each item of a kind goes through the same ones.
Example: `round-03/LANGUAGE.md`.

## 6. The background is the app's world (Matthew, 2026-11-05)
Never an empty black slide. The background tells the same story as the foreground at a bigger
scale, quietly:
1. **Same story, bigger scale**: the foreground is the detail; the background is the context (for
   a travel app: the globe and the journey; finance: money flowing; fitness: terrain; messaging: a
   network). Finding "the world of the app" is part of app intake.
2. **It never competes**: darker, softer (blurred) and lower-contrast than the lead; the accent
   appears in the background only as a dim echo of what the lead is doing.
3. **Slower**: about a fifth of the foreground's speed; drifts with the camera for depth.
4. **Continuous**: it never cuts; it changes on the thread's beats.
5. **It gives the glass something to show**: glass on black reads as nothing.
Reference: @charles.zhengg's "how I made it" reel, where the seafloor and the cable with a travelling
light run behind the phone and continue inside its screen.

## 7. Panes never intersect (Matthew, 2026-11-05)
Glass cutting into what's behind it reads as broken. Every pane keeps a gap to its neighbours larger
than its thickness plus half its width x sin(its tilt); folded panes rest a few px apart, never on one
plane; moving pieces pass in front of panes, never through them.

## 8. Sound follows the visual language (2026-11-05, round 4)
- Every state in the language table gets one sound, used every time it happens (found = a soft pop, rising in pitch
  place by place; placed = a soft drop, rising the same way; layers arrive = a glass ping; pressed = a click;
  confirmed = a chime). A camera move gets a whoosh sized to the move.
- Times come from the animation's own frame numbers (an event list written from the code), never guessed from the
  picture; a one-shot film has no cuts, so frame-analysis "sync" warnings are false alarms there.
- Every sound has a visible cause; restraint (about 7 weighted events per 10 s here); vary repeats (pitch or file).
- A quiet ambience bed from the background world (city at night for the Vegas globe) when there is no music.
- Two versions until a voiceover exists: effects only, and effects over a music bed ducked under them.
- Tooling: the real-sfx skill (vendored at `.claude/skills/real-sfx`), library in `library/sfx/` (CC0 only).
  Claude can't hear: every round lists the moments Matthew should listen to.

## 9. Matthew's ear picks; Claude places (2026-11-05)
- Claude can't hear, so sound and music are chosen by Matthew from a shortlist and placed by Claude.
- The Sound Picker (https://claude.ai/artifact/TWwTfAZjC1jY7i8ybeH9km, source `lab/sound-picker/`) holds 16
  recurring categories (tap, select/found, appear, land, lift, confirm, notify, toggle, typing, error, swipe, send,
  small move, camera move, background bed, music), four level-matched options each, softest first.
- Picks map forward through `lab/sound-picker/palette.py`: (1) each pick is that category's REFERENCE, not a
  sound to reuse ("not the same sounds each video, but this sort of vibe"): each video picks fresh sounds closest to
  it; (2) the measured character of all picks (brightness, ring, attack, length) is his profile, and new candidates
  are ranked by distance to it; (3) options he passed over are pushed down; (4) loves are mirrored into real-sfx's
  `taste.py` so its auto-pick ranks them first.
- Default direction until the picks exist (round 4 note): subtle, soft, dark, dry; no bells, clinks or chimes;
  music calm and sparse, never playful.

## Techniques (round 1 verdicts)
| Technique | Says | Verdict | Notes |
|---|---|---|---|
| Exploded interface | here is what this screen is made of | keep | more glassy |
| Component macro | this one control does the work | keep | more glassy, more fluid; always fully on screen when zoomed |
| Under the hood | what the app actually reads, and where it goes | keep | scan must look real; emphasis without boxes; more fluid |
| Map becomes a floor | your day, laid out as a place | keep | — |
| Push-through | go deeper into this one thing | change | dive and hand-off not smooth; needs glass, floating parts |
| Icon performs its verb | packed, ready to go | keep | the return to its place must be smooth |

Taste log and per-study details: `TASTE.md`.
