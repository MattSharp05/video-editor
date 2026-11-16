# Self-driving 01: script (v1, 2026-11-16, unsupervised)

One idea: a car with nobody in it gets through a city street in three moves: it sees everything (lasers, radar,
cameras), it guesses what everyone will do, and it plans around them; Waymo and Tesla bet on different eyes.
Goal: reach. Voice: Kokoro am_puck. Drafted at 2.9 words/s (Kokoro test line): ~179 words ≈ 62 s + pauses.

| # | Spoken line | Picture (note to animated-video) |
|---|---|---|
| 1 | There's nobody driving this car. So how does it see you? | Night street. A white robotaxi glides in; the camera finds the empty driver's seat, wheel turning by itself. |
| 2 | In 2004, not one robot car could finish a desert race. This year, Waymo passed half a million rides a week, with nobody at the wheel. | Something that is "2004 failure" → "today's scale" without leaving the world. |
| 3 | First, the car has to see you. On its roof, lidar fires laser pulses and times each bounce, building a 3D picture of the street. | Laser pulses leave the roof dome; the street becomes points. |
| 4 | Radar tracks speed, even in rain. Cameras read traffic lights and signs. | Rain; radar picks moving things; the light's colour. |
| 5 | But seeing isn't enough. It predicts where every person, bike and car might go next. | Futures fan out from a cyclist, a pedestrian, a car. |
| 6 | Then it plans a path around all of them, again and again as they move. | The car's own candidate paths; one wins; it re-forms. |
| 7 | It practised over 20 billion miles in simulation. | Practice, at scale. |
| 8 | Tesla bet differently: cameras only, no lidar, and one neural network that turns video into steering. | A Tesla: only camera views; video in, wheel turns. |
| 9 | Most Teslas still need a driver watching. But some Tesla robotaxis in Texas now run with no employee on board. | A hand-on-wheel Tesla; then a robotaxi with empty front seats. |
| 10 | So, is it cracked? Not everywhere. But in about 15 US cities, a car with nobody inside already sees you, guesses your next step, and drives around you. | Recap of see / predict / plan; land on the hook's street, you crossing. |

## Alternative hooks (each with its second sentence)
- A: "There's nobody driving this car. So how does it see you?" + the 2004 → half-a-million line. (chosen: the stake
  is the viewer, the picture answers it on screen in 3 s)
- B: "Most people think self-driving cars follow the rules. Actually, they spend every second guessing what you'll do
  next." + "Waymo's cars do this half a million times a week..." (Matthew likes this format; it opens on prediction,
  the middle of the chain, so seeing would come after its payoff)
- C: "In 2004, the best robot car drove seven miles and got stuck in the desert." + "Now half a million rides a week
  have nobody at the wheel." (history first: the viewer's stake comes late)

## Claims to verify (sources in research.md)
1. Nobody in the driver's seat, paid rides: waymo.com/rides.
2. 2004 DARPA Grand Challenge: no finisher.
3. Waymo passed 500,000 fully autonomous rides a week (Alphabet Q1 2026 release, 2026-04-29) — "This year" holds.
4. Lidar fires laser pulses, times the return; builds 3D: waymo.com/waymo-driver.
5. Radar tracks speed, works in rain: waymo.com/waymo-driver.
6. Cameras read traffic lights and signs.
7. Predicts where road users might go; plans its path: waymo.com/waymo-driver.
8. Over 20 billion simulated miles: waymo.com/waymo-driver.
9. Tesla FSD: cameras only, no lidar; end-to-end neural network (v12+).
10. FSD (Supervised) needs an attentive driver: Tesla Q3 2026 update.
11. Some Tesla robotaxi rides in Texas with no employee on board (CNBC 2026-01-22; later launches).
12. About 15 US metros with Waymo rider service: waymo.com/rides.
