# Rebuilding public/models/ and public/tex/ (not in git)

Sourcing tool: `.claude/skills/animated-video/templates/sourcing/find_asset.py` (Sketchfab token injected by the proxy).
1. `find_asset.py "basketball" --also "basketball ball,nba ball" --max 24 --out <dir>/basketball`, then `--get 7`
   ("Basketball Classic Standard Ball", HQ3DMOD, CC BY 4.0). Its material is spec-gloss (three renders it white):
   convert with gltf-transform `metalRough()` (folder with `@gltf-transform/core@4 functions@4 extensions@4`):
   `io.read(model.glb) -> transform(metalRough(), prune()) -> write public/models/basketball.glb`.
2. `find_asset.py "tennis ball" --also "tennis ball yellow" --max 24 --out <dir>/tennis_ball`, `--get 3`
   ("Tennis Ball", Tentrox, CC BY 4.0) -> `public/models/tennis.glb`.
3. `find_asset.py "basketball hoop" --also "basketball court,basketball backboard,gym" --max 24 --out <dir>/hoop`,
   `--get 1` ("Basketball Hoop Panel", Nimrod Assaf, CC BY 4.0) -> `public/models/hoop.glb` (already in metres).
4. Poly Haven CC0 textures, 2k: `curl -o public/tex/<name>_<map>.jpg https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/<name>/<name>_<map>_2k.jpg`
   for name in brick_4, asphalt_01 and map in diff, nor_gl, rough.
