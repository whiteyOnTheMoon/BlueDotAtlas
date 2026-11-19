# BlueDotAtlas – Master Roadmap V0.1 (vollständige Textfassung)

**Quelle:** vom Betreiber hochgeladenes Original `BlueDotAtlas_Roadmap.pdf`, **28 Seiten**, Stand **13. November 2026**. Diese Datei bewahrt den maschinell extrahierten **Quelltext aller Seiten**, einschließlich der Aufgaben 001–158. Sie ist **nicht die Original-PDF**; für das unveränderte Layout und Abbildungen wird weiterhin das PDF benötigt.

**Achtung zur Versionspflege:** Die Roadmap verwendet teilweise die frühere Schreibung `blueDotAtlas`; verbindlich freigegeben ist später **BlueDotAtlas**. Dokumentierte Projektentscheidungen und bereits abgenommene Aufgaben werden nicht rückwirkend überschrieben.

```text
<PARSED TEXT FOR PAGE: 1 / 28>
                                                                           blueDotAtlas / MASTER ROADMAP / V0.1




● BlueDotAtlas

MASTER ROADMAP
Earth & Climate Video Studio | Version 0.1



Vom ersten Markenentwurf bis zum vollständig gerenderten
Wissenschaftsfilm.

LEITPRINZIP Filmqualität vor Feature-Anzahl. Der erste verpflichtende technische Erfolg ist ein
60-Sekunden-MP4 mit echtem Footage, Sprecher und Animation – nicht ein Dashboard mit vielen Buttons.




 DOKUMENT                   UMFANG
 Planungsstand              13. November 2026 | Basis: Masterplan V0.1
 Struktur                   14 Meilensteine · 158 fortlaufende Aufgaben · Abnahmetore
 Zielausgabe                1920 × 1080 · MP4 · 8–10 Minuten, nur wenn Inhalt trägt
 Betrieb                    Eigener VPS · React / Next.js · Node.js · PostgreSQL
 Publikation                Freigabe durch Admin; YouTube-Automatisierung nicht in V0.1




Arbeitsdokument. Zeit, Aufwand, Kosten und Anbieterbedingungen müssen vor der Umsetzung anhand des realen VPS und
aktueller Bedingungen überprüft werden.




                                     blueDotAtlas • Arbeits- und Abnahmeplan • 1
<PARSED TEXT FOR PAGE: 2 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1




01 Zielbild & verbindliche Leitplanken
blueDotAtlas ist ein einzelnes, redaktionell kontrolliertes Webstudio. Es recherchiert aktuelle, nachvollziehbare
Earth-&-Climate-Themen, plant szenenbasierte Dokumentarfilme, organisiert lizenzgeprüfte Medien und rendert
auf dem eigenen VPS. Die öffentliche Website bleibt eine einfache Videothek; alle Produktionsfunktionen liegen
in /admin.
 VERBINDLICH FÜR V0.1                                        BEWUSST NICHT IM ERSTEN RELEASE
 Ein Admin, Passwortlogin, gespeicherte Projekte             Mehrbenutzer-/Rollenplattform
 7-Schritte-Wizard mit persistentem Zustand                  Kompletter Nonlinear-Videoeditor
 News → Topic → Research-Brief → Script                      Autonome tägliche Serienproduktion
 Zweistufige Medienrecherche plus Rechteprüfung              Abhängigkeit von einzelnen Stock-APIs
 Scene Director + Remotion/FFmpeg                            Generative Videoclips als zwingende Grundlage
 60-Sekunden-Testfilm, dann 8–10-Minuten-Film                YouTube-Auto-Upload/-Veröffentlichung
 MP4, Browserplayer, manuelles Publish                       Kubernetes und externe Rendercloud als Pflicht




02 So wird die Roadmap abgearbeitet
• Jede Aufgabe hat eine stabile Nummer (001–158). Die Nummer steht auch im GitHub-Issue-Titel;
GitHub-eigene Issue-IDs können abweichen.
• Die Aufgaben sind in sinnvoller Startreihenfolge sortiert. Das Feld „Vorher“ nennt die wichtigsten fachlichen
Voraussetzungen; zusammenhängende Arbeiten können nach Freigabe parallel laufen.
• Ein Meilenstein gilt erst dann als abgeschlossen, wenn sein Abnahmetor („Gate“) bestanden ist. Nicht erledigte
Blocker bleiben offen, selbst wenn die UI bereits fertig aussieht.
• Bei jeder Aufgabe: Issue anlegen → umsetzen → automatisiert/manuell testen → Dokumentation aktualisieren
→ Review → PR mergen → Gate-Nachweis anhängen.
 AUFWANDSKLASSE                RICHTWERT, NICHT ZUSAGE
 S · klein                     Wenige Stunden bei klaren Voraussetzungen
 M · mittel                    Etwa ein konzentrierter Entwicklungsblock mit Tests
 L · groß                      Mehrstufige Arbeit; bei Bedarf vor Umsetzung in Teil-Issues zerlegen


WICHTIG Keine Aufgaben in „Done“ setzen, nur weil Code geschrieben wurde. Mindestens Test, Abnahme,
nachvollziehbares Ergebnis und ein verlinkter Pull Request sind erforderlich.




03 Meilenstein-Übersicht
 ID       MEILENSTEIN                                                               AUFGABEN                  ANZAHL
 M00      Marke, Gestaltung und filmische Identität                                 001–009                   9
 M01      Produktgrenzen, technische Vorprüfung und Projektsteuerung                010–020                   11
 M02      Grundsystem, Datenmodell und VPS-Betrieb                                  021–034                   14
 M03      Erster echter 60-Sekunden-Film – technischer Proof                        035–048                   14
 M04      Scene Director und professionelle Video Engine                            049–063                   15
 M05      Öffentliche Videothek und Admin-Grundoberfläche                           064–074                   11
 M06      News Sources – dauerhaft gepflegtes Quellenregister                       075–084                   10
 M07      Discover Topics – Recherche und Faktenbasis                               085–096                   12
 M08      Media Library – Suche, Auswahl und Rechtekette                            097–110                   14
 M09      Script Studio – belegtes Drehbuch mit Szenen                              111–121                   11
 M10      Voice Studio – Stimme, Timing und Audioqualität                           122–129                   8
 M11      Vollständigen Produktions-Wizard verbinden                                130–139                   10
 M12      Qualitätssicherung, Sicherheit und Veröffentlichung                       140–150                   11
 M13      Pilotbetrieb, Stabilisierung und V0.1-Abschluss                           151–158                   8




                                     blueDotAtlas • Arbeits- und Abnahmeplan • 2
<PARSED TEXT FOR PAGE: 3 / 28>
                                                                             blueDotAtlas / MASTER ROADMAP / V0.1




04 Abfolge und kritischer Pfad
M00 Marke → M01 Scope & VPS-Audit → M02 Grundsystem → M03 echter 60-Sekunden-Film → M04 Scene
Director & Langfilm → M05 Oberfläche → M06 Quellen → M07 Topics & Belege → M08 Medienrechte → M09
Skript → M10 Stimme → M11 vollständiger Wizard → M12 Qualität/Publish → M13 Pilot/Release.

GATE-FOLGE A = Brand freigegeben · B = VPS/Architektur machbar · C = System läuft · D =
60-Sekunden-Film bestanden · E = Scene Director/Langfilm bestanden · F = durchgängige Webapp · G =
Forschungs-/Rechtekette · H = vollständiger Wizard · I = Qualitätsfreigabe · J = Pilot/Release.




04a Grobe Etappenplanung – Richtfenster
Unverbindliche Beispielplanung bei kontinuierlicher Entwicklung; Überschneidungen sind möglich. Erst nach VPS-Messung
und den ersten echten Renderläufen belastbar aktualisieren.
 FENSTER                 SCHWERPUNKT / NACHWEIS
 Woche 1–3               M00–M01 · Marke, Scope, Quellen-/Lizenzprüfung und VPS-Go/No-Go
 Woche 3–7               M02 · GitHub, Webapp, Datenbank, Worker, HTTPS, Restore
 Woche 6–12              M03–M04 · 60-Sekunden-Film, Scene Director, Langfilm-Render
 Woche 10–17             M05–M08 · Frontend, Newsquellen, Topics, Medien und Rechte
 Woche 16–23             M09–M11 · Skript, Voice und vollständige Produktion
 Woche 22–28+            M12–M13 · QA, Tests, Pilot und Release-Gate


MEILENSTEIN M00 · 9 AUFGABEN



M00 Marke, Gestaltung und filmische Identität
Ziel Ein wiedererkennbares Earth-&-Climate-Branding definieren, bevor Weboberfläche und Filmvorlagen
gebaut werden.

ABNAHMETOR Brand-Kit V0.1 ist freigegeben; ein 10-Sekunden-Motion-Test sieht nach blueDotAtlas aus.



☐ 001 Markenversprechen und Tonalität festlegen
Umsetzung Kernbotschaft, Zielgruppe, geografische Reichweite, wissenschaftlichen Anspruch und Abgrenzung von
Sensationskanälen formulieren; eine einheitliche redaktionelle Ansprache definieren.
Ergebnis docs/brand/brand-brief.md | Abnahme Markenversprechen, 3–5 Leitwerte, Beispieltitel und No-Gos sind
dokumentiert.

Vorher: – • Aufwand: S • Status: TODO

☐ 002 Wortmarke und Schreibweise normieren
Umsetzung Verbindliche Schreibung „blueDotAtlas“, Kurzform, Claim und Regeln zur Verwendung auf Thumbnail,
Website und Videointro festlegen.
Ergebnis docs/brand/naming.md | Abnahme Name erscheint in allen Mockups identisch; kein unfreiwilliger Stilwechsel.

Vorher: 001 • Aufwand: S • Status: TODO

☐ 003 Logorichtungen skizzieren und auswählen
Umsetzung 2–3 eigenständige Konzepte (z. B. Punkt/Orbit/Konturlinie) in hell/dunkel vergleichen; Lesbarkeit bei
kleinem Format prüfen; Endfassung als Vektorgrafik planen.
Ergebnis assets/brand/logo.svg + Varianten | Abnahme Logo ist auch als 48-px-Icon erkennbar und ohne fremde
Markenbestandteile nutzbar.

Vorher: 001–002 • Aufwand: M • Status: TODO




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 3
<PARSED TEXT FOR PAGE: 4 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1



☐ 004 Farbwelt und Kontrastregeln definieren
Umsetzung Primärblau, Tiefsee-Dunkelton, Eisweiß und Akzentfarbe bestimmen; Tokens für UI, Diagramme, Karten
und Motion Graphics erstellen; Kontrast für Text prüfen.
Ergebnis packages/ui/tokens/colors.ts | Abnahme Tokens für Hell-/Dunkelvariante existieren; wichtige
Text-/Button-Kontraste sind geprüft.

Vorher: 003 • Aufwand: M • Status: TODO

☐ 005 Typografie und Schriftlizenzen festlegen
Umsetzung Eine gut lesbare Screen-Schrift sowie eine Display-Schrift auswählen; Lizenz und Web-Einbindung prüfen;
Schriftskala für 1080p-Untertitel, Website und Thumbnails dokumentieren.
Ergebnis docs/brand/typography.md | Abnahme Font-Dateien werden nur bei zulässiger Lizenz eingebunden; Testtext ist
mobil und auf TV lesbar.

Vorher: 004 • Aufwand: S • Status: TODO

☐ 006 Bildsprache und Thumbnail-Regeln erstellen
Umsetzung Referenzen für Satellitenbilder, Makroaufnahmen, Ozean, Karten und Datencharts sammeln;
Thumbnail-Raster, Bildausschnitte und sparsame Titelplatzierung festlegen.
Ergebnis docs/brand/visual-language.md | Abnahme Mindestens drei verschiedene Themen lassen sich als konsistente
Thumbnail-Mockups darstellen.

Vorher: 003–005 • Aufwand: M • Status: TODO

☐ 007 Motion-Design-Basics gestalten
Umsetzung Intro/Outro, Kartenmarker, Ortslabel, Quellenhinweis und einfache Bildunterschrift als Animationsmuster
definieren; übermäßige Textfolien ausdrücklich ausschließen.
Ergebnis docs/brand/motion-guidelines.md | Abnahme Ein kurzer Testclip enthält Logo-Motion und Lower Third ohne
permanente Vollflächen-Overlays.

Vorher: 004–006 • Aufwand: M • Status: TODO

☐ 008 Web-Designsystem als kompaktes UI-Kit anlegen
Umsetzung Buttons, Eingabefelder, Karten, Status-Badges, Stepper und Galerie-Kacheln gestalten; Desktop zuerst,
mobile Nutzbarkeit berücksichtigen.
Ergebnis design/ui-kit-v01 + tokens | Abnahme Öffentliche Website und Admin können auf demselben visuellen System
aufgebaut werden.

Vorher: 004–007 • Aufwand: M • Status: TODO

☐ 009 Brand-Gate abnehmen
Umsetzung Logo, Farbwerte, Typografie, Thumbnail, Voice-Charakter und ein beispielhaftes 1080p-Storyboard-Frame
nebeneinander reviewen; Entscheidungen und offene Punkte festhalten.
Ergebnis docs/brand/brand-kit-v01.md | Abnahme Eine verbindliche V0.1-Auswahl ist protokolliert; Änderungen werden
versioniert.

Vorher: 001–008 • Aufwand: S • Status: TODO
MEILENSTEIN M01 · 11 AUFGABEN



M01 Produktgrenzen, technische Vorprüfung und
Projektsteuerung
Ziel Risiken, Erfolgskriterien, VPS-Grenzen und Arbeitsregeln vor der eigentlichen Implementierung festlegen.

ABNAHMETOR MVP-Scope und Architektur sind entschieden; VPS kann einen realistischen 1080p-Test
leisten oder es gibt eine dokumentierte Alternative.




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 4
<PARSED TEXT FOR PAGE: 5 / 28>
                                                                              blueDotAtlas / MASTER ROADMAP / V0.1



☐ 010 Produktziel und Nicht-Ziele als PRD fixieren
Umsetzung Öffentliche Videothek, Einzeladmin, 7 Wizard-Schritte, 8–10-Minuten-Ziel und manuelle Freigabe
beschreiben; Autopublish, Multiuser und Voll-Editor aus V0.1 ausschließen.
Ergebnis docs/product/prd-v01.md | Abnahme Alle späteren Features können als MVP / später / ausgeschlossen
eingeordnet werden.

Vorher: 009 • Aufwand: S • Status: TODO

☐ 011 Messbare Video-Erfolgskriterien definieren
Umsetzung Technische Ausgabe, filmische Dynamik, Quellenbelege, Lizenzstatus, Sprache, Ton und Bedienbarkeit als
Prüfmatrix formulieren; Kriterien für 60 Sekunden und Langfilm trennen.
Ergebnis docs/quality/video-acceptance.md | Abnahme Jeder Testfilm kann anhand derselben Checkliste bestanden oder
abgelehnt werden.

Vorher: 010 • Aufwand: M • Status: TODO

☐ 012 VPS-Inventur und Ressourcenbudget erheben
Umsetzung CPU-Kerne, RAM, SSD-Freiraum, I/O, OS, Docker-Version, Netzwerk, Bandbreite und vorhandene Dienste
protokollieren; Puffer für Betrieb und Renderjobs reservieren.
Ergebnis docs/infra/vps-audit.md | Abnahme Messwerte sowie verfügbare Ressourcen für Web, DB und Renderer sind
nachvollziehbar.

Vorher: 010 • Aufwand: S • Status: TODO

☐ 013 VPS-Render-Spike durchführen
Umsetzung Mit lizenzgeprüftem Testmaterial 1080p/H.264-Export über Remotion/FFmpeg erproben; Laufzeit,
RAM-Spitze, CPU-Last und Speicherbedarf festhalten.
Ergebnis docs/infra/render-benchmark.md | Abnahme Go/No-Go für Rendering auf dem VPS; bei Engpässen
Qualität-/Parallelitäts-Strategie dokumentiert.

Vorher: 012 • Aufwand: L • Status: TODO

☐ 014 Rechte- und Nutzungsrisiken katalogisieren
Umsetzung Quellenzugriff, Bild-/Video-/Musiklizenzen, Marken, personenbezogene Aufnahmen, Karten,
Datenlizenzen, TTS-Stimmen und Veröffentlichung getrennt bewerten.
Ergebnis docs/legal/rights-matrix.md | Abnahme Unklare Rechte sind als Blocker definiert; keine pauschale „gratis = frei
nutzbar“-Annahme.

Vorher: 010 • Aufwand: M • Status: TODO

☐ 015 Anbieterstatus und aktuelle Dokumentation prüfen
Umsetzung Aktuelle Bedingungen für NASA, NOAA, USGS, ESA/Copernicus, Pixabay, Pexels, Wikimedia, Remotion
und TTS-Kandidaten mit Prüfdatum und Links erfassen.
Ergebnis docs/providers/vendor-registry.md | Abnahme Jeder zunächst aktive Provider hat geprüften Zugriff und geltende
Nutzungsbedingungen.

Vorher: 014 • Aufwand: M • Status: TODO

☐ 016 Budget und Freigabegrenzen festsetzen
Umsetzung Monatliche Höchstkosten für LLM/TTS, Speicher und Dritt-APIs definieren; Warnschwellen je Auftrag und
manuellen Genehmigungsweg für Zusatzkosten festhalten.
Ergebnis docs/operations/budget-policy.md | Abnahme Kein kostenpflichtiger Provider wird ohne dokumentierte Freigabe
aktiviert.

Vorher: 012–015 • Aufwand: S • Status: TODO

☐ 017 Kernarchitektur und Systemgrenzen festlegen
Umsetzung Next.js/React für Web, Node/TypeScript für Logik, PostgreSQL als Datenquelle, getrennten Renderworker
und Provider-Adapter beschreiben; Redis/BullMQ nur passend zum VPS-Benchmark einsetzen.
Ergebnis docs/architecture/overview.md | Abnahme Datenfluss Research → Script → Scenes → Media → Voice → Render
ist skizziert; Module sind klar getrennt.

Vorher: 013, 016 • Aufwand: M • Status: TODO



                                       blueDotAtlas • Arbeits- und Abnahmeplan • 5
<PARSED TEXT FOR PAGE: 6 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1



☐ 018 GitHub-Repository und Arbeitsregeln aufsetzen
Umsetzung Privates Repo blueDotAtlas, Branch-Konzept, PR-Vorlage, Issue-Typen, Labels,
CODEOWNERS/Reviewprozess und Projekt-Board vorbereiten.
Ergebnis GitHub: blueDotAtlas + .github/ | Abnahme Jede Codeaufgabe besitzt vor dem Commit ein Issue; PR referenziert
seine Aufgaben-ID.

Vorher: 017 • Aufwand: M • Status: TODO

☐ 019 Roadmap in GitHub-Milestones übertragen
Umsetzung M00–M13 und stabile 3-stellige Aufgabennummern als Issue-Titel anlegen; Abhängigkeiten und
Ergebnisse aus diesem Plan übernehmen; Import auf Dubletten prüfen.
Ergebnis GitHub-Issue-Backlog | Abnahme Alle Aufgaben sind zuordenbar, keine doppelten Issue-IDs; Status läuft über
GitHub.

Vorher: 018 • Aufwand: M • Status: TODO

☐ 020 Definition of Ready/Done und Dokumentationsregeln beschließen
Umsetzung Klare Inputs/Outputs, Tests, Screenshots bei UI, Lizenzprüfung, Datenmigrationen und Abnahme pro PR
verbindlich machen; Architekturentscheidungen als ADR sichern.
Ergebnis docs/project/working-agreement.md | Abnahme Ein beispielhafter PR erfüllt die Done-Checkliste inklusive
Review und erfolgreicher CI.

Vorher: 018–019 • Aufwand: S • Status: TODO
MEILENSTEIN M02 · 14 AUFGABEN



M02 Grundsystem, Datenmodell und VPS-Betrieb
Ziel Eine kleine, sicher laufende Webapp mit Admin-Login, Datenbank und entkoppeltem Job-Worker erstellen.

ABNAHMETOR Geschütztes Admin-Dashboard, Projekt-CRUD und Render-Job sind über HTTPS erreichbar;
Neustart und Restore funktionieren.



☐ 021 Monorepo und Basistooling initialisieren
Umsetzung Workspace mit apps/web, apps/worker, packages/core, packages/db, packages/video und
packages/providers erstellen; pnpm, TypeScript, Lint, Formatter und Umgebungsbeispiel konfigurieren.
Ergebnis Monorepo + README | Abnahme Clean Install, Typecheck, Lint und Build laufen reproduzierbar.

Vorher: 018, 020 • Aufwand: M • Status: TODO

☐ 022 Next.js-Anwendung und App-Shell einrichten
Umsetzung Öffentliche Route /, Login und /admin anlegen; Layout, Routing, Lade- und Fehlerzustände sowie
Design-Tokens aus M00 integrieren.
Ergebnis apps/web | Abnahme Leere Startseite und geschütztes Admin-Gerüst lassen sich lokal aufrufen.

Vorher: 008, 021 • Aufwand: M • Status: TODO

☐ 023 PostgreSQL und ORM mit Migrationen starten
Umsetzung Datenbank, Migrationstool, Seed-Dateien und ein lokales Test-Setup einrichten; einheitliche IDs,
Zeitstempel und Soft-Delete-Regeln festlegen.
Ergebnis packages/db + migrations | Abnahme Migrationen sind wiederholbar, von frischer DB startbar und getestet.

Vorher: 021 • Aufwand: M • Status: TODO

☐ 024 Projekt- und Video-Datenmodell erstellen
Umsetzung VideoProject, ProjectVersion, StepProgress, Video, RenderJob, Approval, Artifact und AuditEvent
modellieren; Statuswerte und Constraints festlegen.
Ergebnis DB-Migrationen 001–... | Abnahme Projektstatus bleibt über Neustarts stabil; ungültige Statussprünge werden
abgelehnt.

Vorher: 023 • Aufwand: L • Status: TODO



                                      blueDotAtlas • Arbeits- und Abnahmeplan • 6
<PARSED TEXT FOR PAGE: 7 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1



☐ 025 Admin-Authentifizierung implementieren
Umsetzung E-Mail-/Passwort-Login für genau ein Administratorkonto, zeitgemäße Passwort-Hashes, sichere Cookies,
Session-Ablauf und Logout vorsehen.
Ergebnis /admin/login + Auth-Service | Abnahme Anonyme Requests auf /admin und APIs werden serverseitig blockiert.

Vorher: 022–024 • Aufwand: M • Status: TODO

☐ 026 API-Routen und Eingabevalidierung schaffen
Umsetzung Projekt-, Job-, Medien- und Video-Endpunkte entwerfen; gemeinsame Schemas (z. B. Zod), konsistente
Fehlercodes und serverseitige Zugriffsprüfung anwenden.
Ergebnis docs/api/v1.md + Endpunkte | Abnahme Ungültige Eingaben liefern nachvollziehbare Fehler ohne
Stacktrace/Secrets.

Vorher: 024–025 • Aufwand: M • Status: TODO

☐ 027 Jobqueue und Renderworker als eigenen Prozess anlegen
Umsetzung BullMQ/Redis oder ressourcenschonende Alternative gemäß M01 verwenden; Job starten, reservieren,
Heartbeat, Timeout, Retry und Cancel definieren.
Ergebnis apps/worker + Jobschema | Abnahme Ein künstlicher Testjob läuft im Worker, ohne HTTP-Request oder UI zu
blockieren.

Vorher: 024, 026 • Aufwand: L • Status: TODO

☐ 028 Persistenten lokalen Dateispeicher strukturieren
Umsetzung Trennung /srv/blueDotAtlas für uploads, caches, temp, rendered, backups und logs; sichere Pfade,
Quoten und Lebenszyklen festlegen.
Ergebnis Storage-Modul + Ordnerplan | Abnahme Temporäre Dateien werden entfernt; veröffentlichte MP4 bleiben
referenziert.

Vorher: 023–027 • Aufwand: M • Status: TODO

☐ 029 Docker Compose und Reverse Proxy einrichten
Umsetzung Web, Worker, DB, Queue und HTTPS-Proxy auf bestehendem VPS deployen; interne Dienste nicht
öffentlich exponieren; Healthchecks und Restart-Policies setzen.
Ergebnis compose*.yml + Deploy-Anleitung | Abnahme System ist per HTTPS erreichbar; DB und Queue sind extern nicht
erreichbar.

Vorher: 021–028 • Aufwand: L • Status: TODO

☐ 030 Secrets und Konfigurationsverwaltung absichern
Umsetzung API-Keys nur serverseitig in geschütztem Secret-Store/Env verwalten; .env.example ohne echte Werte;
Debug-Logging und Redaction definieren.
Ergebnis docs/security/secrets.md | Abnahme Kein API-Schlüssel erscheint in Git, Browser-Responses oder Logausgaben.

Vorher: 029 • Aufwand: S • Status: TODO

☐ 031 Projekt-CRUD im Dashboard anbieten
Umsetzung Neues Videoprojekt anlegen, umbenennen, archivieren, öffnen und nach Status anzeigen; es wird beim
Anlegen noch nichts gerendert.
Ergebnis /admin/projects | Abnahme Create New Video erzeugt exakt ein persistiertes Projekt ohne Renderjob.

Vorher: 024–026 • Aufwand: M • Status: TODO

☐ 032 Persistente Wizard-Zustände und Autosave vorbereiten
Umsetzung Pro Schritt Entwurf/Review/Freigabe versionieren; Autosave nach Änderungen, Wiederaufnahme und
Konfliktmeldung bei doppelten Tabs vorsehen.
Ergebnis StepProgress-Service | Abnahme Browser schließen/öffnen verliert keine bestätigten Daten.

Vorher: 024, 031 • Aufwand: M • Status: TODO




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 7
<PARSED TEXT FOR PAGE: 8 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1



☐ 033 CI-Pipeline und Basistests aktivieren
Umsetzung GitHub Actions mit Install, Lint, Typecheck, Unit/Integrations-Smoketest, Build und Migrationscheck;
PR-Schutz dokumentieren.
Ergebnis CI-Workflow | Abnahme Kaputter Code blockiert Merge; Build ist ohne lokale Geheimnisse ausführbar.

Vorher: 021–029 • Aufwand: M • Status: TODO

☐ 034 Backup-, Restore- und Überwachungs-MVP einrichten
Umsetzung Regelmäßige DB-Sicherungen, getrennte Kopie wichtiger Medien/Manifeste, Restore-Skript, Health- und
Plattenplatzwarnungen implementieren.
Ergebnis docs/ops/backup-restore.md | Abnahme Ein dokumentierter Wiederherstellungstest gelingt auf frischer
Testumgebung.

Vorher: 028–029 • Aufwand: L • Status: TODO
MEILENSTEIN M03 · 14 AUFGABEN



M03 Erster echter 60-Sekunden-Film – technischer Proof
Ziel Noch vor automatischer Newsrecherche einen vollständigen, filmisch überzeugenden Clip mit Footage,
Sprecher und Bewegung rendern.

ABNAHMETOR 60-Sekunden-MP4 in 1920×1080 wird auf dem VPS gerendert, im Admin abgespielt und
gemeinsam anhand der Film-Checkliste abgenommen.



☐ 035 Ein geeignetes Demonstrationsthema festlegen
Umsetzung Ein klar umrissenes, gut belegbares Earth-Thema mit leicht verfügbarem Footage wählen; Ziele,
60-Sekunden-Dramaturgie und geplante Visuals vorab skizzieren.
Ergebnis docs/pilot/60s-brief.md | Abnahme Thema, Hook, 3 Kernaussagen und benötigte Aufnahmen sind klar.

Vorher: 011, 013, 034 • Aufwand: S • Status: TODO

☐ 036 Rechtegeprüftes Testmaterial zusammenstellen
Umsetzung Mindestens drei echte Videos, optional ein Satellitenbild und eine Datengrafik manuell kuratieren;
Quellen-URL, Urheber und erlaubte Nutzung dokumentieren.
Ergebnis assets/pilot/ + rights-manifest.json | Abnahme Kein Testmedium ohne Herkunfts-/Rechtenachweis in der
Timeline.

Vorher: 014, 035 • Aufwand: M • Status: TODO

☐ 037 60-Sekunden-Skript und Shotlist schreiben
Umsetzung Kurzes Narrationsskript mit 6–10 visuellen Einstellungen, gewünschter Spannungskurve und Zeitfenstern
erstellen; Aussagen mit Originalquellen verlinken.
Ergebnis docs/pilot/60s-script.json | Abnahme Shotlist deckt alle Aussagen ab; keine erfundenen Werte oder unmotivierte
Szenen.

Vorher: 035–036 • Aufwand: M • Status: TODO

☐ 038 Remotion-Projekt mit 1080p-Profil einrichten
Umsetzung 1920×1080, definierte Bildrate, sichere Pixelränder, Video-/Audio-Tracks und wiederverwendbaren
Start-End-Aufbau konfigurieren.
Ergebnis packages/video/compositions | Abnahme Lokaler 10-Sekunden-Test wird stabil kodiert; Bildrate/Auflösung sind
reproduzierbar.

Vorher: 013, 021, 037 • Aufwand: M • Status: TODO




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 8
<PARSED TEXT FOR PAGE: 9 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1



☐ 039 Cinematic-Footage-Komponente erstellen
Umsetzung Vollformatiges Video mit Crop/Contain-Regeln, Schnittpunkten, veränderbarer Geschwindigkeit,
Color-Handling und schwarzer Balken-Vermeidung implementieren.
Ergebnis FootageScene.tsx | Abnahme Mehrere echte Clips wechseln ohne Standbild- oder Slideshow-Eindruck.

Vorher: 038 • Aufwand: M • Status: TODO

☐ 040 Motion-Graphics-Komponente erstellen
Umsetzung Lower Third, Ort, Datum und kleine Messwerte mit zurückhaltenden Ein-/Ausblendungen umsetzen; keine
dominierenden Daueroverlays.
Ergebnis GraphicsScene.tsx | Abnahme Texte sind lesbar und verschwinden nach ihrer Informationsfunktion.

Vorher: 007, 038 • Aufwand: M • Status: TODO

☐ 041 Eine echte wissenschaftliche Animation prototypisieren
Umsetzung Eine Datenskala, Kartenbewegung oder Verlaufsgrafik programmatisch animieren; nur belegte
Beispielzahlen oder klar beschriftete Demo-Daten einsetzen.
Ergebnis ScienceScene.tsx | Abnahme Animation erklärt einen konkreten Sachverhalt und bewegt sich über mehrere
Sekunden.

Vorher: 038–040 • Aufwand: L • Status: TODO

☐ 042 Frühe TTS-Schnittstelle für den Piloten anschließen
Umsetzung Für eine Stimme echten Sprechertext vertonen; Anbieter/Modell-Lizenz dokumentieren; Geschwindigkeit
und Pausen grob einstellen.
Ergebnis audio/pilot-narration.wav | Abnahme Sprecher klingt verständlich; keine abgeschnittenen Silben oder überlangen
Pausen.

Vorher: 037 • Aufwand: M • Status: TODO

☐ 043 Musik-/Ambience-Regeln und Audio-Mix umsetzen
Umsetzung Lizenzgeprüfte optionale Hintergrundmusik und Atmo einbinden; Ducking unter Sprecher, sanfte Fades
und Pegelkontrolle vorbereiten.
Ergebnis packages/video/audio-mix | Abnahme Sprecher ist stets verständlich; keine Übersteuerung, Lizenz der Musik
belegt.

Vorher: 042 • Aufwand: M • Status: TODO

☐ 044 Szenen und Ton über eine Timeline verbinden
Umsetzung Scene-Liste, Clip-In/Out, Übergänge und TTS-Timing synchronisieren; totale Dauer aus der tatsächlichen
Tonspur ableiten.
Ergebnis pilot-timeline.json | Abnahme Keine Timeline-Lücken, Audio endet passend zum Bild, Szenen reihen sich korrekt.

Vorher: 037–043 • Aufwand: L • Status: TODO

☐ 045 FFmpeg-Exportprofil und Medienprüfung ergänzen
Umsetzung Ausgabe H.264/AAC-MP4, faststart, korrekte Pixel-/Audioformate; ffprobe-Checks und Exportvalidierung
implementieren.
Ergebnis render/preset-1080p.json | Abnahme Export ist 1920×1080, abspielbar und ohne kaputte Streams.

Vorher: 038, 044 • Aufwand: M • Status: TODO

☐ 046 Renderauftrag auf VPS über Queue ausführen
Umsetzung Pilotfilm per Button in den Worker geben; Status queued/running/failed/completed, Progress und
Fehlerprotokoll an DB/UI melden.
Ergebnis RenderJob + Ergebnis-MP4 | Abnahme Browser bleibt bedienbar; Job überlebt Reload und erstellt nur ein final
gültiges Artefakt.

Vorher: 027, 029, 045 • Aufwand: L • Status: TODO




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 9
<PARSED TEXT FOR PAGE: 10 / 28>
                                                                          blueDotAtlas / MASTER ROADMAP / V0.1



☐ 047 Video-Vorschau, Download und Archivierung bereitstellen
Umsetzung Im Admin generiertes MP4 abspielen, im Original herunterladen und als unveröffentlichtes Video
speichern; technische Metadaten anzeigen.
Ergebnis /admin/projects/:id/video | Abnahme Direkter HTML5-Player und MP4-Download funktionieren mit
Zugriffskontrolle.

Vorher: 031, 046 • Aufwand: M • Status: TODO

☐ 048 Filmische Abnahme des ersten Clips durchführen
Umsetzung Auf großen und kleinen Screens Bildrhythmus, Übergänge, Erklärwert, Narration, Dynamik und Rechte
prüfen; Probleme als Issues erfassen.
Ergebnis docs/pilot/60s-review.md | Abnahme Abnahme ausdrücklich bestanden; bei Diashow-Wirkung wird M03 nicht
geschlossen.

Vorher: 011, 036–047 • Aufwand: M • Status: TODO
MEILENSTEIN M04 · 15 AUFGABEN



M04 Scene Director und professionelle Video Engine
Ziel Die Regieentscheidungen vom Textgenerator trennen und reproduzierbare visuelle Qualität als Systemregel
verankern.

ABNAHMETOR Eine typisierte Scene-Director-Timeline rendert unterschiedliche Szenenarten, erkennt
Qualitätsmängel und kann 8–10 Minuten stabil ausgeben.



☐ 049 Scene-Director-Vertrag als Version-1-Schema definieren
Umsetzung NarrationSegment, Scene, Shot, AssetRef, DataRef, AnimationInstruction, SourceRef, Duration und
Transition typisieren; Zod-/JSON-Schema erstellen.
Ergebnis packages/core/scene-schema/v1 | Abnahme Jede Szene kann formal validiert werden; fehlende Pflichtwerte
liefern aussagekräftige Fehler.

Vorher: 048 • Aufwand: M • Status: TODO

☐ 050 Visuelle Story-Regeln schriftlich festhalten
Umsetzung Footage-Vorrang, minimale Overlay-Dichte, sinnvoller Schnittrhythmus und Informationswert von
Animationen definieren; Thema darf bewusste Ausnahmen begründen.
Ergebnis docs/video/scene-director-rules.md | Abnahme Regeln unterscheiden echten Informationsgewinn von
dekorativer Bewegung.

Vorher: 011, 049 • Aufwand: M • Status: TODO

☐ 051 Szenentypen und Fallback-Hierarchie festlegen
Umsetzung Cinematic Footage, Scientific Animation, Animated Data, Earth/Map und Documentary Graphics klar
abgrenzen; bei fehlenden Assets akzeptable Fallbacks definieren.
Ergebnis docs/video/scene-taxonomy.md | Abnahme Für jede Szene ist eine geprüfte Haupt- und Ersatzvisualisierung
beschreibbar.

Vorher: 049–050 • Aufwand: M • Status: TODO

☐ 052 Shot-Planner mit Rhythmusregeln implementieren
Umsetzung Aus Narration/Storyboard eine Folge von Einstellungen ableiten; Variation der Einstellungsgrößen,
Bewegrichtung und Motivwiederholung messen.
Ergebnis packages/video/scene-director/shot-planner | Abnahme Keine endlosen gleichartigen B-Roll-Loops ohne
nachvollziehbare Begründung.

Vorher: 049–051 • Aufwand: L • Status: TODO




                                    blueDotAtlas • Arbeits- und Abnahmeplan • 10
<PARSED TEXT FOR PAGE: 11 / 28>
                                                                             blueDotAtlas / MASTER ROADMAP / V0.1



☐ 053 Tatsächliche Audiodauer als Master-Timeline nutzen
Umsetzung Segment- und Wortzeiten aus TTS übernehmen; Schnittlängen automatisch anpassen, aber weder
Sprache unnatürlich beschleunigen noch Bild sinnlos strecken.
Ergebnis packages/video/timeline/align.ts | Abnahme Sprecher, Kapitel und Visuals sind ohne spürbares Driften synchron.

Vorher: 044, 049 • Aufwand: L • Status: TODO

☐ 054 Medien-Auswahlalgorithmus entwickeln
Umsetzung Passung von Motiv, Ort, Zeitraum, Auflösung, Lizenz, Qualität und Wiederholung bewerten; automatische
Auswahl mit erklärbarer Priorisierung speichern.
Ergebnis packages/video/scene-director/asset-ranker | Abnahme Ein ungeeignetes oder ungeprüftes Asset wird nicht
ohne Freigabe gesetzt.

Vorher: 051–052 • Aufwand: L • Status: TODO

☐ 055 Animierte Wissenschaftsdiagramme erstellen
Umsetzung Line-Chart, Balken-/Vergleichsdiagramm, Messwert-Callout und Heatmap mit Timings, Einheiten,
Referenzzeitraum und Quellenzeile bauen.
Ergebnis packages/video/charts | Abnahme Echte Daten und Achsen sind korrekt beschriftet; Bewegung verzerrt Aussage
nicht.

Vorher: 041, 051 • Aufwand: L • Status: TODO

☐ 056 Earth-/Karten-Prototyp bauen
Umsetzung Auf Basis zulässiger Geodaten eine Region fokussieren, Marker/Kamerafahrt animieren und Overlays an
Koordinaten binden; Karten-Lizenz dokumentieren.
Ergebnis packages/video/maps | Abnahme Mindestens eine Karte zeigt einen Ort mit kontrolliertem Zoom und plausibler
Georeferenz.

Vorher: 041, 051 • Aufwand: L • Status: TODO

☐ 057 Filmische Übergänge und Farbkorrektur standardisieren
Umsetzung Harte Schnitte als Standard, wenige passende Dissolves/Match-Cuts, konsistente
Belichtung/Farbtemperatur; Übergangskosten im Rendering prüfen.
Ergebnis packages/video/transitions | Abnahme Die Sequenz wirkt wie Schnitt, nicht wie Präsentationsfolien mit Effekten.

Vorher: 052, 055–056 • Aufwand: M • Status: TODO

☐ 058 Textgrafiken und Legenden begrenzen
Umsetzung Orts- und Institutnamen, Jahreszahlen und Kernwerte als kurze Einblendungen; automatische Safe-Area-,
Kontrast- und Überlappungsprüfung.
Ergebnis packages/video/graphics | Abnahme Texte verdecken keine wichtigen Bildelemente und bleiben rechtzeitig
lesbar.

Vorher: 050–051 • Aufwand: M • Status: TODO

☐ 059 Scene-Director-QA-Linter hinzufügen
Umsetzung Statische Szenenzeit, doppelte Assets, fehlende Quellen/Lizenzen, absurde Dauer, leere Shots und
übermäßige Texttafeln als Warnung/Blocker erkennen.
Ergebnis packages/video/qa/scene-lint | Abnahme Bewusst schlechte Test-Timelines lösen definierte Fehlermeldungen
aus.

Vorher: 049–058 • Aufwand: L • Status: TODO

☐ 060 Timeline-Preview und Render-Manifest erstellen
Umsetzung Finale Reihenfolge, Media-In/Out, Quellen, Audiodateien, Datenstände und Versionsnummer als
unveränderbares Manifest speichern.
Ergebnis render-manifest.v1.json | Abnahme Identischer Input erzeugt wiederholbar dieselbe strukturierte Produktion.

Vorher: 049–059 • Aufwand: M • Status: TODO




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 11
<PARSED TEXT FOR PAGE: 12 / 28>
                                                                             blueDotAtlas / MASTER ROADMAP / V0.1



☐ 061 8–10-Minuten-Benchmark auf VPS fahren
Umsetzung Mehrminütige Timeline mit typischen Clips/Charts/TTS rendern; Speicherpeak, Zeit,
Temperatur/CPU-Drosselung und Fehlerverhalten protokollieren.
Ergebnis docs/infra/long-render-benchmark.md | Abnahme 1080p-Full-Length funktioniert ohne Betriebsausfall oder
Gegenmaßnahmen sind beschlossen.

Vorher: 046, 060 • Aufwand: L • Status: TODO

☐ 062 Render-Fehlerkorrektur und Wiederaufnahme implementieren
Umsetzung Fehlende Dateien, Downloadabbrüche, disk-full, Timeout, Abbruch und Retry behandeln; Teilergebnisse
nur mit gültigem Manifest übernehmen.
Ergebnis Worker-Recovery + Testfälle | Abnahme Ein Fehler erzeugt nie ein als „fertig“ markiertes defektes Video.

Vorher: 061 • Aufwand: L • Status: TODO

☐ 063 Video-Engine-Qualitätsgate abnehmen
Umsetzung 60-Sekunden-Pilot erneut mit Scene Director rendern und längeren Film stichprobenartig prüfen;
Diashow-Risiko und Regierhythmus protokollieren.
Ergebnis docs/quality/engine-gate.md | Abnahme Filmkriterien erfüllt; M04 erst nach bestandenem
Bewegungs-/Rechte-/Aussage-Gate beendet.

Vorher: 049–062 • Aufwand: M • Status: TODO
MEILENSTEIN M05 · 11 AUFGABEN



M05 Öffentliche Videothek und Admin-Grundoberfläche
Ziel Die zwei Produktbereiche klar trennen und für weitere Wizard-Schritte eine verlässliche Bedienoberfläche
schaffen.

ABNAHMETOR Öffentliche Seite zeigt nur freigegebene Videos; Admin-Dashboard und Wizard-Navigation
sind benutzbar und persistieren Zustand.



☐ 064 Routen- und Zugriffstrennung prüfen
Umsetzung Öffentliche Videos nur über /, /videos/[slug]; geschützter Bereich über /admin; APIs und Mediendateien
unabhängig vom sichtbaren UI absichern.
Ergebnis Routing- und Auth-Tests | Abnahme Unveröffentlichte Medien und Admin-Daten können nicht anonym abgerufen
werden.

Vorher: 025, 047 • Aufwand: M • Status: TODO

☐ 065 Minimalistische öffentliche Startseite gestalten
Umsetzung Logo, kurzer Claim und Videogrid ohne Nachrichtenlisten oder Seitenmenü-Überfrachtung bauen;
sinnvolle Empty-State-Ansicht hinzufügen.
Ergebnis apps/web/app/page.tsx | Abnahme Der Besucher versteht die Seite unmittelbar als blueDotAtlas-Videothek.

Vorher: 008, 064 • Aufwand: M • Status: TODO

☐ 066 Video-Detailseite und Player bauen
Umsetzung Thumbnail, Titel, Datum und responsiven HTML5-Player integrieren; Untertiteloption und ein technisch
sauberes Poster-Fallback vorsehen.
Ergebnis /videos/[slug] | Abnahme Ein veröffentlichtes MP4 spielt auf Desktop und Mobilgerät ab.

Vorher: 065 • Aufwand: M • Status: TODO




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 12
<PARSED TEXT FOR PAGE: 13 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1



☐ 067 Videometadaten und Sichtbarkeit modellieren
Umsetzung Titel, Beschreibung, Thumbnail, Dauer, Sprache, PublishedAt, Status draft/ready/published und Slug
speichern; nur publishbare Datensätze öffentlich ausgeben.
Ergebnis Video-Publikationsschema | Abnahme Ein unveröffentlichtes Video erscheint weder im Grid noch per öffentlicher
URL.

Vorher: 024, 066 • Aufwand: M • Status: TODO

☐ 068 Admin-Dashboard mit Projektliste bauen
Umsetzung Projektkarte mit Thema, Status, zuletzt geändert, Rendertempo, Freigabestufe und Schnellzugriff; „+
Create New Video“ sichtbar platzieren.
Ergebnis /admin Dashboard | Abnahme Bestehende Projekte lassen sich öffnen; neues Projekt erzeugt keinen
automatischen Render.

Vorher: 031–032 • Aufwand: M • Status: TODO

☐ 069 Wizard-Rahmen mit sieben Schritten implementieren
Umsetzung Seitenleisten-/Stepper-Navigation für New Video, News Sources, Discover Topics, Media Library, Script
Studio, Voice Studio und Video Production bauen.
Ergebnis /admin/projects/[id]/studio | Abnahme Vor-/Zurück-Navigation erfolgt ohne vollständige Seitenneuladung.

Vorher: 032, 068 • Aufwand: M • Status: TODO

☐ 070 Schrittsperren und transparente Voraussetzungen anzeigen
Umsetzung Fehlende Eingaben markieren, aber Entwürfe weiterhin zugänglich halten; gesperrte Freigabe-Buttons mit
Begründungen anzeigen.
Ergebnis Wizard-Gating | Abnahme Nutzer erkennt vor dem Render exakt, was noch fehlt.

Vorher: 069 • Aufwand: M • Status: TODO

☐ 071 Formular-Autosave und Versionshinweise integrieren
Umsetzung Speicherstatus saved/saving/error darstellen; relevante Bestätigungen und regenerierte Inhalte
versionieren; Datenverlust bei Navigation verhindern.
Ergebnis Autosave-UI | Abnahme Nach Reload ist die letzte gespeicherte Projektfassung sichtbar.

Vorher: 032, 069 • Aufwand: M • Status: TODO

☐ 072 Benutzerfreundliche Fehler- und Leerlaufzustände vorsehen
Umsetzung Provider nicht verfügbar, keine Treffer, fehlende Medien, ungültige Quelle, Renderfehler und abgelaufene
Session als handlungsfähige Zustände gestalten.
Ergebnis UI-State-Component-Library | Abnahme Bei API-Fehlern bleibt der Wizard steuerbar und zeigt mögliche nächste
Aktion.

Vorher: 068–071 • Aufwand: M • Status: TODO

☐ 073 Responsivität, Tastaturbedienung und Kontraste prüfen
Umsetzung Admin vor allem Desktop, aber bedienbar auf Tablet; korrekte Labels, Fokusführung, Tabs, Kontrast und
Modalverhalten testen.
Ergebnis docs/quality/ui-review.md | Abnahme Hauptfunktionen sind ohne Maus erreichbar und weisen keine unlesbaren
Controls auf.

Vorher: 065–072 • Aufwand: M • Status: TODO

☐ 074 UI-Integration mit Demo-Projekt abnehmen
Umsetzung Gespeichertes Testprojekt durch Dashboard, Wizard-Rahmen, Renderansicht und öffentliche Freigabe
führen; Fehlzugriffsprüfung wiederholen.
Ergebnis docs/quality/ui-gate.md | Abnahme Alle sichtbaren Kernansichten reagieren zuverlässig; Veröffentlichungsstatus
bleibt korrekt.

Vorher: 064–073 • Aufwand: M • Status: TODO
MEILENSTEIN M06 · 10 AUFGABEN




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 13
<PARSED TEXT FOR PAGE: 14 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1




M06 News Sources – dauerhaft gepflegtes
Quellenregister
Ziel Wissenschaftlich vertrauenswürdige RSS-/API-Quellen einmalig einrichten und kontrolliert abfragen.

ABNAHMETOR Mindestens vier freigegebene, aktivierbare Quellen liefern regelmäßig normalisierte
Nachrichten mit Abrufprotokoll.



☐ 075 Quellenmodell entwerfen
Umsetzung Source mit Name, Typ RSS/API, Basis-URL, API-Key-Referenz, aktiv/inaktiv, Abrufintervall,
Nutzungsauflagen und letztem Erfolgszeitpunkt anlegen.
Ergebnis Source-Datenmodell | Abnahme Schlüssel stehen niemals als Klartext in der Quellenliste.

Vorher: 023, 030 • Aufwand: M • Status: TODO

☐ 076 Quellen-Verwaltungsoberfläche bauen
Umsetzung Karten mit Quelle, Typ, Status, letztem Abruf, Testknopf, Aktivierung, Bearbeiten und Hinzufügen;
Warnungen verständlich darstellen.
Ergebnis Wizard Schritt 2 | Abnahme Quelle lässt sich anlegen, deaktivieren und bearbeiten, ohne erneut pro Video
konfiguriert zu werden.

Vorher: 069, 075 • Aufwand: M • Status: TODO

☐ 077 RSS-Adapter und Parser implementieren
Umsetzung Gültige RSS-/Atom-Formate, Zeichensätze, Redirects, Datum/Timezone, Canonical-URL,
ETag/Last-Modified und Fehlerfälle verarbeiten.
Ergebnis packages/providers/rss | Abnahme Testfeeds liefern normalisierte Einträge, Mehrfachabruf legt keine Dubletten
an.

Vorher: 075–076 • Aufwand: L • Status: TODO

☐ 078 NASA Earth Observatory als Pilotquelle anbinden
Umsetzung Offiziellen Feed testen und Feldzuordnung definieren; URL und Änderungen dokumentieren; nur benötigte
Metadaten/Nutzungen übernehmen.
Ergebnis NASA-Source-Adapter | Abnahme Aktuelle Feed-Einträge erscheinen einschließlich Originallink und
Publikationsdatum.

Vorher: 015, 077 • Aufwand: M • Status: TODO

☐ 079 NOAA-Feed(s) hinzufügen
Umsetzung Aus NOAA-Angeboten passende Klima-/Ozean-/Wetterfeeds auswählen; Testfälle für mehrere
Teilbereiche und Quellen-IDs anlegen.
Ergebnis NOAA-Source-Adapter | Abnahme Einträge sind nach Themenbereich filterbar und nicht mit anderen
NOAA-Feeds vermischt.

Vorher: 015, 077 • Aufwand: M • Status: TODO

☐ 080 USGS-/ESA-/Copernicus-Adapter prüfen und ergänzen
Umsetzung Erlaubte offizielle API-/Feed-Zugänge pro Organisation untersuchen; zunächst 1–2 priorisierte
Schnittstellen implementieren.
Ergebnis Weitere Source-Adapter | Abnahme Jede aktivierte Quelle hat funktionierenden Abruf und dokumentierte
Nutzungsbedingungen.

Vorher: 015, 077 • Aufwand: L • Status: TODO




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 14
<PARSED TEXT FOR PAGE: 15 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1



☐ 081 Benutzerdefinierte RSS-Quellen sicher hinzufügen
Umsetzung URL-Validierung, Schutz gegen SSRF/interne IPs, Redirect-Prüfung, Antwortgrößen-/Timeout-Limits und
Feed-Test einbauen.
Ergebnis Add Source Dialog | Abnahme Private Netzwerkziele und ungeeignete Inhalte werden abgewiesen.

Vorher: 076–077 • Aufwand: L • Status: TODO

☐ 082 API-Key-Speicherung und Provider-Test schaffen
Umsetzung API-Schlüssel nur serverseitig hinterlegen und testen; Erfolgs-/Fehlerstatus sowie Quoten/Abrufzeit
anzeigen, nie den Secret-Wert zurückgeben.
Ergebnis Credential-Service | Abnahme Ein ungültiger Key wird erkannt; gültiger Key erscheint nie im Frontend-JSON.

Vorher: 030, 075–076 • Aufwand: M • Status: TODO

☐ 083 Scheduler, Quoten und Retry-Strategie implementieren
Umsetzung Aktive Quellen nach Intervall abrufen, 429/5xx schonend behandeln, Polling begrenzen, Duplikatsperre
und Lastlimits definieren.
Ergebnis News-Ingestion-Jobs | Abnahme Zwei parallele Worker erzeugen keine doppelten Importe.

Vorher: 027, 077–082 • Aufwand: L • Status: TODO

☐ 084 Quellen-Monitoring und Änderungsprotokoll ergänzen
Umsetzung Letzter Erfolg, Dauer, Fehlercode, nächste Prüfung und Feedformatänderungen speichern;
fehlgeschlagene Quellen sichtbar alarmieren.
Ergebnis /admin/sources Health | Abnahme Nicht funktionierende Quellen beeinflussen das restliche System nicht
stillschweigend.

Vorher: 075–083 • Aufwand: M • Status: TODO
MEILENSTEIN M07 · 12 AUFGABEN



M07 Discover Topics – Recherche und Faktenbasis
Ziel Rohmeldungen zu Ereignissen verbinden, echte Bestätigungen erkennen und für Skripte überprüfbare
Research-Briefs liefern.

ABNAHMETOR Ein gewähltes Topic besitzt belegte Kernaussagen, unabhängige Quellenbewertung und eine
nachvollziehbare Eignungsentscheidung.



☐ 085 Normalisiertes Nachrichtenmodell ergänzen
Umsetzung NewsItem mit Quell-ID, Original-URL, Datum, Sprache, Titel, Zusammenfassung, Autor und abrufbarem
Inhalt/Metadaten speichern; Abrufrecht beachten.
Ergebnis NewsItem + Ingestion-Log | Abnahme Jede Meldung ist auf die ursprüngliche Veröffentlichung zurückführbar.

Vorher: 077–084 • Aufwand: M • Status: TODO

☐ 086 Meldungen nach Ereignis zusammenführen
Umsetzung Zeitfenster, Ort, Naturereignis, Institution, Schlüsselbegriffe und semantische Ähnlichkeit kombinieren;
Topic-Cluster mit Begründungen speichern.
Ergebnis Topic-Clustering-Service | Abnahme Zwei Artikel über dasselbe Ereignis werden gruppiert, aber unterschiedliche
Ereignisse nicht verschmolzen.

Vorher: 085 • Aufwand: L • Status: TODO

☐ 087 Übernommene Pressemitteilungen als gemeinsame Ursprünge erkennen
Umsetzung Originator, Zitierketten, ähnliche Textfragmente und Kanonische Quelle untersuchen; Weiterverbreitung
nicht als unabhängige Bestätigung zählen.
Ergebnis Source-Independence-Report | Abnahme Zwei Reposts einer einzigen NASA-Mitteilung erhöhen die
Bestätigungszahl nicht künstlich.

Vorher: 086 • Aufwand: L • Status: TODO



                                      blueDotAtlas • Arbeits- und Abnahmeplan • 15
<PARSED TEXT FOR PAGE: 16 / 28>
                                                                             blueDotAtlas / MASTER ROADMAP / V0.1



☐ 088 Topic-Kategorien und Ortsbezug normalisieren
Umsetzung Klimawandel, Extremwetter, Ozeane, Satelliten, Naturkatastrophen, Ökosysteme, Geologie; Region,
Koordinaten und Zeitpunkt erfassen.
Ergebnis Topic-Taxonomy | Abnahme Topics lassen sich korrekt filtern und Kartenbezüge später verwenden.

Vorher: 085–086 • Aufwand: M • Status: TODO

☐ 089 Eignung für 8–10 Minuten bewerten
Umsetzung Neuigkeit, wissenschaftlicher Erklärwert, verfügbare Daten, Visualisierbarkeit, Quellenlage und ethische
Sensibilität gewichten; Score nicht als Wahrheit darstellen.
Ergebnis Topic-Scorecard | Abnahme Jede Empfehlung enthält nachvollziehbare Teilwerte und Warnungen.

Vorher: 086–088 • Aufwand: M • Status: TODO

☐ 090 Claim-/Evidence-Datenmodell schaffen
Umsetzung Jede konkrete Aussage als Claim mit Quelle, genauer Fundstelle, Datum, Prüfstatus, Konfidenz und
eventuellen Widersprüchen speichern.
Ergebnis Claim + Evidence | Abnahme Wichtige Messwerte besitzen mindestens einen Primärbeleg oder sichtbare
Unsicherheitsmarkierung.

Vorher: 085 • Aufwand: L • Status: TODO

☐ 091 Primärdaten und Veröffentlichungsdaten auseinanderhalten
Umsetzung Messzeitraum, Publikationsdatum und Aktualisierungsdatum explizit erfassen; Datenstand für späteren
Abspann und Skript markieren.
Ergebnis Research-Datumsregeln | Abnahme Das System verwechselt ältere Messreihen nicht mit brandneuen
Beobachtungen.

Vorher: 089–090 • Aufwand: M • Status: TODO

☐ 092 Widersprüche und wissenschaftliche Unsicherheit kennzeichnen
Umsetzung Bei abweichenden Zahlen oder Studienlage Unterschiede darstellen; Behauptungen als bestätigt,
eingeschränkt, unklar oder blockiert kennzeichnen.
Ergebnis Research-Review-Service | Abnahme Eine unbelegte spektakuläre Aussage wird nicht automatisch als gesichert
übernommen.

Vorher: 087, 090 • Aufwand: L • Status: TODO

☐ 093 Recherchebericht pro Topic generieren
Umsetzung Kurze Lage, Chronologie, 5–10 wichtigste Fakten, Quellen, Unklarheiten, Visual-Ideen und mögliche
Dramaturgie aus geprüften Claims zusammensetzen.
Ergebnis research-brief.v1.json + Ansicht | Abnahme Research-Brief ist für Menschen lesbar und maschinell für Script
Studio verwendbar.

Vorher: 088–092 • Aufwand: L • Status: TODO

☐ 094 Discover-Topics-Oberfläche bauen
Umsetzung Topic-Karten mit Titel, Summary, Kategorien, Quellfamilien, Eignung, Ampel und „Select Topic“; Filter und
Detailansicht ergänzen.
Ergebnis Wizard Schritt 3 | Abnahme Ein Topic kann geöffnet, verglichen und verbindlich dem Projekt zugewiesen werden.

Vorher: 069, 086–093 • Aufwand: M • Status: TODO

☐ 095 Topic-Auswahl und Quellen-Snapshot einfrieren
Umsetzung Beim Auswählen Brief/Claims/Quellenstand versionieren; spätere Nachrichtenupdates als Änderungen
kennzeichnen, nicht still überschreiben.
Ergebnis TopicSnapshot pro Projekt | Abnahme Ein bestehendes Skript bleibt reproduzierbar, auch wenn sich der Feed
aktualisiert.

Vorher: 093–094 • Aufwand: M • Status: TODO




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 16
<PARSED TEXT FOR PAGE: 17 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1



☐ 096 Research-Validierung mit Testfällen absichern
Umsetzung Repost, Korrekturmeldung, Event mit mehreren Orten, falsche Zahl, alte Meldung und fehlende Quelle als
Fixture prüfen.
Ergebnis tests/research/* | Abnahme Testfälle führen zu erwarteten Clustern und Warnungen.

Vorher: 085–095 • Aufwand: L • Status: TODO
MEILENSTEIN M08 · 14 AUFGABEN



M08 Media Library – Suche, Auswahl und Rechtekette
Ziel Ein echtes visuelles Materialarchiv erstellen, das Bilder und Videoclips sichtet, rechtlich absichert und
wiederverwendet.

ABNAHMETOR Mediengalerie mit Upload, Providern, Checkbox-Auswahl, Vorschau und harten
Lizenzsperren funktioniert; Szene-spezifische Nachsuche ist möglich.



☐ 097 Asset-Datenmodell mit Rechtefeldern schaffen
Umsetzung Provider, Origin-URL, Urheber, Nutzungsrecht, Lizenztext/-version, Prüfdatum, Dateihash, Typ, Länge,
Auflösung und Einsatzkontext erfassen.
Ergebnis MediaAsset + AssetLicense | Abnahme Assets ohne dokumentierten Rechte-Status werden automatisch
gesperrt.

Vorher: 023, 014 • Aufwand: L • Status: TODO

☐ 098 Gemeinsame Provider-Schnittstelle für Medien definieren
Umsetzung Search, Details, Download, LicenseInfo, Preview und Quota als austauschbare Adapter vereinheitlichen;
Fehlermeldungen typisieren.
Ergebnis packages/providers/media | Abnahme Ein Provider kann deaktiviert werden, ohne Galerie oder Renderer
anzupassen.

Vorher: 097 • Aufwand: M • Status: TODO

☐ 099 NASA Image/Video Library anbinden
Umsetzung Offizielle Suchschnittstelle integrieren, Metadaten und verfügbare Auflösungen übernehmen;
Drittmaterial-/Nutzungs-Hinweise gesondert prüfen.
Ergebnis NASA-Media-Adapter | Abnahme Vorschau und Originalherkunft sind sichtbar; ungeklärtes Drittmaterial bleibt
nicht freigegeben.

Vorher: 015, 098 • Aufwand: L • Status: TODO

☐ 100 Pixabay-Fotos und Videos anbinden
Umsetzung Aktuelle API-Bedingungen und Materiallizenz prüfen; Videoformate und Thumbnail-Felder normalisieren;
Quoten/Caching nutzen.
Ergebnis Pixabay-Media-Adapter | Abnahme Bild- und Videoresultate sind korrekt klassifiziert, abrufbar und dokumentiert.

Vorher: 015, 098 • Aufwand: L • Status: TODO

☐ 101 Wikimedia Commons als geprüfte Ergänzung anbinden
Umsetzung Dateiseiten, Urheber, Lizenzversion und notwendige Credits abfragen; NC/ND/SA-Sonderfälle nach
Regelwerk sperren oder manuell prüfen.
Ergebnis Commons-Media-Adapter | Abnahme CC-BY-Assets erzeugen korrekte Credit-Angaben; unklare Lizenzen
blockieren Verwendung.

Vorher: 014, 098 • Aufwand: L • Status: TODO




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 17
<PARSED TEXT FOR PAGE: 18 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1



☐ 102 Pexels nur als optionalen Provider vorsehen
Umsetzung Aktuellen Status der API-Schlüssel prüfen; vorhandenen zulässigen Zugang unterstützen, aber keine
Kernfunktion davon abhängig machen.
Ergebnis Optionaler Pexels-Adapter | Abnahme Mediensuche läuft auch vollständig ohne Pexels-API.

Vorher: 015, 098 • Aufwand: S • Status: TODO

☐ 103 Eigenen Medien-Upload sicher implementieren
Umsetzung Erlaubte Formate und Größen, MIME-/Magic-Byte-Prüfung, ffprobe-Basischeck, sichere Dateinamen,
Quarantäne und Speicherkontingent einführen.
Ergebnis /admin/media/upload | Abnahme Manipulierte oder beschädigte Dateien werden nicht in Renderer-Pfade
aufgenommen.

Vorher: 028, 097 • Aufwand: L • Status: TODO

☐ 104 Große Galerie mit Filtern und Preview bauen
Umsetzung Kachelraster, Videovorschau, Detailpanel, Checkboxen, Suche, Anbieter/Typ/Auflösung/Lizenzfilter,
Auswahlzähler und Remove-Aktion realisieren.
Ergebnis Wizard Schritt 4 | Abnahme Mehrere Clips lassen sich ansehen und für ein Projekt freigeben oder ablehnen.

Vorher: 069, 097–103 • Aufwand: L • Status: TODO

☐ 105 Medien-Download und lokalen Cache verwalten
Umsetzung Ausgewählte Dateien mit Hash-/Längenprüfung laden; doppelte Downloads vermeiden, Ablauf für
temporäre und referenzierte Medien unterscheiden.
Ergebnis Media-Cache-Service | Abnahme Bereits geladene Assets werden wiederverwendet; fehlende Datei löst
kontrolliertes Re-Fetch aus.

Vorher: 028, 104 • Aufwand: M • Status: TODO

☐ 106 Rechte-Workflow und Blockierregeln implementieren
Umsetzung Status pending/approved/blocked mit Begründung, Creditbedarf und Datum; Lizenznachweis-Snapshot
und AuditTrail je Projekt speichern.
Ergebnis Rights-Approval-Service | Abnahme Kein blocked/pending Asset wird beim produktiven Render unbemerkt
verwendet.

Vorher: 097, 104–105 • Aufwand: L • Status: TODO

☐ 107 Topic-basierte erste Mediensuche einbauen
Umsetzung Aus Topic-Keywords, Ort, Zeitfenster und visuellem Bedarf passende Aufnahmen suchen; Suchbegriffe
und Ergebnisse versionieren.
Ergebnis InitialSearchJob | Abnahme Nach Topic-Auswahl erscheinen sinnvolle Vorschläge ohne vorherige Skriptszenen.

Vorher: 093, 098, 104 • Aufwand: M • Status: TODO

☐ 108 Szenenspezifische zweite Suche implementieren
Umsetzung Nach Freigabe des Skripts visuelle Anforderungen pro Szene auswerten; passende alternative Clips
suchen und dem Scene Director zur Bewertung geben.
Ergebnis SceneMediaSearchJob | Abnahme Für Szenen mit Abdeckungslücken gibt es konkrete nachgereichte
Vorschläge.

Vorher: 053, 106 • Aufwand: L • Status: TODO

☐ 109 Medienabdeckung und Wiederholungen sichtbar machen
Umsetzung Pro Szene benötigte Shot-Anzahl, vorhandene Clips, Dauer, Qualitätsprobleme und doppelte Assets
berechnen; Warnungen für Lücken anzeigen.
Ergebnis MediaCoverage-Report | Abnahme Unzureichendes Footage wird vor Rendering angezeigt; bewusste Fallbacks
sind dokumentiert.

Vorher: 106–108 • Aufwand: M • Status: TODO




                                     blueDotAtlas • Arbeits- und Abnahmeplan • 18
<PARSED TEXT FOR PAGE: 19 / 28>
                                                                              blueDotAtlas / MASTER ROADMAP / V0.1



☐ 110 Automatische Vorauswahl und manuelle Überschreibungen absichern
Umsetzung Vorschläge nach Motiv-Passung, technischer Qualität und Rechtestatus sortieren; manuelle Zuordnung,
Ablehnung und Favoriten pro Szene versioniert speichern.
Ergebnis MediaSelectionVersion | Abnahme Automatische Vorschläge überschreiben niemals eine bewusst bestätigte
Medienauswahl.

Vorher: 104–109 • Aufwand: M • Status: TODO
MEILENSTEIN M09 · 11 AUFGABEN



M09 Script Studio – belegtes Drehbuch mit Szenen
Ziel Aus einem Research-Brief ein redaktionell prüfbares 8–10-Minuten-Dokumentarfilmskript und präzise
Szenenbeschreibung erzeugen.

ABNAHMETOR Skript lässt sich abschnittsweise generieren, editieren und freigeben; jede wichtige Aussage
ist zu ihrem Beleg rückverfolgbar.



☐ 111 Dokumentarische Dramaturgie als Template definieren
Umsetzung Hook, Kontext, Ereignis, wissenschaftlicher Hintergrund, Folgen und Fazit mit variablen Zeitbudgets und
erlaubten Ausnahmen modellieren.
Ergebnis docs/editorial/script-structure.md | Abnahme Vorlage unterstützt unterschiedliche Themen, ohne 8–10 Minuten
künstlich zu füllen.

Vorher: 093, 011 • Aufwand: M • Status: TODO

☐ 112 Skript- und Szenenmodell implementieren
Umsetzung ScriptVersion, Section, NarrationSegment, VisualIntent, AnimationIntent, SourceRefs und
expectedDuration verknüpfen; strikte Trennung von Text und Regie.
Ergebnis script.v1.json | Abnahme Text kann bearbeitet werden, ohne den Rendercode zu ändern.

Vorher: 049, 090, 110 • Aufwand: L • Status: TODO

☐ 113 LLM-Adapter mit Promptversionierung entwickeln
Umsetzung API-Modell austauschbar halten; Prompt, Modellversion, Eingabedaten, Kosten und erzeugte Fassung
speichern; Timeouts und Ausfälle behandeln.
Ergebnis packages/providers/llm | Abnahme Jede Generierung ist einer Prompt-/Datenversion zuordenbar.

Vorher: 016, 112 • Aufwand: M • Status: TODO

☐ 114 Recherche-Brief zu Gliederung erzeugen
Umsetzung Vor dem eigentlichen Skript eine Story-Outline mit Kapitelthese, Kernaussagen und Visual-Möglichkeiten
generieren; manuelle Bearbeitung ermöglichen.
Ergebnis outline.v1.json | Abnahme Alle Kapitel besitzen einen Zweck und verknüpfen sich mit vorhandenen Claims.

Vorher: 093, 111–113 • Aufwand: M • Status: TODO

☐ 115 Beleggebundene Sprechertexte generieren
Umsetzung Nur aus verifizierten oder kenntlich unsicheren Claims formulieren; Zahlen/Datumsangaben nicht
ergänzen; emotionalen Hook ohne Übertreibung erzeugen.
Ergebnis script-draft.v1.json | Abnahme Falsche oder im Brief nicht vorhandene Fakten führen zu einer Warnung/Revision.

Vorher: 090–092, 114 • Aufwand: L • Status: TODO

☐ 116 Szenenweise Visual- und Animation-Intents ableiten
Umsetzung Für jedes Narrationssegment Bildtyp, Motiv, Karte/Datengrafik, Quellen-/Datenbedarf, Visual-Tempo und
Varianten bestimmen.
Ergebnis visual-intents.v1.json | Abnahme Jede Szene hat eine visuelle Aufgabe; reine dekorative Texttafeln sind kein
Standard.

Vorher: 051, 115 • Aufwand: L • Status: TODO



                                      blueDotAtlas • Arbeits- und Abnahmeplan • 19
<PARSED TEXT FOR PAGE: 20 / 28>
                                                                             blueDotAtlas / MASTER ROADMAP / V0.1



☐ 117 Laufzeit anhand Sprechtext realistisch schätzen
Umsetzung Wortzahl, Stimmtempo und Pausen zu Zeitbudget zusammenführen; Warnung statt automatischem
Aufblähen, wenn Thema zu dünn ist.
Ergebnis ScriptDuration-Estimator | Abnahme Das System schlägt bei zu kurzer Stofflage keine erfundenen Füllfakten vor.

Vorher: 111–116 • Aufwand: M • Status: TODO

☐ 118 Quellen- und Konsistenzprüfung implementieren
Umsetzung Claims gegen Skript vergleichen, Zahlen/Einheiten referenzieren, doppelte Aussagen, Widersprüche und
Quellenmängel markieren; Review-Entscheidungen speichern.
Ergebnis ScriptFactCheck-Report | Abnahme Eine gezielt falsche Zahl und ein unbelegter Satz werden erkannt und
markiert.

Vorher: 090, 115 • Aufwand: L • Status: TODO

☐ 119 Skripteditor mit Abschnittsregeneration bauen
Umsetzung Szenenliste, Narration, Visualhinweis, Timing, Belege und Editierfelder; einzelne Abschnitte neu
generieren, manuell freigeben und frühere Version ansehen.
Ergebnis Wizard Schritt 5 | Abnahme Änderung an Szene 4 löscht nicht versehentlich andere genehmigte Szenen.

Vorher: 069, 112–118 • Aufwand: L • Status: TODO

☐ 120 Skriptfreigabe und Änderungsfolgen festlegen
Umsetzung Editorial Approval an versionierten Skriptstand binden; spätere Änderungen können Voice, Media und
Render als „neu prüfen“ markieren.
Ergebnis ScriptApproval + Dependency-Invalidation | Abnahme Es wird nie automatisch ein altes Voice-Audio zu neuer
Textfassung freigegeben.

Vorher: 119 • Aufwand: M • Status: TODO

☐ 121 Langform-Tests mit drei Themen durchführen
Umsetzung Drei sehr verschiedene Earth-Themen mit Datenlage, komplexer Aussage und Medienengpass testen;
Erzählfluss und echte 8–10-Minuten-Eignung bewerten.
Ergebnis docs/quality/script-pilot.md | Abnahme Drei Skripte sind quellentreu, abwechslungsreich und sinnvoll lang oder
werden begründet abgelehnt.

Vorher: 111–120 • Aufwand: L • Status: TODO
MEILENSTEIN M10 · 8 AUFGABEN



M10 Voice Studio – Stimme, Timing und Audioqualität
Ziel Aus freigegebenem Text natürlich klingende, gut kontrollierbare Narration erzeugen und die tatsächlichen
Timings für den Film nutzen.

ABNAHMETOR Mindestens zwei zulässig verwendbare Stimmen mit hörbarer Vorschau; vollständiges Audio
ist zeitlich dem Szenenplan zugeordnet.



☐ 122 TTS-Provider und Stimmrechtsregeln definieren
Umsetzung Vergleich von natürlicher Sprache, Sprachen, Kosten, Latenz, Streaming/Dateiausgabe und kommerzieller
Nutzung; austauschbare Schnittstelle festlegen.
Ergebnis docs/providers/tts-evaluation.md | Abnahme Mindestens ein nutzbarer Provider mit dokumentierten
Sprach-/Lizenzbedingungen ausgewählt.

Vorher: 015–016, 042 • Aufwand: M • Status: TODO




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 20
<PARSED TEXT FOR PAGE: 21 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1



☐ 123 Stimmenkatalog und Presets erstellen
Umsetzung Documentary Male/Female, Calm Narrator und Science Presenter als UI-Presets zu echten
Provider-Stimmen zuordnen; nicht vorhandene Stile ausblenden.
Ergebnis VoicePreset-Modell | Abnahme Voice-Presets verweisen auf verfügbare, eindeutig lizenzierte Stimmen.

Vorher: 122 • Aufwand: M • Status: TODO

☐ 124 Voice-Preview mit eigenem Skript bauen
Umsetzung Kurzen Abschnitt eines genehmigten Skripts abspielen, Sprache, Sprechtempo und Stil wechseln und
Probe zwischenspeichern.
Ergebnis Wizard Schritt 6 | Abnahme Alle wählbaren Stimmen lassen sich vor Auswahl anhören.

Vorher: 069, 119, 123 • Aufwand: L • Status: TODO

☐ 125 Ausspracheglossar für Wissenschaftsbegriffe anlegen
Umsetzung NASA/NOAA, Ozeannamen, Koordinaten, wissenschaftliche Namen, Zahlen und Einheiten über
Provider-spezifische Aussprachehilfen behandeln.
Ergebnis pronunciation-dictionary | Abnahme Testwörter lassen sich hörbar korrekt aussprechen und pro Video
überschreiben.

Vorher: 122–124 • Aufwand: M • Status: TODO

☐ 126 Abschnittsweise Audiogenerierung implementieren
Umsetzung Nur geänderte Textsegmente neu erzeugen; Audiosegment zu ScriptVersion/VoicePreset/Settings
versionieren; API-Kosten erfassen.
Ergebnis NarrationAudio + AudioJobs | Abnahme Skriptänderung an einem Abschnitt erzwingt nicht die Generierung aller
anderen Abschnitte.

Vorher: 120, 122–125 • Aufwand: L • Status: TODO

☐ 127 Lautheit, Stille und Audiotechnik prüfen
Umsetzung Lautheit normalisieren, Störgeräusche/Klicks, Clipping, lange Leerlaufpausen und unterschiedliche
Sample-Rates kontrollieren.
Ergebnis Audio-QA-Report | Abnahme Ein fehlerhaftes Segment wird vor dem Render als Problem markiert.

Vorher: 126 • Aufwand: M • Status: TODO

☐ 128 Wort-/Segment-Zeitmarken und Untertitel erstellen
Umsetzung Falls TTS keine Word-Timestamps liefert, Alignment separat bestimmen; WebVTT/SRT erzeugen und auf
Verständlichkeit prüfen.
Ergebnis timestamps.json + subtitles.vtt | Abnahme Szenen-Timeline und Untertitel folgen hörbar dem Sprechertext.

Vorher: 053, 126–127 • Aufwand: L • Status: TODO

☐ 129 Voice-Freigabe und Timing-Update ins Projekt integrieren
Umsetzung Auswahl und Änderungen versionieren; bei neuer Stimme Timecodes aktualisieren und abhängige
Szenendauern zur Nachprüfung markieren.
Ergebnis VoiceApproval + TimelineUpdate | Abnahme Der Renderer verwendet nur die aktuell freigegebene Narration.

Vorher: 124–128 • Aufwand: M • Status: TODO
MEILENSTEIN M11 · 10 AUFGABEN



M11 Vollständigen Produktions-Wizard verbinden
Ziel Recherche, Medien, Skript, Stimme, Scene Director und Rendering als kontrollierten, halbautomatischen
Ablauf verknüpfen.

ABNAHMETOR Ein Projekt durchläuft alle sieben Schritte ohne manuelle Datei- oder Codebearbeitung; das
fertige MP4 ist im Admin abrufbar.




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 21
<PARSED TEXT FOR PAGE: 22 / 28>
                                                                              blueDotAtlas / MASTER ROADMAP / V0.1



☐ 130 Projekt-Zustandsautomat verbindlich machen
Umsetzung Statusentwurf von created bis published mit Review-Schritten und erlaubten Übergängen implementieren;
Fehler und Rücksprünge abbilden.
Ergebnis project-state-machine | Abnahme Unzulässiger Sprung von „Topic gewählt“ zu „Publish“ wird serverseitig
blockiert.

Vorher: 024, 120, 129 • Aufwand: L • Status: TODO

☐ 131 Wizard Schritt 1 mit echtem Projektlebenszyklus verbinden
Umsetzung Projektname, gewünschte Sprache, optionale Ziellänge und Notiz erfassen; Anfangszustand ohne teure
Hintergrundjobs erzeugen.
Ergebnis New Video Step | Abnahme Projektanlage ist sofort sichtbar und bei Reload vorhanden.

Vorher: 031, 069, 130 • Aufwand: M • Status: TODO

☐ 132 News Sources als globale Einstellungen einbinden
Umsetzung Schritt 2 öffnet gespeichertes Quellenregister; nur bewusste Konfigurationsänderungen gelten global;
Quellenstand wird beim Topic-Snapshot fixiert.
Ergebnis Sources Step Integration | Abnahme Wiederholte Produktionen benötigen keine Neueinrichtung der Quellen.

Vorher: 076, 130 • Aufwand: M • Status: TODO

☐ 133 Topic-Auswahl an Research-Snapshot binden
Umsetzung Schritt 3 kann recherchierte Topics vergleichen; Auswahl schreibt Brief, Claim-Liste und Quellstand in das
Videoprojekt.
Ergebnis Topic Step Integration | Abnahme Skript erhält genau die ausgewählten und überprüften Research-Daten.

Vorher: 094–095, 131 • Aufwand: M • Status: TODO

☐ 134 Media- und Skript-Reihenfolge sauber koordinieren
Umsetzung Erste Mediensuche nach Topic, initiale Auswahl, dann Skript und zweite Suche je Szene; Änderungen
triggern nur betroffene Teiljobs.
Ergebnis MediaWorkflow-Orchestrierung | Abnahme Keine Endlosschleifen aus Mediensuche ↔ Skript-Neugenerierung.

Vorher: 106–109, 119, 132 • Aufwand: L • Status: TODO

☐ 135 Scene Director nach Script/Voice ausführen
Umsetzung Aus freigegebenen NarrationSegmenten, Audio-Timestamps und geprüften Assets ein Render-Manifest
erzeugen; Lücken anzeigen statt still zu kaschieren.
Ergebnis SceneDirectorJob | Abnahme Jede final geplante Szene besitzt Zeit, Visual, Beleg und Medium/Animation.

Vorher: 060, 120, 129, 133 • Aufwand: L • Status: TODO

☐ 136 Preflight-Seite vor Video Production aufbauen
Umsetzung Prüfen: Claims, Aktualität, Script Approval, Rechte, Dateiverfügbarkeit, TTS, Bildformat,
Medienabdeckung, Renderbudget.
Ergebnis RenderPreflight + UI | Abnahme Ein rot markierter Pflichtpunkt verhindert „Generate Video“ mit klarer
Begründung.

Vorher: 110, 118, 129, 134 • Aufwand: L • Status: TODO

☐ 137 Rendersteuerung und Fortschritt integrieren
Umsetzung Start, Status, ETA als unverbindliche Schätzung, Protokoll, Cancel und geordnetes Retry über Worker;
nach Abschluss Player/Download anzeigen.
Ergebnis Wizard Schritt 7 | Abnahme Ein gestarteter Renderjob läuft unabhängig von Browser-Sessions durch.

Vorher: 046–047, 135 • Aufwand: M • Status: TODO




                                       blueDotAtlas • Arbeits- und Abnahmeplan • 22
<PARSED TEXT FOR PAGE: 23 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1



☐ 138 Freigabe- und Rücksprunglogik testen
Umsetzung Beim Ändern von Topic, Script, Voice oder Assets nur abhängige Artefakte invalidieren; den Benutzer vor
kostenpflichtiger Regenerierung warnen.
Ergebnis Dependency-Graph + Tests | Abnahme Keine veraltete Fassung wird versehentlich als final angezeigt.

Vorher: 130–136 • Aufwand: L • Status: TODO

☐ 139 End-to-End-Pfad mit einem echten Thema testen
Umsetzung Create → Sources → Topic → Media → Script → Voice → Render → MP4 ohne Codeeingriff durchlaufen;
Fehler und Zeitbedarf messen.
Ergebnis docs/quality/full-wizard-gate.md | Abnahme Ein komplett nachvollziehbarer Produktionslauf ist im Admin
dokumentiert.

Vorher: 130–137 • Aufwand: L • Status: TODO
MEILENSTEIN M12 · 11 AUFGABEN



M12 Qualitätssicherung, Sicherheit und Veröffentlichung
Ziel Vor der öffentlichen Nutzung fachliche, visuelle, technische und rechtliche Sperren testen sowie einen
wartbaren Betrieb sicherstellen.

ABNAHMETOR Drei vollständige Testproduktionen sind geprüft; Veröffentlichung ist ausschließlich nach
manueller Freigabe möglich.



☐ 140 Publikationsstatus und manuellen Freigabeknopf umsetzen
Umsetzung Ready for Review, Approved, Published, Unpublished modellieren; Publish nur für gültiges, bestandenes
MP4 + geprüfte Inhalte erlauben.
Ergebnis Publish-Workflow | Abnahme Kein Renderjob führt von sich aus zu einer Veröffentlichung.

Vorher: 067, 138 • Aufwand: M • Status: TODO

☐ 141 Titel, Thumbnail und Beschreibung vorbereiten
Umsetzung Redaktionell editierbare Metadaten, Datum, ggf. Hinweise zur Datenaktualität, Credits und Quelle im Admin
darstellen; Thumbnail hochladen/zuweisen.
Ergebnis Publish-Metadatenansicht | Abnahme Öffentliche Detailseite zeigt nur bestätigte Metadaten.

Vorher: 066–067, 139 • Aufwand: M • Status: TODO

☐ 142 Quellen-/Lizenzexport pro Film erstellen
Umsetzung Alle verwendeten Claims, Daten, Bild-/Video-/Musikassets und Credits aus Manifest und Projektjournal in
nachvollziehbaren Export bringen.
Ergebnis reports/video-provenance.json + Credits | Abnahme Jeder Shot ist auf seine Ursprungsquelle und
Nutzungsprüfung zurückführbar.

Vorher: 060, 105, 135 • Aufwand: L • Status: TODO

☐ 143 Aktualitätsprüfung direkt vor Publikation einbauen
Umsetzung Änderung oder Widerruf kritischer Quellen erkennen; konservative Prüf-Frist vor Freigabe anwenden; bei
Red Flags manuelle Neubewertung erzwingen.
Ergebnis PublicationFreshnessCheck | Abnahme Korrigierte oder überholte Kernaussagen blockieren die Veröffentlichung.

Vorher: 090–095, 141 • Aufwand: M • Status: TODO

☐ 144 Videoqualitäts-Scorecard und Review-Workflow bauen
Umsetzung Kriterien für Quellen, Dramaturgie, echten Footage-Anteil, Bewegung, Tempo, Diagrammkorrektheit, Ton
und technische Integrität bewerten.
Ergebnis VideoReview + Reviewer-Notizen | Abnahme Nicht bestandene Punkte lassen sich einem konkreten
Scene-/Task-Issue zuordnen.

Vorher: 011, 062, 138 • Aufwand: M • Status: TODO



                                     blueDotAtlas • Arbeits- und Abnahmeplan • 23
<PARSED TEXT FOR PAGE: 24 / 28>
                                                                            blueDotAtlas / MASTER ROADMAP / V0.1



☐ 145 Sicherheits-Härtung durchführen
Umsetzung Login-Ratenbegrenzung, CSRF, Session-Konfiguration, SSRF-Tests für URLs, Upload-Validierung,
Berechtigungsprüfung und Secret-Redaction testen.
Ergebnis Security-Testprotokoll | Abnahme Gängige Angriffswege bleiben ohne Daten-/Secret-Leak; Admin-Zugriff ist
serverseitig geprüft.

Vorher: 025, 030, 081, 103 • Aufwand: L • Status: TODO

☐ 146 Lade-, Speicher- und Render-Stresstests ausführen
Umsetzung Mehrfachstart, Queue-Verstopfung, große Dateien, Disk-Full, langsamer Provider und VPS-Neustart
simulieren; Worker-Konkurrrenz begrenzen.
Ergebnis docs/quality/load-render-tests.md | Abnahme Webapp bleibt erreichbar und meldet Renderfehler korrekt.

Vorher: 061–062, 138 • Aufwand: L • Status: TODO

☐ 147 Automatisierte Unit-/Integration-/E2E-Tests abrunden
Umsetzung Fehlerfälle für Quellen, Topic-Reposts, Claim-Prüfung, Rechteblocker, Wizard-Status, Export und
Veröffentlichung in CI abdecken.
Ergebnis tests/e2e + CI-Reports | Abnahme Kritische Pfade sind reproduzierbar grün; negative Testfälle verhindern
Release.

Vorher: 096, 109, 138–145 • Aufwand: L • Status: TODO

☐ 148 Backup-Restore und Wiederanlauf wiederholen
Umsetzung Datenbank, Manifest, freigegebene Medien und Videos aus Backup in Testumgebung zurückspielen;
festhalten, was nicht rekonstruierbar ist.
Ergebnis Restore-Drill-Report | Abnahme Nach Restore existieren Projekte und referenzierte MP4 mit korrektem Status.

Vorher: 034, 146 • Aufwand: M • Status: TODO

☐ 149 Betriebsmonitoring und Kostenprotokoll erweitern
Umsetzung Workerdauer, Providerfehler, Jobkosten, Disk/RAM, Renderquote und Admin-Warnungen erfassen;
sinnvolle Alarm-Schwellen wählen.
Ergebnis /admin/system oder Ops-Bericht | Abnahme Fehler und Kostenausreißer werden sichtbar, bevor
Produktionsdaten verloren gehen.

Vorher: 027, 142, 147 • Aufwand: M • Status: TODO

☐ 150 Drei echte Langfilm-Testläufe prüfen
Umsetzung Drei unterschiedliche wissenschaftliche Themen in 1080p mit 8–10 Minuten Zielwert produzieren; bei
Stoffmangel kürzere sachliche Länge zulassen.
Ergebnis 3 Review-MP4 + Abnahmeprotokolle | Abnahme Kein Film wird allein durch Füllmaterial auf Länge gestreckt; alle
Pflichtgates bestehen.

Vorher: 138–148 • Aufwand: L • Status: TODO
MEILENSTEIN M13 · 8 AUFGABEN



M13 Pilotbetrieb, Stabilisierung und V0.1-Abschluss
Ziel Den Workflow mit echten Projekten wiederholt betreiben, die schwächsten Stellen beheben und Version 0.1
bewusst einfrieren.

ABNAHMETOR Mindestens fünf vollständige Pilotläufe sind dokumentiert; V0.1 ist verwendbar, überprüfbar
und ohne automatische YouTube-Veröffentlichung.




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 24
<PARSED TEXT FOR PAGE: 25 / 28>
                                                                             blueDotAtlas / MASTER ROADMAP / V0.1



☐ 151 Pilot-Backlog und Testthemen definieren
Umsetzung Mindestens fünf Themen aus unterschiedlichen Kategorien wählen; erwartete Daten-/Videoverfügbarkeit
und besondere Risiken notieren.
Ergebnis docs/pilot/selection.md | Abnahme Testreihe enthält Ozean, Wetter, Satellit und mindestens ein datenschweres
Thema.

Vorher: 149 • Aufwand: S • Status: TODO

☐ 152 Fünf End-to-End-Produktionen durchführen
Umsetzung Jeden Pilotfilm von Discover Topics bis MP4 durchlaufen; Fehler, Handkorrekturen, tatsächliche Kosten
und Renderzeiten protokollieren.
Ergebnis Pilot-Videos + run-log.csv | Abnahme Alle fünf Läufe enden mit gültigem MP4 oder einem sauber
dokumentierten Blocker.

Vorher: 150–151 • Aufwand: L • Status: TODO

☐ 153 Filmische Schwächen nach Priorität beheben
Umsetzung Wiederholtes Footage, stockende Übergänge, schlechte Karten, monotone Stimme und leere Szenen
identifizieren und testbar verbessern.
Ergebnis P0/P1-Fix-Issues | Abnahme Erneut gerenderte Problemstellen erfüllen die zuvor verfehlten Kriterien.

Vorher: 152 • Aufwand: L • Status: TODO

☐ 154 Kostensicherheit und VPS-Leistung neu bewerten
Umsetzung Kosten je erfolgreichem Film, Zeitaufwand und SSD-Verbrauch aus Pilotläufen ermitteln; Quoten, Cache
und Parallelität nach Messdaten einstellen.
Ergebnis docs/ops/pilot-economics.md | Abnahme Zukünftige Produktionskosten/-dauer basieren auf Messung statt
Schätzung.

Vorher: 152–153 • Aufwand: M • Status: TODO

☐ 155 Public Release Flow im Echtbetrieb prüfen
Umsetzung Ein explizit genehmigtes Video als Published setzen, Player/Thumbnail/Datum überprüfen und
Veröffentlichung bei Bedarf rückgängig machen.
Ergebnis Release-Checkliste | Abnahme Veröffentlichung lässt sich gezielt starten und zurücknehmen, ohne Inhalte zu
verlieren.

Vorher: 139–142, 154 • Aufwand: M • Status: TODO

☐ 156 Handbuch für den täglichen Ablauf schreiben
Umsetzung Quellen pflegen, Topic wählen, Medien prüfen, Skript korrigieren, Voice testen, Render starten, Qualität
freigeben, Fehler behandeln.
Ergebnis docs/operations/user-guide.md | Abnahme Ein neuer Bearbeiter könnte einen Film ausschließlich mit dem
Handbuch produzieren.

Vorher: 155 • Aufwand: M • Status: TODO

☐ 157 Bekannte Grenzen und Roadmap V0.2 dokumentieren
Umsetzung Noch offene Animationsarten, Datenanbieter, Youtube-API, Mehrsprachigkeit und Wiederverwendbarkeit
samt Aufwand/Risiko priorisieren.
Ergebnis docs/project/v02-backlog.md | Abnahme V0.1 enthält keine heimlich eingeschobenen Zukunftsfeatures.

Vorher: 152–156 • Aufwand: S • Status: TODO

☐ 158 Version V0.1 taggen und Abschlussgate abnehmen
Umsetzung Git-Tag, Deploy-Notizen, Sicherheits-/Rechte-/Qualitätsbericht, Pilotmetriken und offene Issues
zusammenführen; Go/No-Go schriftlich festhalten.
Ergebnis release/v0.1 + Abschlussprotokoll | Abnahme Anwendung ist installierbar, wiederherstellbar und erzeugt
kontrolliert hochwertige Video-Dateien.

Vorher: 150–157 • Aufwand: M • Status: TODO




                                      blueDotAtlas • Arbeits- und Abnahmeplan • 25
<PARSED TEXT FOR PAGE: 26 / 28>
                                                                                     blueDotAtlas / MASTER ROADMAP / V0.1




05 Technische Zielarchitektur
V0.1 bleibt ein modularer Monolith mit zwei laufenden Prozessen: Web/API und Worker. Die Datenbank ist der
verlässliche Zustandsspeicher; große Mediendateien liegen im lokalen persistenten Storage. Provider sind
austauschbar und der Renderprozess läuft getrennt von HTTP-Anfragen.
 BAUSTEIN               V0.1-ENTSCHEIDUNG                                    WICHTIGE REGEL
 Frontend               Next.js / React / TypeScript                         Öffentlich und /admin in derselben App
 API / Kernlogik        Node.js / TS / Next Route Handlers                   Validierung, Auth und Geschäftsregeln serverseitig
 Daten                  PostgreSQL + ORM                                     Projects, Claims, Assets, Audit, Jobs, Versionen
 Asynchrone Jobs        Worker + Queue (z. B. BullMQ/Redis)                  VPS-Benchmark bestimmt Parallelität und RAM-Budget
 Videoszenen            Remotion                                             Szenentypen und Scene-Director-Manifest versioniert
 Kompilierung           FFmpeg / ffprobe                                     1080p MP4; technische Ausgabekontrolle
 Recherche              RSS-/API-Provider-Adapter                            Allowlist und Abrufprotokoll
 Medien                 NASA, Pixabay, Commons, Upload                       Pexels nur optional; Rechte pro Asset
 Skript & Sprache       LLM-Adapter / TTS-Adapter                            Manuelle Freigabe und Versionierung
 Deployment             Docker Compose + HTTPS-Proxy                         Kein öffentliches Datenbank-/Queue-Port




06 Objekt- und Statusmodell (Mindestumfang)
VideoProject → TopicSnapshot → ResearchBrief → ScriptVersion → ScenePlan → AssetSelection → VoiceAudio
→ RenderManifest → RenderJob → Video → Approval/Publication. Source, NewsItem, Claim, Evidence,
MediaAsset, LicenseReview und AuditEvent werden separat verwaltet; lange laufende Jobs referenzieren
unveränderliche Projektversionen.
 OBJEKT / STATUS                     BEISPIEL                                      STOP-REGEL
                                                                                   Ungeklärte zentrale Claims verhindern
 Topic                               candidate / selected / needs_review
                                                                                   Skriptfreigabe.
                                                                                   Pending/blocked nicht in produktivem Render
 Asset                               pending / approved / blocked
                                                                                   nutzen.
 Script                              draft / reviewed / approved                   Edit invalidiert betroffene Audio-/Szenenversion.
 RenderJob                           queued / running / failed / completed         Nur validierte Dateien werden „completed“.
 Video                               draft / ready / published                     Nur manuelles Publish nach allen Freigaben.




07 Qualitätsregeln für echte Dokumentarfilme
• Echtes Videomaterial erhält Vorrang, wenn es die Aussage sachlich korrekt stützt. Animierte Karten,
Diagramme und Wissenschaftsgrafiken werden eingesetzt, wenn sie etwas erklären – nicht um Leerlauf zu
verdecken.
• Cinematic Shots füllen den Bildraum; keine dauerhaften dunklen Overlays, kein permanenter Textteppich,
keine unmotivierten Wiederholungsschleifen.
• Datenanimationen müssen Quelle, Zeitraum, Einheit und Skala korrekt abbilden. Bei fehlenden verifizierten
Daten darf keine scheinbar exakte Kurve konstruiert werden.
• Eine professionelle Dokumentation darf nicht durch Standbilder, künstlich verlangsamte Clips oder wiederholte
Fakten auf 8–10 Minuten gestreckt werden. Inhalt bestimmt die berechtigte Länge.
• Die tatsächliche Sprechdauer ist maßgeblich. Der Scene Director plant Bilder und Bewegungen um
Audio-Timings herum; bei Änderungen wird nur die betroffene Teilkette neu erstellt.
• Kein automatisches Public Publishing. Fachliche, rechtliche, visuelle und technische Freigabe sind getrennte
Voraussetzungen.



08 Risiken, Gegenmaßnahmen und Entscheidungsstellen
 RISIKO                                 GEGENMASSNAHME / ENTSCHEIDUNGS-GATE
                                        Schon in M01 Benchmark; Renderkonkurrenz reduzieren, Proxy-Dateien und Encoderprofil
 VPS zu schwach für 1080p
                                        prüfen; keine stillschweigende Cloudpflicht.
 Stock-API nicht zugänglich             Provider-Schnittstelle; Pexels optional; kuratierter lokaler Medienbestand als Fallback.




                                        blueDotAtlas • Arbeits- und Abnahmeplan • 26
<PARSED TEXT FOR PAGE: 27 / 28>
                                                                                  blueDotAtlas / MASTER ROADMAP / V0.1



 RISIKO                                GEGENMASSNAHME / ENTSCHEIDUNGS-GATE
 Doppelmeldungen = falsche
                                       Quell-Ursprung und Zitierkette in M07 trennen; Repost-Tests.
 Bestätigung
 Falsche wissenschaftliche Angaben     Claim-Evidence, Primärquellen, Versionsstand und Skript-Review vor Ausgabe.
 Fehlende Rechte                       Asset-für-Asset-Freigabe, Lizenz-Snapshot, harter Blocker vor Render/Publish.
                                       60-Sekunden-Gate vor Research-Ausbau, Scene-Director-Linter, Filmreview und
 Videos wirken wie Slideshows
                                       Pilotkorrekturen.
                                       Caching, nur betroffene Segmente neu erzeugen, Budgetwarnung und
 Steigende KI-/TTS-Kosten
                                       Provider-Abstraktion.
 Datenverlust oder volle SSD           Quoten, Cleanup, Backup plus wiederholter Restore-Test.




09 Abschlusskriterien V0.1
☐ Brand-Kit, Logo-/Farb-/Typografie-Tokens und konsistente Motion-Sprache freigegeben.
☐ VPS, Webapp, Datenbank, Renderworker und Admin-Login sind betrieben, gesichert und dokumentiert.
☐ Mindestens ein abgenommener 60-Sekunden-Film mit echtem Footage, Sprecher und wissenschaftlicher
Animation existiert.
☐ Ein hochwertiger längerer 1080p-Film ist technisch stabil und redaktionell sinnvoll gerendert.
☐ Mindestens vier News-Quellen sind funktionsfähig, aktivierbar und mit Abrufprotokollen versehen.
☐ Topics zeigen unabhängige Quellenlage und recherchierbare Claim-Belege.
☐ Mediensuche ist zweistufig und verhindert Nutzung ungeprüfter Medien.
☐ Skriptstudio, Stimmvorschau und Scene Director sind im siebenteiligen Wizard verbunden.
☐ Sichtbare Renderfortschritte, browserbasierte Wiedergabe, MP4-Download und manuelles Publish
funktionieren.
☐ Drei Langfilm-Testläufe sowie fünf Pilotläufe sind protokolliert; kritische Fehler sind behoben.



10 Weiterer Ausbau nach V0.1 – ausdrücklich NICHT
freigegeben
Nur nach bestandenem V0.1-Gate priorisieren: YouTube Data API (zunächst manueller Upload/privat),
tiefergehende Earth-Globe-Visualisierungen, datengetriebene Kartenlayer, Mehrsprachigkeit, zusätzliche
Provider, detaillierter grafischer Szeneneditor, mehrere Kanäle/Benutzer, intelligente Varianten von
Titeln/Thumbnails und Produktionsanalytik. Jede Erweiterung benötigt ein neues eigenes Ziel samt
Kosten-/Qualitätsnachweis.



11 Quellen und Referenzen
Basis dieser Roadmap: vom Auftraggeber bereitgestellter blueDotAtlas-Masterplan V0.1 sowie die beiden
PDF-Beispiele „Roadmap VideoNews Studio Low Budget 2026“ und „Kurvenfunk – Master Project Plan“.
Übernommen wurden insbesondere fortlaufende Aufgaben, Meilenstein-Gates, Ergebnispflicht, Aufwandstypen,
GitHub-Issue-First und Abnahmelogik; die inhaltlichen Entscheidungen folgen dem blueDotAtlas-Konzept.
NASA Earth Observatory – RSS https://science.nasa.gov/earth/earth-observatory/subscribe/feeds/
NOAA – RSS Feeds https://www.noaa.gov/rss-feeds
NASA Open APIs – Image and Video Library https://api.nasa.gov/
Remotion – Lizenz und Preise (aktuelle Bedingungen vor Einsatz erneut prüfen) https://www.remotion.dev/docs/license/pricing
Pexels – API-Schlüsselausgabe laut Hilfeseite derzeit pausiert (Stand 13.11.2026)
https://help.pexels.com/hc/en-us/articles/900004904026-How-do-I-get-an-API-key
Wikimedia Commons – Reusing Content https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia
Creative Commons – Lizenzfamilien https://creativecommons.org/share-your-work/cclicenses/
Hinweis: APIs, Lizenzbedingungen, Quoten und Preise können sich ändern. Deshalb enthalten M01 und die jeweiligen
Provider-Meilensteine ausdrücklich eigene Prüfaufgaben. Die Roadmap ist eine Projektplanung, keine Garantie für konkrete
Kosten, Laufzeiten, Plattformverfügbarkeit oder Rechtefreigaben.



                                       blueDotAtlas • Arbeits- und Abnahmeplan • 27
<PARSED TEXT FOR PAGE: 28 / 28>
                                                                                  blueDotAtlas / MASTER ROADMAP / V0.1




12 Meilenstein-Abnahmeprotokoll (Vorlage)
Dieses Formular pro Meilenstein kopieren und dem entsprechenden GitHub-Milestone oder Release als
Nachweis anhängen. Ein offener P0-Blocker verhindert die Abnahme.
 PRÜFPUNKT                                  EINTRAG / ENTSCHEIDUNG
 Meilenstein und Aufgabenbereich            M___ | Aufgaben ___ bis ___
 Build / Commit / Umgebung                  Commit: __________________ Umgebung: ______________
 Ergebnisse und Nachweise                   Issue-/PR-Links: ___________________________________
 Funktionale Tests                          ☐ bestanden ☐ nicht bestanden ☐ nicht anwendbar
 Filmqualität / Bedienbarkeit               ☐ bestanden ☐ nicht bestanden ☐ nicht anwendbar
 Quellen, Fakten, Rechte                    ☐ bestanden ☐ nicht bestanden ☐ nicht anwendbar
 Sicherheit / Betrieb / Backup              ☐ bestanden ☐ nicht bestanden ☐ nicht anwendbar
 Offene Blocker / Abweichungen              _________________________________________________
 Gate-Entscheidung                          ☐ GO ☐ GO mit Auflagen ☐ NO-GO
 Reviewer / Datum                           _________________________________ _______________


Nächstes Arbeitspaket: _______________________________________________________________________




                                        blueDotAtlas • Arbeits- und Abnahmeplan • 28
```
