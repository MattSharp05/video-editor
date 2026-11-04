# Trip clip 01: script v1.1 (fact-checked against Trip `main` e0cea99)

**Idea:** Trip turns the travel TikToks you save into a day-by-day plan on a map.
**Goal:** reach (Instagram Reels). **Runtime:** about 33–36 s (~85 words at 3 words/s, plus holds).
**Voice:** Matthew, voiceover only. **CTA:** "Would you use this?"

Key: **REC** = screen recording from Trip in Expo Go (see capture list). **ANIM** = built in code.

| Time | Spoken line | What the viewer sees | Capture |
|---|---|---|---|
| 0.0–2.5 | You saved forty TikToks for this trip. | Frame 0, already moving: saved TikTok thumbnails stack up fast and fill the screen; a counter ticks to **40**. | ANIM |
| 2.5–6.0 | And on the trip, you'll open none of them. | The tiles drop into a "Saved" folder that closes. The counter drops to **0** in orange. | ANIM |
| 6.0–10.0 | So I'm building an app that turns them into an actual plan. | The folder bursts open and the tiles fly into an iPhone showing Trip's map of Las Vegas. | ANIM → REC |
| 10.0–14.0 | Copy a TikTok link, open Trip, and it asks: add this TikTok? | Real app: the "Add this TikTok?" banner on Plan, then a tap. | REC 1 |
| 14.0–19.0 | It reads the caption and pulls out the places it names. | "From TikTok" sheet: the places found, ticked (one may say "Not found on the map"). Tap Save to Bucket List; "Added N places to your Bucket List"; pins land on the map. | REC 2 |
| 19.0–25.0 | Tap Smart Add, and it picks the day and time that fit, with the least extra travel. | Smart Add on one place, then the toast "Added to Sun 15, 4:00 PM · 9 min drive from AREA15"; the map flies to the pin. | REC 3 |
| 25.0–30.0 | Or plan your whole list at once. | "Plan my bucket list" → "Placed 5 items across your trip / Thu 12, Fri 13, Sat 14 and Sun 15"; date pills tapped Thu → Fri → Sat → Sun, each day's pins lighting up. | REC 4 |
| 30.0–32.5 | Your saves, finally coming on the trip with you. | Pull back from the map: the Plan screen holds; the TikTok tiles from the opening sit as pins in the days. | ANIM over REC |
| 32.5–35.0 | Would you use this? | End card: Trip, "Would you use this?" Holds for comments. | ANIM |

## Alternative hooks (each with its own second sentence)
1. "This is how your saved TikToks turn into a trip." / "Copy the link, and Trip finds every place in it."
2. "Your trip plan is already in your saved folder." / "It's just stuck inside forty TikToks, so I built an app to get it out."

## Capture list (Matthew, iPhone screen recording, Expo Go on latest `main`)
Before: Do Not Disturb on, battery charged, one clean take per item; slow, deliberate taps.
Settings → Developer → **Add the sample Las Vegas trip** first.
1. **REC 1 + 2 (real account, real link):** copy a real Vegas food TikTok whose caption names
   places, switch to Trip (Plan tab) → "Add this TikTok?" → results → Save to Bucket List. The
   banner only appears for a real copied link; the `link-results` scenario skips it and shows
   canned sample results, so use it only as a last resort (and then the line must not imply a live
   read). If the app says "Finding places in videos isn't set up yet", tell me: the Gemini key
   isn't set on the server.
2. **REC 3 (fresh scenario):** Settings → Developer → Scenarios → **`vegas-bucket`** → Smart Add on
   **Golden Tiki** → let the toast ("Added to Sun 15, 4:00 PM · 9 min drive from AREA15") and the
   fly-to finish.
3. **REC 4 (fresh scenario again):** reload **`vegas-bucket`** → **Plan my bucket list** → tap
   Thu, Fri, Sat, Sun pills slowly. A fresh load matters: anything saved or placed earlier changes
   the "Placed 5" count.
4. Spare: 5 s of the Plan map at rest on any day (for the ending and transitions).
Send the files as they are (no trimming); I cut them.

## Draft caption
I'm building Trip: copy a TikTok link and it finds the places in it, puts them on your map, and
Smart Add fits them into your days. It reads the post's caption, so a video that never names a
place won't find one. In testing on iPhone, not in the App Store yet. Would you use this?

Music: "Wallpaper" by Kevin MacLeod (incompetech.com), CC BY 4.0

## Claims to verify (sources in MattSharp05/Trip `main`)
- "Add this TikTok?" banner when a link is on the clipboard: `src/features/links/LinkBanner.tsx`, ADR 0019.
- "reads the post": the caption text from TikTok's public oEmbed, read by Gemini: ADR 0019.
- Sample places and "Not found on the map": `src/features/links/links.test.ts` (vegas-food sample).
- "Added 3 places to your Bucket List": `src/features/links/useLinkFlow.ts`.
- Smart Add "day and time that fit, with the least extra travel": `src/core/smartAdd.ts` header
  (cost = added route distance plus 0.5 km per item on the day; fits each item's time window).
  Not real opening hours: never say "opening hours".
- Toast text "Added to Sun 15, 4:00 PM · 9 min drive from AREA15": Notion overview screenshot
  `vegas-bucket-smart-add.png` (sample trip).
- "Placed 5 items across your trip / Thu 12, Fri 13, Sat 14 and Sun 15": `src/features/bucket/planAll.ts:121`.
- "forty TikToks" / "none of them": a hypothetical "you", not a statistic. Keep it unquantified
  in the caption.
- Verified by a fresh agent 2026-11-04: all toasts match code; banner shows for any copied URL
  (says "TikTok" regardless); the end-shot "tiles as pins" is stylised (pins have no thumbnails).
- UNVERIFIED: whether the live link path works today (needs `GEMINI_API_KEY` on `parse-link`).
