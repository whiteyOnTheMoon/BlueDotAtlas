# 046 – VPS-Render-Freigabeprüfung (Entwurf, keine Ausführungsfreigabe)

**Zuordnung:** M03 / 046 · [Issue #70](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/70) · [Draft-PR #216](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/216) · 20.11.2026. **Status: NO-GO für produktive Jobs und den echten 60s-Film.** Diese Prüfliste ist ein Vorschlag; keine Betreiberentscheidung ist damit erteilt.

## Tatsächlich belegt

- 013: Am 18.11.2026 auf dem VPS **einmal 8s** originalsynthetisches 1080p/H.264/AAC mit FFmpeg kodiert. 6,30s Laufzeit, rund 224 MiB Peak-Prozess-RSS – kein Remotion-/60s-/Docker-Worker-Benchmark. [013-Messbericht](render-proof-013.md).
- 012/029: konservatives Planungsbudget, aber kein aktueller Lastmesswert: 4 logische CPUs, 7,8 GiB RAM; zuletzt am 19.11.2026 etwa **3,0 GiB MemAvailable**, 88G frei und 43 laufende Container im Betreiber-Snapshot. Fremdservices haben Vorrang. [VPS-Inventur](vps-audit.md) · [Deployment](deployment.md).
- 045/046: Der 8s-Encoder, PostgreSQL-Queue, privater SHA-256-Artefaktbezug und geschützter Admin-HTTP-/Chromium-Test **nur auf dem wegwerfbaren GitHub-Runner** bestanden; auf PR-Head `a27f3f7` zuletzt 21/21 CI-Checks erfolgreich. Der 046-Worker verlangt `CI=true`, exakte lokale `bda_test` und weitere Testflags; er ist **kein** deployfähiger Produktiv-Executor. Keine echten Filme auf dem VPS gerendert.
- 034: Ein DB-Dump und Restore sind **nur** in disposable PostgreSQL-16-CI geprüft. Das `restore-test`-Unterkommando des bestehenden `scripts/ops-034.sh` verweigert den VPS absichtlich. Produktive Medien- und DB-Backups, Offsite-Kopie und Wiederherstellung auf einer vom bestehenden Projekt getrennten Testumgebung **nicht** nachgewiesen.

## Go/No-Go vor einem *separat* genehmigten VPS-Test

| Gate | Prüfkriterium | Status |
| --- | --- | --- |
| Hostressourcen | Neues **read-only** Host-Snapshot kurz vor dem Test; mindestens 2 GiB `MemAvailable`, mindestens 12 GiB freie Reserve **nach** eingeplantem Render-/Backup-/Scratch-Verbrauch; keine hohe Swap-/I/O-/CPU-Last bei Fremdservices. 20 GiB Medien, 12 GiB Scratch, 4 GiB DB/Backup sind **Budgets, keine erzwungenen Quoten**. | **OFFEN – aktuelle Werte fehlen** |
| Render-Container | Nur das bestehende einzelne Compose-Projekt `bluedotatlas` in `/home/ap/www/blueDotAtlas`; genau ein Worker, `cpus: 0.5`, `mem_limit: 1024m`, keine externen DB-/Web-Ports, keine neuen Tunnel. `future-renderer` bleibt bis Freigabe aus. | **OFFEN – kein produktiver 046-Worker** |
| Scratch/Storage | Momentan hat der Worker nur `/tmp` als **64-MiB-tmpfs** und **keinen freigegebenen produktiven Medien-Mount**; 028-Storage ist nur für private isolierte Testroots. Vor einem 60s-Export: echte, dedizierte, nicht öffentliche Mounts, Besitzer-/Symlink-Gates, Quota und Cleanup nachprüfen; nichts aus `/tmp` als persistierendes Artefakt deklarieren. | **BLOCKIERT** |
| Wiederherstellung | Operatorseitig separater, privater DB- und Medienbackup-Nachweis mit SHA, lesbarem Restore-Protokoll in **einer neuen isolierten** DB/Volume; niemals bestehendes `bda_pgdata` überschreiben. Migrations-/Rollbackplan, keine Host-/Fremd-DB-Resets, keine automatische Löschung. | **OFFEN** |
| Rechte / Film | Für NASA-/NOAA-Clips bisher nur `PRIVATE_INTERNAL_TEST_ONLY`, `approved_for_timeline=false`; originale Brand-MP4s, echte Musik, finale Credits und volle 60s-Fassung nicht für Produktion abgenommen. Rechte pro Datei/SHA und geplante Nutzung prüfen, vor allem echte Musiklizenz; `render_authorized=false`, `publish_authorized=false` bleiben bestehen. | **BLOCKIERT** |
| Betreiber | Erst einen **begrenzten synthetischen VPS-Testrun** gesondert genehmigen, danach Laufzeit/RSS/Storage/Recovery belegen; **separate zweite Entscheidung** zum echten 60s-Originalmedien-Render. Auch nach Erfolg keine Veröffentlichung ohne 047/048-Abnahme. | **NICHT FREIGEGEBEN** |

### Read-only Erhebung (nur wenn der Betreiber sie auf seinem VPS selbst ausführen möchte)

Die vorhandenen, bereits dokumentierten Skripte genügen: `scripts/audit-vps.sh` inventarisiert Host/CPU/RAM/Disk/Docker ohne Veränderungen. `scripts/ops-034.sh health` liest den eigenen Projekt- und Dateisystemzustand; es ist **kein** Backup-/Restore-Befehl. Beide sind im Repository zunächst zu prüfen; die Ergebnisse dürfen weder Secrets noch Pfade, Tokens oder fremde Containerdetails in Git/Chat offenlegen.

Ein erneuter 013-Test wird **nicht** ohne neuen Bedarf ausgeführt. Kein SSH-Zugriff aus GitHub, kein stillschweigendes `docker compose up`, kein weiteres Git-Checkout, keine produktiven Migrationen, keine Providerabos.

## Freigabereihenfolge und Abbruch

1. **A – Read-only Hostbefund:** Betreiber liefert ein frisches, redigiertes CPU-/RAM-/Disk-/Service-Snapshot; schriftlich dokumentierter Ressourcen- und Volume-/Backupplan. **Bis dahin NO-GO.**
2. **B – Neues, begrenztes Synthetic-only-VPS-Gate:** Erst nach gesonderter Betreiberfreigabe technischen echten Worker/Storage im bestehenden Projekt implementieren und prüfen; 1 Job, 0,5 CPU / 1024 MiB RAM als Ausgangsobergrenzen, Timeout, Log-Redaction, kein Publizieren, kein Drittmaterial. Ausfälle/Memory-/Disk-Pressure bedeuten Job stoppen, Debugbelege sichern; keine automatischen fremden Docker-Neustarts oder pauschalen Prune-Aktionen. Geänderte Limits nur nach eigener Abnahme.
3. **C – Echter 60s-Film:** Erst nach vollständig belegten Datei-/Marken-/Musik-/Sprecherrechten, Asset-Staging, dem dedizierten Render- und Rollback-Nachweis und einer **neuen ausdrücklichen** Betreiberfreigabe. Fertiges MP4 bleibt privat, bis 047/048 separat geprüft sind.

**Freigabetext, später ausdrücklich vom Betreiber zu bestätigen:** „Freigabe nur für einen einmaligen, kontrollierten originalsynthetischen VPS-Render-046-Test im bestehenden BlueDotAtlas-Projekt mit dokumentierten Ressourcen-, Mount- und Backupgrenzen; keine echten Originalmedien und keine Veröffentlichung.“ **Dieser Text ist eine Vorlage und aktuell ausdrücklich NICHT bestätigt.**

**Kein abgeschlossenes 046-DoD:** Der originale Roadmap-M03-Gesamtnachweis verlangt ein echtes 60s/1080p-Video auf dem VPS, im Admin zugänglich und mit filmischer Prüfung; die Erfüllung der synthetischen Technik-Teilgates ersetzt ihn nicht.
