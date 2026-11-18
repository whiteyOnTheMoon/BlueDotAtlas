# Roadmap 013 – kleiner VPS-1080p-Render-Proof

**Status:** Vorbereitung im [Issue #29](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/29), noch **kein** VPS-Testergebnis oder Filmfreigabe.

## Einmaliger Test

Das Skript [`scripts/vps-render-proof-013.sh`](../../scripts/vps-render-proof-013.sh) erstellt **8 Sekunden** rein synthetisches bewegtes Testbild plus Testton; 1920×1080, 30 FPS, H.264 (`libx264`) und AAC in MP4. Es liest keine VideoNewsStudio-Dateien, verwendet keine externen Medien, ruft keine Dienste auf und veröffentlicht nichts.

- `nice -n 10`, ein x264-Encoding-Thread und 180 Sekunden Timeout schützen bestehende Last. Das ist ein **kurzer begrenzter Proof**, keine harte RAM-/CPU-Cgroup-Garantie.
- Mindestens 2 GiB temporärer freier Speicher vor Start; `mktemp` unter `/tmp` bzw. `TMPDIR`.
- FFmpeg und FFprobe müssen **bereits installiert** sein. Das Skript installiert nichts.
- `ffprobe` prüft Videoauflösung/-codec/-Framerate, Audiocodec und Dauer; `/usr/bin/time` erfasst bei Verfügbarkeit Peak-RSS und Laufzeit.
- Ausgabedatei und Metadaten werden am Ende automatisch entfernt; kein dauerhaftes Cache-Artefakt.

**VPS-Ausführung (nur wenn der Betreiber die Branch-Datei lokal geprüft hat):**

```bash
(
  cd "$HOME" || exit 1
  # Voraussetzung: Repository-Checkout im aktuellen Verzeichnis, auf Branch infra/013-render-proof
  bash scripts/vps-render-proof-013.sh
)
```

Falls sich das Repo nicht unter `$HOME` befindet: In diesem geklammerten Block erst `cd` in den tatsächlichen Checkout-Pfad wechseln. Nicht blind einen nicht vorhandenen Pfad annehmen.

## Abnahme

- [ ] Script auf dem **echten VPS** ausgeführt (nicht GitHub-CI oder lokaler Container).
- [ ] Ergebnis `PASS` mit H.264, 1920×1080, 30/1, AAC und ca. 8s.
- [ ] `elapsed_seconds`, `peak_rss_kib` (sofern verfügbar), Dateigröße, Speicher vorher/nachher dokumentiert.
- [ ] Betreiber entscheidet über realistischeren Folgetest und 013-Abnahme.

**Abgrenzung:** Die 8 Sekunden sind lediglich Encoder-/Systemverträglichkeitsnachweis, nicht der 55–65s-Pilotfilm und nicht der produktive Medien-Workflow. Filme mit lizenziertem Material, Motion/Remotion, Sprecher und BGM werden später separat geprüft. Keine zusätzlichen VPS-Inventurzyklen erforderlich.
