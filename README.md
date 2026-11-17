# BlueDotAtlas

**Earth & Climate Video Studio** — hochwertige, englischsprachige Wissenschaftsdokumentationen über unseren Planeten.

> Projektphase: **M00 – Brand & Identity** · Aufgaben **001–006** abgeschlossen · **007 – Motion-Design-Basics in Bearbeitung**

## Projektziel

BlueDotAtlas entwickelt ein redaktionell kontrolliertes Webstudio zur Recherche, Planung und Produktion wissenschaftlich fundierter Earth-&-Climate-Dokumentarfilme. Die öffentliche Seite ist eine Videothek; Produktion und redaktionelle Freigabe erfolgen im geschützten Admin-Bereich.

**Technischer Qualitätsnachweis zuerst:** ein echter 60-Sekunden-Film in 1920 × 1080 mit lizenziertem Footage, Narration und erklärender Animation. Erst danach Ausbau zum vollständigen Produktionsworkflow und zu inhaltlich gerechtfertigten längeren Filmen.

## Verbindliche Projektentscheidungen

| Datum | Entscheidung | Status |
| --- | --- | --- |
| 2026-11-13 | Markenname und verbindliche Schreibweise: **BlueDotAtlas** (ersetzt die frühere Roadmap-Schreibweise `blueDotAtlas`). | Festgelegt |
| 2026-11-13 | Primäre Produktions- und Veröffentlichungssprache der Filme: **Englisch**. | Festgelegt |
| 2026-11-13 | Hauptziel bei Distribution und Erzählweise: **hohe Klickrate und lange, echte Zuschauerbindung**. | Festgelegt |
| 2026-11-13 | Filmischer Stil: **hochwertig, cineastisch, dokumentarisch**. | Festgelegt |
| 2026-11-13 | Wissenschaftliche Sorgfalt, nachprüfbare Quellen, echte Visuals und geklärte Medienrechte bleiben Pflicht. Reichweitenoptimierung darf Inhalte nicht verfälschen. | Roadmap-Leitplanke |

**Abgrenzung:** Ziel sind starke, wahrheitsgemäße Titel, Thumbnails, Hooks und Spannungsbögen; keine irreführenden Versprechen, künstlich aufgeblähten Filme oder Sensationsbehauptungen.

Der Brand Brief und das englische Markenversprechen sind am **13.11.2026 freigegeben** worden. Für Aufgabe 002 wurde die öffentliche englische Tagline **„The Planet Has a Story.“** ausgewählt. Es gibt in V0.1 **keine öffentliche Kurzform**; die Naming-/Einsatzregeln wurden am **13.11.2026 per „Ok“ freigegeben**.

## Projektdokumentation

- [Brand Brief V0.1](docs/brand/brand-brief.md) — Aufgabe 001, inhaltlich freigegeben und mit Abnahmecheckliste
- [Entscheidungsprotokoll](docs/project/decision-log.md) — fortlaufend versionierte verbindliche Beschlüsse und offene Fragen
- [Naming & Wordmark Guidelines](docs/brand/naming.md) — Aufgabe 002; Claim, Verzicht auf Kurzform und Naming-Regeln freigegeben
- [Logo Directions V0.1](docs/brand/logo-directions.md) — Aufgabe 003; Richtung C ausgewählt und SVG-Set auf `main` gemergt
- [Visual Language & Thumbnail Rules](docs/brand/visual-language.md) — Aufgabe 006; **genau ein freigegebenes Ozean-Layout für alle Thumbnails** (DEC-017), Test 12/12 bestanden
- [Official Thumbnail Template](assets/brand/thumbnails/template.svg) — **einziger 1280×720-Master**; [drei Inhaltsbeispiele](assets/brand/thumbnails/) mit identischer Anordnung
- [Motion Design Guidelines](docs/brand/motion-guidelines.md) — Aufgabe 007; **beide Original-MP4s vom Nutzer ausgewählt**, Crossfade Intro → Inhalt und Inhalt → Outro; Hintergrundmusik läuft ins stumme Outro durch (DEC-020/021)
- [Motion Clip QA](docs/brand/motion-qa.md) — **echte Nutzer-Originale** Intro **2,5s** mit AAC-Ton und Outro **6,0s ohne Ton**, beide 1080p/H.264/30fps; [GitHub-Medienprüfung erfolgreich](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44007341068)
- [Finale Motion-Medien](assets/brand/motion/final/README.md) — [Intro · 2,5 s](assets/brand/motion/final/BlueDotAtlas%20Intro.mp4) und [Outro · 6,0 s](assets/brand/motion/final/BlueDotAtlas_Outro.mp4), beide Originale auf dem Task-Branch; frühere Assistenz-Demos sind nicht die gewählten Clips.
- [Color System V0.1](docs/brand/colors.md) — Aufgabe 004; freigegebene Deep Ocean / Glacial Light-Palette mit Kontrastnachweisen
- [Brand Colors Assets](assets/brand/colors/) — SVG-Farbpalette; maschinenlesbare UI-Tokens unter `packages/ui/tokens/colors.ts`

## Verbindlicher Film-Intro-/Outro-Standard (Aufgabe 007)

**Originalmedien des Auftraggebers** — unverändert im Task-Branch `design/007-motion-basics` archiviert:

| Baustein | Datei / Länge | Audio |
| --- | --- | --- |
| **Intro** | [`BlueDotAtlas Intro.mp4`](assets/brand/motion/final/BlueDotAtlas%20Intro.mp4) · **2,5 s** | **Eigene AAC-Tonspur vorhanden** |
| **Outro** | [`BlueDotAtlas_Outro.mp4`](assets/brand/motion/final/BlueDotAtlas_Outro.mp4) · **6,0 s** | **Ohne Tonspur** |

Beide Videos sind **Full HD (1920 × 1080), H.264, 30 FPS**; [technisch auf GitHub verifiziert](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44007341068) mit exakten Blob-Prüfsummen und vollständiger Decodierung (**PASS**).

**Schnittregel (DEC-021):** Intro **per Video-Crossfade in den Film**, letzte Filmszene **per Video-Crossfade ins Outro**. Die später lizenzierte **Hintergrundmusik läuft während des gesamten stummen Outros weiter**; erst am eigentlichen Filmende passend ausblenden. Das Originalintro hat eigenen Ton, der beim Übergang sachgerecht mit dem Filmmix verbunden wird. **0,4 s / 12 Frames** ist nur ein vorgeschlagener Startwert für die Crossfades, noch kein fest beschlossener Wert. Die technische Montage wird erst im späteren Film-Renderer getestet.

**YouTube:** Der echte klickbare Abonnieren-Endscreen wird **in YouTube Studio**, nicht im MP4, ergänzt. Der 6-s-Clip kann dafür genutzt werden. Die endgültige Platzierung ist beim Upload zu prüfen; V0.1 publiziert nicht automatisch.

Die aktuellen Schnitt- und Audioregeln stehen in [Motion Guidelines](docs/brand/motion-guidelines.md), Byte-/Tonspur-Details im [Archiv](assets/brand/motion/final/README.md); **alte generierte Logo-Vorschauen gelten ausdrücklich als verworfen**. Noch offen: Integrationstests am echten Film und vollständige Roadmap-007-Abnahme/PR-Merge.

## Roadmap und Arbeitsregeln

Grundlage: *BlueDotAtlas Master Roadmap V0.1* (13. November 2026), 14 Meilensteine, 158 fortlaufende Aufgaben und verbindliche Abnahmetore.

- Aufgaben behalten ihre stabilen Nummern `001` bis `158`.
- Für jede Aufgabe gilt: **Issue → Umsetzung auf Branch → Tests/Review → Pull Request → Merge → Gate-Nachweis**.
- Ein Issue oder ein Entwurfsdokument allein bedeutet **nicht**, dass eine Aufgabe abgeschlossen ist.
- **README-Pflicht bei jeder freigegebenen Entscheidung:** Diese zentrale README wird mit jeder beschlossenen inhaltlichen Änderung und relevanten Projektstatusänderung **im selben PR** aktualisiert (DEC-022); ausführliche Beschlüsse, Begründungen und Historie stehen im [Decision Log](docs/project/decision-log.md), fachspezifische Details unter `docs/`.
- Filme werden **nur nach manueller Freigabe** veröffentlicht; YouTube-Autopublishing ist nicht Bestandteil von V0.1.
- **Freigaberegel:** Ein „Ok“ im Projektchat bedeutet die ausdrückliche Freigabe des jeweils zur Entscheidung vorgelegten Ergebnisses, nicht zukünftiger oder anderer Aufgaben.
- **Schrift-Vorgabe:** Nur kostenfrei nutzbare und für Branding, Website, Video geeignete Fonts mit nachprüfbarer Lizenz (Entscheidung DEC-013).
- Die ursprüngliche Roadmap-Schreibweise des Produktnamens wurde ausdrücklich durch **BlueDotAtlas** ersetzt; Aufgabennummern und Meilensteine bleiben unverändert.

**Abgeschlossen:** [001 – Markenversprechen und Tonalität](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/1) über [PR #2](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/2). **Abgeschlossen:** [002 – Wortmarke und Schreibweise](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/3) über [PR #4](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/4). **Abgeschlossen:** [003 – Logorichtungen](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/5) über [PR #6](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/6). **Abgeschlossen:** [004 – Farbwelt und Kontraste](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/7) über [PR #8](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/8). **Abgeschlossen:** [005 – Typografie und Schriftlizenzen](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/9) über [PR #10](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/10) und [PR #11](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/11), mit [3/3 bestandenen Browser-Testgrößen](docs/brand/typography-qa.md). **Aktuell:** [006 – Bildsprache und Thumbnail-Regeln](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/13) **abgeschlossen** mit einem einzigen Master; [12/12 Tests bestanden](docs/brand/thumbnail-qa.md), [PR #14](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/14) gemergt und Issue #13 geschlossen. **Aktuell:** [007 – Motion-Design-Basics](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/16) als Entwurf in Arbeit; **Beide originalen Nutzerclips auf dem Task-Branch archiviert**, [Video-/Audio-QA PASS](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44007341068); Crossfade und durchgehende Outro-Musik beschlossen (DEC-020/021), technische Gesamtfilmintegration noch nicht abgenommen. Review/Merge von 007 weiterhin offen.

## Geplante technische Basis (noch nicht implementiert)

- Web/App: Next.js, React, TypeScript
- API: Node.js
- Datenhaltung: PostgreSQL
- Rendering: Remotion, FFmpeg/ffprobe und separater Worker
- Betrieb: eigener VPS, Docker Compose und HTTPS
- Inhalt: geprüfte wissenschaftliche Quellen, lizenziertes Original-Footage, TTS und redaktionelle Prüfungen

**Hinweis:** Diese README wurde als einmalige initiale Repository-Datei angelegt, da das GitHub-Repository zuvor leer war. Die weiteren Aufgabenänderungen laufen regulär über Issue und Pull Request.
