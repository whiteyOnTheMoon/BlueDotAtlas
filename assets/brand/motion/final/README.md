# BlueDotAtlas — Original-Intro und Original-Outro (M00 / 007)

**Status:** Beide vom Nutzer selbst bereitgestellten Videodateien sind tatsächlich auf dem GitHub-Task-Branch `design/007-motion-basics` abgelegt, bytegenau geprüft und **als maßgebliche Clips ausgewählt**. Der filmische Crossfade und finale Audiomix kommen bei der späteren Produktion hinzu. [Task #16](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/16) · [Draft PR #17](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/17).

## Originaldateien (unverändert erhalten)

| Eigenschaft | Intro | Outro |
| --- | --- | --- |
| GitHub-Datei | [`BlueDotAtlas Intro.mp4`](BlueDotAtlas%20Intro.mp4) | [`BlueDotAtlas_Outro.mp4`](BlueDotAtlas_Outro.mp4) |
| Filmfunktion | Einleitung / 2,5 Sekunden | Abschluss / 6,0 Sekunden |
| Container / Videocodec | MP4 / **H.264** | MP4 / **H.264** |
| Auflösung / Framerate | **1920×1080 / 30 FPS** | **1920×1080 / 30 FPS** |
| Audio | **AAC, Stereo, 48 kHz** | **keine Audio-Streams** |
| Dauer laut ffprobe | **2.500000 s** | **6.000000 s** |
| Dateigröße | **4.745.495 Bytes** | **471.807 Bytes** |
| Git-Blob-Hash (SHA-1) | `06db66c147c06fc729b8a50917882ba3cb09e26f` | `b6f980d8a114c25803aeeef4dbe852c6ecbde38f` |
| Originaldatei SHA-256 | `d2fc15c428434e76e14b2f371b3ed7d03afd605353c8b93ae59420b64bc38f47` | `aa70bd60286d7f101b3753aa331503a81a5c3d0672f5f51a640d762fd6b8ec99` |
| Vollständiger FFmpeg-Decode | **PASS** | **PASS** |

**Nachweis:** [GitHub Actions #44007341068](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44007341068), **SUCCESS, 2/2**. Das CI-Skript [`scripts/check-final-motion-media.py`](../../../scripts/check-final-motion-media.py) prüft konkrete Originaldateigröße, SHA-1-Git-Blob, Videoauflösung, Codec, Bildrate, Dauer, Audio-Streams und dekodiert beide Dateien vollständig. **Keine Audio-Spur** beim Outro ist technisch bestätigt.

**Keine Ersetzung:** Frühere vom Assistenten generierte Entwürfe (2,3s/2,2s, 2,5s/6s oder 10s-Montage) wurden **nicht übernommen** und dürfen die beiden hochgeladenen Originalvideos nicht stillschweigend ersetzen. Bereits gebaute Preview-Generatoren dienen nur als technische/historische Beispiele.

## Verbindliche Übergänge bei späteren Filmen

```text
[Intro 2,5s inkl. eigenem Ton] ── Video-Crossfade ──► [Filminhalt]
[Letztes Filmbild + laufende Hintergrundmusik] ── Video-Crossfade ──► [stummes Outro 6,0s]
                                                                     └─ Hintergrundmusik spielt weiter
```

1. **Intro → Content:** weiche visuelle Überblendung (Cross-Dissolve) statt hartem Schnitt; das vorhandene Intro-Audio wird zum Beginn der Filmtonspur sorgfältig eingepegelt/überblendet.
2. **Content → Outro:** weiche visuelle Überblendung; **der Soundtrack läuft unverändert über die Grenze und durch das komplette stumme Outro weiter**. Ein finaler Lautstärke-Fade ist allenfalls **am Ende** des Outros sinnvoll, abhängig vom finalen Schnitt und der Musik.
3. **Dauer der beiden Video-Crossfades:** **noch nicht festgelegt**; 0,4s = 12 Frames bei 30fps ist ein Arbeitstestwert, der nach späterer Video-/Audio-Sichtprobe verändert werden darf.
4. **Orignale nicht verändern:** Crossfade, Musikmischung und eventuelles Tail-Fade werden **im Filmrenderer/Timeline** hergestellt, nicht in den separaten MP4s gespeichert.
5. **YouTube Subscribe:** Der interaktive Abonnieren-Baustein ist eine **Einstellung in YouTube Studio Endscreen**. Er ist kein im Video eingebranntes Bild. Endscreen-Platzierung nach finalem Layout/Schnitt prüfen.
6. **Rechte:** Nutzungsrechte und Herkunft von im Videoclip enthaltenen Drittmaterialien sowie die Musiklizenz müssen vor der Veröffentlichung dokumentiert sein.

Für das vollständige Render-/Audio-Konzept siehe [`docs/brand/motion-guidelines.md`](../../../docs/brand/motion-guidelines.md).

## Abnahme-/Repo-Stand

- [x] Beide fertigen Nutzerdateien liegen unter **ihren echten Originalnamen** auf dem **Task-Branch**.
- [x] Video- und Audioströme sind mit ffprobe geprüft; beide Videos vollständig dekodiert.
- [x] Unveränderte Dateien durch Git-SHA/Dateigröße verifiziert; SHA-256 archiviert.
- [x] Der Benutzer hat Crossfade **an beiden Übergängen** und **fortlaufende Hintergrundmusik über das Outro** entschieden.
- [x] [Repository-README](../../../README.md) und [Entscheidungslog](../../../docs/project/decision-log.md) werden für diese Entscheidung aktualisiert.
- [ ] Im späteren echten Film **visuelle Crossfades, Pegelverlauf und Musikkontinuität** praktisch testen.
- [ ] Vor Veröffentlichung: eventuelle Drittmaterial-Lizenzen und Musikrechte belegen.
- [ ] Formaler Abschluss von Task #16 / PR #17 nach Review und Gate-Abnahme; **nicht nach bloßem Upload vorwegnehmen**.

**Wichtig:** Die Videodateien sind im Branch gespeichert, aber bis zum Merge von PR #17 noch **nicht auf `main`**.
