# ADR-001 – Modularer Monolith mit separatem Job- und Renderworker

**Status:** Accepted – **nur Architekturentscheidung**, keine geprüfte Produktionspipeline  
**Datum:** 2026-11-19 (UTC)  
**Roadmap / Issue:** [017 / Issue #34](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/34)  
**Betreiberentscheidung:** [DEC-033](../../project/decision-log.md) – Zustimmung zum Ziel, mit BlueDotAtlas Videos und Animationen produzieren zu können  
**Belege:** [Kernarchitektur V0.1](../overview.md), [PR #57](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/57), [VPS-Inventur 012](../../infra/vps-audit.md), [Render-Proof 013](../../infra/render-proof-013.md)

## Kontext / Problem

Auf dem **bestehenden VPS** laufen bereits andere produktive Container und Datenbanken. BlueDotAtlas soll eine öffentliche Videothek und einen geschützten Admin-Wizard anbieten, aus geprüften Quellen, lizenziertem Medienmaterial, Narration und Animationen Dokumentarvideos erzeugen und keine vorhandenen Dienste beeinträchtigen.

Die Roadmap definiert Next.js/React, serverseitige Node.js-/TypeScript-Logik, PostgreSQL, getrennte Jobs und Remotion/FFmpeg als Zielbild. Der vorliegende Rendernachweis 013 umfasst **nur einen synthetischen 8-Sekunden-H.264/AAC-Encode**, keinen echten lizenzierten Film mit Remotion.

## Entscheidung

Wir planen einen **modularen Monolithen** mit separatem Web/API-Prozess und Job-/Renderworker:

- `apps/web`: Next.js/React, öffentliche Route und geschützter Admin, serverseitige Validierung/Berechtigung.
- `apps/worker`: asynchrone Medien-, Voice- und Renderjobs; kein lange laufender Render im HTTP-Request.
- PostgreSQL als verbindlicher Speicher für Status, Versionsstände, Lizenzen, Claims, Jobs und Freigaben.
- Separater persistenter lokaler Medienspeicher; Provider-/TTS-/LLM-Adapter austauschbar und nur serverseitig.
- `packages/core`, `packages/db`, `packages/video`, `packages/providers` sowie das vorhandene `packages/ui` als Zielmodule.
- **Leichtgewichtige PostgreSQL-basierte Queue als Planungsansatz**; Redis/BullMQ **optional**, falls später gemessene Anforderungen dies rechtfertigen.
- Scene Director/Remotion + FFmpeg/ffprobe als geplante Videopipeline, mit manueller Rechts-/Qualitäts-/Publikationsfreigabe.

Die Entscheidung ist **als Architektur für den künftigen Aufbau** angenommen (DEC-033), nicht als Freigabe, neue Infrastruktur einzurichten oder eine Renderleistung zu behaupten.

## Erwogene Alternativen

| Alternative | Abwägung |
| --- | --- |
| Mehrere Microservices plus separate Queues/Cloudkomponenten | Zusätzliche Betriebslast, Netz-/Secrets- und VPS-Ressourcenbedarf ohne zunächst belegten Nutzen |
| Rendering direkt im Next.js-Prozess | Würde lange HTTP-Requests blockieren und den bestehenden VPS-Betrieb schlechter isolieren |
| Redis/BullMQ sofort als Pflichtdienst | Weiterer RAM-/Docker-Aufwand; **erst nach dem Job-/Render-Benchmark** bei Bedarf begründen |
| Externer Cloud-Renderer | Kostet potenziell extra und wäre mit dem [Budget 016](../../operations/budget-policy.md) nicht automatisch gedeckt |

## Folgen und Risiken

**Positiv:** Geteilte Typen/Statusverträge, schlankes Deployment, trennbare Workerlast, klare Lizenz-/Kosten-/Publish-Gates.  
**Risiken:** PostgreSQL-Jobreservierung benötigt saubere Leases/Retry-/Recovery-Tests; CPU/RAM/IO des Renderers müssen an echtem Film/Remotion gemessen werden; Media-/DB-Backup und Restore müssen zusammenpassen. Keine Produktivparallelität bestätigt.  
**Grenzen:** KI + TTS maximal **25 €/Monat zusammen**, externe zusätzliche APIs/RSS **0 €**, bestehende VPS-Dienste bleiben unberührt, keine Autoveröffentlichung.

## Nachweise / Verifikation

- **Akzeptiert:** Betreiber stimmte in Roadmap 017 zu: „Wenn ich damit meine Videos und Animationen usw machen kann bin ich einverstanden“ (DEC-033), [PR #57](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/57) gemergt.
- **Verifiziert:** ausschließlich synthetischer [FFmpeg-Test 013](../../infra/render-proof-013.md) – 8 Sekunden, 1080p, kein vollständiger Film.
- **Offen:** echte M02-Implementierung/Jobqueue (021–034) und lizenzgeprüfter vollständiger 60-Sekunden-Pilot/Remotion-Proof in M03 (035–048).

## Änderungshistorie
- 2026-11-19: ADR wurde **aus der bereits freigegebenen Architektur 017 (DEC-033)** abgeleitet; keine neue technische Kosten-/Deployment-/Renderfreigabe durch diesen Eintrag.
