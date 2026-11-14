# BlueDotAtlas — Brand Motion Assets (Roadmap 007)

**Status:** **Revised proposal** after owner feedback. The earlier 10s combined brand presentation was **not approved** as an intro/outro. The new standalone clips must still be viewed and approved by the owner.

## Primary deliverables — TWO separate short logo clips

| Role | Video length | Frames | Source | Test script |
| --- | ---: | ---: | --- | --- |
| **INTRO** | **2.30 seconds** | 69 (30fps) | [`logo-intro-outro.html?clip=intro`](logo-intro-outro.html) | [`render-short-logo-clips.mjs`](../../../scripts/render-short-logo-clips.mjs) |
| **OUTRO** | **2.20 seconds** | 66 (30fps) | [`logo-intro-outro.html?clip=outro`](logo-intro-outro.html) | Same separate-clips renderer |

Both produce independent **1920×1080 / H.264 / MP4 / 30fps / silent** videos with an elegant Deep-Night background and subtle original topographic contours. There is **no narrator, music, location Lower Third, chart, map marker or source overlay** inside either short brand logo clip.

**Exact identity:** The source reads **`assets/brand/logo/logo-dark.svg`** (unchanged original logo geometry, name and English claim). Its SVG markup is imported inline into the browser rendering context so the **approved free Inter font** can be loaded and checked. Only its visual reveal mask, position, display scale and opacity animate. No original source SVG is modified.

The scene uses **project-original abstract contours**, not real observational Earth data. The color palette is the approved Deep Ocean / Glacial Light.

### CI / proof

- [`motion-check.yml`](../../../.github/workflows/motion-check.yml) renders the **two separate clips**, checks exact durations, true H.264 video encoding, original logo SVG, true Inter WOFF2 font loading and no extra in-video panels.
- Two MP4s, four rendered PNG frames and one QA JSON are archived temporarily in the GitHub Actions artifact **`BlueDotAtlas-007-Intro-Outro-Short-Clips`**.
- The development proof can be reproduced with Node 22, Playwright Chromium, FFmpeg and Inter WOFF2 files from the version-pinned sources in the workflow:

```bash
node scripts/render-short-logo-clips.mjs
```

- Output path: `.tmp-motion-logo-clips/` (intentionally ignored in source tracking; binaries should be archived as downloadable review artifacts rather than committed as large Git blobs).

## Other motion primitives — kept SEPARATE from the intro/outro

The roadmap also calls for **Lower Third, geographic label, map marker, source note and caption** patterns. These remain original separately timed **in-film elements**:

- [`preview.html`](preview.html) — **historical 10s integration proof**, still useful as a sample of lower thirds and source/marker behavior. **Not an approved intro/outro!**
- [`render-motion-test.mjs`](../../../scripts/render-motion-test.mjs) — historical technical generator for that 10s *integration proof*; it passed its own CI check before the owner requested shorter independent logo clips.
- [Guidelines](../../../docs/brand/motion-guidelines.md) — timing, graphic visibility and editorial accuracy.
- [QA and historical provenance](../../../docs/brand/motion-qa.md) — separates the new short videos from the earlier combined proof.

## Brand rules

The title logo, tagline, path geometry, two-tone palette and transparent SVG original files under `assets/brand/logo/` remain exactly as they were approved. Do not publish fictional background lines as actual satellite data. The intro/outro background is a branded graphic, not a scientific observation.

## Gate

- [x] Owner requested **two distinct 2–3s animations** rather than a single long 10s brand clip.
- [x] Intro 2.30s and Outro 2.20s locally rendered and verified at 1080p / 30fps / H.264.
- [x] GitHub source and reproducible paired-clip renderer documented.
- [x] **Both MP4s rendered and archived** on GitHub: [successful workflow #43610518751](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43610518751), [download two MP4s + 4 screenshots + QA JSON](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43610518751/artifacts/14120296356). 2/2 PASS with exact SVG + Inter fonts.
- [ ] Owner watches **both new videos** and explicitly approves them.
- [ ] PR #17 merges and Issue #16 closes with approval and test evidence.
