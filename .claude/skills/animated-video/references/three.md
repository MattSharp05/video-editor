# three.js in Remotion

Mechanics for any film with a three.js scene, whatever its style. Each item comes from a bug seen
in a render.

- Stack: `npm i @remotion/three three @react-three/fiber @types/three`. Use the template's
  `src/kit/three-canvas.tsx` instead of the stock `ThreeCanvas`: it holds each frame until the
  scene inside has drawn, so the first frame after a mount is never captured empty. Its `settle()`
  releases a `delayRender` after a state change.
- Keep one canvas mounted at a time. Build geometry and textures once in `useMemo`; per frame,
  update instance matrices and uniforms only.
- Hold the frame with `delayRender` until textures and images have loaded and been drawn, not just
  requested; a late texture otherwise shows as a missing object in random frames.
- `src/kit/finish.tsx` wraps a scene with optional bloom on bright pixels (an sRGB filter on the
  finished picture), a vignette and fine grain; tune or drop each layer per style. Grain also
  stops dark gradients banding after the platform recompresses the video.
- Budget: measure the heaviest frame with `npx remotion still` and keep it to a few seconds at
  full size; keep instance counts in the low hundreds of thousands.
- Framing: with a vertical field of view F, a camera at distance d frames a height of
  2·d·tan(F/2). Set distances from the size the subject must fill, before modelling detail.
- The template has no depth-of-field pass: draw background props as soft sprites or blurred
  planes (or use the motion kit's `Shutter` soft layer); sharp background geometry reads as a set.
- Nested transparent parts (an x-ray reveal, glass over a chip) need explicit `renderOrder`, or
  the outer surface paints over what it should reveal.
- A wrapper that clones materials (for a per-subtree effect) keeps the clones from seeing
  per-frame updates the original's owner makes, and a compile hook that closes over the original
  makes every clone read the original's uniforms. Bind hooks to the material being compiled, and
  avoid wrapping subtrees that animate their own materials.
- three.js r186: a standard or physical material lit by `scene.environment` ignores
  `envMapIntensity` unless it has its own `envMap`; assign the environment texture explicitly to
  scale one material's reflections. Lower a floor's metalness along with its specular, or metallic
  Fresnel keeps it mirror-bright at grazing angles.
- A screen-space pass that gathers neighbours (depth of field, bloom) spreads one NaN or infinite
  pixel into a black disc or bar. Sanitise its input (non-finite to 0, clamp to the half-float
  range).
- Tone map exactly once: in the renderer (`gl.toneMapping`) or in one later pass, never both.
- Dense multi-part motion, particles, impacts, camera rigs and motion blur:
  [motion kit](../templates/parts/src/kit/motion/README.md). Detailed outdoor sets:
  [realistic 3D](../styles/realistic-3d/README.md).
- Real places, satellite imagery, baked light and the measured cost of each look upgrade under software rendering:
  [look pass](look-pass.md) and the [terrain kit](../templates/parts/src/kit/terrain/README.md). Environment lighting
  on every surface costs ~0.8 s/frame without a GPU; keep it to water or hero objects.
- A camera that crosses scales (metres to tens of km in one shot) needs `logarithmicDepthBuffer` and a near plane
  around 1/5 of the closest subject; interpolate distance in log space and aim at the next subject before a big
  zoom-in, or the camera passes through walls.
- Load every texture and data file a film needs once at the top of the composition, outside the canvas, and mount the
  canvas only when all are ready (see projects/moon-tides-01/film/src/scenes.tsx `usePreload`). Loading inside a scene
  that mounts mid-film let frames be captured before the loaded state was drawn: the Bay of Fundy terrain and the moon
  were missing in stills even with `settle()`.
- **Hands:** use the hand part (`templates/parts/src/kit/hand.tsx`, open-source WebXR generic hand, MIT) rather than
  modelling one. Its 25 joint bones are siblings, so bending a knuckle doesn't carry the finger: the part chains them
  itself (setting bones directly gave kinked, "wiggly" fingers). Place it by pinch point, finger direction and back of
  hand, never by guessed angles ([characters](characters.md): guessed joint angles were the most common broken pose).
  Its sleeve must leave the frame in every shot that shows it: set `arm` long for wide shots.
- **Framing:** solve the camera instead of guessing it: `templates/remotion-film/frame.mjs` finds the pose that puts
  given world points at given screen spots (lead in the safe area, caption zone clear), then confirm in a still.
- **Render cost without a GPU** (4 CPUs, swangle, 1080×1920): about 2.3 s per frame for a lit 3D set at `dpr={1}`
  (code-history-01: 67 min for 58 s); `dpr={1.5}` roughly tripled it. Remotion's time-left estimate in the first
  minutes was 7 h for a 67 min render: time a 30-frame test instead.
- A system that is long along one axis (Earth-moon, a timeline) doesn't fit a 9:16 frame laid out horizontally: tilt the
  whole group so the axis climbs the frame diagonally.

- **No logarithmic depth buffer on the CPU unless the shot needs it** (self-driving-01): it writes depth per pixel,
  which defeats early-z under SwiftShader; dropping it took a street frame from 4.7 to 3.8 s. For a camera that
  crosses scales, set `near`/`far` per frame from the altitude (near ≈ alt/100, far ≈ alt×4) instead.
- **Skinned models: clone with `SkeletonUtils.clone`, never `object.clone(true)`.** A plain clone keeps the original
  skeleton, so the skinned part renders where the original stands while the rest moves (self-driving-01's rider stayed
  parked at the origin for the whole film while its bike moved).
- **Sourced GLBs often store quantised int16 positions** (KHR_mesh_quantization). Before transforming or splitting
  geometry, copy attributes to Float32 with `getComponent`; transforming in place overflows into shards.
- **Patch a material once.** An `onBeforeCompile` patch applied twice (two passes over a shared material) duplicates
  declarations and the shader fails silently: the mesh vanishes. Mark patched materials (`userData`) and clear the mark
  on clones.
- **Never stack big flat planes a few cm apart (a ground under a road), and never make a ground one huge quad.**
  On the CPU renderer, depth across a 2-triangle plane kilometres wide is too coarse to keep a 2 cm gap, so on single
  frames the lower plane drew over the upper one. In self-driving-01 the unlit ground replaced the road, so a lamp's pool
  and a car's shadow blinked out in about 60 frames, and stills didn't catch it. Subdivide large planes, put underlays
  ≥10 cm down with `polygonOffset` pushing them back, or cut them out. To find it, measure per-frame mean luma on the
  full cut and look for single-frame jumps; check a bad frame by hiding layers one at a time.
