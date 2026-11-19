#!/bin/bash
# Full locked script in each shortlisted voice (full_lines.json). One TTS model at a time; Base dropped from the HF cache after.
# Usage: bash run_full.sh <venv_dir> <raw_dir>   (venvs kk, qw live outside the repo; raw_dir from run_all.sh holds the samples)
cd "$(dirname "$0")"; VE=$1; RAW=$2
K=kokoro-am_fenrir,kokoro-am_puck,kokoro-bm_fable
$VE/kk/bin/python gen_full.py $RAW kokoro $K && $VE/qw/bin/python gen_full.py $RAW check $K && $VE/qw/bin/python process_full.py $RAW $K
# refs/ref_qwen-custom-{aiden,ryan}_hook.wav = the trimmed CustomVoice hook clips from run_all.sh (raw/trim/qwen-custom-*_1.wav)
for k in qwen-custom-aiden qwen-custom-ryan qwen-design-m2 qwen-design-f-bright qwen-design-f2 qwen-design-ukm qwen-design-ukf; do
  $VE/qw/bin/python gen_full.py $RAW qwen $k && $VE/qw/bin/python process_full.py $RAW $k
done
$VE/qw/bin/python -c "
from huggingface_hub import scan_cache_dir
c=scan_cache_dir(); r=[v.commit_hash for x in c.repos if x.repo_id=='Qwen/Qwen3-TTS-12Hz-1.7B-Base' for v in x.revisions]
r and c.delete_revisions(*r).execute()"
