#!/usr/bin/env python3
"""Delivery pack: from the approved master(s), write the platform presets, sidecar captions, a cover and a manifest.

usage (from the film folder; every flag is optional except the master):
  python3 deliver.py out/v3.mp4 [out/v3-square.mp4 ...]      one master per layout the film was built in
      [--cut 3]                      cut number (default: renders/cuts.json entry matching the master, else its name)
      [--words src/words.json]       word timings: [{w,s,e}] or whisper segments[].words[] (default: src/words.json)
      [--lines src/Captions.tsx]     hand-written caption lines: a .tsx/.ts holding `LINES = [...]`, .json list or .txt
                                     (default: the one src/**/*.tsx with a LINES array; none: auto-chunked words)
      [--ass captions.ass | --srt captions.srt]   ready caption timing instead (video-edit's make_captions.py output)
      [--no-captions]
      [--cover-frame N | --cover still.png]       cover from master frame N (default 0), or a full-quality still
      [--review]                     add review.mp4 (half size, small) for quick looks
      [--normalize]                  re-run render.sh's loudness chain on the master first (a master not from render.sh)
      [--lufs -14 --tp -1.5 --lu-tol 1 --cap-mb 50]
      [--credits FILE ...] [--declared asset-declaration.json] [--project DIR] [--out DIR]
  -> PROJECT/renders/deliver/<cut>/{reels.mp4|square.mp4|feed.mp4|youtube.mp4, captions.srt, captions.vtt,
     cover.png, manifest.json}. Exit 1 when a check fails (the pack is still written; manifest "problems" says why).

Presets come from each master's own aspect, never from a crop: 9:16 -> reels.mp4 (Reels/TikTok/Shorts, under
--cap-mb), 1:1 -> square.mp4, 4:5 -> feed.mp4, 16:9 -> youtube.mp4. A film laid out only for 9:16 gets reels only.
A master that already fits its preset (H.264 yuv420p, AAC, right size, under the cap) is stream-copied, so the
picture is never encoded twice. Loudness and true peak are measured on every delivered MP4 (AAC raises the peak),
against -14 LUFS +-1 LU and -1.5 dBTP. Credits: every CREDITS*.md in the project (lines naming a licence or credit)
plus --credits files. Camera edits (video-edit) use the same script with --ass from make_captions.py.
"""
import argparse, datetime, glob, hashlib, json, os, re, shutil, subprocess, sys, tempfile

PRESETS = {  # aspect class -> (preset file, width, height, platforms, max video rate, cap applies)
    'vertical': ('reels', 1080, 1920, ['instagram-reels', 'tiktok', 'youtube-shorts'], '6M', True),
    'square': ('square', 1080, 1080, ['instagram-feed', 'x', 'linkedin'], '6M', True),
    'portrait': ('feed', 1080, 1350, ['instagram-feed', 'linkedin'], '6M', True),
    'landscape': ('youtube', 1920, 1080, ['youtube', 'x', 'linkedin'], '12M', False),
}
ASPECTS = {'vertical': 9 / 16, 'square': 1.0, 'portrait': 4 / 5, 'landscape': 16 / 9}
# render.sh's chain: one linear gain, then an oversampled limiter at -2.5 dB.
NORM = ('loudnorm=I={I}:TP=-2:LRA=11:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:'
        'measured_thresh={input_thresh}:offset={target_offset}:linear=true,aresample=192000,'
        'alimiter=limit=0.75:attack=1:release=50:level=false,aresample=48000')
problems = []


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, check=True, **kw).stdout


def probe(path):
    j = json.loads(run(['ffprobe', '-v', 'error', '-show_entries',
                        'stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,duration,nb_frames,sample_rate:'
                        'format=duration,size,bit_rate', '-of', 'json', path]))
    v = next((s for s in j['streams'] if s['codec_type'] == 'video'), None)
    a = next((s for s in j['streams'] if s['codec_type'] == 'audio'), None)
    if not v:
        sys.exit(f'{path}: no video stream')
    num, den = map(int, v['r_frame_rate'].split('/'))
    return {'width': v['width'], 'height': v['height'], 'fps': round(num / den, 3), 'vcodec': v['codec_name'],
            'pix_fmt': v.get('pix_fmt'), 'frames': int(v['nb_frames']) if v.get('nb_frames', 'N/A') != 'N/A' else None,
            'video_duration_s': round(float(v.get('duration', j['format']['duration'])), 3),
            'acodec': a and a['codec_name'], 'sample_rate': a and int(a['sample_rate']),
            'audio_duration_s': a and round(float(a.get('duration', j['format']['duration'])), 3),
            'duration_s': round(float(j['format']['duration']), 3), 'size_bytes': int(j['format']['size']),
            'bitrate_kbps': round(int(j['format'].get('bit_rate', 0)) / 1000)}


def loudness(path):
    err = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af',
                          'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    m = re.search(r'\{[^{}]*"input_i"[^{}]*\}', err, re.S)
    return json.loads(m.group(0)) if m else None


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def aspect_class(w, h):
    r = w / h
    k = min(ASPECTS, key=lambda c: abs(ASPECTS[c] - r))
    if abs(ASPECTS[k] - r) / ASPECTS[k] > 0.02:
        sys.exit(f'{w}x{h} matches no preset aspect (9:16, 1:1, 4:5, 16:9); deliver that layout by hand')
    return k


# ---------- captions ----------
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())


def load_words(path):
    d = json.load(open(path))
    if isinstance(d, dict) and 'segments' in d:  # whisper / transcribe.py output
        d = [{'w': w['word'].strip(), 's': w['start'], 'e': w['end']} for s in d['segments'] for w in s.get('words', [])]
    return [w for w in d if w['w'].strip()]


def load_lines(path):
    if path.endswith('.json'):
        return json.load(open(path))
    txt = open(path).read()
    if path.endswith(('.ts', '.tsx', '.js', '.mjs')):
        m = re.search(r'\bLINES\b[^=\n]*=\s*\[', txt)
        if not m:
            sys.exit(f'{path}: no `LINES = [...]` array')
        out, i, q, cur = [], m.end(), None, ''   # walk string literals until the array's own `]`
        while i < len(txt):
            c = txt[i]
            if q:
                if c == '\\':
                    cur += txt[i + 1]; i += 1
                elif c == q:
                    out.append(cur); q, cur = None, ''
                else:
                    cur += c
            elif c in '\'"`':
                q = c
            elif txt.startswith('//', i):
                i = txt.find('\n', i) if '\n' in txt[i:] else len(txt)
            elif c == ']':
                return out
            i += 1
        sys.exit(f'{path}: LINES array not closed')
    return [l.strip() for l in txt.splitlines() if l.strip()]


def cues_from_lines(words, lines):
    """Same matching and timing as captions.tsx: on 0.12 s before the first word, off at the next line (or 0.9 s
    after the last word)."""
    i, out = 0, []
    for line in lines:
        toks = [t.replace('[', '').replace(']', '') for t in line.split()]
        ws = words[i:i + len(toks)]
        for t, w in zip(toks, ws + [None] * len(toks)):
            if not w or norm(t) != norm(w['w']):
                sys.exit(f'caption mismatch: "{t}" vs "{w and w["w"]}" in "{line}"')
        out.append([ws[0]['s'] - 0.12, ws[-1]['e'] + 0.9, ' '.join(toks)])
        i += len(toks)
    if i < len(words):
        problems.append(f'captions: lines stop at word {i} of {len(words)} ("{words[i]["w"]}"...)')
    for a, b in zip(out, out[1:]):
        a[1] = min(a[1], b[0])
    return out


def cues_auto(words, max_words=7, max_chars=42, gap=0.6):
    out, cur = [], []
    for w in words:
        if cur and (len(cur) >= max_words or len(' '.join(x['w'] for x in cur + [w])) > max_chars or w['s'] - cur[-1]['e'] > gap):
            out.append(cur); cur = []
        cur.append(w)
        if w['w'][-1:] in '.?!':
            out.append(cur); cur = []
    if cur:
        out.append(cur)
    cues = [[c[0]['s'] - 0.06, c[-1]['e'] + 0.3, ' '.join(x['w'] for x in c)] for c in out]
    for a, b in zip(cues, cues[1:]):
        a[1] = min(a[1], b[0])
    return cues


def parse_ts(t):
    h, m, s = t.replace(',', '.').split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)


def cues_from_ass(path):
    out = []
    for l in open(path, encoding='utf-8-sig'):
        if l.startswith('Dialogue:'):
            f = l.split(':', 1)[1].split(',', 9)
            out.append([parse_ts(f[1]), parse_ts(f[2]), re.sub(r'\{[^}]*\}', '', f[9].strip()).replace('\\N', '\n')])
    return sorted(out)


def cues_from_srt(path):
    out = []
    for block in re.split(r'\n\s*\n', open(path, encoding='utf-8-sig').read().strip()):
        ls = block.splitlines()
        k = next(i for i, l in enumerate(ls) if '-->' in l)
        a, b = [x.strip().split()[0] for x in ls[k].split('-->')]
        out.append([parse_ts(a), parse_ts(b), '\n'.join(ls[k + 1:])])
    return out


def wrap(text, n=42):
    if '\n' in text or len(text) <= n:
        return text
    ws = text.split()
    best = min(range(1, len(ws)), key=lambda i: abs(len(' '.join(ws[:i])) - len(' '.join(ws[i:]))))
    return ' '.join(ws[:best]) + '\n' + ' '.join(ws[best:])


def stamp(t, sep):
    ms = round(t * 1000)
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d}{sep}{ms % 1000:03d}'


def write_captions(cues, dur, d):
    cues = [[max(0.0, a), min(b, dur), t] for a, b, t in cues if a < dur]
    bad = [c for c in cues if c[1] - c[0] < 0.2]
    overl = sum(1 for a, b in zip(cues, cues[1:]) if b[0] < a[1] - 1e-6)
    if bad: problems.append(f'captions: {len(bad)} cue(s) shorter than 0.2 s, first "{bad[0][2]}"')
    if overl: problems.append(f'captions: {overl} overlapping cue(s)')
    with open(os.path.join(d, 'captions.srt'), 'w') as f:
        for i, (a, b, t) in enumerate(cues, 1):
            f.write(f'{i}\n{stamp(a, ",")} --> {stamp(b, ",")}\n{wrap(t)}\n\n')
    with open(os.path.join(d, 'captions.vtt'), 'w') as f:
        f.write('WEBVTT\n\n')
        for a, b, t in cues:
            f.write(f'{stamp(a, ".")} --> {stamp(b, ".")}\n{wrap(t)}\n\n')
    return {'cues': len(cues), 'first_s': round(cues[0][0], 3), 'last_end_s': round(cues[-1][1], 3),
            'overlaps': overl, 'files': ['captions.srt', 'captions.vtt']}


# ---------- project records ----------
def find_project(start):
    d = os.path.abspath(start)
    while d != os.path.dirname(d):
        if os.path.exists(os.path.join(d, 'brief.md')):
            return d
        d = os.path.dirname(d)
    return os.path.abspath(start)


def from_registry(project, master, inputs_hash):
    """Read-only lookup in renders/cuts.json (written by the cut registry); tolerant of its exact field names."""
    p = os.path.join(project, 'renders', 'cuts.json')
    if not os.path.exists(p):
        return None
    try:
        d = json.load(open(p))
    except ValueError:
        problems.append('renders/cuts.json is not valid JSON'); return None
    rows = d.get('cuts', []) if isinstance(d, dict) else d
    hit = None
    master_sha = None
    for r in rows if isinstance(rows, list) else []:
        paths = [r[k] for k in ('path', 'file', 'source', 'mp4', 'render') if isinstance(r.get(k), str)]
        h = next((r[k] for k in ('input_hash', 'inputs_sha256', 'inputs', 'hash') if isinstance(r.get(k), str)), '')
        if any(os.path.basename(p) == os.path.basename(master) for p in paths) or (inputs_hash and h == inputs_hash):
            hit = r
        elif isinstance(r.get('file_sha256'), str):
            # cuts.py keeps a copy as renders/<slug>_cutN.mp4; match the master by content too.
            master_sha = master_sha or sha256(master)
            if r['file_sha256'] == master_sha:
                hit = r
    return hit


def credits(project, extra):
    files = [f for f in glob.glob(os.path.join(project, '**', 'CREDITS*.md'), recursive=True)
             if not re.search(r'/(node_modules|renders|out|\.git|\.venv)/', f)] + list(extra)
    out = []
    for f in sorted(set(files)):
        ls = [l.strip(' -*') for l in open(f) if re.search(r'CC[ -]?BY|CC0|licen[cs]|credit|public domain|^\s*(Music|Sound|Photo)s?:', l, re.I)]
        out.append({'file': os.path.relpath(f, project), 'lines': [l.strip() for l in ls][:40]})
    return out


def git_info(project):
    try:
        commit = run(['git', '-C', project, 'rev-parse', 'HEAD']).strip()
        dirty = bool(run(['git', '-C', project, 'status', '--porcelain', '--', '.']).strip())
        return {'commit': commit, 'dirty': dirty}
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


# ---------- presets ----------
def normalize(master, tmp, lufs):
    m = loudness(master)
    if not m:
        sys.exit(f'{master}: no audio to normalize')
    out = os.path.join(tmp, 'master.norm.mp4')
    vd = probe(master)['video_duration_s']   # loudnorm pads to 100 ms: trim the audio back to the picture
    run(['ffmpeg', '-y', '-v', 'error', '-i', master, '-c:v', 'copy', '-af', NORM.format(I=lufs, **m) + f',atrim=0:{vd}', '-ar', '48000',
         '-c:a', 'aac', '-b:a', '192k', out])
    return out


def make_preset(src, info, name, W, H, rate, cap_b, dst, crf=18):
    w, h = (W, H) if info['width'] >= W else (info['width'], info['height'])   # downscale only, never crop
    fits = (info['vcodec'] == 'h264' and info['pix_fmt'] == 'yuv420p' and (info['width'], info['height']) == (w, h)
            and info['acodec'] == 'aac' and (cap_b is None or info['size_bytes'] < cap_b)
            and info['bitrate_kbps'] <= int(rate.rstrip('M')) * 1500)   # render.sh's 6M cap bursts above 6M on short films
    if fits:
        run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-map', '0:v:0', '-map', '0:a:0?', '-c', 'copy', '-movflags', '+faststart', dst])
        return 'copy'
    kbps = int(rate.rstrip('M')) * 1000
    if cap_b:  # fit the cap with 10% margin after 192k audio
        kbps = min(kbps, int(cap_b * 0.9 * 8 / 1000 / info['duration_s']) - 192)
    a = ['-c:a', 'copy'] if info['acodec'] == 'aac' else ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000']
    run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-map', '0:v:0', '-map', '0:a:0?', '-vf', f'scale={w}:{h}:flags=lanczos',
         '-c:v', 'libx264', '-preset', 'medium', '-crf', str(crf), '-maxrate', f'{kbps}k', '-bufsize', f'{2 * kbps}k',
         '-pix_fmt', 'yuv420p', *a, '-movflags', '+faststart', dst])
    return f'x264 crf{crf} max {kbps}k'


def check_file(path, args, cap_b, fps_ref):
    i = probe(path)
    L = loudness(path) if i['acodec'] else None
    c = {}
    if L:
        I, tp = float(L['input_i']), float(L['input_tp'])
        c['loudness'] = abs(I - args.lufs) <= args.lu_tol
        c['true_peak'] = tp <= args.tp
        i['loudness'] = {'integrated_lufs': I, 'true_peak_dbtp': tp, 'lra_lu': float(L['input_lra'])}
    else:
        c['audio'] = False
    if cap_b:
        c['size_cap'] = i['size_bytes'] < cap_b
    if i['audio_duration_s'] is not None:
        c['av_length_match'] = abs(i['video_duration_s'] - i['audio_duration_s']) <= 1.5 / fps_ref + 0.03
    for k, ok in c.items():
        if not ok:
            problems.append(f'{os.path.basename(path)}: {k} failed' + (f' ({i["loudness"]})' if k in ('loudness', 'true_peak') else ''))
    i['checks'] = c
    return i


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('masters', nargs='+')
    ap.add_argument('--cut'); ap.add_argument('--project'); ap.add_argument('--out')
    ap.add_argument('--words'); ap.add_argument('--lines'); ap.add_argument('--ass'); ap.add_argument('--srt')
    ap.add_argument('--no-captions', action='store_true')
    ap.add_argument('--cover-frame', type=int, default=0); ap.add_argument('--cover')
    ap.add_argument('--review', action='store_true'); ap.add_argument('--normalize', action='store_true')
    ap.add_argument('--lufs', type=float, default=-14.0); ap.add_argument('--tp', type=float, default=-1.5)
    ap.add_argument('--lu-tol', type=float, default=1.0); ap.add_argument('--cap-mb', type=float, default=50)
    ap.add_argument('--credits', nargs='*', default=[]); ap.add_argument('--declared')
    args = ap.parse_args()

    project = os.path.abspath(args.project or find_project(os.getcwd()))
    master = os.path.abspath(args.masters[0])
    hfile = os.path.splitext(master)[0] + '.inputs.sha256'
    inputs_hash = None
    if os.path.exists(hfile):
        inputs_hash = next((l.split()[1] for l in open(hfile) if l.startswith('inputs ')), None)
    reg = from_registry(project, master, inputs_hash)
    cut = args.cut or (reg and str(next((reg[k] for k in ('cut', 'number', 'n') if k in reg), '')) or None)
    label = cut or os.path.splitext(os.path.basename(master))[0]
    d = os.path.abspath(args.out or os.path.join(project, 'renders', 'deliver', str(label)))
    os.makedirs(d, exist_ok=True)
    cap_b = int(args.cap_mb * 1_000_000)

    masters, seen = [], set()
    for m in args.masters:
        info = probe(m)
        k = aspect_class(info['width'], info['height'])
        if k in seen:
            sys.exit(f'two masters for the {k} layout')
        seen.add(k)
        masters.append((os.path.abspath(m), info, k))

    deliverables = []
    with tempfile.TemporaryDirectory() as tmp:
        for m, info, k in masters:
            src = normalize(m, tmp, args.lufs) if args.normalize else m
            sinfo = probe(src) if args.normalize else info
            name, W, H, plats, rate, capped = PRESETS[k]
            jobs = [(name, W, H, plats, rate, cap_b if capped else None, 18)]
            if args.review and k == masters[0][2]:
                jobs.append(('review', W // 2, H // 2, ['review'], '2M', min(cap_b, 15_000_000), 28))
            for name, W, H, plats, rate, cb, crf in jobs:
                dst = os.path.join(d, name + '.mp4')
                how = make_preset(src, sinfo, name, W, H, rate, cb, dst, crf)
                print(f'{name}.mp4: {how}')
                r = check_file(dst, args, cb, info['fps'])
                r.update({'preset': name, 'file': name + '.mp4', 'platforms': plats, 'from_master': os.path.relpath(m, project),
                          'encoded': how, 'size_mb': round(r['size_bytes'] / 1e6, 2)})
                deliverables.append(r)

    # captions: explicit timing > lines matched to words > auto-chunked words
    dur = masters[0][1]['duration_s']
    cap = None
    if not args.no_captions:
        film = os.getcwd()
        words = args.words or (os.path.join(film, 'src', 'words.json') if os.path.exists(os.path.join(film, 'src', 'words.json')) else None)
        lines = args.lines
        if not lines and words and not (args.ass or args.srt):
            hits = [f for f in glob.glob(os.path.join(film, 'src', '**', '*.tsx'), recursive=True)
                    if re.search(r'\bconst LINES\b', open(f).read())]
            if len(hits) == 1:
                lines = hits[0]
            elif hits:
                problems.append(f'captions: several LINES arrays ({", ".join(map(os.path.basename, hits))}); pass --lines')
        if args.ass:
            cues, src = cues_from_ass(args.ass), {'ass': args.ass}
        elif args.srt:
            cues, src = cues_from_srt(args.srt), {'srt': args.srt}
        elif words and lines:
            cues, src = cues_from_lines(load_words(words), load_lines(lines)), {'words': words, 'lines': lines}
        elif words:
            cues, src = cues_auto(load_words(words)), {'words': words, 'lines': 'auto-chunked (no hand-written lines)'}
        else:
            cues = None
            problems.append('captions: no caption data (pass --words/--lines, --ass or --srt, or --no-captions)')
        if cues:
            cap = write_captions(cues, dur, d)
            cap['source'] = {k: os.path.relpath(v, project) if os.path.exists(str(v)) else v for k, v in src.items()}

    # cover
    cover = os.path.join(d, 'cover.png')
    if args.cover:
        shutil.copyfile(args.cover, cover); cov = {'file': 'cover.png', 'source': os.path.relpath(os.path.abspath(args.cover), project)}
    else:
        run(['ffmpeg', '-y', '-v', 'error', '-i', masters[0][0], '-vf', f'select=eq(n\\,{args.cover_frame})',
             '-frames:v', '1', '-fps_mode', 'passthrough', cover])
        cov = {'file': 'cover.png', 'frame': args.cover_frame, 'source': 'master'}
    if not os.path.exists(cover) or os.path.getsize(cover) == 0:
        problems.append(f'cover: frame {args.cover_frame} not extracted')

    mi = masters[0][1]
    manifest = {
        'cut': cut, 'cut_source': 'arg' if args.cut else 'renders/cuts.json' if cut else None,
        'created': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
        'project': os.path.basename(project), 'git': git_info(project),
        'masters': [{'path': os.path.relpath(m, project), 'layout': k, 'sha256': sha256(m),
                     'width': i['width'], 'height': i['height'], 'fps': i['fps'], 'frames': i['frames'],
                     'duration_s': i['duration_s'], 'size_bytes': i['size_bytes']} for m, i, k in masters],
        'inputs_sha256': inputs_hash, 'normalized_here': args.normalize,
        'targets': {'integrated_lufs': args.lufs, 'lu_tolerance': args.lu_tol, 'true_peak_dbtp': args.tp,
                    'cap_mb': args.cap_mb},
        'deliverables': [{k: r[k] for k in ('preset', 'file', 'platforms', 'from_master', 'encoded', 'width', 'height',
                                            'fps', 'frames', 'duration_s', 'video_duration_s', 'audio_duration_s',
                                            'size_bytes', 'size_mb', 'bitrate_kbps', 'loudness', 'checks') if k in r}
                         for r in deliverables],
        'captions': cap, 'cover': cov,
        'credits': credits(project, args.credits),
        'asset_declaration': json.load(open(args.declared)) if args.declared else None,
        'registry_entry': reg,
        'problems': problems, 'checks_passed': not problems,
    }
    json.dump(manifest, open(os.path.join(d, 'manifest.json'), 'w'), indent=1)
    for r in deliverables:
        L = r.get('loudness') or {}
        print(f"{r['file']:12s} {r['width']}x{r['height']} {r['duration_s']:.2f}s {r['size_mb']:.1f} MB "
              f"{L.get('integrated_lufs')} LUFS {L.get('true_peak_dbtp')} dBTP")
    print(f'{d}/manifest.json  ' + ('all checks passed' if not problems else 'PROBLEMS:\n  ' + '\n  '.join(problems)))
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
