# 046 – 60-second private visual rough cut (preparation, not render authorization)

**Roadmap:** M03 / 046 · [Issue #70](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/70).
**Status (21 Nov 2026):** The operator confirmed private SHA-/byte-verified staging of three original source videos and two own brand MP4s, plus a successful exact 042 Kokoro voice alignment (`046 PRIVATE VOICE STAGE: PASS`) to a private 60-second WAV. PRs #220 and #221 are merged; six-frame preview [draft PR #222](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/222) awaits final review. **No live VPS stills, full 60-second film render or publication has been confirmed or authorized.**

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

## Private media staging – opt-in process (operator reported PASS)

`scripts/stage-pilot-private-046.mjs` reads only the known three originals under `~/.bda-pilot-originals`, checks their owners, 0600-style file restrictions, expected bytes and SHA-256, and requires each source to be selected for `PRIVATE_INTERNAL_TEST_ONLY` with source audio blocked. It makes an atomic **private copy** of exactly these three originals and the unchanged two brand MP4s into `~/.bda-pilot-stage-046`, protected from Git tracking, with no network access or user-selected arbitrary paths. Existing destination causes an immediate refusal instead of overwriting.

The script requires explicit `BDA_PILOT_046_PRIVATE_STAGE=TRUE` and `--stage`; merely building or testing the PR has **no VPS side effects**. Only an explicit future opt-in `BDA_PILOT_046_PRIVATE_PUBLIC_DIR=$HOME/.bda-pilot-stage-046` plus `BDA_PILOT_046_VISUAL_PREVIEW=TRUE` tells the Remotion CLI to use the private media root for a *local* isolated visual preview. The normal Remotion public-dir configuration is unchanged.

**Do not render on the shared VPS yet.** A separate operator authorization, practical Remotion CPU/RAM/Chromium limits, safe private output path, final narration integration, private MP4 QA and resource budget are required before a full 60-second encode. Publishing remains disabled. No new paid tools or subscriptions.

## Automated proof

`scripts/check-pilot-private-046.test.mjs` compares the nine shot boundaries against the existing 044 timeline and verifies that every referenced original is one of the three scoped, allowed-but-not-publishable sources. It rejects changed source IDs, arbitrary URLs, accidental extra frames, missing scenes and broken crossfades. Required 033 CI also typechecks the new composition. None of those tests substitute for real playback review or licensing.

## Private 042 narration stage (operator reported PASS)

The operator confirmed the original GitHub Actions 042 narration WAV matched SHA-256 `e9a554d85f7eb10cc7f49f5ae5347eb2e0ba445c1a84f6db25b2186669b6224f`. The locally saved source is `~/.bda-pilot-voice-source-046/pilot-narration.wav` (48.593 seconds, 48kHz PCM16 stereo, 7 real speech passages).

After explicit review, `scripts/stage-pilot-voice-046.py` with `BDA_PILOT_046_PRIVATE_VOICE_STAGE=TRUE` and `--stage` rechecks exact file hash, original 042 timing, script/044 release gates, and frame/sample ranges, then makes an **exactly 60-second** private PCM16 stereo WAV at `~/.bda-pilot-stage-046/audio/pilot-narration-aligned.wav`. It copies all seven spoken source sample ranges to their locked 044 start frames, with **no voice speed change** and complete silence over the 0–74 intro and 1620–1799 outro. Creation is exclusive: existing files are not overwritten. No model or network access, no music or NOAA original sound. This step does **not** render a movie.

The private-only Remotion composition references this single WAV at frame zero at gain 0.78, and retains the original intro's audio in its existing interval. Independent synthetic-only negative tests in GitHub Actions verify the sample/frame mapping and reject speech entering the intro or outro. **There is no new live web button or 60-second renderer, and no publication or media rights escalation.** A separately approved, resource-limited VPS render and private viewing/listening review are still required.

## 046: Isolated private still-frame smoke before any 60-second encode (Draft PR #222)

The operator reported a successful exact 042 voice SHA check, `046 VOICE SELF-TEST PASS` and `046 PRIVATE VOICE STAGE: PASS`. This **does not** prove the real NASA/NOAA video frames or a 60s encoded film.

A separate Docker **image target** `pilot046preview` extends the existing 046 worker image **only when intentionally built** and adds a Chromium binary; it does not change the running worker046, DB, web or tunnel. `scripts/check-pilot-preview-046.mjs --check` is a read-only fail-closed media/host preflight: at least **2 GiB MemAvailable**, **12 GiB free disk**, the private 0700 stage tree, three source originals at the 036 exact byte counts and SHA-256, unchanged brand assets and the generated, aligned **60.000s** PCM16 stereo voice with zero overlaid speech in opening/outro.

`scripts/run-pilot-stills-046.sh --check` does no rendering. A separate, explicit opt-in `BDA_PILOT_046_PRIVATE_STILLS=TRUE scripts/run-pilot-stills-046.sh --stills` requires an exact-`main` image revision before producing **six individual private PNGs** for selected real frames S00/S01/S02/S04/S06/S08, never a whole MP4. Each one-shot container has **no outside network**, **0.5 CPU**, **1024 MiB RAM and no extra swap**, **200 PIDs maximum**, read-only root and source mount, one dedicated private output mount, dropped capabilities, no-new-privileges, limited tmpfs, Chromium and one source-frame thread. The output is outside the repository and public web root. Existing files are not overwritten.

A browser error or a resource/rights-gate failure is a **STOP**, not permission to disable sandboxing or increase limits. The operator should first review the six frames privately; a later separate agreement is needed for a resource-budgeted 60s encode, independent media QA and editorial listening/visual checks. No film or publish rights are granted here and no new subscription is involved.


### Isolated CI image-build boundary and operator review gate

The separate workflow [046 private preview image build and offline tooling smoke](../../.github/workflows/pilot-private-046-preview-image-check.yml) is triggered by affected preview/Docker files. It builds **only** the optional `pilot046preview` target on a disposable GitHub runner, asserts the revision label, and starts a no-network/unprivileged/read-only container to check Chromium, FFmpeg/ffprobe, Python and Remotion CLI availability. It neither reads the operator's private original media nor renders a still or 60-second MP4. A passing CI image check **cannot** prove real media decode or private still-frame appearance.

Even after a successful CI build and explicit PR merge approval, the operator must separately approve any VPS image build and still-frame execution. Run `scripts/run-pilot-stills-046.sh --check` **first** on the single authorized `main` checkout; inspect its read-only preflight result. The `--stills` mode also requires the separately built image with the exact current main revision label and the explicit `BDA_PILOT_046_PRIVATE_STILLS=TRUE` opt-in. No build or runtime action is automatically performed by merge. If a preflight, image, browser or resource gate fails, **STOP** and review rather than relaxing controls. Keep the resulting PNGs private; no publication and no full-film authorization.


## Private still smoke: first VPS failure and proposed fix (21 Nov 2026)

The operator explicitly approved the optional local `pilot046preview` image build and six private PNG samples. The image build **passed** and the embedded revision matched squash `b11488a`. The independent host/media preflight again **passed** (three unchanged SHA-verified originals, two brand clips, aligned original voice, minimum memory/disk). The very first one-shot render (`S00`, intro) then returned to the shell without reporting a completed frame; Webpack printed `EROFS: read-only file system, mkdir '/app/packages/video/node_modules/.cache'`. **No complete six-still proof exists.** The exact failing exit reason beyond this warning is not yet independently confirmed; an OOM or another hidden Remotion error is not ruled out.

Remotion documents `--bundle-cache=false` for disabling Webpack disk caching. This narrowly scoped fix adds that flag to the private `still` invocation while preserving the **read-only filesystem**, no network, 0.5 CPU, 1024MiB RAM/swap, 200 PIDs, private source bind and operator consent. The CLI log level changes from `error` to `info` for diagnosis. The script may reuse an **empty**, 0700/UID1000, non-symlink private output directory left by the interrupted attempt; nonempty/unknown output blocks execution and is never overwritten or deleted. The private source stage remains unchanged.

In the separate preview CI, a deliberately **synthetic**, one-frame, 1080p PNG now exercises the real Remotion/Chromium bundle and rendering process in a networkless, unprivileged, read-only, 0.5-CPU/1024MiB Docker container. The sample uses no NASA, NOAA, brand or operator audio assets. CI success does not establish decoding of real private media, so the actual VPS stills still need new operator review **after PR approval/merge and a revision-matched image rebuild**. Until then, do not repeat the old image's `--stills` command, delete the review folder, relax the sandbox, or attempt the 60-second MP4.


## 046 – Six original-media private stills: operator proof, and OPTIONAL 60s private MP4 preparation (21 Nov 2026)

**Verified by operator VPS logs, after merging PRs #222/#223:** All six real 1080p stills in `~/.bda-pilot-review-046/`, private folder mode 0700, PNGs mode 0600. S00 1,445,218 B (frame 30), S01 1,303,939 B (frame 160), S02 1,884,940 B (frame 380), S04 269,939 B (frame 850), S06 572,776 B (frame 1330), S08 130,371 B (frame 1710). S00/S01 were viewed by the operator and deemed sufficient for the initial test; the other four have passed technical PNG checks, **not necessarily a full visual/editorial review**. A 1024MiB Docker memory cap triggered confirmed cgroup OOM on S02 and S08; 1536MiB worked for both, and for 4K-source S06. These results validate six *still images*, **not video continuity, a 60-second encode, mixed audio or publishability**.

**Prepared, not executed, in this draft:** `scripts/run-pilot-film-046.sh --check` is read-only and rechecks original-video SHA/rights restrictions, brand hashes, aligned Kokoro WAV and six unchanged private PNGs; the host must have at least **3 GiB MemAvailable**, 12 GiB disk free and the image label must match `main` exactly. The separate `--render` path additionally requires `BDA_PILOT_046_PRIVATE_FILM=TRUE` and a **new express operator approval of the one-time true 60s render** after merge, image rebuild, and preflight. It produces only `~/.bda-pilot-film-046/046-private-rough-cut.mp4`, in a new owner-only directory outside the public repository, with no overwrites or auto-cleanup. One isolated unprivileged Docker container, network none, 0.5 CPU, **max 2048 MiB RAM and zero additional swap**, 200 PIDs, read-only root/source, bounded tmpfs, 1 Remotion frame concurrency, 1 OffthreadVideo thread, H.264/AAC, max two-hour timeout; container retained after finish for diagnostics. Existing stills remain untouched; no database, admin job, APIs, Compose or other VPS services are modified. If the container OOMs or fails, **STOP** rather than automatically expanding limits or retrying.

The synthetic CI tests and `scripts/check-pilot-film-046-probe.py` verify safety boundaries and expected FFprobe metadata (exact 1800 frames, 1920x1080/30, H.264/yuv420p, AAC stereo/48kHz, 60s). They do **not** prove a real MP4, full audio/video decoding, source licensing for a public film, or a human film QA. If approved and executed, private playback/listening and independent full-decode/color/atom tests still need review. The separate live Queue→Admin→MP4 Roadmap-046 definition of done is **not** covered by this isolated one-shot film proof. `render_authorized=false`, `publication_authorized=false` and `PRIVATE_INTERNAL_TEST_ONLY` remain unchanged. No new services or subscriptions.
