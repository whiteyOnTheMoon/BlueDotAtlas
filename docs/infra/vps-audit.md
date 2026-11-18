# BlueDotAtlas — VPS-Inventur und Ressourcenbudget (Roadmap 012)

**Status: Abgenommen am 19.11.2026 durch ausdrücklichen Betreiberwunsch, Issue #27 abzuschließen.**
Quelle: Betreiber-Terminalmessungen vom 17.–18.11.2026. Keine SSH-Verbindung über GitHub, kein Benchmark auf GitHub-CI. Diese Aufnahme ist eine **Kapazitätsplanung**, keine Freigabe für einen produktiven 1080p-Renderjob.

## Ist-Zustand nach Bereinigung

| Merkmal | Tatsächlicher VPS-Nachweis |
| --- | --- |
| Messung | 18.11.2026, 23:02–23:26 UTC, gemeldet vom Betreiber |
| OS / Kernel / Architektur | Ubuntu 24.04.4 LTS; Linux 6.8.0-137-generic; x86_64 (Erstaudit) |
| CPU | 4 logische CPUs für Prozesse verfügbar (`nproc`); keine zusätzliche Host-/Provider-CPU-Garantie |
| RAM | 7,8 GiB gesamt, zuletzt ca. 3,9 GiB `MemAvailable`; Momentaufnahme, keine garantierte Zuteilung |
| Swap | 2,0 GiB, nahezu vollständig belegt; `vmstat 1 6` zeigte zuletzt kaum Swap-In und **keinen Swap-Out** im 5-Sekunden-Fenster |
| Root-Dateisystem | ext4 auf `/dev/vda1`; `df -h /`: **116G gesamt / 27G benutzt / 89G verfügbar / 24 % belegt** |
| Inodes | 21 % verwendet im jüngsten Gesamtaudit |
| Docker | Engine 29.1.3 (Erstaudit); **43 laufende / 49 gesamte Container**, 28 Images, 7 lokale Volumes, **Build-Cache 0B** nach Bereinigung |
| Dienste | AP Pixels PROD + DEV WordPress/MariaDB running; fünf PostgreSQL-Instanzen `pg_isready` OK; sechs Cloudflare-Container running; weitere Kurvenfunk-/FootballStudio-Dienste vorhanden |
| I/O | `/proc/pressure/io` zuletzt `some avg10=0.00 avg60=0.04 avg300=2.98`, `full avg10=0.00 avg60=0.03 avg300=2.60`; **kein Durchsatz-/IOPS-Benchmark** |
| Memory Pressure | `some avg10=0.00 avg60=0.00 avg300=0.03`; `full avg10=0.00 avg60=0.00 avg300=0.01` |
| Netzwerk | Cloudflare-Tunnel-Container vorhanden; realer Linkdurchsatz, SSD-Medium und Provider-Trafficlimit **nicht verifiziert** |
| Containergrenzen | Bei sechs überprüften Beispielcontainern `HostConfig.Memory=0`, `MemorySwap=0`, `NanoCpus=0`; kein explizites Docker-Limit dort, übergeordnete Providergrenzen unbekannt |

**Verlauf:** Erstmessung 17.11., 18:40 UTC: **7,02 GiB frei / 94 % belegt**, 4 CPUs, 7964 MiB RAM, 2409 MiB verfügbar, 51 aktive Container. Nach gezielter VNS-/GoldenOracle-Löschung und späterem Entfernen ungenutzter Docker-Images/Build-Caches: **89G frei / 24 % belegt**; 43 Container aktiv. Der Gewinn ist aus gerundeten Messwerten abgeleitet. Andere Datenbanken/Volumes wurden nicht pauschal gelöscht.

## Vorsichtiges Betriebsbudget für BlueDotAtlas V0.1

**Die folgenden Werte sind festgelegte Planungsobergrenzen, keine gemessenen Leistungsanforderungen und keine Behauptung, dass ein 1080p-Render damit bereits erfolgreich wäre.** Die vorhandenen 43 Container laufen weiter; ihnen ist Vorrang einzuräumen. Die geplanten BlueDotAtlas-Container laufen noch nicht.

| Ressourcenart | Bestand / OS | BlueDotAtlas Web/API | PostgreSQL/DB | Render-Worker | Weitere Reserve / Regel |
| --- | --- | --- | --- | --- | --- |
| CPU, 4 logische CPUs | Betrieb bestehender Dienste hat Priorität; planerisch mindestens 3 CPU-Äquivalente freihalten | max. **0,25 CPU** | max. **0,25 CPU** | max. **0,5 CPU** nur isolierter Task-013-Test | **Max. 1 CPU** für BlueDotAtlas gleichzeitig; CPU-Vorgaben vor Deploy nachmessen/anpassen |
| RAM, 7,8 GiB gesamt / ca. 3,9 GiB zuletzt verfügbar | Bestehende Container/OS unangetastet; **mindestens 2 GiB MemAvailable** als Betriebsziel | max. **384 MiB** | max. **512 MiB** | max. **1024 MiB**, zunächst **ausgeschaltet** | Summe der neuen Obergrenzen **1920 MiB**; bei < 2 GiB verfügbar keine Renderjobs |
| Datenträger, 89G frei (`df -h` gerundet) | **40G** für bestehende Dienste/OS/Wachstum unangetastet | **1G** Web/API | **4G** DB einschl. WAL/Backups | **20G** Medien + **12G** temp/Scratch als Anfangslimit | **12G** ungeplant als Sicherheitsreserve; Summe 89G |
| I/O / Netz | Betriebspriorität für bestehende Datenbanken und Tunnel | Kleinlast | Kleinlast | Keine konkurrierenden Renderjobs vor Task 013 | Keine zugesicherte Bandbreite/IOPS; bei Lastproblemen pausieren |
| Parallelität | Bestehende Services haben Vorrang | 1 Instanz | 1 Instanz | **0 produktive Jobs** bis Task 013 | Render-Test später seriell, keine gleichzeitigen Renderjobs zugesagt |

**Pragmatische Übergabe:** 012 stellt Inventur und einen bewusst konservativen Start-Rahmen bereit. Web und DB dürfen später innerhalb dieser Limits geplant werden; **Renderleistung, I/O unter Last, konkrete FFmpeg-Scratch-Spitze und Go/No-Go werden in Aufgabe 013** mit einem begrenzten Test entschieden. Fehlende Provider-/SSD-/Trafficdaten bleiben als Betriebsrisiko dokumentiert und sind kein künstliches Hindernis für den Abschluss der Inventur. Diese Obergrenzen sind bei einer tatsächlichen Bereitstellung zu überprüfen und ggf. anzupassen.

## Prüfung und Abnahme

- [x] Echtes OS-/CPU-/RAM-/Swap-/Dateisystem-/Docker-/I/O-Baseline-Snapshot vom Betreiber vorgelegt.
- [x] Laufende Dienste und Datenbankverfügbarkeit nach Docker-Bereinigung kontrolliert (PostgreSQL: 5/5 `pg_isready` OK; AP Pixels PROD/DEV: running).
- [x] Massiven Speicherengpass beseitigt; 89G verfügbar und 24 % Datenträgerauslastung gemeldet.
- [x] Nachvollziehbare Planungsobergrenzen und Betriebsreserve für OS, Web, DB, Renderer sowie Medien/Scratch dokumentiert.
- [x] Betreiber hat am 19.11.2026 den pragmatischen Abschluss von **Issue #27** ausdrücklich verlangt.
- [ ] **Nicht Bestandteil von 012:** reale 1080p-Render-Abnahme, garantierte IOPS/Providerbandbreite und End-to-End-Websiteprüfung; diese Fragen werden bei Bedarf in den jeweiligen Betriebs-/Renderaufgaben bearbeitet.

**Grenze der Aussage:** Dies ist keine Messung der Leistungsfähigkeit des Renderers und keine Freigabe für Produktionsparallelität. [Read-only-VPS-Audit-Skript](../../scripts/audit-vps.sh); [Issue #27](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/27); [PR #28](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/28).
