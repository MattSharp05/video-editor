# Terrain kit

A real place as a 3D block from public elevation data, with satellite imagery, baked light, sky-matched haze, water and
rock detail, in three.js inside Remotion. Built for Grand Canyon 01 (`projects/grand-canyon-01/`); measured there on a
4-core CPU with software WebGL2 (no GPU). Copy into the film's `src/kit/terrain/` and the data scripts into the film's
`data/`, then change the place-specific constants listed below.

| File | What it does |
|---|---|
| `../../terrain-data/fetch_dem.py` | AWS Terrain Tiles (terrarium PNG; USGS 3DEP in the US, public domain) -> `dem.npy`, a square of N x N zoom-12 tiles around LAT/LON (4 tiles = ~31 km) |
| `../../terrain-data/fetch_imagery.py` | USGS National Map `USGSImageryOnly` tiles (public domain, US only) for the same square at zoom 14 -> `imagery.jpg` (4096 px, ~7.7 m/px). Outside the US find another source and check its licence (Sentinel-2 cloudless 2018+ is non-commercial) |
| `../../terrain-data/prep_terrain.py` | Grid fields for the mesh: elevation, a pre-landform surface (plane fitted to high ground), distance to a river path (cheapest path over elevation), a side-channel path |
| `../../terrain-data/bake_light.py` | From the full-resolution DEM, once: object-space normals (sharper relief than the mesh), soft sun shadow (horizon marching) and ambient occlusion -> `normals.png`, `light.png`. Set SUN to the imagery's sun |
| `terrain.ts` | The block: top surface + four cut faces with strata colours by elevation; `shapeBlock(depth, width)` morphs between the real landform and a filled/partly cut one; `imgW` per vertex says where the real surface (and imagery) applies |
| `look.ts` | Materials and sky: terrain (imagery x baked light, high-res normals, close-range grain/bump, height fog), cut faces (bedding planes, grain), water (flowing ripples, depth tint, sky reflection), bed with caustics, schist-style rock computed per pixel, sky dome + PMREM environment, stones, contact-shadow blob |

Place-specific constants: `LAT, LON, Z, N` (data scripts, keep identical), `SUN` (look.ts and bake_light.py), `VEX`,
`BANDS` and `TILT` (terrain.ts: the rock layers of the place), colours in look.ts, `size_km` comes from the data.

Measured costs and the order to add things: [look pass](../../../../references/look-pass.md).
