# BlueDotAtlas

**Earth & Climate Video Studio** — hochwertige, englischsprachige Wissenschaftsdokumentationen über unseren Planeten.

> Projektphase: **M00 – Brand & Identity** · Aufgaben **001–002** abgeschlossen · **003 – Earth Contour als Logorichtung gewählt; finale SVG-Abnahme offen**

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
- [Logo Directions V0.1](docs/brand/logo-directions.md) — Aufgabe 003; Richtung C (Earth Contour) ausgewählt und transparentes SVG-Set erstellt

## Roadmap und Arbeitsregeln

Grundlage: *BlueDotAtlas Master Roadmap V0.1* (13. November 2026), 14 Meilensteine, 158 fortlaufende Aufgaben und verbindliche Abnahmetore.

- Aufgaben behalten ihre stabilen Nummern `001` bis `158`.
- Für jede Aufgabe gilt: **Issue → Umsetzung auf Branch → Tests/Review → Pull Request → Merge → Gate-Nachweis**.
- Ein Issue oder ein Entwurfsdokument allein bedeutet **nicht**, dass eine Aufgabe abgeschlossen ist.
- Entscheidungen, Begründungen und offene Punkte werden versioniert dokumentiert, zunächst in dieser README und themenspezifisch unter `docs/`.
- Filme werden **nur nach manueller Freigabe** veröffentlicht; YouTube-Autopublishing ist nicht Bestandteil von V0.1.
- **Freigaberegel:** Ein „Ok“ im Projektchat bedeutet die ausdrückliche Freigabe des jeweils zur Entscheidung vorgelegten Ergebnisses, nicht zukünftiger oder anderer Aufgaben.
- Die ursprüngliche Roadmap-Schreibweise des Produktnamens wurde ausdrücklich durch **BlueDotAtlas** ersetzt; Aufgabennummern und Meilensteine bleiben unverändert.

**Abgeschlossen:** [001 – Markenversprechen und Tonalität](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/1) über [PR #2](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/2). **Abgeschlossen:** [002 – Wortmarke und Schreibweise](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/3) über [PR #4](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/4). **Aktuelle Aufgabe:** [003 – Logorichtungen](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/5), Richtung C ausgewählt. [SVG-Logos (hell/dunkel, Voll- und Icon-Version)](assets/brand/logo/) zur finalen Sichtprüfung auf [PR #6](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/6).

## Geplante technische Basis (noch nicht implementiert)

- Web/App: Next.js, React, TypeScript
- API: Node.js
- Datenhaltung: PostgreSQL
- Rendering: Remotion, FFmpeg/ffprobe und separater Worker
- Betrieb: eigener VPS, Docker Compose und HTTPS
- Inhalt: geprüfte wissenschaftliche Quellen, lizenziertes Original-Footage, TTS und redaktionelle Prüfungen

**Hinweis:** Diese README wurde als einmalige initiale Repository-Datei angelegt, da das GitHub-Repository zuvor leer war. Die weiteren Aufgabenänderungen laufen regulär über Issue und Pull Request.
