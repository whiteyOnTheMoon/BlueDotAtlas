# 039 — Cinematic footage: private real-video proof

**Status:** [Roadmap 039 / Issue #63](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/63), implementation PR pending review. The technical proof is NOT a public film or a 60-second production render.

## Component and three cuts

`packages/video/src/compositions/FootageScene.tsx` is a reusable scene for authentic source footage: source trim in output-timeline frames (`trimBefore`), bounded `playbackRate` 0.75–1.25, aspect-preserving `cover`/`contain` and focal positioning, mild SDR filter values (0.9–1.1), Remotion tone mapping, **source audio muted**.

An independent **6-second / 180-frame / 30fps / 1920×1080** private proof plays three moving excerpts from **two distinct original sources**, cut at frames 60 and 120. The NASA ISS **Tropical Cyclone Oma 2019** footage is 1080×720 (3:2); use `contain` over BlueDotAtlas navy matte to **avoid silently cropping/distorting** it or generating black bars. NOAA Ocean Exploration **open sea waves 2021** is 1920×1080 (16:9), uses `cover`. The waves are not evidence of a hurricane or measured temperature; the two images represent different situations, not one continuous storm. No added lower thirds or scientific graphics in this task (040–041).

## Exact original source gate — temporary only

The official-source catalog [assets/pilot/rights-manifest.json](../../assets/pilot/rights-manifest.json) records two technical originals with true source SHA-256 and a scope of `PRIVATE_INTERNAL_TEST_ONLY`:

- **P60-VID-001 NASA Oma:** 27,140,201 bytes, SHA-256 `54ecdba5d5899fc7a2e8ee0f544359f59ddc45c13a26b919c3412b633416802c`, video courtesy NASA JSC.
- **P60-VID-005 NOAA Ocean Exploration:** 5,548,939 bytes, SHA-256 `e341bba65deafbf5857f7913af45cef74de2effe0e431323884e88f88574443b`; 2021 North Atlantic Stepping Stones expedition, not hurricane footage.

`scripts/ingest-private-footage-039.py` accepts **only two frozen official HTTPS URLs**, with no redirects or user credentials; each temporary original is bounded at 60 MB, must match the fixed historical 036 SHA/byte values and technical video format, and is stored mode 0600 under ignored `assets/pilot/.private-039/` on a *disposable GitHub Actions runner only*. The manifest must retain source-level approval for `PRIVATE_INTERNAL_TEST_ONLY`, audio forbidden and `approved_for_timeline=false`. The exact file hash gate is specific to this isolated **private technical proof**, not a production-timeline-approval change; the original manifest and pilot script flags are not changed.

**Public GitHub repository rule:** no original MP4, no composed footage MP4, no frames or previews in Git, PR descriptions, logs or GitHub Actions artifacts. CI emits only technical success/failure and immediately cleans files. The user has already reviewed those source videos for the limited internal test, but this task does not claim any new full video/person/logo/audio rights audit.

## CI, controls and no hidden deployment

`.github/workflows/pilot-footage-039-check.yml` runs:
1. Fresh frozen pnpm workspace install plus focused scene/rights/negative-guard tests.
2. Install FFmpeg/ffprobe on the **disposable runner**, validate rights manifest and original URLs (no network during tests).
3. Download both 036 technical originals into ignored runner-only paths, verify bytes + SHA-256 + H.264 dimensions, then reverify before rendering.
4. Real Remotion render with concurrency 1 and single OffthreadVideo decode thread, `BDA039FootageProof` composition, **180 frames / 6 seconds**.
5. Real `ffprobe`: H.264 with 8-bit 4:2:0 (`yuv420p` or FFmpeg full-range alias `yuvj420p`; final range handling is task 045), exactly 1920×1080/30fps/180 frames/6sec and **no audio stream**. Real decoded frame fingerprints at two times in each excerpt must differ, and each of the two cut boundaries must show different images. Prints only PASS/FAIL, never original hashes or pixels.
6. Remove the private media and resulting video file from the disposable runner. 033 Required CI independently tests project build, lint, TypeScript, format, PostgreSQL and API.

**Remaining separate gates:** production-safe media storage, public usage rights, personal full film review, actual 60s P60 composition, 040 Graphics, 041 science animation, 042 TTS, 045 export and 048 publication. `docs/pilot/60s-script.json` stays `planning_only=true`, `render_authorized=false`, `publish_authorized=false`. No VPS, Docker, Cloudflare, live worker/DB, paid provider or public website changes. Approval required for the concrete PR before any merge or task closure.
