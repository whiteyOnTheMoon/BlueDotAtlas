# Roadmap 023 — PostgreSQL / Drizzle ORM / Migrationen

**Status:** Vorschlag auf `feat/023-postgres-orm-migrations`; die Tests müssen bestehen und der Betreiber muss den PR ausdrücklich vor Merge freigeben. [Issue #40](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/40).

## Zweck und Grenzen

`packages/db` stellt die serverseitige PostgreSQL-Connection, Drizzle ORM, versionierte SQL-Migrationen und einen idempotenten Seed bereit. Die erste Migration erzeugt **nur** die minimale `app_metadata`-Tabelle für die technischen Feldstandards. Die echten Entitäten wie `VideoProject`, `RenderJob`, `Approval` und `AuditEvent` folgen in **Roadmap 024**. Kein bestehender VPS-Dienst und keine fremden Postgres-Instanzen werden verändert.

## Lokaler isolierter Test

1. Eine **eigene** PostgreSQL-16-Testinstanz mit Datenbank `bda_test` und einem unprivilegierten lokalen Benutzer erstellen (nicht an öffentlich erreichbare Ports binden, falls Docker genutzt wird). Keine bestehende DB/Volume nutzen.
2. Node 22 + pnpm 11.28.12 verwenden; `pnpm install --frozen-lockfile`.
3. `DATABASE_URL` ausschließlich serverseitig als **lokale** Env setzen, niemals in Git, Browser- oder Logs schreiben.
4. `pnpm --filter @bluedotatlas/db db:migrate` auf dieser Testdatenbank ausführen, dann `pnpm --filter @bluedotatlas/db db:seed`; beide Befehle sind wiederholbar.
5. `BDA_DB_TEST=1 pnpm --filter @bluedotatlas/db test:integration` führt die Integrationsprüfung **ausschließlich** gegen `localhost/bda_test` aus und bricht bei fehlender Gate-Variable ab.
6. Der GitHub-Workflow `M02 023 PostgreSQL migrations integration` startet eine **wegwerfbare** `postgres:16-alpine`-Serviceinstanz mit eigenen Test-Zugangsdaten; dadurch wird der fresh-migration-Test nachvollziehbar.

## Vertrag / Migrationen

- IDs: `uuid` mit Datenbankdefault `gen_random_uuid()`.
- Zeit: PostgreSQL `timestamptz` in UTC-konformer Speicherung; `created_at`, `updated_at` als nicht-null; `deleted_at` nullable für **Soft-Delete**.
- Kein physisches Löschen über den veröffentlichten App-Code; aktive Lesezugriffe müssen `deleted_at IS NULL` verwenden. Automatisches `updated_at` auf Geschäftsobjekten wird in 024/Serviceebene konkretisiert.
- `app_metadata.key` hat einen eindeutigen Index; Seed legt das öffentliche App-Label idempotent an.
- `drizzle/meta/_journal.json`, `drizzle/meta/0000_snapshot.json` und die zugehörige SQL-Datei **gemeinsam** committen. Erster Baseline-Snapshot wurde durch Drizzle Kit auf einem isolierten GitHub-Runner erzeugt und dem Schema gegenübergestellt. `drizzle-kit generate` für künftige migrationsbasierte Erweiterungen und `drizzle-kit check` zum Konsistenzcheck in nachfolgenden Aufgaben.
- **Rollback:** Bei Fehlern vor einem Produktiv-Deploy eine **frische, isolierte Testdatenbank** bereitstellen und Migrationen erneut testen. Produktionsdaten nicht durch `DROP`, Auto-Rollback oder ungetestete Down-Migrationen gefährden; echtes Backup-/Restore-Gate ist 034.

## Risiken

Es gibt noch keine Betreiberfreigabe zum Deploy einer BlueDotAtlas-Datenbank auf dem gemeinsamen VPS. Das M01-Budget plant maximal 512 MiB RAM für einen möglichen isolierten DB-Dienst; reale Ressourcenkontrolle, Volume-/Backup-Verzeichnis, Credentials und HTTPS-Zugriff folgen gesondert in 028–030/034. Kein Redis erforderlich.


## Nächste Datenmodelle

Roadmap 024 ergänzt die acht fachlichen Tabellen sowie einen zweiten Migrationsstand, Projektstatus-Übergänge und isolierte Integrationsprüfungen. Siehe [Datenmodell 024](data-model.md). Keine Änderungen an Live-Datenbanken.
