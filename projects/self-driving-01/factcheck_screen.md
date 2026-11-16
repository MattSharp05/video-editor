# Self-driving 01: fact-check of on-screen text (2026-11-16)

Fresh check of every on-screen label, source line, counter, tag and map dot **as worded**. Builds on
`research.md` and `factcheck.md` (spoken lines); re-verified at the source only where the on-screen wording
differs or the fact can move (waymo.com/rides, waymo.com/waymo-driver, Waymo city status, Tesla camera layout).
Pages read 2026-11-16 unless dated otherwise.

Verdict summary: 9 OK, 3 REWORD, 0 CUT.

| # | On-screen text | Verdict | Replacement |
|---|---|---|---|
| 1 | DARPA Grand Challenge, 2004 / No vehicle finished the course | OK | |
| 2 | Waymo: 500,000+ fully driverless rides a week / Alphabet, April 2026 | REWORD | Waymo: 500,000+ fully autonomous rides a week / Alphabet, April 2026 |
| 3 | There and back to you: about 60 billionths of a second / Light travels about 30 cm a billionth of a second | REWORD | To you and back: about 60 billionths of a second (source line unchanged) |
| 4 | Waymo: 20 billion+ miles in simulation / waymo.com | OK | |
| 5 | Tesla FSD: cameras only, no lidar / Tesla | OK | |
| 6 | FSD (Supervised): the driver must watch the road / Tesla, Q3 2026 update | OK | |
| 7 | Some Tesla robotaxis in Texas: no employee on board / CNBC, Jan 2026; Tesla, 2026 | OK | |
| 8 | Waymo rides with no driver: parts of 15 US metros / waymo.com, Nov 2026 | OK | |
| 9 | Counter "0 → 20 billion miles of practice" | OK | |
| 10 | Illustration tags (PEDESTRIAN, BIKE · 11 MPH, RED LIGHT, SPEED LIMIT 25, CROSSING · LIKELY, DRIVER, NO ONE AT THE WHEEL, ILLUSTRATION) | OK | |
| 11 | Map: 15 Waymo metro dots | OK (with note) | Optional: none needed; see note on Denver and Las Vegas |
| 12 | Tesla with 8 camera cones: 3 windscreen, 2 B-pillar, 2 fender, 1 rear | REWORD (drawing) | 2 windscreen, 1 front bumper, 2 B-pillar, 2 fender, 1 rear (still 8) |

---

## Item by item

### 1. "DARPA Grand Challenge, 2004" / "No vehicle finished the course" — OK
No vehicle finished; best was CMU's Sandstorm at about 7.3–7.4 miles of a ~142-mile course.
- https://www.darpa.mil/news/2014/grand-challenge-ten-years-later (DARPA, 2014-03-13)
- https://en.wikipedia.org/wiki/DARPA_Grand_Challenge_(2004)

### 2. "Waymo: 500,000+ fully driverless rides a week" / "Alphabet, April 2026" — REWORD
Source quote (Sundar Pichai, Alphabet Q1 2026 earnings release, 2026-04-29): "I'm pleased to see Waymo surpass
500,000 fully autonomous rides a week."
https://www.sec.gov/Archives/edgar/data/0001652044/000165204426000043/googexhibit991q12026.htm
The figure, the "+" and the date are right. Because the grey line credits Alphabet, the label should use
Alphabet's word: "fully autonomous" (same character count as "fully driverless"). The fact itself is not wrong;
this is about fidelity to a quoted source. No newer official weekly figure found; don't update to "now" or 1M.
**Replacement: "Waymo: 500,000+ fully autonomous rides a week"**

### 3. "There and back to you: about 60 billionths of a second" — REWORD (wording only; numbers OK)
- Maths: c = 299,792,458 m/s = 29.98 cm per nanosecond (air index ~1.0003, negligible). Round trip 17.3 m
  (2 × 8.6 m = 17.2 m; ~17.3 m with the shoulder offset) ÷ 0.2998 m/ns = 57.7 ns, so "about 60 billionths of a
  second" is a fair round. Source line "Light travels about 30 cm a billionth of a second" is correct.
  (NIST/CODATA defined value of c: https://physics.nist.gov/cgi-bin/cuu/Value?c)
- Problem is the phrase: "There and back to you" reads as if the trip *ends* at the pedestrian. The pulse goes
  from the roof to you and back to the car.
**Replacement: "To you and back: about 60 billionths of a second"** (shorter).
- Keep the "ILLUSTRATION" tag; the distance is a drawing, not a measured scene.

### 4. "Waymo: 20 billion+ miles in simulation" / "waymo.com" — OK
waymo.com/waymo-driver (read 2026-11-16): "We've driven more than 20 billion miles in simulation…"
https://waymo.com/waymo-driver/

### 5. "Tesla FSD: cameras only, no lidar" / "Tesla" — OK
- Tesla's support page "Transitioning to Tesla Vision": "In 2021, we began our transition to Tesla Vision by
  removing radar from Model 3 and Model Y, followed by Model S and Model X in 2022" (camera-based system).
  https://www.tesla.com/support/transitioning-tesla-vision (page returns 403 to automated fetch; text read via
  search index of tesla.com regional copies, e.g. https://www.tesla.com/en_au/support/transitioning-tesla-vision).
- No Tesla car has ever shipped lidar for FSD. The label does not say "no radar", which is right (some reports
  of HD-radar hardware on newer S/X; unverified). Medium-High confidence (Tesla primary, not dated).

### 6. "FSD (Supervised): the driver must watch the road" / "Tesla, Q3 2026 update" — OK
Tesla Q3 2026 Update (2026-10-21): FSD (Supervised) "Active driver supervision required; does not make the
vehicle autonomous." "Must watch the road" is a fair plain-English rendering.
https://www.sec.gov/Archives/edgar/data/0001318605/000162828026066738/exhibit9914.htm

### 7. "Some Tesla robotaxis in Texas: no employee on board" / "CNBC, Jan 2026; Tesla, 2026" — OK
- CNBC 2026-01-22: Tesla running "a small number of its Robotaxi vehicles in Austin, Texas, without a human driver
  or safety supervisor on board."
  https://www.cnbc.com/2026/01/22/musk-says-tesla-takes-safety-supervisors-out-of-some-austin-robotaxis.html
- Tesla Q3 2026 Update: "nearly two million cumulative unsupervised miles" for Robotaxi (link as item 6).
- "Some" and "on board" are the right limits: share of fleet undisclosed; remote operators can drive (Electrek
  2026-10-15, NHTSA SGO data). Optional tightening if space allows: "Tesla Q3 2026" instead of "Tesla, 2026"
  (is 2 characters longer, so not required).

### 8. "Waymo rides with no driver: parts of 15 US metros" / "waymo.com, Nov 2026" — OK
waymo.com/rides (read 2026-11-16) lists 15 metros under "Serving Riders In" and calls the service "available
24/7 to the public now". "Parts of" correctly signals service areas, not whole cities. See item 11 for access.
https://waymo.com/rides/

### 9. Counter "0 → 20 billion miles of practice" — OK
Matches waymo.com/waymo-driver ("more than 20 billion miles in simulation"); the spoken line names simulation and
item 4 labels it, so "practice" will not be read as road miles. Stopping at 20 billion understates "more than",
which is the safe direction. Make sure the counter stops at 20 billion (never overshoots or keeps rolling).

### 10. Illustration tags — OK
- PEDESTRIAN, RED LIGHT, SPEED LIMIT 25: generic perception/scene labels; Waymo's cameras detect "traffic light
  colors" and signs (waymo.com/waymo-driver). 25 mph is a common US urban limit. Fine under "ILLUSTRATION".
- BIKE · 11 MPH: illustrative; radar measures "an object's distance and speed" (waymo.com/waymo-driver). Fine.
- CROSSING · LIKELY: matches Waymo's "anticipate what other road users might do"; "LIKELY" signals a prediction,
  not a fact. Good.
- DRIVER: on a customer Tesla with FSD (Supervised) — correct (item 6).
- NO ONE AT THE WHEEL (empty-front-seat Tesla robotaxi during the Texas line): literally true of Tesla's
  unsupervised robotaxis (CNBC 2026-01-22). Keep it on a Texas-context shot only; never on a Bay Area Tesla
  (safety driver in the seat there). It does not claim "no human involved", so remote operators are not
  contradicted.
- ILLUSTRATION on all sensor drawings: required and present.

### 11. Map: 15 Waymo metro dots — OK, with a note
- waymo.com/rides "Serving Riders In" (read 2026-11-16): Atlanta (Ride on Uber), Austin (Ride on Uber), Dallas,
  Denver, Houston, Las Vegas, Los Angeles, Miami, Nashville, Orlando, Phoenix, San Antonio, San Diego, San
  Francisco Bay Area, Tampa. **Exactly the 15 on the map; no extras, none missing.**
- Not fully open to everyone (latest reporting found):
  - **Las Vegas**: public riders invited "on a rolling basis" from mid-Sept 2026; Waymo: "as we work toward
    opening our service to everyone." https://waymo.com/blog/2026/09/ride-in-las-vegas (Sept 2026);
    https://techcrunch.com/2026/09/14/waymo-opens-robotaxi-service-in-las-vegas/
  - **Denver**: launched 2026-09-01 with rolling invites from a waitlist, a couple dozen cars, select
    neighbourhoods. https://www.axios.com/local/denver/2026/09/01/waymo-launches-denver ;
    https://denverite.com/2026/09/11/how-many-waymos-in-denver/ (2026-09-11). Waymo's 2026-10-14 "open to
    everyone" post covered San Antonio, San Diego and Tampa only, not Denver
    (https://waymo.com/blog/shorts/sat-sd-tpa/). No later "open to everyone" for Denver or Las Vegas found.
  - **Atlanta, Austin**: public, but booked only through Uber.
- Fairness of "rides with no driver": yes. In all 15, members of the public (invited or not) ride with nobody in
  the driver's seat; the label claims driverless rides in parts of the metros, not open access for everyone.
  If a viewer-facing nuance is wanted, dim Denver and Las Vegas slightly; not required for accuracy.

### 12. Tesla with 8 camera cones (3 windscreen, 2 B-pillar, 2 fender, 1 rear) — REWORD (redraw)
- The 3-windscreen layout is the older (HW3, ~2017–2023 Model 3/Y) arrangement. Current Tesla owner's manuals
  (Model Y, Cybertruck) say: "Two cameras are mounted to the windshield above the rear view mirror", "A camera is
  mounted in each door pillar", "A camera is mounted to each front fender", and the current Model Y adds "A camera
  is mounted above the grille on the front bumper", plus the rear camera above the licence plate.
  https://www.tesla.com/ownersmanual/modely/en_cl/GUID-682FF4A7-D083-4C95-925A-5EE3752F4865.html
  (Tesla manual; 403 to direct fetch, text read via search index; Medium-High).
- The robotaxi and current FSD fleet are current Model Ys, so the drawing should match them. Count stays 8.
**Replacement drawing: 2 windscreen (forward), 1 front bumper (forward, low), 2 B-pillar (side), 2 front fender
(rear-facing), 1 rear.** If redrawing is costly, the old layout under "ILLUSTRATION" is defensible for an older
Tesla, but don't put "8 cameras" in text either way (research.md: say "about eight").

---

## Sources (read 2026-11-16 unless dated)
- https://waymo.com/rides/
- https://waymo.com/waymo-driver/
- https://waymo.com/blog/shorts/sat-sd-tpa/ (2026-10-14)
- https://waymo.com/blog/2026/09/ride-in-las-vegas (Sept 2026)
- https://techcrunch.com/2026/09/14/waymo-opens-robotaxi-service-in-las-vegas/
- https://www.axios.com/local/denver/2026/09/01/waymo-launches-denver
- https://denverite.com/2026/09/11/how-many-waymos-in-denver/
- https://www.sec.gov/Archives/edgar/data/0001652044/000165204426000043/googexhibit991q12026.htm (2026-04-29)
- https://www.sec.gov/Archives/edgar/data/0001318605/000162828026066738/exhibit9914.htm (2026-10-21)
- https://www.cnbc.com/2026/01/22/musk-says-tesla-takes-safety-supervisors-out-of-some-austin-robotaxis.html
- https://www.tesla.com/support/transitioning-tesla-vision
- https://www.tesla.com/ownersmanual/modely/en_cl/GUID-682FF4A7-D083-4C95-925A-5EE3752F4865.html
- https://www.darpa.mil/news/2014/grand-challenge-ten-years-later
- https://physics.nist.gov/cgi-bin/cuu/Value?c
