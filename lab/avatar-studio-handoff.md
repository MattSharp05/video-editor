# Hand-off: Avatar studio and face generation in Broadcast (2026-11-12)

**For:** the session building the Broadcast integration (`MattSharp05/broadcast`).

**What exists on the video side:** the skill `.claude/skills/avatar-cutins/` in `video-editor`. Its contracts are
below.

**Background:** `lab/ugc-research.md`. Matthew's decisions so far:
- Avatars appear as short cut-ins inside animated films (about 15 s of a 60 s video to start), as a standard technique.
- The goals are saving time, tokens and cost.
- Always disclosed as AI. He said: "i dont want to deceive anyone or break any rules".
- No reposting one video across avatar accounts. A hit is *remade* for another account (new wording, hook, voice and
  look), or shared as a Collab post.

## Matthew asked for these two things explicitly

### 1. A place to enter his API keys (Settings → Generation keys)
- **One row per provider:**
  - fal (`FAL_KEY`);
  - later Kling (access key + secret), Alibaba Model Studio (DashScope key), Hedra, HeyGen, ElevenLabs.
- **Storage:** encrypted at rest, server-side only.
  - Never sent to the browser after saving: show only the last 4 characters and a "test key" button.
  - Never passed to Claude sessions in a prompt or environment variable.
- **The generation proxy uses the keys**, so sessions never hold them. A test key can call a free endpoint where one
  exists (for example, list models or account balance).
- **Per-provider spend so far,** from the job log.

### 2. A way to choose the face model
- **Show the registry.** The list is `.claude/skills/avatar-cutins/scripts/face_models.json`. Show each model's label,
  price per second, max length, status (`ready`, `untested`, `planned`) and notes.
  - Read it from the repo, or mirror it into a table synced from the repo.
- **Account-level settings:**
  - which models are enabled (only providers with a saved key);
  - the default face model;
  - a fallback model.
- **Avatar-level settings:** a per-avatar override (`generation.face_model`, `fallback_model`, `seed`, `resolution`).
- **Video-level settings:** a per-video override in the Content Factory, for A/B tests of face models. The manifest
  tags each part, so performance can be compared by face model.
- **Planned models** are listed but can't be selected.

## The Avatar studio (one avatar per account)
- **The fields are the profile schema** in `.claude/skills/avatar-cutins/references/avatar-profile.md`:
  - identity and backstory;
  - personality and speaking style;
  - look (master ref, face pack, wardrobe, settings, framing);
  - voice (provider, reference clip with its transcript and seed, or a voice ID, plus playable samples);
  - rules and platform flags;
  - generation settings (models, seed, cost cap per video);
  - notes;
  - version.
- **The flow** is in that file's "Making a new avatar" section: 3 persona drafts → about 8 portrait candidates → face
  pack → blind voice pick → a screen test on 2 models → save as v1.
  - Each step has the Content Factory's approval-or-autopilot toggle.
  - Image and voice generation inside the studio go through the same proxy and job log.
- **Versioning:** changing the look or voice bumps `version`. Old videos keep their version in their manifest.
- **Export to a session:** when the dashboard starts a video session for an account with an avatar, give it `avatar.json`
  plus the `refs/` files. Either commit them under `avatars/<account>/` in video-editor, or let the session download
  them from a signed URL. The skill reads `--avatar <path>/avatar.json`, with refs relative to it.
- **Disclosure built into the account:**
  - a reminder or checklist to turn on Instagram's "AI-generated profile" label and to add the "AI creator" bio line;
  - the scheduler sets `is_ai_generated=true` on every Instagram media container (at creation) and `is_aigc=true` on
    TikTok posts for avatar accounts, and `is_paid_partnership` when a post promotes a product.
- **Guardrails:**
  - Block publishing the same video file, or a near-duplicate, to more than one account. Suggest a Collab post instead.
  - Add a "Remake for account B" action that starts a new video session from the winner's manifest.

## The generation proxy (the session side is already written to it)
`gen_face.py --model <key>` with provider `broadcast` calls:

```
POST {BROADCAST_URL}/api/gen/face-jobs        Authorization: Bearer {BROADCAST_TOKEN}
  {"video_id","slot","model","idempotency_key","image" (data URI or URL),"audio" (data URI or URL),"prompt","seed","seconds"}
  -> 200 {"job_id","status":"queued","quote_usd"}
  -> 402 {"error":"budget","remaining_usd"}       cap would be exceeded: nothing started
  -> 200 + the existing job if the idempotency_key was seen before (never charge twice)
GET  {BROADCAST_URL}/api/gen/face-jobs/{job_id}
  -> {"status":"queued|running|completed|failed","output_url","cost_usd","error"}
GET  {BROADCAST_URL}/api/gen/models  -> enabled models with the account defaults
```

The server side:
- **Look up the model** in the registry and pick the provider key.
- **Check the caps:** the per-video cap (the avatar's `cost_cap_per_video_usd`) and a monthly cap (a new setting).
- **Submit:** for fal, `POST https://queue.fal.run/<endpoint>` with `Authorization: Key <key>`, the inputs mapped by the
  model's `inputs` field names; poll the status URL; read `response_url`.
- **Store the job:** video, slot, model, seconds, quote, actual cost, status and output, with output URLs that stay
  valid long enough for the session to download them.
- **Show spend** per video and per month in the dashboard, next to the performance stats.

`BROADCAST_TOKEN` is a per-session or per-routine token that is scoped to the generation endpoints and expires. Store it
as the cloud environment's secret or pass it to the routine, never committed.

## Also on the dashboard
- **Approvals.** Quote approval as a Content Factory step: the session posts its quote (`gen_face.py quote` output) and
  waits for approval, or autopilot approves anything under the cap.
- **Performance by part.** The face-clip manifest (`face/manifest.json`: model, seconds, cost, seed and avatar version
  per slot, plus the face share) joins the video's manifest of tagged parts, so retention can be read by face share,
  layout, model and avatar version.

## Status of the video side
- **Tested:** the placeholder path, end to end.
- **Not yet run:** the fal and broadcast adapters. Run a one-slot pilot once a key exists, then mark the model `ready`
  in `face_models.json`.
