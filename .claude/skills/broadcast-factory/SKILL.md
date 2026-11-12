---
name: broadcast-factory
description: >-
  Run one step of a Broadcast Content Factory video: read the brief from Broadcast, do only that step
  (idea brief, script, style frame, stills, avatar-clip quote, or render) with the existing skills, post the
  result back as a checkpoint, and stop. Use when a prompt or a <routine-fire-payload> says "Broadcast Content
  Factory step" or carries BROADCAST_URL / BROADCAST_TOKEN / BROADCAST_VIDEO_ID / STEP lines. Never posts or
  queues anything: the dashboard schedules.
---

# Broadcast Content Factory step

Broadcast's dashboard (MattSharp05/broadcast) starts one Claude session per step of a video. The
session is stateless: the brief and every earlier output live in Broadcast, and the files live in
`projects/<project_slug>/` on the branch `factory/<project_slug>`. The full contract is Broadcast's
`docs/factory-api.md`; this is the working summary.

## 1. Read the payload
The prompt (or the `<routine-fire-payload>` block) has these lines:

```
BROADCAST_URL=https://…          BROADCAST_TOKEN=bcf_live_…
BROADCAST_VIDEO_ID=<uuid>        STEP=idea|script|style|visuals|face_quote|render
NOTE=…                            (only on a redo: what Matthew wants changed)
```

Export them as environment variables. **Never print, log, commit or write the token to a file.**
It is scoped to this one video and expires in 24 hours. It is not the content API key, and you never
get a provider key (fal and others stay in Broadcast).

```bash
export BROADCAST_URL=… BROADCAST_TOKEN=… BROADCAST_VIDEO_ID=… STEP=…
api() { curl -sS -H "Authorization: Bearer $BROADCAST_TOKEN" -H 'Content-Type: application/json' "$@"; }
api "$BROADCAST_URL/api/factory/$BROADCAST_VIDEO_ID/brief" > /tmp/brief.json
```

The brief has `video` (idea, style, project_slug, account, voice, music, avatar profile and version,
face model, script), `step` (name, attempt, note), `outputs` of earlier steps, `reworks`, `face_clips`
(paid clips already made) and `budget`.

## 2. The project folder
- Branch `factory/<project_slug>`: `git fetch origin factory/<slug>` and check it out if it exists, else
  create it from `main`. Work in `projects/<slug>/`. Commit and push at the end of every step so the
  next session (a new container) finds the files.
- On the `idea` step create `projects/<slug>/brief.md` from the brief (facts, audience, hook, voice,
  music with its credit, avatar and version if any).
- Do **only** `STEP`. If `NOTE` is set, it is a redo: change what it asks and keep the rest.

## 3. The steps
Post progress on anything longer than a minute or two:
`api -X POST "$BROADCAST_URL/api/factory/$BROADCAST_VIDEO_ID/progress" -d '{"step":"render","progress":40,"message":"Rendering scene 2 of 5."}'`

| STEP | Do | Checkpoint `output` |
|---|---|---|
| `idea` | A short brief from the idea (the `video-script` skill's brief stage). | `{"title","brief","audience","hook"}` |
| `script` | `video-script`: the lines at grade-3 reading level. With an avatar, mark the cut-in lines (`avatar-cutins` FACE lines) with `slot` (`hook`, `mid`, `cta`…). | `{"version","hook","lines":[{"id","text","slot"?}]}` (bump `version` on a redo) |
| `style` | `animated-video`: one frame of the hook beat in the chosen style pack (`styles/<style>/README.md`). JPEG, 9:16. | `{"frames":[{"url","caption"}]}` |
| `visuals` | Key stills, one per scene, ids `s1`, `s2`… (Matthew can redo one scene). | `{"stills":[{"url","scene","caption"}]}` |
| `face_quote` | Avatar videos only. `avatar-cutins`: face slots, then `gen_face.py quote` with the brief's `face_model.key`. Nothing is paid here. | `{"model","slots":[{"slot","seconds"}],"quote":{"model","seconds","baseUsd","rerollUsd","totalUsd","free"}}` |
| `render` | VO, music, avatar clips, Remotion render, upload (below). | `{"upload","duration_s","face_share","imagery_credits":[…],"caption_options"?:[…]}` |

Images and the final video go through Broadcast's storage, not git:
```bash
r=$(api -X POST "$BROADCAST_URL/api/factory/$BROADCAST_VIDEO_ID/assets" -d '{"name":"s1.jpg","content_type":"image/jpeg"}')
curl -sS -X PUT -H 'Content-Type: image/jpeg' --data-binary @stills/s1.jpg "$(jq -r .upload_url <<<"$r")"
jq -r .path <<<"$r"     # storage:factory/… → use as "url" in the checkpoint
```
Types: `image/jpeg`, `image/png`, `audio/wav`, `audio/mpeg`, `video/mp4` (the render).

Then post the checkpoint and stop:
```bash
api -X POST "$BROADCAST_URL/api/factory/$BROADCAST_VIDEO_ID/checkpoint" -d @/tmp/checkpoint.json
# {"step":"$STEP","output":{…}}  →  {"status":"waiting"|"approved","next_step":…}
```
Approval starts the next step in a new session; never run it yourself.

## 4. The render
- **Voice:** the brief's `voice` (Qwen3-TTS; see `lab/voice-picker/README.md`). Designed voices drift
  line to line: make one reference clip and clone every line from it. Credit: `voice.credit`.
- **Music:** the brief's track, baked into the mix (Instagram's library can't be used through the API),
  ducked under speech. Keep its exact credit for the caption.
- **Avatar clips** (`video.use_avatar`): `avatar-cutins` with `FACE_VIA=broadcast` so every paid call
  goes through Broadcast's proxy (`/api/gen/face-jobs`), never with a local `FAL_KEY`:
  ```bash
  FACE_VIA=broadcast BROADCAST_URL=… BROADCAST_TOKEN=… BROADCAST_VIDEO_ID=… \
    python3 .claude/skills/avatar-cutins/scripts/gen_face.py run --avatar ../avatar/avatar.json \
      --model "$MODEL" --budget "$(jq .budget.remaining_usd /tmp/brief.json)"
  ```
  Write `avatar/avatar.json` from `video.avatar.profile` (its refs are URLs: download them to
  `avatar/refs/`). Keep the master ref under ~2 MB (a JPEG) so the request stays under Broadcast's 4 MB
  body limit.
- **Kept clips:** `face_clips` lists paid clips that already exist. On any rework that isn't an avatar
  slot (voice, music, script lines, a scene, the caption), **keep each avatar slot's audio exactly as it
  was** and reuse the kept clip (download `output_url`). The proxy returns the kept clip for a slot
  whatever key you send (`"reused":"slot_kept"`), so nothing is generated or charged again. Only a slot
  Matthew asked to redo (a `reworks` entry with `target: avatar_slot`) gets a new clip.
- **Budget:** a `402 {"error":"budget","remaining_usd"}` means nothing started. Stop and fail the step
  with the amount; don't try a cheaper model on your own.
- **Disclosure:** avatar videos are AI and say so (the `avatar-cutins` disclosure rules). The avatar
  never claims to be human, to have used a product, or to be a real person.
- **Upload:** render the MP4 (9:16, 1080×1920, ≤ 50 MB), upload it with `content_type: video/mp4`, and
  post the `render` checkpoint with `upload` = the returned path, `duration_s`, `face_share` (avatar
  seconds ÷ duration, or null), `imagery_credits` (NASA, Wikimedia CC BY-SA…) and, optionally, 2–3
  `caption_options` that end with every credit line. Broadcast stores the video with its recipe.
- **Never queue or post it.** No `/api/content`, no upload script: Matthew schedules it on the page.

## 5. When stuck
`api -X POST "$BROADCAST_URL/api/factory/$BROADCAST_VIDEO_ID/fail" -d '{"step":"render","message":"What went wrong and what would fix it."}'`
Then stop. The page shows the message with a Redo button.
