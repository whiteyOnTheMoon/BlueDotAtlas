# BlueDotAtlas — Thumbnail Layout Concepts

**Task:** [006 – Bildsprache und Thumbnail-Regeln](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/13)  
**Status:** DRAFT — user review pending

## Files

- [overview.svg](overview.svg) — one contact sheet of all three layout studies.
- [mockups/ocean-currents.svg](mockups/ocean-currents.svg) — Ocean's Hidden Engine.
- [mockups/changing-ice.svg](mockups/changing-ice.svg) — Why Ice Is Changing.
- [mockups/storm-from-space.svg](mockups/storm-from-space.svg) — Storms From Space.
- [Visual language rules](../../../docs/brand/visual-language.md) — scientific integrity, licensing checks, typography grid, camera treatment and launch requirements.

All three vectors are **1280×720** (16:9) editable SVG concept thumbnails. Their scenes are **illustrations, not real NASA/NOAA satellite imagery**. Their scientific headlines are early creative examples, to be researched before they become live video titles.

## Brand constraints

The existing exact SVG logos in `assets/brand/logo/` remain **untouched**. Our working thumbnail mockups use a small typographic brand identifier, not a replacement logo; final published uses must reference the approved logo assets.

Colors derive from [the approved color tokens](../../../packages/ui/tokens/colors.ts); display typography assumes **Space Grotesk 700**, with **Inter** for minor labels. SVG fonts can vary in GitHub preview/browser depending on installed font availability. The separate 006 browser test explicitly loads approved real font WOFF2 sources to check bounding boxes.

## Reviewing

- Open **overview.svg** to see the three layouts as a single sheet.
- Open each file individually for a native 16:9 editable version.
- Look at **320px and 160px** widths, not only on a desktop.
- Check whether the focal image and short text are clear; optional small brand label and metadata are not intended to remain readable at 160px.
- Select or refine the concept pattern: right-side ocean subject, lower-left ice title, right-side storm title. They need not all use the same headline position.

## Publishing limitations

These files are **not** ready-to-upload documentary thumbnails: the image content is invented by design. Replace abstract scenes with rights-checked actual imagery when the episode concerns a real location or observation; track source/license/attribution and do not imply NASA endorsement. No video/published claims have been verified in this task.

## Acceptance status

- [x] Three distinct visual subjects and headline placements drafted.
- [x] All use shared BlueDotAtlas brand colors and free-font stack.
- [ ] Browser tests at 1280/320/160 completed and reviewed.
- [ ] User approves stylistic rules and representative designs (or requests changes).
- [ ] PR merged and Issue #13 closed.
