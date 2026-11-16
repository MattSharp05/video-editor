# Self-driving 01: fact-check of script v1 (2026-11-16)

Fresh check of every spoken line in `script.md` **as worded**, re-verified at primary sources where they
exist (waymo.com, Alphabet and Tesla SEC exhibits), secondary where not. All pages read 2026-11-16.

Verdict summary: 5 OK, 5 REWORD, 0 CUT.

| # | Spoken line (v1) | Verdict | Replacement (if any) |
|---|---|---|---|
| 1 | There's nobody driving this car. So how does it see you? | OK | |
| 2 | In 2004, not one robot car could finish a desert race. This year, Waymo passed half a million rides a week, with nobody at the wheel. | OK | |
| 3 | First, the car has to see you. On its roof, lidar fires laser pulses and times each bounce, building a 3D picture of the street. | OK | |
| 4 | Radar tracks speed, even in rain. Cameras read traffic lights and signs. | OK | |
| 5 | But seeing isn't enough. It predicts where every person, bike and car might go next. | REWORD | But seeing isn't enough. It guesses where the people, bikes and cars around it might go next. |
| 6 | Then it plans a path around all of them, again and again as they move. | OK | |
| 7 | It practised over 20 billion miles in simulation. | REWORD | Waymo has practised over 20 billion miles in simulation. |
| 8 | Tesla bet differently: cameras only, no lidar, and one neural network that turns video into steering. | REWORD | Tesla bet differently: cameras only, no lidar, and one neural network that turns video into driving. |
| 9 | Most Teslas still need a driver watching. But some Tesla robotaxis in Texas now run with no employee on board. | REWORD | Teslas people buy still need a driver watching. But some Tesla robotaxis in Texas now run with no employee on board. |
| 10 | So, is it cracked? Not everywhere. But in about 15 US cities, a car with nobody inside already sees you, guesses your next step, and drives around you. | REWORD | So, is it solved? Not yet. But in parts of about 15 US cities, a car with no driver already sees you, guesses your next step, and drives around you. |

Word count after rewording: about +5 words (≈ +2 s at 2.9 words/s). If time is tight, line 7 can go back to
"It practised…" only if line 6's picture makes clear it is still the Waymo car.

---

## Line by line

### 1. "There's nobody driving this car. So how does it see you?" — OK
- Waymo runs fully driverless rides with no one in the driver's seat; Alphabet calls them "fully autonomous
  rides" (see line 2). The software does the driving, so "nobody driving" is the normal plain-English sense.
- Implication: the car on screen is a Waymo-type robotaxi with an empty driver's seat. True for Waymo's public
  service. Do not show a Tesla-branded car here (Tesla's fleets are mixed; some still carry a monitor or driver).
- On-screen label: "Illustration".

### 2. 2004 race + "half a million rides a week, with nobody at the wheel" — OK
- 2004 DARPA Grand Challenge: no vehicle finished; best (CMU Sandstorm) about 7.3–7.5 miles of ~142–150.
  DARPA retrospective: https://www.darpa.mil/news/2014/grand-challenge-ten-years-later (2014-03-13);
  https://en.wikipedia.org/wiki/DARPA_Grand_Challenge_(2004). "Not one … could finish" holds.
- Sundar Pichai, Alphabet Q1 2026 release (2026-04-29): "I'm pleased to see Waymo surpass 500,000 fully
  autonomous rides a week."
  https://www.sec.gov/Archives/edgar/data/0001652044/000165204426000043/googexhibit991q12026.htm
  Press put the milestone in late March 2026; Feb 2026 reports were ~400k, so it was passed in 2026:
  "This year" holds. https://insideevs.com/news/791245/waymo-rides-per-week-2026-doubled/
- Implied claim "all those rides have nobody at the wheel": true for Waymo; Pichai's figure is *fully
  autonomous* rides.
- Not "now": no newer official weekly figure found as of 2026-11-16 (the 1M/week end-2026 goal is unconfirmed).
  Do not say or show "1 million".
- On-screen labels: "DARPA Grand Challenge, 2004"; "Waymo, ~500k rides/week (Alphabet, April 2026)".

### 3. Lidar on the roof, "times each bounce", 3D picture — OK
- waymo.com/waymo-driver: lidar emits laser pulses and the system "measure[s] how long it takes for them to bounce
  back off objects" to build a 3D view. https://waymo.com/waymo-driver/ (read 2026-11-16).
- "On its roof" is true (the roof dome holds the main lidar) but not exclusive: Waymo also has lidars around the
  body. The line doesn't say "only", so it stands; the picture may show pulses from the roof dome.
- No spin rate or points-per-second figure: keep numbers off screen.
- On-screen label: "Illustration" (point cloud is stylised).

### 4. "Radar tracks speed, even in rain. Cameras read traffic lights and signs." — OK
- waymo.com/waymo-driver: radar gives "an object's distance and speed"; "Radar is effective in rain, fog, and snow."
  Cameras "can spot traffic lights, construction zones, and other scene objects"; the Driver "responds to signs and
  signals, like traffic light colors and temporary stop signs." https://waymo.com/waymo-driver/
- "Even in rain" is exactly Waymo's wording (it works in rain, not "perfectly in any storm").

### 5. "It predicts where every person, bike and car might go next." — REWORD
- Waymo: the system "leverages AI to anticipate what other road users might do."
  https://waymo.com/waymo-driver/
- "Every" overstates: it can only predict road users it has detected, near it. Replacement:
  **"But seeing isn't enough. It guesses where the people, bikes and cars around it might go next."**
  ("guesses" also matches line 10's "guesses your next step".)

### 6. "Then it plans a path around all of them, again and again as they move." — OK
- Waymo: "uses AI to plan the best action or route to take." https://waymo.com/waymo-driver/
- "Again and again" is safe; no current Waymo update rate exists, so don't put "10×/second" on screen.
- On-screen label: "Illustration".

### 7. "It practised over 20 billion miles in simulation." — REWORD
- Figure is right: "We've driven more than 20 billion miles in simulation." https://waymo.com/waymo-driver/
- Problem is "It": lines 3–6 speak of "the car" generically, so "it" reads as this one car, or as any
  self-driving car (Tesla comes next). The 20 billion is Waymo's whole system. Replacement:
  **"Waymo has practised over 20 billion miles in simulation."**
- On-screen label: "Waymo, 20B+ simulated miles".

### 8. "…one neural network that turns video into steering." — REWORD
- Cameras only / no lidar: FSD drives on cameras; no lidar (Tesla vision-only since 2021). Holds. (Some newer
  Teslas carry radar hardware, so don't add "no radar".)
- One network: FSD v12 release notes (as quoted by press): "upgrades the city-streets driving stack to a single
  end-to-end neural network trained on millions of video clips"; Musk: "video in, control out".
  https://driveteslacanada.ca/news/tesla-begins-public-roll-out-of-fsd-beta-v12-2023-44-30-12 (Medium: Tesla's
  own notes quoted by press; the Q3 2026 Update does not describe the architecture).
- "Into steering" undersells it: the network outputs steering *and* speed/braking. Replacement:
  **"Tesla bet differently: cameras only, no lidar, and one neural network that turns video into driving."**
- Picture: "video in, wheel turns" is fine; add pedals/speed if it's cheap.

### 9. "Most Teslas still need a driver watching. But some Tesla robotaxis in Texas now run with no employee on board." — REWORD (first sentence)
- Tesla Q3 2026 Update (2026-10-21): FSD (Supervised) "Active driver supervision required; does not make the
  vehicle autonomous." https://www.sec.gov/Archives/edgar/data/0001318605/000162828026066738/exhibit9914.htm
- "Most Teslas" implies some customer Teslas don't need a driver. None do; only Tesla's own robotaxis run
  unsupervised. Replacement: **"Teslas people buy still need a driver watching."**
- Second sentence OK as worded:
  - CNBC 2026-01-22: "a small number of its Robotaxi vehicles in Austin, Texas, without a human driver or
    safety supervisor on board"; Elluswamy: "a few unsupervised vehicles mixed in with the broader robotaxi fleet".
    https://www.cnbc.com/2026/01/22/musk-says-tesla-takes-safety-supervisors-out-of-some-austin-robotaxis.html
  - Dallas and Houston launched 2026-04-18, reported without in-car monitors, small geofences.
    https://electrek.co/2026/04/18/tesla-robotaxi-launches-dallas-houston-small-geofences/
  - Tesla Q3 2026 Update: "nearly two million cumulative unsupervised miles" for Robotaxi.
  - "Some" and "on board" are the right words: Tesla doesn't disclose the share, and remote operators can drive
    (Electrek 2026-10-15, NHTSA SGO data), so never "no humans involved". "In Texas" is true, not exclusive
    (Florida too). "Now" holds as of Nov 2026.
- On-screen label for the empty-seat Tesla shot: "Some Tesla robotaxis, Texas, 2026 (share not disclosed)".

### 10. "So, is it cracked? Not everywhere. But in about 15 US cities, a car with nobody inside…" — REWORD
- "A car with nobody inside" is false: riders are inside. Say "no driver".
- "Is it cracked? Not everywhere." implies it *is* cracked in those cities; research warns "cracked/solved" is
  an overclaim (geofenced service areas, an open NHTSA school-bus recall query RQ26006 opened 2026-11-06, and the
  Santa Monica child-strike probe PE26001). "Not yet" is the honest answer.
- "About 15 US cities": waymo.com/rides lists 15 metros serving riders (Atlanta, Austin, Dallas, Denver, Houston,
  Las Vegas, Los Angeles, Miami, Nashville, Orlando, Phoenix, San Antonio, San Diego, SF Bay Area, Tampa).
  https://waymo.com/rides/ (read 2026-11-16). But service covers zones, not whole cities, and Denver/Las Vegas are
  reported as gradual/invite. Add "parts of".
- Replacement: **"So, is it solved? Not yet. But in parts of about 15 US cities, a car with no driver already sees
  you, guesses your next step, and drives around you."**
- On-screen label: "Waymo service areas, 15 US metros (Nov 2026)".

---

## Suggested on-screen labels (all accurate as of 2026-11-16)

| Shot | Label |
|---|---|
| Any stylised robotaxi / sensor / prediction / path animation (lines 1, 3–6, 10) | Illustration |
| 2004 desert race | DARPA Grand Challenge, 2004 |
| Half a million rides | Waymo: 500k+ rides a week (Alphabet, April 2026) |
| Simulation | Waymo: 20B+ miles in simulation |
| Tesla camera views | Tesla FSD: cameras only |
| Hand-on-wheel Tesla | FSD (Supervised): driver must watch |
| Empty-seat Tesla robotaxi | Some Tesla robotaxis, Texas, 2026 |
| Closing map | Waymo service areas, 15 US metros (Nov 2026) |

Avoid on screen: "1M rides/week", any lidar spin rate or update rate, "cracked/solved", "safer than humans"
without the Waymo-data qualifier, Cybercab "on sale".

## Sources (read 2026-11-16)
- https://waymo.com/waymo-driver/
- https://waymo.com/rides/
- https://www.sec.gov/Archives/edgar/data/0001652044/000165204426000043/googexhibit991q12026.htm (Alphabet Q1 2026, 2026-04-29)
- https://www.sec.gov/Archives/edgar/data/0001318605/000162828026066738/exhibit9914.htm (Tesla Q3 2026 Update, 2026-10-21)
- https://www.cnbc.com/2026/01/22/musk-says-tesla-takes-safety-supervisors-out-of-some-austin-robotaxis.html
- https://electrek.co/2026/04/18/tesla-robotaxi-launches-dallas-houston-small-geofences/
- https://www.darpa.mil/news/2014/grand-challenge-ten-years-later
- https://en.wikipedia.org/wiki/DARPA_Grand_Challenge_(2004)
- https://driveteslacanada.ca/news/tesla-begins-public-roll-out-of-fsd-beta-v12-2023-44-30-12
- https://insideevs.com/news/791245/waymo-rides-per-week-2026-doubled/
