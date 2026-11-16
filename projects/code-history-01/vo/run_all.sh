#!/bin/bash
# Code History 01 voice samples: one model at a time; each Qwen model dropped from the HF cache after use (disk is tight).
# Usage: bash run_all.sh <venv_dir> <raw_dir>   (venvs kk, qw, cb live outside the repo)
cd "$(dirname "$0")"; VE=$1; RAW=$2
drop() { $VE/qw/bin/python -c "
from huggingface_hub import scan_cache_dir
c=scan_cache_dir(); r=[v.commit_hash for x in c.repos if x.repo_id=='$1' for v in x.revisions]
r and c.delete_revisions(*r).execute()"; }
[ -f $RAW/ref_matthew.wav ] || ffmpeg -v error -y -i ../../trip-social-01/vo/take1.m4a -ss 8.30 -to 20.80 -ac 1 -ar 24000 $RAW/ref_matthew.wav
$VE/kk/bin/python gen_kokoro.py $RAW
$VE/qw/bin/python gen_qwen.py $RAW design; drop Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
$VE/qw/bin/python gen_qwen.py $RAW clone
# seed 21 said "How do people" on line 1: retake with seed 7, keep it as the line-1 clip
mkdir -p $RAW/retake; $VE/qw/bin/python gen_qwen.py $RAW retake qwen-clone-matthew 1 7 && cp $RAW/retake/qwen-clone-matthew_1_s7.wav $RAW/qwen-clone-matthew_1.wav
drop Qwen/Qwen3-TTS-12Hz-1.7B-Base
$VE/qw/bin/python gen_qwen.py $RAW custom Aiden,Ryan;  # the only native-English presets; drop Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
$VE/cb/bin/python gen_chatterbox.py $RAW
$VE/qw/bin/python process.py $RAW
