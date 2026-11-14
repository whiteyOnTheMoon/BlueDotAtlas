# BlueDotAtlas — Entscheidungsprotokoll

**Zweck:** Verbindliche Beschlüsse von Entwürfen unterscheiden und Änderungen nachvollziehbar versionieren. Jede Entscheidung erhält eine stabile ID; neue Beschlüsse ergänzen dieses Dokument. GitHub-Issues und PRs enthalten ihre Begründung und Änderungshistorie.

## Beschlüsse vom 13.11.2026

| ID | Beschluss | Status | Herkunft | Auswirkung |
| --- | --- | --- | --- | --- |
| DEC-001 | **BlueDotAtlas** ist der verbindliche Produktname und die offizielle Schreibweise. | Entschieden | Nutzer, 13.11.2026 | Ersetzt `blueDotAtlas` aus der Master Roadmap. Alle neuen Artefakte verwenden `BlueDotAtlas`. |
| DEC-002 | Filme werden zunächst **auf Englisch** produziert. | Entschieden | Nutzer, 13.11.2026 | Englische Sprechertexte, Titel, Thumbnails und Publikationsmetadaten; Projektdokumentation darf deutsch sein. |
| DEC-003 | **Hohe Klickrate und lange Zuschauerbindung** sind zentrale Ziele für die Filmgestaltung. | Entschieden | Nutzer, 13.11.2026 | Schwerpunkt auf starken, ehrlichen Hooks, Titeln, Thumbnails, Dramaturgie und Bildrhythmus. Keine erfundenen CTR-Zielwerte. |
| DEC-004 | Bevorzugter Look: **hochwertig, cineastisch, dokumentarisch**. | Entschieden | Nutzer, 13.11.2026 | Premium-Filmgestaltung statt generischer Folien-/Schnellformat-Ästhetik. |
| DEC-005 | **Wissenschaftliche Genauigkeit, Quellen-/Rechteprüfung und manuelle Freigabe** bleiben verpflichtend. | Verbindliche Roadmap-Leitplanke | Master Roadmap V0.1 | Reichweitenoptimierung darf nicht zu Irreführung oder unbelegten Aussagen führen. |
| DEC-006 | Ein **„Ok“ im Projektchat bedeutet eine ausdrückliche Freigabe** des jeweils zur Abnahme vorgelegten Ergebnisses. | Entschieden | Nutzer, 13.11.2026 | Gilt nur für den konkret vorgelegten Prüfschritt; niemals als pauschale Freigabe für neue, nicht gezeigte Änderungen oder kostenpflichtige Aktionen. |
| DEC-007 | Das **Markenversprechen und der gesamte Brand Brief V0.1 (Aufgabe 001)** sind freigegeben. | Entschieden | Nutzerantwort „Ok“, 13.11.2026 | Aufgabe 001 kann nach PR-Merge und Abnahmeprotokoll geschlossen werden. |
| DEC-008 | Der öffentliche englische Claim lautet **„The Planet Has a Story.“** (Schreibweise für die Markenanwendung mit Großbuchstaben und Schluss-Punkt). | Entschieden | Nutzer: „Bin für 'the planet has a story'“, 13.11.2026 | In `docs/brand/naming.md` übernommen; die restlichen Naming-Regeln wurden separat durch DEC-009 freigegeben. |
| DEC-009 | **Keine öffentliche Kurzform in V0.1**, einheitliche Schreibweise BlueDotAtlas auf Website, Thumbnails und Intro sowie die dokumentierten Naming-Einsatzregeln sind freigegeben. | Entschieden | Nutzerantwort „Ok“ auf explizite Nachfrage zur Kurzform und Naming-Regeln, 13.11.2026 | Aufgabe 002 ist redaktionell abgenommen, PR-Merge/Issue-Abschluss separat nachzuweisen. |

## Offene Entscheidungen

| ID | Frage | Aufgabe | Status |
| --- | --- | --- | --- |
| OPEN-003 | Logo-Richtung, Farbe, Schrift, Bild- und Motion-Sprache festlegen | 003–009 | Offen |

## Erledigte Entscheidungspunkte

- **OPEN-001:** Freigabe des Brand Briefs durch „Ok“, dokumentiert unter DEC-007. Die Tagline wurde anschließend separat unter DEC-008 ausgewählt.
- **OPEN-002:** Keine Kurzform und Naming-Regeln durch „Ok“ freigegeben, dokumentiert unter DEC-009.

## Dokumentationsregel

1. Jede neue Nutzerentscheidung wird mit **Datum, ID, Beschluss, Begründung/Herkunft, Auswirkung und Status** dokumentiert.
2. Entscheidungen, die vorherige Dokumente ersetzen, werden als **Änderung** vermerkt; historische Roadmap-Zitate müssen nicht rückwirkend verfälscht werden.
3. In `README.md` steht eine kurze Zusammenfassung; Details, Abhängigkeiten und offene Fragen stehen hier oder in einem aufgabenspezifischen Dokument.
4. Ausführliche Umsetzung folgt dem in der Roadmap festgelegten **Issue → Branch → Tests/Review → PR → Merge**-Ablauf.
5. Im Projektchat gilt ein **„Ok“ als explizite Abnahme des gerade vorgelegten Ergebnisses**. Das schließt keine weiteren, noch unbesprochenen Entscheidungen ein. Ein Entwurf ist ohne solche Freigabe **nicht** automatisch abgenommen. Aufgabenstatus und Gate-Nachweis werden separat geführt.

**Nachweise:** [Issue #1](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/1) · `docs/brand/brand-brief.md`
