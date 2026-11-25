# Procedural geometry and effect techniques in three.js r169 (WebGL2) for the dream-brain explainer, rendered deterministically in Remotion under SwiftShader

Scope note: the target project is `projects/dream-brain-01/film/`. Its package.json pins `three ^0.169.0`, `@types/three ^0.169.0`, `@react-three/fiber ^8.17.10`, `react ^18.3.1`, `@remotion/three ^4.0.242`, `remotion ^4.0.242` (read locally, 2026-11-06). Version and licence facts below come from `npm view` run on 2026-11-06 against the public npm registry (cited as the npm package page). Code recipes marked "Inference" are my own engineering synthesis from three.js r169 source and general graphics knowledge, not from a cited tutorial. Where I could not fetch a primary page (Codrops returned 403, Inigo Quilez's smin page returned 404 via the fetcher) I say so.

## Which libraries are drop-in compatible with three r169 + @react-three/fiber 8 (React 18), and what are their licences?

### Takeaway
Most of the ecosystem is MIT, but several libraries' *latest* releases have moved to three >=0.170/0.179 or React 19 / R3F 9, so versions must be pinned: drei 9.x, @react-three/postprocessing 2.x, postprocessing <=6.37.x range that admits 0.169, lamina 1.1.23, three-bvh-csg 0.0.17. three r169's own `examples/jsm` already ships MarchingCubes, Line2/LineMaterial, TubeGeometry, ImprovedNoise/SimplexNoise, MeshSurfaceSampler and BufferGeometryUtils, which cover most needs with zero extra dependencies.

### Cited Findings
- `meshline` 3.3.1, MIT, peerDependency `three >=0.137` (last modified 2024-06) — compatible with r169. It is the pmndrs-maintained fork of spite/THREE.MeshLine; API is `MeshLineGeometry.setPoints()` + `MeshLineMaterial` (+ `raycast`) — [npm meshline](https://npmjs.com/package/meshline); [One-Click-LCA fork note](https://github.com/One-Click-LCA/meshline)
- The older `three.meshline` 1.4.0 is also MIT (© 2015-2016 Jaume Sanchez Elias) but uses the legacy `MeshLine` API — [npm three.meshline](https://npmjs.com/package/three.meshline)
- `three-custom-shader-material` (CSM): latest 6.4.0, MIT, peer `three >=0.159`, `@react-three/fiber >=8.0`, `react >=18.0` — compatible with r169 + R3F 8. 6.3.7 has identical peers — [npm three-custom-shader-material](https://npmjs.com/package/three-custom-shader-material)
- CSM caveat: extending materials that already use `onBeforeCompile` "may or may not work depending on if the default `#includes` are mangled" — [CSM GitHub mirror](https://github.com/HonorableLeon/THREE-CustomShaderMaterial)
- `three-stdlib` 2.36.1, MIT, peer `three >=0.128.0` — compatible — [npm three-stdlib](https://npmjs.com/package/three-stdlib)
- `three-bvh-csg` latest 0.0.18 requires `three >=0.179.0` and `three-mesh-bvh >=0.9.7` — NOT compatible with r169. Versions 0.0.16/0.0.17 require `three >=0.151.0`, `three-mesh-bvh >=0.6.6` — pin `three-bvh-csg@0.0.17`. MIT — [npm three-bvh-csg](https://www.npmjs.com/package/three-bvh-csg)
- `three-mesh-bvh` 0.9.18 (and 0.8.3, 0.9.0), MIT, peer `three >=0.159.0` — compatible — [npm three-mesh-bvh](https://www.npmjs.com/package/three-mesh-bvh)
- `lamina` latest 1.2.2 needs `three >=0.170` and `react >=19` — NOT compatible. `lamina@1.1.23` needs `three >=0.138`, `react >=18`, `@react-three/fiber >=8.0` and depends on `three-custom-shader-material ^4.0.0` and `leva`. MIT, repo pmndrs/lamina — [npm lamina](https://www.npmjs.com/package/lamina)
- `maath` 0.10.8, MIT, peer `three >=0.134.0` — compatible — [npm maath](https://www.npmjs.com/package/maath)
- `simplex-noise` 4.0.3, MIT, no peers (pure JS; seeded via a PRNG function arg) — [npm simplex-noise](https://www.npmjs.com/package/simplex-noise)
- `@react-three/drei` latest 10.7.9 requires React 19 and R3F ^9 — NOT compatible. `@react-three/drei@9.122.0` requires `react ^18`, `@react-three/fiber ^8`, `three >=0.137` and bundles `meshline ^3.3.1`, `maath ^0.10.8`, `three-stdlib ^2.35.6`, `glsl-noise` — [npm @react-three/drei](https://www.npmjs.com/package/@react-three/drei)
- `@react-three/postprocessing` latest 3.2.2 requires React 19 / R3F >=9.7 — NOT compatible; 2.19.1 requires `react ^18.0`, `three >=0.138.0`, `@react-three/fiber ^8.0`, depends on `postprocessing ^6.32.1` — [npm @react-three/postprocessing](https://www.npmjs.com/package/@react-three/postprocessing)
- `postprocessing` (vanilla, by vanruesc) is **Zlib**-licensed, not MIT. Its peer range is narrow per release: 6.36.0 => `three >=0.157 <0.168` (excludes r169!); 6.37.0 => `<0.175`; 6.37.8 => `<0.181`; 6.38.0 => `<0.182`; latest 6.39.6 => `>=0.168 <0.188` — [npm postprocessing](https://www.npmjs.com/package/postprocessing)
- `@remotion/three` 4.0.541 peer `three >=0.137.0`, `@react-three/fiber >=8.0.0` — compatible — [npm @remotion/three](https://www.npmjs.com/package/@remotion/three)
- `three-subdivide` 1.1.5 (Loop subdivision), MIT, peer `three >=0.125.0` — [npm three-subdivide](https://www.npmjs.com/package/three-subdivide)
- `surface-nets` 1.0.2, `isosurface` 1.0.0, `marching-cubes-fast` 0.0.172 — all MIT (pure JS isosurface extractors usable for SDF meshing) — [npm surface-nets](https://www.npmjs.com/package/surface-nets); [npm isosurface](https://www.npmjs.com/package/isosurface)
- three r169 (installed in the project) ships, under `examples/jsm`: `objects/MarchingCubes.js`, `objects/InstancedPoints.js`, `lines/Line2.js`, `LineGeometry.js`, `LineMaterial.js`, `LineSegments2.js`, `math/ImprovedNoise.js`, `math/SimplexNoise.js`, `math/MeshSurfaceSampler.js`, `geometries/ParametricGeometry.js`, `geometries/ConvexGeometry.js`, `utils/BufferGeometryUtils.js` (with `mergeGeometries`, `mergeVertices`, `toCreasedNormals`, `computeMikkTSpaceTangents`) and core `TubeGeometry(path, tubularSegments=64, radius=1, radialSegments=8, closed=false)` — [three.js r169 examples/jsm (GitHub tag r169)](https://github.com/mrdoob/three.js/tree/r169/examples/jsm)
- SharkViewer (Janelia) is a three.js SWC neuron viewer, npm `@janelia/sharkviewer`; usage `loadNeuron(name, hexColor, swcParser(swcText))`; repo last pushed ~Jan 2023 — [SharkViewer GitHub](https://www.github.com/JaneliaSciComp/SharkViewer); [socket.dev @janelia/sharkviewer](https://socket.dev/npm/package/@janelia/sharkviewer)
- `space-colonization` npm package exists but is marked unstable with thin docs; its example uses regl, not three.js — [npm space-colonization](https://npmjs.com/package/space-colonization)

### Inferences
- Safe pinned set for this project: `three@0.169`, `@react-three/fiber@8.17`, `@react-three/drei@9.122.0`, `three-custom-shader-material@6.3.7` (or 6.4.0), `meshline@3.3.1`, `maath@0.10.8`, `simplex-noise@4.0.3`, `three-mesh-bvh@0.8.3`, `three-bvh-csg@0.0.17`, `three-subdivide@1.1.5`, and if post-processing is used, `@react-three/postprocessing@2.19.x` with `postprocessing` pinned to a 6.37.x release (peer `<0.175`). Avoid `postprocessing@6.36.x` (peer excludes r169) and do not let npm resolve the newest drei/lamina/R3F-postprocessing.
- Lamina is effectively superseded by CSM and pulls an old CSM v4 plus leva; prefer CSM directly (or plain `onBeforeCompile`).
- For a deterministic offline render, avoid drei helpers that animate in `useFrame` with wall-clock deltas (e.g. `<Float>`, `<Sparkles>`, `<Trail>` which samples previous frames); drive everything from Remotion's `useCurrentFrame()` instead (see the per-frame-cost section).
- The three.js-native modules (MarchingCubes, Line2, TubeGeometry, MeshSurfaceSampler, ImprovedNoise) are all MIT as part of three.js, so the whole stack can stay MIT/Zlib.

### Gaps
- I did not verify that `three-custom-shader-material@6.x`'s chunk-patching matches r169's exact `#include` names by running it; peers allow it, but test-compile once.
- No source confirmed whether `meshline@3.3.1` shaders compile cleanly on r169 (peer range says yes; not runtime-tested here).

## Per-frame cost under software WebGL (SwiftShader) in Remotion, and what to precompute once

### Takeaway
Remotion renders three.js through `<ThreeCanvas>` with animation driven by `useCurrentFrame()` rather than `useFrame()`, and recommends the `angle` GL backend (SwiftShader-backed `swangle` is the CPU path). Because every pixel shader runs on the CPU, fragment cost × resolution × overdraw dominates: bake geometry, noise fields and textures once (module scope / `useMemo`), keep per-frame work to uniforms and instance attributes, and keep fullscreen post-processing passes few.

### Cited Findings
- `<ThreeCanvas />` lets you use `useCurrentFrame()` and other Remotion hooks inside an R3F Canvas; "Animations are now not inside a `useFrame()` hook, but directly rendered into the markup." — [Remotion docs: @remotion/three](https://www.remotion.dev/docs/three)
- "Three.JS does not render with the default OpenGL renderer - we recommend to set it to `angle`." Locally via `Config.setChromiumOpenGlRenderer('angle')`; for SSR APIs (`renderMedia()`, `renderFrames()`, etc.) pass `chromiumOptions: { gl: 'angle' }` explicitly because the config file is ignored — [Remotion docs: @remotion/three](https://www.remotion.dev/docs/three)
- A `<Sequence>` inside `<ThreeCanvas>` needs `layout="none"` (it renders a `<div>` otherwise) — [Remotion docs: @remotion/three](https://www.remotion.dev/docs/three)
- `useOffthreadVideoTexture()` displays the exact frame as a texture during rendering (frame-accurate video textures) — [Remotion docs: @remotion/three](https://www.remotion.dev/docs/three)
- three r169 `MarchingCubes` is CPU-side: it allocates `field = new Float32Array(size³)`, a normal cache of `size³*3`, and position/normal arrays of `maxPolyCount*3` vertices (default `maxPolyCount = 10000`); the source comments "size of field, 32 is pushing it in Javascript :)", and it warns when buffers are too small. Constructor: `MarchingCubes(resolution, material, enableUvs=false, enableColors=false, maxPolyCount=10000)`; methods `addBall`, `addPlaneX/Y/Z`, `setCell(x,y,z,value)`, `blur(intensity)`, `reset()`, `update()`; default `isolation = 80` — [three.js r169 MarchingCubes.js](https://github.com/mrdoob/three.js/blob/r169/examples/jsm/objects/MarchingCubes.js)

### Inferences
- Choose `--gl=swangle` (ANGLE on SwiftShader) when no GPU exists; `angle` may fall back to it anyway in a GPU-less container. Verify with a one-frame render and `gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)` logged once.
- Precompute once (module scope or `useMemo([], …)`): brain mesh (displaced + `mergeVertices` + `computeVertexNormals`), any reaction-diffusion texture (run Gray-Scott on the CPU in a Float32Array or once on the GPU, then freeze as a `DataTexture`), marching-cubes head/body meshes (call `update()` once, then copy to a static `BufferGeometry`), neuron tube geometry (merged into one geometry), town instance matrices + per-instance seeds, ribbon curves and their sampled frames, dissolve noise as a baked texture if 3D noise is too costly per-fragment.
- Per frame only: uniforms (`uTime = frame/fps`, `uProgress`), a handful of `instanceMatrix` updates, camera. Never re-run marching cubes, TubeGeometry or space colonization per frame.
- Determinism: replace `Math.random()` with a seeded PRNG (`mulberry32(seed)`; `simplex-noise` 4 takes a random function in `createNoise3D(prng)`), and derive time solely from `frame`. No `useFrame` deltas, no `clock`, no ping-pong buffers that carry state across frames (if a simulation is needed, it must be recomputable from frame 0 or fully baked beforehand).
- Fragment cost: SwiftShader is roughly linear in pixels shaded. Keep 3D simplex/fbm octaves in fragment shaders to 2-4, prefer moving noise to the vertex shader or a baked texture; avoid raymarching full-screen SDFs (very heavy on CPU); keep transparent/additive layers' screen coverage small (overdraw); limit bloom to one mip-chain pass at reduced resolution or fake glow with additive sprite billboards/fresnel.
- Shadows: avoid real-time shadow maps (extra pass per light); bake AO into vertex colors or use cheap hemisphere + rim lighting.
- Render at the final resolution only once looks are locked; iterate at half resolution.

### Gaps
- No cited benchmark for SwiftShader per-frame times with three.js; measure on this container (render a 10-frame test and time it).
- Remotion's docs page I fetched did not mention `swangle`/`swiftshader` explicitly; confirm the option list on Remotion's `chromiumOptions` / `--gl` docs.

## Recipe 1: believable brain surface (gyri/sulci) and light "traffic" flowing along the folds

### Takeaway
No ready-made three.js gyri/sulci shader was found; the practical recipes are (a) a deformed ellipsoid/sphere hull (prisoner849's `deform()` on discourse) plus (b) a folding pattern applied as displacement: ridged/domain-warped noise or a baked Gray-Scott "labyrinth" reaction-diffusion texture. Signals flowing along folds are best done as a fragment-shader band that moves along the fold field's iso-lines, or as fat lines/ribbons on curves that follow the gyri.

### Cited Findings
- prisoner849's "SYNAPSES: Fat lines + Selective Bloom" brain: every part starts as points on a unit sphere passed through one `deform(p)` using `ImprovedNoise` (Perlin), a `smoothstep` falloff on |x| to carve the longitudinal fissure, and regional axis scaling; flows are fat lines from `CatmullRomCurve3`; the author copied and edited the full `LineMaterial` shader rather than string-replacing. Code (verbatim): `let ns = perlin.noise(v3.x*3, v3.y*3, v3.z*3); ns = Math.pow(Math.abs(ns), 0.5)*0.5; let r = smoothstep(0.375, 0, Math.abs(v3.x)) - ns; p.setLength(mainR - r*0.5); p.y *= 1 - 0.5*smoothstep(0, -mainR, p.y); p.y *= 0.75; p.x *= 0.75; …` — [discourse.threejs.org: SYNAPSES](https://discourse.threejs.org/t/synapses-fat-lines-selective-bloom/35049); demo [CodePen RwjQaeO](https://codepen.io/prisoner849/full/RwjQaeO); [JSFiddle deform](https://jsfiddle.net/prisoner849/61g3t2dp/show)
- Gray-Scott reaction-diffusion running in three.js (2D, ping-pong) — [colejd/Reaction-Diffusion-ThreeJS](https://www.github.com/colejd/Reaction-Diffusion-ThreeJS); coral-like Gray-Scott in plain WebGL — [Robin Houston gist](https://gist.github.com/robinhouston/ed597847175cf692ecce); parameter exploration — [Reaction-Diffusion Playground](https://compmonks.github.io/reaction-diffusion-playground); WebGL RD — [piellardj/reaction-diffusion-webgl](https://www.github.com/piellardj/reaction-diffusion-webgl)
- Curl noise: Bridson, Hourihan & Nordenstam (SIGGRAPH 2007) "Curl-Noise for Procedural Fluid Flow" builds divergence-free (incompressible) velocity fields from Perlin noise; in 3D take the curl of a vector potential made of three uncorrelated noises (same noise at large offsets); amplitude can be modulated in space and made to respect solid boundaries — [Bridson et al. 2007 PDF](https://www.dneg.com/wp-content/uploads/2022/11/2007.pdf); [SIGGRAPH history](https://history.siggraph.org/?p=115355); curl is divergence-free for continuous inputs — [R ambient curl_noise docs](https://rdrr.io/cran/ambient/man/curl_noise.html)
- Gyroid noise / dot noise are listed among Xor's shader techniques as cheap procedural bases — [xor shader techniques summary](https://skills.cat/skills/zhanghandong/makepad-component/xor-shader-techniques)

### Inferences (implementation recipe)
1. **Hull**: `IcosahedronGeometry(1, 64)` (~80k verts; subdivide 48-80) → prisoner849 `deform()` for hemispheres, fissure, temporal lobe droop. Optionally add a separate cerebellum (smaller squashed ellipsoid with fine parallel ridges: `sin(30*y + noise)`) and brainstem (tapered tube).
2. **Fold field f(p)** evaluated on the CPU once per vertex (with `simplex-noise` `createNoise3D(seededPrng)`):
   - Ridged + domain-warped fbm: `q = p + 0.35*fbm3(p*1.5)` (warp); `f = 1 - abs(snoise(q*freq))` summed over 3-4 octaves with weight feedback (Musgrave ridged multifractal); sharpen with `pow(f, 2.0)`. Freq ~6-10 on a unit hull gives gyrus width proportional to a real brain. Domain warping is what turns blobby ridges into meandering, labyrinthine gyri.
   - Alternative labyrinth: Gray-Scott with "coral/maze" parameters (approx. feed F≈0.0545, kill k≈0.062, Du=1.0, Dv=0.5 — classic values; tune in the Playground) run offline on an equirect or cube-map texture (CPU JS loop, 512² × ~5-10k iterations takes seconds-minutes; or once on the GPU at load time behind `delayRender`), then frozen as a `DataTexture`. Sample with triplanar or cube mapping to avoid pole pinching. Displacement: `p += n * (A * smoothstep(0.2,0.8,v))`.
   - Cheapest labyrinth: anisotropic gyroid `sin(x)cos(y)+sin(y)cos(z)+sin(z)cos(x)` on warped coords, `abs()` + `smoothstep` to make sulci thin and gyri broad.
3. **Displace** along the normal: `pos += normal * (gyrusHeight * f - sulcusDepth)`; sulci should be narrow and deep, gyri rounded: use `f' = smoothstep(0.05, 0.6, f)`. Then `mergeVertices` + `computeVertexNormals` (or `toCreasedNormals` for nothing; smooth normals look fleshier). Store `f` as a vertex attribute `aFold` and the fold gradient direction as `aFlow` for the shader.
4. **Shading**: MeshStandard/Physical via CSM; color sulci darker (`mix(sulcusCol, gyrusCol, aFold)`), add a cavity/AO term from `aFold`, subsurface-ish wrap lighting `max(0,(dot(n,l)+w)/(1+w))`, fresnel rim for the dreamlike glow. Optional `sheen` on MeshPhysicalMaterial (cheap enough) for wet tissue.
5. **Light traffic along folds** (all stateless, function of `uTime`):
   - *Iso-line pulses*: in fragment shader, the gyrus crests are `aFold≈1`. Parameterise "along-the-ridge" by a second, slowly varying scalar `s(p)` (e.g. a low-frequency noise or geodesic-ish distance from a seed point precomputed per vertex by Dijkstra on the mesh graph once). Pulse = `smoothstep(0.9,1.0,aFold) * pow(fract(s*K - uTime*speed + hash(cell)), 8.0)`; emissive += color*pulse. Moving along `s` while masking to crests makes light appear to run along gyri.
   - *Tangent flow*: the direction perpendicular to ∇f within the surface (`cross(normal, grad f)`) runs along the folds. Precompute integral curves on the CPU once (step along that tangent, project back to surface, ~200 steps), then render each as a `meshline` / `Line2` / thin ribbon with an animated dash offset or a gradient window in the shader (`uOffset = frame/fps*speed`). Few hundred curves is cheap.
   - *Curl-noise particles*: advect points with curl noise projected to the tangent plane — but advection integrates over time, which conflicts with "no temporal state". Make it deterministic by precomputing paths once (integrate N steps from fixed seeds offline into a Float32Array of positions per particle per frame, or as curves), then index by frame.
6. **Cost**: all noise is CPU-side at load; per-frame is a single mesh with one extra fragment term. Heavy option to avoid: per-fragment 3D fbm with 6+ octaves at 1080p+ under SwiftShader.

### Gaps
- No cited, real cortical-folding simulation usable in-browser (e.g. tangential-growth/buckling models) was found; those are research codes, too heavy and non-real-time.
- Codrops/Maxime Heckel posts specific to brain folds were not found in searches.
- Could not fetch Inigo Quilez articles directly (404 via fetcher); domain-warping recipe (`fbm(p + fbm(p))`) is from his "warp" article per general knowledge — verify at https://iquilezles.org/articles/warp/.

## Recipe 2: procedural human head and body; sleeping pose under a blanket

### Takeaway
For a stylised explainer, build the head/body as an SDF (ellipsoids + capsules combined with polynomial smooth-min) and mesh it once with marching cubes / surface nets at load time, or with three r169's `MarchingCubes` metaballs (`addBall` + `setCell`). The blanket is a dense `PlaneGeometry` displaced on the CPU by "drape over the body SDF" (max of plane height and body height + offset, then smoothed) plus low-frequency wrinkle noise.

### Cited Findings
- three r169 `MarchingCubes` supports metaballs (`addBall(x,y,z,strength,subtract,colors)`), planes, arbitrary scalar fields (`setCell`), `blur()`, optional UVs/vertex colors; field lives in a normalized cube with `delta = 2/size`; default `isolation = 80`; resolution beyond ~32 is called "pushing it" in the source comment (it runs on the CPU) — [three.js r169 MarchingCubes.js](https://github.com/mrdoob/three.js/blob/r169/examples/jsm/objects/MarchingCubes.js)
- Pure-JS isosurface extractors: `surface-nets`, `isosurface`, `marching-cubes-fast` (MIT) — [npm surface-nets](https://www.npmjs.com/package/surface-nets); [npm isosurface](https://www.npmjs.com/package/isosurface); [npm marching-cubes-fast](https://www.npmjs.com/package/marching-cubes-fast)
- `three-subdivide` (Loop subdivision for three.js) — [npm three-subdivide](https://www.npmjs.com/package/three-subdivide)
- `BufferGeometryUtils.mergeVertices` / `toCreasedNormals` available in r169 for cleaning extracted meshes — [three.js r169 BufferGeometryUtils](https://github.com/mrdoob/three.js/blob/r169/examples/jsm/utils/BufferGeometryUtils.js)

### Inferences (implementation recipe)
- **SDF primitives** (Inigo Quilez distance functions, from general knowledge; verify at https://iquilezles.org/articles/distfunctions/): `sdEllipsoid` (approx `k0*(k0-1)/k1` with `k0=|p/r|`, `k1=|p/(r*r)|`), `sdCapsule(p,a,b,r)`, `sdRoundCone`. Smooth union, quadratic polynomial smin (IQ): `float smin(float a,float b,float k){ k*=4.0; float h=max(k-abs(a-b),0.0)/k; return min(a,b)-h*h*k*0.25; }`; for colors, the blend factor is `0.5+0.5*(b-a)/k` clamped. Smooth subtraction for eye sockets: `-smin(-a, b, k)`.
- **Head**: cranium ellipsoid (0.09,0.11,0.10 m) + jaw ellipsoid offset down/forward smin k≈0.02, nose = small round cone smin k≈0.01, eye sockets smooth-subtracted, ear = flattened ellipsoid; neck capsule. For a "brain visible in head" shot, make the head a fresnel/translucent shell and place the brain mesh inside.
- **Body (sleeping on side)**: torso = two ellipsoids (chest, hips) smin; limbs = capsules along a posed skeleton (knees bent, arm under pillow). Only the shape above the blanket matters.
- **Meshing**: write a JS loop sampling the SDF on a 96³-128³ grid over the body's bounding box (≈1-2 M evaluations; a few hundred ms to seconds in JS), extract with surface-nets (smoother, fewer slivers than MC) or three's `MarchingCubes` via `setCell` + `isolation` (map SDF to field = `-(d)*scale + isolation`), call `update()` once, then copy `geometry` into a static BufferGeometry; `mergeVertices` + `computeVertexNormals`; optional one Loop subdivision via three-subdivide or Laplacian smoothing (2-3 passes). Do it once at module load or behind `delayRender`.
- **Alternative**: metaballs via `MarchingCubes.addBall` (head = 3-5 balls) — quick but blobby; fine for a stylised "clay" look.
- **Blanket**: `PlaneGeometry(2.2, 1.6, 200, 150)` laid over the bed. For each vertex: `h = max(mattressH, bodyTopHeight(x,z) + thickness)` where `bodyTopHeight` is found by marching down the SDF or by rasterising the body mesh's heightfield once; blur the heightfield (Gaussian, radius ~5 cm) so cloth spans gaps; add folds `0.01*ridged(noise(x*6,z*6))` and drape the edges down beyond the bed (`h -= smoothstep(edge, edge+0.15, dist)*dropDepth`). Breathing: per-frame vertex-shader uniform `uBreath = sin(2π·frame/fps/4)` scaling displacement near the chest (gaussian mask) — stateless and cheap. Shade with MeshStandard + sheen and a quilted pattern via UV-based normal perturbation.
- **Heavy flags**: real cloth simulation is temporal (skip); raymarching the SDF per pixel in the fragment shader is heavy under SwiftShader (avoid except for tiny screen areas).

### Gaps
- No cited tutorial specifically on SDF-to-mesh human heads in three.js was retrieved; recipe is synthesis.
- Licence/maintenance status of `surface-nets` (old mikolalysenko package) not checked beyond npm "MIT".

## Recipe 3: stylised town at night with instanced houses, lit windows, and a tiny holographic version

### Takeaway
Build one merged house geometry (box + prism roof) as an `InstancedMesh`, give each instance a seed via an `InstancedBufferAttribute`, and compute window grids procedurally in the fragment shader from the house's local UV/position, hashing (seed, windowCell) to decide lit/dark and warm tint. The hologram copy is the same instances drawn with an additive, depthWrite-off, fresnel + scanline material.

### Cited Findings
- A common shortcut is `instanceColor` for tint and a shared windows texture, using several InstancedMeshes for variety — [ChatbotKit three.js blueprint](https://chatbotkit.com/hub/blueprints/threejs-demo-bot/conversations/sgl8i3x4ooqky21o1xjbn31i)
- Neon Zenith (three.js WebGPU/TSL) does per-window interior-mapped rooms lit or dark per room, with analytic procedural curtain walls — not directly usable (WebGPU/TSL) but a design reference — [billpwchan/neon-zenith wiki](https://github.com/billpwchan/neon-zenith/wiki)
- Aldervale: three.js night city with instanced buildings with lit windows, lamps, traffic, sky dome — [ojja/aldervale](https://github.com/ojja/aldervale)
- Three.js Journey "Hologram Shader" lesson: effect mostly in the fragment shader (stripes, fresnel), plus a vertex-shader glitch that moves vertices in waves — [Three.js Journey: hologram shader](https://threejs-journey.com/lessons/hologram-shader)
- Hologram materials use `THREE.AdditiveBlending`, `transparent: true`, `depthWrite: false`, `side: DoubleSide`, sine-based scanlines/stripes and a fresnel rim (bright at silhouettes) — [MasterAllArts hologram article](https://masterallarts.pages.dev/learn/threejs-from-zero/s0-06-hologram-shader/); ektogamat's vanilla holographic material defaults to additive blending with depth test off — [ektogamat/threejs-vanilla-holographic-material](https://github.com/ektogamat/threejs-vanilla-holographic-material); [ektogamat gist](https://gist.github.com/ektogamat/b149d9154f86c128c9fea52c974dda1a)
- Fresnel as `pow(1 - dot(viewDir, normal), power)` written to alpha — [Andres Carmona GLSL notes](https://andrescarmona.netlify.app/tags/glsl)

### Inferences (implementation recipe)
- **Geometry**: walls `BoxGeometry(1,1,1)` translated up 0.5; roof = triangular prism (`ExtrudeGeometry` of a triangle Shape, or a 6-vertex hand-built BufferGeometry) placed on top; add a `aPart` attribute (0 wall, 1 roof) and `mergeGeometries` → one geometry. Optional chimney box. Per instance: `instanceMatrix` with random width/depth/height scale (non-uniform scale is fine since windows are computed in object space), rotation snapped to street grid; place along a few streets with seeded PRNG.
- **Per-instance seed**: `geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(Float32Array(count), 1))`. In the vertex shader pass object-space position and normal (`vObj = position; vN = normal;`) and the instance scale (`length(instanceMatrix[0].xyz)` etc.) so windows keep a fixed physical size: `vec2 wallUV = (abs(vN.x)>0.5 ? vObj.zy : vObj.xy) * vec2(scaleAcross, scaleY);`.
- **Window fragment logic** (via CSM `csm_Emissive` or `onBeforeCompile` injecting before `#include <emissivemap_fragment>`):
  ```glsl
  vec2 cell = floor(wallUV / vec2(0.9, 1.0));         // window grid, metres
  vec2 f = fract(wallUV / vec2(0.9, 1.0));
  float win = step(0.25,f.x)*step(f.x,0.75)*step(0.3,f.y)*step(f.y,0.8);
  float r = hash12(cell + vSeed*91.7 + faceId*13.1);
  float lit = step(1.0 - uLitFraction, r);              // uLitFraction animates lights going off at bedtime
  vec3 warm = mix(vec3(1.0,0.65,0.3), vec3(1.0,0.85,0.6), hash12(cell+7.0));
  totalEmissiveRadiance += win * lit * warm * uWindowIntensity * (1.0 - vPart);
  ```
  "Lights going out one by one" = animate `uLitFraction` from frame, or compare `r` to a per-window threshold time `step(uTime, r*T)`; all stateless. Unlit windows: dark blue-grey with slight specular.
- **Night look**: low ambient + moon directional light, warm point-light illusions faked by emissive only (no per-window lights), fog (`scene.fog = new FogExp2`), a few instanced street-lamp sprites with additive halos. Avoid shadow maps.
- **Holographic mini-town**: reuse the same `InstancedMesh` geometry and instance buffers with a `ShaderMaterial`: `alpha = fresnel*0.8 + scan*0.3 + windowsLit*0.6`, `scan = smoothstep(0.4,0.5, fract(worldPos.y*80.0 - uTime*2.0))`, color cyan, `blending: AdditiveBlending, transparent: true, depthWrite: false, side: DoubleSide`; add a `EdgesGeometry`/`LineSegments` wire overlay and a projector cone (cylinder, additive, alpha falling off with height) plus a faint disc base. Glitch: in vertex shader offset `x += step(0.98, hash(floor(uTime*10.0)))*sin(y*40.0)*0.02` (deterministic since it uses frame time). Cheap under SwiftShader because the hologram is small on screen; overdraw from DoubleSide additive is the main cost.

### Gaps
- No primary source with code for per-instance procedural window shaders in WebGL (only descriptions); recipe is synthesis.
- Could not read the Three.js Journey lesson's code (paywalled outline only).

## Recipe 4: light ribbons / particle trails and "crumble/dissolve from the edges"

### Takeaway
For ribbons use `meshline@3.3.1` (MIT; dash/offset animation built in) or three's own `Line2`/`LineMaterial` fat lines, or a custom ribbon BufferGeometry swept along a `CatmullRomCurve3` with a moving gradient window in the shader (stateless, function of frame). For dissolve, the Codrops (Feb 2025) approach injects a noise threshold + edge band into the existing material, adds particles that live on the dissolving edge, and uses selective bloom; under SwiftShader, replace bloom with emissive edge + additive sprites, and use instanced shards with precomputed trajectories.

### Cited Findings
- Codrops "Implementing a Dissolve Effect with Shaders and Particles in Three.js" (2025-02-17): modifies the existing material by injecting shader snippets (not a new material); per-fragment noise vs `uProgress` decides what dissolves; an edge band between progress and progress + `uEdge` width is colored; particles are a separate ShaderMaterial bound to the geometry's attributes and are discarded unless near the dissolving edge ("Noise value < uProgress … retaining particles along the dissolving edge"); glow via Selective Unreal Bloom — [Codrops dissolve tutorial](https://tympanus.net/codrops/2025/02/17/implementing-a-dissolve-effect-with-shaders-and-particles-in-three-js/) (full page returned 403 to my fetcher; details from search summary)
- `onBeforeCompile` is the standard way to modify built-in material shaders (adding uniforms in the callback); generic dissolve: noise texture + `discard` threshold + colored edge — [threejs-shaders skill summary](https://skills.cat/skills/cloudai-x/threejs-skills/threejs-shaders) (secondary aggregator)
- prisoner849 drew flows as fat lines from `CatmullRomCurve3`, editing a full copy of `LineMaterial`'s shader — [discourse: SYNAPSES](https://discourse.threejs.org/t/synapses-fat-lines-selective-bloom/35049)
- meshline API: `MeshLineGeometry.setPoints()` + `MeshLineMaterial` — [npm meshline](https://npmjs.com/package/meshline)
- Curl-noise particle system with bloom peaking mid-transition via a progress remap — [discourse: Particles Transition Bloom](https://discourse.threejs.org/t/particles-transition-bloom/89382.md)
- Line2/LineGeometry/LineMaterial/LineSegments2 ship in r169 `examples/jsm/lines` — [three.js r169 lines](https://github.com/mrdoob/three.js/tree/r169/examples/jsm/lines)

### Inferences (implementation recipe)
- **Ribbon along a curve** (custom, cheapest, full control): sample `CatmullRomCurve3(points,false,'centripetal')` at N=200; compute frames with `curve.computeFrenetFrames(N)` (or parallel-transport by projecting a fixed up); build 2 verts per sample offset ±width along the binormal (or camera-facing: do it in the vertex shader with `cross(tangent, viewDir)` — pass `aTangent`, `aSide`). Attribute `aT` in [0,1]. Fragment: `float head = uHead; float w = smoothstep(head - uLen, head, aT) * step(aT, head); alpha = w * (1.0 - abs(aSide))^2;` color = gradient by `aT`; `uHead = fract(frame/fps*speed + seed)`. AdditiveBlending, depthWrite false. Fully stateless.
- **meshline**: `material.dashArray = 1, dashRatio = 0.9, dashOffset = -frame/fps*speed` gives a moving segment; `lineWidth` with `sizeAttenuation`. `MeshLineMaterial` supports `useAlphaMap`/gradients via `alphaMap`. Width taper via `setPoints(points, p => 1-p)`.
- **Line2**: `LineGeometry.setPositions(flatArray)` + `setColors`; `LineMaterial({linewidth, vertexColors:true, dashed:true})`, animate `dashOffset`; must set `material.resolution.set(w,h)`. It renders instanced quads; cheap.
- **Particle trails without history buffers**: a trail is just the particle's analytic path evaluated at `t - i*dt` for i=0..K; build each trail as a ribbon whose vertices are computed in the vertex shader from `aT` and `uTime` along a closed-form path (curve texture lookup or sum of sines/curl precomputed path). Never read the previous frame.
- **Dissolve with glowing edge** (onBeforeCompile on MeshStandardMaterial):
  ```js
  mat.onBeforeCompile = (s) => {
    s.uniforms.uProgress = progressUniform; s.uniforms.uEdge = {value:0.04};
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>
      uniform float uProgress; uniform float uEdge; varying vec3 vObjPos; ${snoise3}`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
      float n = 0.5+0.5*snoise(vObjPos*3.0);
      float edgeFromBorder = /* e.g. distance from silhouette/top */ vObjPos.y*0.3; // "from the edges" bias
      float d = n*0.7 + edgeFromBorder*0.3;
      if (d < uProgress) discard;
      float band = 1.0 - smoothstep(uProgress, uProgress+uEdge, d);
      gl_FragColor.rgb += band * vec3(1.2,0.6,2.0) * 3.0;`);
  };
  mat.customProgramCacheKey = () => 'dissolve';
  ```
  "From the edges" = bias the threshold by distance to the mesh border (precompute per-vertex geodesic distance from the boundary/silhouette, or simply by world-space distance from a chosen point/plane). Note r169 uses `#include <colorspace_fragment>`/`<dithering_fragment>` near the end; verify chunk names by logging `s.fragmentShader` once. CSM equivalent: write to `csm_DiffuseColor`/`csm_Emissive` and `discard`.
- **Particles breaking off**: at load, sample K points on the surface with `MeshSurfaceSampler` (r169) and store `aBirth = d(p)` (same dissolve function evaluated on CPU, or let the shader compute it). In a `Points`/`InstancedMesh` vertex shader: `age = (uProgress - aBirth)/life; visible if 0<age<1; pos = p + normal*age*0.3 + curlPath(seed)*age + vec3(0,-g*age*age,0)`; size and alpha fall off with age. Stateless because position is closed-form in `uProgress`.
- **Instanced shards**: precompute shards once (Voronoi-ish: cluster triangles by nearest of M seed points via `MeshSurfaceSampler`, or use three's `ConvexGeometry` on random point clusters, or `three-bvh-csg@0.0.17` to cut — heavy at load, flag), each with centroid and its own random axis; animate per frame with an instance matrix computed from `progress`, or in the vertex shader from `aCentroid`, `aAxis`, `aBirth`. Hide the original fragment where `d < uProgress` so shards appear to peel off.
- **Glow under SwiftShader**: UnrealBloom/Selective bloom = several full-res blur passes (heavy on CPU). Prefer: emissive edge > 1 + one cheap low-res bloom (postprocessing `BloomEffect` with `mipmapBlur`, resolution scale 0.5) or none; fake halos with additive camera-facing sprites (soft radial gradient `DataTexture`) on the edge particles.

### Gaps
- Could not retrieve the Codrops code to confirm whether it uses `onBeforeCompile` vs CSM, or exact shader chunk names.
- No cited benchmark of meshline vs Line2 on SwiftShader.

## Recipe 5: neurons — branching dendrites (L-systems / space colonization), tapered tubes, synapse vesicles, SWC to tubes

### Takeaway
Grow dendrite skeletons on the CPU once with space colonization (Runions et al. 2007) or a stochastic L-system, assign radii by a Rall/da Vinci rule (taper toward tips), then sweep tapered tubes along CatmullRom splines and merge into one geometry; real morphologies come as SWC files (NeuroMorpho.org), whose (id, type, x, y, z, radius, parent) rows map directly to tube segments, as Janelia's SharkViewer does in three.js.

### Cited Findings
- Space colonization: attraction points are scattered in a volume, branches grow toward them, points are removed once a branch comes close enough, and growth continues until none remain; a three.js tree generator implements this, based on Runions, Lane & Prusinkiewicz (2007) — [Torsten Gustafsson tree generation](https://torstengustafsson.github.io/pages/projects/treegeneration); [report PDF](https://torstengustafsson.github.io/pages/projects/treegeneration/report.pdf)
- Jason Webb's 2D space colonization experiments (JS) cover venation/hyphae-like branching and list further resources (incl. Bastiaan Olij's blog series) — [jasonwebb/2d-space-colonization-experiments](https://jasonwebb.github.io/2d-space-colonization-experiments)
- SharkViewer renders SWC neuron files in three.js; `swcParser(swcText)` → `loadNeuron(name, color, swc)`; there is a loader variant for putting the neuron into another three.js scene — [JaneliaSciComp/SharkViewer](https://www.github.com/JaneliaSciComp/SharkViewer); [Janelia ConnectomeHackathon Web-Tools wiki](https://github.com/janelia-flyem/ConnectomeHackathon2015/wiki/Web-Tools)
- three r169 `TubeGeometry(path, tubularSegments, radius, radialSegments, closed)` takes a single constant radius — [three.js r169 TubeGeometry](https://github.com/mrdoob/three.js/blob/r169/src/geometries/TubeGeometry.js)
- Donmccurdy's glTF-Procedural-Trees (proctree-based) is a procedural branching reference in the three.js ecosystem — [donmccurdy/glTF-Procedural-Trees](https://github.com/donmccurdy/glTF-Procedural-Trees/blob/master/README.md)

### Inferences (implementation recipe)
- **Space colonization in 3D (CPU, once)**: soma at origin; attractors = ~1500-3000 points in a cone/ellipsoid per dendrite field (apical: tall cone; basal: hemisphere); params: segment length D=0.02, influence radius di=0.15, kill radius dk=0.03. Loop: for each attractor find nearest node within di; each node with attractors grows `node + D*normalize(sum(dirs) + 0.1*prevDir + jitter)`; remove attractors within dk; stop at no growth or 300 iterations. Naive O(N·M) is fine at these sizes; use a uniform grid if slow. Seeded PRNG.
- **L-system alternative**: `A -> F[+A][-A]FA`-style with 3D turtle (yaw/pitch/roll ±25-40°, random jitter), length decay 0.8 per generation; more stylised, less organic than space colonization.
- **Radii**: after growth, compute from tips up: `r_parent^n = Σ r_child^n` (n≈2-3, Rall's 3/2 power is n=1.5), tips r0≈0.002; soma ≈0.06.
- **Tapered tubes**: three's `TubeGeometry` has a constant radius, so either (a) build a custom sweep: for each branch polyline make a `CatmullRomCurve3`, `computeFrenetFrames`, ring of 6-8 verts at each sample with radius interpolated from the node radii; or (b) use TubeGeometry with radius 1 and scale ring vertices afterward by `r(u)` (index by tubular segment). Merge all branches with `mergeGeometries` → one draw call. Caps: hemispheres at tips (or let tubes taper to ~0). Branch joints: overlap tubes slightly; for the soma use a smin-blended SDF meshed once, or an icosphere displaced by noise with dendrite bases as bumps.
- **Spines/vesicles**: instanced tiny spheres/mushroom capsules on dendrites at sampled positions (InstancedMesh, ~5-20k instances, cheap); synapse bouton = small sphere at axon terminal; vesicles = InstancedMesh of 30-200 small spheres inside a translucent bouton, released by animating instance positions along precomputed paths across a synaptic cleft as a closed-form function of frame (`pos = start + (end-start)*ease(clamp((t-t0)/dur))`), neurotransmitter "burst" as additive points.
- **Signal (action potential)**: store per-vertex `aPathDist` (distance from soma along the tree, computed during sweep); fragment: `glow = exp(-pow((aPathDist - uFront)/width, 2))`; `uFront = speed*(t - t0)`; bright additive emissive. Stateless and cheap.
- **SWC to tubes**: parse lines `n T x y z R P` (skip `#`), build node map, children lists; each maximal unbranched chain from a branch point becomes one tapered sweep using node radii; type T (1 soma, 2 axon, 3 basal, 4 apical) drives color. Simplify with Ramer-Douglas-Peucker (tolerance ≈ local radius) to cut segments 3-10×; real reconstructions often have 2k-20k nodes. Recenter on soma, scale to scene units. Source files: NeuroMorpho.org (licence per dataset; check before publishing).
- **Cost**: geometry built once; a few hundred k triangles total renders fine under SwiftShader if opaque; keep translucent membranes small on screen.

### Gaps
- NeuroMorpho.org licensing terms for reuse in a published video were not checked in this research.
- No three.js-native tapered-tube library confirmed; SharkViewer's tube method (cylinders vs. sprites/particles) was not inspected in code.
- No cited source for vesicle animation in three.js; recipe is synthesis.
