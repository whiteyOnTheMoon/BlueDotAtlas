# Vollständiger Roadmap-Issue-Index – M00 bis M13

> **Quelle:** [Master Roadmap V0.1 (PDF)](BlueDotAtlas_Roadmap.pdf) · [Vollständiger Textspiegel](master-roadmap-v01-text.md) · **158 Aufgaben / 14 Meilensteine / 158 einzigartige GitHub-Issues**, Abgleich am 19.11.2026 (UTC).

**Statusstand 19.11.2026 (UTC):** Roadmap-Aufgaben **001–029 für den vereinbarten Scope abgenommen** (029-Vorschau-Abnahme DEC-043, Squash-Merge PR #194 nach final grüner CI freigegeben), **030–034 begrenzt abgenommen (DEC-044/045/046/048/049); 035: abgenommen/gemergt (DEC-050), 036 im technischen Rechte-/Quellenreview, 037–158 im Backlog**. **Kein produktives M02-Gesamtgate**. Der Aufgaben- und Meilensteinimport ist vollständig, **nicht** die inhaltliche Umsetzung der späteren Aufgaben. **Der Aufgabenimport ist abgeschlossen, nicht die Umsetzung.** GitHub-Issue-Nummern sind nicht gleich Roadmap-Nummern.

**Native GitHub-Meilensteine sind eingerichtet:** Nach ausdrücklicher Betreiberfreigabe von [PR #183](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/183) wurden **M00–M13 als 14 native Meilensteine** angelegt. [GitHub Actions #44441286199](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44441286199) meldete: `PASS: 14 native GitHub milestones exist, all 158/158 Issues assigned.` Der Workflow prüfte die Zuordnungen **erneut per GitHub-API** (DEC-035). Das [Manifest](roadmap-milestones-v01.json) bewahrt die Quelle.

**Abweichungen:** Repository bleibt ausdrücklich öffentlich (DEC-034). Aufgabe 013 ist ein begrenzter 8-Sekunden-FFmpeg-Nachweis, **kein** voller lizenzgeprüfter Remotion-/60s-Pilotfilm. Früher freigegebene Issue-Titel können von Original-Roadmap-Titeln abweichen; hier stehen die **Quelltitel**.

## M00 – Marke, Gestaltung und filmische Identität (001–009)

**Abnahmetor laut Roadmap:** Brand-Kit V0.1 ist freigegeben; ein 10-Sekunden-Motion-Test sieht nach blueDotAtlas aus.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **001** | Markenversprechen und Tonalität festlegen | [#1](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/1) | Abgenommen |
| **002** | Wortmarke und Schreibweise normieren | [#3](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/3) | Abgenommen |
| **003** | Logorichtungen skizzieren und auswählen | [#5](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/5) | Abgenommen |
| **004** | Farbwelt und Kontrastregeln definieren | [#7](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/7) | Abgenommen |
| **005** | Typografie und Schriftlizenzen festlegen | [#9](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/9) | Abgenommen |
| **006** | Bildsprache und Thumbnail-Regeln erstellen | [#13](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/13) | Abgenommen |
| **007** | Motion-Design-Basics gestalten | [#16](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/16) | Abgenommen |
| **008** | Web-Designsystem als kompaktes UI-Kit anlegen | [#19](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/19) | Abgenommen |
| **009** | Brand-Gate abnehmen | [#21](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/21) | Abgenommen |

## M01 – Produktgrenzen, technische Vorprüfung und Projektsteuerung (010–020)

**Abnahmetor laut Roadmap:** MVP-Scope und Architektur sind entschieden; VPS kann einen realistischen 1080p-Test leisten oder es gibt eine dokumentierte Alternative.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **010** | Produktziel und Nicht-Ziele als PRD fixieren | [#23](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/23) | Abgenommen |
| **011** | Messbare Video-Erfolgskriterien definieren | [#25](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/25) | Abgenommen |
| **012** | VPS-Inventur und Ressourcenbudget erheben | [#27](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/27) | Abgenommen |
| **013** | VPS-Render-Spike durchführen | [#29](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/29) | Abgenommen |
| **014** | Rechte- und Nutzungsrisiken katalogisieren | [#31](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/31) | Abgenommen |
| **015** | Anbieterstatus und aktuelle Dokumentation prüfen | [#32](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/32) | Abgenommen |
| **016** | Budget und Freigabegrenzen festsetzen | [#33](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/33) | Abgenommen |
| **017** | Kernarchitektur und Systemgrenzen festlegen | [#34](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/34) | Abgenommen |
| **018** | GitHub-Repository und Arbeitsregeln aufsetzen | [#35](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/35) | Abgenommen |
| **019** | Roadmap in GitHub-Milestones übertragen | [#36](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/36) | Abgenommen (DEC-035, Sync verifiziert) |
| **020** | Definition of Ready/Done und Dokumentationsregeln beschließen | [#37](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/37) | Abgenommen (DEC-036; DoR/DoD und ADR-Regeln) |

## M02 – Grundsystem, Datenmodell und VPS-Betrieb (021–034)

**Abnahmetor laut Roadmap:** Geschütztes Admin-Dashboard, Projekt-CRUD und Render-Job sind über HTTPS erreichbar; Neustart und Restore funktionieren.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **021** | Monorepo und Basistooling initialisieren | [#38](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/38) | Abgenommen / Issue geschlossen |
| **022** | Next.js-Anwendung und App-Shell einrichten | [#39](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/39) | Abgenommen / Issue geschlossen |
| **023** | PostgreSQL und ORM mit Migrationen starten | [#40](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/40) | Abgenommen / Issue geschlossen |
| **024** | Projekt- und Video-Datenmodell erstellen | [#41](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/41) | Abgenommen / Issue geschlossen |
| **025** | Admin-Authentifizierung implementieren | [#42](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/42) | Abgenommen / Issue geschlossen |
| **026** | API-Routen und Eingabevalidierung schaffen | [#43](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/43) | Abgenommen / Issue geschlossen |
| **027** | Jobqueue und Renderworker als eigenen Prozess anlegen | [#44](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/44) | Abgenommen / Issue geschlossen |
| **028** | Persistenten lokalen Dateispeicher strukturieren | [#45](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/45) | Abgenommen / Issue geschlossen |
| **029** | Docker Compose und Reverse Proxy einrichten | [#46](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/46) | Öffentliche Vorschau abgenommen (DEC-043); kein produktiver Admin |
| **030** | Secrets und Konfigurationsverwaltung absichern | [#47](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/47) | Abgenommen (DEC-044); PR #195 gemergt |
| **031** | Projekt-CRUD im Dashboard anbieten | [#48](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/48) | Abgenommen (DEC-045), Squash PR #196 |
| **032** | Persistente Wizard-Zustände und Autosave vorbereiten | [#49](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/49) | Abgenommen (DEC-046), Squash PR #197 |
| **033** | CI-Pipeline und Basistests aktivieren | [#50](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/50) | Abgenommen DEC-048, PR #198 Squash gemergt, Issue abgeschlossen |
| **034** | Backup-, Restore- und Überwachungs-MVP einrichten | [#51](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/51) | Repository-/CI-MVP abgenommen (DEC-049), PR #200 gemergt, Issue geschlossen; keine echte VPS-Backup-/Restore-Freigabe |

## M03 – Erster echter 60-Sekunden-Film – technischer Proof (035–048)

**Abnahmetor laut Roadmap:** 60-Sekunden-MP4 in 1920×1080 wird auf dem VPS gerendert, im Admin abgespielt und gemeinsam anhand der Film-Checkliste abgenommen.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **035** | Ein geeignetes Demonstrationsthema festlegen | [#59](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/59) | DEC-050 angenommen, PR #201 Squash `0e399bd` gemergt, Issue geschlossen |
| **036** | Rechtegeprüftes Testmaterial zusammenstellen | [#60](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/60) | Drei tatsächlich bytegeprüfte NASA-/NOAA-Quellen nach Betreiber-Sichtung für **internen privaten Test** als **stummes Bild** akzeptiert; Credits/Herkunft dokumentiert, lokale Dateihashprüfung vor Montage, Veröffentlichung weiterhin ungeprüft. NOAA Ernesto UNREVIEWED; Saildrone BLOCKED. |
| **037** | 60-Sekunden-Skript und Shotlist schreiben | [#61](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/61) | 102-Wort-Skript und [neun Shots / 1800-Frame-Plan](../pilot/60s-script.json) nach Betreiber-OK über [PR #206](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/206) gemergt; Issue abgeschlossen; Planung ohne Render-Go. |
| **038** | Remotion-Projekt mit 1080p-Profil einrichten | [#62](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/62) | 1080p/30fps-Profil und synthetischer 10s-CI-Render im Feature-PR; Test-/Mergefreigabe und Abschluss noch offen, kein 60s-/VPS-Go. |
| **039** | Cinematic-Footage-Komponente erstellen | [#63](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/63) | `FootageScene.tsx` und privater 6s-Zweiquellen-/Dreiszenen-Remotion-Proof mit exaktem SHA-Gate und ohne Publikations-Artefakte im Feature-PR; CI/Betreiberfreigabe noch offen. |
| **040** | Motion-Graphics-Komponente erstellen | [#64](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/64) | Wiederverwendbare Lower Thirds, Ort/Datum/Quellenhinweis und streng belegbare Metrik; echte synthetische 8s/1080p-Remotion-Probe und temporäres QA-Artefakt im Feature-PR; technische/Betreiberabnahme noch offen. |
| **041** | Eine echte wissenschaftliche Animation prototypisieren | [#65](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/65) | Backlog |
| **042** | Frühe TTS-Schnittstelle für den Piloten anschließen | [#66](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/66) | Backlog |
| **043** | Musik-/Ambience-Regeln und Audio-Mix umsetzen | [#67](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/67) | Backlog |
| **044** | Szenen und Ton über eine Timeline verbinden | [#68](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/68) | Backlog |
| **045** | FFmpeg-Exportprofil und Medienprüfung ergänzen | [#69](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/69) | Backlog |
| **046** | Renderauftrag auf VPS über Queue ausführen | [#70](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/70) | Backlog |
| **047** | Video-Vorschau, Download und Archivierung bereitstellen | [#71](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/71) | Backlog |
| **048** | Filmische Abnahme des ersten Clips durchführen | [#72](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/72) | Backlog |

## M04 – Scene Director und professionelle Video Engine (049–063)

**Abnahmetor laut Roadmap:** Eine typisierte Scene-Director-Timeline rendert unterschiedliche Szenenarten, erkennt Qualitätsmängel und kann 8–10 Minuten stabil ausgeben.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **049** | Scene-Director-Vertrag als Version-1-Schema definieren | [#73](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/73) | Backlog |
| **050** | Visuelle Story-Regeln schriftlich festhalten | [#74](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/74) | Backlog |
| **051** | Szenentypen und Fallback-Hierarchie festlegen | [#75](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/75) | Backlog |
| **052** | Shot-Planner mit Rhythmusregeln implementieren | [#76](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/76) | Backlog |
| **053** | Tatsächliche Audiodauer als Master-Timeline nutzen | [#77](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/77) | Backlog |
| **054** | Medien-Auswahlalgorithmus entwickeln | [#78](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/78) | Backlog |
| **055** | Animierte Wissenschaftsdiagramme erstellen | [#79](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/79) | Backlog |
| **056** | Earth-/Karten-Prototyp bauen | [#80](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/80) | Backlog |
| **057** | Filmische Übergänge und Farbkorrektur standardisieren | [#81](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/81) | Backlog |
| **058** | Textgrafiken und Legenden begrenzen | [#82](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/82) | Backlog |
| **059** | Scene-Director-QA-Linter hinzufügen | [#83](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/83) | Backlog |
| **060** | Timeline-Preview und Render-Manifest erstellen | [#84](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/84) | Backlog |
| **061** | 8–10-Minuten-Benchmark auf VPS fahren | [#85](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/85) | Backlog |
| **062** | Render-Fehlerkorrektur und Wiederaufnahme implementieren | [#86](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/86) | Backlog |
| **063** | Video-Engine-Qualitätsgate abnehmen | [#87](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/87) | Backlog |

## M05 – Öffentliche Videothek und Admin-Grundoberfläche (064–074)

**Abnahmetor laut Roadmap:** Öffentliche Seite zeigt nur freigegebene Videos; Admin-Dashboard und Wizard-Navigation sind benutzbar und persistieren Zustand.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **064** | Routen- und Zugriffstrennung prüfen | [#88](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/88) | Backlog |
| **065** | Minimalistische öffentliche Startseite gestalten | [#89](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/89) | Backlog |
| **066** | Video-Detailseite und Player bauen | [#90](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/90) | Backlog |
| **067** | Videometadaten und Sichtbarkeit modellieren | [#91](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/91) | Backlog |
| **068** | Admin-Dashboard mit Projektliste bauen | [#92](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/92) | Backlog |
| **069** | Wizard-Rahmen mit sieben Schritten implementieren | [#93](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/93) | Backlog |
| **070** | Schrittsperren und transparente Voraussetzungen anzeigen | [#94](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/94) | Backlog |
| **071** | Formular-Autosave und Versionshinweise integrieren | [#95](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/95) | Backlog |
| **072** | Benutzerfreundliche Fehler- und Leerlaufzustände vorsehen | [#96](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/96) | Backlog |
| **073** | Responsivität, Tastaturbedienung und Kontraste prüfen | [#97](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/97) | Backlog |
| **074** | UI-Integration mit Demo-Projekt abnehmen | [#98](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/98) | Backlog |

## M06 – News Sources – dauerhaft gepflegtes Quellenregister (075–084)

**Abnahmetor laut Roadmap:** Mindestens vier freigegebene, aktivierbare Quellen liefern regelmäßig normalisierte Nachrichten mit Abrufprotokoll.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **075** | Quellenmodell entwerfen | [#99](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/99) | Backlog |
| **076** | Quellen-Verwaltungsoberfläche bauen | [#100](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/100) | Backlog |
| **077** | RSS-Adapter und Parser implementieren | [#101](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/101) | Backlog |
| **078** | NASA Earth Observatory als Pilotquelle anbinden | [#102](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/102) | Backlog |
| **079** | NOAA-Feed(s) hinzufügen | [#103](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/103) | Backlog |
| **080** | USGS-/ESA-/Copernicus-Adapter prüfen und ergänzen | [#104](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/104) | Backlog |
| **081** | Benutzerdefinierte RSS-Quellen sicher hinzufügen | [#105](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/105) | Backlog |
| **082** | API-Key-Speicherung und Provider-Test schaffen | [#106](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/106) | Backlog |
| **083** | Scheduler, Quoten und Retry-Strategie implementieren | [#107](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/107) | Backlog |
| **084** | Quellen-Monitoring und Änderungsprotokoll ergänzen | [#108](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/108) | Backlog |

## M07 – Discover Topics – Recherche und Faktenbasis (085–096)

**Abnahmetor laut Roadmap:** Ein gewähltes Topic besitzt belegte Kernaussagen, unabhängige Quellenbewertung und eine nachvollziehbare Eignungsentscheidung.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **085** | Normalisiertes Nachrichtenmodell ergänzen | [#109](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/109) | Backlog |
| **086** | Meldungen nach Ereignis zusammenführen | [#110](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/110) | Backlog |
| **087** | Übernommene Pressemitteilungen als gemeinsame Ursprünge erkennen | [#111](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/111) | Backlog |
| **088** | Topic-Kategorien und Ortsbezug normalisieren | [#112](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/112) | Backlog |
| **089** | Eignung für 8–10 Minuten bewerten | [#113](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/113) | Backlog |
| **090** | Claim-/Evidence-Datenmodell schaffen | [#114](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/114) | Backlog |
| **091** | Primärdaten und Veröffentlichungsdaten auseinanderhalten | [#115](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/115) | Backlog |
| **092** | Widersprüche und wissenschaftliche Unsicherheit kennzeichnen | [#116](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/116) | Backlog |
| **093** | Recherchebericht pro Topic generieren | [#117](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/117) | Backlog |
| **094** | Discover-Topics-Oberfläche bauen | [#118](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/118) | Backlog |
| **095** | Topic-Auswahl und Quellen-Snapshot einfrieren | [#119](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/119) | Backlog |
| **096** | Research-Validierung mit Testfällen absichern | [#120](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/120) | Backlog |

## M08 – Media Library – Suche, Auswahl und Rechtekette (097–110)

**Abnahmetor laut Roadmap:** Mediengalerie mit Upload, Providern, Checkbox-Auswahl, Vorschau und harten Lizenzsperren funktioniert; Szene-spezifische Nachsuche ist möglich.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **097** | Asset-Datenmodell mit Rechtefeldern schaffen | [#121](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/121) | Backlog |
| **098** | Gemeinsame Provider-Schnittstelle für Medien definieren | [#122](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/122) | Backlog |
| **099** | NASA Image/Video Library anbinden | [#123](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/123) | Backlog |
| **100** | Pixabay-Fotos und Videos anbinden | [#124](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/124) | Backlog |
| **101** | Wikimedia Commons als geprüfte Ergänzung anbinden | [#125](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/125) | Backlog |
| **102** | Pexels nur als optionalen Provider vorsehen | [#126](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/126) | Backlog |
| **103** | Eigenen Medien-Upload sicher implementieren | [#127](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/127) | Backlog |
| **104** | Große Galerie mit Filtern und Preview bauen | [#128](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/128) | Backlog |
| **105** | Medien-Download und lokalen Cache verwalten | [#129](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/129) | Backlog |
| **106** | Rechte-Workflow und Blockierregeln implementieren | [#130](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/130) | Backlog |
| **107** | Topic-basierte erste Mediensuche einbauen | [#131](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/131) | Backlog |
| **108** | Szenenspezifische zweite Suche implementieren | [#132](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/132) | Backlog |
| **109** | Medienabdeckung und Wiederholungen sichtbar machen | [#133](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/133) | Backlog |
| **110** | Automatische Vorauswahl und manuelle Überschreibungen absichern | [#134](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/134) | Backlog |

## M09 – Script Studio – belegtes Drehbuch mit Szenen (111–121)

**Abnahmetor laut Roadmap:** Skript lässt sich abschnittsweise generieren, editieren und freigeben; jede wichtige Aussage ist zu ihrem Beleg rückverfolgbar.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **111** | Dokumentarische Dramaturgie als Template definieren | [#135](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/135) | Backlog |
| **112** | Skript- und Szenenmodell implementieren | [#136](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/136) | Backlog |
| **113** | LLM-Adapter mit Promptversionierung entwickeln | [#137](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/137) | Backlog |
| **114** | Recherche-Brief zu Gliederung erzeugen | [#138](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/138) | Backlog |
| **115** | Beleggebundene Sprechertexte generieren | [#139](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/139) | Backlog |
| **116** | Szenenweise Visual- und Animation-Intents ableiten | [#140](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/140) | Backlog |
| **117** | Laufzeit anhand Sprechtext realistisch schätzen | [#141](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/141) | Backlog |
| **118** | Quellen- und Konsistenzprüfung implementieren | [#142](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/142) | Backlog |
| **119** | Skripteditor mit Abschnittsregeneration bauen | [#143](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/143) | Backlog |
| **120** | Skriptfreigabe und Änderungsfolgen festlegen | [#144](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/144) | Backlog |
| **121** | Langform-Tests mit drei Themen durchführen | [#145](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/145) | Backlog |

## M10 – Voice Studio – Stimme, Timing und Audioqualität (122–129)

**Abnahmetor laut Roadmap:** Mindestens zwei zulässig verwendbare Stimmen mit hörbarer Vorschau; vollständiges Audio ist zeitlich dem Szenenplan zugeordnet.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **122** | TTS-Provider und Stimmrechtsregeln definieren | [#146](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/146) | Backlog |
| **123** | Stimmenkatalog und Presets erstellen | [#147](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/147) | Backlog |
| **124** | Voice-Preview mit eigenem Skript bauen | [#148](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/148) | Backlog |
| **125** | Ausspracheglossar für Wissenschaftsbegriffe anlegen | [#149](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/149) | Backlog |
| **126** | Abschnittsweise Audiogenerierung implementieren | [#150](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/150) | Backlog |
| **127** | Lautheit, Stille und Audiotechnik prüfen | [#151](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/151) | Backlog |
| **128** | Wort-/Segment-Zeitmarken und Untertitel erstellen | [#152](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/152) | Backlog |
| **129** | Voice-Freigabe und Timing-Update ins Projekt integrieren | [#153](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/153) | Backlog |

## M11 – Vollständigen Produktions-Wizard verbinden (130–139)

**Abnahmetor laut Roadmap:** Ein Projekt durchläuft alle sieben Schritte ohne manuelle Datei- oder Codebearbeitung; das fertige MP4 ist im Admin abrufbar.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **130** | Projekt-Zustandsautomat verbindlich machen | [#154](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/154) | Backlog |
| **131** | Wizard Schritt 1 mit echtem Projektlebenszyklus verbinden | [#155](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/155) | Backlog |
| **132** | News Sources als globale Einstellungen einbinden | [#156](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/156) | Backlog |
| **133** | Topic-Auswahl an Research-Snapshot binden | [#157](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/157) | Backlog |
| **134** | Media- und Skript-Reihenfolge sauber koordinieren | [#158](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/158) | Backlog |
| **135** | Scene Director nach Script/Voice ausführen | [#159](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/159) | Backlog |
| **136** | Preflight-Seite vor Video Production aufbauen | [#160](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/160) | Backlog |
| **137** | Rendersteuerung und Fortschritt integrieren | [#161](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/161) | Backlog |
| **138** | Freigabe- und Rücksprunglogik testen | [#162](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/162) | Backlog |
| **139** | End-to-End-Pfad mit einem echten Thema testen | [#163](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/163) | Backlog |

## M12 – Qualitätssicherung, Sicherheit und Veröffentlichung (140–150)

**Abnahmetor laut Roadmap:** Drei vollständige Testproduktionen sind geprüft; Veröffentlichung ist ausschließlich nach manueller Freigabe möglich.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **140** | Publikationsstatus und manuellen Freigabeknopf umsetzen | [#164](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/164) | Backlog |
| **141** | Titel, Thumbnail und Beschreibung vorbereiten | [#165](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/165) | Backlog |
| **142** | Quellen-/Lizenzexport pro Film erstellen | [#166](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/166) | Backlog |
| **143** | Aktualitätsprüfung direkt vor Publikation einbauen | [#167](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/167) | Backlog |
| **144** | Videoqualitäts-Scorecard und Review-Workflow bauen | [#168](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/168) | Backlog |
| **145** | Sicherheits-Härtung durchführen | [#169](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/169) | Backlog |
| **146** | Lade-, Speicher- und Render-Stresstests ausführen | [#170](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/170) | Backlog |
| **147** | Automatisierte Unit-/Integration-/E2E-Tests abrunden | [#171](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/171) | Backlog |
| **148** | Backup-Restore und Wiederanlauf wiederholen | [#172](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/172) | Backlog |
| **149** | Betriebsmonitoring und Kostenprotokoll erweitern | [#173](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/173) | Backlog |
| **150** | Drei echte Langfilm-Testläufe prüfen | [#174](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/174) | Backlog |

## M13 – Pilotbetrieb, Stabilisierung und V0.1-Abschluss (151–158)

**Abnahmetor laut Roadmap:** Mindestens fünf vollständige Pilotläufe sind dokumentiert; V0.1 ist verwendbar, überprüfbar und ohne automatische YouTube-Veröffentlichung.

| Roadmap-ID | Original-Aufgabe | GitHub-Issue | Umsetzungsstatus |
| --- | --- | --- | --- |
| **151** | Pilot-Backlog und Testthemen definieren | [#175](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/175) | Backlog |
| **152** | Fünf End-to-End-Produktionen durchführen | [#176](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/176) | Backlog |
| **153** | Filmische Schwächen nach Priorität beheben | [#177](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/177) | Backlog |
| **154** | Kostensicherheit und VPS-Leistung neu bewerten | [#178](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/178) | Backlog |
| **155** | Public Release Flow im Echtbetrieb prüfen | [#179](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/179) | Backlog |
| **156** | Handbuch für den täglichen Ablauf schreiben | [#180](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/180) | Backlog |
| **157** | Bekannte Grenzen und Roadmap V0.2 dokumentieren | [#181](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/181) | Backlog |
| **158** | Version V0.1 taggen und Abschlussgate abnehmen | [#182](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/182) | Backlog |

## Prüfung und Betrieb

- [x] 158 Roadmap-Titel aus der 28-seitigen PDF-Textfassung extrahiert und den 14 Original-Meilensteinen zugeordnet.
- [x] Bestehende GitHub-Issues 001–034 **nicht** dupliziert; 035–158 neu importiert.
- [x] Beide GitHub-Suchrichtungen zusammengeführt; **158/158 eindeutige IDs**, keine fehlenden oder doppelten Aufgaben.
- [x] Native GitHub-Meilensteine M00–M13 angelegt, **158/158 Issues zugeordnet und API-Rückprüfung PASS** ([Run #44441286199](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44441286199)).
- [x] [PR #183](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/183) einschließlich GitHub-Milestone-Schreibwirkung ausdrücklich mit „Ok“ freigegeben, gemergt.

**Aufgabe 019 vollständig abgenommen (DEC-035):** [Issue #36](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/36); abgeschlossene Import-/Zuordnungsphase, **kein Film-/M01-Gate vorweggenommen**. Nächste Aufgabe ist **020 – Definition of Ready/Done und Dokumentationsregeln beschließen**.
