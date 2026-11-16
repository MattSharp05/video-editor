# Research: "How Waymo and Tesla cracked self-driving" (60 s Instagram explainer)

Researched 2026-11-16 via web search/fetch. Primary sources (waymo.com, Tesla SEC filings, Alphabet
SEC filings, NHTSA) are preferred; secondary reporting is labelled. Confidence: **High** = primary
source read directly; **Medium** = consistent secondary reporting or primary source quoted by press;
**Low** = single secondary source, conflicting reports, or unverified.

> Framing warning for the script: "cracked" is an overclaim for both companies. Waymo runs a
> genuinely driverless service, but only inside mapped service areas; Tesla sells a *supervised*
> driver-assist product and runs a small, partly-unsupervised robotaxi pilot. A safer title:
> "How Waymo and Tesla are teaching cars to drive themselves" or "Two ways to build a self-driving car".

---

## 1. Waymo today

| Item | Finding | Source / date | Confidence |
|---|---|---|---|
| What it runs | Fully driverless, paid public rides (no one in the driver's seat), 24/7, inside defined service areas. | https://waymo.com/rides/ (read 2026-11-16) | High |
| Cities "serving riders" (15) | Atlanta (via Uber), Austin (via Uber), Dallas, Denver, Houston, Las Vegas, Los Angeles, Miami, Nashville, Orlando, Phoenix, San Antonio, San Diego, SF Bay Area, Tampa. Denver and Las Vegas reported as still invite/gradual. | waymo.com/rides (2026-11-16); "Open to everyone in San Antonio, San Diego, and Tampa" waymo.com/blog 2026-10-14; Denver/Vegas invite status: thechargeport.com/robotaxi-tracker (2026-11-09) | High (list); Medium (which are fully open) |
| Announced next | Baltimore, Boston, Charlotte, Chicago, Detroit, London, Minneapolis, New Orleans, New York, Philadelphia, Pittsburgh, Portland, Sacramento, Seattle, St. Louis, Tokyo, Washington DC ("Up Next"). | waymo.com/rides | High |
| Weekly rides | "Waymo surpass[ed] 500,000 fully autonomous rides a week" (Sundar Pichai). No newer official weekly figure found as of 2026-11-09. Goal: >1 million/week by end of 2026 (not confirmed met). | Alphabet Q1 2026 earnings release, 2026-04-29: https://www.sec.gov/Archives/edgar/data/0001652044/000165204426000043/googexhibit991q12026.htm ; tracker note 2026-11-09 | High (500k, Apr 2026) |
| Fleet size | ~4,000 vehicles (reported Sept 2026; Semafor via TNW reported plan for 8,000 by end-2026, 20,000 by end-2027). A June 17 2026 recall filing covered 3,871 vehicles; NHTSA's Nov 2026 school-bus query covers 2,895 (5th-gen only). | https://thenextweb.com/news/waymo-20000-robotaxis-2027 ; https://thechargeport.com/robotaxi-tracker | Medium ("about 4,000") |
| Total autonomous miles | 271.3M rider-only miles through June 2026 (safety hub); waymo.com/rides says "over 200 million miles". Secondary report of "300M+" by Q3 2026 not verified. | https://waymo.com/safety/impact/ | High |
| Freeways | Public freeway trips began Nov 2025 (Phoenix, LA, SF Bay Area, select riders), were paused to fix behaviour around freeway construction zones, resumed gradually from 2026-07-29 starting in Phoenix; Austin added 2026-09-24 (first in Texas). Access is gradual / interest-list, not every ride. | electrek.co 2025-11-12; Engadget (2026-07); Spectrum News 2026-09-24 https://spectrumlocalnews.com/tx/south-texas-el-paso/news/2026/09/24/waymo-expands-fully-autonomous-freeways-rides-in-austin | Medium |
| Vehicles | Jaguar I-PACE (5th-gen Driver) is still the bulk of the fleet. Zeekr-built **"Ojai"** van with the 6th-gen Driver: driverless ops from 2026-02-12, passenger service from ~May 2026, new silver Ojai with production ramping at Mesa, AZ (2026-10-06). Hyundai Ioniq 5 is the second 6th-gen platform (status of public rides unclear). Toyota supply deal announced 2026-10-30. | Electrek 2026-02-12 https://electrek.co/2026/02/12/waymo-begins-fully-autonomous-ops-with-6th-gen-driver-targets-1m-weekly-rides/ ; TechCrunch 2026-05-28; waymo.com/blog 2026-10-06 | High (Ojai), Low (Ioniq 5 in service) |
| Sensors, 5th gen (I-PACE) | 29 cameras, 5 lidars, radars (count not stated on page; commonly reported 6). | https://waymo.com/waymo-driver/ (29 cameras); Electrek 2026-02-12 (5 lidars) | High (cameras), Medium (lidar) |
| Sensors, 6th gen (Ojai) | **13 cameras, 4 lidar, 6 radar**, plus external audio receivers (microphones). Suite sees "up to 500 meters away". | https://waymo.com/blog/2024/08/meet-the-6th-generation-waymo-driver (2024-08-19) | High |

## 2. Waymo safety data (exact)

Waymo Safety Impact hub, data through **June 2026**, **271.3 million rider-only miles** in Phoenix,
SF Bay Area, Los Angeles, Austin and Atlanta (blog post 2026-09-24). Compared with a human benchmark
for the same roads:

- **Serious injury or worse crashes: 95% fewer** (55 fewer). 0.01 vs 0.21 per million miles.
- **Any-injury-reported crashes: 82% fewer** (841 fewer). 0.67 vs 3.77 per million miles.
- **Airbag-deployment crashes: 82% fewer** (357 fewer). 0.29 vs 1.61 per million miles.

Waymo's own caveat: "There is no perfect 'apples-to-apples' comparison between human and AV data
available today." Serious-injury counts are small (wide uncertainty); the serious-injury and airbag
benchmarks have no underreporting correction.

Source: https://waymo.com/safety/impact/ (read 2026-11-16). Confidence: High that these are Waymo's
published numbers; they are **Waymo-published, not independently peer-reviewed** in this release.
Earlier peer-reviewed work exists (Kusano et al., *Traffic Injury Prevention*, 2024/2025, 56.7M miles)
and a Swiss Re insurance-claims study (2024) — not re-verified here; cite only if fetched.

## 3. Tesla

| Item | Finding | Source / date | Confidence |
|---|---|---|---|
| FSD (Supervised) | Driver-assist; Tesla's own disclaimer: "Active driver supervision required; does not make the vehicle autonomous." = SAE Level 2. | Tesla Q3 2026 Update (webcast 2026-10-21) https://www.sec.gov/Archives/edgar/data/0001318605/000162828026066738/exhibit9914.htm | High |
| FSD scale | 1.74M active FSD subscriptions; approved in 9 EU countries; cumulative FSD miles shown in a chart only (axis to 16B; exact figure not stated). | same | High |
| Latest version | FSD v14.3.x (v14.3.11 listed 2026-10-07 by Not a Tesla App; tracker data, limited rollout). v14 first shipped Oct 2025. | https://www.notateslaapp.com/software-updates/version/2026.33.5/release-notes ; Electrek 2025-10-07 | Medium ("v14"), Low (exact point release) |
| Robotaxi Austin launch | 2025-06-22, Model Y, invite-only, Tesla employee "safety monitor" in the front passenger seat. | Reuters/AP 2025-06-22 (via Wikipedia Tesla_Robotaxi) | High |
| Rides with nobody from Tesla onboard | **Yes, some.** From Jan 2026 Tesla mixed "a few unsupervised vehicles" into the Austin fleet (Ashok Elluswamy). Later launched "unsupervised" service in Dallas & Houston (2026-04-18), Miami (07-03), Orlando & Tampa (07-21), Fort Worth (11-02), San Antonio (11-09). Tesla does **not** disclose what share of cars run without a monitor; reporting describes mixed fleets and small areas. Tesla says ~2 million cumulative unsupervised Robotaxi miles by 2026-09-30. | CNBC 2026-01-22 https://www.cnbc.com/2026/01/22/musk-says-tesla-takes-safety-supervisors-out-of-some-austin-robotaxis.html ; Tesla Q3 2026 Update; city dates: https://en.wikipedia.org/wiki/Tesla_Robotaxi and https://www.notateslaapp.com/news/4004/tesla-launches-unsupervised-robotaxi-service-in-dallas-and-houston | High (some unsupervised rides exist), Medium (city dates), Low (share of fleet) |
| Remote operators | Tesla's NHTSA crash filings code 5 low-speed crashes as "Remote (Commercial / Test)" driving — i.e. Tesla remote operators can drive the car. 36 Robotaxi incident reports on file by Oct 2026; all remote-operator crashes property-damage-only. | Electrek 2026-10-15 https://electrek.co/2026/10/15/tesla-remote-operators-crashing-robotaxis/ (NHTSA SGO data) | Medium |
| Bay Area | Service since 2025-07-30 with a **safety driver in the driver's seat**; operates under a CPUC charter-party permit; CPUC: Tesla is "not operating an autonomous vehicle service". No CA DMV driverless deployment permit. | Wikipedia Tesla_Robotaxi; robotaxi tracker 2026-11-09 | Medium-High |
| Cybercab | Two-seat, purpose-built; in production at Giga Texas (installed capacity ">125,000"/yr per Tesla). Robotaxi rides in Cybercabs began **2026-09-03 in Austin only**; Dallas promised for November. Reports conflict on steering wheel/pedals for private sale; Tesla said (Oct 2026) it was "weeks away" from private sales — unverified. NHTSA opened an audit of Cybercab FMVSS self-certification (2026-09). | Tesla Q3 2026 Update; CNBC 2026-10; TechCrunch 2026-09-04; The Drive 2026-10-23 (headline only) | High (Austin rides), Low (private sales) |
| Sensors | FSD drives with cameras only — no lidar; radar not used (removed from Model 3/Y from 2021). Typically **8 exterior cameras** (newer Model Y adds a front-bumper camera, so say "about eight"). No HD maps. | Elluswamy interview summaries; Tesla vision-only announcements 2021 | Medium |
| End-to-end | Since FSD v12 (2024) Tesla describes a single end-to-end neural network: camera video in, steering/acceleration/braking out ("photons in, controls out" is a popular paraphrase, not a verified Tesla quote). | Elluswamy talks (secondary summaries) | Medium |
| Training compute | Cortex 1 (>105 MW) and Cortex 2 (>120 MW) in Texas, in production; target 400 MW of training compute by end-2026. | Tesla Q3 2026 Update | High |

## 4. How the cars work (expert-safe wording)

- **Lidar**: fires laser pulses and times their return to measure distance, building a 3D point
  picture of the surroundings ("millions of laser pulses", waymo.com/waymo-driver). **No reliable
  Waymo figure for spin rate or points per second was found — don't quote one.**
- **Radar**: radio (millimetre) waves measure distance and *speed* of objects, and keep working in
  rain, fog and snow (waymo.com/waymo-driver).
- **Cameras**: colour and detail — traffic lights, signs, lane paint, brake lights, hand signals.
- **Microphones** (Waymo "external audio receivers"): hear sirens.
- **Perception**: AI turns sensor data into labelled objects (pedestrian, cyclist, car).
- **Prediction**: forecasts "the many possible paths that the other road users may take"
  (waymo.com/waymo-driver), a few seconds ahead.
- **Planning**: chooses trajectory, speed, lane and steering. "Many times per second" appears only in
  old secondary reporting (Smart Cities Dive, ~2018) — **no current Waymo-sourced update rate**; say
  "constantly" or "in real time" instead.
- **Maps**: Waymo builds "highly detailed custom maps" (lane markers, curbs, crosswalks, stop signs)
  before launching an area and matches them against live sensor data. Tesla FSD does not use HD
  prior maps (uses ordinary navigation maps).
- **Waymo's fleet response** humans answer questions from the car; Waymo says the car "is in control
  of the vehicle at all times" — they don't remotely drive (waymo.com/blog/2024/05/fleet-response,
  2024-05-21). Contrast Tesla's remote-operator driving above.

## 5. Training and simulation

- Waymo: "more than 20 billion miles in simulation" plus >200M real-world miles
  (https://waymo.com/waymo-driver/, read 2026-11-16). High.
- Waymo World Model (Feb 2026), built on Google DeepMind's Genie 3, generates camera *and* lidar
  scenes including rare events (e.g. tornadoes, an elephant on the road)
  (https://waymo.com/blog/2026/02/the-waymo-world-model-a-new-frontier-for-autonomous-driving-simulation). High.
- Carcraft / Waymax: older named tools; not re-verified this session — avoid naming them on camera.
- Tesla: learns from customer-fleet video; 1.74M FSD subscribers; Cortex 1+2 >225 MW training
  compute, 400 MW target by end-2026 (Q3 2026 Update). High. No reliable "H100-equivalents" figure in the filing.

## 6. History beats (hook material)

- **2004 DARPA Grand Challenge**: no vehicle finished; best (CMU's Sandstorm) got ~7.4 miles (Wikipedia: 7.32 mi / 11.78 km) of ~142 before getting stuck on a berm. High.
- **2005**: Stanford's **Stanley** won (~132 miles, ~6 h 54 min); five robots finished. https://stanfordmag.org/contents/drivers-not-wanted ; Wikipedia. High.
- **2009**: Google self-driving car project begins (Toyota Prius; ten 100-mile routes). https://waymo.com/about/ High.
- **2015**: Steve Mahan, a legally blind man, takes "the world's first fully self-driving ride on public roads" in Austin, TX. waymo.com/about. High.
- **2017** Early Rider (Phoenix); **2018** Waymo One, first commercial autonomous ride-hailing (with safety drivers at first); **2020-10-08** fully driverless rides opened to the public in Phoenix. https://waymo.com/blog/2020/10/waymo-is-opening-its-fully-driverless-service-in-phoenix/ High.
- **2025-06-22**: Tesla Robotaxi pilot in Austin (safety monitor onboard).

## 7. Caveats, incidents, investigations (2025–2026)

- **Waymo school buses**: recall 25E084 (Dec 2025, 3,067 vehicles) for passing stopped school buses;
  NHTSA opened recall query **RQ26006 on 2026-11-06** (2,895 vehicles) because most incidents came
  *after* the fix. Waymo says no citations since March 2026. A query is not a defect finding.
  (technology.org 2026-11-10; driveteslacanada.ca) Medium-High.
- **Waymo Santa Monica**: 2026-01-23 a Waymo struck a child (minor injuries) who ran out from behind a
  double-parked SUV near a school; NHTSA preliminary evaluation PE26001 opened 2026-01-28. Waymo says
  it slowed from 17 to 6 mph. https://static.nhtsa.gov/odi/inv/2026/INOA-PE26001-10005.pdf High.
- **Waymo freeway pause** (construction zones) late 2025/2026, resumed July 2026. Medium.
- **Tesla FSD**: NHTSA Engineering Analysis **EA26002** (2026-03-18, ~3.2M vehicles) on reduced
  visibility (glare, fog, dust); Preliminary Evaluation **PE25012** (~2.88M vehicles) on red-light
  running / wrong-lane incidents. CNBC 2026-03-19 https://www.cnbc.com/2026/03/19/tesla-nhtsa-full-self-driving-fsd-reduced-visibility.html High.
- **Tesla Robotaxi**: NHTSA file on school-zone speeding (2026-10-09, no crashes); Cybercab FMVSS
  self-certification audit (2026-09); Tesla redacted crash narratives until May 2026; 36 SGO incident
  reports by Oct 2026 (Electrek). NHTSA warns SGO data can't fairly compare companies. Medium.

---

## Claims safe to say on camera

1. "Waymo's cars drive paying passengers with nobody in the driver's seat." (waymo.com/rides)
2. "Today that's in about 15 US cities, from Phoenix to Miami." (waymo.com/rides, Nov 2026)
3. "Back in April, Waymo passed half a million rides a week." (Alphabet Q1 2026 release, 2026-04-29)
4. "Its newest car carries 13 cameras, 4 lidars and 6 radars." (Waymo 6th-gen blog)
5. "Lidar fires laser pulses and times the bounce-back to measure distance." (waymo.com/waymo-driver)
6. "Radar measures speed and still works in rain and fog." (waymo.com/waymo-driver)
7. "Cameras read the colours: traffic lights, signs, brake lights." (general; Waymo page)
8. "Then it predicts where everyone around it might go next, and plans its own path." (waymo.com/waymo-driver)
9. "Waymo maps every street in detail before it launches there." (waymo.com/waymo-driver)
10. "It has driven over 20 billion miles in simulation." (waymo.com/waymo-driver)
11. "Over 271 million driverless miles, Waymo reports 82% fewer injury crashes than human drivers on the same roads — by its own data." (waymo.com/safety/impact, through June 2026)
12. "Tesla bets on cameras alone — no lidar." (Tesla/Elluswamy)
13. "One neural network turns camera video straight into steering and braking." (Tesla FSD v12+)
14. "Tesla's FSD in customer cars still needs a driver watching the road." (Tesla Q3 2026 Update)
15. "Tesla now runs some robotaxi rides with no employee inside — in parts of Texas and Florida." (CNBC 2026-01-22; Tesla Q3 2026; launch reports)
16. "Tesla trains on video from its customers' cars, on huge data centres in Texas." (Q3 2026 Update)
17. "In 2004 not one robot car finished DARPA's desert race. The best managed about seven miles." (DARPA 2004)
18. "A year later, Stanford's Stanley won." (2005)
19. "Remote helpers can answer a Waymo's questions, but the car stays in control." (Waymo fleet response, 2024)

## Do not say

- "Self-driving is solved / cracked" or "works anywhere" — Waymo is geofenced to mapped service areas; Tesla's consumer product is supervised.
- "Tesla cars drive themselves" / "Tesla FSD is fully autonomous" — Tesla: "does not make the vehicle autonomous" (Level 2).
- "Tesla's robotaxis are all driverless" — fleets are mixed; share unsupervised undisclosed; Bay Area uses a safety driver; remote operators sometimes drive.
- "Waymo is X times safer than humans" as an unqualified fact — say "Waymo's own data shows…", name the metric (injury crashes) and the benchmark.
- "Waymo has never crashed / hurt anyone" — it has crashes, a child-strike probe and a school-bus recall.
- "Tesla is safer than humans" — no comparable independent data; SGO data can't compare fairly.
- "Waymo does 1 million rides a week" — that's a year-end-2026 *goal*, not confirmed.
- "Remote humans drive Waymos" — Waymo says they advise, the car drives. (For Tesla, remote driving *has* happened.)
- Any lidar spin rate / points per second, or "updates 10 times a second" — no current sourced figure.
- "Tesla has no radar on any car" — some newer models carry radar hardware; say "FSD drives on cameras".
- "Tesla has exactly 8 cameras" without hedge — say "about eight".
- "Waymo is in 20+ cities" — those are announced/upcoming, not serving riders.
- "Cybercab is on sale / in many cities" — Cybercab rides are Austin-only as of Nov 2026; private sales unconfirmed.
- "Photons in, controls out — Tesla says" — a popular paraphrase, not a verified Tesla quote.
- "Peer-reviewed" about the 271M-mile figures — that release is Waymo-published.

## Open items to re-check before publishing

- A newer official Waymo weekly-ride figure or fleet count (none found after April 2026 / Sept 2026).
- Whether Tesla's Dallas Cybercab launch and private Cybercab sales actually happened in November.
- Exact current FSD point release.
