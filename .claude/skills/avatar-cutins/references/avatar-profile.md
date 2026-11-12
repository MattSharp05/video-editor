# Avatar profile

**What it is.** One avatar per account, stored in Broadcast's Avatar studio. It is exported to a video session as
`avatar/avatar.json` plus `avatar/refs/`.
- **Identity is data:** the card is the spec.
- **The reference images are build outputs of the card.** If an image and the card disagree, regenerate the image from
  the card; never patch the card to match an image.
- **Versioning:** bump `version` whenever the look or voice changes. Every video's manifest records the version it used.

Ideas borrowed from:
- HeyGen's `heygen-avatar`: one `AVATAR-<NAME>.md` per identity, and asset IDs resolved fresh at run time.
- 0xAnni's `ugc-creator`: an identity card as JSON, exact skin-tone hex values and pinned asymmetry, and a face pack
  generated from one validated portrait.

## Fields (`avatar.json`)

```json
{
  "id": "maya", "version": 1, "account": "@example", "disclosure": "AI creator",
  "identity": {
    "name": "Maya", "age_range": "late 20s", "from": "Cape Town",
    "backstory": "5-10 lines: who she is, why she explains this topic",
    "knows_about": ["travel planning", "maps"], "cares_about": ["saving people time"]
  },
  "personality": {
    "tone": "warm, dry humour", "energy": "calm", "signature_phrases": ["Here's the thing."],
    "never_says": ["guys", "literally"], "reading_level": "grade 3", "words_per_second": 2.8,
    "opens_with": "a curiosity hook to camera", "closes_with": "one-line takeaway, no hard sell"
  },
  "look": {
    "style": "photoreal | stylised",
    "skin_tone_hex": "#C68E6B", "hair": "...", "eyes": "...",
    "asymmetry": "left eyebrow slightly higher", "marks": "small mole right cheekbone",
    "master_ref": "refs/master.png",
    "face_pack": ["refs/01_frontal.png", "refs/02_three_quarter_l.png", "refs/03_three_quarter_r.png", "refs/04_smile.png"],
    "wardrobe": [{"id": "w1", "desc": "olive overshirt, white tee"}],
    "settings": [{"id": "s1", "desc": "bright kitchen, soft window light from left", "ref": "refs/s1.png"}],
    "framing": "head and shoulders, eyes at 38% from top, face centred, headroom 8%"
  },
  "voice": {
    "provider": "qwen | elevenlabs", "model": "Qwen3-TTS-12Hz-1.7B-Base",
    "ref_audio": "refs/voice_ref.wav", "ref_text": "...", "seed": 2,
    "voice_id": null, "samples": ["refs/voice_sample_1.wav"]
  },
  "rules": {
    "do": ["explain, react, present"],
    "dont": ["claim to be human", "claim to have used a product", "imitate a real person", "medical/financial advice"],
    "platform_flags": {"instagram": {"is_ai_generated": true}, "tiktok": {"is_aigc": true}}
  },
  "generation": {
    "face_model": "fal-kling-avatar-std", "fallback_model": "fal-omnihuman-1.5",
    "prompt": null, "seed": 7, "resolution": "720p",
    "cost_cap_per_video_usd": 4.0
  },
  "notes": "what worked: face share, layout, model; filled in after videos run"
}
```

## Master reference checklist
These rules come from the sync. labs `talking-photo` input rules and HeyGen's frame check. Run the check before any
paid run.

- **The face:** exactly one, eyes to camera, mouth closed, a neutral or soft expression.
- **Framing:** head and shoulders in 9:16, matching `framing`. Face models keep the photo's framing, so a wrong crop
  can't be fixed later.
- **The picture:** even light, no hands near the face, no hair over the mouth.
- **The background:** a plain one, or the chosen setting. For the `cutout` layout, use a flat, even background so it can
  be keyed.
- **Size:** at least 1080 px wide. No text, logos or watermarks.

## Making a new avatar (the Avatar studio flow)
1. Claude drafts 3 persona concepts from the account's brief. Matthew picks one and edits it.
2. Generate about 8 master-portrait candidates with an image model (cents each). Matthew picks one, and it must pass the
   checklist.
3. Generate the face pack from that master: 4–6 shots (angles and expressions) plus one per wardrobe and setting.
   Approve or reject each one.
4. Voice: three voices designed from the persona, a blind pick, then lock the reference clip and seed (or a voice ID).
5. Screen test: one 8–10 s clip on the default model and one on the fallback model, from the same audio. Approve the
   result, and the profile is saved as version 1.
