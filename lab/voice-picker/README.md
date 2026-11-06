# Voice Picker (free AI voiceover test)

A blind listening test: the same two clip-01 lines in several free AI voices, with Matthew's real take as a
control. Question: is a free model good enough to replace recording for drafts, or for publishing?

## What's in it
| Voice | Kind | Licence | Runs here |
|---|---|---|---|
| Chatterbox (Resemble AI), default and calmer settings | clone | MIT | CPU, separate venv `.venv-cb` |
| Chatterbox Turbo | clone | MIT | CPU, `.venv-cb` |
| Qwen3-TTS 12Hz 1.7B Base | clone (reference audio + its transcript) | Apache 2.0 | CPU, `.venv-qw` |
| Kokoro-82M: am_michael, am_puck, af_heart | stock | Apache 2.0 | CPU, `.venv-kk` |
| Take 1 (real) | control | Matthew's | — |

- Clone reference: `work/ref.wav`, take 1 from 8.30 to 20.80 s ("So I'm building an app … the place it names."), a
  different part of the take from the test lines, so a clone can't copy the delivery of the line itself.
- Test lines (`lines.json`): the hook (take 1, 2.85–8.15 s) and the Smart Add explainer (21.40–27.60 s).
- Chatterbox output carries Resemble's Perth inaudible watermark (on by default).

## Run
```
uv venv -p 3.11 .venv-cb && VIRTUAL_ENV=.venv-cb uv pip install chatterbox-tts "setuptools<80" --extra-index-url https://download.pytorch.org/whl/cpu --index-strategy unsafe-best-match
uv venv -p 3.11 .venv-kk && VIRTUAL_ENV=.venv-kk uv pip install kokoro soundfile "en_core_web_sm @ https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl" --extra-index-url https://download.pytorch.org/whl/cpu --index-strategy unsafe-best-match
uv venv -p 3.12 .venv-qw && VIRTUAL_ENV=.venv-qw uv pip install qwen-tts soundfile --extra-index-url https://download.pytorch.org/whl/cpu --index-strategy unsafe-best-match
.venv-kk/bin/python gen_kokoro.py; .venv-cb/bin/python gen_chatterbox.py; .venv-qw/bin/python gen_qwen.py 1.7B
python3 build.py      # trims, matches to -16 LUFS, blind letters, writes picker.html
```
Gotchas: Chatterbox's watermarker needs `pkg_resources` (setuptools < 80); Kokoro's phonemizer tries to `uv pip install`
the spaCy English model at run time and fails outside an activated venv, so install it up front.

## Results
Picker: https://claude.ai/artifact/WGUhumAZVGQxLCohpjUWBa (db: `ratings/<voice key>` with 1-5 per line, `meta/overall`
with the real-voice guess, favorite and notes). Blind letters are fixed by seed over the full voice list.

Generation (2026-11-05, 4 CPU cores, no GPU; times include CPU sharing between models):
- Kokoro: seconds per line. Qwen3-TTS 1.7B: 47 s per line alone, 490 s while sharing the CPU.
- Chatterbox: ~430 s for the first line while sharing, 27-29 s per line alone. Turbo: 13-14 s per line.
- Transcript check (faster-whisper small.en): every clip says the full line. Turbo's "travel" was heard as "treble";
  Chatterbox calm said "you will" for "you'll". Left as generated: that's part of the test.
- Pace: real take 2.7-3.0 words/s; Chatterbox default fastest (4.1 on the hook). Pace is hidden in the picker until
  reveal, since it would give the real take away.

Round 1 verdict (2026-11-06, Matthew): picked out his real take (B) correctly and rated it 4/4. Note, verbatim:
"Okay F is fine for a clone. But I also want other AI voices. Maybe an American accent. Mine is South African. Can we
have an option of my clone, male and female American". F = Qwen3-TTS 1.7B clone. The other voices weren't rated.

## Round 2: three voices to keep
Categories: your clone (Qwen3-TTS Base, two seeds), American male (Qwen CustomVoice presets Aiden and Ryan with a
"speak calmly" instruction; two VoiceDesign voices from written descriptions), American female (three VoiceDesign voices;
Chatterbox's built-in voice). Voices and descriptions: `voices_r2.json`; generation `run_r2.sh` (one model at a time,
each Qwen model dropped from the cache after use because disk is tight); page `build_r2.py` + `picker2.src.html`
(round 1 page source kept as `picker1.src.html`). Picks save to `picks/<category>`, notes to `meta/round2`.
For a designed voice to stay the same across a whole script, generate one reference clip with VoiceDesign and clone
from it (Qwen's recommended workflow); per-line design can drift.

Round 2 generation (2026-11-06, one model at a time, CPU alone): 20-30 s per line for every Qwen model. Transcript check:
all 20 clips say the full line; Ryan's "Smart Add" was heard as "smart at". Published as version 2 of the picker page.
_Picks pending._
