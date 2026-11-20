# Roadmap 044 — wirkliche Sprecherzeit, neun Szenen und eine gesperrte 60s-Timeline

**Status:** [Issue #68](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/68), Feature-PR im Review. Keine vorgezogene Medien-/Vollfilm-/Publikationsfreigabe.

## Ergebnis und Rechte-Grenze

`docs/pilot/pilot-timeline.json` ist die maschinenprüfbare **technische Timing-Timeline** für 9 Shots (S00–S08), **1.800 Frames / 30fps / 60s** mit 1920×1080 / 48kHz-Stereo als **späterem** Zielprofil. Ihr Status ist ausdrücklich `SYNTHETIC_INTERNAL_PROOF_ONLY`: Die Timeline ist kein Produktionsauftrag und erteilt keine neuen Rechte. Das zugrunde liegende 037-Pilotskript bleibt unverändert `planning_only=true`, `render_authorized=false`, `publish_authorized=false`.

**Reale Videoclips bleiben ausgeschlossen:** Drei 036-Quellen wurden zwar vom Betreiber vorläufig für `PRIVATE_INTERNAL_TEST_ONLY` gutgeheißen, aber **`approved_for_timeline=false`** bis zum originalen Dateistaging mit SHA-256-Prüfung. Keine NASA-/NOAA-/Helene-/Oma-/Seevideoframes oder deren Originalton in den 044-Proof ziehen; insbesondere NOAA-Wellen sind kein Hurrikanbeobachtungsbeleg. Die beiden originalen 007-Brand-MP4s bleiben ebenfalls völlig unangetastet; der 044-Proof zeigt stattdessen **sichtbar beschriftete Original-Platzhalter**. Die lizenz- und kommerziell noch ungeprüfte echte Musik wird durch **im Python-Code selbst erzeugte Sinustöne** für das Testbett ersetzt. Kein Audio- oder Movie-Asset in Git.

## Gemessene Sprachdauer schlägt geplantes 037-Raster

Die **echte** und vom Betreiber vorläufig akzeptierte Kokoro-042-Stimme `bm_george` (7 Segmente, [042-Run](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44799853740)) wurde als private WAV am 20.11.2026 mit tatsächlichen Samplezahlen gemessen. `docs/pilot/tts-timing-evidence-042.json` enthält diese **nicht geschätzte** Evidenz, den geprüften 037-Quelltext-SHA und den gemessenen WAV-SHA, aber **keine Audioframes**. Ganze WAV-Länge: **48,593 s**, inklusive 120ms Vorlauf, sechs 280ms-Pausen und 350ms Nachlauf. Die sieben einzelnen Sprachsegmente sind 6,037 / 6,635 / 6,933 / 7,296 / 7,317 / 6,123 / 6,101 Sekunden lang.

Im alten 037-Plan waren vor allem S03, S05 und S07 für ihre echte Sprachdauer zu knapp. `packages/video/timeline/plan.mjs` rundet daher **die echten Sprach-Samples** `ceil(samples / 1600)` auf ein 30fps-Framefenster auf, legt je Szene 6–9 Vorlauf-/Nachlaufframes an und verteilt die verbleibenden 61 Frames proportional zu den bevorzugten ursprünglichen Szenenlängen. **Keine** Zeitkompression, keine gestreckten Stimmen, kein Schnitt mitten in der Silbe. Wenn die gemessene Stimme nicht ins 60s/Outro-Budget passt, gibt es einen **Fehler**, keinen stillen Geschwindigkeits-Override.

| Shot | Neues Bildfenster (Frames, Ende exklusiv) | Sprachfenster (Frames, Ende exklusiv) | Quelle im 044-Proof |
| --- | --- | --- | --- |
| S00 Intro | 0–75 | – | synthetischer Brand-Platzhalter |
| S01 Hook / Oma | 66–279 | 75–257 | synthetischer NASA-Platzhalter |
| S02 Sea / NOAA | 279–501 | 288–488 | synthetischer NOAA-Platzhalter |
| S03 Verdunstung | 501–724 | 510–718 | eigener Schema-Platzhalter |
| S04 Kondensation | 724–984 | 733–952 | eigener Schema-Platzhalter |
| S05 Kreislauf | 984–1223 | 993–1213 | eigener Schema-Platzhalter |
| S06 Helene | 1223–1430 | 1232–1416 | synthetischer NOAA-Platzhalter |
| S07 Abschwächung | 1430–1629 | 1436–1620 | eigener Schema-Platzhalter |
| S08 Outro | 1620–1800 | – | synthetischer Brand-Platzhalter |

**Framekontrolle:** Genau 1.782 Frames mit einer Szene und **18** Frames mit **zwei** gleichzeitig aktiven Szenen: S00/S01 (66–74) und S07/S08 (1620–1628). Keine einzige fehlende Bildframe, kein dritter Überlapp. **Genau 9 Frames je visuellem Crossfade**; im eigenen synthetischen Storyboard tatsächlich mit weichem `Image.blend` überblendet. Die letzte Sprachprobe endet spätestens beim Outrobeginn **Frame 1620 (54,0s)**, danach bleibt die **Original-Testmusik** bis **Frame 1800 (60,0s)** hörbar, Schlussfade erst Frame **1776 (59,2s)**.

Die JSON enthält außerdem `clipInFrame/clipOutFrame` für die **Platzhalter**; tatsächliche 036-Original-Trimzeiten sind explizit **`null`** und **nicht als beschlossen behauptet**. Ein späteres Clip-In/Out aus echten Videodateien benötigt gestagte und erneut SHA-geprüfte lokale Quelle, dokumentierte Rechte und eigens genehmigten Film-Scope.

## Reale technische Prüfung, ohne einen echten Film vorzutäuschen

Im 044-PR [Actions-Workflow](../../.github/workflows/pilot-timeline-044-check.yml) auf temporärem GitHub Ubuntu-Runner:

1. `node --test scripts/check-timeline-044.test.mjs` und `node scripts/build-timeline-044.mjs --check`: gesperrtes 037-Skript, SHA-Identität zur realen 042-Sprecherakte, unverändertes erzeugtes `pilot-timeline.json`, Szenenreihenfolge, 60s-Frame-Coverage, exakt 9+9-Überblendframes, positive und negative Rechte-/Schnitt-/Audio-Tests.
2. Die bereits gewählte frei nutzbare **Kokoro-82M-v1.0-Stimme** wird mit dem vorhandenen 042-Python-Skript auf demselben Weg **wirklich neu erzeugt**: original-Apache-2.0-Modell/Voicepack mit hartem SHA-256-Download-Gate, `kokoro-onnx`-MIT-Laufzeit, **keine kostenpflichtigen API-Aufrufe**. Unabhängige 042-WAV-QA bestätigt Sätze/Sampleprofil; Änderungen der echten Stimmen-Länge blockieren die 044-Montage bis zum expliziten neuen Timing-Review.
3. `scripts/render-timeline-044.py` ordnet **jedes ganze echte 042-Sprachsegment** aus der WAV als 16-Bit-/48kHz-Samples ohne Time-Stretch seinem errechneten Szenenfenster zu, senkt das im Code original erzeugte Musik-Testbett unter den Sprachfenstern nach 043-Gain-Regel ab und lässt das Bett durch das komplette 6s-Outro laufen. Es rendert **eine vollständige 60s-Synchronisationsprobe** als H.264-/AAC-MP4, aber bewusst nur **960×540** (ressourcenschonender, nicht finaler 1080p-Export). Alle neun Bildelemente sind dynamisch gemalte, klar markierte **synthetische Storyboard-Karten**, **keine** echten Videoaufnahmen oder der originale Brand-Film.
4. `scripts/check-timeline-044.py` prüft das **tatsächlich erzeugte** MP4/WAV mit FFprobe und PCM-Dekodierung auf 1.800 Videoframes/30fps, 60s-Bild und -Ton, AAC 48kHz Stereo, sieben hörbare echte Sprachabschnitte, Headroom und keine Stille am Beginn des stummen Outro-Proxys. Automatisches Audio-QA garantiert **keine** menschliche filmische Sprach-/Musikabnahme.
5. Nur **synthetischer 60s-Video-Proxy, nicht-sensitive Hash-/Pegel-Metadaten und vier echte Frame-Stills** werden als GitHub **5-Tage-Review-Artifact** hochgeladen. Die proprietären/temporären TTS-Modellbytes, Original-WAV und alle Render-Assets werden am CI-Ende gelöscht. `.gitignore` blockiert die temporären Pfade.

**Reproduktion ausschließlich im isolierten Runner:** `CI=true`, `BDA_TTS_042_PRIVATE_TEST=TRUE`, `BDA_TIMELINE_044_PROOF=TRUE` und die bereits definierten 042-Abhängigkeiten plus Python-Pillow/FFmpeg. Das ist **keine Anweisung**, dies auf dem gemeinsam genutzten VPS zu starten.

## Noch offene echte Film-Gates

Der Proxy beweist technische Chronologie und Sprach-/Musikabschluss – **nicht** konkrete NASA-/NOAA-Originalclips, echte finale filmische Qualität, Quellencredits, vollständigen musikalischen Rechteerwerb, Original-Intro-Mischung oder eine freigegebene 1080p-Enddatei. 045 prüft das endgültige Exportprofil, 046 die abgesicherte Queue auf dem VPS, 047 Preview/Archiv und 048 die umfassende filmische Abnahme. Eine echte 60s-Originalmedien-Montage und Veröffentlichung benötigen vorher **separat genehmigtes Asset-Staging/Rechte-/Produktions-Go**, ohne dass 044 diese Blocker entfernt.

**Kosten:** 0€ neues Abo/Service/Lizenz, keine weiteren API-Provider, kein fremder Audio-Track, kein VPS/DB/Docker/Cloudflare/Worker-Eingriff. Die 042-Stimme ist vorläufig und darf später ausgetauscht werden – dann muss die echte Sample-basierte Timeline neu berechnet werden.

**Abnahmestand:** `043` ist gemergt; `044` benötigt **wirklich grüne neue PR-CI einschließlich H264/AAC-QA**, ansehbare Still- und MP4-Belege, Review der Rechte-Gates und **ausdrückliche Betreiber-Squash-Merge-Freigabe**. Vorher PR und Issue offen.
