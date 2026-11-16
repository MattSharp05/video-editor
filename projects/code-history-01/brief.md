# Code history 01: brief
- How programmers physically wrote code, cables to AI. ~60 s, 1080x1920, 30 fps, Reels. Goal: reach.
- Style: photoreal macro 3D like refs/1.png and refs/2.webp (dark stage, warm rim, glass/metal, word-lit captions).
- Palette (sampled from refs): ground #100f0e–#27211c, slate #212327, accent = the thread only, amber #ff8a10 core / #a07020 deep / #c0a050 highlight.
- One shot, no cuts; the amber thread is the single point of focus and transforms through every era.
- Production log (Claude Docs): https://claude.ai/artifact/ViTDjGSXTLbvE9ES7i6hCu
- Open: voice, music, render route (three.js vs Blender), the hand asset.

## Final picks (2026-11-16)
- Voice: Kokoro am_puck. Music: "Signal to Noise" by Scott Buckley, from 0 s, gain +20.7 dB (`sound/mix.sh kokoro-am_puck sb-signal-to-noise 0 20.7 v2_puck_sb-signal-to-noise`).
- Picture: v2 (arm, terminal and ending fixes). Final file: `renders/code-history-01_final.mp4` (39 MB, -14 LUFS, -1.5 dBTP).
- Caption credit: "Signal to Noise" by Scott Buckley – released under CC-BY 4.0. www.scottbuckley.com.au

## Instagram caption (draft, 2026-11-16)
How did people write code before screens?

In 1946, programming ENIAC meant plugging cables by hand. Then came switches, punched cards, terminals, editors that finished your words, and now AI that writes the code while programmers check it.

80 years of new tools. The job never changed: tell the machine exactly what you mean.

What did you first write code on?

#programming #softwareengineering #computerhistory #coding #ai

Music: "Signal to Noise" by Scott Buckley – released under CC-BY 4.0. www.scottbuckley.com.au
Voice: AI (Kokoro). Visuals: 3D illustrations.

## Guidance read (reconstructed from the session record at the 2026-11-16 reflection)
- Script: video-script SKILL.md, references/explainers.md. Voice and sound: ai-voiceover.md, studio-sound.md.
- Build: animated-video SKILL.md, look-pass.md, remotion-pipeline.md, template three-canvas.tsx and lib.ts.
- Not read: direct.md, motion-principles.md, three.md, characters.md, review.md, handoffs.md, styles/README.md.

## Outstanding corrections
- The film joins its sets with 0.22 s dissolves (six scene changes). The house rule is one shot with carriers
  (motion-principles.md, profile); replace each with a grow-into transition. Not yet scheduled.
