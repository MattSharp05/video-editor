# Animated-video profile

- Default format: 1080×1920, 30 fps, 9:16 vertical for social.
- Voiceover: Matthew records it for Trip (and his own product) videos. Build on stand-in word timings
  from the script until it arrives, then align the real take and re-time. Other videos may use the free
  AI voice from his Voice Picker picks (see `~/.video-script/profile.md`); ask per video.
- Route: made in code (Remotion). No paid AI video generation unless he asks; the exception is avatar cut-ins below.
- Avatar cut-ins (Matthew, 2026-11-12: "a technique or skill that we use with all our videos"): when the account has
  an avatar profile, the animation carries the film and the avatar cuts in for short bursts (hook, turns, reaction,
  call to action), about 15 s of a 60 s video to start; the right share is to be found by A/B tests. Skill:
  `.claude/skills/avatar-cutins/`. Goals he named: save time, tokens and cost. Always disclosed as AI (he: "i dont
  want to deceive anyone or break any rules"). Quote paid face clips before generating; stay within the avatar's cap.
- Hero assets (Matthew, 2026-11-12): a focal object with a real shape (the Sphere, a PS5, a sneaker) may be an
  AI-generated 3D model via fal (he picks Meshy, Tripo or Hunyuan by price). Always build the three.js version first,
  propose with stills and a quote, generate only on his pick, compare, and log his reason
  (`.claude/skills/hero-assets/`, `lab/hero-assets/decisions.md`).
- Reusing a hit on another account (2026-11-12): remake, don't repost; keep the story structure, kits and sound,
  change the wording, hook, voice and look (`lab/ugc-research.md`). A same-video share between accounts goes through a
  Collab post.
- Product films draw the real app's UI from its design rules and his screenshots; the product must
  be recognisably itself.
- Show a key-frame board before full animation; short pieces still get concept approval first.
- Sound: effects CC0 or synthesized for anything that will be published (see repo CLAUDE.md); music may be
  credited CC BY (Floating Cities, Kevin MacLeod). His sound taste: `~/.video-edit/profile.md`.

- 3D look (Matthew, 2026-11-06, "going forward our graphics will all have these upgrades"): every three.js film gets
  the look pass (`.claude/skills/animated-video/references/look-pass.md`); real places start from the terrain kit
  (public elevation data + public-domain imagery). Measure render cost per upgrade and report it with the stills.

## Motion (Matthew, lab rounds 1–3, 2026-11-04/05; rules in `.claude/skills/animated-video/references/motion-principles.md`, his words in `lab/TASTE.md`)
- One shot: no cuts; each new frame grows from the old one with a single point of focus that guides the eye.
- Glass: interface layers look like real glass, and 3D components look a bit more real (depth, light, shadow).
- Fluid motion; anything that leaves its place returns smoothly ("make sure the transition is smooth").
- Zooms keep components fully on screen: "Don't cut any parts off when zooming in".
- Emphasise words without boxes; a scan must look like actually reading.
- Consistency: one look per state for the whole film (an inconsistent highlight was "very obvious").
- No empty black background ("feels more like a presentation rather than a reel"): subtle background
  storytelling from the film's world, kept in the background.
- Glass must never cut into the component behind it.
- Blender is a tool for its strengths, not a replacement for the Remotion pipeline.
- Animations are a design philosophy reused as concept, never copy-paste shots.
- Water (Matthew, Water Picker 2026-11-06): rated rivers, rapids, ocean, beach and waterfall 5/5 as built by the water
  kit (`references/water.md`); underwater clear 4, muddy 3, flood front 2 (revised, awaiting re-rating).
- Movie, not presentation (Matthew, 2026-11-06): explanation beats must show the mechanism acting with the camera
  moving; no static diagram where only arrows/labels appear (`references/motion-principles.md`). Run motion_check on a
  preview before every full render.
