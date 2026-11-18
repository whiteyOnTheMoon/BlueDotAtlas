# Roadmap 013 – kleiner VPS-1080p-Render-Proof

**Status:** Begrenzter synthetischer 1080p-VPS-Proof **am 18.11.2026, 23:42:49 UTC bestanden** (Betreiber-Terminalausgabe). Die technische Prüfschleife ist abgeschlossen; die formale Task-013-Abnahme durch den Betreiber steht noch aus. Keine Film- oder produktive Renderer-Freigabe.

## Einmaliger Test

Das Skript [`scripts/vps-render-proof-013.sh`](../../scripts/vps-render-proof-013.sh) erstellt **8 Sekunden** rein synthetisches bewegtes Testbild plus Testton; 1920×1080, 30 FPS, H.264 (`libx264`) und AAC in MP4. Es liest keine VideoNewsStudio-Dateien, verwendet keine externen Medien, ruft keine Dienste auf und veröffentlicht nichts.

- `nice -n 10`, ein x264-Encoding-Thread und 180 Sekunden Timeout schützen bestehende Last. Das ist ein **kurzer begrenzter Proof**, keine harte RAM-/CPU-Cgroup-Garantie.
- Mindestens 2 GiB temporärer freier Speicher vor Start; `mktemp` unter `/tmp` bzw. `TMPDIR`.
- FFmpeg und FFprobe müssen **bereits installiert** sein. Das Skript installiert nichts.
- `ffprobe` prüft Videoauflösung/-codec/-Framerate, Audiocodec und Dauer; `/usr/bin/time` erfasst bei Verfügbarkeit Peak-RSS und Laufzeit.
- Ausgabedatei und Metadaten werden am Ende automatisch entfernt; kein dauerhaftes Cache-Artefakt.

**VPS-Ausführung (einmalig; vor dem Start das Skript im PR ansehen):**

```bash
(
  cd "$HOME" || exit 1
  script="$(mktemp "$HOME/.bda-013.XXXXXXXX.sh")" || exit 1
  trap 'rm -f -- "$script"' EXIT

  curl -fsSL --max-time 30 \
    "https://raw.githubusercontent.com/whiteyOnTheMoon/BlueDotAtlas/infra/013-render-proof/scripts/vps-render-proof-013.sh" \
    -o "$script" || exit 1

  bash -n "$script" || exit 1
  bash "$script"
)
```

Der Abruf benötigt Zugang zur GitHub-Datei (bei privatem Repository ggf. einen authentifizierten Checkout). **Nur der Abruf** benötigt Internet; das Testskript selbst nicht. Der temporäre Skriptdownload wird beim Verlassen des Blocks entfernt.

## Echter VPS-Messlauf: 18.11.2026, 23:42:49 UTC

**Quelle:** vom Betreiber übermittelte Ausgabe des Skripts, nicht eine direkte SSH-Prüfung der GitHub-Verbindung.

| Messung | Ergebnis |
| --- | --- |
| Skript | `PASS: short 1080p H.264/AAC proof` |
| Video | H.264, **1920×1080, 30/1 fps**, **8.000000 s** |
| Audio | AAC |
| Encoding | `libx264`, `preset=veryfast`, `CRF=23`, 1 x264-Thread, `nice -n 10` |
| Renderdauer (`/usr/bin/time`) | **6.30 Sekunden** (Wall-Clock-Sekunden 6, Zeitmessung gerundet) |
| CPU-Zeit | **6.36 s user**, **0.36 s system** |
| Peak-Prozess-RSS | **229036 KiB ≈ 223.7 MiB** (kein kompletter Host-Speicherbedarf) |
| MP4-Dateigröße | **5,483,496 Bytes ≈ 5.48 MB** |
| Root-Datenträger vorher/nachher | **116G / 27G genutzt / 89G frei / 24 % belegt**, unverändert in gerundeter `df -h`-Anzeige |
| Temporärer Output | Nach Skriptende gelöscht |

Der synthetische Acht-Sekunden-Encode dauerte **6.30 s**, also rund **1,27× Echtzeit**. Das lässt sich nicht ungeprüft auf andere Szenen, Animationen oder komplette Filme hochrechnen.

### Task-013-Abnahme

- [x] Skript auf dem **echten VPS** vom Betreiber ausgeführt (nicht GitHub-CI).
- [x] Ergebnis `PASS` mit H.264, 1920×1080, 30/1, AAC und 8.000s.
- [x] Dauer, CPU-Zeit, Peak-Prozess-RSS, Dateigröße, Speicher vorher/nachher dokumentiert.
- [x] Test ohne Änderung an laufenden Diensten oder Docker abgeschlossen; 89G frei gemeldet.
- [ ] **Formale Nutzerfreigabe** für den Abschluss von 013; kein weiterer Diagnoselauf für diesen kleinen Proof notwendig.

**Abgrenzung:** Die 8 Sekunden sind lediglich Encoder-/Systemverträglichkeitsnachweis, nicht der 55–65s-Pilotfilm und nicht der produktive Medien-Workflow. Filme mit lizenziertem Material, Motion/Remotion, Sprecher und BGM werden später separat geprüft. Keine zusätzlichen VPS-Inventurzyklen erforderlich.
