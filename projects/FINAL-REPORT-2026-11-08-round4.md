# Round 4: "Caught by Wireless", a 3-part true-crime murder mystery (2026-11-08)

The 1910 Dr. Crippen case, in three animated Reels of about 85 s each, made in separate cloud sessions (one per part plus
a shared kit), as Matthew asked. It ran unattended: case choice, research, scripts, a fact and tone check, pictures, the
kit, voice, animation, sound, checks, continuity fixes and delivery. Nothing was posted or uploaded. Each MP4 is
git-ignored and was delivered from the session that built it; the highest version is the final.

## The series

| | Part 1: The missing singer | Part 2: The chase | Part 3: The verdict |
|---|---|---|---|
| Final file | `wireless-1/renders/wireless-1_v1.2.mp4` | `wireless-2/renders/wireless-2_v1.2.mp4` | `wireless-3/renders/wireless-3_v1.2.mp4` |
| Session | Series: Caught by Wireless, part 1 | … part 2 | … part 3 |
| Length | 88.1 s | 86.4 s | 84.1 s |
| Script | 232 words, grade 3.5 | 246 words, grade 3.8 | 243 words, grade 3.2 |
| Loudness / peak | -14.0 LUFS / -3.1 dBTP | -14.0 / -2.8 | -14.2 / -1.8 |
| Voice over music | 10.5 dB | ~10 dB | 9.9 dB |
| Motion check | pass, 24 vs 18 | pass, 19 vs 18 | pass, 20 vs 18 (end-card hold flagged) |
| Mute test | 2 judges, all claims after fixes | 2 judges; pilot reveal ringed | 2 judges, all claims after fixes |
| Story | London 1910. Cora, a lively music-hall singer, says goodbye from her front steps and is never seen again. The doctor's changing stories, Ethel seen in Cora's brooch, friends go to Scotland Yard, Chief Inspector Dew's visit and cellar tour, the house found empty, police lamps on a closed cellar floor. Ends: "Next: the chase" | Recap from part 1's own pictures. The shave, Ethel's boy disguise, "Mr. Robinson and son" on the Montrose. Captain Kendall's suspicions, the wireless message, Dew on the faster Laurentic, the world reading the race while the doctor doesn't know, the pilot boat on the St. Lawrence. Ends on the false pilot | Opens on part 2's last frame. Dew's "Good morning, Doctor Crippen" (clean-shaven Crippen, per the trial record). The Old Bailey: an unusual drug, the pajama label; guilty, put to death (no imagery); Ethel found not guilty, walking out in daylight. The 2007 DNA twist with "no match?" / "maybe wrong?". Ends: "The end" |

**Shared by all three:**
- **Look:** "Wireless Night", a 1910 wire-photo world of slate and fog with halftone dots. Spark cyan is the thing to follow, Cora rose is Cora's colour, and clue yellow is never a flood. It is deliberately unlike the Stolen Smile's toy theatre.
- **Recurring devices:** the Spark, the runaway Moustache (a gag, never his face after the shave), Cora's Feather, and The Daily Wire newspaper.
- **Cards and recaps:** the same title plaque (settled by 4 s) and telegram end card (top at y 560), and recaps built from the previous part's real frames.
- **Sound:** the same AI voice (design-m2, seed 7), Floating Cities (CC BY 4.0) at about 10 dB under the voice in every part, and the kit's series sounds.
- **Captions:** each part has a draft caption with caveats in its REPORT.md and in `wireless-kit/factcheck.md`.

## Care

Kid-safe throughout, checked by a tone checker and then three judges:
- The remains are never shown; only lamps on a closed cellar floor.
- Cora is shown warmly, and never as a ghost.
- Ethel is never shown as a culprit, and never behind bars.
- There is no execution imagery.
- The DNA result is never presented as proof.

## How it ran (UTC, Nov 8)

| Step | When |
|---|---|
| Taste note; series brief made reusable with the Stolen Smile lessons | 02:58 |
| Research (Crippen chosen over the Stratton fingerprint case and the Brides in the Bath) | 02:58–03:09 |
| Scripts, fact + tone check, brainstorm, pick (in parallel) | 03:09–03:24 |
| Three part sessions (03:22), then the kit session (03:24) | |
| Kit READY (28 min) | 03:52 |
| Early continuity + accuracy judge on part 3's first sheet → fixes to all three parts before they finished | 04:14–04:25 |
| v1: part 2 / part 3 / part 1 | 04:17 / 04:20 / 04:51 |
| v1.1 from the early judge: part 2 / part 3 | 04:29 / 04:43 |
| Final judge on all three: 8/10, "done" → small polish pass | 04:51–04:57 |
| v1.2 polish: part 2 / part 3 / part 1 | 05:00 / 05:06 / 05:08 |
| **Total, start to finals** | **02:58–05:08, 2 h 10 min** (all v1s by 1 h 53 min) |

## Tokens (session usage counters)

| Session | Output | Cache read | Cost (list) |
|---|---|---|---|
| Orchestrator, round-4 share (incl. research, fact/tone check, brainstorm, pick, 2 judges) | ~288,000 | ~92 M | ~$35 |
| Kit | 176,572 | 23.7 M | $10.71 |
| Part 1 | 237,255 | 87.9 M | $27.56 |
| Part 2 | 236,129 | 87.6 M | $27.29 |
| Part 3 | 222,477 | 97.4 M | $28.82 |
| **Round 4 total** | **~1.16 M** | **~389 M** | **~$129** |

The orchestrator's round-4 share also includes the cancelled re-render request between the rounds.

Round 4 cost more than round 3 (~$86) for three reasons:
- **Longer parts:** about 86 s against 80 s.
- **Three passes per part:** v1, v1.1 and v1.2, against two in round 3.
- **Very large build contexts:** each part session read 88–97 M cached tokens.

The cheaper path next time is to apply the early-judge rules to part 1 at the start (they are now in the brief), which
would remove most of the v1.1 work.

## Errors, rewrites and decisions

**Orchestrator**
- **Case choice:** Crippen over the Stratton brothers (violent, no chase) and the Brides in the Bath (can't be told without the deaths).
- **Length trims:** parts 2 and 3 were 246–262 words (over the 90 s ceiling) and were trimmed to about 240.
- **Fact + tone check:** 4 lines were wrong as worded:
  - "Everyone knew, except the doctor": false. Crippen was told on board that the captain knew. Rewritten as "had no idea Inspector Dew was racing to get there first".
  - "near Canada" → "on a big river in Canada".
  - "A pilot climbed aboard" → "A man dressed as a ship's pilot" (a real pilot came aboard too).
  - "it all came down to… one message" → "caught thanks to a sharp-eyed captain and a message" (the conviction rested on the forensic evidence).
- **Precision rewords:**
  - "doctor" → "a man everyone called Doctor Crippen".
  - "Chief Inspector".
  - "traces of a rare drug" → "an unusual, dangerous drug".
  - DNA "Cora's family" → "people believed to be Cora's family".
  - "radio" → "wireless".
- **Kindness rewords:** Ethel "was seen wearing" the jewellery, and "like a couple" was dropped.
- **Care fix from the pick:** part 3 said "the remains" twice, so line 9 became "And with them…". Part 3 regenerated that one voice line.
- **Early judge (new this round, on the first delivered part):**
  - Part 3 had kept Crippen's moustache from the arrest on. Dew testified "he was then clean shaven", so it was fixed.
  - The judge figure read as a hooded ghost under "put to death".
  - Ethel was faded behind a grid.
  - Labels sat on faces or were too small; there were full-frame pages, empty frames, a short end-card hold and dissolves.
  - The voice-to-music gap differed between parts (7.6 vs ~10 dB), so the standard became 10 dB.
- **Final judge, 8/10:**
  - Part 1 had a blank face in No. 39's window that could read as Cora's ghost; it was replaced by the house cat.
  - The pilot-to-Dew reveal was still a crossfade; it was replaced with a whip.
  - Part 2's recap date ran backwards (31 → 16 July); it now runs 11 → 16 July.
  - Smaller full-frame map, end-card hold, small labels.

**Builder sessions (full lists in each REPORT.md)**
- **All three parts:**
  - Each used +10 dB music, not the brief's +12, to get the 10 dB gap.
  - Kit lint was clean in every part, so there were no local redraws this time; last series, a part redrew three sets.
- **Part 2:** built its recap from the pick before part 1 had stills, then matched it later. The second mute judge still missed the pilot reveal, so it was circled on screen.
- **Part 3:** went first and so got the early-judge fixes.
- **Part 1:** a night→day crossfade was swapped for a lights-out and dawn wipe.
- **Kit:** added a DeckChair after READY, which no part used.

## Open (polish only; nothing blocks)
1. **Nobody has listened to any mix.** Each REPORT.md lists the moments to listen to.
2. **Kit characters are fairly plain, stiff puppets.** Acting comes from poses and the devices more than from faces.
3. **Part 2:** the pilot reveal is circled on screen, but the second mute judge missed it in v1, and there was no third judge.
4. **Part 3:** at about 59 s the 2007 page fills much of the frame for about 0.3 s.

## Lessons (applied for next time where noted)
- Judging continuity on the first delivered part works: most v1.1 fixes reached part 1 before it rendered. Next: also give a fresh judge the KitSheet before READY, so kit-level issues are caught once.
- Put the voice-to-music gap (10 dB measured from stems) in the brief, not a gain number. Not yet applied.
- Scripts for series parts: aim for 225–235 words for an 85 s part with this voice. Not yet applied.
