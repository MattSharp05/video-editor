# Video-edit profile

- Render with FFmpeg (no Resolve in the cloud container). Say so in each delivery.
- Delivered files must be under 50 MB (Matthew, 2026-11-13): two-pass x264 sized to fit, check the crops against the master.
- Default platform: short-form vertical 9:16; confirm per video.
- Sound effects: drafts may use any bundled effect; published cuts use CC0 or his own files only.
- Screen recordings come from Matthew's phone; keep them in the project's `refs/`.

## Sound (Matthew, 2026-11-05; rules and mix in `.claude/skills/real-sfx/references/studio-sound.md`)
- Subtle and soft: "Not big clinks or chimes"; effects that were too harsh were "incorrectly chosen".
- Music intriguing, never playful; it depends on the video. Picked: Floating Cities (Kevin MacLeod, CC BY 4.0,
  credit in the caption). Rejected as too playful in round 4.
- Background bed when there's no music: something soft (picked deep underwater; depends on the video).
- Sound Picker picks are references, not reuse: "We are not going to use the same sounds each video. But this sort
  of vibe." Palette and measured profile (dark-warm, dry, short): `lab/sound-picker/sound-palette.json`.
- Swipes silent. Send and camera moves: nothing fit yet, so leave them quiet or run a new picker row.
- He picks by ear; Claude places and lists the moments to listen to.
- Mix (studio default, not his words): voice up front; music ducked under speech; -14 LUFS, under -1.5 dBTP measured on the MP4.
- Music must be clearly audible (Matthew, 2026-11-06, Moon tides v1: "can you add music" when it was mixed ~46 dB under the
  voice): ~10-12 dB under speech, up in the pauses; measure the gap from stems every film.
