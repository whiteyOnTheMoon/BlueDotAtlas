# Arbeitsvereinbarung V0.1 – Definition of Ready / Done und Dokumentationsregeln

**BlueDotAtlas · Roadmap 020 · Status: Vom Betreiber genehmigt am 19.11.2026 (UTC); dokumentiert als DEC-036**  
**Quellen:** [Original-Roadmap, Aufgabe 020 (S. 6)](BlueDotAtlas_Roadmap.pdf) · [Issue #37](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/37) · [GitHub-Arbeitsregeln 018](github-workflow.md) (DEC-034) · [vollständiger Backlog 019](roadmap-backlog-m00-m13.md) (DEC-035).  
**Zweck:** Jedes Arbeitspaket geht mit eindeutigen Inputs in die Umsetzung und verlässt sie mit prüfbarem Ergebnis, belegt durch Tests/Review und ausdrücklich erteilte Betreiberabnahme. Dies **ergänzt** die PR-Dokumentationsregel DEC-022 und das Issue-/PR-Vorgehen aus 018 – es ersetzt keine älteren Produkt-/Brand-/Kosten-/Rechteentscheidungen.

## 1. Definition of Ready (DoR) – vor dem ersten Code-/Dokumentationscommit

Eine Aufgabe ist **Ready**, wenn die folgenden Punkte im **bestehenden** GitHub-Issue erkennbar sind:

- [ ] **Identität:** Eindeutige Roadmap-Kennung `[NNN]`, M00–M13-Meilenstein und Issue; kein zweites Issue mit derselben Roadmap-ID.
- [ ] **Eingangsdaten / Inputs:** Roadmap-Quellabschnitt, bereits freigegebene Entscheidungen/Artefakte, benötigte Beispiel-/Testdaten und relevante Schnittstellen benannt. **Fehlende** Inputs und Unsicherheiten sind als Blocker sichtbar, nicht stillschweigend erfunden.
- [ ] **Voraussetzungen:** Abhängigkeiten (z. B. `Vorher: 018–019`) erfüllt oder ausdrücklich als bewusste Ausnahme freigegeben.
- [ ] **Scope und Nicht-Ziele:** Erwartetes Verhalten, Sicherheits-/Rechte-/Kostenrahmen und explizit **nicht** enthaltene Funktionen festgelegt; keine unbestellten Änderungen an vorhandenen VPS-Diensten oder anderen Repositories.
- [ ] **Ergebnis / Outputs:** Ziel-Dateien, APIs, Screens, Datenmodelle, Medienartefakte oder überprüfbarer Betriebszustand und Akzeptanzbedingungen festgelegt.
- [ ] **Prüfplan:** Passende automatische und manuelle Tests sowie Belegform (Testlog, Screenshot, Clip, API-/Migrationsprotokoll) vorab benannt; bei UI/Video sollen echte visuelle Nachweise geplant sein.
- [ ] **Freigabe-/Kosten-/Lizenz-Gates:** Rechte, externe Provider, bezahlte Modelle oder irreversibler Infrastruktur-Eingriff geklärt; andernfalls Aufgabe **blocked** und die fehlende explizite Genehmigung anfordern.

**Kein Ready → keine neue Implementierung als angeblich freigegebener Scope.** Vorarbeiten wie lesende Recherche/Planung sind möglich; tatsächliche bezahlte Anbieteraktivierung oder produktive Datenmigration folgt erst nach spezifischer Zustimmung.

## 2. Definition of Done (DoD) – vor dem finalen Merge

Alle **anwendbaren** Kriterien müssen anhand des konkreten Pull Requests nachvollziehbar sein. Ein `n/a` ist **nur mit kurzer Begründung** zulässig; fehlende Tests, Rechte oder aktive Blocker dürfen nicht als `n/a` kaschiert werden.

### 2.1 Implementierung und Nachweis

- [ ] **Scope vollständig:** Umsetzung stimmt mit Issue, Roadmap und vereinbartem Ergebnis überein; kein ungefragtes Nebenthema/Feature.
- [ ] **Überprüfbares Ergebnis:** Erwartete Datei/Route/Job/Video/Artefakt vorhanden, relevante Ausgabe/Status dokumentiert.
- [ ] **CI grün:** Für den PR **tatsächlich ausgelöste** passende GitHub-Actions-Jobs bestanden (Link + Commit/Run). Eine alte CI aus einem anderen Commit zählt nicht. Fachliche Unit-/Integrationstests werden mit M02 schrittweise erweitert.
- [ ] **Manuelle Prüfung / Review:** Betroffene Screens, Schnittstellen, Filmabschnitte, Daten, Fehlerfälle und ältere Entscheidungen anhand der Roadmap-Kriterien kontrolliert; Prüfer/Datum/Ergebnis im PR festgehalten. Eine selbst eingetragene Checkliste ist **keine** unabhängige GitHub-Approval-Review.
- [ ] **UI-Änderungen:** Screenshots des tatsächlich laufenden Zustands in sinnvollen Größen oder reproduzierbare Browser-Test-/Artefaktlinks; Keyboard-/Mobile-/Loading-/Error-Zustände nach betroffenem Umfang prüfen. **Kein UI im PR → „n/a – keine UI-Änderung“.**
- [ ] **Video/Animation/Audio:** Für sichtbare oder hörbare Änderung geeignete Vorschau/Clip mit Bildrate, Auflösung, Dauer, Ton-/Bewegungsprüfung; nur **real getestete** Rendererleistung behaupten. Synthetischer 8s-FFmpeg-Test 013 ersetzt keinen späteren echten 60s-/Remotion-Pilot.
- [ ] **Fakten-/Medienrechte:** Wissenschaftliche Claims, Quellversion/Datum und zugelassene Verwendung je Asset (Video, Foto, Karten, Musik, Sprecher) mit Nachweis. `UNREVIEWED`/`BLOCKED`/`REJECTED` sperrt produktive Verwendung; Anbieter-Lizenz ≠ Einzelfreigabe.
- [ ] **Datenmodell/Schema:** Migration auf frischer, isolierter Testdatenbank + Wiederholung und sichere Rückfall-/Restore-Strategie dokumentiert; **niemals** einen produktiven DB-/Volume-Reset als „Test“ ausgeben. **Keine Migration → begründetes n/a.**
- [ ] **Sicherheit/Verfügbarkeit:** Secret-Scan nach betroffenem Umfang, Admin-Auth/API-Rechte, geschützte vorhandene Services, plausible Ressourcen-/Speichergrenzen und mögliche Ausfallfolgen geprüft; keine ungetestete Produktionsdeploy-Freigabe.
- [ ] **Budget:** Gemeinsame Obergrenze **25 €/Monat KI + TTS**, externe Zusatz-APIs/RSS **0 €** und sonstige neue Dienste/Storage **0 €** beachten. **Jeder** konkrete kostenpflichtige Provider oder Plan benötigt zusätzlich eine separate ausdrückliche Freigabe (DEC-032).
- [ ] **Reproduzierbarkeit/Fehlerfälle:** Passende negative Tests, eindeutige Logs/Fehlerzustände, geordneter Rollback und keine verdeckten Nebenwirkungen auf andere VPS-Projekte.

### 2.2 Dokumentations- und Übergabegate (DEC-022)

- [ ] **`README.md` im selben PR** auf die aktuell verbindlichen Beschlüsse, Ergebnisse, Links und Status gebracht. Nur bei rein interner, nicht sichtbarer Änderung mit dokumentierter Begründung entbehrlich.
- [ ] **Fachdokumentation** gemeinsam mit Änderung angepasst. Entwürfe, Vorschläge, offene Tests und tatsächlich freigegebene Artefakte klar getrennt; keine Branch-Datei als bereits auf `main` behaupten.
- [ ] **Entscheidungsprotokoll** `docs/project/decision-log.md` bei neuen/ersetzten Entscheidungen ergänzt, **aber erst nach ausdrücklichem Nutzerbeschluss** als `Abgenommen` markiert. Bis dahin Vorschlag oder Review-Status.
- [ ] **Architekturentscheidungen (ADR):** Bei länger wirkender System-/Provider-/Daten-/Queue-/Deploymententscheidung [ADR-Vorlage](../architecture/adr/000-template.md) unter `docs/architecture/adr/NNN-kurzthema.md` verwenden. Kontext, Alternativen, Entscheidung, Folgen, Status, Datum und Link zur Entscheidung dokumentieren. Konflikte zum DEC-Log ausdrücklich auflösen, **nicht** eine neue Freigabe aus dem ADR ableiten.
- [ ] **PR ↔ Issue ↔ Roadmap-ID:** PR-Titel `[NNN] …`, `Roadmap-Nummer: NNN` und `GitHub-Issue: #ID` (oder `Refs #ID`) passen zu demselben bestehenden Issue.
- [ ] **Abnahme erteilt:** Der Betreiber hat **den konkret vorgelegten PR/Scope** ausdrücklich genehmigt; Review-Beleg/Datum stehen im PR/Issue. Vorher **kein Merge/Done**. Nach Merge: Commit, CI, Abnahme und Link im Issue; Issue schließen.

**Done ist nicht gleich „alle Meilenstein-Gates bestanden“:** Einzelne M01-Aufgaben können angenommen sein, obwohl der ursprüngliche umfangreichere Real-Footage-/Remotion-1080p-Gate erst beim echten M03-Pilot überprüft wird. Kein stillschweigendes M01-Gesamt-Go durch Aufgabe 020.

## 3. Review-Regeln und Änderungen nach Freigabe

1. **Fachreview zuerst, Betreiberabnahme danach.** Code-/Doc-Review bewertet Änderungsumfang, Testbelege, Rechte, Kosten und fehlende Nachweise. Die bestehende CODEOWNERS-Zuordnung ist ein Verantwortlichkeitsvermerk; der einzige Eigentümer kann nicht als unabhängige zweite Approval-Person simuliert werden.
2. **PR bleibt offen**, bis ausdrücklich genehmigt; dem Nutzer wird klar gesagt, was bereits getestet ist und was bei einem Merge erst ausgelöst wird.
3. **Nachträgliche Änderungen am freigegebenen Scope** erfordern aktualisierte Belege und ggf. erneute Freigabe. Ein „Ok“ zu einer alten PR-Fassung ist kein automatischer Freibrief für neue Kosten, Medien oder Sicherheitsausnahmen.
4. **Fehlschlag:** PR/Issue mit Blocker offen halten, Fehler und Reproduktionspfad dokumentieren; niemals fehlgeschlagene CI, fehlende Rechte oder defektes Video als done markieren.
5. **Betriebsschutz:** Auf dem VPS keine pauschalen Docker-Prune-/DB-Reset-Aktionen. Shell-Snippets für den Betreiber beginnen in einer **Subshell** mit `cd "$HOME" || exit 1` und greifen nur auf gezielt autorisierte BlueDotAtlas-Ressourcen zu.
6. **Publikation:** Ein fertiger Render ist **keine** automatische Freigabe zur öffentlichen Veröffentlichung. Wissenschaft, Medienrechte, Filmqualität und manuelle Betreiberfreigabe sind separat.

## 4. ADR-Regeln (Architecture Decision Records)

- **Wann?** Für modulare Architektur, DB-/Queue-/ORM-Auswahl, Schnittstellenverträge, langfristige Render-/Provider-/Storage- oder Sicherheitsentscheidungen, die später schwer umzukehren sind.
- **Format:** `ADR-000` als Vorlage; reale Nummern `001`, `002` usw.; Status `Proposed`, `Accepted`, `Superseded`, `Rejected`. `Accepted` ausschließlich bei bestehender zugehöriger Betreiberfreigabe.
- **Bezug:** ADR zeigt Issue, PR, ggf. `DEC-0XX`, verwendete Quellen und Nachweise; der Decision Log bleibt die maßgebliche Freigabechronik.
- **Beispiel:** [ADR-001 – modularer Monolith und getrennter Worker](../architecture/adr/001-modular-monolith.md) belegt die schon in 017 freigegebene **Architekturentscheidung DEC-033**. Das ADR schaltet **keine** Produktivinstallation oder Remotion-Renderer-Freigabe frei.

## 5. Abnahme-Nachweis: Beispiel-PR für Roadmap 020

Dieses Arbeitspaket selbst wird als **beispielhafter PR** verwendet; keine künstliche zweite PR ohne Produktwert nötig.

| DoD-Gegenstand | Konkreter Nachweis / aktueller Status |
| --- | --- |
| Issue und Ready | [Issue #37](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/37) bestand **vor** Branch/Commit; Roadmap, M01, Scope, Ergebnis und Abnahmetor definiert |
| Deliverables | Dieses Dokument `docs/project/working-agreement.md`, ADR-Vorlage und ADR-001, ergänzte PR-Checkliste |
| CI | [PR #185](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/185) erstellt. **PASS**: [DoR/DoD-/ADR-Tests, sechs Fälle](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44444255771), [PR-Roadmap-/Issue-Identität](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44444255798) sowie [M00–M13-Manifest-Check](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44444255783). Vor dem Merge auch den **letzten PR-Commit** grün prüfen. |
| Review | Fachreview als [Kommentar in PR #185](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/185) dokumentiert; **ausdrückliche Betreiberfreigabe „Ok“** am 19.11.2026 UTC erteilt. Keine unabhängige GitHub-Zweitfreigabe behauptet. |
| Screenshots | **n/a**, da keine Oberfläche verändert oder ausgeführt wird |
| Lizenzen/Migration | **n/a**, da keine Medien eingeführt, keine Datenbank und kein Provider verändert werden |
| Infrastruktur und Kosten | **Keine** VPS-Änderung, kein Deployment, keine bezahlten Provider |
| Dokumentation | README, beide Roadmap-Indizes und Entscheidungslog mit Freigabe **DEC-036** werden im abgenommenen PR aktualisiert. |
| Merge/Abschluss | **Betreiberfreigabe erteilt;** nach den erneut grünen CI-Checks folgt der Squash-Merge und danach der Abschluss von Issue #37. |

## 6. Task-020-Abnahmecheck

- [x] DoR/DoD mit Inputs/Outputs, Tests, UI-Screenshots, Lizenz-/Faktenprüfung und Datenmigrationen spezifiziert.
- [x] PR-/README-/Decision-Log-Konsistenz und ADR-Format als Arbeitsregel dokumentiert.
- [x] Vorliegende Entscheidungen DEC-022, 030–035 wiederverwendet; keine neuen Produkt-/Budget-/Sicherheits-Freigaben erfunden.
- [x] Beispiel-[PR #185](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/185) mit erfolgreicher **GitHub-CI** (DoR/DoD-/ADR-Unit-Tests + Issue-Gate); neuester Commit vor Merge ebenfalls zu prüfen.
- [x] Nachvollziehbarer Review-Kommentar auf [PR #185](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/185) und **ausdrückliche Betreiberfreigabe „Ok“** für den konkreten PR liegen vor (19.11.2026 UTC).
- [x] **Betreiberfreigabe zur Arbeitsvereinbarung und PR #185 erteilt**; im [Entscheidungsprotokoll](decision-log.md) als DEC-036 dokumentiert. Merge und Issue-Abschluss folgen nach erfolgreichem CI auf dem finalen PR-Commit.

**Nächste Roadmap-Aufgabe:** 021 (M02) – Monorepo und Basistooling initialisieren. Ein echter vollständiger 1080p-Pilotfilm ist weiterhin Aufgabe M03.
