# ADR-003 – PostgreSQL-basierte Jobqueue mit Lease-Fencing

**Status:** Accepted – ausdrückliche Betreiberabnahme von PR #192 einschließlich ADR-003 am 19.11.2026 (UTC), DEC-039  
**Datum:** 2026-11-19 (UTC)  
**Roadmap / Issue:** [027 / GitHub-Issue #44](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/44)  
**Betreiberentscheidung:** Ausdrückliches „Ok“ auf die konkrete Frage nach Freigabe von [PR #192](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/192) **einschließlich ADR-003**. Entscheidung **DEC-039**; DEC-033 war nur die vorangehende Modularchitekturfreigabe.  
**Belege:** [Entwicklungs-/Betriebsanleitung 027](../../development/worker-queue.md), [Architektur M02](../overview.md), [Definition of Done](../../project/working-agreement.md).

## Kontext

BlueDotAtlas ist ein einzelner, redaktionell kontrollierter Video-Workflow auf einem bereits anderweitig belasteten VPS. Das vorhandene Drizzle-/PostgreSQL-16-Modell kennt `render_jobs`, aber noch keine sichere exklusive Reservierung und kein verlässliches Recovery nach Worker-Absturz. Next.js darf Render-/Medienaufgaben nicht inline im HTTP-Request ausführen. Der Ressourcenplan (DEC-028/033) bewahrt bestehende Dienste, begrenzt Worker-RAM vorerst auf höchstens 1024 MiB und erlaubt **keine** neue Redis-Instanz ohne überzeugenden Bedarf.

## Vorgeschlagene Entscheidung

- **PostgreSQL statt Redis/BullMQ** für den V0.1-Start. Kurze Transaktion `SELECT ... FOR UPDATE OF r SKIP LOCKED` reserviert höchstens einen fälligen Job und ändert `queued → running`. Lange synthetische Arbeit geschieht **außerhalb** der Transaktion im eigenen Node.js/TypeScript-Prozess.
- **Lease-Fencing:** Eine neue zufällige UUID in `lease_token` identifiziert **jede einzelne Reservierung**. Jede Heartbeat-/Finish-/Fail-Aktualisierung verlangt gleichzeitig `status='running'`, **passenden Token** und **unabgelaufene Lease**. Bei abgelaufener Lease ist kein verspäteter `succeeded`-Commit mehr möglich. Neuer Claim erhält einen neuen Token; ein alter Prozess kann ihn nicht überstimmen.
- **Schema-Inkrement:** Drizzle-Migration `0003` ergänzt `lease_token`, `heartbeat_at` und `available_at` (sowie Queue-Index und Lease-Constraint). Die bestehenden Status/Attempt-/MaxAttempt-Felder und `lease_expires_at` bleiben unverändert. Bereits existierende Daten werden nicht gelöscht; es gibt **keinen** Reset und keinen produktiven Migrationslauf in 027.
- **Zustandsautomat:** Nur fällige Jobs mit `attempt < max_attempts` werden reserviert; jede Reservierung erhöht `attempt` atomar. Fehler/abgelaufene Leases setzen `running → failed`; verzögerte begrenzte Wiederholung setzt `failed → queued`. Erreichen des Limits bleibt `failed`. Cancel setzt `queued|running|failed → cancelled` sofort, löscht den Lease-Token und unterbindet spätes Erfolgs- oder Fehlschreiben. Kein Statusübergang publiziert ein Video.
- **Synthetischer Nachweis:** In 027 führt der separate Worker ausschließlich die feste Testoperation `synthetic_027` mit begrenzter Dauer und deterministischen Testfehlern aus; **nur** bei `BDA_DB_TEST=1`, `BDA_WORKER_SYNTHETIC_TEST=1` und einer lokalen `/bda_test`-Datenbank. Die gewöhnliche Produktionsausführung ohne diesen Testschalter wird bewusst verweigert: echtes Render-/Provider-Backend ist **noch nicht implementiert**. Es gibt keinen API-Weg für unkontrollierte Shellbefehle oder frei übergebene Render-Manifeste.
- **Retry-/Timeout-Grenzen:** Nur ein Job pro Worker gleichzeitig; kurzer fest konfigurierter Poll-Intervall, begrenzte Anzahl Retries und exponentieller, gedeckelter Backoff. Crash-Recovery wird in `failed` gefasst und geht erst später nach `queued` zurück. Bei Prozess-SIGTERM beendet sich der synthetische Executor kooperativ und markiert den reservierten Job fehlgeschlagen oder lässt den Lease ablaufen.
- **Kontrollierter späterer Ausbau:** M02-029/030 prüft TLS/Proxy, Secretmanagement, Worker-RAM/CPU-/Prozesslimits, eigene Datenbankrollen, Lifecycle/Shutdown und Backup; M03+ integriert erst nach gesonderten Prüfungen Remotion/FFmpeg, Manifestvalidierung, Nutzungsrechte und Assetprüfung.

## Alternativen

| Variante | Bewertung |
| --- | --- |
| Redis/BullMQ | Sehr gute Queue-Ökologie, aber zusätzlicher Dienst und Speicherbedarf auf gemeinsamem VPS; zum jetzigen Einzelworker-Test nicht nötig |
| In-Memory-Array oder alleinige Cronjobs | Jobzustände/Crash-Recovery verschwinden bei Restart oder konkurrieren bei zwei Prozessen; nicht tragfähig |
| Dauerhafte DB-Locks während der Jobarbeit | Verbraucht Verbindung und blockiert lange Transaktionen; Lease mit Fencing ist sicherer |
| Nur `lease_expires_at` ohne tokenbasierte Ownership | Alter Worker könnte nach Übernahme durch anderen Job dennoch schreiben; **nicht** akzeptiert |

## Konsequenzen und Risiken

Vorteile: Keine neue externe Infrastruktur oder Providerkosten; einheitliche dauerhafte Zustände; Tests für Crash, Retry und zwei konkurrierende Worker. Risiken: DB-Polling/Row-Lock-Last, häufige Heartbeats, Wiederholungen nach Crash und idempotente Aufgabenausführung. Der vorläufige synthetische Executor erzeugt **keine Renderdatei** und darf **keinen Produktionsfilm als abgeschlossen** markieren. Für spätere reale Nebenwirkungen (Dateierzeugung, Provideraufrufe) sind idempotente Artefakte/Manifest-IDs und eine gesonderte Ergebnisvalidierung zwingend.

## Nachweise

[Roadmap 027 / Issue #44](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/44), isolierte PostgreSQL-16-CI-Integration mit frischer/wiederholter Migration `0003`, zwei separaten Worker-Prozessen/Claims, HTTP-Liveness unter aktivem Job, Heartbeat, Retry, Cancellation und Lease-Fencing. [Worker-/Queue-Integration PASS](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44475174038), [PostgreSQL-Migrationsregression PASS](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44475174037), [Admin-Auth-/Chrome-Regression PASS](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44475174050). Insgesamt **8/8 passende GitHub-Actions-Prüfungen auf dem abgenommenen Implementierungs-HEAD `6208299e656d2f46976571cbdd71f30f9148546f` PASS**; nach Dokumentation der Abnahme werden die dann neu gestarteten Checks vor Merge erneut geprüft.

## Änderungshistorie

- 2026-11-19: Proposed – Entwurf mit getrenntem synthetischem Worker und PostgreSQL-Fencing.
- 2026-11-19: **Accepted** – ausdrückliche Betreiberfreigabe zu genau PR #192 **einschließlich ADR-003** (DEC-039). **Keine** Live-DB-, VPS-, realen Video-Render- oder Veröffentlichungsfreigabe.
