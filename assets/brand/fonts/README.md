# BlueDotAtlas — Brand / Fonts

**Owner-approved families (14 Nov 2026):**
- **Space Grotesk** — display typography, film/documentary titles and thumbnails.
- **Inter** — UI, body text, subtitles and data labels.

Both are released under the **SIL Open Font License 1.1**, checked against the official Google Fonts source license files on 14 Nov 2026. Commercial use in website/video branding is allowed subject to the license conditions.

## In this folder

- [licenses/INTER-OFL.txt](licenses/INTER-OFL.txt) — official Inter license and copyright notice.
- [licenses/SPACE-GROTESK-OFL.txt](licenses/SPACE-GROTESK-OFL.txt) — official Space Grotesk license and copyright notice.
- [specimen.html](specimen.html) — responsive **font comparison** with Google Fonts CSS loading, for visual review.
- [Browser QA report](../../../docs/brand/typography-qa.md) — completed test with pinned upstream WOFF2 builds, results 3/3 PASS.
- [Typography guidelines](../../../docs/brand/typography.md) — font roles, suggested weights and website/1080p scales.

## Sources (verify when updating font versions)

| Family | Official Google Fonts entry | OFL license source |
| --- | --- | --- |
| Inter | https://fonts.google.com/specimen/Inter | https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt |
| Space Grotesk | https://fonts.google.com/specimen/Space+Grotesk | https://github.com/google/fonts/blob/main/ofl/spacegrotesk/OFL.txt |

## Deployment policy

No font binaries are currently duplicated in this repository. The app does not yet exist, and choosing exact WOFF2 files now would add an unnecessary maintenance burden.

When the Next.js app is built:
1. Use `next/font/google` for the two approved families when applicable, so Next.js can self-host/cache the fonts in its build output, or use vetted WOFF2 files from the official distribution with version pinning.
2. Test the exact shipped version, glyph coverage, fallback behavior, mobile and 1080p/TV legibility.
3. Keep the license and copyright notices alongside any redistributed font binaries, respecting SIL OFL requirements.
4. Do not silently change the approved icon or logo SVG shapes. If wordmark typography must become renderer-independent, submit a separately reviewed text-outlined logo variant.

**Important:** This folder documents licensed assets, not a working font deployment. The preview HTML loads fonts remotely and falls back gracefully if that request is blocked.

## Brand asset organization

```text
assets/brand/
├── logo/                   # existing, approved SVG logos; unchanged
├── colors/                 # visual palette; tokens in packages/ui/tokens
└── fonts/                  # font specimens and verified licenses
    ├── README.md
    ├── specimen.html
    └── licenses/
        ├── INTER-OFL.txt
        └── SPACE-GROTESK-OFL.txt
```

**Roadmap:** [Task 005 / Issue #9](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/9). Brand font pair is approved and its layout tested with real WOFF2 fonts at 375px, 768px and 1920×1080 in Chromium ([test evidence](../../../docs/brand/typography-qa.md)). Next.js/Remotion and actual viewing-distance validation are tracked for their later implementation milestones.
