# Voice Match (free AI voice that sounds like a reel)

Matthew found an AI narrator on Instagram (a "what if" explainer: buckets of water passed across the US to fill a kiddie
pool) and asked whether we could recreate it. The model behind a voice can't be identified from a clip, and we don't
clone someone else's voice, so this designs similar voices from written descriptions instead.

- Reference: the reel's audio (uploaded in session, not committed), cut to two of its lines (`voices.json` `reel` times).
- Measured on the reel (faster-whisper small.en + librosa pyin): male, about 2.9 words/s, expressive pitch, short
  pauses (max 0.42 s), heavy music/SFX bed under the voice (pitch tracking found few clean frames). Not listened to.
- Candidates: five Qwen3-TTS 1.7B VoiceDesign voices (Apache 2.0), `voices.json`, reading the same two lines.
  Transcript check: all 10 clips say the full line.
- Page: https://claude.ai/artifact/9531EbP6uxAHAYN9EhZbgH (db: `picks/match`, `meta/match`).

Run: `.venv-qw/bin/python gen.py` (one model, ~30 s per line on 4 CPU cores), then `python3 build.py <reel.wav>`.
Setup line is in `.claude/skills/animated-video/references/ai-voiceover.md`.

Next: after a pick, render one neutral reference clip in that voice and clone every line from it with the Base model
(design once, clone every line), so it doesn't drift between lines.
