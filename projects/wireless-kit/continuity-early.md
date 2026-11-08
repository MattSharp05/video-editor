# Caught by Wireless: early continuity + accuracy judge on part 3 v1 (fresh agent, 2026-11-08)

I judged part 3 from `wireless-3/stills/sheet_1fps.jpg` alone (12×7 grid, 1 frame per second, 0–83 s, small frames). There are no hero stills. Parts 1 and 2 have no stills yet, so I couldn't check them, and I couldn't confirm that part 2 really shows the two recap pictures. The kit lint is clean: there are no local redraws of kit items. The plaque is fully readable at 4 s (half-burned at 3 s), the tab shows from 0 s, and the recap uses only RaceOvertake and LadderShadow.

**PART 3 FIXES, most important first**
1. **The doctor's look (19 s, then 25–47 s).** The PLAN fix gives him the big flying Moustache for good from the arrest on. That is wrong for the arrest: he was clean-shaven. It also turns the cartoon Moustache into his real face, which the pick rules out. Let the Moustache land at 19 s as the tagged gag, then hop off on "The chase was over" (perch on the race-map token or Dew's notebook). From 25 s ("Back in London") and in the dock, use Crippen B with hat off and a bare lip. That also matches the arrested man, which was what the mute-test judge flagged. Fix the stale comment at `scenesA.tsx:292` ("no moustache now" while the code says `moustache="on"`).
2. **The judge (32–47 s)** is a white hood with a dot face. Under "put to death" (45 s) it can read as a ghost or a hooded figure. Give it wig curls and a face, in the dark navy (`deep`) fill.
3. **Tag over a face:** "Some say…" sits across the left expert's head at 68 and 71 s. Move it clear of faces, at y 1150–1250.
4. **Labels in the caption band:** "jury: yes" and "still arguing" run into the caption line at 77 s. Keep them at y ≤ 1250.
5. **Captions over things:** at 52 s "and went free" sits on Ethel's face; at 62 s "a tiny sample" sits on the "Trial sample" box label; at 73 s the caption crosses the right expert's head.
6. **End card hold is under 2 s.** "THE END" types at about 82 s and the film ends at 83.14 s. Add about 1 s of tail (the total stays under 89 s). At 82 s the card also hides the Feather's lower half: lift the Feather or the star so the tip-to-star touch reads.
7. **Full-frame paper:** the paper colour fills about 90–100% of the frame at 1 s (Daily Wire), 20–21 s (race map) and 59 s (2007 page). The limit is 75% with world around it, so pull back to show the sea, sky or desk. At 20 s there is also a stray "Illustration" tag on the map.
8. **Near-empty frames:** 25 s (the doctor alone on a blank map), 30 s (sky with the dome at the bottom), 53–56 s (dark sea, small Spark; "police" is unreadable) and 80 s (just a wire and a dot). Add the ship, quay, mast or crowd.
9. **Text too small to read on a phone:** "scientist", "Drug found", "bought by the doctor", "pajama piece", "the doctor's shop", "people believed to be Cora's family" and "police". Aim for ≥ 34 px. At 32–36 s the "scientist" and "Drug found" labels overlap each other, and at 66 s "no match?" covers the screen label.
10. **Odd scale and crops:** at 28 s the doctor stands on the Old Bailey roof. At 19 s Dew's face is cut by the left edge.
11. **Dissolves** (the series bans crossfades): a doubled bowler and see-through Dew at 12 s. At 48 s Ethel is a faded ghost behind a door grid that reads as bars. That is a care risk, so bring her in solid and in daylight.
12. **Other overlaps:** the Daily Wire covers the corner tab at 44–47 s, and its masthead letters are cut by the plaque at 9–10 s. At 11 s a flying sheet crosses the pilot.

**FOR PARTS 1 AND 2**
- **Crippen's look by scene:**
  - Part 1, London up to 8 July: Crippen A, with glasses and the heavy moustache.
  - Part 2, from the razor scene (9 July) to the Montrose: Crippen B, bare lip, no glasses, felt hat. Faint stubble is optional ("growing a beard" is Kendall's commonly quoted wire, unverified).
  - Part 2's "Moustache tries itself on Robinson's face": Kendall really did this on a newspaper photo (he chalked out the moustache and glasses). Stage it on the photo, or tag it "Illustration".
  - The runaway Moustache is never his own facial hair after the shave.
- **Hand-off:** part 3 opens on the pilot mid-climb with the sun disc, not an extreme brim close-up. Part 2's last frame must match it, or part 3 adds the brim close-up at frame 0. Part 2 must commit `stills/R4.jpg` and `R5.jpg`; part 1 must commit R1–R3.
- **Avoid part 3's repeat breaks:**
  - full-frame paper pages (part 2's race map and its flock of papers especially);
  - tags or captions on faces, and labels below y 1250;
  - labels under 34 px;
  - empty dark frames during the wireless hops (keep a ship, coast or gulls in frame);
  - dissolves;
  - the Daily Wire over the corner tab;
  - an end card held under 2 s.
- **Care:** in part 1 the cellar is lamps on a closed floor only, Cora is warm, and nothing scary. Ethel is never behind bars or a grid, and never ringed.

**ACCURACY: THE MOUSTACHE**
- **Arrest, 31 July:** clean-shaven, and safe to say. Dew's trial evidence reads: "On deck I saw prisoner; he was then clean shaven." Crippen's own statement says he fled "shaving off my moustache, leaving off wearing glasses in public". On 8 July Dew saw him "wearing a heavy moustache". All three are in the Old Bailey record t19101011-74 (dhi.ac.uk API, the factcheck's OB-C). So the PLAN's "moustache on from the arrest" is wrong for 19–24 s.
- **Trial, October:** not verified. The trial record never says he regrew it. One search result summary claimed "he had regrown his distinctive moustache", but I couldn't trace it to a source I could open. A real photograph taken secretly in court exists (Arthur Barrett, 1910, Wellcome Collection work a34e8y85), but its catalogue text doesn't describe him and the image is access-restricted (401). The Papers Past and LOC pages wouldn't load from here. About 14 weeks between shaving and the trial makes regrowth plausible, but I couldn't confirm it. The safe choice is a bare lip in London and the dock: it matches the only verified description and claims nothing. Show a moustache in the dock only if someone sees a dated court picture first.

Sources opened: dhi.ac.uk Old Bailey t19101011-74; wellcomecollection.org/works/a34e8y85 (and its API); utterlyinteresting.com/post/dr-crippen-and-the-murder-of-cora-crippen (says the wire reported "a beard was growing"; nothing on the trial). I edited no files.
