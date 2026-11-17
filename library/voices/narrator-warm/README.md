# narrator-warm: warm friendly narrator (American male, early 30s)

Matthew's pick (2026-11-17) from Voice Match round 1 (`lab/voice-match/`): a free Qwen3-TTS voice designed to sound
like a "what if" explainer narrator he found on Instagram. Made from a written description, not cloned from anyone.

- `ref.wav` + `ref.txt`: the two clips he heard and picked (12.6 s, 24 kHz). This is the voice.
- `voice.json`: the design description, models, licence, pace (~2.7 words/s in full sentences).
- `say.py`: clones every line from `ref.wav` with the Base model, so the voice stays the same across a film.

```bash
cd library/voices/narrator-warm && python say.py /path/to/lines.json /path/to/vo/lines
```

About 30 s per line on 4 CPU cores. Then trim, join, align and check the transcript as in
`.claude/skills/animated-video/references/ai-voiceover.md` (read it first). Re-generate a bad line alone with another
seed: `python say.py lines.json out 11 3`. Label AI narration in the delivery notes.
