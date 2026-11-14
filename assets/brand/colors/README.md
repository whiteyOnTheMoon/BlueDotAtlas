# BlueDotAtlas — Brand / Colors

**Approved palette:** Deep Ocean / Glacial Light · Owner approval in project chat, 14 Nov 2026.

## Assets

- [palette.svg](palette.svg) — scalable color swatch and sample UI board.
- [Color system documentation](../../../docs/brand/colors.md) — roles, contrast checks, application rules.
- [TypeScript color tokens](../../../packages/ui/tokens/colors.ts) — **single technical source of truth** for web UI, graphics and maps.
- [Contrast test](../../../scripts/check-color-contrast.mjs) — reproduce the 18 checked foreground/background pairs with Node.js.

## Primary brand colors

| Name | sRGB hex | Source/role |
| --- | --- | --- |
| Deep Sea | `#021934` | Existing approved dark logo ink and light-mode text |
| Ice White | `#F2F9FF` | Existing approved dark-surface logo ink |
| Blue Dot | `#10AAEC` | Existing bright logo-point color for light backgrounds |
| Deep Night | `#071522` | Dark background |
| Glacier | `#37D6C4` | Secondary accent |

The approved logo SVGs remain **unchanged**. A deeper `#026E9E` is used for accessible primary buttons on light surfaces; the brighter logo blue must not be used as small text on white backgrounds.

## Structure policy

Keep brand deliverables under `assets/brand/` and code-consumed color variables under `packages/ui/tokens/colors.ts`. Do not duplicate the TypeScript token file here. Future editors should update the token source and regenerate the illustrative palette if hex values change.

**Status:** User selected palette; final PR merge/GitHub issue close tracked under [#7](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/7).
