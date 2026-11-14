# BlueDotAtlas — Motion Design Guidelines V0.2 (SHORT LOGO CLIPS)

**Roadmap:** M00 / 007 — Motion-Design-Basics gestalten  
**Status:** REVISED DESIGN PROPOSAL — user rejected the original combined 10-second intro/outro presentation; new short clips **await viewing and explicit approval**.  
**Issue:** [#16](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/16) · [Draft PR #17](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/17)  
**Dependencies:** 004–006 completed.

## 1. Mandatory direction: two independent short logo videos

The owner requested: “Nicht ganz zufrieden. Wir sollten einen kurzen 2,3 Sekunden Clip fürs Intro machen, animiertes Logo zb, und ein 2, e Sekunden Clip für das outro.”

**Working durations:** Intro **2.3 seconds**, Outro **2.2 seconds** (both within the requested approximately 2–3-second range). These are **two separate playable MP4s**, not one 10-second montage.

The intro and outro use only the **existing approved** transparent `assets/brand/logo/logo-dark.svg` (including “BlueDotAtlas” and “The Planet Has a Story.”) on a subtle Deep-Night abstract contour background. We may animate opacity, timing, position, reveal mask and small abstract halo lines **around** the logo, but **never change the logo's own Bézier paths, blue dot, color inks, spelling or proportions**.

No map labels, source panels, subtitles, distracting call-to-actions, cinematic footage claims or permanent overlays belong **inside these two logo-only clips**.

## 2. Intro (2.3 seconds, silent, Full HD 30fps)

| Segment | Timing | Purpose |
| --- | --- | --- |
| Establish | 0.00–0.12s | Deep-Night (#071522) moving abstract topographic contours, no text |
| Icon-first reveal | 0.12–0.58s | Existing Earth-Contour symbol becomes visible through a soft left-to-right wipe |
| Wordmark + tagline reveal | 0.48–1.37s | Full **unmodified** logo and claim progressively visible |
| Hold | ~1.37–1.84s | Complete brand identity readable |
| Exit | 1.84–2.30s | Soft fade for a clean transition into documentary footage |

A restrained turquoise halo can gently pulse behind the existing blue observation point; it is **not** a new logo variant. No separate intro narration or music included in the proof. In actual videos the factual opening hook can precede the intro, to avoid losing viewers to a long brand splash.

## 3. Outro (2.2 seconds, silent, Full HD 30fps)

| Segment | Timing | Purpose |
| --- | --- | --- |
| Arrival | 0.02–0.53s | Complete official logo/claim fades in, with tiny vertical movement and 98.5%→100% display-scale adjustment |
| Hold | ~0.53–1.69s | Full logo and tagline clearly visible; subtle background contour motion |
| Exit | 1.69–2.20s | Soft fade out for a quiet finished-video ending |

There is **no reused intro wipe**, no longer credits page, no URL/call-to-action, and no invented scientific imagery.

## 4. Separate film-overlay motion components (not part of short clips)

Task 007 also requires definitions for **Lower Third, map marker, geographic label, source note and simple caption**. They remain independently designed components **inside the documentary**, not joined to the intro or outro. Their *previous combined 10-second proof* passed a technical test and is kept for **overlay-component reference only**, **not approved as the Intro/Outro design**.

- **Location/Lower Third:** localized translucent Deep-Sea background, cyan vertical rail, Inter location/source labels, Space Grotesk for a short location title. Typical entrance ~0.4–0.6s, visible around 3–4s as appropriate to speech, then disappears.
- **Map marker:** small fixed data point with subtle non-flashing pulse, short leader line, map coordinates / claim must be geographically verified for real footage.
- **Sources:** brief agency / instrument / date where evidence matters, tied to actual scientific citations, clear credits in description.
- **Captions:** Inter, readable contrast on actual imagery; no sustained full-frame cards, no invented numeric/map data.
- **Optional reduced motion:** on websites or production contexts with `prefers-reduced-motion`, replace positional movement/pulses with short fades/static graphic while preserving reading time.

The original proof remains reproducible through [`assets/brand/motion/preview.html`](../../assets/brand/motion/preview.html) and [`scripts/render-motion-test.mjs`](../../scripts/render-motion-test.mjs). Its earlier [successful 10s workflow](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43608120656) is **not user-approved intro/outro motion**.

## 5. Visual identity and scientific integrity

- Preserve **Deep Ocean / Glacial Light** (#021934, #071522, #F2F9FF, #19B7F4, #37D6C4).
- Preserve **free OFL fonts** Inter / Space Grotesk; logo typography renders from the **exact approved SVG**. Font files are never copied into the repository without rights/notice checks.
- No artificial satellites, false storms or invented data as though observed. The demo's contour field is explicitly **original abstract illustration**, unrelated to a measured location.
- **No flashing, aggressive zoom, loud glitch, excessive neon or long moving title screens**.
- Keep video content primary: short intro and outro, no permanent information overlay.
- The short clips are mastered on a dark-blue background as normal H.264 MP4; they do not contain an alpha channel. Transparent-overlay versions would be a separately approved export format.

## 6. File/technical specification

| Deliverable | Role | Output |
| --- | --- | --- |
| [`logo-intro-outro.html`](../../assets/brand/motion/logo-intro-outro.html) | One deterministic HTML/SVG/CSS/JS animation source with two independent time modes | `window.setLogoTime(seconds, "intro"\|"outro")` |
| [`render-short-logo-clips.mjs`](../../scripts/render-short-logo-clips.mjs) | Browser SVG rasterization and FFmpeg test exports | `BlueDotAtlas_Intro_2s.mp4` (2.30s / 69 frames) |
| Same renderer | Separate outro video | `BlueDotAtlas_Outro_2s.mp4` (2.20s / 66 frames) |
| [Motion workflow](../../.github/workflows/motion-check.yml) | Run browser/FFmpeg QA, archive outputs | 2 MP4s + keyframes + JSON report |
| [Motion QA](motion-qa.md) | Distinguishes superseded combined clip from final candidate clips | Technical validation and review status |

**Codec:** H.264, `yuv420p`, 1920×1080, 30fps, MP4, silent.  
**Animation:** deterministic easing, not a random video generator.  
**Original logo:** imported from `assets/brand/logo/logo-dark.svg`, **unchanged path/text markup**, used as the source for the compositor.  
**Allowed final implementation:** After user acceptance, convert same motion timing into the Remotion scene engine later (without creating longer intros).

## 7. Roadmap gate

- [x] Owner requested two independent short logo clips instead of the combined 10-second intro/outro.
- [x] Two standalone local MP4 previews generated and checked with ffprobe at 2.30/2.20s, 1920×1080 / H.264 / 30fps.
- [x] GitHub source and automated separate-clip renderer created; actual official logo preserved.
- [x] Lower Third / map marker / location / source / caption remain defined and previously tested as **separate design primitives**.
- [ ] GitHub Actions renders both separate MP4s and archives the actual files (CI verification).
- [ ] User watches **both new short clips** and approves motion/timing.
- [ ] PR reviewed/merged and Issue #16 closed with evidence.

**Important:** “Nicht ganz zufrieden” is **not approval** of the 10-second clip. Task 007 remains open until the user approves these **revised separate clips**.
