# Series brief: "The Stolen Smile" (3-part true crime, 2026-11-07, round 3)

Matthew: "a 3 part true crime series… Make sure there is continuity between the 3. Each video can be a bit longer too
like 90 seconds." Same rules as before (entertaining, engaging, fun; 3rd-grade reading level; unattended, no approval).
**BUILD-BRIEF.md still applies in full; this file adds the series rules and overrides only the length.**

## The series
| Part | Folder | Title | Ends on |
|---|---|---|---|
| 1 | `projects/stolen-smile-1/` | The vanishing | "The Mona Lisa is gone. And no one knows who took her." |
| 2 | `projects/stolen-smile-2/` | The hunt | a letter in Florence, signed "Leonardo" |
| 3 | `projects/stolen-smile-3/` | The return | "…the most famous smile in the world." |

Shared: `projects/stolen-smile-kit/` holds `research.md` (fact base), `pictures-brainstorm.md`, `pictures-pick.md` (the
series beat sheet: look, devices and every part's beats), and `film-kit/` (shared code and art, built by the kit session).

## Length (overrides BUILD-BRIEF's "under 60 s")
Each part 70–89 s including the tail. 90 s is the hard ceiling (Reels and Broadcast's content API take 3–90 s).

## Continuity rules (every part)
- **One look.** The same palette, fonts, caption style, grain and grade, the same character designs, and the same sets
  where a set recurs. All of these come from `film-kit/`; a part never redraws a shared character or set its own way.
  A part may add part-only props and sets in the kit's style.
- **One voice.** The design-m2 clone from the same reference clip with seed 7 (the default in `vo/gen_vo.py`), and the
  same gaps style.
- **One music bed.** Floating Cities, mixed the same way in every part (same level under the voice).
- **The same title card and end card.** "The Stolen Smile", then "Part N of 3" and the part title, in the first ~4 s
  (over moving picture, never a held slide). The end card is "Next: <next part title>", and in part 3 "The end".
  Both come from the kit.
- **Recaps.** Parts 2 and 3 open on "Last time…" over a visual callback built from the previous part's own
  pictures (the same props and characters, quickly), so a viewer who saw part 1 recognises it in one look.
- **Recurring devices** are the ones `pictures-pick.md` names (e.g. the four hooks, the white smock, the red silk).
  Each appears, and changes meaning, the way the pick says, with the same look and the same sound every time.
- **Recurring sounds.** The kit's sound palette (in `film-kit/sound/`): one series sting for the title, one sound for
  each recurring device, used identically in all parts. CC0 or synthesized only.
- **Honesty.** True crime: the story's facts are the fact-checked script. On-screen text (dates, names, places, labels)
  must match `research.md`. Disputed details carry a small tag ("Some say…", "Illustration"). Cartoons of real people
  (Vincenzo Peruggia, Picasso, Kafka, Alfredo Geri, Giovanni Poggi) are drawn as characters, never caricatured for
  mockery. Leonardo's painting itself is in the public domain: use a public-domain reproduction (Wikimedia Commons; note
  the source URL and licence in the kit README), not our own redraw, so she is recognisably herself.

## How the kit works
1. The **kit session** builds `projects/stolen-smile-kit/film-kit/`:
   - a Remotion project with a `KitSheet` composition (model sheets of every character, set and prop, and the title
     and end cards in motion);
   - components exported from `film-kit/src/series/` (characters with poses and expressions, sets, props, cards,
     captions look, grade and grain);
   - `film-kit/sound/` (series sounds and a mix helper);
   - a README with the API.

   It commits early and often. When the kit is usable it writes `film-kit/READY` (one line: the commit and what's in
   it) and messages the orchestrator. After READY it only adds things; it never renames or breaks an API the parts use.
2. The **part sessions** start at once:
   - Start-up jobs (VO, music), read the briefs, plan (`film/PLAN.md`), part-only props and sets, the timing spine.
   - When `READY` exists (pull to check), copy `film-kit/src/series/` into `film/src/series/` and build on it. Note
     the kit commit you copied in PLAN.md.
   - If you need something the kit lacks, build it in your part in the kit's style and note it. Don't edit the kit
     folder: only the kit session writes there.
3. **Each part commits** `stills/sheet_1fps.jpg` (1 fps contact sheet of the final) plus three hero stills, so the
   orchestrator can run a continuity judge across all three parts.

## Done means (each part)
BUILD-BRIEF's checks: VO MATCH; motion_check vs `lab/motion-bar/grand-canyon-01_q.json`; the mute test with a second
fresh judge after fixes; loudness -14 LUFS and under -1.5 dBTP; frame count; delivery with SendUserFile.
Then REPORT.md, plus a `send_message` summary to the orchestrator (session_01WProZZXsgMxE5Vt8fwTbeJ).
