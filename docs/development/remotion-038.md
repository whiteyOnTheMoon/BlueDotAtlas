# 038 — Remotion: 1080p composition and 10-second proof

Status: M03 Issue #62, technical implementation in review. No full 60-second film or public release approved.

## Scope

- One local Remotion 4.0.545 proof composition at **1920×1080 / 30fps / 300 frames**, plus reusable profile and brand timeline.
- Reuse **unmodified** original user-supplied MP4s directly from assets/brand/motion/final/ by configuring Remotion's public directory. No copies of original files.
- Original intro 75 frames (own AAC sound) and silent outro 180 frames. Two nine-frame visual overlaps, 0.3 seconds each (DEC-023). Audio intro fades with the test picture; the **future music bed across the silent outro** is deferred until separately licensed and included in the final mix.
- Synthetic moving-label middle section, safe text inset 160 px horizontal and 108 px vertical. No NASA/NOAA videos, invented meteorological measurements, TTS or third-party music here.
- The 60-second plan remains planning_only=true, render_authorized=false and publish_authorized=false. Real cinematic footage, motion graphics, scientific graphics and TTS belong to 039–042.

## Reproduction (in isolated local or GitHub CI environment, never on the shared VPS in 038)

Use Node 22, pnpm 11.28.12:

    pnpm install --frozen-lockfile
    pnpm --filter @bluedotatlas/video studio
    pnpm --filter @bluedotatlas/video render:proof
    node scripts/check-remotion-038.mjs packages/video/out/038-proof.mp4

The rendered MP4 lives in ignored packages/video/out/. GitHub Actions runs six timeline/negative checks plus a real 300-frame Remotion render with concurrency 1. ffprobe requires H.264, AAC, 1920×1080, 30/1, 300 frames, 10.0 seconds. CI uploads the MP4 and three snapshots as short-lived artifacts for visual review. The 033 Required CI separately checks frozen installation, lint, format, TypeScript and build. **No CI PASS or film-quality approval is claimed until actual green runs on the PR head.**

## License, safeguards and acceptance

Operator confirms BlueDotAtlas is a **one-person project** on 20 Nov 2026. The Remotion Free License covers individuals / companies of up to three people, under current terms (https://www.remotion.dev/docs/license/pricing); no paid plan, key or extra service is added. Recheck if conditions change.

Even a successful ten-second proof does **not** allow 60-second production or publication. Three official 036 clips have a **private-internal-test-only** source approval. Before future timeline import, original file hashes and required credits need verification. No VPS/Docker/DB/Cloudflare/worker action, no paid provider and no public publishing permission in this issue. Merge only after technical review and an explicit approval.
