# BlueDotAtlas — Intro Archive & Outro Review (M00 / 007)

**Status:** **Owner's exact original Intro MP4 is now stored on GitHub and hash-verified** in the task branch. Two minimal Outro drafts have been rendered **locally**, but **not approved or committed as video binaries** yet. Task 007 and Draft PR #17 remain OPEN.

## Canonical owner-supplied Intro

The owner supplied `BlueDotAtlas Intro.mp4` and designated it as the final Intro. It is archived **with the original filename**:

**[View the actual Intro on GitHub](BlueDotAtlas%20Intro.mp4)**  
`assets/brand/motion/final/BlueDotAtlas Intro.mp4` — branch `design/007-motion-basics`.

| Verification | Value |
| --- | --- |
| Duration | **2.500000 seconds** |
| Resolution | **1920×1080** |
| Frame rate | **30/1 fps** |
| Video | H.264 |
| Audio | AAC, 48kHz |
| Bytes | **4,745,495** |
| Original file SHA-256 | `d2fc15c428434e76e14b2f371b3ed7d03afd605353c8b93ae59420b64bc38f47` |
| Git blob SHA-1 (original, checked against live GitHub file) | `06db66c147c06fc729b8a50917882ba3cb09e26f` |
| Full local FFmpeg decode | **PASS** |

Verification: a new GitHub contents listing under `design/007-motion-basics` reported the same **size and Git blob SHA** as the local original conversation upload. No re-encoding and no renaming are needed.

The video is still **only on the task branch**, not on `main` until PR review/merge. Rights/licensing evidence for any third-party footage/audio used in the owner-provided clip must be recorded for publication separately.

## Outro — review candidates (NOT approved)

The owner proposed **a fade to black with the original logo** and YouTube's native **Subscribe end-screen element**. Two silent videos were generated for visual review without modifying `assets/brand/logo/logo-dark.svg`.

- **Short:** `BlueDotAtlas_Outro_Kurz_2p5s.mp4` — **2.50 s**, 1920×1080, 30fps, 75 frames. Deep-sea fade to black; logo centered and fades in/out.
- **YouTube end-screen:** `BlueDotAtlas_Outro_YouTube_6s.mp4` — **6.00 s**, 1920×1080, 30fps, 180 frames. Deep-sea fade to black; logo left; right side empty for the **interactive Subscribe end-screen element to be placed separately in YouTube Studio**.
- **Original GitHub logo blob verified:** `assets/brand/logo/logo-dark.svg`, SHA `f471d8439ae0366fcc6624048e9aee95021eb434`. The SVG was rasterized unchanged, with installed OFL Inter fonts, for the video composite.
- **Full local FFmpeg decode:** PASS for both clips.
- **Reproducible source:** [`scripts/render-outro-fade.sh`](../../../scripts/render-outro-fade.sh) uses the official committed logo, Inkscape and FFmpeg. The MP4 binaries are **preview files shared with the owner in chat**; not yet stored as part of this PR.
- **Film integration:** This generic outro opens with a dark-sea-to-black fade because the actual ending shot of the documentary is not yet available. A real **fade-out of the last film frame to black** must be placed on the final shot in the future video editor.

### YouTube end-screen caveat

For a native clickable Subscribe element, add it in **YouTube Studio → Content → Video → Editor → End screen → Subscribe**. YouTube end screens are usable in the **last 5–20 seconds** of eligible videos and the complete video must be **at least 25 seconds**. Do not burn a fake clickable button into the MP4. With the 6-second clip appended to a longer film, schedule the Subscribe element for the **last five seconds** and position it on the right.

Source: [YouTube Help: Add end screens to videos](https://support.google.com/youtube/answer/6388789?hl=en).

## Remaining gate

- [x] Owner's **actual original Intro archived and Git blob verified**.
- [x] Two **playable Outro candidates rendered and technically tested** against original GitHub SVG.
- [ ] Owner **reviews and approves one Outro**.
- [ ] Approved Outro MP4 archived, checksum/codec verified and linked from docs.
- [ ] Any remaining motion design gate/tests and PR review completed.
- [ ] PR #17 merged and Issue #16 closed; not before explicit owner sign-off.

Previous generated logo Intro clips and the old 10-second montage are **superseded experiments**, not the owner's actual uploaded Intro.
