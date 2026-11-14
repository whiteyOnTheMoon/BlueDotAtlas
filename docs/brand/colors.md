# BlueDotAtlas — Color System V0.1 (proposal)

**Roadmap:** M00 / 004 — Farbwelt und Kontrastregeln  
**Status:** DESIGN APPROVED — owner approved Deep Ocean / Glacial Light in project chat (14 Nov 2026); merge evidence tracked in [Issue #7](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/7)  
**Source of truth:** [`packages/ui/tokens/colors.ts`](../../packages/ui/tokens/colors.ts)  
**Review date:** 2026-11-14

**Brand asset:** [`assets/brand/colors/palette.svg`](../../assets/brand/colors/palette.svg) (visual color board). The source of semantic color values remains `packages/ui/tokens/colors.ts`.

## Design intent

**Deep Ocean / Glacial Light:** a premium cinematic Earth-science palette with strong photographic contrast and minimal visual noise. Existing contour-logo inks stay exactly as approved; UI tokens make those colors accessible for interactive interfaces and overlays.

## Base colors

| Role | Hex | Use |
| --- | --- | --- |
| Deep Sea | `#021934` | approved navy logo ink; dark text on light surfaces; titles |
| Ice White | `#F2F9FF` | approved logo ink for dark surfaces; subtitles and dark-mode text |
| Blue Dot (light-logo) | `#10AAEC` | approved blue point in SVG for light backgrounds; icon accents |
| Blue Dot (dark-logo) | `#19B7F4` | approved blue point in SVG for dark backgrounds; dark-mode primary |
| Glacier Accent | `#37D6C4` | optional secondary highlight for maps/charts, with dark text when used as a fill |
| Deep Night | `#071522` | dark UI background |
| Pale Sky | `#F7FBFF` | light UI background |

**Existing logo files are not modified.** These values form a proposed palette, not a retrospective change to the logo decision.

## Semantic tokens

| Usage | Light mode | Dark mode |
| --- | --- | --- |
| Page background | `#F7FBFF` | `#071522` |
| Surface/panel | `#FFFFFF` | `#0E2942` |
| Main text | `#021934` | `#F2F9FF` |
| Muted text | `#40566D` | `#B4CCDC` |
| Primary button fill | `#026E9E` | `#19B7F4` |
| Primary button label | `#FFFFFF` | `#021934` |
| Accent fill | `#37D6C4` | `#37D6C4` |
| Accent label | `#021934` | `#021934` |
| Form/control outline | `#667E91` | `#6D92A9` |
| Decorative divider | `#CADDEB` | `#31546D` |
| Focus ring | `#026E9E` | `#19B7F4` |

### Critical distinction: branding vs accessible text

The approved lighter logo blue `#10AAEC` has only **~2.53:1** contrast on the light page background `#F7FBFF`: it is **not appropriate for small regular text**. We therefore use the deeper `#026E9E` as the light-mode accessible primary button color while leaving the original logo unchanged.

Do not use a decorative divider for required form-field outlines; use the higher-contrast `controlBorder` token.

## WCAG 2.2 color audit

Based on W3C WCAG 2.2 success criteria **1.4.3** (4.5:1 normal text, 3:1 large text) and **1.4.11** (3:1 required non-text controls). Source: https://www.w3.org/TR/WCAG22/ .

Using sRGB relative luminance, evaluated on the exact hex values in `colors.ts`:

| Test | Ratio | Minimum | Result |
| --- | ---: | ---: | --- |
| Light text on light page | 16.96:1 | 4.5 | Pass |
| Light muted text on light page | 7.29:1 | 4.5 | Pass |
| Light control border on light page | 4.07:1 | 3 | Pass |
| Light white label on primary button | 5.64:1 | 4.5 | Pass |
| Light navy label on accent button | 9.72:1 | 4.5 | Pass |
| Dark text on dark page | 17.35:1 | 4.5 | Pass |
| Dark muted text on dark page | 11.07:1 | 4.5 | Pass |
| Dark control border on dark page | 5.56:1 | 3 | Pass |
| Dark navy label on primary button | 7.66:1 | 4.5 | Pass |
| Dark navy label on accent button | 9.72:1 | 4.5 | Pass |

**Automated test:** `node scripts/check-color-contrast.mjs` checks **18 light/dark text, surface, button, control-border and focus-ring pairings** directly from the TypeScript tokens; all 18 ratios pass the programmed thresholds in the initial computation. The script is dependency-free; CI integration is deferred to the designated automation phase.

### Charts, maps and motion

- **Light charts:** Ocean `#00739B`; cryosphere `#087F74`; land `#9B4E04`; atmosphere `#6E47B5`; alert `#B64B42`.
- **Dark charts:** Ocean `#19B7F4`; cryosphere `#3CDFC2`; land `#FFC178`; atmosphere `#B9A5F7`; alert `#FF9278`.
- **Map marker:** `#00739B` on light, `#19B7F4` on dark. Keep legend/label text in the regular semantic text colors.
- **Motion graphics:** on dark footage use `#F2F9FF` titles and `#19B7F4` data markers, on light backgrounds `#021934` titles and `#00739B` data highlights. For variable footage add scrims; never assume contrast on arbitrary photos.
- Use **labels, patterns and shapes in addition to color** to encode categories.
- Color shades for different maps and data classes are **not** scientific evidence and should not imply a numerical gradient without a valid legend.

## Testing and open tasks

- [x] Exact colors proposed with existing SVG-logo inks preserved.
- [x] Light/dark semantic UI + chart/map/motion tokens authored.
- [x] 18 source-derived WCAG color-contrast pairings computed and passing.
- [x] Owner reviewed a representative dark UI/documentary title preview alongside the colors and type pairing.
- [ ] Actual 1080p video rendering with footage remains a separate Motion/Brand-Gate check (tasks 007–009).
- [x] Deep Ocean / Glacial Light approved by the user with “Ok, einverstanden” (14 Nov 2026; DEC-014).
- [ ] PR reviewed / merged; Issue #7 closed.

**Decision:** Palette approved. Fonts Space Grotesk + Inter are also selected; typography licensing and actual display tests remain part of task 005.
