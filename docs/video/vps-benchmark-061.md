# 8–10-Minuten-Benchmark auf dem VPS (061) mit Wiederaufnahme (062)

**BlueDotAtlas · Roadmap 061 ([Issue #85](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/85)) und 062 ([Issue #86](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/86)) · DEC-067 · Stand 26.11.2026**

Bevor Skript und Medien für den 8–10-Minuten-Hurrikanfilm entstehen, prüft dieser Benchmark, ob der geteilte VPS einen Film dieser Länge mit dem [Scene-Renderer](scene-renderer-v1.md) stabil ausgibt. Gemessen werden Zeit, RAM und Platte, und es wird gezeigt, dass ein abgebrochener Lauf fortgesetzt werden kann. Es ist ein **reiner Technik-Test**: Clips wiederholen sich, die Tonspur ist still, und nichts davon wird veröffentlicht oder als Film abgenommen.

## Szenario

[`scripts/bench-061-plan.mjs`](../../scripts/bench-061-plan.mjs) erzeugt deterministisch ein gültiges Szenendokument:
- **Länge:** 17.415 Frames, also **9,68 Minuten**.
- **Aufbau:** Intro, sechs Kapitel und Outro mit **42 Shots** und **76 Teilen**.
- **Ruhigere Shots:** Inhalts-Shots dauern 6–18 s, im Mittel mindestens 12 s.
- **Vollständige Abdeckung:** alle Shot-Arten, Kamerafahrten, Overlay-Stile und Übergänge.
- **Material:** nur die bereits privat gestagten V2-Pilotassets. Der Plan-Test prüft, dass jede Quelle lang genug ist.

## Ablauf auf dem VPS (jeder Schritt mit eigener Freigabe)

1. `git pull --ff-only` und das Film-Image neu bauen, damit das Revisionslabel passt:
   ```bash
   git archive --format=tar HEAD | docker build -f deploy/Dockerfile --target pilot046ffmpeg --build-arg BDA_PILOT_046_GIT_SHA=$(git rev-parse HEAD) -t bluedotatlas-private-ffmpeg046:local -
   ```
2. Nur lesen: `bash scripts/run-bench-061.sh --check`. Geprüft werden Assets (SHA, Längen), Plan, Image, RAM (≥ 2816 MiB) und Platte (≥ 8 GiB frei).
3. Benchmark: `BDA_BENCH_061_PRIVATE=TRUE bash scripts/run-bench-061.sh --bench`.
   - **Bricht der Lauf ab** (Watchdog, SSH, Neustart, Timeout), denselben Befehl einfach erneut ausführen. Er setzt beim ersten fehlenden Teil fort.

Die Rahmenbedingungen entsprechen dem V2-Film:
- Container ohne Netz, schreibgeschützt, 0,5 CPU, 512 MiB, kein Swap.
- Der Watchdog stoppt nur den eigenen Container, wenn MemAvailable unter 2048 MiB fällt.
- Ausgabe ausschließlich in `.private-046/bench-061-01/`, mit `scene-v1.mp4`, Receipt und `bench-061-report.json` (Zeit, minimaler RAM, Größe, SHA).

## Ergebnis auf dem VPS (26./27.11.2026) – BESTANDEN

Stand `db109ac`, Image neu gebaut (Revisionslabel = HEAD). Vor dem Lauf: MemAvailable 3481 MiB, 23 GiB Platte frei.

| Messgröße | VPS-Ergebnis |
| --- | --- |
| Ergebnis | **PASS im ersten Durchlauf**: 17.415 Frames, 1920×1080, `30/1`; Volldecode fehlerfrei (Teil des Renderer-Gates vor `FILM PASS`); Container `exited 0`, kein OOM |
| Rechenzeit | **115 min** (6888 s) für 9,68 Filmminuten, also **≈ 11,9 min pro Filmminute** bei 0,5 CPU |
| Host-RAM | niedrigstes gemessenes MemAvailable **2771 MiB**; Watchdog-Grenze 2048 MiB nie erreicht |
| Dateigröße | **519 MB** (≈ 54 MB pro Filmminute) |
| SHA-256 | `9425878bf19752b9ec0940f6da9b172da4402b024d494a57b16cadb24b26b835` |
| Wiederaufnahme | auf dem VPS nicht nötig (`resumedParts: 0`); nachgewiesen in CI und in der Sandbox (harter Abbruch bei 25/76) |

**Folgerung für den Langfilm:** Ein 8–10-Minuten-Film ist auf dem geteilten VPS in rund 2 Stunden machbar, ohne andere Dienste zu gefährden. Für Iterationen am Langfilm lohnt es sich, die Renderzeit zu senken, z. B. mit leichterem Oversampling bei Kamerafahrten oder einer Kapitel-Vorschau in niedrigerer Auflösung. Das kommt mit 060 (Timeline-Preview).

## Generalprobe in der Cloud-Sandbox (26.11.2026)

Material: echte V2-Clips (SHA geprüft); die drei 036-Originale sind durch synthetische Platzhalter gleicher Länge ersetzt.

| Messgröße | Ergebnis |
| --- | --- |
| Ergebnis | **PASS**: 17.415 Frames, `30/1`, Volldecode fehlerfrei; Kontaktabzug visuell geprüft |
| Wiederaufnahme | Lauf nach 25/76 Teilen **hart abgebrochen** (Prozess getötet). Der Neustart hat 25 Teile übernommen (`resumedParts: 25`) und fertig gerendert. |
| Rechenzeit | ca. 50 min auf **einem vollen Kern**, also ≈ 5 min pro Filmminute. **Erwartung VPS (0,5 CPU): ca. 1,5–2,5 h.** Zeitlimit 6 h; bei Abbruch Wiederaufnahme. |
| RAM | Spitze eines Einzelschritts **308 MiB** (Limit 512 MiB) |
| Platte | Spitze **3,8 GB** am Ende: Teile, zusammengefügter Film und gemischter Film liegen dann gleichzeitig vor. Ohne Streaming wären es ≈ 15 GB. |
| Dateigröße | 1,28 GB. Die synthetischen Platzhalter (Rauschen, Fraktale) sind schwer zu komprimieren; mit echtem Material (V2-Film: 52 MB/min) sind eher 0,5 GB zu erwarten. |

## Was der Benchmark noch nicht zeigt

- Echte Erzählung, Musik und Medienvielfalt; das kommt mit Skript und Medien für den Langfilm (DEC-067).
- Queue- und Admin-Integration für lange Renders, inklusive Fortschrittsanzeige über `onProgress`.
- Optimierung der Renderzeit, z. B. leichteres Oversampling bei Kamerafahrten. Zuerst zählen die echten VPS-Zahlen.
