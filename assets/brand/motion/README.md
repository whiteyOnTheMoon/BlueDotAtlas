# BlueDotAtlas — Motion Design Assets (M00 / 007)

**Status:** Draft / design review pending. **No motion decisions have yet been approved.**  
**Issue:** [#16](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/16)

## Files

- [preview.html](preview.html) — self-contained **timeline/scene layout** (except the existing official logo and temporary licensed font loading). The JS function \`window.setMotionTime(seconds)\` deterministically positions all elements for any frame between 0 and 10 seconds.
- [Motion Guidelines](../../../docs/brand/motion-guidelines.md) — timing, easing, safe areas, accessibility, editorial rules and future migration to the video engine.
- [1080p test renderer](../../../scripts/render-motion-test.mjs) — Playwright screenshots + FFmpeg; generates a real 10-second MP4, four sample PNG frames, JSON QA report.
- [CI Motion Gate](../../../.github/workflows/motion-check.yml) — downloads pinned OFL font files temporarily, renders/validates video and uploads it as a GitHub Actions artifact for the owner.

## Animated components

| ID | Slot / meaning | When visible in 10s demo |
| --- | --- | --- |
| \`introLogo\` | Original approved SVG logo + tagline, brief upward fade | 0.65–2.65 s |
| \`lowerThird\` | Compact location label and explanatory subtitle, left/bottom | 2.65–6.60 s |
| \`mapMarker\` | Cyan pulsing map point + short lead line and label | 3.10–6.40 s |
| \`source\` | Source-name / sensor / date format and simple caption | 6.50–8.45 s |
| \`outro\` | Short brand logo return without full-screen solid title card | 8.45–10.00 s |

The **background is an original abstract illustration** and includes no real scientific data, measurements, purchased footage, logos from external institutions, or music.

## Run instructions

On CI (Ubuntu): install Node 22, FFmpeg, Playwright 1.56.1 / Chromium; save official Inter 400/600 and Space Grotesk WOFF2 into \`.tmp-fonts/\` using the version-pinned download commands in the workflow. Then:

\`\`\`bash
node scripts/render-motion-test.mjs
\`\`\`

Output is stored in \`.tmp-motion-results/\`, outside tracked files. The video file is \`BlueDotAtlas_007_Motion_Test.mp4\`; keyframes and JSON report provide evidence for the review. The build uses \`@font-face\` to **load real typefaces**, no embedded or redistributed font binaries in the repository.

**Do not distribute raw font binaries** from temporary CI directories. The original SIL OFL license notices are preserved in [\`assets/brand/fonts/licenses/\`](../fonts/licenses/).

## Editorial and future-proofing

- Real published location labels must match actual geography; this scene says **illustrative demo**.
- Source strings **AGENCY / SENSOR / DATE** are mandatory placeholders for an integration test, **not** valid real citations.
- Keep actual scientific maps, dates and data verified; assets must have rights and attribution.
- The approved logo files in \`assets/brand/logo/\` are never transformed, traced or edited; only the **display opacity and translation of the original image** animate.
- Follow approved color and free-font choices; do not introduce competing brand styles.
- For real web/mobile UX, implement a reduced-motion alternative and ensure captions are localized/time-aligned where appropriate.
- This **10-second silent design proof** is distinct from the roadmap's future **60-second science-film proof** (M03).

### Acceptance

- [x] All required motion motifs represented in original HTML/JS design.
- [x] Deterministic clip renderer and formal QA checks authored.
- [ ] MP4 rendering (1920×1080, 30fps, 10s) passed in GitHub Actions.
- [ ] Owner viewed and approved movement style and pacing.
- [ ] PR merged and issue closed.
