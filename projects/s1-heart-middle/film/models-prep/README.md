# Rebuilding public/models/ (not in git: model files stay out of the repo)

1. Download with the sourcing tool (the Sketchfab token is injected by the proxy):
   - `python3 .claude/skills/animated-video/templates/sourcing/find_asset.py "human heart anatomy" --also "realistic heart,anatomical heart" --out <dir>/heart`, then `--get 1`
     ("Human Heart 3D Model | Anatomy | Medical Project", Mesh-Magnet, CC BY 4.0, sketchfab 5da08bb137014f0392c69f9997f777cd)
   - `find_asset.py "rib cage" --also "human skeleton torso,thorax skeleton,sternum ribs" --out <dir>/rib`, then `--get 11`
     ("Thorax", valchanov, CC BY 4.0, sketchfab c918b12c4e0c4625a5ad0392bb7d0354)
   - `find_asset.py "human body male realistic" --also "male torso,human base mesh,man anatomy body" --out <dir>/body`, then `--get 11`
     ("Human Base Mesh 01", 3D Sculpt Daily, CC BY 4.0, sketchfab a2a8c76b92b2487996a98c0299f9cba0)
2. In a folder with `@gltf-transform/core@4 @gltf-transform/functions@4 @gltf-transform/extensions@4 meshoptimizer draco3dgltf`:
   `node prep.mjs <thorax model.glb> public/models/thorax.glb 0.07` (2.22M -> 154k triangles),
   `node prep.mjs <heart model.glb> public/models/heart.glb 1`, `node prep.mjs <body model.glb> public/models/body.glb 1`.
3. Hands: copy `.claude/skills/animated-video/templates/parts/public/models/hand-*.glb` (MIT).
