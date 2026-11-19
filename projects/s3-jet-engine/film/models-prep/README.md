# Rebuilding public/models/ (not in git: sourcing.md keeps model files out of the repo)

`python3 .claude/skills/animated-video/templates/sourcing/find_asset.py "turbofan engine" --also "jet engine cutaway,jet engine,cfm56,aircraft engine" --max 30 --out <dir>/jet`
then `--get 7 --out <dir>/jet` ("Jet Engine" by Pilot, CC BY 4.0, sketchfab ea66c2db873d4182b116529697d18571) and
`cp <dir>/jet/models/7-jet-engine/model.glb film/public/models/engine.glb`. Used as downloaded (no decimation).
