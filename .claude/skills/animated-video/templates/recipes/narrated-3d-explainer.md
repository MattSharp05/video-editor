# Recipe: narrated 3D explainer

A 60–80 s Reel that explains how a real place or physical process works, told by one voice over
one continuous three.js shot that travels in scale: real terrain or a globe, the look pass, top
captions, a music bed and a few sounds on the picture's events. Made as
`projects/grand-canyon-01/` (77 s, terrain), `projects/moon-tides-01/` (70 s, ocean + globe +
terrain) and, in photoreal macro, `projects/code-history-01/` (58 s). Skill: animated-video.

**Pick it when** the subject is a place, a landform, the Earth and moon, a machine or anything
that must read as real, and the voice carries the explanation. Not for an app (the
[Trip app reel](trip-app-reel.md)) or a face on camera (the
[talking head](talking-head-captions.md)). A shot that needs glass, a photoreal close-up or a
simulation may go to Blender ([blender](../../references/blender.md)).

## Steps

1. **Script** with video-script: grade-3 reading level (measure with
   `projects/moon-tides-01/readability.py`), the "Most people think... but actually..." hook when it
   fits, no call to action unless asked. A fresh agent fact-checks it as worded.
2. **Pictures** from a fresh brainstorm agent and a picker (direct.md); the camera move per beat
   written as a thread, a movie and not a presentation (motion-principles.md). Board as data
   (`board.json`, `board.py`); approval before the build.
3. **Voice.** Matthew's take, or the AI voice ([ai-voiceover](../../references/ai-voiceover.md)): one
   approved reference clip, every line cloned from it (`projects/grand-canyon-01/vo/gen_vo.py`,
   `assemble.py` → `vo.wav`, `line_starts.json`, `words.json`). Check `words.json` against the line
   file, word by word.
4. **Timing.** `beats.py` reads `../vo/line_starts.json` (beats `l0`, `l1`…) and your named phrases
   (`billion`, `scour`, `pushed`, `rockfall`) → `src/beats.json`.
5. **Data** for a real place, from `projects/<slug>/data/`, written into `../film/public/`:
   `fetch_dem.py` (AWS Terrain Tiles), `fetch_imagery.py` (USGS, US only; elsewhere Sentinel-2
   cloudless 2016, CC BY, as Moon tides did), `prep_terrain.py`, `bake_light.py`. The template has
   the first and last in `parts/terrain-data/`; the middle two are in
   `projects/grand-canyon-01/data/`. They need numpy, scipy, scikit-image and Pillow:
   `uv run --no-project --with numpy --with scipy --with scikit-image --with pillow python fetch_dem.py`.
   Set `LAT, LON, Z, N` identically in each, and `SUN` to the imagery's sun.
6. **Skeleton.** Copy `templates/remotion-film/` and the terrain kit (`parts/src/kit/terrain/`;
   water kit, globe, realism or motion kit as needed); install three
   ([three.js](../../references/three.md) stack). The template's `ThreeCanvas`, and every texture and
   data file loaded at the top of the composition, outside the canvas, before it mounts.
   `logarithmicDepthBuffer`, near plane ~1/5 of the closest subject, camera distance interpolated
   in log space, aim at the next subject before a big zoom. Copy `grain0–3.png` from
   `projects/grand-canyon-01/film/public/` (`look.ts` loads them; no kit script makes them).
7. **Look pass** ([look pass](../../references/look-pass.md)): add upgrades in its order, each with a
   `--props='{"off":[…]}'` switch, and time 40 frames before and after each.
8. **Captions** from `parts/src/kit/captions.tsx`, warm scrim (`scrim="12,8,6"`) over sand and sky;
   labels pinned to the world stay inside y 480–1420.
9. **Sound.** `mix.py` in the shape of `projects/grand-canyon-01/film/sound/mix.py`: VO +10 dB,
   music 10–12 dB under it with the sidechain duck (not that file's `-15 dB, ratio 8`), cues as
   `beat + offset` from CC0 `library/sfx/` and labelled `anoisesrc` layers for rumble and grit,
   about 2.7 per 10 s. Master the WAV at TP -2. Options:
   [studio sound](../../../real-sfx/references/studio-sound.md#4-the-mix).
10. **Check.** Stills at every beat with `snap.sh` (fix every `fail` in `findings.json`), the
    fact-check of the film as shown, `motion_check.py` on a quarter-scale preview, the mute test.
11. **Render.** Time a 30-frame test first (`npx remotion render … --frames=0-29`, minus ~20 s
    start-up); render finals in 300-frame chunks through one queue when the film is long;
    `render.sh` for the picture, mux the mix, `cuts.py add`, `deliver.py`. Credits (music, imagery,
    elevation, NASA) in the post caption.

## Traps

- **The river ran backwards** (grand-canyon-01): the path's direction was reversed, so the camera,
  the sea line and the pebble flow were all wrong. Check the data's orientation (north, east, flow)
  in the first still, before anything is placed on it.
- **The camera dived through the ground twice** and once sat inside the pebbles underwater
  (grand-canyon-01). Aim early, interpolate distance in log space, keep the near plane small.
- **Small events vanish at phone size.** The flash flood was invisible three times (pale colour,
  timing, a broken strip; fixed as a bright tube), the rockfall too small, dust a grey disc
  (grand-canyon-01). Judge events on a phone-size still.
- **Labels and numbers off-screen or wrapping** (grand-canyon-01: labels off-screen twice,
  "5–6 million" wrapping). Use `frame.mjs` and keep text inside the safe area.
- **Textures captured before they were drawn** (moon-tides-01: the Fundy terrain and the moon were
  missing in stills even with `settle()`). Preload everything outside the canvas.
- **A long system doesn't fit 9:16** (moon-tides-01: the Earth–moon axis). Tilt it to climb the
  frame diagonally.
- **ASR "corrected" the voice** (moon-tides-01: "half as hard" read as "half is hard"; the voice was
  right). Check `words.json` against the line file.
- **Music inaudible** (moon-tides-01 v1: ~46 dB under speech, Matthew: "can you add music"). Measure
  the gap from stems.
- **True peak rose after AAC** (grand-canyon-01: -1.2 dBTP on the first export). Master lower,
  measure the MP4.
- **Environment light on every surface cost ~0.8 s/frame** (grand-canyon-01: 2.65 → 1.8 s/frame
  with it on the water only). Full look pass 0.85 → 1.8 s/frame; 77 s took 36 min.
- **Render estimates lie** (code-history-01: Remotion said 7 h for a 67 min render; 2.3 s/frame at
  `dpr={1}`, `dpr={1.5}` tripled it). Time 30 frames.
- **Dissolves between sets** (code-history-01: six 0.22 s dissolves, still an open correction).
  One shot with carriers; scene changes inside something the camera flies through (Moon tides used
  a haze).
- **Pages not read, fixes rediscovered** (code-history-01 skipped direct, motion principles, three,
  review and rediscovered six documented fixes). Read each step's pages.
- **Two terrain scripts crash at their last line** (smoke): `fetch_imagery.py` and
  `bake_light.py` end by saving a preview to another session's scratchpad path
  (`FileNotFoundError`). The real outputs are already written; delete that line in your copy.
- **The kit README lists four terrain scripts; the template has two** (smoke): take
  `fetch_imagery.py` and `prep_terrain.py` from `projects/grand-canyon-01/data/`.
- **Warnings in findings** (smoke): `THREE.Clock` deprecated and Chrome's software-WebGL notice
  (the template's `findings-allow.txt` now allows both), and `font_undeclared` for a system font.
  A real film bundles its fonts (`public/fonts/` with `@font-face`), as all three projects did.

## Smoke

A 6.5 s film: the template, the terrain kit on Grand Canyon 01's committed terrain data, its
first two VO lines and captions, a log-space push-in; three stills and a timed 30-frame render.
No network needed. `NM=/path/to/node_modules` reuses an install.

```bash
R=$(git rev-parse --show-toplevel); T=$R/.claude/skills/animated-video/templates; G=$R/projects/grand-canyon-01; D=$(mktemp -d)/3d
cp -r $T/remotion-film $D && cd $D && mkdir -p public src/kit/terrain
cp $T/parts/src/kit/terrain/*.ts src/kit/terrain/ && cp $T/parts/src/kit/captions.tsx src/kit/
cp $G/film/public/{terrain.json,h.bin,plateau.bin,dist.bin,imagery.jpg,normals.png,light.png,grain0.png,grain1.png,grain2.png,grain3.png} public/
echo '{"name":"recipe-smoke-3d","private":true,"type":"module"}' > package.json
if [ -n "$NM" ]; then ln -s "$NM" node_modules; else npm i -s remotion @remotion/cli @remotion/three react react-dom three @react-three/fiber @types/three typescript @types/react; fi
printf "import {Config} from '@remotion/cli/config';\nConfig.setChromiumOpenGlRenderer('swangle');\n" > remotion.config.ts
ffmpeg -v error -y -i $G/vo/vo.wav -t 5.8 -ac 1 -ar 48000 public/vo.wav
python3 -c "import json; W=json.load(open('$G/vo/words.json')); json.dump(W[:18], open('src/words.json','w')); json.dump([0.5]*400, open('src/vo_env.json','w'))"
sed -i "s|    # 'hook': at('first words'),|    'billion': at('2 billion'), 'million': at('5 or 6'),|" beats.py
sed -i 's/cue("second line first words")/cue("The canyon")/; s/cue("last line first words")/cue("The canyon")/' src/lib.ts
python3 beats.py
cat > src/index.ts <<'EOF'
import {registerRoot} from 'remotion';
import {Root} from './Root';
registerRoot(Root);
EOF
cat > src/Root.tsx <<'EOF'
import {Composition} from 'remotion';
import {Film} from './Film';
import {FPS} from './lib';
import B from './beats.json';
export const Root = () => <Composition id="Film" component={Film} durationInFrames={Math.ceil(B.total * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{captions: true}} />;
EOF
cat > src/Film.tsx <<'EOF'
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from './kit/three-canvas';
import {Captions} from './kit/captions';
import {useFields, makeBlock, shapeBlock, Fields} from './kit/terrain/terrain';
import {useLook, Look, fogUniforms, terrainMaterial, sideMaterial, skyMaterial} from './kit/terrain/look';
import {FPS, WORDS, prog, f as F} from './lib';
import B from './beats.json';
const LINES = ['This rock is almost [2] [billion] years old.', 'The canyon around it is only [5] [or] [6] [million.]'];
const World: React.FC<{f: Fields; look: Look; t: number}> = ({f, look, t}) => {
  const {camera, gl} = useThree();
  const blk = useMemo(() => makeBlock(f), [f]);
  const m = useMemo(() => { const U = fogUniforms(); return {top: terrainMaterial(look, U), side: sideMaterial(U), sky: skyMaterial()}; }, [look]);
  shapeBlock(f, blk, {depth: 1, width: 40});
  const k = prog(t * FPS, F(B.million), 60), dist = Math.exp(Math.log(40) + (Math.log(14) - Math.log(40)) * k);
  const az = THREE.MathUtils.degToRad(-20), el = THREE.MathUtils.degToRad(38);
  camera.position.set(Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist); camera.lookAt(0, 0, 0);
  gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 0.9;
  return (<>
    <mesh position={camera.position} material={m.sky} renderOrder={-1} frustumCulled={false}><sphereGeometry args={[250, 48, 24]} /></mesh>
    <hemisphereLight args={['#C9D9EE', '#7A5A42', 1.05]} />
    <mesh geometry={blk.top} material={m.top} /><mesh geometry={blk.side} material={m.side} />
  </>);
};
export const Film = ({captions}: {captions: boolean}) => {
  const fr = useCurrentFrame(), t = fr / FPS, f = useFields(), look = useLook();
  return (
    <AbsoluteFill style={{background: '#B9A79A'}}>
      {f && look && <ThreeCanvas width={1080} height={1920} gl={{logarithmicDepthBuffer: true, antialias: true}} camera={{fov: 40, near: 0.0002, far: 400}}>
        <World f={f} look={look} t={t} />
      </ThreeCanvas>}
      {look && <img src={look.grain[fr % 4]} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'overlay', opacity: 0.09}} />}
      {captions && <Captions t={t} words={WORDS} lines={LINES} accent="#FFC56E" font="Helvetica, Arial, sans-serif" scrim="12,8,6" />}
    </AbsoluteFill>
  );
};
EOF
./snap.sh out/check 0.5 4.5 6.0 || true   # exit 1 only on a fail finding; read findings.json
s=$(date +%s); npx remotion render src/index.ts Film out/t30.mp4 --frames=0-29 --concurrency=2 --muted --log=error
echo "30 frames: $(( $(date +%s) - s )) s (minus ~20 s start-up)"; echo "$D"
```

Pass: the sheet shows the canyon under both caption lines, `findings.json` has 0 fail, and the
30-frame render finishes. The data pipeline (step 5) needs the network; to smoke it too, copy the
four scripts into `$D/../data`, run them from there with the `uv run` line above, and compare the
sizes with Grand Canyon's `public/` files (they matched byte for byte on 2026-11-24).

## Checked against

2026-11-24, cloud container: Remotion 4.0.547, chrome-headless-shell 158.0.8127.2, React 19.3.1,
three 0.187.0, @react-three/fiber 9.8.2, TypeScript 7.0.2, Node 22.23.5, FFmpeg 6.1.1, Python 3.13.18;
data scripts with uv 0.11.32 (numpy 2.5.3, scipy 1.18.1, scikit-image 0.26.0, Pillow 13.0.0).
Ran: the block above, verbatim with `NM` set, 1 min 24 s in all (findings 0 fail, 1 warn, 2 allowed;
30 frames in 57 s at load ~3, about 1.3 s/frame after start-up; an earlier run at load ~8 took 111 s,
~3.3 s/frame; minimal scene without the full look pass, concurrency 2 on 4 CPUs); the four data scripts against the network (22 s, outputs identical in size to Grand Canyon's,
after the preview-line crash above). Not run: the AI voice generation, look-pass switches, water
kit, `mix.py`, `deliver.py` on this shape (it ran on the Trip and talking-head smokes).
