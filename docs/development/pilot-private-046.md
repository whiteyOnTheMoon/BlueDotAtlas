# 046 – 60-second private visual rough cut (preparation, not render authorization)

**Roadmap:** M03 / 046 · [Issue #70](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/70).
**Status:** In review; no actual 60-second film rendered; no public release.

## Verified operator input

The operator confirmed three official originals **on the VPS**, verified by exact byte size and SHA-256 (20 Nov 2026). `ffprobe` showed:

| Original ID | Video | Audio | Duration |
| --- | --- | --- | --- |
| P60-VID-001 | NASA Oma H.264 1080×720 (3:2) | none | 27.840 s |
| P60-VID-005 | NOAA open North Atlantic waves H.264 1920×1080 | AAC, excluded | 17.484 s |
| P60-VID-003 | NOAA Hurricane Helene H.264 3840×2160 | AAC, excluded | 34.858667 s |

The original files are private under `~/.bda-pilot-originals`, outside the public repo. Exact hashes/sizes/credits and **PRIVATE_INTERNAL_TEST_ONLY** restrictions are retained in `assets/pilot/rights-manifest.json`. Note that Helene's container duration differs slightly from the earlier technical reference; the byte-for-byte SHA matched. These files are **not** approved for public release. Source images must not falsely represent the same storm; the ocean-waves clip is only illustrative.

## Visual-only Remotion assembly

A new **separate entrypoint** `packages/video/src/entry-pilot-private-046.tsx` registers `BDA046PrivateVisualRoughCut`, an original **1800-frame / 30fps / 1920×1080** rough cut. It uses the locked nine 044 shot boundaries, genuine clips S01/S02/S06, original brand intro/outro (both nine-frame fades), the existing original scientific motion schematic (S03–S05) and a new schematic about reduced ocean energy (S07). It mutes **all outside media**; only the already-owned intro audio remains. The seven-segment actual Kokoro voice, precise voice alignment and music are **not yet integrated**. A visible label makes it clear that the result would be an unfinished private visual rough cut, not a finished narrated film. Do not claim this is the full issue 046 definition of done.

The standard 038/039/040/041 entrypoint and the existing 8s VPS 046 renderworker remain unchanged. The private composition is not registered in the ordinary proof root or web admin; **no API, job, flag, publication or database setting is changed**.

## Private media staging – separate, opt-in operator action after review

`scripts/stage-pilot-private-046.mjs` reads only the known three originals under `~/.bda-pilot-originals`, checks their owners, 0600-style file restrictions, expected bytes and SHA-256, and requires each source to be selected for `PRIVATE_INTERNAL_TEST_ONLY` with source audio blocked. It makes an atomic **private copy** of exactly these three originals and the unchanged two brand MP4s into `~/.bda-pilot-stage-046`, protected from Git tracking, with no network access or user-selected arbitrary paths. Existing destination causes an immediate refusal instead of overwriting.

The script requires explicit `BDA_PILOT_046_PRIVATE_STAGE=TRUE` and `--stage`; merely building or testing the PR has **no VPS side effects**. Only an explicit future opt-in `BDA_PILOT_046_PRIVATE_PUBLIC_DIR=$HOME/.bda-pilot-stage-046` plus `BDA_PILOT_046_VISUAL_PREVIEW=TRUE` tells the Remotion CLI to use the private media root for a *local* isolated visual preview. The normal Remotion public-dir configuration is unchanged.

**Do not render on the shared VPS yet.** A separate operator authorization, practical Remotion CPU/RAM/Chromium limits, safe private output path, final narration integration, private MP4 QA and resource budget are required before a full 60-second encode. Publishing remains disabled. No new paid tools or subscriptions.

## Automated proof

`scripts/check-pilot-private-046.test.mjs` compares the nine shot boundaries against the existing 044 timeline and verifies that every referenced original is one of the three scoped, allowed-but-not-publishable sources. It rejects changed source IDs, arbitrary URLs, accidental extra frames, missing scenes and broken crossfades. Required 033 CI also typechecks the new composition. None of those tests substitute for real playback review or licensing.
