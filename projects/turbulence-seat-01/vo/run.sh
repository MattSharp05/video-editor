#!/bin/bash
# venv lives outside the repo (large); see ai-voiceover.md for the setup line
set -e; cd "$(dirname "$0")"; V=/home/user/.venv-qw
[ -x $V/bin/python ] || { uv venv -p 3.12 $V && VIRTUAL_ENV=$V uv pip install qwen-tts soundfile --extra-index-url https://download.pytorch.org/whl/cpu --index-strategy unsafe-best-match; }
date; $V/bin/python gen_vo.py design; date
rm -rf ~/.cache/huggingface/hub/models--Qwen--Qwen3-TTS-12Hz-1.7B-VoiceDesign
$V/bin/python gen_vo.py lines; date; echo ALLDONE
