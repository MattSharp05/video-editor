# Flesch-Kincaid grade level with a self-contained syllable counter (vowel groups, silent-e rule). Usage: python3 readability.py FILE
import re, sys
def syl(w):
    w = re.sub(r"[^a-z]", "", w.lower())
    if not w: return 0
    if len(w) <= 3: return 1
    w = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)$", "", w); w = re.sub(r"^y", "", w)
    return max(1, len(re.findall(r"[aeiouy]{1,2}", w)))
def fk(t):
    sents = [s for s in re.split(r"[.!?]+", t) if s.strip()]; words = re.findall(r"[A-Za-z']+", t)
    sy = sum(syl(w) for w in words)
    return 0.39 * len(words) / len(sents) + 11.8 * sy / len(words) - 15.59, len(words), len(words) / len(sents)
t = open(sys.argv[1]).read()
g, n, wps = fk(t); print(f"whole script: grade {g:.1f}, {n} words, {wps:.1f} words/sentence")
for l in t.strip().split("\n"): print(f"{fk(l)[0]:5.1f} | {l[:80]}")
