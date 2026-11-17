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

| DEC-010 | Logo-Richtung **C — Earth Contour** mit organischen Höhenlinien und einem blauen Datenpunkt ist ausgewählt. | Entschieden | Nutzerentscheidung im Projektchat, 13.–14.11.2026 | Vier Varianten derselben SVG-Geometrie: `logo-light.svg`, `logo-dark.svg`, `icon-light.svg`, `icon-dark.svg`. |
| DEC-011 | **`assets/brand/logo/` ist der einzige aktive Logo-Ordner.** Die früheren `assets/brand/concepts/`-Dateien und `assets/brand/logo.svg` wurden vom Auftraggeber in zwei eigenen Commits gelöscht. | Entschieden | Nutzercommits `24a054988` und `ef41ca6c`, 14.11.2026 | Gelöschte Dubletten nicht wiederherstellen. |
| DEC-012 | **Logo-003 freigegeben** und Übergang zu Farbe/Typografie beschlossen. Das Artboard-Crop ändert nur `viewBox`/`width`/`height` und lässt Zeichen, Farben, Text unverändert. | Entschieden | Nutzer „Ok, dann geht's mit Farben und Typografie weiter“, 14.11.2026 | 003 nach dokumentiertem 48px-Icon-Check und PR-Merge abschließen; später lizenzierte freie Fonts verwenden. |
| DEC-013 | **Nur freie, rechtlich nutzbare Fonts** für BlueDotAtlas verwenden. | Entschieden | Nutzeranweisung „Sollen frei Fonts sein“, 14.11.2026 | Für 005 Schriftlizenzen der konkreten Font-Version prüfen und Lizenzbedingungen in GitHub dokumentieren. |

| DEC-014 | Die **Deep Ocean / Glacial Light**-Palette mit Deep Sea `#021934`, Ice White `#F2F9FF`, Blue Dot `#10AAEC`, Glacier `#37D6C4` und Deep Night `#071522` ist ausgewählt und genehmigt. | Entschieden | Nutzer „Ok, einverstanden“ zur gemeinsamen Farben-/Font-Vorschau, 14.11.2026 | Farben in `packages/ui/tokens/colors.ts`, visuelle Palette unter `assets/brand/colors/`; Logo-SVGs unverändert; Kontraste gesondert geprüft. |
| DEC-015 | **Space Grotesk** als Display-Schrift und **Inter** als Screen-/UI-/Untertitel-Schrift sind ausgewählt; beide müssen legal frei nutzbar sein. | Entschieden (Auswahl) | Nutzer „Ok, einverstanden“, 14.11.2026 | Der Entwurf für 005 kann entsprechend festgelegt werden; Einbindung, exakte Version, Fontlizenzen und Mobil-/TV-Nachweise werden noch geprüft. |

| DEC-016 | **Typografie-005 nach Nutzerlesbarkeitsbestätigung und tatsächlichem Browser-Test freigegeben.** Pinned WOFF2-Builds von Inter und Space Grotesk bestehen alle drei Prüfgrößen: 375px, 768px und 1920×1080. | Abnahme-/Testnachweis | Nutzer „Ist lesbar“ / „Ich finde es lesbar, kannst du auch einen Test machen und abschließen?“ und [GitHub Actions Run #43563814550](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43563814550), 14.11.2026 | Aufgabe 005 kann mit PR-Merge/Issue-Gate geschlossen werden. Produktionseinbindung in Next.js/Remotion sowie physischer TV-Test erst in späteren Aufgaben, nicht als bereits erfolgt dokumentieren. |

| DEC-017 | **Nur EIN verbindliches BlueDotAtlas-Thumbnail-Template** nach dem ersten ausgewählten Ozean-Entwurf: echtes freigegebenes Logo + Claim **oben links**, große Space-Grotesk-Headline **links**, dominantes Motiv **rechts**, Deep-Sea-Verlauf, feiner türkisfarbener Rahmen und kurzer türkisfarbener Unterstrich. Die Motive/Titel wechseln, der Aufbau niemals. Andere bereits gezeichnete Textpositionen sind als Varianten verworfen. | Entschieden | Nutzer: „Der erste Entwurf gefällt mir am besten. Ich will nur ein Template. Aufbau soll immer so sein wie beim ersten Vorschlag.“ und anschließend „Ja, das nehmen wir, bitte auf GitHub dokumentieren bzw Dokumentation ausbessern“, 14.11.2026 | `assets/brand/thumbnails/template.svg` ist der einzige Master. Drei SVG-Mockups sind nur unterschiedliche Inhaltsbeispiele **desselben Layouts**. `docs/brand/visual-language.md` und `docs/brand/thumbnail-qa.md` angepasst; aktueller Chromium-Test **12/12 PASS** ([Run #43606211530](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43606211530)). Wissenschaftliche Bildrechte bleiben je Veröffentlichung zu prüfen. |

| DEC-018 | Die ursprünglich vorgeschlagene **kombinierte 10-Sekunden-Motion-Präsentation ist als Intro/Outro nicht akzeptiert**. Stattdessen werden **zwei unabhängige, kurze Logo-Clips** gewünscht: ein ca. 2–3-sekündiges Intro mit Animation des unveränderten Logos und ein ca. 2–3-sekündiges Outro; keine Lower Third, Marker oder Quellenleiste in den Logo-Clips. | Entschieden (Anforderung, **finale Animationsabnahme noch offen**) | Nutzer: „Nicht ganz zufrieden. Wir sollten einen kurzen 2,3 Sekunden Clip fürs Intro machen, animiertes Logo zb, und ein 2, e Sekunden Clip für das outro.“, 14.11.2026 | Aufgabe 007: neue eigenständige Intro-/Outro-Videos mit Arbeitslängen **2,3s und 2,2s**. Frühere 10s-Demo bleibt nur als technischer Lower-Third-/Marker-Test, nicht als offizieller Markenclip. Der Nutzer muss beide neuen MP4s noch freigeben. |

| DEC-019 | Der Nutzer hat das **fertige Intro-MP4 `BlueDotAtlas Intro.mp4` mit 2,5 Sekunden** als neues BlueDotAtlas-Intro bezeichnet und um dauerhafte GitHub-Ablage gebeten. Die zuvor erzeugten Logo-Animationen ersetzen diese Nutzerauswahl nicht. Ein Outro ist **noch nicht geliefert**. | **Intro-Auswahl entschieden; Binärdatei-Archivierung in GitHub noch ausstehend** | Original-MP4 vom Nutzer, 17.11.2026; Anfrage: „das ist das intro.. kannst du es auf github ablegen, damit wir es später verwenden können? outro kommt später“ | Originalclip 1920×1080, 30fps, H.264, AAC 48kHz, exakt 2,5s. Original SHA-256 `d2fc15c428434e76e14b2f371b3ed7d03afd605353c8b93ae59420b64bc38f47`. Zielpfad `assets/brand/motion/final/BlueDotAtlas_Intro_2p5s.mp4`, nach Upload zu verifizieren. Weitere Outro-Arbeiten und Gate 007 bleiben offen. |

## Offene Entscheidungen

| ID | Frage | Aufgabe | Status |
| --- | --- | --- | --- |
| OPEN-003 | Farbwelt, freies Schriftpaar und EIN Thumbnail-Template sind entschieden; zwei kurze Motion-Logo-Clips zur finalen Freigabe, UI-Kit und Brand-Gate folgen | 007–009 | Teilweise offen |

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
