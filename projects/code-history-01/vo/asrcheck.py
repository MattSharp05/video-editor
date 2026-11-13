# Shared transcript helpers for the full-script renders: decode with ffmpeg (16 kHz), faster-whisper small.en, word-level compare.
import re, subprocess, numpy as np
NUM = {'1': 'one', '0': 'zero', 'nineteen forty six': '1946', 'nineteen forty-six': '1946', 'twenty twenty one': '2021', 'twenty twenty-one': '2021'}
def norm(s):
    s = s.lower().replace('colour', 'color').replace('a.d.d.', 'add').replace('a-d-d', 'add')
    for k, v in NUM.items(): s = re.sub(rf'(?<![\w]){re.escape(k)}(?![\w])', v, s)
    return re.sub(r"[^a-z0-9' ]", ' ', s.replace('-', ' ')).split()
def pcm16k(f):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                                        capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768
_asr = None
def asr():
    global _asr
    if _asr is None:
        from faster_whisper import WhisperModel
        _asr = WhisperModel('small.en', device='cpu', compute_type='int8')
    return _asr
def transcribe(f, words=False):
    segs, _ = asr().transcribe(pcm16k(f), language='en', beam_size=5, word_timestamps=words)
    return list(segs)
def check(f, text):
    heard = ' '.join(s.text.strip() for s in transcribe(f))
    a, b = norm(heard), norm(text)
    return a == b, heard, sum(x != y for x, y in zip(a, b)) + abs(len(a) - len(b))
