# BlueDotAtlas — Thumbnail Browser QA (task 006)

**Date:** 2026-11-14  
**Status:** **9 / 9 automated layout tests PASSED.** This is a technical fit check only; approval of the creative direction is pending.  
**Evidence:** [GitHub Actions run #43565047653](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43565047653) (completed / success), artifact `thumbnails-006-render-evidence` with three scaled renders per concept and machine-readable `report.json` (time-limited retention).  
**Script:** [`scripts/check-thumbnails.mjs`](../../scripts/check-thumbnails.mjs)  
**CI:** [`.github/workflows/thumbnail-check.yml`](../../.github/workflows/thumbnail-check.yml)

## Tested artifacts

- `assets/brand/thumbnails/mockups/ocean-currents.svg`
- `assets/brand/thumbnails/mockups/changing-ice.svg`
- `assets/brand/thumbnails/mockups/storm-from-space.svg`

Each SVG is **1280 × 720**, vector-based, an original illustration, and explicitly marked as **not observational data**.

## Automated results

| Topic | 1280×720 | 320×180 | 160×90 |
| --- | --- | --- | --- |
| Ocean currents | PASS | PASS | PASS |
| Glacier / changing ice | PASS | PASS | PASS |
| Space-view storm | PASS | PASS | PASS |

**All tests verify:** both **Space Grotesk** and **Inter** load as actual WOFF2 fonts in Chromium; the main title bounding boxes remain within the predefined 64px design safe area; all SVG text is geometrically inside the artwork; and no browser errors occur.

The test ran with pinned upstream test fonts under existing SIL OFL 1.1 terms. The font binaries were temporary and are not copied to the repository.

### Log excerpt

```text
PASS ocean-currents 1280x720 fonts={"space":true,"inter":true} titlesFit=true allFit=true errors=0
PASS ocean-currents 320x180 fonts={"space":true,"inter":true} titlesFit=true allFit=true errors=0
PASS ocean-currents 160x90 fonts={"space":true,"inter":true} titlesFit=true allFit=true errors=0
PASS changing-ice 1280x720 fonts={"space":true,"inter":true} titlesFit=true allFit=true errors=0
PASS changing-ice 320x180 fonts={"space":true,"inter":true} titlesFit=true allFit=true errors=0
PASS changing-ice 160x90 fonts={"space":true,"inter":true} titlesFit=true allFit=true errors=0
PASS storm-from-space 1280x720 fonts={"space":true,"inter":true} titlesFit=true allFit=true errors=0
PASS storm-from-space 320x180 fonts={"space":true,"inter":true} titlesFit=true allFit=true errors=0
PASS storm-from-space 160x90 fonts={"space":true,"inter":true} titlesFit=true allFit=true errors=0
SUMMARY 9/9 thumbnail render/bounds checks PASS
```

## Interpretation and limitations

- **What passed:** technical font loading, bounds and clipping in these three sample layouts at three resolutions.
- **Not proved by automation:** actual viewing comfort at 160px, scientific truthfulness of a future real video, real footage rights, or platform click-through rates. Final thumbnails require their own evaluation.
- **Tiny disclaimers / optional brand text** are not expected to be readable at 160px; what must be legible is the primary headline and recognizable subject. The illustrative disclaimer is only for internal draft status.
- **Review:** the three topics should feel recognizably BlueDotAtlas despite different compositions. User must accept this visual language before task 006 is closed.
- **Publishing rule:** do not use these illustrations as factual real satellite photos. Replace with licensed authentic imagery as needed and retain actual rights/attribution records.

**Gate:** technical preview test passed; creative user sign-off, PR merge, and Issue #13 close are pending.
