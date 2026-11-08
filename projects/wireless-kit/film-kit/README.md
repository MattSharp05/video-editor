# Caught by Wireless: film kit

Shared code, art and sound for all three parts (`projects/SERIES-BRIEF.md` "How the kit works"; look, devices, cast,
sets and props from `../pictures-pick.md`; care rules from `../SERIES.md`). Stills: `../stills/kit_*.jpg` (every
KitSheet page, title frames in sequence) and `../stills/kit_sheet.jpg`.

## Using it in a part
1. Copy `src/series/` → `film/src/series/`, `public/fonts/*` and `public/kit/*` → `film/public/` (same paths), and
   `EXPORTS.txt` → `film/film-kit-EXPORTS.txt` for the kit-redraw lint. Note the kit commit in PLAN.md.
2. `import { Grade, CameraRig, Plane, DewA, Spark, … } from './series';`
3. Wrap the film in `<Grade fr={frame}>` (mounts the halftone/mask/gradient defs, loads the fonts, adds grain and
   vignette as the top layer). Every component draws from the `fr` you pass; nothing reads clocks or Math.random.
4. World things return SVG `<g>` in 1080×1920 world coordinates: put them inside `<CameraRig fr keys><Plane depth>`.
   Cards, captions and tags are full-frame overlays (`<Layer>` svgs): render them after the rig.
5. Sound: build your cue list with the TS helpers (`titleCues`, `morseCues`, `endCardCues`, `moustacheCues`,
   `headlineCues`) plus your own `{sound, fr}` for the device sounds, write `sound/cues.json`, then
   `uv run --with numpy python <kit>/sound/series_sfx.py cues.json TOTAL_FRAMES out/sfx.wav`, and mix that track at
   0 dB under your VO and music. Don't change `series.json`: those are the series levels.
6. Kit sheet: `npm i && ./stills.sh` (bundles, renders each page's listed frames into `out/stills/`).

Conventions: actors stand on the floor line **y = 1500** (`FLOOR_Y`); `x, y` of a character = its feet. Near scale =
Dew 760 px (`NEAR_H`); Crippen is 608 (0.8×). Characters face right by default (`facing={-1}` flips). Puppets step
their loops on twos. Text on objects is never mirrored (ships take `facing` and keep their names readable).

## Decisions the kit made (no one to ask)
- **Fog bands** are SVG radial-gradient puffs (no PNG, no blur), same look as the pick's pre-rendered band, and no
  image loading race. Grain is 3 pre-baked 540×960 PNGs in `public/kit/` (numpy noise), cycled every 2 frames, 6 % multiply.
- **Print misregistration** is built into the one primitive `<Ink>` (fill +3,+2 from the ink line, halftone on the
  shadow side via bbox masks); `<Print off>` disables it, `<Print far>` switches to the far dot screen.
- **Captions** sit in the pick's band (y 1300–1470), not BUILD-BRIEF's top band: the pick reserves the upper frame
  for the plaque and tab. Word widths are estimated per character (Hanken 800 58 px), good to a few px.
- **Title timing**: plate rises at `at−14`, the Spark taps C-B-W (dot 2 f, dash 4 f) from `at` (default 72 = 2.4 s) and
  the last letter cools at `at+48` (= 4.0 s). `titlePlaqueTimes(at)` returns every tap for the beeps.
- **Cora's cheeks** get the cora dot cluster (`cheeks: 'cora'`), everyone else ink (Clara) or none.
- **Dew's own moustache** is small, clipped and mist so it never reads as the Runaway Moustache. Kendall also has a
  small clipped one (the pick doesn't say; it reads as "captain").
- **Ethel B's hanky** is newsprint; pass `hankyClue` only while a ClueRing sits on the cap. ClueRings never go on
  Ethel's face or body (SERIES.md).
- **Cellar**: `CellarFloor` is brick only, three lamp pools and nothing else; there is no prop for anything under it.
- **Sounds**: wing-flutter, ship horn + ocean, headline thunk (impact-deep), stamp and part of the crackle are CC0
  (`library/sfx/cstack-cc0`, Freesound CC0 1.0); the rest is synthesized in `sound/synth.py`. No sfx-01–28.
- The Moustache, Feather and Spark are separate components; characters only take a state for them
  (`CrippenA moustache="twitch"`, `DewA feather`, `DewB pocketFeather`) so the device stays one drawing everywhere.
- Simple versions (allowed by the pick's build order): `MontroseCabin`, `FatherPoint`, `PilotBoat` are deliberately
  plain; passengers are the generic rig in mist.

## API (one line each; every component takes `fr` unless noted)
### Look (`tokens.ts`, `util.ts`, `look.tsx`, `camera.tsx`)
- `C` palette: fog newsprint mist slate deep ink skin spark sparkCore sparkHalo cora clue lamp captionText — the only colours. `FONT {display, period, wire, ui}`. `FRAME`, `SAFE`, `PLANE {far .2, mid .5, near 1, fore 1.4}`, `NEAR_H 760`, `FLOOR_Y 1500`.
- `prog(fr,at,dur,ease?)`, `pop(fr,at,dur?)`, `osc(fr,period,phase?)`, `rnd(seed)`, `stepped(fr,n)`, `keyed(fr,[[f,v]…])`, `along(pts,t)`, `smoothPts`, `polyD`, `rrect`, `ellipse`, `wob`, `clamp`, `lerp`, `ease`, `easeOut` — helpers.
- `<Grade fr grain?=true vignette?=0.25 bg?=C.fog>` — top-level wrapper (defs, fonts, grain, vignette).
- `<KitDefs/>` — patterns `wn-ht` (near) `wn-htf` (far) `wn-htc` (cora) `wn-htl` (light on deep); masks `wn-shR|L|B|T|RB`; gradients `wn-lamp wn-fog wn-spark wn-beam wn-dawn wn-day wn-night wn-rays` (Grade mounts it).
- `<Print off? far?>` — misregistration/halftone context. `<Ink d fill? shade?='R'|'L'|'B'|'T'|'RB'|'full'|'none' sw?=5 line? lc? op? dots? transform?>` — the primitive. `<Halftone d dots?='near'|'far'|'cora'|'light' side?>`. `<Glow d k? op?>` — stacked-stroke spark glow.
- `<FogBand fr y speed?=0.6 height?=220 op?=0.7 seed?>` — one drifting band (use two per exterior).
- `<Layer>` — full-frame 1080×1920 svg for overlays.
- `<CameraRig fr keys?=[[frame,{x,y,zoom,rot}]] cam? drift?=1>` + `<Plane depth?>` — one eased camera, never parks. `camAt(fr,keys,drift)`, `planeTransform(cam,depth)`, `toScreen(cam,[x,y],depth)`, `useCam()`, `pushZoom(r)`.
### Cards and words (`cards.tsx`, `captions.tsx`)
- `<CornerTab fr part=1|2|3 outAt?>` — "Caught by Wireless · Part N of 3", x 48 y 72, from frame 0.
- `<TitlePlaque fr at?=72 outAt? offset?=[x,y]>` — enamel plate 840×230, top y 300; C-B-W taps burn the letters, settled by at+48. `titlePlaqueTimes(at)` → `{plateIn, taps[{fr,dur,kind,group}], groupStart, groupEnd, settled, sting}`.
- `<Subtitle fr at part outAt? beatAt?=at+18 offset?>` — "Part one · The missing singer" strip; beats: P1 footlights, P2 letters of "The chase" sprint off, P3 rubber stamp thump.
- `<EndCard fr at part? text?>` — Marconi telegram 800×440 centred, top y 560; slides up 12 f, types "NEXT: THE CHASE" / "NEXT: THE VERDICT" / "THE END" (2 f/letter) with a spark cursor. `endCardTimes(at,text)` → `{typeAt,typeEnd,letterFrames,minHoldEnd}`.
- `<HonestyTag fr at? text?='Illustration' x?=60 y?=1170 dur?>` — texts `HONESTY_TAGS`: "Illustration", "Some say…", "As the captain told it", "Short version".
- `<Captions fr chunks show?=true y?=1300>` — Hanken 800 58 px, 7 px deep stroke, ≤ 2 lines, spark Morse dash under the spoken word (6 f slide). `chunksFromWords(words.json, fps?, maxChars?=30)`, `textChunk(text,s,e)`, `capWidth(s)`.
- `PART_TITLES`, `PART_WORDS`, `NEXT_TEXT`.
### Devices (`spark.tsx`, `devices.tsx`)
- `<Spark fr x y size?=1 mode?='idle'|'tap'|'ride'|'star'|'glint' dir? at? op?>` — glint = 8-f flash from `at`; star blinks dot-dash.
- `<SparkTrail fr path=[[x,y]…] t len?=0.25 size? head?>` — the Spark riding a path; `sparkAt(path,t)` for the camera.
- `<MorseTap fr at code x y size? showCode?>` + `morseTimes(code,at,dot?,dash?,gap?,letterGap?)`.
- `<Moustache fr x y size? state at? tilt? facing?>` — states `MOUSTACHE_STATES`: on twitch droop sob sweat bristle fly perch land; `moustacheLandFrame(at)` = click frame.
- `<Feather fr x y size? state t? rot?>` — states `FEATHER_STATES`: onHat fall flag hatband pocketTip bookmark curlToQuestion (t 0..1) float; `questionDot(x,y,size)` = where the Moustache perches.
- `<DailyWire fr x? y? scale? rot? date prevDate? dateAt? headline prevHeadline? headlineAt? panels?=PanelFn[≤3] panelAt? engraving? ad? raceMap? fold?=0..1 twist?=0..1 place?='LONDON'>` — 640×860 page; PanelFn `(fr,w,h)=>node` (190×240 slots; engraving 580×330). `DAILY_WIRE` size.
- `<WantedPoster fr x? y? scale? rot? variant?='full'|'empty'|'walkOut' at?>` — 420×600; `<CrippenEngraving fr>` the portrait alone.
### Cast (`puppet.tsx`, `cast.tsx`) — common props `fr x y height? facing? pose expr hold? holdB? talk? op? litBelow? seed? far?`
- `<Cora feather?=true>` — poses sing wave laugh deal walk stand; expr sing laugh smile. `<CoraCameo fr x y size?>` — oval portrait (P3).
- `<CrippenA moustache?=state|'none' moustacheAt? glintAt? mono?>` — poses stand talk shrug point usher pullCard holdTelegram (telegram + hanky); expr neutral polite nervous blank.
- `<CrippenB hat?=true rail? moustache?='none'>` — poses walk holdHands deckChair (book) swat seated startled dock shakeHead; expr neutral startled calm. `moustache` lets the bird try itself on (P2 L9) or land (P3 L4).
- `<EthelA hair?='bun'|'bob' brooch? coat?>` — poses dance calm walk; expr smile calm.
- `<EthelB hankyClue? capSlip?=0..1>` — poses walk holdHands sitRead lookUp; expr calm unsure amused.
- `<Clara>` — poses wave leanAsk march flag (holds the Feather) seated; expr smile raised serious. `<Paul>` — wave leanAsk march; smile raised.
- `<DewA feather?=true>` — poses walk liftHat write (notebook + pencil) holdLamp leanDoor readTelegram leap removeHat seated; expr neutral serious still.
- `<DewB pocketFeather?=true bowlerPop?=0..1>` — poses climb walk liftCap talk; expr neutral smile.
- `<Kendall>` — poses telescope think holdPaper (WANTED) handNote nod; expr neutral think.
- `<Passenger kind='parasol'|'boater'|'hoop'|'steward'>` — idle loops (`PASSENGER_KINDS`). `<Constable>` — walk sweepLamp lampLow (+ `litBelow`). `<Newsboy>` — shout holdBoard.
- `CAST_POSES`, `CAST_EXPRS` — the model-sheet lists. Rig: `<Puppet look pose expr …>`, `poseAt(name,fr)`, `PoseName`, `Expr` (`EXPRS`), `Hold` (telegram hanky notebook pencil lamp telescope paper card book board feather note tray parasol hoop cards cane), `<HatShape kind>`, `<HeldItem kind>`, `<Face>`, `NATIVE_H`. Part-only people: build them with `<Puppet look={…}>`.
### Sets (`sets.tsx`) — world coords, floor y 1500
- `<Hilldrop fr variant?='night'|'snow'|'day' door?=0..1 sky? fog?>` — 39 Hilldrop Crescent; `HILLDROP {topStep, doorX, steps, window}`.
- `<HilldropSection fr clockSpeed?>` — dolls'-house cut-away; `SECTION_ROOMS {parlour, hall, kitchen, cellar, cellarDoor}`.
- `<CellarFloor fr lamps?=3 wobbleAt? lit?>` — closed brick floor + lamp pools only; `CELLAR_BRICK`.
- `<ScotlandYard fr view?='outside'|'inside' shutter?=0..1>` — `YARD {deskTop, window, doorLamps}`.
- `<Sea fr sky?='day'|'night'|'dawn' horizon?=900 skyOn? layer?='all'|'back'|'mid'|'front'>`, `<Sky kind>`, `<Snow fr>`.
- `<Montrose fr x? y? scale? smoke? lit? sparkMast? facing?>` — origin mid-waterline; `MONTROSE_PTS {mastFore, mastAft, porthole, funnelTop}`. `<Laurentic fr x? y? scale? smoke? facing?>`.
- `<MontroseDeck fr sky? sparkMast?>` — `DECK {mastTop, bridge, chairs, rail}`. `<MontroseCabin fr kind?='captain'|'passenger' door? sky?>` — `CABIN {porthole, door, seat}`.
- `<WirelessRoom fr tapping? taps? tape? tapeAt?>` — `ROOM {key, seat, tape}`.
- `<RaceMap fr w?=600 laurentic?=2 montrose?=4 dice? diceAt? flag? moustache?>` — square indices (fractions hop); `RACE_DATES`, `raceSquare(i,w)`.
- `<FatherPoint fr beam? boatX?=0..1 sun? crew? boat?>` — `FATHER {lantern, boatFrom, boatTo}`; `<PilotBoat fr x y scale? crew?>`.
### Props (`props.tsx`)
- `<Telegram fr x y scale? rot? text? typeAt? fold?>` · `<TickerTape fr x y text at? rate?=2 len? rot?>` · `<WirelessKey fr x y scale? taps? tapping? headphones?>`
- `<Notebook fr x y scale? rot? open?=0..1 lines? writeAt? bookmark?>` · `<PoliceLamp x y angle? beam? scale? beamLen? fr?>` · `<Telescope x y angle? extend? scale?>` · `<TelescopeView cx cy r?>`
- `<HunchBulb fr x y at? size? on?>` · `<ClueRing fr at x y r? rx? ry? out?>` · `<StoryBalloon fr x y w? h? tail? text? picture? wet? wetAt? fuzzy? at? fontSize?>`
- `<WallCalendar fr x y months? flipAt? scale? fly?>` · `<RopeLadder fr x y len? dropAt?>` · `<PilotCap fr x y scale? liftAt?>` · `<SeaBirds fr count? area? seed? size?>`
### Sound (`sound.ts`, `sound/`)
- `SERIES_SOUNDS`: sting spark-crackle morse-beep wing-flutter moustache-click feather-chime paper-flip headline-thunk newspaper-rustle ship-horn-bed ticker clue-ring hunch-click stamp type-tick. `SeriesCue {sound, fr, gain_db?, pan?, dur_fr?}`.
- `titleCues(at)`, `morseCues(code,at)`, `endCardCues(at,text)`, `moustacheCues(flyAt,landFrame)`, `headlineCues(flipAt)`.
- `sound/series_sfx.py build_sfx(cues,total_frames,out)` (CLI too), `sound/series.json` (series gains), `sound/synth.py` (rebuilds the wavs).
