# BlueDotAtlas — Motion 007: 10-second 1080p QA

**Test date:** 2026-11-14  
**Result:** **PASS** — rendered real MP4 and completed programmatic logo/lower-third test.  
**Human motion approval:** **PENDING** — design remains Draft until the user has watched the clip.  
**GitHub Actions:** [Run #43608120656](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43608120656), completed **success**.  
**Direct artifact:** [Download \`bluedotatlas-motion-007-testclip.zip\`](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43608120656/artifacts/14118684177), artifact ID **14118684177**, retention until **2026-11-28**.

## Produced actual video (not just source code)

Artifact contains **6 files**:

1. \`BlueDotAtlas_007_Motion_Test.mp4\` — playable 10-second silent video.
2. \`logo-intro.png\` — actual rendered introductory logo keyframe.
3. \`location-lower-third.png\` — actual rendered location/Lower Third and map context keyframe.
4. \`source-caption.png\` — actual source/caption keyframe.
5. \`outro.png\` — actual rendered logo outro keyframe.
6. \`motion-007-qa.json\` — detailed machine-readable evidence.

The artifact is a **temporary GitHub Actions download**. The source HTML/JS and reproducible test renderer are kept in GitHub source control. We **do not** commit the rendered MP4, screenshots or downloaded font binaries as permanent git objects.

## Technical verification

| Check | Result |
| --- | --- |
| H.264 / MP4 encoded with FFmpeg | **PASS** |
| Video frame | **1920×1080** |
| Frame rate | **30fps** |
| Duration | **10.0 seconds** |
| Browser | **Chromium**, pinned Playwright 1.56.1 |
| Fonts | **Inter 400 + 600**, **Space Grotesk** WOFF2 loaded; pinned free OFL versions |
| Canonical brand logo | Existing \`assets/brand/logo/logo-dark.svg\` loaded twice for intro/outro; no re-vectorization or changes to the original |
| Timing assertions | Five checkpoints: no early overlays, intro logo visible, Lower Third + marker visible, source caption visible, outro visible |
| Overlay geometry | Local overlay elements in frame, none >16% frame area |
| Background | Continuous original SVG contour illustration; **no permanent full-frame solid text overlay** |
| Image rights / truthfulness | Background is original project illustration and is explicitly identified as *not satellite data* |
| Music, stock footage, scientific observational footage | **None**, intentionally silent design proof |
| CI result | **Success**, MP4 + four keyframes + QA JSON archived |

**Exact successful CI excerpts:**

\`\`\`text
Encoded frame 0/300
Encoded frame 75/300
Encoded frame 150/300
Encoded frame 225/300
PASS motion-007: actual logo, licensed fonts, lower third, source text, map marker, outro; 1920×1080 30fps 10s.
With the provided path, there will be 6 files uploaded
Artifact bluedotatlas-motion-007-testclip has been successfully uploaded!
\`\`\`

## Verified storyboard and timings

| Motion motif | In | Out | Notes |
| --- | ---: | ---: | --- |
| First visual hook, abstract scene | 0.00 | 0.65 | No full-screen text splash |
| Logo intro | 0.65 | 2.65 | Exact SVG source; opacity and small rise only |
| Lower Third | 2.65 | 6.60 | Local dark scrim, label + subtitle |
| Map marker + demo label | 3.10 | 6.40 | Pulse, leader line; explicitly *demonstration* |
| Source/caption bar | 6.50 | 8.45 | Template placeholders require replacement in real films |
| Logo outro | 8.45 | 10.00 | Short and localized, over continuous background |

## Science and accessibility boundaries

- \`North Atlantic\` in the scene is a **demo location label**, not a measured geographic coordinate. The map art is abstract, not a real map.
- \`AGENCY / SENSOR / DATE\` and the caption are **template fields**, not a citation to an actual dataset.
- The approval here can only concern motion pacing, composition and UI style. A future real documentary still needs fact-checking, rights-cleared footage, real sources and an editorial gate.
- Motion-reduction behavior is defined in [the guidelines](motion-guidelines.md), but production-grade \`prefers-reduced-motion\` support should be tested in the later web/Remotion integration.
- CI checked overlay bounds and absence of permanent full-frame text cards. Human evaluation is still required for visual taste, apparent readability and motion comfort.

## Gate result

- [x] Required motion patterns are implemented: intro, outro, map marker, location, source and caption.
- [x] Real 10-second video rendered in 1080p/30fps with authentic approved logo.
- [x] Test confirms Lower Third and no permanent full-screen overlays.
- [x] Actual file plus keyframes and report are available in GitHub Actions.
- [ ] Owner watches and **approves the motion style and timing**; a simple “Ok” after watching approves this specific design only.
- [ ] PR #17 reviewed/merged and Issue #16 closed with evidence.

**Decision:** Technical gate passed; human brand-motion gate is intentionally **OPEN**.
