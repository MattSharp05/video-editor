# AI voiceover (free, local)

When the user doesn't record the narration, generate it locally with open models, at no cost per
line. Prefer the user's recording whenever they will make one; their profile says which films get
which voice. Evidence and timings: `lab/voice-picker/README.md`; a full run:
`projects/grand-canyon-01/vo/`.

## Models (tested 2026-11-05/06, CPU only)

| Model | Kind | Licence | Verdict |
|---|---|---|---|
| Qwen3-TTS 12Hz 1.7B `Base` | clone from a reference clip + its transcript | Apache 2.0 | the pick: "fine for a clone" |
| Qwen3-TTS 1.7B `VoiceDesign` | a new voice from a written description | Apache 2.0 | picked for American male and female |
| Qwen3-TTS 1.7B `CustomVoice` | preset speakers (Aiden, Ryan) + an instruction | Apache 2.0 | not picked |
| Chatterbox / Turbo (Resemble AI) | clone; also a built-in voice | MIT | not picked; output carries an inaudible watermark |
| Kokoro-82M | stock voices | Apache 2.0 | not picked; seconds per line |

Setup (one venv per model family; `uv` with the CPU torch index):
`uv venv -p 3.12 .venv-qw && VIRTUAL_ENV=.venv-qw uv pip install qwen-tts soundfile --extra-index-url https://download.pytorch.org/whl/cpu --index-strategy unsafe-best-match`.
Chatterbox and Kokoro install lines and their gotchas are in the lab README.

- Cost: 20–30 s per line for any Qwen 1.7B model with the CPU to itself (4 cores); sharing the CPU
  between models made it ten times slower. Run one model at a time.
- Disk is tight in the cloud container: drop each Qwen model from the Hugging Face cache after use
  (`lab/voice-picker/run_r2.sh` has the `drop` helper).

## The voice can't drift: design once, clone every line

Generating each line from a description (VoiceDesign) or a preset changes the voice between lines;
the user heard it ("the explainers sound different"). So:
1. Get one approved reference clip: a clip the user picked, or one VoiceDesign render of a
   neutral sentence, or ~12 s of the user's own take (from a different part of the take than the
   test lines, so the clone can't copy that delivery).
2. Build the clone prompt once with the `Base` model
   (`create_voice_clone_prompt(ref_audio, ref_text)`) and clone every line from it with a fixed
   seed (`projects/grand-canyon-01/vo/gen_vo.py`). Re-generate a bad line alone with another seed.

## Assemble, time, check

1. Trim each line's silence (RMS envelope, threshold about -42 dB, small pre-roll and tail) and
   join with pauses: about 0.25–0.55 s, longer at the turns of the argument; keep each line's
   start in `line_starts.json` (`projects/grand-canyon-01/vo/assemble.py`).
2. Word timings with faster-whisper (`small.en`, int8, `word_timestamps=True`, audio at 16 kHz)
   into `words.json`; the template's `align.py` does it for a recording.
3. Check the transcript against the script word for word. A generated line that drops or changes
   words gets regenerated. ASR also mishears (Smart Add → "smart at", travel → "treble"): when
   only the transcript is off, fix `words.json` with a kept script; when the audio might be,
   list the line for the user to listen to.
4. Measure the pace (AI voices ran 2.8 words/s in full sentences, slower than in short test
   lines) and update the runtime estimate before timing the picture.

`words.json` is the timing spine: [beats.json](remotion-pipeline.md#timing-spine-beatsjson).

## Running a voice picker

When the user hasn't picked a voice for this kind of film, run a picker like
`lab/voice-picker/` (`build_r2.py`, `voices_r2.json`, `picker2.src.html`): the same two lines (the
hook and an explainer line) in each candidate, trimmed and matched to -16 LUFS, grouped by category
(their clone, other voices they asked for), one pick per category, notes saved per category. The
first round can be blind with their real take as a control. Hide pace until the reveal; it gives
the real take away. Record picks in `lab/voice-picker/README.md` and the profile.

## Rights

Qwen3-TTS and Kokoro are Apache 2.0; Chatterbox MIT (watermarked). A clone of the user's voice is
for the user's own videos only. Label AI narration in the delivery notes.
