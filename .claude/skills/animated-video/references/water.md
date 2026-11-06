# Water

Choose the water before shading it, then build it from the [water kit](../templates/parts/src/kit/water/README.md).

## 1. Match the real water of the place and the moment
- What colour and clarity does this water have here, at this time? Read it from sources and photos, not taste. A
  dam-fed river runs clear and green; the same river in flood is red-brown and opaque; glacial water is milky blue;
  tropical shallows are turquoise over white sand; open ocean is deep blue, a storm sea grey-green.
- The story decides the era: a scene about floods carving rock gets flood water (Grand Canyon: the Colorado is
  "coloured red" in flood, green only since the 1963 dam; `lab/water-research.md`).
- Pick the nearest preset, then tune colours, extinction (how fast each colour fades per metre), foam colour (beige in
  muddy water, near white in clear), reflectivity (muddy water is matte) and caustics (none in murky water).

## 2. Build it
| Water | Kit piece | Notes |
|---|---|---|
| River, stream | `River` | Path along the channel centre; `rapids` thresholds are drop per metre (0.01-0.03 for whitewater). Water reads in motion: always check a clip, not only a still |
| Sea, lake, coast | `Ocean` | Wave lengths and steepness in `SWELL`; `beach` plane for shore foam and transparency; low sun + glint for drama |
| Waterfall | `Waterfall` | Height sets fall speed (streak speed follows); mist and pool included; light it from the front or it goes dark |
| Underwater | `withUnderwater` on bed/rocks + `UnderwaterSet` | Real flood water is opaque within centimetres: cheat visibility to ~2 m and label it an illustration |
| Flood, debris flow | `FloodFront` | Muddy water on dirt disappears: give it sheen (low roughness), a foaming front, and contrast with the ground |

## 3. Check
- Render the shot as a 3 s clip and look at the motion: current direction and speed, no pulsing, no swimming textures.
- Distance: the same surface must hold from metres to kilometres (detail fades with `AA`).
- Cost: measured on the bench in `lab/water/` (s/frame per piece, CPU); water costs scale with water pixels on screen.
- With a GPU later: planar reflections, refraction from a depth pass, WebGPU compute waves. Rivers still use flow, not FFT.

## Approved looks (Matthew, Water Picker round 1, 2026-11-06)
5/5, use as the defaults: river from the air, river at the bank, rapids, open ocean, waves on a beach, waterfall
(bench settings in `lab/water/src/Bench.tsx`). 4/5: under clear water. 3/5: under a muddy flood. 2/5: flood front.
Round 2 fixes (no written notes; problems found on review): flood front got a tapered nose, tumbling debris and spray;
underwater shader materials now convert to output colour space (the horizon band). Re-rate before treating these
three as defaults.

