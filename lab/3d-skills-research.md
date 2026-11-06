# 3D graphics skills on GitHub: research (2026-11-06)

Question (Matthew): how good can the Remotion + three.js pipeline get before Blender? Searched GitHub for agent
skills (SKILL.md) on three.js, React Three Fiber, shaders, WebGL, terrain, postprocessing and Remotion 3D; two
agents read the strongest against our Grand Canyon weaknesses. Measured here: headless Chrome has WebGL2 only
(SwiftShader, max texture 8192), no WebGPU; USGS imagery (public domain) and Sentinel-2 cloudless tiles are reachable.

## Verdict: vendor nothing whole; borrow techniques into animated-video (credit in UPSTREAM.md)
| Skill | License | Use |
|---|---|---|
| CloudAI-X/threejs-skills (4k★) | MIT | lighting (shadows, contact shadows), shaders (onBeforeCompile), textures (colour space). Targets three r186: check APIs |
| MiniMax-AI/skills shader-dev | MIT | texture-mapping-advanced (triplanar/biplanar), atmospheric-scattering (fog models), water-ocean (Beer's law, caustics), terrain-rendering |
| gokayfem/shader-skills | MIT | rendering-pipeline (tone-map order, fog = sky colour), terrain-production, water-quality. Most rigorous |
| Moh4696/open-3d-skills threejs-scene | MIT | best outdoor-light guide: sun/sky/fog presets, sky-derived env light, one fitted shadow with texel snapping, water recipe |
| artemnovitckii/claude-animation-skills zach-d-films | MIT | finished 9:16 three.js short: concrete shadow numbers, ACES, grain/vignette, seeded canvas textures |
| viettranx/3dviz-pro-max | MIT | lighting scale reference, post stack (tone map once), visual anti-slop checklist |
| andyhuo520/vibe-knowledge | MIT | narration sync rules (element within -0.2..+0.1 s of its word; no hold > 3 s), scale-travel method, QA |
| remotion-dev/skills remotion-maps | none in repo | Cesium/MapTiler satellite flyovers: needs a MapTiler key (free plan likely non-commercial), GPU-tested only. Take the idea (imagery on DEM), not the engine |
| AThevon/genjutsu threejs-r3f | MIT | noise/fbm/displacement snippets |
| IceCreamYou/THREE.Terrain | MIT | altitude/slope material blend, ScatterMeshes (pebble placement) |
Skip: linegel, JetBrains webgpu-threejs-tsl, dedekpo TSL (WebGPU only); vibe-motion earth-render (wrapper);
majidmanzarpour (game checklist); tuzhechen2005 (2D styles); remotion best-practices 3D (basics we already follow).

## Ranked upgrades for our pipeline (cost per frame under software WebGL)
1. Satellite imagery draped on the DEM (USGS NAIP/imagery, public domain), strata colours kept for the cut face. Low.
2. Sun shadows + ambient occlusion baked into the terrain once from the heightfield (horizon marching). ~Zero.
3. ACES/AgX tone mapping, sRGB, exposure per shot. Low.
4. Fog matched to a gradient/analytic sky; height fog in the valley. Low.
5. Rock detail: triplanar fbm on colour + normal via onBeforeCompile, faded with distance; denser local mesh near the opening. Medium.
6. Water: scrolled normals, Fresnel, Beer-Lambert depth tint, sky reflection; caustics on the bed. Low-medium.
7. Grounded pebbles: displaced rocks seated into the bed, contact-shadow blobs. Low.
8. One tight shadow map for close shots only (boulder, rockfall), rendered once. Medium.
9. Light grade: vignette, grain ~0.018, bloom only above surface brightness (flood). Low-medium.
10. Camera: constant ground speed, smoothed corners, look-ahead target, pull out after every push in. Low.
Avoid: SSAO/N8AO/GTAO (costly in software and broken by our logarithmic depth buffer), raymarched volumetrics,
temporal effects (frames render independently).
