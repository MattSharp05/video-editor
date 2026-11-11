# AI UGC creators: research (2026-11-11)

**Question.** Should Broadcast get an **Avatar studio**: an AI "creator" for an account, with a face, a voice and a
personality kept the same in every video? If so, which tools would make it, what would it cost, and what are the
platform risks?

Nothing was signed up for, paid for, uploaded or keyed. Prices are the ones shown on 2026-11-11, and they change often.

**Tags.**
- **[V]** = read on the vendor's or platform's own page that day.
- **[3P]** = third-party source.
- **[I]** = our inference.

**How it was checked.** Three research agents read the pages; I checked upstream cstack myself. A few findings are
surprising, so re-check them before building on them:
- the Sora 2 API was shut down;
- Veo was moved off the Gemini API;
- ElevenLabs has a v4 model;
- Instagram's "AI-generated profile" label.

## The short answer

1. **The voice is solved cheaply.** Two options:
   - **Our free Qwen3-TTS:** already good enough ("fine for a clone").
   - **ElevenLabs:** about **$0.04–0.08 per minute** of audio via the API, with clear commercial rights on any paid
     plan. Better when a character needs to act or sound polished.
2. **The face that talks is the only real cost.**
   - Image + audio → talking-head models cost **$0.05–0.16 per second**.
   - The best-value API is **Kling Avatar** at $0.056/s (official price), with **HeyGen** and **Hedra** close behind.
3. **Higgsfield is more an app than an API.**
   - It offers Soul ID (a consistent face), lip-sync and UGC templates, and an official Claude skill and MCP server.
   - The skill and MCP log in through a browser and spend plan credits.
   - Its pay-per-second API does sell Kling, Seedance and Wan video. We could not confirm that its talking-avatar
     models are in that API.
4. **The platforms allow AI creators, but only labelled ones.**
   - Instagram has an account-level **"AI-generated profile"** label (2026-08-31). Unlabelled AI-person profiles "may
     see limits" to their reach; labelled ones don't lose reach.
   - The Instagram publishing API now has an `is_ai_generated` flag; TikTok's has `is_aigc`.
   - Pretending the avatar is human is what breaks the rules: Meta, TikTok, Higgsfield's terms §11.7, and FTC fake
     testimonials.
5. **Cost per 60 s video:**
   - **about $2–5** for our animations with avatar segments;
   - **about $5–15** for a full UGC-style clip;
   - **about $0** for today's pipeline, apart from Claude.

## 1. ElevenLabs

### Voices
- **Voice Design** [V] makes a voice from a written description and returns 3 previews per request.
  https://elevenlabs.io/docs/overview/capabilities/voices
- **Instant clone** [V] works from samples under 2 minutes long.
- **Professional clone** [V] needs longer training audio and the Creator plan or above. Creator and Pro include 1.
- **Owning the voice** [V]:
  - Designed voices and instant clones can't be shared to the Voice Library, so a designed voice stays private to the
    account.
  - [I] That is the cleanest way to own a character's voice. We found no explicit ownership clause for designed voices.

### Voice Library voices for a long-running character
- **Commercial use is allowed** [V] on paid plans.
- **The owner can stop sharing at any time** [V], after a notice period of 30 days to 2 years. Clips already made stay
  usable. ElevenLabs can also remove a voice "at any time".
  https://elevenlabs.io/docs/voice-library/overview, https://elevenlabs.io/vla
- **The voice isn't exclusive** [I]: other accounts may use it too.
- **Verdict:** don't base a persona on a library voice.

### Rights
- **Free plan: no commercial use. Paid plans: commercial licence**, except output from Beta features [V].
  https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform

### API price
Source: https://elevenlabs.io/pricing/api

- **Rates** [V]:
  - Flash costs $0.04 per 1,000 characters.
  - v2 and v3 cost $0.08 per 1,000 characters.
  - No price is listed for v4 (`eleven_v4` is the model the docs now recommend).
- **Per minute** [I]: about 950 characters of speech per minute gives **$0.04–0.08/min**. A Reel's voice costs a few
  cents.
- **Plans** (monthly price and v3 characters included):

  | Plan | Price/month | v3 characters included |
  |---|---|---|
  | Starter | $6 | 75k |
  | Creator | $22 | 275k |
  | Pro | $99 | 1.24M |

  Creator covers about 290 minutes of v3 audio a month.

### Other ElevenLabs features [V]
- **Sound effects** cost $0.12/min.
- **Music** costs $0.15/min. The music terms allow commercial online use and you keep the rights; Free through Pro are
  for individuals. https://elevenlabs.io/music-terms
- **Avatars** are a reusable face (3–5 images or a prompt) paired with any ElevenLabs voice. They work in the app only:
  **"API not available at launch."** https://elevenlabs.io/docs/overview/capabilities/image-video/avatars
- **Video models through the API** [V]:
  - Veo 3.1: 4–8 s clips.
  - Seedance 2.5: up to 30 s.
  - Lip-sync through the API is only `creatify-aurora`, at 480p or 720p. HeyGen, OmniHuman and others are app-only.
- **MCP:** the local server was archived on 2026-08-20. Its replacement is hosted (`api.elevenlabs.io/v1/mcp`) and logs
  in with OAuth.
  - [I] For automated cloud sessions, calling the plain REST API with a key is simpler.

### ElevenLabs vs our Qwen3-TTS

| | Qwen3-TTS (ours) | ElevenLabs |
|---|---|---|
| Cost | $0; 20–30 s of CPU per line | about $0.05 per Reel, plus a $6–22/month plan |
| Matthew's verdict | clone "fine"; picked an American male and female | not heard yet |
| Consistency | design once, clone every line (proven) | a saved voice ID; the same every call |
| Acting (emotion, laughs) | limited | v3/v4 take inline emotion tags (strong reputation [3P]) |
| Rights | Apache 2.0; output is ours | commercial on paid plans |
| Speed in our cloud | slow; drop model caches (disk) | about 1 s per line |

[I] **Keep Qwen as the default. Run a blind Voice Picker round with 2–3 designed ElevenLabs voices before paying.**
Matthew's ear decides, as it did in round 1.

## 2. Higgsfield

### What it offers
- **Soul / Soul ID:** a consistent face across images and clips.
- **"AI Influencer" character sheets** [V] at $0.05 each.
- **Lipsync Studio:** about 10 models, including Speak 2.0, Kling Avatars 2.0 and InfiniteTalk [3P, Higgsfield blog].
- **UGC Factory and Marketing Studio:** templates for creator-style ads.
- **Motion presets.**
- **Other companies' models**, resold: Kling, Seedance, Wan, MiniMax and LTX. Veo and Sora appear in the app only.

### API [V]
Sources: https://higgsfield.ai/higgsfield-api, https://docs.higgsfield.ai

- **Billing:** a separate product with a prepaid USD balance. You pay per generation; failed generations are free.
- **How it works:** send a job, then poll until it's done. Python and Node SDKs.
- **Prices per second:**

  | Model | $/s |
  |---|---|
  | Wan 3.0 | 0.0375 |
  | Kling 3.0 | 0.071 |
  | Kling 4.0 | 0.126 |
  | Seedance 2.0 | 0.080 |
  | Seedance 2.5 | 0.118 |

  Soul 2 images cost $0.003 each.
- **Not verified:**
  - that Soul ID, lip-sync or talking-avatar models are in the API (the help page lists only image models and
    Marketing Studio Image);
  - Soul ID's cost;
  - each tool's maximum length and 9:16 support.
- **Plans:** we couldn't read the pricing page. Third parties list roughly $9–129/month, renamed twice in 2026.

### Terms [V]
Source: https://higgsfield.ai/terms

- **Ownership:** they claim no ownership of outputs and don't restrict commercial use, on any plan. Free downloads are
  watermarked.
- **Training:** your content may train their models; Enterprise accounts are excluded.
- **Real people:** any real person's likeness or voice needs consent.
- **No passing as human:** **"You shall not represent … that Outputs are human-generated" (§11.7).** An AI creator on
  Higgsfield must be labelled as AI.

### Agent tooling [V]
- **Official hosted MCP** at `mcp.higgsfield.ai/mcp`.
- **Official skills:** https://github.com/higgsfield-ai/skills (MIT, about 2k stars, including `higgsfield-soul-id`
  and `higgsfield-generate`), used through `@higgsfield/cli`.
- **Both need a paid subscription and a browser login**, and they spend plan credits, not the API balance.
  - [I] That's awkward for automated cloud sessions.

## 3. Alternatives for talking-head AI UGC

The pattern that keeps a creator consistent [I]: **make the voice first**, from one saved voice, then drive an
**image + audio → video** model with **one fixed reference photo**. Models that invent their own audio (Veo, Kling
native audio, Omni) don't keep the voice the same from clip to clip.

| Tool | Best at | API price | Length / 9:16 | Notes |
|---|---|---|---|---|
| **Kling Avatar** | cheapest official image + audio talking head | $0.056/s at 720p, $0.112/s at 1080p [V] | 2–300 s | Prepaid packs; commercial terms not checked. https://kling.ai/document-api/pricing/base/video.md |
| **HeyGen Avatar 6** | polished, most "presenter" | about $0.05–0.10/s [3P]; prices shown only after login | 9:16; 1080p/2K | Prepaid wallet separate from plans. Official Claude skills: https://github.com/heygen-com/skills (`heygen-avatar` saves an `AVATAR-<NAME>.md`, our idea exactly) |
| **Hedra Character-3** | expressive faces; one API for many models | about $0.05/s [3P] | up to 600 s; 9:16; 1080p [V] | Also hosts OmniHuman 1.5, Kling Avatar, HeyGen Avatar 4 and Creatify Aurora |
| **Captions / Mirage Avatar X** | identity consistency | $0.15/s, billed in 6 s blocks [V] | 1–60 s; 720p; 9:16 | API may be early access |
| **OmniHuman 1.5** (ByteDance) | full-body emotion and gesture | $0.16/s on fal [V] | | Also on Hedra |
| **Runway Act-Two** | maps a real performance onto a character | $0.05/s [V] | 9:16 | Needs someone to act the driving video |
| **Runway `gwm1_avatars`** | very cheap photo avatar | about $0.0033/s [V] | | Built for real time; quality untested |
| **Kling 3.0 Omni / 4.0** | full UGC scenes (holding a product, walking) | $0.084–0.157/s [V] | short clips | With reference images |
| **Veo 3.1 Fast** (Vertex only now) | cinematic scenes with sound | $0.10–0.12/s [V] | 4–8 s clips | Gemini API Veo shut down 2026-10-22 [V]; there it's now Gemini Omni Flash (about $0.07/s, 15–30 s, 6 refs) |
| **Sora 2** | — | — | — | **API shut down 2026-09-24** [V]; it also refused real-looking faces |
| **Arcads / Creatify** | templated ad UGC with stock actors | custom deals; plans about $110–550/month [3P] | | Not a fit for our own persona |

**Open source** (LatentSync, MuseTalk, InfiniteTalk, MultiTalk, FantasyTalking, Hallo3):
- **Can't run here.** They need a GPU (18 GB to H100 class); our container is 4 CPU cores.
- **Hosted on fal:** LatentSync costs about $0.20 per clip up to 40 s, but needs source video. InfiniteTalk costs about
  $0.20–0.30/s.
- **Licences:** Apache or MIT, except Wav2Lip (non-commercial) and Hallo3 (inherits CogVideoX's licence).
- [I] Not worth it until we have volume and a GPU.

## 4. Existing skills and MCP servers

- **Upstream cstack** (checked: `main` at `72c4a9b`, plus branches `director` and `video-toolkit`): **there are no
  `higgsfield-*` skills.** The line in our `animated-video` description points at nothing. They are probably meant to be
  Higgsfield's own `higgsfield-ai/skills`.
- **Official skills:**
  - `higgsfield-ai/skills` (Soul ID, generate, Marketing Studio UGC);
  - `heygen-com/skills` (avatar, video, translate).
- **Community skills** (small, unvetted):
  - `0xAnni/ugc-creator`: identity card and reference lock, the closest to our idea;
  - `charlesdove977/UGC-Factory`;
  - `robonuggets/higgsfield-skill`;
  - `synchronicity-labs/skills` (lip-sync).
  - List: https://github.com/zhuyansen/awesome-claude-video-skills (Avatars category).
- **MCP servers:**
  - ElevenLabs: hosted, OAuth;
  - Higgsfield: hosted, OAuth, paid plan;
  - fal.ai: hosted; search, pricing and run for any model;
  - Replicate: hosted;
  - HeyGen: official repo and docs returned 404 on 2026-11-11.
- [I] **For automated Broadcast-fired sessions, call the REST APIs with keys** (stored as environment network secrets)
  rather than OAuth MCP servers. A thin skill of our own (`avatar-video`) can borrow the good ideas from HeyGen's
  `AVATAR-<NAME>.md` and 0xAnni's identity card.

## 5. Platform risk

### Instagram / Meta
- **Labelling** [V]:
  - Meta "may require" an AI label on photorealistic video or realistic audio, with "penalties" for leaving it off.
  - It labels automatically from C2PA/IPTC signals.
  - https://www.meta.com/help/artificial-intelligence/1783222608822690/
- **AI-generated profile** [V, 2026-08-31]: an account-level label for profiles that "feature an AI-generated person".
  - Unlabelled ones "may see limits to their profile's reach".
  - Labelling "doesn't change a profile's reach".
  - https://creators.instagram.com/blog/ai-generated-profile-label
- **Graph API** [V]:
  - `is_ai_generated=true` on the media container (2026-06-22);
  - `is_paid_partnership` (2026-04-22);
  - `trial_params` for Trial Reels.
  - https://developers.facebook.com/documentation/instagram-platform/changelog
- **Inauthentic Behavior policy** (2025-12-11) [V]: bans deceiving people about who is behind an account. It has no
  rule against AI personas.
  - Meta itself runs AI Studio characters, labelled.
- **The real reach risk is originality** [3P]: Instagram ranks original content up and aggregator accounts down, and
  Facebook cracked down on "unoriginal content" in 2025.
  - [I] Templated, look-alike avatar Reels are what gets throttled, not the label.

### TikTok [V]
Source: https://www.tiktok.com/community-guidelines/en/integrity-authenticity

- **Labelling:** realistic AI people must be labelled.
- **Banned even with a label:**
  - private people's likeness without consent;
  - fake endorsements by public figures;
  - fake news styling.
- **Feed and API:** unoriginal content isn't eligible for For You. Auto-labels from C2PA; viewers can choose to see
  less AI. The posting API has `is_aigc`.

### Law
- **FTC fake-reviews rule** (effective 2024-10-21) [V]: bans AI-generated testimonials, and testimonials from anyone
  who hasn't used the product.
- **FTC Endorsement Guides** (2023) [V]: virtual influencers count as endorsers.
- **New York synthetic-performer ad disclosure law** (about 2026-06) [3P].
- **EU AI Act Art. 50** deepfake disclosure has applied since 2026-08-02 [3P, law firms].

### What it means for us [I]
1. **Disclose:**
   - turn on the AI-generated-profile label on day one;
   - say "AI creator" in the bio;
   - send `is_ai_generated` / `is_aigc` on every post;
   - keep the C2PA metadata.
2. **Faces and testimonials:**
   - the avatar is never a real person;
   - it never claims to have used a product;
   - it never pretends to be human.
   - It can explain, react and present; it can't "review".
3. **Originality is the moat.** Our animated explanations are original by design; avatar-only talking heads are the
   commodity.
4. **Promotions:** set `is_paid_partnership`.

## 6. How it plugs into our pipeline

### The avatar profile (stored in Broadcast, exported to the session as `avatar.md` + `refs/`)
- **Identity:**
  - name, age range, where they're from, backstory (5–10 lines);
  - what they know and care about;
  - the account they belong to.
- **Personality and speech:**
  - tone, energy, humour;
  - signature phrases;
  - words they never use;
  - reading level;
  - words per second (Matthew's real take is 2.7–3.0);
  - how they open and close a video.
- **Look:**
  - 1 canonical front portrait, the master reference;
  - 6–12 approved stills (angles, expressions);
  - 2–4 wardrobe sets;
  - 2–3 home settings (backgrounds);
  - framing for 9:16 (eye line, how much headroom, where captions sit);
  - a style rule: photoreal or stylised.
- **Voice:**
  - provider (Qwen or ElevenLabs);
  - voice ID, or the reference clip plus transcript and seed;
  - model;
  - 2–3 approved sample lines (playable).
- **Rules:**
  - do's and don'ts (topics, claims, no product testimonials, never says they're human);
  - the disclosure line;
  - per-platform flags.
- **Settings and records:**
  - default talking-head model, resolution, generation seeds;
  - a cost cap per video;
  - version history: every video's manifest records the avatar version.

### Studio flow
1. **Brief:** the account and its audience → Claude drafts 3 persona concepts. Matthew picks one or edits it.
2. **Look:**
   - generate about 8 portrait candidates (cheap images, about $0.003–0.05 each) → pick 1;
   - generate the reference set from that one portrait → approve or reject each image.
3. **Voice:**
   - design 3 voices from the persona's description → a blind picker → pick one;
   - lock the reference clip and voice ID.
4. **Screen test:** one 10 s talking-head clip in 2 models (about $1–2) → approve. The profile is saved, version 1.
5. **In use:** Content Factory videos for that account load the profile.
   - A change to the look or voice makes a new version, so performance can be compared by version.

### How a video session uses it
- **A. Hybrid (recommended start):**
  - the avatar opens (the hook, 3–5 s);
  - it appears in 1–2 short "face" beats, or as a small picture-in-picture over our Remotion animation;
  - it closes the video.
  - Typically 15–25 s of the avatar in a 60 s film. Remotion composites the clips (`<OffthreadVideo>`), so the
    explanation stays original.
- **B. Full UGC clip:** the avatar talks to camera for the whole clip, with captions, B-roll from Kling or Veo, and our
  overlays.
  - Cheaper to make per idea, but closer to the commodity format.
- **Steps either way:**
  1. Script.
  2. VO from the profile's voice.
  3. Beats.
  4. Send each avatar segment's audio slice and master reference to the avatar model.
  5. Check the frames: the face matches the reference, the mouth is in sync, no artefacts.
  6. Composite, mix and render.
- **Re-rolls:** a bad segment is re-rolled alone, as we already do with VO lines.

### Cost per 60 s video (inference; prices from section 3; Claude tokens not counted)

| Setup | Voice | Avatar video | Re-rolls (×1.5) | Total |
|---|---|---|---|---|
| Today: Remotion + Qwen | $0 | — | — | **≈ $0** |
| Hybrid: 20 s of avatar, Kling Avatar 720p, Qwen voice | $0 | 20 × $0.056 = $1.12 | ≈ $1.70 | **≈ $2** |
| Hybrid with ElevenLabs voice, HeyGen/Hedra 1080p | $0.08 | 20 × $0.05–0.10 | ≈ $1.50–3 | **≈ $2–4** |
| Full UGC: 60 s of avatar, Kling Avatar 1080p, plus 10 s of Kling/Veo B-roll | $0.08 | $6.70 + $1.00–1.30 | ≈ $11.50 | **≈ $8–12** |
| Premium: 60 s on Mirage or OmniHuman | $0.08 | $9–9.60 | ≈ $14 | **≈ $10–15** |

**Fixed and one-off costs:**
- an ElevenLabs plan ($6–22/month) if we use it;
- about $2–5 per avatar to set up (portraits and screen test);
- [I] a prepaid wallet on 1–2 video providers (about $20–50 to start).

**Example:** one hybrid video a day on one account costs **about $60–120 a month**.

## What we'd still verify with a small paid test (when Matthew says so)
- Higgsfield's API has a talking-avatar model, with its price and limits per second.
- HeyGen's and Hedra's real per-second prices (they are shown only after login).
- Face consistency across 5 clips from the same reference on Kling Avatar vs HeyGen vs Hedra, judged by Matthew's eye
  in a picker.
- Whether Instagram auto-labels the clips from C2PA metadata even when we also set `is_ai_generated`.

## 7. Cut-in technique: animation-led, with short bursts of the avatar (round 2, 2026-11-11)

Matthew's idea: the animation plays most of the time, and the video cuts back and forth to the avatar talking, for
about 15 s of a 60 s video. It would be a standard technique in every video, to feel human-led and to save cost.

### Evidence
- **A person early helps** [3P]. Emplifi studied 10,110 Facebook Reels from 704 brands (2026-03):
  https://www.socialmediatoday.com/news/human-speech-and-presence-help-drive-reels-engagement/815381
  - A person on screen for 1 s or more in the first 3 s lifted 10-second retention by about 10%.
  - Speech in the first 3 s lifted it by about 25%, compared with music only.
  - The face effect fades later: 30-second views were 2.4% lower with a person on screen. That supports going back to
    the animation after the hook.
- **No study gives the best share of face or the best segment length.**
  - Creator advice: a visual change every 2–4 s, and a bigger pattern break every 8–12 s [3P].
  - Cut away once an explanation runs past about two sentences [3P].
- **AI faces degrade with length** [3P, anecdotal]:
  - lip-sync drift seen after about 6–7 s on some models;
  - jawline drift after about 40 s.
  - Short segments hide this.

### Starting rules [I] (to test with A/B Trial Reels)
- **The hook is a face.** The avatar speaks within 0–3 s.
- **Segments:** 3–4 avatar segments of 2–5 s each, never over about 7 s. Total about 12–18 s of 60 s, roughly 25%.
- **Where they go:**
  - the hook;
  - turns in the argument ("here's the catch");
  - a reaction to the reveal;
  - the call to action.
  - Explanation beats belong to the animation.
- **One continuous VO track under the whole film,** with J/L cuts: the voice starts before the face appears, or keeps
  running after the cut to the animation. This hides the seams.
  - Generate each segment with ~0.5 s of handles and cut away before the clip's drift-prone tail.
- **Continuity:**
  - the same reference photo, framing, light and wardrobe in every segment of a film;
  - simplest: one generated take, cut into segments.
- **Other layouts:** picture-in-picture, or the avatar cut out over the animation. The face is small, so lip flaws hide
  and the face can stay on screen for longer at the same cost.
- **Script:** avatar lines under about 12 words.
- **Cost:** about 15 s of avatar instead of 60 s gives about a quarter of the face cost.
  - About $1–2 per video on Kling Avatar 720p;
  - about $2–4 with re-rolls at 1080p.

### Disclosure
Making it feel human-led is fine; making viewers believe a real person is speaking is not.
- **Per post:** Meta requires a label on photorealistic AI video and sets no minimum share of runtime [V]
  (https://help.instagram.com/761121959519495). 15 s of an AI person counts.
- **Per account:** the "AI-generated profile" label covers accounts that "feature an AI-generated person" [V].
- **Detection:** auto-detection (C2PA, invisible watermarks) can apply labels anyway.
- **Rule:** label every post and every avatar account.

## 8. Avatar swap: one performance, many faces (round 2, 2026-11-11)

### What the ElevenLabs ad was [V/I]
- **Not ElevenLabs Avatars.** That feature builds a talking head from 3–5 images and has no API yet.
- **Most likely Kling Motion Control** ("Match Video") **or MiniMax H3 Max Recast**, run inside ElevenLabs' Image & Video
  app, with the voice changed in its Voice Changer.
  - A public tutorial shows exactly this recipe:
    https://gotranscript.com/public/how-to-swap-characters-and-voices-in-any-video
  - Inside ElevenLabs these models are app-only (API "No"), and most are "non-US".
  - **The same models can be called by API directly** (fal, Runway).

### Three ways to do it
| Approach | Same motion and expressions? | Scene | Lip-sync | Notes |
|---|---|---|---|---|
| **(a) Swap the person in the finished video** (H3 Max Recast, Wan 2.2 Replace, HeyGen face swap) | yes | identical: same set, only the person changes (like the ad) | carried over from the original; not documented, so test close-ups | Identity leakage (A's jaw or hairline), and A's lighting kept on B |
| **(c) Performance transfer from one master take** (Runway Act-Two, Kling Motion Control) | yes | each avatar keeps its own background and light from its photo | Act-Two officially transfers lip-sync and expressions | The photo's framing must match the master's; big head turns and teeth can glitch |
| **(b) Same audio, regenerate each avatar** (Kling Avatar, HeyGen Avatar IV) | no; motion differs each run | own | always clean | Cheapest to understand; fails the "identical" requirement |

### Cost: 10 avatars × 15 s of on-screen avatar (150 s; the master clip excluded) [V unless noted]
| Tool | Total |
|---|---|
| Runway Act-Two (c), $0.05/s, 720:1280 | **$7.50** |
| Kling 2.6 std Motion Control on fal (c), $0.07/s | $10.50 |
| Kling 3 pro Motion Control on fal (c), $0.168/s | $25 |
| Wan 2.2 Animate Replace 720p on fal (a), billed per frame ÷ 16 (fal removes it 2027-01-04) | $12–22 |
| H3 Max Recast on fal (a), 768p / 1080p, plus input-video tokens | $34 / $47 |
| HeyGen face swap (a), $0.05/s (endpoint not documented) | $7.50 |
| Runway Aleph 2 (a), $0.28/s, identity only by prompt or look image | $42 |
| Voices: ElevenLabs Voice Changer, $0.12/min, keeps timing so lip-sync survives | $0.30 |

- **Budget about 2× for re-rolls.**
- **Each avatar needs its own voice**, or ten faces with one voice is the obvious tell. Use speech-to-speech (ElevenLabs
  Voice Changer, or open-source Seed-VC / RVC, which are slow on our CPU). Regenerating with Qwen changes the timing, so it
  breaks lip-sync for (a) and (c).
- **Open source:** FaceFusion's `inswapper` weights and stock LivePortrait's InsightFace detector are
  **non-commercial**, so don't use them for published work.

### Ranked [I]
1. **Runway Act-Two plus ElevenLabs Voice Changer.**
   - The only one with official docs saying it transfers expressions and lip-sync.
   - API, 9:16, 3–30 s, about $8 for ten.
   - The master take can be an AI avatar clip or Matthew performing it himself, which gives the most human motion.
2. **H3 Max Recast (fal)** when the set must stay identical. About $34–47 for ten; test a close-up first.
3. **Kling Motion Control (fal)** as the second option for (c).

### The plan this was for: one Trip ad on ten avatar accounts
This is high risk on all three fronts:
- **Reach:**
  - Instagram matches near-copies and recommends only the original.
  - Since 2026-04-30, accounts that mostly post unoriginal content become ineligible for recommendations, judged over a
    rolling 30 days [3P: TechCrunch, Tubefilter].
  - About 45 s of identical animation per ad would very likely match even with the face swapped.
- **Policy:**
  - Meta's Inauthentic Behavior policy bans networks that mislead "about the popularity of content" and about "a Meta
    asset's ownership or control" [V]
    (https://transparency.meta.com/policies/community-standards/inauthentic-behavior). It can remove the whole network.
  - TikTok bans multiple accounts used "to deceive" [V].
- **Law:**
  - The FTC's testimonial rule bans fake testimonials and undisclosed insider testimonials.
  - Its fake social-indicator rule covers "purported individual accounts not associated with a real individual".
  - The FTC Q&A [V] (https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers)
    says virtual influencers are allowed with disclosure.
  - Ten personas acting as independent Trip fans is the core case.

**Safe uses of swapping:**
- A/B test which face converts, as Trial Reels or ads from Trip's own account.
- Localise or target paid ads from Trip's Page with different presenters.
- Give each avatar account a materially different video built on shared animation parts, with the AI and Trip
  connection disclosed in the bio and caption.
