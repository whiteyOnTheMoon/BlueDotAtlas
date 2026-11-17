# BlueDotAtlas — Motion Design und Filmübergänge (Aufgabe 007)

**Status:** **Aufgabe 007 vom Auftraggeber für den Abschluss freigegeben; Original-Intro und -Outro befinden sich auf `main` und sind technisch geprüft.**  
**Dateistand:** 17.11.2026 · [Issue #16](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/16) · [Gemergter PR #17](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/17).

## 1. Verbindliche Originalmedien (keine Neukreationen)

Der Eigentümer hat **zwei fertige MP4-Dateien** direkt auf GitHub unter `assets/brand/motion/final/` abgelegt. **Nur diese beiden sind die maßgeblichen Brand-Clips**; alle zuvor mit Browser, Firefly oder FFmpeg erstellten Varianten sind historische, nicht angenommene Vorschauen.

| Verwendung | Verbindliche Datei | Dauer | Ton |
| --- | --- | --- | --- |
| **Intro** | [`BlueDotAtlas Intro.mp4`](../../assets/brand/motion/final/BlueDotAtlas%20Intro.mp4) | **2,5 Sekunden** | Originalton vorhanden (AAC 48kHz) |
| **Outro** | [`BlueDotAtlas_Outro.mp4`](../../assets/brand/motion/final/BlueDotAtlas_Outro.mp4) | **6 Sekunden nach Nutzerangabe**, technisch durch CI zu prüfen | Laut Nutzer **ohne Ton**, Medienprüfung durch CI |

Beide Dateien bleiben **bytegenau erhalten**. Kein Umbenennen, Trimmen, generatives Ändern, Entfernen einer Audiostream-Komponente oder Ersetzen durch generierte Probeclips ohne neue Einzelentscheidung. [Medienarchiv + Prüfnachweis](../../assets/brand/motion/final/README.md).

## 2. Filmischer Schnitt: zwei Crossfades (verbindlicher Wunsch)

**Gewählter Übergang:** Bei jedem späteren fertigen Film werden die **Videoübergänge** als weiche **Cross-Dissolves** realisiert:

```text
[Intro, 2,5 s] == Video-Crossfade ==> [Dokumentationsinhalt / Hook / Hauptfilm]
[Letzte Filmszene] == Video-Crossfade ==> [Outro, ca. 6 s]
```

- **Nicht** abruptes Schwarz-/Weißblenden oder harter Schnitt zwischen Intro/Content bzw. Content/Outro.
- **Verbindlich: exakt 0,3 Sekunden (= 9 Frames bei 30 FPS) pro Video-Crossfade.** Gilt für Intro → Film und Film → Outro (DEC-023). Kein Vorschlagswert mehr.
- Als Video-Crossfade überlappen die zwei benachbarten Bildspuren zeitlich. Die Intro- und Outro-MP4s werden im Medienarchiv selbst **nicht** geändert.
- **Fehlt** im aktuellen Projekt der Hauptfilm, ist die finale Crossfade-Wirkung noch **nicht testbar**. Ein Proof mit eigenständigen Dummy-Szenen darf die realen MP4-Assets niemals ersetzen.
- **Quellraten** bei der Videoverarbeitung respektieren; nominelles Projektprofil **1920×1080 / 30 FPS / SDR**, endgültige Ausgabe erst im Renderer und echten Film abnehmen.

## 3. Audio: Musik durch das gesamte Outro (verbindlich)

- Der spätere Film erhält Hintergrundmusik. **Diese Musik bleibt während des gesamten stummen Outrovideos hörbar** und darf beim Wechsel **Content → Outro nicht abgeschnitten oder stummgeschaltet** werden.
- Das Outro bringt **keine eigene Tonspur** mit. Für die finale Filmmontage wird die Hintergrundmusik als **durchgehende eigene Audiospur** vom Film bis in das Outro geführt.
- Ein endgültiger **Musik-Fade-out darf erst zum Schluss des Outras** liegen; sein exaktes Timing und die Lautstärkekurve werden bei der Audioabnahme festgelegt. Nicht schon beim Bild-Crossfade auf Stille übergehen.
- Das Intro enthält eine **eigene AAC-Tonspur**. Beim Übergang Intro → Inhalt wird diese mit der separaten Film-/Musik-Tonspur **kontrolliert gemischt**, um harte Pegelsprünge, Klicks, Dopplungen und Übersteuerung zu vermeiden. Die genaue Audio-Überblenddauer ist noch nicht entschieden.
- Die Musik muss eigenständig zulässig lizenziert sein; sie wird **nicht** vorab in die bereitgestellten MP4-Originale gebrannt.

## 4. YouTube-Endscreen und Abonnieren

Das **6-Sekunden-Outro** dient als vorgesehene Fläche für einen späteren **interaktiven YouTube-Abonnieren-Endscreen**. Der **anklickbare** Subscribe-Baustein wird nach dem manuellen Upload in **YouTube Studio → Editor → Endscreen** eingerichtet, nicht als vermeintlich anklickbare Grafik in die Videodatei gemalt. Eine finale Überprüfung der Platzierung und Anzeigedauer erfolgt bei der Publikation; das tatsächliche Bildlayout des eigenen Outras darf nicht verdeckt werden.

Offizielle Dokumentation: https://support.google.com/youtube/answer/6388789?hl=de. YouTube-Endscreens können grundsätzlich im letzten **5–20-Sekunden**-Abschnitt bei geeigneten Videos ab **25 Sekunden** Länge verwendet werden. Die spätere reale YouTube-Konfiguration wird separat überprüft; **kein Auto-Publishing** in V0.1.

## 5. Weitere Roadmap-007-Bausteine — im Film, nicht in Intro/Outro

Die Bewegungsregeln für **Lower Third, Ortslabel, Kartenmarker, Quellenhinweis und Bildunterschrift** bleiben separate Filmgrafiken. Sie sind **nicht** Bestandteil der zwei bereits gelieferten Original-MP4s:

| Baustein | Beabsichtigte Darstellung |
| --- | --- |
| Ortslabel / Lower Third | Kompakter örtlicher Informationsblock, temporäre Ein-/Ausblendung und klare Lesbarkeit; keine dauerhafte Vollbild-Textfolie |
| Kartenmarker | Kleiner präziser Marker mit zurückhaltendem Puls; Geoposition nur aus realer Quellenlage |
| Quellenhinweis | Knappe echte Quellen-/Messgeräte-/Datums-Angabe, nur während relevanter Filmszene sichtbar |
| Bildunterschrift | Kurz, in Inter, mit gutem Kontrast; kein großflächiger dauerhaft eingeblendeter Erklärungstext |

Die frühere **10-Sekunden-Testmontage** und **2,3/2,2-Sekunden-Logodemos** bleiben reine Entwicklungs-/QA-Artefakte. Ihre erfolgreiche Technikprüfung ist **keine Freigabe dieser visuellen Entwürfe**.

## 6. Abnahme-Gate Aufgabe 007

- [x] Nutzer hat **Intro (2,5 s) und stummes Outro (6 s)** als Originalmedien auf GitHub geliefert.
- [x] Die **Übergangsmethode Video-Crossfade an beiden Filmgrenzen** ist beschlossen.
- [x] **Hintergrundmusik bis über das Outro** ist beschlossen; die endgültige Lautstärkekurve bleibt Teil des späteren Filmmixes.
- [x] Medien-Codecs/Dauer/Tonspuren per ffprobe und vollständiger Dekodierung geprüft: [GitHub Actions PASS](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44007341068).
- [x] **Beide Crossfades auf 0,3 s / 9 Frames verbindlich festgelegt (DEC-023).**
- [x] Der Auftraggeber hat den **Film-Integrationstest** und die **Medienrechteprüfung** ausdrücklich **aus dem Abnahme-Gate von Aufgabe 007 gestrichen**. Beides gehört nicht zur Definition/Abnahme der Branding-Basics. Allgemeine Rechtepflichten vor Veröffentlichung bleiben als projektweite Richtlinie bestehen.
- [x] Nutzerfreigabe für den Abschluss von Aufgabe 007 liegt vor; PR #17 war bereits gemergt, Dokumentationsnachtrag folgt.

**Dokumentationsregel:** Bei jeder durch den Nutzer **beschlossenen** Änderung auch die **zentrale [Repository-README](../../README.md)** (kurzer aktueller Stand), das **[Decision Log](../project/decision-log.md)** (detaillierter Beschluss) und gegebenenfalls die betroffenen spezifischen Dateien **im selben Task-PR** aktualisieren. Historische Beschlüsse nicht kommentarlos überschreiben.
