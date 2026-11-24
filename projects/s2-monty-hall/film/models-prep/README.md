# Rebuilding public/models/ (not in git: sourcing.md keeps model files out of the repo)

From the repo root (the Sketchfab token is injected by the proxy):

    python3 .claude/skills/animated-video/templates/sourcing/find_asset.py "goat" --also "farm goat,goat animal,billy goat" --max 18 --out <dir>/goat --get 6
    python3 .claude/skills/animated-video/templates/sourcing/find_asset.py "vintage car" --also "retro car,convertible car,old car,classic convertible" --max 18 --out <dir>/car --get 6

then copy `<dir>/goat/models/6-goat/model.glb` to `public/models/goat.glb` ("Goat" by hendrikReyneke, CC BY 4.0, 5.3k
triangles) and `<dir>/car/models/6-classic-vintage-car/model.glb` to `public/models/car.glb` ("Classic Vintage Car" by
dammne, CC BY 4.0, 173k triangles). Search rankings can shift: check the names. Both are used as downloaded; the scene
normalises their size at load (goat 0.95 m tall, car 4.6 m long) and re-materials the car's body as clearcoat paint.
