# Dream brain 01 (brief)

Status: script v0.2 approved with the hook (2026-11-06); VO generated; key-frame board v1 out for review.

## Request (Matthew, 2026-11-06)
"How the brain works when dreaming. We see a human sleeping and zoom into his head. We go to different parts of the
brain and see different happenings, even down to microscopic processes. Keep it easy to understand, 3rd grade reading
level, about a minute long, so not too in depth. Ask questions and give me different frame options so I can pick the
aesthetic."

## Defaults assumed (from the profiles; confirm)
- Instagram Reel 9:16, ~60 s, goal reach. Animated in code (Remotion + three.js), one continuous shot.
- ~3rd-grade reading level; hook in his "Most people think... but actually..." format.
- AI voice (design-m2, cloned from the approved clip) unless he wants another; no call to action.

## Draft chain (each part answers the one before; to become script v0.1 after his answers)
1. Hook: most people think the brain switches off in sleep; while dreaming, parts of it are about as busy as awake.
2. Dreaming sleep (REM) is switched on from the brainstem: the eyes dart, and the body is held still so you don't act
   the dream out.
3. The seeing part at the back of the brain makes pictures with the eyes shut.
4. The feelings part (amygdala) is turned up: why dreams feel scary or exciting.
5. The "does this make sense?" part at the front is quieter: why the weird stuff feels normal.
6. Memory part (hippocampus) replays pieces of the day and mixes them with older memories.
7. Microscopic: brain cells pass sparks and chemical messengers across tiny gaps; in dreaming sleep some messengers
   are turned way up and others almost off.
8. Recap through every part, landing back on the sleeper (waking up, the dream fading).
All claims to be checked against primary sources before the board.

## Style frames
`stills/style-frames/` (source HTML; `node render.cjs` re-renders): A luminous 3D, B flat cartoon, C paper
storybook, D clay toy 3D, each showing the sleeper zoom and the microscopic synapse.
Picker page: https://claude.ai/artifact/MXFL7ZPiT62BQ1NrV8YUQr
Recommendation: C (paper storybook) for the whole film.

## Decisions (Matthew, 2026-11-06)
- Style: A, luminous 3D (dark, light-emitting brain activity, macro-to-micro camera). The 3D person must be properly
  modelled; the style-frame sleeper was a placeholder.
- Voice: AI American male (design-m2), cloned from `projects/grand-canyon-01/vo/ref_design-m2_hook.wav`.
- Dream: he flies over his own town at night.
- Hook: "Most people think your brain switches off when you sleep. But when you dream, parts of it are almost as busy
  as when you're awake."

## Production
- VO: `vo/` (gen_vo.py clones every line from the design-m2 hook clip; assemble.py joins). 68.1 s, 191 words, transcript
  matches the script word for word (faster-whisper small.en). 2.8 words/s.
- Film: `film/` (Remotion 4.0.242 + three 0.169 + R3F 8). `python3 beats.py` -> src/beats.json; `./snap.sh <dir> <secs>`.
  Worlds in `src/scenes.tsx`: TownNight, Bedroom, BrainCity, DreamTown, Neuron; switched inside glows (Film.tsx).
- Board v1: https://claude.ai/artifact/6DUf5FvyfLMpa14By2zqsS (stills in `stills/board/web/`).
  Known weak: brain folds read as scribbles; seeing-parts model too small; memory ribbons not visible; dream crumble
  not built; head sculpt rough; no music or sound yet.

## 3D research and fixes (Matthew 2026-11-06: "do deep research on skills to generate 3d models for what is weak")
Report: `reports/3D modelling skills for dream brain.md` (8 skill sets consulted; notes in `research_notes/`).
Applied:
- Brain: real cortex from BodyParts3D 4.0 (CC BY 4.0, current licence page; older OBJ headers still say CC BY-SA 2.1
  JP) built by `data/build_brain.py` into six named regions; light streams along the folds in a shader.
- Neurons: real pyramidal-cell shape from NeuroMorpho.Org cnic_001 (CC BY 4.0) via `data/swc_to_json.py`.
- Dream model: groundless, crumbles from the edges at the alarm (dissolve idea from SummerEngine vfx-dissolve, MIT).
- Memory ribbons moved into view. Town and sleeper stay procedural (research: generators are GPU-only here).
- Sound: `film/sound/mix.py` (Floating Cities ducked; CC0 library + synthesized alarm). -14.5 LUFS, -2.0 dBTP pre-render.

## Credits for the caption
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS).
Brain model: BodyParts3D, © The Database Center for Life Science, CC BY 4.0.
Neuron shape: NeuroMorpho.Org (RRID:SCR_002145), cnic_001 (Wearne/Hof, PMID 12204204, 12902394), CC BY 4.0.

## Open questions
- Board v1 feedback (superseded by the first cut). Music (default: something intriguing, not playful).

## Fact-check of v0.1 (fresh agent, 2026-11-06)
Fixed in v0.2: REM named and "most vivid dreams" (dreams also happen outside REM); "most of your muscles" (breathing and
eyes keep working); "seeing parts" plural (primary visual cortex quiets in REM, higher visual areas get busier);
"turns up" not "way up"; "gets very quiet"; recap "front stops asking questions". Kept his chosen hook "Most people
think" (flagged: a claim about opinion with no source; alternative "You might think").
Sources: Nir & Tononi 2010 (PMC2814941), Maquet 1996, Braun 1998, Siclari 2017, Blagrove 2019 (PMC6849581),
RBD review 2021 (PMC8699681), QBI "What is a neuron". Picture note: the seeing glow sits low at the back and sides.

## Outstanding corrections
None yet.
