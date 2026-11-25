# beats.json from the voiceover's word timings: the one source of timing for picture, captions and sound.
# usage: python3 beats.py   (from film/; reads src/words.json and ../vo/line_starts.json) -> src/beats.json
# A phrase the VO no longer says stops the script by name.
import json, re, sys
W = json.load(open('src/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
toks = [norm(w['w']) for w in W]


def at(phrase, after=0.0, end=False):
    p = [norm(x) for x in phrase.split()]
    for i in range(len(toks) - len(p) + 1):
        if W[i]['s'] >= after - 0.05 and toks[i:i + len(p)] == p:
            return round(W[i + len(p) - 1]['e'] if end else W[i]['s'], 3)
    sys.exit(f'not found: "{phrase}" after {after}s')


L = json.load(open('../vo/line_starts.json'))
B = {f'L{i + 1}': round(s, 3) for i, s in enumerate(L)}   # L1..L11: start of each script line
B.update({
    # s1 square cut
    'squares': at('squares'),
    # s2 the slanted cut
    'straight': at('straight cut'), 'perfect': at('perfect'), 'hexagon': at('hexagon'),
    # s3 the count
    **{f'n{k + 1}': at(w, after=B['L3']) for k, w in enumerate(['one', 'two', 'three', 'four', 'five', 'six'])},
    # s4 the question and the guess pause
    'knife_q': at('knife'), 'pause': at('pause'), 'guess_end': at('guess', end=True),
    # s5 corner to corner
    'corner1': at('corner', after=B['L5']), 'farthest': at('farthest'), 'from_it': at('from it', end=True),
    # s6 the knife
    'knife': at('knife', after=B['L6']), 'across': at('across'), 'middle6': at('middle', after=B['L6']),
    # s7 edge middles
    'crosses': at('crosses'), 'six_edges': at('six edges', after=B['L7']), 'edges_end': at('edges', after=B['L7'], end=True),
    # s8 equal sides
    'same': at('same length'),
    # s9 never more than six
    'six9': at('six', after=B['L9']), 'most': at('most'), 'ever': at('ever'),
    # s10 six faces
    'six_faces': at('six faces'), 'each_face': at('each face'), 'once': at('once'),
    # s11 cheese
    'cheese': at('cheese'),
    'end': round(W[-1]['e'], 3),
})
B['total'] = round(B['end'] + 1.5, 3)
json.dump(B, open('src/beats.json', 'w'), indent=1)
for k, v in B.items(): print(f'{k:12s} {v:7.2f}')
