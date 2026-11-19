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
- Custom geometry (tubes, lofts, webs built by hand): check the winding once in code, e.g. the face normal of the first
  triangle points away from its centre line (`dot(n, v - centre) > 0`). Octopus 01's arms had inverted winding, so
  FrontSide culled their outsides and they rendered as thin dark blades for two board rounds before a numeric print of
  the curve showed the curve itself was fine.
- Chained `onBeforeCompile` patches on one material share one shader: prefix each patch's uniforms (`uSkT`, not a
  second `uTime`, which is a GLSL redefinition and an `Object.assign` that overwrites the other patch's value), and
  when replacing three's `vec4 diffuseColor = ...` line keep the `vec4` declaration.
- Only the scene shell sets scene-wide state (`scene.background`, `scene.fog`, tone mapping), every frame. A child
  that sets it in `useMemo` runs after the shell on its first render, so the first frame of every still and every
  render chunk shows the child's value (Octopus 01: the skin world showed the reef's blue in stills only).
- Check procedural coverage with numbers, not by eye: cellular (Worley) noise with jittered feature points has nearest
  distances up to ~0.85 of a cell, so "fully open" sacs drawn at radius 0.66 never touched (Octopus 01).
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
- The environment map's background colour shows in mirror-like metal at grazing angles: a near-black one turned a
  polished coin dark at the edge of a pan (s2-coin-rotation). Keep it mid-grey unless the scene is dark.
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
- Never fly the camera through a solid into a different interior (a hull, a wall, a window): cut instead
  ([hard cuts](motion-principles.md#one-shot-one-thread), the motion kit's `shots()`). Inside/outside sets that swap
  by camera position (cabin shown when the camera is inside the hull) are safe only within one shot.
- A glass shell over things drawn later must not write depth (`depthWrite = false` while it is glass), or everything
  inside it fails the depth test and disappears (turbulence-seat-01's seat map).
- Load every texture and data file a film needs once at the top of the composition, outside the canvas, and mount the
  canvas only when all are ready (see projects/moon-tides-01/film/src/scenes.tsx `usePreload`). Loading inside a scene
  that mounts mid-film let frames be captured before the loaded state was drawn: the Bay of Fundy terrain and the moon
  were missing in stills even with `settle()`.
- **Hands:** use the hand part (`templates/parts/src/kit/hand.tsx`, open-source WebXR generic hand, MIT) rather than
  modelling one. Its 25 joint bones are siblings, so bending a knuckle doesn't carry the finger: the part chains them
  itself (setting bones directly gave kinked, "wiggly" fingers). Place it by pinch point, finger direction and back of
  hand, never by guessed angles ([characters](characters.md): guessed joint angles were the most common broken pose).
  Its sleeve must leave the frame in every shot that shows it: set `arm` long for wide shots.
  For a flat palm with the forearm at an angle (CPR, pressing down on a desk, a hand resting flat), use
  `templates/parts/src/kit/khand.tsx`: it places the hand by its wrist and draws the forearm in any direction (the kit
  hand's sleeve always continues straight from the fingers), mirrors the wrist offset for the left model (unmirrored,
  the left wrist's open end showed as a disc), and returns bone positions for glows on the knuckles.
- **Sourced meshes carry node transforms.** A glTF node may be rotated or scaled (a Sketchfab body was Z-up inside a
  rotated node), so `position` in a vertex shader is not "metres, y up": a centre line and a press deformation landed
  on the wrong axis. Bake the transforms into the geometry on load (`geometry.clone().applyMatrix4(mesh.matrixWorld)`,
  then add the mesh with an identity transform) before writing local-space shader effects.
- **Additive glow in a ShaderMaterial:** with `AdditiveBlending` the blend already multiplies by alpha; output the
  colour unmultiplied (`vec4(color, a)`), or a sheet at alpha 0.2 comes out at 4 % and looks missing. In GLSL,
  `pow(x, 2.0)` of a negative x is undefined (it drew nothing in SwiftShader): write `x * x`.
- **Show a closed interior with a section view** (a joint, an engine, an organ): clip the near half with
  `material.clippingPlanes` (set `gl.localClippingEnabled = true`), cap the cut with flat faces built from the same
  lathe or extrude profile (a rim plus an inner fill), and leave the moving parts (a bubble, a piston) unclipped. On
  s1-knuckle-crack the gap and its bubble were hidden by the bone's socket until the near half was cut away.
- **Framing:** solve the camera instead of guessing it: `templates/remotion-film/frame.mjs` finds the pose that puts
  given world points at given screen spots (lead in the safe area, caption zone clear), then confirm in a still.
- **Cut-away worlds** (a section through ground, a body, a machine): clip everything behind the face at its plane
  (`material.clippingPlanes` + `gl.localClippingEnabled`) or it pokes through; a hollow that grows only ever grows
  (tie its width to its height); after an event (a collapse) keep the shape physical: a box shaft read as "a lift
  car". projects/s4-sinkhole `FACE_SDF` (layers, joints, void SDF, discard) is one worked example.
- **Quantities as light:** additive glows saturate on bright surfaces (amber on snow looked as hot as on grass);
  show an amount with normal-blended opacity (0.9 vs 0.28) and keep additive for glows.
- **Render cost without a GPU** (4 CPUs, swangle, 1080×1920): about 2.3 s per frame for a lit 3D set at `dpr={1}`
  (code-history-01: 67 min for 58 s); `dpr={1.5}` roughly tripled it. Remotion's time-left estimate in the first
  minutes was 7 h for a 67 min render: time a 30-frame test instead.
- A system that is long along one axis (Earth-moon, a timeline) doesn't fit a 9:16 frame laid out horizontally: tilt the
  whole group so the axis climbs the frame diagonally.
- A generated `.glb` (image-to-3D) arrives in arbitrary units, off-origin, often with light painted into its texture and
  glTF's default metallic 1: fit it with the hero-assets kit (`../../hero-assets/templates/HeroModel.tsx`), preloaded
  outside the canvas like any texture. Propose one only through [hero assets](../../hero-assets/SKILL.md).
