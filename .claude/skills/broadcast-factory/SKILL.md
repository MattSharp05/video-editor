---
name: broadcast-factory
description: >-
  Run one step of a Broadcast Content Factory video: read the brief from Broadcast, do only that step
  (idea brief, script, style frame, stills, avatar-clip quote, render, or revise: answer Matthew's notes on a
  version with a new version) with the existing skills, post the result back, and stop. Use when a prompt or a <routine-fire-payload> says "Broadcast Content
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
BROADCAST_VIDEO_ID=<uuid>        STEP=idea|script|style|visuals|face_quote|render|revise
NOTE=…                            (only on a redo: what Matthew wants changed)
BATCH=<review batch id>           (only on STEP=revise: the notes to answer)
```

Export them as environment variables. **Never print, log, commit or write the token to a file.**
It is scoped to this one video and expires in 24 hours. It is not the content API key, and you never
get a provider key (fal and others stay in Broadcast).

```bash
export BROADCAST_URL=… BROADCAST_TOKEN=… BROADCAST_VIDEO_ID=… STEP=… BATCH=…   # BATCH on revise only
api() { curl -sS -H "Authorization: Bearer $BROADCAST_TOKEN" -H 'Content-Type: application/json' "$@"; }
api "$BROADCAST_URL/api/factory/$BROADCAST_VIDEO_ID/brief" > /tmp/brief.json
```

The brief has `video` (idea, style, project_slug, account, voice, music, avatar profile and version,
face model, script), `step` (name, attempt, note), `outputs` of earlier steps, `reworks`, `face_clips`
(paid clips already made), `budget`, `versions` (every kept render, newest first: `number`, `url` signed
for 2 hours, `duration_s`, `fps`, `git_sha`, `made_by`) and, on `STEP=revise`, `batch` (the notes to
answer; section 5).

**Intent on every call.** Every `progress`, `checkpoint`, `fail` and `versions` call carries `intent`:
one line, at most 160 characters, saying what you are doing and why ("Re-timing the title to land on the
drum hit (note 1)"). Matthew reads them in the video's activity feed; longer is cut. Write it for him,
not for a log.

## 2. The project folder
- Branch `factory/<project_slug>`: `git fetch origin factory/<slug>` and check it out if it exists, else
  create it from `main`. Work in `projects/<slug>/`. Commit and push at the end of every step so the
  next session (a new container) finds the files.
- On the `idea` step create `projects/<slug>/brief.md` from the brief (facts, audience, hook, voice,
  music with its credit, avatar and version if any).
- Do **only** `STEP`. If `NOTE` is set, it is a redo: change what it asks and keep the rest.

## 3. The steps
Post progress on anything longer than a minute or two:
`api -X POST "$BROADCAST_URL/api/factory/$BROADCAST_VIDEO_ID/progress" -d '{"step":"render","progress":40,"message":"Rendering scene 2 of 5.","intent":"Rendering scene 2 of 5: the tide diagram, slowed so the label reads."}'`

| STEP | Do | Checkpoint `output` |
|---|---|---|
| `idea` | A short brief from the idea (the `video-script` skill's brief stage). | `{"title","brief","audience","hook"}` |
| `script` | `video-script`: the lines at grade-3 reading level. With an avatar, mark the cut-in lines (`avatar-cutins` FACE lines) with `slot` (`hook`, `mid`, `cta`…). | `{"version","hook","lines":[{"id","text","slot"?}]}` (bump `version` on a redo) |
| `style` | `animated-video`: one frame of the hook beat in the chosen style pack (`styles/<style>/README.md`). JPEG, 9:16. | `{"frames":[{"url","caption"}]}` |
| `visuals` | Key stills, one per scene, ids `s1`, `s2`… (Matthew can redo one scene). | `{"stills":[{"url","scene","caption"}]}` |
| `face_quote` | Avatar videos only. `avatar-cutins`: face slots, then `gen_face.py quote` with the brief's `face_model.key`. Nothing is paid here. | `{"model","slots":[{"slot","seconds"}],"quote":{"model","seconds","baseUsd","rerollUsd","totalUsd","free"}}` |
| `render` | VO, music, avatar clips, Remotion render, upload (below). | `{"upload","proxy","git_sha","duration_s","fps","loudness_lufs","true_peak_db","face_share","imagery_credits":[…],"caption_options"?:[…]}` |
| `revise` | Answer the batch of notes with a new version (section 5). Not a checkpoint: `POST /versions`. | — |

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
# {"step":"$STEP","intent":"One line: what this output is and why.","output":{…}}
#   →  {"status":"waiting"|"approved","next_step":…}
```
Approval starts the next step in a new session; never run it yourself.

## 4. The render
- **Voice:** the brief's `voice.key` is a voice in `lab/voice-picker/library/voices.json`: render the
  lines with `lab/voice-picker/library/say.py --voice <key> --lines lines.json --out vo/`, which clones
  every line from that voice's reference clip (never design per line: it drifts). A key that isn't in
  the library: fail the step and say which voice is missing. Credit: `voice.credit`.
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
- **Upload:** render the MP4 (9:16, 1080×1920, ≤ 50 MB), then make the 720p proxy, measure loudness,
  commit and push the film, and upload both files (see "Deliver a version" below). Post the `render`
  checkpoint with `upload` and `proxy` = the returned paths, `git_sha`, `duration_s`, `fps`,
  `loudness_lufs`, `true_peak_db`, `face_share` (avatar seconds ÷ duration, or null), `imagery_credits`
  (NASA, Wikimedia CC BY-SA…) and, optionally, 2–3 `caption_options` that end with every credit line.
  Broadcast keeps every render as a numbered version (v1, v2…) with its recipe; `git_sha` is required
  (422 `missing_git_sha` without it).
- **Never queue or post it.** No `/api/content`, no upload script: Matthew schedules it on the page.

### Deliver a version (render and revise)
```bash
cd projects/$SLUG
OUT=renders/final.mp4                                  # 1080×1920 H.264, ≤ 50 MB
ffmpeg -y -i "$OUT" -vf scale=720:-2 -c:v libx264 -b:v 1.5M -maxrate 2M -bufsize 3M \
  -c:a aac -b:a 128k -movflags +faststart renders/proxy.mp4          # must be ≤ 15 MB
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$OUT" | awk -F/ '{print $1/$2}')
ffmpeg -nostats -i "$OUT" -filter_complex ebur128=peak=true -f null - 2> /tmp/ebur.txt
LUFS=$(grep -A20 Summary /tmp/ebur.txt | awk '/I:/ {print $2; exit}')
PEAK=$(grep -A20 Summary /tmp/ebur.txt | awk '/Peak:/ {print $2; exit}')
git add -A . ':!renders' && git commit -m "factory($SLUG): $STEP" && git push origin "factory/$SLUG"
SHA=$(git rev-parse HEAD)                              # after the commit: the film this file came from
up() {  # up <file> → storage:… path
  local r; r=$(api -X POST "$BROADCAST_URL/api/factory/$BROADCAST_VIDEO_ID/assets" -d '{"name":"'"$(basename "$1")"'","content_type":"video/mp4"}')
  curl -sS -X PUT -H 'Content-Type: video/mp4' --data-binary @"$1" "$(jq -r .upload_url <<<"$r")" > /dev/null
  jq -r .path <<<"$r"
}
UPLOAD=$(up "$OUT"); PROXY=$(up renders/proxy.mp4)
```
Broadcast aims for −16…−12 LUFS integrated and a true peak ≤ −1 dBTP (its ready-to-post checks); fix
the mix before uploading if the numbers are outside that.

## 5. Revise (STEP=revise, BATCH=…)
Matthew watched a version, pinned notes to it and sent them as one batch. Answer **every** note with a
new version. Only one batch per video is open at a time.

1. Read the batch: `jq .batch /tmp/brief.json`. It has `id` (= `$BATCH`), `version_number` (the version
   the notes are on) and `notes`: `{id, number, kind, t_s, frame, box, text, crop_url}`. `kind` is
   `moment` (a time), `region` (a time and a box `{x,y,w,h}`, 0–1 from the top left) or `general`
   (no time). `crop_url` is what Matthew saw in his browser.
2. Check out `factory/<slug>` and confirm `git log` contains that version's `git_sha` (from
   `versions`); build from it, not from older work.
3. Look at each timed note on the exact frame, from the version it is on:
   ```bash
   URL=$(jq -r --argjson v "$(jq .batch.version_number /tmp/brief.json)" '.versions[] | select(.number==$v) | .url' /tmp/brief.json)
   jq -c '.batch.notes[] | select(.t_s != null)' /tmp/brief.json | while read -r n; do
     N=$(jq .number <<<"$n"); T=$(jq .t_s <<<"$n")
     ffmpeg -loglevel error -y -ss "$T" -i "$URL" -frames:v 1 "/tmp/note-$N.png"
     # region: crop the box (w,h,x,y as fractions of the frame)
     jq -e .box <<<"$n" > /dev/null && ffmpeg -loglevel error -y -i "/tmp/note-$N.png" \
       -vf "crop=iw*$(jq .box.w <<<"$n"):ih*$(jq .box.h <<<"$n"):iw*$(jq .box.x <<<"$n"):ih*$(jq .box.y <<<"$n")" "/tmp/note-$N-box.png"
   done
   ```
   Read the images (and `crop_url`) before changing anything.
4. Change **only** what the notes ask; keep everything else as it was (same voice audio, same kept avatar
   clips, same music; see "Kept clips"). In an animated film use the `animated-video` handoff and
   partial re-render pages to touch only the scenes involved.
5. Render, then follow "Deliver a version" (proxy, loudness, commit + push, uploads).
6. Post the new version with one answer per note:
   ```bash
   jq -n --arg batch "$BATCH" --arg up "$UPLOAD" --arg px "$PROXY" --arg sha "$SHA" \
     --argjson dur "$DUR" --argjson fps "$FPS" --argjson lufs "$LUFS" --argjson peak "$PEAK" \
     --arg intent "Moved the title in 6 frames and enlarged the label; music left as is." \
     --slurpfile answers /tmp/answers.json \
     '{batch_id:$batch, upload:$up, proxy:$px, git_sha:$sha, duration_s:$dur, fps:$fps,
       loudness_lufs:$lufs, true_peak_db:$peak, intent:$intent, answers:$answers[0]}' > /tmp/version.json
   api -X POST "$BROADCAST_URL/api/factory/$BROADCAST_VIDEO_ID/versions" -d @/tmp/version.json
   # → 201 {"version":"<id>","number":3}
   ```
   `/tmp/answers.json` is one entry per note:
   `[{"note_id":"…","verdict":"answered","reply":"The title now lands on the drum hit (frame 90)."},
     {"note_id":"…","verdict":"not_changed","reply":"Left the music: it already sits 18 dB under the voice."}]`
   - `answered`: you changed it; the reply says what and where (frame or scene).
   - `not_changed`: you can't or shouldn't (it would break a rule, a credit, the disclosure, or contradict
     another note); the reply gives the reason. Never skip a note.
   - `422 answers_incomplete`: a note is missing, doubled or unknown; nothing was saved. Fix the list and
     post again (re-upload is not needed: the same paths work).
   - `403 wrong_batch` / `409 batch_closed`: the batch belongs to another video or is already answered.
     Stop and say so with `/fail`.
7. Stop. Matthew reads the replies on the Versions tab and resolves or reopens each note.

Still never queue or post anything: the new version waits on the page like any render.

## 6. Import an existing project (no STEP)
For a project made before the factory, Matthew asks a session to bring it into Broadcast's studio as
a video with v1, so it can be reviewed and posted there. No payload lines: the prompt names the
projects and gives `BROADCAST_URL` and the **content API key** as `BROADCAST_API_KEY` (from Matthew's
environment; never print or commit it). Free only: render with what the project already has; no paid
generation. A project that doesn't render is reported and skipped.

For each `projects/<slug>/`:
1. Render the film as it is on `main` (or use an existing `renders/` file of the latest version if
   it's 1080×1920 and matches `brief.md`). Then make the proxy and measure loudness as in "Deliver a
   version" (section 4), without committing anything new: `SHA=$(git rev-parse HEAD)`.
2. Create the video (title and a one-paragraph summary from `brief.md`; `style` only if the brief
   names one of Broadcast's style packs):
   ```bash
   r=$(curl -sS -X POST "$BROADCAST_URL/api/factory/import" \
     -H "Authorization: Bearer $BROADCAST_API_KEY" -H 'Content-Type: application/json' \
     -d "$(jq -n --arg slug "$SLUG" --arg title "$TITLE" --arg idea "$SUMMARY" \
           '{project_slug:$slug, title:$title, idea:$idea}')")
   export BROADCAST_VIDEO_ID=$(jq -r .video_id <<<"$r") BROADCAST_TOKEN=$(jq -r .token <<<"$r")
   ```
   `409 already_imported` means it is in the studio already: skip it.
3. Upload the render and the proxy (`up` from "Deliver a version"), then post v1 with **no**
   `batch_id`:
   ```bash
   api -X POST "$BROADCAST_URL/api/factory/$BROADCAST_VIDEO_ID/versions" -d "$(jq -n \
     --arg up "$UPLOAD" --arg px "$PROXY" --arg sha "$SHA" --argjson fps "$FPS" \
     --argjson lufs "$LUFS" --argjson peak "$PEAK" \
     '{upload:$up, proxy:$px, git_sha:$sha, fps:$fps, loudness_lufs:$lufs, true_peak_db:$peak,
       intent:"Imported the current film as v1."}')"
   # → 201 {"version":"…","number":1}
   ```
4. Report per project: imported (video id) or skipped with the reason. The videos have no account
   yet; Matthew picks one and schedules them in the studio. Never queue or post.

## 7. When stuck
```bash
api -X POST "$BROADCAST_URL/api/factory/$BROADCAST_VIDEO_ID/fail" \
  -d '{"step":"render","message":"What went wrong and what would fix it.","intent":"Stopped: Remotion could not load the paper texture."}'
```
Then stop. The page shows the message with a Redo button.

On `STEP=revise` don't call `/fail` or `/progress`: they only take the pipeline steps, and failing
`render` would mark the finished video failed. Stop instead, and say in your final message which notes
are blocked and why; the batch stays open on the page. Don't post a partial version that skips notes.
