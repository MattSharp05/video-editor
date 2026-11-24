# Studio sound: picks, palette, events, mix

How this studio (video-editor) chooses, places and mixes sound for every film. Claude can't hear:
**the user's ear picks, Claude places.** The user's standing defaults are in
`~/.video-edit/profile.md` (Sound); evidence in `lab/PRINCIPLES.md` (8, 9), `lab/TASTE.md` and
`lab/sound-picker/`.

## 1. A Sound Picker round (when the palette lacks a category, or the user asks)

The lab's picker is the template: `lab/sound-picker/build.py` + `picker.html`.
1. One row per recurring moment (tap, select/found, appear, land, lift, confirm, notify, toggle,
   typing, error, swipe, send, small move, camera move, background bed, music), each with the
   moment it is for in one line.
2. Four options per row, **softest first by measurement** (brightness / 1000 + 3 × ring), from
   CC0 sources only (uisfx packs, `library/sfx/`; music with its licence shown).
3. Level-match so options compare by character, not loudness: effects peak-normalised to -6 dBFS,
   beds 10 s at -26 LUFS, music 22 s from 20 s in at -18 LUFS.
4. Show each option's measured words (dark / warm / bright, dry / rings, soft / crisp attack).
   Offer "silence" and "none fits" per row, and a note field. Picks save to the page's database
   (`picks/<category>`).
5. Pull the picks (`ArtifactData` list → a folder of JSON), then
   `python3 scripts/palette.py build PICKS_DIR`. Copy the user's notes verbatim into `lab/TASTE.md`.

## 2. The palette (`scripts/palette.py`, data in `lab/sound-picker/sound-palette.json`)

Three layers, used in this order:
- **References:** category → the file picked. A reference, not a sound to reuse ("not the same
  sounds each video, but this sort of vibe"): each film picks fresh sounds closest to it; the
  reference itself is the fallback when nothing new is close.
- **Profile:** the measured character of all picks (median ~680 Hz brightness, ring ~0.10 s,
  attack ~44 ms, length ~0.16 s: dark-warm, dry, short). Rank new candidates:
  `python3 scripts/palette.py rank CATEGORY FILE...` (distance to 0.7 × the category's reference +
  0.3 × the profile; passed-over files pushed down, never banned).
- **Silent / unfilled:** categories the user wants silent (swipe), or where nothing fit yet (send,
  camera move): leave those moments quiet until a new round fills them.
- `palette.py taste` prints `taste.py love` lines for picks that sit in the library index so the
  auto-pick ranks them first; uisfx picks are not in the index, so place them by path.

## 3. Events from the same beats as the picture

- Times come from the film's own numbers: `beats.json` (animated-video's timing spine) or an
  exported event list, never read off the picture. One-shot films have no cuts: ignore cut-sync
  warnings.
- Write a small events script per film: `(beat + offset, kind, gain, note)` rows, one sound per
  state of the visual language, mapped to files through the palette
  (`projects/trip-social-01/film-v2/sound/events.py` writes real-sfx's cue sheet with explicit
  files; `projects/grand-canyon-01/film/sound/mix.py` mixes directly with FFmpeg).
- Repeats of one kind rise in pitch item by item (found 1, 2, 3) or vary the file.
- Restraint: every sound has a visible cause; about 7 weighted events per 10 s in an app reel,
  2.7 per 10 s under a voice-led explainer (Grand Canyon 01: 21 cues in 77 s). Print the density.
- Where the library has no real sound (deep rumble, crumble, grit), a filtered noise layer
  (`anoisesrc` + filters) is acceptable in this studio; label it synthesized. Library gaps:
  `library/sfx/CREDITS.md`.

## 4. The mix

- **Voice up front:** a static gain to bring it forward (+10 to +14 dB on the two films), no
  per-line levelling.
- **Music under it:** clearly audible: about 10-12 dB under the voice while it speaks, rising ~6 dB in the pauses,
  with a gentle sidechain duck (`sidechaincompress=threshold=0.06:ratio=3:attack=60:release=700`). Set the music gain
  from measurement, not from a fixed number: tracks differ (Floating Cities' opening is -20.5 LUFS and needed +12 dB).
  Write voice and ducked-music stems and measure the gap (projects/moon-tides-01/film/sound/mix.py `stem` +
  measure.py). Matthew, 2026-11-06: the old setting (-15 dB, ratio 8, "17 dB under") measured 46 dB under speech on
  Moon tides v1 and he heard no music at all. Fade in 1.5 s, out 2.5 s.
- **Effects** around -16 to -30 dB, low-passed (1.5–3 kHz) so they sit soft; keep them off key
  spoken words.
- **Master:** `loudnorm=I=-14:TP=-1.5`. Measure the delivered MP4, not the WAV: AAC raises true
  peaks (Grand Canyon 01's first export read -1.2 dBTP; remastered lower, it read -1.8). A WAV mastered
  at TP -1.5 read -1.49 dBTP after AAC and failed `deliver.py`; mastered at TP -2 it read -1.95 (2026-11-24).
- Mux the mix onto the silent picture with `-c:v copy`.
- Say what was measured and list the moments the user should listen to.

The two options below are off by default and measured on our own signals (2026-11-24, FFmpeg 6.1.1;
the Montage comparison in `lab/montage-vs-ours.md` proposed them). Use one only when a measurement
shows the problem it fixes, and keep it only when it moves that measurement.

### Optional: music presence dip

A static cut in the music around 3 kHz, where the voice's consonants live, so the words read through a
busy bed (strings, pads, a melody in the voice's range) without pulling the whole track down. It stays on
in the pauses too. On the music, before the duck:

```text
equalizer=f=3000:t=q:w=0.7:g=-4
```

- Response on tones: -4.0 dB at 3 kHz, -3.4 at 4 kHz, -2.9 at 2 kHz, -1.9 at 1.5 kHz, -1.8 at 6 kHz, -0.9 at 1 kHz,
  -1.0 at 8 kHz, -0.2 at 500 Hz. Gentler, `w=1:g=-3`: -3.0 at 3 kHz, -1.7 at 2 kHz, -0.4 at 1 kHz.
- On stems (Matthew's Trip take 1 at +12 dB, under two music samples with the duck above): the voice's lead
  over the music in 1–4 kHz while he speaks grew from 8.3 to 10.0 dB (Kevin MacLeod, "Half Mystery") and from
  8.8 to 11.0 dB (Scott Buckley, "Computations"). The full-band gap moved only 0.1–0.3 dB and the music read
  0.3 LU quieter, so it stays "clearly audible".
- Measure: band-pass voice and ducked-music stems to 1–4 kHz
  (`highpass=f=1000:p=2,highpass=f=1000:p=2,lowpass=f=4000:p=2,lowpass=f=4000:p=2`) and compare their RMS
  over the speech spans from `words.json`, with and without the dip. Matthew's ear decides whether the music
  now sounds dull.

### Optional: noisy-recording pre-chain

Process a voice as little as it needs ([video-edit technical](../../video-edit/references/technical.md#voice-loudness-and-mixing)).
Matthew's take 1 needs neither stage: no mains line (60 Hz stands 6 dB above its neighbours), and a denoiser
on a clean take still removes his room tone and breaths. Never add a compressor, expander or de-esser here:
a full voice chain flattens the loudness range he hears as his performance. Listen to the result beside the
raw at matched loudness.

**1. Hum: measure the line, then notch exactly there.** Save as `humfind.py`, run `python3 humfind.py VOICE.wav`
(numpy; 20 s or more of audio):

```python
import subprocess, sys, numpy as np
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-ac', '1', '-ar', '4000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32)
n = 1 << int(np.ceil(np.log2(len(x) * 4))); s = np.abs(np.fft.rfft(x * np.hanning(len(x)), n)); f = np.fft.rfftfreq(n, 1 / 4000)
def line(fc, tol):  # (freq, dB above its +-3 Hz neighbourhood): mains hum is a narrow line, a voice is broad
    j = np.argmax(np.where(np.abs(f - fc) < tol, s, 0)); near = (np.abs(f - f[j]) < 3) & (np.abs(f - f[j]) > 0.5)
    return f[j], 20 * np.log10(s[j] / np.median(s[near]))
for mains in (50, 60):
    f0, p1 = line(mains, 0.5); p3 = line(3 * f0, 0.3)[1]
    print(f'{mains} Hz mains: line at {f0:.2f} Hz, {p1:.0f} dB; 3rd harmonic {p3:.0f} dB', '-> hum' if p1 >= 20 and p3 >= 10 else '-> none')
    if p1 >= 20 and p3 >= 10: print('  ' + ','.join(f'bandreject=f={f0 * k:.2f}:t=h:w=4' for k in range(1, 9)))
```

It prints the notch chain only for a narrow line within 0.5 Hz of 50 or 60 Hz that has a third harmonic. It
found the 60.00, 60.30 and 49.90 Hz hums mixed into test copies of take 1, and reported none on the raw take
or on the Grand Canyon AI voice. The chain it prints is eight 4 Hz-wide notches at f0 × 1…8, e.g.
`bandreject=f=60.30:t=h:w=4,bandreject=f=120.61:t=h:w=4,…`.

- At the hum's own frequency the notches removed six steady harmonics completely (-44.5 dBFS after the
  high-pass, to below -250 dBFS); between harmonics (90, 150, 210 Hz) they cost at most 0.06 dB, and nothing
  from 1 kHz up.
- Mains drifts, so a notch at a guessed frequency fails: fixed at 60.00 Hz, they took 17.4 dB off hum at
  60.1 Hz, 8.9 dB at 60.3 and 5.8 dB at 60.5. 8 Hz-wide notches reached 14.1 dB at 60.3 but took 0.19 dB
  off every frequency between harmonics.
- Not `equalizer` with a deep cut as a notch: eight of `g=-40:w=30` took 5.6 dB off 150 Hz and 0.5 off 1 kHz.

**2. Hiss: a light FFT denoiser after the notches.**

```text
highpass=f=70,<notches if any>,afftdn=nr=12:nf=-40:tn=1
```

On take 1 with pink hiss added (5.8 dB over the take's own room tone in the pauses, above 1 kHz), this
lowered the hiss in the pauses 6.3 dB, back to about the clean take's room tone, and moved the words' 1–4 kHz
level 0.11 dB; loudness range 4.8 → 4.7 LU. Stronger, `afftdn=nr=20:nf=-30:tn=1`: 11.6 dB off the hiss but
0.58 dB off the words, and on the clean take it removed 6.7 dB of his room tone. `anlmdn` (s 0.002–0.005)
removed at most 0.2 dB of this hiss.

**3. A roomy (reverberant) take:** FFmpeg has no dereverb filter and none was measured here. Ask for a
retake closer to the mic before processing.

## Rights

Published films use only CC0 (uisfx, `library/sfx/`), the user's own files, synthesized sound, and
credited CC BY music (Kevin MacLeod tracks: credit line in the post caption). `sfx-01`–`sfx-28` from
video-edit are drafts only.
