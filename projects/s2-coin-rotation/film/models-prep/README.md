# Rebuilding public/models/ (not in git: sourcing.md keeps model files out of the repo)

1. Download with the sourcing tool (Sketchfab token is injected by the proxy):
   `python3 .claude/skills/animated-video/templates/sourcing/find_asset.py "airliner" --also "boeing 737,airbus a320,passenger airplane,commercial aircraft" --max 30 --out <dir>/plane`
   then `--get 10 --out <dir>/plane` ("Airliner Boeing 757 Transparent", Arion Digital, CC BY 4.0).
   Seat: `find_asset.py "airplane cabin interior" --also "aircraft seats,airplane seat,plane interior" --max 30 --out <dir>/cabin`,
   then `--get 10` ("Seat", maximmus, CC BY 4.0).
2. In a folder with `@gltf-transform/core@4 @gltf-transform/functions@4 meshoptimizer` installed:
   `node prep757.mjs <757 model.glb> public/models/b757.glb` (drops engine internals + gear, ~225k tris)
   `cp <seat model.glb> public/models/seat.glb && node seatlo.mjs public/models/seat.glb public/models/seat_lo.glb`
