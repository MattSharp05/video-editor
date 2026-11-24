#!/usr/bin/env python3
"""Cut registry and review notes for one project (format: references/versions.md).

A cut is one whole render of one snapshot, numbered and kept forever in <project>/renders/cuts.json
(tracked in git; the MP4s are not). Notes are the corrections in <project>/brief.md under "## Notes",
one line each; this script answers them and keeps their status in step with the registry.

usage (run anywhere inside the project, or pass --project DIR; works for video-edit projects too):
  cuts.py add FILE.mp4 [--quality draft|preview|animatic|final] [--checks stills,mute_test,...]
                       [--label TEXT] [--inputs HASH|FILE] [--no-copy] [--no-measure]
  cuts.py note "words" --on "cut 2" [--frame 372 | --frames 300-420] [--at 12.4 | --range 10-14]
                       [--box x,y,w,h] [--card c3] [--by NAME]
  cuts.py answer n3 "what changed" [--cut N]            # verdict answered, in the latest cut by default
  cuts.py answer n4 "why not" --not-changed [--cut N]   # verdict not_changed
  cuts.py list [--json]      cuts.py open [--json]      cuts.py notes [--json]
"""
import argparse, datetime, hashlib, json, os, re, shutil, subprocess, sys

SCHEMA = 1
QUALITIES = ('draft', 'preview', 'animatic', 'final')
NOTE_RE = re.compile(r'^- (?P<id>n\d+) · (?P<meta>.*?) · "(?P<text>(?:[^"\\]|\\.)*)" · (?P<status>.+?)\s*$')
STATUS_RE = re.compile(r'^(?:(?P<open>open)|answered in cut (?P<acut>\d+): (?P<areply>.+)'
                       r'|not changed(?: in cut (?P<ncut>\d+))?: (?P<nreply>.+))$')


def die(msg):
    sys.exit(f'cuts.py: {msg}')


# ---------- project ----------

def find_project(start):
    d = os.path.abspath(start)
    while True:
        if os.path.isfile(os.path.join(d, 'brief.md')):
            return d
        up = os.path.dirname(d)
        if up == d:
            die(f'no brief.md in {start} or above it; pass --project DIR')
        d = up


def registry_path(proj):
    return os.path.join(proj, 'renders', 'cuts.json')


def load_registry(proj):
    p = registry_path(proj)
    if not os.path.exists(p):
        return {'schema': SCHEMA, 'project': os.path.basename(proj), 'cuts': []}
    with open(p) as f:
        return json.load(f)


def write_atomic(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + '.tmp'
    with open(tmp, 'w') as f:
        f.write(text)
    os.replace(tmp, path)


def save_registry(proj, reg):
    write_atomic(registry_path(proj), json.dumps(reg, indent=2, ensure_ascii=False) + '\n')


# ---------- notes in brief.md ----------

def parse_meta(meta):
    out = {'version': None, 'frame': None, 'frames': None, 'at': None, 'range': None,
           'box': None, 'card': None, 'date': None, 'by': None}
    for tok in [t.strip() for t in meta.split(' · ') if t.strip()]:
        if m := re.fullmatch(r'f(\d+)-(\d+)', tok):
            out['frames'] = [int(m[1]), int(m[2])]
        elif m := re.fullmatch(r'f(\d+)', tok):
            out['frame'] = int(m[1])
        elif m := re.fullmatch(r'(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)s', tok):
            out['range'] = [float(m[1]), float(m[2])]
        elif m := re.fullmatch(r'(\d+(?:\.\d+)?)s', tok):
            out['at'] = float(m[1])
        elif m := re.fullmatch(r'box (\d+),(\d+),(\d+),(\d+)', tok):
            out['box'] = [int(m[i]) for i in range(1, 5)]
        elif m := re.fullmatch(r'card (\S+)', tok):
            out['card'] = m[1]
        elif re.fullmatch(r'\d{4}-\d{2}-\d{2}', tok):
            out['date'] = tok
        elif m := re.fullmatch(r'by (.+)', tok):
            out['by'] = m[1]
        elif out['version'] is None:
            out['version'] = tok
        else:
            die(f'unrecognised note field "{tok}" in: {meta}')
    return out


def parse_status(s):
    m = STATUS_RE.match(s)
    if not m:
        die(f'unrecognised note status "{s}" (open | answered in cut N: … | not changed[ in cut N]: …)')
    if m['open']:
        return {'status': 'open', 'cut': None, 'reply': None}
    if m['areply'] is not None:
        return {'status': 'answered', 'cut': int(m['acut']), 'reply': m['areply']}
    return {'status': 'not_changed', 'cut': int(m['ncut']) if m['ncut'] else None, 'reply': m['nreply']}


def read_notes(proj):
    """Return (lines, notes); each note carries its line index."""
    with open(os.path.join(proj, 'brief.md')) as f:
        lines = f.read().split('\n')
    notes, seen = [], set()
    for i, line in enumerate(lines):
        m = NOTE_RE.match(line)
        if not m:
            continue
        if m['id'] in seen:
            die(f'note id {m["id"]} appears twice in brief.md')
        seen.add(m['id'])
        n = {'id': m['id'], **parse_meta(m['meta']),
             'text': m['text'].replace('\\"', '"').replace('\\\\', '\\'), **parse_status(m['status'])}
        n['_line'] = i
        notes.append(n)
    return lines, notes


def public(n):
    return {k: v for k, v in n.items() if not k.startswith('_')}


def write_brief(proj, lines):
    write_atomic(os.path.join(proj, 'brief.md'), '\n'.join(lines))


def format_status(verdict, cut, reply):
    if verdict == 'open':
        return 'open'
    if verdict == 'answered':
        return f'answered in cut {cut}: {reply}'
    return f'not changed in cut {cut}: {reply}' if cut else f'not changed: {reply}'


def one_line(s):
    return ' '.join(str(s).split())


# ---------- media ----------

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def probe(path):
    try:
        r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets',
                            '-show_entries', 'stream=width,height,r_frame_rate,nb_read_packets:format=duration',
                            '-of', 'json', path], capture_output=True, text=True, check=True)
    except (OSError, subprocess.CalledProcessError):
        return {}
    j = json.loads(r.stdout)
    s = (j.get('streams') or [{}])[0]
    num, _, den = s.get('r_frame_rate', '0/1').partition('/')
    fps = round(int(num) / int(den or 1), 3) if int(den or 1) else None
    out = {'seconds': round(float(j.get('format', {}).get('duration', 0)), 3),
           'frames': int(s['nb_read_packets']) if s.get('nb_read_packets') else None,
           'fps': int(fps) if fps and fps == int(fps) else fps,
           'width': s.get('width'), 'height': s.get('height')}
    return {k: v for k, v in out.items() if v is not None}


def loudness(path):
    try:
        r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-vn', '-af', 'ebur128=peak=true',
                            '-f', 'null', '-'], capture_output=True, text=True)
    except OSError:
        return None
    summary = r.stderr[r.stderr.rfind('Summary:'):]
    i = re.search(r'I:\s+(-?[\d.]+|-inf) LUFS', summary)
    p = re.search(r'Peak:\s+(-?[\d.]+|-inf) dBFS', summary)
    if not i:
        return None
    f = lambda m: None if m is None or 'inf' in m[1] else float(m[1])
    return {'lufs': f(i), 'true_peak_dbtp': f(p)}


def git_state(proj):
    try:
        head = subprocess.run(['git', '-C', proj, 'rev-parse', 'HEAD'], capture_output=True, text=True, check=True)
        dirty = subprocess.run(['git', '-C', proj, 'status', '--porcelain', '--', '.'], capture_output=True,
                               text=True, check=True)
    except (OSError, subprocess.CalledProcessError):
        return None, None
    return head.stdout.strip(), bool(dirty.stdout.strip())


def read_inputs_file(path, digest):
    """render.sh writes out/<name>.inputs.sha256: "inputs <hash>" and "output <sha256> <name>.mp4".
    The input hash counts only when its output line is this very file (else the hash is stale)."""
    text = open(path).read()
    m = re.search(r'^inputs ([0-9a-f]{16,64})\s*$', text, re.M)
    out = re.search(r'^output ([0-9a-f]{64}) ', text, re.M)
    if m:
        if out and out[1] != digest:
            print(f'cuts.py: {os.path.basename(path)} belongs to another render (output hash differs); '
                  'inputs_sha256 left empty', file=sys.stderr)
            return None
        return m[1]
    tok = text.split()  # a bare hash, e.g. passed by a video-edit build script
    return tok[0] if tok and re.fullmatch(r'[0-9a-f]{16,64}', tok[0]) else None


def find_inputs_hash(arg, mp4, digest):
    """--inputs is a hash or a file holding one; else the file render.sh writes beside the render."""
    if arg:
        if re.fullmatch(r'[0-9a-f]{16,64}', arg):
            return arg
        if os.path.isfile(arg):
            return read_inputs_file(arg, digest)
        die(f'--inputs: not a hash or a file: {arg}')
    c = os.path.splitext(mp4)[0] + '.inputs.sha256'
    return read_inputs_file(c, digest) if os.path.isfile(c) else None


# ---------- commands ----------

def cmd_add(proj, a):
    src = os.path.abspath(a.file)
    if not os.path.isfile(src):
        die(f'no such file: {a.file}')
    reg = load_registry(proj)
    digest = sha256_file(src)
    for c in reg['cuts']:
        if c.get('file_sha256') == digest:
            print(f'cut {c["cut"]}: the same file is already registered ({c["file"]}); nothing added')
            return c['cut']
    n = max([c['cut'] for c in reg['cuts']], default=0) + 1
    if a.no_copy:
        kept = src
    else:
        kept = os.path.join(proj, 'renders', f'{os.path.basename(proj)}_cut{n}{os.path.splitext(src)[1]}')
        os.makedirs(os.path.dirname(kept), exist_ok=True)
        if os.path.abspath(kept) != src:
            shutil.copy2(src, kept)
    commit, dirty = git_state(proj)
    cut = {'cut': n,
           'date': datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z'),
           'label': a.label,
           'quality': a.quality,
           'commit': commit,
           'dirty': dirty,
           'inputs_sha256': find_inputs_hash(a.inputs, src, digest),
           'file': os.path.relpath(kept, proj),
           'source': os.path.relpath(src, proj) if kept != src else None,
           'file_sha256': digest,
           'size_mb': round(os.path.getsize(src) / 1e6, 1),
           **probe(src),
           'loudness': None if a.no_measure else loudness(src),
           'checks': [c.strip() for c in (a.checks or '').split(',') if c.strip()],
           'answers': []}
    reg['cuts'].append({k: v for k, v in cut.items() if v is not None or k in ('commit', 'inputs_sha256', 'loudness')})
    save_registry(proj, reg)
    extra = ' (uncommitted changes in the project: commit first so the snapshot is pinned)' if dirty else ''
    print(f'cut {n}: {cut["file"]}  {cut.get("seconds", "?")} s  {cut["quality"]}{extra}')
    return n


def cmd_note(proj, a):
    lines, notes = read_notes(proj)
    nid = 'n%d' % (max([int(n['id'][1:]) for n in notes], default=0) + 1)
    meta = [one_line(a.on)]
    if a.frames:
        meta.append('f' + a.frames.replace(' ', ''))
    elif a.frame is not None:
        meta.append(f'f{a.frame}')
    if a.range:
        meta.append(a.range.replace(' ', '') + 's')
    elif a.at is not None:
        meta.append(f'{a.at:g}s')
    if a.box:
        meta.append('box ' + a.box.replace(' ', ''))
    if a.card:
        meta.append(f'card {a.card}')
    meta.append(datetime.date.today().isoformat())
    if a.by:
        meta.append(f'by {one_line(a.by)}')
    text = one_line(a.text).replace('\\', '\\\\').replace('"', '\\"')
    line = f'- {nid} · {" · ".join(meta)} · "{text}" · open'
    parse_meta(' · '.join(meta))  # validates the fields
    if notes:
        at = notes[-1]['_line'] + 1
    else:
        h = next((i for i, l in enumerate(lines) if l.strip().lower() == '## notes'), None)
        if h is None:
            while lines and lines[-1] == '':
                lines.pop()
            lines += ['', '## Notes', '']
            h = len(lines) - 2
        at = h + 1
        while at < len(lines) and lines[at].strip() == '':
            at += 1
        if at >= len(lines) or not lines[at].startswith('- '):
            lines.insert(h + 1, '')
            at = h + 2
    lines.insert(at, line)
    if lines[-1] != '':
        lines.append('')
    write_brief(proj, lines)
    print(nid)


def cmd_answer(proj, a):
    lines, notes = read_notes(proj)
    note = next((n for n in notes if n['id'] == a.id), None)
    if not note:
        die(f'no note {a.id} in brief.md')
    reg = load_registry(proj)
    verdict = 'not_changed' if a.not_changed else 'answered'
    cut = None
    if a.cut is not None or reg['cuts']:
        num = a.cut if a.cut is not None else reg['cuts'][-1]['cut']
        cut = next((c for c in reg['cuts'] if c['cut'] == num), None)
        if not cut:
            die(f'no cut {num} in renders/cuts.json')
    elif verdict == 'answered':
        die('no cuts registered: run "cuts.py add FILE" for the render that answers it')
    reply = one_line(a.reply)
    if cut:
        ans, new = cut.setdefault('answers', []), {'id': a.id, 'verdict': verdict, 'reply': reply}
        i = next((i for i, x in enumerate(ans) if x['id'] == a.id), None)
        if i is None:
            ans.append(new)
        else:
            ans[i] = new  # re-answering in the same cut replaces the answer, in place
        save_registry(proj, reg)
    m = NOTE_RE.match(lines[note['_line']])
    lines[note['_line']] = lines[note['_line']][:m.start('status')] + format_status(verdict, cut and cut['cut'], reply)
    write_brief(proj, lines)
    print(f'{a.id}: {format_status(verdict, cut and cut["cut"], reply)}')


def cmd_list(proj, a):
    reg = load_registry(proj)
    if a.json:
        print(json.dumps(reg, indent=2, ensure_ascii=False))
        return
    if not reg['cuts']:
        print('no cuts registered')
    for c in reg['cuts']:
        ans = ', '.join(f'{x["id"]}{"" if x["verdict"] == "answered" else " (not changed)"}' for x in c.get('answers', []))
        print(f'cut {c["cut"]:>3}  {c["date"][:10]}  {c.get("quality", ""):<8} {c.get("seconds", "?"):>7} s  '
              f'{(c.get("commit") or "-")[:7]}{"*" if c.get("dirty") else " "}  {c["file"]}'
              + (f'  [{c["label"]}]' if c.get('label') else '') + (f'  answers: {ans}' if ans else ''))


def cmd_notes(proj, a, only_open):
    _, notes = read_notes(proj)
    if only_open:
        notes = [n for n in notes if n['status'] == 'open']
    if a.json:
        print(json.dumps([public(n) for n in notes], indent=2, ensure_ascii=False))
        return
    if not notes:
        print('no open notes' if only_open else 'no notes')
    for n in notes:
        where = ' '.join(x for x in [n['version'], n['frame'] is not None and f'f{n["frame"]}' or '',
                                     n['frames'] and 'f%d-%d' % tuple(n['frames']) or '',
                                     n['at'] is not None and f'{n["at"]:g}s' or '',
                                     n['range'] and '%g-%gs' % tuple(n['range']) or '',
                                     n['box'] and 'box ' + ','.join(map(str, n['box'])) or '',
                                     n['card'] and f'card {n["card"]}' or ''] if x)
        st = format_status(n['status'], n['cut'], n['reply'])
        print(f'{n["id"]:>4}  {where}  "{n["text"]}"' + ('' if only_open else f'  -> {st}'))


def main(argv=None):
    p = argparse.ArgumentParser(description='Cut registry and review notes (references/versions.md).')
    p.add_argument('--project', help='project folder (default: the nearest folder above with a brief.md)')
    sub = p.add_subparsers(dest='cmd', required=True)
    s = sub.add_parser('add', help='register a render as the next cut')
    s.add_argument('file')
    s.add_argument('--quality', choices=QUALITIES, default='draft')
    s.add_argument('--checks', help='comma list of checks run on this cut, e.g. stills,motion_check,mute_test,loudness')
    s.add_argument('--label', help='short name, e.g. "v2 arm fixes"')
    s.add_argument('--inputs', help='input hash, or the file render.sh wrote it to')
    s.add_argument('--no-copy', action='store_true', help='record the file where it is instead of keeping a copy')
    s.add_argument('--no-measure', action='store_true', help='skip the loudness measurement')
    s = sub.add_parser('note', help='add a correction to brief.md and print its id')
    s.add_argument('text')
    s.add_argument('--on', required=True, help='the version it was given on: "cut 2", or "v1", "board", "animatic v1"')
    s.add_argument('--frame', type=int)
    s.add_argument('--frames', help='clip in frames, A-B')
    s.add_argument('--at', type=float, help='time in seconds')
    s.add_argument('--range', help='clip in seconds, A-B')
    s.add_argument('--box', help='region x,y,w,h in pixels of that version\'s frame')
    s.add_argument('--card', help='board card id, e.g. c3')
    s.add_argument('--by', help='who gave it (default: Matthew, unwritten)')
    s = sub.add_parser('answer', help='answer a note in a cut and update its status in brief.md')
    s.add_argument('id')
    s.add_argument('reply')
    s.add_argument('--not-changed', action='store_true')
    s.add_argument('--cut', type=int, help='default: the latest cut')
    for name in ('list', 'open', 'notes'):
        sub.add_parser(name).add_argument('--json', action='store_true')
    a = p.parse_args(argv)
    proj = os.path.abspath(a.project) if a.project else find_project(os.getcwd())
    if not os.path.isfile(os.path.join(proj, 'brief.md')):
        die(f'no brief.md in {proj}')
    if a.cmd == 'add':
        cmd_add(proj, a)
    elif a.cmd == 'note':
        cmd_note(proj, a)
    elif a.cmd == 'answer':
        cmd_answer(proj, a)
    elif a.cmd == 'list':
        cmd_list(proj, a)
    else:
        cmd_notes(proj, a, a.cmd == 'open')


if __name__ == '__main__':
    main()
