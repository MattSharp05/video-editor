#!/bin/bash
# Round 2 driver: one model at a time; drop each Qwen model from the cache after use (disk is tight here).
cd "$(dirname "$0")"
drop() { .venv-qw/bin/python -c "
from huggingface_hub import scan_cache_dir
c=scan_cache_dir(); r=[v.commit_hash for x in c.repos if x.repo_id=='$1' for v in x.revisions]
r and c.delete_revisions(*r).execute()"; }
while ! grep -q '^DONE' r2_clone.log; do sleep 5; done
.venv-qw/bin/python gen_round2.py custom > r2_custom.log 2>&1; echo "custom rc $?"
drop Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
.venv-qw/bin/python gen_round2.py design > r2_design.log 2>&1; echo "design rc $?"
.venv-cb/bin/python gen_cb_default.py > r2_cb.log 2>&1; echo "cb rc $?"
grep -h '^\(qwen\|aiden\|ryan\|design\|cb-default\)' r2_*.log; ls work | grep -c '^r2_'
