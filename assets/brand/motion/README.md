# BlueDotAtlas — Motion Assets (Aufgabe 007)

**Verbindlich:** Die **Original-MP4-Dateien des Auftraggebers** auf **`main`**, nicht die zuvor generierten Assistenz-Vorschauen. **Upload und technische QA beider Originale bestanden**: [Run #44007341068](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44007341068).

## Originale — auf `main` archiviert

| Filmbaustein | Originalvideo | Länge und Audio |
| --- | --- | --- |
| **Intro** | [`final/BlueDotAtlas Intro.mp4`](final/BlueDotAtlas%20Intro.mp4) | **2,5s**, AAC Stereo 48 kHz |
| **Outro** | [`final/BlueDotAtlas_Outro.mp4`](final/BlueDotAtlas_Outro.mp4) | **6,0s**, **keine Tonspur** |

Beide: **1920×1080, H.264, 30fps**. Die **exakten SHA-256- und Git-Blob-Prüfsummen** sind im [Medienarchiv](final/README.md) dokumentiert. Nutzerdateien niemals durch alternative Animationen ersetzen oder neu kodieren.

## Verbindliches Schnitt-/Audiokonzept

1. **Intro → Film:** visueller **Crossfade**.
2. **Letzte Filmszene → Outro:** visueller **Crossfade**.
3. Die zukünftige, rechtlich verwendbare **Film-Hintergrundmusik läuft bis durch das komplette stumme Outro weiter**. Das Finale der Musik (Abklingen/Ausblenden) erst am Filmende sauber mischen; beim Video-Crossfade nicht abrupt stummschalten.
4. Das Intro bringt eine Tonspur mit; vor dem Hauptfilm ist diese mit dem Filmaudio kontrolliert ein- bzw. überzublenden.
5. **Beide Video-Crossfades verbindlich 0,3 Sekunden / 9 Frames bei 30 FPS (DEC-023).**
6. Ein **anklickbarer YouTube-Subscribe-Button** wird später als echtes Endscreen-Element in **YouTube Studio** über das Outro gesetzt, **nicht** ins MP4 eingebrannt.

Die beiden Crossfades und die kontinuierliche Musik werden erst beim tatsächlichen Film-Render integriert; **diese spätere Integration ist kein Gate für Aufgabe 007**. Die Originaldateien selbst bleiben unangetastet. Vollständige Regeln: [Motion Guidelines](../../../docs/brand/motion-guidelines.md); Prüfbericht: [Motion QA](../../../docs/brand/motion-qa.md).

## Reproduzierbare Tests

- [`scripts/check-final-motion-media.py`](../../../scripts/check-final-motion-media.py) und [GitHub Action](../../../.github/workflows/final-motion-media-check.yml) prüfen beide Original-MP4s auf Integrität, Dauer, Codec, Videoauflösung, 30fps, Intro-AAC und **stummes Outro**.
- Die CI-Prüfung der **Originalmedien ist PASS**. Ein echter Film-Crossfade-Test und die Publikationsrechteklärung gehören **nicht zum Abschluss von Aufgabe 007**; die zwei entsprechenden offenen Gate-Punkte wurden auf ausdrücklichen Nutzerwunsch gestrichen.
- Allgemeine Publikationsrechte-/Quellenvorgaben aus den Projektregeln werden dadurch nicht aufgehoben.

## Veraltete, nicht ausgewählte Prototypen

Die Dateien `logo-intro-outro.html` / `preview.html`, die Skripte `render-short-logo-clips.mjs` / `render-motion-test.mjs` und `scripts/render-outro-fade.sh` dokumentieren frühere **nicht ausgewählte Motion-Experimente**. Kein automatischer Renderer darf diese als endgültiges Intro/Outro anstelle der Nutzerdateien verwenden. Die historisch geprüften Lower-Third-, Ortslabel-, Kartenmarker-, Quellenhinweis- und Caption-Muster bleiben als separate **in-Film-Grafiken** dokumentiert.

## Repo-Workflow und Gate

**Entscheidungen und Status** werden ab jetzt in jedem betreffenden Task-PR immer auch in der [zentralen README](../../../README.md) aktualisiert (DEC-022), plus im [Entscheidungsprotokoll](../../../docs/project/decision-log.md). **PR #17 ist bereits gemergt** und die Originalclips liegen auf **`main`**. [Dokumentationsnachtrag PR #18](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/18) komplettiert die vom Nutzer abgenommene Aufgabe 007 / Issue #16.
