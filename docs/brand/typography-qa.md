# Typography QA — Task 005

**Date:** 2026-11-14  
**Design selection:** Space Grotesk (display) + Inter (UI/body/subtitles); approved by the user on 2026-11-14.  
**Test outcome:** **PASS (3/3 browser sizes)**  
**Source:** [GitHub Actions run #43563814550](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43563814550) — **completed / success**.

## Reproducible real-font test

- Test harness: [`scripts/check-typography.mjs`](../../scripts/check-typography.mjs) using Chromium and a local HTTP server.
- Test fixture: [`scripts/fixtures/type-readability.html`](../../scripts/fixtures/type-readability.html).
- Runner: GitHub Actions `ubuntu-latest`, Node 22, pinned Playwright **1.56.1**, Chromium installed via Playwright.
- The test downloads upstream WOFF2 files to a **temporary** `.tmp-fonts/` directory and checks the WOFF2 signature. It does **not** commit font binary files to the repository or distribute the test font files to the user.
- Inter Regular and SemiBold from [rsms/inter](https://github.com/rsms/inter/tree/353b61b9f4430d5f420d56605a6e7993e0941470/docs/font-files), commit `353b61b9f4430d5f420d56605a6e7993e0941470`.
- Space Grotesk variable from [floriankarsten/space-grotesk](https://github.com/floriankarsten/space-grotesk/tree/03507d024a01282884232081fc6011c09ff4e849/fonts/woff2), commit `03507d024a01282884232081fc6011c09ff4e849`.
- License texts for both fonts are included at `assets/brand/fonts/licenses/` and correspond to **SIL OFL 1.1**; exact production bundles must keep proper license notices.

## Checks and results

| Viewport | Page/frame use | Real font load | Horizontal clipping / scroll overflow | TV title/subtitle safe areas | Result |
| --- | --- | --- | --- | --- | --- |
| 375 × 812 | Small smartphone typography | Inter 400/600 + Space Grotesk 700 loaded | None detected | Not applicable | **PASS** |
| 768 × 1024 | Tablet layout | Inter 400/600 + Space Grotesk 700 loaded | None detected | Not applicable | **PASS** |
| 1920 × 1080 | Actual-size documentary typographic frame | Inter 400/600 + Space Grotesk 700 loaded | None detected | Title and captions inside 5%-style frame margins; no overlap | **PASS** |

**Log excerpts:**

```text
PASS mobile-375 fonts={"space":true,"interRegular":true,"interSemibold":true} safe=null browserErrors=0
PASS tablet-768 fonts={"space":true,"interRegular":true,"interSemibold":true} safe=null browserErrors=0
PASS fullhd-1920 fonts={"space":true,"interRegular":true,"interSemibold":true} safe={"titleWithin":true,"captionWithin":true,"titleSeparated":true} browserErrors=0
SUMMARY 3/3 viewports PASS
```

Automated checks verify that actual requested font files loaded, visible layout boxes did not exceed their containers or page width, and the 1080p caption/title boxes remain inside the tested boundaries. Three PNG screenshots and a machine-readable JSON result were saved as the GitHub Actions artifact `typography-005-browser-evidence` (limited retention).

## User visual acceptance

The project owner confirmed the displayed brand typography sample as **readable**: “Ist lesbar”, followed by “Ich finde es lesbar, kannst du auch einen Test machen und abschließen?”. This confirms the *displayed preview* is acceptable; it is not represented as proof of physical viewing distance on an actual television.

## Gate decision

**Task 005 (brand typography selection and demonstration) is ACCEPTED.** It has:
1. Approved free typefaces and their roles.
2. Official OFL source notices preserved.
3. Documented website, thumbnail and Full-HD starting scales.
4. User readability approval.
5. Real-font, browser-based checks at representative mobile/tablet/1080p sizes.

**Explicit future implementation checks** (not claimed complete in this design-stage task): when Next.js, Remotion and subtitles are implemented, verify that production bundling/font loading uses the approved families and license notices, rerun the layout checks against real UI and moving footage, and inspect on actual phones and televisions. Follow existing Roadmap tasks 007 (motion), 008 (UI) and 035–048 (rendered pilot).

This limits the sign-off to the stage actually tested and does not imply the eventual production app exists.
