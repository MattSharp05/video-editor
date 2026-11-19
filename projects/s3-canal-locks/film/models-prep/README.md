# Rebuilding public/models/ (not in git)
`python3 .claude/skills/animated-video/templates/sourcing/find_asset.py "container ship" --also "cargo ship,canal lock,panama canal" --max 24 --out <dir>/ship`
then `--get 1 --out <dir>/ship` ("Container Ship" by RM02, CC BY 4.0, sketchfab aaa41cca946b4a08bc08cf692b7757be, 189k tris)
and `cp <dir>/ship/models/1-container-ship/model.glb film/public/models/ship.glb`. Used as downloaded.
