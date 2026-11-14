# BlueDotAtlas — Motion Design Guidelines V0.1 (PROPOSAL)

**Roadmap:** M00 / 007 — Motion-Design-Basics gestalten  
**Status:** **Technical test PASS**, real [10-second MP4 with four keyframes](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43608120656/artifacts/14118684177) available for user review. **Motion style NOT YET APPROVED.**  
**Issue:** [#16](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/16)  
**Dependency:** 004–006 complete.  
**Roadmap acceptance:** Short test clip with **logo motion and lower third**, but **no persistent full-frame text overlays**.

## 1. Intent

**Scientific motion without a corporate intro wall.** Movement should direct attention to a real explanatory subject, not compete with it. The BlueDotAtlas Earth-Contour mark suggests **topographic contours, seismic waves, Earth measurement and observation**. Motion must feel cinematic, precise and restrained rather than glitchy or loud.

The voice/camera/video hook gets screen time first. Motion branding is secondary, brief and never a mandatory long splash-screen. The exact logo art, colors and tagline must stay unchanged.

## 2. Canonical references

- [Logo SVGs](../../assets/brand/logo/) — especially **logo-dark.svg** on deep-sea footage; existing geometry and text are *not* changed.
- [Colors](../../packages/ui/tokens/colors.ts) — Deep Night #071522, Deep Sea #021934, Ice White #F2F9FF, Blue Dot #19B7F4 on dark, Glacier #37D6C4 and muted #B4CCDC.
- [Typography](typography.md) — **Space Grotesk 600/700** for title-like graphics, **Inter 400/600** for all location/source/caption labels; only freely licensed SIL OFL families.
- [One Thumbnail Template](../../assets/brand/thumbnails/template.svg) — top-left signature and limited accent. Motion uses the same identity but keeps the footage visible.
- [Deterministic 10-second preview HTML](../../assets/brand/motion/preview.html) + [render script](../../scripts/render-motion-test.mjs) — proposed reproducible animation implementation.

## 3. Motion primitives

| Graphic | Entrance / behavior | Exit / purpose | Limits |
| --- | --- | --- | --- |
| **Logo reveal / intro** | Short fade + approximately 22px upward ease over **0.58 s**; optional subtle Blue Dot pulse from the original art (do not reshape it) | Fade away after identity is established | May follow the opening hook; do not replace footage with a long black/full-color title slide |
| **Location Lower Third** | Compact deep-sea translucent panel, cyan vertical rail; **0.55 s** fade and ~32px rise | Fade after roughly 3.4 seconds visible | Lower-left, no opaque full-frame backing, one location line and one explanatory subtitle |
| **Map marker** | Light cyan pulse circle around a small fixed marker, short lead line | Disappears together with geographic context | Must be geographically accurate in real films; present sample uses **conceptual location only** |
| **Source note** | Fade-in compact source/caption bar (agency / instrument / date) | Fade away after its reading purpose | No source is invented for real observational footage; template placeholders must be replaced |
| **Caption / imagery label** | Brief text aligned with lower third/source box; Inter 400/600 | Fades when no longer needed | No permanent full-screen label; readable against the *actual* background |
| **Outro** | Short return of the unchanged official logo + tagline, opacity/very small displacement | Ends with film; background remains present | No prolonged brand credits over full-color panel; avoid eating into film's explanation |

**Easing:** smooth cubic \`3u² − 2u³\` for position and opacity, no bounce/overshoot, no rotations of the actual logo. Accent marker pulses are small and do not imply a scientific measurement.

**Durations:** default entrance/exit ~0.35–0.6s; normally avoid holding informational overlays beyond ~4s unless needed for reading/translation. Scene director must adapt duration to voice and factual data.

## 4. Proposed timing / test clip (10s; 1920×1080 / 30fps)

This test is **silent** and uses only original illustrated contour graphics. It does *not* depict an observed weather event or satellite data; it is a design proof rather than the master 60-second scientific pilot.

| Time in sample | Visual | Main purpose |
| --- | --- | --- |
| 0.00–0.65 | Abstract ocean/contour background only | Visual hook before the brand mark |
| 0.65–2.65 | Approved BlueDotAtlas logo at upper left, fade + small upward move | **Logo motion** |
| 2.65–6.60 | Inter-based Lower Third: *North Atlantic* with clearly labeled **illustrative demo** context | **Lower Third / Ortslabel** |
| 3.10–6.40 | Cyan pulse + lead line and **MAP MARKER / DEMONSTRATION ONLY** | **Map-marker behavior** |
| 6.50–8.45 | Source bar **AGENCY / SENSOR / DATE** and explanatory caption placeholder | **Sources + simple image caption** |
| 8.45–10.00 | Short approved logo return and compact descriptor | **Outro**, without a new opaque full-frame card |

Source placeholders deliberately communicate the **visual format**, not a citation or a measurement. In real production, the media library and research brief must populate verifiable content. The scientific image never disappears behind a permanent full-screen overlay.

## 5. Composition & safe zones

**Test frame:** 1920×1080 at 30fps; distribution encodes MP4/H.264 4:2:0, silent proof.

- **5% safe area** nominally ~96px horizontal / 54px vertical. In this demo, the header logo starts at x112 / y105.
- **Lower Third:** x118 / y752 / 865×215 (under 10% of screen area), against a localized dark translucent backing.
- **Marker:** right-side x1343 / y403; avoid chart labels / major subject.
- **Source note:** x118 / y845 / 1190×125 (about 7% area).
- **Outro:** x350 / y385 / 1130×292 (about 16% area); only brief, underlying scene always visible.
- **No persistent full-frame overlays**: the underlying scene continuously fills the image. Fully opaque title panels/cards do not fill the frame.
- Ensure no informational UI overlaps captions, player controls or bottom-right YouTube timestamp when content is distributed into other formats.
- The video uses **original procedural illustration and no external footage**; changing the background for production requires specific rights and science checks.

## 6. Accessibility and viewing rhythm

- Keep Inter source/location text clear, with enough contrast over whatever footage is visible (UI rules were contrast-audited in 004).
- Do not animate fonts by rapid letter-spacing, flashing, glitch, seizure-like strobing or aggressive parallax. The strongest blue accents should be reserved for a single data point.
- For web replays, respect **\`prefers-reduced-motion\`**: replace translation/pulse with brief fades or static labels; maintain read time.
- Don't burn sample English labels into actual science film unless research/script/citation approves them.
- Show captions and citations only during their meaningful context; no permanent "science data wallpaper".
- Reassess footage + voice pacing together in Roadmap 038–042 and the 60-second pilot.

## 7. Testing / gate

### Automated evidence — completed in GitHub Actions

The [Motion 007 workflow](../../.github/workflows/motion-check.yml) uses Chromium, pinned WOFF2 Inter/Space Grotesk (SIL OFL 1.1) and FFmpeg to generate a **real 10-second 1920×1080 H.264 MP4**.

It verifies:
- The canonical approved SVG logo file actually loads for intro and outro.
- Real Inter and Space Grotesk fonts load; screenshot engine cannot silently fall back.
- Five deterministic timeline checkpoints place logo, Lower Third, marker, source and outro at expected times.
- No text-overlay element occupies more than 16% of the frame or sits outside the frame.
- MP4 codec, resolution, 30fps, duration are checked using ffprobe.
- Output includes the clip, keyframe PNG previews and machine-readable QA JSON in a GitHub Actions artifact.

### Checklist

- [x] Motion grammar defined for intro/outro, Lower Third, geographic labels, map markers, sources/captions.
- [x] Scene uses real approved SVG logo and the chosen palette and free font families.
- [x] Test/demo animation source and reproducible 1080p MP4 generator written.
- [x] **Actual 1920×1080 H.264 MP4 rendered and validated**, 30fps/10s, original SVG logo loaded and true Inter/Space Grotesk fonts loaded; [test report](motion-qa.md), [successful Action](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43608120656).
- [ ] Owner reviews motion pacing, lower-third readability and tone, and approves/requests changes.
- [ ] PR merged and Issue #16 closed only after test **and** human motion sign-off.

**QA proof:** [Motion Test Report](motion-qa.md) and [downloadable ZIP with MP4, screenshots and QA JSON](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43608120656/artifacts/14118684177). **Style approval pending**.

**Scope note:** This is M00 motion identity, not the eventual Remotion scene engine or the 60-second scientific proof. Production audiovisual integration follows M03/M04 tasks.
