# The Stolen Smile: film kit

Shared code, art and sound for all three parts (`SERIES-BRIEF.md` "How the kit works"; look and devices from
`../pictures-pick.md`). Stills: `../stills/kit_*.jpg` (one per KitSheet page) and `../stills/kit_sheet.jpg`.

## Using it in a part
1. Copy `src/series/` → `film/src/series/`, and copy `public/fonts/*`, `public/monalisa.jpg`, `public/kit/*` into
   `film/public/` (same paths). Note the kit commit in PLAN.md.
2. `import { SeriesGrade, CameraRig, Plane, PLANE, Vincenzo, MonaLisa, … } from './series';`
3. Wrap the film in `<SeriesGrade fr={frame} grade="1911">` (mounts the SVG filters/gradients and loads the fonts).
   Every component draws from the `fr` you pass (absolute or scene-local, your choice); no clocks, no Math.random.
4. Sound: list your cues as `SeriesCue[]` (helpers below), write `sound/cues.json`, then
   `uv run --with numpy python <kit>/sound/series_sfx.py cues.json TOTAL_FRAMES out/sfx.wav` (or import `build_sfx`)
   and mix that track at 0 dB with your VO and music. Don't change the gains: they are the series levels.
5. Build it: `npm i` (remotion 4, react 19), `npx remotion studio`, KitSheet = `npx remotion bundle src/index.ts --out-dir out/bundle && ./stills.sh`.

Conventions: world coordinates are the 1080×1920 frame at camera zoom 1; actors stand on the floor line **y = 1500**;
puppets take `height` (Vincenzo 560 = the size unit; she is 270 at true scale). World components return SVG `<g>`
and go inside `<CameraRig><Plane>`; cards/captions are full-frame overlays (render them after the rig).
Lamp: `lamp="left"` (default, interiors: shadow falls right) or `"right"` (night halls).

## Decisions the kit made (no one to ask)
- Captions sit at the pick's **bottom strip, baseline y 1480** (inside the Reels safe area), not BUILD-BRIEF's top band:
  the pick reserves the upper third for name tags. `y` prop to move them.
- Colours: everything comes from `tokens.ts` (`C` = the pick's palette + costume tokens; `T` = derived set tones for
  walls/floors/sky). Kit additions: `suit #3A3631`, `shirt #EFE8DA`, `wood #B08A5E`, `parquet #C9B48D`.
- Paper texture and grain are pre-rendered JPGs (`public/kit/`, made with ffmpeg noise) instead of feTurbulence (cheaper).
- Cut-out rim + paper shadow is one SVG filter (`ss-cut`, no blur); props without rim use `ss-shadow`.
- Glint sits on her left eye (viewer's right). The P1 bundle / P2 trunk show her real eyes as a crop of the photo.
- The fame-gauge odometer and every label only show text you pass.
- Stamp sound = CC0 `cstack-cc0/rubber-stamp.flac` softened; all other series sounds are synthesized (`sound/synth.py`).

## The Mona Lisa image
`public/monalisa.jpg` (1280×1908) = Wikimedia Commons
[File:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg](https://commons.wikimedia.org/wiki/File:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg),
downloaded via `Special:FilePath/…?width=1200`. **Public domain** (PD-Art / PD-old: Leonardo da Vinci, d. 1519; faithful
2D reproduction). Never redrawn, warped or covered on the face: `<MonaLisa>` only crops, glows, frames, turns.

## API (one line each; all take `fr` unless noted)
### Look, camera, grade (`tokens.ts`, `util.ts`, `defs.tsx`, `grade.tsx`, `camera.tsx`)
- `C`, `T`, `SKINS`, `FONT {caption,type,display}`, `SAFE`, `VINCENZO_H=560`, `MONA_H=270` — tokens.
- `prog(fr,at,dur,ease)`, `pop(fr,at,damping)`, `swing(fr,at,amp,dur,speed)`, `stepped(fr,n=2)`, `rnd(seed)`, `blob()`, `wrect()`, `cut()`, `smooth()` — helpers (puppets step on twos).
- `<SeriesGrade fr grade?="1911"|"modern" wash?:0..1 grain?>` — paper texture, grain, vignette, flicker, sepia wash (wash sweeps left→right for the today→1911 change).
- `<SeriesDefs/>` — filters `ss-cut`/`ss-cut-l`/`ss-shadow`/`ss-shadow-l`/`ss-shadow-s`/`ss-fore`, gradients `ss-amber`/`ss-amber-soft`/`ss-lamp`/`ss-beam`/`ss-night-beam` (SeriesGrade mounts it). `cutout(lamp)`, `shadowOnly(lamp)`.
- `<CameraRig fr keys?:CamKey[] cam? drift?=1 seed?>` — one continuous camera; keys `[frame,{x,y,zoom,rot},ease?]`, cubic in-out, never parks (drift).
- `<Plane depth?=1 fore? opacity?>` — parallax plane; `PLANE = {backdrop .2, far .45, mid .7, actors 1, fore 1.35}`; `fore` darkens 15 %.
- `camAt(fr,keys)`, `parallax(cam,depth)`, `toScreen(cam,[x,y],depth)`, `useCam()` — aim overlays at world points.
- `<CarrierPush fr at dur?=30 x y r carrier? becomes? next toX? toY? toR?>{outgoing}</CarrierPush>` — the hand-off: push into the carrier, swap `next` in behind, carrier turns into `becomes` (nodes in viewBox −100..100).
- `<FoldUp fr at dur?=12 hingeY dir?="up"|"down" reverse?>` — pop-up-book hinge for flats (paper-flap sound).
### Cards and words (`cards.tsx`, `captions.tsx`)
- `<CornerTab fr part outAt? inAt?>` — "The Stolen Smile · Part N of 3", from frame 0, slides away at outAt.
- `<TitleCard fr at part hangX? hangY? plateY?=760 outAt?>` — plaque on two strings, two damped swings, typed label, holds ~2.2 s, lifts out. `titleCardTimes(at,part)` → `{typeAt,typeEnd,outAt,end,clacks[]}`.
- `<EndCard fr at part? text? x? y?=1150 hangFrom?:[x,y]>` — "Next: The hunt" / "Next: The return" / "The end", pinned with a stamp thump (hangFrom = hang on the hooks, P3).
- `<LastTime fr at outAt? x? y?>` — "Last time…" recap label.
- `<NameTag fr at text x?=540 y?=470 dur?=90>` — luggage tag swinging in from the top.
- `<HonestyTag fr at text?="Illustration" dur?=75 x? y?=1340>` — small Special Elite tag, bottom-left.
- `<Stamp fr at text x y rot? size? color?>` — red rubber stamp (`<g>`, "Not him", "Real!").
- `<Captions fr chunks show?=true y?=1480>` / `<CaptionStrip fr chunk index y>` — torn card strips, active-word underline, "Mona Lisa" amber. `textChunk(text,s,e)` for tests.
- `OverlaySvg`, `Pin` — full-frame svg wrapper, red pin.
### Cast (`puppet.tsx`, `characters.tsx`) — common props `fr x y height facing(1|-1) pose expr look talk hold holdFar under lamp opacity flat ghost`
- poses: `stand walk lift holdUp carry carryWalk rattle nod poker doorOpen reach trunkLid surprised heartHand sigh tipCap point shrug bow write peer handshake wave armsUp sit` (or a custom `Pose`); 8-step walk on twos.
- expr: `calm smile happy worried sweat surprised sad poker wink jawDrop sleepy`; `look=[dx,dy]` pupils; `talk 0..1` mouth.
- `hold` = node at the near hand (kept upright, px units); `under` = node tucked under the near arm (the smock bundle).
- `<Vincenzo costume?="smock"|"shirt"|"suit" hatOff? …>` — 560 px; `ghost` = sepia 40 % (P3 end, pose `tipCap`).
- `<Guard variant?="tall"|"short">`, `<ArtLover variant?="tall"|"medium"|"short" monocle?>`, `<Detective>`, `<Police force?="paris"|"florence" tone?>`, `<Geri>`.
- `<Person look={Look}>` — any extra person (baker, workers, Béroud…) in the same puppet style; `<Puppet look_={Look}>` underneath.
- `<Spider fr x y size? suitcase? thread?>` — tiny ink spider (P3 suitcase).
- `<Crowd fr x? y? w? rows? perRow? dy? scale? era?="1911"|"today" phones? flashAt? seed? flow?>` — seeded crowd, every person bobs on its own phase; `<CrowdPerson>` single bust.
### Her (`monalisa.tsx`)
- `<MonaLisa fr x y height?=270 glow?:0..1 glintAt?:frame|frame[] frame? glass? board?="front"|"back"|"edge" turn?:0..1 crop?="full"|"eyes"|"smile" shadow? id?>` — the PD photo; `crop` height = the band's height; back = wood + red seal.
- `<Glint fr at x y size?>` — the 8-frame star; `ML_EYES`, `ML_SMILE`, `ML_GLINT` image fractions.
### Devices and props (`props.tsx`)
- `<Hooks fr x y size? state?="holding"|"empty"|"web"|"bend" countAt? gap?=9 swayAt? web? bend? shadowLean? tagsOutAt?>` — the four hooks (number tags 1–4, bend→"?", shadows lean into a red "?"); `hookCountTimes(countAt,gap)`. `<Hook>` single, `HOOK_PATH`.
- `<QuestionMark fr x y size? straighten?:0..1 rot? shrug? stamp?>` — red "?" (hook curl); `straighten=1` / `<ExclamationMark>` = "!"; `stamp` = rubber-stamp version.
- `<FameGauge fr x y size? value?:0..1.18 tremble? smoke? burstAt? odometer? odoAt?>` — "Who knows her?", monocle→newspaper→globe, amber needle tip.
- `<Calendar fr x y size? pages tearAt?>` — tear-off calendar, pages fly.
- `<SmockBundle fr x y size? leak? eyes? rot? glintAt?>` — white bundle, amber leak, her eyes peek over.
- `<FrameGlass fr x y w? h? show?="frame"|"glass"|"both" split? fall? thumb? rot?>` — frame splits into 4 bars; glass box; thumbprint.
- `<Trunk fr x y size? lid? leak? eyes? contents?="none"|"clothes"|"silk" falseBottom? silkPull? glintAt?>` — white trunk, amber crack (hot/cold), false bottom, red silk pull reveals her.
- `<Letter fr x y size? write? sign? dropAt? envelope? rot?>` — illustrative lines, "Leonardo" signs on, ink drop.
- `<Magnifier x y r? rot? under? zoom?=1.6 giant? id?>` — lens magnifies `under` nodes.
- `<Thumbprint fr x y size? face? maze? color?>` — ridges; maze straightens; face = dot-eyes gag.
- `<Newspaper fr x y size? headline? masthead? rot? fade?>` — halftone front page, her name amber.
- `<Postcard fr x y size? gag?="balloon"|"bicycle"|"eiffel"|"plain" caption? rot?>`.
### Sets (`sets.tsx`) — all take `fr only?:('backdrop'|'far'|'mid'|'actors'|'fore')[]` so each piece goes in its own Plane
- `<SalonCarre state?="with-her"|"empty"|"empty+web"|"crowd" light?="monday"|"day" eyeFn?(i) herGlow? glintAt? herOff? web? hookCountAt? hookSwayAt? shadowLean?>` — `HER = {x:540,y:1040,hookY:880,h:270}`; `<PaperPainting x y w h kind eyeX eyeY>`.
- `<LouvreExterior state?="asleep"|"awake" length? liftIndex? lid? signAt? night?>` — eyelid shutters, snoring chimneys, "Closed on Mondays".
- `<Staircase door? knobOff? stretch?>` — 7 stone steps, wall lamp, door at x 760–1020 (daylight when open).
- `<ParisStreet width? lampX? morning?>` — façades, balconies, bakery, cobbles, lamp-post.
- `<PaperMap view?="paris"|"europe" fold? route?:string[] routeP? dot?:[x,y] dotGlow? labels?>` — `MAP_CITIES` (Paris, Milan, Florence, Rome).
- `<LittleRoom night? curtain? stove? windowView? bedSheet?>` — `TRUNK_SPOT = [860,1500]` (draw `<Trunk>` there).
- `<GeriDesk lampOn?>` — Duomo window, desk, lamp, inkwell; `DESK_TOP = [260,980,1250]`.
- `<PrisonCell tally?:0..7 postcard?>` — barred window, sunbeam, bench.
- `<ModernLouvre flashAt? flow? herGlow? glintAt?>` — today's wall, rope, her behind glass, phones crowd; `MODERN_HER`.
### Sound (`sound.ts`, `../sound/`)
- `SERIES_SOUNDS`: sting-smile, hook-clink, hook-hum, cloth-swish, glint, amber-shimmer, question-plink, question-plink-up, gauge-ratchet, gauge-boing, stamp, typewriter, paper-flap, calendar-tear (`sound/series.json` says when).
- `titleCardCues(at,part)`, `hookCountCues(countAt,gap?)`, `endCardCues(at)` → `SeriesCue[]` `{sound, fr, gain_db?, pan?, what?}`.
- `sound/series_sfx.py build_sfx(cues, total_frames, out_wav, fps=30)` — the mix helper (series gains, −3 dBFS ceiling).
