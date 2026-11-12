# video-editor

Matthew's video studio, run with Claude. Every video is a project folder under `projects/`; Claude
scripts, animates, edits and checks it using the skills in `.claude/skills/`. This is an experiment:
start small, keep what works, and fold lessons back into the profiles and skills.

## Skills (vendored from cstack)

`.claude/skills/` holds copies of [goodnight000/cstack](https://github.com/goodnight000/cstack)
skills (MIT; upstream commit in `.claude/skills/UPSTREAM.md`). They are ours to tailor; record any
local change in `UPSTREAM.md` so a later upstream sync knows what to keep.

| Skill | Use it for |
|---|---|
| `video-script` | Ideas, hooks and scripts (time / spoken line / on-screen picture). Stops at the script. |
| `animated-video` | Videos drawn in code with Remotion (UI mockups, motion graphics, the iPhone part). |
| `video-edit` | Camera footage and screen recordings: cuts, captions, sound, FFmpeg renders. |
| `asset-library` | A shared catalog of reusable assets once a second project wants to reuse something. |
| `reflect` | After a video ships: review what worked and propose changes to profiles or skills. |
| `real-sfx` | Sound design with real recorded sounds (vendored from Clipwing; see its `UPSTREAM.md`). |
| `avatar-cutins` | Ours (2026-11-12): short AI-avatar talking-head bursts cut into an animated film, for accounts with an avatar profile. Research: `lab/ugc-research.md`. |
| `hero-assets` | Ours (2026-11-12): an AI-generated 3D model (fal: Meshy, Tripo, Hunyuan) for a film's focal object, after the three.js version and Matthew's pick; decisions logged in `lab/hero-assets/decisions.md`. |
| `broadcast-factory` | Ours (2026-11-12): one step of a Broadcast Content Factory video, started by the dashboard (brief → step → checkpoint). Contract: broadcast `docs/factory-api.md`. |

Who owns the timeline: an animated film is `animated-video`'s even with a camera insert; a camera
or screen-recording edit is `video-edit`'s even with animated shots.

## Profiles

The skills read their defaults from `~/.video-script/profile.md`, `~/.video-edit/profile.md`,
`~/.animated-video/profile.md` and `~/.asset-library/profile.md`. The real files live in
`profiles/` (so they survive cloud sessions) and `scripts/setup.sh` links them into `$HOME`; a
SessionStart hook runs it. When Matthew states a habit ("always", "as usual"), update the profile
here and commit it.

## Projects

One folder per video: `projects/<slug>/`.

```
projects/<slug>/
  brief.md        the active brief: goal, platform, length, every outstanding correction
  script.md       from video-script
  vo/             Matthew's voiceover takes (wav/m4a) and the alignment output
  refs/           screenshots, screen recordings, reference videos he supplies
  film/           the Remotion project (animated-video) or edit scripts (video-edit)
  stills/         key-frame boards and review stills worth keeping
  renders/        exports (git-ignored; deliver the named final via the session)
```

Keep `brief.md` current: the latest requested version and every correction until it is verified
in an export.

## Environment

Cloud container: FFmpeg, Node 22, Python 3.13 and uv are installed; Remotion renders headless with
the pre-installed Chromium. DaVinci Resolve is not available here, so edits render with FFmpeg
(no editable Resolve project). Claude sees frames, not playback: say what was measured versus
listened to.

## Rules

- Sound effects: `sfx-01`–`sfx-28` in the video-edit library have unverified rights. Drafts only;
  anything published uses the CC0 `sfx-29`–`sfx-61`, Matthew's own files, or synthesized sound.
- Product videos follow that product's design rules (Trip: `docs/design.md` in MattSharp05/Trip).
- Nothing gets posted or uploaded anywhere without Matthew asking.
- AI avatars are always disclosed: the account's "AI-generated profile" label, an "AI creator" bio line and the per-post
  AI flag. An avatar is never a real person, never claims to be human, never claims to have used a product, and one
  video is never pushed through several personas (`avatar-cutins`, `references/disclosure.md`).
- Paid generation (face clips, 3D models, AI video): quote the whole run first, spend only after Matthew's approval and within
  the avatar's cost cap. API keys live in Broadcast or the cloud environment's secrets, never in the repo.
- Don't commit renders, `node_modules`, or large raw footage; commit scripts, briefs, VO takes
  and the film source.
