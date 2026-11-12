# Face models, providers and keys

The registry is `scripts/face_models.json`. `gen_face.py` reads it to quote and to call providers, and Broadcast's model
settings can show and edit the same list. Prices and research are in `lab/ugc-research.md` (sections 3 and 9).

## Choosing a model
- **Start** on `fal-kling-avatar-std`: the cheapest decent option, and long clips are fine.
- **Fallback:** `fal-omnihuman-1.5`, for more expression.
- **Test before committing:** run the screen test (the same audio on 2–3 models) whenever an avatar is new. Matthew
  judges the results in a blind picker.
- **Record the choice** in `generation.face_model` in the avatar profile. A video may override it.

## Providers

### `placeholder`
Local FFmpeg and free. It makes a slow push-in on the master reference, as long as the slot plus its handles, with no
lip movement. Use it for the timing draft and for testing the pipeline.

### `fal`
- **API.** The queue API: `POST https://queue.fal.run/<endpoint>` with `Authorization: Key <FAL_KEY>` returns
  `request_id`, `status_url` and `response_url`. Poll until `COMPLETED`, then GET the response URL.
- **Inputs.** Images and audio are sent as data URIs (fal accepts them for file inputs). The input field names come from
  each model's `inputs` map.
- **Key.** Either `FAL_KEY` in the environment, or a network secret on the cloud environment for `queue.fal.run`, in
  which case the proxy injects the header and `FAL_KEY` can be any dummy value.
- **Before trusting it.** Models marked `untested` need their schema checked against the model page on the first paid
  run (a one-slot pilot), then their status set to `ready`.

### `broadcast` (the contract for the Broadcast build)
Broadcast holds the provider keys server-side, enforces the cost caps and logs each cost against the video. Sessions
never see the keys.

```
POST {BROADCAST_URL}/api/gen/face-jobs
  Authorization: Bearer {BROADCAST_TOKEN}
  {"video_id": "...", "slot": "hook", "model": "fal-kling-avatar-std", "idempotency_key": "...",
   "image": "data:image/png;base64,..." | "https://...", "audio": "data:audio/wav;base64,..." | "https://...",
   "prompt": "...", "seed": 7, "seconds": 3.4}
  -> 200 {"job_id": "...", "status": "queued", "quote_usd": 0.19}
  -> 402 {"error": "budget", "remaining_usd": 0.12}        (cap would be exceeded: nothing started)
  -> 200 with the existing job when the idempotency_key was seen before (never charge twice)
GET {BROADCAST_URL}/api/gen/face-jobs/{job_id}
  -> {"status": "queued|running|completed|failed", "output_url": "...", "cost_usd": 0.19, "error": null}
GET {BROADCAST_URL}/api/gen/models   -> the enabled entries of face_models.json, with the account defaults
```

### Planned
`hedra`, `heygen`, `kling` (direct) and `captions`. Add an adapter in `gen_face.py` (one `submit` and one `poll`
function), set the model to `untested`, pilot it, then set it to `ready`.

## Keys
Keys never go in the repo, `avatar.json`, prompts or logs. In order of preference:
1. Broadcast's settings page (with the `broadcast` provider).
2. A cloud-environment network secret per provider host.
3. An environment variable for a local run.
