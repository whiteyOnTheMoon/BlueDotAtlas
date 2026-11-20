# Roadmap 045 – echtes FFmpeg-1080p-Exportprofil und unabhängige Medienprüfung

**Issue:** [#69](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/69) · **Status:** eigener Feature-PR in Prüfung, Betreiber-Freigabe für Squash-Merge ausstehend.

## Was 045 tatsächlich macht

`render/preset-1080p.json` enthält das künftig vorgesehene **technische Exportziel für P60**: **1920×1080, 30fps, H.264 High mit libx264, 8-Bit yuv420p, SDR BT.709 (Primärfarben, Transfer, YUV-Matrix), TV-/Limited-Range, SAR 1:1, AAC-LC 48.000Hz Stereo bei 128k, MP4 mit `+faststart`**. Die Encoder-Einstellungen für den begrenzten Test: CRF 23, Preset `veryfast`, GOP 60 und maximal 2 Videothreads. Diese Parameter bedeuten keine abschließend geprüfte Filmästhetik oder Veröffentlichung.

Wichtig: `045` kodiert **NICHT** den originalen 60-Sekunden-Pilotfilm. Die [044-Timeline](../pilot/pilot-timeline.json) hat zwar 9 Szenen/1.800 Frames und 7 passend gelegte echte Kokoro-Sprecherabschnitte, ist aber weiterhin ausdrücklich `SYNTHETIC_INTERNAL_PROOF_ONLY`. Das [037-Skript](../pilot/60s-script.json) bleibt `planning_only=true`, `render_authorized=false`, `publish_authorized=false`. Drei NASA-/NOAA-Footage-Quellen sind **nicht** für ein echtes Film-Staging/Taillieren genehmigt; die zwei originalen Brand-MP4s bleiben unverändert; ein kommerziell verwendbarer Musiktitel ist noch nicht ausgewählt oder lizenziert. **045 erhebt keinerlei Rechte-/Filmfreigabe.**

Der tatsächlich kodierte Nachweis ist deshalb eine **8-Sekunden-Original-Synthetik-Probe** aus FFmpegs `testsrc2` und `sine` (440Hz). Sie darf ausschließlich auf einem temporären GitHub-Runner laufen. Der generierte Original-Testton ist kein Musiktitel und das bewegte FFmpeg-Muster ist kein reales NASA-/NOAA-Footage. Weder 042-TTS-Modelle noch fremde Ton-/Bildclips werden dafür geladen. **0 € neue Dienste und keine Veränderungen am bestehenden VPS.**

## Ausgabeprofil, Test und Nachweis

Die folgenden Dateien gehören zum gleichen 045-Scope:

| Datei | Bedeutung |
| --- | --- |
| [`render/preset-1080p.json`](../../render/preset-1080p.json) | Locked 1080p/H264/AAC/BT709/Faststart-Profil, ausschließliche Synthetikquelle, Veröffentlichungssperre |
| [`render/preset-1080p.mjs`](../../render/preset-1080p.mjs) | JSON-/037-/044-Guards, keine externen Eingaben, statisch aufgebautes FFmpeg-Argv |
| [`scripts/export-045.mjs`](../../scripts/export-045.mjs) | Tatsächlich begrenzter 8s/240-Frames-/1080p-FFmpeg-Encode, nur `CI=true` und `BDA_EXPORT_045_SYNTHETIC_PROOF=TRUE` |
| [`scripts/check-export-045.py`](../../scripts/check-export-045.py) | Unabhängiger FFprobe-Metadatencheck, richtige MP4-Atom-Reihenfolge, vollständige Decodierung **beider Streams**, überprüfte Audio-Amplitude, nicht-sensitiver SHA-/QA-Bericht |
| [`scripts/check-export-045.test.mjs`](../../scripts/check-export-045.test.mjs) und [`.test.py`](../../scripts/check-export-045.test.py) | Positiv-/Negativtests: unlizenzierte Quelldaten/Filmfreigabe, unzulässige Größen/FPS/Audio-/Farbparameter, falsche Dauer, fehlende Streams, korrupte MP4-Atoms und fehlender Faststart |
| [`pilot-export-045-check.yml`](../../.github/workflows/pilot-export-045-check.yml) | Isolierte GitHub Actions: FFmpeg wenn nötig **nur** auf Wegwerf-Runner installieren, wirklich kodieren/decodieren und 5-Tage-Review-Artefakt mit drei Original-Testframe-Stills |

**Technische Akzeptanzbedingungen:** `ffprobe -count_frames` muss genau **240 vollständig lesbare H.264-Frames bei 30/1**, **1920×1080** und `yuv420p` sowie alle expliziten BT.709-/Limited-Range-Farbtags erkennen. Genau **eine AAC-LC 48kHz Stereo-Tonspur** muss bis zum gemeinsamen Bildende reichen; die Gesamtdauer beträgt **8s ±80ms**. Der MP4-Atomparser kontrolliert die **physische Lage** der Top-Level-Atome: `ftyp` am Anfang und **`moov` vor `mdat`**, keine fragmentierten `moof`-Teilstücke. Anschließend werden Bild **und** Ton unabhängig mit `ffmpeg -xerror -err_detect explode -f null` komplett decodiert; die Ton-Amplitude darf nicht stumm oder übersteuert sein. Drei Beispielbilder werden direkt aus dem wirklich kodierten H.264-Proof bei 1s/4s/7s erzeugt.

Ein einzelner grüner `ffprobe`-JSON-Header ist damit **nicht** bereits ein bestandener Mediennachweis. Ebenso wird ein synthetischer Codec-Test **nicht** als echte 048-Filmabnahme oder nachgewiesene Bild-/Musikqualität ausgegeben. Die Wiedergabe auf konkreten Mobilgeräten und die visuelle Abnahme erfolgen weiterhin menschlich.

Die `-movflags +faststart`-Option und die Ton-/Bild-Muxer sind in den [offiziellen FFmpeg-Formatdocs](https://ffmpeg.org/ffmpeg-formats.html) dokumentiert. Der FFmpeg-Codec-Referenzteil beschreibt [H.264/libx264 und Farbtags](https://ffmpeg.org/ffmpeg-codecs.html).

## Sicherheit und Reproduktion

Nur `.tmp-export-045/045-original-synthetic-1080p.mp4` sowie `.tmp-export-045/045-export-qa.json` und generierte Stills, alle unter `.gitignore`. **Keine** unbeschränkt übergebbaren Eingabedateien, Netzwerk-URLs oder Shell-Pipelines; alle FFmpeg-Argumente werden fest, ohne `shell=true`, als Liste erzeugt. 8 Sekunden maximal, 2 Encoderthreads, 4-Minuten-Process-Timeout, CI-15-Minuten-Jobgrenze. Das vollständige Probevideo/QA-JSON/Stills liegt nur im GitHub-Actions-Artefakt mit **5 Tagen** Retention; lokale QA-Ausgaben werden auf dem Runner anschließend gelöscht.

Auf einem bereits mit FFmpeg versehenen **isolierten** Runner lauten die relevanten Befehle:

```sh
node --test scripts/check-export-045.test.mjs
python3 scripts/check-export-045.test.py
CI=true BDA_EXPORT_045_SYNTHETIC_PROOF=TRUE node scripts/export-045.mjs
python3 scripts/check-export-045.py
```

**Nicht auf dem gemeinsam genutzten VPS starten.** Kein Docker/DB/Worker/Cloudflare- oder Secret-Eingriff. Kein Video-Publishing, kein neues TTS-/Musik-Abo, kein neuer kostenpflichtiger Anbieter. Die 25€/Monat-Gesamtgrenze KI+TTS bleibt unverändert.

**Abnahme-Gate:** Echter 8s-/1080p30-H.264/AAC-Rendertest, unabhängig bestandener FFprobe- und Volldecode-/Faststart-Check, gesicherte negative Rechte-/Exporttests, prüfbare visuelle Stills, grüner 033-Pflicht-CI und relevante Regressionen **auf dem finalen PR-Head**. Der Betreiber muss danach ausdrücklich **den konkreten Squash-Merge** freigeben; erst danach Issue schließen und 046 beginnen. Der spätere **echte** 60s-Film braucht zusätzlich eigene Rechte-/Staging-/Misch-/Render- und 048-Qualitätsabnahmen.
