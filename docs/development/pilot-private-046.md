# 046 – 60-second private visual rough cut (preparation, not render authorization)

**Roadmap:** M03 / 046 · [Issue #70](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/70).
**Status:** Video originals already privately staged on operator VPS; voice alignment is separate and opt-in; no 60-second render or public release.

## Verified operator input

The operator confirmed three official originals **on the VPS**, verified by exact byte size and SHA-256 (20 Nov 2026). `ffprobe` showed:

| Original ID | Video | Audio | Duration |
| --- | --- | --- | --- |
| P60-VID-001 | NASA Oma H.264 1080×720 (3:2) | none | 27.840 s |
| P60-VID-005 | NOAA open North Atlantic waves H.264 1920×1080 | AAC, excluded | 17.484 s |
| P60-VID-003 | NOAA Hurricane Helene H.264 3840×2160 | AAC, excluded | 34.858667 s |

The original files are private under `~/.bda-pilot-originals`, outside the public repo. Exact hashes/sizes/credits and **PRIVATE_INTERNAL_TEST_ONLY** restrictions are retained in `assets/pilot/rights-manifest.json`. Note that Helene's container duration differs slightly from the earlier technical reference; the byte-for-byte SHA matched. These files are **not** approved for public release. Source images must not falsely represent the same storm; the ocean-waves clip is only illustrative.

## Visual-only Remotion assembly

A new **separate entrypoint** `packages/video/src/entry-pilot-private-046.tsx` registers `BDA046PrivateVisualRoughCut`, an original **1800-frame / 30fps / 1920×1080** rough cut. It uses the locked nine 044 shot boundaries, genuine clips S01/S02/S06, original brand intro/outro (both nine-frame fades), the existing original scientific motion schematic (S03–S05) and a new schematic about reduced ocean energy (S07). It mutes **all outside media**; only the already-owned intro audio remains. The seven-segment Kokoro voice is now integrated **only when a verified and explicitly staged 60-second PCM WAV is present**. Unlicensed music remains excluded. A visible label makes it clear that the result would be an unfinished private narrated rough cut, not a finished narrated film. Do not claim this is the full issue 046 definition of done.

The standard 038/039/040/041 entrypoint and the existing 8s VPS 046 renderworker remain unchanged. The private composition is not registered in the ordinary proof root or web admin; **no API, job, flag, publication or database setting is changed**.

## Private media staging – separate, opt-in operator action after review

`scripts/stage-pilot-private-046.mjs` reads only the known three originals under `~/.bda-pilot-originals`, checks their owners, 0600-style file restrictions, expected bytes and SHA-256, and requires each source to be selected for `PRIVATE_INTERNAL_TEST_ONLY` with source audio blocked. It makes an atomic **private copy** of exactly these three originals and the unchanged two brand MP4s into `~/.bda-pilot-stage-046`, protected from Git tracking, with no network access or user-selected arbitrary paths. Existing destination causes an immediate refusal instead of overwriting.

The script requires explicit `BDA_PILOT_046_PRIVATE_STAGE=TRUE` and `--stage`; merely building or testing the PR has **no VPS side effects**. Only an explicit future opt-in `BDA_PILOT_046_PRIVATE_PUBLIC_DIR=$HOME/.bda-pilot-stage-046` plus `BDA_PILOT_046_VISUAL_PREVIEW=TRUE` tells the Remotion CLI to use the private media root for a *local* isolated visual preview. The normal Remotion public-dir configuration is unchanged.

**Do not render on the shared VPS yet.** A separate operator authorization, practical Remotion CPU/RAM/Chromium limits, safe private output path, final narration integration, private MP4 QA and resource budget are required before a full 60-second encode. Publishing remains disabled. No new paid tools or subscriptions.

## Automated proof

`scripts/check-pilot-private-046.test.mjs` compares the nine shot boundaries against the existing 044 timeline and verifies that every referenced original is one of the three scoped, allowed-but-not-publishable sources. It rejects changed source IDs, arbitrary URLs, accidental extra frames, missing scenes and broken crossfades. Required 033 CI also typechecks the new composition. None of those tests substitute for real playback review or licensing.

## Private 042 narration stage after operator SHA proof

The operator confirmed the original GitHub Actions 042 narration WAV matched SHA-256 `e9a554d85f7eb10cc7f49f5ae5347eb2e0ba445c1a84f6db25b2186669b6224f`. The locally saved source is `~/.bda-pilot-voice-source-046/pilot-narration.wav` (48.593 seconds, 48kHz PCM16 stereo, 7 real speech passages).

After explicit review, `scripts/stage-pilot-voice-046.py` with `BDA_PILOT_046_PRIVATE_VOICE_STAGE=TRUE` and `--stage` rechecks exact file hash, original 042 timing, script/044 release gates, and frame/sample ranges, then makes an **exactly 60-second** private PCM16 stereo WAV at `~/.bda-pilot-stage-046/audio/pilot-narration-aligned.wav`. It copies all seven spoken source sample ranges to their locked 044 start frames, with **no voice speed change** and complete silence over the 0–74 intro and 1620–1799 outro. Creation is exclusive: existing files are not overwritten. No model or network access, no music or NOAA original sound. This step does **not** render a movie.

The private-only Remotion composition references this single WAV at frame zero at gain 0.78, and retains the original intro's audio in its existing interval. Independent synthetic-only negative tests in GitHub Actions verify the sample/frame mapping and reject speech entering the intro or outro. **There is no new live web button or 60-second renderer, and no publication or media rights escalation.** A separately approved, resource-limited VPS render and private viewing/listening review are still required.

## 046: Isolated private still-frame smoke before any 60-second encode

The operator reported a successful exact 042 voice SHA check, `046 VOICE SELF-TEST PASS` and `046 PRIVATE VOICE STAGE: PASS`. This **does not** prove the real NASA/NOAA video frames or a 60s encoded film.

A separate Docker **image target** `pilot046preview` extends the existing 046 worker image **only when intentionally built** and adds a Chromium binary; it does not change the running worker046, DB, web or tunnel. `scripts/check-pilot-preview-046.mjs --check` is a read-only fail-closed media/host preflight: at least **2 GiB MemAvailable**, **12 GiB free disk**, the private 0700 stage tree, three source originals at the 036 exact byte counts and SHA-256, unchanged brand assets and the generated, aligned **60.000s** PCM16 stereo voice with zero overlaid speech in opening/outro.

`scripts/run-pilot-stills-046.sh --check` does no rendering. A separate, explicit opt-in `BDA_PILOT_046_PRIVATE_STILLS=TRUE scripts/run-pilot-stills-046.sh --stills` requires an exact-`main` image revision before producing **six individual private PNGs** for selected real frames S00/S01/S02/S04/S06/S08, never a whole MP4. Each one-shot container has **no outside network**, **0.5 CPU**, **1024 MiB RAM and no extra swap**, **200 PIDs maximum**, read-only root and source mount, one dedicated private output mount, dropped capabilities, no-new-privileges, limited tmpfs, Chromium and one source-frame thread. The output is outside the repository and public web root. Existing files are not overwritten.

A browser error or a resource/rights-gate failure is a **STOP**, not permission to disable sandboxing or increase limits. The operator should first review the six frames privately; a later separate agreement is needed for a resource-budgeted 60s encode, independent media QA and editorial listening/visual checks. No film or publish rights are granted here and no new subscription is involved.
