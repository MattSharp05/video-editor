# Versions: cuts, notes and the board as data

Three small files carry a film's review history, so nothing regresses between versions and the Broadcast
app can show the same thing the agent works from. Shared by animated-video and video-edit; the tools are
`templates/remotion-film/cuts.py` and `board.py` (stdlib + Pillow, run from anywhere with `--project`).

| File | Holds | Written by |
| --- | --- | --- |
| `projects/<slug>/brief.md`, section `## Notes` | every correction, one line each, with its status | the person (via Claude or Broadcast) and `cuts.py` |
| `projects/<slug>/renders/cuts.json` | the cut registry: one entry per render someone watched | `cuts.py` only (Broadcast reads it) |
| `projects/<slug>/board.json` | the storyboard: cards in order | Claude and Broadcast; `board.py` draws it |

`renders/` is git-ignored except `cuts.json` (`.gitignore`: `**/renders/*` + `!projects/*/renders/cuts.json`).

## Cuts

A cut is one whole render of one snapshot, numbered and kept forever. Register every render that the person or
a judge watches (animatic, draft, final); a quarter-scale motion-check preview or a stills batch is not a cut.

1. Commit the film source, so the commit pins the snapshot.
2. Render (`render.sh <name>` writes `out/<name>.mp4` and `out/<name>.inputs.sha256`; video-edit renders with FFmpeg).
3. `python3 film/cuts.py add film/out/<name>.mp4 --quality draft|animatic|preview|final --checks stills,motion_check,mute_test,loudness --label "v2 ending"`
   assigns the next number, copies the file to `renders/<slug>_cut<N>.mp4`, and records commit, input hash,
   length, size and loudness (measured with ffmpeg on the MP4). The same file twice is not a new cut
   (`render.sh` printing `reused: true` gives the same file). A cut is never renumbered or removed.
4. Answer the notes in it (below), then deliver with the answers as the change summary.

`renders/cuts.json` (schema 1):

```json
{
  "schema": 1,
  "project": "moon-tides-01",
  "cuts": [
    {
      "cut": 3,
      "date": "2026-11-24T10:12:00Z",
      "label": "v2 ending",
      "quality": "final",
      "commit": "7034d39…(40 hex)",
      "dirty": false,
      "inputs_sha256": "9f2c…",
      "file": "renders/moon-tides-01_cut3.mp4",
      "source": "film/out/reel.mp4",
      "file_sha256": "…",
      "size_mb": 39.2,
      "seconds": 69.7, "frames": 2091, "fps": 30, "width": 1080, "height": 1920,
      "loudness": {"lufs": -14.0, "true_peak_dbtp": -1.6},
      "checks": ["stills", "motion_check", "mute_test", "loudness"],
      "answers": [
        {"id": "n1", "verdict": "answered", "reply": "Logo 30% smaller, moved to the top left"},
        {"id": "n2", "verdict": "not_changed", "reply": "The VO sets this pace; trimming it cuts a line"}
      ]
    }
  ]
}
```

- `commit` is HEAD when registered; `dirty: true` means the project had uncommitted changes, so the commit does
  not fully pin it. `null` outside a git repo.
- `inputs_sha256` comes from `render.sh`'s `out/<name>.inputs.sha256` (its `inputs` line), only when that file's
  `output` line is this MP4; otherwise `null`. A video-edit build passes its own with `--inputs HASH`.
- `file` is the kept copy (git-ignored; containers are wiped, so the delivered final also goes out via the
  session). `source` is where it was rendered; absent with `--no-copy`.
- `quality`: `animatic` (rough shapes over VO), `draft`, `preview` (reduced scale), `final`.
- `checks`: free words, but use these when they apply: `stills`, `motion_check`, `temporal`, `mute_test`,
  `judges`, `fact_check`, `loudness`, `first_last_frame`. List only checks run on this cut.
- `answers`: in the order given; Montage's `answers: [{id, reply, verdict}]` with verdict `answered | not_changed`.

## Notes

Every correction the person gives becomes a note in `brief.md` under `## Notes` (new projects; older briefs keep
their `## Outstanding corrections` prose until next touched, then move it into notes). One note per line:

```
## Notes

- n1 · cut 2 · f372 · 12.4s · box 120,340,400,200 · 2026-11-24 · "Logo smaller" · answered in cut 3: Logo 30% smaller
- n2 · cut 2 · 10-14s · card c4 · 2026-11-24 · "Too slow here" · not changed in cut 3: the VO sets this pace
- n3 · animatic v1 · f300-420 · 2026-11-24 · "Music louder under the turn" · open
```

Grammar: `- <id> · <fields> · "<words>" · <status>`, fields and parts separated by ` · ` (space, middle dot, space).

| Part | Form | Meaning |
| --- | --- | --- |
| id | `n1`, `n2`… | next free number; never reused, never renumbered |
| version (first field, required) | `cut 2`, or before a registry `v1`, `board`, `animatic v1` | what the person was watching |
| frame | `f372` | a moment: integer frame of that version |
| clip in frames | `f300-420` | a stretch |
| time | `12.4s` / `10-14s` | seconds in that version, when no frame is known |
| region | `box x,y,w,h` | pixels in that version's frame (1080×1920 for a Reel), top-left origin |
| card | `card c4` | a board card the note is about |
| date | `2026-11-24` | day it was given |
| by | `by Name` | who gave it, when not Matthew |
| words | `"…"` | the person's words, as close to verbatim as possible; `\"` for a quote inside |
| status | `open` / `answered in cut N: <what changed>` / `not changed in cut N: <why>` / `not changed: <why>` | |

All fields but the version are optional; a moment carries a frame or a time, a clip a frame range or a time
range, a region a box. A note never wraps onto a second line.

Rules:
- **Record a note as it arrives:** `cuts.py note "Logo smaller" --on "cut 2" --at 12.4 --box 120,340,400,200`
  (prints the id). A timestamp points into the version they watched: convert with that cut's fps
  (`frame = round(s × fps)`), and for video-edit find the words there, then map back to the source.
- **Each new cut answers every open note it addresses:** after `add`, `cuts.py answer n1 "Logo 30% smaller"`
  or `cuts.py answer n2 "the VO sets this pace" --not-changed` (default: the latest cut; `--cut N` otherwise).
  This writes the verdict into `cuts.json` and the status into the note's line. Answer only what you verified
  in the export's frames or measurements; anything still pending stays `open`.
- **Deliver with the answers:** the message lists each note answered in the cut (`n1 answered: …`,
  `n2 not changed: …`) and every note still open. `cuts.py open` lists them.
- Notes stay in the brief after they are answered: they are the history a reflection reads. A note the person
  re-raises after an answer becomes a new note pointing at the old one in its words ("n1 again: still too big").
- A later request that replaces an earlier one (a new speed, a new ending) answers the old note `not changed:
  replaced by n7`.

`cuts.py notes --json` / `open --json` print the parsed notes: `{id, version, frame, frames, at, range, box,
card, date, by, text, status: open|answered|not_changed, cut, reply}`.

## Board

The key-frame board as data: cards in order, each what happens or is said, its time, a still, a status and the
shot that realizes it. The person approves the board before the build; card ids let notes point at a card.

```json
{
  "schema": 1,
  "title": "Moon tides 01",
  "stills": "stills/board",
  "approved": {"by": "Matthew", "date": "2026-11-24"},
  "cards": [
    {"id": "c1", "text": "A wave breaks on the beach. VO: \"Does the moon make waves?\"", "at": 0, "seconds": 3.2,
     "still": "stills/board/t0.png", "status": "done", "shot": "src/acts/Beach.tsx"},
    {"id": "c2", "text": "Earth from space; the ocean shell bulges toward the moon", "at": 3.2, "seconds": 6,
     "status": "planned", "shot": null}
  ]
}
```

| Field | Meaning |
| --- | --- |
| `id` | `c1`, `c2`…, stable when cards are reordered or inserted (a new card takes the next free number) |
| `text` | what happens on screen, and what is said |
| `at` | start in seconds on the film's timeline; the still is taken here unless `still` says otherwise |
| `seconds` | length in seconds |
| `still` | image path relative to the project; default `<stills>/t<at>.png` (what `snap.sh` writes) |
| `status` | `planned` (no shot yet) → `rendering` (being built) → `done` (the shot exists in the film) |
| `shot` | what realizes it: a file or composition (`src/acts/Beach.tsx`), or for video-edit a clip/frame range |
| `approved` | `null` until the person approves; then who and when. A changed card after approval is shown again |

Unknown fields are kept and ignored, so Broadcast may add its own.

Commands (from the project or `film/`):
- `python3 film/board.py board.json --secs` prints each card's `at`: `./snap.sh ../stills/board $(python3 board.py ../board.json --secs)`.
- `python3 film/board.py board.json [out.png]` draws the board (default `board.png` beside it): the same layout
  as before, with the card id, time, length and status; a card without a still shows a placeholder.
- `python3 film/board.py init board.json <stilldir> "sec|line" …` turns the old arguments into a `board.json`.
- The old call `board.py <stilldir> out.png "sec|line" …` still works and draws the same image as before.

## Broadcast

Broadcast reads all three files from the repo. It writes notes as lines in the grammar above (taking the next
free id) and edits `board.json` (card status, text, order, `approved`); it does not write `cuts.json`. Parsers:
note line `^- (n\d+) · (.*?) · "((?:[^"\\]|\\.)*)" · (.+)$`; status
`^(open|answered in cut (\d+): .+|not changed(?: in cut (\d+))?: .+)$`. Visual marks made on a cut in
Broadcast arrive as notes with `cut N`, a frame or range, and a box.
