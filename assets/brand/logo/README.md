# BlueDotAtlas — Brand / Logo

**Selected direction:** C — Earth Contour  
**Brand:** BlueDotAtlas  
**Tagline:** The Planet Has a Story.  
**Status:** Vector reconstruction created; visual acceptance and 48px render review of the final SVG set are pending.  
**Roadmap:** [Task 003](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/5)

## Transparent SVG assets

| File | Intended background | Content |
| --- | --- | --- |
| [logo-light.svg](logo-light.svg) | **Light** surfaces | BlueDotAtlas wordmark + tagline + navy contour icon |
| [logo-dark.svg](logo-dark.svg) | **Dark** surfaces | BlueDotAtlas wordmark + tagline + off-white contour icon |
| [icon-light.svg](icon-light.svg) | **Light** surfaces | Icon-only, navy contour |
| [icon-dark.svg](icon-dark.svg) | **Dark** surfaces | Icon-only, off-white contour |

**File names describe the background** they are intended for, not the icon's color.

## Construction and matching rule

- All four files contain the **same three cubic Bézier path definitions** for the Earth Contour mark and the same central observation-point coordinates, `cx=483`, `cy=354`, `r=38`.
- The icon-only files show that **exact same mark** with a tightly cropped, **non-square** `viewBox`; nothing is distorted or stretched.
- The files contain **no `<rect>` backgrounds, embedded PNG/JPEG images, or external assets**.
- Ink colors differ for legibility: light surface `#021934`, dark surface `#F2F9FF`. The observation dot uses `#10AAEC` and `#19B7F4`, respectively. These are provisional production colors until Roadmap task 004.
- The SVG wordmark and tagline are vector-rendered SVG `<text>` elements. Their shapes depend on the available Inter/Arial font fallback; **outline-converted typography** should be finalized after task 005 (typography/license decision). Do not claim pixel-perfect matching to the reference PNG.
- The contour was **manually reconstructed from the approved PNG concept**. It matches across the four new SVGs by construction, but is not an automated pixel-for-pixel trace of the PNG reference.

## Artboard / transparent margins

The four SVGs were tightly cropped **without changing any drawing commands, color values, text attributes, or positions**. Only their root `viewBox`, `width`, and `height` values changed.

| Files | viewBox | Intrinsic dimensions |
| --- | --- | --- |
| `icon-light.svg` / `icon-dark.svg` | `93 133 577 460` | 577 × 460 |
| `logo-light.svg` / `logo-dark.svg` | `93 133 1892 460` | 1892 × 460 |

- **Icon:** visible contour extents were measured at approximately x=97–666 and y=137–589 in the original shared coordinate system, giving approximately **4 SVG units on all four sides**.
- **Full logo:** icon extents determine the left/top/bottom. In Chromium, the rightmost rendered wordmark edge lands approximately 2 px from the artboard edge (the glyph bounds can slightly exceed the nominal `textLength`).
- **Renderer caveat:** the wordmark is still SVG `<text>`, and some SVG renderers may not honor `textLength` or may substitute a different font. For example, CairoSVG leaves ~269 px unused at the right in its font fallback, while Chromium has ~2 px. This difference is caused by renderer behavior, **not** top/bottom canvas padding. To make the text boundary consistent across platforms, convert the approved lettering to outlines after typography selection (task 005).
- This tight-crop format deliberately has a **non-square icon artboard**. A 48×48 application icon should be placed inside a square app-icon container with suitable external padding; the brand SVG itself is not stretched to a square.
- Both color variants share identical artboard dimensions, exact same Bézier paths and the same center-point coordinates.

**Structure:** This folder is the single source of truth for production logo files. The previously used `assets/brand/concepts/` folder and duplicate `assets/brand/logo.svg` were intentionally removed by the project owner in two commits and are not to be recreated.

## Measured visible padding (2026-11-14)

The current cropped SVGs were rasterized at their native declared pixel size on transparent backgrounds. Alpha bounding boxes were measured, excluding transparent pixels. No logo graphics were changed.

| Renderer | Icon variants (L/T/R/B) | Full logo (L/T/R/B) |
| --- | --- | --- |
| Chromium browser (native SVG, verified light variant) | 4 / 4 / 4 / 4 px | 4 / 4 / ~2 / 4 px |
| CairoSVG (both color variants) | 4 / 4 / 4 / 4 px | 4 / 4 / ~269 / 4 px |

**Conclusion:** The SVG file does not contain a large blank border above or below. Excess space seen in some previews is likely from the viewer/container's own fitting area or rendering behavior. **Do not reduce the vertical viewBox further**, because the contour strokes would be clipped. A square display container may letterbox the non-square icon; this padding is external to the SVG artboard.

## Design intent

The curved lines can evoke **topographic elevation contours, seismic propagation or waveforms, and Earth observation patterns** without limiting BlueDotAtlas to one natural phenomenon.

The dot represents a location, measurement, or observation.

## Usage

- Use `logo-light.svg` on white/pale surfaces; `logo-dark.svg` on navy/dark video or web surfaces.
- Use `icon-light.svg` / `icon-dark.svg` for favicons, watermarks, social avatars, and compact placements.
- Avoid background shapes behind the logo unless explicitly needed for layout; the four files are transparent.
- Maintain adequate clear space around the contour strokes and wordmark; avoid placing the icon on visually noisy footage without a contrast treatment.

## QA checklist

- [x] Four transparent SVG source files exist in this folder.
- [x] All four use identical contour path data.
- [x] Both full logos include the exact approved brand name and English tagline.
- [x] Static SVG file inspection: no raster image or background rectangle.
- [x] Tight-crop changes limited to root viewBox and dimensions; geometry/text markup identical across the before/after versions.
- [x] All four rasterized with CairoSVG; light variants also inspected via Chromium. Measured transparent margin above and below = 4 px.
- [ ] Full visual comparison against the PNG reference and cross-platform font fallback review.
- [ ] Visually verify 48×48 and 64×64 icon readability.
- [ ] Finalize typeface/convert typography to outlines when task 005 is approved.
- [ ] Complete editorial acceptance and PR merge for task 003.

Files are original geometry-based reconstructions, not a trademark search or warranty of exclusivity.
