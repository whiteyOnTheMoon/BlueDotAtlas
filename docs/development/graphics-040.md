# M03 / 040 — Motion Graphics in Remotion (review scope)

**Issue:** [#64](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/64). **Status:** implementation/testing pending operator Squash-Merge approval. This is an independent 8-second graphics test, not an authorized 60-second film.

## Component

`packages/video/src/compositions/GraphicsScene.tsx` displays one short on-screen metadata label within the **approved 1920×1080 / 30fps** Remotion profile, using `useCurrentFrame()` inside a bounded `<Sequence>`. The component supports:

- **Location/date/source lower third:** short title, geographic/observational context, explicitly precise **year or full YYYY-MM-DD** source date, provenance line.
- **Compact metric:** value + unit + human-readable label + mandatory source, rejected when NaN/missing source/unit. Scientific readings must be independently documented before being supplied by a later approved task; this prototype does **not** add climate measurements.
- **Transient animation:** exactly 12 frames of eased fade/slide in and 12 frames out, no always-on overlay. The proof contains three disjoint overlays and a final **34 frames (1.13s)** with none.
- **Brand treatment:** Deep Sea `#021934`, Ice White `#F2F9FF`, Muted `#B4CCDC`, Blue Dot `#19B7F4`, Glacier `#37D6C4`, all matching `packages/ui/tokens/colors.ts`. A deliberate mostly opaque navy scrim keeps the readable text separate from either light or dark underlying footage. Safe left inset 160px, bottom 108px, compact panel width 780px, never full frame.
- **Typography:** Inter or Arial fallback. The font **name** is the selected brand design; binary font embedding/byte-level font verification is not claimed here and belongs to final typography and rendering acceptance. Original logo, approved intro and outro remain untouched.

## Synthetic real-render proof

`BDA040GraphicsProof` under `RemotionRoot` has **240 frames / 8 seconds / 1920×1080 / 30fps**. It uses moving gradients and geometric shapes only, **no NASA/NOAA footage or unauthorized media**. The source labels are truthful *metadata examples*, not imagery of actual observations:

| Frames | Graphic | Context / trust gate |
| --- | --- | --- |
| 0–75 | Tropical Cyclone Oma / ISS / NASA JSC / 2019-02-20 | Provenance from approved 037 pilot catalog; synthetic background is visibly marked NOT observational footage |
| 76–87 | None | No overlay after informational purpose |
| 88–163 | North Atlantic open waves / NOAA Ocean Exploration / 2021 | Clearly illustrative ocean scene, **not** a hurricane and no invented observation date |
| 164–175 | None | Visual respite |
| 176–205 | **30 fps**, identified explicitly as the **technical video-profile value**, *not* a scientific/environmental measurement | Value comes from the committed 038 profile, not generated weather data |
| 206–239 | None | Final 34 frames demonstrate full disappearance |

The prototype is an independent module for later task 044 composition. It is **not grafted onto private real footage** in 040 because 036 rights remain `PRIVATE_INTERNAL_TEST_ONLY`, local file approval for actual 60s timeline is `approved_for_timeline=false`, and the full script remains `planning_only=true`, `render_authorized=false`, `publish_authorized=false`.

## Reproduce and acceptance

From a clean checkout with Node 22 and pnpm 11.28.12:

    pnpm install --frozen-lockfile
    node --test scripts/check-graphics-040.test.mjs
    pnpm --filter @bluedotatlas/video build
    pnpm --filter @bluedotatlas/video render:graphics-proof
    node scripts/check-graphics-040.mjs packages/video/out/040-graphics-proof.mp4

`scripts/check-graphics-040.mjs` invokes Remotion's **bundled `ffprobe`** through `pnpm`, avoiding runner-specific FFmpeg installations. The verifier requires H.264, 1920×1080, exactly 30fps, 240 decoded video frames, 8 seconds, 8-bit 4:2:0 and **no audio**. Explicit metadata and negative tests guard duration, content, source/date validity and disappearing overlays.

The separate `040` CI workflow renders a real H.264 MP4 and four representative stills (dark caption, light caption, metric, blank frame). Its temporary GitHub Actions artifact is **synthetic-only** and may be reviewed without any NASA/NOAA video rights. The main `033 Required CI` tests frozen install, lint, format, typecheck and monorepo build. No success is claimed until the exact final PR head is green and the representative frames are inspected.

**Security, cost and release gate:** No external images, new deps, paid APIs/TTS, extra VPS/Cloudflare/Docker/DB/worker changes, audio, public pilot film or YouTube publishing. The 040 code and proof stay in the repository only after **specific operator approval for the PR**, consistent with the working agreement. Font installation and subtitles are follow-ups, not silent scope expansion.
