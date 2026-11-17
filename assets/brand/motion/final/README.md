# BlueDotAtlas — Final Intro Media Asset (M00 / 007)

**Status:** Owner-supplied Intro **selected**, actual MP4 upload into this GitHub folder is **still pending**. Do not confuse this metadata record with the binary file.

## Authoritative user-supplied source

The owner supplied a finished video file in the project conversation, **`BlueDotAtlas Intro.mp4`**, on **2026-11-17**, and expressly designated it: **“das ist das intro … outro kommt später”**. This user-delivered clip **replaces both earlier generated logo-only intro candidates and Firefly preview concepts** as the intended BlueDotAtlas Intro.

Expected version-controlled binary path after upload:

```text
assets/brand/motion/final/BlueDotAtlas_Intro_2p5s.mp4
```

### Exact verified properties of original user file

| Property | Verified value |
| --- | --- |
| Filename in chat | `BlueDotAtlas Intro.mp4` |
| Intended repo filename | `BlueDotAtlas_Intro_2p5s.mp4` |
| Duration | **2.500000 seconds** |
| Frame size | **1920×1080** |
| Video codec | **H.264 / AVC** |
| Frame rate | **30/1 (30 fps)** |
| Decoded video frames | **75** |
| Audio codec | **AAC**, 48 kHz |
| Original size | **4,745,495 bytes** |
| SHA-256 (original, without re-encoding) | `d2fc15c428434e76e14b2f371b3ed7d03afd605353c8b93ae59420b64bc38f47` |
| Full decode with FFmpeg (`-xerror`) | **PASS** |
| Rights/authorship | File was provided by the owner; retain an explicit source/rights declaration for any third-party imagery or audio used in production |

**Integrity rule:** Copy the owner's MP4 bytes unchanged. No regeneration, edits, re-encoding or timing adjustment without a new explicit decision. Changing the filename alone does not affect the digest.

### Upload / gate

**Important:** GitHub metadata and source documents are already in the task branch, but the binary video must be uploaded before claiming it is stored in the repo. When the repository upload is completed, verify its byte size, SHA-256, H.264 1080p 30fps and AAC 48 kHz; only then mark it as archived. The connector currently cannot stream this conversation-uploaded 4.7 MB binary directly into GitHub.

Suggested manual one-time upload (GitHub web interface):
1. Open the repository branch `design/007-motion-basics`.
2. In folder `assets/brand/motion/final/`, select **Add file → Upload files**.
3. Upload the user original renamed to `BlueDotAtlas_Intro_2p5s.mp4` (do not recompress) and commit to this branch.
4. Confirm the GitHub file and checksum, then keep it as the canonical Intro.

### Outro

**Not provided yet.** Do **not** invent, finalize, replace or commit an Outro video until the owner supplies it. Issue [#16](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/16) remains open, and [PR #17](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/17) stays a draft, unmerged.

### Earlier drafts

`../logo-intro-outro.html`, `../preview.html`, and previous CI clips remain **superseded design drafts only**. They are not the final user-supplied Intro.
