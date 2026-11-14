# BlueDotAtlas — Thumbnail QA for the Single Approved Template (006)

**Date:** 2026-11-14  
**Approval:** User selected the **first ocean-style design as the sole recurring thumbnail template** (DEC-017).  
**Test:** **12/12 PASS** at three viewing sizes; the earlier 9/9 test applies to the **superseded** three-layout proposal and must not be treated as evidence for the final decision.  
**GitHub Actions evidence:** [Run #43606211530](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43606211530) — **completed / success**, artifacts include exported PNGs and `report.json`.  
**Reproducible test:** [`scripts/check-thumbnails.mjs`](../../scripts/check-thumbnails.mjs) / [workflow](../../.github/workflows/thumbnail-check.yml).

## Single-master rule

All active assets use `data-template="bluedotatlas-left-text-v1"`:

- [`assets/brand/thumbnails/template.svg`](../../assets/brand/thumbnails/template.svg) — **only master**.
- [`mockups/ocean-currents.svg`](../../assets/brand/thumbnails/mockups/ocean-currents.svg) — ocean example from the same composition.
- [`mockups/changing-ice.svg`](../../assets/brand/thumbnails/mockups/changing-ice.svg) — ice example from the same composition.
- [`mockups/storm-from-space.svg`](../../assets/brand/thumbnails/mockups/storm-from-space.svg) — storm example from the same composition.

**No alternative layouts** exist in the active mockups. Each file fixes the same left-side title, top-left logo, colored underline, rounded teal frame, gradient, and right-side illustrative hero zone.

The exact `<g>` path/text markup of the existing approved `assets/brand/logo/logo-dark.svg` is embedded within each standalone thumbnail for portability, without modifying the logo source files. It is also asserted by the test.

## Result matrix

| Asset | Native 1280×720 | Mobile preview 320×180 | Tiny preview 160×90 |
| --- | --- | --- | --- |
| Canonical template | **PASS** | **PASS** | **PASS** |
| Ocean example | **PASS** | **PASS** | **PASS** |
| Ice example | **PASS** | **PASS** | **PASS** |
| Storm example | **PASS** | **PASS** | **PASS** |

All 12 checks ran in **Chromium** with actually loaded licensed **Space Grotesk** and **Inter** WOFF2 test fonts (version pinned to the same upstream commits as task 005). For each check:

- SVG root canvas 1280×720 and single-layout ID are verified.
- Official approved logo SVG fragment matches the canonical `logo-dark.svg` contents exactly.
- Main title remains on the **left**, with 3–4 lines inside the fixed 1280×720 safe box.
- The logo is within its defined top-left slot; no image background stretches its own nested SVG viewport.
- All SVG text remains inside the image bounds and there are **no browser errors**.
- PNG screenshots were saved at each scale, plus JSON measurements for reproducibility.

### Selected CI output

```text
PASS template 1280x720 fonts={"space":true,"inter":true} titlesFit=true allFit=true logoFit=true errors=0
PASS template 320x180 fonts={"space":true,"inter":true} titlesFit=true allFit=true logoFit=true errors=0
PASS template 160x90 fonts={"space":true,"inter":true} titlesFit=true allFit=true logoFit=true errors=0
PASS mockups/ocean-currents 1280x720 fonts={"space":true,"inter":true} titlesFit=true allFit=true logoFit=true errors=0
PASS mockups/changing-ice 160x90 fonts={"space":true,"inter":true} titlesFit=true allFit=true logoFit=true errors=0
PASS mockups/storm-from-space 160x90 fonts={"space":true,"inter":true} titlesFit=true allFit=true logoFit=true errors=0
SUMMARY 12/12 thumbnail render/bounds checks PASS
```

## Limits of the QA / publication gate

**This is an automated rendering and bounding-box test**, not a measured click-through rate or a guarantee that every word is comfortable to read on all physical devices. The owner's visual approval applies to the **first reference layout**; the repository's vector concept backgrounds are editable technical reconstructions of that arrangement, **not pixel-identical copies** of the generated reference image.

The sample ocean swirl, glacier and storm are **illustrations, NOT real measurements or satellite photos**. They may not be published as visual evidence. A production thumbnail must replace or properly label the imagery and verify rights, scientific truthfulness, timeframe and copyright case by case.

**Task 006 gate: COMPLETED.** Owner selected exactly one Ocean-style visual arrangement (DEC-017); real-font browser layout tests passed; [PR #14](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/14) merged; [Issue #13](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/13) closed. Science/media rights are still checked individually for actual released episodes.
