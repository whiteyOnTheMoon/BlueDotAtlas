# GitHub-Arbeitsregeln V0.1 – Roadmap 018

**BlueDotAtlas · Stand: 19.11.2026 (UTC) · vom Betreiber freigegeben (DEC-034) · [Issue #35](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/35)**  
**Quelle:** [Master Roadmap V0.1](master-roadmap-v01-text.md), Aufgabe 018, S. 6. Diese Regeln ergänzen die bereits bestehende PR-Dokumentationsregel **DEC-022** und die Einzelabnahme für jede Roadmap-Aufgabe; die formale Definition of Ready/Done folgt in **020**.

## 1. Tatsächlich geprüfter GitHub-Zustand

| Punkt | Ist-Zustand | Entscheidung / offener Schritt |
| --- | --- | --- |
| Repository | [`whiteyOnTheMoon/BlueDotAtlas`](https://github.com/whiteyOnTheMoon/BlueDotAtlas), Standardbranch `main` | Bereits vorhanden; kein neues Repo anlegen und bestehende Historie nicht ersetzen |
| **Sichtbarkeit** | **PUBLIC / öffentlich**, API-Status am 19.11.2026 (UTC) geprüft | **Bewusste Betreiberentscheidung (DEC-034):** Repo bleibt **PUBLIC**; die ursprüngliche Roadmap-Anforderung „privat“ wird für dieses Repository ausdrücklich übersteuert. Keine Umstellung auf Private geplant |
| PR-Vorlage | `.github/pull_request_template.md` vorhanden; DEC-022-Checkliste und Abnahmetor existieren bereits | Vorhandene Vorlage ergänzen, **nicht** ersetzen |
| Automatische Checks | Historisch neun M00/M01-Checks, seit M02 viele fachliche (022–032) und der neue 033-Required-CI-Entwurf | Vorhandene Workflows bewahren. 033 soll als einziger bedingungslos laufender Merge-Pflichtcheck dienen; erfolgreiche Jobs allein erzwingen keinen Schutz |
| CODEOWNERS / Issue-Vorlagen | Im geprüften `.github/`-Verzeichnis bisher nicht vorhanden | Owner- und Issue-Templates in diesem PR ergänzen |
| Repository-Regelsätze | Am 19.11.2026 erneut geprüft: `main.protected=false`, `GET /rulesets` liefert `[]`; Schutzdetails über Integration 403 | **Keine tatsächliche Merge-Sperre** verifiziert. Vor 033-Gesamtabnahme durch Repo-Owner aktives `main`-Ruleset mit erforderlichem Check `033 Required CI` einrichten und per rotem Probe-PR nachweisen |
| GitHub Project Board | Über die verfügbare GitHub-Verbindung nicht anlegbar/verifizierbar | Board-Konfiguration unten dokumentieren; **nicht als erstellt behaupten** |
| Labels und native Milestones | **Native GitHub-Meilensteine M00–M13 und 158 Issue-Zuordnungen wurden in 019 per GitHub Actions erfolgreich erstellt und rückgeprüft (DEC-035).** Labels sind weiterhin nur vorgeschlagen. | Native Milestones und Roadmap-Index sind eingerichtet; Labelobjekte nur bei Bedarf im GitHub-UI ergänzen |

**Wichtig:** Die öffentliche GitHub-Sichtbarkeit betrifft auch Commit-Historie, hochgeladene Dateien und veröffentlichte Repository-Artefakte. Keine Secrets oder personenbezogenen Daten ins Repo schreiben, unabhängig vom Sichtbarkeitsstatus. **Der Betreiber hat ausdrücklich festgelegt, dass BlueDotAtlas öffentlich bleibt (DEC-034).** Ein späterer Sichtbarkeitswechsel wäre ein neuer Beschluss.

## 2. Verbindlicher Minimalablauf

1. **Vor dem ersten Commit:** Roadmap-Aufgabe `NNN` finden; wenn sie noch kein GitHub-Issue hat, **zuerst Issue anlegen**, z. B. `[021] Monorepo initialisieren`, mit Quelle, Abhängigkeiten, Ergebnis und Abnahme.
2. Branch von aktuellem `main` erstellen: `feat/NNN-kurzthema`, `fix/NNN-kurzthema`, `docs/NNN-kurzthema`, `chore/NNN-kurzthema` oder `test/NNN-kurzthema`. `main` bleibt Integrationsbranch; keine direkten Änderungen an `main` für neue Codeaufgaben.
3. Nur den klar abgegrenzten Issue-Scope ändern; **bestehende VPS-Projekte, Volumes, Zertifikate, Secrets oder Datenbanken** nicht ohne eigene Zustimmung anfassen. Technische Änderungen mit passenden Tests und begrenztem Rollback planen.
4. PR auf `main` mit Titel **`[NNN] Kurze Aussage`** öffnen. PR-Body enthält die Zeilen **`Roadmap-Nummer: NNN`** und **`GitHub-Issue: #NUMMER`** (alternativ `Refs #NUMMER`), fachliche Änderungen, Prüf-/Lizenznachweise, Risiken und offenen Abnahmepunkt.
5. **Automatische PR-Metadatenprüfung** kontrolliert dreistellige ID, identische Roadmap-Nummer und eine bestehende GitHub-Issue mit derselben Roadmap-ID. **Sie beweist nicht die fachliche Qualität oder den Zeitpunkt des allerersten Commits.**
6. **Manueller Review und Betreiberfreigabe:** Betroffener Scope, Risiken, Lizenzen, Kosten, UI/Medien-Tests und README-/Decision-Log-Stand werden geprüft. Der Codeowner `@whiteyOnTheMoon` verantwortet das inhaltliche Gate. **CODEOWNERS ist noch kein automatisch erzwungener Approval-Mechanismus**.
7. **Erst nach ausdrücklicher Abnahme** wird der PR – bevorzugt per **Squash-Merge** – in `main` übernommen und das Issue mit PR-/Commit-/Entscheidungsreferenz geschlossen. Ein `Ok` gilt nur für den konkret zur Abnahme vorgelegten Task, nicht für spätere.
8. Nächste Roadmap-ID beginnen. Keine Änderung an bereits genehmigten Markendesigns, Rechtspflichten, Budgetgrenzen oder Produktgrenzen ohne eigene Entscheidung.

**Sonderfall Bugfix:** Eine Bug-Issue ist zusätzlich möglich, aber ein PR braucht weiterhin eine klare Roadmap-Zuordnung/Arbeitspaketnummer. Falls keine passende Roadmap-Aufgabe existiert, wird die Abweichung zuerst als Entscheidung dokumentiert – keine erfundene `000`- oder Doppel-ID.

## 3. Repo-Dateien und Verantwortlichkeit

- `.github/CODEOWNERS`: `@whiteyOnTheMoon` als fachlich verantwortliche Person für alle Dateien. Das ersetzt **keine** technische Branch-Protection. Ein einzelner Repo-Owner kann seinen **eigenen** PR auf GitHub nicht als unabhängiger Approver bestätigen; deshalb nicht blind „1 required approval“ setzen, solange keine zweite berechtigte Person vorgesehen ist.
- `.github/ISSUE_TEMPLATE/roadmap-task.md`: Aufgaben mit eindeutiger `[NNN]`-ID, Abhängigkeiten, Scope, Abnahme und Evidenz.
- `.github/ISSUE_TEMPLATE/bug.md`: reproduzierbarer Bug, Impact, Regression und Bezug zur Roadmap.
- `.github/pull_request_template.md`: wiederverwendete DEC-022-Checkliste mit konkreter Issue-/Roadmap-ID, Tests, Dokumentations- und Betreiberfreigabe.
- `.github/workflows/roadmap-pr-check.yml` + `scripts/check-roadmap-pr.mjs`: ressourcenschonender Metadaten-Gate bei PR-Events, ohne VPS-Zugriff oder bezahlte Dienste.
- Bestehende Medien-/Brand-/PRD-Workflows bleiben unangetastet. Allgemeiner TypeScript-/Build-/Migrations-CI-Ausbau erfolgt mit M02.

## 4. Labels, Issue-Typen und Projektboard

**Vorgeschlagene Labels (noch nicht als GitHub-Labels erstellt):**

| Achse | Labels | Nutzung |
| --- | --- | --- |
| Typ | `type:feature`, `type:bug`, `type:docs`, `type:infra` | Art der Arbeit |
| Bereich | `area:web`, `area:worker`, `area:video`, `area:providers`, `area:data`, `area:brand` | Zuständigkeit |
| Gate | `status:blocked`, `status:review` | Sichtbare Blocker / Review |

**Projektboard-Vorschlag:** Ein GitHub **Projects**-Board mit den Ansichten `Board` und `Roadmap` (falls verfügbar); Spalten `Backlog`, `Ready`, `In Progress`, `Review`, `Done`; Custom Fields `Roadmap ID` (Text), `Milestone` (M00–M13), `Priority` (optional). **Noch nicht angelegt**, deshalb keine angeblich aktiven Automationen oder Links auf nicht existierende Boards. Board erst einrichten, wenn Zugriff vorliegt bzw. der Betreiber es ausdrücklich im GitHub-UI anlegt. **Alle 158 GitHub-Issues 001–158** sind inzwischen verbindliche Arbeitsquelle; native M00–M13-Meilensteine und Zuordnungen sind in **019** abgeschlossen (DEC-035).

## 5. Manuelle GitHub-Einstellungen für den Betreiber

**Repository bleibt öffentlich (DEC-034).** Unabhängig von der Sichtbarkeit in Repository **Settings** zu einem passenden Zeitpunkt prüfen:

- **Keine Änderung der Sichtbarkeit:** `PUBLIC` ist für BlueDotAtlas bewusst genehmigt (DEC-034). Daher besonders konsequent keine Secrets, Zugangsdaten oder personenbezogenen Dateien committen.
- `Settings → Rules → Rulesets` (oder `Branches`, je nach UI): `main` gegen unbeabsichtigte Direkt-Pushes und Force-Push/Delete schützen; PR vor Merge verlangen, passende GitHub-Actions-Checks als erforderliche Checks **erst nach erfolgreichem Test** auswählen.
- Keine pauschale zwingende externe Approval-Anzahl setzen, wenn nur der eine Projekt-Owner verfügbar ist; menschliche Abnahme bleibt als Projektprozess zu dokumentieren.
- `Issues → Labels`: vorgeschlagene Labels anlegen; `Projects`: Board erstellen und anschließend bestehende Issues übernehmen. Keine APIs für Repo-Verwaltung oder versteckte Ressourcen freigeben müssen, nur damit die Dokumentationsaufgabe 018 abgeschlossen werden kann.

## 6. Roadmap-Gate und Grenzen

- [x] Existierendes Repo, Standardbranch und Ist-Sichtbarkeit **tatsächlich überprüft**.
- [x] Branch-Namensgebung, `Issue vor Commit → Tests/Review → PR → explizite Abnahme → Merge` definiert.
- [x] PR- und Issue-Vorlagen, CODEOWNERS sowie Metadatenprüfung vorbereitet.
- [x] Typ-/Label-Konzept und Board-Struktur vorbereitet (nicht fälschlich als eingerichtet ausgegeben).
- [x] Abweichung von der ursprünglichen „privat“-Vorgabe durch **ausdrücklichen Betreiberbeschluss für PUBLIC** geklärt (DEC-034).
- [x] Automatischer PR-Check in [PR #58](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/58) einschließlich sechs Script-Unit-Tests und Abgleich gegen das echte GitHub-Issue **erfolgreich** ausgeführt ([GitHub Actions Run #44438253259](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44438253259)).
- [x] **Betreiber hat die GitHub-Arbeitsregeln genehmigt und PUBLIC ausdrücklich bestätigt** (19.11.2026 UTC, DEC-034). Merge und Issue-Abschluss folgen demselben Abnahmeschritt.
- [ ] **Spätere separate GitHub-Adminaktionen:** geeignete Rulesets/Branch-Protection, Labels und Projektboard manuell einrichten. **Keine Sichtbarkeitsänderung nötig oder gewünscht.** Diese Einstellungen werden nicht als durch diesen PR erledigt ausgegeben.

**Abnahmeumfang 018:** Dokumentierte und im Repository bereitgestellte, freigegebene Arbeitsregeln mit erfolgreich getesteter Roadmap-/Issue-Referenzprüfung; das Repository bleibt bewusst **öffentlich**. **Nicht behauptet:** Branch-Protection, Projektboard oder neue Labels seien bereits technisch eingerichtet. **Native GitHub-Meilensteine sind seit Aufgabe 019 verifiziert (DEC-035)**.


## Ergänzung Roadmap 033 – Zentraler PR-Check und aktiver Main-Schutz

Roadmap 033 führt ergänzend zum historischen Issue-/PR-Prozess den **unabhängig von geänderten Dateipfaden gestarteten** GitHub-Workflow [`required-ci-033.yml`](../../.github/workflows/required-ci-033.yml) mit dem stabilen Job-/Check-Namen **`033 Required CI`** ein. Tests der Workflow-Konfiguration verbieten, diesen zwingenden Check mittels `paths`-/`branches`-Filter oder `continue-on-error` zu überspringen. Der ausdrückliche Betreiberentscheid zu jedem konkreten PR bleibt als zusätzlicher menschlicher Schritt gültig. **Ein erfolgreicher Action-Run allein aktiviert keine Branch-Protection.**

**Stand:** GitHub meldete vor 033 auf `main` `protected: false` und eine leere Ruleset-Liste; die Integrationsberechtigung reicht nicht für Ruleset-/Protection-Schreibzugriff. Die folgende UI-Einrichtung braucht daher den Repository-Eigentümer und ist **nicht** durch das bloße PR-Merge erledigt. Vollständige Schrittfolge, Kosten-/Sicherheits- und Negativprobe im [033-Betriebsrunbook](../development/ci-033.md).
