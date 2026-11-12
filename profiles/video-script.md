# Video-script profile

- Creator: Matthew. Records his own voiceover.
- Platform: Instagram Reels (9:16) first; others later. Confirm per video.
- Default goal: reach, unless the brief says otherwise.
- Pace: measured on trip-social-01 take 1: 89 words in 32.7 s, about 2.7 words a second including
  pauses (about 3.1 while speaking). Draft at 2.7.
- Voice: unknown yet. Note his rewrites of drafted lines here as they happen.
- Video library and findings: none yet. Once videos are posted, keep one entry per video in
  `library/videos/` and lessons in `library/findings.md` (video-script's library format).
- Backlog: `library/backlog.md`.

## Voiceover (pipeline: `.claude/skills/animated-video/references/ai-voiceover.md`)
- Trip videos: Matthew records his own VO (South African accent).
- Other videos may use the free AI voice (Qwen3-TTS); ask per video. His Voice Picker picks (2026-11-06,
  `lab/voice-picker/README.md`): clone = `qwen-clone-s2` (his voice), American male = `design-m2` (low,
  understated, 30s), American female = `design-f2` (calm, low, 30s).
- Grand Canyon 01 used the American male, cloned for every line from the hook clip he liked
  (`projects/grand-canyon-01/vo/ref_design-m2_hook.wav`): never design per line (it drifts).
- design-m2 ran about 2.8 words/s in full sentences (77 s VO): draft scripts for it at that pace.
- Reading level (Matthew, 2026-11-06, moon tides): keep explainer scripts at about a 3rd-grade reading level: short
  sentences (~10 words), plain words. Measure with `projects/moon-tides-01/readability.py` (Flesch-Kincaid).
- Hooks (Matthew, 2026-11-06): he likes the curiosity format "Most people think... but actually...".

## Avatar accounts (2026-11-12; `.claude/skills/avatar-cutins/`)
- When the account has an avatar profile, mark each script line FACE or ANIM (a column in the script table). FACE: the
  hook (spoken to camera by 3 s), turns in the argument, a reaction to the reveal, the call to action; under ~12 words;
  in the avatar's speaking style. Explanations are ANIM. Aim for about 20-30 % of the runtime as face.
- The avatar explains, reacts and presents; it never claims to be human or to have used a product.
