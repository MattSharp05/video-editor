# Broadcast contract for hero assets

Same auth as the face jobs: `Authorization: Bearer {BROADCAST_TOKEN}` (scoped to generation and factory endpoints,
expiring; a cloud environment secret or passed by the routine, never committed). Paths come from the `proxy` block
of `scripts/mesh_models.json`, so a change there needs no code change. Proposed to the Broadcast builder session on
2026-11-12. `lab/hero-assets/bench/mock_broadcast.py` implements this contract for tests.

Accepted by the Broadcast builder session on 2026-11-12, with three rules (full factory contract:
`MattSharp05/broadcast` `docs/factory-api.md`):
- **Per-video token.** `BROADCAST_TOKEN` is a per-video factory token (`bcf_live_…` / `bcf_sandbox_…`); `video_id`
  must be that token's video, or 403 `wrong_video`. gen_mesh.py takes it from `BROADCAST_VIDEO_ID` (default: the
  project folder name).
- **4 MB request bodies.** gen_mesh.py sends stills as JPEG copies (≤1080 wide, ~0.1–0.6 MB) and uploads any file
  over ~2.5 MB as data URI via `POST /api/factory/{video_id}/assets {"name","content_type"}` → `PUT upload_url` →
  the returned `storage:factory/…` path in place of the data URI. Image fields accept a data URI, an https URL or a
  storage: path. A proposal body over 3.8 MB is refused locally.
- **Broadcast builds the fal request itself** from its mirror of `mesh_models.json` (endpoint, inputs, options,
  output field). The `fal_endpoint` / `fal_input` / `output_field` the session sends are accepted and ignored. So
  every edit to `mesh_models.json` (a price, an option, a model's status) must reach Broadcast's mirror too.
- **Mirror sync:** the repo's `mesh_models.json` is the source; Broadcast copies it by hand until its sync script exists
  (requested 2026-11-12, like `scripts/sync-face-models.mjs` for faces). After any registry edit, tell the Broadcast
  side.
- **Score:** stored on the proposal (≤ 500 chars), shown under the object name and returned by
  `GET /api/factory/hero-decisions` (broadcast #39).
- **Outputs:** a job that returns no `.glb` fails; the `.glb` is copied to Broadcast storage behind a signed URL valid
  7 days (download it within that, or re-fetch the job for a fresh URL).
- **Advisory quote.** `quote_usd` is advisory: the server re-quotes from its mirror of `mesh_models.json` and checks the
  caps (402) with its own number. Keep the two in sync when prices change.

## Proposals (the only thing the session uploads)
```
POST /api/factory/hero-proposals
  {"proposal_id", "video_id", "object", "scene", "reason", "why_generate", "on_screen",
   "input": {"mode": "image|text", "prompt", "image": "data URI|null"},
   "suggested_model", "estimate_usd", "options": [{model, label, options, price_usd, status, licence}],
   "stills": [{"label": "threejs-wide", "image": "data:image/png;base64,..."}], "stage": "proposal|comparison"}
  -> 200 {"proposal_id", "status": "pending"}     idempotent on proposal_id + stage; a comparison adds its stills
GET /api/factory/hero-proposals/{proposal_id}
  -> {"status": "pending|decided",
      "decision": null | {"choice", "model", "budget_usd", "notes", "reason", "decided_at"}}
GET /api/factory/hero-decisions
  -> [{proposal_id, video_id, object, stage, choice, model, cost_usd, reason, decided_at}]   (the export)
```
Choices: `keep_threejs`, `redo_threejs`, `generate` (stage proposal); `use_generated`, `keep_threejs_after_compare`,
`redo_threejs`, `generate` (stage comparison). The dashboard shows the stills, the price table and the licences, and
takes his choice, a model, a budget and his reason (required).

## Mesh jobs (`kind: mesh`, mirrors the face jobs)
```
POST /api/gen/mesh-jobs
  {"kind": "mesh", "proposal_id", "video_id", "model", "idempotency_key", "mode": "image|text",
   "image": "data URI|null", "prompt", "seed", "options": {"texture": true}, "quote_usd",
   "fal_endpoint": "tripo3d/tripo/v2.5/image-to-3d",
   "fal_input": {"texture": "standard", "image_url": "$image", "seed": 7},   ("$image" = the image above)
   "output_field": "model_mesh.url"}
  -> 200 {"job_id", "status": "queued", "quote_usd"}
  -> 402 {"error": "budget", "remaining_usd"}     cap would be exceeded: nothing started
  -> 403 {"error": "not_approved"}                 no `generate` decision for this proposal and model
  -> 200 + the existing job when the idempotency_key was seen before (never charge twice)
GET /api/gen/mesh-jobs/{job_id}
  -> {"status": "queued|running|completed|failed", "output_url": "<.glb>", "outputs": {raw fal result},
      "cost_usd", "error"}
```
Server side:
- **Check before submitting:** the approval (403), the per-video and monthly caps (402), and that the model is
  enabled with a saved fal key.
- **Submit:** `POST https://queue.fal.run/{fal_endpoint}` with `Authorization: Key <fal key>` and `fal_input`, with
  `$image` replaced by the image. Rebuilding `fal_input` from the registry's `base_inputs`, `options[].inputs` and
  `inputs` gives the same thing.
- **Poll:** the status URL, then read `output_field` from the response.
- **No GLB:** if the result has no `.glb` (Hunyuan Rapid can fall back to OBJ), fail the job and don't charge it
  again on retry.
- **Keep the output:** fal's output URLs are short-lived (Meshy deletes API output after 3 days; Tencent keeps it 7).
  Copy the `.glb` to Broadcast's storage and return that URL, valid long enough to download again.
- **Log the cost** per video and month next to the face jobs.
