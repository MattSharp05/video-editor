# Sound events for clip 01 v2, from the same beats.json that times the picture.
# Sounds: Matthew's Sound Picker references (lab/sound-picker/sound-palette.json); silence where he chose silence or
# nothing fit (camera moves, swipes, sends); no zipper until a real recording exists.
import json, math, os
HERE = os.path.dirname(os.path.abspath(__file__))
B = json.load(open(os.path.join(HERE, '..', 'src', 'beats.json')))
U = '/home/user/video-editor/.claude/skills/real-sfx/vendor/node_modules/uisfx/sounds'
L = '/home/user/video-editor/library/sfx'
SND = {'appear': f'{U}/minimal/expand.mp3', 'select': f'{U}/zen/select.mp3', 'land': f'{U}/zen/drop.mp3',
       'lift': f'{U}/studio/drag-start.mp3', 'tap': f'{U}/minimal/press.mp3', 'confirm': f'{U}/zen/success.mp3',
       'notify': f'{U}/zen/notification.mp3', 'move': f'{L}/cstack-cc0/whoosh-fast.flac'}
f = lambda frames: frames / 60
E = [
 (B['l1'], 'appear', .45, 0, 'the saved TikToks appear'),
 (3.45, 'move', .3, 0, 'they slide into the folder'),
 (B['none'], 'land', .5, 0, 'the folder shuts on "none"'),
 (B['l2'], 'appear', .4, 0, 'the folder opens'),
 (B['l3'], 'tap', .45, 0, 'share pressed'),
 (B['l3'] + f(50), 'select', .45, 0, 'link copied'),
 (B['open_trip'] - f(6), 'move', .35, 0, 'the link flies down'),
 (B['open_trip'] + f(4), 'appear', .4, 0, 'the app assembles'),
 (B['asks'], 'notify', .45, 0, 'the banner asks'),
 (B['add_tiktok'] + f(20), 'tap', .55, 0, 'banner tapped'),
] + [(B['pulls'] + f(22 * i), 'select', .55, i, f'found: place {i + 1}') for i in range(3)] \
  + [(B['pulls'] + f(50 + 22 * i), 'land', .55, i, f'placed: pin {i + 1}') for i in range(3)] + [
 (B['l5'], 'lift', .45, 0, 'Golden Tiki lifts'),
 (B['smart_add'] + f(18), 'tap', .55, 0, 'Smart Add pressed'),
 (B['picks'], 'move', .4, 0, 'row flies to Sun 15'),
 (B['picks'] + f(50), 'confirm', .5, 0, 'confirmation'),
 (B['l6'] + f(20), 'tap', .5, 0, 'Plan my bucket list pressed'),
 (B['at_once'], 'move', .4, 0, 'they fly to their days at once'),
 (B['at_once'] + f(34), 'land', .45, 0, 'the days light up'),
 (B['l7'], 'lift', .45, 0, 'the suitcase lifts out'),
 (B['l7'] + f(40 + 24), 'land', .5, 0, 'the lid shuts'),
 (B['l7'] + f(40 + 84), 'tap', .45, 0, 'the handle pops up'),
]
cues = []
for t, kind, g, pitch, note in E:
    c = {'t': round(t, 3), 'label': kind, 'file': SND[kind], 'gain_db': round(20 * math.log10(g), 1), 'anchor': 'start',
         'role': 'whoosh' if kind == 'move' else 'ui', 'notes': note}
    if pitch: c['pitch'] = pitch
    cues.append(c)
W = os.path.join(HERE, 'work'); os.makedirs(W, exist_ok=True)
sheet = {'video': os.path.join(HERE, '..', 'out', 'picture.mp4'), 'keep_audio': 'yes',
         'base_audio': [{'file': os.path.join(W, 'voice.wav'), 'gain_db': 0}, {'file': os.path.join(W, 'music.wav')}], 'cues': cues}
json.dump(sheet, open(os.path.join(W, 'cues.json'), 'w'), indent=1)
json.dump([{'t': c['t'], 'type': c['label'], 'notes': c['notes']} for c in cues], open(os.path.join(HERE, 'events.json'), 'w'), indent=1)
print(len(cues), 'cues;', round(len(cues) / B['total'] * 10, 1), 'per 10 s')
