# Trip, social clip 01 (brief)

Status: brief drafted, waiting for Matthew's video and his pick of idea. Experiment: the first run
of the workflow.

## Facts
- Product: Trip, an iPhone travel app (MattSharp05/Trip, `main`). **Built and running in Expo Go**
  (SDK 58): Trips globe, Plan (map + date pills with weather + itinerary linked both ways), flight
  globe on travel days with live status, Bucket List + Smart Add + Plan my bucket list, TikTok/Reel
  link → places on the map, Organize wallet with AI import (PDF/screenshot → review → card),
  Discover (events on your dates; sample events until the Ticketmaster key is set), and v2 group
  trips (invites, live updates, everyone's flights converging, likes on the Bucket List, shared
  expenses and balances with Venmo/Cash App/Zelle settle-up).
- Sample Las Vegas trip (Nov 12–16, 2026) with pretend travelers Blake and Willem: Settings →
  Developer → Add the sample Las Vegas trip. Scenario links load exact states.
- Sources: Notion project page (PRD v1 + v2), Notion "Trip: app overview" (competitors,
  differentiators), `docs/demo.md` (3-minute demo loop).
- Differentiators, stated as narrowly as the evidence allows (from the overview): events filtered
  to your trip dates; Smart Add places saved spots into the best day and time; map and list linked
  both ways; bookings + group planning + cost splitting in one app. Competitors (Tripsy,
  Wanderlog, TripIt) are in the App Store; Trip is not, so no "download now" CTA.

## Format
- Platform: **Instagram Reels**, 1080×1920, 9:16. Safe area: keep text out of the top ~220 px, the
  bottom ~420 px and the right rail (x > 930 at y > 1100). Frame 0 is the cover. Deliver about
  -14 LUFS, under -1.5 dBTP. Recheck against current Instagram guidance before export.
- Length: about 20–35 s.
- Goal: to confirm (default reach).
- Route (proposed): **real screen recordings of the app** as the spine (video-edit owns the
  timeline, screen-demo pack), with animated inserts from animated-video where real capture can't
  show the idea (hook, transitions, the messy "before").
- Look: Trip's design system (black, #FF6B22 as the only accent, SF Pro; no emoji, gradients or
  glows). Rules: `docs/design.md` in the Trip repo. Overlay text follows the same rules.
- Voiceover: Matthew records it after the script is approved.
- Sound: music bed and effects ship with the first cut; publishable cut uses CC0 or synthesized sound.

## Open questions
- What Matthew's attached video is (reference reel, screen recording, or a cut he made).
- Which idea leads (candidates in the session; pick one).
- Audience: travelers in general, or friends planning a group trip.
- Call to action (none / "follow for the build" / waitlist).

## Outstanding corrections
None yet.

## Style frames (2026-11-04)
Same beat (6–10 s, TikToks fly into the phone) in three styles: `stills/styles/` and 4 s tests in
`renders/` (git-ignored). A luminous 3D, B product UI film, C editorial collage. **Matthew picked B (product UI film).**
Type in the overlays is Hanken Grotesk as a stand-in: SF Pro can't be bundled for rendering here.

## Voiceover (2026-11-04)
`vo/take1.m4a` (one take; the two uploads were the same file). Trimmed 2.85 s for the film
(`film/public/vo.m4a`, word timings `film/src/words.json`). Measured −30 LUFS, normalised in render.
Said differently from the script (ASR, not listened): "You've saved", "the place it names"
(script: places; three ASR models agree on "place"), "time that fits", "plan your whole list out.
At once." Captions follow what he said.

## Key-frame board v1 (2026-11-04)
`stills/board/board.png` plus a rough animatic with the VO, `renders/trip-clip-01_animatic_v1.mp4`.
REC beats use stand-in screenshots from the Notion overview until Matthew's recordings arrive.
Overlay text sits in the Reels safe area. No music or effects yet.
