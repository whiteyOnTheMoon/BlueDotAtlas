# Roadmap 031 – Admin-Projektverwaltung (M02)

**Status:** Technische Vorlage für [Issue #48](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/48), ohne Betreiberabnahme und ohne Live-VPS-Deployment.

## Umfang

Das abgenommene PRD 010 sieht eine Projektverwaltung vor dem durchgehenden siebenstufigen Produktions-Wizard vor. Roadmap 024 liefert die Datenbankmodelle und Audit, 025 die geschützte Einzeladmin-Session, 026 die serverseitige Projekt-API und 030 die Secretgrenzen (DEC-044).

- `/admin`: Der vorhandene Studio-Einstieg verlinkt **Create New Video** auf die Projektverwaltung. Die reine Entwickler-Preview `/preview/admin` bleibt deaktiviert/nicht datenführend.
- `/admin/projects`: Titel eingeben und **genau ein** Projekt anlegen; alle Projekte nach Status filtern und in Seiten von maximal 20 Einträgen anzeigen.
- `/admin/projects/:id`: Titel, aktuellen Status, Revision, Erstellung und letztes Update ansehen; ein Projekt umbenennen oder nach ausdrücklicher Bestätigung **archivieren**.
- Der Browser spricht ausschließlich über die bestehende Admin-API. Die serverseitige DB-Sessionsperre liegt vor den Seiten und allen API-Routen; es gibt keine öffentlich sichtbaren Projekte oder zusätzliche Anmeldemöglichkeit.

## Daten- und Statusregeln

Ein einzelner erfolgreicher `POST /api/v1/projects` erstellt atomar einen Projektdatensatz im Status `draft`, genau **eine** `project_versions`-Revision (Nr. 1), **sieben** `step_progress`-Zeilen sowie einen Audit-Eintrag. Er startet **null** Renderjobs und hat keinen Provider-, TTS-, Lizenz-, Upload- oder Publish-Effekt.

Der zusätzliche streng validierte `PATCH /api/v1/projects/:id` unterstützt nur genau **einen** von zwei Befehlen: `{"title":"Neuer Titel"}` oder `{"action":"archive"}`. Rename und Archivieren laufen unter `FOR UPDATE`-Sperre und erzeugen die passende Audit-Änderung in derselben Transaktion. Ein unveränderter Titel erzeugt keinen redundanten Audit. Archivieren setzt terminal `archived`, löscht nichts und startet/cancelt keine Jobs; ein Projekt mit wartendem oder laufendem Renderjob wird mit HTTP `409 project_conflict` abgewiesen. Archivierte Projekte sind nur lesbar. Keine neue Migration und keine Änderung an den Status-Enums aus 024.

Alle Schreibzugriffe erfordern die gültige Einzeladmin-Datenbanksession und denselben Browser-Origin wie den Host. Die API validiert UUIDs, Queryparameter, Bodylimit (8192 Rohbytes), JSON-Felder und Content-Type vor jedem DB-Schreiben. Fehlermeldungen enthalten keine SQL-Stacks, DB-Credentials, Storagekeys oder Provider-Secrets. Keine direkte `DELETE`- oder beliebige Status-Schreibroute.

## Technische Abnahme / Reproduktion

- `pnpm test`: strikte PATCH-Formen und Negativtests plus alte Core-Regressionschecks.
- `pnpm --filter @bluedotatlas/db test:integration`: bestehende und neue Domänen-Tests mit `BDA_DB_TEST=1` ausschließlich für `localhost/bda_test` (frische bzw. wiederholte PostgreSQL-16-Migration, genau 1 Projekt + 1 Revision + 7 Schritte + 0 Jobs, Audit, Rename/Archive und laufender Job blockiert Archive).
- `node scripts/check-projects-031.mjs`: nur mit synthetischem CI-Admin und derselben Testdatenbank; echter lokaler Next.js-Produktionsmodus auf `127.0.0.1:3131`, anonyme Seiten/API 401 bzw. Redirect, falscher Origin 403, ungültiges JSON/Schema/UUID 400, nicht vorhandene 404, unerlaubte Methode 405, Terminalzustand 409. Persistenz und Löschungslosigkeit aus echter DB geprüft. Danach Chrome-Login, Ein-Klick-Anlage mit exakter DB-Zählung, Umbenennen und Archivieren, Statusfilter und Layoutprüfung auf Desktop/Mobil.
- `.github/workflows/projects-031-check.yml` führt die Tests im wegwerfbaren GitHub-Runner aus und speichert **tatsächliche Screenshots** als `bda-031-project-dashboard-qa` mit 14 Tagen Aufbewahrung. Vor Freigabe müssen CI der neuen und anwendbarer älterer Workflows, Screenshots, Datenbank-/Rechte-/Security-/Budget-Gates tatsächlich grün sein. **CI-Resultate nicht im Voraus behaupten.**

**Betriebseinschränkung:** Die echte öffentliche BlueDotAtlas-Webvorschau unter `studio.ap-pixels.com` wurde für 029 nur **ohne Admin-Credentials** genehmigt (DEC-042/043). Auch nach Merge dieses PRs bleibt die Admin-Anmeldung auf dem VPS **fail-closed**. Weder Projekt-CRUD in Produktion noch ein reales Render-/Datenbank-Migrations-/Backup-Gate werden freigegeben. Die separate Admin-Edge-Sicherheit, Secretrotation und Restore 034 bleiben offen. Der einzige VPS-Checkout ist `/home/ap/www/blueDotAtlas`, Compose-Projekt `bluedotatlas`; keine zusätzlichen Klone, keine Eingriffe in Fremddienste, keine Bezahlprovider.

**Workflow:** Issue #48 → isolierter Feature-Branch → CI-/Screen-Review → ausdrückliche Betreiberabnahme → erst danach Squash-Merge und Issue-Abschluss.
