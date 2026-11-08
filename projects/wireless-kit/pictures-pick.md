# Caught by Wireless: pictures pick (the series beat sheet), 2026-11-08

Binding for the kit session and the three part sessions, together with `SERIES.md` (care rules) and
`projects/SERIES-BRIEF.md` (continuity rules and the Stolen Smile lessons). Inputs: `pictures-brainstorm.md`, the three
`lines.txt` (they win over any wording here), `research.md`.

Frame: 1080×1920, 30 fps. Coordinates below are in that frame. "Mover" = something with its own motion path; a whole
field moving as one (snow, a sea layer, a mosaic flipping in a wave) counts as one mover.

---

## 0. Decisions in one screen

- **Look: "Wireless Night"**: a hand-tinted 1910 wire-photo world. Cool sea-slate and fog greys, figures and sets
  shaded with **halftone dots** (not hatching, not cut paper), slight ink misregistration, depth by fog (far = paler),
  **no drop shadows**. Three spot colours only, each with one meaning: **spark cyan** (follow this), **Cora rose**
  (Cora and her cause), **clue yellow** (a clue; never a flood). Warm **lamp** peach is light, not a thing.
- **Devices (4):** the Spark (camera carrier and the wireless), the Runaway Moustache (the laugh, and the doctor's
  identity), Cora's Feather (the heart), The Daily Wire (the calendar, the recaps, the race map).
- **One camera thread per part:** P1 rides the Spark and then the Feather; P2 rides the Spark across the sea; P3 rides
  the Feather up to the Spark star. No cuts. Hand-offs are push-throughs (a round thing becomes the next scene) or a
  ride along a carrier.
- **Rejected from the brainstorm:** Look A's cream newsprint ground (too close to the toy theatre's cream/ink/amber);
  the blueprint sequence (a second look; risks "presentation"); the poker in the cellar (reads as a weapon; a hand on a
  loose brick instead); the gavel (English courts don't use one; a clerk's rubber stamp instead); the wet-paint
  "postcard from America" as a document (invented; it becomes a painted *story balloon*); the feather as the quill that
  writes "guilty" (reads as revenge; the feather stays Cora's warmth).

---

## 1. The series look: "Wireless Night"

### 1.1 Palette (kit `tokens.ts`; no literal colours anywhere else)

| Token | Hex | Means / used for | Never |
|---|---|---|---|
| `fog` | `#D5DED9` | Farthest plane, sky, fog bands, daylight sky base. "Far away." | A character fill |
| `newsprint` | `#E4E7DF` | Paper: The Daily Wire, posters, telegrams, notebook, ticker tape, labels, end card | The whole frame (max 75% of frame, always with world around it) |
| `mist` | `#9DB3B5` | Mid plane: buildings far, crowd silhouettes, jury, passengers | — |
| `slate` | `#557482` | Near plane: clothes, ship hull, walls, furniture | — |
| `deep` | `#26414F` | Darkest fill: night sea, coats, bowler, shadow masses, caption stroke | Pure black is never used |
| `ink` | `#14222A` | Line work and halftone dots only | A fill larger than 10% of frame |
| `skin` | `#F0E4D4` | Faces and hands (everyone; halftone dots give cheek and shadow side) | — |
| `spark` | `#6FF3FF` (core `#FFFFFF`, halo `#2FB8E0` at 40%) | **The accent: the thing to follow.** The Spark, its trail, Morse light, the ticker tape's newest letter, the caption's active-word dash, the plaque rivets | Clues, Cora, decoration |
| `cora` | `#FF6F87` | Cora's plume and hat ribbon; the Feather wherever it travels; the Laurentic token's pennant (Dew carries her cause) | Anything about the crime, the doctor or Ethel |
| `clue` | `#FFD23F` | **Reserved for clues:** clue rings, the paint drip on a story balloon, the brooch gem, the hanky in the cap, the hand-hold ring, the hunch bulb, the bottle label rim, the pyjama label rim, the poisons-book line | A flood, a background, a fill > 2% of frame, the Spark |
| `lamp` | `#FFB98A` | Light only: lit window panes, lamp halos (radial gradients), footlights, dawn sun, the open court door's daylight | A solid object fill (except window panes and the sun disc); a flood > 10 frames |

Grade: the world is cool and low-saturation; the three spot colours are the only saturated pixels. A frame with none of
them is fine; a frame where clue yellow is the biggest colour is a bug.

### 1.2 Fonts (Google Fonts unless noted)

| Use | Font |
|---|---|
| Title plaque, newspaper headlines, shop fronts, ship names | **Abril Fatface** 400 |
| Period text on objects: datelines, signs, labels, dance card, notebook cover, passenger list print | **Old Standard TT** 400/700/italic |
| Wireless: ticker tape, telegrams, end card body | **Courier Prime** 700 |
| Captions, corner tab, honesty tags | **Hanken Grotesk** (repo) 800 captions, 600 tab/tags |

Special Elite and Permanent Marker are **not used** in this series, so it stays distinct from The Stolen Smile.

### 1.3 Texture, line, grain

- **Halftone shading.** Every shape has a shadow side filled with a kit `<Halftone>` SVG pattern: `ink` dots,
  r 2.2 px, pitch 9 px, 45° screen, 35% opacity (near), r 1.4 px pitch 7 px 25% (far planes). Cheeks get a 3-dot
  cluster in `cora` at 30% only on Cora; everyone else in `ink`.
- **Line.** `ink` outline 5 px on figures at "near" scale (scales with the figure), 3 px on props, round caps and joins.
  Lines are slightly irregular (pre-wobbled paths, not live filters).
- **Misregistration.** The fill group is offset +3 px x, +2 px y from its ink line (early colour printing). Kit
  `<Print>` wrapper does this for every character, set piece and prop.
- **Grain.** Three pre-baked 540×960 noise PNGs (made once by the kit), upscaled, cycled every 2 frames, 6% multiply.
  Plus a `deep` radial vignette at 25%. Kit `<Grade>` applies both as the top layer.
- **Fog.** Two kit `<FogBand>` layers (pre-rendered soft gradient PNG, no live blur) drift at different speeds in every
  exterior; they count as two movers.
- **Glow** is stacked strokes (core white 2 px, spark 6 px, halo 16 px at 40%), never `feGaussianBlur` on large areas.
  No `feTurbulence`. Nothing needs WebGL.

### 1.4 Depth and camera grammar

- **Depth by value, not by shadow.** Planes: far (`fog`, parallax 0.2), mid (`mist`, 0.5), near (`slate`/`deep`, 1.0),
  foreground (1.4; rails, rigging, lamp posts passing the lens). The farther, the paler. No drop shadows, no stage
  edges, no visible card thickness: that is what makes it not a toy theatre.
- **One virtual camera** per part (x, y, zoom, rotation ≤ 8°) over one world canvas, always eased, never fully still
  for more than 1.5 s (drift 1–2% per second when holding).
- **Four moves, nothing else:**
  1. **Ride**: follow a carrier (the Spark, the Feather, the Moustache) along its path.
  2. **Push-through**: zoom into a round thing (lens, porthole, oval, opera glass, lamp) until it *is* the next scene.
  3. **Crane**: vertical travel (dolls'-house descent, hull climb, dome descent, feather rise).
  4. **Pull-back reveal**: scale jump outwards (spark → street, porthole → front page).
- Hand-off whips ≤ 10 frames, carried by the Spark's trail. No cuts, no crossfades, no held slides.

### 1.5 Captions, tab, tags

- **Captions:** Hanken Grotesk 800, 58 px, `skin`-white text (`#F7F1E6` is the kit's `captionText`, derived in
  tokens) with a 7 px `deep` stroke, no box. Centred, max 2 lines, 30 characters a line, block inside y 1300–1470.
  The word being spoken gets a **Morse dash** under it: a 8 px tall `spark` bar the width of the word, sliding word to
  word (6-frame ease). That dash is the only caption colour.
- **Corner tab** (from frame 0, all parts): top-left, x 48, y 72, a small `newsprint` tab with a `spark` dot:
  "Caught by Wireless · Part 1 of 3". Hanken 600, 30 px, `ink`.
- **Honesty tags:** a `newsprint` ribbon, Hanken 600, 28 px, `ink`, placed at y 1150–1250, never under the corner tab,
  never over a face: "Illustration", "Some say…", "As the captain told it", "Short version".

---

## 2. Series devices

Each device has one look and one sound in all three parts (sounds in `film-kit/sound/`, CC0 or synthesized).

### 2.1 The Spark (accent; the camera's carrier) — sound: dry electric crackle + one 800 Hz Morse beep per tap

A blue-white point of light with a crackling 3-prong corona and a fading trail.
- **P1, hidden.** It is in the sky as a star at frame 0, runs along a telegraph wire, taps out the title, then hides:
  a glint on the doctor's glasses, a glint in the brooch. Nobody in the story notices it. It carries the camera from
  scene to scene.
- **P2, the hero.** It *is* the wireless message: it lives at the Montrose's masthead, leaps the air gap, and the camera
  rides it from the ship to land.
- **P3, the meaning.** After the verdict it blinks above Ethel, becomes the first star in a modern sky full of signals,
  and in the last line it is "one message sent through the air", the star the series started on.
- **Title device (every part):** the Spark taps Morse (C-B-W: `-.-. -... .--`), each tap burns one letter of the plaque.

### 2.2 The Runaway Moustache — sound: a small bird's wing flutter + a soft "click" when it lands

The doctor's big moustache is a separate kit component with eyes-free "body language" (it twitches, droops, bristles,
flies). The doctor's own face is always drawn straight; only the moustache is the cartoon.
- **P1, his tell.** Clicks on in his introduction; twitches on every story he tells; fakes a sob; sweats.
- **P2, the disguise.** It flees the razor as a bird and follows the ship (funnel, rail, the race-map token). It tries
  itself on Mr Robinson's face for the captain ("could this be him?"), then flaps to warn the doctor, who swats it.
- **P3, caught, then doubt.** On "Good morning, Doctor Crippen" it flies through the porthole and lands on his lip:
  click (tag "Illustration"). At the twist it perches puzzled on the dot of the Feather's question mark.

### 2.3 Cora's Feather — sound: a soft high glass chime (one note)

One tall `cora` ostrich plume. Always bright, never wilted, never ghostly.
- **P1, Cora, then her friends' loyalty.** It bobs on her hat while she sings and waves. As the door closes after the
  goodbye, one feather slips out onto the top step. Clara picks it up, carries it like a flag to Scotland Yard and hands
  it to Inspector Dew, who tucks it in his bowler's hatband.
- **P2, the cause rides the chase.** In Dew's hatband as he leaps onto the Laurentic; a `cora` pennant on the Laurentic's
  race-map token; in the pilot disguise its tip pokes from the pea-coat pocket (the viewer's hint that the pilot is Dew).
- **P3, the question and a bow.** It pops back into the bowler's band at the reveal; it is the bookmark in Dew's
  notebook in court; at the twist it curls into the question mark; in the last line it uncurls and floats up past the
  captain, the hunch and the mast spark until its tip touches the Spark star.

### 2.4 The Daily Wire — sound: paper flip + a deep headline "thunk"

A 1910 front page (fictional paper), `newsprint` with `ink`/`deep` print, masthead in Abril Fatface, dateline in Old
Standard. Kit component with slots: `date`, `headline` (flip-board letter animation), up to three engraving `panels`,
`raceMap` page variant, fold and corkscrew-twist animations.
- **P1, the news.** The newsboy's page at the start; the "Montrose sails for Canada" ad corner; the headline
  "CELLAR DISCOVERY" slam; the WANTED poster on the newsboy's board.
- **P2, the race.** The recap page dated 16 July 1910; the printing press; the race map takes the whole page; the
  flock of papers.
- **P3, the verdict and the twist.** The recap page dated 31 July 1910; "GUILTY" and "NOT GUILTY"; the page corkscrews
  from 1910 to 2007.

### 2.5 Title card and end card (kit `TitlePlaque`, `EndCard`, same in all parts)

- **Plaque, settled by 4.0 s in every part** (over line 1, which is the hook or the recap). An enamel plate in `deep`
  with four `spark` rivets and a thin `newsprint` rule, 840×230, centred, top y 300. "CAUGHT BY WIRELESS" in Abril
  Fatface 92 px `newsprint`. 2.4–4.0 s: the Spark taps C-B-W and each tap burns letters in (left to right, 3 groups).
  Over moving picture; the plate drifts with 0.6 parallax.
- **Subtitle** on line 2 ("This is Caught by Wireless…"): a `newsprint` strip stamps under the plate,
  "Part one · The missing singer" / "Part two · The chase" / "Part three · The verdict" (Old Standard italic 52 px).
  Each part gives it one beat of life (P1: footlights flash on it; P2: the letters of "The chase" sprint off; P3: a
  clerk's rubber stamp thumps it). At the end of line 2 the plate lifts out of frame upwards.
- **End card:** a wireless telegram form, `newsprint`, 800×440, **centred, top y 560** (x 140–940). Header "WIRELESS
  TELEGRAM · MARCONI" in Old Standard small caps; body typed letter by letter in Courier Prime 64 px:
  "NEXT: THE CHASE" / "NEXT: THE VERDICT" / "THE END", a `spark` cursor blinking after it. Slides up in 12 frames,
  holds ≥ 2.0 s. Always over sea or sky, never over a face or a sign.

### 2.6 Recaps (only pictures the previous part really shows; part builders must render these exact beats)

| Recap | Opens inside | Panels on The Daily Wire (one per clause) | They come from |
|---|---|---|---|
| P2 line 1 | P1's last frame: the far porthole with the Spark at its rim | **R1 EmptySteps** (snowy steps of 39, the Feather on the top step) · **R2 CellarLamps** (three police lamp beams on the closed brick floor, faces lit from below) · **R3 EmptyOval** (WANTED poster with the blank oval) | P1 lines 6, 16, 17 |
| P3 line 1 | P2's last frame: the pilot-cap brim close-up | **R4 RaceOvertake** (race map, Laurentic token with `cora` pennant hopping past the Montrose token, the Moustache on it) · **R5 LadderShadow** (rope ladder, pilot climbing, a bowler-hat shadow on the hull) | P2 lines 15, 17 |

The camera pulls back out of the last frame and it turns out to be the engraving on today's Daily Wire; the dateline
flips; each panel slides in on its clause. Panels are the same components and props as in the source part, re-staged
at panel size; each source part must commit a still of that beat (`stills/R1.jpg` …) for the next part to check.

---

## 3. Cast, sets, props (the shared kit)

MUST = used in 2+ parts, built by the kit. PART-ONLY = built by that part in the kit's style (with `<Print>`,
`<Halftone>`, tokens), never named like a kit export.

### 3.1 Cast (all on one `Puppet` rig: head, torso, 2-segment arms and legs, pose angles; expressions = brows + mouth)

Heights in heads (3.5 heads tall at "near" scale = ~760 px). Faces: dot eyes with a white catchlight, brow lines,
small nose line, mouth shape. Drawn as characters, not caricatures.

| Character | Design | Poses / expressions the kit must render | Tag |
|---|---|---|---|
| **Cora Crippen** | Tall, full figure, big curly dark hair (`deep`), very wide hat with the tall `cora` plume and ribbon, `mist` gown with high collar, wide open smile | sing (arms open), wave (big, from steps), laugh, deal cards, cameo oval portrait (for P3's family tree) | MUST (P1, P3) |
| **Crippen A** (doctor) | Small (0.8× Dew), domed forehead, thin side hair, round gold-rimmed glasses (`newsprint` rim + `spark` glint), high collar, `slate` frock coat; moustache is the separate `Moustache` | stand, talk (hand out), shrug, point, usher (arm sweep), pull card from pocket, hold telegram + hanky; neutral, polite smile, nervous, blank | MUST (P1, P2) |
| **Crippen B** ("Mr Robinson") | Same head, bare upper lip (faint halftone), no glasses, `mist` travelling suit, soft felt hat | walk, hold hands, deck chair + book, swat, seated in cabin, startled, in the dock (behind rail), shake head | MUST (P2, P3) |
| **Ethel A** | Young, slim, dark hair in a soft bun (P1) / short bob (P3, `hair="bob"`), white high-collar blouse, `deep` skirt; `brooch` toggle | dance/twirl, stand calm, walk out into light with small smile; own coat-and-hat variant (P3) | MUST (P1, P3) |
| **Ethel B** ("Master Robinson") | Short hair, cap a size too big with a hanky edge showing (`clue` only when ringed), baggy `slate` suit, rolled cuffs, long trousers | walk, hold hands, sit calm reading, look up calmly | MUST (P2, P3) |
| **Clara & Paul** (the dinner friends) | Clara: round, warm, flowered hat (`mist` flowers), shawl. Paul: tall, thin, clean-shaven, curly hair, scarf | wave, lean in and ask, march (Clara holds the Feather), raised eyebrow; Clara seated in court gallery | MUST (P1, P3) |
| **Guild friends ×2** | Simple: one lady with a bonnet, one man with a cane and top hat | march, wave | PART-ONLY P1 |
| **Dew A** (Inspector Walter Dew) | Heavy-set, tall, broad, `deep` bowler with the Feather in the band (`feather` toggle), long `slate` overcoat, short clipped grey moustache (`mist`, small, so it never reads as the runaway one), newsprint notebook + pencil | walk, lift bowler, write, hold lamp, lean in doorway, read telegram, leap (both feet off, hand on bowler), remove bowler (respect), seated in court | MUST (P1, P2, P3) |
| **Dew B** (pilot disguise) | Peaked pilot cap, `deep` pea coat with collar up, scarf; Feather tip from the pocket; bowler hidden in the cap | climb ladder, walk on deck, lift cap → bowler pops up (jack-in-the-box), speak | MUST (P2, P3) |
| **Captain Henry Kendall** | Upright, `deep` uniform with `newsprint` trim, white-top peaked cap, telescope | telescope look, think (hand on chin; hunch bulb above), hold paper beside a passenger, hand over a note, nod | MUST (P2, P3) |
| **Lawrence Hughes** (wireless operator) | Young, slim, headphones, waistcoat, rolled sleeves | tap key, listen, write | PART-ONLY P2 |
| **Passengers ×4** | `mist` silhouettes with simple faces: lady with parasol, man in boater, child with hoop, steward with tray | idle loops (each its own) | MUST (P2, P3) |
| **Constables ×2** | Bobby helmets, capes, bull's-eye lamps | walk, sweep lamp, lamp held low (faces lit from below) | MUST (P1, P2 recap) |
| **Newsboy** | Cap, satchel of papers, shouting mouth, arm up with a paper | shout loop, hold board | MUST (P1, P2, P3) |
| **Newspaper readers ×3** | Simple city silhouettes holding papers (London, New York, Montreal by hat/skyline) | read, look up | PART-ONLY P2 |
| **Canadian policeman** | Peaked cap, plain coat, calm | stand at a cabin door, gentle gesture | PART-ONLY P3 |
| **Jury ×12, judge** | Jury: `mist` silhouettes in two rows that lean together as one wave; a foreman who stands. Judge: `deep` silhouette with long wig on a high bench (no black cap, no props in hand) | lean, stand | PART-ONLY P3 |
| **1910 scientist** | Bearded, lab coat, holds a report card | hold up card | PART-ONLY P3 |
| **2007 scientists ×2** | Modern: one in a lab coat and gloves, one in a cardigan with papers | hold box, tug, point | PART-ONLY P3 |

### 3.2 Sets

| Set | One-line design | Tag |
|---|---|---|
| **39 Hilldrop Crescent, outside** | Semi-detached Victorian, bay window, six front steps up to a door with "39" in the fanlight, railings, gas lamp, street sign "Hilldrop Crescent"; `night`/`snow`/`day` variants, windows glow `lamp`, door opens | MUST (P1, P2 recap) |
| **39, dolls'-house section** | The house cut open: upstairs parlour (card table, mantel clock), stairs, hall with hat pegs and chair, kitchen, cellar door ("COAL") and steps, coal cellar with a plain brick floor and a coal heap | MUST (P1; the cellar part for P2 recap R2) |
| **Cellar floor, closed** | Brick floor only, three lamp beams, nothing under it, ever; one brick that can wobble | MUST (P1, P2 recap) |
| **Scotland Yard** | Outside: a solid building with "NEW SCOTLAND YARD" over the door, two door lamps, one shutter window that opens. Inside: Dew's desk with a `lamp`-shaded lamp, in-tray, hat stand | MUST (P1, P2) |
| **Sea** | 3 parallax wave layers, `day`/`night`/`dawn` sky; foam flecks | MUST (P2, P3) |
| **Montrose, outside** | Canadian Pacific single-funnel liner: `slate` hull, `newsprint` upperworks, buff (`fog`) funnel with `deep` top, two masts with the aerial wire between, "MONTROSE" on the bow, portholes lit, smoke | MUST (P1 ad + porthole, P2, P3) |
| **Montrose, deck** | Rails, deck chairs, lifeboats, bridge with brass plate "Capt. H. G. Kendall", the mast | MUST (P2, P3) |
| **Montrose, cabins** | Captain's cabin (desk, porthole, door) and a small passenger cabin (bunk, porthole) | MUST (P3; P2 uses the porthole) |
| **Wireless room** | Marconi set with brass plate "MARCONI", spark gap, Morse key, headphones, ticker tape spool, door sign "WIRELESS" | MUST (P2, P3 final line) |
| **Laurentic** | White Star single-funnel liner, sleeker and longer, buff funnel `deep` top, "LAURENTIC" on the stern, big wake | MUST (P2, P3 recap) |
| **Race map** | The Daily Wire's map page: Antwerp and Liverpool to Father Point, the route as board-game squares with dates (20 Jul … 31 Jul), wave doodles that move, two ship tokens (Laurentic with a `cora` pennant; Montrose with the Moustache perched), dice, a finish flag on the "FATHER POINT" square | MUST (P2, P3) |
| **Father Point at dawn** | Lighthouse (`newsprint` tower, `deep` lantern top) with a sweeping beam, wide St Lawrence, low hills in `fog`, `lamp` dawn sun and gradient, sign "FATHER POINT", pilot boat (small launch, two crew) | MUST (P2, P3) |
| **London street at night** | Gas lamps, telegraph wires overhead, fog, a theatre playbill wall, newsboy's corner | PART-ONLY P1 (P3 reuses its wall only if built in kit style there) |
| Music-hall stage, the ball, Crippen's office door (frosted glass "Albion House") | — | PART-ONLY P1 |
| Antwerp dock with gangway and passenger list, Liverpool receiving hut ("LIVERPOOL"), Liverpool dock, printing press, mirrors | — | PART-ONLY P2 |
| Old Bailey (dome with gilded Justice and scales, carved "OLD BAILEY"; Court No. 1 with dock, jury box, bench, gallery), chemist shop "LEWIS & BURROWS", shop "JONES BROTHERS · HOLLOWAY", modern sky of signals, modern lab | — | PART-ONLY P3 |

### 3.3 Props

| Prop | One-line design | Tag |
|---|---|---|
| **Spark** (+ `SparkTrail`, `MorseTap`) | 3-prong crackle corona, white core, trail along any path, tap = flash + beep frame mark | MUST (all) |
| **Moustache** | Big droopy `deep` moustache with states: `on`, `twitch`, `droop`, `sob`, `sweat`, `bristle`, `fly` (bird wing-flap), `perch`, `land` | MUST (all) |
| **Feather** | Tall `cora` plume with states: `onHat`, `fall`, `flag`, `hatband`, `pocketTip`, `bookmark`, `curlToQuestion`, `float` | MUST (all) |
| **DailyWire** | Front page with `date`, `headline`, `panels[0–3]`, `ad`, `raceMap`, `fold`, `twist` | MUST (all) |
| **WantedPoster** | "WANTED" + engraved portrait of Crippen A + description lines in Courier ("Small. Round glasses. Big moustache."); `empty` variant with blank oval; `portraitWalksOut` | MUST (P1, P2) |
| **Telegram** | `newsprint` form "WIRELESS TELEGRAM · MARCONI", Courier body slot, fold/unfold; also the end card | MUST (all) |
| **TickerTape** | Strip unspooling with Courier text, newest letter in `spark` | MUST (P2, P3) |
| **WirelessKey** | Brass key that taps, spark gap jumping between two balls, headphones | MUST (P2, P3) |
| **Notebook** (Dew) | `newsprint` notebook "Insp. W. Dew · Scotland Yard", page writes itself in lines, flap-open | MUST (all) |
| **PoliceLamp** | Bull's-eye lantern with a beam cone in `lamp` at 35% | MUST (P1, P2 recap) |
| **Telescope** | Brass; `view` mode draws the circle mask that sweeps | MUST (P2, P3) |
| **HunchBulb** | Small `clue` outline bulb with a click-on | MUST (P2, P3) |
| **ClueRing** | `clue` circle that draws on in 8 frames around any target, 4 px, slight wobble | MUST (all) |
| **StoryBalloon** | Speech balloon holding a small painted picture; `wet` adds a `clue` drip; `fuzzy` (stacked offset copies) | MUST (P1; P3 L7 "said he didn't do it" may reuse) |
| **WallCalendar** | Month pages that flip and fly ("February 1910", "March 1910", "November 1910") | MUST (P1, P3) |
| **RopeLadder**, **PilotCap** | Ladder that drops and sways; cap that lifts | MUST (P2, P3) |
| **SeaBirds** | Gulls, each on its own path | MUST (P2, P3) |
| Playing cards, opera glasses, brooch (as Ethel A's `brooch` toggle, gem in `clue`), dance card "Ethel", story cards from the pocket | — | PART-ONLY P1 (brooch is in the kit with Ethel A) |
| Razor, scissors, dress-up suit, passenger list ("John Robinson, 55, merchant" / "John C. Robinson, 16, student"), tin-can phones, dice | — | PART-ONLY P2 |
| Drug bottle: small `slate` glass bottle, closed, label "Hyoscine" with `clue` rim, never opened or poured; poisons-book line "19 Jan 1910 · per H. H. Crippen"; report card "Traces found"; pyjama scrap (clean `mist`/`newsprint` stripes, label "Jones Brothers (Holloway) Limited", `clue` rim) and the matching trousers in a drawer; scales of Justice; case ledger; archive box "Trial sample, 1910" with a sealed glass slide (never magnified); family-tree jigsaw; padlocked box "Case closed"; clerk's rubber stamp | — | PART-ONLY P3 |

### 3.4 What the kit renders before READY (the KitSheet; every documented prop value shown)

1. **Look:** tokens swatch strip with names and meanings; fonts sample; `Halftone` near/far; `Print` misregistration;
   `Grade` (grain cycle + vignette); two `FogBand`s drifting.
2. **Cards in motion:** `CornerTab` (parts 1–3), `TitlePlaque` burn-in 2.4–4.0 s with the C-B-W taps, the three
   `Subtitle` beats, `EndCard` for all three texts, `Caption` with the moving Morse dash, `HonestyTag` (all 4 texts).
3. **Devices:** `Spark` (idle, tap, ride along a path, glint, star), every `Moustache` state, every `Feather` state,
   `DailyWire` (headline flip, 3 panels, ad, raceMap with tokens hopping and dice, fold, twist), `WantedPoster`
   (full, empty, walk-out).
4. **Cast:** every character above marked MUST, in every listed pose and expression, side by side at near scale
   (Crippen A/B and Dew A/B and Ethel A/B paired so the disguises read).
5. **Sets:** every MUST set with each variant (39 night/snow/day + door open; section with the cellar; closed cellar
   floor with lamps; Scotland Yard out/in; sea day/night/dawn; Montrose outside/deck/cabins/wireless room; Laurentic;
   race map; Father Point dawn).
6. **Props:** every MUST prop in each state.
7. `film-kit/EXPORTS.txt`, `film-kit/sound/` (crackle, Morse beep, flutter + click, chime, paper flip + thunk, series
   sting, ticker), README with the API, then `film-kit/READY`.

Build order for a ~25-minute kit: tokens/fonts/Print/Halftone/Grade → cards and Caption → Spark, Feather, Moustache,
DailyWire → Puppet rig and the cast → sets → props → KitSheet → READY. If time runs short, READY may ship with the
Montrose cabins and Father Point as simple versions; it may not ship without the cards, the four devices or the cast.

---

## 4. Beat sheets

Times are estimates at ~2.95 words/s (the VO timing spine wins). Each beat: **Event** (what moves and changes state,
≥ 4 independent movers), **Words** (printed on the key object the first time the voice names it), **Camera**, **→**
hand-off/carrier. Ambient movers available everywhere: 2 fog bands, sea layers, gulls, smoke, snow.

Part totals estimate ~83 s (P1) and ~88 s (P2, P3) before the tail; parts 2 and 3 must keep the end card hold short
enough to stay ≤ 89 s.

### Part 1: The missing singer. Thread: the Spark, then the Feather, then back to the Spark

**L1 (0–7.8) "In 1910, a woman vanished in London. Then a secret message from a ship helped catch the man accused of
her murder."**
- Event: frame 0, a Spark star blinks in a foggy night sky over London (the same star P3 ends on). It drops onto a
  telegraph wire and runs along it. Below, Cora (hat, plume) walks along the lamplit street, laughing to herself, and
  turns the corner; her plume is the last thing seen. 2.4–4.0: the Spark taps C-B-W and the plaque burns in. 4.5: the
  Spark dives into the paper the newsboy waves, lands on the mast of the little ship in the corner ad, and sparks;
  7.0: it leaps to the paper's engraved portrait of a small man in round glasses and circles it once like a lasso.
- Movers: Spark, Cora walking, newsboy's arm, paper flapping, 2 fog bands, gas-lamp flicker.
- Words: "1910" on the paper's dateline; ad: "MONTROSE · sails for Canada".
- Camera: slow crane down from the sky to the street, then push into the paper.
- → the Spark leaves the portrait and runs up the wall to a playbill.

**L2 (8.2–11.5) "This is Caught by Wireless. Part one: the missing singer."**
- Event: subtitle stamps under the plaque; the playbill "BELLE ELMORE · Cora Crippen · Tonight" on the wall; the Spark
  touches its footlights, which flick on in `lamp`; the plaque lifts away.
- Movers: subtitle strip, plaque lift, footlights, playbill corner flapping, newsboy shouting.
- Camera: push-through the playbill's lit stage picture.
- → the playbill picture becomes the real stage.

**L3 (11.9–16.0) "Cora Crippen was a singer with big hats and lots of friends."**
- Event: Cora sings in a `lamp` spotlight, plume bobbing. Her hat brim grows wide like an umbrella and her friends pop
  up under it one by one (Clara, Paul, two guild friends), waving and laughing.
- Movers: Cora's arms and mouth, plume, brim growing, 4 friends popping, spotlight sway.
- Words: stage easel card "Cora Crippen".
- Camera: slow push in, then tilt down along the brim's shadow.
- → in the brim's shadow stands a small man.

**L4 (16.4–21.8) "Her husband was Hawley Crippen, a small, quiet doctor with round glasses and a big mustache."**
- Event: build-a-face. Crippen stands plain-faced in the shadow, small beside Cora (her hand on his shoulder, smiling).
  Round glasses drop on (the Spark hides as a glint on one lens); then the Moustache flutters in like a little bird and
  lands on his lip: click. It twitches once.
- Movers: glasses dropping, Moustache flight, Cora's hand, friends waving off, lens glint.
- Words: door plate behind him "Dr. H. H. Crippen".
- Camera: zoom down to his size (scale gag: he is tiny next to the hat), ending on the lenses.
- → push-through one lens: its round glow becomes a lit window of 39 Hilldrop Crescent.

**L5 (22.2–29.4) "One winter night, two friends came over for dinner and cards. When they left, Cora waved goodbye
from the front steps."**
- Event: snowy night; through the parlour window Cora deals cards, Clara and Paul laugh, the doctor sits quietly, the
  mantel clock races to 1:30. Camera slides out to the front: the friends go down the steps; Cora at the top waves big,
  plume bobbing. As the door closes, one feather slips out and lands on the top step.
- Movers: snow, cards flipping, clock hands, friends walking, Cora's wave, plume, chimney smoke, door.
- Words: "39" in the fanlight; street sign "Hilldrop Crescent".
- Camera: push out of the window, slide along the house front to the steps.
- → the Feather settles on the step.

**L6 (29.8–31.8) "Her friends never saw her again."** (recap still **R1 EmptySteps**)
- Event: day, same steps, empty; snow fills the footprints; the Feather stirs on the top step; in the window the wall
  calendar flips "February 1910" → "March 1910".
- Movers: snow filling, Feather, calendar pages, a cat crossing the railings.
- Camera: hold with drift.
- → the flying calendar page is caught by the doctor's hand at the door.

**L7 (32.2–35.6) "Soon, the doctor told them Cora had gone to America."**
- Event: the doctor in the doorway, Clara and Paul at the foot of the steps (Clara picks up the Feather). His story
  balloon holds a painted steamship sailing to "AMERICA"; its paint is wet, a `clue` drip runs (ClueRing on it). The
  Moustache twitches.
- Movers: painted ship sailing, painted waves, drip, Moustache, Clara bending for the Feather, Paul's head tilt.
- Words: "AMERICA" in the balloon.
- Camera: pan up from the page to the balloon.
- → the drip runs down onto a telegram.

**L8 (36.0–39.0) "Then he said she got sick there, and died."**
- Event: he holds up a folded "TELEGRAM" (never opened on screen) and a hanky; the Moustache droops and fakes a big
  sob into it; Clara and Paul exchange a look; Clara's eyebrow rises. No sickbed, no funeral.
- Movers: hanky flutter, Moustache sob, telegram wave, Clara's brow, Paul lowering his hat.
- Camera: slow push to the friends' faces.
- → Clara's raised eyebrow curls into a question mark.

**L9 (39.4–45.2) "But her friends had questions. Where in America? When was the funeral? The doctor's answers were
fuzzy."**
- Event: crisp balloons pop from the friends, "Where in America?" then "When was the funeral?". The doctor's answer
  balloons come out blurry (StoryBalloon `fuzzy`), swell into soft fog clouds that fill around him; he shrugs.
- Movers: 2 question balloons, fog balloons swelling, shrug, Moustache wiggle, Clara's Feather.
- Words: the two questions, in the balloons.
- Camera: hold, then push into the fog.
- → the fog parts on one sparkle: a brooch.

**L10 (45.6–50.0) "And there was something else. The doctor's typist, Ethel, was wearing Cora's jewelry."**
- Event: start on the brooch huge (gem `clue`, the Spark glints in it). Pull back: it is on Ethel's blouse as she
  dances at a ball, an ordinary, smiling young woman. Across the room Clara's opera glasses lock onto it; ClueRing draws.
- Movers: two dancing couples, Ethel's twirl, chandelier sway, opera glasses, ClueRing, glint.
- Words: Ethel's dance card "Ethel"; tag "Illustration".
- Camera: pull-back, then ride to the opera glasses.
- → push-through the two lenses: they become the two lamps over Scotland Yard's door.

**L11 (50.4–53.8) "So Cora's friends went to the police at Scotland Yard."**
- Event: the friends march up the street; Clara holds the Feather high like a flag; the building's shutter window
  opens like a waking eye.
- Movers: 4 marchers, the Feather flag, door lamps flicker, shutter, pigeons lifting.
- Words: "NEW SCOTLAND YARD" over the door.
- Camera: track with the march, tilt up to the window.
- → in the window a bowler hat lifts.

**L12 (54.2–57.6) "Inspector Walter Dew came to ask the doctor some questions."**
- Event: Dew lifts his bowler, Clara hands up the Feather, he tucks it into his hatband (the hand-off of the series).
  He strides to the doctor's office door ("Albion House" on frosted glass) and fills the doorway; the tiny doctor looks
  up and up; Dew's notebook flaps open by itself; the Moustache bristles.
- Movers: Dew walking, Feather into band, door swinging, notebook flap, pencil, Moustache bristle.
- Words: notebook cover "Insp. W. Dew · Scotland Yard".
- Camera: follow Dew, then low angle at the door (scale gag).
- → the notebook page fills the frame.

**L13 (58.0–63.7) "This time, the doctor told a new story. He said Cora had left him and run away."**
- Event: the doctor pulls story cards from his coat pocket: the "AMERICA" card crumples and is tossed; a new card shows
  a painted train steaming away with a big hat in its window, "RAN AWAY", paint wet (`clue` drip). Dew writes
  "Story 2" in the notebook; the Moustache sweats drops.
- Movers: card crumple, new card, painted train, pencil writing, sweat drops, Dew's eyebrow.
- Words: "RAN AWAY" on the card; "Story 2" in the notebook.
- Camera: hold on the pocket, then push into it.
- → the dark pocket becomes the front doorway of 39; the doctor ushers Dew in.

**L14 (64.1–69.2) "He even showed the inspector around his house, all the way down to the cellar."**
- Event: the dolls'-house section of 39; two small figures go floor by floor: parlour (card table), stairs, hall,
  kitchen, the "COAL" door, the cellar steps, the plain brick floor. The doctor gestures "see?"; Dew sweeps his lamp.
- Movers: two figures on stairs, lamp beam, clock pendulum, cat on stairs, coal-heap dust.
- Words: "COAL" on the cellar door.
- Camera: crane straight down the section like a lift, then rise back up.
- → the camera rises out through the front door.

**L15 (69.6–74.4) "The inspector left. But when he came back, the doctor and Ethel were gone."**
- Event: Dew walks off; the calendar page flips once; Dew knocks again (knocker bounces), the door swings open on
  the hall: the chair is still spinning, a teacup still steams, the hat-peg swings, two empty hooks.
- Movers: Dew, knocker, door, spinning chair, steam, swinging peg.
- Camera: pull back down the steps, then push back in through the door.
- → the steam curls down through the floorboards.

**L16 (74.8–79.9) "So the police searched the house again. Under the cellar floor, they found human remains."** (recap
still **R2 CellarLamps**)
- Event: in the cellar, Dew and two constables sweep three lamp beams over the closed brick floor; a hand presses one
  brick and it wobbles. Their faces, lit from below in `lamp`, go still; Dew takes off his bowler (the Feather in the
  band). Nothing under the floor is ever shown. The camera rises through the house to the street, where the newsboy's
  board slams down: "CELLAR DISCOVERY".
- Movers: 3 lamp beams, wobbling brick, bowler off, dust motes, rising camera, headline slam.
- Words: "CELLAR DISCOVERY" headline (the words "human remains" are only in the VO).
- Camera: low and close on faces, then crane up through the floors.
- → the newsboy's board turns to the WANTED poster.

**L17 (80.3–82.3 + tail to ~85) "And the doctor? He had vanished."** (recap still **R3 EmptyOval**)
- Event: the WANTED poster's portrait (Crippen A) tiptoes out of its oval and off the page, leaving a blank oval. The
  camera pushes through the oval into the night sea: far away a ship's lit porthole with the Spark at its rim. End card
  "NEXT: THE CHASE" types on above the porthole.
- Movers: portrait tiptoe, poster corner flap, newsboy, fog, porthole light, Spark, sea.
- Words: "WANTED · Dr. Crippen".
- Camera: push-through the oval, slow drift on the sea.
- → (P2 opens inside this porthole).

### Part 2: The chase. Thread: the Spark across the sea

**L1 (0–6.7) "Last time, Cora Crippen vanished, and police found human remains under her cellar floor. Her husband had
run away."**
- Event: open inside P1's last frame (porthole, Spark at the rim). Pull back: it is an engraving on The Daily Wire,
  dateline flipping to "16 July 1910". 2.4–4.0: the Spark taps the plaque in above the page. Panels slide in on each
  clause: R1 EmptySteps, R2 CellarLamps, R3 EmptyOval.
- Movers: Spark, dateline flip, 3 panels, page flutter, the hand holding the paper.
- Camera: pull-back reveal, then drift down the page.
- → the Spark taps the title.

**L2 (7.1–10.2) "This is Caught by Wireless. Part two: the chase."**
- Event: subtitle stamps; the letters of "The chase" jump off and sprint across the page and into a printing press.
- Movers: running letters (staggered, 8 independent paths), plaque lift, press rollers, page.
- Camera: ride the running letters.
- → into the press.

**L3 (10.6–14.0) "Police sent out his description, and newspapers printed his picture."**
- Event: rollers spin and spit out WANTED posters; the portrait copies itself 1 → 2 → 4 → a whole mosaic over walls, a
  passing tram, a kite, a pigeon's sign.
- Movers: rollers, flying sheets, mosaic flip wave (1), tram, kite, pigeon.
- Words: "WANTED · Dr. Crippen" and the description "Small. Round glasses. Big moustache."
- Camera: pull back as the mosaic spreads.
- → one tile in the mosaic is a mirror; the real doctor is shaving in it.

**L4 (14.4–19.1) "But the doctor had shaved off his big mustache and stopped wearing his glasses."**
- Event: razor and foam; the Moustache panics, hops off his face and flies out of the window as a bird; the glasses fold
  themselves and walk into a drawer, which shuts. Crippen B looks at himself.
- Movers: razor, Moustache flying, glasses walking, drawer, foam blobs, curtain.
- Camera: push into the mirror, then whip with the Moustache to the next mirror.
- → the bird flutters past a second mirror where scissors snip.

**L5 (19.5–23.3) "And Ethel cut her hair short and dressed as a boy."**
- Event: Ethel at the mirror; snips turn locks into ribbons that float off; a baggy suit drops onto her; the cap is too
  big and squashes down; a hanky edge peeks out. She looks at herself, a little unsure, a little amused.
- Movers: scissors, ribbons, suit dropping, cap squash, the Moustache bird passing.
- Camera: hold, slow push.
- → the two disguised figures step towards a gangway.

**L6 (23.7–29.1) "They called themselves Mr. Robinson and his son, and got on a big ship to Canada."**
- Event: Antwerp dock. A pen signs the passenger list; the two tiny figures walk up the gangway; the camera climbs the
  giant hull to the funnel, where the Moustache perches.
- Movers: pen, the pair walking, gulls, smoke, crane arm, flags.
- Words: passenger list "John Robinson, 55, merchant" / "John C. Robinson, 16, student"; "MONTROSE" on the bow;
  board "ANTWERP → CANADA".
- Camera: crane up the hull.
- → at the top of the ship, a captain's cap.

**L7 (29.5–33.5) "The ship's captain was named Henry Kendall. He watched his passengers closely."**
- Event: Kendall on the bridge raises his telescope; the view becomes a moving circle that sweeps the deck past the
  lady with the parasol, the boater man, the child with the hoop, the steward, and stops.
- Movers: telescope, sweeping circle, 4 passengers, gulls.
- Words: bridge plate "Capt. H. G. Kendall".
- Camera: ride inside the telescope circle.
- → the circle stops on two pairs of hands.

**L8 (33.9–39.7) "The captain later said the boy's clothes didn't fit, and the two held hands like a couple."**
- Event: the "son"'s jacket fills with wind like a sail, the cap slips and the hanky pokes out; the two squeeze hands.
  ClueRings pop on the trousers, the cap, the hands. Tag "As the captain told it".
- Movers: 3 ClueRings, jacket flap, cap slip, hand squeeze, gull.
- Camera: hold with drift; nudge to each ring.
- → the three rings slide together into one HunchBulb over Kendall's head.

**L9 (40.1–44.9) "The captain had read about the missing doctor. He wondered, could this be him?"**
- Event: Kendall holds up The Daily Wire's WANTED portrait beside Mr Robinson (who is looking out to sea). The
  Moustache flies down from the funnel and tries itself on Robinson's lip: it matches the portrait, click, and flies
  off before he notices. The bulb glows.
- Movers: paper flutter, Moustache, Robinson turning, bulb, Kendall's eyebrow, gulls.
- Camera: slow push between portrait and face.
- → the bulb's click becomes a crackle at the top of the mast: the Spark.

**L10 (45.3–52.0) "His ship had a new invention called wireless. It could send messages through the air, with no
wires at all."**
- Event: the Spark at the masthead, the aerial wire between the masts. On deck the child and a sailor play tin-can
  phones; a sailor snips the string; the Spark hops across the gap between the cans and they still hear each other.
  The camera follows the Spark down the aerial into the wireless room: Hughes in headphones, the spark gap crackling.
- Movers: Spark, two tin-can players, falling string, sailor with scissors, Hughes, spark gap.
- Words: brass plate "MARCONI" and door sign "WIRELESS".
- Camera: crane down the aerial into the room.
- → Hughes's finger lands on the Morse key.

**L11 (52.4–60.9) "So the captain sent a secret message back to land. It said the doctor might be on board, with a
helper dressed as a boy."**
- Event: Kendall hands Hughes a note; the key taps; the ticker tape prints "CRIPPEN MAY BE ON BOARD · HELPER DRESSED AS
  BOY" (tag "Short version"). The Spark leaps from the mast and the camera rides it low over the wave tops, past a
  Cornish lighthouse, to the Liverpool receiving hut (a clerk in headphones writes it down), then a messenger boy
  pedals it to Scotland Yard, where the Telegram lands on Dew's desk.
- Movers: Spark, ticker tape, wave layers, gulls, clerk, bicycle, papers.
- Words: the ticker tape text; "LIVERPOOL" on the hut.
- Camera: the series' signature ride: one long eased track from mast to desk.
- → Dew grabs his bowler (the Feather in the band).

**L12 (61.3–66.7) "Inspector Dew got the news. He jumped on a faster ship to beat them to Canada."**
- Event: papers fly off the desk; at Liverpool dock the Laurentic is pulling out; Dew leaps from the dock onto its
  deck, hand on his bowler. The camera rises into a bird's-eye view and both ships shrink into tokens on the race map.
- Movers: Dew's leap, papers, Laurentic smoke, wake, gulls, rising camera.
- Words: "LAURENTIC" on the stern.
- Camera: follow the leap, then crane up and out.
- → the race map is printed on the front page.

**L13 (67.1–70.9) "Soon, newspapers all over the world were writing about the chase."**
- Event: the race-map page copies itself; the copies flap off like a flock of birds over three cities, where newsboys
  shout (London, New York, Montreal skylines).
- Movers: flock, 3 newsboys, headline flips, city lights.
- Words: headline "THE GREAT CHASE".
- Camera: ride the flock out to sea.
- → the flock flies over the Montrose's deck.

**L14 (71.3–75.0) "Everyone knew, except the doctor, out at sea with no news."**
- Event: the flock passes over the deck; none land. Mr Robinson reads a novel in a deck chair; the "son" reads beside
  him. The Moustache flaps frantically in front of his face to warn him; he swats it like a fly and turns a page.
- Movers: flock, Moustache, page turn, deck chair rock, Ethel B's book, waves.
- Camera: hold, slow push to his calm face.
- → his page turns and the page becomes the race map.

**L15 (75.4–78.4) "For days, the two ships raced across the sea."** (recap still **R4 RaceOvertake**)
- Event: a board-game race map: date squares 23 Jul … 31 Jul; dice roll; the Laurentic token (`cora` pennant) hops
  three squares past the Montrose token (Moustache perched on it); a quick zoom down to the real ships in the waves,
  sky cycling day → night → day, the Laurentic overtaking.
- Movers: dice, 2 tokens, waves, sky, both ships' smoke.
- Words: finish square "FATHER POINT".
- Camera: push-through the map to the sea and back up.
- → the Laurentic's token reaches the lighthouse square first.

**L16 (78.8–83.9) "Then one morning, near Canada, a small boat came out to meet the doctor's ship."**
- Event: dawn at Father Point; the lighthouse beam sweeps and winks; a tiny pilot boat chugs out to the huge Montrose;
  the `lamp` sun rises.
- Movers: pilot boat, its two crew, beam, sun, gulls, ship smoke.
- Words: "FATHER POINT" on the pilot station.
- Camera: wide, then drift towards the meeting point.
- → the boat bumps the hull; a rope ladder drops.

**L17 (84.3–87.7 + tail) "A pilot climbed aboard. But he wasn't really a pilot."** (recap still **R5 LadderShadow**)
- Event: the pilot (Dew B) climbs the swaying ladder; his shadow on the hull wears a bowler; the Feather tip pokes from
  his pocket; the Moustache on the rail sees him, squawks and flies off. Push in to the cap brim. End card
  "NEXT: THE VERDICT" types on above the brim.
- Movers: climber, ladder sway, shadow, Moustache, waves, smoke.
- Camera: push in to an extreme close-up of the brim (brim below y 1000 so the card sits clear).
- → (P3 opens on this brim).

### Part 3: The verdict. Thread: the Feather, up to the Spark star

**L1 (0–5.7) "Last time, Inspector Dew raced across the ocean, and a pilot climbed onto the doctor's ship."**
- Event: open on P2's brim close-up; pull back: an engraving on The Daily Wire dated "31 July 1910". 2.4–4.0 plaque.
  Panels slide in: R4 RaceOvertake, R5 LadderShadow.
- Movers: Spark, dateline, 2 panels (each animating), page.
- Camera: pull-back reveal.
- → the Spark taps the title.

**L2 (6.1–9.2) "This is Caught by Wireless. Part three: the verdict."**
- Event: a clerk's rubber stamp thumps the subtitle on; the thump ripples through the page and lifts the cap of the
  pilot in the engraving, which comes alive.
- Movers: stamp, ripple, plaque lift, cap.
- Camera: push-through the engraving to the real deck.
- → the pilot on deck.

**L3 (9.6–12.3) "The pilot was really Inspector Dew, in disguise."**
- Event: the pilot lifts his cap and the bowler pops up out of it like a jack-in-the-box; the Feather springs from his
  pocket into the band. Kendall nods.
- Movers: cap, bowler pop, Feather, coat flap, Kendall, gulls.
- Camera: slow push to Dew's face.
- → Dew walks forward, camera at his shoulder.

**L4 (12.7–16.8) "He walked up to Mr. Robinson and said, "Good morning, Doctor Crippen.""**
- Event: into the captain's cabin; Mr Robinson rises from his seat; Dew's balloon "Good morning, Doctor Crippen." The
  Moustache shoots in through the porthole and lands on his lip: click. His eyes go wide. Tag "Illustration".
- Movers: Dew walking, door, Robinson rising, Moustache, porthole sea, Kendall in the doorway.
- Words: the balloon text.
- Camera: shoulder follow, then hold on the two faces.
- → his widened eyes become two portholes.

**L5 (17.2–21.6) "The chase was over. Police found Ethel too, still dressed as a boy."**
- Event: the race-map tokens bump together and a finish flag pops up; in another cabin Ethel B sits calmly; a Canadian
  policeman at the door gestures gently; she looks up and stands.
- Movers: tokens, flag, door, policeman, Ethel, porthole light.
- Camera: push-through a porthole into her cabin.
- → the map's dotted line starts running backwards.

**L6 (22.0–25.0) "The doctor and Ethel were taken back to London."**
- Event: a ship token sails the dotted line back; the ocean shrinks; London's skyline grows up around Liverpool and a
  dome rises.
- Movers: token, dotted line, waves, skyline growing, smoke.
- Words: token label "MEGANTIC".
- Camera: pull out, then push to the dome.
- → the dome's gold statue.

**L7 (25.4–31.5) "The doctor said he didn't do it. So a big trial began at London's famous Old Bailey court."**
- Event: the gilded Justice statue's scales sway; the camera descends through the dome into the court: the judge's
  silhouette, the jury settling, the gallery (Clara in her flowered hat), Crippen B in the dock shaking his head.
- Movers: scales, pigeons, jury settling (1), gallery heads, Crippen B, camera crane.
- Words: "OLD BAILEY" carved over the door.
- Camera: crane down from the statue into the courtroom.
- → the statue's giant scales hang over the court.

**L8 (31.9–38.7) "A scientist found traces of a rare drug in the remains. The doctor had bought that same drug that
winter."**
- Event: the bearded scientist holds up a report card "Traces found"; the chemist's window "LEWIS & BURROWS" slides in
  with snow outside; the poisons book flips to "19 Jan 1910 · per H. H. Crippen"; the closed bottle labelled
  "Hyoscine" slides next to the report; ClueRings link label and line; the bottle drops onto one scale pan and it dips.
  No microscope view, nothing poured, no effects.
- Movers: report card, shop slide, book pages, bottle drop, scale pan, snow.
- Words: "Traces found"; "Hyoscine"; "19 Jan 1910".
- Camera: hold on the scales, items slide into frame.
- → a scrap of striped cloth drifts down towards the other pan.

**L9 (39.1–44.9) "And with the remains was a piece of pajama shirt from a store where the doctor shopped."**
- Event: the clean striped scrap with its label drifts onto the other pan; the shop front "JONES BROTHERS · HOLLOWAY"
  slides behind; a drawer slides open with pyjama trousers that have no top; their stripes line up with the scrap's,
  click (ClueRing on the label). The scales tip.
- Movers: scrap, shop awning, drawer, stripes aligning, ClueRing, scales.
- Words: label "Jones Brothers (Holloway) Limited".
- Camera: push to the label, pull back to the scales.
- → twelve jurors lean in.

**L10 (45.3–52.0) "The jury said the doctor was guilty of murder. He was put to death, which was the law back then."**
- Event: the jury leans together, the foreman stands; The Daily Wire headline flips to "GUILTY"; the clerk closes the
  big case ledger; the wall calendar turns to "November 1910"; the court lamp dims softly. No prison, no rope.
- Movers: jury lean (1), foreman, headline flip, ledger, calendar page, lamp, Dew lowering his notebook (Feather
  bookmark).
- Words: "GUILTY"; "November 1910".
- Camera: slow pull back, still.
- → behind the closing ledger a door opens to daylight.

**L11 (52.4–56.8) "Ethel had a trial too. She was found not guilty, and went free."**
- Event: the court doors swing open on warm daylight (rays, ≤ 60% of frame); Ethel A in her own coat and hat, short
  bob, walks out with a small smile; a newsboy holds up "NOT GUILTY"; pigeons lift.
- Movers: doors, Ethel, light rays shimmer, newsboy, pigeons.
- Words: "NOT GUILTY".
- Camera: track with Ethel, tilt up to the sky.
- → in the sky above her the Spark blinks.

**L12 (57.2–62.7) "It was one of the first times a radio message from a ship helped catch someone."**
- Event: pull back from the Spark: the sky fills with today's signals (phone arcs, satellites crossing, a plane's
  blinking light, city lights below); the 1910 Spark stays the brightest, first star.
- Movers: Spark, 2 satellites, signal arcs, plane, city lights.
- Camera: pull-back reveal, scale jump.
- → one star in that sky flickers oddly.

**L13 (63.1–65.4) "But the story has one last twist."**
- Event: The Daily Wire page twists like a corkscrew; its dateline spins 1910 → 2007; a typewriter on it morphs into a
  laptop.
- Movers: page twist, date digits, typewriter morph, fog.
- Words: "2007".
- Camera: rotate with the twist (≤ 8° frame rotation, the page does the rest).
- → the twist unwinds into a modern lab.

**L14 (65.8–72.3) "In 2007, scientists tested a tiny sample kept from the trial. They said it did not match Cora's
family."**
- Event: a gloved scientist lifts the lid of an archive box "Trial sample, 1910": a sealed glass slide in a sleeve
  (never magnified). On the screen a family tree: Cora's warm cameo portrait (plume, smile) at the top, three present-day
  leaves glow; a jigsaw piece floats up and tries to fit, but bounces off.
- Movers: hands, box lid, 3 leaves glowing, piece wobble, screen cursor.
- Words: box label; "Cora's family" over the tree.
- Camera: push from box to screen.
- → a second hand reaches in and turns the piece around.

**L15 (72.7–77.4) "Other experts say that test may be wrong. The case has never been reopened."**
- Event: the second expert tugs the piece; tug-of-war between the two, neither wins; beside them a box "CASE CLOSED ·
  1910" with a padlock that yawns and stays shut. Tag "Some say…".
- Movers: 2 experts, the piece, padlock, papers fluttering.
- Camera: hold with drift.
- → the tug-of-war ribbon bends into a question mark.

**L16 (77.8–82.2) "Did the doctor do it? A jury said yes. Some people still argue."**
- Event: the Feather curls into a big question mark; the Moustache lands on its dot and tilts its "head", puzzled; at
  the left, small jury silhouettes nod "yes"; at the right, the experts still argue.
- Movers: Feather curling, Moustache, jury nod, experts, question mark bob.
- Camera: slow push to the question mark.
- → the Feather uncurls and floats up.

**L17 (82.6–88.4 + tail) "And it all came down to one captain, one hunch, and one message sent through the air."**
- Event: the Feather rises in one continuous line past Kendall's telescope ("one captain"), past the HunchBulb clicking
  on ("one hunch"), past the mast Spark leaping its gap ("one message"), up into the night sky over London, where the
  Spark becomes the star blinking dot-dash (P1's frame 0). The Feather's tip touches the star. End card "THE END".
- Movers: Feather, telescope, bulb, mast Spark, star, fog, gulls.
- Camera: one crane up, never stopping until the end card.

---

## 5. Notes for the orchestrator and builders

- **"Remains" count.** SERIES.md says "human remains" at most once per part. P1 (L16) and P2 (L1) say it once; P3 says
  "the remains" twice (L8, L9). The pictures never show anything, but the script owner should check whether L9 can say
  "And with it was…" in a fact-check reword.
- **Length.** P2 and P3 estimate ~88 s of speech before the tail; they need a short end-card hold to stay ≤ 89 s.
- **Tags in use:** "Illustration" (P1 L10, P3 L4), "As the captain told it" (P2 L8), "Short version" (P2 L11 ticker
  text, since the exact wording is unverified), "Some say…" (P3 L15). The DNA beat never resolves: the piece never
  clicks in or flies away.
- **Ethel** is never ringed as a suspect: the ClueRings in P1 L10 and P2 L8 sit on the brooch, the cap and the hands,
  never on her face or body, and she is always calm and sympathetic.
- **Motion check:** each beat lists ≥ 4 independent movers; ambient fog, sea and snow fields count once each.
