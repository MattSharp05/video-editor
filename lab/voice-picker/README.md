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
_Pending Matthew's ratings (picker artifact, `ratings` and `meta/overall` collections)._
