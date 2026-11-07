# Lightsaber 01 (brief)

Status: v1, produced unattended as a benchmark of the skills (Matthew, 2026-11-06: "I am just going to give you the
topic. You write the script and create the frames based on our skills. Don't ask for my approval just make the video.").
Every approval stop in the skills (concept, board, voice, sound picks) was skipped by his instruction; each is listed
in the delivery as skipped.

## Facts
- Topic (Matthew): "how a lightsaber from Star Wars would work. Maybe do some research on fan theory etc. Maybe include
  some cool shots of Jedi, Death Star etc". Style: "3D style" -> luminous 3D (energy is the light source on a dark ground).
- Reel 9:16, 30 fps, ~68 s. Voice: American male design-m2 cloned from the approved hook clip (the profile says ask per
  video; not asked, by instruction; same voice as Grand Canyon 01 and Moon tides 01). No call to action.
- Everything is modelled in code: an original hilt, generic hooded figures, a generic battle station (sphere, trench,
  dish). No film props, footage or stills. Names (Star Wars, Death Star, kyber) are spoken as commentary.

## The thread (one shot; lead -> move -> next lead, carrier)
| # | Lead | Move | Next lead | Carrier |
|---|---|---|---|---|
| 1 | figure holding the blade | travel up | the beam | the blade thins into a beam and the camera rides it into the stars |
| 2 | the beam | pull back | two beams | the camera drops back down the beam to the ridge, where the red beam ignites |
| 3 | two beams crossing | pass through (camera) | our blade | the beams thicken into blades as the camera dives at ours |
| 4 | the blade's gas + lightning | travel up | thermometer marks | the camera climbs the blade; each mark lights as it passes |
| 5 | the blade tip | travel down | the emitter spray | the camera rides down to the emitter as the plasma loses its shape |
| 6 | the spray + hot hand | transform | the glass hilt | the hilt turns to glass; coils light; field lines squeeze the spray |
| 7 | the plasma column | travel up / down | the loop | the camera rides the particles to the tip and back |
| 8 | the loop | pull back | the clash | the red blade swings in to the point we're watching |
| 9 | the clash | travel down | the crystal | sparks fade; the camera follows the field lines down into the hilt |
| 10 | the crystal | pass through | the station's dish | the crystal's light (the film's only haze) becomes the dish's glow |
| 11 | the dish | travel | the beam overhead | the beam fires; the camera follows it down to the ridge |
| 12 | blade + hilt (recap) | transform | the dying blade | named parts flash; the blade sputters to a stub and dies |

## One visual language
| Thing | State | Look (one per state) |
|---|---|---|
| Our blade | on / laser / see-through / dying | blue core + glow / thin hard beam / dim core with plasma visible inside / flicker, shrink, off |
| Plasma | contained / wild | blue points looping up the core and down the skin / blue points spraying in a cone |
| Magnetic field | on | violet lines and violet coils, nothing else is violet |
| Heat | burning | orange glow on the glove |
| Kyber crystal | idle / named | dim blue / bright blue pulse (blue = the crystal's colour = the blade's) |
| Opponent | on | red, only the second figure's blade |
| Station's gun | charging / firing | green dish focus + eight green beams / one green beam; green means only this |
| Labels | pinned | white tick + white text; key words in the caption accent (light blue) |

## Production
- Research: subagent report (canon vs Legends vs fan physics), fact-check subagent (6 rewordings; one real error fixed:
  canon powers the superlaser with a hypermatter reactor, crystals channel it).
- Pictures: fresh brainstorm agent -> separate picker agent (device: one continuous zoom in and back out).
- VO: 13 lines, 68.2 s, 2.96 words/s (faster than the profile's 2.8). ASR misheard "that small" as "that's small" in the
  mix (line alone: "that small", 2/2); words.json fixed by `film/fix_words.py`.
- align.py: decodes audio with ffmpeg (newer PyAV breaks faster-whisper's own decoder).

## Caption credits
Music: "Floating Cities" by Kevin MacLeod (incompetech.com), CC BY 4.0. Voice: AI (Qwen3-TTS). Fan explainer, not
affiliated with Lucasfilm; original 3D models.

## Outstanding corrections
None yet (no review by design).
