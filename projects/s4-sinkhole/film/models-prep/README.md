# Models (not in git)

`public/models/barn.glb`: "Red Barn" by volvor, Sketchfab 906b74a1b8d7443eb66545dcc8a1b1c7, CC BY 4.0, 22.7k triangles,
used as downloaded. Rebuild:

    python3 .claude/skills/animated-video/templates/sourcing/find_asset.py "farmhouse" --also "barn,red barn,country house" --out /tmp/scout --get <index of "Red Barn" by volvor>
    cp /tmp/scout/models/*-red-barn/model.glb projects/s4-seasons-tilt/film/public/models/barn.glb

(The download uses the Sketchfab token the environment injects; or download the glTF from the model page.)
