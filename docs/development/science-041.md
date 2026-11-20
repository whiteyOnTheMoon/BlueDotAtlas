# M03 / 041 — Scientific process animation (qualitative schematic)

**Roadmap:** 041 · [Issue #65](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/65). **Status:** code and test proof in independent feature PR; separate operator Squash-Merge acceptance required.

## What this animation actually explains

The **original procedural 2-D vector** composition `ScienceScene.tsx` depicts three *qualitative* steps relevant to the draft 037 claim IDs **C01 and C02**:

1. **Evaporation over an illustrative ocean:** moisture enters the air; small visible vapor particles move upwards (initial phase approximately frames 0–89).
2. **Rising moist air and cooling:** an animated upwards flow path and arrows reveal the transport process (middle phase approximately frames 90–181, with gradual overlap).
3. **Condensation and heat release:** stylized water droplets appear in a cloud; separate amber arcs signal *latent heat released to surrounding air* (late phase frames 182–269, with gradual overlap).

**Not a hurricane simulator.** No wind velocities, ocean temperatures, latent-heat magnitudes, storm-scale/strength axes, actual storm paths, physical fluid calculations or real remote-sensing measurements are inferred. Animation curves/particle coordinates and relative sizes are solely illustration values. Atmospheric circulation and other necessary formation conditions are **not** modelled. The on-screen caveat is always visible: *“Warm water alone is not enough to form a hurricane.”* The top watermark states *“SCHEMATIC · NOT TO SCALE · NOT AN OBSERVATION”* throughout. Stage labels, arrows, droplets and heat-release arcs encode different processes by text, shape and color, not color alone.

**Scientific sources (verified 20 November 2026):**

- [NOAA Ocean Service – How do hurricanes form?](https://oceanservice.noaa.gov/facts/how-hurricanes-form.html): warm ocean moisture and heating support storms but multiple conditions, including a pre-existing disturbance and low wind shear, are needed.
- [NOAA NESDIS – How Does a Hurricane Form?](https://www.nesdis.noaa.gov/about/k-12-education/severe-weather/how-does-hurricane-form): moist air rises and cools; vapor condenses to droplets, releasing heat in the atmosphere.

The URL list is locked in `science-plan.js`; no provider content is copied into the animation. No georeferenced NOAA map is rendered or modified. Source pages are explanations, **not** a blanket media-license or finished film-claim sign-off. Full episode narration remains for later owner/scientific editorial review.

## Implementation and safety

- `packages/video/src/compositions/science-plan.js`: pure, deterministic, Node-testable visual-state timeline (`scienceStateAt`), bounded visual particle positions (`scienceVaporParticle`), provenance and science warning labels, duration guard 90–900 frames. The progress numbers **are easing/opacity fractions**, not scientific measurements.
- `packages/video/src/compositions/ScienceScene.tsx`: reusable SVG / React Remotion element. `useCurrentFrame` drives directional vapor, rising arrows, a growing cloud, and outward heat arcs with phase overlap and progress. Uses approved blue/navy/teal/ice/amber tokens and large brand-safe labels, `Inter` / `Space Grotesk` CSS font-name preferences with Arial fallback. **No additional fonts** downloaded or licensed; final embedding requires a later test.
- `packages/video/src/compositions/ScienceProof.tsx` and `RemotionRoot.tsx`: separate `BDA041ScienceProof` at **1920×1080, 30fps, 270 frames / 9 seconds**, entirely generated from vector shapes. The canonical illustrative motion also scales to bounded 3–30 second clips later, without unlocking production 60s.
- `scripts/check-science-041.test.mjs`: source URLs/claims/caveat, the three visually different process stages, monotone bounded phase progression, particles, negative and boundary tests, Remotion composition registration, no pilot approval bypass, no fabricated measurements.
- `scripts/check-science-041.mjs`: actual generated MP4 metadata using Remotion's bundled ffprobe. Rejects wrong codec, width/height, frame rate, 270-frame count, duration, non-8-bit 4:2:0 and audio streams. Checks **three real rendered PNG files** at frames 30 / 130 / 240 for nonidentical hashes to demonstrate actual visual development rather than relying on pure JS phase tests.

## Reproducible synthetic evidence

With pinned Node 22, pnpm 11.28.12, Remotion 4.0.545 and the frozen lockfile:

```sh
pnpm install --frozen-lockfile
node --test scripts/check-science-041.test.mjs
pnpm --filter @bluedotatlas/video build
pnpm --filter @bluedotatlas/video render:science-proof
pnpm --filter @bluedotatlas/video exec remotion render src/entry.tsx BDA041ScienceProof out/041-stills --frames=30,130,240 --image-format=png --concurrency=1
node scripts/check-science-041.mjs packages/video/out/041-science-proof.mp4 packages/video/out/041-stills
```

The [dedicated 041 Actions workflow](../../.github/workflows/pilot-science-041-check.yml) runs the above in an isolated temporary GitHub runner, with `concurrency=1`. It uploads only the **synthetic** MP4 and three PNGs for brief visual inspection (5-day retention). **No original NASA/NOAA footage** or research datasets are downloaded or publicly exposed. In addition, `033 Required CI` and 038/039/040 regression workflows must be green on the exact PR head.

**Non-goals and approval:** No full P60 film composition, factual measured data visualization, revised rights status, new remotion/React dependencies, external stock footage, new TTS/music, cloud purchases, VPS/DB/Cloudflare/Docker/worker actions, changes to original intro/outro, YouTube publication or final voice/film approval. The pilot script still requires `planning_only=true`, `render_authorized=false` and `publish_authorized=false`. Merge is gated by independent operator confirmation for the exact feature PR. 
