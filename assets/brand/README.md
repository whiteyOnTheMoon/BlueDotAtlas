# BlueDotAtlas — Brand Assets

This directory is the common home for reusable **brand artwork and font documentation**. Source files for production code are still kept in their intended technical locations.

| Folder | Contents | Authoritative technical reference |
| --- | --- | --- |
| [logo/](logo/) | Four approved transparent, crop-optimized Earth Contour SVG logos and icon-only variants | Actual SVG assets in this folder — do not modify geometry or undo the owner's two cleanup commits |
| [colors/](colors/) | Deep Ocean / Glacial Light palette illustration and usage notes | [`packages/ui/tokens/colors.ts`](../../packages/ui/tokens/colors.ts) |
| [fonts/](fonts/) | Space Grotesk and Inter reference preview and verified open-font license text | [`docs/brand/typography.md`](../../docs/brand/typography.md); deployment integration in Next.js later |

## Project rules
- Name: **BlueDotAtlas**. Claim: **The Planet Has a Story.**
- Filming and publishing language: English.
- Color palette approved (DEC-014).
- Free font pairing approved (DEC-015): Space Grotesk for display, Inter for UI/body/subtitles.
- Existing SVG logo art, color inks and file hierarchy are approved; no unrequested alteration.
- Font binaries are **not** checked into the brand kit at this early stage. When application integration begins, pin/font-host the correct versions and ship original SIL OFL license notices alongside any redistributed font files.
- Keep palettes and specimens here, but keep `packages/ui/tokens/colors.ts` as the sole runtime source for color semantics.
- The user deliberately removed `assets/brand/concepts/` and the redundant `assets/brand/logo.svg`; do not restore either.

**Approval/status:** colors and font **design choices** approved 14 Nov 2026. Task 005 representative real-font browser tests passed at 375px, 768px and 1920×1080. Later production-app loading and physical TV-device testing remain explicit follow-up work; see [Typography QA](../../docs/brand/typography-qa.md).
