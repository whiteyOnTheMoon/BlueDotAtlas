# BlueDotAtlas – Datenmodell und Statusregeln (Roadmap 024)

**Status:** Implementierung auf `feat/024-project-video-model`, abnahmebedürftig. [Issue #41](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/41).

## Ziel und Vertragsgrenzen

PostgreSQL ist die persistente Quelle der Wahrheit. Das Modell führt in **`drizzle/0001_*.sql`** acht fachliche Tabellen ein und erweitert die technische `app_metadata`-Baseline aus 023. Die SQL-Migrationen und die Drizzle-Snapshots werden **gemeinsam** versioniert. Dieses Schema allein schaltet **keine** Admin-Anmeldung, API, Worker-Ausführung oder Veröffentlichung frei.

| Tabelle | Fachlicher Zweck / Beziehungen | Wichtige Integrität |
| --- | --- | --- |
| `video_projects` (`VideoProject`) | Titel, aktueller Versionszähler und Projektstatus | UUID, nichtleerer Titel, Status-Enum, Soft-Delete |
| `project_versions` (`ProjectVersion`) | Versionierter JSON-Snapshot eines Projekts | Einzigartig (Projekt-ID, positive Revision), FK ohne Cascade-Löschung |
| `step_progress` (`StepProgress`) | Daten und Status je Wizard-Schritt einer **konkreten Projektversion** | Schritt 1–7, genau ein Datensatz je Version/Schritt |
| `videos` (`Video`) | Video und Status, optional Slug/Dauer/finales Artefakt | Passende Projekt-Version per zusammengesetztem FK; Published braucht finale Datei + Zeitpunkt; **nicht automatisch öffentlich** |
| `render_jobs` (`RenderJob`) | persistierbarer Jobstatus und Version/Video-Referenz | Fortschritt 0–100 %, Retry-Zähler und DB-Status-Enum; echte Queue folgt 027 |
| `approvals` (`Approval`) | manuelle, revisionsgebundene Entscheidungen für Skript, Rechte, Render, Publish | Pending ohne Entscheidungszeit; Approved/Rejected mit Zeit; **keine** automatische Genehmigung |
| `artifacts` (`Artifact`) | Referenz auf lokales Medienobjekt oder ursprüngliche Quelle | Nur Pfad-/Quellreferenz, keine Mediendaten in DB; Rechte default **unreviewed** |
| `audit_events` (`AuditEvent`) | Ereignisprotokoll pro Projekt | Append-only-Anwendungsregel, keine Soft-Delete-Spalte; UUID, UTC-Zeit und JSON-Details |

Die betriebliche Konvention `created_at`/`updated_at`/`deleted_at` gilt für fachliche Arbeitsdatensätze; Audit-Events bilden die **bewusste Ausnahme**: Einträge werden nicht gelöscht oder rückwirkend überschrieben. Alle Zeitangaben sind PostgreSQL `timestamptz`; physische Dateien liegen später im getrennten lokalen Storage (028), **nicht** in PostgreSQL.

## Status und Übergänge

Die **kanonischen** Begriffe und zulässigen Übergänge liegen in `packages/core/src/status.ts`; Datenbank-Enumeinträge werden daraus abgeleitet.

- **Projekt:** `draft → in_progress → in_review → approved`; Revisionen dürfen bewusst zurück in Arbeit, und vor dem Archivieren ist ein ausdrücklicher Übergang erforderlich. `archived` ist endgültig. Sprünge wie `draft → approved` oder `archived → draft` werden abgelehnt.
- **Renderjob:** `queued → running → succeeded/failed/cancelled`; ein gescheiterter Job kann erst nach ausdrücklich kontrolliertem Retry wieder `queued` werden. **Render success bedeutet keine redaktionelle Freigabe**.
- **Video:** `draft → rendered → in_review → ready`. Der generische Statusautomat erlaubt **keinen** Übergang nach `published`. Die spätere manuelle Veröffentlichungsoperation muss Rechtekette, freigegebene Projektversion und finales Artefakt zusätzlich prüfen; sie wird hier **nicht** implementiert.
- **Assetrechte:** `unreviewed` als sicherer Default. `blocked`/`rejected` sind niemals implizit freigegeben.
- **Wizard:** sieben Originalschritte aus PRD-010, pro Projektversion je ein Datensatz; neue Versionen kopieren den alten Zustand **nicht** automatisch (die Versionierungs- und Autosave-Logik gehört zu 032).

`createProject()` erzeugt Titel, Revision 1, alle sieben Schrittzeilen (nur Schritt 1 aktiv) und ein Audit-Event **in einer Transaktion**. `transitionProjectStatus()` liest die Projektzeile mit PostgreSQL-`FOR UPDATE`-Sperre, prüft das Core-Statusmodell und schreibt den neuen Zustand **mit Audit in derselben Transaktion**; bei unzulässigem Sprung bleibt die DB unverändert. `getProject()` filtert Soft-Deletes. Diese serverseitigen Helpers ersetzen **keine** Authentifizierung oder Berechtigungsprüfung einer späteren API (025–026).

## Lokaler/CI-Test

- Eigene wegwerfbare PostgreSQL-16-DB: **nur** `localhost/bda_test` und `BDA_DB_TEST=1` sind für automatisierte Integrationstests zugelassen.
- `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm build`.
- `pnpm --filter @bluedotatlas/db test:integration`: Basismigration + Folgemigration auf frischer DB, erneute Migration, Persistenz über neue Pool-Verbindung, positive/negative Statusübergänge, Constraints, Soft-Delete, Audit sowie Seed-Verhalten.
- `pnpm --filter @bluedotatlas/db db:check` und `pnpm --filter @bluedotatlas/db db:generate` **dürfen keine** zusätzliche Driftmigration erzeugen. SQL und JSON-Snapshots müssen exakt in Git stehen.

## Sicherheits- und Deployment-Gates

Der Schutz der externen HTTP-API, des Einzeladmins und des öffentlichen Videoplayer-Queries folgt in 025–026 und späteren Roadmap-Aufgaben; **keine** Render-/Publikationsfunktion ist hier live. Ein Datenbankschema ist kein Freibrief, `published` aus Renderergebnissen zu setzen. Das tatsächlich sichere Publish-Kommando mit revisionsgebundenen Freigabe-/Medienrechten ist Teil der späteren Publish-Gates. Keine Änderungen an bestehenden VPS-Datenbanken, Docker-Volumes, API-Secrets oder Fremdprojekten. Die echte Backup-/Restore-Abnahme ist Roadmap 034.
