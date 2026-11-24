# Key-frame board: one still per beat with its line underneath. Schema of board.json: references/versions.md.
# usage: python3 board.py board.json [out.png]          cards from board.json (default out: board.png beside it)
#        python3 board.py board.json --secs             print each card's time, for ./snap.sh <stilldir> $(...)
#        python3 board.py init board.json <stilldir> "sec|line" ...   write a board.json from the old arguments
#        python3 board.py <stilldir> out.png "sec|line" "sec|line" ...   (as before; stills from snap.sh: <stilldir>/t<sec>.png)
import sys, os, json, textwrap
from PIL import Image, ImageDraw, ImageFont

STATUSES = ('planned', 'rendering', 'done')
STATUS_FILL = {'planned': (150, 150, 150), 'rendering': (230, 170, 60), 'done': (110, 200, 120)}


def load_board(path):
    with open(path) as f:
        b = json.load(f)
    root = os.path.dirname(os.path.abspath(path))
    stilldir = b.get('stills')
    ids = set()
    for i, c in enumerate(b.get('cards', [])):
        if 'id' not in c or 'text' not in c:
            sys.exit(f'board.py: card {i + 1} needs an id and a text')
        if c['id'] in ids:
            sys.exit(f'board.py: card id {c["id"]} appears twice')
        ids.add(c['id'])
        if c.get('status', 'planned') not in STATUSES:
            sys.exit(f'board.py: card {c["id"]}: status must be one of {", ".join(STATUSES)}')
        still = c.get('still')
        if not still and stilldir and 'at' in c:
            still = os.path.join(stilldir, f't{c["at"]}.png')
        c['_still'] = os.path.join(root, still) if still else None
    if not b.get('cards'):
        sys.exit('board.py: board.json has no cards')
    return b


def draw(cards, out):
    """cards: dicts with _still (path or None), at (seconds or None), text, and optionally id, seconds, status."""
    first = next((c['_still'] for c in cards if c['_still'] and os.path.exists(c['_still'])), None)
    w0, h0 = Image.open(first).size if first else (1080, 1920)
    W, cols, TH = 360, 5, 120
    H = round(W * h0 / w0)
    rows = (len(cards) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * W, rows * (H + TH)), (18, 18, 20))
    try: font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 19)
    except Exception: font = ImageFont.load_default()
    for i, c in enumerate(cards):
        x, y = (i % cols) * W, (i // cols) * (H + TH)
        d = ImageDraw.Draw(sheet)
        if c['_still'] and os.path.exists(c['_still']):
            sheet.paste(Image.open(c['_still']).convert('RGB').resize((W, H)), (x, y))
        else:
            d.rectangle((x + 1, y + 1, x + W - 2, y + H - 2), fill=(34, 34, 38), outline=(70, 70, 76))
            d.text((x + 10, y + 10), 'no still yet', fill=(120, 120, 120), font=font)
        head = f'{i + 1}' if 'id' not in c else f'{i + 1} {c["id"]}'
        if c.get('at') is not None:
            head += f'  ·  {float(c["at"]):.1f}s'
        if c.get('seconds') is not None:
            head += f'  ·  {float(c["seconds"]):g} s long'
        d.text((x + 10, y + H + 8), head, fill=(150, 150, 150), font=font)
        if c.get('status'):
            tw = d.textlength(c['status'], font=font)
            d.text((x + W - 10 - tw, y + H + 8), c['status'], fill=STATUS_FILL[c['status']], font=font)
        for j, l in enumerate(textwrap.wrap(c['text'], 34)[:4]):
            d.text((x + 10, y + H + 34 + j * 22), l, fill=(230, 230, 230), font=font)
    sheet.save(out)


def main(argv):
    if len(argv) >= 2 and argv[1] == 'init':
        path, stilldir, items = argv[2], argv[3], [a.split('|', 1) for a in argv[4:]]
        root = os.path.dirname(os.path.abspath(path))
        cards = [{'id': f'c{i + 1}', 'text': line, 'at': json.loads(sec), 'seconds': None,
                  'still': os.path.relpath(os.path.join(stilldir, f't{sec}.png'), root),
                  'status': 'done' if os.path.exists(os.path.join(stilldir, f't{sec}.png')) else 'planned',
                  'shot': None} for i, (sec, line) in enumerate(items)]
        with open(path, 'w') as f:
            json.dump({'schema': 1, 'title': None, 'approved': None, 'cards': cards}, f, indent=2, ensure_ascii=False)
            f.write('\n')
        print(path)
    elif len(argv) >= 2 and argv[1].endswith('.json'):
        b = load_board(argv[1])
        if len(argv) > 2 and argv[2] == '--secs':
            print(' '.join(f'{c["at"]}' for c in b['cards'] if c.get('at') is not None))
            return
        out = argv[2] if len(argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(argv[1])), 'board.png')
        draw(b['cards'], out)
        print(out)
    else:
        # the original call: board.py <stilldir> out.png "sec|line" ...  (same image as before)
        d0, items = argv[1], [a.split('|', 1) for a in argv[3:]]
        draw([{'_still': f'{d0}/t{sec}.png', 'at': sec, 'text': line} for sec, line in items], argv[2])


if __name__ == '__main__':
    main(sys.argv)
