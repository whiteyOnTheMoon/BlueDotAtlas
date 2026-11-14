# BlueDotAtlas — The ONE Official Thumbnail Template

**Roadmap:** M00 / 006.  
**Decision:** **APPROVED** — one fixed thumbnail composition based on the very first ocean concept shown to the owner on 2026-11-14 (DEC-017).  
**Status:** **APPROVED + MERGED** — [Task 006 Issue #13](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/13) completed with [PR #14](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/14) and 12/12 tested browser layouts at 1280/320/160.

## Only one template

**[`template.svg`](template.svg)** is the **single master** for BlueDotAtlas thumbnails. It encodes the visual composition chosen from the original ocean image:

- Actual approved **BlueDotAtlas logo and tagline at top left**, same geometry/text as [`../logo/logo-dark.svg`](../logo/logo-dark.svg).
- **Large white-and-one-blue-accent headline, always on the LEFT**.
- **Main photographic/illustrative science motif, always on the RIGHT**.
- **Deep-navy gradient/scrim behind headline**, revealing the hero image to the right.
- **Thin cyan/teal rounded outline border** and **short teal underline** beneath the title.
- Same 1280×720 16:9 canvas and consistent dimensions across episodes.

The media and words are **slots**, not alternative template layouts. **Do not move** the logo, headline or accent line to suit a subject. Instead choose/crop the background image and shorten the headline.

## Topic demos — NOT additional templates

| File | Different content | Unchanged layout |
| --- | --- | --- |
| [`mockups/ocean-currents.svg`](mockups/ocean-currents.svg) | Ocean swirl illustration + ocean headline | Logo upper left, title left, image right |
| [`mockups/changing-ice.svg`](mockups/changing-ice.svg) | Ice illustration + ice headline | **Same** positions, colors and frame |
| [`mockups/storm-from-space.svg`](mockups/storm-from-space.svg) | Storm illustration + storm headline | **Same** positions, colors and frame |

[Compare all three as a single sheet](overview.svg).

These are **conceptual editable SVG illustrations**, not actual observational data and not pixel-for-pixel replications of the original generated image in the chat. The user approved **the composition and style**; the photorealistic reference background is not a verified NASA scene.

## SVG slots

Master and example SVGs annotate elements as `data-slot="background-image"`, `data-slot="approved-logo"`, `data-slot="left-title-block"`, `data-slot="headline-line-N"`, `data-slot="underline"` and `data-slot="border"`. All are designed around **1280×720**.

For new topics: replace the underlying sample illustration with properly rights-cleared real footage stills (or transparently labeled science artwork), and change the headline lines. Keep the remaining artwork exactly aligned.

**Existing logo originals are unchanged.** The header in the template embeds the same approved SVG path/text markup as `assets/brand/logo/logo-dark.svg`; copying it into each standalone thumbnail SVG is deliberate so previews/export do not depend on an external relative asset URL. If the official logo is later updated by a separately approved decision, the embedded header must be regenerated from it.

The approved fonts are **Space Grotesk 700** (headlines) and **Inter** where screen text is required; font previews require a renderer with those fonts available. The GitHub Actions thumbnail test downloads exact known OFL font versions into temporary storage.

## Important release limits

- **No multiple official templates.** All future topics use this single composition.
- The concept ocean/ice/storm vector backgrounds are **not real satellite images**. Any production claim must be supported by the film research and individually licensed sourced media.
- The original thumbnail preview (shown by the owner in chat) remains the *creative reference*. The SVG copies the layout but not the exact pixels of the generated background.
- A YouTube export must pass manual checks at 320/160px, document rights, and respect the timestamp zone.
- The illustrations deliberately omit a large "Concept Mockup" label on the artwork. The status disclaimer lives in SVG description, this README and project documentation — publishing controls must still prevent their use as real observational footage.

For full rules and factual-image policies see [Visual Language V0.1](../../../docs/brand/visual-language.md).
