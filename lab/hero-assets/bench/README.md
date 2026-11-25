# Hero-assets bench

A test scene for `.claude/skills/hero-assets/`: a Las Vegas Sphere stand-in (112 m tall, 157 m wide) at dusk, lit by
the water kit's sky dome and PMREM environment (copied from projects/moon-tides-01). The same shot renders the
three.js version or a fitted `.glb`, so proposal and comparison stills match.

```
npm install
npx remotion still src/index.ts Bench stills/threejs-wide.png --props='{"variant":"threejs","angle":"wide","glb":null,"light":"neutralise"}'
GM=../../../.claude/skills/hero-assets/scripts/gen_mesh.py HERO_DECISIONS=$PWD/test-decisions.md
python3 $GM propose --id bench-sphere-1 ... ; python3 $GM run --id bench-sphere-1 --model placeholder
npx remotion still src/index.ts Bench stills/glb-wide-neutralise.png --props='{"variant":"glb","angle":"wide","glb":"hero/bench-sphere-1/placeholder.glb","light":"neutralise"}'
```

Paid path without money: `python3 mock_broadcast.py --glb public/hero/bench-sphere-1/placeholder.glb --cap 5`, then
run gen_mesh with `BROADCAST_URL=http://127.0.0.1:8765 BROADCAST_TOKEN=test NO_PROXY=127.0.0.1`. The mock's
`POST /test/decide/<id>` stands in for Matthew's click in the dashboard.

Results (2026-11-12): `stills/compare-sheet.png` (three.js / glb with baked light kept / neutralised / close-up) and
`stills/neutralise-keep-vs-neutralise.png`. Stills render in 7-22 s each (one browser start each) under SwiftShader.
