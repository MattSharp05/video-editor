# The Stolen Smile: pictures pick (series beat sheet)

Read before building: `SERIES-BRIEF.md`, the three `lines.txt` (they win over any wording here),
`research.md` (facts). This file decides the look, the devices, the kit and every beat. The kit
builder makes sections 1–3; the part builders make section 4 from the kit.

How ideas were judged: clear with the sound off first, then surprise, then spectacle (at least 3
independent movers per beat; a crowd bobbing as one block counts as one), then build cost in
Remotion (SVG + DOM layers, no three.js anywhere in this series). Where the brainstorm's pick lost
to a cheaper or truer picture, the beat says why.

---

## 1. The series look: "Toy theatre, printed in 1911"

Brainstorm Look B (paper toy theatre) as the base, Look A's newsprint only as physical props
(newspapers, postcards, posters, files), and one idea from Look C: **the Mona Lisa is the only
real painting in the world**. Everything else is cut paper and ink; she is a public-domain
photograph of Leonardo's panel, so she always looks real, small and precious next to the paper
world. No black void, no slides: every frame is a lit paper stage.

### 1.1 Palette (tokens in `film-kit/src/series/tokens.ts`; nothing else gets a literal colour)

| Token | Hex | Used for | Means |
|---|---|---|---|
| `paper` | `#F1E6CF` | backdrops, walls, most flats | the world |
| `paperShade` | `#DCCBA8` | second layer, floors, far flats | depth |
| `card` | `#F8F1E1` | caption strips, name tags, labels, title plaque | words you read |
| `ink` | `#231B16` | every outline, text, hair, hooks | lines |
| `sepia` | `#7A5A3C` | wood, furniture, trunk straps, frames' inner edge | old things |
| `stone` | `#A39A8A` | Louvre stone, stairs, cell walls | the building |
| `nightBlue` | `#2C3A57` | Monday halls, darkness, uniforms, shadows of hiding | empty / hidden / the law |
| `duskBlue` | `#5B6F93` | far planes of night scenes, windows at night | depth in the dark |
| `oldGold` | `#8E7347` | picture frames, the brass fame gauge | grand but dull |
| **`amber`** | **`#F2A93B`** (glow `#FFD27A`) | **only her**: the glow around the painting, the glow leaking from whatever hides her (smock bundle, trunk crack, red silk), the amber dot on the map, her name in captions, the gauge needle tip | **follow this: she is here** |
| `clueRed` | `#B8352A` | the "?" and "!", rubber stamps, the detective's red string, the red silk (`#A72B2E`, same family) | the question / the clues |
| `skin1..4` | `#E9C3A0` `#D9A57F` `#C08A64` `#9C6B4B` | faces and hands | — |

Rules: amber is never decoration. If amber is on screen, she is there (visible or hidden). A
sound-off viewer learns in part 1 that the warm glow = the painting, so in part 2 the glowing
crack of the trunk says "she's in there" with no words. Red only ever marks the mystery. Modern
scenes (P1 line 1, P3 lines 16–17) use the same paper world but with phone-screen white `#FFFFFF`
flashes; the change to 1911 is a sepia wash sweeping over (`grade="1911"`), not a cut.

### 1.2 Fonts (Google Fonts via `@remotion/google-fonts`, plus the repo's own)
- **Captions:** Hanken Grotesk 800 (repo).
- **Labels, dates, name tags, stamps, file drawers, "Part N of 3":** Special Elite (repo), the
  1911 typewriter.
- **Title logotype, newspaper headlines, posters:** Playfair Display 900 (Google).
- Permanent Marker is not used (it reads modern). No all-caps except headlines and stamps.
- Sentence case everywhere: "The Stolen Smile", "Part one: the vanishing".

### 1.3 Line, texture, grain, grade
- **Cut-paper figures:** flat fill + `ink` outline 3.5 px (props 2.5 px) at 1080×1920, paths with a
  slight hand-cut wobble drawn once (no boiling). A 4 px `card`-coloured paper rim just outside the
  outline on characters and hero props (the cut edge).
- **Paper shadow:** each cutout casts the same silhouette offset (+8 px, +10 px) filled
  `rgba(35,27,22,0.28)`, no blur filter (blur filters are slow in software rendering). Shadow
  offset follows the scene lamp: interiors lamp top-left, night halls window-right.
- **Paper texture:** one full-frame paper-fibre PNG (generated once with feTurbulence, saved as
  `kit/assets/paper.png`) laid over everything in `multiply` at 22 %, so all cutouts share it.
- **Grain:** three pre-rendered 540×960 mono noise tiles, scaled ×2, cycled every 2 frames
  (12 fps), `overlay` at 7 %. **Vignette** radial `ink` 0 → 18 % at the corners. **Flicker:**
  brightness 1 ± 0.015, seeded random, changes on twos. All in one `<SeriesGrade>` wrapper.
- **Animation rate:** the camera moves smoothly at 30 fps; puppet pose changes, expressions and
  small props step on twos (`useStepped(2)`), which gives the hand-made toy-theatre feel.

### 1.4 Depth and camera
- Every scene is 5 planes: `backdrop` (parallax 0.2), `far` (0.45), `mid` (0.7), `actors` (1.0),
  `fore` (1.35; foreground arches, door jambs, crowd heads, darkened 15 % with `ink`). The kit's
  `<CameraRig>` takes `x, y, zoom, rot` keyframes and moves each plane by its factor.
- **One continuous camera per part.** The camera never stops dead (minimum drift 6 px/s), eases
  cubic in-out, and only rotates for gags (±4°).
- **Hand-off = carrier push.** Each beat names a carrier: one object the eye is already on. The
  camera pushes into it until it fills the frame (≥ 120 %), the next scene is swapped in behind
  it, and the carrier turns into a thing in the new scene (a smock becomes a door, a calendar page
  becomes a front page). Kit API: `<CarrierPush at={frame} carrier={<Node/>} becomes={<Node/>}>`.
  No cuts, no crossfades of whole frames.
- Fold-ups are the second grammar: a flat may hinge up from the floor or down from the top (the
  pop-up book), 10–14 frames, with a paper "flap" sound.

### 1.5 Caption look
- Phrase captions (2–6 words), max 2 lines, Hanken Grotesk 800, 60 px, `ink` text on a torn
  `card` strip with the paper shadow; each strip lands with a random seeded tilt of −1.5°…1.5°
  and a 4-frame drop.
- Centre x, strip baseline at y = 1480 (inside the Reels safe area: keep clear of the bottom
  330 px, the top 220 px and the right 140 px). Width ≤ 860 px.
- Active word: a 5 px `ink` underline slides under it. The words "Mona Lisa" are always `amber`
  with an `ink` outline, nothing else gets colour.
- Name tags (first time a person is named): a `card` luggage tag on a string swinging in from the
  top, Special Elite 40 px, e.g. "Vincenzo Peruggia" / "Louis Béroud, painter". Upper third
  (y 300–620).
- Honesty tags ("Illustration", "Some say…"): Special Elite 28 px, `ink` 70 %, bottom-left corner
  of the picture area (y ≈ 1340), 2–3 s.

---

## 2. Series devices (four), title card, end card, recaps

Every device has one look and one sound, identical in all three parts (`film-kit/sound/`).

### 2.1 The four hooks (logo and clock) — sound: `hook-clink` (bright metal tink, synthesized)
Four black iron hooks in a row, like four dots of an ellipsis.
- **Part 1:** counted 1–2–3–4 holding her (one clink each, a small `card` number tag pops beside
  each), then **empty** (line 14). An empty hook never clinks: emptiness is a low `hook-hum`.
- **Part 2:** the empty hooks twist together into the **"?"** (recap), crowds stare at them
  (line 6), a spider spins a web across them while years pass (line 15).
- **Part 3:** the web is swept away and she is hung back; the same four clinks, same order,
  same tags (line 12). The end card hangs on them.

### 2.2 What hides her, and the amber leak — sound: `cloth-swish` (+ `glint` chime)
She is always wrapped in something, and her **amber glow leaks** out of it so we can follow her.
- **Part 1:** the white smock (a bundle under his arm; amber at the folds; her eyes peek over the
  top edge).
- **Part 2:** the trunk in his room: a crack of amber under the lid, which brightens as the
  detective gets close (hot/cold) and dims when he walks away. *Some say* tag (sources disagree
  where it was kept; a trunk is in the Smithsonian's account and in part 3).
- **Part 3:** the red silk under the false bottom of the same trunk; pulling it away is the
  reveal (magician's pull).

### 2.3 The "?" (the question) — sound: `question-plink` (pizzicato pluck, synthesized)
A `clueRed` paper question mark, its curl shaped exactly like one of the hooks.
- **Part 1:** born as a red rubber stamp on "think" (line 1: what you think is wrong) and again as
  the hooks' four shadows leaning together into a "?" on the empty wall (line 16).
- **Part 2:** the hooks bend into it (recap); the title plaque hangs on it; it hops from suspect to
  suspect on the pinboard; it hangs huge in the sky over Paris while the answer sits under it.
- **Part 3:** it drops out of the sky onto Vincenzo's head and straightens into a red **"!"**
  (line 8). After that it never appears again.

### 2.4 The fame gauge — sound: `gauge-ratchet` (clicks; spring `boing` only when it bursts)
A brass (`oldGold`) pressure gauge labelled "Who knows her?" in Special Elite, with three little
pictures round its dial: a monocle (art lovers) → a newspaper → a globe. The needle tip is amber.
A small odometer window shows numbers **only when the script says one**.
- **Part 1, line 2:** needle trembles at the monocle.
- **Part 2, line 4:** needle swings to the globe and smokes.
- **Part 3:** climbs on the Italy tour (line 11), odometer rolls to "100,000+" (line 13), the needle
  goes past the end and the glass pops (line 15), odometer reads "millions every year" (line 16).

### 2.5 How she "reacts" (the painting stays herself)
The Mona Lisa is the PD photograph, never redrawn, never warped: no moving eyes, no moving
mouth, no props on her face. She reacts only through:
1. **`glint`**: a tiny 4-point white-amber star on her left eye (her right), 8 frames, with the
   `glint` chime. Used at "Nobody stops him", the plumber, the police search, the reveal, the end.
2. **Light:** her amber halo brightens or dims (the "smile meter": brighter every time she
   becomes more famous; brightest on the last line of part 3).
3. **Camera:** pushes into her gaze (her eyes already follow you; the camera does the rest).
4. **Crops of the real image:** her eyes peeking over a cloth edge (the top band of the photo),
   and in part 1 the "Cheshire" crop of her real mouth floating in the empty spot.

### 2.6 Title card (identical motion every part)
- **From frame 0:** a small `card` tab top-left (x 64, y 230), Special Elite 34 px:
  "The Stolen Smile · Part N of 3". It satisfies "the series in the first ~4 s" even though the
  locked scripts say the title on line 3 (part 1) or line 2 (parts 2–3). It slides away when the
  full card plays.
- **On the title line:** `<TitleCard part={N} hangOn={node}>`: a `card` museum plaque with an
  `oldGold` frame drops in on two strings, swings twice (damped), "The Stolen Smile" in Playfair
  900 (96 px, ink), then a typed label under it (Special Elite 44 px): "Part one: the vanishing" /
  "Part two: the hunt" / "Part three: the return", typed with `typewriter` clacks. Holds ~2.2 s
  while the picture behind keeps moving, then is lifted up and out. Series sting `sting-smile`
  (a 2.5 s synthesized music-box phrase, three notes up and one down, "a smile") under it.
- What it hangs on is the part's carrier: P1 the four hooks, P2 the "?" hook, P3 the red silk
  ribbon lowered from the top.

### 2.7 End card (identical motion every part)
`<EndCard text="Next: The hunt">` / "Next: The return" / "The end": a small `card` gallery
label pinned onto the last frame's wall with one `stamp` thump, Special Elite 52 px plus the
small series logotype. Last ~2 s, over the still-drifting picture. P3's "The end" label hangs on
the four hooks under her.

### 2.8 Recaps ("Last time…")
A `card` label "Last time…" (Special Elite) pins top-left. Then three quick toy-theatre flats
slide across in 0.8–1 s each, built only from kit pieces so a part-1 viewer recognises them in
one look (see P2 line 1 and P3 line 1). The recap ends on the previous part's last object, which
is also this part's first carrier.

---

## 3. Cast, sets and props (the shared kit)

Sizes are at zoom 1 in a 1080×1920 frame. Vincenzo is the size unit (560 px tall). All people are
split-pin paper puppets: head, torso, upper/lower arms, legs on pivots; faces from swappable dot
eyes, line brows, small mouths. Real people are drawn as characters, never mocked: no exaggerated
features, friendly proportions (head ≈ 1/4 of height).

### 3.1 Characters

| Item | MUST / PART | Design | Poses and expressions (by part) |
|---|---|---|---|
| **Vincenzo Peruggia** | MUST (1,2,3) | Small (560 px; others ~640), slim, soft rounded shapes; oval head, dark hair parted at the side, neat dark moustache, gentle brows, skin2. Costumes: `smock` (long white work smock `#F7F3EA`, cap), `shirt` (sepia waistcoat, rolled sleeves), `suit` (thin dark suit, tie, bowler). Quiet and calm, never sneering. | P1: walk (8-step cycle), lift, carry-bundle walk, rattle door, sweat, sheepish thank-you nod. P2: calm poker face, door-open, lift trunk lid. P3: open trunk, lift false bottom, surprised at police, hand on heart, sigh in cell, ghost tip of cap (smock, sepia, 40 % opacity). |
| **The Mona Lisa** | MUST | Public-domain photo: Wikimedia Commons `File:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg` (https://commons.wikimedia.org/wiki/File:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg), public domain (PD-Art, PD-old); record URL + licence in the kit README. Mounted on a thin poplar board with a visible 6 px `sepia` edge when turned. True scale: 270 px tall next to Vincenzo (77 cm vs 160 cm). Optional `oldGold` frame and glass box layers. | `<MonaLisa glow={0..1} glint={frame} frame glass board="front"|"back"|"edge" crop="full"|"eyes"|"smile">`. Back view: plain wood with a seal (P3). |
| **Guards** (two) | MUST (1,2) | `nightBlue` long coats, kepis, brass buttons. One tall and thin (rectangles), one short and round (circles). | P1: shrug, point to "photographers", jaw drop. P2: hold the queue rope, guard the empty wall. |
| **Plumber** (Sauvet) | PART (1) | Blue-grey overalls (`duskBlue`), flat cap, bushy moustache, toolbag, big pliers and a key. Round, friendly. | Walk past, open door, doorman bow, tip cap. |
| **Louis Béroud** (painter) | PART (1) | Dark frock coat, short pointed beard, paint box, easel and half-finished copy canvas (paper copy of her, clearly a sketch). | Walk in, set easel, look up, brush drops, scratch head. |
| **Art lovers** (3, monocles) | MUST (1,2,3) | Top hats, tailcoats, monocles on ribbons; tall/medium/short. | P1: admire a bigger painting, monocle pops. P2: pushed aside by readers. P3: tiptoe at the back of a huge crowd. |
| **Detective** | MUST (2,3) | Bowler, brown overcoat (`sepia`), big but kind moustache, magnifying glass, notebook. Triangle-ish shapes. | P2: search room, dust print, peer, leave, pin string. P3: in the doorway of room 20 with handcuffs. |
| **Police officers** | MUST (2,3) | Paris agents: `nightBlue` capes and kepis (P2); Florence police in a plain dark uniform and peaked cap (P3; no plumes or insignia, to avoid period errors). | Search, carry lanterns, line the doorway. |
| **Guillaume Apollinaire** | PART (2) | Stout, round face, neat hair, dark suit, notebook and pen. | Led to cell, reads behind bars, walks out. |
| **Pablo Picasso** | PART (2) | Young (about 30), short, dark fringe, big dark eyes, dark work jacket and a sketchbook. **No striped shirt** (that's a later look). | Seated under swinging lamp, nervous, face-shuffle gag (his eyes/nose parts slide into a cubist arrangement and snap back), walks out. |
| **Franz Kafka** | PART (2) | Slim young man, dark hair, high collar, dark suit, bowler in his hands, small notebook. No exaggerated ears. | In queue, notices camera flash, jots a note. |
| **Cabaret singer** | PART (2) | Big hat with a feather, long gown in `duskBlue`, little stage. | Sings (mouth open/closed on twos), arm sweep. |
| **Clerk (files)** | PART (2) | Sleeve guards, round glasses, calipers. | Measures an ear, files a card. |
| **Alfredo Geri** | MUST (2,3) | Middle-aged, rounded, neat moustache, waistcoat with watch chain, pince-nez. Warm and clever. | P2: slit envelope, eyes widen, brows up. P3: read, eyebrows rise, wink, handshake. |
| **Giovanni Poggi** | PART (3) | Tall, thin, upright (rectangles; contrast with round Geri), trimmed beard, dark suit, loupe. | Hides a giant magnifier badly, examines cracks, turns panel, nods "real". |
| **Leonardo da Vinci** | PART (3) | Old man, long white beard, red cap, long dark robe, walking staff. Gentle. | Walks into the map with the painting under his arm, takes the chalk, rubs out, redraws, taps twice. |
| **Spider** | MUST (2,3) | Tiny `ink` dot spider with 8 lines. | P2: spins web across hooks. P3: packs a tiny suitcase and leaves. |
| **Crowds** | MUST | `<Crowd>` generator: 8 body cutouts × 6 hats × 4 skin tones × 3 coat colours, seeded; each person bobs on its own phase (counts as many movers, not one). `era="1911"` (hats, coats) or `"today"` (hoodies, phones up with white flash screens). | P1 line 1, P2 lines 4–6, P3 lines 11–16. |

### 3.2 Sets

| Set | MUST / PART | Design (5 planes) |
|---|---|---|
| **Salon Carré** | MUST (1,2,3) | `paper` walls hung floor to ceiling with big paper Old Masters in `oldGold` frames (cartoon paper paintings in the kit style, with simple faces whose dot eyes can slide; never imitations of real named works), skylight above (`duskBlue` at night/Monday, warm day), parquet floor in `paperShade`. Her spot at actor height between two big paintings; four hooks above her. States: `with-her`, `empty`, `empty+web`, `crowd`. |
| **Louvre exterior** | MUST (1,3) | A very long paper façade along a curving `duskBlue` Seine, rows of shuttered windows drawn as closed eyelids, a "Closed on Mondays" sign on a chain. States: `asleep` (P1), `awake` with shutters open (P3 line 12, glimpsed). P2 uses a separate doll's-house cutaway (PART 2). |
| **Back staircase + locked door** | MUST (1,2) | Narrow `stone` spiral of 7 steps, one wall lamp, a heavy door at the bottom with a brass knob that can come off. P2 revisits it: the empty frame and glass box still on the steps (crime scene). |
| **Paris street** | MUST (1,2) | Morning street: three-storey paper façades with balconies, a lamp-post, a bakery awning, cobbles, a far plane of rooftops. Also the base for the P2 postcard stand and the "Missing" poster lamp-post. |
| **Paper map** | MUST (1,2,3) | A folded paper map in `paper`/`paperShade` with `ink` streets: Paris street grid (P1 bird's eye), then the whole of France–Alps–Italy (P2 line 17, P3 lines 9–11). Cities as Special Elite labels: Paris, Florence, Rome, Milan. Folds can open and close. |
| **Vincenzo's little room** | MUST (1,2,3) | One small room: iron bed, small table, chair, stove, window with curtain, coat hook, the white trunk in the corner. Night version (P1 line 16, very dark, only amber leak), day version (P2). P3 recap uses its window. |
| **Geri's desk, Florence** | MUST (2,3) | A dealer's shop: paintings stacked against the wall, a desk with lamp, letter opener, inkwell; window showing a paper Duomo dome (Florence's landmark, so sound-off viewers know the city). |
| **Prison cell** | MUST (2,3) | `stone` walls, small high barred window with a sunbeam, bench. P2: bars are lines of handwriting (Apollinaire gag, a P2 overlay); P3: plain bars, tally marks, a pinned postcard. |
| **Modern Louvre** | MUST (1,3) | The same room shape as today's Mona Lisa wall: a wide wall, rope barrier, her behind glass, crowd plane of `<Crowd era="today">` with phones. Identical layout in P1 line 1 and P3 line 16. |
| **Pinboard + interrogation** | PART (2) | Cork board with photos, red string, a hanging lamp over a table. |
| **Doll's-house Louvre** | PART (2) | The façade swung open as a cutaway: 6 rooms in a 2×3 grid. |
| **Files room** | PART (2) | Wall of drawers labelled by body size. |
| **Printing press + globe** | PART (2) | A paper press that spits pages; a flat paper globe/world map behind. |
| **Hotel room 20** | PART (3) | Hotel Tripoli-Italia corridor (sign), stair, door with brass "20", small room with a bed and the trunk. |
| **Uffizi** | PART (3) | Workroom table with lamp (line 7); a gallery with crowds (line 11). |
| **Tour poster** | PART (3) | A 1913 poster in Playfair: "Mona Lisa · Italy · Florence, Rome, Milan". |

### 3.3 Props

| Prop | MUST / PART | Design |
|---|---|---|
| **Four hooks** | MUST | `ink` iron S-hooks, 34 px, in a row 60 px apart over her; states `holding`, `empty`, `web`, `bend-to-?`. Number tags 1–4. |
| **White smock** | MUST | The smock on Vincenzo and the smock-bundle (rounded white bundle with folds, amber leak, `eyes` window). |
| **Frame + glass box** | MUST (1,2) | `oldGold` frame (splits into 4 bars), glass box (pale `#DDE6EE` 35 % with white glints). P2: thumbprint on the glass. |
| **Doorknob** | PART (1) | Brass knob that comes off in his hand. |
| **Trunk with false bottom** | MUST (2,3) | White-painted wooden trunk (`#EDE8DD`) with `sepia` straps; lid opens; inside: shirts, socks, a false-bottom board, red silk bundle. Lid crack can leak amber. |
| **Red silk** | PART (3) | `#A72B2E` cloth bundle and a long ribbon (title carrier); pull-away animation. |
| **Letter signed "Leonardo"** | MUST (2,3) | Cream letter with handwriting lines (illustrative, not quoted), signature "Leonardo" in a script that writes on stroke by stroke, wet ink drop. Envelope with stamp. |
| **Thumbprint** | MUST (2,3) | `ink` concentric ridge pattern on glass; can grow into a maze; two little dot eyes for the "no drawer fits" gag. P3 reuses the ridge art for the crack "match". |
| **Fingerprint-file drawers** | PART (2) | Drawers with typed labels "Head: long", "Arm: medium", "Ear: big"… |
| **"?" and "!"** | MUST | `clueRed` paper cutouts; "?" curl = hook curve; rubber-stamp version. |
| **Fame gauge** | MUST | See 2.4. |
| **Calendar** | MUST (1,2,3) | A tear-off day calendar in Special Elite: "Monday", "Tuesday", "Day 1…7", "1911/1912/1913", "January 1914", "7 months". Pages tear and fly. |
| **Magnifying glass** | MUST (2,3) | `oldGold` rim, lens that magnifies what is under it (scale 1.6 inside a clip circle). Giant version (P3). |
| **Newspapers** | MUST (2,3) | Halftone front pages; headline slots in Playfair ("Mona Lisa stolen!", "Where is she?", "She's back!"); her photo printed in halftone dots. |
| **Postcards** | MUST (2,3) | Paper postcards around a small copy of her photo (never covering her face): hot-air balloon basket, bicycle, Eiffel Tower "Wish you were here". |
| **Name tag, caption strip, honesty tag** | MUST | See 1.5. |
| **Missing poster** | PART (2) | Poster "Missing" with her halftone photo that fades. |
| **Box camera + flash** | PART (1) | Photographer's camera on a tripod, flash powder puff. |
| **Easel + copy** | PART (1) | Béroud's easel. |
| **Lira notes stack, handcuffs, chalk + eraser** | PART (3) | Banknote bundles with a band "500,000 lire"; iron handcuffs; chalk line tool for the map. |

### 3.4 Kit build order (one builder, ~40 min)
1. **READY gate:** tokens, fonts, `<SeriesGrade>`, `<CameraRig>`/`<Plane>`, `<CarrierPush>`,
   `<Caption>`, `<NameTag>`, `<HonestyTag>`, `<TitleCard>`, `<EndCard>`, `<CornerTab>`,
   `<MonaLisa>`, `<Hooks>`, `<QuestionMark>`, `<FameGauge>`, `<Calendar>`, Vincenzo (3 costumes,
   walk + 6 poses), `<SalonCarre>`, `<Crowd>`, the sound palette.
2. **Then:** smock bundle, trunk, letter, magnifier, thumbprint, frame + glass, art lovers,
   guards, detective, police, Geri, staircase/door, little room, street, map, cell, Geri's desk,
   modern Louvre, newspapers, postcards.
3. PART-ONLY items are built by their part in the kit style.

### 3.5 Sound palette (`film-kit/sound/`, synthesized or CC0 `sfx-29`–`sfx-61` only)
`sting-smile` (title), `hook-clink`, `hook-hum` (empty), `cloth-swish`, `glint`,
`question-plink`, `gauge-ratchet` (+ `gauge-boing`), `stamp`, `typewriter`, `paper-flap`
(fold-ups and carrier pushes), `calendar-tear`. Same files, same gain in every part.

---

## 4. Beat sheets

Format per line: **Picture** (the event, what changes state) · **Movers** (independent) ·
**Printed** (words on objects, the first time the voice names them) · **Camera** · **Carrier**
(the point of focus that grows into the next line). Timings are rough (≈5 s a line); the VO
spine decides.

### Part 1: The vanishing

**1.1 "Lots of people think the Mona Lisa was always the most famous painting in the world."**
- Picture: open close on her real smile, pull back: today's Louvre, her behind glass, a sea of
  phones rising, flashes popping. On "think" a red "?" stamp thumps onto the glass.
- Movers: phones rising (staggered), flash bursts, heads bobbing, a selfie stick, the stamp, the
  camera pull. (6)
- Printed: CornerTab "The Stolen Smile · Part 1 of 3" from frame 0. Caption "Mona Lisa" amber.
- Camera: zoom 3.0 on smile → 1.0, slight rise.
- Carrier: the flashes freeze; a sepia wash sweeps left to right; the crowd flats fold down into
  the floor (pop-up book) and the 1911 Salon Carré folds up behind her.

**1.2 "But actually, before 1911, mostly art lovers knew her. Then someone stole her."**
- Picture: 1911 Salon Carré; she is small between huge paintings; three monocled art lovers admire
  a bigger painting next to her; the fame gauge pops in (fore plane), needle trembling at the
  monocle. "Then someone stole her": a white-sleeved hand reaches in from frame right and **zips**
  her off the wall; the tallest art lover's monocle pops out on its ribbon.
- Movers: 3 art lovers, gauge needle, the hand, the monocle, her glow streak. (7)
- Printed: calendar flip "1911" on the wall; gauge label "Who knows her?".
- Camera: slow truck right along the wall, then a whip-tilt 6° after the hand.
- Carrier: the empty spot between the paintings; inside it a crop of her real mouth stays behind,
  floating.

**1.3 "This is The Stolen Smile. Part one: the vanishing."**
- Picture: the Cheshire smile hangs in the empty spot, then slips away sideways; the title plaque
  drops and hangs on the four hooks (TitleCard). Four hook clinks under the sting.
- Movers: the smile crop, the plaque swing, the typed label, dust motes in the skylight beam. (4)
- Printed: "The Stolen Smile", "Part one: the vanishing".
- Camera: slow push on the plaque.
- Carrier: the last of the smile curve becomes a line that stretches and turns blue: the curve of
  the Seine.

**1.4 "Paris, 1911. The Louvre is a giant museum, and on Mondays it's closed."**
- Picture: pull back high over paper Paris: the Seine curve, the very long Louvre façade whose
  shutters are closed eyelids; it "snores" (chimney puffs in rhythm). The "Closed on Mondays" sign
  swings on its chain; a pigeon flaps along the façade and lands, tired.
- Movers: camera travel along the façade, chimney puffs, sign swing, pigeon, a boat on the Seine,
  one shutter twitching. (6)
- Printed: label "Paris, 1911"; calendar "Monday"; sign "Closed on Mondays".
- Camera: truck along the façade (it never seems to end), then stop at one window.
- Carrier: one eyelid shutter lifts; we push through it.

**1.5 "One Monday morning, a small man in a white work smock walks through the quiet halls."**
- Picture: a long empty gallery in cold `nightBlue` dawn light; tiny Vincenzo in his white smock
  walks the length of it; the paper portraits on the walls slide their dot eyes after him one by
  one, a wave of eyes.
- Movers: Vincenzo walking, 4–5 portraits' eyes in sequence, his shadow, dust in the window beams.
  (7)
- Printed: none (no name yet).
- Camera: wide (he is 1/6 of the frame) tracking with him, then push in on his face as he passes
  the last portrait.
- Carrier: his face reflected in a pane of glass.

**1.6 "His name is Vincenzo. He knows this place. He helped make the glass box that protects the Mona Lisa."**
- Picture: we are inside the glass box looking out at him; he breathes on the glass, the fog
  spells "Vincenzo" (as if written with his finger), he wipes it with his sleeve; behind the
  cleared glass we see her, with his reflection lying over her face. He taps the glass twice with
  a knuckle (two tinks): his box.
- Movers: fog bloom, the letters, sleeve wipe, his eyebrows/smile, reflection fade, her glow up.
  (6)
- Printed: name tag "Vincenzo Peruggia"; fog word "Vincenzo".
- Camera: slight orbit around the glass edge.
- Carrier: the reflection fades; the glass box's edge leads to the wall and hooks.

**1.7 "He walks into her room. She hangs on the wall on four iron hooks."**
- Picture: the Salon Carré (cold Monday light). Push in over her top edge: the four hooks light up
  one at a time with a clink and a little number tag 1, 2, 3, 4.
- Movers: Vincenzo crossing the room in the background, 4 hook highlights, number tags popping,
  skylight beam shift. (6)
- Printed: tags "1 2 3 4"; caption.
- Camera: push from the room to the hooks (zoom 1 → 2.4).
- Carrier: his two hands enter on her edges.

**1.8 "He lifts her off. Nobody stops him."**
- Picture: he lifts her; the empty hooks sway; silence. The big paper paintings around the room
  all turn their eyes to him; a cricket hops across the parquet; her `glint` flashes. A beat of
  nothing (the comedy beat).
- Movers: lift, hooks sway, 3+ painted faces' eyes, cricket, glint. (7)
- Printed: none.
- Camera: pull back to show the whole silent room, hold drifting.
- Carrier: we follow her under his arm through a small service door.

**1.9 "He carries her to a back staircase. There, he takes off her heavy frame and glass, and leaves them behind."**
- Picture: narrow stone stair under one lamp. He pulls; the frame splits into four bars that
  clatter down the steps; the glass box slides off and bumps down three steps, unbroken; he steps
  away leaving them like an empty shell.
- Movers: Vincenzo, 4 frame bars, glass box, lamp flicker, shadows. (7)
- Printed: none (the voice is clear).
- Camera: tilt down the spiral following the falling bars.
- Carrier: the empty frame on the steps; we pass through it like a window.

**1.10 "Now she's just a painting on a thin wooden board. He wraps her in his smock."**
- Picture: she turns edge-on: a thin 6 px board (surprise: she's so thin and small, about the size
  of a school notebook ghost-outline drawn next to her). He pulls off his smock and wraps her like
  a burrito; just before it closes her eyes peek over the edge; amber glow leaks at the folds
  (first time the leak is shown: this teaches "amber = her").
- Movers: board rotate, notebook outline, smock fling, wrap folds, glow, glint. (6)
- Printed: label on the board edge "thin wooden board" (Special Elite tag).
- Camera: orbit 30° to see the edge, then push into the white smock.
- Carrier: the white of the smock fills the frame and becomes the white-lit door at the bottom
  of the stairs.

**1.11 "But the door at the bottom of the stairs is locked."**
- Picture: he rattles the handle; nothing. The door stretches taller (paper stretch gag); the brass
  knob comes off in his hand (true detail); he stares at it; sweat drops pop. The bundle's eyes
  look at the knob.
- Movers: rattle, door stretch, knob, sweat drops, bundle eyes, lamp. (6)
- Printed: none.
- Camera: low angle, door looming; slight push.
- Carrier: footsteps; a shadow with a big pair of pliers slides onto the door.

**1.12 "Then a plumber walks by. He thinks Vincenzo is a worker, so he opens the door for him!"**
- Picture: the plumber walks in, opens the door with his key and pliers, then bows like a hotel
  doorman and holds it wide; Vincenzo nods a sheepish thank-you; from the bundle her `glint`
  flashes (her "seriously?"). Daylight blasts in.
- Movers: plumber walk/bow, pliers, door swing, Vincenzo nod, glint, light spill. (6)
- Printed: plumber's toolbag stencil "Plumber".
- Camera: two-shot, then pivot to the open doorway.
- Carrier: the daylight fills the frame.

**1.13 "Vincenzo walks out into the streets of Paris, carrying the Mona Lisa."**
- Picture: a morning street: a baker with baguettes, a lady with a little dog, a policeman who
  tips his hat to him, all brushing past within inches; the amber leak from the bundle under his
  arm. Then the camera cranes up: the street becomes the paper map of Paris, an amber dot wanders
  the streets and fades away.
- Movers: Vincenzo, baker, lady, dog, policeman, crane, amber dot. (7)
- Printed: caption "Mona Lisa" amber.
- Camera: track with him, then crane up to bird's eye.
- Carrier: the map folds up and turns into the Louvre roof; the calendar tears "Tuesday".

**1.14 "The next day, a painter comes to paint her. He finds only four empty hooks."**
- Picture: the Salon Carré in warm daylight. Béroud walks in with his easel and his half-finished
  copy, sets up, looks up: four empty hooks. His brush drops; he looks from copy to wall.
- Movers: Béroud, easel unfold, brush drop, calendar tear, camera push. (5)
- Printed: name tag "Louis Béroud, painter"; calendar "Tuesday".
- Camera: push past him to the hooks; close on four hooks on a big empty wall; `hook-hum`.
- Carrier: a guard steps into frame and shrugs.

**1.15 "At first, the guards think the photographers took her for pictures. They didn't."**
- Picture: two guards shrug and point down the hall; a thought bubble grows: a photo studio, her
  on an easel, a big box camera, a flash puff. On "They didn't." the bubble pops; the guards' jaws
  drop.
- Movers: 2 guards, bubble grow, camera flash, smoke puff, pop, jaw drops. (7)
- Printed: studio sign "Photographers".
- Camera: rise to the bubble, then fall back with the pop.
- Carrier: the pop leaves the empty wall.

**1.16 "The Mona Lisa is gone. And no one knows who took her."**
- Picture: the empty hooks; the light dims; their four shadows lean together into a red-edged "?"
  on the wall (`question-plink`). The camera passes between the hooks into darkness: a small dark
  room (Vincenzo's), a white bundle under the bed, amber leaking, her eyes in the gap, `glint`.
- Movers: light dim, 4 shadows, "?" form, push, bundle glow pulse, glint. (6)
- Printed: honesty tag "Illustration" on the dark room; EndCard "Next: The hunt".
- Camera: slow push through the hooks.
- Into part 2: the four empty hooks.

### Part 2: The hunt

**2.1 "Last time, a man named Vincenzo walked out of the Louvre with the Mona Lisa."**
- Picture: the four empty hooks. "Last time…" pins up. Three flats slide through the empty spot,
  quick: (a) she hangs on the four hooks, Vincenzo lifts her; (b) the smock bundle with her eyes;
  (c) the plumber bowing at the open door, Vincenzo walking out into daylight. Then the wall is
  empty again.
- Movers: 3 flats, Vincenzo, plumber bow, door, bundle glow. (6)
- Printed: "Last time…"; CornerTab "Part 2 of 3"; name tag "Vincenzo".
- Camera: steady push on the empty spot.
- Carrier: the four hooks twist and bend into one big red-edged "?".

**2.2 "This is The Stolen Smile. Part two: the hunt."**
- Picture: TitleCard hangs on the "?" hook; a detective's magnifying glass swings across like a
  pendulum; under the lens the typed "Part two: the hunt" is magnified.
- Movers: plaque, magnifier swing, typed label, "?" wobble. (4)
- Printed: title.
- Camera: follow the magnifier.
- Carrier: the magnifier drops to the floor; through the lens we see police boots.

**2.3 "The museum closes for a whole week while police search it."**
- Picture: the Louvre's front swings open like a doll's house: 6 rooms with tiny police in each:
  one lifts a sarcophagus lid and the mummy shakes its head; one checks behind a statue; one gets
  his head stuck in a big vase; lanterns everywhere; the "Closed" sign chained on the door; a
  calendar in the corner tears "Day 1 … Day 7".
- Movers: 6 rooms' police, mummy, vase head, lanterns, calendar. (8+)
- Printed: "Closed"; calendar "Day 1…7".
- Camera: pull back to the whole cutaway, then push to the calendar.
- Carrier: the last calendar page flies out of the window into a printing press and comes out as
  a front page.

**2.4 "Newspapers all over the world tell the story. Suddenly, everyone knows her name."**
- Picture: the press spits front pages ("Mona Lisa stolen!" with her halftone face); the pages fold
  into paper birds and fly over a flat world map to London, New York, Buenos Aires, Rome, a dot
  lighting at each landing. The fame gauge swings from monocle to globe and smokes; a monocled art
  lover is shoved aside by a crowd of readers.
- Movers: press, flying birds (5+ separate paths), landing dots, gauge needle, smoke, art lover,
  readers. (8+)
- Printed: headline "Mona Lisa stolen!" (amber "Mona Lisa").
- Camera: pull back from the press to the world, then glide over it.
- Carrier: one paper bird lands on a Paris lamp-post and opens as a song sheet.

**2.5 "People sing songs about her, and sell funny postcards."**
- Picture: on the Paris street, a cabaret singer on a tiny stage, notes fluttering out; a postcard
  stand spins, each card a gag: her photo in a hot-air balloon basket, on a bicycle leaving the
  Louvre, by the Eiffel Tower "Wish you were here!".
- Movers: singer, notes, stand spin, 3 cards each with its own little move (balloon rising, bike
  wheels, waving hanky). (7)
- Printed: song sheet "The Mona Lisa song" (illustrative); "Wish you were here!"; honesty tag
  "Illustration".
- Camera: track from stage to stand.
- Carrier: the last postcard shows the empty wall; push in and it becomes the real wall.

**2.6 "When the museum opens again, crowds line up to stare at an empty wall."**
- Picture: the Salon Carré full of people in a solemn queue facing four empty hooks; a man lifts
  opera glasses at nothing; hats come off; a guard holds the rope. Crane up: the queue snakes out
  of the door and round the block.
- Movers: crowd (individual bobs), opera glasses, hats, guard, crane, queue flowing. (6)
- Printed: sign "Open again".
- Camera: from the hooks back over the crowd and up.
- Carrier: the camera slides down the queue and stops on one young man.

**2.7 "One of them is the famous writer Franz Kafka."**
- Picture: a camera flash pops; a name tag swings over him; nobody else notices; he jots a line in
  a little notebook.
- Movers: flash, tag swing, pen, the queue shuffling, his eyes. (5)
- Printed: name tag "Franz Kafka, writer".
- Camera: push in.
- Carrier: his pen line keeps going and becomes the red string on a detective's pinboard.

**2.8 "Who did it? Police arrest a famous poet and lock him up for a few days."**
- Picture: "Who did it?": the "?" hops onto the pinboard and lands on a poet's photo. The photo
  becomes the poet himself led into a cell whose bars are lines of handwriting; he leans on them,
  reading; a small calendar tears 1, 2, 3 days.
- Movers: "?" hop, string twang, poet walk, cell door, calendar, policeman. (6)
- Printed: name tag "Guillaume Apollinaire, poet"; calendar "a few days".
- Camera: board → cell, sideways track.
- Carrier: the "?" hops along the red string to the next photo.

**2.9 "They even question a young painter named Pablo Picasso."**
- Picture: young Picasso at a table under a swinging lamp; detectives lean in; as the questions
  come, his eyes and nose slide into a cubist arrangement, then snap back. (Questioned, not
  locked up: no cell.)
- Movers: lamp swing, 2 detectives, face parts, his hands on the sketchbook. (5)
- Printed: name tag "Pablo Picasso, painter".
- Camera: slow circle round the table.
- Carrier: the lamp swings wide and lights both photos on the board.

**2.10 "But neither one stole her. Both are let go."**
- Picture: two "Not him" stamps thump onto both photos; the cell door swings open and the two men
  walk out into daylight, tipping hats; the red string droops; the "?" sits alone on the board and
  shrugs.
- Movers: 2 stamps, door, 2 men, string droop, "?" shrug. (7)
- Printed: stamps "Not him".
- Camera: pull back to show board and door.
- Carrier: the "?" points at the last card on the board: a thumbprint.

**2.11 "The thief left a thumbprint behind. But the police files can't match it."**
- Picture: back on the stair from part 1: the empty frame bars and the glass box on the steps; a
  detective dusts the glass and a thumbprint appears. The camera dives into its ridges, which
  become a maze; the tiny detective walks through it and meets a wall of drawers.
- Movers: brush, powder cloud, print appearing, dive, tiny detective. (5)
- Printed: card "Thumbprint".
- Camera: push into the print (zoom 1 → 8).
- Carrier: the maze walls straighten into rows of file drawers.

**2.12 "Back then, police sorted their files by body size, not by fingerprints."**
- Picture: a wall of drawers labelled "Head: long", "Arm: short", "Ear: big"; a clerk measures a
  man's ear with calipers; the thumbprint (two dot eyes) tries drawer after drawer: none fit (it
  has no ears), it shrugs.
- Movers: clerk, calipers, man, drawers sliding (3), thumbprint. (7)
- Printed: drawer labels; honesty: none needed (the fact is in research).
- Camera: rise up the drawer wall.
- Carrier: one drawer slides out: inside is a tiny room.

**2.13 "Police even knock on Vincenzo's door. They look around his little room, and leave."**
- Picture: the drawer room grows into Vincenzo's little room. A knock; a detective searches: under
  the bed, behind the curtain, in the stove. In the corner the white trunk leaks amber; as he gets
  closer the crack glows brighter (hot), her eyes in the crack; he turns his back, the lid snaps
  shut; he walks off (the glow cools). Vincenzo stands calm, poker-faced.
- Movers: detective, curtain, stove door, bed sheet, trunk lid, glow, Vincenzo's eyes. (7)
- Printed: honesty tag "Some say she was in a trunk".
- Camera: side view of the whole room, slight drift towards the trunk.
- Carrier: the door shuts; we pull out through the window.

**2.14 "And where is the Mona Lisa? Hidden in that same little room."**
- Picture: pull up into the sky: a giant red "?" hangs over the paper rooftops of Paris
  ("where is"). Then tilt down from it to one lit amber window ("hidden"), back inside: Vincenzo
  lifts the trunk lid; her face looks out at us; `glint`.
- Movers: rooftop chimneys smoking, "?" sway, window glow, lid, glint. (5)
- Printed: caption "Mona Lisa" amber.
- Camera: crane up, tilt down, push back in: one move.
- Carrier: the sunlight from the window starts sweeping across the trunk.

**2.15 "Days turn into months. Months turn into years."**
- Picture: the window cycles seasons (leaves, snow, sun) while a calendar flips 1911 → 1912 → 1913;
  the window frame then becomes the frame of the empty spot at the Louvre: a spider spins a web
  across the four hooks, dust settles.
- Movers: light sweep, leaves/snow, calendar, spider, web growing, dust. (6)
- Printed: calendar "1911", "1912", "1913".
- Camera: slow push into the window, then through to the hooks.
- Carrier: the web glistens and fills the frame.

**2.16 "Many people fear she's gone forever."**
- Picture: on a Paris lamp-post a "Missing" poster with her halftone photo fades in the sun until
  only her smile is left; a passer-by sighs; leaves blow past.
- Movers: fade, leaves, passer-by, poster corner flapping, hooks drooping (inset fore plane). (5)
- Printed: poster "Missing".
- Camera: slow push on the poster.
- Carrier: a gust tears the poster off; it flies away south.

**2.17 "Then, two years later, an art dealer in Florence, Italy, opens a letter."**
- Picture: the poster folds itself into a paper plane, flies over the paper map across the Alps to
  "Florence", turns into an envelope and drops through a shop window onto Geri's desk; he slits it.
- Movers: plane, map scroll, Alps, envelope, Geri, letter opener. (6)
- Printed: map labels "Paris", "Florence, Italy"; calendar "1913"; name tag "Alfredo Geri, art
  dealer".
- Camera: follow the plane, descend into the shop.
- Carrier: the letter unfolds until it fills the frame.

**2.18 "The writer says he has the Mona Lisa. And he signs it, Leonardo."**
- Picture: handwriting lines draw on; Geri's face rises above the letter, eyebrows up, pince-nez
  slipping; the signature "Leonardo" writes stroke by stroke with an amber glint on the last
  stroke; a drop of wet ink falls.
- Movers: writing, Geri's brows, pince-nez, signature, ink drop, lamp. (6)
- Printed: signature "Leonardo"; honesty tag "Illustration" (the letter's words are not quoted);
  EndCard "Next: The return".
- Camera: push on the signature.
- Into part 3: the ink drop.

### Part 3: The return

**3.1 "Last time, a letter arrived in Florence, signed Leonardo."**
- Picture: "Last time…" pins up. Three quick flats: (a) the four hooks with the cobweb; (b) the big
  "?" over Paris and one lit window; (c) the letter with "Leonardo" writing on. The ink drop falls,
  hits the paper and spreads into an ink map of Florence (river, streets, the Duomo).
- Movers: 3 flats, spider, drop, spreading ink. (6)
- Printed: "Last time…", CornerTab "Part 3 of 3", signature "Leonardo", map label "Florence".
- Camera: push into the drop.
- Carrier: a red silk ribbon unwinds across the ink map.

**3.2 "This is The Stolen Smile. Part three: the return."**
- Picture: the red silk ribbon lowers the TitleCard plaque; the ribbon ripples.
- Movers: ribbon, plaque, typed label, ink still spreading. (4)
- Printed: title.
- Camera: drift down the ribbon.
- Carrier: the ribbon wraps around a bundle of bank notes on Geri's desk.

**3.3 "The art dealer is named Alfredo. In the letter, the writer asks for a huge pile of money."**
- Picture: Geri at his desk reading; the stack of lira bundles grows past the desk, the ceiling
  flap folds open, up past the Duomo's dome; a pigeon lands on top; his eyebrows rise.
- Movers: stack growing, ceiling flap, pigeon, Geri's brows, letter. (5)
- Printed: name tag "Alfredo"; band on the stack "500,000 lire".
- Camera: tilt up with the stack.
- Carrier: the stack topples; the falling notes land as steps leading to a hotel door.

**3.4 "Alfredo pretends he wants to buy it. But secretly, he brings a museum expert to a small hotel."**
- Picture: Geri shakes hands in the air (pretend deal) and winks at us; beside him tall Poggi walks
  with a giant magnifying glass badly hidden behind his back, sticking out both sides; the hotel
  sign flickers.
- Movers: Geri walk, wink, Poggi walk, magnifier bobbing, sign flicker. (5)
- Printed: name tag "Giovanni Poggi, Uffizi museum"; sign "Hotel Tripoli-Italia".
- Camera: track with them up the steps.
- Carrier: up the stairs to a door marked 20.

**3.5 "In room twenty, a thin man with a mustache opens a white trunk."**
- Picture: the brass "20" swings like a knocker; the door opens on a thin man in a suit and tie
  with a moustache (the viewer knows him before the voice says it); he opens the white trunk;
  shirts and socks fly out.
- Movers: "20" swing, door, Vincenzo, lid, 3 flying clothes. (7)
- Printed: door "20".
- Camera: push through the door to the trunk.
- Carrier: the lid up; we look down into the trunk.

**3.6 "He lifts out a false bottom. Underneath, wrapped in red silk, is the Mona Lisa."**
- Picture: layers: shirts out, then a board lifts (false bottom), then a red silk bundle glowing
  amber; the silk is pulled away like a magician's cloth (`cloth-swish`), light floods up, her
  `glint`; Geri and Poggi lean in.
- Movers: board, silk pull, light flood, glint, Geri, Poggi. (6)
- Printed: none; caption "Mona Lisa" amber.
- Camera: top-down push, then rise as she is lifted.
- Carrier: a loupe comes down over her face.

**3.7 "The expert checks the tiny cracks in the paint, and a seal on the back. It's the real one!"**
- Picture: at the Uffizi table (the room behind slides past as she is carried across, one move):
  under the loupe the fine cracks; a reference card of crack lines slides over them and they match
  line for line, like the thumbprint ridges of part 2; Poggi turns the board over: a seal on the
  back. A stamp "It's real!" thumps; Poggi nods.
- Movers: loupe, cracks overlay, card slide, board flip, stamp, Poggi. (6)
- Printed: stamp "Real!"; label "Uffizi, Florence".
- Camera: macro push into the cracks, pull back for the flip.
- Carrier: the round stamp ring becomes a pair of handcuffs.

**3.8 "The police arrest the thief. It's Vincenzo."**
- Picture: back in room 20: police fill the doorway, handcuffs close; the giant red "?" from part 2
  drops out of the sky onto his head and straightens into a red "!" (`question-plink` upward).
- Movers: police (2), handcuffs, "?" falling, straighten, Vincenzo's surprise. (6)
- Printed: name tag "Vincenzo Peruggia"; calendar "December 1913".
- Camera: tilt up to catch the "?" falling, back down.
- Carrier: the "!" becomes a stick of chalk in his hand.

**3.9 "Why did he do it? He said the Mona Lisa belonged in Italy. He thought she had been stolen from there."**
- Picture: Vincenzo, hand on heart, at a chalkboard map of France and Italy; he draws a dotted
  chalk arrow from Italy to France labelled "stolen?"; a small boot-shaped daydream bubble shows
  her coming home to confetti and a little brass band; her real photo in the bubble stays still,
  glow cool (not convinced).
- Movers: chalk line, Vincenzo, confetti, band, bubble. (5)
- Printed: chalk "stolen?"; honesty tag "He believed this".
- Camera: slow push on the map.
- Carrier: an eraser comes into frame.

**3.10 "But that wasn't true. Leonardo da Vinci brought her to France himself."**
- Picture: old Leonardo walks into the map from the Italian side with the painting under his arm,
  takes the chalk from Vincenzo, rubs out "stolen?", walks across the Alps and draws the arrow
  himself, taps it twice; her glow warms.
- Movers: Leonardo walk, eraser dust, chalk, Vincenzo's shrug, glow. (5)
- Printed: name tag "Leonardo da Vinci"; honesty tag "Illustration".
- Camera: track with him across the map.
- Carrier: the route line becomes a tour route back through Florence, Rome, Milan.

**3.11 "Before she goes home, Italy shows her off. Huge crowds come to see her."**
- Picture: a 1913 tour poster "Mona Lisa · Italy · Florence, Rome, Milan" comes alive: at each city
  a gallery pops up out of the map with a packed crowd of hats around her; the fame gauge needle
  climbs; her glow brightens.
- Movers: 3 pop-up galleries, crowds, gauge, poster type, glow. (7)
- Printed: poster; city labels.
- Camera: track along the route.
- Carrier: past Milan the route runs on to "Paris", circled.

**3.12 "Then, in January 1914, she goes back on her wall in Paris."**
- Picture: the Salon Carré; calendar "January 1914"; the spider packs a tiny suitcase and leaves;
  the web is swept away; two workers lift her up; the four hooks take her: clink 1, 2, 3, 4 with
  the same tags as part 1. Through the window, the Louvre's shutters open.
- Movers: spider, broom, 2 workers, 4 hooks, tags, window. (9)
- Printed: calendar "January 1914", tags "1 2 3 4".
- Camera: push on the hooks exactly as in 1.7 (same framing), then turn to the doors.
- Carrier: the gallery doors burst open.

**3.13 "In just two days, more than a hundred thousand people come to see her."**
- Picture: a flood of people through the doors; the gauge's odometer rolls to "100,000+" and its
  number tiles pop out like popcorn; crane up: from above the crowd of hats forms a giant smile.
- Movers: crowd (individual), gauge, popping tiles, crane, guards waving. (6)
- Printed: odometer "100,000+"; label "2 days".
- Camera: crane up high.
- Carrier: one popping tile shrinks into a calendar page: "7 months".

**3.14 "Vincenzo spends about seven months in jail."**
- Picture: a plain cell; Vincenzo draws tally marks (seven); on the wall a pinned postcard of her
  (from part 2) catches the sunbeam with a soft glint; he sighs, then gives a small smile back.
- Movers: chalk tally, sunbeam drift, Vincenzo, postcard glint, dust. (5)
- Printed: calendar "about 7 months".
- Camera: slow push into the postcard.
- Carrier: the postcard grows into the real painting.

**3.15 "And the Mona Lisa? She's more famous than ever."**
- Picture: newspapers ("She's back!"), posters and a cinema screen show her; the three monocled art
  lovers from part 1 are crushed at the back of a huge crowd on tiptoe; one lifts his monocle and
  still can't see. The fame gauge needle goes past the end and the glass pops (`gauge-boing`).
- Movers: art lovers (3), crowd, newspapers, gauge pop, glow up. (7)
- Printed: headline "She's back!"; caption "Mona Lisa" amber.
- Camera: pull back over the crowd.
- Carrier: the sepia crowd colours into today's clothes; phones rise.

**3.16 "Today, millions of people visit her every year."**
- Picture: the exact frame from 1.1: today's room, her behind glass, the sea of phones and flashes;
  the gauge's odometer reads "millions every year"; the crowd flows past like a river.
- Movers: phones, flashes, flowing crowd, odometer, camera push. (5+)
- Printed: odometer "millions every year".
- Camera: the reverse of 1.1's move (wide → in).
- Carrier: the push towards her face through the flashes.

**3.17 "So the man who stole her smile helped make it the most famous smile in the world."**
- Picture: in the crowd, a faint sepia Vincenzo in his white smock appears, tips his cap, and is
  gone; the camera pushes into her real smile until its curve becomes the curve of the Seine (as
  in 1.3); her glow at its brightest; final `glint`. EndCard "The end" hangs on the four hooks.
- Movers: ghost Vincenzo, crowd, push, glow, glint, end card. (6)
- Printed: honesty tag "Illustration" on the ghost; EndCard "The end".
- Camera: one long push into the smile.
- Series end: the loop closes on the smile where part 1 began.

---

## 5. Notes for builders
- On-screen facts allowed (from `research.md`): Paris 1911; Monday; four hooks; Tuesday (the next
  day); Louis Béroud; a week closed; Apollinaire (a few days); Picasso questioned; thumbprint and
  body-size files; Florence; Alfredo Geri; Giovanni Poggi, Uffizi; Hotel Tripoli-Italia, room 20;
  500,000 lire; December 1913; Florence, Rome, Milan; January 1914; 100,000+ in two days; about
  7 months; millions a year. Do **not** print: the room's street address, a reward amount, any
  date for Leonardo, "left thumb", Valfierno.
- If a voice wording changes in `lines.txt`, keep the beat's picture and adjust only printed
  words that quote it.
- Never redraw the Mona Lisa; crops and glows only. Never put anything over her face.
