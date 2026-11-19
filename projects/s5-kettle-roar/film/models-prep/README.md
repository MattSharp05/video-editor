# Rebuilding public/models/ (not in git)

`.claude/skills/animated-video/templates/sourcing/find_asset.py` (Sketchfab token injected by the proxy):
- `find_asset.py "electric kettle" --also "kettle,glass kettle,tea kettle" --max 24 --out <dir>/electric_kettle`,
  then `--get 19` ("Glass Kettle", Halil Kantarci, CC BY 4.0,
  sketchfab.com/3d-models/none-3f646a36c0a142cfa451af70357f4235). It is spec-gloss: convert with gltf-transform
  `metalRough()` (sourcing.md) -> `public/models/kettle.glb`. Meshes: Floor (a shadow plane, hidden), Glass, Body,
  Others, StandCap; units mm (Scene scales x0.001 in the file, x0.8 more).
- `find_asset.py "kitchen" --also "kitchen interior,kitchen counter,modern kitchen" --max 24 --out <dir>/k`, `--get 7`
  ("Small Modern Kitchen", dylanheyes, CC BY 4.0) -> `public/models/kitchen.glb` (placed as in s5-microwave-myth:
  x1.15, counter 0.92 m).
