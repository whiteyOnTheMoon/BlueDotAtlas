# Erster privater V2-Film auf dem VPS

**BlueDotAtlas · 048-Nacharbeit ([Issue #72](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/72)) mit dem [Scene-Renderer V1](../video/scene-renderer-v1.md) (057) · Stand 25.11.2026**

Dieses Dokument beschreibt, wie der überarbeitete Pilotfilm nach [Skript V2](60s-script-v2.md) **privat** auf dem VPS entsteht. Danach folgt die erneute 048-Abnahme. Es wird nichts veröffentlicht. Alle Medien bleiben `PRIVATE_INTERNAL_TEST_ONLY`, und der CIRA-Clip bleibt für jede Veröffentlichung gesperrt.

## Bausteine

| Teil | Datei | Aufgabe |
| --- | --- | --- |
| Host-Runner | [`scripts/run-pilot-v2-film.sh`](../../scripts/run-pilot-v2-film.sh) | Drei Modi: `--check` (nur lesen), `--tts` und `--film`. Jeder schreibende Modus braucht ein eigenes Opt-in (`BDA_PILOT_V2_TTS_PRIVATE=TRUE` bzw. `BDA_PILOT_V2_FILM_PRIVATE=TRUE`). |
| Film-Treiber im Container | [`scripts/render-pilot-v2.mjs`](../../scripts/render-pilot-v2.mjs) | Ordnet die Szenen-Assets den privaten Stage-Dateien zu und prüft sie (siehe unten). Danach rendert er mit `renderScene` aus dem Szenendokument. |
| TTS-Image | `deploy/Dockerfile`, Ziel `pilotv2tts` | Python 3.12 mit vollständig gepinntem Kokoro-Stack (`kokoro-onnx 0.6.1`, `onnxruntime 1.29.0` …). Das Modell `kokoro-v1.0` wird beim Build per SHA-256 geprüft und eingebaut; zur Laufzeit gibt es kein Netz. |
| Film-Image | `deploy/Dockerfile`, Ziel `pilot046ffmpeg` | Das bestehende 046-Image (FFmpeg 5.1, rsvg, DejaVu), neu gebaut auf dem aktuellen `main`. |

Der Film-Treiber prüft vor dem Rendern:
- Größe und SHA-256 der V2-Clips laut [Rechte-Manifest V2](../../assets/pilot/rights-manifest-v2.json).
- Jede Quelle ist lang genug: Einstiegsframe plus Shotlänge plus Übergangs-Tail.
- Die Sprachspur ist exakt 60 s lang und wurde aus genau diesem Szenendokument erzeugt (SHA-Abgleich).

**Isolation:** Alle Container laufen
- ohne Netz, mit schreibgeschütztem Dateisystem, ohne Capabilities und mit 0,5 CPU;
- mit festem RAM-Limit und ohne zusätzlichen Swap;
- mit Host-Zulassung (Container-Limit + 2048 MiB Reserve + 256 MiB Marge) und einem Watchdog, der **nur den eigenen** Container stoppt, wenn MemAvailable unter 2048 MiB fällt.

Die Ausgaben landen ausschließlich im git- und docker-ignorierten Projektordner `.private-046/`. Bestehende Ausgaben werden nie überschrieben, und es werden keine anderen Container angefasst.

| Schritt | Container-Limit | Zulassung | Ausgabe |
| --- | --- | --- | --- |
| `--tts` | 800 MiB (gemessen: Spitze 728 MiB, besteht auch bei 768 MiB) | ≥ 3104 MiB | `.private-046/v2-tts-01/` (WAV + Timing-Report) |
| `--film` | 512 MiB | ≥ 2816 MiB | `.private-046/scene-v2-01/scene-v1.mp4` + Receipt |

## Ablauf auf dem VPS (jeder Schritt einzeln freigeben)

1. `main` aktualisieren: `git pull --ff-only`.
2. Beide Images bauen, mit Revisionslabel aus genau diesem Commit:
   ```bash
   git archive --format=tar HEAD | docker build -f deploy/Dockerfile --target pilot046ffmpeg --build-arg BDA_PILOT_046_GIT_SHA=$(git rev-parse HEAD) -t bluedotatlas-private-ffmpeg046:local -
   ```
   ```bash
   git archive --format=tar HEAD | docker build -f deploy/Dockerfile --target pilotv2tts --build-arg BDA_PILOT_046_GIT_SHA=$(git rev-parse HEAD) -t bluedotatlas-private-v2tts:local -
   ```
3. Nur lesen: `bash scripts/run-pilot-v2-film.sh --check`.
4. Sprachspur: `BDA_PILOT_V2_TTS_PRIVATE=TRUE bash scripts/run-pilot-v2-film.sh --tts`. Dauer ca. 2 Minuten.
5. Film: `BDA_PILOT_V2_FILM_PRIVATE=TRUE bash scripts/run-pilot-v2-film.sh --film`. Am Ende folgt ein Volldecode-Test.
6. Ansehen: Die Datei `.private-046/scene-v2-01/scene-v1.mp4` privat herunterladen, z. B. per VS Code „Download…“ oder `scp`, und am großen Bildschirm und am Handy ansehen. Danach folgt das 048-Urteil.

Schlägt ein Schritt fehl, gilt: **STOP**. Ausgabe und Diagnose-Container bleiben erhalten, es gibt keine automatische Wiederholung und Limits werden nicht angehoben.

## Generalprobe in der Cloud-Sandbox (25.11.2026)

- **TTS-Image** gebaut. Lauf ohne Netz bei 1024 MiB und 0,5 CPU: **PASS** in ≈ 1,5 min, kein OOM. Die sechs Sätze liegen in denselben Frame-Fenstern wie im Szenendokument.
- **TTS-Limit nachgemessen (26.11.2026):** Der VPS-`--check` meldete 3201 MiB frei, die alte Zulassung verlangte 3328 MiB (1024 MiB Limit). Nachmessung im Container: Spitze 728 MiB, PASS auch mit 768 MiB Limit, kein OOM. Das Limit ist jetzt 800 MiB, die Zulassung 3104 MiB; Hostreserve (2048 MiB) und Watchdog bleiben unverändert. Mit den gepinnten Versionen ist die Sprachspur bitgleich reproduzierbar (SHA-256 `db49e3d8…`).
- **Brand-Intro:** Die Generalprobe hat einen echten Fehler gefunden. Das Intro ist 2,5 s lang, für die 9-Frame-Blende braucht der Renderer aber 2,8 s Material. Jetzt hält das Intro während der Blende sein letztes Bild (`tpad`), seine Länge bleibt unverändert (V14). Der CI-Synthetiktest deckt das jetzt ab: Sein Intro ist genau so lang wie der Shot.
- **Film:** echte V2-Clips (über `stage-pilot-v2-media.mjs` geladen, SHA geprüft) und echte V2-Sprachspur. Die drei 036-Originale sind dabei durch synthetische Platzhalter gleicher Auflösung und Länge ersetzt, weil sie in der Sandbox nicht erreichbar sind.
  - **Vorabprüfung PASS:** Alle Quellen sind lang genug, die V2-SHAs stimmen, die Sprachspur passt zum Szenendokument.
  - **Render PASS:** 1800 Frames, exakt `30/1`, 20 Teile, Volldecode fehlerfrei.
  - **Ressourcen:** Spitzen-RAM eines Einzelschritts 324 MiB (Limit 512 MiB). Laufzeit 4 min auf einem vollen Kern; auf dem VPS mit 0,5 CPU sind etwa 10 min zu erwarten.
  - **Ton:** −19,5 LUFS integriert, Spitze −2,1 dB.
  - **Kontaktabzug geprüft:** Intro → Crossfade → Push-in, Infobox im Kontext, Dip-to-Black zur El-Niño-Karte mit Quellenzeile, CIRA-Polo mit Infobox, wachsender 90-kt-Balken, Zukunft mit Infobox, GPM-Polo als Atempause, Titel „The ocean powers the storm.“, Outro.

**Offene Gestaltungspunkte für die 048-Abnahme:**
- Die SVS-Karte zeigt 2026 oben und 2025 unten, aber noch ohne eigene Jahresbeschriftung.
- Die Infografik hat nur einen Balken und wirkt leer.
- Es gibt noch kein Musikbett.
- Die Farbkorrektur aus 057 fehlt noch.
