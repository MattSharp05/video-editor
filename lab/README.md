# Motion lab

Where we invent and judge the motion vocabulary for app videos (9:16 only), using a real app as
the test subject. What we keep goes into the animated-video skill as rules and named techniques,
never as copy-paste shots. Every film designs its shots fresh from the vocabulary.

## Layers of reuse
1. **Principles**: a dozen rules for any app video (to be written from the verdicts).
2. **Vocabulary**: named techniques. Each has *Says* (what it means), *How* (with numbers),
   *When*, *Breaks when*, and *Tier*.
3. **Looks**: saved styles, each proven by a test render.
4. **App intake**: per app, in its project (tokens, screenshots, icons, rebuilt hero components).
5. **Taste log**: Matthew's verdicts in his words, dated.

A number becomes a rule after it holds in two films. Rejections are written down as what was
wrong with that idea, not as a ban on a category.

## Tiers (picked per shot)
1. CSS 3D in Remotion: interface in space. Sharp and fast.
2. three.js in Remotion: objects and worlds.
3. Blender: hero shots needing real light, physics or detailed models; also modelling for three.js
   (export .glb). A tool, not the timeline owner.

## Round 1 (2026-11-04) · tier 1 · test app: Trip
Review page: https://claude.ai/artifact/J14jnJ82FAJvYdfSQ4bLW1 (verdicts in its `verdicts`
collection, round notes in `round/general`).
Studies: S1 exploded interface, S2 component macro, S3 under the hood, S4 map becomes a floor,
S5 push-through, S6 the icon performs its verb. Source in `round-01/src/studies/`, shared camera
and layer kit in `round-01/src/kit/space.tsx`. Render: `npx remotion render src/index.ts <id> out/<id>.mp4`
(node_modules symlinked from projects/trip-social-01/film).

Known flaws found in my own frame review (not yet fixed):
- S1/S4: the covers over the screenshot's own flat pins read as dark blobs.
- S3: the falling words don't visibly connect to the pins they become.
- S6: the suitcase is drawn over a dimmed phone; the verb reads, but the drawing is plain.
- All: captions are on stand-in timing; no sound yet; 30 fps (references run 60).

## References studied
- `references.md`: the sand reel (@charles.zhengg) and four reels by @speedy_devv.
- Eight skill repos reviewed 2026-11-04: huashu-motion (vocabulary, ui-space, learning loop),
  take-one (component macro, motion kit, springs), video-director (style spec, critic, evals),
  rossark (micro-motion curves), reanimate (measure references), earshot (sound cues),
  explainroo (look tokens, safe areas), argo (little).
