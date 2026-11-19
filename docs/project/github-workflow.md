# GitHub-Arbeitsregeln V0.1 – Roadmap 018

**BlueDotAtlas · Stand: 18.11.2026 · Vorschlag zur Betreiberabnahme · [Issue #35](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/35)**  
**Quelle:** [Master Roadmap V0.1](master-roadmap-v01-text.md), Aufgabe 018, S. 6. Diese Regeln ergänzen die bereits bestehende PR-Dokumentationsregel **DEC-022** und die Einzelabnahme für jede Roadmap-Aufgabe; die formale Definition of Ready/Done folgt in **020**.

## 1. Tatsächlich geprüfter GitHub-Zustand

| Punkt | Ist-Zustand | Entscheidung / offener Schritt |
| --- | --- | --- |
| Repository | [`whiteyOnTheMoon/BlueDotAtlas`](https://github.com/whiteyOnTheMoon/BlueDotAtlas), Standardbranch `main` | Bereits vorhanden; kein neues Repo anlegen und bestehende Historie nicht ersetzen |
| **Sichtbarkeit** | **PUBLIC / öffentlich**, API-Status am 18.11.2026 geprüft | **Abweichung:** Roadmap fordert ein **privates** Repository. Sichtbarkeit bleibt **unverändert**, bis der Betreiber dies ausdrücklich bestätigt; die Änderung erfordert Repo-Adminaktion in GitHub |
| PR-Vorlage | `.github/pull_request_template.md` vorhanden; DEC-022-Checkliste und Abnahmetor existieren bereits | Vorhandene Vorlage ergänzen, **nicht** ersetzen |
| Automatische Checks | Neun fachliche `.github/workflows/*`-Checks existieren für frühere Roadmap-Aufgaben | Bewahren; leichter PR-Metadatencheck wird ergänzt. Bestandsworkflows nicht blind als universelle CI bezeichnen |
| CODEOWNERS / Issue-Vorlagen | Im geprüften `.github/`-Verzeichnis bisher nicht vorhanden | Owner- und Issue-Templates in diesem PR ergänzen |
| Repository-Regelsätze | API lieferte **keine Regeln**; Branch-Protection-Detail war über die Verbindung **nicht abrufbar (403)** | **Schutzwirkung nicht verifiziert**, vor produktiver Arbeit manuell in Settings prüfen/einrichten |
| GitHub Project Board | Über die verfügbare GitHub-Verbindung nicht anlegbar/verifizierbar | Board-Konfiguration unten dokumentieren; **nicht als erstellt behaupten** |
| Labels und native Milestones | Neue Labels/Milestones lassen sich über die aktuell verfügbare Verbindung nicht erzeugen | Vorgeschlagene Label-Taxonomie dokumentieren; native Milestones/Backlog-Import gehören auch zu **019** |

**Wichtig:** Die öffentliche GitHub-Sichtbarkeit betrifft auch Commit-Historie, hochgeladene Dateien und veröffentlichte Repository-Artefakte. Keine Secrets oder personenbezogenen Daten ins Repo schreiben, unabhängig vom Sichtbarkeitsstatus. Sichtbarkeitswechsel nach `private` ist eine **separate Betreiberentscheidung** und keine automatische Aktion dieser PR.

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

**Projektboard-Vorschlag:** Ein GitHub **Projects**-Board mit den Ansichten `Board` und `Roadmap` (falls verfügbar); Spalten `Backlog`, `Ready`, `In Progress`, `Review`, `Done`; Custom Fields `Roadmap ID` (Text), `Milestone` (M00–M13), `Priority` (optional). **Noch nicht angelegt**, deshalb keine angeblich aktiven Automationen oder Links auf nicht existierende Boards. Board erst einrichten, wenn Zugriff vorliegt bzw. der Betreiber es ausdrücklich im GitHub-UI anlegt. Die **34 bestehenden GitHub-Issues 001–034** bleiben die verbindliche Arbeitsquelle; native GitHub-Milestones M00–M13 und Aufgaben 035–158 werden getrennt in **019** behandelt.

## 5. Manuelle GitHub-Einstellungen für den Betreiber

**Nur nach Freigabe der gewünschten Sichtbarkeit und Zugriffsstruktur** in Repository **Settings** prüfen:

- `General → Danger Zone → Change repository visibility`: `Private`, wenn die ursprüngliche Roadmap-Vorgabe gelten soll. **Achtung:** Ein Umstellen auf privat macht zuvor außerhalb von GitHub kopierte Inhalte nicht rückwirkend unveröffentlicht.
- `Settings → Rules → Rulesets` (oder `Branches`, je nach UI): `main` gegen unbeabsichtigte Direkt-Pushes und Force-Push/Delete schützen; PR vor Merge verlangen, passende GitHub-Actions-Checks als erforderliche Checks **erst nach erfolgreichem Test** auswählen.
- Keine pauschale zwingende externe Approval-Anzahl setzen, wenn nur der eine Projekt-Owner verfügbar ist; menschliche Abnahme bleibt als Projektprozess zu dokumentieren.
- `Issues → Labels`: vorgeschlagene Labels anlegen; `Projects`: Board erstellen und anschließend bestehende Issues übernehmen. Keine APIs für Repo-Verwaltung oder versteckte Ressourcen freigeben müssen, nur damit die Dokumentationsaufgabe 018 abgeschlossen werden kann.

## 6. Roadmap-Gate und Grenzen

- [x] Existierendes Repo, Standardbranch und Ist-Sichtbarkeit **tatsächlich überprüft**.
- [x] Branch-Namensgebung, `Issue vor Commit → Tests/Review → PR → explizite Abnahme → Merge` definiert.
- [x] PR- und Issue-Vorlagen, CODEOWNERS sowie Metadatenprüfung vorbereitet.
- [x] Typ-/Label-Konzept und Board-Struktur vorbereitet (nicht fälschlich als eingerichtet ausgegeben).
- [x] Sensible Abweichung **öffentlich statt privat** offen dokumentiert; Änderung bleibt Betreiberentscheidung.
- [ ] Automatischer PR-Check im neu geöffneten PR erfolgreich und **inhaltliche Betreiberabnahme** dokumentiert.
- [ ] Gegebenenfalls Repo-Sichtbarkeit/Rulesets, Labels und Board in GitHub manuell nachziehen; diese GitHub-Adminaktionen sind **nicht** Teil eines stillschweigend erfolgten Datei-Merges.

**Abnahmeumfang 018:** Dokumentierte und im Repository bereitgestellte Arbeitsregeln mit automatischer Roadmap-/Issue-Referenzprüfung. **Nicht behauptet:** das Repo sei bereits privat, eine Branch-Protection sei aktiv oder ein Projektboard/eine native Milestone-Struktur sei erstellt.
