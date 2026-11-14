# BlueDotAtlas — Typography V0.1 (approved and tested)

**Roadmap:** M00 / 005 — Typografie und Schriftlizenzen  
**Status:** Brand typography APPROVED by owner (DEC-015) and representative real-font browser tests passed at 375px, 768px and 1920×1080; [QA evidence](typography-qa.md). Production-app/TV-device validation remains follow-up work for later roadmap tasks.  
**Issue:** [#9](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/9)  
**Requirement:** Only freely licensed fonts fit for commercial websites, videos and branding (user decision DEC-013).

## Approved free font pair

### Screen / UI / subtitles: Inter
- **Type:** legible variable sans serif optimized for screens.
- **Proposed weights:** 400 (body), 500 (controls), 600 (subtitles), 700 (strong text).
- **Usage:** website, admin UI, captions, lower thirds, source notes, charts.
- **License:** SIL Open Font License 1.1, as distributed in Google Fonts.
- **Author / provenance:** The Inter Project Authors (Rasmus Andersson et al.); original project https://github.com/rsms/inter
- **Verified OFL file:** https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt

### Display / cinematic titles: Space Grotesk
- **Type:** expressive geometric sans, suitable for documentary titles and hero headings.
- **Proposed weights:** 600 and 700 for titles, 500 for shorter display headings.
- **Usage:** film chapter cards, hero typography, thumbnail headlines and selected page headings.
- **License:** SIL Open Font License 1.1, as distributed in Google Fonts.
- **Author / provenance:** The Space Grotesk Project Authors, design by Florian Karsten; original project https://github.com/floriankarsten/space-grotesk
- **Verified OFL file:** https://github.com/google/fonts/blob/main/ofl/spacegrotesk/OFL.txt

Both fonts can be used in commercial branding/web/video applications subject to the OFL. **When distributing the font files**, include their original copyright and license text. Do **not** sell the font files standalone, violate Reserved Font Name requirements, or claim trademark exclusivity.

**Font assets stored in [`assets/brand/fonts/`](../../assets/brand/fonts/):** Responsive specimen HTML, verified official Inter and Space Grotesk `OFL.txt` license snapshots (14 Nov 2026), and licensing/deployment notes. **No font binaries are bundled in the repository yet**. When implementing the website, pin font versions, self-host or use `next/font` where supported, and retain the matching `OFL.txt` and copyright notices in the repository. Check the exact files obtained, rather than relying only on the font-family name.

## Type scale — Website (provisional sizes pending responsive device test)

| Usage | Font / Weight | Size (first proposal) |
| --- | --- | --- |
| Hero headline | Space Grotesk 700 | `clamp(2.5rem, 5vw, 5rem)` |
| Section title | Space Grotesk 600 | `clamp(1.75rem, 3vw, 3rem)` |
| Card heading | Space Grotesk 600 | `1.25rem` |
| Body | Inter 400 | `1rem` (16px base), 1.55 line-height |
| Article/Research summary | Inter 400 | `1.125rem` (18px), 1.6 line-height |
| UI controls and labels | Inter 500–600 | `0.875–1rem` (14–16px) |
| Metadata | Inter 500 | `0.875rem` (14px) |

Use responsive line lengths (roughly 55–75 characters for reading surfaces) and allow zoom/text scaling without overflow. No unnecessary letter-spacing on small body text.

## Type scale — Full HD 1920 × 1080 (provisional sizes pending TV test)

| Usage | Font / Weight | Starting range (px) | Rules |
| --- | --- | ---: | --- |
| Documentary chapter title | Space Grotesk 700 | 100–140 | Max 2 lines; prioritize image |
| Thumbnail headline | Space Grotesk 700 | 130–190 | Usually 3–6 concise words |
| On-screen location heading | Space Grotesk 600 | 55–72 | Only when context needs it |
| Narration subtitles | Inter 600 | 52–60 | Max 2 lines, safe area, contrast scrim if needed |
| Lower third | Inter 500/600 | 44–52 | Name and place/fact only |
| Source note | Inter 500 | 28–36 | When essential, provide longer source details elsewhere |

These are **proposals, not validated universal accessibility thresholds**. Real 1080p playback on a TV/viewer, mobile thumbnail previews and high-motion footage must be tested; adjust lengths and sizes based on the actual sample.

## Example text for later screen/TV review

**Display example:** `The Planet Has a Story.`  
**Thumbnail example:** `The Ocean Is Changing`  
**Subtitle example:** `Satellites show how water and heat move around our planet.`  
**Scientific note example:** `Source: NOAA / Observation period: 2015–2025`

The above are typography samples, not verified documentary claims.

## Approved logo relationship

Keep the owner's existing `assets/brand/logo/` SVG geometry, colors and artboard untouched. The full wordmark SVG currently uses an Inter/Arial font fallback in `<text>`; the final logo font display may differ across renderers. After choosing free typefaces, test it with the selected versions. **Do not silently change the approved logo path or lettering.** If the design must be font-independent, propose a separately reviewed outlined-text variant.

## Web integration concept (not executed)

```css
:root { --font-screen: "Inter", system-ui, sans-serif; --font-display: "Space Grotesk", "Inter", sans-serif; }
body { font-family: var(--font-screen); }
h1, h2, .display-title { font-family: var(--font-display); }
```

When implemented with bundled font files, preserve exact OFL copyright/notice and test WOFF2 loading, weight range and fallback behavior in the actual Next.js application.

## Browser QA / evidence

[Typography acceptance report](typography-qa.md) documents the successful pinned-font Chromium test (3/3 representative viewport sizes), licensing and explicit limits of the evidence. The owner confirmed the design sample was readable before the test. This validates the **brand design stage**, not the not-yet-built production app.

## Abnahme-Checkliste

- [x] Both free/open-licensed font families selected by the user: Space Grotesk (display) and Inter (screen).
- [x] Official license documents fetched and checked for SIL OFL 1.1; copies saved under `assets/brand/fonts/licenses/`.
- [x] Initial responsive website/1080p/thumbnail type scales documented.
- [x] Color task 004 approved and merged in PR #8.
- [x] Font family pair explicitly approved by user (DEC-015).
- [x] Pinned upstream WOFF2 test builds used: Inter commit `353b61b9` and Space Grotesk commit `03507d0`; WOFF2 validity/font loading checked. Official SIL OFL 1.1 license notices stored in the brand assets.
- [x] Representative mobile/tablet title and body typography tested in Chromium at 375px and 768px; no overflows, both families really loaded. Actual future published thumbnail imagery is tested in task 006.
- [x] 1920×1080 representative typographic film frame tested in Chromium: Space Grotesk title and Inter subtitle in safe area, no overlap/overflow.
- [ ] Physical TV-distance check with rendered film footage belongs to the later Motion/Film gates; no production film exists yet.
- [x] Font selection approved by user and original PR #10 merged; final browser QA is linked from the follow-up test PR and Issue #9.

**Documentation note:** Font selection, license checks and representative real-font browser tests are complete for the design-stage task 005. Production Next.js/Remotion and actual-device tests must be rerun in the later relevant tasks; do not claim those systems exist. Never copy fonts into customer-facing deliverables without checking permitted redistribution obligations.
