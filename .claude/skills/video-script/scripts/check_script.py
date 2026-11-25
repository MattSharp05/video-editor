#!/usr/bin/env python3
"""Check a short-form script table, or a set of hook options, before it is delivered.

Script mode reads the Markdown table in a script (columns: Time, Spoken line, On-screen text,
What the viewer sees, Capture; matched by header words, any order) and estimates each line's
speaking time at the creator's pace. It flags:
  - the first sentence ending after 3 s, and the second after 10 s;
  - a line that takes longer to say than its time slot;
  - no on-screen text column, no hook card at frame 0, a card over 6 words, a card that only
    repeats the spoken line word for word;
  - a spoken number that the same row's on-screen text or picture doesn't show (or shows
    differently), and a spoken name the row's picture or text never mentions;
  - a row holding longer than 4 s (confirm the picture changes inside it; a default, the
    creator's findings override it).
Hook mode (--hooks FILE, one option per line as `spoken | on-screen card`) times each hook,
names its formula from references/hooks.json, and flags dealbreakers: past 3 s, setup words,
nothing checkable, a card over 6 words, two options built on the same formula. It never ranks
hooks: the creator's findings and the proof each hook can show decide.

Timings are word counts at a words-per-second pace: --wps, else the profile's "Draft at N",
else 3.0. Exit status 1 when anything is flagged.

Usage
  python3 check_script.py projects/x/script.md
  python3 check_script.py script.md --wps 2.7
  python3 check_script.py --hooks hooks.txt

Timing and beat checks adapted from beats.py, and the formula bank from hooks.json, in
Jakeschincariol/instagram-agent-skill (MIT, (c) 2026 Jake Schincariol; see
references/hooks.LICENSE).
"""

import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
HOOKS_JSON = os.path.join(HERE, "..", "references", "hooks.json")
PROFILE = os.path.expanduser("~/.video-script/profile.md")

HOOK_END = 3.0       # s: the first sentence should be finished
SECOND_END = 10.0    # s: the second sentence should be finished
MAX_HOLD = 4.0       # s: one row with nothing changing on screen (a default, not a finding)
CARD_WORDS = 6       # words per on-screen card
SLOT_SLACK = 0.3     # s of tolerance before a line "doesn't fit" its slot

WORD_RE = re.compile(r"[A-Za-z0-9$%'’.,-]*[A-Za-z0-9%]")
SENT_RE = re.compile(r"[^.!?]+(?:[.!?]+|$)")
SETUP_RE = re.compile(
    r"\b(?:hey guys|hi everyone|in this video|today i(?:'m| am)? (?:going to|gonna)|"
    r"welcome back|let me tell you|before we (?:start|begin)|my name is)\b", re.I)

UNITS = {w: i for i, w in enumerate(
    "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen "
    "fifteen sixteen seventeen eighteen nineteen".split())}
TENS = {w: 10 * (i + 2) for i, w in enumerate(
    "twenty thirty forty fifty sixty seventy eighty ninety".split())}
SCALES = {"hundred": 100, "thousand": 1e3, "k": 1e3, "million": 1e6, "m": 1e6,
          "billion": 1e9, "bn": 1e9, "b": 1e9}
NAME_SKIP = {"I", "I'm", "I've", "I'll", "I'd", "OK", "So", "And", "But", "Or", "The", "A",
             "An", "This", "That", "It", "It's", "You", "Your", "We", "My", "Then", "Now"}


def words(text):
    return [w for w in WORD_RE.findall(strip_md(text)) if re.search(r"[A-Za-z0-9]", w)]


def strip_md(text):
    text = re.sub(r"<br\s*/?>", " / ", text)
    return re.sub(r"[*_`]", "", text)


def numbers(text):
    """Every number in the text, digits or words, as floats ("forty" -> 40, "1.8 billion")."""
    toks = re.findall(r"\d[\d,]*(?:\.\d+)?|[A-Za-z]+", strip_md(text).lower())
    out, cur, seen, i = [], 0.0, False, 0
    while i < len(toks):
        t = toks[i]
        if t[0].isdigit():
            if seen:
                out.append(cur)
                cur, seen = 0.0, False
            v = float(t.replace(",", ""))
            if i + 1 < len(toks) and toks[i + 1] in SCALES:
                v *= SCALES[toks[i + 1]]
                i += 1
            out.append(v)
        elif t in UNITS or t in TENS:
            cur += UNITS.get(t, TENS.get(t, 0))
            seen = True
        elif t in SCALES and seen and t not in ("k", "m", "b", "bn"):
            cur = (cur or 1) * SCALES[t] if t != "hundred" else (cur or 1) * 100
            seen = True
        elif t == "and" and seen:
            pass
        elif seen:
            out.append(cur)
            cur, seen = 0.0, False
        i += 1
    if seen:
        out.append(cur)
    return out


def num(v):
    for scale, word in ((1e9, " billion"), (1e6, " million")):
        if v >= scale:
            return f"{v / scale:g}{word}"
    return f"{v:,.0f}" if v == int(v) else f"{v:g}"


def names(text):
    """Runs of capitalised words, skipping a lone sentence start: product, place, people names."""
    found = []
    for sent in SENT_RE.findall(strip_md(text)):
        ws = re.findall(r"[A-Za-z][\w'’-]*", sent)
        run = []
        for i, w in enumerate(ws + [""]):
            if w and w[0].isupper() and w not in NAME_SKIP:
                run.append((i, w))
                continue
            if run and not (len(run) == 1 and run[0][0] == 0):
                found.append(" ".join(x for _, x in run))
            run = []
    return found


def mentions(name, text):
    """A name counts as shown when any of its words (stemmed) appears in the text."""
    for w in name.split():
        stem = re.sub(r"(?:'s|’s|s)$", "", w.lower())[:6]
        if len(stem) > 2 and stem in text.lower():
            return True
    return False


def parse_time(cell):
    """'0.0–2.5' or '0:02–0:05.5' -> (start, end) in seconds, or None."""
    parts = re.split(r"\s*[–—-]\s*", cell.strip())
    if len(parts) != 2:
        return None

    def sec(s):
        s = s.strip().rstrip("s")
        if ":" in s:
            m, x = s.split(":", 1)
            return int(m) * 60 + float(x)
        return float(s)
    try:
        return sec(parts[0]), sec(parts[1])
    except ValueError:
        return None


def read_pace(arg):
    if arg:
        return arg, "--wps"
    try:
        text = open(PROFILE, encoding="utf-8").read()
        m = re.search(r"[Dd]raft (?:scripts? )?at (\d+(?:\.\d+)?)", text)
        if m:
            return float(m.group(1)), "profile"
    except OSError:
        pass
    return 3.0, "default (no profile pace)"


def find_table(md):
    """Return (header cells, rows) of the first table whose header names a spoken column."""
    lines = md.splitlines()
    for i, line in enumerate(lines):
        if line.strip().startswith("|") and re.search(r"spoken|voice|line", line, re.I) \
                and i + 1 < len(lines) and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            head = [c.strip() for c in line.strip().strip("|").split("|")]
            rows = []
            for row in lines[i + 2:]:
                if not row.strip().startswith("|"):
                    break
                cells = [c.strip() for c in row.strip().strip("|").split("|")]
                rows.append(cells + [""] * (len(head) - len(cells)))
            return head, rows
    return None, None


def column(head, *keys):
    for k in keys:
        for i, h in enumerate(head):
            if re.search(k, h, re.I):
                return i
    return None


def cards(cell):
    cell = strip_md(cell).strip()
    if not cell or cell in ("-", "—", "–"):
        return []
    quoted = re.findall(r"[\"“]([^\"”]+)[\"”]", cell)
    parts = quoted if quoted else re.split(r"\s+/\s+|\s*→\s*", cell)
    return [p.strip() for p in parts if p.strip()]


def check_script(path, wps, pace_src):
    md = open(path, encoding="utf-8").read()
    head, rows = find_table(md)
    if not head:
        print(f"{path}: no script table found (a header row naming the spoken line)")
        return 1
    c_time = column(head, r"^time")
    c_spoken = column(head, r"spoken", r"voice", r"line")
    c_text = column(head, r"screen text|on-screen text|text on screen|^text|card")
    c_pic = column(head, r"sees|picture|visual|on-screen|screen")
    if c_pic == c_text:
        c_pic = column(head, r"sees|picture|visual")
    c_cap = column(head, r"capture|build|source")

    flags, notes, out = [], [], []
    clock = 0.0
    sentences = []           # (end time estimate, sentence)
    for n, r in enumerate(rows, 1):
        spoken = strip_md(r[c_spoken]) if c_spoken is not None else ""
        slot = parse_time(r[c_time]) if c_time is not None else None
        start = slot[0] if slot else clock
        say = len(words(spoken)) / wps
        t = start
        for s in SENT_RE.findall(spoken):
            if words(s):
                t += len(words(s)) / wps
                sentences.append((t, s.strip()))
        clock = (slot[1] if slot else start + say)
        dur = (slot[1] - slot[0]) if slot else say
        text = r[c_text] if c_text is not None else ""
        pic = r[c_pic] if c_pic is not None else ""
        cap = r[c_cap] if c_cap is not None else ""
        row_flags = []

        if slot and say > dur + SLOT_SLACK:
            row_flags.append(f"takes {say:.1f}s to say in a {dur:.1f}s slot")
        if c_pic is not None and not strip_md(pic).strip():
            row_flags.append("no picture")
        for card in cards(text):
            nw = len(words(card))
            if nw > CARD_WORDS:
                row_flags.append(f"card \"{card}\" is {nw} words (max {CARD_WORDS})")
            elif nw >= 4 and card.lower().strip(" .!?") in spoken.lower():
                row_flags.append(f"card \"{card}\" repeats the spoken line; compress or add to it")
        shown = " ".join([text, pic])
        near = " ".join(strip_md(rows[k][c]) for k in (n - 2, n - 1, n) if 0 <= k < len(rows)
                        for c in (c_text, c_pic) if c is not None)
        shown_nums = numbers(shown)
        for v in numbers(spoken):
            if not any(abs(v - s) <= 1e-9 * max(1, v) for s in shown_nums):
                row_flags.append(f"spoken number {num(v)} isn't shown in this row's text or picture"
                                 + (f" (shows {', '.join(num(s) for s in shown_nums)})"
                                    if shown_nums else ""))
        for nm in dict.fromkeys(names(spoken)):
            if not mentions(nm, near):
                row_flags.append(f"name \"{nm}\" is spoken but not in the picture or text")
        if dur > MAX_HOLD:
            notes.append(f"row {n} holds {dur:.1f}s: the picture column should say what changes "
                         f"inside it (a cut, a move, a new element)")

        out.append((n, start, dur, say, spoken, row_flags))
        flags += [(n, f) for f in row_flags]

    total_say = sum(o[3] for o in out)
    print(f"\nSCRIPT CHECK  {path}")
    print(f"pace {wps} words/s ({pace_src})  ·  {sum(len(words(o[4])) for o in out)} words  ·  "
          f"~{total_say:.1f}s of speech  ·  table ends at {clock:.1f}s")
    print("=" * 78)
    for n, start, dur, say, spoken, row_flags in out:
        print(f"{n:>2}  {start:5.1f}s  slot {dur:4.1f}s  say {say:4.1f}s  {spoken[:52]}")
        for f in row_flags:
            print(f"{'':>22}FLAG {f}")
    print("-" * 78)

    if c_text is None:
        flags.append((0, "no On-screen text column (the hook card and other cards)"))
    elif not cards(rows[0][c_text]):
        flags.append((1, "no hook card at frame 0"))
    if sentences:
        if sentences[0][0] > HOOK_END:
            flags.append((1, f"first sentence ends at ~{sentences[0][0]:.1f}s (by {HOOK_END:.0f}s): "
                             f"\"{sentences[0][1][:60]}\""))
        if len(sentences) > 1 and sentences[1][0] > SECOND_END:
            flags.append((1, f"second sentence ends at ~{sentences[1][0]:.1f}s "
                             f"(by {SECOND_END:.0f}s)"))
    for n, f in flags:
        if n == 0 or f.startswith(("no hook", "first", "second")):
            print(f"FLAG {f}")
    for note in notes:
        print(f"note {note}")
    print(f"\n{len(flags)} flag(s). Fix each, or say in the delivery why it stays.")
    return 1 if flags else 0


def load_hooks():
    with open(HOOKS_JSON, encoding="utf-8") as f:
        bank = json.load(f)
    by_id = {h["id"]: h for h in bank["hooks"]}
    return [by_id[i] for i in bank["classify_order"]]


def formula(line, ordered):
    for h in ordered:
        if re.search(h["match"], line, re.I):
            return h
    return None


def check_hooks(path, wps, pace_src):
    ordered = load_hooks()
    opts = [l.strip() for l in open(path, encoding="utf-8") if l.strip() and not l.startswith("#")]
    print(f"\nHOOK CHECK  {path}  ·  pace {wps} words/s ({pace_src})")
    print("=" * 78)
    used, nflags = {}, 0
    for i, opt in enumerate(opts, 1):
        spoken, _, card = (p.strip() for p in opt.partition("|"))
        first = (SENT_RE.findall(spoken) or [spoken])[0]
        say = len(words(first)) / wps
        h = formula(spoken, ordered)
        fl = []
        if say > HOOK_END:
            fl.append(f"first sentence takes {say:.1f}s (by {HOOK_END:.0f}s; "
                      f"about {int(HOOK_END * wps)} words)")
        if SETUP_RE.search(spoken):
            fl.append("setup words: start at the sentence you'd reach at second six")
        if not numbers(spoken) and not names(spoken) and not re.search(r"\bthis\b|\bwatch\b", spoken, re.I):
            fl.append("nothing checkable: no number, name or on-screen thing to point at")
        if not card:
            fl.append("no on-screen card (write it as `spoken | card`)")
        elif len(words(card)) > CARD_WORDS:
            fl.append(f"card is {len(words(card))} words (max {CARD_WORDS})")
        if h:
            used.setdefault(h["name"], []).append(i)
        print(f"{i}. [{h['name'] if h else 'no formula matched'}]  {say:.1f}s  {spoken}")
        if card:
            print(f"   card: {card}")
        if h:
            print(f"   trap: {h['trap']}")
        for f in fl:
            print(f"   FLAG {f}")
        nflags += len(fl)
    if len(opts) < 3:
        print(f"FLAG {len(opts)} option(s): write three, each from a different formula")
        nflags += 1
    for name, idx in used.items():
        if len(idx) > 1:
            print(f"FLAG options {', '.join(map(str, idx))} are all {name}: use different formulas")
            nflags += 1
    print(f"\n{nflags} flag(s). This checks dealbreakers only; it doesn't rank the hooks.")
    return 1 if nflags else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("script", nargs="?", help="script.md with the script table")
    ap.add_argument("--hooks", help="file of hook options, one per line: spoken | card")
    ap.add_argument("--wps", type=float, help="speaking pace, words per second")
    a = ap.parse_args()
    wps, src = read_pace(a.wps)
    if a.hooks:
        sys.exit(check_hooks(a.hooks, wps, src))
    if not a.script:
        ap.error("give a script file or --hooks FILE")
    sys.exit(check_script(a.script, wps, src))


if __name__ == "__main__":
    main()
