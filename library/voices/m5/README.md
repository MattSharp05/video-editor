# Voice m5 "Warm friendly narrator" (AI, Qwen3-TTS)

Matthew's voice for the 3D explainer series (2026-11-19: "they must all use this voice"). Round-1 pick from his
Voice Match session (branch claude/dreamy-volta-pe6uy1, `lab/voice-match`). First used on `projects/turbulence-seat-01`.

- `ref_m5.wav` is the reference: the exact clip he picked (VoiceDesign, seed 7, the line below). **Never redesign it**;
  every line is cloned from this file with the Base model so the voice can't drift between videos.
- Reference text: "Well, first you would need nearly five million people, standing three feet apart the whole way."
- Design prompt (for the record only): "A warm, friendly American male narrator in his early thirties, mid pitch,
  smooth and polished like a YouTube explainer voiceover. Engaging and expressive with clear articulation, medium pace."
- Always disclosed: caption credit "Voice: AI (Qwen3-TTS)" and the AI label on the post.

## Use

    library/voices/m5/setup.sh                        # once per container: venv at ~/.venv-qw (~3 min)
    ~/.venv-qw/bin/python library/voices/m5/say.py projects/<slug>/vo/lines.json projects/<slug>/vo [idx,..] [seed]

`lines.json` is a list of strings, one per line of the script; `say.py` writes `line_00.wav`... next to it. CPU only:
about 20 s of compute per line (10 lines ~4 min; first run downloads the 1.7B Base model). Then follow
`projects/turbulence-seat-01/vo/`: `assemble.py` (trim at -42 dB RMS, pauses longer at the turns) -> `vo.wav`, then the
template's `align.py` -> `words.json`, then fix ASR slips against the script (`check_words.py`, `fix_words.py`).
A line that sounds wrong in the transcript (a word dropped or garbled): regenerate just that index with another seed.
