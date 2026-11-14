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
- **Full logo:** the same icon extents determine the left/top/bottom, while the wordmark's declared `textLength="1290"` from `x="691"` places its intended rightmost text edge at x=1981, with 4 SVG units of right space to x=1985.
- **Renderer caveat:** the wordmark is still SVG `<text>`, and some SVG renderers may not honor `textLength` or may substitute a different font. Their *visible* right margin may therefore differ. To make the margin pixel-perfect in every environment, convert the approved lettering to outlines after typography selection (task 005).
- This tight-crop format deliberately has a **non-square icon artboard**. A 48×48 application icon should be placed inside a square app-icon container with suitable external padding; the brand SVG itself is not stretched to a square.
- Both color variants share identical artboard dimensions, exact same Bézier paths and the same center-point coordinates.

**Structure:** This folder is the single source of truth for production logo files. The previously used `assets/brand/concepts/` folder and duplicate `assets/brand/logo.svg` were intentionally removed by the project owner in two commits and are not to be recreated.

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
- [ ] Render all four with an SVG renderer, inspect against reference PNGs.
- [ ] Visually verify 48×48 and 64×64 icon readability.
- [ ] Finalize typeface/convert typography to outlines when task 005 is approved.
- [ ] Complete editorial acceptance and PR merge for task 003.

Files are original geometry-based reconstructions, not a trademark search or warranty of exclusivity.
