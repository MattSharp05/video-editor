#!/bin/bash
# venv for Qwen3-TTS on CPU, outside the repo (large).
set -e; V=$HOME/.venv-qw
[ -x $V/bin/python ] || { uv venv -p 3.12 $V && VIRTUAL_ENV=$V uv pip install qwen-tts soundfile --extra-index-url https://download.pytorch.org/whl/cpu --index-strategy unsafe-best-match; }
$V/bin/python -c "import qwen_tts, soundfile; print('qwen-tts ready')"
