#!/usr/bin/env python3
"""Face slots: where the avatar is on screen, from the VO word timings.

usage (from the film folder):  python3 <skill>/scripts/face_slots.py [--plan face_plan.json] [--vo ../vo/vo.wav]
  reads   face_plan.json, src/words.json
  writes  src/face_slots.json  (the film imports it; gen_face.py reads it)
          ../vo/face/<slot>.wav (the VO slice per slot, handles included, from the clean VO stem)

face_plan.json:
  {"handles": 0.4, "fps": 30,
   "slots": [
     {"name": "hook", "from": "Most people think", "to": "at the beach", "layout": "full"},
     {"name": "turn", "from": "So how does", "to": "make it", "lead": 0.3, "layout": "pip"},
     {"name": "cta",  "start": 61.2, "end": 64.0}
   ]}
  from/to are phrases (first occurrence after the previous slot); start/end are seconds. lead (s) delays the face
  after its first word (J cut); trail (s) cuts away before the last word ends (L cut). layout: full | pip | cutout.
Rules (warn, or refuse with --strict): each slot 2-5 s on screen (refuse > 7 s always), total 20-30 % of the VO,
first slot starts by 3 s, >= 3 s of animation between slots.
"""
import argparse, json, os, re, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('--plan', default='face_plan.json')
ap.add_argument('--words', default='src/words.json')
ap.add_argument('--vo', default='../vo/vo.wav')
ap.add_argument('--out', default='src/face_slots.json')
ap.add_argument('--slices', default='../vo/face')
ap.add_argument('--strict', action='store_true')
a = ap.parse_args()

P = json.load(open(a.plan))
W = json.load(open(a.words))
H = float(P.get('handles', 0.4))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
toks = [norm(w['w']) for w in W]
vo_end = W[-1]['e']


def find(phrase, after, end=False):
    p = [norm(x) for x in phrase.split()]
    for i in range(len(toks) - len(p) + 1):
        if W[i]['s'] >= after - 1e-6 and toks[i:i + len(p)] == p:
            return W[i + len(p) - 1]['e'] if end else W[i]['s']
    sys.exit(f'face_slots: phrase not found after {after:.2f}s: "{phrase}"')


def dur(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of',
                                          'csv=p=0', path]).decode())


slots, cursor, problems = [], 0.0, []
for s in P['slots']:
    st = s['start'] if 'start' in s else find(s['from'], cursor)
    en = s['end'] if 'end' in s else find(s['to'], st, end=True)
    st, en = st + s.get('lead', 0.0), en - s.get('trail', 0.0)
    if en <= st: sys.exit(f'face_slots: slot {s["name"]} ends before it starts')
    slots.append({'name': s['name'], 'start': round(st, 3), 'end': round(en, 3), 'layout': s.get('layout', 'full'),
                  'clip_in': round(max(0.0, st - H), 3), 'clip_out': round(en + H, 3)})
    cursor = en

on = sum(x['end'] - x['start'] for x in slots)
for i, x in enumerate(slots):
    d = x['end'] - x['start']
    if d > 7: sys.exit(f'face_slots: {x["name"]} is {d:.1f}s on screen; over 7 s the face drifts. Split it.')
    if d > 5 or d < 2: problems.append(f'{x["name"]}: {d:.1f}s on screen (aim 2-5 s)')
    if i and x['start'] - slots[i - 1]['end'] < 3:
        problems.append(f'{x["name"]}: only {x["start"] - slots[i - 1]["end"]:.1f}s of animation since {slots[i - 1]["name"]}')
if slots and slots[0]['start'] > 3: problems.append(f'first face at {slots[0]["start"]:.1f}s (aim: speaking by 3 s)')
share = on / vo_end
if not 0.2 <= share <= 0.3: problems.append(f'face share {share:.0%} of the VO (aim 20-30 %)')

os.makedirs(a.slices, exist_ok=True)
have_vo = os.path.exists(a.vo)
total = dur(a.vo) if have_vo else None
for x in slots:
    if total: x['clip_out'] = round(min(x['clip_out'], total), 3)
    x['audio'] = os.path.join(a.slices, f'{x["name"]}.wav')
    if have_vo:  # mono 16-bit 44.1 kHz slice of the clean stem; what the face model lip-syncs to
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(x['clip_in']), '-to', str(x['clip_out']), '-i', a.vo,
                        '-ac', '1', '-ar', '44100', '-c:a', 'pcm_s16le', x['audio']], check=True)

json.dump({'fps': P.get('fps', 30), 'handles': H, 'vo_seconds': round(vo_end, 3), 'face_share': round(share, 3),
           'slots': slots}, open(a.out, 'w'), indent=1)
for x in slots:
    print(f'{x["name"]:10s} {x["start"]:7.2f}-{x["end"]:7.2f}  on {x["end"] - x["start"]:4.1f}s  '
          f'clip {x["clip_out"] - x["clip_in"]:4.1f}s  {x["layout"]}')
print(f'face on screen {on:.1f}s of {vo_end:.1f}s ({share:.0%}); slices {"written" if have_vo else "SKIPPED (no " + a.vo + ")"}')
for p in problems: print('  check:', p)
if problems and a.strict: sys.exit(1)
