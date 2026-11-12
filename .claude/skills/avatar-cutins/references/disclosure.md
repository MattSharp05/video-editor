# Disclosure and platform rules (summary; sources in lab/ugc-research.md sections 5, 7 and 8)

## Instagram (Meta)
- **AI-generated profile label** (2026-08-31). It covers accounts that "feature an AI-generated person", and appearing
  in only part of each video still counts.
  - Turn it on at account creation.
  - Labelled profiles keep their reach. Unlabelled ones detected by Instagram can lose recommendations.
- **Per-post label.** A photorealistic AI person needs the AI label on every post, even if it is on screen only part of
  the time.
  - The Graph API sets it with `is_ai_generated=true` on the media container, at creation only.
  - Keep the C2PA metadata intact.
- **Paid promotion.** Set `is_paid_partnership` for any promotion.

## TikTok
- **AI label.** Realistic AI people must be labelled: set `is_aigc=true` in the Content Posting API.
- **Brand content.** Use the brand content toggles for promotions.

## Never
- Present the avatar as a real person.
- Use a real person's likeness or voice.
- Have the avatar claim first-hand use of a product. The FTC treats that as a fake testimonial.
- Run several "independent" personas pushing the same product or the same video. That breaks Meta's Inauthentic Behavior
  policy, triggers duplicate matching and runs into the FTC's insider-testimonial rule.

## Bio line template
"AI creator · made by <brand/Matthew>". Where the avatar promotes Trip, add "AI guide for Trip".
