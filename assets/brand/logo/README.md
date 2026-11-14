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
- The icon-only files show that exact mark with a square `viewBox`; it is not a different drawing.
- The files contain **no `<rect>` backgrounds, embedded PNG/JPEG images, or external assets**.
- Ink colors differ for legibility: light surface `#021934`, dark surface `#F2F9FF`. The observation dot uses `#10AAEC` and `#19B7F4`, respectively. These are provisional production colors until Roadmap task 004.
- The SVG wordmark and tagline are vector-rendered SVG `<text>` elements. Their shapes depend on the available Inter/Arial font fallback; **outline-converted typography** should be finalized after task 005 (typography/license decision). Do not claim pixel-perfect matching to the reference PNG.
- The contour was **manually reconstructed from the approved PNG concept**. It matches across the four new SVGs by construction, but is not an automated pixel-for-pixel trace of the PNG reference.

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
- [ ] Render all four with an SVG renderer, inspect against reference PNGs.
- [ ] Visually verify 48×48 and 64×64 icon readability.
- [ ] Finalize typeface/convert typography to outlines when task 005 is approved.
- [ ] Complete editorial acceptance and PR merge for task 003.

Files are original geometry-based reconstructions, not a trademark search or warranty of exclusivity.
