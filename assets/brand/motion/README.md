# BlueDotAtlas — Motion Assets (Aufgabe 007)

**Verbindlich:** Die **Original-MP4-Dateien des Auftraggebers**, nicht die zuvor generierten Assistenz-Vorschauen. **Upload und technische QA beider Originale bestanden**: [Run #44007341068](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44007341068).

## Originale — im Task-Branch archiviert

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
5. **0,4s / 12 Frames je Crossfade** ist lediglich ein technischer Vorschlagswert, **nicht verbindlich abgenommen**.
6. Ein **anklickbarer YouTube-Subscribe-Button** wird später als echtes Endscreen-Element in **YouTube Studio** über das Outro gesetzt, **nicht** ins MP4 eingebrannt.

Die beiden Crossfades und die kontinuierliche Musik werden beim tatsächlichen Film-Render integriert und erst dann audiovisuell abgenommen; die Originaldateien selbst bleiben unangetastet. Vollständige Regeln: [Motion Guidelines](../../../docs/brand/motion-guidelines.md); Prüfbericht: [Motion QA](../../../docs/brand/motion-qa.md).

## Reproduzierbare Tests

- [`scripts/check-final-motion-media.py`](../../../scripts/check-final-motion-media.py) und [GitHub Action](../../../.github/workflows/final-motion-media-check.yml) prüfen beide Original-MP4s auf Integrität, Dauer, Codec, Videoauflösung, 30fps, Intro-AAC und **stummes Outro**.
- Die CI-Prüfung ist **PASS**; ein Film-Crossfade-Test benötigt noch echte Filmszenen.
- Lizenz-/Quellnachweise für fremde Bilder oder Tonsamples im Intro/Outro sowie zukünftige Musik sind vor Veröffentlichung separat zu führen.

## Veraltete, nicht ausgewählte Prototypen

Die Dateien `logo-intro-outro.html` / `preview.html`, die Skripte `render-short-logo-clips.mjs` / `render-motion-test.mjs` und `scripts/render-outro-fade.sh` dokumentieren frühere **nicht ausgewählte Motion-Experimente**. Kein automatischer Renderer darf diese als endgültiges Intro/Outro anstelle der Nutzerdateien verwenden. Die historisch geprüften Lower-Third-, Ortslabel-, Kartenmarker-, Quellenhinweis- und Caption-Muster bleiben als separate **in-Film-Grafiken** dokumentiert.

## Repo-Workflow und Gate

**Entscheidungen und Status** werden ab jetzt in jedem betreffenden Task-PR immer auch in der [zentralen README](../../../README.md) aktualisiert (DEC-022), plus im [Entscheidungsprotokoll](../../../docs/project/decision-log.md). **Task #16 / Draft PR #17** bleiben offen, bis Gesamtreview und Abnahme des einschlägigen Motion-Gates vollständig sind. Die Videos liegen bislang nur im Branch `design/007-motion-basics`, nicht in `main`.
