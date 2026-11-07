# Cat landing 01: picture picks

Inputs: `pictures-brainstorm.md` (written against an earlier draft) and the locked `lines.txt`
(11 lines, ~52 s, 9:16 Reel, 3rd-grade level). Where they differ, `lines.txt` wins. The changes
that matter: line 5 is now "each half can turn **a different way**" (counter-rotation, not just
independence), line 6 is "turns a lot / barely turns" (not "fast / slow"), and line 9 is "**reaches
its legs down** and bends them".

## The film in one sentence

One orange cartoon cat, Mochi-style but original (big amber eyes, one white sock, a cream belly
patch that tells you at a glance whether she's upside down), slips off a sunny kitchen windowsill
while swatting a slice of toast. Time goes into slow motion for the explanation, the camera rides
the fall with her, she lands, warns us, and jumps back onto the sill, so the last frame loops to
the first.

## How the picks were judged

Each beat was scored on four things. **Clarity**: could a muted viewer work out the mechanism?
**Surprise**: would someone screenshot it? **Spectacle**: several things moving on their own,
scale, light. **Cost**: one builder, about 90 minutes, Remotion on 4 CPU cores with software
WebGL.

Decisions that apply to every beat:

- **2D SVG only, no three.js.** Software WebGL on 4 cores would eat the render budget, and the
  one thing that needs 3D (each half rolling about the spine) has a cheap 2D stand-in. The
  **coin-roll trick**: each half is a group with `scaleY = cos(roll)`, and it swaps between back
  art (orange with stripes) and belly art (cream patch) when the cosine changes sign. Front and
  back halves each get their own `roll`, joined at a waist pivot that can bend. That one rig
  covers lines 1–2 and 5–11.
- **Two props carry the whole film.** The **toast** falls with her the whole time, tumbling
  slowly. It keeps the background alive, sets up the timing joke in line 8, and pays off in the
  loop. **Sunbeam dust motes** fill the air from line 3 on. They are hundreds of particles, each
  on its own drift seed, so they count as many movers, not one field. They give the frame light,
  and in line 4 they *are* the air.
- **Labels.** One printed word on each key object the voice names, the first time it appears:
  a small hand-lettered tag that pops in with a tick, sticks to the object, and fades after about
  1.5 s. Lowercase, one font, always on the object, never in a caption bar. The cat herself needs
  no tag (she is the star and unmistakable).
- **The mechanism acts.** No arrows on a still picture. Turning is shown by **turn rings**: a
  thin ellipse around each half with bright beads orbiting it. The beads move only while that
  half actually turns, at that half's speed and in that half's direction, so the rings *are* the
  motion.
- **Worlds.** There is one change of world: the trip inside the head (line 3). It earns its place
  because the inner ear can't be seen from outside, and because we go in through one point (the
  ear) and come out through another (the eye). Everything else stays in the one kitchen and the
  one fall.

## Beat-by-beat reasoning

**1. Myth (tail flips it).** Pick: the cat falls upside down, her tail spins like a helicopter
rotor (whop-whop blur) and she flips, *plus* a crowd of thought bubbles rising from the bottom of
the frame, each with a tiny doodled tail spinning inside. The rotor makes the myth instantly
readable and a little silly. The bubbles make "lots of people think" a visible crowd and add a
dozen movers. Rejected: the crayon "TAIL = FLIP" (a static diagram) and the wind-up key (cute, but
it doesn't read as falling).

**2. No tail.** Pick: the star freezes in slow motion. A grey Manx cat (tagged "no tail") drops
past her at normal speed and flips neatly. The thought bubbles pop one by one, the rotor
sputters, and the star's tail droops, embarrassed. This is literal and clear. It also keeps the
star's tail, which we need later: the tail helps a *little* (see line 7), so firing it entirely
(the "pink slip" idea) would overclaim. Rejected: the lineup of three cats (strong, but three rigs
for one point) and scissors (a cat body part being cut is the wrong tone).

**3. Inner ear and eyes.** Pick: push into the twitching ear and arrive in a tiny cockpit inside
her head. Three glass fluid loops (tagged "inner ear") slosh with suspended sparkles. Two round
portholes (tagged "eyes") show the kitchen floor upside down at the top. A mini pilot cat in a
headset watches both, spins an "up" dial until it points at the real floor, and pulls a lever. We
leave through a porthole and become her real pupil rolling toward the floor. This combines the
literal canals (clear) with the control room (surprising, and many movers). Runner-up: the spirit
level (clear and cheap, but a single bubble is thin spectacle). Cut-down if time runs short: drop
the pilot and keep the loops, portholes and dial.

**4. Nothing to push on.** Pick: pull wide into the sunbeam. Clouds of dust motes swirl (tagged
"air"). She paddles. A chalk-line wall and a dotted ladder appear within reach, and they crumble
and blink out the moment her paws touch them. On "how can it turn?" her body curls into a
question-mark shape, and that curl *becomes* the bend in line 5. The vanishing handholds make
"nothing to push on" a feeling, and the question-mark body is the screenshot. Rejected: the
office chair and the astronaut (each a new world and a new character for one line).

**5. Bend in the middle.** Pick: the question mark straightens into a V at the waist, which glows
as a joint (tagged "middle"). The two halves tint slightly (front warm gold, back deeper orange;
tagged "front" and "back"), and their turn rings spin in **opposite** directions at the same time.
This is literal, and it now matches the new line. Runner-up: the pepper grinder (good for "each
end turns", but it loses the cat for a whole line).

**6. Front tucks, turns a lot; back sticks out, barely turns.** Pick: literal, plus two tiny
figure skaters riding the rings. The front paws fold under the chest (tag "front legs"). The front
half rolls fast: its belly patch flips into view, fur streaks, beads whip round its ring. A tiny
skater on the front ring pulls her arms in and blurs. The back legs splay like a starfish (tag
"back legs"), the back ring crawls a few degrees the *other* way, and its skater holds her arms
out and turns lazily. The cat's face goes dizzy-delighted. The skater is the most widely known
"arms in, spin more" picture, and riding the rings it explains the cat without leaving her.
Runners-up: the sumo wrestler on the back legs (funnier, but it says "heavy", not "legs out") and
the tail-to-nose corridor view (great depth, but expensive to draw). Cut-down: drop the skaters,
and the rings plus leg poses still carry it.

**7. Swap; back catches up.** Pick: a mirror of line 6. The front legs reach out wide and the back
legs fold. The skaters swap arm poses. The back half whips round to line up with the front, the
two tints flow together across the waist, and it snaps with a little star-burst "click". The tail
gives one small flick on the catch-up (helps a little, no more). Rejected: the combination lock
and the jar lid (both swap the cat for an object at the very moment the payoff should be hers).

**8. Under half a second.** Pick: the poses from lines 5–7 hang behind her as a fan of faint
afterimages. A stopwatch (tagged "½ second") pops in. Real speed starts and the whole flip zips
through the afterimages in about 12 frames while the hand sweeps a thin wedge. The afterimages
snap into her one by one, and the toast beside her has barely tilted. The afterimage fan
is light plus many movers, and the toast makes "fast" relative and funny. Runner-up: the giant
human blink (the fairest comparison, but it needs a whole new face for 3 s). Rejected: the long
ruler (static).

**9. Reach down, bend, land softly.** Pick: literal, with a close-up of a paw. The floor rushes
up (wood boards and a striped rug). All four legs **reach down** first, then hit, and the joints
fold deep while the body sinks. The camera dips into one paw pad as it squashes like a
marshmallow with ripple rings. Dust puffs burst out from under each paw, and the camera bounces
once with her. The order on screen follows the line: reach, then bend. Rejected: the parachute
belly (true for high falls, but off-script) and the stiff-legs-versus-bent jumper (a second
character for one beat).

**10. Still get hurt; never drop a cat.** Pick: the cat turns to the camera, serious-eyebrowed,
and raises one paw like a stop sign. The paw pad shows a printed "never". A cartoon hand drifting
in from the edge stops, turns over, and offers a gentle chin scratch instead. The camera then
tilts up the wall to the windowsill and shows how far she fell. That shows the risk without any
injury: the distance is the warning. It stays fun (the cat is in charge) and serious (the stop
paw and the height). We never show a cat being held out over a drop or getting hurt. Rejected:
the cease-and-desist gag (too jokey for the warning) and the crash-test cut-out (could read as
"test with a fake cat").

**11. Recap and loop.** Pick: hold the wide view of the whole wall, sill to floor. A ghost cat
replays the flip down the full height at medium speed. Each verb pops beside its pose and stays:
bend, tuck, twist, swap, lands. The five words stack down the wall like a ladder. The real cat
then hops up the wall back onto the sill and sits, and the last frame matches frame 1 (she eyes a
fresh slice of toast), so the Reel loops. The recap is the clearest and cheapest choice (it reuses
the rig and poses), and the loop rewards a rewatch. Runner-up: the gymnast scorecards, with a dog
judge giving 9. They're funny, but they'd fight the five words for attention. If there's spare
time, add a single "10" card held up by the toast.

## Beat sheet

Timings are rough shares of ~52 s. The VO alignment sets the real ones.

| # | Line (short) | Picture: the event (movers; state changes; printed word) | Camera | Hand-off / carrier |
|---|---|---|---|---|
| 1 | Lots of people think a cat's tail flips it… (~4 s) | Frame 1: sunny kitchen sill, the cat batting a slice of toast. She slips backward and falls upside down with the toast. Her tail spins into a helicopter blur (whop-whop) and she starts to flip. Thought bubbles rise from below, each with a spinning doodle tail inside. Movers: cat face (oops, then smug), tail rotor, toast tumbling, about 8 bubbles bobbing, curtain stirring. Tag **"tail"** on the tail. | Starts on the sill, then drops with her: a follow-fall with the background scrolling up. | Pushes into the spinning tail blur. The blur clears into line 2. |
| 2 | But actually, cats with no tail can do it too. (~3.5 s) | The star freezes mid-flip (slow motion). A grey Manx cat (tag **"no tail"**) drops past her at full speed, flips neatly and waves on the way down. The bubbles pop one by one, the rotor sputters out, and the star's tail droops while she side-eyes the Manx. Movers: the Manx, popping bubbles, drooping tail, star's eyes, toast. | Pans slightly to follow the Manx down, then settles back on the star's head. | Her ear twitches toward the camera, and that ear is the way in. |
| 3 | First, the inner ear and eyes tell it which way is up. (~4.5 s) | Push through the ear into a tiny cockpit. Three glass fluid loops slosh with sparkles (tag **"inner ear"**). Two round portholes show the kitchen floor upside down (tag **"eyes"**). A mini pilot cat in a headset reads them, spins an **"up"** dial until it points at the real floor, and pulls a lever. Movers: fluid and sparkles, the dial, the pilot, the porthole view, blinking indicator lights. | Push in through the ear; drift across the cockpit to one porthole. | Out through the porthole, which becomes her real pupil rolling toward the floor. |
| 4 | But in the air, there's nothing to push on. So how can it turn? (~5 s) | Pull wide: the cat hangs in the sunbeam among swirling dust motes (tag **"air"**). She paddles. A chalk wall and a dotted ladder appear and crumble the moment her paws touch them. On "how can it turn?" her body curls into a question mark. Movers: hundreds of motes, the cat's legs, crumbling chalk, the vanishing ladder, the toast. | Pulls back from the eye to a medium-wide shot, with a slight drift around her. | The question-mark curl of her spine. |
| 5 | The cat bends in the middle, so each half can turn a different way. (~4.5 s) | The question mark straightens into a V. The waist glows as a joint (tag **"middle"**). The halves tint (tags **"front"** and **"back"**). Two turn rings appear, and their beads orbit in **opposite** directions at the same moment, with each half's belly patch starting to roll. Movers: two rings of beads, two halves rolling, the glowing joint, motes, toast. | Push in to frame both halves; a small orbit around the waist. | The two rings, which carry straight on into line 6. |
| 6 | It tucks its front legs in, so the front turns a lot… back barely turns. (~7 s) | The front paws fold under the chest (tag **"front legs"**). The front half rolls fast: the belly flips into view, fur streaks, beads whip round, and a tiny skater on the front ring pulls her arms in and blurs. The back legs splay like a starfish (tag **"back legs"**). The back ring crawls a few degrees the other way, and its skater holds her arms out and turns lazily. Her face looks dizzy and delighted. Movers: two halves, two rings, two skaters, four legs, the face. | A slow sideways track along the body, front to back, so we compare the halves. | The back skater, about to swap. |
| 7 | Then it swaps. Back legs in, front legs out, and the back half catches up. (~5 s) | The legs trade poses: front reaching out, back tucked. The skaters swap their arms. The back half whips round to line up with the front, the tints flow together across the waist, and a star-burst **click** snaps at the joint. The tail gives one small flick. Now she is right side up. Movers: legs, both halves, the skaters (who fade out), the tail, the sparks of the click. | The track returns to the waist; the click flashes at frame centre. | The faint afterimages left behind by lines 5–7. |
| 8 | It can all happen in less than half a second. (~3.5 s) | The poses from 5–7 hang behind her as a fan of faint afterimages. A stopwatch pops in (tag **"½ second"**). The flip replays at real speed in about 12 frames, zipping through the afterimages, which snap into her one by one, while the hand sweeps a thin wedge. The toast beside her has barely tilted, and she gives it a look. Movers: about 6 afterimages, the stopwatch hand, the cat, the toast, the motes. | Quick pull back for the fan, then a snap-zoom to her on the "click". | Her paws pointing down; the floor appears at the bottom of the frame. |
| 9 | Then it reaches its legs down and bends them to land softly. (~4 s) | The floor rushes up (boards and a striped rug). All four legs **reach down**, then touch, and the joints fold deep while the body sinks. Dip into one paw pad: it squashes like a marshmallow with ripple rings. Dust puffs burst from all four paws. Movers: four legs, the pad ripples, about 4 dust clouds, the floor, the toast still falling behind her. | Falls with her, lands, and bounces once; a short dip to the paw pad and back. | The toast lands butter side down with a *flop* next to her. She looks up at the camera. |
| 10 | But cats can still get badly hurt. So never drop a cat to test this. (~5.5 s) | Her eyebrows go serious. She raises a paw like a stop sign, and the paw pad reads **"never"**. A cartoon hand drifting in from the edge stops, turns over, and gives a gentle chin scratch instead. Then the view rises up the wall to the high windowsill to show how far she fell (no injury shown). Movers: her face, the paw, the hand, settling dust, the curtain. | Close on her face and paw, then a smooth tilt up the wall to the sill. | Ends wide on the whole wall, sill to floor. |
| 11 | So the cat bends, tucks, twists, swaps, and lands on four paws. (~5.5 s) | A ghost cat replays the flip down the full height at medium speed. Each verb pops beside its pose and stays: **bend · tuck · twist · swap · lands**, stacking down the wall. She lands on four paws, hops up the wall onto the sill, sits, and eyes a fresh slice of toast, which matches frame 1. Movers: the ghost cat, five words, the real cat jumping, motes, the curtain. | Hold wide, then push up to the sill, ending on the opening framing. | Loops to line 1. |

## Build notes for the builder

- **Order of work**: (1) the cat rig (two halves with coin-roll, a waist pivot, a leg-pose param
  for tucked/out/reach/landed, face expressions, tail); (2) the kitchen, sunbeam and dust motes;
  (3) beats 1, 2 and 4–11 on the rig; (4) the cockpit for line 3; (5) the extras: skaters,
  afterimages, the hand.
- **Cut list, in order, if over time**: skaters → the cockpit's pilot cat → the chalk ladder (keep
  the chalk wall) → the paw-pad close-up (keep the dust puffs). The words and the turn rings are
  never cut.
- **Motion check**: every row above lists 5 or more separately moving things. The motes count as
  many only if each has its own seed and drift. A field that slides as one block counts as one.
- **Accuracy guards**: the halves always turn in opposite directions at the same time (lines 5–7).
  The back turns only a few degrees in line 6. The tail flick in line 7 stays small. In line 9 the
  legs reach down *before* contact and bend *after* it. Line 10 shows height, never harm.
