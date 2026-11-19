# Rebuilding public/models/ (not in git)

`.claude/skills/animated-video/templates/sourcing/find_asset.py` (Sketchfab token injected by the proxy):
- `find_asset.py "microwave oven" --also "microwave,kitchen microwave" --max 24 --out <dir>/mw`, `--get 22`
  ("Old microwave - free", Mieshu, CC BY 4.0; animated door) -> `public/models/microwave.glb`
- `find_asset.py "lasagna" --also "frozen meal,tv dinner,casserole dish" --max 24 --out <dir>/las`, `--get 1`
  ("Lasagna", UmangRank, CC BY 4.0) -> `public/models/lasagna.glb`
- `find_asset.py "kitchen" --also "kitchen interior,kitchen counter,modern kitchen" --max 24 --out <dir>/k`, `--get 7`
  ("Small Modern Kitchen", dylanheyes, CC BY 4.0) -> `public/models/kitchen.glb`
No conversion needed; Scene.tsx scales and places them (kitchen x1.15 so its counter is 0.92 m; microwave x0.122,
turned 90 deg; lasagne scaled to 0.13 m wide and cut by two clipping planes).
