# BlueDotAtlas — Visual Language & Thumbnail Rules V0.1

**Roadmap:** M00 · Aufgabe 006 — Bildsprache und Thumbnail-Regeln  
**Entscheidung:** **Freigegeben: EIN verbindliches Thumbnail-Layout** (DEC-017, Nutzerwahl 14.11.2026).  
**Status:** Gestalterische Richtung freigegeben; Review, aktualisierte Layouttests und PR-Merge separat nachweisen.  
**Vorher:** Aufgaben 001–005 abgeschlossen.

## 1. Freigegebene Referenz und verbindliche Entscheidung

Der Auftraggeber hat den **allerersten Ozean-Entwurf („THE OCEAN’S HIDDEN ENGINE“) ausdrücklich ausgewählt**, danach anhand eines eigenen Screenshots bestätigt: „Der erste Entwurf gefällt mir am besten. Ich will nur ein Template. Aufbau soll immer so sein wie beim ersten Vorschlag.“ Anschließende Abnahme: „Ja, das nehmen wir, bitte auf GitHub dokumentieren bzw Dokumentation ausbessern.“

**Damit gibt es nur EIN offizielles Template, unabhängig vom Filmthema.** Ozean, Gletscher, Wetter, Satellitenbilder usw. dürfen Motive und Überschrift austauschen, **aber nicht das Grundlayout, die Logo-Position oder die Titelspalte**. Andere Layouts (Titelfeld rechts, Text unten links, abweichender Logo-Bereich) sind ausdrücklich **nicht mehr als Alternative gültig**.

Die im Chat gezeigte fotorealistisch wirkende Ozean-Illustration dient als **gestalterische Leitvorlage**. Die neuen Repository-SVGs sind technisch editierbare Rekonstruktionen **dieses Layouts**, keine pixelidentische Kopie des generierten Hintergrundbildes und keine echten wissenschaftlichen Satellitenaufnahmen.

## 2. Master-Template (verbindlich)

**EIN Template:** [`assets/brand/thumbnails/template.svg`](../../assets/brand/thumbnails/template.svg)  
**Artboard:** **1280 × 720 px, 16:9** für YouTube.  
**Dateiabgrenzung:** Die SVGs unter [`mockups/`](../../assets/brand/thumbnails/mockups/) sind drei **Inhaltsbeispiele mit demselben Template**, keine weiteren Templates.

| Element | Verbindliche Anordnung |
| --- | --- |
| **Logo + Claim** | Immer **oben links**, einmalig, klein; das bestehende offizielle `logo-dark.svg` aus `assets/brand/logo/` unverändert in der Form übernommen, einschließlich „The Planet Has a Story.“ |
| **Titelblock** | Immer **links**, groß, bevorzugt 2–4 kurze Zeilen (bei längeren Titeln kürzen); Display-Schrift **Space Grotesk Bold 700** |
| **Typofarbe** | Hauptwörter in **Ice White `#F2F9FF`**; **genau ein** Schlüsselwort optional im bestehenden **Blue Dot `#10AAEC`** hervorheben |
| **Titel-Akzent** | Eine **kurze türkise Linie** direkt unter der linken Headline (`#37D6C4`), durchgehend gleiche Gestaltungslogik |
| **Hauptmotiv** | Immer **rechts**, dominant; darf für verschiedene Wissenschaftsthemen ersetzt werden. Der linke Bereich bleibt lesbar |
| **Lesbarkeit** | **Dunkler Deep-Sea-Verlauf** von links Richtung Bildmitte, mit Erhalt des rechten Motivkontrasts; keinen künstlichen Text-Kasten über das ganze Motiv setzen |
| **Rahmen** | Feiner **türkisfarbener**, leicht abgerundeter Rand (`#37D6C4`), etwa 32 px Abstand zum 1280×720-Artboard |
| **Außenabstand** | Innerhalb des Rahmens Sicherheitsraum; alle Headlines und das Logo bleiben deutlich innerhalb der Bildränder |
| **Bildsprache** | Cineastisch, hochwertig, klarer Eye-Catcher, dunkle Blau-/Ozeantöne, kontrollierte Eisweiß-Highlights |
| **Verzicht** | **Keine weiteren Layoutvarianten**, kein großer Claim auf der Bildfläche, keine zusätzlichen Ausrufe-/Schock-Badges und kein erfundenes Agentursiegel |

**Titelbehandlung:** Der einzelne Titel wechselt je Film, **Position, Weiß/Blau-Betonung und Unterstrich bleiben als System konstant**. YouTube-Video-Titel und Thumbnail-Text sollen sich ergänzen und die tatsächliche dokumentarische Aussage ehrlich abbilden.

## 3. Ein Template, drei Themenbeispiele (Roadmap-006-Nachweis)

| Beispielthema | Beispiel-Datei | Gleichbleibende Struktur |
| --- | --- | --- |
| **Ozeanströmungen** | [`ocean-currents.svg`](../../assets/brand/thumbnails/mockups/ocean-currents.svg) | Logo oben links, Headline links, Motiv rechts, Verlauf + Rahmen + Unterstrich |
| **Eis / Kryosphäre** | [`changing-ice.svg`](../../assets/brand/thumbnails/mockups/changing-ice.svg) | **Exakt derselbe Aufbau**, nur Motiv und Headline ausgetauscht |
| **Stürme / Erdsicht** | [`storm-from-space.svg`](../../assets/brand/thumbnails/mockups/storm-from-space.svg) | **Exakt derselbe Aufbau**, nur Motiv und Headline ausgetauscht |

[**Alle drei als Übersicht**](../../assets/brand/thumbnails/overview.svg).

Die Muster enthalten eigenständige **Illustrationen**, keine echten Aufnahmen von Ozeandaten, Gletschern oder Wirbelstürmen. Die SVGs sind Prototypen **für die Layoutabnahme**. Kein Motiv behauptet bereits eine verifizierte Beobachtung. Bei Veröffentlichung werden reale, zur Episode passende Bilder mit verifizierter Nutzungsberechtigung eingesetzt oder wissenschaftliche Visualisierungen eindeutig als solche gekennzeichnet.

## 4. Bildsprache für reale Produktions-Assets

| Eingabe | Gewünschte Bildsprache | Nicht zulässig |
| --- | --- | --- |
| Satellit / Earth Observation | Echte, visuell eindrucksvolle Strömungen, Küsten, Wolken, großflächige Muster; Metadaten zur Quelle | Künstliche Wirbel als reale Satellitenaufnahme, falsche Zeit-/Ortsangaben oder NASA-/ESA-Markennachahmung |
| Ozean, Eis, Landschaft | Charakteristische Details, echte Texturen, natürliche Farben mit sanfter markenkonformer Gradation | Durchgehend neonblau umgefärbte Naturbilder, erfundene Krisenmotive |
| Makro-Aufnahmen | Maßstab und Kontext, klare Schärfeebene, strukturelle Details | Unmarkierte Maßstabstäuschungen |
| Karten / GIS | Korrekte Projektionen und Geografie, deutlich beschriftete Marker | Erfundenes Grenz-/Ortswissen, irreführende Farbflächen |
| Datencharts | Achsen, Einheiten, Zeitachsen und Quellen direkt beim Datenbezug | Dekorative Wellenlinien als vermeintlich gemessene Zeitreihen |

**Grundregel:** Hohe CTR und längere authentische Wiedergabedauer durch Neugier und filmische Qualität, **nicht** durch Täuschung, erfundene Daten oder falsche Gefahr.

## 5. Technische Erstellung eines Thumbnails

1. **Ausgangspunkt:** ausschließlich `assets/brand/thumbnails/template.svg`. Das Layout ist die verbindliche Ebene; das Motiv rechts und die Textzeilen sind Austauschfelder.
2. **Bild einsetzen:** Originalaufnahme oder transparent gekennzeichnete Illustration, immer nach Prüfung der konkreten Datei: Lizenz, Urheber, Änderungs- und Distributionsbedingungen, Quelle, Aufnahmedatum, Ort, bei Satelliten Instrument.
3. **Titel formulieren:** knapp und klickstark, aber sachlich gedeckt. Text **links** positionieren; bei Längenproblemen umformulieren, nicht den Titel auf die rechte Seite verlagern.
4. **Logo:** aus `assets/brand/logo/logo-dark.svg`; **Originalpfade nicht verändern**. Das Template übernimmt diese Form im Brand-Header. Keine neu erfundenen Mini-Logos.
5. **Export:** 1280×720 Thumbnail, nötigenfalls separate rasterisierte Web-Ausgabe; Schriftdateien nur nach OFL-Lizenzerfüllung und mit den genehmigten Fontfamilien.
6. **Test:** auf 320px und 160px betrachten, Titel und Motiv prüfen; hellen/dunklen Bildkontrast, YouTube-Timestamp unten rechts, keine abgeschnittenen Inhalte.
7. **Publishing:** Manuelle Freigabe und wissenschaftliche Wahrheits-/Rechtekontrolle für **jede** Folge.

Die Grafikbeispiele enthalten bewusst keinen „CONCEPT MOCKUP“-Fußtext auf der Thumbnail-Bildfläche. Ihr Illustrationsstatus ist im SVG-`<desc>`, in der Dokumentation und im Asset-Manifest zu führen; die produktive Version erhält keine überlagernden Produktionshinweise.

## 6. Rechte-/Authentizitäts-Checkliste

- [ ] Ein reales Motiv belegt das tatsächlich thematisierte Ereignis oder Phänomen; keine Bildbehauptung ohne Quelle.
- [ ] Autor, Lizenz, ggf. Attribution, Aufnahme-/Entstehungsdatum, Dateiversion und Quelle im Medienregister.
- [ ] Satellitenbild: Quelle, Instrument, Ort, Datum, natürlicher oder falscher Farbmodus; Visualisierung entsprechend gekennzeichnet.
- [ ] Drittanbieter-/Bildrechte bei NASA/NOAA/ESA-Inhalten und eingebetteten Drittmaterialien individuell prüfen; keine institutionelle Unterstützung suggerieren.
- [ ] Thumbnail-Headline wird vom tatsächlichen Film ehrlich beantwortet.
- [ ] Tatsächlicher Export 1280×720, Kurzlesbarkeit bei 320px/160px geprüft.
- [ ] Nur das freigegebene Layout mit Logo oben links, Text links und Motiv rechts verwendet.

Nützliche Referenzen (geben **keine pauschale Freigabe zur Wiederverwendung**):
- [NASA Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)
- [NASA Brand Guidelines](https://www.nasa.gov/nasa-brand-center/brand-guidelines/)
- [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/)

## 7. Abnahme Aufgabe 006

- [x] Gestalterische Richtung verbindlich durch Auftraggeber gewählt: **nur das erste Ozean-Layout** als Mastertemplate.
- [x] Drei unterschiedliche Themen als Anwendungsbeispiele desselben Layouts angelegt.
- [x] Vorhandene Brand-Farben und lizenziertes Schriftpaar übernommen; offizielle Logo-Dateien **nicht verändert**.
- [x] Regeln für Satellitenbilder, Makro, Ozean, Karten und Datenvisualisierungen dokumentiert.
- [ ] Aktuelle Master-/Beispiel-SVGs in Chromium bei 1280/320/160 auf Textpositionen, echte Fonts und Logoform geprüft; alter 9/9-Test bezog sich noch auf die inzwischen verworfenen Mehrlayout-Entwürfe.
- [ ] PR-Review/Merge mit QA-Nachweis; danach Issue #13 schließen.

**Ein einziger Master, konsistent für alle künftigen BlueDotAtlas-Thumbnails.**
