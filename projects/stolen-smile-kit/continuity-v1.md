# The Stolen Smile: continuity judge on v1 (fresh agent, 2026-11-07)

Continuity judge report: "The Stolen Smile", parts 1–3. I judged from the frames only and edited no files.

Seconds below are the tile index on each part's sheet_1fps.jpg, counted from 0 (part 1 is 9 per row, part 2 is 10 per row, part 3 is 9 per row). Expect ±1 s.

## 1. Verdict: 7/10. It reads as one series, with a few clear breaks

**What holds it together:**
- **The kit look is everywhere:** the same paper/ink/sepia/nightBlue palette, the same grain and grade, and the same IBM-style torn caption strip with ink underline and amber "Mona Lisa".
- **Cards match:**
  - The corner tab is identical in all three parts ("The Stolen Smile · Part N of 3", top left, from frame 0).
  - The title plaque is the same oldGold-framed card in all three, hung on the hooks (P1), the "?" (P2) and the red silk (P3).
  - "Last time…" uses the same card in P2 and P3.
- **The devices carry through:**
  - The hooks with 1–4 number tags appear in P1 at about 13–15 s and come back in P3 at 60–61 s.
  - The fame gauge goes from the monocle (P1) to the globe (P2) to 100,000+ and then "millions every year" (P3).
  - The red "?" carries through and becomes the "!" in P3 at 37–38 s.
- **The Salon Carré and the modern Louvre room** (glass case, red rope, crowd with phones) match between P1 at 0–4 s and P3 at 72–80 s.
- **Cast:** Vincenzo's head, moustache and kit costumes are recognisably the same man in all three parts. Geri in P2 and P3 matches.
- **Caption strip position:** I checked for a part using a different position and found none. All three sit at about y 1400–1480 of 1920 (P1 s36/70, P2 s20/47, P3 s11/44 measured side by side).

**What costs points:**
- Part 2 redrew three shared sets its own way: the staircase, the cell and the street.
- Part 3's recap opens on a picture part 2 never showed (the spider web on the hooks).
- Part 2's "Missing" poster puts a black bar over the Mona Lisa's face.
- The end card sits in a different place in each part, and in part 3 it lies over the painting.
- Part 1 ends with the bundle under the bed.
- Hand-offs differ: P2 and P3 use full-frame amber or red colour floods, while P1 uses pale washes. The pick calls for carrier pushes and no whole-frame crossfades.

## 2. Continuity breaks

| # | Part / s | What's inconsistent | Reference | Fix |
|---|---|---|---|---|
| 1 | P2 42–44 | **Staircase redrawn.** It is flat grey with outline steps only: no stone blocks, no wall sconce, no sepia door, no nightBlue top band. A part-1 viewer won't recognise "the back staircase". | kit_12_staircase; P1 45–62 | Swap in the kit `Staircase`. Keep the glass pane with the thumbprint leaning on the steps, with the broken frame slats. |
| 2 | P2 33–34 | **Prison cell redrawn.** It is a flat grey wall with a blue-paned window and no stone blocks. P3 65–67 uses the kit cell, so the two parts' cells differ. | kit_17_cell; P3 65–67 | Swap in the kit `PrisonCell` (stone blocks, card window with ink bars, light shaft, bench). Keep the poem-lines door and the officers as part-only layers on top. |
| 3 | P2 18–20 | **Paris street redrawn.** The facades have flat tops and no gable roofs, the pavement is grey with no cobbles, and the lamp differs. Red lanterns and a red awning decorate the stage, but red should only mark the mystery. | kit_13_street; P1 63–67 | Use the kit `ParisStreet` behind the cabaret stage and postcard stand. Recolour the lanterns and awning to sepia or duskBlue. |
| 4 | P3 0 (recap) vs P2 | **The recap doesn't match part 2's pictures.** P3 opens on four hooks with a web and a spider, but P2 never shows the web or the spider: its "days turn into months" beat (60–63) is the window of seasons, and its hooks at 21 s are bare. The pick has the spider spin the web in P2 line 15. P3's other two recap flats are fine (the "?" over Paris roofs matches P2 57–58; the letter "Leonardo" matches P2 72–77). | pictures-pick 2.1; P2 21, 60–63 | Preferred: in P2, add the spider spinning a web across the four empty hooks inside 60–63, which also sets up P3 56–57. Fallback: change P3's first recap flat to P2's empty-wall queue (P2 22–25) or the trunk crack. |
| 5 | P2 65–66 | **Mona Lisa covered.** The "Missing" poster shows her greyscale with a black bar or block over her eyes and mouth. That is a prop on her face, and the pick says never. | pictures-pick 2.5 | Show the full photo on the poster, unobstructed. A sepia print is fine. Move "sigh…" off her. |
| 6 | P1 50–51 | **Mona Lisa squashed.** For "thin wooden board" the photo is squeezed horizontally into a thin sliver, so the image is distorted. | pick 2.5; kit MonaLisa `board="edge"` | Use `board="edge"`: a sepia poplar edge, with the photo never scaled on one axis. |
| 7 | P1 79–81 | **Bundle under the bed.** In the little room at night the bundle glows at the bed. The report also says "under the bed". P2's room (51–55) has her in the white trunk. | fact-check; kit_15 (trunk); P2 51–59 | Pan or reframe to the kit room's trunk or table and put the glowing bundle on or in it. That also hands off to P2's trunk. |
| 8 | P3 80 (end card) | **End card placement.** "The end" is pinned over her body and hands, in the middle of the painting. The pick says it hangs on the four hooks under her. | pick 2.7; P1 81, P2 77 | Draw the four kit hooks on the wall under her case and hang the card from them, or pin it on the wall beside her. Never on the painting. |
| 9 | All end cards | **End card position varies.** P1 is at about y 800 on the room wall, P2 at about y 200 over Geri's head, P3 mid-painting. | pick 2.7: "identical motion every part" | Use one wall position in all three, e.g. the upper third at about y 500–650, centred. |
| 10 | P2 59; P3 8, 36, 51 | **Hand-off style differs.** P2 and P3 use full-frame amber or red floods (red for Alfredo and for the arrest, amber for "before she goes home"). P1 uses pale washes at 27 and 34. Red floods break "red only marks the mystery", and the floods read as empty frames. | pick 1.4 (carrier push, no whole-frame crossfades) | Shorten each flood to under about 10 frames or replace it with a kit `CarrierPush`. Keep amber only where she is actually present. |
| 11 | P1 65–67 | **Palette.** A passer-by wears a red dress and red hat. A second white-smock, white-cap figure at 65 reads as a Vincenzo double. | palette (red = clue) | Recolour her to duskBlue or sepia. Give the baker an apron and a different hat. |
| 12 | P3 21–23, 37–41 | **Vincenzo's suit has no bowler**, and in places he looks no smaller than Geri or Poggi. | kit_00 (suit + bowler; Vincenzo 560 px vs others 640) | Add the kit bowler (in hand or on head) and check his scale. Low priority. |
| 13 | P1 31–33 | **Drips cross her face.** The white glass-fog drip lines run across her face (a white streak through it at 33). | pick 2.5 | Mask the drips so they stay outside her face area. |
| 14 | P2 12 | Newspaper photo of her is halftoned (dot screen). | kit_08 newspaper | Acceptable as newsprint. Optional: match the kit's plain print. |

## 3. Quality issues a viewer would notice

**Part 1:**
- 32–33: the label "the glass box he helped make" sits on the top edge of the caption strip. A skin-coloured hand/circle and a white bar also poke in beside the caption.
- 27 and 34: near-blank pale washes with only a caption.
- 28–29: the big ghosted "Vincenzo" lettering is washed out and hard to read.
- 80–81: the "Illustration" tag is half hidden behind the caption strip.
- 79: the "?" dot is cut by the caption strip (minor).

**Part 2:**
- 4: the "Vincenzo" name tag collides with the corner tab ("The Vincenzo t 2 of 3").
- 17 (globe zoom), 21 (bare hooks on blank paper), 56 (dark iris) and 64 (blank paper): near-empty frames.
- 54–55: the "Some say… in a trunk" honesty tag is tucked under the caption's top-left corner and is barely legible.
- 62: the caption is half-faded.
- 77: the end card covers Geri's head.

**Part 3:**
- 3: the "Florence, 1913" tag overlaps the corner tab.
- 24: a giant "false bottom" label in a much bigger type than kit labels runs off the left edge and overlaps the caption strip.
- 22, 41: captions are mid-fade (minor).
- 76–77: "who stole her smile" is greyed out for 2 s, and the ghost Vincenzo is cut by the right edge.
- 67: the calendar is cropped with a stray "onths" fragment.
- 38: a police head is cropped at the bottom-left (reads as intentional).

## 4. Known items

- **Part 1 ends with the bundle glowing under or at the bed: confirmed** (79–81, and the report says "under the bed"). This needs fixing to "somewhere in his little room": the trunk or the table, which the kit room already has. The trunk is best for the hand-off to part 2.
- **Part 1 label over the caption at about 32–33 s: confirmed** ("the glass box he helped make" on or touching the caption strip's top edge, both seconds).

## 5. Prioritised fix lists (about 20 min each, partial re-renders)

**Part 1:**
1. 79–81: move the glowing bundle onto or into the trunk (or onto the table) in the kit LittleRoom. Lift the "Illustration" tag clear of the caption, to about y 1300.
2. 32–33: raise the glass-box label to about y 1250 or into the upper third.
3. 50–51: replace the squashed photo with the kit `MonaLisa board="edge"`.
4. 31–33: mask the drips off her face.
5. 65–67: recolour the red-dressed woman and restyle the white-smock baker.

**Part 2:**
1. 42–44: kit `Staircase` in place of the self-built one.
2. 33–34: kit `PrisonCell`.
3. 65–66: remove the bar from her face on the "Missing" poster.
4. 60–63: add the spider spinning a web over the four empty hooks, so part 3's recap is earned.
5. 18–20: kit `ParisStreet` behind the cabaret, with the red lanterns and awning recoloured.
6. 54–55: move the "Some say" tag above the caption.
7. 4: delay the "Vincenzo" tag until the corner tab has left.

**Part 3:**
1. 78–80: "The end" card off the painting. Hang it on four kit hooks under her case, or pin it on the wall beside her at the shared end-card position.
2. 24: shrink the "false bottom" label to kit label size and place it above the trunk, clear of the caption.
3. 3: move the "Florence, 1913" tag clear of the corner tab.
4. 8 and 36: shorten or replace the red full-frame floods. 51 (amber) can stay if it is brief.
5. 0 (recap): no change if part 2 adds the web. Otherwise swap this flat for part 2's empty-wall queue or trunk.
6. 76–77: keep the caption opaque and bring the ghost in from the right edge.
7. Optional: Vincenzo's bowler in the suit shots.

**Across the series:** one end-card position in all three parts. Everything else is already consistent: corner tab, title plaque, "Last time…" card, caption strip position and style, palette, grade, and the hooks / "?" / gauge devices.
